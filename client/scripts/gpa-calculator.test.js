// Plain-Node test suite for the GPA Calculator engine.
// Run with:
//   node scripts/gpa-calculator.test.js
//
// Expected lines were read from the LIVE reference (omnicalculator.com/other/gpa) by choosing each scenario's
// options, grades, credits and course types in a browser and reading the "Your GPA" box back.

import { calculateGpa, visibleRows, GPA_DEFAULTS, emptyCourse } from "../src/utils/gpaCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const TYPE = { H: "honors", AP: "ap" };
/** rows: [grade, credits?, type?] */
const run = (opts, rows, prior = {}) => calculateGpa({
  ...GPA_DEFAULTS, ...opts,
  courses: rows.map(([grade, credits = "", type]) => ({ ...emptyCourse(), grade, credits, type: TYPE[type] || "regular" })),
  priorGpa: prior.gpa ?? "", priorCredits: prior.count ?? "", priorCourses: prior.count ?? "",
});
/** The result box as the reference prints it, line by line. */
const box = (r) => r.errors ? r.errors.join(" | ") : [
  `You’ve entered ${r.count} ${r.count === 1 ? "course." : "courses."}`, r.totalCreditsLine, r.gpaLine, r.gpaNote, r.cumulativeLine,
  r.collegesCare ? "This is usually the cumulative GPA that colleges care about (omitting non-core classes)." : null, ...r.warnings,
].filter(Boolean).join(" ¶ ");
const CREDITS = { hsCredits: true };
const HONORS = { honors: true };
const COLLEGE = { level: "college" };
const TICK = 'Please tick the "Calculate your cumulative GPA" checkbox for your cumulative GPA.';

// ── High school, equal weights (live) ──
eq("screenshot B- B C+ B B C- D+", box(run({}, [["B-"], ["B"], ["C+"], ["B"], ["B"], ["C-"], ["D+"]])),
  `You’ve entered 7 courses. ¶ Your GPA is 2.43. ¶ This is your unweighted GPA. ¶ ${TICK}`);
eq("A, A → 4", box(run({}, [["A"], ["A"]])), `You’ve entered 2 courses. ¶ Your GPA is 4. ¶ This is your unweighted GPA. ¶ ${TICK}`);
eq("A, B → 3.5", run({}, [["A"], ["B"]]).gpaLine, "Your GPA is 3.5.");
eq("E/F → 0", box(run({}, [["E/F"]])), `You’ve entered 1 course. ¶ Your GPA is 0. ¶ This is your unweighted GPA. ¶ ${TICK}`);
eq("empty", box(run({}, [])), `You’ve entered 0 courses. ¶ Expect your calculated GPA here. ¶ ${TICK}`);

// ── High school, different credits (live) ──
eq("A×3, B×4", box(run(CREDITS, [["A", "3"], ["B", "4"]])),
  `You’ve entered 2 courses. ¶ The sum of your credits is 7 credits. ¶ Your GPA is 3.43. ¶ This is your GPA weighted with credits. ¶ ${TICK}`);
eq("2.5 credits shown as 3, missing credit", box(run(CREDITS, [["A", "2.5"], ["B", ""]])),
  `You’ve entered 2 courses. ¶ The sum of your credits is 3 credits. ¶ Your GPA is 4. ¶ This is your GPA weighted with credits. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. You missed entering 1 credit input. Please complete your inputs for proper GPA calculation.`);
eq("credits with no grade", box(run(CREDITS, [["A", "3"], ["", "2"]])),
  `You’ve entered 1 course. ¶ The sum of your credits is 3 credits. ¶ Your GPA is 4. ¶ This is your GPA weighted with credits. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation.`);
eq("negative credits", box(run(CREDITS, [["A", "-1"], ["B", "3"]])),
  `You’ve entered 2 courses. ¶ The sum of your credits is 2 credits. ¶ Your GPA is 2.5. ¶ This is your GPA weighted with credits. ¶ ${TICK} ¶ Course credits cannot be negative.`);
eq("negative + credits with no grade", box(run(CREDITS, [["A", "-1"], ["", "3"]])),
  `You’ve entered 1 course. ¶ Please ensure you only enter positive values for your course credits. ¶ Expect your calculated GPA here. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. Please ensure you select the course grade for the course credits you entered for proper GPA calculation. ¶ Also, course credits cannot be negative.`);
eq("both incomplete (later message wins)", box(run(CREDITS, [["A", ""], ["", "3"]])),
  `You’ve entered 1 course. ¶ The sum of your credits is 0 credits. ¶ Expect your calculated GPA here. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs.`);
eq("missing credit + negative", box(run(CREDITS, [["A", "-2"], ["B", ""]])),
  `You’ve entered 2 courses. ¶ Please ensure you only enter positive values for your course credits. ¶ Expect your calculated GPA here. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. You missed entering 1 credit input. Please complete your inputs for proper GPA calculation. ¶ Course credits cannot be negative.`);
eq("one credit (singular)", run(CREDITS, [["A", "1"]]).totalCreditsLine, "The sum of your credits is 1 credit.");

// ── Honors / AP (live) ──
eq("honors equal", box(run(HONORS, [["A", "", "H"], ["B", "", "AP"]])),
  `You’ve entered 2 courses. ¶ Your GPA is 4.25. ¶ This is your GPA weighted with course difficulty, commonly called your weighted GPA. ¶ ${TICK}`);
