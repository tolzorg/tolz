import { useState, useMemo, useRef } from "react";
import {
  BB_DIM_UNITS, BOARD_DATABASE, BATTEN_DATABASE, BOARD_PROFILES,
  OPENING_TYPES_BB, INSTALLATION_METHODS, STOCK_LENGTHS_FT, OPTIMIZATION_METHODS,
  toM, fromM, toLF, toFt2, fmt, valPos, valNonNeg, valPercent,
  calcEffectiveCoverageIn, calcBoardAndBatten, calcTrim, calcFasteners, calcPaint,
} from "../../../utils/boardAndBattenCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";
import BoardAndBattenDiagram from "./BoardAndBattenDiagram";

// ── Design tokens (match existing calculators) ─────────────────────
const LBL = {
  display: "block", fontFamily: "var(--font-display)", fontWeight: 600,
  fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: "0.07em", marginBottom: 7, userSelect: "none",
};
const INPUT = {
  width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 600,
  fontSize: 14, color: "var(--text-primary)", background: "var(--bg-white)",
  outline: "none", transition: "border-color var(--transition)", boxSizing: "border-box",
};
const SELECT = {
  ...INPUT, cursor: "pointer", appearance: "none", WebkitAppearance: "none",
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 34,
};
const TOGGLE_BTN = (active) => ({
  padding: "7px 16px", border: "1.5px solid", borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, cursor: "pointer",
  transition: "all var(--transition)",
  background: active ? "var(--accent)" : "var(--bg-white)",
  color: active ? "#fff" : "var(--text-primary)",
  borderColor: active ? "var(--accent)" : "var(--border)",
});
const RES_ROW = {
  display: "flex", justifyContent: "space-between", alignItems: "baseline",
  padding: "7px 0", borderBottom: "1px solid var(--border)",
};

// ── Shared UI primitives ───────────────────────────────────────────
function SectionCard({ id, title, icon, open, onToggle, children }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button onClick={() => onToggle(id)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "15px 20px", background: "none", border: "none",
        borderBottom: open ? "1px solid var(--border)" : "none",
        cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: 14, color: "var(--text-primary)", textAlign: "left",
      }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>{title}
        </span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ padding: "18px 20px" }}>{children}</div>}
    </div>
  );
}

function FG({ label, hint, error, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
      </div>
      {children}
      {error && <p style={{ fontSize: 11.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 5 }}>{error}</p>}
    </div>
  );
}

function NumUnit({ label, hint, value, onChange, unit, onUnitChange, units = BB_DIM_UNITS, error, placeholder = "0" }) {
  return (
    <FG label={label} hint={hint} error={error}>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" inputMode="decimal" min="0" step="any" value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={e => (e.target.style.borderColor = error ? "var(--error)" : "var(--accent)")}
          onBlur={e => (e.target.style.borderColor = error ? "var(--error)" : "var(--border)")}
          style={{ ...INPUT, flex: 1, borderColor: error ? "var(--error)" : "var(--border)" }} />
        <select value={unit} onChange={e => onUnitChange(e.target.value)} style={{ ...SELECT, width: 72 }}>
          {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>
    </FG>
  );
}

function ResRow({ label, value, unit, highlight }) {
  return (
    <div style={{ ...RES_ROW, background: highlight ? "var(--accent-light)" : "none", padding: highlight ? "8px 10px" : "7px 0", borderRadius: highlight ? "var(--radius-md)" : 0, borderBottom: highlight ? "none" : "1px solid var(--border)" }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: highlight ? "var(--accent)" : "var(--text-primary)", fontWeight: 700 }}>
        {value} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>{unit}</span>
      </span>
    </div>
  );
}

function ResSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid var(--accent-light)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ExBlock({ title, children }) {
  return (
    <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

// ── Price unit sets ────────────────────────────────────────────────
const PER_BOARD_UNITS = [
  { id: "perBoard", label: "per Board",       display: "board" },
  { id: "perLF",    label: "per Linear Foot", display: "LF"   },
  { id: "perLM",    label: "per Linear Meter",display: "LM"   },
];
const PAINT_PRICE_UNITS = [
  { id: "perGallon", label: "per Gallon", display: "gal" },
  { id: "perLitre",  label: "per Litre",  display: "L"   },
];
const TRIM_PRICE_UNITS = [
  { id: "perLF",    label: "per Linear Foot",  display: "LF"   },
  { id: "perLM",    label: "per Linear Meter", display: "LM"   },
  { id: "perPiece", label: "per Piece",         display: "piece" },
];
const FASTENER_PRICE_UNITS = [
  { id: "perBox",      label: "per Box",      display: "box"      },
  { id: "perFastener", label: "per Fastener", display: "fastener" },
];

// ── Default form ───────────────────────────────────────────────────
function defaultForm() {
  return {
    // Mode
    calcMode: "dimensions",
    areaInput: "", areaUnit: "ft",
    areaHeight: "10", areaHeightUnit: "ft",

    // Walls
    walls: [{ id: 1, name: "Wall 1", width: "24", height: "10", unit: "ft" }],

    // Openings
    openings: [],

    // Board
    boardId: "1x10",
    boardProfileId: "square_edge",
    customBoardActW: "", customBoardActT: "",
    customBoardNomW: "", customBoardNomT: "",
    customCoverageIn: "",
    coverageOverride: false, coverageOverrideIn: "",
    stockLengthFt: "10",

    // Batten
    battenId: "bat_1x2",
    customBattenActW: "", customBattenActT: "",
    includeEdgeBattens: false,

    // Layout
    layoutMethod: "equal_margins",
    leftMargin: "0", leftMarginUnit: "in",
    rightMargin: "0", rightMarginUnit: "in",

    // Optimization
    optimizationMethod: "simple",

    // Waste
    wasteBoards: "10",
    wasteBattens: "10",
    wasteTrim: "10",
    wasteFasteners: "5",
    wastePaint: "5",

    // Trim
    trimEnabled: false,
    trimOutsideCorner: false, trimOutsideCornerCount: "0",
    trimInsideCorner: false,  trimInsideCornerCount: "0",
    trimBase: true, trimTop: false,
    trimDoor: true, trimWindow: true,
    trimJTrim: false, trimStarter: false,
    trimStockLengthFt: "8",

    // Fasteners
    fastenerEnabled: false,
    studSpacingIn: "16", fastenerType: "screw",
    fastenerPattern: "double", windZone: "medium",
    fastenersPerBox: "100",

    // Paint
    paintEnabled: false,
    coverageRate: "400", coverageUnit: "ft2_per_gal",
    primerCoats: "1", paintCoats: "2", stainCoats: "0",
  };
}

// ── Main component ─────────────────────────────────────────────────
export default function BoardAndBattenCalculatorTool() {
  const [f, setF0] = useState(defaultForm);
  const setF = patch => setF0(prev => ({ ...prev, ...patch }));
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  const [open, setOpen0] = useState({
    setup: true, walls: true, openings: false,
    profile: true, boardOpts: true, battenOpts: true,
    layout: true, optimization: false, waste: false,
    trim: false, fasteners: false, paint: false,
    results: true, price: false, formulas: false, examples: false, notes: false,
  });
  const setOpen = id => setOpen0(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Resolved board / batten data ───────────────────────────────
  const board = BOARD_DATABASE.find(b => b.id === f.boardId);
  const batten = BATTEN_DATABASE.find(b => b.id === f.battenId);

  const boardActWIn = f.boardId === "custom"
    ? parseFloat(f.customBoardActW) || 0
    : board?.actW || 0;

  const battenActWIn = f.battenId === "bat_custom"
    ? parseFloat(f.customBattenActW) || 0
    : batten?.actW || 0;

  const effectiveCoverageIn = useMemo(() => {
    if (f.coverageOverride && parseFloat(f.coverageOverrideIn) > 0) return parseFloat(f.coverageOverrideIn);
    return calcEffectiveCoverageIn(boardActWIn, f.boardProfileId, f.customCoverageIn);
  }, [boardActWIn, f.boardProfileId, f.customCoverageIn, f.coverageOverride, f.coverageOverrideIn]);

  const boardCoverageM = effectiveCoverageIn * 0.0254;
  const battenWidthM   = battenActWIn * 0.0254;

  // ── Walls in meters ────────────────────────────────────────────
  const wallsM = useMemo(() => {
    if (f.calcMode === "area") {
      const aM2 = (() => {
        const v = parseFloat(f.areaInput);
        if (!isFinite(v) || v <= 0) return 0;
        const u = f.areaUnit === "ft" ? 0.0929 : f.areaUnit === "yd" ? 0.8361 : 1;
        return v * u;
      })();
      return [{ id: 1, name: "Total Area", widthM: 0, heightM: 0, areaM2: aM2 }];
    }
    return f.walls.map(w => ({
      ...w,
      widthM:  toM(w.width,  w.unit) || 0,
      heightM: toM(w.height, w.unit) || 0,
    }));
  }, [f.calcMode, f.areaInput, f.areaUnit, f.walls]);

  const openingsM = useMemo(() =>
    f.openings.map(o => ({
      ...o,
      widthM:   toM(o.width,  o.widthUnit)  || 0,
      heightM:  toM(o.height, o.heightUnit) || 0,
      offsetXM: toM(o.offsetX, o.widthUnit) || 0,
    }))
  , [f.openings]);

  const leftMarginM  = toM(f.leftMargin,  f.leftMarginUnit)  || 0;
  const rightMarginM = toM(f.rightMargin, f.rightMarginUnit) || 0;
  const areaHeightM  = toM(f.areaHeight,  f.areaHeightUnit)  || 0;

  // ── Main result ─────────────────────────────────────────────────
  const result = useMemo(() => {
    if (!(boardCoverageM > 0)) return null;
    const valid = f.calcMode === "area"
      ? wallsM.some(w => (w.areaM2 || 0) > 0)
      : wallsM.some(w => w.widthM > 0 && w.heightM > 0);
    if (!valid) return null;

    return calcBoardAndBatten({
      walls: wallsM, openings: openingsM,
      boardCoverageM, battenWidthM,
      layoutMethod: f.layoutMethod,
      leftMarginM, rightMarginM,
      includeEdgeBattens: f.includeEdgeBattens,
      wastePct: { boards: f.wasteBoards, battens: f.wasteBattens },
      stockLengthFt: f.stockLengthFt,
      optimizationMethod: f.optimizationMethod,
      calcMode: f.calcMode,
      areaHeightM,
    });
  }, [wallsM, openingsM, boardCoverageM, battenWidthM, f.layoutMethod,
      leftMarginM, rightMarginM, f.includeEdgeBattens, f.wasteBoards,
      f.wasteBattens, f.stockLengthFt, f.optimizationMethod, f.calcMode, areaHeightM]);

  // ── Trim result ─────────────────────────────────────────────────
  const trimResult = useMemo(() => calcTrim({
    walls: wallsM, openings: openingsM, enabled: f.trimEnabled,
    config: {
      outsideCorner: f.trimOutsideCorner, outsideCornerCount: f.trimOutsideCornerCount,
      insideCorner:  f.trimInsideCorner,  insideCornerCount:  f.trimInsideCornerCount,
      baseTrim: f.trimBase, topTrim: f.trimTop,
      doorTrim: f.trimDoor, windowTrim: f.trimWindow,
      jTrim: f.trimJTrim, starterStrip: f.trimStarter,
      stockLengthFt: f.trimStockLengthFt,
    },
    wastePct: f.wasteTrim,
  }), [wallsM, openingsM, f.trimEnabled, f.trimOutsideCorner, f.trimOutsideCornerCount, f.trimInsideCorner, f.trimInsideCornerCount, f.trimBase, f.trimTop, f.trimDoor, f.trimWindow, f.trimJTrim, f.trimStarter, f.trimStockLengthFt, f.wasteTrim]);

  // ── Fastener result ────────────────────────────────────────────
  const fastenerResult = useMemo(() => calcFasteners({
    result,
    wallHeights: wallsM.map(w => w.heightM || areaHeightM || 3).filter(Boolean),
    config: {
      enabled: f.fastenerEnabled, studSpacingIn: f.studSpacingIn,
      pattern: f.fastenerPattern, windZone: f.windZone,
      wastePct: f.wasteFasteners, perBox: f.fastenersPerBox,
    },
  }), [result, wallsM, areaHeightM, f.fastenerEnabled, f.studSpacingIn, f.fastenerPattern, f.windZone, f.wasteFasteners, f.fastenersPerBox]);

  // ── Paint result ───────────────────────────────────────────────
  const paintResult = useMemo(() => calcPaint({
    netAreaM2: result?.totalNetM2 || 0,
    config: {
      enabled: f.paintEnabled, coverageRate: f.coverageRate,
      coverageUnit: f.coverageUnit, primerCoats: f.primerCoats,
      paintCoats: f.paintCoats, stainCoats: f.stainCoats,
      wastePct: f.wastePaint,
    },
  }), [result, f.paintEnabled, f.coverageRate, f.coverageUnit, f.primerCoats, f.paintCoats, f.stainCoats, f.wastePaint]);

  // ── Wall helpers ───────────────────────────────────────────────
  function addWall() {
    const nextId = Math.max(...f.walls.map(w => w.id), 0) + 1;
    setF({ walls: [...f.walls, { id: nextId, name: `Wall ${nextId}`, width: "20", height: "10", unit: "ft" }] });
  }
  function removeWall(id) {
    if (f.walls.length <= 1) return;
    setF({ walls: f.walls.filter(w => w.id !== id), openings: f.openings.filter(o => o.wallId !== id) });
  }
  function updateWall(id, patch) {
    setF({ walls: f.walls.map(w => w.id === id ? { ...w, ...patch } : w) });
  }

  // ── Opening helpers ────────────────────────────────────────────
  function addOpening() {
    const id = Date.now();
    const wallId = f.walls[0]?.id || 1;
    setF({ openings: [...f.openings, { id, wallId, type: "window", width: "3", widthUnit: "ft", height: "4", heightUnit: "ft", offsetX: "5" }] });
  }
  function removeOpening(id) { setF({ openings: f.openings.filter(o => o.id !== id) }); }
  function updateOpening(id, patch) {
    setF({ openings: f.openings.map(o => o.id === id ? { ...o, ...patch } : o) });
  }

  // ── Copy results ───────────────────────────────────────────────
  function handleCopy() {
    if (!result) return;
    const lines = [
      "=== Board & Batten Calculator Results ===",
      `Board: ${board?.label || "Custom"} — ${board?.nomT}×${board?.nomW} nominal, actual ${boardActWIn}″ wide`,
      `Effective Coverage: ${effectiveCoverageIn}″  |  Batten: ${batten?.label || "Custom"} (${battenActWIn}″)`,
      "",
      `Gross Wall Area: ${fmt(toFt2(result.totalGrossM2))} ft²`,
      result.totalOpeningM2 > 0 ? `Opening Area: ${fmt(toFt2(result.totalOpeningM2))} ft²` : null,
      `Net Wall Area: ${fmt(toFt2(result.totalNetM2))} ft²`,
      "",
      `Total Boards (net): ${result.totalBoards}`,
      `Total Boards (w/ ${f.wasteBoards}% waste): ${result.boardsWithWaste}`,
      `Total Battens (net): ${result.totalBattens}`,
      `Total Battens (w/ ${f.wasteBattens}% waste): ${result.battensWithWaste}`,
      `Board Linear Feet: ${fmt(toLF(result.totalBoardLM))} LF`,
      `Batten Linear Feet: ${fmt(toLF(result.totalBattenLM))} LF`,
      trimResult ? `Trim Linear Feet: ${fmt(toLF(trimResult.totalLinearM))} LF` : null,
      fastenerResult ? `Fasteners (w/ waste): ${fastenerResult.withWaste}  (${fastenerResult.boxes} boxes)` : null,
      paintResult?.paint ? `Paint: ${fmt(paintResult.paint.gallons, 2)} gal (${paintResult.paint.coats} coats)` : null,
      "",
      "Generated by tolz.org Board & Batten Calculator",
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Price checker quantities ───────────────────────────────────
  const boardQty = result ? {
    perBoard: result.boardsWithWaste,
    perLF:    result.boardsWithWaste ? toLF(result.boardLFWithWaste) : null,
    perLM:    result.boardLFWithWaste || null,
  } : {};
  const battenQty = result ? {
    perBoard: result.battensWithWaste,
    perLF:    result.battensWithWaste ? toLF(result.battenLFWithWaste) : null,
    perLM:    result.battenLFWithWaste || null,
  } : {};
  const trimQty = trimResult ? {
    perLF:    trimResult.totalLinearFt || null,
    perLM:    trimResult.totalLinearM  || null,
    perPiece: trimResult.totalPieces   || null,
  } : {};
  const paintQty = paintResult?.paint ? {
    perGallon: paintResult.paint.gallons,
    perLitre:  paintResult.paint.litres,
  } : {};
  const primerQty = paintResult?.primer ? {
    perGallon: paintResult.primer.gallons,
    perLitre:  paintResult.primer.litres,
  } : {};
  const stainQty = paintResult?.stain ? {
    perGallon: paintResult.stain.gallons,
    perLitre:  paintResult.stain.litres,
  } : {};
  const fastenerQty = fastenerResult ? {
    perBox:      fastenerResult.boxes,
    perFastener: fastenerResult.withWaste,
  } : {};

  // ── First wall for diagram ─────────────────────────────────────
  const firstWall   = wallsM[0] || {};
  const firstWallOps = openingsM.filter(o => o.wallId === (f.walls[0]?.id || 1));

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="container" style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 60px" }}>

      {/* Disclaimer */}
      <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#92400e", margin: "0 0 4px" }}>
          ⚠️ Material Estimating Tool Only
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "#78350f", margin: 0, lineHeight: 1.6 }}>
          This calculator estimates material quantities and project costs only. Always measure walls carefully before ordering materials.
          Follow manufacturer installation instructions, local building codes, and product specifications. Consult a qualified professional for structural or code requirements.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ══ 1 · PROJECT SETUP ═══════════════════════════════════ */}
        <SectionCard id="setup" title="Project Setup" icon="🏗️" open={open.setup} onToggle={setOpen}>
          <div style={{ marginBottom: 20 }}>
            <label style={LBL}>Calculation Mode</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={TOGGLE_BTN(f.calcMode === "dimensions")} onClick={() => setF({ calcMode: "dimensions" })}>Wall Dimensions</button>
              <button style={TOGGLE_BTN(f.calcMode === "area")}       onClick={() => setF({ calcMode: "area" })}>Total Wall Area</button>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", marginTop: 8 }}>
              {f.calcMode === "dimensions"
                ? "Enter wall width and height. Supports multiple walls and openings."
                : "Enter total net wall area. Boards and battens are estimated from area directly."}
            </p>
          </div>

          {f.calcMode === "area" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FG label="Total Wall Area (sq ft or sq m)" hint="Net area to be covered by boards and battens" error={valPos(f.areaInput)}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" inputMode="decimal" min="0" step="any" value={f.areaInput} placeholder="240"
                    onChange={e => setF({ areaInput: e.target.value })} style={{ ...INPUT, flex: 1 }} />
                  <select value={f.areaUnit} onChange={e => setF({ areaUnit: e.target.value })} style={{ ...SELECT, width: 72 }}>
                    <option value="ft">ft²</option>
                    <option value="m">m²</option>
                    <option value="yd">yd²</option>
                  </select>
                </div>
              </FG>
              <NumUnit label="Representative Wall Height" hint="Used for stock length optimization"
                value={f.areaHeight} onChange={v => setF({ areaHeight: v })}
                unit={f.areaHeightUnit} onUnitChange={u => setF({ areaHeightUnit: u })} error={valPos(f.areaHeight)} />
            </div>
          )}
        </SectionCard>

        {/* ══ 2 · WALL GEOMETRY ═══════════════════════════════════ */}
        {f.calcMode === "dimensions" && (
          <SectionCard id="walls" title={`Wall Geometry (${f.walls.length} wall${f.walls.length > 1 ? "s" : ""})`} icon="📐" open={open.walls} onToggle={setOpen}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {f.walls.map((wall, idx) => (
                <div key={wall.id} style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)" }}>#{idx + 1}</span>
                      <input type="text" value={wall.name} onChange={e => updateWall(wall.id, { name: e.target.value })}
                        style={{ ...INPUT, width: 140, padding: "6px 10px", fontSize: 13 }} placeholder="Wall name" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select value={wall.unit} onChange={e => updateWall(wall.id, { unit: e.target.value })} style={{ ...SELECT, width: 72, fontSize: 12 }}>
                        {BB_DIM_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                      </select>
                      <button onClick={() => removeWall(wall.id)} disabled={f.walls.length <= 1}
                        style={{ padding: "7px 10px", background: "var(--bg-white)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", cursor: f.walls.length <= 1 ? "not-allowed" : "pointer", color: f.walls.length <= 1 ? "var(--text-muted)" : "var(--error)", opacity: f.walls.length <= 1 ? 0.4 : 1 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FG label="Width" error={valPos(wall.width)}>
                      <input type="number" inputMode="decimal" min="0" step="any" value={wall.width} placeholder="24"
                        onChange={e => updateWall(wall.id, { width: e.target.value })} style={INPUT} />
                    </FG>
                    <FG label="Height" error={valPos(wall.height)}>
                      <input type="number" inputMode="decimal" min="0" step="any" value={wall.height} placeholder="10"
                        onChange={e => updateWall(wall.id, { height: e.target.value })} style={INPUT} />
                    </FG>
                  </div>
                  {wall.widthM > 0 && wall.heightM > 0 && (() => {
                    const wm = toM(wall.width, wall.unit), hm = toM(wall.height, wall.unit);
                    if (!wm || !hm) return null;
                    return <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                      Area: {fmt(toFt2(wm * hm))} ft² = {fmt(wm * hm)} m²
                    </div>;
                  })()}
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={addWall} className="btn btn-secondary" style={{ fontSize: 13 }}>+ Add Wall</button>
                {f.walls.length > 1 && result && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                    Total: {fmt(toFt2(result.totalGrossM2))} ft²
                  </span>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══ 3 · OPENINGS ════════════════════════════════════════ */}
        <SectionCard id="openings" title={`Openings${f.openings.length > 0 ? ` (${f.openings.length})` : ""}`} icon="⬜" open={open.openings} onToggle={setOpen}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", marginBottom: 12 }}>
            Add doors, windows, or other openings to deduct their area from material calculations.
          </div>
          {f.openings.length === 0 && <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: 13 }}>No openings added.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {f.openings.map((op, idx) => (
              <div key={op.id} style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "var(--bg-muted)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", width: 20, flexShrink: 0 }}>#{idx + 1}</span>
                {f.walls.length > 1 && (
                  <div style={{ flex: "0 0 110px" }}>
                    <FG label="Wall">
                      <select value={op.wallId} onChange={e => updateOpening(op.id, { wallId: parseInt(e.target.value) })} style={{ ...SELECT, fontSize: 12, padding: "7px 28px 7px 9px" }}>
                        {f.walls.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </FG>
                  </div>
                )}
                <div style={{ flex: "0 0 120px" }}>
                  <FG label="Type">
                    <select value={op.type} onChange={e => updateOpening(op.id, { type: e.target.value })} style={{ ...SELECT, fontSize: 12, padding: "7px 28px 7px 9px" }}>
                      {OPENING_TYPES_BB.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </FG>
                </div>
                <div style={{ flex: 1, minWidth: 90 }}>
                  <NumUnit label="Width" value={op.width} onChange={v => updateOpening(op.id, { width: v })}
                    unit={op.widthUnit} onUnitChange={u => updateOpening(op.id, { widthUnit: u })}
                    units={BB_DIM_UNITS.filter(u => ["in","ft","cm","m"].includes(u.id))} error={valPos(op.width)} />
                </div>
                <div style={{ flex: 1, minWidth: 90 }}>
                  <NumUnit label="Height" value={op.height} onChange={v => updateOpening(op.id, { height: v })}
                    unit={op.heightUnit} onUnitChange={u => updateOpening(op.id, { heightUnit: u })}
                    units={BB_DIM_UNITS.filter(u => ["in","ft","cm","m"].includes(u.id))} error={valPos(op.height)} />
                </div>
                <button onClick={() => removeOpening(op.id)} style={{ padding: "10px 12px", background: "var(--bg-white)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--error)", flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addOpening} className="btn btn-secondary" style={{ fontSize: 13, marginTop: 12 }}>+ Add Opening</button>
          {openingsM.reduce((s, o) => s + o.widthM * o.heightM, 0) > 0 && (
            <div style={{ marginTop: 10, background: "var(--accent-light)", borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--accent)" }}>
              Total Opening Area: {fmt(toFt2(openingsM.reduce((s, o) => s + o.widthM * o.heightM, 0)))} ft²
            </div>
          )}
        </SectionCard>

        {/* ══ 4 · BOARD PROFILE ═══════════════════════════════════ */}
        <SectionCard id="profile" title="Board Profile" icon="🪵" open={open.profile} onToggle={setOpen}>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Profile Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BOARD_PROFILES.map(p => (
                <button key={p.id} style={TOGGLE_BTN(f.boardProfileId === p.id)} onClick={() => setF({ boardProfileId: p.id })}>{p.label}</button>
              ))}
            </div>
            {BOARD_PROFILES.find(p => p.id === f.boardProfileId) && (
              <div style={{ marginTop: 10, background: "var(--bg-muted)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                {BOARD_PROFILES.find(p => p.id === f.boardProfileId).desc}
              </div>
            )}
          </div>
          {f.boardProfileId === "custom" && (
            <FG label='Custom Effective Coverage (in)' hint="The exposed face width used for layout calculations">
              <input type="number" inputMode="decimal" min="0" step="0.125" value={f.customCoverageIn}
                onChange={e => setF({ customCoverageIn: e.target.value })} style={INPUT} placeholder="e.g. 8.5" />
            </FG>
          )}
          <div style={{ marginTop: 14 }}>
            <label style={LBL}>Manual Coverage Override</label>
            <button style={TOGGLE_BTN(f.coverageOverride)} onClick={() => setF({ coverageOverride: !f.coverageOverride })}>
              {f.coverageOverride ? "Override: ON" : "Override: OFF"}
            </button>
          </div>
          {f.coverageOverride && (
            <div style={{ marginTop: 12 }}>
              <FG label='Override Coverage Width (in)' hint="Overrides the profile formula entirely">
                <input type="number" inputMode="decimal" min="0.25" step="0.125" value={f.coverageOverrideIn}
                  onChange={e => setF({ coverageOverrideIn: e.target.value })} style={INPUT} placeholder="e.g. 9.0" />
              </FG>
            </div>
          )}
          {effectiveCoverageIn > 0 && (
            <div style={{ marginTop: 12, background: "var(--accent-light)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--accent)" }}>
              Effective Coverage = {fmt(effectiveCoverageIn, 3)}″ = {fmt(effectiveCoverageIn / 12, 4)} ft
            </div>
          )}
        </SectionCard>

        {/* ══ 5 · BOARD OPTIONS ═══════════════════════════════════ */}
        <SectionCard id="boardOpts" title="Board Options" icon="📏" open={open.boardOpts} onToggle={setOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FG label="Board Size" hint="Nominal size — actual manufactured dimensions are used for all calculations">
              <select value={f.boardId} onChange={e => setF({ boardId: e.target.value })} style={SELECT}>
                <optgroup label="1× Series (¾″ thick actual)">
                  {BOARD_DATABASE.filter(b => b.group === "1× Series").map(b => (
                    <option key={b.id} value={b.id}>{b.label} — actual {b.actW}″ wide</option>
                  ))}
                </optgroup>
                <optgroup label="2× Series (1½″ thick actual)">
                  {BOARD_DATABASE.filter(b => b.group === "2× Series").map(b => (
                    <option key={b.id} value={b.id}>{b.label} — actual {b.actW}″ wide</option>
                  ))}
                </optgroup>
                <optgroup label="Custom">
                  <option value="custom">Custom Board</option>
                </optgroup>
              </select>
            </FG>

            {f.boardId !== "custom" && board && (
              <div style={{ background: "var(--bg-muted)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                Nominal {board.nomT}×{board.nomW} → Actual {board.actT}″ thick × {board.actW}″ wide
                {" "}(nominal dimensions include ¼–½″ removed in milling)
              </div>
            )}

            {f.boardId === "custom" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <label style={{ ...LBL, fontSize: 10 }}>Actual Dimensions (required)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <FG label='Actual Width (in)' error={valPos(f.customBoardActW)}>
                      <input type="number" inputMode="decimal" value={f.customBoardActW}
                        onChange={e => setF({ customBoardActW: e.target.value })} style={INPUT} placeholder="9.25" />
                    </FG>
                    <FG label='Actual Thickness (in)'>
                      <input type="number" inputMode="decimal" value={f.customBoardActT}
                        onChange={e => setF({ customBoardActT: e.target.value })} style={INPUT} placeholder="0.75" />
                    </FG>
                  </div>
                  {parseFloat(f.customBoardActW) > 0 && parseFloat(f.customBoardActT) > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                      Face area: {fmt(parseFloat(f.customBoardActW) * parseFloat(f.customBoardActT), 3)} in²
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ ...LBL, fontSize: 10, color: "#9ca3af" }}>Nominal Size (optional, display only)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <FG label='Nominal Width (in)'>
                      <input type="number" inputMode="decimal" value={f.customBoardNomW}
                        onChange={e => setF({ customBoardNomW: e.target.value })} style={INPUT} placeholder="10" />
                    </FG>
                    <FG label='Nominal Thickness (in)'>
                      <input type="number" inputMode="decimal" value={f.customBoardNomT}
                        onChange={e => setF({ customBoardNomT: e.target.value })} style={INPUT} placeholder="1" />
                    </FG>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FG label="Stock Length" hint="Available board lengths at the lumber yard">
                <select value={f.stockLengthFt} onChange={e => setF({ stockLengthFt: e.target.value })} style={SELECT}>
                  {STOCK_LENGTHS_FT.map(l => <option key={l} value={l}>{l} ft ({(l * 0.3048).toFixed(2)} m)</option>)}
                </select>
              </FG>
              <FG label="Board Waste %" hint="Extra material to cover cuts and defects">
                <input type="number" inputMode="decimal" value={f.wasteBoards} min="0" max="100"
                  onChange={e => setF({ wasteBoards: e.target.value })} style={INPUT} />
              </FG>
            </div>
          </div>
        </SectionCard>

        {/* ══ 6 · BATTEN OPTIONS ══════════════════════════════════ */}
        <SectionCard id="battenOpts" title="Batten Options" icon="📌" open={open.battenOpts} onToggle={setOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FG label="Batten Size" hint="Narrower boards placed between (and optionally at edges of) the main boards">
              <select value={f.battenId} onChange={e => setF({ battenId: e.target.value })} style={SELECT}>
                <optgroup label="1× Series">
                  {BATTEN_DATABASE.filter(b => b.group === "1× Series").map(b => (
                    <option key={b.id} value={b.id}>{b.label} — actual {b.actW}″</option>
                  ))}
                </optgroup>
                <optgroup label="2× Series">
                  {BATTEN_DATABASE.filter(b => b.group === "2× Series").map(b => (
                    <option key={b.id} value={b.id}>{b.label} — actual {b.actW}″</option>
                  ))}
                </optgroup>
                <optgroup label="Custom">
                  <option value="bat_custom">Custom Batten</option>
                </optgroup>
              </select>
            </FG>

            {f.battenId === "bat_custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                <FG label='Actual Width (in)' error={valPos(f.customBattenActW)}>
                  <input type="number" inputMode="decimal" value={f.customBattenActW}
                    onChange={e => setF({ customBattenActW: e.target.value })} style={INPUT} placeholder="1.5" />
                </FG>
                <FG label='Actual Thickness (in)'>
                  <input type="number" inputMode="decimal" value={f.customBattenActT}
                    onChange={e => setF({ customBattenActT: e.target.value })} style={INPUT} placeholder="0.75" />
                </FG>
              </div>
            )}

            <div>
              <label style={LBL}>Edge Battens</label>
              <button style={TOGGLE_BTN(f.includeEdgeBattens)} onClick={() => setF({ includeEdgeBattens: !f.includeEdgeBattens })}>
                {f.includeEdgeBattens ? "Edge Battens: ON (at both wall edges)" : "Edge Battens: OFF (between boards only)"}
              </button>
            </div>

            <FG label="Batten Waste %">
              <input type="number" inputMode="decimal" value={f.wasteBattens} min="0" max="100"
                onChange={e => setF({ wasteBattens: e.target.value })} style={INPUT} />
            </FG>

            {battenActWIn > 0 && boardActWIn > 0 && (
              <div style={{ background: "var(--bg-muted)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                Board {effectiveCoverageIn}″ + Batten {battenActWIn}″ = {fmt(effectiveCoverageIn + battenActWIn, 3)}″ repeat unit
              </div>
            )}
          </div>
        </SectionCard>

        {/* ══ 7 · LAYOUT METHOD ═══════════════════════════════════ */}
        <SectionCard id="layout" title="Layout Method" icon="📐" open={open.layout} onToggle={setOpen}>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Installation Method</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {INSTALLATION_METHODS.map(m => (
                <button key={m.id} style={TOGGLE_BTN(f.layoutMethod === m.id)} onClick={() => setF({ layoutMethod: m.id })}>{m.label}</button>
              ))}
            </div>
            <div style={{ marginTop: 10, background: "var(--bg-muted)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {INSTALLATION_METHODS.find(m => m.id === f.layoutMethod)?.desc}
            </div>
          </div>

          {f.layoutMethod === "fixed_margins" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <NumUnit label="Left Margin" hint="Space at the left wall edge before the first board"
                value={f.leftMargin} onChange={v => setF({ leftMargin: v })}
                unit={f.leftMarginUnit} onUnitChange={u => setF({ leftMarginUnit: u })}
                units={BB_DIM_UNITS.filter(u => ["in","ft","cm","m"].includes(u.id))} />
              <NumUnit label="Right Margin" hint="Space at the right wall edge after the last board"
                value={f.rightMargin} onChange={v => setF({ rightMargin: v })}
                unit={f.rightMarginUnit} onUnitChange={u => setF({ rightMarginUnit: u })}
                units={BB_DIM_UNITS.filter(u => ["in","ft","cm","m"].includes(u.id))} />
            </div>
          )}

          {result?.perWall?.[0] && (
            <div style={{ marginTop: 14, background: "var(--accent-light)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Boards</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{result.perWall[0].boardCount}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Battens</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{result.perWall[0].battenCount}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Margin</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                    {fmt(result.perWall[0].layout.leftMarginM * 39.3701, 2)}″
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ══ 8 · MATERIAL OPTIMIZATION ═══════════════════════════ */}
        <SectionCard id="optimization" title="Material Optimization" icon="♻️" open={open.optimization} onToggle={setOpen}>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Optimization Method</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {OPTIMIZATION_METHODS.map(m => (
                <button key={m.id} style={TOGGLE_BTN(f.optimizationMethod === m.id)} onClick={() => setF({ optimizationMethod: m.id })}>{m.label}</button>
              ))}
            </div>
            <div style={{ background: "var(--bg-muted)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {OPTIMIZATION_METHODS.find(m => m.id === f.optimizationMethod)?.desc}
            </div>
          </div>
          {result?.optimization && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Board Stock Pieces", v: result.optimization.boards.pieces },
                { label: "Board Linear Purchased", v: fmt(toLF(result.optimization.boards.totalPurchasedM)), u: "LF" },
                { label: "Board Linear Used",      v: fmt(toLF(result.optimization.boards.totalUsedM)),      u: "LF" },
                { label: "Board Waste",            v: `${fmt(toLF(result.optimization.boards.wasteM))} LF (${fmt(result.optimization.boards.wastePct)}%)` },
                { label: "Batten Stock Pieces",    v: result.optimization.battens.pieces },
                { label: "Batten Waste",           v: `${fmt(toLF(result.optimization.battens.wasteM))} LF (${fmt(result.optimization.battens.wastePct)}%)` },
              ].map((row, i) => <ResRow key={i} label={row.label} value={row.v} unit={row.u || ""} />)}
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)", marginTop: 6 }}>
                ⓘ Optimization is an estimate. Does not replace professional cut planning. Stock length: {f.stockLengthFt} ft.
              </div>
            </div>
          )}
        </SectionCard>

        {/* ══ SVG DIAGRAM ═════════════════════════════════════════ */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span><span style={{ marginRight: 8 }}>📊</span>Wall Layout Preview{f.walls.length > 1 ? " — Wall 1" : ""}</span>
            {result?.perWall?.[0] && (
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                {result.perWall[0].boardCount} boards · {result.perWall[0].battenCount} battens
              </span>
            )}
          </div>
          <BoardAndBattenDiagram
            result={result}
            wallIdx={0}
            wallWidthM={firstWall.widthM || (f.calcMode === "area" ? Math.sqrt(wallsM[0]?.areaM2 || 22) : 7.3152)}
            wallHeightM={firstWall.heightM || areaHeightM || 3.048}
            openings={firstWallOps}
          />
        </div>

        {/* ══ 9 · TRIM ESTIMATOR ══════════════════════════════════ */}
        <SectionCard id="trim" title="Trim Estimator (Optional)" icon="🔲" open={open.trim} onToggle={setOpen}>
          <div style={{ marginBottom: 16 }}>
            <button style={TOGGLE_BTN(f.trimEnabled)} onClick={() => setF({ trimEnabled: !f.trimEnabled })}>
              {f.trimEnabled ? "Trim: ENABLED" : "Trim: DISABLED"}
            </button>
          </div>
          {f.trimEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LBL}>Trim Types</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { key: "trimBase",          label: "Base Trim" },
                    { key: "trimTop",           label: "Top / Cap Trim" },
                    { key: "trimDoor",          label: "Door Trim" },
                    { key: "trimWindow",        label: "Window Trim" },
                    { key: "trimJTrim",         label: "J-Trim" },
                    { key: "trimStarter",       label: "Starter Strip" },
                  ].map(item => (
                    <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 13, cursor: "pointer", padding: "8px 10px", background: f[item.key] ? "var(--accent-light)" : "var(--bg-muted)", borderRadius: "var(--radius-md)", border: `1px solid ${f[item.key] ? "var(--accent)" : "var(--border)"}` }}>
                      <input type="checkbox" checked={f[item.key]} onChange={e => setF({ [item.key]: e.target.checked })} />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 13, cursor: "pointer", padding: "8px 10px", background: f.trimOutsideCorner ? "var(--accent-light)" : "var(--bg-muted)", borderRadius: "var(--radius-md)", border: `1px solid ${f.trimOutsideCorner ? "var(--accent)" : "var(--border)"}`, marginBottom: 8 }}>
                    <input type="checkbox" checked={f.trimOutsideCorner} onChange={e => setF({ trimOutsideCorner: e.target.checked })} />
                    Outside Corner Trim
                  </label>
                  {f.trimOutsideCorner && (
                    <FG label="Outside Corners (count)">
                      <input type="number" min="0" value={f.trimOutsideCornerCount} onChange={e => setF({ trimOutsideCornerCount: e.target.value })} style={INPUT} />
                    </FG>
                  )}
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 13, cursor: "pointer", padding: "8px 10px", background: f.trimInsideCorner ? "var(--accent-light)" : "var(--bg-muted)", borderRadius: "var(--radius-md)", border: `1px solid ${f.trimInsideCorner ? "var(--accent)" : "var(--border)"}`, marginBottom: 8 }}>
                    <input type="checkbox" checked={f.trimInsideCorner} onChange={e => setF({ trimInsideCorner: e.target.checked })} />
                    Inside Corner Trim
                  </label>
                  {f.trimInsideCorner && (
                    <FG label="Inside Corners (count)">
                      <input type="number" min="0" value={f.trimInsideCornerCount} onChange={e => setF({ trimInsideCornerCount: e.target.value })} style={INPUT} />
                    </FG>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FG label="Stock Length (ft)">
                  <select value={f.trimStockLengthFt} onChange={e => setF({ trimStockLengthFt: e.target.value })} style={SELECT}>
                    {STOCK_LENGTHS_FT.map(l => <option key={l} value={l}>{l} ft</option>)}
                  </select>
                </FG>
                <FG label="Trim Waste %">
                  <input type="number" inputMode="decimal" value={f.wasteTrim} min="0" max="100"
                    onChange={e => setF({ wasteTrim: e.target.value })} style={INPUT} />
                </FG>
              </div>

              {trimResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {Object.values(trimResult.items).map((item, i) => (
                    <ResRow key={i} label={item.label} value={`${fmt(item.linearFt)} LF`} unit={`(${item.pieces} pcs)`} />
                  ))}
                  <ResRow highlight label="Total Trim" value={`${fmt(trimResult.totalLinearFt)} LF`} unit={`(${trimResult.totalPieces} pcs)`} />
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ══ 10 · FASTENER ESTIMATOR ═════════════════════════════ */}
        <SectionCard id="fasteners" title="Fastener Estimator (Optional)" icon="🔩" open={open.fasteners} onToggle={setOpen}>
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400e", fontFamily: "var(--font-display)", fontWeight: 500 }}>
            ⚠️ Fastener quantities are estimates only. Structural fastener requirements must be determined by a qualified professional.
          </div>
          <div style={{ marginBottom: 14 }}>
            <button style={TOGGLE_BTN(f.fastenerEnabled)} onClick={() => setF({ fastenerEnabled: !f.fastenerEnabled })}>
              {f.fastenerEnabled ? "Fasteners: ENABLED" : "Fasteners: DISABLED"}
            </button>
          </div>
          {f.fastenerEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FG label="Stud Spacing (OC)" hint="On-center stud spacing in the wall framing">
                  <select value={f.studSpacingIn} onChange={e => setF({ studSpacingIn: e.target.value })} style={SELECT}>
                    <option value="12">12″ OC</option>
                    <option value="16">16″ OC (Default)</option>
                    <option value="19.2">19.2″ OC</option>
                    <option value="24">24″ OC</option>
                  </select>
                </FG>
                <FG label="Fastener Type">
                  <select value={f.fastenerType} onChange={e => setF({ fastenerType: e.target.value })} style={SELECT}>
                    <option value="nail">Nail</option>
                    <option value="screw">Screw</option>
                  </select>
                </FG>
                <FG label="Fastener Pattern">
                  <select value={f.fastenerPattern} onChange={e => setF({ fastenerPattern: e.target.value })} style={SELECT}>
                    <option value="single">Single (1 per stud)</option>
                    <option value="double">Double (2 per stud)</option>
                    <option value="triple">Triple (3 per stud)</option>
                  </select>
                </FG>
                <FG label="Wind Zone" hint="Higher wind zones require more fasteners per local code">
                  <select value={f.windZone} onChange={e => setF({ windZone: e.target.value })} style={SELECT}>
                    <option value="low">Low (×1.0)</option>
                    <option value="medium">Medium (×1.25)</option>
                    <option value="high">High (×1.5)</option>
                  </select>
                </FG>
                <FG label="Fasteners per Box">
                  <input type="number" min="1" value={f.fastenersPerBox}
                    onChange={e => setF({ fastenersPerBox: e.target.value })} style={INPUT} />
                </FG>
                <FG label="Fastener Waste %">
                  <input type="number" inputMode="decimal" value={f.wasteFasteners} min="0" max="100"
                    onChange={e => setF({ wasteFasteners: e.target.value })} style={INPUT} />
                </FG>
              </div>

              {fastenerResult && (
                <div>
                  <ResRow label="Fasteners — Boards"         value={fastenerResult.boardFasteners}  unit="" />
                  <ResRow label="Fasteners — Battens"        value={fastenerResult.battenFasteners} unit="" />
                  <ResRow label="Total Fasteners (net)"      value={fastenerResult.totalFasteners}  unit="" />
                  <ResRow highlight label={`Total w/ ${f.wasteFasteners}% Waste`} value={fastenerResult.withWaste} unit="" />
                  <ResRow label="Boxes Required"             value={fastenerResult.boxes}           unit={`(${f.fastenersPerBox}/box)`} />
                  <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                    Assumptions: {fastenerResult.assumptions.studSpacingIn}″ OC · {fastenerResult.assumptions.pattern} pattern · {fastenerResult.assumptions.windZone} wind zone
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ══ 11 · PAINT / STAIN ══════════════════════════════════ */}
        <SectionCard id="paint" title="Paint / Primer / Stain Estimator (Optional)" icon="🎨" open={open.paint} onToggle={setOpen}>
          <div style={{ marginBottom: 14 }}>
            <button style={TOGGLE_BTN(f.paintEnabled)} onClick={() => setF({ paintEnabled: !f.paintEnabled })}>
              {f.paintEnabled ? "Paint Estimator: ENABLED" : "Paint Estimator: DISABLED"}
            </button>
          </div>
          {f.paintEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FG label="Coverage Rate" hint="Manufacturer's stated coverage for one coat">
                  <input type="number" inputMode="decimal" value={f.coverageRate}
                    onChange={e => setF({ coverageRate: e.target.value })} style={INPUT} placeholder="400" />
                </FG>
                <FG label="Coverage Unit">
                  <select value={f.coverageUnit} onChange={e => setF({ coverageUnit: e.target.value })} style={SELECT}>
                    <option value="ft2_per_gal">ft² per gallon</option>
                    <option value="m2_per_l">m² per litre</option>
                  </select>
                </FG>
                <FG label="Primer Coats">
                  <input type="number" min="0" max="5" value={f.primerCoats}
                    onChange={e => setF({ primerCoats: e.target.value })} style={INPUT} />
                </FG>
                <FG label="Paint Coats">
                  <input type="number" min="0" max="5" value={f.paintCoats}
                    onChange={e => setF({ paintCoats: e.target.value })} style={INPUT} />
                </FG>
                <FG label="Stain Coats">
                  <input type="number" min="0" max="5" value={f.stainCoats}
                    onChange={e => setF({ stainCoats: e.target.value })} style={INPUT} />
                </FG>
                <FG label="Paint Waste %">
                  <input type="number" inputMode="decimal" value={f.wastePaint} min="0" max="100"
                    onChange={e => setF({ wastePaint: e.target.value })} style={INPUT} />
                </FG>
              </div>
              {paintResult && (
                <div>
                  <ResRow label="Net Paintable Area" value={fmt(toFt2(paintResult.netAreaM2))} unit="ft²" />
                  {paintResult.primer && <ResRow label={`Primer (${paintResult.primer.coats} coat${paintResult.primer.coats > 1 ? "s" : ""})`} value={fmt(paintResult.primer.gallons, 2)} unit="gal" />}
                  {paintResult.paint  && <ResRow highlight label={`Paint (${paintResult.paint.coats} coats)`} value={fmt(paintResult.paint.gallons, 2)} unit="gal" />}
                  {paintResult.stain  && <ResRow label={`Stain (${paintResult.stain.coats} coats)`} value={fmt(paintResult.stain.gallons, 2)} unit="gal" />}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ══ 12 · RESULTS ════════════════════════════════════════ */}
        <SectionCard id="results" title="Material Summary" icon="📋" open={open.results} onToggle={setOpen}>
          {!result ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: 13 }}>Enter wall dimensions above to see results.</p>
          ) : (
            <div>
              <ResSection title="Wall Areas">
                <ResRow label="Gross Wall Area" value={fmt(toFt2(result.totalGrossM2))}   unit="ft²" />
                <ResRow label="Gross Wall Area" value={fmt(result.totalGrossM2)}           unit="m²" />
                {result.totalOpeningM2 > 0 && <ResRow label="Opening Area" value={fmt(toFt2(result.totalOpeningM2))} unit="ft²" />}
                <ResRow highlight label="Net Wall Area" value={fmt(toFt2(result.totalNetM2))} unit="ft²" />
                <ResRow label="Net Wall Area"           value={fmt(result.totalNetM2)}         unit="m²" />
              </ResSection>

              <ResSection title="Boards">
                <ResRow label="Boards (net count)"      value={result.totalBoards}                             unit="" />
                <ResRow highlight label={`Boards (w/ ${f.wasteBoards}% waste)`} value={result.boardsWithWaste} unit="boards" />
                <ResRow label="Board Linear Feet (net)" value={fmt(toLF(result.totalBoardLM))}                unit="LF" />
                <ResRow label="Board Linear Feet (w/ waste)" value={fmt(toLF(result.boardLFWithWaste))}       unit="LF" />
                <ResRow label="Board Surface Area"      value={fmt(toFt2(result.totalBoardS2))}               unit="ft²" />
              </ResSection>

              <ResSection title="Battens">
                <ResRow label="Battens (net count)"     value={result.totalBattens}                            unit="" />
                <ResRow highlight label={`Battens (w/ ${f.wasteBattens}% waste)`} value={result.battensWithWaste} unit="battens" />
                <ResRow label="Batten Linear Feet (net)" value={fmt(toLF(result.totalBattenLM))}              unit="LF" />
                <ResRow label="Batten Linear Feet (w/ waste)" value={fmt(toLF(result.battenLFWithWaste))}     unit="LF" />
              </ResSection>

              <ResSection title="Stock Optimization">
                <ResRow label="Method"                  value={OPTIMIZATION_METHODS.find(m => m.id === f.optimizationMethod)?.label || ""} unit="" />
                <ResRow label="Board Stock Pieces"      value={result.optimization.boards.pieces}              unit={`@ ${f.stockLengthFt} ft`} />
                <ResRow label="Board Waste"             value={`${fmt(toLF(result.optimization.boards.wasteM))} LF`} unit={`(${fmt(result.optimization.boards.wastePct)}%)`} />
                <ResRow label="Batten Stock Pieces"     value={result.optimization.battens.pieces}             unit={`@ ${f.stockLengthFt} ft`} />
                <ResRow label="Batten Waste"            value={`${fmt(toLF(result.optimization.battens.wasteM))} LF`} unit={`(${fmt(result.optimization.battens.wastePct)}%)`} />
              </ResSection>

              {f.walls.length > 1 && (
                <ResSection title="Per Wall Breakdown">
                  {result.perWall.map((pw, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: "8px 10px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{pw.wall.name}</div>
                      <div style={{ fontSize: 12, fontFamily: "var(--font-display)", color: "var(--text-muted)" }}>
                        {fmt(toFt2(pw.grossAreaM2))} ft² · {pw.boardCount} boards · {pw.battenCount} battens · {fmt(toLF(pw.boardLM))} LF boards
                      </div>
                    </div>
                  ))}
                </ResSection>
              )}

              {trimResult && (
                <ResSection title="Trim">
                  {Object.values(trimResult.items).map((item, i) => (
                    <ResRow key={i} label={item.label} value={fmt(item.linearFt)} unit="LF" />
                  ))}
                  <ResRow highlight label="Total Trim" value={fmt(trimResult.totalLinearFt)} unit="LF" />
                </ResSection>
              )}

              {fastenerResult && (
                <ResSection title="Fasteners">
                  <ResRow label="Board Fasteners"          value={fastenerResult.boardFasteners}  unit="" />
                  <ResRow label="Batten Fasteners"         value={fastenerResult.battenFasteners} unit="" />
                  <ResRow highlight label="Total (w/ waste)" value={fastenerResult.withWaste}     unit="" />
                  <ResRow label="Boxes Required"           value={fastenerResult.boxes}           unit="" />
                </ResSection>
              )}

              {paintResult && (
                <ResSection title="Coatings">
                  <ResRow label="Paintable Area"    value={fmt(toFt2(paintResult.netAreaM2))} unit="ft²" />
                  {paintResult.primer && <ResRow label={`Primer (${paintResult.primer.coats} coat${paintResult.primer.coats > 1 ? "s" : ""})`} value={fmt(paintResult.primer.gallons, 2)} unit="gal" />}
                  {paintResult.paint  && <ResRow highlight label={`Paint (${paintResult.paint.coats} coats)`} value={fmt(paintResult.paint.gallons, 2)} unit="gal" />}
                  {paintResult.stain  && <ResRow label={`Stain (${paintResult.stain.coats} coats)`}           value={fmt(paintResult.stain.gallons, 2)} unit="gal" />}
                </ResSection>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: 13, padding: "9px 18px", background: copied ? "#f0fdf4" : undefined, color: copied ? "#16a34a" : undefined }}>
                  {copied ? "✓ Copied!" : "📋 Copy Results"}
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ fontSize: 13, padding: "9px 18px" }}>
                  🖨️ Print Estimate
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ══ 13 · PRICE CHECKER ══════════════════════════════════ */}
        <SectionCard id="price" title="Price Checker / Cost Estimator" icon="💰" open={open.price} onToggle={setOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Boards</div>
              <PriceCheckerCard quantities={boardQty} priceUnits={PER_BOARD_UNITS} defaultPriceUnit="perBoard" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Battens</div>
              <PriceCheckerCard quantities={battenQty} priceUnits={PER_BOARD_UNITS} defaultPriceUnit="perBoard" />
            </div>
            {trimResult && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Trim</div>
                <PriceCheckerCard quantities={trimQty} priceUnits={TRIM_PRICE_UNITS} defaultPriceUnit="perLF" />
              </div>
            )}
            {fastenerResult && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Fasteners</div>
                <PriceCheckerCard quantities={fastenerQty} priceUnits={FASTENER_PRICE_UNITS} defaultPriceUnit="perBox" />
              </div>
            )}
            {paintResult?.primer && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Primer</div>
                <PriceCheckerCard quantities={primerQty} priceUnits={PAINT_PRICE_UNITS} defaultPriceUnit="perGallon" />
              </div>
            )}
            {paintResult?.paint && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Paint</div>
                <PriceCheckerCard quantities={paintQty} priceUnits={PAINT_PRICE_UNITS} defaultPriceUnit="perGallon" />
              </div>
            )}
            {paintResult?.stain && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Stain</div>
                <PriceCheckerCard quantities={stainQty} priceUnits={PAINT_PRICE_UNITS} defaultPriceUnit="perGallon" />
              </div>
            )}
          </div>
        </SectionCard>

        {/* ══ 14 · FORMULAS ═══════════════════════════════════════ */}
        <SectionCard id="formulas" title="Formulas & Engineering Methods" icon="📐" open={open.formulas} onToggle={setOpen}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Gross Wall Area</strong>
              <p style={{ margin: "6px 0 0" }}>Gross Area = Σ (Wall Width × Wall Height) for all wall sections.</p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Opening Area &amp; Net Wall Area</strong>
              <p style={{ margin: "6px 0 0" }}>
                Opening Area = Σ (Opening Width × Opening Height)<br />
                Net Wall Area = Gross Area − Opening Area
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Effective Coverage Width</strong>
              <p style={{ margin: "6px 0 0" }}>
                North American lumber is sold by <em>nominal</em> size but cut to smaller <em>actual</em> dimensions.
                A "1×10" board is actually ¾″ thick and 9¼″ wide. The effective coverage width depends on the profile:<br /><br />
                Square Edge: Coverage = Actual Width (9¼″)<br />
                Shiplap: Coverage = Actual Width − ½″ overlap<br />
                Tongue &amp; Groove: Coverage = Actual Width − ⅜″ tongue<br />
                Bevel Siding: Coverage = Actual Width − 1″ (bevel exposure)<br />
                Channel Rustic: Coverage = Actual Width − ½″<br />
                Custom Profile: User-defined coverage width
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Board Layout Algorithm</strong>
              <p style={{ margin: "6px 0 0" }}>
                Let: B = board coverage width, T = batten width, W = available wall width<br /><br />
                <em>Without edge battens:</em><br />
                n = ⌊(W + T) / (B + T)⌋ boards, (n−1) battens<br />
                Used = n×B + (n−1)×T, Remaining = W − Used<br /><br />
                <em>With edge battens:</em><br />
                n = ⌊(W − T) / (B + T)⌋ boards, (n+1) battens<br /><br />
                Margin distribution by layout method:<br />
                Flush Start: leftMargin = 0, rightMargin = Remaining<br />
                Equal / Centered: leftMargin = rightMargin = Remaining / 2<br />
                Fixed Margins: margins set by user, n recalculated within available space
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Material Optimization</strong>
              <p style={{ margin: "6px 0 0" }}>
                <em>Simple Length Rounding:</em> Each board/batten run is rounded up to the next available stock length independently.
                Pieces needed = Σ ⌈run_height / stock_length⌉ per piece.<br /><br />
                <em>Greedy Cut Optimization (First-Fit Decreasing):</em><br />
                1. Sort all runs longest to shortest.<br />
                2. For each run: fit into any open stock piece with sufficient remaining space.<br />
                3. If no piece fits, open a new stock piece.<br />
                This packs multiple shorter runs into a single piece when possible, reducing waste significantly for shorter walls.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Paint / Primer / Stain</strong>
              <p style={{ margin: "6px 0 0" }}>
                Volume (litres) = (Net Wall Area / Coverage Rate) × Coats × (1 + Waste%)<br />
                Coverage Rate is converted to m²/L internally for consistency.<br />
                400 ft²/gal = 9.81 m²/L. Net wall area (not gross) is used — only exposed surfaces are painted.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Fastener Estimation</strong>
              <p style={{ margin: "6px 0 0" }}>
                Studs per run = ⌈Wall Height / Stud Spacing⌉ + 1<br />
                Fasteners per board = Studs × Pattern count (1/2/3)<br />
                Total = (Boards × fpb + Battens × fpb) × Wind Zone Multiplier<br />
                Wind zone multipliers: Low = 1.0×, Medium = 1.25×, High = 1.5×<br />
                <span style={{ color: "#92400e", fontWeight: 600 }}>This is an estimate only — structural fastening must be designed by a professional.</span>
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Trim Estimation</strong>
              <p style={{ margin: "6px 0 0" }}>
                Base / Top Trim = Total wall width × (1 + waste%)<br />
                Corner Trim = Count × Max wall height × (1 + waste%)<br />
                Door Trim = 2 × (Door Width + Door Height) per opening × (1 + waste%)<br />
                Window Trim = 2 × (Window Width + Window Height) per opening × (1 + waste%)<br />
                Pieces = ⌈Total Linear / Stock Length⌉
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ══ 15 · VERIFIED EXAMPLES ══════════════════════════════ */}
        <SectionCard id="examples" title="Verified Examples" icon="📖" open={open.examples} onToggle={setOpen}>
          <ExBlock title="Example 1 — Single Wall with Openings">
            <p>Wall: 24 ft × 10 ft = 240 ft²</p>
            <p>1 Door: 3 ft × 7 ft = 21 ft². 2 Windows: 3 ft × 4 ft = 12 ft² each</p>
            <p>Opening Area = 21 + 12 + 12 = <strong>45 ft²</strong> | Net Area = 240 − 45 = <strong>195 ft²</strong></p>
            <p>Board: 1×10 (actual 9.25″), Square Edge profile → Coverage = 9.25″</p>
            <p>Batten: 1×2 (actual 1.5″)</p>
            <p>Repeat unit = 9.25 + 1.5 = 10.75″. Boards = ⌊(288 + 1.5) / 10.75⌋ = ⌊26.93⌋ = <strong>26 boards</strong></p>
            <p>Battens = 26 − 1 = <strong>25 battens</strong> (no edge battens)</p>
            <p>Board LF = 26 × 10 = 260 LF | With 10% waste = 286 LF → <strong>29 pieces @10 ft</strong></p>
            <p>Batten LF = 25 × 10 = 250 LF | With 10% waste = 275 LF → <strong>28 pieces @10 ft</strong></p>
            <p>Paint (2 coats, 400 ft²/gal): 195 / 400 × 2 × 1.05 = <strong>1.024 gal</strong> → <strong>1.08 gal with 5% waste</strong></p>
          </ExBlock>

          <ExBlock title="Example 2 — Multiple Walls, No Openings">
            <p>Wall 1: 20 ft × 9 ft = 180 ft² | Wall 2: 15 ft × 9 ft = 135 ft² | Wall 3: 10 ft × 9 ft = 90 ft²</p>
            <p>Total Gross Area = 180 + 135 + 90 = <strong>405 ft²</strong> | Net = 405 ft² (no openings)</p>
            <p>Board: 1×8 (actual 7.25″) · Batten: 1×2 (actual 1.5″) · Equal Margins</p>
            <p>Repeat = 7.25 + 1.5 = 8.75″</p>
            <p>Wall 1 boards: ⌊(240 + 1.5) / 8.75⌋ = <strong>27</strong> | Wall 2: ⌊(180 + 1.5) / 8.75⌋ = <strong>20</strong> | Wall 3: ⌊(120 + 1.5) / 8.75⌋ = <strong>13</strong></p>
            <p>Total boards = 60 | Total battens = 57 | Board LF = 60 × 9 = 540 LF</p>
          </ExBlock>

          <ExBlock title="Example 3 — Shiplap Profile: Effective Coverage vs Actual Width">
            <p>Board: 1×6 (actual 5.5″ wide). Profile: Shiplap (½″ overlap).</p>
            <p>Effective Coverage = 5.5 − 0.5 = <strong>5.0″</strong> (not 5.5″)</p>
            <p>On a 12 ft (144″) wall: Boards = ⌊(144 + 1.5) / (5.0 + 1.5)⌋ = ⌊145.5 / 6.5⌋ = ⌊22.38⌋ = <strong>22 boards</strong></p>
            <p>Compare Square Edge 1×6: ⌊(144 + 1.5) / (5.5 + 1.5)⌋ = ⌊145.5 / 7.0⌋ = ⌊20.79⌋ = 20 boards</p>
            <p><strong>Shiplap requires 2 more boards than Square Edge for the same wall width</strong> because the overlap reduces coverage.</p>
          </ExBlock>

          <ExBlock title="Example 4 — Greedy vs Simple Optimization">
            <p>Scenario: 20 boards, wall height = 6 ft, stock length = 10 ft</p>
            <p><em>Simple:</em> Each board = 6 ft → 1 piece per board → 20 pieces × 10 ft = 200 LF purchased</p>
            <p>Used = 20 × 6 = 120 LF. Waste = 80 LF (40%).</p>
            <p><em>Greedy:</em> Each 10 ft piece holds ⌊10 / 6⌋ = 1 run (4 ft leftover each). Still 20 pieces in this case — same result since 6 ft &gt; 5 ft (half stock).</p>
            <p>Better scenario: wall height = 4.5 ft, stock = 10 ft</p>
            <p>Simple: 20 pieces × 10 ft = 200 LF. Used = 90 LF. Waste = 110 LF (55%).</p>
            <p>Greedy: Each piece holds ⌊10/4.5⌋ = 2 runs → 10 pieces × 10 ft = 100 LF. Used = 90 LF. Waste = 10 LF (10%).</p>
            <p><strong>Greedy cuts waste from 55% to 10% for 4.5 ft walls on 10 ft stock.</strong></p>
          </ExBlock>
        </SectionCard>

        {/* ══ 16 · NOTES ══════════════════════════════════════════ */}
        <SectionCard id="notes" title="Notes & Disclaimer" icon="⚠️" open={open.notes} onToggle={setOpen}>
          <ul style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>This calculator is for <strong>material estimation only</strong>. Actual quantities depend on installation skill and site conditions.</li>
            <li>Always measure walls carefully and verify dimensions before ordering materials.</li>
            <li>North American lumber sizes shown are nominal. Actual dimensions follow standard milling tolerances (1× boards: ¾″ thick; 2× boards: 1½″ thick).</li>
            <li>Board coverage widths are theoretical — actual installed coverage may vary by manufacturer and profile tolerance.</li>
            <li>Waste percentages are starting estimates. High-complexity layouts, many cuts, or irregular walls may require higher waste factors.</li>
            <li>Fastener quantities are estimates. Structural fastener requirements (type, length, spacing, penetration depth) must comply with local building codes and manufacturer specs.</li>
            <li>Paint and stain quantities are estimates based on manufacturer coverage rates for one coat. Actual consumption varies with surface porosity, application method, and temperature.</li>
            <li>Greedy cut optimization is an approximation. Professional cut planning with actual board lists is recommended for large or high-cost projects.</li>
            <li>Follow local building codes, fire codes, and structural requirements. Consult a licensed professional for load-bearing or code-sensitive installations.</li>
          </ul>
        </SectionCard>

      </div>
    </div>
  );
}
