// Plain-Node test suite for the FHA Loan Calculator engine.
// Run with:
//   node scripts/fha-loan-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/fha-loan-calculator.html) via plain GET requests. A scratch
// comparator also diffed 520 random scenarios (results table, pie, summary,
// bi-weekly block, annual and monthly schedules): 516 were identical; the rest
// were half-cent float ties at exactly 0% interest.

import { calculateFhaLoan, suggestedAnnualMip, convertUnit, yearsAndMonths, FHA_DEFAULTS } from "../src/utils/fhaLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = {
  ...FHA_DEFAULTS, downUnit: "percent", taxUnit: "percent", mipDuration: "term", includeOptionals: true,
  startMonth: 10, startYear: "2026", moreOptions: true, showBiweekly: true,
  extraMonthlyMonth: 10, extraMonthlyYear: "2026", extraYearlyMonth: 10, extraYearlyYear: "2026", extraOneTimeMonth: 10, extraOneTimeYear: "2026",
};
const fha = (o = {}) => calculateFhaLoan({ ...BASE, ...o });
const table = (r) => r.table.map((x) => `${x.label} ${x.first} ${x.total}`).join(" / ");
const summary = (r) => r.summary.map((x) => x.join(" ")).join(" / ");
const pie = (r) => { const t = r.pie.reduce((s, p) => s + p.value, 0); return r.pie.filter((p) => p.value > 0).map((p) => `${p.label} ${Math.round((p.value / t) * 100)}%`).join(" / "); };
const W = (v) => `$${Math.round(v).toLocaleString("en-US")}`;
const yearRow = (r, i) => { const a = r.schedule.annual[i]; return `${a.label} ${a.date} ${W(a.interest)} ${W(a.principal)} ${W(a.balance)}`; };

// ── Default example (screenshot) ──
{
  const r = fha();
  eq("monthly pay", r.monthlyPay, "$3,397.30");
  eq("column", r.firstColumn, "Monthly");
  eq("table", table(r), "Mortgage Payment $3,397.30 $1,223,026.27 / Property Tax $500.00 $180,000.00 / Home Insurance $208.33 $75,000.00 / Annual MIP $221.15 $79,612.50 / Other Costs $416.67 $150,000.00 / Total Out-of-Pocket $4,743.44 $1,707,638.77");
  eq("summary", summary(r), "House Price $500,000.00 / Loan Amount with Upfront MIP $491,250.00 / Down Payment $17,500.00 / Upfront MIP $8,750.00 / Total of 360 Mortgage Payments $1,223,026.27 / Total Interest $731,776.27 / Mortgage Payoff Date Oct. 2056");
  eq("pie", pie(r), "Principal 29% / Interest 43% / Property Taxes 11% / Annual MIP 5% / Other Cost 9% / Home Insurance 4%");
  eq("biweekly", `${r.biweekly.title} | ${r.biweekly.rows.map((x) => x.join(" ")).join(" | ")}`, "If Payback Bi-weekly | Bi-weekly Payment $1,698.65 | Total Interest $541,227.09 | Payoff 23.3 years");
  eq("year 1", yearRow(r, 0), "1 10/26-9/27 $36,139 $4,629 $486,621");
  eq("year 30", yearRow(r, 29), "30 10/55-9/56 $1,586 $39,182 $0");
  eq("month 1", [r.schedule.monthly[0].date, W(r.schedule.monthly[0].interest), W(r.schedule.monthly[0].principal)].join(" "), "10/2026 $3,024 $373");
  eq("year-end marker", r.schedule.monthly[359].yearEnd, 30);
}

// ── MIP duration ──
eq("11 years", summary(fha({ mipDuration: "11" })).split(" / ").pop(), "Annual MIP Payoff Date (132 Total Payments) Oct. 2037");
eq("11 years total", table(fha({ mipDuration: "11" })).split(" / ")[3], "Annual MIP $221.15 $29,191.25");
eq("5 years", summary(fha({ mipDuration: "5" })).split(" / ").pop(), "Annual MIP Payoff Date (60 Total Payments) Oct. 2031");
eq("78% LTV", summary(fha({ mipDuration: "78" })).split(" / ").pop(), "Annual MIP Payoff Date (160 Total Payments) Feb. 2040");
eq("78% LTV total", table(fha({ mipDuration: "78" })).split(" / ")[3], "Annual MIP $221.15 $35,383.33");
eq("no annual MIP", table(fha({ mipDuration: "no" })).split(" / ").pop(), "Total Out-of-Pocket $4,522.30 $1,628,026.27");
{
  const r = fha({ downPayment: "25", mipDuration: "78" });
  eq("78% met from the start: no MIP row", r.table.some((x) => x.label === "Annual MIP"), false);
  eq("…but first month still counts it", r.table.pop().first, "$3,950.74");
}

