// Sonotube Calculator — pure calculation utilities
//
// Volume  = π × (diameter / 2)² × height × quantity
// Weight  = Volume × Concrete density
// Bags needed = ceil(Weight ÷ Bag size)   [waste is not applied here]
//
// "Mix my own concrete" path (cement : sand : gravel by volume):
// Total volume = Volume × (1 + Waste / 100)
// Cement/Sand/Gravel volume = Total volume × (their ratio part ÷ total parts)
// Each material's volume is kept in m³ internally; the "needed" fields can
// be displayed as either a volume or a weight (volume × bulk density),
// converted only at display time via fromM3ToMaterialUnit(). Bulk densities:
// cement 1440 kg/m³, sand 1600 kg/m³, gravel 1600 kg/m³.

// ── Length units (height) ──────────────────────────────────────────
// "ft_in" and "m_cm" are compound units — entered as two sub-values
// (e.g. 5 ft + 6 in) rather than a single number, so they carry no
// single `toM` factor; toLengthM() handles them via compA/compB.
export const LENGTH_UNITS = [
  { id: "cm",    label: "centimeters (cm)",              toM: 0.01    },
  { id: "m",     label: "meters (m)",                    toM: 1       },
  { id: "in",    label: "inches (in)",                   toM: 0.0254  },
  { id: "ft",    label: "feet (ft)",                     toM: 0.3048  },
  { id: "yd",    label: "yards (yd)",                    toM: 0.9144  },
  { id: "ft_in", label: "feet / inches (ft / in)",       toM: null    },
  { id: "m_cm",  label: "meters / centimeters (m / cm)", toM: null    },
];

// ── Volume output units ───────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "cm3", label: "cubic centimeters (cm³)", fromM3: 1e6        },
  { id: "m3",  label: "cubic meters (m³)",       fromM3: 1          },
  { id: "in3", label: "cubic inches (cu in)",    fromM3: 61023.7    },
  { id: "ft3", label: "cubic feet (cu ft)",      fromM3: 35.3147    },
  { id: "yd3", label: "cubic yards (cu yd)",     fromM3: 1.30795    },
];

// ── Weight output units ───────────────────────────────────────────
export const WEIGHT_OUT_UNITS = [
  { id: "kg", label: "kg", fromKg: 1       },
  { id: "lb", label: "lb", fromKg: 2.20462 },
  { id: "t",  label: "t",  fromKg: 0.001   },
];

// ── Combined volume + weight units (cement / sand / gravel) ───────
// Lets each material's "needed" field be viewed as either a volume or a
// weight — conversion between the two uses that material's bulk density.
export const MATERIAL_UNITS = [
  ...VOLUME_OUT_UNITS.map((u) => ({ id: u.id, label: u.label, type: "volume", fromM3: u.fromM3 })),
  ...WEIGHT_OUT_UNITS.map((u) => ({ id: u.id, label: u.label, type: "weight", fromKg: u.fromKg })),
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

// ── Sonotube (concrete form tube) diameter presets ─────────────────
const IN_TO_CM = 2.54;
const inches = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 42, 48, 54, 60];
export const SONOTUBE_SIZES = inches.map((inVal) => {
  const cm = inVal * IN_TO_CM;
  return { id: `${inVal}in`, label: `${inVal}″ (${cm.toFixed(2)} cm)`, diameterM: cm / 100 };
});

// ── Standard pre-mixed bag sizes ────────────────────────────────────
export const BAG_SIZES = [
  { id: "25kg", label: "25 kg", kg: 25            },
  { id: "30kg", label: "30 kg", kg: 30            },
  { id: "40kg", label: "40 kg", kg: 40            },
  { id: "50kg", label: "50 kg", kg: 50            },
  { id: "40lb", label: "40 lb", kg: 40 / 2.20462  },
  { id: "50lb", label: "50 lb", kg: 50 / 2.20462  },
  { id: "60lb", label: "60 lb", kg: 60 / 2.20462  },
  { id: "80lb", label: "80 lb", kg: 80 / 2.20462  },
  { id: "custom", label: "Custom", kg: null },
];

