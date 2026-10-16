// Plain-Node test suite for the Canadian Mortgage Calculator engine.
// Run with:
//   node scripts/canadian-mortgage-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/canadian-mortgage-calculator.html) via plain GET requests.
// A scratch comparator also diffed random scenarios (results, pie and both
// full schedules): 256/256 identical after the last fixes.

import { calculateCanadianMortgage, CA_DEFAULTS, canadianMonthlyRate } from "../src/utils/canadianMortgageCalculatorEngine.js";
import { wholeMoney } from "../src/utils/fhaLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const ca = (o = {}) => calculateCanadianMortgage({ ...CA_DEFAULTS, includeOptionals: true, startMonth: 10, startYear: "2026", ...o });
const table = (r) => r.table.map((x) => `${x.label} ${x.first} ${x.total}`).join(" | ");
const summary = (r) => r.summary.map((x) => x.join(" ")).join(" | ");
const pie = (r) => {
  const total = r.pie.reduce((s, p) => s + p.value, 0);
  return r.pie.map((p) => `${p.color} ${p.label} ${p.text} (${Math.round((p.value / total) * 100)}%)`).join(" / ");
};
const year = (r, k) => { const a = r.schedule.annual[k - 1]; return `${a.label} ${a.date} ${wholeMoney(a.interest)} ${wholeMoney(a.principal)} ${wholeMoney(a.balance)}`; };
const month = (r, k) => { const m = r.schedule.monthly[k - 1]; return `${m.label} ${m.date} ${wholeMoney(m.interest)} ${wholeMoney(m.principal)} ${wholeMoney(m.balance)}`; };

eq("semi-annual monthly rate", canadianMonthlyRate(5).toFixed(10), "0.0041239155");
{
  const r = ca();
  eq("monthly pay", r.monthlyPay, "$3,722.27");
  eq("cost table", table(r), "Mortgage Payment $3,722.27 $1,116,681.57 | Property Tax $200.00 $60,000.00 | Home Insurance $208.33 $62,500.00 | Other Costs $500.00 $150,000.00 | Total Out-of-Pocket $4,630.61 $1,389,181.57");
  eq("summary", summary(r), "House Price $800,000.00 | Loan Amount $640,000.00 | Down Payment $160,000.00 | Total of 300 Mortgage Payments $1,116,681.57 | Total Interest $476,681.57 | Mortgage Payoff Date Oct. 2051");
  eq("pie", pie(r), "#2b7ddb Mortgage Payment $3,722.27 (80%) / #8bbc21 Property Taxes $200.00 (4%) / #910000 Other Cost $500.00 (11%) / #1aadce Home Insurance $208.33 (4%)");
  eq("year 1", year(r, 1), "1 10/26-9/27 $31,373 $13,294 $626,706");
  eq("year 25", year(r, 25), "25 10/50-9/51 $1,175 $43,493 $0");
  eq("month 13", month(r, 13), "13 10/2027 $2,584 $1,138 $625,568");
  eq("month 300", month(r, 300), "300 9/2051 $15 $3,707 $0");
}
{
  const r = ca({ mortgageInsurance: "1200", downPayment: "5" });
  eq("PMI row", table(r).split(" | ")[3], "Mortgage Insurance $100.00 $7,900.00");
  eq("PMI payoff", r.summary[r.summary.length - 1].join(" "), "PMI Payoff Date (79 Total Payments) May. 2033");
  eq("PMI pie slice", pie(r).split(" / ")[2], "#910000 PMI $100.00 (2%)");
}
{
  const r = ca({ mortgageInsurance: "1200", hoa: "2400" });
  eq("20% down: no PMI row, HOA row", table(r), "Mortgage Payment $3,722.27 $1,116,681.57 | Property Tax $200.00 $60,000.00 | Home Insurance $208.33 $62,500.00 | Condo/HOA Fee $200.00 $60,000.00 | Other Costs $500.00 $150,000.00 | Total Out-of-Pocket $4,930.61 $1,449,181.57");
  eq("20% down: PMI still in the pie", pie(r), "#2b7ddb Mortgage Payment $3,722.27 (75%) / #8bbc21 Property Taxes $200.00 (4%) / #910000 PMI $100.00 (2%) / #1aadce Other Cost $500.00 (10%) / #492970 Home Insurance $208.33 (4%) / #c21271 HOA Fee $200.00 (4%)");
}
{
  const r = ca({ price: "500000", downPayment: "19.4", years: "4", rate: "3.454", homeInsurance: "0", mortgageInsurance: "49", otherCosts: "7662", propertyTaxes: "1.2", startMonth: 4, startYear: "2032" });
  eq("PMI required but never charged", table(r).split(" | ")[2], "Mortgage Insurance $4.08 $0.00");
  eq("0 total payments line", r.summary[r.summary.length - 1].join(" "), "PMI Payoff Date (0 Total Payments) Apr. 2032");
}
eq("PMI at 0%: exact 80% tie not charged", ca({ price: "500000", downPayment: "0", years: "30", rate: "0", propertyTaxes: "0.56", homeInsurance: "0", mortgageInsurance: "1828", startMonth: 3, startYear: "2008" }).summary.at(-1).join(" "),
  "PMI Payoff Date (71 Total Payments) Feb. 2014");
