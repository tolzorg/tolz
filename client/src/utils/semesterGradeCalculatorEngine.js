// Semester Grade Calculator engine — matches omnicalculator.com/other/semester-grade (its calculator definition was
// read from the page; behaviour checked live, see scripts/semester-grade-calculator.test.js).
//
// Two equations, solved for whatever is left blank:
//   semester grade = 0.01 × (first grade × first weight + second grade × second weight + final grade × final weight)
//   first weight + second weight + final weight = 100  (only used to fill in ONE blank weight)
// So with two weights typed, the third is 100 − the other two; then exactly one of the three grades and the
// semester grade may be blank and is solved from the first equation ("what do I need on my final?"). With all
// three weights typed they need not add up to 100 (the reference's "need to add up to 100%" note is switched off).
// Two blank weights are not solved (live). When nothing in the grade equation is blank, the semester grade is
// recalculated.
// Rounding (as the reference): the semester grade and the final exam grade to 2 decimals (half away from zero);
// the other solved values are shown with Omni's display rounding (the fewest decimals within 0.01%). The maths is
// done in exact decimals, as Omni does (33.33 + 33.33 → 33.34 exactly).
// Every value must be 0–100% ("Value must be between 0% and 100%"): a typed value outside it is an error; a solved
// one is still shown, with the message (e.g. a final exam grade of 210% means the semester grade can't be reached).

import { clean } from "./marginCalculatorEngine.js";
import { decimalOf, formatDecimal, roundTo } from "./ieltsScoreCalculatorEngine.js";

export const PARTS = [
  { key: "first", label: "First quarter", icon: "📕" },
  { key: "second", label: "Second quarter", icon: "📗" },
  { key: "final", label: "Final exam", icon: "🖋️" },
];
export const FIELDS = ["firstGrade", "firstWeight", "secondGrade", "secondWeight", "finalGrade", "finalWeight", "semesterGrade"];
export const RANGE_MESSAGE = "Value must be between 0% and 100%";

const FIELD_LABELS = {
  firstGrade: "First quarter grade", firstWeight: "First quarter weight", secondGrade: "Second quarter grade",
  secondWeight: "Second quarter weight", finalGrade: "Final exam grade", finalWeight: "Final exam weight", semesterGrade: "Semester grade",
};
export const fieldLabel = (key) => FIELD_LABELS[key];

const GRADES = ["firstGrade", "secondGrade", "finalGrade"];
const WEIGHTS = ["firstWeight", "secondWeight", "finalWeight"];
const weightOf = (gradeKey) => gradeKey.replace("Grade", "Weight");
const ROUNDED = new Set(["semesterGrade", "finalGrade"]); // "standard" 2-decimal rounding in the reference

// ── Exact decimals { n: BigInt, s: scale } (also used by the Test Grade Calculator) ──
const pow10 = (k) => 10n ** BigInt(k);
const scaleTo = (a, s) => ({ n: a.n * pow10(s - a.s), s });
export const add = (a, b) => { const s = Math.max(a.s, b.s); return { n: scaleTo(a, s).n + scaleTo(b, s).n, s }; };
const neg = (a) => ({ n: -a.n, s: a.s });
export const sub = (a, b) => add(a, neg(b));
export const mul = (a, b) => ({ n: a.n * b.n, s: a.s + b.s });
/** a / b to 40 decimals (truncated), plenty for 2-decimal or 0.01% display rounding. */
export const div = (a, b, p = 40) => {
  const e = p + b.s - a.s; // a dividend with more than p (+ b.s) decimals is cut down instead of scaled up
  return { n: e >= 0 ? (a.n * pow10(e)) / b.n : a.n / (b.n * pow10(-e)), s: p };
};
export const ZERO = { n: 0n, s: 0 };
export const HUNDRED = { n: 100n, s: 0 };
export const isZero = (a) => a.n === 0n;
export const sign = (a) => (a.n < 0n ? -1 : a.n > 0n ? 1 : 0);
export const toNumber = (a) => Number(a.n) / 10 ** a.s;
export const round2 = (a) => (a.s <= 2 ? a : roundTo(a, 2));

/** A value rounded to 2 decimals, shown without trailing zeros ("3.91", "85", "210"). */
export function formatPlain(a) {
  const digits = (a.n < 0n ? -a.n : a.n).toString().padStart(a.s + 1, "0");
  const int = digits.slice(0, digits.length - a.s).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const frac = digits.slice(digits.length - a.s).replace(/0+$/, "");
  return `${a.n < 0n ? "-" : ""}${int}${frac ? `.${frac}` : ""}`;
}
const outOfRange = (a) => sign(a) < 0 || sign(sub(a, HUNDRED)) > 0;

/**
 * @param {Record<string, string>} values  the seven boxes as typed (blank = to be solved), in %.
 * @returns {{ missing: string[] } | { errors: string[] } | { values: Record<string, string>, numbers: Record<string, number>,
 *   solved: string[], warnings: string[] }}
 */
export function calculateSemesterGrade(values) {
  const known = {};
  const errors = [];
  for (const key of FIELDS) {
    const t = clean(values[key]);
    if (t === "") continue;
    const d = decimalOf(t);
    if (d === null || outOfRange(d)) errors.push(`${FIELD_LABELS[key]}: ${RANGE_MESSAGE}`);
    else known[key] = d;
  }
  if (errors.length) return { errors };

  // Which boxes can't be solved: more than one blank weight, or more than one blank in the grade equation.
  const blankWeights = WEIGHTS.filter((k) => !known[k]);
  const blankGrades = GRADES.filter((k) => !known[k]);
  const missing = blankWeights.slice(0, -1);
  if (known.semesterGrade) missing.push(...blankGrades.slice(0, -1));
  else if (blankGrades.length) missing.push(...blankGrades);
  if (missing.length) return { missing };

  const v = { ...known };
  const solved = [];
  if (blankWeights.length === 1) {
    const [k] = blankWeights;
    v[k] = WEIGHTS.filter((w) => w !== k).reduce((acc, w) => sub(acc, v[w]), HUNDRED);
    solved.push(k);
  }

  const unknown = blankGrades[0] || "semesterGrade";
  if (unknown === "semesterGrade") {
    const sum = GRADES.reduce((acc, g) => add(acc, mul(v[g], v[weightOf(g)])), ZERO);
    v.semesterGrade = round2(div(sum, HUNDRED));
  } else {
    const w = v[weightOf(unknown)];
    if (isZero(w)) return { errors: [`${FIELD_LABELS[weightOf(unknown)]} is 0%, so the ${FIELD_LABELS[unknown].toLowerCase()} can't be calculated.`] };
    const others = GRADES.filter((g) => g !== unknown).reduce((acc, g) => add(acc, mul(v[g], v[weightOf(g)])), ZERO);
    const g = div(sub(mul(v.semesterGrade, HUNDRED), others), w);
    v[unknown] = ROUNDED.has(unknown) ? round2(g) : g;
  }
  solved.push(unknown);

  const shown = {};
  const numbers = {};
  for (const key of FIELDS) {
    numbers[key] = toNumber(v[key]);
    if (!solved.includes(key)) shown[key] = clean(values[key]);
    else shown[key] = ROUNDED.has(key) ? formatPlain(v[key]) : formatDecimal(v[key]);
  }
  const warnings = solved.filter((k) => outOfRange(v[k])).map((k) => `${FIELD_LABELS[k]}: ${RANGE_MESSAGE}`);
  return { values: shown, numbers, solved, warnings };
}
