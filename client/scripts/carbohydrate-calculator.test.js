// Plain-Node test suite for the Carbohydrate Calculator engine.
// Run with:
//   node scripts/carbohydrate-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/carbohydrate-calculator.html) via plain GET requests. A scratch comparator
// also diffed random scenarios (US / metric, both sexes, ages, all activity levels, both BMR
// formulas, the 130-gram sentence layout and invalid cases) against the reference's page: all identical.

import { calculateCarbs, sentenceAmount, formatGrams, formatCalories, formatOz, formatLb } from "../src/utils/carbohydrateCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const US = { age: "25", sex: "male", heightUnit: "ft-in", height: "5", height2: "10", weightUnit: "lb", weight: "160", activity: "1.375", formula: "mifflin", bodyFat: "20" };
const METRIC = { ...US, heightUnit: "cm", height: "180", height2: "", weightUnit: "kg", weight: "60" };
const run = (o = {}, base = US) => calculateCarbs({ ...base, ...o });
/** One table row as the reference prints it. */
const row = (r, i) => {
  const w = r.rows[i];
  const cell = (g) => `${formatGrams(g)}` + (r.us ? ` (${formatOz(g)} Oz) (${formatLb(g)} lb)` : "");
  return [w.label, formatCalories(w.calories), ...w.grams.map(cell)].join(" | ");
};

// ── The reference's four screenshots ──
const usM = run();
eq("US Mifflin layout", usM.text, false);
eq("US Mifflin maintain", row(usM, 0), "Weight Maintenance | 2,361 | 252 (8.88 Oz) (0.555 lb) | 346 (12.21 Oz) (0.763 lb) | 409 (14.43 Oz) (0.902 lb) | 472 (16.66 Oz) (1.041 lb)");
eq("US Mifflin lose 1", row(usM, 1), "Lose 1 lb/week | 1,861 | 198 (7.00 Oz) (0.438 lb) | 273 (9.63 Oz) (0.602 lb) | 323 (11.38 Oz) (0.711 lb) | 372 (13.13 Oz) (0.821 lb)");
eq("US Mifflin lose 2", row(usM, 2), "Lose 2 lb/week | 1,361 | 145 (5.12 Oz) (0.320 lb) | 200 (7.04 Oz) (0.440 lb) | 236 (8.32 Oz) (0.520 lb) | 272 (9.60 Oz) (0.600 lb)");
eq("US Mifflin gain 1", row(usM, 3), "Gain 1 lb/week | 2,861 | 305 (10.76 Oz) (0.673 lb) | 420 (14.80 Oz) (0.925 lb) | 496 (17.49 Oz) (1.093 lb) | 572 (20.18 Oz) (1.261 lb)");
eq("US Mifflin gain 2", row(usM, 4), "Gain 2 lb/week | 3,361 | 358 (12.65 Oz) (0.790 lb) | 493 (17.39 Oz) (1.087 lb) | 583 (20.55 Oz) (1.284 lb) | 672 (23.71 Oz) (1.482 lb)");
const usK = run({ formula: "katch" });
eq("US Katch maintain", row(usK, 0), "Weight Maintenance | 2,233 | 238 (8.40 Oz) (0.525 lb) | 328 (11.55 Oz) (0.722 lb) | 387 (13.65 Oz) (0.853 lb) | 447 (15.75 Oz) (0.985 lb)");
eq("US Katch gain 2", row(usK, 4), "Gain 2 lb/week | 3,233 | 345 (12.16 Oz) (0.760 lb) | 474 (16.73 Oz) (1.045 lb) | 560 (19.77 Oz) (1.235 lb) | 647 (22.81 Oz) (1.426 lb)");
const mM = run({}, METRIC);
eq("metric Mifflin rows", mM.rows.map((_, i) => row(mM, i)).join("\n"), [
  "Weight Maintenance | 2,207 | 235 | 324 | 383 | 441",
  "Lose 0.5 kg/week | 1,707 | 182 | 250 | 296 | 341",
  "Lose 1 kg/week | 1,207 | 129 | 177 | 209 | 241",
  "Gain 0.5 kg/week | 2,707 | 289 | 397 | 469 | 541",
  "Gain 1 kg/week | 3,207 | 342 | 470 | 556 | 641",
].join("\n"));
const mK = run({ formula: "katch" }, METRIC);
eq("metric Katch lose 1 (under 130 g stays in the table)", row(mK, 2), "Lose 1 kg/week | 934 | 100 | 137 | 162 | 187");
eq("metric Katch layout", mK.text, false);
eq("big numbers", row(run({ age: "18", height: "8", height2: "0", weight: "700", activity: "1.9" }), 4),
  "Gain 2 lb/week | 9,767 | 1,042 (36.75 Oz) (2.297 lb) | 1,432 (50.53 Oz) (3.158 lb) | 1,693 (59.72 Oz) (3.732 lb) | 1,953 (68.90 Oz) (4.306 lb)");
