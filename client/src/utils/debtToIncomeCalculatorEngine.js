// Debt-to-Income (DTI) Ratio Calculator engine — matches
// calculator.net/debt-ratio-calculator.html (a GET form, decoded with live
// probes; see scripts/debt-to-income-calculator.test.js).
//
// Every amount is per month or per year; all are converted to monthly.
// Back-end DTI = all debts ÷ income, front-end DTI = housing costs (rent,
// mortgage, property tax, HOA, homeowner insurance) ÷ income, both shown as
// whole percents (half-up). Verdict on the unrounded ratio: below 35% good
// (green), below 50% mid-range (amber), otherwise high (red); the gauge and
// the income pie are drawn only up to 100%.
//
// House affordability (28/36 rule, other debts = everything but housing):
//   new house  = min(28% × income, 36% × income − other debts)
//   keep mortgage = the same less the existing mortgage, property tax, HOA
//                   and insurance (shown only when a mortgage is entered)
// (with no budget left: "…you will not qualify for a conventional mortgage
// loan."), converted to a house price assuming a 30-year loan at the reference's
// published 7.457% with 20% down and 2%/yr for property tax and insurance.
//
// Validation, confirmed live: salary must be a number ≥ 0 and filled in;
// every other box may be blank (0) but must otherwise be a number ≥ 0;
// all problems are listed, then "income is more than 0".

import { clean, num, formatFixed } from "./marginCalculatorEngine.js";

export const MORTGAGE_RATE = 7.457;

export const INCOME_FIELDS = [
  { key: "salary", label: "Salary & Earned Income", unit: "y", error: "Please provide a positive salary & earned income value." },
  { key: "pension", label: "Pension & Social Security", unit: "y", error: "Pension & social security need to be numeric." },
  { key: "investment", label: "Investment & Savings", unit: "y", hint: "interest, capital gain, dividend, rental income...", error: "Investment & savings need to be numeric." },
  { key: "otherIncome", label: "Other Income", unit: "y", hint: "gift, alimony, child support ...", error: "Other income need to be numeric." },
];

export const DEBT_FIELDS = [
  { key: "rental", label: "Rental Cost", unit: "m", housing: true, error: "Rental cost need to be numeric." },
  { key: "mortgage", label: "Mortgage", unit: "m", housing: true, error: "Mortgage need to be numeric." },
  { key: "propertyTax", label: "Property Tax", unit: "y", housing: true, error: "Property tax need to be numeric." },
  { key: "hoa", label: "HOA Fees", unit: "m", housing: true, error: "HOA fees need to be numeric." },
  { key: "insurance", label: "Homeowner Insurance", unit: "y", housing: true, error: "Homeowner insurance need to be numeric." },
  { key: "creditCards", label: "Credit Cards", unit: "m", error: "Credit cards need to be numeric." },
  { key: "studentLoan", label: "Student Loan", unit: "m", error: "Student loan need to be numeric." },
  { key: "autoLoan", label: "Auto Loan", unit: "m", error: "Auto loan need to be numeric." },
  { key: "otherLoans", label: "Other Loans and Liabilities", unit: "m", hint: "personal loan, child support. alimony, etc.", error: "Other loans and liabilities need to be numeric." },
];

export const DTI_DEFAULTS = {
  salary: "60000", pension: "0", investment: "0", otherIncome: "0",
  rental: "1200", mortgage: "0", propertyTax: "0", hoa: "0", insurance: "0",
  creditCards: "200", studentLoan: "0", autoLoan: "250", otherLoans: "0",
};

const money0 = (v) => `$${formatFixed(v, 0)}`;

/** House price a monthly budget buys: 30 years at MORTGAGE_RATE, 20% down, 2%/yr tax + insurance. */
export function houseValueFor(monthly) {
  const i = MORTGAGE_RATE / 1200;
  const factor = i / (1 - Math.pow(1 + i, -360));
  return monthly / (0.8 * factor + 0.02 / 12);
}

/**
 * @param {{ values: Record<string,string>, units: Record<string,"m"|"y"> }} input
 */
export function calculateDebtToIncome({ values, units }) {
  const errors = [];
  const monthly = {};
  for (const f of [...INCOME_FIELDS, ...DEBT_FIELDS]) {
    const text = clean(values[f.key]);
    const v = text === "" && f.key !== "salary" ? 0 : num(text);
    if (!(v >= 0)) { errors.push(f.error); continue; }
    monthly[f.key] = (units[f.key] || f.unit) === "y" ? v / 12 : v;
  }
  if (errors.length) return { errors };

  const income = INCOME_FIELDS.reduce((s, f) => s + monthly[f.key], 0);
  if (!(income > 0)) return { errors: ["Please make sure that income is more than 0."] };
  const housing = DEBT_FIELDS.filter((f) => f.housing).reduce((s, f) => s + monthly[f.key], 0);
  const other = DEBT_FIELDS.filter((f) => !f.housing).reduce((s, f) => s + monthly[f.key], 0);
  const debt = housing + other;
  const ratio = (debt / income) * 100;

  const level = ratio < 35 ? "good" : ratio < 50 ? "mid" : "high";
  const result = {
    ratio,
    ratioText: `${formatFixed(ratio, 0)}%`,
    level,
    message: {
      good: "Your DTI ratio is good.",
      mid: "Your DTI ratio is in the mid-range. While it is not considered low, certain actions can be taken to lower it.",
      high: "Your DTI ratio is high, and may put you in more financially-risky situations. We recommend taking actions to lower it.",
    }[level],
    showGauge: ratio <= 100,
    rows: [
      ["Back-End DTI Ratio:", `${formatFixed(ratio, 0)}%`],
      ["Front-End DTI Ratio:", `${formatFixed((housing / income) * 100, 0)}%`],
      ["Total Income:", `${money0(income * 12)} / year or`, `${money0(income)} / month`],
      ["Total Debt:", `${money0(debt * 12)} / year or`, `${money0(debt)} / month`],
    ],
    pie: null,
    affordability: null,
  };

  if (debt > 0 && ratio <= 100) {
    result.pie = [
      { label: "House Debts/Expenses", value: housing, color: "#2b7ddb" },
      { label: "Other Debts/Expenses", value: other, color: "#8bbc21" },
      { label: "Remainings", value: income - debt, color: "#910000" },
    ].filter((s) => s.value > 0).map((s) => ({ ...s, percent: Math.round((s.value / income) * 100) }));
  }

  const budget = Math.min(0.28 * income, 0.36 * income - other);
  if (budget > 0) {
    const halted = monthly.rental > 0 || monthly.mortgage > 0;
    const sentences = [
      `If you live in the U.S. and have plans to purchase a house${halted ? " after halted payments towards preexisting rent and mortgage" : ""}, you can spend up to ${money0(budget)} per month on the new house, which is equivalent to a house valued up to ${money0(houseValueFor(budget))}.*`,
    ];
    if (monthly.mortgage > 0) {
      const kept = budget - (monthly.mortgage + monthly.propertyTax + monthly.hoa + monthly.insurance);
      sentences.push(kept > 0
        ? `If you plan to keep your existing mortgage loan, you can spend up to ${money0(kept)} per month on the new house, which is equivalent to one valued up to ${money0(houseValueFor(kept))}.*`
        : "However, you will not qualify for a conventional mortgage loan without halting your existing mortgage.");
    }
    result.affordability = sentences.join(" ");
    result.affordabilityNote = true;
  } else {
    result.affordability = "If you live in the U.S., with your current income and debt level, you will not qualify for a conventional mortgage loan.";
    result.affordabilityNote = false;
  }
  return result;
}
