// Investment Calculator engine — matches calculator.net/investment-calculator.html.
//
// Five tabs, each solving for a DIFFERENT variable in the same underlying
// future-value-of-(lump sum + periodic contribution) equation:
//   End Amount            → solve the ending balance (forward calculation)
//   Additional Contribution → solve the periodic contribution (closed form)
//   Return Rate           → solve the annual return rate (root-finding)
//   Starting Amount       → solve the initial lump sum (closed form)
//   Investment Length     → solve the number of years (root-finding)
//
// Every formula was verified against the LIVE reference site (GET
// requests + the page's own embedded chart-tooltip/schedule data, not
// just its rounded summary figures) across all 5 tabs, both "month" and
// "year" contribution frequencies, and both "beginning" and "end" of
// period timing. Two non-obvious findings from that verification:
//
//  1. The Return Rate tab has NO "Compound" selector in the UI, and
//     changing the (hidden, persisted-from-other-tabs) `ccompound` field
//     provably has ZERO effect on its result (tested live) — it always
//     solves as if Compound = "annually" (i.e. the annual rate needs no
//     EAR-bridging at the annual level, only down to monthly if
//     contributions are monthly). The other four tabs DO respect
//     whatever Compound is selected (also tested live: changing it
//     changes their result).
//  2. The reference's own accumulation schedule/bar-chart data reveals
//     the "Starting Amount" segment shown throughout is the ORIGINAL
//     principal, unchanged for every year — it does NOT separately
//     accrue and report its own interest; ALL interest (both the lump
//     sum's own growth and the contributions') is lumped into one
//     combined "Interest" bucket. Confirmed directly from the
//     reference's own bar-chart tooltips (e.g. year 1: Starting $20,000
//     + Contributions $12,000 + Interest $1,526.53 = Total $33,526.53).
//
// See investment-calculator-notes.md for the full worked verification
// (all 5 tabs × both timings, several matched to the exact cent).

import { compoundPeriodsPerYear, periodicRateFromEAR } from "./loanCalculatorEngine.js";

// The shared `effectiveAnnualRate()` (loanCalculatorEngine.js) clamps
// negative rates to 0 — correct for the Loan/Mortgage/Interest
// calculators it was built for, where a negative rate is never a
// meaningful input. It is NOT correct here: this calculator's "Return
// Rate" tab legitimately SOLVES for negative rates whenever the target
// is below what a 0%-return scenario would already produce from the
// starting amount + contributions alone (a real, valid answer — "your
// investment needs to LOSE money to land exactly on that target"). Using
// the clamping version made every negative-rate guess during the binary
// search evaluate to the SAME (0%-rate) result, so the search could never
// bracket the true root and always walked to its lower bound instead of
// converging — confirmed against the reference showing rates like
// "-7.294%" that our clamped version couldn't reproduce at all (it
// returned "-99.000%", the search bound itself, not a real answer). This
// local, unclamped equivalent is used everywhere in this engine instead.
function unclampedEAR(rate, compound) {
  if (compound === "continuously") return Math.exp(rate) - 1;
  const m = compoundPeriodsPerYear(compound) || 1;
  return Math.pow(1 + rate / m, m) - 1;
}

export { COMPOUND_OPTIONS, DEFAULT_COMPOUND } from "./interestCalculatorEngine.js";

// A reported bug (Investment Length tab, target $600,593, 3% daily
// compound, $102/year contribution) needed 171.030/171.990 years —
// bisect()'s search was bounded to [0, MAX_YEARS] and MAX_YEARS was 100,
// so it converged on its own upper bound (100.000) instead of the real
// root, the same "search range too narrow to bracket a legitimate
// answer" failure mode as Round 2's Return Rate bug. Verified live that
// the reference itself does NOT cap years at 100 anywhere — it accepted
// 200- and 1000-year inputs on the End Amount tab too, computing the
// correct (very large) end balance both times with no sign of a cap —
// so 100 was simply too small a ceiling, not a deliberate limit worth
// preserving. Raised generously (matches reference exactly up to 1000
// years, tested); MAX_SCHEDULE_MONTHS raised to match so a long solved
// Investment Length doesn't get its accumulation schedule/chart silently
// truncated (and its last row wrongly snapped to the full-length end
// balance early) even though the headline figures don't go through it.
export const MAX_YEARS = 1000;
const MAX_SCHEDULE_MONTHS = 12000;

/** Future value of a stream of equal periodic contributions — `due` =
 * true for "beginning of period" (annuity-due), false for "end of
 * period" (ordinary annuity). Verified exact against the reference in
 * both modes (see interest-calculator-notes.md, the same formula this
 * calculator's "End Amount" tab reduces to). */
