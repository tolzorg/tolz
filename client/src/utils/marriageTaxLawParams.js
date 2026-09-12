// Pure tax-law data for the Marriage Tax Calculator, one object per year.
// This is the ONE file meant to need touching for a future tax year —
// see the bottom of this file for "Adding a new tax year".
//
// Source: the reference (calculator.net/marriage-calculator.html) states
// it uses "2026 federal income tax brackets". Ordinary brackets, standard
// deduction, and long-term capital gains brackets below are the published
// IRS Rev. Proc. 2025-32 figures.
//
// A wide live sweep (dozens of Playwright-driven salary points from $0 to
// $700k, at zero credit exposure) found and fixed TWO systemic issues
// that had been the whole cause of every previously-documented "married
// column residual": (1) the reference ALWAYS subtracts the filer's own
// Social Security + Medicare tax from the ordinary bracket basis, for
// EVERY filer — not just self-employed ones (see calculatePersonTax);
// and (2) the "No. of Dependents" credit is NOT a real-world EITC-shaped
// trapezoid (phase-in / plateau / phase-out) — it is a much simpler pure
// straight LINE from salary $0, `credit = max(0, maxCredit - rate *
// salary)`, with no phase-in and no plateau. Once both were found, every
// bracket figure matched the live reference exactly (0 residual) across
// Single/MarriedJoint/HeadofHousehold at $90k/$120k/$250k/$700k, and the
// credit table below reproduces 20+ independent live data points to
// within ~$1 (display rounding). See marriage-calculator-notes.md.
//
// This calculator supports 3 filing statuses only (no MarriedSeparately):
// Single, MarriedJoint (labeled "Qualified Widow" for the PRE-marriage
// status, since Married Filing Jointly isn't a valid "before marriage"
// status — Qualified Widow(er) uses identical brackets/deduction under
// real law, so the same bracket table is reused), and HeadofHousehold.

export const TAX_LAW_2026 = {
  year: 2026,

  // Ordinary income brackets: [rate, incomeUpToInclusive] pairs, last
  // bracket's ceiling is Infinity. Published IRS Rev. Proc. 2025-32.
  brackets: {
    Single: [
      [0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775],
      [0.32, 256225], [0.35, 640600], [0.37, Infinity],
    ],
    MarriedJoint: [
      [0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550],
      [0.32, 512450], [0.35, 768700], [0.37, Infinity],
    ],
    HeadofHousehold: [
      [0.10, 17700], [0.12, 67450], [0.22, 105700], [0.24, 201775],
      [0.32, 256200], [0.35, 640600], [0.37, Infinity],
    ],
  },

  standardDeduction: { Single: 16100, MarriedJoint: 32200, HeadofHousehold: 24150 },

  // Long-term capital gains / qualified dividends brackets: 0%/15%/20%,
  // stacked on top of ordinary taxable income. HoH thresholds are
  // estimated proportionally (roughly between Single and MFJ, matching
  // the real published ratio) since they weren't independently found in
  // the source used for Single/MFJ.
  ltcgBrackets: {
    Single: [[0, 49450], [0.15, 545500], [0.20, Infinity]],
    MarriedJoint: [[0, 98900], [0.15, 613700], [0.20, Infinity]],
    HeadofHousehold: [[0, 66200], [0.15, 578100], [0.20, Infinity]],
  },

  // FICA / Medicare — real, well-published figures.
  socialSecurityRate: 0.062, // ×2 (12.4%) if self-employed
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145, // ×2 (2.9%) if self-employed
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: { Single: 200000, MarriedJoint: 250000, HeadofHousehold: 200000 },

  selfEmploymentRate: 0.153, // no longer used for the bracket-basis adjustment (see calculatePersonTax) — kept only in case a future mechanic needs the raw combined SE rate

  // The "No. of Dependents" credit — CALIBRATED against a dense live
  // sweep (Playwright-driven, $40k-$80k salary in $4-5k steps, 3 filing
  // statuses × 4+ dependent counts each = 100+ data points) after the
  // FICA-basis-deduction fix above was found and separated out. Unlike
  // real-world EITC, this reference's own credit has NO phase-in and NO
  // plateau — it is a pure straight line from salary $0:
  //   credit = max(0, maxCredit - rate * salary)
  // `rate` is 0.2106 for every tier EXCEPT Single/HeadofHousehold's own
  // 0-dependent tier (0.1598) — confirmed identical across every other
  // (status, dependents) combination tested, to within ~$1 of every
  // measured point. Dependents CAPS: Single/HeadofHousehold cap at 2
  // (a 2, 3, or 4-dependent filer gets the identical 2+ tier — confirmed
  // identical live results for deps=2,3,4,5 at every salary tested);
  // MarriedJoint caps at 1 (a 1, 2, or 3-dependent filer gets the
  // identical 1+ tier — confirmed identical for deps=1,2,3). A
  // 0-dependent filer is NOT floored up to the 1-dependent tier (unlike
  // the old, since-removed Income Tax Calculator's own quirk) — Single/
  // HoH's 0-dependent tier is a genuinely smaller, slower-phasing-out
  // credit of its own.
  credit: {
    Single: { 0: { max: 8244, rate: 0.1598 }, 1: { max: 12347, rate: 0.2106 }, 2: { max: 13262, rate: 0.2106 } },
    HeadofHousehold: { 0: { max: 8244, rate: 0.1598 }, 1: { max: 12347, rate: 0.2106 }, 2: { max: 13262, rate: 0.2106 } },
    MarriedJoint: { 0: { max: 13878, rate: 0.2106 }, 1: { max: 14789, rate: 0.2106 } },
  },
};

export const TAX_LAW_BY_YEAR = { 2026: TAX_LAW_2026 };
export const DEFAULT_TAX_YEAR = 2026;

// ── Adding a new tax year ──────────────────────────────────────────
// 1. Copy TAX_LAW_2026 to a new TAX_LAW_20XX object with that year's
//    published IRS Rev. Proc. figures (brackets, standard deduction,
//    LTCG brackets, SS wage base, CTC/EITC parameters all change yearly).
// 2. Add it to TAX_LAW_BY_YEAR and bump DEFAULT_TAX_YEAR.
// 3. No other file should need changes.
