// Plain-Node test suite for the Target Heart Rate Calculator engine.
// Run with:
//   node scripts/target-heart-rate-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/target-heart-rate-calculator.html) via plain GET requests. A scratch
// comparator also diffed 400 random scenarios (age / tested MHR, all three formulas and
// intensity scales, with and without a resting heart rate, fractional values): all identical.

import { calculateTargetHeartRate } from "../src/utils/targetHeartRateCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (o) => calculateTargetHeartRate({ mode: "age", age: "30", mhr: "", rhr: "70", formula: "haskell", scale: "karvonen", ...o });
function show(r) {
  if (r.errors) return r.errors.join(" | ");
  if (r.kind === "karvonen") return `${r.summary.low}-${r.summary.high} | ${r.rows.map((z) => `${z.low}-${z.high}`).join(" ")}`;
  if (r.kind === "mhr") return `mhr ${r.mhr} | ${r.rows.map((z) => `${z.low}-${z.high}`).join(" ")}`;
  return r.rows.map((x) => `${x.rpe}:${x.hr}`).join(" ");
}

// ── The reference's example (age 30, RHR 70): every formula × scale ──
eq("Haskell Karvonen", show(run({})), "130-172 | 130-142 142-154 154-166 166-178 178-190");
eq("Tanaka Karvonen", show(run({ formula: "tanaka" })), "129-169 | 129-140 140-152 152-164 164-175 175-187");
eq("Nes Karvonen (MHR 191.8 → 192)", show(run({ formula: "nes" })), "131-174 | 131-143 143-155 155-168 168-180 180-192");
eq("Haskell Borg", show(run({ scale: "borg" })), "6:70 7:79 9:96 11:113 12:121 13:130 15:147 17:164 19:181 20:190");
eq("Tanaka Borg", show(run({ formula: "tanaka", scale: "borg" })), "6:70 7:78 9:95 11:112 12:120 13:129 15:145 17:162 19:179 20:187");
eq("Nes Borg", show(run({ formula: "nes", scale: "borg" })), "6:70 7:79 9:96 11:114 12:122 13:131 15:148 17:166 19:183 20:192");
eq("Haskell CR10", show(run({ scale: "cr10" })), "0:70 0.5:76 1:82 2:94 3:106 4:118 5:130 7:154 9:178 10:190");
eq("Tanaka CR10", show(run({ formula: "tanaka", scale: "cr10" })), "0:70 0.5:76 1:82 2:93 3:105 4:117 5:129 7:152 9:175 10:187");
eq("Nes CR10", show(run({ formula: "nes", scale: "cr10" })), "0:70 0.5:76 1:82 2:94 3:107 4:119 5:131 7:155 9:180 10:192");

// ── No resting heart rate: % of MHR, scale ignored ──
eq("no RHR", show(run({ rhr: "" })), "mhr 190 | 95-114 114-133 133-152 152-171 171-190");
eq("no RHR, Borg chosen", show(run({ rhr: "", scale: "borg" })), "mhr 190 | 95-114 114-133 133-152 152-171 171-190");

// ── Tested maximum heart rate (rounded before use) ──
eq("tested 185", show(run({ mode: "test", mhr: "185" })), "128-168 | 128-139 139-151 151-162 162-174 174-185");
eq("tested ignores age", show(run({ mode: "test", age: "", mhr: "185" })), "128-168 | 128-139 139-151 151-162 162-174 174-185");
eq("tested 185.5 → 186", run({ mode: "test", mhr: "185.5" }).summary.high, 169);
eq("tested 499.5 → 500", run({ mode: "test", mhr: "499.5" }).summary.high, 436);
eq("age 0.5 → MHR 220", show(run({ age: "0.5" })), "145-198 | 145-160 160-175 175-190 190-205 205-220");
eq("age 1", show(run({ age: "1" })), "145-197 | 145-159 159-174 174-189 189-204 204-219");
eq("age 30.5 Tanaka", run({ age: "30.5", formula: "tanaka" }).summary.high, 169);
eq("RHR as typed (10.5)", show(run({ rhr: "10.5" })).split(" | ")[0], "100-163");
eq("RHR 70.5", run({ rhr: "70.5" }).summary.low, 130);
eq("RHR above MHR (falling ranges)", run({ rhr: "200" }).summary.low + "-" + run({ rhr: "200" }).summary.high, "195-192");
eq("RHR = MHR", show(run({ rhr: "190" })).split(" | ")[0], "190-190");
eq("1e1 age", run({ age: "1e1" }).summary.high, 189);

// ── Validation (reference wording and limits) ──
const AGE = "Please provide a reasonable age.";
const MHR = "Please provide a reasonable maximum heart rate.";
const RHR = "Please provide a reasonable resting heart rate.";
for (const a of ["", "0", "abc", "120", "150"]) eq(`age ${JSON.stringify(a)}`, show(run({ age: a })), AGE);
eq("age 119.9 ok", run({ age: "119.9", rhr: "" }).kind, "mhr");
for (const m of ["", "0", "30", "500", "1000", "10.5"]) eq(`mhr ${JSON.stringify(m)}`, show(run({ mode: "test", mhr: m })), MHR);
eq("mhr 30.5 ok", run({ mode: "test", mhr: "30.5", rhr: "" }).kind, "mhr");
for (const h of ["-5", "abc", "0", "10", "0.5", "500"]) eq(`rhr ${JSON.stringify(h)}`, show(run({ rhr: h })), RHR);
eq("rhr 499.5 ok", run({ rhr: "499.5" }).kind, "karvonen");
eq("age + rhr errors", show(run({ age: "", rhr: "5" })), `${AGE} | ${RHR}`);
eq("mhr + rhr errors", show(run({ mode: "test", mhr: "5", rhr: "5" })), `${MHR} | ${RHR}`);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
