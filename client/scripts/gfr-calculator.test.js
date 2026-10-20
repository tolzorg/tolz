// Plain-Node test suite for the GFR Calculator engine.
// Run with:
//   node scripts/gfr-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/gfr-calculator.html) via plain GET requests. A scratch comparator also diffed
// random scenarios (both forms, mg/dL and µmol/L, both sexes and races, cm and inches, invalid cases)
// against the reference's pages: all identical.

import { calculateAdultGfr, calculateChildGfr, formatGfr as G } from "../src/utils/gfrCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const ADULT = { creatinine: "0.9", creatinineUnit: "mgdL", age: "50", sex: "male", black: false };
const adult = (o = {}) => {
  const r = calculateAdultGfr({ ...ADULT, ...o });
  return r.errors ? r.errors.join(" | ") : `${G(r.mdrd)} | ${G(r.ckdEpi)} | ${G(r.mayo)}`;
};
const child = (o = {}) => {
  const r = calculateChildGfr({ creatinine: "0.9", creatinineUnit: "mgdL", height: "110", heightUnit: "cm", ...o });
  return r.errors ? r.errors.join(" | ") : G(r.gfr);
};

// ── The reference's screenshots ──
eq("adult example", adult(), "89.3 | 99.2 | 120.3");
eq("child example", child(), "50.5");

// ── Sex, race, units ──
eq("female Black, µmol/L", adult({ creatinine: "80", creatinineUnit: "umolL", sex: "female", black: true }), "79.8 | 85.6 | 97.7");
eq("female, Scr under κ and under 0.8 (Mayo floor)", adult({ creatinine: "0.5", age: "30", sex: "female" }), "144.9 | 130.3 | 116.6");
eq("male Black, low Scr", adult({ creatinine: "0.5", age: "30", black: true }), "236.6 | 168.1 | 143.1");
eq("age 18", adult({ age: "18" }), "109.9 | 124.3 | 149.9");
eq("no upper age limit", adult({ age: "200" }), "67.4 | 34.6 | 43.0");
eq("high creatinine", adult({ creatinine: "25", age: "90", sex: "female", black: true }), "1.5 | 1.2 | 3.7");
eq("thousands", adult({ creatinine: "0.01", age: "18", sex: "female", black: true }), "17,787.9 | 591.9 | 126.6");
eq("1 µmol/L", adult({ creatinine: "1", creatinineUnit: "umolL" }), "13,942.9 | 599.6 | 124.7");
// CKD-EPI uses the published 141 / 144 / 163 / 166 constants, not 141 × 1.018 / 1.159.
eq("CKD-EPI Black male constant", adult({ creatinine: "50", creatinineUnit: "umolL", age: "60", black: true }).split(" | ")[1], "129.4");
eq("CKD-EPI female constant", adult({ creatinine: "0.3", age: "85.9", sex: "female" }).split(" | ")[1], "104.1");
eq("CKD-EPI Black female constant", adult({ creatinine: "2.34", age: "47", sex: "female", black: true }).split(" | ")[1], "27.7");
eq("child inches, µmol/L", child({ creatinine: "80", creatinineUnit: "umolL", height: "40", heightUnit: "inch" }), "46.4");
eq("child thousands", child({ creatinine: "0.001", height: "500" }), "206,500.0");

// ── Validation (reference wording and order) ──
eq("creatinine 0 + age 17", adult({ creatinine: "0", age: "17" }), "Please provide a valid serum creatinine value. | This calculator is for adult only. Please use the GFR Calculator for Children below.");
eq("both blank", adult({ creatinine: "", age: "" }), "Please provide a valid serum creatinine value. | Please provide a valid age.");
eq("text creatinine", adult({ creatinine: "abc", age: "121" }), "Please provide a valid serum creatinine value.");
eq("age 17.9", adult({ age: "17.9" }), "This calculator is for adult only. Please use the GFR Calculator for Children below.");
eq("text age", adult({ age: "abc" }), "Please provide a valid age.");
eq("negatives", adult({ creatinine: "-1", age: "-5" }), "Please provide a valid serum creatinine value. | This calculator is for adult only. Please use the GFR Calculator for Children below.");
eq("child 0 / 0", child({ creatinine: "0", creatinineUnit: "umolL", height: "0", heightUnit: "inch" }), "Please provide a valid serum creatinine value. | Please provide a valid height value.");
eq("child negatives", child({ creatinine: "-1", height: "-1" }), "Please provide a valid serum creatinine value. | Please provide a valid height value.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
