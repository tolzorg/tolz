// Marriage Tax Calculator engine — matches calculator.net/marriage-
// calculator.html's field set and result layout. See
// marriage-calculator-notes.md for the full reverse-engineering writeup
// (this calculator has no GET interface, so it was driven live via
// Playwright, same technique as this app's prior Income Tax Calculator
// research) and exactly which mechanics below are verified-exact vs.
// best-effort standard formula.
//
// VERIFIED EXACT against the live reference:
//  - Filing status set (Single / MarriedJoint / HeadofHousehold only —
//    MarriedJoint is the internal value for the "Qualified Widow"
//    pre-marriage option, since it shares MFJ's brackets under real law).
//  - Social Security = 6.2% (12.4% if self-employed) of SALARY ONLY
//    (not other income types), capped at the wage base.
//  - Medicare = 1.45% (2.9% if self-employed) of salary only.
//  - "State+City Income Tax" = state rate × ALL income (gross, not
//    taxable) — confirmed by reproducing the reference's own screenshot
//    figures exactly ($65,029×9% = $5,853; $45,021×5% = $2,251).
//  - "All Income" = sum of every income line item (salary, interest,
//    rental, both capital gains, qualified dividends) — does NOT
//    subtract 401k, which is shown as its own separate line.
//  - The headline comparison = (federal tax if filing jointly as one
//    married return) − (spouse 1's + spouse 2's federal tax if each
//    filed on their own pre-marriage status).
//
// BEST-EFFORT / STANDARD FORMULA (see marriage-calculator-notes.md for
// why — this calculator's own numbers showed an EITC-like credit
// significantly offsetting tax at lower incomes that could not be
// isolated to the exact dollar within a reasonable research budget):
//  - Ordinary brackets, standard deduction, LTCG brackets: real
//    published 2026 IRS figures (marriageTaxLawParams.js).
//  - The "No. of Dependents" field's tax reduction: modeled as a single
//    EITC-style refundable credit (standard published parameters,
//    "floor of 1" dependent for schedule selection — reusing the exact
//    quirk already found and documented for this app's Income Tax
//    Calculator) rather than a separately-isolated CTC + EITC pair.
//  - Self-employment tax's effect on the bracket-basis (full 15.3% of
//    salary subtracted before applying ordinary brackets) — reused
//    verbatim from the verified-exact mechanic already found for the
//    Income Tax Calculator, since it's very likely the same backend.

import { TAX_LAW_BY_YEAR, DEFAULT_TAX_YEAR } from "./marriageTaxLawParams.js";
export { formatCurrency } from "./financeCalculatorEngine.js";

export const FILE_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "MarriedJoint", label: "Qualified Widow" },
  { value: "HeadofHousehold", label: "Head of Household" },
];

export const DEFAULTS = {
  salary1: "65000", interest1: "0", rental1: "0", stcg1: "0", ltcg1: "0", qdiv1: "0", k401_1: "10000",
  salary2: "45000", interest2: "0", rental2: "0", stcg2: "0", ltcg2: "0", qdiv2: "0", k401_2: "6000",
  status1: "Single", status2: "Single",
  dependents1: "0", dependents2: "0",
  stateTax1: "5", stateTax2: "5",
};

function applyBrackets(taxableIncome, brackets) {
  let tax = 0;
  let lastCeiling = 0;
  for (const [rate, ceiling] of brackets) {
    if (taxableIncome <= lastCeiling) break;
    const amountInBracket = Math.min(taxableIncome, ceiling) - lastCeiling;
    tax += amountInBracket * rate;
    lastCeiling = ceiling;
  }
  return tax;
}

function marginalRateFor(taxableIncome, brackets) {
  // Confirmed live: a filer with zero taxable income shows a 0% marginal
  // rate, not the first bracket's 10%/12% (there's no "next dollar" rate
  // to speak of when nothing is taxed).
  if (taxableIncome <= 0) return 0;
  for (const [rate, ceiling] of brackets) {
    if (taxableIncome <= ceiling) return rate;
  }
  return brackets[brackets.length - 1][0];
}

/** LTCG/qualified dividends stack ON TOP of ordinary taxable income —
 * standard "stacking" method used across this app's other calculators
 * that model preferential rates. */
