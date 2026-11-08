// Plain-Node test suite for the Test Grade Calculator engine.
// Run with:
//   node scripts/test-grade-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/test-grade) by entering each scenario
// in a browser and reading the boxes, sentence and grade table back.

import { calculateTestGrade, gradeTable, sentenceGrade, limitAlerts, DEFAULT_LIMITS, FIELDS, MAX_TABLE_ROWS } from "../src/utils/testGradeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, value], …] in typing order. */
const calc = (typed, limits = DEFAULT_LIMITS) => {
  const values = Object.fromEntries(FIELDS.map((k) => [k, ""]));
  for (const [k, v] of typed) values[k] = v;
  return calculateTestGrade(values, typed.map(([k]) => k), limits);
};
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : `${FIELDS.map((k) => (r.solved.includes(k) ? `[${r.values[k]}]` : r.values[k])).join(" ")} → ${r.grade ?? "-"}${r.alerts.length ? ` || ${r.alerts.join(" / ")}` : ""}`);
const table = (t, inc, limits = DEFAULT_LIMITS) => { const r = gradeTable(t, inc, limits); return r ? r.rows.map((row) => row.join(" ")).join(" | ") : null; };

// ── Boxes and sentence (live) ──
eq("screenshot 3 points, 2 wrong", out(calc([["total", "3"], ["wrong", "2"]])), "3 2 [1] [33.33] → F");
eq("points + percentage", out(calc([["total", "40"], ["percentage", "85"]])), "40 [6] [34] 85 → B");
eq("correct + percentage", out(calc([["right", "17"], ["percentage", "85"]])), "[20] [3] 17 85 → B");
eq("96.996% shows 97 but is an A", out(calc([["total", "1000"], ["right", "969.96"]])), "1000 [30.04] 969.96 [97] → A");
eq("100% → A/A+", out(calc([["total", "3"], ["right", "3"]])), "3 [0] 3 [100] → A/A+");
eq("correct > points", out(calc([["total", "3"], ["right", "4"]])),
  "3 [-1] 4 [133.33] → - || Number wrong cannot be negative. / Percentage grade must be between 0% and 100%, inclusively. / Number correct cannot be greater than the total number of questions.");
eq("three typed: least recent recalculated", out(calc([["total", "10"], ["wrong", "2"], ["right", "5"]])), "[7] 2 5 [71.43] → C-");
eq("percentage alone gives the grade", out(calc([["percentage", "85"]])), "   85 → B");
eq("wrong limits still used", out(calc([["total", "100"], ["right", "95"]], { ...DEFAULT_LIMITS, Aplus: "90" })),
  "100 [5] 95 [95] → A/A+ || A+ limit must be higher or equal to A limit.");

eq("article: 18 questions, 3 wrong", out(calc([["total", "18"], ["wrong", "3"]])), "18 3 [15] [83.33] → B");
eq("FAQ: 27 out of 40", out(calc([["total", "40"], ["right", "27"]])), "40 [13] 27 [67.5] → D+");
eq("FAQ: 7 wrong out of 40", out(calc([["total", "40"], ["wrong", "7"]])), "40 7 [33] [82.5] → B-");
eq("FAQ: 75 out of 80", out(calc([["total", "80"], ["right", "75"]])), "80 [5] 75 [93.75] → A");

// ── Solving (extra) ──
eq("wrong + percentage solved here", out(calc([["wrong", "3"], ["percentage", "85"]])), "[20] 3 [17] 85 → B");
eq("wrong + correct", out(calc([["wrong", "2"], ["right", "1"]])), "[3] 2 1 [33.33] → F");
eq("percentage half up", out(calc([["total", "8"], ["right", "7.0004"]])), "8 [0.9996] 7.0004 [87.51] → B+");
eq("solved points: omni display", out(calc([["right", "10"], ["percentage", "30"]])), "[33.33] [23.333] 10 30 → F");
eq("0 points", out(calc([["total", "0"], ["wrong", "0"]])), "ERR Number of points or questions must be greater than 0.");
eq("one box only", out(calc([["total", "5"]])), "MISSING right");
eq("nothing", out(calc([])), "MISSING total,right");
eq("not a number", out(calc([["total", "x"], ["right", "1"]])), "ERR Please enter a number for the number of points / questions.");

// ── Sentence variants ──
eq("97 → A/A+", sentenceGrade(97, DEFAULT_LIMITS), "A/A+");
eq("96.999 → A", sentenceGrade(96.999, DEFAULT_LIMITS), "A");
eq("59.99 → F", sentenceGrade(59.99, DEFAULT_LIMITS), "F");
eq("60 → D-", sentenceGrade(60, DEFAULT_LIMITS), "D-");
eq("100.01 → none", sentenceGrade(100.01, DEFAULT_LIMITS), null);
eq("limit order ok", limitAlerts(DEFAULT_LIMITS).length, 0);

// ── Grade table (live) ──
eq("3 by 1", table("3", "1"), "3 0 100% A+ | 2 1 66.67% D | 1 2 33.33% F | 0 3 0% F");
eq("0.5 by 0.2 (float steps)", table("0.5", "0.2"), "0.5 0 100% A+ | 0.3 0.2 60% D- | 0.1 0.4 20% F");
eq("7 by 2.5", table("7", "2.5"), "7 0 100% A+ | 4.5 2.5 64.29% D | 2 5 28.57% F");
eq("increment below 0.1", table("1", "0.09"), null);
eq("0.3 by 0.1 skips 0 (float drift)", table("0.3", "0.1"), "0.3 0 100% A+ | 0.2 0.1 66.67% D | 0.1 0.2 33.33% F");
eq("table uses the exact points", calc([["wrong", "2"], ["percentage", "85"]]).tableTotal, String(40 / 3));
eq("capped", gradeTable("5000", "1", DEFAULT_LIMITS).rows.length, MAX_TABLE_ROWS);
eq("capped flag", gradeTable("5000", "1", DEFAULT_LIMITS).truncated, true);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
