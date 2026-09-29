// Plain-Node test suite for the Student Loan Calculator engine. Run with:
//   node scripts/student-loan-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/student-loan-calculator.html) via plain GET requests —
// all three forms submit GET to the same server-rendered page.

import {
  calculateSimple, calculateRepayment, calculateProjection,
  formatDuration, formatMoney, formatRate, formatCurrency,
} from "../src/utils/studentLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function money(name, actual, expected) {
  ok(name, formatMoney(actual) === expected, `got ${formatMoney(actual)}, expected ${expected}`);
}

// ─────────────────────────────────────────────────────────────────
// 1. Simple Student Loan Calculator
// ─────────────────────────────────────────────────────────────────

const S = (balance, term, rate, payment) => calculateSimple({ balance, term, rate, payment });

{
  const r = S("30000", "10", "6.8", "");
  ok("default solves payment", r.solveFor === "payment" && !r.basedOnNote);
  money("default payment", r.payment, "$345.24");
  money("default total interest", r.totalInterest, "$11,428.92");
  money("default total payments", r.totalPayments, "$41,428.92");
}
{
  const r = S("30000", "10", "6.8", "400");
  ok("all 4 valid → payment re-solved with note", r.solveFor === "payment" && r.basedOnNote);
  money("all 4 valid payment", r.payment, "$345.24");
}
{
  const r = S("30000", "", "6.8", "345.24");
  ok("term solve rounds up to 121 months", r.months === 121 && formatDuration(r.months) === "10 years and 1 month");
  money("term solve total interest (fractional n)", r.totalInterest, "$11,428.97");
  money("term solve total payments", r.totalPayments, "$41,428.97");
}
{
  const r = S("30000", "", "6.8", "400");
  ok("term solve 400 → 8 years and 2 months", formatDuration(r.months) === "8 years and 2 months");
  money("term solve 400 total", r.totalPayments, "$39,173.06");
}
{
  const r = S("30000", "", "6.8", "2600");
  ok("term solve → '1 year'", formatDuration(r.months) === "1 year");
  money("term solve 2600 total", r.totalPayments, "$31,113.56");
}
{
  const r = S("30000", "", "6.8", "30500");
  ok("term solve → '1 month'", formatDuration(r.months) === "1 month");
  money("term solve 30500 total", r.totalPayments, "$30,169.08");
}
{
  const r = S("30000", "", "6.8", "170.5");
  ok("term solve → 86 years and 1 month", formatDuration(r.months) === "86 years and 1 month");
  money("term solve 170.5 total", r.totalPayments, "$175,967.75");
}
ok("payment ≤ interest message", S("30000", "", "6.8", "100").message === "The loan won't be paid off with payment of $100 per month.");
ok("payment message prints raw number", S("30000", "", "6.8", "100.50").message === "The loan won't be paid off with payment of $100.5 per month.");
ok("payment == interest also can't pay off", !!S("30000", "", "6.8", "170").message);
{
  const r = S("30000", "10", "", "345.24");
  ok("rate solve 6.80%", formatRate(r.rate) === "6.80%", formatRate(r.rate));
  money("rate solve total interest", r.totalInterest, "$11,428.80");
}
ok("rate solve 3.74%", formatRate(S("30000", "10", "", "300").rate) === "3.74%");
ok("rate solve 800.00%", formatRate(S("30000", "10", "", "20000").rate) === "800.00%");
ok("rate solve 2,000.00%", formatRate(S("30000", "10", "", "50000").rate) === "2,000.00%");
ok("rate solve 40,000.00%", formatRate(S("30000", "10", "", "1000000").rate) === "40,000.00%");
ok("rate solve 0.00%", formatRate(S("30000", "10", "", "250.01").rate) === "0.00%");
ok("rate negative message", S("30000", "10", "", "200").message === "The interest rate is negative, which is unlikely.");
ok("rate zero message", S("30000", "10", "", "250").message === "The interest rate is 0%!");
{
  const r = S("", "10", "6.8", "345.24");
  money("balance solve", r.balance, "$29,999.91");
  money("balance solve interest", r.totalInterest, "$11,428.89");
  money("balance solve total", r.totalPayments, "$41,428.80");
}
{
  const r = S("30000", "10.33", "6.8", "");
  money("fractional term payment", r.payment, "$337.54");
  money("fractional term total", r.totalPayments, "$41,841.65");
}
money("tiny term payment", S("30000", "0.01", "6.8", "").payment, "$250,792.68");
money("long term payment", S("30000", "1000", "6.8", "").payment, "$170.00");
money("rate 98.99 accepted", S("30000", "10", "98.99", "").payment, "$2,474.93");
money("commas accepted", S("30,000", "10", "6.8", "").payment, "$345.24");
{
  const r = S("30000.555", "10", "6.8", "");
  money("cents balance payment", r.payment, "$345.25");
  money("cents balance interest", r.totalInterest, "$11,429.13");
}
// Invalid values are treated as the unknown
ok("rate 99 + 3 valid → solves rate", formatRate(S("30000", "10", "99", "345.24").rate) === "6.80%");
money("negative payment + 3 valid → solves payment", S("30000", "10", "6.8", "-5").payment, "$345.24");
ok("negative term + 3 valid → solves term", S("30000", "-10", "6.8", "345.24").months === 121);
money("zero balance + 3 valid → solves balance", S("0", "10", "6.8", "345.24").balance, "$29,999.91");
const THREE = "Please provide at least 3 positive values.";
for (const [label, args] of [
  ["rate 0", ["30000", "10", "0", ""]], ["rate 99", ["30000", "10", "99", ""]], ["rate 200", ["30000", "10", "200", ""]],
  ["negative balance", ["-30000", "10", "6.8", ""]], ["negative rate", ["30000", "10", "-6.8", ""]],
  ["text balance", ["abc", "10", "6.8", ""]], ["term 0", ["30000", "0", "6.8", ""]], ["two blanks", ["30000", "", "", "100"]],
]) ok(`needs 3 valid: ${label}`, S(...args).error === THREE);

