// Retaining Wall Calculator — pure calculation utilities

// ── Unit data ──────────────────────────────────────────────────────
export const DIM_UNITS = [
  { id: "mm", label: "mm", toM: 0.001    },
  { id: "cm", label: "cm", toM: 0.01     },
  { id: "m",  label: "m",  toM: 1        },
  { id: "in", label: "in", toM: 0.0254   },
  { id: "ft", label: "ft", toM: 0.3048   },
  { id: "yd", label: "yd", toM: 0.9144   },
];

export const VOL_FROM_M3 = [
  { id: "ft3", label: "ft³", factor: 35.31467 },
  { id: "yd3", label: "yd³", factor: 1.30795  },
  { id: "m3",  label: "m³",  factor: 1        },
];

export const WEIGHT_FROM_KG = [
  { id: "kg",     label: "kg",          factor: 1          },
  { id: "tonnes", label: "tonnes",      factor: 0.001      },
  { id: "lb",     label: "lb",          factor: 2.20462    },
  { id: "tons",   label: "short tons",  factor: 0.00110231 },
];

// ── Wall types ─────────────────────────────────────────────────────
export const WALL_TYPES = [
  { id: "concrete",       label: "Poured Concrete",      icon: "🏗️" },
  { id: "cmu",            label: "Concrete Block (CMU)", icon: "🧱" },
  { id: "segmental",      label: "Segmental (SRW)",       icon: "🪨" },
  { id: "stone-mortared", label: "Mortared Stone",        icon: "🏔️" },
  { id: "stone-dry",      label: "Dry-Stack Stone",       icon: "⛰️" },
];

// ── CMU block presets — ASTM C90 full range ─────────────────────────
// Nominal size format: W×H×L (width/depth × height × length)
// Actual = nominal − 3/8″ (0.375″) mortar joint for each face dimension.
// IDs kept backward-compatible with prior version.
export const CMU_BLOCKS = [
  { id: "8x8x16",  label: '8×8×16″ — Standard',       actualHIn: 7.625, actualLIn: 15.625, depthIn: 7.625,  nomWIn: 8,  nomHIn: 8, nomLIn: 16 },
  { id: "6x8x16",  label: '6×8×16″',                  actualHIn: 7.625, actualLIn: 15.625, depthIn: 5.625,  nomWIn: 6,  nomHIn: 8, nomLIn: 16 },
  { id: "10x8x16", label: '10×8×16″',                 actualHIn: 7.625, actualLIn: 15.625, depthIn: 9.625,  nomWIn: 10, nomHIn: 8, nomLIn: 16 },
  { id: "12x8x16", label: '12×8×16″ — Extra Heavy',   actualHIn: 7.625, actualLIn: 15.625, depthIn: 11.625, nomWIn: 12, nomHIn: 8, nomLIn: 16 },
  { id: "4x8x16",  label: '4×8×16″',                  actualHIn: 7.625, actualLIn: 15.625, depthIn: 3.625,  nomWIn: 4,  nomHIn: 8, nomLIn: 16 },
  { id: "8x8x8",   label: '8×8×8″ — Corner/Half-Len', actualHIn: 7.625, actualLIn:  7.625, depthIn: 7.625,  nomWIn: 8,  nomHIn: 8, nomLIn: 8  },
  { id: "6x8x8",   label: '6×8×8″ — Half-Length',     actualHIn: 7.625, actualLIn:  7.625, depthIn: 5.625,  nomWIn: 6,  nomHIn: 8, nomLIn: 8  },
  { id: "4x8x8",   label: '4×8×8″ — Half-Length',     actualHIn: 7.625, actualLIn:  7.625, depthIn: 3.625,  nomWIn: 4,  nomHIn: 8, nomLIn: 8  },
  { id: "8x4x16",  label: '8×4×16″ — Half-Height',    actualHIn: 3.625, actualLIn: 15.625, depthIn: 7.625,  nomWIn: 8,  nomHIn: 4, nomLIn: 16 },
  { id: "custom",  label: "Custom Block",               actualHIn: null,  actualLIn: null,   depthIn: null   },
];

