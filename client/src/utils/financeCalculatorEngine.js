// Finance Calculator engine — matches calculator.net/finance-calculator.html,
// the generic 5-key time-value-of-money (TVM) solver used by financial
// calculators like the BA II Plus / HP 12C: given any FOUR of
// {N, I/Y, PV, PMT, FV}, solve for the fifth. All five tabs share one
// underlying cash-flow-balance equation:
//
//   0 = PV*(1+i)^n + PMT*(1+i*due)*[((1+i)^n - 1)/i] + FV
//
// where `i` is the rate PER PAYMENT PERIOD, `n` is the number of payment
// periods (the "N" field IS the raw period count, not years — confirmed
// live: with P/Y=12 and N=10, "Sum of all periodic payments" comes out to
// exactly PMT*10, i.e. 10 periods, not 10 years), and `due` is 1 when
// payments are made at the beginning of each period, 0 at the end.
//
// Every formula and the schedule-table convention below were verified
// EXACT against the live reference (plain GET requests to
// calculator.net/finance-calculator.html, which renders the full
// schedule server-side) across all 5 tabs, both PMT timings, a
// mismatched P/Y-vs-C/Y ("general annuity") case, a fractional
// user-supplied N, and a 360-row long schedule — see
// finance-calculator-notes.md for the full worked verification.

import { periodicRateFromEAR } from "./loanCalculatorEngine.js";

export const DEFAULTS = {
  n: "10",
  iy: "6",
  pv: "20000",
  pmt: "-2000",
  fv: "-10000",
  py: "1",
  cy: "1",
  pmtAt: "end",
};

// Guards against pathological inputs (e.g. someone typing N = 10,000,000)
// freezing the schedule table / chart — the headline N/I-Y/PV/PMT/FV
// figures are still computed exactly regardless of this cap; only the
// per-period schedule rows are capped, same anti-freeze convention as
// loanCalculatorEngine's MAX_SCHEDULE_ROWS / investmentCalculatorEngine's
// MAX_SCHEDULE_MONTHS.
export const MAX_SCHEDULE_ROWS = 3000;

/** Converts a nominal annual rate (as a fraction, e.g. 0.06) compounded
 * `cy` times/year into an effective ANNUAL rate, then re-expresses that
 * against a period that occurs `py` times/year — the general-annuity
 * "EAR-bridge" method (see loan-calculator-formulas.md), reusing the
 * exact same technique as the Loan Calculator's Amortized Loan mode.
 * Deliberately NOT clamped to non-negative like loanCalculatorEngine's
 * `effectiveAnnualRate` — this calculator legitimately solves for and
 * accepts negative I/Y (a real, meaningful TVM answer), and the I/Y tab's
 * bisection search needs to evaluate this at negative rates too. */
function ratePerPayment(iyPercent, py, cy) {
  const nominal = (Number(iyPercent) || 0) / 100;
  const m = Math.max(1e-9, Number(cy) || 1);
  const p = Math.max(1e-9, Number(py) || 1);
  const ear = Math.pow(1 + nominal / m, m) - 1;
  return periodicRateFromEAR(ear, p);
}

function growthFactor(i, n) {
  return Math.pow(1 + i, n);
}

function annuityFactor(i, n) {
  return i === 0 ? n : (Math.pow(1 + i, n) - 1) / i;
}

/** The core cash-flow-balance equation itself: 0 at the true solution.
 * Used directly by the I/Y bisection search. */
function netEquation({ PV, PMT, FV, i, n, due }) {
  const factor = growthFactor(i, n);
  const annuity = annuityFactor(i, n);
  const pmtTerm = due ? PMT * (1 + i) * annuity : PMT * annuity;
  return PV * factor + pmtTerm + FV;
}

// ─────────────────────────────────────────────────────────────────
// 1. FV — direct forward calculation.
// ─────────────────────────────────────────────────────────────────

