// Plain-Node test suite for the Social Security Calculator engine. Run
// with:
//   node scripts/social-security-calculator.test.js
//
// This reference page (calculator.net/social-security-calculator.html)
// HAS a working GET query-string interface, and its charts' tooltips
// embed exact figures per data point — every case below was verified
// via plain curl requests. See social-security-calculator-notes.md.

import { calculateIdealApplicationAge, calculateCompareTwoAges } from "../src/utils/socialSecurityCalculatorEngine.js";

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

function approx(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// 1. Ideal application age — the reference's own screenshot scenario.
//    All 9 points of the "relative value" bar chart VERIFIED EXACT
//    (residual < 0.02 percentage points — essentially exact) against
//    the reference's own tooltip data.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateIdealApplicationAge({ birthYear: 1970, lifeExpectancy: 83, investmentReturn: 5, cola: 3 });
  ok("bestAge = 68 (matches live reference exactly)", r.bestAge === 68, r.bestAge);
  ok("nraLabel = 67", r.nraLabel === "67", r.nraLabel);
  ok("monthsDiff = 12 (12 months after NRA)", r.monthsDiff === 12, r.monthsDiff);
  ok("bestPctOfPia = 108%", approx(r.bestPctOfPia, 108, 0.01), r.bestPctOfPia);

  const target = { 62: 94.74, 63: 95.91, 64: 96.44, 65: 98.24, 66: 99.21, 67: 99.38, 68: 100.00, 69: 99.68, 70: 98.46 };
  for (const [age, val] of Object.entries(target)) {
    const p = r.points.find((x) => x.age === Number(age));
    ok(`relativeValue age${age} = ${val} (exact)`, approx(p.relativeValue, val, 0.02), p.relativeValue);
  }
}

// ─────────────────────────────────────────────────────────────────
// 2. Ideal application age — fractional Normal Retirement Age (NRA)
//    scenarios, verifying the generalized months-early/late formula
//    for birth years before 1960 (where NRA isn't a round number).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateIdealApplicationAge({ birthYear: 1958, lifeExpectancy: 83, investmentReturn: 5, cola: 3 });
  ok("1958: nraLabel = 66 and 8 months", r.nraLabel === "66 and 8 months", r.nraLabel);
  ok("1958: bestPctOfPia = 110.67% (exact)", approx(r.bestPctOfPia, 110.67, 0.01), r.bestPctOfPia);
}
{
  const r = calculateIdealApplicationAge({ birthYear: 1959, lifeExpectancy: 83, investmentReturn: 5, cola: 3 });
  ok("1959: nraLabel = 66 and 10 months", r.nraLabel === "66 and 10 months", r.nraLabel);
  ok("1959: bestPctOfPia = 109.33% (exact)", approx(r.bestPctOfPia, 109.33, 0.01), r.bestPctOfPia);
}

// ─────────────────────────────────────────────────────────────────
// 3. Ideal application age — "before NRA" wording (short life
//    expectancy makes claiming at 62 optimal) and the "already too
//    old" special case (current age >= 70, using the real calendar
//    year — VERIFIED EXACT boundary: 69 computes normally, 70 shows
//    the direct "apply now" message instead).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateIdealApplicationAge({ birthYear: 1970, lifeExpectancy: 68, investmentReturn: 5, cola: 3 });
  ok("short life expectancy: bestAge = 62", r.bestAge === 62, r.bestAge);
  ok("short life expectancy: monthsDiff = -60 (60 months before NRA)", r.monthsDiff === -60, r.monthsDiff);
  ok("short life expectancy: bestPctOfPia = 70%", approx(r.bestPctOfPia, 70, 0.01), r.bestPctOfPia);
}
{
  const currentYear = new Date().getFullYear();
  const r = calculateIdealApplicationAge({ birthYear: currentYear - 70, lifeExpectancy: 83, investmentReturn: 5, cola: 3 });
  ok("already 70: shows the direct apply-now message", r.alreadyTooOld === true, r);
  ok("already 70: currentAge = 70", r.currentAge === 70, r.currentAge);
}
{
  const currentYear = new Date().getFullYear();
  const r = calculateIdealApplicationAge({ birthYear: currentYear - 69, lifeExpectancy: 83, investmentReturn: 5, cola: 3 });
  ok("already 69: computes normally (not yet 70)", r.alreadyTooOld === undefined, r);
}