function contributionFV(contribution, periodicRate, n, due) {
  if (n <= 0 || contribution === 0) return 0;
  const ordinary = periodicRate === 0 ? contribution * n : contribution * (Math.pow(1 + periodicRate, n) - 1) / periodicRate;
  return due ? ordinary * (1 + periodicRate) : ordinary;
}

/** The core forward calculation shared by all 5 tabs: given a starting
 * amount, a periodic contribution (monthly or yearly), an annual rate,
 * a compounding frequency, a term in years, and contribution timing,
 * returns the ending balance and its lump-sum/contribution components.
 * `compound` may be omitted (treated as "annually", i.e. no bridging
 * needed at the annual level) — used by the Return Rate tab, which has
 * no Compound selector and is confirmed to behave exactly this way. */
function investmentFV({ P, C, contributionFrequency, annualRatePercent, compound, years, due }) {
  const rate = (Number(annualRatePercent) || 0) / 100;
  const ear = unclampedEAR(rate, compound || "annually");
  const isMonthly = contributionFrequency === "monthly";
  const n = isMonthly ? years * 12 : years;
  const periodicRate = isMonthly ? periodicRateFromEAR(ear, 12) : ear;

  const lumpFV = P * Math.pow(1 + periodicRate, n);
  const contribFV = contributionFV(C, periodicRate, n, due);
  return { endBalance: lumpFV + contribFV, periodicRate, n };
}

/** Binary-searches `solveFor` (a monotonically-increasing function of the
 * unknown) for the value that makes it equal `target`, within [lo, hi]. */
function bisect(fn, target, lo, hi, iterations = 100) {
  let a = lo, b = hi;
  for (let i = 0; i < iterations; i++) {
    const mid = (a + b) / 2;
    if (fn(mid) < target) a = mid; else b = mid;
  }
  return (a + b) / 2;
}

function resolveCommon({ P, C, contributionFrequency, annualRatePercent, compound, years, due }) {
  const { endBalance } = investmentFV({ P, C, contributionFrequency, annualRatePercent, compound, years, due });
  // NOT rounded to a whole period count: `years` is a whole number on 4 of
  // the 5 tabs (so rounding is a no-op there), but on Investment Length it's
  // the SOLVED, genuinely fractional answer (e.g. 171.030 years) — rounding
  // it to 171 whole periods before multiplying by C understated Total
  // Contributions by a few dollars against the reference (which uses the
  // exact fractional period count, matching the same fractional `n` the
  // underlying endBalance math — see investmentFV — already uses). Verified
  // live: target $600,593, 3%/daily, $102/year → 171.030y beginning /
  // 171.990y end, Total Contributions $17,445.11 / $17,543.00 exactly.
  const totalPeriods = contributionFrequency === "monthly" ? years * 12 : years;
  const totalContributions = C * totalPeriods;
  const totalInterest = endBalance - P - totalContributions;
  const { monthlySchedule, annualSchedule, barData } = buildSchedule({ P, C, contributionFrequency, annualRatePercent, compound, years, due, endBalance });
  return { endBalance, startingAmount: P, totalContributions, totalInterest, monthlySchedule, annualSchedule, barData };
}

// ─────────────────────────────────────────────────────────────────
// 1. End Amount
// ─────────────────────────────────────────────────────────────────

export function calculateEndAmount({ startingAmount, years, annualRatePercent, compound, contribution, contributeAt, contributionFrequency }) {
  const P = Math.max(0, Number(startingAmount) || 0);
  const C = Math.max(0, Number(contribution) || 0);
  const totalYears = Math.min(MAX_YEARS, Math.max(0, Number(years) || 0));
  const due = contributeAt === "beginning";
  return resolveCommon({ P, C, contributionFrequency, annualRatePercent, compound, years: totalYears, due });
}

// ─────────────────────────────────────────────────────────────────
// 2. Additional Contribution — closed-form: FV is LINEAR in C.
// ─────────────────────────────────────────────────────────────────

