// 3D Printing Cost Calculator engine — matches omnicalculator.com/other/3d-printing (its calculator definition was read
// from the page; behaviour checked against its screenshot and live, see scripts/3d-printing-cost-calculator.test.js).
//
// SI inside (kg/m³, m, kg, currency per kg, seconds, currency per second, markup as a fraction):
//   filament weight  = density × π × (diameter / 2)² × length
//   material cost    = density × π × (diameter / 2)² × length × price per kg
//   labor cost       = cost per hour × printing time
//   final price      = (material cost + labor cost) × (1 + markup)
// Every box can be typed or left blank and solved from the others. When a newly typed value over-determines the
// boxes, the reference keeps the new value and re-solves by a fixed ranking rather than by recency (live: a final price
// typed last re-solves the printing time even when the time was typed after the cost per hour; a material cost typed
// last re-solves the untouched 1.75 mm diameter). Here the newest box is kept, then the others in KEEP order.
// The density comes from the material type (ABS 1.05, PLA 1.27, … g/cm³) and is typed only for a custom material.

export const MATERIALS = [
  { value: "ABS", label: "ABS (Acrylonitrile Butadiene Styrene)", density: 1.05 },
  { value: "PLA", label: "PLA (Polylactic Acid)", density: 1.27 },
  { value: "PETG", label: "PETG (Polyethylene Terephthalate)", density: 1.25 },
  { value: "PETT", label: "PETT (T-Glase filament)", density: 1.45 },
  { value: "HIPS", label: "HIPS (High Impact Polystyrene)", density: 1.04 },
  { value: "TPU", label: "TPU (Thermoplastic Polyurethane)", density: 1.3 },
  { value: "custom", label: "Custom material", density: null },
];

const s = (value, label, short, f) => ({ value, label, short, f });
const mix = (value, label, short, parts, fs) => ({ value, label, short, parts, fs });
export const DENSITY_UNITS = [
  s("kgm3", "kilograms per cubic meter (kg/m³)", "kg/m³", 1), s("kgdm3", "kilograms per cubic decimeter (kg/dm³)", "kg/dm³", 1000),
  s("gcm3", "grams per cubic centimeter (g/cm³)", "g/cm³", 1000), s("ozin3", "ounces per cubic inch (oz/cu in)", "oz/cu in", 1 / 0.000578036672),
  s("lbin3", "pounds per cubic inch (lb/cu in)", "lb/cu in", 1 / 0.000036127292), s("lbft3", "pounds per cubic foot (lb/cu ft)", "lb/cu ft", 1 / 0.0624279606),
  s("lbyd3", "pounds per cubic yard (lb/cu yd)", "lb/cu yd", 1 / 1.68555494), s("lbgal", "pounds per US gallon (lb/US gal)", "lb/US gal", 1 / 0.00834540445),
];
const MM = s("mm", "millimeters (mm)", "mm", 0.001);
const CM = s("cm", "centimeters (cm)", "cm", 0.01);
const M = s("m", "meters (m)", "m", 1);
const IN = s("in", "inches (in)", "in", 0.0254);
const FT = s("ft", "feet (ft)", "ft", 0.3048);
const YD = s("yd", "yards (yd)", "yd", 0.9144);
const FT_IN = mix("ftin", "feet / inches (ft / in)", "ft / in", ["ft", "in"], [0.3048, 0.0254]);
const M_CM = mix("mcm", "meters / centimeters (m / cm)", "m / cm", ["m", "cm"], [1, 0.01]);
export const DIAMETER_UNITS = [MM, CM, M, s("km", "kilometers (km)", "km", 1000), IN, FT, YD, s("mi", "miles (mi)", "mi", 1609.344), s("nmi", "nautical miles (nmi)", "nmi", 1852), FT_IN, M_CM];
export const LENGTH_UNITS = [MM, CM, M, IN, FT, YD, FT_IN, M_CM];
const G = s("g", "grams (g)", "g", 0.001);
const DAG = s("dag", "decagrams (dag)", "dag", 0.01);
const KG = s("kg", "kilograms (kg)", "kg", 1);
const OZ = s("oz", "ounces (oz)", "oz", 0.028349523125);
const LB = s("lb", "pounds (lb)", "lb", 0.45359237);
export const WEIGHT_UNITS = [G, DAG, KG, OZ, LB];
/** "per" units of the price (currency per …). */
export const PRICE_PER_UNITS = [
  G, DAG, KG, s("gr", "grains (gr)", "gr", 0.00006479891), s("dr", "drams (dr)", "dr", 0.0017718451953125), OZ, LB,
  s("st", "stones (st)", "st", 6.35029318), s("ton", "US short tons (US ton)", "US ton", 907.18474), s("lton", "imperial tons (long ton)", "long ton", 1016.0469088),
];
const SEC = s("sec", "seconds (sec)", "sec", 1);
const MIN = s("min", "minutes (min)", "min", 60);
const HRS = s("hrs", "hours (hrs)", "hrs", 3600);
const DAYS = s("days", "days (days)", "days", 86400);
export const TIME_UNITS = [
  SEC, MIN, HRS, DAYS, mix("minsec", "minutes / seconds (min / sec)", "min / sec", ["min", "sec"], [60, 1]),
  mix("hrsmin", "hours / minutes (hrs / min)", "hrs / min", ["hrs", "min"], [3600, 60]),
  mix("hms", "hours / minutes / seconds (hrs / min / sec)", "hrs / min / sec", ["hrs", "min", "sec"], [3600, 60, 1]),
  mix("dayshrs", "days / hours (days / hrs)", "days / hrs", ["days", "hrs"], [86400, 3600]),
];
/** "per" units of the cost per hour. */
export const RATE_PER_UNITS = [MIN, HRS, DAYS];
const PERCENT = [s("pct", "percent (%)", "%", 0.01)];
const MONEY = [s("money", "", "", 1)];

