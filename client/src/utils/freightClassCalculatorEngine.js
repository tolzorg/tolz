// Freight Class Calculator engine — matches omnicalculator.com/other/freight-class (its calculator definition and custom
// JS were read from the page; behaviour checked live, see scripts/freight-class-calculator.test.js).
//
// density = mass / (length × width × height), then the NMFC class from the density in lb/ft³ (live: 1 m³ at 160 kg
// = 9.99 lb/ft³ → class 100): < 1 → 500, < 2 → 400, < 3 → 300, < 4 → 250, < 5 → 200, < 6 → 175, < 7 → 150,
// < 8 → 125, < 9 → 110, < 10 → 100, < 12 → 92.5, < 13 → 85, < 15 → 77.5, < 22 → 70, < 30 → 65, < 35 → 60,
// < 50 → 55, else 50.
// Total freight cost = freight rate (per unit of weight) × mass × number of pallets, solvable for the rate or the
// number of pallets from a typed cost (most recently typed boxes win; the untouched default of 1 pallet is kept).
// Rate and cost are shown with 2 decimals, as on the reference.
//
// Deviation (flagged to the user): one currency for the rate and the cost (the reference converts between currencies
// at fixed rates); the Currency Calculator does live conversions.

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign, round2, formatPlain } from "./semesterGradeCalculatorEngine.js";
import { LENGTH_UNITS, WEIGHT_UNITS, unitToSi, solveByRecency } from "./cbmCalculatorEngine.js";

const dec = (s) => decimalOf(s);
const ratio = (n, d = "1") => [dec(n), dec(d)];
const only = (list, values) => values.map((v) => list.find((u) => u.value === v));
export const FC_LENGTH_UNITS = only(LENGTH_UNITS, ["mm", "cm", "m", "in", "ft", "ftin", "mcm"]);
const STONE = { value: "stone", label: "stones (st)", short: "st", f: ratio("317514659", "50000000") };
const weights = only(WEIGHT_UNITS, ["g", "kg", "t", "oz", "lb", "usTon", "longTon"]);
export const FC_WEIGHT_UNITS = [...weights.slice(0, 5), STONE, ...weights.slice(5)];

/** The reference's currency list (codes only: the rate and the cost share one currency here). */
export const CURRENCIES = ["USD", "AED", "AFN", "ALL", "ANG", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BMD", "BND", "BOB", "BRL", "BSD",
  "BWP", "BZD", "CAD", "CHF", "CLP", "CNY", "COP", "CRC", "CUP", "CZK", "DKK", "DOP", "EGP", "ETB", "EUR", "FJD", "FKP", "GBP", "GGP", "GIP", "GTQ",
  "GYD", "HKD", "HNL", "HRK", "HUF", "IDR", "ILS", "IMP", "INR", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KGS", "KHR", "KRW", "KWD", "KYD", "KZT",
  "LAK", "LBP", "LKR", "LRD", "MAD", "MDL", "MKD", "MNT", "MUR", "MVR", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB",
  "PEN", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "SAR", "SBD", "SCR", "SEK", "SGD", "SHP", "SOS", "SRD", "SYP", "THB", "TRY", "TTD",
  "TVD", "TWD", "TZS", "UAH", "UYU", "UZS", "VND", "XAF", "XCD", "YER", "ZAR"];

export const FIELDS = {
  length: { label: "Length", units: FC_LENGTH_UNITS, unit: "m", message: "Length should be greater than zero." },
  width: { label: "Width", units: FC_LENGTH_UNITS, unit: "m", message: "Width should be greater than zero." },
  height: { label: "Height", units: FC_LENGTH_UNITS, unit: "m", message: "Height should be greater than zero." },
  mass: { label: "Mass", units: FC_WEIGHT_UNITS, unit: "kg", message: "Mass should be greater than zero." },
};
export const SPEC_KEYS = Object.keys(FIELDS);
const COST_MESSAGES = {
  pallets: "Number of pallets should be greater than zero.",
  rate: "Freight rate should be greater than zero.",
  cost: "Freight cost should be greater than zero.",
};