eq("decimal inputs", row(run({ age: "25.5", height: "180.5", weight: "60.3", activity: "1.9" }, METRIC), 0), "Weight Maintenance | 3,056 | 326 | 448 | 530 | 611");

// ── The 130-gram sentence layout (40% of the unrounded maintenance Calories under 130 g) ──
eq("switch: 1,218.84 kcal → table", run({ weight: "1.07", activity: "1.2" }, METRIC).text, false);
eq("switch: 1,218.72 kcal → sentences", run({ weight: "1.06", activity: "1.2" }, METRIC).text, true);
const amount = (a) => a.kind === "min" ? "130" : `${a.kind === "low" ? "130" : formatGrams(a.lo) + " (40%)"} - ${formatGrams(a.hi)} (75%)` + ` [55% ${formatGrams(a.mid[0])}, 65% ${formatGrams(a.mid[1])}]`;
const sentences = (r) => r.rows.map((w) => `${formatCalories(w.calories)} ${w.goalText}: ${amount(sentenceAmount(w))}`).join("\n");
eq("US sentences", sentences(run({ age: "18", height: "0", height2: "5" })), [
  "990 maintain your weight: 130 - 198 (75%) [55% 145, 65% 172]",
  "490 lose 1 lb per week: 130",
  "-10 lose 2 lb per week: 130",
  "1,490 gain 1 lb per week: 159 (40%) - 298 (75%) [55% 219, 65% 258]",
  "1,990 gain 2 lb per week: 212 (40%) - 398 (75%) [55% 292, 65% 345]",
].join("\n"));
eq("metric sentences", sentences(run({ age: "80", sex: "female", height: "100", weight: "30", activity: "1.2" }, METRIC)), [
  "437 maintain your weight: 130",
  "-63 lose 0.5 kg per week: 130",
  "-563 lose 1 kg per week: 130",
  "937 gain 0.5 kg per week: 130 - 187 (75%) [55% 137, 65% 162]",
  "1,437 gain 1 kg per week: 153 (40%) - 287 (75%) [55% 211, 65% 249]",
].join("\n"));
eq("55% under 130 still listed", sentences(run({ weight: "0.1", activity: "1.2" }, METRIC)).split("\n")[1], "707 lose 0.5 kg per week: 130 - 141 (75%) [55% 104, 65% 123]");
eq("130 g in ounces / pounds", `${formatOz(130)} ${formatLb(130)}`, "4.59 0.287");
eq("negative Calories", formatCalories(run({ sex: "female", height: "0", height2: "1", weight: "1", activity: "1.2" }).rows[2].calories), "-1,319");

// ── Validation (reference wording and order) ──
const err = (o, base = US) => (run(o, base).errors || []).join(" | ");
eq("age 17", err({ age: "17" }), "Please provide an age between 18 and 80.");
eq("age 80.5", err({ age: "80.5" }), "Please provide an age between 18 and 80.");
eq("US height 0 / 0", err({ height: "0", height2: "0" }), "Please provide positive height value.");
eq("US 0 ft 5 in is fine", err({ height: "0", height2: "5" }), "");
eq("US negative inches / text weight", err({ height2: "-1", weight: "abc" }), "Please provide positive height value. | Please provide positive weight value.");
eq("all blank", err({ age: "", height: "", height2: "", weight: "" }), "Please provide an age between 18 and 80. | Please provide positive height value. | Please provide positive weight value.");
eq("metric all errors", err({ age: "17", height: "0", weight: "0", formula: "katch", bodyFat: "2" }, METRIC), "Please provide an age between 18 and 80. | Please provide positive height value. | Please provide positive weight value. | Please provide a reasonable body fat percentage.");
eq("body fat 80 ok", err({ formula: "katch", bodyFat: "80" }), "");
eq("body fat 81", err({ formula: "katch", bodyFat: "81" }), "Please provide a reasonable body fat percentage.");
eq("body fat ignored with Mifflin", err({ bodyFat: "abc" }), "");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