export const FIELDS = {
  density: { label: "Density", units: DENSITY_UNITS, unit: "gcm3" },
  diameter: { label: "Filament diameter", units: DIAMETER_UNITS, unit: "mm" },
  length: { label: "Filament length", units: LENGTH_UNITS, unit: "cm" },
  weight: { label: "Filament weight", units: WEIGHT_UNITS, unit: "kg", tolerance: 0.01 },
  price: { label: "Price", units: MONEY, unit: "money", per: PRICE_PER_UNITS, perUnit: "kg", money: true },
  materialCost: { label: "Material cost", units: MONEY, unit: "money", money: true },
  time: { label: "Printing time", units: TIME_UNITS, unit: "hrs" },
  rate: { label: "Cost per hour", units: MONEY, unit: "money", per: RATE_PER_UNITS, perUnit: "hrs", money: true },
  laborCost: { label: "Labor cost", units: MONEY, unit: "money", money: true },
  markup: { label: "Markup", units: PERCENT, unit: "pct" },
  total: { label: "Final price", units: MONEY, unit: "money", money: true },
};
export const FIELD_KEYS = Object.keys(FIELDS);
/** The prefilled boxes. */
export const DEFAULT_TEXTS = { diameter: "1.75", markup: "10" };
/** Which boxes are kept (after the newest typed one) when the typed values over-determine the others. */
const KEEP = ["density", "markup", "length", "weight", "price", "rate", "diameter", "time", "materialCost", "laborCost", "total"];

const unitOf = (k, unit) => FIELDS[k].units.find((u) => u.value === unit) || FIELDS[k].units[0];
const perOf = (k, per) => FIELDS[k].per?.find((u) => u.value === per);
const num = (t) => {
  const x = String(t ?? "").replace(/,/g, "").trim();
  if (x === "") return null;
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(x) ? Number(x) : NaN;
};

/** Box text(s) → SI number; null when blank, NaN when not a number. */
export function toSi(k, { unit, per, texts }) {
  const u = unitOf(k, unit);
  let x;
  if (u.parts) {
    const xs = texts.map(num);
    if (xs.every((v) => v === null)) return null;
    if (xs.some((v) => Number.isNaN(v))) return NaN;
    x = xs.reduce((sum, v, i) => sum + (v ?? 0) * u.fs[i], 0);
  } else {
    const v = num(texts[0]);
    if (v === null || Number.isNaN(v)) return v;
    x = v * u.f;
  }
  const p = perOf(k, per);
  return p ? x / p.f : x;
}

