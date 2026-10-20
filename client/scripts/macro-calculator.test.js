// Plain-Node test suite for the Macro Calculator engine.
// Run with:
//   node scripts/macro-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/macro-calculator.html) via plain GET requests (the page's own script
// variables hold the unrounded plan and range values). A scratch comparator also diffed
// 650 random scenarios (US / metric, both sexes, ages, all activity levels and goals,
// both BMR formulas, low-Calorie and invalid cases) and 900 "Create Your Own" slider moves
// run through the reference's own slider script: all identical.

import { calculateMacros, slidePlan } from "../src/utils/macroCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const near = (name, actual, expected) => eq(name, Math.abs(actual - expected) < 1e-7 * Math.max(1, Math.abs(expected)), true);

const US = { age: "25", sex: "male", heightUnit: "ft-in", height: "5", height2: "10", weightUnit: "lb", weight: "165", activity: "1.465", goal: "m", formula: "mifflin", bodyFat: "20" };
const METRIC = { ...US, heightUnit: "cm", height: "180", height2: "", weightUnit: "kg", weight: "65" };
const run = (o = {}, base = US) => calculateMacros({ ...base, ...o });
const shown = (r) => `${r.calories} | ${Math.round(r.plans.balanced.protein)}/${Math.round(r.plans.balanced.carbs)}/${Math.round(r.plans.balanced.fat)} | P ${Math.round(r.ranges.protein[0])}-${Math.round(r.ranges.protein[1])} C ${Math.round(r.ranges.carbs[0])}-${Math.round(r.ranges.carbs[1])} F ${Math.round(r.ranges.fat[0])}-${Math.round(r.ranges.fat[1])} | <${r.sugar} <${r.saturatedFat} | ${r.kj}`;

// ── The reference's four screenshots ──
eq("US Mifflin", shown(run()), "2549 | 155/340/72 | P 75-218 C 272-462 F 58-101 | <68 <29 | 10672");
eq("US Katch 20%", shown(run({ formula: "katch" })), "2437 | 149/325/69 | P 75-208 C 260-438 F 55-97 | <65 <28 | 10203");
eq("metric Mifflin", shown(run({}, METRIC)), "2425 | 148/323/69 | P 65-207 C 259-446 F 55-96 | <65 <28 | 10153");
eq("metric Katch 20%", shown(run({ formula: "katch" }, METRIC)), "2188 | 133/292/62 | P 65-187 C 233-396 F 50-87 | <58 <25 | 9161");

// ── Exact unrounded values (the page's script variables) ──
const r = run();
near("balanced protein", r.plans.balanced.protein, 155.42682926829);
near("lowfat carbs", r.plans.lowfat.carbs, 356.86);
near("lowcarb fat", r.plans.lowcarb.fat, 86.897727272727);
near("high protein protein", r.plans.highprotein.protein, 217.59756097561);
near("carb upper", r.ranges.carbs[1], 461.95866986667);
near("protein lower = 1 g/kg", r.ranges.protein[0], 74.84268);

// ── Goals, sex, activity ──
eq("goals", ["m", "l", "l1", "l2", "g", "g1", "g2"].map((goal) => run({ goal }).calories).join(" "), "2549 2299 2049 1549 2799 3049 3549");
eq("goal text US", run({ goal: "l" }).goalText, "lose 0.5 lb per week");
eq("goal text 2 lb", run({ goal: "g2" }).goalText, "gain 2 lbs per week");
eq("goal text metric", run({ goal: "l" }, METRIC).goalText, "lose 0.25 kg per week");
eq("goal text maintain", run().goalText, "maintain your weight");
eq("female", run({ sex: "female" }).calories, 2305);
eq("BMR activity", run({ activity: "1" }).calories, 1740);
near("BMR: protein lower 0.83 g/kg", run({ activity: "1" }).ranges.protein[0], 62.1194244);
near("very active: protein lower 10% of kcal", run({ activity: "1.725" }, METRIC).ranges.protein[0], 69.634146341463);
eq("60 g floor", run({ activity: "1.2", weight: "55", height: "170" }, METRIC).ranges.protein[0], 60);
eq("decimal age", run({ age: "25.5" }, METRIC).calories, 2421);

