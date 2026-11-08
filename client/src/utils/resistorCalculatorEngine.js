// Resistor Calculator engine — matches calculator.net/resistor-calculator.html (it calculates on its server; values,
// formats and messages were read off its responses, see scripts/resistor-calculator.test.js). Four calculators:
//   color code:  value = significant figures × multiplier, shown in Ω / kΩ / MΩ / GΩ; tolerance (none on 3 bands = ±20% M);
//                6 bands add the temperature coefficient
//   parallel:    1 / (1/R1 + 1/R2 + …)   (0 if any resistor is 0)
//   series:      R1 + R2 + …             (whole numbers add exactly, as the reference's integer arithmetic does)
//   conductor:   R = L / (σ × π (d/2)²)
// Numbers print like the reference (PHP): 14 significant digits, exponent form ("3.0E-7", "2.0E+20") below 1e-4 or
// from 1e15.
//
// The reference takes a mile as 1,609.35 m (kept). Deviations (flagged to the user): a diameter in millimeters is
// converted as millimeters (the reference converts it as centimeters, 10× too thick, so 100× too little resistance), and
// a diameter of 0 shows the diameter message (the reference shows nothing at all).

export const COLORS = [
  { value: "black", label: "Black", hex: "#000000", digit: 0, mult: 0, tc: [250, "U"] },
  { value: "brown", label: "Brown", hex: "#8b4513", digit: 1, mult: 1, tol: [1, "F"], tc: [100, "S"] },
  { value: "red", label: "Red", hex: "#e60000", digit: 2, mult: 2, tol: [2, "G"], tc: [50, "R"] },
  { value: "orange", label: "Orange", hex: "#ff8c00", digit: 3, mult: 3, tol: [0.05, "W"], tc: [15, "P"] },
  { value: "yellow", label: "Yellow", hex: "#ffe600", digit: 4, mult: 4, tol: [0.02, "P"], tc: [25, "Q"] },
  { value: "green", label: "Green", hex: "#7cbb2e", digit: 5, mult: 5, tol: [0.5, "D"], tc: [20, "Z"] },
  { value: "blue", label: "Blue", hex: "#4a86e8", digit: 6, mult: 6, tol: [0.25, "C"], tc: [10, "Z"] },
  { value: "violet", label: "Violet", hex: "#8b00c9", digit: 7, mult: 7, tol: [0.1, "B"], tc: [5, "M"] },
  { value: "grey", label: "Grey", hex: "#9a9a9a", digit: 8, mult: 8, tol: [0.01, "L"], tc: [1, "K"] },
  { value: "white", label: "White", hex: "#ffffff", digit: 9, mult: 9 },
  { value: "gold", label: "Gold", hex: "#d4af37", mult: -1, tol: [5, "J"] },
  { value: "silver", label: "Silver", hex: "#c0c0c0", mult: -2, tol: [10, "K"] },
];
const byValue = Object.fromEntries(COLORS.map((c) => [c.value, c]));
/** Which colors each band offers (the reference's radio buttons). */
export const BAND_COLORS = {
  digit: COLORS.filter((c) => c.digit !== undefined).map((c) => c.value),
  multiplier: COLORS.map((c) => c.value),
  tolerance: COLORS.filter((c) => c.tol).map((c) => c.value),
  tc: COLORS.filter((c) => c.tc).map((c) => c.value),
};
export const BAND_COUNTS = [3, 4, 5, 6];
export const DEFAULT_BANDS = { band1: "green", band2: "red", band3: "blue", multiplier: "blue", tolerance: "gold", tc: "brown" };
export const NO_TOLERANCE = [20, "M"];

const PREFIXES = [[9, "GΩ"], [6, "MΩ"], [3, "kΩ"], [0, "Ω"]];
/** digits × 10^exp as an exact decimal string ("52", "0.01", "10.5"). */
function decimalString(digits, exp) {
  if (digits === 0) return "0";
  if (exp >= 0) return String(digits) + "0".repeat(exp);
  const s = String(digits).padStart(-exp + 1, "0");
  return `${s.slice(0, s.length + exp)}.${s.slice(s.length + exp)}`.replace(/\.?0+$/, "");
}
const trim = (x) => String(Number(x.toPrecision(6)));

/**
 * @param {{ bands: 3|4|5|6, band1, band2, band3, multiplier, tolerance, tc }} input  color values
 * @returns {{ ohms: number, value: string, unit: string, text: string, tolerance: [number, string], tc: [number, string]|null,
 *   min: string, max: string, colors: string[] }}  `colors`: the bands left to right.
 */
export function resistorFromColors({ bands, band1, band2, band3, multiplier, tolerance, tc }) {
  const figures = bands >= 5 ? [band1, band2, band3] : [band1, band2];
  const digits = Number(figures.map((c) => byValue[c].digit).join(""));
  const exp = byValue[multiplier].mult;
  const ohms = digits * 10 ** exp;
  const magnitude = digits === 0 ? 0 : String(digits).length - 1 + exp;
  const [p, unit] = PREFIXES.find(([e]) => magnitude >= e) || [0, "Ω"];
  const value = decimalString(digits, exp - p);
  const tol = bands === 3 ? NO_TOLERANCE : byValue[tolerance].tol;
  const coefficient = bands === 6 ? byValue[tc].tc : null;
  const scaled = ohms / 10 ** p;
  const colors = [...figures, multiplier, ...(bands >= 4 ? [tolerance] : []), ...(bands === 6 ? [tc] : [])];
  return {
    ohms, value, unit, tolerance: tol, tc: coefficient, colors,
    text: `${value} ${unit} ±${tol[0]}% (${tol[1]})${coefficient ? ` ${coefficient[0]}ppm/K (${coefficient[1]})` : ""}`,
    min: `${trim(scaled * (1 - tol[0] / 100))} ${unit}`, max: `${trim(scaled * (1 + tol[0] / 100))} ${unit}`,
  };
}

