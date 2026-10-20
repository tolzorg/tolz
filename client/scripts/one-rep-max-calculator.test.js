// Plain-Node test suite for the One Rep Max Calculator engine.
// Run with:
//   node scripts/one-rep-max-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/one-rep-max-calculator.html) via plain GET requests. A scratch
// comparator also diffed 400 random scenarios (all formulas, kg / lb in and out,
// 1-10 reps, fractional weights): headline, both tables and the chart all identical.

import { calculateOneRepMax } from "../src/utils/oneRepMaxCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (lift, liftUnit, reps, outUnit, formula) => calculateOneRepMax({ lift, liftUnit, reps, outUnit, formula });
const head = (r) => (r.errors ? r.errors.join(" | ") : `${r.oneRepMax} ${r.unit}`);
const byReps = (r) => r.byReps.map((x) => `${x.reps}:${x.weight}/${x.percent}`).join(" ");
const byPct = (r) => r.byPercent.map((x) => `${x.percent}:${x.weight}/${x.reps}`).join(" ");

// ── The reference's three examples (100 kg × 5) ──
const e = run("100", "kg", "5", "kg", "epley");
eq("Epley 1RM", head(e), "116.7 kg");
eq("Epley reps table", byReps(e), "1:116.7/100 2:109.4/94 3:106.1/91 4:102.9/88 5:100.0/86 6:97.2/83 7:94.6/81 8:92.1/79 9:89.7/77 10:87.5/75 12:83.3/71 14:79.5/68 16:76.1/65 18:72.9/63 20:70.0/60");
eq("Epley % table", byPct(e), "100:116.7/1 95:110.8/1 90:105.0/3 85:99.2/5 80:93.3/7 75:87.5/10 70:81.7/12 65:75.8/16 60:70.0/20 55:64.2/24 50:58.3/30");
eq("Epley chart", `${e.chart.length} ${e.chart[10].label} ${e.chart[19].label}`, "20 85.4 70.0");

const b = run("100", "kg", "5", "kg", "brzycki");
eq("Brzycki 1RM", head(b), "112.5 kg");
eq("Brzycki % table", byPct(b), "100:112.5/1 95:106.9/2 90:101.3/4 85:95.6/6 80:90.0/8 75:84.4/10 70:78.8/11 65:73.1/13 60:67.5/15 55:61.9/17 50:56.3/19");
eq("Brzycki reps 20", b.byReps[14].weight + "/" + b.byReps[14].percent, "53.1/47");

const l = run("100", "kg", "5", "kg", "lombardi");
eq("Lombardi 1RM", head(l), "117.5 kg");
eq("Lombardi reps table", byReps(l), "1:117.5/100 2:109.6/93 3:105.2/90 4:102.3/87 5:100.0/85 6:98.2/84 7:96.7/82 8:95.4/81 9:94.3/80 10:93.3/79 12:91.6/78 14:90.2/77 16:89.0/76 18:88.0/75 20:87.1/74");
eq("Lombardi % table (50% = 1023)", byPct(l), "100:117.5/1 95:111.6/1 90:105.7/2 85:99.8/5 80:94.0/9 75:88.1/17 70:82.2/35 65:76.4/74 60:70.5/165 55:64.6/394 50:58.7/1023");

// ── Units (1 lb = 0.453592 kg) ──
eq("lb in, lb out", head(run("100", "lb", "5", "lb", "epley")), "116.7 lb");
eq("kg in, lb out", head(run("100", "kg", "5", "lb", "epley")), "257.2 lb");
eq("lb in, kg out", head(run("100", "lb", "5", "kg", "epley")), "52.9 kg");
eq("kg→lb table", byReps(run("100", "kg", "5", "lb", "epley")).split(" ")[19 - 5] || "", "20:154.3/60");
eq("big numbers get commas", head(run("390", "kg", "8", "lb", "epley")), "1,089.1 lb");

// ── Rep counts ──
eq("1 rep (Epley) = the weight", head(run("100", "kg", "1", "kg", "epley")), "100.0 kg");
eq("1 rep table", byReps(run("100", "kg", "1", "kg", "epley")).split(" ")[1], "2:93.8/94");
eq("10 reps Brzycki", head(run("100", "kg", "10", "kg", "brzycki")), "133.3 kg");
eq("10.0 is whole", head(run("100", "kg", "10.0", "kg", "epley")), "133.3 kg");
eq("1e1 is whole", head(run("100", "kg", "1e1", "kg", "epley")), "133.3 kg");
eq("spaces", head(run("100", "kg", " 5", "kg", "epley")), "116.7 kg");

// ── Validation (reference wording and order) ──
const W = "Please provide a positive weight lifted value.";
const POS = "Please provide a positive repeated number.";
const MAX = "Please provide a repeated number of 10 or less.";
const INT = "The repeated number needs to be an integer.";
eq("all blank", head(run("", "kg", "", "kg", "epley")), `${W} | ${POS}`);
eq("weight 0", head(run("0", "kg", "5", "kg", "epley")), W);
eq("weight negative", head(run("-5", "kg", "5", "kg", "epley")), W);
eq("weight text", head(run("abc", "kg", "5", "kg", "epley")), W);
eq("reps blank", head(run("100", "kg", "", "kg", "epley")), POS);
eq("reps 0", head(run("100", "kg", "0", "kg", "epley")), POS);
eq("reps negative", head(run("100", "kg", "-3", "kg", "epley")), POS);
eq("reps text", head(run("100", "kg", "abc", "kg", "epley")), POS);
eq("reps 11", head(run("100", "kg", "11", "kg", "epley")), MAX);
eq("reps 20", head(run("100", "kg", "20", "kg", "epley")), MAX);
eq("reps 10.5 → max first", head(run("100", "kg", "10.5", "kg", "epley")), MAX);
eq("reps 5.5", head(run("100", "kg", "5.5", "kg", "epley")), INT);
eq("reps 0.5", head(run("100", "kg", "0.5", "kg", "epley")), INT);
eq("both wrong", head(run("abc", "kg", "11", "kg", "epley")), `${W} | ${MAX}`);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
