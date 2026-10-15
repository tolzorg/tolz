// Plain-Node test suite for the VA Mortgage Calculator engine.
// Run with:
//   node scripts/va-mortgage-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/va-mortgage-calculator.html) via plain GET requests. A scratch
// comparator also diffed 350 random scenarios (results table, summary, pie,
// bi-weekly block, annual and monthly schedules): 348 were identical; the two
// others were half-dollar float ties at exactly 0% interest.

import { calculateVaMortgage, fundingFeeRate, VA_DEFAULTS } from "../src/utils/vaMortgageCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = {
  ...VA_DEFAULTS, downUnit: "percent", taxUnit: "percent", eligibility: "v", usedBefore: false, disabled: false, feeFinanced: true,
  moreOptions: true, showBiweekly: true, startMonth: 10, startYear: "2026",
  extraMonthlyMonth: 10, extraMonthlyYear: "2026", extraYearlyMonth: 10, extraYearlyYear: "2026", extraOneTimeMonth: 10, extraOneTimeYear: "2026",
};
const va = (o = {}) => calculateVaMortgage({ ...BASE, ...o });
const table = (r) => r.table.map((x) => `${x.label} ${x.first} ${x.total}`).join(" / ");
const summary = (r) => r.summary.map((x) => x.join(" ")).join(" / ");
const pie = (r) => { const t = r.pie.reduce((s, p) => s + p.value, 0); return r.pie.filter((p) => p.value > 0).map((p) => `${p.label} ${Math.round((p.value / t) * 100)}%`).join(" / "); };
const W = (v) => `$${Math.round(v).toLocaleString("en-US")}`;

// ── Default example (screenshots) ──
{
  const r = va();
  eq("monthly pay", r.monthlyPay, "$3,532.15");
  eq("table", table(r), "Mortgage Payment $3,532.15 $1,271,573.88 / Property Tax $500.00 $180,000.00 / Home Insurance $208.33 $75,000.00 / Other Costs $416.67 $150,000.00 / Total Out-of-Pocket $4,657.15 $1,676,573.88");
  eq("summary", summary(r), "House Price $500,000.00 / VA Funding Fee (2.15%) $10,750.00 / Down Payment $0.00 / Loan Amount $510,750.00 / Total of 360 Mortgage Payments $1,271,573.88 / Total Interest $760,823.88 / Mortgage Payoff Date Oct. 2056");
  eq("pie", pie(r), "Principal 30% / Interest 45% / Property Taxes 11% / Other Cost 9% / Home Insurance 4%");
  eq("biweekly", r.biweekly.rows.map((x) => x.join(" ")).join(" | "), "Bi-weekly Payment $1,766.07 | Total Interest $562,718.37 | Payoff 23.3 years");
  const a = r.schedule.annual;
  eq("year 1", `${a[0].date} ${W(a[0].interest)} ${W(a[0].principal)} ${W(a[0].balance)}`, "10/26-9/27 $37,573 $4,812 $505,938");
  eq("year 30", `${W(a[29].interest)} ${W(a[29].principal)} ${W(a[29].balance)}`, "$1,649 $40,737 $0");
}
{
  const r = va({ moreOptions: false });
  eq("collapsed: no table", r.table, null);
  eq("collapsed summary", summary(r), "House Price $500,000.00 / VA Funding Fee (2.15%) $10,750.00 / Down Payment $0.00 / Loan Amount $510,750.00 / Total of 360 Mortgage Payments $1,271,573.88 / Total Interest $760,823.88");
  eq("collapsed pie", pie(r), "Principal 40% / Interest 60%");
  eq("collapsed: no biweekly", r.biweekly, null);
  eq("collapsed: no dates", r.schedule.showDates, false);
}

