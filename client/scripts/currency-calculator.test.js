// Plain-Node test suite for the Currency Calculator engine's pure logic
// (formatting + arithmetic — the live-rate fetch itself needs a network
// call and isn't unit-tested here). Run with:
//   node scripts/currency-calculator.test.js
//
// formatCurrencyRate was reverse-engineered against 10 live reference
// scenarios (see the engine file's header comment and
// currency-calculator-notes.md) — every one matched "round to 5 decimal
// places, strip trailing zeros, comma-group" exactly. The values below
// are synthetic (chosen to exercise the function's own logic: trimming
// 0/1/4/5 trailing decimal digits, comma grouping at various magnitudes,
// zero, and negative numbers) rather than re-fetched from the reference,
// since the underlying rule itself is what was verified live already.

import { convertLive, convertCustomRate, formatCurrencyRate, crossRate } from "../src/utils/currencyCalculatorEngine.js";

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

// ─────────────────────────────────────────────────────────────────
// formatCurrencyRate — trailing-zero trimming, comma grouping, edge cases
// ─────────────────────────────────────────────────────────────────

{
  const cases = [
    [86.103, "86.103"],           // trims 2 trailing zeros (86.10300 -> 86.103)
    [116.13997, "116.13997"],     // no trim needed, full 5 decimals shown
    [15625.5, "15,625.5"],        // trims 4 trailing zeros + comma grouping
    [1763080, "1,763,080"],       // trims all 5 decimals + the point itself
    [0.00125, "0.00125"],         // small value, no trailing zeros to trim
    [400, "400"],                 // whole number, all decimals trimmed
    [25, "25"],
    [7971680.12804, "7,971,680.12804"], // large AND full 5 decimals together
    [2605863.5903, "2,605,863.5903"],   // large with exactly 1 trailing zero trimmed
    [0, "0"],
    [-5.5, "-5.5"],               // negative sign preserved, not part of the number
    [1000000, "1,000,000"],
  ];
  for (const [input, expected] of cases) {
    ok(`formatCurrencyRate(${input}) = "${expected}"`, formatCurrencyRate(input) === expected, `got "${formatCurrencyRate(input)}"`);
  }
}

// ─────────────────────────────────────────────────────────────────
// crossRate / convertLive — USD-based rate table cross-multiplication
// ─────────────────────────────────────────────────────────────────

{
  const rates = { USD: 1, EUR: 0.86103, JPY: 156.255 };
  ok("crossRate USD->EUR = 0.86103", crossRate(rates, "USD", "EUR") === 0.86103);
  ok("crossRate EUR->USD = 1/0.86103", Math.abs(crossRate(rates, "EUR", "USD") - 1 / 0.86103) < 1e-9);
  ok("crossRate USD->USD = 1 (identity)", crossRate(rates, "USD", "USD") === 1);
  ok("crossRate with unknown code returns null", crossRate(rates, "USD", "XYZ") === null);

  const r = convertLive(100, "USD", "EUR", rates);
  ok("convertLive forward: 100 USD -> 86.103 EUR", Math.abs(r.forward - 86.103) < 1e-9, `got ${r.forward}`);
  ok("convertLive reverse: 100 USD's rate applied backward = 100/0.86103", Math.abs(r.reverse - 100 / 0.86103) < 1e-9, `got ${r.reverse}`);

  const r250 = convertLive(250, "USD", "EUR", rates);
  ok("convertLive scales with amount (250, not fixed at 100 — verified live)", Math.abs(r250.forward - 215.2575) < 1e-9, `got ${r250.forward}`);

  ok("convertLive with an unavailable currency returns null", convertLive(100, "USD", "XYZ", rates) === null);
}

// ─────────────────────────────────────────────────────────────────
// convertCustomRate — offline "Customized Currency Exchange Rate" calc
// Verified live: rate=4, amount=100 -> "currency A 100 = currency B 400"
// / "currency B 100 = currency A 25".
// ─────────────────────────────────────────────────────────────────

{
  const r = convertCustomRate(4, 100);
  ok("convertCustomRate: 100 A * rate 4 = 400 B", r.aToB === 400, `got ${r.aToB}`);
  ok("convertCustomRate: 100 B / rate 4 = 25 A", r.bToA === 25, `got ${r.bToA}`);

  const zero = convertCustomRate(0, 100);
  ok("convertCustomRate: rate=0 doesn't crash (bToA=0, not Infinity/NaN)", zero.bToA === 0 && Number.isFinite(zero.bToA));
}

console.log(`\nCurrency Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
