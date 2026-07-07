// French Drain Calculator — pure calculation utilities
// Matches the reference formulas at omnicalculator.com/construction/french-drain
//
// Trench volume         = Width × Depth × Trench length
// Minimum pipe slope(s) = per pipe-size table (in/ft)
// Pipe drop             = Trench length × s ÷ 12
// Pipe length (Lp)      = √(Trench length² + Pipe drop²)
// Gravel volume         = (Width × Depth × Trench length) − (π × (OD ÷ 2)² × Lp)
// Total gravel volume   = Gravel volume × (1 + Wastage ÷ 100)
// Quantity of pipes needed = ⌈Lp ÷ Standard pipe length⌉
// Fabric width/area (if used):
//   entire trench = (2 × (Width + Depth) + o) × Trench length — o = seam overlap
//   around pipe   = (π × OD + o) × Lp — o = seam overlap
//   top of gravel = Width × Trench length — no seam, no overlap needed
// Gravel weight = Total gravel volume × Gravel density (optional display)

// ── Length units (trench width / depth) ────────────────────────────
export const LENGTH_UNITS = [
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── Length units (trench / pipe length) ─────────────────────────────
export const LONG_LENGTH_UNITS = [
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

// ── Volume output units ───────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "cm3", label: "cubic centimeters (cm³)", fromM3: 1e6        },
  { id: "m3",  label: "cubic meters (m³)",       fromM3: 1          },
  { id: "in3", label: "cubic inches (cu in)",    fromM3: 61023.7    },
  { id: "ft3", label: "cubic feet (cu ft)",      fromM3: 35.3147    },
  { id: "yd3", label: "cubic yards (cu yd)",     fromM3: 1.30795    },
];

// ── Area output units (fabric) ─────────────────────────────────────
export const AREA_OUT_UNITS = [
  { id: "m2",  label: "m²",  fromM2: 1        },
  { id: "cm2", label: "cm²", fromM2: 10000    },
  { id: "ft2", label: "ft²", fromM2: 10.7639  },
  { id: "yd2", label: "yd²", fromM2: 1.19599  },
];

// ── Weight output units ───────────────────────────────────────────
export const WEIGHT_OUT_UNITS = [
  { id: "g",     label: "grams (g)",                fromKg: 1000       },
  { id: "kg",    label: "kilograms (kg)",            fromKg: 1          },
  { id: "t",     label: "metric tons (t)",           fromKg: 0.001      },
  { id: "lb",    label: "pounds (lb)",               fromKg: 2.2046226  },
  { id: "ustn",  label: "US short tons (US ton)",    fromKg: 0.0011023  },
  { id: "lt",    label: "imperial tons (long ton)",  fromKg: 0.0009842  },
];

// ── Density input units ───────────────────────────────────────────
export const DENSITY_UNITS = [
  { id: "kg/m3",  label: "kilograms per cubic meter (kg/m³)",  toKgM3: 1         },
  { id: "g/cm3",  label: "grams per cubic centimeter (g/cm³)", toKgM3: 1000      },
  { id: "lb/in3", label: "pounds per cubic inch (lb/cu in)",   toKgM3: 27679.905 },
  { id: "lb/ft3", label: "pounds per cubic feet (lb/cu ft)",   toKgM3: 16.018463 },
  { id: "lb/yd3", label: "pounds per cubic yard (lb/cu yd)",   toKgM3: 0.5932764 },
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

// ── Fabric filter placement options ────────────────────────────────
export const FABRIC_MODES = [
  { id: "no",     label: "No" },
  { id: "entire", label: "Yes, for the entire trench" },
  { id: "pipe",   label: "Yes, around the pipe" },
  { id: "top",    label: "Yes, but only on top of the gravel" },
];

// ── Pipe schedule options ──────────────────────────────────────────
export const PIPE_TYPES = [
  { id: "sch40", label: "Schedule 40 perforated PVC" },
  { id: "sdr35", label: "SDR35 PVC sewer drain" },
];

// ── Pipe sizes — Schedule 40 uses IPS outside diameters; SDR35 sewer
// pipe (ASTM D3034 / F679) is sized on a different standard, so the
// same nominal label maps to a different actual outside diameter.
export const PIPE_SIZES_SCH40 = [
  { id: "2",   label: "2″",   odMm: 60.33   },
  { id: "2.5", label: "2½″",  odMm: 73.03   },
  { id: "3",   label: "3″",   odMm: 88.90   },
  { id: "3.5", label: "3½″",  odMm: 101.60  },
  { id: "4",   label: "4″",   odMm: 114.30  },
  { id: "5",   label: "5″",   odMm: 141.30  },
  { id: "6",   label: "6″",   odMm: 168.28  },
  { id: "8",   label: "8″",   odMm: 219.08  },
  { id: "10",  label: "10″",  odMm: 273.05  },
  { id: "12",  label: "12″",  odMm: 323.85  },
  { id: "14",  label: "14″",  odMm: 355.60  },
  { id: "16",  label: "16″",  odMm: 406.40  },
  { id: "18",  label: "18″",  odMm: 457.20  },
  { id: "20",  label: "20″",  odMm: 508.00  },
  { id: "24",  label: "24″",  odMm: 609.60  },
  { id: "30",  label: "30″",  odMm: 762.00  },
  { id: "36",  label: "36″",  odMm: 914.40  },
  { id: "42",  label: "42″",  odMm: 1066.80 },
  { id: "48",  label: "48″",  odMm: 1219.20 },
  { id: "custom", label: "Custom", odMm: null },
];

export const PIPE_SIZES_SDR35 = [
  { id: "4",   label: "4″",   odMm: 107.06  },
  { id: "6",   label: "6″",   odMm: 159.39  },
  { id: "8",   label: "8″",   odMm: 213.36  },
  { id: "10",  label: "10″",  odMm: 266.70  },
  { id: "12",  label: "12″",  odMm: 317.50  },
  { id: "15",  label: "15″",  odMm: 388.60  },
  { id: "18",  label: "18″",  odMm: 475.00  },
  { id: "21",  label: "21″",  odMm: 560.00  },
  { id: "24",  label: "24″",  odMm: 630.00  },
  { id: "27",  label: "27″",  odMm: 710.00  },
  { id: "30",  label: "30″",  odMm: 812.80  },
  { id: "36",  label: "36″",  odMm: 972.80  },
  { id: "42",  label: "42″",  odMm: 1130.30 },
  { id: "48",  label: "48″",  odMm: 1290.30 },
  { id: "custom", label: "Custom", odMm: null },
];

// Standard Schedule 40 PVC wall thickness (mm) — used only for the
// optional "Display more pipe details" inside-diameter breakdown.
const SCH40_WALL_MM = {
  "2": 3.91, "2.5": 5.16, "3": 5.49, "3.5": 5.74, "4": 6.02,
  "5": 6.55, "6": 7.11, "8": 8.18, "10": 9.27, "12": 10.31,
};

// ── Standard pipe lengths ───────────────────────────────────────────
export const STANDARD_PIPE_LENGTHS = [
  { id: "10ft", label: "10 ft (3 m)",  lengthM: 3.048  },
  { id: "20ft", label: "20 ft (6 m)",  lengthM: 6.096  },
  { id: "30ft", label: "30 ft (9 m)",  lengthM: 9.144  },
  { id: "40ft", label: "40 ft (12 m)", lengthM: 12.192 },
  { id: "custom", label: "Custom", lengthM: null },
];

export const DEFAULT_WASTE_PCT = 10;
export const DEFAULT_GRAVEL_DENSITY_KGM3 = 1680;

// Minimum filter fabric seam overlap: 1 inch.
export const MIN_FABRIC_OVERLAP_M = 0.0254;

// Minimum recommended pipe slope, by outside diameter — matches the
// standard reference table: 1/8″–2½″ pipes need 1/4 in/ft, 3″–6″ need
// 1/8 in/ft, and 8″ or larger need 1/16 in/ft.
const MIN_SLOPE_TABLE = [
  { maxOdMm: 73.03,  slopeInPerFt: 0.25   }, // up to 2½″
  { maxOdMm: 168.28, slopeInPerFt: 0.125  }, // 3″ – 6″
  { maxOdMm: Infinity, slopeInPerFt: 0.0625 }, // 8″ and larger
];

export function minPipeSlopeInPerFt(odMm) {
  if (!isFinite(odMm) || odMm <= 0) return null;
  const row = MIN_SLOPE_TABLE.find((r) => odMm <= r.maxOdMm);
  return row ? row.slopeInPerFt : null;
}

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId, units = LENGTH_UNITS) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = units.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function fromLengthM(valM, unitId, units = LENGTH_UNITS) {
  if (valM === null || !isFinite(valM)) return null;
  const u = units.find((u) => u.id === unitId);
  return u ? valM / u.toM : valM;
}

export function toDensityKgM3(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = DENSITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toKgM3 : null;
}

export function fromM3(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM3 : val;
}

export function fromM2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM2 : val;
}

