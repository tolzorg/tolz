import { useState, useMemo, useRef } from "react";
import {
  GLASS_TYPES, SHAPES, LENGTH_UNITS, DEPTH_UNITS,
  AREA_OUT_UNITS, VOLUME_OUT_UNITS, WEIGHT_OUT_UNITS, DENSITY_UNITS,
  DEFAULT_DENSITY_GCM3,
  toLengthM, toDepthM, toDensityKgM3,
  fromM2, fromM3, fromKgGlass,
  calcFireGlass, fmtGlass,
} from "../../../utils/fireGlassCalc";
import FireGlassDiagram from "./FireGlassDiagram";

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
export default function FireGlassCalculatorTool() {

  // ── Glass type + density ──────────────────────────────────────────
  const [glassTypeId, setGlassTypeId] = useState("reflective");
  const [densityStr,  setDensityStr]  = useState(String(DEFAULT_DENSITY_GCM3));
  const [densityUnit, setDensityUnit] = useState("g/cm3");

  // ── Fire pit shape + dimensions ────────────────────────────────────
  const [shapeId,    setShapeId]    = useState("rectangular");
  const [dimValues,  setDimValues]  = useState({});
  const [dimUnits,   setDimUnits]   = useState({});
  const [areaOutUnit, setAreaOutUnit] = useState("cm2");
  const [depth,      setDepth]      = useState("");
  const [depUnit,    setDepUnit]    = useState("mm");
  const [volUnit,    setVolUnit]    = useState("cm3");
  const [wgtUnit,    setWgtUnit]    = useState("kg");

  // ── Section open state ────────────────────────────────────────────
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [dimsOpen,    setDimsOpen]    = useState(true);
  const [outputOpen,  setOutputOpen]  = useState(true);

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
      out[f.id] = toLengthM(dimValues[f.id], dimUnits[f.id] || "cm");
    });
    return out;
  }, [shape, dimValues, dimUnits]);

  const depthM = useMemo(() => toDepthM(depth, depUnit), [depth, depUnit]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcFireGlass({
    shapeId, dimsM, depthM, densityKgM3,
  }), [shapeId, dimsM, depthM, densityKgM3]);

  // ── Display values ────────────────────────────────────────────────
  const dispArea = result ? fmtGlass(fromM2(result.areaM2, areaOutUnit), 4) : "";
  const dispVol  = result?.volumeM3 != null ? fmtGlass(fromM3(result.volumeM3, volUnit), 4) : "";
  const dispWgt  = result?.weightKg != null
    ? fmtGlass(fromKgGlass(result.weightKg, wgtUnit), 3) : "";

  // ── Validation ────────────────────────────────────────────────────
  const dimError = (f) => touched[f.id] && (!dimValues[f.id] || parseFloat(dimValues[f.id]) <= 0)
    ? `Please enter a positive value for ${f.label.replace(/\s*\([^)]*\)/, "").toLowerCase()}.` : null;
  const depErr = touched.dep && (depth === "" || parseFloat(depth) <= 0)
    ? "Please enter a positive value for the depth." : null;
  const denErr = isCustomGlass && touched.den && (densityStr === "" || parseFloat(densityStr) <= 0)
    ? "Please enter a positive density value." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setDimValues({}); setDepth("");
    if (isCustomGlass) setDensityStr("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setGlassTypeId("reflective"); setDensityStr(String(DEFAULT_DENSITY_GCM3)); setDensityUnit("g/cm3");
    setShapeId("rectangular"); setDimUnits({});
    setDepUnit("mm"); setAreaOutUnit("cm2"); setVolUnit("cm3"); setWgtUnit("kg");
  }
  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShared(true);
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShared(false), 2000);
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Fire glass and pit details
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)}
          title="Fire glass and pit details" />
        {detailsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Glass type */}
            <Field label="Glass type" hint="Select a preset glass type to auto-fill its density, or enter your own.">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {GLASS_TYPES.map((g) => {
                  const selected = glassTypeId === g.id;
                  return (
                    <label key={g.id} style={{
                      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      padding: "9px 13px", borderRadius: RADIUS,
                      background: selected ? "var(--accent-light)" : "var(--bg-muted)",
                      border: `1.5px solid ${selected ? "var(--accent)" : BORDER}`,
                      transition: "border-color 0.15s, background 0.15s",
                    }}>
                      <input
                        type="radio" name="glass-type" value={g.id} checked={selected}
                        onChange={() => handleGlassTypeChange(g.id)}
                        style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
                      />
                      <span style={{
                        fontFamily: FONT, fontWeight: selected ? 700 : 500,
                        fontSize: 13, color: selected ? "var(--accent)" : "var(--text-primary)",
                      }}>
                        {g.label}
                      </span>
                    </label>
                  );
                })}
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
                placeholder="e.g. 1.45"
                isOutput={!isCustomGlass}
                hasError={!!denErr}
              />
            </Field>

            <Divider />

            {/* Fire pit shape */}
            <Field label="Fire pit shape">
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
              <FireGlassDiagram shape={shapeId} />
            </div>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Fire pit dimensions
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={dimsOpen} onToggle={() => setDimsOpen(!dimsOpen)}
          title="Fire pit dimensions" />
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
                      placeholder="e.g. 60" hasError={!!err}
                    />
                  </Field>
                  <div style={{ height: 14 }} />
                  <Divider />
                </div>
              );
            })}

            {/* Area — output */}
            <Field label="Area"
              hint="Base area of the fire pit, computed from the dimensions above."
              note={result === null ? "Enter the dimensions above to compute area." : undefined}>
              <CompoundField
                value={dispArea}
                unit={areaOutUnit} onUnitChange={setAreaOutUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Depth */}
            <Field label="Depth (d)" hint="How deep the fire glass fill will be." error={depErr}>
              <CompoundField
                value={depth} onChange={setDepth} onBlur={() => touch("dep")}
                unit={depUnit} onUnitChange={setDepUnit} units={DEPTH_UNITS}
                placeholder="e.g. 50" hasError={!!depErr}
              />
            </Field>

            <Divider />

            {/* Volume — output */}
            <Field label="Volume"
              hint="Volume = Area × Depth."
              note={result === null ? "Enter the dimensions above to compute area and volume."
                : result.volumeM3 == null ? "Enter a depth above to compute volume." : undefined}>
              <CompoundField
                value={dispVol}
                unit={volUnit} onUnitChange={setVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Final output
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={outputOpen} onToggle={() => setOutputOpen(!outputOpen)}
          title="Final output" />
        {outputOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Total weight — output */}
            <Field label="Total weight"
              hint="Total weight = Volume × Glass density."
              note={result == null || result.volumeM3 == null
                ? "Enter the dimensions and depth above to compute weight."
                : result.weightKg == null ? "Enter a glass density above to compute weight." : undefined}>
              <CompoundField
                value={dispWgt}
                unit={wgtUnit} onUnitChange={setWgtUnit} units={WEIGHT_OUT_UNITS}
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
          INFO CARD — How is fire glass calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate fire glass weight?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Rectangular area  = Length × Width",
            "Square area       = Side²",
            "Round area        = π × (Diameter ÷ 2)²",
            "Triangular area   = ½ × Base × Height",
            "Trapezoidal area  = ½ × (Top width + Bottom width) × Height",
            "Volume            = Area × Depth",
            "Total weight      = Volume × Glass density",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          <strong>Reflective fire glass</strong> and <strong>recycled fire glass</strong> have slightly different bulk
          densities, so pick the type you're buying (or enter a custom density if your supplier lists one) for an
          accurate weight estimate. Fire glass is typically sold by the pound or kilogram, so the <strong>total
          weight</strong> above is what you'll use to order the right amount.
        </p>
      </div>

    </div>
  );
}
