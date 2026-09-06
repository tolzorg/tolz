// Plain-Node test suite for the Inflation Calculator engine. Run with:
//   node scripts/inflation-calculator.test.js
//
// Every scenario below was verified against the LIVE reference site
// (calculator.net/inflation-calculator.html) via direct GET requests —
// matched exactly, including two non-obvious rules discovered by
// deliberately constructing scenarios designed to disambiguate between
// competing theories (see inflation-calculator-notes.md):
//   1. An "Average" period behaves as month 7 for ELAPSED-TIME math only
//      (not for its actual CPI value, which is the true annual average).
//   2. The "total .../average ... per year" two-sentence form only
//      appears once the elapsed period exceeds 12 months exactly (12
//      months itself still uses the short single-rate form).

import {
  calculateCpiInflation, calculateForwardFlatRate, calculateBackwardFlatRate, getCpi, AVERAGE_MONTH,
  getLatestYear, getLatestMonth, applyLiveCpiWindow, isLiveDataApplied, maxMonthForYear, monthOptions, yearOptions,
} from "../src/utils/inflationCalculatorEngine.js";

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

// ─────────────────────────────────────────────────────────────────
// Raw CPI values — spot-checked against the reference's own displayed
// "The CPI of X is Y" lines.
// ─────────────────────────────────────────────────────────────────

{
  ok("CPI of 2016 (Average) = 240.007 (matches reference exactly)", approx(getCpi(2016, AVERAGE_MONTH), 240.007, 0.001), `got ${getCpi(2016, AVERAGE_MONTH)}`);
  ok("CPI of Jul. 2026 = 333.918", approx(getCpi(2026, 7), 333.918, 0.001));
  ok("CPI of Mar. 2016 = 238.132", approx(getCpi(2016, 3), 238.132, 0.001));
  ok("CPI of Sep. 2023 = 307.789", approx(getCpi(2023, 9), 307.789, 0.001));
  ok("CPI of 2020 (Average) = 258.811", approx(getCpi(2020, AVERAGE_MONTH), 258.811, 0.001));
  ok("CPI of 2024 (Average) = 313.689", approx(getCpi(2024, AVERAGE_MONTH), 313.689, 0.001));
  ok("CPI of Oct. 2025 (interpolated, filling FRED's own published gap) = 324.461", approx(getCpi(2025, 10), 324.461, 0.001));
  ok("Pre-1913 or post-latest-month returns null, not a crash", getCpi(1900, 1) === null && getCpi(2026, 12) === null);
  ok("The still-in-progress latest year has no annual average yet", getCpi(2026, AVERAGE_MONTH) === null);
}

// ─────────────────────────────────────────────────────────────────
// Main CPI calculator — every scenario matched to the reference exactly.
// ─────────────────────────────────────────────────────────────────

