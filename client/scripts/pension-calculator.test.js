// Plain-Node test suite for the Pension Calculator engine. Run with:
//   node scripts/pension-calculator.test.js
//
// This 3-in-1 reference page (calculator.net/pension-calculator.html)
// HAS a working GET query-string interface for all 3 sub-forms, and its
// chart tooltips embed exact per-point dollar figures — a very
// high-precision verification source. See pension-calculator-notes.md.

import { calculateLumpSumOrMonthly, calculateSingleLifeOrJoint, calculateWorkLonger } from "../src/utils/pensionCalculatorEngine.js";

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
// 1. Lump sum vs. monthly — the reference's own screenshot scenario.
//    The monthly-compounding chart curve carries a small, documented
//    ~0.2-0.3% residual (see notes) — verified via a 0.3% tolerance —
//    but the crossover age (the actual decision reported) matches the
//    live reference exactly.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateLumpSumOrMonthly({ retirementAge: 65, lumpSumAmount: 800000, investmentReturn: 5, monthlyIncome: 5000, cola: 3.5 });
  ok("crossover age = 81 (matches live reference exactly)", r.crossoverAge === 81, r.crossoverAge);
  ok("sentence kind = crossover", r.sentence.kind === "crossover");
  const p66 = r.points.find((p) => p.age === 66);
  ok("age66 monthly PV ~58554 (0.3% tol)", approx(p66.monthly, 58554, 58554 * 0.003), p66.monthly);
  const p121 = r.points.find((p) => p.age === 121);
  ok("age121 monthly PV ~2267674 (0.3% tol)", approx(p121.monthly, 2267674, 2267674 * 0.003), p121.monthly);
  ok("lump sum series is flat at the input amount", r.points.every((p) => p.lumpSum === 800000));
}

// ─────────────────────────────────────────────────────────────────
// 2. Lump sum vs. monthly — edge cases: monthly always wins / lump
//    sum always wins, verified live against the reference's own
//    alternate sentence wording.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateLumpSumOrMonthly({ retirementAge: 65, lumpSumAmount: 1000, investmentReturn: 5, monthlyIncome: 5000, cola: 3.5 });
  ok("always-monthly: sentence kind", r.sentence.kind === "alwaysMonthly");
}
{
  const r = calculateLumpSumOrMonthly({ retirementAge: 65, lumpSumAmount: 5000000, investmentReturn: 5, monthlyIncome: 5000, cola: 3.5 });
  ok("always-lumpsum: sentence kind", r.sentence.kind === "alwaysLumpSum");
  ok("always-lumpsum: crossoverAge is null", r.crossoverAge === null);
}

// ─────────────────────────────────────────────────────────────────
// 3. Single-life vs. joint-and-survivor — the reference's own
//    screenshot scenario. All 3 headline dollar figures VERIFIED EXACT
//    (annual compounding, not monthly — see notes for why the two
//    sub-calculators use different conventions).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSingleLifeOrJoint({
    retirementAge: 65, lifeExpectancy: 77, spousesAge: 62, spouseLifeExpectancy: 82,
    singleLifePension: 5000, jointSurvivorPension: 3000, investmentReturn: 5, cola: 3.5,
  });
  ok("lumpSum = $657,173 (exact)", Math.round(r.lumpSum) === 657173, r.lumpSum);
  ok("insuranceTerm = 20 years", r.insuranceTerm === 20);
  ok("paymentDiff = $2,000", r.paymentDiff === 2000);
  ok("fvDiff = $514,709 (exact)", Math.round(r.fvDiff) === 514709, r.fvDiff);
  ok("spouseAgeAtVantage = 74", r.spouseAgeAtVantage === 74);
  ok("pvRemaining = $428,530 (exact)", Math.round(r.pvRemaining) === 428530, r.pvRemaining);
  ok("betterOption = single (matches reference)", r.betterOption === "single");
}

