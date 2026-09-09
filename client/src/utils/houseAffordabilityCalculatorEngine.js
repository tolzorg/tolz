// House Affordability Calculator engine — matches
// calculator.net/house-affordability-calculator.html: two independent
// sub-calculators (income/DTI-based, and fixed-monthly-budget-based).
//
// Every rule below was reverse-engineered by driving the live reference
// with plain GET requests (both forms submit GET to the same page,
// server-rendered) across dozens of scenarios — varying the DTI type,
// down payment, property tax, and debt independently — because the
// reference's behavior turned out to be substantially more nuanced than
// the screenshots alone showed. See house-affordability-calculator-
// notes.md for the full derivation.
//
// THE CENTRAL DISCOVERY: property tax, HOA, and insurance are valued
// against the HOUSE price for Conventional-style loans (Conventional
// 28/36 rule, and the custom 10%-50% DTI options), but against the LOAN
// amount for FHA and VA loans — confirmed by fitting a straight line
// through 10+ independently-varied (tax rate, debt, house price) data
// points for each loan type and finding the LOAN-basis coefficient is
// the only one that reproduces every single data point to the penny.
// This is presumably a quirk/simplification in the reference's own
// implementation (property tax and insurance don't really scale with
// loan size in real life), but it's what the live site actually
// computes, so it's replicated exactly here.

const MONTHS_PER_YEAR = 12;
const MAX_LOAN_TERM_YEARS = 100;

function toRate(percent) {
  return Math.max(0, (Number(percent) || 0) / 100);
}

/** Validates the main calculator's inputs BEFORE solving — matching the
 * reference's own 7 distinct error messages (confirmed live via a GET
 * request per case), each of which blocks calculation entirely rather
 * than computing a degenerate result. A loan term over 100 years shares
 * the SAME (slightly misleadingly-worded) message as a non-positive
 * one — confirmed live at the exact 100/101-year boundary. Returns null
 * when valid. */
export function validateHouseAffordabilityInputs({
  annualIncome, loanTermYears, interestRate, monthlyDebt, downValue, downUnit, taxValue, hoaValue, insValue,
}) {
  if (Number(annualIncome) < 0) return "Please provide a positive income value.";
  const term = Number(loanTermYears) || 0;
  if (term <= 0 || term > MAX_LOAN_TERM_YEARS) return "Please provide a positive loan term value.";
  if (Number(interestRate) < 0) return "Please provide a positive interest rate value.";
  if (Number(monthlyDebt) < 0) return "Please provide a positive monthly debt payback amount value.";
  if (Number(downValue) < 0) return "Please provide a positive down payment value.";
  if (Number(taxValue) < 0) return "Please provide a positive property tax value.";
  if (Number(hoaValue) < 0) return "Please provide a positive HOA or Co-op fee value.";
  if (Number(insValue) < 0) return "Please provide a positive insurance value.";
  return null;
}

/** Same idea for the fixed-monthly-budget calculator — confirmed live
 * with its own analogous message set (a positive-budget check replaces
 * the income check; everything else mirrors the main calculator). */
export function validateBudgetInputs({ monthlyBudget, loanTermYears, interestRate, downValue, taxValue, hoaValue, insValue, maintenanceValue }) {
  if (Number(monthlyBudget) < 0) return "Please provide a positive monthly budget value.";
  const term = Number(loanTermYears) || 0;
  if (term <= 0 || term > MAX_LOAN_TERM_YEARS) return "Please provide a positive loan term value.";
  if (Number(interestRate) < 0) return "Please provide a positive interest rate value.";
  if (Number(downValue) < 0) return "Please provide a positive down payment value.";
  if (Number(taxValue) < 0) return "Please provide a positive property tax value.";
  if (Number(hoaValue) < 0) return "Please provide a positive HOA or Co-op fee value.";
  if (Number(insValue) < 0) return "Please provide a positive insurance value.";
  if (Number(maintenanceValue) < 0) return "Please provide a positive maintenance cost value.";
  return null;
}

/** A percent-mode down payment of 100% or more is nonsensical as a
 * percentage (you can't put more than 100% down), so the reference
 * silently REINTERPRETS the same typed number as a flat DOLLAR amount
 * instead and shows an informational (non-blocking) note — confirmed
 * live at the exact 99.99%/100% boundary. Returns the possibly-adjusted
 * {downValue, downUnit} plus whether the switch happened. */
