// Plain-Node test suite for the Rental Property Calculator engine.
// Run with:
//   node scripts/rental-property-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/rental-property-calculator.html) via plain GET requests. A
// scratch comparator also diffed random scenarios (loan/no loan, repairs,
// known sell price, fractional terms and holding lengths): the final run
// matched 320/320 on every table cell, label, colour, pie slice and error, and
// the IRR solver agrees with 7,746 of 7,762 live IRR cells (see the engine
// header).

import { calculateRentalProperty, RENTAL_DEFAULTS, solveIrr } from "../src/utils/rentalPropertyCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (o = {}) => calculateRentalProperty({ ...RENTAL_DEFAULTS, ...o });
const summary = (r) => r.summary.map((s) => `${s.label} ${s.value}${s.suffix || ""}`).join(" / ");
const first = (r) => r.firstYear.map((x) => `${x.label}: ${x.monthly} ${x.annual}`).join(" / ");
const row = (r, y) => { const x = r.rows[y - 1]; return [x.income, x.mortgage, x.expense, x.cashFlow, x.coc, x.equity, x.cashToReceive, x.irr].join(" | "); };
const totals = (r) => Object.values(r.totals).join(" | ");
const pie = (r) => r.pie.map((p) => `${p.label} ${p.percent}% ${p.color}`).join(" / ");

// ── Default example (screenshot) ──
{
  const r = run();
  eq("heading", r.holdingLabel, "For the 20 Years Invested");
  eq("summary", summary(r), "Return (IRR): 18.42% per year / Total Profit when Sold: $402,304.36 / Cash on Cash Return: 874.57% / Capitalization Rate: 8.05% / Total Rental Income: $612,644.54 / Total Mortgage Payments: $230,227.40 / Total Expenses: $180,031.51 / Total Net Operating Income: $432,613.03");
  eq("first year", first(r), "Income: $2,000.00 $24,000.00 / Mortgage Pay: $959.28 $11,511.37 / Vacancy (5%): $100.00 $1,200.00 / Property Tax: $250.00 $3,000.00 / Total Insurance: $100.00 $1,200.00 / Maintenance Cost: $166.67 $2,000.00 / Other Cost: $41.67 $500.00");
  eq("cash flow", `${r.cashFlow.monthly} ${r.cashFlow.annual}`, "$382.39 $4,588.63");
  eq("noi", `${r.noi.monthly} ${r.noi.annual}`, "$1,341.67 $16,100.00");
  eq("pie", pie(r), "Mortgage 59% #2b7ddb / Vacancy 6% #8bbc21 / Property Tax 15% #910000 / Total Insurance 6% #1aadce / Maintenance Cost 10% #492970 / Other Cost 3% #c21271");
  eq("begin", r.begin, "$-46,000");
  eq("year 1", row(r, 1), "$22,800 | $11,511 | $6,700 | $4,589 | 9.98% | $47,965 | $31,485 | -21.58%");
  eq("year 20 includes sale", row(r, 20), "$39,980 | $11,511 | $11,748 | $262,639 | 36.35% | $274,817 | $245,919 | 18.42%");
  eq("totals", totals(r), "$612,645 | $230,227 | $180,032 | $402,304 | 874.57%");
}

