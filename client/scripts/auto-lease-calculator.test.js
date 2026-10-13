// Plain-Node test suite for the Auto Lease Calculator engine.
// Run with:
//   node scripts/auto-lease-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/auto-lease-calculator.html) via plain GET requests — the
// form submits GET to the same server-rendered page. A scratch comparator
// also diffed 32 hand-picked edge cases and 200 random scenarios (both tabs,
// both rate types) against the live page: all identical.

import { calculateAutoLease, convertRateText, formatPercent2, DEFAULTS } from "../src/utils/autoLeaseCalculatorEngine.js";
import { formatMoney as $ } from "../src/utils/simpleInterestCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const BASE = {
  mode: "price", rateType: "moneyfactor", price: DEFAULTS.price, monthlyPay: DEFAULTS.monthlyPay, term: DEFAULTS.term,
  rate: DEFAULTS.moneyFactor, downPayment: DEFAULTS.downPayment, tradeIn: DEFAULTS.tradeIn,
  taxRate: DEFAULTS.taxRate, residual: DEFAULTS.residual,
};
const calc = (over = {}) => calculateAutoLease({ ...BASE, ...over });
const fmt = (x) => (x === null ? "—" : $(x));
const lease = (r) => [r.headlineValue, r.lease.depreciation, r.lease.interest, r.lease.monthlyTax, r.lease.downPayment, r.lease.upfrontTax, r.lease.totalPayments, r.lease.costToOwn].map(fmt).join(" ");
const purchase = (r) => [r.purchase.monthlyPayment, r.purchase.saleTax, r.purchase.upfrontPayment, r.purchase.loanAmount, r.purchase.totalPayments, r.purchase.interest, r.purchase.costToOwn].map(fmt).join(" ");

// ─────────────────────────────────────────────────────────────────
// 1. The two reference screenshots
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("price tab: headline label", r.headlineLabel, "Monthly Lease Payment");
  eq("price tab: lease", lease(r), "$617.99 $444.44 $133.12 $40.43 $10,000.00 $700.00 $22,247.78 $58,627.78");
  eq("price tab: APR", formatPercent2(r.lease.apr), "4.99%");
  eq("price tab: purchase", purchase(r), "$1,198.69 $3,500.00 $13,500.00 $40,000.00 $43,152.92 $3,152.92 $56,652.92");
  eq("term label", r.termText, "36");

  const p = calc({ mode: "payment" });
  eq("payment tab: headline label", p.headlineLabel, "Vehicle Price");
  eq("payment tab: lease", lease(p), "$49,436.77 $428.80 $131.95 $39.25 $10,000.00 $700.00 $21,600.00 $57,980.00");
  eq("payment tab: purchase", purchase(p), "$1,181.81 $3,460.57 $13,460.57 $39,436.77 $42,545.29 $3,108.52 $56,005.87");
}

// ─────────────────────────────────────────────────────────────────
// 2. The reference's own worked example ($517.63)
// ─────────────────────────────────────────────────────────────────
{
  const r = calc({ rateType: "interestrate", rate: "6", downPayment: "8000", tradeIn: "5000", taxRate: "6", residual: "25000" });
  eq("worked example: lease", lease(r), "$517.63 $333.33 $155.00 $29.30 $8,000.00 $480.00 $18,634.80 $58,614.80");
}

