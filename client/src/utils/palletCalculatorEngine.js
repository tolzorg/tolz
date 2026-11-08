// Pallet Calculator engine — matches omnicalculator.com/other/pallet (its calculator definition and custom JS were read
// from the page; behaviour checked live, see scripts/pallet-calculator.test.js).
//
// The packing search is the Container Loading Calculator's (same reference code): the package in all 6 orientations,
// floor(pallet side / package side) along the width, length and load height, first maximum wins. With "Take weight
// into account?" set to Yes, the count is capped at floor(maximum weight / package weight) and the layers become
// ceil(packages / packages per full layer). Utilization = packages × package volume / (width × length × load height),
// toFixed(2). Pallet volume = load height × width × length (output only). No package fitting → "The package
// dimensions are too large to fit on the pallet…".
//
// Deviations (flagged to the user): exact floor divisions (the reference divides JS floats, as in Container Loading);
// the 1200 × 1000 mm pallet is 120 × 100 cm here (the reference's data has 120 × 120 cm — live: 144,000 cm³ at 10 cm).

import { decimalOf } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign } from "./semesterGradeCalculatorEngine.js";
import { LENGTH_UNITS, WEIGHT_UNITS, VOLUME_UNITS, unitToSi, unitFromSi, formatCount } from "./cbmCalculatorEngine.js";
import { bestPacking, arrangementText } from "./containerLoadingCalculatorEngine.js";

const ratio = (n, d = "1") => [decimalOf(n), decimalOf(d)];
const only = (list, values) => values.map((v) => list.find((u) => u.value === v));
export const PALLET_LENGTH_UNITS = only(LENGTH_UNITS, ["mm", "cm", "m", "in", "ft", "ftin", "mcm"]);
export const PALLET_WEIGHT_UNITS = [
  { value: "mg", label: "milligrams (mg)", short: "mg", f: ratio("1", "1000000") },
  ...WEIGHT_UNITS,
];
export const PALLET_VOLUME_UNITS = [
  ...only(VOLUME_UNITS, ["cm3", "m3", "cuin", "cuft", "ml", "l", "usgal", "ukgal"]),
  { value: "usqt", label: "quarts (US) (US qt)", short: "US qt", f: ratio("473176473", "500000000000") },
  { value: "ukqt", label: "quarts (UK) (UK qt)", short: "UK qt", f: ratio("454609", "400000000") },
];

/** Pallet sizes [width, length] in cm (the reference's list; see the 1200 × 1000 note above). */
export const PALLET_TYPES = [
  { value: "48x40", label: "1219×1016 mm (48×40 inches)", dims: ["121.9", "101.6"] },
  { value: "1200x1000", label: "1200×1000 mm (47.24×39.37 inches)", dims: ["120", "100"] },
  { value: "1165x1165", label: "1165×1165 mm (45.90×45.90 inches)", dims: ["116.5", "116.5"] },
  { value: "1067x1067", label: "1067×1067 mm (42×42 inches)", dims: ["106.7", "106.7"] },
  { value: "1100x1100", label: "1100×1100 mm (43.30×43.30 inches)", dims: ["110", "110"] },
  { value: "1200x800", label: "1200×800 mm (47.24×31.50 inches)", dims: ["120", "80"] },
  { value: "custom", label: "Custom size", dims: null },
];

export const FIELDS = {
  pWidth: { label: "Pallet width", units: PALLET_LENGTH_UNITS, unit: "cm", message: "Pallet's dimensions must be greater than zero!" },
  pLength: { label: "Pallet length", units: PALLET_LENGTH_UNITS, unit: "cm", message: "Pallet's dimensions must be greater than zero!" },
  pHeight: { label: "Maximum load height", units: PALLET_LENGTH_UNITS, unit: "cm", message: "Load height must be greater than zero!" },
  pWeight: { label: "Maximum weight", units: PALLET_WEIGHT_UNITS, unit: "kg", message: "Maximum weight must be greater than zero!" },
  pVolume: { label: "Pallet volume", units: PALLET_VOLUME_UNITS, unit: "cm3" },
  bSide1: { label: "Side A", units: PALLET_LENGTH_UNITS, unit: "cm", message: "Package's dimensions must be greater than zero!" },
  bSide2: { label: "Side B", units: PALLET_LENGTH_UNITS, unit: "cm", message: "Package's dimensions must be greater than zero!" },
  bSide3: { label: "Side C", units: PALLET_LENGTH_UNITS, unit: "cm", message: "Package's dimensions must be greater than zero!" },
  bWeight: { label: "Weight (per package)", units: PALLET_WEIGHT_UNITS, unit: "kg", message: "Package's weight must be greater than zero!" },
};
export const FIELD_KEYS = Object.keys(FIELDS);
export const TOO_LARGE = "The package dimensions are too large to fit on the pallet. Reduce these dimensions or choose a larger pallet size.";