// ── Upfront MIP is a percent of the price; down payment in dollars ──
eq("$50,000 down", summary(fha({ downPayment: "50000", downUnit: "dollar" })).split(" / ").slice(1, 4).join(" / "), "Loan Amount with Upfront MIP $458,750.00 / Down Payment $50,000.00 / Upfront MIP $8,750.00");
eq("$50,000 down MIP", table(fha({ downPayment: "50000", downUnit: "dollar" })).split(" / ")[3], "Annual MIP $206.25 $74,250.00");
eq("zero down hides price rows", summary(fha({ downPayment: "0" })).split(" / ")[0], "Total of 360 Mortgage Payments $1,266,594.64");
eq("no upfront MIP row", fha({ upfrontMip: "0", annualMip: "0" }).summary.some(([l]) => l === "Upfront MIP"), false);
eq("half-cent down payment", summary(fha({ price: "773021", years: "27.94", rate: "6.207", annualMip: "0" })).split(" / ")[2], "Down Payment $27,055.73");

// ── Optionals and more options ──
{
  const r = fha({ includeOptionals: false });
  eq("no optionals: no table", r.table, null);
  eq("no optionals: no payoff date", summary(r).includes("Payoff"), false);
  eq("no optionals: no biweekly", r.biweekly, null);
  eq("no optionals: pie", pie(r), "Principal 40% / Interest 60%");
  eq("no optionals: no dates", r.schedule.showDates, false);
}
eq("no optionals + extra: pie interest quirk", pie(fha({ includeOptionals: false, extraMonthly: "200" })), "Principal 48% / Interest 52%");
{
  const r = fha({ moreOptions: false, extraMonthly: "200", taxIncrease: "3" });
  eq("collapsed more options ignores extras", r.monthlyPay + " " + table(r).split(" / ")[0], "$3,397.30 Mortgage Payment $3,397.30 $1,223,026.27");
  eq("collapsed: no biweekly", r.biweekly, null);
}
{
  const r = fha({ taxIncrease: "3", insuranceIncrease: "2", hoa: "1200", hoaIncrease: "5", otherIncrease: "1" });
  eq("increases column", r.firstColumn, "First Month");
  eq("increases table", table(r), "Mortgage Payment $3,397.30 $1,223,026.27 / Property Tax $500.00 $285,452.49 / Home Insurance $208.33 $101,420.20 / Annual MIP $221.15 $79,612.50 / HOA Fee $100.00 $79,726.62 / Other Costs $416.67 $173,924.46 / Total Out-of-Pocket $4,843.44 $1,943,162.54");
}

// ── Extra payments ──
{
  const r = fha({ extraMonthly: "200" });
  eq("extra sentence", r.sentence, "With the extra payment, the loan will be paid off in 25 years.");
  eq("extra table", table(r).split(" / ").slice(0, 2).join(" / "), "Mortgage Payment $3,397.30 $1,017,050.38 / Extra Payment $200.00 $59,800.00");
  eq("extra summary", summary(r).split(" / ").slice(4).join(" / "), "Total of 300 Mortgage Payments $1,017,050.38 / Total Interest $585,600.38 / Total Extra Payments $59,800.00 / Mortgage Payoff Date Oct. 2051");
  eq("biweekly title", r.biweekly.title, "If Payback Bi-weekly without Extra Payments");
}
{
  const r = fha({ extraYearly: "5000", extraYearlyMonth: 3, extraYearlyYear: "2028" });
  eq("yearly from Mar 2028", r.sentence, "With the extra payment, the loan will be paid off in 21 years and 11 months.");
  eq("yearly column", r.firstColumn, "Monthly");
  eq("short last year label", yearRow(r, 21), "22 10/47-9/48 $1,411 $39,205 $0");
}
eq("yearly before the loan starts", fha({ extraYearly: "5000", extraYearlyMonth: 3, extraYearlyYear: "2020" }).sentence, "With the extra payment, the loan will be paid off in 21 years and 5 months.");
{
  const r = fha({ extraOneTime: "5000", extraOneTimeMonth: 3, extraOneTimeYear: "2020" });
  eq("one-time before start is ignored", r.sentence, null);
  eq("…but the row shows", table(r).split(" / ")[1], "Extra Payment $0.00 $0.00");
}
eq("monthly from 1/2027", fha({ extraMonthly: "200", extraMonthlyMonth: 1, extraMonthlyYear: "2027" }).sentence, "With the extra payment, the loan will be paid off in 25 years and 1 month.");
eq("huge one-time", fha({ extraOneTime: "490000" }).sentence, "With the extra payment, the loan will be paid off in 2 months.");
eq("huge one-time: no schedule", fha({ extraOneTime: "490000" }).schedule, null);

