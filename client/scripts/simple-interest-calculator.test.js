// Plain-Node test suite for the Simple Interest Calculator engine. Run with:
//   node scripts/simple-interest-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/simple-interest-calculator.html) via plain GET requests —
// the form submits GET to the same server-rendered page.

import { calculateSimpleInterest, DEFAULTS, formatMoney } from "../src/utils/simpleInterestCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const calc = (mode, over = {}) => calculateSimpleInterest({ mode, ...DEFAULTS, rateBase: "y", termBase: "y", ...over });
const rowText = (r) => `${r.period} ${formatMoney(r.interest)} ${formatMoney(r.balance)}`;
const lastRow = (res) => rowText(res.growth.schedule[res.growth.schedule.length - 1]);

// ─────────────────────────────────────────────────────────────────
// 1. The four reference screenshots
// ─────────────────────────────────────────────────────────────────
{
  const r = calc("balance");
  eq("balance headline", JSON.stringify(r.headline), JSON.stringify([["End Balance:", "$26,000.00"], ["Total Interest:", "$6,000.00"]]));
  eq("balance step 1", r.steps[0][1], "$20000 × 3% × 10");
  eq("balance step 3", r.steps[2][1], "$20000 + $6,000.00");
  eq("balance rows", r.growth.schedule.length, 10);
  eq("balance row 1", rowText(r.growth.schedule[0]), "1 $600.00 $20,600.00");
  eq("balance row 10", lastRow(r), "10 $600.00 $26,000.00");
  eq("balance ticks", r.growth.tickLabels.join(","), "0 yr,1 yr,2 yr,3 yr,4 yr,5 yr,6 yr,7 yr,8 yr,9 yr,10 yr");
}
{
  const r = calc("principal");
  eq("principal headline", r.headline.map((h) => h[1]).join(" "), "$23,076.92 $6,923.08");
  eq("principal step 1", r.steps[0][1], "= $30000 ÷ (1 + 3% × 10)");
  eq("principal step 3", r.steps[2][1], "= $30000 - $23,076.92");
  eq("principal row 1", rowText(r.growth.schedule[0]), "1 $692.31 $23,769.23");
  eq("principal row 4", rowText(r.growth.schedule[3]), "4 $692.31 $25,846.15");
  eq("principal row 10", lastRow(r), "10 $692.31 $30,000.00");
}
{
  const r = calc("term");
  eq("term headline", r.headline[0].join(" "), "Terms: 16.67 years");
  eq("term step", r.steps[0][1], "= ($30000 ÷ $20000 - 1) ÷ 3%");
  eq("term rows", r.growth.schedule.length, 17);
  eq("term last row uses ROUNDED term", lastRow(r), "16.67 $402.00 $30,002.00");
  eq("term ticks", r.growth.tickLabels.filter(Boolean).join(","), "0 yr,5 yr,10 yr,15 yr");
  eq("term pie interest", formatMoney(r.interest), "$10,000.00");
}
{
  const r = calc("rate");
  eq("rate headline", r.headline[0].join(" "), "Rate: 5.00% per year");
  eq("rate step (reference labels it 'Term')", r.steps[0].join(" "), "Term = ($30000 ÷ $20000 - 1) ÷ 10");
  eq("rate row 10", lastRow(r), "10 $1,000.00 $30,000.00");
}

