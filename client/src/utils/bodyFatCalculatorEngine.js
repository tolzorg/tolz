// Body Fat Calculator engine — matches calculator.net/body-fat-calculator.html
// (a GET form, decoded with live probes; see scripts/body-fat-calculator.test.js).
//
// U.S. Navy method (Hodgdon & Beckett, 1984), always in centimeters: inches
// are converted (× 2.54) and run through the SI formulas, as the reference
// does; the USC formulas give slightly different results and are not used.
//   men:   495 / (1.0324 − 0.19077·log10(waist − neck) + 0.15456·log10(height)) − 450
//   women: 495 / (1.29579 − 0.35004·log10(waist + hip − neck) + 0.22100·log10(height)) − 450
// A negative result counts as 0%. Fat mass = weight × BF, lean mass = the rest.
// Category: American Council on Exercise bands, lower bound inclusive.
// Ideal body fat: Jackson & Pollock table for ages 20–55, linear between the
// listed ages (no ideal row outside that range). "Body Fat to Lose / Gain to
// Reach Ideal" = fat mass − weight × ideal, shown only when body fat is at
// least 1 point away from ideal.
// BMI method: adults (18+) 1.20·BMI + 0.23·age − 16.2 (men) / − 5.4 (women);
// children 1.51·BMI − 0.70·age − 2.2 (boys) / + 1.4 (girls).
// Without tape measurements (method "bmi", a Tolz addition) the BMI-method
// estimate becomes the body fat used for every other result.
// Deliberate difference: where the reference prints "nan%" (waist not larger
// than the neck) or divides a zero weight, this engine shows an error instead.

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

const INCH_CM = 2.54;
const POUND_KG = 0.453592;

export const LENGTH_UNITS = [
  { value: "cm", label: "centimeters (cm)", short: "cm" },
  { value: "m", label: "meters (m)", short: "m" },
  { value: "in", label: "inches (in)", short: "in" },
  { value: "ft", label: "feet (ft)", short: "ft" },
  { value: "ft-in", label: "feet / inches (ft / in)", short: "ft / in", parts: ["ft", "in"] },
  { value: "m-cm", label: "meters / centimeters (m / cm)", short: "m / cm", parts: ["m", "cm"] },
];
export const WEIGHT_UNITS = [
  { value: "kg", label: "kilograms (kg)", short: "kg" },
  { value: "lb", label: "pounds (lb)", short: "lb" },
  { value: "st", label: "stones (st)", short: "st" },
];

// The reference's US example (152 lb, 5 ft 10.5 in, neck 1 ft 7.5 in, …).
export const BODY_FAT_DEFAULTS = {
  method: "navy", // "navy" (tape measurements) | "bmi" (no measurements)
  sex: "male",
  age: "25",
  weightUnit: "lb", weight: "152",
  heightUnit: "ft-in", height: "5", height2: "10.5",
  neckUnit: "ft-in", neck: "1", neck2: "7.5",
  waistUnit: "ft-in", waist: "3", waist2: "1.5",
  hipUnit: "ft-in", hip: "2", hip2: "10.5",
};

const CATEGORIES = {
  male: [[25, "Obese"], [18, "Average"], [14, "Fitness"], [6, "Athletes"], [2, "Essential Fat"]],
  female: [[32, "Obese"], [25, "Average"], [21, "Fitness"], [14, "Athletes"], [10, "Essential Fat"]],
};
// Jackson & Pollock ideal body fat by age.
const IDEAL_AGES = [20, 25, 30, 35, 40, 45, 50, 55];
const IDEAL = {
  female: [17.7, 18.4, 19.3, 21.5, 22.2, 22.9, 25.2, 26.3],
  male: [8.5, 10.5, 12.7, 13.7, 15.3, 16.4, 18.9, 20.9],
};

/** A blank part of a two-part length counts as 0; negatives and text are NaN. */
function part(text) {
  if (text === "") return 0;
  const n = num(text);
  return n >= 0 ? n : NaN;
}

/** Length in centimeters from a value (and second box) in any LENGTH_UNITS unit. */
export function lengthToCm(unit, a, b) {
  const one = num(clean(a));
  switch (unit) {
    case "cm": return one;
    case "m": return one * 100;
    case "in": return one * INCH_CM;
    case "ft": return one * 12 * INCH_CM;
    case "ft-in": return (part(clean(a)) * 12 + part(clean(b))) * INCH_CM;
    case "m-cm": return part(clean(a)) * 100 + part(clean(b));
    default: return NaN;
  }
}

/** The boxes' text for a length in cm, in another unit (used when the unit is switched). */
export function cmToLength(unit, cm) {
  if (!(cm > 0)) return ["", ""];
  const t = (v, d) => String(roundTo(v, d));
  switch (unit) {
    case "cm": return [t(cm, 1), ""];
    case "m": return [t(cm / 100, 3), ""];
    case "in": return [t(cm / INCH_CM, 1), ""];
    case "ft": return [t(cm / INCH_CM / 12, 2), ""];
    case "ft-in": {
      const inches = roundTo(cm / INCH_CM, 1);
      const feet = Math.floor(inches / 12);
      return [String(feet), t(inches - feet * 12, 1)];
    }
    case "m-cm": {
      const total = roundTo(cm, 1);
      const m = Math.floor(total / 100);
      return [String(m), t(total - m * 100, 1)];
    }
    default: return ["", ""];
  }
}

