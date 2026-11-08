// Plain-Node test suite for the Resistor Calculator engine.
// Run with:
//   node scripts/resistor-calculator.test.js
//
// Expected values are the reference's own answers (calculator.net/resistor-calculator.html), fetched from its server.

import {
  resistorFromColors, parallelResistance, seriesResistance, conductorResistance, phpFloat, DEFAULT_BANDS,
} from "../src/utils/resistorCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const code = (p) => resistorFromColors({ bands: 4, ...DEFAULT_BANDS, ...p }).text;
const list = (fn, t) => { const r = fn(t); return r.errors ? `ERR ${r.errors.join(" | ")}` : r.text; };
const cond = (p) => {
  const r = conductorResistance({ length: "100", lengthUnit: "meter", diameter: "0.05", diameterUnit: "centimeter", conductivity: "59600000", ...p });
  return r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}` : r.text;
};

// color code (live)
eq("4 band default", code({}), "52 MΩ ±5% (J)");
eq("3 band", code({ bands: 3 }), "52 MΩ ±20% (M)");
eq("5 band", code({ bands: 5 }), "526 MΩ ±5% (J)");
eq("6 band", code({ bands: 6 }), "526 MΩ ±5% (J) 100ppm/K (S)");
eq("6 band red tc", code({ bands: 6, tc: "red" }), "526 MΩ ±5% (J) 50ppm/K (R)");
eq("silver multiplier", code({ band1: "black", band2: "brown", multiplier: "silver" }), "0.01 Ω ±5% (J)");
eq("4.7 Ω", code({ band1: "yellow", band2: "violet", multiplier: "gold" }), "4.7 Ω ±5% (J)");
eq("1 kΩ", code({ band1: "brown", band2: "black", multiplier: "red" }), "1 kΩ ±5% (J)");
eq("10 kΩ", code({ band1: "brown", band2: "black", multiplier: "orange" }), "10 kΩ ±5% (J)");
eq("4.7 kΩ", code({ band1: "yellow", band2: "violet", multiplier: "red" }), "4.7 kΩ ±5% (J)");
eq("1.5 kΩ", code({ band1: "brown", band2: "green", multiplier: "red" }), "1.5 kΩ ±5% (J)");
eq("470 Ω", code({ band1: "yellow", band2: "violet", multiplier: "brown" }), "470 Ω ±5% (J)");
eq("99 GΩ", code({ band1: "white", band2: "white", multiplier: "white" }), "99 GΩ ±5% (J)");
eq("0 Ω", code({ band1: "black", band2: "black", multiplier: "black" }), "0 Ω ±5% (J)");
eq("1.05 MΩ ±1%", code({ bands: 5, band1: "brown", band2: "black", band3: "green", multiplier: "yellow", tolerance: "brown" }), "1.05 MΩ ±1% (F)");
eq("999 GΩ", code({ bands: 5, band1: "white", band2: "white", band3: "white", multiplier: "white" }), "999 GΩ ±5% (J)");
eq("10.5 Ω", code({ bands: 5, band1: "brown", band2: "black", band3: "green", multiplier: "gold" }), "10.5 Ω ±5% (J)");
eq("1.05 Ω ±10%", code({ bands: 5, band1: "brown", band2: "black", band3: "green", multiplier: "silver", tolerance: "silver" }), "1.05 Ω ±10% (K)");
{
  const r = resistorFromColors({ bands: 4, ...DEFAULT_BANDS });
  eq("tolerance range (article: 49.4 - 54.6 MΩ)", `${r.min} - ${r.max}`, "49.4 MΩ - 54.6 MΩ");
  eq("band colors", r.colors.join(","), "green,red,blue,gold");
}

// parallel / series (live)
eq("parallel screenshot", list(parallelResistance, "10,2,38,23,38,23,21"), "1.2703136679494");
eq("series screenshot", list(seriesResistance, "10,2,38,23,38,23,21"), "155");
eq("parallel 3,3,3", list(parallelResistance, "3,3,3"), "1");
eq("parallel with 0", list(parallelResistance, "10,0,5"), "0");
eq("trailing comma", list(parallelResistance, "10,20,"), "6.6666666666667");
eq("spaces around commas", list(parallelResistance, "10, 20 , 30"), "5.4545454545455");
eq("decimals and 1e3", list(parallelResistance, "1.5,2.25,1e3"), "0.89919072834449");
eq("7,11", list(parallelResistance, "7,11"), "4.2777777777778");
eq("series 0.1+0.2", list(seriesResistance, "0.1,0.2"), "0.3");
eq("series big decimal", list(seriesResistance, "1000000,2000000.5"), "3000000.5");
eq("series 3.0E-7", list(seriesResistance, "0.0000001,0.0000002"), "3.0E-7");
eq("series 3.0E-5", list(seriesResistance, "0.00001,0.00002"), "3.0E-5");
eq("series 0.0003", list(seriesResistance, "0.0001,0.0002"), "0.0003");
eq("series 2.0E+20", list(seriesResistance, "1e20,1e20"), "2.0E+20");
eq("series exact integers", list(seriesResistance, "1230000000000000,1"), "1230000000000001");
eq("series 1e18 integer", list(seriesResistance, "500000000000000000,500000000000000000"), "1000000000000000000");
eq("series overflow → float", list(seriesResistance, "5000000000000000000,5000000000000000000"), "1.0E+19");
eq("series 14 digits", list(seriesResistance, "123456789012.345,0"), "123456789012.35");
eq("series zeros", list(seriesResistance, "0,0"), "0");
eq("spaces only", list(parallelResistance, "10 2 38"), "ERR Please provide at least two numbers.");
eq("one number", list(parallelResistance, "10"), "ERR Please provide at least two numbers.");
eq("only commas", list(parallelResistance, ",,"), "ERR Please provide at least two numbers.");
eq("newline/semicolon", list(parallelResistance, "10\n2;38"), "ERR Please provide positive numbers only.");
eq("negative", list(parallelResistance, "10,-5"), "ERR Please provide positive numbers only.");
eq("text", list(parallelResistance, "10,abc,5"), "ERR Please provide positive numbers only.");
eq("k suffix", list(seriesResistance, "1k,2k"), "ERR Please provide positive numbers only.");
eq("empty", list(parallelResistance, "  "), "ERR Please provide some numbers.");

// conductor (live)
eq("conductor screenshot", cond({}), "8.5452318438602");
eq("feet / inch / aluminium", cond({ length: "1000", lengthUnit: "foot", diameter: "0.1", diameterUnit: "inch", conductivity: "37800000" }), "1.5913505121049");
eq("mile / yard", cond({ length: "1", lengthUnit: "mile", diameter: "0.001", diameterUnit: "yard", conductivity: "58000000" }), "42.25325733332");
// The reference converts millimeters as centimeters (live: 1 mm = 1 cm = 0.0002136307960965 Ω); here they are millimeters,
// so this is 100× its 127323954.47352.
eq("millimeters (corrected)", cond({ length: "1", lengthUnit: "kilometer", diameter: "0.01", diameterUnit: "millimeter", conductivity: "1000" }), "12732395447.352");
eq("1 cm diameter (live)", cond({ length: "1", diameter: "1", conductivity: "59600000" }), "0.0002136307960965");
eq("1 cm length → exponent (live)", cond({ length: "1", lengthUnit: "centimeter", diameter: "1", conductivity: "59600000" }), "2.136307960965E-6");
eq("mile = 1609.35 m (live)", cond({ length: "1", lengthUnit: "mile", diameter: "1", diameterUnit: "meter", conductivity: "1" }), "2049.0880613195");
eq("foot diameter (live)", cond({ length: "1", diameter: "1", diameterUnit: "foot", conductivity: "1" }), "13.705036398542");
eq("newline separators (live)", list(parallelResistance, "10\r\n20\r\n30"), "5.4545454545455");
eq("zero length", cond({ length: "0" }), "0");
eq("zero conductivity", cond({ conductivity: "0" }), "ERR Please provide a positive numerical conductivity value.");
eq("negative length", cond({ length: "-1" }), "ERR Please provide a positive numerical length value.");
eq("all bad", cond({ length: "x", diameter: "abc", conductivity: "-5" }),
  "ERR Please provide a positive numerical length value. | Please provide a positive numerical diameter value. | Please provide a positive numerical conductivity value.");
eq("blank", cond({ length: "", diameter: "" }), "MISSING length,diameter");
eq("phpFloat 1e15 float", phpFloat(1e15), "1.0E+15");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
