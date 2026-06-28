import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  AREA_DISPLAY_UNITS, COVERAGE_RATE_UNITS, WASTE_OPTIONS, MATERIAL_TYPES,
  DIM_UNITS, DIRECT_AREA_UNITS, VOLUME_OUTPUT_UNITS, GPSF_OUTPUT_UNITS,
  dimToFt, toDirectAreaSqFt, fromCubicFt, fromUSGalPerSqFt,
  toCoverageRateSqFtPerGal, convertArea,
  calcAreaSqFt, calcGalPerSqFt, calcGallonsNeeded, calcCoverageArea, calcWasteGallons,
  fmtG, fmt2,
} from "../../../utils/gallonsCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";

// ── Design tokens (same as before) ───────────────────────────

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

function InfoPill({ text }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "var(--accent-light)", borderRadius: 99, padding: "4px 12px",
      fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)",
    }}>
      {text}
    </div>
  );
}

// ── DimensionInput: handles simple + compound (ft/in, m/cm) units ──

function DimensionInput({
  val, setVal, unit, setUnit,
  compA, setCompA, compB, setCompB,
  units, placeholder, onBlurField, hasError,
}) {
  const isCompound = unit === "ft_in" || unit === "m_cm";
  const [labelA, labelB] = unit === "ft_in" ? ["ft", "in"] : ["m", "cm"];
  const borderColor = hasError ? "var(--error)" : "var(--border)";
  const focusColor  = hasError ? "var(--error)" : "var(--accent)";

  function mkInput(v, set, phText) {
    return (
      <input
        type="number" inputMode="decimal" min="0" step="any"
        value={v} placeholder={phText || "0"}
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
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              {labelA}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 100px", minWidth: 0 }}>
            {mkInput(compB, setCompB, "0")}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              {labelB}
            </span>
          </div>
        </>
      ) : (
        mkInput(val, setVal, placeholder || "0")
      )}
      <select
        value={unit} onChange={(e) => setUnit(e.target.value)}
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 170 }}
      >
        {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
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

// ── Main component ────────────────────────────────────────────

export default function GallonsCalculatorTool() {
  // Area mode
  const [areaMode, setAreaMode] = useState("lw"); // "lw" | "direct"

  // L × W inputs
  const [lengthVal,   setLengthVal]   = useState("");
  const [lengthUnit,  setLengthUnit]  = useState("ft");
  const [lengthCompA, setLengthCompA] = useState("");
  const [lengthCompB, setLengthCompB] = useState("");

  const [widthVal,   setWidthVal]   = useState("");
  const [widthUnit,  setWidthUnit]  = useState("ft");
  const [widthCompA, setWidthCompA] = useState("");
  const [widthCompB, setWidthCompB] = useState("");

  // Direct area entry
  const [directAreaVal,  setDirectAreaVal]  = useState("");
  const [directAreaUnit, setDirectAreaUnit] = useState("sqft");

  // Height / Thickness
  const [heightVal,   setHeightVal]   = useState("");
  const [heightUnit,  setHeightUnit]  = useState("in");
  const [heightCompA, setHeightCompA] = useState("");
  const [heightCompB, setHeightCompB] = useState("");

  // Display units
  const [areaDispUnit,  setAreaDispUnit]  = useState("sqft");
  const [volOutputUnit, setVolOutputUnit] = useState("cuft");
  const [gpsfUnit,      setGpsfUnit]      = useState("usgal_sqft");

  // Coverage rate section
  const [coverageRate,     setCoverageRate]     = useState("");
  const [coverageRateUnit, setCoverageRateUnit] = useState("sqft_usgal");
  const [materialId,       setMaterialId]       = useState("none");
  const [numCoats,         setNumCoats]         = useState(1);
  const [wastePct,         setWastePct]         = useState(10);

  // UI state
  const [touched, setTouched]   = useState({});
  const [open,    setOpen]      = useState(new Set(["area", "height", "coverage", "coats"]));
  const [copied,  setCopied]    = useState(false);
  const copyTimer               = useRef(null);

  const touch         = useCallback((k) => setTouched((p) => ({ ...p, [k]: true })), []);
  const toggleSection = useCallback((id) => setOpen((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  }), []);

  // Auto-fill coverage rate from material selection
  useEffect(() => {
    const mat = MATERIAL_TYPES.find((m) => m.id === materialId);
    if (mat?.coverageSqFtPerGal) {
      setCoverageRate(String(mat.coverageSqFtPerGal));
      setCoverageRateUnit("sqft_usgal");
    }
  }, [materialId]);

  // ── Computed values ─────────────────────────────────────────

  const areaSqFt = useMemo(() => {
    if (areaMode === "direct") return toDirectAreaSqFt(directAreaVal, directAreaUnit);
    const lFt = dimToFt(lengthVal, lengthUnit, lengthCompA, lengthCompB);
    const wFt = dimToFt(widthVal,  widthUnit,  widthCompA,  widthCompB);
    return calcAreaSqFt(lFt, wFt);
  }, [areaMode, directAreaVal, directAreaUnit,
      lengthVal, lengthUnit, lengthCompA, lengthCompB,
      widthVal,  widthUnit,  widthCompA,  widthCompB]);

  const heightFt = useMemo(
    () => dimToFt(heightVal, heightUnit, heightCompA, heightCompB),
    [heightVal, heightUnit, heightCompA, heightCompB]
  );

  const cubicFt  = useMemo(() => areaSqFt && heightFt ? areaSqFt * heightFt : null, [areaSqFt, heightFt]);
  const usGal    = useMemo(() => cubicFt ? cubicFt * 7.48052   : null, [cubicFt]);
  const ukGal    = useMemo(() => cubicFt ? cubicFt * 6.22884   : null, [cubicFt]);
  const liters   = useMemo(() => cubicFt ? cubicFt * 28.3168   : null, [cubicFt]);
  const cubicYd  = useMemo(() => cubicFt ? cubicFt / 27        : null, [cubicFt]);
  const cubicM   = useMemo(() => cubicFt ? cubicFt * 0.0283168 : null, [cubicFt]);

  const galPerSqFt = useMemo(() => calcGalPerSqFt(usGal, areaSqFt), [usGal, areaSqFt]);
  const galPerSqYd = useMemo(() => galPerSqFt ? galPerSqFt * 9 : null, [galPerSqFt]);

  const volDisplay  = useMemo(() => fromCubicFt(cubicFt, volOutputUnit),       [cubicFt, volOutputUnit]);
  const gpsfDisplay = useMemo(() => fromUSGalPerSqFt(galPerSqFt, gpsfUnit),    [galPerSqFt, gpsfUnit]);
  const areaDisplay = useMemo(() => convertArea(areaSqFt, areaDispUnit),        [areaSqFt, areaDispUnit]);

  // Coverage section
  const crSqFtGal       = useMemo(() => toCoverageRateSqFtPerGal(coverageRate, coverageRateUnit), [coverageRate, coverageRateUnit]);
  const gallonsNeededBase = useMemo(() => calcGallonsNeeded(areaSqFt, crSqFtGal, numCoats, 0), [areaSqFt, crSqFtGal, numCoats]);
  const gallonsNeeded   = useMemo(() => calcGallonsNeeded(areaSqFt, crSqFtGal, numCoats, wastePct), [areaSqFt, crSqFtGal, numCoats, wastePct]);
  const wasteGallons    = useMemo(() => calcWasteGallons(gallonsNeededBase, wastePct), [gallonsNeededBase, wastePct]);
  const coverageArea    = useMemo(() => calcCoverageArea(usGal, crSqFtGal), [usGal, crSqFtGal]);

  const hasResults = !!(areaSqFt && heightFt);

  // Auto-open results when computable
  useEffect(() => {
    if (hasResults) setOpen((prev) => { const n = new Set(prev); n.add("results"); return n; });
  }, [hasResults]);

  // Display labels
  const volSymbol  = VOLUME_OUTPUT_UNITS.find((u) => u.id === volOutputUnit)?.symbol || volOutputUnit;
  const gpsfSymbol = GPSF_OUTPUT_UNITS.find((u) => u.id === gpsfUnit)?.symbol || gpsfUnit;
  const areaLabel  = AREA_DISPLAY_UNITS.find((u) => u.id === areaDispUnit)?.label || areaDispUnit;

  function handleCopy() {
    if (!hasResults) return;
    const lines = [
      "Gallons per Square Foot Calculator Results",
      `Area:          ${fmt2(areaDisplay)} ${areaLabel}`,
      `Height:        ${fmt2(heightFt * 12)} in`,
      `Volume (ft³):  ${fmt2(cubicFt)} ft³`,
      `Cubic Yards:   ${fmtG(cubicYd, 4)} yd³`,
      `Cubic Meters:  ${fmtG(cubicM, 6)} m³`,
      `Liters:        ${fmt2(liters)} L`,
      `US Gallons:    ${fmt2(usGal)} US gal`,
      `UK Gallons:    ${fmt2(ukGal)} UK gal`,
      `Gal / sq ft:   ${fmtG(galPerSqFt)} US gal/ft²`,
      `Gal / sq yd:   ${fmtG(galPerSqYd)} US gal/yd²`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setLengthVal(""); setLengthUnit("ft"); setLengthCompA(""); setLengthCompB("");
    setWidthVal("");  setWidthUnit("ft");  setWidthCompA(""); setWidthCompB("");
    setDirectAreaVal(""); setDirectAreaUnit("sqft");
    setHeightVal(""); setHeightUnit("in"); setHeightCompA(""); setHeightCompB("");
    setCoverageRate(""); setCoverageRateUnit("sqft_usgal");
    setMaterialId("none"); setNumCoats(1); setWastePct(10);
    setAreaMode("lw"); setVolOutputUnit("cuft"); setGpsfUnit("usgal_sqft"); setAreaDispUnit("sqft");
    setTouched({}); setCopied(false);
  }

  // Validation
  const lengthErr = touched.length    ? (isDimValid(lengthVal, lengthUnit, lengthCompA, lengthCompB) ? null : "Enter a positive length.") : null;
  const widthErr  = touched.width     ? (isDimValid(widthVal,  widthUnit,  widthCompA,  widthCompB)  ? null : "Enter a positive width.")  : null;
  const heightErr = touched.height    ? (isDimValid(heightVal, heightUnit, heightCompA, heightCompB) ? null : "Enter a positive height.") : null;
  const dAreaErr  = touched.directArea ? (!toDirectAreaSqFt(directAreaVal, directAreaUnit) ? "Enter a positive area." : null) : null;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Material Type ── */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <FieldGroup label="Material Type" hint="Auto-fills the typical coverage rate">
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                style={{ ...SELECT, width: "100%" }}
              >
                {MATERIAL_TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </FieldGroup>
          </div>
          {materialId !== "none" && (
            <InfoPill text={`Typical: ${MATERIAL_TYPES.find((m) => m.id === materialId)?.coverageSqFtPerGal} sq ft/gal`} />
          )}
        </div>
      </div>

      {/* ── Surface Area ── */}
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
                <FieldGroup label="Length" error={lengthErr}>
                  <DimensionInput
                    val={lengthVal} setVal={setLengthVal}
                    unit={lengthUnit} setUnit={setLengthUnit}
                    compA={lengthCompA} setCompA={setLengthCompA}
                    compB={lengthCompB} setCompB={setLengthCompB}
                    units={DIM_UNITS} placeholder="e.g. 20"
                    onBlurField={() => touch("length")} hasError={!!lengthErr}
                  />
                </FieldGroup>
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <FieldGroup label="Width" error={widthErr}>
                  <DimensionInput
                    val={widthVal} setVal={setWidthVal}
                    unit={widthUnit} setUnit={setWidthUnit}
                    compA={widthCompA} setCompA={setWidthCompA}
                    compB={widthCompB} setCompB={setWidthCompB}
                    units={DIM_UNITS} placeholder="e.g. 15"
                    onBlurField={() => touch("width")} hasError={!!widthErr}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>
        ) : (
          <FieldGroup label="Area" hint="Enter the surface area to be coated or filled. Switch to 'Length × Width' mode above to calculate from dimensions." error={dAreaErr}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={directAreaVal} placeholder="e.g. 300"
                onChange={(e) => setDirectAreaVal(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = dAreaErr ? "var(--error)" : "var(--accent)")}
                onBlur={(e) => { e.target.style.borderColor = dAreaErr ? "var(--error)" : "var(--border)"; touch("directArea"); }}
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
                {fmt2(areaDisplay)}
              </span>
            </div>
            <select value={areaDispUnit} onChange={(e) => setAreaDispUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 90 }}>
              {AREA_DISPLAY_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        )}
      </SectionCard>

      {/* ── Height / Thickness ── */}
      <SectionCard id="height" title="Height / Thickness" icon="↕️" open={open.has("height")} onToggle={toggleSection}>
        <FieldGroup label="Height / Thickness" hint="For coatings (paint, epoxy, sealer): the applied film thickness in mils or mm. For liquids (pond, pool): the water depth in inches or feet." error={heightErr}>
          <DimensionInput
            val={heightVal} setVal={setHeightVal}
            unit={heightUnit} setUnit={setHeightUnit}
            compA={heightCompA} setCompA={setHeightCompA}
            compB={heightCompB} setCompB={setHeightCompB}
            units={DIM_UNITS} placeholder="e.g. 2"
            onBlurField={() => touch("height")} hasError={!!heightErr}
          />
        </FieldGroup>
        {heightFt && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 8, marginBottom: 0 }}>
            = {fmtG(heightFt * 12, 4)} in = {fmtG(heightFt, 6)} ft
          </p>
        )}
        {areaSqFt && heightFt && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Auto volume: </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              {fmt2(cubicFt)} ft³ = {fmt2(usGal)} US gal
            </span>
          </div>
        )}
      </SectionCard>

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="📊" open={open.has("results")} onToggle={toggleSection}>
        {!hasResults ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "12px 0" }}>
            Enter area and height above to see results.
          </p>
        ) : (
          <>
            {/* Volume display unit selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <label style={{ ...LBL, marginBottom: 0 }}>Volume unit</label>
              <select value={volOutputUnit} onChange={(e) => setVolOutputUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 190 }}>
                {VOLUME_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>

            <div>
              <ResultRow label="Area"         value={fmt2(areaDisplay)}   unit={areaLabel}   />
              <ResultRow label="Height"       value={fmt2(heightFt * 12)} unit="in"          />
              <ResultRow label={`Volume (${volSymbol})`} value={fmtG(volDisplay, 4)} unit={volSymbol} accent bold />
              <ResultRow label="Cubic Feet"   value={fmt2(cubicFt)}       unit="ft³"         />
              <ResultRow label="Cubic Yards"  value={fmtG(cubicYd, 4)}    unit="yd³"         />
              <ResultRow label="Cubic Meters" value={fmtG(cubicM, 6)}     unit="m³"          />
              <ResultRow label="Liters"       value={fmt2(liters)}         unit="L"           />
              <ResultRow label="US Gallons"   value={fmt2(usGal)}          unit="US gal" accent bold />
              <ResultRow label="UK Gallons"   value={fmt2(ukGal)}          unit="UK gal"      />
              <ResultRow label="Gal / sq ft"  value={fmtG(galPerSqFt)}    unit="US gal/ft²" accent />
              <ResultRow label="Gal / sq yd"  value={fmtG(galPerSqYd)}    unit="US gal/yd²"  />
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
              <button className="btn btn-ghost" onClick={handleReset}
                style={{ fontSize: 13, padding: "8px 16px", color: "var(--text-muted)" }}>
                ↺ Reset
              </button>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={{
          usgal: usGal,
          ukgal: ukGal,
          liter: liters,
          cuft:  cubicFt,
          cuyd:  cubicYd,
          cum:   cubicM,
        }}
        priceUnits={[
          { id: "usgal", label: "per US gal", display: "US gal" },
          { id: "ukgal", label: "per UK gal", display: "UK gal" },
          { id: "liter", label: "per liter",  display: "liter"  },
          { id: "cuft",  label: "per ft³",    display: "ft³"    },
          { id: "cuyd",  label: "per yd³",    display: "yd³"    },
          { id: "cum",   label: "per m³",     display: "m³"     },
        ]}
        defaultPriceUnit="usgal"
      />

      {/* ── Gallons per Square Foot ── */}
      <SectionCard id="gpsf" title="Gallons per Square Foot" icon="💧" open={open.has("gpsf")} onToggle={toggleSection}>
        {gpsfDisplay ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)", borderRadius: "var(--radius-md)", padding: "12px 20px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  {gpsfSymbol}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(22px, 4vw, 32px)", color: "var(--accent)", letterSpacing: "-0.02em" }}>
                  {fmtG(gpsfDisplay, 4)}
                </div>
              </div>
              <div>
                <label style={LBL}>Display unit</label>
                <select value={gpsfUnit} onChange={(e) => setGpsfUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 180 }}>
                  {GPSF_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>
            {galPerSqYd && (
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
                Per sq yd: <strong style={{ color: "var(--text-primary)" }}>{fmtG(galPerSqYd)} US gal/yd²</strong>
                {"  ·  "}Formula: US Gal ÷ Area = {fmt2(usGal)} ÷ {fmt2(areaSqFt)} = {fmtG(galPerSqFt)} US gal/ft²
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
            Enter area and height to calculate gallons per sq ft.
          </p>
        )}
      </SectionCard>

      {/* ── Coverage Rate ── */}
      <SectionCard id="coverage" title="Coverage Rate" icon="🎨" open={open.has("coverage")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FieldGroup label="Coverage Rate" hint="How many sq ft does one gallon cover?">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={coverageRate} placeholder="e.g. 350"
                onChange={(e) => { setCoverageRate(e.target.value); setMaterialId("none"); }}
                style={{ ...INPUT, flex: "1 1 100px", minWidth: 0 }}
              />
              <select value={coverageRateUnit} onChange={(e) => setCoverageRateUnit(e.target.value)} style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 170 }}>
                {COVERAGE_RATE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </FieldGroup>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[250, 300, 350, 400].map((r) => (
              <button
                key={r} className="btn btn-ghost"
                onClick={() => { setCoverageRate(String(r)); setCoverageRateUnit("sqft_usgal"); setMaterialId("none"); }}
                style={{
                  fontSize: 12, padding: "5px 12px",
                  background: coverageRate === String(r) && coverageRateUnit === "sqft_usgal" ? "var(--accent-light)" : undefined,
                  color:      coverageRate === String(r) && coverageRateUnit === "sqft_usgal" ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {r} sq ft/gal
              </button>
            ))}
          </div>
          {crSqFtGal && areaSqFt && (
            <div>
              <ResultRow label="Coverage area from computed volume" value={fmt2(coverageArea)} unit="sq ft" />
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Coats & Waste ── */}
      <SectionCard id="coats" title="Number of Coats" icon="🖌️" open={open.has("coats")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setNumCoats((n) => Math.max(1, n - 1))}
              disabled={numCoats <= 1}
              style={{ width: 42, height: 42, padding: 0, fontSize: 22, fontWeight: 300, borderRadius: "var(--radius-md) 0 0 var(--radius-md)", border: "1.5px solid var(--border)", borderRight: "none", opacity: numCoats <= 1 ? 0.35 : 1 }}
            >
              −
            </button>
            <div style={{ ...INPUT, width: 70, textAlign: "center", borderRadius: 0, fontWeight: 800, fontSize: 20, pointerEvents: "none" }}>
              {numCoats}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => setNumCoats((n) => Math.min(20, n + 1))}
              disabled={numCoats >= 20}
              style={{ width: 42, height: 42, padding: 0, fontSize: 22, fontWeight: 300, borderRadius: "0 var(--radius-md) var(--radius-md) 0", border: "1.5px solid var(--border)", borderLeft: "none", opacity: numCoats >= 20 ? 0.35 : 1 }}
            >
              +
            </button>
            <span style={{ marginLeft: 14, fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
              coat{numCoats !== 1 ? "s" : ""} (1–20)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label style={{ ...LBL, marginBottom: 0 }}>Waste Factor</label>
            <select value={wastePct} onChange={(e) => setWastePct(Number(e.target.value))} style={{ ...SELECT, width: "auto", minWidth: 150 }}>
              {WASTE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {gallonsNeeded && (
            <div>
              <ResultRow
                label={`Total gallons needed (${numCoats} coat${numCoats > 1 ? "s" : ""} + ${wastePct}% waste)`}
                value={fmt2(gallonsNeeded)} unit="US gal" accent bold
              />
              {wasteGallons > 0 && (
                <ResultRow label={`Waste allowance (${wastePct}%)`} value={fmt2(wasteGallons)} unit="US gal" />
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢" open={open.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FormulaBox text="Area = Length × Width   (or enter directly)" />
          <FormulaBox text="Volume (ft³) = Area (ft²) × Height (ft)" />
          <FormulaBox text="US Gallons = Volume (ft³) × 7.48052" />
          <FormulaBox text="UK Gallons = Volume (ft³) × 6.22884" />
          <FormulaBox text="Gal / sq ft = US Gallons ÷ Area (ft²)" />
          <FormulaBox text="Gal / sq yd = Gal / sq ft × 9" />
          <FormulaBox text="Gallons Needed = (Area ÷ Coverage Rate) × Coats × (1 + Waste%)" />
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            All units convert internally to feet before calculation. Volume is auto-computed from area and height — no manual entry needed.
          </p>
        </div>
      </SectionCard>

      {/* ── Example ── */}
      <SectionCard id="example" title="Example" icon="📝" open={open.has("example")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["Length",      "20 ft"],
            ["Width",       "15 ft"],
            ["Area",        "20 × 15 = 300 sq ft"],
            ["Height",      "2 in = 0.1667 ft"],
            ["Volume",      "300 × 0.1667 = 50.00 ft³"],
            ["US Gallons",  "50 × 7.48052 = 374.03 US gal"],
            ["UK Gallons",  "50 × 6.22884 = 311.44 UK gal"],
            ["Gal / sq ft", "374.03 ÷ 300 = 1.25 US gal/ft²"],
            ["Gal / sq yd", "1.25 × 9 = 11.22 US gal/yd²"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", minWidth: 120, flexShrink: 0 }}>{k}:</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, padding: "10px 14px", background: "var(--accent-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
              Result: 374.03 US gal · 1.25 US gal/ft² · 11.22 US gal/yd²
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Notes ── */}
      <SectionCard id="notes" title="Notes" icon="💡" open={open.has("notes")} onToggle={toggleSection}>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Volume is computed automatically from Area × Height — no manual volume entry needed.",
            "1 US Gallon = 231 cubic inches = 3.78541 liters.",
            "1 UK (Imperial) Gallon = 277.42 cubic inches = 4.54609 liters.",
            "1 cubic foot = 7.48052 US gal = 6.22884 UK gal.",
            "Compound units (ft/in, m/cm) let you enter mixed measurements without converting.",
            "Soccer field reference: 105 m × 68 m ≈ 76,854 sq ft (FIFA standard size).",
            "Coverage rates vary by product brand, formulation, and surface porosity.",
            "Add 10–15% waste for irregular surfaces or first-time applications.",
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
