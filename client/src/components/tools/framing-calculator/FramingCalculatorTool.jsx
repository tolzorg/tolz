import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, SPACING_UNITS, CURRENCIES,
  DEFAULT_OC_SPACING_CM, DEFAULT_WASTE_PCT,
  toLengthM, toSpacingM,
  calcFraming, fmtFraming,
} from "../../../utils/framingCalc";
import StudWallDiagram from "./StudWallDiagram";

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
export default function FramingCalculatorTool() {

  // ── Wall + studs ───────────────────────────────────────────────────
  const [wallLength, setWallLength] = useState("");
  const [lenUnit,    setLenUnit]    = useState("m");
  const [ocSpacing,  setOcSpacing]  = useState(String(DEFAULT_OC_SPACING_CM));
  const [spacingUnit,setSpacingUnit]= useState("cm");

  // ── Stud cost ──────────────────────────────────────────────────────
  const [pricePerStud, setPricePerStud] = useState("");
  const [priceCur,      setPriceCur]    = useState("PKR");
  const [waste,         setWaste]       = useState(String(DEFAULT_WASTE_PCT));
  const [costCur,       setCostCur]     = useState("PKR");

  // ── Section open state ────────────────────────────────────────────
  const [wallOpen, setWallOpen] = useState(true);
  const [costOpen, setCostOpen] = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  // ── Derive SI values ──────────────────────────────────────────────
  const wallLengthM = useMemo(() => toLengthM(wallLength, lenUnit), [wallLength, lenUnit]);
  const ocSpacingM  = useMemo(() => toSpacingM(ocSpacing, spacingUnit), [ocSpacing, spacingUnit]);
  const wastePct    = useMemo(() => {
    const v = parseFloat(waste);
    return isFinite(v) && v >= 0 ? v : 0;
  }, [waste]);
  const pricePerStudNum = useMemo(() => {
    const v = parseFloat(pricePerStud);
    return isFinite(v) && v > 0 ? v : null;
  }, [pricePerStud]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcFraming({
    wallLengthM, ocSpacingM, wastePct, pricePerStud: pricePerStudNum,
  }), [wallLengthM, ocSpacingM, wastePct, pricePerStudNum]);

  // ── Display values ────────────────────────────────────────────────
  const dispStuds = result ? String(result.studsNeeded) : "";
  const dispCost  = result?.totalCost != null ? fmtFraming(result.totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const lenErr = touched.len && (wallLength === "" || parseFloat(wallLength) <= 0)
    ? "Please enter a positive value for the wall length." : null;
  const ocErr = touched.oc && (ocSpacing === "" || parseFloat(ocSpacing) <= 0)
    ? "Please enter a positive OC spacing value." : null;
  const wasteErr = touched.waste && waste !== "" && parseFloat(waste) < 0
    ? "Waste can't be negative." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setWallLength(""); setOcSpacing(String(DEFAULT_OC_SPACING_CM));
    setPricePerStud(""); setWaste(String(DEFAULT_WASTE_PCT));
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setLenUnit("m"); setSpacingUnit("cm");
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
          SECTION 1 — Wall & studs
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>

        {/* Diagram */}
        <div style={{ background: "var(--bg-muted)", padding: "16px 18px" }}>
          <StudWallDiagram />
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          <Field label="Wall length" error={lenErr}>
            <CompoundField
              value={wallLength} onChange={setWallLength} onBlur={() => touch("len")}
              unit={lenUnit} onUnitChange={setLenUnit} units={LENGTH_UNITS}
              placeholder="e.g. 5" hasError={!!lenErr}
            />
          </Field>

          <Divider />

          <Field label="OC spacing" error={ocErr}
            hint="On-center spacing between studs. Standard framing uses 16″, 19.2″, or 24″ — about 40, 49, or 60 cm.">
            <CompoundField
              value={ocSpacing} onChange={setOcSpacing} onBlur={() => touch("oc")}
              unit={spacingUnit} onUnitChange={setSpacingUnit} units={SPACING_UNITS}
              placeholder="e.g. 40" hasError={!!ocErr}
            />
          </Field>

          <Divider />

          <Field label="Studs needed"
            hint="Studs needed = ⌈Wall length ÷ OC spacing⌉ + 1."
            note={result === null ? "Enter the wall length and OC spacing above to compute this." : undefined}>
            <CompoundField value={dispStuds} placeholder="—" isOutput unitLabel="studs" />
          </Field>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Stud cost
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="Stud cost" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Price per stud">
              <PriceRow
                value={pricePerStud}
                onChange={setPricePerStud}
                currency={priceCur}
                onCurrencyChange={(c) => { setPriceCur(c); setCostCur(c); }}
              />
            </Field>

            <Divider />

            <Field label="Estimated waste" error={wasteErr}
              hint="Extra studs to cover cutting mistakes, damaged pieces, and layout changes. Typical: 15%.">
              <CompoundField
                value={waste} onChange={setWaste} onBlur={() => touch("waste")}
                unitLabel="%" placeholder="15" hasError={!!wasteErr}
              />
            </Field>

            <Divider />

            <Field label="Total cost"
              hint="Total cost = ⌈Studs needed × (1 + Waste ÷ 100)⌉ × Price per stud."
              note={dispCost === "" ? "Enter a price per stud above to calculate." : undefined}>
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
          INFO CARD — How is framing calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate studs needed?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Studs needed = ⌈Wall length ÷ OC spacing⌉ + 1",
            "Total cost   = ⌈Studs needed × (1 + Waste ÷ 100)⌉ × Price per stud",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          The <strong>+1</strong> accounts for the extra stud needed at the starting end of the wall — with studs
          spaced on-center, a wall needs one more stud than the number of spacing intervals it contains. Standard
          on-center (OC) spacing is <strong>16″, 19.2″, or 24″</strong> (about 40, 49, or 60 cm). The default{" "}
          <strong>15% waste</strong> covers cutting mistakes, damaged studs, and layout changes — it's applied only
          when estimating cost, not the raw stud count.
        </p>
      </div>

    </div>
  );
}