// ── Segmental block presets ────────────────────────────────────────
// No mortar — actual face dimensions are used directly.
// IDs kept backward-compatible with prior version.
export const SEG_BLOCKS = [
  { id: "mini",    label: 'Mini Block (6×3½×6″)',           faceLIn: 6,    faceHIn: 3.5, depthIn: 6   },
  { id: "garden",  label: 'Garden Wall (11½×4×8″)',         faceLIn: 11.5, faceHIn: 4,   depthIn: 8   },
  { id: "8x6x10",  label: '8×6×10″ (compact)',              faceLIn: 8,    faceHIn: 6,   depthIn: 10  },
  { id: "12x6x12", label: '12×6×12″ (standard SRW)',        faceLIn: 12,   faceHIn: 6,   depthIn: 12  },
  { id: "12x8x12", label: '12×8×12″',                       faceLIn: 12,   faceHIn: 8,   depthIn: 12  },
  { id: "18x6x12", label: '18×6×12″ (large face)',          faceLIn: 18,   faceHIn: 6,   depthIn: 12  },
  { id: "18x6x18", label: 'Landscape/Jumbo (18×6×18″)',     faceLIn: 18,   faceHIn: 6,   depthIn: 18  },
  { id: "custom",  label: "Custom Block",                     faceLIn: null, faceHIn: null, depthIn: null },
];

// ── Stone type presets ─────────────────────────────────────────────
// Engineering reference density ranges shown for transparency.
export const STONE_TYPES = [
  { id: "granite",    label: "Granite",    densityKgM3: 2750, refRange: "2640–2860 kg/m³" },
  { id: "limestone",  label: "Limestone",  densityKgM3: 2550, refRange: "2300–2800 kg/m³" },
  { id: "sandstone",  label: "Sandstone",  densityKgM3: 2300, refRange: "2200–2400 kg/m³" },
  { id: "fieldstone", label: "Fieldstone", densityKgM3: 2600, refRange: "2400–2700 kg/m³" },
  { id: "basalt",     label: "Basalt",     densityKgM3: 2900, refRange: "2700–3100 kg/m³" },
  { id: "marble",     label: "Marble",     densityKgM3: 2720, refRange: "2550–2900 kg/m³" },
  { id: "custom",     label: "Custom",     densityKgM3: null, refRange: null              },
];

// ── Rebar sizes — full ASTM A615 / metric database ─────────────────
// Mirrors the rebarCalc.js REBAR_SIZES for consistency.
export const REBAR_SIZES_RW = [
  // Metric bars
  { id: "m6",   label: "6 mm",     group: "Metric", diameterMm:  6.000, weightPerM: 0.222 },
  { id: "m8",   label: "8 mm",     group: "Metric", diameterMm:  8.000, weightPerM: 0.395 },
  { id: "m10",  label: "10 mm",    group: "Metric", diameterMm: 10.000, weightPerM: 0.617 },
  { id: "m12",  label: "12 mm",    group: "Metric", diameterMm: 12.000, weightPerM: 0.888 },
  { id: "m16",  label: "16 mm",    group: "Metric", diameterMm: 16.000, weightPerM: 1.578 },
  { id: "m20",  label: "20 mm",    group: "Metric", diameterMm: 20.000, weightPerM: 2.466 },
  { id: "m25",  label: "25 mm",    group: "Metric", diameterMm: 25.000, weightPerM: 3.854 },
  // US bars (ASTM A615 nominal)
  { id: "us2",  label: '#2 (¼″)',  group: "US",     diameterMm:  6.350, weightPerM: 0.248 },
  { id: "us3",  label: '#3 (⅜″)',  group: "US",     diameterMm:  9.525, weightPerM: 0.560 },
  { id: "us4",  label: '#4 (½″)',  group: "US",     diameterMm: 12.700, weightPerM: 0.994 },
  { id: "us5",  label: '#5 (⅝″)',  group: "US",     diameterMm: 15.875, weightPerM: 1.552 },
  { id: "us6",  label: '#6 (¾″)',  group: "US",     diameterMm: 19.050, weightPerM: 2.235 },
  { id: "us7",  label: '#7 (⅞″)',  group: "US",     diameterMm: 22.225, weightPerM: 3.042 },
  { id: "us8",  label: '#8 (1″)',  group: "US",     diameterMm: 25.400, weightPerM: 3.973 },
  { id: "us9",  label: '#9',       group: "US",     diameterMm: 28.650, weightPerM: 5.060 },
  { id: "us10", label: '#10',      group: "US",     diameterMm: 32.260, weightPerM: 6.404 },
  { id: "us11", label: '#11',      group: "US",     diameterMm: 35.810, weightPerM: 7.907 },
];