const presetSi = (type) => {
  const dims = PALLET_TYPES.find((t) => t.value === type)?.dims;
  return dims ? dims.map((d) => div(decimalOf(d), decimalOf("100"))) : null; // cm → m
};
/** A preset's width / length shown in a unit, or null for "Custom size". */
export const presetDisplay = (type, key, unit) => {
  const si = presetSi(type);
  return si ? unitFromSi(FIELDS[key].units, unit, si[key === "pWidth" ? 0 : 1]) : null;
};

/** A box's exact value: `si` when its unit was just changed (and its texts are unchanged), else parsed from the texts. */
const siOf = (fields, k) => {
  const f = fields[k];
  return f.si && f.siTexts && f.siTexts.join("|") === f.texts.join("|") ? f.si : unitToSi(FIELDS[k].units, f.unit, f.texts);
};

/** Pallet volume (load height × width × length) in a unit, or null when a dimension is missing or invalid. */
export function palletVolume(type, fields) {
  const preset = presetSi(type);
  const w = preset ? preset[0] : siOf(fields, "pWidth");
  const l = preset ? preset[1] : siOf(fields, "pLength");
  const h = siOf(fields, "pHeight");
  if (!w || !l || !h || sign(w) <= 0 || sign(l) <= 0 || sign(h) <= 0) return null;
  return unitFromSi(FIELDS.pVolume.units, fields.pVolume.unit, mul(mul(h, w), l));
}

/**
 * @param {{ type: string, useWeight: boolean, fields: Record<string, { unit: string, texts: string[] }> }} input
 * @returns {{ missing: string[] } | { errors: string[] } | { tooLarge: true } | { packing: object, boxes: string,
 *   layers: string, perLayer: string, arrangement: { width: string, length: string } }}
 */
export function calculatePallet({ type, useWeight, fields }) {
  const preset = presetSi(type);
  const needed = [...(preset ? [] : ["pWidth", "pLength"]), "pHeight", ...(useWeight ? ["pWeight"] : []), "bSide1", "bSide2", "bSide3", ...(useWeight ? ["bWeight"] : [])];
  const si = {};
  const missing = [];
  const errors = [];
  for (const k of needed) {
    const v = siOf(fields, k);
    if (v === null) missing.push(k);
    else if (v === false || sign(v) <= 0) { if (!errors.includes(FIELDS[k].message)) errors.push(FIELDS[k].message); }
    else si[k] = v;
  }
  if (missing.length) return { missing };
  if (useWeight && !errors.length && div(si.pWeight, si.bWeight).n < 10n ** 40n) { // pWeight / bWeight < 1 (40-decimal quotient)
    errors.push("The package's weight exceeds the pallet's weight capacity.", "The pallet's weight capacity is smaller than the package's weight.");
  }
  if (errors.length) return { errors };

  const [w, l] = preset || [si.pWidth, si.pLength];
  let weightBoxes = null;
  if (useWeight) { const q = div(si.pWeight, si.bWeight); weightBoxes = q.n / 10n ** BigInt(q.s); }
  const packing = bestPacking([si.bSide1, si.bSide2, si.bSide3], [l, w, si.pHeight], weightBoxes);
  if (packing.boxes === 0n) return { tooLarge: true };
  return {
    packing, arrangement: arrangementText(packing),
    boxes: formatCount(packing.boxes), layers: formatCount(packing.layers), perLayer: formatCount(packing.perLayer),
  };
}

