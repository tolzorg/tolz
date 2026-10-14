// Plain-Node test suite for the APR Calculator engine.
// Run with:
//   node scripts/apr-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/apr-calculator.html) via plain GET requests. A scratch
// comparator also diffed random scenarios: the mortgage form matched 159/160;
// the general form matched every payment, total, chart and note, with the APR
// identical in 154/240 and otherwise off in the third decimal (the
// reference's approximate APR solver, also seen on its Loan-family pages).

import {
  calculateGeneralApr, calculateMortgageApr, buildAmortization, GENERAL_DEFAULTS, MORTGAGE_DEFAULTS, MORTGAGE_SORRY,
} from "../src/utils/aprCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const general = (o = {}) => calculateGeneralApr({ ...GENERAL_DEFAULTS, ...o });
const mortgage = (o = {}) => calculateMortgageApr({ ...MORTGAGE_DEFAULTS, ...o });
const rows = (r) => r.rows.map((x) => x.join(" ")).join(" / ");
const pie = (r) => r.pie.filter((p) => p.value > 0).map((p) => `${p.label} ${p.value.toFixed(2)}`).join(" / ");

// ── General: default example (screenshot) ──
{
  const r = general();
  eq("default APR", r.apr, "6.563%");
  eq("default rows", rows(r), "Amount Financed $100,000.00 / Upfront Out-of-Pocket Fees $2,500.00 / Payment Every Month $1,110.21 / Total of 120 Payments $133,224.60 / Total Interest $33,224.60 / All Payments and Fees $135,724.60");
  eq("default pie", pie(r), "Principal 100000.00 / Interest 33224.60 / Fees 2500.00");
  eq("no notes", r.notes.length, 0);
}
{
  const r = general({ loanedFees: "1000" });
  eq("loaned fees APR", r.apr, "6.785%");
  eq("loaned fees rows", rows(r), "Amount Financed $101,000.00 / Upfront Out-of-Pocket Fees $2,500.00 / Payment Every Month $1,121.31 / Total of 120 Payments $134,556.85 / Total Interest $34,556.85 / All Payments and Fees $137,056.85");
  eq("loaned fees pie", pie(r), "Principal 100000.00 / Interest 33556.85 / Fees 3500.00");
}
eq("10.5 years", rows(general({ months: "6" })).split(" / ").slice(2, 4).join(" / "), "Payment Every Month $1,071.65 / Total of 126 Payments $135,027.54");
eq("10.5 years APR", general({ months: "6" }).apr, "6.539%");
for (const [o, apr] of [
  [{ compound: "annually", payback: "year" }, "6.350%"], [{ compound: "monthly", payback: "year" }, "6.510%"],
  [{ compound: "annually", payback: "month" }, "6.402%"], [{ payback: "halfyear", years: "2" }, "8.074%"],
  [{ years: "1", payback: "biweekly" }, "10.978%"], [{ payback: "weekly" }, "6.567%"], [{ payback: "quarter" }, "6.552%"],
  [{ compound: "daily" }, "6.577%"], [{ rate: "0" }, "0.504%"], [{ years: "0", months: "1" }, "36.923%"],
]) eq(`APR ${JSON.stringify(o)}`, general(o).apr, apr);
eq("no fees = rate", general({ upfrontFees: "0" }).apr, "6.000%");
eq("no fees: no Fees slice", pie(general({ upfrontFees: "0" })), "Principal 100000.00 / Interest 33224.60");
{
  const r = general({ compound: "continuously", payback: "daily" });
  eq("daily: fractional count", r.rows[3][0], "Total of 3,652.50 Payments");
  eq("daily row", rows(r).split(" / ").slice(2, 4).join(" / "), "Payment Every Day $36.41 / Total of 3,652.50 Payments $132,993.08");
  eq("daily note", r.notes.join(), "*Daily rate or pay assumes 365.25 days per year.");
}
eq("biweekly label", general({ payback: "biweekly" }).rows[2][0], "Payment Every Two Weeks");
eq("note order: payback first", general({ payback: "biweekly", compound: "daily" }).notes.join(" "), "*Biweekly rate or pay assumes 52 weeks per year. *Daily rate or pay assumes 365.25 days per year.");
eq("weekly compound note", general({ compound: "weekly" }).notes.join(), "*Weekly rate or pay assumes 52 weeks per year.");
eq("halfmonth label", general({ payback: "halfmonth" }).rows[2].join(" "), "Payment Every Half Month $554.41");
eq("blank months ok", general({ months: "" }).apr, "6.563%");
// Validation
eq("every field", general({ amount: "x", years: "x", months: "x", rate: "x", loanedFees: "x", upfrontFees: "x" }).errors.join(" | "),
  "Please provide a positive loan amount. | Please provide a positive loan term value. | Please provide a positive interest value. | Please provide a positive loaned fees value. | Please provide a positive and reasonable upfront fees value.");
