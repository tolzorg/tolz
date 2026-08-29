#!/usr/bin/env node
// Build pipeline: JMnedict.xml (EDRDG, CC BY-SA 4.0) -> sharded JSON
// records matching the Japanese Name Generator's schema, written to
// public/data/japanese-names/.
//
// USAGE:
//   1. Download the current source file (do NOT commit it — it's
//      ~150MB uncompressed and fully regenerable):
//        curl -o JMnedict.xml.gz http://ftp.edrdg.org/pub/Nihongo/JMnedict.xml.gz
//        gunzip JMnedict.xml.gz
//   2. Run this script (needs extra heap for the full 743k-entry file):
//        node --max-old-space-size=6144 scripts/build-japanese-names-dataset.mjs JMnedict.xml public/data/japanese-names
//
// The CC BY-SA 4.0 license these entries are distributed under
// requires web deployments to refresh from the current source at
// least monthly — re-running this script with a freshly downloaded
// JMnedict.xml is how that's done. Attribution is rendered in the app
// itself (see JapaneseNameAttribution.jsx), not just here.
//
// Design notes:
// - Only entries with at least one <k_ele> (kanji) are kept — this
//   tool's schema is Kanji+reading based; kana-only foreign-name
//   transliteration entries are out of scope here.
// - "person" (full attested individual names) are skipped: splitting
//   a kanji string into surname+given without a documented boundary
//   would risk an incorrect claim about a real person's name.
// - Multiple k_ele in one entry are orthographic variants (per the
//   JMnedict DTD) -> split into one record per kanji, cross-linked via
//   `variants`. Multiple r_ele apply to ALL keb unless re_restr says
//   otherwise (re_restr occurs twice in the whole file — handled).
// - No meaning/theme data exists in this source — meanings/themes are
//   left empty, never inferred.
// - gender: fem-only -> girl, masc-only -> boy, both fem+masc on the
//   same entry -> unisex (explicitly dual-attested), given-only
//   (JMnedict's own "gender not specified") -> unavailable.

import fs from "node:fs";
import path from "node:path";

const IN_PATH = process.argv[2] || "JMnedict.xml";
const OUT_DIR = process.argv[3] || "jmnedict-out";

const SOURCE_LABEL = "JMnedict/ENAMDICT (Electronic Dictionary Research and Development Group)";
const SOURCE_LICENSE = "CC BY-SA 4.0 — Electronic Dictionary Research and Development Group, https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project";

function readingSourceFor(entSeq) {
  return `JMnedict/ENAMDICT entry #${entSeq} (name_type classification)`;
}
function surnameSourceFor(entSeq) {
  return `JMnedict/ENAMDICT entry #${entSeq}, name_type=surname classification`;
}

// ── Minimal romaji/mora (duplicated here, standalone script — same
// rules as src/utils/japaneseNameRomaji.js, kept in sync manually
// since this is a one-off offline build tool, not part of the app bundle) ──
const BASE_KANA = {
  あ:"a",い:"i",う:"u",え:"e",お:"o",か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",
  さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",
  な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
  ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",や:"ya",ゆ:"yu",よ:"yo",
  ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",わ:"wa",ゐ:"i",ゑ:"e",を:"o",ん:"n",
  が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
  だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
  ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",ゔ:"vu",
};
const YOON = {
  きゃ:"kya",きゅ:"kyu",きょ:"kyo",しゃ:"sha",しゅ:"shu",しょ:"sho",ちゃ:"cha",ちゅ:"chu",ちょ:"cho",
  にゃ:"nya",にゅ:"nyu",にょ:"nyo",ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",みゃ:"mya",みゅ:"myu",みょ:"myo",
  りゃ:"rya",りゅ:"ryu",りょ:"ryo",ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",じゃ:"ja",じゅ:"ju",じょ:"jo",
  びゃ:"bya",びゅ:"byu",びょ:"byo",ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",ぢゃ:"ja",ぢゅ:"ju",ぢょ:"jo",
};
const SMALL_VOWEL_COMBOS = {
  ゔぁ:"va",ゔぃ:"vi",ゔぇ:"ve",ゔぉ:"vo",てぃ:"ti",でぃ:"di",とぅ:"tu",どぅ:"du",
  ふぁ:"fa",ふぃ:"fi",ふぇ:"fe",ふぉ:"fo",うぃ:"wi",うぇ:"we",うぉ:"wo",ちぇ:"che",じぇ:"je",しぇ:"she",
};
const SMALL_Y = new Set(["ゃ","ゅ","ょ"]);
const SMALL_VOWELS = new Set(["ぁ","ぃ","ぅ","ぇ","ぉ"]);
const MACRON = { a:"ā", i:"ī", u:"ū", e:"ē", o:"ō" };
const PLAIN_VOWELS = new Set(["a","i","u","e","o"]);