// ── Wall opening types ─────────────────────────────────────────────
export const OPENING_TYPES = [
  { id: "gate",    label: "Gate / Access" },
  { id: "window",  label: "Window" },
  { id: "door",    label: "Door" },
  { id: "utility", label: "Utility / Conduit" },
  { id: "custom",  label: "Custom Opening" },
];

// ── Conversion helpers ─────────────────────────────────────────────

export function toM(value, unitId) {
  const v = parseFloat(value);
  if (!isFinite(v) || v < 0) return null;
  const u = DIM_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function fromM(meters, unitId) {
  if (meters === null || !isFinite(meters)) return null;
  const u = DIM_UNITS.find((u) => u.id === unitId);
  return u ? meters / u.toM : meters;
}

export function fromM3(m3, unitId) {
  if (m3 === null || !isFinite(m3)) return null;
  const u = VOL_FROM_M3.find((u) => u.id === unitId);
  return u ? m3 * u.factor : m3;
}

export function fromKg(kg, unitId) {
  if (kg === null || !isFinite(kg)) return null;
  const u = WEIGHT_FROM_KG.find((u) => u.id === unitId);
  return u ? kg * u.factor : kg;
}

// ── Formatting ─────────────────────────────────────────────────────
export function fmt(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp,
  });
}

// ── Validation ─────────────────────────────────────────────────────
export function valPos(v) {
  if (v === "" || v === null || v === undefined) return "Required";
  const n = parseFloat(v);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be > 0";
  return null;
}

export function valNonNeg(v) {
  if (v === "" || v === null || v === undefined) return "Required";
  const n = parseFloat(v);
  if (!isFinite(n)) return "Enter a valid number";
  if (n < 0) return "Cannot be negative";
  return null;
}

export function valPercent(v) {
  const n = parseFloat(v);
  if (!isFinite(n)) return "Enter a number";
  if (n < 0 || n > 100) return "Enter 0–100";
  return null;
}

export function valAngle(v) {
  const n = parseFloat(v);
  if (!isFinite(n)) return "Enter a valid angle";
  if (n < 0 || n >= 45) return "Must be 0–44.9°";
  return null;
}

// ── Float-safe ceiling ────────────────────────────────────────────
// Unit conversions accumulate tiny fp errors. A value that should be exactly 9
// may appear as 9.000000000001, causing Math.ceil to return 10. EPS prevents this.
function ceilSafe(x) {
  return Math.ceil(x - 1e-9);
}

// ── Default footing dims from stem thickness ───────────────────────
// Rule of thumb: width ≥ 2× stem, min 18"; thickness ≥ stem, min 8"
export function defaultFootingIn(stemIn) {
  const t = parseFloat(stemIn);
  if (!isFinite(t) || t <= 0) return { widthIn: 24, thicknessIn: 12 };
  return {
    widthIn:     Math.max(t * 2, 18),
    thicknessIn: Math.max(t, 8),
  };
}

// ── Opening area helper ────────────────────────────────────────────
// Accepts an array of { widthM, heightM } opening objects.
export function calcOpeningsArea(openings) {
  if (!Array.isArray(openings) || openings.length === 0) return 0;
  return openings.reduce((sum, o) => {
    const w = parseFloat(o.widthM) || 0;
    const h = parseFloat(o.heightM) || 0;
    return sum + w * h;
  }, 0);
}

