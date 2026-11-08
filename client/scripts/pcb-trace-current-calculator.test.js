// Plain-Node test suite for the PCB Trace Current Calculator engine.
// Run with:
//   node scripts/pcb-trace-current-calculator.test.js
//
// Expected values come from the reference's screenshots (omnicalculator.com/other/pcb-trace-current).

import { calculatePcbTraceCurrent, showIn, convertText, INPUTS, DEFAULT_OUTPUT_UNITS } from "../src/utils/pcbTraceCurrentCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const defaults = Object.fromEntries(Object.entries(INPUTS).map(([k, d]) => [k, d.unit]));
/** typed: [[key, text], …] in order; extra: ambient / length texts; units overrides. */
const calc = (type, typed, extra = {}, units = {}) => {
  const values = { ...extra };
  for (const [k, t] of typed) values[k] = t;
  return calculatePcbTraceCurrent({ type, values, units: { ...defaults, ...units }, order: typed.map(([k]) => k) });
};
const u = DEFAULT_OUTPUT_UNITS;
const out = (r) => {
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  const parts = [`I ${showIn("current", u.current, r.current)}`, `A ${showIn("crossSection", u.crossSection, r.crossSection)}`];
  if (r.traceTemperature !== null) parts.push(`T ${showIn("traceTemperature", u.traceTemperature, r.traceTemperature)}`);
  if (r.resistance !== null) parts.push(`R ${showIn("resistance", u.resistance, r.resistance)}`, `V ${showIn("voltageDrop", u.voltageDrop, r.voltageDrop)}`, `P ${showIn("power", u.power, r.power)}`);
  return parts.join(" ");
};
const base = [["width", "3"], ["thickness", "6"], ["rise", "2"]];

// ── Reference screenshots ──
eq("internal 3 × 6 mm, 2 °C rise, 6 °C ambient, 2 cm", out(calc("internal", base, { ambient: "6", length: "2" })),
  "I 54.42 A 18 T 8 R 0.000017636 V 0.0009597 P 0.05222");
eq("external", out(calc("external", base, { ambient: "6", length: "2" })), "I 108.84 A 18 T 8 R 0.000017636 V 0.0019194 P 0.2089");

// ── Solving and units ──
const w = calc("internal", [["thickness", "6"], ["rise", "2"], ["current", "54.42"]]);
eq("width from the current", showIn("width", "mm", w.width), "3");
eq("width is the solved box", w.solved, "width");
const r = calc("internal", [["width", "3"], ["thickness", "6"], ["current", "54.42"]]);
eq("rise from the current", showIn("rise", "C", r.rise), "2.0002");
eq("all four typed: the oldest (width) recalculated", calc("internal", [...base, ["current", "100"]]).solved, "width");
eq("thickness in oz/ft²", out(calc("internal", [["width", "10", ], ["thickness", "1"], ["rise", "10"]], {}, { width: "mil", thickness: "oz" })).split(" ").slice(0, 2).join(" "), "I 0.4428");
eq("rise in °F (3.6 °F = 2 °C)", out(calc("internal", [["width", "3"], ["thickness", "6"], ["rise", "3.6"]], {}, { rise: "F" })), "I 54.42 A 18");
eq("cross section in mil²", showIn("crossSection", "sqmil", calc("internal", base).crossSection), "27,901");
eq("convert 3 mm → mil", convertText("width", "mm", "mil", "3"), "118.1");

// ── Validation ──
eq("zero width", out(calc("internal", [["width", "0"], ["thickness", "6"], ["rise", "2"]])), "ERR Please ensure a positive value.");
eq("negative rise", out(calc("internal", [["width", "3"], ["thickness", "6"], ["rise", "-1"]])), "ERR Temperature rise cannot be negative.");
eq("zero rise gives no current", out(calc("internal", [["width", "3"], ["thickness", "6"], ["rise", "0"]])), "ERR Maximum current: Please ensure a positive value.");
eq("ambient below absolute zero", out(calc("internal", base, { ambient: "-300" })), "ERR Temperature must be greater than -273.15 °C (-459.7 °F, 0 K).");
eq("missing", out(calc("internal", [["width", "3"]])), "MISSING thickness,rise");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
