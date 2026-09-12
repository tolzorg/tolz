// Plain-Node test suite for the Rent Calculator engine. Run with:
//   node scripts/rent-calculator.test.js
//
// Every scenario verified against the LIVE calculator.net/rent-
// calculator.html reference via plain GET requests (server-rendered, no
// Playwright needed) — see rentCalculatorEngine.js's own doc comment.
// Figures checked to the penny (whole dollar, since this calculator
// rounds to $0 decimals).

import { calculateRent, validateRentInputs, formatCurrency } from "../src/utils/rentCalculatorEngine.js";

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

function approx(a, b, tolerance = 0.6) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// 1. The reference's own screenshot scenario: $90,033/yr, $3/mo debt
//    → afford $2,698, safe $2,098, 1/3-rule $2,501 (shown, since it's
//    tighter than the afford figure).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 90033, incomeUnit: "year", monthlyDebt: 3 });
  ok("S1 afford", approx(r.afford, 2698));
  ok("S1 safe", approx(r.safe, 2098));
  ok("S1 oneThird", approx(r.oneThird, 2501));
  ok("S1 showOneThird true", r.showOneThird === true);
  ok("S1 hardToMeet false", r.hardToMeet === false);
  ok("S1 formatCurrency", formatCurrency(r.afford, { decimals: 0 }) === "$2,698", formatCurrency(r.afford, { decimals: 0 }));
}

// ─────────────────────────────────────────────────────────────────
// 2. $80,000/yr, $0 debt → afford $2,400, safe $1,867, 1/3 $2,222.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 80000, incomeUnit: "year", monthlyDebt: 0 });
  ok("S2 afford", approx(r.afford, 2400));
  ok("S2 safe", approx(r.safe, 1867));
  ok("S2 oneThird", approx(r.oneThird, 2222));
}

// ─────────────────────────────────────────────────────────────────
// 3. Debt isolates its effect: $60,000/yr, $500 debt → afford $1,300,
//    safe $900. The 1/3 rule ($1,667) is NOT tighter here, so it's
//    correctly hidden.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 60000, incomeUnit: "year", monthlyDebt: 500 });
  ok("S3 afford (debt subtracted)", approx(r.afford, 1300));
  ok("S3 safe (debt subtracted)", approx(r.safe, 900));
  ok("S3 showOneThird false (not binding)", r.showOneThird === false);
}

// ─────────────────────────────────────────────────────────────────
// 4. $80,000/yr, $100 debt → 1/3 rule becomes binding again.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 80000, incomeUnit: "year", monthlyDebt: 100 });
  ok("S4 afford", approx(r.afford, 2300));
  ok("S4 safe", approx(r.safe, 1767));
  ok("S4 showOneThird true", r.showOneThird === true);
}

// ─────────────────────────────────────────────────────────────────
// 5. Per-month income unit is equivalent to the per-year figure ÷ 12.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 6666.67, incomeUnit: "month", monthlyDebt: 0 });
  ok("S5 afford (month unit)", approx(r.afford, 2400));
}

// ─────────────────────────────────────────────────────────────────
// 6. "Hard to meet" boundary: $12,000/yr, $360/mo debt → afford = 0
//    exactly triggers the message; $359/mo debt → afford = $1, does
//    NOT trigger it, and "safe" is allowed to go negative ($-79).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 12000, incomeUnit: "year", monthlyDebt: 360 });
  ok("S6 hardToMeet at afford=0", r.hardToMeet === true);
}
{
  const r = calculateRent({ income: 12000, incomeUnit: "year", monthlyDebt: 359 });
  ok("S7 hardToMeet false at afford=1", r.hardToMeet === false);
  ok("S7 afford = $1", approx(r.afford, 1));
  ok("S7 safe goes negative", approx(r.safe, -79));
  ok("S7 negative formatCurrency sign-after-$", formatCurrency(r.safe, { decimals: 0 }) === "$-79", formatCurrency(r.safe, { decimals: 0 }));
}

// ─────────────────────────────────────────────────────────────────
// 7. Negative debt is accepted and computed literally (increases
//    affordability) — confirmed live, matching this app's established
//    permissiveness on negative inputs elsewhere.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateRent({ income: 50000, incomeUnit: "year", monthlyDebt: -100 });
  ok("S8 negative debt increases afford", approx(r.afford, 1600));
}

// ─────────────────────────────────────────────────────────────────
// 8. Validation — confirmed live: only negative income is rejected;
//    income of exactly 0 is allowed (and naturally lands on hardToMeet).
// ─────────────────────────────────────────────────────────────────
ok("validate: negative income blocked", validateRentInputs({ income: -5000 }) === "Please provide a positive income value.");
ok("validate: income=0 allowed", validateRentInputs({ income: 0 }) === null);
ok("validate: default scenario passes", validateRentInputs({ income: 90033 }) === null);
{
  const r = calculateRent({ income: 0, incomeUnit: "year", monthlyDebt: 0 });
  ok("income=0 -> hardToMeet", r.hardToMeet === true);
}

console.log(`\nRent Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
