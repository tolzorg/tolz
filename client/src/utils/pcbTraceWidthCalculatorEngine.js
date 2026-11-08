// PCB Trace Width Calculator engine — matches omnicalculator.com/other/pcb-trace-width (its calculator definition was
// read from the page; behaviour checked live, see scripts/pcb-trace-width-calculator.test.js). IPC-2221:
//   cross section A [mil²] = (I [A] / (k × ΔT [°C]^0.44))^(1 / 0.725),   k = 0.024 internal, 0.048 external
//   trace width W [mil] = A / (thickness [oz/ft²] × 1.378)
//   trace temperature = ΔT + ambient temperature
//   resistance R = 1.7e-6 Ω·cm × length [cm] / A [cm²] × (1 + 0.0039 × (trace temperature − 25))
//   voltage drop = I × R,   power dissipation = R × I²
// Every box can use any of the reference's units (1 oz/ft² = 35 µm, 1 mil = 25.4 µm, 1 cmil = 5.067e-10 m²).
// With the thickness left blank, a typed trace width gives the thickness (the reference's equation solves it too).
//
// Deviation (flagged to the user): a temperature rise in °F is converted as a difference (× 5/9) and in K as
// equal to °C. The reference converts it as an absolute temperature (live: a 10.8 °F rise → −11.8 °C → no result).

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";

const scalar = (value, label, short, factor) => ({ value, label, short, factor });
export const TRACE_TYPES = [
  { value: "internal", label: "internal", k: 0.024 },
  { value: "external", label: "external", k: 0.048 },
];
export const CURRENT_UNITS = [scalar("A", "amperes (A)", "A", 1), scalar("mA", "milliamperes (mA)", "mA", 1e-3), scalar("uA", "microamperes (µA)", "µA", 1e-6)];
export const LENGTH_UNITS = [
  scalar("nm", "nanometers (nm)", "nm", 1e-9), scalar("um", "micrometers (μm)", "μm", 1e-6), scalar("mm", "millimeters (mm)", "mm", 1e-3),
  scalar("cm", "centimeters (cm)", "cm", 1e-2), scalar("mil", "thou, thousandth of an inch (mil)", "mil", 2.54e-5),
  scalar("in", "inches (in)", "in", 0.0254), scalar("oz", "ounces per square foot (oz/ft²)", "oz/ft²", 3.5e-5),
];
export const AREA_UNITS = [
  scalar("mm2", "square millimeters (mm²)", "mm²", 1e-6), scalar("cm2", "square centimeters (cm²)", "cm²", 1e-4),
  scalar("in2", "square inches (in²)", "in²", 6.4516e-4), scalar("cmil", "circular mils (cmil)", "cmil", 5.067e-10),
  scalar("sqmil", "square mils (mil²)", "mil²", 6.4516e-10),
];
export const TEMP_UNITS = [{ value: "C", label: "Celsius (°C)", short: "°C" }, { value: "F", label: "Fahrenheit (°F)", short: "°F" }, { value: "K", label: "kelvins (K)", short: "K" }];
export const RESISTANCE_UNITS = [scalar("mohm", "milliohms (mΩ)", "mΩ", 1e-3), scalar("ohm", "ohms (Ω)", "Ω", 1), scalar("kohm", "kiloohms (kΩ)", "kΩ", 1e3), scalar("Mohm", "megaohms (MΩ)", "MΩ", 1e6)];
export const VOLTAGE_UNITS = [scalar("mV", "millivolts (mV)", "mV", 1e-3), scalar("V", "volts (V)", "V", 1), scalar("kV", "kilovolts (kV)", "kV", 1e3), scalar("MV", "megavolts (MV)", "MV", 1e6)];
export const POWER_UNITS = [scalar("mW", "milliwatts (mW)", "mW", 1e-3), scalar("W", "watts (W)", "W", 1), scalar("kW", "kilowatts (kW)", "kW", 1e3)];

export const INPUTS = {
  current: { label: "Max. current", units: CURRENT_UNITS, unit: "A" },
  thickness: { label: "Trace thickness (t)", units: LENGTH_UNITS, unit: "oz" },
  rise: { label: "Max. desired temperature rise", units: TEMP_UNITS, unit: "C", delta: true },
  ambient: { label: "Ambient temperature", units: TEMP_UNITS, unit: "C" },
  length: { label: "Length", units: LENGTH_UNITS, unit: "cm" },
  width: { label: "Trace width (W)", units: LENGTH_UNITS, unit: "mil" },
};
export const OUTPUT_UNITS = { width: LENGTH_UNITS, crossSection: AREA_UNITS, traceTemperature: TEMP_UNITS, resistance: RESISTANCE_UNITS, voltageDrop: VOLTAGE_UNITS, power: POWER_UNITS };
export const DEFAULT_OUTPUT_UNITS = { width: "mil", crossSection: "sqmil", traceTemperature: "C", resistance: "ohm", voltageDrop: "V", power: "W" };

