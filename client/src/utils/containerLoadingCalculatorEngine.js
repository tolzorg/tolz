// Container Loading Calculator engine — matches omnicalculator.com/other/container-loading (its calculator definition
// and custom JS were read from the page; behaviour checked live, see scripts/container-loading-calculator.test.js).
//
// The reference tries the box in all 6 orientations, fits floor(container side / box side) along the width, length
// and height, and keeps the FIRST orientation with the most boxes (ties keep the earlier one), in this order:
//   [A,B,C] [A,C,B] [B,A,C] [B,C,A] [C,A,B] [C,B,A]   (sides along width, length, height; A = length, B = width,
//   C = height of the package)
// Outputs: boxes, utilization = (boxes × package volume / container volume × 100).toFixed(2) (shown without trailing
// zeros, "78.9"), layers (boxes up the height), packages per layer (boxes / layers) and which sides go along the
// container's width and length.
// Container types fill in fixed dimensions (meters); "Custom" makes them editable. Volumes = length × width ×
// height, and a blank side can be solved from a typed volume (most recently typed boxes win, as in the CBM
// calculator, whose unit and solver helpers this reuses).
// Results need 0 < container length < 400 m, 0 < width < 60 m, 0 < height < 60 m, every package side > 0 and each
// package side shorter than the matching container side (the reference's messages).
//
// Deviation (flagged to the user): the floor divisions are exact. The reference divides JS floats, so 0.3 m / 0.1 m
// gives 2.999… → 2 (live: 10 cm boxes in a 70 × 30 × 30 cm space → 24 instead of 63).

import { decimalOf } from "./ieltsScoreCalculatorEngine.js";
import { mul, div, sign, sub } from "./semesterGradeCalculatorEngine.js";
import { LENGTH_UNITS, VOLUME_UNITS, unitToSi, unitFromSi, solveByRecency, formatCount } from "./cbmCalculatorEngine.js";

const only = (list, values) => values.map((v) => list.find((u) => u.value === v));
export const CONTAINER_LENGTH_UNITS = only(LENGTH_UNITS, ["m", "ft", "ftin", "mcm"]);
export const CONTAINER_VOLUME_UNITS = only(VOLUME_UNITS, ["m3", "cuft", "cuyd", "l", "usgal", "ukgal"]);
export const PACKAGE_LENGTH_UNITS = only(LENGTH_UNITS, ["cm", "m", "in", "ft", "ftin", "mcm"]);
export const PACKAGE_VOLUME_UNITS = only(VOLUME_UNITS, ["cm3", "m3", "cuin", "cuft", "cuyd", "l", "usgal", "ukgal"]);

/** Internal dimensions in meters [length, width, height] (the reference's dataset). */
export const CONTAINER_TYPES = [
  { value: "std10", label: "Standard 10ft", dims: ["2.83", "2.35", "2.39"] },
  { value: "std20", label: "Standard 20ft", dims: ["5.9", "2.35", "2.39"] },
  { value: "std40", label: "Standard 40ft", dims: ["12.03", "2.35", "2.39"] },
  { value: "hc20", label: "High Cube 20ft", dims: ["5.9", "2.35", "2.69"] },
  { value: "hc40", label: "High Cube 40ft", dims: ["12.03", "2.35", "2.69"] },
  { value: "hc45", label: "High Cube 45ft", dims: ["13.56", "2.35", "2.69"] },
  { value: "pw20", label: "Pallet Wide 20ft", dims: ["5.89", "2.44", "2.39"] },
  { value: "pw40", label: "Pallet Wide 40ft", dims: ["12.02", "2.44", "2.39"] },
  { value: "custom", label: "Custom", dims: null },
];

