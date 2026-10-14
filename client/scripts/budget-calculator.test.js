// Plain-Node test suite for the Budget Calculator engine.
// Run with:
//   node scripts/budget-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/budget-calculator.html) via plain GET requests. A scratch
// comparator also diffed 18 hand-picked boundary cases and 240 random
// scenarios (random amounts, month/year units and tax rates): every table
// row, colour, note, pie slice and error matched.

import { calculateBudget, BUDGET_DEFAULTS, BUDGET_DEFAULT_UNITS } from "../src/utils/budgetCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (o = {}, u = {}) => calculateBudget({ values: { ...BUDGET_DEFAULTS, ...o }, units: { ...BUDGET_DEFAULT_UNITS, ...u } });
const summary = (r) => [...r.summary.map((x) => x.join(" | ")), `${r.net.label} | ${r.net.values.join(" | ")}`].join(" / ");
const brow = (r, label) => {
  const b = r.breakdown.find((x) => x.label === label);
  return [b.annual, b.monthly, [b.percent, ...b.notes.map((n) => n.text + (n.warn ? "(red)" : ""))].filter(Boolean).join(" ~ ")].join(" | ");
};
const pie = (r) => r.pie.map((p) => `${p.label} ${p.percent}% ${p.color}`).join(" / ");

// ── Default example ──
{
  const r = run();
  eq("summary", summary(r), "Total Before Tax Income | $83,000 | $6,917 / Total After Tax Income | $59,760 | $4,980 / Total Expenses | $59,840 | $4,987 / Net (Deficit) | $-80 | $-7");
  eq("net is red", r.net.good, false);
  eq("dti", `${r.dti.ratio} | ${r.dti.message} | ${r.dti.frontEnd}`, "27.71% | Your DTI ratio is good. | 20.48%");
  eq("pie", pie(r), "Housing & Utilities 33% #2b7ddb / Transportation 10% #8bbc21 / Other Debt & Loan Payments 5% #910000 / Living Expenses 20% #1aadce / Healthcare 4% #492970 / Children & Education 2% #c21271 / Savings & Investments 12% #827e1c / Miscellaneous Expenses 14% #2c852c");
  eq("housing", brow(r, "Housing & Utilities"), "$20,000 | $1,667 | 33.47% of income");
  eq("transportation", brow(r, "Transportation"), "$5,740 | $478 | 9.61% of income");
  eq("food", brow(r, "Food & Meals Out"), "$7,200 | $600 | 12.05% of income ~ Part of the living expense");
  eq("debt", brow(r, "Debt & Loan Payments"), "$6,000 | $500 | 10.04% of income ~ Mortgage and auto loan included");
  eq("savings", brow(r, "Savings & Investments"), "$7,200 | $600 | 12.05% of income ~ 401k, IRA, and college saving tax adjusted ~ recommend 15% or higher(red)");
  eq("misc", brow(r, "Miscellaneous Expenses"), "$8,300 | $692 | 13.89% of income");
}

// ── Branches ──
eq("net zero is green", summary(run({ vacation: "1920" })).endsWith("Net (Discretionary Income) | $0 | $0"), true);
eq("savings ≥ 15% no warning", brow(run({ ira401k: "20000" }), "Savings & Investments"), "$14,400 | $1,200 | 24.10% of income ~ 401k, IRA, and college saving tax adjusted");
eq("college counts tax-adjusted", brow(run({ ira401k: "0", collegesaving: "5000" }), "Savings & Investments"), "$3,600 | $300 | 6.02% of income ~ 401k, IRA, and college saving tax adjusted ~ recommend 15% or higher(red)");
eq("zero row blank", brow(run({ medicalspending: "0" }), "Healthcare"), "$0 | $0 | ");
eq("zero slice skipped, palette shifts", pie(run({ rental: "0", studentloan: "0", autoloan: "0" })).split(" / ")[2], "Living Expenses 32% #910000");
eq("rent alone: no DTI table", run({ rental: "1400", studentloan: "0", autoloan: "0" }).dti, null);
eq("rent only DTI front-end", run({ rental: "0" }).dti.frontEnd, "0.24%");
eq("dti OK", run({ salary: "5000" }, { salary: "m" }).dti.message, "Your DTI ratio is OK with room for improvement. Consider taking actions to improve it.");
eq("dti very high", run({ salary: " 5000 " }).dti.ratio, "287.50%");
eq("dti exactly 35 not good", run({ rental: "22850" }, { rental: "y" }).dti.message.startsWith("Your DTI ratio is OK"), true);
eq("share at 0.01% blank", brow(run({ food: "5.976", clothing: "0", grocery: "0", mealout: "0", otherliving: "0" }, { food: "y" }), "Food & Meals Out"), "$6 | $0 | ");
eq("monthly rounding", summary(run({ otherincome: "2080" })).endsWith("Net (Deficit) | $-22 | $-2"), true);
eq("fractional amounts", brow(run({ food: "100.4" }), "Living Expenses"), "$8,405 | $700 | 14.06% of income");
eq("tax 99 shares", brow(run({ taxrate: "99" }), "Living Expenses"), "$12,000 | $1,000 | 1,445.78% of income");
{
  const r = run({ taxrate: "0" });
  eq("tax 0 merges income rows", r.summary[0].join(" | "), "Total Income | $83,000 | $6,917");
  eq("tax 0 no tax-adjusted note", brow(r, "Savings & Investments").includes("tax adjusted"), false);
}
{
  const r = run({ taxrate: "100" });
  eq("tax 100: summary only", [r.dti, r.pie, r.breakdown].every((x) => x === null), true);
}
eq("tax 150 negative after-tax", summary(run({ taxrate: "150" })), "Total Before Tax Income | $83,000 | $6,917 / Total After Tax Income | $-41,500 | $-3,458 / Total Expenses | $47,640 | $3,970 / Net (Deficit) | $-89,140 | $-7,428");
eq("no income: summary only", run({ salary: "", pension: "", investment: "", otherincome: "" }).breakdown, null);
eq("commas accepted", run({ pet: "1,000" }).errors, undefined);
eq("exponent accepted", summary(run({ salary: "1e5" })).startsWith("Total Before Tax Income | $103,000"), true);
{
  const zero = Object.fromEntries(Object.keys(BUDGET_DEFAULTS).filter((k) => !["salary", "pension", "investment", "otherincome", "taxrate"].includes(k)).map((k) => [k, "0"]));
  const r = run(zero);
  eq("no expenses: no pie", r.pie, null);
  eq("no expenses: breakdown kept", brow(r, "Housing & Utilities"), "$0 | $0 | ");
}

// ── Validation ──
eq("errors in form order", run({ salary: "x", food: "-1", taxrate: "abc", vacation: "y", pet: "1,000" }).errors.join(" | "),
  "Salary & earned income need to be numeric. | Income tax rate need to be numeric. | Food need to be numeric. | Travel and vacation need to be numeric.");
eq("negative tax", run({ taxrate: "-5" }).errors.join(), "Income tax rate need to be numeric.");
eq("dollar sign rejected", run({ salary: "$5000" }).errors.join(), "Salary & earned income need to be numeric.");
eq("odd labels", run({ creditcard: "x", grocery: "x", allother: "x" }).errors.join(" | "),
  "Recurring credit card payments need to be numeric. | Household supplies items need to be numeric. | All other miscellaneous spendings need to be numeric.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
