// ACT Score Calculator engine — matches omnicalculator.com/other/act-score (its calculator definition and
// conversion tables were read from the page; see scripts/act-score-calculator.test.js).
//
// Each section's raw score (correct answers) converts to a scaled score 1–36 with the reference's tables.
// Composite = (English + Math + Reading + Science) / 4, shown rounded to a whole number (half up: 27.5 → 28).
// As on the reference, the percentile sentence and the "great result" line read the UNROUNDED average: an
// average of 27.5 shows "A composite ACT score of 28 places you in the 87th percentile" (the 27 bracket), and the
// congratulations line needs an average of at least 23.

/** Scaled score for raw scores max, max-1, …, 0 (the reference's dropdown tables). */
const ENGLISH = [36, 36, 36, 36, 35, 35, 34, 34, 33, 32, 31, 30, 29, 29, 28, 27, 26, 26, 25, 25, 24, 24, 24, 23, 23, 22, 22, 22, 21, 21, 21, 20, 20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 12, 11, 11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 7, 7, 6, 6, 5, 4, 4, 3, 2, 1, 1];
const MATH = [36, 36, 36, 35, 35, 34, 34, 33, 32, 32, 31, 31, 30, 29, 29, 28, 28, 27, 27, 27, 26, 26, 25, 25, 24, 24, 23, 23, 22, 22, 21, 20, 20, 19, 19, 18, 18, 17, 17, 17, 16, 16, 16, 16, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 12, 11, 10, 8, 6, 4, 1];
const READING = [36, 36, 35, 34, 33, 33, 32, 31, 29, 28, 27, 26, 25, 24, 23, 22, 22, 21, 20, 20, 19, 18, 17, 17, 16, 15, 15, 14, 14, 13, 12, 12, 11, 11, 10, 9, 7, 6, 4, 2, 1];
const SCIENCE = [36, 36, 36, 35, 34, 33, 32, 30, 29, 28, 26, 25, 25, 24, 24, 23, 22, 22, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 4, 3, 1];

const section = (key, name, label, subject, table) => ({ key, name, label, max: table.length - 1, table, help: `Input the number of correct answers from your ${subject} section.` });

export const ACT_SECTIONS = [
  section("english", "English", "English raw score", "English", ENGLISH),
  section("math", "Math", "Mathematics raw score", "math", MATH),
  section("reading", "Reading", "Reading raw score", "reading", READING),
  section("science", "Science", "Science raw score", "science", SCIENCE),
];

/** Dropdown options for a section, highest raw score first (as on the reference). */
export const rawOptions = (s) => Array.from({ length: s.max + 1 }, (_, i) => String(s.max - i));

/** Scaled score (1–36) for a raw score. */
export const scaledScore = (s, raw) => s.table[s.max - raw];

/** Lowest unrounded average for each percentile, best first; below 11 is the 1st percentile. */
const PERCENTILES = [
  [36, "100th"], [34, "99th"], [33, "98th"], [32, "97th"], [31, "95th"], [30, "94th"], [29, "92nd"], [28, "90th"], [27, "87th"],
  [26, "85th"], [25, "81st"], [24, "78th"], [23, "74th"], [22, "69th"], [21, "64th"], [20, "59th"], [19, "53rd"], [18, "47th"],
  [17, "41st"], [16, "35th"], [15, "28th"], [14, "22nd"], [13, "14th"], [12, "8th"], [11, "3rd"],
];
export const percentileFor = (average) => (PERCENTILES.find(([min]) => average >= min) || [0, "1st"])[1];

/** The percentile for each whole composite score, 36 → 1 (for the page's table). */
export const PERCENTILE_TABLE = Array.from({ length: 36 }, (_, i) => [36 - i, percentileFor(36 - i)]);

/**
 * values: { english, math, reading, science } raw scores as option strings (all chosen) → { errors } |
 * { sections: [{ name, raw, scaled }], average, composite, percentile, great }
 */
export function calculateAct(values) {
  const errors = [];
  const sections = [];
  for (const s of ACT_SECTIONS) {
    const raw = Number(values[s.key]);
    if (values[s.key] === "" || !Number.isInteger(raw) || raw < 0 || raw > s.max) errors.push(`Please choose a valid ${s.name} raw score.`);
    else sections.push({ name: s.name, raw, scaled: scaledScore(s, raw) });
  }
  if (errors.length) return { errors };
  const average = sections.reduce((sum, s) => sum + s.scaled, 0) / 4; // a multiple of 0.25, exact
  return { sections, average, composite: Math.floor(average + 0.5), percentile: percentileFor(average), great: average >= 23 };
}
