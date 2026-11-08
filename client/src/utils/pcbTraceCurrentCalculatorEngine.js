// PCB Trace Current Calculator engine — matches omnicalculator.com/other/pcb-trace-current (its calculator definition
// was read from the page; behaviour checked against its screenshots, see scripts/pcb-trace-current-calculator.test.js).
// IPC-2221, the PCB Trace Width Calculator's formulas run the other way:
//   cross section A = trace width × trace thickness          (in mil², i.e. thickness in oz/ft² × 1.378 × width in mil)
//   maximum current I = k × ΔT^0.44 × A^0.725,   k = 0.024 internal, 0.048 external
//   trace temperature = ΔT + ambient;  R = 1.7e-6 Ω·cm × length / A [cm²] × (1 + 0.0039 × (T − 25));  V = I × R;  P = R × I²
// Like the reference, the maximum current can also be typed and any one of width, thickness, temperature rise and
// current left blank to be solved (with all four typed, the three typed most recently are kept).
//
// Deviation (flagged to the user): a temperature rise in °F converts × 5/9 and in K equals °C (the reference converts
// it as an absolute temperature, as in its Trace Width calculator).

import {
  TRACE_TYPES, CURRENT_UNITS, LENGTH_UNITS, AREA_UNITS, TEMP_UNITS, RESISTANCE_UNITS, VOLTAGE_UNITS, POWER_UNITS,
  fmt, toCelsius, fromCelsius, factorOf,
} from "./pcbTraceWidthCalculatorEngine.js";
import { decimalOf } from "./ieltsScoreCalculatorEngine.js";

export { TRACE_TYPES };
const POSITIVE = "Please ensure a positive value.";
const ABS_ZERO = "Temperature must be greater than -273.15 °C (-459.7 °F, 0 K).";

export const INPUTS = {
  width: { label: "Trace width", units: LENGTH_UNITS, unit: "mm" },
  thickness: { label: "Trace thickness", units: LENGTH_UNITS, unit: "mm" },
  rise: { label: "Max. desired temperature rise", units: TEMP_UNITS, unit: "C", delta: true },
  ambient: { label: "Ambient temperature", units: TEMP_UNITS, unit: "C" },
  length: { label: "Length", units: LENGTH_UNITS, unit: "cm" },
  current: { label: "Maximum current", units: CURRENT_UNITS, unit: "A" },
};
export const SOLVABLE = ["width", "thickness", "rise", "current"];
export const OUTPUT_UNITS = { current: CURRENT_UNITS, crossSection: AREA_UNITS, traceTemperature: TEMP_UNITS, resistance: RESISTANCE_UNITS, voltageDrop: VOLTAGE_UNITS, power: POWER_UNITS, width: LENGTH_UNITS, thickness: LENGTH_UNITS, rise: TEMP_UNITS };
export const DEFAULT_OUTPUT_UNITS = { current: "A", crossSection: "mm2", traceTemperature: "C", resistance: "ohm", voltageDrop: "V", power: "W", width: "mm", thickness: "mm", rise: "C" };

const num = (t) => { const s = String(t ?? "").replace(/,/g, "").trim(); if (s === "") return null; const d = decimalOf(s); return d ? Number(`${d.n}e-${d.s}`) : NaN; };
const MIL2 = 6.4516e-10; // m² per mil²
/** Cross section in mil² exactly as the reference's equation: thickness [oz/ft²] × width [mil] × 1.378 (1 oz/ft² = 35 µm,
 * so this is 0.003% above width × thickness — it decides the last digit, e.g. 108.84 A, 0.000017636 Ω). */
const areaMil2 = (width, thickness) => (thickness / 3.5e-5) * (width / 2.54e-5) * 1.378;
const fromArea = (aMil2) => aMil2 / 1.378; // = thickness [oz/ft²] × width [mil]

/** Converts a box's text when its unit changes (a temperature rise as a difference). */
export function convertText(key, from, to, text) {
  const x = num(text);
  if (x === null || Number.isNaN(x)) return text;
  const def = INPUTS[key];
  const y = def.units === TEMP_UNITS ? fromCelsius(toCelsius(x, from, def.delta), to, def.delta) : (x * factorOf(def.units, from)) / factorOf(def.units, to);
  return fmt(y);
}

/** Shows a value (SI, °C, or a °C difference for the rise) in an output unit. */
export function showIn(key, unit, value) {
  if (key === "traceTemperature") return fmt(fromCelsius(value, unit));
  if (key === "rise") return fmt(fromCelsius(value, unit, true));
  return fmt(value / factorOf(OUTPUT_UNITS[key], unit));
}