export const FIELDS = {
  cntL: { label: "Container's length", units: CONTAINER_LENGTH_UNITS, unit: "m", message: "Length must be greater than 0." },
  cntW: { label: "Container's width", units: CONTAINER_LENGTH_UNITS, unit: "m", message: "Width must be greater than 0." },
  cntH: { label: "Container's height", units: CONTAINER_LENGTH_UNITS, unit: "m", message: "Height must be greater than 0." },
  cntVol: { label: "Container's volume", units: CONTAINER_VOLUME_UNITS, unit: "m3", message: "Volume must be greater than 0." },
  pkgL: { label: "Package length (side A)", units: PACKAGE_LENGTH_UNITS, unit: "cm", message: "Length must be greater than 0." },
  pkgW: { label: "Package width (side B)", units: PACKAGE_LENGTH_UNITS, unit: "cm", message: "Width must be greater than 0." },
  pkgH: { label: "Package height (side C)", units: PACKAGE_LENGTH_UNITS, unit: "cm", message: "Height must be greater than 0." },
  pkgVol: { label: "Single package volume", units: PACKAGE_VOLUME_UNITS, unit: "cm3", message: "Volume must be greater than 0." },
};
export const FIELD_KEYS = Object.keys(FIELDS);
const CONTAINER_KEYS = ["cntL", "cntW", "cntH", "cntVol"];
const EQUATIONS = [
  ["cntVol", ["cntL", "cntW", "cntH"], "product"],
  ["pkgVol", ["pkgL", "pkgW", "pkgH"], "product"],
];

const LIMITS = [
  ["cntL", "400", "Are you sure about this value? The biggest container ships are around 400 meters long. Please input a lower value."],
  ["cntW", "60", "Are you sure about this value? The biggest container ships are around 60 meters wide. Please input a lower value."],
  ["cntH", "60", "Please input a value lower than 60 meters."],
];
const TOO_BIG = [
  ["pkgL", "cntL", "That's longer than your container, you can't fit this item inside. Please input a lower value."],
  ["pkgW", "cntW", "That's wider than your container, you can't fit this item inside. Please input a lower value."],
  ["pkgH", "cntH", "That's taller than your container, you can't fit this item inside. Please input a lower value."],
];
const SIDES = ["A", "B", "C"];
/** Orientation i: which package side (0 = A, 1 = B, 2 = C) goes along the container's width, length and height. */
const ORIENTATIONS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

const toNumber = (d) => Number(`${d.n}e-${d.s}`);
const floorDiv = (a, b) => { const q = div(a, b); return q.n / 10n ** BigInt(q.s); };

/**
 * The reference's packing search with exact floor divisions.
 * @param {object[]} pkg  package sides [A, B, C] (exact decimals, m);  @param {object[]} cnt  container [length, width, height]
 * @param {bigint|null} [weightBoxes]  optional cap from a weight limit (Pallet Calculator): boxes = min(fit, cap) and
 *   layers = ceil(boxes / boxes per full layer), as the reference's pallet code does.
 */
export function bestPacking(pkg, cnt, weightBoxes = null) {
  const [cL, cW, cH] = cnt;
  let best = { boxes: 0n, layers: 0n, alongWidth: 0, alongLength: 0 };
  for (const [w, l, h] of ORIENTATIONS) {
    const layers = floorDiv(cH, pkg[h]);
    const boxes = floorDiv(cW, pkg[w]) * floorDiv(cL, pkg[l]) * layers;
    if (boxes > best.boxes) best = { boxes, layers, alongWidth: w, alongLength: l };
  }
  const fullLayer = best.layers > 0n ? best.boxes / best.layers : 0n;
  if (weightBoxes !== null && best.boxes > 0n) {
    const boxes = best.boxes >= weightBoxes ? weightBoxes : best.boxes;
    best = { ...best, boxes, layers: (boxes + fullLayer - 1n) / fullLayer };
  }
  const n = pkg.map(toNumber);
  const c = cnt.map(toNumber);
  const utilization = String(Number(((Number(best.boxes) * n[0] * n[1] * n[2]) / (c[1] * c[0] * c[2]) * 100).toFixed(2)));
  const perLayer = best.layers > 1n ? fullLayer : best.boxes;
  return { ...best, perLayer, utilization };
}