eq("PMI with a fractional term", ca({ mortgageInsurance: "1200", downPayment: "5", years: "2.55" }).summary.at(-1).join(" "), "PMI Payoff Date (5 Total Payments) Mar. 2027");
{
  const r = ca({ includeOptionals: false });
  eq("no optionals: payoff year 0", r.summary.at(-1).join(" "), "Mortgage Payoff Date Oct. 0");
  eq("no optionals: P/I pie", pie(r), "#2b7ddb Principal $640,000.00 (57%) / #8bbc21 Interest $476,681.57 (43%)");
  eq("no optionals: no table", r.table, null);
}
eq("no optionals: payoff month kept", ca({ includeOptionals: false, price: "500000", downPayment: "5", years: "2.70", rate: "0", startMonth: 3 }).summary.at(-1).join(" "), "Mortgage Payoff Date Dec. 0");
eq("only PMI: P/I pie", ca({ mortgageInsurance: "1200", downPayment: "5", propertyTaxes: "0", homeInsurance: "0", otherCosts: "0" }).pie.map((p) => p.label).join(), "Principal,Interest");
eq("only HOA: cost pie", pie(ca({ hoa: "1200", propertyTaxes: "0", homeInsurance: "0", otherCosts: "0" })), "#2b7ddb Mortgage Payment $3,722.27 (97%) / #8bbc21 HOA Fee $100.00 (3%)");
eq("0% down: no price/loan/down rows", summary(ca({ downPayment: "0" })), "Total of 300 Mortgage Payments $1,395,851.96 | Total Interest $595,851.96 | Mortgage Payoff Date Oct. 2051");
{
  const r = ca({ years: "2.55" });
  eq("fractional term", `${r.monthlyPay} ${r.summary[3].join(" ")} ${r.summary[5].join(" ")}`, "$22,305.47 Total of 30.60 Mortgage Payments $682,547.46 Mortgage Payoff Date May. 2029");
  eq("fractional taxes", table(r).split(" | ")[1], "Property Tax $200.00 $6,120.00");
  eq("partial final month", month(r, 31), "31 4/2029 $44 $13,339 $0");
}
eq("0% rate", `${ca({ rate: "0" }).monthlyPay} ${table(ca({ rate: "0" })).split(" | ")[0]}`, "$2,133.33 Mortgage Payment $2,133.33 $640,000.00");
eq("0% total is the loan", ca({ price: "1639430", downPayment: "72.05", years: "24", rate: "0" }).summary[3][1], "$458,220.69");
eq("0% final principal tie", month(ca({ price: "500000", downPayment: "7", years: "4", rate: "0", startMonth: 3 }), 48), "48 2/2030 $0 $9,687 $0");

// Schedule visibility: more than 12 and fewer than 720 payments.
eq("1 year: no schedule", ca({ years: "1" }).schedule, null);
eq("1.01 years: schedule", ca({ years: "1.01" }).schedule.monthly.length, 13);
eq("60 years: no schedule", ca({ years: "60" }).schedule, null);
eq("100 years accepted", ca({ years: "100" }).monthlyPay, "$2,658.35");

eq("all errors", ca({ price: "abc", downPayment: "x", years: "y", rate: "z", propertyTaxes: "q", homeInsurance: "w", mortgageInsurance: "e", hoa: "h", otherCosts: "r", startYear: "t" }).errors.join(" | "),
  "Please provide a positive home price value. | Please provide a positive down payment with value between 0 and 100. | Please provide a positive loan term value. | Please provide a positive interest value. | Please provide a positive property taxes value. | Please provide a positive home insurance value. | Please provide a positive mortgage insurance value. | Please provide a positive Condo/HOA fee value. | Please provide a positive other costs value. | Please provide a positive start date value.");
eq("down 100", ca({ downPayment: "100" }).errors.join(), "Please provide a positive down payment with value between 0 and 100.");
eq("term over 100", ca({ years: "101" }).errors.join(), "Please provide a positive loan term value.");
eq("blank optionals are errors", ca({ propertyTaxes: "", homeInsurance: "", mortgageInsurance: "", hoa: "", otherCosts: "" }).errors.length, 5);
eq("optionals ignored when unticked", ca({ includeOptionals: false, propertyTaxes: "x" }).monthlyPay, "$3,722.27");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
