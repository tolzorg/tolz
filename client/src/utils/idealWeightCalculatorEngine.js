// Ideal Weight Calculator engine — matches calculator.net/ideal-weight-calculator.html
// (a GET form, decoded with live probes; see scripts/ideal-weight-calculator.test.js).
//
// For heights over 5 ft, four formulas give an ideal weight in kg from the
// inches above 5 ft (n):
//   Robinson (1983)  men 52 + 1.9n     women 49 + 1.7n
//   Miller (1983)    men 56.2 + 1.41n  women 53.1 + 1.36n
//   Devine (1974)    men 50 + 2.3n     women 45.5 + 2.3n
//   Hamwi (1964)     men 48 + 2.7n     women 45.5 + 2.2n
// plus the healthy BMI range × height²: 18.5–25 for adults (over 20), the
// CDC 5th–85th BMI-for-age percentiles for ages 2–20 (shared with the BMI
// Calculator). At 5 ft or shorter only that healthy range is given, as a
// sentence (WHO for adults, the CDC chart for children).
// Weights show one decimal in kg, pounds, or stones and pounds.

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo, childHealthyBmiRange } from "./bmiCalculatorEngine.js";
import { lengthToCm } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS, lengthToCm, cmToLength } from "./bodyFatCalculatorEngine.js";

const LB_PER_KG = 2.2046;

// The reference's US example.
export const IDEAL_WEIGHT_DEFAULTS = {
  age: "25",
  sex: "male",
  heightUnit: "ft-in", height: "5", height2: "10",
  resultUnit: "lb",
};

const FORMULAS = [
  ["Robinson (1983)", [52, 1.9], [49, 1.7]],
  ["Miller (1983)", [56.2, 1.41], [53.1, 1.36]],
  ["Devine (1974)", [50, 2.3], [45.5, 2.3]],
  ["Hamwi (1964)", [48, 2.7], [45.5, 2.2]],
];

/** A weight in kg as text in the chosen unit: "72.6 kg", "160.0 lbs", "11 st 6.0 lb". */
export function formatMass(kg, unit) {
  if (unit === "kg") return `${roundTo(kg, 1).toFixed(1)} kg`;
  // The reference converts results with 1 kg = 2.2046 lb (not 1 / 0.453592).
  const lb = roundTo(kg * LB_PER_KG, 1);
  if (unit !== "st") return `${lb.toFixed(1)} lbs`;
  let stones = Math.floor(lb / 14);
  let rest = roundTo(lb - stones * 14, 1);
  if (rest >= 14) { stones += 1; rest = 0; }
  return stones ? `${stones} st ${rest.toFixed(1)} lb` : `${rest.toFixed(1)} lb`;
}

/** A range as "59.9 - 81.0 kg" (unit once) or "9 st 2.9 lb - 12 st 6.2 lb". */
function rangeText(loKg, hiKg, unit) {
  const lo = formatMass(loKg, unit);
  const hi = formatMass(hiKg, unit);
  return unit === "st" ? `${lo} - ${hi}` : `${lo.replace(/ (kg|lbs)$/, "")} - ${hi}`;
}

/**
 * @param {{ age, sex, heightUnit, height, height2, resultUnit }} input  strings; sex "male" | "female";
 *   resultUnit "kg" | "lb" | "st".
 * @returns {{ errors: string[] } | { formulas: { name, value }[] | null, healthyRange: string, sentence: string | null }}
 */
export function calculateIdealWeight(input) {
  const female = input.sex === "female";
  const age = num(clean(input.age));
  const cm = lengthToCm(input.heightUnit, input.height, input.height2);
  const unit = ["kg", "lb", "st"].includes(input.resultUnit) ? input.resultUnit : "kg";

  const errors = [];
  if (!(age >= 2 && age <= 80)) errors.push("Please provide an age between 2 and 80.");
  if (!(cm > 0)) errors.push("Please provide a positive height value.");
  if (errors.length) return { errors };

  const m2 = (cm / 100) ** 2;
  const child = age <= 20;
  const [lowBmi, highBmi] = child ? childHealthyBmiRange(female ? "female" : "male", age) : [18.5, 25];
  const healthyRange = rangeText(lowBmi * m2, highBmi * m2, unit);

  const inchesOver5ft = cm / 2.54 - 60;
  if (!(inchesOver5ft > 0)) {
    return {
      formulas: null,
      healthyRange,
      sentence: child
        ? `Based on the CDC chart for ${female ? "girls" : "boys"}, the healthy weight range is ${healthyRange}.`
        : `According to the World Health Organization's recommendations, your healthy weight range is ${healthyRange}.`,
    };
  }
  return {
    formulas: FORMULAS.map(([name, men, women]) => {
      const [base, perInch] = female ? women : men;
      return { name, value: formatMass(base + perInch * inchesOver5ft, unit) };
    }),
    healthyRange,
    sentence: null,
  };
}
