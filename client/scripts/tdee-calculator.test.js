// Plain-Node test suite for the TDEE Calculator engine.
// Run with:
//   node scripts/tdee-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/tdee-calculator.html) via plain GET requests. A scratch comparator also diffed
// random scenarios (US / metric, both sexes, ages, every activity level including BMR, Calories and
// kJ, both BMR formulas, low-Calorie goals, thin and obese BMIs, invalid cases): all identical.

import { calculateTdee, formatNumber as N, formatBmi } from "../src/utils/tdeeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const US = { age: "25", sex: "male", heightUnit: "ft-in", height: "5", height2: "10", weightUnit: "lb", weight: "165", activity: "1.465", resultUnit: "calories", formula: "mifflin", bodyFat: "20" };
const METRIC = { ...US, heightUnit: "cm", height: "180", height2: "", weightUnit: "kg", weight: "65" };
const KJ = { resultUnit: "kilojoules" };
const run = (o = {}, base = US) => calculateTdee({ ...base, ...o });
/** "TDEE | BMI (category) | lose goals [| note] | gain goals" */
const shown = (r) => {
  if (r.errors) return r.errors.join(" | ");
  if (r.bmrOnly) return `BMR ${N(r.value)} ${r.unit}`;
  const goals = (list) => list ? list.map((g) => `${N(g.value)} ${g.percent}%`).join(", ") : "-";
  return [
    `${N(r.value)} ${r.unit}`, `${formatBmi(r.bmi.score)} ${r.bmi.category ?? ""}`.trim(), goals(r.lose),
    ...(r.loseNote ? [`consult: ${r.loseNote.rate}, ${N(r.loseNote.minimum)}`] : []), goals(r.gain),
  ].join(" | ");
};

// ── The reference's eight screenshots ──
eq("US Mifflin", shown(run()), "2,549 Calories | 23.7 Normal | 2,299 90%, 2,049 80%, 1,549 61% | 2,799 110%, 3,049 120%, 3,549 139%");
eq("US Katch", shown(run({ formula: "katch" })), "2,437 Calories | 23.7 Normal | 2,187 90%, 1,937 79% | consult: 2 lbs, 1,500 | 2,687 110%, 2,937 121%, 3,437 141%");
eq("US Katch kJ", shown(run({ formula: "katch", ...KJ })), "10,203 kJ | 23.7 Normal | 9,157 90%, 8,110 79% | consult: 2 lbs, 6,280 | 11,250 110%, 12,297 121%, 14,390 141%");
eq("US Mifflin kJ", shown(run(KJ)), "10,672 kJ | 23.7 Normal | 9,625 90%, 8,579 80%, 6,485 61% | 11,719 110%, 12,766 120%, 14,859 139%");
eq("metric Mifflin", shown(run({}, METRIC)), "2,425 Calories | 20.1 Normal | 2,175 90%, 1,925 79% | consult: 1 kg, 1,500 | 2,675 110%, 2,925 121%, 3,425 141%");
eq("metric Katch", shown(run({ formula: "katch" }, METRIC)), "2,188 Calories | 20.1 Normal | 1,938 89%, 1,688 77% | consult: 1 kg, 1,500 | 2,438 111%, 2,688 123%, 3,188 146%");
eq("metric Mifflin kJ", shown(run(KJ, METRIC)), "10,153 kJ | 20.1 Normal | 9,106 90%, 8,060 79% | consult: 1 kg, 6,280 | 11,200 110%, 12,246 121%, 14,340 141%");
eq("metric Katch kJ", shown(run({ formula: "katch", ...KJ }, METRIC)), "9,161 kJ | 20.1 Normal | 8,114 89%, 7,067 77% | consult: 1 kg, 6,280 | 10,207 111%, 11,254 123%, 13,348 146%");
const us = run();
eq("US labels", `${us.lose.map((g) => `${g.label} ${g.rate}`).join(", ")} / ${us.gain.map((g) => `${g.label} ${g.rate}`).join(", ")}`,
  "Mild weight loss 0.5 lb, Weight loss 1 lb, Extreme weight loss 2 lb / Mild weight gain 0.5 lb, Weight gain 1 lb, Fast Weight gain 2 lb");

