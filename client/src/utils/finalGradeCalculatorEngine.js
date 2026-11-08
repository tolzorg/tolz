// Final Grade Calculator engine — matches omnicalculator.com/other/final-grade (its calculator definition and custom
// JS were read from the page; behaviour checked live, see scripts/final-grade-calculator.test.js).
//
// Two modes:
// 1. Current grade: final exam = (wanted − (1 − w) × current) / w, with w the final exam's weight (0–100% → 0–1).
//    Not rounded before display.
// 2. Previous exams (up to 9): final exam weight = 1 − Σ weights, and
//    final exam = round((wanted − Σ grade × weight) / final exam weight, 2) (mathjs rounding: half away from zero
//    on the number's shortest decimal form). Exam k + 1 appears once exam k has a non-zero grade.
// Grading systems: Numbers (any scale), Percentage (0–100) or a letter system. Letter grades are stored as
// percentages × 100 (A+ = 9825 on the USA standard scale) and the required final-exam value is mapped back to a
// letter by that system's thresholds: above 10000 (100%) is impossible, below 0 is "No grade (0)".
// Numbers are shown with Omni's display rounding (the fewest decimals within 0.01% of the value).
// Percentage: above 100 → "impossible"; Numbers and Percentage: below 0 (current grade) or ≤ 0 (previous exams) →
// "CONGRATULATIONS!", and in Current grade mode a result ≤ 0 also shows the "mathematically passed" warning.
//
// Deliberate deviations from the reference (flagged to the user):
// - Numbers + Current grade: the reference reads the wanted grade as a percentage (80 → 0.8), so it always says
//   "CONGRATULATIONS!". Here the wanted grade is on the same scale as the current grade.
// - Letter systems other than USA Standard: the reference never shows the third exam (its visibility check only
//   looks at the USA Standard and number fields). Here exam 3 appears as soon as exam 2 has a grade, as it does
//   for every other exam.
// - Invalid inputs (out of range, weights over 100%) show their messages and no result; the reference still
//   prints a number. When earlier exams use up 100% of the weight, the reference prints "Infinity" (or nothing
//   for letters); here a plain message explains that the final exam has no weight left.

import { clean, num } from "./marginCalculatorEngine.js";
import { decimalOf, formatDecimal, roundTo } from "./ieltsScoreCalculatorEngine.js";

export const MODES = [
  { value: "current", label: "Current grade" },
  { value: "previous", label: "Previous exams" },
];

const NO_GRADE = "No grade (0)";
const A_MINUS = "A−";

/** Letter systems: dropdown options [label, value (% × 100)] and lower thresholds [min, label], highest first. */
const LETTER_SYSTEMS = {
  usaStandard: {
    options: [["A+", 9825], ["A", 9450], [A_MINUS, 9100], ["B+", 8800], ["B", 8450], ["B−", 8100], ["C+", 7800], ["C", 7450],
      ["C−", 7100], ["D+", 6800], ["D", 6450], ["D−", 6100], ["F", 2975], [NO_GRADE, 0]],
    thresholds: [[9637, "A+"], [9275, "A"], [8950, A_MINUS], [8625, "B+"], [8275, "B"], [7950, "B−"], [7625, "C+"], [7275, "C"],
      [6950, "C−"], [6625, "D+"], [6275, "D"], [4537, "D−"], [0, "F"]],
  },
  usaAdvanced: {
    options: [["A", 9700], ["B", 9000], ["C", 8300], ["D", 7700], ["E/F", 3700], [NO_GRADE, 0]],
    thresholds: [[9350, "A"], [8650, "B"], [8000, "C"], [5700, "D"], [0, "E/F"]],
  },
  canada: {
    options: [["A+", 9750], ["A", 9050], [A_MINUS, 8300], ["B+", 7800], ["B", 7450], ["B−", 7100], ["C+", 6800], ["C", 6450],
      ["C−", 6100], ["D+", 5800], ["D", 5450], ["D−", 5100], ["R", 2450], [NO_GRADE, 0]],
    thresholds: [[9400, "A+"], [8675, "A"], [8050, A_MINUS], [7625, "B+"], [7275, "B"], [6950, "B−"], [6625, "C+"], [6275, "C"],
      [5950, "C−"], [5625, "D+"], [5275, "D"], [3775, "D−"], [0, "R"]],
  },
  gcse: {
    options: [["A*", 9500], ["A", 8450], ["B", 7450], ["C", 6450], ["D", 5450], ["E", 4450], ["Fail", 1950], [NO_GRADE, 0]],
    thresholds: [[8975, "A*"], [7950, "A"], [6950, "B"], [5950, "C"], [4950, "D"], [3200, "E"], [0, "Fail"]],
  },
  australiaSchool: {
    options: [["Band 6", 9500], ["Band 5", 8450], ["Band 4", 7450], ["Band 3", 6450], ["Band 2", 5450], ["Band 1", 2450], [NO_GRADE, 0]],
    thresholds: [[8975, "Band 6"], [7950, "Band 5"], [6950, "Band 4"], [5950, "Band 3"], [3950, "Band 2"], [0, "Band 1"]],
  },
  australiaUniversity: {
    options: [["HD", 9250], ["D", 7950], ["Cr", 6950], ["P", 5700], ["F", 2450], [NO_GRADE, 0]],
    thresholds: [[8600, "HD"], [7450, "D"], [6325, "Cr"], [4075, "P"], [0, "F"]],
  },
  india: {
    options: [["A1", 9550], ["A2", 8550], ["B1", 7550], ["B2", 6550], ["C1", 5550], ["C2", 4550], ["D", 3650], ["E1", 2650], ["E2", 1000], [NO_GRADE, 0]],
    thresholds: [[9050, "A1"], [8050, "A2"], [7050, "B1"], [6050, "B2"], [5050, "C1"], [4100, "C2"], [3150, "D"], [1825, "E1"], [0, "E2"]],
  },
};

