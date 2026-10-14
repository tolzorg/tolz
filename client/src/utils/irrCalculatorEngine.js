// IRR Calculator engine — matches calculator.net/irr-calculator.html, which has
// two GET forms (decoded with live probes; see scripts/irr-calculator.test.js).
//
// 1. Fixed cash flow (ct=1): an initial investment, a holding time of
//    T = years + months/12, an ending balance at T, and an optional recurring
//    deposit or withdrawal. With f payments a year there are N = ⌊T·f⌋
//    payments at periods 1…N ("end of each period") or 0…N ("beginning",
//    N + 1 payments). The per-period rate i is solved, then annualised:
//    IRR = (1 + i)^f − 1. With no payment the IRR is the closed form
//    (ending ÷ initial)^(1/T) − 1.
// 2. Irregular cash flow (ct=2): an initial investment and up to 50 annual
//    cash flows (blank = 0); the investment length is the last non-blank year.
//
// Fixed-form solver, fitted to the reference (330/331 live cases): bisection on the
// future value at the last cash flow, starting from [−99.99%, 100%] per
// period and doubling the upper end until the sign changes; it stops once
// |FV| < 0.0001. Any overflow (NaN) or failure to get that close gives
// "Sorry! Your data is beyond the scope of what we can calculate!" — so very
// long schedules with large payments, or rates whose future values are
// astronomically large, are out of scope, as on the reference.
//
// The irregular form's own solver is unknown; the root nearest 0% (see
// solveNearestZero) matches about 93% of live cases exactly. The rest differ
// in the third decimal at IRRs above ~60%, in a few long mixed-sign
// schedules, and when a $0 initial investment is followed by $0 years (the
// reference then prints odd bracket midpoints such as 50,150%).

import { clean, num } from "./marginCalculatorEngine.js";

export const FIXED_DEFAULTS = {
  initial: "10000", years: "2", months: "6", ending: "15000",
  flowType: "w", amount: "100", frequency: "m", timing: "e",
};
export const IRREGULAR_YEARS = 50;
export const IRREGULAR_VISIBLE = 8;
export const IRREGULAR_DEFAULTS = {
  initial: "50000",
  flows: ["-10000", "30000", "50000", ...Array(IRREGULAR_YEARS - 3).fill("")],
};

export const FREQUENCIES = [
  { value: "a", label: "annually", perYear: 1 },
  { value: "sa", label: "semiannually", perYear: 2 },
  { value: "q", label: "quarterly", perYear: 4 },
  { value: "m", label: "monthly", perYear: 12 },
  { value: "sm", label: "semimonthly", perYear: 24 },
  { value: "bw", label: "biweekly", perYear: 26 },
  { value: "w", label: "weekly", perYear: 52 },
];

export const PIE_COLORS = ["#2b7ddb", "#8bbc21", "#910000"];
export const SORRY = "Sorry! Your data is beyond the scope of what we can calculate!";

/** Exact digits of a double, grouped, with `dp` decimals (half-up). */
export function formatNumber(value, dp) {
  const neg = value < 0;
  const abs = Math.abs(value);
  let text;
  if (abs >= 1e15) {
    // Past 15 digits the reference prints the double's exact digits.
    text = `${BigInt(Math.round(abs))}${dp ? `.${"0".repeat(dp)}` : ""}`;
  } else {
    const k = 10 ** dp;
    // A 15-digit pre-round fixes float noise like 1.005 → 1.00, but would eat
    // real digits once the scaled value reaches 15 digits itself.
    const scaled = abs * k >= 1e15 ? abs * k : Number((Number(abs.toPrecision(15)) * k).toPrecision(15));
    text = (Math.round(scaled) / k).toFixed(dp);
  }
  const [int, dec] = text.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const out = dec ? `${grouped}.${dec}` : grouped;
  return neg && /[1-9]/.test(out) ? `-${out}` : out;
}
const money = (v) => `$${formatNumber(v, 2)}`;
const pct3 = (v) => `${formatNumber(v, 3)}%`;

/** Per-period rate for flows [[t, amount], …], or null when out of scope. */
export function solvePeriodRate(flows) {
  const end = Math.max(...flows.map(([t]) => t));
  const fv = (i) => flows.reduce((s, [t, c]) => s + c * (1 + i) ** (end - t), 0);
  const lo = -0.9999;
  let hi = 1;
  const fLo = fv(lo);
  let fHi = fv(hi);
  if (Number.isNaN(fLo) || Number.isNaN(fHi)) return null;
  while (fLo * fHi > 0) {
    hi *= 2;
    if (hi > 1e6) return null;
    fHi = fv(hi);
    if (Number.isNaN(fHi)) return null;
  }
  let a = lo;
  let b = hi;
  const loSign = Math.sign(fLo);
  for (let k = 0; k < 100; k++) {
    const mid = (a + b) / 2;
    const f = fv(mid);
    if (Number.isNaN(f)) return null;
    if (Math.abs(f) < 1e-4) return mid;
    if (Math.sign(f) === loSign) a = mid; else b = mid;
  }
  return null;
}

/**
 * Annual rate for the irregular form: the root nearest 0% — bisect upward
 * when NPV(0) > 0, otherwise step down from 0% in 1-point steps to the first
 * sign change. All-zero flows are out of scope.
 */
