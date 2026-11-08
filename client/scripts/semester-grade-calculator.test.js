// Plain-Node test suite for the Semester Grade Calculator engine.
// Run with:
//   node scripts/semester-grade-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/semester-grade) by entering each
// scenario in a browser and reading the boxes back.

import { calculateSemesterGrade, FIELDS } from "../src/utils/semesterGradeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

// [first grade, first weight, second grade, second weight, final grade, final weight, semester grade]
const calc = (arr) => calculateSemesterGrade(Object.fromEntries(FIELDS.map((k, i) => [k, arr[i] ?? ""])));
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : `${FIELDS.map((k) => (r.solved.includes(k) ? `[${r.values[k]}]` : r.values[k])).join(" ")}${r.warnings.length ? ` || ${r.warnings.join(" / ")}` : ""}`);

// ── Live ──
eq("screenshot", out(calc(["3", "4", "3", "5", "4", "", ""])), "3 4 3 5 4 [91] [3.91]");
eq("need on final", out(calc(["80", "25", "70", "25", "", "", "85"])), "80 25 70 25 [95] [50] 85");
eq("need over 100", out(calc(["60", "40", "60", "40", "", "", "90"])), "60 40 60 40 [210] [20] 90 || Final exam grade: Value must be between 0% and 100%");
eq("weights add to 50", out(calc(["80", "10", "70", "20", "90", "20", ""])), "80 10 70 20 90 20 [40]");
eq("two blank weights not solved", out(calc(["80", "20", "70", "", "90", "", "82"])), "MISSING secondWeight");
eq("no final grade: only the weight", out(calc(["80", "20", "70", "30", "", "", ""])), "MISSING finalGrade");
eq("decimals", out(calc(["77.777", "33.33", "81.234", "33.33", "91.119", "", ""])), "77.777 33.33 81.234 33.33 91.119 [33.34] [83.38]");
eq("decimals need final", out(calc(["77.777", "33.33", "81.234", "33.33", "", "", "85.555"])), "77.777 33.33 81.234 33.33 [97.65] [33.34] 85.555");

// ── Solving other boxes ──
eq("first grade solved (omni display)", out(calc(["", "30", "70", "30", "90", "40", "80"])), "[76.67] 30 70 30 90 40 80");
eq("all filled → semester grade recalculated", out(calc(["80", "30", "70", "30", "90", "40", "12"])), "80 30 70 30 90 40 [81]");
eq("weight solved negative", out(calc(["80", "60", "70", "60", "90", "", ""])),
  "80 60 70 60 90 [-20] [72] || Final exam weight: Value must be between 0% and 100%");
eq("need a negative grade", out(calc(["100", "50", "100", "40", "", "", "50"])), "100 50 100 40 [-400] [10] 50 || Final exam grade: Value must be between 0% and 100%");
eq("zero weight can't solve its grade", out(calc(["80", "50", "70", "50", "", "0", "75"])), "ERR Final exam weight is 0%, so the final exam grade can't be calculated.");
eq("half rounds away from zero", out(calc(["0.5", "1", "0", "0", "0", "99", ""])), "0.5 1 0 0 0 99 [0.01]");
eq("typed out of range", out(calc(["101", "-1", "", "", "", "", ""])), "ERR First quarter grade: Value must be between 0% and 100% | First quarter weight: Value must be between 0% and 100%");
eq("non-number", out(calc(["abc", "10", "", "", "", "", ""])), "ERR First quarter grade: Value must be between 0% and 100%");
eq("everything blank", out(calc([])), "MISSING firstWeight,secondWeight,firstGrade,secondGrade,finalGrade");
eq("article example (Elizabeth)", out(calc(["70", "40", "65", "30", "80", "", ""])), "70 40 65 30 80 [30] [71.5]");
eq("FAQ example", out(calc(["65", "30", "70", "40", "75", "30", ""])), "65 30 70 40 75 30 [70]");
eq("numbers for the pie", calc(["3", "4", "3", "5", "4", "", ""]).numbers.finalWeight, 91);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
