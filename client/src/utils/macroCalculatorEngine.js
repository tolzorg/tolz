// Macro Calculator engine — matches calculator.net/macro-calculator.html
// (a GET form computed on its server plus the page's own tab / slider script, decoded
// with live probes; see scripts/macro-calculator.test.js).
//
// Calories: BMR × activity + goal (±250 / ±500 / ±1000 kcal for 0.5 / 1 / 2 lb a week),
// rounded to a whole Calorie; every macro below uses that rounded number.
//   Mifflin St Jeor: 10·kg + 6.25·cm − 5·age + 5 (men) / − 161 (women)
//   Katch-McArdle:   370 + 21.6 × (1 − body fat) × kg
// US inputs: pounds × 0.453592, inches × 2.54 (the shared Body Fat Calculator helpers).
// Below 1,500 (men) / 1,200 (women) Calories the reference shows only "Please consult with
// a doctor to guide your daily food energy needs."
// Energy per gram: protein 4.1, carbs 3.75, fat 8.8 kcal. Plans (share of Calories):
//   Balanced 25 / 50 / 25, Low Fat 27.5 / 52.5 / 20, Low Carb 30 / 40 / 30,
//   High Protein 35 / 42.5 / 22.5 (protein / carbs / fat).
// Ranges: protein max(60 g, k·kg, 10% of Calories) → the High Protein amount, where k is
// 0.83 g/kg for BMR / sedentary and 1 g/kg otherwise; carbs the Low Carb amount → what
// is left after the minimum protein and fat (never below the Low Carb amount); fat 20% →
// 35% of Calories. A plan whose protein is under the minimum becomes: protein = minimum,
// fat = minimum, carbs = the carb maximum (so on low Calories several plans coincide).
// Sugar < 10% and saturated fat < 10% of Calories (3.75 / 8.8 kcal per gram); kJ = kcal × 4.1868.
// "Create Your Own" (slidePlan) follows the page's sliders: moving one macro rescales the
// other two to keep the Calories, clamped to their ranges. (The reference's fat slider
// writes the protein value into the fat bar in one branch; that slip is not copied.)
// Validation (reference wording and order): "Please provide an age between 18 and 80.",
// "Please provide a reasonable height." (feet / inches both 0) or "Please provide positive
// height value.", "Please provide positive weight value.", and with Katch-McArdle
// "Please provide a reasonable body fat percentage." (3-80%).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { lengthToCm, weightToKg, LENGTH_UNITS, WEIGHT_UNITS } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS };

export const ACTIVITY_OPTIONS = [
  { value: "1", label: "Basal Metabolic Rate (BMR)" },
  { value: "1.2", label: "Sedentary: little or no exercise" },
  { value: "1.375", label: "Light: exercise 1-3 times/week" },
  { value: "1.465", label: "Moderate: exercise 4-5 times/week" },
  { value: "1.55", label: "Active: daily exercise or intense exercise 3-4 times/week" },
  { value: "1.725", label: "Very Active: intense exercise 6-7 times/week" },
  { value: "1.9", label: "Extra Active: very intense exercise daily, or physical job" },
];
export const GOAL_OPTIONS = [
  { value: "m", label: "Maintain weight", kcal: 0 },
  { value: "l", label: "Mild weight loss of 0.5 lb (0.25 kg) per week", kcal: -250, lb: "lose 0.5 lb", kg: "lose 0.25 kg" },
  { value: "l1", label: "Weight loss of 1 lb (0.5 kg) per week", kcal: -500, lb: "lose 1 lb", kg: "lose 0.5 kg" },
  { value: "l2", label: "Extreme weight loss of 2 lb (1 kg) per week", kcal: -1000, lb: "lose 2 lbs", kg: "lose 1 kg" },
  { value: "g", label: "Mild weight gain of 0.5 lb (0.25 kg) per week", kcal: 250, lb: "gain 0.5 lb", kg: "gain 0.25 kg" },
  { value: "g1", label: "Weight gain of 1 lb (0.5 kg) per week", kcal: 500, lb: "gain 1 lb", kg: "gain 0.5 kg" },
  { value: "g2", label: "Extreme weight gain of 2 lb (1 kg) per week", kcal: 1000, lb: "gain 2 lbs", kg: "gain 1 kg" },
];
export const PLANS = [
  { value: "balanced", label: "Balanced", protein: 0.25, carbs: 0.5, fat: 0.25 },
  { value: "lowfat", label: "Low Fat", protein: 0.275, carbs: 0.525, fat: 0.2 },
  { value: "lowcarb", label: "Low Carb", protein: 0.3, carbs: 0.4, fat: 0.3 },
  { value: "highprotein", label: "High Protein", protein: 0.35, carbs: 0.425, fat: 0.225 },
];
export const KCAL = { protein: 4.1, carbs: 3.75, fat: 8.8 };

// The reference's US example.
export const MACRO_DEFAULTS = {
  age: "25", sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "165",
  activity: "1.465", goal: "m", formula: "mifflin", bodyFat: "20",
};

/** Feet / inches typed as valid numbers (blank = 0) but adding up to 0. */
function zeroFeetInches(input) {
  if (input.heightUnit !== "ft-in") return false;
  const parts = [input.height, input.height2].map((t) => (clean(t) === "" ? 0 : num(clean(t))));
  return parts.every((p) => p === 0);
}

/**
 * input: { age, sex, height, height2, heightUnit, weight, weightUnit, activity, goal, formula, bodyFat }
 * → { errors } | { tooLow: true, calories } |
 *   { calories, kj, goalText, plans: { balanced: {protein, carbs, fat}, … }, ranges: { protein: [lo, hi], carbs, fat },
 *     sugar, saturatedFat }   (plan / range grams unrounded — the page shows Math.round; sugar and
 *     saturated fat are already whole grams)
 */
