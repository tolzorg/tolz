// Budget Calculator engine — matches calculator.net/budget-calculator.html
// (a GET form, decoded with live probes; see scripts/budget-calculator.test.js).
//
// Every amount is annualized (month × 12). After-tax income = gross income ×
// (1 − tax rate). Expenses roll up into 8 categories; 401k/IRA and college
// saving are pre-tax contributions, so they count × (1 − tax rate) toward
// "Savings & Investments". Net = after-tax income − total expenses.
//
// Rules confirmed live:
// - A blank box counts as 0; commas and surrounding spaces are ignored;
//   anything non-numeric or negative lists "<label> need to be numeric." in
//   form order. The tax rate has no upper bound (150% gives a negative
//   after-tax income).
// - A 0% tax rate merges the income rows into one "Total Income" row.
// - Only the summary is shown when after-tax income ≤ 0. The DTI table
//   appears only when there are loan payments (mortgage, auto, credit card,
//   student or other loans); rent alone doesn't trigger it.
// - The pie skips zero slices and hands out its palette in order to the
//   slices that remain.
// - DTI = (mortgage + rent + property tax + home insurance + HOA + auto loan +
//   student loan + credit card + other loans) ÷ gross income; front-end DTI
//   uses the housing items only. Verdict on the raw ratio: < 35% good, < 50%
//   OK, otherwise very high.
// - Breakdown "% of income" is of after-tax income, with the whole cell
//   blank up to 0.01%. "Mortgage and auto loan included" needs one of
//   them; "tax adjusted" needs a tax rate and a 401k/IRA or college amount;
//   savings below 15% adds a red "recommend 15% or higher".

import { clean, num, formatFixed } from "./marginCalculatorEngine.js";

const f = (key, label, error, value, unit, hint) => ({ key, label, error, value, unit, hint });

export const INCOME_FIELDS = [
  f("salary", "Salary & Earned Income", "Salary & earned income", "80000", "y"),
  f("pension", "Pension & Social Security", "Pension & social security", "0", "y"),
  f("investment", "Investments & Savings", "Investments & savings", "1000", "y", "interest, capital gain, dividend, rental income..."),
  f("otherincome", "Other Income", "Other income", "2000", "y", "gift, alimony, child support, tax return..."),
];
export const TAX_FIELD = f("taxrate", "Income Tax Rate", "Income tax rate", "28", null, "federal + state + local");

