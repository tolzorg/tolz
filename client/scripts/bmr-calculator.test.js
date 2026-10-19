// Plain-Node test suite for the BMR Calculator engine.
// Run with:
//   node scripts/bmr-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/bmr-calculator.html) via plain GET requests. A scratch
// comparator also diffed 800 random scenarios (US / metric, both sexes, all
// three formulas, Calories / kJ, invalid ages and body fat): all identical.

import { calculateBmr, BMR_DEFAULTS } from "../src/utils/bmrCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const us = (o = {}) => calculateBmr({ ...BMR_DEFAULTS, ...o });
const metric = (o = {}) => calculateBmr({ ...BMR_DEFAULTS, heightUnit: "cm", height: "180", height2: "", weightUnit: "kg", weight: "60", ...o });
const show = (r) => (r.errors ? r.errors.join(" | ") : `${r.bmr} ${r.unit} :: ${r.levels.map((l) => l.value).join(" ")}`);

// ── The reference's examples ──
eq("US default", show(us()), "1,717 Calories :: 2,060 2,361 2,515 2,661 2,962 3,262");
eq("metric default", show(metric()), "1,605 Calories :: 1,926 2,207 2,351 2,488 2,769 3,050");
eq("level labels", us().levels.map((l) => l.label).join(" / "),
  "Sedentary: little or no exercise / Exercise 1-3 times/week / Exercise 4-5 times/week / Daily exercise or intense exercise 3-4 times/week / Intense exercise 6-7 times/week / Very intense exercise daily, or physical job");

// ── Kilojoules and formulas ──
eq("kJ", show(us({ resultUnit: "kilojoules" })), "7,189 kJ :: 8,626 9,884 10,531 11,143 12,401 13,659");
eq("Harris-Benedict male", show(us({ formula: "harris" })), "1,772 Calories :: 2,126 2,436 2,596 2,747 3,057 3,367");
eq("Harris-Benedict female", show(us({ formula: "harris", sex: "female" })), "1,561 Calories :: 1,874 2,147 2,287 2,420 2,693 2,966");
eq("Harris-Benedict female kJ", show(us({ formula: "harris", sex: "female", resultUnit: "kilojoules" })), "6,537 kJ :: 7,844 8,988 9,576 10,132 11,276 12,420");
eq("Katch-McArdle 20%", show(us({ formula: "katch" })), "1,624 Calories :: 1,949 2,233 2,379 2,517 2,802 3,086");
eq("Katch-McArdle 3%", show(us({ formula: "katch", bodyFat: "3" })), "1,891 Calories :: 2,269 2,600 2,770 2,930 3,261 3,592");
eq("Katch-McArdle 80%", show(us({ formula: "katch", bodyFat: "80" })), "684 Calories :: 820 940 1,001 1,059 1,179 1,299");
eq("age 15.5", show(us({ age: "15.5" })), "1,764 Calories :: 2,117 2,426 2,585 2,735 3,044 3,353");
eq("10 inches tall", show(us({ height: "", height2: "10" })), "764 Calories :: 917 1,051 1,120 1,185 1,319 1,453");
eq("1 cm tall", show(metric({ height: "1" })), "486 Calories :: 584 669 712 754 839 924");
eq("same person in cm / st", us({ heightUnit: "cm", height: "177.8", height2: "", weightUnit: "st", weight: String(160 / 14) }).bmr, "1,717");

// ── Validation ──
eq("body fat 2.9", show(us({ formula: "katch", bodyFat: "2.9" })), "Please provide a reasonable body fat percentage.");
eq("body fat 81", show(us({ formula: "katch", bodyFat: "81" })), "Please provide a reasonable body fat percentage.");
eq("body fat ignored for Mifflin", us({ bodyFat: "abc" }).bmr, "1,717");
eq("age 14", show(us({ age: "14" })), "Please provide an age between 15 and 80.");
eq("age 81", show(us({ age: "81" })), "Please provide an age between 15 and 80.");
eq("9 inches", show(us({ height: "0", height2: "9" })), "Please provide a reasonable height.");
eq("weight 0", show(us({ weight: "0" })), "Please provide positive weight value.");
eq("weight text", show(us({ weight: "abc" })), "Please provide positive weight value.");
eq("metric height 0", show(metric({ height: "0" })), "Please provide positive height value.");
eq("negative inches", show(us({ height2: "-1" })), "Please provide positive height value.");
eq("all three", show(us({ age: "abc", weight: "", height: "abc" })),
  "Please provide an age between 15 and 80. | Please provide positive height value. | Please provide positive weight value.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
