// DIY Shed Cost Calculator — pure calculation utilities

// ── Roof types ──────────────────────────────────────────────────────
// c = gable/slant wall-triangle & rise multiplier (0 disables the rise term)
// t = rafter/roof-plane multiplier (2 for gable = two roof slopes)
export const ROOF_TYPES = [
  { id: "slanted", label: "Slanted roof", c: 1, t: 1, hasRise: true  },
  { id: "flat",    label: "Flat roof",    c: 0, t: 1, hasRise: false },
  { id: "gable",   label: "Gable roof",   c: 1, t: 2, hasRise: true  },
];

// ── Length units ────────────────────────────────────────────────────
export const LENGTH_UNITS = [
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
  { id: "in", label: "in", toM: 0.0254  },
];

// ── Area output units ─────────────────────────────────────────────
export const AREA_OUT_UNITS = [
  { id: "m2",  label: "m²",  fromM2: 1        },
  { id: "ft2", label: "ft²", fromM2: 10.7639  },
  { id: "yd2", label: "yd²", fromM2: 1.19599  },
  { id: "cm2", label: "cm²", fromM2: 10000    },
];

// ── Currencies ────────────────────────────────────────────────────
export const CURRENCIES = [
  { id: "USD", label: "USD", symbol: "$"   },
  { id: "EUR", label: "EUR", symbol: "€"   },
  { id: "GBP", label: "GBP", symbol: "£"   },
  { id: "INR", label: "INR", symbol: "₹"   },
  { id: "PKR", label: "PKR", symbol: "Rs"  },
  { id: "CAD", label: "CAD", symbol: "CA$" },
  { id: "AUD", label: "AUD", symbol: "AU$" },
];

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function fromLengthM(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? val / u.toM : val;
}

export function fromM2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM2 : val;
}

// ── Core calculation ──────────────────────────────────────────────
// W = width, L = length, H = wall height, R = roof rise, O = overhang (all metres).
// riseR may be null/0 for flat roofs (c = 0 makes it a no-op anyway).
export function calcShedCost({ wM, lM, hM, rM, oM, roofType }) {
  const rt = ROOF_TYPES.find((r) => r.id === roofType) || ROOF_TYPES[0];
  if (!isFinite(wM) || wM <= 0) return null;
  if (!isFinite(lM) || lM <= 0) return null;
  if (!isFinite(hM) || hM <= 0) return null;
  if (rt.hasRise && (!isFinite(rM) || rM <= 0)) return null;

  const rise = rt.hasRise ? rM : 0;
  const overhang = isFinite(oM) && oM >= 0 ? oM : 0;
  const { c, t } = rt;

  const floorAreaM2 = lM * wM;
  const wallAreaM2  = 2 * (lM + wM) * hM + (wM * rise * c);

  const riseTerm  = c * rise * t * (1 + (2 * overhang) / wM);
  const rafterSpanM = Math.sqrt((wM + 2 * overhang) ** 2 + riseTerm ** 2) / t;

  const roofAreaM2 = rafterSpanM * t * (lM + 2 * overhang);

  return { floorAreaM2, wallAreaM2, rafterSpanM, roofAreaM2 };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtShed(n, dp = 3) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
