import { useState, useMemo, useRef } from "react";
import {
  ROOF_TYPES, LENGTH_UNITS, AREA_OUT_UNITS, CURRENCIES,
  toLengthM, fromLengthM, fromM2,
  calcShedCost, fmtShed,
} from "../../../utils/shedCostCalc";
import { ShedFrontDiagram, ShedSideDiagram } from "./ShedDiagrams";

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
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={!isOutput ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : INPUT_BASE}
      />
      <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
        style={{
          ...SELECT_BASE,
          borderLeft: `1.5px solid ${borderColor}`,
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
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
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          minWidth: 65,
        }}>
        {CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      {!isOutput && units && (
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
              background: "var(--bg-muted)", color: "var(--text-primary)", minWidth: 65,
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
export default function DiyShedCostCalculatorTool() {

  // ── Shed details ────────────────────────────────────────────────
  const [roofType, setRoofType] = useState("slanted");
  const [w,     setW]     = useState("");
  const [wUnit, setWUnit] = useState("m");
  const [l,     setL]     = useState("");
  const [lUnit, setLUnit] = useState("m");
  const [h,     setH]     = useState("");
  const [hUnit, setHUnit] = useState("m");
  const [r,     setR]     = useState("");
  const [rUnit, setRUnit] = useState("m");
  const [o,     setO]     = useState("");
  const [oUnit, setOUnit] = useState("m");
  const [sUnit, setSUnit] = useState("m");

  // ── Output area units ─────────────────────────────────────────────
  const [floorUnit, setFloorUnit] = useState("m2");
  const [wallUnit,  setWallUnit]  = useState("m2");
  const [roofUnit,  setRoofUnit]  = useState("m2");

  // ── Cost inputs ───────────────────────────────────────────────────
  const [priceSlab,    setPriceSlab]    = useState("");
  const [priceSlabCur, setPriceSlabCur] = useState("USD");
  const [priceSlabUnit,setPriceSlabUnit]= useState("m2");
  const [priceWall,    setPriceWall]    = useState("");
  const [priceWallCur, setPriceWallCur] = useState("USD");
  const [priceWallUnit,setPriceWallUnit]= useState("m2");
  const [priceRoof,    setPriceRoof]    = useState("");
  const [priceRoofCur, setPriceRoofCur] = useState("USD");
  const [priceRoofUnit,setPriceRoofUnit]= useState("m2");
  const [costCur,      setCostCur]      = useState("USD");

  // ── Section open state ────────────────────────────────────────────
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [areasOpen,   setAreasOpen]   = useState(true);
  const [costOpen,    setCostOpen]    = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const roofSpec = useMemo(() => ROOF_TYPES.find((rt) => rt.id === roofType) || ROOF_TYPES[0], [roofType]);

  // ── Derive SI values ──────────────────────────────────────────────
  const wM = useMemo(() => toLengthM(w, wUnit), [w, wUnit]);
  const lM = useMemo(() => toLengthM(l, lUnit), [l, lUnit]);
  const hM = useMemo(() => toLengthM(h, hUnit), [h, hUnit]);
  const rM = useMemo(() => toLengthM(r, rUnit), [r, rUnit]);
  const oM = useMemo(() => {
    const v = parseFloat(o);
    return isFinite(v) && v >= 0 ? v * (LENGTH_UNITS.find((u) => u.id === oUnit)?.toM ?? 1) : null;
  }, [o, oUnit]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcShedCost({
    wM, lM, hM, rM, oM, roofType,
  }), [wM, lM, hM, rM, oM, roofType]);

  // ── Display values ────────────────────────────────────────────────
  const dispS         = result ? fmtShed(fromLengthM(result.rafterSpanM, sUnit), 4)  : "";
  const dispFloorArea = result ? fmtShed(fromM2(result.floorAreaM2, floorUnit), 4)    : "";
  const dispWallArea  = result ? fmtShed(fromM2(result.wallAreaM2, wallUnit), 4)      : "";
  const dispRoofArea  = result ? fmtShed(fromM2(result.roofAreaM2, roofUnit), 4)      : "";

  // ── Cost ──────────────────────────────────────────────────────────
  function areaInUnit(areaM2, unitId) {
    return fromM2(areaM2, unitId);
  }

  const costSlab = useMemo(() => {
    const p = parseFloat(priceSlab);
    if (!result || !isFinite(p) || p <= 0) return null;
    return areaInUnit(result.floorAreaM2, priceSlabUnit) * p;
  }, [priceSlab, priceSlabUnit, result]);

  const costWall = useMemo(() => {
    const p = parseFloat(priceWall);
    if (!result || !isFinite(p) || p <= 0) return null;
    return areaInUnit(result.wallAreaM2, priceWallUnit) * p;
  }, [priceWall, priceWallUnit, result]);

  const costRoof = useMemo(() => {
    const p = parseFloat(priceRoof);
    if (!result || !isFinite(p) || p <= 0) return null;
    return areaInUnit(result.roofAreaM2, priceRoofUnit) * p;
  }, [priceRoof, priceRoofUnit, result]);

  const totalCost = useMemo(() => {
    if (costSlab === null && costWall === null && costRoof === null) return null;
    return (costSlab ?? 0) + (costWall ?? 0) + (costRoof ?? 0);
  }, [costSlab, costWall, costRoof]);

  const dispCostSlab = costSlab !== null ? fmtShed(costSlab, 2) : "";
  const dispCostWall = costWall !== null ? fmtShed(costWall, 2) : "";
  const dispCostRoof = costRoof !== null ? fmtShed(costRoof, 2) : "";
  const dispTotalCost = totalCost !== null ? fmtShed(totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const wErr = touched.w && (w === "" || parseFloat(w) <= 0)
    ? "Please enter a positive shed width." : null;
  const lErr = touched.l && (l === "" || parseFloat(l) <= 0)
    ? "Please enter a positive shed length." : null;
  const hErr = touched.h && (h === "" || parseFloat(h) <= 0)
    ? "Please enter a positive wall height." : null;
  const rErr = roofSpec.hasRise && touched.r && (r === "" || parseFloat(r) <= 0)
    ? "Please enter a positive roof rise." : null;
  const oErr = touched.o && o !== "" && parseFloat(o) < 0
    ? "Overhang can't be negative." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setW(""); setL(""); setH(""); setR(""); setO("");
    setPriceSlab(""); setPriceWall(""); setPriceRoof("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setRoofType("slanted");
    setWUnit("m"); setLUnit("m"); setHUnit("m"); setRUnit("m"); setOUnit("m"); setSUnit("m");
    setFloorUnit("m2"); setWallUnit("m2"); setRoofUnit("m2");
    setPriceSlabCur("USD"); setPriceSlabUnit("m2");
    setPriceWallCur("USD"); setPriceWallUnit("m2");
    setPriceRoofCur("USD"); setPriceRoofUnit("m2");
    setCostCur("USD");
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
          SECTION 1 — Shed details
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)}
          title="Shed details" />
        {detailsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Roof type */}
            <Field label="Shed roof type"
              hint="The roof shape determines how wall area, rafter length, and roof area are calculated.">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 700, fontSize: 14,
                  }}
                >
                  {ROOF_TYPES.map((rt) => <option key={rt.id} value={rt.id}>{rt.label}</option>)}
                </select>
              </div>
            </Field>

            {/* Diagrams */}
            <div style={{
              display: "flex", gap: 10, background: "var(--bg-muted)",
              borderRadius: RADIUS, border: `1px solid ${BORDER}`, padding: "14px 10px",
            }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <ShedFrontDiagram roofType={roofType} />
                <span style={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)" }}>Front View</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <ShedSideDiagram roofType={roofType} />
                <span style={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)" }}>Side View</span>
              </div>
            </div>

            <Divider />

            {/* Width */}
            <Field label="Shed width (W)" error={wErr}>
              <CompoundField
                value={w} onChange={setW} onBlur={() => touch("w")}
                unit={wUnit} onUnitChange={setWUnit} units={LENGTH_UNITS}
                placeholder="e.g. 1.5" hasError={!!wErr}
              />
            </Field>

            <Divider />

            {/* Length */}
            <Field label="Shed length (L)" error={lErr}>
              <CompoundField
                value={l} onChange={setL} onBlur={() => touch("l")}
                unit={lUnit} onUnitChange={setLUnit} units={LENGTH_UNITS}
                placeholder="e.g. 2" hasError={!!lErr}
              />
            </Field>

            <Divider />

            {/* Wall height */}
            <Field label="Wall height (H)" error={hErr}>
              <CompoundField
                value={h} onChange={setH} onBlur={() => touch("h")}
                unit={hUnit} onUnitChange={setHUnit} units={LENGTH_UNITS}
                placeholder="e.g. 2.4" hasError={!!hErr}
              />
            </Field>

            {roofSpec.hasRise && (
              <>
                <Divider />
                {/* Roof rise */}
                <Field label="Roof rise (R)"
                  hint="Height the roof peak rises above the wall top. Not used for flat roofs."
                  error={rErr}>
                  <CompoundField
                    value={r} onChange={setR} onBlur={() => touch("r")}
                    unit={rUnit} onUnitChange={setRUnit} units={LENGTH_UNITS}
                    placeholder="e.g. 0.6" hasError={!!rErr}
                  />
                </Field>
              </>
            )}

            <Divider />

            {/* Overhang */}
            <Field label="Overhang (O)"
              hint="How far the roof extends past the walls on each side."
              error={oErr}>
              <CompoundField
                value={o} onChange={setO} onBlur={() => touch("o")}
                unit={oUnit} onUnitChange={setOUnit} units={LENGTH_UNITS}
                placeholder="e.g. 0.4" hasError={!!oErr}
              />
            </Field>

            <Divider />

            {/* Rafter length — output */}
            <Field label="Rafter length (S)"
              hint="The length of each roof rafter, computed from the width, rise, and overhang."
              note={result === null ? "Enter the shed dimensions above to compute rafter length." : undefined}>
              <CompoundField
                value={dispS}
                unit={sUnit} onUnitChange={setSUnit} units={LENGTH_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Output areas
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={areasOpen} onToggle={() => setAreasOpen(!areasOpen)}
          title="Output areas" />
        {areasOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Floor area"
              hint="Floor area = Shed width × Shed length."
              note={result === null ? "Enter width and length above to compute floor area." : undefined}>
              <CompoundField
                value={dispFloorArea}
                unit={floorUnit} onUnitChange={setFloorUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            <Field label="Wall area"
              hint="Total wall area, including the triangular gable ends for slanted/gable roofs.">
              <CompoundField
                value={dispWallArea}
                unit={wallUnit} onUnitChange={setWallUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            <Field label="Roof area"
              hint="Total roofing material area, including overhang on all sides.">
              <CompoundField
                value={dispRoofArea}
                unit={roofUnit} onUnitChange={setRoofUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Cost of materials
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="Cost of materials" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Price per area of slab or foundation">
              <PriceRow
                value={priceSlab} onChange={setPriceSlab}
                currency={priceSlabCur} onCurrencyChange={(c) => { setPriceSlabCur(c); setCostCur(c); }}
                unit={priceSlabUnit} onUnitChange={setPriceSlabUnit} units={AREA_OUT_UNITS}
              />
            </Field>

            <Divider />

            <Field label="Cost of slab or foundation"
              note={dispCostSlab === "" ? "Enter a price above to calculate." : undefined}>
              <PriceRow value={dispCostSlab} currency={priceSlabCur} onCurrencyChange={() => {}} isOutput />
            </Field>

            <Divider />

            <Field label="Price per area of wall">
              <PriceRow
                value={priceWall} onChange={setPriceWall}
                currency={priceWallCur} onCurrencyChange={(c) => { setPriceWallCur(c); setCostCur(c); }}
                unit={priceWallUnit} onUnitChange={setPriceWallUnit} units={AREA_OUT_UNITS}
              />
            </Field>

            <Divider />

            <Field label="Cost of wall"
              note={dispCostWall === "" ? "Enter a price above to calculate." : undefined}>
              <PriceRow value={dispCostWall} currency={priceWallCur} onCurrencyChange={() => {}} isOutput />
            </Field>

            <Divider />

            <Field label="Price per area of the roofing">
              <PriceRow
                value={priceRoof} onChange={setPriceRoof}
                currency={priceRoofCur} onCurrencyChange={(c) => { setPriceRoofCur(c); setCostCur(c); }}
                unit={priceRoofUnit} onUnitChange={setPriceRoofUnit} units={AREA_OUT_UNITS}
              />
            </Field>

            <Divider />

            <Field label="Cost of roofing"
              note={dispCostRoof === "" ? "Enter a price above to calculate." : undefined}>
              <PriceRow value={dispCostRoof} currency={priceRoofCur} onCurrencyChange={() => {}} isOutput />
            </Field>

            <Divider />

            <Field label="Total cost of shed"
              hint="Sum of the slab/foundation, wall, and roofing costs."
              note={dispTotalCost === "" ? "Enter dimensions and at least one price above to calculate." : undefined}>
              <PriceRow value={dispTotalCost} currency={costCur} onCurrencyChange={setCostCur} isOutput />
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
          INFO CARD — How is shed cost calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate DIY shed cost?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Floor area = W × L",
            "Wall area  = 2×(L+W)×H + (W×R×c)",
            "Rafter (S) = √[(W+2O)² + (c×R×t×(1+2O/W))²] / t",
            "Roof area  = S × t × (L+2O)",
            "Total cost = (Floor×Pf) + (Wall×Pw) + (Roof×Pr)",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          <strong>c</strong> is 1 for slanted and gable roofs (adds the triangular gable-end wall area and roof
          rise), and 0 for flat roofs. <strong>t</strong> is 2 for gable roofs (two roof slopes) and 1 for
          slanted/flat roofs. The <strong>overhang (O)</strong> extends the roof past the walls on every side at
          the same pitch, and is included in both the rafter length and roof area calculations.
        </p>
      </div>

    </div>
  );
}
