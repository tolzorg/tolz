import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import { PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { calculateVat, DEFAULTS } from "../../../utils/vatCalculatorEngine";

const HINTS = {
  net: "The price before VAT is applied.",
  gross: "The price after VAT is applied.",
  tax: "The actual VAT tax amount",
};

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function Result({ result }) {
  if (result.resultError) return <ErrorPanel messages={[result.resultError]} />;
  if (result.empty) return null;
  const pie = [
    { label: "Net price", value: result.net, color: "#2b7ddb" },
    { label: "Tax amount", value: result.tax, color: "#8bbc21" },
  ];
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 20, color: "var(--text-primary)" }}>
        <tbody>
          {result.solved.map((row) => (
            <tr key={row.key}>
              <td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>{row.label}:</td>
              <td style={{ padding: "2px 0", fontWeight: 800, color: "var(--success)", fontFamily: "var(--font-display)" }}>{row.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <InvestmentPieChart segments={pie} labelText={(s) => (s.label === "Net price" ? result.pieLabels[0] : result.pieLabels[1])} />
    </div>
  );
}

export default function VatCalculatorTool() {
  // Pre-filled like the reference (not placeholders): a blank field is
  // what tells the calculator which values to solve for.
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [net, setNet] = useState(DEFAULTS.net);
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateVat({ rate, net, gross, tax }));
  }

  function clear() {
    setRate(""); setNet(""); setGross(""); setTax(""); setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        Please provide any two values from the following inputs to calculate the remaining values.
      </p>

      {result?.errors && <ErrorPanel messages={result.errors} />}

      {result && !result.errors && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }} aria-live="polite">
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "16px 18px" }}>
            <Result result={result} />
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 18, width: "100%", maxWidth: 420, margin: "0 auto" }}>
        <FieldRow label="VAT rate"><PercentField value={rate} onChange={setRate} /></FieldRow>
        <FieldRow label="Net price" hint={HINTS.net}><TextField value={net} onChange={setNet} /></FieldRow>
        <FieldRow label="Gross price" hint={HINTS.gross}><TextField value={gross} onChange={setGross} /></FieldRow>
        <FieldRow label="Tax amount" hint={HINTS.tax}><TextField value={tax} onChange={setTax} /></FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>
    </div>
  );
}
