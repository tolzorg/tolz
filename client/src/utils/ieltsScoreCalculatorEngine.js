// IELTS Score Calculator engine — matches omnicalculator.com/other/ielts-score (its calculator definition and
// custom JS were read from the page; behaviour checked live, see scripts/ielts-score-calculator.test.js).
//
// 1. Overall score: Average = (Listening + Reading + Speaking + Writing) / 4, and
//    IELTS score = floor(2 × Average + 0.5) / 2 (the average to the nearest half band, .25 and .75 rounding up).
//    The equation is solved for whichever one of the five boxes is unknown: with "Show average result" ticked,
//    typing the average and three scores gives the fourth score (4 × Average − the other three).
//    Typed scores must be 0–9 ("Listening score must be between 0 and 9."); the average has no limit. A solved
//    score outside 0–9 is still shown, with that message, and so is the IELTS score.
// 2. Listening band from correct answers (0–40): 0 below 11, then 4 at 11 and +0.5 at 13, 16, 18, 23, 26, 30,
//    32, 35, 37, 39 (9 at 39–40).
// 3. Reading band from correct answers (0–40): General Training is 0 below 6, then 2.5 at 6 and +0.5 at 9, 12,
//    15, 19, 23, 27, 30, 32, 34, 36, 37, 39, 40; Academic is 0 below 4, then 2.5 at 4 and +0.5 at 6, 8, 10, 13,
//    15, 19, 23, 27, 30, 33, 35, 37, 39. Fractional answer counts are compared as typed (10.5 → 0).
// Numbers are shown with Omni's rounding: the fewest decimals whose rounding error is at most 0.01% of the value
// (5.123456 → 5.123, 1.0833 → 1.0833, 3,982.4938 → 3,982.5). Omni does this maths in exact decimals, so the
// average and solved scores here use exact BigInt decimals too (6.2125 stays 6.2125 and shows as 6.213).

import { clean, num } from "./marginCalculatorEngine.js";

export const COMPONENTS = [
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "speaking", label: "Speaking" },
  { key: "writing", label: "Writing" },
];
export const AVERAGE = "average";
export const TESTS = [{ value: "general", label: "General" }, { value: "academic", label: "Academic" }];

const LISTENING_LOWER_LIMIT = [11, 13, 16, 18, 23, 26, 30, 32, 35, 37, 39];
const READING_LOWER_LIMIT = {
  general: [6, 9, 12, 15, 19, 23, 27, 30, 32, 34, 36, 37, 39, 40],
  academic: [4, 6, 8, 10, 13, 15, 19, 23, 27, 30, 33, 35, 37, 39],
};

/** Official band descriptors (whole bands); a half band shows both neighbours. */
export const SKILL_LEVELS = [
  "Did not attempt the test", "Non-user", "Intermittent user", "Extremely limited user", "Limited user",
  "Modest user", "Competent user", "Good user", "Very good user", "Expert user",
];

// ── Exact decimals: { n: BigInt, s } is n / 10^s ──
const TEN = 10n;
const pow10 = (k) => TEN ** BigInt(k);
const scaleTo = (a, s) => a.n * pow10(s - a.s);
const align = (a, b) => { const s = Math.max(a.s, b.s); return [scaleTo(a, s), scaleTo(b, s), s]; };
const add = (a, b) => { const [x, y, s] = align(a, b); return { n: x + y, s }; };
const sub = (a, b) => { const [x, y, s] = align(a, b); return { n: x - y, s }; };
const mulInt = (a, k) => ({ n: a.n * BigInt(k), s: a.s });
const div4 = (a) => ({ n: a.n * 25n, s: a.s + 2 });
const cmp = (a, b) => { const [x, y] = align(a, b); return x < y ? -1 : x > y ? 1 : 0; };
const abs = (x) => (x < 0n ? -x : x);
const ZERO = { n: 0n, s: 0 };
const NINE = { n: 9n, s: 0 };
const toNumber = (a) => Number(a.n) / 10 ** a.s;

