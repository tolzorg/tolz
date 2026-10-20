// Plain-Node test suite for the BAC Calculator engine.
// Run with:
//   node scripts/bac-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/bac-calculator.html) via plain GET requests. A scratch comparator also diffed
// random scenarios (all drink sizes, ABVs and "other" units, pounds / kilograms / grams, both sexes,
// hours and minutes, invalid inputs) against the reference's page, chart points included: all identical.

import { calculateBac, formatBac, behaviorFor } from "../src/utils/bacCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = {
  sex: "male", weight: "70", weightUnit: "kg", hours: "2", minutes: "0",
  beer: "", beerSize: "b330", beerAbv: "5", wine: "", wineSize: "c150", wineAbv: "12",
  liquor: "", liquorSize: "s50", liquorAbv: "40", other: "", otherSize: "250", otherUnit: "ml", otherAbv: "8",
};
const run = (o = {}) => calculateBac({ ...BASE, ...o });
const summary = (r) => r.errors ? r.errors.join(" | ") : `${formatBac(r.bac)}% | ${r.hoursLeft}h | ${r.behavior}`;
const T = (t) => String(+t.toFixed(3));
const points = (r) => [...r.past.map((p) => `P${T(p.t)}=${p.bac.toFixed(3)}`), ...r.future.map((p) => `F${T(p.t)}=${p.bac.toFixed(3)}`)].join(" ");
/** The peak BAC to 6 decimals, from the time it reaches 0 (the reference's last chart point). */
const sober = (r) => T(r.soberAt);

// ── The reference's screenshots ──
const ex = run({ beer: "2" });
eq("2 beers, man", summary(ex), "0.026% | 2h | Average individual appears normal.");
eq("2 beers chart", points(ex), "P0=0.056 P1=0.041 P2=0.026 F2=0.026 F3=0.011 F3.721=0.000");
const exF = run({ beer: "2", sex: "female" });
eq("2 beers, woman", summary(exF), "0.032% | 3h | Mild euphoria, relaxation, joyousness, talkativeness, decreased inhibition");
eq("woman chart", points(exF), "P0=0.062 P1=0.047 P2=0.032 F2=0.032 F3=0.017 F4=0.002 F4.116=0.000");

// ── Time: minutes add up, a fractional current time is its own point, blank = 0 ──
eq("2 h 30 min", points(run({ beer: "2", minutes: "30" })), "P0=0.056 P1=0.041 P2=0.026 P2.5=0.018 F2.5=0.018 F3=0.011 F3.721=0.000");
eq("1 h 90 min = 2.5 h", formatBac(run({ beer: "2", hours: "1", minutes: "90" }).bac), "0.018");
eq("blank time = 0", summary(run({ beer: "2", hours: "", minutes: "" })), "0.056% | 4h | Mild euphoria, relaxation, joyousness, talkativeness, decreased inhibition");
eq("1.5 beers, singular hour", summary(run({ beer: "1.5" })), "0.012% | 1h | Average individual appears normal.");
eq("sober: 0% and no chart", `${summary(run({ beer: "1", hours: "5" }))} | ${run({ beer: "1", hours: "5" }).chart}`, "0% | 0h | null | false");
eq("no drinks", formatBac(run().bac), "0");

