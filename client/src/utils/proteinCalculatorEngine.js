// Protein Calculator engine — matches calculator.net/protein-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/protein-calculator.test.js).
//
//   American Dietetic Association (ADA): 0.8 - 1 g per kg of body weight for sedentary people,
//     1 - 1.8 g per kg for every other activity level.
//   Centers for Disease Control and Prevention (CDC): 10% - 35% of daily Calories at 4.1 kcal per
//     gram, where Calories = BMR × activity (Mifflin St Jeor or Katch-McArdle, as in the Macro and
//     Carbohydrate calculators; unrounded).
//   World Health Organization safe lower limit: 0.83 g per kg.
// Every figure is rounded to a whole gram; nothing is clamped, so a 0 weight gives "0 - 0" and a
// tiny height can make the CDC range negative, exactly as on the reference.
// US inputs: pounds × 0.453592, inches × 2.54 (the shared Body Fat Calculator helpers).
// Validation (reference wording and order): "Please provide an age between 18 and 80.",
// "Please provide a positive height value." (feet / inches: each blank or ≥ 0, and not both 0;
// a single box: a number ≥ 0), "Please provide a positive weight value." (a number ≥ 0), and with
// Katch-McArdle "Please provide a reasonable body fat percentage." (3-80%).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { lengthToCm, weightToKg, LENGTH_UNITS, WEIGHT_UNITS } from "./bodyFatCalculatorEngine.js";
import { ACTIVITY_OPTIONS } from "./carbohydrateCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS, ACTIVITY_OPTIONS };

export const PROTEIN_KCAL = 4.1;
export const WHO_PER_KG = 0.83;

// The reference's US example.
export const PROTEIN_DEFAULTS = {
  age: "25", sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "160",
  activity: "1.375", formula: "mifflin", bodyFat: "20",
};

const TWO_PART = new Set(["ft-in", "m-cm"]);

/**
 * input: { age, sex, height, height2, heightUnit, weight, weightUnit, activity, formula, bodyFat }
 * → { errors } | { ada: [lo, hi], cdc: [lo, hi], who, perKg: [lo, hi], calories }
 *   (whole grams as shown; calories unrounded)
 */
export function calculateProtein(input) {
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const kg = weightToKg(input.weightUnit, input.weight);
  const katch = input.formula === "katch";
  const bf = num(clean(input.bodyFat));

  const errors = [];
  if (!(age >= 18 && age <= 80)) errors.push("Please provide an age between 18 and 80.");
  if (!(TWO_PART.has(input.heightUnit) ? cm > 0 : cm >= 0)) errors.push("Please provide a positive height value.");
  if (!(kg >= 0)) errors.push("Please provide a positive weight value.");
  if (katch && !(bf >= 3 && bf <= 80)) errors.push("Please provide a reasonable body fat percentage.");
  if (errors.length) return { errors };

  const female = input.sex === "female";
  const activity = Number(input.activity) || 1.375;
  const bmr = katch ? 370 + 21.6 * (1 - bf / 100) * kg : 10 * kg + 6.25 * cm - 5 * age + (female ? -161 : 5);
  const calories = bmr * activity;
  const perKg = activity <= 1.2 ? [0.8, 1] : [1, 1.8];
  const g = (x) => roundTo(x, 0);
  return {
    perKg,
    calories,
    ada: perKg.map((k) => g(k * kg)),
    cdc: [0.1, 0.35].map((s) => g((calories * s) / PROTEIN_KCAL)),
    who: g(WHO_PER_KG * kg),
  };
}

export const formatGrams = (x) => x.toLocaleString("en-US");