// ── Low Calories: plans fall back to minimum protein / fat ──
const low = run({ age: "48", sex: "male", height: "4", height2: "8.9", weight: "221.8", activity: "1.55", goal: "l2", bodyFat: "44" });
near("low: balanced protein = minimum", low.plans.balanced.protein, 100.6067056);
near("low: balanced carbs = remainder", low.plans.balanced.carbs, 230.27000187733);
eq("low: balanced fat = 20%", low.plans.balanced.fat, 36.25);
const veryLow = run({ age: "40", sex: "female", height: "170", weight: "150", activity: "1.2", formula: "katch", bodyFat: "80" }, METRIC);
eq("very low: all plans equal", new Set(Object.values(veryLow.plans).map((p) => p.protein.toFixed(6))).size, 1);
near("very low: carbs never below the minimum", veryLow.plans.balanced.carbs, 130.34666666667);
eq("doctor message men < 1500", run({ age: "20", height: "170", weight: "53.1", activity: "1" }, METRIC).tooLow, true);
eq("men at 1500 ok", run({ age: "20", height: "170", weight: "53.2", activity: "1" }, METRIC).calories, 1500);
eq("doctor message women < 1200", run({ sex: "female", age: "20", height: "170", weight: "39.75", activity: "1" }, METRIC).tooLow, true);
eq("women at 1200 ok", run({ sex: "female", age: "20", height: "170", weight: "39.8", activity: "1" }, METRIC).calories, 1200);
eq("saturated fat x.5 rounds up", run({ age: "48", sex: "female", height: "4", height2: "1.1", weight: "98", activity: "1.9", goal: "g1", formula: "katch", bodyFat: "14" }).saturatedFat, 32);

// ── Validation (reference wording and order) ──
const err = (o, base = US) => (run(o, base).errors || []).join(" | ");
eq("age 17", err({ age: "17" }), "Please provide an age between 18 and 80.");
eq("age 81", err({ age: "81" }), "Please provide an age between 18 and 80.");
eq("age blank", err({ age: "" }), "Please provide an age between 18 and 80.");
eq("US height 0", err({ height: "0", height2: "0" }), "Please provide a reasonable height.");
eq("US height blank", err({ height: "", height2: "" }), "Please provide a reasonable height.");
eq("US negative inches", err({ height2: "-1" }), "Please provide positive height value.");
eq("US text feet", err({ height: "abc" }), "Please provide positive height value.");
eq("metric height blank", err({ height: "" }, METRIC), "Please provide positive height value.");
eq("weight blank", err({ weight: "" }), "Please provide positive weight value.");
eq("metric both 0", err({ height: "0", weight: "0" }, METRIC), "Please provide positive height value. | Please provide positive weight value.");
eq("body fat 2", err({ formula: "katch", bodyFat: "2.99" }), "Please provide a reasonable body fat percentage.");
eq("body fat 80.01", err({ formula: "katch", bodyFat: "80.01" }), "Please provide a reasonable body fat percentage.");
eq("body fat 3 ok", run({ formula: "katch", bodyFat: "3" }).calories > 0, true);
eq("body fat ignored with Mifflin", err({ bodyFat: "abc" }), "");
eq("all errors", err({ age: "", height: "", height2: "", weight: "", formula: "katch", bodyFat: "" }, METRIC), "Please provide an age between 18 and 80. | Please provide positive height value. | Please provide positive weight value. | Please provide a reasonable body fat percentage.");

// ── Create Your Own ──
const p1 = slidePlan(r, r.plans.balanced, "protein", 120);
near("slide protein keeps Calories", p1.protein * 4.1 + p1.carbs * 3.75 + p1.fat * 8.8, r.calories);
eq("slide protein value", p1.protein, 120);
const p2 = slidePlan(r, r.plans.balanced, "fat", r.ranges.fat[1]);
eq("slide fat to max", Math.round(p2.fat), Math.round(r.ranges.fat[1]));

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
