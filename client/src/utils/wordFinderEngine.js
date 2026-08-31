// Word Finder — pure search/scoring engine. Operates on plain lowercase
// word strings; no DOM, no fetching (that's wordFinderDataSource.js).
//
// Match modes (word-finder convention — all case-insensitive, and all
// allow the word to contain OTHER letters beyond the ones specified;
// none of these four modes restrict a word to being built EXCLUSIVELY
// from the given letters — that exact-tile-rack case is what
// Fill-in-the-Blanks is for, where every position is either a known
// letter or an open slot):
//   startsWith        — word begins with the given letters, in order.
//   endsWith           — word ends with the given letters, in order.
//   containingInOrder  — the given letters appear as a subsequence
//                         somewhere in the word, in that exact relative
//                         order (not necessarily adjacent).
//   including          — the word contains every given letter at least
//                         as many times as it appears in the input,
//                         anywhere, in any order.

const MAX_INPUT_LENGTH = 30; // generous — no real English word is longer, and this bounds worst-case work on malicious input

/** Untrusted-input sanitizer: letters only, lowercased, length-capped. Never throws. */
export function sanitizeLetters(input) {
  return String(input ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, MAX_INPUT_LENGTH);
}

export function matchesStartingWith(word, letters) {
  return letters.length > 0 && word.startsWith(letters);
}

export function matchesEndingWith(word, letters) {
  return letters.length > 0 && word.endsWith(letters);
}

/** The given letters appear in the word as a subsequence, in order (not necessarily contiguous). */
export function matchesContainingInOrder(word, letters) {
  if (letters.length === 0) return false;
  let i = 0;
  for (const ch of word) {
    if (ch === letters[i]) i++;
    if (i === letters.length) return true;
  }
  return false;
}

function letterCounts(str) {
  const counts = new Map();
  for (const ch of str) counts.set(ch, (counts.get(ch) || 0) + 1);
  return counts;
}

/** The word contains every letter in `letters` at least as many times as it appears in `letters` (order-independent). */
export function matchesIncluding(word, letters) {
  if (letters.length === 0) return false;
  const need = letterCounts(letters);
  const have = letterCounts(word);
  for (const [ch, count] of need) {
    if ((have.get(ch) || 0) < count) return false;
  }
  return true;
}

const MATCHERS = {
  startingWith: matchesStartingWith,
  endingWith: matchesEndingWith,
  including: matchesIncluding,
  containingInOrder: matchesContainingInOrder,
};

export const MATCH_MODES = [
  { id: "startingWith", label: "Starting with" },
  { id: "endingWith", label: "Ending with" },
  { id: "including", label: "Including" },
  { id: "containingInOrder", label: "Containing in order" },
];

/** Filter a word list (already the right length-shard, or the full list for "Any Words") by one of the 4 modes. */
export function filterWordsByMode(words, mode, rawLetters) {
  const letters = sanitizeLetters(rawLetters);
  const matcher = MATCHERS[mode];
  if (!matcher || !letters) return [];
  return words.filter((w) => matcher(w, letters));
}

/**
 * Fill-in-the-Blanks: `pattern` is an array of single lowercase letters
 * or null/"" for an open slot. Matches words of exactly pattern.length,
 * where every non-blank position must equal that exact letter.
 */
export function matchesPattern(word, pattern) {
  if (word.length !== pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    if (p && word[i] !== p) return false;
  }
  return true;
}

export function filterWordsByPattern(words, pattern) {
  const hasAnyLetter = pattern.some((p) => !!p);
  if (!hasAnyLetter) return []; // an all-blank pattern isn't a search — matches everything, not useful
  return words.filter((w) => matchesPattern(w, pattern));
}

// Standard English Scrabble letter values — public-domain game rules,
// not proprietary content. Used only for an informational point-value
// display alongside results, never claimed to be an official ranking
// of any specific word game's dictionary validity.
const SCRABBLE_VALUES = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5, l: 1, m: 3,
  n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
};

export function scrabbleScore(word) {
  let score = 0;
  for (const ch of word) score += SCRABBLE_VALUES[ch] || 0;
  return score;
}

export const SORT_OPTIONS = [
  { id: "alphabetical", label: "A-Z" },
  { id: "length", label: "Length (longest first)" },
  { id: "score", label: "Scrabble score (highest first)" },
];

export function sortWords(words, sortBy) {
  const list = [...words];
  if (sortBy === "length") return list.sort((a, b) => b.length - a.length || a.localeCompare(b));
  if (sortBy === "score") return list.sort((a, b) => scrabbleScore(b) - scrabbleScore(a) || a.localeCompare(b));
  return list.sort((a, b) => a.localeCompare(b));
}