// ── Drink sizes in US ounces (from the reference) ──
eq("10 × 12 oz beer", sober(run({ beer: "10" })), "18.605");
eq("10 × 8.5 oz beer (250 ml)", sober(run({ beer: "10", beerSize: "b250" })), "13.179");
eq("10 × 16 oz beer (500 ml bottle)", sober(run({ beer: "10", beerSize: "b500" })), "24.807");
eq("1 × 17 oz beer (500 ml cup)", sober(run({ beer: "1", beerSize: "c500" })), "2.636");
eq("1 × 20 oz beer can", sober(run({ beer: "1", beerSize: "n600" })), "3.101");
eq("4 × 34 oz beer (1 l)", sober(run({ beer: "4", beerSize: "1l" })), "21.086");
eq("10 × 4.2% beer", sober(run({ beer: "10", beerAbv: "4.2" })), "15.628");
eq("20 × 2 oz wine", sober(run({ wine: "20", wineSize: "c60" })), "14.884");
eq("1 × 50 oz wine (1.5 l), 10%", sober(run({ wine: "1", wineSize: "l15", wineAbv: "10" })), "15.504");
eq("6 × 1.67 oz shots", sober(run({ liquor: "6" })), "12.428");
eq("10 × 1 oz shots", sober(run({ liquor: "10", liquorSize: "s30" })), "12.404");
eq("3 × 3.34 oz (100 ml)", sober(run({ liquor: "3", liquorSize: "b100" })), "12.428");
eq("other 100 ml", sober(run({ other: "20", otherSize: "100", otherAbv: "10" })), "20.971");
eq("other liter = 34 oz", sober(run({ other: "2", otherSize: "1", otherUnit: "l", otherAbv: "10" })), "21.086");
eq("other US pint", sober(run({ other: "4", otherSize: "1", otherUnit: "pint", otherAbv: "10" })), "19.846");
eq("other UK pint", sober(run({ other: "4", otherSize: "1", otherUnit: "ipint", otherAbv: "10" })), "23.834");
eq("other UK oz", sober(run({ other: "10", otherSize: "10", otherUnit: "ioz", otherAbv: "10" })), "29.792");
eq("other metric cup", sober(run({ other: "8", otherSize: "1", otherUnit: "mcup", otherAbv: "10" })), "20.971");
eq("woman, 0.66", sober(run({ other: "20", otherSize: "100", otherAbv: "10", sex: "female" })), "23.195");
eq("100 kg", sober(run({ other: "20", otherSize: "100", otherAbv: "10", weight: "100" })), "14.679");
eq("154.3236 lb = 70 kg", sober(run({ other: "20", otherSize: "100", otherAbv: "10", weight: "154.3236", weightUnit: "lb" })), "20.971");
eq("100 lb, 100 oz alcohol", sober(run({ other: "10", otherSize: "10", otherUnit: "oz", otherAbv: "100", weight: "100", weightUnit: "lb" })), "478.539");
eq("grams", sober(run({ other: "10", otherSize: "10", otherUnit: "oz", otherAbv: "100", weight: "45359.2", weightUnit: "g" })), "478.539");
eq("ABV above 100% allowed", formatBac(run({ other: "2", otherAbv: "150" }).bac), "1.15");

// ── Formatting and behavior bands (unrounded BAC, "above" each cut-off) ──
eq("2 significant figures below 0.1", ["0.0004", "0.00095", "0.0294", "0.0296", "0.0558"].map((b) => formatBac(Number(b))).join(" "), "0.0004 0.00095 0.029 0.03 0.056");
eq("2 decimals from 0.1", [0.1, 0.186, 0.249, 2.761, 157.25].map(formatBac).join(" "), "0.1 0.19 0.25 2.76 157.25");
eq("bands", [0.02899, 0.02901, 0.05901, 0.09901, 0.19901, 0.29901, 0.39901, 0.49999, 0.50001].map((b) => behaviorFor(b).split(",")[0]).join(" | "),
  "Average individual appears normal. | Mild euphoria | Blunted feelings | Over-expression | Nausea | Stupor | Severe central nervous system depression | Severe central nervous system depression | High possibility of death");
eq("6 shots after 1 h", summary(run({ liquor: "6", hours: "1" })), "0.17% | 12h | Over-expression, boisterousness, possibility of nausea and vomiting");
eq("chart only up to 1,000 hours", [run({ other: "10", otherSize: "10", otherUnit: "oz", otherAbv: "100", weight: "100", weightUnit: "lb" }).chart,
  run({ other: "100", otherSize: "10", otherUnit: "oz", otherAbv: "100" }).chart].join(), "true,false");

// ── Validation (reference wording and order) ──
const err = (o) => (run(o).errors || []).join(" | ");
eq("weight 0", err({ beer: "2", weight: "0" }), "Please provide a valid body weight value.");
eq("negative time", err({ beer: "2", hours: "-1" }), "Please provide a valid time since first drink.");
eq("negative minutes", err({ beer: "2", minutes: "-5" }), "Please provide a valid time since first drink.");
eq("text beer", err({ beer: "abc" }), "Please provide a valid beer intake amount.");
eq("amounts", err({ beer: "2", wine: "x", liquor: "-1", other: "y" }), "Please provide a valid wine intake amount. | Please provide a valid liquor intake amount. | Please provide a valid other alcoholic drink intake amount.");
eq("other size", err({ other: "2", otherSize: "-250" }), "Please provide a valid other alcoholic drink size value.");
eq("other ABV", err({ other: "2", otherAbv: "x" }), "Please provide a valid other alcoholic drink ABV value.");
eq("all", err({ weight: "", hours: "x", wine: "-1", otherSize: "x", otherAbv: "x" }),
  "Please provide a valid body weight value. | Please provide a valid time since first drink. | Please provide a valid wine intake amount. | Please provide a valid other alcoholic drink size value. | Please provide a valid other alcoholic drink ABV value.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
