// College GPA Calculator engine — matches omnicalculator.com/other/college-gpa (its calculator definition and
// custom JS were read from the page; behaviour checked live, see scripts/college-gpa-calculator.test.js).
//
// Up to 30 courses, each a letter grade (the GPA calculator's scale: A+ 4.3 … E/F 0) and its credits.
// GPA = Σ grade × credits / Σ credits, rounded to 2 decimals. As on the reference, an empty box counts as 0 in
// the sums: credits without a grade add those credits at 0 points; a grade without credits adds nothing.
// Which sentence shows (reference order of checks):
//   sum of credits (with prior credits) ≤ 0  → "The sum of the credits must result in a number greater than zero."
//   course credits sum to 0                  → "Expect your calculated GPA here." (or "Please enter your course
//                                               grades…" when prior results are entered)
//   course credits ≥ 1 or < 0                → "Your GPA is …"
//   0 < course credits < 1                   → "Expect your calculated GPA here." (reference behaviour)
// Cumulative GPA = (Σ grade × credits + prior GPA × prior credits) / (prior credits + Σ credits), from the
// unrounded sums. Prior-result alerts are shown but the values are still used (live).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { GRADES } from "./gpaCalculatorEngine.js";

export const MAX_COURSES = 30;
/** The reference labels A+ as "(A+)". */
export const GRADE_OPTIONS = GRADES.map(([g]) => ({ value: g, label: g === "A+" ? "(A+)" : g }));
const GRADE_POINTS = Object.fromEntries(GRADES);
export const emptyCourse = () => ({ grade: "", credits: "" });

const filledGrade = (c) => c && clean(c.grade) in GRADE_POINTS;
const filledCredits = (c) => c && clean(c.credits) !== "";

/** Rows shown: 1 and 2 always; row k (k ≥ 3) once any row from k-1 on has a grade AND any has credits.
 * Shared with the GWA calculator, which passes its own row count and grade check. */
export function visibleRows(courses, max = MAX_COURSES, hasGrade = filledGrade) {
  let n = 2;
  for (let k = 3; k <= max; k++) {
    const rest = courses.slice(k - 2);
    if (rest.some(hasGrade) && rest.some(filledCredits)) n = k;
  }
  return n;
}

const TICK = 'Please tick the "Calculate your cumulative GPA" checkbox for your cumulative GPA.';
const ENTER_PRIOR = "Please enter your prior GPA and prior total credits for your cumulative GPA.";
const SUM_ZERO = "The sum of the credits must result in a number greater than zero.";
const EXPECT = "Expect your calculated GPA here.";
const ENTER_COURSES = "Please enter your course grades and their corresponding credits to expect your GPA here.";

/**
 * input: { courses: [{ grade, credits }], cumulative, priorGpa, priorCredits }
 * → { errors } | { count, gpa (number|null), gpaLine, cumulative (number|null), cumulativeLine, warnings, alerts }
 */
export function calculateCollegeGpa(input) {
  const errors = [];
  const rows = (input.courses || []).slice(0, MAX_COURSES).map((c, i) => {
    const text = clean(c.credits);
    const credits = text === "" ? null : num(text);
    if (text !== "" && !Number.isFinite(credits)) errors.push(`Please enter a valid number for #${i + 1} Credits.`);
    return { hasGrade: filledGrade(c), points: filledGrade(c) ? GRADE_POINTS[clean(c.grade)] : 0, hasCredits: credits !== null, credits: credits ?? 0 };
  });
  const gpaText = input.cumulative ? clean(input.priorGpa) : "";
  const creditText = input.cumulative ? clean(input.priorCredits) : "";
  const priorGpa = gpaText === "" ? null : num(gpaText);
  const priorCredits = creditText === "" ? null : num(creditText);
  if (gpaText !== "" && !Number.isFinite(priorGpa)) errors.push("Please enter a valid number for the prior GPA.");
  if (creditText !== "" && !Number.isFinite(priorCredits)) errors.push("Please enter a valid number for the total credits of prior GPA.");
  if (errors.length) return { errors };

  const alerts = [];
  if (priorGpa !== null && priorGpa > 4.3) alerts.push("GPA score shouldn't exceed 4.0 (or 4.3 in extended grading scale).");
  if (priorGpa !== null && priorGpa < 0) alerts.push("GPA score can't be lower than 0.");
  if (priorCredits !== null && !(priorCredits > 0)) alerts.push("Total credits must be greater than zero.");

  const score = rows.reduce((s, r) => s + r.points * r.credits, 0);
  const credits = rows.reduce((s, r) => s + r.credits, 0);
  const count = rows.filter((r) => r.hasGrade).length;
  const gpa = credits !== 0 ? roundTo(score / credits, 2) : null;
  const hasPrior = priorGpa !== null && priorCredits !== null;
  const cumulativeValue = () => roundTo((score + priorGpa * priorCredits) / (priorCredits + credits), 2);

  let gpaLine;
  let shownGpa = null;
  let cumulative = null;
  let cumulativeLine;
  if (credits + (priorCredits ?? 0) <= 0) {
    gpaLine = SUM_ZERO;
    cumulativeLine = !input.cumulative ? TICK : hasPrior ? "Please double-check your inputs for correct results." : ENTER_PRIOR;
  } else if (credits === 0) {
    gpaLine = input.cumulative ? ENTER_COURSES : EXPECT;
    if (input.cumulative && hasPrior) { cumulative = cumulativeValue(); cumulativeLine = `Your cumulative GPA is ${cumulative}.`; }
    else cumulativeLine = input.cumulative ? ENTER_PRIOR : TICK;
  } else if (credits >= 1 || credits < 0) {
    shownGpa = gpa;
    gpaLine = `Your GPA is ${gpa}.`;
    if (!input.cumulative) cumulativeLine = TICK;
    else if (!hasPrior) cumulativeLine = ENTER_PRIOR;
    else { cumulative = cumulativeValue(); cumulativeLine = `Your cumulative GPA is ${cumulative}.`; }
  } else {
    gpaLine = EXPECT;
    cumulativeLine = TICK;
  }

  // Credit messages, in the reference's order; of the two negative-credit variants the later one shows.
  const warnings = [];
  const weightNoGrade = rows.some((r) => !r.hasGrade && r.hasCredits);
  const gradeNoWeight = rows.some((r) => r.hasGrade && !r.hasCredits);
  const negative = rows.some((r) => r.hasCredits && r.credits < 0);
  const missing = count - rows.filter((r) => r.hasCredits).length;
  if (weightNoGrade) warnings.push("The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation.");
  if (negative) warnings.push(weightNoGrade ? "Also, course credits cannot be negative." : "Course credits cannot be negative.");
  if (gradeNoWeight) {
    warnings.push(`The results may be wrong due to incomplete inputs.${missing > 0
      ? ` You missed entering ${missing} credit ${missing === 1 ? "input" : "inputs"}. Please complete your inputs for proper GPA calculation.` : ""}`);
  }

  return { count, gpa: shownGpa, gpaLine, cumulative, cumulativeLine, warnings, alerts };
}