// ── Curved wall arc length ─────────────────────────────────────────
// Returns arc length in meters. Pass arcLengthM for direct input,
// or radiusM + centralAngleDeg for radius/angle input.
export function calcCurvedLength({ radiusM = 0, centralAngleDeg = 0, arcLengthM = 0 }) {
  const arc = parseFloat(arcLengthM) || 0;
  if (arc > 0) return arc;
  const r = parseFloat(radiusM) || 0;
  const a = parseFloat(centralAngleDeg) || 0;
  if (r > 0 && a > 0 && a < 360) return r * (a * Math.PI / 180);
  return null;
}

// ── Drainage sub-calculation ───────────────────────────────────────
function calcDrainage({ lengthM, drainageEnabled, drainWidthM, drainDepthM, fabricOverlapM }) {
  if (!drainageEnabled || !lengthM) return null;
  return {
    gravelVolM3:      lengthM * drainWidthM * drainDepthM,
    pipeLengthM:      lengthM,
    geotextileAreaM2: lengthM * (drainWidthM + 2 * drainDepthM + (fabricOverlapM || 0.305)),
  };
}

// ── Backfill sub-calculation ───────────────────────────────────────
// Volume = L × H × depth; default depth = total structural height (exposed + buried)
function calcBackfill({ lengthM, heightM, buriedHeightM = 0, backfillDepthM, wasteBackfill }) {
  if (!lengthM || !heightM) return null;
  const structuralH = heightM + buriedHeightM;
  const depth = backfillDepthM > 0 ? backfillDepthM : structuralH;
  const vol   = lengthM * structuralH * depth;
  return {
    backfillVolM3:       vol,
    backfillWithWasteM3: vol * (1 + wasteBackfill / 100),
  };
}

// ── Rebar (conceptual estimate — NOT structural design) ───────────
// structuralHeightM: total height including buried portion (for vertical bar length)
export function calcRebarRW({ lengthM, heightM, structuralHeightM, footingWidthM,
    vertSpacingM, horizSpacingM, barWeightPerM, wastePercent }) {
  if (!lengthM || !heightM || !vertSpacingM || !horizSpacingM || !barWeightPerM) return null;

  const rebarH = structuralHeightM || heightM;  // use structural height if provided

  // Vertical bars in stem — run full structural height + 12" development into footing
  const numVert    = ceilSafe(lengthM / vertSpacingM) + 1;
  const vertLenM   = rebarH + 0.305;
  const totalVertM = numVert * vertLenM;

  // Horizontal bars in stem — spacing based on exposed height
  const numHoriz    = Math.max(1, ceilSafe(heightM / horizSpacingM));
  const horizLenM   = lengthM + 0.305;  // 12" lap splice
  const totalHorizM = numHoriz * horizLenM;

  // Footing longitudinal bars (2: top + bottom)
  const numFtgLong    = 2;
  const ftgLongLenM   = lengthM + 0.305;
  const totalFtgLongM = numFtgLong * ftgLongLenM;

  // Footing tie bars (cross direction, every 16" = 0.4064 m)
  const numTies    = footingWidthM > 0 ? Math.ceil(lengthM / 0.4064) + 1 : 0;
  const tieLenM    = footingWidthM > 0 ? Math.max(footingWidthM - 0.076, 0.1) : 0;
  const totalTiesM = numTies * tieLenM;

  const totalRebarM          = totalVertM + totalHorizM + totalFtgLongM + totalTiesM;
  const totalRebarWithWasteM = totalRebarM * (1 + wastePercent / 100);
  const rebarWeightKg        = totalRebarWithWasteM * barWeightPerM;

  return {
    numVert, vertLenM, totalVertM,
    numHoriz, horizLenM, totalHorizM,
    numFtgLong, ftgLongLenM, totalFtgLongM,
    numTies, tieLenM, totalTiesM,
    totalRebarM, totalRebarWithWasteM, rebarWeightKg,
  };
}

