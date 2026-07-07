import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, LONG_LENGTH_UNITS, VOLUME_OUT_UNITS, AREA_OUT_UNITS,
  WEIGHT_OUT_UNITS, DENSITY_UNITS, CURRENCIES,
  FABRIC_MODES, PIPE_TYPES, PIPE_SIZES_SCH40, PIPE_SIZES_SDR35, STANDARD_PIPE_LENGTHS,
  DEFAULT_WASTE_PCT, DEFAULT_GRAVEL_DENSITY_KGM3, MIN_FABRIC_OVERLAP_M,
  toLengthM, fromLengthM, toDensityKgM3, fromM3, fromM2, fromKgDrain, insideDiameterMm,
  minPipeSlopeInPerFt, calcFrenchDrain, fmtDrain,
} from "../../../utils/frenchDrainCalc";
import FrenchDrainDiagram from "./FrenchDrainDiagram";

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
  disabled = false,
}) {
  const borderColor = hasError ? "var(--error)" : isOutput ? "#bfdbfe" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
      opacity: disabled ? 0.55 : 1,
    }}>
      <input
        type={isOutput ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={isOutput || disabled}
        placeholder={placeholder}
        onChange={onChange && !isOutput && !disabled ? (e) => onChange(e.target.value) : undefined}
        onBlur={!isOutput ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : INPUT_BASE}
      />
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
        <select value={unit} onChange={(e) => onUnitChange(e.target.value)} disabled={disabled}
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

// ── Plain select in a bordered box ─────────────────────────────────
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
  const errors = Array.isArray(error) ? error.filter(Boolean) : error ? [error] : [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={LABEL_STYLE}>{label}</span>
        {hint && <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
      </div>
      {children}
      {errors.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
          <span style={{ color: "var(--error)", fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--error)", fontWeight: 500, lineHeight: 1.4 }}>{e}</span>
        </div>
      ))}
      {note && errors.length === 0 && (
        <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>{note}</span>
      )}
    </div>
  );
}

// ── Radio option row ───────────────────────────────────────────────
function RadioRow({ name, selected, onSelect, label }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      padding: "9px 13px", borderRadius: RADIUS,
      background: selected ? "var(--accent-light)" : "var(--bg-muted)",
      border: `1.5px solid ${selected ? "var(--accent)" : BORDER}`,
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <input
        type="radio" name={name} checked={selected}
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

// ── Checkbox row ───────────────────────────────────────────────────
function CheckboxRow({ checked, onToggle, label }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 9, cursor: "pointer",
      padding: "9px 13px", borderRadius: RADIUS,
      background: checked ? "var(--accent-light)" : "var(--bg-muted)",
      border: `1.5px solid ${checked ? "var(--accent)" : BORDER}`,
      transition: "all 0.15s",
    }}>
      <input
        type="checkbox" checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
      />
      <span style={{
        fontFamily: FONT, fontWeight: checked ? 700 : 500, fontSize: 13,
        color: checked ? "var(--accent)" : "var(--text-primary)",
      }}>
        {label}
      </span>
    </label>
  );
}

