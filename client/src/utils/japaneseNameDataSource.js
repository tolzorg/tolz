// Japanese Name Generator — lazy data source for the bulk,
// JMnedict/ENAMDICT-derived dataset (see public/data/japanese-names/
// and scripts/build-japanese-names-dataset.mjs). ~320k records total
// across girl/boy/unisex/given-other/surname categories, sharded by
// romaji-initial letter so nothing close to the full set is ever
// fetched or held in memory at once.
//
// Source: JMnedict/ENAMDICT, Electronic Dictionary Research and
// Development Group, licensed CC BY-SA 4.0. See
// JapaneseNameAttribution.jsx for the required on-screen credit.
//
// SEARCH SCOPE NOTE: bulk-dataset search resolves candidate shards by
// the QUERY's own computed romaji-initial (for Hiragana/Katakana/Romaji
// queries) or via a precomputed Kanji reverse index (for Kanji
// queries) — this is effectively prefix-oriented at the shard-routing
// level, unlike the small curated dataset's full substring search.
// Once a shard is fetched, matching within it is still real substring
// matching. This is a genuine, documented scope tradeoff of not
// shipping the whole dataset to the browser — never silently claimed
// to be exhaustive.

import { romajiFromReading } from "./japaneseNameRomaji.js";
import { toHiragana, toHalfWidth, fuzzyIncludes } from "./japaneseNameSearch.js";

const DATA_BASE = "/data/japanese-names";
const CATEGORY_DIR = { girl: "girl", boy: "boy", unisex: "unisex", givenOther: "given-other", surname: "surname" };
const CATEGORY_CODE = { girl: "g", boy: "b", unisex: "u", givenOther: "o", surname: "s" };
const CODE_TO_CATEGORY = { g: "girl", b: "boy", u: "unisex", o: "givenOther", s: "surname" };
export const BULK_CATEGORIES = Object.keys(CATEGORY_DIR);

const shardCache = new Map(); // "category:letter" -> Promise<record[]>
const manifestCache = new Map(); // category -> Promise<manifest>
let kanjiIndexPromise = null;
let totalsPromise = null;

async function fetchJson(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}

/** Fetch (and cache) one shard: all records of `category` whose romaji initial is `letter` ("A"-"Z", or "0" for anything else). */
export function fetchShard(category, letter) {
  const key = `${category}:${letter}`;
  if (!shardCache.has(key)) {
    shardCache.set(key, fetchJson(`${DATA_BASE}/${CATEGORY_DIR[category]}/${letter}.json`, []));
  }
  return shardCache.get(key);
}

/** Fetch (and cache) a category's manifest — total count + per-letter shard sizes, without loading any record data. */
export function fetchManifest(category) {
  if (!manifestCache.has(category)) {
    manifestCache.set(category, fetchJson(`${DATA_BASE}/${CATEGORY_DIR[category]}/manifest.json`, { total: 0, shardSizes: {} }));
  }
  return manifestCache.get(category);
}

/** Fetch (and cache) the Kanji -> shard-locator reverse index, used only for Kanji search queries. */
export function fetchKanjiIndex() {
  if (!kanjiIndexPromise) kanjiIndexPromise = fetchJson(`${DATA_BASE}/kanji-index.json`, {});
  return kanjiIndexPromise;
}

/** Measured per-category totals, for honest "X names" display copy. */
export function fetchTotals() {
  if (!totalsPromise) totalsPromise = fetchJson(`${DATA_BASE}/totals.json`, null);
  return totalsPromise;
}

/**
 * Pick a shard letter for `category` weighted by actual shard size, so
 * repeated calls approximate a true-uniform random draw across the
 * whole category population rather than always favoring one shard.
 */
export async function pickWeightedRandomLetter(category) {
  const manifest = await fetchManifest(category);
  const entries = Object.entries(manifest.shardSizes || {});
  if (entries.length === 0) return null;
  const total = entries.reduce((s, [, n]) => s + n, 0);
  let r = Math.random() * total;
  for (const [letter, n] of entries) {
    r -= n;
    if (r <= 0) return letter;
  }
  return entries[entries.length - 1][0];
}

const KANJI_RE = /[㐀-鿿々〆〤]/;

/** The romaji-initial a query's own reading would fall under, for shard routing (Hiragana/Katakana/Romaji queries only). */
function queryInitialLetter(query) {
  const normalized = toHiragana(toHalfWidth(query.normalize("NFKC")));
  if (/^[a-zA-Z]/.test(normalized)) return normalized[0].toUpperCase();
  const romaji = romajiFromReading(normalized);
  return romaji ? romaji[0].toUpperCase() : null;
}

/**
 * Resolve which {category, letter} shards are worth fetching for a
 * search query, restricted to `categories`. Kanji queries consult the
 * reverse index (substring match against indexed Kanji strings);
 * Hiragana/Katakana/Romaji queries route by the query's own computed
 * romaji initial.
 */
export async function resolveSearchShards(query, categories) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (KANJI_RE.test(trimmed)) {
    const index = await fetchKanjiIndex();
    const locators = new Set();
    for (const kanji of Object.keys(index)) {
      if (kanji.includes(trimmed)) for (const loc of index[kanji]) locators.add(loc);
    }
    return [...locators]
      .map((loc) => ({ category: CODE_TO_CATEGORY[loc[0]], letter: loc.slice(1) }))
      .filter((l) => l.category && categories.includes(l.category));
  }

  const letter = queryInitialLetter(trimmed);
  if (!letter) return [];
  const target = /^[A-Z]$/.test(letter) ? letter : "0";
  return categories.map((category) => ({ category, letter: target }));
}

/** Search the bulk dataset: resolves candidate shards, fetches them, and substring-matches within. */
export async function searchBulk(query, categories, { limit = 60 } = {}) {
  const shardRefs = await resolveSearchShards(query, categories);
  const shards = await Promise.all(shardRefs.map((ref) => fetchShard(ref.category, ref.letter)));
  const results = [];
  for (const shard of shards) {
    for (const record of shard) {
      if (fuzzyIncludes(record.kanji, query) || fuzzyIncludes(record.hiragana, query) || fuzzyIncludes(record.romaji, query)) {
        results.push(record);
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

/** Fetch a random shard for `category` and return up to `count` records matching `predicate` (or all, if none given). */
export async function generateFromBulk(category, count, predicate) {
  const letter = await pickWeightedRandomLetter(category);
  if (!letter) return [];
  const shard = await fetchShard(category, letter);
  const pool = predicate ? shard.filter(predicate) : shard;
  const picked = [];
  const used = new Set();
  const attempts = Math.min(pool.length, count * 5);
  for (let i = 0; i < attempts && picked.length < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    if (used.has(idx)) continue;
    used.add(idx);
    picked.push(pool[idx]);
  }
  return picked;
}
