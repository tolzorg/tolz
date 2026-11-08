// Plain-Node test suite for the GPA Calculator Pakistan engine.
// Run with:
//   node scripts/gpa-pakistan-calculator.test.js
//
// Expected lines were read from the LIVE reference (omnicalculator.com/other/gpa-pakistan) by choosing each
// scenario's scale, grades and credit hours in a browser and reading the Results box back.

import { calculateGpaPakistan, visibleRows, scaleOf, ordinal, SCALES } from "../src/utils/gpaPakistanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (scale, rows, prev) => calculateGpaPakistan({
  scale, courses: rows.map(([grade, credits = ""]) => ({ grade, credits })),
  cgpa: Boolean(prev), previousGpa: prev?.[0] ?? "", previousCredits: prev?.[1] ?? "",
});
const box = (r) => r.errors ? r.errors.join(" | ")
  : [r.gpaLine, r.cgpaLine, `Total courses: ${r.courses}`, `Total credits: ${r.totalCredits}`, `Total points: ${r.totalPoints}`].filter(Boolean).join(" ¶ ");
const SHOT = [["B-", "2"], ["B+", "3"], ["B", "2"], ["B+", "3"]];

// ── Live results ──
eq("screenshot", box(run("4", SHOT)), "Your GPA is 3.1. ¶ Total courses: 4 ¶ Total credits: 10 ¶ Total points: 31.2");
eq("3.15 → 3.1 (toPrecision)", box(run("4", [["A", "1"], ["C+", "1"]])), "Your GPA is 3.1. ¶ Total courses: 2 ¶ Total credits: 2 ¶ Total points: 6.3");
eq("10/3 → 3.3", box(run("4", [["A", "2"], ["C", "1"]])), "Your GPA is 3.3. ¶ Total courses: 2 ¶ Total credits: 3 ¶ Total points: 10");
eq("single A → 4", box(run("4", [["A", "3"]])), "Your GPA is 4. ¶ Total courses: 1 ¶ Total credits: 3 ¶ Total points: 12");
eq("F → 0", box(run("4", [["F", "3"]])), "Your GPA is 0. ¶ Total courses: 1 ¶ Total credits: 3 ¶ Total points: 0");
eq("decimal credits, points rounded", box(run("4", [["A", "1.5"], ["B-", "2.25"]])), "Your GPA is 3.2. ¶ Total courses: 2 ¶ Total credits: 3.75 ¶ Total points: 12.08");
eq("5-point scale", box(run("5", [["A-", "3"], ["D+", "2"]])), "Your GPA is 3.7. ¶ Total courses: 2 ¶ Total credits: 5 ¶ Total points: 18.7");
eq("Quaid-e-Azam", box(run("qau", [["95.0 to 99.0 (A)", "3"], ["63.5 to 64.9 (C)", "3"]])), "Your GPA is 3.9. ¶ Total courses: 2 ¶ Total credits: 6 ¶ Total points: 23.7");
eq("cGPA", box(run("4", SHOT, ["3.5", "30"])), "Your GPA is 3.1. ¶ Your cGPA is 3.4. ¶ Total courses: 4 ¶ Total credits: 10 ¶ Total points: 31.2");
eq("cGPA ticked, no previous values: no line", box(run("4", [["A", "3"]], ["", ""])), "Your GPA is 4. ¶ Total courses: 1 ¶ Total credits: 3 ¶ Total points: 12");
eq("negative credit hours used as typed", box(run("4", [["A", "-1"], ["B", "3"]])), "Your GPA is 2.5. ¶ Total courses: 2 ¶ Total credits: 2 ¶ Total points: 5");

// ── Other rules ──
eq("course needs grade AND credits", box(run("4", [["A", ""], ["B", "3"]])), "Your GPA is 3. ¶ Total courses: 1 ¶ Total credits: 3 ¶ Total points: 9");
eq("nothing complete", run("4", [["A", ""]]).gpaLine, "Enter equal grades and credit hours.");
eq("credit hours add up to 0 (reference shows NaN)", run("4", [["A", "0"]]).gpaLine, "The credit hours add up to 0, so the GPA can't be calculated. Please check your credit hours.");
eq("cGPA from the rounded GPA", run("4", [["A", "2"], ["C", "1"]], ["3", "3"]).cgpa, Number(((3.3 * 3 + 9) / 6).toPrecision(2)));
eq("cGPA unticked ignores previous", calculateGpaPakistan({ scale: "4", courses: [{ grade: "A", credits: "3" }], cgpa: false, previousGpa: "2", previousCredits: "3" }).cgpaLine, null);
eq("Quaid-e-Azam stops at 10 courses", run("qau", Array.from({ length: 12 }, () => ["95.0 to 99.0 (A)", "1"])).courses, 10);
eq("other scale's grade ignored", run("5", [["A", "3"], ["D", "1"]]).gpa, Number((17 / 4).toPrecision(2)));
eq("bad credit text", run("4", [["A", "x"]]).errors.join(), "Please enter a valid number for the 1st credit.");

// ── Rows and labels ──
const rows = (scale, list) => visibleRows(scaleOf(scale), list.map(([grade, credits = ""]) => ({ grade, credits })));
eq("4 rows at start", rows("4", []), 4);
eq("5th row after a full 4th row", `${rows("4", SHOT)} ${rows("4", [...SHOT.slice(0, 3), ["B+", ""]])}`, "5 4");
eq("Quaid-e-Azam caps at 10", rows("qau", Array.from({ length: 10 }, () => ["95.0 to 99.0 (A)", "1"])), 10);
eq("ordinals", [1, 2, 3, 4, 11, 12, 13, 20, 21].map(ordinal).join(" "), "1st 2nd 3rd 4th 11th 12th 13th 20th 21st");
eq("grade counts", SCALES.map((s) => s.grades.length).join(), "10,12,32");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
