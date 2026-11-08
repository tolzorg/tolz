// Grade Calculator engine — matches omnicalculator.com/other/grade (its calculator definition and custom JS were
// read from the page; behaviour checked live, see scripts/grade-calculator.test.js).
//
// 1 to 15 grades, of one of three types, each with a weight (a decimal, or a percentage = value / 100):
//   Letters    — weighted average of the grade points (A / A+ 4.3 … F 0; "None" is skipped), shown to 2 decimals with
//                its letter (exactly 4.3 is A+, then A ≥ 4, A- ≥ 3.7 … D- ≥ 0.7, else F) and that letter's percentage
//                range from the grading scale: "Your overall grade is B+ (3.35 or 87%-90%)."
//   Percentage — weighted average of the percentages (0% grades are skipped), rounded to a whole %, with its letter
//                from the grading scale: "Your overall grade is 87% (B)."
//   Points     — total points / total maximum, and the weighted percentage Σ(points × weight / max) / Σ weight:
//                "Your overall grade is 63 / 70 (90% or A-)."
// The grading scale's thresholds can be changed; out-of-order thresholds raise the reference's alerts but are still
// used (live). Two deliberate differences: point totals are shown without floating-point noise (the reference
// prints 0.30000000000000004), and the result shows whichever rows are filled in (the reference only shows it when
// one of the first three rows has a grade).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const MAX_GRADES = 15;
export const TYPES = [{ value: "letters", label: "Letters" }, { value: "percentage", label: "Percentage" }, { value: "points", label: "Points" }];
export const LETTER_GRADES = [
  ["A  / A+", 4.3], ["A", 4], ["A-", 3.7], ["B+", 3.3], ["B", 3], ["B-", 2.7], ["C+", 2.3], ["C", 2], ["C-", 1.7],
  ["D+", 1.3], ["D", 1], ["D-", 0.7], ["F", 0], ["None", null],
];
const POINTS = Object.fromEntries(LETTER_GRADES);

/** The grading scale: lowest percentage for each letter (reference defaults). */
export const THRESHOLDS = [
  ["Aplus", "A+", 97], ["A", "A", 93], ["Aminus", "A-", 90], ["Bplus", "B+", 87], ["B", "B", 83], ["Bminus", "B-", 80],
  ["Cplus", "C+", 77], ["C", "C", 73], ["Cminus", "C-", 70], ["Dplus", "D+", 67], ["D", "D", 63], ["Dminus", "D-", 60],
];
export const DEFAULT_SCALE = Object.fromEntries(THRESHOLDS.map(([key, , v]) => [key, String(v)]));
export const emptyRow = () => ({ grade: "", value: "", max: "", weight: "1", unit: "decimal" });

/** Reference alerts for the grading scale (shown, but the values are still used). */
function scaleAlerts(t) {
  const out = [];
  if (t.Aplus > 100) out.push("A+ threshold cannot be greater than 100%.");
  if (!(t.Aplus > t.A)) out.push("A+ threshold must be greater the A threshold.");
  const order = [["Aminus", "A-", "A", "A"], ["Bplus", "B+", "Aminus", "A-"], ["B", "B", "Bplus", "B+"], ["Bminus", "B-", "B", "B"],
    ["Cplus", "C+", "Bminus", "B-"], ["C", "C", "Cplus", "C+"], ["Cminus", "C-", "C", "C"], ["Dplus", "D+", "Cminus", "C-"],
    ["D", "D", "Dplus", "D+"]];
  for (const [k, name, above, aboveName] of order) if (!(t[k] < t[above])) out.push(`${name} threshold must be less than ${aboveName}.`);
  if (!(t.Dminus < t.D)) out.push("D- threshold must be less than the D threshold.");
  if (!(t.Dminus > 0)) out.push("D- threshold must be greater than 0.");
  return out;
}

/** Letter for a GPA-style average (reference: exactly 4.3 is A+). */
export function gpaToLetter(g) {
  if (g === 4.3) return "A+";
  const steps = [[4, "A"], [3.7, "A-"], [3.3, "B+"], [3, "B"], [2.7, "B-"], [2.3, "C+"], [2, "C"], [1.7, "C-"], [1.3, "D+"], [1, "D"], [0.7, "D-"]];
  return (steps.find(([min]) => g >= min) || [0, "F"])[1];
}

/** Letter for a percentage on the grading scale. */
export function percentToLetter(t, pct) {
  const found = THRESHOLDS.find(([key]) => pct >= t[key]);
  return found ? found[1] : "F";
}

/** "87%-90%": the letter's percentage range on the grading scale. */
function letterRange(t, letter) {
  const i = THRESHOLDS.findIndex(([, name]) => name === letter);
  if (letter === "F") return `0%-${t.Dminus}%`;
  return `${t[THRESHOLDS[i][0]]}%-${i === 0 ? 100 : t[THRESHOLDS[i - 1][0]]}%`;
}

