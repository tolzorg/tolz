import { useState, useMemo, useEffect, useRef } from "react";
import {
  BAL_LENGTH_UNITS, BAL_WIDTH_UNITS, BAL_OUT_UNITS,
  MEASURE_METHODS, LAYOUT_METHODS, CALC_MODES,
  DEFAULT_MAX_OPENING_M,
  toMeters, convertOut, fmtBal,
  calcBaluster, calcStairAngle,
  validatePositive, validateNonNeg, validateAngle,
} from "../../../utils/balusterCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";

// ── Design tokens ─────────────────────────────────────────────────
const LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 7,
  userSelect: "none",
};

const INPUT = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--text-primary)",
  background: "var(--bg-white)",
  outline: "none",
  transition: "border-color var(--transition)",
  boxSizing: "border-box",
};

const SELECT = {
  ...INPUT,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

// ── Shared primitives ─────────────────────────────────────────────

function SectionCard({ id, title, icon, open, onToggle, children }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "15px 20px",
          background: "none", border: "none",
          borderBottom: open ? "1px solid var(--border)" : "none",
          cursor: "pointer", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 14, color: "var(--text-primary)",
          textAlign: "left", transition: "background var(--transition)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          {title}
        </span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ padding: "18px 20px" }}>{children}</div>}
    </div>
  );
}

function FieldGroup({ label, error, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && (
          <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>
        )}
      </div>
      {children}
      {error && (
        <p style={{ fontSize: 11.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 5 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function NumUnit({ value, onChange, onBlur, unit, onUnitChange, units, placeholder, hasError }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        type="number" inputMode="decimal" min="0" step="any"
        value={value} placeholder={placeholder || "0"}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = hasError ? "var(--error)" : "var(--accent)")}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "var(--error)" : "var(--border)";
          if (onBlur) onBlur();
        }}
        style={{ ...INPUT, flex: "1 1 80px", minWidth: 0, borderColor: hasError ? "var(--error)" : "var(--border)" }}
      />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 72 }}
      >
        {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, accent, badge, badgeColor }) {
  return (
    <div className="card" style={{ padding: "16px 18px", flex: "1 1 130px", minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11,
        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {label}
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 6px",
            borderRadius: 20, background: badgeColor || "#f0fdf4", color: badge === "PASS" ? "#16a34a" : "#dc2626",
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 800,
        fontSize: "clamp(18px, 4vw, 26px)",
        color: accent ? "var(--accent)" : "var(--text-primary)",
        letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        {value}
      </div>
      {unit && (
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5,
          color: "var(--text-muted)", marginTop: 4,
        }}>
          {unit}
        </div>
      )}
    </div>
  );
}

