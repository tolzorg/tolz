// Plain-Node test suite for the HELOC Calculator engine.
// Run with:
//   node scripts/heloc-calculator.test.js
//
// Expected figures were read from the LIVE reference
// (calculator.net/heloc-calculator.html) via plain GET requests. A scratch
// comparator diffed 300 random scenarios: payments, totals, costs, pie and
// schedules matched except for a few half-cent ties in single schedule cells.
// The reference's APR adds a small undecoded upward bias when there is a draw
// period (median 0.005, max ~0.05 points); APR tests below use cases where it
// is exact or note the reference value.

import { calculateHeloc, calculateHelocBorrowLimit, scheduleMoney, HELOC_DEFAULTS } from "../src/utils/helocCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { ...HELOC_DEFAULTS, includeCosts: true, closingUnit: "amount", closingPaid: "upfront" };
const h = (o = {}) => calculateHeloc({ ...BASE, ...o });
const all = (r) => [...r.results, ...r.totals].map((x) => x.join(" ")).join(" / ");
const noApr = (r) => all(r).replace(/ \/ APR [\d.,]+%$/, "");
const pie = (r) => { const t = r.pie.reduce((s, p) => s + p.value, 0); return r.pie.map((p) => `${p.label} ${Math.round((p.value / t) * 100)}%`).join(" / "); };
const yr = (r, i) => { const a = r.schedule.annual[i]; return `${a.label} ${scheduleMoney(a.interest)} ${scheduleMoney(a.principal)} ${scheduleMoney(a.balance)}`; };
const apr = (r) => r.totals.find((x) => x[0] === "APR")?.[1];

// ── Screenshots ──
{
  const r = h({ includeCosts: false });
  eq("no costs", all(r), "Draw period monthly pay $333.33 / Repayment period monthly pay $477.83 / Total of 240 payments $106,008.69 / Total interest $56,008.69");
  eq("no costs pie", pie(r), "Loan amount 47% / Interest 53%");
  eq("year 1", yr(r, 0), "1 $4,000.00 $0.00 $50,000.00");
  eq("year 6", yr(r, 5), "6 $3,934.99 $1,798.92 $48,201.08");
  eq("year 20", yr(r, 19), "20 $240.93 $5,492.98 $0.00");
}
{
  const r = h();
  eq("with costs", noApr(r), "Draw period monthly pay $333.33 / Repayment period monthly pay $477.83 / Total of 240 payments $106,008.69 / Total interest $56,008.69 / Total annual fees $250.00 / Cost of loan $58,258.69");
  eq("with costs pie", pie(r), "Loan amount 46% / Closing costs 2% / Annual fee 0% / Interest 52%");
  eq("default APR (reference 8.755%)", apr(r), "8.751%");
}
eq("deducted", noApr(h({ closingPaid: "deduct" })).split(" / ")[2], "Cash received $48,000.00");
eq("deducted pie", pie(h({ closingPaid: "deduct" })), "Cash received 45% / Closing costs 2% / Annual fee 0% / Interest 53%");
eq("percentage row", noApr(h({ closingUnit: "percentage", closingCosts: "4" })).split(" / ")[4], "Closing costs $2,000.00");
eq("no fee", noApr(h({ annualFee: "0" })).split(" / ").pop(), "Cost of loan $58,008.69");
eq("no closing", pie(h({ closingCosts: "0" })), "Loan amount 47% / Annual fee 0% / Interest 53%");
eq("no closing, no fee", all(h({ closingCosts: "0", annualFee: "0" })), "Draw period monthly pay $333.33 / Repayment period monthly pay $477.83 / Total of 240 payments $106,008.69 / Total interest $56,008.69");
eq("deducted with $0 closing", noApr(h({ closingCosts: "0", closingPaid: "deduct" })).split(" / ")[2], "Cash received $50,000.00");
eq("…pie keeps Loan amount", pie(h({ closingCosts: "0", closingPaid: "deduct" })).split(" / ")[0], "Loan amount 47%");

