// PCB Trace Resistance Calculator engine — matches omnicalculator.com/other/pcb-trace-resistance (its calculator
// definition was read from the page; checked against its screenshot, see scripts/pcb-trace-resistance-calculator.test.js).
//
//   R = ρ × L / (T × W) × (1 + α × (ambient temperature − 25 °C))       (ρ = 1.7e-6 Ω·cm, α = 0.0039 /°C: copper)
//   voltage drop = current × R
// Like the reference, any box can be solved from the others (e.g. resistance → ambient temperature, as in its
// screenshot); when more are typed than needed, the most recently typed win, and the untouched defaults ρ and α are
// kept. Exact decimals via the CBM calculator's solver.
//
// Deviations (flagged to the user): the reference solves for the ambient temperature numerically and stops ~0.001%
// short (screenshot 7,239,508 °C; exact 7,239,588 °C); here it is exact. α per °F converts × 9/5 and per K equals per
// °C (the reference converts α like a temperature, with the °F offset).

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, add, sub, sign, isZero } from "./semesterGradeCalculatorEngine.js";
import { unitToSi, unitFromSi, solveByRecency } from "./cbmCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const u = (value, label, short, n, d = "1") => ({ value, label, short, f: [dec(n), dec(d)] });

export const LENGTH_UNITS = [
  u("nm", "nanometers (nm)", "nm", "1", "1000000000"), u("um", "micrometers (μm)", "μm", "1", "1000000"), u("mm", "millimeters (mm)", "mm", "1", "1000"),
  u("cm", "centimeters (cm)", "cm", "1", "100"), u("mil", "thou, thousandth of an inch (mil)", "mil", "127", "5000000"),
  u("in", "inches (in)", "in", "127", "5000"), u("oz", "ounces per square foot (oz/ft²)", "oz/ft²", "7", "200000"),
];
export const THICKNESS_UNITS = LENGTH_UNITS.filter((x) => x.value !== "mil");
export const RHO_UNITS = [
  u("um", "ohm micrometers (Ω·μm)", "Ω·μm", "1", "1000000"), u("mm", "ohm millimeters (Ω·mm)", "Ω·mm", "1", "1000"),
  u("cm", "ohm centimeters (Ω·cm)", "Ω·cm", "1", "100"), u("m", "ohm meters (Ω·m)", "Ω·m", "1"),
  u("mil", "ohm mils (Ω·mil)", "Ω·mil", "127", "5000000"), u("in", "ohm inches (Ω·in)", "Ω·in", "127", "5000"),
  u("yd", "ohm yards (Ω·yd)", "Ω·yd", "1143", "1250"), u("mi", "ohm miles (Ω·mi)", "Ω·mi", "201168", "125"),
];
/** α per degree: per °F is 9/5 per °C. */
export const ALPHA_UNITS = [u("C", "per degree Celsius (°C⁻¹)", "°C⁻¹", "1"), u("F", "per degree Fahrenheit (°F⁻¹)", "°F⁻¹", "9", "5"), u("K", "per kelvin (K⁻¹)", "K⁻¹", "1")];
export const TEMP_UNITS = [{ value: "C", label: "Celsius (°C)", short: "°C" }, { value: "F", label: "Fahrenheit (°F)", short: "°F" }, { value: "K", label: "kelvins (K)", short: "K" }];
export const RESISTANCE_UNITS = [u("mohm", "milliohms (mΩ)", "mΩ", "1", "1000"), u("ohm", "ohms (Ω)", "Ω", "1"), u("kohm", "kiloohms (kΩ)", "kΩ", "1000"), u("Mohm", "megaohms (MΩ)", "MΩ", "1000000")];
export const CURRENT_UNITS = [u("A", "amperes (A)", "A", "1"), u("mA", "milliamperes (mA)", "mA", "1", "1000"), u("uA", "microamperes (µA)", "µA", "1", "1000000")];
export const VOLTAGE_UNITS = [u("mV", "millivolts (mV)", "mV", "1", "1000"), u("V", "volts (V)", "V", "1"), u("kV", "kilovolts (kV)", "kV", "1000"), u("MV", "megavolts (MV)", "MV", "1000000")];

const POSITIVE = "Please ensure a positive value.";
const ABS_ZERO = "Temperature should be greater than absolute zero (-459.7 °F, -273.15 °C).";
export const FIELDS = {
  width: { label: "Trace width (W)", units: LENGTH_UNITS, unit: "mm", message: POSITIVE, positive: true },
  length: { label: "Length (L)", units: LENGTH_UNITS, unit: "cm", message: POSITIVE, positive: true },
  thickness: { label: "Trace thickness (T)", units: THICKNESS_UNITS, unit: "mm", message: POSITIVE, positive: true },
  ambient: { label: "Ambient temperature", units: TEMP_UNITS, unit: "C", message: ABS_ZERO, temperature: true },
  rho: { label: "Resistivity (ρ)", help: "Inherent \"resistance\" of the material.", units: RHO_UNITS, unit: "cm", message: POSITIVE, positive: true, default: "0.0000017" },
  alpha: { label: "Resistivity temperature coefficient (α)", help: "Measures how the resistivity changes with temperature.", units: ALPHA_UNITS, unit: "C", default: "0.0039" },
  resistance: { label: "Resistance", units: RESISTANCE_UNITS, unit: "ohm" },
  current: { label: "Current", units: CURRENT_UNITS, unit: "A" },
  voltage: { label: "Voltage drop", units: VOLTAGE_UNITS, unit: "V" },
};
export const FIELD_KEYS = Object.keys(FIELDS);
export const DEFAULT_KEYS = ["rho", "alpha"];

