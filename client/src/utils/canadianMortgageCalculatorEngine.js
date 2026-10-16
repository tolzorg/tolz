// Canadian Mortgage Calculator engine — matches
// calculator.net/canadian-mortgage-calculator.html (decoded with live GET
// probes; see scripts/canadian-mortgage-calculator.test.js).
//
// Same mortgage machinery as the reference's FHA/VA/UK pages (the FHA
// engine's simulateMortgage plus the UK engine's closed-form display
// schedule), with these differences:
// - The rate compounds semi-annually: monthly rate = (1 + R/200)^(1/6) − 1.
// - The down payment and property taxes are percentages only. With
//   "Include Optionals" ticked every optional box must hold a number ≥ 0.
// - Mortgage insurance (PMI) is charged monthly while the end-of-month
//   balance is above 80% of the price, with a "PMI Payoff Date" line. Quirks
//   kept from the reference: when it is never charged it still shows as a pie
//   slice and in the first-month Out-of-Pocket figure, but has no table row.
// - Unticking the optionals drops the year from the payoff date: the month
//   stays right but the year always reads 0 (e.g. "Oct. 0").
// - The schedule appears only for more than 12 and fewer than 720 payments.

import { clean, num } from "./marginCalculatorEngine.js";
import { simulateMortgage, money, monthYear } from "./fhaLoanCalculatorEngine.js";
import { closedFormSchedule, closedFormBalance } from "./mortgageCalculatorUkEngine.js";

export const CA_DEFAULTS = {
  price: "800000", downPayment: "20", years: "25", rate: "5",
  propertyTaxes: "0.3", homeInsurance: "2500", mortgageInsurance: "0", hoa: "0", otherCosts: "6000",
};

const PALETTE = ["#2b7ddb", "#8bbc21", "#910000", "#1aadce", "#492970", "#c21271"];

/** Monthly rate equivalent to a nominal annual rate compounded semi-annually. */
export const canadianMonthlyRate = (rate) => (1 + rate / 200) ** (1 / 6) - 1;

/**
 * @param {object} input — strings as typed: price, downPayment (%), years,
 *   rate, includeOptionals (bool), propertyTaxes (% of price), homeInsurance,
 *   mortgageInsurance, hoa, otherCosts ($/year), startMonth (1–12), startYear.
 */
