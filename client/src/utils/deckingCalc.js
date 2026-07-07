// Decking Calculator — pure calculation utilities

// ── Length units (deck length/width, board length, custom board width) ──
export const LENGTH_UNITS = [
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "yd", label: "yd", toM: 0.9144  },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "mm", label: "mm", toM: 0.001   },
];

// ── Area output units ─────────────────────────────────────────────
export const AREA_OUT_UNITS = [
  { id: "ft2", label: "ft²", fromM2: 10.7639  },
  { id: "m2",  label: "m²",  fromM2: 1        },
  { id: "cm2", label: "cm²", fromM2: 10000    },
  { id: "yd2", label: "yd²", fromM2: 1.19599  },
  { id: "in2", label: "in²", fromM2: 1550.003 },
];

// ── Board width presets ────────────────────────────────────────────
// Standard rectangular decking board widths (imperial + metric lumber sizes)
export const BOARD_WIDTHS_STANDARD = [
  { id: "3.5in",  label: "3.5″ (89 mm)",   m: 0.0889  },
  { id: "4in",    label: "4″ (102 mm)",    m: 0.1016  },
  { id: "5in",    label: "5″ (127 mm)",    m: 0.127   },
  { id: "5.25in", label: "5.25″ (133 mm)", m: 0.13335 },
  { id: "5.5in",  label: "5.5″ (140 mm)",  m: 0.1397  },
  { id: "6in",    label: "6″ (152 mm)",    m: 0.1524  },
  { id: "7.25in", label: "7.25″ (184 mm)", m: 0.18415 },
  { id: "115mm",  label: "115 mm",         m: 0.115   },
  { id: "120mm",  label: "120 mm",         m: 0.120   },
  { id: "125mm",  label: "125 mm",         m: 0.125   },
  { id: "130mm",  label: "130 mm",         m: 0.130   },
  { id: "135mm",  label: "135 mm",         m: 0.135   },
  { id: "140mm",  label: "140 mm",         m: 0.140   },
  { id: "145mm",  label: "145 mm",         m: 0.145   },
  { id: "150mm",  label: "150 mm",         m: 0.150   },
  { id: "custom", label: "Custom",         m: null    },
];

// Square-profile decking (interlocking deck tiles — length equals width)
export const BOARD_WIDTHS_SQUARE = [
  { id: "12in",   label: "12″ (30 cm)",  m: 0.3048 },
  { id: "24in",   label: "24″ (61 cm)",  m: 0.6096 },
  { id: "30cm",   label: "30 cm",        m: 0.30   },
  { id: "40cm",   label: "40 cm",        m: 0.40   },
  { id: "50cm",   label: "50 cm",        m: 0.50   },
  { id: "custom", label: "Custom",       m: null   },
];

// ── Fastener types ─────────────────────────────────────────────────
export const FASTENER_TYPES = [
  { id: "screws", label: "Screws/nails" },
  { id: "clips",  label: "Hidden clips" },
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

// Screws/nails needed per square foot of decking (industry rule of thumb).
const SCREWS_PER_FT2 = 3.5;
// Hidden clips run about half the count of face screws/nails.
const CLIPS_PER_FT2 = SCREWS_PER_FT2 / 2;
// Waste factor applied to the raw board count (cuts, offcuts, mistakes).
const WASTE_FACTOR = 1.1;

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function fromM2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM2 : val;
}

export function fromLengthM(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? val / u.toM : val;
}

// ── Core calculation ──────────────────────────────────────────────
// Returns result object, or null if the deck's own length/width aren't set.
export function calcDecking({ lengthM, widthM, boardLengthM, boardWidthM, fastenerType }) {
  if (!isFinite(lengthM) || lengthM <= 0) return null;
  if (!isFinite(widthM)  || widthM  <= 0) return null;

  const areaM2  = lengthM * widthM;
  const areaFt2 = areaM2 * 10.7639;

  let boardAreaM2 = null;
  let boardCount  = null;
  if (isFinite(boardLengthM) && boardLengthM > 0 && isFinite(boardWidthM) && boardWidthM > 0) {
    boardAreaM2 = boardLengthM * boardWidthM;
    boardCount  = Math.ceil((areaM2 / boardAreaM2) * WASTE_FACTOR);
  }

  const screwsCount = Math.ceil(areaFt2 * SCREWS_PER_FT2);
  const clipsCount  = Math.ceil(areaFt2 * CLIPS_PER_FT2);
  const fastenerCount = fastenerType === "clips" ? clipsCount : screwsCount;

  return { areaM2, areaFt2, boardAreaM2, boardCount, screwsCount, clipsCount, fastenerCount };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtDeck(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
