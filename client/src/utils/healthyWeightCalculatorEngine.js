// Healthy Weight Calculator engine — matches calculator.net/healthy-weight-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/healthy-weight-calculator.test.js).
//
// For a height, the weights at the BMI cut points 16.5, 18.5, 25, 30, 35 and 40 mark the
// scale (severely underweight | underweight | healthy | overweight | obese class I / II / III);
// the healthy range is BMI 18.5–25.
//   US (feet / inches): pounds = BMI × (inches × 0.0254)² × 2.2046, rounded to a whole pound
//   (fitted: 71/71 live cases; 703 or 0.453592 each miss some).
//   Metric (cm): kg = BMI × (cm / 100)², rounded to 1 decimal.
// Tolz addition: any LENGTH_UNITS height; US units (in / ft / ft-in) give pounds, metric
// units (cm / m / m-cm) give kilograms.
// Validation (reference wording): "Please provide a positive numerical height value."

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { lengthToCm, LENGTH_UNITS } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS };

export const BMI_CUTS = [16.5, 18.5, 25, 30, 35, 40];
export const CATEGORIES = [
  "Severely underweight", "Underweight", "Healthy", "Overweight", "Obese class I", "Obese class II", "Obese class III",
];
const LB_PER_KG = 2.2046;

// The reference's US example.
export const HEALTHY_WEIGHT_DEFAULTS = { heightUnit: "ft-in", height: "5", height2: "10" };

const US_UNITS = new Set(["in", "ft", "ft-in"]);

/** A blank part of a two-part length counts as 0; negatives and text are NaN. */
function part(text) {
  const t = clean(text);
  if (t === "") return 0;
  const n = num(t);
  return n >= 0 ? n : NaN;
}
function inches(unit, a, b) {
  if (unit === "in") return num(clean(a));
  if (unit === "ft") return num(clean(a)) * 12;
  return part(a) * 12 + part(b);
}

/**
 * input: { height, height2, heightUnit }
 * → { errors } or { weights: number[6] (at BMI_CUTS), low, high, unit: "lbs" | "kg", decimals }
 */
export function calculateHealthyWeight(input) {
  const us = US_UNITS.has(input.heightUnit);
  const size = us ? inches(input.heightUnit, input.height, input.height2) : lengthToCm(input.heightUnit, input.height, input.height2);
  if (!(size > 0)) return { errors: ["Please provide a positive numerical height value."] };

  const m2 = us ? (size * 0.0254) ** 2 : (size / 100) ** 2;
  const weights = BMI_CUTS.map((bmi) => (us ? roundTo(bmi * m2 * LB_PER_KG, 0) : roundTo(bmi * m2, 1)));
  return { weights, low: weights[1], high: weights[2], unit: us ? "lbs" : "kg", decimals: us ? 0 : 1 };
}
