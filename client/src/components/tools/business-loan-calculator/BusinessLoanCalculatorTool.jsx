import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateBusinessLoan, buildBusinessLoanSchedule, formatTableMoney,
  COMPOUND_OPTIONS, PAYBACK_OPTIONS, BUSINESS_LOAN_DEFAULTS,
} from "../../../utils/businessLoanCalculatorEngine";

const D = BUSINESS_LOAN_DEFAULTS;
const TEXT_KEYS = ["loanAmount", "interestRate", "years", "months", "originationFee", "documentationFee", "otherFees"];
const EMPTY = Object.fromEntries(TEXT_KEYS.map((k) => [k, ""]));

const rowStyle = { display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 };
const th = { textAlign: "right", padding: "8px 10px", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", position: "sticky", top: 0, background: "var(--bg-white)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
const td = { textAlign: "right", padding: "7px 10px", fontSize: 13, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };

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

function UnitField({ value, onChange, placeholder, unit }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 62 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>{unit}</span>
    </div>
  );
}

function ScheduleTable({ schedule }) {
  const rows = buildBusinessLoanSchedule(schedule);
  return (
    <div className="card" style={{ padding: 18 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 14px" }}>Amortization Schedule</h2>
      <div style={{ maxHeight: 460, overflow: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <table className="data-table data-table--framed" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>#</th>
              <th style={th}>Beginning Balance</th>
              <th style={th}>Interest</th>
              <th style={th}>Principal</th>
              <th style={th}>Ending Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (r.type === "year" ? (
              <tr key={`y${idx}`}>
                <td colSpan={5} style={{ ...td, textAlign: "center", fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-muted)" }}>{r.label}</td>
              </tr>
            ) : (
              <tr key={`r${idx}`}>
                <td style={{ ...td, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" }}>{r.label}</td>
                <td style={td}>{formatTableMoney(r.begin)}</td>
                <td style={td}>{formatTableMoney(r.interest)}</td>
                <td style={td}>{formatTableMoney(r.change)}</td>
                <td style={td}>{formatTableMoney(r.ending)}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BusinessLoanCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [compound, setCompound] = useState(D.compound);
  const [payback, setPayback] = useState(D.payback);
  const [result, setResult] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  // The example is used only while every box is empty; otherwise blanks
  // mean what they mean on the reference (no fee, 0 years/months).
  const calculate = () => {
    const values = TEXT_KEYS.every((k) => v[k] === "") ? D : v;
    setResult(calculateBusinessLoan({ ...values, compound, payback }));
    setShowTable(false);
  };
  const clear = () => { setV(EMPTY); setResult(null); setShowTable(false); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the loan details, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        {result.head && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--success)", margin: "0 0 6px", fontFamily: "var(--font-display)" }}>{result.head.title}</p>
            <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0, lineHeight: 1.55 }}>{result.head.text}</p>
          </div>
        )}
        {result.rows.map((r, idx) => (
          <div key={r.label} style={{ ...rowStyle, borderBottom: idx === result.rows.length - 1 ? "none" : rowStyle.borderBottom }}>
            <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
        {result.pie && (
          <div style={{ marginTop: 14 }}>
            <InvestmentPieChart segments={result.pie} labelText={(s) => `${s.percent}%`} />
          </div>
        )}
        {result.schedule && (
          <button
            type="button"
            onClick={() => setShowTable((x) => !x)}
            aria-expanded={showTable}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", padding: "14px 0 0", textDecoration: "underline" }}
          >
            {showTable ? "Hide Amortization Table" : "View Amortization Table"}
          </button>
        )}
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 18 }}>
          <FieldRow label="Loan amount"><DollarField value={v.loanAmount} onChange={set("loanAmount")} placeholder={D.loanAmount} /></FieldRow>
          <FieldRow label="Interest rate"><PercentField value={v.interestRate} onChange={set("interestRate")} placeholder={D.interestRate} /></FieldRow>
          <FieldRow label="Compound"><SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} style={{ flex: 1, minWidth: 0 }} /></FieldRow>
          <FieldRow label="Loan term">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
              <UnitField value={v.years} onChange={set("years")} placeholder={D.years} unit="years" />
              <UnitField value={v.months} onChange={set("months")} placeholder={D.months} unit="months" />
            </div>
          </FieldRow>
          <FieldRow label="Pay back"><SelectField value={payback} onChange={setPayback} options={PAYBACK_OPTIONS} style={{ flex: 1, minWidth: 0 }} /></FieldRow>
          <FieldRow label="Origination fee"><PercentField value={v.originationFee} onChange={set("originationFee")} placeholder={D.originationFee} /></FieldRow>
          <FieldRow label="Documentation fee"><DollarField value={v.documentationFee} onChange={set("documentationFee")} placeholder={D.documentationFee} /></FieldRow>
          <FieldRow label="Other fees"><DollarField value={v.otherFees} onChange={set("otherFees")} placeholder={D.otherFees} /></FieldRow>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
        <div className="card" style={{ flex: "1 1 360px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
        </div>
      </div>
      {result && result.schedule && showTable && <ScheduleTable schedule={result.schedule} />}
    </div>
  );
}