// ─────────────────────────────────────────────────────────────────
// 2. Mixed units
// ─────────────────────────────────────────────────────────────────
{
  let r = calc("balance", { rateBase: "m" });
  eq("m-rate/y-term step", r.steps[0][1], "$20000 × 3% × 10 × 12");
  eq("m-rate/y-term end", r.headline[0][1], "$92,000.00");
  eq("m-rate/y-term row", rowText(r.growth.schedule[0]), "1 $7,200.00 $27,200.00");

  r = calc("balance", { term: "30", termBase: "m" });
  eq("y-rate/m-term step", r.steps[0][1], "$20000 × 3% × 30 ÷ 12");
  eq("y-rate/m-term end", r.headline[0][1], "$21,500.00");
  eq("y-rate/m-term row 30", lastRow(r), "30 $50.00 $21,500.00");
  eq("month ticks", r.growth.tickLabels.filter(Boolean).join(","), "0 mo,5 mo,10 mo,15 mo,20 mo,25 mo,30 mo");

  r = calc("balance", { term: "30", termBase: "m", rateBase: "m" });
  eq("m/m step", r.steps[0][1], "$20000 × 3% × 30");
  eq("m/m end", r.headline[0][1], "$38,000.00");

  r = calc("principal", { rate: "3", rateBase: "m", term: "30", termBase: "m" });
  eq("principal m/m", r.headline.map((h) => h[1]).join(" "), "$15,789.47 $14,210.53");
  eq("principal m/m row 11", rowText(r.growth.schedule[10]), "11 $473.68 $21,000.00");

  r = calc("principal", { term: "30", termBase: "m" });
  eq("principal y/m step", r.steps[0][1], "= $30000 ÷ (1 + 3% × 30 ÷ 12)");
  eq("principal y/m", r.headline[0][1], "$27,906.98");
  eq("principal y/m row 1", rowText(r.growth.schedule[0]), "1 $69.77 $27,976.74");

  r = calc("principal", { rateBase: "m", term: "2.5" });
  eq("principal m/y step", r.steps[0][1], "= $30000 ÷ (1 + 3% × 2.5 × 12)");
  eq("principal m/y fractional row", lastRow(r), "2.5 $2,842.11 $30,000.00");
  eq("principal m/y ticks", r.growth.tickLabels.join(","), "0 yr,1 yr,2 yr,2.5 yr");

  r = calc("principal", { term: "3.5", termBase: "m" });
  eq("principal 3.5 mo row", lastRow(r), "3.5 $37.17 $30,000.00");

  r = calc("term", { rateBase: "m" });
  eq("term m-rate", r.headline[0][1], "1.39 years");
  eq("term m-rate step", r.steps[0][1], "= ($30000 ÷ $20000 - 1) ÷ (3% × 12)");
  ok("term 1.39 years → no schedule, pie still shown", r.growth === null && r.showPie);

  r = calc("term", { rate: "1", rateBase: "m" });
  eq("term 4.17 last row", lastRow(r), "4.17 $408.00 $30,008.00");
  r = calc("term", { rate: "0.5", rateBase: "m" });
  eq("term 8.33 last row", lastRow(r), "8.33 $396.00 $29,996.00");
  r = calc("term", { rate: "4.9999" });
  eq("term rounding to an integer drops the fractional row", lastRow(r), "10 $999.98 $29,999.80");
  r = calc("term", { balance: "32000" });
  eq("term exact 20", lastRow(r), "20 $600.00 $32,000.00");
  eq("term exact 20 ticks", r.growth.tickLabels.filter(Boolean).join(","), "0 yr,5 yr,10 yr,15 yr,20 yr");
  r = calc("term", { rate: "0.03" });
  eq("term thousands separator", r.headline[0][1], "1,666.67 years");

  r = calc("rate", { term: "30", termBase: "m" });
  eq("rate m-term", r.headline[0][1], "20.00% per year");
  eq("rate m-term step", r.steps[0][1], "= ($30000 ÷ $20000 - 1) ÷ (30 ÷ 12)");
  eq("rate m-term row 2", rowText(r.growth.schedule[1]), "2 $333.33 $20,666.67");
  r = calc("rate", { term: "7" });
  eq("rate uses EXACT (unrounded) rate", rowText(r.growth.schedule[1]), "2 $1,428.57 $22,857.14");
  r = calc("rate", { term: "7.5" });
  eq("rate 7.5", r.headline[0][1], "6.67% per year");
  eq("rate 7.5 last row", lastRow(r), "7.5 $666.67 $30,000.00");
  // Half-cent per-period interest ($2,778.635): rows are differences of
  // cumulative interest, so float noise makes exactly row 14 a cent lower.
  r = calc("rate", { balance: "93134.13", principal: "43118.70", term: "18" });
  eq("half-cent row 13", rowText(r.growth.schedule[12]), "13 $2,778.64 $79,240.96");
  eq("half-cent row 14", rowText(r.growth.schedule[13]), "14 $2,778.63 $82,019.59");
  eq("half-cent row 15", rowText(r.growth.schedule[14]), "15 $2,778.64 $84,798.23");
  r = calc("rate", { balance: "149557.47", principal: "61606", term: "78", termBase: "m" });
  eq("half-cent balance rounds up", rowText(r.growth.schedule[38]), "39 $1,127.58 $105,581.74");
  r = calc("rate", { balance: "30000000", principal: "2", term: "1" });
  eq("rate thousands separator", r.headline[0][1], "1,499,999,900.00% per year");
}

