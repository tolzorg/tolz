// Down Payment Calculator engine — matches calculator.net/down-payment-calculator.html
// (decoded with live GET probes; see scripts/down-payment-calculator.test.js).
// Three forms:
//   1. Upfront cash available → home price = (cash − $ closing costs) ÷ (down % + closing %).
//   2. Home price → cash needed = down payment + closing costs.
//   3. Home price + upfront cash → down payment = cash − closing costs (may go negative).
// Closing costs are a % of the home price or a dollar amount. Results are whole
// dollars; forms 1 and 2 add a table for 3.5% (FHA), 5%, 10%, 15% and 20% down.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const DEFAULTS = {
  cash: { cash: "100000", downPercent: "20", closingCosts: "3", rate: "7.388", years: "30" },
  price: { price: "500000", downPercent: "20", closingCosts: "3", rate: "7.388", years: "30" },
  both: { price: "500000", cash: "100000", closingCosts: "3", rate: "7.388", years: "30" },
};
export const OTHER_PERCENTS = [3.5, 5, 10, 15, 20];
export const PMI_NOTE = "Since the down payment is less than 20%, most probably you will be asked to pay PMI Insurance or mortgage insurance premium.";
export const NO_DOWN_NOTE = "Given that there are no down payment or closing costs, the limit to the home price you can afford depends solely on the amount of money you can borrow.";

const dollars = (v) => `$${formatNumber(v, 0)}`;

function monthlyPayment(loan, rate, years) {
  const n = years * 12;
  const r = rate / 1200;
  return r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);
}

/** Reads closing costs, interest rate and loan term (shared tail of all three forms). */
function readCommon(input, errors, cashCap = null) {
  const include = !!input.includeClosing;
  const byDollar = input.closingUnit === "dollar";
  let closing = 0;
  if (include) {
    closing = num(clean(input.closingCosts));
    if (Number.isNaN(closing) || closing < 0) errors.push("Please provide a positive closing costs.");
    else if (!byDollar && closing >= 100) errors.push("Closing costs percentage should not be so high.");
    else if (byDollar && cashCap !== null && closing > cashCap) errors.push("Closing costs should not be more than the cash amount you plan to put in.");
  }
  const rate = num(clean(input.rate));
  if (Number.isNaN(rate) || rate < 0) errors.push("Please provide a positive interest rate.");
  const years = num(clean(input.years));
  if (Number.isNaN(years) || years <= 0) errors.push("Please provide a positive loan term.");
  return { include, byDollar, closing, rate, years };
}

function readNonNegative(text, message, errors) {
  const v = num(clean(text));
  if (Number.isNaN(v) || v < 0) { errors.push(message); return 0; }
  return v;
}

/** Form 1: affordable home price from the upfront cash available. */
export function calculateFromCash(input) {
  const errors = [];
  const cash = readNonNegative(input.cash, "Please provide a positive cash amount to put into house.", errors);
  const down = readNonNegative(input.downPercent, "Please provide a positive down payment percentage.", errors);
  const c = readCommon(input, errors, cash);
  if (errors.length) return { errors };

  const closingPct = c.include && !c.byDollar ? c.closing : 0;
  const closingFixed = c.include && c.byDollar ? c.closing : 0;
  const scenario = (pct) => {
    const price = Math.max(0, (cash - closingFixed) / ((pct + closingPct) / 100));
    const downAmount = (price * pct) / 100;
    const closingAmount = c.include ? (c.byDollar ? c.closing : (price * c.closing) / 100) : null;
    const loan = price - downAmount;
    return { price, downAmount, closingAmount, loan, payment: monthlyPayment(loan, c.rate, c.years) };
  };
  if (down + closingPct === 0) return closingFixed > 0 ? { empty: true } : { title: "Results", message: NO_DOWN_NOTE };

  const s = scenario(down);
  const rows = [["Home Price", dollars(s.price)], ["Down Payment", dollars(s.downAmount)]];
  if (c.include) rows.push(["Closing Costs", dollars(s.closingAmount)]);
  rows.push(["Loan Amount", dollars(s.loan)], ["Monthly Payment", dollars(s.payment)]);

  const others = OTHER_PERCENTS.map(scenario);
  const table = [
    ["Home Price", others.map((o) => dollars(o.price))],
    ["Down Payment", others.map((o) => dollars(o.downAmount))],
    ...(c.include ? [["Closing Costs", others.map((o) => dollars(o.closingAmount))]] : []),
    ["Loan Amount", others.map((o) => dollars(o.loan))],
    ["Monthly Payment", others.map((o) => dollars(o.payment))],
  ];
  return { title: `Home Price: ${dollars(s.price)}`, rows, note: down < 20 ? PMI_NOTE : null, table };
}

/** Form 2: cash needed for a given home price. */
export function calculateFromPrice(input) {
  const errors = [];
  const price = readNonNegative(input.price, "Please provide a positive home price amount.", errors);
  const down = readNonNegative(input.downPercent, "Please provide a positive down payment percentage.", errors);
  const c = readCommon(input, errors);
  if (errors.length) return { errors };

  const closingAmount = c.include ? (c.byDollar ? c.closing : (price * c.closing) / 100) : 0;
  const scenario = (pct) => {
    const downAmount = (price * pct) / 100;
    const loan = price - downAmount;
    return { downAmount, cash: downAmount + closingAmount, loan, payment: monthlyPayment(loan, c.rate, c.years) };
  };
  const s = scenario(down);
  const rows = [["Down Payment", dollars(s.downAmount)]];
  if (c.include) rows.push(["Closing Costs", dollars(closingAmount)], ["Down Payment + Closing Costs", dollars(s.cash)]);
  rows.push(["Loan Amount", dollars(s.loan)], ["Monthly Payment", dollars(s.payment)]);

  const others = OTHER_PERCENTS.map(scenario);
  const table = [
    ...(c.include ? [["Cash Needed", others.map((o) => dollars(o.cash))]] : []),
    ["Down Payment", others.map((o) => dollars(o.downAmount))],
    ...(c.include ? [["Closing Costs", others.map(() => dollars(closingAmount))]] : []),
    ["Loan Amount", others.map((o) => dollars(o.loan))],
    ["Monthly Payment", others.map((o) => dollars(o.payment))],
  ];
  return {
    title: c.include ? `Cash Needed: ${dollars(s.cash)}` : `Down Payment: ${dollars(s.downAmount)}`,
    rows, note: down < 20 ? PMI_NOTE : null, table,
  };
}

/** Form 3: down payment percentage from the home price and the upfront cash. */
export function calculateDownPercent(input) {
  const errors = [];
  const price = readNonNegative(input.price, "Please provide a positive home price amount.", errors);
  const cash = readNonNegative(input.cash, "Please provide a positive upfront cash available amount.", errors);
  const c = readCommon(input, errors);
  if (errors.length) return { errors };
  if (price === 0) return { empty: true };

  const closingAmount = c.include ? (c.byDollar ? c.closing : (price * c.closing) / 100) : 0;
  const downAmount = cash - closingAmount;
  const pct = (downAmount / price) * 100;
  const pctText = `${formatNumber(pct, 1)}%`;
  const loan = price - downAmount;
  const rows = [
    ["Down Payment", dollars(downAmount)],
    ["Down Payment Percentage", pctText],
    ["Closing Costs", dollars(closingAmount)],
    ["Loan Amount", dollars(loan)],
    ["Monthly Payment", dollars(monthlyPayment(loan, c.rate, c.years))],
  ];
  return { title: `Down Payment: ${pctText}`, rows, note: pct < 20 ? PMI_NOTE : null, table: null };
}
