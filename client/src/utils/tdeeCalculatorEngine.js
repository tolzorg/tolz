// TDEE Calculator engine — matches calculator.net/tdee-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/tdee-calculator.test.js).
//
// TDEE = BMR × activity (1 = BMR only, then 1.2 … 1.9), rounded to a whole Calorie.
//   Mifflin St Jeor: 10·kg + 6.25·cm − 5·age + 5 (men) / − 161 (women)
//   Katch-McArdle:   370 + 21.6 × (1 − body fat) × kg
// Goals: ∓250 / ∓500 / ∓1000 Calories a day for 0.5 / 1 / 2 lb (0.25 / 0.5 / 1 kg) a week,
// from the rounded TDEE; the percentage is round(goal ÷ TDEE × 100). Kilojoules are the rounded
// Calories × 4.1868, rounded again.
// The weight-loss section appears only for an (unrounded) BMI over 18.5, and the weight-gain section
// only under 35. Weight-loss goals under 1,500 Calories (men) / 1,200 (women) are dropped; if any
// remain, a note names the first dropped goal ("Please consult with a doctor when losing 2 lbs or
// more per week …"); if even mild weight loss is too low, the section goes.
// BMI = kg / m² to one decimal, with the adult WHO category (from the unrounded BMI, so 17.04 shown as
// 17.0 is "Mild thinness") over age 20 (the reference's line for
// ages 18-20 breaks off after the score, so only the score is shown); healthy range 18.5 - 25.
// The BMR activity level shows only the BMR.
// US inputs: pounds × 0.453592, inches × 2.54 (the shared Body Fat Calculator helpers).
// Validation (reference wording and order): "Please provide an age between 18 and 80.",
// "Please provide a reasonable height." (feet / inches under 10 inches in total) or "Please provide
// positive height value.", "Please provide positive weight value.", and with Katch-McArdle "Please
// provide a reasonable body fat percentage." (3-80%).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo, adultCategory } from "./bmiCalculatorEngine.js";
import { lengthToCm, weightToKg, LENGTH_UNITS, WEIGHT_UNITS } from "./bodyFatCalculatorEngine.js";
import { ACTIVITY_OPTIONS } from "./macroCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS, ACTIVITY_OPTIONS };

export const KJ_PER_KCAL = 4.1868;

// The reference's US example.
export const TDEE_DEFAULTS = {
  age: "25", sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "165",
  activity: "1.465", resultUnit: "calories", formula: "mifflin", bodyFat: "20",
};

const LOSE = [
  { label: "Mild weight loss", kcal: -250, us: "0.5 lb", metric: "0.25 kg", usNote: "0.5 lbs", metricNote: "0.25 kg" },
  { label: "Weight loss", kcal: -500, us: "1 lb", metric: "0.5 kg", usNote: "1 lb", metricNote: "0.5 kg" },
  { label: "Extreme weight loss", kcal: -1000, us: "2 lb", metric: "1 kg", usNote: "2 lbs", metricNote: "1 kg" },
];
const GAIN = [
  { label: "Mild weight gain", kcal: 250, us: "0.5 lb", metric: "0.25 kg" },
  { label: "Weight gain", kcal: 500, us: "1 lb", metric: "0.5 kg" },
  { label: "Fast Weight gain", kcal: 1000, us: "2 lb", metric: "1 kg" },
];
const FEET_INCHES = new Set(["ft-in"]);

/**
 * input: { age, sex, height, height2, heightUnit, weight, weightUnit, activity, resultUnit, formula, bodyFat }
 * → { errors }
 *   | { bmrOnly: true, value, unit }
 *   | { value, unit, bmi: { score, category, color } , lose: [{ label, rate, value, percent }] | null,
 *       loseNote: { rate, minimum } | null, gain: [...] | null }
 *   value / minimum in the chosen unit (whole numbers); unit "Calories" | "kJ"; category null at 20 and under.
 */
export function calculateTdee(input) {
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const kg = weightToKg(input.weightUnit, input.weight);
  const katch = input.formula === "katch";
  const bf = num(clean(input.bodyFat));

  const errors = [];
  if (!(age >= 18 && age <= 80)) errors.push("Please provide an age between 18 and 80.");
  if (FEET_INCHES.has(input.heightUnit) && cm >= 0 && cm < 10 * 2.54) errors.push("Please provide a reasonable height.");
  else if (!(cm > 0)) errors.push("Please provide positive height value.");
  if (!(kg > 0)) errors.push("Please provide positive weight value.");
  if (katch && !(bf >= 3 && bf <= 80)) errors.push("Please provide a reasonable body fat percentage.");
  if (errors.length) return { errors };

  const female = input.sex === "female";
  const bmr = katch ? 370 + 21.6 * (1 - bf / 100) * kg : 10 * kg + 6.25 * cm - 5 * age + (female ? -161 : 5);
  const activity = Number(input.activity) || 1.465;
  const tdee = roundTo(bmr * activity, 0);
  const kj = input.resultUnit === "kilojoules";
  const unit = kj ? "kJ" : "Calories";
  const show = (kcal) => (kj ? roundTo(kcal * KJ_PER_KCAL, 0) : kcal);
  if (activity === 1) return { bmrOnly: true, value: show(tdee), unit };

  const us = input.weightUnit !== "kg";
  const goal = (g) => {
    const kcal = tdee + g.kcal;
    return { label: g.label, rate: us ? g.us : g.metric, kcal, value: show(kcal), percent: roundTo((kcal / tdee) * 100, 0) };
  };
  const rawBmi = kg / (cm / 100) ** 2;
  const minimum = female ? 1200 : 1500;
  const lose = rawBmi > 18.5 ? LOSE.map(goal).filter((g) => g.kcal >= minimum) : [];
  const dropped = LOSE[lose.length];
  const bmi = roundTo(rawBmi, 1);
  const [category, color] = age > 20 ? adultCategory(rawBmi) : [null, null];
  return {
    value: show(tdee),
    unit,
    bmi: { score: bmi, category, color },
    lose: lose.length ? lose : null,
    loseNote: lose.length && dropped ? { rate: us ? dropped.usNote : dropped.metricNote, minimum: show(minimum) } : null,
    gain: rawBmi < 35 ? GAIN.map(goal) : null,
  };
}

export const formatNumber = (x) => x.toLocaleString("en-US");
export const formatBmi = (x) => x.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