// ─────────────────────────────────────────────────────────────────
// 3. Input echo, rounding and fractional terms
// ─────────────────────────────────────────────────────────────────
{
  let r = calc("balance", { principal: "20,000.50", rate: "3.50", term: "010" });
  eq("echo as typed", r.steps[0][1], "$20000.50 × 3.50% × 010");
  eq("echo end", r.headline[0][1], "$27,000.68");
  r = calc("balance", { principal: "1e3", rate: ".5", term: "3" });
  eq("echo exponent", r.steps[0][1], "$1e3 × .5% × 3");
  eq("exponent end", r.headline[0][1], "$1,015.00");
  r = calc("balance", { principal: " 20000 ", term: "3" });
  eq("trimmed", r.steps[0][1], "$20000 × 3% × 3");
  r = calc("balance", { principal: "1234.567", rate: "3.25", term: "7" });
  eq("odd principal", r.headline.map((h) => h[1]).join(" "), "$1,515.43 $280.86");
  eq("odd principal row 3", rowText(r.growth.schedule[2]), "3 $40.12 $1,354.94");
  r = calc("balance", { term: "5.50" });
  eq("fractional label as typed", lastRow(r), "5.50 $300.00 $23,300.00");
  eq("fractional ticks", r.growth.tickLabels.join(","), "0 yr,1 yr,2 yr,3 yr,4 yr,5 yr,5.50 yr");
  r = calc("balance", { term: "2.001" });
  eq("just over 2 shows schedule", lastRow(r), "2.001 $0.60 $21,200.60");
}

// ─────────────────────────────────────────────────────────────────
// 4. Bar-label step rule
// ─────────────────────────────────────────────────────────────────
{
  const ticks = (term) => calc("balance", { term }).growth.tickLabels.filter(Boolean).map((t) => t.replace(" yr", "")).join(",");
  const expected = {
    11: "0,5,10", 15: "0,5,10,15", 30: "0,5,10,15,20,25,30", 31: "0,10,20,30", 51: "0,10,20,30,40,50",
    "10.5": "0,1,2,3,4,5,6,7,8,9,10,10.5", "12.5": "0,5,10", "18.9": "0,5,10,15", "19.2": "0,5,10,15,19.2",
    "19.5": "0,5,10,15,19.5", "30.5": "0,5,10,15,20,25,30", "38.5": "0,10,20,30", "39.2": "0,10,20,30,39.2",
    "99.5": "0,10,20,30,40,50,60,70,80,90,99.5",
  };
  for (const [term, want] of Object.entries(expected)) eq(`ticks ${term}`, ticks(term), want);
  eq("month ticks 61", calc("balance", { term: "61", termBase: "m" }).growth.tickLabels.filter(Boolean).join(","), "0 mo,10 mo,20 mo,30 mo,40 mo,50 mo,60 mo");
}

// ─────────────────────────────────────────────────────────────────
// 5. Visibility rules
// ─────────────────────────────────────────────────────────────────
{
  const vis = (mode, over) => { const r = calc(mode, over); return `${r.showPie ? "pie" : "-"}/${r.growth ? "bar" : "-"}`; };
  eq("term 2 hidden", vis("balance", { term: "2" }), "pie/-");
  eq("term 1 month hidden", vis("balance", { term: "1", termBase: "m" }), "pie/-");
  eq("term 3 months shown", vis("balance", { term: "3", termBase: "m" }), "pie/bar");
  eq("term 99.5 shown", vis("balance", { term: "99.5" }), "pie/bar");
  eq("term 100 hidden", vis("balance", { term: "100" }), "pie/-");
  eq("100 months hidden", vis("balance", { term: "100", termBase: "m" }), "pie/-");
  eq("term 200 hidden", vis("balance", { term: "200" }), "pie/-");
  eq("rate 0 → no charts", vis("balance", { rate: "0" }), "-/-");
  eq("principal 0 → no charts", vis("balance", { principal: "0" }), "-/-");
  eq("negative principal → no charts", vis("balance", { principal: "-5000" }), "-/-");
  eq("negative rate → no charts", vis("balance", { rate: "-3" }), "-/-");
  eq("negative term → no charts", vis("balance", { term: "-10" }), "-/-");
  eq("tiny rate still charts", vis("balance", { rate: "0.001" }), "pie/bar");
  eq("rate tab with negative term: pie only", vis("rate", { term: "-10" }), "pie/-");
  eq("term tab balance just above principal: pie only", vis("term", { balance: "20000.01" }), "pie/-");
  eq("term tab 2.00 years hidden", vis("term", { rate: "25" }), "pie/-");
  eq("term tab 2.04 years shown", vis("term", { rate: "24.5" }), "pie/bar");
}

