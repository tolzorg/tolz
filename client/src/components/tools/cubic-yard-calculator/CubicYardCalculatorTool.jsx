import { useState, useMemo, useRef } from "react";
import {
  calcCubicYards,
  formatCY,
  DIMENSION_UNITS,
  MATERIALS,
} from "../../../utils/cubicYardCalc";

// ── Shared style constants ────────────────────────────────────

const INPUT_LBL = {
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

const INPUT_BASE = {
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
  transition: "border-color var(--transition), box-shadow var(--transition)",
  boxSizing: "border-box",
};

const SELECT_BASE = {
  ...INPUT_BASE,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

// ── Sub-components ────────────────────────────────────────────

function FieldGroup({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <label style={INPUT_LBL}>{label}</label>
      {children}
      {error && (
        <p style={{
          fontSize: 11.5,
          color: "var(--error)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          marginTop: 5,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

function NumberAndUnit({ value, onChange, onBlur, unit, onUnitChange, placeholder, hasError }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        placeholder={placeholder || "0"}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = hasError ? "var(--error)" : "var(--accent)")}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "var(--error)" : "var(--border)";
          if (onBlur) onBlur();
        }}
        style={{
          ...INPUT_BASE,
          flex: "1 1 80px",
          minWidth: 0,
          borderColor: hasError ? "var(--error)" : "var(--border)",
        }}
      />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...SELECT_BASE, flex: "0 0 auto", width: "auto", minWidth: 150 }}
      >
        {DIMENSION_UNITS.map((u) => (
          <option key={u.id} value={u.id}>{u.label}</option>
        ))}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, accent, delay }) {
  return (
    <div
      className={`card animate-fadeUp${delay ? ` delay-${delay}` : ""}`}
      style={{ padding: "18px 20px", flex: "1 1 160px", minWidth: 0 }}
    >
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: 11,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(24px, 4.5vw, 38px)",
        color: accent ? "var(--accent)" : "var(--text-primary)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: 12,
        color: "var(--text-muted)",
        marginTop: 5,
      }}>
        {unit}
      </div>
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────

function validatePositive(raw) {
  if (raw === "" || raw === null) return "Required";
  const n = parseFloat(raw);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be greater than zero";
  return null;
}

// ── Main component ────────────────────────────────────────────

export default function CubicYardCalculatorTool() {
  const [length,     setLength]     = useState("");
  const [lengthUnit, setLengthUnit] = useState("ft");
  const [width,      setWidth]      = useState("");
  const [widthUnit,  setWidthUnit]  = useState("ft");
  const [depth,      setDepth]      = useState("");
  const [depthUnit,  setDepthUnit]  = useState("in");
  const [quantity,   setQuantity]   = useState("1");

  const [touched, setTouched] = useState({
    length: false, width: false, depth: false, quantity: false,
  });

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const errors = useMemo(() => ({
    length:   validatePositive(length),
    width:    validatePositive(width),
    depth:    validatePositive(depth),
    quantity: validatePositive(quantity),
  }), [length, width, depth, quantity]);

  const isValid = !errors.length && !errors.width && !errors.depth && !errors.quantity;

  const result = useMemo(() => {
    if (!isValid) return null;
    return calcCubicYards({ length, lengthUnit, width, widthUnit, depth, depthUnit, quantity });
  }, [isValid, length, lengthUnit, width, widthUnit, depth, depthUnit, quantity]);

  function handleReset() {
    setLength("");
    setWidth("");
    setDepth("");
    setQuantity("1");
    setLengthUnit("ft");
    setWidthUnit("ft");
    setDepthUnit("in");
    setTouched({ length: false, width: false, depth: false, quantity: false });
    setCopied(false);
  }

  function handleCopy() {
    if (!result) return;
    const text = [
      "Cubic Yard Calculator Results",
      `Cubic Feet: ${formatCY(result.cubicFeet)} ft³`,
      `Cubic Yards: ${formatCY(result.cubicYards)} yd³`,
      `Total Cubic Yards (×${quantity}): ${formatCY(result.total)} yd³`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  const anyFilled = length !== "" || width !== "" || depth !== "";

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Input card ── */}
      <div className="card" style={{ padding: "22px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Row 1: Length + Width */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Length" error={touched.length ? errors.length : null}>
                <NumberAndUnit
                  value={length}
                  onChange={setLength}
                  onBlur={() => touch("length")}
                  unit={lengthUnit}
                  onUnitChange={setLengthUnit}
                  placeholder="e.g. 10"
                  hasError={!!(touched.length && errors.length)}
                />
              </FieldGroup>
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Width" error={touched.width ? errors.width : null}>
                <NumberAndUnit
                  value={width}
                  onChange={setWidth}
                  onBlur={() => touch("width")}
                  unit={widthUnit}
                  onUnitChange={setWidthUnit}
                  placeholder="e.g. 10"
                  hasError={!!(touched.width && errors.width)}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Row 2: Depth + Quantity */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Depth / Height" error={touched.depth ? errors.depth : null}>
                <NumberAndUnit
                  value={depth}
                  onChange={setDepth}
                  onBlur={() => touch("depth")}
                  unit={depthUnit}
                  onUnitChange={setDepthUnit}
                  placeholder="e.g. 6"
                  hasError={!!(touched.depth && errors.depth)}
                />
              </FieldGroup>
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Quantity (optional)" error={touched.quantity ? errors.quantity : null}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={quantity}
                  placeholder="1"
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={() => touch("quantity")}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      touched.quantity && errors.quantity ? "var(--error)" : "var(--border)";
                    touch("quantity");
                  }}
                  style={{
                    ...INPUT_BASE,
                    borderColor: touched.quantity && errors.quantity ? "var(--error)" : "var(--border)",
                  }}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Reset */}
          {anyFilled && (
            <button
              className="btn btn-ghost"
              onClick={handleReset}
              style={{ alignSelf: "flex-start", fontSize: 13, padding: "6px 12px", color: "var(--text-muted)" }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <ResultCard label="Cubic Feet"       value={formatCY(result.cubicFeet)}  unit="ft³" />
            <ResultCard label="Cubic Yards"       value={formatCY(result.cubicYards)} unit="yd³" accent delay={100} />
            <ResultCard label={`Total (×${quantity})`} value={formatCY(result.total)} unit="yd³" delay={200} />
          </div>

          {/* Copy button */}
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{
              alignSelf: "flex-start",
              fontSize: 13,
              padding: "8px 16px",
              background:   copied ? "#f0fdf4"  : undefined,
              color:        copied ? "#16a34a"  : undefined,
              borderColor:  copied ? "#86efac"  : undefined,
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
          >
            {copied ? "✓ Copied!" : "📋 Copy Results"}
          </button>

          {/* ── Material estimator ── */}
          <div className="card animate-fadeUp delay-200" style={{ padding: "18px 20px" }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 12,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}>
              Approximate Material Weight
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {MATERIALS.map((m, i) => {
                const totalLbs = m.lbsPerCuYd * result.total;
                const isLast   = i === MATERIALS.length - 1;
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 13.5,
                      color: "var(--text-primary)",
                    }}>
                      {m.label}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: "var(--accent)",
                    }}>
                      ~{totalLbs.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs
                    </span>
                  </div>
                );
              })}
            </div>
            <p style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              marginTop: 10,
            }}>
              * Approximate values. Actual weight varies by material moisture and density.
            </p>
          </div>
        </>
      )}

      {/* ── Formula card ── */}
      <div className="card animate-fadeUp delay-100" style={{ padding: "18px 20px" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 12,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}>
          Formula
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {[
            "Cubic Feet  =  Length × Width × Depth",
            "Cubic Yards  =  Cubic Feet ÷ 27",
          ].map((line) => (
            <div
              key={line}
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "11px 16px",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(12px, 2.2vw, 14px)",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 13,
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          lineHeight: 1.6,
          margin: 0,
        }}>
          All entered units are converted to feet before calculation. There are exactly
          27 cubic feet in one cubic yard (3 ft × 3 ft × 3 ft).
        </p>
      </div>

      {/* ── Example card ── */}
      <div className="card animate-fadeUp delay-200" style={{ padding: "18px 20px" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 12,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}>
          Example
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {[
            ["Length",   "10 ft"],
            ["Width",    "10 ft"],
            ["Depth",    "6 in  →  0.5 ft"],
            ["Quantity", "2"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-muted)",
                minWidth: 72,
              }}>
                {k}:
              </span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text-primary)",
              }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}>
          {[
            ["Cubic Feet",         "50 ft³"],
            ["Cubic Yards",        "1.85 yd³"],
            ["Total (×2)",         "3.7 yd³"],
          ].map(([label, val]) => (
            <div key={label}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 12,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                color: label.startsWith("Total") ? "var(--accent)" : "var(--text-primary)",
              }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEO / Info section ── */}
      <div className="card animate-fadeUp delay-200" style={{ padding: "20px 20px" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(15px, 2.5vw, 18px)",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: 10,
        }}>
          What Is a Cubic Yard?
        </h2>
        <p style={{
          fontSize: 13.5,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          A <strong>cubic yard</strong> is a unit of volume equal to a cube that measures
          <strong> 3 feet × 3 feet × 3 feet</strong> — which is exactly <strong>27 cubic feet</strong>.
          It is the standard unit for ordering and estimating bulk construction and landscaping materials
          in the United States.
        </p>
        <p style={{
          fontSize: 13.5,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          Cubic yards are commonly used for:
        </p>
        <ul style={{
          margin: "0 0 0 4px",
          padding: "0 0 0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}>
          {[
            "Concrete slabs, footings, and foundations",
            "Gravel and crushed stone driveways",
            "Landscaping — topsoil, mulch, and compost",
            "Fill dirt and excavation volume",
            "Sand for construction and play areas",
            "Swimming pool and pond excavation",
          ].map((item) => (
            <li key={item} style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              lineHeight: 1.6,
            }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Empty state ── */}
      {!anyFilled && !result && (
        <div style={{ textAlign: "center", padding: "32px 20px 8px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📐</div>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}>
            Enter dimensions to calculate cubic yards
          </p>
          <p style={{
            fontSize: 13,
            color: "var(--text-muted)",
            maxWidth: 360,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Supports feet, inches, yards, meters and centimeters.
            Results and material weight estimates update instantly as you type.
          </p>
        </div>
      )}
    </div>
  );
}
