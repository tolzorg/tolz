// Brick Calculator — pure calculation utilities

// ── Wall types ────────────────────────────────────────────────────
export const WALL_TYPES = [
  { id: "single", label: "Single" },
  { id: "double", label: "Double" },
];

// ── Length input units (stored as mm internally) ──────────────────
export const LENGTH_UNITS = [
  { id: "mm", label: "mm", toMm: 1       },
  { id: "cm", label: "cm", toMm: 10      },
  { id: "m",  label: "m",  toMm: 1000    },
  { id: "in", label: "in", toMm: 25.4    },
  { id: "ft", label: "ft", toMm: 304.8   },
  { id: "yd", label: "yd", toMm: 914.4   },
];

// ── Area output units ─────────────────────────────────────────────
export const AREA_OUT_UNITS = [
  { id: "mm2", label: "mm²", fromMm2: 1           },
  { id: "cm2", label: "cm²", fromMm2: 0.01        },
  { id: "m2",  label: "m²",  fromMm2: 1e-6        },
  { id: "in2", label: "in²", fromMm2: 1/645.16    },
  { id: "ft2", label: "ft²", fromMm2: 1/92903.04  },
  { id: "yd2", label: "yd²", fromMm2: 1/836127.36 },
];

// ── Volume output units ───────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "mm3", label: "mm³", fromMm3: 1          },
  { id: "cm3", label: "cm³", fromMm3: 0.001      },
  { id: "l",   label: "L",   fromMm3: 1e-6       },
  { id: "m3",  label: "m³",  fromMm3: 1e-9       },
  { id: "ft3", label: "ft³", fromMm3: 3.5315e-8  },
  { id: "yd3", label: "yd³", fromMm3: 1.308e-9   },
];

// ── Weight output units ───────────────────────────────────────────
export const WEIGHT_OUT_UNITS = [
  { id: "kg", label: "kg", fromKg: 1       },
  { id: "lb", label: "lb", fromKg: 2.20462 },
  { id: "t",  label: "t",  fromKg: 0.001   },
];

// ── Currencies ────────────────────────────────────────────────────
export const CURRENCIES = [
  { id: "USD", label: "USD", symbol: "$"    },
  { id: "EUR", label: "EUR", symbol: "€"    },
  { id: "GBP", label: "GBP", symbol: "£"    },
  { id: "INR", label: "INR", symbol: "₹"    },
  { id: "CAD", label: "CAD", symbol: "CA$"  },
  { id: "AUD", label: "AUD", symbol: "AU$"  },
];

// ── Unit converters ───────────────────────────────────────────────

export function toMm(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toMm : null;
}

export function fromMm2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromMm2 : val;
}

export function fromMm3(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromMm3 : val;
}

export function fromKgBrick(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = WEIGHT_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromKg : val;
}

// ── Core calculation ──────────────────────────────────────────────
// All lengths in mm. Returns result object or null if inputs invalid.

export function calcBricks({
  wallLengthMm, wallHeightMm,
  brickLengthMm, brickHeightMm, brickWidthMm,
  mortarMm, wallType, wastagePct,
}) {
  if (!isFinite(wallLengthMm)  || wallLengthMm  <= 0) return null;
  if (!isFinite(wallHeightMm)  || wallHeightMm  <= 0) return null;
  if (!isFinite(brickLengthMm) || brickLengthMm <= 0) return null;
  if (!isFinite(brickHeightMm) || brickHeightMm <= 0) return null;
  if (!isFinite(brickWidthMm)  || brickWidthMm  <= 0) return null;
  if (!isFinite(mortarMm)      || mortarMm < 0)       return null;

  const wallAreaMm2 = wallLengthMm * wallHeightMm;

  // Isbash-style: area / (brick face with mortar)
  const bricksPerLayer = wallAreaMm2 / ((brickLengthMm + mortarMm) * (brickHeightMm + mortarMm));
  const multiplier     = wallType === "double" ? 2 : 1;
  const bricksNeeded   = bricksPerLayer * multiplier;

  const waste        = isFinite(wastagePct) && wastagePct >= 0 ? wastagePct : 0;
  const totalBricks  = Math.ceil(bricksNeeded * (1 + waste / 100));

  // Mortar volume (mm³)
  // Wall depth = brick width(s) + mortar between them for double wall
  const wallDepthMm = wallType === "double"
    ? 2 * brickWidthMm + mortarMm
    : brickWidthMm;
  const wallVolMm3      = wallLengthMm * wallHeightMm * wallDepthMm;
  const brickVolMm3     = bricksNeeded * brickLengthMm * brickHeightMm * brickWidthMm;
  const mortarVolMm3    = Math.max(0, wallVolMm3 - brickVolMm3);

  // Mortar ingredients: standard 1:3 cement:sand by volume
  const mortarVolM3    = mortarVolMm3 * 1e-9;
  const dryVolM3       = mortarVolM3 * 1.3;    // dry volume is ~30% more than wet
  const cementVolM3    = dryVolM3 / 4;          // 1 part cement out of 4 total parts
  const sandVolM3      = (3 * dryVolM3) / 4;    // 3 parts sand
  const cementKg       = cementVolM3 * 1440;    // cement bulk density ~1440 kg/m³
  const sandKg         = sandVolM3 * 1600;      // sand bulk density ~1600 kg/m³
  const waterLiters    = cementKg * 0.5;        // water-cement ratio 0.5
  const cementBags50   = Math.ceil(cementKg / 50);
  const cementBags25   = Math.ceil(cementKg / 25);

  return {
    wallAreaMm2,
    bricksNeeded,
    totalBricks,
    mortarVolMm3,
    mortarVolM3,
    cementVolM3,
    sandVolM3,
    cementKg,
    sandKg,
    waterLiters,
    cementBags50,
    cementBags25,
    wallDepthMm,
  };
}

// ── Number formatter ──────────────────────────────────────────────
export function fmtBrick(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: dp,
    minimumFractionDigits: 0,
  });
}
