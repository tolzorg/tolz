// PCB Impedance Calculator engine — a port of omnicalculator.com/other/pcb-impedance (its equations and custom JS were read
// from the page; results checked live, see scripts/pcb-impedance-calculator.test.js). Nine conductor types (the reference's
// eeweb.com-based formulas, kept as they are). Lengths in meters; every formula only uses ratios of them.
//
//   ε_eff (microstrips) = (εr+1)/2 + (εr−1)/2 × (√(W/(W+12H)) + 0.04(1−W/H)²)   if W/H < 1,  without the 0.04 term otherwise
//   w′ = W + T/π × ln(4e / √((T/H)² + (T/(πW+1.1πT))²)) × (ε_eff+1)/(2ε_eff)
//   Microstrip Z = 60/√((εr+1)/2) … (Wheeler) with w′; edge-coupled microstrip odd/even (Kirschning–Jansen); wire microstrip
//   60/√ε_eff × acosh((2H+D)/D); embedded microstrip from the surface microstrip; wire stripline 60/√εr × ln(4H/(πD));
//   symmetric, asymmetric, edge-coupled and broadside-coupled striplines; differential = 2 × odd, common = even / 2.
// "height" stands for H, B or H1 depending on the type (the reference's height = b and height = height1 equations), and
// "width" for the wire diameter D.
//
// Deviation (flagged to the user): the reference rounds the edge-coupled stripline impedances to whole ohms (it calls
// Math.round(x, 10), which ignores the 10); here they keep their decimals.

import { decimalOf, formatDecimal } from "./ieltsScoreCalculatorEngine.js";

const PI = Math.PI;
const r = (x, d) => Math.round(x * 10 ** d) / 10 ** d; // mathjs.round(x, d) for these magnitudes
const sq = (x) => x * x;

export const TYPES = [
  { value: 0, label: "Microstrip", fields: ["thickness", "width", "height", "er"] },
  { value: 1, label: "Edge-coupled microstrip", fields: ["thickness", "width", "height", "spacing", "er"] },
  { value: 2, label: "Wire microstrip", fields: ["diameter", "height", "er"] },
  { value: 3, label: "Embedded microstrip", fields: ["thickness", "width", "height1", "height2", "er"] },
  { value: 4, label: "Wire stripline", fields: ["diameter", "height", "er"] },
  { value: 5, label: "Edge-coupled stripline", fields: ["thickness", "width", "b", "spacing", "er"] },
  { value: 6, label: "Broadside-coupled stripline", fields: ["thickness", "width", "b", "spacing", "er"] },
  { value: 7, label: "Symmetric stripline", fields: ["thickness", "width", "height", "er"] },
  { value: 8, label: "Asymmetric stripline", fields: ["thickness", "width", "height1", "height2", "er"] },
];

