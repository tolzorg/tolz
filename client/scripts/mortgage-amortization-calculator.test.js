// Plain-Node test suite for the Mortgage Amortization Calculator engine.
// Run with:
//   node scripts/mortgage-amortization-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/mortgage-amortization-calculator.html) via plain GET
// requests. A scratch comparator also diffed 360 random scenarios (results,
// pie and both full schedules): 359 identical; the one miss is a whole-dollar
// schedule cell on an exact .5 tie at a 0% rate.

import { calculateMortgageAmortization, AMORTIZATION_DEFAULTS } from "../src/utils/mortgageAmortizationCalculatorEngine.js";
import { wholeMoney } from "../src/utils/fhaLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const am = (o = {}) => calculateMortgageAmortization({ ...AMORTIZATION_DEFAULTS, includeOptionals: true, startMonth: 10, startYear: "2026", ...o });
const table = (r) => r.table.map((x) => `${x.label} ${x.first} ${x.total}`).join(" | ");
const summary = (r) => r.summary.map((x) => x.join(" ")).join(" | ");
const pie = (r) => {
  const total = r.pie.reduce((s, p) => s + p.value, 0);
  return r.pie.map((p) => `${p.color} ${p.label} ${p.text} (${Math.round((p.value / total) * 100)}%)`).join(" / ");
};
const year = (r, k) => { const a = r.schedule.annual[k - 1]; return `${a.label} ${a.date} ${wholeMoney(a.interest)} ${wholeMoney(a.principal)} ${wholeMoney(a.balance)}`; };
const month = (r, k) => { const m = r.schedule.monthly[k - 1]; return `${m.label} ${m.date} ${wholeMoney(m.interest)} ${wholeMoney(m.principal)} ${wholeMoney(m.balance)}`; };

{
  const r = am();
  eq("monthly pay", r.monthlyPay, "$2,782.90");
  eq("cost table", table(r), "Mortgage Payment $2,782.90 $1,001,844.86 | Property Tax $500.00 $180,000.00 | Home Insurance $208.33 $75,000.00 | Other Costs $416.67 $150,000.00 | Total Out-of-Pocket $3,907.90 $1,406,844.86");
  eq("summary", summary(r), "House Price $500,000.00 | Loan Amount $400,000.00 | Down Payment $100,000.00 | Total of 360 Mortgage Payments $1,001,844.86 | Total Interest $601,844.86 | Mortgage Payoff Date Oct. 2056");
  eq("pie", pie(r), "#2b7ddb Mortgage Payment $2,782.90 (71%) / #8bbc21 Property Taxes $500.00 (13%) / #910000 Other Cost $416.67 (11%) / #1aadce Home Insurance $208.33 (5%)");
  eq("year 1", year(r, 1), "1 10/26-9/27 $29,671 $3,724 $396,276");
  eq("year 30", year(r, 30), "30 10/55-9/56 $1,309 $32,086 $0");
  eq("month 360", month(r, 360), "360 9/2056 $17 $2,766 $0");
}
{
  const r = am({ mortgageInsurance: "1200", downPayment: "5" });
  eq("PMI row", table(r).split(" | ")[3], "PMI $100.00 $13,500.00");
  eq("PMI payoff", r.summary.at(-1).join(" "), "PMI Payoff Date (135 Total Payments) Jan. 2038");
}
{
  const r = am({ mortgageInsurance: "1200", hoa: "2400" });
  eq("HOA row label", table(r).split(" | ")[3], "HOA Fee $200.00 $72,000.00");
  eq("20% down: PMI only in pie", pie(r), "#2b7ddb Mortgage Payment $2,782.90 (66%) / #8bbc21 Property Taxes $500.00 (12%) / #910000 PMI $100.00 (2%) / #1aadce Other Cost $416.67 (10%) / #492970 Home Insurance $208.33 (5%) / #c21271 HOA Fee $200.00 (5%)");
  eq("20% down: out-of-pocket counts PMI monthly only", table(r).split(" | ").at(-1), "Total Out-of-Pocket $4,207.90 $1,478,844.86");
}
{
  const r = am({ years: "2.55", mortgageInsurance: "1200", downPayment: "19.4" });
  eq("PMI required, never charged", table(r).split(" | ")[3], "PMI $100.00 $0.00");
  eq("0 payments line", r.summary.at(-1).join(" "), "PMI Payoff Date (0 Total Payments) Oct. 2026");
  eq("fractional term", r.summary[3].join(" "), "Total of 30.60 Mortgage Payments $443,731.59");
  eq("short final year", year(r, 3), "3 10/28-5/29 $2,218 $93,489 $0");
}
{
  const r = am({ includeOptionals: false });
  eq("no optionals: no payoff date", summary(r), "House Price $500,000.00 | Loan Amount $400,000.00 | Down Payment $100,000.00 | Total of 360 Mortgage Payments $1,001,844.86 | Total Interest $601,844.86");
  eq("no optionals: P/I pie", pie(r), "#2b7ddb Principal $400,000.00 (40%) / #8bbc21 Interest $601,844.86 (60%)");
  eq("no optionals: no dates", r.schedule.showDates, false);
}
eq("0% down: no price/loan/down rows", summary(am({ downPayment: "0" })), "Total of 360 Mortgage Payments $1,252,306.08 | Total Interest $752,306.08 | Mortgage Payoff Date Oct. 2056");
eq("60 years: no schedule", am({ years: "60" }).schedule, null);
eq("59.9 years: schedule", am({ years: "59.9" }).schedule.monthly.length, 719);
eq("60 years: payment", am({ years: "60" }).monthlyPay, "$2,512.18");

eq("all errors", am({ price: "abc", downPayment: "x", years: "y", rate: "z", propertyTaxes: "q", homeInsurance: "w", mortgageInsurance: "e", hoa: "h", otherCosts: "r", startYear: "t" }).errors.join(" | "),
  "Please provide a positive home price value. | Please provide a positive down payment with value between 0 and 100. | Please provide a positive loan term value. | Please provide a positive interest value. | Please provide a positive property taxes value. | Please provide a positive home insurance value. | Please provide a positive PMI insurance value. | Please provide a positive HOA fee value. | Please provide a positive other costs value. | Please provide a positive start date value.");
eq("term over 100", am({ years: "101" }).errors.join(), "Please provide a positive loan term value.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