function normalizeDownPayment(downValue, downUnit) {
  if (downUnit === "percent" && Number(downValue) >= 100) {
    return { downValue, downUnit: "dollar", downTreatedAsDollar: true };
  }
  return { downValue, downUnit, downTreatedAsDollar: false };
}

/** Confirmed live: an EFFECTIVE down payment under 5% of the house
 * price gets this note appended after whatever headline sentence
 * already exists — shown for ANY DTI type, not just Conventional. Uses
 * the ACTUAL resulting percentage, not the raw typed value — confirmed
 * live with a 101% input (auto-reinterpreted as a flat $101, which
 * resolves to just 0.0% of the solved house price): the reference
 * still shows this note in that case, even though the raw "101" typed
 * into the field was nowhere near "under 5". */
function lowDownPaymentNote(downPercentActual) {
  return downPercentActual >= 0 && downPercentActual < 5 - 1e-9
    ? "Very few lenders are willing to work with less than 5% down payment."
    : null;
}

const UNAFFORDABLE_MESSAGE = "Unfortunately, the information provided did not allow for an affordable house purchase scenario. The debt obligations and the housing costs exceed the recommended ratio of gross income.";

function paymentFactorFor(annualRatePercent, termMonths) {
  const i = toRate(annualRatePercent) / MONTHS_PER_YEAR;
  const n = Math.max(1, Number(termMonths) || 0);
  return i === 0 ? 1 / n : i / (1 - Math.pow(1 + i, -n));
}

/** Resolves a "$ or %" field into {coefOnHouse, dollarOffset}: a percent
 * value contributes `pct * basisValue` (where basisValue is either the
 * house price itself, or a fraction of it if the basis is the loan —
 * see `basisLoanCoef`/`basisLoanOffset` below), a dollar value
 * contributes a flat, house-INDEPENDENT dollar amount. Both forms
 * reduce to a linear function of the unknown house price, which is what
 * lets every one of this calculator's scenarios (any mix of % and $
 * fields) be solved in closed form rather than needing iteration. */
function resolveMonthlyLinear(value, unit, { basisLoanCoef = null, basisLoanOffset = 0 } = {}) {
  const n = Math.max(0, Number(value) || 0);
  if (unit === "dollar") {
    return { coefOnHouse: 0, dollarOffset: n / MONTHS_PER_YEAR };
  }
  const pct = n / 100;
  if (basisLoanCoef === null) {
    // Percent of HOUSE price (Conventional/custom DTI types, and the
    // fixed-budget calculator).
    return { coefOnHouse: pct / MONTHS_PER_YEAR, dollarOffset: 0 };
  }
  // Percent of LOAN amount (FHA/VA quirk) — loan = house*basisLoanCoef + basisLoanOffset.
  return { coefOnHouse: pct * basisLoanCoef / MONTHS_PER_YEAR, dollarOffset: pct * basisLoanOffset / MONTHS_PER_YEAR };
}

/** Down payment resolves to `loan = house*loanCoef + loanOffset` — a
 * percent down payment keeps the loan a constant FRACTION of whatever
 * house price is solved for (loanCoef = 1-downPct, loanOffset = 0); a
 * dollar down payment instead subtracts a fixed amount regardless of
 * house price (loanCoef = 1, loanOffset = -downDollar). Both are
 * confirmed live (a $50,000 flat down payment on an otherwise-default
 * scenario matched this exactly, including the resulting "11.8% of the
 * house price" the reference itself reports back). */
function resolveLoanLinear(downValue, downUnit) {
  const n = Math.max(0, Number(downValue) || 0);
  if (downUnit === "dollar") {
    return { loanCoef: 1, loanOffset: -n };
  }
  return { loanCoef: 1 - Math.min(1, n / 100), loanOffset: 0 };
}

/** FHA's monthly mortgage insurance premium (MIP) rate — confirmed live
 * by varying down payment: 0.55% of the loan per year when the down
 * payment is 5% or less, 0.50% otherwise. Always applied (FHA loans
 * always carry MIP, regardless of down payment size) — unlike
 * Conventional/custom loans' PMI, which is skipped entirely at 20%+ down. */
function fhaMipRate(downPercent) {
  return downPercent <= 5 ? 0.0055 : 0.005;
}

