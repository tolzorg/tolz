// One Rep Max Calculator engine — matches calculator.net/one-rep-max-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/one-rep-max-calculator.test.js).
//
// 1RM from a weight w lifted r times (1-10):
//   Epley:    w × (1 + r/30)     (r = 1 gives w itself)
//   Brzycki:  w × 36 / (37 − r)
//   Lombardi: w × r^0.10
// The 1RM is worked out in the lifted unit, then converted to the desired unit
// (1 lb = 0.453592 kg). Tables:
//   - reps 1-10, 12, 14, 16, 18, 20: the weight for that many reps (the formula
//     inverted at that rep count; 1 rep = the 1RM) and its % of the 1RM (whole %);
//   - 100% … 50% of the 1RM in 5% steps: the weight and the reps possible there,
//     rounded down (at least 1). Those rep counts depend only on the percent; they
//     reproduce the reference's float arithmetic exactly, e.g. Lombardi at 50%
//     shows 1023 (exp(ln 2 / 0.1) is just under 1024) and Epley at 75% shows 10.
// The chart shows the weights for 1-20 reps.
// Validation (reference wording and order): "Please provide a positive weight lifted
// value."; then for the reps: not a positive number → "Please provide a positive
// repeated number.", above 10 → "Please provide a repeated number of 10 or less.",
// not whole → "The repeated number needs to be an integer.".

import { clean, num, formatFixed } from "./marginCalculatorEngine.js";

const LB_KG = 0.453592;
export const MAX_REPS = 10;

export const WEIGHT_UNIT_OPTIONS = [
  { value: "kg", label: "kilograms (kg)", short: "kg" },
  { value: "lb", label: "pounds (lb)", short: "lb" },
];
export const FORMULA_OPTIONS = [
  { value: "epley", label: "Epley" },
  { value: "brzycki", label: "Brzycki" },
  { value: "lombardi", label: "Lombardi" },
];

// The reference's example.
export const ONE_REP_MAX_DEFAULTS = { lift: "100", liftUnit: "kg", reps: "5", outUnit: "kg", formula: "epley" };

const FORMULAS = {
  epley: {
    max: (w, r) => (r === 1 ? w : w * (1 + r / 30)),
    at: (m, n) => (n === 1 ? m : m / (1 + n / 30)),
    repsAt: (P) => ((100 - P) * 30) / P,
  },
  brzycki: {
    max: (w, r) => (w * 36) / (37 - r),
    at: (m, n) => (m * (37 - n)) / 36,
    repsAt: (P) => 37 - (36 * P) / 100,
  },
  lombardi: {
    max: (w, r) => w * r ** 0.1,
    at: (m, n) => m / n ** 0.1,
    repsAt: (P) => Math.exp(Math.log(100 / P) / 0.1),
  },
};
const TABLE_REPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];
const TABLE_PERCENTS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

const fmt = (x) => formatFixed(x, 1);

/**
 * input: { lift, liftUnit: "kg" | "lb", reps, outUnit: "kg" | "lb", formula: "epley" | "brzycki" | "lombardi" }
 * → { errors } or { oneRepMax, unit, byReps: [{ reps, weight, percent }], byPercent: [{ percent, weight, reps }],
 *     chart: [{ reps, value, label }] }   (weights are display strings)
 */
export function calculateOneRepMax(input) {
  const lift = num(clean(input.lift));
  const reps = num(clean(input.reps));
  const errors = [];
  if (!(lift > 0)) errors.push("Please provide a positive weight lifted value.");
  if (!(reps > 0)) errors.push("Please provide a positive repeated number.");
  else if (reps > MAX_REPS) errors.push(`Please provide a repeated number of ${MAX_REPS} or less.`);
  else if (!Number.isInteger(reps)) errors.push("The repeated number needs to be an integer.");
  if (errors.length) return { errors };

  const f = FORMULAS[input.formula] || FORMULAS.epley;
  const outUnit = input.outUnit === "lb" ? "lb" : "kg";
  const k = input.liftUnit === outUnit ? 1 : outUnit === "lb" ? 1 / LB_KG : LB_KG;
  const m = f.max(lift, reps) * k;

  return {
    oneRepMax: fmt(m),
    unit: outUnit,
    byReps: TABLE_REPS.map((n) => {
      const w = f.at(m, n);
      return { reps: n, weight: fmt(w), percent: formatFixed((w / m) * 100, 0) };
    }),
    byPercent: TABLE_PERCENTS.map((P) => ({
      percent: P,
      weight: fmt((m * P) / 100),
      reps: P === 100 ? 1 : Math.max(1, Math.floor(f.repsAt(P))),
    })),
    chart: Array.from({ length: 20 }, (_, i) => {
      const w = f.at(m, i + 1);
      return { reps: i + 1, value: w, label: fmt(w) };
    }),
  };
}