function katakanaToHiragana(str) {
  return str.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}
function tokenizeMora(reading) {
  const s = katakanaToHiragana(reading || "").replace(/[^぀-ゟー]/g, "");
  const units = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i], next = s[i + 1];
    if (ch === "っ") { units.push({ kana: "っ", kind: "sokuon" }); i += 1; continue; }
    if (ch === "ん") { units.push({ kana: "ん", kind: "moraic-nasal" }); i += 1; continue; }
    if (ch === "ー") { units.push({ kana: "ー", kind: "chōonpu" }); i += 1; continue; }
    if (next && SMALL_VOWELS.has(next)) {
      const combo = ch + next;
      if (SMALL_VOWEL_COMBOS[combo]) { units.push({ kana: combo, kind: "small-vowel-combo" }); i += 2; continue; }
    }
    if (next && SMALL_Y.has(next)) {
      const combo = ch + next;
      if (YOON[combo]) { units.push({ kana: combo, kind: "yoon" }); i += 2; continue; }
    }
    units.push({ kana: ch, kind: "base" });
    i += 1;
  }
  return units;
}
function moraCount(reading) { return tokenizeMora(reading).length; }
function romajiForUnit(u) {
  if (u.kind === "yoon") return YOON[u.kana] || "";
  if (u.kind === "small-vowel-combo") return SMALL_VOWEL_COMBOS[u.kana] || "";
  return BASE_KANA[u.kana] || "";
}
function isLongVowelPair(precedingVowel, nextKana) {
  if (precedingVowel === "o") return nextKana === "う" || nextKana === "お";
  if (precedingVowel === "u") return nextKana === "う";
  if (precedingVowel === "e") return nextKana === "え";
  if (precedingVowel === "a") return nextKana === "あ";
  if (precedingVowel === "i") return nextKana === "い";
  return false;
}
function romajiFromReading(reading) {
  const units = tokenizeMora(reading);
  let out = "";
  let i = 0;
  while (i < units.length) {
    const u = units[i];
    if (u.kind === "sokuon") {
      const nextUnit = units[i + 1];
      const nextRomaji = nextUnit ? romajiForUnit(nextUnit) : "";
      const firstConsonant = nextRomaji.startsWith("ch") ? "t" : nextRomaji[0];
      out += firstConsonant || "";
      i += 1; continue;
    }
    if (u.kind === "chōonpu") {
      const lastChar = out[out.length - 1];
      out = PLAIN_VOWELS.has(lastChar) ? out.slice(0, -1) + MACRON[lastChar] : out;
      i += 1; continue;
    }
    if (u.kind === "moraic-nasal") {
      const nextUnit = units[i + 1];
      const nextRomaji = nextUnit ? romajiForUnit(nextUnit) : "";
      out += /^[aiueoy]/.test(nextRomaji) ? "n'" : "n";
      i += 1; continue;
    }
    if (u.kind === "base" || u.kind === "yoon" || u.kind === "small-vowel-combo") {
      const thisRomaji = romajiForUnit(u);
      out += thisRomaji;
      const lastVowel = thisRomaji[thisRomaji.length - 1];
      const nextUnit = units[i + 1];
      if (PLAIN_VOWELS.has(lastVowel) && nextUnit && nextUnit.kind === "base" && isLongVowelPair(lastVowel, nextUnit.kana)) {
        out = out.slice(0, -1) + MACRON[lastVowel];
        i += 2; continue;
      }
      i += 1; continue;
    }
    out += romajiForUnit(u);
    i += 1;
  }
  return out;
}
function capitalizeRomaji(r) { return r ? r.charAt(0).toUpperCase() + r.slice(1) : ""; }

