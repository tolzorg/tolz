// Plain-Node test suite for the House Affordability Calculator engine.
// Run with: node scripts/house-affordability-calculator.test.js
//
// Every scenario below was verified against the LIVE reference (plain
// GET requests — both forms submit GET to the same page, server-
// rendered). This calculator turned out to have substantially more
// nuance than its screenshots show — see house-affordability-
// calculator-notes.md for the full multi-round derivation, including
// the central discovery that FHA/VA value property tax/HOA/insurance
// against the LOAN amount while Conventional/custom-DTI value them
// against the HOUSE price.

import { calculateHouseAffordability, calculateHouseAffordabilityByBudget, validateHouseAffordabilityInputs, validateBudgetInputs } from "../src/utils/houseAffordabilityCalculatorEngine.js";

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

function approx(a, b, tolerance = 1) {
  return Math.abs(a - b) <= tolerance;
}

const base = {
  annualIncome: 120000, loanTermYears: 30, interestRate: 6.792, monthlyDebt: 0,
  downValue: 20, downUnit: "percent",
  taxValue: 1.5, taxUnit: "percent",
  hoaValue: 0, hoaUnit: "percent",
  insValue: 0.5, insUnit: "percent",
  dtiUnit: "cv",
};

// ─────────────────────────────────────────────────────────────────
// 1. Conventional (28/36 rule) — default reference scenario
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordability(base);
  ok("cv house 407,107", approx(r.house, 407107), r.house);
  ok("cv loan 325,685", approx(r.loan, 325685));
  ok("cv down 81,421", approx(r.downPayment, 81421));
  ok("cv closing 12,213", approx(r.closingCost, 12213));
  ok("cv monthlyPI 2,121", approx(r.monthlyPI, 2121));
  ok("cv annualTax 6,107", approx(r.annualTax, 6107));
  ok("cv annualIns 2,036", approx(r.annualIns, 2036));
  ok("cv annualMaintenance 6,107", approx(r.annualMaintenance, 6107));
  ok("cv totalMonthlyCost 3,309", approx(r.totalMonthlyCost, 3309));
  ok("cv frontEndRatio 28%", approx(r.frontEndRatio, 28, 0.5));
  ok("cv backEndRatio 28%", approx(r.backEndRatio, 28, 0.5));
}

// ─────────────────────────────────────────────────────────────────
// 2. FHA loan — default scenario, incl. upfront premium + MIP
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordability({ ...base, dtiUnit: "fha" });
  ok("fha house 450,725", approx(r.house, 450725));
  ok("fha loan 360,580", approx(r.loan, 360580));
  ok("fha upfront premium 6,310", approx(r.upfrontFhaPremium, 6310));
  ok("fha closing 13,522", approx(r.closingCost, 13522));
  ok("fha totalOneTime 109,977", approx(r.totalOneTimeAtClosing, 109977));
  ok("fha monthlyPI 2,349", approx(r.monthlyPI, 2349));
  ok("fha MIP monthly 150", approx(r.monthlyProgramFee, 150));
  ok("fha frontEnd 31%", approx(r.frontEndRatio, 31, 0.5));
  // Displayed tax/insurance/maintenance are HOUSE-based even though the
  // SOLVE used loan-based tax/ins — a real bug caught via live
  // screenshot comparison (engine originally showed $5,409/loan-based
  // instead of the reference's actual $6,761/house-based).
  ok("fha annualTax is HOUSE-based 6,761 (not loan-based 5,409)", approx(r.annualTax, 6761));
  ok("fha annualIns is HOUSE-based 2,254", approx(r.annualIns, 2254));
  ok("fha annualMaintenance 6,761", approx(r.annualMaintenance, 6761));
  ok("fha totalMonthlyCost 3,814", approx(r.totalMonthlyCost, 3814));
}

// ─────────────────────────────────────────────────────────────────
// 3. VA loan — front-end is PURELY INFORMATIONAL (never a real
//    constraint), back-end 41% is the only real cap
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordability({ ...base, dtiUnit: "va" });
  ok("va house 555,721 (debt=0)", approx(r.house, 555721));
  ok("va loan 444,577", approx(r.loan, 444577, 2));
  ok("va funding fee 463", approx(r.monthlyProgramFee, 463));
  ok("va hides DTI rows at debt=0", r.showDtiRatios === false);
  ok("va annualTax is HOUSE-based 8,336", approx(r.annualTax, 8336));
  ok("va annualIns is HOUSE-based 2,779", approx(r.annualIns, 2779));
}
for (const [debt, house, front] of [[500, 487950, 36], [1000, 420179, 31], [2000, 284637, 21], [3000, 149096, 11]]) {
  const r = calculateHouseAffordability({ ...base, dtiUnit: "va", monthlyDebt: debt });
  ok(`va debt=${debt} house`, approx(r.house, house), r.house);
  ok(`va debt=${debt} informational front-end ${front}%`, approx(r.frontEndRatio, front, 0.5));
}

