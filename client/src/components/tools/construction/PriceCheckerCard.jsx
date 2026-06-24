import { useState, useRef } from "react";

// ── Design tokens (matching existing calculators) ────────────

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

// ── Supported currencies ─────────────────────────────────────

export const PRICE_CURRENCIES = [
  { id: "USD", symbol: "$",   label: "USD ($)"  },
  { id: "EUR", symbol: "€",   label: "EUR (€)"  },
  { id: "GBP", symbol: "£",   label: "GBP (£)"  },
  { id: "PKR", symbol: "Rs",  label: "PKR (Rs)" },
  { id: "INR", symbol: "₹",   label: "INR (₹)"  },
  { id: "AED", symbol: "AED", label: "AED"      },
  { id: "SAR", symbol: "SAR", label: "SAR"      },
  { id: "CAD", symbol: "CA$", label: "CAD (CA$)" },
  { id: "AUD", symbol: "A$",  label: "AUD (A$)" },
];

// ── Price unit sets by calculator type ───────────────────────
// Each unit: { id, label, display }
//   id      → key to look up in the `quantities` prop
//   label   → shown in the <select>
//   display → short symbol used in the result line

export const AREA_PRICE_UNITS = [
  { id: "sqyd",  label: "per yd²",   display: "yd²"  },
  { id: "sqft",  label: "per ft²",   display: "ft²"  },
  { id: "sqm",   label: "per m²",    display: "m²"   },
  { id: "acre",  label: "per acre",  display: "acre"  },
];

export const VOLUME_PRICE_UNITS = [
  { id: "cuyd",  label: "per yd³",    display: "yd³"    },
  { id: "cuft",  label: "per ft³",    display: "ft³"    },
  { id: "cum",   label: "per m³",     display: "m³"     },
  { id: "liter", label: "per liter",  display: "liter"  },
  { id: "usgal", label: "per US gal", display: "US gal" },
  { id: "ukgal", label: "per UK gal", display: "UK gal" },
];

export const WEIGHT_PRICE_UNITS = [
  { id: "lb",         label: "per lb",         display: "lb"         },
  { id: "kg",         label: "per kg",         display: "kg"         },
  { id: "ustons",     label: "per short ton",  display: "short ton"  },
  { id: "metrictons", label: "per metric ton", display: "metric ton" },
];

export const BF_PRICE_UNITS = [
  { id: "bf", label: "per board foot", display: "BF" },
];

// ── Helpers ───────────────────────────────────────────────────