export function calculateMacros(input) {
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const kg = weightToKg(input.weightUnit, input.weight);
  const katch = input.formula === "katch";
  const bf = num(clean(input.bodyFat));

  const errors = [];
  if (!(age >= 18 && age <= 80)) errors.push("Please provide an age between 18 and 80.");
  if (zeroFeetInches(input)) errors.push("Please provide a reasonable height.");
  else if (!(cm > 0)) errors.push("Please provide positive height value.");
  if (!(kg > 0)) errors.push("Please provide positive weight value.");
  if (katch && !(bf >= 3 && bf <= 80)) errors.push("Please provide a reasonable body fat percentage.");
  if (errors.length) return { errors };

  const female = input.sex === "female";
  const bmr = katch ? 370 + 21.6 * (1 - bf / 100) * kg : 10 * kg + 6.25 * cm - 5 * age + (female ? -161 : 5);
  const activity = Number(input.activity) || 1.465;
  const goal = GOAL_OPTIONS.find((g) => g.value === input.goal) || GOAL_OPTIONS[0];
  const calories = roundTo(bmr * activity + goal.kcal, 0);
  if (calories < (female ? 1200 : 1500)) return { tooLow: true, calories };

  const grams = (share, macro) => (calories * share) / KCAL[macro];
  const perKg = activity <= 1.2 ? 0.83 : 1;
  const proteinLow = Math.max(60, perKg * kg, grams(0.1, "protein"));
  const fatLow = grams(0.2, "fat");
  const carbLow = grams(0.4, "carbs");
  const carbHigh = Math.max(carbLow, (calories - proteinLow * KCAL.protein - fatLow * KCAL.fat) / KCAL.carbs);
  const plans = Object.fromEntries(PLANS.map((p) => {
    const protein = grams(p.protein, "protein");
    return [p.value, protein < proteinLow
      ? { protein: proteinLow, carbs: carbHigh, fat: fatLow }
      : { protein, carbs: grams(p.carbs, "carbs"), fat: grams(p.fat, "fat") }];
  }));
  const ranges = {
    protein: [proteinLow, plans.highprotein.protein],
    carbs: [carbLow, carbHigh],
    fat: [fatLow, grams(0.35, "fat")],
  };
  const metricWeight = input.weightUnit === "kg";
  return {
    calories,
    kj: roundTo(calories * 4.1868, 0),
    goalText: goal.kcal === 0 ? "maintain your weight" : `${metricWeight ? goal.kg : goal.lb} per week`,
    plans, ranges,
    // Rounded on the reference's server (15-digit pre-round, so 31.4999… → 32).
    sugar: roundTo(grams(0.1, "carbs"), 0),
    saturatedFat: roundTo(grams(0.1, "fat"), 0),
  };
}

/**
 * "Create Your Own": set one macro (grams) and rebalance the other two to keep the Calories,
 * staying within the ranges — the reference's slideProtein / slideCarb / slideFat.
 * plan = { protein, carbs, fat } (current values) → the new { protein, carbs, fat }.
 */
export function slidePlan(result, plan, macro, value) {
  const cal = result.calories;
  const [pLo, pHi] = result.ranges.protein;
  const [cLo, cHi] = result.ranges.carbs;
  const [fLo, fHi] = result.ranges.fat;
  const P = KCAL.protein, C = KCAL.carbs, F = KCAL.fat;
  let { protein, carbs, fat } = plan;
  if (macro === "protein") {
    protein = value;
    const rest = cal - protein * P;
    const share = carbs * C + fat * F;
    carbs = (rest * carbs) / share;
    fat = (rest * fat) / share;
    if (fat < fLo) { fat = fLo; carbs = (rest - fat * F) / C; } else if (fat > fHi) { fat = fHi; carbs = (rest - fat * F) / C; }
    if (carbs < cLo) {
      carbs = cLo; fat = (rest - carbs * C) / F;
      if (fat < fLo) { fat = fLo; protein = (cal - carbs * C - fat * F) / P; }
    } else if (carbs > cHi) {
      carbs = cHi; fat = (rest - carbs * C) / F;
      if (fat > fHi) { fat = fHi; protein = (cal - carbs * C - fat * F) / P; }
    }
  } else if (macro === "carbs") {
    carbs = value;
    const rest = cal - carbs * C;
    fat = (rest - protein * P) / F;
    if (fat < fLo) {
      fat = fLo; protein = (rest - fat * F) / P;
      if (protein < pLo) { protein = pLo; carbs = (cal - protein * P - fat * F) / C; }
    } else if (fat > fHi) {
      fat = fHi; protein = (rest - fat * F) / P;
      if (protein > pHi) { protein = pHi; carbs = (cal - protein * P - fat * F) / C; }
    }
  } else {
    fat = value;
    const rest = cal - fat * F;
    const share = carbs * C + protein * P;
    carbs = (rest * carbs) / share;
    protein = (rest * protein) / share;
    if (protein < pLo) { protein = pLo; carbs = (rest - protein * P) / C; } else if (protein > pHi) { protein = pHi; carbs = (rest - protein * P) / C; }
    if (carbs < cLo) {
      carbs = cLo; protein = (rest - carbs * C) / P;
      if (protein < pLo) { protein = pLo; fat = (cal - carbs * C - protein * P) / F; }
    } else if (carbs > cHi) {
      carbs = cHi; protein = (rest - carbs * C) / P;
      if (protein > pHi) { protein = pHi; fat = (cal - carbs * C - protein * P) / F; }
    }
  }
  return { protein, carbs, fat };
}
