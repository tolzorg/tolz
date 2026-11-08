// Battery Capacity Calculator engine — matches omnicalculator.com/other/battery-capacity (its calculator definition was
// read from the page; behaviour checked against its screenshot and live, see scripts/battery-capacity-calculator.test.js).
//
//   stored energy E = voltage V × capacity Q                    (Wh = V × Ah)
//   discharge current I = Q × C-rate                            (A = Ah × C, the C-rate being "per hour")
//   runtime to full capacity t = 1 / C-rate hours               (= 60 / C minutes)
// SI inside: coulombs, joules, amperes, seconds (so I = Q × C / 3600 and t = 3600 / C). Like the reference, any box can be
// typed or left blank and solved from the others; when more boxes are typed than needed, the most recently typed ones win
// (the CBM calculator's solver).

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign, isZero } from "./semesterGradeCalculatorEngine.js";
import { unitToSi, unitFromSi, solveByRecency } from "./cbmCalculatorEngine.js";
import { CAPACITY_UNITS, CURRENT_UNITS } from "./batteryLifeCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const ONE = dec("1");
const HOUR = dec("3600");
const u = (value, label, short, si) => ({ value, label, short, f: [dec(si), ONE] });

export const VOLTAGE_UNITS = [
  u("mV", "millivolts (mV)", "mV", "0.001"), u("V", "volts (V)", "V", "1"), u("kV", "kilovolts (kV)", "kV", "1000"), u("MV", "megavolts (MV)", "MV", "1000000"),
];
export const ENERGY_UNITS = [
  u("J", "joules (J)", "J", "1"), u("kJ", "kilojoules (kJ)", "kJ", "1000"), u("MJ", "megajoules (MJ)", "MJ", "1000000"),
  u("Wh", "watt-hours (Wh)", "Wh", "3600"), u("kWh", "kilowatt-hours (kWh)", "kWh", "3600000"),
];
export const C_UNITS = [u("C", "C", "C", "1")];
export const RUNTIME_UNITS = [u("sec", "seconds (sec)", "sec", "1"), u("min", "minutes (min)", "min", "60"), u("hrs", "hours (hrs)", "hrs", "3600")];

export const FIELDS = {
  voltage: { label: "Voltage", units: VOLTAGE_UNITS, unit: "V" },
  capacity: { label: "Battery capacity", units: CAPACITY_UNITS, unit: "Ah" },
  energy: { label: "Stored energy", units: ENERGY_UNITS, unit: "Wh" },
  cRate: { label: "C-rate", units: C_UNITS, unit: "C", help: "How fast the battery charges and discharges. Greater values mean faster." },
  current: { label: "Discharge current", units: CURRENT_UNITS, unit: "A", help: "The current at which your battery charges or discharges." },
  runtime: { label: "Runtime to full capacity", units: RUNTIME_UNITS, unit: "min", help: "The time needed to fully charge or discharge the battery." },
};
export const MAIN_KEYS = ["voltage", "capacity", "energy"];
export const OTHER_KEYS = ["cRate", "current", "runtime"];

/** The reference's examples (and how each result is worked out). */
export const EXAMPLES = [
  {
    id: 1, title: "Medical device battery", question: "What's the stored energy of a battery with a voltage of 14.8 V and a capacity of 3.65 Ah?",
    values: { voltage: "14.8", capacity: "3.65" },
    steps: ["Use the battery energy formula: E = V × Q.", "Substitute the given values into the formula.", "Calculate the stored energy E."],
  },
  {
    id: 2, title: "Drone battery", question: "What's the battery capacity with a voltage of 22.2 V and stored energy of 97.7 Wh?",
    values: { voltage: "22.2", energy: "97.7" },
    steps: ["Start from the battery energy formula: E = V × Q.", "Rearrange the formula to solve for capacity: Q = E / V.", "Substitute the known values and calculate the capacity Q."],
  },
];

const nonZero = (x) => (x && !isZero(x) ? x : null);
const EQUATIONS = [
  ["energy", ["voltage", "capacity"], "product"],
  {
    // I = Q × C / 3600
    vars: ["current", "capacity", "cRate"],
    solve: (k, v) => {
      if (k === "current") return div(mul(v.capacity, v.cRate), HOUR);
      if (k === "capacity") return nonZero(v.cRate) && div(mul(v.current, HOUR), v.cRate);
      return nonZero(v.capacity) && div(mul(v.current, HOUR), v.capacity); // C-rate
    },
  },
  {
    // t = 3600 / C
    vars: ["runtime", "cRate"],
    solve: (k, v) => (k === "runtime" ? nonZero(v.cRate) && div(HOUR, v.cRate) : nonZero(v.runtime) && div(HOUR, v.runtime)),
  },
];

const MESSAGES = {
  voltage: "Voltage must be greater than zero.", capacity: "Battery capacity must be greater than zero.", energy: "Watt-hours must be greater than zero.",
  cRate: "C-rate must be greater than zero.", current: "Discharge current must be greater than zero.", runtime: "Runtime must be greater than zero.",
};

/**
 * @param {Record<string, { unit: string, texts: string[] }>} fields
 * @param {string[]} order  typed boxes, least recent first (boxes the calculator filled in are left out).
 * @returns {{ missing: string[] } | { errors: string[] } | { display: Record<string, string[]>, solved: string[], values: Record<string, object> }}
 */
export function calculateBatteryCapacity(fields, order) {
  const keys = [...MAIN_KEYS, ...OTHER_KEYS];
  const errors = [];
  const parsed = {};
  for (const k of keys) {
    const x = unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts);
    if (x === false) errors.push(`Please enter a number for ${FIELDS[k].label.toLowerCase()}.`);
    else if (x !== null) parsed[k] = x;
  }
  if (errors.length) return { errors };
  for (const k of keys) if (parsed[k] && sign(parsed[k]) <= 0) errors.push(MESSAGES[k]);
  if (errors.length) return { errors };

  const typed = order.filter((k) => parsed[k]);
  const { known, values: v } = solveByRecency(typed, parsed, EQUATIONS);
  const solved = keys.filter((k) => v[k] && !known[k]);
  if (!solved.length) {
    const missing = ["voltage", "capacity"].filter((k) => !v[k]);
    return { missing: missing.length ? missing : ["capacity"] };
  }
  for (const k of solved) if (sign(v[k]) <= 0 && !errors.includes(MESSAGES[k])) errors.push(MESSAGES[k]);
  if (errors.length) return { errors };
  const display = Object.fromEntries(keys.map((k) => [k, !v[k] ? [""] : known[k] ? fields[k].texts : unitFromSi(FIELDS[k].units, fields[k].unit, v[k])]));
  return { display, solved, values: v };
}

/** An SI value in one of a box's units, Omni-rounded. */
export const showIn = (k, unit, si) => {
  const x = FIELDS[k].units.find((y) => y.value === unit);
  return formatDecimal(div(mul(si, x.f[1]), x.f[0]));
};
/** The example whose values are in the boxes (as the reference shows its example notes), or null. */
export function matchingExample(fields) {
  const same = (k, text, unit) => fields[k].unit === unit && Number(String(fields[k].texts[0]).replace(/,/g, "")) === Number(text);
  if (same("voltage", "14.8", "V") && same("capacity", "3.65", "Ah")) return EXAMPLES[0];
  if (same("voltage", "22.2", "V") && same("energy", "97.7", "Wh")) return EXAMPLES[1];
  return null;
}
