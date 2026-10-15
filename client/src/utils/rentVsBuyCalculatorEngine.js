// Rent vs. Buy Calculator engine — matches calculator.net/rent-vs-buy-calculator.html
// (decoded with live GET probes; see scripts/rent-vs-buy-calculator.test.js).
//
// For each stay of L = 1…30 years, the average yearly cost of buying and of
// renting. Every cost is carried forward to the end of the stay at the
// after-tax investment return g = 1 + return × (1 − federal − state rate):
//   total(L) = upfront × g^L + Σ cost_k × g^(L−k)
// Buying: down payment + buying closing costs upfront; each year the mortgage
// payments, property tax (% of the price, own yearly increase), insurance and
// HOA (cost increase), maintenance (% of the appreciated value) less the tax
// savings; at the end the sale (value − selling costs − loan balance − tax on
// the gain) is credited.
// Renting: upfront cost; each year rent + renter's insurance (rental
// increase, applied from year 1); plus the deposit's lost return D(g^L − 1).
//
// Reference quirks reproduced:
// - Tax savings = (federal + state) × max(0, interest + property tax −
//   threshold), where the interest is the average of the year's opening and
//   closing balances × the rate, and the threshold is $15,000 for every filing
//   status except head of household ($22,500).
// - The loan's final year (k ≥ term) has no payments and no interest
//   deduction, and the balance is treated as paid off.
// - Home-sale gain (net sale price − price − buying costs) above an exclusion
//   ($500k joint/widow, $375k head of household, $250k otherwise) is taxed at 15%.
// - Break-even: linear interpolation of (average buy − average rent) between
//   the last sign change and the year before; "year 0"
//   is 12 × price × (buying % + selling %) against the first year's rent.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const RVB_DEFAULTS = {
  price: "500000", downPayment: "20", rate: "7.388", years: "30", buyClosing: "2", propertyTax: "1.5", propertyTaxIncrease: "3",
  insurance: "2500", hoa: "0", maintenance: "1.5", appreciation: "3", costIncrease: "3", sellClosing: "7",
  rent: "3000", rentIncrease: "3", rentInsurance: "15", deposit: "3000", upfront: "100",
  investReturn: "5", federalTax: "25", stateTax: "0",
};
export const FILING_STATUSES = [
  { value: "Single", label: "single" },
  { value: "MarriedJoint", label: "married filing jointly" },
  { value: "MarriedSeparately", label: "married filing separately" },
  { value: "HeadofHousehold", label: "head of household" },
  { value: "Widow", label: "qualified widow" },
];
const STAY_YEARS = 30;
const GAIN_EXCLUSION = { Single: 250000, MarriedSeparately: 250000, HeadofHousehold: 375000, MarriedJoint: 500000, Widow: 500000 };

// [key, message, rule] in the reference's message order. Rules: "pos" (≥ 0), "any" (any number).
const FIELDS = [
  ["price", "Please provide a positive home price amount.", "pos"],
  ["downPayment", "Please provide a down payment percentage between 0 and 100.", "pct"],
  ["rate", "Please provide a positive interest rate.", "pos"],
  ["years", "Please provide a positive loan term.", "term"],
  ["buyClosing", "Please provide a positive buying closing costs.", "pos"],
  ["propertyTax", "Please provide a positive property tax rate.", "pos"],
  ["propertyTaxIncrease", "Please provide a numerical property tax increase rate.", "any"],
  ["insurance", "Please provide a positive home insurance amount.", "pos"],
  ["hoa", "Please provide a positive HOA fee amount.", "pos"],
  ["maintenance", "Please provide a positive maintenance cost.", "pos"],
  ["appreciation", "Please provide a numerical home value appreciation rate.", "any"],
  ["costIncrease", "Please provide a numerical cost, fee, and insurance increase rate.", "any"],
  ["sellClosing", "Please provide a positive selling closing costs.", "pos"],
  ["rent", "Please provide a positive monthly rental fee.", "pos"],
  ["rentIncrease", "Please provide a numerical rental fee increase rate.", "any"],
  ["rentInsurance", "Please provide a positive renter's insurance amount.", "pos"],
  ["deposit", "Please provide a positive security deposit amount.", "pos"],
  ["upfront", "Please provide a positive upfront cost amount.", "pos"],
  ["investReturn", "Please provide a positive average investment return rate.", "pos"],
  ["federalTax", "Please provide a positive marginal federal tax rate.", "pos"],
  ["stateTax", "Please provide a positive marginal state income tax rate.", "pos"],
];

const dollars = (v) => `$${formatNumber(v, 0)}`;

