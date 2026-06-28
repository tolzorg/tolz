import { useState, useMemo, useEffect, useRef } from "react";
import {
  AL_SHAPES, ALUMINUM_ALLOYS, AL_DIMENSION_UNITS,
  AL_VOLUME_UNITS, AL_WEIGHT_UNITS, DENSITY_UNITS, VOLUME_INPUT_UNITS,
  buildAlDimsInMeters, calcAlVolume, getDefaultAlDims,
  convertVolume, convertWeight, convertDensityToKgM3, convertDensityFromKgM3,
  validateAlField, formatAl, formatAlWeight,
} from "../../../utils/aluminumWeightCalc";
import { AL_SHAPE_DIAGRAMS } from "./AluminumShapeDiagrams";
import PriceCheckerCard, { WEIGHT_PRICE_UNITS } from "../construction/PriceCheckerCard";

// ── Design tokens (match existing calculators exactly) ────────

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

// ── Shared primitives (same as CubicYardCalculatorTool) ───────

function SectionCard({ id, title, icon, open, onToggle, children, noPad }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "15px 20px",
          background: "none", border: "none",
          borderBottom: open ? "1px solid var(--border)" : "none",
          cursor: "pointer", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 14, color: "var(--text-primary)",
          textAlign: "left", transition: "background var(--transition)",
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
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={noPad ? {} : { padding: "18px 20px" }}>{children}</div>}
    </div>
  );
}

