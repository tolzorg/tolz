import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, AREA_OUT_UNITS,
  BOARD_WIDTHS_STANDARD, BOARD_WIDTHS_SQUARE, FASTENER_TYPES, CURRENCIES,
  toLengthM, fromM2, fromLengthM,
  calcDecking, fmtDeck,
} from "../../../utils/deckingCalc";

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
  disabled = false,
}) {
  const actual_output = isOutput || disabled;
  const borderColor = actual_output ? "#bfdbfe" : hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
      opacity: disabled && !isOutput ? 0.6 : 1,
    }}>
      <input
        type={isOutput ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={actual_output}
        placeholder={placeholder}
        onChange={onChange && !disabled ? (e) => onChange(e.target.value) : undefined}
        onBlur={!actual_output ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : INPUT_BASE}
      />
      <select value={unit} onChange={(e) => onUnitChange(e.target.value)} disabled={disabled && !isOutput}
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

// ── Plain number output (no unit selector) ────────────────────────
function PlainOutput({ value, placeholder = "—" }) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: "1.5px solid #bfdbfe", borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input readOnly type="text" value={value} placeholder={placeholder} style={OUTPUT_BASE} />
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
export default function DeckingCalculatorTool() {

  // ── Deck size inputs ───────────────────────────────────────────────
  const [length,      setLength]      = useState("");
  const [lenUnit,     setLenUnit]     = useState("ft");
  const [width,       setWidth]       = useState("");
  const [widUnit,     setWidUnit]     = useState("ft");
  const [areaOutUnit, setAreaOutUnit] = useState("ft2");

  // ── Decking board specifications ──────────────────────────────────
  const [squareProfile,  setSquareProfile]  = useState(false);
  const [boardWidthId,   setBoardWidthId]   = useState("140mm");
  const [customWidth,    setCustomWidth]    = useState("");
  const [customWidthUnit,setCustomWidthUnit]= useState("mm");
  const [boardLength,    setBoardLength]    = useState("");
  const [boardLenUnit,   setBoardLenUnit]   = useState("ft");

  // ── Fasteners ──────────────────────────────────────────────────────
  const [fastenerType, setFastenerType] = useState("screws");

  // ── Cost inputs ───────────────────────────────────────────────────
  const [pricePerBoard,   setPricePerBoard]   = useState("");
  const [pricePerBoardCur,setPricePerBoardCur]= useState("USD");
  const [fastenerCost,    setFastenerCost]    = useState("");
  const [fastenerCostCur, setFastenerCostCur] = useState("USD");
  const [costCur,         setCostCur]         = useState("USD");

  // ── Section open state ────────────────────────────────────────────
  const [sizeOpen,   setSizeOpen]   = useState(true);
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [resultOpen, setResultOpen] = useState(true);
  const [costOpen,   setCostOpen]   = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const boardWidthOptions = squareProfile ? BOARD_WIDTHS_SQUARE : BOARD_WIDTHS_STANDARD;
  const isCustomWidth = boardWidthId === "custom";

  // ── Square profile toggle — keep the width preset valid for the list ──
  const handleSquareProfileToggle = (checked) => {
    setSquareProfile(checked);
    const list = checked ? BOARD_WIDTHS_SQUARE : BOARD_WIDTHS_STANDARD;
    if (!list.find((w) => w.id === boardWidthId)) {
      setBoardWidthId(checked ? "30cm" : "140mm");
    }
  };

  // ── Derive SI values ──────────────────────────────────────────────
  const lengthM = useMemo(() => toLengthM(length, lenUnit), [length, lenUnit]);
  const widthM  = useMemo(() => toLengthM(width, widUnit),  [width, widUnit]);

  const boardWidthPreset = useMemo(
    () => boardWidthOptions.find((w) => w.id === boardWidthId),
    [boardWidthOptions, boardWidthId]
  );
  const boardWidthM = useMemo(() => {
    if (isCustomWidth) return toLengthM(customWidth, customWidthUnit);
    return boardWidthPreset?.m ?? null;
  }, [isCustomWidth, customWidth, customWidthUnit, boardWidthPreset]);

  // Square profile boards: length equals width, so the length field mirrors it.
  const boardLengthM = useMemo(() => {
    if (squareProfile) return boardWidthM;
    return toLengthM(boardLength, boardLenUnit);
  }, [squareProfile, boardWidthM, boardLength, boardLenUnit]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcDecking({
    lengthM, widthM, boardLengthM, boardWidthM, fastenerType,
  }), [lengthM, widthM, boardLengthM, boardWidthM, fastenerType]);

  // ── Display values ────────────────────────────────────────────────
  const dispArea = result ? fmtDeck(fromM2(result.areaM2, areaOutUnit), 4) : "";
  const dispBoardLength = squareProfile
    ? fmtDeck(fromLengthM(boardWidthM, boardLenUnit), 4)
    : boardLength;
  const dispBoardCount = result?.boardCount != null ? String(result.boardCount) : "";
  const dispFastenerCount = result?.fastenerCount != null ? String(result.fastenerCount) : "";

  // ── Cost ──────────────────────────────────────────────────────────
  const boardCount = result?.boardCount ?? null;
  const priceForAllBoards = useMemo(() => {
    const p = parseFloat(pricePerBoard);
    if (isFinite(p) && p > 0 && boardCount != null) return p * boardCount;
    return null;
  }, [pricePerBoard, boardCount]);

  const totalCost = useMemo(() => {
    const boards = priceForAllBoards ?? 0;
    const fasteners = parseFloat(fastenerCost);
    const fastenersVal = isFinite(fasteners) && fasteners > 0 ? fasteners : 0;
    if (priceForAllBoards === null && fastenersVal === 0) return null;
    return boards + fastenersVal;
  }, [priceForAllBoards, fastenerCost]);

  const dispPriceForAllBoards = priceForAllBoards !== null ? fmtDeck(priceForAllBoards, 2) : "";
  const dispTotalCost = totalCost !== null ? fmtDeck(totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const lenErr = touched.len && (length === "" || parseFloat(length) <= 0)
    ? "Please enter a positive value for the length." : null;
  const widErr = touched.wid && (width === "" || parseFloat(width) <= 0)
    ? "Please enter a positive value for the width." : null;
  const boardLenErr = !squareProfile && touched.blen && (boardLength === "" || parseFloat(boardLength) <= 0)
    ? "Please enter a positive value for the board length." : null;
  const customWidthErr = isCustomWidth && touched.bwid && (customWidth === "" || parseFloat(customWidth) <= 0)
    ? "Please enter a positive board width." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setLength(""); setWidth(""); setBoardLength(""); setCustomWidth("");
    setPricePerBoard(""); setFastenerCost("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setSquareProfile(false); setBoardWidthId("140mm");
    setCustomWidthUnit("mm"); setBoardLenUnit("ft");
    setLenUnit("ft"); setWidUnit("ft"); setAreaOutUnit("ft2");
    setFastenerType("screws");
    setPricePerBoardCur("USD"); setFastenerCostCur("USD"); setCostCur("USD");
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
          SECTION 1 — Size of your deck
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={sizeOpen} onToggle={() => setSizeOpen(!sizeOpen)}
          title="Size of your deck" />
        {sizeOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Length + Width side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Length" error={lenErr}>
                <CompoundField
                  value={length} onChange={setLength} onBlur={() => touch("len")}
                  unit={lenUnit} onUnitChange={setLenUnit} units={LENGTH_UNITS}
                  placeholder="e.g. 12" hasError={!!lenErr}
                />
              </Field>
              <Field label="Width" error={widErr}>
                <CompoundField
                  value={width} onChange={setWidth} onBlur={() => touch("wid")}
                  unit={widUnit} onUnitChange={setWidUnit} units={LENGTH_UNITS}
                  placeholder="e.g. 12" hasError={!!widErr}
                />
              </Field>
            </div>

            <Divider />

            {/* Square footage — output */}
            <Field label="Square footage (area)"
              hint="Computed as Length × Width — the total surface area of your deck."
              note={result === null ? "Enter length and width to compute the deck area." : undefined}>
              <CompoundField
                value={dispArea}
                unit={areaOutUnit} onUnitChange={setAreaOutUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Size of decking boards
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={boardsOpen} onToggle={() => setBoardsOpen(!boardsOpen)}
          title="Size of decking boards" />
        {boardsOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Square profile checkbox */}
            <label style={{
              display: "flex", alignItems: "center", gap: 9, cursor: "pointer",
              padding: "9px 13px", borderRadius: RADIUS,
              background: squareProfile ? "var(--accent-light)" : "var(--bg-muted)",
              border: `1.5px solid ${squareProfile ? "var(--accent)" : BORDER}`,
              transition: "all 0.15s",
            }}>
              <input
                type="checkbox" checked={squareProfile}
                onChange={(e) => handleSquareProfileToggle(e.target.checked)}
                style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
              />
              <span style={{
                fontFamily: FONT, fontWeight: squareProfile ? 700 : 500, fontSize: 13,
                color: squareProfile ? "var(--accent)" : "var(--text-primary)",
              }}>
                I want to use square profiles
              </span>
            </label>

            <Divider />

            {/* Board width */}
            <Field label="Select board width"
              hint="Width of a single decking board. Choose a preset size, or Custom to enter your own.">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={boardWidthId}
                  onChange={(e) => setBoardWidthId(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                  }}
                >
                  {boardWidthOptions.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                </select>
              </div>
            </Field>

            {isCustomWidth && (
              <Field label="Custom board width" error={customWidthErr}>
                <CompoundField
                  value={customWidth} onChange={setCustomWidth} onBlur={() => touch("bwid")}
                  unit={customWidthUnit} onUnitChange={setCustomWidthUnit} units={LENGTH_UNITS}
                  placeholder="e.g. 140" hasError={!!customWidthErr}
                />
              </Field>
            )}

            <Divider />

            {/* Board length */}
            <Field label="Enter board length"
              hint={squareProfile
                ? "Square-profile decking tiles have equal length and width, so this matches the board width above."
                : "Length of a single decking board, e.g. as sold at your lumber yard."}
              error={boardLenErr}>
              <CompoundField
                value={squareProfile ? dispBoardLength : boardLength}
                onChange={squareProfile ? undefined : setBoardLength}
                onBlur={() => touch("blen")}
                unit={boardLenUnit} onUnitChange={setBoardLenUnit} units={LENGTH_UNITS}
                placeholder="e.g. 8" hasError={!!boardLenErr}
                disabled={squareProfile}
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Results – Material estimations
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={resultOpen} onToggle={() => setResultOpen(!resultOpen)}
          title="Results – Material estimations" />
        {resultOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Number of boards — output */}
            <Field label="Number of boards"
              hint="Deck area ÷ board area, plus 10% extra for waste and offcuts."
              note={result?.boardCount == null ? "Enter the deck size and board dimensions above." : undefined}>
              <PlainOutput value={dispBoardCount} />
            </Field>

            <Divider />

            {/* Fasteners used */}
            <Field label="Fasteners used">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FASTENER_TYPES.map((f) => {
                  const selected = fastenerType === f.id;
                  return (
                    <label key={f.id} style={{
                      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      padding: "9px 13px", borderRadius: RADIUS,
                      background: selected ? "var(--accent-light)" : "var(--bg-muted)",
                      border: `1.5px solid ${selected ? "var(--accent)" : BORDER}`,
                      transition: "border-color 0.15s, background 0.15s",
                    }}>
                      <input
                        type="radio" name="fastener-type" value={f.id} checked={selected}
                        onChange={() => setFastenerType(f.id)}
                        style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
                      />
                      <span style={{
                        fontFamily: FONT, fontWeight: selected ? 700 : 500,
                        fontSize: 13, color: selected ? "var(--accent)" : "var(--text-primary)",
                      }}>
                        {f.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Divider />

            {/* Number of screws/nails or hidden clips — output */}
            <Field label={fastenerType === "clips" ? "Number of hidden clips" : "Number of screws/nails"}
              hint="Screws/nails: ~3.5 per sq ft. Hidden clips: about half that count."
              note={result === null ? "Enter the deck size above to compute fasteners." : undefined}>
              <PlainOutput value={dispFastenerCount} />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — Cost estimations
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="Cost estimations" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Cost of one board */}
            <Field label="Enter cost of one board"
              hint="Price per single decking board. Used to compute the price for all boards.">
              <PriceRow
                value={pricePerBoard}
                onChange={setPricePerBoard}
                currency={pricePerBoardCur}
                onCurrencyChange={(c) => { setPricePerBoardCur(c); setCostCur(c); }}
              />
            </Field>

            <Divider />

            {/* Price for all boards — output */}
            <Field label="Price for all boards"
              hint="Number of boards × cost of one board."
              note={dispPriceForAllBoards === "" ? "Enter a board price above to calculate." : undefined}>
              <PriceRow
                value={dispPriceForAllBoards}
                currency={pricePerBoardCur}
                onCurrencyChange={() => {}}
                isOutput
              />
            </Field>

            <Divider />

            {/* Total cost of fasteners */}
            <Field label="Enter total cost of fasteners"
              hint="Total price you'll pay for all the screws, nails, or hidden clips.">
              <PriceRow
                value={fastenerCost}
                onChange={setFastenerCost}
                currency={fastenerCostCur}
                onCurrencyChange={(c) => { setFastenerCostCur(c); setCostCur(c); }}
              />
            </Field>

            <Divider />

            {/* Total decking cost — output */}
            <Field label="Total decking cost"
              hint="Price for all boards + total cost of fasteners."
              note={dispTotalCost === "" ? "Enter board and fastener prices above to calculate." : undefined}>
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
          INFO CARD — How is decking calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate decking materials?
        </div>

        {/* Formula box */}
        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Deck area      = Length × Width",
            "Board area     = Board length × Board width",
            "Boards needed  = (Deck area ÷ Board area) × 1.1",
            "Screws/nails   = Deck area (ft²) × 3.5",
            "Hidden clips   = Deck area (ft²) × 1.75",
            "Total cost     = (Boards × Board price) + Fastener cost",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          The <strong>10% waste factor</strong> covers cutting losses, mistakes, and offcuts. The fastener rules of thumb
          assume roughly <strong>3.5 screws or nails per square foot</strong> for face-fastened boards, or about
          <strong> half that count</strong> when using hidden clips in a grooved-edge board. Always check your decking
          manufacturer's spacing recommendations before ordering.
        </p>
      </div>

    </div>
  );
}