// ─────────────────────────────────────────────────────────────────
// 4. The central discovery: FHA/VA value tax/HOA/insurance against the
//    LOAN, not the house — verified across 5 tax rates each
// ─────────────────────────────────────────────────────────────────
for (const [tax, expected] of [[1.0, 473682], [1.5, 450725], [2.0, 429890], [2.5, 410897], [3.0, 393511]]) {
  const r = calculateHouseAffordability({ ...base, dtiUnit: "fha", monthlyDebt: 1000, taxValue: tax });
  ok(`fha tax=${tax}% house`, approx(r.house, expected), r.house);
}
for (const [tax, expected] of [[1.0, 440061], [1.5, 420179], [2.0, 402016], [2.5, 385358], [3.0, 370025]]) {
  const r = calculateHouseAffordability({ ...base, dtiUnit: "va", monthlyDebt: 1000, taxValue: tax });
  ok(`va tax=${tax}% house`, approx(r.house, expected), r.house);
}

// ─────────────────────────────────────────────────────────────────
// 5. Custom DTI % (10-50%) — back-end only, house-based, PMI-eligible
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordability({ ...base, dtiUnit: "30" });
  ok("custom30 house 436,186", approx(r.house, 436186));
  ok("custom30 hides DTI rows at debt=0", r.showDtiRatios === false);
}
{
  const r = calculateHouseAffordability({ ...base, dtiUnit: "30", monthlyDebt: 1000 });
  ok("custom30 debt1000 house 290,790", approx(r.house, 290790));
  ok("custom30 debt1000 shows DTI rows", r.showDtiRatios === true);
}

