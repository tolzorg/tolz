// Savings Calculator engine — matches calculator.net/savings-calculator.html.
//
// Reverse-engineered by driving the REAL reference calculator with plain
// GET requests (this page renders its results server-side, so no
// Playwright was needed) across ~10 scenarios spanning every compounding
// frequency, combined annual+monthly contributions, contribution growth,
// fractional years, and nonzero tax rate. Key findings:
//
//  1. Same core engine as the already-verified Interest Calculator
//     (interestCalculatorEngine.js): everything (initial deposit, annual
//     contribution, monthly contribution) accumulates on ONE combined
//     MONTHLY grid regardless of the selected "Compound" frequency —
//     Compound only bridges the nominal rate down to an equivalent
//     monthly rate (via the same effectiveAnnualRate/periodicRateFromEAR
//     technique already verified for the Loan Calculator), not the
//     simulation granularity. Contributions always land at the END of
//     their period (this calculator has no beginning/end toggle — its own
//     footnote states "contributions are made at the end of each
//     period").
//  2. NEW vs. the Interest Calculator: annual and monthly contributions
//     each have their own "increase %/year" field. The contribution
//     amount compounds by that percentage once per full year elapsed
//     (year 1 uses the base amount unescalated; year 2 uses
//     base×(1+increase); year 3 uses base×(1+increase)², etc.) — verified
//     against the reference's own schedule for both streams
//     simultaneously (a combined annual+monthly+both-growing scenario
//     matched to the penny for all 6 years checked).
//  3. Tax is deducted from EACH MONTH'S interest as it's earned (not a
//     lump-sum haircut) — confirmed directly from the reference's own
//     schedule, which grows a 4th "Tax" column whenever tax > 0. This
//     was verified precisely: summing (grossInterest × taxRate) over 12
//     individual months reproduced the reference's annual "Tax" total to
//     the penny, while a naive single end-of-year tax hit did not.
//  4. "Total interest earned" splits into two separate result lines —
//     "Total interest earned (after tax)" and "Total tax" — the instant
//     tax rate > 0; at 0% tax it's a single "Total interest earned" line.
//     Both derive directly from summed per-period gross interest and tax,
//     not from a reverse "gross-up" formula (no closed form exists here
//     since growing contributions rule one out).
//  5. "Years to save" accepts fractional values. The reference rounds the
//     month count UP (e.g. 2.02 years → 25 months, not 24) and prorates
//     the final, partial month's rate via `(1+monthlyRate)^fraction − 1`
//     rather than a linear fraction — confirmed against 3 fractional-year
//     scenarios (a clean half-year and two odd fractions) to the penny.
//  6. Validation, confirmed against the live reference: negative interest
//     rate or a tax rate outside [0, 100] are rejected; non-positive
//     "years" is rejected. Initial deposit, both contribution amounts,
//     AND both "increase %" fields are accepted even when negative —
//     the reference computes with them literally (e.g. a negative
//     initial deposit produces a negative running balance) rather than
//     clamping or erroring, so this engine deliberately does the same.
//
// Every figure — End balance, Initial deposit, Total contributions, Total
// interest earned (with and without tax), Total tax, and the full annual
// AND monthly schedules — has been verified against the real
// calculator.net engine to the penny, including a scenario combining
// quarterly compounding, both contribution streams growing at different
// rates, and a 15% tax rate simultaneously. See
// savings-calculator-notes.md for the full scenario list.

import { effectiveAnnualRate, periodicRateFromEAR, formatCurrency, formatPercent } from "./loanCalculatorEngine.js";

export { COMPOUND_OPTIONS, DEFAULT_COMPOUND } from "./interestCalculatorEngine.js";
export { formatCurrency, formatPercent };

export const MAX_YEARS = 100;
const MAX_SCHEDULE_MONTHS = 1200;
const EPS = 1e-9;

export const DEFAULTS = {
  initialDeposit: "20000",
  annualContribution: "5000",
  annualContributionIncreasePercent: "3",
  monthlyContribution: "0",
  monthlyContributionIncreasePercent: "0",
  interestRatePercent: "3",
  years: "10",
  taxRatePercent: "0",
};

/** Confirmed live: negative deposits/contributions/increase-percentages
 * are all accepted and computed literally — only rate, tax rate, and
 * years are validated. Returns an error message string, or null. */
