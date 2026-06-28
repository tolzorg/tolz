import { useState, useMemo, useEffect, useRef } from "react";
import {
  REBAR_SIZES, REBAR_LENGTH_UNITS, REBAR_LENGTH_OUT_UNITS, REBAR_WEIGHT_UNITS,
  CALC_MODES, toMeters, convertLength, convertWeight, customWeightPerM,
  calcRebar, fmtRebar, validateQty, validatePositive,
} from "../../../utils/rebarCalc";
import PriceCheckerCard, { WEIGHT_PRICE_UNITS } from "../construction/PriceCheckerCard";

// ── Design tokens ─────────────────────────────────────────────────
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

// ── Shared primitives ─────────────────────────────────────────────

function SectionCard({ id, title, icon, open, onToggle, children }) {
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
      {open && <div style={{ padding: "18px 20px" }}>{children}</div>}
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
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 80 }}
      >
        {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, accent }) {
  return (
    <div className="card" style={{ padding: "16px 18px", flex: "1 1 130px", minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11,
        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 800,
        fontSize: "clamp(20px, 4vw, 28px)",
        color: accent ? "var(--accent)" : "var(--text-primary)",
        letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5,
        color: "var(--text-muted)", marginTop: 4,
      }}>
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

// ── Rebar SVG illustration ────────────────────────────────────────

function RebarDiagram() {
  return (
    <svg viewBox="0 0 220 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Main barrel */}
      <rect x="10" y="18" width="200" height="24" rx="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      {/* Transverse deformation ribs */}
      {[24, 40, 56, 72, 88, 104, 120, 136, 152, 168, 184, 200].map((x) => (
        <rect key={x} x={x} y="13" width="5" height="34" rx="2.5" fill="#0284c7" opacity="0.45" />
      ))}
      {/* Center axis line */}
      <line x1="10" y1="30" x2="210" y2="30" stroke="#0284c7" strokeWidth="1" strokeDasharray="6 4" opacity="0.35" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────

const DEFAULT_SIZE  = "m16";
const INIT_SECTIONS = new Set(["mode", "details"]);

export default function RebarCalculatorTool() {
  const [mode, setMode]               = useState("weight");
  const [qty, setQty]                 = useState("");
  const [barLength, setBarLength]     = useState("");
  const [barLenUnit, setBarLenUnit]   = useState("m");
  const [totalLen, setTotalLen]       = useState("");
  const [totalLenUnit, setTotalLenUnit] = useState("m");
  const [sizeId, setSizeId]           = useState(DEFAULT_SIZE);
  const [customDiam, setCustomDiam]   = useState("");
  const [touched, setTouched]         = useState({});
  const [outLenUnit, setOutLenUnit]   = useState("m");
  const [outWtUnit, setOutWtUnit]     = useState("kg");
  const [openSections, setOpenSections] = useState(INIT_SECTIONS);
  const [copied, setCopied]           = useState(false);
  const copyTimer                     = useRef(null);

  const selectedSize = useMemo(
    () => REBAR_SIZES.find((s) => s.id === sizeId),
    [sizeId]
  );

  const weightPerM = useMemo(() => {
    if (sizeId === "custom") return customWeightPerM(customDiam);
    return selectedSize?.weightPerM ?? null;
  }, [sizeId, selectedSize, customDiam]);

  const barLengthM     = useMemo(() => toMeters(barLength, barLenUnit),  [barLength, barLenUnit]);
  const totalLengthMIn = useMemo(() => toMeters(totalLen, totalLenUnit), [totalLen, totalLenUnit]);

  const result = useMemo(() => calcRebar({
    mode, qty, barLengthM, totalLengthM: totalLengthMIn, weightPerM,
  }), [mode, qty, barLengthM, totalLengthMIn, weightPerM]);

  const dispTotalLen = result
    ? fmtRebar(convertLength(result.totalLengthM, outLenUnit))
    : null;
  const dispWtPerBar = result?.weightPerBarKg != null
    ? fmtRebar(convertWeight(result.weightPerBarKg, outWtUnit))
    : null;
  const dispTotalWt  = result?.totalWeightKg != null
    ? fmtRebar(convertWeight(result.totalWeightKg, outWtUnit))
    : null;

  useEffect(() => {
    if (result) {
      setOpenSections((prev) => { const n = new Set(prev); n.add("results"); return n; });
    }
  }, [!!result]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setTouched({}); }, [mode]);

  // Derived booleans for which inputs/outputs are active
  const needsQtyLen   = mode === "weight" || mode === "length";
  const needsTotalLen = mode === "weight-custom";
  const needsSize     = mode === "weight" || mode === "weight-custom";

  function toggleSection(id) {
    setOpenSections((prev) => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
    });
  }

  function touch(key) { setTouched((p) => ({ ...p, [key]: true })); }

  function handleReset() {
    setQty(""); setBarLength(""); setTotalLen(""); setCustomDiam(""); setTouched({}); setCopied(false);
  }

  function handleCopy() {
    if (!result) return;
    const wLbl = REBAR_WEIGHT_UNITS.find((u) => u.id === outWtUnit)?.label || outWtUnit;
    const lLbl = REBAR_LENGTH_OUT_UNITS.find((u) => u.id === outLenUnit)?.label || outLenUnit;
    const sizeLbl = sizeId === "custom" ? `Custom ${customDiam} mm` : selectedSize?.label;
    const lines = [
      "Rebar Calculator Results",
      `Mode:         ${CALC_MODES.find((m) => m.id === mode)?.label}`,
      `Rebar Size:   ${sizeLbl}`,
      sizeId !== "custom" ? `Diameter:     ${selectedSize?.diameterMm} mm` : `Diameter:     ${customDiam} mm`,
      needsQtyLen ? `Quantity:     ${qty} bars` : null,
      needsQtyLen ? `Length/bar:   ${barLength} ${barLenUnit}` : null,
      dispTotalLen  ? `Total Length: ${dispTotalLen} ${lLbl}`  : null,
      dispWtPerBar  ? `Wt per Bar:   ${dispWtPerBar} ${wLbl}`  : null,
      dispTotalWt   ? `Total Weight: ${dispTotalWt} ${wLbl}`   : null,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  const priceQuantities = useMemo(() => {
    const wt = result?.totalWeightKg ?? null;
    return {
      lb:         wt !== null ? wt * 2.20462 : null,
      kg:         wt,
      ustons:     wt !== null ? wt / 907.185 : null,
      metrictons: wt !== null ? wt / 1000    : null,
    };
  }, [result]);

  // Validation errors (only after touch)
  const qtyErr        = touched.qty        ? validateQty(qty)           : null;
  const barLenErr     = touched.barLen     ? validatePositive(barLength) : null;
  const totalLenErr   = touched.totalLen   ? validatePositive(totalLen)  : null;
  const customDiamErr = sizeId === "custom" && touched.customDiam
    ? validatePositive(customDiam) : null;

  // Formula lines for active mode
  const formulaLines = useMemo(() => {
    const lines = [];
    if (needsQtyLen) lines.push("Total Length = Quantity × Length per Bar");
    if (needsSize)   lines.push("Total Weight = Total Length × Weight per Meter");
    if (needsSize && sizeId === "custom")
      lines.push("Weight per Meter (kg/m) = D² ÷ 162  (D in mm)");
    return lines;
  }, [needsQtyLen, needsSize, sizeId]);

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Calculation Mode ── */}
      <SectionCard id="mode" title="Calculation Mode" icon="⚙️"
        open={openSections.has("mode")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CALC_MODES.map((m) => (
            <label
              key={m.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: `1.5px solid ${mode === m.id ? "var(--accent)" : "var(--border)"}`,
                background: mode === m.id ? "var(--accent-light)" : "var(--bg-white)",
                cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <input
                type="radio" name="rebar-mode" value={m.id} checked={mode === m.id}
                onChange={() => setMode(m.id)}
                style={{ marginTop: 2, accentColor: "var(--accent)", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
                  {m.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                  {m.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ── Rebar Details ── */}
      <SectionCard id="details" title="Rebar Details" icon="🪨"
        open={openSections.has("details")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

            {/* SVG diagram */}
            <div style={{
              flex: "0 0 160px", width: 160, height: 90,
              background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", padding: 8,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              <RebarDiagram />
            </div>

            {/* Inputs */}
            <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Quantity — modes 1 & 2 */}
              {needsQtyLen && (
                <FieldGroup label="Quantity (bars)" error={qtyErr} hint="Total number of rebar bars needed. Must be a whole number (no decimal bars).">
                  <input
                    type="number" inputMode="numeric" min="1" step="1"
                    value={qty} placeholder="20"
                    onChange={(e) => setQty(e.target.value)}
                    onBlur={() => touch("qty")}
                    onFocus={(e) => (e.target.style.borderColor = qtyErr ? "var(--error)" : "var(--accent)")}
                    style={{ ...INPUT, borderColor: qtyErr ? "var(--error)" : "var(--border)" }}
                  />
                </FieldGroup>
              )}

              {/* Length per bar — modes 1 & 2 */}
              {needsQtyLen && (
                <FieldGroup label="Length per Bar" error={barLenErr}
                  hint="Length of one rebar bar. Standard stock lengths are 6 m (20 ft) or 12 m (40 ft). Enter the cut length if shorter.">
                  <NumUnit
                    value={barLength} onChange={setBarLength}
                    onBlur={() => touch("barLen")}
                    unit={barLenUnit} onUnitChange={setBarLenUnit}
                    units={REBAR_LENGTH_UNITS} placeholder="6"
                    hasError={!!barLenErr}
                  />
                </FieldGroup>
              )}

              {/* Total Length input — mode 3 */}
              {needsTotalLen && (
                <FieldGroup label="Total Length" error={totalLenErr}
                  hint="Combined length of all bars. Used to calculate total weight. Equal to Quantity × Length per Bar.">
                  <NumUnit
                    value={totalLen} onChange={setTotalLen}
                    onBlur={() => touch("totalLen")}
                    unit={totalLenUnit} onUnitChange={setTotalLenUnit}
                    units={REBAR_LENGTH_UNITS} placeholder="120"
                    hasError={!!totalLenErr}
                  />
                </FieldGroup>
              )}

              {/* Rebar Size selector — modes 1 & 3 */}
              {needsSize && (
                <FieldGroup label="Rebar Size" hint="Standard metric sizes (6–40 mm) or US ASTM A615 #-bar designations. Sets the nominal diameter and weight per meter.">
                  <select value={sizeId} onChange={(e) => setSizeId(e.target.value)}
                    style={{ ...SELECT, width: "100%" }}>
                    {["Metric", "US Bars", "Custom"].map((group) => (
                      <optgroup key={group} label={group}>
                        {REBAR_SIZES.filter((s) => s.group === group).map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </FieldGroup>
              )}

              {/* Custom diameter input */}
              {needsSize && sizeId === "custom" && (
                <FieldGroup label="Custom Diameter (mm)" error={customDiamErr}
                  hint="Weight per meter is calculated as D² ÷ 162">
                  <input
                    type="number" inputMode="decimal" min="0" step="any"
                    value={customDiam} placeholder="16"
                    onChange={(e) => setCustomDiam(e.target.value)}
                    onBlur={() => touch("customDiam")}
                    onFocus={(e) => (e.target.style.borderColor = customDiamErr ? "var(--error)" : "var(--accent)")}
                    style={{ ...INPUT, borderColor: customDiamErr ? "var(--error)" : "var(--border)" }}
                  />
                </FieldGroup>
              )}

              {/* Diameter + weight info chip for preset sizes */}
              {needsSize && sizeId !== "custom" && selectedSize?.diameterMm && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  background: "var(--bg-muted)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "9px 14px",
                }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 6 }}>
                      Diameter
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>
                      {selectedSize.diameterMm} mm
                    </span>
                  </div>
                  <div style={{ width: 1, height: 24, background: "var(--border)" }} />
                  <div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 6 }}>
                      Wt/meter
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>
                      {fmtRebar(selectedSize.weightPerM)} kg/m
                    </span>
                  </div>
                </div>
              )}

              {/* Computed weight/meter for custom diameter */}
              {needsSize && sizeId === "custom" && weightPerM !== null && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--bg-muted)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "9px 14px",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Computed Wt/meter
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--accent)" }}>
                    {fmtRebar(weightPerM, 4)} kg/m
                  </span>
                </div>
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
              className="btn btn-secondary" onClick={handleCopy} disabled={!result}
              style={{
                fontSize: 13, padding: "6px 14px",
                background:  copied ? "#f0fdf4" : undefined,
                color:       copied ? "#16a34a" : undefined,
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

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="📊"
        open={openSections.has("results")} onToggle={toggleSection}>
        {result ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Summary banner */}
            <div style={{
              background: "var(--accent-light)", border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-md)", padding: "14px 18px",
              display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
            }}>
              {needsSize && (
                <>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Rebar Size
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {sizeId === "custom" ? `Custom ${customDiam} mm` : selectedSize?.label}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Diameter
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {sizeId === "custom" ? `${customDiam} mm` : `${selectedSize?.diameterMm} mm`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Wt / Meter
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {fmtRebar(weightPerM, 4)} kg/m
                    </div>
                  </div>
                </>
              )}
              {needsQtyLen && (
                <>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Quantity
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {qty} bars
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Length / Bar
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {barLength} {barLenUnit}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Total Length card with unit selector */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 auto" }}>
                <ResultCard
                  label="Total Length"
                  value={dispTotalLen ?? "—"}
                  unit={REBAR_LENGTH_OUT_UNITS.find((u) => u.id === outLenUnit)?.label}
                />
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <label style={{ ...LBL, display: "block", marginBottom: 6 }}>Length Unit</label>
                <select value={outLenUnit} onChange={(e) => setOutLenUnit(e.target.value)}
                  style={{ ...SELECT, width: 100 }}>
                  {REBAR_LENGTH_OUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* Weight per bar (mode "weight" only) */}
            {dispWtPerBar !== null && (
              <ResultCard
                label="Weight per Bar"
                value={dispWtPerBar}
                unit={REBAR_WEIGHT_UNITS.find((u) => u.id === outWtUnit)?.label}
              />
            )}

            {/* Total Weight card with unit selector */}
            {dispTotalWt !== null && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 auto" }}>
                  <ResultCard
                    label="Total Weight"
                    value={dispTotalWt}
                    unit={REBAR_WEIGHT_UNITS.find((u) => u.id === outWtUnit)?.label}
                    accent
                  />
                </div>
                <div style={{ flex: "0 0 auto" }}>
                  <label style={{ ...LBL, display: "block", marginBottom: 6 }}>Weight Unit</label>
                  <select value={outWtUnit} onChange={(e) => setOutWtUnit(e.target.value)}
                    style={{ ...SELECT, width: 110 }}>
                    {REBAR_WEIGHT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Quick weight conversions */}
            {result?.totalWeightKg != null && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "kg",  val: result.totalWeightKg },
                  { label: "lb",  val: result.totalWeightKg * 2.20462 },
                  { label: "g",   val: result.totalWeightKg * 1000 },
                  { label: "oz",  val: result.totalWeightKg * 35.274 },
                ].map(({ label, val }) => (
                  <div key={label} className="card" style={{ flex: "1 1 90px", minWidth: 0, padding: "10px 14px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>
                      {fmtRebar(val)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "16px 0", margin: 0 }}>
            Enter valid values above to see results.
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
          {formulaLines.map((line) => <FormulaBox key={line} text={line} />)}
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
            All lengths are converted to meters internally. Weight is calculated in kg and then converted to the selected output unit.
            The formula <strong>w&nbsp;=&nbsp;D²&nbsp;÷&nbsp;162</strong> (D in mm) is the standard engineering shortcut for deformed steel rebar — derived from ρ_steel&nbsp;=&nbsp;7850&nbsp;kg/m³.
          </p>
        </div>
      </SectionCard>

      {/* ── Rebar Size Reference Table ── */}
      <SectionCard id="sizetable" title="Rebar Size Reference" icon="📋"
        open={openSections.has("sizetable")} onToggle={toggleSection}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-display)", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-muted)" }}>
                {["Size", "Group", "Diameter (mm)", "Weight (kg/m)", "Weight (lb/ft)"].map((h) => (
                  <th key={h} style={{
                    padding: "9px 12px", textAlign: "left", fontWeight: 700,
                    fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
                    letterSpacing: "0.07em", borderBottom: "1px solid var(--border)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REBAR_SIZES.filter((s) => s.id !== "custom").map((s, i, arr) => (
                <tr
                  key={s.id}
                  onClick={() => { if (needsSize) setSizeId(s.id); }}
                  style={{
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    background: sizeId === s.id ? "var(--accent-light)" : "transparent",
                    cursor: needsSize ? "pointer" : "default",
                    transition: "background var(--transition)",
                  }}
                >
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: sizeId === s.id ? "var(--accent)" : "var(--text-primary)" }}>{s.label}</td>
                  <td style={{ padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>{s.group}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.diameterMm}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.weightPerM}</td>
                  <td style={{ padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>{fmtRebar(s.weightPerM * 0.671969, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Worked Example ── */}
      <SectionCard id="example" title="Worked Example" icon="📝"
        open={openSections.has("example")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
            Calculate the total weight of 20 bars of 16 mm rebar, each 6 m long:
          </p>
          <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 10 }}>
              16 mm Rebar — 20 bars × 6 m
            </div>
            {[
              ["Rebar Size",      "16 mm"],
              ["Diameter",        "16 mm"],
              ["Quantity",        "20 bars"],
              ["Length per bar",  "6 m"],
              ["Weight / meter",  "1.578 kg/m"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600, minWidth: 130 }}>{k}:</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-primary)", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                Step-by-step
              </div>
              {[
                "Total Length  =  20 × 6  =  120 m",
                "Weight/bar    =  6 × 1.578  =  9.47 kg",
                "Total Weight  =  120 × 1.578  =  189.36 kg",
                "            ≈  417.48 lb",
              ].map((line) => (
                <div key={line} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)", marginBottom: 5 }}>
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
            Weight values are based on ASTM A615 (US bars) and standard metric engineering tables. Actual weights may vary due to:
          </p>
          <ul style={{ margin: "0 0 0 4px", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              "Manufacturer tolerances (typically ±2–3%)",
              "Surface deformation pattern geometry and rib height",
              "Mill certificate variance in alloy composition",
              "Measurement rounding and unit conversion precision",
            ].map((item) => (
              <li key={item} style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            For structural engineering, procurement, or bidding purposes always verify with your supplier's mill certificate or certified test report.
          </p>
        </div>
      </SectionCard>

    </div>
  );
}
