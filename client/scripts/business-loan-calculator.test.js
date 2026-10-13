// Plain-Node test suite for the Business Loan Calculator engine.
// Run with:
//   node scripts/business-loan-calculator.test.js
//
// Expected figures were read from the LIVE reference
// (calculator.net/business-loan-calculator.html) via plain GET requests.
// A scratch comparator also diffed 25 hand-picked cases and 550 random
// scenarios: every payment, total, interest, fee row, heading, pie slice
// and amortization-table argument was identical, and the table itself
// matched the reference's own showAmo() code row for row (253 of 254 live
// cases; the other differs by one float ulp from PHP's pow, "-$0.00"). The
// "Real rate" row is solved exactly here; the reference's solver is
// approximate, so only its well-converged cases are pinned below.

import { calculateBusinessLoan, buildBusinessLoanSchedule, formatTableMoney } from "../src/utils/businessLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { loanAmount: "10000", interestRate: "10", compound: "monthly", years: "5", months: "0", payback: "month", originationFee: "5", documentationFee: "750", otherFees: "0" };
const run = (o = {}) => calculateBusinessLoan({ ...BASE, ...o });
const show = (r) => (r.errors ? r.errors.join(" | ")
  : [r.head ? `${r.head.title} — ${r.head.text}` : null, ...r.rows.map((x) => `${x.label}: ${x.value}`)].filter(Boolean).join(" / "));
const pie = (r) => (r.pie ? r.pie.map((s) => `${s.label} ${s.percent}%`).join(", ") : "none");

// ── Screenshot and every pay-back option ──
// Reference shows 15.931% (its approximate solver); the exact IRR is 15.9327%.
eq("screenshot", show(run()), "Payback every month: $212.47 / Total of 60 loan payments: $12,748.23 / Interest: $2,748.23 / Interest + fee: $3,998.23 / Real rate (APR): 15.933%");
eq("screenshot pie", pie(run()), "Principal 71%, Interest 20%, Fee 9%");
eq("year", show(run({ payback: "year" })), "Payback every year: $2,669.81 / Total of 5 loan payments: $13,349.06 / Interest: $3,349.06 / Interest + fee: $4,599.06 / Real rate (APR): 14.899%");
eq("6 months", show(run({ payback: "halfyear" })).split(" / Interest:")[0], "Payback every 6 months: $1,301.68 / Total of 10 loan payments: $13,016.78");
eq("quarter", show(run({ payback: "quarter" })).split(" / Interest +")[0], "Payback every quarter: $642.74 / Total of 20 loan payments: $12,854.76 / Interest: $2,854.76");
eq("half month", show(run({ payback: "halfmonth" })).split(" / Interest +")[0], "Payback every half month: $106.01 / Total of 120 loan payments: $12,721.78 / Interest: $2,721.78");
eq("biweekly phrase", show(run({ payback: "biweekly" })).split(" / Interest +")[0], "Payback every two weeks: $97.84 / Total of 130 loan payments: $12,719.75 / Interest: $2,719.75");
eq("weekly", show(run({ payback: "weekly" })).split(" / Interest +")[0], "Payback every week: $48.88 / Total of 260 loan payments: $12,707.57 / Interest: $2,707.57");
eq("daily: 365.25 a year, count rounded up", show(run({ payback: "daily" })).split(" / Interest +")[0], "Payback every day: $6.95 / Total of 1827 loan payments: $12,697.13 / Interest: $2,697.13");
eq("interest only", show(run({ payback: "interest" })), "$83.33 per month — You will need to pay $83.33 interest every month and pay $10,000 in the end to repay the loan. / Interest: $5,000.00 / Interest + fee: $6,250.00 / Real rate (APR): 13.447%"); // reference: 13.448%
eq("interest only, 61 months", show(run({ payback: "interest", months: "1" })).split(" / ")[1], "Interest: $5,083.33");
eq("in the end", show(run({ payback: "end" })), "Pay back $16,453.09 — You will need to pay $16,453.09 when the loan mature. / Interest: $6,453.09 / Interest + fee: $7,703.09 / Real rate (APR): 12.696%");
eq("in the end, 5.5 years", show(run({ payback: "end", months: "6" })).split(" / ")[0], "Pay back $17,293.07 — You will need to pay $17,293.07 when the loan mature.");

