// Fat Intake Calculator engine — matches calculator.net/fat-intake-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/fat-intake-calculator.test.js).
//
// Calories: BMR × activity for maintenance, ∓500 / ∓1000 kcal for losing / gaining 1 / 2 lb
// (0.5 / 1 kg) a week — the same rows as the Carbohydrate Calculator.
//   Mifflin St Jeor: 10·kg + 6.25·cm − 5·age + 5 (men) / − 161 (women)
//   Katch-McArdle:   370 + 21.6 × (1 − body fat) × kg
// Fat at 8.8 kcal per gram: daily fat 20% - 35% of Calories (25% - 35% under age 19, the reference's
// 4-18 guideline, though its table header still says 20-35%), saturated fat < 10%, and < 7% to help
// reduce heart disease; every figure is a whole gram (−0 shows as 0). Nothing is clamped, so a tiny
// height or weight gives negative Calories and grams, exactly as on the reference.
// US inputs: pounds × 0.453592, inches × 2.54 (the shared Body Fat Calculator helpers).
// Validation (reference wording and order): "Please provide an age between 18 and 80.",
// "Please provide positive height value." (every height box a number ≥ 0 — feet and inches both
// filled in), "Please provide positive weight value." (a number ≥ 0), and with Katch-McArdle
// "Please provide a reasonable body fat percentage." (3-80%).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { lengthToCm, weightToKg, LENGTH_UNITS, WEIGHT_UNITS } from "./bodyFatCalculatorEngine.js";
import { ACTIVITY_OPTIONS, GOALS } from "./carbohydrateCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS, ACTIVITY_OPTIONS };

export const FAT_KCAL = 8.8;

// The reference's US example.
export const FAT_DEFAULTS = {
  age: "25", sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "160",
  activity: "1.375", formula: "mifflin", bodyFat: "20",
};

const TWO_PART = new Set(["ft-in", "m-cm"]);
const filled = (t) => clean(t) !== "" && num(clean(t)) >= 0;

/**
 * input: { age, sex, height, height2, heightUnit, weight, weightUnit, activity, formula, bodyFat }
 * → { errors } | { lowShare, rows: [{ label, maintain, calories, fat: [low, 35%], saturated, heart }] }
 *   (calories and grams rounded as shown)
 */
export function calculateFatIntake(input) {
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const kg = weightToKg(input.weightUnit, input.weight);
  const katch = input.formula === "katch";
  const bf = num(clean(input.bodyFat));

  const heightOk = filled(input.height) && (!TWO_PART.has(input.heightUnit) || filled(input.height2)) && cm >= 0;
  const errors = [];
  if (!(age >= 18 && age <= 80)) errors.push("Please provide an age between 18 and 80.");
  if (!heightOk) errors.push("Please provide positive height value.");
  if (!(kg >= 0)) errors.push("Please provide positive weight value.");
  if (katch && !(bf >= 3 && bf <= 80)) errors.push("Please provide a reasonable body fat percentage.");
  if (errors.length) return { errors };

  const female = input.sex === "female";
  const bmr = katch ? 370 + 21.6 * (1 - bf / 100) * kg : 10 * kg + 6.25 * cm - 5 * age + (female ? -161 : 5);
  const maintain = bmr * (Number(input.activity) || 1.375);
  const us = input.weightUnit !== "kg";
  const lowShare = age < 19 ? 0.25 : 0.2;
  const whole = (x) => roundTo(x, 0) + 0; // + 0 turns −0 into 0
  const rows = GOALS.map((g) => {
    const kcal = maintain + g.kcal;
    const grams = (share) => whole((kcal * share) / FAT_KCAL);
    return {
      label: us ? g.us : g.metric,
      maintain: g.kcal === 0,
      calories: whole(kcal),
      fat: [grams(lowShare), grams(0.35)],
      saturated: grams(0.1),
      heart: grams(0.07),
    };
  });
  return { lowShare, rows };
}

export const formatNumber = (x) => x.toLocaleString("en-US");
