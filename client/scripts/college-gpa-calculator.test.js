// Plain-Node test suite for the College GPA Calculator engine.
// Run with:
//   node scripts/college-gpa-calculator.test.js
//
// Expected lines were read from the LIVE reference (omnicalculator.com/other/college-gpa) by choosing each
// scenario's grades and credits in a browser and reading the "Your GPA" box back.

import { calculateCollegeGpa, visibleRows, emptyCourse, GRADE_OPTIONS } from "../src/utils/collegeGpaCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (rows, cum = false, prior = []) => calculateCollegeGpa({
  courses: rows.map(([grade, credits = ""]) => ({ ...emptyCourse(), grade, credits })),
  cumulative: cum, priorGpa: prior[0] ?? "", priorCredits: prior[1] ?? "",
});
const box = (r) => r.errors ? r.errors.join(" | ")
  : [`You've entered ${r.count} ${r.count === 1 ? "course." : "courses."}`, r.gpaLine, r.cumulativeLine, ...r.warnings].join(" ¶ ");
const TICK = 'Please tick the "Calculate your cumulative GPA" checkbox for your cumulative GPA.';
const rows = (list) => visibleRows(list.map(([grade, credits = ""]) => ({ grade, credits })));

// ── Live results ──
eq("screenshot A+ ×2, D+ ×3", box(run([["A+", "2"], ["D+", "3"]])), `You've entered 2 courses. ¶ Your GPA is 2.5. ¶ ${TICK}`);
eq("empty", box(run([])), `You've entered 0 courses. ¶ The sum of the credits must result in a number greater than zero. ¶ ${TICK}`);
eq("credits without a grade count at 0 points", box(run([["A", "2"], ["", "2"]])),
  `You've entered 1 course. ¶ Your GPA is 2. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation.`);
eq("0.5 credits: expect here", box(run([["A", "0.5"]])), `You've entered 1 course. ¶ Expect your calculated GPA here. ¶ ${TICK}`);
eq("grade without credits", box(run([["A", "3"], ["B", ""]])),
  `You've entered 2 courses. ¶ Your GPA is 4. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. You missed entering 1 credit input. Please complete your inputs for proper GPA calculation.`);
eq("both incomplete messages", box(run([["A", ""], ["", "3"]])),
  `You've entered 1 course. ¶ Your GPA is 0. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation. ¶ The results may be wrong due to incomplete inputs.`);
eq("negative credits", box(run([["A", "-1"], ["B", "3"]])), `You've entered 2 courses. ¶ Your GPA is 2.5. ¶ ${TICK} ¶ Course credits cannot be negative.`);
eq("negative + credits without grade", box(run([["A", "-1"], ["", "3"]])),
  `You've entered 1 course. ¶ Your GPA is -2. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation. ¶ Also, course credits cannot be negative.`);
eq("negative total", box(run([["A", "-3"], ["B", "1"]])),
  `You've entered 2 courses. ¶ The sum of the credits must result in a number greater than zero. ¶ ${TICK} ¶ Course credits cannot be negative.`);
eq("cumulative, no prior", box(run([["A", "3"], ["B", "4"]], true)),
  "You've entered 2 courses. ¶ Your GPA is 3.43. ¶ Please enter your prior GPA and prior total credits for your cumulative GPA.");
eq("cumulative", box(run([["A", "3"], ["B", "4"]], true, ["3.2", "30"])), "You've entered 2 courses. ¶ Your GPA is 3.43. ¶ Your cumulative GPA is 3.24.");
eq("cumulative, no courses", box(run([], true, ["3.2", "30"])),
  "You've entered 0 courses. ¶ Please enter your course grades and their corresponding credits to expect your GPA here. ¶ Your cumulative GPA is 3.2.");
eq("cumulative, negative total", box(run([["A", "-3"]], true, ["3", "1"])),
  "You've entered 1 course. ¶ The sum of the credits must result in a number greater than zero. ¶ Please double-check your inputs for correct results. ¶ Course credits cannot be negative.");
const p5 = run([["A", "2"]], true, ["5", "10"]);
eq("prior GPA 5: alert, still used", `${p5.cumulativeLine} | ${p5.alerts.join()}`, "Your cumulative GPA is 4.83. | GPA score shouldn't exceed 4.0 (or 4.3 in extended grading scale).");
eq("one course", box(run([["B", "4"]])), `You've entered 1 course. ¶ Your GPA is 3. ¶ ${TICK}`);

// ── More ──
eq("cumulative from unrounded sums", run([["A-", "3"], ["B+", "3"], ["C", "1"]], true, ["3", "10"]).cumulativeLine, `Your cumulative GPA is ${Math.round(((3.7 * 3 + 3.3 * 3 + 2) + 30) / 17 * 100) / 100}.`);
eq("prior credits 0 alert", run([["A", "3"]], true, ["3", "0"]).alerts.join(), "Total credits must be greater than zero.");
eq("negative prior GPA alert", run([["A", "3"]], true, ["-1", "3"]).alerts.join(), "GPA score can't be lower than 0.");
eq("unticked ignores prior", run([["A", "3"]], false, ["3", "30"]).cumulativeLine, TICK);
eq("bad credits", run([["A", "x"]]).errors.join(), "Please enter a valid number for #1 Credits.");
eq("A+ label", GRADE_OPTIONS[0].label, "(A+)");
eq("2 missing credits (plural)", run([["A", "3"], ["B", ""], ["C", ""]]).warnings.join(), "The results may be wrong due to incomplete inputs. You missed entering 2 credit inputs. Please complete your inputs for proper GPA calculation.");

// ── Rows shown (live: 3 rows after the screenshot's two courses, 2 when row 2 lacks a grade) ──
eq("2 rows at start", rows([]), 2);
eq("3 after two full rows", rows([["A+", "2"], ["D+", "3"]]), 3);
eq("row 2 without grade: 2", rows([["A", "2"], ["", "2"]]), 2);
eq("row 2 without credits: 2", rows([["A", "3"], ["B", ""]]), 2);
eq("at most 30", rows(Array.from({ length: 30 }, () => ["A", "1"])), 30);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
