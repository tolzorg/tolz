import { useState, useMemo, useRef } from "react";
import {
  ISBASH_CONSTANTS, GRAVITY_UNITS,
  VELOCITY_UNITS, AREA_UNITS, DEPTH_UNITS, DENSITY_UNITS,
  D50_OUT_UNITS, VOLUME_OUT_UNITS, WEIGHT_OUT_UNITS,
  VELOCITY_REFERENCE,
  toMeterPerSec, toSquareMeters, toMetersDepth, toDensityKgM3, toGravityMS2,
  convertD50, convertVolume, convertWeight,
  calcRockSize, calcVolume,
  fmtRR,
} from "../../../utils/ripRapCalc";
import PriceCheckerCard, { WEIGHT_PRICE_UNITS } from "../construction/PriceCheckerCard";

// ── Shared style tokens ───────────────────────────────────────────
const FONT = "var(--font-display)";
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

const UNIT_SELECT_BASE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 13,
  border: "none", outline: "none", cursor: "pointer",
  padding: "0 28px 0 10px", height: "100%",
  appearance: "none", WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  minWidth: 90,
};

// ── "I want to find the..." modes ─────────────────────────────────
const FIND_MODES = [
  { id: "d50",    label: "average rock diameter (D₅₀)" },
  { id: "volume", label: "rip rap volume" },
  { id: "both",   label: "both D₅₀ and rip rap volume" },
];

// ── Section accordion header ──────────────────────────────────────
function SectionHeader({ open, onToggle, title }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "13px 18px",
        background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
        border: "none", cursor: "pointer", textAlign: "left",
      }}
    >
      {/* Chevron in circle */}
      <span style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "rgba(255,255,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "white" }}>
        {title}
      </span>
    </button>
  );
}

