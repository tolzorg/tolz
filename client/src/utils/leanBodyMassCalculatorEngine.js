// Lean Body Mass Calculator engine — matches calculator.net/lean-body-mass-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/lean-body-mass-calculator.test.js).
//
// W = weight in kg, H = height in cm. US inputs are converted as the reference does:
// pounds ÷ 2.2046 (and LBM back × 2.2046), inches × 2.54.
//   Boer (1984):  men 0.407W + 0.267H − 19.2,        women 0.252W + 0.473H − 48.3
//   James (1976): men 1.1W − 128(W/H)²,              women 1.07W − 148(W/H)²
//   Hume (1966):  men 0.32810W + 0.33929H − 29.5336, women 0.29569W + 0.41813H − 43.2933
//   Peters (2011, children 14 or younger): eLBM = 3.8 × 0.0215 · W^0.6469 · H^0.7236
// Each row shows the LBM (1 decimal, in the weight unit) and its share of the weight
// (whole %); body fat = 100 − that share. Nothing is clamped: impossible inputs give
// negative or huge percentages, exactly like the reference. "Age 14 or younger" adds the
// Peters row above the adult formulas.
// Validation (reference wording): "Please provide a valid height value." /
// "Please provide a valid weight value." — each must be positive; the two height boxes
// may each be blank (0) but not negative.

import { clean, num, formatFixed } from "./marginCalculatorEngine.js";
import { lengthToCm, LENGTH_UNITS, WEIGHT_UNITS } from "./bodyFatCalculatorEngine.js";

export { LENGTH_UNITS, WEIGHT_UNITS };

const LB_PER_KG = 2.2046; // the reference's factor (fitted: 101/101 live US cases)

// The reference's US example (5 ft 10 in, 160 lb).
export const LBM_DEFAULTS = {
  sex: "male",
  child: false,
  heightUnit: "ft-in", height: "5", height2: "10",
  weightUnit: "lb", weight: "160",
};

const FORMULAS = [
  ["Boer", { male: (W, H) => 0.407 * W + 0.267 * H - 19.2, female: (W, H) => 0.252 * W + 0.473 * H - 48.3 }],
  ["James", { male: (W, H) => 1.1 * W - 128 * (W / H) ** 2, female: (W, H) => 1.07 * W - 148 * (W / H) ** 2 }],
  ["Hume", { male: (W, H) => 0.32810 * W + 0.33929 * H - 29.5336, female: (W, H) => 0.29569 * W + 0.41813 * H - 43.2933 }],
];
const peters = (W, H) => 3.8 * 0.0215 * W ** 0.6469 * H ** 0.7236;

/**
 * input: { sex, child, height, height2, heightUnit, weight, weightUnit }
 * → { errors } or { rows: [{ formula, lbm, share, bodyFat, child? }], unit: "kg" | "lbs" }
 *   lbm / share / bodyFat are display strings ("127.4", "80", "20").
 */
export function calculateLeanBodyMass(input) {
  const sex = input.sex === "female" ? "female" : "male";
  const H = lengthToCm(input.heightUnit, input.height, input.height2);
  const value = num(clean(input.weight));
  const W = input.weightUnit === "kg" ? value : (input.weightUnit === "st" ? value * 14 : value) / LB_PER_KG;

  const errors = [];
  if (!(H > 0)) errors.push("Please provide a valid height value.");
  if (!(W > 0)) errors.push("Please provide a valid weight value.");
  if (errors.length) return { errors };

  const kg = input.weightUnit === "kg";
  const row = (formula, lbmKg, child) => {
    const share = Number(formatFixed((lbmKg / W) * 100, 0).replace(/,/g, ""));
    return {
      formula, child,
      lbm: formatFixed(kg ? lbmKg : lbmKg * LB_PER_KG, 1),
      share: share.toLocaleString("en-US"),
      bodyFat: (100 - share).toLocaleString("en-US"),
    };
  };
  const rows = FORMULAS.map(([name, f]) => row(name, f[sex](W, H), false));
  if (input.child) rows.unshift(row("Peters", peters(W, H), true));
  return { rows, unit: kg ? "kg" : "lbs" };
}