// ── Concrete wall ──────────────────────────────────────────────────
export function calcConcreteWall(p) {
  const { lengthM, heightM, stemThicknessM, topThicknessM, bottomThicknessM,
    footingEnabled, footingWidthM, footingThicknessM,
    wasteConcrete, wasteRebar, wasteBackfill,
    openingsAreaM2 = 0, buriedHeightM = 0 } = p;

  if (!(lengthM > 0) || !(heightM > 0) || !(stemThicknessM > 0)) return null;

  const useTapered      = topThicknessM > 0 && bottomThicknessM > 0;
  const avgThk          = useTapered ? (topThicknessM + bottomThicknessM) / 2 : stemThicknessM;

  const grossWallAreaM2 = lengthM * heightM;
  const netWallAreaM2   = Math.max(grossWallAreaM2 - openingsAreaM2, 0);
  const stemVolM3       = netWallAreaM2 * avgThk;

  const footingVolM3             = footingEnabled ? lengthM * footingWidthM * footingThicknessM : 0;
  const totalConcreteM3          = stemVolM3 + footingVolM3;
  const totalConcreteWithWasteM3 = totalConcreteM3 * (1 + wasteConcrete / 100);

  const drainage = calcDrainage(p);
  const backfill = calcBackfill({ ...p, buriedHeightM, wasteBackfill });
  const rebar    = p.reinfEnabled
    ? calcRebarRW({ lengthM, heightM,
        structuralHeightM: heightM + buriedHeightM,
        footingWidthM: footingEnabled ? footingWidthM : 0,
        vertSpacingM: p.vertSpacingM, horizSpacingM: p.horizSpacingM,
        barWeightPerM: p.barWeightPerM, wastePercent: wasteRebar })
    : null;

  return {
    stemVolM3, footingVolM3, totalConcreteM3, totalConcreteWithWasteM3,
    wallAreaM2: grossWallAreaM2,
    grossWallAreaM2, netWallAreaM2, openingsAreaM2,
    drainage, backfill, rebar,
  };
}

// ── CMU wall ───────────────────────────────────────────────────────
export function calcCMUWall(p) {
  const { lengthM, heightM, blockActualHIn, blockActualLIn,
    mortarJointIn, footingEnabled, footingWidthM, footingThicknessM,
    wasteBlock, wasteConcrete, wasteRebar, wasteBackfill,
    openingsAreaM2 = 0, buriedHeightM = 0 } = p;

  if (!(lengthM > 0) || !(heightM > 0) || !(blockActualHIn > 0) || !(blockActualLIn > 0)) return null;

  const blockHM = blockActualHIn * 0.0254;
  const blockLM = blockActualLIn * 0.0254;
  const mortarM = (mortarJointIn || 0.375) * 0.0254;

  const effH = blockHM + mortarM;
  const effL = blockLM + mortarM;

  const numCourses      = ceilSafe(heightM / effH);
  const blocksPerCourse = ceilSafe(lengthM / effL);

  const grossWallAreaM2 = lengthM * heightM;
  const netWallAreaM2   = Math.max(grossWallAreaM2 - openingsAreaM2, 0);
  const areaRatio       = grossWallAreaM2 > 0 ? netWallAreaM2 / grossWallAreaM2 : 0;

  const grossTotalBlocks = numCourses * blocksPerCourse;
  const totalBlocks      = Math.round(grossTotalBlocks * areaRatio);
  const totalBlocksWaste = Math.ceil(totalBlocks * (1 + wasteBlock / 100));

  // Improved half-block algorithm (running bond pattern for straight wall):
  // Alternating courses are offset by half a block, requiring ~1 half-block
  // per course (at one end on average). No corner blocks for a straight wall.
  const halfBlocks   = numCourses;
  const cornerBlocks = 0;
  const fullBlocks   = Math.max(totalBlocks - halfBlocks, 0);

  const footingVolM3       = footingEnabled ? lengthM * footingWidthM * footingThicknessM : 0;
  const footingWithWasteM3 = footingVolM3 * (1 + wasteConcrete / 100);

  const drainage = calcDrainage(p);
  const backfill = calcBackfill({ ...p, buriedHeightM, wasteBackfill });
  const rebar    = p.reinfEnabled
    ? calcRebarRW({ lengthM, heightM,
        structuralHeightM: heightM + buriedHeightM,
        footingWidthM: footingEnabled ? footingWidthM : 0,
        vertSpacingM: p.vertSpacingM, horizSpacingM: p.horizSpacingM,
        barWeightPerM: p.barWeightPerM, wastePercent: wasteRebar })
    : null;

  return {
    numCourses, blocksPerCourse, totalBlocks, totalBlocksWaste,
    halfBlocks, cornerBlocks, fullBlocks,
    footingVolM3, footingWithWasteM3,
    wallAreaM2: grossWallAreaM2,
    grossWallAreaM2, netWallAreaM2, openingsAreaM2,
    drainage, backfill, rebar,
  };
}