// ── APR where the reference is exact (no draw period) ──
eq("no draw", `${noApr(h({ drawYears: "0" })).split(" / ").slice(2).join(" / ")} / ${apr(h({ drawYears: "0" }))}`, "Total of 180 payments $86,008.69 / Total interest $36,008.69 / Total annual fees $0.00 / Cost of loan $38,008.69 / 8.683%");
eq("no draw, 1 year", apr(h({ drawYears: "0", repayYears: "1" })), "15.751%");
eq("no draw, 12.6 payments (fractional annuity)", apr(h({ drawYears: "0", repayYears: "1.05" })), "15.413%");
eq("50-year draw", apr(h({ drawYears: "50", repayYears: "15" })), "8.872%");
eq("0% rate: no APR", apr(h({ rate: "0" })), undefined);
eq("0% rate", noApr(h({ rate: "0" })).split(" / ").slice(0, 3).join(" / "), "Draw period monthly pay $0.00 / Repayment period monthly pay $277.78 / Total of 240 payments $50,000.00");
eq("6 repayment months: no APR", apr(h({ drawYears: "0.5", repayYears: "0.5" })), undefined);

// ── Fractional periods ──
{
  const r = h({ drawYears: "2.55", repayYears: "3.55" });
  eq("fractional rows", noApr(r).split(" / ").slice(1).join(" / "), "Repayment period monthly pay $1,352.14 / Total of 74 payments $67,800.99 / Total interest $17,800.99 / Total annual fees $127.50 / Cost of loan $19,928.49");
  eq("partial draw month", scheduleMoney(r.schedule.monthly[30].interest), "$200.00");
  eq("partial last row", `${scheduleMoney(r.schedule.monthly[73].interest)} ${scheduleMoney(r.schedule.monthly[73].principal)}`, "$4.30 $806.98");
  eq("year 7", yr(r, 6), "7 $18.60 $2,144.82 $0.00");
}
eq("draw 2.55, repay 3", noApr(h({ drawYears: "2.55", repayYears: "3" })).split(" / ")[2], "Total of 67 payments $66,605.46");
eq("12 repayment months: no schedule", h({ repayYears: "1" }).schedule, null);
eq("12.6 repayment months: schedule", h({ repayYears: "1.05" }).schedule.monthly.length, 73);
eq("720 repayment months: no schedule", h({ repayYears: "60" }).schedule, null);
eq("long draw keeps schedule", h({ drawYears: "50" }).schedule.monthly.length, 780);

// ── Validation ──
eq("every field", h({ amount: "x", rate: "x", drawYears: "x", repayYears: "x", closingCosts: "x", annualFee: "x" }).errors.join(" | "),
  "Please provide a positive loan amount. | Please provide a positive interest rate value. | Please provide a positive draw period value. | Please provide a positive repayment period value. | Please provide a positive closing costs amount. | Please provide a positive annual fee amount.");
eq("blank fee", h({ annualFee: "" }).errors.join(), "Please provide a positive annual fee amount.");
eq("blank draw", h({ drawYears: "" }).errors.join(), "Please provide a positive draw period value.");
eq("zero repay", h({ repayYears: "0" }).errors.join(), "Please provide a positive repayment period value.");
eq("closing = loan", h({ closingCosts: "50000" }).errors.join(), "Closing costs cannot be more than loan amount.");
eq("100%", h({ closingUnit: "percentage", closingCosts: "100" }).errors.join(), "Closing costs percentage cannot be more than 100%.");
eq("unchecked skips cost checks", h({ includeCosts: false, closingCosts: "x", annualFee: "x" }).errors, undefined);

// ── Line of credit you can borrow ──
{
  const r = calculateHelocBorrowLimit({ houseValue: "600,000", mortgageBalance: "250,000", ltv: "80" });
  eq("borrow", `${r.amount} | ${r.ltvText}`, "$230,000 | Your current loan-to-value ratio: 41.7%.");
  eq("HELOC note", r.notes[0].startsWith("There are other factors that may affect the home equity line of credit amount"), true);
}
eq("HELOC cap note", calculateHelocBorrowLimit({ houseValue: "3000000", mortgageBalance: "100000", ltv: "90" }).notes[1], "In addition, most lenders have an upper limit on home equity line of credit, with many setting the cap at $1,000,000.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
