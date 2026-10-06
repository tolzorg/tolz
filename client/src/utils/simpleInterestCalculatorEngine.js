// Simple Interest Calculator engine — matches calculator.net/simple-interest-calculator.html.
//
// Four solve-for tabs share one formula, End Balance = P × (1 + r × t):
//  - balance:   I = P × r × t,           B = P + I
//  - principal: P = B ÷ (1 + r × t),     I = B − P
//  - term:      t = (B ÷ P − 1) ÷ r      (always reported in years)
//  - rate:      r = (B ÷ P − 1) ÷ t      (always reported per year)
// Mixed units are converted the way the reference's own "Calculation steps"
// show it: a monthly rate over a term in years is "× t × 12", a yearly rate
// over a term in months is "× t ÷ 12".
//
// Rules below were all confirmed against the live reference via GET:
//  - The steps echo each input exactly as typed (trimmed, commas removed),
//    e.g. "$20000.50 × 3.50% × 010"; computed money uses "$-1,500.00" style.
//  - Negative or zero inputs are computed as entered, not rejected. Only
//    the term/rate tabs reject a zero principal ("non-zero" message); the
//    term tab refuses a 0% rate and the rate tab a 0 term with their own
//    one-line messages. A principal-tab denominator of exactly 0 makes the
//    reference print no result at all.
//  - The pie chart appears only when principal > 0 AND interest > 0. The bar
//    chart and schedule additionally need 2 < term < 100 (in the term's own
//    unit; the term tab uses its 2-decimal ROUNDED years).
//  - The term tab builds its schedule from the ROUNDED term, so its last row
//    can overshoot the target (16.67 yrs → $30,002.00, not $30,000.00).
//  - Schedule rows are whole periods plus one fractional final period whose
//    label is the term as typed ("5.50"); balance = P + perPeriodInterest × k, row interest = the
//    difference of cumulative interest (see buildGrowth).
//  - Bar labels: every `step`-th bar is labelled (index % step === 0), step
//    1 / 5 / 10 for floor(term) ≤ 10 / ≤ 30 / above — this is why a
//    fractional last bar is labelled at 19.2 years but not at 18.9.

import { formatMoney as formatRawMoney } from "./studentLoanCalculatorEngine.js";

/** Half-up to the cent after 15-digit pre-rounding, so a true …x.735 that
 * floats as …x.73499999 still rounds UP — confirmed live (Rate tab rows
 * landing exactly on a half cent show the reference rounding up). */
export function roundCents(value) {
  const cents = Math.round(Number((Math.abs(value) * 100).toPrecision(15)));
  return (Math.sign(value) * cents) / 100;
}

/** Reference-style money ("$1,234.56", "$-1,500.00"), half-up to the cent. */
export function formatMoney(value) {
  return formatRawMoney(roundCents(value));
}

export const DEFAULTS = { balance: "30000", principal: "20000", rate: "3", term: "10" };

export const RATE_BASE_OPTIONS = [
  { value: "y", label: "per year" },
  { value: "m", label: "per month" },
];
export const TERM_BASE_OPTIONS = [
  { value: "y", label: "years" },
  { value: "m", label: "months" },
];

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

/** Normalizes an input the way the reference echoes it: trimmed, commas removed. */
export function cleanInput(value) {
  return String(value ?? "").replace(/,/g, "").trim();
}

function toNumber(text) {
  if (!NUMERIC.test(text)) return NaN;
  const n = Number(text);
  return Number.isFinite(n) ? n : NaN;
}

/** "16.67", "1,666.67", "-5.00" — the reference's 2-decimal number style. */
export function formatFixed2(value) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MESSAGES = {
  balance: "Please provide a numerical end balance value.",
  principal: "Please provide a numerical principal value.",
  term: "Please provide a numerical term value.",
  rate: "Please provide a numerical rate value.",
  nonZeroPrincipal: "Please provide a non-zero principal value.",
  zeroRate: "We cannot calculate when rate is 0%.",
  zeroTerm: "We cannot calculate when term is 0.",
};

// Fields each tab reads, in the order the reference lists its errors
// (not form order: the Balance tab reports term BEFORE rate).
const TAB_INPUTS = {
  balance: ["principal", "term", "rate"],
  principal: ["balance", "term", "rate"],
  term: ["balance", "principal", "rate"],
  rate: ["balance", "principal", "term"],
};

export const TAB_FIELDS = {
  balance: { balance: false, principal: true, rate: true, term: true },
  principal: { balance: true, principal: false, rate: true, term: true },
  term: { balance: true, principal: true, rate: true, term: false },
  rate: { balance: true, principal: true, rate: false, term: true },
};

/** "× 10", "× 10 × 12" or "× 30 ÷ 12" — the term factor as the reference writes it. */
function termFactor(rateBase, termBase, termText) {
  if (rateBase === termBase) return { factor: 1, text: `${termText}` };
  if (rateBase === "m") return { factor: 12, text: `${termText} × 12` };
  return { factor: 1 / 12, text: `${termText} ÷ 12` };
}

/**
 * Bar/schedule data for a balance growing linearly from `principal`. Each
 * row's interest is the DIFFERENCE of cumulative interest, C(k) − C(k−1)
 * with C(k) = perPeriod × k — not perPeriod itself. Fitted against 162 live
 * rows: when perPeriod sits on a half cent, float noise in that difference
 * makes the reference occasionally show one row a cent lower
 * ($2,778.63 among $2,778.64s), and only this form reproduces it.
 */
