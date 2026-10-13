// Plain-Node test suite for the Cash Back or Low Interest Calculator engine.
// Run with:
//   node scripts/cash-back-or-low-interest-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/cash-back-or-low-interest-calculator.html) via plain GET
// requests — the form submits GET to the same server-rendered page.

import { calculateCashBackOrLowInterest, DEFAULTS, NOT_LOWER_NOTE } from "../src/utils/cashBackOrLowInterestEngine.js";
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
const calc = (over = {}) => calculateCashBackOrLowInterest({ ...DEFAULTS, state: "", includeFees: false, ...over });
const offer = (o) => [o.loan, o.tax, o.upfront, o.monthly, o.totalPayments, o.interest, o.totalCost].map($).join(" ");

// ─────────────────────────────────────────────────────────────────
// 1. The two reference screenshots
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("headline", r.headline, "The Low Interest Rate Offer is Better!");
  eq("sentence", r.sentence, "The low rate will save you $3,092 in interest, which is larger than the cash back of $1,000.");
  eq("cash back offer", offer(r.cashBackOffer), "$39,000.00 $3,500.00 $15,500.00 $735.98 $44,158.69 $5,158.69 $59,658.69");
  eq("low rate offer", offer(r.lowRateOffer), "$40,000.00 $3,500.00 $15,500.00 $701.11 $42,066.62 $2,066.62 $57,566.62");
  eq("term label", r.termText, "60");

  const f = calc({ includeFees: true });
  eq("fees in loan: sentence", f.sentence, "The low rate will save you $3,535 in interest, which is larger than the cash back of $1,000.");
  eq("fees in loan: cash back", offer(f.cashBackOffer), "$44,500.00 $3,500.00 $10,000.00 $839.77 $50,386.19 $5,886.19 $60,386.19");
  eq("fees in loan: low rate", offer(f.lowRateOffer), "$45,500.00 $3,500.00 $10,000.00 $797.51 $47,850.78 $2,350.78 $57,850.78");
}

// ─────────────────────────────────────────────────────────────────
// 2. State tax rules (trade-in credit, rebate credit)
// ─────────────────────────────────────────────────────────────────
{
  const taxes = (state) => { const r = calc({ tradeIn: "5000", state }); return `${$(r.cashBackOffer.tax)} ${$(r.lowRateOffer.tax)}`; };
  eq("no state: trade-in credited, rebate not", taxes(""), "$3,150.00 $3,150.00");
  eq("California: no trade-in credit", taxes("California"), "$3,500.00 $3,500.00");
  eq("Michigan: no trade-in credit", taxes("Michigan"), "$3,500.00 $3,500.00");
  eq("Texas: both credits", taxes("Texas"), "$3,080.00 $3,150.00");
  eq("Kentucky: rebate credit only", taxes("Kentucky"), "$3,430.00 $3,500.00");
  eq("Alabama: trade-in credit only", taxes("Alabama"), "$3,150.00 $3,150.00");
  eq("Oregon (no trade-in)", $(calc({ state: "Oregon" }).cashBackOffer.tax), "$3,430.00");
  const t = calc({ tradeIn: "5000" });
  eq("total cost includes the trade-in", $(t.cashBackOffer.totalCost), "$58,647.32");
  eq("trade-in reduces the loan", $(t.cashBackOffer.loan), "$34,000.00");
}

// ─────────────────────────────────────────────────────────────────
// 3. Verdicts and edges
// ─────────────────────────────────────────────────────────────────
{
  eq("cash back wins", calc({ cashBack: "5000" }).sentence, "The low rate will save you only $2,563 in interest, yet the cash back is $5,000.");
  eq("cash back headline", calc({ cashBack: "5000" }).headline, "The Cash Back Offer is Better!");
  eq("zero cash back", calc({ cashBack: "0" }).sentence, "The low rate will save you $3,224 in interest, which is larger than the cash back of $0.");
  eq("similar", calc({ cashBack: "2159.22", rateHigh: "6", rateLow: "4", price: "56507", downPayment: "10889", state: "Mississippi", taxRate: "5", fees: "0" }).sentence,
    "The low rate will save you $2,163 in interest, which is similar to the cash back of $2,159.");
  const v = (C) => calc({ cashBack: String(C) }).verdict;
  eq("upper edge: 2826.02 similar", v(2826.02), "similar");
  eq("upper edge: 2826.00 low", v(2826.0), "low");
  eq("lower edge: 2847.80 similar", v(2847.8), "similar");
  eq("lower edge: 2848.00 cash back", v(2848), "cashBack");
  eq("Oregon $2,700: low wins on interest even though cash-back total is lower", calc({ cashBack: "2700", state: "Oregon" }).verdict, "low");
  eq("down payment above price", calc({ downPayment: "60000" }).sentence, "The low rate will save you only $-938 in interest, yet the cash back is $1,000.");
  eq("negative payment (low-rate offer)", $(calc({ downPayment: "60000" }).lowRateOffer.monthly), "$-175.28");
  eq("1-month term (low-rate offer)", $(calc({ term: "1" }).lowRateOffer.monthly), "$40,066.67");
  eq("fractional term (low-rate offer)", $(calc({ term: "12.5" }).lowRateOffer.monthly), "$3,236.11");
  ok("zero tax hides the Sale Tax row", calc({ taxRate: "0" }).cashBackOffer.tax === 0);
  eq("low rate not lower", calc({ rateLow: "5" }).note, NOT_LOWER_NOTE);
  eq("0% / 0%", calc({ rateHigh: "0", rateLow: "0" }).note, NOT_LOWER_NOTE);
  // Reference bug, replicated: financed low-rate loan uses the cash-back tax.
  const bug = calc({ cashBack: "90", rateHigh: "1.2", rateLow: "0.4", price: "78480", term: "72", downPayment: "18351", state: "Texas", fees: "1425", includeFees: true });
  eq("financed tax bug: low loan", $(bug.lowRateOffer.loan), "$67,041.30");
  eq("financed tax bug: its own tax row", $(bug.lowRateOffer.tax), "$5,493.60");
  eq("financed tax bug: total cost", $(bug.lowRateOffer.totalCost), "$86,211.19");
}

// ─────────────────────────────────────────────────────────────────
// 4. Validation
// ─────────────────────────────────────────────────────────────────
{
  const ALL = "Please provide a positive cash back amount. | Please provide a positive auto price. | Please provide a positive down payment value. | Please provide a positive loan term value. | Please provide a positive interest with cash offer value. | Please provide a positive interest without cash offer value. | Please provide a positive trade-in value. | Please provide a positive sale tax value. | Please provide a positive title, registration and other fees value.";
  const every = (x) => Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, x]));
  const errs = (over) => (calc(over).errors || []).join(" | ");
  eq("all invalid", errs(every("x")), ALL);
  eq("all blank", errs(every("")), ALL);
  eq("all negative", errs(every("-1")), ALL);
  eq("term 0", errs({ term: "0" }), "Please provide a positive loan term value.");
  eq("auto price 0 is allowed", errs({ price: "0" }), "");
  eq("tax over 100 is allowed", errs({ taxRate: "101" }), "");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
