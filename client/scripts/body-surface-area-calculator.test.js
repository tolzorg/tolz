// Plain-Node test suite for the Body Surface Area Calculator engine.
// Run with:
//   node scripts/body-surface-area-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/body-surface-area-calculator.html) via plain GET requests. A scratch comparator also
// diffed random scenarios (pounds / kilograms / grams, feet + inches / cm and both together, both
// sexes, zero and invalid values) against the reference's page: all identical.

import { calculateBsa, formatArea as A } from "../src/utils/bodySurfaceAreaCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { sex: "male", weight: "155", weightUnit: "lb", feet: "5", inches: "9", cm: "" };
const run = (o = {}) => calculateBsa({ ...BASE, ...o });
const row = (r, name) => { const x = r.rows.find((y) => y.formula === name); return `${A(x.m2, 2)} ${A(x.ft2, 2)} ${A(x.in2, 0)}`; };
const all = (r) => r.rows.map((x) => `${x.formula}: ${A(x.m2, 2)} ${A(x.ft2, 2)} ${A(x.in2, 0)}`).join(" | ");

// ── The reference's screenshot ──
const ex = run();
eq("example table", all(ex), [
  "Du Bois: 1.85 19.95 2,873", "Mosteller: 1.85 19.91 2,868", "Haycock: 1.85 19.94 2,871", "Gehan & George: 1.86 20.01 2,882",
  "Boyd: 1.86 19.98 2,877", "Fujimoto: 1.79 19.30 2,779", "Takahira: 1.87 20.11 2,896", "Schlich: 1.77 19.01 2,738",
].join(" | "));
eq("example BMI", ex.bmi, 22.9);
eq("no height note without a cm value", ex.heightNote, null);

// ── Women (Schlich differs), kilograms, grams, cm ──
eq("female Schlich", row(run({ sex: "female" }), "Schlich"), "1.83 19.68 2,834");
const kg = run({ weight: "70", weightUnit: "kg", cm: "180" });
eq("feet / inches win over cm", kg.heightNote, "5 feet and 9 inches");
eq("kg Du Bois / Schlich", `${row(kg, "Du Bois")} / ${row(kg, "Schlich")}`, "1.85 19.91 2,868 / 1.76 18.98 2,733");
eq("kg BMI", kg.bmi, 22.8);
const g = run({ weight: "70000", weightUnit: "g", feet: "", inches: "", cm: "175" });
eq("grams + cm", `${g.heightNote} | ${row(g, "Mosteller")} | ${row(g, "Boyd")} | ${row(g, "Fujimoto")}`, "175 cm | 1.84 19.86 2,859 | 1.85 19.92 2,869 | 1.79 19.24 2,771");
eq("BMI trailing zero dropped", run({ feet: "", inches: "", cm: "175" }).bmi, 23);
eq("0 ft 0 in falls back to cm", run({ feet: "0", inches: "0", cm: "180" }).heightNote, "180 cm");
eq("blank inches falls back to cm", run({ inches: "", cm: "180" }).heightNote, "180 cm");
eq("bad cm ignored when feet / inches work", run({ cm: "abc" }).heightNote, "5 feet and 9 inches");
eq("5 ft 0 in", `${row(run({ inches: "0" }), "Schlich")} | ${run({ inches: "0" }).bmi}`, "1.49 15.99 2,302 | 30.3");
eq("0 ft 9 in, BMI without commas", `${row(run({ feet: "0" }), "Schlich")} | ${run({ feet: "0" }).bmi}`, "0.14 1.52 219 | 1345.4");
eq("6 ft 0 in, 155 kg", `${row(run({ weight: "155", weightUnit: "kg", feet: "6", inches: "0" }), "Schlich")} | ${run({ weight: "155", weightUnit: "kg", feet: "6", inches: "0" }).bmi}`, "2.51 27.07 3,897 | 46.3");

// ── Zero values are accepted ──
eq("weight 0", `${row(run({ weight: "0" }), "Boyd")} | ${run({ weight: "0" }).bmi}`, "0.00 0.00 0 | 0");
const zeroH = run({ feet: "", inches: "", cm: "0" });
eq("height 0 cm: zeros, no BMI", `${row(zeroH, "Du Bois")} | ${zeroH.bmi}`, "0.00 0.00 0 | null");

// ── Validation (reference wording) ──
const err = (o) => (run(o).errors || []).join(" | ");
eq("all blank", err({ weight: "", feet: "", inches: "" }), "Please provide a valid body weight value. | Please provide a valid body height value.");
eq("0 ft 0 in, no cm", err({ weight: "0", feet: "0", inches: "0" }), "Please provide a valid body height value.");
eq("negative / text", err({ weight: "-1", weightUnit: "kg", feet: "abc", inches: "1", cm: "-5" }), "Please provide a valid body weight value. | Please provide a valid body height value.");
eq("blank inches, no cm", err({ inches: "" }), "Please provide a valid body height value.");
eq("blank feet, no cm", err({ feet: "" }), "Please provide a valid body height value.");
eq("bad feet beats a good cm", err({ feet: "abc", cm: "180" }), "Please provide a valid body height value.");
eq("negative inches beats a good cm", err({ inches: "-1", cm: "180" }), "Please provide a valid body height value.");
eq("text cm alone", err({ feet: "", inches: "", cm: "abc" }), "Please provide a valid body height value.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