// ── Women's 1,200 minimum, BMR only ──
eq("women: 1 lb dropped", shown(run({ sex: "female", height: "5", height2: "4", weight: "110", activity: "1.2" })), "1,475 Calories | 18.9 Normal | 1,225 83% | consult: 1 lb, 1,200 | 1,725 117%, 1,975 134%, 2,475 168%");
eq("women: kJ minimum", shown(run({ age: "79", sex: "female", height: "4", height2: "6", weight: "205", activity: "1.2", ...KJ })), "6,184 kJ | 49.4 Obese Class III | 5,137 83% | consult: 1 lb, 5,024 | -");
eq("all weight loss too low", shown(run({ age: "80", sex: "female", height: "150", weight: "45", activity: "1.2" }, METRIC)), "992 Calories | 20.0 Normal | - | 1,242 125%, 1,492 150%, 1,992 201%");
eq("BMR only", shown(run({ age: "60", sex: "female", height: "5", height2: "0", weight: "90", activity: "1" })), "BMR 900 Calories");
eq("BMR only kJ", shown(run({ activity: "1", ...KJ }, METRIC)), "BMR 6,929 kJ");

// ── BMI: categories, and the sections it switches (unrounded BMI > 18.5 / < 35) ──
eq("severe thinness", shown(run({ weight: "45", activity: "1.2" }, METRIC)), "1,746 Calories | 13.9 Severe thinness | - | 1,996 114%, 2,246 129%, 2,746 157%");
eq("mild thinness", run({ sex: "female", height: "5", height2: "4", weight: "100", activity: "1.2" }).bmi.category, "Mild thinness");
eq("moderate thinness, no loss", shown(run({ age: "48", height: "5", height2: "7", weight: "104", activity: "1.55" })), "2,016 Calories | 16.3 Moderate thinness | - | 2,266 112%, 2,516 125%, 3,016 150%");
const sections = (w) => { const r = run({ age: "30", weight: String(w) }, METRIC); return `${formatBmi(r.bmi.score)} ${r.lose ? "lose" : "-"} ${r.gain ? "gain" : "-"}`; };
eq("BMI exactly 18.5", sections(59.94), "18.5 - gain");
eq("BMI 18.503", sections(59.95), "18.5 lose gain");
eq("BMI 34.998", sections(113.395), "35.0 lose gain");
eq("BMI 35.0", sections(113.4), "35.0 lose -");
eq("obese III", shown(run({ weight: "150", activity: "1.2" }, METRIC)), "3,006 Calories | 46.3 Obese Class III | 2,756 92%, 2,506 83%, 2,006 67% | -");
eq("category from unrounded BMI 17.04", run({ age: "61", height: "6", height2: "11", weight: "167", formula: "katch", bodyFat: "15.5" }).bmi.category, "Mild thinness");
eq("category from unrounded BMI 25.03", run({ age: "47", sex: "female", height: "130.6", weight: "42.7" }, METRIC).bmi.category, "Overweight");
eq("category from unrounded BMI 16.02", run({ age: "28", sex: "female", height: "146.1", weight: "34.2", activity: "1.9" }, METRIC).bmi.category, "Moderate thinness");
eq("BMI thousands", formatBmi(run({ height: "10" }, METRIC).bmi.score), "6,500.0");
eq("age 20: score only", shown(run({ age: "20", weight: "59.7" }, METRIC)), "2,384 Calories | 18.4 | - | 2,634 110%, 2,884 121%, 3,384 142%");
eq("age 20.5: category", run({ age: "20.5" }, METRIC).bmi.category, "Normal");

// ── Validation (reference wording and order) ──
eq("all errors", shown(run({ age: "17", height: "0", weight: "0", formula: "katch", bodyFat: "2" }, METRIC)),
  "Please provide an age between 18 and 80. | Please provide positive height value. | Please provide positive weight value. | Please provide a reasonable body fat percentage.");
eq("US 0 ft 0 in", shown(run({ height: "0", height2: "0" })), "Please provide a reasonable height.");
eq("US 0 ft 9 in", shown(run({ height: "0", height2: "9" })), "Please provide a reasonable height.");
eq("US 0 ft 10 in ok", run({ height: "0", height2: "10" }).value, 1153);
eq("US blank inches ok", run({ height2: "" }).value, 2316);
eq("US negative inches + 0 lb", shown(run({ height2: "-1", weight: "0" })), "Please provide positive height value. | Please provide positive weight value.");
eq("metric text", shown(run({ height: "-1", weight: "abc" }, METRIC)), "Please provide positive height value. | Please provide positive weight value.");
eq("body fat 80 ok", run({ formula: "katch", bodyFat: "80" }, METRIC).value, 953);
eq("body fat 81", shown(run({ formula: "katch", bodyFat: "81" }, METRIC)), "Please provide a reasonable body fat percentage.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
