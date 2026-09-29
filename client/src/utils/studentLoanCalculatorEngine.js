// Student Loan Calculator engine — matches calculator.net/student-loan-calculator.html.
//
// Three independent sub-calculators on one page, all monthly (r = APR/1200):
//
// 1. Simple Student Loan Calculator — "provide any three values": Loan
//    Balance, Remaining Term (years), Interest Rate, Monthly Payment. The
//    one missing (or invalid) value is solved for; when all four are valid,
//    the payment is ignored and re-solved from the other three (with an
//    explanatory note). Validity, confirmed live: balance/term/payment > 0,
//    0 < rate < 99 (99 itself is rejected, 98.99 accepted). An invalid
//    value is treated exactly like a blank one — it becomes the unknown.
//    Totals are always payment × n with n = FRACTIONAL months (e.g. 10.33
//    years → 123.96 months), not a rounded schedule. Solving the term
//    shows n rounded UP to whole months ("10 years and 1 month" for
//    n = 120.0005), while the total still uses the exact fractional n.
//
// 2. Student Loan Repayment Calculator — month-by-month simulation of the
//    original schedule vs. paying extra (per month / annually at month 12,
//    24, … / one-time), or paying the balance off altogether. The one-time
//    extra is paid WITH THE FIRST MONTH'S payment (after that month's
//    interest), not before it — confirmed by fitting months 1–12 against
//    the reference's own totals; only month 1 matches to the cent.
//
// 3. Student Loan Projection Calculator — while in school, the current
//    balance compounds monthly and 1/12 of the annual borrowing is added
//    at the END of each month (closed-form ordinary annuity with a
//    fractional month count, e.g. 1.3 years = 15.6 months — confirmed
//    exact against 1.3/1.33/2/2.5-year scenarios; every alternative timing
//    convention was off). Then the balance compounds through the grace
//    period and is amortized over the loan term. If interest is paid
//    during school, the balance stays at the amount borrowed and that
//    in-school interest is NOT counted in Total Interest.

import { formatCurrency } from "./loanCalculatorEngine.js";

export { formatCurrency };

// Hard cap on simulated months, far beyond any real loan, so a payment
// only barely above the monthly interest can't lock up the page.
const MAX_SIM_MONTHS = 1_200_000;
const EPS = 1e-9;

export const SIMPLE_DEFAULTS = { balance: "30000", term: "10", rate: "6.8", payment: "" };
export const REPAYMENT_DEFAULTS = { balance: "30000", payment: "350", rate: "6.8", extraMonthly: "150", extraYearly: "0", extraOneTime: "0" };
export const PROJECTION_DEFAULTS = { yearsToGraduate: "2", annualAmount: "10000", currentBalance: "20000", loanTerm: "10", gracePeriod: "6", rate: "6.8" };

