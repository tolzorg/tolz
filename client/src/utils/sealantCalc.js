// Sealant Calculator — pure calculation utilities
//
// Vn = Length × Width × Depth                         (volume needed)
// Va = Vn / (1 − Wastage / 100)                        (actual volume needed)
// n  = ceil(Va / Package volume)                       (number of packages needed)
// Cost = n × Price per piece

// ── Length units (length / width / depth) ──────────────────────────
export const LENGTH_UNITS = [
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "in", label: "in", toM: 0.0254  },
];

// ── Volume output units ───────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "ml",  label: "mL",   fromM3: 1e6        },
  { id: "l",   label: "L",    fromM3: 1000       },
  { id: "cm3", label: "cm³",  fromM3: 1e6        },
  { id: "m3",  label: "m³",   fromM3: 1          },
  { id: "in3", label: "in³",  fromM3: 61023.7    },
  { id: "floz",label: "fl oz",fromM3: 33814.0227 },
  { id: "gal", label: "gal",  fromM3: 264.172    },
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

// ── Sealant package sizes (volume in mL) ───────────────────────────
export const PACKAGE_SIZES = [
  { id: "310ml-cartridge", label: "310 mL cartridge",     volumeMl: 310     },
  { id: "380ml-cartridge", label: "380 mL cartridge",     volumeMl: 380     },
  { id: "600ml-sausage",   label: "600 mL sausage",       volumeMl: 600     },
  { id: "10.1oz-cartridge",label: "10.1 oz. cartridge",   volumeMl: 298.69  },
  { id: "10.3oz-cartridge",label: "10.3 oz. cartridge",   volumeMl: 304.61  },
  { id: "20oz-sausage",    label: "20 oz. sausage",       volumeMl: 591.47  },
  { id: "1qt-jar",         label: "1 qt. jar",            volumeMl: 946.35  },
  { id: "1.0gal-pail",     label: "1.0 (US) gallon pail", volumeMl: 3785.41 },
  { id: "1.5gal-pail",     label: "1.5 (US) gallon pail", volumeMl: 5678.12 },
  { id: "2.0gal-pail",     label: "2.0 (US) gallon pail", volumeMl: 7570.82 },
  { id: "custom",          label: "Enter custom tube volume", volumeMl: null },
];

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toVolumeM3(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? v / u.fromM3 : null;
}

export function fromM3(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM3 : val;
}

// ── Core calculation ──────────────────────────────────────────────
// Returns result object, or null until length/width/depth are all set.
export function calcSealant({ lengthM, widthM, depthM, wastagePct, packageVolumeM3, pricePerPiece }) {
  if (!isFinite(lengthM) || lengthM <= 0) return null;
  if (!isFinite(widthM)  || widthM  <= 0) return null;
  if (!isFinite(depthM)  || depthM  <= 0) return null;

  const volumeNeededM3 = lengthM * widthM * depthM;

  const waste = isFinite(wastagePct) && wastagePct >= 0 && wastagePct < 100 ? wastagePct : 0;
  const actualVolumeNeededM3 = volumeNeededM3 / (1 - waste / 100);

  let packageCount = null;
  if (isFinite(packageVolumeM3) && packageVolumeM3 > 0) {
    packageCount = Math.ceil(actualVolumeNeededM3 / packageVolumeM3);
  }

  let totalCost = null;
  if (packageCount !== null && isFinite(pricePerPiece) && pricePerPiece > 0) {
    totalCost = packageCount * pricePerPiece;
  }

  return { volumeNeededM3, actualVolumeNeededM3, packageCount, totalCost };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtSealant(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