const KANJI_RE = /^[㐀-鿿々〆〤]+$/;
const HIRAGANA_RE = /^[぀-ゟー]+$/;

function isValidKanjiString(s) {
  return typeof s === "string" && s.length > 0 && KANJI_RE.test(s);
}

// ── Parse ────────────────────────────────────────────────────────
console.log("Reading XML...");
const xml = fs.readFileSync(IN_PATH, "utf8");
console.log(`Read ${(xml.length / 1e6).toFixed(1)}M chars. Splitting entries...`);
const rawEntries = xml.split("<entry>");
rawEntries.shift(); // drop the header/DOCTYPE preamble before the first <entry>
console.log(`Found ${rawEntries.length} entries.`);

function extractAll(re, text) {
  const out = [];
  let m;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(text))) out.push(m[1]);
  return out;
}

const girl = new Map(), boy = new Map(), unisex = new Map(), givenOther = new Map(), surname = new Map();

let processed = 0;
let skippedNoKanji = 0;
let skippedNoRelevantType = 0;

for (const raw of rawEntries) {
  const entryEnd = raw.indexOf("</entry>");
  const entry = entryEnd === -1 ? raw : raw.slice(0, entryEnd);

  const entSeqMatch = /<ent_seq>(\d+)<\/ent_seq>/.exec(entry);
  const entSeq = entSeqMatch ? entSeqMatch[1] : "?";

  const kebs = extractAll(/<keb>([^<]+)<\/keb>/g, entry).filter(isValidKanjiString);
  if (kebs.length === 0) { skippedNoKanji++; continue; }

  const rebs = extractAll(/<reb>([^<]+)<\/reb>/g, entry)
    .map((r) => katakanaToHiragana(r))
    .filter((r) => HIRAGANA_RE.test(r));
  if (rebs.length === 0) { skippedNoKanji++; continue; }

  const types = new Set(extractAll(/<name_type>&([a-z]+);<\/name_type>/g, entry));
  const isFem = types.has("fem");
  const isMasc = types.has("masc");
  const isGiven = types.has("given");
  const isSurname = types.has("surname");
  if (!isFem && !isMasc && !isGiven && !isSurname) { skippedNoRelevantType++; continue; }

  processed++;

  const readingsPayload = rebs.map((hiragana, idx) => ({
    hiragana,
    readingSource: readingSourceFor(entSeq),
    readingStatus: idx === 0 ? "selected" : "alternative",
  }));

  // Separate variant-id spaces per type: a kanji spelling's "variants"
  // must only ever point at OTHER kanji spellings of the SAME record
  // type (firstName siblings, or lastName siblings) — never across
  // types, even though both are derived from the same dictionary entry.
  const firstNameIds = kebs.map((_, ki) => `jmne-${entSeq}-k${ki}`);
  const surnameIds = kebs.map((_, ki) => `jmne-${entSeq}-k${ki}-sn`);

  function makeRecord(type, kanji, id, siblingIds, extra) {
    return {
      id,
      type,
      mode: "factual",
      kanji,
      readings: readingsPayload,
      selectedReadingIndex: 0,
      meanings: [],
      themes: [],
      variants: siblingIds.filter((v) => v !== id),
      source: SOURCE_LABEL,
      sourceRecordId: id,
      sourceLicense: SOURCE_LICENSE,
      ...extra,
    };
  }

  kebs.forEach((kanji, ki) => {
    if (isFem || isMasc || isGiven) {
      let gender = "unavailable";
      if (isFem && isMasc) gender = "unisex";
      else if (isFem) gender = "girl";
      else if (isMasc) gender = "boy";
      const rec = makeRecord("firstName", kanji, firstNameIds[ki], firstNameIds, { genderClassification: gender });
      const bucket = gender === "girl" ? girl : gender === "boy" ? boy : gender === "unisex" ? unisex : givenOther;
      const key = `${kanji}::${rebs[0]}`;
      if (!bucket.has(key)) bucket.set(key, rec);
    }

    if (isSurname) {
      const rec = makeRecord("lastName", kanji, surnameIds[ki], surnameIds, {
        isEstablishedSurname: true,
        surnameClassificationSource: surnameSourceFor(entSeq),
      });
      const key = `${kanji}::${rebs[0]}`;
      if (!surname.has(key)) surname.set(key, rec);
    }
  });

  if (processed % 100000 === 0) console.log(`  processed ${processed}...`);
}

