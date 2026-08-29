#!/usr/bin/env node
// Reference/regression test suite for the Japanese Name Generator's
// pure engine modules (romaji/mora, ingestion/validation, search
// normalization, katakana transliteration, generation/similarity).
// Plain Node + assert — no test framework dependency, matching this
// project's established convention for engine-level test scripts.
//
// Run with: node scripts/japanese-name-generator.test.js

import { moraCount, romajiFromReading, capitalizeRomaji, tokenizeMora } from "../src/utils/japaneseNameRomaji.js";
import {
  toHiragana, toKatakana, toHalfWidth, normalizeForSearch, fuzzyIncludes, nameMatchesQuery,
} from "../src/utils/japaneseNameSearch.js";
import { validateRawRecord, ingestDataset, findDuplicates, buildIndexes } from "../src/utils/japaneseNameIngestion.js";
import { transliterateToKatakana } from "../src/utils/katakanaTransliteration.js";
import {
  filterRecords, pickRandomUnique, generateNames, generateFullNames, findSimilarNames,
  validateEnum, validateQuantity, formatDisplayOrder,
} from "../src/utils/japaneseNameEngine.js";
import { RAW_ALL_NAMES, RAW_GIVEN_NAMES, RAW_SURNAMES } from "../src/data/japaneseNamesRaw.js";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; failures.push(detail ? `${name}: ${detail}` : name); }
}

// ─────────────────────────────────────────────────────────────────
// Mora count — the 8 mandatory test cases (spec Section 10)
// ─────────────────────────────────────────────────────────────────
const MORA_CASES = [
  ["はるか", 3], ["きょうこ", 3], ["しょう", 2], ["さっき", 3],
  ["とう", 2], ["リョウ", 2], ["ゔぁ", 1], ["けん", 2],
];
for (const [reading, expected] of MORA_CASES) {
  ok(`moraCount(${reading}) === ${expected}`, moraCount(reading) === expected, `got ${moraCount(reading)}`);
}
ok("tokenizeMora never throws on empty input", moraCount("") === 0);
ok("tokenizeMora never throws on non-Japanese input", moraCount("abc123") === 0);
ok("tokenizeMora strips non-hiragana/katakana characters safely", tokenizeMora("は<script>").length === 1);

// ─────────────────────────────────────────────────────────────────
// Hepburn romaji — long vowels, sokuon, moraic nasal, yōon
// ─────────────────────────────────────────────────────────────────
ok("おう digraph -> macron ō", romajiFromReading("とう") === "tō");
ok("おう digraph in context -> Kyōko", capitalizeRomaji(romajiFromReading("きょうこ")) === "Kyōko");
ok("えい does NOT collapse to macron (stays 'ei')", romajiFromReading("せんせい") === "sensei");
ok("ええ collapses to macron ē", romajiFromReading("おねえさん") === "onēsan");
ok("sokuon doubles the following consonant", romajiFromReading("がっこう") === "gakkō");
ok("ん before a vowel gets an apostrophe", romajiFromReading("けんいち") === "ken'ichi");
ok("ん before a consonant has no apostrophe", romajiFromReading("けんた") === "kenta");
ok("chōonpu extends the preceding vowel with a macron", romajiFromReading("ラーメン") === "rāmen");
ok("small-vowel combo (foreign-origin reading)", romajiFromReading("ゔぁん") === "van");
ok("capitalizeRomaji uppercases macron vowels correctly", capitalizeRomaji("ōsaka") === "Ōsaka");
ok("empty reading produces empty romaji, never throws", romajiFromReading("") === "");

// ─────────────────────────────────────────────────────────────────
// Search normalization — kana folding, width folding, never mutates
// ─────────────────────────────────────────────────────────────────
ok("toHiragana folds katakana", toHiragana("サクラ") === "さくら");
ok("toKatakana folds hiragana", toKatakana("さくら") === "サクラ");
ok("toHalfWidth folds full-width Latin", toHalfWidth("Ａｂｃ") === "Abc");
ok("normalizeForSearch is case-insensitive for romaji", normalizeForSearch("SAKURA") === normalizeForSearch("sakura"));
ok("normalizeForSearch folds katakana query against hiragana text", normalizeForSearch("サクラ") === normalizeForSearch("さくら"));
ok("fuzzyIncludes matches katakana query against hiragana haystack", fuzzyIncludes("さくら", "サクラ"));
ok("fuzzyIncludes matches partial romaji", fuzzyIncludes("Sakura", "saku"));
ok("fuzzyIncludes empty query matches everything", fuzzyIncludes("anything", ""));
{
  const original = "さくら";
  normalizeForSearch(original);
  toHiragana(original);
  toKatakana(original);
  ok("normalization never mutates the original string (JS strings are immutable, verified explicitly)", original === "さくら");
}
ok("nameMatchesQuery handles a record with missing romaji gracefully", nameMatchesQuery({ kanji: "桜", hiragana: "さくら" }, "さくら") === true);
{
  // Search input must never be treated as a regex/code pattern.
  const weird = "a.*b(c[d";
  let threw = false;
  try { fuzzyIncludes("some text", weird); } catch { threw = true; }
  ok("fuzzyIncludes treats regex special characters as plain text, never throws", !threw);
}

