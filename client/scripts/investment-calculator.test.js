// Plain-Node test suite for the Investment Calculator engine. Run with:
//   node scripts/investment-calculator.test.js
//
// Every scenario below was verified against the LIVE reference site (GET
// requests, not screenshots) across all 5 tabs × both contribution
// frequencies (monthly/annually) × both contribution timings
// (beginning/end) — 20 scenarios total, every one matching to the cent
// (or thousandth of a percent/year for Return Rate/Investment Length).

import {
  calculateEndAmount, calculateAdditionalContribution, calculateReturnRate,
  calculateStartingAmount, calculateInvestmentLength,
} from "../src/utils/investmentCalculatorEngine.js";

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

function approx(a, b, tolerance = 0.02) {
  return Math.abs(a - b) <= tolerance;
}

const BASE = { startingAmount: 20_000, years: 10, annualRatePercent: 6, compound: "annually", contribution: 1_000 };

// ─────────────────────────────────────────────────────────────────
// 1. End Amount — all 4 timing/frequency combos
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["monthly", "beginning", 199_081.24, 120_000, 59_081.24],
    ["monthly", "end", 198_290.40, 120_000, 58_290.40],
    ["annually", "beginning", 49_788.60, 10_000, 19_788.60],
    ["annually", "end", 48_997.75, 10_000, 18_997.75],
  ];
  for (const [freq, at, expEnd, expContrib, expInterest] of cases) {
    const r = calculateEndAmount({ ...BASE, contributeAt: at, contributionFrequency: freq });
    ok(`EndAmount ${freq}/${at}: end balance (exact)`, approx(r.endBalance, expEnd), `got ${r.endBalance.toFixed(2)}`);
    ok(`EndAmount ${freq}/${at}: total contributions (exact)`, approx(r.totalContributions, expContrib), `got ${r.totalContributions.toFixed(2)}`);
    ok(`EndAmount ${freq}/${at}: total interest (exact)`, approx(r.totalInterest, expInterest), `got ${r.totalInterest.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// 2. Additional Contribution — all 4 combos (target $1,000,000)
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["monthly", "beginning", 5_905.66], ["monthly", "end", 5_934.40],
    ["annually", "beginning", 69_010.00], ["annually", "end", 73_150.60],
  ];
  for (const [freq, at, expContrib] of cases) {
    const r = calculateAdditionalContribution({ targetAmount: 1_000_000, startingAmount: 20_000, years: 10, annualRatePercent: 6, compound: "annually", contributeAt: at, contributionFrequency: freq });
    ok(`AddContrib ${freq}/${at}: contribution (exact)`, approx(r.contribution, expContrib), `got ${r.contribution.toFixed(2)}`);
    ok(`AddContrib ${freq}/${at}: end balance = target`, approx(r.endBalance, 1_000_000, 1), `got ${r.endBalance.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// 3. Return Rate — all 4 combos. NO Compound selector; confirmed live
// that changing Compound has zero effect on this tab (see engine's file
// header) — resolved as if Compound = "annually" always.
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["monthly", "beginning", 32.337], ["monthly", "end", 32.594],
    ["annually", "beginning", 45.753], ["annually", "end", 46.402],
  ];
  for (const [freq, at, expRate] of cases) {
    const r = calculateReturnRate({ targetAmount: 1_000_000, startingAmount: 20_000, years: 10, contribution: 1_000, contributeAt: at, contributionFrequency: freq });
    ok(`ReturnRate ${freq}/${at}: rate (exact to 3dp)`, approx(r.annualRatePercent, expRate, 0.002), `got ${r.annualRatePercent.toFixed(3)}`);
    ok(`ReturnRate ${freq}/${at}: end balance = target`, approx(r.endBalance, 1_000_000, 1), `got ${r.endBalance.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// 4. Starting Amount — all 4 combos
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["monthly", "beginning", 467_228.85], ["monthly", "end", 467_670.46],
    ["annually", "beginning", 550_593.08], ["annually", "end", 551_034.69],
  ];
  for (const [freq, at, expP] of cases) {
    const r = calculateStartingAmount({ targetAmount: 1_000_000, years: 10, annualRatePercent: 6, compound: "annually", contribution: 1_000, contributeAt: at, contributionFrequency: freq });
    ok(`StartAmt ${freq}/${at}: starting amount (exact)`, approx(r.startingAmountSolved, expP), `got ${r.startingAmountSolved.toFixed(2)}`);
    ok(`StartAmt ${freq}/${at}: end balance = target`, approx(r.endBalance, 1_000_000, 1), `got ${r.endBalance.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// 5. Investment Length — all 4 combos
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["monthly", "beginning", 28.711], ["monthly", "end", 28.772],
    ["annually", "beginning", 56.574], ["annually", "end", 57.019],
  ];
  for (const [freq, at, expYears] of cases) {
    const r = calculateInvestmentLength({ targetAmount: 1_000_000, startingAmount: 20_000, annualRatePercent: 6, compound: "annually", contribution: 1_000, contributeAt: at, contributionFrequency: freq });
    ok(`InvestLen ${freq}/${at}: years (exact to 3dp)`, approx(r.years, expYears, 0.002), `got ${r.years.toFixed(3)}`);
    ok(`InvestLen ${freq}/${at}: end balance = target`, approx(r.endBalance, 1_000_000, 1), `got ${r.endBalance.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// Investment Length — a real reported bug: a LONG solved length (past
// 100 years) hit the bisection search's own upper bound (MAX_YEARS was
// 100) and returned exactly "100.000" instead of converging — the same
// "search range too narrow" failure as the Return Rate bug above, this
// time on the years axis. Also covers a second bug the fix surfaced:
// Total Contributions was computed from `Math.round(years)` whole
// periods, understating it by a few dollars against the reference (which
// uses the exact FRACTIONAL solved years, matching the same fractional
// period count the underlying end-balance math already uses). Verified
// against the live reference: target $600,593, starting $120, 3% daily
// compound, $102/year contribution.
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["beginning", 171.030, 17_445.11, 583_027.89],
    ["end", 171.990, 17_543.00, 582_930.00],
  ];
  for (const [at, expYears, expContrib, expInterest] of cases) {
    const r = calculateInvestmentLength({ targetAmount: 600_593, startingAmount: 120, annualRatePercent: 3, compound: "daily", contribution: 102, contributeAt: at, contributionFrequency: "annually" });
    ok(`InvestLen long-horizon ${at}: years ≈ ${expYears} (was returning 100.000 search-bound before fix)`, approx(r.years, expYears, 0.002), `got ${r.years.toFixed(3)}`);
    ok(`InvestLen long-horizon ${at}: end balance = target ($600,593)`, approx(r.endBalance, 600_593, 0.5), `got ${r.endBalance.toFixed(2)}`);
    ok(`InvestLen long-horizon ${at}: total contributions ≈ $${expContrib} (fractional periods, not rounded)`, approx(r.totalContributions, expContrib, 1), `got ${r.totalContributions.toFixed(2)}`);
    ok(`InvestLen long-horizon ${at}: total interest ≈ $${expInterest}`, approx(r.totalInterest, expInterest, 1), `got ${r.totalInterest.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// Return Rate — NEGATIVE rate scenario (a real reported bug): when the
// target is below what a 0%-return scenario would already produce from
// starting amount + contributions alone, the true answer is a negative
// rate ("your investment needs to lose money to land on this target").
// The shared, clamping effectiveAnnualRate() made every negative-rate
// guess during the binary search evaluate identically (as if rate=0%),
// so the search could never bracket the true root and always returned
// its own search boundary (-99.000%) instead of converging — this
// engine now uses a local, unclamped EAR helper instead. Verified
// against the live reference: target $13,590, starting $4,562, after 11
// years, contribution $130/month.
// ─────────────────────────────────────────────────────────────────

{
  const cases = [["beginning", -7.294], ["end", -7.383]];
  for (const [at, expRate] of cases) {
    const r = calculateReturnRate({ targetAmount: 13_590, startingAmount: 4_562, years: 11, contribution: 130, contributeAt: at, contributionFrequency: "monthly" });
    ok(`ReturnRate negative-rate ${at}: rate ≈ ${expRate}% (exact, was returning -99% search-bound before fix)`, approx(r.annualRatePercent, expRate, 0.002), `got ${r.annualRatePercent.toFixed(3)}`);
    ok(`ReturnRate negative-rate ${at}: end balance = target ($13,590)`, approx(r.endBalance, 13_590, 0.5), `got ${r.endBalance.toFixed(2)}`);
    ok(`ReturnRate negative-rate ${at}: total interest = -$8,132.00 (end balance below principal+contributions)`, approx(r.totalInterest, -8_132, 0.5), `got ${r.totalInterest.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// Compound frequency: End Amount respects it; Return Rate ignores it
// (confirmed live — see engine file header).
// ─────────────────────────────────────────────────────────────────

{
  const annually = calculateEndAmount({ ...BASE, compound: "annually", contributeAt: "beginning", contributionFrequency: "monthly" });
  const monthly = calculateEndAmount({ ...BASE, compound: "monthly", contributeAt: "beginning", contributionFrequency: "monthly" });
  ok("EndAmount: changing Compound changes the result", !approx(annually.endBalance, monthly.endBalance, 1));

  const rrAnnually = calculateReturnRate({ targetAmount: 1_000_000, startingAmount: 20_000, years: 10, contribution: 1_000, contributeAt: "beginning", contributionFrequency: "monthly" });
  ok("ReturnRate: matches the Compound-independent reference figure regardless", approx(rrAnnually.annualRatePercent, 32.337, 0.002));
}

// ─────────────────────────────────────────────────────────────────
// Accumulation schedule + bar-chart data — verified against the
// reference's own embedded chart-tooltip data for the default scenario
// (monthly/end): year 1 = Starting $20,000 + Contributions $12,000 +
// Interest $1,526.53 = Total $33,526.53; month 1 deposit $21,000
// (starting amount + first contribution, a display convention), interest
// $97.35, balance $21,097.35.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateEndAmount({ ...BASE, contributeAt: "end", contributionFrequency: "monthly" });
  ok("Schedule: month 1 deposit = $21,000 (starting + first contribution)", approx(r.monthlySchedule[0].deposit, 21_000, 0.01));
  ok("Schedule: month 1 interest = $97.35", approx(r.monthlySchedule[0].interest, 97.35, 0.01), `got ${r.monthlySchedule[0].interest.toFixed(2)}`);
  ok("Schedule: month 1 balance = $21,097.35", approx(r.monthlySchedule[0].balance, 21_097.35, 0.01), `got ${r.monthlySchedule[0].balance.toFixed(2)}`);
  ok("Bar data: year 1 starting amount = $20,000", approx(r.barData[0].startingAmount, 20_000, 0.01));
  ok("Bar data: year 1 contributions = $12,000", approx(r.barData[0].contributions, 12_000, 0.01));
  ok("Bar data: year 1 interest = $1,526.53", approx(r.barData[0].interest, 1_526.53, 0.01), `got ${r.barData[0].interest.toFixed(2)}`);
  ok("Bar data: year 10 total = end balance ($198,290.40)", approx(r.barData[9].total, 198_290.40, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// Schedule — ANNUAL contribution timed at "beginning" (a real reported
// bug): the monthly grid placed the deposit at month 12/24 (the LAST
// month of each year) regardless of "beginning"/"end" timing, which is
// only correct for "end". "Beginning" should land the deposit at month
// 1/13 (the FIRST month of each year) instead — confirmed live against
// the reference: starting $22, 2yr, 3%/annually compound, $222/year,
// beginning. Headline End Balance was already correct either way (the
// closed-form math doesn't go through this monthly grid); only the
// schedule's own per-period placement was wrong.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateEndAmount({ startingAmount: 22, years: 2, annualRatePercent: 3, compound: "annually", contribution: 222, contributeAt: "beginning", contributionFrequency: "annually" });
  ok("Annual/beginning schedule: month 1 deposit = $244.00 (starting + year-1 contribution)", approx(r.monthlySchedule[0].deposit, 244, 0.01), `got ${r.monthlySchedule[0].deposit.toFixed(2)}`);
  ok("Annual/beginning schedule: month 12 deposit = $0.00 (NOT where the year-2 contribution lands)", approx(r.monthlySchedule[11].deposit, 0, 0.01), `got ${r.monthlySchedule[11].deposit.toFixed(2)}`);
  ok("Annual/beginning schedule: month 13 deposit = $222.00 (year-2 contribution, at the START of year 2)", approx(r.monthlySchedule[12].deposit, 222, 0.01), `got ${r.monthlySchedule[12].deposit.toFixed(2)}`);
  ok("Annual/beginning schedule: month 12 balance = $251.32", approx(r.monthlySchedule[11].balance, 251.32, 0.01), `got ${r.monthlySchedule[11].balance.toFixed(2)}`);
  ok("Annual/beginning schedule: month 24 (final) balance = end balance ($487.52)", approx(r.monthlySchedule[23].balance, 487.52, 0.01), `got ${r.monthlySchedule[23].balance.toFixed(2)}`);
  ok("Annual/beginning schedule: end balance = $487.52", approx(r.endBalance, 487.52, 0.01), `got ${r.endBalance.toFixed(2)}`);

  // "end" timing is unaffected — deposit correctly stays at month 12/24.
  const rEnd = calculateEndAmount({ startingAmount: 22, years: 2, annualRatePercent: 3, compound: "annually", contribution: 222, contributeAt: "end", contributionFrequency: "annually" });
  ok("Annual/end schedule (unaffected by the fix): month 12 deposit = $222.00", approx(rEnd.monthlySchedule[11].deposit, 222, 0.01), `got ${rEnd.monthlySchedule[11].deposit.toFixed(2)}`);
  ok("Annual/end schedule (unaffected by the fix): month 1 deposit = $22.00 (just the starting amount, no contribution yet)", approx(rEnd.monthlySchedule[0].deposit, 22, 0.01), `got ${rEnd.monthlySchedule[0].deposit.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  const zero = calculateEndAmount({ startingAmount: 0, years: 10, annualRatePercent: 6, compound: "annually", contribution: 0, contributeAt: "end", contributionFrequency: "monthly" });
  ok("$0 everything: no crash, $0 end balance", zero.endBalance === 0 && Number.isFinite(zero.endBalance));

  const zeroRate = calculateEndAmount({ startingAmount: 10_000, years: 5, annualRatePercent: 0, compound: "annually", contribution: 100, contributeAt: "end", contributionFrequency: "monthly" });
  ok("0% rate: no interest, end balance = principal + contributions", approx(zeroRate.endBalance, 10_000 + 100 * 60, 0.01) && approx(zeroRate.totalInterest, 0, 0.01));

  const zeroYears = calculateEndAmount({ startingAmount: 10_000, years: 0, annualRatePercent: 6, compound: "annually", contribution: 100, contributeAt: "end", contributionFrequency: "monthly" });
  ok("0 years: no crash, end balance = starting amount", approx(zeroYears.endBalance, 10_000, 0.01));

  // Reference legitimately solves to a NEGATIVE contribution here (the
  // starting amount alone already overshoots the target at 6%/10yr) —
  // verified live: $-97.35/month, End Balance = target exactly, Total
  // Contributions $-11,682.12 (a real "you'd need to WITHDRAW $97.35/month
  // to land exactly on $20,000" answer). A previous version of this test
  // wrongly asserted a $0-clamped answer; see investment-calculator-notes.md.
  const noContrib = calculateAdditionalContribution({ targetAmount: 20_000, startingAmount: 20_000, years: 10, annualRatePercent: 6, compound: "annually", contributeAt: "end", contributionFrequency: "monthly" });
  ok("Target already met by starting amount alone: contribution solves NEGATIVE (not clamped to $0)", approx(noContrib.contribution, -97.35, 0.01), `got ${noContrib.contribution.toFixed(2)}`);
  ok("...end balance = target exactly ($20,000.00)", approx(noContrib.endBalance, 20_000, 0.5), `got ${noContrib.endBalance.toFixed(2)}`);
  ok("...total contributions = $-11,682.12", approx(noContrib.totalContributions, -11_682.12, 0.5), `got ${noContrib.totalContributions.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Starting Amount — a real reported bug: when contributions ALONE
// (with $0 starting amount) would already overshoot the target, the
// closed-form solve for P is negative. An earlier version of this
// clamped that to $0, which silently changes the question from "what
// starting amount reaches the target" to "what does the starting
// amount alone grow to if it's $0" — for the first reported scenario
// below, that meant showing an unrelated $7.6 TRILLION end balance
// instead of the requested $40,024. The reference does NOT clamp: it
// shows the real negative starting amount and lands exactly on target.
// Verified via direct GET requests to the live reference for BOTH
// reported scenarios × all 4 timing/frequency combos, matching to the
// cent. (An earlier investigation of the first scenario alone wrongly
// concluded the reference DOES clamp to 0 — a misreading of which
// screenshots were "reference" vs "our tool"; re-querying the live
// reference directly settled it. See investment-calculator-notes.md.)
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    // [targetAmount, years, annualRatePercent, contribution, at, freq, expP, expEnd, expInterest]
    [2_390, 30, 1, 200, "beginning", "monthly", -60_460.72, 2_390, -9_149.28],
    [2_390, 30, 1, 200, "end", "monthly", -60_408.90, 2_390, -9_201.10],
    [2_390, 30, 1, 200, "beginning", "annually", -3_439.08, 2_390, -170.92],
    [2_390, 30, 1, 200, "end", "annually", -3_387.25, 2_390, -222.75],
    [40_024, 92, 23, 103, "beginning", "monthly", -5_451.29, 40_024, -68_236.71],
    [40_024, 92, 23, 103, "end", "monthly", -5_348.29, 40_024, -68_339.71],
    [40_024, 92, 23, 103, "beginning", "annually", -503.43, 40_024, 31_051.43],
    [40_024, 92, 23, 103, "end", "annually", -400.43, 40_024, 30_948.43],
  ];
  for (const [target, years, rate, contribution, at, freq, expP, expEnd, expInterest] of cases) {
    const r = calculateStartingAmount({ targetAmount: target, years, annualRatePercent: rate, compound: "semimonthly", contribution, contributeAt: at, contributionFrequency: freq });
    ok(`StartAmt ${target}/${at}/${freq}: starting amount ≈ $${expP} (NOT clamped to $0)`, approx(r.startingAmountSolved, expP, 0.5), `got ${r.startingAmountSolved.toFixed(2)}`);
    ok(`StartAmt ${target}/${at}/${freq}: end balance = target ($${expEnd})`, approx(r.endBalance, expEnd, 0.5), `got ${r.endBalance.toFixed(2)}`);
    ok(`StartAmt ${target}/${at}/${freq}: total interest ≈ $${expInterest}`, approx(r.totalInterest, expInterest, 0.5), `got ${r.totalInterest.toFixed(2)}`);
  }
}

console.log(`\nInvestment Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
