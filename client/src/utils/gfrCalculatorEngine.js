// GFR Calculator engine — matches calculator.net/gfr-calculator.html (two GET forms computed on its
// server, decoded with live probes; see scripts/gfr-calculator.test.js).
//
// Adults (18+), Scr in mg/dL (µmol/L ÷ 88.4):
//   MDRD 4-variable: 175 × Scr^−1.154 × age^−0.203 × 0.742 (female) × 1.212 (Black)
//   CKD-EPI (2009):  C × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.209 × 0.993^age, with the published table's
//                    rounded constants C = 141 (men), 144 (women), 163 (Black men), 166 (Black women) rather
//                    than 1.018 / 1.159 multipliers; κ = 0.7 / 0.9 and α = −0.329 / −0.411 for women / men
//   Mayo Quadratic:  e^(1.911 + 5.249/Scr − 2.114/Scr² − 0.00686·age − 0.205 (female)), Scr below 0.8 counted as 0.8
// Children: bedside Schwartz, 0.413 × height (cm; inches × 2.54) ÷ Scr.
// Results in mL/min/1.73 m² to one decimal. Nothing is capped (no upper age limit either).
// Validation (reference wording and order): "Please provide a valid serum creatinine value." (a number > 0),
// "Please provide a valid age." (not a number) or "This calculator is for adult only. Please use the GFR
// Calculator for Children below." (under 18); children: creatinine, then "Please provide a valid height value."

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const UMOL_PER_MG_DL = 88.4;
export const CREATININE_UNITS = [
  { value: "mgdL", label: "mg/dL" },
  { value: "umolL", label: "micromole/L" },
];
export const HEIGHT_UNITS = [
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
];

// The reference's examples.
export const ADULT_DEFAULTS = { creatinine: "0.9", creatinineUnit: "mgdL", age: "50", sex: "male", black: false };
export const CHILD_DEFAULTS = { creatinine: "0.9", creatinineUnit: "mgdL", height: "110", heightUnit: "cm" };

/** CKD stages (mL/min/1.73 m²), as the reference lists them. */
export const CKD_STAGES = [
  ["Normal", "90+ or above and no proteinuria"],
  ["CKD1", "90+ with evidence of kidney damage"],
  ["CKD2 (Mild)", "60 to 89 with evidence of kidney damage"],
  ["CKD3 (Moderate)", "30 to 59"],
  ["CKD4 (Severe)", "15 to 29"],
  ["CKD5 Kidney failure", "less than 15"],
];

const CREATININE_ERROR = "Please provide a valid serum creatinine value.";
const mgPerDl = (text, unit) => {
  const v = num(clean(text));
  return unit === "umolL" ? v / UMOL_PER_MG_DL : v;
};
const one = (x) => roundTo(x, 1);

/**
 * input: { creatinine, creatinineUnit, age, sex, black }
 * → { errors } | { mdrd, ckdEpi, mayo }   (mL/min/1.73 m², one decimal)
 */
export function calculateAdultGfr(input) {
  const scr = mgPerDl(input.creatinine, input.creatinineUnit);
  const age = num(clean(input.age));
  const errors = [];
  if (!(scr > 0)) errors.push(CREATININE_ERROR);
  if (Number.isNaN(age)) errors.push("Please provide a valid age.");
  else if (age < 18) errors.push("This calculator is for adult only. Please use the GFR Calculator for Children below.");
  if (errors.length) return { errors };

  const female = input.sex === "female";
  const black = Boolean(input.black);
  const mdrd = 175 * scr ** -1.154 * age ** -0.203 * (female ? 0.742 : 1) * (black ? 1.212 : 1);
  const k = female ? 0.7 : 0.9;
  const alpha = female ? -0.329 : -0.411;
  const c = black ? (female ? 166 : 163) : (female ? 144 : 141);
  const ckdEpi = c * Math.min(scr / k, 1) ** alpha * Math.max(scr / k, 1) ** -1.209 * 0.993 ** age;
  const s = Math.max(scr, 0.8);
  const mayo = Math.exp(1.911 + 5.249 / s - 2.114 / (s * s) - 0.00686 * age - (female ? 0.205 : 0));
  return { mdrd: one(mdrd), ckdEpi: one(ckdEpi), mayo: one(mayo) };
}

/**
 * input: { creatinine, creatinineUnit, height, heightUnit }
 * → { errors } | { gfr }   (bedside Schwartz, mL/min/1.73 m², one decimal)
 */
export function calculateChildGfr(input) {
  const scr = mgPerDl(input.creatinine, input.creatinineUnit);
  const h = num(clean(input.height));
  const cm = input.heightUnit === "inch" ? h * 2.54 : h;
  const errors = [];
  if (!(scr > 0)) errors.push(CREATININE_ERROR);
  if (!(cm > 0)) errors.push("Please provide a valid height value.");
  if (errors.length) return { errors };
  return { gfr: one((0.413 * cm) / scr) };
}

export const formatGfr = (x) => x.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
