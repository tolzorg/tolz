// Plain-Node test suite for the Sales Tax Calculator engine. Run with:
//   node scripts/sales-tax-calculator.test.js
//
// Every scenario below was verified against the LIVE reference via plain
// GET requests (the form submits GET to the same page, server-rendered
// — no Playwright needed), across every pairwise given/blank combination
// and every validation edge case.

import { calculateSalesTax, formatCurrency, formatPercent } from "../src/utils/salesTaxCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function approx(a, b, tolerance = 0.005) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// 1. The 3 solvable combinations — default scenario ($100, 6.5%, $106.50)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalesTax({ beforeTax: "100", taxRate: "6.5", afterTax: "" });
  ok("solve after: solved field", r.solved === "after");
  ok("solve after: before = 100", approx(r.before, 100));
  ok("solve after: rate = 6.5", approx(r.rate, 6.5));
  ok("solve after: after = 106.5", approx(r.after, 106.5));
  ok("solve after: taxDollar = 6.5", approx(r.taxDollar, 6.5));
}

{
  const r = calculateSalesTax({ beforeTax: "", taxRate: "6.5", afterTax: "106.5" });
  ok("solve before: solved field", r.solved === "before");
  ok("solve before: before = 100", approx(r.before, 100));
}

{
  const r = calculateSalesTax({ beforeTax: "100", taxRate: "", afterTax: "106.5" });
  ok("solve rate: solved field", r.solved === "rate");
  ok("solve rate: rate = 6.5", approx(r.rate, 6.5));
}

// ─────────────────────────────────────────────────────────────────
// 2. All 3 given — reference silently overwrites after-tax price
//    (before-tax + rate take priority), confirmed live
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalesTax({ beforeTax: "100", taxRate: "6.5", afterTax: "999" });
  ok("all-3-given: still solves 'after', ignoring the submitted 999", r.solved === "after" && approx(r.after, 106.5));
}

// ─────────────────────────────────────────────────────────────────
// 3. Presence/validation errors — 4 distinct messages, confirmed live
// ─────────────────────────────────────────────────────────────────

ok("only 1 given: 'at least two values'", calculateSalesTax({ beforeTax: "100", taxRate: "", afterTax: "" }).error === "Please provide at least two values to calculate.");
ok("none given: 'at least two values'", calculateSalesTax({ beforeTax: "", taxRate: "", afterTax: "" }).error === "Please provide at least two values to calculate.");
ok("beforetax = 0: rejected", calculateSalesTax({ beforeTax: "0", taxRate: "6.5", afterTax: "" }).error === "Please provide a valid before tax price.");
ok("beforetax negative: rejected", calculateSalesTax({ beforeTax: "-50", taxRate: "6.5", afterTax: "" }).error === "Please provide a valid before tax price.");
ok("taxrate negative: rejected", calculateSalesTax({ beforeTax: "100", taxRate: "-5", afterTax: "" }).error === "Please provide a valid sales tax rate.");
ok("afterprice negative: rejected", calculateSalesTax({ beforeTax: "", taxRate: "6.5", afterTax: "-10" }).error === "Please provide a valid after tax price.");
ok("after < before: rejected", calculateSalesTax({ beforeTax: "100", taxRate: "", afterTax: "50" }).error === "After tax price can not be smaller than before tax price.");

// ─────────────────────────────────────────────────────────────────
// 4. Zero is asymmetrically valid: taxrate=0 and afterprice=0 are BOTH
//    accepted (0% tax, or after-tax equal to before-tax, are legitimate)
//    even though beforetax=0 is rejected — confirmed live.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalesTax({ beforeTax: "100", taxRate: "0", afterTax: "" });
  ok("taxrate = 0 is valid", !r.error);
  ok("taxrate = 0: after = before = 100", approx(r.after, 100) && approx(r.taxDollar, 0));
}

{
  const r = calculateSalesTax({ beforeTax: "", taxRate: "6.5", afterTax: "0" });
  ok("afterprice = 0 is valid", !r.error);
  ok("afterprice = 0: before = 0 too", approx(r.before, 0));
}

// ─────────────────────────────────────────────────────────────────
// 5. Display formatting
// ─────────────────────────────────────────────────────────────────

ok("formatCurrency renders '$100.00'", formatCurrency(100) === "$100.00");
ok("formatPercent renders '6.50%'", formatPercent(6.5) === "6.50%");

console.log(`\nSales Tax Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
