// Takt Time Calculator engine — matches omnicalculator.com/other/takt-time (its calculator definition was read from the
// page; behaviour checked against its screenshots and live, see scripts/takt-time-calculator.test.js).
//
//   Simple:  takt time = available production time / consumer demand
//   Batch:   takt time = available production time / (consumer demand / items per batch)       (per batch)
//   Weekly:  net production time = working days × (hours per day − (lunch break + other breaks))
//            takt time = net production time / weekly demand
// Times are in seconds internally (the reference's units: month 2,629,800 s, year 31,557,600 s). Like the reference,
// any box can be left blank and solved from the others; when more boxes are typed than needed, the ones typed most
// recently win (the CBM calculator's solver). The reference shows no validation messages; here a division by zero just
// leaves the box unsolved, and a negative net production time (breaks longer than the working hours) gets a warning.

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, add, sub, sign, isZero } from "./semesterGradeCalculatorEngine.js";
import { unitToSi, unitFromSi, solveByRecency } from "./cbmCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const sec = (n) => [dec(n), dec("1")];
const u = (value, label, short, seconds) => ({ value, label, short, f: sec(seconds) });
const pair = (value, label, short, parts, small, big, per) => ({ value, label, short, parts, f: sec(small), big: sec(big), per });

const SEC = u("sec", "seconds (sec)", "sec", "1");
const MIN = u("min", "minutes (min)", "min", "60");
const HRS = u("hrs", "hours (hrs)", "hrs", "3600");
const MIN_SEC = pair("minsec", "minutes / seconds (min / sec)", "min / sec", ["min", "sec"], "1", "60", 60);
const HRS_MIN = pair("hrsmin", "hours / minutes (hrs / min)", "hrs / min", ["hrs", "min"], "60", "3600", 60);

export const PERIOD_UNITS = [MIN, HRS];
export const SHORT_UNITS = [SEC, MIN, HRS, MIN_SEC, HRS_MIN];
export const DAY_UNITS = [
  SEC, MIN, HRS,
  u("days", "days (days)", "days", "86400"),
  u("wk", "weeks (wks)", "wks", "604800"),
  u("mos", "months (mos)", "mos", "2629800"),
  u("yrs", "years (yrs)", "yrs", "31557600"),
  MIN_SEC, HRS_MIN,
  pair("yrsmos", "years / months (yrs / mos)", "yrs / mos", ["yrs", "mos"], "2629800", "31557600", 12),
  pair("wkdays", "weeks / days (wks / days)", "wks / days", ["wks", "days"], "86400", "604800", 7),
  pair("dayshrs", "days / hours (days / hrs)", "days / hrs", ["days", "hrs"], "3600", "86400", 24),
];
const COUNT = [{ value: "", label: "", short: "", f: sec("1") }];

export const MODES = [
  { value: "simple", label: "Simple takt time" },
  { value: "batch", label: "Batch production takt time" },
  { value: "weekly", label: "Weekly takt time" },
];

const PRODUCTION_HELP = "Total available production time per period. Do not include non-production time such as lunch breaks.";
const TAKT_HELP = "Takt time tells you how fast one unit must be manufactured to meet demand.";
export const FIELDS = {
  itemsPerBatch: { label: "Items per batch", units: COUNT, unit: "", suffix: "" },
  netTime: { label: "Available production time", help: PRODUCTION_HELP, units: PERIOD_UNITS, unit: "hrs", suffix: "/period" },
  demand: { label: "Consumer demand", units: COUNT, unit: "", suffix: "units/period" },
  daysPerWeek: { label: "Working", units: COUNT, unit: "", suffix: "days/wk" },
  hoursPerDay: { label: "Hours per day", units: DAY_UNITS, unit: "hrs", suffix: "" },
  lunch: { label: "Lunch break", units: SHORT_UNITS, unit: "min", suffix: "" },
  otherBreaks: { label: "Other breaks", help: "This can include buffer time for shift changes, meetings, maintenance work or any other activities that are not directly part of production.", units: SHORT_UNITS, unit: "min", suffix: "" },
  weeklyNetTime: { label: "Net production time", help: "The total time that is available for production. Calculated as: (hours per day - breaks) * days per week.", units: SHORT_UNITS, unit: "hrsmin", suffix: "" },
  weeklyDemand: { label: "Weekly demand", help: "How many products are required per week?", units: COUNT, unit: "", suffix: "units/wk" },
  taktTime: { label: "Takt time", help: TAKT_HELP, units: SHORT_UNITS, unit: "min", suffix: "/unit" },
};
export const MODE_FIELDS = {
  simple: ["netTime", "demand", "taktTime"],
  batch: ["itemsPerBatch", "netTime", "demand", "taktTime"],
  weekly: ["daysPerWeek", "hoursPerDay", "lunch", "otherBreaks", "weeklyNetTime", "weeklyDemand", "taktTime"],
};
/** The takt time box's suffix and help per mode ("/batch" for batch production). */
export const taktFor = (mode) => (mode === "batch"
  ? { suffix: "/batch", help: "Takt time tells you how fast one batch must be manufactured to meet demand." }
  : { suffix: "/unit", help: TAKT_HELP });

