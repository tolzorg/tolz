import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, AREA_OUT_UNITS, PANEL_SIZES, CURRENCIES,
  toLengthM, fromM2,
  calcDrywall, fmtDrywall,
} from "../../../utils/drywallCalc";

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

// ── Plain count input (no unit selector) ──────────────────────────
function CountField({ value, onChange, onBlur, placeholder = "0", hasError = false }) {
  const borderColor = hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type="number" inputMode="numeric" step="1" min="0"
        value={value}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur}
        style={INPUT_BASE}
      />
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

// ── Price row: [number input] [currency] ──────────────────────────
function PriceRow({ value, onChange, currency, onCurrencyChange, isOutput, placeholder = "0.00" }) {
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
export default function DrywallCalculatorTool() {

  // ── Room dimensions ────────────────────────────────────────────────
  const [roomLength, setRoomLength] = useState("");
  const [roomLengthUnit, setRoomLengthUnit] = useState("ft");
  const [roomWidth, setRoomWidth] = useState("");
  const [roomWidthUnit, setRoomWidthUnit] = useState("ft");
  const [roomHeight, setRoomHeight] = useState("");
  const [roomHeightUnit, setRoomHeightUnit] = useState("ft");

  // ── Area under sloped walls ─────────────────────────────────────────
  const [slopeCount, setSlopeCount] = useState("");
  const [slopeBase, setSlopeBase] = useState("");
  const [slopeBaseUnit, setSlopeBaseUnit] = useState("ft");
  const [slopeHeight, setSlopeHeight] = useState("");
  const [slopeHeightUnit, setSlopeHeightUnit] = useState("ft");

  // ── Room surface area ────────────────────────────────────────────────
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [areaUnit, setAreaUnit] = useState("ft2");

  // ── Doors ────────────────────────────────────────────────────────────
  const [doorCount, setDoorCount] = useState("0");
  const [doorHeight, setDoorHeight] = useState("200");
  const [doorHeightUnit, setDoorHeightUnit] = useState("cm");
  const [doorWidth, setDoorWidth] = useState("90");
  const [doorWidthUnit, setDoorWidthUnit] = useState("cm");

  // ── Windows ──────────────────────────────────────────────────────────
  const [windowCount, setWindowCount] = useState("0");
  const [windowHeight, setWindowHeight] = useState("120");
  const [windowHeightUnit, setWindowHeightUnit] = useState("cm");
  const [windowWidth, setWindowWidth] = useState("90");
  const [windowWidthUnit, setWindowWidthUnit] = useState("cm");

  // ── Drywall amount ───────────────────────────────────────────────────
  const [panelSizeId, setPanelSizeId] = useState("600x1200");
  const [costPerPanel, setCostPerPanel] = useState("");
  const [costCur, setCostCur] = useState("PKR");

  // ── Section open state ────────────────────────────────────────────
  const [dimOpen, setDimOpen] = useState(true);
  const [slopeOpen, setSlopeOpen] = useState(true);
  const [surfaceOpen, setSurfaceOpen] = useState(true);
  const [doorsOpen, setDoorsOpen] = useState(true);
  const [windowsOpen, setWindowsOpen] = useState(true);
  const [amountOpen, setAmountOpen] = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched, setTouched] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared, setShared] = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  // ── Derive SI values ──────────────────────────────────────────────
  const roomLengthM = useMemo(() => toLengthM(roomLength, roomLengthUnit), [roomLength, roomLengthUnit]);
  const roomWidthM  = useMemo(() => toLengthM(roomWidth, roomWidthUnit),  [roomWidth, roomWidthUnit]);
  const roomHeightM = useMemo(() => toLengthM(roomHeight, roomHeightUnit), [roomHeight, roomHeightUnit]);

  const slopeCountNum = useMemo(() => {
    const v = parseFloat(slopeCount);
    return isFinite(v) && v > 0 ? v : null;
  }, [slopeCount]);
  const slopeBaseM   = useMemo(() => toLengthM(slopeBase, slopeBaseUnit), [slopeBase, slopeBaseUnit]);
  const slopeHeightM = useMemo(() => toLengthM(slopeHeight, slopeHeightUnit), [slopeHeight, slopeHeightUnit]);

  const doorCountNum = useMemo(() => {
    const v = parseFloat(doorCount);
    return isFinite(v) && v > 0 ? v : null;
  }, [doorCount]);
  const doorHeightM = useMemo(() => toLengthM(doorHeight, doorHeightUnit), [doorHeight, doorHeightUnit]);
  const doorWidthM  = useMemo(() => toLengthM(doorWidth, doorWidthUnit),  [doorWidth, doorWidthUnit]);

  const windowCountNum = useMemo(() => {
    const v = parseFloat(windowCount);
    return isFinite(v) && v > 0 ? v : null;
  }, [windowCount]);
  const windowHeightM = useMemo(() => toLengthM(windowHeight, windowHeightUnit), [windowHeight, windowHeightUnit]);
  const windowWidthM  = useMemo(() => toLengthM(windowWidth, windowWidthUnit),  [windowWidth, windowWidthUnit]);

  const panelSize = useMemo(() => PANEL_SIZES.find((p) => p.id === panelSizeId), [panelSizeId]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcDrywall({
    roomLengthM, roomWidthM, roomHeightM,
    slopeCount: slopeCountNum, slopeBaseM, slopeHeightM,
    includeCeiling,
    doorCount: doorCountNum, doorHeightM, doorWidthM,
    windowCount: windowCountNum, windowHeightM, windowWidthM,
    panelM2: panelSize?.m2 ?? null,
    costPerPanel: (() => { const v = parseFloat(costPerPanel); return isFinite(v) && v > 0 ? v : null; })(),
  }), [
    roomLengthM, roomWidthM, roomHeightM,
    slopeCountNum, slopeBaseM, slopeHeightM, includeCeiling,
    doorCountNum, doorHeightM, doorWidthM,
    windowCountNum, windowHeightM, windowWidthM,
    panelSize, costPerPanel,
  ]);

  // ── Display values ────────────────────────────────────────────────
  const dispSlopedArea = result?.slopedAreaM2 != null ? fmtDrywall(fromM2(result.slopedAreaM2, areaUnit), 2) : "";
  const dispGrossArea  = result?.grossAreaM2  != null ? fmtDrywall(fromM2(result.grossAreaM2, areaUnit), 2)  : "";
  const dispDoorArea   = result?.doorAreaM2   != null ? fmtDrywall(fromM2(result.doorAreaM2, areaUnit), 2)   : "";
  const dispWindowArea = result?.windowAreaM2 != null ? fmtDrywall(fromM2(result.windowAreaM2, areaUnit), 2) : "";
  const dispNetArea    = result?.netAreaM2    != null ? fmtDrywall(fromM2(result.netAreaM2, areaUnit), 2)    : "";
  const dispPanelCount = result?.panelCount != null ? String(result.panelCount) : "";
  const dispTotalCost  = result?.totalCost  != null ? fmtDrywall(result.totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const lenErr = touched.len && (roomLength === "" || parseFloat(roomLength) <= 0)
    ? "Please enter a positive value for the room length." : null;
  const widErr = touched.wid && (roomWidth === "" || parseFloat(roomWidth) <= 0)
    ? "Please enter a positive value for the room width." : null;
  const heiErr = touched.hei && (roomHeight === "" || parseFloat(roomHeight) <= 0)
    ? "Please enter a positive value for the room height." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setRoomLength(""); setRoomWidth(""); setRoomHeight("");
    setSlopeCount(""); setSlopeBase(""); setSlopeHeight("");
    setDoorCount("0"); setDoorHeight("200"); setDoorWidth("90");
    setWindowCount("0"); setWindowHeight("120"); setWindowWidth("90");
    setCostPerPanel("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setPanelSizeId("600x1200");
    setRoomLengthUnit("ft"); setRoomWidthUnit("ft"); setRoomHeightUnit("ft");
    setSlopeBaseUnit("ft"); setSlopeHeightUnit("ft");
    setDoorHeightUnit("cm"); setDoorWidthUnit("cm");
    setWindowHeightUnit("cm"); setWindowWidthUnit("cm");
    setIncludeCeiling(true); setAreaUnit("ft2"); setCostCur("PKR");
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
          SECTION 1 — Room dimensions
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={dimOpen} onToggle={() => setDimOpen(!dimOpen)} title="Room dimensions" />
        {dimOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Room length" error={lenErr}>
              <CompoundField
                value={roomLength} onChange={setRoomLength} onBlur={() => touch("len")}
                unit={roomLengthUnit} onUnitChange={setRoomLengthUnit} units={LENGTH_UNITS}
                placeholder="e.g. 12" hasError={!!lenErr}
              />
            </Field>

            <Divider />

            <Field label="Room width" error={widErr}>
              <CompoundField
                value={roomWidth} onChange={setRoomWidth} onBlur={() => touch("wid")}
                unit={roomWidthUnit} onUnitChange={setRoomWidthUnit} units={LENGTH_UNITS}
                placeholder="e.g. 10" hasError={!!widErr}
              />
            </Field>

            <Divider />

            <Field label="Room height" hint="Interior height of the room, floor to ceiling." error={heiErr}>
              <CompoundField
                value={roomHeight} onChange={setRoomHeight} onBlur={() => touch("hei")}
                unit={roomHeightUnit} onUnitChange={setRoomHeightUnit} units={LENGTH_UNITS}
                placeholder="e.g. 8" hasError={!!heiErr}
              />
            </Field>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Area under sloped walls
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={slopeOpen} onToggle={() => setSlopeOpen(!slopeOpen)} title="Area under sloped walls" />
        {slopeOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Number of triangular spaces"
              hint="How many sloped-wall (attic/dormer style) triangular sections your room has.">
              <CountField value={slopeCount} onChange={setSlopeCount} />
            </Field>

            <Divider />

            <Field label="Base of triangular space">
              <CompoundField
                value={slopeBase} onChange={setSlopeBase}
                unit={slopeBaseUnit} onUnitChange={setSlopeBaseUnit} units={LENGTH_UNITS}
                placeholder="e.g. 10"
              />
            </Field>

            <Divider />

            <Field label="Height of triangular space"
              hint="Measure only up to the base of the triangular space, not the full wall height.">
              <CompoundField
                value={slopeHeight} onChange={setSlopeHeight}
                unit={slopeHeightUnit} onUnitChange={setSlopeHeightUnit} units={LENGTH_UNITS}
                placeholder="e.g. 3"
              />
            </Field>

            <Divider />

            <Field label="Total area under sloped walls"
              hint="Number of spaces × (base × height ÷ 2)."
              note={result?.slopedAreaM2 == null ? "Enter the number of spaces, base, and height above." : undefined}>
              <CompoundField
                value={dispSlopedArea}
                unit={areaUnit} onUnitChange={setAreaUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Room surface area
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={surfaceOpen} onToggle={() => setSurfaceOpen(!surfaceOpen)} title="Room surface area" />
        {surfaceOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Include ceiling?" hint="Adds the ceiling area (length × width) to the gross room area.">
              <div style={{ display: "flex", gap: 16 }}>
                {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                    <input
                      type="radio" name="include-ceiling" checked={includeCeiling === val}
                      onChange={() => setIncludeCeiling(val)}
                      style={{ accentColor: "var(--accent)", width: 15, height: 15 }}
                    />
                    <span style={{
                      fontFamily: FONT, fontWeight: includeCeiling === val ? 700 : 500, fontSize: 13,
                      color: includeCeiling === val ? "var(--accent)" : "var(--text-primary)",
                    }}>{label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Divider />

            <Field label="Gross room area"
              hint="Wall area (perimeter × height) + ceiling area (if included) + sloped-wall area."
              note={result?.grossAreaM2 == null ? "Enter the room dimensions above to compute the gross area." : undefined}>
              <CompoundField
                value={dispGrossArea}
                unit={areaUnit} onUnitChange={setAreaUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — Doors
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={doorsOpen} onToggle={() => setDoorsOpen(!doorsOpen)} title="Doors" />
        {doorsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Number of doors">
              <CountField value={doorCount} onChange={setDoorCount} />
            </Field>

            <Divider />

            <Field label="Door height">
              <CompoundField
                value={doorHeight} onChange={setDoorHeight}
                unit={doorHeightUnit} onUnitChange={setDoorHeightUnit} units={LENGTH_UNITS}
                placeholder="e.g. 200"
              />
            </Field>

            <Divider />

            <Field label="Door width">
              <CompoundField
                value={doorWidth} onChange={setDoorWidth}
                unit={doorWidthUnit} onUnitChange={setDoorWidthUnit} units={LENGTH_UNITS}
                placeholder="e.g. 90"
              />
            </Field>

            <Divider />

            <Field label="Total doors area"
              hint="Number of doors × door height × door width."
              note={result?.doorAreaM2 == null ? "Set the number of doors above to compute this." : undefined}>
              <CompoundField
                value={dispDoorArea}
                unit={areaUnit} onUnitChange={setAreaUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 5 — Windows
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={windowsOpen} onToggle={() => setWindowsOpen(!windowsOpen)} title="Windows" />
        {windowsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Number of windows">
              <CountField value={windowCount} onChange={setWindowCount} />
            </Field>

            <Divider />

            <Field label="Windows height">
              <CompoundField
                value={windowHeight} onChange={setWindowHeight}
                unit={windowHeightUnit} onUnitChange={setWindowHeightUnit} units={LENGTH_UNITS}
                placeholder="e.g. 120"
              />
            </Field>

            <Divider />

            <Field label="Windows width">
              <CompoundField
                value={windowWidth} onChange={setWindowWidth}
                unit={windowWidthUnit} onUnitChange={setWindowWidthUnit} units={LENGTH_UNITS}
                placeholder="e.g. 90"
              />
            </Field>

            <Divider />

            <Field label="Total windows area"
              hint="Number of windows × window height × window width."
              note={result?.windowAreaM2 == null ? "Set the number of windows above to compute this." : undefined}>
              <CompoundField
                value={dispWindowArea}
                unit={areaUnit} onUnitChange={setAreaUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 6 — Drywall amount
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={amountOpen} onToggle={() => setAmountOpen(!amountOpen)} title="Drywall amount" />
        {amountOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Net room area" hint="Gross room area minus the total door and window area."
              note={result?.netAreaM2 == null ? "Complete the sections above to compute the net area." : undefined}>
              <CompoundField
                value={dispNetArea}
                unit={areaUnit} onUnitChange={setAreaUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            <Field label="Select drywall panel size">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={panelSizeId}
                  onChange={(e) => setPanelSizeId(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                  }}
                >
                  <option value="">Select</option>
                  {PANEL_SIZES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </Field>

            <Divider />

            <Field label="Cost per panel">
              <PriceRow
                value={costPerPanel}
                onChange={setCostPerPanel}
                currency={costCur}
                onCurrencyChange={setCostCur}
              />
            </Field>

            <Divider />

            <Field label="Number of panels"
              hint="Net room area ÷ panel area, rounded up to the next whole panel."
              note={result?.panelCount == null ? "Select a panel size above to compute this." : undefined}>
              <PlainCount value={dispPanelCount} />
            </Field>

            <Divider />

            <Field label="Total cost" hint="Number of panels × cost per panel."
              note={dispTotalCost === "" ? "Enter a cost per panel above to calculate." : undefined}>
              <PriceRow
                value={dispTotalCost}
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
          INFO CARD — How is drywall calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate drywall materials?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Sloped wall area = Number of spaces × (Base × Height ÷ 2)",
            "Gross room area  = (2 × (Length + Width) × Height) + Ceiling (if included) + Sloped wall area",
            "Doors area       = Number of doors × Door height × Door width",
            "Windows area     = Number of windows × Window height × Window width",
            "Net room area    = Gross room area − Doors area − Windows area",
            "Number of panels = ⌈ Net room area (m²) ÷ Panel area (m²) ⌉",
            "Total cost       = Number of panels × Cost per panel",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          The <strong>net room area</strong> is the total drywall-covered surface — every wall, plus the ceiling if you're
          boarding it, plus any sloped-wall (attic/dormer) triangular sections, minus door and window openings. The{" "}
          <strong>number of panels</strong> is rounded up to the next whole sheet. Panel sizes range from 600 × 900 mm
          up to 1200 × 3000 mm — it's a good idea to buy about <strong>10% extra</strong> to cover cuts, waste, and
          future repairs.
        </p>
      </div>

    </div>
  );
}

// ── Plain output (no unit selector) — used for the panel count ────
function PlainCount({ value, placeholder = "—" }) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: "1.5px solid #bfdbfe", borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input readOnly type="text" value={value} placeholder={placeholder} style={OUTPUT_BASE} />
    </div>
  );
}
