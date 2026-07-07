import { useState, useEffect, useMemo, useRef } from "react";
import {
  LENGTH_UNITS,
  toLengthM, fromLengthM,
  sagFromRadiusDiameter, radiusFromSagDiameter, diameterFromSagRadius,
  fmtSag,
} from "../../../utils/sagCalc";
import SagDiagram from "./SagDiagram";

// ── Style tokens ──────────────────────────────────────────────────
const FONT   = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

const LABEL_STYLE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 13,
  color: "var(--text-primary)", userSelect: "none",
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

// ── Compound input + unit selector ────────────────────────────────
// `computed` gives the field the blue "output" styling without making it
// read-only — the SAG calculator lets the user type into whichever field is
// currently computed, which reassigns the computed role to a different field.
function CompoundField({
  value, onChange, onBlur,
  unit, onUnitChange, units,
  placeholder = "0",
  hasError = false,
  computed = false,
}) {
  const borderColor = computed ? "#bfdbfe" : hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type="number"
        inputMode="decimal" step="any" min="0"
        value={value}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur}
        style={computed ? OUTPUT_BASE : INPUT_BASE}
      />
      <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
        style={{
          ...SELECT_BASE,
          borderLeft: `1.5px solid ${borderColor}`,
          backgroundColor: computed ? "#eff6ff" : "var(--bg-muted)",
          color: computed ? "#1d4ed8" : "var(--text-primary)",
        }}>
        {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

// ── Field: label + optional hint icon + children + error ──────────
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

const Divider = () => <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />;

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function SagCalculatorTool() {

  // ── Inputs ──────────────────────────────────────────────────────
  const [rStr,  setRStr]  = useState("");
  const [rUnit, setRUnit] = useState("m");
  const [dStr,  setDStr]  = useState("");
  const [dUnit, setDUnit] = useState("m");
  const [sStr,  setSStr]  = useState("");
  const [sUnit, setSUnit] = useState("m");

  // Which two fields were most recently edited by the user — the third
  // (not in this list) is the one we keep solving for automatically.
  const [lastEdited, setLastEdited] = useState(["d", "r"]);
  const outputField = ["r", "d", "s"].find((k) => !lastEdited.slice(0, 2).includes(k)) || "s";

  const markEdited = (key) => setLastEdited((prev) => [key, ...prev.filter((k) => k !== key)]);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  // ── Derive SI values (meters) for the two fields that are currently inputs ──
  const rM = useMemo(() => toLengthM(rStr, rUnit), [rStr, rUnit]);
  const dM = useMemo(() => toLengthM(dStr, dUnit), [dStr, dUnit]);
  const sM = useMemo(() => toLengthM(sStr, sUnit), [sStr, sUnit]);

  // ── Recompute whichever field is currently the output ──────────────
  const computedM = useMemo(() => {
    if (outputField === "s") return sagFromRadiusDiameter(rM, dM);
    if (outputField === "r") return radiusFromSagDiameter(sM, dM);
    return diameterFromSagRadius(sM, rM);
  }, [outputField, rM, dM, sM]);

  // Keeps whichever field is currently "computed" in sync with the other two,
  // while still leaving it a normal editable input (not read-only) so the user
  // can type into it directly and make one of the other two fields the output.
  // Guarded by the value-equality checks below, so this settles in one extra
  // pass rather than looping.
  useEffect(() => {
    const unit = outputField === "r" ? rUnit : outputField === "d" ? dUnit : sUnit;
    const display = computedM !== null ? fmtSag(fromLengthM(computedM, unit)) : "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (outputField === "r" && rStr !== display) setRStr(display);
    if (outputField === "d" && dStr !== display) setDStr(display);
    if (outputField === "s" && sStr !== display) setSStr(display);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputField, computedM, rUnit, dUnit, sUnit]);

  // ── Validation ────────────────────────────────────────────────────
  const domainNote = computedM === null && outputField === "s" && rM !== null && dM !== null
    ? "Diameter is too large for this radius of curvature." : null;
  const domainNoteR = computedM === null && outputField === "r" && sM !== null && dM !== null
    ? "Please check the sag and diameter values." : null;
  const domainNoteD = computedM === null && outputField === "d" && sM !== null && rM !== null
    ? "Sag can't be larger than the radius of curvature." : null;

  const rErr = touched.r && outputField !== "r" && (rStr === "" || parseFloat(rStr) <= 0)
    ? "Please enter a positive radius of curvature." : null;
  const dErr = touched.d && outputField !== "d" && (dStr === "" || parseFloat(dStr) <= 0)
    ? "Please enter a positive diameter." : null;
  const sErr = touched.s && outputField !== "s" && (sStr === "" || parseFloat(sStr) <= 0)
    ? "Please enter a positive sag." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setRStr(""); setDStr(""); setSStr("");
    setLastEdited(["d", "r"]);
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setRUnit("m"); setDUnit("m"); setSUnit("m");
  }
  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShared(true);
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShared(false), 2000);
  }

  const noInputsYet = rStr === "" && dStr === "" && sStr === "";

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="card" style={{ overflow: "hidden" }}>

      {/* ── Diagram ───────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-muted)", padding: "16px 18px" }}>
        <SagDiagram />
      </div>

      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Radius of curvature */}
        <Field label="Radius of curvature" error={rErr}
          note={outputField === "r" && domainNoteR ? domainNoteR
            : outputField === "r" && noInputsYet ? "Enter sag and diameter to compute the radius." : undefined}>
          <CompoundField
            value={rStr} onChange={(v) => { setRStr(v); markEdited("r"); }} onBlur={() => touch("r")}
            unit={rUnit} onUnitChange={setRUnit} units={LENGTH_UNITS}
            placeholder="e.g. 10" hasError={!!rErr} computed={outputField === "r"}
          />
        </Field>

        <Divider />

        {/* Diameter */}
        <Field label="Diameter" error={dErr}
          note={outputField === "d" && domainNoteD ? domainNoteD
            : outputField === "d" && noInputsYet ? "Enter sag and radius to compute the diameter." : undefined}>
          <CompoundField
            value={dStr} onChange={(v) => { setDStr(v); markEdited("d"); }} onBlur={() => touch("d")}
            unit={dUnit} onUnitChange={setDUnit} units={LENGTH_UNITS}
            placeholder="e.g. 13" hasError={!!dErr} computed={outputField === "d"}
          />
        </Field>

        <Divider />

        {/* SAG (sagitta) */}
        <Field label="SAG (sagitta)" error={sErr}
          hint="The sagitta — how far the arc rises above the chord connecting its two ends."
          note={outputField === "s" && domainNote ? domainNote
            : outputField === "s" && noInputsYet ? "Enter radius and diameter to compute the sag." : undefined}>
          <CompoundField
            value={sStr} onChange={(v) => { setSStr(v); markEdited("s"); }} onBlur={() => touch("s")}
            unit={sUnit} onUnitChange={setSUnit} units={LENGTH_UNITS}
            placeholder="e.g. 2.4" hasError={!!sErr} computed={outputField === "s"}
          />
        </Field>

        <Divider />

        {/* Action buttons — Share (prominent) + Reload/Clear stacked */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleShare} style={{
            flex: "0 0 110px", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 8, padding: "14px 8px", borderRadius: RADIUS,
            fontFamily: FONT, fontWeight: 700, fontSize: 12.5, cursor: "pointer",
            border: `1px solid ${BORDER}`, background: "var(--bg-white)", color: "var(--text-primary)",
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: "50%", background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "white",
            }}>🔗</span>
            {shared ? "Link copied!" : "Share result"}
          </button>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleReload} style={{
              flex: 1, padding: "9px 16px", borderRadius: RADIUS,
              fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
              border: `1px solid ${BORDER}`, background: "var(--bg-white)", color: "var(--text-primary)",
            }}>🔄 Reload calculator</button>
            <button onClick={handleClear} style={{
              flex: 1, padding: "9px 16px", borderRadius: RADIUS,
              fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
              border: `1px solid ${BORDER}`, background: "var(--bg-white)", color: "var(--text-primary)",
            }}>🗑 Clear all changes</button>
          </div>
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
    </div>

      {/* ════════════════════════════════════════════════════════════
          INFO CARD — How is sag calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate SAG?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "SAG = R − √(R² − (D/2)²)",
            "R   = (SAG² + (D/2)²) ÷ (2 × SAG)",
            "D   = 2 × √(2 × R × SAG − SAG²)",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          The <strong>sagitta (SAG)</strong> is the depth of a curved arc — how far it rises above the straight
          chord connecting its two endpoints. Enter any <strong>two</strong> of the three values (radius of
          curvature, diameter, and sag) and the third field updates automatically. This calculator is useful for
          arched openings, curved roofs, cables, and any circular-arc layout where you know two of the three
          measurements.
        </p>
      </div>

    </div>
  );
}
