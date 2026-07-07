import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, VOLUME_OUT_UNITS, WEIGHT_OUT_UNITS, DENSITY_UNITS, CURRENCIES,
  SONOTUBE_SIZES, BAG_SIZES, MIX_RATIOS, MATERIAL_UNITS,
  DEFAULT_DENSITY_KGM3, DEFAULT_WASTE_PCT,
  CEMENT_DENSITY_KGM3, SAND_DENSITY_KGM3, GRAVEL_DENSITY_KGM3,
  toLengthM, toDensityKgM3, fromM3, fromKgSonotube, fromM3ToMaterialUnit,
  calcSonotube, fmtSonotube,
} from "../../../utils/sonotubeCalc";

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
// When `unit` is "ft_in" or "m_cm" and compA/compB handlers are supplied,
// the single value input is replaced by two sub-inputs (e.g. 5 ft + 6 in).
function CompoundField({
  value, onChange, onBlur,
  unit, onUnitChange, units,
  placeholder = "0",
  hasError = false,
  isOutput = false,
  unitLabel = null,
  compA, onCompAChange, compB, onCompBChange,
}) {
  const isCompoundUnit = unit === "ft_in" || unit === "m_cm";
  const isCompound = isCompoundUnit && onCompAChange && onCompBChange;
  const [subLabelA, subLabelB] = unit === "ft_in" ? ["ft", "in"] : ["m", "cm"];
  const borderColor = isOutput ? "#bfdbfe" : hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      {isCompound ? (
        <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
          <input
            type="number" inputMode="decimal" step="any" min="0"
            value={compA} placeholder="0"
            onChange={(e) => onCompAChange(e.target.value)}
            onBlur={onBlur}
            style={{ ...INPUT_BASE, flex: 1, minWidth: 0 }}
          />
          <span style={{
            display: "flex", alignItems: "center", padding: "0 8px",
            background: "var(--bg-muted)", color: "var(--text-muted)",
            fontFamily: FONT, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
          }}>{subLabelA}</span>
          <input
            type="number" inputMode="decimal" step="any" min="0"
            value={compB} placeholder="0"
            onChange={(e) => onCompBChange(e.target.value)}
            onBlur={onBlur}
            style={{ ...INPUT_BASE, flex: 1, minWidth: 0, borderLeft: `1.5px solid ${borderColor}` }}
          />
          <span style={{
            display: "flex", alignItems: "center", padding: "0 8px",
            background: "var(--bg-muted)", color: "var(--text-muted)",
            fontFamily: FONT, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
          }}>{subLabelB}</span>
        </div>
      ) : (
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
      )}
      {unitLabel ? (
        <span style={{
          display: "flex", alignItems: "center",
          borderLeft: `1.5px solid ${borderColor}`,
          padding: "0 13px",
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-muted)",
          fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
        }}>{unitLabel}</span>
      ) : (
        <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
          style={{
            ...SELECT_BASE,
            borderLeft: `1.5px solid ${borderColor}`,
            backgroundColor: isOutput ? "#eff6ff" : "var(--bg-muted)",
            color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          }}>
          {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Plain select in a bordered box (for shape/type/size dropdowns) ─
function PlainSelect({ value, onChange, options, placeholder }) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...SELECT_BASE,
          width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
          backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
          fontFamily: FONT, fontWeight: 600, fontSize: 14,
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
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

// ── Radio option row ───────────────────────────────────────────────
function RadioRow({ name, value, selected, onSelect, label }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      padding: "9px 13px", borderRadius: RADIUS,
      background: selected ? "var(--accent-light)" : "var(--bg-muted)",
      border: `1.5px solid ${selected ? "var(--accent)" : BORDER}`,
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <input
        type="radio" name={name} value={value} checked={selected}
        onChange={onSelect}
        style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
      />
      <span style={{
        fontFamily: FONT, fontWeight: selected ? 700 : 500,
        fontSize: 13, color: selected ? "var(--accent)" : "var(--text-primary)",
      }}>
        {label}
      </span>
    </label>
  );
}

// ── Price row: [number input] [currency] / [unit] ─────────────────
function PriceRow({ value, onChange, currency, onCurrencyChange, suffix, isOutput, placeholder = "0.00" }) {
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
      {suffix && !isOutput && (
        <span style={{
          display: "flex", alignItems: "center", padding: "0 12px",
          background: "var(--bg-muted)", color: "var(--text-muted)",
          fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
          borderLeft: `1.5px solid ${BORDER}`,
        }}>{suffix}</span>
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
export default function SonotubeCalculatorTool() {

  // ── Requirements ───────────────────────────────────────────────────
  const [sizeId,   setSizeId]   = useState("12in");
  const [height,   setHeight]   = useState("");
  const [heiUnit,  setHeiUnit]  = useState("m");
  const [heiCompA, setHeiCompA] = useState(""); // ft or m (compound units)
  const [heiCompB, setHeiCompB] = useState(""); // in or cm (compound units)
  const [quantity, setQuantity] = useState("1");
  const [volUnit,  setVolUnit]  = useState("m3");

  // ── Concrete mix ───────────────────────────────────────────────────
  const [mixMode, setMixMode] = useState("premixed"); // "premixed" | "own"

  // Pre-mixed bags
  const [densityStr,  setDensityStr]  = useState(String(DEFAULT_DENSITY_KGM3));
  const [densityUnit, setDensityUnit] = useState("kg/m3");
  const [wgtUnit,      setWgtUnit]    = useState("kg");
  const [bagSizeId,    setBagSizeId]  = useState("25kg");
  const [customBagKg,  setCustomBagKg]= useState("");
  const [waste,        setWaste]      = useState(String(DEFAULT_WASTE_PCT));

  // Mix my own
  const [ratioId,        setRatioId]        = useState("1:5:10");
  const [totalVolUnit, setTotalVolUnit] = useState("m3");
  const [cementUnit,   setCementUnit]   = useState("m3");
  const [sandUnit,     setSandUnit]     = useState("m3");
  const [gravelUnit,   setGravelUnit]   = useState("m3");

  // ── Cost ────────────────────────────────────────────────────────────
  const [pricePerBag, setPricePerBag] = useState("");
  const [priceCur,    setPriceCur]    = useState("PKR");
  const [costCur,     setCostCur]     = useState("PKR");

  // ── Section open state ────────────────────────────────────────────
  const [reqOpen,  setReqOpen]  = useState(true);
  const [mixOpen,  setMixOpen]  = useState(true);
  const [costOpen, setCostOpen] = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const size = useMemo(() => SONOTUBE_SIZES.find((s) => s.id === sizeId), [sizeId]);
  const isPremixed = mixMode === "premixed";
  const bagSize = useMemo(() => BAG_SIZES.find((b) => b.id === bagSizeId), [bagSizeId]);
  const isCustomBag = bagSizeId === "custom";
  const ratio = useMemo(() => MIX_RATIOS.find((r) => r.id === ratioId), [ratioId]);

  // ── Derive SI values ──────────────────────────────────────────────
  const diameterM = size?.diameterM ?? null;
  const heightM   = useMemo(() => toLengthM(height, heiUnit, heiCompA, heiCompB),
    [height, heiUnit, heiCompA, heiCompB]);
  const qtyNum    = useMemo(() => {
    const v = parseFloat(quantity);
    return isFinite(v) && v > 0 ? v : null;
  }, [quantity]);

  const densityKgM3 = useMemo(() => toDensityKgM3(densityStr, densityUnit), [densityStr, densityUnit]);

  const bagSizeKg = useMemo(() => {
    if (isCustomBag) { const v = parseFloat(customBagKg); return isFinite(v) && v > 0 ? v : null; }
    return bagSize?.kg ?? null;
  }, [isCustomBag, customBagKg, bagSize]);

  const wastePct = useMemo(() => {
    const v = parseFloat(waste);
    return isFinite(v) && v >= 0 ? v : 0;
  }, [waste]);

  const effectiveRatio = ratio;

  const pricePerBagNum = useMemo(() => {
    const v = parseFloat(pricePerBag);
    return isFinite(v) && v > 0 ? v : null;
  }, [pricePerBag]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcSonotube({
    diameterM, heightM, quantity: qtyNum, densityKgM3, bagSizeKg, wastePct, mixRatio: effectiveRatio,
  }), [diameterM, heightM, qtyNum, densityKgM3, bagSizeKg, wastePct, effectiveRatio]);

  // ── Display values ────────────────────────────────────────────────
  const dispVol    = result ? fmtSonotube(fromM3(result.volumeM3, volUnit), 4) : "";
  const dispWgt    = result?.weightKg != null ? fmtSonotube(fromKgSonotube(result.weightKg, wgtUnit), 2) : "";
  const dispBags   = result?.bagsNeeded != null ? String(result.bagsNeeded) : "";
  const dispTotalVol = result?.totalVolumeM3 != null ? fmtSonotube(fromM3(result.totalVolumeM3, totalVolUnit), 4) : "";
  const dispCement = result?.cementVolumeM3 != null
    ? fmtSonotube(fromM3ToMaterialUnit(result.cementVolumeM3, cementUnit, CEMENT_DENSITY_KGM3), 3) : "";
  const dispSand = result?.sandVolumeM3 != null
    ? fmtSonotube(fromM3ToMaterialUnit(result.sandVolumeM3, sandUnit, SAND_DENSITY_KGM3), 3) : "";
  const dispGravel = result?.gravelVolumeM3 != null
    ? fmtSonotube(fromM3ToMaterialUnit(result.gravelVolumeM3, gravelUnit, GRAVEL_DENSITY_KGM3), 3) : "";

  // ── Total cost ────────────────────────────────────────────────────
  const totalCost = useMemo(() => {
    if (isPremixed && result?.bagsNeeded != null && pricePerBagNum != null) {
      return result.bagsNeeded * pricePerBagNum;
    }
    if (!isPremixed && result?.volumeM3 != null && pricePerBagNum != null) {
      return result.volumeM3 * pricePerBagNum;
    }
    return null;
  }, [isPremixed, result, pricePerBagNum]);
  const dispCost = totalCost !== null ? fmtSonotube(totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const heiErr = touched.hei && heightM == null
    ? "Please enter a positive value for the height." : null;
  const qtyErr = touched.qty && (quantity === "" || parseFloat(quantity) <= 0)
    ? "Please enter a positive quantity." : null;
  const denErr = touched.den && (densityStr === "" || parseFloat(densityStr) <= 0)
    ? "Please enter a positive density value." : null;
  const bagErr = isCustomBag && touched.bag && (customBagKg === "" || parseFloat(customBagKg) <= 0)
    ? "Please enter a positive bag size." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setHeight(""); setHeiCompA(""); setHeiCompB(""); setQuantity("1");
    setDensityStr(String(DEFAULT_DENSITY_KGM3)); setWaste(String(DEFAULT_WASTE_PCT));
    setCustomBagKg("");
    setPricePerBag("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setSizeId("12in"); setHeiUnit("m"); setVolUnit("m3");
    setMixMode("premixed");
    setDensityUnit("kg/m3"); setWgtUnit("kg"); setBagSizeId("25kg");
    setRatioId("1:5:10"); setTotalVolUnit("m3");
    setCementUnit("m3"); setSandUnit("m3"); setGravelUnit("m3");
    setPriceCur("PKR"); setCostCur("PKR");
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
          SECTION 1 — Requirements
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={reqOpen} onToggle={() => setReqOpen(!reqOpen)} title="Requirements" />
        {reqOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Sonotube® size" hint="Nominal inside diameter of the concrete form tube.">
              <PlainSelect value={sizeId} onChange={setSizeId} options={SONOTUBE_SIZES} />
            </Field>

            <Divider />

            <Field label="Height" error={heiErr}>
              <CompoundField
                value={height} onChange={setHeight} onBlur={() => touch("hei")}
                unit={heiUnit} onUnitChange={setHeiUnit} units={LENGTH_UNITS}
                placeholder="e.g. 1.2" hasError={!!heiErr}
                compA={heiCompA} onCompAChange={setHeiCompA}
                compB={heiCompB} onCompBChange={setHeiCompB}
              />
            </Field>

            <Divider />

            <Field label="Quantity" error={qtyErr}>
              <CompoundField
                value={quantity} onChange={setQuantity} onBlur={() => touch("qty")}
                placeholder="1" hasError={!!qtyErr} unitLabel="pieces"
              />
            </Field>

            <Divider />

            <Field label="Volume"
              hint="Volume = π × (diameter ÷ 2)² × Height × Quantity."
              note={result === null ? "Enter the height and quantity above to compute volume." : undefined}>
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
          SECTION 2 — Concrete materials needed
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={mixOpen} onToggle={() => setMixOpen(!mixOpen)} title="Concrete materials needed" />
        {mixOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Concrete mix">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <RadioRow name="mix-mode" value="premixed" selected={isPremixed}
                  onSelect={() => setMixMode("premixed")} label="I'll get pre-mixed concrete bags" />
                <RadioRow name="mix-mode" value="own" selected={!isPremixed}
                  onSelect={() => setMixMode("own")} label="I'll mix my own concrete" />
              </div>
            </Field>

            <Divider />

            {isPremixed ? (
              <>
                <Field label="Concrete density" hint="Bulk density of mixed concrete. 2,400 kg/m³ is a typical value." error={denErr}>
                  <CompoundField
                    value={densityStr} onChange={setDensityStr} onBlur={() => touch("den")}
                    unit={densityUnit} onUnitChange={setDensityUnit} units={DENSITY_UNITS}
                    placeholder="e.g. 2400" hasError={!!denErr}
                  />
                </Field>

                <Divider />

                <Field label="Weight"
                  hint="Weight = Volume × Concrete density."
                  note={result?.weightKg == null ? "Enter the dimensions above to compute weight." : undefined}>
                  <CompoundField
                    value={dispWgt}
                    unit={wgtUnit} onUnitChange={setWgtUnit} units={WEIGHT_OUT_UNITS}
                    placeholder="—" isOutput
                  />
                </Field>

                <Divider />

                <Field label="Bag size">
                  <PlainSelect value={bagSizeId} onChange={setBagSizeId} options={BAG_SIZES} />
                </Field>

                {isCustomBag && (
                  <Field label="Custom bag size (kg)" error={bagErr}>
                    <CompoundField
                      value={customBagKg} onChange={setCustomBagKg} onBlur={() => touch("bag")}
                      unitLabel="kg" placeholder="e.g. 25" hasError={!!bagErr}
                    />
                  </Field>
                )}

                <Divider />

                <Field label="Waste" hint="Extra concrete to cover spillage and mixing losses. Typical: 5%.">
                  <CompoundField value={waste} onChange={setWaste} unitLabel="%" placeholder="5" />
                </Field>

                <Divider />

                <Field label="Bags needed"
                  hint="Bags needed = ⌈Weight ÷ Bag size⌉."
                  note={result?.bagsNeeded == null ? "Enter a density and bag size above to compute this." : undefined}>
                  <CompoundField value={dispBags} placeholder="—" isOutput unitLabel="bags" />
                </Field>
              </>
            ) : (
              <>
                <Field label="Concrete mix ratio" hint="Cement : Sand : Gravel, by volume.">
                  <PlainSelect value={ratioId} onChange={setRatioId} options={MIX_RATIOS} placeholder="Select" />
                </Field>

                <Divider />

                <Field label="Waste" hint="Extra concrete to cover spillage and mixing losses. Typical: 5%.">
                  <CompoundField value={waste} onChange={setWaste} unitLabel="%" placeholder="5" />
                </Field>

                <Divider />

                <Field label="Total volume"
                  hint="Total volume = Volume × (1 + Waste ÷ 100)."
                  note={result?.totalVolumeM3 == null ? "Enter the dimensions and mix ratio above to compute this." : undefined}>
                  <CompoundField
                    value={dispTotalVol}
                    unit={totalVolUnit} onUnitChange={setTotalVolUnit} units={VOLUME_OUT_UNITS}
                    placeholder="—" isOutput
                  />
                </Field>

                <Divider />

                <Field label="Cement"
                  hint="Total volume split by the mix ratio. Weight uses a bulk density of 1,440 kg/m³."
                  note={result?.cementVolumeM3 == null ? "Enter the dimensions and mix ratio above to compute this." : undefined}>
                  <CompoundField
                    value={dispCement}
                    unit={cementUnit} onUnitChange={setCementUnit} units={MATERIAL_UNITS}
                    placeholder="—" isOutput
                  />
                </Field>

                <Divider />

                <Field label="Sand"
                  hint="Weight uses a bulk density of 1,600 kg/m³."
                  note={result?.sandVolumeM3 == null ? "Enter the dimensions and mix ratio above to compute this." : undefined}>
                  <CompoundField
                    value={dispSand}
                    unit={sandUnit} onUnitChange={setSandUnit} units={MATERIAL_UNITS}
                    placeholder="—" isOutput
                  />
                </Field>

                <Divider />

                <Field label="Gravel"
                  hint="Weight uses a bulk density of 1,600 kg/m³."
                  note={result?.gravelVolumeM3 == null ? "Enter the dimensions and mix ratio above to compute this." : undefined}>
                  <CompoundField
                    value={dispGravel}
                    unit={gravelUnit} onUnitChange={setGravelUnit} units={MATERIAL_UNITS}
                    placeholder="—" isOutput
                  />
                </Field>
              </>
            )}

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Material costs
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)} title="Material costs" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label={isPremixed ? "Price per bag" : "Price per m³ of concrete"}>
              <PriceRow
                value={pricePerBag}
                onChange={setPricePerBag}
                currency={priceCur}
                onCurrencyChange={(c) => { setPriceCur(c); setCostCur(c); }}
                suffix={isPremixed ? "/bag" : "/m³"}
              />
            </Field>

            <Divider />

            <Field label="Total cost"
              hint={isPremixed ? "Total cost = Bags needed × Price per bag." : "Total cost = Volume × Price per m³."}
              note={dispCost === "" ? "Enter a price above to calculate." : undefined}>
              <PriceRow
                value={dispCost}
                currency={costCur}
                onCurrencyChange={setCostCur}
                isOutput
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
          INFO CARD — How is sonotube concrete calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate sonotube concrete?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Volume       = π × (Diameter ÷ 2)² × Height × Quantity",
            "Weight       = Volume × Concrete density",
            "Bags needed  = ⌈Weight ÷ Bag size⌉",
            "Total volume = Volume × (1 + Waste ÷ 100)",
            "Cement/Sand/Gravel volume = Total volume × (their ratio part ÷ total parts)",
            "Weight (any material) = Volume × Bulk density",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          A <strong>sonotube</strong> is a cylindrical cardboard form used to pour concrete piers and footings.
          Choose <strong>pre-mixed bags</strong> if you're buying ready-mix bags of concrete, or{" "}
          <strong>mix my own concrete</strong> to get the cement, sand, and gravel needed for a site mix — the{" "}
          <strong>total volume</strong> (volume plus waste) is split across the three materials using the selected
          mix ratio. Each material's volume is calculated first, then converted to weight using its bulk density
          (cement 1,440 kg/m³, sand and gravel 1,600 kg/m³) — so you can view <strong>Cement, Sand, and
          Gravel</strong> as either a volume or a weight, and the two will always match.
        </p>
      </div>

    </div>
  );
}