// ── Segmental retaining wall ───────────────────────────────────────
export function calcSegmentalWall(p) {
  const { lengthM, heightM, blockFaceLIn, blockFaceHIn,
    batEnabled, batType, batAngleDeg, batSetbackIn, batTotalSetbackM = 0,
    footingEnabled, footingWidthM, footingThicknessM,
    wasteBlock, wasteConcrete, wasteRebar, wasteBackfill,
    openingsAreaM2 = 0, buriedHeightM = 0 } = p;

  if (!(lengthM > 0) || !(heightM > 0) || !(blockFaceLIn > 0) || !(blockFaceHIn > 0)) return null;

  const blockLM = blockFaceLIn * 0.0254;
  const blockHM = blockFaceHIn * 0.0254;

  const numCourses      = ceilSafe(heightM / blockHM);
  const blocksPerCourse = ceilSafe(lengthM / blockLM);

  const grossWallAreaM2 = lengthM * heightM;
  const netWallAreaM2   = Math.max(grossWallAreaM2 - openingsAreaM2, 0);
  const areaRatio       = grossWallAreaM2 > 0 ? netWallAreaM2 / grossWallAreaM2 : 0;

  const grossTotalBlocks = numCourses * blocksPerCourse;
  const totalBlocks      = Math.round(grossTotalBlocks * areaRatio);
  const totalBlocksWaste = Math.ceil(totalBlocks * (1 + wasteBlock / 100));

  // Batter — three methods
  let setbackPerCourseM = 0;
  if (batEnabled) {
    if (batType === "angle" && parseFloat(batAngleDeg) > 0) {
      setbackPerCourseM = blockHM * Math.tan((parseFloat(batAngleDeg) * Math.PI) / 180);
    } else if (batType === "setback" && parseFloat(batSetbackIn) > 0) {
      setbackPerCourseM = parseFloat(batSetbackIn) * 0.0254;
    } else if (batType === "total_setback" && batTotalSetbackM > 0 && numCourses > 0) {
      // Total setback distributed evenly over all courses
      setbackPerCourseM = batTotalSetbackM / numCourses;
    }
  }
  const totalSetbackM         = setbackPerCourseM * numCourses;
  const effectiveBatAngleDeg  = batEnabled && setbackPerCourseM > 0 && blockHM > 0
    ? Math.atan(setbackPerCourseM / blockHM) * (180 / Math.PI)
    : 0;
  const derivedSetbackPerCourseIn = setbackPerCourseM / 0.0254;

  const footingVolM3       = footingEnabled ? lengthM * footingWidthM * footingThicknessM : 0;
  const footingWithWasteM3 = footingVolM3 * (1 + wasteConcrete / 100);

  const drainage = calcDrainage(p);
  const backfill = calcBackfill({ ...p, buriedHeightM, wasteBackfill });
  const rebar    = p.reinfEnabled
    ? calcRebarRW({ lengthM, heightM,
        structuralHeightM: heightM + buriedHeightM,
        footingWidthM: footingEnabled ? footingWidthM : 0,
        vertSpacingM: p.vertSpacingM, horizSpacingM: p.horizSpacingM,
        barWeightPerM: p.barWeightPerM, wastePercent: wasteRebar })
    : null;

  return {
    numCourses, blocksPerCourse, totalBlocks, totalBlocksWaste,
    setbackPerCourseM, totalSetbackM, effectiveBatAngleDeg, derivedSetbackPerCourseIn,
    footingVolM3, footingWithWasteM3,
    wallAreaM2: grossWallAreaM2,
    grossWallAreaM2, netWallAreaM2, openingsAreaM2,
    drainage, backfill, rebar,
  };
}