/** "side B parallel to the container's width, and side A parallel to the container's length." */
export const arrangementText = (p) => ({ width: `side ${SIDES[p.alongWidth]}`, length: `side ${SIDES[p.alongLength]}` });

/**
 * @param {string} type  a CONTAINER_TYPES value.
 * @param {Record<string, { unit: string, texts: string[], si?: object, siTexts?: string[] }>} fields
 * @param {string[]} order  typed boxes, least recent first (boxes the calculator filled in are left out).
 * @returns {{ missing: string[] } | { errors: string[] } | { si, display: Record<string, string[]>, solved: string[],
 *   packing: object, boxes: string, layers: string, perLayer: string }}
 */
export function calculateContainerLoading(type, fields, order) {
  const preset = CONTAINER_TYPES.find((t) => t.value === type)?.dims || null;
  const siOf = (k) => {
    const f = fields[k];
    return f.si && f.siTexts && f.siTexts.join("|") === f.texts.join("|") ? f.si : unitToSi(FIELDS[k].units, f.unit, f.texts);
  };
  const typed = order.filter((k) => !(preset && CONTAINER_KEYS.includes(k)) && siOf(k) !== null);
  const errors = [];
  const parsed = {};
  for (const k of typed) {
    const si = siOf(k);
    if (si === false || sign(si) <= 0) errors.push(`${FIELDS[k].label}: ${FIELDS[k].message}`);
    else parsed[k] = si;
  }
  if (errors.length) return { errors };

  // A preset container's dimensions are fixed: they count as the most recent values.
  const fixed = preset ? { cntL: decimalOf(preset[0]), cntW: decimalOf(preset[1]), cntH: decimalOf(preset[2]) } : {};
  const { known, values: v } = solveByRecency([...typed, ...Object.keys(fixed)], { ...parsed, ...fixed }, EQUATIONS);
  const missing = ["cntL", "cntW", "cntH", "pkgL", "pkgW", "pkgH"].filter((k) => !v[k]);
  if (missing.length) return { missing };

  for (const [k, max, msg] of LIMITS) if (sign(sub(v[k], decimalOf(max))) >= 0) errors.push(msg);
  for (const [p, c, msg] of TOO_BIG) if (sign(sub(v[p], v[c])) >= 0) errors.push(msg);
  if (errors.length) return { errors };

  const solved = FIELD_KEYS.filter((k) => v[k] && !known[k] && !(preset && CONTAINER_KEYS.includes(k) && k !== "cntVol"));
  const display = {};
  for (const k of FIELD_KEYS) {
    if (known[k] && !fixed[k]) display[k] = fields[k].texts;
    else display[k] = unitFromSi(FIELDS[k].units, fields[k].unit, v[k]);
  }
  const packing = bestPacking([v.pkgL, v.pkgW, v.pkgH], [v.cntL, v.cntW, v.cntH]);
  return {
    si: v, display, solved, packing,
    boxes: formatCount(packing.boxes), layers: formatCount(packing.layers), perLayer: formatCount(packing.perLayer),
  };
}

/** A preset's dimension shown in a unit (the boxes are read-only for presets). */
export const presetDisplay = (type, key, unit) => {
  const dims = CONTAINER_TYPES.find((t) => t.value === type)?.dims;
  const i = ["cntL", "cntW", "cntH"].indexOf(key);
  if (!dims || i < 0) return null;
  return unitFromSi(FIELDS[key].units, unit, decimalOf(dims[i]));
};
/** A preset container's volume in a unit. */
export const presetVolume = (type, unit) => {
  const dims = CONTAINER_TYPES.find((t) => t.value === type)?.dims;
  if (!dims) return null;
  return unitFromSi(FIELDS.cntVol.units, unit, mul(mul(decimalOf(dims[0]), decimalOf(dims[1])), decimalOf(dims[2])));
};