function FormulaBox({ text }) {
  return (
    <div style={{
      background: "var(--bg-muted)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "11px 16px",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: "clamp(12px, 2vw, 13.5px)", color: "var(--text-primary)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

// ── SVG Diagrams ──────────────────────────────────────────────────

function StraightDiagram({ result }) {
  const W = 280, H = 100;
  const railH = 7, railY = 10;
  const postW = 18, postH = 76;
  const balH = 62, balW_px = 8;
  const innerW = W - 2 * postW;

  const nShow = result ? Math.min(result.totalBalusters, 7) : 5;
  const positions = Array.from({ length: nShow }, (_, i) => {
    const t = (i + 0.5) / nShow;
    return postW + t * innerW - balW_px / 2;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Top rail */}
      <rect x="0" y={railY} width={W} height={railH} rx="3" fill="#475569" />
      {/* Bottom base */}
      <rect x="0" y={H - 12} width={W} height={7} rx="2" fill="#e2e8f0" />
      {/* Left post */}
      <rect x="0" y={railY} width={postW} height={postH} rx="2" fill="#64748b" />
      {/* Right post */}
      <rect x={W - postW} y={railY} width={postW} height={postH} rx="2" fill="#64748b" />
      {/* Balusters */}
      {positions.map((x, i) => (
        <rect key={i} x={x} y={railY + railH} width={balW_px} height={balH - railH} rx="2" fill="#94a3b8" />
      ))}
      {/* Gap dimension line between first two balusters */}
      {positions.length >= 2 && (() => {
        const x1 = positions[0] + balW_px, x2 = positions[1];
        const y = railY + railH + (balH - railH) / 2;
        return (
          <>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke="#3b82f6" strokeWidth="1.2" />
            <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="#3b82f6" strokeWidth="1.2" />
            <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke="#3b82f6" strokeWidth="1.2" />
            <text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle"
              fontFamily="sans-serif" fontSize="8" fill="#3b82f6">gap</text>
          </>
        );
      })()}
      {/* Left margin dimension */}
      {positions.length >= 1 && (() => {
        const x1 = postW, x2 = positions[0];
        if (x2 - x1 < 4) return null;
        const y = railY + railH + 10;
        return (
          <>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
            <text x={(x1 + x2) / 2} y={y - 2} textAnchor="middle"
              fontFamily="sans-serif" fontSize="7" fill="#f59e0b">margin</text>
          </>
        );
      })()}
    </svg>
  );
}

function StairDiagram({ result }) {
  const W = 280, H = 110;
  const postW = 18;
  const topY = 12, botY = H - 14;
  const innerW = W - 2 * postW;

  const nShow = result ? Math.min(result.totalBalusters, 6) : 4;
  const positions = Array.from({ length: nShow }, (_, i) => {
    const t = (i + 0.5) / nShow;
    return postW + t * innerW;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Floor */}
      <line x1="0" y1={botY} x2={W} y2={botY} stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
      {/* Inclined top rail */}
      <line x1={postW} y1={botY - 10} x2={W - postW} y2={topY} stroke="#475569" strokeWidth="7" strokeLinecap="round" />
      {/* Balusters (vertical from floor to rail) */}
      {positions.map((cx, i) => {
        const t = (cx - postW) / innerW;
        const topOfRail = (botY - 10) - t * ((botY - 10) - topY);
        return (
          <line key={i} x1={cx} y1={topOfRail + 3} x2={cx} y2={botY}
            stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
        );
      })}
      {/* Angle arc */}
      <path
        d={`M ${postW + 36} ${botY} A 36 36 0 0 0 ${postW + 36 * Math.cos(30 * Math.PI / 180)} ${botY - 36 * Math.sin(30 * Math.PI / 180)}`}
        fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2"
      />
      <text x={postW + 28} y={botY - 14}
        fontFamily="sans-serif" fontSize="11" fill="#3b82f6" fontWeight="bold">θ</text>
    </svg>
  );
}

// ── Price unit set for balusters ──────────────────────────────────

export const BALUSTER_PRICE_UNITS = [
  { id: "each", label: "per baluster", display: "baluster" },
  { id: "pack", label: "per pack",     display: "pack"     },
  { id: "box",  label: "per box",      display: "box"      },
];

// ── Main component ────────────────────────────────────────────────

const INIT_SECTIONS = new Set(["mode", "measurements"]);

export default function BalusterCalculatorTool() {
  const [mode, setMode]                       = useState("straight");
  const [measureMethod, setMeasureMethod]     = useState("clearOpening");
  const [clearOpening, setClearOpening]       = useState("");
  const [clearOpeningUnit, setClearOpeningUnit] = useState("ft");
  const [overallLength, setOverallLength]     = useState("");
  const [overallLengthUnit, setOverallLengthUnit] = useState("ft");
  const [leftPostWidth, setLeftPostWidth]     = useState("");
  const [leftPostWidthUnit, setLeftPostWidthUnit] = useState("in");
  const [rightPostWidth, setRightPostWidth]   = useState("");
  const [rightPostWidthUnit, setRightPostWidthUnit] = useState("in");
  const [balusterWidth, setBalusterWidth]     = useState("");
  const [balusterWidthUnit, setBalusterWidthUnit] = useState("in");
  const [layoutMethod, setLayoutMethod]       = useState("equalEndMargins");
  const [leftOffset, setLeftOffset]           = useState("");
  const [leftOffsetUnit, setLeftOffsetUnit]   = useState("in");
  const [rightOffset, setRightOffset]         = useState("");
  const [rightOffsetUnit, setRightOffsetUnit] = useState("in");
  const [maxOpeningChoice, setMaxOpeningChoice] = useState("4inch");
  const [customMaxOpening, setCustomMaxOpening] = useState("");
  const [customMaxOpeningUnit, setCustomMaxOpeningUnit] = useState("in");
  const [stairInputMethod, setStairInputMethod] = useState("angle");
  const [stairAngle, setStairAngle]           = useState("");
  const [stairRise, setStairRise]             = useState("");
  const [stairRiseUnit, setStairRiseUnit]     = useState("in");
  const [stairRun, setStairRun]               = useState("");
  const [stairRunUnit, setStairRunUnit]       = useState("in");
  const [outUnit, setOutUnit]                 = useState("in");
  const [packSize, setPackSize]               = useState("");
  const [boxSize, setBoxSize]                 = useState("");
  const [touched, setTouched]                 = useState({});
  const [openSections, setOpenSections]       = useState(INIT_SECTIONS);
  const [copied, setCopied]                   = useState(false);
  const copyTimer                             = useRef(null);

  // ── Derived computations ─────────────────────────────────────

  const clearOpeningM = useMemo(() => {
    if (measureMethod === "clearOpening") {
      return toMeters(clearOpening, clearOpeningUnit, BAL_LENGTH_UNITS);
    }
    const totalM = toMeters(overallLength, overallLengthUnit, BAL_LENGTH_UNITS);
    if (totalM === null) return null;
    const lpM = toMeters(leftPostWidth, leftPostWidthUnit, BAL_WIDTH_UNITS) ?? 0;
    const rpM = toMeters(rightPostWidth, rightPostWidthUnit, BAL_WIDTH_UNITS) ?? 0;
    const co = totalM - lpM - rpM;
    return co > 0 ? co : null;
  }, [measureMethod, clearOpening, clearOpeningUnit, overallLength, overallLengthUnit,
      leftPostWidth, leftPostWidthUnit, rightPostWidth, rightPostWidthUnit]);

  const balusterWidthM = useMemo(
    () => toMeters(balusterWidth, balusterWidthUnit, BAL_WIDTH_UNITS),
    [balusterWidth, balusterWidthUnit]
  );

  const maxOpeningM = useMemo(() => {
    if (maxOpeningChoice === "4inch") return DEFAULT_MAX_OPENING_M;
    return toMeters(customMaxOpening, customMaxOpeningUnit, BAL_WIDTH_UNITS);
  }, [maxOpeningChoice, customMaxOpening, customMaxOpeningUnit]);

  const leftOffsetM = useMemo(
    () => (layoutMethod === "fixedOffsets" ? toMeters(leftOffset, leftOffsetUnit, BAL_WIDTH_UNITS) ?? 0 : 0),
    [layoutMethod, leftOffset, leftOffsetUnit]
  );
  const rightOffsetM = useMemo(
    () => (layoutMethod === "fixedOffsets" ? toMeters(rightOffset, rightOffsetUnit, BAL_WIDTH_UNITS) ?? 0 : 0),
    [layoutMethod, rightOffset, rightOffsetUnit]
  );

  const computedStairAngle = useMemo(() => {
    if (mode !== "stair") return null;
    if (stairInputMethod === "angle") {
      const a = parseFloat(stairAngle);
      return isFinite(a) && a > 0 && a < 90 ? a : null;
    }
    const rM = toMeters(stairRise, stairRiseUnit, BAL_WIDTH_UNITS);
    const nM = toMeters(stairRun, stairRunUnit, BAL_WIDTH_UNITS);
    if (rM === null || nM === null) return null;
    return calcStairAngle(rM, nM);
  }, [mode, stairInputMethod, stairAngle, stairRise, stairRiseUnit, stairRun, stairRunUnit]);

  const result = useMemo(() => calcBaluster({
    clearOpeningM,
    balusterWidthM,
    maxOpeningM,
    layoutMethod,
    leftOffsetM,
    rightOffsetM,
    stairAngleDeg: computedStairAngle,
  }), [clearOpeningM, balusterWidthM, maxOpeningM, layoutMethod, leftOffsetM, rightOffsetM, computedStairAngle]);

  const priceQuantities = useMemo(() => {
    const n = result?.totalBalusters ?? null;
    const ps = parseFloat(packSize);
    const bs = parseFloat(boxSize);
    return {
      each: n,
      pack: (n !== null && ps > 0) ? Math.ceil(n / ps) : null,
      box:  (n !== null && bs > 0) ? Math.ceil(n / bs) : null,
    };
  }, [result, packSize, boxSize]);

  // Display helper
  const disp = (meters, dp = 2) =>
    meters !== null ? fmtBal(convertOut(meters, outUnit), dp) : "—";

  useEffect(() => {
    if (result) {
      setOpenSections((prev) => { const n = new Set(prev); n.add("results"); return n; });
    }
  }, [!!result]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setTouched({}); }, [mode, measureMethod]);

  // ── Actions ──────────────────────────────────────────────────

  const needsStairAngle = mode === "stair";
  const isFixedOffsets  = layoutMethod === "fixedOffsets";

  function toggleSection(id) {
    setOpenSections((prev) => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
    });
  }

  function touch(key) { setTouched((p) => ({ ...p, [key]: true })); }

  function handleReset() {
    setClearOpening(""); setOverallLength(""); setLeftPostWidth(""); setRightPostWidth("");
    setBalusterWidth(""); setLeftOffset(""); setRightOffset(""); setCustomMaxOpening("");
    setStairAngle(""); setStairRise(""); setStairRun(""); setPackSize(""); setBoxSize("");
    setTouched({}); setCopied(false);
  }

  function handleCopy() {
    if (!result) return;
    const outLbl = BAL_OUT_UNITS.find((u) => u.id === outUnit)?.label || outUnit;
    const lines = [
      "Baluster Calculator Results",
      `Mode:              ${CALC_MODES.find((m) => m.id === mode)?.label}`,
      `Layout:            ${LAYOUT_METHODS.find((m) => m.id === layoutMethod)?.label}`,
      `Total Balusters:   ${result.totalBalusters}`,
      `Number of Openings: ${result.numberOfOpenings}`,
      `Actual Clear Gap:  ${disp(result.actualClearOpeningM)} ${outLbl}`,
      `Center-to-Center:  ${disp(result.centerToCenterM)} ${outLbl}`,
      `Left Margin:       ${disp(result.leftMarginM)} ${outLbl}`,
      `Right Margin:      ${disp(result.rightMarginM)} ${outLbl}`,
      `Code Status:       ${result.codePass ? "PASS" : "FAIL"}`,
      result.stairAngleDeg != null ? `Stair Angle:       ${fmtBal(result.stairAngleDeg)}°` : null,
      result.stairSlopeLengthM != null ? `Slope Length:      ${disp(result.stairSlopeLengthM)} ${outLbl}` : null,
      result.spacingAlongSlopeM != null ? `Spacing on Slope:  ${disp(result.spacingAlongSlopeM)} ${outLbl}` : null,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  // Validation
  const coErr      = touched.co      ? validatePositive(clearOpening)    : null;
  const olErr      = touched.ol      ? validatePositive(overallLength)    : null;
  const balWErr    = touched.balW    ? validatePositive(balusterWidth)    : null;
  const loErr      = isFixedOffsets && touched.lo ? validateNonNeg(leftOffset)   : null;
  const roErr      = isFixedOffsets && touched.ro ? validateNonNeg(rightOffset)  : null;
  const cmErr      = maxOpeningChoice === "custom" && touched.cm ? validatePositive(customMaxOpening) : null;
  const angErr     = needsStairAngle && stairInputMethod === "angle" && touched.ang ? validateAngle(stairAngle) : null;
  const riseErr    = needsStairAngle && stairInputMethod === "riseRun" && touched.rise ? validatePositive(stairRise) : null;
  const runErr     = needsStairAngle && stairInputMethod === "riseRun" && touched.run  ? validatePositive(stairRun)  : null;

  const outLbl = BAL_OUT_UNITS.find((u) => u.id === outUnit)?.label || outUnit;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Mode ── */}
      <SectionCard id="mode" title="Railing Mode" icon="🏗️"
        open={openSections.has("mode")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CALC_MODES.map((m) => (
            <label
              key={m.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: `1.5px solid ${mode === m.id ? "var(--accent)" : "var(--border)"}`,
                background: mode === m.id ? "var(--accent-light)" : "var(--bg-white)",
                cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <input
                type="radio" name="bal-mode" value={m.id} checked={mode === m.id}
                onChange={() => setMode(m.id)}
                style={{ marginTop: 2, accentColor: "var(--accent)", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
                  {m.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                  {m.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ── Measurements ── */}
      <SectionCard id="measurements" title="Measurements" icon="📏"
        open={openSections.has("measurements")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* SVG diagram */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{
              flex: "0 0 200px", width: 200, height: 110,
              background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", padding: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {mode === "stair"
                ? <StairDiagram result={result} />
                : <StraightDiagram result={result} />
              }
            </div>

            <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Measurement method */}
              <FieldGroup label="Measurement Method"
                hint="Clear Opening is the direct gap between post faces. Overall Rail Length subtracts post widths for you.">
                <select value={measureMethod} onChange={(e) => setMeasureMethod(e.target.value)}
                  style={{ ...SELECT, width: "100%" }}>
                  {MEASURE_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </FieldGroup>

              {/* Clear opening input */}
              {measureMethod === "clearOpening" && (
                <FieldGroup label="Clear Opening" error={coErr}
                  hint="Horizontal distance between the inside face of the left post and inside face of the right post.">
                  <NumUnit
                    value={clearOpening} onChange={setClearOpening} onBlur={() => touch("co")}
                    unit={clearOpeningUnit} onUnitChange={setClearOpeningUnit}
                    units={BAL_LENGTH_UNITS} placeholder="8"
                    hasError={!!coErr}
                  />
                </FieldGroup>
              )}

              {/* Overall length inputs */}
              {measureMethod === "overallRailLength" && (
                <>
                  <FieldGroup label="Overall Rail Length" error={olErr}
                    hint="Full length of the railing section from outer face of one post to the outer face of the other.">
                    <NumUnit
                      value={overallLength} onChange={setOverallLength} onBlur={() => touch("ol")}
                      unit={overallLengthUnit} onUnitChange={setOverallLengthUnit}
                      units={BAL_LENGTH_UNITS} placeholder="9"
                      hasError={!!olErr}
                    />
                  </FieldGroup>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                      <FieldGroup label="Left Post Width"
                        hint="Horizontal width of the left post (measured in the direction of the railing).">
                        <NumUnit
                          value={leftPostWidth} onChange={setLeftPostWidth}
                          unit={leftPostWidthUnit} onUnitChange={setLeftPostWidthUnit}
                          units={BAL_WIDTH_UNITS} placeholder="3.5"
                        />
                      </FieldGroup>
                    </div>
                    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                      <FieldGroup label="Right Post Width"
                        hint="Horizontal width of the right post. Leave at 0 if not applicable.">
                        <NumUnit
                          value={rightPostWidth} onChange={setRightPostWidth}
                          unit={rightPostWidthUnit} onUnitChange={setRightPostWidthUnit}
                          units={BAL_WIDTH_UNITS} placeholder="3.5"
                        />
                      </FieldGroup>
                    </div>
                  </div>
                </>
              )}

              {/* Baluster width */}
              <FieldGroup label="Baluster Width" error={balWErr}
                hint="Width of one baluster measured in the direction of the railing. Common widths: 1½ in (square wood), 1 in (iron/steel spindles).">
                <NumUnit
                  value={balusterWidth} onChange={setBalusterWidth} onBlur={() => touch("balW")}
                  unit={balusterWidthUnit} onUnitChange={setBalusterWidthUnit}
                  units={BAL_WIDTH_UNITS} placeholder="1.5"
                  hasError={!!balWErr}
                />
              </FieldGroup>

              {/* Stair angle inputs */}
              {needsStairAngle && (
                <>
                  <FieldGroup label="Stair Angle Input Method"
                    hint="Enter the stair pitch directly as an angle, or calculate it from rise and run measurements.">
                    <div style={{ display: "flex", gap: 8 }}>
                      {[{ id: "angle", lbl: "Angle (°)" }, { id: "riseRun", lbl: "Rise / Run" }].map(({ id, lbl }) => (
                        <label key={id} style={{
                          flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                          border: `1.5px solid ${stairInputMethod === id ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: "var(--radius-md)", cursor: "pointer",
                          background: stairInputMethod === id ? "var(--accent-light)" : "var(--bg-white)",
                          transition: "border-color 0.15s, background 0.15s",
                        }}>
                          <input type="radio" name="stair-method" value={id} checked={stairInputMethod === id}
                            onChange={() => setStairInputMethod(id)}
                            style={{ accentColor: "var(--accent)" }} />
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </FieldGroup>

                  {stairInputMethod === "angle" ? (
                    <FieldGroup label="Stair Angle (°)" error={angErr}
                      hint="Angle of the staircase from horizontal. Typical residential stairs: 30°–45°. Must be between 0° and 90°.">
                      <input
                        type="number" inputMode="decimal" min="0" max="89" step="any"
                        value={stairAngle} placeholder="35"
                        onChange={(e) => setStairAngle(e.target.value)}
                        onBlur={() => touch("ang")}
                        onFocus={(e) => (e.target.style.borderColor = angErr ? "var(--error)" : "var(--accent)")}
                        style={{ ...INPUT, borderColor: angErr ? "var(--error)" : "var(--border)" }}
                      />
                    </FieldGroup>
                  ) : (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                        <FieldGroup label="Rise (vertical)" error={riseErr}
                          hint="Vertical height of one stair step.">
                          <NumUnit
                            value={stairRise} onChange={setStairRise} onBlur={() => touch("rise")}
                            unit={stairRiseUnit} onUnitChange={setStairRiseUnit}
                            units={BAL_WIDTH_UNITS} placeholder="7.5"
                            hasError={!!riseErr}
                          />
                        </FieldGroup>
                      </div>
                      <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                        <FieldGroup label="Run (horizontal)" error={runErr}
                          hint="Horizontal depth of one stair step (tread depth).">
                          <NumUnit
                            value={stairRun} onChange={setStairRun} onBlur={() => touch("run")}
                            unit={stairRunUnit} onUnitChange={setStairRunUnit}
                            units={BAL_WIDTH_UNITS} placeholder="10"
                            hasError={!!runErr}
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  )}

                  {/* Computed angle display */}
                  {stairInputMethod === "riseRun" && computedStairAngle !== null && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "var(--bg-muted)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)", padding: "9px 14px",
                    }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        Computed Angle
                      </span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--accent)" }}>
                        {fmtBal(computedStairAngle, 2)}°
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={handleReset}
              style={{ fontSize: 13, padding: "6px 14px", color: "var(--text-muted)" }}>
              ↺ Reset
            </button>
            <button
              className="btn btn-secondary" onClick={handleCopy} disabled={!result}
              style={{
                fontSize: 13, padding: "6px 14px",
                background:  copied ? "#f0fdf4" : undefined,
                color:       copied ? "#16a34a" : undefined,
                borderColor: copied ? "#86efac" : undefined,
                opacity: result ? 1 : 0.45,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {copied ? "✓ Copied!" : "📋 Copy Results"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Layout ── */}
      <SectionCard id="layout" title="Layout Method" icon="📐"
        open={openSections.has("layout")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LAYOUT_METHODS.map((m) => (
            <label
              key={m.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: "var(--radius-md)",
                border: `1.5px solid ${layoutMethod === m.id ? "var(--accent)" : "var(--border)"}`,
                background: layoutMethod === m.id ? "var(--accent-light)" : "var(--bg-white)",
                cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <input
                type="radio" name="bal-layout" value={m.id} checked={layoutMethod === m.id}
                onChange={() => setLayoutMethod(m.id)}
                style={{ marginTop: 2, accentColor: "var(--accent)", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
                  {m.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                  {m.desc}
                </div>
              </div>
            </label>
          ))}

          {/* Fixed offsets inputs */}
          {isFixedOffsets && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
              <div style={{ flex: "1 1 150px", minWidth: 0 }}>
                <FieldGroup label="Left End Offset" error={loErr}
                  hint="Distance from the inside face of the left post to the face of the first baluster. Must be ≤ max allowed opening to comply with code.">
                  <NumUnit
                    value={leftOffset} onChange={setLeftOffset} onBlur={() => touch("lo")}
                    unit={leftOffsetUnit} onUnitChange={setLeftOffsetUnit}
                    units={BAL_WIDTH_UNITS} placeholder="2"
                    hasError={!!loErr}
                  />
                </FieldGroup>
              </div>
              <div style={{ flex: "1 1 150px", minWidth: 0 }}>
                <FieldGroup label="Right End Offset" error={roErr}
                  hint="Distance from the inside face of the right post to the face of the last baluster. Must be ≤ max allowed opening.">
                  <NumUnit
                    value={rightOffset} onChange={setRightOffset} onBlur={() => touch("ro")}
                    unit={rightOffsetUnit} onUnitChange={setRightOffsetUnit}
                    units={BAL_WIDTH_UNITS} placeholder="2"
                    hasError={!!roErr}
                  />
                </FieldGroup>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Building Code ── */}
      <SectionCard id="code" title="Building Code" icon="📋"
        open={openSections.has("code")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FieldGroup label="Maximum Allowed Opening"
            hint="IRC/IBC residential code requires all gaps ≤ 4 inches (100 mm) so a 4-inch sphere cannot pass through. Use Custom for commercial or non-standard requirements.">
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "4inch",  lbl: '4 in (IRC/IBC default)' },
                { id: "custom", lbl: "Custom" },
              ].map(({ id, lbl }) => (
                <label key={id} style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px",
                  border: `1.5px solid ${maxOpeningChoice === id ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  background: maxOpeningChoice === id ? "var(--accent-light)" : "var(--bg-white)",
                  transition: "border-color 0.15s, background 0.15s",
                }}>
                  <input type="radio" name="max-opening" value={id} checked={maxOpeningChoice === id}
                    onChange={() => setMaxOpeningChoice(id)}
                    style={{ accentColor: "var(--accent)" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>{lbl}</span>
                </label>
              ))}
            </div>
          </FieldGroup>

          {maxOpeningChoice === "custom" && (
            <FieldGroup label="Custom Maximum Opening" error={cmErr}
              hint="Maximum clear gap allowed between balusters (and between post and first/last baluster). Check your local building code.">
              <NumUnit
                value={customMaxOpening} onChange={setCustomMaxOpening} onBlur={() => touch("cm")}
                unit={customMaxOpeningUnit} onUnitChange={setCustomMaxOpeningUnit}
                units={BAL_WIDTH_UNITS} placeholder="100"
                hasError={!!cmErr}
              />
            </FieldGroup>
          )}
        </div>
      </SectionCard>

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="📊"
        open={openSections.has("results")} onToggle={toggleSection}>
        {result ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Code status banner */}
            <div style={{
              background: result.codePass ? "#f0fdf4" : "#fef2f2",
              border: `1.5px solid ${result.codePass ? "#86efac" : "#fca5a5"}`,
              borderRadius: "var(--radius-md)", padding: "12px 18px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>{result.codePass ? "✅" : "❌"}</span>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
                  color: result.codePass ? "#16a34a" : "#dc2626",
                }}>
                  Building Code: {result.codePass ? "PASS" : "FAIL"}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                  {result.codePass
                    ? `All gaps ≤ ${fmtBal(convertOut(maxOpeningM, outUnit))} ${outLbl} — 4-inch sphere rule satisfied`
                    : `Some gaps exceed ${fmtBal(convertOut(maxOpeningM, outUnit))} ${outLbl} — does not comply`
                  }
                </div>
              </div>
            </div>

            {/* Output unit selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ ...LBL, marginBottom: 0 }}>Output Unit</label>
              <select value={outUnit} onChange={(e) => setOutUnit(e.target.value)}
                style={{ ...SELECT, width: 90 }}>
                {BAL_OUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>

            {/* Primary result cards */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ResultCard
                label="Total Balusters"
                value={result.totalBalusters}
                unit="balusters required"
                accent
              />
              <ResultCard
                label="Number of Openings"
                value={result.numberOfOpenings}
                unit="gaps (incl. end margins)"
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ResultCard
                label="Actual Clear Gap"
                value={disp(result.actualClearOpeningM)}
                unit={outLbl}
                badge={result.codePass ? "PASS" : "FAIL"}
                badgeColor={result.codePass ? "#dcfce7" : "#fee2e2"}
              />
              <ResultCard
                label="Center-to-Center"
                value={disp(result.centerToCenterM)}
                unit={outLbl}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ResultCard
                label="Left End Margin"
                value={disp(result.leftMarginM)}
                unit={outLbl}
              />
              <ResultCard
                label="Right End Margin"
                value={disp(result.rightMarginM)}
                unit={outLbl}
              />
            </div>

            {/* Stair-specific results */}
            {result.stairAngleDeg !== null && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ResultCard
                  label="Stair Angle"
                  value={`${fmtBal(result.stairAngleDeg, 2)}°`}
                  unit="from horizontal"
                />
                {result.stairSlopeLengthM !== null && (
                  <ResultCard
                    label="Slope Length"
                    value={disp(result.stairSlopeLengthM)}
                    unit={outLbl}
                  />
                )}
                {result.spacingAlongSlopeM !== null && (
                  <ResultCard
                    label="C-to-C Along Slope"
                    value={disp(result.spacingAlongSlopeM)}
                    unit={outLbl}
                  />
                )}
              </div>
            )}

            {/* Summary chips */}
            <div style={{
              background: "var(--bg-muted)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: "12px 16px",
              display: "flex", flexWrap: "wrap", gap: 16,
            }}>
              {[
                ["Layout", LAYOUT_METHODS.find((m) => m.id === layoutMethod)?.label],
                ["Mode",   CALC_MODES.find((m) => m.id === mode)?.label],
                ["Max Opening", `${fmtBal(convertOut(maxOpeningM, outUnit))} ${outLbl}`],
                ["Baluster Width", `${fmtBal(convertOut(balusterWidthM, outUnit))} ${outLbl}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                    {k}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "16px 0", margin: 0 }}>
            Enter valid measurements above to see results.
          </p>
        )}
      </SectionCard>

      {/* ── Pack/Box size inputs for Price Checker ── */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 12 }}>
          Pack & Box Sizes
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 140px", minWidth: 0 }}>
            <FieldGroup label="Balusters per Pack"
              hint="If you buy balusters in packs, enter the number per pack. The price checker will compute packs needed.">
              <input
                type="number" inputMode="numeric" min="1" step="1"
                value={packSize} placeholder="10"
                onChange={(e) => setPackSize(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                style={{ ...INPUT }}
              />
            </FieldGroup>
          </div>
          <div style={{ flex: "1 1 140px", minWidth: 0 }}>
            <FieldGroup label="Balusters per Box"
              hint="If you buy balusters in boxes, enter the number per box. The price checker will compute boxes needed.">
              <input
                type="number" inputMode="numeric" min="1" step="1"
                value={boxSize} placeholder="50"
                onChange={(e) => setBoxSize(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                style={{ ...INPUT }}
              />
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={priceQuantities}
        priceUnits={BALUSTER_PRICE_UNITS}
        defaultPriceUnit="each"
      />

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢"
        open={openSections.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 600, margin: 0 }}>
            Equal End Margins / Centered
          </p>
          <FormulaBox text="N × w + (N + 1) × gap = Clear Opening" />
          <FormulaBox text="gap = (Clear Opening − N × Baluster Width) ÷ (N + 1)" />
          <FormulaBox text="Minimum N = ⌈ (Clear Opening − Max Opening) ÷ (Baluster Width + Max Opening) ⌉" />

          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 600, margin: "6px 0 0" }}>
            Fixed End Offsets
          </p>
          <FormulaBox text="Net Space = Clear Opening − Left Offset − Right Offset" />
          <FormulaBox text="gap = (Net Space − N × Baluster Width) ÷ (N − 1)   [N ≥ 2]" />
          <FormulaBox text="Minimum N = ⌈ (Net Space + Max Opening) ÷ (Baluster Width + Max Opening) ⌉" />

          {mode === "stair" && (
            <>
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 600, margin: "6px 0 0" }}>
                Stair Mode
              </p>
              <FormulaBox text="Stair Angle θ = atan(Rise ÷ Run)" />
              <FormulaBox text="Slope Length = Clear Opening ÷ cos(θ)" />
              <FormulaBox text="C-to-C Along Slope = Center-to-Center ÷ cos(θ)" />
            </>
          )}

          <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.65, margin: "4px 0 0" }}>
            The algorithm finds the minimum number of balusters N such that all gaps (including end margins) comply with the maximum allowed opening. Building code compliance (4-inch sphere rule per IRC §R312.1.3 / IBC §1015.4) is checked by verifying every gap ≤ max opening.
          </p>
        </div>
      </SectionCard>

      {/* ── Worked Example ── */}
      <SectionCard id="example" title="Worked Example" icon="📝"
        open={openSections.has("example")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
            Deck railing: 8 ft clear opening, 1½ in square wood balusters, 4-inch sphere rule, equal end margins.
          </p>
          <div style={{ background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 10 }}>
              8 ft Deck Railing — Square Wood Balusters
            </div>
            {[
              ["Clear Opening",    "96 in  (8 ft)"],
              ["Baluster Width",   "1.5 in"],
              ["Max Opening",      "4 in  (IRC/IBC)"],
              ["Layout",           "Equal End Margins"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600, minWidth: 130 }}>{k}:</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: "var(--text-primary)", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                Step-by-step
              </div>
              {[
                "N_min = ⌈(96 − 4) ÷ (1.5 + 4)⌉ = ⌈92 ÷ 5.5⌉ = ⌈16.73⌉ = 17",
                "gap  = (96 − 17 × 1.5) ÷ (17 + 1) = (96 − 25.5) ÷ 18 = 70.5 ÷ 18 ≈ 3.92 in",
                "3.92 in ≤ 4 in  ✓  PASS",
                "Total Balusters: 17",
                "Center-to-Center: 1.5 + 3.92 = 5.42 in",
                "End Margins (each): 3.92 in",
              ].map((line) => (
                <div key={line} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 5 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Notes ── */}
      <SectionCard id="notes" title="Notes & Building Code" icon="ℹ️"
        open={openSections.has("notes")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
            Key references and accuracy notes:
          </p>
          <ul style={{ margin: "0 0 0 4px", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              "IRC §R312.1.3 / IBC §1015.4: Openings in guards shall not allow the passage of a 4-inch diameter sphere.",
              "This calculator uses horizontal clear opening for spacing — the most conservative measurement method.",
              "For stair mode, the 4-inch rule applies to the vertical plane (not along-slope). The horizontal gap calculated here is the code-compliant measurement.",
              "Always verify your final layout with local authorities — some jurisdictions adopt modified codes.",
              "Results should be treated as planning estimates. Actual installations may need minor field adjustments.",
              "Add 10–15% waste allowance when ordering balusters to account for cuts and defects.",
            ].map((item) => (
              <li key={item} style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

    </div>
  );
}