/** NMFC classes: [density below (lb/ft³), class]; 50 at 50 lb/ft³ and above. */
export const CLASSES = [[1, "500"], [2, "400"], [3, "300"], [4, "250"], [5, "200"], [6, "175"], [7, "150"], [8, "125"], [9, "110"],
  [10, "100"], [12, "92.5"], [13, "85"], [15, "77.5"], [22, "70"], [30, "65"], [35, "60"], [50, "55"]];
const LB_FT3 = ratio("5000000000", "312139803"); // kg/m³ in one lb/ft³ (the reference's ratio)

/** The freight class for a density in lb/ft³ (exact decimal). */
export function freightClass(densityLbFt3) {
  const hit = CLASSES.find(([below]) => sign({ n: densityLbFt3.n - BigInt(below) * 10n ** BigInt(densityLbFt3.s), s: densityLbFt3.s }) < 0);
  return hit ? hit[1] : "50";
}

const textOf = (t) => String(t ?? "").replace(/,/g, "").trim();
const money = (d) => formatPlain(round2(d)).replace(/^(-?\d[\d,]*)$/, "$1.00").replace(/\.(\d)$/, ".$10");

/**
 * @param {{ fields: Record<string, { unit: string, texts: string[] }>, pallets: string, rate: string, rateUnit: string,
 *   cost: string, order: string[], defaults: string[] }} input  `order`: typed cost boxes (pallets, rate, cost), least recent
 *   first; `defaults`: untouched default boxes (["pallets"] until the user edits it).
 * @returns {{ missing: string[] } | { errors: string[] } | { freightClass: string, densityKgM3: string, densityLbFt3: string,
 *   cost: null | { pallets: string, rate: string, cost: string, solved: string[] } }}
 */
export function calculateFreightClass({ fields, pallets, rate, rateUnit, cost, order = [], defaults = [] }) {
  const si = {};
  const missing = [];
  const errors = [];
  for (const k of SPEC_KEYS) {
    const v = unitToSi(FIELDS[k].units, fields[k].unit, fields[k].texts);
    if (v === null) missing.push(k);
    else if (v === false || sign(v) <= 0) errors.push(FIELDS[k].message);
    else si[k] = v;
  }
  if (missing.length) return { missing };

  // Cost boxes: typed ones (pallets, rate, cost) are validated even when the result doesn't need them.
  const texts = { pallets, rate, cost };
  const parsed = {};
  for (const k of ["pallets", "rate", "cost"]) {
    const t = textOf(texts[k]);
    if (t === "") continue;
    const d = dec(t);
    if (!d || sign(d) <= 0) errors.push(COST_MESSAGES[k]);
    else parsed[k] = d;
  }
  if (errors.length) return { errors };

  const density = div(si.mass, mul(mul(si.length, si.width), si.height)); // kg/m³
  const lbFt3 = div(mul(density, LB_FT3[1]), LB_FT3[0]);
  const result = { freightClass: freightClass(lbFt3), densityKgM3: formatDecimal(density), densityLbFt3: formatDecimal(lbFt3), cost: null };

  // cost = rate per kg × mass (kg) × pallets; the rate is typed per `rateUnit`.
  const unit = FC_WEIGHT_UNITS.find((u) => u.value === rateUnit) || FC_WEIGHT_UNITS[1];
  const known = { ...parsed };
  if (known.rate) known.rate = div(mul(known.rate, unit.f[1]), unit.f[0]); // per kg
  const typed = [...order.filter((k) => known[k] && !defaults.includes(k)), ...defaults.filter((k) => known[k])];
  const { known: kept, values: v } = solveByRecency([...typed, "mass"], { ...known, mass: si.mass }, [["cost", ["rate", "mass", "pallets"], "product"]]);
  if (v.rate && v.pallets && v.cost) {
    const ratePerUnit = div(mul(v.rate, unit.f[0]), unit.f[1]);
    result.cost = {
      pallets: kept.pallets ? textOf(pallets) : formatDecimal(v.pallets),
      rate: money(ratePerUnit),
      cost: money(v.cost),
      solved: ["pallets", "rate", "cost"].filter((k) => !kept[k]),
    };
  }
  return result;
}