// ─────────────────────────────────────────────────────────────────
// 2. Student Loan Repayment Calculator
// ─────────────────────────────────────────────────────────────────

const REP = (over) => calculateRepayment({
  balance: "30000", payment: "350", rate: "6.8", option: "extra",
  extraMonthly: "150", extraYearly: "0", extraOneTime: "0", ...over,
});

{
  const r = REP({});
  ok("default headline", r.headline === "6 years and 2 months");
  ok("default original term", formatDuration(r.original.months) === "9 years and 10 months");
  money("default original total", r.original.totalPayments, "$41,188.54");
  money("default original interest", r.original.totalInterest, "$11,188.54");
  money("default extra total", r.withExtra.totalPayments, "$36,767.26");
  money("default extra interest", r.withExtra.totalInterest, "$6,767.26");
  ok("default months saved", formatDuration(r.monthsSaved) === "3 years and 8 months");
  money("default savings", r.savings, "$4,421.28");
  ok("default extra phrase", r.extraPhrase === "$150.00 per month");
}
{
  const r = REP({ extraMonthly: "0", extraYearly: "1000" });
  ok("yearly extra headline", r.headline === "7 years and 6 months");
  money("yearly extra total", r.withExtra.totalPayments, "$38,486.48");
  money("yearly extra savings", r.savings, "$2,702.06");
  ok("yearly phrase", r.extraPhrase === "$1,000.00 annually at the year end");
}
{
  const r = REP({ extraMonthly: "0", extraOneTime: "5000" });
  ok("one-time headline", r.headline === "7 years and 8 months");
  money("one-time total (paid with month 1)", r.withExtra.totalPayments, "$37,181.38");
  money("one-time savings", r.savings, "$4,007.16");
  ok("one-time phrase", r.extraPhrase === "$5,000.00 now");
}
{
  const r = REP({ extraMonthly: "100", extraYearly: "1000", extraOneTime: "5000" });
  ok("all extras headline", r.headline === "4 years and 9 months");
  money("all extras total", r.withExtra.totalPayments, "$34,339.36");
  money("all extras savings", r.savings, "$6,849.18");
  ok("all extras saved", formatDuration(r.monthsSaved) === "5 years and 1 month");
  ok("all extras phrase", r.extraPhrase === "$100.00 per month and $1,000.00 annually at the year end and $5,000.00 now");
}
{
  const r = REP({ extraYearly: "500" });
  money("month+year total", r.withExtra.totalPayments, "$36,207.11");
  money("month+year savings", r.savings, "$4,981.43");
}
{
  const r = REP({ extraOneTime: "500" });
  ok("month+once headline", r.headline === "6 years and 1 month");
  money("month+once total", r.withExtra.totalPayments, "$36,514.72");
}
{
  const r = REP({ extraMonthly: "0", extraYearly: "500", extraOneTime: "500" });
  money("year+once total", r.withExtra.totalPayments, "$39,247.59");
  ok("year+once saved", formatDuration(r.monthsSaved) === "1 year and 6 months");
}
{
  const r = REP({ extraMonthly: "1.5" });
  money("tiny extra savings", r.savings, "$73.87");
  ok("tiny extra saved 1 month", formatDuration(r.monthsSaved) === "1 month");
}
{
  const r = REP({ extraMonthly: "0", extraOneTime: "40000" });
  ok("one-time > balance → 1 month", r.headline === "1 month");
  money("one-time > balance total", r.withExtra.totalPayments, "$30,170.00");
}
{
  const r = REP({ payment: "2600", extraMonthly: "100" });
  ok("same-term: no months saved", r.monthsSaved === 0);
  money("same-term savings", r.savings, "$38.12");
  money("same-term original total", r.original.totalPayments, "$31,113.79");
}
ok("zero extras phrase is readable", REP({ extraMonthly: "0" }).extraPhrase === "$0.00");
{
  const r = REP({ option: "together" });
  ok("together balance rounds to whole dollars", formatCurrency(r.balance, { decimals: 0 }) === "$30,000");
  money("together savings", r.savings, "$11,188.54");
  const r2 = REP({ option: "together", balance: "30000.5" });
  ok("together $30,001", formatCurrency(r2.balance, { decimals: 0 }) === "$30,001");
  money("together 30000.5 savings", r2.savings, "$11,189.02");
}
{
  const r = REP({ option: "original" });
  ok("original headline", r.headline === "9 years and 10 months");
}
{
  const r = REP({ option: "original", rate: "0" });
  ok("rate 0 allowed", r.headline === "7 years and 2 months");
  money("rate 0 total", r.original.totalPayments, "$30,000.00");
}
{
  const r = REP({ option: "original", rate: "-1" });
  ok("negative rate computed", r.headline === "6 years and 11 months");
  ok("negative money format", formatMoney(r.original.totalInterest) === "$-1,035.10", formatMoney(r.original.totalInterest));
}
{
  const r = REP({ option: "original", payment: "5000", rate: "98" });
  ok("high rate headline", r.headline === "9 months");
  money("high rate total", r.original.totalPayments, "$42,934.30");
}
const CANNOT = (x) => `You cannot pay off the loan with monthly payment of ${x}. Please check.`;
ok("cannot pay off 150", REP({ payment: "150", option: "original" }).message === CANNOT("$150.00"));
ok("cannot pay off 150 even with extras", REP({ payment: "150", extraMonthly: "50" }).message === CANNOT("$150.00"));
ok("cannot pay off together", REP({ payment: "150", option: "together" }).message === CANNOT("$150.00"));
ok("cannot pay off exactly interest", REP({ payment: "170", option: "original" }).message === CANNOT("$170.00"));
ok("cannot pay off 0", REP({ payment: "0", option: "original" }).message === CANNOT("$0.00"));
ok("rate 99 cannot pay off", REP({ rate: "99", option: "original" }).message === CANNOT("$350.00"));
{
  const r = REP({ balance: "-1", payment: "-1", rate: "abc", extraMonthly: "-5", extraYearly: "x", extraOneTime: "-1" });
  ok("all 6 repayment errors in order", JSON.stringify(r.errors) === JSON.stringify([
    "Please provide a positive loan balance.", "Please provide a positive monthly payment.",
    "Please provide a numerical interest rate value.", "Please provide a positive extra payment per month.",
    "Please provide a positive extra payment per year.", "Please provide a positive extra one time payment.",
  ]));
}
ok("zero balance error", REP({ balance: "0" }).errors?.[0] === "Please provide a positive loan balance.");
ok("blank rate error", REP({ rate: "" }).errors?.[0] === "Please provide a numerical interest rate value.");
ok("invalid extras ignored outside extra mode", !REP({ option: "original", extraMonthly: "-5", extraYearly: "x" }).errors);