// ─────────────────────────────────────────────────────────────────
// Katakana transliteration — never crashes, never executes input
// ─────────────────────────────────────────────────────────────────
ok("transliterateToKatakana produces non-empty output for a simple name", transliterateToKatakana("Sarah").katakana.length > 0);
ok("transliterateToKatakana handles empty input without throwing", transliterateToKatakana("").katakana === "");
ok("transliterateToKatakana handles null/undefined input without throwing", transliterateToKatakana(null).katakana === "");
{
  const result = transliterateToKatakana("<script>alert(1)</script>");
  ok("transliterateToKatakana never outputs raw HTML/script tags", !result.katakana.includes("<") && !result.katakana.includes(">"));
}
ok("transliterateToKatakana handles very long input without throwing", transliterateToKatakana("a".repeat(10000)).katakana.length > 0);
ok("transliterateToKatakana silences a trailing vowel+h (Sarah)", transliterateToKatakana("Sarah").katakana === "サラ");
ok("transliterateToKatakana silences mid-word vowel+h before consonant (John)", transliterateToKatakana("John").katakana === "ジョン");
ok("transliterateToKatakana handles multi-word names with a separator", transliterateToKatakana("John Smith").katakana.includes("・"));

// ─────────────────────────────────────────────────────────────────
// Dataset ingestion & validation (spec Section 2A)
// ─────────────────────────────────────────────────────────────────
{
  const result = ingestDataset(RAW_ALL_NAMES);
  ok("every hand-curated record passes validation", result.stats.rejectedCount === 0, `rejected: ${JSON.stringify(result.rejected)}`);
  ok("ingestion measures the actual record count (not a claimed/rounded number)", result.stats.validCount === RAW_ALL_NAMES.length);
  ok("firstName records never leak into lastName-only pools", result.records.filter((r) => r.type === "lastName").every((r) => r.isEstablishedSurname === true));
  ok("every lastName record carries a surnameClassificationSource", result.records.filter((r) => r.type === "lastName").every((r) => !!r.surnameClassificationSource));
  ok("romaji is computed, never left undefined", result.records.every((r) => typeof r.romaji === "string" && r.romaji.length > 0));
  ok("moraCount is computed for every record", result.records.every((r) => typeof r.moraCount === "number" && r.moraCount > 0));
  ok("provenance fields survive ingestion", result.records.every((r) => !!r.source && !!r.sourceRecordId && !!r.sourceLicense));

  const dups = findDuplicates(result.records);
  ok("no true duplicates in the curated dataset (same type+kanji+reading)", dups.length === 0, JSON.stringify(dups));

  const idx = buildIndexes(result.records);
  ok("indexes cover every valid record exactly once", idx.byId.size === result.records.length);
}

// Ingestion must REJECT incomplete records, not silently patch them.
{
  const incomplete = { id: "bad-1", type: "firstName", mode: "factual", kanji: "花" }; // missing readings/source/etc.
  const v = validateRawRecord(incomplete);
  ok("a record missing readings/source is rejected", v.ok === false);
  ok("rejection lists concrete reasons", Array.isArray(v.reasons) && v.reasons.length > 0);
}
{
  const noSurnameSource = {
    id: "bad-2", type: "lastName", mode: "factual", kanji: "山田",
    readings: [{ hiragana: "やまだ", readingSource: "x", readingStatus: "selected" }],
    selectedReadingIndex: 0, isEstablishedSurname: true,
    source: "x", sourceRecordId: "x", sourceLicense: "x",
    // surnameClassificationSource deliberately omitted
  };
  ok("a surname without surnameClassificationSource is rejected", validateRawRecord(noSurnameSource).ok === false);
}
{
  const result = ingestDataset([{ totally: "malformed" }, null, undefined, 42, "a string"]);
  ok("ingestDataset never throws on malformed/garbage input", result.stats.rejectedCount === 5);
}

