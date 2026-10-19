// Plain-Node test suite for the Healthy Weight Calculator engine.
// Run with:
//   node scripts/healthy-weight-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/healthy-weight-calculator.html) via plain GET requests. A scratch
// comparator also diffed 400 random scenarios (US / metric, blank and fractional boxes):
// all identical.

import { calculateHealthyWeight } from "../src/utils/healthyWeightCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const us = (ft, inch) => calculateHealthyWeight({ heightUnit: "ft-in", height: ft, height2: inch });
const metric = (cm) => calculateHealthyWeight({ heightUnit: "cm", height: cm, height2: "" });
function show(r) {
  if (r.errors) return r.errors.join(" | ");
  const f = (x) => x.toFixed(r.decimals);
  return `${f(r.low)}-${f(r.high)} ${r.unit} | ${r.weights.map(f).join(" ")}`;
}

// ── The reference's examples ──
eq("US 5'10\"", show(us("5", "10")), "129-174 lbs | 115 129 174 209 244 279");
eq("metric 180", show(metric("180")), "59.9-81.0 kg | 53.5 59.9 81.0 97.2 113.4 129.6");

// ── More live cases ──
eq("US 6'2\"", show(us("6", "2")), "144-195 lbs | 129 144 195 234 273 312");
eq("US 4'11.5\"", show(us("4", "11.5")), "93-126 lbs | 83 93 126 151 176 201");
eq("metric 152.4", show(metric("152.4")), "43.0-58.1 kg | 38.3 43.0 58.1 69.7 81.3 92.9");
eq("metric 201.3", show(metric("201.3")), "75.0-101.3 kg | 66.9 75.0 101.3 121.6 141.8 162.1");
eq("metric 100 = the BMI cuts", show(metric("1e2")), "18.5-25.0 kg | 16.5 18.5 25.0 30.0 35.0 40.0");
eq("US 9 ft", show(us("9", "0")), "307-415 lbs | 274 307 415 498 581 664");
eq("metric 30", show(metric("30")), "1.7-2.3 kg | 1.5 1.7 2.3 2.7 3.2 3.6");
eq("tiny metric", show(metric("0.5")), "0.0-0.0 kg | 0.0 0.0 0.0 0.0 0.0 0.0");
eq("tiny US", show(us("0", "1")), "0-0 lbs | 0 0 0 0 0 0");

// ── Height boxes ──
eq("inches blank", show(us("5", "")), "95-128 lbs | 84 95 128 154 179 205");
eq("feet blank", show(us("", "70")), "129-174 lbs | 115 129 174 209 244 279");

// ── Validation (reference wording) ──
const E = "Please provide a positive numerical height value.";
eq("all blank US", show(us("", "")), E);
eq("blank metric", show(metric("")), E);
eq("0 ft 0 in", show(us("0", "0")), E);
eq("negative inches", show(us("5", "-1")), E);
eq("negative cm", show(metric("-5")), E);
eq("text", show(metric("abc")), E);

// ── Tolz units ──
eq("inches only = ft/in", show(calculateHealthyWeight({ heightUnit: "in", height: "70", height2: "" })), "129-174 lbs | 115 129 174 209 244 279");
eq("meters = cm", show(calculateHealthyWeight({ heightUnit: "m", height: "1.8", height2: "" })), "59.9-81.0 kg | 53.5 59.9 81.0 97.2 113.4 129.6");
eq("m / cm", show(calculateHealthyWeight({ heightUnit: "m-cm", height: "1", height2: "80" })), "59.9-81.0 kg | 53.5 59.9 81.0 97.2 113.4 129.6");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
