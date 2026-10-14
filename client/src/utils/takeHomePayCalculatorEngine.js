// Take-Home-Paycheck Calculator engine — matches
// calculator.net/take-home-pay-calculator.html (a GET form, decoded with
// live probes; see scripts/take-home-pay-calculator.test.js). Tax-year
// figures live in takeHomePayTaxParams2026.js.
//
// How the reference computes the annual federal withholding, all confirmed
// live:
//  • Taxable = salary − pretax deductions − the employee's Social Security
//    and Medicare (the full SE rates when self-employed) + other income −
//    max(standard, itemized) − deductions not withheld − tips − overtime −
//    vehicle-loan interest − charity gifts − senior deduction, then the
//    2026 brackets. Married Filing Separately ignores itemized deductions.
//  • Credits: $2,200 per child, $500 per other dependent (fractions used as
//    entered), all-or-nothing: none once salary + other income + other jobs
//    exceeds $200,000 ($400,000 joint). They also offset the extra
//    multiple-jobs withholding; the total never goes below $0.
//  • One Big Beautiful Bill deductions are all-or-nothing below a cutoff
//    measured on salary + other income — or salary + Income #2 + #3 when
//    other jobs are entered (other income then ignored): tips (cap $25,000)
//    and overtime (no cap of its own) below $150k/$300k joint; vehicle loan
//    interest (no cap of its own) below $100k/$200k; senior $6,000 per "yes"
//    (spouse counts only when joint) below $75k/$150k. Charity gifts: cap
//    $1,000/$2,000 joint, none when itemizing. Reference quirk kept: when the
//    tips entered exceed the overtime cap ($12,500/$25,000 joint), any
//    overtime entered becomes that cap; when tips exceed $10,000, any loan
//    interest entered becomes $10,000.
//  • Other jobs: the IRS Form W-4 Multiple Jobs Worksheet (highest two jobs,
//    then their sum against the third), divided by the pay periods.
//  • Paycheck rows are annual ÷ periods (Daily 260 … Annually 1); the final
//    pay check is computed before rounding. State and city tax = salary ×
//    rate. Additional Medicare 0.9% above $200k/$250k joint, from $0 for
//    Married Filing Separately.

import { clean, num, formatFixed, formatMoney } from "./marginCalculatorEngine.js";
import {
  TAX_YEAR, BRACKETS, STANDARD_DEDUCTION, SOCIAL_SECURITY_WAGE_BASE, ADDITIONAL_MEDICARE_THRESHOLD,
  CHILD_CREDIT, OTHER_DEPENDENT_CREDIT, OBBB, W4_TABLES,
} from "./takeHomePayTaxParams2026.js";

export { TAX_YEAR, BRACKETS, STANDARD_DEDUCTION };

export const PAY_FREQUENCIES = [
  { value: "Daily", label: "Daily", periods: 260, note: "based on 260 working days per year" },
  { value: "Weekly", label: "Weekly", periods: 52, note: "based on 52 weeks per year" },
  { value: "Bi-weekly", label: "Bi-weekly", periods: 26, note: "based on 52 weeks per year" },
  { value: "Semi-monthly", label: "Semi-monthly", periods: 24 },
  { value: "Monthly", label: "Monthly", periods: 12 },
  { value: "Quarterly", label: "Quarterly", periods: 4 },
  { value: "Semi-Annually", label: "Semi-Annually", periods: 2 },
  { value: "Annual", label: "Annually", periods: 1 },
];

export const FILING_STATUSES = [
  { value: "Single", label: "Single" },
  { value: "MarriedJoint", label: "Filing Jointly or Qualified Widow" },
  { value: "MarriedSeparately", label: "Married Filing Separately" },
  { value: "HeadofHousehold", label: "Head of Household" },
];

export const TAKE_HOME_DEFAULTS = {
  salary: "80000", payFrequency: "Bi-weekly", filingStatus: "Single", children: "0", otherDependents: "0",
  otherIncome: "0", pretaxDeductions: "6000", deductionsNotWithheld: "0", itemizedDeductions: "0",
  hasOtherJobs: false, job2: "0", job3: "0", stateRate: "0", cityRate: "0", age65: false, spouse65: false,
  tips: "0", overtime: "0", vehicleLoanInterest: "0", charityGifts: "0", selfEmployed: false,
};

