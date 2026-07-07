import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, DEPTH_UNITS,
  AREA_OUT_UNITS, VOLUME_OUT_UNITS, WEIGHT_OUT_UNITS, DENSITY_UNITS, CURRENCIES,
  DEFAULT_DENSITY_KGM3,
  toLengthM, toDepthM, toDensityKgM3,
  fromM2, fromM3, fromKgSand,
  calcSand, fmtSand,
} from "../../../utils/sandCalc";

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
          backgroundColor: isOutput ? "#eff6ff" : "var(--bg-muted)",
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
              backgroundColor: "var(--bg-muted)", color: "var(--text-primary)", minWidth: 70,
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
export default function SandCalculatorTool() {

  // ── Coverage inputs ───────────────────────────────────────────────
  const [length,      setLength]      = useState("");
  const [lenUnit,     setLenUnit]     = useState("m");
  const [width,       setWidth]       = useState("");
  const [widUnit,     setWidUnit]     = useState("m");
  const [areaOutUnit, setAreaOutUnit] = useState("m2");
  const [depth,       setDepth]       = useState("");
  const [depUnit,     setDepUnit]     = useState("cm");
  const [volNeedUnit, setVolNeedUnit] = useState("m3");

  // ── Density ────────────────────────────────────────────────────────
  const [densityStr,  setDensityStr]  = useState(String(DEFAULT_DENSITY_KGM3));
  const [densityUnit, setDensityUnit] = useState("kg/m3");
  const [wgtUnit,      setWgtUnit]    = useState("t");

  // ── Cost inputs ───────────────────────────────────────────────────
  const [priceMass,     setPriceMass]     = useState("");
  const [priceMassCur,  setPriceMassCur]  = useState("PKR");
  const [priceMassUnit, setPriceMassUnit] = useState("t");
  const [priceVol,      setPriceVol]      = useState("");
  const [priceVolCur,   setPriceVolCur]   = useState("PKR");
  const [priceVolUnit,  setPriceVolUnit]  = useState("m3");
  const [costCur,       setCostCur]       = useState("PKR");

  // ── Section open state ────────────────────────────────────────────
  const [needOpen, setNeedOpen] = useState(true);
  const [costOpen, setCostOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  // ── Derive SI values ──────────────────────────────────────────────
  const lengthM     = useMemo(() => toLengthM(length, lenUnit), [length, lenUnit]);
  const widthM      = useMemo(() => toLengthM(width, widUnit),  [width, widUnit]);
  const depthM      = useMemo(() => toDepthM(depth, depUnit),   [depth, depUnit]);
  const densityKgM3 = useMemo(() => toDensityKgM3(densityStr, densityUnit), [densityStr, densityUnit]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcSand({
    lengthM, widthM, depthM, densityKgM3,
  }), [lengthM, widthM, depthM, densityKgM3]);

  // ── Display values ────────────────────────────────────────────────
  const dispArea    = result ? fmtSand(fromM2(result.areaM2, areaOutUnit), 4)          : "";
  const dispVolNeed = result ? fmtSand(fromM3(result.volumeNeededM3, volNeedUnit), 4)  : "";
  const dispWgt     = result?.weightNeededKg != null
    ? fmtSand(fromKgSand(result.weightNeededKg, wgtUnit), 3) : "";

  // ── Total cost ────────────────────────────────────────────────────
  const totalCost = useMemo(() => {
    const pm = parseFloat(priceMass);
    if (isFinite(pm) && pm > 0 && result?.weightNeededKg != null) {
      const wInUnit = fromKgSand(result.weightNeededKg, priceMassUnit);
      return wInUnit * pm;
    }
    const pv = parseFloat(priceVol);
    if (isFinite(pv) && pv > 0 && result?.volumeNeededM3 != null) {
      const vInUnit = fromM3(result.volumeNeededM3, priceVolUnit);
      return vInUnit * pv;
    }
    return null;
  }, [priceMass, priceMassUnit, priceVol, priceVolUnit, result]);

  const dispCost = totalCost !== null ? fmtSand(totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const lenErr = touched.len && (length === "" || parseFloat(length) <= 0)
    ? "Please enter a positive value for the length." : null;
  const widErr = touched.wid && (width === "" || parseFloat(width) <= 0)
    ? "Please enter a positive value for the width." : null;
  const depErr = touched.dep && (depth === "" || parseFloat(depth) <= 0)
    ? "Please enter a positive value for the depth." : null;
  const denErr = touched.den && (densityStr === "" || parseFloat(densityStr) <= 0)
    ? "Please enter a positive density value." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setLength(""); setWidth(""); setDepth("");
    setDensityStr(String(DEFAULT_DENSITY_KGM3));
    setPriceMass(""); setPriceVol("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setDensityUnit("kg/m3");
    setLenUnit("m"); setWidUnit("m"); setDepUnit("cm");
    setAreaOutUnit("m2"); setVolNeedUnit("m3"); setWgtUnit("t");
    setPriceMassCur("PKR"); setPriceMassUnit("t");
    setPriceVolCur("PKR"); setPriceVolUnit("m3"); setCostCur("PKR");
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
          SECTION 1 — How much sand do you need?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={needOpen} onToggle={() => setNeedOpen(!needOpen)}
          title="How much sand do you need?" />
        {needOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Length */}
            <Field label="Length"
              hint="Length of the area to cover with sand."
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
              hint="Computed as Length × Width."
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
              hint="Thickness of the sand layer."
              error={depErr}>
              <CompoundField
                value={depth} onChange={setDepth} onBlur={() => touch("dep")}
                unit={depUnit} onUnitChange={setDepUnit} units={DEPTH_UNITS}
                placeholder="e.g. 10" hasError={!!depErr}
              />
            </Field>

            <Divider />

            {/* Volume needed — output */}
            <Field label="Volume needed"
              hint="Volume needed = Area × Depth."
              note={result === null ? "Enter length, width, and depth to compute volume." : undefined}>
              <CompoundField
                value={dispVolNeed}
                unit={volNeedUnit} onUnitChange={setVolNeedUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Density */}
            <Field label="Density"
              hint="Bulk density of the sand. Prefilled with a typical dry-sand value — edit it for wet sand or a different material."
              error={denErr}>
              <CompoundField
                value={densityStr} onChange={setDensityStr} onBlur={() => touch("den")}
                unit={densityUnit} onUnitChange={setDensityUnit} units={DENSITY_UNITS}
                placeholder="e.g. 1602" hasError={!!denErr}
              />
            </Field>

            <Divider />

            {/* Weight needed — output */}
            <Field label="Weight needed"
              hint="Weight needed = Volume needed × Density."
              note={result !== null && result.weightNeededKg == null
                ? "Enter a density above to compute weight." : undefined}>
              <CompoundField
                value={dispWgt}
                unit={wgtUnit} onUnitChange={setWgtUnit} units={WEIGHT_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Sand cost
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="Sand cost" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Price per weight */}
            <Field label="Price per weight"
              hint="Cost per unit of weight (e.g. price per tonne). Used to compute total cost from weight needed.">
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

            {/* Price per volume */}
            <Field label="Price per volume"
              hint="Cost per unit of volume (e.g. price per m³). Used if price per weight is not set.">
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
              hint="Total cost = Weight needed × Price per weight (preferred), or Volume needed × Price per volume."
              note={dispCost === "" ? "Enter dimensions and a price above to calculate cost." : undefined}>
              <div style={{
                display: "flex", alignItems: "stretch",
                border: "1.5px solid #bfdbfe", borderRadius: RADIUS, overflow: "hidden",
              }}>
                <input readOnly type="text" value={dispCost} placeholder="—" style={OUTPUT_BASE} />
                <select value={costCur} onChange={(e) => setCostCur(e.target.value)}
                  style={{
                    ...SELECT_BASE, borderLeft: "1.5px solid #bfdbfe",
                    backgroundColor: "#eff6ff", color: "#1d4ed8", minWidth: 65,
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
          INFO CARD — How is sand calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={infoOpen} onToggle={() => setInfoOpen(!infoOpen)}
          title="How do we calculate sand volume and weight?" />
        {infoOpen && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{
              background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
              borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
            }}>
              {[
                "Area          = Length × Width",
                "Volume needed = Area × Depth",
                "Weight needed = Volume needed × Density",
                "Total cost    = Weight needed × Price per weight, or Volume needed × Price per volume",
              ].map((l) => (
                <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
              ))}
            </div>

            <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
              The default density (<strong>{fmtSand(DEFAULT_DENSITY_KGM3, 3)} kg/m³</strong>) is a typical value for
              dry sand — actual density varies by sand type and moisture content. <strong>Wet sand is heavier</strong> than
              dry sand of the same volume, since water fills the spaces between grains, so increase the density if your
              sand is damp or wet. A standard sand bag typically holds <strong>30–40 kg (66–88 lb)</strong>.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
