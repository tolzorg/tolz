// Plain-Node test suite for the Body Fat Calculator engine.
// Run with:
//   node scripts/body-fat-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/body-fat-calculator.html) via plain GET requests. A scratch
// comparator also diffed 700 random scenarios (US / metric, both sexes, ages
// 10-70, fractional ages): all identical.

import { calculateBodyFat, idealBodyFat, cmToLength, kgToWeight } from "../src/utils/bodyFatCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

// The reference's two forms: US = feet / inches + pounds, metric = cm + kg.
const US = { weight: "152", height: ["5", "10.5"], neck: ["1", "7.5"], waist: ["3", "1.5"], hip: ["2", "10.5"] };
const METRIC = { weight: "70", height: "178", neck: "50", waist: "96", hip: "92" };
const build = (sex, age, us, o) => {
  const v = { ...(us ? US : METRIC), ...o };
  const input = { sex, age, weightUnit: us ? "lb" : "kg", weight: v.weight };
  for (const k of ["height", "neck", "waist", "hip"]) {
    if (us) Object.assign(input, { [`${k}Unit`]: "ft-in", [k]: v[k][0], [`${k}2`]: v[k][1] });
    else Object.assign(input, { [`${k}Unit`]: "cm", [k]: v[k], [`${k}2`]: "" });
  }
  return calculateBodyFat(input);
};
const us = (o = {}, sex = "male", age = "25") => build(sex, age, true, o);
const metric = (o = {}, sex = "male", age = "25") => build(sex, age, false, o);
function show(r) {
  if (r.errors) return r.errors.join(" | ");
  const parts = [`${r.bodyFat}% ${r.category}`, `fat ${r.fatMass}`, `lean ${r.leanMass}`];
  if (r.ideal) parts.push(`ideal ${r.ideal}`);
  if (r.toIdeal) parts.push(`${r.toIdeal.verb} ${r.toIdeal.amount}`);
  parts.push(`BMI method ${r.bmiMethod}`, r.gauge ? "gauge" : "no gauge");
  return parts.join(" | ");
}

// ── The reference's four examples ──
eq("US male", show(us()), "15.3% Fitness | fat 23.2 lbs | lean 128.8 lbs | ideal 10.5% | Lose 7.2 lbs | BMI method 15.4% | gauge");
eq("US female", show(us({}, "female")), "21.5% Fitness | fat 32.7 lbs | lean 119.3 lbs | ideal 18.4% | Lose 4.7 lbs | BMI method 26.2% | gauge");
eq("metric male", show(metric()), "15.7% Fitness | fat 11.0 kg | lean 59.0 kg | ideal 10.5% | Lose 3.6 kg | BMI method 16.1% | gauge");
eq("metric female", show(metric({}, "female")), "24.1% Fitness | fat 16.9 kg | lean 53.1 kg | ideal 18.4% | Lose 4.0 kg | BMI method 26.9% | gauge");

// ── Ideal body fat (Jackson & Pollock, ages 20-55, interpolated) ──
eq("age 22", show(us({}, "male", "22")), "15.3% Fitness | fat 23.2 lbs | lean 128.8 lbs | ideal 9.3% | Lose 9.1 lbs | BMI method 14.7% | gauge");
eq("age 27", us({}, "male", "27").ideal + " " + us({}, "male", "27").toIdeal.amount, "11.4% 5.9 lbs");
eq("age 20", us({}, "male", "20").toIdeal.amount, "10.3 lbs");
eq("age 25.5", us({}, "male", "25.5").ideal + " " + us({}, "male", "25.5").toIdeal.amount, "10.7% 6.9 lbs");
eq("age 55 gain", `${us({}, "male", "55").ideal} ${us({}, "male", "55").toIdeal.verb} ${us({}, "male", "55").toIdeal.amount}`, "20.9% Gain 8.6 lbs");
eq("no ideal at 19.9", us({}, "male", "19.9").ideal, null);
eq("no ideal at 55.5", us({}, "male", "55.5").ideal, null);
eq("ideal table end", idealBodyFat("female", 55), 26.3);
eq("within 1 point: no row", metric({ waist: "90.98" }).toIdeal, null);
eq("1 point away: row", metric({ waist: "91" }).toIdeal.verb, "Lose");

// ── BMI method: children under 18 ──
eq("age 18 adult", us({}, "male", "18").bmiMethod, "13.7%");
eq("age 17 boy", us({}, "male", "17").bmiMethod, "18.4%");
eq("age 15 boy", us({}, "male", "15").bmiMethod, "19.8%");
eq("age 60", us({}, "male", "60").bmiMethod, "23.4%");
eq("age 0 accepted", us({}, "male", "0").bmiMethod, "30.3%");