// ─────────────────────────────────────────────────────────────────
// 4. Single-life vs. joint-and-survivor — controlled minimal
//    scenarios isolating each formula piece (0% return/COLA, then 5%
//    return/0% COLA), each VERIFIED EXACT live.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSingleLifeOrJoint({
    retirementAge: 65, lifeExpectancy: 66, spousesAge: 64, spouseLifeExpectancy: 70,
    singleLifePension: 1200, jointSurvivorPension: 1000, investmentReturn: 0, cola: 0,
  });
  ok("minimal (0%/0%): lumpSum = $84,000 (exact)", r.lumpSum === 84000, r.lumpSum);
}
{
  const r = calculateSingleLifeOrJoint({
    retirementAge: 65, lifeExpectancy: 66, spousesAge: 64, spouseLifeExpectancy: 70,
    singleLifePension: 1200, jointSurvivorPension: 1000, investmentReturn: 5, cola: 0,
  });
  ok("minimal (5%/0%): lumpSum = $72,908 (exact)", Math.round(r.lumpSum) === 72908, r.lumpSum);
}
{
  const r = calculateSingleLifeOrJoint({
    retirementAge: 65, lifeExpectancy: 67, spousesAge: 64, spouseLifeExpectancy: 70,
    singleLifePension: 1200, jointSurvivorPension: 1000, investmentReturn: 5, cola: 0,
  });
  ok("minimal2: fvDiff = $7,566 (exact)", Math.round(r.fvDiff) === 7566, r.fvDiff);
  ok("minimal2: pvRemaining = $44,679 (exact)", Math.round(r.pvRemaining) === 44679, r.pvRemaining);
}

// ─────────────────────────────────────────────────────────────────
// 5. Single-life vs. joint-and-survivor — reversed scenario where the
//    joint-and-survivor option wins from the investment perspective.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSingleLifeOrJoint({
    retirementAge: 65, lifeExpectancy: 90, spousesAge: 62, spouseLifeExpectancy: 95,
    singleLifePension: 5000, jointSurvivorPension: 4500, investmentReturn: 5, cola: 3.5,
  });
  ok("reversed: lumpSum = $1,462,458 (exact)", Math.round(r.lumpSum) === 1462458, r.lumpSum);
  ok("reversed: insuranceTerm = 33 years", r.insuranceTerm === 33);
  ok("reversed: betterOption = joint", r.betterOption === "joint");
}

// ─────────────────────────────────────────────────────────────────
// 6. Should you work longer — the reference's own screenshot scenario.
//    Crossover age is defined here as the first integer age where the
//    later-retirement option's PV overtakes the earlier one's — this
//    matches our OWN chart exactly; the live reference's TEXT (86)
//    disagrees by 1 year with its OWN chart data (which also crosses
//    at 87, confirmed by reading its tooltip series directly) — a
//    real inconsistency in the reference itself (see notes). We chose
//    internal self-consistency (sentence always matches our own chart).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateWorkLonger({ retirementAge1: 60, monthlyIncome1: 2500, retirementAge2: 65, monthlyIncome2: 3800, investmentReturn: 5, cola: 3.5 });
  ok("sentence kind = crossover", r.sentence.kind === "crossover", r.sentence);
  ok("laterAge = 65", r.sentence.laterAge === 65);
  ok("earlierAge = 60", r.sentence.earlierAge === 60);
  const p61 = r.points.find((p) => p.age === 61);
  ok("age61 option1 ~29277 (0.3% tol)", approx(p61.option1, 29277, 29277 * 0.003), p61.option1);
  ok("age61 option2 = 0 (not yet retired)", p61.option2 === 0);
  const p66 = r.points.find((p) => p.age === 66);
  ok("age66 option2 ~34868 (0.5% tol)", approx(p66.option2, 34868, 34868 * 0.005), p66.option2);
}

// ─────────────────────────────────────────────────────────────────
// 7. Should you work longer — edge cases and reversed retirement-age
//    order (option1 retires LATER than option2).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateWorkLonger({ retirementAge1: 65, monthlyIncome1: 3800, retirementAge2: 60, monthlyIncome2: 2500, investmentReturn: 5, cola: 3.5 });
  ok("reversed input order: laterAge is still 65", r.sentence.laterAge === 65, r.sentence);
  ok("reversed input order: earlierAge is still 60", r.sentence.earlierAge === 60, r.sentence);
}

