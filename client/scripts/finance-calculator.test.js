// Plain-Node test suite for the Finance Calculator engine. Run with:
//   node scripts/finance-calculator.test.js
//
// Every scenario below was verified against the LIVE reference site
// (plain GET requests to calculator.net/finance-calculator.html, which
// renders the full schedule server-side — not just screenshots) across
// all 5 tabs, both PMT timings, a mismatched P/Y-vs-C/Y "general
// annuity" case, a fractional user-supplied N, and a 360-row long
// schedule. See finance-calculator-notes.md for the full write-up.

import {
  calculateFV, calculatePMT, calculatePV, calculateN, calculateIY,
} from "../src/utils/financeCalculatorEngine.js";

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

const BASE = { n: 10, iy: 6, pv: 20000, pmt: -2000, fv: -10000, py: 1, cy: 1 };

// ─────────────────────────────────────────────────────────────────
// 1. FV — default scenario, both timings (reference: -9,455.36 end / -7,873.67 beginning)
// ─────────────────────────────────────────────────────────────────

{
  const r1 = calculateFV({ n: 10, iy: 6, pv: 20000, pmt: -2000, py: 1, cy: 1, due: false });
  ok("FV end: -9,455.36", approx(r1.fv, -9455.36), `got ${r1.fv.toFixed(2)}`);
  ok("FV end: sumOfPmt -20,000.00", approx(r1.sumOfPmt, -20000), `got ${r1.sumOfPmt}`);
  ok("FV end: totalInterest 9,455.36", approx(r1.totalInterest, 9455.36), `got ${r1.totalInterest.toFixed(2)}`);

  const r2 = calculateFV({ n: 10, iy: 6, pv: 20000, pmt: -2000, py: 1, cy: 1, due: true });
  ok("FV beginning: -7,873.67", approx(r2.fv, -7873.67), `got ${r2.fv.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 2. PMT (reference: -1,847.81 beginning / -1,958.68 end)
// ─────────────────────────────────────────────────────────────────

{
  const r1 = calculatePMT({ n: 10, iy: 6, pv: 20000, fv: -10000, py: 1, cy: 1, due: true });
  ok("PMT beginning: -1,847.81", approx(r1.pmt, -1847.81, 0.02), `got ${r1.pmt.toFixed(2)}`);
  ok("PMT beginning: sumOfPmt -18,478.11", approx(r1.sumOfPmt, -18478.11, 0.02), `got ${r1.sumOfPmt.toFixed(2)}`);
  ok("PMT beginning: totalInterest 8,478.11", approx(r1.totalInterest, 8478.11, 0.02), `got ${r1.totalInterest.toFixed(2)}`);

  const r2 = calculatePMT({ n: 10, iy: 6, pv: 20000, fv: -10000, py: 1, cy: 1, due: false });
  ok("PMT end: -1,958.68", approx(r2.pmt, -1958.68, 0.02), `got ${r2.pmt.toFixed(2)}`);
  ok("PMT end: sumOfPmt -19,586.80", approx(r2.sumOfPmt, -19586.80, 0.02), `got ${r2.sumOfPmt.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 3. I/Y — root-finding (reference: 7.111% beginning / 6.251% end)
// ─────────────────────────────────────────────────────────────────

{
  const r1 = calculateIY({ n: 10, pv: 20000, pmt: -2000, fv: -10000, py: 1, cy: 1, due: true });
  ok("I/Y beginning: 7.111%", approx(r1.iy, 7.111, 0.001), `got ${r1.iy.toFixed(3)}`);
  ok("I/Y beginning: sumOfPmt -20,000.00", approx(r1.sumOfPmt, -20000), `got ${r1.sumOfPmt}`);
  ok("I/Y beginning: totalInterest 10,000.00", approx(r1.totalInterest, 10000), `got ${r1.totalInterest.toFixed(2)}`);

  const r2 = calculateIY({ n: 10, pv: 20000, pmt: -2000, fv: -10000, py: 1, cy: 1, due: false });
  ok("I/Y end: 6.251%", approx(r2.iy, 6.251, 0.001), `got ${r2.iy.toFixed(3)}`);
}

// ─────────────────────────────────────────────────────────────────
// 4. N — closed form (reference: 8.617 beginning / 9.604 end)
// ─────────────────────────────────────────────────────────────────

{
  const r1 = calculateN({ iy: 6, pv: 20000, pmt: -2000, fv: -10000, py: 1, cy: 1, due: true });
  ok("N beginning: 8.617", approx(r1.n, 8.617, 0.001), `got ${r1.n.toFixed(3)}`);
  ok("N beginning: sumOfPmt -17,233.61", approx(r1.sumOfPmt, -17233.61, 0.02), `got ${r1.sumOfPmt.toFixed(2)}`);
  ok("N beginning: totalInterest 7,233.61", approx(r1.totalInterest, 7233.61, 0.02), `got ${r1.totalInterest.toFixed(2)}`);

  const r2 = calculateN({ iy: 6, pv: 20000, pmt: -2000, fv: -10000, py: 1, cy: 1, due: false });
  ok("N end: 9.604", approx(r2.n, 9.604, 0.001), `got ${r2.n.toFixed(3)}`);
  ok("N end: sumOfPmt -19,208.04", approx(r2.sumOfPmt, -19208.04, 0.02), `got ${r2.sumOfPmt.toFixed(2)}`);
  ok("N end: totalInterest 9,208.04", approx(r2.totalInterest, 9208.04, 0.02), `got ${r2.totalInterest.toFixed(2)}`);

  // Fractional-N schedule: final row's period label is the raw n itself,
  // PMT scaled by the fractional remainder, interest backed out.
  const finalRow1 = r1.schedule[r1.schedule.length - 1];
  ok("N beginning: schedule has 9 rows (8 whole + 1 fractional)", r1.schedule.length === 9, `got ${r1.schedule.length}`);
  ok("N beginning: final row period = 8.617...", approx(finalRow1.period, 8.617, 0.001), `got ${finalRow1.period}`);
  ok("N beginning: final row pmt = -1,233.61", approx(finalRow1.pmt, -1233.61, 0.02), `got ${finalRow1.pmt.toFixed(2)}`);
  ok("N beginning: final row interest = 339.28", approx(finalRow1.interest, 339.28, 0.02), `got ${finalRow1.interest.toFixed(2)}`);
  ok("N beginning: final row fv = -10,000.00 (snapped)", approx(finalRow1.fv, -10000, 1e-6), `got ${finalRow1.fv}`);

  const finalRow2 = r2.schedule[r2.schedule.length - 1];
  ok("N end: schedule has 10 rows (9 whole + 1 fractional)", r2.schedule.length === 10, `got ${r2.schedule.length}`);
  ok("N end: final row period = 9.604...", approx(finalRow2.period, 9.604, 0.001), `got ${finalRow2.period}`);
  ok("N end: final row pmt = -1,208.04", approx(finalRow2.pmt, -1208.04, 0.02), `got ${finalRow2.pmt.toFixed(2)}`);
  ok("N end: final row interest = 401.09", approx(finalRow2.interest, 401.09, 0.02), `got ${finalRow2.interest.toFixed(2)}`);
  ok("N end: final row fv = -10,000.00 (snapped)", approx(finalRow2.fv, -10000, 1e-6), `got ${finalRow2.fv}`);
}

// ─────────────────────────────────────────────────────────────────
// 5. PV (reference: 21,187.33 beginning / 20,304.12 end)
// ─────────────────────────────────────────────────────────────────

{
  const r1 = calculatePV({ n: 10, iy: 6, pmt: -2000, fv: -10000, py: 1, cy: 1, due: true });
  ok("PV beginning: 21,187.33", approx(r1.pv, 21187.33, 0.02), `got ${r1.pv.toFixed(2)}`);

  const r2 = calculatePV({ n: 10, iy: 6, pmt: -2000, fv: -10000, py: 1, cy: 1, due: false });
  ok("PV end: 20,304.12", approx(r2.pv, 20304.12, 0.02), `got ${r2.pv.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 6. Schedule table — whole-period rows (default FV scenario, end timing)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFV({ ...BASE, due: false });
  const expected = [
    [1, 20000.00, 1200.00, -19200.00],
    [2, 19200.00, 1152.00, -18352.00],
    [5, 16500.31, 990.02, -15490.33],
    [10, 10806.95, 648.42, -9455.36],
  ];
  for (const [period, pvExp, interestExp, fvExp] of expected) {
    const row = r.schedule[period - 1];
    ok(`Schedule row ${period}: pv`, approx(row.pv, pvExp, 0.02), `got ${row.pv.toFixed(2)}`);
    ok(`Schedule row ${period}: interest`, approx(row.interest, interestExp, 0.02), `got ${row.interest.toFixed(2)}`);
    ok(`Schedule row ${period}: fv`, approx(row.fv, fvExp, 0.02), `got ${row.fv.toFixed(2)}`);
  }
}

// Beginning-timing schedule (reference: row1 PV 20,000 / Interest 1,080 / FV -19,080)
{
  const r = calculateFV({ ...BASE, due: true });
  const row1 = r.schedule[0];
  ok("Schedule (beginning) row1: interest 1,080.00", approx(row1.interest, 1080), `got ${row1.interest.toFixed(2)}`);
  ok("Schedule (beginning) row1: fv -19,080.00", approx(row1.fv, -19080), `got ${row1.fv.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 7. General annuity (P/Y=12, C/Y=1) — reference: FV -18,950.73, Total Interest 950.73
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFV({ n: 10, iy: 6, pv: 20000, pmt: -200, py: 12, cy: 1, due: false });
  ok("General annuity FV: -18,950.73", approx(r.fv, -18950.73), `got ${r.fv.toFixed(2)}`);
  ok("General annuity totalInterest: 950.73", approx(r.totalInterest, 950.73), `got ${r.totalInterest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 8. Fractional user-supplied N directly on the FV tab (reference: -8,749.46)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFV({ n: 10.5, iy: 6, pv: 20000, pmt: -2000, py: 1, cy: 1, due: false });
  ok("Fractional N=10.5 FV: -8,749.46", approx(r.fv, -8749.46), `got ${r.fv.toFixed(2)}`);
  const finalRow = r.schedule[r.schedule.length - 1];
  ok("Fractional N=10.5: final row pmt -1,000.00", approx(finalRow.pmt, -1000), `got ${finalRow.pmt.toFixed(2)}`);
  ok("Fractional N=10.5: final row interest 294.10", approx(finalRow.interest, 294.10, 0.01), `got ${finalRow.interest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 9. Long schedule with a PV/FV sign crossover (P/Y=12, C/Y=12, N=360,
//    reference: FV 80,451.50, and row 360 PV -79,852.24 / interest
//    -399.26 / FV 80,451.50 — the running balance genuinely crosses
//    from positive to negative partway through)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFV({ n: 360, iy: 6, pv: 20000, pmt: -200, py: 12, cy: 12, due: false });
  ok("Long schedule FV: 80,451.50", approx(r.fv, 80451.50, 0.02), `got ${r.fv.toFixed(2)}`);
  const last = r.schedule[r.schedule.length - 1];
  ok("Long schedule row360 pv: -79,852.24", approx(last.pv, -79852.24, 0.02), `got ${last.pv.toFixed(2)}`);
  ok("Long schedule row360 interest: -399.26", approx(last.interest, -399.26, 0.02), `got ${last.interest.toFixed(2)}`);
  ok("Long schedule row360 fv: 80,451.50", approx(last.fv, 80451.50, 0.02), `got ${last.fv.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 10. I/Y "no solution" detection + multi-line APR/APY/I-per-period
//    breakdown (reference: N=244, PV=230, PMT=2440, FV=-9000, P/Y=5,
//    C/Y=3 — beginning has a real root [-98.868% APR / -69.864% APY /
//    -21.329% per period, all confirmed live]; end has NONE at all
//    [reference itself shows "Sorry, this calculator can not find the
//    interest rate based on the inputs." for these exact inputs])
// ─────────────────────────────────────────────────────────────────

{
  const args = { n: 244, pv: 230, pmt: 2440, fv: -9000, py: 5, cy: 3 };
  const r1 = calculateIY({ ...args, due: true });
  ok("I/Y (P/Y=5,C/Y=3) beginning: APR -98.868%", approx(r1.iy, -98.868, 0.01), `got ${r1.iy.toFixed(3)}`);
  ok("I/Y (P/Y=5,C/Y=3) beginning: APY -69.864%", approx(r1.ear, -69.864, 0.02), `got ${r1.ear.toFixed(3)}`);
  ok("I/Y (P/Y=5,C/Y=3) beginning: I/period -21.329%", approx(r1.periodicRatePct, -21.329, 0.01), `got ${r1.periodicRatePct.toFixed(3)}`);
  ok("I/Y (P/Y=5,C/Y=3) beginning: not noSolution", !r1.noSolution);

  // The reference itself shows "no solution" here — but its failure is
  // a proven large-N numerical limitation (see the widened-bound
  // comment in financeCalculatorEngine.js), not a real absence of a
  // root, so this engine now returns the actual answer instead of
  // reproducing that specific competitor bug.
  const r2 = calculateIY({ ...args, due: false });
  ok("I/Y (P/Y=5,C/Y=3) end: real root exists at ~-122.898% (reference fails here due to a proven large-N convergence bug, not a real absence of a solution)", approx(r2.iy, -122.898, 0.01), `got ${r2.iy}`);
  ok("I/Y (P/Y=5,C/Y=3) end: not noSolution", !r2.noSolution);
}

// ─────────────────────────────────────────────────────────────────
// 11. A SECOND reported scenario confirms the widened I/Y bound: a real
//    root at -209.103% (further than -100% but still within -100*C/Y),
//    which the reference DOES find and display (N=24, PV=2400,
//    PMT=2400, FV=-2292, P/Y=5, C/Y=3, beginning) — proves the fix
//    isn't just tolerating a wider "no solution" case, it recovers a
//    root the reference itself successfully finds.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateIY({ n: 24, pv: 2400, pmt: 2400, fv: -2292, py: 5, cy: 3, due: true });
  ok("I/Y (N=24) beginning: APR -209.103%", approx(r.iy, -209.103, 0.01), `got ${r.iy.toFixed(3)}`);
  ok("I/Y (N=24) beginning: APY -97.218%", approx(r.ear, -97.218, 0.02), `got ${r.ear.toFixed(3)}`);
  ok("I/Y (N=24) beginning: I/period -51.151%", approx(r.periodicRatePct, -51.151, 0.01), `got ${r.periodicRatePct.toFixed(3)}`);
  ok("I/Y (N=24) beginning: sumOfPmt 57,600.00", approx(r.sumOfPmt, 57600), `got ${r.sumOfPmt}`);
  ok("I/Y (N=24) beginning: totalInterest -57,708.00", approx(r.totalInterest, -57708), `got ${r.totalInterest}`);

  // Same inputs, end timing — the reference shows "no solution" here
  // too, and unlike the case above, hand-scanning the equation across
  // the ENTIRE valid domain (nominal > -300%) confirms there is
  // genuinely no real root anywhere — a true "no solution", correctly
  // reproduced.
  const rEnd = calculateIY({ n: 24, pv: 2400, pmt: 2400, fv: -2292, py: 5, cy: 3, due: false });
  ok("I/Y (N=24) end: genuinely no real root anywhere in the valid domain", rEnd.noSolution === true);
}

console.log(`\nFinance Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
