// Framing (Stud) Calculator — pure calculation utilities
//
// Studs needed = ceil(Wall length ÷ OC spacing) + 1
// Total cost   = ceil(Studs needed × (1 + Waste / 100)) × Price per stud

// ── Length units (wall length) ─────────────────────────────────────
export const LENGTH_UNITS = [
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

// ── OC spacing units ────────────────────────────────────────────────
export const SPACING_UNITS = [
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
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

// Common on-center stud spacings, for reference (16 in ≈ 40 cm, 24 in ≈ 60 cm).
export const DEFAULT_OC_SPACING_CM = 40;
export const DEFAULT_WASTE_PCT = 15;

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toSpacingM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = SPACING_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

// ── Core calculation ──────────────────────────────────────────────
// Returns result object, or null until wall length and OC spacing are set.
export function calcFraming({ wallLengthM, ocSpacingM, wastePct, pricePerStud }) {
  if (!isFinite(wallLengthM) || wallLengthM <= 0) return null;
  if (!isFinite(ocSpacingM)  || ocSpacingM  <= 0) return null;

  const studsNeeded = Math.ceil(wallLengthM / ocSpacingM) + 1;

  const waste = isFinite(wastePct) && wastePct >= 0 ? wastePct : 0;
  const studsWithWaste = Math.ceil(studsNeeded * (1 + waste / 100));

  const totalCost = isFinite(pricePerStud) && pricePerStud > 0
    ? studsWithWaste * pricePerStud
    : null;

  return { studsNeeded, studsWithWaste, totalCost };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtFraming(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