export const SYSTEMS = [
  { value: "numbers", label: "Numbers" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "usaStandard", label: "USA Standard" },
  { value: "usaAdvanced", label: "USA (Advanced Program)" },
  { value: "canada", label: "Canada" },
  { value: "gcse", label: "GCSE" },
  { value: "australiaSchool", label: "Australian (Schools)" },
  { value: "australiaUniversity", label: "Australian (University)" },
  { value: "india", label: "India (CCE)" },
];

export const MAX_EXAMS = 9;
export const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"];
export const isLetterSystem = (system) => Boolean(LETTER_SYSTEMS[system]);
/** Dropdown options for a letter system: { value: "9825", label: "A+" }. */
export const letterOptions = (system) => LETTER_SYSTEMS[system].options.map(([label, value]) => ({ value: String(value), label }));

export const IMPOSSIBLE = "I'm sorry, but with your current grades, it is impossible to get the grade you want.";
export const IMPOSSIBLE_LETTER = "I am sorry, but with your current grades it is impossible to get the grade you want.";
export const CONGRATULATIONS = "No matter what you do, you will get your desired grade or higher! Just check the requirements of your particular subject.";
export const PASSED_WARNING = "You have mathematically passed the subject already. Watch out for minimum grade requirements on the final exam.";
export const NO_WEIGHT_LEFT = "Your previous exams already make up 100% of the final grade, so the final exam has no weight left to change it.";

/** The grade for a final-exam value (% × 100) on a letter system: null above 100% (impossible). */
export function toLetter(system, value) {
  if (!Number.isFinite(value) || value > 10000) return null;
  const hit = LETTER_SYSTEMS[system].thresholds.find(([min]) => value >= min);
  return hit ? hit[1] : NO_GRADE;
}

/** mathjs.round(x, 2): half away from zero on the shortest decimal form of x. */
export function round2(x) {
  if (!Number.isFinite(x)) return x;
  const d = decimalOf(String(x));
  return d.s <= 2 ? x : Number(String(roundTo(d, 2).n)) / 100;
}

/** A finite number shown with Omni's display rounding ("88.33", "-10", "103.33"). */
export const formatNumber = (x) => formatDecimal(decimalOf(String(x)));

const parse = (text) => { const t = clean(text); return t === "" ? null : num(t); };
/** A typed number, a letter-dropdown value, or null when blank. NaN when not a number. */
const valueOf = (system, text) => (isLetterSystem(system) ? (text === "" || text == null ? null : Number(text)) : parse(text));
const isBad = (v) => v !== null && !Number.isFinite(v);

/** Which exam rows are showing: the first always, then each one after an exam with a non-zero grade. */
export function visibleExamCount(system, exams) {
  let n = 1;
  while (n < MAX_EXAMS) {
    const g = valueOf(system, exams[n - 1]?.grade ?? "");
    if (g === null || !Number.isFinite(g) || g === 0) break;
    n++;
  }
  return n;
}