// ── Stone wall ─────────────────────────────────────────────────────
export function calcStoneWall(p) {
  const { lengthM, heightM, thicknessM, isMortared, densityKgM3,
    footingEnabled, footingWidthM, footingThicknessM,
    wasteStone, wasteConcrete, wasteBackfill,
    openingsAreaM2 = 0, buriedHeightM = 0 } = p;

  if (!(lengthM > 0) || !(heightM > 0) || !(thicknessM > 0) || !(densityKgM3 > 0)) return null;

  const grossWallAreaM2 = lengthM * heightM;
  const netWallAreaM2   = Math.max(grossWallAreaM2 - openingsAreaM2, 0);

  const totalVolM3  = netWallAreaM2 * thicknessM;
  const mortarFrac  = isMortared ? 0.30 : 0;
  const voidFrac    = isMortared ? 0 : 0.25;
  const stoneFrac   = 1 - mortarFrac - voidFrac;  // 0.70 mortared | 0.75 dry

  const stoneVolM3          = totalVolM3 * stoneFrac;
  const mortarVolM3         = totalVolM3 * mortarFrac;
  const voidVolM3           = totalVolM3 * voidFrac;
  const stoneVolWithWasteM3 = stoneVolM3 * (1 + wasteStone / 100);
  const stoneWeightKg       = stoneVolWithWasteM3 * densityKgM3;

  const footingVolM3       = footingEnabled ? lengthM * footingWidthM * footingThicknessM : 0;
  const footingWithWasteM3 = footingVolM3 * (1 + wasteConcrete / 100);

  const drainage = calcDrainage(p);
  const backfill = calcBackfill({ ...p, buriedHeightM, wasteBackfill });

  return {
    totalVolM3, stoneVolM3, mortarVolM3, voidVolM3,
    stoneVolWithWasteM3, stoneWeightKg,
    footingVolM3, footingWithWasteM3,
    wallAreaM2: grossWallAreaM2,
    grossWallAreaM2, netWallAreaM2, openingsAreaM2,
    drainage, backfill,
  };
}

// ── Aggregate stepped-wall sections ───────────────────────────────
// Each section uses the same wall-type params but different lengthM / heightM.
// Returns a single merged result object by summing numeric leaves.
// Note: openings are not distributed per-section for stepped walls; apply
// openingsAreaM2 reduction manually to the result in the calling component.
export function calcSteppedWall(sections, wallType, commonParams) {
  const calcFn = wallType === "concrete"       ? calcConcreteWall
               : wallType === "cmu"            ? calcCMUWall
               : wallType === "segmental"      ? calcSegmentalWall
               : calcStoneWall;

  const isMortared = wallType === "stone-mortared";
  const results = sections
    .map(s => calcFn({ ...commonParams, lengthM: s.lengthM, heightM: s.heightM, isMortared }))
    .filter(Boolean);

  if (results.length === 0) return null;

  // Deep-sum numeric fields, last-wins for non-numeric leaves
  function deepSum(objs) {
    if (objs.every(o => o === null || o === undefined)) return null;
    const filtered = objs.filter(o => o !== null && o !== undefined);
    if (typeof filtered[0] === "number") return filtered.reduce((a, b) => a + (b || 0), 0);
    if (typeof filtered[0] === "object") {
      const keys = Object.keys(filtered[0]);
      return Object.fromEntries(keys.map(k => [k, deepSum(filtered.map(o => o[k]))]));
    }
    return filtered[filtered.length - 1];
  }

  return deepSum(results);
}