function applyLtcgTax(ordinaryTaxable, preferentialTaxable, ltcgBrackets) {
  if (preferentialTaxable <= 0) return 0;
  const totalTaxable = ordinaryTaxable + preferentialTaxable;
  const taxAtTotal = applyBracketsFlat(totalTaxable, ltcgBrackets);
  const taxAtOrdinaryOnly = applyBracketsFlat(ordinaryTaxable, ltcgBrackets);
  return taxAtTotal - taxAtOrdinaryOnly;
}
// LTCG brackets are [rate, ceiling] but unlike ordinary brackets the
// "tax owed if income were entirely this" needs the SAME bracket-sum
// logic, so this is really the same math as applyBrackets — kept as a
// separate name for clarity at the call site above.
function applyBracketsFlat(income, brackets) {
  return applyBrackets(income, brackets);
}

/** The "No. of Dependents" credit — see marriageTaxLawParams.js's `credit`
 * table doc comment for the live-verified shape: a pure straight-line
 * phase-out from salary $0 (no phase-in, no plateau), with dependents
 * capped at each status's highest calibrated tier. */
function calculateEitc(earnedIncome, dependents, status, law) {
  const table = law.credit[status] || law.credit.Single;
  const tiers = Object.keys(table).map(Number);
  const cap = Math.max(...tiers);
  const tier = table[Math.min(cap, Math.max(0, Math.round(dependents) || 0))];
  return Math.max(0, tier.max - tier.rate * earnedIncome);
}

/** Computes one filer's (or one combined-married return's) federal tax
 * and take-home breakdown from a single set of income inputs. */
export function calculatePersonTax(inputs, year = DEFAULT_TAX_YEAR) {
  const law = TAX_LAW_BY_YEAR[year] || TAX_LAW_BY_YEAR[DEFAULT_TAX_YEAR];
  const salary = Number(inputs.salary) || 0;
  const interest = Number(inputs.interest) || 0;
  const rental = Number(inputs.rental) || 0;
  const stcg = Number(inputs.stcg) || 0;
  const ltcg = Number(inputs.ltcg) || 0;
  const qdiv = Number(inputs.qdiv) || 0;
  const k401 = Number(inputs.k401) || 0;
  const status = inputs.status;
  const dependents = Math.max(0, Number(inputs.dependents) || 0);
  const useStandard = inputs.useStandard;
  const itemized = Number(inputs.itemized) || 0;
  const stateRatePercent = Number(inputs.stateRatePercent) || 0;
  const selfEmployed = !!inputs.selfEmployed;

  const ordinaryIncome = salary + interest + rental + stcg;
  const preferentialIncome = ltcg + qdiv;
  const allIncome = ordinaryIncome + preferentialIncome;

  // Confirmed by this app's prior Income Tax Calculator research: even
  // when "itemize" is chosen, the deduction actually used is
  // max(itemized, standard) — an itemized total smaller than the
  // standard deduction doesn't forfeit the standard amount.
  const deduction = useStandard ? law.standardDeduction[status] : Math.max(itemized, law.standardDeduction[status]);
  const totalTaxable = Math.max(0, allIncome - k401 - deduction);
  let ordinaryTaxable = Math.max(0, totalTaxable - preferentialIncome);
  const preferentialTaxable = totalTaxable - ordinaryTaxable;

  const ssBase = Math.min(salary, law.socialSecurityWageBase);
  const socialSecurityTax = ssBase * law.socialSecurityRate * (selfEmployed ? 2 : 1);
  const medicareThreshold = law.additionalMedicareThreshold[status] ?? law.additionalMedicareThreshold.Single;
  const additionalMedicare = Math.max(0, salary - medicareThreshold) * law.additionalMedicareRate;
  const medicareTax = salary * law.medicareRate * (selfEmployed ? 2 : 1) + additionalMedicare;

  // Confirmed live via a wide live sweep (salary points from $40k to
  // $700k, matched to the exact dollar with zero residual at $90k/$120k/
  // $250k/$700k, across Single/MarriedJoint/HeadofHousehold): the
  // reference ALWAYS subtracts the filer's own payroll-tax burden
  // (Social Security + Medicare + Additional Medicare — the SAME capped/
  // thresholded figures shown on the FICA lines below, not a flat rate)
  // from the ordinary bracket basis, for EVERY filer — not just
  // self-employed ones. This replaces the old self-employed-only flat
  // 15.3%*salary adjustment, which was wrong on two counts: it only
  // fired for self-employed filers, and used an uncapped flat rate
  // instead of the real capped/thresholded FICA amount.
  ordinaryTaxable = Math.max(0, ordinaryTaxable - socialSecurityTax - medicareTax);

  const ordinaryTax = applyBrackets(ordinaryTaxable, law.brackets[status]);
  const ltcgTax = applyLtcgTax(ordinaryTaxable, preferentialTaxable, law.ltcgBrackets[status]);
  const grossTax = ordinaryTax + ltcgTax;

  const eitc = calculateEitc(salary, dependents, status, law);
  const federalIncomeTax = Math.max(0, grossTax - eitc);
  // Confirmed live: once a credit fully offsets the tax owed (federal
  // tax lands at exactly $0), the reference shows a 0% marginal rate
  // regardless of which ordinary bracket the raw taxable income falls
  // in — not just when taxable income itself is $0. Matches the
  // intuition that there's no "next dollar" rate worth reporting when
  // the filer owes nothing.
  const marginalRate = federalIncomeTax === 0 ? 0 : marginalRateFor(ordinaryTaxable, law.brackets[status]);

  const stateCityTax = allIncome * (stateRatePercent / 100);

  const finalTakeHome = allIncome - federalIncomeTax - socialSecurityTax - medicareTax - stateCityTax - k401;

  return {
    allIncome, federalIncomeTax, marginalRate, socialSecurityTax, medicareTax,
    stateCityTax, k401, finalTakeHome,
  };
}