/** @param {object} input — the RVB_DEFAULTS keys as strings, plus filingStatus. */
export function calculateRentVsBuy(input) {
  const errors = [];
  const v = {};
  for (const [key, message, rule] of FIELDS) {
    const x = num(clean(input[key]));
    const bad = Number.isNaN(x)
      || (rule === "pos" && x < 0)
      || (rule === "pct" && (x < 0 || x > 100))
      || (rule === "term" && x < 2);
    if (bad) errors.push(message);
    v[key] = x;
  }
  if (errors.length) return { errors };

  const pct = (x) => x / 100;
  const price = v.price;
  const loan = price * (1 - pct(v.downPayment));
  const term = v.years;
  const r = v.rate / 1200;
  const months = term * 12;
  const payment = loan === 0 ? 0 : r === 0 ? loan / months : (loan * r) / (1 - (1 + r) ** -months);
  const g = 1 + pct(v.investReturn) * (1 - pct(v.federalTax) - pct(v.stateTax));
  const taxRate = pct(v.federalTax) + pct(v.stateTax);
  const threshold = input.filingStatus === "HeadofHousehold" ? 22500 : 15000;
  const exclusion = GAIN_EXCLUSION[input.filingStatus] ?? 500000;

  // Year-end loan balances.
  const balance = [loan];
  let b = loan;
  for (let k = 1; k <= STAY_YEARS; k++) {
    for (let m = 1; m <= 12; m++) {
      if ((k - 1) * 12 + m > months || b <= 0) break;
      b -= payment - b * r;
    }
    if (b < 1e-6 || k >= term) b = 0;
    balance.push(b);
  }

  const rows = [];
  let buyCarry = price * pct(v.downPayment) + price * pct(v.buyClosing);
  let rentCarry = v.upfront;
  for (let k = 1; k <= STAY_YEARS; k++) {
    const value = price * (1 + pct(v.appreciation)) ** k;
    const propertyTax = price * pct(v.propertyTax) * (1 + pct(v.propertyTaxIncrease)) ** k;
    const inLoan = k < term;
    const interest = inLoan ? ((balance[k - 1] + balance[k]) / 2) * pct(v.rate) : 0;
    const savings = taxRate * Math.max(0, interest + propertyTax - threshold);
    const growth = (1 + pct(v.costIncrease)) ** k;
    const yearCost = (inLoan ? payment * 12 : 0) + propertyTax + (v.insurance + v.hoa) * growth + pct(v.maintenance) * value - savings;
    buyCarry = buyCarry * g + yearCost;
    const netSale = value * (1 - pct(v.sellClosing));
    const gainsTax = 0.15 * Math.max(0, netSale - price * (1 + pct(v.buyClosing)) - exclusion);
    const buyTotal = buyCarry - (netSale - balance[k] - gainsTax);

    rentCarry = rentCarry * g + 12 * (v.rent + v.rentInsurance) * (1 + pct(v.rentIncrease)) ** k;
    const rentTotal = rentCarry + v.deposit * (g ** k - 1);
    rows.push({ years: k, buyAnnual: buyTotal / k, rentAnnual: rentTotal / k });
  }

  // Break-even stay length.
  // "Year 0" stands in as 12 × the buying and selling costs against the first
  // year's rent. The reference reports the last sign change in either direction
  // (so a late return to "buying dearer" is still worded "buying is cheaper").
  // Interpolated on the whole-dollar monthly figures the table shows.
  const monthly = (x) => Math.round(x / 12);
  const diffs = [
    Math.round(price * (pct(v.buyClosing) + pct(v.sellClosing))) - monthly(rows[0].rentAnnual),
    ...rows.map((x) => monthly(x.buyAnnual) - monthly(x.rentAnnual)),
  ];
  let breakEven = null;
  for (let k = 0; k < STAY_YEARS; k++) {
    if ((diffs[k] > 0) !== (diffs[k + 1] > 0)) breakEven = k + diffs[k] / (diffs[k] - diffs[k + 1]);
  }
  const verdict = breakEven === null
    ? "Renting is cheaper in the next 30 years."
    : `Buying is cheaper if you stay for ${formatNumber(breakEven, 1)} years or longer. Otherwise, renting is cheaper.`;

  return {
    verdict,
    breakEven,
    table: rows.map((x) => ({
      label: `${x.years} Year${x.years === 1 ? "" : "s"}`,
      buyCheaper: x.buyAnnual < x.rentAnnual,
      buyMonthly: dollars(x.buyAnnual / 12), buyAnnual: dollars(x.buyAnnual),
      rentMonthly: dollars(x.rentAnnual / 12), rentAnnual: dollars(x.rentAnnual),
    })),
    chart: rows.map((x) => ({ year: x.years, buy: x.buyAnnual / 12, rent: x.rentAnnual / 12 })),
  };
}
