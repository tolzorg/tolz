// Board & Batten Calculator — Pure Calculation Engine
// North American dimensional lumber standard (nominal vs actual sizing)
// All internal calculations in SI (meters). Imperial helpers for display.

// ── Unit system ────────────────────────────────────────────────────
export const BB_DIM_UNITS = [
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

export function toM(value, unitId) {
  const v = parseFloat(value);
  if (!isFinite(v) || v < 0) return null;
  const u = BB_DIM_UNITS.find(u => u.id === unitId);
  return u ? v * u.toM : null;
}

export function fromM(meters, unitId) {
  if (meters === null || !isFinite(meters)) return null;
  const u = BB_DIM_UNITS.find(u => u.id === unitId);
  return u ? meters / u.toM : meters;
}

export function toFt(m)   { return m  != null && isFinite(m)  ? m  / 0.3048   : null; }
export function toFt2(m2) { return m2 != null && isFinite(m2) ? m2 * 10.7639  : null; }
export function toLF(m)   { return m  != null && isFinite(m)  ? m  * 3.28084  : null; }

export function fmt(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toLocaleString(undefined, {
    minimumFractionDigits: 0, maximumFractionDigits: dp,
  });
}

export function valPos(v) {
  if (v === "" || v == null) return "Required";
  const n = parseFloat(v);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0)       return "Must be > 0";
  return null;
}
export function valNonNeg(v) {
  const n = parseFloat(v);
  if (!isFinite(n)) return "Enter a number";
  if (n < 0)        return "Must be ≥ 0";
  return null;
}
export function valPercent(v) {
  const n = parseFloat(v);
  if (!isFinite(n))    return "Enter a number";
  if (n < 0 || n > 100) return "Enter 0–100";
  return null;
}

// ── North American Dimensional Lumber ─────────────────────────────
// All widths / thicknesses in inches (actual manufactured sizes)
export const BOARD_DATABASE = [
  { id: "1x2",   label: "1×2",    nomT: 1, nomW: 2,  actT: 0.75, actW: 1.5,   group: "1× Series" },
  { id: "1x3",   label: "1×3",    nomT: 1, nomW: 3,  actT: 0.75, actW: 2.5,   group: "1× Series" },
  { id: "1x4",   label: "1×4",    nomT: 1, nomW: 4,  actT: 0.75, actW: 3.5,   group: "1× Series" },
  { id: "1x6",   label: "1×6",    nomT: 1, nomW: 6,  actT: 0.75, actW: 5.5,   group: "1× Series" },
  { id: "1x8",   label: "1×8",    nomT: 1, nomW: 8,  actT: 0.75, actW: 7.25,  group: "1× Series" },
  { id: "1x10",  label: "1×10",   nomT: 1, nomW: 10, actT: 0.75, actW: 9.25,  group: "1× Series" },
  { id: "1x12",  label: "1×12",   nomT: 1, nomW: 12, actT: 0.75, actW: 11.25, group: "1× Series" },
  { id: "2x2",   label: "2×2",    nomT: 2, nomW: 2,  actT: 1.5,  actW: 1.5,   group: "2× Series" },
  { id: "2x4",   label: "2×4",    nomT: 2, nomW: 4,  actT: 1.5,  actW: 3.5,   group: "2× Series" },
  { id: "2x6",   label: "2×6",    nomT: 2, nomW: 6,  actT: 1.5,  actW: 5.5,   group: "2× Series" },
  { id: "2x8",   label: "2×8",    nomT: 2, nomW: 8,  actT: 1.5,  actW: 7.25,  group: "2× Series" },
  { id: "2x10",  label: "2×10",   nomT: 2, nomW: 10, actT: 1.5,  actW: 9.25,  group: "2× Series" },
  { id: "2x12",  label: "2×12",   nomT: 2, nomW: 12, actT: 1.5,  actW: 11.25, group: "2× Series" },
  { id: "custom",label: "Custom Board", nomT: null, nomW: null, actT: null, actW: null, group: "Custom" },
];

export const BATTEN_DATABASE = [
  { id: "bat_1x2",    label: "1×2 Batten",   nomT: 1, nomW: 2, actT: 0.75, actW: 1.5,  group: "1× Series" },
  { id: "bat_1x3",    label: "1×3 Batten",   nomT: 1, nomW: 3, actT: 0.75, actW: 2.5,  group: "1× Series" },
  { id: "bat_1x4",    label: "1×4 Batten",   nomT: 1, nomW: 4, actT: 0.75, actW: 3.5,  group: "1× Series" },
  { id: "bat_2x2",    label: "2×2 Batten",   nomT: 2, nomW: 2, actT: 1.5,  actW: 1.5,  group: "2× Series" },
  { id: "bat_2x4",    label: "2×4 Batten",   nomT: 2, nomW: 4, actT: 1.5,  actW: 3.5,  group: "2× Series" },
  { id: "bat_custom", label: "Custom Batten", nomT: null, nomW: null, actT: null, actW: null, group: "Custom" },
];

