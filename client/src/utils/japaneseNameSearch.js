// Japanese Name Generator — search-matching normalization.
//
// Everything here is used ONLY to decide whether two strings should be
// considered a match. None of it is ever written back onto a stored
// record — callers must always search against a normalized *copy* of
// the record's fields and render the original, untouched fields.

const HIRA_START = 0x3041; // ぁ
const HIRA_END = 0x3096; // ゖ
const KATA_START = 0x30a1; // ァ
const FULLWIDTH_OFFSET = KATA_START - HIRA_START; // 0x60

/** Fold all katakana in a string down to hiragana. */
export function toHiragana(str) {
  return String(str || "").replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - FULLWIDTH_OFFSET)
  );
}

/** Fold all hiragana in a string up to katakana. */
export function toKatakana(str) {
  return String(str || "").replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + FULLWIDTH_OFFSET)
  );
}

/**
 * Fold full-width Latin letters/digits and full-width punctuation down
 * to their standard half-width ASCII equivalents (e.g. "Ａ" -> "A").
 */
export function toHalfWidth(str) {
  return String(str || "")
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " "); // full-width space -> regular space
}

/**
 * Canonical form of a string for MATCHING PURPOSES ONLY: NFKC unicode
 * normalization, half-width folding, katakana folded to hiragana
 * (so a hiragana query matches katakana-written text and vice versa),
 * lowercased (for Latin/romaji), and trimmed.
 */
export function normalizeForSearch(str) {
  const s = String(str || "").normalize("NFKC");
  return toHiragana(toHalfWidth(s)).toLowerCase().trim();
}

/**
 * True if `haystack` contains `needle` once both are normalized for
 * matching (case-insensitive Latin, hiragana/katakana-folded,
 * width-folded). Plain substring search — no regex, so arbitrary user
 * input can never be interpreted as a pattern.
 */
export function fuzzyIncludes(haystack, needle) {
  if (!needle) return true;
  const n = normalizeForSearch(needle);
  if (!n) return true;
  return normalizeForSearch(haystack).includes(n);
}

/**
 * Search a name record across its Romaji/Hiragana/Katakana/Kanji
 * surface forms. Only compares against fields that exist on the
 * record — never fabricates a field to search against.
 */
export function nameMatchesQuery(record, query) {
  if (!query || !query.trim()) return true;
  const fields = [
    record.kanji,
    record.hiragana,
    toKatakana(record.hiragana || ""),
    record.romaji,
    record.sourceRomaji,
  ].filter(Boolean);
  return fields.some((f) => fuzzyIncludes(f, query));
}