// ─────────────────────────────────────────────────────────────────
// 6. Permissive / edge results
// ─────────────────────────────────────────────────────────────────
{
  let r = calc("balance", { principal: "-5000" });
  eq("negative principal", r.headline.map((h) => h[1]).join(" "), "$-6,500.00 $-1,500.00");
  eq("negative principal step", r.steps[2][1], "$-5000 + $-1,500.00");
  r = calc("balance", { rate: "-3" });
  eq("negative rate", r.steps[0][1], "$20000 × -3% × 10");
  eq("negative rate end", r.headline[0][1], "$14,000.00");
  r = calc("principal", { rate: "-20" });
  eq("principal negative rate", r.headline.map((h) => h[1]).join(" "), "$-30,000.00 $60,000.00");
  eq("principal negative rate step", r.steps[0][1], "= $30000 ÷ (1 + -20% × 10)");
  ok("principal zero denominator → empty", calc("principal", { rate: "-10" }).empty === true);
  r = calc("term", { balance: "10000" });
  eq("negative term", r.headline[0][1], "-16.67 years");
  r = calc("term", { balance: "20000" });
  eq("zero term", r.headline[0][1], "0.00 years");
  r = calc("term", { principal: "-20000" });
  eq("term negative principal", r.steps[0][1], "= ($30000 ÷ $-20000 - 1) ÷ 3%");
  eq("term negative principal value", r.headline[0][1], "-83.33 years");
  r = calc("rate", { balance: "10000" });
  eq("negative rate result", r.headline[0][1], "-5.00% per year");
  eq("rate 0 message", calc("term", { rate: "0" }).message, "We cannot calculate when rate is 0%.");
  eq("term 0 message", calc("rate", { term: "0" }).message, "We cannot calculate when term is 0.");
}

// ─────────────────────────────────────────────────────────────────
// 7. Validation messages (reference's own order per tab)
// ─────────────────────────────────────────────────────────────────
{
  const errs = (mode, over) => (calc(mode, over).errors || []).join(" | ");
  const blank = { balance: "", principal: "", rate: "", term: "" };
  eq("balance tab order", errs("balance", blank),
    "Please provide a numerical principal value. | Please provide a numerical term value. | Please provide a numerical rate value.");
  eq("principal tab order", errs("principal", blank),
    "Please provide a numerical end balance value. | Please provide a numerical term value. | Please provide a numerical rate value.");
  eq("term tab order", errs("term", blank),
    "Please provide a numerical end balance value. | Please provide a numerical principal value. | Please provide a numerical rate value.");
  eq("rate tab order", errs("rate", blank),
    "Please provide a numerical end balance value. | Please provide a numerical principal value. | Please provide a numerical term value.");
  eq("non-numeric term", errs("balance", { term: "x" }), "Please provide a numerical term value.");
  eq("$ prefix rejected", errs("balance", { principal: "$20000" }), "Please provide a numerical principal value.");
  eq("% suffix rejected", errs("balance", { rate: "3%" }), "Please provide a numerical rate value.");
  eq("trailing letters rejected", errs("balance", { principal: "20000abc" }), "Please provide a numerical principal value.");
  eq("term tab zero principal", errs("term", { principal: "0" }), "Please provide a non-zero principal value.");
  eq("rate tab zero principal", errs("rate", { principal: "0" }), "Please provide a non-zero principal value.");
  eq("balance tab zero principal is fine", errs("balance", { principal: "0" }), "");
  eq("balance tab ignores end balance field", errs("balance", { balance: "junk" }), "");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