/** VA's monthly funding fee rate for a first-time-use veteran —
 * confirmed live across 6 down-payment breakpoints: 2.15% under 5%
 * down, 1.5% from 5% up to and including 10% down, 1.25% above 10%
 * down. Always applied (no down-payment threshold removes it, unlike
 * Conventional/custom PMI). */
function vaFundingFeeRate(downPercent) {
  if (downPercent < 5) return 0.0215;
  if (downPercent <= 10) return 0.015;
  return 0.0125;
}

/** Conventional/custom-DTI PMI rate — confirmed live as a flat 0.5% of
 * the loan per year (does not vary by down-payment tier, unlike
 * FHA/VA's own fees), applied only when down payment is UNDER 20%
 * (exactly 20% is PMI-free — confirmed at the 19.99%/20% boundary). */
const PMI_RATE = 0.005;

/**
 * Solves `A*house + B = target` for house, where A/B are accumulated
 * from the loan, tax, HOA, insurance, and (optional) program-fee linear
 * terms — the shared machinery behind both calc1's DTI-based solve and
 * calc2's fixed-budget solve. `program` is null for Conventional/custom
 * (house-basis tax/HOA/ins, PMI gate at 20% down) or "fha"/"va"
 * (loan-basis tax/HOA/ins, mandatory program fee, no PMI).
 */
function solveHouseForTarget({
  target, rate, termMonths, downValue, downUnit,
  taxValue, taxUnit, hoaValue, hoaUnit, insValue, insUnit, program,
}) {
  const paymentFactor = paymentFactorFor(rate, termMonths);
  const { loanCoef, loanOffset } = resolveLoanLinear(downValue, downUnit);
  const downPercentForTiers = downUnit === "dollar" ? null : Math.max(0, Number(downValue) || 0);

  const loanBasis = program === "fha" || program === "va" ? { basisLoanCoef: loanCoef, basisLoanOffset: loanOffset } : {};
  const tax = resolveMonthlyLinear(taxValue, taxUnit, loanBasis);
  const hoa = resolveMonthlyLinear(hoaValue, hoaUnit, loanBasis);
  const ins = resolveMonthlyLinear(insValue, insUnit, loanBasis);

  // Principal & interest: PI = loan*paymentFactor = house*loanCoef*paymentFactor + loanOffset*paymentFactor.
  let coefOnHouse = loanCoef * paymentFactor + tax.coefOnHouse + hoa.coefOnHouse + ins.coefOnHouse;
  let dollarOffset = loanOffset * paymentFactor + tax.dollarOffset + hoa.dollarOffset + ins.dollarOffset;

  // Down-payment percent, resolved iteratively when down is a dollar
  // amount (the fee tier then depends on the very house price being
  // solved for) — converges in a couple of iterations since the tiers
  // are wide relative to how much a single pass can move the estimate.
  function feeRateFor(estHouse) {
    if (program !== "fha" && program !== "va" && downPercentForTiers === null) {
      // Conventional/custom with dollar-mode down: PMI gate needs an
      // estimated down percent too.
    }
    const downPct = downPercentForTiers !== null
      ? downPercentForTiers
      : estHouse > 0 ? Math.max(0, (-loanOffset / estHouse) * 100) : 0;
    if (program === "fha") return fhaMipRate(downPct);
    if (program === "va") return vaFundingFeeRate(downPct);
    return downPct < 20 ? PMI_RATE : 0; // Conventional/custom PMI gate
  }

  let house = 0;
  let feeRate = feeRateFor(400000); // reasonable seed for the dollar-down iteration
  for (let iter = 0; iter < 5; iter++) {
    const feeCoefOnHouse = loanCoef * feeRate / MONTHS_PER_YEAR;
    const feeOffset = loanOffset * feeRate / MONTHS_PER_YEAR;
    const A = coefOnHouse + feeCoefOnHouse;
    const B = dollarOffset + feeOffset;
    house = A !== 0 ? (target - B) / A : 0;
    const nextFeeRate = feeRateFor(house);
    if (nextFeeRate === feeRate) break;
    feeRate = nextFeeRate;
  }

  const loan = house * loanCoef + loanOffset;
  const downPercentActual = house > 0 ? ((house - loan) / house) * 100 : 0;
  return { house, loan, feeRate, downPercentActual, paymentFactor };
}