// ─────────────────────────────────────────────────────────────────
// 6. Program fee tiers by down payment — VA funding fee (2.15/1.5/1.25%)
//    and FHA MIP (0.55/0.5%)
// ─────────────────────────────────────────────────────────────────
for (const [down, rate] of [[3, 2.15], [4.99, 2.15], [5, 1.5], [10, 1.5], [10.5, 1.25], [20, 1.25]]) {
  const r = calculateHouseAffordability({ ...base, dtiUnit: "va", downValue: down });
  ok(`va down=${down}% funding fee rate ${rate}%`, approx(r.programFeeRate, rate, 0.01));
}
for (const [down, rate] of [[3, 0.55], [5, 0.55], [6, 0.5], [20, 0.5]]) {
  const r = calculateHouseAffordability({ ...base, dtiUnit: "fha", downValue: down });
  ok(`fha down=${down}% MIP rate ${rate}%`, approx(r.programFeeRate, rate, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// 7. Conventional PMI — added under 20% down, exactly 20% is PMI-free;
//    plus a $-mode down payment AND $-mode property tax combined
// ─────────────────────────────────────────────────────────────────
{
  const r20 = calculateHouseAffordability({ ...base, downValue: 20 });
  ok("cv 20% down has no PMI", approx(r20.monthlyPmi, 0, 0.01));
  const r1999 = calculateHouseAffordability({ ...base, downValue: 19.99 });
  ok("cv 19.99% down has PMI", r1999.monthlyPmi > 0);
}
{
  const r = calculateHouseAffordability({ ...base, downValue: 50000, downUnit: "dollar", taxValue: 500, taxUnit: "dollar" });
  ok("$-mode down+tax house 422,588", approx(r.house, 422588));
  ok("$-mode loan 372,588", approx(r.loan, 372588));
  ok("$-mode PMI 155", approx(r.monthlyPmi, 155));
  ok("$-mode annualIns (still house-based) 2,113", approx(r.annualIns, 2113));
}

// ─────────────────────────────────────────────────────────────────
// 8. Fixed-monthly-budget calculator (calc2)
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordabilityByBudget({
    monthlyBudget: 3500, loanTermYears: 30, interestRate: 6.792, downValue: 20, downUnit: "percent",
    includeFees: true, taxValue: 1.5, taxUnit: "percent", hoaValue: 0, hoaUnit: "percent",
    insValue: 0.5, insUnit: "percent", maintenanceValue: 1.5, maintenanceUnit: "percent",
  });
  ok("budget house 430,621", approx(r.house, 430621));
  ok("budget loan 344,496", approx(r.loan, 344496));
  ok("budget totalMonthlyCost = budget (3,500)", approx(r.totalMonthlyCost, 3500));
}
{
  const r = calculateHouseAffordabilityByBudget({
    monthlyBudget: 3500, loanTermYears: 30, interestRate: 6.792, downValue: 20, downUnit: "percent", includeFees: false,
  });
  ok("budget no-fees house 671,638", approx(r.house, 671638));
  ok("budget no-fees monthlyPI = budget", approx(r.monthlyPI, 3500));
}
{
  const r = calculateHouseAffordabilityByBudget({
    monthlyBudget: 3500, loanTermYears: 30, interestRate: 6.792, downValue: 10, downUnit: "percent",
    includeFees: true, taxValue: 1.5, taxUnit: "percent", hoaValue: 0, hoaUnit: "percent",
    insValue: 0.5, insUnit: "percent", maintenanceValue: 1.5, maintenanceUnit: "percent",
  });
  ok("budget PMI house 382,338", approx(r.house, 382338));
  ok("budget PMI monthly 143", approx(r.monthlyPmi, 143));
}

// ─────────────────────────────────────────────────────────────────
// 9. Input validation — 7 distinct messages for calc1, confirmed live.
//    The exact user-reported bug: a 221-year loan term was silently
//    ACCEPTED and computed a (nonsensical) result instead of being
//    rejected like the reference — the reference caps loan term at 100
//    years (confirmed at the exact 100/101 boundary) and shares the
//    same "positive loan term" message for both out-of-range directions.
// ─────────────────────────────────────────────────────────────────
{
  const reportedBug = { annualIncome: 20101, loanTermYears: 221, interestRate: 30, monthlyDebt: 84, downValue: 2, taxValue: 9, hoaValue: 3, insValue: 9 };
  ok("reported bug: 221yr term now rejected", validateHouseAffordabilityInputs(reportedBug) === "Please provide a positive loan term value.");
}
ok("term=100 is valid (boundary)", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 100, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1 }) === null);
ok("term=101 rejected (boundary)", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 101, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1 }) === "Please provide a positive loan term value.");
ok("term=0 rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 0, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1 }) === "Please provide a positive loan term value.");
ok("negative income rejected", validateHouseAffordabilityInputs({ annualIncome: -1, loanTermYears: 30, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1 }) === "Please provide a positive income value.");
ok("negative rate rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 30, interestRate: -1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1 }) === "Please provide a positive interest rate value.");
ok("negative debt rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 30, interestRate: 1, monthlyDebt: -1, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1 }) === "Please provide a positive monthly debt payback amount value.");
ok("negative down rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 30, interestRate: 1, monthlyDebt: 0, downValue: -1, taxValue: 1, hoaValue: 1, insValue: 1 }) === "Please provide a positive down payment value.");
ok("negative tax rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 30, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: -1, hoaValue: 1, insValue: 1 }) === "Please provide a positive property tax value.");
ok("negative HOA rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 30, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: -1, insValue: 1 }) === "Please provide a positive HOA or Co-op fee value.");
ok("negative insurance rejected", validateHouseAffordabilityInputs({ annualIncome: 1, loanTermYears: 30, interestRate: 1, monthlyDebt: 0, downValue: 1, taxValue: 1, hoaValue: 1, insValue: -1 }) === "Please provide a positive insurance value.");
ok("valid default passes", validateHouseAffordabilityInputs(base) === null);

// calc2's own analogous validation set
ok("calc2 negative budget rejected", validateBudgetInputs({ monthlyBudget: -1, loanTermYears: 30, interestRate: 1, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1, maintenanceValue: 1 }) === "Please provide a positive monthly budget value.");
ok("calc2 term=150 rejected", validateBudgetInputs({ monthlyBudget: 100, loanTermYears: 150, interestRate: 1, downValue: 1, taxValue: 1, hoaValue: 1, insValue: 1, maintenanceValue: 1 }) === "Please provide a positive loan term value.");
ok("calc2 negative down rejected", validateBudgetInputs({ monthlyBudget: 100, loanTermYears: 30, interestRate: 1, downValue: -1, taxValue: 1, hoaValue: 1, insValue: 1, maintenanceValue: 1 }) === "Please provide a positive down payment value.");

// ─────────────────────────────────────────────────────────────────
// 10. "No affordable house purchase scenario" — shown instead of a
//     nonsensical/negative breakdown when the target leaves no room
//     (confirmed live with annualIncome=0)
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordability({ ...base, annualIncome: 0 });
  ok("zero income -> unaffordable flag", r.unaffordable === true);
  ok("unaffordable message matches reference wording", r.unaffordableMessage === "Unfortunately, the information provided did not allow for an affordable house purchase scenario. The debt obligations and the housing costs exceed the recommended ratio of gross income.");
}

// ─────────────────────────────────────────────────────────────────
// 11. Down payment >=100% (percent mode) is silently reinterpreted as
//     a flat dollar amount, with a non-blocking informational note —
//     confirmed live at the exact 99.99%/100% boundary. Also confirmed:
//     the resulting note uses the ACTUAL/effective down %, not the raw
//     typed number (a 101 "percent" input still triggers the separate
//     "under 5%" note once reinterpreted as a tiny $101 down payment).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateHouseAffordability({ ...base, downValue: 101, downUnit: "percent" });
  ok("down>=100% treated as dollar", r.downTreatedAsDollar === true);
  ok("down>=100% house 325,767", approx(r.house, 325767));
  ok("down>=100% down payment = $101 flat", approx(r.downPayment, 101, 0.5));
  ok("down>=100% still gets the <5%-down note too", r.ruleNote.includes("Very few lenders"));
}
{
  const r = calculateHouseAffordability({ ...base, downValue: 0 });
  ok("down=0% gets the <5%-down note", r.ruleNote.includes("Very few lenders"));
}
{
  const r = calculateHouseAffordability({ ...base, downValue: 5 });
  ok("down=5% exactly does NOT get the <5%-down note", !r.ruleNote || !r.ruleNote.includes("Very few lenders"));
}

console.log(`\nHouse Affordability Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