const nonZero = (x) => (x && !isZero(x) ? x : null);
const EQUATIONS = {
  simple: [["taktTime", ["netTime", "demand"], "quotient"]],
  batch: [{
    // takt = net × items / demand
    vars: ["taktTime", "netTime", "itemsPerBatch", "demand"],
    solve: (k, v) => {
      if (k === "taktTime") return nonZero(v.demand) && div(mul(v.netTime, v.itemsPerBatch), v.demand);
      if (k === "demand") return nonZero(v.taktTime) && div(mul(v.netTime, v.itemsPerBatch), v.taktTime);
      if (k === "netTime") return nonZero(v.itemsPerBatch) && div(mul(v.taktTime, v.demand), v.itemsPerBatch);
      return nonZero(v.netTime) && div(mul(v.taktTime, v.demand), v.netTime); // items per batch
    },
  }],
  weekly: [
    {
      // net = days × (hours − lunch − other)
      vars: ["weeklyNetTime", "daysPerWeek", "hoursPerDay", "lunch", "otherBreaks"],
      solve: (k, v) => {
        const perDay = () => sub(sub(v.hoursPerDay, v.lunch), v.otherBreaks);
        if (k === "weeklyNetTime") return mul(v.daysPerWeek, perDay());
        if (k === "daysPerWeek") return nonZero(perDay()) && div(v.weeklyNetTime, perDay());
        if (!nonZero(v.daysPerWeek)) return null;
        const day = div(v.weeklyNetTime, v.daysPerWeek); // hours − lunch − other
        if (k === "hoursPerDay") return add(add(day, v.lunch), v.otherBreaks);
        if (k === "lunch") return sub(sub(v.hoursPerDay, day), v.otherBreaks);
        return sub(sub(v.hoursPerDay, day), v.lunch); // other breaks
      },
    },
    ["taktTime", ["weeklyNetTime", "weeklyDemand"], "quotient"],
  ],
};
const NEEDED = { simple: ["netTime", "demand"], batch: ["itemsPerBatch", "netTime", "demand"], weekly: ["daysPerWeek", "hoursPerDay", "lunch", "otherBreaks", "weeklyDemand"] };

/**
 * @param {"simple"|"batch"|"weekly"} mode
 * @param {Record<string, { unit: string, texts: string[] }>} fields
 * @param {string[]} order  typed boxes, least recent first (boxes the calculator filled in are left out).
 * @returns {{ missing: string[] } | { errors: string[] } | { display: Record<string, string[]>, solved: string[], warnings: string[] }}
 */
export function calculateTaktTime(mode, fields, order) {
  const keys = MODE_FIELDS[mode];
  const typed = order.filter((k) => keys.includes(k) && unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts) !== null);
  const parsed = {};
  const errors = [];
  for (const k of typed) {
    const x = unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts);
    if (x === false) errors.push(`Please enter a number for ${FIELDS[k].label.toLowerCase()}.`);
    else parsed[k] = x;
  }
  if (errors.length) return { errors };

  const { known, values: v } = solveByRecency(typed, parsed, EQUATIONS[mode]);
  if (!v.taktTime) {
    const missing = NEEDED[mode].filter((k) => !v[k]);
    return { missing: missing.length ? missing : ["taktTime"] };
  }
  const solved = keys.filter((k) => v[k] && !known[k]);
  const display = Object.fromEntries(keys.map((k) => [k, !v[k] ? [""] : known[k] ? fields[k].texts : unitFromSi(FIELDS[k].units, fields[k].unit, v[k])]));
  const warnings = mode === "weekly" && v.weeklyNetTime && sign(v.weeklyNetTime) < 0
    ? ["The breaks are longer than the working hours per day, so the net production time is negative."] : [];
  return { display, solved, warnings, taktSeconds: v.taktTime };
}

/** Takt time in a few readable forms for the result card. */
export const taktSummary = (seconds) => ({
  seconds: formatDecimal(seconds),
  minutes: formatDecimal(div(seconds, dec("60"))),
  perHour: isZero(seconds) ? null : formatDecimal(div(dec("3600"), seconds)),
});