function numericOutcome(system, value, mode) {
  const out = { kind: "number", value: Number.isFinite(value) ? formatNumber(value) : null, unit: system === "percentage" ? "%" : "" };
  if (system === "percentage" && value > 100) out.message = { tone: "error", text: IMPOSSIBLE };
  else if (mode === "current" ? value < 0 : value <= 0) out.message = { tone: "success", title: "CONGRATULATIONS!", text: CONGRATULATIONS };
  return out;
}

function letterOutcome(system, value) {
  const letter = toLetter(system, value);
  return letter === null
    ? { kind: "letter", value: null, message: { tone: "error", text: IMPOSSIBLE_LETTER } }
    : { kind: "letter", value: letter };
}

function calculateCurrent({ system, current, wanted, finalWeight }) {
  const letters = isLetterSystem(system);
  const cur = valueOf(system, current);
  const want = valueOf(system, wanted);
  const w = parse(finalWeight);
  const errors = [];
  if (system === "percentage") {
    if (isBad(cur) || cur < 0 || cur > 100) errors.push("Your current grade must be from 0 to 100%.");
    if (isBad(want) || want < 0 || want > 100) errors.push("Your required grade must be from 0 to 100%.");
  } else if (!letters) {
    if (isBad(cur) || cur < 0) errors.push("You cannot have a negative grade.");
    if (isBad(want) || want < 0) errors.push("The required (passing) grade must be greater than zero.");
  }
  if (isBad(w) || !(w > 0 && w <= 100)) errors.push("The weight of the final exam must be between 0% to 100%.");
  if (errors.length) return { errors };

  const fw = w / 100;
  const value = (want - (1 - fw) * cur) / fw;
  if (letters) return { ...letterOutcome(system, value), warnings: [] };
  return { ...numericOutcome(system, value, "current"), warnings: value <= 0 ? [PASSED_WARNING] : [] };
}

function calculatePrevious({ system, exams, wanted }) {
  const letters = isLetterSystem(system);
  const count = visibleExamCount(system, exams);
  const errors = [];
  let weightSum = 0;
  let earned = 0;
  for (let i = 0; i < count; i++) {
    const g = valueOf(system, exams[i]?.grade ?? "");
    const wt = parse(exams[i]?.weight ?? "");
    if (system === "percentage" && (isBad(g) || g < 0 || g > 100)) {
      errors.push(`The percentage must be from ${i === 0 ? "0%" : "0"} to 100%. Check the grade on exam number ${i + 1}.`);
    } else if (isBad(g)) {
      errors.push(`Please enter a number for the grade on exam number ${i + 1}.`);
    }
    if (isBad(wt) || wt < 0 || wt > 100) errors.push(`The percentage must be from 0% to 100%. Check the weight of exam ${i + 1}.`);
    weightSum += (wt ?? 0) / 100;
    earned += ((wt ?? 0) / 100) * (g ?? 0);
  }
  // The reference sums the weights exactly; rounding to 12 decimals removes float noise (10% + 20% + 70% → exactly 0 left).
  const finalWeight = Math.round((1 - weightSum) * 1e12) / 1e12;
  if (!errors.length && finalWeight < 0) errors.push("The sum of all the weights must be from 0 to 100%, please fix it.");
  const want = valueOf(system, wanted);
  if (isBad(want)) errors.push("Please enter a number for the final grade you want.");
  if (errors.length) return { errors };

  const base = { count, finalWeight: formatNumber(round2(finalWeight * 100)), warnings: [] };
  if (finalWeight === 0) return { ...base, kind: letters ? "letter" : "number", value: null, message: { tone: "info", text: NO_WEIGHT_LEFT } };
  // The wanted grade is optional here (as on the reference): left blank, only the final exam's weight is shown.
  if (want === null) return { ...base, kind: letters ? "letter" : "number", value: null };
  const value = round2((want - earned) / finalWeight);
  return { ...base, ...(letters ? letterOutcome(system, value) : numericOutcome(system, value, "previous")) };
}

/**
 * @param {{ mode: "current"|"previous", system: string, current?: string, wanted: string, finalWeight?: string,
 *   exams?: { grade: string, weight: string }[] }} input  grades as typed (letter systems: the dropdown value, % × 100);
 *   weights in %.
 * @returns {{ errors: string[] } | { kind: "number"|"letter", value: string|null, unit?: string, message?: { tone, title?, text },
 *   warnings: string[], finalWeight?: string, count?: number }}
 */
export function calculateFinalGrade(input) {
  return input.mode === "current" ? calculateCurrent(input) : calculatePrevious({ ...input, exams: input.exams || [] });
}
