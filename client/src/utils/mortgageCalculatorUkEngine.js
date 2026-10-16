// Mortgage Calculator UK engine — matches calculator.net/mortgage-calculator-uk.html
// (decoded with live GET probes; see scripts/mortgage-calculator-uk.test.js).
//
// The page runs on the same mortgage machinery as the reference's FHA and VA
// pages, so the month-by-month schedule comes from the FHA engine's shared
// simulateMortgage (fractional final payment, cost weighting, dates). UK
// differences reproduced here:
// - Pounds; the deposit is a percentage only and taxes a percentage of the price.
// - With "Include Optionals" ticked, every optional box must hold a number
//   ≥ 0 (a blank box is an error, not 0).
// - Mortgage insurance is a flat monthly premium (yearly ÷ 12) for every whole
//   month of the term (none for a fractional final month).
// - The term must be in (0, 100] years; the schedule appears only for more
//   than 12 and fewer than 720 monthly payments.
// - The pie shows the monthly costs (in the order Mortgage Repayment, Taxes,
//   Mortgage Insurance, Other Cost, Home Insurance; zero slices dropped) when
//   taxes, home insurance or other costs are set, else Principal/Interest.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";
import { simulateMortgage } from "./fhaLoanCalculatorEngine.js";

export const UK_DEFAULTS = {
  price: "500000", deposit: "25", years: "25", rate: "5",
  taxes: "1.2", homeInsurance: "2500", mortgageInsurance: "0", otherCosts: "6000",
};

export const pounds = (v) => `£${formatNumber(v, 2)}`;
export const wholePounds = (v) => `£${formatNumber(v, 0)}`;
const PALETTE = ["#2b7ddb", "#8bbc21", "#910000", "#1aadce", "#492970"];

/**
 * The reference's schedule takes each full month's balance from the closed
 * form L·gᵏ − p·(gᵏ − 1)/r (L − p·k at 0%), principal = previous − new
 * balance and interest = payment − principal. That float path decides the
 * whole-pound ties: month 1 of the default is 1,562.4999…92 → £1,562, while
 * the same tie on a 12-year term lands above and shows £1,563.
 */
function displaySchedule(sim, loan, r) {
  const { monthly, annual } = sim.schedule;
  const p = sim.payment;
  const closed = (k) => {
    if (r === 0) return loan - p * k;
    const g = (1 + r) ** k;
    return loan * g - p * ((g - 1) / r);
  };
  let prev = loan;
  const shown = monthly.map((row) => {
    const k = Number(row.label);
    // The final (fractional or paid-off) month keeps the simulated figures.
    const balance = row.balance === 0 ? 0 : k <= sim.n ? closed(k) : row.balance;
    const out = row.balance === 0 ? { ...row, principal: prev, interest: row.interest } : { ...row, principal: prev - balance, interest: p - (prev - balance), balance };
    prev = balance;
    return out;
  });
  const years = annual.map((a, y) => {
    const slice = shown.slice(y * 12, y * 12 + 12);
    return {
      ...a,
      interest: slice.reduce((s, x) => s + x.interest, 0),
      principal: slice.reduce((s, x) => s + x.principal, 0),
      balance: slice[slice.length - 1].balance,
    };
  });
  return { ...sim.schedule, monthly: shown, annual: years };
}

/**
 * @param {object} input — strings as typed: price, deposit (%), years, rate,
 *   includeOptionals (bool), taxes (% of price), homeInsurance,
 *   mortgageInsurance, otherCosts (£/year), startMonth (1–12), startYear.
 */
