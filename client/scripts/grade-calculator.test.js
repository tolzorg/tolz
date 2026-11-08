// Plain-Node test suite for the Grade Calculator engine.
// Run with:
//   node scripts/grade-calculator.test.js
//
// Expected sentences were read from the LIVE reference (omnicalculator.com/other/grade) by entering each scenario
// in a browser and reading the Result box back.

import { calculateGrade, emptyRow, DEFAULT_SCALE, gpaToLetter, percentToLetter } from "../src/utils/gradeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const letters = (rows, scale = {}) => calculateGrade({ type: "letters", count: String(rows.length || 2), scale: { ...DEFAULT_SCALE, ...scale },
  rows: rows.map(([grade, weight = "1", unit = "decimal"]) => ({ ...emptyRow(), grade, weight, unit })) });
const pct = (rows, scale = {}) => calculateGrade({ type: "percentage", count: String(rows.length), scale: { ...DEFAULT_SCALE, ...scale },
  rows: rows.map(([value, weight = "1", unit = "decimal"]) => ({ ...emptyRow(), value, weight, unit })) });
const pts = (rows) => calculateGrade({ type: "points", count: String(rows.length), scale: DEFAULT_SCALE,
  rows: rows.map(([value, max, weight = "1"]) => ({ ...emptyRow(), value, max, weight })) });
const out = (r) => r.errors ? r.errors.join(" | ") : (r.message || r.sentence) + (r.alerts?.length ? ` || ${r.alerts.join(" / ")}` : "");

// ── Letters (live) ──
eq("screenshot A-, B", out(letters([["A-"], ["B"]])), "Your overall grade is B+ (3.35 or 87%-90%).");
eq("weighted A×2, C+×1, B-×3", out(letters([["A", "2"], ["C+", "1"], ["B-", "3"]])), "Your overall grade is B (3.07 or 83%-87%).");
eq("None is skipped", out(letters([["A", "1"], ["None", "5"]])), "Your overall grade is A (4 or 93%-97%).");
eq("exactly 4.3 → A+", out(letters([["A  / A+", "1"]])), "Your overall grade is A+ (4.3 or 97%-100%).");
eq("zero weights", out(letters([["A", "0"], ["B", "0"]])), "At least one of the weights with a grade must be greater than zero.");
eq("F", out(letters([["F", "1"]])), "Your overall grade is F (0 or 0%-60%).");
eq("grade without weight skipped", out(letters([["A", ""], ["B", "1"]])), "Your overall grade is B (3 or 83%-87%).");
eq("nothing entered", out(letters([["", "1"], ["", "1"]])), "Please enter some numbers.");
eq("custom B+ threshold 85", out(letters([["A-"], ["B"]], { Bplus: "85" })), "Your overall grade is B+ (3.35 or 85%-90%).");
eq("invalid threshold: alert, still used", out(letters([["A-"], ["B"]], { Bplus: "95" })), "Your overall grade is B+ (3.35 or 95%-90%). || B+ threshold must be less than A-.");
eq("percent weight (C at 50% = 0.5)", out(letters([["A", "1"], ["C", "50", "percent"]])), `Your overall grade is B+ (${Math.round(((4 + 2 * 0.5) / 1.5) * 100) / 100} or 87%-90%).`);
eq("negative weight", out(letters([["A", "-1"], ["B", "1"]])), "No negative numbers, please.");

// ── Percentage (live) ──
eq("95×1, 82.5×2, 0×4 (0% skipped)", out(pct([["95", "1"], ["82.5", "2"], ["0", "4"]])), "Your overall grade is 87% (B).");
eq("over 100%", out(pct([["101", "1"], ["90", "1"]])), "Percentages shouldn't exceed 100%.");
eq("negative", out(pct([["-5", "1"], ["90", "1"]])), "No negative numbers, please.");
eq("zero weight", out(pct([["90", "0"]])), "At least one of the weights with a grade must be greater than zero.");
eq("custom B+ 85", out(pct([["86", "1"]], { Bplus: "85" })), "Your overall grade is 86% (B+).");

// ── Points (live) ──
eq("45/50 ×1, 18/20 ×2", out(pts([["45", "50", "1"], ["18", "20", "2"]])), "Your overall grade is 63 / 70 (90% or A-).");
eq("over the maximum", out(pts([["55", "50", "1"]])), "The number of points in course 1 cannot exceed the maximum.");
eq("decimals without float noise (reference prints 0.30000000000000004)", out(pts([["0.1", "1"], ["0.2", "1"]])), "Your overall grade is 0.3 / 2 (15% or F).");
eq("zero-point row skipped", out(pts([["0", "10"], ["8", "10"]])), "Your overall grade is 8 / 10 (80% or B-).");

// ── Number of grades (live) ──
const count = (c) => out(calculateGrade({ type: "letters", count: c, scale: DEFAULT_SCALE, rows: [] }));
eq("16 grades", count("16"), "Please enter 1 to 15 grades.");
eq("0 grades", count("0"), "Please enter 1 to 15 grades.");
eq("2.5 grades", count("2.5"), "Grades number should be an integer.");
eq("only rows within the count", out(calculateGrade({ type: "letters", count: "1", scale: DEFAULT_SCALE, rows: [{ ...emptyRow(), grade: "A" }, { ...emptyRow(), grade: "F" }] })), "Your overall grade is A (4 or 93%-97%).");

// ── Helpers ──
eq("GPA → letter", [4.3, 4.29, 4, 3.69, 0.7, 0.69].map(gpaToLetter).join(" "), "A+ A A B+ D- F");
eq("percent → letter", [100, 97, 96.9, 60, 59.9].map((p) => percentToLetter({ Aplus: 97, A: 93, Aminus: 90, Bplus: 87, B: 83, Bminus: 80, Cplus: 77, C: 73, Cminus: 70, Dplus: 67, D: 63, Dminus: 60 }, p)).join(" "), "A+ A+ A D- F");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
