// BMI Calculator engine — matches calculator.net/bmi-calculator.html (a GET
// form, decoded with live probes; see scripts/bmi-calculator.test.js).
//
// Height and weight each take their own unit (cm, m, in, ft, ft + in, m + cm;
// kg, lb, st). Everything is computed in metric: inches × 0.0254 m, pounds ×
// 0.453592 kg, stones = 14 lb. Weights in lb or st are rounded and compared in
// pounds (as the reference does in US units), in kg otherwise.
// BMI = kg / m², shown to one decimal, and that ROUNDED value drives every
// later step (category, gauge needle, BMI Prime, child percentile).
//
// Adults (age > 20): WHO categories with inclusive upper bounds (16 → Severe
// thinness, 25 → Normal, 40 → Obese Class II). Healthy weight = 18.5 and 25
// × height², each rounded to 0.1 in the display unit; the "Gain / Lose" line
// appears only when the weight is at least 0.5 (kg or lbs) outside that
// rounded range. The gauge is drawn only for 13 < BMI < 43, needle at
// (BMI − 13) × 6 degrees.
//
// Children (ages 2–20): CDC 2000 BMI-for-age, weight-for-age and
// stature-for-age charts at age × 12 months, linearly interpolated between
// the table's rows. A percentile is read by straight-line interpolation
// between the published curves (P3, P5, P10, P25, P50, P75, [P85,] P90,
// P95, P97) and extended past the end curves with the end segments, so it can
// be negative or above 100 (the reference shows "-6%" and "110%"). A BMI at or
// above the 95th percentile uses the CDC 2022 extended BMI-for-age method
// instead: 90 + 10·Φ((BMI − P95) / σ), σ depending on sex and age. The
// percentile is whole below 99, one decimal below 99.9, two decimals above;
// the gauge is drawn only for 0 < percentile < 100 (none at "0%" or "100%").
// Categories: < 5 Underweight, ≤ 85 Healthy weight, ≤ 95 At risk of
// overweight, else Overweight; the healthy range is P5 – P85.

import { clean, num } from "./marginCalculatorEngine.js";
import { BMI_FOR_AGE, WEIGHT_FOR_AGE, STATURE_FOR_AGE } from "../data/cdcGrowthCharts.js";

export const BMI_DEFAULTS = {
  age: "25",
  sex: "male",
  heightUnit: "ft-in",
  height: "5",
  height2: "10",
  weightUnit: "lb",
  weight: "160",
};

// Height and weight can each be entered in any of these units. Two-part
// units (feet + inches, meters + centimeters) use a second box.
export const HEIGHT_UNITS = [
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

const INCH_M = 0.0254;
const POUND_KG = 0.453592; // the reference's factor (not the exact 0.45359237) — confirmed live
const STONE_LB = 14;

const ERRORS = {
  age: "Please provide an age between 2 and 120.",
  height: "Please provide positive height value.",
  weight: "Please provide positive weight value.",
};

// z-scores of the curves the CDC publishes.
const Z = { 3: -1.880793608, 5: -1.644853627, 10: -1.281551566, 25: -0.67448975, 50: 0, 75: 0.67448975, 85: 1.036433389, 90: 1.281551566, 95: 1.644853627, 97: 1.880793608 };
const BMI_CURVES = [3, 5, 10, 25, 50, 75, 85, 90, 95, 97];
const CURVES = [3, 5, 10, 25, 50, 75, 90, 95, 97];

/** Half-up rounding after 15-digit pre-rounding (as PHP's round()). */
export function roundTo(value, decimals) {
  const pre = Number(Math.abs(value).toPrecision(15));
  const scaled = Math.round(Number((pre * 10 ** decimals).toPrecision(15)));
  return (Math.sign(value) * scaled) / 10 ** decimals;
}

/** Rounded, trailing zeros dropped: 23.0 → "23", 0.80 → "0.8". A small
 * negative keeps its sign, as the reference prints it ("-0%"). */
function trim(value, decimals) {
  const rounded = roundTo(value, decimals);
  return rounded === 0 && value < 0 ? "-0" : String(rounded + 0);
}

/** Standard normal CDF (erfc of Numerical Recipes, error < 1.2e-7). */
function normalCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.5 * x);
  const erfc = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
    t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return z >= 0 ? 1 - erfc / 2 : erfc / 2;
}

/** The published percentile curves of one table at an age in months. */
function curvesAt(table, sex, months, percentiles) {
  const rows = table[sex];
  let i = 0;
  while (i + 4 < rows.length - 4 && rows[i + 4] <= months) i += 4;
  const t = (months - rows[i]) / (rows[i + 4] - rows[i]);
  const curve = (j, p) => {
    const [L, M, S] = [rows[j + 1], rows[j + 2], rows[j + 3]];
    return M * Math.pow(1 + L * S * Z[p], 1 / L);
  };
  return percentiles.map((p) => curve(i, p) + (curve(i + 4, p) - curve(i, p)) * t);
}