export const EXPENSE_SECTIONS = [
  { title: "Housing & Utilities", fields: [
    f("mortgage", "Mortgage", "Mortgage", "0", "m"),
    f("propertytax", "Property Tax", "Property tax", "0", "y"),
    f("rental", "Rental", "Rental", "1400", "m"),
    f("houseinsurance", "Insurance", "Housing insurance", "200", "y", "home owner, renters, home warranty, etc."),
    f("hoafee", "HOA/Co-Op Fee", "HOA or Co-Op", "0", "y"),
    f("homemaintenance", "Home Maintenance", "Home maintenance", "0", "m", "repair, landscape, cleaning, furniture, appliance..."),
    f("utilities", "Utilities", "Utilities", "250", "m", "electricity, gas, water, phone, cable, heating..."),
  ] },
  { title: "Transportation", fields: [
    f("autoloan", "Auto Loan", "Auto loan", "250", "m"),
    f("autoinsurance", "Auto Insurance", "Auto insurance", "700", "y"),
    f("gasoline", "Gasoline", "Gasoline", "100", "m"),
    f("automaintenance", "Auto Maintenance", "Auto maintenance", "600", "y"),
    f("parkingtoll", "Parking/Tolls", "Parking or toll", "20", "m"),
    f("othertransportation", "Other Transportation Costs", "Other transportation", "0", "m", "ticket, taxi, registration, etc."),
  ] },
  { title: "Other Debt & Loan Payments", fields: [
    f("creditcard", "Credit Card", "Recurring credit card payments", "0", "m", "the recurring part to payback balance only"),
    f("studentloan", "Student Loan", "Student loan and liability", "250", "m"),
    f("otherloan", "Other Loans & Liabilities", "Other loans & liabilities", "0", "m", "personal loan, store card, etc."),
  ] },
  { title: "Living Expenses", fields: [
    f("food", "Food", "Food", "400", "m"),
    f("clothing", "Clothing", "Clothing", "100", "m"),
    f("grocery", "Household Supplies", "Household supplies items", "100", "m"),
    f("mealout", "Meals Out", "Meals out", "200", "m"),
    f("otherliving", "Other", "Other living expenses", "200", "m", "laundry, barber, beauty, alcohol, tobacco, etc."),
  ] },
  { title: "Healthcare", fields: [
    f("medicalinsurance", "Medical Insurance", "Medical insurance", "0", "m"),
    f("medicalspending", "Medical Spending", "Medical spending", "200", "m", "copay, uncovered doctor visit or drugs, etc."),
  ] },
  { title: "Children & Education", fields: [
    f("childcare", "Child & Personal Care", "Child & personal care", "0", "m"),
    f("tuition", "Tuition & Supplies", "Tuition", "0", "m"),
    f("childsupport", "Child Support Payments", "Child support payments", "0", "m"),
    f("othereducation", "Other Spending", "Other children & education spending", "100", "m", "book, software, magazine, device, etc."),
  ] },
  { title: "Savings & Investments", fields: [
    f("ira401k", "401k & IRA", "401k & IRA", "10000", "y", "before tax contribution"),
    f("collegesaving", "College Saving", "College saving", "0", "y", "before tax contribution"),
    f("stockbond", "Investments", "Investments", "0", "y", "stock, bond, funds, real estate, etc."),
    f("othersavings", "Emergency Fund & Other", "Emergency fund & other savings", "0", "m", "savings, CD, house or major purchase, etc."),
  ] },
  { title: "Miscellaneous Expenses", fields: [
    f("pet", "Pet", "Pet spendings", "200", "m"),
    f("giftdonation", "Gifts & Donations", "Gifts & donations", "300", "y"),
    f("hobbiesport", "Hobbies & Sports", "Hobbies & sports", "100", "m", "Including tickets, gym membership, etc."),
    f("entertainment", "Entertainment & Tickets", "Entertainment", "100", "m"),
    f("vacation", "Travel & Vacation", "Travel and vacation", "2000", "y"),
    f("allother", "Other Expenses", "All other miscellaneous spendings", "100", "m"),
  ] },
];

export const AMOUNT_FIELDS = [...INCOME_FIELDS, ...EXPENSE_SECTIONS.flatMap((s) => s.fields)];
export const ALL_FIELDS = [...INCOME_FIELDS, TAX_FIELD, ...EXPENSE_SECTIONS.flatMap((s) => s.fields)];
export const BUDGET_DEFAULTS = Object.fromEntries(ALL_FIELDS.map((x) => [x.key, x.value]));
export const BUDGET_DEFAULT_UNITS = Object.fromEntries(AMOUNT_FIELDS.map((x) => [x.key, x.unit]));

export const PIE_COLORS = ["#2b7ddb", "#8bbc21", "#910000", "#1aadce", "#492970", "#c21271", "#827e1c", "#2c852c"];

/** Whole dollars, "$-80" for negatives. */
export function formatDollars(value) {
  const text = formatFixed(Math.abs(value), 0);
  return value < 0 && text !== "0" ? `$-${text}` : `$${text}`;
}

const DTI_MESSAGES = {
  good: "Your DTI ratio is good.",
  ok: "Your DTI ratio is OK with room for improvement. Consider taking actions to improve it.",
  high: "Your DTI ratio is very high, and may put you in more financially-risky situations. We recommend taking actions to lower it.",
};

/**
 * @param {{ values: Record<string,string>, units: Record<string,"m"|"y"> }} input
 */
