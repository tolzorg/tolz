// Rent Calculator engine — matches calculator.net/rent-calculator.html.
//
// Reverse-engineered via plain GET requests (this page renders results
// server-side, so no Playwright was needed) across ~8 scenarios,
// including the reference's own screenshot values ($90,033/year income,
// $3/month debt → afford $2,698, safe $2,098, 1/3-rule $2,501 — matched
// exactly). Key findings:
//
//  1. Three numbers, all derived from gross MONTHLY income (yearly input
//     divided by 12):
//       - "afford" (the aggressive/maximum figure): 36% of monthly
//         income, minus monthly debt.
//       - "safe" (the recommended figure): 28% of monthly income, minus
//         monthly debt.
//       - "oneThird": monthly income ÷ 3 — NOT reduced by debt (this is
//         a landlord-screening rule of thumb about gross income only,
//         independent of the calculator's own affordability formula).
//     Confirmed by isolating debt's effect: with monthly debt $500, the
//     28%/36% figures each drop by exactly $500 while the 1/3 figure is
//     completely unaffected.
//  2. Negative monthly debt IS accepted and computed literally (it
//     increases both afford/safe), matching this app's other
//     calculators' established permissiveness — see [[savings-calculator
//     -notes]]'s equivalent finding.
//  3. The 1/3-rule sentence only appears when it's actually the tighter
//     constraint, i.e. when `oneThird < afford` — confirmed by toggling
//     debt across 3 scenarios where the ordering flips.
//  4. When "afford" (the 36% figure) is zero or negative, the entire
//     result collapses to a single sentence: "At that income and debt
//     level, it will be hard to meet rent payments." — confirmed exactly
//     at the afford=0 boundary (debt chosen to land exactly on it) and
//     just one dollar past it in both directions.
//  5. Validation, confirmed live: only a negative income is rejected
//     ("Please provide a positive income value.") — income of exactly 0
//     is accepted (and naturally falls into the "hard to meet" case).
//     Monthly debt has no validation at all, including negative values.
//  6. All 3 dollar figures round to the nearest whole dollar (no cents)
//     and use the sign-after-$ convention for negatives (e.g. "$-79"),
//     matching the reference exactly when "safe" goes negative — reused
//     from financeCalculatorEngine.js's own formatCurrency rather than
//     duplicating it (see reuse note below).

export { formatCurrency } from "./financeCalculatorEngine.js";

export const DEFAULTS = {
  income: "90033",
  incomeUnit: "year",
  monthlyDebt: "3",
};

export function validateRentInputs({ income }) {
  const n = Number(income);
  if (!isFinite(n) || n < 0) return "Please provide a positive income value.";
  return null;
}

export function calculateRent({ income, incomeUnit, monthlyDebt }) {
  const incomeNum = Math.max(0, Number(income) || 0);
  const monthlyIncome = incomeUnit === "month" ? incomeNum : incomeNum / 12;
  const debt = Number(monthlyDebt) || 0;

  const afford = monthlyIncome * 0.36 - debt;
  const safe = monthlyIncome * 0.28 - debt;
  const oneThird = monthlyIncome / 3;

  const hardToMeet = afford <= 0;
  const showOneThird = !hardToMeet && oneThird < afford;

  return { monthlyIncome, afford, safe, oneThird, hardToMeet, showOneThird };
}