{
  // $100 in 2016 (Average) -> Jul. 2026
  const r1 = calculateCpiInflation({ amount: 100, fromYear: 2016, fromMonth: AVERAGE_MONTH, toYear: 2026, toMonth: 7 });
  ok("2016(Avg)->Jul.2026: value = $139.13", approx(r1.value, 139.13, 0.01), `got ${r1.value.toFixed(2)}`);
  ok("2016(Avg)->Jul.2026: total inflation = 39.13%", approx(r1.totalPercent, 39.13, 0.01), `got ${r1.totalPercent.toFixed(2)}`);
  ok("2016(Avg)->Jul.2026: average annual rate = 3.36% (elapsed treated as exactly 10 years)", approx(r1.avgAnnualPercent, 3.36, 0.01), `got ${r1.avgAnnualPercent.toFixed(2)}`);
  ok("2016(Avg)->Jul.2026: shows the annualized form (elapsed > 12mo)", r1.showAnnualized === true);

  // $100 in Mar. 2016 -> Sep. 2023 (both specific months — fractional years)
  const r2 = calculateCpiInflation({ amount: 100, fromYear: 2016, fromMonth: 3, toYear: 2023, toMonth: 9 });
  ok("Mar.2016->Sep.2023: value = $129.25", approx(r2.value, 129.25, 0.01), `got ${r2.value.toFixed(2)}`);
  ok("Mar.2016->Sep.2023: total inflation = 29.25%", approx(r2.totalPercent, 29.25, 0.01));
  ok("Mar.2016->Sep.2023: average annual rate = 3.48% (7.5 elapsed years, fractional)", approx(r2.avgAnnualPercent, 3.48, 0.01), `got ${r2.avgAnnualPercent.toFixed(2)}`);

  // Mixed: "Average" (from) + specific month (to) — the scenario that
  // disambiguated the month-7 proxy rule from a naive whole-year count.
  const r3 = calculateCpiInflation({ amount: 100, fromYear: 2016, fromMonth: AVERAGE_MONTH, toYear: 2023, toMonth: 9 });
  ok("2016(Avg)->Sep.2023: average annual rate = 3.53% (Average acts as month 7, not month 0 or a whole-year count)", approx(r3.avgAnnualPercent, 3.53, 0.01), `got ${r3.avgAnnualPercent.toFixed(2)}`);

  // Mixed the other way: specific month (from) + "Average" (to).
  const r4 = calculateCpiInflation({ amount: 100, fromYear: 2016, fromMonth: 3, toYear: 2020, toMonth: AVERAGE_MONTH });
  ok("Mar.2016->2020(Avg): average annual rate = 1.94%", approx(r4.avgAnnualPercent, 1.94, 0.01), `got ${r4.avgAnnualPercent.toFixed(2)}`);

  // Exactly 12 months elapsed — still the SHORT single-rate form.
  const r5 = calculateCpiInflation({ amount: 100, fromYear: 2025, fromMonth: 7, toYear: 2026, toMonth: 7 });
  ok("Jul.2025->Jul.2026 (exactly 12mo): value = $103.36", approx(r5.value, 103.36, 0.01), `got ${r5.value.toFixed(2)}`);
  ok("Jul.2025->Jul.2026 (exactly 12mo): total = 3.36%", approx(r5.totalPercent, 3.36, 0.01));
  ok("Jul.2025->Jul.2026 (exactly 12mo): NOT annualized (boundary verified live: 12mo stays short-form)", r5.showAnnualized === false);

  // 13 months elapsed — now the two-sentence annualized form appears.
  const r6 = calculateCpiInflation({ amount: 100, fromYear: 2025, fromMonth: 6, toYear: 2026, toMonth: 7 });
  ok("Jun.2025->Jul.2026 (13mo): total = 3.52%", approx(r6.totalPercent, 3.52, 0.01));
  ok("Jun.2025->Jul.2026 (13mo): average annual rate = 3.25%", approx(r6.avgAnnualPercent, 3.25, 0.01), `got ${r6.avgAnnualPercent.toFixed(2)}`);
  ok("Jun.2025->Jul.2026 (13mo): IS annualized (boundary verified live: 13mo switches to long-form)", r6.showAnnualized === true);

  // Short-duration, includes the interpolated Oct 2025 gap month.
  const r7 = calculateCpiInflation({ amount: 100, fromYear: 2025, fromMonth: 10, toYear: 2026, toMonth: 7 });
  ok("Oct.2025->Jul.2026: value = $102.91 (uses the interpolated Oct 2025 CPI)", approx(r7.value, 102.91, 0.01), `got ${r7.value.toFixed(2)}`);

  // Chronologically REVERSED from/to (from = later year, to = earlier
  // year) — the primary value uses the literal from/to as entered, but
  // the total/average-rate sentence always describes earlier->later
  // chronologically, with a positive rate — verified live.
  const r8 = calculateCpiInflation({ amount: 100, fromYear: 2024, fromMonth: AVERAGE_MONTH, toYear: 2016, toMonth: AVERAGE_MONTH });
  ok("2024(Avg)->2016(Avg) [reversed]: value = $76.51 (literal from/to, unswapped)", approx(r8.value, 76.51, 0.01), `got ${r8.value.toFixed(2)}`);
  ok("2024(Avg)->2016(Avg) [reversed]: total inflation = +30.70% (chronological, always positive)", approx(r8.totalPercent, 30.70, 0.01), `got ${r8.totalPercent.toFixed(2)}`);
  ok("2024(Avg)->2016(Avg) [reversed]: average annual rate = 3.40%", approx(r8.avgAnnualPercent, 3.40, 0.01), `got ${r8.avgAnnualPercent.toFixed(2)}`);
  ok("2024(Avg)->2016(Avg) [reversed]: earlierLabel/laterLabel swapped correctly", r8.earlierLabel === "2016 (Average)" && r8.laterLabel === "2024 (Average)");

  // Chart sanity: starts near `amount` at the from-point, ends at the value.
  const r1chart = r1.chart;
  ok("Chart: has multiple monthly points spanning the full range", r1chart.length > 100);
  ok("Chart: first point's value is close to the starting amount", approx(r1chart[0].value, 100, 5));
  ok("Chart: last point's value is close to the final result", approx(r1chart[r1chart.length - 1].value, r1.value, 1));
}

