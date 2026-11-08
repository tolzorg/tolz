// Plain-Node test suite for the PCB Impedance Calculator engine.
// Run with:
//   node scripts/pcb-impedance-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/pcb-impedance), all nine conductor types,
// plus its screenshot (microstrip with the effective signal width).

import { calculatePcbImpedance, fmt } from "../src/utils/pcbImpedanceCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** Lengths in µm, εr as is. */
const calc = (type, v) => calculatePcbImpedance(type, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === null ? null : k === "er" ? x : x * 1e-6])));
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : ["epsEff", "impedance", "odd", "even", "differential", "common"].filter((k) => r[k] !== null && r[k] !== undefined).map((k) => `${k} ${fmt(r[k])}`).join(" "));

// ── Live, all nine types ──
eq("microstrip", out(calc(0, { thickness: 35, width: 300, height: 160, er: 4.3 })), "epsEff 3.2566 impedance 48.32");
eq("edge-coupled microstrip", out(calc(1, { thickness: 35, width: 300, height: 160, spacing: 200, er: 4.3 })), "odd 52.22 even 45.36 differential 104.43 common 22.68");
eq("wire microstrip", out(calc(2, { diameter: 300, height: 500, er: 4 })), "epsEff 2.866 impedance 76.06");
eq("embedded microstrip", out(calc(3, { thickness: 35, width: 300, height1: 160, height2: 400, er: 4.3 })), "epsEff 3.2566 impedance 71.29");
eq("wire stripline", out(calc(4, { diameter: 300, height: 1000, er: 4 })), "impedance 43.37");
// The reference shows 70 / 66 / 140 / 33 (rounded to whole ohms by its Math.round(x, 10) bug).
eq("edge-coupled stripline (decimals kept)", out(calc(5, { thickness: 35, width: 200, b: 800, spacing: 300, er: 4.3 })), "odd 70.3 even 66.32 differential 140.6 common 33.16");
eq("broadside-coupled stripline", out(calc(6, { thickness: 35, width: 200, b: 800, spacing: 100, er: 4.3 })), "odd 26.927 even 212.83 differential 53.85 common 106.41");
eq("symmetric stripline", out(calc(7, { thickness: 35, width: 200, height: 400, er: 4.3 })), "impedance 60.57");
eq("asymmetric stripline", out(calc(8, { thickness: 35, width: 200, height1: 300, height2: 500, er: 4.3 })), "impedance 60.54");

// ── Reference screenshot: 3 / 5 / 6 µm, εr 4 ──
const shot = calc(0, { thickness: 3, width: 5, height: 6, er: 4 });
eq("screenshot ε_eff and impedance", out(shot), "epsEff 2.9006 impedance 68.81");
eq("screenshot effective signal width", fmt(shot.effectiveWidth * 1e6), "6.96");
eq("W/H ≥ 1 uses the other ε_eff formula", fmt(calc(0, { thickness: 35, width: 320, height: 160, er: 4.3 }).epsEff), "3.2736");

// ── Validation ──
eq("zero width", out(calc(0, { thickness: 35, width: 0, height: 160, er: 4.3 })), "ERR Width should be greater than zero.");
eq("zero H1", out(calc(3, { thickness: 35, width: 300, height1: 0, height2: 400, er: 4.3 })), "ERR Substrate height (H1) should be greater than zero.");
eq("zero dielectric", out(calc(4, { diameter: 300, height: 1000, er: 0 })), "ERR Substrate dielectric should be greater than zero.");
eq("missing", out(calc(1, { thickness: 35, width: 300, height: null, spacing: null, er: 4.3 })), "MISSING height,spacing");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
