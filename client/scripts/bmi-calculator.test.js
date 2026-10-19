// Plain-Node test suite for the BMI Calculator engine.
// Run with:
//   node scripts/bmi-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/bmi-calculator.html) via plain GET requests. A scratch
// comparator also diffed 3,000 random scenarios (US and metric, adults and
// children, decimal ages): all identical except two child height
// percentiles lying within 0.0002 of a rounding half far outside the chart
// curves (−13.4998 shown as −14, 111.5002 as 111).

import { calculateBmi, BMI_DEFAULTS } from "../src/utils/bmiCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const metric = (o = {}) => calculateBmi({ ...BMI_DEFAULTS, units: "metric", ...o });
const us = (o = {}) => calculateBmi({ ...BMI_DEFAULTS, units: "us", ...o });
function show(r) {
  if (r.errors) return r.errors.join(" | ");
  const parts = [`BMI = ${r.bmi} (${r.child ? r.percentile + "%, " : ""}${r.category}) needle=${r.gauge ? r.gauge.angle : "none"}`];
  if (r.child) parts.push(`W ${r.weightPercentile}% H ${r.heightPercentile}%`);
  parts.push(`range ${r.healthyBmi.lo}-${r.healthyBmi.hi}`, `weight ${r.healthyWeight.lo}-${r.healthyWeight.hi} ${r.unit}`);
  if (r.change) parts.push(`${r.change.verb} ${r.change.amount} to ${r.change.target}`);
  if (r.prime !== null) parts.push(`prime ${r.prime}`);
  parts.push(`PI ${r.ponderal}`);
  return parts.join(" | ");
}

// ── Defaults (the reference's examples) ──
eq("US default", show(us()), "BMI = 23 (Normal) needle=60 | range 18.5-25 | weight 128.9-174.2 lbs | prime 0.92 | PI 12.9");
eq("metric default", show(metric()), "BMI = 20.1 (Normal) needle=42.6 | range 18.5-25 | weight 59.9-81 kg | prime 0.8 | PI 11.1");
eq("female adult same", show(metric({ sex: "female" })), show(metric()));
eq("normal is green", metric().color, "#008000");

// ── Adult categories: inclusive upper bounds on the ROUNDED BMI ──
const at = (kg) => metric({ cm: "100", kg: String(kg) });
eq("15.99 → 16 severe", at(15.99).category, "Severe thinness");
eq("16.04 → 16 severe", at(16.04).category, "Severe thinness");
eq("17 moderate", at(17).category, "Moderate thinness");
eq("18.5 mild", at(18.5).category, "Mild thinness");
eq("24.96 → 25 normal", at(24.96).category, "Normal");
eq("30 overweight", at(30).category, "Overweight");
eq("35 class I", at(35).category, "Obese Class I");
eq("40 class II", at(40).category, "Obese Class II");
eq("43.1 class III", show(at(43.1)), "BMI = 43.1 (Obese Class III) needle=none | range 18.5-25 | weight 18.5-25 kg | Lose 18.1 to 25 | prime 1.72 | PI 43.1");
eq("colours", [12, 17, 18, 27, 33, 38, 45].map((k) => at(k).color).join(" "), "#b90606 #ca5353 #ffe400 #ffe400 #ca5353 #b90606 #8a0101");

// ── Gauge range 13 < BMI < 43, needle (BMI − 13) × 6 ──
eq("13.04 → 13 no gauge", at(13.04).gauge, null);
eq("13.05 → 13.1", at(13.05).gauge.angle, 0.6);
eq("42.94 → 42.9", at(42.94).gauge.angle, 179.4);
eq("42.96 → 43 no gauge", at(42.96).gauge, null);
eq("needle uses rounded BMI", at(15.99).gauge.angle, 18);

