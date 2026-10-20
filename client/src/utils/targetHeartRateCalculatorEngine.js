// Target Heart Rate Calculator engine — matches calculator.net/target-heart-rate-calculator.html
// (a GET form computed on its server, decoded with live probes; see
// scripts/target-heart-rate-calculator.test.js).
//
// Maximum heart rate (MHR): a tested value, or estimated from age with
//   Haskell & Fox (1971): 220 − age
//   Tanaka, Monahan & Seals (2001): 208 − 0.7 × age
//   Nes, Janszky, Wisloff, Stoylen, Karlsen (2013): 211 − 0.64 × age
// and then rounded to a whole bpm (half up) before anything else uses it.
// The resting heart rate (RHR) is optional and used as typed.
//   - No RHR: zones are % of MHR (50-60 … 90-100%), with what each zone is for;
//     the intensity scale setting does not apply.
//   - With RHR, by the chosen intensity scale:
//       Karvonen: RHR + (MHR − RHR) × % for 50/60/70/80/90/100%, plus a 50-85% summary;
//       Borg RPE (6-20): RHR + (MHR − RHR) × (B − 6) / 14;
//       Borg CR10 (0-10): RHR + (MHR − RHR) × B / 10.
// Every heart rate is rounded to a whole bpm (half up). Nothing is clamped: an RHR
// above the MHR gives falling ranges, exactly like the reference.
// Validation (reference wording): age 0 < age < 120 → "Please provide a reasonable age.";
// tested MHR 30 < MHR < 500 → "Please provide a reasonable maximum heart rate.";
// RHR (when given) 10 < RHR < 500 → "Please provide a reasonable resting heart rate.".
// Deliberate difference: the reference's Borg result table labels the first row "0"; the
// Borg scale starts at 6 ("No exertion at all", as its own page says), so 6 is shown.

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const MHR_FORMULAS = [
  { value: "haskell", label: "Haskell & Fox (1971)", mhr: (age) => 220 - age },
  { value: "tanaka", label: "Tanaka, Monahan, & Seals (2001)", mhr: (age) => 208 - 0.7 * age },
  { value: "nes", label: "Nes, Janszky, Wisloff, Stoylen, Karlsen (2013)", mhr: (age) => 211 - 0.64 * age },
];
export const INTENSITY_SCALES = [
  { value: "karvonen", label: "The Karvonen Formula" },
  { value: "borg", label: "Rating of perceived exertion with Borg scale" },
  { value: "cr10", label: "Rating of perceived exertion with modified Borg CR10 scale" },
];

// The reference's example.
export const TARGET_HR_DEFAULTS = { mode: "age", age: "30", mhr: "", rhr: "70", formula: "haskell", scale: "karvonen" };

export const ZONES = [
  { name: "Very light", use: "maintenance, warm up", from: 50, to: 60 },
  { name: "Light", use: "weight control, fat burning", from: 60, to: 70 },
  { name: "Moderate", use: "aerobic, endurance training", from: 70, to: 80 },
  { name: "Hard", use: "anaerobic, hardcore training", from: 80, to: 90 },
  { name: "VO2 Max", use: "maximum effort", from: 90, to: 100 },
];
export const BORG = [
  [6, "No exertion"], [7, "Extremely light"], [9, "Very light"], [11, "Light"], [12, "Moderate"],
  [13, "Somewhat hard"], [15, "Hard"], [17, "Very hard"], [19, "Extremely hard"], [20, "Maximal exertion"],
];
export const CR10 = [
  [0, "No exertion"], [0.5, "Noticeable"], [1, "Very light"], [2, "Light"], [3, "Moderate"],
  [4, "Somewhat difficult"], [5, "Difficult"], [7, "Very difficult"], [9, "Almost maximal"], [10, "Maximal"],
];

const bpm = (x) => roundTo(x, 0);

/**
 * input: { mode: "age" | "test", age, mhr, rhr, formula, scale }
 * → { errors } or { mhr, kind: "mhr" | "karvonen" | "borg" | "cr10", summary?, rows }
 *   kind "mhr" / "karvonen": rows = [{ name, use, from, to, low, high }]
 *   kind "borg" / "cr10":    rows = [{ rpe, name, hr }]
 */
export function calculateTargetHeartRate(input) {
  const errors = [];
  let mhrRaw;
  if (input.mode === "test") {
    mhrRaw = num(clean(input.mhr));
    if (!(mhrRaw > 30 && mhrRaw < 500)) errors.push("Please provide a reasonable maximum heart rate.");
  } else {
    const age = num(clean(input.age));
    if (!(age > 0 && age < 120)) errors.push("Please provide a reasonable age.");
    else mhrRaw = (MHR_FORMULAS.find((f) => f.value === input.formula) || MHR_FORMULAS[0]).mhr(age);
  }
  const rhrText = clean(input.rhr);
  const rhr = rhrText === "" ? null : num(rhrText);
  if (rhr !== null && !(rhr > 10 && rhr < 500)) errors.push("Please provide a reasonable resting heart rate.");
  if (errors.length) return { errors };

  const mhr = bpm(mhrRaw);
  if (rhr === null) {
    return { mhr, kind: "mhr", rows: ZONES.map((z) => ({ ...z, low: bpm((mhr * z.from) / 100), high: bpm((mhr * z.to) / 100) })) };
  }
  const reserve = mhr - rhr;
  if (input.scale === "borg") return { mhr, rhr, kind: "borg", rows: BORG.map(([b, name]) => ({ rpe: b, name, hr: bpm(rhr + (reserve * (b - 6)) / 14) })) };
  if (input.scale === "cr10") return { mhr, rhr, kind: "cr10", rows: CR10.map(([b, name]) => ({ rpe: b, name, hr: bpm(rhr + (reserve * b) / 10) })) };
  const at = (p) => bpm((reserve * p) / 100 + rhr);
  return {
    mhr, rhr, kind: "karvonen",
    summary: { low: at(50), high: at(85) },
    rows: ZONES.map((z) => ({ ...z, low: at(z.from), high: at(z.to) })),
  };
}
