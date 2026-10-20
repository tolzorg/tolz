// Plain-Node test suite for the Body Type Calculator engine.
// Run with:
//   node scripts/body-type-calculator.test.js
//
// Every expected result below was read from the LIVE reference
// (calculator.net/body-type-calculator.html) via plain GET requests. A scratch comparator also diffed
// random scenarios (inches on a 0.1" grid around the rule boundaries, cm, mixed units, invalid cases)
// against the reference's page: all identical.

import { calculateBodyType, formatWhr } from "../src/utils/bodyTypeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** "shape | WHR [| risk]" for bust, waist, high hip, hip (inches unless a unit is given). */
const run = (b, w, hh, h, unit = "in") => {
  const r = calculateBodyType({ bust: b, bustUnit: unit, waist: w, waistUnit: unit, highHip: hh, highHipUnit: unit, hip: h, hipUnit: unit });
  return r.errors ? r.errors.join(" | ") : `${r.shape ?? "unclassified"} | ${formatWhr(r.whr)}${r.highRisk ? " | risk" : ""}`;
};

// ── The reference's screenshot ──
eq("example (cm)", run("90", "60", "80", "90", "cm"), "Hourglass | 0.67");

// ── Each shape ──
eq("rectangle", run("36", "30", "34", "36"), "Rectangle | 0.83");
eq("spoon", run("34", "30", "40", "40"), "Spoon | 0.75");
eq("spoon (wide hips)", run("36", "20", "30", "48"), "Spoon | 0.42");
eq("bottom hourglass", run("34", "26", "30", "40"), "Bottom hourglass | 0.65");
eq("spoon by high hip ratio", run("34", "26", "32", "40"), "Spoon | 0.65");
eq("inverted triangle", run("40", "35", "38", "36"), "Inverted triangle | 0.97 | risk");
eq("unclassified", run("50", "40", "40", "40"), "unclassified | 1 | risk");

// ── Two shapes at once (joined with "and") ──
eq("hourglass and spoon", run("30", "20", "24", "33"), "Hourglass and Spoon | 0.61");
eq("spoon and rectangle", run("30", "24", "29", "33"), "Spoon and Rectangle | 0.73");
eq("spoon and triangle", run("30", "26", "32", "34"), "Spoon and Triangle | 0.76");
eq("hourglass and spoon (cm)", run("72", "42", "52", "78", "cm"), "Hourglass and Spoon | 0.54");

// ── WHR: two decimals, trailing zeros dropped; the WHO note above 0.85 as rounded ──
eq("WHR 1", run("30", "30", "30", "30"), "Rectangle | 1 | risk");
eq("WHR 0.853 → 0.85, no note", run("30", "25.6", "30", "30"), "Rectangle | 0.85");
eq("WHR 0.8547 → 0.85, no note", run("30", "25.64", "30", "30"), "Rectangle | 0.85");
eq("WHR 0.8553 → 0.86, note", run("30", "25.66", "30", "30").split(" | ").slice(1).join(" | "), "0.86 | risk");
eq("WHR 0.94", run("34", "33", "35", "35"), "Rectangle | 0.94 | risk");

// ── Mixed units ──
const mixed = calculateBodyType({ bust: "36", bustUnit: "in", waist: "76.2", waistUnit: "cm", highHip: "34", highHipUnit: "in", hip: "91.44", hipUnit: "cm" });
eq("mixed units = 36 / 30 / 34 / 36 in", `${mixed.shape} | ${formatWhr(mixed.whr)}`, "Rectangle | 0.83");

// ── Validation (reference wording and order: bust, waist, hip, high hip) ──
eq("all invalid", run("", "0", "-1", "abc", "cm"), "Please provide a positive bust size value. | Please provide a positive waist size value. | Please provide a positive hip size value. | Please provide a positive high hip size value.");
eq("high hip only", run("36", "30", "0", "36"), "Please provide a positive high hip size value.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
