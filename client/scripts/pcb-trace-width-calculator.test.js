// Plain-Node test suite for the PCB Trace Width Calculator engine.
// Run with:
//   node scripts/pcb-trace-width-calculator.test.js
//
// Expected values come from the reference's screenshots and the LIVE reference (omnicalculator.com/other/pcb-trace-width).

import { calculatePcbTraceWidth, showIn, convertText, DEFAULT_OUTPUT_UNITS, INPUTS } from "../src/utils/pcbTraceWidthCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const defaults = Object.fromEntries(Object.entries(INPUTS).map(([k, d]) => [k, d.unit]));
const calc = (type, values, units = {}) => calculatePcbTraceWidth({ type, values, units: { ...defaults, ...units } });
const out = (r) => {
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  const u = DEFAULT_OUTPUT_UNITS;
  const parts = [`W ${showIn("width", u.width, r.width)}`, `A ${showIn("crossSection", u.crossSection, r.crossSection)}`];
  if (r.traceTemperature !== null) parts.push(`T ${showIn("traceTemperature", u.traceTemperature, r.traceTemperature)}`);
  if (r.resistance !== null) parts.push(`R ${showIn("resistance", u.resistance, r.resistance)}`, `V ${showIn("voltageDrop", u.voltageDrop, r.voltageDrop)}`, `P ${showIn("power", u.power, r.power)}`);
  return parts.join(" ");
};

// ── Reference screenshots and live ──
eq("internal 2 A, 4 oz, 6 °C", out(calc("internal", { current: "2", thickness: "4", rise: "6" })), "W 27.28 A 150.37");
eq("external 2 A, 4 oz, 6 °C", out(calc("external", { current: "2", thickness: "4", rise: "6" })), "W 10.486 A 57.8");
eq("additional outputs (25 °C ambient, 10 cm)", out(calc("internal", { current: "2", thickness: "4", rise: "6", ambient: "25", length: "10" })),
  "W 27.28 A 150.37 T 31 R 0.017934 V 0.03587 P 0.07174");
eq("thickness 0.14 mm = 4 oz", out(calc("internal", { current: "2", thickness: "0.14", rise: "6" }, { thickness: "mm" })), "W 27.28 A 150.37");

// ── Temperature rise in °F / K (the reference fails on °F rises) ──
eq("10.8 °F rise = 6 °C rise", out(calc("internal", { current: "2", thickness: "4", rise: "10.8" }, { rise: "F" })), "W 27.28 A 150.37");
eq("6 K rise = 6 °C rise", out(calc("internal", { current: "2", thickness: "4", rise: "6" }, { rise: "K" })), "W 27.28 A 150.37");
eq("ambient in °F", out(calc("internal", { current: "2", thickness: "4", rise: "6", ambient: "77", length: "10" }, { ambient: "F" })),
  "W 27.28 A 150.37 T 31 R 0.017934 V 0.03587 P 0.07174");

// ── Thickness from width, units, validation ──
const back = calc("internal", { current: "2", width: "27.28", rise: "6" });
eq("thickness from a typed width", showIn("width", "oz", back.thickness), "4");
eq("width in mm", showIn("width", "mm", calc("internal", { current: "2", thickness: "4", rise: "6" }).width), "0.6929");
eq("cross section in mm²", showIn("crossSection", "mm2", calc("internal", { current: "2", thickness: "4", rise: "6" }).crossSection), "0.09701");
eq("current in mA", out(calc("internal", { current: "2000", thickness: "4", rise: "6" }, { current: "mA" })), "W 27.28 A 150.37");
eq("convert 4 oz → μm", convertText("thickness", "oz", "um", "4"), "140");
eq("convert a 6 °C rise → °F", convertText("rise", "C", "F", "6"), "10.8");
eq("convert 25 °C ambient → °F", convertText("ambient", "C", "F", "25"), "77");
eq("zero rise", out(calc("internal", { current: "2", thickness: "4", rise: "0" })), "ERR The temperature rise must be greater than zero.");
eq("negative current", out(calc("internal", { current: "-1", thickness: "4", rise: "6" })), "ERR Maximum current must be positive.");
eq("zero thickness", out(calc("internal", { current: "2", thickness: "0", rise: "6" })), "ERR Trace thickness must be greater than zero.");
eq("missing", out(calc("internal", { current: "2" })), "MISSING thickness,rise");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
