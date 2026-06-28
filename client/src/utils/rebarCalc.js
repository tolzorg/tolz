// Rebar Calculator — pure calculation utilities

// ── Length input units ─────────────────────────────────────────
export const REBAR_LENGTH_UNITS = [
  { id: "mm", label: "mm", toM: 1e-3    },
  { id: "cm", label: "cm", toM: 1e-2    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

// ── Length output units ─────────────────────────────────────────
export const REBAR_LENGTH_OUT_UNITS = [
  { id: "mm", label: "mm", fromM: 1000      },
  { id: "cm", label: "cm", fromM: 100       },
  { id: "m",  label: "m",  fromM: 1         },
  { id: "ft", label: "ft", fromM: 3.28084   },
  { id: "yd", label: "yd", fromM: 1.09361   },
];

// ── Weight output units ─────────────────────────────────────────
export const REBAR_WEIGHT_UNITS = [
  { id: "g",      label: "g",      fromKg: 1000    },
  { id: "kg",     label: "kg",     fromKg: 1       },
  { id: "tonnes", label: "tonnes", fromKg: 0.001   },
  { id: "oz",     label: "oz",     fromKg: 35.274  },
  { id: "lb",     label: "lb",     fromKg: 2.20462 },
];

// ── Rebar size database ─────────────────────────────────────────
// Metric weights: standard engineering table values (kg/m), formula w ≈ D²/162 (D in mm)
// US bar weights: ASTM A615 certified nominal values

export const REBAR_SIZES = [
  // Metric sizes
  { id: "m6",   label: "6 mm",  group: "Metric",   diameterMm: 6.000,  weightPerM: 0.222  },
  { id: "m8",   label: "8 mm",  group: "Metric",   diameterMm: 8.000,  weightPerM: 0.395  },
  { id: "m10",  label: "10 mm", group: "Metric",   diameterMm: 10.000, weightPerM: 0.617  },
  { id: "m12",  label: "12 mm", group: "Metric",   diameterMm: 12.000, weightPerM: 0.888  },
  { id: "m16",  label: "16 mm", group: "Metric",   diameterMm: 16.000, weightPerM: 1.578  },
  { id: "m20",  label: "20 mm", group: "Metric",   diameterMm: 20.000, weightPerM: 2.466  },
  { id: "m25",  label: "25 mm", group: "Metric",   diameterMm: 25.000, weightPerM: 3.854  },
  { id: "m32",  label: "32 mm", group: "Metric",   diameterMm: 32.000, weightPerM: 6.313  },
  { id: "m40",  label: "40 mm", group: "Metric",   diameterMm: 40.000, weightPerM: 9.864  },
  // US bars — ASTM A615 nominal values
  { id: "us2",  label: "#2",  group: "US Bars",  diameterMm: 6.350,  weightPerM: 0.248  },
  { id: "us3",  label: "#3",  group: "US Bars",  diameterMm: 9.525,  weightPerM: 0.560  },
  { id: "us4",  label: "#4",  group: "US Bars",  diameterMm: 12.700, weightPerM: 0.994  },
  { id: "us5",  label: "#5",  group: "US Bars",  diameterMm: 15.875, weightPerM: 1.552  },
  { id: "us6",  label: "#6",  group: "US Bars",  diameterMm: 19.050, weightPerM: 2.235  },
  { id: "us7",  label: "#7",  group: "US Bars",  diameterMm: 22.225, weightPerM: 3.042  },
  { id: "us8",  label: "#8",  group: "US Bars",  diameterMm: 25.400, weightPerM: 3.973  },
  { id: "us9",  label: "#9",  group: "US Bars",  diameterMm: 28.650, weightPerM: 5.060  },
  { id: "us10", label: "#10", group: "US Bars",  diameterMm: 32.260, weightPerM: 6.404  },
  { id: "us11", label: "#11", group: "US Bars",  diameterMm: 35.810, weightPerM: 7.907  },
  { id: "us14", label: "#14", group: "US Bars",  diameterMm: 43.000, weightPerM: 11.384 },
  { id: "us18", label: "#18", group: "US Bars",  diameterMm: 57.330, weightPerM: 20.238 },
  // Custom
  { id: "custom", label: "Custom Diameter", group: "Custom", diameterMm: null, weightPerM: null },
];

export const CALC_MODES = [
  {
    id:   "weight",
    label: "Total Rebar Weight",
    desc:  "Quantity × Length per bar × Weight per unit length",
  },
  {
    id:   "length",
    label: "Total Rebar Length",
    desc:  "Quantity × Length per bar (no size needed)",
  },
  {
    id:   "weight-custom",
    label: "Weight from Total Length",
    desc:  "Total length × Weight per unit length",
  },
];

// ── Unit conversions ────────────────────────────────────────────

export function toMeters(value, unitId) {
  const v = parseFloat(value);
  if (!isFinite(v) || v <= 0) return null;
  const u = REBAR_LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function convertLength(meters, unitId) {
  if (meters === null || !isFinite(meters)) return null;
  const u = REBAR_LENGTH_OUT_UNITS.find((u) => u.id === unitId);
  return u ? meters * u.fromM : meters;
}

export function convertWeight(kg, unitId) {
  if (kg === null || !isFinite(kg)) return null;
  const u = REBAR_WEIGHT_UNITS.find((u) => u.id === unitId);
  return u ? kg * u.fromKg : kg;
}

// Standard steel engineering shortcut: w (kg/m) = D² / 162, D in mm
// Derivation: w = ρ × π × (D/2000)² × 1 = 7850 × π × D² / 4_000_000 ≈ D² / 162.2
export function customWeightPerM(diamMm) {
  const d = parseFloat(diamMm);
  if (!isFinite(d) || d <= 0) return null;
  return (d * d) / 162;
}

// ── Core calculation ────────────────────────────────────────────
// Returns { totalLengthM, weightPerBarKg, totalWeightKg } or null if inputs invalid.

export function calcRebar({ mode, qty, barLengthM, totalLengthM, weightPerM }) {
  if (mode === "length") {
    const q = Math.round(parseFloat(qty));
    if (!(q > 0) || !(barLengthM > 0)) return null;
    return { totalLengthM: q * barLengthM, weightPerBarKg: null, totalWeightKg: null };
  }

  if (mode === "weight-custom") {
    if (!(totalLengthM > 0) || !(weightPerM > 0)) return null;
    return { totalLengthM, weightPerBarKg: null, totalWeightKg: totalLengthM * weightPerM };
  }

  // mode === "weight"
  const q = Math.round(parseFloat(qty));
  if (!(q > 0) || !(barLengthM > 0) || !(weightPerM > 0)) return null;
  const tl = q * barLengthM;
  return {
    totalLengthM:   tl,
    weightPerBarKg: barLengthM * weightPerM,
    totalWeightKg:  tl * weightPerM,
  };
}

// ── Formatting ──────────────────────────────────────────────────

export function fmtRebar(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toString();
}

// ── Validation ──────────────────────────────────────────────────

export function validateQty(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be greater than zero";
  if (!Number.isInteger(n)) return "Whole numbers only";
  return null;
}

export function validatePositive(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be greater than zero";
  return null;
}
