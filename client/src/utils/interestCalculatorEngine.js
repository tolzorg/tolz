// Interest Calculator engine — matches calculator.net/interest-calculator.html.
//
// The underlying mechanism was reverse-engineered by driving the ACTUAL
// reference calculator with Playwright and reading its own real per-month
// accumulation schedule (not just its rounded 2-decimal summary figures) —
// see interest-calculator-notes.md for the full derivation. Key findings:
//
//  1. Everything (initial investment, annual contribution, monthly
//     contribution) grows on ONE combined MONTHLY grid, regardless of what
//     "Compound" frequency is selected — Compound only determines the rate
//     (bridged down to monthly via the standard EAR technique already
//     verified for the Loan Calculator), not the simulation granularity.
//  2. Tax is deducted from EACH PERIOD'S interest as it's earned (not a
//     single lump-sum haircut at the end, and not baked into the rate
//     before bridging) — confirmed directly from the reference's own
//     monthly schedule, which has an explicit per-row Tax column whenever
//     tax > 0. Mathematically this is equivalent to compounding at
//     `effectiveMonthlyRate = nominalMonthlyRate × (1 − taxRate)`.
//  3. The initial investment ALWAYS starts accruing at t=0, unaffected by
//     the "beginning"/"end of period" contribution-timing setting (it's
//     not a recurring contribution) — confirmed both by the closed-form
//     summary ("Interest of initial investment" identical in both modes)
//     and directly in the real schedule (month 1's interest is computed
//     on the initial investment alone, before that month's contribution
//     lands, in "end" mode).
//  4. "Interest of initial investment" and "Interest of the contributions"
//     in the Results panel are a SEPARATE illustrative breakdown computed
//     with the NOMINAL (untaxed) rate — decoupled from the real,
//     tax-affected ending balance. "Total interest" is the sum of these
//     two, i.e. the GROSS (pre-tax) figure; "Total tax" and "Total
//     interest after tax" are then derived from it via
//     `TotalTax = TotalInterestGross × taxRate` (this relationship reduces
//     the real net-vs-gross accounting exactly, since tax is a constant
//     fraction of each period's interest, and that fraction distributes
//     linearly over any sum of periods).
//
// Every figure here — Ending balance, Total tax, Total interest after
// tax, Interest of initial investment, Interest of the contributions, and
// Buying power — has been verified to match the real calculator.net
// engine exactly (to the penny) across both "beginning" and "end" of
// period modes, using a scenario with nonzero annual AND monthly
// contributions AND a nonzero tax rate — the combination that had
// previously exposed a real gap. See interest-calculator-notes.md.

import { effectiveAnnualRate, periodicRateFromEAR, termToYears } from "./loanCalculatorEngine.js";

export const COMPOUND_OPTIONS = [
  { value: "annually", label: "annually" },
  { value: "semiannually", label: "semi-annually" },
  { value: "quarterly", label: "quarterly" },
  { value: "monthly", label: "monthly" },
  { value: "semimonthly", label: "semi-monthly" },
  { value: "biweekly", label: "biweekly" },
  { value: "weekly", label: "weekly" },
  { value: "daily", label: "daily" },
  { value: "continuously", label: "continuously" },
];

export const DEFAULT_COMPOUND = "annually";
export const MAX_TERM_YEARS = 100;
const MAX_SCHEDULE_MONTHS = 1200;

/** Future value of a stream of equal periodic contributions.
 * `due` = true for "beginning of period" (annuity-due: each contribution
 * earns interest for its own period too); false for "end of period"
 * (ordinary annuity: the period's interest is earned before that
 * period's contribution lands). */
function contributionFV(contribution, periodicRate, n, due) {
  if (n <= 0 || contribution === 0) return 0;
  const ordinary = periodicRate === 0 ? contribution * n : contribution * (Math.pow(1 + periodicRate, n) - 1) / periodicRate;
  return due ? ordinary * (1 + periodicRate) : ordinary;
}