// ─────────────────────────────────────────────────────────────────
// 8. Regression test for a real user-reported bug: an unreasonable
//    retirement age (e.g. 23) was silently computed instead of
//    rejected. All ranges below were bisected to the EXACT boundary
//    live against the reference (retirement age 29 fails, 30 passes,
//    100 passes, 101 fails; etc.) — see notes for the full table.
// ─────────────────────────────────────────────────────────────────
{
  const base1 = { retirementAge: 65, lumpSumAmount: 800000, investmentReturn: 5, monthlyIncome: 5000, cola: 3.5 };
  ok("ctype1: age 23 rejected (the reported bug)", calculateLumpSumOrMonthly({ ...base1, retirementAge: 23 }).error === "Please provide a reasonable retirement age.");
  ok("ctype1: age 29 rejected (exact boundary)", !!calculateLumpSumOrMonthly({ ...base1, retirementAge: 29 }).error);
  ok("ctype1: age 30 accepted (exact boundary)", !calculateLumpSumOrMonthly({ ...base1, retirementAge: 30 }).error);
  ok("ctype1: age 100 accepted (exact boundary)", !calculateLumpSumOrMonthly({ ...base1, retirementAge: 100 }).error);
  ok("ctype1: age 101 rejected (exact boundary)", !!calculateLumpSumOrMonthly({ ...base1, retirementAge: 101 }).error);
  ok("ctype1: negative lump sum rejected", calculateLumpSumOrMonthly({ ...base1, lumpSumAmount: -1 }).error === "Please provide a positive lump sum payment amount.");
  ok("ctype1: negative monthly income rejected", calculateLumpSumOrMonthly({ ...base1, monthlyIncome: -1 }).error === "Please provide a positive monthly pension income.");
  ok("ctype1: return of -100 rejected, -99 accepted", !!calculateLumpSumOrMonthly({ ...base1, investmentReturn: -100 }).error && !calculateLumpSumOrMonthly({ ...base1, investmentReturn: -99 }).error);
  ok("ctype1: return of 1000 accepted, 1001 rejected", !calculateLumpSumOrMonthly({ ...base1, investmentReturn: 1000 }).error && !!calculateLumpSumOrMonthly({ ...base1, investmentReturn: 1001 }).error);
  ok("ctype1: cola of 50 accepted, 51 rejected", !calculateLumpSumOrMonthly({ ...base1, cola: 50 }).error && !!calculateLumpSumOrMonthly({ ...base1, cola: 51 }).error);
  ok("ctype1: negative cola rejected", !!calculateLumpSumOrMonthly({ ...base1, cola: -1 }).error);

  const base2 = { retirementAge: 65, lifeExpectancy: 77, spousesAge: 62, spouseLifeExpectancy: 82, singleLifePension: 5000, jointSurvivorPension: 3000, investmentReturn: 5, cola: 3.5 };
  ok("ctype2: retirement age 23 rejected", calculateSingleLifeOrJoint({ ...base2, retirementAge: 23 }).error === "Please provide a reasonable retirement age.");
  ok("ctype2: life expectancy 29 rejected, 30 accepted", !!calculateSingleLifeOrJoint({ ...base2, lifeExpectancy: 29 }).error && !calculateSingleLifeOrJoint({ ...base2, lifeExpectancy: 30 }).error);
  ok("ctype2: life expectancy 120 accepted, 121 rejected", !calculateSingleLifeOrJoint({ ...base2, lifeExpectancy: 120 }).error && !!calculateSingleLifeOrJoint({ ...base2, lifeExpectancy: 121 }).error);
  ok("ctype2: spouse's age 15 rejected, 16 accepted", !!calculateSingleLifeOrJoint({ ...base2, spousesAge: 15 }).error && !calculateSingleLifeOrJoint({ ...base2, spousesAge: 16 }).error);
  ok("ctype2: spouse's age 100 accepted, 101 rejected", !calculateSingleLifeOrJoint({ ...base2, spousesAge: 100 }).error && !!calculateSingleLifeOrJoint({ ...base2, spousesAge: 101 }).error);
  ok("ctype2: spouse's life expectancy 29 rejected, 30 accepted", !!calculateSingleLifeOrJoint({ ...base2, spouseLifeExpectancy: 29 }).error && !calculateSingleLifeOrJoint({ ...base2, spouseLifeExpectancy: 30 }).error);
  ok("ctype2: negative single life pension rejected", calculateSingleLifeOrJoint({ ...base2, singleLifePension: -1 }).error === "Please provide a positive single life pension amount.");
  ok("ctype2: negative joint survivor pension rejected", calculateSingleLifeOrJoint({ ...base2, jointSurvivorPension: -1 }).error === "Please provide a positive joint survivor pension amount.");

  const base3 = { retirementAge1: 60, monthlyIncome1: 2500, retirementAge2: 65, monthlyIncome2: 3800, investmentReturn: 5, cola: 3.5 };
  ok("ctype3: retirement age 1 = 23 rejected with its own message", calculateWorkLonger({ ...base3, retirementAge1: 23 }).error === "Please provide a reasonable retirement age 1.");
  ok("ctype3: retirement age 2 = 23 rejected with its own message", calculateWorkLonger({ ...base3, retirementAge2: 23 }).error === "Please provide a reasonable retirement age 2.");
  ok("ctype3: negative monthly income 1 rejected with its own message", calculateWorkLonger({ ...base3, monthlyIncome1: -1 }).error === "Please provide a positive monthly pension income 1.");
  ok("ctype3: negative monthly income 2 rejected with its own message", calculateWorkLonger({ ...base3, monthlyIncome2: -1 }).error === "Please provide a positive monthly pension income 2.");
}

console.log(`\nPension Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
