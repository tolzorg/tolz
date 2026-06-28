import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  SHAPES, DIM_UNITS, AREA_OUTPUT_UNITS,
  dimToFt, fromSqFt, toSqFt, fmtN,
} from "../../../utils/squareFootageCalc";
import { SHAPE_DIAGRAMS } from "../square-footage-calculator/ShapeDiagrams";
import { MATERIALS, SHAPE_EXAMPLES } from "../../../utils/squareYardsCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";

// ── Design tokens ─────────────────────────────────────────────

const LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 7,
  userSelect: "none",
};

const INPUT = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--text-primary)",
  background: "var(--bg-white)",
  outline: "none",
  transition: "border-color var(--transition)",
  boxSizing: "border-box",
};

const SELECT = {
  ...INPUT,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

// ── Shared primitives ─────────────────────────────────────────

function SectionCard({ id, title, icon, open, onToggle, children }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "15px 20px", background: "none", border: "none",
          borderBottom: open ? "1px solid var(--border)" : "none",
          cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 14, color: "var(--text-primary)", textAlign: "left",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>{title}
        </span>
        <svg
          width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ padding: "18px 20px" }}>{children}</div>}
    </div>
  );
}

function FieldGroup({ label, hint, error, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && (
          <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help", lineHeight: 1 }}>ⓘ</span>
        )}
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

function ResultRow({ label, value, unit, accent, bold }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "9px 0", borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: bold ? 800 : 700,
        fontSize: bold ? 16 : 14, color: accent ? "var(--accent)" : "var(--text-primary)",
      }}>
        {value}{" "}
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>{unit}</span>
      </span>
    </div>
  );
}

function FormulaBox({ text }) {
  return (
    <div style={{
      background: "var(--bg-muted)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "11px 16px",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: "clamp(11px, 2vw, 13px)", color: "var(--text-primary)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

// ── DimensionInput ────────────────────────────────────────────

function DimensionInput({ val, setVal, unit, setUnit, compA, setCompA, compB, setCompB, placeholder, onBlurField, hasError }) {
  const isCompound = unit === "ft_in" || unit === "m_cm";
  const [labelA, labelB] = unit === "ft_in" ? ["ft", "in"] : ["m", "cm"];
  const borderColor = hasError ? "var(--error)" : "var(--border)";
  const focusColor  = hasError ? "var(--error)" : "var(--accent)";

  function mkInput(v, set, ph) {
    return (
      <input
        type="number" inputMode="decimal" min="0" step="any"
        value={v} placeholder={ph || "0"}
        onChange={(e) => set(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = focusColor)}
        onBlur={(e) => { e.target.style.borderColor = borderColor; if (onBlurField) onBlurField(); }}
        style={{ ...INPUT, flex: "1 1 70px", minWidth: 0, borderColor }}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {isCompound ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 90px", minWidth: 0 }}>
            {mkInput(compA, setCompA, "0")}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{labelA}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 90px", minWidth: 0 }}>
            {mkInput(compB, setCompB, "0")}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{labelB}</span>
          </div>
        </>
      ) : (
        mkInput(val, setVal, placeholder || "0")
      )}
      <select
        value={unit} onChange={(e) => setUnit(e.target.value)}
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 190 }}
      >
        {DIM_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function isDimValid(val, unit, compA, compB) {
  if (unit === "ft_in" || unit === "m_cm") {
    return (parseFloat(compA) || 0) + (parseFloat(compB) || 0) > 0;
  }
  const n = parseFloat(val);
  return isFinite(n) && n > 0;
}

const ALL_FIELD_IDS = [
  "length", "width", "side", "base", "height",
  "topWidth", "bottomWidth", "majorAxis", "minorAxis",
  "radius", "diameter", "lengthA", "widthA", "lengthB", "widthB",
  "outerRadius", "innerRadius",
];

const EMPTY_DIMS  = Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, ""]));
const EMPTY_COMP  = Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, ""]));
const DEFAULT_UNITS = Object.fromEntries(ALL_FIELD_IDS.map((id) => [id, "ft"]));

// ── Main component ────────────────────────────────────────────