// ── Gain / lose: at least 0.5 outside the ROUNDED healthy weight ──
eq("gain 0.5 exactly", at(18).change.amount, "0.5");
eq("gain 0.499 hidden", at(18.001).change, null);
eq("lose 0.5", at(25.5).change.verb, "Lose");
eq("lose 0.499 hidden", at(25.499).change, null);
const tall = (kg) => metric({ cm: "180", kg: String(kg) });
eq("rounded min 59.9 − 59.4", tall(59.4).change.amount, "0.5");
eq("59.42 hidden (raw 59.94 not used)", tall(59.42).change, null);
eq("gain from rounded 59.9", tall(50.96).change.amount, "8.9");
eq("lose half-up 37.15 → 37.2", metric({ age: "106", sex: "female", cm: "158", kg: "99.55" }).change.amount, "37.2");
eq("big adult", show(tall(300)), "BMI = 92.6 (Obese Class III) needle=none | range 18.5-25 | weight 59.9-81 kg | Lose 219.0 to 25 | prime 3.7 | PI 51.4");
eq("US gain 0.5 lbs", us({ pounds: "128.4" }).change.amount, "0.5");
eq("US 128.43 hidden", us({ pounds: "128.43" }).change, null);
eq("US lose", show(us({ pounds: "250" })), "BMI = 35.9 (Obese Class II) needle=137.4 | range 18.5-25 | weight 128.9-174.2 lbs | Lose 75.8 to 25 | prime 1.44 | PI 20.2");
eq("US 0.453592 lb factor (PI 21.5)", us({ age: "44", feet: "4", inches: "4.8", pounds: "114.6" }).ponderal, "21.5");
eq("US blank inches", show(us({ inches: "" })), "BMI = 31.2 (Obese Class I) needle=109.2 | range 18.5-25 | weight 94.7-128 lbs | Lose 32.0 to 25 | prime 1.25 | PI 20.5");
eq("US blank feet", us({ feet: "", inches: "70" }).bmi, "23");
eq("US decimal feet", show(us({ feet: "5.5" })), "BMI = 19.5 (Normal) needle=39 | range 18.5-25 | weight 152-205.4 lbs | prime 0.78 | PI 10.1");
eq("age 20.01 is adult", metric({ age: "20.01" }).child, false);
eq("commas stripped", metric({ cm: "1,80" }).bmi, "20.1");

