// Plain-Node test suite for the Estate Tax Calculator engine. Run with:
//   node scripts/estate-tax-calculator.test.js
//
// Unlike most of this app's tax-related calculators, this reference page
// (calculator.net/estate-tax-calculator.html) DOES have a working GET
// query-string interface — every case below was verified via plain curl
// requests against the live site. See estate-tax-calculator-notes.md.

import { calculateEstateTax } from "../src/utils/estateTaxCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function approx(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// 1. The reference's own screenshot scenario. VERIFIED EXACT live:
//    Net taxable estate = $71, within the exemption, $0 federal tax.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateEstateTax({
    residence: 32, stock: 5, saving: 34, vehicle: 5, retirement: 6,
    lifeinsurance: 62, otherasset: 3,
    debt: 3, funeral: 3, charitable: 67, statetax: 3,
    lifetimegifted: 86,
  });
  ok("screenshot: netTaxableEstate = $71", approx(r.netTaxableEstate, 71));
  ok("screenshot: withinExemption = true", r.withinExemption === true);
  ok("screenshot: federalEstateTax = $0", approx(r.federalEstateTax, 0));
  ok("screenshot: no prior-year comparison shown", r.prior === null);
}

// ─────────────────────────────────────────────────────────────────
// 2. The exact 2026 exemption boundary — verified live via bisection:
//    exactly $15,000,000 is still within the exemption; $1 more crosses
//    into the taxable branch (even though the ROUNDED tax on $1 is $0,
//    the SENTENCE TEMPLATE already switches).
// ─────────────────────────────────────────────────────────────────
{
  let r = calculateEstateTax({ residence: 15000000 });
  ok("exactly at exemption: withinExemption = true", r.withinExemption === true);
  ok("exactly at exemption: federalEstateTax = $0", approx(r.federalEstateTax, 0));

  r = calculateEstateTax({ residence: 15000001 });
  ok("$1 over exemption: withinExemption = false", r.withinExemption === false);
  ok("$1 over exemption: taxableAfterExemption = $1", approx(r.taxableAfterExemption, 1));
  ok("$1 over exemption: federalEstateTax = $0.40", approx(r.federalEstateTax, 0.4));
}

// ─────────────────────────────────────────────────────────────────
// 3. Flat 40% rate confirmed at several excess amounts — NOT the real,
//    graduated 18%-40% federal estate/gift tax bracket schedule (a
//    graduated schedule would give ~$23,800 on a $100,000 excess, not
//    the $40,000 the reference actually shows).
// ─────────────────────────────────────────────────────────────────
{
  const cases = [
    [15010000, 4000],
    [15050000, 20000],
    [15100000, 40000],
    [16000000, 400000],
    [20000000, 2000000],
  ];
  for (const [residence, expectedTax] of cases) {
    const r = calculateEstateTax({ residence });
    ok(`flat 40% rate @ residence=${residence}`, approx(r.federalEstateTax, expectedTax), r.federalEstateTax);
  }
}

// ─────────────────────────────────────────────────────────────────
// 4. After-tax value = netTaxableEstate - federalEstateTax (NOT
//    including the lifetime-gifted amount, which was already given
//    away during the person's lifetime).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateEstateTax({ residence: 16000000 });
  ok("afterTaxValue = netTaxableEstate - federalEstateTax", approx(r.afterTaxValue, 15600000));
}

// ─────────────────────────────────────────────────────────────────
// 5. Lifetime gifted amount competes for the SAME unified exemption as
//    the estate itself — verified live: a tiny net estate plus a huge
//    lifetime-gifted figure alone exceeding the exemption still
//    produces a nonzero tax on the combined total.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateEstateTax({ residence: 100, lifetimegifted: 15000000 });
  ok("lifetime gifts use up the same exemption", approx(r.federalEstateTax, 40));
}

// ─────────────────────────────────────────────────────────────────
// 6. Net taxable estate can go NEGATIVE (liabilities exceed assets) —
//    the reference allows this literally, no floor at 0, and still
//    correctly combines with a large lifetime-gifted figure.
// ─────────────────────────────────────────────────────────────────
{
  let r = calculateEstateTax({ residence: 10, debt: 50 });
  ok("negative net estate: withinExemption = true", r.withinExemption === true);
  ok("negative net estate value", approx(r.netTaxableEstate, -40));

  r = calculateEstateTax({ residence: 10, debt: 50, lifetimegifted: 15000100 });
  ok("negative net estate + large lifetime gift: netTaxableEstate unaffected", approx(r.netTaxableEstate, -40));
  ok("negative net estate + large lifetime gift: taxableAfterExemption", approx(r.taxableAfterExemption, 60));
  ok("negative net estate + large lifetime gift: federalEstateTax", approx(r.federalEstateTax, 24));
  ok("negative net estate + large lifetime gift: afterTaxValue can go negative too", approx(r.afterTaxValue, -64));
}

// ─────────────────────────────────────────────────────────────────
// 7. Prior-year ("If it was 2025...") comparison — VERIFIED EXACT live:
//    2025 exemption = $13,990,000, same flat 40% rate. Only shown when
//    the CURRENT year's own calculation is over the exemption.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateEstateTax({ residence: 16000000 });
  ok("prior-year comparison present when over exemption", r.prior !== null);
  ok("prior-year (2025) exemption is $13,990,000", r.prior.exemption === 13990000);
  ok("prior-year taxableAfterExemption", approx(r.prior.taxableAfterExemption, 2010000));
  ok("prior-year federalEstateTax", approx(r.prior.federalEstateTax, 804000));
  ok("prior-year afterTaxValue", approx(r.prior.afterTaxValue, 15196000));

  // Confirmed live: even though $14.5M exceeds the 2025 exemption, no
  // "if it was 2025" comparison appears if the CURRENT year is within
  // its own (larger) exemption.
  const r2 = calculateEstateTax({ residence: 14500000 });
  ok("no prior-year comparison when within CURRENT year's exemption", r2.prior === null);
}

// ─────────────────────────────────────────────────────────────────
// 8. All-zero input is a valid, non-crashing default state.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateEstateTax({});
  ok("all-zero input: netTaxableEstate = 0", r.netTaxableEstate === 0);
  ok("all-zero input: withinExemption = true", r.withinExemption === true);
  ok("all-zero input: federalEstateTax = 0", r.federalEstateTax === 0);
}

console.log(`\nEstate Tax Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