// Duplicate rules (spec Section 4), tested with synthetic fixtures so
// the real dataset can stay free of intentional duplicates.
{
  const sameKanjiSameReading = [
    { id: "a", type: "firstName", kanji: "花", hiragana: "はな" },
    { id: "b", type: "firstName", kanji: "花", hiragana: "はな" },
  ];
  ok("same Kanji + same reading = duplicate", findDuplicates(sameKanjiSameReading).length === 1);

  const sameKanjiDiffReading = [
    { id: "a", type: "firstName", kanji: "花", hiragana: "はな" },
    { id: "b", type: "firstName", kanji: "花", hiragana: "か" },
  ];
  ok("same Kanji + different reading = separate", findDuplicates(sameKanjiDiffReading).length === 0);

  const sameReadingDiffKanji = [
    { id: "a", type: "firstName", kanji: "桜", hiragana: "さくら" },
    { id: "b", type: "firstName", kanji: "咲良", hiragana: "さくら" },
  ];
  ok("same reading + different Kanji = separate", findDuplicates(sameReadingDiffKanji).length === 0);
}

// ─────────────────────────────────────────────────────────────────
// Generation engine
// ─────────────────────────────────────────────────────────────────
{
  const { records } = ingestDataset(RAW_ALL_NAMES);

  const girlResult = generateNames(records, { type: "firstName", filters: { gender: "girl" }, quantity: 5 });
  ok("gender filter returns only girl-classified names", girlResult.results.every((r) => r.genderClassification === "girl"));

  const lastResult = generateNames(records, { type: "lastName", filters: {}, quantity: 10 });
  ok("lastName generation never returns a firstName record", lastResult.results.every((r) => r.type === "lastName"));

  const over = generateNames(records, { type: "lastName", filters: {}, quantity: 999 });
  ok("requesting more than available returns everything available, never invents extra records", over.results.length === over.availableCount);

  const dup = generateNames(records, { type: "firstName", filters: {}, quantity: 20 });
  const ids = dup.results.map((r) => r.id);
  ok("generation never returns duplicate records within one request", new Set(ids).size === ids.length);

  const full = generateFullNames(records, { filters: {}, quantity: 5 });
  ok("every generated full name is labeled combinationType 'generated'", full.results.every((r) => r.combinationType === "generated"));
  ok("full-name composition pairs a real surname with a real given name", full.results.every((r) => r.surname.type === "lastName" && r.given.type === "firstName"));

  const noResultFilters = { gender: "girl", moraCount: 999 };
  const empty = generateNames(records, { type: "firstName", filters: noResultFilters, quantity: 5 });
  ok("an impossible filter combination yields zero results, not fabricated ones", empty.results.length === 0);

  const sample = records.find((r) => r.type === "firstName" && r.themes?.length);
  const similar = findSimilarNames(sample, records, { limit: 5 });
  ok("findSimilarNames never includes the record itself", similar.every((r) => r.id !== sample.id));
  ok("findSimilarNames never returns more than the requested limit", similar.length <= 5);

  const nobodySimilar = findSimilarNames({ id: "ghost", type: "firstName", themes: [], moraCount: -1, initial: "∅" }, records);
  ok("findSimilarNames returns fewer/none rather than inventing unrelated matches", nobodySimilar.length === 0 || nobodySimilar.every((r) => r.type === "firstName"));
}

ok("validateEnum rejects an out-of-list value", validateEnum("hacked", ["a", "b"], "a") === "a");
ok("validateEnum accepts an in-list value", validateEnum("b", ["a", "b"], "a") === "b");
ok("validateQuantity rejects an arbitrary number not in the preset list", validateQuantity(999999, 5) === 5);
ok("validateQuantity accepts a valid preset", validateQuantity(20, 5) === 20);
ok("formatDisplayOrder defaults to Japanese (family + given)", formatDisplayOrder("Tanaka", "Yui") === "Tanaka Yui");
ok("formatDisplayOrder swaps for international order", formatDisplayOrder("Tanaka", "Yui", "international") === "Yui Tanaka");

{
  // pickRandomUnique / filterRecords security: malicious query strings must never throw or match everything unexpectedly.
  const { records } = ingestDataset(RAW_GIVEN_NAMES);
  const maliciousQueries = ["<img src=x onerror=alert(1)>", "'; DROP TABLE names; --", "a".repeat(5000), "★彡ﾟ*｡"];
  let anyThrew = false;
  for (const q of maliciousQueries) {
    try { filterRecords(records, { query: q }); } catch { anyThrew = true; }
  }
  ok("filterRecords never throws on malicious/oversized query strings", !anyThrew);
}

ok("surname dataset has at least the expected number of curated records", RAW_SURNAMES.length >= 20);

// ─────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────
console.log(`\nJapanese Name Generator engine suite: ${pass} passed, ${fail} failed.`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