export function fromKgDrain(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = WEIGHT_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromKg : val;
}

// Inside diameter from outside diameter, for the optional pipe-detail
// breakdown. SDR35 wall thickness is exact by definition (OD ÷ SDR);
// Schedule 40 uses a standard reference wall-thickness table.
export function insideDiameterMm(odMm, pipeTypeId, sizeId) {
  if (!isFinite(odMm) || odMm <= 0) return null;
  if (pipeTypeId === "sdr35") return odMm - 2 * (odMm / 35);
  const wall = SCH40_WALL_MM[sizeId];
  return wall != null ? odMm - 2 * wall : null;
}

// Pipe drop = the vertical drop across the trench needed to maintain
// the minimum pipe slope: (slope in inches per foot ÷ 12) × trench length.
export function calcPipeDropM(trenchLengthM, slopeInPerFt) {
  if (!isFinite(trenchLengthM) || trenchLengthM <= 0) return null;
  if (!isFinite(slopeInPerFt) || slopeInPerFt <= 0) return null;
  return (slopeInPerFt / 12) * trenchLengthM;
}

// Pipe length (Lp) — the trench length plus the extra run needed to
// carry the slope-induced drop: Lp = √(Trench length² + Pipe drop²).
export function calcPipeLengthM(trenchLengthM, dropM) {
  if (!isFinite(trenchLengthM) || trenchLengthM <= 0) return null;
  if (!isFinite(dropM) || dropM < 0) return null;
  return Math.sqrt(trenchLengthM ** 2 + dropM ** 2);
}

