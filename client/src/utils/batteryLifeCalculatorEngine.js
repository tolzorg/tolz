// Battery Life Calculator engine — matches omnicalculator.com/other/battery-life (its calculator definition was read from
// the page; behaviour checked against its screenshots and live, see scripts/battery-life-calculator.test.js).
//
// SI units inside (coulombs, amperes, volts, watts, seconds; discharge safety as a fraction):
//   battery life = battery capacity × (1 − discharge safety) / current draw
//   current draw = device wattage / battery voltage                                      ("wattage rating")
//   with awake/sleep modes:
//     average current = (awake current × awake time + sleep current × sleep time) / (awake time + sleep time)
//     awake current = awake wattage / voltage;  sleep current = sleep wattage / voltage   ("wattage rating")
// Like the reference, every box can be typed or left blank and solved from the others (the battery life gives the
// capacity, the current draw, or the discharge safety, …); when more boxes are typed than needed, the ones typed most
// recently win, and the untouched 20% discharge safety counts as most recent (the CBM calculator's solver). The
// reference's conditions are checked on every value, typed or solved, with its messages.

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, add, sub, sign, isZero } from "./semesterGradeCalculatorEngine.js";
import { unitToSi, unitFromSi, solveByRecency } from "./cbmCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const ONE = dec("1");
const u = (value, label, short, si) => ({ value, label, short, f: [dec(si), ONE] });
const pair = (value, label, short, parts, small, big, per) => ({ value, label, short, parts, f: [dec(small), ONE], big: [dec(big), ONE], per });

export const CAPACITY_UNITS = [u("Ah", "ampere-hours (Ah)", "Ah", "3600"), u("mAh", "milliampere-hours (mAh)", "mAh", "3.6")];
export const PERCENT_UNITS = [u("pct", "percent (%)", "%", "0.01")];
export const VOLTAGE_UNITS = [u("mV", "millivolts (mV)", "mV", "0.001"), u("V", "volts (V)", "V", "1"), u("kV", "kilovolts (kV)", "kV", "1000")];
export const POWER_UNITS = [
  u("mW", "milliwatts (mW)", "mW", "0.001"), u("W", "watts (W)", "W", "1"),
  u("hpl", "mechanical horsepower (hp(I))", "hp(I)", "745.6998715823"), u("hpm", "metric horsepower (hp(M))", "hp(M)", "735.49875"),
  u("hpe", "electrical horsepower (hp(E))", "hp(E)", "746"),
];
export const CURRENT_UNITS = [u("A", "amperes (A)", "A", "1"), u("mA", "milliamperes (mA)", "mA", "0.001"), u("uA", "microamperes (µA)", "µA", "0.000001")];
const SEC = u("sec", "seconds (sec)", "sec", "1");
const MIN = u("min", "minutes (min)", "min", "60");
const HRS = u("hrs", "hours (hrs)", "hrs", "3600");
const DAYS = u("days", "days (days)", "days", "86400");
export const CYCLE_UNITS = [
  SEC, MIN, HRS, DAYS,
  pair("minsec", "minutes / seconds (min / sec)", "min / sec", ["min", "sec"], "1", "60", 60),
  pair("hrsmin", "hours / minutes (hrs / min)", "hrs / min", ["hrs", "min"], "60", "3600", 60),
];
export const LIFE_UNITS = [
  SEC, MIN, HRS, DAYS, u("wks", "weeks (wks)", "wks", "604800"), u("mos", "months (mos)", "mos", "2629800"), u("yrs", "years (yrs)", "yrs", "31557600"),
];

export const SLEEP_OPTIONS = [{ value: "none", label: "with no sleep mode" }, { value: "sleep", label: "with awake/sleep modes" }];
export const PARAM_OPTIONS = [{ value: "current", label: "current draw" }, { value: "wattage", label: "wattage rating" }];