const num = (t) => { const s = String(t ?? "").replace(/,/g, "").trim(); if (s === "") return null; const d = decimalOf(s); return d ? Number(`${d.n}e-${d.s}`) : NaN; };
/** A number shown with Omni's display rounding (15 significant digits first, to drop float noise). */
export const fmt = (x) => formatDecimal(decimalOf(String(Number(x.toPrecision(15)))));

/** °C from a temperature in a unit; `delta` converts a difference (no offset). */
export const toCelsius = (x, unit, delta = false) => (unit === "F" ? (delta ? x * 5 / 9 : (x - 32) * 5 / 9) : unit === "K" && !delta ? x - 273.15 : x);
export const fromCelsius = (c, unit, delta = false) => (unit === "F" ? (delta ? c * 9 / 5 : c * 9 / 5 + 32) : unit === "K" && !delta ? c + 273.15 : c);
export const factorOf = (units, unit) => units.find((u) => u.value === unit)?.factor ?? 1;

/** Converts a box's text when its unit changes (temperatures with or without the offset). */
export function convertText(key, from, to, text) {
  const x = num(text);
  if (x === null || Number.isNaN(x)) return text;
  const def = INPUTS[key];
  const y = def.units === TEMP_UNITS ? fromCelsius(toCelsius(x, from, def.delta), to, def.delta) : (x * factorOf(def.units, from)) / factorOf(def.units, to);
  return fmt(y);
}

/** Shows an SI (or °C) value in an output unit. */
export function showIn(key, unit, value) {
  if (key === "traceTemperature") return fmt(fromCelsius(value, unit));
  return fmt(value / factorOf(OUTPUT_UNITS[key], unit));
}

/**
 * @param {{ type: "internal"|"external", values: Record<string, string>, units: Record<string, string> }} input  texts and
 *   units of the boxes in INPUTS (width only matters when the thickness is blank).
 * @returns {{ missing: string[] } | { errors: string[] } | { width: number, crossSection: number, thickness: number|null,
 *   solvedThickness: boolean, traceTemperature: number|null, resistance: number|null, voltageDrop: number|null, power: number|null }}
 *   lengths in m, area in m², temperature in °C, then Ω, V, W.
 */
export function calculatePcbTraceWidth({ type, values, units }) {
  const k = TRACE_TYPES.find((t) => t.value === type)?.k ?? 0.024;
  const v = Object.fromEntries(Object.keys(INPUTS).map((key) => [key, num(values[key])]));
  const errors = [];
  for (const [key, x] of Object.entries(v)) if (Number.isNaN(x)) errors.push(`Please enter a number for ${INPUTS[key].label.toLowerCase()}.`);
  if (errors.length) return { errors };

  const thicknessGiven = v.thickness !== null;
  const missing = ["current", "thickness", "rise"].filter((key) => (key === "thickness" ? !thicknessGiven && v.width === null : v[key] === null));
  if (missing.length) return { missing };

  const current = v.current * factorOf(CURRENT_UNITS, units.current);
  const rise = toCelsius(v.rise, units.rise, true);
  if (current < 0) errors.push("Maximum current must be positive.");
  if (!(rise > 0)) errors.push("The temperature rise must be greater than zero.");
  if (thicknessGiven && !(v.thickness > 0)) errors.push("Trace thickness must be greater than zero.");
  if (!thicknessGiven && !(v.width > 0)) errors.push("Trace width must be greater than zero.");
  if (v.length !== null && !(v.length > 0)) errors.push("Length must be greater than zero.");
  if (errors.length) return { errors };

  const areaMil2 = (current / (k * rise ** 0.44)) ** (1 / 0.725);
  const crossSection = areaMil2 * 6.4516e-10; // m²
  let thickness;
  let width;
  if (thicknessGiven) {
    thickness = v.thickness * factorOf(LENGTH_UNITS, units.thickness);
    width = (areaMil2 / ((thickness / 3.5e-5) * 1.378)) * 2.54e-5; // mil → m
  } else {
    width = v.width * factorOf(LENGTH_UNITS, units.width);
    thickness = (areaMil2 / ((width / 2.54e-5) * 1.378)) * 3.5e-5; // oz/ft² → m
  }

  const ambient = v.ambient === null ? null : toCelsius(v.ambient, units.ambient);
  const traceTemperature = ambient === null ? null : rise + ambient;
  let resistance = null;
  if (traceTemperature !== null && v.length !== null) {
    const lengthCm = (v.length * factorOf(LENGTH_UNITS, units.length)) / 1e-2;
    const areaCm2 = areaMil2 * 2.54 * 2.54 * 1e-6;
    resistance = ((1.7e-6 * lengthCm) / areaCm2) * (1 + 0.0039 * (traceTemperature - 25));
  }
  return {
    width, crossSection, thickness, solvedThickness: !thicknessGiven, traceTemperature, resistance,
    voltageDrop: resistance === null ? null : current * resistance,
    power: resistance === null ? null : resistance * current * current,
  };
}