// ── Core calculation ──────────────────────────────────────────────
// Returns null until width, depth, and trench length are all set.
export function calcFrenchDrain({
  widthM, depthM, trenchLengthM,
  usePipe, odM, slopeInPerFt, standardPipeLengthM,
  fabricMode, overlapM,
  wastePct, gravelDensityKgM3,
}) {
  if (!isFinite(widthM) || widthM <= 0) return null;
  if (!isFinite(depthM) || depthM <= 0) return null;
  if (!isFinite(trenchLengthM) || trenchLengthM <= 0) return null;

  const trenchVolumeM3 = widthM * depthM * trenchLengthM;

  let pipeDropM = null;
  let pipeLengthM = null;
  let pipeVolumeM3 = 0;
  if (usePipe && isFinite(odM) && odM > 0) {
    pipeDropM = calcPipeDropM(trenchLengthM, slopeInPerFt);
    pipeLengthM = calcPipeLengthM(trenchLengthM, pipeDropM ?? 0);
    if (pipeLengthM != null) {
      pipeVolumeM3 = Math.PI * (odM / 2) ** 2 * pipeLengthM;
    }
  }

  const gravelVolumeM3 = trenchVolumeM3 - pipeVolumeM3;

  const waste = isFinite(wastePct) && wastePct >= 0 ? wastePct : 0;
  const totalGravelVolumeM3 = gravelVolumeM3 * (1 + waste / 100);

  let pipeCount = null;
  if (usePipe && pipeLengthM != null
    && isFinite(standardPipeLengthM) && standardPipeLengthM > 0) {
    pipeCount = Math.ceil(pipeLengthM / standardPipeLengthM);
  }

  let fabricWidthM = null;
  let fabricAreaM2 = null;
  if (fabricMode === "top") {
    fabricWidthM = widthM;
    fabricAreaM2 = fabricWidthM * trenchLengthM;
  } else if (isFinite(overlapM) && overlapM > 0) {
    if (fabricMode === "entire") {
      fabricWidthM = 2 * (widthM + depthM) + overlapM;
      fabricAreaM2 = fabricWidthM * trenchLengthM;
    } else if (fabricMode === "pipe" && usePipe && isFinite(odM) && odM > 0 && pipeLengthM != null) {
      fabricWidthM = Math.PI * odM + overlapM;
      fabricAreaM2 = fabricWidthM * pipeLengthM;
    }
  }

  const gravelWeightKg = isFinite(gravelDensityKgM3) && gravelDensityKgM3 > 0
    ? totalGravelVolumeM3 * gravelDensityKgM3
    : null;

  return {
    trenchVolumeM3, pipeDropM, pipeLengthM, pipeVolumeM3, gravelVolumeM3, totalGravelVolumeM3,
    pipeCount, fabricWidthM, fabricAreaM2, gravelWeightKg,
  };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtDrain(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
