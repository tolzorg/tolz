// Rip Rap Calculator — pure calculation utilities

// ── Velocity input units ─────────────────────────────────────────
export const VELOCITY_UNITS = [
  { id: "m/s",  label: "m/s",  toMS: 1         },
  { id: "ft/s", label: "ft/s", toMS: 0.3048    },
  { id: "km/h", label: "km/h", toMS: 1 / 3.6   },
  { id: "mph",  label: "mph",  toMS: 0.44704   },
];

// ── Area input units ─────────────────────────────────────────────
export const AREA_UNITS = [
  { id: "m2",  label: "m²",    toM2: 1         },
  { id: "ft2", label: "ft²",   toM2: 0.092903  },
  { id: "yd2", label: "yd²",   toM2: 0.836127  },
  { id: "ac",  label: "acres", toM2: 4046.86   },
];

// ── Depth input units ────────────────────────────────────────────
export const DEPTH_UNITS = [
  { id: "mm", label: "mm", toM: 1e-3    },
  { id: "cm", label: "cm", toM: 1e-2    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── D₅₀ output units ────────────────────────────────────────────
export const D50_OUT_UNITS = [
  { id: "mm", label: "mm", fromM: 1000     },
  { id: "cm", label: "cm", fromM: 100      },
  { id: "m",  label: "m",  fromM: 1        },
  { id: "in", label: "in", fromM: 39.3701  },
  { id: "ft", label: "ft", fromM: 3.28084  },
];

// ── Volume output units ──────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "m3",  label: "m³",  fromM3: 1        },
  { id: "ft3", label: "ft³", fromM3: 35.3147  },
  { id: "yd3", label: "yd³", fromM3: 1.30795  },
];

// ── Rock density input units ─────────────────────────────────────
export const DENSITY_UNITS = [
  { id: "kg/m3",  label: "kg/m³",  toKgM3: 1       },
  { id: "lb/ft3", label: "lb/ft³", toKgM3: 16.0185 },
  { id: "t/m3",   label: "t/m³",   toKgM3: 1000    },
];

// ── Weight output units ──────────────────────────────────────────
export const WEIGHT_OUT_UNITS = [
  { id: "kg",     label: "kg",      fromKg: 1          },
  { id: "lb",     label: "lb",      fromKg: 2.20462    },
  { id: "tonnes", label: "tonnes",  fromKg: 0.001      },
  { id: "ustons", label: "US tons", fromKg: 0.00110231 },
];

// ── Isbash constants ─────────────────────────────────────────────
export const ISBASH_CONSTANTS = [
  { id: "low",  label: "1.20 — Low turbulence",  value: 1.20 },
  { id: "high", label: "0.86 — High turbulence", value: 0.86 },
];

// ── Calculation modes ────────────────────────────────────────────
export const CALC_MODES = [
  {
    id:    "rock-size",
    label: "Rock Size (D₅₀)",
    desc:  "Find the minimum rock diameter using the Isbash equation for a given water velocity",
  },
  {
    id:    "volume",
    label: "Volume & Weight",
    desc:  "Calculate rip rap volume, weight, and estimated cost from area and depth",
  },
];

// ── Reference table (S = 2.50, g = 9.806 m/s²) ──────────────────
// Pre-computed D₅₀ values matching Omnicalculator reference
const G_STD = 9.806;
const S_REF = 2.50;

export const VELOCITY_REFERENCE = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0].map((v) => ({
  velocityMS: v,
  lowD50Cm:  parseFloat(((v * v) / (2 * G_STD * 1.20 * 1.20 * (S_REF - 1)) * 100).toFixed(1)),
  highD50Cm: parseFloat(((v * v) / (2 * G_STD * 0.86 * 0.86 * (S_REF - 1)) * 100).toFixed(1)),
}));

// ── Unit converters ───────────────────────────────────────────────

export function toMeterPerSec(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = VELOCITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toMS : null;
}

export function toSquareMeters(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = AREA_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM2 : null;
}

export function toMetersDepth(val, unitId) {
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

export function convertD50(meters, unitId) {
  if (meters === null || !isFinite(meters)) return null;
  const u = D50_OUT_UNITS.find((u) => u.id === unitId);
  return u ? meters * u.fromM : meters;
}

export function convertVolume(m3, unitId) {
  if (m3 === null || !isFinite(m3)) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? m3 * u.fromM3 : m3;
}

export function convertWeight(kg, unitId) {
  if (kg === null || !isFinite(kg)) return null;
  const u = WEIGHT_OUT_UNITS.find((u) => u.id === unitId);
  return u ? kg * u.fromKg : kg;
}

// ── Gravity units ─────────────────────────────────────────────────
export const GRAVITY_UNITS = [
  { id: "m/s2",  label: "m/s²",  factor: 1      },
  { id: "ft/s2", label: "ft/s²", factor: 0.3048 },
];

export function toGravityMS2(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = GRAVITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.factor : null;
}

// ── Core calculations ─────────────────────────────────────────────

// Isbash equation: D₅₀ = V² / (2 × g × C² × (S − 1))
// Returns D₅₀ in meters, or null if inputs are invalid.
export function calcRockSize({ velocityMS, g, C, S }) {
  if (!isFinite(velocityMS) || velocityMS <= 0) return null;
  if (!isFinite(g) || g <= 0) return null;
  if (!isFinite(C) || C <= 0) return null;
  if (!isFinite(S) || S <= 1) return null;
  return (velocityMS * velocityMS) / (2 * g * C * C * (S - 1));
}

// Returns { netVolumeM3, totalVolumeM3, weightKg } or null.
// netVolumeM3   = Area × Depth  (before wastage)
// totalVolumeM3 = Area × Depth × (1 + wastage/100)  (what to order)
// weightKg      = totalVolumeM3 × density
export function calcVolume({ areaM2, depthM, wastagePct, densityKgM3 }) {
  if (!isFinite(areaM2) || areaM2 <= 0) return null;
  if (!isFinite(depthM) || depthM <= 0) return null;
  const waste = isFinite(wastagePct) && wastagePct >= 0 ? wastagePct : 0;
  const netVolumeM3   = areaM2 * depthM;
  const totalVolumeM3 = netVolumeM3 * (1 + waste / 100);
  const weightKg = isFinite(densityKgM3) && densityKgM3 > 0
    ? totalVolumeM3 * densityKgM3
    : null;
  return { netVolumeM3, totalVolumeM3, weightKg };
}

// ── Formatting ─────────────────────────────────────────────────────

export function fmtRR(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toString();
}

// ── Validation ─────────────────────────────────────────────────────

export function validatePositive(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be greater than zero";
  return null;
}

export function validateNonNegative(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n < 0) return "Cannot be negative";
  return null;
}

export function validateRange(value, min, max) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n < min || n > max) return `Must be between ${min} and ${max}`;
  return null;
}