// ─────────────────────────────────────────────────────────────────
// 3. Rules pinned by single-variable live probes
// ─────────────────────────────────────────────────────────────────
{
  const t = calc({ tradeIn: "5000" });
  eq("trade-in: lease (no upfront tax on trade-in, added to cost)", lease(t), "$458.25 $305.56 $122.72 $29.98 $10,000.00 $700.00 $16,497.17 $57,877.17");
  eq("trade-in: purchase (taxed price drops)", purchase(t), "$1,048.86 $3,150.00 $13,150.00 $35,000.00 $37,758.80 $2,758.80 $55,908.80");

  const ir = calc({ rateType: "interestrate", rate: "5" });
  eq("interest-rate mode hides the APR row", ir.lease.apr, null);
  eq("interest-rate mode: lease", lease(ir), "$618.22 $444.44 $133.33 $40.44 $10,000.00 $700.00 $22,256.00 $58,636.00");
  eq("interest-rate mode: purchase", purchase(ir), "$1,198.84 $3,500.00 $13,500.00 $40,000.00 $43,158.09 $3,158.09 $56,658.09");

  const rr = calc({ mode: "payment", rateType: "interestrate", rate: "6" });
  eq("payment tab, interest rate", lease(rr), "$48,556.80 $404.36 $156.39 $39.25 $10,000.00 $700.00 $21,600.00 $57,980.00");

  const z = calc({ taxRate: "0" });
  eq("0% tax hides upfront tax and sale tax rows", `${z.lease.upfrontTax} ${z.purchase.saleTax}`, "null null");
  eq("0% tax: lease", lease(z), "$577.56 $444.44 $133.12 $0.00 $10,000.00 — $20,792.32 $54,792.32");

  const d0 = calc({ downPayment: "0" });
  eq("down 0 still shows $0 upfront tax", fmt(d0.lease.upfrontTax), "$0.00");

  const hi = calc({ residual: "45000" });
  eq("residual above cap cost: negative depreciation", lease(hi), "$40.56 $-138.89 $176.80 $2.65 $10,000.00 $700.00 $1,460.34 $60,310.34");

  const big = calc({ downPayment: "60000" });
  eq("down above price: computed literally", purchase(big), "$-299.67 $3,500.00 $63,500.00 $-10,000.00 $-10,788.23 $-788.23 $52,711.77");

  const frac = calc({ term: "36.5" });
  eq("fractional term: lease", lease(frac), "$611.48 $438.36 $133.12 $40.00 $10,000.00 $700.00 $22,319.00 $58,699.00");
  eq("fractional term: purchase", fmt(frac.purchase.monthlyPayment), "$1,183.47");
  eq("fractional term echoed as typed", frac.termText, "36.5");

  const mf0 = calc({ rate: "0" });
  eq("0 money factor: purchase is price / term", purchase(mf0), "$1,111.11 $3,500.00 $13,500.00 $40,000.00 $40,000.00 $0.00 $53,500.00");

  eq("APR rounds to 2 places", formatPercent2(calc({ rate: "0.002085" }).lease.apr), "5.00%");
  eq("APR with thousands separator", formatPercent2(calc({ rate: "5" }).lease.apr), "12,000.00%");

  const c = calc({ price: "50,000.5", downPayment: "1,000" });
  eq("commas accepted; half cent rounds up", fmt(c.purchase.saleTax), "$3,500.04");

  const neg = calc({ mode: "payment", monthlyPay: "1", rate: "0.1", residual: "100000", downPayment: "0" });
  eq("payment tab can solve a negative price", fmt(neg.headlineValue), "$-56,514.43");
}

// ─────────────────────────────────────────────────────────────────
// 4. Rate-box conversion when the Money Factor / Interest Rate menu changes
// ─────────────────────────────────────────────────────────────────
{
  eq("money factor → interest rate", convertRateText("0.00208", "interestrate"), "4.992");
  eq("interest rate → money factor (5 decimals)", convertRateText("4.992", "moneyfactor"), "0.00208");
  eq("interest rate → money factor rounds", convertRateText("5", "moneyfactor"), "0.00208");
  eq("non-numbers are left alone", convertRateText("abc", "moneyfactor"), "abc");
}

// ─────────────────────────────────────────────────────────────────
// 5. Validation (messages and order confirmed live)
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (calc(over).errors || []).join(" | ");
  const blankAll = { price: "", monthlyPay: "", term: "", rate: "", downPayment: "", tradeIn: "", taxRate: "", residual: "" };
  eq("price tab: all blank", errs(blankAll),
    "Please provide a positive auto price. | Please provide a positive down payment value. | Please provide a positive lease term value. | Please provide a positive money factor. | Please provide a positive trade-in value. | Please provide a positive sale tax value. | Please provide a positive residual value.");
  eq("payment tab: all blank", errs({ ...blankAll, mode: "payment" }),
    "Please provide a positive monthly pay. | Please provide a positive down payment value. | Please provide a positive lease term value. | Please provide a positive money factor. | Please provide a positive trade-in value. | Please provide a positive sale tax value. | Please provide a positive residual value.");
  eq("interest-rate wording", errs({ rateType: "interestrate", rate: "" }), "Please provide a positive interest value.");
  eq("price 0 rejected", errs({ price: "0" }), "Please provide a positive auto price.");
  eq("monthly pay 0 rejected", errs({ mode: "payment", monthlyPay: "0" }), "Please provide a positive monthly pay.");
  eq("term 360 allowed", errs({ term: "360" }), "");
  eq("term 360.5 rejected", errs({ term: "360.5" }), "Please provide a positive lease term value.");
  eq("tiny term allowed", errs({ term: "0.001" }), "");
  eq("rate 1000 allowed", errs({ rate: "1000" }), "");
  eq("rate 1001 rejected", errs({ rate: "1001" }), "Please provide a positive money factor.");
  eq("interest rate 1001 rejected", errs({ rateType: "interestrate", rate: "1001" }), "Please provide a positive interest value.");
  eq("tax over 100 allowed", errs({ taxRate: "1000" }), "");
  eq("text rejected", errs({ price: "abc" }), "Please provide a positive auto price.");
  eq("zero down, trade-in, tax, residual allowed", errs({ downPayment: "0", tradeIn: "0", taxRate: "0", residual: "0" }), "");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
