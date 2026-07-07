import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, FITTING_BENDS,
  toLengthM, fromLengthM,
  calcRollingOffset, fmtRollOff,
} from "../../../utils/rollingOffsetCalc";
import rollingOffsetDiagram from "../../../assets/rolling-offset-calculator/rolling-offset-diagram.png";

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

// ── Field: label + optional hint icon + children + error ──────────
function Field({ label, hint, error, children }) {
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
    </div>
  );
}

const Divider = () => <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />;

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function RollingOffsetCalculatorTool() {

  // ── Inputs ──────────────────────────────────────────────────────
  const [h,     setH]     = useState("");
  const [hUnit, setHUnit] = useState("cm");
  const [v,     setV]     = useState("");
  const [vUnit, setVUnit] = useState("cm");
  const [cUnit, setCUnit] = useState("cm");

  const [bendId,     setBendId]     = useState("45");
  const [customBend, setCustomBend] = useState("");

  const [tUnit, setTUnit] = useState("cm");
  const [rUnit, setRUnit] = useState("cm");

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const isCustomBend = bendId === "custom";
  const bendPreset = useMemo(() => FITTING_BENDS.find((b) => b.id === bendId), [bendId]);
  const bendDeg = useMemo(() => {
    if (isCustomBend) {
      const d = parseFloat(customBend);
      return isFinite(d) && d > 0 && d <= 90 ? d : null;
    }
    return bendPreset?.deg ?? null;
  }, [isCustomBend, customBend, bendPreset]);

  // ── Derive SI values ──────────────────────────────────────────────
  const hM = useMemo(() => toLengthM(h, hUnit), [h, hUnit]);
  const vM = useMemo(() => toLengthM(v, vUnit), [v, vUnit]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcRollingOffset({ hM, vM, bendDeg }), [hM, vM, bendDeg]);

  // ── Display values ────────────────────────────────────────────────
  const dispC = result ? fmtRollOff(fromLengthM(result.trueOffsetM, cUnit)) : "";
  const dispT = result ? fmtRollOff(fromLengthM(result.travelM, tUnit))    : "";
  const dispR = result ? fmtRollOff(fromLengthM(result.runM, rUnit))       : "";

  // ── Validation ────────────────────────────────────────────────────
  const hErr = touched.h && (h === "" || parseFloat(h) <= 0)
    ? "Please enter a positive horizontal offset." : null;
  const vErr = touched.v && (v === "" || parseFloat(v) <= 0)
    ? "Please enter a positive vertical offset." : null;
  const bendErr = isCustomBend && touched.bend
      && (customBend === "" || parseFloat(customBend) <= 0 || parseFloat(customBend) > 90)
    ? "Please enter a bend angle between 0° and 90°." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setH(""); setV(""); setCustomBend("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setHUnit("cm"); setVUnit("cm"); setCUnit("cm"); setTUnit("cm"); setRUnit("cm");
    setBendId("45");
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
    <div className="card" style={{ overflow: "hidden" }}>

      {/* ── Diagram ───────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-muted)", padding: "16px 18px" }}>
        <img src={rollingOffsetDiagram} alt="Rolling offset geometry: roll (R), set (V), true offset (C), fitting bend, travel (T), and run"
          style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Roll / horizontal offset (h) */}
        <Field label="Roll or horizontal offset (h)" error={hErr}>
          <CompoundField
            value={h} onChange={setH} onBlur={() => touch("h")}
            unit={hUnit} onUnitChange={setHUnit} units={LENGTH_UNITS}
            placeholder="e.g. 100" hasError={!!hErr}
          />
        </Field>

        <Divider />

        {/* Set / vertical offset (v) */}
        <Field label="Set or vertical offset (v)" error={vErr}>
          <CompoundField
            value={v} onChange={setV} onBlur={() => touch("v")}
            unit={vUnit} onUnitChange={setVUnit} units={LENGTH_UNITS}
            placeholder="e.g. 50" hasError={!!vErr}
          />
        </Field>

        <Divider />

        {/* True offset (c) — output */}
        <Field label="True offset (c)">
          <CompoundField
            value={dispC}
            unit={cUnit} onUnitChange={setCUnit} units={LENGTH_UNITS}
            placeholder="—" isOutput
          />
        </Field>

        <Divider />

        {/* Fitting bend */}
        <Field label="Fitting bend"
          hint="The angle of the elbow fittings used to make the offset. 45° is the most common; 90° routes the offset with a single diagonal run.">
          <div style={{
            display: "flex", alignItems: "stretch",
            border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
          }}>
            <select
              value={bendId}
              onChange={(e) => setBendId(e.target.value)}
              style={{
                ...SELECT_BASE,
                width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                background: "var(--bg-white)", color: "var(--text-primary)",
                fontFamily: FONT, fontWeight: 700, fontSize: 14,
              }}
            >
              {FITTING_BENDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </div>
        </Field>

        {isCustomBend && (
          <Field label="Custom fitting bend angle" error={bendErr}>
            <div style={{
              display: "flex", alignItems: "stretch",
              border: `1.5px solid ${bendErr ? "var(--error)" : BORDER}`, borderRadius: RADIUS, overflow: "hidden",
            }}>
              <input
                type="number" inputMode="decimal" step="any" min="0" max="90"
                value={customBend}
                onChange={(e) => setCustomBend(e.target.value)}
                onBlur={() => touch("bend")}
                placeholder="e.g. 30"
                style={INPUT_BASE}
              />
              <span style={{
                display: "flex", alignItems: "center", padding: "0 13px",
                borderLeft: `1.5px solid ${bendErr ? "var(--error)" : BORDER}`,
                background: "var(--bg-muted)", color: "var(--text-muted)",
                fontFamily: FONT, fontSize: 13, fontWeight: 600,
              }}>°</span>
            </div>
          </Field>
        )}

        <Divider />

        {/* Travel (T) — output */}
        <Field label="Travel (T)"
          hint="The length of pipe needed to span the true offset at the chosen fitting bend angle: T = c ÷ sin(angle).">
          <CompoundField
            value={dispT}
            unit={tUnit} onUnitChange={setTUnit} units={LENGTH_UNITS}
            placeholder="—" isOutput
          />
        </Field>

        <Divider />

        {/* Run (R) — output */}
        <Field label="Run (R)">
          <CompoundField
            value={dispR}
            unit={rUnit} onUnitChange={setRUnit} units={LENGTH_UNITS}
            placeholder="—" isOutput
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
          INFO CARD — How is rolling offset calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate a rolling offset?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "True offset (c) = √(h² + v²)",
            "Travel (T)      = c ÷ sin(fitting bend angle)",
            "Run (R)         = c ÷ tan(fitting bend angle)",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          A <strong>rolling offset</strong> happens when a pipe needs to be offset in both the horizontal
          (<strong>roll</strong>) and vertical (<strong>set</strong>) directions at once — for example, to
          route around an obstruction. The <strong>true offset (c)</strong> is the straight-line distance
          between the two pipe centerlines, found with the Pythagorean theorem. The <strong>fitting bend</strong> is
          the angle of the elbows used to make the offset — 45° is the most common; 22½° and 60° are also standard,
          and 90° collapses the offset into a single diagonal run with no straight <strong>run (R)</strong> segment.
        </p>
      </div>

    </div>
  );
}