export function calculateMortgageUk(input) {
  const errors = [];
  const read = (k) => num(clean(input[k]));
  const price = read("price");
  if (!(price > 0)) errors.push("Please provide a positive home price value.");
  const deposit = read("deposit");
  if (!(deposit >= 0 && deposit < 100)) errors.push("Please provide a positive mortgage deposit with value between 0 and 100.");
  const years = read("years");
  if (!(years > 0 && years <= 100)) errors.push("Please provide a positive loan term value.");
  const rate = read("rate");
  if (!(rate >= 0)) errors.push("Please provide a positive interest value.");

  const optional = !!input.includeOptionals;
  const costs = {};
  if (optional) {
    for (const [key, name] of [["taxes", "taxes"], ["homeInsurance", "home insurance"], ["mortgageInsurance", "mortgage insurance"], ["otherCosts", "other costs"], ["startYear", "start date"]]) {
      costs[key] = read(key);
      if (!(costs[key] >= 0)) errors.push(`Please provide a positive ${name} value.`);
    }
  }
  if (errors.length) return { errors };

  const loan = price * (1 - deposit / 100);
  const values = {
    taxValue: optional ? costs.taxes : 0,
    insurance: optional ? costs.homeInsurance : 0,
    hoa: 0,
    other: optional ? costs.otherCosts : 0,
    startYear: optional ? costs.startYear : 0,
    inc: { tax: 0, insurance: 0, hoa: 0, other: 0 },
    extra: { monthly: 0, yearly: 0, oneTime: 0, monthlyYear: 0, yearlyYear: 0, oneTimeYear: 0 },
  };
  const sim = simulateMortgage({
    input: { startMonth: input.startMonth, taxUnit: "percent" }, loan, price, years, rate, optional, more: false, values,
    mip: { monthly: optional ? costs.mortgageInsurance / 12 : 0, charged: () => true },
  });
  const { first } = sim;
  // Costs never increase here, so each total is the monthly amount × the
  // (possibly fractional) number of payments: the reference's float path.
  const tot = { ...sim.tot, tax: first.costs.tax * sim.n, insurance: first.costs.insurance * sim.n, other: first.costs.other * sim.n };

  let table = null;
  let pie;
  if (optional) {
    const lines = [
      { label: "Taxes", first: first.costs.tax, total: tot.tax, on: sim.taxAnnual > 0 },
      { label: "Home Insurance", first: first.costs.insurance, total: tot.insurance, on: sim.ins > 0 },
      { label: "Mortgage Insurance", first: first.mip, total: tot.mip, on: tot.mipMonths > 0 },
      { label: "Other Costs", first: first.costs.other, total: tot.other, on: sim.otherAnnual > 0 },
    ].filter((x) => x.on);
    const outFirst = sim.payment + first.costs.tax + first.costs.insurance + first.mip + first.costs.other;
    const outTotal = sim.mortgageTotal + tot.tax + tot.insurance + tot.mip + tot.other;
    table = [
      { label: "Mortgage Payment", first: sim.payment, total: sim.mortgageTotal, bold: true },
      ...lines,
      { label: "Total Out-of-Pocket", first: outFirst, total: outTotal, bold: true },
    ].map((x) => ({ label: x.label, first: pounds(x.first), total: pounds(x.total), bold: !!x.bold }));
  }
  if (optional && (sim.taxAnnual > 0 || sim.ins > 0 || sim.otherAnnual > 0)) {
    pie = [
      ["Mortgage Repayment", sim.payment], ["Taxes", first.costs.tax], ["Mortgage Insurance", first.mip],
      ["Other Cost", first.costs.other], ["Home Insurance", first.costs.insurance],
    ].filter(([, v]) => v > 0);
  } else {
    // This pie keeps a £0 interest slice (0% rate).
    pie = [["Principal", loan], ["Interest", tot.interest]];
  }

  return {
    interestOnly: pounds((loan * rate) / 1200),
    monthlyRepayment: pounds(sim.payment),
    table,
    summary: [["Loan Amount", pounds(loan)], ["Mortgage Deposit", pounds(price - loan)], ["Total Interest", pounds(tot.interest)]],
    pie: pie.map(([label, value], i) => ({ label, value, color: PALETTE[i], text: pounds(value) })),
    schedule: sim.schedule && sim.n < 720 ? displaySchedule(sim, loan, rate / 1200) : null,
  };
}
