// Japanese Name Generator — generation, filtering, and similarity
// engine. Pure functions only (no React, no DOM); operates on the
// already-validated/ingested record set produced by
// japaneseNameIngestion.js. Never fabricates a Kanji+reading
// combination — factual generation always selects existing records.

import { nameMatchesQuery } from "./japaneseNameSearch.js";

export const NAME_TYPES = ["firstName", "lastName", "fullName"];
export const GENDERS = ["any", "girl", "boy", "unisex"];
export const QUANTITIES = [1, 5, 10, 20, 50];

/** Validate a value against an allow-list; returns the fallback if invalid. Used for URL-param / filter-input validation. */
export function validateEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/** Validate a requested quantity against the allowed presets. */
export function validateQuantity(value, fallback = 5) {
  const n = Number(value);
  return QUANTITIES.includes(n) ? n : fallback;
}

/**
 * Apply the optional filter set to a record list. Every filter is a
 * no-op if the corresponding record field is unavailable — this never
 * invents a value to filter against.
 */
export function filterRecords(records, filters = {}) {
  const { gender, meaningTheme, initial, kanjiCount, moraCount, query } = filters;
  return records.filter((r) => {
    if (gender && gender !== "any" && r.type === "firstName" && r.genderClassification !== gender) return false;
    if (meaningTheme && !(r.themes || []).includes(meaningTheme)) return false;
    if (initial && r.initial !== initial.toUpperCase()) return false;
    if (kanjiCount && r.kanjiCount !== Number(kanjiCount)) return false;
    if (moraCount && r.moraCount !== Number(moraCount)) return false;
    if (query && !nameMatchesQuery(r, query)) return false;
    return true;
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Randomly pick `quantity` records from a pool with no repeats within
 * this call. If the pool is smaller than requested, returns everything
 * available (never invents extra records to pad the count).
 */
export function pickRandomUnique(pool, quantity) {
  return shuffle(pool).slice(0, Math.min(quantity, pool.length));
}

/**
 * Generate first or last names from the validated dataset.
 * Returns { results, requestedQuantity, availableCount }.
 */
export function generateNames(records, { type, filters = {}, quantity = 5 }) {
  const pool = filterRecords(
    records.filter((r) => r.type === type),
    filters
  );
  const results = pickRandomUnique(pool, quantity);
  return { results, requestedQuantity: quantity, availableCount: pool.length };
}

/**
 * Generate full names by composing a surname + given name. Every
 * result is a GENERATED combination (combinationType: "generated") —
 * this dataset has no attested-real-person full-name records, so
 * "verified" full names are never produced. Each result explicitly
 * carries combinationType so the UI can label it correctly.
 */
export function generateFullNames(records, { filters = {}, quantity = 5 }) {
  const surnamePool = filterRecords(records.filter((r) => r.type === "lastName"), filters);
  const givenPool = filterRecords(records.filter((r) => r.type === "firstName"), filters);

  const results = [];
  const usedPairs = new Set();
  const maxAttempts = quantity * 20; // avoid an infinite loop if the pool is tiny
  let attempts = 0;

  while (results.length < quantity && attempts < maxAttempts && surnamePool.length && givenPool.length) {
    attempts += 1;
    const surname = surnamePool[Math.floor(Math.random() * surnamePool.length)];
    const given = givenPool[Math.floor(Math.random() * givenPool.length)];
    const pairKey = `${surname.id}::${given.id}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);
    results.push({
      id: `full::${pairKey}`,
      combinationType: "generated",
      surname,
      given,
      kanji: `${surname.kanji}${given.kanji}`,
      romaji: `${surname.romaji} ${given.romaji}`,
    });
  }

  return { results, requestedQuantity: quantity, availableCount: surnamePool.length * givenPool.length };
}

/**
 * "Generate Similar" — find other factual records related to `record`
 * by REAL shared metadata only: same type, same gender classification
 * (when available), a shared theme, the same mora count, or the same
 * initial. Never fabricates a similarity score; if nothing matches
 * well, returns fewer results (or none) rather than padding with
 * unrelated names.
 */
export function findSimilarNames(record, records, { limit = 5 } = {}) {
  if (!record) return [];
  const candidates = records.filter((r) => r.id !== record.id && r.type === record.type);

  const scored = candidates.map((r) => {
    let score = 0;
    if (record.type === "firstName" && r.genderClassification && r.genderClassification === record.genderClassification) score += 2;
    const sharedThemes = (r.themes || []).filter((t) => (record.themes || []).includes(t));
    score += sharedThemes.length * 2;
    if (r.moraCount === record.moraCount) score += 1;
    if (r.initial === record.initial) score += 1;
    return { record: r, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.record);
}

/** Format a record's display name given the current name-order preference. */
export function formatDisplayOrder(surnameText, givenText, order = "japanese") {
  return order === "international" ? `${givenText} ${surnameText}` : `${surnameText} ${givenText}`;
}
