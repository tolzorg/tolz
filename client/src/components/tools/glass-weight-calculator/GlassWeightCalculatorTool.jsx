import { useState, useMemo, useRef } from "react";
import {
  GLASS_TYPES, SHAPES, LENGTH_UNITS, THICKNESS_UNITS,
  AREA_UNITS, VOLUME_UNITS, WEIGHT_UNITS, DENSITY_UNITS,
  DEFAULT_GLASS_TYPE_ID, DEFAULT_DENSITY_GCM3,
  toLengthM, toDensityKgM3, areaToM2,
  fromM2, fromM3, fromKgGlass,
  calcGlassWeight, fmtGlass,
} from "../../../utils/glassWeightCalc";
import GlassWeightDiagram from "./GlassWeightDiagram";

// ── Style tokens ──────────────────────────────────────────────────
const FONT   = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

const LABEL_STYLE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 12,
  color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: "0.06em", userSelect: "none",
};

const INPUT_BASE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 14,
  color: "var(--text-primary)", background: "var(--bg-white)",
  border: "none", outline: "none", width: "100%",
  padding: "10px 12px", boxSizing: "border-box",
};

const OUTPUT_BASE = {
  ...INPUT_BASE,
  background: "#eff6ff",
  color: "#1d4ed8",
  cursor: "default",
};

const SELECT_BASE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 13,
  border: "none", outline: "none", cursor: "pointer",
  padding: "0 26px 0 10px", height: "100%",
  appearance: "none", WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  minWidth: 76,
};

// ── Blue gradient section header ──────────────────────────────────
function SectionHeader({ open, onToggle, title }) {
  return (
    <button onClick={onToggle} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "13px 18px",
      background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
      border: "none", cursor: "pointer", textAlign: "left",
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "rgba(255,255,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "white" }}>
        {title}
      </span>
    </button>
  );
}

