// Plain-Node test suite for the Lean Body Mass Calculator engine.
// Run with:
//   node scripts/lean-body-mass-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/lean-body-mass-calculator.html) via plain GET requests. A scratch
// comparator also diffed 600 random scenarios (US / metric, both sexes, children and
// adults, fractional values): all identical.

import { calculateLeanBodyMass } from "../src/utils/leanBodyMassCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const us = (sex, child, ft, inch, lb) => calculateLeanBodyMass({ sex, child, heightUnit: "ft-in", height: ft, height2: inch, weightUnit: "lb", weight: lb });
const metric = (sex, child, cm, kg) => calculateLeanBodyMass({ sex, child, heightUnit: "cm", height: cm, height2: "", weightUnit: "kg", weight: kg });
function show(r) {
  if (r.errors) return r.errors.join(" | ");
  return r.rows.map((x) => `${x.formula} ${x.lbm} ${r.unit} (${x.share}%) ${x.bodyFat}%`).join(" | ");
}

// ── The reference's examples (screenshots and page defaults) ──
eq("US male", show(us("male", false, "5", "10", "160")), "Boer 127.4 lbs (80%) 20% | James 129.0 lbs (81%) 19% | Hume 120.4 lbs (75%) 25%");
eq("US female", show(us("female", false, "5", "10", "160")), "Boer 119.2 lbs (75%) 25% | James 116.8 lbs (73%) 27% | Hume 115.8 lbs (72%) 28%");
eq("metric male", show(metric("male", false, "180", "60")), "Boer 53.3 kg (89%) 11% | James 51.8 kg (86%) 14% | Hume 51.2 kg (85%) 15%");
eq("impossible male (3 cm, 23 kg)", show(metric("male", false, "3", "23")), "Boer -9.0 kg (-39%) 139% | James -7,498.3 kg (-32,601%) 32,701% | Hume -21.0 kg (-91%) 191%");
eq("impossible female", show(metric("female", false, "3", "23")), "Boer -41.1 kg (-179%) 279% | James -8,674.5 kg (-37,715%) 37,815% | Hume -35.2 kg (-153%) 253%");

// ── Children (14 or younger): Peters row first ──
eq("child metric male", show(metric("male", true, "180", "60")), "Peters 49.5 kg (82%) 18% | Boer 53.3 kg (89%) 11% | James 51.8 kg (86%) 14% | Hume 51.2 kg (85%) 15%");
eq("child metric female", show(metric("female", true, "140", "35")), "Peters 29.1 kg (83%) 17% | Boer 26.7 kg (76%) 24% | James 28.2 kg (81%) 19% | Hume 25.6 kg (73%) 27%");
eq("child US", show(us("male", true, "5", "0", "100")), "Peters 80.7 lbs (81%) 19% | Boer 88.1 lbs (88%) 12% | James 85.0 lbs (85%) 15% | Hume 81.7 lbs (82%) 18%");
eq("child US female", show(us("female", true, "4", "8", "70")), "Peters 60.9 lbs (87%) 13% | Boer 59.5 lbs (85%) 15% | James 58.6 lbs (84%) 16% | Hume 56.4 lbs (81%) 19%");

// ── US conversions use 2.2046 lb/kg (fitted on 101 live US cases) ──
eq("US 0.1 lb case", show(us("male", false, "6", "3", "92")), "Boer 107.2 lbs (117%) -17% | James 87.7 lbs (95%) 5% | Hume 107.6 lbs (117%) -17%");
eq("US 0.1 lb case 2", show(us("male", false, "3", "11", "204.4")), "Boer 111.1 lbs (54%) 46% | James 54.6 lbs (27%) 73% | Hume 91.2 lbs (45%) 55%");

// ── Height boxes ──
eq("inches blank", show(us("male", false, "5", "", "160")), "Boer 112.5 lbs (70%) 30% | James 112.0 lbs (70%) 30% | Hume 101.4 lbs (63%) 37%");
eq("decimal feet", show(us("male", false, "5.5", "0", "160")), "Boer 121.5 lbs (76%) 24% | James 123.1 lbs (77%) 23% | Hume 112.8 lbs (70%) 30%");
eq("inches over 12", show(us("male", false, "5", "25", "160")), "Boer 149.9 lbs (94%) 6% | James 144.1 lbs (90%) 10% | Hume 148.9 lbs (93%) 7%");
eq("1e2 cm", show(metric("male", false, "1e2", "60")), "Boer 31.9 kg (53%) 47% | James 19.9 kg (33%) 67% | Hume 24.1 kg (40%) 60%");
eq("tiny weight", show(metric("male", false, "180", "0.0001")), "Boer 28.9 kg (28,860,041%) -28,859,941% | James 0.0 kg (110%) -10% | Hume 31.5 kg (31,538,633%) -31,538,533%");
eq("tiny height child", show(metric("male", true, "0.5", "60")), "Peters 0.7 kg (1%) 99% | Boer 5.4 kg (9%) 91% | James -1,843,134.0 kg (-3,071,890%) 3,071,990% | Hume -9.7 kg (-16%) 116%");

// ── Validation (reference wording and order) ──
const H = "Please provide a valid height value.";
const W = "Please provide a valid weight value.";
eq("all blank", show(us("male", false, "", "", "")), `${H} | ${W}`);
eq("no height", show(metric("male", false, "", "60")), H);
eq("no weight", show(metric("male", false, "180", "")), W);
eq("height 0", show(metric("male", false, "0", "60")), H);
eq("weight 0", show(metric("male", false, "180", "0")), W);
eq("negative inches", show(us("male", false, "5", "-1", "160")), H);
eq("negative feet", show(us("male", false, "-5", "30", "160")), H);
eq("text height", show(metric("male", false, "abc", "60")), H);
eq("negative weight", show(metric("male", false, "180", "-5")), W);
eq("0 ft 0 in", show(us("male", false, "0", "0", "160")), H);

// ── Tolz units ──
const st = calculateLeanBodyMass({ sex: "male", child: false, heightUnit: "ft-in", height: "5", height2: "10", weightUnit: "st", weight: String(160 / 14) });
eq("stones = pounds", show(st), "Boer 127.4 lbs (80%) 20% | James 129.0 lbs (81%) 19% | Hume 120.4 lbs (75%) 25%");
const m = calculateLeanBodyMass({ sex: "male", child: false, heightUnit: "m", height: "1.8", height2: "", weightUnit: "kg", weight: "60" });
eq("meters = centimeters", show(m), "Boer 53.3 kg (89%) 11% | James 51.8 kg (86%) 14% | Hume 51.2 kg (85%) 15%");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
