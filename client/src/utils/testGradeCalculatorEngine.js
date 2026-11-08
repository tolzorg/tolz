// Test Grade Calculator engine — matches omnicalculator.com/other/test-grade (its calculator definition, table code
// and custom JS were read from the page; behaviour checked live, see scripts/test-grade-calculator.test.js).
//
// Two equations link the four boxes, so any two give the other two:
//   points = wrong + correct          percentage = 100 × correct / points
// When more than two boxes are filled, the two typed most recently are kept and the others recalculated (live:
// the reference recalculates the box typed least recently). The percentage alone is enough for a letter grade.
// Percentage is rounded to 2 decimals (half away from zero); the other solved boxes use Omni's display rounding.
// The maths is exact decimals, like Omni's.
//
// "The grade is …": the reference lists 13 variants (≤ 100 → A/A+, < A+ limit → A, < A limit → A-, … < D- limit →
// F) and shows the LAST one whose condition holds, on the unrounded percentage (96.996% shows as 97% but is an A).
// Above 100% none holds: the sentence has no grade.
// Grade table: rows from the points down to 0 in steps of the increment, computed in JS floats exactly like the
// reference (0.5, 0.3, 0.09999999999999998 → shown as 0.1), each with mathjs.round(…, 2) and a letter from the
// ≥-limit scale (A+ at the top here).
// Limits whose order is wrong get the reference's messages but are still used (live).
//
// Deviations (flagged to the user): wrong + percentage is solved here (the reference leaves points and correct
// blank); an increment of exactly 0.1 makes a table (the reference's code needs > 0.1 although its message allows
// 0.1); the table stops at 1,000 rows to keep the page responsive.

import { clean } from "./marginCalculatorEngine.js";
import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { add, sub, mul, div, HUNDRED, isZero, sign, round2, formatPlain } from "./semesterGradeCalculatorEngine.js";
import { round2 as mathRound2 } from "./finalGradeCalculatorEngine.js";

export const FIELDS = ["total", "wrong", "right", "percentage"];
export const LIMITS = [
  ["Aplus", "A+", "97"], ["A", "A", "93"], ["Aminus", "A-", "90"], ["Bplus", "B+", "87"], ["B", "B", "83"], ["Bminus", "B-", "80"],
  ["Cplus", "C+", "77"], ["C", "C", "73"], ["Cminus", "C-", "70"], ["Dplus", "D+", "67"], ["D", "D", "63"], ["Dminus", "D-", "60"],
];
export const DEFAULT_LIMITS = Object.fromEntries(LIMITS.map(([key, , value]) => [key, value]));
export const MAX_TABLE_ROWS = 1000;

const MESSAGES = {
  total: "Number of points or questions must be greater than 0.",
  wrongNegative: "Number wrong cannot be negative.",
  rightNegative: "Number right cannot be negative.",
  percentage: "Percentage grade must be between 0% and 100%, inclusively.",
  wrongTooBig: "Number wrong cannot be greater than the total number of questions.",
  rightTooBig: "Number correct cannot be greater than the total number of questions.",
};
export const INCREMENT_MESSAGE = "Such small increment may produce a big table. Use a value of 0.1 or larger.";

/** The reference's limit-order checks, in its order: [higher, lower, message]. */
const ORDER_CHECKS = [
  ["Aplus", "A", "A+ limit must be higher or equal to A limit."], ["A", "Aminus", "A limit must be higher or equal to A- limit."],
  ["C", "Cminus", "C limit must be higher or equal to C- limit."], ["D", "Dminus", "D limit must be higher or equal to D- limit."],
  ["Bplus", "B", "B+ limit must be higher or equal to B limit."], ["Cplus", "C", "C+ limit must be higher or equal to C limit."],
  ["Bminus", "Cplus", "B- limit must be higher or equal to C+ limit."], ["Cminus", "Dplus", "C- limit must be higher or equal to D+ limit."],
  ["Aminus", "Bplus", "A- limit must be higher or equal to B+ limit."], ["B", "Bminus", "B limit must be higher or equal to B- limit."],
  ["Dplus", "D", "D+ limit must be higher or equal to D limit."],
];

/** An exact decimal as the nearest JS number (correctly rounded, so exactly 97% stays 97). */
const toNumber = (d) => Number(`${d.n}e-${d.s}`);
const num = (text) => { const d = decimalOf(clean(text)); return d === null ? NaN : toNumber(d); };
/** Limits as numbers (a blank or invalid limit counts as missing: NaN, so no comparison holds). */
const limitNumbers = (limits) => Object.fromEntries(LIMITS.map(([key]) => [key, num(limits[key] ?? "")]));

/** Messages for limits in the wrong order (shown, but the limits are still used). */
export function limitAlerts(limits) {
  const l = limitNumbers(limits);
  return ORDER_CHECKS.filter(([hi, lo]) => !(l[hi] >= l[lo])).map(([, , m]) => m);
}

/** The sentence's grade: the last of the reference's 13 variants whose condition holds, or null above 100%. */
export function sentenceGrade(percentage, limits) {
  const l = limitNumbers(limits);
  const variants = [[percentage <= 100, "A/A+"], ...LIMITS.map(([key], i) => [percentage < l[key], i < LIMITS.length - 1 ? LIMITS[i + 1][1] : "F"])];
  let grade = null;
  for (const [holds, label] of variants) if (holds) grade = label;
  return grade;
}

