// Plain-Node test suite for the High School GPA Calculator (the GPA engine's "highSchool" variant).
// Run with:
//   node scripts/high-school-gpa-calculator.test.js
//
// Expected lines were read from the LIVE reference (omnicalculator.com/other/high-school-gpa) by choosing each
// scenario's options, grades, credits and course types in a browser and reading the "Your GPA" box back.

import { calculateGpa, GPA_DEFAULTS, emptyCourse } from "../src/utils/gpaCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const TYPE = { H: "honors", AP: "ap" };
const run = (opts, rows, prior = {}) => calculateGpa({
  ...GPA_DEFAULTS, ...opts, variant: "highSchool",
  courses: rows.map(([grade, credits = "", type]) => ({ ...emptyCourse(), grade, credits, type: TYPE[type] || "regular" })),
  priorGpa: prior.gpa ?? "", priorCredits: prior.count ?? "", priorCourses: prior.count ?? "",
});
const box = (r) => r.errors ? r.errors.join(" | ") : [
  `You've entered ${r.count} ${r.count === 1 ? "course." : "courses."}`, r.totalCreditsLine, r.gpaLine, r.gpaNote, r.cumulativeLine,
  r.collegesCare ? "This is usually the cumulative GPA that colleges care about (omitting non-core classes)." : null, ...r.warnings,
].filter(Boolean).join(" ¶ ");
const CREDITS = { hsCredits: true };
const HONORS = { honors: true };
const TICK = 'Please tick the "Calculate your cumulative GPA" checkbox for your cumulative GPA.';
const CARE = "This is usually the cumulative GPA that colleges care about (omitting non-core classes).";

// ── Live results ──
eq("screenshot C-, B-", box(run({}, [["C-"], ["B-"]])), `You've entered 2 courses. ¶ Your GPA is 2.2. ¶ This is your unweighted GPA. ¶ ${TICK}`);
eq("empty: GPA 0", box(run({}, [])), `You've entered 0 courses. ¶ Expect your calculated GPA 0. ¶ ${TICK}`);
eq("empty honors: GPA 0", box(run(HONORS, [])), `You've entered 0 courses. ¶ Expect your calculated GPA 0. ¶ ${TICK}`);
eq("empty credits: here", box(run(CREDITS, [])), `You've entered 0 courses. ¶ The sum of your credits is 0 credits. ¶ Expect your calculated GPA here. ¶ ${TICK}`);
eq("credits A×3, B×4", box(run(CREDITS, [["A", "3"], ["B", "4"]])),
  `You've entered 2 courses. ¶ The sum of your credits is 7 credits. ¶ Your GPA is 3.43. ¶ This is your GPA weighted with credits. ¶ ${TICK}`);
eq("regular credits: negative + credits without grade hides the GPA line", box(run(CREDITS, [["A", "-1"], ["", "3"]])),
  `You've entered 1 course. ¶ Please ensure you only enter positive values for your course credits. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation. ¶ Also, course credits cannot be negative.`);
eq("honors credits: same inputs keep the line", box(run({ ...CREDITS, ...HONORS }, [["A", "-1"], ["", "3"]])),
  `You've entered 1 course. ¶ Please ensure you only enter positive values for your course credits. ¶ Expect your calculated GPA here. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation. ¶ Also, course credits cannot be negative.`);
eq("negative only", box(run(CREDITS, [["A", "-1"], ["B", "3"]])),
  `You've entered 2 courses. ¶ The sum of your credits is 2 credits. ¶ Your GPA is 2.5. ¶ This is your GPA weighted with credits. ¶ ${TICK} ¶ Course credits cannot be negative.`);
eq("both incomplete", box(run(CREDITS, [["A", ""], ["", "3"]])),
  `You've entered 1 course. ¶ The sum of your credits is 0 credits. ¶ Expect your calculated GPA here. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs.`);
eq("honors equal", box(run(HONORS, [["A", "", "H"], ["B", "", "AP"]])),
  `You've entered 2 courses. ¶ Your GPA is 4.25. ¶ This is your GPA weighted with course difficulty, commonly called your weighted GPA. ¶ ${TICK}`);
eq("cumulative equal", box(run({ cumulative: true }, [["A"], ["B"]], { gpa: "3", count: "4" })),
  `You've entered 2 courses. ¶ Your GPA is 3.5. ¶ This is your unweighted GPA. ¶ Your cumulative GPA is 3.17. ¶ ${CARE}`);
eq("prior only: GPA 0", box(run({ cumulative: true }, [], { gpa: "3", count: "4" })),
  `You've entered 0 courses. ¶ Please enter your course grades and their corresponding credits to expect your GPA 0. ¶ Your cumulative GPA is 3. ¶ ${CARE}`);
eq("cumulative credits", box(run({ ...CREDITS, cumulative: true }, [["A", "3"], ["B", "4"]], { gpa: "3.2", count: "30" })),
  "You've entered 2 courses. ¶ The sum of your credits is 37 credits. ¶ Your GPA is 3.43. ¶ This is your GPA weighted with credits. ¶ Your cumulative GPA is 3.24.");
const g6 = run({ cumulative: true }, [["A"], ["B"]], { gpa: "6", count: "4" });
eq("prior GPA 6: alert, still used", `${g6.cumulativeLine} | ${g6.alerts.join()}`, "Your cumulative GPA is 5.17. | GPA shouldn't exceed 5.3.");
eq("negative prior GPA: high school wording", run({ cumulative: true }, [["A"]], { gpa: "-1", count: "2" }).alerts.join(), "GPA score can't be lower than 0.");
eq("no college: level ignored", run({ level: "college", collegeCredits: false }, [["A", "", "AP"]]).mode.college, false);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