// ── Concrete mix ratios (cement : sand : gravel, by volume) ────────
export const MIX_RATIOS = [
  { id: "1:5:10",  label: "1:5:10 (5.0 MPa or 725 psi)",   cement: 1, sand: 5,   gravel: 10 },
  { id: "1:4:8",   label: "1:4:8 (7.5 MPa or 1085 psi)",   cement: 1, sand: 4,   gravel: 8  },
  { id: "1:3:6",   label: "1:3:6 (10.0 MPa or 1450 psi)",  cement: 1, sand: 3,   gravel: 6  },
  { id: "1:2:4",   label: "1:2:4 (15.0 MPa or 2175 psi)",  cement: 1, sand: 2,   gravel: 4  },
  { id: "1:1.5:3", label: "1:1.5:3 (20.0 MPa or 2900 psi)",cement: 1, sand: 1.5, gravel: 3  },
];

export const DEFAULT_DENSITY_KGM3 = 2400;
export const DEFAULT_WASTE_PCT = 5;

// Bulk densities used to convert each mix-your-own material between
// volume and weight (cement/sand/gravel needed can be viewed as either).
export const CEMENT_DENSITY_KGM3 = 1440;
export const SAND_DENSITY_KGM3   = 1600;
export const GRAVEL_DENSITY_KGM3 = 1600;

// ── Unit converters ───────────────────────────────────────────────

// Compound units (ft_in, m_cm) are entered as two sub-values (compA/compB)
// instead of a single `val` — e.g. 5 ft 6 in, or 1 m 50 cm.
export function toLengthM(val, unitId, compA, compB) {
  if (unitId === "ft_in") {
    const ft = parseFloat(compA) || 0;
    const inch = parseFloat(compB) || 0;
    const total = ft + inch / 12;
    return total > 0 ? total * 0.3048 : null;
  }
  if (unitId === "m_cm") {
    const m = parseFloat(compA) || 0;
    const cm = parseFloat(compB) || 0;
    const total = m + cm / 100;
    return total > 0 ? total : null;
  }
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
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

export function fromKgSonotube(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = WEIGHT_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromKg : val;
}

// Converts a material's volume (m³) to whichever unit is selected for
// display — a plain volume unit, or a weight unit (via its bulk density).
// Internal calculations always stay in m³; this is a display-only step.
export function fromM3ToMaterialUnit(volumeM3, unitId, densityKgM3) {
  if (volumeM3 === null || !isFinite(volumeM3)) return null;
  const u = MATERIAL_UNITS.find((u) => u.id === unitId);
  if (!u) return null;
  if (u.type === "volume") return volumeM3 * u.fromM3;
  if (!isFinite(densityKgM3) || densityKgM3 <= 0) return null;
  return volumeM3 * densityKgM3 * u.fromKg;
}

// ── Core calculation ──────────────────────────────────────────────
// Returns null until diameter, height, and quantity are all set.
export function calcSonotube({ diameterM, heightM, quantity, densityKgM3, bagSizeKg, wastePct, mixRatio }) {
  if (!isFinite(diameterM) || diameterM <= 0) return null;
  if (!isFinite(heightM)   || heightM   <= 0) return null;
  if (!isFinite(quantity)  || quantity  <= 0) return null;

  const radiusM = diameterM / 2;
  const volumeM3 = Math.PI * radiusM * radiusM * heightM * quantity;

  const waste = isFinite(wastePct) && wastePct >= 0 ? wastePct : 0;

  const weightKg = isFinite(densityKgM3) && densityKgM3 > 0 ? volumeM3 * densityKgM3 : null;

  let bagsNeeded = null;
  if (weightKg !== null && isFinite(bagSizeKg) && bagSizeKg > 0) {
    bagsNeeded = Math.ceil(weightKg / bagSizeKg);
  }

  // "Mix my own concrete" — cement/sand/gravel volumes from a ratio.
  // Kept purely in m³ here; conversion to weight (or another volume unit)
  // happens only at display time, via fromM3ToMaterialUnit().
  let totalVolumeM3 = null, cementVolumeM3 = null, sandVolumeM3 = null, gravelVolumeM3 = null;
  if (mixRatio && isFinite(mixRatio.cement) && isFinite(mixRatio.sand) && isFinite(mixRatio.gravel)) {
    const totalParts = mixRatio.cement + mixRatio.sand + mixRatio.gravel;
    if (totalParts > 0) {
      totalVolumeM3  = volumeM3 * (1 + waste / 100);
      cementVolumeM3 = totalVolumeM3 * (mixRatio.cement / totalParts);
      sandVolumeM3   = totalVolumeM3 * (mixRatio.sand   / totalParts);
      gravelVolumeM3 = totalVolumeM3 * (mixRatio.gravel / totalParts);
    }
  }

  return {
    volumeM3, weightKg, bagsNeeded,
    totalVolumeM3, cementVolumeM3, sandVolumeM3, gravelVolumeM3,
  };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtSonotube(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