export function calculateMarriageTax({ spouse1, spouse2 }, year = DEFAULT_TAX_YEAR) {
  const r1 = calculatePersonTax(spouse1, year);
  const r2 = calculatePersonTax(spouse2, year);

  const combined = {
    allIncome: r1.allIncome + r2.allIncome,
    federalIncomeTax: r1.federalIncomeTax + r2.federalIncomeTax,
    socialSecurityTax: r1.socialSecurityTax + r2.socialSecurityTax,
    medicareTax: r1.medicareTax + r2.medicareTax,
    stateCityTax: r1.stateCityTax + r2.stateCityTax,
    k401: r1.k401 + r2.k401,
    finalTakeHome: r1.finalTakeHome + r2.finalTakeHome,
  };

  // Combined-if-married: one MarriedJoint return with both spouses'
  // income line items summed. Deduction: MFJ standard deduction if BOTH
  // chose standard; otherwise the sum of each spouse's own chosen
  // deduction (itemized amount, or 0 in place of an unspecified
  // per-spouse standard-deduction split) — a reasonable simplification
  // for this "estimation only" tool given real law doesn't split a
  // joint return's standard deduction per spouse anyway.
  const bothStandard = spouse1.useStandard && spouse2.useStandard;
  const marriedInputs = {
    salary: (Number(spouse1.salary) || 0) + (Number(spouse2.salary) || 0),
    interest: (Number(spouse1.interest) || 0) + (Number(spouse2.interest) || 0),
    rental: (Number(spouse1.rental) || 0) + (Number(spouse2.rental) || 0),
    stcg: (Number(spouse1.stcg) || 0) + (Number(spouse2.stcg) || 0),
    ltcg: (Number(spouse1.ltcg) || 0) + (Number(spouse2.ltcg) || 0),
    qdiv: (Number(spouse1.qdiv) || 0) + (Number(spouse2.qdiv) || 0),
    k401: (Number(spouse1.k401) || 0) + (Number(spouse2.k401) || 0),
    status: "MarriedJoint",
    dependents: (Number(spouse1.dependents) || 0) + (Number(spouse2.dependents) || 0),
    useStandard: bothStandard,
    itemized: bothStandard ? 0 : (spouse1.useStandard ? 0 : (Number(spouse1.itemized) || 0)) + (spouse2.useStandard ? 0 : (Number(spouse2.itemized) || 0)),
    // Married return uses a single combined state rate — approximated as
    // the income-weighted average of both spouses' own rates, since a
    // joint return doesn't have two separate state-tax lines.
    stateRatePercent: combined.allIncome > 0
      ? ((Number(spouse1.stateRatePercent) || 0) * r1.allIncome + (Number(spouse2.stateRatePercent) || 0) * r2.allIncome) / combined.allIncome
      : 0,
    selfEmployed: false, // combined SE tax is handled per-spouse below, not on the joint bracket basis
  };
  const married = calculatePersonTax(marriedInputs, year);

  // Reference has a confirmed, reproducible quirk (not a legitimate tax
  // mechanic — isolated via 15+ live A/B scenarios against the real
  // calculator.net site) in this exact joint-return's State+City tax: it
  // adds an EXTRA erroneous term equal to spouse 2's own (short + long
  // term capital gain) taxed AGAIN at spouse 1's own state rate, on top
  // of the otherwise-correct combined state tax. Confirmed strictly
  // one-sided — spouse 1's own capital gains never trigger it, only
  // spouse 2's do, always multiplied by spouse 1's rate (not spouse 2's
  // own, not whichever rate is larger). Replicated here for exact
  // numeric parity with the reference.
  const spouse2Gains = (Number(spouse2.stcg) || 0) + (Number(spouse2.ltcg) || 0);
  const spouse1RatePercent = Number(spouse1.stateRatePercent) || 0;
  const stateTaxBugExtra = spouse2Gains * (spouse1RatePercent / 100);
  married.stateCityTax += stateTaxBugExtra;
  married.finalTakeHome -= stateTaxBugExtra;

  // The FICA-based bracket-basis subtraction (see calculatePersonTax) is
  // inherently per-person — each spouse's own salary against their own
  // wage-base cap, doubled individually if THAT spouse is self-employed
  // — so it can't be computed by treating the joint return as one person
  // with the summed salary (that would apply a single wage-base cap to
  // the combined amount, which is wrong). Recompute the joint bracket
  // basis using the SUM of each spouse's own already-correct FICA
  // figures (r1/r2), always — not just when self-employed, since a
  // pooled non-self-employed calculation is equally wrong whenever the
  // combined salary crosses the wage base that neither spouse alone did.
  {
    const law = TAX_LAW_BY_YEAR[year] || TAX_LAW_BY_YEAR[DEFAULT_TAX_YEAR];
    const jointFica = r1.socialSecurityTax + r1.medicareTax + r2.socialSecurityTax + r2.medicareTax;
    const ordinaryIncome = marriedInputs.salary + marriedInputs.interest + marriedInputs.rental + marriedInputs.stcg;
    const preferentialIncome = marriedInputs.ltcg + marriedInputs.qdiv;
    const deduction = marriedInputs.useStandard ? law.standardDeduction.MarriedJoint : Math.max(marriedInputs.itemized, law.standardDeduction.MarriedJoint);
    const totalTaxable = Math.max(0, ordinaryIncome + preferentialIncome - marriedInputs.k401 - deduction);
    let ordinaryTaxable = Math.max(0, totalTaxable - preferentialIncome);
    const preferentialTaxable = totalTaxable - ordinaryTaxable;
    ordinaryTaxable = Math.max(0, ordinaryTaxable - jointFica);
    const ordinaryTax = applyBrackets(ordinaryTaxable, law.brackets.MarriedJoint);
    const ltcgTax = applyLtcgTax(ordinaryTaxable, preferentialTaxable, law.ltcgBrackets.MarriedJoint);
    const eitc = calculateEitc(marriedInputs.salary, marriedInputs.dependents, "MarriedJoint", law);
    married.federalIncomeTax = Math.max(0, ordinaryTax + ltcgTax - eitc);
    married.marginalRate = married.federalIncomeTax === 0 ? 0 : marginalRateFor(ordinaryTaxable, law.brackets.MarriedJoint);
    // Recompute SS/Medicare per-spouse (each spouse's own wage-base cap
    // and self-employment doubling, not a pooled figure).
    married.socialSecurityTax = r1.socialSecurityTax + r2.socialSecurityTax;
    married.medicareTax = r1.medicareTax + r2.medicareTax;
    married.finalTakeHome = married.allIncome - married.federalIncomeTax - married.socialSecurityTax - married.medicareTax - married.stateCityTax - married.k401;
  }

  const federalTaxDelta = married.federalIncomeTax - combined.federalIncomeTax;

  return { spouse1: r1, spouse2: r2, combined, married, federalTaxDelta };
}
