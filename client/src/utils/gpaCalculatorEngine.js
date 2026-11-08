// GPA Calculator engine — matches omnicalculator.com/other/gpa (its calculator definition and custom JS were read
// from the page; behaviour checked live, see scripts/gpa-calculator.test.js).
//
// Up to 20 courses, each with a letter grade (A+ 4.3 … D- 0.7, E/F 0), and depending on the options their
// credits and (high school only) a course type bonus (Honors +0.5, AP / IB / College +1).
//   High school: equal weights → mean of the grades (or of grade + bonus with Honors / AP courses);
//                different credits → Σ (grade [+ bonus]) × credits / Σ credits over courses with both a grade
//                and credits.
//   College:     equal weights → mean of the grades; different credits (the college default) → Σ grade × credits /
//                Σ credits, where a graded course with no credits counts as 1 credit (reference behaviour).
// Results are rounded to 2 decimals. The sum of credits (with prior credits) is shown rounded to a whole number.
// Cumulative GPA = (GPA × the term's credits/courses + prior GPA × prior credits/courses) / their total, using
// the already-rounded GPA (as the reference does). All wording below is the reference's own.
// One deliberate difference: with college + different credits, the reference never displays the "Your GPA is …"
// line (only the note under it); this calculator shows the GPA there too.
//
// `variant: "highSchool"` matches omnicalculator.com/other/high-school-gpa, the same code without the college option
// and with three differences (live): with equal weights and no graded course the GPA line ends in "0" instead of
// "here" ("Expect your calculated GPA 0."); with different credits and only regular courses, the GPA line is
// hidden when some credits have no grade AND some credits are negative; and the alert reads "GPA score can't be
// lower than 0.".

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const MAX_COURSES = 20;
export const GRADES = [
  ["A+", 4.3], ["A", 4.0], ["A-", 3.7], ["B+", 3.3], ["B", 3.0], ["B-", 2.7], ["C+", 2.3], ["C", 2.0], ["C-", 1.7],
  ["D+", 1.3], ["D", 1.0], ["D-", 0.7], ["E/F", 0.0],
];
const GRADE_POINTS = Object.fromEntries(GRADES);
export const COURSE_TYPES = [
  { value: "regular", label: "Regular", bonus: 0 },
  { value: "honors", label: "Honors (+0.5)", bonus: 0.5 },
  { value: "ap", label: "AP / IB / College (+1)", bonus: 1 },
];
const BONUS = Object.fromEntries(COURSE_TYPES.map((t) => [t.value, t.bonus]));

/** Defaults as on the reference: high school, equal weights, only regular courses; college with different credits. */
export const GPA_DEFAULTS = { level: "hs", hsCredits: false, honors: false, collegeCredits: true, cumulative: false };
export const emptyCourse = () => ({ grade: "", credits: "", type: "regular" });

/** The options' effective modes. */
export function modeOf(o) {
  const college = o.level === "college";
  return { college, credits: college ? o.collegeCredits : o.hsCredits, honors: !college && o.honors };
}

/** Course rows shown: 1 and 2 always; row k (k ≥ 3) once row k-1 or row k has its grade (and credits, in credits
 * mode), as on the reference. */
export function visibleRows(options, courses) {
  const { credits } = modeOf(options);
  const filled = (c) => c && clean(c.grade) !== "";
  const hasCredits = (c) => c && clean(c.credits) !== "";
  let n = 2;
  for (let k = 3; k <= MAX_COURSES; k++) {
    const prev = courses[k - 2];
    const cur = courses[k - 1];
    if ((filled(prev) || filled(cur)) && (!credits || hasCredits(prev) || hasCredits(cur))) n = k;
  }
  return n;
}

const fmt = (x) => String(x); // reference text shows plain numbers: 2.43, 3.5, 4, 0

/**
 * input: { ...options, courses: [{ grade, credits, type }], priorGpa, priorCredits, priorCourses, variant? ("highSchool") }
 * → { errors } | {
 *   mode, count, gpa (number|null), gpaLine (null when hidden), gpaNote, totalCreditsLine (credits mode) | null,
 *   cumulative (number|null), cumulativeLine, collegesCare, warnings: [credit messages], alerts: [prior box alerts] }
 */