eq("honors credits", box(run({ ...CREDITS, ...HONORS }, [["A", "3", "H"], ["B", "4", "AP"]])),
  `You’ve entered 2 courses. ¶ The sum of your credits is 7 credits. ¶ Your GPA is 4.21. ¶ This is your GPA weighted with credits and course difficulty. ¶ ${TICK}`);

// ── Cumulative (live) ──
eq("cumulative equal", box(run({ cumulative: true }, [["A"], ["B"]], { gpa: "3", count: "4" })),
  "You’ve entered 2 courses. ¶ Your GPA is 3.5. ¶ This is your unweighted GPA. ¶ Your cumulative GPA is 3.17. ¶ This is usually the cumulative GPA that colleges care about (omitting non-core classes).");
eq("cumulative credits", box(run({ ...CREDITS, cumulative: true }, [["A", "3"], ["B", "4"]], { gpa: "3.2", count: "30" })),
  "You’ve entered 2 courses. ¶ The sum of your credits is 37 credits. ¶ Your GPA is 3.43. ¶ This is your GPA weighted with credits. ¶ Your cumulative GPA is 3.24.");
eq("cumulative, no prior (courses)", run({ cumulative: true }, [["A"], ["B"]]).cumulativeLine, "Please enter your prior GPA and previous total number of courses completed for your cumulative GPA.");
eq("cumulative, no prior (credits)", run({ ...CREDITS, cumulative: true }, [["A", "3"]]).cumulativeLine, "Please enter your prior GPA and sum of previous credits for your cumulative GPA.");
eq("prior only", box(run({ cumulative: true }, [], { gpa: "3", count: "4" })),
  "You’ve entered 0 courses. ¶ Please enter your course grades and their corresponding credits to expect your GPA here. ¶ Your cumulative GPA is 3. ¶ This is usually the cumulative GPA that colleges care about (omitting non-core classes).");
const g6 = run({ cumulative: true }, [["A"], ["B"]], { gpa: "6", count: "4" });
eq("prior GPA 6: alert, still used", `${g6.cumulativeLine} | ${g6.alerts.join()}`, "Your cumulative GPA is 5.17. | GPA shouldn't exceed 5.3.");
const c0 = run({ ...CREDITS, cumulative: true }, [["A", "3"]], { gpa: "3", count: "0" });
eq("prior credits 0: alert, still used", `${c0.totalCreditsLine} | ${c0.cumulativeLine} | ${c0.alerts.join()}`, "The sum of your credits is 3 credits. | Your cumulative GPA is 4. | Total credits must be greater than zero.");
eq("negative prior GPA alert", run({ cumulative: true }, [["A"]], { gpa: "-1", count: "2" }).alerts.join(), "GPA can't be lower than 0.");
eq("unticked: prior ignored", run({ cumulative: false }, [["A"]], { gpa: "3", count: "4" }).cumulativeLine, TICK);

// ── College (live; college defaults to different credits) ──
const col = run(COLLEGE, [["A", "3"], ["C", "1"]]);
eq("college credits", `${col.totalCreditsLine} | ${col.gpaLine} | ${col.gpaNote}`, "The sum of your credits is 4 credits. | Your GPA is 3.5. | This is your GPA weighted with credits.");
eq("college: graded course without credits counts as 1 credit (live: 2 credits)", box(run(COLLEGE, [["A"], ["C"]])),
  `You’ve entered 2 courses. ¶ The sum of your credits is 2 credits. ¶ Your GPA is 3. ¶ This is your GPA weighted with credits. ¶ ${TICK} ¶ The results may be wrong due to incomplete inputs. You missed entering 2 credit inputs. Please complete your inputs for proper GPA calculation.`);
eq("college equal weights", box(run({ ...COLLEGE, collegeCredits: false }, [["A"], ["C"]])), `You’ve entered 2 courses. ¶ Your GPA is 3. ¶ This is your unweighted GPA. ¶ ${TICK}`);
eq("college equal, cumulative (no colleges-care line)", box(run({ ...COLLEGE, collegeCredits: false, cumulative: true }, [["A"], ["C"]], { gpa: "3", count: "4" })),
  "You’ve entered 2 courses. ¶ Your GPA is 3. ¶ This is your unweighted GPA. ¶ Your cumulative GPA is 3.");
eq("college credits, cumulative", run({ ...COLLEGE, cumulative: true }, [["A", "3"], ["C", "1"]], { gpa: "3", count: "10" }).cumulativeLine, "Your cumulative GPA is 3.14.");
eq("college ignores course types", run({ ...COLLEGE, collegeCredits: false, honors: true }, [["A", "", "AP"]]).gpaLine, "Your GPA is 4.");

// ── Rows shown ──
const rowsOf = (opts, rows) => visibleRows({ ...GPA_DEFAULTS, ...opts }, rows.map(([grade, credits = ""]) => ({ ...emptyCourse(), grade, credits })));
eq("2 rows at start", rowsOf({}, []), 2);
eq("row 3 after row 2's grade", rowsOf({}, [["A"], ["B"]]), 3);
eq("8 rows after 7 grades (screenshot)", rowsOf({}, [["B-"], ["B"], ["C+"], ["B"], ["B"], ["C-"], ["D+"]]), 8);
eq("credits mode needs the credits too", `${rowsOf(CREDITS, [["A", "3"], ["B", ""]])} ${rowsOf(CREDITS, [["A", "3"], ["B", "4"]])}`, "2 3");
eq("at most 20", rowsOf({}, Array.from({ length: 20 }, () => ["A"])), 20);

// ── Validation ──
eq("bad credits text", run(CREDITS, [["A", "x"]]).errors.join(), "Please enter a valid number for #1 Credits.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
