import { useState, useMemo, useRef } from "react";
import {
  calcBoardFeet,
  formatBF,
  THICKNESS_UNITS,
  WIDTH_UNITS,
  LENGTH_UNITS,
} from "../../../utils/boardFootCalc";

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

function NumberAndUnit({ value, onChange, onFocus, onBlur, unit, onUnitChange, units, placeholder, hasError }) {
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
        onFocus={(e) => {
          e.target.style.borderColor = hasError ? "var(--error)" : "var(--accent)";
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "var(--error)" : "var(--border)";
          if (onBlur) onBlur(e);
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
        style={{ ...SELECT_BASE, flex: "0 0 auto", width: "auto", minWidth: 130 }}
      >
        {units.map((u) => (
          <option key={u.id} value={u.id}>{u.label}</option>
        ))}
      </select>
    </div>
  );
}

function ResultCard({ label, value, accent, delay }) {
  return (
    <div
      className={`card animate-fadeUp${delay ? ` delay-${delay}` : ""}`}
      style={{ padding: "18px 20px", flex: "1 1 200px", minWidth: 0 }}
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
        fontSize: "clamp(26px, 5vw, 40px)",
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
        board feet
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

function validatePositive(raw) {
  if (raw === "" || raw === null) return "Required";
  const n = parseFloat(raw);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0) return "Must be greater than zero";
  return null;
}

export default function BoardFootCalculatorTool() {
  const [thickness,      setThickness]      = useState("");
  const [thicknessUnit,  setThicknessUnit]  = useState("in");
  const [width,          setWidth]          = useState("");
  const [widthUnit,      setWidthUnit]      = useState("in");
  const [length,         setLength]         = useState("");
  const [lengthUnit,     setLengthUnit]     = useState("ft");
  const [quantity,       setQuantity]       = useState("1");

  // Show errors only after first interaction per field
  const [touched, setTouched] = useState({ thickness: false, width: false, length: false, quantity: false });

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const errors = useMemo(() => ({
    thickness: validatePositive(thickness),
    width:     validatePositive(width),
    length:    validatePositive(length),
    quantity:  validatePositive(quantity),
  }), [thickness, width, length, quantity]);

  const isValid = !errors.thickness && !errors.width && !errors.length && !errors.quantity;

  const result = useMemo(() => {
    if (!isValid) return null;
    return calcBoardFeet({ thickness, thicknessUnit, width, widthUnit, length, lengthUnit, quantity });
  }, [isValid, thickness, thicknessUnit, width, widthUnit, length, lengthUnit, quantity]);

  function handleReset() {
    setThickness("");
    setWidth("");
    setLength("");
    setQuantity("1");
    setThicknessUnit("in");
    setWidthUnit("in");
    setLengthUnit("ft");
    setTouched({ thickness: false, width: false, length: false, quantity: false });
    setCopied(false);
  }

  function handleCopy() {
    if (!result) return;
    const text = `Board Foot Calculator Results\nPer Piece: ${formatBF(result.perPiece)} BF\nTotal (×${quantity}): ${formatBF(result.total)} BF`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  const anyFilled = thickness !== "" || width !== "" || length !== "";

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Input card ── */}
      <div className="card" style={{ padding: "22px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Row 1: Thickness + Width */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup
                label="Thickness"
                error={touched.thickness ? errors.thickness : null}
              >
                <NumberAndUnit
                  value={thickness}
                  onChange={setThickness}
                  onBlur={() => touch("thickness")}
                  unit={thicknessUnit}
                  onUnitChange={setThicknessUnit}
                  units={THICKNESS_UNITS}
                  placeholder="e.g. 2"
                  hasError={!!(touched.thickness && errors.thickness)}
                />
              </FieldGroup>
            </div>

            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup
                label="Width"
                error={touched.width ? errors.width : null}
              >
                <NumberAndUnit
                  value={width}
                  onChange={setWidth}
                  onBlur={() => touch("width")}
                  unit={widthUnit}
                  onUnitChange={setWidthUnit}
                  units={WIDTH_UNITS}
                  placeholder="e.g. 6"
                  hasError={!!(touched.width && errors.width)}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Row 2: Length + Quantity */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup
                label="Length"
                error={touched.length ? errors.length : null}
              >
                <NumberAndUnit
                  value={length}
                  onChange={setLength}
                  onBlur={() => touch("length")}
                  unit={lengthUnit}
                  onUnitChange={setLengthUnit}
                  units={LENGTH_UNITS}
                  placeholder="e.g. 10"
                  hasError={!!(touched.length && errors.length)}
                />
              </FieldGroup>
            </div>

            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup
                label="Quantity (boards)"
                error={touched.quantity ? errors.quantity : null}
              >
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
                  style={{
                    ...INPUT_BASE,
                    borderColor: touched.quantity && errors.quantity ? "var(--error)" : "var(--border)",
                  }}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Action row */}
          {anyFilled && (
            <button
              className="btn btn-ghost"
              onClick={handleReset}
              style={{
                alignSelf: "flex-start",
                fontSize: 13,
                padding: "6px 12px",
                color: "var(--text-muted)",
              }}
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
            <ResultCard label="Board Feet per Piece" value={formatBF(result.perPiece)} />
            <ResultCard label={`Total Board Feet (×${quantity})`} value={formatBF(result.total)} accent delay={100} />
          </div>

          {/* Copy button */}
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{
              alignSelf: "flex-start",
              fontSize: 13,
              padding: "8px 16px",
              background: copied ? "#f0fdf4" : undefined,
              color:      copied ? "#16a34a" : undefined,
              borderColor: copied ? "#86efac" : undefined,
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
          >
            {copied ? "✓ Copied!" : "📋 Copy Results"}
          </button>
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

        <div style={{
          background: "var(--bg-muted)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(13px, 2.5vw, 15px)",
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          textAlign: "center",
          marginBottom: 10,
        }}>
          Board Feet = (Thickness × Width × Length) ÷ 12
        </div>

        <p style={{
          fontSize: 13,
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          lineHeight: 1.6,
          margin: 0,
        }}>
          Where <strong>Thickness</strong> and <strong>Width</strong> are in inches, and <strong>Length</strong> is in feet.
          Board feet is a unit used to measure lumber volume. All entered units are automatically converted before calculation.
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

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["Thickness", "2 in"],
            ["Width",     "6 in"],
            ["Length",    "10 ft"],
            ["Quantity",  "5 boards"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-muted)",
                minWidth: 80,
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
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}>
          <div>
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
              Per Piece
            </span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 20,
              color: "var(--text-primary)",
            }}>
              10 BF
            </span>
          </div>
          <div>
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
              Total (×5)
            </span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 20,
              color: "var(--accent)",
            }}>
              50 BF
            </span>
          </div>
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
          What is a Board Foot?
        </h2>
        <p style={{
          fontSize: 13.5,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          A <strong>board foot</strong> is a unit of lumber measurement equal to the volume of a board
          that is <strong>1 inch thick × 12 inches wide × 1 foot long</strong> — or any combination of
          dimensions that equals the same volume (144 cubic inches).
        </p>
        <p style={{
          fontSize: 13.5,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          Board feet are the standard volume measurement for pricing and ordering lumber in North America,
          commonly used in:
        </p>
        <ul style={{
          margin: "0 0 0 4px",
          padding: "0 0 0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}>
          {[
            "Lumber yards and timber sales",
            "Woodworking and furniture making",
            "Home construction and framing",
            "Decking, fencing, and siding projects",
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
        <div style={{
          textAlign: "center",
          padding: "32px 20px 8px",
          color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🪵</div>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}>
            Enter lumber dimensions to calculate board feet
          </p>
          <p style={{
            fontSize: 13,
            color: "var(--text-muted)",
            maxWidth: 360,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Supports inches, millimeters, centimeters, feet and meters.
            Results update instantly as you type.
          </p>
        </div>
      )}
    </div>
  );
}