export const FIELDS = {
  capacity: { label: "Battery capacity", units: CAPACITY_UNITS, unit: "mAh" },
  safety: { label: "Discharge safety", units: PERCENT_UNITS, unit: "pct", help: "Percentage of battery capacity that you don't want to use to maintain a healthy battery." },
  voltage: { label: "Battery voltage", units: VOLTAGE_UNITS, unit: "V" },
  wattage: { label: "Device consumption", units: POWER_UNITS, unit: "W", help: "Typically indicated in the device's specifications." },
  current: { label: "Device current draw", units: CURRENT_UNITS, unit: "mA", help: "Or the average load current draw or discharge of the device." },
  wattageAwake: { label: "Awake device wattage", units: POWER_UNITS, unit: "W", help: "Typically the upper limit of the device's wattage range indicated in the device's specifications." },
  currentAwake: { label: "Awake mode", units: CURRENT_UNITS, unit: "mA", help: "Battery consumption in \"awake mode\" or when the device is in use." },
  awakeTime: { label: "Awake time", units: CYCLE_UNITS, unit: "hrs", help: "Time that your device is in use during one operational cycle." },
  wattageSleep: { label: "Sleep mode device wattage", units: POWER_UNITS, unit: "W", help: "Typically the lower limit of the device's wattage range indicated in the device's specifications." },
  currentSleep: { label: "Sleep mode", units: CURRENT_UNITS, unit: "mA", help: "Battery consumption in \"sleep mode\" or when the device is not in use." },
  sleepTime: { label: "Sleep time", units: CYCLE_UNITS, unit: "hrs", help: "Time your device is in sleep mode during one operation cycle." },
  averageCurrent: { label: "Calculated average consumption", units: CURRENT_UNITS, unit: "mA" },
  life: { label: "Battery life", units: LIFE_UNITS, unit: "hrs", help: "Total duration the battery can be used." },
  lifeSleep: { label: "Battery life", units: LIFE_UNITS, unit: "hrs", help: "Total duration the battery can be used." },
};
/** The prefilled boxes (texts in their default unit). */
export const DEFAULT_TEXTS = { safety: "20" };

/** The boxes shown for each pair of options, in the reference's order (the last one is the battery life). */
export function fieldsFor(sleep, param) {
  const w = param === "wattage";
  if (sleep === "none") return ["capacity", "safety", ...(w ? ["voltage", "wattage"] : []), "current", "life"];
  return [
    "capacity", "safety", ...(w ? ["voltage", "wattageAwake"] : []), "currentAwake", "awakeTime",
    ...(w ? ["wattageSleep"] : []), "currentSleep", "sleepTime", "averageCurrent", "lifeSleep",
  ];
}
export const lifeKey = (sleep) => (sleep === "none" ? "life" : "lifeSleep");

const nonZero = (x) => (x && !isZero(x) ? x : null);
/** life = capacity × (1 − safety) / current, solvable for any one. */
const lifeEquation = (life, current) => ({
  vars: [life, "capacity", "safety", current],
  solve: (k, v) => {
    const usable = () => mul(v.capacity, sub(ONE, v.safety));
    if (k === life) return nonZero(v[current]) && div(usable(), v[current]);
    if (k === current) return nonZero(v[life]) && div(usable(), v[life]);
    if (k === "capacity") return nonZero(sub(ONE, v.safety)) && div(mul(v[life], v[current]), sub(ONE, v.safety));
    return nonZero(v.capacity) && sub(ONE, div(mul(v[life], v[current]), v.capacity)); // safety
  },
});
/** current = wattage / voltage. */
const ohm = (current, wattage) => [wattage, [current, "voltage"], "product"];
/** average = (ca × ta + cs × ts) / (ta + ts). */
const averageEquation = {
  vars: ["averageCurrent", "currentAwake", "awakeTime", "currentSleep", "sleepTime"],
  solve: (k, v) => {
    const { averageCurrent: avg, currentAwake: ca, awakeTime: ta, currentSleep: cs, sleepTime: ts } = v;
    if (k === "averageCurrent") return nonZero(add(ta, ts)) && div(add(mul(ca, ta), mul(cs, ts)), add(ta, ts));
    if (k === "currentAwake") return nonZero(ta) && div(sub(mul(avg, add(ta, ts)), mul(cs, ts)), ta);
    if (k === "currentSleep") return nonZero(ts) && div(sub(mul(avg, add(ta, ts)), mul(ca, ta)), ts);
    if (k === "awakeTime") return nonZero(sub(avg, ca)) && div(mul(ts, sub(cs, avg)), sub(avg, ca));
    return nonZero(sub(cs, avg)) && div(mul(ta, sub(avg, ca)), sub(cs, avg)); // sleep time
  },
};
function equationsFor(sleep, param) {
  const w = param === "wattage";
  if (sleep === "none") return [lifeEquation("life", "current"), ...(w ? [ohm("current", "wattage")] : [])];
  return [
    averageEquation, lifeEquation("lifeSleep", "averageCurrent"),
    ...(w ? [ohm("currentAwake", "wattageAwake"), ohm("currentSleep", "wattageSleep")] : []),
  ];
}
/** The boxes the user types for each pair of options (everything else is a result). */
export const NEEDED = {
  "none-current": ["capacity", "safety", "current"],
  "none-wattage": ["capacity", "safety", "voltage", "wattage"],
  "sleep-current": ["capacity", "safety", "currentAwake", "awakeTime", "currentSleep", "sleepTime"],
  "sleep-wattage": ["capacity", "safety", "voltage", "wattageAwake", "awakeTime", "wattageSleep", "sleepTime"],
};

