// Plain-Node test suite for the Salary Calculator engine. Run with:
//   node scripts/salary-calculator.test.js
//
// Every scenario below was verified against the LIVE reference (plain
// GET requests to calculator.net/salary-calculator.html, which
// computes server-side — no Playwright needed).

import { calculateSalary } from "../src/utils/salaryCalculatorEngine.js";

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
// 1. Default reference scenario: $50/Hour, 40 hrs/wk, 5 days/wk,
//    10 holidays, 15 vacation days
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalary({ amount: 50, unit: "Hourly", hoursPerWeek: 40, daysPerWeek: 5, holidaysPerYear: 10, vacationDaysPerYear: 15 });
  const u = r.unadjusted, a = r.adjusted;
  ok("default: unadjusted hourly 50.00", approx(u.hourly, 50));
  ok("default: unadjusted daily 400.00", approx(u.daily, 400));
  ok("default: unadjusted weekly 2,000", approx(u.weekly, 2000));
  ok("default: unadjusted biweekly 4,000", approx(u.biweekly, 4000));
  ok("default: unadjusted semimonthly 4,333", approx(u.semimonthly, 4333));
  ok("default: unadjusted monthly 8,667", approx(u.monthly, 8667));
  ok("default: unadjusted quarterly 26,000", approx(u.quarterly, 26000));
  ok("default: unadjusted annual 104,000", approx(u.annual, 104000));

  ok("default: adjusted hourly 45.19", approx(a.hourly, 45.19, 0.01));
  ok("default: adjusted daily 361.54", approx(a.daily, 361.54, 0.01));
  ok("default: adjusted weekly 1,808", approx(a.weekly, 1808));
  ok("default: adjusted biweekly 3,615", approx(a.biweekly, 3615));
  ok("default: adjusted semimonthly 3,917", approx(a.semimonthly, 3917));
  ok("default: adjusted monthly 7,833", approx(a.monthly, 7833));
  ok("default: adjusted quarterly 23,500", approx(a.quarterly, 23500));
  ok("default: adjusted annual 94,000", approx(a.annual, 94000));
}

// ─────────────────────────────────────────────────────────────────
// 2. Annual input (reverse direction: input = ADJUSTED value, engine
//    must derive Unadjusted by working backward)
//    $60,000/Year, default 40hrs/5days/10 holidays/15 vacation
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalary({ amount: 60000, unit: "Annual", hoursPerWeek: 40, daysPerWeek: 5, holidaysPerYear: 10, vacationDaysPerYear: 15 });
  const u = r.unadjusted, a = r.adjusted;
  ok("annual-in: adjusted annual = input exactly (60,000)", approx(a.annual, 60000, 0.01));
  ok("annual-in: unadjusted annual 66,383", approx(u.annual, 66383));
  ok("annual-in: unadjusted hourly 31.91", approx(u.hourly, 31.91, 0.01));
  ok("annual-in: unadjusted daily 255.32", approx(u.daily, 255.32, 0.01));
  ok("annual-in: unadjusted weekly 1,277", approx(u.weekly, 1277));
  ok("annual-in: unadjusted biweekly 2,553", approx(u.biweekly, 2553));
  ok("annual-in: unadjusted semimonthly 2,766", approx(u.semimonthly, 2766));
  ok("annual-in: unadjusted monthly 5,532", approx(u.monthly, 5532));
  ok("annual-in: unadjusted quarterly 16,596", approx(u.quarterly, 16596));

  ok("annual-in: adjusted hourly 28.85", approx(a.hourly, 28.85, 0.01));
  ok("annual-in: adjusted daily 230.77", approx(a.daily, 230.77, 0.01));
  ok("annual-in: adjusted weekly 1,154", approx(a.weekly, 1154));
  ok("annual-in: adjusted biweekly 2,308", approx(a.biweekly, 2308));
  ok("annual-in: adjusted semimonthly 2,500", approx(a.semimonthly, 2500));
  ok("annual-in: adjusted monthly 5,000", approx(a.monthly, 5000));
  ok("annual-in: adjusted quarterly 15,000", approx(a.quarterly, 15000));
}

// ─────────────────────────────────────────────────────────────────
// 3. Daily input with NON-DEFAULT hours/days-per-week and
//    holidays/vacation — $200/Day, 37.5 hrs/wk, 5 days/wk, 8 holidays,
//    12 vacation days
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalary({ amount: 200, unit: "Daily", hoursPerWeek: 37.5, daysPerWeek: 5, holidaysPerYear: 8, vacationDaysPerYear: 12 });
  const u = r.unadjusted, a = r.adjusted;
  ok("daily-in: unadjusted daily = input exactly (200.00)", approx(u.daily, 200, 0.01));
  ok("daily-in: unadjusted hourly 26.67", approx(u.hourly, 26.67, 0.01));
  ok("daily-in: unadjusted weekly 1,000", approx(u.weekly, 1000));
  ok("daily-in: adjusted daily 184.62", approx(a.daily, 184.62, 0.01));
  ok("daily-in: adjusted hourly 24.62", approx(a.hourly, 24.62, 0.01));
  ok("daily-in: adjusted weekly 923", approx(a.weekly, 923));
}

// ─────────────────────────────────────────────────────────────────
// 4. Edge case: paid days off exceeding the 260-day base doesn't go
//    negative (clamped)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSalary({ amount: 50, unit: "Hourly", hoursPerWeek: 40, daysPerWeek: 5, holidaysPerYear: 200, vacationDaysPerYear: 200 });
  ok("clamped: adjustRatio never negative", r.adjustRatio >= 0, `got ${r.adjustRatio}`);
  ok("clamped: adjusted values are 0, not negative", r.adjusted.annual === 0, `got ${r.adjusted.annual}`);
}

console.log(`\nSalary Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
