// Approximate English syllable counter using vowel-group heuristics.
// This is the standard regex-based approach used by most readability
// calculators (Flesch, Fog, SMOG all need a syllable estimate) — it is not
// dictionary-perfect but is accurate for the vast majority of English words.
export function countSyllables(word) {
  const cleaned = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) {
    // Non-Latin script (CJK, Arabic, etc.) — fall back to a rough
    // length-based estimate so readability formulas stay meaningful
    // for mixed-language text instead of dividing by zero.
    const unicodeLen = Array.from(String(word)).length;
    return unicodeLen > 0 ? Math.max(1, Math.round(unicodeLen / 3)) : 0;
  }
  if (cleaned.length <= 3) return 1;

  let processed = cleaned
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const groups = processed.match(/[aeiouy]{1,2}/g);
  return groups ? Math.max(1, groups.length) : 1;
}

// A "complex" word for Gunning Fog / general readability purposes is one
// with 3 or more syllables.
export function isComplexWord(word) {
  return countSyllables(word) >= 3;
}
