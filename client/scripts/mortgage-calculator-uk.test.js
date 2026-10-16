// Plain-Node test suite for the Mortgage Calculator UK engine.
// Run with:
//   node scripts/mortgage-calculator-uk.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/mortgage-calculator-uk.html) via plain GET requests. A
// scratch comparator also diffed 160 random scenarios (results, pie and both
// full schedules): 160 identical, plus 126/126 month-1 interest ties.

import { calculateMortgageUk, UK_DEFAULTS, wholePounds } from "../src/utils/mortgageCalculatorUkEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const uk = (o = {}) => calculateMortgageUk({ ...UK_DEFAULTS, includeOptionals: true, startMonth: 10, startYear: "2026", ...o });
const table = (r) => r.table.map((x) => `${x.label} ${x.first} ${x.total}`).join(" | ");
const summary = (r) => r.summary.map((x) => x.join(" ")).join(" | ");
const pie = (r) => {
  const total = r.pie.reduce((s, p) => s + p.value, 0);
  return r.pie.map((p) => `${p.color} ${p.label} ${p.text} (${Math.round((p.value / total) * 100)}%)`).join(" / ");
};
const year = (r, k) => { const a = r.schedule.annual[k - 1]; return `${a.label} ${a.date} ${wholePounds(a.interest)} ${wholePounds(a.principal)} ${wholePounds(a.balance)}`; };
const month = (r, k) => { const m = r.schedule.monthly[k - 1]; return `${m.label} ${m.date} ${wholePounds(m.interest)} ${wholePounds(m.principal)} ${wholePounds(m.balance)}`; };

{
  const r = uk();
  eq("interest only", r.interestOnly, "£1,562.50");
  eq("monthly repayment", r.monthlyRepayment, "£2,192.21");
  eq("cost table", table(r), "Mortgage Payment £2,192.21 £657,663.80 | Taxes £500.00 £150,000.00 | Home Insurance £208.33 £62,500.00 | Other Costs £500.00 £150,000.00 | Total Out-of-Pocket £3,400.55 £1,020,163.80");
  eq("summary", summary(r), "Loan Amount £375,000.00 | Mortgage Deposit £125,000.00 | Total Interest £282,663.80");
  eq("pie", pie(r), "#2b7ddb Mortgage Repayment £2,192.21 (64%) / #8bbc21 Taxes £500.00 (15%) / #910000 Other Cost £500.00 (15%) / #1aadce Home Insurance £208.33 (6%)");
  eq("year 1", year(r, 1), "1 10/26-9/27 £18,574 £7,732 £367,268");
  eq("year 25", year(r, 25), "25 10/50-9/51 £699 £25,608 £0");
  eq("month 1 (1,562.4999… tie shows £1,562)", month(r, 1), "1 10/2026 £1,562 £630 £374,370");
  eq("month 300", month(r, 300), "300 9/2051 £9 £2,183 £0");
  eq("year-end markers", r.schedule.monthly.filter((m) => m.yearEnd).length, 25);
}
eq("same tie on a 12-year term shows £1,563", wholePounds(uk({ years: "12", startMonth: 5, startYear: "2034" }).schedule.monthly[0].interest), "£1,563");
{
  const r = uk({ mortgageInsurance: "1200" });
  eq("mortgage insurance row", table(r).split(" | ")[3], "Mortgage Insurance £100.00 £30,000.00");
  eq("mortgage insurance pie order", pie(r), "#2b7ddb Mortgage Repayment £2,192.21 (63%) / #8bbc21 Taxes £500.00 (14%) / #910000 Mortgage Insurance £100.00 (3%) / #1aadce Other Cost £500.00 (14%) / #492970 Home Insurance £208.33 (6%)");
}
eq("mortgage insurance: whole months only", table(uk({ price: "611234", deposit: "10", years: "1.85", rate: "1.89", taxes: "1.09", homeInsurance: "2218", mortgageInsurance: "2731", otherCosts: "2085" })).split(" | ")[3],
  "Mortgage Insurance £227.58 £5,006.83");
{
  const r = uk({ includeOptionals: false });
  eq("no optionals: no table", r.table, null);
  eq("no optionals: principal/interest pie", pie(r), "#2b7ddb Principal £375,000.00 (57%) / #8bbc21 Interest £282,663.80 (43%)");
  eq("no optionals: no dates", r.schedule.showDates, false);
}
eq("all costs zero: P/I pie", pie(uk({ taxes: "0", homeInsurance: "0", otherCosts: "0" })), "#2b7ddb Principal £375,000.00 (57%) / #8bbc21 Interest £282,663.80 (43%)");
eq("only mortgage insurance: still P/I pie", uk({ taxes: "0", homeInsurance: "0", otherCosts: "0", mortgageInsurance: "100" }).pie.length, 2);
eq("zero slice dropped", pie(uk({ taxes: "0" })), "#2b7ddb Mortgage Repayment £2,192.21 (76%) / #8bbc21 Other Cost £500.00 (17%) / #910000 Home Insurance £208.33 (7%)");
eq("0% keeps a £0 interest slice", uk({ rate: "0", includeOptionals: false }).pie.length, 2);
{
  const r = uk({ years: "2.55" });
  eq("fractional term", `${r.monthlyRepayment} ${table(r)}`, "£13,078.23 Mortgage Payment £13,078.23 £400,193.77 | Taxes £500.00 £15,300.00 | Home Insurance £208.33 £6,375.00 | Other Costs £500.00 £15,300.00 | Total Out-of-Pocket £14,286.56 £437,168.77");
  eq("short final year", year(r, 3), "3 10/28-5/29 £1,351 £84,966 £0");
  eq("partial final month", month(r, 31), "31 4/2029 £26 £7,821 £0");
}
{
  const r = uk({ rate: "0" });
  eq("0% rate", `${r.interestOnly} ${r.monthlyRepayment}`, "£0.00 £1,250.00");
  eq("0% year 1", year(r, 1), "1 10/26-9/27 £0 £15,000 £360,000");
}
eq("0% balance tie rounds up", wholePounds(uk({ price: "312716", deposit: "0", years: "30", rate: "0", startMonth: 7 }).schedule.monthly[224].balance), "£117,269");
eq("deposit 0", summary(uk({ deposit: "0" })), "Loan Amount £500,000.00 | Mortgage Deposit £0.00 | Total Interest £376,885.06");
eq("decimals", `${uk({ price: "1,234,567.89", deposit: "12.345" }).monthlyRepayment} ${summary(uk({ price: "1,234,567.89", deposit: "12.345" }))}`,
  "£6,326.20 Loan Amount £1,082,160.48 | Mortgage Deposit £152,407.41 | Total Interest £815,700.24");