// ── The reference's helper functions ──
function effPermittivity(er, w, h) {
  const more = (er + 1) / 2 + ((er - 1) / 2) * Math.sqrt(w / (w + 12 * h));
  const less = (er + 1) / 2 + ((er - 1) / 2) * (Math.sqrt(w / (w + 12 * h)) + 0.04 * (1 - sq(w / h)));
  return r(w / h >= 1 ? more : less, 12);
}
/** The effective_width equation (with ε_eff in the last factor). */
const effectiveWidthEq = (t, w, h, eps) => w + (t / PI) * Math.log((4 * 2.718281828459) / Math.sqrt(sq(t / h) + sq(t) / sq(w * PI + 1.1 * t * PI))) * (eps + 1) / (2 * eps);
/** The custom-JS effective_width() (with εr in the last factor), used by the embedded microstrip. */
function effectiveWidthFn(t, w, h, er) {
  const lg = Math.log((4 * 2.718281828459) / Math.sqrt(sq(t / h) + sq(t / (w * PI + 1.1 * t * PI))));
  return r(w + (t / PI) * lg * (er + 1) / (2 * er), 14);
}
function microStrip(w, h, er) {
  const k = (14 * er + 8) / (11 * er);
  const wart = Math.sqrt((4 * h / w) * (4 * h / w) * (k * k) + PI * PI * (er + 1) / (2 * er));
  return r((120 * PI) / (2 * PI * Math.SQRT2 * Math.sqrt(er + 1)) * Math.log(1 + (4 * h / w) * ((4 * h / w) * k + wart)), 12);
}
function zoSurf(h, wEff, erEff) {
  const k = (14 * erEff + 8) / (11 * erEff);
  return 377 / (2 * PI * Math.SQRT2 * Math.sqrt(erEff + 1)) * Math.log(1 + 4 * (h / wEff) * (4 * (h / wEff) * k + Math.sqrt(16 * sq(h / wEff) * sq(k) + (erEff + 1) / (2 * erEff) * sq(PI))));
}
function coupledQ(u, g) {
  const q1 = 0.8695 * u ** 0.194;
  const q2 = 1 + 0.7519 * g + 1.89 * g ** 2.31;
  const q3 = 0.1975 + (16.6 + (8.4 / g) ** 6) ** -0.387 + (1 / 241) * Math.log(g ** 10 / (1 + (g / 3.4) ** 10));
  const q4 = (2 * q1) / (q2 * (Math.exp(-g) * u ** q3 + (2 - Math.exp(-g)) * u ** -q3));
  return { q1, q2, q3, q4 };
}
function oddEdgeMicrostrip(w, h, erEff, s, er, wEff) {
  const u = w / h;
  const g = s / h;
  const a0 = 0.7287 * (erEff - 0.5 * (er + 1)) * Math.sqrt(1 - Math.exp(-0.179 * u));
  const b0 = (0.747 * er) / (0.15 + er);
  const c0 = b0 - (b0 - 0.207) * Math.exp(-0.414 * u);
  const d0 = -0.593 + 0.694 * Math.exp(0.562 * u);
  const erEff0 = (0.5 * (er + 1) + a0 - erEff) * Math.exp(-c0 * g ** d0) + erEff;
  const z = zoSurf(h, wEff, erEff);
  const { q2, q4 } = coupledQ(u, g);
  const q5 = 1.794 + 1.14 * Math.log(1 + 0.638 / (g + 0.517 * g ** 2.43));
  const q6 = 0.2305 + (1 / 281.3) * Math.log(g ** 10 / (1 + (g / 5.8) ** 10)) + (1 / 5.1) * Math.log(1 + 0.598 * g ** 1.154);
  const q7 = (10 + 190 * sq(g)) / (1 + 82.3 * g ** 3);
  const q8 = Math.exp(-6.5 - 0.95 * Math.log(g) - (g / 0.15) ** 5);
  const q9 = Math.log(q7) * (q8 + 1 / 16.5);
  const q10 = (1 / q2) * (q2 * q4 - q5 * Math.exp(Math.log(u) * q6 * u ** -q9));
  return r((z * Math.sqrt(erEff / erEff0)) / (1 - (z / 377) * q10 * Math.sqrt(erEff)), 10);
}
function evenEdgeMicrostrip(w, h, erEff, s, er, wEff) {
  const u = w / h;
  const g = s / h;
  const z = zoSurf(h, wEff, erEff);
  const { q4 } = coupledQ(u, g);
  const v = (u * (20 + sq(g))) / (10 + sq(g)) + g * Math.exp(-g);
  const aev = 1 + Math.log((v ** 4 + sq(v / 52)) / (v ** 4 + 0.432)) / 49 + Math.log(1 + (v / 18.1) ** 3) / 18.7;
  const beer = 0.564 * ((er - 0.9) / (er + 3)) ** 0.053;
  const erEffE = 0.5 * (er + 1) + 0.5 * (er - 1) * (1 + (10 / v) ** (-aev * beer));
  return r((z * Math.sqrt(erEff / erEffE)) / (1 - (z / 377) * q4 * Math.sqrt(erEff)), 10);
}
function symStripline(w, t, er, b) {
  const test = w / b;
  let z;
  if (test < 0.35) {
    const d = (w / 2) * (1 + (t / (PI * w)) * (1 + Math.log((4 * PI * w) / t)) + 0.551 * sq(t / w));
    z = (60 / Math.sqrt(er)) * Math.log((4 * b) / (PI * d));
  } else {
    const diff = b - t;
    const theta = ((2 * b) / diff) * Math.log((2 * b - t) / diff) - (t / diff) * Math.log((2 * b * t - t * t) / (diff * diff));
    z = 94.15 / (test / (1 - t / b) + theta / PI);
  }
  return r(z, 10);
}
function symStripline2(w, t, h, er) {
  const b = 2 * h + t;
  const d = (w / 2) * (1 + (t / (PI * w)) * (1 + Math.log((4 * PI * w) / t)) + 0.551 * sq(t / w));
  const zt = (60 / Math.sqrt(er)) * Math.log((4 * b) / (PI * d));
  const theta = ((2 * b) / (b - t)) * Math.log((2 * b - t) / (b - t)) - (t / (b - t)) * Math.log((2 * b * t - sq(t)) / sq(b - t));
  const zw = 94.15 / (w / b / (1 - t / b) + theta / PI);
  return w / b < 0.35 || t / b <= 0.25 || t / w <= 0.11 ? zt : zw;
}
function doubleFactorial(x) {
  let result = 1;
  if (x === 0 || x === -1) return result;
  const half = x / 2;
  for (let i = 0; i < half; i++) { result *= x; x -= 2; }
  return r(result, 10);
}
function elliptic(k) {
  let temp = 1;
  for (let n = 1; n <= 20; n++) temp += sq(doubleFactorial(2 * n - 1) / doubleFactorial(2 * n)) * k ** (2 * n);
  return r((PI * temp) / 2, 10);
}
const tanh = (x) => r((Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1), 10);
const coth = (x) => r((Math.exp(2 * x) + 1) / (Math.exp(2 * x) - 1), 10);
const sech = (x) => r(2 / (Math.exp(x) + Math.exp(-x)), 10);
function edgeStripline(w, t, s, b, er) {
  const no = 377;
  const h = (b - t) / 2;
  const ke = tanh((PI * w) / (2 * b)) * tanh((PI / 2) * ((w + s) / b));
  const ko = tanh((PI * w) / (2 * b)) * coth((PI / 2) * ((w + s) / b));
  const z0e0 = ((30 * PI) / Math.sqrt(er)) * (elliptic(Math.sqrt(1 - sq(ke))) / elliptic(ke));
  const z0o0 = ((30 * PI) / Math.sqrt(er)) * (elliptic(Math.sqrt(1 - sq(ko))) / elliptic(ko));
  const z0 = symStripline2(w, t, h, er);
  const cfTb = ((0.0885 * er) / PI) * (((2 * b) / (b - t)) * Math.log((2 * b - t) / (b - t)) - (t / (b - t)) * Math.log(sq(b) / sq(b - t) - 1));
  const cf0 = ((0.0885 * er) / PI) * 2 * Math.log(2);
  const zIdeal = (no / (4 * Math.sqrt(er))) * (elliptic(sech((PI * w) / (2 * b))) / elliptic(tanh((PI * w) / (2 * b))));
  const odd1 = 1 / (1 / z0 - (cfTb / cf0) * (1 / z0o0 - 1 / zIdeal));
  const odd2 = 1 / (2 / z0o0 - 1 / zIdeal - (2 / (no * er)) * (cfTb - cf0 - er / s));
  const odd = s / t >= 5 ? odd1 : odd2;
  const even = 1 / (1 / z0 - (cfTb / cf0) * (1 / zIdeal - 1 / z0e0));
  return [r(odd, 10), r(even, 10)];
}
function findK(w, b, s) {
  let k = 0.005;
  let minError = 100;
  let best = 100;
  for (let n = 1; n <= 1000; n++) {
    const R = Math.sqrt((k * b / s - 1) / (b / (k * s) - 1));
    const expr = (1 / PI) * (Math.log((1 + R) / (1 - R)) - (s / b) * Math.log((1 + R / k) / (1 - R / k)));
    const err = Math.abs(w / b - expr);
    if (err < minError) { best = k; minError = err; }
    k += 0.001;
  }
  return r(best, 10);
}
function broadsideStripline(w, s, b, er) {
  const k = findK(w, b, s);
  const odd = r((293.9 / Math.sqrt(er)) * (s / b) * (1 / r(0.5 * Math.log((1 + k) / (1 - k)), 10)), 10);
  const even = r((377 / Math.sqrt(er)) * (elliptic(Math.sqrt(1 - sq(k))) / elliptic(k)), 10);
  return [odd, even];
}
function asymmetricStripline(w, t, h1, h2, er) {
  const b = h1 + h2 + t;
  const z1 = symStripline(w, t, 1, h1);
  const z2 = symStripline(w, t, 1, h2);
  const zb = symStripline(w, t, 1, b);
  const zAir = (2 * z1 * z2) / (z1 + z2);
  const delta = 0.0325 * sq(zAir) * (0.5 - (2 * h1 + t) / (2 * b)) ** 2.2 * ((t + w) / b) ** 2.9;
  return r((1 / Math.sqrt(er)) * (zb - delta), 10);
}
function embeddedMicrostrip(h1, h2, er, eps, w, t) {
  const wPrime = effectiveWidthFn(t, w, h1, er);
  const surf = microStrip(wPrime, h2, er);
  const e = Math.exp((-2 * (h2 - h1)) / h2);
  return r(surf / Math.sqrt(e + (er / eps) * (1 - e)), 12);
}

