// Plain-Node test suite for the GWA (General Weighted Average) Calculator engine.
// Run with:
//   node scripts/gwa-calculator.test.js
//
// Expected lines were read from the LIVE reference (omnicalculator.com/other/gwa) by choosing each scenario's
// grading system, grades and units in a browser and reading the "Your GWA" box back.

import { calculateGwa, visibleRows, systemOf, SYSTEMS } from "../src/utils/gwaCalculatorEngine.js";
import { calculateCollegeGpa, visibleRows as collegeRows, emptyCourse } from "../src/utils/collegeGpaCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (system, rows) => calculateGwa({ system, courses: rows.map(([grade, credits = ""]) => ({ grade, credits })) });
const box = (r) => r.errors ? r.errors.join(" | ") : [r.gwaLine, r.letterLine].filter(Boolean).join(" ¶ ");

// ── Live results ──
eq("screenshot 2.50×2, 2.50×3", box(run("gps5", [["2.50", "2"], ["2.50", "3"]])), "Your general weighted average is 2.5.");
eq("1.00-5.00 mixed", box(run("gps5", [["1.25", "3"], ["2.00", "3"], ["1.75", "2"]])), "Your general weighted average is 1.66.");
eq("units without a grade still count", box(run("gps5", [["2.50", "2"], ["", "3"]])), "Your general weighted average is 1.");
eq("grade without units ignored", box(run("gps5", [["2.50", "2"], ["1.00", ""]])), "Your general weighted average is 2.5.");
eq("negative units", box(run("gps5", [["2.50", "2"], ["1.00", "-1"]])), "Please enter your grades and positive values for the course units, and expect your GWA here.");
eq("4.00-1.00 scale", box(run("gps4", [["4.00", "3"], ["2.50", "2"]])), "Your general weighted average is 3.4.");
eq("letter A/A-/B+: 3.15 → B", box(run("letter1", [["A", "3"], ["C+", "3"]])), "Your general weighted average is 3.15. ¶ That is equivalent to a letter grade of B.");
eq("letter: 3.5 → B+", box(run("letter1", [["A-", "1"], ["B+", "1"], ["A-", "1"], ["B+", "1"]])), "Your general weighted average is 3.5. ¶ That is equivalent to a letter grade of B+.");
eq("letter below D- (reference prints 'here')", box(run("letter1", [["D-", "1"], ["", "3"]])), "Your general weighted average is 0.18. ¶ That is below the lowest letter grade (D-).");
eq("letter A/B+/B: 2.75 → C+", box(run("letter2", [["B+", "2"], ["C", "2"]])), "Your general weighted average is 2.75. ¶ That is equivalent to a letter grade of C+.");
eq("letter negative units", box(run("letter2", [["B+", "2"], ["C", "-2"]])),
  "Please enter your grades and positive values for the course units, and expect your GWA here. ¶ You'll also see its equivalent letter grade here.");
eq("empty", box(run("gps5", [])), "Please enter your grades and positive values for their corresponding units to expect your GWA here.");
eq("decimal units", box(run("gps5", [["1.00", "1.5"], ["3.00", "2.5"]])), "Your general weighted average is 2.25.");

// ── Letter thresholds ──
const letter = (system, gwa) => systemOf(system).letters.find(([min]) => gwa >= min)?.[1] ?? null;
eq("letter1 thresholds", [4, 3.99, 3.7, 3.69, 3.3, 3, 2.7, 2.3, 2, 1.7, 1.3, 1, 0.7, 0.69].map((g) => letter("letter1", g)).join(" "), "A A- A- B+ B+ B B- C+ C C- D+ D D- ");
eq("letter2 thresholds", [4, 3.5, 3.49, 3, 2.5, 2, 1.5, 1, 0.99, 0].map((g) => letter("letter2", g)).join(" "), "A B+ B B C+ C D+ D F F");
eq("grade point systems have no letter line", run("gps4", [["4.00", "1"]]).letterLine, null);
eq("letter system, empty: both 'here' lines", box(run("letter1", [])), "Please enter your grades and positive values for their corresponding units to expect your GWA here. ¶ You'll also see its equivalent letter grade here.");
eq("units sum to 0 with no negatives", run("gps5", [["1.00", "0"]]).gwa, null);
eq("bad units text", run("gps5", [["1.00", "x"]]).errors.join(), "Please enter a valid number for the units of course #1.");
eq("other system's grade ignored", run("gps4", [["A", "2"], ["4.00", "2"]]).gwa, 2);

// ── Rows (shared rule with the College GPA calculator) ──
const rows = (system, list) => visibleRows(systemOf(system), list.map(([grade, credits = ""]) => ({ grade, credits })));
eq("2 rows at start", rows("gps5", []), 2);
eq("3 after the screenshot's two rows", rows("gps5", [["2.50", "2"], ["2.50", "3"]]), 3);
eq("row 2 without grade: 2", rows("gps5", [["2.50", "2"], ["", "3"]]), 2);
eq("up to 30", rows("letter2", Array.from({ length: 30 }, () => ["A", "1"])), 30);
eq("system grade lists", SYSTEMS.map((s) => s.grades.length).join(), "10,8,11,8");
// The College GPA calculator still behaves as before with the shared helper.
eq("college rows unchanged", collegeRows([{ grade: "A+", credits: "2" }, { grade: "D+", credits: "3" }]), 3);
eq("college GPA unchanged", calculateCollegeGpa({ courses: [{ ...emptyCourse(), grade: "A+", credits: "2" }, { ...emptyCourse(), grade: "D+", credits: "3" }] }).gpaLine, "Your GPA is 2.5.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