const clip = (x) => Number(x.toPrecision(12)); // drop floating-point noise from sums of decimals
const MSG = {
  intro: "Please enter some numbers.",
  negative: "No negative numbers, please.",
  over100: "Percentages shouldn't exceed 100%.",
  weights: "At least one of the weights with a grade must be greater than zero.",
};

/**
 * input: { type, count, rows: [{ grade, value, max, weight, unit: "decimal" | "percent" }], scale: { Aplus … Dminus } }
 * → { errors } | { message } (a reference sentence instead of a result) |
 *   { overall: "B+", detail: "3.35", or: "87%-90%" | null, sentence, percent (number|null), letter, alerts }
 */
export function calculateGrade(input) {
  const errors = [];
  const countText = clean(input.count);
  const count = num(countText);
  if (countText === "" || !Number.isFinite(count) || count < 1 || count > MAX_GRADES) errors.push("Please enter 1 to 15 grades.");
  else if (!Number.isInteger(count)) errors.push("Grades number should be an integer.");
  const t = {};
  for (const [key, name] of THRESHOLDS) {
    const v = num(clean(input.scale?.[key] ?? DEFAULT_SCALE[key]));
    if (!Number.isFinite(v)) errors.push(`Please enter a valid ${name} threshold.`);
    t[key] = v;
  }
  const rows = (input.rows || []).slice(0, Number.isInteger(count) ? count : 0);
  const parse = (text) => (clean(text) === "" ? undefined : num(clean(text)));
  const parsed = rows.map((r, i) => {
    const bad = (what) => errors.push(`Please enter a valid number for the #${i + 1} ${what}.`);
    const w = parse(r.weight);
    if (Number.isNaN(w)) bad("weight");
    let value;
    if (input.type === "letters") value = r.grade === "None" ? 100 : POINTS[r.grade] ?? undefined; // "None" (100) is skipped below
    else { value = parse(r.value); if (Number.isNaN(value)) bad(input.type === "points" ? "points" : "grade"); }
    const max = input.type === "points" ? parse(r.max) : undefined;
    if (Number.isNaN(max)) bad("max points");
    return { value, max, weight: w === undefined ? undefined : r.unit === "percent" ? w / 100 : w };
  });
  if (input.type === "points") {
    parsed.forEach((r, i) => { if (r.value !== undefined && r.max !== undefined && r.value > r.max) errors.push(`The number of points in course ${i + 1} cannot exceed the maximum.`); });
  }
  if (errors.length) return { errors };
  const alerts = scaleAlerts(t);

  let total = 0;
  let weights = 0;
  let any = false;
  if (input.type === "letters") {
    for (const r of parsed) {
      if (r.value < 0 || r.weight < 0) return { message: MSG.negative, alerts };
      if (r.value !== undefined && r.weight !== undefined && r.value !== 100) { total += r.value * r.weight; weights += r.weight; any = true; }
    }
    if (!any) return { message: MSG.intro, alerts };
    const average = roundTo(total / weights, 14);
    if (Number.isNaN(average)) return { message: MSG.weights, alerts };
    const letter = gpaToLetter(average);
    const detail = String(roundTo(average, 2));
    const range = letterRange(t, letter);
    return { overall: letter, detail, or: range, letter, percent: null, sentence: `Your overall grade is ${letter} (${detail} or ${range}).`, alerts };
  }
  if (input.type === "percentage") {
    for (const r of parsed) {
      if (r.value < 0 || r.weight < 0) return { message: MSG.negative, alerts };
      if (r.value > 100) return { message: MSG.over100, alerts };
      if (r.value > 0 && r.weight >= 0) { total += r.value * r.weight; weights += r.weight; any = true; }
    }
    if (!any) return { message: MSG.intro, alerts };
    const average = total / weights;
    if (Number.isNaN(average)) return { message: MSG.weights, alerts };
    const letter = percentToLetter(t, average);
    const pct = roundTo(average, 0);
    return { overall: `${pct}%`, detail: null, or: null, letter, percent: pct, sentence: `Your overall grade is ${pct}% (${letter}).`, alerts };
  }
  // Points
  let maxTotal = 0;
  let weighted = 0;
  for (const r of parsed) {
    if (r.value < 0 || r.weight < 0 || r.max < 0) return { message: MSG.negative, alerts };
    if (r.value > 0 && r.weight > 0 && r.max > 0) { total += r.value; maxTotal += r.max; weights += r.weight; weighted += (r.value * r.weight) / r.max; any = true; }
  }
  if (!any) return { message: MSG.intro, alerts };
  const pctRaw = weights !== 0 ? (weighted / weights) * 100 : 0;
  const letter = percentToLetter(t, pctRaw);
  const pct = roundTo(pctRaw, 0);
  const score = `${clip(total)} / ${clip(maxTotal)}`;
  return { overall: score, detail: `${pct}%`, or: letter, letter, percent: pct, sentence: `Your overall grade is ${score} (${pct}% or ${letter}).`, alerts };
}
