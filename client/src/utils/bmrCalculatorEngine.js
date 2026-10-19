// BMR Calculator engine — matches calculator.net/bmr-calculator.html (a GET
// form, decoded with live probes; see scripts/bmr-calculator.test.js).
//
// BMR, with W = weight in kg, H = height in cm, A = age:
//   Mifflin-St Jeor (default):  10W + 6.25H − 5A + 5 (men) / − 161 (women)
//   Revised Harris-Benedict:    13.397W + 4.799H − 5.677A + 88.362 (men)
//                               9.247W + 3.098H − 4.330A + 447.593 (women)
//   Katch-McArdle:              370 + 21.6(1 − F/100)W, F = body fat %
// Daily needs = BMR × 1.2 / 1.375 / 1.465 / 1.55 / 1.725 / 1.9, each from the
// unrounded BMR. Kilojoules = Calories × 4.1868. US inputs use lb × 0.453592
// and in × 2.54.
// Validation (reference wording): age 15–80; a height under 10 inches entered
// in feet / inches is "not reasonable"; weight > 0; body fat 3–80% (checked
// only for Katch-McArdle).

import { clean, num } from "./marginCalculatorEngine.js";
import { lengthToCm, weightToKg } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS, lengthToCm, cmToLength, weightToKg, kgToWeight } from "./bodyFatCalculatorEngine.js";

// The reference's US example.
export const BMR_DEFAULTS = {
  age: "25",
  sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "160",
  resultUnit: "calories",
  formula: "mifflin",
  bodyFat: "20",
};

export const ACTIVITY_LEVELS = [
  [1.2, "Sedentary: little or no exercise"],
  [1.375, "Exercise 1-3 times/week"],
  [1.465, "Exercise 4-5 times/week"],
  [1.55, "Daily exercise or intense exercise 3-4 times/week"],
  [1.725, "Intense exercise 6-7 times/week"],
  [1.9, "Very intense exercise daily, or physical job"],
];

const KJ = 4.1868;
const IMPERIAL = new Set(["ft-in", "in", "ft"]);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

/**
 * @param {{ age, sex, heightUnit, height, height2, weightUnit, weight, resultUnit, formula, bodyFat }} input  strings;
 *   sex "male" | "female", resultUnit "calories" | "kilojoules", formula "mifflin" | "harris" | "katch".
 * @returns {{ errors: string[] } | { bmr: string, unit: string, levels: { label, value }[] }}
 */
export function calculateBmr(input) {
  const female = input.sex === "female";
  const formula = ["harris", "katch"].includes(input.formula) ? input.formula : "mifflin";
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const kg = weightToKg(input.weightUnit, input.weight);
  const bodyFat = num(clean(input.bodyFat));

  const errors = [];
  if (!(age >= 15 && age <= 80)) errors.push("Please provide an age between 15 and 80.");
  if (Number.isNaN(cm) || (!IMPERIAL.has(input.heightUnit) && !(cm > 0))) errors.push("Please provide positive height value.");
  else if (IMPERIAL.has(input.heightUnit) && !(cm >= 10 * 2.54)) errors.push("Please provide a reasonable height.");
  if (!(kg > 0)) errors.push("Please provide positive weight value.");
  if (formula === "katch" && !(bodyFat >= 3 && bodyFat <= 80)) errors.push("Please provide a reasonable body fat percentage.");
  if (errors.length) return { errors };

  let bmr;
  if (formula === "katch") bmr = 370 + 21.6 * (1 - bodyFat / 100) * kg;
  else if (formula === "harris") {
    bmr = female ? 9.247 * kg + 3.098 * cm - 4.33 * age + 447.593 : 13.397 * kg + 4.799 * cm - 5.677 * age + 88.362;
  } else bmr = 10 * kg + 6.25 * cm - 5 * age + (female ? -161 : 5);

  const kj = input.resultUnit === "kilojoules";
  const show = (cal) => fmt(kj ? cal * KJ : cal);
  return {
    bmr: show(bmr),
    unit: kj ? "kJ" : "Calories",
    levels: ACTIVITY_LEVELS.map(([factor, label]) => ({ label, value: show(bmr * factor) })),
  };
}