export function solveNearestZero(flows) {
  if (flows.every(([, c]) => c === 0)) return null;
  const npv = (r) => flows.reduce((s, [t, c]) => s + c / (1 + r) ** t, 0);
  const bisect = (lo, hi) => {
    const loSign = Math.sign(npv(lo));
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (Math.sign(npv(mid)) === loSign) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const f0 = npv(0);
  if (f0 === 0) return 0;
  if (f0 > 0) {
    let hi = 1;
    while (npv(hi) > 0 && hi < 1e9) hi *= 2;
    return npv(hi) > 0 ? null : bisect(0, hi);
  }
  const floor = -0.9999;
  for (let r = 0; r > floor; r -= 0.01) {
    const next = Math.max(floor, r - 0.01);
    if (npv(next) >= 0) return bisect(next, r);
  }
  return null;
}

function pieFor(slices) {
  return slices.map(([label, value], k) => ({ label, value, color: PIE_COLORS[k], text: `$${formatNumber(value, 0)}` }));
}

export function calculateFixedIrr(input) {
  const errors = [];
  const read = (key, message, { allowBlank = false } = {}) => {
    const text = clean(input[key]);
    if (allowBlank && text === "") return 0;
    const n = num(text);
    if (!Number.isFinite(n) || n < 0) { errors.push(message); return NaN; }
    return n;
  };
  const deposit = input.flowType === "d";
  const iv = read("initial", "Please provide a positive initial investment.");
  const years = read("years", "Please provide a positive holding year.", { allowBlank: true });
  const months = read("months", "Please provide a positive holding month.", { allowBlank: true });
  const ending = read("ending", "Please provide a positive ending balance.");
  const amount = read("amount", `Please provide a positive ${deposit ? "deposit" : "withdraw"} amount.`);
  if (errors.length) return { errors };
  const T = years + months / 12;
  if (T <= 0) return { errors: ["Please provide a positive holding time."] };
  if (T > 1000) return { errors: ["This calculator can handle a holding period of up to 1,000 years only."] };

  const freq = FREQUENCIES.find((x) => x.value === input.frequency) || FREQUENCIES[3];
  const f = freq.perYear;
  const N = Math.floor(Number((T * f).toPrecision(12)));
  const begin = input.timing === "b";
  const count = amount > 0 ? (begin ? N + 1 : N) : 0;
  const cumulative = amount * count;
  const note = f === 26 || f === 52 ? "*The calculation assumes a 52-week year." : null;

  let irr;
  if (iv === 0) irr = null;
  else if (amount === 0) {
    const r = (ending / iv) ** (1 / T) - 1;
    irr = r > -1 && Number.isFinite(r) ? r : null;
  } else {
    const sign = deposit ? -1 : 1;
    const flows = [[0, -iv]];
    for (let k = begin ? 0 : 1; k <= N; k++) flows.push([k, sign * amount]);
    flows.push([T * f, ending]);
    const i = solvePeriodRate(flows);
    irr = i === null ? null : (1 + i) ** f - 1;
  }
  if (irr === null) return { sorry: SORRY };

  const totalReturn = deposit ? ending - iv - cumulative : ending + cumulative - iv;
  const base = deposit ? iv + cumulative : iv;
  const returnLabel = totalReturn < 0 ? "Total Loss" : "Total Return";
  const rows = [];
  if (cumulative > 0) rows.push([deposit ? "Cumulative Deposits:" : "Cumulative Withdrawals:", money(cumulative)]);
  rows.push([`${returnLabel}:`, money(Math.abs(totalReturn))]);
  rows.push(["Gross Return:", pct3((totalReturn / base) * 100)]);
  const slices = [["Initial Investment", iv]];
  if (deposit && cumulative > 0) slices.push(["Cumulative Deposits", cumulative]);
  slices.push([returnLabel, Math.abs(totalReturn)]);
  return {
    irr: pct3(irr * 100),
    rows,
    // The reference draws no chart when the total return is exactly zero.
    pie: totalReturn === 0 ? null : pieFor(slices),
    note,
  };
}

export function calculateIrregularIrr(input) {
  const errors = [];
  const ivText = clean(input.initial);
  const iv = num(ivText);
  if (!Number.isFinite(iv) || iv < 0) errors.push("Please provide a positive initial investment.");
  const flows = [];
  let last = 0;
  input.flows.forEach((raw, k) => {
    const text = clean(raw);
    if (text === "") { flows.push(0); return; }
    const n = num(text);
    if (!Number.isFinite(n)) { errors.push(`Please provide a valid number for year #${k + 1}.`); flows.push(0); return; }
    flows.push(n);
    last = k + 1;
  });
  if (last === 0) errors.push("Please provide some cash flow to calculate.");
  if (errors.length) return { errors };

  const used = flows.slice(0, last);
  const i = solveNearestZero([[0, -iv], ...used.map((c, k) => [k + 1, c])]);
  if (i === null) return { sorry: SORRY };

  const further = used.filter((c) => c < 0).reduce((s, c) => s - c, 0);
  const totalReturn = used.reduce((s, c) => s + c, 0) - iv;
  const returnLabel = totalReturn < 0 ? "Total Loss" : "Total Return";
  const rows = [];
  if (further > 0) rows.push(["Further Investments:", money(further)]);
  rows.push(["Investment Length:", `${last} ${last === 1 ? "year" : "years"}`]);
  rows.push([`${returnLabel}:`, money(Math.abs(totalReturn))]);
  rows.push(["Gross Return:", pct3((totalReturn / (iv + further)) * 100)]);
  const slices = [];
  if (iv > 0) slices.push(["Initial Investment", iv]);
  if (further > 0) slices.push(["Further Investments", further]);
  slices.push([returnLabel, Math.abs(totalReturn)]);
  return { irr: pct3(i * 100), rows, pie: totalReturn === 0 ? null : pieFor(slices), note: null };
}