export const BOARD_PROFILES = [
  { id: "square_edge",   label: "Square Edge",     overlapIn: 0,     desc: "Coverage = Actual Width. Full face exposed." },
  { id: "shiplap",       label: "Shiplap",          overlapIn: 0.5,   desc: "Coverage = Actual Width − ½″ overlap per board." },
  { id: "tongue_groove", label: "Tongue & Groove",  overlapIn: 0.375, desc: "Coverage = Actual Width − ⅜″ tongue width." },
  { id: "rough_sawn",    label: "Rough Sawn",       overlapIn: 0,     desc: "Full actual width used. No joint reduction." },
  { id: "bevel",         label: "Bevel Siding",     overlapIn: 1.0,   desc: "Coverage = Actual Width − 1″ (bevel exposure)." },
  { id: "channel",       label: "Channel Rustic",   overlapIn: 0.5,   desc: "Coverage = Actual Width − ½″ channel overlap." },
  { id: "custom",        label: "Custom Profile",   overlapIn: null,  desc: "User-defined effective coverage width." },
];

export const OPENING_TYPES_BB = [
  { id: "door",        label: "Door" },
  { id: "window",      label: "Window" },
  { id: "garage_door", label: "Garage Door" },
  { id: "utility",     label: "Utility Opening" },
  { id: "custom",      label: "Custom" },
];

export const INSTALLATION_METHODS = [
  { id: "flush",         label: "Flush Start",        desc: "First board begins at the wall edge." },
  { id: "equal_margins", label: "Equal Edge Margins", desc: "Remaining space split equally on both sides." },
  { id: "centered",      label: "Centered Layout",    desc: "Pattern centered; first and last boards are symmetrical." },
  { id: "fixed_margins", label: "Fixed End Margins",  desc: "You specify exact left and right margins." },
];

export const STOCK_LENGTHS_FT = [8, 10, 12, 14, 16, 18, 20];

export const OPTIMIZATION_METHODS = [
  { id: "simple", label: "Simple Length Rounding", desc: "Each run rounded up to nearest stock length independently." },
  { id: "greedy", label: "Greedy Cut Optimization", desc: "Pack multiple shorter runs into one stock piece to cut waste." },
];

// ── Effective board coverage ───────────────────────────────────────
export function calcEffectiveCoverageIn(actualWidthIn, profileId, customCoverageIn = null) {
  if (profileId === "custom" && parseFloat(customCoverageIn) > 0) return parseFloat(customCoverageIn);
  const profile = BOARD_PROFILES.find(p => p.id === profileId);
  const overlap = profile?.overlapIn ?? 0;
  return Math.max(actualWidthIn - overlap, 0.25);
}

