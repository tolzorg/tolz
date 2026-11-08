// CBM Calculator engine — matches omnicalculator.com/other/cbm-shipping (its calculator definition was read from the
// page; behaviour checked live, see scripts/cbm-calculator.test.js).
//
// Equations (SI units: m, kg, m³, m³/kg), solved for whatever is blank:
//   CBM per box = length × width × height
//   total weight = weight per box × quantity
//   total volume = CBM per box × quantity
//   volumetric weight = total volume / shipping factor          (5,000 cm³/kg = 0.005 m³/kg)
//   number of cartons = floor(container volume (ft³) × 0.0283168466 / CBM per box)   (output only)
// Any box can be solved when the others pin it down (length + width + CBM → height; volumetric weight → total
// volume → CBM → a dimension). When more boxes are typed than needed, the most recently typed ones win, as on the
// reference. Values are kept in exact decimals and unit factors are the reference's exact ratios; shown values use
// Omni's display rounding (the fewest decimals within 0.01%).

import { clean } from "./marginCalculatorEngine.js";
import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign } from "./semesterGradeCalculatorEngine.js";

const dec = (s) => decimalOf(s);
/** Cap a value at 60 decimals (products of 40-decimal quotients would otherwise keep growing). */
const norm = (x) => (x && x.s > 60 ? { n: x.n / 10n ** BigInt(x.s - 60), s: 60 } : x);
/** Unit → [numerator, denominator] of its size in SI (the reference's ratios). */
const ratio = (n, d = "1") => [dec(n), dec(d)];

export const LENGTH_UNITS = [
  { value: "mm", label: "millimeters (mm)", short: "mm", f: ratio("1", "1000") },
  { value: "cm", label: "centimeters (cm)", short: "cm", f: ratio("1", "100") },
  { value: "m", label: "meters (m)", short: "m", f: ratio("1") },
  { value: "in", label: "inches (in)", short: "in", f: ratio("127", "5000") },
  { value: "ft", label: "feet (ft)", short: "ft", f: ratio("381", "1250") },
  { value: "yd", label: "yards (yd)", short: "yd", f: ratio("1143", "1250") },
  { value: "ftin", label: "feet / inches (ft / in)", short: "ft / in", parts: ["ft", "in"], f: ratio("127", "5000"), big: ratio("381", "1250"), per: 12 },
  { value: "mcm", label: "meters / centimeters (m / cm)", short: "m / cm", parts: ["m", "cm"], f: ratio("1", "100"), big: ratio("1"), per: 100 },
];
export const WEIGHT_UNITS = [
  { value: "g", label: "grams (g)", short: "g", f: ratio("1", "1000") },
  { value: "kg", label: "kilograms (kg)", short: "kg", f: ratio("1") },
  { value: "t", label: "metric tons (t)", short: "t", f: ratio("1000") },
  { value: "oz", label: "ounces (oz)", short: "oz", f: ratio("45359237", "1600000000") },
  { value: "lb", label: "pounds (lb)", short: "lb", f: ratio("45359237", "100000000") },
  { value: "usTon", label: "US short tons (US ton)", short: "US ton", f: ratio("45359237", "50000") },
  { value: "longTon", label: "imperial tons (long ton)", short: "long ton", f: ratio("317514659", "312500") },
];
export const VOLUME_UNITS = [
  { value: "cm3", label: "cubic centimeters (cm³)", short: "cm³", f: ratio("1", "1000000") },
  { value: "m3", label: "cubic meters (m³)", short: "m³", f: ratio("1") },
  { value: "cuin", label: "cubic inches (cu in)", short: "cu in", f: ratio("2048383", "125000000000") },
  { value: "cuft", label: "cubic feet (cu ft)", short: "cu ft", f: ratio("55306341", "1953125000") },
  { value: "cuyd", label: "cubic yards (cu yd)", short: "cu yd", f: ratio("1493271207", "1953125000") },
  { value: "ml", label: "milliliters (mL)", short: "mL", f: ratio("1", "1000000") },
  { value: "l", label: "liters (L)", short: "L", f: ratio("1", "1000") },
  { value: "usgal", label: "gallons (US) (US gal)", short: "US gal", f: ratio("378541", "100000000") },
  { value: "ukgal", label: "gallons (UK) (UK gal)", short: "UK gal", f: ratio("454609", "100000000") },
];
export const FACTOR_UNITS = [
  { value: "cm3kg", label: "cubic centimeters per kilogram (cm³/kg)", short: "cm³/kg", f: ratio("1", "1000000") },
  { value: "in3lb", label: "cubic inches per pound (in³/lb)", short: "in³/lb", f: ratio("2204623", "61024000000") },
];
export const QUANTITY_UNITS = [{ value: "", label: "", short: "", f: ratio("1") }];

