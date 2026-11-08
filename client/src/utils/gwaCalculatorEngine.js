// GWA (General Weighted Average) Calculator engine — matches omnicalculator.com/other/gwa (its calculator definition
// and custom JS were read from the page; behaviour checked live, see scripts/gwa-calculator.test.js).
//
// Four grading systems, each with its own 30 course rows (grade + units):
//   Grade Point Scale (1.00 - 5.00) (the default), Grade Point Scale (4.00 - 1.00),
//   Letter (A, A-, B+, ...) and Letter (A, B+, B, ...); the letter systems also give an equivalent letter grade.
// GWA = Σ grade × units (rows with both) / Σ units (EVERY row with units, graded or not — so units without a grade
// lower the GWA, as on the reference), rounded to 2 decimals. Any negative units replace the result with the
// reference's message. One deliberate difference: when a letter system's GWA falls below its lowest letter, the
// reference prints "…a letter grade of here."; this calculator says it is below the lowest letter grade.

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { visibleRows as revealRows } from "./collegeGpaCalculatorEngine.js";

const grades = (pairs) => pairs.map(([label, points]) => ({ label, points }));
export const MAX_COURSES = 30;
export const SYSTEMS = [
  {
    value: "gps5", label: "Grade Point Scale (1.00 - 5.00)",
    grades: grades([["1.00", 1], ["1.25", 1.25], ["1.50", 1.5], ["1.75", 1.75], ["2.00", 2], ["2.25", 2.25], ["2.50", 2.5], ["2.75", 2.75], ["3.00", 3], ["5.00", 5]]),
  },
  {
    value: "gps4", label: "Grade Point Scale (4.00 - 1.00)",
    grades: grades([["4.00", 4], ["3.50", 3.5], ["3.00", 3], ["2.50", 2.5], ["2.00", 2], ["1.50", 1.5], ["1.00", 1], ["0.00", 0]]),
  },
  {
    value: "letter1", label: "Letter (A, A-, B+, ...)",
    grades: grades([["A", 4], ["A-", 3.7], ["B+", 3.3], ["B", 3], ["B-", 2.7], ["C+", 2.3], ["C", 2], ["C-", 1.7], ["D+", 1.3], ["D", 1], ["D-", 0.7]]),
    // Lowest GWA for each letter (the reference's thresholds), best first.
    letters: [[4, "A"], [3.7, "A-"], [3.3, "B+"], [3, "B"], [2.7, "B-"], [2.3, "C+"], [2, "C"], [1.7, "C-"], [1.3, "D+"], [1, "D"], [0.7, "D-"]],
  },
  {
    value: "letter2", label: "Letter (A, B+, B, ...)",
    grades: grades([["A", 4], ["B+", 3.5], ["B", 3], ["C+", 2.5], ["C", 2], ["D+", 1.5], ["D", 1], ["F", 0]]),
    letters: [[4, "A"], [3.5, "B+"], [3, "B"], [2.5, "C+"], [2, "C"], [1.5, "D+"], [1, "D"], [0, "F"]],
  },
];
export const systemOf = (value) => SYSTEMS.find((s) => s.value === value) || SYSTEMS[0];
export const emptyCourse = () => ({ grade: "", credits: "" });

/** Rows shown (the reference's rule, as in the College GPA calculator): 2, then more as the last rows fill in. */
export const visibleRows = (system, courses) =>
  revealRows(courses, MAX_COURSES, (c) => c && systemOf(system.value).grades.some((x) => x.label === clean(c.grade)));

/**
 * input: { system: value, courses: [{ grade (label), credits (units) }] }
 * → { errors } | { gwa (number|null), gwaLine, letter (string|null), letterLine (null for the grade point systems), negative }
 */
export function calculateGwa(input) {
  const system = systemOf(input.system);
  const points = Object.fromEntries(system.grades.map((x) => [x.label, x.points]));
  const errors = [];
  let score = 0;
  let units = 0;
  let negative = false;
  (input.courses || []).slice(0, MAX_COURSES).forEach((c, i) => {
    const text = clean(c.credits);
    if (text === "") return;
    const u = num(text);
    if (!Number.isFinite(u)) { errors.push(`Please enter a valid number for the units of course #${i + 1}.`); return; }
    if (u < 0) negative = true;
    units += u;
    if (clean(c.grade) in points) score += u * points[clean(c.grade)];
  });
  if (errors.length) return { errors };

  const hasLetters = Boolean(system.letters);
  if (negative) {
    return {
      gwa: null, letter: null, negative,
      gwaLine: "Please enter your grades and positive values for the course units, and expect your GWA here.",
      letterLine: hasLetters ? "You'll also see its equivalent letter grade here." : null,
    };
  }
  if (units === 0) {
    return {
      gwa: null, letter: null, negative,
      gwaLine: "Please enter your grades and positive values for their corresponding units to expect your GWA here.",
      letterLine: hasLetters ? "You'll also see its equivalent letter grade here." : null,
    };
  }
  const gwa = roundTo(score / units, 2);
  const letter = hasLetters ? (system.letters.find(([min]) => gwa >= min) || [null, null])[1] : null;
  let letterLine = null;
  if (hasLetters) {
    letterLine = letter
      ? `That is equivalent to a letter grade of ${letter}.`
      : `That is below the lowest letter grade (${system.letters[system.letters.length - 1][1]}).`;
  }
  return { gwa, letter, negative, gwaLine: `Your general weighted average is ${gwa}.`, letterLine };
}
