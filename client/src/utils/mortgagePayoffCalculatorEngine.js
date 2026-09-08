// Mortgage Payoff Calculator engine — matches
// calculator.net/mortgage-payoff-calculator.html, which is actually TWO
// calculators on one page:
//
//   1. "If you know the remaining loan term" (calculateFromRemainingTerm)
//      — derives the current payoff balance and standard payment from
//      the ORIGINAL loan's amount/term/rate plus how much term is left,
//      then offers 4 repayment options.
//   2. "If you don't know the remaining loan term" (calculateFromBalance)
//      — starts directly from a known unpaid balance + monthly payment
//      (no "original loan" derivation needed), offering 3 of the same 4
//      options (no "Payback altogether" — the unpaid balance already IS
//      that number).
//
// Every formula below was verified EXACT against the live reference
// (plain GET requests — this page's form is GET-based and computes
// server-side, same technique as the Finance Calculator) across all 4
// repayment options, combined extra-payment types, and both
// calculators. See mortgage-payoff-calculator-notes.md for the full
// worked verification.

import { calculateMonthlyPI, formatYearsAndMonths } from "./mortgageCalculatorEngine.js";

export { formatYearsAndMonths };

const MAX_MONTHS = 1200; // 100-year guard against pathological inputs

// ─────────────────────────────────────────────────────────────────
// Core month-by-month payoff simulation, shared by every repayment
// option on both calculators. `paymentForMonth(month)` returns that
// month's total payment (1-indexed); the loop clamps the final payment
// down to whatever's left so the balance never goes negative — the
// exact convention confirmed against the reference's own numbers to
// the CENT across every scenario tested (extra monthly/yearly/one-time,
// biweekly, and the plain "no extra payments" case), using full float
// precision throughout and rounding only for display.
// ─────────────────────────────────────────────────────────────────

function simulatePayoff({ balance, monthlyRate, paymentForMonth }) {
  let bal = Math.max(0, balance);
  let month = 0;
  let totalPayments = 0;
  let totalInterest = 0;
  const schedule = [];

  while (bal > 0.005 && month < MAX_MONTHS) {
    month++;
    let payment = paymentForMonth(month);
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal > bal) {
      principal = bal;
      payment = bal + interest;
    }
    bal = Math.max(0, bal - principal);
    totalInterest += interest;
    totalPayments += payment;
    schedule.push({ period: month, payment, interest, principal, balance: bal });
  }

  return { months: month, totalPayments, totalInterest, schedule };
}

function fixedPaymentFn(payment) {
  return () => payment;
}

/** Extra monthly + a lump sum once a year (at the END of each 12-month
 * cycle — confirmed live via the reference's own wording, "annually at
 * the year end") + a one-time lump sum applied immediately (month 1).
 * All three combine additively when more than one is set. */
function extraPaymentFn(basePayment, { extraMonthly = 0, extraYearly = 0, extraOneTime = 0 }) {
  return (month) => {
    let extra = extraMonthly;
    if (month === 1) extra += extraOneTime;
    if (month % 12 === 0) extra += extraYearly;
    return basePayment + extra;
  };
}

/** Biweekly = half the normal payment every 2 weeks. Modeled on a
 * MONTHLY grid (confirmed against the reference's own per-period data,
 * NOT the different true-26-periods-per-year convention this app's
 * Mortgage Calculator uses for ITS OWN biweekly feature — the two
 * calculator.net pages implement this differently): every month gets 2
 * half-payments, except every 6th month, which gets 3 (26 payments/year
 * spread as 2 "bonus" months per 12-month cycle) — verified exact by
 * finding every 3-payment month in the reference's own raw schedule
 * data and confirming it matches `month % 6 === 0` precisely. */
function biweeklyPaymentFn(basePayment) {
  const half = basePayment / 2;
  return (month) => half * (month % 6 === 0 ? 3 : 2);
}