const ONE = dec("1");
const T25 = dec("25");
const toC = (x, unit) => (unit === "F" ? div(mul(sub(x, dec("32")), dec("5")), dec("9")) : unit === "K" ? sub(x, dec("273.15")) : x);
const fromC = (c, unit) => (unit === "F" ? add(div(mul(c, dec("9")), dec("5")), dec("32")) : unit === "K" ? add(c, dec("273.15")) : c);

/** A box's value in base units (m, Ω·m, per °C, °C, Ω, A, V), null when blank, false when not a number. */
function toBase(key, f) {
  if (!FIELDS[key].temperature) return unitToSi(FIELDS[key].units, f.unit, f.texts);
  const t = String(f.texts[0] ?? "").replace(/,/g, "").trim();
  if (t === "") return null;
  const d = dec(t);
  return d ? toC(d, f.unit) : false;
}
const fromBase = (key, unit, v) => (FIELDS[key].temperature ? [formatDecimal(fromC(v, unit))] : unitFromSi(FIELDS[key].units, unit, v));

/** Converts a box's text when its unit changes. */
export function convertText(key, from, to, texts) {
  const v = toBase(key, { unit: from, texts });
  return v ? fromBase(key, to, v) : texts;
}

const factor = (v) => add(ONE, mul(v.alpha, sub(v.ambient, T25))); // 1 + α(T − 25)
const geometry = (v) => div(mul(v.rho, v.length), mul(v.thickness, v.width)); // ρL / (TW)
const EQUATIONS = [
  {
    vars: ["resistance", "rho", "length", "thickness", "width", "ambient", "alpha"],
    solve: (k, v) => {
      if (k === "resistance") return mul(geometry(v), factor(v));
      if (k === "ambient" || k === "alpha") {
        const g = geometry(v);
        if (isZero(g)) return null;
        const extra = sub(div(v.resistance, g), ONE); // α(T − 25)
        if (k === "alpha") { const dt = sub(v.ambient, T25); return isZero(dt) ? null : div(extra, dt); }
        return isZero(v.alpha) ? null : add(T25, div(extra, v.alpha));
      }
      const f = factor(v);
      if (isZero(f)) return null;
      const ratio = div(v.resistance, f); // = ρL/(TW)
      if (k === "rho") return div(mul(ratio, mul(v.thickness, v.width)), v.length);
      if (k === "length") return div(mul(ratio, mul(v.thickness, v.width)), v.rho);
      const other = k === "thickness" ? v.width : v.thickness;
      return isZero(ratio) ? null : div(mul(v.rho, v.length), mul(ratio, other));
    },
  },
  ["voltage", ["current", "resistance"], "product"],
];

/**
 * @param {Record<string, { unit: string, texts: string[] }>} fields
 * @param {string[]} order  typed boxes, least recent first (filled-in boxes left out).
 * @param {string[]} defaults  untouched default boxes (counted as most recent).
 * @returns {{ missing: string[] } | { errors: string[] } | { display: Record<string, string[]>, solved: string[], warnings: string[] }}
 */
export function calculatePcbTraceResistance(fields, order, defaults = []) {
  const typed = [...order.filter((k) => !defaults.includes(k)), ...defaults].filter((k) => toBase(k, fields[k]) !== null);
  const parsed = {};
  const errors = [];
  const check = (k, v) => (FIELDS[k].positive ? sign(v) <= 0 : FIELDS[k].temperature ? sign(sub(v, dec("-273.15"))) <= 0 : false);
  for (const k of typed) {
    const v = toBase(k, fields[k]);
    if (v === false) errors.push(`Please enter a number for ${FIELDS[k].label.toLowerCase()}.`);
    else if (check(k, v)) { if (!errors.includes(FIELDS[k].message)) errors.push(FIELDS[k].message); }
    else parsed[k] = v;
  }
  if (errors.length) return { errors };

  const { known, values: v } = solveByRecency(typed, parsed, EQUATIONS);
  if (!v.resistance) return { missing: ["width", "length", "thickness", "ambient"].filter((k) => !v[k]) };
  const solved = FIELD_KEYS.filter((k) => v[k] && !known[k]);
  const display = Object.fromEntries(FIELD_KEYS.map((k) => [k, !v[k] ? [""] : known[k] ? fields[k].texts : fromBase(k, fields[k].unit, v[k])]));
  const warnings = solved.filter((k) => check(k, v[k])).map((k) => `${FIELDS[k].label}: ${FIELDS[k].message}`);
  if (sign(v.resistance) <= 0 && !solved.includes("resistance")) warnings.push(`Resistance: ${POSITIVE}`);
  return { display, solved, warnings };
}