// ─────────────────────────────────────────────────────────────────
// 3. Student Loan Projection Calculator
// ─────────────────────────────────────────────────────────────────

const PROJ = (over) => calculateProjection({
  yearsToGraduate: "2", annualAmount: "10000", currentBalance: "20000", loanTerm: "10",
  gracePeriod: "6", rate: "6.8", payInterestInSchool: false, ...over,
});

{
  const r = PROJ({});
  money("default repayment", r.payment, "$526.96");
  money("default borrowed", r.amountBorrowed, "$40,000.00");
  money("default after graduation", r.balanceAfterGraduation, "$44,263.99");
  money("default after grace", r.balanceAfterGrace, "$45,790.44");
  money("default total interest", r.totalInterest, "$23,234.95");
}
{
  const r = PROJ({ payInterestInSchool: true });
  money("pay-interest repayment", r.payment, "$460.32");
  money("pay-interest total interest", r.totalInterest, "$15,238.56");
  ok("pay-interest hides balance rows", r.balanceAfterGraduation === null && r.balanceAfterGrace === null);
}
{
  const r = PROJ({ yearsToGraduate: "3", annualAmount: "12000", currentBalance: "5000", loanTerm: "15", gracePeriod: "9", rate: "5.5" });
  money("scenario 2 repayment", r.payment, "$382.61");
  money("scenario 2 borrowed", r.amountBorrowed, "$41,000.00");
  money("scenario 2 after graduation", r.balanceAfterGraduation, "$44,938.07");
  money("scenario 2 after grace", r.balanceAfterGrace, "$46,826.12");
  money("scenario 2 interest", r.totalInterest, "$27,869.53");
}
{
  const r = PROJ({ yearsToGraduate: "2.5" });
  money("2.5 years after graduation", r.balanceAfterGraduation, "$50,861.81");
  money("2.5 years repayment", r.payment, "$605.50");
}
money("1.3 years after graduation", PROJ({ yearsToGraduate: "1.3" }).balanceAfterGraduation, "$35,394.88");
{
  const r = PROJ({ yearsToGraduate: "1.33" });
  money("1.33 years borrowed", r.amountBorrowed, "$33,300.00");
  money("1.33 years after graduation", r.balanceAfterGraduation, "$35,766.41");
  money("1.33 years interest", r.totalInterest, "$17,795.43");
}
{
  const r = PROJ({ yearsToGraduate: "0" });
  money("0 years after graduation", r.balanceAfterGraduation, "$20,000.00");
  money("0 years repayment", r.payment, "$238.10");
}
{
  const r = PROJ({ yearsToGraduate: "0", gracePeriod: "0" });
  ok("grace 0 hides grace row", r.balanceAfterGrace === null && r.balanceAfterGraduation !== null);
  money("grace 0 repayment", r.payment, "$230.16");
}
money("no annual borrowing after grad", PROJ({ annualAmount: "0", gracePeriod: "0" }).balanceAfterGraduation, "$22,904.84");
money("no current balance repayment", PROJ({ currentBalance: "0" }).payment, "$254.28");
money("all zero repayment", PROJ({ currentBalance: "0", annualAmount: "0" }).payment, "$0.00");
{
  const r = PROJ({ rate: "0" });
  money("rate 0 repayment", r.payment, "$333.33");
  ok("rate 0 hides balance rows", r.balanceAfterGraduation === null);
}
money("term 10.5", PROJ({ loanTerm: "10.5" }).payment, "$509.45");
money("grace 6.5 months", PROJ({ gracePeriod: "6.5" }).balanceAfterGrace, "$45,920.00");
money("term 0.01 interest", PROJ({ loanTerm: "0.01" }).totalInterest, "$5,935.63");
money("rate 99 accepted", PROJ({ rate: "99" }).payment, "$25,444.81");
{
  const r = PROJ({ rate: "-1" });
  money("negative rate repayment", r.payment, "$310.60");
  ok("negative rate interest format", formatMoney(r.totalInterest) === "$-2,727.83", formatMoney(r.totalInterest));
  money("negative rate + pay interest", PROJ({ rate: "-1", payInterestInSchool: true }).totalInterest, "$-1,983.33");
}
ok("term 0 error", JSON.stringify(PROJ({ loanTerm: "0" }).errors) === JSON.stringify(["Please provide a positive loan term."]));
{
  const all = [
    "Please provide a positive years to graduate.", "Please provide a positive amount to borrow per year value.",
    "Please provide a positive current balance.", "Please provide a positive loan term.",
    "Please provide a positive grace period.", "Please provide a numerical interest rate value.",
  ];
  const blank = PROJ({ yearsToGraduate: "", annualAmount: "", currentBalance: "", loanTerm: "", gracePeriod: "", rate: "" });
  ok("all 6 projection errors when blank", JSON.stringify(blank.errors) === JSON.stringify(all));
  const neg = PROJ({ yearsToGraduate: "-1", annualAmount: "-1", currentBalance: "-1", loanTerm: "-1", gracePeriod: "-1", rate: "-1" });
  ok("negatives: 5 errors (negative rate is allowed)", JSON.stringify(neg.errors) === JSON.stringify(all.slice(0, 5)));
}

// ─────────────────────────────────────────────────────────────────
// 4. Formatting
// ─────────────────────────────────────────────────────────────────

ok("duration 2 years", formatDuration(24) === "2 years");
ok("duration 1 year and 1 month", formatDuration(13) === "1 year and 1 month");
ok("duration 5 months", formatDuration(5) === "5 months");

console.log(`\nStudent Loan Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