// ── Price row: [number input] [currency] / [suffix] ────────────────
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
export default function FrenchDrainCalculatorTool() {

  // ── French drain details ──────────────────────────────────────────
  const [usePipe, setUsePipe] = useState(true);
  const [fabricMode, setFabricMode] = useState("no");
  const [width,     setWidth]     = useState("");
  const [widthUnit, setWidthUnit] = useState("cm");
  const [depth,     setDepth]     = useState("");
  const [depthUnit, setDepthUnit] = useState("cm");
  const [overlap,     setOverlap]     = useState("");
  const [overlapUnit, setOverlapUnit] = useState("cm");
  const [trenchLen,     setTrenchLen]     = useState("");
  const [trenchLenUnit, setTrenchLenUnit] = useState("m");
  const [volUnit, setVolUnit] = useState("m3");

  // ── Drain pipe details ─────────────────────────────────────────────
  const [pipeTypeId, setPipeTypeId] = useState("sch40");
  const [pipeSizeId, setPipeSizeId] = useState("4");
  const [customOd,     setCustomOd]     = useState("");
  const [customOdUnit, setCustomOdUnit] = useState("cm");
  const [odUnit, setOdUnit] = useState("cm");
  const [showMorePipe, setShowMorePipe] = useState(false);
  const [pipeDropUnit, setPipeDropUnit] = useState("cm");
  const [pipeVolUnit, setPipeVolUnit] = useState("m3");

  // ── Drain pipes needed ─────────────────────────────────────────────
  const [pipeLenUnit, setPipeLenUnit] = useState("m");
  const [stdLenId, setStdLenId] = useState("10ft");
  const [customStdLen,     setCustomStdLen]     = useState("");
  const [customStdLenUnit, setCustomStdLenUnit] = useState("m");

  // ── Gravel needed ──────────────────────────────────────────────────
  const [gravelVolUnit, setGravelVolUnit] = useState("m3");
  const [waste, setWaste] = useState(String(DEFAULT_WASTE_PCT));
  const [totalGravelVolUnit, setTotalGravelVolUnit] = useState("m3");
  const [showGravelWeight, setShowGravelWeight] = useState(false);
  const [gravelDensity,     setGravelDensity]     = useState(String(DEFAULT_GRAVEL_DENSITY_KGM3));
  const [gravelDensityUnit, setGravelDensityUnit] = useState("kg/m3");
  const [gravelWeightUnit,  setGravelWeightUnit]  = useState("kg");

  // ── Filter needed ─────────────────────────────────────────────────
  const [fabricWidthUnit, setFabricWidthUnit] = useState("cm");
  const [fabricAreaUnit,  setFabricAreaUnit]  = useState("m2");

  // ── Cost ────────────────────────────────────────────────────────────
  const [priceGravelVol,    setPriceGravelVol]    = useState("");
  const [priceGravelVolCur, setPriceGravelVolCur] = useState("PKR");
  const [priceGravelWt,     setPriceGravelWt]     = useState("");
  const [priceGravelWtCur,  setPriceGravelWtCur]  = useState("PKR");
  const [gravelCostCur,     setGravelCostCur]     = useState("PKR");
  const [pricePipe,      setPricePipe]      = useState("");
  const [pricePipeCur,   setPricePipeCur]   = useState("PKR");
  const [priceFabric,    setPriceFabric]    = useState("");
  const [priceFabricCur, setPriceFabricCur] = useState("PKR");
  const [costCur, setCostCur] = useState("PKR");

  // ── Section open state ────────────────────────────────────────────
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [pipeOpen,    setPipeOpen]    = useState(true);
  const [pipesOpen,   setPipesOpen]   = useState(true);
  const [gravelOpen,  setGravelOpen]  = useState(true);
  const [filterOpen,  setFilterOpen]  = useState(true);
  const [costOpen,    setCostOpen]    = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const isCustomSize = pipeSizeId === "custom";
  const isCustomStdLen = stdLenId === "custom";
  const pipeSizeOptions = pipeTypeId === "sdr35" ? PIPE_SIZES_SDR35 : PIPE_SIZES_SCH40;
  const pipeSize = useMemo(() => pipeSizeOptions.find((p) => p.id === pipeSizeId), [pipeSizeOptions, pipeSizeId]);
  const stdLen = useMemo(() => STANDARD_PIPE_LENGTHS.find((s) => s.id === stdLenId), [stdLenId]);
  const fabricModeOptions = usePipe ? FABRIC_MODES : FABRIC_MODES.filter((f) => f.id !== "pipe");
  const needsOverlap = fabricMode === "entire" || fabricMode === "pipe";

  function handlePipeTypeChange(newType) {
    setPipeTypeId(newType);
    const newSizes = newType === "sdr35" ? PIPE_SIZES_SDR35 : PIPE_SIZES_SCH40;
    if (pipeSizeId !== "custom" && !newSizes.some((s) => s.id === pipeSizeId)) {
      setPipeSizeId("4");
    }
  }

  function handleUsePipeToggle(checked) {
    setUsePipe(checked);
    if (!checked && fabricMode === "pipe") {
      setFabricMode("no");
    }
  }

  // ── Derive SI values ──────────────────────────────────────────────
  const widthM  = useMemo(() => toLengthM(width, widthUnit, LENGTH_UNITS), [width, widthUnit]);
  const depthM  = useMemo(() => toLengthM(depth, depthUnit, LENGTH_UNITS), [depth, depthUnit]);
  const trenchLenM = useMemo(() => toLengthM(trenchLen, trenchLenUnit, LONG_LENGTH_UNITS), [trenchLen, trenchLenUnit]);

  const odM = useMemo(() => {
    if (isCustomSize) return toLengthM(customOd, customOdUnit, LENGTH_UNITS);
    return pipeSize?.odMm != null ? pipeSize.odMm / 1000 : null;
  }, [isCustomSize, customOd, customOdUnit, pipeSize]);

  const slopeInPerFt = useMemo(() => (odM != null ? minPipeSlopeInPerFt(odM * 1000) : null), [odM]);

  const standardPipeLengthM = useMemo(() => {
    if (isCustomStdLen) return toLengthM(customStdLen, customStdLenUnit, LONG_LENGTH_UNITS);
    return stdLen?.lengthM ?? null;
  }, [isCustomStdLen, customStdLen, customStdLenUnit, stdLen]);

  const wastePct = useMemo(() => {
    const v = parseFloat(waste);
    return isFinite(v) && v >= 0 ? v : 0;
  }, [waste]);

  const gravelDensityKgM3 = useMemo(() => toDensityKgM3(gravelDensity, gravelDensityUnit), [gravelDensity, gravelDensityUnit]);

  const overlapM = useMemo(() => toLengthM(overlap, overlapUnit, LENGTH_UNITS), [overlap, overlapUnit]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcFrenchDrain({
    widthM, depthM, trenchLengthM: trenchLenM,
    usePipe, odM, slopeInPerFt, standardPipeLengthM,
    fabricMode, overlapM,
    wastePct, gravelDensityKgM3,
  }), [widthM, depthM, trenchLenM, usePipe, odM, slopeInPerFt, standardPipeLengthM, fabricMode, overlapM, wastePct, gravelDensityKgM3]);

  // ── Display values ────────────────────────────────────────────────
  const dispTrenchVol = result ? fmtDrain(fromM3(result.trenchVolumeM3, volUnit), 4) : "";
  const dispOdVal = odM != null ? fmtDrain(odM / (LENGTH_UNITS.find((u) => u.id === odUnit)?.toM ?? 1), 2) : "";
  const dispPipeLen = result?.pipeLengthM != null ? fmtDrain(fromLengthM(result.pipeLengthM, pipeLenUnit, LONG_LENGTH_UNITS), 2) : "";
  const dispPipeCount = result?.pipeCount != null ? String(result.pipeCount) : "";
  const dispGravelVol = result ? fmtDrain(fromM3(result.gravelVolumeM3, gravelVolUnit), 4) : "";
  const dispTotalGravelVol = result ? fmtDrain(fromM3(result.totalGravelVolumeM3, totalGravelVolUnit), 4) : "";
  const dispGravelWeight = result?.gravelWeightKg != null ? fmtDrain(fromKgDrain(result.gravelWeightKg, gravelWeightUnit), 2) : "";
  const dispFabricWidth = result?.fabricWidthM != null ? fmtDrain(fromLengthM(result.fabricWidthM, fabricWidthUnit), 2) : "";
  const dispFabricAreaOut = result?.fabricAreaM2 != null ? fmtDrain(fromM2(result.fabricAreaM2, fabricAreaUnit), 4) : "";

  const insideDia = useMemo(() => {
    if (!pipeSize?.odMm) return null;
    return insideDiameterMm(pipeSize.odMm, pipeTypeId, pipeSizeId);
  }, [pipeSize, pipeTypeId, pipeSizeId]);

  const dispMinSlope = slopeInPerFt != null ? fmtDrain(slopeInPerFt, 4) : "";
  const dispPipeDrop = result?.pipeDropM != null ? fmtDrain(fromLengthM(result.pipeDropM, pipeDropUnit), 4) : "";
  const dispPipeVol = result?.pipeVolumeM3 != null ? fmtDrain(fromM3(result.pipeVolumeM3, pipeVolUnit), 6) : "";

  // ── Cost ──────────────────────────────────────────────────────────
  const gravelCost = useMemo(() => {
    const pv = parseFloat(priceGravelVol);
    const pw = parseFloat(priceGravelWt);
    let total = null;
    if (isFinite(pv) && pv > 0 && result?.totalGravelVolumeM3 != null) {
      total = (total ?? 0) + pv * result.totalGravelVolumeM3;
    }
    if (isFinite(pw) && pw > 0 && result?.gravelWeightKg != null) {
      total = (total ?? 0) + pw * result.gravelWeightKg;
    }
    return total;
  }, [priceGravelVol, priceGravelWt, result]);

  const pipeCost = useMemo(() => {
    const p = parseFloat(pricePipe);
    if (usePipe && isFinite(p) && p > 0 && result?.pipeCount != null) return p * result.pipeCount;
    return null;
  }, [usePipe, pricePipe, result]);

  const fabricCost = useMemo(() => {
    const p = parseFloat(priceFabric);
    if (fabricMode !== "no" && isFinite(p) && p > 0 && result?.fabricAreaM2 != null) return p * result.fabricAreaM2;
    return null;
  }, [fabricMode, priceFabric, result]);

  const totalCost = useMemo(() => {
    if (gravelCost === null && pipeCost === null && fabricCost === null) return null;
    return (gravelCost || 0) + (pipeCost || 0) + (fabricCost || 0);
  }, [gravelCost, pipeCost, fabricCost]);

  const dispGravelCost = gravelCost !== null ? fmtDrain(gravelCost, 2) : "";
  const dispPipeCost = pipeCost !== null ? fmtDrain(pipeCost, 2) : "";
  const dispFabricCost = fabricCost !== null ? fmtDrain(fabricCost, 2) : "";
  const dispTotalCost = totalCost !== null ? fmtDrain(totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const odVsWidth = usePipe && odM != null && widthM != null && odM >= widthM;
  const odVsDepth = usePipe && odM != null && depthM != null && odM >= depthM;

  const widErr = touched.wid && (width === "" || parseFloat(width) <= 0)
    ? "Please enter a positive value for the trench width."
    : touched.wid && odVsWidth
    ? "The trench width must be greater than the outside diameter of the pipe. Please increase the trench width or select a smaller pipe size."
    : null;
  const depErr = touched.dep && (depth === "" || parseFloat(depth) <= 0)
    ? "Please enter a positive value for the trench depth."
    : touched.dep && odVsDepth
    ? "The trench depth must be greater than the outside diameter of the pipe. Please increase the trench depth or select a smaller pipe size."
    : null;
  const lenErr = touched.len && (trenchLen === "" || parseFloat(trenchLen) <= 0)
    ? "Please enter a positive value for the trench length." : null;
  const odPositiveErr = isCustomSize && touched.od && (customOd === "" || parseFloat(customOd) <= 0)
    ? "Please enter a positive outside diameter." : null;
  const odWidthErr = touched.wid && odVsWidth
    ? "The outside diameter of the pipe must be smaller than the trench width. Please select a smaller pipe size or increase the trench width."
    : null;
  const odDepthErr = touched.dep && odVsDepth
    ? "The outside diameter of the pipe must be smaller than the trench depth. Please select a smaller pipe size or increase the trench depth."
    : null;
  const odErr = [odPositiveErr, odWidthErr, odDepthErr].filter(Boolean);
  const stdErr = isCustomStdLen && touched.std && (customStdLen === "" || parseFloat(customStdLen) <= 0)
    ? "Please enter a positive standard pipe length." : null;
  const gravelVolErr = result != null && result.gravelVolumeM3 < 0
    ? "The gravel volume must be a positive value." : null;
  const totalGravelVolErr = result != null && result.totalGravelVolumeM3 < 0
    ? "The total gravel volume must be a positive value." : null;
  const overlapErr = needsOverlap && touched.ovl && (overlapM == null || overlapM < MIN_FABRIC_OVERLAP_M)
    ? "Please enter at least 1 inch (2.54 cm) for the overlap of filter fabric." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setWidth(""); setDepth(""); setOverlap(""); setTrenchLen("");
    setCustomOd(""); setCustomStdLen(""); setWaste(String(DEFAULT_WASTE_PCT));
    setGravelDensity(String(DEFAULT_GRAVEL_DENSITY_KGM3));
    setPriceGravelVol(""); setPriceGravelWt(""); setPricePipe(""); setPriceFabric("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setUsePipe(true); setFabricMode("no");
    setWidthUnit("cm"); setDepthUnit("cm"); setOverlapUnit("cm");
    setTrenchLenUnit("m"); setVolUnit("m3");
    setPipeTypeId("sch40"); setPipeSizeId("4"); setCustomOdUnit("cm"); setOdUnit("cm");
    setShowMorePipe(false); setPipeDropUnit("cm"); setPipeVolUnit("m3");
    setPipeLenUnit("m"); setStdLenId("10ft"); setCustomStdLenUnit("m");
    setGravelVolUnit("m3"); setTotalGravelVolUnit("m3");
    setShowGravelWeight(false); setGravelDensityUnit("kg/m3"); setGravelWeightUnit("kg");
    setFabricWidthUnit("cm"); setFabricAreaUnit("m2");
    setPriceGravelVolCur("PKR"); setPriceGravelWtCur("PKR"); setGravelCostCur("PKR");
    setPricePipeCur("PKR"); setPriceFabricCur("PKR"); setCostCur("PKR");
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
          SECTION 1 — French drain details
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)} title="French drain details" />
        {detailsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <CheckboxRow checked={usePipe} onToggle={handleUsePipeToggle} label="Use perforated drain pipe" />

            <Divider />

            <Field label={usePipe ? "With fabric filter?" : "With filter?"}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fabricModeOptions.map((f) => (
                  <RadioRow key={f.id} name="fabric-mode" selected={fabricMode === f.id}
                    onSelect={() => setFabricMode(f.id)} label={f.label} />
                ))}
              </div>
            </Field>

            <div style={{ background: "var(--bg-muted)", borderRadius: RADIUS, padding: "16px 18px" }}>
              <FrenchDrainDiagram usePipe={usePipe} showOverlap={needsOverlap} />
            </div>

            <Field label="Trench width (w)" error={widErr}>
              <CompoundField
                value={width} onChange={setWidth} onBlur={() => touch("wid")}
                unit={widthUnit} onUnitChange={setWidthUnit} units={LENGTH_UNITS}
                placeholder="e.g. 30" hasError={!!widErr}
              />
            </Field>

            <Divider />

            <Field label="Trench depth (d)" error={depErr}>
              <CompoundField
                value={depth} onChange={setDepth} onBlur={() => touch("dep")}
                unit={depthUnit} onUnitChange={setDepthUnit} units={LENGTH_UNITS}
                placeholder="e.g. 45" hasError={!!depErr}
              />
            </Field>

            {needsOverlap && (
              <>
                <Divider />

                <Field label="Filter fabric overlap (o)"
                  hint="Extra fabric length left at the seam so the two edges overlap and fully seal, instead of just meeting edge to edge."
                  error={overlapErr}>
                  <CompoundField
                    value={overlap} onChange={setOverlap} onBlur={() => touch("ovl")}
                    unit={overlapUnit} onUnitChange={setOverlapUnit} units={LENGTH_UNITS}
                    placeholder="e.g. 1" hasError={!!overlapErr}
                  />
                </Field>
              </>
            )}

            <Divider />

            <Field label="Trench length (L)" hint="Total length of the drain trench." error={lenErr}>
              <CompoundField
                value={trenchLen} onChange={setTrenchLen} onBlur={() => touch("len")}
                unit={trenchLenUnit} onUnitChange={setTrenchLenUnit} units={LONG_LENGTH_UNITS}
                placeholder="e.g. 10" hasError={!!lenErr}
              />
            </Field>

            <Divider />

            <Field label="Trench volume"
              hint="Trench volume = Width × Depth × Trench length."
              note={result === null ? "Enter the trench dimensions above to compute this." : undefined}>
              <CompoundField
                value={dispTrenchVol}
                unit={volUnit} onUnitChange={setVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Drain pipe details
          ════════════════════════════════════════════════════════════ */}
      {usePipe && (
        <div className="card" style={{ overflow: "hidden" }}>
          <SectionHeader open={pipeOpen} onToggle={() => setPipeOpen(!pipeOpen)} title="Drain pipe details" />
          {pipeOpen && (
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              <Field label="Pipe option">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PIPE_TYPES.map((p) => (
                    <RadioRow key={p.id} name="pipe-type" selected={pipeTypeId === p.id}
                      onSelect={() => handlePipeTypeChange(p.id)} label={p.label} />
                  ))}
                </div>
              </Field>

              <Divider />

              <Field label="Pipe size" hint="Nominal pipe size. Outside diameter auto-fills below.">
                <PlainSelect value={pipeSizeId} onChange={setPipeSizeId} options={pipeSizeOptions} />
              </Field>

              <Divider />

              {isCustomSize ? (
                <Field label="Outside diameter (D_o)" error={odErr}>
                  <CompoundField
                    value={customOd} onChange={setCustomOd} onBlur={() => touch("od")}
                    unit={customOdUnit} onUnitChange={setCustomOdUnit} units={LENGTH_UNITS}
                    placeholder="e.g. 11.4" hasError={odErr.length > 0}
                  />
                </Field>
              ) : (
                <Field label="Outside diameter (D_o)" error={odErr}
                  note={odErr.length === 0 ? "Auto-filled from the selected pipe size." : undefined}>
                  <CompoundField
                    value={dispOdVal}
                    unit={odUnit} onUnitChange={setOdUnit} units={LENGTH_UNITS}
                    placeholder="—" isOutput hasError={odErr.length > 0}
                  />
                </Field>
              )}

              <Divider />

              <CheckboxRow checked={showMorePipe} onToggle={setShowMorePipe} label="Display more pipe details" />

              {showMorePipe && (
                <>
                  <Divider />
                  <Field label="Inside diameter (D_i)"
                    hint="Outside diameter minus twice the wall thickness. SDR35 uses OD ÷ 35 for wall thickness; Schedule 40 uses standard reference values."
                    note={insideDia == null ? "Not available for this pipe size/type." : undefined}>
                    <CompoundField
                      value={insideDia != null ? fmtDrain(insideDia / 10, 2) : ""}
                      unitLabel="cm" placeholder="—" isOutput
                    />
                  </Field>

                  <Divider />

                  <Field label="Minimum pipe slope (s)"
                    hint="Minimum recommended slope depends on pipe size: 1/8″–2½″ pipes need at least 0.25 in/ft, 3″–6″ need at least 0.125 in/ft, and 8″ or larger need at least 0.0625 in/ft."
                    note={slopeInPerFt == null ? "Select a pipe size above to determine this." : undefined}>
                    <CompoundField
                      value={dispMinSlope}
                      unitLabel="inches per foot" placeholder="—" isOutput
                    />
                  </Field>

                  <Divider />

                  <Field label="Pipe drop"
                    hint="Pipe drop = Trench length × Minimum pipe slope ÷ 12 — the vertical drop needed across the trench to maintain the minimum slope."
                    note={result?.pipeDropM == null ? "Enter the trench length and pipe size above to compute this." : undefined}>
                    <CompoundField
                      value={dispPipeDrop}
                      unit={pipeDropUnit} onUnitChange={setPipeDropUnit} units={LENGTH_UNITS}
                      placeholder="—" isOutput
                    />
                  </Field>

                  <Divider />

                  <Field label="Volume displaced by drain pipe"
                    hint="Volume displaced by drain pipe = π × (Outside diameter ÷ 2)² × Total drain pipe length (Lp) — the same pipe volume subtracted from the gravel volume below."
                    note={result?.pipeVolumeM3 == null ? "Enter the pipe and trench details above to compute this." : undefined}>
                    <CompoundField
                      value={dispPipeVol}
                      unit={pipeVolUnit} onUnitChange={setPipeVolUnit} units={VOLUME_OUT_UNITS}
                      placeholder="—" isOutput
                    />
                  </Field>
                </>
              )}

            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Drain pipes needed
          ════════════════════════════════════════════════════════════ */}
      {usePipe && (
        <div className="card" style={{ overflow: "hidden" }}>
          <SectionHeader open={pipesOpen} onToggle={() => setPipesOpen(!pipesOpen)} title="Drain pipes needed" />
          {pipesOpen && (
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              <Field label="Total drain pipe length"
                hint="Total drain pipe length (Lp) = √(Trench length² + Pipe drop²) — accounts for the extra length needed to maintain the minimum slope across the trench."
                note={result?.pipeLengthM == null ? "Enter the trench dimensions and pipe size above to compute this." : undefined}>
                <CompoundField
                  value={dispPipeLen}
                  unit={pipeLenUnit} onUnitChange={setPipeLenUnit} units={LONG_LENGTH_UNITS}
                  placeholder="—" isOutput
                />
              </Field>

              <Divider />

              <Field label="Standard pipe length" hint="Length of pipe as sold — used to compute how many pieces you'll need.">
                <PlainSelect value={stdLenId} onChange={setStdLenId} options={STANDARD_PIPE_LENGTHS} />
              </Field>

              {isCustomStdLen && (
                <Field label="Custom standard pipe length" error={stdErr}>
                  <CompoundField
                    value={customStdLen} onChange={setCustomStdLen} onBlur={() => touch("std")}
                    unit={customStdLenUnit} onUnitChange={setCustomStdLenUnit} units={LONG_LENGTH_UNITS}
                    placeholder="e.g. 3" hasError={!!stdErr}
                  />
                </Field>
              )}

              <Divider />

              <Field label="Quantity of pipes needed"
                hint="⌈Total drain pipe length ÷ Standard pipe length⌉."
                note={result?.pipeCount == null ? "Enter the pipe length details above to compute this." : undefined}>
                <CompoundField value={dispPipeCount} placeholder="—" isOutput unitLabel="pipes" />
              </Field>

            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — Gravel needed
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={gravelOpen} onToggle={() => setGravelOpen(!gravelOpen)} title="Gravel needed" />
        {gravelOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Gravel volume"
              hint={usePipe
                ? "Gravel volume = Trench volume − Pipe volume (Width × Depth × Trench length − π × (D_o ÷ 2)² × Total drain pipe length), where the pipe length accounts for the minimum installation slope."
                : "Gravel volume = Trench volume (no pipe to subtract)."}
              error={gravelVolErr}
              note={gravelVolErr ? undefined : result === null ? "Enter the trench dimensions above to compute this." : undefined}>
              <CompoundField
                value={dispGravelVol}
                unit={gravelVolUnit} onUnitChange={setGravelVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput hasError={!!gravelVolErr}
              />
            </Field>

            <Divider />

            <Field label="Wastage" hint="Extra gravel to cover spillage, compaction, and uneven trench walls. Typical: 10%.">
              <CompoundField value={waste} onChange={setWaste} unitLabel="%" placeholder="10" />
            </Field>

            <Divider />

            <Field label="Total gravel volume"
              hint="Total gravel volume = Gravel volume × (1 + Wastage ÷ 100)."
              error={totalGravelVolErr}
              note={totalGravelVolErr ? undefined : result === null ? "Enter the trench dimensions above to compute this." : undefined}>
              <CompoundField
                value={dispTotalGravelVol}
                unit={totalGravelVolUnit} onUnitChange={setTotalGravelVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput hasError={!!totalGravelVolErr}
              />
            </Field>

            <Divider />

            <CheckboxRow checked={showGravelWeight} onToggle={setShowGravelWeight} label="Display gravel density and weight" />

            {showGravelWeight && (
              <>
                <Divider />
                <Field label="Gravel density" hint="Bulk density of the gravel fill. 1,680 kg/m³ is a typical value.">
                  <CompoundField
                    value={gravelDensity} onChange={setGravelDensity}
                    unit={gravelDensityUnit} onUnitChange={setGravelDensityUnit} units={DENSITY_UNITS}
                    placeholder="e.g. 1680"
                  />
                </Field>

                <Divider />

                <Field label="Weight of gravel needed"
                  hint="Weight of gravel needed = Total gravel volume × Gravel density."
                  note={result?.gravelWeightKg == null ? "Enter a gravel density above to compute this." : undefined}>
                  <CompoundField
                    value={dispGravelWeight}
                    unit={gravelWeightUnit} onUnitChange={setGravelWeightUnit} units={WEIGHT_OUT_UNITS}
                    placeholder="—" isOutput
                  />
                </Field>
              </>
            )}

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 5 — Filter needed
          ════════════════════════════════════════════════════════════ */}
      {fabricMode !== "no" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <SectionHeader open={filterOpen} onToggle={() => setFilterOpen(!filterOpen)} title="Filter needed" />
          {filterOpen && (
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              <Field label="Width of needed filter fabric"
                hint={fabricMode === "entire"
                  ? "Width of needed filter fabric = 2 × (Trench width + Trench depth) + Overlap."
                  : fabricMode === "pipe"
                  ? "Width of needed filter fabric = π × Outside diameter + Overlap."
                  : "Width of needed filter fabric = Trench width — laid flat on top, so no seam overlap is needed."}
                note={result?.fabricWidthM == null
                  ? needsOverlap && overlapM == null
                    ? "Enter the filter fabric overlap above to compute this."
                    : "Enter the trench dimensions above to compute this."
                  : undefined}>
                <CompoundField
                  value={dispFabricWidth}
                  unit={fabricWidthUnit} onUnitChange={setFabricWidthUnit} units={LENGTH_UNITS}
                  placeholder="—" isOutput
                />
              </Field>

              <Divider />

              <Field label="Total area of filter fabric needed"
                hint="Total area of filter fabric needed = Width of needed filter fabric × Trench length (or Total drain pipe length, for the “around the pipe” option)."
                note={result?.fabricAreaM2 == null
                  ? needsOverlap && overlapM == null
                    ? "Enter the filter fabric overlap above to compute this."
                    : "Enter the trench dimensions above to compute this."
                  : undefined}>
                <CompoundField
                  value={dispFabricAreaOut}
                  unit={fabricAreaUnit} onUnitChange={setFabricAreaUnit} units={AREA_OUT_UNITS}
                  placeholder="—" isOutput
                />
              </Field>

            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 6 — Cost of materials needed
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)} title="Cost of materials needed" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Price per unit volume of gravel">
              <PriceRow
                value={priceGravelVol} onChange={setPriceGravelVol}
                currency={priceGravelVolCur} onCurrencyChange={(c) => { setPriceGravelVolCur(c); setGravelCostCur(c); setCostCur(c); }}
                suffix="/m³"
              />
            </Field>

            <Divider />

            <Field label="Price per unit weight of gravel"
              hint="Only usable once 'Display gravel density and weight' is checked above, so the calculator knows the gravel's weight.">
              <PriceRow
                value={priceGravelWt} onChange={setPriceGravelWt}
                currency={priceGravelWtCur} onCurrencyChange={(c) => { setPriceGravelWtCur(c); setGravelCostCur(c); setCostCur(c); }}
                suffix="/kg"
              />
            </Field>

            <Divider />

            <Field label="Cost of gravel"
              hint="Cost of gravel = (Price per volume × Total gravel volume) + (Price per weight × Weight of gravel needed)."
              note={dispGravelCost === "" ? "Enter a price above to calculate." : undefined}>
              <PriceRow value={dispGravelCost} currency={gravelCostCur} onCurrencyChange={() => {}} isOutput />
            </Field>

            {usePipe && (
              <>
                <Divider />
                <Field label="Price per pipe">
                  <PriceRow
                    value={pricePipe} onChange={setPricePipe}
                    currency={pricePipeCur} onCurrencyChange={(c) => { setPricePipeCur(c); setCostCur(c); }}
                    suffix="/piece"
                  />
                </Field>

                <Divider />

                <Field label="Cost of pipes"
                  note={dispPipeCost === "" ? "Enter a price above to calculate." : undefined}>
                  <PriceRow value={dispPipeCost} currency={pricePipeCur} onCurrencyChange={() => {}} isOutput />
                </Field>
              </>
            )}

            {fabricMode !== "no" && (
              <>
                <Divider />
                <Field label="Price per unit area of filter fabric">
                  <PriceRow
                    value={priceFabric} onChange={setPriceFabric}
                    currency={priceFabricCur} onCurrencyChange={(c) => { setPriceFabricCur(c); setCostCur(c); }}
                    suffix="/m²"
                  />
                </Field>

                <Divider />

                <Field label="Cost of filter fabric"
                  hint={`Filter fabric area (${dispFabricAreaOut === "" ? "—" : dispFabricAreaOut} ${AREA_OUT_UNITS.find((u) => u.id === fabricAreaUnit)?.label ?? "m²"}) × price per unit area.`}
                  note={dispFabricCost === "" ? "Enter a price above to calculate." : undefined}>
                  <PriceRow value={dispFabricCost} currency={priceFabricCur} onCurrencyChange={() => {}} isOutput />
                </Field>
              </>
            )}

            <Divider />

            <Field label="Total cost"
              hint="Total cost = Cost of gravel + Cost of pipes + Cost of filter fabric."
              note={dispTotalCost === "" ? "Enter at least one price above to calculate." : undefined}>
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
          INFO CARD — How is a French drain calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate French drain materials?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Trench volume       = Width × Depth × Trench length",
            "Pipe drop           = Trench length × Minimum pipe slope ÷ 12",
            "Total pipe length   = √(Trench length² + Pipe drop²)",
            "Pipe volume         = π × (Outside diameter ÷ 2)² × Total pipe length",
            "Gravel volume       = Trench volume − Pipe volume",
            "Total gravel volume = Gravel volume × (1 + Wastage ÷ 100)",
            "Pipes needed        = ⌈Total pipe length ÷ Standard pipe length⌉",
            "Fabric width        = 2 × (Width + Depth) + Overlap  (entire trench)",
            "Total cost          = Gravel cost + Pipe cost + Fabric cost",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          A <strong>French drain</strong> is a gravel-filled trench with a perforated pipe that redirects water away
          from a problem area. The <strong>gravel volume</strong> subtracts the space taken up by the pipe itself, so
          you don't over-order. A <strong>fabric filter</strong> (geotextile) keeps soil from clogging the gravel or
          pipe over time — line the entire trench, wrap just the pipe, or lay a strip on top, depending on your
          soil conditions.
        </p>
      </div>

    </div>
  );
}
