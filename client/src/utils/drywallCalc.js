// Drywall Calculator — pure calculation utilities

// ── Length units (room dimensions, sloped-wall triangle, door/window sizes) ──
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

// ── Standard drywall/plasterboard panel sizes (mm) ─────────────────
export const PANEL_SIZES = [
  { id: "600x900",   label: "600 × 900 mm",   m2: 0.6 * 0.9  },
  { id: "600x1200",  label: "600 × 1200 mm",  m2: 0.6 * 1.2  },
  { id: "600x2000",  label: "600 × 2000 mm",  m2: 0.6 * 2.0  },
  { id: "600x2600",  label: "600 × 2600 mm",  m2: 0.6 * 2.6  },
  { id: "900x1800",  label: "900 × 1800 mm",  m2: 0.9 * 1.8  },
  { id: "1200x2000", label: "1200 × 2000 mm", m2: 1.2 * 2.0  },
  { id: "1200x2400", label: "1200 × 2400 mm", m2: 1.2 * 2.4  },
  { id: "1200x2600", label: "1200 × 2600 mm", m2: 1.2 * 2.6  },
  { id: "1200x3000", label: "1200 × 3000 mm", m2: 1.2 * 3.0  },
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
// All length inputs are in metres. Counts (spaces/doors/windows) are plain
// numbers. Returns a result object — sub-totals are computed independently
// so the UI can show partial results as the user fills in each section.
export function calcDrywall({
  roomLengthM, roomWidthM, roomHeightM,
  slopeCount, slopeBaseM, slopeHeightM,
  includeCeiling,
  doorCount, doorHeightM, doorWidthM,
  windowCount, windowHeightM, windowWidthM,
  panelM2, costPerPanel,
}) {
  // Area under sloped walls: one right triangle per sloped space.
  let slopedAreaM2 = null;
  if (isFinite(slopeCount) && slopeCount > 0 && isFinite(slopeBaseM) && slopeBaseM > 0
    && isFinite(slopeHeightM) && slopeHeightM > 0) {
    slopedAreaM2 = slopeCount * (slopeBaseM * slopeHeightM) / 2;
  }

  // Gross room area: perimeter walls + ceiling (optional) + sloped-wall area.
  let grossAreaM2 = null;
  if (isFinite(roomLengthM) && roomLengthM > 0 && isFinite(roomWidthM) && roomWidthM > 0
    && isFinite(roomHeightM) && roomHeightM > 0) {
    const perimeterM = 2 * (roomLengthM + roomWidthM);
    const wallAreaM2 = perimeterM * roomHeightM;
    const ceilingAreaM2 = includeCeiling ? roomLengthM * roomWidthM : 0;
    grossAreaM2 = wallAreaM2 + ceilingAreaM2 + (slopedAreaM2 || 0);
  }

  // Doors / windows: rectangular openings, subtracted from the gross area.
  let doorAreaM2 = null;
  if (isFinite(doorCount) && doorCount > 0 && isFinite(doorHeightM) && doorHeightM > 0
    && isFinite(doorWidthM) && doorWidthM > 0) {
    doorAreaM2 = doorCount * doorHeightM * doorWidthM;
  }

  let windowAreaM2 = null;
  if (isFinite(windowCount) && windowCount > 0 && isFinite(windowHeightM) && windowHeightM > 0
    && isFinite(windowWidthM) && windowWidthM > 0) {
    windowAreaM2 = windowCount * windowHeightM * windowWidthM;
  }

  // Net room area: gross minus door/window openings, never negative.
  let netAreaM2 = null;
  if (grossAreaM2 !== null) {
    netAreaM2 = Math.max(0, grossAreaM2 - (doorAreaM2 || 0) - (windowAreaM2 || 0));
  }

  // Number of panels: net area divided by panel area, rounded up.
  let panelCount = null;
  if (netAreaM2 !== null && netAreaM2 > 0 && isFinite(panelM2) && panelM2 > 0) {
    panelCount = Math.ceil(netAreaM2 / panelM2);
  }

  // Total cost: number of panels × cost per panel.
  let totalCost = null;
  if (panelCount !== null && isFinite(costPerPanel) && costPerPanel > 0) {
    totalCost = panelCount * costPerPanel;
  }

  return {
    slopedAreaM2, grossAreaM2, doorAreaM2, windowAreaM2, netAreaM2,
    panelCount, totalCost,
  };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtDrywall(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