/** A float printed the way the reference (PHP, precision 14) prints it. */
export function phpFloat(x) {
  if (x === 0) return "0";
  if (!Number.isFinite(x)) return "INF";
  const [m, e] = x.toExponential(13).split("e");
  const exp = Number(e);
  if (exp < -4 || exp >= 15) {
    let mant = String(Number(m));
    if (!mant.includes(".")) mant += ".0";
    return `${mant}E${exp < 0 ? "-" : "+"}${Math.abs(exp)}`;
  }
  return String(Number(x.toPrecision(14)));
}

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const INT_MAX = 9223372036854775807n;
/** The reference's list parsing: separated by commas or new lines, blanks skipped. */
function parseList(text) {
  if (String(text ?? "").trim() === "") return { errors: ["Please provide some numbers."] };
  const tokens = String(text).split(/,|\r?\n/).map((t) => t.trim()).filter((t) => t !== "");
  if (tokens.length < 2) return { errors: ["Please provide at least two numbers."] };
  if (tokens.some((t) => !NUMERIC.test(t) || Number(t) < 0)) return { errors: ["Please provide positive numbers only."] };
  return { tokens, values: tokens.map(Number) };
}

/** @returns {{ errors: string[] } | { total: number, text: string, count: number }} */
export function parallelResistance(text) {
  const p = parseList(text);
  if (p.errors) return p;
  const total = p.values.some((v) => v === 0) ? 0 : 1 / p.values.reduce((s, v) => s + 1 / v, 0);
  return { total, text: phpFloat(total), count: p.values.length };
}

/** @returns {{ errors: string[] } | { total: number, text: string, count: number }} */
export function seriesResistance(text) {
  const p = parseList(text);
  if (p.errors) return p;
  if (p.tokens.every((t) => /^\+?\d+$/.test(t))) {
    const sum = p.tokens.reduce((s, t) => s + BigInt(t.replace("+", "")), 0n);
    if (sum <= INT_MAX) return { total: Number(sum), text: sum.toString(), count: p.values.length };
  }
  const total = p.values.reduce((s, v) => s + v, 0);
  return { total, text: phpFloat(total), count: p.values.length };
}

export const LENGTH_UNITS = [
  { value: "foot", label: "feet", m: 0.3048 }, { value: "yard", label: "yards", m: 0.9144 }, { value: "inch", label: "inches", m: 0.0254 },
  { value: "mile", label: "miles", m: 1609.35 }, { value: "meter", label: "meters", m: 1 }, { value: "kilometer", label: "kilometers", m: 1000 },
  { value: "centimeter", label: "centimeters", m: 0.01 },
];
export const DIAMETER_UNITS = [
  { value: "inch", label: "inches", m: 0.0254 }, { value: "foot", label: "feet", m: 0.3048 }, { value: "yard", label: "yards", m: 0.9144 },
  { value: "millimeter", label: "millimeters", m: 0.001 }, { value: "centimeter", label: "centimeters", m: 0.01 }, { value: "meter", label: "meters", m: 1 },
];
export const MATERIALS = [
  { value: "63000000", label: "Silver" }, { value: "59600000", label: "Copper" }, { value: "58000000", label: "Annealed Copper" },
  { value: "45200000", label: "Gold" }, { value: "37800000", label: "Aluminium" },
];

/**
 * @param {{ length: string, lengthUnit, diameter: string, diameterUnit, conductivity: string }} input
 * @returns {{ missing: string[] } | { errors: string[] } | { ohms: number, text: string }}
 */
export function conductorResistance({ length, lengthUnit, diameter, diameterUnit, conductivity }) {
  const raw = { length, diameter, conductivity };
  const missing = Object.keys(raw).filter((k) => String(raw[k] ?? "").trim() === "");
  if (missing.length) return { missing };
  const v = Object.fromEntries(Object.entries(raw).map(([k, t]) => [k, NUMERIC.test(String(t).trim()) ? Number(t) : NaN]));
  const errors = [];
  if (!(v.length >= 0)) errors.push("Please provide a positive numerical length value.");
  if (!(v.diameter > 0)) errors.push("Please provide a positive numerical diameter value.");
  if (!(v.conductivity > 0)) errors.push("Please provide a positive numerical conductivity value.");
  if (errors.length) return { errors };
  const L = v.length * LENGTH_UNITS.find((u) => u.value === lengthUnit).m;
  const d = v.diameter * DIAMETER_UNITS.find((u) => u.value === diameterUnit).m;
  const ohms = L / (v.conductivity * Math.PI * (d / 2) ** 2);
  return { ohms, text: phpFloat(ohms) };
}
