// Japanese Name Generator — dataset ingestion & validation (spec Section 2A).
//
// Raw records (src/data/japaneseNamesRaw.js) are validated here BEFORE
// anything reaches the UI. Records missing required provenance are
// REJECTED (not shown, not silently patched) so the app can never
// display a fact it can't source. This module also computes the two
// derived, always-consistent fields — `romaji` (normalized Hepburn)
// and `moraCount` — from the record's own selected reading, and builds
// the lookup indexes the UI/engine layer needs for fast filtering.

import { romajiFromReading, capitalizeRomaji, moraCount as computeMoraCount } from "./japaneseNameRomaji.js";

const VALID_TYPES = new Set(["firstName", "lastName"]);
const VALID_MODES = new Set(["factual", "creative"]);
const VALID_GENDERS = new Set(["girl", "boy", "unisex"]);
const VALID_READING_STATUS = new Set(["selected", "alternative"]);
const HIRAGANA_RE = /^[぀-ゟー]+$/;
const KANJI_RE = /^[㐀-鿿々〆〤]+$/;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Validate one raw record. Returns { ok: true, record } or
 * { ok: false, reasons: [...] } — never throws, never partially
 * accepts a record with a patched-in guess for a missing field.
 */
export function validateRawRecord(raw) {
  const reasons = [];
  if (!raw || typeof raw !== "object") return { ok: false, reasons: ["Record is not an object"] };

  if (!isNonEmptyString(raw.id)) reasons.push("Missing id");
  if (!VALID_TYPES.has(raw.type)) reasons.push(`Invalid or missing type: ${raw.type}`);
  if (!VALID_MODES.has(raw.mode)) reasons.push(`Invalid or missing mode: ${raw.mode}`);
  if (!isNonEmptyString(raw.kanji) || !KANJI_RE.test(raw.kanji)) reasons.push("Missing or invalid kanji");

  if (!Array.isArray(raw.readings) || raw.readings.length === 0) {
    reasons.push("Missing readings[]");
  } else {
    raw.readings.forEach((r, i) => {
      if (!isNonEmptyString(r.hiragana) || !HIRAGANA_RE.test(r.hiragana)) reasons.push(`readings[${i}].hiragana missing/invalid`);
      if (!isNonEmptyString(r.readingSource)) reasons.push(`readings[${i}].readingSource missing (no provenance for this Kanji+reading pairing)`);
      if (!VALID_READING_STATUS.has(r.readingStatus)) reasons.push(`readings[${i}].readingStatus invalid`);
      if (r.readingConfidence !== undefined && (typeof r.readingConfidence !== "number" || r.readingConfidence < 0 || r.readingConfidence > 1)) {
        reasons.push(`readings[${i}].readingConfidence must be a number 0-1 if present`);
      }
    });
    if (
      typeof raw.selectedReadingIndex !== "number" ||
      raw.selectedReadingIndex < 0 ||
      raw.selectedReadingIndex >= (raw.readings?.length || 0)
    ) {
      reasons.push("selectedReadingIndex out of range");
    }
  }

  if (raw.type === "firstName") {
    if (raw.genderClassification !== undefined && raw.genderClassification !== "unavailable" && !VALID_GENDERS.has(raw.genderClassification)) {
      reasons.push(`Invalid genderClassification: ${raw.genderClassification}`);
    }
  }

  if (raw.type === "lastName") {
    if (raw.isEstablishedSurname !== true) reasons.push("lastName record must have isEstablishedSurname === true");
    if (!isNonEmptyString(raw.surnameClassificationSource)) reasons.push("lastName record missing surnameClassificationSource");
  }

  if (raw.meanings !== undefined) {
    if (!Array.isArray(raw.meanings)) {
      reasons.push("meanings must be an array");
    } else {
      raw.meanings.forEach((m, i) => {
        if (!isNonEmptyString(m.text)) reasons.push(`meanings[${i}].text missing`);
        if (!isNonEmptyString(m.appliesToKanji)) reasons.push(`meanings[${i}].appliesToKanji missing (meaning not linked to a specific Kanji)`);
        if (!isNonEmptyString(m.meaningSource)) reasons.push(`meanings[${i}].meaningSource missing (no provenance)`);
      });
    }
  }

  if (!isNonEmptyString(raw.source)) reasons.push("Missing source");
  if (!isNonEmptyString(raw.sourceRecordId)) reasons.push("Missing sourceRecordId");
  if (!isNonEmptyString(raw.sourceLicense)) reasons.push("Missing sourceLicense");

  if (reasons.length > 0) return { ok: false, reasons };
  return { ok: true };
}

/**
 * Ingest a raw dataset: validate every record, reject/flag anything
 * incomplete, and compute the derived romaji/moraCount fields from
 * each record's OWN selected reading (never hardcoded, never guessed).
 * Returns { records, rejected, stats }.
 */
export function ingestDataset(rawRecords) {
  const records = [];
  const rejected = [];

  for (const raw of rawRecords || []) {
    const result = validateRawRecord(raw);
    if (!result.ok) {
      rejected.push({ id: raw?.id ?? "(no id)", kanji: raw?.kanji ?? "(no kanji)", reasons: result.reasons });
      continue;
    }

    const selected = raw.readings[raw.selectedReadingIndex];
    const readings = raw.readings.map((r) => ({
      ...r,
      romaji: capitalizeRomaji(romajiFromReading(r.hiragana)),
      moraCount: computeMoraCount(r.hiragana),
    }));
    const selectedReading = readings[raw.selectedReadingIndex];

    records.push({
      ...raw,
      readings,
      hiragana: selected.hiragana,
      romaji: selectedReading.romaji,
      sourceRomaji: raw.sourceRomaji || selectedReading.romaji,
      moraCount: selectedReading.moraCount,
      kanjiCount: [...raw.kanji].length,
      genderClassification: raw.type === "firstName" ? raw.genderClassification || "unavailable" : undefined,
      initial: (selectedReading.romaji?.[0] || "").toUpperCase(),
    });
  }

  return {
    records,
    rejected,
    stats: {
      totalRaw: (rawRecords || []).length,
      validCount: records.length,
      rejectedCount: rejected.length,
    },
  };
}

/**
 * Detect duplicates within a validated record set per the mandatory
 * rules: same Kanji + same reading = duplicate; same Kanji + different
 * reading = separate; same reading + different Kanji = separate.
 * Returns groups of ids that are true duplicates (same type + same
 * kanji + same selected hiragana reading).
 */
export function findDuplicates(records) {
  const seen = new Map();
  const dupGroups = [];
  for (const r of records) {
    const key = `${r.type}::${r.kanji}::${r.hiragana}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push(r.id);
  }
  for (const ids of seen.values()) {
    if (ids.length > 1) dupGroups.push(ids);
  }
  return dupGroups;
}

/** Build precomputed lookup indexes for fast filtering over a validated dataset. */
export function buildIndexes(records) {
  const byType = { firstName: [], lastName: [] };
  const byGender = { girl: [], boy: [], unisex: [], unavailable: [] };
  const byInitial = {};
  const byTheme = {};
  const byId = new Map();

  for (const r of records) {
    byType[r.type]?.push(r);
    if (r.type === "firstName") byGender[r.genderClassification]?.push(r);
    if (!byInitial[r.initial]) byInitial[r.initial] = [];
    byInitial[r.initial].push(r);
    for (const t of r.themes || []) {
      if (!byTheme[t]) byTheme[t] = [];
      byTheme[t].push(r);
    }
    byId.set(r.id, r);
  }

  return { byType, byGender, byInitial, byTheme, byId };
}