export function calculateAdditionalContribution({ targetAmount, startingAmount, years, annualRatePercent, compound, contributeAt, contributionFrequency }) {
  const target = Math.max(0, Number(targetAmount) || 0);
  const P = Math.max(0, Number(startingAmount) || 0);
  const totalYears = Math.min(MAX_YEARS, Math.max(0, Number(years) || 0));
  const due = contributeAt === "beginning";

  const { endBalance: lumpOnly } = investmentFV({ P, C: 0, contributionFrequency, annualRatePercent, compound, years: totalYears, due });
  const { endBalance: perDollarFV } = investmentFV({ P: 0, C: 1, contributionFrequency, annualRatePercent, compound, years: totalYears, due });
  // NOT clamped to 0 — verified live against the reference (a scenario
  // where the starting amount alone already exceeds the target legitimately
  // solves to a NEGATIVE required contribution, e.g. "$-97.35/month", and
  // the reference displays that exact value, achieving the target exactly.
  // An earlier version of this clamped negative solves to $0, which instead
  // silently changed the question from "what contribution reaches the
  // target" to "what does $0 contribution + the starting amount grow to" —
  // wrong whenever that growth doesn't already land exactly on the target.
  const C = perDollarFV !== 0 ? (target - lumpOnly) / perDollarFV : 0;

  return { contribution: C, ...resolveCommon({ P, C, contributionFrequency, annualRatePercent, compound, years: totalYears, due }) };
}

// ─────────────────────────────────────────────────────────────────
// 3. Return Rate — root-finding. NO Compound selector (see file header);
// always resolved as if Compound = "annually".
// ─────────────────────────────────────────────────────────────────

export function calculateReturnRate({ targetAmount, startingAmount, years, contribution, contributeAt, contributionFrequency }) {
  const target = Math.max(0, Number(targetAmount) || 0);
  const P = Math.max(0, Number(startingAmount) || 0);
  const C = Math.max(0, Number(contribution) || 0);
  const totalYears = Math.min(MAX_YEARS, Math.max(0, Number(years) || 0));
  const due = contributeAt === "beginning";

  const fv = (ratePercent) => investmentFV({ P, C, contributionFrequency, annualRatePercent: ratePercent, years: totalYears, due }).endBalance;
  const annualRatePercent = bisect(fv, target, -99, 100000);

  return { annualRatePercent, ...resolveCommon({ P, C, contributionFrequency, annualRatePercent, years: totalYears, due }) };
}

// ─────────────────────────────────────────────────────────────────
// 4. Starting Amount — closed-form: FV is LINEAR in P.
// ─────────────────────────────────────────────────────────────────

export function calculateStartingAmount({ targetAmount, years, annualRatePercent, compound, contribution, contributeAt, contributionFrequency }) {
  const target = Math.max(0, Number(targetAmount) || 0);
  const C = Math.max(0, Number(contribution) || 0);
  const totalYears = Math.min(MAX_YEARS, Math.max(0, Number(years) || 0));
  const due = contributeAt === "beginning";

  const { endBalance: contribOnly } = investmentFV({ P: 0, C, contributionFrequency, annualRatePercent, compound, years: totalYears, due });
  const { endBalance: perDollarFV } = investmentFV({ P: 1, C: 0, contributionFrequency, annualRatePercent, compound, years: totalYears, due });
  // NOT clamped to 0 — a reported bug (screenshots showing target $40,024,
  // 92yr, 23% return, $103/month) proved the reference legitimately solves
  // to a NEGATIVE starting amount (e.g. "$-5,451.29") whenever contributions
  // alone would already overshoot the target, and displays that exact value
  // with the End Balance landing exactly on the target — verified live via
  // direct GET requests to the reference for all 4 timing/frequency combos,
  // matching to the cent. A previous version of this clamped negative
  // solves to $0, which silently changed the question from "what starting
  // amount reaches the target" to "what does the starting amount alone grow
  // to if it's $0" — an entirely different (and, for this reported
  // scenario, wildly wrong: $7.6 TRILLION instead of the requested $40,024)
  // answer. (An earlier investigation of a similar-looking scenario
  // mistakenly concluded the reference DOES clamp to 0 — that was a
  // misreading of which screenshots were "reference" vs "our tool"; a
  // fresh direct query of the live reference for that same scenario also
  // returns the negative, unclamped value. See investment-calculator-notes.md.)
  const P = perDollarFV !== 0 ? (target - contribOnly) / perDollarFV : 0;

  return { startingAmountSolved: P, ...resolveCommon({ P, C, contributionFrequency, annualRatePercent, compound, years: totalYears, due }) };
}

// ─────────────────────────────────────────────────────────────────
// 5. Investment Length — root-finding.
// ─────────────────────────────────────────────────────────────────