// ── Board layout engine ────────────────────────────────────────────
// Classic Board & Batten: boards placed across the wall with battens between.
// Pattern: [lMargin] [board] [batten] [board] [batten] ... [board] [rMargin]
// If includeEdgeBattens: [lMargin] [batten] [board] [batten] ... [batten] [rMargin]
//
// Returns board/batten counts, margins, positions array for SVG.
export function calcBoardLayout({
  wallWidthM, boardCoverageM, battenWidthM,
  layoutMethod, leftMarginM = 0, rightMarginM = 0, includeEdgeBattens = false,
}) {
  if (!(wallWidthM > 0) || !(boardCoverageM > 0)) return null;
  const batW = Math.max(battenWidthM || 0, 0);

  let availW = wallWidthM;
  let fixedLeft = 0, fixedRight = 0;
  if (layoutMethod === "fixed_margins") {
    fixedLeft  = Math.max(leftMarginM  || 0, 0);
    fixedRight = Math.max(rightMarginM || 0, 0);
    availW = wallWidthM - fixedLeft - fixedRight;
  }
  if (!(availW > 0) || availW < boardCoverageM) return null;

  // Solve for n boards:
  // With edge battens:   usedW = (n+1)*batW + n*boardCoverageM
  //                      n = floor((availW - batW) / (boardCoverageM + batW))
  // Without edge battens: usedW = (n-1)*batW + n*boardCoverageM
  //                      n = floor((availW + batW) / (boardCoverageM + batW))
  let n, battenCount;
  if (includeEdgeBattens && batW > 0) {
    n = Math.max(1, Math.floor((availW - batW) / (boardCoverageM + batW)));
    battenCount = n + 1;
  } else {
    n = batW > 0
      ? Math.max(1, Math.floor((availW + batW) / (boardCoverageM + batW)))
      : Math.max(1, Math.floor(availW / boardCoverageM));
    battenCount = Math.max(n - 1, 0);
  }

  const usedW    = n * boardCoverageM + battenCount * batW;
  const remaining = availW - usedW;

  // Distribute remaining
  let leftM = fixedLeft, rightM = fixedRight;
  if (layoutMethod === "flush") {
    leftM  = fixedLeft;
    rightM = fixedRight + remaining;
  } else if (layoutMethod === "equal_margins" || layoutMethod === "centered") {
    leftM  = fixedLeft  + remaining / 2;
    rightM = fixedRight + remaining / 2;
  } else if (layoutMethod === "fixed_margins") {
    leftM  = fixedLeft;
    rightM = fixedRight;
  }

  // Build positions array (for SVG) relative to start of wall (x=0)
  const positions = [];
  let x = leftM;
  if (includeEdgeBattens && batW > 0) {
    positions.push({ x, width: batW, type: "batten" });
    x += batW;
  }
  for (let i = 0; i < n; i++) {
    positions.push({ x, width: boardCoverageM, type: "board" });
    x += boardCoverageM;
    if (i < n - 1) {
      positions.push({ x, width: batW, type: "batten" });
      x += batW;
    } else if (includeEdgeBattens && batW > 0) {
      positions.push({ x, width: batW, type: "batten" });
    }
  }

  return {
    boardCount: n, battenCount,
    leftMarginM: leftM, rightMarginM: rightM,
    gapM: batW, usedWidthM: usedW,
    remainingM: Math.max(remaining, 0), positions,
  };
}

// ── Material optimization ─────────────────────────────────────────
// First-fit decreasing bin packing for greedy; simple ceiling for simple.
function optimizeRuns(runs, stockLengthM, method) {
  if (!runs || runs.length === 0) {
    return { pieces: 0, totalPurchasedM: 0, totalUsedM: 0, wasteM: 0, wastePct: 0 };
  }
  const totalUsedM = runs.reduce((s, r) => s + r, 0);
  let pieces;

  if (method === "greedy") {
    const sorted = [...runs].sort((a, b) => b - a);
    const bins   = []; // remaining space in each opened stock piece
    for (const run of sorted) {
      const idx = bins.findIndex(rem => rem >= run - 1e-9);
      if (idx >= 0) { bins[idx] -= run; }
      else          { bins.push(stockLengthM - run); }
    }
    pieces = bins.length;
  } else {
    pieces = runs.reduce((s, r) => s + Math.max(1, Math.ceil(r / stockLengthM)), 0);
  }

  const totalPurchasedM = pieces * stockLengthM;
  const wasteM          = Math.max(totalPurchasedM - totalUsedM, 0);
  return {
    pieces, totalPurchasedM, totalUsedM, wasteM,
    wastePct: totalPurchasedM > 0 ? (wasteM / totalPurchasedM) * 100 : 0,
  };
}

