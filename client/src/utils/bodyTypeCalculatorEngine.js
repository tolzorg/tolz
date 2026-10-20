// Body Type Calculator engine — matches calculator.net/body-type-calculator.html (a GET form computed
// on its server, decoded with live probes; see scripts/body-type-calculator.test.js).
//
// The seven female body shapes of Lee, Istook, Nam & Park (2007), each checked in this order with every size
// in inches (cm ÷ 2.54); b = bust, w = waist, hh = high hip, h = hip:
//   Hourglass          b − h ≤ 1 and h − b < 3.6 and (b − w ≥ 9 or h − w ≥ 10)
//   Bottom hourglass   3.6 ≤ h − b < 10 and h − w ≥ 9 and hh / w < 1.193
//   Top hourglass      1 < b − h < 10 and b − w ≥ 9
//   Spoon              h − b > 2 and h − w ≥ 7 and hh / w ≥ 1.193
//   Triangle           h − b ≥ 3.6 and h − w < 9
//   Inverted triangle  b − h ≥ 3.6 and b − w < 9
//   Rectangle          h − b < 3.6 and b − h < 3.6 and b − w < 9 and h − w < 10
// Every shape that fits is listed, joined by " and " (only Hourglass + Spoon, Spoon + Rectangle and
// Spoon + Triangle can overlap); none at all is "unable to classify". Waist-hip ratio = w / h to two decimals (trailing zeros dropped,
// "1" not "1.00"); a ratio above 0.85 (as rounded) adds the WHO abdominal-obesity note.
// Validation (reference wording and order): "Please provide a positive {bust, waist, hip, high hip} size value."

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const SIZE_UNITS = [
  { value: "cm", label: "cm" },
  { value: "in", label: "inches" },
];

// The reference's example (all in cm).
export const BODY_TYPE_DEFAULTS = {
  bust: "90", bustUnit: "cm", waist: "60", waistUnit: "cm",
  highHip: "80", highHipUnit: "cm", hip: "90", hipUnit: "cm",
};

export const SHAPES = ["Hourglass", "Bottom hourglass", "Top hourglass", "Spoon", "Triangle", "Inverted triangle", "Rectangle"];

const inches = (text, unit) => {
  const v = num(clean(text));
  return unit === "in" ? v : v / 2.54;
};

/** Every shape that fits sizes in inches, in the reference's order (possibly none). */
export function classifyShapes(b, w, hh, h) {
  const tests = [
    b - h <= 1 && h - b < 3.6 && (b - w >= 9 || h - w >= 10),
    h - b >= 3.6 && h - b < 10 && h - w >= 9 && hh / w < 1.193,
    b - h > 1 && b - h < 10 && b - w >= 9,
    h - b > 2 && h - w >= 7 && hh / w >= 1.193,
    h - b >= 3.6 && h - w < 9,
    b - h >= 3.6 && b - w < 9,
    h - b < 3.6 && b - h < 3.6 && b - w < 9 && h - w < 10,
  ];
  return SHAPES.filter((_, i) => tests[i]);
}

/**
 * input: { bust, bustUnit, waist, waistUnit, highHip, highHipUnit, hip, hipUnit }
 * → { errors } | { shapes: string[], shape: "A" | "A and B" | null, whr: number, highRisk: boolean }
 */
export function calculateBodyType(input) {
  const b = inches(input.bust, input.bustUnit);
  const w = inches(input.waist, input.waistUnit);
  const hh = inches(input.highHip, input.highHipUnit);
  const h = inches(input.hip, input.hipUnit);
  const errors = [];
  if (!(b > 0)) errors.push("Please provide a positive bust size value.");
  if (!(w > 0)) errors.push("Please provide a positive waist size value.");
  if (!(h > 0)) errors.push("Please provide a positive hip size value.");
  if (!(hh > 0)) errors.push("Please provide a positive high hip size value.");
  if (errors.length) return { errors };
  const whr = roundTo(w / h, 2);
  const shapes = classifyShapes(b, w, hh, h);
  return { shapes, shape: shapes.length ? shapes.join(" and ") : null, whr, highRisk: whr > 0.85 };
}

export const formatWhr = (x) => String(x);
