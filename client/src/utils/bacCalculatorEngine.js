// Blood Alcohol Concentration (BAC) Calculator engine — matches calculator.net/bac-calculator.html
// (a GET form computed on its server, decoded with live probes; see scripts/bac-calculator.test.js).
//
// Widmark, US form: peak BAC (%) = 5.24 × A / (W × r), then −0.015 per hour since the first drink,
//   A = alcohol in US fluid ounces (drink size in oz × ABV), W = weight in pounds (kg ÷ 0.453592,
//   grams ÷ 453.592), r = 0.73 (men) / 0.66 (women).
// Drink sizes count as round US ounces (the menu's ml labels are approximate: the 12oz/330ml bottle is
// 12 oz, the 1.5oz/50ml shot 1.67 oz, the 1 liter bottle 34 oz). "Other" sizes: ml ÷ 29.5735, liter 34 oz,
// metric cup 8.4535 oz, US cup 8 oz, US pint 16 oz, UK fluid oz 0.96076 US oz, UK cup 10 and UK pint 20 UK oz.
// Shown: BAC to 2 significant figures below 0.1% and 2 decimals from 0.1% up (trailing zeros dropped);
// "It will take around N more hour(s) to reach 0%." with N = ⌈BAC ÷ 0.015⌉; the behavior for BAC above
// 0.029 / 0.059 / 0.099 / 0.199 / 0.299 / 0.399 / 0.5 (unrounded); and the BAC over time (hourly points,
// plus the current time and the moment it reaches 0; drawn only when that is at most 1,000 hours away from the
// first drink). At 0% only the BAC line is shown.
// Validation (reference wording and order): body weight (> 0), time since first drink (hours and minutes
// ≥ 0, blank = 0), then each intake amount (≥ 0, blank = 0) and the other drink's size and ABV.

import { clean, num } from "./marginCalculatorEngine.js";
import { roundTo } from "./bmiCalculatorEngine.js";

export const WEIGHT_UNITS = [
  { value: "lb", label: "pounds" },
  { value: "kg", label: "kilograms" },
  { value: "g", label: "grams" },
];
const OPT = (value, label, oz) => ({ value, label, oz });
export const DRINKS = {
  beer: {
    label: "Beer",
    sizes: [
      OPT("b250", "250ml bottle", 8.5), OPT("b330", "12oz/330ml bottle", 12), OPT("b500", "16oz/500ml bottle", 16),
      OPT("c250", "250ml bar cup", 8.5), OPT("c330", "12oz/330ml bar cup (small)", 12), OPT("c500", "16oz/500ml bar cup", 17),
      OPT("c600", "20oz/600ml bar cup (tall)", 20), OPT("n330", "12oz/330ml can", 12), OPT("n500", "16oz/500ml can", 17),
      OPT("n600", "20oz/600ml can", 20), OPT("1l", "1 liter", 34),
    ],
    abvs: ["4.2", "5", "5.8"], abvLabels: { "4.2": "4.2%, light" }, size: "b330", abv: "5",
  },
  wine: {
    label: "Wine",
    sizes: [
      OPT("c60", "2oz/60ml cup (small)", 2), OPT("c150", "5oz/150ml cup", 5), OPT("c250", "8oz/250ml cup (big)", 8.5),
      OPT("b375", "375ml bottle", 12.5), OPT("b500", "500ml bottle", 17), OPT("b750", "750ml bottle", 25),
      OPT("l1", "1 l bottle", 34), OPT("l15", "1.5 l bottle", 50),
    ],
    abvs: ["6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"], abvLabels: {}, size: "c150", abv: "12",
  },
  liquor: {
    label: "Liquor",
    sizes: [
      OPT("s15", "0.5oz/15ml shot", 0.5), OPT("s30", "1oz/30ml shot", 1), OPT("s50", "1.5oz/50ml shot", 1.67),
      OPT("c250", "8oz/250ml cup", 8.5), OPT("b100", "100 ml bottle", 3.34), OPT("b250", "250 ml bottle", 8.5),
      OPT("b375", "375 ml bottle", 12.5), OPT("b500", "500 ml bottle", 17), OPT("b750", "750 ml bottle", 25),
    ],
    abvs: ["35", "40", "45", "50", "55", "60"], abvLabels: {}, size: "s50", abv: "40",
  },
};
export const OTHER_UNITS = [
  { value: "ml", label: "Milliliter, ml", oz: 1 / 29.5735 },
  { value: "l", label: "Liter, l", oz: 34 },
  { value: "mcup", label: "Cup (Metric)", oz: 8.4535 },
  { value: "oz", label: "Fluid Oz (US)", oz: 1 },
  { value: "pint", label: "Pint (US)", oz: 16 },
  { value: "cup", label: "Cup (US)", oz: 8 },
  { value: "ioz", label: "Fluid Oz (UK)", oz: 0.96076 },
  { value: "ipint", label: "Pint (UK)", oz: 20 * 0.96076 },
  { value: "icup", label: "Cup (UK)", oz: 10 * 0.96076 },
];

