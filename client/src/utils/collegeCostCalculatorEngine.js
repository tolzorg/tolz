// College Cost Calculator engine — matches calculator.net/college-cost-calculator.html.
//
// Model (every rule below confirmed against the live reference via GET):
//  - Year k's cost (k = 0 … duration−1) = today's cost × (1 + increase)^(startIn + k).
//    "Total college cost" is their sum.
//  - "Today's money" discounts each year's cost ANNUALLY at the after-tax
//    return ra = return × (1 − tax): cost_k / (1 + ra)^(startIn + k). (With a
//    0% tax and return = increase, it collapses to exactly cost × duration —
//    confirmed live.)
//  - "Equivalent monthly saving" amortizes (today's-money target − current
//    balance) as an ordinary annuity over (startIn + duration) × 12 months at
//    the NOMINAL monthly rate ra / 12. Several simulation/annuity-due/
//    EAR-bridged variants were fitted and rejected; only this one matched
//    all 5 disambiguating scenarios.
//  - The "% from savings" section scales the same figures by the percent;
//    the current balance is subtracted in full (not scaled) from its target.
//
// Display rules, all confirmed live:
//  - Balance ≥ full today's-money target → both section headers, the
//    monthly rows and the whole "%" section disappear, replaced by "Your
//    college savings balance now is enough to cover it already!".
//  - Balance ≥ the "%" target only → that line replaces the "%" section's
//    additional-amount and monthly rows.
//  - "Additional amount to save" rows appear only when balance > 0.
//  - Freshman-year row appears only when increase > 0 AND startIn > 0.
//  - The "%" section is hidden at exactly 0% or 100%.
//  - Durations must be integers; tax ≤ 100 and percent ≤ 100; the
//    increase rate may be negative. Errors are listed in the reference's
//    own order (tax BEFORE return, not form order), wording verbatim.

import { parseNumber, formatMoney } from "./studentLoanCalculatorEngine.js";

export { parseNumber };

export const COLLEGE_AVERAGES = [
  { value: "65470", label: "4-year private: $65,470" },
  { value: "30990", label: "4-year in-state public: $30,990" },
  { value: "50920", label: "4-year out-of-state public: $50,920" },
  { value: "21320", label: "2-year public: $21,320" },
];

export const DEFAULTS = {
  todayCost: "30990",
  costIncrease: "5",
  duration: "4",
  savingPercent: "35",
  balanceNow: "0",
  returnRate: "5",
  taxRate: "25",
  startIn: "3",
};

/** Whole-dollar money, reference style ("$1,773", "$-25"). */
export function formatDollars(value) {
  return formatMoney(value, { decimals: 0 });
}

export function yearsLabel(n) {
  return `${n} ${n === 1 ? "year" : "years"}`;
}

function validate({ C, g, L, P, B, t, r, S }) {
  const errors = [];
  if (Number.isNaN(C)) errors.push("Please provide a numerical today's annual college costs value.");
  if (Number.isNaN(g)) errors.push("Please provide a numerical college cost increase rate value.");
  if (!(L > 0)) errors.push("Please provide a positive numerical expected college attending years value.");
  else if (!Number.isInteger(L)) errors.push("The expected college attending years needs to be an integer value.");
  if (!(P >= 0)) errors.push("Please provide a positive numerical value for the percent of costs you plan to pay out of savings.");
  else if (P > 100) errors.push("Please provide a percent of costs that is less than or equal to 100.");
  if (!(B >= 0)) errors.push("Please provide a positive numerical value for college savings balance now:.");
  if (!(t >= 0)) errors.push("Please provide a positive numerical tax rate value.");
  else if (t > 100) errors.push("Please provide a tax rate that is less than 100.");
  if (!(r >= 0)) errors.push("Please provide a positive numerical value for the average interest or return rate of your savings.");
  if (!(S >= 0)) errors.push("Please provide a positive numerical value for the number of years the college will start.");
  else if (!Number.isInteger(S)) errors.push("The number of years the college will start needs to be an integer value.");
  return errors;
}

export function calculateCollegeCost(inputs) {
  const v = {
    C: parseNumber(inputs.todayCost),
    g: parseNumber(inputs.costIncrease),
    L: parseNumber(inputs.duration),
    P: parseNumber(inputs.savingPercent),
    B: parseNumber(inputs.balanceNow),
    r: parseNumber(inputs.returnRate),
    t: parseNumber(inputs.taxRate),
    S: parseNumber(inputs.startIn),
  };
  const errors = validate(v);
  if (errors.length) return { errors };

  const { C, g, L, P, B, r, t, S } = v;
  const growth = 1 + g / 100;
  const afterTaxReturn = (r / 100) * (1 - t / 100);
  const yearCosts = Array.from({ length: L }, (_, k) => C * Math.pow(growth, S + k));
  const totalCost = yearCosts.reduce((sum, c) => sum + c, 0);
  const totalToday = yearCosts.reduce((sum, c, k) => sum + c / Math.pow(1 + afterTaxReturn, S + k), 0);
  const freshmanCost = yearCosts[0];

  const months = (S + L) * 12;
  const i = afterTaxReturn / 12;
  const monthlySaving = (amount) => (i === 0 ? amount / months : (amount * i) / (1 - Math.pow(1 + i, -months)));

  const result = {
    totalCost,
    totalToday,
    years: S + L,
    freshman: g > 0 && S > 0 ? { cost: freshmanCost, now: C, increase: g, startIn: S } : null,
    fullCovered: B >= totalToday,
    fullAdditional: null,
    fullMonthly: null,
    percentSection: null,
  };
  if (result.fullCovered) return result;

  result.fullAdditional = B > 0 ? totalToday - B : null;
  result.fullMonthly = monthlySaving(totalToday - B);

  if (P > 0 && P < 100) {
    const share = P / 100;
    const targetToday = totalToday * share;
    const covered = B >= targetToday;
    result.percentSection = {
      percent: P,
      needToSave: totalCost * share,
      targetToday,
      covered,
      additional: !covered && B > 0 ? targetToday - B : null,
      monthly: covered ? null : monthlySaving(targetToday - B),
      freshmanNeeded: freshmanCost * share,
    };
  }
  return result;
}
