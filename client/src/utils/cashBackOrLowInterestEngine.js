// Cash Back or Low Interest Calculator engine — matches
// calculator.net/cash-back-or-low-interest-calculator.html.
//
// Two ways to finance the same car at the same term:
//   Cash back offer:  higher rate, price reduced by the cash back
//   Low rate offer:   lower rate, no cash back
// loan = price − down payment − trade-in (− cash back) (+ tax + fees when
// "Include All Fees in Loan" is ticked); monthly pay is the ordinary
// annuity payment; total cost = all loan payments + the upfront payment
// (down payment, plus tax and fees when they aren't financed) + the
// trade-in value. The "Sale Tax" row is only shown when the tax isn't 0.
//
// Rules confirmed live via GET:
//  - Sales tax per state (harvested for all 51): the trade-in reduces the
//    taxable price except in CA, DC, HI, KY, MD, MI, MT and VA; the cash
//    back also reduces it (cash-back offer only) in the 21 rebate-exempt
//    states — the same list the Auto Loan Calculator uses. With no state
//    picked, the trade-in counts and the cash back doesn't.
//  - The verdict compares interest saved (cash-back loan's interest − low
//    rate loan's interest, rounded to whole dollars) with the cash back:
//    low rate better when it wins by at least 0.05% of the auto price,
//    "The Offers are Similar" when it wins by less, cash back otherwise. It ignores the total cost
//    (in a rebate-exempt state the cash-back total can be lower while the
//    low rate still "wins") — replicated as-is.
//  - Nothing is clamped: a down payment above the price gives a negative
//    loan and negative payments, exactly like the reference.
//  - If the low rate isn't below the high rate, the reference prints its
//    own (ungrammatical) note instead of results; copied verbatim.
//  - All nine fields are required and ≥ 0 (the term > 0).

import { INCENTIVE_TAX_EXEMPT_STATES, US_STATES } from "./autoLoanCalculatorEngine.js";

export { US_STATES };

export const DEFAULTS = {
  cashBack: "1000", rateHigh: "5", rateLow: "2", price: "50000", term: "60",
  downPayment: "10000", tradeIn: "0", taxRate: "7", fees: "2000",
};

/** States that tax the full price, giving no credit for the trade-in. */
const NO_TRADE_IN_CREDIT = new Set([
  "California", "District of Columbia", "Hawaii", "Kentucky", "Maryland", "Michigan", "Montana", "Virginia",
]);

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
function parse(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  const n = NUMERIC.test(text) ? Number(text) : NaN;
  return Number.isFinite(n) ? n : NaN;
}

const MESSAGES = {
  cashBack: "Please provide a positive cash back amount.",
  price: "Please provide a positive auto price.",
  downPayment: "Please provide a positive down payment value.",
  term: "Please provide a positive loan term value.",
  rateHigh: "Please provide a positive interest with cash offer value.",
  rateLow: "Please provide a positive interest without cash offer value.",
  tradeIn: "Please provide a positive trade-in value.",
  taxRate: "Please provide a positive sale tax value.",
  fees: "Please provide a positive title, registration and other fees value.",
};
const ORDER = ["cashBack", "price", "downPayment", "term", "rateHigh", "rateLow", "tradeIn", "taxRate", "fees"];

export const NOT_LOWER_NOTE = "Since the interest rate with cash back offer is not lower. So it is always good to take the cash back offer.";

function monthlyPayment(principal, annualRatePercent, n) {
  const i = annualRatePercent / 100 / 12;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

function offer({ loan, ratePercent, n, tax, upfront, tradeIn }) {
  const monthly = monthlyPayment(loan, ratePercent, n);
  const totalPayments = monthly * n;
  const interest = totalPayments - loan;
  // The trade-in is part of what you pay for the car, so it counts toward
  // the total cost (= price + interest + tax + fees − cash back).
  return { loan, tax, upfront, monthly, totalPayments, interest, totalCost: totalPayments + upfront + tradeIn };
}

/** "$3,092", "$-132" — the verdict sentence's whole-dollar style. */
export function formatWholeDollars(value) {
  const rounded = Math.round(Number(Math.abs(value).toPrecision(15)));
  return value < 0 && rounded !== 0 ? `$-${rounded.toLocaleString("en-US")}` : `$${rounded.toLocaleString("en-US")}`;
}

export function calculateCashBackOrLowInterest(input) {
  const v = Object.fromEntries(ORDER.map((k) => [k, parse(input[k])]));
  const errors = ORDER.filter((k) => (k === "term" ? !(v[k] > 0) : !(v[k] >= 0))).map((k) => MESSAGES[k]);
  if (errors.length) return { errors };
  if (!(v.rateLow < v.rateHigh)) return { note: NOT_LOWER_NOTE };

  const state = input.state || "";
  const tradeInCredit = !NO_TRADE_IN_CREDIT.has(state);
  const rebateCredit = state !== "" && INCENTIVE_TAX_EXEMPT_STATES.has(state);
  const t = v.taxRate / 100;
  const taxable = v.price - (tradeInCredit ? v.tradeIn : 0);
  const includeFees = Boolean(input.includeFees);
  const n = v.term;

  const cashBackTax = t * (taxable - (rebateCredit ? v.cashBack : 0));
  const build = (cashBack, ratePercent, tax, financedTax) => {
    const loan = v.price - v.downPayment - v.tradeIn - cashBack + (includeFees ? financedTax + v.fees : 0);
    const upfront = v.downPayment + (includeFees ? 0 : tax + v.fees);
    return offer({ loan, ratePercent, n, tax, upfront, tradeIn: v.tradeIn });
  };
  const cashBackOffer = build(v.cashBack, v.rateHigh, cashBackTax, cashBackTax);
  // Reference bug, replicated: when fees are financed, the low-rate loan
  // rolls in the CASH-BACK offer's sales tax, while its own "Sale Tax" row
  // shows its own (higher, in rebate-exempt states) tax. Confirmed live.
  const lowRateOffer = build(0, v.rateLow, t * taxable, cashBackTax);

  const saving = cashBackOffer.interest - lowRateOffer.interest;
  // Verdict (bisected live at three price levels and both edges): compare
  // the saving ROUNDED to whole dollars with the raw cash back. "Similar"
  // when the low rate wins by more than $0 but less than 0.05% of the price.
  const margin = Math.round(Number(saving.toPrecision(15))) - v.cashBack;
  const verdict = margin >= 0.0005 * v.price ? "low" : margin > 0 ? "similar" : "cashBack";
  const $s = formatWholeDollars(saving);
  const $c = formatWholeDollars(v.cashBack);
  return {
    verdict,
    lowIsBetter: verdict === "low",
    headline: { low: "The Low Interest Rate Offer is Better!", similar: "The Offers are Similar", cashBack: "The Cash Back Offer is Better!" }[verdict],
    sentence: {
      low: `The low rate will save you ${$s} in interest, which is larger than the cash back of ${$c}.`,
      similar: `The low rate will save you ${$s} in interest, which is similar to the cash back of ${$c}.`,
      cashBack: `The low rate will save you only ${$s} in interest, yet the cash back is ${$c}.`,
    }[verdict],
    termText: String(n),
    cashBackOffer,
    lowRateOffer,
  };
}