// ── Compound input+unit control ───────────────────────────────────
// isOutput: true → blue background, readonly
function CompoundField({
  value, onChange, onBlur,
  unit, onUnitChange, units,
  placeholder = "0",
  hasError = false,
  isOutput = false,
  unitLabel = null,   // static label instead of dropdown
}) {
  const borderColor = isOutput
    ? "#bfdbfe"
    : hasError ? "var(--error)" : BORDER;

  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`,
      borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type="number" inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={isOutput}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onFocus={!isOutput ? (e) => (e.target.style.outline = "none") : undefined}
        onBlur={!isOutput ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : { ...INPUT_BASE }}
      />
      {/* Unit: static label or select */}
      {unitLabel ? (
        <span style={{
          ...UNIT_SELECT_BASE,
          display: "flex", alignItems: "center",
          borderLeft: `1.5px solid ${borderColor}`,
          padding: "0 14px",
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-muted)",
          fontSize: 13, fontWeight: 600, fontFamily: FONT,
          whiteSpace: "nowrap",
        }}>
          {unitLabel}
        </span>
      ) : (
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          style={{
            ...UNIT_SELECT_BASE,
            borderLeft: `1.5px solid ${borderColor}`,
            background: isOutput ? "#eff6ff" : "var(--bg-muted)",
            color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          }}
        >
          {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Field wrapper: label + control + error ────────────────────────
function Field({ label, hint, error, note, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={LABEL_STYLE}>{label}</span>
        {hint && (
          <span title={hint}
            style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help", lineHeight: 1 }}>
            ⓘ
          </span>
        )}
      </div>
      {children}
      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
          <span style={{ color: "var(--error)", fontSize: 12, lineHeight: 1.2, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--error)", fontWeight: 500, lineHeight: 1.4 }}>
            {error}
          </span>
        </div>
      )}
      {note && !error && (
        <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>
          {note}
        </span>
      )}
    </div>
  );
}

// ── Isbash radio pills ─────────────────────────────────────────────
function IsbashPills({ value, onChange }) {
  const opts = [
    { id: "high", label: "Highly turbulent (0.86)" },
    { id: "low",  label: "Low turbulence (1.2)"    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {opts.map((opt) => {
        const selected = value === opt.id;
        return (
          <label key={opt.id} style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            padding: "9px 13px", borderRadius: RADIUS,
            background: selected ? "var(--accent-light)" : "var(--bg-muted)",
            border: `1.5px solid ${selected ? "var(--accent)" : BORDER}`,
            transition: "border-color 0.15s, background 0.15s",
          }}>
            <input
              type="radio" name="isbash-opt" value={opt.id} checked={selected}
              onChange={() => onChange(opt.id)}
              style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
            />
            <span style={{
              fontFamily: FONT, fontWeight: selected ? 700 : 500,
              fontSize: 13, color: selected ? "var(--accent)" : "var(--text-primary)",
            }}>
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ── Rip Rap SVG diagram ───────────────────────────────────────────
function RipRapDiagram() {
  const rocks = [
    { cx: 65,  cy: 67, rx: 9,  ry: 6 },
    { cx: 84,  cy: 59, rx: 10, ry: 7 },
    { cx: 103, cy: 51, rx: 9,  ry: 6 },
    { cx: 122, cy: 43, rx: 11, ry: 7 },
    { cx: 141, cy: 36, rx: 9,  ry: 6 },
    { cx: 160, cy: 28, rx: 10, ry: 7 },
    { cx: 178, cy: 20, rx: 8,  ry: 6 },
  ];
  return (
    <svg viewBox="0 0 220 95" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="220" height="95" fill="#f8fafc" rx="6" />
      <rect x="0" y="72" width="220" height="23" fill="#dbeafe" />
      <path d="M0 72 Q18 68 36 72 Q54 76 72 72 Q90 68 108 72 Q126 76 144 72 Q162 68 180 72 Q198 76 220 72"
        fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.8" />
      <text x="6" y="87" fontFamily="sans-serif" fontSize="7" fill="#2563eb" fontWeight="600">Water</text>
      <polygon points="48,95 220,5 220,95" fill="#e5e7eb" />
      {rocks.map((r, i) => (
        <ellipse key={i}
          cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}
          fill={i % 2 === 0 ? "#6b7280" : "#9ca3af"}
          stroke="#4b5563" strokeWidth="0.8" opacity="0.9"
        />
      ))}
      <line x1="40" y1="48" x2="64" y2="61" stroke="#1d4ed8" strokeWidth="1" />
      <circle cx="64" cy="61" r="2" fill="#1d4ed8" />
      <text x="5" y="46" fontFamily="sans-serif" fontSize="9" fill="#1d4ed8" fontWeight="700">D₅₀</text>
      <text x="98" y="49" fontFamily="sans-serif" fontSize="7.5" fill="#374151" fontWeight="600"
        transform="rotate(-28 98 49)">Rip Rap Layer</text>
    </svg>
  );
}

// ── Action button style ───────────────────────────────────────────
function ActionBtn({ onClick, children, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: "1 1 auto", padding: "9px 16px", borderRadius: RADIUS,
        fontFamily: FONT, fontWeight: 700, fontSize: 13,
        cursor: "pointer", border: "none",
        background: primary ? "var(--accent)" : "var(--bg-muted)",
        color: primary ? "white" : "var(--text-primary)",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════

export default function RipRapCalculatorTool() {

  // ── "I want to find..." mode ──────────────────────────────────────
  const [findMode, setFindMode] = useState("both");

  // ── D₅₀ inputs ───────────────────────────────────────────────────
  const [velocity,     setVelocity]     = useState("");
  const [velocityUnit, setVelocityUnit] = useState("m/s");
  const [isbashId,     setIsbashId]     = useState("low");
  const [gravityStr,   setGravityStr]   = useState("9.806");
  const [gravityUnit,  setGravityUnit]  = useState("m/s2");
  const [specificGrav, setSpecificGrav] = useState("");
  const [d50OutUnit,   setD50OutUnit]   = useState("cm");

  // ── Volume inputs ─────────────────────────────────────────────────
  const [area,             setArea]             = useState("");
  const [areaUnit,         setAreaUnit]         = useState("m2");
  const [depth,            setDepth]            = useState("");
  const [depthUnit,        setDepthUnit]        = useState("m");
  const [wastagePct,       setWastagePct]       = useState("0");
  const [density,          setDensity]          = useState("1680");
  const [densityUnit,      setDensityUnit]      = useState("kg/m3");
  const [volumeOutUnit,    setVolumeOutUnit]    = useState("m3");
  const [totVolOutUnit,    setTotVolOutUnit]    = useState("m3");
  const [weightOutUnit,    setWeightOutUnit]    = useState("ustons");

  // ── Section open state ────────────────────────────────────────────
  const [specsOpen,  setSpecsOpen]  = useState(true);
  const [volSecOpen, setVolSecOpen] = useState(true);
  const [costOpen,   setCostOpen]   = useState(false);
  const [chartOpen,  setChartOpen]  = useState(true);
  const [exampleOpen, setExampleOpen] = useState(false);

  // ── Touched state ─────────────────────────────────────────────────
  const [touched, setTouched] = useState({});
  const [feedback, setFeedback] = useState(null); // null | "yes" | "no"
  const [shared, setShared]     = useState(false);
  const shareTimer = useRef(null);

  // ── Visibility helpers ────────────────────────────────────────────
  const showSpecs  = findMode === "d50"    || findMode === "both";
  const showVolume = findMode === "volume" || findMode === "both";

  // ── D₅₀ derivations ──────────────────────────────────────────────
  const C          = useMemo(() => ISBASH_CONSTANTS.find((c) => c.id === isbashId)?.value ?? 1.20, [isbashId]);
  const velocityMS = useMemo(() => toMeterPerSec(velocity, velocityUnit),    [velocity, velocityUnit]);
  const gVal       = useMemo(() => toGravityMS2(gravityStr, gravityUnit),    [gravityStr, gravityUnit]);
  const S          = useMemo(() => {
    const v = parseFloat(specificGrav);
    return isFinite(v) && v >= 2.5 && v <= 3.0 ? v : null;
  }, [specificGrav]);

  const d50M = useMemo(
    () => calcRockSize({ velocityMS, g: gVal, C, S }),
    [velocityMS, gVal, C, S]
  );

  const dispD50 = d50M !== null ? fmtRR(convertD50(d50M, d50OutUnit), 2) : "";

  // ── Volume derivations ────────────────────────────────────────────
  const areaM2      = useMemo(() => toSquareMeters(area, areaUnit),        [area, areaUnit]);
  const depthM      = useMemo(() => toMetersDepth(depth, depthUnit),       [depth, depthUnit]);
  const wastageNum  = useMemo(() => { const v = parseFloat(wastagePct); return isFinite(v) && v >= 0 ? v : 0; }, [wastagePct]);
  const densityKgM3 = useMemo(() => toDensityKgM3(density, densityUnit),  [density, densityUnit]);

  const volResult = useMemo(
    () => calcVolume({ areaM2, depthM, wastagePct: wastageNum, densityKgM3 }),
    [areaM2, depthM, wastageNum, densityKgM3]
  );

  const dispNetVol  = volResult !== null ? fmtRR(convertVolume(volResult.netVolumeM3,   volumeOutUnit), 3) : "";
  const dispTotVol  = volResult !== null ? fmtRR(convertVolume(volResult.totalVolumeM3, totVolOutUnit), 3) : "";
  const dispWeight  = volResult?.weightKg != null
    ? fmtRR(convertWeight(volResult.weightKg, weightOutUnit), 2) : "";

  // Price checker quantities
  const priceQuantities = useMemo(() => {
    const wt = volResult?.weightKg ?? null;
    return {
      lb:         wt !== null ? wt * 2.20462   : null,
      kg:         wt,
      ustons:     wt !== null ? wt / 907.185   : null,
      metrictons: wt !== null ? wt / 1000      : null,
    };
  }, [volResult]);

  // ── Validation errors (show only after touch) ─────────────────────
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const velocityErr = touched.velocity && (velocity === "" || parseFloat(velocity) <= 0)
    ? "Please input a positive value for the water velocity." : null;

  const sgErr = touched.sg && (
    specificGrav === "" || parseFloat(specificGrav) < 2.5 || parseFloat(specificGrav) > 3.0
  ) ? "Please enter a specific gravity of rock ranging from 2.5 to 3.0." : null;

  const areaErr  = touched.area  && (area  === "" || parseFloat(area)  <= 0) ? "Please input a positive value for the area."  : null;
  const depthErr = touched.depth && (depth === "" || parseFloat(depth) <= 0) ? "Please input a positive value for the depth." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleReload() {
    setVelocity(""); setSpecificGrav(""); setIsbashId("low"); setGravityStr("9.806"); setGravityUnit("m/s2");
    setArea(""); setDepth(""); setWastagePct("0"); setDensity("1680");
    setTouched({}); setFeedback(null); setShared(false);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShared(true);
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShared(false), 2000);
  }

  // ── Field divider ─────────────────────────────────────────────────
  const Divider = () => <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── "I want to find the..." ──────────────────────────────── */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 14 }}>
          I want to find the...
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FIND_MODES.map((m) => {
            const sel = findMode === m.id;
            return (
              <label key={m.id} style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                padding: "9px 13px", borderRadius: RADIUS,
                background: sel ? "var(--accent-light)" : "transparent",
                border: `1.5px solid ${sel ? "var(--accent)" : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <input type="radio" name="find-mode" value={m.id} checked={sel}
                  onChange={() => setFindMode(m.id)}
                  style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }} />
                <span style={{
                  fontFamily: FONT, fontWeight: sel ? 700 : 500, fontSize: 13.5,
                  color: sel ? "var(--accent)" : "var(--text-primary)",
                }}>
                  {m.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — Rip rap specifications
          ══════════════════════════════════════════════════════════ */}
      {showSpecs && (
        <div className="card" style={{ overflow: "hidden" }}>
          <SectionHeader open={specsOpen} onToggle={() => setSpecsOpen(!specsOpen)}
            title="Rip rap specifications" />

          {specsOpen && (
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Diagram */}
              <div style={{
                width: "100%", height: 90, background: "var(--bg-muted)",
                borderRadius: RADIUS, border: `1px solid ${BORDER}`,
                overflow: "hidden", padding: 4, boxSizing: "border-box",
              }}>
                <RipRapDiagram />
              </div>

              <Divider />

              {/* Water velocity */}
              <Field label="Water velocity (V)" hint="Mean flow velocity of water approaching the rip rap." error={velocityErr}>
                <CompoundField
                  value={velocity} onChange={setVelocity}
                  onBlur={() => touch("velocity")}
                  unit={velocityUnit} onUnitChange={setVelocityUnit}
                  units={VELOCITY_UNITS} placeholder="0"
                  hasError={!!velocityErr}
                />
              </Field>

              <Divider />

              {/* Isbash constant */}
              <Field label="Isbash constant (C)"
                hint="0.86 for high turbulence (bends, piers, grade breaks). 1.2 for straight sections with uniform flow.">
                <IsbashPills value={isbashId} onChange={setIsbashId} />
              </Field>

              <Divider />

              {/* Gravitational acceleration */}
              <Field label="Gravitational acceleration (g)"
                hint="Standard value is 9.806 m/s². Rarely needs to change.">
                <CompoundField
                  value={gravityStr} onChange={setGravityStr} onBlur={() => {}}
                  unit={gravityUnit} onUnitChange={setGravityUnit}
                  units={GRAVITY_UNITS} placeholder="9.806"
                />
              </Field>

              <Divider />

              {/* Specific gravity */}
              <Field label="Specific gravity (S)"
                hint="Ratio of rock density to water density. Typical range: 2.5 to 3.0. Granite ≈ 2.65, Limestone ≈ 2.70, Basalt ≈ 2.90."
                error={sgErr}>
                <div style={{
                  border: `1.5px solid ${sgErr ? "var(--error)" : specificGrav === "" ? "#fbbf24" : BORDER}`,
                  borderRadius: RADIUS, overflow: "hidden",
                  background: specificGrav === "" ? "#fffbeb" : "var(--bg-white)",
                }}>
                  <input
                    type="number" inputMode="decimal" step="0.01" min="2.5" max="3.0"
                    value={specificGrav} placeholder="e.g. 2.65"
                    onChange={(e) => setSpecificGrav(e.target.value)}
                    onBlur={() => touch("sg")}
                    style={{
                      ...INPUT_BASE,
                      background: "transparent",
                    }}
                  />
                </div>
              </Field>

              <Divider />

              {/* D₅₀ — output field */}
              <Field
                label="Average rock diameter (D₅₀)"
                hint="The computed median diameter: 50% of rocks are smaller than this value."
                note={d50M === null ? "The average rock diameter will appear here once all inputs above are valid." : undefined}
              >
                <CompoundField
                  value={dispD50}
                  unit={d50OutUnit} onUnitChange={setD50OutUnit}
                  units={D50_OUT_UNITS} placeholder="—"
                  isOutput
                />
              </Field>

              {/* Min depth hint (shown when D50 is known) */}
              {d50M !== null && (
                <div style={{
                  background: "#fffbeb", border: "1px solid #fcd34d",
                  borderRadius: RADIUS, padding: "10px 14px",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>📏</span>
                  <div>
                    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "#92400e" }}>
                      Recommended minimum layer depth
                    </div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, color: "#78350f", marginTop: 2 }}>
                      {fmtRR(d50M * 100 * 2, 1)} cm &nbsp;/&nbsp; {fmtRR(d50M * 39.3701 * 2, 1)} in
                      <span style={{ fontWeight: 500, fontSize: 12, color: "#92400e", marginLeft: 8 }}>(= 2 × D₅₀)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* D₅₀ unit conversions */}
              {d50M !== null && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { lbl: "mm", val: d50M * 1000,    dp: 1 },
                    { lbl: "cm", val: d50M * 100,     dp: 2 },
                    { lbl: "m",  val: d50M,            dp: 4 },
                    { lbl: "in", val: d50M * 39.3701, dp: 2 },
                    { lbl: "ft", val: d50M * 3.28084, dp: 3 },
                  ].map(({ lbl, val, dp }) => (
                    <div key={lbl} className="card" style={{ flex: "1 1 70px", minWidth: 0, padding: "8px 10px" }}>
                      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{lbl}</div>
                      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: "#1d4ed8" }}>{fmtRR(val, dp)}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — Rip rap volume and weight
          ══════════════════════════════════════════════════════════ */}
      {showVolume && (
        <div className="card" style={{ overflow: "hidden" }}>
          <SectionHeader open={volSecOpen} onToggle={() => setVolSecOpen(!volSecOpen)}
            title="Rip rap volume and weight" />

          {volSecOpen && (
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Area */}
              <Field label="Area" hint="Total surface area to be covered with rip rap." error={areaErr}>
                <CompoundField
                  value={area} onChange={setArea}
                  onBlur={() => touch("area")}
                  unit={areaUnit} onUnitChange={setAreaUnit}
                  units={AREA_UNITS} placeholder="0"
                  hasError={!!areaErr}
                />
              </Field>

              <Divider />

              {/* Depth */}
              <Field label="Depth"
                hint={
                  d50M !== null
                    ? `Minimum recommended depth is ${fmtRR(d50M * 100 * 2, 1)} cm (= 2 × D₅₀).`
                    : "Layer thickness of the rip rap. Typically at least 2× the median rock diameter (D₅₀)."
                }
                error={depthErr}>
                <CompoundField
                  value={depth} onChange={setDepth}
                  onBlur={() => touch("depth")}
                  unit={depthUnit} onUnitChange={setDepthUnit}
                  units={DEPTH_UNITS} placeholder="0"
                  hasError={!!depthErr}
                />
              </Field>

              <Divider />

              {/* Volume — output (Area × Depth, no wastage) */}
              <Field label="Volume"
                note="Computed as Area × Depth (net volume, before wastage adjustment).">
                <CompoundField
                  value={dispNetVol}
                  unit={volumeOutUnit} onUnitChange={setVolumeOutUnit}
                  units={VOLUME_OUT_UNITS} placeholder="—"
                  isOutput
                />
              </Field>

              <Divider />

              {/* Wastage */}
              <Field label="Wastage"
                hint="Extra material for voids, irregular placement, and over-ordering. Typical: 5–15%.">
                <CompoundField
                  value={wastagePct} onChange={setWastagePct} onBlur={() => {}}
                  unitLabel="%" placeholder="0"
                />
              </Field>

              <Divider />

              {/* Total volume — output (with wastage) */}
              <Field label="Total volume"
                note="Volume to order = Volume × (1 + Wastage / 100).">
                <CompoundField
                  value={dispTotVol}
                  unit={totVolOutUnit} onUnitChange={setTotVolOutUnit}
                  units={VOLUME_OUT_UNITS} placeholder="—"
                  isOutput
                />
              </Field>

              <Divider />

              {/* Density */}
              <Field label="Density"
                hint="Bulk density of the rip rap material. Typical granite bulk: 1,600–1,760 kg/m³.">
                <CompoundField
                  value={density} onChange={setDensity} onBlur={() => {}}
                  unit={densityUnit} onUnitChange={setDensityUnit}
                  units={DENSITY_UNITS} placeholder="1680"
                />
              </Field>

              <Divider />

              {/* Weight — output */}
              <Field label="Weight"
                note="Weight = Total volume × Rock density.">
                <CompoundField
                  value={dispWeight}
                  unit={weightOutUnit} onUnitChange={setWeightOutUnit}
                  units={WEIGHT_OUT_UNITS} placeholder="—"
                  isOutput
                />
              </Field>

              {/* Weight conversions */}
              {volResult?.weightKg != null && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { lbl: "kg",      val: volResult.weightKg,            dp: 1 },
                    { lbl: "lb",      val: volResult.weightKg * 2.20462,  dp: 1 },
                    { lbl: "tonnes",  val: volResult.weightKg / 1000,     dp: 3 },
                    { lbl: "US tons", val: volResult.weightKg / 907.185,  dp: 3 },
                  ].map(({ lbl, val, dp }) => (
                    <div key={lbl} className="card" style={{ flex: "1 1 80px", minWidth: 0, padding: "8px 10px" }}>
                      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{lbl}</div>
                      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: "#1d4ed8" }}>{fmtRR(val, dp)}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — Rip rap cost
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="Rip rap cost" />

        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Price checker */}
            <PriceCheckerCard
              quantities={priceQuantities}
              priceUnits={WEIGHT_PRICE_UNITS}
              defaultPriceUnit="metrictons"
            />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ActionBtn onClick={handleShare} primary={false}>
                {shared ? "✓ Link Copied!" : "🔗 Share result"}
              </ActionBtn>
              <ActionBtn onClick={handleReload} primary={false}>
                🔄 Reload calculator
              </ActionBtn>
              <ActionBtn onClick={handleReload} primary={false}>
                🗑 Clear all changes
              </ActionBtn>
            </div>

            {/* Feedback */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "10px 14px", background: "var(--bg-muted)", borderRadius: RADIUS,
              border: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: "var(--text-muted)", flex: "1 1 auto" }}>
                Did we solve your problem?
              </span>
              {[
                { val: "yes", label: "👍 Yes" },
                { val: "no",  label: "👎 No"  },
              ].map(({ val, label }) => (
                <button
                  key={val} onClick={() => setFeedback(val)}
                  style={{
                    fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    padding: "6px 14px", borderRadius: RADIUS,
                    border: `1.5px solid ${feedback === val ? "var(--accent)" : BORDER}`,
                    background: feedback === val ? "var(--accent-light)" : "var(--bg-white)",
                    color: feedback === val ? "var(--accent)" : "var(--text-primary)",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
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

      {/* ══════════════════════════════════════════════════════════
          VELOCITY REFERENCE TABLE
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={chartOpen} onToggle={() => setChartOpen(!chartOpen)} title="Riprap size chart" />
        {chartOpen && <div style={{ padding: "14px 18px" }}>
          <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 12px 0", lineHeight: 1.55 }}>
            Pre-computed D₅₀ at S&nbsp;=&nbsp;2.50, g&nbsp;=&nbsp;9.806 m/s².
            Click a row to fill the velocity field.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-muted)" }}>
                  {["Velocity (m/s)", "Low turbulence D₅₀ (cm)", "High turbulence D₅₀ (cm)"].map((h) => (
                    <th key={h} style={{
                      padding: "8px 12px", textAlign: "left",
                      fontWeight: 700, fontSize: 11, color: "var(--text-muted)",
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      borderBottom: `1px solid ${BORDER}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VELOCITY_REFERENCE.map((row, i, arr) => {
                  const active = parseFloat(velocity) === row.velocityMS && velocityUnit === "m/s";
                  return (
                    <tr key={row.velocityMS}
                      onClick={() => { setVelocity(String(row.velocityMS)); setVelocityUnit("m/s"); }}
                      style={{
                        borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                        background: active ? "var(--accent-light)" : "transparent",
                        cursor: "pointer", transition: "background var(--transition)",
                      }}
                    >
                      <td style={{ padding: "7px 12px", fontWeight: 700, color: active ? "var(--accent)" : "var(--text-primary)" }}>
                        {row.velocityMS}
                      </td>
                      <td style={{ padding: "7px 12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {row.lowD50Cm}
                      </td>
                      <td style={{ padding: "7px 12px", fontWeight: 600, color: "#dc2626" }}>
                        {row.highD50Cm}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>}
      </div>

      {/* ══════════════════════════════════════════════════════════
          WORKED EXAMPLES
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={exampleOpen} onToggle={() => setExampleOpen(!exampleOpen)} title="Sample calculation of rip rap rock size" />
        {exampleOpen && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
              How do we calculate rip rap rock size?
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Example 1 */}
              <div style={{
                background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
                borderRadius: RADIUS, padding: "13px 15px",
              }}>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--text-primary)", marginBottom: 8 }}>
                  D₅₀ Example — V = 2 m/s, Low turbulence, Granite (S = 2.65)
                </div>
                {[
                  "D₅₀ = V² ÷ (2 × g × C² × (S − 1))",
                  "    = 4 ÷ (2 × 9.806 × 1.44 × 1.65)",
                  "    = 4 ÷ 46.61  ≈  0.0858 m  =  8.58 cm",
                  "Min. depth  =  2 × 8.58  =  17.2 cm",
                ].map((l) => (
                  <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
                ))}
              </div>

              {/* Example 2 */}
              <div style={{
                background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
                borderRadius: RADIUS, padding: "13px 15px",
              }}>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--text-primary)", marginBottom: 8 }}>
                  Volume Example — Area = 50 m², Depth = 0.4 m, Wastage = 5%
                </div>
                {[
                  "Volume       = 50 × 0.4  =  20 m³",
                  "Total volume = 20 × 1.05  =  21.0 m³  (27.47 yd³)",
                  "Weight       = 21.0 × 1,680  =  35,280 kg  =  35.28 tonnes",
                ].map((l) => (
                  <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
                ))}
              </div>
            </div>

            <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: "12px 0 0 0" }}>
              The <strong>Isbash equation</strong> is a widely used empirical formula for sizing rip rap on open channels.
              Always verify critical designs with HEC-11 / HEC-RAS or a licensed hydraulic engineer.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