// ─────────────────────────────────────────────────────────────────
// 1. Main House Affordability Calculator (income/DTI-based)
// ─────────────────────────────────────────────────────────────────

const DTI_RULES = {
  cv: { frontPct: 0.28, backPct: 0.36, program: null, label: "according to the 28/36 rule", note: "Most conventional loan lenders use the 28/36 rule." },
  fha: { frontPct: 0.31, backPct: 0.43, program: "fha", label: "with an FHA loan" },
  va: { frontPct: null, backPct: 0.41, program: "va", label: "with a VA loan" },
};

function dtiRuleFor(dtiUnit) {
  if (DTI_RULES[dtiUnit]) return DTI_RULES[dtiUnit];
  // Custom 10%-50% options: back-end only, Conventional-style (house
  // basis + PMI gate), no front-end cap — confirmed live (no "front-end"
  // constraint ever binds; the reference's own display only shows a
  // front-end row once debt makes it non-trivial, matching the same
  // rule VA gets below).
  const pct = Math.max(0, Number(dtiUnit) || 0) / 100;
  return { frontPct: null, backPct: pct, program: null, label: null };
}

export function calculateHouseAffordability({
  annualIncome, loanTermYears, interestRate, monthlyDebt,
  downValue, downUnit, taxValue, taxUnit, hoaValue, hoaUnit, insValue, insUnit, dtiUnit,
}) {
  const monthlyIncome = Math.max(0, Number(annualIncome) || 0) / MONTHS_PER_YEAR;
  const termMonths = Math.max(1, Number(loanTermYears) || 0) * MONTHS_PER_YEAR;
  const debt = Math.max(0, Number(monthlyDebt) || 0);
  const rule = dtiRuleFor(dtiUnit);

  const rawDownUnit = downUnit;
  const { downValue: normDownValue, downUnit: normDownUnit, downTreatedAsDollar } = normalizeDownPayment(downValue, downUnit);
  downValue = normDownValue;
  downUnit = normDownUnit;

  const commonArgs = { rate: interestRate, termMonths, downValue, downUnit, taxValue, taxUnit, hoaValue, hoaUnit, insValue, insUnit, program: rule.program };

  const backSolve = solveHouseForTarget({ ...commonArgs, target: rule.backPct * monthlyIncome - debt });
  let solve = backSolve;
  let boundBy = "back";
  if (rule.frontPct !== null) {
    const frontSolve = solveHouseForTarget({ ...commonArgs, target: rule.frontPct * monthlyIncome });
    if (frontSolve.house <= backSolve.house) {
      solve = frontSolve;
      boundBy = "front";
    }
  }

  const { house, loan, feeRate, downPercentActual } = solve;

  // Confirmed live (e.g. zero income, or debt large enough to consume
  // the entire DTI budget): when the target leaves no room for an
  // affordable house at all, the reference shows this dedicated message
  // instead of a (nonsensical, possibly negative) dollar breakdown.
  if (!(house > 0) || !Number.isFinite(house)) {
    return { unaffordable: true, unaffordableMessage: UNAFFORDABLE_MESSAGE };
  }
  const paymentFactor = paymentFactorFor(interestRate, termMonths);
  const monthlyPI = loan * paymentFactor;

  // DISPLAYED annual tax/HOA/insurance always use the HOUSE price as
  // their basis — confirmed live for FHA (house=$450,725, loan=$360,580,
  // 1.5% tax: reference shows "$6,761" = house-based, NOT "$5,409" which
  // loan-based would give). This is the one place the FHA/VA loan-basis
  // quirk does NOT apply — it's confined entirely to the internal
  // affordability-SOLVING equation (see the module doc comment above);
  // once the house price is solved, every displayed dollar figure
  // (tax, HOA, insurance, maintenance) is computed straightforwardly
  // from that house price, regardless of loan program.
  const annualTax = taxUnit === "dollar" ? Math.max(0, Number(taxValue) || 0) : toRate(taxValue) * house;
  const annualHoa = hoaUnit === "dollar" ? Math.max(0, Number(hoaValue) || 0) : toRate(hoaValue) * house;
  const annualIns = insUnit === "dollar" ? Math.max(0, Number(insValue) || 0) : toRate(insValue) * house;
  const annualMaintenance = house * 0.015; // fixed 1.5%/year assumption, matching the reference's own displayed "(assume 1.5%)" note

  const downPayment = house - loan;
  const closingCost = house * 0.03;

  // Program-specific one-time/monthly fees.
  const monthlyProgramFee = rule.program ? loan * feeRate / MONTHS_PER_YEAR : 0;
  const upfrontFhaPremium = rule.program === "fha" ? loan * 0.0175 : 0;
  const monthlyPmi = !rule.program && downPercentActual < 20 - 1e-9 ? loan * feeRate / MONTHS_PER_YEAR : 0;

  const totalOneTimeAtClosing = downPayment + closingCost + upfrontFhaPremium;
  const totalMonthlyCost = monthlyPI + annualTax / 12 + annualHoa / 12 + annualIns / 12 + annualMaintenance / 12 + monthlyProgramFee + monthlyPmi;

  // Front-end/back-end DTI ratios must be recomputed from the SAME
  // loan-basis tax/HOA/insurance the solving equation used for FHA/VA
  // (house-basis for Conventional/custom) — NOT the house-basis figures
  // computed above for display. Using the display figures here was a
  // real bug: it silently changed which ratio the front-end/back-end
  // rows reported without affecting the (already-correct) solved house
  // price, caught by re-deriving frontEndRatio against the reference's
  // own displayed percentages after fixing the display-basis bug above.
  //
  // PURELY INFORMATIONAL for VA and custom-% (never an actual
  // constraint there — confirmed live: a VA scenario's own displayed
  // front-end ratio can legitimately EXCEED its "cap", e.g. 36% shown
  // against a 31% figure that only ever appears when it happens to
  // coincide with the true back-end-driven result). For Conventional/
  // FHA it's the REAL constraint whenever it's the binding one
  // (boundBy === "front").
  const ratioBasis = rule.program ? loan : house;
  const taxForRatio = taxUnit === "dollar" ? Math.max(0, Number(taxValue) || 0) : toRate(taxValue) * ratioBasis;
  const hoaForRatio = hoaUnit === "dollar" ? Math.max(0, Number(hoaValue) || 0) : toRate(hoaValue) * ratioBasis;
  const insForRatio = insUnit === "dollar" ? Math.max(0, Number(insValue) || 0) : toRate(insValue) * ratioBasis;
  const piti = monthlyPI + taxForRatio / 12 + hoaForRatio / 12 + insForRatio / 12 + monthlyProgramFee;
  const frontEndRatio = monthlyIncome > 0 ? (piti / monthlyIncome) * 100 : 0;
  const backEndRatio = monthlyIncome > 0 ? ((piti + debt) / monthlyIncome) * 100 : 0;
  // Confirmed live: the reference only shows the front-end/back-end
  // breakdown rows when they carry real information — always for
  // Conventional/FHA (which have a genuine front-end constraint), and
  // for VA/custom only once nonzero debt makes front-end and back-end
  // diverge (at zero debt those two figures are identical and the rows
  // are omitted entirely).
  const showDtiRatios = rule.frontPct !== null || debt > 0;

  const extraNote = lowDownPaymentNote(downPercentActual);
  const ruleNote = [rule.note, extraNote].filter(Boolean).join(" ") || null;

  return {
    house, loan, downPayment, closingCost, totalOneTimeAtClosing,
    monthlyPI, annualTax, annualHoa, annualIns, annualMaintenance, totalMonthlyCost,
    frontEndRatio, backEndRatio, showDtiRatios,
    program: rule.program, ruleLabel: rule.label, ruleNote,
    monthlyProgramFee, programFeeRate: feeRate * 100,
    upfrontFhaPremium, monthlyPmi, pmiRate: PMI_RATE * 100,
    downPercentActual, downTreatedAsDollar,
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. House affordability based on fixed, monthly budgets
// ─────────────────────────────────────────────────────────────────

export function calculateHouseAffordabilityByBudget({
  monthlyBudget, loanTermYears, interestRate, downValue, downUnit,
  includeFees, taxValue, taxUnit, hoaValue, hoaUnit, insValue, insUnit, maintenanceValue, maintenanceUnit,
}) {
  const termMonths = Math.max(1, Number(loanTermYears) || 0) * MONTHS_PER_YEAR;
  const budget = Math.max(0, Number(monthlyBudget) || 0);
  const paymentFactor = paymentFactorFor(interestRate, termMonths);

  const { downValue: normDownValue, downUnit: normDownUnit, downTreatedAsDollar } = normalizeDownPayment(downValue, downUnit);
  downValue = normDownValue;
  downUnit = normDownUnit;

  if (!includeFees) {
    const { loanCoef, loanOffset } = resolveLoanLinear(downValue, downUnit);
    const A = loanCoef * paymentFactor;
    const B = loanOffset * paymentFactor;
    const house = A !== 0 ? (budget - B) / A : 0;
    const loan = house * loanCoef + loanOffset;
    const downPayment = house - loan;
    const closingCost = house * 0.03;
    const downPercentActual = house > 0 ? (downPayment / house) * 100 : 0;
    return {
      house, loan, downPayment, closingCost, totalOneTimeAtClosing: downPayment + closingCost,
      monthlyPI: loan * paymentFactor, annualTax: 0, annualHoa: 0, annualIns: 0, annualMaintenance: 0,
      totalMonthlyCost: budget, includeFees: false, monthlyPmi: 0,
      downTreatedAsDollar, lowDownNote: lowDownPaymentNote(downPercentActual),
    };
  }

  const downPercentForTiers = downUnit === "dollar" ? null : Math.max(0, Number(downValue) || 0);
  const { loanCoef, loanOffset } = resolveLoanLinear(downValue, downUnit);
  const tax = resolveMonthlyLinear(taxValue, taxUnit);
  const hoa = resolveMonthlyLinear(hoaValue, hoaUnit);
  const ins = resolveMonthlyLinear(insValue, insUnit);
  const maint = resolveMonthlyLinear(maintenanceValue, maintenanceUnit);

  const baseCoef = loanCoef * paymentFactor + tax.coefOnHouse + hoa.coefOnHouse + ins.coefOnHouse + maint.coefOnHouse;
  const baseOffset = loanOffset * paymentFactor + tax.dollarOffset + hoa.dollarOffset + ins.dollarOffset + maint.dollarOffset;

  let house = 0;
  let pmiRate = downPercentForTiers !== null ? (downPercentForTiers < 20 ? PMI_RATE : 0) : PMI_RATE;
  for (let iter = 0; iter < 5; iter++) {
    const A = baseCoef + loanCoef * pmiRate / MONTHS_PER_YEAR;
    const B = baseOffset + loanOffset * pmiRate / MONTHS_PER_YEAR;
    house = A !== 0 ? (budget - B) / A : 0;
    const impliedDownPct = downPercentForTiers !== null ? downPercentForTiers : house > 0 ? Math.max(0, (-loanOffset / house) * 100) : 0;
    const nextPmiRate = impliedDownPct < 20 - 1e-9 ? PMI_RATE : 0;
    if (nextPmiRate === pmiRate) break;
    pmiRate = nextPmiRate;
  }

  const loan = house * loanCoef + loanOffset;
  const downPayment = house - loan;
  const closingCost = house * 0.03;
  const monthlyPI = loan * paymentFactor;
  const annualTax = taxUnit === "dollar" ? Math.max(0, Number(taxValue) || 0) : toRate(taxValue) * house;
  const annualHoa = hoaUnit === "dollar" ? Math.max(0, Number(hoaValue) || 0) : toRate(hoaValue) * house;
  const annualIns = insUnit === "dollar" ? Math.max(0, Number(insValue) || 0) : toRate(insValue) * house;
  const annualMaintenance = maintenanceUnit === "dollar" ? Math.max(0, Number(maintenanceValue) || 0) : toRate(maintenanceValue) * house;
  const monthlyPmi = loan * pmiRate / MONTHS_PER_YEAR;
  const downPercentActual = house > 0 ? (downPayment / house) * 100 : 0;

  return {
    house, loan, downPayment, closingCost, totalOneTimeAtClosing: downPayment + closingCost,
    monthlyPI, annualTax, annualHoa, annualIns, annualMaintenance,
    totalMonthlyCost: monthlyPI + annualTax / 12 + annualHoa / 12 + annualIns / 12 + annualMaintenance / 12 + monthlyPmi,
    includeFees: true, monthlyPmi,
    downTreatedAsDollar, lowDownNote: lowDownPaymentNote(downPercentActual),
  };
}

export function formatCurrency(value, { decimals = 0 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, decimals = 0) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