export function calculateBudget({ values, units = BUDGET_DEFAULT_UNITS }) {
  const errors = [];
  const raw = {};
  for (const field of ALL_FIELDS) {
    const text = clean(values[field.key]);
    const n = text === "" ? 0 : num(text);
    if (!Number.isFinite(n) || n < 0) errors.push(`${field.error} need to be numeric.`);
    raw[field.key] = n;
  }
  if (errors.length) return { errors };

  const a = {};
  for (const field of AMOUNT_FIELDS) a[field.key] = raw[field.key] * ((units[field.key] || field.unit) === "m" ? 12 : 1);
  const sum = (...keys) => keys.reduce((s, k) => s + a[k], 0);
  const keep = 1 - raw.taxrate / 100;

  const gross = sum("salary", "pension", "investment", "otherincome");
  const afterTax = gross * keep;
  const housingCore = sum("mortgage", "rental", "propertytax", "houseinsurance", "hoafee");
  const categories = [
    ["Housing & Utilities", housingCore + sum("homemaintenance", "utilities")],
    ["Transportation", sum("autoloan", "autoinsurance", "gasoline", "automaintenance", "parkingtoll", "othertransportation")],
    ["Other Debt & Loan Payments", sum("creditcard", "studentloan", "otherloan")],
    ["Living Expenses", sum("food", "clothing", "grocery", "mealout", "otherliving")],
    ["Healthcare", sum("medicalinsurance", "medicalspending")],
    ["Children & Education", sum("childcare", "tuition", "childsupport", "othereducation")],
    ["Savings & Investments", sum("ira401k", "collegesaving") * keep + sum("stockbond", "othersavings")],
    ["Miscellaneous Expenses", sum("pet", "giftdonation", "hobbiesport", "entertainment", "vacation", "allother")],
  ];
  const total = categories.reduce((s, [, v]) => s + v, 0);
  const net = afterTax - total;

  const pair = (v) => [formatDollars(v), formatDollars(v / 12)];
  const result = {
    summary: [
      ...(raw.taxrate === 0
        ? [["Total Income", ...pair(gross)]]
        : [["Total Before Tax Income", ...pair(gross)], ["Total After Tax Income", ...pair(afterTax)]]),
      ["Total Expenses", ...pair(total)],
    ],
    net: { label: net < 0 ? "Net (Deficit)" : "Net (Discretionary Income)", values: pair(net), good: net >= 0 },
    dti: null,
    pie: null,
    breakdown: null,
  };
  if (!(afterTax > 0)) return result;

  const loans = sum("mortgage", "autoloan", "creditcard", "studentloan", "otherloan");
  const dti = ((housingCore + sum("autoloan", "studentloan", "creditcard", "otherloan")) / gross) * 100;
  if (loans > 0) {
    result.dti = {
      ratio: `${formatFixed(dti, 2)}%`,
      message: DTI_MESSAGES[dti < 35 ? "good" : dti < 50 ? "ok" : "high"],
      frontEnd: `${formatFixed((housingCore / gross) * 100, 2)}%`,
    };
  }

  if (total > 0) {
    let c = 0;
    result.pie = categories.filter(([, v]) => v > 0).map(([label, value]) => ({
      label, value, color: PIE_COLORS[c++], percent: formatFixed((value / total) * 100, 0),
    }));
  }

  const value = Object.fromEntries(categories);
  // The whole third cell stays blank unless the share is above 0.01%.
  const row = (label, v, notes = []) => {
    const pct = (v / afterTax) * 100;
    const blank = pct <= 0.01;
    return { label, annual: formatDollars(v), monthly: formatDollars(v / 12), percent: blank ? null : `${formatFixed(pct, 2)}% of income`, notes: blank ? [] : notes.filter(Boolean) };
  };
  const savingsPct = (value["Savings & Investments"] / afterTax) * 100;
  result.breakdown = [
    row("Housing & Utilities", value["Housing & Utilities"]),
    row("Transportation", value.Transportation),
    row("Living Expenses", value["Living Expenses"]),
    row("Food & Meals Out", sum("food", "mealout"), [{ text: "Part of the living expense" }]),
    row("Debt & Loan Payments", loans, [sum("mortgage", "autoloan") > 0 && { text: "Mortgage and auto loan included" }]),
    row("Healthcare", value.Healthcare),
    row("Children & Education", value["Children & Education"]),
    row("Savings & Investments", value["Savings & Investments"], [
      raw.taxrate > 0 && sum("ira401k", "collegesaving") > 0 && { text: "401k, IRA, and college saving tax adjusted" },
      savingsPct < 15 && { text: "recommend 15% or higher", warn: true },
    ]),
    row("Miscellaneous Expenses", value["Miscellaneous Expenses"]),
  ];
  return result;
}