// ── Children 2–20: CDC charts at age × 12 months ──
const kid = (o = {}) => metric({ age: "10", cm: "140", kg: "35", ...o });
eq("child 10y", show(kid()), "BMI = 17.9 (70%, Healthy weight) needle=126 | W 67% H 58% | range 14.2-19.4 | weight 27.8-38 kg | PI 12.8");
eq("child underweight -6%", show(kid({ kg: "25" })), "BMI = 12.8 (-6%, Underweight) needle=none | W 6% H 58% | range 14.2-19.4 | weight 27.8-38 kg | Gain 2.8 to 14.2 | PI 9.1");
eq("child 5% is healthy", kid({ kg: "27.9" }).category, "Healthy weight");
eq("child 85% is healthy", metric({ age: "10", cm: "100", kg: "19.4" }).percentile + " " + metric({ age: "10", cm: "100", kg: "19.4" }).category, "85 Healthy weight");
eq("child at risk", show(kid({ kg: "40" })), "BMI = 20.4 (90%, At risk of overweight) needle=162 | W 85% H 58% | range 14.2-19.4 | weight 27.8-38 kg | Lose 2.0 to 19.4 | PI 14.6");
eq("child 95% at risk", kid({ kg: "44" }).category, "At risk of overweight");
eq("child extended 96%", show(kid({ kg: "45" })), "BMI = 23 (96%, Overweight) needle=172.8 | W 94% H 58% | range 14.2-19.4 | weight 27.8-38 kg | Lose 7.0 to 19.4 | PI 16.4");
eq("extended 99.98%", show(kid({ kg: "70" })), "BMI = 35.7 (99.98%, Overweight) needle=180 | W 110% H 58% | range 14.2-19.4 | weight 27.8-38 kg | Lose 32.0 to 19.4 | PI 25.5");
const p = (kg) => metric({ age: "10", cm: "100", kg: String(kg) }).percentile;
eq("percentile decimals", [23.7, 28.2, 28.3, 30, 32.5, 33, 37, 38].map(p).join(" "), "96 99 99.1 99.5 99.9 99.9 99.99 100");
eq("100% has no gauge", metric({ age: "10", cm: "100", kg: "38" }).gauge, null);
eq("99.9% needle", metric({ age: "10", cm: "100", kg: "33" }).gauge.angle, 179.8);
eq("child height/weight vary", show(kid({ cm: "125" })), "BMI = 22.4 (95%, At risk of overweight) needle=171 | W 67% H 1% | range 14.2-19.4 | weight 22.2-30.3 kg | Lose 4.7 to 19.4 | PI 17.9");
eq("age 10.5", show(kid({ age: "10.5" })), "BMI = 17.9 (65%, Healthy weight) needle=117 | W 56% H 44% | range 14.4-19.8 | weight 28.2-38.8 kg | PI 12.8");
eq("age 2", show(kid({ age: "2" })), "BMI = 17.9 (81%, Healthy weight) needle=145.8 | W 192% H 211% | range 14.7-18.2 | weight 28.8-35.7 kg | PI 12.8");
eq("age 19", show(kid({ age: "19" })), "BMI = 17.9 (1%, Underweight) needle=1.8 | W -20% H -24% | range 18.7-26.3 | weight 36.7-51.5 kg | Gain 1.7 to 18.7 | PI 12.8");
eq("age 20 is a child", show(kid({ age: "20" })), "BMI = 17.9 (-1%, Underweight) needle=none | W -20% H -24% | range 19.1-27 | weight 37.4-52.9 kg | Gain 2.4 to 19.1 | PI 12.8");
eq("girl 10y", show(kid({ sex: "female" })), "BMI = 17.9 (65%, Healthy weight) needle=117 | W 61% H 61% | range 14-19.9 | weight 27.4-39 kg | PI 12.8");
eq("child US", show(us({ age: "10", feet: "4", inches: "7", pounds: "77" })), "BMI = 17.9 (70%, Healthy weight) needle=126 | W 67% H 56% | range 14.2-19.4 | weight 61.1-83.5 lbs | PI 12.8");
eq("girl 15 at risk", metric({ age: "15", sex: "female", cm: "100", kg: "25" }).percentile, "88");
eq("-0% keeps its sign", us({ age: "4.09", feet: "2", inches: "8.3", pounds: "20" }).percentile, "-0");
eq("-0% has no gauge", us({ age: "4.09", feet: "2", inches: "8.3", pounds: "20" }).gauge, null);
eq("0% has no gauge", us({ age: "20", feet: "6", inches: "5", pounds: "153" }).gauge, null);
eq("-0% height", us({ age: "14", feet: "4", inches: "9", pounds: "158" }).heightPercentile, "-0");

// ── Validation ──
eq("blank age", show(metric({ age: "" })), "Please provide an age between 2 and 120.");
eq("age 1.99", show(metric({ age: "1.99" })), "Please provide an age between 2 and 120.");
eq("age 120 ok", metric({ age: "120" }).bmi, "20.1");
eq("age 120.5", show(metric({ age: "120.5" })), "Please provide an age between 2 and 120.");
eq("all three", show(metric({ age: "abc", cm: "", kg: "" })),
  "Please provide an age between 2 and 120. | Please provide positive height value. | Please provide positive weight value.");
eq("height 0", show(metric({ cm: "0" })), "Please provide positive height value.");
eq("height text", show(metric({ cm: "180cm" })), "Please provide positive height value.");
eq("weight 0", show(metric({ kg: "0" })), "Please provide positive weight value.");
eq("US 0 ft 0 in", show(us({ feet: "0", inches: "0" })), "Please provide positive height value.");
eq("US both blank", show(us({ feet: "", inches: "" })), "Please provide positive height value.");
eq("US negative feet", show(us({ feet: "-1" })), "Please provide positive height value.");
eq("US negative inches", show(us({ inches: "-2" })), "Please provide positive height value.");
eq("US inches text", show(us({ inches: "abc" })), "Please provide positive height value.");
eq("US weight text", show(us({ pounds: "abc" })), "Please provide positive weight value.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