export function calculateFV({ n, iy, pv, pmt, py, cy, due }) {
  const i = ratePerPayment(iy, py, cy);
  const factor = growthFactor(i, n);
  const annuity = annuityFactor(i, n);
  const pmtTerm = due ? pmt * (1 + i) * annuity : pmt * annuity;
  const fv = -(pv * factor + pmtTerm);
  return finish({ n, iy, pv, pmt, fv, py, cy, due, solved: "fv" });
}

// ─────────────────────────────────────────────────────────────────
// 2. PMT — closed form: the equation is LINEAR in PMT.
// ─────────────────────────────────────────────────────────────────

export function calculatePMT({ n, iy, pv, fv, py, cy, due }) {
  const i = ratePerPayment(iy, py, cy);
  const factor = growthFactor(i, n);
  const annuity = annuityFactor(i, n);
  const numerator = -(pv * factor + fv);
  const denom = due ? (1 + i) * annuity : annuity;
  const pmt = denom !== 0 ? numerator / denom : 0;
  return finish({ n, iy, pv, pmt, fv, py, cy, due, solved: "pmt" });
}

// ─────────────────────────────────────────────────────────────────
// 3. PV — closed form: the equation is LINEAR in PV.
// ─────────────────────────────────────────────────────────────────

export function calculatePV({ n, iy, pmt, fv, py, cy, due }) {
  const i = ratePerPayment(iy, py, cy);
  const factor = growthFactor(i, n);
  const annuity = annuityFactor(i, n);
  const pmtTerm = due ? pmt * (1 + i) * annuity : pmt * annuity;
  const pv = factor !== 0 ? -(pmtTerm + fv) / factor : 0;
  return finish({ n, iy, pv, pmt, fv, py, cy, due, solved: "pv" });
}

// ─────────────────────────────────────────────────────────────────
// 4. N — closed form when PMT ≠ 0 (derived algebraically from the master
// equation), with the two degenerate cases (i = 0, PMT = 0) handled
// directly rather than falling through to a log of a non-positive number.
// Verified exact against the reference for both PMT timings, a
// fractional-input-N round trip, and the plain lump-sum (PMT = 0) case.
// ─────────────────────────────────────────────────────────────────

export function calculateN({ iy, pv, pmt, fv, py, cy, due }) {
  const i = ratePerPayment(iy, py, cy);
  let n;
  if (i === 0) {
    n = pmt !== 0 ? -(pv + fv) / pmt : NaN;
  } else if (pmt === 0) {
    const ratio = pv !== 0 ? -fv / pv : NaN;
    n = ratio > 0 ? Math.log(ratio) / Math.log(1 + i) : NaN;
  } else {
    const pmtCoeff = due ? (pmt * (1 + i)) / i : pmt / i;
    const denom = pv + pmtCoeff;
    const x = denom !== 0 ? (pmtCoeff - fv) / denom : NaN;
    n = x > 0 ? Math.log(x) / Math.log(1 + i) : NaN;
  }
  return finish({ n, iy, pv, pmt, fv, py, cy, due, solved: "n" });
}

// ─────────────────────────────────────────────────────────────────
// 5. I/Y — root-finding (no closed form). Bisects the nominal ANNUAL
// rate percent so that netEquation(...) = 0, reusing the same simple
// 100-iteration binary-search style already used by
// investmentCalculatorEngine.js. Verified monotonic (increasing) across
// every tested scenario, matching both reference examples (7.111%
// beginning / 6.251% end) exactly.
// ─────────────────────────────────────────────────────────────────

function bisect(fn, target, lo, hi, iterations = 200) {
  let a = lo, b = hi;
  for (let k = 0; k < iterations; k++) {
    const mid = (a + b) / 2;
    if (fn(mid) < target) a = mid; else b = mid;
  }
  return (a + b) / 2;
}

const IY_SEARCH_HI = 100000;

