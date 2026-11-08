// GPA Calculator Pakistan engine — matches omnicalculator.com/other/gpa-pakistan (its calculator definition and
// custom JS were read from the page; behaviour checked live, see scripts/gpa-pakistan-calculator.test.js).
//
// Three grading scales, each with its own grade list and its own course rows:
//   University 4-point scale (A 4.0 … F 0, 20 courses), University 5-point scale (A 5 … F 0, 20 courses) and
//   Quaid-e-Azam University (MPhil) (percentage bands 5.0 … 0.0, 10 courses).
// Only courses with both a grade and credit hours count. GPA = Σ grade points × credit hours / Σ credit hours, shown to
// 2 significant figures as the reference does (JavaScript toPrecision(2): 31.2 / 10 = 3.12 → "3.1", 3.15 → "3.1").
// Total points are rounded to 2 decimals. cGPA = (GPA × credit hours + previous GPA × previous credit hours) / total
// credit hours, from the already-rounded GPA, also to 2 significant figures.
// One deliberate difference: when the credit hours add up to 0 the reference shows "Your GPA is NaN."; this
// calculator explains the problem instead.

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

const g = (label, points) => ({ label, points });
export const SCALES = [
  {
    value: "4", label: "University 4-point scale", rows: 20, gradeHeading: "Course grades",
    grades: [g("A", 4.0), g("A-", 3.7), g("B+", 3.3), g("B", 3), g("B-", 2.7), g("C+", 2.3), g("C", 2), g("C-", 1.7), g("D", 1), g("F", 0)],
  },
  {
    value: "5", label: "University 5-point scale", rows: 20, gradeHeading: "Course grades",
    grades: [g("A", 5), g("A-", 4.7), g("B+", 4.3), g("B", 4), g("B-", 3.7), g("C+", 3.3), g("C", 3), g("C-", 2.7), g("D+", 2.3), g("D", 2), g("D-", 1.7), g("F", 0)],
  },
  {
    value: "qau", label: "Quaid-e-Azam University (MPhil)", rows: 10, gradeHeading: "Percentage marks",
    grades: [
      g("95.0 to 99.0 (A)", 5.0), g("93.5 to 94.9 (A)", 4.9), g("92.0 to 93.4 (A)", 4.8), g("90.5 to 91.9 (A)", 4.7), g("89.0 to 90.4 (A)", 4.6),
      g("87.5 to 88.9 (A)", 4.5), g("86.0 to 87.4 (A)", 4.4), g("84.5 to 85.9 (A)", 4.3), g("83.0 to 84.4 (A)", 4.2), g("81.5 to 82.9 (A)", 4.1),
      g("80.0 to 81.4 (A)", 4.0), g("78.5 to 79.9 (B)", 3.9), g("77.0 to 78.4 (B)", 3.8), g("75.5 to 76.9 (B)", 3.7), g("74.0 to 75.4 (B)", 3.6),
      g("72.5 to 73.9 (B)", 3.5), g("71.0 to 72.4 (B)", 3.4), g("69.5 to 70.9 (B)", 3.3), g("68.0 to 69.4 (B)", 3.2), g("66.5 to 67.9 (B)", 3.1),
      g("65.0 to 66.4 (B)", 3.0), g("63.5 to 64.9 (C)", 2.9), g("62.0 to 63.4 (C)", 2.8), g("60.5 to 61.9 (C)", 2.7), g("59.0 to 60.4 (C)", 2.6),
      g("57.5 to 58.9 (C)", 2.5), g("56.0 to 57.9 (C)", 2.4), g("54.5 to 55.9 (C)", 2.3), g("53.0 to 54.4 (C)", 2.2), g("51.5 to 52.9 (C)", 2.1),
      g("50.0 to 51.4 (C)", 2.0), g("< 50.0 (F)", 0.0),
    ],
  },
];
export const scaleOf = (value) => SCALES.find((s) => s.value === value) || SCALES[0];
export const emptyCourse = () => ({ grade: "", credits: "" });

/** "1st", "2nd", "3rd", "4th" … "11th", "12th", "13th", "20th" (the reference's row labels). */
export function ordinal(n) {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
}

/** Rows shown: the first 4 always, then each once the row above has both a grade and credit hours. */
export function visibleRows(scale, courses) {
  let n = Math.min(4, scale.rows);
  while (n < scale.rows && clean(courses[n - 1]?.grade) !== "" && clean(courses[n - 1]?.credits) !== "") n++;
  return n;
}

/** The reference's 2-significant-figure display (JavaScript toPrecision). */
const twoSig = (x) => Number(x.toPrecision(2));

/**
 * input: { scale: "4" | "5" | "qau", courses: [{ grade (label), credits }], cgpa (bool), previousGpa, previousCredits }
 * → { errors } | { gpa (number|null), gpaLine, cgpa (number|null), cgpaLine (null unless both previous values are
 *     entered), courses, totalCredits, totalPoints }
 */
export function calculateGpaPakistan(input) {
  const scale = scaleOf(input.scale);
  const points = Object.fromEntries(scale.grades.map((x) => [x.label, x.points]));
  const errors = [];
  let sumPoints = 0;
  let sumCredits = 0;
  let count = 0;
  (input.courses || []).slice(0, scale.rows).forEach((c, i) => {
    const grade = clean(c.grade);
    const text = clean(c.credits);
    if (text === "") return;
    const credits = num(text);
    if (!Number.isFinite(credits)) { errors.push(`Please enter a valid number for the ${ordinal(i + 1)} credit.`); return; }
    if (!(grade in points)) return;
    sumPoints += points[grade] * credits;
    sumCredits += credits;
    count++;
  });
  const prevGpaText = input.cgpa ? clean(input.previousGpa) : "";
  const prevCreditText = input.cgpa ? clean(input.previousCredits) : "";
  const prevGpa = prevGpaText === "" ? null : num(prevGpaText);
  const prevCredits = prevCreditText === "" ? null : num(prevCreditText);
  if (prevGpaText !== "" && !Number.isFinite(prevGpa)) errors.push("Please enter a valid number for the previous GPA.");
  if (prevCreditText !== "" && !Number.isFinite(prevCredits)) errors.push("Please enter a valid number for the sum of previous credit hours.");
  if (errors.length) return { errors };

  const totals = { courses: count, totalCredits: sumCredits, totalPoints: roundTo(sumPoints, 2) };
  if (count === 0) return { ...totals, gpa: null, gpaLine: "Enter equal grades and credit hours.", cgpa: null, cgpaLine: null };
  if (sumCredits === 0) {
    return { ...totals, gpa: null, gpaLine: "The credit hours add up to 0, so the GPA can't be calculated. Please check your credit hours.", cgpa: null, cgpaLine: null };
  }
  const gpa = twoSig(sumPoints / sumCredits);
  let cgpa = null;
  if (input.cgpa && prevGpa !== null && prevCredits !== null) {
    const value = (gpa * sumCredits + prevGpa * prevCredits) / (sumCredits + prevCredits);
    if (Number.isFinite(value)) cgpa = twoSig(value);
  }
  return { ...totals, gpa, gpaLine: `Your GPA is ${gpa}.`, cgpa, cgpaLine: cgpa === null ? null : `Your cGPA is ${cgpa}.` };
}
