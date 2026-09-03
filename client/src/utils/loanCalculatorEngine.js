// Loan Calculator engine — three independent calculation modes, matching
// calculator.net/loan-calculator.html:
//
//  1. Amortized Loan   — fixed periodic payments until the balance hits 0.
//  2. Deferred Payment  — a single lump sum due at maturity (no periodic
//     payments; interest just compounds against the principal).
//  3. Bond              — the reverse of #2: given a known face value due
//     at maturity, compute the present value received when the loan/bond
//     starts.
//
// All three share the same "Compound" frequency concept (how often
// interest capitalizes), and the Amortized calculator additionally has an
// independent "Pay Back" frequency (how often payments are made) — which
// can differ from the compounding frequency (e.g. compound monthly, pay
// biweekly). When they differ, a nominal per-compounding-period rate can't
// be used directly as the per-payment-period rate; the standard "general
// annuity" method is used instead: convert the nominal rate to an
// effective ANNUAL rate first (which is frequency-independent), then
// convert that effective annual rate to whatever rate corresponds to the
// payment frequency. This degenerates to the simple case when the two
// frequencies match. Verified against calculator.net's own worked
// examples (see loan-calculator.test.js) to the penny for all three modes.

export const COMPOUND_OPTIONS = [
  { value: "annually", label: "Annually (APY)", periodsPerYear: 1 },
  { value: "semiannually", label: "Semi-annually", periodsPerYear: 2 },
  { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
  { value: "monthly", label: "Monthly (APR)", periodsPerYear: 12 },
  { value: "semimonthly", label: "Semi-monthly", periodsPerYear: 24 },
  { value: "biweekly", label: "Biweekly", periodsPerYear: 26 },
  { value: "weekly", label: "Weekly", periodsPerYear: 52 },
  { value: "daily", label: "Daily", periodsPerYear: 365 },
  // No fixed periodsPerYear — continuous compounding uses e^(rt) directly.
  { value: "continuously", label: "Continuously", periodsPerYear: null },
];

export const PAYBACK_OPTIONS = [
  { value: "day", label: "Every Day", periodLabel: "Day", periodsPerYear: 365 },
  { value: "week", label: "Every Week", periodLabel: "Week", periodsPerYear: 52 },
  { value: "2weeks", label: "Every 2 Weeks", periodLabel: "2 Weeks", periodsPerYear: 26 },
  { value: "halfmonth", label: "Every Half Month", periodLabel: "Half Month", periodsPerYear: 24 },
  { value: "month", label: "Every Month", periodLabel: "Month", periodsPerYear: 12 },
  { value: "quarter", label: "Every Quarter", periodLabel: "Quarter", periodsPerYear: 4 },
  { value: "6months", label: "Every 6 Months", periodLabel: "6 Months", periodsPerYear: 2 },
  { value: "year", label: "Every Year", periodLabel: "Year", periodsPerYear: 1 },
];

export const DEFAULT_COMPOUND = "monthly";
export const DEFAULT_PAYBACK = "month";

const MAX_TERM_YEARS = 100;
const MAX_SCHEDULE_ROWS = 4000; // guards pathological inputs (e.g. daily payback over 100 years)

function findOption(list, value) {
  return list.find((o) => o.value === value) || list[0];
}

export function compoundPeriodsPerYear(compound) {
  return findOption(COMPOUND_OPTIONS, compound).periodsPerYear;
}

export function paybackPeriodsPerYear(payback) {
  return findOption(PAYBACK_OPTIONS, payback).periodsPerYear;
}

export function paybackPeriodLabel(payback) {
  return findOption(PAYBACK_OPTIONS, payback).periodLabel;
}

/** Converts a nominal annual rate (as a fraction, e.g. 0.06) compounded at
 * `compound`'s frequency into an effective ANNUAL rate — frequency-free,
 * so it can be re-expressed against any other period frequency. */
export function effectiveAnnualRate(nominalRate, compound) {
  const r = Math.max(0, Number(nominalRate) || 0);
  if (compound === "continuously") return Math.exp(r) - 1;
  const m = compoundPeriodsPerYear(compound) || 1;
  return Math.pow(1 + r / m, m) - 1;
}

/** Converts an effective annual rate into the equivalent rate for a period
 * that occurs `periodsPerYear` times a year. */
export function periodicRateFromEAR(ear, periodsPerYear) {
  if (periodsPerYear <= 0) return 0;
  return Math.pow(1 + ear, 1 / periodsPerYear) - 1;
}

export function termToYears(years, months) {
  return Math.max(0, Number(years) || 0) + Math.max(0, Number(months) || 0) / 12;
}

function clampTermYears(years) {
  return Math.min(MAX_TERM_YEARS, Math.max(0, years));
}

// ─────────────────────────────────────────────────────────────────
// 1. Amortized Loan
// ─────────────────────────────────────────────────────────────────

export function calculateAmortizedLoan({ loanAmount, years, months, annualRatePercent, compound, payback }) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const totalYears = clampTermYears(termToYears(years, months));
  const rate = Math.max(0, (Number(annualRatePercent) || 0) / 100);
  const p = paybackPeriodsPerYear(payback);

  const ear = effectiveAnnualRate(rate, compound);
  const periodicRate = periodicRateFromEAR(ear, p);
  const totalPayments = Math.max(1, Math.min(MAX_SCHEDULE_ROWS, Math.round(p * totalYears)));

  const payment = periodicRate > 0
    ? (principal * periodicRate) / (1 - Math.pow(1 + periodicRate, -totalPayments))
    : principal / totalPayments;

  const schedule = [];
  let balance = principal;
  for (let period = 1; period <= totalPayments; period++) {
    const interest = balance * periodicRate;
    let principalPaid = payment - interest;
    if (period === totalPayments || principalPaid > balance) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({ period, payment: principalPaid + interest, interest, principal: principalPaid, balance });
  }

  const totalOfPayments = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = totalOfPayments - principal;

  return {
    payment, totalPayments, totalOfPayments, totalInterest, schedule,
    periodicRate, periodsPerYear: p, periodLabel: paybackPeriodLabel(payback),
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. Deferred Payment Loan — single lump sum due at maturity
// ─────────────────────────────────────────────────────────────────

export function calculateDeferredLoan({ loanAmount, years, months, annualRatePercent, compound }) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const totalYears = clampTermYears(termToYears(years, months));
  const rate = Math.max(0, (Number(annualRatePercent) || 0) / 100);

  const amountDue = compound === "continuously"
    ? principal * Math.exp(rate * totalYears)
    : principal * Math.pow(1 + rate / (compoundPeriodsPerYear(compound) || 1), (compoundPeriodsPerYear(compound) || 1) * totalYears);

  const totalInterest = amountDue - principal;
  const schedule = buildCompoundingSchedule({ startBalance: principal, endBalance: amountDue, totalYears, rate, compound });

  return { amountDue, totalInterest, schedule };
}

// ─────────────────────────────────────────────────────────────────
// 3. Bond — reverse of #2: known face value at maturity, solve for the
//    present value received when the bond/loan starts.
// ─────────────────────────────────────────────────────────────────

export function calculateBond({ dueAmount, years, months, annualRatePercent, compound }) {
  const faceValue = Math.max(0, Number(dueAmount) || 0);
  const totalYears = clampTermYears(termToYears(years, months));
  const rate = Math.max(0, (Number(annualRatePercent) || 0) / 100);

  const amountReceived = compound === "continuously"
    ? faceValue * Math.exp(-rate * totalYears)
    : faceValue / Math.pow(1 + rate / (compoundPeriodsPerYear(compound) || 1), (compoundPeriodsPerYear(compound) || 1) * totalYears);

  const totalInterest = faceValue - amountReceived;
  const schedule = buildCompoundingSchedule({ startBalance: amountReceived, endBalance: faceValue, totalYears, rate, compound });

  return { amountReceived, totalInterest, schedule };
}

// Shared schedule builder for Deferred/Bond: pure compounding growth from
// startBalance to endBalance, no periodic payments. Rows use the
// compounding frequency itself (annual rows for "Continuously", since
// there's no natural discrete period to list there). The final row's
// balance is snapped to endBalance so the table always ties out exactly
// to the headline figure even if totalYears isn't a whole number of
// compounding periods.
function buildCompoundingSchedule({ startBalance, endBalance, totalYears, rate, compound }) {
  const m = compound === "continuously" ? 1 : (compoundPeriodsPerYear(compound) || 1);
  const totalPeriods = Math.max(1, Math.min(MAX_SCHEDULE_ROWS, Math.round(m * totalYears)));
  const periodicRate = compound === "continuously"
    ? Math.exp(rate / m) - 1
    : rate / m;

  const schedule = [];
  let balance = startBalance;
  for (let period = 1; period <= totalPeriods; period++) {
    const interest = period === totalPeriods ? endBalance - balance : balance * periodicRate;
    const newBalance = period === totalPeriods ? endBalance : balance + interest;
    schedule.push({ period, interest, balance: newBalance });
    balance = newBalance;
  }
  return schedule;
}

// ─────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
