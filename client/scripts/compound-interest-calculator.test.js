// Plain-Node test suite for the Compound Interest Calculator engine.
// Run with: node scripts/compound-interest-calculator.test.js
//
// Every scenario below was verified against the LIVE reference
// (plain GET requests to calculator.net/compound-interest-calculator.html,
// which computes server-side and renders the full result sentence,
// footnotes included — no Playwright needed).

import { calculateCompoundInterest, convertCompoundRate } from "../src/utils/compoundInterestCalculatorEngine.js";

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

function approx(a, b, tolerance = 0.00051) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// 1. Core rate conversion — 6 scenarios spanning every frequency,
//    including continuous compounding in both directions
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["monthly", "annually", 6.16778],
    ["annually", "continuously", 5.82689],
    ["continuously", "annually", 6.18365],
    ["daily", "weekly", 6.00297],
    ["biweekly", "semimonthly", 6.00058],
    ["quarterly", "semiannually", 6.04500],
  ];
  for (const [inC, outC, expected] of cases) {
    const rate = convertCompoundRate(6, inC, outC);
    ok(`${inC} -> ${outC}`, approx(rate, expected), `got ${rate.toFixed(5)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// 2. Default reference scenario — full sentence + no footnote
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateCompoundInterest({ ratePercent: 6, inCompound: "monthly", outCompound: "annually" });
  ok("default: outputRate 6.16778", approx(r.outputRate, 6.16778));
  ok("default: sentencePrefix", r.sentencePrefix === "6.00000% compound monthly (APR) is equivalent to ", r.sentencePrefix);
  ok("default: sentenceSuffix (annually gets no period clause)", r.sentenceSuffix === " compound annually (APY).", r.sentenceSuffix);
  ok("default: no footnotes", r.footnotes.length === 0);
}

// ─────────────────────────────────────────────────────────────────
// 3. "or X% interest every Y" clause — present for every output
//    compound EXCEPT annually/continuously, exact period phrasing
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    ["semiannually", "6 months", 2.95630],
    ["quarterly", "3 months", 1.46738],
    ["monthly", "month", 0.48676],
    ["semimonthly", "half a month", 0.24308],
    ["biweekly", "2 weeks", 0.22436],
    ["weekly", "week", 0.11212],
    ["daily", "day", 0.01595],
  ];
  for (const [outC, periodLabel, periodicRate] of cases) {
    const r = calculateCompoundInterest({ ratePercent: 6, inCompound: "annually", outCompound: outC });
    ok(`${outC} period clause text`, r.sentenceSuffix.includes(`every ${periodLabel}`), r.sentenceSuffix);
    ok(`${outC} period clause rate`, r.sentenceSuffix.includes(`${periodicRate.toFixed(5)}%`), r.sentenceSuffix);
  }
  // annually and continuously never get the clause
  const rAnnually = calculateCompoundInterest({ ratePercent: 6, inCompound: "monthly", outCompound: "annually" });
  ok("annually: no period clause", !rAnnually.sentenceSuffix.includes("every"));
  const rContinuously = calculateCompoundInterest({ ratePercent: 6, inCompound: "annually", outCompound: "continuously" });
  ok("continuously: no period clause", !rContinuously.sentenceSuffix.includes("every"));
}

// ─────────────────────────────────────────────────────────────────
// 4. Footnotes — biweekly/weekly/daily only, fixed order, deduplicated
//    when the same compound appears on both sides
// ─────────────────────────────────────────────────────────────────

{
  const rNone = calculateCompoundInterest({ ratePercent: 6, inCompound: "monthly", outCompound: "annually" });
  ok("no footnotes for monthly/annually", rNone.footnotes.length === 0);

  const rOutputOnly = calculateCompoundInterest({ ratePercent: 6, inCompound: "annually", outCompound: "weekly" });
  ok("1 footnote, output=weekly", rOutputOnly.footnotes.length === 1 && rOutputOnly.footnotes[0].includes("weekly"), JSON.stringify(rOutputOnly.footnotes));

  const rBoth = calculateCompoundInterest({ ratePercent: 6, inCompound: "weekly", outCompound: "biweekly" });
  ok("2 footnotes, biweekly before weekly", rBoth.footnotes.length === 2 && rBoth.footnotes[0].includes("biweekly") && rBoth.footnotes[1].includes("weekly") && !rBoth.footnotes[1].includes("biweekly"), JSON.stringify(rBoth.footnotes));

  const rDaily = calculateCompoundInterest({ ratePercent: 6, inCompound: "annually", outCompound: "daily" });
  ok("daily footnote mentions 365.25", rDaily.footnotes[0].includes("365.25"));
}

console.log(`\nCompound Interest Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
