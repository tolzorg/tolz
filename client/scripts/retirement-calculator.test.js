// Plain-Node test suite for the Retirement Calculator engine. Run with:
//   node scripts/retirement-calculator.test.js

import {
  calculateRetirementNeed, calculateSavingsPlan, calculateWithdrawal, calculateMoneyLongevity,
  validateRetirementAges,
} from "../src/utils/retirementCalculatorEngine.js";

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

function approx(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}
function approxPct(a, b, pct = 0.001) {
  return Math.abs(a - b) <= Math.abs(b) * pct;
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1: "How much do you need to retire?" — reference scenario:
// age 35, retire 67, life expectancy 85, income $70,000, income increase
// 3%, income needed 75% of current, return 6%, inflation 3%, other
// income $0, savings $30,000, future savings 10% of income
// ─────────────────────────────────────────────────────────────────

const NEED_INPUTS = {
  currentAge: 35, retireAge: 67, lifeExpectancy: 85, currentIncome: 70_000,
  incomeIncreasePercent: 3, retIncomeLevel: 75, retIncomeUnit: "percent",
  avgReturnPercent: 6, inflationPercent: 3, otherIncomeMonthly: 0,
  currentSavings: 30_000, futureSavings: 10, futureSavingsUnit: "percent",
};

{
  const r = calculateRetirementNeed(NEED_INPUTS);
  ok("Need: amount will have ≈ $1,098,539 (exact)", approx(r.amountWillHave, 1_098_539, 1), `got ${r.amountWillHave.toFixed(2)}`);
  ok("Need: have ratio ≈ 58% (matches reference's '58%')", Math.round(r.haveRatio * 100) === 58, `got ${(r.haveRatio * 100).toFixed(2)}%`);
  // "Amount needed" carries the documented ~0.5% residual (see engine's
  // growingAnnuityPV comment); the savings-plan figures below are DERIVED
  // from calc1's own (imperfect) amountNeeded, so they inherit that same
  // ~0.5% error by construction — verified within a looser bound here.
  // (calc2's OWN standalone test below uses the exact reference
  // amountNeeded as a direct input and gets exact results independently.)
  ok("Need: amount needed ≈ $1,884,793 (within 1%, documented residual)", approxPct(r.amountNeeded, 1_884_793, 0.01), `got ${r.amountNeeded.toFixed(2)}`);
  ok("Need: yearly savings amount ≈ $18,607.06 (within 1%, cascades from amountNeeded)", approxPct(r.yearlySavingsAmount, 18_607.06, 0.01), `got ${r.yearlySavingsAmount.toFixed(2)}`);
  ok("Need: percent of income needed ≈ 18.69% (within 1%, cascades from amountNeeded)", approxPct(r.percentOfIncomeNeeded, 18.69, 0.01), `got ${r.percentOfIncomeNeeded.toFixed(4)}`);
  ok("Need: monthly savings amount ≈ $1,510 (within 1%, cascades from amountNeeded)", approxPct(r.monthlySavingsAmount, 1_510, 0.01), `got ${r.monthlySavingsAmount.toFixed(2)}`);
  ok("Need: income at retirement (target) ≈ $11,266/mo actual (exact — definitional)", approx(r.incomeTarget.actual, 11_265.99, 1), `got ${r.incomeTarget.actual.toFixed(2)}`);
  ok("Need: income at retirement (target) today's money ≈ $4,375/mo", approxPct(r.incomeTarget.todays, 4_375, 0.02), `got ${r.incomeTarget.todays.toFixed(2)}`);

  // Balance-by-age chart cross-checks (exact, verified against the
  // reference's own chart tooltip data)
  const haveAge36 = r.balanceByAge.have.find((p) => p.age === 36);
  const needAge36 = r.balanceByAge.need.find((p) => p.age === 36);
  ok("Need: balance-by-age 'have' at age 36 = $48,338 (exact)", approx(haveAge36.balance, 48_338, 1), `got ${haveAge36.balance.toFixed(2)}`);
  // The 'need' ($1.88M target) accumulation path uses yearlySavingsAmount
  // as its fixed yearly contribution, which itself cascades from
  // amountNeeded's ~0.5% residual — so this inherits a smaller version of
  // that same cascading imprecision (1 year of compounding, not 32).
  ok("Need: balance-by-age 'need' at age 36 ≈ $72,039 (within 1%, cascades from amountNeeded)", approxPct(needAge36.balance, 72_039, 0.01), `got ${needAge36.balance.toFixed(2)}`);
  const needAge66 = r.balanceByAge.need.find((p) => p.age === 66);
  ok("Need: balance-by-age 'need' at age 66 (peak, = amount needed)", approxPct(needAge66.balance, r.amountNeeded, 0.001));
  const needAge84 = r.balanceByAge.need.find((p) => p.age === 84);
  ok("Need: balance-by-age 'need' depletes to ~$0 by age 84", needAge84.balance < r.amountNeeded * 0.02, `got ${needAge84.balance.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1 edge case: other income after retirement fully covers the
// target income, so amountNeeded is $0 — reference site's own scenario
// (age 20, retire 40, life 70, income $3,000, income increase 2%, income
// needed 2% of current, return 4%, inflation 3%, other income $2,000/mo,
// savings $3,000, future savings 40% of income). The reference's message:
// "You don't need to save for your retirement!" with a current-plan
// balance of $48,884 that can still sustain $157/mo ($87/mo today's
// money) until life expectancy. This was a real bug, not just a data-
// entry mismatch: the "have" scenario's income used to be derived by
// scaling the "need" scenario's income by amountWillHave/amountNeeded,
// which silently collapsed to $0 whenever amountNeeded was $0 — even
// though a real, positive "have" balance can sustain real withdrawals.
// Fixed by solving each scenario's income directly from its OWN balance
// via growingAnnuityPayment() (the exact algebraic inverse of
// growingAnnuityPV(), so identical to the old ratio-scaled result
// whenever amountNeeded > 0, but well-defined at amountNeeded = 0 too).
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateRetirementNeed({
    currentAge: 20, retireAge: 40, lifeExpectancy: 70,
    currentIncome: 3_000, incomeIncreasePercent: 2,
    retIncomeLevel: 2, retIncomeUnit: "percent",
    avgReturnPercent: 4, inflationPercent: 3,
    otherIncomeMonthly: 2_000, currentSavings: 3_000,
    futureSavings: 40, futureSavingsUnit: "percent",
  });
  ok("Need (edge case): amount needed = $0 (other income covers target)", r.amountNeeded === 0, `got ${r.amountNeeded}`);
  ok("Need (edge case): amount will have ≈ $48,884 (exact, matches reference)", approx(r.amountWillHave, 48_884, 1), `got ${r.amountWillHave.toFixed(2)}`);
  ok("Need (edge case): 'have' scenario FROM SAVINGS ≈ $157/mo (exact, was $0 before fix)", approx(r.incomeNow.fromSavings.actual, 156.87, 0.5), `got ${r.incomeNow.fromSavings.actual.toFixed(2)}`);
  ok("Need (edge case): 'have' scenario FROM SAVINGS today's money ≈ $87/mo (exact, was $0 before fix)", approx(r.incomeNow.fromSavings.todays, 86.85, 0.5), `got ${r.incomeNow.fromSavings.todays.toFixed(2)}`);
  ok("Need (edge case): 'have' TOTAL income = fromSavings + otherIncome ($2,000/mo)", approx(r.incomeNow.actual, 156.87 + 2000, 0.5), `got ${r.incomeNow.actual.toFixed(2)}`);
  ok("Need (edge case): 'need' scenario FROM SAVINGS = $0 (no target to fund)", r.incomeTarget.fromSavings.actual === 0, `got ${r.incomeTarget.fromSavings.actual}`);
  ok("Need (edge case): 'need' TOTAL income = otherIncome only ($2,000/mo, no savings target)", approx(r.incomeTarget.actual, 2000, 0.01), `got ${r.incomeTarget.actual.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1 edge case 2: "have" plan already exceeds "need" (but need
// isn't $0) — reference scenario: age 40, retire 50, life 90, income
// $50,000, income increase 2%, income needed 4% of current, return 3%,
// inflation 2%, other income $2/mo, savings $40,000, future savings 40%
// of income. Reference: amountNeeded ≈ $79,625, amountWillHave ≈
// $304,000 (haveRatio ≈ 381%), with "Income" broken into "from savings"
// + "other income" sub-rows for BOTH scenarios — e.g. have: $769/mo total
// = $767/mo from savings + $2/mo other income. This caught a real bug:
// "Income" previously silently DROPPED the other-income contribution
// entirely from the displayed total (otherIncome was only ever used to
// reduce the savings-derived target, never added back for display) —
// invisible with the reference's own $0-other-income default scenario,
// but wrong here. Fixed via retirementIncomeBreakdown() splitting each
// scenario's income into fromSavings (derived, inflation-sensitive) +
// otherIncome (the user's flat input, identical in both Actual Amount and
// Today's Money columns since it isn't derived/inflated by this
// calculator).
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateRetirementNeed({
    currentAge: 40, retireAge: 50, lifeExpectancy: 90,
    currentIncome: 50_000, incomeIncreasePercent: 2,
    retIncomeLevel: 4, retIncomeUnit: "percent",
    avgReturnPercent: 3, inflationPercent: 2,
    otherIncomeMonthly: 2, currentSavings: 40_000,
    futureSavings: 40, futureSavingsUnit: "percent",
  });
  ok("Need (exceeds case): amount needed ≈ $79,625 (within 1%, documented residual)", approxPct(r.amountNeeded, 79_625, 0.01), `got ${r.amountNeeded.toFixed(2)}`);
  ok("Need (exceeds case): amount will have ≈ $304,000 (within 0.5%)", approxPct(r.amountWillHave, 304_000, 0.005), `got ${r.amountWillHave.toFixed(2)}`);
  ok("Need (exceeds case): have ratio ≈ 381% (within 1%, matches reference's '381%')", approxPct(r.haveRatio * 100, 381, 0.01), `got ${(r.haveRatio * 100).toFixed(2)}%`);
  ok("Need (exceeds case): 'have' from savings ≈ $767/mo actual (within 1%)", approxPct(r.incomeNow.fromSavings.actual, 767, 0.01), `got ${r.incomeNow.fromSavings.actual.toFixed(2)}`);
  ok("Need (exceeds case): 'have' other income = $2/mo actual (flat, exact)", approx(r.incomeNow.otherIncome.actual, 2, 0.001), `got ${r.incomeNow.otherIncome.actual.toFixed(2)}`);
  // Other income's TODAY'S MONEY is deflated by inflation over
  // yearsToRetirement (Round 10 fix) — this scenario's deflated value
  // (2/1.02^10 ≈ 1.64) happens to round to the same displayed "$2" as
  // the earlier (incorrect) flat assumption, which is exactly why that
  // bug went unnoticed until a scenario with a longer timeframe/higher
  // inflation made the rounding no longer coincide.
  ok("Need (exceeds case): 'have' other income TODAY'S money ≈ $1.64/mo (deflated by inflation, not flat)", approx(r.incomeNow.otherIncome.todays, 1.64, 0.01), `got ${r.incomeNow.otherIncome.todays.toFixed(2)}`);
  ok("Need (exceeds case): 'have' TOTAL income = fromSavings + other ≈ $769/mo (within 1%)", approxPct(r.incomeNow.actual, 769, 0.01), `got ${r.incomeNow.actual.toFixed(2)}`);
  ok("Need (exceeds case): 'need' from savings ≈ $201/mo actual (within 1%)", approxPct(r.incomeTarget.fromSavings.actual, 201, 0.01), `got ${r.incomeTarget.fromSavings.actual.toFixed(2)}`);
  ok("Need (exceeds case): 'need' TOTAL income = fromSavings + other ≈ $203/mo (within 1%)", approxPct(r.incomeTarget.actual, 203, 0.01), `got ${r.incomeTarget.actual.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1 edge case 3: entered retirement age is BELOW current age
// (age 50, "planned retirement age" typo'd/tested as 7, life 80, income
// $50,000, income increase 2%, income needed 5% of current, return 3%,
// inflation 6%, other income $6,000/mo, savings $600,000, future savings
// 6% of income). The reference clamps the effective retirement age to
// the current age (50, not the nonsensical 7) AND switches to a present-
// tense "You are in retirement" narrative instead of talking about a
// future retirement date. This was a real bug: the ENGINE already
// clamped `ageR = max(age0, retireAge)` correctly internally (so the
// dollar figures were already close), but the UI TEXT displayed the raw,
// unclamped form input ("...when you retire at the age of 7") instead of
// the effective age the calculation actually used — confusing and wrong-
// looking even though the underlying math was using age 50. Fixed by
// exposing `effectiveRetireAge` (the clamped age) and `alreadyRetired`
// (yearsToRetirement === 0) on the result, and using effectiveRetireAge
// for EVERY age shown in result text, plus a dedicated "You are in
// retirement" copy branch for alreadyRetired + amountNeeded <= 0.
//
// Note: the specific dollar withdrawal figure here carries a LARGER
// version of the already-documented growingAnnuityPV/Payment residual
// (~3.5% here vs. the usual ~0.1%-0.5%) — this scenario's inflation rate
// (6%) exceeds its investment return (3%), an atypical combination where
// the same undocumented reference convention apparently diverges further
// from our best-fit formula. Tested several alternative conventions
// (real-rate flat payment, annual-granularity, due timing, adjusted
// duration) — none matched exactly or cleanly, consistent with this
// being the same open residual rather than a distinct new bug. Asserted
// here with a looser tolerance and documented rather than chased further.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateRetirementNeed({
    currentAge: 50, retireAge: 7, lifeExpectancy: 80,
    currentIncome: 50_000, incomeIncreasePercent: 2,
    retIncomeLevel: 5, retIncomeUnit: "percent",
    avgReturnPercent: 3, inflationPercent: 6,
    otherIncomeMonthly: 6_000, currentSavings: 600_000,
    futureSavings: 6, futureSavingsUnit: "percent",
  });
  ok("Need (already retired): effective retire age clamps to current age (50, not 7)", r.effectiveRetireAge === 50, `got ${r.effectiveRetireAge}`);
  ok("Need (already retired): alreadyRetired flag is true", r.alreadyRetired === true);
  ok("Need (already retired): amount will have = $600,000 exactly (no accumulation years)", approx(r.amountWillHave, 600_000, 0.01), `got ${r.amountWillHave.toFixed(2)}`);
  ok("Need (already retired): amount needed = $0 (other income covers target)", r.amountNeeded === 0, `got ${r.amountNeeded}`);
  ok("Need (already retired): 'have' from savings ≈ $1,018-1,055/mo (within 4%, amplified documented residual)", approxPct(r.incomeNow.fromSavings.actual, 1_018, 0.04), `got ${r.incomeNow.fromSavings.actual.toFixed(2)}`);
  ok("Need (already retired): balance-by-age chart starts at current age (50), not the raw invalid input (7)", r.balanceByAge.have[0].age === 50, `got ${r.balanceByAge.have[0]?.age}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1 edge case 4: already retired (entered age <= current age)
// AND underfunded (amountNeeded > 0) — a third narrative combo distinct
// from both the not-yet-retired "You will need..." case and the fully-
// funded "You are in retirement" case (edge case 3 above). Reference
// scenario: age 60, retire 45 (clamps to 60), life 85, income $5,000,
// income increase 2%, income needed 20% of current, return 0%, inflation
// 3%, other income $8/mo, savings $9, future savings 2% of income.
// Reference: "You are in retirement already. You need about $33,920 of
// savings now to retrieve $75 per month until 85. At your current
// balance of $9, you can retrieve $0 per month until 85." This was
// caught as a REPORTED bug that turned out to be TWO things at once: (1)
// a data-entry mismatch on "Income needed after retirement" (2% typed
// vs. the reference's actual 20%) that made the numbers look wildly
// wrong — verified by re-running with the correct 20% input, which
// reproduced the reference almost exactly; AND (2) a real, still-missing
// UI gap once the correct input was used: this "already retired but
// underfunded" combination had no dedicated narrative branch and fell
// through to the normal "You will need... at age 60 to retire... you
// will have..." copy, which reads oddly (future tense) for someone
// already retired. Added the dedicated branch to match.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateRetirementNeed({
    currentAge: 60, retireAge: 45, lifeExpectancy: 85,
    currentIncome: 5_000, incomeIncreasePercent: 2,
    retIncomeLevel: 20, retIncomeUnit: "percent",
    avgReturnPercent: 0, inflationPercent: 3,
    otherIncomeMonthly: 8, currentSavings: 9,
    futureSavings: 2, futureSavingsUnit: "percent",
  });
  ok("Need (already retired, underfunded): effective retire age clamps to 60", r.effectiveRetireAge === 60, `got ${r.effectiveRetireAge}`);
  ok("Need (already retired, underfunded): alreadyRetired flag is true", r.alreadyRetired === true);
  ok("Need (already retired, underfunded): amount needed ≈ $33,920 (within 2%, documented residual)", approxPct(r.amountNeeded, 33_920, 0.02), `got ${r.amountNeeded.toFixed(2)}`);
  ok("Need (already retired, underfunded): amount will have = $9 (current savings, no accumulation years)", approx(r.amountWillHave, 9, 0.01), `got ${r.amountWillHave.toFixed(2)}`);
  ok("Need (already retired, underfunded): 'need' from savings ≈ $75/mo (within 1%)", approxPct(r.incomeTarget.fromSavings.actual, 75, 0.01), `got ${r.incomeTarget.fromSavings.actual.toFixed(2)}`);
  ok("Need (already retired, underfunded): 'have' from savings ≈ $0/mo (negligible $9 balance)", approx(r.incomeNow.fromSavings.actual, 0, 0.5), `got ${r.incomeNow.fromSavings.actual.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 1 edge case 5: a REAL formula bug (not a residual, not a
// data-entry mismatch) — income increase (3%) and inflation (7%)
// genuinely differ. Reference scenario: age 53, retire 69, life 80,
// income $50,000, income increase 3%, income needed 2% of current,
// return 2%, inflation 7%, other income $40/mo, savings $500, future
// savings 0% of income. Reference: amountNeeded = $36,615. Our engine
// previously projected the retirement-income TARGET to retirement age
// using `incomeGrowth` (income increase, 3%) — giving $16,224, a 125%
// error, not the usual small residual. Root cause: EVERY previously-
// verified scenario happened to have income-increase == inflation (or
// yearsToRetirement == 0), which made this indistinguishable from the
// correct behavior — this was the first scenario tested all session
// with genuinely different rates. Confirmed via the reference's own
// dollar-mode branch (`retIncomeLevel * inflation-grown target`, which
// already used inflation correctly, unlike the percent-mode branch) and
// by driving the live reference's "Show details" schedule: forward-
// simulating the depletion phase with the INFLATION-based target
// matched the reference's own age-69 checkpoint far more closely than
// the income-increase-based target did. Fixed by projecting
// `incomeAtRetirement` via `inflation`, not `incomeGrowth`, in BOTH the
// percent-of-income and dollar-amount target modes (now consistent).
// `incomeGrowth` is still used, correctly, for the ACCUMULATION/
// contribution simulation, which is a separate, independently-verified
// computation this fix doesn't touch.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateRetirementNeed({
    currentAge: 53, retireAge: 69, lifeExpectancy: 80,
    currentIncome: 50_000, incomeIncreasePercent: 3,
    retIncomeLevel: 2, retIncomeUnit: "percent",
    avgReturnPercent: 2, inflationPercent: 7,
    otherIncomeMonthly: 40, currentSavings: 500,
    futureSavings: 0, futureSavingsUnit: "percent",
  });
  ok("Need (differing rates): amount needed ≈ $36,615 (within 3%, real bug fixed — was $16,224, 125% off)", approxPct(r.amountNeeded, 36_615, 0.03), `got ${r.amountNeeded.toFixed(2)}`);
  ok("Need (differing rates): amount will have ≈ $686 (exact, futureSavings=0% explicit)", approx(r.amountWillHave, 686, 1), `got ${r.amountWillHave.toFixed(2)}`);
  // Other income's today's-money deflation (Round 10 fix, second bug
  // found in this same scenario): $40/mo actual, deflated by 7%
  // inflation over 16 years → $40/1.07^16 ≈ $13.55/mo, matching the
  // reference's displayed "$14/month" (rounded) — NOT the previous
  // (incorrect) flat "$40/month".
  ok("Need (differing rates): 'have' other income today's money ≈ $13.55/mo (deflated, matches reference's $14)", approx(r.incomeNow.otherIncome.todays, 13.55, 0.05), `got ${r.incomeNow.otherIncome.todays.toFixed(2)}`);
  ok("Need (differing rates): 'have' Income total today's money ≈ $15/mo ($1 from savings + $14 other, matches reference)", approxPct(r.incomeNow.todays, 15, 0.05), `got ${r.incomeNow.todays.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// validateRetirementAges() — reported bug: entering a life expectancy
// LESS than the planned retirement age (age 30, retire 40, life
// expectancy 39) produced no error at all — the engine's internal
// `ageL = max(ageR, lifeExpectancy)` clamp silently "corrected" it into
// a degenerate zero-length retirement instead of rejecting it, while the
// reference blocks calculation entirely: "Life expectancy needs to be
// larger than planned retirement age." Added this validator (called by
// the UI BEFORE invoking calculateRetirementNeed()/calculateWithdrawal(),
// which both share the same internal clamp) so invalid age chronologies
// are rejected with the same message instead of silently producing a
// nonsensical result.
// ─────────────────────────────────────────────────────────────────

{
  ok(
    "validateRetirementAges: life expectancy < retirement age → reference's exact error message",
    validateRetirementAges({ currentAge: 30, retireAge: 40, lifeExpectancy: 39 })
      === "Life expectancy needs to be larger than planned retirement age.",
  );
  ok(
    "validateRetirementAges: life expectancy === retirement age → also invalid (zero-length retirement)",
    validateRetirementAges({ currentAge: 30, retireAge: 40, lifeExpectancy: 40 }) !== null,
  );
  ok(
    "validateRetirementAges: normal valid chronology → null (no error)",
    validateRetirementAges({ currentAge: 35, retireAge: 67, lifeExpectancy: 85 }) === null,
  );
  // Already-retired case (retireAge <= currentAge, clamped to currentAge
  // internally): life expectancy must exceed the EFFECTIVE retirement
  // age (currentAge here), not the raw (irrelevant) retireAge input.
  ok(
    "validateRetirementAges: already retired + life expectancy <= current age → error referencing current age",
    validateRetirementAges({ currentAge: 60, retireAge: 45, lifeExpectancy: 60 })
      === "Life expectancy needs to be larger than your current age.",
  );
  ok(
    "validateRetirementAges: already retired + life expectancy > current age → valid",
    validateRetirementAges({ currentAge: 60, retireAge: 45, lifeExpectancy: 85 }) === null,
  );
}

// ─────────────────────────────────────────────────────────────────
// Calculator 2: "How can you save for retirement?" — age 35, retire 67,
// amount needed $1,884,793, savings $30,000, return 6%
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateSavingsPlan({ currentAge: 35, retireAge: 67, amountNeeded: 1_884_793, currentSavings: 30_000, avgReturnPercent: 6 });
  ok("Savings plan: yearly amount = $18,607.06 (exact)", approx(r.yearly.amount, 18_607.06, 0.1), `got ${r.yearly.amount.toFixed(2)}`);
  ok("Savings plan: yearly total principal = $625,426 (exact)", approx(r.yearly.totalPrincipal, 625_426, 1), `got ${r.yearly.totalPrincipal.toFixed(2)}`);
  ok("Savings plan: yearly total interest = $1,259,367 (exact)", approx(r.yearly.totalInterest, 1_259_367, 1), `got ${r.yearly.totalInterest.toFixed(2)}`);
  ok("Savings plan: lump-sum additional needed now = $262,062.62 (exact)", approx(r.lump.additionalNow, 262_062.62, 0.5), `got ${r.lump.additionalNow.toFixed(2)}`);
  ok("Savings plan: lump total principal = $292,063 (exact)", approx(r.lump.totalPrincipal, 292_063, 1), `got ${r.lump.totalPrincipal.toFixed(2)}`);
  ok("Savings plan: lump total interest = $1,592,730 (exact)", approx(r.lump.totalInterest, 1_592_730, 1), `got ${r.lump.totalInterest.toFixed(2)}`);
  // Monthly amount has the documented small residual (mid-period adjustment)
  ok("Savings plan: monthly amount ≈ $1,505.51 (within 0.1%, documented residual)", approxPct(r.monthly.amount, 1_505.51, 0.001), `got ${r.monthly.amount.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 3: "How much can you withdraw after retirement?" — age 35,
// retire 67, life expectancy 85, savings $30,000, $0 annual, $1,510/mo,
// return 6%, inflation 3%
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateWithdrawal({
    currentAge: 35, retireAge: 67, lifeExpectancy: 85, currentSavings: 30_000,
    annualContribution: 0, monthlyContribution: 1_510, avgReturnPercent: 6, inflationPercent: 3,
  });
  ok("Withdraw: balance at retirement = $1,885,338 (exact)", approx(r.balanceAtRetirement, 1_885_338, 1), `got ${r.balanceAtRetirement.toFixed(2)}`);
  ok("Withdraw: today's purchasing power = $732,147 (exact)", approx(r.todaysPurchasingPower, 732_147, 1), `got ${r.todaysPurchasingPower.toFixed(2)}`);
  ok("Withdraw: flat monthly = $14,126 (exact)", approx(r.flat.monthly, 14_126, 1), `got ${r.flat.monthly.toFixed(2)}`);
  ok("Withdraw: flat today's money at 67 = $5,486 (exact)", approx(r.flat.todaysAtRetirement, 5_486, 1), `got ${r.flat.todaysAtRetirement.toFixed(2)}`);
  ok("Withdraw: flat today's money at 85 = $3,222 (exact)", approx(r.flat.todaysAtLifeExpectancy, 3_222, 2), `got ${r.flat.todaysAtLifeExpectancy.toFixed(2)}`);
  // Growing (fixed purchasing power) withdrawal has the documented residual
  ok("Withdraw: growing monthly ≈ $11,269 (within 1%, documented residual)", approxPct(r.growing.monthlyAtRetirement, 11_269, 0.01), `got ${r.growing.monthlyAtRetirement.toFixed(2)}`);
  ok("Withdraw: growing today's money ≈ $4,376 (within 1%, documented residual)", approxPct(r.growing.todaysMoney, 4_376, 0.01), `got ${r.growing.todaysMoney.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Calculator 4: "How long can your money last?" — $600,000, $14,126/mo,
// return 6%
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateMoneyLongevity({ amountYouHave: 600_000, monthlyWithdraw: 14_126, avgReturnPercent: 6 });
  ok("Longevity: 47.7 months = 3 years 11.7 months (exact)", approx(r.months, 47.699, 0.01), `got ${r.months}`);
  ok("Longevity: table 1yr = $51,596.04 (exact)", approx(r.withdrawLengthTable[0].monthlyAmount, 51_596.04, 0.1));
  ok("Longevity: table 2yr = $26,549.42 (exact)", approx(r.withdrawLengthTable[1].monthlyAmount, 26_549.42, 0.1));
  ok("Longevity: table 3yr = $18,209.98 (exact)", approx(r.withdrawLengthTable[2].monthlyAmount, 18_209.98, 0.1));
  ok("Longevity: table 4yr = $14,047.34 (exact)", approx(r.withdrawLengthTable[3].monthlyAmount, 14_047.34, 0.1));
  ok("Longevity: table 5yr = $11,555.39 (exact)", approx(r.withdrawLengthTable[4].monthlyAmount, 11_555.39, 0.1));
  ok("Longevity: table 7yr = $8,719.49 (exact)", approx(r.withdrawLengthTable[6].monthlyAmount, 8_719.49, 0.1));
  ok("Longevity: table 8yr = $7,838.51 (exact)", approx(r.withdrawLengthTable[7].monthlyAmount, 7_838.51, 0.1));
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  // 0% return
  const zero = calculateMoneyLongevity({ amountYouHave: 12_000, monthlyWithdraw: 1_000, avgReturnPercent: 0 });
  ok("0% return: 12 months exactly", approx(zero.months, 12, 0.01));

  // Withdrawal doesn't cover interest — never depletes
  const forever = calculateMoneyLongevity({ amountYouHave: 1_000_000, monthlyWithdraw: 100, avgReturnPercent: 6 });
  ok("Payment below monthly interest: months = Infinity", forever.months === Infinity);

  // $0 inputs don't crash
  const zeroNeed = calculateRetirementNeed({ ...NEED_INPUTS, currentIncome: 0, currentSavings: 0 });
  ok("$0 income/savings: finite, no NaN", Number.isFinite(zeroNeed.amountNeeded) && !Number.isNaN(zeroNeed.amountWillHave));

  const zeroWithdraw = calculateWithdrawal({ currentAge: 35, retireAge: 35, lifeExpectancy: 35, currentSavings: 0, annualContribution: 0, monthlyContribution: 0, avgReturnPercent: 6, inflationPercent: 3 });
  ok("Same age (0 years to retirement/in retirement): no crash", Number.isFinite(zeroWithdraw.balanceAtRetirement));

  // Negative/garbage inputs coerce safely
  const negative = calculateSavingsPlan({ currentAge: 50, retireAge: 40, amountNeeded: -1000, currentSavings: -500, avgReturnPercent: -6 });
  ok("Negative inputs: finite, no NaN", Number.isFinite(negative.monthly.amount) && !Number.isNaN(negative.yearly.amount));
}

console.log(`\nRetirement Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