/**
 * @param {{ type: string, values: Record<string, string>, units: Record<string, string>, order: string[] }} input
 *   `order`: the typed boxes among SOLVABLE, least recent first (boxes the calculator filled in are left out).
 * @returns {{ missing: string[] } | { errors: string[] } | { current, crossSection, width, thickness, rise, solved: string|null,
 *   traceTemperature, resistance, voltageDrop, power }}  SI units, °C.
 */
export function calculatePcbTraceCurrent({ type, values, units, order = [] }) {
  const k = TRACE_TYPES.find((t) => t.value === type)?.k ?? 0.024;
  const raw = Object.fromEntries(Object.keys(INPUTS).map((key) => [key, num(values[key])]));
  const errors = [];
  for (const [key, x] of Object.entries(raw)) if (Number.isNaN(x)) errors.push(`Please enter a number for ${INPUTS[key].label.toLowerCase()}.`);
  if (errors.length) return { errors };

  const typed = order.filter((key) => SOLVABLE.includes(key) && raw[key] !== null);
  if (typed.length < 3) return { missing: SOLVABLE.filter((key) => key !== "current" && raw[key] === null) };
  const keep = typed.slice(-3);
  const solved = SOLVABLE.find((key) => !keep.includes(key));

  const v = {};
  if (keep.includes("width")) v.width = raw.width * factorOf(LENGTH_UNITS, units.width);
  if (keep.includes("thickness")) v.thickness = raw.thickness * factorOf(LENGTH_UNITS, units.thickness);
  if (keep.includes("rise")) v.rise = toCelsius(raw.rise, units.rise, true);
  if (keep.includes("current")) v.current = raw.current * factorOf(CURRENT_UNITS, units.current);
  const ambient = raw.ambient === null ? null : toCelsius(raw.ambient, units.ambient);
  const length = raw.length === null ? null : raw.length * factorOf(LENGTH_UNITS, units.length);

  if (v.width !== undefined && !(v.width > 0)) errors.push(POSITIVE);
  if (v.thickness !== undefined && !(v.thickness > 0) && !errors.includes(POSITIVE)) errors.push(POSITIVE);
  if (v.rise !== undefined && v.rise < 0) errors.push("Temperature rise cannot be negative.");
  if (v.current !== undefined && !(v.current > 0) && !errors.includes(POSITIVE)) errors.push(POSITIVE);
  if (ambient !== null && !(ambient > -273.15)) errors.push(ABS_ZERO);
  if (length !== null && !(length > 0) && !errors.includes(POSITIVE)) errors.push(POSITIVE);
  if (errors.length) return { errors };

  // A in mil²: I = k × ΔT^0.44 × A^0.725
  if (solved === "current") {
    v.current = k * v.rise ** 0.44 * areaMil2(v.width, v.thickness) ** 0.725;
  } else if (solved === "rise") {
    v.rise = (v.current / (k * areaMil2(v.width, v.thickness) ** 0.725)) ** (1 / 0.44);
  } else {
    if (!(v.rise > 0)) return { errors: ["The temperature rise must be greater than zero to solve for the trace size."] };
    const ozMil = fromArea((v.current / (k * v.rise ** 0.44)) ** (1 / 0.725));
    if (solved === "width") v.width = (ozMil / (v.thickness / 3.5e-5)) * 2.54e-5;
    else v.thickness = (ozMil / (v.width / 2.54e-5)) * 3.5e-5;
  }
  const crossSection = areaMil2(v.width, v.thickness) * MIL2; // m²
  if (!(v.current > 0)) return { errors: ["Maximum current: " + POSITIVE] };

  const traceTemperature = ambient === null ? null : v.rise + ambient;
  let resistance = null;
  if (traceTemperature !== null && length !== null) {
    resistance = ((1.7e-6 * (length / 1e-2)) / (crossSection / 1e-4)) * (1 + 0.0039 * (traceTemperature - 25));
  }
  const warnings = [];
  if (traceTemperature !== null && !(traceTemperature > -273)) warnings.push(ABS_ZERO);
  if (resistance !== null && !(resistance > 0)) warnings.push(`Resistance: ${POSITIVE}`);
  return {
    ...v, crossSection, solved, traceTemperature, resistance, warnings,
    voltageDrop: resistance === null ? null : v.current * resistance,
    power: resistance === null ? null : resistance * v.current * v.current,
  };
}