/** Omni display rounding: the fewest decimals within `tolerance` (relative) of the value, en-US grouping. */
export function omni(x, tolerance = 0.0001) {
  const v = Number(x.toPrecision(15));
  if (v === 0) return "0";
  for (let d = 0; d <= 15; d++) {
    const r = Number(v.toFixed(d));
    if (Math.abs(v - r) <= Math.abs(v) * tolerance) return group(v.toFixed(d).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, ""));
  }
  return group(String(v));
}
const group = (t) => {
  const [i, f] = t.split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${f ? `.${f}` : ""}`;
};
/** Money: 2 decimals, grouped (the reference's cost boxes). */
export const money = (x) => group((Math.round(x * 100) / 100).toFixed(2));

/** SI number → box text(s) in the box's unit. */
export function fromSi(k, { unit, per }, x) {
  const p = perOf(k, per);
  const y = p ? x * p.f : x;
  if (FIELDS[k].money) return [money(y)];
  const u = unitOf(k, unit);
  if (!u.parts) return [omni(y / u.f, FIELDS[k].tolerance)];
  // composite: whole big units, then the rest in the smaller ones (last part keeps decimals)
  const out = [];
  let rest = Math.abs(y);
  u.fs.forEach((f, i) => {
    if (i === u.fs.length - 1) out.push(omni(rest / f));
    else { const whole = Math.floor(Number((rest / f).toPrecision(12))); out.push(String(whole)); rest -= whole * f; }
  });
  if (y < 0) out[0] = `-${out[0]}`;
  return out;
}

const area = (d) => Math.PI * (d / 2) ** 2;
const ok = (x) => (Number.isFinite(x) ? x : null);
const EQUATIONS = [
  {
    vars: ["weight", "density", "diameter", "length"],
    solve: (k, v) => {
      if (k === "weight") return v.density * area(v.diameter) * v.length;
      if (k === "density") return ok(v.weight / (area(v.diameter) * v.length));
      if (k === "length") return ok(v.weight / (v.density * area(v.diameter)));
      const a = v.weight / (v.density * v.length);
      return a >= 0 ? ok(2 * Math.sqrt(a / Math.PI)) : null;
    },
  },
  {
    vars: ["materialCost", "density", "diameter", "length", "price"],
    solve: (k, v) => {
      const vol = () => area(v.diameter) * v.length;
      if (k === "materialCost") return v.density * vol() * v.price;
      if (k === "density") return ok(v.materialCost / (vol() * v.price));
      if (k === "price") return ok(v.materialCost / (v.density * vol()));
      if (k === "length") return ok(v.materialCost / (v.density * area(v.diameter) * v.price));
      const a = v.materialCost / (v.density * v.length * v.price);
      return a >= 0 ? ok(2 * Math.sqrt(a / Math.PI)) : null;
    },
  },
  {
    vars: ["laborCost", "rate", "time"],
    solve: (k, v) => (k === "laborCost" ? v.rate * v.time : k === "rate" ? ok(v.laborCost / v.time) : ok(v.laborCost / v.rate)),
  },
  {
    vars: ["total", "materialCost", "laborCost", "markup"],
    solve: (k, v) => {
      if (k === "total") return (v.materialCost + v.laborCost) * (1 + v.markup);
      if (k === "markup") return ok(v.total / (v.materialCost + v.laborCost) - 1);
      if (k === "laborCost") return ok(v.total / (1 + v.markup) - v.materialCost);
      return ok(v.total / (1 + v.markup) - v.laborCost);
    },
  },
];

function propagate(known) {
  const v = { ...known };
  let progress = true;
  while (progress) {
    progress = false;
    for (const eq of EQUATIONS) {
      const unknown = eq.vars.filter((k) => v[k] === undefined);
      if (unknown.length !== 1) continue;
      const x = eq.solve(unknown[0], v);
      if (x !== null && x !== undefined && Number.isFinite(x)) { v[unknown[0]] = x; progress = true; }
    }
  }
  return v;
}

const CONDITIONS = [
  ["diameter", (x) => x > 0, "The filament diameter must be more than 0."],
  ["length", (x) => x > 0, "The filament length must be more than 0."],
  ["weight", (x) => x > 0, "The filament weight must be more than 0."],
  ["price", (x) => x >= 0, "The price cannot be less than 0."],
  ["materialCost", (x) => x >= 0, "The material cost cannot be less than 0."],
  ["time", (x) => x > 0, "The printing time must be more than 0."],
  ["rate", (x) => x > 0, "The cost per hour must be more than 0."],
  ["laborCost", (x) => x > 0, "The labor cost must be more than 0."],
  ["markup", (x) => x >= 0, "The markup cannot be less than 0."],
  ["total", (x) => x > 0, "The final price must be more than 0."],
  ["density", (x) => x > 0, "The density must be more than 0."],
];

/**
 * @param {{ material: string, fields: Record<string, { unit: string, per?: string, texts: string[] }>, order: string[] }} input
 *   `order`: typed boxes (and the untouched defaults), least recent first; boxes the calculator filled in are left out.
 * @returns {{ missing: string[] } | { errors: string[] } | { values: Record<string, number>, display: Record<string, string[]>, solved: string[] }}
 */
export function calculatePrintingCost({ material, fields, order = [] }) {
  const mat = MATERIALS.find((m) => m.value === material) || MATERIALS[0];
  const errors = [];
  const parsed = {};
  for (const k of FIELD_KEYS) {
    if (k === "density" && mat.density !== null) continue;
    const x = toSi(k, fields[k]);
    if (Number.isNaN(x)) errors.push(`Please enter a number for ${FIELDS[k].label.toLowerCase()}.`);
    else if (x !== null) parsed[k] = x;
  }
  if (errors.length) return { errors };
  if (mat.density !== null) parsed.density = mat.density * 1000;
  const check = (vals) => {
    for (const [k, test, message] of CONDITIONS) if (vals[k] !== undefined && !test(vals[k]) && !errors.includes(message)) errors.push(message);
  };
  check(parsed);
  if (errors.length) return { errors };

  // The newest typed box first, then the rest by the reference's ranking; a box the knowns already determine is re-solved.
  const typed = order.filter((k) => parsed[k] !== undefined && !(k === "density" && mat.density !== null));
  const newest = typed[typed.length - 1];
  const fixedDensity = mat.density !== null ? ["density"] : [];
  const ranked = [...fixedDensity, ...(newest ? [newest] : []), ...KEEP.filter((k) => k !== newest && parsed[k] !== undefined && !fixedDensity.includes(k))];
  let known = {};
  for (const k of ranked) {
    if (propagate(known)[k] !== undefined) continue;
    known = { ...known, [k]: parsed[k] };
  }
  const v = propagate(known);
  const solved = FIELD_KEYS.filter((k) => v[k] !== undefined && known[k] === undefined && !(k === "density" && mat.density !== null));
  if (!solved.length) {
    const needed = ["density", "diameter", ...(parsed.weight !== undefined ? [] : ["length"]), "price", "time", "rate"];
    const missing = needed.filter((k) => v[k] === undefined);
    return { missing: missing.length ? missing : ["length"] };
  }
  check(v);
  if (errors.length) return { errors };
  const display = Object.fromEntries(FIELD_KEYS.map((k) => {
    if (v[k] === undefined) return [k, fields[k].texts.map(() => "")];
    if (known[k] !== undefined && !(k === "density" && mat.density !== null)) return [k, fields[k].texts];
    return [k, fromSi(k, fields[k], v[k])];
  }));
  return { values: v, display, solved };
}

/** Converts a box's text(s) when its unit (or "per" unit) changes, keeping the quantity. */
export function convertBox(k, box, patch) {
  const x = toSi(k, box);
  const next = { ...box, ...patch };
  const u = unitOf(k, next.unit);
  if (x === null || Number.isNaN(x)) return { ...next, texts: u.parts ? u.parts.map((_, i) => box.texts[i] ?? "") : [box.texts[0] ?? ""] };
  return { ...next, texts: fromSi(k, next, x) };
}