export function calculateCanadianMortgage(input) {
  const errors = [];
  const read = (k) => num(clean(input[k]));
  const price = read("price");
  if (!(price > 0)) errors.push("Please provide a positive home price value.");
  const down = read("downPayment");
  if (!(down >= 0 && down < 100)) errors.push("Please provide a positive down payment with value between 0 and 100.");
  const years = read("years");
  if (!(years > 0 && years <= 100)) errors.push("Please provide a positive loan term value.");
  const rate = read("rate");
  if (!(rate >= 0)) errors.push("Please provide a positive interest value.");

  const optional = !!input.includeOptionals;
  const c = {};
  if (optional) {
    for (const [key, name] of [["propertyTaxes", "property taxes"], ["homeInsurance", "home insurance"], ["mortgageInsurance", "mortgage insurance"],
      ["hoa", "Condo/HOA fee"], ["otherCosts", "other costs"], ["startYear", "start date"]]) {
      c[key] = read(key);
      if (!(c[key] >= 0)) errors.push(`Please provide a positive ${name} value.`);
    }
  }
  if (errors.length) return { errors };

  const loan = price * (1 - down / 100);
  const r = canadianMonthlyRate(rate);
  const pmiMonthly = optional ? c.mortgageInsurance / 12 : 0;
  const pmiCutoff = 0.8 * price;
  // PMI applies only to loans that start above 80% of the price; its row and
  // payoff line then show even if the balance is already below 80% after the
  // first payment ("0 Total Payments").
  const pmiRequired = optional && pmiMonthly > 0 && loan > pmiCutoff;
  // The PMI test uses the reference's closed-form balance, which lands exactly
  // on 80% at 0% (500,000 − 1,388.89 × 72 = 400,000: no premium that month).
  const n = years * 12;
  const payment = r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);
  const sim = simulateMortgage({
    input: { startMonth: input.startMonth, taxUnit: "percent" }, loan, price, years, rate, optional, more: false, monthlyRate: r,
    values: {
      taxValue: optional ? c.propertyTaxes : 0, insurance: optional ? c.homeInsurance : 0, hoa: optional ? c.hoa : 0,
      other: optional ? c.otherCosts : 0, startYear: optional ? c.startYear : 0,
      inc: { tax: 0, insurance: 0, hoa: 0, other: 0 },
      extra: { monthly: 0, yearly: 0, oneTime: 0, monthlyYear: 0, yearlyYear: 0, oneTimeYear: 0 },
    },
    mip: { monthly: pmiMonthly, charged: (k, balance) => balance > 0 && closedFormBalance(loan, payment, r, k) > pmiCutoff },
  });
  const { first } = sim;
  // At 0% the reference's payment total is exactly the loan.
  const mortgageTotal = r === 0 ? loan : sim.mortgageTotal;
  // No cost ever increases, so each total is the monthly amount × the
  // (possibly fractional) number of payments.
  const tot = { ...sim.tot, tax: first.costs.tax * sim.n, insurance: first.costs.insurance * sim.n, hoa: first.costs.hoa * sim.n, other: first.costs.other * sim.n };

  let table = null;
  if (optional) {
    const lines = [
      { label: "Property Tax", first: first.costs.tax, total: tot.tax, on: sim.taxAnnual > 0 },
      { label: "Home Insurance", first: first.costs.insurance, total: tot.insurance, on: sim.ins > 0 },
      { label: "Mortgage Insurance", first: pmiMonthly, total: tot.mip, on: pmiRequired },
      { label: "Condo/HOA Fee", first: first.costs.hoa, total: tot.hoa, on: sim.hoaAnnual > 0 },
      { label: "Other Costs", first: first.costs.other, total: tot.other, on: sim.otherAnnual > 0 },
    ].filter((x) => x.on);
    // The first-month total counts the premium even when it is never charged.
    const outFirst = sim.payment + first.costs.tax + first.costs.insurance + pmiMonthly + first.costs.hoa + first.costs.other;
    const outTotal = mortgageTotal + tot.tax + tot.insurance + tot.mip + tot.hoa + tot.other;
    table = [
      { label: "Mortgage Payment", first: sim.payment, total: mortgageTotal, bold: true },
      ...lines,
      { label: "Total Out-of-Pocket", first: outFirst, total: outTotal, bold: true },
    ].map((x) => ({ label: x.label, first: money(x.first), total: money(x.total), bold: !!x.bold }));
  }

  let pie;
  if (optional && (sim.taxAnnual > 0 || sim.ins > 0 || sim.otherAnnual > 0 || sim.hoaAnnual > 0)) {
    pie = [
      ["Mortgage Payment", sim.payment], ["Property Taxes", first.costs.tax], ["PMI", pmiMonthly],
      ["Other Cost", first.costs.other], ["Home Insurance", first.costs.insurance], ["HOA Fee", first.costs.hoa],
    ].filter(([, v]) => v > 0);
  } else {
    pie = [["Principal", loan], ["Interest", tot.interest]];
  }

  const summary = [];
  if (down > 0) summary.push(["House Price", money(price)], ["Loan Amount", money(loan)], ["Down Payment", money(price - loan)]);
  summary.push([`Total of ${sim.paymentsCount} Mortgage Payments`, money(mortgageTotal)], ["Total Interest", money(tot.interest)],
    ["Mortgage Payoff Date", monthYear(optional ? sim.payoffDate : { month: sim.payoffDate.month, year: 0 })]);
  if (pmiRequired) {
    const m = sim.start.month - 1 + tot.mipMonths;
    summary.push([`PMI Payoff Date (${tot.mipMonths} Total Payments)`, monthYear({ month: (m % 12) + 1, year: sim.start.year + Math.floor(m / 12) })]);
  }

  return {
    monthlyPay: money(sim.payment),
    table,
    summary,
    pie: pie.map(([label, value], i) => ({ label, value, color: PALETTE[i], text: money(value) })),
    schedule: sim.schedule && sim.n < 720 ? closedFormSchedule(sim, loan, r) : null,
  };
}