/** The reference's conditions: [box, test, message]. */
const CONDITIONS = [
  ["capacity", (x) => sign(x) > 0, "Battery capacity must be greater than zero."],
  ["safety", (x) => sign(x) >= 0, "Discharge safety must be between 0% and 100%."],
  ["safety", (x) => sign(sub(x, ONE)) < 0, "Discharge safety cannot be greater than or equal to 100%."],
  ["current", (x) => sign(x) > 0, "Average consumption must be greater than zero."],
  ["currentAwake", (x) => sign(x) > 0, "Device consumption must be greater than zero."],
  ["awakeTime", (x) => sign(x) > 0, "Awake time must be greater than zero."],
  ["currentSleep", (x) => sign(x) >= 0, "Sleep mode device consumption cannot be negative."],
  ["sleepTime", (x) => sign(x) >= 0, "Sleep time cannot be negative."],
  ["life", (x) => sign(x) > 0, "Battery life must be greater than zero."],
  ["lifeSleep", (x) => sign(x) > 0, "Battery life must be greater than zero."],
  ["voltage", (x) => sign(x) >= 0, "Voltage must be greater than or equal to zero."],
  ["wattage", (x) => sign(x) >= 0, "Device consumption must be greater than or equal to zero."],
  ["wattageAwake", (x) => sign(x) >= 0, "Device wattage must be greater than or equal to zero."],
  ["wattageSleep", (x) => sign(x) >= 0, "Device wattage must be greater than or equal to zero."],
];

/**
 * @param {{ sleep: "none"|"sleep", param: "current"|"wattage", fields: Record<string, { unit: string, texts: string[] }>,
 *   order: string[], defaults: string[] }} input  `order`: typed boxes, least recent first (boxes the calculator filled in
 *   are left out); `defaults`: untouched prefilled boxes (["safety"] until it is edited).
 * @returns {{ missing: string[] } | { errors: string[] } | { display: Record<string, string[]>, solved: string[],
 *   values: Record<string, object> }}  `values`: exact SI decimals.
 */
export function calculateBatteryLife({ sleep, param, fields, order = [], defaults = [] }) {
  const keys = fieldsFor(sleep, param);
  const siOf = (k) => unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts);
  const errors = [];
  const parsed = {};
  for (const k of keys) {
    const x = siOf(k);
    if (x === false) errors.push(`Please enter a number for ${FIELDS[k].label.toLowerCase()}.`);
    else if (x !== null) parsed[k] = x;
  }
  if (errors.length) return { errors };
  // Invalid typed values are reported before anything is solved from them; solved values are checked afterwards.
  const check = (vals) => {
    for (const [k, ok, message] of CONDITIONS) {
      if (keys.includes(k) && vals[k] && !ok(vals[k]) && !errors.includes(message)) errors.push(message);
    }
  };
  check(parsed);
  if (errors.length) return { errors };

  const typed = [...order.filter((k) => parsed[k] && !defaults.includes(k)), ...defaults.filter((k) => parsed[k])];
  const { known, values: v } = solveByRecency(typed.filter((k) => keys.includes(k)), parsed, equationsFor(sleep, param));
  const life = lifeKey(sleep);
  check(v);
  if (errors.length) return { errors };
  if (!v[life]) {
    const missing = NEEDED[`${sleep}-${param}`].filter((k) => !v[k]);
    return { missing: missing.length ? missing : [life] };
  }
  const solved = keys.filter((k) => v[k] && !known[k]);
  const display = Object.fromEntries(keys.map((k) => [k, !v[k] ? (fields[k].texts.map(() => "")) : known[k] ? fields[k].texts : unitFromSi(FIELDS[k].units, fields[k].unit, v[k])]));
  return { display, solved, values: v };
}

/** A value (SI decimal) in one of a box's units, Omni-rounded. */
export const showSi = (units, unit, si) => formatDecimal(div(mul(si, units.find((x) => x.value === unit).f[1]), units.find((x) => x.value === unit).f[0]));
/** Usable charge = capacity × (1 − safety), in mAh. */
export const usableMah = (v) => formatDecimal(div(mul(v.capacity, sub(ONE, v.safety)), dec("3.6")));