// ── Categories and the 0% floor ──
const waist = (w, sex = "male") => metric({ waist: String(w) }, sex);
eq("categories", [80, 83, 85, 88, 95, 100, 110].map((w) => waist(w).category).join(","),
  "Less than Essential Fat,Essential Fat,Essential Fat,Athletes,Fitness,Average,Obese");
eq("bodies", [80, 83, 85, 88, 95, 100, 105, 110, 120, 130].map((w) => waist(w).bodyFat).join(" "), "0.6 3.9 5.9 8.8 14.9 18.7 22.2 25.5 31.4 36.6");
eq("negative is 0%", show(waist(70)), "0.0% Less than Essential Fat | fat 0.0 kg | lean 70.0 kg | ideal 10.5% | Gain 7.4 kg | BMI method 16.1% | no gauge");
eq("female blank hip", us({ hip: ["", ""] }, "female").errors.join(), "Please provide a positive hip measurement.");
eq("no gauge at 40%+", waist(150).gauge, null);

// ── Units ──
const ref = show(us());
const cmOf = (ft, inch) => String((+ft * 12 + +inch) * 2.54);
eq("all cm + lb", show(calculateBodyFat({ sex: "male", age: "25", weightUnit: "lb", weight: "152",
  heightUnit: "cm", height: cmOf(5, 10.5), neckUnit: "cm", neck: cmOf(1, 7.5), waistUnit: "cm", waist: cmOf(3, 1.5) })), ref);
eq("inches + stones", calculateBodyFat({ sex: "male", age: "25", weightUnit: "st", weight: String(152 / 14),
  heightUnit: "in", height: "70.5", neckUnit: "in", neck: "19.5", waistUnit: "in", waist: "37.5" }).fatMass, "1 st 9.2 lb");
eq("m / cm", calculateBodyFat({ sex: "male", age: "25", weightUnit: "kg", weight: "70",
  heightUnit: "m-cm", height: "1", height2: "78", neckUnit: "m", neck: "0.5", waistUnit: "cm", waist: "96" }).bodyFat, "15.7");
eq("cm → ft / in", cmToLength("ft-in", 179.07).join(" "), "5 10.5");
eq("cm → m / cm", cmToLength("m-cm", 178).join(" "), "1 78");
eq("kg → lb", kgToWeight("lb", 70), "154.3");

// ── Without measurements (BMI method drives every result) ──
const noTape = (o = {}) => calculateBodyFat({ method: "bmi", sex: "male", age: "25", weightUnit: "lb", weight: "152", heightUnit: "ft-in", height: "5", height2: "10.5", ...o });
const nt = noTape();
eq("BMI mode result", `${nt.method} ${nt.bodyFat} ${nt.category} ${nt.bmi}`, "bmi 15.4 Fitness 21.5");
eq("BMI mode masses", `${nt.fatMass} ${nt.leanMass} ${nt.ideal} ${nt.toIdeal.verb} ${nt.toIdeal.amount}`, "23.3 lbs 128.7 lbs 10.5% Lose 7.4 lbs");
eq("BMI mode = Navy's BMI-method row", nt.bodyFat + "%", us().bmiMethod);
eq("no neck / waist needed", noTape({ neckUnit: "cm", neck: "", waistUnit: "cm", waist: "abc" }).bodyFat, "15.4");
eq("female, no hip needed", noTape({ sex: "female", hipUnit: "cm", hip: "" }).bodyFat, "26.2");
eq("BMI mode child formula", noTape({ age: "15" }).bodyFat, "19.8");
eq("BMI mode still validates", noTape({ weight: "0" }).errors.join(), "Please provide a positive weight.");
eq("BMI mode negative floors at 0", noTape({ age: "10", weight: "40" }).bodyFat, "0.0");

// ── Validation (reference wording where it has one; clearer errors where it shows "nan%") ──
eq("age text", show(us({}, "male", "abc")), "Please provide a positive age.");
eq("age negative", show(us({}, "male", "-5")), "Please provide a positive age.");
eq("weight text", show(us({ weight: "abc" })), "Please provide a positive weight.");
eq("weight 0", show(us({ weight: "0" })), "Please provide a positive weight.");
eq("height 0", show(us({ height: ["0", "0"] })), "Please provide a positive height.");
eq("neck text", show(us({ neck: ["1", "abc"] })), "Please provide a positive neck measurement.");
eq("waist ≤ neck", show(metric({ neck: "100" })), "The waist must be larger than the neck.");
eq("female waist + hip ≤ neck", show(metric({ neck: "200" }, "female")), "The waist plus hip must be larger than the neck.");
eq("hip ignored for men", us({ hip: ["abc", ""] }).bodyFat, "15.3");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