/** Parses a user-typed number, tolerating thousands separators. Returns NaN for blank/invalid input. */
export function parseNumber(value) {
  const s = String(value ?? "").replace(/,/g, "").trim();
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/** The reference prints negative money as "$-1,035.10" (sign after the $). */
export function formatMoney(value, options) {
  return value < 0 ? `$-${formatCurrency(-value, options).slice(1)}` : formatCurrency(value, options);
}

export function formatRate(value) {
  return `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/** Whole months → "9 years and 10 months", "1 year", "1 month". */
export function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0 || years === 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  return parts.join(" and ");
}

function annuityPayment(principal, r, n) {
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// ═══════════════════════════════════════════════════════════════════
// 1. Simple Student Loan Calculator
// ═══════════════════════════════════════════════════════════════════

/** Solves the monthly rate for a given balance/payment/n by bisection (payment × n > balance guaranteed by caller). */
function solveMonthlyRate(balance, payment, n) {
  // The annuity payment grows with r and always stays below balance·r + balance/n,
  // so r = payment/balance is a safe upper bracket (payment ≥ balance·r there).
  let lo = 0;
  let hi = payment / balance;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (annuityPayment(balance, mid, n) > payment) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export function calculateSimple({ balance, term, rate, payment }) {
  const P = parseNumber(balance);
  const T = parseNumber(term);
  const R = parseNumber(rate);
  const M = parseNumber(payment);
  const valid = {
    balance: P > 0,
    term: T > 0,
    rate: R > 0 && R < 99,
    payment: M > 0,
  };
  const validCount = Object.values(valid).filter(Boolean).length;
  if (validCount < 3) return { error: "Please provide at least 3 positive values." };

  // All four given → the payment is re-derived from the other three.
  const solveFor = validCount === 4 ? "payment" : Object.keys(valid).find((k) => !valid[k]);
  const basedOnNote = validCount === 4;

  if (solveFor === "payment") {
    const n = T * 12;
    const r = R / 1200;
    const pmt = annuityPayment(P, r, n);
    const totalPayments = pmt * n;
    return { solveFor, basedOnNote, payment: pmt, principal: P, totalPayments, totalInterest: totalPayments - P };
  }

  if (solveFor === "term") {
    const r = R / 1200;
    if (M <= P * r) return { message: `The loan won't be paid off with payment of $${M} per month.` };
    const n = -Math.log(1 - (P * r) / M) / Math.log(1 + r);
    const totalPayments = M * n;
    return {
      solveFor, basedOnNote, months: Math.ceil(n - EPS), principal: P,
      totalPayments, totalInterest: totalPayments - P,
    };
  }

  if (solveFor === "rate") {
    const n = T * 12;
    const totalPayments = M * n;
    const diff = totalPayments - P;
    if (Math.abs(diff) < EPS) return { message: "The interest rate is 0%!" };
    if (diff < 0) return { message: "The interest rate is negative, which is unlikely." };
    const annualRate = solveMonthlyRate(P, M, n) * 1200;
    return { solveFor, basedOnNote, rate: annualRate, principal: P, totalPayments, totalInterest: diff };
  }

  // solveFor === "balance"
  const n = T * 12;
  const r = R / 1200;
  const pv = (M * (1 - Math.pow(1 + r, -n))) / r;
  const totalPayments = M * n;
  return { solveFor, basedOnNote, balance: pv, principal: pv, totalPayments, totalInterest: totalPayments - pv };
}

// ═══════════════════════════════════════════════════════════════════
// 2. Student Loan Repayment Calculator
// ═══════════════════════════════════════════════════════════════════

/** Month-by-month payoff. Returns null if it doesn't finish within MAX_SIM_MONTHS. */
function simulatePayoff(balance, payment, r, { monthly = 0, yearly = 0, oneTime = 0 } = {}) {
  let bal = balance;
  let totalPaid = 0;
  let months = 0;
  while (bal > EPS) {
    if (months >= MAX_SIM_MONTHS) return null;
    months++;
    const interest = bal * r;
    let pay = payment + monthly + (months % 12 === 0 ? yearly : 0) + (months === 1 ? oneTime : 0);
    if (pay >= bal + interest) pay = bal + interest;
    bal = bal + interest - pay;
    totalPaid += pay;
  }
  return { months, totalPayments: totalPaid, totalInterest: totalPaid - balance };
}

function extraPhrase({ monthly, yearly, oneTime }) {
  const parts = [];
  if (monthly > 0) parts.push(`${formatCurrency(monthly)} per month`);
  if (yearly > 0) parts.push(`${formatCurrency(yearly)} annually at the year end`);
  if (oneTime > 0) parts.push(`${formatCurrency(oneTime)} now`);
  // The reference leaves this blank ("By paying an extra , the loan…") when
  // every extra is $0; "$0.00" keeps the sentence readable instead.
  return parts.length ? parts.join(" and ") : formatCurrency(0);
}

