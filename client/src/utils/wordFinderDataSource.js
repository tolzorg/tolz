// Word Finder — lazy data source for the sharded word list (see
// public/data/word-finder/ and scripts/build-word-finder-dataset.mjs).
// 172,823 words total, sharded by length (2-28 letters) so a
// length-specific search only ever fetches the one shard it needs;
// "Any Words" fetches every shard once, in parallel, then caches them.
//
// Source: the ENABLE word list (public domain, compiled by Alan Beale
// specifically for word-game use — the same list underlying many
// word-finder/unscrambler tools). See the build script for details.

const DATA_BASE = "/data/word-finder";

const shardCache = new Map(); // length -> Promise<string[]>
let manifestPromise = null;

async function fetchJson(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return fallback;
  }
}

/** Fetch (and cache) the manifest: total count + per-length counts, no word data. */
export function fetchManifest() {
  if (!manifestPromise) manifestPromise = fetchJson(`${DATA_BASE}/manifest.json`, { total: 0, lengths: {}, minLength: 2, maxLength: 15 });
  return manifestPromise;
}

/** Fetch (and cache) every word of a specific length. */
export function fetchLengthShard(length) {
  if (!shardCache.has(length)) {
    shardCache.set(length, fetchJson(`${DATA_BASE}/${length}.json`, []));
  }
  return shardCache.get(length);
}

/** Fetch every shard (all lengths) — used for "Any Words" mode. Fetched in parallel and cached individually, so repeat calls (or a later length-specific search) reuse what's already loaded. */
export async function fetchAllWords() {
  const manifest = await fetchManifest();
  const lengths = Object.keys(manifest.lengths || {}).map(Number);
  const shards = await Promise.all(lengths.map((len) => fetchLengthShard(len)));
  return shards.flat();
}
