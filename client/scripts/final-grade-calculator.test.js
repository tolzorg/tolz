// Plain-Node test suite for the Final Grade Calculator engine.
// Run with:
//   node scripts/final-grade-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/final-grade) by entering each
// scenario in a browser and reading the Results box back.

import { calculateFinalGrade, visibleExamCount, toLetter, round2, IMPOSSIBLE, IMPOSSIBLE_LETTER, PASSED_WARNING, NO_WEIGHT_LEFT } from "../src/utils/finalGradeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const cur = (system, current, wanted, finalWeight) => calculateFinalGrade({ mode: "current", system, current, wanted, finalWeight });
const prev = (system, exams, wanted) => calculateFinalGrade({ mode: "previous", system, wanted, exams: exams.map(([grade, weight]) => ({ grade, weight })) });
const out = (r) => (r.errors ? `ERR ${r.errors.join(" | ")}` : `${r.value}${r.message ? ` | ${r.message.title ? `${r.message.title} ` : ""}${r.message.text}` : ""}${r.warnings.length ? ` || ${r.warnings.join(" / ")}` : ""}`);
const CONG = "CONGRATULATIONS! No matter what you do, you will get your desired grade or higher! Just check the requirements of your particular subject.";

// ── Percentage, previous exams (live) ──
eq("80% worth 40%, want 85", out(prev("percentage", [["80", "40"]], "85")), "88.33");
eq("final exam worth", prev("percentage", [["80", "40"]], "85").finalWeight, "60");
eq("3 decimals", out(prev("percentage", [["77.777", "33.3"]], "81.2345")), "82.96");
eq("3 decimals worth", prev("percentage", [["77.777", "33.3"]], "81.2345").finalWeight, "66.7");
eq("exactly 0 → congratulations", out(prev("percentage", [["100", "50"]], "50")), `0 | ${CONG}`);
eq("over 100 → impossible", out(prev("percentage", [["50", "50"]], "90")), `130 | ${IMPOSSIBLE}`);
eq("weights over 100%", out(prev("percentage", [["50", "60"], ["50", "60"]], "90")), "ERR The sum of all the weights must be from 0 to 100%, please fix it.");
eq("bad exam 1 + weight", out(prev("percentage", [["120", "-5"]], "150")),
  "ERR The percentage must be from 0% to 100%. Check the grade on exam number 1. | The percentage must be from 0% to 100%. Check the weight of exam 1.");
eq("exam 2 message wording", out(prev("percentage", [["50", "10"], ["101", "10"]], "60")), "ERR The percentage must be from 0 to 100%. Check the grade on exam number 2.");
eq("weight 100% → no weight left", out(prev("percentage", [["80", "100"]], "85")), `null | ${NO_WEIGHT_LEFT}`);

// ── Percentage, current grade (live) ──
eq("70, want 80, final 30%", out(cur("percentage", "70", "80", "30")), `103.33 | ${IMPOSSIBLE}`);
eq("90, want 80, final 30%", out(cur("percentage", "90", "80", "30")), "56.67");
eq("90, want 60, final 30%", out(cur("percentage", "90", "60", "30")), `-10 | ${CONG} || ${PASSED_WARNING}`);
eq("exactly 0: warning, no congratulations", out(cur("percentage", "100", "50", "50")), `0 || ${PASSED_WARNING}`);
eq("3 decimals", out(cur("percentage", "71.234", "80.5", "27.5")), `104.93 | ${IMPOSSIBLE}`);
eq("out of range", out(cur("percentage", "120", "180", "130")),
  "ERR Your current grade must be from 0 to 100%. | Your required grade must be from 0 to 100%. | The weight of the final exam must be between 0% to 100%.");
eq("final weight 0", out(cur("percentage", "70", "50", "0")), "ERR The weight of the final exam must be between 0% to 100%.");

// ── Numbers (live for previous exams; current grade uses the corrected same-scale formula) ──
eq("numbers prev 7 worth 40%, want 8", out(prev("numbers", [["7", "40"]], "8")), "8.67");
eq("numbers prev 170 worth 40%, want 8", out(prev("numbers", [["170", "40"]], "8")), `-100 | ${CONG}`);
eq("numbers prev: no 0–100 limit", out(prev("numbers", [["170", "40"]], "800")).startsWith("1,2"), true);
eq("numbers current 7, want 8, 30%", out(cur("numbers", "7", "8", "30")), "10.333");
eq("numbers current 9, want 6, 30%", out(cur("numbers", "9", "6", "30")), `-1 | ${CONG} || ${PASSED_WARNING}`);
eq("numbers negatives", out(cur("numbers", "-7", "-8", "30")), "ERR You cannot have a negative grade. | The required (passing) grade must be greater than zero.");

// ── Letter systems (live) ──
eq("USA std B → A, 30%", out(cur("usaStandard", "8450", "9450", "30")), `null | ${IMPOSSIBLE_LETTER}`);
eq("USA std A− → B+, 40%", out(cur("usaStandard", "9100", "8800", "40")), "B");
eq("USA std A+ → F, 40%", out(cur("usaStandard", "9825", "2975", "40")), "No grade (0)");
eq("Canada A 50%, want A−", out(prev("canada", [["9050", "50"]], "8300")), "B");
eq("Canada A 20% + B 20%, want A−", out(prev("canada", [["9050", "20"], ["7450", "20"]], "8300")), "A\u2212");
eq("USA std A 20% + B 20%, want A−", out(prev("usaStandard", [["9450", "20"], ["8450", "20"]], "9100")), "A\u2212");
eq("USA std weight 100%", out(prev("usaStandard", [["9450", "100"]], "9100")), `null | ${NO_WEIGHT_LEFT}`);
eq("USA std current weight 0", out(cur("usaStandard", "8450", "9450", "0")), "ERR The weight of the final exam must be between 0% to 100%.");

// ── Thresholds and rounding ──
eq("USA std 9637 → A+", toLetter("usaStandard", 9637), "A+");
eq("USA std 9636.99 → A", toLetter("usaStandard", 9636.99), "A");
eq("10000 is possible", toLetter("gcse", 10000), "A*");
eq("10000.01 is impossible", toLetter("gcse", 10000.01), null);
eq("negative → No grade (0)", toLetter("india", -1), "No grade (0)");
eq("India 1825 → E1", toLetter("india", 1825), "E1");
eq("round2 half away from zero", round2(1.005), 1.01);
eq("round2 negative", round2(-88.335), -88.34);
eq("round2 tiny", round2(1e-7), 0);

// ── Exam rows ──
eq("one row when exam 1 blank", visibleExamCount("percentage", [{ grade: "" }]), 1);
eq("row 2 after a grade", visibleExamCount("percentage", [{ grade: "4" }, { grade: "" }]), 2);
eq("0 grade stops", visibleExamCount("percentage", [{ grade: "4" }, { grade: "0" }, { grade: "5" }]), 2);
eq("Canada shows exam 3", visibleExamCount("canada", [{ grade: "9050" }, { grade: "7450" }, { grade: "" }]), 3);
eq("No grade (0) stops", visibleExamCount("gcse", [{ grade: "0" }, { grade: "9500" }]), 1);
eq("nine at most", visibleExamCount("numbers", Array.from({ length: 9 }, () => ({ grade: "5" }))), 9);
eq("hidden rows don't count", out(prev("percentage", [["80", "40"], ["0", "10"], ["90", "30"]], "85")), `106 | ${IMPOSSIBLE}`);
eq("weights summing to 100 with float noise", out(prev("percentage", [["50", "10"], ["50", "20"], ["50", "70"]], "50")), `null | ${NO_WEIGHT_LEFT}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