// ── Fractional term ──
{
  const r = fha({ years: "2.55" });
  eq("fractional count", summary(r).split(" / ")[4], "Total of 30.60 Mortgage Payments $540,482.62");
  eq("fractional taxes and MIP", table(r).split(" / ").slice(1, 4).join(" / "), "Property Tax $500.00 $15,300.00 / Home Insurance $208.33 $6,375.00 / Annual MIP $221.15 $6,634.38");
  eq("fractional payoff", summary(r).split(" / ").pop(), "Mortgage Payoff Date May. 2029");
  eq("partial last row", `${W(r.schedule.monthly[30].interest)} ${W(r.schedule.monthly[30].principal)}`, "$52 $10,546");
  eq("partial year label", yearRow(r, 2), "3 10/28-5/29 $2,680 $113,895 $0");
}
eq("13.0008 payments print as 13", summary(fha({ years: "1.0834" })).split(" / ")[4], "Total of 13 Mortgage Payments $512,682.34");
eq("12 payments: no schedule", fha({ years: "1" }).schedule, null);
eq("0% rate", summary(fha({ rate: "0" })).split(" / ").slice(4, 6).join(" / "), "Total of 360 Mortgage Payments $491,250.00 / Total Interest $0.00");
eq("0% rate: no biweekly", fha({ rate: "0" }).biweekly, null);

// ── Bi-weekly payoff (26.089 periods a year) ──
for (const [years, text] of [["51", "31.31"], ["2.5", "2.28"], ["10", "8.86"], ["5.91", "5.32"], ["8.04", "7.18"], ["9.25", "8.22"]]) {
  eq(`biweekly ${years}y`, fha({ years }).biweekly.rows[2][1], `${text} years`);
}
eq("biweekly 28.74", fha({ price: "950272", downPayment: "0", years: "33", rate: "3.109", upfrontMip: "0", annualMip: "0" }).biweekly.rows[2][1], "28.74 years");

// ── Validation ──
eq("every field", fha({ price: "x", downPayment: "x", years: "x", rate: "x", upfrontMip: "x", annualMip: "x", propertyTaxes: "x", homeInsurance: "x", hoa: "x", otherCosts: "x", startYear: "x" }).errors.join(" | "),
  "Please provide a positive home price value. | Please provide a positive down payment with value between 0 and 100. | Please provide a positive loan term value. | Please provide a positive interest value. | Please provide a positive upfront FHA Mortgage Insurance Premium (MIP) value. | Please provide a positive annual FHA Mortgage Insurance Premium (MIP) value. | Please provide a positive property taxes value. | Please provide a positive home insurance value. | Please provide a positive HOA fee value. | Please provide a positive other costs value. | Please provide a positive start date value.");
eq("more options fields", fha({ taxIncrease: "x", insuranceIncrease: "x", hoaIncrease: "x", otherIncrease: "x", extraMonthly: "x", extraMonthlyYear: "x" }).errors.join(" | "),
  "Please provide a positive property taxes increase rate. | Please provide a positive home insurance increase rate. | Please provide a positive HOA fee increase rate. | Please provide a positive other costs increase rate. | Please provide a positive extra monthly pay amount. | Please provide a reasonable extra monthly pay start date.");
eq("extra start dates", fha({ extraYearlyYear: "x", extraOneTimeYear: "x" }).errors.join(" | "), "Please provide a reasonable extra yearly pay start date. | Please provide a reasonable extra one-time pay start date.");
eq("100% down", fha({ downPayment: "100" }).errors.join(), "Please provide a down payment percentage between 0 and 100%.");
eq("down over price", fha({ downPayment: "600000", downUnit: "dollar" }).errors.join(), "Please provide a down payment amount that is lower than the home price.");
eq("term over 100", fha({ years: "101" }).errors.join(), "This calculator can calculate loan terms of up to 100 years. Please provide a shorter loan term.");
eq("blank optional is zero", fha({ hoa: "", otherCosts: "" }).errors, undefined);
eq("optionals off skips their checks", fha({ includeOptionals: false, propertyTaxes: "x" }).errors, undefined);
eq("collapsed skips more checks", fha({ moreOptions: false, extraMonthly: "x" }).errors, undefined);
eq("negative start year", fha({ startYear: "-1" }).errors.join(), "Please provide a positive start date value.");

// ── Helpers ──
eq("MIP 30y 3.5%", suggestedAnnualMip("500000", "3.5", "percent", "30"), 0.55);
eq("MIP 30y 10%", suggestedAnnualMip("500000", "10", "percent", "30"), 0.5);
eq("MIP high balance", suggestedAnnualMip("900000", "3.5", "percent", "30"), 0.75);
eq("MIP 15y high balance 15%", suggestedAnnualMip("900000", "15", "percent", "15"), 0.4);
eq("MIP 15y 25%", suggestedAnnualMip("500000", "25", "percent", "15"), 0.15);
eq("MIP $ down", suggestedAnnualMip("500000", "50000", "dollar", "30"), 0.5);
eq("MIP non-number", suggestedAnnualMip("", "3.5", "percent", "30"), 0.55);
eq("to dollars", convertUnit("3.5", "500000", "dollar"), "17500");
eq("to percent", convertUnit("17500", "500000", "percent"), "3.5");
eq("years and months", [yearsAndMonths(300), yearsAndMonths(301), yearsAndMonths(2), yearsAndMonths(13)].join(" | "), "25 years | 25 years and 1 month | 2 months | 1 year and 1 month");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