// ─────────────────────────────────────────────────────────────────
// 4. Ideal application age — input validation. Live-bisected exact
//    boundaries against the reference.
// ─────────────────────────────────────────────────────────────────
{
  const base = { birthYear: 1970, lifeExpectancy: 83, investmentReturn: 5, cola: 3 };
  ok("birth year 1899 rejected, 1900 accepted", !!calculateIdealApplicationAge({ ...base, birthYear: 1899 }).error && !calculateIdealApplicationAge({ ...base, birthYear: 1900 }).error);
  ok("life expectancy 0 rejected, 1 accepted", !!calculateIdealApplicationAge({ ...base, lifeExpectancy: 0 }).error && !calculateIdealApplicationAge({ ...base, lifeExpectancy: 1 }).error);
  ok("return of -100 rejected, -99 accepted", !!calculateIdealApplicationAge({ ...base, investmentReturn: -100 }).error && !calculateIdealApplicationAge({ ...base, investmentReturn: -99 }).error);
  ok("return of 1000 accepted, 1001 rejected", !calculateIdealApplicationAge({ ...base, investmentReturn: 1000 }).error && !!calculateIdealApplicationAge({ ...base, investmentReturn: 1001 }).error);
  ok("cola of 50 accepted, 51 rejected", !calculateIdealApplicationAge({ ...base, cola: 50 }).error && !!calculateIdealApplicationAge({ ...base, cola: 51 }).error);
  ok("negative cola rejected", !!calculateIdealApplicationAge({ ...base, cola: -1 }).error);
}

// ─────────────────────────────────────────────────────────────────
// 5. Compare two application ages — the reference's own screenshot
//    scenario. Crossover age and several chart points VERIFIED EXACT
//    (or within the ~0.2-0.5% monthly-compounding residual documented
//    for the Pension Calculator's identical mechanism).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateCompareTwoAges({ retirementAge1: 62, monthlyIncome1: 1600, retirementAge2: 70, monthlyIncome2: 2810, investmentReturn: 5, cola: 3 });
  ok("crossover age = 82 (matches live reference exactly)", r.crossoverAge === 82, r.crossoverAge);
  ok("sentence kind = crossover", r.sentence.kind === "crossover");
  ok("laterAge = 70", r.sentence.laterAge === 70);
  ok("earlierAge = 62", r.sentence.earlierAge === 62);
  const p63 = r.points.find((p) => p.age === 63);
  ok("age63 option1 ~$18,737 (0.5% tol)", approx(p63.option1, 18737, 18737 * 0.005), p63.option1);
  const p82 = r.points.find((p) => p.age === 82);
  ok("age82 option1 ~$314,093 (0.5% tol)", approx(p82.option1, 314093, 314093 * 0.005), p82.option1);
  ok("age82 option2 ~$305,266 (0.5% tol)", approx(p82.option2, 305266, 305266 * 0.005), p82.option2);
}

// ─────────────────────────────────────────────────────────────────
// 6. Compare two application ages — a scenario where NEITHER
//    retirement age is 62, which disambiguates that the COLA-during-
//    deferral growth is anchored to the EARLIER of the two retirement
//    ages, not a fixed age 62 — VERIFIED EXACT (this is what
//    distinguishes this calculator's model from the Pension
//    Calculator's structurally-identical "work longer" comparison,
//    which needs NO deferral growth at all).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateCompareTwoAges({ retirementAge1: 65, monthlyIncome1: 2000, retirementAge2: 70, monthlyIncome2: 2810, investmentReturn: 5, cola: 3 });
  const p71 = r.points.find((p) => p.age === 71);
  ok("neither age is 62: age71 option2 ~$29,890 (0.5% tol)", approx(p71.option2, 29890, 29890 * 0.005), p71.option2);
}

// ─────────────────────────────────────────────────────────────────
// 7. Compare two application ages — input validation, sharing the
//    exact same ranges/messages as the Pension Calculator's own
//    "work longer" fields (confirmed live — even the exact wording
//    "...monthly pension income 1." leaks the shared backend).
// ─────────────────────────────────────────────────────────────────
{
  const base = { retirementAge1: 62, monthlyIncome1: 1600, retirementAge2: 70, monthlyIncome2: 2810, investmentReturn: 5, cola: 3 };
  ok("retirement age 1 = 23 rejected", calculateCompareTwoAges({ ...base, retirementAge1: 23 }).error === "Please provide a reasonable retirement age 1.");
  ok("retirement age 2 = 23 rejected", calculateCompareTwoAges({ ...base, retirementAge2: 23 }).error === "Please provide a reasonable retirement age 2.");
  ok("negative monthly income 1 rejected", calculateCompareTwoAges({ ...base, monthlyIncome1: -1 }).error === "Please provide a positive monthly pension income 1.");
  ok("negative monthly income 2 rejected", calculateCompareTwoAges({ ...base, monthlyIncome2: -1 }).error === "Please provide a positive monthly pension income 2.");
}

console.log(`\nSocial Security Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
