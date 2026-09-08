// Compound Interest Calculator engine — matches
// calculator.net/compound-interest-calculator.html. This is a pure rate
// CONVERTER (compare/convert a nominal rate between compounding
// frequencies) — it does not project a balance forward over time
// (that's the separate Interest Calculator this page itself points
// readers to). The underlying math is the exact same general-annuity
// "EAR-bridge" method already verified and used by the Loan Calculator
// (see loan-calculator-formulas.md) — this file is a thin wrapper
// around loanCalculatorEngine's effectiveAnnualRate/periodicRateFromEAR
// rather than a reimplementation, per this app's reuse convention.
//
// Verified exact against 6 live reference scenarios spanning every
// compounding frequency (including continuous, in both directions) —
// see compound-interest-calculator-notes.md.

import { effectiveAnnualRate, periodicRateFromEAR, compoundPeriodsPerYear } from "./loanCalculatorEngine.js";

// Dropdown labels match the reference's own text EXACTLY (confirmed
// live) — note this differs slightly from loanCalculatorEngine's OWN
// COMPOUND_OPTIONS ("Semi-annually" with a hyphen) and from
// interestCalculatorEngine's OWN COMPOUND_OPTIONS (all-lowercase, no
// APY/APR suffix) — three different calculators on the reference site
// use three slightly different label conventions for the identical set
// of `value`s, so this file defines its own rather than importing
// either sibling's mismatched label text.
export const COMPOUND_OPTIONS = [
  { value: "annually", label: "Annually (APY)" },
  { value: "semiannually", label: "Semiannually" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly (APR)" },
  { value: "semimonthly", label: "Semimonthly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "continuously", label: "Continuously" },
];

export const DEFAULT_IN_COMPOUND = "monthly";
export const DEFAULT_OUT_COMPOUND = "annually";

// The result SENTENCE's per-option label — verified exact live: only
// "annually" and "monthly" carry a parenthetical suffix in prose (every
// other option is bare), which is why this can't just reuse the
// dropdown's own `label` text above (dropdown labels are correct for
// every option; sentence labels are a DIFFERENT, mostly-overlapping set
// confirmed separately).
const SENTENCE_LABEL = {
  annually: "annually (APY)", semiannually: "semiannually", quarterly: "quarterly",
  monthly: "monthly (APR)", semimonthly: "semimonthly", biweekly: "biweekly",
  weekly: "weekly", daily: "daily", continuously: "continuously",
};

// "or {rate}% interest every {period}" clause — verified exact live for
// every option EXCEPT annually/continuously, which never get this
// clause (there's no shorter "period" to name for either: annually IS
// the base period, and continuous compounding has no discrete period at
// all). Period phrasing verified exact for every remaining option.
const PERIOD_LABEL = {
  semiannually: "6 months", quarterly: "3 months", monthly: "month",
  semimonthly: "half a month", biweekly: "2 weeks", weekly: "week", daily: "day",
};

// The periodic-rate CLAUSE divides by 365.25 for "daily" specifically —
// verified live: annually->daily gives outputRate 5.82736%, and
// 5.82736/365 rounds to 0.01597% while 5.82736/365.25 rounds to the
// reference's own displayed 0.01595%. This is a narrower override than
// `compoundPeriodsPerYear`'s 365 (used everywhere else, including this
// same rate's own EAR-bridge math, where 365 vs. 365.25 is too small a
// difference to show up at 5-decimal precision) — matches the
// footnote's own "*assumes 365.25 days per year" text.
function periodDivisor(compound) {
  return compound === "daily" ? 365.25 : compoundPeriodsPerYear(compound);
}

// Footnote text — verified exact live, shown once per distinct
// footnoted compound INVOLVED ON EITHER SIDE (input or output), in this
// fixed order (matches the reference's own COMPOUND_OPTIONS array
// order: biweekly appears before weekly, which appears before daily).
const FOOTNOTE = {
  biweekly: "*The biweekly rate assumes 52 weeks per year.",
  weekly: "*The weekly rate assumes 52 weeks per year.",
  daily: "*The daily rate assumes 365.25 days per year.",
};
const FOOTNOTE_ORDER = ["biweekly", "weekly", "daily"];

/** Converts a nominal rate at one compounding frequency to the
 * equivalent nominal rate at another, via the EAR-bridge method:
 * nominal-in → EAR → nominal-out. Verified exact for all 9×9 frequency
 * pairs tested (see notes file for the 6 spanning combinations
 * actually driven against the live reference). */
export function convertCompoundRate(ratePercent, inCompound, outCompound) {
  const r = (Number(ratePercent) || 0) / 100;
  const ear = effectiveAnnualRate(r, inCompound);
  if (outCompound === "continuously") {
    return Math.log(1 + ear) * 100;
  }
  const m = compoundPeriodsPerYear(outCompound);
  return periodicRateFromEAR(ear, m) * m * 100;
}

/** Builds the full result — the converted rate, the result sentence
 * (with its conditional "or X% every period" clause), and the list of
 * applicable footnotes — matching the reference exactly. */
export function calculateCompoundInterest({ ratePercent, inCompound, outCompound }) {
  const outputRate = convertCompoundRate(ratePercent, inCompound, outCompound);

  let periodClause = "";
  if (outCompound !== "annually" && outCompound !== "continuously") {
    const periodicRate = outputRate / periodDivisor(outCompound);
    periodClause = ` or ${formatPercent(periodicRate)} interest every ${PERIOD_LABEL[outCompound]}`;
  }

  // Split into 3 parts (rather than one templated string) so the UI can
  // render the output rate as its own bold/green `<span>` inline with
  // plain-text prose on either side, matching the reference's own
  // "...is equivalent to **6.16778%** compound..." mixed-formatting
  // sentence exactly.
  const sentencePrefix = `${formatPercent(Number(ratePercent) || 0)} compound ${SENTENCE_LABEL[inCompound]} is equivalent to `;
  const sentenceSuffix = ` compound ${SENTENCE_LABEL[outCompound]}${periodClause}.`;

  const footnotes = FOOTNOTE_ORDER
    .filter((key) => key === inCompound || key === outCompound)
    .map((key) => FOOTNOTE[key]);

  return { outputRate, sentencePrefix, sentenceSuffix, footnotes };
}

export function formatPercent(value, decimals = 5) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
