// Auto Lease Calculator engine — matches calculator.net/auto-lease-calculator.html.
//
// Two tabs share one model:
//   "Total Price"     — auto price in, monthly lease payment out
//   "Monthly Payment" — monthly lease payment in, vehicle price out
//
// Lease (standard money-factor method, confirmed live via GET):
//   net cap cost   C = price − down payment − trade-in
//   depreciation     = (C − residual) / term
//   interest (rent)  = (C + residual) × money factor
//   monthly tax      = (depreciation + interest) × sales tax
//   monthly payment  = depreciation + interest + monthly tax
//   upfront tax      = down payment × sales tax (the trade-in isn't taxed)
//   cost to own after the lease = down + trade-in + upfront tax
//                                 + all lease payments + residual × (1 + tax)
// The reverse tab solves the payment formula for C in closed form, then
// price = C + down + trade-in.
//
// "If purchased under the same conditions" is an ordinary amortized loan at
// the money factor's equivalent APR (money factor × 2400), so the monthly
// rate is 2 × money factor:
//   sale tax = (price − trade-in) × tax   upfront = down + sale tax
//   loan = price − down − trade-in        cost to own = upfront + payments + trade-in
//
// Reference behaviour replicated:
//  - Nothing is clamped: a residual above the cap cost gives negative
//    depreciation, and a down payment above the price gives negative
//    payments, exactly as the reference prints them.
//  - A fractional term is used as-is in every formula and echoed as typed.
//  - "Money Factor Equivalent APR" is shown only in money-factor mode;
//    "Upfront Tax" and the purchase "Sale Tax" rows are hidden at 0% tax.
//  - Validation (all messages listed, in this order): price / monthly pay
//    > 0, down ≥ 0, 0 < term ≤ 360, 0 ≤ rate ≤ 1000, trade-in ≥ 0,
//    tax ≥ 0, residual ≥ 0.

import { cleanInput, toNumber } from "./simpleInterestCalculatorEngine.js";

export const DEFAULTS = {
  price: "50000", monthlyPay: "600", term: "36", moneyFactor: "0.00208", interestRate: "4.992",
  downPayment: "10000", tradeIn: "0", taxRate: "7", residual: "24000",
};

export const RATE_TYPE_OPTIONS = [
  { value: "interestrate", label: "Interest Rate(%)" },
  { value: "moneyfactor", label: "Money Factor" },
];

const MAX_TERM = 360;
const MAX_RATE = 1000;

/** Converts the rate box's text when the Money Factor / Interest Rate menu
 * changes, the same way the reference does: to a money factor it rounds to
 * 5 decimals; to an interest rate it multiplies by 2400 unrounded. Text that
 * isn't a number is left alone. */
export function convertRateText(text, toType) {
  const n = toNumber(cleanInput(text).replace(/\s/g, ""));
  if (!Number.isFinite(n)) return text;
  return toType === "moneyfactor" ? String(Math.round((100000 * n) / 2400) / 100000) : String(n * 2400);
}

function loanPayment(principal, monthlyRate, n) {
  if (monthlyRate === 0) return principal / n;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

/** "4.99%", "12,000.00%" — the APR row's style. */
export function formatPercent2(value) {
  return `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function calculateAutoLease(input) {
  const mode = input.mode === "payment" ? "payment" : "price";
  const rateType = input.rateType === "interestrate" ? "interestrate" : "moneyfactor";
  const text = {
    price: cleanInput(input.price), monthlyPay: cleanInput(input.monthlyPay), term: cleanInput(input.term),
    rate: cleanInput(input.rate), downPayment: cleanInput(input.downPayment), tradeIn: cleanInput(input.tradeIn),
    taxRate: cleanInput(input.taxRate), residual: cleanInput(input.residual),
  };
  const v = Object.fromEntries(Object.entries(text).map(([k, t]) => [k, toNumber(t)]));

  const errors = [];
  if (mode === "price" && !(v.price > 0)) errors.push("Please provide a positive auto price.");
  if (mode === "payment" && !(v.monthlyPay > 0)) errors.push("Please provide a positive monthly pay.");
  if (!(v.downPayment >= 0)) errors.push("Please provide a positive down payment value.");
  if (!(v.term > 0 && v.term <= MAX_TERM)) errors.push("Please provide a positive lease term value.");
  if (!(v.rate >= 0 && v.rate <= MAX_RATE)) {
    errors.push(rateType === "moneyfactor" ? "Please provide a positive money factor." : "Please provide a positive interest value.");
  }
  if (!(v.tradeIn >= 0)) errors.push("Please provide a positive trade-in value.");
  if (!(v.taxRate >= 0)) errors.push("Please provide a positive sale tax value.");
  if (!(v.residual >= 0)) errors.push("Please provide a positive residual value.");
  if (errors.length) return { errors };

  const n = v.term;
  const t = v.taxRate / 100;
  const R = v.residual;
  const D = v.downPayment;
  const T = v.tradeIn;
  const moneyFactor = rateType === "moneyfactor" ? v.rate : v.rate / 2400;

  const capCost = mode === "price"
    ? v.price - D - T
    : (v.monthlyPay / (1 + t) + R / n - R * moneyFactor) / (1 / n + moneyFactor);
  const price = mode === "price" ? v.price : capCost + D + T;

  const depreciation = (capCost - R) / n;
  const interest = (capCost + R) * moneyFactor;
  const monthlyTax = (depreciation + interest) * t;
  const monthlyPayment = depreciation + interest + monthlyTax;
  const upfrontTax = D * t;
  const totalLeasePayments = monthlyPayment * n;

  const saleTax = (price - T) * t;
  const loanAmount = price - D - T;
  const loanMonthly = loanPayment(loanAmount, 2 * moneyFactor, n);
  const totalLoanPayments = loanMonthly * n;

  return {
    mode,
    termText: text.term,
    headlineLabel: mode === "price" ? "Monthly Lease Payment" : "Vehicle Price",
    headlineValue: mode === "price" ? monthlyPayment : price,
    lease: {
      depreciation, interest, monthlyTax,
      apr: rateType === "moneyfactor" ? moneyFactor * 2400 : null,
      downPayment: D,
      upfrontTax: t !== 0 ? upfrontTax : null,
      totalPayments: totalLeasePayments,
      costToOwn: D + T + upfrontTax + totalLeasePayments + R * (1 + t),
    },
    purchase: {
      monthlyPayment: loanMonthly,
      saleTax: t !== 0 ? saleTax : null,
      upfrontPayment: D + saleTax,
      loanAmount,
      totalPayments: totalLoanPayments,
      interest: totalLoanPayments - loanAmount,
      costToOwn: D + saleTax + totalLoanPayments + T,
    },
  };
}