export default function SquareYardsCalculatorTool() {
  // Shape state
  const [shapeId,    setShapeId]    = useState("rectangle");
  const [circleMode, setCircleMode] = useState("radius");
  const [dims,       setDims]       = useState({ ...EMPTY_DIMS });
  const [units,      setUnits]      = useState({ ...DEFAULT_UNITS });
  const [compA,      setCompA]      = useState({ ...EMPTY_COMP });
  const [compB,      setCompB]      = useState({ ...EMPTY_COMP });

  // Custom polygon
  const [customAreaVal,  setCustomAreaVal]  = useState("");
  const [customAreaUnit, setCustomAreaUnit] = useState("sqyd");

  // Area output unit (default yd²)
  const [areaOutputUnit, setAreaOutputUnit] = useState("sqyd");

  // Material estimator
  const [matId,        setMatId]        = useState("none");
  const [coverageSqYd, setCoverageSqYd] = useState("");
  const [coverageUnit, setCoverageUnit] = useState("");
  const [wastePct,     setWastePct]     = useState("10");

  // UI state
  const [open,    setOpen]    = useState(new Set(["shape", "dimensions"]));
  const [touched, setTouched] = useState({});
  const [copied,  setCopied]  = useState(false);
  const copyTimer = useRef(null);

  const shape = useMemo(() => SHAPES.find((s) => s.id === shapeId), [shapeId]);

  const activeFields = useMemo(() => {
    if (shapeId === "circle") {
      return circleMode === "radius"
        ? [{ id: "radius",   label: "Radius",   placeholder: "e.g. 5" }]
        : [{ id: "diameter", label: "Diameter", placeholder: "e.g. 10" }];
    }
    if (shapeId === "custom") return [];
    return shape?.fields || [];
  }, [shapeId, circleMode, shape]);

  // Reset dims on shape change
  useEffect(() => {
    setDims({ ...EMPTY_DIMS });
    setCompA({ ...EMPTY_COMP });
    setCompB({ ...EMPTY_COMP });
    setTouched({});
  }, [shapeId]);

  // Reset circle value on mode toggle
  useEffect(() => {
    setDims((prev) => ({ ...prev, radius: "", diameter: "" }));
    setCompA((prev) => ({ ...prev, radius: "", diameter: "" }));
    setCompB((prev) => ({ ...prev, radius: "", diameter: "" }));
  }, [circleMode]);

  // Auto-fill coverage rate when material changes
  const selectedMaterial = useMemo(() => MATERIALS.find((m) => m.id === matId), [matId]);
  useEffect(() => {
    if (selectedMaterial?.coverageSqYd) {
      setCoverageSqYd(String(selectedMaterial.coverageSqYd));
      setCoverageUnit(selectedMaterial.unitLabel || "unit");
    } else {
      setCoverageSqYd("");
      setCoverageUnit("");
    }
  }, [matId, selectedMaterial]);

  const toggleSection = useCallback((id) => setOpen((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  }), []);

  const touch = useCallback((k) => setTouched((p) => ({ ...p, [k]: true })), []);

  const setDim  = useCallback((id, v) => setDims((p)  => ({ ...p, [id]: v })), []);
  const setUnit = useCallback((id, v) => setUnits((p) => ({ ...p, [id]: v })), []);
  const setCA   = useCallback((id, v) => setCompA((p) => ({ ...p, [id]: v })), []);
  const setCB   = useCallback((id, v) => setCompB((p) => ({ ...p, [id]: v })), []);

  // Dims in feet
  const dimsInFt = useMemo(() => {
    const result = {};
    const fieldIds = activeFields.map((f) => f.id);
    for (const fid of fieldIds) {
      result[fid] = dimToFt(dims[fid], units[fid] || "ft", compA[fid] || "", compB[fid] || "");
    }
    if (shapeId === "circle" && circleMode === "diameter" && result.diameter) {
      result.radius = result.diameter / 2;
    }
    if (shapeId === "custom") {
      result.customArea = toSqFt(customAreaVal, customAreaUnit);
    }
    return result;
  }, [dims, units, compA, compB, shapeId, circleMode, activeFields, customAreaVal, customAreaUnit]);

  const shapeError = useMemo(() => {
    if (!shape?.validate) return null;
    return shape.validate(dimsInFt);
  }, [shape, dimsInFt]);

  const calcResult = useMemo(() => {
    if (shapeError) return null;
    return shape?.calc(dimsInFt) || null;
  }, [shape, dimsInFt, shapeError]);

  const areaSqFt       = calcResult?.areaSqFt       ?? null;
  const perimeterFt    = calcResult?.perimeterFt     ?? null;
  const circumferenceFt = calcResult?.circumferenceFt ?? null;
  const perimLabel     = calcResult?.perimeterLabel  ?? null;

  // Key derived values
  const areaSqYd  = useMemo(() => areaSqFt ? areaSqFt / 9          : null, [areaSqFt]);
  const areaSqFtD = useMemo(() => areaSqFt                         ?? null, [areaSqFt]);
  const areaSqIn  = useMemo(() => areaSqFt ? areaSqFt * 144        : null, [areaSqFt]);
  const areaSqM   = useMemo(() => areaSqFt ? areaSqFt * 0.092903   : null, [areaSqFt]);
  const areaAcres = useMemo(() => areaSqFt ? areaSqFt / 43560      : null, [areaSqFt]);
  const areaHa    = useMemo(() => areaSqFt ? areaSqFt / 107639.1   : null, [areaSqFt]);
  const areaDisplay = useMemo(() => fromSqFt(areaSqFt, areaOutputUnit), [areaSqFt, areaOutputUnit]);

  const areaSymbol = AREA_OUTPUT_UNITS.find((u) => u.id === areaOutputUnit)?.symbol || areaOutputUnit;

  const perimFt = perimeterFt || circumferenceFt;
  const perimM  = perimFt ? perimFt * 0.3048 : null;
  const perimYd = perimFt ? perimFt / 3      : null;
  const displayPerimLabel = shapeId === "circle" ? "Circumference" : (perimLabel || "Perimeter");

  // Material estimator
  const coverage      = parseFloat(coverageSqYd);
  const waste         = Math.max(0, parseFloat(wastePct) || 0);
  const areaWithWaste = areaSqYd ? areaSqYd * (1 + waste / 100) : null;
  const unitsNeeded   = areaWithWaste && coverage > 0 ? areaWithWaste / coverage : null;
  const unitsRounded  = unitsNeeded ? Math.ceil(unitsNeeded) : null;

  const hasResults = !!areaSqFt;

  useEffect(() => {
    if (hasResults) setOpen((prev) => { const n = new Set(prev); n.add("results"); return n; });
  }, [hasResults]);

  function handleShapeChange(newId) {
    setShapeId(newId);
    setCustomAreaVal("");
  }

  function handleCopy() {
    if (!hasResults) return;
    const lines = [
      `Square Yards Calculator — ${shape?.label}`,
      `Square Yards:   ${fmtN(areaSqYd, 4)} yd²`,
      `Square Feet:    ${fmtN(areaSqFtD, 4)} ft²`,
      `Square Inches:  ${fmtN(areaSqIn, 2)} in²`,
      `Square Meters:  ${fmtN(areaSqM, 4)} m²`,
      `Acres:          ${fmtN(areaAcres, 6)} ac`,
      `Hectares:       ${fmtN(areaHa, 8)} ha`,
    ];
    if (perimFt) lines.push(`${displayPerimLabel}: ${fmtN(perimFt, 4)} ft (${fmtN(perimYd, 4)} yd)`);
    if (unitsRounded && selectedMaterial?.id !== "none") {
      lines.push(`Material (${selectedMaterial.label}): ${unitsRounded} ${coverageUnit}`);
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setShapeId("rectangle");
    setCircleMode("radius");
    setDims({ ...EMPTY_DIMS });
    setUnits({ ...DEFAULT_UNITS });
    setCompA({ ...EMPTY_COMP });
    setCompB({ ...EMPTY_COMP });
    setCustomAreaVal("");
    setCustomAreaUnit("sqyd");
    setAreaOutputUnit("sqyd");
    setMatId("none");
    setCoverageSqYd("");
    setCoverageUnit("");
    setWastePct("10");
    setTouched({});
    setCopied(false);
  }

  function fieldError(fieldId) {
    if (!touched[fieldId]) return null;
    const u = units[fieldId] || "ft";
    if (!isDimValid(dims[fieldId], u, compA[fieldId] || "", compB[fieldId] || "")) {
      return "Enter a positive value.";
    }
    return null;
  }

  const shapeExample = SHAPE_EXAMPLES[shapeId] ?? null;

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Shape ── */}
      <SectionCard id="shape" title="Shape" icon="📐" open={open.has("shape")} onToggle={toggleSection}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <FieldGroup label="Select shape" hint="Choose the shape that best describes your area. The required dimension inputs will update automatically.">
              <select
                value={shapeId}
                onChange={(e) => handleShapeChange(e.target.value)}
                style={{ ...SELECT, width: "100%" }}
              >
                {SHAPES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </FieldGroup>

            {shapeId === "circle" && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {[{ id: "radius", label: "Use Radius" }, { id: "diameter", label: "Use Diameter" }].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCircleMode(opt.id)}
                    style={{
                      padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                      border: "1.5px solid", cursor: "pointer", transition: "all .15s",
                      fontFamily: "var(--font-display)",
                      background:  circleMode === opt.id ? "var(--accent)" : "transparent",
                      borderColor: circleMode === opt.id ? "var(--accent)" : "var(--border)",
                      color:       circleMode === opt.id ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SVG Diagram */}
          <div style={{
            flex: "0 0 auto", width: 160, height: 120,
            border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)",
            background: "var(--bg-muted)", overflow: "hidden", padding: 4,
          }}>
            {SHAPE_DIAGRAMS[shapeId] || null}
          </div>
        </div>
      </SectionCard>

      {/* ── Dimensions ── */}
      <SectionCard id="dimensions" title="Dimensions" icon="📏" open={open.has("dimensions")} onToggle={toggleSection}>
        {shapeId === "custom" ? (
          <FieldGroup label="Area" hint="Enter your area directly in any unit">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={customAreaVal} placeholder="e.g. 20"
                onChange={(e) => setCustomAreaVal(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; touch("customArea"); }}
                style={{ ...INPUT, flex: "1 1 100px", minWidth: 0 }}
              />
              <select
                value={customAreaUnit}
                onChange={(e) => setCustomAreaUnit(e.target.value)}
                style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 220 }}
              >
                {AREA_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
            {touched.customArea && !toSqFt(customAreaVal, customAreaUnit) && (
              <p style={{ fontSize: 11.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 5 }}>
                Enter a positive area value.
              </p>
            )}
          </FieldGroup>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {shapeId === "lshape" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {["lengthA", "widthA"].map((fid) => {
                    const field = shape?.fields.find((f) => f.id === fid);
                    if (!field) return null;
                    return (
                      <div key={fid} style={{ flex: "1 1 220px", minWidth: 0 }}>
                        <FieldGroup label={field.label} error={fieldError(fid)}>
                          <DimensionInput
                            val={dims[fid]} setVal={(v) => setDim(fid, v)}
                            unit={units[fid] || "ft"} setUnit={(u) => setUnit(fid, u)}
                            compA={compA[fid] || ""} setCompA={(v) => setCA(fid, v)}
                            compB={compB[fid] || ""} setCompB={(v) => setCB(fid, v)}
                            placeholder={field.placeholder}
                            onBlurField={() => touch(fid)} hasError={!!fieldError(fid)}
                          />
                        </FieldGroup>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {["lengthB", "widthB"].map((fid) => {
                    const field = shape?.fields.find((f) => f.id === fid);
                    if (!field) return null;
                    return (
                      <div key={fid} style={{ flex: "1 1 220px", minWidth: 0 }}>
                        <FieldGroup label={field.label} error={fieldError(fid)}>
                          <DimensionInput
                            val={dims[fid]} setVal={(v) => setDim(fid, v)}
                            unit={units[fid] || "ft"} setUnit={(u) => setUnit(fid, u)}
                            compA={compA[fid] || ""} setCompA={(v) => setCA(fid, v)}
                            compB={compB[fid] || ""} setCompB={(v) => setCB(fid, v)}
                            placeholder={field.placeholder}
                            onBlurField={() => touch(fid)} hasError={!!fieldError(fid)}
                          />
                        </FieldGroup>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              activeFields.map((field) => (
                <FieldGroup key={field.id} label={field.label} error={fieldError(field.id)}>
                  <DimensionInput
                    val={dims[field.id]} setVal={(v) => setDim(field.id, v)}
                    unit={units[field.id] || "ft"} setUnit={(u) => setUnit(field.id, u)}
                    compA={compA[field.id] || ""} setCompA={(v) => setCA(field.id, v)}
                    compB={compB[field.id] || ""} setCompB={(v) => setCB(field.id, v)}
                    placeholder={field.placeholder}
                    onBlurField={() => touch(field.id)} hasError={!!fieldError(field.id)}
                  />
                </FieldGroup>
              ))
            )}
            {shapeError && (
              <p style={{ fontSize: 12.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 600, margin: 0 }}>
                {shapeError}
              </p>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="📊" open={open.has("results")} onToggle={toggleSection}>
        {!hasResults ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "12px 0" }}>
            Enter dimensions above to see results.
          </p>
        ) : (
          <>
            {/* Area unit selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <label style={{ ...LBL, marginBottom: 0 }}>Area unit</label>
              <select value={areaOutputUnit} onChange={(e) => setAreaOutputUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 230 }}>
                {AREA_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>

            {/* Rows */}
            <div>
              <ResultRow label="Square Yards"  value={fmtN(areaSqYd, 4)}  unit="yd²" accent bold />
              <ResultRow label={`Area (${areaSymbol})`} value={fmtN(areaDisplay, 4)} unit={areaSymbol} />
              <ResultRow label="Square Feet"   value={fmtN(areaSqFtD, 4)} unit="ft²" />
              <ResultRow label="Square Inches" value={fmtN(areaSqIn, 2)}  unit="in²" />
              <ResultRow label="Square Meters" value={fmtN(areaSqM, 4)}   unit="m²"  />
              <ResultRow label="Acres"         value={fmtN(areaAcres, 6)} unit="ac"  />
              <ResultRow label="Hectares"      value={fmtN(areaHa, 8)}    unit="ha"  />
              {perimFt && (
                <ResultRow
                  label={displayPerimLabel}
                  value={`${fmtN(perimFt, 4)} ft`}
                  unit={`(${fmtN(perimYd, 4)} yd)`}
                />
              )}
            </div>

            {/* Highlight box — yd² primary */}
            <div style={{
              marginTop: 14, padding: "16px 20px",
              background: "var(--accent-light)", border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-md)", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                {shape?.label} — Square Yards
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 5vw, 40px)", color: "var(--accent)", letterSpacing: "-0.02em" }}>
                {fmtN(areaSqYd, 4)}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--accent)", marginTop: 4 }}>
                yd²
              </div>
              {perimFt && (
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 13, color: "var(--accent)", marginTop: 8, opacity: 0.85 }}>
                  {displayPerimLabel}: {fmtN(perimYd, 2)} yd ({fmtN(perimFt, 2)} ft)
                </div>
              )}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                onClick={handleCopy}
                style={{
                  fontSize: 13, padding: "8px 16px",
                  background:  copied ? "#f0fdf4" : undefined,
                  color:       copied ? "#16a34a" : undefined,
                  borderColor: copied ? "#86efac" : undefined,
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy Results"}
              </button>
              <button
                className="btn btn-ghost" onClick={handleReset}
                style={{ fontSize: 13, padding: "8px 16px", color: "var(--text-muted)" }}
              >
                ↺ Reset
              </button>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Material Estimator ── */}
      <SectionCard id="material" title="Material Estimator" icon="🏗️" open={open.has("material")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FieldGroup label="Material" hint="Select a material to pre-fill its typical coverage rate. You can override the rate and waste factor below.">
            <select
              value={matId}
              onChange={(e) => setMatId(e.target.value)}
              style={{ ...SELECT, width: "100%" }}
            >
              {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </FieldGroup>

          {matId !== "none" && selectedMaterial && (
            <>
              {selectedMaterial.hint && (
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                  ℹ️ {selectedMaterial.hint}
                </p>
              )}

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: "2 1 160px", minWidth: 0 }}>
                  <FieldGroup label={`Coverage (yd² per ${coverageUnit || "unit"})`} hint="How many square yards one unit (bag, roll, or pallet) covers. Check your product label — the default is a common estimate.">
                    <input
                      type="number" inputMode="decimal" min="0.001" step="any"
                      value={coverageSqYd}
                      onChange={(e) => setCoverageSqYd(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      style={{ ...INPUT }}
                      placeholder="e.g. 1"
                    />
                  </FieldGroup>
                </div>
                <div style={{ flex: "1 1 100px", minWidth: 0 }}>
                  <FieldGroup label="Waste factor (%)" hint="Extra material for cuts, mistakes, and overages">
                    <input
                      type="number" inputMode="decimal" min="0" max="99" step="1"
                      value={wastePct}
                      onChange={(e) => setWastePct(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      style={{ ...INPUT }}
                      placeholder="10"
                    />
                  </FieldGroup>
                </div>
              </div>

              {areaSqYd && unitsNeeded ? (
                <div style={{
                  padding: "14px 18px", borderRadius: "var(--radius-md)",
                  background: "var(--accent-light)", border: "1.5px solid var(--accent)",
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                    Estimated material needed
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--accent)" }}>
                        {unitsRounded}
                      </span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--accent)", marginLeft: 6 }}>
                        {coverageUnit || "units"}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5, color: "var(--accent)", marginTop: 6, opacity: 0.9, lineHeight: 1.6 }}>
                    {fmtN(areaSqYd, 2)} yd² ÷ {fmtN(coverage, 4)} yd²/{coverageUnit || "unit"} = {fmtN(unitsNeeded, 2)} {coverageUnit || "units"}
                    {waste > 0 && ` + ${waste}% waste = ${fmtN(unitsNeeded, 2)} → rounded up to ${unitsRounded}`}
                  </div>
                  {waste > 0 && (
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "var(--accent)", marginTop: 4, opacity: 0.8 }}>
                      Area with waste: {fmtN(areaWithWaste, 2)} yd²
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
                  Enter dimensions and a coverage rate to estimate material.
                </p>
              )}
            </>
          )}
        </div>
      </SectionCard>

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={{
          sqyd:  areaSqYd,
          sqft:  areaSqFtD,
          sqm:   areaSqM,
          acre:  areaAcres,
        }}
        priceUnits={[
          { id: "sqyd", label: "per yd²",  display: "yd²"  },
          { id: "sqft", label: "per ft²",  display: "ft²"  },
          { id: "sqm",  label: "per m²",   display: "m²"   },
          { id: "acre", label: "per acre", display: "acre" },
        ]}
        defaultPriceUnit="sqyd"
      />

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢" open={open.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(shape?.formulaLines || []).map((line) => (
            <FormulaBox key={line} text={line} />
          ))}
          <FormulaBox text="Square Yards = Area (ft²) ÷ 9" />
          {shapeId === "ellipse" && (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: "4px 0 0" }}>
              Perimeter uses Ramanujan's approximation (error &lt; 0.02%).
            </p>
          )}
          {shapeId === "triangle" && (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: "4px 0 0" }}>
              Perimeter assumes an isosceles triangle. For scalene triangles all three sides are needed.
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── Example ── */}
      <SectionCard id="example" title="Example" icon="📝" open={open.has("example")} onToggle={toggleSection}>
        {!shapeExample ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
            Enter your own area in the Dimensions section above.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shapeExample.rows.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", minWidth: 160, flexShrink: 0 }}>{k}:</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 6, padding: "10px 14px", background: "var(--accent-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
                Result: {shapeExample.result}
              </span>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Notes ── */}
      <SectionCard id="notes" title="Notes" icon="💡" open={open.has("notes")} onToggle={toggleSection}>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "1 square yard = 9 ft² · 1 m² = 1.196 yd² · 1 acre = 4,840 yd² · 1 hectare = 11,960 yd².",
            "Carpet, sod, and artificial grass are almost always sold and installed by sq yd in the US.",
            "Compound units (ft/in, m/cm) let you enter mixed measurements without manual conversion.",
            "Circle: Area = πr². Toggle to Diameter if you measured the full width instead of the radius.",
            "Ellipse perimeter uses Ramanujan's approximation — accurate to < 0.02% for most shapes.",
            "Triangle and Trapezoid perimeters assume isosceles (symmetric) shapes.",
            "Ring: inner radius must be smaller than outer radius.",
            "Material estimator: always add 5–15% waste for cuts, overlaps, and spills. Coverage rates are estimates — check the product label.",
            "Soccer field reference: FIFA standard size 105 m × 68 m ≈ 8,539 yd².",
          ].map((tip) => (
            <li key={tip} style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {tip}
            </li>
          ))}
        </ul>
      </SectionCard>

    </div>
  );
}
