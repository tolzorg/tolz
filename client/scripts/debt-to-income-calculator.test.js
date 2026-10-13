// Plain-Node test suite for the Debt-to-Income Ratio Calculator engine.
// Run with:
//   node scripts/debt-to-income-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/debt-ratio-calculator.html) via plain GET requests. A
// scratch comparator also diffed 11 hand-picked cases and 600 random
// scenarios (ratio, colour, gauge position and label, verdict, table, pie,
// house-affordability sentences, errors): all identical.

import { calculateDebtToIncome, DTI_DEFAULTS, INCOME_FIELDS, DEBT_FIELDS } from "../src/utils/debtToIncomeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const UNITS = Object.fromEntries([...INCOME_FIELDS, ...DEBT_FIELDS].map((f) => [f.key, f.unit]));
const run = (v = {}, u = {}) => calculateDebtToIncome({ values: { ...DTI_DEFAULTS, ...v }, units: { ...UNITS, ...u } });
const table = (r) => r.rows.map((x) => x.slice(1).join(" ")).join(" | ");
const pie = (r) => (r.pie ? r.pie.map((s) => `${s.label} ${s.value.toFixed(2)} ${s.percent}%`).join(", ") : "none");
const debts0 = { rental: "0", autoLoan: "0", creditCards: "0" };

// ── Screenshot ──
{
  const r = run();
  eq("ratio", `${r.ratioText} ${r.level}`, "33% good");
  eq("message", r.message, "Your DTI ratio is good.");
  eq("table", table(r), "33% | 24% | $60,000 / year or $5,000 / month | $19,800 / year or $1,650 / month");
  eq("pie", pie(r), "House Debts/Expenses 1200.00 24%, Other Debts/Expenses 450.00 9%, Remainings 3350.00 67%");
  eq("affordability", r.affordability, "If you live in the U.S. and have plans to purchase a house after halted payments towards preexisting rent and mortgage, you can spend up to $1,350 per month on the new house, which is equivalent to a house valued up to $186,545.*");
}

// ── Verdict thresholds use the unrounded ratio ──
const at = (pct) => run({ ...debts0, creditCards: String(pct * 50) });
eq("34.99% is still good (shows 35%)", `${at(34.99).ratioText} ${at(34.99).level}`, "35% good");
eq("35% mid-range", at(35).level, "mid");
eq("49.99% mid-range (shows 50%)", `${at(49.99).ratioText} ${at(49.99).level}`, "50% mid");
eq("50% high", at(50).level, "high");
eq("gauge up to 100%", `${at(100).showGauge} ${at(100.4).showGauge}`, "true false");
eq("over 100%: no pie", pie(at(110)), "none");
eq("half-up percent", at(1.5).ratioText, "2%");

// ── Categories and units ──
eq("property tax is housing", table(run({ propertyTax: "1200" })).split(" | ").slice(0, 2).join(" | "), "35% | 26%");
eq("yearly other loan", table(run({ studentLoan: "100", otherLoans: "50" }, { otherLoans: "y" })).split(" | ")[3], "$21,050 / year or $1,754 / month");
eq("monthly salary", table(run({ salary: "5000" }, { salary: "m" })).split(" | ")[2], "$60,000 / year or $5,000 / month");
eq("income rounding", table(run({ salary: "61234.56" })).split(" | ")[2], "$61,235 / year or $5,103 / month");
eq("all income types", table(run({ pension: "1000", investment: "2400", otherIncome: "100" }, { pension: "m", otherIncome: "m" })).split(" | ")[2], "$75,600 / year or $6,300 / month");
eq("blank debt counts as 0", run({ creditCards: "" }).ratioText, "29%");
eq("commas", run({ salary: "60,000" }).ratioText, "33%");
eq("pie omits empty slices", pie(run({ rental: "0" })), "Other Debts/Expenses 450.00 9%, Remainings 4550.00 91%");
eq("no debt: no pie", pie(run(debts0)), "none");

// ── House affordability ──
eq("no rent or mortgage: no 'halted' clause", run({ rental: "0" }).affordability, "If you live in the U.S. and have plans to purchase a house, you can spend up to $1,350 per month on the new house, which is equivalent to a house valued up to $186,545.*");
eq("keep mortgage", run({ mortgage: "500" }).affordability.split(".* ")[1], "If you plan to keep your existing mortgage loan, you can spend up to $850 per month on the new house, which is equivalent to one valued up to $117,454.*");
eq("keep mortgage less tax and HOA", run({ mortgage: "500", propertyTax: "1200", hoa: "50" }).affordability.split(".* ")[1], "If you plan to keep your existing mortgage loan, you can spend up to $700 per month on the new house, which is equivalent to one valued up to $96,727.*");
eq("cannot keep mortgage", run({ mortgage: "1500" }).affordability.split(".* ")[1], "However, you will not qualify for a conventional mortgage loan without halting your existing mortgage.");
eq("no budget left", run({ ...debts0, creditCards: "1800" }).affordability, "If you live in the U.S., with your current income and debt level, you will not qualify for a conventional mortgage loan.");
eq("no budget left: no footnote", run({ ...debts0, creditCards: "1800" }).affordabilityNote, false);
eq("a cent of budget", run({ ...debts0, creditCards: "1799.99" }).affordability, "If you live in the U.S. and have plans to purchase a house, you can spend up to $0 per month on the new house, which is equivalent to a house valued up to $1.*");
eq("28% cap", run({ salary: "1e5" }).affordability.match(/\$[\d,]+/g).join(" "), "$2,333 $322,424");

// ── Validation ──
eq("every field error", run(Object.fromEntries(Object.keys(DTI_DEFAULTS).map((k) => [k, "x"]))).errors.join(" | "),
  "Please provide a positive salary & earned income value. | Pension & social security need to be numeric. | Investment & savings need to be numeric. | Other income need to be numeric. | Rental cost need to be numeric. | Mortgage need to be numeric. | Property tax need to be numeric. | HOA fees need to be numeric. | Homeowner insurance need to be numeric. | Credit cards need to be numeric. | Student loan need to be numeric. | Auto loan need to be numeric. | Other loans and liabilities need to be numeric.");
eq("blank salary", run({ salary: "" }).errors.join(), "Please provide a positive salary & earned income value.");
eq("negative debt", run({ creditCards: "-5" }).errors.join(), "Credit cards need to be numeric.");
eq("zero income", run({ salary: "0" }).errors.join(), "Please make sure that income is more than 0.");
eq("zero salary but a pension", run({ salary: "0", pension: "1000" }, { pension: "m" }).ratioText, "165%");
eq("field errors come first", run({ salary: "0", creditCards: "x" }).errors.join(), "Credit cards need to be numeric.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