export function calculateGpa(input) {
  const highSchool = input.variant === "highSchool";
  const mode = modeOf(highSchool ? { ...input, level: "hs" } : input);
  const errors = [];
  const courses = (input.courses || []).slice(0, MAX_COURSES).map((c, i) => {
    const grade = clean(c.grade);
    const creditText = mode.credits ? clean(c.credits) : "";
    const credits = creditText === "" ? null : num(creditText);
    if (creditText !== "" && !Number.isFinite(credits)) errors.push(`Please enter a valid number for #${i + 1} Credits.`);
    return { hasGrade: grade !== "" && grade in GRADE_POINTS, grade: GRADE_POINTS[grade], hasCredits: credits !== null, credits, bonus: BONUS[c.type] || 0 };
  });

  const priorBox = mode.credits ? input.priorCredits : input.priorCourses;
  const priorGpaText = input.cumulative ? clean(input.priorGpa) : "";
  const priorCountText = input.cumulative ? clean(priorBox) : "";
  const priorGpa = priorGpaText === "" ? null : num(priorGpaText);
  const priorCount = priorCountText === "" ? null : num(priorCountText);
  if (priorGpaText !== "" && !Number.isFinite(priorGpa)) errors.push("Please enter a valid number for the prior GPA.");
  if (priorCountText !== "" && !Number.isFinite(priorCount)) errors.push(`Please enter a valid number for the ${mode.credits ? "sum of previous credits" : "previous number of courses completed"}.`);
  if (errors.length) return { errors };

  // The reference's field alerts (shown, but the values are still used).
  const alerts = [];
  if (priorGpa !== null && priorGpa > 5.3) alerts.push("GPA shouldn't exceed 5.3.");
  if (priorGpa !== null && priorGpa < 0) alerts.push(highSchool ? "GPA score can't be lower than 0." : "GPA can't be lower than 0.");
  if (priorCount !== null && !(priorCount > 0)) alerts.push(mode.credits ? "Total credits must be greater than zero." : "Previous number of courses completed must be greater than zero.");

  let count = 0;
  let creditInputs = 0;
  let sumGrades = 0;
  let sumPair = 0;
  let weighted = 0;
  let total = 0;
  for (const c of courses) {
    if (c.hasGrade) { count++; sumGrades += c.grade; sumPair += c.grade + c.bonus; }
    if (c.hasCredits) creditInputs++;
    if (mode.college) {
      if (mode.credits && c.hasGrade && c.hasCredits) { weighted += c.grade * c.credits; total += c.credits; }
      else if (c.hasGrade) { weighted += c.grade; total += 1; }
    } else if (c.hasGrade && (!mode.credits || c.hasCredits)) {
      const points = c.grade + (mode.honors ? c.bonus : 0);
      const w = mode.credits ? c.credits : 1;
      weighted += points * w;
      total += w;
    }
  }
  const resultGpa = total > 0 ? roundTo(weighted / total, 2) : 0;
  const hasPrior = priorGpa !== null && priorCount !== null;

  // GPA line: the mean of the grades (equal weights), of grade + bonus (high school, equal, Honors / AP), else the
  // credit-weighted GPA; "here" when there is nothing to average.
  let gpa = null;
  if (total > 0) {
    if (!mode.credits && !mode.honors) gpa = count > 0 ? roundTo(sumGrades / count, 2) : null;
    else if (!mode.credits && mode.honors) gpa = count > 0 ? roundTo(sumPair / count, 2) : null;
    else gpa = resultGpa;
  }
  const blank = highSchool && !mode.credits ? "0" : "here";
  let gpaLine = gpa === null
    ? `${hasPrior ? "Please enter your course grades and their corresponding credits to expect your GPA " : "Expect your calculated GPA "}${blank}.`
    : `Your GPA is ${fmt(gpa)}.`;
  let gpaNote = null;
  if (total > 0) {
    if (mode.credits && !mode.honors) gpaNote = "This is your GPA weighted with credits.";
    else if (!mode.credits && !mode.honors) gpaNote = "This is your unweighted GPA.";
    else if (mode.credits && mode.honors) gpaNote = "This is your GPA weighted with credits and course difficulty.";
    else gpaNote = "This is your GPA weighted with course difficulty, commonly called your weighted GPA.";
  }

  // The sum of credits (credits mode only), including prior credits.
  const allCredits = total + (hasPrior ? priorCount : 0);
  let totalCreditsLine = null;
  if (mode.credits) {
    totalCreditsLine = allCredits >= 0
      ? `The sum of your credits is ${fmt(roundTo(allCredits, 0))} ${allCredits === 1 ? "credit." : "credits."}`
      : "Please ensure you only enter positive values for your course credits.";
  }

  // Cumulative GPA.
  let cumulative = null;
  let cumulativeLine;
  if (!input.cumulative) {
    cumulativeLine = 'Please tick the "Calculate your cumulative GPA" checkbox for your cumulative GPA.';
  } else if (!hasPrior) {
    cumulativeLine = mode.credits
      ? "Please enter your prior GPA and sum of previous credits for your cumulative GPA."
      : "Please enter your prior GPA and previous total number of courses completed for your cumulative GPA.";
  } else {
    const value = (total > 0 ? resultGpa * total + priorGpa * priorCount : priorGpa * priorCount) / allCredits;
    if (Number.isFinite(value)) { cumulative = roundTo(value, 2); cumulativeLine = `Your cumulative GPA is ${fmt(cumulative)}.`; }
    else cumulativeLine = "Please double-check your inputs for correct results";
  }
  const collegesCare = !mode.college && !mode.credits && !mode.honors && input.cumulative && hasPrior;

  // Credit messages (credits mode): of each pair of matching messages the reference shows the later one.
  const warnings = [];
  if (mode.credits) {
    const weightNoGrade = courses.some((c) => !c.hasGrade && c.hasCredits);
    const gradeNoWeight = courses.some((c) => c.hasGrade && !c.hasCredits);
    const negative = courses.some((c) => c.hasCredits && c.credits < 0);
    if (highSchool && !mode.honors && weightNoGrade && negative) gpaLine = null;
    const missing = count - creditInputs;
    if (gradeNoWeight) {
      warnings.push(`The results may be wrong due to incomplete inputs.${missing > 0
        ? ` You missed entering ${missing} credit ${missing === 1 ? "input" : "inputs"}. Please complete your inputs for proper GPA calculation.` : ""}`);
    } else if (weightNoGrade) {
      warnings.push("The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation.");
    }
    if (negative) warnings.push(weightNoGrade ? "Also, course credits cannot be negative." : "Course credits cannot be negative.");
  }

  return { mode, count, gpa, gpaLine, gpaNote, totalCreditsLine, cumulative, cumulativeLine, collegesCare, warnings, alerts };
}