// ─────────────────────────────────────────────────────────────────
// Flat Rate calculators — verified live: $500, 4.5%, 7 years.
// ─────────────────────────────────────────────────────────────────

{
  const fwd = calculateForwardFlatRate({ amount: 500, ratePercent: 4.5, years: 7 });
  ok("Forward flat rate: $500 @ 4.5% for 7yr = $680.43", approx(fwd.value, 680.43, 0.01), `got ${fwd.value.toFixed(2)}`);

  const bwd = calculateBackwardFlatRate({ amount: 500, ratePercent: 4.5, years: 7 });
  ok("Backward flat rate: $500 @ 4.5% 7yr ago = $367.41", approx(bwd.value, 367.41, 0.01), `got ${bwd.value.toFixed(2)}`);

  // Reference's own front-page example: $100 @ 3% for 10 years.
  const fwd2 = calculateForwardFlatRate({ amount: 100, ratePercent: 3, years: 10 });
  ok("Forward flat rate: $100 @ 3% for 10yr = $134.39", approx(fwd2.value, 134.39, 0.01), `got ${fwd2.value.toFixed(2)}`);
  const bwd2 = calculateBackwardFlatRate({ amount: 100, ratePercent: 3, years: 10 });
  ok("Backward flat rate: $100 @ 3% 10yr ago = $74.41", approx(bwd2.value, 74.41, 0.01), `got ${bwd2.value.toFixed(2)}`);

  // Edge cases
  const zero = calculateForwardFlatRate({ amount: 0, ratePercent: 3, years: 10 });
  ok("Forward flat rate: $0 -> $0, no crash", zero.value === 0);
  const zeroYears = calculateForwardFlatRate({ amount: 100, ratePercent: 3, years: 0 });
  ok("Forward flat rate: 0 years -> unchanged amount", approx(zeroYears.value, 100, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// Live update layer (applyLiveCpiWindow / getLatestYear / getLatestMonth)
// — MUST run last: it permanently advances/overrides this process's
// module-level CPI state, which every test above assumes is still the
// unmodified static cpiData.js baseline (2026/July). Uses synthetic
// values, not real BLS data (this suite doesn't hit the network — see
// cpiLiveUpdate.js, which is deliberately not unit-tested the same way
// the Currency Calculator's own live fetch isn't). This layer now does
// TWO things in one mechanism: extend the latest-available month
// forward, AND revise/replace a value within the recent window it
// checks — both exercised below.
// ─────────────────────────────────────────────────────────────────

{
  ok("Before any live update: latest = the static baseline (2026, July)", getLatestYear() === 2026 && getLatestMonth() === 7);
  ok("Before any live update: isLiveDataApplied() = false", isLiveDataApplied() === false);
  ok("2026 (the latest year) caps at its latest month, no Average yet", maxMonthForYear(2026) === 7);
  ok("2025 (a complete past year) allows up through Average", maxMonthForYear(2025) === AVERAGE_MONTH);
  const staticOct2025 = getCpi(2025, 10);
  ok("Static baseline's Oct 2025 is the documented interpolated estimate (324.461)", approx(staticOct2025, 324.461, 0.001));

  // Simulate BLS publishing August 2026 — a genuine EXTENSION.
  const afterAug = applyLiveCpiWindow([{ year: 2026, month: 8, value: 335.0 }]);
  ok("applyLiveCpiWindow reports both changed and extended for a new month", afterAug.changed === true && afterAug.extended === true);
  ok("applyLiveCpiWindow advances the latest pointer", afterAug.year === 2026 && afterAug.month === 8);
  ok("getLatestMonth() reflects the newly-applied month", getLatestMonth() === 8);
  ok("isLiveDataApplied() = true after a real update", isLiveDataApplied() === true);
  ok("getCpi() returns the newly-applied live value", getCpi(2026, 8) === 335.0);
  ok("maxMonthForYear(2026) now caps at the new latest month (8)", maxMonthForYear(2026) === 8);
  ok("yearOptions() still starts at 2026 (no new year yet)", yearOptions()[0].value === 2026);
  ok("monthOptions(2026) now includes August, still no Average", monthOptions(2026).some((o) => o.value === 8) && !monthOptions(2026).some((o) => o.value === AVERAGE_MONTH));

  // Re-applying the SAME window again must report nothing changed —
  // confirms this doesn't spuriously flag "changed" every page load.
  const reapplied = applyLiveCpiWindow([{ year: 2026, month: 8, value: 335.0 }]);
  ok("Re-checking an identical value reports changed=false (not spurious)", reapplied.changed === false);

  // Simulate BLS finally publishing a REAL October 2025 figure, superseding
  // this dataset's own documented synthetic interpolation — a REVISION,
  // not an extension (2025 is well before the current latest, 2026-08).
  const afterRevision = applyLiveCpiWindow([{ year: 2025, month: 10, value: 324.520 }]);
  ok("A revision to an older month reports changed=true but extended=false", afterRevision.changed === true && afterRevision.extended === false);
  ok("The latest pointer is untouched by a revision to an older month", afterRevision.year === 2026 && afterRevision.month === 8);
  ok("getCpi() now returns the REVISED Oct 2025 value, not the old interpolated one", getCpi(2025, 10) === 324.520);

  // A duplicate/no-op re-check of an untouched OLD month (never covered
  // by any live window) must leave the static baseline alone.
  ok("A month never covered by any live window still falls back to the static array", getCpi(2020, 1) !== 999);

  // Simulate rolling into a new year — 2026 is no longer "latest", so it
  // should now permit an Average selection in principle, but since this
  // test never supplied Sep-Dec 2026, that year's average is still
  // correctly unavailable (incomplete data, not a silently wrong answer).
  const afterNewYear = applyLiveCpiWindow([{ year: 2027, month: 1, value: 336.0 }]);
  ok("Rolling into a new year advances latestYear and reports extended=true", afterNewYear.year === 2027 && afterNewYear.month === 1 && afterNewYear.extended === true);
  ok("2026 is no longer 'the latest year', so it now nominally allows Average...", maxMonthForYear(2026) === AVERAGE_MONTH);
  ok("...but 2026's actual average is still null (Sep-Dec 2026 were never supplied — no silent wrong answer)", getCpi(2026, AVERAGE_MONTH) === null);
  ok("yearOptions() now starts at the new latest year (2027)", yearOptions()[0].value === 2027);
  ok("monthOptions(2027) is capped to just January", monthOptions(2027).length === 1 && monthOptions(2027)[0].label === "January");
}

console.log(`\nInflation Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