/** Numeric inputs in the reference's validation order; blank means 0 except for the salary. */
const FIELDS = [
  ["salary", "Please provide a positive annual income value."],
  ["children", "Please provide a positive number of children under age 17."],
  ["otherDependents", "Please provide a positive number of other dependents."],
  ["otherIncome", "Please provide a positive other income (not from jobs) value."],
  ["pretaxDeductions", "Please provide a positive pretax deductions withheld value."],
  ["deductionsNotWithheld", "Please provide a positive deductions not withheld value."],
  ["itemizedDeductions", "Please provide a positive itemized deductions value."],
  ["job2", "Please provide a positive Income #2 value.", "jobs"],
  ["job3", "Please provide a positive Income #3 value.", "jobs"],
  ["stateRate", "Please provide a positive state tax rate value."],
  ["cityRate", "Please provide a positive city tax rate value."],
  ["tips", "Please provide a positive qualified tips value."],
  ["overtime", "Please provide a positive qualified overtime compensation value."],
  ["vehicleLoanInterest", "Please provide a positive qualified passenger vehicle loan interest value."],
  ["charityGifts", "Please provide a positive cash gifts to charities value."],
];

export function bracketTax(status, taxable) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of BRACKETS[status]) {
    if (taxable > lower) tax += (Math.min(taxable, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

function marginalRate(status, taxable) {
  let lower = 0;
  for (const [upper, rate] of BRACKETS[status]) {
    if (taxable > lower && taxable <= upper) return rate;
    lower = upper;
  }
  return 0;
}

/** Form W-4 Multiple Jobs Worksheet table value for a pair of annual wages. */
export function multipleJobsAmount(status, higher, lower) {
  const table = W4_TABLES[status];
  let row = 0;
  while (row + 1 < table.rows.length && higher >= table.rows[row + 1]) row++;
  return table.values[row][Math.min(11, Math.floor(lower / 10000))];
}

const whole$ = (v) => `$${formatFixed(v, 0)}`;

export function calculateTakeHomePay(input) {
  const status = BRACKETS[input.filingStatus] ? input.filingStatus : "Single";
  const frequency = PAY_FREQUENCIES.find((f) => f.value === input.payFrequency) || PAY_FREQUENCIES[2];
  const hasJobs = Boolean(input.hasOtherJobs);
  const joint = status === "MarriedJoint";
  const pick = (pair) => (joint ? pair.joint : pair.other);

  const v = {};
  const errors = [];
  for (const [key, message, scope] of FIELDS) {
    if (scope === "jobs" && !hasJobs) { v[key] = 0; continue; }
    const text = clean(input[key]);
    const value = text === "" && key !== "salary" ? 0 : num(text);
    if (!(value >= 0)) errors.push(message);
    v[key] = value;
  }
  if (errors.length) return { errors };
  if (hasJobs && !(v.job2 > 0) && !(v.job3 > 0)) return { errors: ["Please provide a 2nd, 3rd, or spouse income value."] };

  const P = frequency.periods;
  const wage = v.salary;
  const self = Boolean(input.selfEmployed);
  const socialSecurity = Math.min(wage, SOCIAL_SECURITY_WAGE_BASE) * (self ? 0.124 : 0.062);
  const medicare = wage * (self ? 0.029 : 0.0145) + Math.max(0, wage - ADDITIONAL_MEDICARE_THRESHOLD[status]) * 0.009;

  // Deductions.
  const measure = hasJobs ? wage + v.job2 + v.job3 : wage + v.otherIncome;
  const std = STANDARD_DEDUCTION[status];
  const itemized = status === "MarriedSeparately" ? 0 : v.itemizedDeductions;
  const itemizing = itemized > std;
  const tipsOk = measure < pick(OBBB.cutoff.tipsAndOvertime);
  const overtimeCap = pick(OBBB.overtimeCap);
  let overtime = v.overtime;
  if (overtime > 0 && v.tips > overtimeCap) overtime = overtimeCap;
  let loan = v.vehicleLoanInterest;
  if (loan > 0 && v.tips > OBBB.vehicleLoanCap) loan = OBBB.vehicleLoanCap;
  const seniors = (input.age65 ? 1 : 0) + (joint && input.spouse65 ? 1 : 0);
  const senior = measure < pick(OBBB.cutoff.senior) ? OBBB.seniorDeduction * seniors : 0;
  const extraDeductions = v.deductionsNotWithheld
    + (tipsOk ? Math.min(OBBB.tipsCap, v.tips) + overtime : 0)
    + (measure < pick(OBBB.cutoff.vehicleLoan) ? loan : 0)
    + (itemizing ? 0 : Math.min(pick(OBBB.charityCap), v.charityGifts))
    + senior;

  const taxableBeforeOther = wage - v.pretaxDeductions - socialSecurity - medicare - Math.max(std, itemized) - extraDeductions;
  const taxable = taxableBeforeOther + v.otherIncome;
  const creditIncome = wage + v.otherIncome + v.job2 + v.job3;
  const children = creditIncome > pick(OBBB.cutoff.credits) ? 0 : v.children * CHILD_CREDIT;
  const others = creditIncome > pick(OBBB.cutoff.credits) ? 0 : v.otherDependents * OTHER_DEPENDENT_CREDIT;

  // Other jobs: Form W-4 Multiple Jobs Worksheet.
  let jobsExtra = 0;
  if (hasJobs) {
    const jobs = [wage, v.job2, v.job3].filter((x) => x > 0).sort((a, b) => b - a);
    if (jobs.length >= 2) jobsExtra = multipleJobsAmount(status, jobs[0], jobs[1]);
    if (jobs.length >= 3) jobsExtra += multipleJobsAmount(status, jobs[0] + jobs[1], jobs[2]);
  }
  const federal = Math.max(0, bracketTax(status, Math.max(0, taxable)) - children - others + jobsExtra);

  const per = {
    gross: wage / P,
    federal: federal / P,
    socialSecurity: socialSecurity / P,
    medicare: medicare / P,
    state: (wage * v.stateRate) / 100 / P,
    city: (wage * v.cityRate) / 100 / P,
    withheld: v.pretaxDeductions / P,
  };
  const final = per.gross - per.federal - per.socialSecurity - per.medicare - per.state - per.city - per.withheld;

  const result = {
    title: `${TAX_YEAR} ${frequency.value} Paycheck Based on Income of ${whole$(wage)}/year.`,
    rows: [
      { label: "Gross Pay", value: formatMoney(per.gross) },
      { label: "Federal Income Tax", value: formatMoney(per.federal) },
      { label: "Social Security Tax", value: formatMoney(per.socialSecurity) },
      { label: "Medicare Tax", value: formatMoney(per.medicare) },
      { label: "State Income Tax", value: formatMoney(per.state) },
      { label: "City Income Tax", value: formatMoney(per.city) },
      { label: "Deductions withheld", value: formatMoney(per.withheld) },
      { label: "Final Pay Check", value: formatMoney(final), strong: true },
    ],
    note: frequency.note || null,
    w4: null,
  };
  if (self) return result;

  // W-4 guidance. Step 4(b) = itemized excess over the standard deduction + every extra deduction.
  const highest = wage >= v.job2;
  const step4b = (itemizing ? itemized - std : 0) + extraDeductions;
  const perPeriodExtra = jobsExtra / P;
  const step3 = { children: whole$(children), others: whole$(others), total: whole$(children + others) };
  const zeroStep3 = { children: "$0", others: "$0", total: "$0" };
  const quarterly = highest
    ? Math.min(v.otherIncome * marginalRate(status, taxable) + jobsExtra, federal) / 4
    : jobsExtra / 4;
  const showPrivacy = Math.round(quarterly) > 0;
  result.w4 = highest
    ? {
      highest: true,
      main: { step3, a: whole$(v.otherIncome), b: whole$(step4b), c: formatMoney(perPeriodExtra) },
      privacy: showPrivacy ? { quarterly: whole$(quarterly), step3, a: "$0", b: whole$(step4b), c: "$0" } : null,
    }
    : {
      highest: false,
      main: { step3: zeroStep3, a: "$0", b: "$0", c: formatMoney(perPeriodExtra) },
      privacy: showPrivacy ? { quarterly: whole$(quarterly) } : null,
    };
  return result;
}