/** Straight-line percentile between (and beyond) the published curves. */
function percentileOf(value, curves, percentiles) {
  let i = 0;
  while (i < curves.length - 2 && value > curves[i + 1]) i++;
  return percentiles[i] + ((percentiles[i + 1] - percentiles[i]) * (value - curves[i])) / (curves[i + 1] - curves[i]);
}

/** CDC 2022 extended BMI-for-age σ (age in years). */
function extendedSigma(sex, years) {
  return sex === "male"
    ? 0.3728 + 0.5196 * years - 0.0091 * years * years
    : 0.8334 + 0.3712 * years - 0.0011 * years * years;
}

function formatPercentile(p) {
  return p >= 99.9 ? trim(p, 2) : p >= 99 ? trim(p, 1) : trim(p, 0);
}

export function adultCategory(bmi) {
  if (bmi <= 16) return ["Severe thinness", "#b90606"];
  if (bmi <= 17) return ["Moderate thinness", "#ca5353"];
  if (bmi <= 18.5) return ["Mild thinness", "#ffe400"];
  if (bmi <= 25) return ["Normal", "#008000"];
  if (bmi <= 30) return ["Overweight", "#ffe400"];
  if (bmi <= 35) return ["Obese Class I", "#ca5353"];
  if (bmi <= 40) return ["Obese Class II", "#b90606"];
  return ["Obese Class III", "#8a0101"];
}

function childCategory(p) {
  if (p < 5) return ["Underweight", "#e49b2a"];
  if (p <= 85) return ["Healthy weight", "#008137"];
  if (p <= 95) return ["At risk of overweight", "#d8c419"];
  return ["Overweight", "#b90606"];
}

/** A finite number ≥ 0 from a feet/inches box; blank counts as 0. */
function lengthPart(text) {
  if (text === "") return 0;
  const n = num(text);
  return n >= 0 ? n : NaN;
}

/** Height in meters from the two boxes, or NaN. Two-part units treat a blank box as 0. */
export function heightToMeters(unit, a, b) {
  const one = num(clean(a));
  switch (unit) {
    case "cm": return one / 100;
    case "m": return one;
    case "in": return one * INCH_M;
    case "ft": return one * 12 * INCH_M;
    case "ft-in": return (lengthPart(clean(a)) * 12 + lengthPart(clean(b))) * INCH_M;
    case "m-cm": return lengthPart(clean(a)) + lengthPart(clean(b)) / 100;
    default: return NaN;
  }
}

/** Weight in pounds (lb or st boxes) — the reference works US weights in pounds. */
const toPounds = (unit, value) => (unit === "st" ? value * STONE_LB : value);

/** Weight in kilograms from its box, or NaN. */
export function weightToKg(unit, text) {
  const value = num(clean(text));
  return unit === "kg" ? value : toPounds(unit, value) * POUND_KG;
}

const tidy = (value, decimals) => (Number.isFinite(value) && value > 0 ? String(roundTo(value, decimals)) : "");

/** The boxes' text for a height in meters, in another unit (used when the unit is switched). */
export function metersToHeight(unit, m) {
  if (!(m > 0)) return ["", ""];
  switch (unit) {
    case "cm": return [tidy(m * 100, 1), ""];
    case "m": return [tidy(m, 3), ""];
    case "in": return [tidy(m / INCH_M, 1), ""];
    case "ft": return [tidy(m / INCH_M / 12, 2), ""];
    case "ft-in": {
      let inches = roundTo(m / INCH_M, 1);
      const feet = Math.floor(inches / 12);
      inches = roundTo(inches - feet * 12, 1);
      return [String(feet), String(inches)];
    }
    case "m-cm": {
      let cm = roundTo(m * 100, 1);
      const whole = Math.floor(cm / 100);
      cm = roundTo(cm - whole * 100, 1);
      return [String(whole), String(cm)];
    }
    default: return ["", ""];
  }
}

/** The box's text for a weight in kilograms, in another unit. */
export function kgToWeight(unit, kg) {
  if (unit === "kg") return tidy(kg, 1);
  const lb = kg / POUND_KG;
  return unit === "st" ? tidy(lb / STONE_LB, 2) : tidy(lb, 1);
}

/** "9 st 3.5 lb" for a number of pounds. */
function stoneText(lb) {
  const total = roundTo(lb, 1);
  let stones = Math.floor(total / STONE_LB);
  let rest = roundTo(total - stones * STONE_LB, 1);
  if (rest >= STONE_LB) { stones += 1; rest = 0; }
  if (!stones) return `${rest} lb`;
  return rest ? `${stones} st ${rest} lb` : `${stones} st`;
}

/** The healthy BMI range for a child (CDC 5th – 85th percentile at age × 12
 * months), each end rounded to 0.1 as the reference uses it. Also used by the
 * Ideal Weight Calculator. */