/** option: "together" | "extra" | "original" */
export function calculateRepayment({ balance, payment, rate, option, extraMonthly, extraYearly, extraOneTime }) {
  const P = parseNumber(balance);
  const M = parseNumber(payment);
  const R = parseNumber(rate);
  const errors = [];
  if (!(P > 0)) errors.push("Please provide a positive loan balance.");
  if (!(M >= 0)) errors.push("Please provide a positive monthly payment.");
  if (Number.isNaN(R)) errors.push("Please provide a numerical interest rate value.");

  let extras = { monthly: 0, yearly: 0, oneTime: 0 };
  if (option === "extra") {
    extras = { monthly: parseNumber(extraMonthly), yearly: parseNumber(extraYearly), oneTime: parseNumber(extraOneTime) };
    if (!(extras.monthly >= 0)) errors.push("Please provide a positive extra payment per month.");
    if (!(extras.yearly >= 0)) errors.push("Please provide a positive extra payment per year.");
    if (!(extras.oneTime >= 0)) errors.push("Please provide a positive extra one time payment.");
  }
  if (errors.length) return { errors };

  const r = R / 1200;
  const cannotPayOff = { message: `You cannot pay off the loan with monthly payment of ${formatCurrency(M)}. Please check.` };
  if (M <= P * r) return cannotPayOff;

  const original = simulatePayoff(P, M, r);
  if (!original) return cannotPayOff;

  if (option === "together") {
    return { option, balance: P, savings: original.totalInterest, original };
  }
  if (option === "original") {
    return { option, headline: formatDuration(original.months), original };
  }

  const withExtra = simulatePayoff(P, M, r, extras);
  if (!withExtra) return cannotPayOff;
  const monthsSaved = original.months - withExtra.months;
  return {
    option,
    headline: formatDuration(withExtra.months),
    extraPhrase: extraPhrase(extras),
    monthsSaved,
    savings: original.totalInterest - withExtra.totalInterest,
    withExtra,
    original,
  };
}

// ═══════════════════════════════════════════════════════════════════
// 3. Student Loan Projection Calculator
// ═══════════════════════════════════════════════════════════════════

export function calculateProjection({ yearsToGraduate, annualAmount, currentBalance, loanTerm, gracePeriod, rate, payInterestInSchool }) {
  const Y = parseNumber(yearsToGraduate);
  const A = parseNumber(annualAmount);
  const B = parseNumber(currentBalance);
  const T = parseNumber(loanTerm);
  const G = parseNumber(gracePeriod);
  const R = parseNumber(rate);
  const errors = [];
  if (!(Y >= 0)) errors.push("Please provide a positive years to graduate.");
  if (!(A >= 0)) errors.push("Please provide a positive amount to borrow per year value.");
  if (!(B >= 0)) errors.push("Please provide a positive current balance.");
  if (!(T > 0)) errors.push("Please provide a positive loan term.");
  if (!(G >= 0)) errors.push("Please provide a positive grace period.");
  if (Number.isNaN(R)) errors.push("Please provide a numerical interest rate value.");
  if (errors.length) return { errors };

  const r = R / 1200;
  const schoolMonths = Y * 12;
  const amountBorrowed = B + A * Y;
  const n = T * 12;

  let principal = amountBorrowed;
  let balanceAfterGraduation = null;
  let balanceAfterGrace = null;
  if (!payInterestInSchool && r !== 0) {
    const growth = Math.pow(1 + r, schoolMonths);
    balanceAfterGraduation = B * growth + ((A / 12) * (growth - 1)) / r;
    principal = balanceAfterGraduation;
    if (G > 0) {
      balanceAfterGrace = balanceAfterGraduation * Math.pow(1 + r, G);
      principal = balanceAfterGrace;
    }
  }

  const payment = annuityPayment(principal, r, n);
  const totalInterest = payment * n - amountBorrowed;
  return { payment, amountBorrowed, balanceAfterGraduation, balanceAfterGrace, totalInterest };
}
