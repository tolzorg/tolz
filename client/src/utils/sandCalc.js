// Sand Calculator — pure calculation utilities

// ── Length / Width units ──────────────────────────────────────────
export const LENGTH_UNITS = [
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
  { id: "in", label: "in", toM: 0.0254  },
];

// ── Depth units ───────────────────────────────────────────────────
export const DEPTH_UNITS = [
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── Area output units ─────────────────────────────────────────────
export const AREA_OUT_UNITS = [
  { id: "m2",  label: "m²",  fromM2: 1        },
  { id: "cm2", label: "cm²", fromM2: 10000    },
  { id: "ft2", label: "ft²", fromM2: 10.7639  },
  { id: "yd2", label: "yd²", fromM2: 1.19599  },
  { id: "in2", label: "in²", fromM2: 1550.003 },
];

// ── Volume output units ───────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "m3",  label: "m³",  fromM3: 1        },
  { id: "ft3", label: "ft³", fromM3: 35.3147  },
  { id: "yd3", label: "yd³", fromM3: 1.30795  },
  { id: "l",   label: "L",   fromM3: 1000     },
];

// ── Weight output units ───────────────────────────────────────────
export const WEIGHT_OUT_UNITS = [
  { id: "kg",  label: "kg",       fromKg: 1          },
  { id: "lb",  label: "lb",       fromKg: 2.20462    },
  { id: "t",   label: "t",        fromKg: 0.001      },
  { id: "ton", label: "short ton",fromKg: 0.00110231 },
];

// ── Density input units ───────────────────────────────────────────
export const DENSITY_UNITS = [
  { id: "kg/m3",  label: "kg/m³",  toKgM3: 1       },
  { id: "lb/ft3", label: "lb/ft³", toKgM3: 16.0185 },
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

// Typical dry sand bulk density (kg/m³) — matches the common reference value.
export const DEFAULT_DENSITY_KGM3 = 1601.948;

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toDepthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = DEPTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toDensityKgM3(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = DENSITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toKgM3 : null;
}

export function fromM2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM2 : val;
}

export function fromM3(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM3 : val;
}

export function fromKgSand(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = WEIGHT_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromKg : val;
}

// ── Core calculation ──────────────────────────────────────────────
// Returns result object, or null if length/width/depth aren't set.
export function calcSand({ lengthM, widthM, depthM, densityKgM3 }) {
  if (!isFinite(lengthM) || lengthM <= 0) return null;
  if (!isFinite(widthM)  || widthM  <= 0) return null;
  if (!isFinite(depthM)  || depthM  <= 0) return null;

  const areaM2 = lengthM * widthM;
  const volumeNeededM3 = areaM2 * depthM;
  const weightNeededKg = isFinite(densityKgM3) && densityKgM3 > 0
    ? volumeNeededM3 * densityKgM3
    : null;

  return { areaM2, volumeNeededM3, weightNeededKg };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtSand(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
