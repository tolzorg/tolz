// Reusable abbreviation dictionary for sentence-boundary detection.
// Any future text tool that needs to avoid splitting sentences on
// "Dr. Smith" / "e.g. this" / "U.S. policy" style abbreviations can import
// these sets directly instead of re-deriving them.

// Titles/personal abbreviations — a period after one of these is essentially
// never a sentence end, since a name always follows ("Dr. Smith arrived.").
export const TITLE_ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "mt",
  "gen", "rev", "capt", "sgt", "col", "lt", "hon", "gov",
]);

// General abbreviations — these can legitimately end a sentence, so a
// following capital letter is treated as ambiguous (kept as a boundary)
// while a lowercase/digit continuation is merged back ("Fig. 3 shows...").
export const GENERAL_ABBREVIATIONS = new Set([
  "no", "dept", "inc", "ltd", "co", "corp",
  "u.s", "u.k", "e.u", "e.g", "i.e", "etc", "vs", "fig", "vol", "approx",
]);

export const ALL_ABBREVIATIONS = new Set([
  ...TITLE_ABBREVIATIONS,
  ...GENERAL_ABBREVIATIONS,
]);

// Strips a trailing period and lowercases, e.g. "Dr." -> "dr", "U.S." -> "u.s"
export function normalizeAbbreviationToken(token) {
  return token.trim().replace(/\.+$/, "").toLowerCase();
}

export function isTitleAbbreviation(token) {
  return TITLE_ABBREVIATIONS.has(normalizeAbbreviationToken(token));
}

export function isGeneralAbbreviation(token) {
  return GENERAL_ABBREVIATIONS.has(normalizeAbbreviationToken(token));
}
