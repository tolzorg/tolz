import { useState, useMemo, useRef } from "react";
import {
  ROCK_TYPES, LENGTH_UNITS, DEPTH_UNITS,
  AREA_OUT_UNITS, VOLUME_OUT_UNITS, WEIGHT_OUT_UNITS, DENSITY_UNITS, CURRENCIES,
  toLengthM, toDepthM, toDensityKgM3,
  fromM2, fromM3, fromKgRR,
  calcRiverRock, fmtRock,
} from "../../../utils/riverRockCalc";

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
  unitLabel = null,
  readOnlyInput = false,
}) {
  const actual_output = isOutput || readOnlyInput;
  const borderColor = actual_output ? "#bfdbfe" : hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type={actual_output ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={actual_output}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={!actual_output ? onBlur : undefined}
        style={actual_output ? OUTPUT_BASE : INPUT_BASE}
      />
      {unitLabel ? (
        <span style={{
          display: "flex", alignItems: "center",
          borderLeft: `1.5px solid ${borderColor}`,
          padding: "0 13px",
          background: actual_output ? "#eff6ff" : "var(--bg-muted)",
          color: actual_output ? "#1d4ed8" : "var(--text-muted)",
          fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
        }}>{unitLabel}</span>
      ) : (
        <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
          style={{
            ...SELECT_BASE,
            borderLeft: `1.5px solid ${borderColor}`,
            background: actual_output ? "#eff6ff" : "var(--bg-muted)",
            color: actual_output ? "#1d4ed8" : "var(--text-primary)",
          }}>
          {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      )}
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

// ── Price row: [number input] [currency] / [unit] ─────────────────
function PriceRow({ value, onChange, currency, onCurrencyChange, unit, onUnitChange, units, isOutput, placeholder = "0.00" }) {
  const borderColor = isOutput ? "#bfdbfe" : BORDER;
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
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={isOutput ? { ...OUTPUT_BASE } : { ...INPUT_BASE }}
      />
      <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)}
        style={{
          ...SELECT_BASE,
          borderLeft: `1.5px solid ${borderColor}`,
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          minWidth: 65,
        }}>
        {CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      {!isOutput && (
        <>
          <span style={{
            display: "flex", alignItems: "center", padding: "0 8px",
            background: "var(--bg-muted)", color: "var(--text-muted)",
            fontFamily: FONT, fontSize: 13, fontWeight: 600,
            borderLeft: `1.5px solid ${BORDER}`,
          }}>/</span>
          <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
            style={{
              ...SELECT_BASE, borderLeft: `1.5px solid ${BORDER}`,
              background: "var(--bg-muted)", color: "var(--text-primary)", minWidth: 70,
            }}>
            {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </>
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
export default function RiverRockCalculatorTool() {

  // ── Rock specifications ───────────────────────────────────────────
  const [rockTypeId,  setRockTypeId]  = useState("standard-river-rock");
  const [densityStr,  setDensityStr]  = useState("1425");
  const [densityUnit, setDensityUnit] = useState("kg/m3");

  // ── Coverage inputs ───────────────────────────────────────────────
  const [length,      setLength]      = useState("");
  const [lenUnit,     setLenUnit]     = useState("m");
  const [width,       setWidth]       = useState("");
  const [widUnit,     setWidUnit]     = useState("m");
  const [areaOutUnit, setAreaOutUnit] = useState("m2");
  const [depth,       setDepth]       = useState("");
  const [depUnit,     setDepUnit]     = useState("cm");
  const [volUnit,     setVolUnit]     = useState("m3");
  const [wastage,     setWastage]     = useState("5");
  const [volNeedUnit, setVolNeedUnit] = useState("m3");
  const [wgtUnit,     setWgtUnit]     = useState("t");

  // ── Cost inputs ───────────────────────────────────────────────────
  const [priceMass,     setPriceMass]     = useState("");
  const [priceMassCur,  setPriceMassCur]  = useState("USD");
  const [priceMassUnit, setPriceMassUnit] = useState("t");
  const [priceVol,      setPriceVol]      = useState("");
  const [priceVolCur,   setPriceVolCur]   = useState("USD");
  const [priceVolUnit,  setPriceVolUnit]  = useState("m3");
  const [costCur,       setCostCur]       = useState("USD");

  // ── Section open state ────────────────────────────────────────────
  const [specsOpen, setSpecsOpen] = useState(true);
  const [needOpen,  setNeedOpen]  = useState(true);
  const [costOpen,  setCostOpen]  = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  // ── Rock type change — auto-fill density ──────────────────────────
  const handleRockTypeChange = (id) => {
    setRockTypeId(id);
    const rt = ROCK_TYPES.find((r) => r.id === id);
    if (rt?.densityKgM3 != null) {
      setDensityStr(String(rt.densityKgM3));
      setDensityUnit("kg/m3");
    } else {
      setDensityStr("");
    }
  };

  const rockType     = useMemo(() => ROCK_TYPES.find((r) => r.id === rockTypeId), [rockTypeId]);
  const isCustomRock = rockTypeId === "custom";

  // ── Derive SI values ──────────────────────────────────────────────
  const densityKgM3 = useMemo(() => {
    if (!isCustomRock && rockType?.densityKgM3 != null) return rockType.densityKgM3;
    return toDensityKgM3(densityStr, densityUnit);
  }, [isCustomRock, rockType, densityStr, densityUnit]);

  const lengthM  = useMemo(() => toLengthM(length, lenUnit), [length, lenUnit]);
  const widthM   = useMemo(() => toLengthM(width, widUnit),  [width, widUnit]);
  const depthM   = useMemo(() => toDepthM(depth, depUnit),   [depth, depUnit]);
  const wastePct = useMemo(() => { const v = parseFloat(wastage); return isFinite(v) && v >= 0 ? v : 0; }, [wastage]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcRiverRock({
    lengthM, widthM, depthM, densityKgM3, wastagePct: wastePct,
  }), [lengthM, widthM, depthM, densityKgM3, wastePct]);

  // ── Display values ────────────────────────────────────────────────
  const dispArea     = result ? fmtRock(fromM2(result.areaM2, areaOutUnit), 4)        : "";
  const dispVol      = result ? fmtRock(fromM3(result.volumeM3, volUnit), 4)           : "";
  const dispVolNeed  = result ? fmtRock(fromM3(result.volumeNeededM3, volNeedUnit), 4) : "";
  const dispWgt      = result?.weightNeededKg != null
    ? fmtRock(fromKgRR(result.weightNeededKg, wgtUnit), 3) : "";

  // ── Total cost ────────────────────────────────────────────────────
  const totalCost = useMemo(() => {
    const pm = parseFloat(priceMass);
    if (isFinite(pm) && pm > 0 && result?.weightNeededKg != null) {
      const wInUnit = fromKgRR(result.weightNeededKg, priceMassUnit);
      return wInUnit * pm;
    }
    const pv = parseFloat(priceVol);
    if (isFinite(pv) && pv > 0 && result?.volumeNeededM3 != null) {
      const vInUnit = fromM3(result.volumeNeededM3, priceVolUnit);
      return vInUnit * pv;
    }
    return null;
  }, [priceMass, priceMassUnit, priceVol, priceVolUnit, result]);

  const dispCost = totalCost !== null ? fmtRock(totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const lenErr = touched.len && (length === "" || parseFloat(length) <= 0)
    ? "Please enter a positive value for the length." : null;
  const widErr = touched.wid && (width === "" || parseFloat(width) <= 0)
    ? "Please enter a positive value for the width." : null;
  const depErr = touched.dep && (depth === "" || parseFloat(depth) <= 0)
    ? "Please enter a positive value for the depth." : null;
  const denErr = isCustomRock && touched.den && (densityStr === "" || parseFloat(densityStr) <= 0)
    ? "Please enter a positive density value." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setLength(""); setWidth(""); setDepth(""); setWastage("5");
    setPriceMass(""); setPriceVol("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setRockTypeId("custom"); setDensityStr(""); setDensityUnit("kg/m3");
    setLenUnit("m"); setWidUnit("m"); setDepUnit("cm");
    setAreaOutUnit("m2"); setVolUnit("m3"); setVolNeedUnit("m3"); setWgtUnit("t");
    setPriceMassCur("USD"); setPriceMasUnit("t");
    setPriceVolCur("USD"); setPriceVolUnit("m3"); setCostCur("USD");
  }
  function setPriceMasUnit(v) { setPriceMassUnit(v); }
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
          SECTION 1 — River rock specifications
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={specsOpen} onToggle={() => setSpecsOpen(!specsOpen)}
          title="River rock specifications" />
        {specsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Rock type dropdown */}
            <Field label="Rock type"
              hint="Select a preset rock type to auto-fill its bulk density, or choose Custom to enter your own.">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={rockTypeId}
                  onChange={(e) => handleRockTypeChange(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    background: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                  }}
                >
                  {ROCK_TYPES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </Field>

            <Divider />

            {/* Density */}
            <Field label="Density"
              hint="Bulk density of the rock fill. Auto-filled for preset types; enter manually for Custom."
              error={denErr}>
              <CompoundField
                value={densityStr}
                onChange={isCustomRock ? setDensityStr : undefined}
                onBlur={() => touch("den")}
                unit={densityUnit}
                onUnitChange={isCustomRock ? setDensityUnit : undefined}
                units={DENSITY_UNITS}
                placeholder="e.g. 1680"
                isOutput={!isCustomRock}
                hasError={!!denErr}
              />
              {!isCustomRock && rockType?.densityKgM3 != null && (
                <span style={{ fontFamily: FONT, fontSize: 11.5, color: "#1d4ed8", fontWeight: 600 }}>
                  Auto-filled from rock type: {rockType.densityKgM3} kg/m³
                </span>
              )}
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — How much river rock do you need?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={needOpen} onToggle={() => setNeedOpen(!needOpen)}
          title="How much river rock do you need?" />
        {needOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Length */}
            <Field label="Length"
              hint="Length of the area to cover with river rock."
              error={lenErr}>
              <CompoundField
                value={length} onChange={setLength} onBlur={() => touch("len")}
                unit={lenUnit} onUnitChange={setLenUnit} units={LENGTH_UNITS}
                placeholder="e.g. 5" hasError={!!lenErr}
              />
            </Field>

            <Divider />

            {/* Width */}
            <Field label="Width"
              hint="Width of the area. Together with length, this gives the coverage area."
              error={widErr}>
              <CompoundField
                value={width} onChange={setWidth} onBlur={() => touch("wid")}
                unit={widUnit} onUnitChange={setWidUnit} units={LENGTH_UNITS}
                placeholder="e.g. 3" hasError={!!widErr}
              />
            </Field>

            <Divider />

            {/* Area — output */}
            <Field label="Area"
              hint="Computed as Length × Width. This is the surface area to cover."
              note={result === null ? "Enter length and width to compute area." : undefined}>
              <CompoundField
                value={dispArea}
                unit={areaOutUnit} onUnitChange={setAreaOutUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Depth */}
            <Field label="Depth"
              hint="Thickness of the river rock layer. Recommended: 5–10 cm for paths, 10–15 cm for drainage."
              error={depErr}>
              <CompoundField
                value={depth} onChange={setDepth} onBlur={() => touch("dep")}
                unit={depUnit} onUnitChange={setDepUnit} units={DEPTH_UNITS}
                placeholder="e.g. 10" hasError={!!depErr}
              />
            </Field>

            <Divider />

            {/* Volume — output */}
            <Field label="Volume"
              hint="Net volume = Area × Depth (before adding wastage)."
              note={result === null ? "Enter length, width, and depth to compute volume." : undefined}>
              <CompoundField
                value={dispVol}
                unit={volUnit} onUnitChange={setVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Wastage */}
            <Field label="Wastage"
              hint="Extra material to account for uneven surfaces, spillage, and settling. Typical: 5–15%.">
              <CompoundField
                value={wastage} onChange={setWastage} onBlur={() => {}}
                unitLabel="%" placeholder="5"
              />
            </Field>

            <Divider />

            {/* Volume needed — output */}
            <Field label="Volume needed"
              hint="Volume to order = Volume × (1 + Wastage / 100)."
              note={result === null ? "Enter all dimensions to compute volume needed." : undefined}>
              <CompoundField
                value={dispVolNeed}
                unit={volNeedUnit} onUnitChange={setVolNeedUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Weight needed — output */}
            <Field label="Weight needed"
              hint="Weight = Volume needed × Rock density. Requires density to be set."
              note={result !== null && result.weightNeededKg == null
                ? "Enter density above to compute weight." : undefined}>
              <CompoundField
                value={dispWgt}
                unit={wgtUnit} onUnitChange={setWgtUnit} units={WEIGHT_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            {/* Result summary cards */}
            {result && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { lbl: "Area",          val: fmtRock(result.areaM2, 3)          + " m²" },
                  { lbl: "Net volume",    val: fmtRock(result.volumeM3, 4)        + " m³" },
                  { lbl: "Order volume",  val: fmtRock(result.volumeNeededM3, 4)  + " m³" },
                  ...(result.weightNeededKg != null
                    ? [{ lbl: "Weight", val: fmtRock(result.weightNeededKg / 1000, 3) + " t" }]
                    : []),
                ].map(({ lbl, val }) => (
                  <div key={lbl} className="card"
                    style={{ flex: "1 1 80px", minWidth: 0, padding: "8px 10px" }}>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{lbl}</div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: "#1d4ed8" }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — How much will the river rock cost you?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="How much will the river rock cost you?" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Price per unit of mass */}
            <Field label="Price per one unit of mass"
              hint="Enter the cost per unit of weight (e.g. price per tonne). Used to compute total cost from weight needed.">
              <PriceRow
                value={priceMass}
                onChange={setPriceMass}
                currency={priceMassCur}
                onCurrencyChange={(c) => { setPriceMassCur(c); setCostCur(c); }}
                unit={priceMassUnit}
                onUnitChange={setPriceMassUnit}
                units={WEIGHT_OUT_UNITS}
              />
            </Field>

            <Divider />

            {/* Price per unit of volume */}
            <Field label="Price per one unit of volume"
              hint="Enter the cost per unit of volume (e.g. price per m³). Used if price per mass is not set.">
              <PriceRow
                value={priceVol}
                onChange={setPriceVol}
                currency={priceVolCur}
                onCurrencyChange={(c) => { setPriceVolCur(c); setCostCur(c); }}
                unit={priceVolUnit}
                onUnitChange={setPriceVolUnit}
                units={VOLUME_OUT_UNITS}
              />
            </Field>

            <Divider />

            {/* Total cost — output */}
            <Field label="Total cost"
              hint="Total cost = Weight needed × Price per mass (preferred), or Volume needed × Price per volume."
              note={dispCost === "" ? "Enter dimensions and a price above to calculate cost." : undefined}>
              <div style={{
                display: "flex", alignItems: "stretch",
                border: "1.5px solid #bfdbfe", borderRadius: RADIUS, overflow: "hidden",
              }}>
                <input readOnly type="text" value={dispCost} placeholder="—" style={OUTPUT_BASE} />
                <select value={costCur} onChange={(e) => setCostCur(e.target.value)}
                  style={{
                    ...SELECT_BASE, borderLeft: "1.5px solid #bfdbfe",
                    background: "#eff6ff", color: "#1d4ed8", minWidth: 65,
                  }}>
                  {CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
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
                Did we solve your problem?
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
          ROCK TYPE REFERENCE TABLE
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={false} onToggle={() => {}} title="Different types of river rocks" />
      </div>

      {/* Info card */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate river rock volume and weight?
        </div>

        {/* Formula box */}
        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Area          = Length × Width",
            "Volume        = Area × Depth",
            "Volume needed = Volume × (1 + Wastage / 100)",
            "Weight needed = Volume needed × Rock density",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        {/* Rock density table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-muted)" }}>
                {["Rock type", "Bulk density (kg/m³)", "Bulk density (lb/ft³)"].map((h) => (
                  <th key={h} style={{
                    padding: "7px 12px", textAlign: "left", fontWeight: 700, fontSize: 11,
                    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em",
                    borderBottom: `1px solid ${BORDER}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROCK_TYPES.filter((r) => r.id !== "custom").map((r, i, arr) => (
                <tr key={r.id}
                  onClick={() => handleRockTypeChange(r.id)}
                  style={{
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                    background: rockTypeId === r.id ? "var(--accent-light)" : "transparent",
                    cursor: "pointer", transition: "background var(--transition)",
                  }}>
                  <td style={{ padding: "6px 12px", fontWeight: 700, color: rockTypeId === r.id ? "var(--accent)" : "var(--text-primary)" }}>
                    {r.label}
                  </td>
                  <td style={{ padding: "6px 12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {r.densityKgM3}
                  </td>
                  <td style={{ padding: "6px 12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {fmtRock(r.densityKgM3 / 16.0185, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: "12px 0 0 0" }}>
          Densities are <strong>bulk (loose fill)</strong> values — actual in-place density varies by rock size and compaction.
          Always over-order by at least <strong>5–10%</strong> to account for settling, waste, and uneven surfaces.
        </p>
      </div>

    </div>
  );
}