/** A typed number as an exact decimal (commas allowed), or null when it is not a finite number
 * (or is longer than 40 characters, which keeps the exact maths fast). */
export function decimalOf(text) {
  const t = clean(text);
  if (t === "" || t.length > 40 || !Number.isFinite(num(t))) return null;
  const m = t.match(/^([+-]?)(\d*)\.?(\d*)(?:e([+-]?\d+))?$/i);
  if (!m) return null;
  const exp = Number(m[4] || 0);
  let n = BigInt(`${m[2] || "0"}${m[3]}`);
  let s = m[3].length - exp;
  if (s < 0) { n *= pow10(-s); s = 0; }
  return { n: m[1] === "-" ? -n : n, s };
}

/** floor(a) as a BigInt. */
const floorDec = (a) => { const d = pow10(a.s); const q = a.n / d; return a.n < 0n && q * d !== a.n ? q - 1n : q; };

/** Round half away from zero to `d` decimals (d ≤ a.s). */
export function roundTo(a, d) {
  const f = pow10(a.s - d);
  const q = abs(a.n) / f;
  const r = abs(a.n) % f;
  const up = r * 2n >= f ? q + 1n : q;
  return { n: a.n < 0n ? -up : up, s: d };
}

/** Omni's display rounding: the fewest decimals whose error is at most 0.01% of the value. */
export function omniRound(a) {
  for (let d = 0; d < a.s; d++) {
    const r = roundTo(a, d);
    const err = abs(sub(a, r).n);           // at scale a.s
    if (err * 10000n <= abs(a.n)) return r;  // err ≤ |a| × 0.0001
  }
  return a;
}

/** "3,982.5", "-22.95", "0.00025": Omni-rounded, en-US grouping, no trailing zeros. */
export function formatDecimal(a) {
  const r = omniRound(a);
  const digits = abs(r.n).toString().padStart(r.s + 1, "0");
  const int = digits.slice(0, digits.length - r.s).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const frac = digits.slice(digits.length - r.s).replace(/0+$/, "");
  return `${r.n < 0n ? "-" : ""}${int}${frac ? `.${frac}` : ""}`;
}

const isBlank = (v) => clean(v) === "";
const labelOf = (key) => (key === AVERAGE ? "Average" : COMPONENTS.find((c) => c.key === key).label);
export const rangeMessage = (key) => `${labelOf(key)} score must be between 0 and 9.`;

/**
 * Which box the equation is solved for.
 * state: { values: { listening, reading, speaking, writing, average }, showAverage,
 *          solved: key last filled in by a calculation (or null), editOrder: keys, least recently typed first }
 * → { unknown } | { missing: keys that must be filled in }
 * Average hidden: the four scores are needed and the average is the unknown. Average shown: any four of the five
 * boxes; a single empty box is the unknown. When all five are filled, the box last filled in by a calculation is
 * recalculated, or (once that has been typed over) the box typed least recently — as Omni does.
 */
export function pickUnknown({ values, showAverage, solved = null, editOrder = [] }) {
  const keys = [...COMPONENTS.map((c) => c.key), ...(showAverage ? [AVERAGE] : [])];
  const blanks = keys.filter((k) => isBlank(values[k]));
  if (!showAverage) return blanks.length ? { missing: blanks } : { unknown: AVERAGE };
  if (blanks.length === 1) return { unknown: blanks[0] };
  if (blanks.length > 1) return { missing: blanks.filter((k) => k !== AVERAGE) };
  if (solved && keys.includes(solved)) return { unknown: solved };
  const rank = (k) => { const i = editOrder.indexOf(k); return i === -1 ? -1 : i; };
  return { unknown: [...keys].sort((a, b) => rank(a) - rank(b))[0] };
}

