import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  AREA_DISPLAY_UNITS, COVERAGE_RATE_UNITS, WASTE_OPTIONS, MATERIAL_TYPES,
  DIM_UNITS, DIRECT_AREA_UNITS, VOLUME_OUTPUT_UNITS, GPSF_OUTPUT_UNITS,
  dimToFt, toDirectAreaSqFt, fromCubicFt, fromUSGalPerSqFt,
  toCoverageRateSqFtPerGal, convertArea,
  calcGallonsNeeded, fmtG, fmt2,
} from "../../../utils/gallonsCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";

// ── Design tokens ──────────────────────────────────────────────
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

// ── UI primitives ──────────────────────────────────────────────
function SectionLabel({ icon, text }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      marginBottom: 14, paddingBottom: 10,
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        {text}
      </span>
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
      padding: "8px 0", borderBottom: "1px solid var(--border)",
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
      borderRadius: "var(--radius-md)", padding: "10px 16px",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: "clamp(12px, 2vw, 13px)", color: "var(--text-primary)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

function DimensionInput({
  val, setVal, unit, setUnit,
  compA, setCompA, compB, setCompB,
  units, placeholder, onBlurField, hasError,
}) {
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
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 170 }}
      >
        {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

function isDimValid(val, unit, compA, compB) {
  if (unit === "ft_in" || unit === "m_cm") return (parseFloat(compA) || 0) + (parseFloat(compB) || 0) > 0;
  const n = parseFloat(val);
  return isFinite(n) && n > 0;
}

// ── Main component ─────────────────────────────────────────────
export default function GallonsCalculatorTool() {
  const [calcMode, setCalcMode] = useState("coverage"); // "coverage" | "volume"

  // Shared area state
  const [areaMode,      setAreaMode]      = useState("lw");
  const [lengthVal,     setLengthVal]     = useState("");
  const [lengthUnit,    setLengthUnit]    = useState("ft");
  const [lengthCompA,   setLengthCompA]   = useState("");
  const [lengthCompB,   setLengthCompB]   = useState("");
  const [widthVal,      setWidthVal]      = useState("");
  const [widthUnit,     setWidthUnit]     = useState("ft");
  const [widthCompA,    setWidthCompA]    = useState("");
  const [widthCompB,    setWidthCompB]    = useState("");
  const [directAreaVal, setDirectAreaVal] = useState("");
  const [directAreaUnit,setDirectAreaUnit]= useState("sqft");
  const [areaDispUnit,  setAreaDispUnit]  = useState("sqft");

  // Coverage planner state
  const [coverageRate,     setCoverageRate]     = useState("");
  const [coverageRateUnit, setCoverageRateUnit] = useState("sqft_usgal");
  const [materialId,       setMaterialId]       = useState("none");
  const [numCoats,         setNumCoats]         = useState(1);
  const [wastePct,         setWastePct]         = useState(10);

  // Volume calculator state
  const [depthVal,      setDepthVal]      = useState("");
  const [depthUnit,     setDepthUnit]     = useState("in");
  const [depthCompA,    setDepthCompA]    = useState("");
  const [depthCompB,    setDepthCompB]    = useState("");
  const [volOutputUnit, setVolOutputUnit] = useState("usgal");
  const [gpsfUnit,      setGpsfUnit]      = useState("usgal_sqft");

  // UI
  const [touched,  setTouched]  = useState({});
  const [copied,   setCopied]   = useState(false);
  const copyTimer               = useRef(null);
  const touch = useCallback((k) => setTouched((p) => ({ ...p, [k]: true })), []);

  // Auto-fill coverage rate from material preset
  useEffect(() => {
    const mat = MATERIAL_TYPES.find((m) => m.id === materialId);
    if (mat?.coverageSqFtPerGal) {
      setCoverageRate(String(mat.coverageSqFtPerGal));
      setCoverageRateUnit("sqft_usgal");
    }
  }, [materialId]);

  // ── Computed: shared area ──────────────────────────────────────
  const areaSqFt = useMemo(() => {
    if (areaMode === "direct") return toDirectAreaSqFt(directAreaVal, directAreaUnit);
    const lFt = dimToFt(lengthVal, lengthUnit, lengthCompA, lengthCompB);
    const wFt = dimToFt(widthVal,  widthUnit,  widthCompA,  widthCompB);
    return lFt && wFt ? lFt * wFt : null;
  }, [areaMode, directAreaVal, directAreaUnit,
      lengthVal, lengthUnit, lengthCompA, lengthCompB,
      widthVal,  widthUnit,  widthCompA,  widthCompB]);

  const areaDisplay = useMemo(() => convertArea(areaSqFt, areaDispUnit), [areaSqFt, areaDispUnit]);
  const areaLabel   = AREA_DISPLAY_UNITS.find((u) => u.id === areaDispUnit)?.label || areaDispUnit;

  // ── Coverage planner ───────────────────────────────────────────
  const crSqFtGal    = useMemo(() => toCoverageRateSqFtPerGal(coverageRate, coverageRateUnit), [coverageRate, coverageRateUnit]);
  const gallonsBase  = useMemo(() => calcGallonsNeeded(areaSqFt, crSqFtGal, numCoats, 0),       [areaSqFt, crSqFtGal, numCoats]);
  const gallonsTotal = useMemo(() => calcGallonsNeeded(areaSqFt, crSqFtGal, numCoats, wastePct), [areaSqFt, crSqFtGal, numCoats, wastePct]);
  const wasteGal     = useMemo(() => gallonsBase && wastePct > 0 ? gallonsBase * wastePct / 100 : 0, [gallonsBase, wastePct]);
  const galPerSqFtRate = useMemo(() => crSqFtGal ? 1 / crSqFtGal : null, [crSqFtGal]);

  const containers = useMemo(() => {
    if (!gallonsTotal) return null;
    return {
      quarts:  Math.ceil(gallonsTotal * 4),
      halfGal: Math.ceil(gallonsTotal * 2),
      oneGal:  Math.ceil(gallonsTotal),
      fiveGal: Math.ceil(gallonsTotal / 5),
    };
  }, [gallonsTotal]);

  // ── Volume calculator ──────────────────────────────────────────
  const depthFt  = useMemo(() => dimToFt(depthVal, depthUnit, depthCompA, depthCompB), [depthVal, depthUnit, depthCompA, depthCompB]);
  const cubicFt  = useMemo(() => areaSqFt && depthFt ? areaSqFt * depthFt : null, [areaSqFt, depthFt]);
  const usGal    = useMemo(() => cubicFt ? cubicFt * 7.48052   : null, [cubicFt]);
  const ukGal    = useMemo(() => cubicFt ? cubicFt * 6.22884   : null, [cubicFt]);
  const liters   = useMemo(() => cubicFt ? cubicFt * 28.3168   : null, [cubicFt]);
  const mL       = useMemo(() => cubicFt ? cubicFt * 28316.8   : null, [cubicFt]);
  const cubicYd  = useMemo(() => cubicFt ? cubicFt / 27        : null, [cubicFt]);
  const cubicM   = useMemo(() => cubicFt ? cubicFt * 0.0283168 : null, [cubicFt]);

  const galPerSqFtVol = useMemo(() => usGal && areaSqFt ? usGal / areaSqFt : null, [usGal, areaSqFt]);
  const galPerSqYdVol = useMemo(() => galPerSqFtVol ? galPerSqFtVol * 9 : null, [galPerSqFtVol]);
  const volDisplay    = useMemo(() => fromCubicFt(cubicFt, volOutputUnit), [cubicFt, volOutputUnit]);
  const gpsfDisplay   = useMemo(() => fromUSGalPerSqFt(galPerSqFtVol, gpsfUnit), [galPerSqFtVol, gpsfUnit]);

  const volSymbol  = VOLUME_OUTPUT_UNITS.find((u) => u.id === volOutputUnit)?.symbol || volOutputUnit;
  const gpsfSymbol = GPSF_OUTPUT_UNITS.find((u) => u.id === gpsfUnit)?.symbol || gpsfUnit;

  // ── Validation ─────────────────────────────────────────────────
  const lengthErr = touched.length     && !isDimValid(lengthVal, lengthUnit, lengthCompA, lengthCompB) ? "Enter a positive length." : null;
  const widthErr  = touched.width      && !isDimValid(widthVal,  widthUnit,  widthCompA,  widthCompB)  ? "Enter a positive width."  : null;
  const dAreaErr  = touched.directArea && !toDirectAreaSqFt(directAreaVal, directAreaUnit)             ? "Enter a positive area."  : null;
  const depthErr  = touched.depth      && !isDimValid(depthVal,  depthUnit,  depthCompA,  depthCompB)  ? "Enter a positive depth." : null;

  // ── Copy ───────────────────────────────────────────────────────
  function handleCopy() {
    let text = "";
    if (calcMode === "coverage" && gallonsTotal) {
      text = [
        "Gallons per Square Foot — Coverage Planner",
        `Area:               ${fmt2(areaDisplay)} ${areaLabel}`,
        `Coverage Rate:      ${fmt2(crSqFtGal)} ft²/US gal`,
        `Coats:              ${numCoats}`,
        `Waste Factor:       ${wastePct}%`,
        `Base Gallons:       ${fmt2(gallonsBase)} US gal`,
        `Waste Allowance:    ${fmt2(wasteGal)} US gal`,
        `Total Gallons:      ${fmt2(gallonsTotal)} US gal`,
        `Gal / sq ft:        ${fmtG(galPerSqFtRate, 6)} US gal/ft²`,
        `1-Gal cans needed:  ${containers?.oneGal}`,
        `5-Gal buckets:      ${containers?.fiveGal}`,
      ].join("\n");
    } else if (calcMode === "volume" && usGal) {
      text = [
        "Gallons per Square Foot — Volume Calculator",
        `Area:          ${fmt2(areaDisplay)} ${areaLabel}`,
        `Depth:         ${fmtG(depthFt * 12, 4)} in = ${fmtG(depthFt, 6)} ft`,
        `Volume (ft³):  ${fmt2(cubicFt)} ft³`,
        `US Gallons:    ${fmt2(usGal)} US gal`,
        `UK Gallons:    ${fmt2(ukGal)} UK gal`,
        `Liters:        ${fmt2(liters)} L`,
        `Cubic Yards:   ${fmtG(cubicYd, 4)} yd³`,
        `Cubic Meters:  ${fmtG(cubicM, 6)} m³`,
        `Gal / sq ft:   ${fmtG(galPerSqFtVol)} US gal/ft²`,
        `Gal / sq yd:   ${fmtG(galPerSqYdVol)} US gal/yd²`,
      ].join("\n");
    }
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setLengthVal(""); setLengthUnit("ft"); setLengthCompA(""); setLengthCompB("");
    setWidthVal("");  setWidthUnit("ft");  setWidthCompA(""); setWidthCompB("");
    setDirectAreaVal(""); setDirectAreaUnit("sqft"); setAreaMode("lw"); setAreaDispUnit("sqft");
    setCoverageRate(""); setCoverageRateUnit("sqft_usgal"); setMaterialId("none");
    setNumCoats(1); setWastePct(10);
    setDepthVal(""); setDepthUnit("in"); setDepthCompA(""); setDepthCompB("");
    setVolOutputUnit("usgal"); setGpsfUnit("usgal_sqft");
    setTouched({}); setCopied(false);
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Mode toggle ── */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {[
            { id: "coverage", label: "Coverage Planner" },
            { id: "volume",   label: "Volume Calculator" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setCalcMode(m.id)}
              style={{
                padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                border: "2px solid", cursor: "pointer", transition: "all .15s",
                fontFamily: "var(--font-display)",
                background:  calcMode === m.id ? "var(--accent)" : "transparent",
                borderColor: calcMode === m.id ? "var(--accent)" : "var(--border)",
                color:       calcMode === m.id ? "#fff" : "var(--text-muted)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 12.5, fontWeight: 500, color: "var(--text-muted)" }}>
          {calcMode === "coverage"
            ? "Enter your area and coverage rate to get total gallons needed, gal/ft², and containers to buy."
            : "Enter area and depth/thickness to get volume in gallons and the gal/ft² fill rate."}
        </p>
      </div>

      {/* ── Surface Area (shared) ── */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <SectionLabel icon="📏" text="Surface Area" />
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
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Length" error={lengthErr}>
                <DimensionInput
                  val={lengthVal} setVal={setLengthVal} unit={lengthUnit} setUnit={setLengthUnit}
                  compA={lengthCompA} setCompA={setLengthCompA} compB={lengthCompB} setCompB={setLengthCompB}
                  units={DIM_UNITS} placeholder="e.g. 20"
                  onBlurField={() => touch("length")} hasError={!!lengthErr}
                />
              </FieldGroup>
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Width" error={widthErr}>
                <DimensionInput
                  val={widthVal} setVal={setWidthVal} unit={widthUnit} setUnit={setWidthUnit}
                  compA={widthCompA} setCompA={setWidthCompA} compB={widthCompB} setCompB={setWidthCompB}
                  units={DIM_UNITS} placeholder="e.g. 15"
                  onBlurField={() => touch("width")} hasError={!!widthErr}
                />
              </FieldGroup>
            </div>
          </div>
        ) : (
          <FieldGroup label="Area" error={dAreaErr}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={directAreaVal} placeholder="e.g. 300"
                onChange={(e) => setDirectAreaVal(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = dAreaErr ? "var(--error)" : "var(--accent)")}
                onBlur={(e) => { e.target.style.borderColor = dAreaErr ? "var(--error)" : "var(--border)"; touch("directArea"); }}
                style={{ ...INPUT, flex: "1 1 100px", minWidth: 0, borderColor: dAreaErr ? "var(--error)" : "var(--border)" }}
              />
              <select value={directAreaUnit} onChange={(e) => setDirectAreaUnit(e.target.value)} style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 210 }}>
                {DIRECT_AREA_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </FieldGroup>
        )}

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
      </div>

      {/* ══════════ COVERAGE PLANNER ══════════ */}
      {calcMode === "coverage" && (
        <>
          {/* Material + Coverage Rate */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <SectionLabel icon="🎨" text="Material & Coverage Rate" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <FieldGroup label="Material Type" hint="Auto-fills a typical coverage rate for the selected material">
                    <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} style={{ ...SELECT, width: "100%" }}>
                      {MATERIAL_TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </FieldGroup>
                </div>
                {materialId !== "none" && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--accent-light)", borderRadius: 99, padding: "6px 14px",
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)",
                    whiteSpace: "nowrap", flexShrink: 0, marginBottom: 7,
                  }}>
                    Typical: {MATERIAL_TYPES.find((m) => m.id === materialId)?.coverageSqFtPerGal} ft²/gal
                  </div>
                )}
              </div>

              <FieldGroup label="Coverage Rate" hint="How many square feet does one gallon cover?">
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
                    {r} ft²/gal
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coats & Waste */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <SectionLabel icon="🖌️" text="Coats & Waste Factor" />
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={LBL}>Number of Coats</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button className="btn btn-ghost" onClick={() => setNumCoats((n) => Math.max(1, n - 1))} disabled={numCoats <= 1}
                    style={{ width: 40, height: 42, padding: 0, fontSize: 22, fontWeight: 300, borderRadius: "var(--radius-md) 0 0 var(--radius-md)", border: "1.5px solid var(--border)", borderRight: "none", opacity: numCoats <= 1 ? 0.35 : 1 }}>
                    −
                  </button>
                  <div style={{ ...INPUT, width: 60, textAlign: "center", borderRadius: 0, fontWeight: 800, fontSize: 20, pointerEvents: "none" }}>
                    {numCoats}
                  </div>
                  <button className="btn btn-ghost" onClick={() => setNumCoats((n) => Math.min(20, n + 1))} disabled={numCoats >= 20}
                    style={{ width: 40, height: 42, padding: 0, fontSize: 22, fontWeight: 300, borderRadius: "0 var(--radius-md) var(--radius-md) 0", border: "1.5px solid var(--border)", borderLeft: "none", opacity: numCoats >= 20 ? 0.35 : 1 }}>
                    +
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <FieldGroup label="Waste Factor" hint="Add extra for spills, edges, and touch-ups">
                  <select value={wastePct} onChange={(e) => setWastePct(Number(e.target.value))} style={{ ...SELECT, width: "100%" }}>
                    {WASTE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Coverage Results */}
          {gallonsTotal ? (
            <div className="card" style={{ padding: "18px 20px" }}>
              <SectionLabel icon="✅" text="Results" />

              {/* Big primary result */}
              <div style={{
                background: "var(--accent-light)", border: "2px solid var(--accent)",
                borderRadius: "var(--radius-md)", padding: "20px 24px",
                textAlign: "center", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                  Total Gallons Needed
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 7vw, 52px)", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {fmt2(gallonsTotal)}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--accent)", marginTop: 6 }}>
                  US gallons
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 11.5, color: "var(--accent)", marginTop: 5, opacity: 0.75 }}>
                  {numCoats} coat{numCoats > 1 ? "s" : ""}
                  {wastePct > 0 ? ` + ${wastePct}% waste factor` : ""}
                </div>
              </div>

              {/* Detail rows */}
              <ResultRow label="Base gallons (no waste)"      value={fmt2(gallonsBase)}      unit="US gal" />
              {wastePct > 0 && <ResultRow label={`Waste allowance (${wastePct}%)`} value={fmt2(wasteGal)} unit="US gal" />}
              <ResultRow label="Area to cover"                 value={fmt2(areaDisplay)}      unit={areaLabel} />
              <ResultRow label="Coverage rate"                 value={fmt2(crSqFtGal)}        unit="ft² / US gal" />
              <ResultRow label="Gal per sq ft (per coat)"      value={fmtG(galPerSqFtRate, 6)} unit="US gal/ft²" accent />
              <ResultRow label="Sq ft per gallon"              value={fmt2(crSqFtGal)}        unit="ft² / gal" />

              {/* Containers to buy */}
              {containers && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Containers to Buy (rounded up)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                    {[
                      { label: "Quarts",         value: containers.quarts,  sub: "¼ gal each" },
                      { label: "Half-gallons",    value: containers.halfGal, sub: "½ gal each" },
                      { label: "1-Gal cans",      value: containers.oneGal,  sub: "1 gal each" },
                      { label: "5-Gal buckets",   value: containers.fiveGal, sub: "5 gal each" },
                    ].map(({ label, value, sub }) => (
                      <div key={label} style={{
                        background: "var(--bg-muted)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)", padding: "12px 10px", textAlign: "center",
                      }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5, color: "var(--text-primary)", marginTop: 5 }}>{label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-secondary" onClick={handleCopy} style={{
                  fontSize: 13, padding: "8px 16px",
                  background:  copied ? "#f0fdf4" : undefined,
                  color:       copied ? "#16a34a" : undefined,
                  borderColor: copied ? "#86efac" : undefined,
                  transition: "background 0.2s, color 0.2s",
                }}>
                  {copied ? "✓ Copied!" : "📋 Copy Results"}
                </button>
                <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: 13, padding: "8px 16px", color: "var(--text-muted)" }}>
                  ↺ Reset
                </button>
              </div>
            </div>
          ) : (areaSqFt || crSqFtGal) ? (
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 0", textAlign: "center" }}>
                <span style={{ fontSize: 28 }}>💧</span>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                  {!areaSqFt ? "Enter the surface area above to see results." : "Enter a coverage rate above to see results."}
                </p>
              </div>
            </div>
          ) : null}

          {gallonsTotal && (
            <PriceCheckerCard
              quantities={{ usgal: gallonsTotal }}
              priceUnits={[{ id: "usgal", label: "per US gal", display: "US gal" }]}
              defaultPriceUnit="usgal"
            />
          )}
        </>
      )}

      {/* ══════════ VOLUME CALCULATOR ══════════ */}
      {calcMode === "volume" && (
        <>
          {/* Depth / Thickness */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <SectionLabel icon="↕️" text="Depth / Thickness / Height" />
            <FieldGroup
              label="Depth / Thickness / Height"
              hint="Coatings: wet film thickness. Pools/ponds: liquid depth. Slabs: thickness."
              error={depthErr}
            >
              <DimensionInput
                val={depthVal} setVal={setDepthVal} unit={depthUnit} setUnit={setDepthUnit}
                compA={depthCompA} setCompA={setDepthCompA} compB={depthCompB} setCompB={setDepthCompB}
                units={DIM_UNITS} placeholder="e.g. 2"
                onBlurField={() => touch("depth")} hasError={!!depthErr}
              />
            </FieldGroup>
            {depthFt && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 8, marginBottom: 0 }}>
                = {fmtG(depthFt * 12, 4)} in &nbsp;·&nbsp; {fmtG(depthFt, 6)} ft &nbsp;·&nbsp; {fmtG(depthFt * 30.48, 4)} cm
              </p>
            )}
          </div>

          {/* Volume Results */}
          {usGal ? (
            <div className="card" style={{ padding: "18px 20px" }}>
              <SectionLabel icon="📊" text="Results" />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <label style={{ ...LBL, marginBottom: 0 }}>Volume unit</label>
                <select value={volOutputUnit} onChange={(e) => setVolOutputUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 190 }}>
                  {VOLUME_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>

              {/* Big volume result */}
              <div style={{
                background: "var(--accent-light)", border: "2px solid var(--accent)",
                borderRadius: "var(--radius-md)", padding: "20px 24px",
                textAlign: "center", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                  Volume
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 6vw, 48px)", color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {fmtG(volDisplay, 4)}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--accent)", marginTop: 6 }}>
                  {volSymbol}
                </div>
              </div>

              {/* All volume units */}
              <ResultRow label="Area"          value={fmt2(areaDisplay)}      unit={areaLabel} />
              <ResultRow label="Depth"         value={fmtG(depthFt * 12, 4)} unit="in" />
              <ResultRow label="Cubic Feet"    value={fmt2(cubicFt)}          unit="ft³" />
              <ResultRow label="US Gallons"    value={fmt2(usGal)}             unit="US gal" accent bold />
              <ResultRow label="UK Gallons"    value={fmt2(ukGal)}             unit="UK gal" />
              <ResultRow label="Liters"        value={fmt2(liters)}            unit="L" />
              <ResultRow label="Milliliters"   value={fmtG(mL, 1)}             unit="mL" />
              <ResultRow label="Cubic Yards"   value={fmtG(cubicYd, 4)}       unit="yd³" />
              <ResultRow label="Cubic Meters"  value={fmtG(cubicM, 6)}        unit="m³" />

              {/* Gal/sq ft callout */}
              <div style={{
                marginTop: 16, padding: "14px 16px",
                background: "var(--bg-muted)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Gallons per Square Foot
                  </span>
                  <select value={gpsfUnit} onChange={(e) => setGpsfUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 185 }}>
                    {GPSF_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                  {fmtG(gpsfDisplay, 6)}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--accent)", marginTop: 2 }}>
                  {gpsfSymbol}
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "var(--text-muted)", marginTop: 8, marginBottom: 0 }}>
                  Per sq yd: <strong style={{ color: "var(--text-primary)" }}>{fmtG(galPerSqYdVol)} US gal/yd²</strong>
                  &nbsp;·&nbsp; {fmt2(usGal)} US gal ÷ {fmt2(areaSqFt)} ft² = {fmtG(galPerSqFtVol)} gal/ft²
                </p>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-secondary" onClick={handleCopy} style={{
                  fontSize: 13, padding: "8px 16px",
                  background:  copied ? "#f0fdf4" : undefined,
                  color:       copied ? "#16a34a" : undefined,
                  borderColor: copied ? "#86efac" : undefined,
                  transition: "background 0.2s, color 0.2s",
                }}>
                  {copied ? "✓ Copied!" : "📋 Copy Results"}
                </button>
                <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: 13, padding: "8px 16px", color: "var(--text-muted)" }}>
                  ↺ Reset
                </button>
              </div>
            </div>
          ) : (areaSqFt || depthFt) ? (
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 0", textAlign: "center" }}>
                <span style={{ fontSize: 28 }}>💧</span>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                  {!areaSqFt ? "Enter the surface area above to see results." : "Enter a depth above to see results."}
                </p>
              </div>
            </div>
          ) : null}

          {usGal && (
            <PriceCheckerCard
              quantities={{ usgal: usGal, ukgal: ukGal, liter: liters, cuft: cubicFt, cuyd: cubicYd, cum: cubicM }}
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
          )}
        </>
      )}

      {/* ── Formulas (shared) ── */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <SectionLabel icon="🔢" text="Formulas" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Coverage Planner
          </div>
          <FormulaBox text="Gallons Needed = (Area ÷ Coverage Rate) × Coats" />
          <FormulaBox text="Total with Waste = Gallons Needed × (1 + Waste%)" />
          <FormulaBox text="Gal / sq ft = 1 ÷ Coverage Rate (ft² / gal)" />
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 8 }}>
            Volume Calculator
          </div>
          <FormulaBox text="Volume (ft³) = Area (ft²) × Depth (ft)" />
          <FormulaBox text="US Gallons = Volume (ft³) × 7.48052" />
          <FormulaBox text="Gal / sq ft = US Gallons ÷ Area = Depth (ft) × 7.48052" />
          <FormulaBox text="Gal / sq yd = Gal / sq ft × 9" />
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <SectionLabel icon="💡" text="Notes" />
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Coverage Planner: best for paints, primers, epoxy, sealers, stains, and roof coatings.",
            "Volume Calculator: best for pools, ponds, reservoirs, or liquid-fill applications.",
            "1 US Gallon = 231 in³ = 3.78541 L = 0.133681 ft³.",
            "1 UK (Imperial) Gallon = 277.42 in³ = 4.54609 L.",
            "1 cubic foot = 7.48052 US gal = 6.22884 UK gal.",
            "Coverage rates vary by product brand, formulation, and surface porosity.",
            "Add 10–15% waste for irregular surfaces, edges, or first-time applications.",
            "Containers Needed is always rounded up so you never run short.",
          ].map((tip) => (
            <li key={tip} style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
