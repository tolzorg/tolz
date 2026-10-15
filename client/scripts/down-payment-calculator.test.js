// Plain-Node test suite for the Down Payment Calculator engine.
// Run with:
//   node scripts/down-payment-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/down-payment-calculator.html) via plain GET requests. A
// scratch comparator also diffed 480 random scenarios across the three forms:
// 480 identical after the closing-cost cap rule was added.

import {
  calculateFromCash, calculateFromPrice, calculateDownPercent, DEFAULTS, PMI_NOTE, NO_DOWN_NOTE,
} from "../src/utils/downPaymentCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const common = { includeClosing: true, closingUnit: "percent" };
const f1 = (o = {}) => calculateFromCash({ ...DEFAULTS.cash, ...common, ...o });
const f2 = (o = {}) => calculateFromPrice({ ...DEFAULTS.price, ...common, ...o });
const f3 = (o = {}) => calculateDownPercent({ ...DEFAULTS.both, ...common, ...o });
const rows = (r) => r.rows.map((x) => x.join(" ")).join(" / ");
const table = (r) => r.table.map(([l, v]) => `${l}: ${v.join(" ")}`).join(" / ");

// ── Form 1: upfront cash available ──
{
  const r = f1();
  eq("f1 title", r.title, "Home Price: $434,783");
  eq("f1 rows", rows(r), "Home Price $434,783 / Down Payment $86,957 / Closing Costs $13,043 / Loan Amount $347,826 / Monthly Payment $2,405");
  eq("f1 table", table(r), "Home Price: $1,538,462 $1,250,000 $769,231 $555,556 $434,783 / Down Payment: $53,846 $62,500 $76,923 $83,333 $86,957 / Closing Costs: $46,154 $37,500 $23,077 $16,667 $13,043 / Loan Amount: $1,484,615 $1,187,500 $692,308 $472,222 $347,826 / Monthly Payment: $10,267 $8,212 $4,788 $3,266 $2,405");
  eq("f1 no PMI note at 20%", r.note, null);
}
eq("f1 PMI note", f1({ downPercent: "10" }).note, PMI_NOTE);
eq("f1 no closing", rows(f1({ includeClosing: false })), "Home Price $500,000 / Down Payment $100,000 / Loan Amount $400,000 / Monthly Payment $2,766");
eq("f1 $ closing", rows(f1({ closingUnit: "dollar", closingCosts: "5000" })), "Home Price $475,000 / Down Payment $95,000 / Closing Costs $5,000 / Loan Amount $380,000 / Monthly Payment $2,628");
eq("f1 $ closing table", table(f1({ closingUnit: "dollar", closingCosts: "5000" })).split(" / ")[0], "Home Price: $2,714,286 $1,900,000 $950,000 $633,333 $475,000");
eq("f1 $ closing = cash", rows(f1({ closingUnit: "dollar", closingCosts: "100000" })), "Home Price $0 / Down Payment $0 / Closing Costs $100,000 / Loan Amount $0 / Monthly Payment $0");
eq("f1 101% down", rows(f1({ downPercent: "101" })), "Home Price $96,154 / Down Payment $97,115 / Closing Costs $2,885 / Loan Amount $-962 / Monthly Payment $-7");
eq("f1 0% rate", rows(f1({ rate: "0" })).split(" / ").pop(), "Monthly Payment $966");
eq("f1 0% down, no closing", f1({ downPercent: "0", includeClosing: false }).message, NO_DOWN_NOTE);
eq("f1 0% down, $ closing", f1({ downPercent: "0", closingUnit: "dollar", closingCosts: "3000" }).empty, true);
eq("f1 0% down, 3% closing", f1({ downPercent: "0" }).title, "Home Price: $3,333,333");