// The lower bound is NOT a fixed percentage — it's tied to C/Y. A
// nominal rate stays mathematically valid (keeps the EAR-bridge's
// `1 + nominal/C_Y` from going negative) all the way down to
// `-100 * C_Y`%, not just -100%; when C/Y > 1, real, legitimate,
// deeply-negative roots live in exactly that stretch. Confirmed live:
// a reported scenario (N=24, PV=2400, PMT=2400, FV=-2292, P/Y=5, C/Y=3,
// beginning) has its real root at -209.103% APR — comfortably past a
// flat -100% floor but still well inside -100*C/Y = -300% — and the
// reference finds and displays it. A flat -99.999999% floor (this
// engine's original bound, copied from investmentCalculatorEngine.js,
// which has no C/Y to bridge through) was cutting that root off
// entirely and misreporting "no solution" for it.
function iySearchLo(cy) {
  const m = Math.max(1, Number(cy) || 1);
  return -100 * m + 1e-6;
}

export function calculateIY({ n, pv, pmt, fv, py, cy, due }) {
  const evaluate = (iyPercent) => {
    const i = ratePerPayment(iyPercent, py, cy);
    return netEquation({ PV: pv, PMT: pmt, FV: fv, i, n, due });
  };
  const lo = iySearchLo(cy);

  // Verify the search domain actually BRACKETS a root before trusting a
  // bisection result — bisect() blindly returns a midpoint after N
  // iterations even when the function never crosses zero anywhere in
  // [lo, hi], which previously surfaced as a nonsense boundary value
  // dressed up as an answer instead of an honest failure. A genuine
  // "no solution" case still exists and is verified live (N=244,
  // P/Y=5, C/Y=3, PV=230, PMT=2440, FV=-9000, end-of-period reproduces
  // the reference's own "Sorry, this calculator can not find the
  // interest rate based on the inputs.") — BUT the same inputs' true
  // root (~-122.9%, confirmed by hand-solving the equation directly)
  // turns out to be a case where the REFERENCE's own solver fails for
  // a reason unrelated to domain: probing it with a deliberately
  // simplified equivalent scenario (same structure, same target root,
  // only N changed) showed it correctly finds a root at N=24 but fails
  // on the IDENTICAL root at N=244 — a numerical/convergence
  // limitation in its own bisection at large N, not an intentional
  // cutoff. This engine's bisection doesn't share that limitation (see
  // finance-calculator-notes.md), so it now returns the real answer for
  // that case instead of reproducing the reference's large-N failure;
  // "no solution" is reserved for inputs with truly no real root
  // anywhere in the valid domain.
  const fLo = evaluate(lo);
  const fHi = evaluate(IY_SEARCH_HI);
  const bracketed = (fLo <= 0 && fHi >= 0) || (fLo >= 0 && fHi <= 0);
  if (!bracketed) {
    return {
      n, iy: null, pv, pmt, fv, sumOfPmt: pmt * n, totalInterest: null,
      schedule: [], solved: "iy", noSolution: true,
    };
  }

  const iy = bisect(evaluate, 0, lo, IY_SEARCH_HI);

  // The reference shows the solved rate in up to 3 equivalent forms
  // whenever P/Y or C/Y isn't 1 (confirmed live across 4 combinations):
  // the nominal rate AS COMPOUNDED at C/Y ("APR", = `iy` itself), the
  // effective annual rate ("APY", = `iy` re-bridged through C/Y then
  // back out via P/Y — algebraically the same EAR already used
  // internally), and the raw per-payment-period rate ("I/period", = the
  // periodic rate actually used in the equation). When C/Y = P/Y = 1
  // all three coincide and the reference shows one plain, unlabeled
  // line instead — the UI decides which lines to show from P/Y and C/Y.
  const m = Math.max(1e-9, Number(cy) || 1);
  const ear = Math.pow(1 + iy / 100 / m, m) - 1;
  const periodicRate = ratePerPayment(iy, py, cy);

  return {
    ...finish({ n, iy, pv, pmt, fv, py, cy, due, solved: "iy" }),
    ear: ear * 100,
    periodicRatePct: periodicRate * 100,
  };
}