/** The table's grade: the first limit the (rounded) percentage reaches, F below all. */
export function tableGrade(percentage, limits) {
  const l = limitNumbers(limits);
  const hit = LIMITS.find(([key]) => percentage >= l[key]);
  return hit ? hit[1] : "F";
}

/**
 * Grade table rows [right, wrong, percentage, grade] for `total` points in steps of `increment`, or null.
 * @returns {{ rows: string[][], truncated: boolean } | null}
 */
export function gradeTable(totalText, incrementText, limits) {
  const total = num(totalText);
  const increment = num(incrementText);
  if (!(total > 0) || !(increment >= 0.1)) return null;
  const rows = [];
  for (let row = total; row >= 0; row -= increment) {
    if (rows.length === MAX_TABLE_ROWS) return { rows, truncated: true };
    const pct = mathRound2((100 * row) / total);
    rows.push([String(mathRound2(row)), String(mathRound2(total - row)), `${pct}%`, tableGrade(pct, limits)]);
  }
  return { rows, truncated: false };
}

/** Solve the two unknown boxes from two known ones (exact decimals). Returns the four values or an error. */
function solvePair(k) {
  const { total: t, wrong: w, right: r, percentage: p } = k;
  if (t && w) { const right = sub(t, w); return { total: t, wrong: w, right, percentage: isZero(t) ? null : div(mul(right, HUNDRED), t) }; }
  if (t && r) return { total: t, wrong: sub(t, r), right: r, percentage: isZero(t) ? null : div(mul(r, HUNDRED), t) };
  if (t && p) { const right = div(mul(p, t), HUNDRED); return { total: t, wrong: sub(t, right), right, percentage: p }; }
  if (w && r) { const total = add(w, r); return { total, wrong: w, right: r, percentage: isZero(total) ? null : div(mul(r, HUNDRED), total) }; }
  if (r && p) {
    if (isZero(p)) return { error: isZero(r) ? "With 0 correct and 0%, the number of points can be anything." : MESSAGES.percentage };
    const total = div(mul(r, HUNDRED), p);
    return { total, wrong: sub(total, r), right: r, percentage: p };
  }
  // wrong + percentage: points = wrong / (1 − percentage / 100)
  const rest = sub(HUNDRED, p);
  if (isZero(rest)) return { error: isZero(w) ? "With 0 wrong and 100%, the number of points can be anything." : MESSAGES.wrongNegative };
  const total = div(mul(w, HUNDRED), rest);
  return { total, wrong: w, right: sub(total, w), percentage: p };
}

/**
 * @param {Record<string, string>} values  the four boxes as typed ("" = blank).
 * @param {string[]} order  the typed boxes, least recent first (boxes the calculator filled in are left out).
 * @param {Record<string, string>} limits  the grade scale (%).
 * @returns {{ missing: string[] } | { errors: string[] } | { values, solved: string[], percentage: number|null, grade: string|null,
 *   alerts: string[], tableTotal: string }}  tableTotal: the exact number of points for gradeTable ("" when unknown).
 */
export function calculateTestGrade(values, order, limits) {
  const typed = order.filter((k) => clean(values[k]) !== "");
  const errors = [];
  const parsed = {};
  for (const k of typed) {
    const d = decimalOf(clean(values[k]));
    if (d === null) errors.push(`Please enter a number for ${{ total: "the number of points / questions", wrong: "the number wrong", right: "the number correct", percentage: "the percentage" }[k]}.`);
    else parsed[k] = d;
  }
  if (errors.length) return { errors };

  const alerts = limitAlerts(limits);
  if (typed.length === 1 && typed[0] === "percentage") {
    const pct = toNumber(parsed.percentage);
    const msgs = pct < 0 || pct > 100 ? [MESSAGES.percentage] : [];
    return { values: { total: "", wrong: "", right: "", percentage: clean(values.percentage) }, solved: [], tableTotal: "", percentage: pct, grade: sentenceGrade(pct, limits), alerts: [...msgs, ...alerts] };
  }
  if (typed.length < 2) return { missing: typed.length ? (typed[0] === "right" ? ["total"] : ["right"]) : ["total", "right"] };

  const known = Object.fromEntries(typed.slice(-2).map((k) => [k, parsed[k]]));
  const v = solvePair(known);
  if (v.error) return { errors: [v.error] };
  if (v.percentage === null) return { errors: [MESSAGES.total] };

  const solved = FIELDS.filter((k) => !known[k]);
  const shown = {};
  for (const k of FIELDS) {
    if (!solved.includes(k)) shown[k] = clean(values[k]);
    else shown[k] = k === "percentage" ? formatPlain(round2(v.percentage)) : formatDecimal(v[k]);
  }
  const msgs = [];
  if (sign(v.total) <= 0) msgs.push(MESSAGES.total);
  if (sign(v.wrong) < 0) msgs.push(MESSAGES.wrongNegative);
  if (sign(v.right) < 0) msgs.push(MESSAGES.rightNegative);
  if (sign(v.percentage) < 0 || sign(sub(v.percentage, HUNDRED)) > 0) msgs.push(MESSAGES.percentage);
  if (sign(sub(v.wrong, v.total)) > 0) msgs.push(MESSAGES.wrongTooBig);
  if (sign(sub(v.right, v.total)) > 0) msgs.push(MESSAGES.rightTooBig);
  const pct = toNumber(v.percentage);
  // The grade table uses the exact number of points, not the rounded one in the box (13.3333…, shown as 13.333).
  return { values: shown, solved, percentage: pct, grade: sentenceGrade(pct, limits), alerts: [...msgs, ...alerts], tableTotal: String(toNumber(v.total)) };
}
