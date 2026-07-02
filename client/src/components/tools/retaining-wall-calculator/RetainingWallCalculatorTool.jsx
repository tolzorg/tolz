import { useState, useMemo, useRef } from "react";
import {
  WALL_TYPES, CMU_BLOCKS, SEG_BLOCKS, STONE_TYPES, REBAR_SIZES_RW,
  OPENING_TYPES, DIM_UNITS,
  toM, fromM, fromM3, fromKg, fmt, valPos, valPercent, valAngle,
  calcConcreteWall, calcCMUWall, calcSegmentalWall, calcStoneWall, calcSteppedWall,
  defaultFootingIn,
} from "../../../utils/retainingWallCalc";
import PriceCheckerCard, { VOLUME_PRICE_UNITS, WEIGHT_PRICE_UNITS } from "../construction/PriceCheckerCard";
import {
  ConcreteWallDiagram, CMUWallDiagram, SegmentalWallDiagram, StoneWallDiagram,
} from "./WallDiagrams";

// ── Design tokens ──────────────────────────────────────────────────
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
  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
  cursor: "pointer", transition: "all var(--transition)",
  background: active ? "var(--accent)" : "var(--bg-white)",
  color: active ? "#fff" : "var(--text-primary)",
  borderColor: active ? "var(--accent)" : "var(--border)",
});
const RESULT_ROW = {
  display: "flex", justifyContent: "space-between", alignItems: "baseline",
  padding: "7px 0", borderBottom: "1px solid var(--border)",
};

// ── Block price units ──────────────────────────────────────────────
const BLOCK_PRICE_UNITS = [
  { id: "perBlock", label: "per Block",        display: "block"        },
  { id: "per100",   label: "per Pallet (~100)", display: "pallet"      },
  { id: "per1000",  label: "per 1000 Blocks",  display: "1000 blocks"  },
];

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
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
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

