// Plain-Node test suite for the Protein Calculator engine.
// Run with:
//   node scripts/protein-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/protein-calculator.html) via plain GET requests. A scratch comparator also
// diffed random scenarios (US / metric, both sexes, ages, all activity levels, both BMR formulas,
// tiny and zero heights / weights, invalid cases) against the reference's page: all identical.

import { calculateProtein } from "../src/utils/proteinCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const US = { age: "25", sex: "male", heightUnit: "ft-in", height: "5", height2: "10", weightUnit: "lb", weight: "160", activity: "1.375", formula: "mifflin", bodyFat: "20" };
const METRIC = { ...US, heightUnit: "cm", height: "180", height2: "", weightUnit: "kg", weight: "60" };
const run = (o = {}, base = US) => calculateProtein({ ...base, ...o });
/** ADA | CDC | WHO as the reference prints them. */
const shown = (r) => r.errors ? r.errors.join(" | ") : `${r.ada.map((x) => x.toLocaleString("en-US")).join(" - ")} | ${r.cdc.map((x) => x.toLocaleString("en-US")).join(" - ")} | ${r.who.toLocaleString("en-US")}`;

// ── The reference's screenshots ──
eq("US Mifflin", shown(run()), "73 - 131 | 58 - 202 | 60");
eq("metric Mifflin", shown(run({}, METRIC)), "60 - 108 | 54 - 188 | 50");
eq("metric Katch 20%", shown(run({ formula: "katch" }, METRIC)), "60 - 108 | 47 - 165 | 50");

// ── Activity: ADA 0.8-1 g/kg sedentary, 1-1.8 g/kg otherwise; CDC follows the Calories ──
eq("sedentary", shown(run({ activity: "1.2" }, METRIC)), "48 - 60 | 47 - 164 | 50");
eq("moderate", shown(run({ activity: "1.465" }, METRIC)), "60 - 108 | 57 - 201 | 50");
eq("active", shown(run({ activity: "1.55" }, METRIC)), "60 - 108 | 61 - 212 | 50");
eq("very active", shown(run({ activity: "1.725" }, METRIC)), "60 - 108 | 68 - 236 | 50");
eq("extra active", shown(run({ activity: "1.9" }, METRIC)), "60 - 108 | 74 - 260 | 50");
eq("female 80", shown(run({ age: "80", sex: "female", height: "100", weight: "30", activity: "1.2" }, METRIC)), "24 - 30 | 11 - 37 | 25");
eq("Katch 80% fat", shown(run({ formula: "katch", bodyFat: "80" }, METRIC)), "60 - 108 | 21 - 74 | 50");
eq("Katch 3% fat", shown(run({ formula: "katch", bodyFat: "3" }, METRIC)), "60 - 108 | 55 - 191 | 50");
eq("thousands", shown(run({ height: "6", height2: "0", weight: "2000", activity: "1.9" })), "907 - 1,633 | 468 - 1,637 | 753");

// ── Nothing is clamped (reference behaviour) ──
eq("metric 0 height and weight", shown(run({ height: "0", weight: "0" }, METRIC)), "0 - 0 | -4 - -14 | 0");
eq("US 0 lb", shown(run({ weight: "0" })), "0 - 0 | 33 - 116 | 0");
eq("US blank inches", shown(run({ height2: "" })), "73 - 131 | 52 - 183 | 60");
eq("US blank feet", shown(run({ height: "" })), "73 - 131 | 26 - 90 | 60");
eq("US 0 ft 0.1 in", shown(run({ height: "0", height2: "0.1" })), "73 - 131 | 20 - 71 | 60");
eq("tiny metric weight", shown(run({ age: "18", sex: "female", height: "50", weight: "1", activity: "1.2" }, METRIC)), "1 - 1 | 2 - 7 | 1");

// ── Validation (reference wording and order) ──
eq("age 17 + body fat 2", shown(run({ age: "17", height: "0", weight: "0", formula: "katch", bodyFat: "2" }, METRIC)), "Please provide an age between 18 and 80. | Please provide a reasonable body fat percentage.");
eq("body fat 2.99", shown(run({ formula: "katch", bodyFat: "2.99" }, METRIC)), "Please provide a reasonable body fat percentage.");
eq("body fat ignored with Mifflin", shown(run({ bodyFat: "abc" })), "73 - 131 | 58 - 202 | 60");
eq("US 0 ft 0 in", shown(run({ height: "0", height2: "0" })), "Please provide a positive height value.");
eq("US blank / 0", shown(run({ height: "", height2: "0" })), "Please provide a positive height value.");
eq("US negative inches + text weight", shown(run({ height2: "-1", weight: "abc" })), "Please provide a positive height value. | Please provide a positive weight value.");
eq("US all blank", shown(run({ height: "", height2: "", weight: "" })), "Please provide a positive height value. | Please provide a positive weight value.");
eq("US blank age and weight", shown(run({ age: "", weight: "" })), "Please provide an age between 18 and 80. | Please provide a positive weight value.");
eq("metric blank", shown(run({ height: "", weight: "" }, METRIC)), "Please provide a positive height value. | Please provide a positive weight value.");
eq("metric negative", shown(run({ height: "-5", weight: "-5" }, METRIC)), "Please provide a positive height value. | Please provide a positive weight value.");
eq("metric text", shown(run({ height: "abc", weight: "xyz" }, METRIC)), "Please provide a positive height value. | Please provide a positive weight value.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
