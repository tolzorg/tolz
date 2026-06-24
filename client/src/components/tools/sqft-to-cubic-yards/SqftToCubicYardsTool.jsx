import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  DIM_UNITS, DIRECT_AREA_UNITS, AREA_DISPLAY_UNITS, VOLUME_OUTPUT_UNITS,
  MATERIALS, WEIGHT_OUTPUT_UNITS,
  dimToFt, toDirectAreaSqFt, fromSqFt, calcAreaSqFt, fromCubicFt, fromWeightLb, fmtN,
} from "../../../utils/sqftToCubicYardsCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";

// ── Design tokens (matching existing calculators) ────────────

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
      fontSize: "clamp(12px, 2vw, 13.5px)", color: "var(--text-primary)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

// ── DimensionInput: simple + compound (ft/in, m/cm) ──────────

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
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 100px", minWidth: 0 }}>
            {mkInput(compA, setCompA, "0")}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{labelA}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 100px", minWidth: 0 }}>
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

// ── Helper ────────────────────────────────────────────────────

function isDimValid(val, unit, compA, compB) {
  if (unit === "ft_in" || unit === "m_cm") {
    return (parseFloat(compA) || 0) + (parseFloat(compB) || 0) > 0;
  }
  const n = parseFloat(val);
  return isFinite(n) && n > 0;
}

// ── Main component ────────────────────────────────────────────