function buildPaymentFn(basePayment, payoffOption, extras) {
  if (payoffOption === "biweekly") return biweeklyPaymentFn(basePayment);
  if (payoffOption === "extra") return extraPaymentFn(basePayment, extras);
  return fixedPaymentFn(basePayment);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1 — "If you know the remaining loan term"
// ─────────────────────────────────────────────────────────────────

export function calculateFromRemainingTerm({
  loanAmount, loanTermYears, annualRatePercent, remainingYears, remainingMonths,
  payoffOption, extraMonthly = 0, extraYearly = 0, extraOneTime = 0,
}) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const originalTermMonths = Math.max(1, Math.round((Number(loanTermYears) || 0) * 12));
  const monthlyRate = Math.max(0, Number(annualRatePercent) || 0) / 100 / 12;
  const remainingTotalMonths = Math.max(0, Math.min(originalTermMonths,
    Math.round((Number(remainingYears) || 0) * 12 + (Number(remainingMonths) || 0))));
  const elapsedMonths = Math.max(0, originalTermMonths - remainingTotalMonths);

  const basePayment = calculateMonthlyPI(principal, annualRatePercent, originalTermMonths / 12);

  // Current payoff balance: the standard remaining-balance formula,
  // i.e. simulating `elapsedMonths` of normal payments from `principal`
  // — computed in closed form (not iteratively) so it's exact even for
  // very long terms. Verified exact: $400,000/30yr/6%, 5 years elapsed
  // → $372,217.43.
  const factor = monthlyRate === 0 ? 1 : Math.pow(1 + monthlyRate, elapsedMonths);
  const balance = monthlyRate === 0
    ? Math.max(0, principal - basePayment * elapsedMonths)
    : principal * factor - basePayment * ((factor - 1) / monthlyRate);

  const originalTotalPayments = basePayment * originalTermMonths;
  const originalTotalInterest = originalTotalPayments - principal;
  const remainingTotalPayments = basePayment * remainingTotalMonths;
  const remainingTotalInterest = remainingTotalPayments - balance;
  const paidSoFar = basePayment * elapsedMonths;
  const interestPaidSoFar = paidSoFar - (principal - balance);

  // The full original-term schedule, needed for the chart's "Old
  // Balance"/"Old Interest" (or, on the together/original modes, its
  // only) lines regardless of which repayment option is selected.
  const oldSim = simulatePayoff({ balance: principal, monthlyRate, paymentForMonth: fixedPaymentFn(basePayment) });

  const common = {
    payoffOption, monthlyPay: basePayment, balance,
    originalTermMonths, remainingTotalMonths, elapsedMonths,
    originalTotalPayments, originalTotalInterest,
    remainingTotalPayments, remainingTotalInterest,
    oldSchedule: oldSim.schedule,
  };

  if (payoffOption === "together") {
    const totalIfPayoff = paidSoFar + balance;
    return { mode: "together", ...common, totalIfPayoff, totalInterestIfPayoff: totalIfPayoff - principal };
  }
  if (payoffOption === "original") {
    return { mode: "original", ...common };
  }

  // "extra" / "biweekly": simulate the NEW schedule starting from the
  // current balance (the OLD full-original-term schedule for the
  // 2-line vs. 4-line chart is already in `common.oldSchedule`).
  const paymentFn = buildPaymentFn(basePayment, payoffOption, { extraMonthly, extraYearly, extraOneTime });
  const sim = simulatePayoff({ balance, monthlyRate, paymentForMonth: paymentFn });

  return {
    mode: payoffOption, ...common,
    biweeklyPayment: basePayment / 2,
    newMonthlyPay: basePayment + extraMonthly,
    showMonthlyPayRow: payoffOption === "extra" && extraYearly === 0 && extraOneTime === 0,
    newMonths: sim.months,
    newTotalPayments: paidSoFar + sim.totalPayments,
    newTotalInterest: interestPaidSoFar + sim.totalInterest,
    newRemainingPayments: sim.totalPayments,
    newRemainingInterest: sim.totalInterest,
    newSchedule: sim.schedule,
    elapsedMonths,
  };
}

// ─────────────────────────────────────────────────────────────────
// Calculator 2 — "If you don't know the remaining loan term"
// ─────────────────────────────────────────────────────────────────

export function calculateFromBalance({
  unpaidPrincipal, monthlyPayment, annualRatePercent,
  payoffOption, extraMonthly = 0, extraYearly = 0, extraOneTime = 0,
}) {
  const balance = Math.max(0, Number(unpaidPrincipal) || 0);
  const basePayment = Math.max(0, Number(monthlyPayment) || 0);
  const monthlyRate = Math.max(0, Number(annualRatePercent) || 0) / 100 / 12;

  // No "original loan" to derive a lifetime total from here — the
  // baseline ("Original") IS just this balance paid off normally at
  // the given payment, simulated the same way as every other mode.
  const baseSim = simulatePayoff({ balance, monthlyRate, paymentForMonth: fixedPaymentFn(basePayment) });

  const common = {
    payoffOption, monthlyPay: basePayment, balance,
    remainingTotalMonths: baseSim.months,
    remainingTotalPayments: baseSim.totalPayments,
    remainingTotalInterest: baseSim.totalInterest,
  };

  if (payoffOption === "original") {
    return { mode: "original", ...common, oldSchedule: baseSim.schedule };
  }

  const paymentFn = buildPaymentFn(basePayment, payoffOption, { extraMonthly, extraYearly, extraOneTime });
  const sim = simulatePayoff({ balance, monthlyRate, paymentForMonth: paymentFn });

  return {
    mode: payoffOption, ...common,
    biweeklyPayment: basePayment / 2,
    newMonthlyPay: basePayment + extraMonthly,
    showMonthlyPayRow: payoffOption === "extra" && extraYearly === 0 && extraOneTime === 0,
    newMonths: sim.months,
    newTotalPayments: sim.totalPayments,
    newTotalInterest: sim.totalInterest,
    newSchedule: sim.schedule,
    oldSchedule: baseSim.schedule,
  };
}

// ─────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** "$122,306" — whole-dollar currency, used for the savings headline
 * figures and interest-savings box (confirmed the reference rounds
 * these to whole dollars while every table cell keeps cents). */
export function formatWholeCurrency(value) {
  const n = Math.round(Number(value) || 0);
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** "17 yrs, 3 mos" / "25 yrs" / "3 mos" — the abbreviated form used in
 * the comparison table and savings bars (formatYearsAndMonths, reused
 * from mortgageCalculatorEngine.js, is the full-word "17 years and 3
 * months" form used in the description sentence). */
export function formatYearsMosShort(totalMonths) {
  const n = Math.max(0, Math.round(Number(totalMonths) || 0));
  const years = Math.floor(n / 12);
  const months = n % 12;
  if (years === 0) return `${months} mo${months === 1 ? "" : "s"}`;
  if (months === 0) return `${years} yr${years === 1 ? "" : "s"}`;
  return `${years} yr${years === 1 ? "" : "s"}, ${months} mo${months === 1 ? "" : "s"}`;
}

export function formatPercentWhole(value) {
  return `${Math.round(Number(value) || 0)}%`;
}
