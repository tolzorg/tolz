// Plain-Node test suite for the Container Loading Calculator engine.
// Run with:
//   node scripts/container-loading-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/container-loading) by entering each
// scenario in a browser and reading the Results box back.

import { calculateContainerLoading, arrangementText, presetVolume, FIELDS, FIELD_KEYS } from "../src/utils/containerLoadingCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, text | [texts], unit?], …] in typing order. */
const calc = (type, typed) => {
  const fields = Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
  const order = [];
  for (const [k, t, unit] of typed) {
    fields[k] = { unit: unit ?? fields[k].unit, texts: Array.isArray(t) ? t : [t] };
    order.splice(0, order.length, ...order.filter((x) => x !== k), k);
  }
  return calculateContainerLoading(type, fields, order);
};
const out = (r) => {
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  const a = arrangementText(r.packing);
  return `${r.boxes} ${r.packing.utilization}% ${r.layers}×${r.perLayer} W:${a.width} L:${a.length}`;
};
const pkg = (a, b, c) => [["pkgL", a], ["pkgW", b], ["pkgH", c]];

// ── Live ──
eq("screenshot 20ft, 3 × 5 × 3 cm", out(calc("std20", pkg("3", "5", "3"))), "727,748 98.83% 79×9,212 W:side B L:side A");
eq("20ft volume", presetVolume("std20", "m3").join(), "33.14");
eq("40ft high cube, 60 × 40 × 50", out(calc("hc40", pkg("60", "40", "50"))), "500 78.9% 5×100 W:side B L:side A");
eq("40HC volume", presetVolume("hc40", "m3").join(), "76.05");
eq("side C from the package volume", out(calc("std20", [["pkgL", "60"], ["pkgW", "40"], ["pkgVol", "120000"]])), "180 65.18% 4×45 W:side B L:side A");
eq("solved side shown", calc("std20", [["pkgL", "60"], ["pkgW", "40"], ["pkgVol", "120000"]]).display.pkgH.join(), "50");
eq("too wide", out(calc("std20", pkg("60", "240", "50"))), "ERR That's wider than your container, you can't fit this item inside. Please input a lower value.");
eq("one box: 90 cm in a 1 m cube", out(calc("custom", [["cntL", "1"], ["cntW", "1"], ["cntH", "1"], ...pkg("90", "90", "90")])), "1 72.9% 1×1 W:side A L:side B");

eq("FAQ: 5 × 5 × 5 in packages in a 20ft", out(calc("std20", [["pkgL", "5", "in"], ["pkgW", "5", "in"], ["pkgH", "5", "in"]])).split(" ")[0], "14,904");

// ── Exact floors (the reference's float division gives 24 here) ──
eq("10 cm boxes in 70 × 30 × 30 cm", out(calc("custom", [["cntL", "0.7"], ["cntW", "0.3"], ["cntH", "0.3"], ...pkg("10", "10", "10")])), "63 100% 3×21 W:side A L:side B");

// ── Custom container, units, validation ──
eq("custom height from the volume", calc("custom", [["cntL", "6"], ["cntW", "2"], ["cntVol", "30"], ...pkg("50", "50", "50")]).display.cntH.join(), "2.5");
eq("feet / inches package", out(calc("std20", [["pkgL", ["1", "0"], "ftin"], ["pkgW", ["1", "0"], "ftin"], ["pkgH", ["1", "0"], "ftin"]])),
  out(calc("std20", pkg("30.48", "30.48", "30.48"))));
eq("container too long", out(calc("custom", [["cntL", "400"], ["cntW", "2"], ["cntH", "2"], ...pkg("10", "10", "10")])),
  "ERR Are you sure about this value? The biggest container ships are around 400 meters long. Please input a lower value.");
eq("container too tall", out(calc("custom", [["cntL", "10"], ["cntW", "2"], ["cntH", "60"], ...pkg("10", "10", "10")])), "ERR Please input a value lower than 60 meters.");
eq("zero package side", out(calc("std20", pkg("0", "10", "10"))), "ERR Package length (side A): Length must be greater than 0.");
eq("missing package height", out(calc("std20", [["pkgL", "10"], ["pkgW", "10"]])), "MISSING pkgH");
eq("custom container blank", out(calc("custom", pkg("10", "10", "10"))), "MISSING cntL,cntW,cntH");
eq("preset ignores typed container boxes", out(calc("std20", [["cntL", "1"], ...pkg("3", "5", "3")])), "727,748 98.83% 79×9,212 W:side B L:side A");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