export function calculateInterest({
  initialInvestment, annualContribution, monthlyContribution, contributeAt,
  annualRatePercent, compound, years, months, taxRatePercent, inflationRatePercent,
}) {
  const P = Math.max(0, Number(initialInvestment) || 0);
  const annualC = Math.max(0, Number(annualContribution) || 0);
  const monthlyC = Math.max(0, Number(monthlyContribution) || 0);
  const totalYears = Math.min(MAX_TERM_YEARS, termToYears(years, months));
  const nominalRate = Math.max(0, (Number(annualRatePercent) || 0) / 100);
  const taxRate = Math.max(0, Math.min(1, (Number(taxRatePercent) || 0) / 100));
  const due = contributeAt === "beginning";

  // The real, tax-affected rate the account actually compounds at —
  // always monthly, regardless of "Compound".
  const nominalEar = effectiveAnnualRate(nominalRate, compound);
  const nominalMonthlyRate = periodicRateFromEAR(nominalEar, 12);
  const effectiveMonthlyRate = nominalMonthlyRate * (1 - taxRate);
  // The annual-contribution stream needs its own periodic rate, consistent
  // with 12 months of effective (after-tax) monthly compounding.
  const effectiveAnnualPeriodicRate = Math.pow(1 + effectiveMonthlyRate, 12) - 1;

  const nAnnual = Math.max(0, Math.round(totalYears));
  const nMonthly = Math.max(0, Math.min(MAX_SCHEDULE_MONTHS, Math.round(totalYears * 12)));

  const initialFV = P * Math.pow(1 + effectiveMonthlyRate, nMonthly);
  const annualContribFV = contributionFV(annualC, effectiveAnnualPeriodicRate, nAnnual, due);
  const monthlyContribFV = contributionFV(monthlyC, effectiveMonthlyRate, nMonthly, due);

  const endingBalance = initialFV + annualContribFV + monthlyContribFV;
  const totalContributions = annualC * nAnnual + monthlyC * nMonthly;
  const totalPrincipal = P + totalContributions;
  const totalInterestAfterTax = endingBalance - totalPrincipal;
  // Gross (pre-tax) interest, derived from the after-tax figure: tax is a
  // constant fraction of each period's interest, so this relationship
  // holds exactly regardless of the compounding pattern.
  const totalInterest = taxRate >= 1 ? totalInterestAfterTax : totalInterestAfterTax / (1 - taxRate);
  const totalTax = totalInterest - totalInterestAfterTax;

  // Illustrative-only breakdown (NOT tax-affected) — matches the
  // reference exactly despite being decoupled from the real, taxed
  // ending balance above.
  const interestOfInitial = P * (Math.pow(1 + nominalEar, totalYears) - 1);
  const interestOfContributions = totalInterest - interestOfInitial;

  const inflationRate = Math.max(0, (Number(inflationRatePercent) || 0) / 100);
  const buyingPower = endingBalance / Math.pow(1 + inflationRate, totalYears);

  const { monthlySchedule, annualSchedule } = buildSchedule({
    initialInvestment: P, annualC, monthlyC, nominalMonthlyRate, taxRate, nMonthly, due, endingBalance,
  });

  return {
    endingBalance, totalPrincipal, totalContributions, totalInterest,
    interestOfInitial, interestOfContributions, totalTax, totalInterestAfterTax, buyingPower,
    monthlySchedule, annualSchedule,
  };
}

// Builds the real month-by-month accumulation grid: gross interest each
// month is the CURRENT (already tax-reduced) balance times the nominal
// monthly rate; tax is deducted from that period's interest specifically;
// the initial investment is seeded into `balance` before period 1 (so it
// starts compounding immediately regardless of due/end), while month 1's
// DISPLAYED deposit bundles it with that month's own contribution, purely
// as a display convention matching the reference exactly.
function buildSchedule({ initialInvestment, annualC, monthlyC, nominalMonthlyRate, taxRate, nMonthly, due, endingBalance }) {
  const monthlySchedule = [];
  let balance = initialInvestment;

  for (let m = 1; m <= nMonthly; m++) {
    const isYearBoundary = due ? (m - 1) % 12 === 0 : m % 12 === 0;
    const actualDeposit = monthlyC + (isYearBoundary ? annualC : 0);
    const displayDeposit = actualDeposit + (m === 1 ? initialInvestment : 0);
    let interest, tax;
    if (due) {
      balance += actualDeposit;
      interest = balance * nominalMonthlyRate;
      tax = interest * taxRate;
      balance += interest - tax;
    } else {
      interest = balance * nominalMonthlyRate;
      tax = interest * taxRate;
      balance += interest - tax;
      balance += actualDeposit;
    }
    // Snap the very last row to the closed-form ending balance, avoiding
    // any float drift accumulated over many simulated periods — same
    // anti-drift principle used throughout the Mortgage/Loan engines.
    if (m === nMonthly) balance = endingBalance;
    monthlySchedule.push({ period: m, deposit: displayDeposit, interest, tax, balance });
  }

  const annualSchedule = [];
  for (let i = 0; i < monthlySchedule.length; i += 12) {
    const yearRows = monthlySchedule.slice(i, i + 12);
    if (!yearRows.length) break;
    annualSchedule.push({
      period: annualSchedule.length + 1,
      deposit: yearRows.reduce((sum, r) => sum + r.deposit, 0),
      interest: yearRows.reduce((sum, r) => sum + r.interest, 0),
      tax: yearRows.reduce((sum, r) => sum + r.tax, 0),
      balance: yearRows[yearRows.length - 1].balance,
    });
  }

  return { monthlySchedule, annualSchedule };
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