/** Container internal volumes in cubic feet (the reference's dataset). */
export const CONTAINERS = [
  { value: "20std", label: "20′ Standard dry container", cuft: "1165" },
  { value: "40std", label: "40′ Standard dry container", cuft: "2350" },
  { value: "40hc", label: "40′ High cube dry container", cuft: "2694" },
  { value: "45hc", label: "45′ High cube dry container", cuft: "3043" },
];
const CUFT_TO_M3 = dec("0.0283168466"); // the reference's constant in the cartons formula

/** Each box: its units, default unit, and the reference's "must be greater than 0" message. */
export const FIELDS = {
  length: { label: "Length", units: LENGTH_UNITS, unit: "cm", message: "Length must be greater than 0." },
  width: { label: "Width", units: LENGTH_UNITS, unit: "cm", message: "Width must be greater than 0." },
  height: { label: "Height", units: LENGTH_UNITS, unit: "cm", message: "Height must be greater than 0." },
  weight: { label: "Weight per box", units: WEIGHT_UNITS, unit: "kg", message: "Weight must be greater than 0." },
  quantity: { label: "Quantity", units: QUANTITY_UNITS, unit: "", message: "Quantity must be greater than 0." },
  cbm: { label: "CBM per box", units: VOLUME_UNITS, unit: "m3", message: "CBM must be greater than 0." },
  totalVolume: { label: "Total volume", units: VOLUME_UNITS, unit: "m3", message: "Total volume must be greater than 0." },
  totalWeight: { label: "Total weight", units: WEIGHT_UNITS, unit: "kg", message: "Total weight must be greater than 0." },
  factor: { label: "Shipping factor", units: FACTOR_UNITS, unit: "cm3kg", message: "Shipping factor must be greater than 0." },
  volWeight: { label: "Volumetric weight", units: WEIGHT_UNITS, unit: "kg", message: "Volumetric weight must be greater than 0." },
};
export const FIELD_KEYS = Object.keys(FIELDS);

/** [result, ...operands, operation]: result = a × b × c, a × b, or a / b — each solvable for any one blank. */
const EQUATIONS = [
  ["cbm", ["length", "width", "height"], "product"],
  ["totalWeight", ["weight", "quantity"], "product"],
  ["totalVolume", ["cbm", "quantity"], "product"],
  ["volWeight", ["totalVolume", "factor"], "quotient"],
];

const pick = (units, unit) => units.find((u) => u.value === unit) || units[0];

/** Text box(es) → exact SI decimal, null when blank, NaN-marker false when not a number. */
export const toSi = (key, unit, texts) => unitToSi(FIELDS[key].units, unit, texts);
/** The same for any unit list (also used by the Container Loading Calculator). */
export function unitToSi(units, unit, texts) {
  const u = pick(units, unit);
  if (u.parts) {
    const [bigText, smallText] = texts.map((t) => clean(t ?? ""));
    if (bigText === "" && smallText === "") return null;
    const big = bigText === "" ? dec("0") : dec(bigText);
    const small = smallText === "" ? dec("0") : dec(smallText);
    if (!big || !small) return false;
    return norm(addDec(div(mul(big, u.big[0]), u.big[1]), div(mul(small, u.f[0]), u.f[1])));
  }
  const t = clean(texts[0] ?? "");
  if (t === "") return null;
  const d = dec(t);
  return d ? norm(div(mul(d, u.f[0]), u.f[1])) : false;
}

/** Exact SI decimal → text box(es) in a unit (Omni display rounding; composite units: whole feet / meters + rest). */
export const fromSi = (key, unit, si) => unitFromSi(FIELDS[key].units, unit, si);
export function unitFromSi(units, unit, si) {
  const u = pick(units, unit);
  const inUnit = div(mul(si, u.f[1]), u.f[0]);
  if (!u.parts) return [formatDecimal(inUnit)];
  if (inUnit.n < 0n) { // a negative composite value: "-1 ft 2 in" rather than mixed signs
    const [whole, rest] = unitFromSi(units, unit, { n: -si.n, s: si.s });
    return [`-${whole}`, rest];
  }
  const per = BigInt(u.per);
  const scale = 10n ** BigInt(inUnit.s);
  const whole = inUnit.n / scale / per; // whole feet / meters (values here are positive)
  const rest = { n: inUnit.n - whole * per * scale, s: inUnit.s };
  return [whole.toString(), formatDecimal(rest)];
}

const addDec = (a, b) => {
  const s = Math.max(a.s, b.s);
  const up = (x) => x.n * 10n ** BigInt(s - x.s);
  return { n: up(a) + up(b), s };
};

/** Solve one equation for its single unknown, or null when it can't (a zero divisor). */
function solveOne([res, ops, kind], v, unknown) {
  if (unknown === res) {
    if (kind === "product") return ops.map((k) => v[k]).reduce((a, b) => mul(a, b));
    return sign(v[ops[1]]) === 0 ? null : div(v[ops[0]], v[ops[1]]);
  }
  if (kind === "product") {
    const others = ops.filter((k) => k !== unknown).map((k) => v[k]).reduce((a, b) => mul(a, b));
    return sign(others) === 0 ? null : div(v[res], others);
  }
  // quotient: res = a / b
  if (unknown === ops[0]) return mul(v[res], v[ops[1]]);
  return sign(v[res]) === 0 ? null : div(v[ops[0]], v[res]);
}

