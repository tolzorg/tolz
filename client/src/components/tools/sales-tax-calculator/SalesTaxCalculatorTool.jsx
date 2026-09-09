import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import { calculateSalesTax, formatCurrency, formatPercent } from "../../../utils/salesTaxCalculatorEngine";

const DEFAULTS = { beforeTax: "100", taxRate: "6.5", afterTax: "" };

// Live thousands-separator formatting on the DISPLAYED value only — state
// stays a plain numeric string — matching the established DollarField
// convention used throughout this app's loan-family calculators.
function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19 }}
      />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={(v) => onChange(stripToNumberString(v))} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>%</span>
    </div>
  );
}

function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

const resultRow = { fontSize: 15, color: "var(--text-primary)", marginBottom: 10 };
const solvedValue = { color: "var(--success)", fontWeight: 800 };

export default function SalesTaxCalculatorTool() {
  // All 3 fields start genuinely blank, matching this site's usual
  // placeholder-only convention (DEFAULTS is shown only as grey
  // placeholder hint text below, never pre-filled into state). Blank is
  // still MEANINGFUL here — leaving a field empty is how you tell the
  // calculator which value to solve for — so, unlike every other
  // calculator in this app, `calculate()` deliberately does NOT fall
  // back to DEFAULTS for any field: a `value || DEFAULTS.value` fallback
  // on beforeTax/taxRate would silently prevent ever clearing them to
  // solve for them, breaking the "solve for ANY ONE of the three"
  // behavior this calculator exists for.
  const [beforeTax, setBeforeTax] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [afterTax, setAfterTax] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateSalesTax({ beforeTax, taxRate, afterTax }));
  }

  function clear() {
    setBeforeTax(""); setTaxRate(""); setAfterTax(""); setResult(null);
  }

  return (
    <div className="animate-fadeUp" style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ padding: 16, flex: "1 1 320px", minWidth: 300 }}>
        <FieldRow label="Before Tax Price">
          <DollarField value={beforeTax} onChange={setBeforeTax} placeholder={DEFAULTS.beforeTax} />
        </FieldRow>

        <FieldRow label="Sales Tax Rate">
          <PercentField value={taxRate} onChange={setTaxRate} placeholder={DEFAULTS.taxRate} />
        </FieldRow>

        <FieldRow label="After Tax Price">
          <DollarField value={afterTax} onChange={setAfterTax} placeholder="" />
        </FieldRow>

        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 14px" }}>
          Leave any ONE of the three fields blank — it will be solved from the other two.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      <div style={{ flex: "1 1 300px", minWidth: 300 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            Result
          </div>
          <div style={{ padding: "14px 16px" }}>
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                Fill in any two of the three fields and click <strong>Calculate</strong> to solve for the third.
              </p>
            ) : result.error ? (
              <ErrorPanel message={result.error} />
            ) : (
              <>
                <p style={resultRow}>
                  Before Tax Price: <span style={result.solved === "before" ? solvedValue : undefined}>{formatCurrency(result.before)}</span>
                </p>
                <p style={resultRow}>
                  Sale Tax: <span style={result.solved === "rate" ? solvedValue : undefined}>{formatPercent(result.rate)}</span>{" "}
                  or <span style={solvedValue}>{formatCurrency(result.taxDollar)}</span>
                </p>
                <p style={{ ...resultRow, marginBottom: 0 }}>
                  After Tax Price: <span style={result.solved === "after" ? solvedValue : undefined}>{formatCurrency(result.after)}</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
