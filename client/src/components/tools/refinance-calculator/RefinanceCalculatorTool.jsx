import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { calculateRefinance, REFINANCE_DEFAULTS } from "../../../utils/refinanceCalculatorEngine";

const D = REFINANCE_DEFAULTS;
const BALANCE_KEYS = ["balance", "payment"];
const ORIGINAL_KEYS = ["originalAmount", "originalTerm", "remainingYears", "remainingMonths"];
const SHARED_KEYS = ["rate", "newTerm", "newRate", "points", "costs", "cashOut"];
const EMPTY = Object.fromEntries([...BALANCE_KEYS, ...ORIGINAL_KEYS, ...SHARED_KEYS].map((k) => [k, ""]));
const MODES = [{ value: "balance", label: "I know my remaining balance" }, { value: "original", label: "I know the original loan amount" }];
const HELP = {
  points: "Also known as discount points or mortgage points, these represent a form of prepaying interest in exchange for a reduced interest rate. A single point corresponds to one percent of the loan amount. These points are typically paid upfront.",
  costs: "The sum of all fees and costs associated with the new loan, including but not limited to application fee, origination fee, appraisal fee, document fee, and credit report fee. These fees are typically paid upfront.",
  cashOut: "This refers to the cash amount you intend to withdraw as part of the refinance. If your intention is to contribute additional funds rather than withdrawing, please use a negative number.",
};
const GOOD = "var(--success)";
const BAD = "#dc2626";

const sectionTitle = { background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-display)", padding: "7px 10px", borderRadius: "var(--radius-sm)", margin: "0 0 12px" };
const cell = { padding: "6px 10px", fontSize: 13, color: "var(--text-primary)", border: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" };

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

function Row({ label, help, children, alignTop }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: alignTop ? "flex-start" : "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 130px", minWidth: 0, paddingTop: alignTop ? 9 : 0 }}><FieldLabel hint={help}>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 180px", maxWidth: 230, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>{children}</div>
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

/** Highlight the verdict phrase ("less expensive" / "more expensive") as the reference does. */
function Verdict({ verdict }) {
  const phrase = verdict.tone === "good" ? "less expensive" : verdict.tone === "bad" ? "more expensive" : null;
  const [before, after] = phrase ? verdict.text.split(phrase) : [verdict.text, ""];
  const aprMatch = before.match(/^(The APR for the new loan is )([^,]+)(,[\s\S]*)$/);
  return (
    <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.55, margin: "0 0 12px" }}>
      {aprMatch ? <>{aprMatch[1]}<strong>{aprMatch[2]}</strong>{aprMatch[3]}</> : before}
      {phrase && <strong style={{ color: verdict.tone === "good" ? GOOD : BAD }}>{phrase}</strong>}
      {after}
    </p>
  );
}

export default function RefinanceCalculatorTool() {
  const [mode, setMode] = useState("balance");
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  // The example applies only while every visible box is empty; otherwise a
  // blank box means what it means on the reference.
  const calculate = () => {
    const visible = [...(mode === "balance" ? BALANCE_KEYS : ORIGINAL_KEYS), ...SHARED_KEYS];
    const values = visible.every((k) => v[k] === "") ? D : v;
    setResult(calculateRefinance({ ...values, knowBalance: mode === "balance" }));
  };
  const clear = () => { setV(EMPTY); setResult(null); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your current and new loan details, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        {result.verdict && <Verdict verdict={result.verdict} />}
        <p style={{ fontSize: 16, color: "var(--text-primary)", margin: "0 0 6px" }}>New monthly payment: <strong>{result.newPayment}</strong></p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6 }}>
          {result.bullets.map((b) => (
            <li key={b.text || b.label}>
              {b.label}
              <strong style={{ color: b.good ? GOOD : BAD }}>{b.value}</strong>
              {b.text}
            </li>
          ))}
        </ul>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...cell, background: "var(--bg-muted)" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Item</span></th>
                {["Current loan (remaining)", "New loan", "Difference"].map((h) => <th key={h} style={{ ...cell, background: "var(--bg-muted)", fontWeight: 700, whiteSpace: "normal" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.rows.map(([label, ...vals]) => (
                <tr key={label}>
                  <td style={{ ...cell, textAlign: "left", whiteSpace: "normal" }}>{label}</td>
                  {vals.map((x, k) => <td key={k} style={cell}>{x}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 380px", minWidth: 280, maxWidth: 500, padding: 18 }}>
        <div style={sectionTitle}>Current loan</div>
        <div style={{ marginBottom: 10 }}>
          <SelectField value={mode} onChange={setMode} options={MODES} style={{ width: "100%" }} />
        </div>
        {mode === "balance" ? (
          <>
            <Row label="Remaining balance"><DollarField value={v.balance} onChange={set("balance")} placeholder={D.balance} /></Row>
            <Row label="Monthly payment"><DollarField value={v.payment} onChange={set("payment")} placeholder={D.payment} /></Row>
          </>
        ) : (
          <>
            <Row label="Original loan amount"><DollarField value={v.originalAmount} onChange={set("originalAmount")} placeholder={D.originalAmount} /></Row>
            <Row label="Loan term"><UnitField value={v.originalTerm} onChange={set("originalTerm")} placeholder={D.originalTerm} unit="years" /></Row>
            <Row label="Time remaining" alignTop>
              <UnitField value={v.remainingYears} onChange={set("remainingYears")} placeholder={D.remainingYears} unit="years" />
              <UnitField value={v.remainingMonths} onChange={set("remainingMonths")} placeholder={D.remainingMonths} unit="months" />
            </Row>
          </>
        )}
        <Row label="Interest rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Row>

        <div style={{ ...sectionTitle, marginTop: 16 }}>New loan</div>
        <Row label="New loan term"><UnitField value={v.newTerm} onChange={set("newTerm")} placeholder={D.newTerm} unit="years" /></Row>
        <Row label="Interest rate"><PercentField value={v.newRate} onChange={set("newRate")} placeholder={D.newRate} /></Row>
        <Row label="Points" help={HELP.points}><TextField value={v.points} onChange={set("points")} placeholder={D.points} /></Row>
        <Row label="Costs and fees" help={HELP.costs}><DollarField value={v.costs} onChange={set("costs")} placeholder={D.costs} /></Row>
        <Row label="Cash out amount" help={HELP.cashOut}><TextField value={v.cashOut} onChange={set("cashOut")} placeholder={`$${D.cashOut}`} /></Row>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      <div className="card" style={{ flex: "1 1 440px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>Results</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
