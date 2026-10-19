// Plain-Node test suite for the Ideal Weight Calculator engine.
// Run with:
//   node scripts/ideal-weight-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/ideal-weight-calculator.html) via plain GET requests. A
// scratch comparator also diffed 900 random scenarios (US / metric, both
// sexes, ages 1.5-81 incl. children, heights 90-210 cm): all identical.

import { calculateIdealWeight, IDEAL_WEIGHT_DEFAULTS } from "../src/utils/idealWeightCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const us = (o = {}) => calculateIdealWeight({ ...IDEAL_WEIGHT_DEFAULTS, ...o });
const metric = (o = {}) => calculateIdealWeight({ ...IDEAL_WEIGHT_DEFAULTS, heightUnit: "cm", height: "180", height2: "", resultUnit: "kg", ...o });
const show = (r) => {
  if (r.errors) return r.errors.join(" | ");
  if (!r.formulas) return r.sentence;
  return `${r.formulas.map((f) => f.value).join(" | ")} | BMI ${r.healthyRange}`;
};

// ── The reference's examples ──
eq("US male", show(us()), "156.5 lbs | 155.0 lbs | 160.9 lbs | 165.3 lbs | BMI 128.9 - 174.2 lbs");
eq("formula names", us().formulas.map((f) => f.name).join(", "), "Robinson (1983), Miller (1983), Devine (1974), Hamwi (1964)");
eq("US female", show(us({ sex: "female" })), "145.5 lbs | 147.0 lbs | 151.0 lbs | 148.8 lbs | BMI 128.9 - 174.2 lbs");
eq("metric male", show(metric()), "72.6 kg | 71.5 kg | 75.0 kg | 77.3 kg | BMI 59.9 - 81.0 kg");
eq("7 ft", show(us({ height: "7", height2: "0" })), "215.2 lbs | 198.5 lbs | 231.9 lbs | 248.7 lbs | BMI 185.7 - 250.9 lbs");
eq("lb = kg × 2.2046 (177.2, not 177.3)", us({ age: "54.8", height: "6", height2: "0.0" }).formulas[3].value, "177.2 lbs");
eq("Devine 169.0", us({ age: "52.9", height: "5", height2: "11.6" }).formulas[2].value, "169.0 lbs");

// ── Children (2-20): CDC 5th-85th percentile BMI ──
eq("age 17", us({ age: "17" }).healthyRange, "123.4 - 173.5 lbs");
eq("age 10", us({ age: "10" }).healthyRange, "99.0 - 135.2 lbs");
eq("age 2", us({ age: "2" }).healthyRange, "102.4 - 126.8 lbs");
eq("age 20 still a child", us({ age: "20" }).healthyRange, "133.1 - 188.2 lbs");
eq("age 20.5 adult", us({ age: "20.5" }).healthyRange, "128.9 - 174.2 lbs");
eq("girl 10", us({ age: "10", sex: "female" }).healthyRange, "97.6 - 138.7 lbs");
eq("formulas still shown for children", us({ age: "10" }).formulas.length, 4);

// ── 5 ft or shorter: sentence only ──
eq("4 ft adult", show(us({ height: "4", height2: "0" })), "According to the World Health Organization's recommendations, your healthy weight range is 60.6 - 81.9 lbs.");
eq("exactly 5 ft", show(us({ height: "5", height2: "0" })), "According to the World Health Organization's recommendations, your healthy weight range is 94.7 - 128.0 lbs.");
eq("5 ft 0.1 in has formulas", show(us({ height: "5", height2: "0.1" })), "115.1 lbs | 124.2 lbs | 110.7 lbs | 106.4 lbs | BMI 95.0 - 128.4 lbs");
eq("152.4 cm sentence", show(metric({ height: "152.4" })), "According to the World Health Organization's recommendations, your healthy weight range is 43.0 - 58.1 kg.");
eq("152.41 cm formulas", show(metric({ height: "152.41" })), "52.0 kg | 56.2 kg | 50.0 kg | 48.0 kg | BMI 43.0 - 58.1 kg");
eq("boy 4 ft", show(us({ age: "10", height: "4", height2: "0" })), "Based on the CDC chart for boys, the healthy weight range is 46.5 - 63.6 lbs.");
eq("girl 15 metric", show(metric({ age: "15", sex: "female", height: "152.4" })), "Based on the CDC chart for girls, the healthy weight range is 37.9 - 55.7 kg.");
eq("1 m adult", show(metric({ height: "100" })), "According to the World Health Organization's recommendations, your healthy weight range is 18.5 - 25.0 kg.");

// ── Any height unit, any result unit ──
eq("cm in, lbs out", show(us({ heightUnit: "cm", height: "177.8", height2: "" })), show(us()));
eq("m / cm", show(metric({ heightUnit: "m-cm", height: "1", height2: "80" })), show(metric()));
eq("stones", us({ resultUnit: "st" }).formulas[0].value, "11 st 2.5 lb");
eq("stone range", us({ resultUnit: "st" }).healthyRange, "9 st 2.9 lb - 12 st 6.2 lb");

// ── Validation ──
eq("age 1", show(us({ age: "1" })), "Please provide an age between 2 and 80.");
eq("age 81", show(us({ age: "81" })), "Please provide an age between 2 and 80.");
eq("age 80 ok", us({ age: "80" }).formulas.length, 4);
eq("height 0", show(metric({ height: "0" })), "Please provide a positive height value.");
eq("blank ft / in", show(us({ height: "", height2: "" })), "Please provide a positive height value.");
eq("negative inches", show(us({ height2: "-1" })), "Please provide a positive height value.");
eq("both", show(us({ age: "abc", height: "abc" })), "Please provide an age between 2 and 80. | Please provide a positive height value.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
