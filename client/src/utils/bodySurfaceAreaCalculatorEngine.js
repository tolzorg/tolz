// Body Surface Area Calculator engine — matches calculator.net/body-surface-area-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/body-surface-area-calculator.test.js).
//
// BSA in m², with W = weight in kg (pounds × 0.453592, grams ÷ 1000) and H = height in cm:
//   Du Bois         0.007184 × W^0.425 × H^0.725
//   Mosteller       0.016667 × W^0.5 × H^0.5 (the reference's rounded 1/60)
//   Haycock         0.024265 × W^0.5378 × H^0.3964
//   Gehan & George  0.0235 × W^0.51456 × H^0.42246
//   Boyd            0.0333 × W^(0.6157 − 0.0188 × log10(W)) × H^0.3
//   Fujimoto        0.00883 × W^0.444 × H^0.663 (the page prints 0.008883, but its results use 0.00883)
//   Takahira        0.007241 × W^0.425 × H^0.725
//   Schlich         men 0.000579479 × W^0.38 × H^1.24, women 0.000975482 × W^0.46 × H^1.08
// Shown as m² (2 dp), ft² (× 10.7639, 2 dp) and in² (× 1550.0031, whole), each from the unrounded m².
// BMI = W / (H/100)² to one decimal, trailing zero dropped and no thousands separator; it is not shown
// for a zero height (the reference's page stops after the table).
// Height: feet + inches when both are filled in and add up to more than 0, otherwise the cm box; a filled
// cm box adds "Using a body height of …:" naming the one used. Weight 0 and height 0 cm are accepted.
// Validation (reference wording): "Please provide a valid body weight value." (a number ≥ 0) and
// "Please provide a valid body height value." (feet / inches not numbers ≥ 0, or no usable height).

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const WEIGHT_UNITS = [
  { value: "lb", label: "pounds (lb)", short: "lb" },
  { value: "kg", label: "kilograms (kg)", short: "kg" },
  { value: "g", label: "grams (g)", short: "g" },
];
export const HEIGHT_UNITS = [
  { value: "ft-in", label: "feet / inches (ft / in)", short: "ft / in", parts: ["ft", "in"] },
  { value: "cm", label: "centimeters (cm)", short: "cm" },
];

// The reference's US example.
export const BSA_DEFAULTS = { sex: "male", weight: "155", weightUnit: "lb", heightUnit: "ft-in", feet: "5", inches: "9", cm: "" };

export const FORMULAS = ["Du Bois", "Mosteller", "Haycock", "Gehan & George", "Boyd", "Fujimoto", "Takahira", "Schlich"];
export const FT2_PER_M2 = 10.7639;
export const IN2_PER_M2 = 1550.0031;

const KG = { lb: 0.453592, kg: 1, g: 0.001 };
const filledNumber = (t) => clean(t) !== "" && num(clean(t)) >= 0;
const isBad = (t) => clean(t) !== "" && !(num(clean(t)) >= 0);

/** All eight formulas in m² (unrounded), for weight kg and height cm. */
export function bsaFormulas(W, H, female) {
  return [
    0.007184 * W ** 0.425 * H ** 0.725,
    0.016667 * W ** 0.5 * H ** 0.5,
    0.024265 * W ** 0.5378 * H ** 0.3964,
    0.0235 * W ** 0.51456 * H ** 0.42246,
    0.0333 * W ** (0.6157 - 0.0188 * Math.log10(W)) * H ** 0.3,
    0.00883 * W ** 0.444 * H ** 0.663,
    0.007241 * W ** 0.425 * H ** 0.725,
    female ? 0.000975482 * W ** 0.46 * H ** 1.08 : 0.000579479 * W ** 0.38 * H ** 1.24,
  ];
}

/**
 * input: { sex, weight, weightUnit: "lb" | "kg" | "g", feet, inches, cm }
 * → { errors } | { rows: [{ formula, m2, ft2, in2 }], bmi: number | null, heightNote: string | null }
 *   (m2 / ft2 / in2 rounded as shown)
 */
export function calculateBsa(input) {
  const weight = num(clean(input.weight));
  const W = weight * (KG[input.weightUnit] ?? KG.lb);
  const ftIn = filledNumber(input.feet) && filledNumber(input.inches)
    ? num(clean(input.feet)) * 12 + num(clean(input.inches)) : NaN;
  const cmText = clean(input.cm);
  let H = NaN;
  let heightNote = null;
  if (!isBad(input.feet) && !isBad(input.inches)) {
    if (ftIn > 0) {
      H = ftIn * 2.54;
      if (cmText !== "") heightNote = `${clean(input.feet)} feet and ${clean(input.inches)} inches`;
    } else if (filledNumber(cmText)) {
      H = num(cmText);
      heightNote = `${cmText} cm`;
    }
  }

  const errors = [];
  if (!(weight >= 0)) errors.push("Please provide a valid body weight value.");
  if (Number.isNaN(H)) errors.push("Please provide a valid body height value.");
  if (errors.length) return { errors };

  const rows = bsaFormulas(W, H, input.sex === "female").map((m2, i) => ({
    formula: FORMULAS[i],
    m2: roundTo(m2, 2),
    ft2: roundTo(m2 * FT2_PER_M2, 2),
    in2: roundTo(m2 * IN2_PER_M2, 0),
  }));
  return { rows, bmi: H > 0 ? roundTo(W / (H / 100) ** 2, 1) : null, heightNote };
}

export const formatArea = (x, decimals) => x.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
