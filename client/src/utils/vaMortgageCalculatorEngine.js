// VA Mortgage Calculator engine — matches calculator.net/va-mortgage-calculator.html
// (decoded with live GET probes; see scripts/va-mortgage-calculator.test.js).
//
// The reference runs the same mortgage machinery as its FHA page (shared here
// through simulateMortgage), with a VA funding fee instead of MIP:
// - Fee = base loan (price − down payment) × a rate set by the down payment:
//   under 5%: 2.15% first use, 3.3% after a previous VA loan; 5% to under 10%:
//   1.5%; 10% or more: 1.25%. Reservists pay the same as active/veterans.
// - Surviving spouses and borrowers with a 10%+ service-related disability
//   pay no fee (shown as "VA Funding Fee (0%)").
// - "Financed Into Loan" adds the fee to the loan; "Paid Upfront" leaves the
//   loan at the base amount (the fee row still shows it).
// - One "More Options" switch turns on both the optional costs and the extra
//   payments/increases.

import { readLoanBasics, readCostsAndExtras, simulateMortgage, costTable, money, monthYear } from "./fhaLoanCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const VA_DEFAULTS = {
  price: "500000", downPayment: "0", years: "30", rate: "7.388",
  propertyTaxes: "1.2", homeInsurance: "2500", hoa: "0", otherCosts: "5000",
  taxIncrease: "0", insuranceIncrease: "0", hoaIncrease: "0", otherIncrease: "0",
  extraMonthly: "0", extraYearly: "0", extraOneTime: "0",
};

export const ELIGIBILITY = [
  { value: "v", label: "Active/Veteran" },
  { value: "r", label: "Reservist/National Guard" },
  { value: "s", label: "Surviving Spouses" },
];

/** Funding fee rate in percent. */
export function fundingFeeRate({ downPercent, usedBefore, disabled, eligibility }) {
  if (disabled || eligibility === "s") return 0;
  if (downPercent < 5) return usedBefore ? 3.3 : 2.15;
  if (downPercent < 10) return 1.5;
  return 1.25;
}

/**
 * @param {object} input — strings as typed: price, downPayment, downUnit,
 *   years, rate, eligibility ("v"|"r"|"s"), usedBefore, disabled,
 *   feeFinanced, moreOptions, then the optional cost, increase and extra
 *   payment fields of the FHA engine, and showBiweekly.
 */
export function calculateVaMortgage(input) {
  const errors = [];
  const { price, downValue, byDollar, years, rate, baseLoan } = readLoanBasics(input, errors);
  const more = !!input.moreOptions;
  const values = readCostsAndExtras(input, errors, more, more);
  if (errors.length) return { errors };

  const downPercent = byDollar ? (100 * downValue) / price : downValue;
  const feeRate = fundingFeeRate({ downPercent, usedBefore: !!input.usedBefore, disabled: !!input.disabled, eligibility: input.eligibility });
  const fee = baseLoan * (feeRate / 100);
  const financed = input.feeFinanced !== false;
  const loan = financed ? baseLoan + fee : baseLoan;
  const downAmount = byDollar ? downValue : price - baseLoan;

  const sim = simulateMortgage({ input, loan, price, years, rate, optional: more, more, values });
  const { tot } = sim;

  const summary = [
    ["House Price", money(price)],
    [`VA Funding Fee (${formatNumber(feeRate, 2).replace(/\.?0+$/, "")}%)`, money(fee)],
    ["Down Payment", money(downAmount)],
    ["Loan Amount", money(loan)],
    [`Total of ${sim.paymentsCount} Mortgage Payments`, money(sim.mortgageTotal)],
    ["Total Interest", money(tot.interest)],
  ];
  if (sim.paidEarly) summary.push(["Total Extra Payments", money(tot.extra)]);
  if (more) summary.push(["Mortgage Payoff Date", monthYear(sim.payoffDate)]);

  const pie = [
    { label: "Principal", value: loan, color: "#2b7ddb" },
    { label: "Interest", value: sim.pieInterest, color: "#8bbc21" },
  ];
  if (more) {
    pie.push(
      { label: "Property Taxes", value: tot.tax, color: "#910000" },
      { label: "Other Cost", value: tot.other, color: "#1aadce" },
      { label: "Home Insurance", value: tot.insurance, color: "#492970" },
      { label: "HOA Fee", value: tot.hoa, color: "#c21271" },
    );
  }

  return {
    monthlyPay: money(sim.payment),
    sentence: sim.sentence,
    firstColumn: sim.firstColumn,
    table: more ? costTable(sim) : null,
    pie,
    summary,
    biweekly: sim.biweekly,
    schedule: sim.schedule,
  };
}
