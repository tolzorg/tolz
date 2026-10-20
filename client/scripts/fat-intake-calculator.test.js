// Plain-Node test suite for the Fat Intake Calculator engine.
// Run with:
//   node scripts/fat-intake-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/fat-intake-calculator.html) via plain GET requests. A scratch comparator also
// diffed random scenarios (US / metric, both sexes, ages, all activity levels, both BMR formulas,
// zero / tiny heights and weights, invalid cases) against the reference's page: all identical.

import { calculateFatIntake, formatNumber as N } from "../src/utils/fatIntakeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const US = { age: "25", sex: "male", heightUnit: "ft-in", height: "5", height2: "10", weightUnit: "lb", weight: "160", activity: "1.375", formula: "mifflin", bodyFat: "20" };
const METRIC = { ...US, heightUnit: "cm", height: "180", height2: "", weightUnit: "kg", weight: "60" };
const run = (o = {}, base = US) => calculateFatIntake({ ...base, ...o });
/** The result table as the reference prints it (or its errors). */
const table = (r) => r.errors ? r.errors.join(" | ")
  : r.rows.map((w) => `${w.label} | ${N(w.calories)} | ${N(w.fat[0])} - ${N(w.fat[1])} | <${N(w.saturated)} | <${N(w.heart)}`).join("\n");
const rowsOf = (r, i) => table(r).split("\n")[i];

// ── The reference's four screenshots ──
eq("US Mifflin", table(run()), [
  "Weight Maintenance | 2,361 | 54 - 94 | <27 | <19",
  "Lose 1 lb/week | 1,861 | 42 - 74 | <21 | <15",
  "Lose 2 lb/week | 1,361 | 31 - 54 | <15 | <11",
  "Gain 1 lb/week | 2,861 | 65 - 114 | <33 | <23",
  "Gain 2 lb/week | 3,361 | 76 - 134 | <38 | <27",
].join("\n"));
eq("US Katch 20%", table(run({ formula: "katch" })), [
  "Weight Maintenance | 2,233 | 51 - 89 | <25 | <18",
  "Lose 1 lb/week | 1,733 | 39 - 69 | <20 | <14",
  "Lose 2 lb/week | 1,233 | 28 - 49 | <14 | <10",
  "Gain 1 lb/week | 2,733 | 62 - 109 | <31 | <22",
  "Gain 2 lb/week | 3,233 | 73 - 129 | <37 | <26",
].join("\n"));
eq("metric Mifflin", table(run({}, METRIC)), [
  "Weight Maintenance | 2,207 | 50 - 88 | <25 | <18",
  "Lose 0.5 kg/week | 1,707 | 39 - 68 | <19 | <14",
  "Lose 1 kg/week | 1,207 | 27 - 48 | <14 | <10",
  "Gain 0.5 kg/week | 2,707 | 62 - 108 | <31 | <22",
  "Gain 1 kg/week | 3,207 | 73 - 128 | <36 | <26",
].join("\n"));
eq("metric Katch 20%", table(run({ formula: "katch" }, METRIC)), [
  "Weight Maintenance | 1,934 | 44 - 77 | <22 | <15",
  "Lose 0.5 kg/week | 1,434 | 33 - 57 | <16 | <11",
  "Lose 1 kg/week | 934 | 21 - 37 | <11 | <7",
  "Gain 0.5 kg/week | 2,434 | 55 - 97 | <28 | <19",
  "Gain 1 kg/week | 2,934 | 67 - 117 | <33 | <23",
].join("\n"));

// ── Under 19 the daily fat range starts at 25% (the reference header still says 20-35%) ──
eq("age 18", rowsOf(run({ age: "18" }, METRIC), 0), "Weight Maintenance | 2,255 | 64 - 90 | <26 | <18");
eq("age 18.99", rowsOf(run({ age: "18.99" }, METRIC), 0), "Weight Maintenance | 2,248 | 64 - 89 | <26 | <18");
eq("age 19", rowsOf(run({ age: "19" }, METRIC), 0), "Weight Maintenance | 2,248 | 51 - 89 | <26 | <18");
eq("share", [run({ age: "18" }).lowShare, run().lowShare].join(), "0.25,0.2");

// ── Nothing is clamped (reference behaviour); −0 shows as 0 ──
eq("negative Calories", rowsOf(run({ age: "80", sex: "female", height: "100", weight: "30", activity: "1.2" }, METRIC), 1), "Lose 0.5 kg/week | -63 | -1 - -3 | <-1 | <-1");
eq("minus zero", rowsOf(run({ age: "80", sex: "female", height: "100", weight: "34.17", activity: "1.2" }, METRIC), 1), "Lose 0.5 kg/week | -13 | 0 - -1 | <0 | <0");
eq("metric 0 height", rowsOf(run({ height: "0", weight: "0" }, METRIC), 0), "Weight Maintenance | -165 | -4 - -7 | <-2 | <-1");
eq("US 0 ft 0 in", rowsOf(run({ height: "0", height2: "0" }), 0), "Weight Maintenance | 833 | 19 - 33 | <9 | <7");
eq("0 kg, Katch", rowsOf(run({ weight: "0", formula: "katch", bodyFat: "80" }, METRIC), 1), "Lose 0.5 kg/week | 9 | 0 - 0 | <0 | <0");
eq("negative US", rowsOf(run({ sex: "female", height: "0", height2: "1", weight: "1", activity: "1.2" }), 2), "Lose 2 lb/week | -1,319 | -30 - -52 | <-15 | <-10");

// ── Validation (reference wording and order) ──
eq("all errors", table(run({ age: "17", height: "", weight: "", formula: "katch", bodyFat: "2" }, METRIC)),
  "Please provide an age between 18 and 80. | Please provide positive height value. | Please provide positive weight value. | Please provide a reasonable body fat percentage.");
eq("US negative inches + text weight", table(run({ height2: "-1", weight: "abc" })), "Please provide positive height value. | Please provide positive weight value.");
eq("US blank feet", table(run({ height: "" })), "Please provide positive height value.");
eq("US blank inches", table(run({ height2: "" })), "Please provide positive height value.");
eq("US both blank", table(run({ height: "", height2: "" })), "Please provide positive height value.");
eq("metric negative", table(run({ height: "-1", weight: "-1" }, METRIC)), "Please provide positive height value. | Please provide positive weight value.");
eq("metric text height", table(run({ height: "abc", weight: "0" }, METRIC)), "Please provide positive height value.");
eq("body fat 3 / 80 ok", [run({ formula: "katch", bodyFat: "3" }).errors, run({ formula: "katch", bodyFat: "80" }).errors].join(), ",");
eq("body fat ignored with Mifflin", run({ bodyFat: "abc" }).errors, undefined);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