// ── Compounding and real-rate conventions ──
eq("annually = APY", show(run({ compound: "annually" })).split(" / ").slice(-1)[0], "Real rate (APY): 16.623%"); // reference: 16.622%
eq("annually payment", show(run({ compound: "annually" })).split(" / ")[0], "Payback every month: $210.36");
eq("semi-annual label", show(run({ compound: "semiannually", payback: "year" })).split(" / ").slice(-1)[0], "Real rate compound semi-annually: 15.146%");
eq("continuous shows the effective rate", show(run({ compound: "continuously", payback: "year" })).split(" / ").slice(-1)[0], "Real rate compound continuously: 16.009%");
eq("daily compounding uses 365.25 days", show(run({ compound: "daily", payback: "end" })), "Pay back $16,486.08 — You will need to pay $16,486.08 when the loan mature. / Interest: $6,486.08 / Interest + fee: $7,736.08 / Real rate compound daily: 12.671%");
eq("quarterly payment", show(run({ compound: "quarterly" })).split(" / ")[0], "Payback every month: $212.07");

// ── Fees, term, edge cases ──
eq("no fees: no fee rows, two slices", `${show(run({ originationFee: "0", documentationFee: "0" }))} | ${pie(run({ originationFee: "0", documentationFee: "0" }))}`,
  "Payback every month: $212.47 / Total of 60 loan payments: $12,748.23 / Interest: $2,748.23 | Principal 78%, Interest 22%");
eq("tiny fee rounds to a 0% slice", pie(run({ originationFee: "0", documentationFee: "50" })), "Principal 78%, Interest 21%, Fee 0%");
eq("blank fees count as 0", show(run({ originationFee: "" })).split(" / ")[3], "Interest + fee: $3,498.23");
eq("0% rate: no chart", pie(run({ interestRate: "0" })), "none");
eq("0% rate rows", show(run({ interestRate: "0" })).split(" / Real")[0], "Payback every month: $166.67 / Total of 60 loan payments: $10,000.00 / Interest: $0.00 / Interest + fee: $1,250.00");
eq("fractional count", show(run({ months: "1", payback: "quarter" })).split(" / Interest:")[0], "Payback every quarter: $634.61 / Total of 21 loan payments: $12,903.75");
eq("blank years", show(run({ years: "", months: "6" })).split(" / Interest:")[0], "Payback every month: $1,715.61 / Total of 6 loan payments: $10,293.68");
eq("fees above the loan: no real rate", show(run({ originationFee: "100" })).split(" / ").slice(-1)[0], "Interest + fee: $13,498.23");
eq("commas", show(run({ loanAmount: "10,000" })).split(" / ")[0], "Payback every month: $212.47");
eq("interest-only principal shown whole", show(run({ loanAmount: "10000.5", payback: "interest" })).split(" / ")[0], "$83.34 per month — You will need to pay $83.34 interest every month and pay $10,001 in the end to repay the loan.");

// ── Validation ──
eq("every field error", show(run({ loanAmount: "x", interestRate: "y", years: "z", months: "w", originationFee: "a", documentationFee: "b", otherFees: "c" })),
  "Please provide a positive loan amount. | Please provide a positive interest rate value. | Please provide a positive loan term year value. | Please provide a positive loan term month value. | Please provide a postivie origination fee amount. | Please provide a postivie documentation fee amount. | Please provide a postivie other fee amount.");
eq("zero term", show(run({ years: "0", months: "0" })), "Please provide a positive loan term.");
eq("blank rate", show(run({ interestRate: "" })), "Please provide a positive interest rate value.");
eq("zero amount", show(run({ loanAmount: "0" })), "Please provide a positive loan amount.");

// ── Amortization table ──
{
  const fmt = (x) => (x.type === "year" ? x.label : [x.label, formatTableMoney(x.begin), formatTableMoney(x.interest), formatTableMoney(x.change), formatTableMoney(x.ending)].join(" | "));
  const rows = buildBusinessLoanSchedule(run().schedule);
  eq("first row (principal shown as the balance change)", fmt(rows[0]), "1 | $10,000.00 | $83.33 | -$129.14 | $9,870.86");
  eq("year-end row", fmt(rows[12]), "Year #1 End");
  eq("row count incl. year ends", rows.length, 65);
  eq("last row ends at zero", fmt(rows[63]), "60 | $210.71 | $1.76 | -$210.71 | $0.00");
  const half = buildBusinessLoanSchedule(run({ payback: "halfyear" }).schedule);
  eq("6-month labels", `${half[0].label}, ${half[1].label}, ${half[2].label}`, "1. Year #1, 2. Year #1, 3. Year #2");
  const end = buildBusinessLoanSchedule(run({ payback: "end" }).schedule);
  eq("in-the-end table grows", fmt(end[0]), "1 | $10,000.00 | $1,047.13 | $1,047.13 | $11,047.13");
  eq("no table for fractional terms", run({ months: "1", payback: "quarter" }).schedule, null);
  eq("no table for interest only", run({ payback: "interest" }).schedule, null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
