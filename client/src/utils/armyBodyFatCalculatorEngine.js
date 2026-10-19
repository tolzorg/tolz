// Army Body Fat Calculator engine — the Army's current body composition test.
//
// On July 7, 2026 the Army replaced its height and weight tables, the
// circumference-based tape test and supplemental body fat assessments with the
// waist-to-height ratio (WHtR): waist circumference at the navel (belly button)
// divided by height, both in the same unit. A ratio below 0.55 meets the
// standard; 0.55 or higher is flagged and enrolled in the Army Body Composition
// Program until the standard is met (army.mil, "Army modifies body composition
// program, adopts waist-to-height ratio"). The ratio is compared unrounded.
//
// Waist and height accept any LENGTH_UNITS unit (shared with the Body Fat
// Calculator); both are converted to inches. "Waist needed" and "reduce by" are
// shown in centimeters for metric waist units, inches otherwise.

import { clean, num } from "./marginCalculatorEngine.js";
import { lengthToCm, LENGTH_UNITS } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS };

const INCH_CM = 2.54;

/** A ratio below this meets the standard. */
export const WHTR_LIMIT = 0.55;

// Example values shown as placeholders: a 34-inch waist, 5 ft 10 in tall.
export const ARMY_BODY_FAT_DEFAULTS = {
  waistUnit: "in", waist: "34", waist2: "",
  heightUnit: "ft-in", height: "5", height2: "10",
};

/** A blank part of a two-part length counts as 0; negatives and text are NaN. */
function part(text) {
  const t = clean(text);
  if (t === "") return 0;
  const n = num(t);
  return n >= 0 ? n : NaN;
}

/** A length in inches from its box(es) in any LENGTH_UNITS unit (exact for the US units). */
export function lengthInches(unit, a, b) {
  switch (unit) {
    case "in": return num(clean(a));
    case "ft": return num(clean(a)) * 12;
    case "ft-in": return part(a) * 12 + part(b);
    default: return lengthToCm(unit, a, b) / INCH_CM;
  }
}

/**
 * input: { waist, waist2, waistUnit, height, height2, heightUnit }
 * → { errors } or { ratio, meets, waist, height, maxWaist, reduceBy, unit }
 *   (waist, height, maxWaist and reduceBy in `unit`: "cm" or "in").
 */
export function calculateArmyBodyFat(input) {
  const waist = lengthInches(input.waistUnit, input.waist, input.waist2);
  const height = lengthInches(input.heightUnit, input.height, input.height2);

  const errors = [];
  if (!(waist > 0)) errors.push("Please provide a positive waist circumference value.");
  if (!(height > 0)) errors.push("Please provide a positive height value.");
  if (errors.length) return { errors };

  const ratio = waist / height;
  const metric = ["cm", "m", "m-cm"].includes(input.waistUnit);
  const k = metric ? INCH_CM : 1;
  const maxWaist = WHTR_LIMIT * height; // the waist must stay below this
  return {
    ratio,
    meets: ratio < WHTR_LIMIT,
    waist: waist * k,
    height: height * k,
    maxWaist: maxWaist * k,
    reduceBy: ratio < WHTR_LIMIT ? 0 : (waist - maxWaist) * k,
    unit: metric ? "cm" : "in",
  };
}