// ─────────────────────────────────────────────────────────────────
// Shared result assembly: Sum of all periodic payments, Total Interest,
// and the period-by-period schedule/chart data.
//
// Total Interest is simply `-(PV + SumOfPMT + FV)` — NOT a separate
// compounding calculation. This is just the master equation's own cash-
// balance identity (if there were no interest at all, PV + all the PMTs
// + FV would net to exactly zero), and it was confirmed to reproduce the
// reference's "Total Interest" figure exactly across every one of the 5
// tabs and both timings without any special-casing per tab.
// ─────────────────────────────────────────────────────────────────

function finish({ n, iy, pv, pmt, fv, py, cy, due, solved }) {
  const sumOfPmt = pmt * n;
  const totalInterest = -(pv + sumOfPmt + fv);
  const i = ratePerPayment(iy, py, cy);
  const schedule = buildSchedule({ pv, pmt, fv, i, n, due });
  return { n, iy, pv, pmt, fv, sumOfPmt, totalInterest, schedule, solved };
}

/** Builds the period-by-period PV/PMT/Interest/FV schedule. Per-row
 * convention (verified exact against the live reference's own rendered
 * schedule, including a case where the running balance crosses zero and
 * a fractional final period):
 *
 *   end-of-period:       interest = balance * i;          balanceAfter = balance + interest + PMT
 *   beginning-of-period:  interest = (balance + PMT) * i;  balanceAfter = balance + PMT + interest
 *   row.PV = balance (before);  row.FV = -balanceAfter
 *   next row's PV = balanceAfter (no forced sign — a real crossover from
 *     positive to negative balance is exactly what makes the reference's
 *     own PV/FV columns swap which one reads negative partway through a
 *     long schedule, confirmed against a live 360-row example)
 *
 * A fractional final period (n like 9.604, whether solved as N itself or
 * typed directly into another tab) is NOT a prorated-interest partial
 * row. Its PMT is the full PMT scaled by the fractional remainder, its
 * ending balance is snapped to the EXACT already-computed FV (avoiding
 * any accumulated float drift, the same anti-drift principle used by
 * every other engine in this app), and its interest is backed out as
 * the residual — matching payment-calculator-notes.md's identical
 * "scaled payment, backed-out interest" convention for a different
 * calculator's fractional final period. */
function buildSchedule({ pv, pmt, fv, i, n, due }) {
  if (!(n > 0) || !Number.isFinite(n)) return [];

  const wholePeriods = Math.min(MAX_SCHEDULE_ROWS, Math.floor(n + 1e-9));
  const frac = n - Math.floor(n + 1e-9);
  const hasFrac = frac > 1e-9 && wholePeriods < MAX_SCHEDULE_ROWS;

  const rows = [];
  let balance = pv;

  for (let k = 1; k <= wholePeriods; k++) {
    const isFinalRow = k === wholePeriods && !hasFrac;
    let interest, balanceAfter;
    if (isFinalRow) {
      balanceAfter = -fv;
      interest = balanceAfter - balance - pmt;
    } else if (due) {
      interest = (balance + pmt) * i;
      balanceAfter = balance + pmt + interest;
    } else {
      interest = balance * i;
      balanceAfter = balance + interest + pmt;
    }
    rows.push({ period: k, pv: balance, pmt, interest, fv: -balanceAfter });
    balance = balanceAfter;
  }

  if (hasFrac) {
    const pmtScaled = pmt * frac;
    const balanceAfter = -fv;
    const interest = balanceAfter - balance - pmtScaled;
    rows.push({ period: n, pv: balance, pmt: pmtScaled, interest, fv: -balanceAfter });
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────
// Formatting — the reference shows negatives as "$-2,000.00" (sign
// AFTER the currency symbol), not JS's native "-$2,000.00", so this
// can't reuse the toLocaleString-based formatCurrency every other
// engine in this app defines.
// ─────────────────────────────────────────────────────────────────

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `$${sign}${abs}`;
}

export function formatPercent(value, decimals = 3) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}

export function formatNumber(value, decimals = 3) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
