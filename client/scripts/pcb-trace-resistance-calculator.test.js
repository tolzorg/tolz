// Plain-Node test suite for the PCB Trace Resistance Calculator engine.
// Run with:
//   node scripts/pcb-trace-resistance-calculator.test.js
//
// Expected values come from the reference's screenshot (omnicalculator.com/other/pcb-trace-resistance) and its formula.

import { calculatePcbTraceResistance, convertText, FIELDS, FIELD_KEYS, DEFAULT_KEYS } from "../src/utils/pcbTraceResistanceCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, text, unit?], …] in typing order; ρ and α keep their defaults unless typed. */
const calc = (typed) => {
  const fields = Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [FIELDS[k].default ?? ""] }]));
  const order = [];
  const defaults = [...DEFAULT_KEYS];
  for (const [k, t, unit] of typed) {
    fields[k] = { unit: unit ?? fields[k].unit, texts: [t] };
    order.splice(0, order.length, ...order.filter((x) => x !== k), k);
    if (defaults.includes(k)) defaults.splice(defaults.indexOf(k), 1);
  }
  return calculatePcbTraceResistance(fields, order, defaults);
};
const SHOW = ["width", "length", "thickness", "ambient", "resistance", "current", "voltage"];
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : SHOW.map((k) => (r.solved.includes(k) ? `[${r.display[k][0]}]` : r.display[k][0])).join(" ") + (r.warnings.length ? ` || ${r.warnings.join(" / ")}` : ""));
const geo = [["width", "2"], ["length", "5"], ["thickness", "6"]];

// ── Forward ──
eq("2 mm × 6 mm × 5 cm at 25 °C", out(calc([...geo, ["ambient", "25"]])), "2 5 6 25 [0.00007083]  ");
eq("at 100 °C", out(calc([...geo, ["ambient", "100"]])), "2 5 6 100 [0.00009155]  ");
eq("with current → voltage drop", out(calc([...geo, ["ambient", "25"], ["current", "3"]])), "2 5 6 25 [0.00007083] 3 [0.0002125]");

// ── Reference screenshot: 3 A and 6 V give 2 Ω, which gives the ambient temperature ──
eq("screenshot: ambient from 6 V / 3 A (exact; the reference shows 7,239,508)", out(calc([...geo, ["current", "3"], ["voltage", "6"]])), "2 5 6 [7,239,588] [2] 3 6");
eq("screenshot: ambient from 2 Ω typed", out(calc([...geo, ["resistance", "2"]])), "2 5 6 [7,239,588] 2  ");

// ── Solving other boxes, units ──
eq("length from resistance", out(calc([["width", "2"], ["thickness", "6"], ["ambient", "25"], ["resistance", "0.000070833"]])), "2 [5] 6 25 0.000070833  ");
eq("width in mil", out(calc([["width", "78.74", "mil"], ["length", "5"], ["thickness", "6"], ["ambient", "25"]])), "78.74 5 6 25 [0.00007083]  ");
eq("ambient in °F (77 °F = 25 °C)", out(calc([...geo, ["ambient", "77", "F"]])), "2 5 6 77 [0.00007083]  ");
eq("α per °F", out(calc([...geo, ["ambient", "100"], ["alpha", "0.0021667", "F"]])), "2 5 6 100 [0.00009155]  ");
eq("convert 25 °C → K", convertText("ambient", "C", "K", ["25"]).join(), "298.15");
eq("convert 1.7e-6 Ω·cm → Ω·m", convertText("rho", "cm", "m", ["0.0000017"]).join(), "0.000000017");

// ── Validation ──
eq("zero width", out(calc([["width", "0"], ["length", "5"], ["thickness", "6"], ["ambient", "25"]])), "ERR Please ensure a positive value.");
eq("below absolute zero", out(calc([...geo, ["ambient", "-300"]])), "ERR Temperature should be greater than absolute zero (-459.7 °F, -273.15 °C).");
eq("solved ambient below absolute zero", out(calc([...geo, ["resistance", "-0.001"]])).split(" || ")[1], "Ambient temperature: Temperature should be greater than absolute zero (-459.7 °F, -273.15 °C). / Resistance: Please ensure a positive value.");
eq("missing", out(calc([["width", "2"]])), "MISSING length,thickness,ambient");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