// ── Funding fee ──
eq("used before", summary(va({ usedBefore: true })).split(" / ").slice(1, 4).join(" / "), "VA Funding Fee (3.3%) $16,500.00 / Down Payment $0.00 / Loan Amount $516,500.00");
eq("used before pay", va({ usedBefore: true }).monthlyPay, "$3,571.91");
eq("disabled", summary(va({ disabled: true })).split(" / ")[1], "VA Funding Fee (0%) $0.00");
eq("surviving spouse", va({ eligibility: "s" }).monthlyPay, "$3,457.81");
eq("reservist = veteran", va({ eligibility: "r" }).monthlyPay, "$3,532.15");
eq("5% down", summary(va({ downPayment: "5" })).split(" / ").slice(1, 4).join(" / "), "VA Funding Fee (1.5%) $7,125.00 / Down Payment $25,000.00 / Loan Amount $482,125.00");
eq("10% down", summary(va({ downPayment: "10" })).split(" / ").slice(1, 4).join(" / "), "VA Funding Fee (1.25%) $5,625.00 / Down Payment $50,000.00 / Loan Amount $455,625.00");
eq("7% down, used before", va({ downPayment: "7", usedBefore: true }).monthlyPay, "$3,264.00");
{
  const r = va({ feeFinanced: false, hoa: "1200" });
  eq("paid upfront", summary(r).split(" / ").slice(1, 4).join(" / "), "VA Funding Fee (2.15%) $10,750.00 / Down Payment $0.00 / Loan Amount $500,000.00");
  eq("paid upfront table", table(r), "Mortgage Payment $3,457.81 $1,244,810.46 / Property Tax $500.00 $180,000.00 / Home Insurance $208.33 $75,000.00 / HOA Fee $100.00 $36,000.00 / Other Costs $416.67 $150,000.00 / Total Out-of-Pocket $4,682.81 $1,685,810.46");
  eq("paid upfront pie", pie(r), "Principal 30% / Interest 44% / Property Taxes 11% / Other Cost 9% / Home Insurance 4% / HOA Fee 2%");
}
eq("fee tiers", [
  fundingFeeRate({ downPercent: 4.99, usedBefore: false }), fundingFeeRate({ downPercent: 4.99, usedBefore: true }),
  fundingFeeRate({ downPercent: 5, usedBefore: true }), fundingFeeRate({ downPercent: 9.99 }), fundingFeeRate({ downPercent: 10 }),
  fundingFeeRate({ downPercent: 0, disabled: true }), fundingFeeRate({ downPercent: 0, eligibility: "s" }),
].join(","), "2.15,3.3,1.5,1.5,1.25,0,0");

// ── Extra payments ──
{
  const r = va({ extraMonthly: "300" });
  eq("extra sentence", r.sentence, "With the extra payment, the loan will be paid off in 23 years and 4 months.");
  eq("extra table", table(r), "Mortgage Payment $3,532.15 $988,894.34 / Extra Payment $300.00 $83,700.00 / Property Tax $500.00 $140,000.00 / Home Insurance $208.33 $58,333.33 / Other Costs $416.67 $116,666.67 / Total Out-of-Pocket $4,957.15 $1,387,594.34");
  eq("extra summary", summary(r).split(" / ").slice(4).join(" / "), "Total of 280 Mortgage Payments $988,894.34 / Total Interest $561,844.34 / Total Extra Payments $83,700.00 / Mortgage Payoff Date Feb. 2050");
  eq("extra biweekly title", r.biweekly.title, "If Payback Bi-weekly without Extra Payments");
}
eq("0% rate", summary(va({ rate: "0" })).split(" / ").slice(4, 6).join(" / "), "Total of 360 Mortgage Payments $510,750.00 / Total Interest $0.00");
eq("0% rate: no biweekly", va({ rate: "0" }).biweekly, null);

// ── Validation ──
eq("every field", va({ price: "x", downPayment: "x", years: "x", rate: "x", propertyTaxes: "x", homeInsurance: "x", hoa: "x", otherCosts: "x", startYear: "x", taxIncrease: "x", insuranceIncrease: "x", hoaIncrease: "x", otherIncrease: "x", extraMonthly: "x", extraMonthlyYear: "x", extraYearly: "x", extraYearlyYear: "x", extraOneTime: "x", extraOneTimeYear: "x" }).errors.length, 19);
eq("first errors", va({ price: "x", downPayment: "x", years: "x", rate: "x" }).errors.join(" | "),
  "Please provide a positive home price value. | Please provide a positive down payment with value between 0 and 100. | Please provide a positive loan term value. | Please provide a positive interest value.");
eq("collapsed skips optional checks", va({ moreOptions: false, propertyTaxes: "x", extraMonthly: "x" }).errors, undefined);
eq("100% down", va({ downPayment: "100" }).errors.join(), "Please provide a down payment percentage between 0 and 100%.");
eq("down over price", va({ downPayment: "600000", downUnit: "dollar" }).errors.join(), "Please provide a down payment amount that is lower than the home price.");
eq("term over 100", va({ years: "101" }).errors.join(), "This calculator can calculate loan terms of up to 100 years. Please provide a shorter loan term.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
