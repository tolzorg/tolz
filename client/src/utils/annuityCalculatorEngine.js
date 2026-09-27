// Annuity Calculator engine — matches calculator.net/annuity-calculator.html.
//
// A single accumulation-only annuity: a starting principal plus BOTH an
// annual addition AND a monthly addition simultaneously (unlike the
// Investment Calculator, which only supports one contribution stream at a
// time), each added at either the "beginning" (annuity due) or "end"
// (ordinary/immediate annuity) of its period, growing at one annual rate.
//
// Every mechanic below was reverse-engineered by driving the LIVE
// reference with plain GET requests (this page renders its result
// server-side off the query string, so no Playwright was needed) across
// roughly 20 scenarios. Key findings:
//
//  1. Everything runs on ONE combined monthly grid regardless of the
//     annual/monthly addition split — the annual growth rate is bridged
//     to an equivalent monthly rate via (1+rate)^(1/12)-1 (the same
//     EAR-bridge technique used throughout this app), and the annual
//     addition is injected into that monthly grid once per year rather
//     than computed separately and layered on afterward. There is no
//     "Compound" selector on this calculator at all — the rate behaves
//     exactly as if compounding is always annual before being bridged
//     down to monthly.
//  2. Starting principal is always present from month 1 (it grows for
//     the very first month no matter which timing is selected) — timing
//     only controls the periodic ADDITIONS, never the initial balance.
//  3. "beginning" (due): the monthly addition is added BEFORE that
//     month's growth is applied, every month; the annual addition is
//     added alongside it at the FIRST month of each year (months 1, 13,
//     25…), including a trailing partial final year.
//     "end" (ordinary): the monthly addition is added AFTER that month's
//     growth; the annual addition is added at the LAST month of each
//     year (months 12, 24, 36…) — and is skipped entirely for a trailing
//     partial year that never reaches its 12th month (verified live: a
//     2.5-year run in "end" mode shows a $0 addition for year 3, while
//     the same run in "beginning" mode still adds the full annual amount
//     at month 25).
//  4. Total months = Math.round(years * 12) — verified against a
//     non-clean fraction (2.3 years → 28 months: 2.3*12=27.6 rounds up).
//  5. The schedule's "Addition" column always folds the starting
//     principal into year 1's figure (e.g. a $20,000 principal + $10,000
//     annual addition displays as "$30,000" for year 1) — a pure display
//     convention; it does not change how growth is computed underneath.
//  6. Validation, confirmed live: only "years" is rejected (must be >0
//     and <=1000 — 1000 works, 1001 already errors). Starting principal,
//     both addition amounts, and the growth rate all accept negative or
//     zero values literally and compute with them as entered (e.g. a
//     negative annual addition legitimately produces a negative end
//     balance). This matches this app's established convention (see
//     savingsCalculatorEngine.js) of only validating fields where an
//     out-of-range value would be mathematically nonsensical, not ones
//     that are merely unusual.
//  7. The Accumulation Schedule section itself only appears once the
//     term exceeds 1 year (total months > 12) — a genuine reference
//     quirk: a term of exactly 1 year (12 months) renders the Results
//     panel with NO schedule/chart at all, while 1.5 years (18 months)
//     shows one. Replicated exactly via the `showSchedule` flag below.
//
// See annuity-calculator-notes.md for the full worked verification.

import { periodicRateFromEAR, formatCurrency, formatPercent } from "./loanCalculatorEngine.js";

export { formatCurrency, formatPercent };

export const MAX_YEARS = 1000;
const MAX_SCHEDULE_MONTHS = 12000;

export const DEFAULTS = {
  startingPrincipal: "20000",
  annualAddition: "10000",
  monthlyAddition: "0",
  growthRatePercent: "6",
  years: "10",
};

/** Confirmed live: starting principal, both addition amounts, and the
 * growth rate all accept negative/zero values literally — only "years"
 * is rejected outside (0, 1000]. Returns an error message string, or
 * null when valid. */
export function validateAnnuityInputs({ years }) {
  const yrs = Number(years);
  if (!isFinite(yrs) || yrs <= 0 || yrs > MAX_YEARS) return "Please provide a positive holding years value.";
  return null;
}

export function calculateAnnuity({ startingPrincipal, annualAddition, monthlyAddition, growthRatePercent, years, additionAt }) {
  const P = Number(startingPrincipal) || 0;
  const annualC = Number(annualAddition) || 0;
  const monthlyC = Number(monthlyAddition) || 0;
  const rate = (Number(growthRatePercent) || 0) / 100;
  const totalYears = Math.max(0, Math.min(MAX_YEARS, Number(years) || 0));
  const due = additionAt === "beginning";

  // No Compound selector on this calculator — the growth rate always
  // behaves as an annual rate (an unbridged EAR), then bridged down to a
  // monthly periodic rate. NOT effectiveAnnualRate(), which clamps
  // negative rates to 0 — this calculator legitimately accepts and
  // computes with a negative growth rate (confirmed live).
  const monthlyRate = periodicRateFromEAR(rate, 12);

  const totalMonths = Math.max(0, Math.min(MAX_SCHEDULE_MONTHS, Math.round(totalYears * 12)));

  const monthlySchedule = [];
  let balance = P;
  let totalAdditions = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const isAnnualMonth = due ? (m - 1) % 12 === 0 : m % 12 === 0;
    const periodAddition = monthlyC + (isAnnualMonth ? annualC : 0);
    const displayAddition = periodAddition + (m === 1 ? P : 0);

    let interest;
    if (due) {
      balance += periodAddition;
      interest = balance * monthlyRate;
      balance += interest;
    } else {
      interest = balance * monthlyRate;
      balance += interest;
      balance += periodAddition;
    }

    totalAdditions += periodAddition;
    monthlySchedule.push({ period: m, deposit: displayAddition, interest, balance });
  }

  const endBalance = totalMonths > 0 ? balance : P;
  const totalReturn = endBalance - P - totalAdditions;

  const annualSchedule = [];
  for (let i = 0; i < monthlySchedule.length; i += 12) {
    const yearRows = monthlySchedule.slice(i, i + 12);
    if (!yearRows.length) break;
    annualSchedule.push({
      period: annualSchedule.length + 1,
      deposit: yearRows.reduce((sum, r) => sum + r.deposit, 0),
      interest: yearRows.reduce((sum, r) => sum + r.interest, 0),
      balance: yearRows[yearRows.length - 1].balance,
    });
  }

  // Bar-chart data: cumulative composition per year, same pattern as the
  // Investment/Savings calculators' bar charts.
  const barData = [];
  let cumAdditions = 0;
  let cumReturn = 0;
  for (const row of annualSchedule) {
    cumAdditions += row.deposit - (row.period === 1 ? P : 0);
    cumReturn += row.interest;
    barData.push({ year: row.period, startingAmount: P, contributions: cumAdditions, interest: cumReturn, total: P + cumAdditions + cumReturn });
  }

  return {
    endBalance,
    startingPrincipal: P,
    totalAdditions,
    totalReturn,
    monthlySchedule,
    annualSchedule,
    barData,
    showSchedule: totalMonths > 12,
  };
}