function FieldGroup({ label, error, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && (
          <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>
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

// Input + unit-selector side by side
function NumUnit({ value, onChange, onBlur, unit, onUnitChange, units, placeholder, hasError }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        type="number" inputMode="decimal" min="0" step="any"
        value={value} placeholder={placeholder || "0"}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = hasError ? "var(--error)" : "var(--accent)")}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "var(--error)" : "var(--border)";
          if (onBlur) onBlur();
        }}
        style={{ ...INPUT, flex: "1 1 80px", minWidth: 0, borderColor: hasError ? "var(--error)" : "var(--border)" }}
      />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 90 }}
      >
        {(units || AL_DIMENSION_UNITS).map((u) => (
          <option key={u.id} value={u.id}>{u.label}</option>
        ))}
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
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(20px, 4vw, 30px)", color: accent ? "var(--accent)" : "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>
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
    <div style={{
      background: "var(--bg-muted)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "11px 16px",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: "clamp(12px, 2vw, 14px)", color: "var(--text-primary)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

const DEFAULT_SHAPE = "rectangular-bar";
const DEFAULT_ALLOY = "6061";
const INIT_SECTIONS = new Set(["shape", "alloy"]);

export default function AluminumWeightCalculatorTool() {
  const [shapeId, setShapeId]   = useState(DEFAULT_SHAPE);
  const [dims, setDims]         = useState(() => getDefaultAlDims(DEFAULT_SHAPE));
  const [touched, setTouched]   = useState({});

  // Alloy & density state
  const [alloyId, setAlloyId]           = useState(DEFAULT_ALLOY);
  const [customDensity, setCustomDensity] = useState("");
  const [densityUnit, setDensityUnit]   = useState("kg_m3");

  // Output unit state
  const [volUnit, setVolUnit]       = useState("cm3");
  const [weightUnit, setWeightUnit] = useState("kg");

  // UI state
  const [openSections, setOpenSections] = useState(INIT_SECTIONS);
  const [copied, setCopied]             = useState(false);
  const copyTimer = useRef(null);

  const shape = useMemo(() => AL_SHAPES.find((s) => s.id === shapeId), [shapeId]);
  const alloy = useMemo(() => ALUMINUM_ALLOYS.find((a) => a.id === alloyId), [alloyId]);

  // Reset dims when shape changes
  useEffect(() => {
    setDims(getDefaultAlDims(shapeId));
    setTouched({});
  }, [shapeId]);

  // ── Density in kg/m³ ───────────────────────────────────────
  const densityKgM3 = useMemo(() => {
    if (alloyId === "custom") {
      return convertDensityToKgM3(customDensity, densityUnit);
    }
    return alloy?.density ?? null;
  }, [alloyId, alloy, customDensity, densityUnit]);

  // Displayed density value in the selected display unit (for preset alloys)
  const densityDisplayValue = useMemo(() => {
    if (!densityKgM3 || alloyId === "custom") return "";
    return formatAl(convertDensityFromKgM3(densityKgM3, densityUnit), 4);
  }, [densityKgM3, densityUnit, alloyId]);

  // ── Field validation ───────────────────────────────────────
  const fieldErrors = useMemo(() => {
    if (!shape) return {};
    const errs = {};
    for (const f of shape.fields) {
      errs[f.key] = validateAlField(dims[f.key]?.value);
    }
    return errs;
  }, [shape, dims]);

  const anyFieldInvalid = Object.values(fieldErrors).some(Boolean);

  // ── Dims in meters ─────────────────────────────────────────
  const dimsInMeters = useMemo(() => {
    if (!shape || anyFieldInvalid) return null;
    return buildAlDimsInMeters(shape, dims);
  }, [shape, dims, anyFieldInvalid]);

  // Cross-field validation
  const crossError = useMemo(() => {
    if (!shape || !dimsInMeters || !shape.validate) return null;
    return shape.validate(dimsInMeters);
  }, [shape, dimsInMeters]);

  // ── Volume & weight ────────────────────────────────────────
  const volumeM3 = useMemo(() => {
    if (!dimsInMeters || crossError) return null;
    return calcAlVolume(shapeId, dimsInMeters);
  }, [shapeId, dimsInMeters, crossError]);

  const weightKg = useMemo(() => {
    if (volumeM3 === null || densityKgM3 === null) return null;
    return volumeM3 * densityKgM3;
  }, [volumeM3, densityKgM3]);

  const displayVolume = useMemo(
    () => (volumeM3 !== null ? formatAl(convertVolume(volumeM3, volUnit), 4) : null),
    [volumeM3, volUnit]
  );
  const displayWeight = useMemo(
    () => (weightKg !== null ? formatAlWeight(convertWeight(weightKg, weightUnit)) : null),
    [weightKg, weightUnit]
  );

  // Auto-open results when a valid result appears
  useEffect(() => {
    if (weightKg !== null) {
      setOpenSections((prev) => {
        const next = new Set(prev);
        next.add("results");
        return next;
      });
    }
  }, [weightKg !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSection(id) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function touchField(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function setDimValue(key, value) {
    setDims((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  }
  function setDimUnit(key, unit) {
    setDims((prev) => ({ ...prev, [key]: { ...prev[key], unit } }));
  }

  function handleReset() {
    setDims(getDefaultAlDims(shapeId));
    setTouched({});
    setCustomDensity("");
    setCopied(false);
  }

  function handleCopy() {
    if (!weightKg) return;
    const lines = [
      "Aluminum Weight Calculator Results",
      `Shape:   ${shape?.label}`,
      `Alloy:   ${alloy?.label}`,
      `Density: ${densityKgM3} kg/m³`,
      `Volume:  ${displayVolume} ${volUnit}`,
      `Weight:  ${displayWeight} ${weightUnit}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  const DiagramComponent = AL_SHAPE_DIAGRAMS[shapeId];

  // Price checker quantities (mapped to WEIGHT_PRICE_UNITS keys)
  const priceQuantities = useMemo(() => ({
    lb:         weightKg !== null ? convertWeight(weightKg, "lb")         : null,
    kg:         weightKg,
    ustons:     weightKg !== null ? weightKg / 907.185                    : null, // short tons
    metrictons: weightKg !== null ? weightKg / 1000                       : null, // metric tons
  }), [weightKg]);

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Shape & Dimensions ── */}
      <SectionCard id="shape" title="Shape & Dimensions" icon="📐"
        open={openSections.has("shape")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <FieldGroup label="Select Shape" hint="Choose the cross-section profile of your aluminum piece. Input fields update automatically to match.">
            <select value={shapeId} onChange={(e) => setShapeId(e.target.value)}
              style={{ ...SELECT, width: "100%" }}>
              {AL_SHAPES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </FieldGroup>

          {/* Diagram + fields side-by-side */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

            {/* SVG diagram */}
            <div style={{
              flex: "0 0 160px", width: 160, height: 120,
              background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", overflow: "hidden", padding: 4,
            }}>
              {DiagramComponent && <DiagramComponent />}
            </div>

            {/* Dynamic dimension fields */}
            <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {shape?.fields.map((f) => {
                const dim       = dims[f.key] || { value: "", unit: f.defaultUnit || "mm" };
                const err       = fieldErrors[f.key];
                const isTouched = !!touched[f.key];

                // Custom Volume shape uses volume input units
                if (f.type === "volume") {
                  return (
                    <FieldGroup key={f.key} label={f.label} error={isTouched ? err : null}>
                      <NumUnit
                        value={dim.value}
                        onChange={(v) => setDimValue(f.key, v)}
                        onBlur={() => touchField(f.key)}
                        unit={dim.unit}
                        onUnitChange={(u) => setDimUnit(f.key, u)}
                        units={VOLUME_INPUT_UNITS}
                        placeholder={f.placeholder}
                        hasError={!!(isTouched && err)}
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

              {crossError && (
                <p style={{ fontSize: 12, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  ⚠ {crossError}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={handleReset}
              style={{ fontSize: 13, padding: "6px 14px", color: "var(--text-muted)" }}>
              ↺ Reset
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCopy}
              disabled={!weightKg}
              style={{
                fontSize: 13, padding: "6px 14px",
                background:  copied ? "#f0fdf4" : undefined,
                color:       copied ? "#16a34a" : undefined,
                borderColor: copied ? "#86efac" : undefined,
                opacity: weightKg ? 1 : 0.45,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {copied ? "✓ Copied!" : "📋 Copy Results"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Alloy & Density ── */}
      <SectionCard id="alloy" title="Alloy & Density" icon="⚗️"
        open={openSections.has("alloy")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 200px", minWidth: 0 }}>
              <FieldGroup label="Aluminum Alloy" hint="Alloy choice auto-fills the density used for weight calculation. Select 'Custom Density' to enter your own.">
                <select value={alloyId} onChange={(e) => setAlloyId(e.target.value)}
                  style={{ ...SELECT, width: "100%" }}>
                  {ALUMINUM_ALLOYS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </FieldGroup>
            </div>

            <div style={{ flex: "1 1 130px", minWidth: 0 }}>
              <FieldGroup label="Density Unit" hint="Unit for displaying and entering density. The calculation always converts to kg/m³ internally.">
                <select value={densityUnit} onChange={(e) => setDensityUnit(e.target.value)}
                  style={{ ...SELECT, width: "100%" }}>
                  {DENSITY_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </FieldGroup>
            </div>
          </div>

          {/* Density display / custom input */}
          {alloyId === "custom" ? (
            <FieldGroup label="Custom Density" hint="Enter density in the selected unit — e.g., 2700 kg/m³ for most aluminum alloys. Used directly in the weight formula.">
              <NumUnit
                value={customDensity}
                onChange={setCustomDensity}
                unit={densityUnit}
                onUnitChange={setDensityUnit}
                units={DENSITY_UNITS}
                placeholder="2700"
              />
            </FieldGroup>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", padding: "10px 16px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Density
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)" }}>
                {densityDisplayValue || "—"}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-muted)" }}>
                {DENSITY_UNITS.find((u) => u.id === densityUnit)?.label}
              </span>
            </div>
          )}

          {/* Alloy density reference table */}
          <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {ALUMINUM_ALLOYS.filter((a) => a.id !== "custom").map((a, i, arr) => (
              <div
                key={a.id}
                onClick={() => setAlloyId(a.id)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 14px",
                  borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border)",
                  background: alloyId === a.id ? "var(--accent-light)" : "transparent",
                  cursor: "pointer",
                  transition: "background var(--transition)",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: alloyId === a.id ? "var(--accent)" : "var(--text-primary)" }}>
                  {a.label}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)" }}>
                  {a.density.toLocaleString()} kg/m³
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="⚖️"
        open={openSections.has("results")} onToggle={toggleSection}>
        {weightKg !== null ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Summary row */}
            <div style={{
              background: "var(--accent-light)", border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-md)", padding: "14px 18px",
              display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Shape
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                  {shape?.label}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Alloy
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                  {alloy?.label}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Density
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                  {densityKgM3?.toLocaleString()} kg/m³
                </div>
              </div>
            </div>

            {/* Volume result with unit selector */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 auto" }}>
                <ResultCard label="Volume" value={displayVolume ?? "—"} unit={AL_VOLUME_UNITS.find((u) => u.id === volUnit)?.label} />
              </div>
              <div style={{ flex: "0 0 auto", paddingBottom: 0, marginBottom: 0 }}>
                <label style={{ ...LBL, display: "block", marginBottom: 6 }}>Vol Unit</label>
                <select value={volUnit} onChange={(e) => setVolUnit(e.target.value)}
                  style={{ ...SELECT, width: 100 }}>
                  {AL_VOLUME_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* Weight result with unit selector */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 auto" }}>
                <ResultCard label="Weight" value={displayWeight ?? "—"} unit={AL_WEIGHT_UNITS.find((u) => u.id === weightUnit)?.label} accent />
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <label style={{ ...LBL, display: "block", marginBottom: 6 }}>Weight Unit</label>
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}
                  style={{ ...SELECT, width: 110 }}>
                  {AL_WEIGHT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* Quick conversions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "kg",  val: weightKg },
                { label: "lb",  val: weightKg ? weightKg * 2.20462 : null },
                { label: "g",   val: weightKg ? weightKg * 1000    : null },
                { label: "oz",  val: weightKg ? weightKg * 35.274  : null },
              ].map(({ label, val }) => (
                <div key={label} className="card" style={{ flex: "1 1 100px", minWidth: 0, padding: "10px 14px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
                    {val !== null ? formatAlWeight(val) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "16px 0", margin: 0 }}>
            Enter valid dimensions and select an alloy above to see results.
          </p>
        )}
      </SectionCard>

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={priceQuantities}
        priceUnits={WEIGHT_PRICE_UNITS}
        defaultPriceUnit="kg"
      />

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢"
        open={openSections.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shape && (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                {shape.label} — Volume Formula
              </div>
              <FormulaBox text={shape.formula} />
            </>
          )}
          <FormulaBox text="Weight (kg) = Volume (m³) × Density (kg/m³)" />
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
            All entered dimensions are converted to meters before calculation. Volume is expressed in m³. Weight is expressed in kg then converted to the selected output unit.
          </p>

          {/* Shape-specific notes */}
          <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {[
              { id: "hex-bar",       note: "Hex bar cross-section area = (√3/2) × AF² where AF is the across-flats distance." },
              { id: "angle",         note: "Angle area = (Leg1 + Leg2 − Thickness) × Thickness — subtracts the overlapping corner." },
              { id: "round-tube",    note: "Round tube: only the hollow annular cross-section area is used, not the full circle." },
              { id: "pipe",          note: "Pipe: same formula as round tube; ID = OD − 2 × Wall Thickness." },
              { id: "square-tube",   note: "Square tube: outer area minus inner square area." },
              { id: "rectangular-tube", note: "Rectangular tube: outer rectangle minus inner rectangle." },
              { id: "channel",       note: "C-channel: two flanges + web between them (flanges not double-counted)." },
              { id: "i-beam",        note: "I-beam: two flanges + web between them (flanges not double-counted)." },
            ].filter((n) => n.id === shapeId).map(({ note }) => (
              <div key={shapeId} style={{ padding: "10px 14px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                ℹ {note}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Example ── */}
      <SectionCard id="example" title="Worked Example" icon="📝"
        open={openSections.has("example")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
            Calculate the weight of a 6061 aluminum flat bar:
          </p>
          <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 10 }}>
              6061 Flat Bar
            </div>
            {[
              ["Length", "2 m"],
              ["Width", "50 mm (0.05 m)"],
              ["Thickness", "10 mm (0.01 m)"],
              ["Alloy", "6061 — Density 2700 kg/m³"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600, minWidth: 90 }}>{k}:</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-primary)", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Step-by-step
              </div>
              {[
                "V = 2 × 0.05 × 0.01 = 0.001 m³ = 1,000 cm³",
                "W = 0.001 m³ × 2700 kg/m³ = 2.7 kg",
                "W = 2.7 kg × 2.20462 = 5.95 lb",
              ].map((line) => (
                <div key={line} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)", marginBottom: 4 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Notes ── */}
      <SectionCard id="notes" title="Notes & Accuracy" icon="ℹ️"
        open={openSections.has("notes")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
            Density values are sourced from ASM International and engineering handbooks. Actual part weight may vary due to:
          </p>
          <ul style={{ margin: "0 0 0 4px", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              "Manufacturing tolerances in extrusion, rolling, or casting",
              "Surface coatings, anodizing, or powder coat thickness",
              "Temper designation (T6, T651, H32, etc.) — slight density variation",
              "Measurement rounding and unit conversion precision",
            ].map((item) => (
              <li key={item} style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            For fabrication, structural, or purchasing purposes always verify with your material supplier's certified test report (CTR) or mill certificate.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
