// Boat Loan Calculator engine — matches calculator.net/boat-loan-calculator.html
// (a GET form, decoded with live probes; see scripts/boat-loan-calculator.test.js).
//
// Two tabs: "Total Price" (solve the monthly payment) and "Monthly Payment"
// (solve the boat price — the exact algebraic inverse). Confirmed live:
//  • Sale tax = boat price × rate. A trade-in does NOT reduce it (the label
//    becomes "Sale Tax*" with the reference's footnote).
//  • Loan amount = price − down payment − trade-in, plus sale tax and fees
//    when "Include all fees in loan" is ticked. A trade-in above the price
//    gives a negative loan, shown as-is.
//  • Upfront payment = down payment + (tax + fees unless financed).
//  • Total cost = price + interest + tax + fees.
//  • Term: years × 12 or months, used as entered (fractional allowed:
//    "Total of 30.6 Loan Payments"); the schedule and chart appear only for
//    10 < n < 600. Down payment may be $ or % of the price (below 100%).
//  • Every box is required; a blank one is an error, as on the reference.

import { clean, num, formatMoney } from "./marginCalculatorEngine.js";
import { amortizeMonthly } from "./personalLoanCalculatorEngine.js";

export const BOAT_LOAN_DEFAULTS = {
  price: "35000", monthlyPay: "350", term: "10", interestRate: "7",
  downPayment: "7000", tradeIn: "0", salesTax: "7", fees: "2000",
};

export const TRADE_IN_TAX_NOTE = "* The calculation assumes the full sales tax on the boat. In some states, the sales tax is deducted for trade-ins and has caps. In such cases, the tax and total cost will be slightly lower.";

/** The reference's down-payment unit switch: $ → % and % → $ against the price. */
export function convertDownPayment(value, toUnit, price) {
  const v = num(clean(value));
  const p = num(clean(price));
  if (!(v >= 0) || !(p > 0)) return value;
  return toUnit === "percent" ? String(Math.round((100000 * v) / p) / 1000) : String(Math.round((p * v) / 100));
}

/**
 * @param {{ mode: "price"|"payment", price, monthlyPay, term, termUnit: "years"|"months", interestRate,
 *   downPayment, downUnit: "dollar"|"percent", tradeIn, salesTax, fees, financeFees: boolean }} input
 */
export function calculateBoatLoan(input) {
  const reverse = input.mode === "payment";
  const v = (k) => num(clean(input[k]));
  const price = v("price");
  const pay = v("monthlyPay");
  const term = v("term");
  const rate = v("interestRate");
  const down = v("downPayment");
  const trade = v("tradeIn");
  const taxRate = v("salesTax");
  const fees = v("fees");
  const percentDown = input.downUnit === "percent";

  const errors = [];
  if (!reverse && !(price > 0)) errors.push("Please provide a positive boat price.");
  if (reverse && !(pay > 0)) errors.push("Please provide a positive monthly pay.");
  if (!(term > 0)) errors.push("Please provide a positive loan term value.");
  if (!(rate >= 0)) errors.push("Please provide a positive interest value.");
  if (!(down >= 0)) errors.push("Please provide a positive down payment value.");
  if (!(trade >= 0)) errors.push("Please provide a positive trade-in value.");
  if (!(taxRate >= 0)) errors.push("Please provide a positive sale tax value.");
  if (!(fees >= 0)) errors.push("Please provide a positive fees value.");
  if (errors.length) return { errors };
  if (percentDown && down >= 100) return { errors: ["Please provide a down payment percentage between 0 and 100%."] };
  if (!reverse && !percentDown && down >= price) return { errors: ["Please provide a down payment amount that is lower than the boat price."] };

  const n = input.termUnit === "months" ? term : term * 12;
  const i = rate / 1200;
  const t = taxRate / 100;
  const financed = Boolean(input.financeFees);

  let boatPrice;
  let loan;
  let payment;
  if (reverse) {
    payment = pay;
    loan = i === 0 ? pay * n : (pay * (1 - Math.pow(1 + i, -n))) / i;
    if (percentDown) {
      const d = down / 100;
      boatPrice = financed ? (loan + trade - fees) / (1 - d + t) : (loan + trade) / (1 - d);
    } else {
      boatPrice = financed ? (loan + down + trade - fees) / (1 + t) : loan + down + trade;
    }
  } else {
    boatPrice = price;
  }
  const downAmount = percentDown ? (boatPrice * down) / 100 : down;
  const tax = boatPrice * t;
  if (!reverse) {
    loan = boatPrice - downAmount - trade + (financed ? tax + fees : 0);
    payment = i === 0 ? loan / n : (loan * i) / (1 - Math.pow(1 + i, -n));
  }
  const totalPayments = payment * n;
  const interest = totalPayments - loan;
  const upfront = downAmount + (financed ? 0 : tax + fees);
  const countText = String(Number(n.toPrecision(12)));

  const result = {
    header: reverse ? { label: "Boat Price", value: formatMoney(boatPrice) } : { label: "Monthly Pay", value: formatMoney(payment) },
    rows: [
      { label: "Total Loan Amount", value: formatMoney(loan) },
      ...(tax !== 0 ? [{ label: trade > 0 ? "Sale Tax*" : "Sale Tax", value: formatMoney(tax) }] : []),
      { label: "Upfront Payment", value: formatMoney(upfront), help: "The upfront payment is the initial payment you make toward the purchase. It includes the down payment, sales tax, and fees (if not bundled into the loan), minus the net value of any trade-in." },
      { label: `Total of ${countText} Loan Payments`, value: formatMoney(totalPayments), gap: true },
      { label: "Total Loan Interest", value: formatMoney(interest) },
      { label: "Total Cost (price, interest, tax, fees)", value: formatMoney(boatPrice + interest + tax + fees) },
    ],
    note: trade > 0 && tax !== 0 ? TRADE_IN_TAX_NOTE : null,
    pie: [
      { label: "Principal", value: loan, color: "#2b7ddb", percent: Math.round((loan / totalPayments) * 100) },
      { label: "Interest", value: interest, color: "#8bbc21", percent: Math.round((interest / totalPayments) * 100) },
    ],
    loan,
    schedule: null,
  };

  if (n > 10 && n < 600) {
    const monthly = amortizeMonthly({ P: loan, i, n, payment });
    const annual = [];
    for (let start = 0; start < monthly.length; start += 12) {
      const slice = monthly.slice(start, start + 12);
      annual.push({
        year: annual.length + 1,
        interest: slice.reduce((s, r) => s + r.interest, 0),
        principal: slice.reduce((s, r) => s + r.principal, 0),
        balance: slice[slice.length - 1].balance,
      });
    }
    result.schedule = { monthly, annual };
  }
  return result;
}