export function childHealthyBmiRange(sex, age) {
  const curves = curvesAt(BMI_FOR_AGE, sex === "female" ? "female" : "male", age * 12, BMI_CURVES);
  return [roundTo(curves[BMI_CURVES.indexOf(5)], 1), roundTo(curves[BMI_CURVES.indexOf(85)], 1)];
}

/**
 * @param {{ age, sex, heightUnit, height, height2, weightUnit, weight }} input  (strings; sex "male" | "female";
 *   heightUnit one of HEIGHT_UNITS, weightUnit one of WEIGHT_UNITS; height2 is the inches / cm box of a two-part unit)
 * @returns {{ errors: string[] } | object}  See the return statement for the result shape.
 */
export function calculateBmi(input) {
  const sex = input.sex === "female" ? "female" : "male";
  const age = num(clean(input.age));
  const weightUnit = ["kg", "lb", "st"].includes(input.weightUnit) ? input.weightUnit : "kg";
  const heightM = heightToMeters(input.heightUnit, input.height, input.height2);
  const kgIn = weightToKg(weightUnit, input.weight);
  // Weights are compared and rounded in kilograms, or in pounds for lb / st
  // (as the reference does for US units); stones are only a display format.
  const metric = weightUnit === "kg";
  const weight = metric ? kgIn : toPounds(weightUnit, num(clean(input.weight)));

  const errors = [];
  if (!(age >= 2 && age <= 120)) errors.push(ERRORS.age);
  if (!(heightM > 0) || !Number.isFinite(heightM)) errors.push(ERRORS.height);
  if (!(weight > 0) || !Number.isFinite(weight)) errors.push(ERRORS.weight);
  if (errors.length) return { errors };

  const kg = kgIn;
  const h2 = heightM * heightM;
  const bmi = roundTo(kg / h2, 1);
  const toDisplay = (massKg) => (metric ? massKg : massKg / POUND_KG);
  const massText = (value) => (weightUnit === "st" ? stoneText(value) : `${value} ${metric ? "kg" : "lbs"}`);
  const ponderal = trim(kg / (h2 * heightM), 1);

  // Healthy BMI range → healthy weight (rounded to 0.1) → gain/lose line.
  const weightRange = (lowBmi, highBmi) => {
    const lo = roundTo(toDisplay(lowBmi * h2), 1);
    const hi = roundTo(toDisplay(highBmi * h2), 1);
    let change = null;
    const amount = (diff) => (weightUnit === "st" ? stoneText(diff) : `${roundTo(diff, 1).toFixed(1)} ${metric ? "kg" : "lbs"}`);
    if (lo - weight >= 0.5) change = { verb: "Gain", amount: amount(lo - weight), target: String(lowBmi) };
    else if (weight - hi >= 0.5) change = { verb: "Lose", amount: amount(weight - hi), target: String(highBmi) };
    return { healthyWeight: { lo: massText(lo), hi: massText(hi) }, change };
  };

  if (age > 20) {
    const [category, color] = adultCategory(bmi);
    return {
      child: false,
      bmi: String(bmi),
      category,
      color,
      percentile: null,
      gauge: bmi > 13 && bmi < 43 ? { kind: "adult", angle: roundTo((bmi - 13) * 6, 1) } : null,
      healthyBmi: { lo: "18.5", hi: "25" },
      ...weightRange(18.5, 25),
      prime: trim(bmi / 25, 2),
      ponderal,
    };
  }

  const months = age * 12;
  const bmiCurves = curvesAt(BMI_FOR_AGE, sex, months, BMI_CURVES);
  const p95 = bmiCurves[BMI_CURVES.indexOf(95)];
  const raw = bmi >= p95
    ? 90 + 10 * normalCdf((bmi - p95) / extendedSigma(sex, age))
    : percentileOf(bmi, bmiCurves, BMI_CURVES);
  const percentile = formatPercentile(raw);
  const shown = Number(percentile);
  const [category, color] = childCategory(shown);
  const lowBmi = roundTo(bmiCurves[BMI_CURVES.indexOf(5)], 1);
  const highBmi = roundTo(bmiCurves[BMI_CURVES.indexOf(85)], 1);
  const weightPct = percentileOf(kg, curvesAt(WEIGHT_FOR_AGE, sex, months, CURVES), CURVES);
  const heightPct = percentileOf(heightM * 100, curvesAt(STATURE_FOR_AGE, sex, months, CURVES), CURVES);

  return {
    child: true,
    bmi: String(bmi),
    category,
    color,
    percentile,
    gauge: shown > 0 && shown < 100 ? { kind: "child", angle: roundTo(shown * 1.8, 1) } : null,
    weightPercentile: trim(weightPct, 0),
    heightPercentile: trim(heightPct, 0),
    healthyBmi: { lo: String(lowBmi), hi: String(highBmi) },
    ...weightRange(lowBmi, highBmi),
    prime: null,
    ponderal,
  };
}