// The reference's example.
export const BAC_DEFAULTS = {
  sex: "male", weight: "70", weightUnit: "kg", hours: "2", minutes: "0",
  beer: "2", beerSize: "b330", beerAbv: "5",
  wine: "", wineSize: "c150", wineAbv: "12",
  liquor: "", liquorSize: "s50", liquorAbv: "40",
  other: "", otherSize: "250", otherUnit: "ml", otherAbv: "8",
};

export const ELIMINATION_PER_HOUR = 0.015;
const LB = { lb: 1, kg: 1 / 0.453592, g: 1 / 453.592 };
const BEHAVIOR = [
  [0.5, "High possibility of death"],
  [0.399, "Severe central nervous system depression, coma, possibility of death"],
  [0.299, "Stupor, central nervous system depression, loss of understanding, lapses in and out of consciousness, low possibility of death"],
  [0.199, "Nausea, vomiting, emotional swings, anger or sadness, partial loss of understanding, impaired sensations, decreased libido, possibility of stupor"],
  [0.099, "Over-expression, boisterousness, possibility of nausea and vomiting"],
  [0.059, "Blunted feelings, reduced sensitivity to pain, euphoria, disinhibition, extraversion"],
  [0.029, "Mild euphoria, relaxation, joyousness, talkativeness, decreased inhibition"],
];

/** The behavior line for a BAC (%). */
export function behaviorFor(bac) {
  const band = BEHAVIOR.find(([above]) => bac > above);
  return band ? band[1] : "Average individual appears normal.";
}

/** "0.026", "0.0004", "0.19", "2.76": 2 significant figures below 0.1%, 2 decimals above. */
export function formatBac(bac) {
  if (!(bac > 0)) return "0";
  const decimals = bac < 0.1 ? 1 - Math.floor(Math.log10(bac)) : 2;
  return String(roundTo(bac, decimals));
}

/** Text that is blank or a number ≥ 0 (blank counts as 0); NaN otherwise. */
const amount = (t) => (clean(t) === "" ? 0 : num(clean(t)) >= 0 ? num(clean(t)) : NaN);

/**
 * input: BAC_DEFAULTS shape (strings)
 * → { errors } | { bac, peak, hoursLeft, behavior, past: [{ t, bac }], future: [{ t, bac }], soberAt, chart }
 *   (bac / peak unrounded %, hours; past / future empty and hoursLeft 0 once the BAC is 0)
 */
export function calculateBac(input) {
  const weight = num(clean(input.weight));
  const hours = amount(input.hours);
  const minutes = amount(input.minutes);
  const counts = ["beer", "wine", "liquor", "other"].map((k) => amount(input[k]));
  const otherSize = amount(input.otherSize);
  const otherAbv = amount(input.otherAbv);

  const errors = [];
  if (!(weight > 0)) errors.push("Please provide a valid body weight value.");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) errors.push("Please provide a valid time since first drink.");
  ["beer", "wine", "liquor", "other alcoholic drink"].forEach((name, i) => {
    if (Number.isNaN(counts[i])) errors.push(`Please provide a valid ${name} intake amount.`);
  });
  if (Number.isNaN(otherSize)) errors.push("Please provide a valid other alcoholic drink size value.");
  if (Number.isNaN(otherAbv)) errors.push("Please provide a valid other alcoholic drink ABV value.");
  if (errors.length) return { errors };

  const sizeOz = (key) => (DRINKS[key].sizes.find((s) => s.value === input[`${key}Size`]) || DRINKS[key].sizes[0]).oz;
  const otherOz = otherSize * (OTHER_UNITS.find((u) => u.value === input.otherUnit) || OTHER_UNITS[0]).oz;
  const alcoholOz = counts[0] * sizeOz("beer") * Number(input.beerAbv) / 100
    + counts[1] * sizeOz("wine") * Number(input.wineAbv) / 100
    + counts[2] * sizeOz("liquor") * Number(input.liquorAbv) / 100
    + counts[3] * otherOz * otherAbv / 100;
  const pounds = weight * (LB[input.weightUnit] ?? 1);
  const r = input.sex === "female" ? 0.66 : 0.73;
  const peak = (5.24 * alcoholOz) / (pounds * r);
  const t = hours + minutes / 60;
  const at = (x) => peak - ELIMINATION_PER_HOUR * x;
  const bac = at(t);
  if (!(bac > 0)) return { bac: 0, peak, hoursLeft: 0, behavior: null, past: [], future: [], soberAt: null, chart: false };

  const soberAt = peak / ELIMINATION_PER_HOUR;
  const past = [];
  for (let h = 0; h < t; h++) past.push({ t: h, bac: at(h) });
  past.push({ t, bac });
  const future = [{ t, bac }];
  for (let h = Math.floor(t) + 1; h < soberAt; h++) future.push({ t: h, bac: at(h) });
  future.push({ t: soberAt, bac: 0 });
  return { bac, peak, hoursLeft: Math.ceil(bac / ELIMINATION_PER_HOUR), behavior: behaviorFor(bac), past, future, soberAt, chart: soberAt <= 1000 };
}