const toPounds = (unit, value) => (unit === "st" ? value * 14 : value);
/** Weight in kg from its box. */
export function weightToKg(unit, text) {
  const value = num(clean(text));
  return unit === "kg" ? value : toPounds(unit, value) * POUND_KG;
}
/** The box's text for a weight in kg, in another unit. */
export function kgToWeight(unit, kg) {
  if (!(kg > 0)) return "";
  if (unit === "kg") return String(roundTo(kg, 1));
  const lb = kg / POUND_KG;
  return String(unit === "st" ? roundTo(lb / 14, 2) : roundTo(lb, 1));
}

/** "9 st 3.5 lb" for a number of pounds. */
function stoneText(lb) {
  const total = roundTo(lb, 1);
  let stones = Math.floor(total / 14);
  let rest = roundTo(total - stones * 14, 1);
  if (rest >= 14) { stones += 1; rest = 0; }
  if (!stones) return `${rest.toFixed(1)} lb`;
  return rest ? `${stones} st ${rest.toFixed(1)} lb` : `${stones} st`;
}

/** Jackson & Pollock ideal body fat (%) for an age, or null outside 20–55. */
export function idealBodyFat(sex, age) {
  if (!(age >= 20 && age <= 55)) return null;
  const values = IDEAL[sex];
  const i = Math.min(IDEAL_AGES.length - 2, Math.floor((age - 20) / 5));
  return values[i] + ((values[i + 1] - values[i]) * (age - IDEAL_AGES[i])) / 5;
}

/**
 * @param {object} input  strings: sex ("male" | "female"), age, weight + weightUnit, and for height / neck /
 *   waist / hip a value, a second box (e.g. height2) and a unit (e.g. heightUnit) from LENGTH_UNITS.
 * @returns {{ errors: string[] } | object}  See the return statement for the result shape.
 */
export function calculateBodyFat(input) {
  const female = input.sex === "female";
  const sex = female ? "female" : "male";
  const age = num(clean(input.age));
  const weightUnit = ["kg", "lb", "st"].includes(input.weightUnit) ? input.weightUnit : "kg";
  const kg = weightToKg(weightUnit, input.weight);
  const len = (key) => lengthToCm(input[`${key}Unit`], input[key], input[`${key}2`]);
  // "bmi": no tape measurements — every result comes from the BMI method.
  const tape = input.method !== "bmi";
  const height = len("height");
  const neck = tape ? len("neck") : 0;
  const waist = tape ? len("waist") : 0;
  const hip = tape && female ? len("hip") : 0;

  const errors = [];
  if (!(age >= 0)) errors.push("Please provide a positive age.");
  if (!(kg > 0)) errors.push("Please provide a positive weight.");
  if (!(height > 0)) errors.push("Please provide a positive height.");
  if (tape && !(neck > 0)) errors.push("Please provide a positive neck measurement.");
  if (tape && !(waist > 0)) errors.push("Please provide a positive waist measurement.");
  if (tape && female && !(hip > 0)) errors.push("Please provide a positive hip measurement.");
  if (tape && !errors.length && (female ? waist + hip - neck : waist - neck) <= 0) {
    errors.push(female ? "The waist plus hip must be larger than the neck." : "The waist must be larger than the neck.");
  }
  if (errors.length) return { errors };

  const m = height / 100;
  const bmi = kg / (m * m);
  const bmiMethod = age >= 18
    ? 1.2 * bmi + 0.23 * age - (female ? 5.4 : 16.2)
    : 1.51 * bmi - 0.7 * age + (female ? 1.4 : -2.2);

  const log = Math.log10;
  let bf = !tape
    ? bmiMethod
    : female
      ? 495 / (1.29579 - 0.35004 * log(waist + hip - neck) + 0.221 * log(height)) - 450
      : 495 / (1.0324 - 0.19077 * log(waist - neck) + 0.15456 * log(height)) - 450;
  if (!(bf > 0)) bf = 0;

  // Masses are shown in the chosen unit; kg results in kg, lb and st in pounds.
  const metric = weightUnit === "kg";
  const weight = metric ? kg : toPounds(weightUnit, num(clean(input.weight)));
  const mass = (value) => (weightUnit === "st" ? stoneText(value) : `${roundTo(value, 1).toFixed(1)} ${metric ? "kg" : "lbs"}`);
  const fatMass = (weight * bf) / 100;

  const category = (CATEGORIES[sex].find(([min]) => bf >= min) || [0, "Less than Essential Fat"])[1];
  const ideal = idealBodyFat(sex, age);
  let toIdeal = null;
  // The reference leaves the row out when body fat is within 1 point of ideal.
  if (ideal !== null && Math.abs(bf - ideal) >= 1) {
    const diff = fatMass - (weight * ideal) / 100;
    toIdeal = { verb: diff >= 0 ? "Lose" : "Gain", amount: mass(Math.abs(diff)) };
  }

  return {
    method: tape ? "navy" : "bmi",
    sex,
    bodyFat: roundTo(bf, 1).toFixed(1),
    category,
    fatMass: mass(fatMass),
    leanMass: mass(weight - fatMass),
    ideal: ideal === null ? null : `${roundTo(ideal, 1).toFixed(1)}%`,
    toIdeal,
    bmiMethod: `${roundTo(bmiMethod, 1).toFixed(1)}%`,
    bmi: roundTo(bmi, 1).toFixed(1),
    // Arrow position on the reference's 320-px scale image: 8 px per percent.
    gauge: bf > 0 && bf < 40 ? { percent: bf } : null,
  };
}