function FieldGroup({ label, error, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
      </div>
      {children}
      {error && (
        <p style={{ fontSize: 11.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 5 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function NumUnit({ label, hint, value, onChange, unit, onUnitChange, units = DIM_UNITS, error, placeholder = "0" }) {
  return (
    <FieldGroup label={label} hint={hint} error={error}>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" inputMode="decimal" min="0" step="any"
          value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = error ? "var(--error)" : "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = error ? "var(--error)" : "var(--border)")}
          style={{ ...INPUT, flex: 1, borderColor: error ? "var(--error)" : "var(--border)" }} />
        <select value={unit} onChange={(e) => onUnitChange(e.target.value)} style={{ ...SELECT, width: 72 }}>
          {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>
    </FieldGroup>
  );
}

function Sel({ label, hint, value, onChange, options, error }) {
  return (
    <FieldGroup label={label} hint={hint} error={error}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={SELECT}>
        {options.map((o) => <option key={o.id || o.value} value={o.id || o.value}>{o.label}</option>)}
      </select>
    </FieldGroup>
  );
}

function ResRow({ label, value, unit, highlight }) {
  return (
    <div style={{ ...RESULT_ROW, background: highlight ? "var(--accent-light)" : "none", padding: highlight ? "8px 10px" : "7px 0", borderRadius: highlight ? "var(--radius-md)" : 0 }}>
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

// ── Default form state ─────────────────────────────────────────────
function defaultForm() {
  return {
    wallType: "concrete",
    projectType: "simple",  // "simple" | "stepped" | "curved"
    unit: "ft",
    length: "30",
    height: "4",
    sections: [{ id: 1, length: "30", height: "4" }, { id: 2, length: "15", height: "3" }],
    // Buried height (optional — exposed height + buried = structural height)
    buriedHeight: "", buriedHeightUnit: "ft",
    // Curved wall inputs
    curvedInputMode: "radius_angle",  // "radius_angle" | "arc_length"
    curvedRadius: "50", curvedRadiusUnit: "ft",
    curvedAngle: "90",                // central angle in degrees
    curvedArcLength: "", curvedArcLengthUnit: "ft",
    // Wall openings
    openings: [],
    // Concrete
    stemThickness: "8", stemThicknessUnit: "in",
    taperedEnabled: false,
    topThickness: "", topThicknessUnit: "in",
    bottomThickness: "", bottomThicknessUnit: "in",
    // CMU
    cmuBlockId: "8x8x16",
    mortarJoint: "0.375", mortarJointUnit: "in",
    customBlockH: "", customBlockL: "", customBlockDepth: "",
    customBlockNominalW: "", customBlockNominalH: "", customBlockNominalL: "",
    customBlockWeight: "",
    // Segmental
    segBlockId: "12x6x12",
    batEnabled: false, batType: "angle",
    batAngle: "6", batSetback: "0.75",
    batTotalSetback: "3", batTotalSetbackUnit: "in",
    customSegFaceL: "", customSegFaceH: "", customSegDepth: "",
    // Stone
    stoneThickness: "18", stoneThicknessUnit: "in",
    stoneTypeId: "granite",
    customDensity: "", densityUnit: "kg_m3",
    // Footing
    footingEnabled: true,
    footingWidth: "24", footingWidthUnit: "in",
    footingThickness: "12", footingThicknessUnit: "in",
    // Drainage
    drainageEnabled: false,
    drainWidth: "12", drainWidthUnit: "in",
    drainDepth: "12", drainDepthUnit: "in",
    pipeDiameter: "4", pipeDiameterUnit: "in",
    fabricOverlap: "12", fabricOverlapUnit: "in",
    // Reinforcement
    reinfEnabled: false,
    barSizeId: "us4",
    vertSpacing: "16", vertSpacingUnit: "in",
    horizSpacing: "16", horizSpacingUnit: "in",
    // Waste
    wasteConcrete: "5",
    wasteBlock: "5",
    wasteStone: "5",
    wasteRebar: "5",
    wasteBackfill: "10",
    // Backfill depth (0 = default to structural height)
    backfillDepth: "", backfillDepthUnit: "ft",
  };
}

// ── Main component ─────────────────────────────────────────────────
export default function RetainingWallCalculatorTool() {
  const [f, setF0] = useState(defaultForm);
  const setF = (patch) => setF0((prev) => ({ ...prev, ...patch }));

  const [open, setOpen0] = useState({
    wallType: true, geometry: true, openings: false, wallOptions: true,
    footing: true, drainage: false, reinf: false, backfill: false,
    results: true, priceChecker: false, formulas: false, examples: false, notes: false,
  });
  const setOpen = (id) => setOpen0((prev) => ({ ...prev, [id]: !prev[id] }));

  const printRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  // ── Derived meters ───────────────────────────────────────────────
  const lengthM = toM(f.length, f.unit);
  const heightM = toM(f.height, f.unit);

  const stemThicknessM   = toM(f.stemThickness,  f.stemThicknessUnit);
  const topThicknessM    = toM(f.topThickness,    f.topThicknessUnit)    || 0;
  const bottomThicknessM = toM(f.bottomThickness, f.bottomThicknessUnit) || 0;

  const footingWidthM     = toM(f.footingWidth,    f.footingWidthUnit);
  const footingThicknessM = toM(f.footingThickness, f.footingThicknessUnit);

  const drainWidthM    = toM(f.drainWidth,    f.drainWidthUnit)    || 0.305;
  const drainDepthM    = toM(f.drainDepth,    f.drainDepthUnit)    || 0.305;
  const fabricOverlapM = toM(f.fabricOverlap, f.fabricOverlapUnit) || 0.305;

  const vertSpacingM  = toM(f.vertSpacing,  f.vertSpacingUnit)  || 0.4064;
  const horizSpacingM = toM(f.horizSpacing, f.horizSpacingUnit) || 0.4064;
  const barSize       = REBAR_SIZES_RW.find((r) => r.id === f.barSizeId)
                     || REBAR_SIZES_RW.find((r) => r.id === "us4")
                     || REBAR_SIZES_RW[0];

  const stoneThicknessM = toM(f.stoneThickness, f.stoneThicknessUnit);
  const stoneType       = STONE_TYPES.find((s) => s.id === f.stoneTypeId);
  const densityKgM3     = f.stoneTypeId === "custom"
    ? parseFloat(f.customDensity) * (f.densityUnit === "lb_ft3" ? 16.0185 : 1)
    : stoneType?.densityKgM3;

  const backfillDepthM = toM(f.backfillDepth, f.backfillDepthUnit) || 0;

  // ── Buried height ────────────────────────────────────────────────
  const buriedHeightM    = toM(f.buriedHeight, f.buriedHeightUnit) || 0;
  const structuralHeightM = (heightM || 0) + buriedHeightM;

  // ── Curved wall arc length ───────────────────────────────────────
  const curvedArcLengthM = useMemo(() => {
    if (f.projectType !== "curved") return null;
    if (f.curvedInputMode === "arc_length") {
      return toM(f.curvedArcLength, f.curvedArcLengthUnit);
    }
    const r = toM(f.curvedRadius, f.curvedRadiusUnit);
    const a = parseFloat(f.curvedAngle) || 0;
    if (r > 0 && a > 0 && a < 360) return r * (a * Math.PI / 180);
    return null;
  }, [f.projectType, f.curvedInputMode, f.curvedArcLength, f.curvedArcLengthUnit,
      f.curvedRadius, f.curvedRadiusUnit, f.curvedAngle]);

  // ── Effective wall length (curved or straight) ───────────────────
  const activeLengthM = f.projectType === "curved" ? curvedArcLengthM : lengthM;

  // ── Openings total area ──────────────────────────────────────────
  const openingsAreaM2 = useMemo(() => {
    return f.openings.reduce((sum, o) => {
      const w = toM(o.width, o.widthUnit) || 0;
      const h = toM(o.height, o.heightUnit) || 0;
      return sum + w * h;
    }, 0);
  }, [f.openings]);

  // ── Total setback batter (meters) ────────────────────────────────
  const batTotalSetbackM = toM(f.batTotalSetback, f.batTotalSetbackUnit) || 0;

  // CMU resolved block
  const cmuBlock     = CMU_BLOCKS.find((b) => b.id === f.cmuBlockId);
  const cmuActualHIn = f.cmuBlockId === "custom" ? parseFloat(f.customBlockH) : cmuBlock?.actualHIn;
  const cmuActualLIn = f.cmuBlockId === "custom" ? parseFloat(f.customBlockL) : cmuBlock?.actualLIn;

  // Segmental resolved block
  const segBlock   = SEG_BLOCKS.find((b) => b.id === f.segBlockId);
  const segFaceLIn = f.segBlockId === "custom" ? parseFloat(f.customSegFaceL) : segBlock?.faceLIn;
  const segFaceHIn = f.segBlockId === "custom" ? parseFloat(f.customSegFaceH) : segBlock?.faceHIn;

  // ── Common params ─────────────────────────────────────────────────
  const commonParams = useMemo(() => ({
    footingEnabled: f.footingEnabled,
    footingWidthM:     footingWidthM    || 0.6096,
    footingThicknessM: footingThicknessM || 0.3048,
    drainageEnabled: f.drainageEnabled,
    drainWidthM, drainDepthM, fabricOverlapM,
    reinfEnabled: f.reinfEnabled,
    vertSpacingM, horizSpacingM,
    barWeightPerM: barSize.weightPerM,
    wasteConcrete: parseFloat(f.wasteConcrete) || 5,
    wasteBlock:    parseFloat(f.wasteBlock)    || 5,
    wasteStone:    parseFloat(f.wasteStone)    || 5,
    wasteRebar:    parseFloat(f.wasteRebar)    || 5,
    wasteBackfill: parseFloat(f.wasteBackfill) || 10,
    backfillDepthM,
    buriedHeightM,
  }), [f, footingWidthM, footingThicknessM, drainWidthM, drainDepthM, fabricOverlapM,
       vertSpacingM, horizSpacingM, barSize.weightPerM, backfillDepthM, buriedHeightM]);

  // ── Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    const wt = f.wallType;
    const isStone = wt === "stone-mortared" || wt === "stone-dry";

    // Stepped wall (openings not applied per-section — apply post-hoc if needed)
    if (f.projectType === "stepped") {
      const secs = f.sections.map((s) => ({
        lengthM: toM(s.length, f.unit),
        heightM: toM(s.height, f.unit),
      })).filter((s) => s.lengthM > 0 && s.heightM > 0);
      if (secs.length === 0) return null;
      const specificParams = buildSpecificParams(wt);
      return calcSteppedWall(secs, wt, { ...commonParams, ...specificParams, isMortared: wt === "stone-mortared" });
    }

    // Curved or simple wall
    const lm = activeLengthM;
    if (!(lm > 0) || !(heightM > 0)) return null;

    const specific = buildSpecificParams(wt);
    const p = {
      lengthM: lm,
      heightM,
      ...commonParams,
      ...specific,
      isMortared: wt === "stone-mortared",
      openingsAreaM2: f.projectType !== "stepped" ? openingsAreaM2 : 0,
    };

    if (wt === "concrete")  return calcConcreteWall(p);
    if (wt === "cmu")       return calcCMUWall(p);
    if (wt === "segmental") return calcSegmentalWall(p);
    if (isStone)            return calcStoneWall(p);
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, activeLengthM, heightM, stemThicknessM, topThicknessM, bottomThicknessM,
      cmuActualHIn, cmuActualLIn, segFaceLIn, segFaceHIn,
      stoneThicknessM, densityKgM3, commonParams, openingsAreaM2, batTotalSetbackM]);

  function buildSpecificParams(wt) {
    if (wt === "concrete") return {
      stemThicknessM: stemThicknessM || 0.2032,
      topThicknessM, bottomThicknessM,
    };
    if (wt === "cmu") return {
      blockActualHIn: cmuActualHIn,
      blockActualLIn: cmuActualLIn,
      mortarJointIn:  parseFloat(f.mortarJoint) || 0.375,
    };
    if (wt === "segmental") return {
      blockFaceLIn: segFaceLIn,
      blockFaceHIn: segFaceHIn,
      batEnabled: f.batEnabled,
      batType: f.batType,
      batAngleDeg:     parseFloat(f.batAngle)   || 0,
      batSetbackIn:    parseFloat(f.batSetback)  || 0,
      batTotalSetbackM,
    };
    // stone
    return { thicknessM: stoneThicknessM || 0.4572, densityKgM3: densityKgM3 || 2750 };
  }

  // ── Stepped wall section helpers ──────────────────────────────────
  function addSection() {
    const nextId = Math.max(...f.sections.map((s) => s.id), 0) + 1;
    setF({ sections: [...f.sections, { id: nextId, length: "20", height: "3" }] });
  }
  function removeSection(id) {
    if (f.sections.length <= 1) return;
    setF({ sections: f.sections.filter((s) => s.id !== id) });
  }
  function updateSection(id, field, value) {
    setF({ sections: f.sections.map((s) => s.id === id ? { ...s, [field]: value } : s) });
  }

  // ── Opening management helpers ────────────────────────────────────
  function addOpening() {
    const id = Date.now();
    setF({ openings: [...f.openings, { id, type: "gate", width: "3", widthUnit: "ft", height: "6", heightUnit: "ft" }] });
  }
  function removeOpening(id) {
    setF({ openings: f.openings.filter((o) => o.id !== id) });
  }
  function updateOpening(id, patch) {
    setF({ openings: f.openings.map((o) => o.id === id ? { ...o, ...patch } : o) });
  }

  // ── Footing auto-fill when stem thickness changes ─────────────────
  function handleStemThicknessChange(v, u) {
    setF({ stemThickness: v, stemThicknessUnit: u || f.stemThicknessUnit });
    const stemIn = (u === "in" || f.stemThicknessUnit === "in")
      ? parseFloat(v)
      : (parseFloat(v) * (toM(1, u || f.stemThicknessUnit) || 1) / 0.0254);
    if (stemIn > 0) {
      const { widthIn, thicknessIn } = defaultFootingIn(stemIn);
      if (!f.footingWidth || f.footingWidth === "24") setF({ footingWidth: String(Math.round(widthIn)), footingWidthUnit: "in" });
      if (!f.footingThickness || f.footingThickness === "12") setF({ footingThickness: String(Math.round(thicknessIn)), footingThicknessUnit: "in" });
    }
  }

  function handleWallTypeChange(wt) {
    setF({ wallType: wt });
    if (wt === "stone-mortared" || wt === "stone-dry") {
      setF({ footingWidth: "24", footingWidthUnit: "in", footingThickness: "12", footingThicknessUnit: "in" });
    }
  }

  // ── Copy results ──────────────────────────────────────────────────
  function handleCopy() {
    if (!result) return;
    const lines = buildCopyText(result, f, openingsAreaM2, structuralHeightM, buriedHeightM);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Volume helpers for price checker ──────────────────────────────
  const concVol = result ? (result.totalConcreteWithWasteM3 || result.footingWithWasteM3 || 0) : null;
  const concQuantities = {
    yd3: concVol ? fromM3(concVol, "yd3") : null,
    m3:  concVol ? concVol : null,
    ft3: concVol ? fromM3(concVol, "ft3") : null,
  };

  const stoneVolW3   = result?.stoneVolWithWasteM3;
  const stoneWeightKg = result?.stoneWeightKg;
  const stoneQuantities = {
    yd3:    stoneVolW3   ? fromM3(stoneVolW3, "yd3") : null,
    m3:     stoneVolW3   || null,
    lb:     stoneWeightKg ? fromKg(stoneWeightKg, "lb")   : null,
    kg:     stoneWeightKg || null,
    ustons: stoneWeightKg ? fromKg(stoneWeightKg, "tons") : null,
  };

  const blockCount = result?.totalBlocksWaste;
  const blockQuantities = {
    perBlock: blockCount || null,
    per100:   blockCount ? blockCount / 100  : null,
    per1000:  blockCount ? blockCount / 1000 : null,
  };

  const rebarKg = result?.rebar?.rebarWeightKg;
  const rebarQuantities = {
    kg:         rebarKg || null,
    lb:         rebarKg ? fromKg(rebarKg, "lb")     : null,
    metrictons: rebarKg ? fromKg(rebarKg, "tonnes") : null,
    ustons:     rebarKg ? fromKg(rebarKg, "tons")   : null,
  };

  const grvelM3 = result?.drainage?.gravelVolM3;
  const grvelQuantities = {
    yd3: grvelM3 ? fromM3(grvelM3, "yd3") : null,
    m3:  grvelM3 || null,
    ft3: grvelM3 ? fromM3(grvelM3, "ft3") : null,
  };

  const bkfM3 = result?.backfill?.backfillWithWasteM3;
  const bkfQuantities = {
    yd3: bkfM3 ? fromM3(bkfM3, "yd3") : null,
    m3:  bkfM3 || null,
    ft3: bkfM3 ? fromM3(bkfM3, "ft3") : null,
  };

  const wt = f.wallType;
  const showConcrete = wt === "concrete" || (f.footingEnabled && wt !== "stone-mortared" && wt !== "stone-dry");
  const showBlocks   = wt === "cmu" || wt === "segmental";
  const showStone    = wt === "stone-mortared" || wt === "stone-dry";

  // ── Diagram props ─────────────────────────────────────────────────
  const diagramProps = {
    footingEnabled: f.footingEnabled,
    drainageEnabled: f.drainageEnabled,
    numCourses: result?.numCourses || 6,
    setbackPerCourseM: result?.setbackPerCourseM || 0,
    isMortared: wt === "stone-mortared",
    openingCount: f.openings.length,
    buriedHeightM,
    exposedHeightM: f.projectType === "stepped" ? effectiveHeightM : (heightM || 0),
  };

  // ── Effective totals for display ──────────────────────────────────
  const effectiveLengthM = useMemo(() => {
    if (f.projectType === "stepped") {
      return f.sections.reduce((sum, s) => sum + (toM(s.length, f.unit) || 0), 0);
    }
    if (f.projectType === "curved") return curvedArcLengthM || 0;
    return lengthM || 0;
  }, [f.sections, f.projectType, f.unit, lengthM, curvedArcLengthM]);

  const effectiveHeightM = useMemo(() => {
    if (f.projectType === "stepped") {
      return Math.max(...f.sections.map((s) => toM(s.height, f.unit) || 0));
    }
    return heightM || 0;
  }, [f.sections, f.projectType, f.unit, heightM]);

  const unitScale = DIM_UNITS.find((u) => u.id === f.unit)?.toM || 1;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ maxWidth: 820, margin: "0 auto", padding: "0 16px 60px" }}>

      {/* ── Disclaimer ── */}
      <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#92400e", margin: "0 0 6px" }}>
          ⚠️ Material Estimating Tool — Not a Structural Design Tool
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "#78350f", margin: 0, lineHeight: 1.6 }}>
          This calculator estimates material quantities and costs only. It does not evaluate soil conditions, surcharge loads,
          hydrostatic pressure, frost depth, drainage adequacy, footing design, or code compliance.
          Always consult a licensed structural or geotechnical engineer before constructing a retaining wall.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ══ 1 · WALL TYPE ══════════════════════════════════════════ */}
        <SectionCard id="wallType" title="Wall Type" icon="🏗️" open={open.wallType} onToggle={setOpen}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WALL_TYPES.map((wtype) => (
              <button key={wtype.id} onClick={() => handleWallTypeChange(wtype.id)}
                style={{ ...TOGGLE_BTN(f.wallType === wtype.id), display: "flex", alignItems: "center", gap: 6 }}>
                <span>{wtype.icon}</span> {wtype.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ══ 2 · GEOMETRY ═══════════════════════════════════════════ */}
        <SectionCard id="geometry" title="Wall Geometry" icon="📐" open={open.geometry} onToggle={setOpen}>

          {/* Project type selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={LBL}>Project Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button style={TOGGLE_BTN(f.projectType === "simple")}  onClick={() => setF({ projectType: "simple" })}>Simple Wall</button>
              <button style={TOGGLE_BTN(f.projectType === "stepped")} onClick={() => setF({ projectType: "stepped" })}>Stepped Wall</button>
              <button style={TOGGLE_BTN(f.projectType === "curved")}  onClick={() => setF({ projectType: "curved" })}>Curved Wall</button>
            </div>
          </div>

          {/* ── Simple wall ── */}
          {f.projectType === "simple" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <NumUnit label="Wall Length" hint="Total wall length along the face" value={f.length}
                onChange={(v) => setF({ length: v })} unit={f.unit} onUnitChange={(u) => setF({ unit: u })} error={valPos(f.length)} />
              <NumUnit label="Wall Height" hint="Exposed height above grade (does not include footing or buried depth)" value={f.height}
                onChange={(v) => setF({ height: v })} unit={f.unit} onUnitChange={(u) => setF({ unit: u })} error={valPos(f.height)} />
            </div>
          )}

          {/* ── Stepped wall ── */}
          {f.projectType === "stepped" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={LBL}>Wall Sections</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>Unit:</span>
                  <select value={f.unit} onChange={(e) => setF({ unit: e.target.value })} style={{ ...SELECT, width: 72, fontSize: 12 }}>
                    {DIM_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              {f.sections.map((sec, idx) => (
                <div key={sec.id} style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--bg-muted)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", width: 20 }}>#{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <FieldGroup label="Length" error={valPos(sec.length)}>
                      <input type="number" inputMode="decimal" min="0" step="any" value={sec.length} placeholder="0"
                        onChange={(e) => updateSection(sec.id, "length", e.target.value)} style={INPUT} />
                    </FieldGroup>
                  </div>
                  <div style={{ flex: 1 }}>
                    <FieldGroup label="Height" error={valPos(sec.height)}>
                      <input type="number" inputMode="decimal" min="0" step="any" value={sec.height} placeholder="0"
                        onChange={(e) => updateSection(sec.id, "height", e.target.value)} style={INPUT} />
                    </FieldGroup>
                  </div>
                  <button onClick={() => removeSection(sec.id)} disabled={f.sections.length <= 1}
                    style={{ padding: "10px 12px", background: "var(--bg-white)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", cursor: f.sections.length <= 1 ? "not-allowed" : "pointer", color: f.sections.length <= 1 ? "var(--text-muted)" : "var(--error)", fontSize: 14, opacity: f.sections.length <= 1 ? 0.4 : 1 }}>
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={addSection} className="btn btn-secondary" style={{ fontSize: 13, alignSelf: "flex-start" }}>
                + Add Section
              </button>
              <div style={{ background: "var(--accent-light)", borderRadius: "var(--radius-md)", padding: "10px 14px", display: "flex", gap: 20 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  Total Length: {fmt(effectiveLengthM / unitScale)} {f.unit}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  Max Height: {fmt(effectiveHeightM / unitScale)} {f.unit}
                </span>
              </div>
            </div>
          )}

          {/* ── Curved wall ── */}
          {f.projectType === "curved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12, color: "#1e40af", fontFamily: "var(--font-display)" }}>
                Curved wall: compute arc length from radius + angle, or enter arc length directly. Arc length is used as the wall length for all material calculations.
              </div>
              <div>
                <label style={LBL}>Arc Length Input Method</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={TOGGLE_BTN(f.curvedInputMode === "radius_angle")} onClick={() => setF({ curvedInputMode: "radius_angle" })}>Radius + Angle</button>
                  <button style={TOGGLE_BTN(f.curvedInputMode === "arc_length")}   onClick={() => setF({ curvedInputMode: "arc_length" })}>Arc Length</button>
                </div>
              </div>
              {f.curvedInputMode === "radius_angle" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <NumUnit label="Radius" hint="Horizontal radius of curvature (center of wall face to center)"
                    value={f.curvedRadius} onChange={(v) => setF({ curvedRadius: v })}
                    unit={f.curvedRadiusUnit} onUnitChange={(u) => setF({ curvedRadiusUnit: u })} error={valPos(f.curvedRadius)} />
                  <FieldGroup label="Central Angle (°)" hint="Sweep angle of the arc (0–359°)" error={parseFloat(f.curvedAngle) <= 0 || parseFloat(f.curvedAngle) >= 360 ? "Enter 1–359°" : null}>
                    <input type="number" inputMode="decimal" min="1" max="359" step="1" value={f.curvedAngle}
                      onChange={(e) => setF({ curvedAngle: e.target.value })} style={INPUT} placeholder="90" />
                  </FieldGroup>
                </div>
              ) : (
                <NumUnit label="Arc Length" hint="Total length along the curved wall face"
                  value={f.curvedArcLength} onChange={(v) => setF({ curvedArcLength: v })}
                  unit={f.curvedArcLengthUnit} onUnitChange={(u) => setF({ curvedArcLengthUnit: u })} error={valPos(f.curvedArcLength)} />
              )}
              {/* Show computed arc length */}
              {curvedArcLengthM > 0 && f.curvedInputMode === "radius_angle" && (
                <div style={{ background: "var(--accent-light)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                    Arc Length = {fmt(curvedArcLengthM * 3.28084)} ft = {fmt(curvedArcLengthM)} m
                  </span>
                </div>
              )}
              <NumUnit label="Wall Height" hint="Exposed height above grade"
                value={f.height} onChange={(v) => setF({ height: v })}
                unit={f.unit} onUnitChange={(u) => setF({ unit: u })} error={valPos(f.height)} />
            </div>
          )}

          {/* ── Buried height (all project types) ── */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <NumUnit
              label="Buried / Below-Grade Height (optional)"
              hint="Depth of wall embedded below grade. Exposed + Buried = Structural height used for rebar and backfill calculations."
              value={f.buriedHeight} onChange={(v) => setF({ buriedHeight: v })}
              unit={f.buriedHeightUnit} onUnitChange={(u) => setF({ buriedHeightUnit: u })} />
            {buriedHeightM > 0 && heightM > 0 && (
              <div style={{ marginTop: 8, background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                Structural height = {fmt(fromM(heightM, f.unit))} {f.unit} exposed + {fmt(fromM(buriedHeightM, f.buriedHeightUnit))} {f.buriedHeightUnit} buried = <strong>{fmt(structuralHeightM * 3.28084)} ft</strong>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ══ 3 · WALL OPENINGS ══════════════════════════════════════ */}
        <SectionCard id="openings" title={`Wall Openings${f.openings.length > 0 ? ` (${f.openings.length})` : ""}`} icon="⬜" open={open.openings} onToggle={setOpen}>
          <div style={{ marginBottom: 12, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            Add gate, window, utility or other openings. Their area is subtracted from the gross wall area, reducing block/stone/concrete quantities proportionally.
            {f.projectType === "stepped" && (
              <span style={{ color: "#d97706", fontWeight: 600 }}> Note: openings are not applied to stepped wall projects — deduct manually per section.</span>
            )}
          </div>

          {f.openings.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: 13, marginBottom: 12 }}>No openings added.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {f.openings.map((op, idx) => (
                <div key={op.id} style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--bg-muted)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", width: 20, flexShrink: 0 }}>#{idx + 1}</span>
                  <div style={{ flex: "0 0 130px" }}>
                    <FieldGroup label="Type">
                      <select value={op.type} onChange={(e) => updateOpening(op.id, { type: e.target.value })} style={{ ...SELECT, fontSize: 12, padding: "8px 30px 8px 10px" }}>
                        {OPENING_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </FieldGroup>
                  </div>
                  <div style={{ flex: 1 }}>
                    <NumUnit label="Width" value={op.width} onChange={(v) => updateOpening(op.id, { width: v })}
                      unit={op.widthUnit} onUnitChange={(u) => updateOpening(op.id, { widthUnit: u })}
                      error={valPos(op.width)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <NumUnit label="Height" value={op.height} onChange={(v) => updateOpening(op.id, { height: v })}
                      unit={op.heightUnit} onUnitChange={(u) => updateOpening(op.id, { heightUnit: u })}
                      error={valPos(op.height)} />
                  </div>
                  <button onClick={() => removeOpening(op.id)}
                    style={{ padding: "10px 12px", background: "var(--bg-white)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--error)", fontSize: 14, flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={addOpening} className="btn btn-secondary" style={{ fontSize: 13 }}>
            + Add Opening
          </button>

          {openingsAreaM2 > 0 && (
            <div style={{ marginTop: 12, background: "var(--accent-light)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                Total Opening Area: {fmt(openingsAreaM2 * 10.7639)} ft² = {fmt(openingsAreaM2)} m²
              </span>
            </div>
          )}
        </SectionCard>

        {/* ══ 4 · WALL-TYPE SPECIFIC OPTIONS ════════════════════════ */}
        <SectionCard id="wallOptions" title="Wall Options" icon="🔧" open={open.wallOptions} onToggle={setOpen}>

          {/* CONCRETE */}
          {f.wallType === "concrete" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <NumUnit label="Stem Thickness" hint="Uniform stem thickness (used if not tapered)" value={f.stemThickness}
                  onChange={(v) => handleStemThicknessChange(v)}
                  unit={f.stemThicknessUnit} onUnitChange={(u) => setF({ stemThicknessUnit: u })} error={valPos(f.stemThickness)} />
              </div>
              <div>
                <label style={LBL}>Tapered Wall (optional)</label>
                <button style={TOGGLE_BTN(f.taperedEnabled)} onClick={() => setF({ taperedEnabled: !f.taperedEnabled })}>
                  {f.taperedEnabled ? "Tapered: ON" : "Tapered: OFF"}
                </button>
              </div>
              {f.taperedEnabled && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                  <NumUnit label="Top Thickness" value={f.topThickness} onChange={(v) => setF({ topThickness: v })}
                    unit={f.topThicknessUnit} onUnitChange={(u) => setF({ topThicknessUnit: u })} />
                  <NumUnit label="Bottom Thickness" value={f.bottomThickness} onChange={(v) => setF({ bottomThickness: v })}
                    unit={f.bottomThicknessUnit} onUnitChange={(u) => setF({ bottomThicknessUnit: u })} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldGroup label="Waste %" hint="Concrete over-order allowance">
                  <input type="number" inputMode="decimal" value={f.wasteConcrete} onChange={(e) => setF({ wasteConcrete: e.target.value })} style={INPUT} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* CMU */}
          {f.wallType === "cmu" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* ASTM C90 note */}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12, color: "#1e40af", fontFamily: "var(--font-display)" }}>
                <strong>ASTM C90:</strong> Nominal block size includes a 3/8″ mortar joint. Actual manufactured dimensions = Nominal − 3/8″ per face.
                Standard 8×8×16″ block → actual 7⅝″ H × 15⅝″ L × 7⅝″ D. Calculations use actual dimensions only.
              </div>

              <Sel label="Block Size" hint="Full ASTM C90 range — nominal W×H×L; actual dims shown in note below"
                value={f.cmuBlockId} onChange={(v) => setF({ cmuBlockId: v })}
                options={CMU_BLOCKS.map((b) => ({ id: b.id, label: b.label }))} />

              {f.cmuBlockId !== "custom" && cmuBlock && (
                <div style={{ background: "var(--bg-muted)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  Actual dims: {cmuBlock.actualHIn}″ H × {cmuBlock.actualLIn}″ L × {cmuBlock.depthIn}″ deep
                  {cmuBlock.nomWIn && (
                    <span style={{ marginLeft: 8, color: "#6b7280" }}>
                      (Nominal {cmuBlock.nomWIn}×{cmuBlock.nomHIn}×{cmuBlock.nomLIn}″)
                    </span>
                  )}
                </div>
              )}

              {f.cmuBlockId === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                  <div>
                    <label style={{ ...LBL, fontSize: 11 }}>Actual Manufactured Dimensions (required)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <FieldGroup label='Actual H (in)' error={valPos(f.customBlockH)}>
                        <input type="number" inputMode="decimal" value={f.customBlockH}
                          onChange={(e) => setF({ customBlockH: e.target.value })} style={INPUT} placeholder="7.625" />
                      </FieldGroup>
                      <FieldGroup label='Actual L (in)' error={valPos(f.customBlockL)}>
                        <input type="number" inputMode="decimal" value={f.customBlockL}
                          onChange={(e) => setF({ customBlockL: e.target.value })} style={INPUT} placeholder="15.625" />
                      </FieldGroup>
                      <FieldGroup label='Actual Depth (in)'>
                        <input type="number" inputMode="decimal" value={f.customBlockDepth}
                          onChange={(e) => setF({ customBlockDepth: e.target.value })} style={INPUT} placeholder="7.625" />
                      </FieldGroup>
                    </div>
                    {parseFloat(f.customBlockH) > 0 && parseFloat(f.customBlockL) > 0 && (
                      <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                        Face area: {fmt(parseFloat(f.customBlockH) * parseFloat(f.customBlockL), 3)} in²
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ ...LBL, fontSize: 10, color: "#9ca3af" }}>Nominal Size (optional — display only)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <FieldGroup label='Nominal W (in)'>
                        <input type="number" inputMode="decimal" value={f.customBlockNominalW}
                          onChange={(e) => setF({ customBlockNominalW: e.target.value })} style={INPUT} placeholder="8" />
                      </FieldGroup>
                      <FieldGroup label='Nominal H (in)'>
                        <input type="number" inputMode="decimal" value={f.customBlockNominalH}
                          onChange={(e) => setF({ customBlockNominalH: e.target.value })} style={INPUT} placeholder="8" />
                      </FieldGroup>
                      <FieldGroup label='Nominal L (in)'>
                        <input type="number" inputMode="decimal" value={f.customBlockNominalL}
                          onChange={(e) => setF({ customBlockNominalL: e.target.value })} style={INPUT} placeholder="16" />
                      </FieldGroup>
                    </div>
                  </div>
                  <FieldGroup label='Weight per Block (lb, optional)' hint="Used for load estimation only">
                    <input type="number" inputMode="decimal" value={f.customBlockWeight}
                      onChange={(e) => setF({ customBlockWeight: e.target.value })} style={INPUT} placeholder="e.g. 33" />
                  </FieldGroup>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <NumUnit label='Mortar Joint' hint="Standard: 3/8 in (10 mm)" value={f.mortarJoint}
                  onChange={(v) => setF({ mortarJoint: v })} unit={f.mortarJointUnit}
                  onUnitChange={(u) => setF({ mortarJointUnit: u })}
                  units={[{ id: "in", label: "in" }, { id: "mm", label: "mm" }]} />
                <FieldGroup label="Block Waste %">
                  <input type="number" inputMode="decimal" value={f.wasteBlock}
                    onChange={(e) => setF({ wasteBlock: e.target.value })} style={INPUT} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* SEGMENTAL */}
          {f.wallType === "segmental" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Sel label="Block Size" hint="Segmental retaining wall blocks — no mortar joints, actual face dimensions"
                value={f.segBlockId} onChange={(v) => setF({ segBlockId: v })}
                options={SEG_BLOCKS.map((b) => ({ id: b.id, label: b.label }))} />

              {f.segBlockId !== "custom" && segBlock && (
                <div style={{ background: "var(--bg-muted)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  Face dims: {segBlock.faceLIn}″ L × {segBlock.faceHIn}″ H × {segBlock.depthIn}″ deep
                  &nbsp;·&nbsp;Face area: {fmt(segBlock.faceLIn * segBlock.faceHIn, 2)} in²
                </div>
              )}

              {f.segBlockId === "custom" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                  <FieldGroup label='Face Length (in)' error={valPos(f.customSegFaceL)}>
                    <input type="number" inputMode="decimal" value={f.customSegFaceL}
                      onChange={(e) => setF({ customSegFaceL: e.target.value })} style={INPUT} placeholder="12" />
                  </FieldGroup>
                  <FieldGroup label='Face Height (in)' error={valPos(f.customSegFaceH)}>
                    <input type="number" inputMode="decimal" value={f.customSegFaceH}
                      onChange={(e) => setF({ customSegFaceH: e.target.value })} style={INPUT} placeholder="6" />
                  </FieldGroup>
                  <FieldGroup label='Block Depth (in)'>
                    <input type="number" inputMode="decimal" value={f.customSegDepth}
                      onChange={(e) => setF({ customSegDepth: e.target.value })} style={INPUT} placeholder="12" />
                  </FieldGroup>
                  {parseFloat(f.customSegFaceL) > 0 && parseFloat(f.customSegFaceH) > 0 && (
                    <div style={{ gridColumn: "1/-1", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                      Face area: {fmt(parseFloat(f.customSegFaceL) * parseFloat(f.customSegFaceH), 2)} in²
                    </div>
                  )}
                </div>
              )}

              {/* Batter */}
              <div>
                <label style={LBL}>Batter (Lean Back)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={TOGGLE_BTN(!f.batEnabled)} onClick={() => setF({ batEnabled: false })}>No Batter</button>
                  <button style={TOGGLE_BTN(f.batEnabled)}  onClick={() => setF({ batEnabled: true })}>Battered</button>
                </div>
              </div>

              {f.batEnabled && (
                <div style={{ padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={TOGGLE_BTN(f.batType === "angle")}         onClick={() => setF({ batType: "angle" })}>Angle (°)</button>
                    <button style={TOGGLE_BTN(f.batType === "setback")}       onClick={() => setF({ batType: "setback" })}>Setback/Course</button>
                    <button style={TOGGLE_BTN(f.batType === "total_setback")} onClick={() => setF({ batType: "total_setback" })}>Total Setback</button>
                  </div>

                  {f.batType === "angle" && (
                    <FieldGroup label="Batter Angle" hint="Degrees of lean from vertical (0–44.9°)" error={valAngle(f.batAngle)}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="number" inputMode="decimal" min="0" max="44.9" step="0.5" value={f.batAngle}
                          onChange={(e) => setF({ batAngle: e.target.value })} style={{ ...INPUT, flex: 1 }} />
                        <span style={{ padding: "10px 12px", background: "var(--bg-white)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>°</span>
                      </div>
                    </FieldGroup>
                  )}

                  {f.batType === "setback" && (
                    <FieldGroup label='Setback per Course (in)' hint="Horizontal offset per block course toward the fill side">
                      <input type="number" inputMode="decimal" min="0" step="0.1" value={f.batSetback}
                        onChange={(e) => setF({ batSetback: e.target.value })} style={INPUT} />
                    </FieldGroup>
                  )}

                  {f.batType === "total_setback" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <NumUnit label="Total Wall Setback (top vs. base)"
                        hint="Total horizontal distance the wall top is set back from the base"
                        value={f.batTotalSetback} onChange={(v) => setF({ batTotalSetback: v })}
                        unit={f.batTotalSetbackUnit} onUnitChange={(u) => setF({ batTotalSetbackUnit: u })} />
                      {result?.numCourses > 0 && batTotalSetbackM > 0 && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                          → Setback/Course = {fmt(batTotalSetbackM / result.numCourses * 39.3701, 3)} in
                          &nbsp;·&nbsp; Angle ≈ {fmt(result.effectiveBatAngleDeg, 2)}°
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show derived values for angle and setback methods too */}
                  {result?.derivedSetbackPerCourseIn > 0 && f.batType !== "total_setback" && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                      Derived: Setback/Course = {fmt(result.derivedSetbackPerCourseIn, 3)} in
                      &nbsp;·&nbsp; Angle = {fmt(result.effectiveBatAngleDeg, 2)}°
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldGroup label="Block Waste %">
                  <input type="number" inputMode="decimal" value={f.wasteBlock}
                    onChange={(e) => setF({ wasteBlock: e.target.value })} style={INPUT} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* STONE */}
          {(f.wallType === "stone-mortared" || f.wallType === "stone-dry") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={TOGGLE_BTN(f.wallType === "stone-mortared")} onClick={() => handleWallTypeChange("stone-mortared")}>Mortared Stone</button>
                <button style={TOGGLE_BTN(f.wallType === "stone-dry")}      onClick={() => handleWallTypeChange("stone-dry")}>Dry-Stack Stone</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <NumUnit label="Average Wall Thickness" hint="Average thickness of the stone wall"
                  value={f.stoneThickness} onChange={(v) => setF({ stoneThickness: v })}
                  unit={f.stoneThicknessUnit} onUnitChange={(u) => setF({ stoneThicknessUnit: u })} error={valPos(f.stoneThickness)} />
              </div>
              <Sel label="Stone Type"
                hint="Engineering reference density ranges — actual density varies by quarry and composition"
                value={f.stoneTypeId} onChange={(v) => setF({ stoneTypeId: v })}
                options={STONE_TYPES.map((s) => ({
                  id: s.id,
                  label: s.densityKgM3
                    ? `${s.label} (${s.densityKgM3} kg/m³)`
                    : s.label,
                }))} />
              {stoneType?.refRange && f.stoneTypeId !== "custom" && (
                <div style={{ background: "var(--bg-muted)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  Engineering reference range: {stoneType.refRange}
                </div>
              )}
              {f.stoneTypeId === "custom" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
                  <FieldGroup label="Custom Density" error={valPos(f.customDensity)}>
                    <input type="number" inputMode="decimal" value={f.customDensity}
                      onChange={(e) => setF({ customDensity: e.target.value })} style={INPUT} placeholder="e.g. 2650" />
                  </FieldGroup>
                  <Sel label="Density Unit" value={f.densityUnit} onChange={(u) => setF({ densityUnit: u })}
                    options={[{ id: "kg_m3", label: "kg/m³" }, { id: "lb_ft3", label: "lb/ft³" }]} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldGroup label="Stone Waste %">
                  <input type="number" inputMode="decimal" value={f.wasteStone}
                    onChange={(e) => setF({ wasteStone: e.target.value })} style={INPUT} />
                </FieldGroup>
              </div>
              <div style={{ background: "var(--bg-muted)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                {f.wallType === "stone-mortared"
                  ? "Mortared stone: estimated 70% stone, 30% mortar by volume."
                  : "Dry-stack stone: estimated 75% stone, 25% voids by volume."}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ══ 5 · FOOTING ════════════════════════════════════════════ */}
        <SectionCard id="footing" title="Footing" icon="🏛️" open={open.footing} onToggle={setOpen}>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Include Footing?</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={TOGGLE_BTN(f.footingEnabled)}  onClick={() => setF({ footingEnabled: true })}>Yes (Recommended)</button>
              <button style={TOGGLE_BTN(!f.footingEnabled)} onClick={() => setF({ footingEnabled: false })}>No</button>
            </div>
          </div>
          {f.footingEnabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <NumUnit label="Footing Width" hint="Total footing width — typically 2× stem thickness, min 18 in"
                value={f.footingWidth} onChange={(v) => setF({ footingWidth: v })}
                unit={f.footingWidthUnit} onUnitChange={(u) => setF({ footingWidthUnit: u })} error={valPos(f.footingWidth)} />
              <NumUnit label="Footing Thickness" hint="Footing depth — typically equal to stem thickness, min 8 in"
                value={f.footingThickness} onChange={(v) => setF({ footingThickness: v })}
                unit={f.footingThicknessUnit} onUnitChange={(u) => setF({ footingThicknessUnit: u })} error={valPos(f.footingThickness)} />
              <FieldGroup label="Concrete Waste %">
                <input type="number" inputMode="decimal" value={f.wasteConcrete}
                  onChange={(e) => setF({ wasteConcrete: e.target.value })} style={INPUT} />
              </FieldGroup>
            </div>
          )}
        </SectionCard>

        {/* ══ 6 · DRAINAGE ═══════════════════════════════════════════ */}
        <SectionCard id="drainage" title="Drainage System" icon="💧" open={open.drainage} onToggle={setOpen}>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Include Drainage System?</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={TOGGLE_BTN(f.drainageEnabled)}  onClick={() => setF({ drainageEnabled: true })}>Yes</button>
              <button style={TOGGLE_BTN(!f.drainageEnabled)} onClick={() => setF({ drainageEnabled: false })}>No</button>
            </div>
          </div>
          {f.drainageEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <NumUnit label="Drainage Width" hint="Width of gravel drainage zone behind wall (recommended: 12 in)"
                  value={f.drainWidth} onChange={(v) => setF({ drainWidth: v })}
                  unit={f.drainWidthUnit} onUnitChange={(u) => setF({ drainWidthUnit: u })} error={valPos(f.drainWidth)} />
                <NumUnit label="Drainage Depth" hint="Height of gravel drainage zone (recommended: wall height)"
                  value={f.drainDepth} onChange={(v) => setF({ drainDepth: v })}
                  unit={f.drainDepthUnit} onUnitChange={(u) => setF({ drainDepthUnit: u })} error={valPos(f.drainDepth)} />
                <NumUnit label="Pipe Diameter" hint="Perforated drain pipe diameter (recommended: 4 in)"
                  value={f.pipeDiameter} onChange={(v) => setF({ pipeDiameter: v })}
                  unit={f.pipeDiameterUnit} onUnitChange={(u) => setF({ pipeDiameterUnit: u })} />
                <NumUnit label="Fabric Overlap" hint="Additional geotextile to fold over top of gravel (recommended: 12 in)"
                  value={f.fabricOverlap} onChange={(v) => setF({ fabricOverlap: v })}
                  unit={f.fabricOverlapUnit} onUnitChange={(u) => setF({ fabricOverlapUnit: u })} />
              </div>
              <div style={{ background: "var(--bg-muted)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                Practical defaults: 12 in wide × wall-height deep gravel zone, 4 in perforated pipe, 12 in fabric overlap.
                Geotextile fabric area = L × (Width + 2×Depth + Overlap). Pipe runs full wall length.
              </div>
            </div>
          )}
        </SectionCard>

        {/* ══ 7 · REINFORCEMENT ══════════════════════════════════════ */}
        <SectionCard id="reinf" title="Reinforcement (Conceptual Estimate)" icon="🔩" open={open.reinf} onToggle={setOpen}>
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400e", fontFamily: "var(--font-display)", fontWeight: 500 }}>
            ⚠️ Rebar quantities are conceptual estimates — NOT structural design values. Bar size, spacing, and placement must be determined by a licensed structural engineer.
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Include Rebar Estimate?</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={TOGGLE_BTN(f.reinfEnabled)}  onClick={() => setF({ reinfEnabled: true })}>Yes</button>
              <button style={TOGGLE_BTN(!f.reinfEnabled)} onClick={() => setF({ reinfEnabled: false })}>No</button>
            </div>
          </div>
          {f.reinfEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Grouped rebar selector */}
                <FieldGroup label="Bar Size" hint="Bar size for vertical, horizontal, and footing steel">
                  <select value={f.barSizeId} onChange={(e) => setF({ barSizeId: e.target.value })} style={SELECT}>
                    <optgroup label="Metric Bars">
                      {REBAR_SIZES_RW.filter((r) => r.group === "Metric").map((r) => (
                        <option key={r.id} value={r.id}>{r.label} ({r.weightPerM} kg/m)</option>
                      ))}
                    </optgroup>
                    <optgroup label="US Bars — ASTM A615">
                      {REBAR_SIZES_RW.filter((r) => r.group === "US").map((r) => (
                        <option key={r.id} value={r.id}>{r.label} ({r.weightPerM} kg/m)</option>
                      ))}
                    </optgroup>
                  </select>
                </FieldGroup>
                <FieldGroup label="Rebar Waste %">
                  <input type="number" inputMode="decimal" value={f.wasteRebar}
                    onChange={(e) => setF({ wasteRebar: e.target.value })} style={INPUT} />
                </FieldGroup>
                <NumUnit label="Vertical Spacing" hint="Center-to-center spacing of vertical bars"
                  value={f.vertSpacing} onChange={(v) => setF({ vertSpacing: v })}
                  unit={f.vertSpacingUnit} onUnitChange={(u) => setF({ vertSpacingUnit: u })} error={valPos(f.vertSpacing)} />
                <NumUnit label="Horizontal Spacing" hint="Center-to-center spacing of horizontal bars"
                  value={f.horizSpacing} onChange={(v) => setF({ horizSpacing: v })}
                  unit={f.horizSpacingUnit} onUnitChange={(u) => setF({ horizSpacingUnit: u })} error={valPos(f.horizSpacing)} />
              </div>
              {buriedHeightM > 0 && (
                <div style={{ background: "var(--bg-muted)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  Vertical bar length uses structural height ({fmt(structuralHeightM * 3.28084)} ft) + 12″ footing development.
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ══ 8 · BACKFILL ═══════════════════════════════════════════ */}
        <SectionCard id="backfill" title="Backfill" icon="🪣" open={open.backfill} onToggle={setOpen}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <NumUnit label="Backfill Depth" hint="Distance behind the wall that is backfilled. Defaults to structural height (exposed + buried) when blank."
              value={f.backfillDepth} onChange={(v) => setF({ backfillDepth: v })}
              unit={f.backfillDepthUnit} onUnitChange={(u) => setF({ backfillDepthUnit: u })} />
            <FieldGroup label="Backfill Waste %" hint="Compaction swell and spillage allowance">
              <input type="number" inputMode="decimal" value={f.wasteBackfill}
                onChange={(e) => setF({ wasteBackfill: e.target.value })} style={INPUT} />
            </FieldGroup>
          </div>
        </SectionCard>

        {/* ══ 9 · DIAGRAM ════════════════════════════════════════════ */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span><span style={{ marginRight: 8 }}>📊</span>Wall Cross-Section</span>
            {f.projectType === "curved" && (
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", background: "#eff6ff", padding: "3px 10px", borderRadius: "var(--radius-md)" }}>
                Arc length used as wall length
              </span>
            )}
            {f.openings.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 500, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: "var(--radius-md)" }}>
                {f.openings.length} opening(s) deducted
              </span>
            )}
          </div>
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            {f.wallType === "concrete"                              && <ConcreteWallDiagram  {...diagramProps} />}
            {f.wallType === "cmu"                                   && <CMUWallDiagram       {...diagramProps} />}
            {f.wallType === "segmental"                             && <SegmentalWallDiagram {...diagramProps} />}
            {(f.wallType === "stone-mortared" || f.wallType === "stone-dry") && <StoneWallDiagram {...diagramProps} />}
          </div>
        </div>

        {/* ══ 10 · RESULTS ═══════════════════════════════════════════ */}
        <SectionCard id="results" title="Material Summary" icon="📋" open={open.results} onToggle={setOpen}>
          {!result ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: 13 }}>
              Enter wall dimensions above to see results.
            </p>
          ) : (
            <div>

              {/* Wall geometry */}
              <ResSection title="Wall Geometry">
                {buriedHeightM > 0 && (
                  <>
                    <ResRow label="Exposed Height"        value={fmt(fromM(heightM, "ft"))} unit="ft" />
                    <ResRow label="Buried / Below-Grade"  value={fmt(fromM(buriedHeightM, "ft"))} unit="ft" />
                    <ResRow highlight label="Structural Height" value={fmt(structuralHeightM * 3.28084)} unit="ft" />
                  </>
                )}
                {openingsAreaM2 > 0 ? (
                  <>
                    <ResRow label="Gross Wall Area" value={fmt((result.grossWallAreaM2 || result.wallAreaM2 || 0) * 10.7639)} unit="ft²" />
                    <ResRow label="Opening Area"    value={fmt(openingsAreaM2 * 10.7639)} unit="ft²" />
                    <ResRow highlight label="Net Wall Area" value={fmt((result.netWallAreaM2 ?? result.wallAreaM2 ?? 0) * 10.7639)} unit="ft²" />
                    <ResRow label="Net Wall Area"   value={fmt(result.netWallAreaM2 ?? result.wallAreaM2 ?? 0)} unit="m²" />
                  </>
                ) : (
                  <>
                    <ResRow label="Wall Area" value={fmt((result.wallAreaM2 || 0) * 10.7639)} unit="ft²" />
                    <ResRow label="Wall Area" value={fmt(result.wallAreaM2 || 0)} unit="m²" />
                  </>
                )}
                {f.projectType === "curved" && curvedArcLengthM > 0 && (
                  <ResRow label="Arc Length" value={fmt(curvedArcLengthM * 3.28084)} unit="ft" />
                )}
              </ResSection>

              {/* Concrete */}
              {f.wallType === "concrete" && result.stemVolM3 != null && (
                <ResSection title="Concrete">
                  <ResRow label="Stem Volume" value={fmt(fromM3(result.stemVolM3, "ft3"))} unit="ft³" />
                  <ResRow label="Stem Volume" value={fmt(fromM3(result.stemVolM3, "yd3"))} unit="yd³" />
                  <ResRow label="Stem Volume" value={fmt(result.stemVolM3)} unit="m³" />
                  {f.footingEnabled && <ResRow label="Footing Volume" value={fmt(fromM3(result.footingVolM3, "yd3"))} unit="yd³" />}
                  {f.footingEnabled && <ResRow label="Footing Volume" value={fmt(result.footingVolM3)} unit="m³" />}
                  <ResRow label="Total Concrete" value={fmt(fromM3(result.totalConcreteM3, "yd3"))} unit="yd³" />
                  <ResRow label="Total Concrete" value={fmt(result.totalConcreteM3)} unit="m³" />
                  <ResRow highlight label={`Total w/ ${f.wasteConcrete}% Waste`} value={fmt(fromM3(result.totalConcreteWithWasteM3, "yd3"))} unit="yd³" />
                  <ResRow highlight label="" value={fmt(result.totalConcreteWithWasteM3)} unit="m³" />
                </ResSection>
              )}

              {/* Footing only for non-concrete walls */}
              {f.wallType !== "concrete" && f.footingEnabled && result.footingVolM3 != null && (
                <ResSection title="Footing Concrete">
                  <ResRow label="Footing Volume" value={fmt(fromM3(result.footingVolM3, "yd3"))} unit="yd³" />
                  <ResRow label="Footing Volume" value={fmt(result.footingVolM3)} unit="m³" />
                  <ResRow highlight label={`w/ ${f.wasteConcrete}% Waste`} value={fmt(fromM3(result.footingWithWasteM3, "yd3"))} unit="yd³" />
                </ResSection>
              )}

              {/* Blocks */}
              {showBlocks && result.numCourses != null && (
                <ResSection title="Block Quantities">
                  <ResRow label="Courses"            value={fmt(result.numCourses, 0)} unit="" />
                  <ResRow label="Blocks per Course"  value={fmt(result.blocksPerCourse, 0)} unit="" />
                  <ResRow label="Total Blocks (net)" value={fmt(result.totalBlocks, 0)} unit="" />
                  {result.halfBlocks > 0 && (
                    <ResRow label="Half Blocks — running bond est." value={fmt(result.halfBlocks, 0)} unit="" />
                  )}
                  {result.fullBlocks != null && (
                    <ResRow label="Full Blocks (est.)" value={fmt(result.fullBlocks, 0)} unit="" />
                  )}
                  <ResRow highlight label={`Total w/ ${f.wasteBlock}% Waste`} value={fmt(result.totalBlocksWaste, 0)} unit="blocks" />
                  {f.wallType === "segmental" && f.batEnabled && result.setbackPerCourseM > 0 && (
                    <>
                      <ResRow label="Setback / Course" value={fmt(result.derivedSetbackPerCourseIn, 3)} unit="in" />
                      <ResRow label="Total Batter Setback" value={fmt(result.totalSetbackM * 39.3701, 2)} unit="in" />
                      <ResRow label="Effective Batter Angle" value={fmt(result.effectiveBatAngleDeg, 2)} unit="°" />
                    </>
                  )}
                </ResSection>
              )}

              {/* Stone */}
              {showStone && result.stoneVolM3 != null && (
                <ResSection title="Stone Quantities">
                  <ResRow label="Total Wall Volume"  value={fmt(fromM3(result.totalVolM3, "ft3"))} unit="ft³" />
                  <ResRow label="Stone Volume (net)" value={fmt(fromM3(result.stoneVolM3, "yd3"))} unit="yd³" />
                  <ResRow label="Stone Volume (net)" value={fmt(result.stoneVolM3)} unit="m³" />
                  {result.mortarVolM3 > 0 && <ResRow label="Mortar Volume" value={fmt(fromM3(result.mortarVolM3, "ft3"))} unit="ft³" />}
                  {result.mortarVolM3 > 0 && <ResRow label="Mortar Volume" value={fmt(result.mortarVolM3)} unit="m³" />}
                  {result.voidVolM3 > 0   && <ResRow label="Void Volume (dry-stack)" value={fmt(fromM3(result.voidVolM3, "ft3"))} unit="ft³" />}
                  <ResRow highlight label={`Stone w/ ${f.wasteStone}% Waste`} value={fmt(fromM3(result.stoneVolWithWasteM3, "yd3"))} unit="yd³" />
                  <ResRow label="Stone Weight (approx.)" value={fmt(fromKg(result.stoneWeightKg, "lb"))} unit="lb" />
                  <ResRow label="Stone Weight (approx.)" value={fmt(result.stoneWeightKg)} unit="kg" />
                  <ResRow label="Stone Weight (approx.)" value={fmt(fromKg(result.stoneWeightKg, "tons"))} unit="short tons" />
                </ResSection>
              )}

              {/* Drainage */}
              {f.drainageEnabled && result.drainage && (
                <ResSection title="Drainage Materials">
                  <ResRow label="Drainage Gravel" value={fmt(fromM3(result.drainage.gravelVolM3, "yd3"))} unit="yd³" />
                  <ResRow label="Drainage Gravel" value={fmt(result.drainage.gravelVolM3)} unit="m³" />
                  <ResRow label="Perforated Drain Pipe" value={fmt(result.drainage.pipeLengthM * 3.28084)} unit="ft" />
                  <ResRow label="Perforated Drain Pipe" value={fmt(result.drainage.pipeLengthM)} unit="m" />
                  <ResRow label="Geotextile Fabric" value={fmt(result.drainage.geotextileAreaM2 * 10.7639)} unit="ft²" />
                  <ResRow label="Geotextile Fabric" value={fmt(result.drainage.geotextileAreaM2)} unit="m²" />
                </ResSection>
              )}

              {/* Backfill */}
              {result.backfill && (
                <ResSection title="Backfill">
                  <ResRow label="Backfill Volume (net)" value={fmt(fromM3(result.backfill.backfillVolM3, "yd3"))} unit="yd³" />
                  <ResRow label="Backfill Volume (net)" value={fmt(result.backfill.backfillVolM3)} unit="m³" />
                  <ResRow highlight label={`w/ ${f.wasteBackfill}% Waste`} value={fmt(fromM3(result.backfill.backfillWithWasteM3, "yd3"))} unit="yd³" />
                </ResSection>
              )}

              {/* Rebar */}
              {f.reinfEnabled && result.rebar && (
                <ResSection title="Reinforcement (Conceptual)">
                  <ResRow label="Vertical Bars"        value={fmt(result.rebar.numVert, 0)} unit="bars" />
                  <ResRow label="Total Vertical Length" value={fmt(result.rebar.totalVertM * 3.28084)} unit="ft" />
                  <ResRow label="Horizontal Bars"        value={fmt(result.rebar.numHoriz, 0)} unit="bars" />
                  <ResRow label="Total Horizontal Length" value={fmt(result.rebar.totalHorizM * 3.28084)} unit="ft" />
                  <ResRow label="Footing Bars"           value={fmt(result.rebar.numFtgLong + result.rebar.numTies, 0)} unit="bars" />
                  <ResRow label="Total Footing Length"   value={fmt((result.rebar.totalFtgLongM + result.rebar.totalTiesM) * 3.28084)} unit="ft" />
                  <ResRow label="Total Rebar (net)"      value={fmt(result.rebar.totalRebarM * 3.28084)} unit="ft" />
                  <ResRow highlight label={`Total w/ ${f.wasteRebar}% Waste`} value={fmt(result.rebar.totalRebarWithWasteM * 3.28084)} unit="ft" />
                  <ResRow label="Rebar Weight" value={fmt(fromKg(result.rebar.rebarWeightKg, "lb"))} unit="lb" />
                  <ResRow label="Rebar Weight" value={fmt(result.rebar.rebarWeightKg)} unit="kg" />
                </ResSection>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={handleCopy}
                  style={{ fontSize: 13, padding: "9px 18px", background: copied ? "#f0fdf4" : undefined, color: copied ? "#16a34a" : undefined }}>
                  {copied ? "✓ Copied!" : "📋 Copy Results"}
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ fontSize: 13, padding: "9px 18px" }}>
                  🖨️ Print
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ══ 11 · PRICE CHECKER ═════════════════════════════════════ */}
        <SectionCard id="priceChecker" title="Price Checker / Cost Estimator" icon="💰" open={open.priceChecker} onToggle={setOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {showConcrete && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Concrete</div>
                <PriceCheckerCard quantities={concQuantities} priceUnits={VOLUME_PRICE_UNITS.filter(u => ["yd3","m3"].includes(u.id))} defaultPriceUnit="yd3" />
              </div>
            )}
            {showBlocks && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Blocks</div>
                <PriceCheckerCard quantities={blockQuantities} priceUnits={BLOCK_PRICE_UNITS} defaultPriceUnit="perBlock" />
              </div>
            )}
            {showStone && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Stone</div>
                <PriceCheckerCard quantities={stoneQuantities}
                  priceUnits={[...WEIGHT_PRICE_UNITS.filter(u => ["lb","kg","ustons"].includes(u.id)), ...VOLUME_PRICE_UNITS.filter(u => ["yd3","m3"].includes(u.id))]}
                  defaultPriceUnit="ustons" />
              </div>
            )}
            {f.reinfEnabled && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Rebar</div>
                <PriceCheckerCard quantities={rebarQuantities} priceUnits={WEIGHT_PRICE_UNITS} defaultPriceUnit="kg" />
              </div>
            )}
            {f.drainageEnabled && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Drainage Gravel</div>
                <PriceCheckerCard quantities={grvelQuantities} priceUnits={VOLUME_PRICE_UNITS.filter(u => ["yd3","m3"].includes(u.id))} defaultPriceUnit="yd3" />
              </div>
            )}
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Backfill</div>
              <PriceCheckerCard quantities={bkfQuantities} priceUnits={VOLUME_PRICE_UNITS.filter(u => ["yd3","m3"].includes(u.id))} defaultPriceUnit="yd3" />
            </div>
          </div>
        </SectionCard>

        {/* ══ 12 · FORMULAS ══════════════════════════════════════════ */}
        <SectionCard id="formulas" title="Formulas & Engineering Methods" icon="📐" open={open.formulas} onToggle={setOpen}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Poured Concrete Wall</strong>
              <p style={{ margin: "6px 0 0" }}>
                Net Wall Area = (L × H) − Openings Area<br />
                Stem Volume = Net Wall Area × T (uniform) &nbsp;|&nbsp; Net Wall Area × (T_top + T_bottom) / 2 (tapered)<br />
                Footing Volume = L × Footing Width × Footing Thickness<br />
                Total Concrete = Stem + Footing &nbsp;·&nbsp; Order Qty = Total × (1 + waste%)
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>CMU Block Wall — ASTM C90</strong>
              <p style={{ margin: "6px 0 0" }}>
                Actual dims = Nominal − 3/8″ mortar joint per face dimension.<br />
                Standard 8×8×16″ nominal → actual 7⅝″ H × 15⅝″ L × 7⅝″ D.<br /><br />
                Effective Course Height = Actual H + Mortar Joint<br />
                Effective Block Length  = Actual L + Mortar Joint<br />
                Courses = ⌈ Exposed Height / Eff. Course H ⌉<br />
                Blocks/Course = ⌈ Wall Length / Eff. Block L ⌉<br />
                Total Blocks = Courses × Blocks/Course × (Net Area / Gross Area)<br />
                Half Blocks (running bond) ≈ 1 per course (for bond offset at ends)<br />
                Order Qty = ⌈ Total × (1 + waste%) ⌉
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Segmental Retaining Wall (SRW) — Batter Methods</strong>
              <p style={{ margin: "6px 0 0" }}>
                No mortar — actual block face dimensions used directly.<br />
                Courses = ⌈ Exposed Height / Block Face H ⌉ &nbsp;·&nbsp; Blocks/Course = ⌈ Wall Length / Block Face L ⌉<br /><br />
                <em>Method 1 — Angle:</em> Setback/Course = Block_H × tan(batter°)<br />
                <em>Method 2 — Setback/Course:</em> Direct input; Angle = atan(Setback / Block_H)<br />
                <em>Method 3 — Total Setback:</em> Setback/Course = Total_Setback / Num_Courses<br />
                Total Setback = Setback/Course × Num_Courses
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Curved Retaining Wall</strong>
              <p style={{ margin: "6px 0 0" }}>
                Arc Length = Radius × Central_Angle(radians) = Radius × Angle° × π / 180<br />
                Arc length replaces straight wall length in all material calculations.<br />
                Cross-section proportions (thickness, height) are identical to a straight wall.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Wall Openings</strong>
              <p style={{ margin: "6px 0 0" }}>
                Total Opening Area = Σ (Opening Width × Opening Height)<br />
                Net Wall Area = Gross Wall Area − Total Opening Area<br />
                Block counts and concrete / stone volumes use Net Wall Area.<br />
                Block reduction = Gross Count × (Net Area / Gross Area)<br />
                Note: Openings not applied to stepped wall projects — deduct per section manually.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Buried / Below-Grade Height</strong>
              <p style={{ margin: "6px 0 0" }}>
                Structural Height = Exposed Height + Buried Height<br />
                Block counts and visible face area use Exposed Height only.<br />
                Rebar vertical bar length = Structural Height + 12″ development into footing.<br />
                Backfill volume uses Structural Height × Backfill Depth.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Stone Wall</strong>
              <p style={{ margin: "6px 0 0" }}>
                Total Wall Volume = Net Wall Area × Avg. Thickness<br />
                Mortared: Stone ≈ 70% · Mortar ≈ 30% &nbsp;|&nbsp; Dry-Stack: Stone ≈ 75% · Voids ≈ 25%<br />
                Stone Weight = Stone Volume (with waste) × Density
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Drainage System</strong>
              <p style={{ margin: "6px 0 0" }}>
                Gravel Volume = L × Drain Width × Drain Depth<br />
                Pipe Length = Wall Length<br />
                Geotextile = L × (Drain Width + 2 × Drain Depth + Fabric Overlap)<br />
                Practical defaults: 12″ wide, 12″ deep gravel zone, 4″ pipe, 12″ overlap.
              </p>
            </div>

            <div>
              <strong style={{ color: "var(--text-primary)" }}>Reinforcement (Conceptual)</strong>
              <p style={{ margin: "4px 0 0", color: "#92400e" }}>⚠️ Conceptual material estimates only — not structural design.</p>
              <p style={{ margin: "4px 0 0" }}>
                Vertical Bars = ⌈ L / Vert. Spacing ⌉ + 1; Length = Structural H + 300 mm development<br />
                Horizontal Bars = ⌈ Exposed H / Horiz. Spacing ⌉; Length = L + 300 mm lap<br />
                Footing Longitudinal = 2 bars; Length = L + 300 mm<br />
                Footing Ties = ⌈ L / 400 mm ⌉ + 1; Length = Footing Width − 75 mm cover<br />
                Rebar Weight = Total Length × Bar Weight per Metre (ASTM A615)
              </p>
            </div>

          </div>
        </SectionCard>

        {/* ══ 13 · EXAMPLES ══════════════════════════════════════════ */}
        <SectionCard id="examples" title="Verified Examples" icon="📖" open={open.examples} onToggle={setOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "var(--font-display)", fontSize: 13 }}>

            <ExampleBlock title="Example 1 — Poured Concrete Wall">
              <p>L = 30 ft, H = 4 ft, Stem T = 8 in, Footing = 24 in × 12 in</p>
              <p><strong>Stem Volume</strong> = 30 × 4 × (8/12) = <strong>80.0 ft³ = 2.96 yd³</strong></p>
              <p><strong>Footing Volume</strong> = 30 × 2 × 1 = <strong>60.0 ft³ = 2.22 yd³</strong></p>
              <p><strong>Total</strong> = 140 ft³ = <strong>5.19 yd³</strong> · With 5% waste = <strong>5.44 yd³</strong></p>
            </ExampleBlock>

            <ExampleBlock title="Example 2 — CMU Block Wall">
              <p>L = 40 ft, H = 6 ft, 8×8×16″ block (actual 7⅝″ H × 15⅝″ L), mortar = 3/8″</p>
              <p>Eff. course H = 8.0″ · Eff. block L = 16.0″</p>
              <p><strong>Courses</strong> = ⌈72 / 8.0⌉ = <strong>9</strong> · <strong>Blocks/Course</strong> = ⌈480 / 16.0⌉ = <strong>30</strong></p>
              <p><strong>Total</strong> = 270 · Half blocks (running bond) ≈ 9 · Full blocks ≈ 261</p>
              <p><strong>With 5% Waste</strong> = ⌈270 × 1.05⌉ = <strong>284 blocks</strong></p>
            </ExampleBlock>

            <ExampleBlock title="Example 3 — Segmental Wall with Batter">
              <p>L = 25 ft, H = 3 ft, 12×6×12″ SRW block, 6° batter (angle method)</p>
              <p>Courses = ⌈36 / 6⌉ = <strong>6</strong> · Blocks/Course = ⌈300 / 12⌉ = <strong>25</strong></p>
              <p><strong>Total</strong> = 150 blocks · With 5% = 158 blocks</p>
              <p>Setback/Course = 6 in × tan(6°) = <strong>0.631 in</strong> · Total Setback = <strong>3.79 in</strong></p>
              <p><em>Total-setback method equiv.:</em> enter 3.79 in total → 3.79/6 = 0.632 in/course ✓</p>
            </ExampleBlock>

            <ExampleBlock title="Example 4 — Mortared Stone Wall">
              <p>L = 20 ft, H = 3 ft, Thickness = 18 in, Granite (2,750 kg/m³)</p>
              <p>Total Volume = 20 × 3 × 1.5 = <strong>90.0 ft³ = 3.33 yd³ = 2.55 m³</strong></p>
              <p>Stone Volume (70%) = <strong>63 ft³ = 2.33 yd³ = 1.78 m³</strong></p>
              <p>Stone Weight = 1.78 × 2,750 = <strong>4,903 kg = 10,808 lb ≈ 5.40 short tons</strong></p>
            </ExampleBlock>

            <ExampleBlock title="Example 5 — Curved Wall">
              <p>Radius = 50 ft, Central Angle = 90°, H = 4 ft, 8×8×16″ CMU</p>
              <p>Arc Length = 50 × (90° × π/180) = 50 × 1.5708 = <strong>78.54 ft</strong></p>
              <p>Courses = ⌈48 / 8.0⌉ = <strong>6</strong> · Blocks/Course = ⌈942 / 16⌉ = <strong>59</strong></p>
              <p><strong>Total</strong> = 6 × 59 = 354 blocks · With 5% waste = <strong>372 blocks</strong></p>
            </ExampleBlock>

          </div>
        </SectionCard>

        {/* ══ 14 · NOTES ═════════════════════════════════════════════ */}
        <SectionCard id="notes" title="Important Notes & Disclaimer" icon="⚠️" open={open.notes} onToggle={setOpen}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>This calculator provides <strong>material quantity and cost estimates only</strong>. It is not a structural engineering tool.</li>
              <li>Retaining wall stability depends on soil conditions, surcharge loads, hydrostatic pressure, frost depth, and seismic factors — none of which are evaluated here.</li>
              <li>Footing design, reinforcement requirements, drainage design, and code compliance must be verified by a <strong>licensed structural or geotechnical engineer</strong>.</li>
              <li>CMU block dimensions follow <strong>ASTM C90</strong>: actual = nominal − 3/8″ mortar joint per face. A standard "8×8×16″" block has actual dimensions of 7⅝″ × 15⅝″ × 7⅝″.</li>
              <li>Half-block estimates (running bond) assume a straight wall with alternating-course offset. Add corner blocks separately for L-shaped or return walls.</li>
              <li>Stone density values (Granite 2,750; Limestone 2,550; Basalt 2,900; Marble 2,720 kg/m³) are typical engineering reference values. Actual density varies by quarry.</li>
              <li>Block waste percentages are estimates. Actual waste depends on cuts, breakage, and installation methods.</li>
              <li>Rebar quantities are conceptual estimates using common spacing assumptions, not engineered designs. Structural height (exposed + buried) is used for vertical bar length.</li>
              <li>Concrete volumes use 5% default waste. Ready-mix concrete is typically ordered in ¼-yd³ increments — round up accordingly.</li>
              <li>Wall openings subtract area proportionally. For complex opening layouts, verify block counts at each opening jamb.</li>
              <li>Curved wall calculations use arc length as an equivalent straight-wall length — applicable for gradual curves where cross-section is constant.</li>
              <li>Local building codes, permit requirements, and HOA restrictions may apply to retaining walls.</li>
            </ul>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

// ── Local helpers ──────────────────────────────────────────────────

function ExampleBlock({ title, children }) {
  return (
    <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function buildCopyText(result, f, openingsAreaM2, structuralHeightM, buriedHeightM) {
  const lines = [
    "=== Retaining Wall Calculator ===",
    `Wall Type: ${WALL_TYPES.find(w => w.id === f.wallType)?.label || f.wallType}`,
    `Project Type: ${f.projectType}`,
    "",
  ];
  if (buriedHeightM > 0) {
    lines.push(`Structural Height: ${fmt(structuralHeightM * 3.28084)} ft (${fmt(structuralHeightM)} m)`);
  }
  if (openingsAreaM2 > 0) {
    lines.push(`Opening Area: ${fmt(openingsAreaM2 * 10.7639)} ft²`);
    lines.push(`Net Wall Area: ${fmt((result.netWallAreaM2 ?? result.wallAreaM2 ?? 0) * 10.7639)} ft²`);
  } else if (result.wallAreaM2) {
    lines.push(`Wall Area: ${fmt(result.wallAreaM2 * 10.7639)} ft²  |  ${fmt(result.wallAreaM2)} m²`);
  }
  if (result.totalConcreteWithWasteM3) {
    lines.push(`Total Concrete (inc. waste): ${fmt(fromM3(result.totalConcreteWithWasteM3, "yd3"))} yd³  |  ${fmt(result.totalConcreteWithWasteM3)} m³`);
  }
  if (result.totalBlocksWaste) {
    lines.push(`Total Blocks (inc. waste): ${fmt(result.totalBlocksWaste, 0)} blocks  (${result.numCourses} courses × ${result.blocksPerCourse}/course)`);
    if (result.halfBlocks > 0) lines.push(`  Half Blocks (running bond): ${fmt(result.halfBlocks, 0)}`);
  }
  if (result.stoneVolWithWasteM3) {
    lines.push(`Stone Volume (inc. waste): ${fmt(fromM3(result.stoneVolWithWasteM3, "yd3"))} yd³`);
    lines.push(`Stone Weight: ${fmt(fromKg(result.stoneWeightKg, "lb"))} lb  |  ${fmt(result.stoneWeightKg)} kg`);
  }
  if (result.drainage) {
    lines.push(`Drainage Gravel: ${fmt(fromM3(result.drainage.gravelVolM3, "yd3"))} yd³`);
    lines.push(`Drain Pipe: ${fmt(result.drainage.pipeLengthM * 3.28084)} ft`);
    lines.push(`Geotextile: ${fmt(result.drainage.geotextileAreaM2 * 10.7639)} ft²`);
  }
  if (result.backfill) {
    lines.push(`Backfill (inc. waste): ${fmt(fromM3(result.backfill.backfillWithWasteM3, "yd3"))} yd³`);
  }
  if (result.rebar) {
    lines.push(`Rebar (inc. waste): ${fmt(result.rebar.totalRebarWithWasteM * 3.28084)} ft  |  ${fmt(result.rebar.rebarWeightKg)} kg`);
  }
  lines.push("", "Generated by tolz.org Retaining Wall Calculator");
  return lines;
}