const MESSAGES = {
  spacing: "Spacing should be greater than zero.",
  thickness: "Thickness should be greater than zero.",
  width: "Width should be greater than zero.",
  diameter: "Width should be greater than zero.",
  height: "Substrate height (H) should be greater than zero.",
  b: "Substrate height (H) should be greater than zero.",
  height1: "Substrate height (H1) should be greater than zero.",
  height2: "Substrate height (H2) should be greater than zero.",
  er: "Substrate dielectric should be greater than zero.",
};

/** A number shown with Omni's display rounding (15 significant digits first, to drop float noise). */
export const fmt = (x) => formatDecimal(decimalOf(String(Number(x.toPrecision(15)))));
const isNum = (x) => typeof x === "number" && Number.isFinite(x);

/**
 * @param {number} type  a TYPES value.
 * @param {Record<string, number|null>} v  lengths in m, er dimensionless (null when blank).
 * @returns {{ missing: string[] } | { errors: string[] } | { impedance?: number, odd?: number, even?: number, differential?: number,
 *   common?: number, epsEff: number|null, effectiveWidth: number|null }}
 */
export function calculatePcbImpedance(type, v) {
  const def = TYPES.find((t) => t.value === type) || TYPES[0];
  const missing = def.fields.filter((k) => v[k] === null || v[k] === undefined);
  if (missing.length) return { missing };
  const errors = def.fields.filter((k) => !(v[k] > 0)).map((k) => MESSAGES[k]);
  if (errors.length) return { errors: [...new Set(errors)] };

  const t = v.thickness;
  const er = v.er;
  const w = def.fields.includes("diameter") ? v.diameter : v.width;
  const h = v.height ?? v.b ?? v.height1; // the reference's height = b / height = height1
  const epsEff = effPermittivity(er, w, h);
  const effectiveWidth = t ? effectiveWidthEq(t, w, h, epsEff) : null;
  const out = { epsEff: [0, 2, 3].includes(type) ? epsEff : null, effectiveWidth };
  let res;
  switch (type) {
    case 0: res = { impedance: microStrip(effectiveWidth, h, er) }; break;
    case 1: {
      const odd = oddEdgeMicrostrip(w, h, epsEff, v.spacing, er, effectiveWidth);
      const even = evenEdgeMicrostrip(w, h, epsEff, v.spacing, er, effectiveWidth);
      res = { odd, even, differential: 2 * odd, common: 0.5 * even };
      break;
    }
    case 2: {
      const pep = (2 * h + w) / w;
      res = { impedance: ((120 * PI) / (2 * PI * Math.sqrt(epsEff))) * Math.log(pep + Math.sqrt(sq(pep) - 1)) };
      break;
    }
    case 3: res = { impedance: embeddedMicrostrip(v.height1, v.height2, er, epsEff, w, t) }; break;
    case 4: res = { impedance: ((120 * PI) * Math.log((4 * h) / (PI * w))) / (2 * PI * Math.sqrt(er)) }; break;
    case 5: {
      const [odd, even] = edgeStripline(w, t, v.spacing, v.b, er);
      res = { odd, even, differential: 2 * odd, common: 0.5 * even };
      break;
    }
    case 6: {
      const [odd, even] = broadsideStripline(w, v.spacing, v.b, er);
      res = { odd, even, differential: 2 * odd, common: 0.5 * even };
      break;
    }
    case 7: res = { impedance: r(symStripline(w, t, er, 2 * h + t), 10) }; break;
    default: res = { impedance: asymmetricStripline(w, t, v.height1, v.height2, er) };
  }
  const values = Object.values(res);
  if (!values.every(isNum)) return { errors: ["These dimensions are outside the range of this conductor's formula."] };
  return { ...out, ...res };
}