eq("year 2008 prints 8/8", year(uk({ startMonth: 8, startYear: "2008" }), 1).split(" ")[1], "8/8-7/9");

// Schedule visibility: more than 12 and fewer than 720 payments.
eq("1 year: no schedule", uk({ years: "1" }).schedule, null);
eq("1.01 years: schedule", uk({ years: "1.01" }).schedule.monthly.length, 13);
eq("59.99 years: schedule", uk({ years: "59.99" }).schedule.monthly.length, 720);
eq("60 years: no schedule", uk({ years: "60" }).schedule, null);
eq("100 years accepted", uk({ years: "100" }).monthlyRepayment, "£1,573.21");

// Validation
eq("all errors", uk({ price: "abc", deposit: "x", years: "y", rate: "z", taxes: "q", homeInsurance: "w", mortgageInsurance: "e", otherCosts: "r", startYear: "t" }).errors.join(" | "),
  "Please provide a positive home price value. | Please provide a positive mortgage deposit with value between 0 and 100. | Please provide a positive loan term value. | Please provide a positive interest value. | Please provide a positive taxes value. | Please provide a positive home insurance value. | Please provide a positive mortgage insurance value. | Please provide a positive other costs value. | Please provide a positive start date value.");
eq("zero price", uk({ price: "0" }).errors.join(), "Please provide a positive home price value.");
eq("deposit 100", uk({ deposit: "100" }).errors.join(), "Please provide a positive mortgage deposit with value between 0 and 100.");
eq("term over 100", uk({ years: "100.5" }).errors.join(), "Please provide a positive loan term value.");
eq("negative rate", uk({ rate: "-1" }).errors.join(), "Please provide a positive interest value.");
eq("blank optionals are errors", uk({ taxes: "", homeInsurance: "", mortgageInsurance: "", otherCosts: "" }).errors.length, 4);
eq("optionals ignored when unticked", uk({ includeOptionals: false, taxes: "x", startYear: "abc" }).monthlyRepayment, "£2,192.21");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
