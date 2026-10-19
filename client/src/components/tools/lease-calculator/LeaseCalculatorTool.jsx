import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { calculateLease, formatPiePercent, LEASE_DEFAULTS } from "../../../utils/leaseCalculatorEngine";
import { useRequiredFields, pickFields, withFill, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = LEASE_DEFAULTS;
const EMPTY = { assetValue: "", residualValue: "", years: "", months: "", interestRate: "", monthlyPay: "" };

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

function Row({ label, children, alignTop }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: alignTop ? "flex-start" : "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 120px", minWidth: 0, paddingTop: alignTop ? 9 : 0 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 200px", maxWidth: 250, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function UnitField({ value, onChange, placeholder, unit }) {
  return (
    <div style={{ position: "relative", display: "flex" }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 62 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12.5, pointerEvents: "none" }}>{unit}</span>
    </div>
  );
}

export default function LeaseCalculatorTool() {
  const [mode, setMode] = useState("rate");
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const visibleKeys = ["assetValue", "residualValue", "years", "months", mode === "rate" ? "interestRate" : "monthlyPay"];

  // The example applies only while every visible box is empty; otherwise a
  // blank box means what it means on the reference. The Monthly Payment box
  // keeps its value across tabs, as on the reference (it drives the chart).
  const req = useRequiredFields();
  const calculate = () => {
    const hiddenPay = mode === "rate" ? v.monthlyPay || D.monthlyPay : v.monthlyPay;
    setResult(req.evaluate(pickFields(v, visibleKeys), (fill) => calculateLease({ ...withFill(v, D, fill), monthlyPay: fill.has("monthlyPay") ? D.monthlyPay : hiddenPay, mode })));
  };
  const clear = () => { req.clear(); setV(EMPTY); setResult(null); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the lease details, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else if (result.message) {
    body = <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{result.message}</p>;
  } else if (result.empty) {
    body = null;
  } else {
    body = (
      <>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr style={{ background: "var(--bg-muted)" }}>
              <td style={{ padding: "8px 10px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{result.headline.label}</td>
              <td style={{ padding: "8px 10px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", textAlign: "right" }}>{result.headline.value}</td>
            </tr>
            {result.rows.map((r) => (
              <tr key={r.label} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 10px", fontSize: 13.5, color: "var(--text-secondary)" }}>{r.label}</td>
                <td style={{ padding: "8px 10px", fontSize: 13.5, color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.pie && (
          <div style={{ marginTop: 14 }}>
            <InvestmentPieChart segments={result.pie} labelText={(s) => formatPiePercent(s.percent)} />
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 460 }}>
        {/* Same tab style as the Auto Loan and Boat Loan calculators: the active tab is the blue one. */}
        <div role="tablist" aria-label="Calculate" style={{ display: "flex", marginBottom: -1 }}>
          {[["rate", "Fixed Rate"], ["pay", "Fixed Pay"]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => { setMode(key); setResult(null); }}
              style={{
                flex: 1, padding: "11px 0", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
                border: "1px solid var(--border)", borderBottom: mode === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                borderTopLeftRadius: key === "rate" ? "var(--radius-md)" : 0,
                borderTopRightRadius: key === "pay" ? "var(--radius-md)" : 0,
                background: mode === key ? "var(--accent)" : "var(--bg-white)",
                color: mode === key ? "#fff" : "var(--text-primary)",
                position: "relative", zIndex: mode === key ? 1 : 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="card" role="tabpanel" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Row label="Asset Value"><Req name="assetValue" flagged={req.flagged}><DollarField value={v.assetValue} onChange={set("assetValue")} placeholder={D.assetValue} /></Req></Row>
          <Row label="Residual Value"><Req name="residualValue" flagged={req.flagged}><DollarField value={v.residualValue} onChange={set("residualValue")} placeholder={D.residualValue} /></Req></Row>
          <Row label="Lease Term" alignTop>
            <Req name="years" flagged={req.flagged}><UnitField value={v.years} onChange={set("years")} placeholder={D.years} unit="years" /></Req>
            <Req name="months" flagged={req.flagged}><UnitField value={v.months} onChange={set("months")} placeholder={D.months} unit="months" /></Req>
          </Row>
          {mode === "rate"
            ? <Row label="Interest Rate"><Req name="interestRate" flagged={req.flagged}><PercentField value={v.interestRate} onChange={set("interestRate")} placeholder={D.interestRate} /></Req></Row>
            : <Row label="Monthly Payment"><Req name="monthlyPay" flagged={req.flagged}><DollarField value={v.monthlyPay} onChange={set("monthlyPay")} placeholder={D.monthlyPay} /></Req></Row>}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ flex: "1 1 360px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>Result</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