function fmtMoney(n) {
  if (n === null || !isFinite(n) || n < 0) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtQty(n, dp = 4) {
  if (n === null || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toString();
}

// ── Local FieldGroup ──────────────────────────────────────────

function FieldGroup({ label, hint, error, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && (
          <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help", lineHeight: 1 }}>
            ⓘ
          </span>
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

// ── PriceCheckerCard ──────────────────────────────────────────
//
// Props:
//   quantities      — { [unitId]: number | null }
//                     The caller populates each key with the corresponding
//                     computed value so the card can display the right quantity
//                     when the user changes the price unit.
//   priceUnits      — array of { id, label, display } — which units to show
//   defaultPriceUnit — string — which unit to select initially

export default function PriceCheckerCard({
  quantities = {},
  priceUnits = AREA_PRICE_UNITS,
  defaultPriceUnit,
}) {
  const initUnit = defaultPriceUnit || priceUnits[0]?.id || "";

  const [isOpen,    setIsOpen]    = useState(false);
  const [price,     setPrice]     = useState("");
  const [currency,  setCurrency]  = useState("USD");
  const [priceUnit, setPriceUnit] = useState(initUnit);
  const [copied,    setCopied]    = useState(false);
  const copyTimer                 = useRef(null);

  // Guard against stale/unknown unit (e.g. if priceUnits prop changes)
  const resolvedUnit = priceUnits.find((u) => u.id === priceUnit)
    ? priceUnit
    : priceUnits[0]?.id || "";

  const unitMeta = priceUnits.find((u) => u.id === resolvedUnit) || priceUnits[0];
  const currMeta = PRICE_CURRENCIES.find((c) => c.id === currency) || PRICE_CURRENCIES[0];

  const qty      = quantities[resolvedUnit] ?? null;
  const priceNum = parseFloat(price);

  const isValidQty   = qty !== null && isFinite(qty) && qty > 0;
  const isValidPrice = price.trim() !== "" && isFinite(priceNum) && priceNum >= 0;
  const total        = isValidQty && isValidPrice && priceNum > 0 ? qty * priceNum : null;

  // True once ANY quantity in the map is non-null and positive
  const hasData = Object.values(quantities).some(
    (v) => v !== null && v !== undefined && isFinite(v) && v > 0
  );

  // Price validation
  const priceStr = price.trim();
  const priceErr =
    priceStr !== "" && (!isFinite(parseFloat(priceStr)) || parseFloat(priceStr) < 0)
      ? "Enter a valid positive price."
      : null;

  function handleCopy() {
    if (!total) return;
    const lines = [
      "Price Checker / Cost Estimator",
      `Quantity:   ${fmtQty(qty)} ${unitMeta?.display || resolvedUnit}`,
      `Unit Price: ${currMeta.symbol}${fmtMoney(priceNum)} ${unitMeta?.label || resolvedUnit}`,
      `Currency:   ${currency}`,
      `Total Cost: ${currMeta.symbol}${fmtMoney(total)}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setPrice("");
    setCurrency("USD");
    setPriceUnit(initUnit);
    setCopied(false);
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>

      {/* ── Header / toggle ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "15px 20px", background: "none", border: "none",
          borderBottom: isOpen ? "1px solid var(--border)" : "none",
          cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 14, color: "var(--text-primary)", textAlign: "left",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 16 }}>💰</span>
          Price Checker / Cost Estimator
        </span>
        <svg
          width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Body ── */}
      {isOpen && (
        <div style={{ padding: "18px 20px" }}>
          {!hasData ? (
            <p style={{
              fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)",
              fontWeight: 500, textAlign: "center", padding: "12px 0", margin: 0,
            }}>
              Enter values above to estimate project cost.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* ── Inputs row ── */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "2 1 160px", minWidth: 0 }}>
                  <FieldGroup label="Unit Price" hint="Price per selected quantity unit" error={priceErr}>
                    <input
                      type="number" inputMode="decimal" min="0" step="any"
                      value={price} placeholder="0.00"
                      onChange={(e) => setPrice(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = priceErr ? "var(--error)" : "var(--accent)")}
                      onBlur={(e) => (e.target.style.borderColor = priceErr ? "var(--error)" : "var(--border)")}
                      style={{ ...INPUT, borderColor: priceErr ? "var(--error)" : "var(--border)" }}
                    />
                  </FieldGroup>
                </div>
                <div style={{ flex: "1 1 130px", minWidth: 0 }}>
                  <FieldGroup label="Currency">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ ...SELECT, width: "100%" }}
                    >
                      {PRICE_CURRENCIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>
                <div style={{ flex: "1 1 150px", minWidth: 0 }}>
                  <FieldGroup label="Price Unit">
                    <select
                      value={resolvedUnit}
                      onChange={(e) => setPriceUnit(e.target.value)}
                      style={{ ...SELECT, width: "100%" }}
                    >
                      {priceUnits.map((u) => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Quantity display ── */}
              <div style={{
                display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap",
                background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", padding: "10px 16px",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Quantity
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: isValidQty ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {isValidQty ? fmtQty(qty) : "—"}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-muted)" }}>
                  {unitMeta?.display || resolvedUnit}
                </span>
              </div>

              {/* ── Total cost result ── */}
              {total !== null ? (
                <div style={{
                  padding: "16px 20px",
                  background: "var(--accent-light)", border: "1.5px solid var(--accent)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11,
                    color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
                  }}>
                    Estimated Total Cost
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: "clamp(28px, 5vw, 40px)", color: "var(--accent)", letterSpacing: "-0.02em",
                  }}>
                    {currMeta.symbol}{fmtMoney(total)}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 13,
                    color: "var(--accent)", marginTop: 8, lineHeight: 1.5, opacity: 0.9,
                  }}>
                    {fmtQty(qty)} {unitMeta?.display}
                    {" × "}
                    {currMeta.symbol}{fmtMoney(priceNum)} {unitMeta?.label}
                    {" = "}
                    {currMeta.symbol}{fmtMoney(total)}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
                  Enter a unit price above to calculate total cost.
                </p>
              )}

              {/* ── Buttons ── */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopy}
                  disabled={!total}
                  style={{
                    fontSize: 13, padding: "8px 16px",
                    background:  copied ? "#f0fdf4" : undefined,
                    color:       copied ? "#16a34a" : undefined,
                    borderColor: copied ? "#86efac" : undefined,
                    opacity: total ? 1 : 0.45,
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {copied ? "✓ Copied!" : "📋 Copy Results"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleReset}
                  style={{ fontSize: 13, padding: "8px 16px", color: "var(--text-muted)" }}
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