// ── Branches ──
{
  const r = run({ useLoan: false });
  eq("no loan summary", summary(r).includes("Mortgage"), false);
  eq("no loan begin", r.begin, "$-206,000");
  eq("no loan year 1", row(r, 1), "$22,800 | $0 | $6,700 | $16,100 | 7.82% | $206,000 | $189,520 | -0.18%");
  eq("no loan pie palette", pie(r).split(" / ")[0], "Vacancy 15% #2b7ddb");
}
eq("down payment 100% = no loan", summary(run({ downPayment: "100" })), summary(run({ useLoan: false })));
{
  const r = run({ needRepair: true });
  eq("repairs: purchase cap rate label", r.summary[3].label, "Purchase Capitalization Rate:");
  eq("repairs year 1", row(r, 1), "$22,800 | $11,511 | $6,700 | $4,589 | 6.95% | $109,765 | $88,341 | 40.80%");
  eq("repairs IRR", r.summary[0].value, "15.35%");
}
eq("known sell price", row(run({ knowSellPrice: true }), 1), "$22,800 | $11,511 | $6,700 | $4,589 | 9.98% | $49,018 | $32,454 | -19.47%");
eq("known sell + repairs", run({ knowSellPrice: true, needRepair: true }).summary[0].value, "14.77%");
{
  const r = run({ hoa: "600", management: "10", otherIncome: "100" });
  eq("hoa/management first year", first(r).split(" / ").slice(2, 7).join(" / "), "Vacancy (5%): $105.00 $1,260.00 / Management Fee (10%): $199.50 $2,394.00 / Property Tax: $250.00 $3,000.00 / Total Insurance: $100.00 $1,200.00 / HOA Fee: $50.00 $600.00");
  eq("pie uses gross rent only", r.pie.slice(1, 3).map((p) => p.value).join(), "1200,2400");
  eq("management cap rate", r.summary[3].value, "7.12%");
}
eq("label echoes typed percent", run({ vacancy: "5.0" }).firstYear[2].label, "Vacancy (5.0%)");
{
  const r = run({ holding: "2.5" });
  eq("fractional holding heading", r.holdingLabel, "For the 2.5 Years Invested");
  eq("fractional holding rows", r.rows.length, 3);
  eq("fractional: no sale booked", r.totals.cashFlow, "$-30,771");
  eq("fractional headline IRR", r.summary[0].value, "6.23%");
}
eq("fractional 2.4 IRR", run({ holding: "2.4" }).summary[0].value, "5.74%");
eq("known sell, fractional", run({ knowSellPrice: true, holding: "2.5" }).summary[0].value, "91.12%");
{
  const r = run({ loanTerm: "2.5" });
  eq("short loan: full annual payment for 3 years", r.summary[5].value, "$207,238.57");
  eq("short loan year 4", row(r, 4), "$24,914 | $0 | $7,321 | $17,593 | 38.25% | $225,102 | $207,094 | 4.08%");
  eq("negative cash flow flagged", r.cashFlow.negative, true);
}
eq("0% interest, fractional term", run({ interestRate: "0", loanTerm: "2.4" }).firstYear[1].annual, "$66,666.67");
eq("no IRR: NA row", row(run({ sellCost: "100" }), 1).endsWith("$-158,035 | NA"), true);
{
  const r = run({ holding: "0" });
  eq("holding 0 summary", summary(r), "Total Profit when Sold: $-46,000.00 / Cash on Cash Return: -100.00% / Capitalization Rate: 8.05% / Total Net Operating Income: $0.00");
  eq("holding 0 rows", r.rows.length, 0);
}
eq("zero rent", summary(run({ rent: "0" })).startsWith("Return (IRR): -6.80% per year / Total Profit when Sold: $-210,340.18"), true);
eq("zero down", row(run({ downPayment: "0" }), 1).endsWith("$-8,024 | NA"), true);
eq("no expenses pie", run({ useLoan: false, vacancy: "0", tax: "0", insurance: "0", maintenance: "0", otherCost: "0" }).pie, null);
eq("commas", run({ price: "1,000,000" }).begin, "$-206,000");

// ── IRR solver (reference picks the root nearest 0%) ──
eq("two roots: shallower", (solveIrr([[0, -210808], [1, 52505], [2, 53347], [3, 54201], [4, 55067], [5, -53099]]) * 100).toFixed(2), "-15.32");
eq("no sign change", solveIrr([[0, -6000], [1, -6313]]), null);

// ── Validation ──
eq("every field", run({ price: "x", downPayment: "x", interestRate: "x", loanTerm: "x", closingCost: "x", rent: "x", rentIncrease: "x", otherIncome: "x", otherIncomeIncrease: "x", vacancy: "x", management: "x", tax: "x", taxIncrease: "x", insurance: "x", insuranceIncrease: "x", hoa: "x", hoaIncrease: "x", maintenance: "x", maintenanceIncrease: "x", otherCost: "x", otherCostIncrease: "x", appreciation: "x", holding: "x", sellCost: "x" }).errors.length, 24);
eq("repair + sell errors", run({ needRepair: true, knowSellPrice: true, repairCost: "x", afterRepairValue: "0", sellPrice: "x" }).errors.join(" | "),
  "Please provide a positive repair cost. | Please provide a positive value after repairs . | Please provide a positive sell price.");
eq("hidden loan fields ignored", run({ useLoan: false, downPayment: "x" }).errors, undefined);
eq("zero price", run({ price: "0" }).errors.join(), "Please provide a positive purchase price.");
eq("zero loan term", run({ loanTerm: "0" }).errors.join(), "Please provide a positive loan term.");
eq("holding 500 ok", run({ holding: "500" }).errors, undefined);
eq("holding over 500", run({ holding: "500.5" }).errors.join(), "Please provide a positive holding length that is less than 500 years.");
eq("blank rent", run({ rent: "" }).errors.join(), "Please provide a positive monthly rent.");
eq("negative increase ok", run({ rentIncrease: "-5" }).summary[0].value, "4.35%");
eq("vacancy over 100 ok", run({ vacancy: "101" }).errors, undefined);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