// ── Compound input + unit selector ────────────────────────────────
function CompoundField({
  value, onChange, onBlur,
  unit, onUnitChange, units,
  placeholder = "0",
  hasError = false,
  isOutput = false,
}) {
  const borderColor = isOutput ? "#bfdbfe" : hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type={isOutput ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={isOutput}
        placeholder={placeholder}
        onChange={onChange && !isOutput ? (e) => onChange(e.target.value) : undefined}
        onBlur={!isOutput ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : INPUT_BASE}
      />
      <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
        style={{
          ...SELECT_BASE,
          borderLeft: `1.5px solid ${borderColor}`,
          backgroundColor: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-primary)",
        }}>
        {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

// ── Plain input, no unit selector (e.g. Quantity) ──────────────────
function PlainField({ value, onChange, onBlur, placeholder = "1", hasError = false }) {
  const borderColor = hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type="number" inputMode="numeric" step="1" min="1"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        style={INPUT_BASE}
      />
    </div>
  );
}

// ── Field: label + hint icon + children + error/note ──────────────
function Field({ label, hint, error, note, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={LABEL_STYLE}>{label}</span>
        {hint && <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
      </div>
      {children}
      {error && (
        <div style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
          <span style={{ color: "var(--error)", fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--error)", fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
        </div>
      )}
      {note && !error && (
        <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>{note}</span>
      )}
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────
function ActionBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: "1 1 auto", padding: "9px 16px", borderRadius: RADIUS,
      fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
      border: "none", background: "var(--bg-muted)", color: "var(--text-primary)",
      transition: "opacity 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

const Divider = () => <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />;

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function GlassWeightCalculatorTool() {

  // ── Glass type + density ──────────────────────────────────────────
  const [glassTypeId, setGlassTypeId] = useState(DEFAULT_GLASS_TYPE_ID);
  const [densityStr,  setDensityStr]  = useState(String(DEFAULT_DENSITY_GCM3));
  const [densityUnit, setDensityUnit] = useState("g/cm3");

  // ── Shape + dimensions ──────────────────────────────────────────────
  const [shapeId,     setShapeId]     = useState("rectangular");
  const [dimValues,   setDimValues]   = useState({});
  const [dimUnits,    setDimUnits]    = useState({});
  const [areaInput,   setAreaInput]   = useState(""); // for "Other shapes"
  const [areaUnit,    setAreaUnit]    = useState("cm2");
  const [thickness,   setThickness]   = useState("");
  const [thickUnit,   setThickUnit]   = useState("mm");
  const [volUnit,     setVolUnit]     = useState("cm3");
  const [quantity,    setQuantity]    = useState("1");
  const [wgtUnit,      setWgtUnit]    = useState("kg");

  // ── Section open state ────────────────────────────────────────────
  const [typeShapeOpen, setTypeShapeOpen] = useState(true);
  const [dimsOpen,       setDimsOpen]       = useState(true);
  const [resultOpen,     setResultOpen]     = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const glassType     = useMemo(() => GLASS_TYPES.find((g) => g.id === glassTypeId), [glassTypeId]);
  const isCustomGlass = glassTypeId === "custom";
  const shape          = useMemo(() => SHAPES.find((s) => s.id === shapeId) || SHAPES[0], [shapeId]);

  // ── Glass type change — auto-fill density ─────────────────────────
  const handleGlassTypeChange = (id) => {
    setGlassTypeId(id);
    const gt = GLASS_TYPES.find((g) => g.id === id);
    if (gt?.densityGCm3 != null) {
      setDensityStr(String(gt.densityGCm3));
      setDensityUnit("g/cm3");
    } else {
      setDensityStr("");
    }
  };

  // ── Shape change — dimensions don't carry over meaningfully ───────
  const handleShapeChange = (id) => {
    setShapeId(id);
    setDimValues({});
    setAreaInput("");
    setTouched({});
  };

  // ── Derive SI values ──────────────────────────────────────────────
  const densityKgM3 = useMemo(() => {
    if (!isCustomGlass && glassType?.densityGCm3 != null) return glassType.densityGCm3 * 1000;
    return toDensityKgM3(densityStr, densityUnit);
  }, [isCustomGlass, glassType, densityStr, densityUnit]);

  const dimsM = useMemo(() => {
    const out = {};
    shape.fields.forEach((f) => {
      out[f.id] = toLengthM(dimValues[f.id], dimUnits[f.id] || "cm", LENGTH_UNITS);
    });
    return out;
  }, [shape, dimValues, dimUnits]);

  const areaInputM2 = useMemo(
    () => (shape.directAreaInput ? areaToM2(areaInput, areaUnit) : null),
    [shape, areaInput, areaUnit]
  );

  const thicknessM = useMemo(() => toLengthM(thickness, thickUnit, THICKNESS_UNITS), [thickness, thickUnit]);
  const quantityNum = useMemo(() => {
    const v = parseFloat(quantity);
    return isFinite(v) && v > 0 ? v : 1;
  }, [quantity]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcGlassWeight({
    shapeId, dimsM, areaInputM2, thicknessM, densityKgM3, quantity: quantityNum,
  }), [shapeId, dimsM, areaInputM2, thicknessM, densityKgM3, quantityNum]);

  // ── Display values ────────────────────────────────────────────────
  const dispArea = shape.directAreaInput
    ? areaInput
    : result ? fmtGlass(fromM2(result.areaM2, areaUnit), 4) : "";
  const dispVol  = result?.volumeM3 != null ? fmtGlass(fromM3(result.volumeM3, volUnit), 4) : "";
  const dispWgt  = result?.weightKgTotal != null
    ? fmtGlass(fromKgGlass(result.weightKgTotal, wgtUnit), 3) : "";

  // ── Validation ────────────────────────────────────────────────────
  const dimError = (f) => touched[f.id] && (!dimValues[f.id] || parseFloat(dimValues[f.id]) <= 0)
    ? `Please enter a positive value for ${f.label.replace(/\s*\([^)]*\)/, "").toLowerCase()}.` : null;
  const areaErr = shape.directAreaInput && touched.area && (areaInput === "" || parseFloat(areaInput) <= 0)
    ? "Please enter a positive area value." : null;
  const thickErr = touched.thick && (thickness === "" || parseFloat(thickness) <= 0)
    ? `Please enter a positive value for the ${shape.thicknessLabel ? shape.thicknessLabel.replace(/\s*\([^)]*\)/, "").toLowerCase() : "thickness"}.` : null;
  const denErr = isCustomGlass && touched.den && (densityStr === "" || parseFloat(densityStr) <= 0)
    ? "Please enter a positive density value." : null;
  const qtyErr = touched.qty && (quantity === "" || parseFloat(quantity) <= 0)
    ? "Please enter a positive quantity." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setDimValues({}); setAreaInput(""); setThickness(""); setQuantity("1");
    if (isCustomGlass) setDensityStr("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setGlassTypeId(DEFAULT_GLASS_TYPE_ID); setDensityStr(String(DEFAULT_DENSITY_GCM3)); setDensityUnit("g/cm3");
    setShapeId("rectangular"); setDimUnits({});
    setAreaUnit("cm2"); setThickUnit("mm"); setVolUnit("cm3"); setWgtUnit("kg");
  }
  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShared(true);
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShared(false), 2000);
  }

  const commonTypes = GLASS_TYPES.filter((g) => g.group === "common");
  const otherTypes  = GLASS_TYPES.filter((g) => g.group === "other");
  const thicknessLabel = shape.thicknessLabel || "Thickness (t)";

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Glass type and shape
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={typeShapeOpen} onToggle={() => setTypeShapeOpen(!typeShapeOpen)}
          title="Glass type and shape" />
        {typeShapeOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Glass type */}
            <Field label="Glass type" hint="Select a preset glass type to auto-fill its density, or choose Custom to enter your own.">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={glassTypeId}
                  onChange={(e) => handleGlassTypeChange(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                  }}
                >
                  {commonTypes.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  <optgroup label="Other glass types">
                    {otherTypes.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </optgroup>
                </select>
              </div>
            </Field>

            <Divider />

            {/* Glass density */}
            <Field label="Glass density" error={denErr}
              note={!isCustomGlass && glassType?.densityGCm3 != null
                ? `Auto-filled from glass type: ${glassType.densityGCm3} g/cm³` : undefined}>
              <CompoundField
                value={densityStr}
                onChange={isCustomGlass ? setDensityStr : undefined}
                onBlur={() => touch("den")}
                unit={densityUnit}
                onUnitChange={isCustomGlass ? setDensityUnit : undefined}
                units={DENSITY_UNITS}
                placeholder="e.g. 2.5"
                isOutput={!isCustomGlass}
                hasError={!!denErr}
              />
            </Field>

            <Divider />

            {/* Shape */}
            <Field label="Shape">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={shapeId}
                  onChange={(e) => handleShapeChange(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                  }}
                >
                  {SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </Field>

            {/* Illustrative diagram */}
            <div style={{ background: "var(--bg-muted)", borderRadius: RADIUS, padding: "16px 18px" }}>
              <GlassWeightDiagram shape={shapeId} />
            </div>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Glass dimensions
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={dimsOpen} onToggle={() => setDimsOpen(!dimsOpen)}
          title="Glass dimensions" />
        {dimsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {shape.fields.map((f) => {
              const err = dimError(f);
              return (
                <div key={f.id}>
                  <Field label={f.label} error={err}>
                    <CompoundField
                      value={dimValues[f.id] || ""}
                      onChange={(v) => setDimValues((p) => ({ ...p, [f.id]: v }))}
                      onBlur={() => touch(f.id)}
                      unit={dimUnits[f.id] || "cm"}
                      onUnitChange={(u) => setDimUnits((p) => ({ ...p, [f.id]: u }))}
                      units={LENGTH_UNITS}
                      placeholder="e.g. 40" hasError={!!err}
                    />
                  </Field>
                  <div style={{ height: 14 }} />
                  <Divider />
                </div>
              );
            })}

            {/* Area — computed output, or direct input for "Other shapes" */}
            <Field label="Area"
              hint={shape.directAreaInput
                ? "This shape isn't listed above — enter its area directly."
                : "Area of the glass pane, computed from the dimensions above."}
              error={areaErr}
              note={!shape.directAreaInput && result === null ? "Enter the dimensions above to compute area." : undefined}>
              <CompoundField
                value={dispArea}
                onChange={shape.directAreaInput ? setAreaInput : undefined}
                onBlur={shape.directAreaInput ? () => touch("area") : undefined}
                unit={areaUnit} onUnitChange={setAreaUnit} units={AREA_UNITS}
                placeholder={shape.directAreaInput ? "e.g. 1600" : "—"}
                isOutput={!shape.directAreaInput}
                hasError={!!areaErr}
              />
            </Field>

            <Divider />

            {/* Thickness (or Length, for round rod) */}
            <Field label={thicknessLabel} hint="How thick the glass pane is." error={thickErr}>
              <CompoundField
                value={thickness} onChange={setThickness} onBlur={() => touch("thick")}
                unit={thickUnit} onUnitChange={setThickUnit} units={THICKNESS_UNITS}
                placeholder="e.g. 12" hasError={!!thickErr}
              />
            </Field>

            <Divider />

            {/* Volume — output */}
            <Field label="Volume"
              hint="Volume = Area × Thickness."
              note={result === null ? "Enter the area and thickness above to compute volume."
                : result.volumeM3 == null ? "Enter a thickness above to compute volume." : undefined}>
              <CompoundField
                value={dispVol}
                unit={volUnit} onUnitChange={setVolUnit} units={VOLUME_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Quantity */}
            <Field label="Quantity" hint="Number of identical glass panes/pieces." error={qtyErr}>
              <PlainField
                value={quantity} onChange={setQuantity} onBlur={() => touch("qty")}
                placeholder="1" hasError={!!qtyErr}
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Final result
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={resultOpen} onToggle={() => setResultOpen(!resultOpen)}
          title="Final result" />
        {resultOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Total weight — output */}
            <Field label="Total weight"
              hint="Total weight = Volume × Glass density × Quantity."
              note={result == null || result.volumeM3 == null
                ? "Enter the dimensions and thickness above to compute weight."
                : result.weightKgTotal == null ? "Enter a glass density above to compute weight." : undefined}>
              <CompoundField
                value={dispWgt}
                unit={wgtUnit} onUnitChange={setWgtUnit} units={WEIGHT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ActionBtn onClick={handleShare}>
                {shared ? "✓ Link Copied!" : "🔗 Share result"}
              </ActionBtn>
              <ActionBtn onClick={handleReload}>🔄 Reload calculator</ActionBtn>
              <ActionBtn onClick={handleClear}>🗑 Clear all changes</ActionBtn>
            </div>

            {/* Feedback */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "10px 14px", background: "var(--bg-muted)",
              borderRadius: RADIUS, border: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: "var(--text-muted)", flex: "1 1 auto" }}>
                Did we solve your problem today?
              </span>
              {[{ val: "yes", label: "👍 Yes" }, { val: "no", label: "👎 No" }].map(({ val, label }) => (
                <button key={val} onClick={() => setFeedback(val)} style={{
                  fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  padding: "6px 14px", borderRadius: RADIUS,
                  border: `1.5px solid ${feedback === val ? "var(--accent)" : BORDER}`,
                  background: feedback === val ? "var(--accent-light)" : "var(--bg-white)",
                  color: feedback === val ? "var(--accent)" : "var(--text-primary)",
                  transition: "all 0.15s",
                }}>{label}</button>
              ))}
              {feedback && (
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, color: "var(--accent)" }}>
                  {feedback === "yes" ? "Thank you! 🎉" : "Sorry! We'll improve."}
                </span>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          INFO CARD — How is glass weight calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate glass weight?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Rectangular area    = Height × Width",
            "Square area         = Side²",
            "Triangular area     = ½ × Base × Height",
            "Circular area       = π × (Diameter ÷ 2)²",
            "Semi-circular area  = ½ × π × (Diameter ÷ 2)²",
            "Elliptical area     = π × (Major axis ÷ 2) × (Minor axis ÷ 2)",
            "Round rod area      = π × (Diameter ÷ 2)²  (extruded along its length)",
            "Volume               = Area × Thickness",
            "Total weight         = Volume × Glass density × Quantity",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          For example, a rectangular <strong>annealed glass</strong> pane 40&nbsp;cm high, 40&nbsp;cm wide, and
          1.2&nbsp;cm thick has an area of 1,600&nbsp;cm², giving a volume of 1,920&nbsp;cm³. Multiplied by
          annealed glass's density of 2.5&nbsp;g/cm³, that's 4,800&nbsp;g (4.8&nbsp;kg) per pane — increase the
          <strong> Quantity</strong> field above to get the combined weight for multiple identical panes.
        </p>
      </div>

    </div>
  );
}
