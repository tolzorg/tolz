// Reorder Point Calculator engine — matches omnicalculator.com/other/reorder-point (its calculator definition was read
// from the page; behaviour checked live, see scripts/reorder-point-calculator.test.js).
//
//   reorder point = (lead time + safety stock + basic stock) × unit sales per day
// Times convert to days (hour = 1/24, week = 7, month = 30.4375, year = 365.25 days — the reference's seconds) and unit
// sales per period to per day (per 3 months = 91.3125 days, per half year = 182.625 days). Any one of the five boxes
// can be left blank and is solved from the others; when all five are typed, the four typed most recently are kept
// (live: the reference recalculates the remaining one). Messages as on the reference: times ≥ 0, unit sales > 0,
// reorder point ≥ 0; a typed value breaking them is an error, a solved one is shown with the message (live:
// basic stock -7 days).

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign, sub, add, isZero } from "./semesterGradeCalculatorEngine.js";
import { unitToSi, unitFromSi } from "./cbmCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const time = (value, label, short, days) => ({ value, label, short, f: [dec(days), dec("1")] });
const per = (value, label, short, days) => ({ value, label, short: `/ ${short}`, f: [dec("1"), dec(days)] });

export const STOCK_UNITS = [
  { value: "hrs", label: "hours (hrs)", short: "hrs", f: [dec("1"), dec("24")] },
  time("days", "days (days)", "days", "1"),
  time("wk", "weeks (wks)", "wks", "7"),
  time("mos", "months (mos)", "mos", "30.4375"),
  time("yrs", "years (yrs)", "yrs", "365.25"),
];
export const LEAD_UNITS = STOCK_UNITS.slice(1);
export const SALES_UNITS = [
  per("day", "day (day)", "day", "1"),
  per("wk", "week (wk)", "wk", "7"),
  per("mo", "month (mo)", "mo", "30.4375"),
  per("3mo", "three months (3 mos)", "3 mos", "91.3125"),
  per("6mo", "half a year (half yr)", "half yr", "182.625"),
  per("yr", "year (yr)", "yr", "365.25"),
];
const ITEMS = [{ value: "items", label: "items", short: "items", f: [dec("1"), dec("1")] }];

export const FIELDS = {
  basicStock: { label: "Basic stock", help: "Regular inventory in days' worth.", units: STOCK_UNITS, unit: "days", message: "Basic stock must be greater than or equal to 0." },
  safetyStock: { label: "Safety stock", help: "Extra inventory in case of emergency.", units: STOCK_UNITS, unit: "days", message: "Safety stock must be greater than or equal to 0." },
  leadTime: { label: "Lead time", help: "Period between buying a product and its final delivery.", units: LEAD_UNITS, unit: "days", message: "Lead time must be greater than or equal to 0." },
  unitSales: { label: "Unit sales", help: "Average number of products sold per day.", units: SALES_UNITS, unit: "day", message: "Unit sales per day must be greater than 0." },
  reorderPoint: { label: "Reorder point", help: "You should reorder if you have exactly this number of items.", units: ITEMS, unit: "items", message: "Reorder point cannot be negative." },
};
export const FIELD_KEYS = Object.keys(FIELDS);
const TIMES = ["basicStock", "safetyStock", "leadTime"];
const invalid = (k, v) => (k === "unitSales" ? sign(v) <= 0 : sign(v) < 0);

/**
 * @param {Record<string, { unit: string, texts: string[] }>} fields
 * @param {string[]} order  typed boxes, least recent first (boxes the calculator filled in are left out).
 * @returns {{ missing: string[] } | { errors: string[] } | { display: Record<string, string[]>, solved: string, warnings: string[],
 *   reorderPoint: string }}
 */
export function calculateReorderPoint(fields, order) {
  const typed = order.filter((k) => unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts) !== null);
  const errors = [];
  const v = {};
  for (const k of typed) {
    const x = unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts);
    if (x === false || invalid(k, x)) errors.push(FIELDS[k].message);
    else v[k] = x;
  }
  if (errors.length) return { errors };
  if (typed.length < 4) return { missing: FIELD_KEYS.filter((k) => k !== "reorderPoint" && !v[k]) };

  const keep = typed.slice(-4); // the four most recent
  const unknown = FIELD_KEYS.find((k) => !keep.includes(k));
  const known = Object.fromEntries(keep.map((k) => [k, v[k]]));
  let x;
  if (unknown === "reorderPoint") {
    x = mul(TIMES.reduce((a, k) => add(a, known[k]), { n: 0n, s: 0 }), known.unitSales);
  } else if (unknown === "unitSales") {
    const days = TIMES.reduce((a, k) => add(a, known[k]), { n: 0n, s: 0 });
    if (isZero(days)) return { errors: ["The lead time, safety stock and basic stock add up to 0, so the unit sales can't be calculated."] };
    x = div(known.reorderPoint, days);
  } else {
    x = TIMES.filter((k) => k !== unknown).reduce((a, k) => sub(a, known[k]), div(known.reorderPoint, known.unitSales));
  }
  const all = { ...known, [unknown]: x };
  const display = Object.fromEntries(FIELD_KEYS.map((k) => [k, k === unknown ? unitFromSi(FIELDS[k].units, fields[k].unit, x) : fields[k].texts]));
  return {
    display, solved: unknown,
    warnings: invalid(unknown, x) ? [FIELDS[unknown].message] : [],
    reorderPoint: unknown === "reorderPoint" ? display.reorderPoint[0] : formatDecimal(all.reorderPoint),
  };
}