eq("zero amount", general({ amount: "0" }).errors.join(" | "), "Please provide a positive loan amount. | Please provide a positive and reasonable upfront fees value.");
eq("zero term", general({ years: "0", months: "0" }).errors.join(), "Please provide a positive loan term value.");
eq("blank years", general({ years: "" }).errors.join(), "Please provide a positive loan term value.");
eq("fees = loan", general({ upfrontFees: "100000" }).errors.join(), "Please provide a positive and reasonable upfront fees value.");

// ── Amortization schedule (showAmo) ──
{
  const rowsA = buildAmortization(general().amortization);
  eq("schedule length incl. year rows", rowsA.length, 130);
  eq("first row", [rowsA[0].label, rowsA[0].interest.toFixed(2), rowsA[0].principal.toFixed(2)].join(" "), "1 500.00 610.21");
  eq("year end row", rowsA[12].yearEnd, 1);
  const half = buildAmortization(general({ payback: "halfyear", years: "2" }).amortization);
  eq("half-year labels", half.map((r) => r.label).join(","), "1. Year #1,2. Year #1,3. Year #2,4. Year #2");
  const partial = buildAmortization(general({ compound: "continuously", payback: "daily" }).amortization);
  eq("partial last row", partial[partial.length - 1].label, "3653 (Partial)");
}

// ── Mortgage ──
{
  const r = mortgage();
  eq("mortgage APR", r.apr, "6.367%");
  eq("mortgage rows", rows(r), "Loan Amount $280,000.00 / Down Payment $70,000.00 / Monthly Pay $1,714.91 / Total of 360 Payments $617,368.73 / Total Interest $337,368.73 / All Payments and Fees $620,868.73");
  eq("mortgage pie (points not shown)", pie(r), "Principal 280000.00 / Interest 337368.73 / Fees 3500.00");
}
{
  const r = mortgage({ downPayment: "10", pmi: "1200" });
  eq("PMI APR", r.apr, "6.578%");
  eq("PMI rows", rows(r).split(" / ").slice(5).join(" / "), "PMI Insurance (91 months) $100.00/month / Total PMI Insurance Payments $9,100.00 / All Payments and Fees $707,139.82");
  eq("PMI in fees", pie(r).split(" / ")[2], "Fees 12600.00");
}
eq("no PMI at 20% down", rows(mortgage({ pmi: "1200" })), rows(mortgage()));
eq("PMI ends immediately just under 20%", mortgage({ downPayment: "19.99", pmi: "1200" }).rows.length, 6);
eq("down 10 no PMI", mortgage({ downPayment: "10" }).apr, "6.354%");
eq("zero down", mortgage({ downPayment: "0" }).apr, "6.343%");
eq("term rounded up", rows(mortgage({ years: "15.4" })).split(" / ").slice(2, 4).join(" / "), "Monthly Pay $2,302.81 / Total of 192 Payments $442,139.90");
eq("points count in APR", mortgage({ points: "0" }).apr, "6.319%");
eq("2 points", mortgage({ points: "2" }).apr, "6.515%");
eq("no fees", mortgage({ loanFees: "0", points: "0" }).apr, "6.200%");
eq("51 years", mortgage({ years: "51" }).apr, "6.328%");
eq("100% down", mortgage({ downPayment: "100" }).sorry, MORTGAGE_SORRY);
eq("0% rate", mortgage({ rate: "0" }).sorry, MORTGAGE_SORRY);
eq("100 points", mortgage({ points: "100" }).sorry, MORTGAGE_SORRY);
eq("fees over loan", mortgage({ loanFees: "300000" }).sorry, MORTGAGE_SORRY);
eq("mortgage errors", mortgage({ houseValue: "x", downPayment: "x", years: "x", rate: "x", loanFees: "x", points: "x", pmi: "x" }).errors.join(" | "),
  "Please provide a positive house value. | Please provide a positive down payment. | Please provide a positive loan term value. | Please provide a positive interest value. | Please provide a positive loan fees value. | Please provide a positive points value. | Please provide a positive PMI insurance cost value.");
eq("blank PMI", mortgage({ pmi: "" }).errors.join(), "Please provide a positive PMI insurance cost value.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