// ── Form 2: home price ──
{
  const r = f2();
  eq("f2 title", r.title, "Cash Needed: $115,000");
  eq("f2 rows", rows(r), "Down Payment $100,000 / Closing Costs $15,000 / Down Payment + Closing Costs $115,000 / Loan Amount $400,000 / Monthly Payment $2,766");
  eq("f2 table", table(r), "Cash Needed: $32,500 $40,000 $65,000 $90,000 $115,000 / Down Payment: $17,500 $25,000 $50,000 $75,000 $100,000 / Closing Costs: $15,000 $15,000 $15,000 $15,000 $15,000 / Loan Amount: $482,500 $475,000 $450,000 $425,000 $400,000 / Monthly Payment: $3,337 $3,285 $3,112 $2,939 $2,766");
}
{
  const r = f2({ includeClosing: false });
  eq("f2 no closing title", r.title, "Down Payment: $100,000");
  eq("f2 no closing table", table(r), "Down Payment: $17,500 $25,000 $50,000 $75,000 $100,000 / Loan Amount: $482,500 $475,000 $450,000 $425,000 $400,000 / Monthly Payment: $3,337 $3,285 $3,112 $2,939 $2,766");
}
eq("f2 0% down", `${f2({ downPercent: "0" }).title} ${f2({ downPercent: "0" }).note === PMI_NOTE}`, "Cash Needed: $15,000 true");
eq("f2 $ closing", f2({ closingUnit: "dollar", closingCosts: "9000" }).title, "Cash Needed: $109,000");
eq("f2 120% down", rows(f2({ downPercent: "120" })).split(" / ").slice(3).join(" / "), "Loan Amount $-100,000 / Monthly Payment $-692");

// ── Form 3: home price + cash ──
{
  const r = f3();
  eq("f3 title", r.title, "Down Payment: 17.0%");
  eq("f3 rows", rows(r), "Down Payment $85,000 / Down Payment Percentage 17.0% / Closing Costs $15,000 / Loan Amount $415,000 / Monthly Payment $2,870");
  eq("f3 note", r.note, PMI_NOTE);
  eq("f3 no table", r.table, null);
}
eq("f3 no closing", rows(f3({ includeClosing: false })), "Down Payment $100,000 / Down Payment Percentage 20.0% / Closing Costs $0 / Loan Amount $400,000 / Monthly Payment $2,766");
eq("f3 negative", rows(f3({ cash: "10000" })), "Down Payment $-5,000 / Down Payment Percentage -1.0% / Closing Costs $15,000 / Loan Amount $505,000 / Monthly Payment $3,492");
eq("f3 over 100%", f3({ cash: "600000" }).title, "Down Payment: 117.0%");
eq("f3 $ closing", f3({ closingUnit: "dollar", closingCosts: "9000" }).title, "Down Payment: 18.2%");
eq("f3 zero price", f3({ price: "0" }).empty, true);

// ── Validation ──
eq("f1 errors", f1({ cash: "x", downPercent: "x", closingCosts: "x", rate: "x", years: "x" }).errors.join(" | "),
  "Please provide a positive cash amount to put into house. | Please provide a positive down payment percentage. | Please provide a positive closing costs. | Please provide a positive interest rate. | Please provide a positive loan term.");
eq("f2 errors", f2({ price: "x" }).errors.join(), "Please provide a positive home price amount.");
eq("f3 errors", f3({ cash: "x" }).errors.join(), "Please provide a positive upfront cash available amount.");
eq("zeros allowed, negatives not", f1({ cash: "0", downPercent: "0", closingCosts: "-1", rate: "-1", years: "0" }).errors.join(" | "),
  "Please provide a positive closing costs. | Please provide a positive interest rate. | Please provide a positive loan term.");
eq("closing 100%", f1({ closingCosts: "100" }).errors.join(), "Closing costs percentage should not be so high.");
eq("closing over cash", f1({ closingUnit: "dollar", closingCosts: "100001", rate: "x" }).errors.join(" | "),
  "Closing costs should not be more than the cash amount you plan to put in. | Please provide a positive interest rate.");
eq("unchecked closing skips its check", f1({ includeClosing: false, closingCosts: "x" }).errors, undefined);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