// ── Main calculator ────────────────────────────────────────────────
export function calcBoardAndBatten({
  walls, openings, boardCoverageM, battenWidthM,
  layoutMethod, leftMarginM, rightMarginM, includeEdgeBattens,
  wastePct, stockLengthFt, optimizationMethod, calcMode, areaHeightM,
}) {
  if (!walls?.length) return null;
  if (!(boardCoverageM > 0)) return null;

  const stockM = (parseFloat(stockLengthFt) || 10) * 0.3048;
  const perWall = [];
  const allBoardRunsM   = [];
  const allBattenRunsM  = [];

  let totalGrossM2  = 0, totalOpeningM2 = 0, totalNetM2 = 0;
  let totalBoards   = 0, totalBattens   = 0;
  let totalBoardLM  = 0, totalBattenLM  = 0;
  let totalBoardS2  = 0, totalBattenS2  = 0;

  const wB = 1 + (parseFloat(wastePct?.boards)  || 10) / 100;
  const wT = 1 + (parseFloat(wastePct?.battens) || 10) / 100;

  if (calcMode === "area") {
    // Area mode: user enters total area directly
    const totalArea = walls.reduce((s, w) => s + (w.areaM2 || 0), 0);
    if (!(totalArea > 0)) return null;
    const refH = areaHeightM > 0 ? areaHeightM : 3;
    const refW  = totalArea / refH;
    const layout = calcBoardLayout({
      wallWidthM: refW, boardCoverageM, battenWidthM,
      layoutMethod, leftMarginM, rightMarginM, includeEdgeBattens,
    });
    if (!layout) return null;
    totalBoards  = layout.boardCount;
    totalBattens = layout.battenCount;
    totalBoardLM  = totalBoards  * refH;
    totalBattenLM = totalBattens * refH;
    totalGrossM2  = totalArea;
    totalNetM2    = totalArea;
    for (let i = 0; i < Math.ceil(totalBoards * wB); i++)  allBoardRunsM.push(refH);
    for (let i = 0; i < Math.ceil(totalBattens * wT); i++) allBattenRunsM.push(refH);
    perWall.push({ wall: walls[0], grossAreaM2: totalArea, openingAreaM2: 0, netAreaM2: totalArea, boardCount: totalBoards, battenCount: totalBattens, layout });
  } else {
    // Dimension mode: each wall has width + height
    for (const wall of walls) {
      const { widthM, heightM } = wall;
      if (!(widthM > 0) || !(heightM > 0)) continue;

      const grossM2 = widthM * heightM;
      const wallOps = (openings || []).filter(o => o.wallId === wall.id);
      const opM2    = wallOps.reduce((s, o) => {
        const w = o.widthM || 0, h = o.heightM || 0;
        return s + Math.min(w * h, grossM2);
      }, 0);
      const netM2 = Math.max(grossM2 - opM2, 0);

      const layout = calcBoardLayout({
        wallWidthM: widthM, boardCoverageM, battenWidthM,
        layoutMethod, leftMarginM: leftMarginM || 0,
        rightMarginM: rightMarginM || 0, includeEdgeBattens,
      });
      if (!layout) continue;

      const { boardCount, battenCount } = layout;
      const boardLM   = boardCount  * heightM;
      const battenLM  = battenCount * heightM;
      const boardS2   = boardCount  * boardCoverageM * heightM;
      const battenS2  = battenCount * (battenWidthM  || 0) * heightM;

      // Optimization runs (one per piece needed, including waste)
      const bWithW = Math.ceil(boardCount  * wB);
      const tWithW = Math.ceil(battenCount * wT);
      for (let i = 0; i < bWithW; i++) allBoardRunsM.push(heightM);
      for (let i = 0; i < tWithW; i++) allBattenRunsM.push(heightM);

      totalGrossM2  += grossM2;
      totalOpeningM2 += opM2;
      totalNetM2    += netM2;
      totalBoards   += boardCount;
      totalBattens  += battenCount;
      totalBoardLM  += boardLM;
      totalBattenLM += battenLM;
      totalBoardS2  += boardS2;
      totalBattenS2 += battenS2;

      perWall.push({
        wall, grossAreaM2: grossM2, openingAreaM2: opM2, netAreaM2: netM2,
        boardCount, battenCount, boardLM, battenLM, boardS2, battenS2,
        layout, wallOpenings: wallOps,
      });
    }
  }

  if (!perWall.length) return null;

  const boardsWithWaste  = Math.ceil(totalBoards  * wB);
  const battensWithWaste = Math.ceil(totalBattens * wT);
  const boardLFWithWaste  = totalBoardLM  * wB;
  const battenLFWithWaste = totalBattenLM * wT;

  const optimization = {
    boards:  optimizeRuns(allBoardRunsM,  stockM, optimizationMethod || "simple"),
    battens: optimizeRuns(allBattenRunsM, stockM, optimizationMethod || "simple"),
  };

  return {
    perWall, totalGrossM2, totalOpeningM2, totalNetM2,
    totalBoards, totalBattens, boardsWithWaste, battensWithWaste,
    totalBoardLM, totalBattenLM, boardLFWithWaste, battenLFWithWaste,
    totalBoardS2, totalBattenS2,
    optimization, stockLengthFt: parseFloat(stockLengthFt) || 10,
  };
}

