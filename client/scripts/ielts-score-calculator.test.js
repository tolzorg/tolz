// Plain-Node test suite for the IELTS Score Calculator engine.
// Run with:
//   node scripts/ielts-score-calculator.test.js
//
// Expected figures were read from the LIVE reference (omnicalculator.com/other/ielts-score) by typing each
// scenario into its boxes in a browser and reading every box back.

import {
  calculateOverall, pickUnknown, listeningBand, readingBand, formatDecimal, decimalOf, skillLevel,
  LISTENING_TABLE, READING_TABLES,
} from "../src/utils/ieltsScoreCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const V = (l, r, s, w, a = "") => ({ listening: String(l), reading: String(r), speaking: String(s), writing: String(w), average: String(a) });
/** Average hidden: the four scores → "average | IELTS score" (or the errors). */
const overall = (l, r, s, w) => {
  const res = calculateOverall(V(l, r, s, w), "average");
  return res.errors ? res.errors.join(" | ") : `${res.average} | ${res.overall}`;
};
/** Average shown, one box blank → "solved | IELTS score | warning". */
const solve = (values, state = {}) => {
  const pick = pickUnknown({ values, showAverage: true, ...state });
  if (pick.missing) return `missing ${pick.missing.join(",")}`;
  const res = calculateOverall(values, pick.unknown);
  return res.errors ? res.errors.join(" | ") : `${pick.unknown}=${res.solved} | ${res.overall}${res.warning ? ` | ${res.warning}` : ""}`;
};

// ── Overall score (live: rounding to the nearest half, .25 and .75 up) ──
eq("5,3,6,2 (screenshot)", overall(5, 3, 6, 2), "4 | 4");
eq("6.25 → 6.5", overall(6.5, 6.5, 5, 7), "6.25 | 6.5");
eq("6.75 → 7", overall(7, 7, 6.5, 6.5), "6.75 | 7");
eq("6.125 → 6", overall(6, 6, 6, 6.5), "6.125 | 6");
eq("8.75 → 9", overall(9, 9, 8.5, 8.5), "8.75 | 9");
eq("all 0", overall(0, 0, 0, 0), "0 | 0");
eq("decimals accepted", overall(6.3, 6.1, 6, 6), "6.1 | 6");

// ── Omni's average display (live) ──
eq("6.2125 → 6.213", overall(6.3, 6.1, 6.2, 6.25), "6.213 | 6");
eq("1.08333325 → 1.0833", overall(1, 1, 1.3333333, 1), "1.0833 | 1");
eq("1.0125", overall(1, 1, 1, 1.05), "1.0125 | 1");
eq("1.00025 → 1.0003", overall(1, 1, 1, 1.001), "1.0003 | 1");
eq("1.000025 → 1", overall(1, 1, 1, 1.0001), "1 | 1");
eq("0.0125", overall(0, 0, 0, 0.05), "0.0125 | 0");
eq("0.00025", overall(0, 0, 0, 0.001), "0.00025 | 0");
eq("2.00375 → 2.0038", overall(2, 2, 2, 2.015), "2.0038 | 2");
eq("1.000375 → 1.0004", overall(1, 1, 1, 1.0015), "1.0004 | 1");
eq("5.123456 → 5.123", overall(5.493824, 5, 5, 5), "5.123 | 5");

// ── Validation (live wording) ──
eq("10 out of range", overall(10, 6, 6, 6), "Listening score must be between 0 and 9.");
eq("-1 out of range", overall(-1, 6, 6, 6), "Listening score must be between 0 and 9.");
eq("each field", overall(9.5, -0.5, 6, 12), "Listening score must be between 0 and 9. | Reading score must be between 0 and 9. | Writing score must be between 0 and 9.");
eq("text", overall("abc", 6, 6, 6), "Please enter a valid number for the Listening score.");
eq("commas", overall("6", "6", "6", "6"), "6 | 6");

