// Plain-Node test suite for the Army Body Fat Calculator engine (waist-to-height ratio).
// Run with:
//   node scripts/army-body-fat-calculator.test.js
//
// The Army's current standard (army.mil, July 7, 2026): waist at the navel ÷ height;
// below 0.55 meets the standard, 0.55 or higher is flagged.

import { calculateArmyBodyFat, lengthInches, WHTR_LIMIT } from "../src/utils/armyBodyFatCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (waist, height, waistUnit = "in", heightUnit = "ft-in", waist2 = "", height2 = "") =>
  calculateArmyBodyFat({ waist, waist2, waistUnit, height, height2, heightUnit });
const us = (waist, ft, inch) => run(waist, ft, "in", "ft-in", "", inch);
function show(r) {
  if (r.errors) return r.errors.join(" | ");
  const line = `${r.ratio.toFixed(3)} ${r.meets ? "meets" : "flagged"} max ${r.maxWaist.toFixed(2)} ${r.unit}`;
  return r.meets ? line : `${line} reduce ${r.reduceBy.toFixed(2)}`;
}

eq("limit", WHTR_LIMIT, 0.55);

// ── The example: 34 in waist, 5 ft 10 in ──
eq("example", show(us("34", "5", "10")), "0.486 meets max 38.50 in");

// ── The 0.55 boundary: below meets, equal or above is flagged ──
eq("38.4 / 70 meets", show(us("38.4", "5", "10")), "0.549 meets max 38.50 in");
eq("38.5 / 70 = 0.55 flagged", show(us("38.5", "5", "10")), "0.550 flagged max 38.50 in reduce 0.00");
eq("40 / 70 flagged", show(us("40", "5", "10")), "0.571 flagged max 38.50 in reduce 1.50");
eq("38.49 / 70 meets", us("38.49", "5", "10").meets, true);

// ── Units ──
eq("metric", show(run("96", "175", "cm", "cm")), "0.549 meets max 96.25 cm");
eq("metric flagged", show(run("100", "175", "cm", "cm")), "0.571 flagged max 96.25 cm reduce 3.75");
eq("waist ft/in", show(run("2", "5", "ft-in", "ft-in", "10", "10")), "0.486 meets max 38.50 in");
eq("height in m", show(run("34", "1.778", "in", "m")), "0.486 meets max 38.50 in");
eq("metric waist, US height", show(run("86.36", "5", "cm", "ft-in", "", "10")), "0.486 meets max 97.79 cm");
eq("m / cm height", lengthInches("m-cm", "1", "77.8").toFixed(2), "70.00");
eq("ft only", lengthInches("ft", "6").toFixed(2), "72.00");

// ── Lenient numbers / blank parts ──
eq("feet blank", show(run("34", "", "in", "ft-in", "", "70")), "0.486 meets max 38.50 in");
eq("inches blank", show(run("36", "6", "in", "ft-in", "", "")), "0.500 meets max 39.60 in");
eq("spaces", show(run(" 34 ", " 1.778", "in", "m")), "0.486 meets max 38.50 in");
eq("thousands comma", show(run("1,000", "2,000", "cm", "cm")), "0.500 meets max 1100.00 cm");

// ── Validation ──
const WAIST = "Please provide a positive waist circumference value.";
const HEIGHT = "Please provide a positive height value.";
eq("all blank", show(run("", "", "in", "ft-in")), `${WAIST} | ${HEIGHT}`);
eq("waist 0", show(us("0", "5", "10")), WAIST);
eq("waist text", show(us("abc", "5", "10")), WAIST);
eq("height 0", show(us("34", "0", "0")), HEIGHT);
eq("negative height part", show(us("34", "5", "-1")), HEIGHT);
eq("negative waist", show(us("-34", "5", "10")), WAIST);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
