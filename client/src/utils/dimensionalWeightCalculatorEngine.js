// Dimensional Weight Calculator engine — matches omnicalculator.com/other/dimensional-weight (its calculator definition
// was read from the page; behaviour checked live, see scripts/dimensional-weight-calculator.test.js).
//
// Dimensional weight = ceil(length × width × height / divisor), with the sides in inches (in/lb) or centimeters
// (cm/kg) whatever unit each box uses:
//   in/lb: UPS 139 (daily rates) or 166 (retail rates), USPS 166, FedEx 139 → pounds
//   cm/kg: UPS 5000, FedEx 5000 → kilograms
// You are charged for the dimensional weight when the actual weight is lower, otherwise for the actual weight
// (in lb / kg, as typed, Omni-rounded). Notes as on the reference: > 70 kg (UPS extra, FedEx limit), a side > 274 cm
// (UPS extra); > 150 lb (UPS extra, FedEx limit), > 70 lb (USPS won't ship), a side > 108 in (UPS extra).
// Exact decimals throughout (unit factors are the reference's ratios).

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign, sub } from "./semesterGradeCalculatorEngine.js";
import { LENGTH_UNITS, WEIGHT_UNITS, unitToSi, unitFromSi } from "./cbmCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const ratio = (n, d = "1") => [dec(n), dec(d)];
const only = (list, values) => values.map((v) => list.find((u) => u.value === v));
const LB_OZ = { value: "lboz", label: "pounds / ounces (lb / oz)", short: "lb / oz", parts: ["lb", "oz"], f: ratio("45359237", "1600000000"), big: ratio("45359237", "100000000"), per: 16 };
const MG = { value: "mg", label: "milligrams (mg)", short: "mg", f: ratio("1", "1000000") };

export const SYSTEMS = [
  { value: "imperial", label: "in/lb" },
  { value: "metric", label: "cm/kg" },
];
export const UNITS = {
  imperial: { length: only(LENGTH_UNITS, ["in", "ft", "ftin"]), weight: [...only(WEIGHT_UNITS, ["oz", "lb"]), LB_OZ], lengthUnit: "in", weightUnit: "lb" },
  metric: { length: only(LENGTH_UNITS, ["mm", "cm", "m", "mcm"]), weight: [MG, ...only(WEIGHT_UNITS, ["g", "kg"]), LB_OZ], lengthUnit: "cm", weightUnit: "kg" },
};
/** Units for showing the dimensional weights. */
export const RESULT_UNITS = {
  imperial: [...only(WEIGHT_UNITS, ["oz", "lb"]), LB_OZ],
  metric: [MG, ...only(WEIGHT_UNITS, ["g", "kg"])],
};
export const RATES = [
  { value: "139", label: "Daily Rates" },
  { value: "166", label: "Retail rates" },
];
export const FIELD_KEYS = ["length", "width", "height", "weight"];
const MESSAGES = {
  length: "Please enter a positive value for the length.",
  width: "Please enter a positive value for the width.",
  height: "Please enter a positive value for the height.",
  weight: "Please enter a positive value for the actual weight.",
};
export const FIELD_LABELS = { length: "Length", width: "Width", height: "Height", weight: "Actual weight" };

const INCH = dec("0.0254");
const POUND = dec("0.45359237");
const ceilDec = (a) => {
  const scale = 10n ** BigInt(a.s);
  const q = a.n / scale;
  return a.n % scale === 0n || a.n < 0n ? q : q + 1n;
};

/**
 * @param {{ system: "imperial"|"metric", rate: string, fields: Record<string, { unit: string, texts: string[] }> }} input
 * @returns {{ missing: string[] } | { errors: string[] } | { carriers: { name, divisor, dim: bigint, dimKg: object,
 *   charged: string, byDim: boolean }[], unit: "lb"|"kg", notes: string[] }}
 */
export function calculateDimensionalWeight({ system, rate, fields }) {
  const u = UNITS[system];
  const si = {};
  const missing = [];
  const errors = [];
  for (const k of FIELD_KEYS) {
    const v = unitToSi(k === "weight" ? u.weight : u.length, fields[k].unit, fields[k].texts);
    if (v === null) missing.push(k);
    else if (v === false || sign(v) <= 0) errors.push(MESSAGES[k]);
    else si[k] = v;
  }
  if (missing.length) return { missing };
  if (errors.length) return { errors };

  const imperial = system === "imperial";
  const side = (k) => (imperial ? div(si[k], INCH) : mul(si[k], dec("100"))); // inches or centimeters
  const sides = ["length", "width", "height"].map(side);
  const volume = mul(mul(sides[0], sides[1]), sides[2]);
  const actual = imperial ? div(si.weight, POUND) : si.weight; // pounds or kilograms
  const list = imperial
    ? [["UPS", rate], ["USPS", "166"], ["FedEx", "139"]]
    : [["UPS", "5000"], ["FedEx", "5000"]];
  const carriers = list.map(([name, divisor]) => {
    const dim = ceilDec(div(volume, dec(divisor)));
    const dimDec = { n: dim, s: 0 };
    const byDim = sign(sub(actual, dimDec)) < 0;
    return {
      name, divisor, dim, byDim,
      dimSi: imperial ? mul(dimDec, POUND) : dimDec, // for showing in other units
      charged: byDim ? dim.toString() : formatDecimal(actual),
    };
  });

  const over = (limit) => sides.some((s) => sign(sub(s, dec(limit))) > 0);
  const heavier = (limit) => sign(sub(actual, dec(limit))) > 0;
  const notes = imperial
    ? [
      ...(heavier("150") ? ["For packages heavier than 150 pounds, UPS may charge you extra. With FedEx, you can ship packages weighing up to 150 pounds."] : []),
      ...(heavier("70") ? ["USPS will not ship packages heavier than 70 pounds."] : []),
      ...(over("108") ? ["UPS may charge you extra if the longest edge of your package exceeds 108 inches."] : []),
    ]
    : [
      ...(heavier("70") ? ["For packages heavier than 70 kg, UPS may charge you extra. With FedEx, you can ship packages weighing up to 70 kg."] : []),
      ...(over("274") ? ["UPS may charge you extra if the longest edge of your package exceeds 274 cm."] : []),
    ];
  return { carriers, unit: imperial ? "lbs" : "kg", notes };
}

/** A carrier's dimensional weight shown in a result unit (e.g. 58 lb → "928" oz). */
export const dimIn = (system, unit, carrier) => unitFromSi(RESULT_UNITS[system], unit, carrier.dimSi);
