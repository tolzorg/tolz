import { useState, useMemo, useEffect, useRef } from "react";
import {
  SHAPES, DIMENSION_UNITS, MATERIALS,
  toFeet, buildDimsInFeet, calcShape, getDefaultDims, formatCY,
} from "../../../utils/cubicYardCalc";
import { SHAPE_DIAGRAMS } from "./ShapeDiagrams";
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
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

// ── Shared primitives ─────────────────────────────────────────

function SectionCard({ id, title, icon, open, onToggle, children, noPad }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 20px",
          background: "none",
          border: "none",
          borderBottom: open ? "1px solid var(--border)" : "none",
          cursor: "pointer",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--text-primary)",
          textAlign: "left",
          transition: "background var(--transition)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          {title}
        </span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={noPad ? {} : { padding: "18px 20px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, error, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && (
          <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help", lineHeight: 1 }}>ⓘ</span>
        )}
      </div>
      {children}
      {error && <p style={{ fontSize: 11.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 5 }}>{error}</p>}
    </div>
  );
}

function NumUnit({ value, onChange, onBlur, unit, onUnitChange, placeholder, hasError }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        type="number" inputMode="decimal" min="0" step="any"
        value={value} placeholder={placeholder || "0"}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = hasError ? "var(--error)" : "var(--accent)")}
        onBlur={(e) => { e.target.style.borderColor = hasError ? "var(--error)" : "var(--border)"; if (onBlur) onBlur(); }}
        style={{ ...INPUT, flex: "1 1 80px", minWidth: 0, borderColor: hasError ? "var(--error)" : "var(--border)" }}
      />
      <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 138 }}>
        {DIMENSION_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, accent }) {
  return (
    <div className="card" style={{ padding: "16px 18px", flex: "1 1 130px", minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(22px, 4vw, 34px)", color: accent ? "var(--accent)" : "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
        {unit}
      </div>
    </div>
  );
}

function FormulaBox({ text }) {
  return (
    <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "11px 16px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(12px, 2vw, 14px)", color: "var(--text-primary)", textAlign: "center" }}>
      {text}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

const DEFAULT_SHAPE = "rectangle";
const DEFAULT_SECTIONS = new Set(["shape"]);

function validateField(value, fieldType) {
  if (value === "" || value === null) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be greater than zero";
  if (fieldType === "count" && !Number.isInteger(n)) return "Must be a whole number";
  return null;
}

export default function CubicYardCalculatorTool() {
  const [shapeId,  setShapeId]  = useState(DEFAULT_SHAPE);
  const [dims,     setDims]     = useState(() => getDefaultDims(DEFAULT_SHAPE));
  const [touched,  setTouched]  = useState({});
  const [quantity, setQuantity] = useState("1");
  const [qTouched, setQTouched] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState("concrete");

  const [openSections, setOpenSections] = useState(DEFAULT_SECTIONS);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  const shape = useMemo(() => SHAPES.find((s) => s.id === shapeId), [shapeId]);

  // Reset dims when shape changes
  useEffect(() => {
    setDims(getDefaultDims(shapeId));
    setTouched({});
  }, [shapeId]);

  function touchField(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function setDimValue(key, value) {
    setDims((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  }
  function setDimUnit(key, unit) {
    setDims((prev) => ({ ...prev, [key]: { ...prev[key], unit } }));
  }

  function toggleSection(id) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Validation
  const fieldErrors = useMemo(() => {
    if (!shape) return {};
    const errs = {};
    for (const f of shape.fields) {
      errs[f.key] = validateField(dims[f.key]?.value, f.type);
    }
    return errs;
  }, [shape, dims]);

  const qError = validateField(quantity, "count");
  const anyFieldInvalid = Object.values(fieldErrors).some(Boolean) || qError;

  // Compute dimensions in feet
  const dimsInFeet = useMemo(() => {
    if (!shape || anyFieldInvalid) return null;
    const d = buildDimsInFeet(shape, dims);
    return d;
  }, [shape, dims, anyFieldInvalid]);

  // Special cross-field validation (tube/ring inner < outer)
  const crossError = useMemo(() => {
    if (!shape || !dimsInFeet || !shape.validate) return null;
    return shape.validate(dimsInFeet);
  }, [shape, dimsInFeet]);

  const result = useMemo(() => {
    if (!dimsInFeet || crossError) return null;
    const r = calcShape(shapeId, dimsInFeet);
    if (!r) return null;
    const q = parseFloat(quantity);
    return {
      ...r,
      totalCubicYards:  r.cubicYards  * q,
      totalCubicFeet:   r.cubicFeet   * q,
      totalCubicMeters: r.cubicMeters * q,
    };
  }, [shapeId, dimsInFeet, crossError, quantity]);

  // Auto-open yardage section when result appears
  useEffect(() => {
    if (result) {
      setOpenSections((prev) => {
        const next = new Set(prev);
        next.add("yardage");
        return next;
      });
    }
  }, [!!result]);

  const material = MATERIALS.find((m) => m.id === selectedMaterial);
  const materialWeight = result && material ? material.lbsPerCuYd * result.totalCubicYards : null;

  function handleReset() {
    setDims(getDefaultDims(shapeId));
    setTouched({});
    setQuantity("1");
    setQTouched(false);
    setCopied(false);
  }

  function handleCopy() {
    if (!result) return;
    const lines = [
      "Construction Volume Calculator Results",
      `Shape: ${shape?.label}`,
      `Cubic Feet: ${formatCY(result.cubicFeet)} ft³`,
      `Cubic Yards: ${formatCY(result.cubicYards)} yd³`,
      `Cubic Meters: ${formatCY(result.cubicMeters)} m³`,
      `Total Cubic Yards (×${quantity}): ${formatCY(result.totalCubicYards)} yd³`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  const DiagramComponent = SHAPE_DIAGRAMS[shapeId];

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Shape & Dimensions ── */}
      <SectionCard id="shape" title="Shape & Dimensions" icon="📐" open={openSections.has("shape")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Shape selector */}
          <FieldGroup label="Select Shape" hint="Choose the 3D shape of the area you're filling. Dimension inputs update automatically to match the selected shape.">
            <select value={shapeId} onChange={(e) => setShapeId(e.target.value)}
              style={{ ...SELECT, width: "100%" }}>
              {SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </FieldGroup>

          {/* Diagram + Fields side-by-side on wider screens */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

            {/* SVG diagram */}
            <div style={{
              flex: "0 0 160px", width: 160, height: 120,
              background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", overflow: "hidden", padding: 4,
            }}>
              {DiagramComponent && <DiagramComponent />}
            </div>

            {/* Dynamic fields */}
            <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {shape?.fields.map((f) => {
                const dim    = dims[f.key] || { value: "", unit: f.defaultUnit || "ft" };
                const err    = fieldErrors[f.key];
                const isTouched = !!touched[f.key];
                if (f.type === "count") {
                  return (
                    <FieldGroup key={f.key} label={f.label} error={isTouched ? err : null}>
                      <input
                        type="number" inputMode="numeric" min="1" step="1"
                        value={dim.value} placeholder={f.placeholder || "1"}
                        onChange={(e) => setDimValue(f.key, e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; touchField(f.key); }}
                        style={{ ...INPUT, borderColor: isTouched && err ? "var(--error)" : "var(--border)" }}
                      />
                    </FieldGroup>
                  );
                }
                return (
                  <FieldGroup key={f.key} label={f.label} error={isTouched ? err : null}>
                    <NumUnit
                      value={dim.value}
                      onChange={(v) => setDimValue(f.key, v)}
                      onBlur={() => touchField(f.key)}
                      unit={dim.unit}
                      onUnitChange={(u) => setDimUnit(f.key, u)}
                      placeholder={f.placeholder}
                      hasError={!!(isTouched && err)}
                    />
                  </FieldGroup>
                );
              })}

              {/* Cross-field error */}
              {crossError && (
                <p style={{ fontSize: 12, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  ⚠ {crossError}
                </p>
              )}
            </div>
          </div>

          {/* Quantity */}
          <FieldGroup label="Quantity" hint="Number of identical sections or areas. Total volume = Volume per section × Quantity." error={qTouched ? qError : null}>
            <input
              type="number" inputMode="numeric" min="1" step="1"
              value={quantity} placeholder="1"
              onChange={(e) => setQuantity(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; setQTouched(true); }}
              style={{ ...INPUT, maxWidth: 200, borderColor: qTouched && qError ? "var(--error)" : "var(--border)" }}
            />
          </FieldGroup>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={handleReset}
              style={{ fontSize: 13, padding: "6px 14px", color: "var(--text-muted)" }}>
              ↺ Reset
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCopy}
              disabled={!result}
              style={{
                fontSize: 13, padding: "6px 14px",
                background: copied ? "#f0fdf4" : undefined,
                color: copied ? "#16a34a" : undefined,
                borderColor: copied ? "#86efac" : undefined,
                opacity: result ? 1 : 0.45,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {copied ? "✓ Copied!" : "📋 Copy Results"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Yardage ── */}
      <SectionCard id="yardage" title="Yardage" icon="📦" open={openSections.has("yardage")} onToggle={toggleSection}>
        {result ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ResultCard label="Cubic Feet"        value={formatCY(result.cubicFeet)}   unit="ft³" />
              <ResultCard label="Cubic Yards"        value={formatCY(result.cubicYards)}  unit="yd³" accent />
              <ResultCard label="Cubic Meters"       value={formatCY(result.cubicMeters)} unit="m³" />
              <ResultCard label={`Total Cubic Yards (×${quantity})`} value={formatCY(result.totalCubicYards)} unit="yd³" />
            </div>
            {parseFloat(quantity) > 1 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ResultCard label={`Total Cubic Feet (×${quantity})`}   value={formatCY(result.totalCubicFeet)}   unit="ft³" />
                <ResultCard label={`Total Cubic Meters (×${quantity})`} value={formatCY(result.totalCubicMeters)} unit="m³" />
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "16px 0" }}>
            Enter valid dimensions above to see results.
          </p>
        )}
      </SectionCard>

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={{
          cuyd: result?.totalCubicYards ?? null,
          cuft: result?.totalCubicFeet  ?? null,
          cum:  result?.totalCubicMeters ?? null,
        }}
        priceUnits={[
          { id: "cuyd", label: "per yd³", display: "yd³" },
          { id: "cuft", label: "per ft³", display: "ft³" },
          { id: "cum",  label: "per m³",  display: "m³"  },
        ]}
        defaultPriceUnit="cuyd"
      />

      {/* ── Material Estimator ── */}
      <SectionCard id="material" title="Material Estimator" icon="🏗️" open={openSections.has("material")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FieldGroup label="Select Material" hint="Used to estimate the total weight of material needed. Density values are approximate — verify with your supplier.">
            <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} style={{ ...SELECT, width: "100%", maxWidth: 280 }}>
              {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </FieldGroup>

          {material && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div className="card" style={{ flex: "1 1 140px", padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Weight per yd³
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)" }}>
                  ~{material.lbsPerCuYd.toLocaleString()} lbs
                </div>
              </div>
              <div className="card" style={{ flex: "1 1 140px", padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Total Estimated Weight
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: materialWeight ? "var(--accent)" : "var(--text-muted)" }}>
                  {materialWeight ? `~${materialWeight.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs` : "—"}
                </div>
              </div>
            </div>
          )}

          <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {MATERIALS.map((m, i) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: i === MATERIALS.length - 1 ? "none" : "1px solid var(--border)", background: selectedMaterial === m.id ? "var(--accent-light)" : "transparent" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: selectedMaterial === m.id ? "var(--accent)" : "var(--text-primary)" }}>
                  {m.label}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-muted)" }}>
                  ~{m.lbsPerCuYd.toLocaleString()} lbs/yd³
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
            * Approximate values. Actual weight varies by moisture content and material grade.
          </p>
        </div>
      </SectionCard>

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢" open={openSections.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shape && <FormulaBox text={shape.formula} />}
          <FormulaBox text="Cubic Yards = Cubic Feet ÷ 27" />
          <FormulaBox text="Cubic Meters = Cubic Feet × 0.0283168" />
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            A cubic yard is a unit of volume commonly used in construction and landscaping. All entered units are converted to feet before calculation. 1 cubic yard = 27 cubic feet = 3 ft × 3 ft × 3 ft.
          </p>
        </div>
      </SectionCard>

      {/* ── Examples ── */}
      <SectionCard id="examples" title="Examples" icon="📝" open={openSections.has("examples")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Concrete Slab", inputs: [["Length", "10 ft"], ["Width", "10 ft"], ["Depth", "6 in → 0.5 ft"]], result: "50 ft³ = 1.85 yd³" },
            { label: "Cylinder (Sonotube)", inputs: [["Radius", "0.5 ft (6 in)"], ["Height", "4 ft"]], result: "≈ 3.14 ft³ = 0.12 yd³" },
            { label: "Wall", inputs: [["Length", "20 ft"], ["Height", "8 ft"], ["Thickness", "6 in → 0.5 ft"]], result: "80 ft³ = 2.96 yd³" },
          ].map(({ label, inputs, result: res }) => (
            <div key={label} style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "14px 16px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 8 }}>{label}</div>
              {inputs.map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600, minWidth: 78 }}>{k}:</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-primary)", fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
                Result: {res}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── About ── */}
      <SectionCard id="about" title="About Cubic Yards" icon="ℹ️" open={openSections.has("about")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
            A <strong>cubic yard</strong> is a unit of volume equal to a cube measuring <strong>3 ft × 3 ft × 3 ft = 27 cubic feet</strong>. It is the standard unit for ordering bulk construction materials in the United States.
          </p>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
            Common uses include:
          </p>
          <ul style={{ margin: "0 0 0 4px", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {["Concrete slabs, footings, and foundations", "Gravel and crushed stone driveways", "Landscaping — topsoil, mulch, and compost", "Fill dirt and excavation volume", "Sand, swimming pool and pond excavation", "Retaining walls and curb construction"].map((item) => (
              <li key={item} style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6 }}>{item}</li>
            ))}
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}