function buildGrowth({ principal, perPeriod, term, lastLabel, unit }) {
  const whole = Math.floor(term);
  const cumulative = (k) => perPeriod * k;
  const row = (period, k, prevK) => ({
    period,
    interest: roundCents(cumulative(k) - cumulative(prevK)),
    balance: roundCents(principal + cumulative(k)),
  });
  const rows = [];
  for (let k = 1; k <= whole; k++) rows.push(row(k, k, k - 1));
  if (term > whole) rows.push(row(lastLabel, term, whole));

  const step = whole <= 10 ? 1 : whole <= 30 ? 5 : 10;
  const suffix = unit === "m" ? "mo" : "yr";
  const bars = [{ year: 0, startingAmount: principal, contributions: 0, interest: 0, total: principal }];
  rows.forEach((row) => {
    bars.push({ year: bars.length, startingAmount: principal, contributions: 0, interest: row.balance - principal, total: row.balance });
  });
  const tickLabels = bars.map((_, i) => {
    if (i % step !== 0) return null;
    const label = i === 0 ? 0 : rows[i - 1].period;
    return `${label} ${suffix}`;
  });

  return { schedule: rows, bars, tickLabels, unit };
}

/**
 * Solves one tab. Inputs are the raw field strings; rateBase/termBase are
 * "y" or "m". Returns { errors } | { message } | { empty: true } | a result.
 */
export function calculateSimpleInterest({ mode, balance, principal, rate, rateBase = "y", term, termBase = "y" }) {
  const text = {
    balance: cleanInput(balance), principal: cleanInput(principal),
    rate: cleanInput(rate), term: cleanInput(term),
  };
  const num = Object.fromEntries(Object.entries(text).map(([k, v]) => [k, toNumber(v)]));

  const errors = [];
  for (const field of TAB_INPUTS[mode]) {
    if (Number.isNaN(num[field])) errors.push(MESSAGES[field]);
    else if (field === "principal" && (mode === "term" || mode === "rate") && num.principal === 0) {
      errors.push(MESSAGES.nonZeroPrincipal);
    }
  }
  if (errors.length) return { errors };

  const $ = (key) => `$${text[key]}`;
  let P;
  let I;
  let headline;
  let steps;
  let growth = null;
  let scheduleTerm;

  if (mode === "balance" || mode === "principal") {
    const { factor, text: termText } = termFactor(rateBase, termBase, text.term);
    const rt = (num.rate / 100) * num.term * factor;
    if (mode === "balance") {
      P = num.principal;
      I = P * rt;
      const B = P + I;
      headline = [["End Balance:", formatMoney(B)], ["Total Interest:", formatMoney(I)]];
      steps = [
        ["Total Interest =", `${$("principal")} × ${text.rate}% × ${termText}`],
        ["=", formatMoney(I)],
        ["End Balance =", `${$("principal")} + ${formatMoney(I)}`],
        ["=", formatMoney(B)],
      ];
    } else {
      if (1 + rt === 0) return { empty: true };
      P = num.balance / (1 + rt);
      I = num.balance - P;
      headline = [["Principal:", formatMoney(P)], ["Total Interest:", formatMoney(I)]];
      steps = [
        ["Principal", `= ${$("balance")} ÷ (1 + ${text.rate}% × ${termText})`],
        ["", `= ${formatMoney(P)}`],
        ["Total Interest", `= ${$("balance")} - ${formatMoney(P)}`],
        ["", `= ${formatMoney(I)}`],
      ];
    }
    scheduleTerm = num.term;
    const r = num.rate / 100;
    const perPeriod = P * (rateBase === termBase ? r : rateBase === "m" ? r * 12 : r / 12);
    growth = { perPeriod, term: num.term, lastLabel: text.term, unit: termBase };
  } else if (mode === "term") {
    if (num.rate === 0) return { message: MESSAGES.zeroRate };
    const annualRate = (num.rate / 100) * (rateBase === "m" ? 12 : 1);
    const years = (num.balance / num.principal - 1) / annualRate;
    const shown = formatFixed2(years);
    P = num.principal;
    I = num.balance - P;
    headline = [["Terms:", `${shown} years`]];
    steps = [
      ["Term", `= (${$("balance")} ÷ ${$("principal")} - 1) ÷ ${rateBase === "m" ? `(${text.rate}% × 12)` : `${text.rate}%`}`],
      ["", `= ${shown} years`],
    ];
    scheduleTerm = Number(years.toFixed(2));
    growth = { perPeriod: P * annualRate, term: scheduleTerm, lastLabel: String(scheduleTerm), unit: "y" };
  } else {
    if (num.term === 0) return { message: MESSAGES.zeroTerm };
    const years = termBase === "m" ? num.term / 12 : num.term;
    const annualRate = (num.balance / num.principal - 1) / years;
    const shown = `${formatFixed2(annualRate * 100)}% per year`;
    P = num.principal;
    I = num.balance - P;
    headline = [["Rate:", shown]];
    steps = [
      ["Term", `= (${$("balance")} ÷ ${$("principal")} - 1) ÷ ${termBase === "m" ? `(${text.term} ÷ 12)` : text.term}`],
      ["", `= ${shown}`],
    ];
    scheduleTerm = num.term;
    growth = { perPeriod: P * (termBase === "m" ? annualRate / 12 : annualRate), term: num.term, lastLabel: text.term, unit: termBase };
  }

  const showPie = P > 0 && I > 0;
  const showSchedule = showPie && scheduleTerm > 2 && scheduleTerm < 100;

  return {
    mode,
    headline,
    steps,
    principal: P,
    interest: I,
    showPie,
    growth: showSchedule ? buildGrowth({ principal: P, ...growth }) : null,
  };
}