/** Fill in every box the known ones determine (repeatedly solving equations with exactly one unknown). */
function propagate(known, equations = EQUATIONS) {
  const v = { ...known };
  let progress = true;
  while (progress) {
    progress = false;
    for (const eq of equations) {
      // An equation is [result, operands, "product" | "quotient"], or { vars, solve(unknown, values) } for other forms.
      const vars = eq.vars || [eq[0], ...eq[1]];
      const unknown = vars.filter((k) => !v[k]);
      if (unknown.length !== 1) continue;
      const x = norm(eq.solve ? eq.solve(unknown[0], v) : solveOne(eq, v, unknown[0]));
      if (x) { v[unknown[0]] = x; progress = true; }
    }
  }
  return v;
}

/**
 * Most recent first: a box joins the knowns only if the knowns so far don't already determine it; then every box
 * the knowns determine is filled in. `equations`: [result, operands, "product" | "quotient"] or { vars, solve }
 * (also used by the Container Loading and Takt Time calculators).
 * @returns {{ known: Record<string, object>, values: Record<string, object> }}
 */
export function solveByRecency(typed, parsed, equations = EQUATIONS) {
  let known = {};
  for (const k of [...typed].reverse()) {
    if (propagate(known, equations)[k]) continue;
    known = { ...known, [k]: parsed[k] };
  }
  return { known, values: propagate(known, equations) };
}

/** The number of cartons of `cbm` (m³) that fit in a container. */
export function cartonCount(cbm, container) {
  const c = CONTAINERS.find((x) => x.value === container) || CONTAINERS[0];
  const q = div(mul(dec(c.cuft), CUFT_TO_M3), cbm);
  return q.n / 10n ** BigInt(q.s); // floor (positive)
}

/**
 * @param {Record<string, { unit: string, texts: string[], si?: object, siTexts?: string[] }>} fields  every box as typed
 *   (`si`/`siTexts`: the exact value of a box whose unit was changed, valid while its texts are unchanged).
 * @param {string[]} order  the typed boxes, least recent first (boxes the calculator filled in are left out).
 * @param {string} container  a CONTAINERS value.
 * @returns {{ missing: string[] } | { errors: string[] } | { si: Record<string, object>, display: Record<string, string[]>,
 *   solved: string[], cartons: bigint|null }}
 */
export function calculateCbm(fields, order, container) {
  // A box converted to a new unit keeps its exact value (`si`) while its rounded text is left as shown.
  const siOf = (k) => {
    const f = fields[k];
    return f.si && f.siTexts && f.siTexts.join("|") === f.texts.join("|") ? f.si : toSi(k, f.unit, f.texts);
  };
  const typed = order.filter((k) => siOf(k) !== null);
  const errors = [];
  const parsed = {};
  for (const k of typed) {
    const si = siOf(k);
    if (si === false || sign(si) <= 0) errors.push(FIELDS[k].message);
    else parsed[k] = si;
  }
  if (errors.length) return { errors };

  const { known, values: v } = solveByRecency(typed, parsed);
  if (!v.cbm) {
    const missing = ["length", "width", "height"].filter((k) => !v[k]);
    return { missing: missing.length ? missing : ["cbm"] };
  }

  const solved = FIELD_KEYS.filter((k) => v[k] && !known[k]);
  const display = {};
  for (const k of FIELD_KEYS) {
    if (!v[k]) display[k] = FIELDS[k].units.find((u) => u.value === fields[k].unit)?.parts ? ["", ""] : [""];
    else if (known[k]) display[k] = fields[k].texts;
    else display[k] = fromSi(k, fields[k].unit, v[k]);
  }
  return { si: v, display, solved, cartons: cartonCount(v.cbm, container) };
}

/** Convert a box's text(s) when its unit changes (keeps the quantity, as the reference does). */
export const convertTexts = (key, fromUnit, toUnit, texts) => convertUnitTexts(FIELDS[key].units, fromUnit, toUnit, texts);
export function convertUnitTexts(units, fromUnit, toUnit, texts) {
  const si = unitToSi(units, fromUnit, texts);
  if (!si || sign(si) <= 0) return pick(units, toUnit).parts ? (pick(units, fromUnit).parts ? texts : [texts[0] ?? "", ""]) : [texts[0] ?? ""];
  return unitFromSi(units, toUnit, si);
}

export const formatCount = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const containerVolumeM3 = (container) => {
  const c = CONTAINERS.find((x) => x.value === container) || CONTAINERS[0];
  return formatDecimal(mul(dec(c.cuft), CUFT_TO_M3));
};
