// Plain-Node test suite for the Home Equity Loan Calculator engine.
// Run with:
//   node scripts/home-equity-loan-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/home-equity-loan-calculator.html) via plain GET requests;
// the borrowing calculator is the reference's own client-side script. A
// scratch comparator also diffed 150 random scenarios: 140 were identical.
// The rest were the reference's approximate APR solver (third decimal, as on
// its APR page) or a 1-cent tie in one schedule cell.

import {
  calculateHomeEquityLoan, calculateBorrowLimit, scheduleMoney, LOAN_DEFAULTS,
} from "../src/utils/homeEquityLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { ...LOAN_DEFAULTS, includeClosing: true, closingUnit: "amount", closingPaid: "deduct" };
const he = (o = {}) => calculateHomeEquityLoan({ ...BASE, ...o });
const rows = (r) => r.rows.map((x) => x.join(" ")).join(" / ");
const pie = (r) => { const t = r.pie.reduce((s, p) => s + p.value, 0); return r.pie.map((p) => `${p.label} ${Math.round((p.value / t) * 100)}%`).join(" / "); };
const yr = (r, i) => { const a = r.schedule.annual[i]; return `${a.label} ${scheduleMoney(a.interest)} ${scheduleMoney(a.principal)} ${scheduleMoney(a.balance)}`; };

// ── Screenshots ──
{
  const r = he({ includeClosing: false });
  eq("monthly pay", r.monthlyPay, "$1,433.48");
  eq("no closing rows", rows(r), "Total of 180 loan payments $258,026.06 / Total interest $108,026.06");
  eq("no closing pie", pie(r), "Loan amount 58% / Interest 42%");
  eq("year 1", yr(r, 0), "1 $11,804.97 $5,396.77 $144,603.23");
  eq("year 15", yr(r, 14), "15 $722.79 $16,478.95 $0.00");
  eq("month 1", `${scheduleMoney(r.schedule.monthly[0].interest)} ${scheduleMoney(r.schedule.monthly[0].principal)}`, "$1,000.00 $433.48");
  eq("no dates", r.schedule.showDates, false);
}
{
  const r = he();
  eq("with closing", rows(r), "Cash received $142,500.00 / Total of 180 loan payments $258,026.06 / Total interest $108,026.06 / Cost of loan $115,526.06 / APR 8.860%");
  eq("with closing pie", pie(r), "Cash received 55% / Closing costs 3% / Interest 42%");
}
eq("paid upfront", rows(he({ closingPaid: "upfront" })), "Total of 180 loan payments $258,026.06 / Total interest $108,026.06 / Cost of loan $115,526.06 / APR 8.860%");
eq("paid upfront pie", pie(he({ closingPaid: "upfront" })), "Loan amount 56% / Closing costs 3% / Interest 41%");
eq("percentage adds a row", rows(he({ closingUnit: "percentage", closingCosts: "5" })), "Cash received $142,500.00 / Total of 180 loan payments $258,026.06 / Total interest $108,026.06 / Closing costs $7,500.00 / Cost of loan $115,526.06 / APR 8.860%");
eq("zero closing = none", rows(he({ closingCosts: "0" })), "Total of 180 loan payments $258,026.06 / Total interest $108,026.06");

// ── Terms ──
eq("2.5 years", `${he({ years: "2.5" }).monthlyPay} ${rows(he({ years: "2.5" }))}`, "$5,533.25 Cash received $142,500.00 / Total of 30 loan payments $165,997.46 / Total interest $15,997.46 / Cost of loan $23,497.46 / APR 12.173%");
{
  const r = he({ years: "2.55" });
  eq("fractional count", rows(r).split(" / ")[1], "Total of 30.60 loan payments $166,317.56");
  eq("fractional APR", rows(r).split(" / ").pop(), "APR 12.097%");
  const last = r.schedule.monthly[30];
  eq("partial last row", `${scheduleMoney(last.interest)} ${scheduleMoney(last.principal)}`, "$17.29 $3,243.84");
}
eq("13 payments print as 13", rows(he({ years: "1.0834" })).split(" / ")[1], "Total of 13 loan payments $157,093.42");
eq("APR from 13 payments", rows(he({ years: "1.0834" })).split(" / ").pop(), "APR 17.073%");
eq("12 payments: no APR, no schedule", `${rows(he({ years: "1" })).includes("APR")} ${he({ years: "1" }).schedule}`, "false null");
eq("55 years: schedule", he({ years: "55" }).schedule.monthly.length, 660);
eq("60 years: no schedule", he({ years: "60" }).schedule, null);
eq("1,000 years", rows(he({ years: "1000" })).split(" / ").slice(1).join(" / "), "Total of 12,000 loan payments $12,000,000.00 / Total interest $11,850,000.00 / Cost of loan $11,857,500.00 / APR 8.421%");
eq("0% rate: no APR", rows(he({ rate: "0" })), "Cash received $142,500.00 / Total of 180 loan payments $150,000.00 / Total interest $0.00 / Cost of loan $7,500.00");
eq("100% rate", rows(he({ rate: "100" })).split(" / ").slice(1).join(" / "), "Total of 180 loan payments $2,250,001.24 / Total interest $2,100,001.24 / Cost of loan $2,107,501.24 / APR 105.263%");

// ── Validation ──
eq("every field", he({ amount: "x", rate: "x", years: "x", closingCosts: "x" }).errors.join(" | "),
  "Please provide a positive loan amount. | Please provide a positive interest rate value. | Please provide a reasonable loan term value. | Please provide a positive closing costs amount.");
eq("blank closing", he({ closingCosts: "" }).errors.join(), "Please provide a positive closing costs amount.");
eq("closing = loan", he({ closingCosts: "150000" }).errors.join(), "Closing costs cannot be more than loan amount.");
eq("100%", he({ closingUnit: "percentage", closingCosts: "100" }).errors.join(), "Closing costs percentage cannot be more than 100%.");
eq("unchecked skips closing check", he({ includeClosing: false, closingCosts: "x" }).errors, undefined);

// ── How much you can borrow ──
{
  const r = calculateBorrowLimit({ houseValue: "600,000", mortgageBalance: "250,000", ltv: "80" });
  eq("borrow", `${r.amount} | ${r.ltvText}`, "$230,000 | Your current loan-to-value ratio: 41.7%.");
  eq("borrow note", r.notes.length, 1);
}
eq("not qualified", calculateBorrowLimit({ houseValue: "300000", mortgageBalance: "250000", ltv: "80" }).qualifies, false);
eq("cap note", calculateBorrowLimit({ houseValue: "3000000", mortgageBalance: "100000", ltv: "90" }).notes.length, 2);
eq("borrow errors", calculateBorrowLimit({ houseValue: "", mortgageBalance: "0", ltv: "80" }).errors.join(" | "),
  "Please provide a valid current value of your house. | Please provide a valid outstanding balance of your mortgage.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
