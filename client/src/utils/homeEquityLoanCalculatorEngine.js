// Home Equity Loan Calculator engine — matches
// calculator.net/home-equity-loan-calculator.html (decoded with live GET
// probes; see scripts/home-equity-loan-calculator.test.js).
//
// 1. Payment calculator: a level monthly payment over term × 12 payments,
//    possibly fractional (the last row pays the balance with that fraction of
//    a payment, as on the reference's other mortgage pages, so the schedule
//    comes from the shared simulateMortgage). Optional closing costs ($ or %
//    of the loan) are either deducted from the loan ("Cash received") or paid
//    upfront; either way the APR is 12 × the monthly rate at which the
//    payments are worth the loan minus the closing costs.
// 2. "The loan amount you can borrow": the reference's client-side script —
//    LTV × house value − mortgage balance.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";
import { simulateMortgage, money } from "./fhaLoanCalculatorEngine.js";

export const LOAN_DEFAULTS = { amount: "150000", rate: "8", years: "15", closingCosts: "7500" };
export const BORROW_DEFAULTS = { houseValue: "600000", mortgageBalance: "250000", ltv: "80" };
export const LTV_CHOICES = ["90", "85", "80", "75", "70", "60"].map((v) => ({ value: v, label: `${v}%` }));

/** Monthly rate r with payment × annuity(r, n) = received (bisection, widening the bracket). */
function monthlyIrr(payment, n, received) {
  const pv = (r) => (r === 0 ? payment * n : (payment * (1 - (1 + r) ** -n)) / r);
  if (pv(0) <= received) return 0;
  let lo = 0;
  let hi = 1;
  while (pv(hi) > received && hi < 1e12) { lo = hi; hi *= 2; }
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > received) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Schedule cells: plain float rounding (the reference prints 6,808.675 as $6,808.67). */
export function scheduleMoney(v) {
  const [int, dec] = Math.abs(v).toFixed(2).split(".");
  const text = `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
  return `${v < 0 && /[1-9]/.test(text) ? "-" : ""}$${text}`;
}

const countText = (n) => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? formatNumber(r, 0) : formatNumber(r, 2);
};

/**
 * @param {object} input — amount, rate, years (strings), includeClosing,
 *   closingCosts, closingUnit ("amount"|"percentage"), closingPaid ("deduct"|"upfront").
 */
export function calculateHomeEquityLoan(input) {
  const errors = [];
  const amount = num(clean(input.amount));
  if (Number.isNaN(amount) || amount <= 0) errors.push("Please provide a positive loan amount.");
  const rate = num(clean(input.rate));
  if (Number.isNaN(rate) || rate < 0) errors.push("Please provide a positive interest rate value.");
  const years = num(clean(input.years));
  if (Number.isNaN(years) || years <= 0) errors.push("Please provide a reasonable loan term value.");

  const include = !!input.includeClosing;
  const byPercent = input.closingUnit === "percentage";
  let cost = 0;
  if (include) {
    const value = num(clean(input.closingCosts));
    if (Number.isNaN(value) || value < 0) errors.push("Please provide a positive closing costs amount.");
    else if (byPercent && value >= 100) errors.push("Closing costs percentage cannot be more than 100%.");
    else if (!byPercent && amount > 0 && value >= amount) errors.push("Closing costs cannot be more than loan amount.");
    else cost = byPercent ? (amount * value) / 100 : value;
  }
  if (errors.length) return { errors };

  const values = { taxValue: 0, insurance: 0, hoa: 0, other: 0, startYear: 0, inc: { tax: 0, insurance: 0, hoa: 0, other: 0 }, extra: { monthly: 0, yearly: 0, oneTime: 0, monthlyYear: 0, yearlyYear: 0, oneTimeYear: 0 } };
  const sim = simulateMortgage({ input: {}, loan: amount, price: 0, years, rate, optional: false, more: false, values });
  const n = years * 12;
  // Total paid minus the loan (differs from the summed schedule only when payments barely cover interest).
  const interest = sim.mortgageTotal - amount;
  const withCosts = include && cost > 0;
  const deducted = input.closingPaid !== "upfront";

  const rows = [];
  if (withCosts && deducted) rows.push(["Cash received", money(amount - cost)]);
  rows.push([`Total of ${countText(n)} loan payments`, money(sim.mortgageTotal)], ["Total interest", money(interest)]);
  if (withCosts) {
    if (byPercent) rows.push(["Closing costs", money(cost)]);
    rows.push(["Cost of loan", money(interest + cost)]);
    if (rate > 0 && n > 12) rows.push(["APR", `${formatNumber(12 * 100 * monthlyIrr(sim.payment, n, amount - cost), 3)}%`]);
  }

  const pie = withCosts
    ? [
      { label: deducted ? "Cash received" : "Loan amount", value: deducted ? amount - cost : amount, color: "#2b7ddb" },
      { label: "Closing costs", value: cost, color: "#8bbc21" },
      { label: "Interest", value: interest, color: "#910000" },
    ]
    : [
      { label: "Loan amount", value: amount, color: "#2b7ddb" },
      { label: "Interest", value: interest, color: "#8bbc21" },
    ];

  // The reference lists the schedule only for 13 to 719 payments.
  const schedule = sim.schedule && n < 720 ? sim.schedule : null;
  return { monthlyPay: money(sim.payment), rows, pie, schedule };
}

/** "The loan amount you can borrow" (client-side on the reference). */
export function calculateBorrowLimit({ houseValue, mortgageBalance, ltv }) {
  const errors = [];
  const value = num(clean(houseValue));
  const balance = num(clean(mortgageBalance));
  if (Number.isNaN(value) || value <= 0) errors.push("Please provide a valid current value of your house.");
  if (Number.isNaN(balance) || balance <= 0) errors.push("Please provide a valid outstanding balance of your mortgage.");
  if (errors.length) return { errors };
  const limit = Number(ltv) * 0.01;
  const ratio = balance / value;
  const ltvText = `Your current loan-to-value ratio: ${(ratio * 100).toFixed(1)}%.`;
  if (ratio >= limit) return { qualifies: false, ltvText, notes: [] };
  const amount = (limit - ratio) * value;
  const notes = ["There are other factors that may affect your final qualified home equity loan amount, such as your credit history. Applicants with a credit score below 630 may not qualify for a home equity loan. Your other debts might also affect the amount you can qualify for. Lenders typically won't approve a loan for borrowers with a debt-to-income ratio of 43% or higher."];
  if (amount > 1000000) notes.push("In addition, most lenders have an upper limit on home equity loan, with many setting the cap at $1,000,000.");
  return { qualifies: true, amount: `$${Math.round(amount).toLocaleString("en-US")}`, ltvText, notes };
}