console.log(`Done. processed=${processed} skippedNoKanji=${skippedNoKanji} skippedNoRelevantType=${skippedNoRelevantType}`);
console.log(`Unique records -> girl:${girl.size} boy:${boy.size} unisex:${unisex.size} givenOther:${givenOther.size} surname:${surname.size}`);

// ── Finalize (compute romaji/mora/kanjiCount/initial) + shard by initial letter ──
function finalize(rec) {
  const readings = rec.readings.map((r) => ({
    ...r,
    romaji: capitalizeRomaji(romajiFromReading(r.hiragana)),
    moraCount: moraCount(r.hiragana),
  }));
  const sel = readings[rec.selectedReadingIndex];
  return {
    ...rec,
    readings,
    hiragana: sel.hiragana,
    romaji: sel.romaji,
    sourceRomaji: sel.romaji,
    moraCount: sel.moraCount,
    kanjiCount: [...rec.kanji].length,
    initial: (sel.romaji?.[0] || "0").toUpperCase(),
  };
}

// Kanji -> reverse index of shard locators ("<categoryCode><letter>",
// e.g. "gA", "sS"), so a Kanji search query can find which shard(s) to
// fetch WITHOUT loading the whole dataset. Romaji/Hiragana queries
// don't need this — their target shard is derivable directly from the
// computed romaji initial.
const kanjiIndex = {};
const CATEGORY_CODE = { girl: "g", boy: "b", unisex: "u", "given-other": "o", surname: "s" };

function shardAndWrite(map, subdir) {
  const code = CATEGORY_CODE[subdir];
  const dir = path.join(OUT_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const shards = {};
  let count = 0;
  for (const rec of map.values()) {
    const fin = finalize(rec);
    const letter = /^[A-Z]$/.test(fin.initial) ? fin.initial : "0";
    if (!shards[letter]) shards[letter] = [];
    shards[letter].push(fin);
    count++;

    const locator = `${code}${letter}`;
    if (!kanjiIndex[fin.kanji]) kanjiIndex[fin.kanji] = [];
    if (!kanjiIndex[fin.kanji].includes(locator)) kanjiIndex[fin.kanji].push(locator);
  }
  const shardSizes = {};
  for (const [letter, recs] of Object.entries(shards)) {
    fs.writeFileSync(path.join(dir, `${letter}.json`), JSON.stringify(recs));
    shardSizes[letter] = recs.length;
  }
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({ total: count, shardSizes }, null, 2));
  console.log(`Wrote ${subdir}: ${count} records across ${Object.keys(shards).length} shards`);
  return count;
}

const counts = {
  girl: shardAndWrite(girl, "girl"),
  boy: shardAndWrite(boy, "boy"),
  unisex: shardAndWrite(unisex, "unisex"),
  givenOther: shardAndWrite(givenOther, "given-other"),
  surname: shardAndWrite(surname, "surname"),
};

fs.writeFileSync(path.join(OUT_DIR, "totals.json"), JSON.stringify(counts, null, 2));
console.log("TOTALS:", counts);

console.log(`Writing kanji reverse index (${Object.keys(kanjiIndex).length} distinct kanji strings)...`);
fs.writeFileSync(path.join(OUT_DIR, "kanji-index.json"), JSON.stringify(kanjiIndex));
console.log("Done.");