export default function SqftToCubicYardsTool() {
  // Area mode
  const [areaMode, setAreaMode] = useState("lw"); // "lw" | "direct"

  // L × W inputs
  const [lenVal,   setLenVal]   = useState("");
  const [lenUnit,  setLenUnit]  = useState("ft");
  const [lenCompA, setLenCompA] = useState("");
  const [lenCompB, setLenCompB] = useState("");

  const [widVal,   setWidVal]   = useState("");
  const [widUnit,  setWidUnit]  = useState("ft");
  const [widCompA, setWidCompA] = useState("");
  const [widCompB, setWidCompB] = useState("");

  // Direct area entry
  const [directAreaVal,  setDirectAreaVal]  = useState("");
  const [directAreaUnit, setDirectAreaUnit] = useState("sqft");

  // Area display unit
  const [areaDispUnit, setAreaDispUnit] = useState("sqft");

  // Depth
  const [depthVal,   setDepthVal]   = useState("");
  const [depthUnit,  setDepthUnit]  = useState("in");
  const [depthCompA, setDepthCompA] = useState("");
  const [depthCompB, setDepthCompB] = useState("");

  // Volume output unit
  const [volOutputUnit, setVolOutputUnit] = useState("yd3");

  // Material estimator
  const [materialId,       setMaterialId]       = useState("none");
  const [weightOutputUnit, setWeightOutputUnit] = useState("lb");

  // UI state
  const [touched, setTouched]   = useState({});
  const [open,    setOpen]      = useState(new Set(["area", "depth"]));
  const [copied,  setCopied]    = useState(false);
  const copyTimer               = useRef(null);

  const touch = useCallback((k) => setTouched((p) => ({ ...p, [k]: true })), []);
  const toggleSection = useCallback((id) => setOpen((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  }), []);

  // ── Computed values ─────────────────────────────────────────

  const areaSqFt = useMemo(() => {
    if (areaMode === "direct") return toDirectAreaSqFt(directAreaVal, directAreaUnit);
    const lFt = dimToFt(lenVal, lenUnit, lenCompA, lenCompB);
    const wFt = dimToFt(widVal, widUnit, widCompA, widCompB);
    return calcAreaSqFt(lFt, wFt);
  }, [areaMode, directAreaVal, directAreaUnit,
      lenVal, lenUnit, lenCompA, lenCompB,
      widVal, widUnit, widCompA, widCompB]);

  const depthFt = useMemo(
    () => dimToFt(depthVal, depthUnit, depthCompA, depthCompB),
    [depthVal, depthUnit, depthCompA, depthCompB]
  );

  const cubicFt = useMemo(() => areaSqFt && depthFt ? areaSqFt * depthFt : null, [areaSqFt, depthFt]);
  const cubicYd = useMemo(() => cubicFt ? cubicFt / 27 : null, [cubicFt]);
  const cubicM  = useMemo(() => cubicFt ? cubicFt * 0.0283168 : null, [cubicFt]);
  const liters  = useMemo(() => cubicFt ? cubicFt * 28.3168 : null, [cubicFt]);
  const usGal   = useMemo(() => cubicFt ? cubicFt * 7.48052 : null, [cubicFt]);
  const ukGal   = useMemo(() => cubicFt ? cubicFt * 6.22884 : null, [cubicFt]);

  // Volume in selected display unit
  const volDisplay  = useMemo(() => fromCubicFt(cubicFt, volOutputUnit), [cubicFt, volOutputUnit]);

  // Area in display unit
  const areaDisplay = useMemo(() => fromSqFt(areaSqFt, areaDispUnit), [areaSqFt, areaDispUnit]);

  // Estimated cubic yards (round up to nearest 0.5)
  const estimatedCY = useMemo(() => cubicYd ? Math.ceil(cubicYd * 2) / 2 : null, [cubicYd]);

  // Material weight
  const material    = useMemo(() => MATERIALS.find((m) => m.id === materialId), [materialId]);
  const totalWeightLb = useMemo(() => {
    if (!cubicYd || !material?.lbPerYd3) return null;
    return cubicYd * material.lbPerYd3;
  }, [cubicYd, material]);
  const weightDisplay = useMemo(() => fromWeightLb(totalWeightLb, weightOutputUnit), [totalWeightLb, weightOutputUnit]);

  const hasResults = !!(areaSqFt && depthFt && cubicFt);

  // Auto-open results when computable
  useEffect(() => {
    if (hasResults) setOpen((prev) => { const n = new Set(prev); n.add("results"); return n; });
  }, [hasResults]);

  // Symbol lookups
  const volSymbol    = VOLUME_OUTPUT_UNITS.find((u) => u.id === volOutputUnit)?.symbol    || volOutputUnit;
  const weightSymbol = WEIGHT_OUTPUT_UNITS.find((u) => u.id === weightOutputUnit)?.symbol || weightOutputUnit;
  const areaLabel    = AREA_DISPLAY_UNITS.find((u) => u.id === areaDispUnit)?.label       || areaDispUnit;

  function handleCopy() {
    if (!hasResults) return;
    const lines = [
      "Square Feet to Cubic Yards Results",
      `Area:              ${fmtN(areaDisplay, 2)} ${areaLabel}`,
      `Depth:             ${fmtN(depthFt * 12, 4)} in`,
      `Volume:            ${fmtN(volDisplay, 4)} ${volSymbol}`,
      `Cubic Feet:        ${fmtN(cubicFt, 2)} ft³`,
      `Cubic Yards:       ${fmtN(cubicYd, 4)} yd³`,
      `Cubic Meters:      ${fmtN(cubicM, 4)} m³`,
      `Liters:            ${fmtN(liters, 2)} L`,
      `US Gallons:        ${fmtN(usGal, 2)} US gal`,
      `UK Gallons:        ${fmtN(ukGal, 2)} UK gal`,
      `Est. Cubic Yards:  ${fmtN(estimatedCY, 2)} yd³ (rounded up to 0.5)`,
    ];
    if (totalWeightLb) lines.push(`Est. Weight:       ${fmtN(weightDisplay, 2)} ${weightSymbol}`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setLenVal(""); setLenUnit("ft"); setLenCompA(""); setLenCompB("");
    setWidVal(""); setWidUnit("ft"); setWidCompA(""); setWidCompB("");
    setDirectAreaVal(""); setDirectAreaUnit("sqft");
    setDepthVal(""); setDepthUnit("in"); setDepthCompA(""); setDepthCompB("");
    setAreaMode("lw"); setVolOutputUnit("yd3"); setAreaDispUnit("sqft");
    setMaterialId("none"); setWeightOutputUnit("lb");
    setTouched({}); setCopied(false);
  }

  // Validation
  const lenErr    = touched.len     ? (isDimValid(lenVal, lenUnit, lenCompA, lenCompB) ? null : "Enter a positive length.")  : null;
  const widErr    = touched.wid     ? (isDimValid(widVal, widUnit, widCompA, widCompB) ? null : "Enter a positive width.")   : null;
  const dAreaErr  = touched.dArea   ? (!toDirectAreaSqFt(directAreaVal, directAreaUnit) ? "Enter a positive area." : null)  : null;
  const depthErr  = touched.depth   ? (isDimValid(depthVal, depthUnit, depthCompA, depthCompB) ? null : "Enter a positive depth.") : null;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Area ── */}
      <SectionCard id="area" title="Surface Area" icon="📏" open={open.has("area")} onToggle={toggleSection}>
        {/* Method toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[{ id: "lw", label: "Length × Width" }, { id: "direct", label: "Enter Area Directly" }].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAreaMode(opt.id)}
              style={{
                padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                border: "1.5px solid", cursor: "pointer", transition: "all .15s",
                fontFamily: "var(--font-display)",
                background:  areaMode === opt.id ? "var(--accent)" : "transparent",
                borderColor: areaMode === opt.id ? "var(--accent)" : "var(--border)",
                color:       areaMode === opt.id ? "#fff" : "var(--text-muted)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {areaMode === "lw" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <FieldGroup label="Length" error={lenErr}>
                  <DimensionInput
                    val={lenVal} setVal={setLenVal} unit={lenUnit} setUnit={setLenUnit}
                    compA={lenCompA} setCompA={setLenCompA} compB={lenCompB} setCompB={setLenCompB}
                    placeholder="e.g. 20" onBlurField={() => touch("len")} hasError={!!lenErr}
                  />
                </FieldGroup>
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <FieldGroup label="Width" error={widErr}>
                  <DimensionInput
                    val={widVal} setVal={setWidVal} unit={widUnit} setUnit={setWidUnit}
                    compA={widCompA} setCompA={setWidCompA} compB={widCompB} setCompB={setWidCompB}
                    placeholder="e.g. 15" onBlurField={() => touch("wid")} hasError={!!widErr}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>
        ) : (
          <FieldGroup label="Area" hint="Enter area in any supported unit" error={dAreaErr}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={directAreaVal} placeholder="e.g. 300"
                onChange={(e) => setDirectAreaVal(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = dAreaErr ? "var(--error)" : "var(--accent)")}
                onBlur={(e) => { e.target.style.borderColor = dAreaErr ? "var(--error)" : "var(--border)"; touch("dArea"); }}
                style={{ ...INPUT, flex: "1 1 100px", minWidth: 0, borderColor: dAreaErr ? "var(--error)" : "var(--border)" }}
              />
              <select
                value={directAreaUnit} onChange={(e) => setDirectAreaUnit(e.target.value)}
                style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 210 }}
              >
                {DIRECT_AREA_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </FieldGroup>
        )}

        {/* Area live display */}
        {areaSqFt && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <div style={{
              background: "var(--accent-light)", border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-md)", padding: "10px 16px",
              display: "flex", alignItems: "baseline", gap: 8,
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Area</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                {fmtN(areaDisplay, 2)}
              </span>
            </div>
            <select value={areaDispUnit} onChange={(e) => setAreaDispUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 90 }}>
              {AREA_DISPLAY_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        )}
      </SectionCard>

      {/* ── Depth ── */}
      <SectionCard id="depth" title="Depth / Thickness" icon="↕️" open={open.has("depth")} onToggle={toggleSection}>
        <FieldGroup label="Depth / Thickness" hint="How deep or thick the material will be applied" error={depthErr}>
          <DimensionInput
            val={depthVal} setVal={setDepthVal} unit={depthUnit} setUnit={setDepthUnit}
            compA={depthCompA} setCompA={setDepthCompA} compB={depthCompB} setCompB={setDepthCompB}
            placeholder="e.g. 4" onBlurField={() => touch("depth")} hasError={!!depthErr}
          />
        </FieldGroup>
        {depthFt && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 8, marginBottom: 0 }}>
            = {fmtN(depthFt * 12, 4)} in = {fmtN(depthFt, 6)} ft
          </p>
        )}
      </SectionCard>

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="📊" open={open.has("results")} onToggle={toggleSection}>
        {!hasResults ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "12px 0" }}>
            Enter area and depth above to see results.
          </p>
        ) : (
          <>
            {/* Volume unit selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <label style={{ ...LBL, marginBottom: 0 }}>Volume unit</label>
              <select value={volOutputUnit} onChange={(e) => setVolOutputUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 220 }}>
                {VOLUME_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>

            <div>
              <ResultRow label="Area"                value={fmtN(areaDisplay, 2)}  unit={areaLabel}   />
              <ResultRow label="Depth"               value={fmtN(depthFt * 12, 4)} unit="in"          />
              <ResultRow label={`Volume (${volSymbol})`} value={fmtN(volDisplay, 4)} unit={volSymbol} accent bold />
              <ResultRow label="Cubic Feet"          value={fmtN(cubicFt, 2)}      unit="ft³"         />
              <ResultRow label="Cubic Yards"         value={fmtN(cubicYd, 4)}      unit="yd³"  accent bold />
              <ResultRow label="Cubic Meters"        value={fmtN(cubicM, 4)}       unit="m³"          />
              <ResultRow label="Liters"              value={fmtN(liters, 2)}       unit="L"           />
              <ResultRow label="US Gallons"          value={fmtN(usGal, 2)}        unit="US gal"      />
              <ResultRow label="UK Gallons"          value={fmtN(ukGal, 2)}        unit="UK gal"      />
              <ResultRow label="Est. Cubic Yards (rounded up to 0.5)" value={fmtN(estimatedCY, 2)} unit="yd³" />
            </div>

            {/* Highlighted result */}
            <div style={{
              marginTop: 14, padding: "14px 18px",
              background: "var(--accent-light)", border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-md)", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Cubic Yards
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 5vw, 38px)", color: "var(--accent)", letterSpacing: "-0.02em" }}>
                {fmtN(cubicYd, 2)}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--accent)", marginTop: 4 }}>
                yd³{estimatedCY !== cubicYd ? ` · order at least ${fmtN(estimatedCY, 2)} yd³` : ""}
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                onClick={handleCopy}
                style={{
                  fontSize: 13, padding: "8px 16px",
                  background: copied ? "#f0fdf4" : undefined,
                  color:      copied ? "#16a34a" : undefined,
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

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={{
          cuyd:  cubicYd,
          cuft:  cubicFt,
          cum:   cubicM,
          liter: liters,
          usgal: usGal,
          ukgal: ukGal,
        }}
        priceUnits={[
          { id: "cuyd",  label: "per yd³",    display: "yd³"    },
          { id: "cuft",  label: "per ft³",    display: "ft³"    },
          { id: "cum",   label: "per m³",     display: "m³"     },
          { id: "liter", label: "per liter",  display: "liter"  },
          { id: "usgal", label: "per US gal", display: "US gal" },
          { id: "ukgal", label: "per UK gal", display: "UK gal" },
        ]}
        defaultPriceUnit="cuyd"
      />

      {/* ── Material Estimator ── */}
      <SectionCard id="material" title="Material Estimator" icon="🏗️" open={open.has("material")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <FieldGroup label="Material" hint="Approximate weight per cubic yard">
                <select
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  style={{ ...SELECT, width: "100%" }}
                >
                  {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </FieldGroup>
            </div>
            <div style={{ flex: "1 1 140px", minWidth: 0 }}>
              <FieldGroup label="Weight unit">
                <select value={weightOutputUnit} onChange={(e) => setWeightOutputUnit(e.target.value)} style={{ ...SELECT, width: "100%" }}>
                  {WEIGHT_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </FieldGroup>
            </div>
          </div>

          {material?.lbPerYd3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{material.lbPerYd3.toLocaleString()}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>lb/yd³</div>
                </div>
                <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{fmtN(material.lbPerYd3 * 0.453592, 0)}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>kg/m³ approx</div>
                </div>
              </div>

              {cubicYd && totalWeightLb && (
                <div style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)",
                  background: "var(--accent-light)", border: "1.5px solid var(--accent)",
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    Estimated total weight
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--accent)" }}>
                    {fmtN(weightDisplay, 2)} <span style={{ fontSize: 14, fontWeight: 500 }}>{weightSymbol}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "var(--accent)", marginTop: 4 }}>
                    {fmtN(cubicYd, 2)} yd³ × {material.lbPerYd3.toLocaleString()} lb/yd³ = {fmtN(totalWeightLb, 0)} lb
                  </div>
                </div>
              )}
              {!cubicYd && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
                  Enter area and depth to calculate total weight.
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢" open={open.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FormulaBox text="Area (ft²) = Length (ft) × Width (ft)" />
          <FormulaBox text="Volume (ft³) = Area (ft²) × Depth (ft)" />
          <FormulaBox text="Cubic Yards = Volume (ft³) ÷ 27" />
          <FormulaBox text="Cubic Meters = Volume (ft³) × 0.0283168" />
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            All dimensions are converted to feet before calculation. 27 cubic feet = 1 cubic yard.
            Volume in cubic yards is the standard unit for ordering concrete, gravel, and fill materials.
            The estimated order quantity rounds up to the nearest 0.5 yd³ to avoid shortfalls.
          </p>
        </div>
      </SectionCard>

      {/* ── Example ── */}
      <SectionCard id="example" title="Example" icon="📝" open={open.has("example")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["Length",         "20 ft"],
            ["Width",          "15 ft"],
            ["Depth",          "4 in = 4 ÷ 12 = 0.333 ft"],
            ["Area",           "20 × 15 = 300 ft²"],
            ["Volume",         "300 × 0.333 = 100 ft³"],
            ["Cubic Yards",    "100 ÷ 27 = 3.70 yd³"],
            ["Cubic Meters",   "100 × 0.028317 = 2.83 m³"],
            ["US Gallons",     "100 × 7.48052 = 748.05 US gal"],
            ["Est. order qty", "4.00 yd³ (rounded up from 3.70 to nearest 0.5)"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", minWidth: 140, flexShrink: 0 }}>{k}:</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, padding: "10px 14px", background: "var(--accent-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
              Result: 300 ft² × 4 in deep = 3.70 cubic yards (order 4.0 yd³)
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Notes ── */}
      <SectionCard id="notes" title="Notes" icon="💡" open={open.has("notes")} onToggle={toggleSection}>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "1 cubic yard = 27 cubic feet = 46,656 cubic inches = 0.7646 cubic meters.",
            "Concrete is typically ordered in cubic yards — most suppliers have a 1 yd³ minimum.",
            "Always add 5–10% extra to account for waste, spillage, and uneven sub-grade.",
            "The estimated order quantity rounds up to the nearest 0.5 yd³ — common for concrete.",
            "Compound units (ft/in, m/cm) let you enter mixed measurements without converting.",
            "Soccer field reference: 105 m × 68 m ≈ 76,854 sq ft (FIFA standard size).",
            "Material weights are approximate — actual values vary by moisture content, compaction, and source.",
            "Depth in inches: 1 in = 1/12 ft. Common depths — concrete slab: 4 in, gravel base: 3–6 in, topsoil: 2–4 in.",
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