// ── Solving for the missing box (live) ──
eq("solve writing", solve(V(6, 6, 6, "", 7)), "writing=10 | 7 | Writing score must be between 0 and 9.");
eq("solve writing 21", solve(V(5, 5, 5, "", 9)), "writing=21 | 9 | Writing score must be between 0 and 9.");
eq("solve listening 7.2", solve(V("", 6, 6, 6, 6.3)), "listening=7.2 | 6.5");
eq("solve listening 6.444", solve(V("", 6, 6, 6, 6.111111)), "listening=6.444 | 6");
eq("solve listening 3,982.5", solve(V("", 6, 6, 6, 1000.123456)), "listening=3,982.5 | 1,000 | Listening score must be between 0 and 9.");
eq("solve listening 30", solve(V("", 6, 6, 6, 12.0001)), "listening=30 | 12 | Listening score must be between 0 and 9.");
eq("solve listening -22.95", solve(V("", 9, 9, 9, 1.0123)), "listening=-22.95 | 1 | Listening score must be between 0 and 9.");
eq("average box shown, average blank", solve(V(5, 3, 6, 2)), "average=4 | 4");
eq("two blanks", solve(V("", "", 6, 6, 6)), "missing listening,reading");
eq("average + one blank", solve(V("", 6, 6, 6)), "missing listening");
// All five filled: the box last filled in by a calculation, else the one typed least recently (live: L, R, S, W
// typed, the average filled in, then the average typed over as 5 → Listening becomes 9).
const order = ["listening", "reading", "speaking", "writing", "average"];
eq("all five, typed over", solve(V(5, 3, 6, 2, 5), { editOrder: order }), "listening=9 | 5");
eq("all five, recalculate solved", solve(V(9, 3, 6, 2, 5), { solved: "listening", editOrder: ["reading", "speaking", "writing", "average"] }), "listening=9 | 5");
eq("hidden average ignored", calculateOverall(V(5, 3, 6, 2, 9), pickUnknown({ values: V(5, 3, 6, 2, 9), showAverage: false }).unknown).overall, "4");
eq("hidden average: needs all four", pickUnknown({ values: V(5, "", 6, ""), showAverage: false }).missing.join(), "reading,writing");

// ── Listening and reading bands (live) ──
eq("listening 25 (screenshot)", listeningBand("25").band, 6);
eq("listening 10", listeningBand("10").band, 0);
eq("listening 10.5", listeningBand("10.5").band, 0);
eq("listening 40", listeningBand("40").band, 9);
eq("listening 41", listeningBand("41").errors[0], "Listening correct answers must be between 0 and 40.");
eq("listening -1", listeningBand("-1").errors[0], "Listening correct answers must be between 0 and 40.");
eq("listening each band", [0, 11, 12, 13, 16, 18, 23, 26, 30, 32, 35, 37, 39].map((p) => listeningBand(String(p)).band).join(), "0,4,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9");
eq("reading general 24 (screenshot)", readingBand("24", "general").band, 5);
eq("reading general 5", readingBand("5", "general").band, 0);
eq("reading general 5.9", readingBand("5.9", "general").band, 0);
eq("reading general 34", readingBand("34", "general").band, 7);
eq("reading general 40", readingBand("40", "general").band, 9);
eq("reading 41", readingBand("41", "general").errors[0], "Reading correct answers must be between 0 and 40.");
eq("reading academic 3", readingBand("3", "academic").band, 0);
eq("reading academic 4", readingBand("4", "academic").band, 2.5);
eq("reading academic 24", readingBand("24", "academic").band, 6);
eq("reading academic 34", readingBand("34", "academic").band, 7.5);
eq("reading academic 40", readingBand("40", "academic").band, 9);
eq("general table", READING_TABLES.general.map(([r, b]) => `${r}:${b}`).join(" "), "40:9 39:8.5 37-38:8 36:7.5 34-35:7 32-33:6.5 30-31:6 27-29:5.5 23-26:5 19-22:4.5 15-18:4 12-14:3.5 9-11:3 6-8:2.5");
eq("academic table", READING_TABLES.academic.map(([r, b]) => `${r}:${b}`).join(" "), "39-40:9 37-38:8.5 35-36:8 33-34:7.5 30-32:7 27-29:6.5 23-26:6 19-22:5.5 15-18:5 13-14:4.5 10-12:4 8-9:3.5 6-7:3 4-5:2.5");
eq("listening table", LISTENING_TABLE.map(([r, b]) => `${r}:${b}`).join(" "), "39-40:9 37-38:8.5 35-36:8 32-34:7.5 30-31:7 26-29:6.5 23-25:6 18-22:5.5 16-17:5 13-15:4.5 11-12:4");

// ── Helpers ──
eq("format negative small", formatDecimal(decimalOf("-0.000123456")), "-0.00012346");
eq("format exponent", formatDecimal(decimalOf("1.5e3")), "1,500");
eq("too long", decimalOf("1".repeat(41)), null);
eq("skill levels", [9, 6.5, 0, 9.5].map((s) => String(skillLevel(s))).join(" | "), "Expert user | Competent user / Good user | Did not attempt the test | null");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