// ── Trim estimator ─────────────────────────────────────────────────
export function calcTrim({ walls, openings, enabled, config, wastePct = 10 }) {
  if (!enabled) return null;
  const w     = 1 + (parseFloat(wastePct) || 10) / 100;
  const stockM = (parseFloat(config?.stockLengthFt) || 8) * 0.3048;

  const totalW    = walls.reduce((s, wl) => s + (wl.widthM  || 0), 0);
  const maxH      = Math.max(...walls.map(wl => wl.heightM || 0), 0);
  const doorOps   = (openings || []).filter(o => o.type === "door" || o.type === "garage_door");
  const windowOps = (openings || []).filter(o => o.type === "window");

  const items = {};
  const add = (key, label, linearM) => {
    if (!(linearM > 0)) return;
    items[key] = { label, linearM, linearFt: toLF(linearM), pieces: Math.ceil(linearM / stockM) };
  };

  if (config?.outsideCorner) add("outsideCorner", "Outside Corner Trim", (parseInt(config.outsideCornerCount) || 0) * maxH * w);
  if (config?.insideCorner)  add("insideCorner",  "Inside Corner Trim",  (parseInt(config.insideCornerCount)  || 0) * maxH * w);
  if (config?.baseTrim)      add("baseTrim",      "Base Trim",            totalW * w);
  if (config?.topTrim)       add("topTrim",        "Top / Cap Trim",       totalW * w);
  if (config?.doorTrim  && doorOps.length)   add("doorTrim",   "Door Trim",   doorOps.reduce((s, o)   => s + 2 * (o.widthM + o.heightM), 0) * w);
  if (config?.windowTrim && windowOps.length) add("windowTrim", "Window Trim", windowOps.reduce((s, o) => s + 2 * (o.widthM + o.heightM), 0) * w);
  if (config?.jTrim)         add("jTrim",         "J-Trim",               totalW * 2 * w);
  if (config?.starterStrip)  add("starterStrip",  "Starter Strip",        totalW * w);

  const totalLinearM  = Object.values(items).reduce((s, v) => s + v.linearM,  0);
  const totalPieces   = Object.values(items).reduce((s, v) => s + v.pieces,   0);
  const totalLinearFt = toLF(totalLinearM);

  return { items, totalLinearM, totalLinearFt, totalPieces, stockLengthFt: parseFloat(config?.stockLengthFt) || 8 };
}

// ── Fastener estimator ─────────────────────────────────────────────
export function calcFasteners({ result, wallHeights, config }) {
  if (!config?.enabled || !result) return null;

  const studM     = (parseFloat(config.studSpacingIn) || 16) * 0.0254;
  const pattern   = { single: 1, double: 2, triple: 3 }[config.pattern || "double"] || 2;
  const windMult  = { low: 1.0, medium: 1.25, high: 1.5 }[config.windZone || "medium"] || 1.25;
  const avgH      = wallHeights.length ? wallHeights.reduce((s, h) => s + h, 0) / wallHeights.length : 2.4384;
  const studs     = Math.ceil(avgH / studM) + 1;
  const fpb       = studs * pattern; // fasteners per board/batten

  const boardF    = Math.round(result.totalBoards  * fpb * windMult);
  const battenF   = Math.round(result.totalBattens * fpb * windMult);
  const total     = boardF + battenF;
  const wF        = 1 + (parseFloat(config.wastePct) || 5) / 100;
  const withWaste = Math.ceil(total * wF);
  const perBox    = parseInt(config.perBox) || 100;
  const boxes     = Math.ceil(withWaste / perBox);

  return {
    studsPerRun: studs, fastenersPerPiece: fpb,
    boardFasteners: boardF, battenFasteners: battenF,
    totalFasteners: total, withWaste, boxes,
    assumptions: { studSpacingIn: parseFloat(config.studSpacingIn) || 16, pattern: config.pattern || "double", windZone: config.windZone || "medium", perBox },
  };
}

// ── Paint / stain estimator ────────────────────────────────────────
export function calcPaint({ netAreaM2, config }) {
  if (!config?.enabled || !(netAreaM2 > 0)) return null;
  const rate = parseFloat(config.coverageRate) || 400;
  // Convert coverage rate to m²/L
  const coverageM2L = config.coverageUnit === "ft2_per_gal"
    ? (rate * 0.0929) / 3.78541
    : rate;
  if (!(coverageM2L > 0)) return null;

  const wF = 1 + (parseFloat(config.wastePct) || 5) / 100;
  const calc = (coats) => {
    const c = parseInt(coats) || 0;
    if (c <= 0) return null;
    const litres  = (netAreaM2 / coverageM2L) * c * wF;
    return { litres, gallons: litres / 3.78541, coats: c };
  };

  return {
    coverageM2L, netAreaM2,
    primer: calc(config.primerCoats),
    paint:  calc(config.paintCoats),
    stain:  calc(config.stainCoats),
  };
}