/** Skill level text for an overall score, or null outside 0–9. */
export function skillLevel(score) {
  if (!(score >= 0 && score <= 9)) return null;
  const lo = Math.floor(score);
  return score === lo ? SKILL_LEVELS[lo] : `${SKILL_LEVELS[lo]} / ${SKILL_LEVELS[lo + 1]}`;
}

/**
 * input: { listening, reading, speaking, writing, average } (strings) and the unknown key (from pickUnknown).
 * → { errors } | { unknown, solved: formatted value of the unknown box, average, overall (formatted),
 *     overallValue (number), warning (solved score outside 0–9, or null) }
 */
export function calculateOverall(values, unknown) {
  const errors = [];
  const known = {};
  for (const key of [...COMPONENTS.map((c) => c.key), AVERAGE]) {
    if (key === unknown) continue;
    const d = decimalOf(values[key]);
    if (d === null) { errors.push(`Please enter a valid number for ${key === AVERAGE ? "the average" : `the ${labelOf(key)} score`}.`); continue; }
    if (key !== AVERAGE && (cmp(d, ZERO) < 0 || cmp(d, NINE) > 0)) errors.push(rangeMessage(key));
    known[key] = d;
  }
  if (errors.length) return { errors };

  let average = known[AVERAGE];
  let solved;
  if (unknown === AVERAGE) {
    average = div4(COMPONENTS.reduce((sum, c) => add(sum, known[c.key]), ZERO));
    solved = average;
  } else {
    solved = COMPONENTS.filter((c) => c.key !== unknown).reduce((acc, c) => sub(acc, known[c.key]), mulInt(average, 4));
  }
  const k = floorDec(add(mulInt(average, 2), { n: 5n, s: 1 }));
  const overall = { n: k * 5n, s: 1 };
  const outOfRange = unknown !== AVERAGE && (cmp(solved, ZERO) < 0 || cmp(solved, NINE) > 0);
  return {
    unknown,
    solved: formatDecimal(solved),
    average: formatDecimal(average),
    overall: formatDecimal(overall),
    overallValue: toNumber(overall),
    warning: outOfRange ? rangeMessage(unknown) : null,
  };
}

/** Band from the number of correct answers: 0 below the first limit, else `start` + 0.5 per limit reached. */
function bandFrom(points, start, limits) {
  let score = points < limits[0] ? 0 : start;
  for (const limit of limits) {
    if (points >= limit) score += 0.5;
    else break;
  }
  return score;
}

const pointsOf = (text, what) => {
  const p = num(clean(text));
  return p >= 0 && p <= 40 ? { p } : { errors: [`${what} correct answers must be between 0 and 40.`] };
};

/** Listening correct answers (0–40) → { band } | { errors }. */
export function listeningBand(text) {
  const r = pointsOf(text, "Listening");
  return r.errors ? r : { band: bandFrom(r.p, 3.5, LISTENING_LOWER_LIMIT) };
}

/** Reading correct answers (0–40) and test ("general" | "academic") → { band } | { errors }. */
export function readingBand(text, test) {
  const r = pointsOf(text, "Reading");
  return r.errors ? r : { band: bandFrom(r.p, 2, READING_LOWER_LIMIT[test === "academic" ? "academic" : "general"]) };
}

/** The score tables as [answers range, band] rows, highest band first (for the page's tables). */
export function bandTable(limits, start, top = 40) {
  const rows = [];
  limits.forEach((lo, i) => {
    const hi = i + 1 < limits.length ? limits[i + 1] - 1 : top;
    rows.push([lo === hi ? `${lo}` : `${lo}-${hi}`, start + 0.5 * (i + 1)]);
  });
  return rows.reverse();
}
export const LISTENING_TABLE = bandTable(LISTENING_LOWER_LIMIT, 3.5);
export const READING_TABLES = { academic: bandTable(READING_LOWER_LIMIT.academic, 2), general: bandTable(READING_LOWER_LIMIT.general, 2) };