export function validateSavingsInputs({ interestRatePercent, taxRatePercent, years }) {
  const rate = Number(interestRatePercent);
  if (!isFinite(rate) || rate < 0) return "Please provide a positive interest rate value.";
  const tax = Number(taxRatePercent);
  if (!isFinite(tax) || tax < 0 || tax > 100) return "Please provide a positive tax rate value.";
  const yrs = Number(years);
  if (!isFinite(yrs) || yrs <= 0) return "Please provide a positive holding years value.";
  return null;
}

export function calculateSavings({
  initialDeposit, annualContribution, annualContributionIncreasePercent,
  monthlyContribution, monthlyContributionIncreasePercent,
  interestRatePercent, compound, years, taxRatePercent,
}) {
  const P = Number(initialDeposit) || 0;
  const annualC = Number(annualContribution) || 0;
  const annualGrowth = (Number(annualContributionIncreasePercent) || 0) / 100;
  const monthlyC = Number(monthlyContribution) || 0;
  const monthlyGrowth = (Number(monthlyContributionIncreasePercent) || 0) / 100;
  const nominalRate = Math.max(0, (Number(interestRatePercent) || 0) / 100);
  const taxRate = Math.max(0, Math.min(1, (Number(taxRatePercent) || 0) / 100));
  const totalYears = Math.min(MAX_YEARS, Math.max(0, Number(years) || 0));

  const nominalEar = effectiveAnnualRate(nominalRate, compound);
  const nominalMonthlyRate = periodicRateFromEAR(nominalEar, 12);

  // Total months rounds UP, with the leftover fraction (if any) applied as
  // a prorated rate on the final month only — see finding #5 above.
  const totalMonthsExact = Math.min(MAX_SCHEDULE_MONTHS, totalYears * 12);
  const flooredMonths = Math.floor(totalMonthsExact + EPS);
  const remainder = totalMonthsExact - flooredMonths;
  const totalMonths = remainder < EPS ? flooredMonths : flooredMonths + 1;
  const lastMonthFraction = remainder < EPS ? 1 : remainder;

  const monthlySchedule = [];
  let balance = P;
  let totalContributions = 0;
  let totalInterestGross = 0;
  let totalTax = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const currentAnnualC = annualC * Math.pow(1 + annualGrowth, yearIndex);
    const currentMonthlyC = monthlyC * Math.pow(1 + monthlyGrowth, yearIndex);
    const isYearEnd = m % 12 === 0;
    const actualDeposit = currentMonthlyC + (isYearEnd ? currentAnnualC : 0);
    const displayDeposit = actualDeposit + (m === 1 ? P : 0);

    const isLastMonth = m === totalMonths;
    const monthRate = isLastMonth && lastMonthFraction < 1
      ? Math.pow(1 + nominalMonthlyRate, lastMonthFraction) - 1
      : nominalMonthlyRate;

    const interest = balance * monthRate;
    const tax = interest * taxRate;
    balance += interest - tax + actualDeposit;

    totalContributions += actualDeposit;
    totalInterestGross += interest;
    totalTax += tax;

    monthlySchedule.push({ period: m, deposit: displayDeposit, interest, tax, balance });
  }

  const endingBalance = balance;
  const totalInterestAfterTax = totalInterestGross - totalTax;

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

  const barData = annualSchedule.map((row) => ({
    year: row.period,
    startingAmount: row.period === 1 ? P : 0,
    contributions: row.period === 1 ? row.deposit - P : row.deposit,
    interest: row.interest - row.tax,
    get total() { return this.startingAmount + this.contributions + this.interest; },
  })).map((row) => ({ ...row, total: row.startingAmount + row.contributions + row.interest }));
  // Running cumulative totals for the bar chart (each bar shows the
  // account's composition AT that year, not just that year's activity).
  let cumStart = 0, cumContrib = 0, cumInterest = 0;
  for (const row of barData) {
    cumStart += row.startingAmount;
    cumContrib += row.contributions;
    cumInterest += row.interest;
    row.startingAmount = cumStart;
    row.contributions = cumContrib;
    row.interest = cumInterest;
    row.total = cumStart + cumContrib + cumInterest;
  }

  return {
    endingBalance,
    initialDeposit: P,
    totalContributions,
    totalInterestGross,
    totalInterestAfterTax,
    totalTax,
    hasTax: taxRate > 0,
    monthlySchedule,
    annualSchedule,
    barData,
  };
}
