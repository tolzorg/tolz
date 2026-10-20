// Carbohydrate Calculator engine — matches calculator.net/carbohydrate-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/carbohydrate-calculator.test.js).
//
// Calories: BMR × activity for maintenance, ∓500 / ∓1000 kcal for losing / gaining
// 1 / 2 lb (0.5 / 1 kg) a week.
//   Mifflin St Jeor: 10·kg + 6.25·cm − 5·age + 5 (men) / − 161 (women)
//   Katch-McArdle:   370 + 21.6 × (1 − body fat) × kg
// US inputs: pounds × 0.453592, inches × 2.54 (the shared Body Fat Calculator helpers).
// Carbs: 40% / 55% / 65% / 75% of the Calories at 3.75 kcal per gram, shown as whole grams;
// US results add ounces (÷ 28.3495, 2 dp) and pounds (÷ 453.592, 3 dp).
// When 40% of the maintenance Calories is under 130 g (the Institute of Medicine minimum)
// the reference swaps the table for one sentence per goal: under 130 g at 75% → "130 grams";
// under 130 g at 40% → "130 - <75%>"; otherwise "<40%> (40%) - <75%> (75%)", plus the 55% /
// 65% amounts whenever the 75% amount reaches 130 g. The unrounded Calories decide every
// comparison; the page shows them rounded (negatives included).
// Validation (reference wording and order): "Please provide an age between 18 and 80.",
// "Please provide positive height value.", "Please provide positive weight value.", and with
// Katch-McArdle "Please provide a reasonable body fat percentage." (3-80%).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";
import { lengthToCm, weightToKg, LENGTH_UNITS, WEIGHT_UNITS } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS };

export const ACTIVITY_OPTIONS = [
  { value: "1.2", label: "Sedentary: little or no exercise" },
  { value: "1.375", label: "Light: exercise 1-3 times/week" },
  { value: "1.465", label: "Moderate: exercise 4-5 times/week" },
  { value: "1.55", label: "Active: daily exercise or intense exercise 3-4 times/week" },
  { value: "1.725", label: "Very Active: intense exercise 6-7 times/week" },
  { value: "1.9", label: "Extra Active: very intense exercise daily, or physical job" },
];

export const SHARES = [0.4, 0.55, 0.65, 0.75];
export const CARB_KCAL = 3.75;
export const MIN_CARBS = 130;
const GOALS = [
  { kcal: 0, us: "Weight Maintenance", metric: "Weight Maintenance", text: "maintain your weight" },
  { kcal: -500, us: "Lose 1 lb/week", metric: "Lose 0.5 kg/week", usText: "lose 1 lb per week", metricText: "lose 0.5 kg per week" },
  { kcal: -1000, us: "Lose 2 lb/week", metric: "Lose 1 kg/week", usText: "lose 2 lb per week", metricText: "lose 1 kg per week" },
  { kcal: 500, us: "Gain 1 lb/week", metric: "Gain 0.5 kg/week", usText: "gain 1 lb per week", metricText: "gain 0.5 kg per week" },
  { kcal: 1000, us: "Gain 2 lb/week", metric: "Gain 1 kg/week", usText: "gain 2 lb per week", metricText: "gain 1 kg per week" },
];

// The reference's US example.
export const CARB_DEFAULTS = {
  age: "25", sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "160",
  activity: "1.375", formula: "mifflin", bodyFat: "20",
};

/**
 * input: { age, sex, height, height2, heightUnit, weight, weightUnit, activity, formula, bodyFat }
 * → { errors } | { us, text, rows: [{ label, goalText, maintain, kcal, calories, grams: [40%, 55%, 65%, 75%] }] }
 *   (kcal / grams unrounded; calories rounded; text = the sentence layout)
 */
export function calculateCarbs(input) {
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const kg = weightToKg(input.weightUnit, input.weight);
  const katch = input.formula === "katch";
  const bf = num(clean(input.bodyFat));

  const errors = [];
  if (!(age >= 18 && age <= 80)) errors.push("Please provide an age between 18 and 80.");
  if (!(cm > 0)) errors.push("Please provide positive height value.");
  if (!(kg > 0)) errors.push("Please provide positive weight value.");
  if (katch && !(bf >= 3 && bf <= 80)) errors.push("Please provide a reasonable body fat percentage.");
  if (errors.length) return { errors };

  const female = input.sex === "female";
  const bmr = katch ? 370 + 21.6 * (1 - bf / 100) * kg : 10 * kg + 6.25 * cm - 5 * age + (female ? -161 : 5);
  const maintain = bmr * (Number(input.activity) || 1.375);
  const us = input.weightUnit !== "kg";
  const rows = GOALS.map((g) => {
    const kcal = maintain + g.kcal;
    return {
      label: us ? g.us : g.metric,
      goalText: g.text || (us ? g.usText : g.metricText),
      maintain: g.kcal === 0,
      kcal,
      calories: roundTo(kcal, 0),
      grams: SHARES.map((s) => (kcal * s) / CARB_KCAL),
    };
  });
  return { us, text: rows[0].grams[0] < MIN_CARBS, rows };
}

const int = (v) => roundTo(v, 0).toLocaleString("en-US");
export const formatGrams = (g) => int(g);
export const formatCalories = (c) => int(c);
export const formatOz = (g) => roundTo(g / 28.3495, 2).toFixed(2);
export const formatLb = (g) => roundTo(g / 453.592, 3).toFixed(3);

/**
 * The sentence-layout amount for one row:
 * { kind: "min" | "low" | "range", lo, hi, mid: [55%, 65%] | null } (grams, unrounded; lo = 130 when
 * the 40% amount is under it).
 */
export function sentenceAmount(row) {
  const [g40, g55, g65, g75] = row.grams;
  if (g75 < MIN_CARBS) return { kind: "min", lo: MIN_CARBS, hi: null, mid: null };
  if (g40 < MIN_CARBS) return { kind: "low", lo: MIN_CARBS, hi: g75, mid: [g55, g65] };
  return { kind: "range", lo: g40, hi: g75, mid: [g55, g65] };
}