export function calculateInvestmentLength({ targetAmount, startingAmount, annualRatePercent, compound, contribution, contributeAt, contributionFrequency }) {
  const target = Math.max(0, Number(targetAmount) || 0);
  const P = Math.max(0, Number(startingAmount) || 0);
  const C = Math.max(0, Number(contribution) || 0);
  const due = contributeAt === "beginning";

  const fv = (yrs) => investmentFV({ P, C, contributionFrequency, annualRatePercent, compound, years: yrs, due }).endBalance;
  const years = bisect(fv, target, 0, MAX_YEARS);

  return { years, ...resolveCommon({ P, C, contributionFrequency, annualRatePercent, compound, years, due }) };
}

// ─────────────────────────────────────────────────────────────────
// Accumulation schedule + bar-chart data (shared by every tab)
// ─────────────────────────────────────────────────────────────────

function buildSchedule({ P, C, contributionFrequency, annualRatePercent, compound, years, due, endBalance }) {
  const rate = (Number(annualRatePercent) || 0) / 100;
  const ear = unclampedEAR(rate, compound || "annually");
  const monthlyRate = periodicRateFromEAR(ear, 12);
  const isMonthly = contributionFrequency === "monthly";
  const nMonthly = Math.max(0, Math.min(MAX_SCHEDULE_MONTHS, Math.round(years * 12)));

  const monthlySchedule = [];
  let balance = P;
  let cumulativeContributions = 0;

  for (let m = 1; m <= nMonthly; m++) {
    // A real reported bug: for an ANNUAL contribution timed at
    // "beginning", the deposit belongs at the FIRST month of each year
    // (1, 13, 25, ...) — this used `m % 12 === 0` unconditionally, which
    // is only correct for "end" timing (12, 24, 36, ...); "beginning"
    // was silently placing the deposit a year late relative to when
    // it's supposed to start earning interest. The headline End
    // Balance/Total Interest still came out right regardless (the
    // closed-form `contributionFV`'s own `due` multiplier handles timing
    // correctly independent of this per-period grid), but the detailed
    // schedule table showed the deposit landing 11 months later than it
    // should. Verified live: starting $22, 2yr, 3%/annually, $222/year,
    // beginning — reference deposits $222 at months 1 and 13, not 12/24.
    // Mirrors the pattern interestCalculatorEngine.js's buildSchedule
    // already used correctly (`due ? (m - 1) % 12 === 0 : m % 12 === 0`).
    const isContributionMonth = isMonthly || (due ? (m - 1) % 12 === 0 : m % 12 === 0);
    const deposit = isContributionMonth ? C : 0;
    const displayDeposit = deposit + (m === 1 ? P : 0);
    let interest;
    if (due) {
      balance += deposit;
      interest = balance * monthlyRate;
      balance += interest;
    } else {
      interest = balance * monthlyRate;
      balance += interest;
      balance += deposit;
    }
    cumulativeContributions += deposit;
    if (m === nMonthly) balance = endBalance;
    monthlySchedule.push({ period: m, deposit: displayDeposit, interest, balance });
  }

  const annualSchedule = [];
  const barData = [];
  for (let i = 0; i < monthlySchedule.length; i += 12) {
    const yearRows = monthlySchedule.slice(i, i + 12);
    if (!yearRows.length) break;
    const yearEndBalance = yearRows[yearRows.length - 1].balance;
    annualSchedule.push({
      period: annualSchedule.length + 1,
      deposit: yearRows.reduce((sum, r) => sum + r.deposit, 0),
      interest: yearRows.reduce((sum, r) => sum + r.interest, 0),
      balance: yearEndBalance,
    });
  }

  // Bar-chart data: one point per COMPLETED year (or fractional final
  // year), tracking cumulative contributions and the combined interest
  // bucket — matches the reference's own tooltip breakdown exactly (see
  // file header). Sampling directly off the annual schedule's own
  // running balance keeps this consistent with the table above.
  let cumContrib = 0;
  for (const row of annualSchedule) {
    cumContrib += row.deposit - (row.period === 1 ? P : 0);
    barData.push({
      year: row.period,
      startingAmount: P,
      contributions: cumContrib,
      interest: row.balance - P - cumContrib,
      total: row.balance,
    });
  }
  // A fractional final year (Investment Length solving to e.g. 28.711
  // years) isn't captured by the whole-year loop above — add one more
  // point at the exact solved length so the bar chart's last bar matches
  // the headline End Balance exactly, same anti-drift principle used
  // throughout this app's other engines.
  if (years > 0 && Math.abs(years - Math.round(years)) > 1e-9) {
    barData.push({
      year: Number(years.toFixed(3)),
      startingAmount: P,
      contributions: cumulativeContributions,
      interest: endBalance - P - cumulativeContributions,
      total: endBalance,
    });
  }

  return { monthlySchedule, annualSchedule, barData };
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, decimals = 3) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
