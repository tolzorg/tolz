import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateGeneralApr, calculateMortgageApr, buildAmortization, GENERAL_DEFAULTS, MORTGAGE_DEFAULTS,
  COMPOUND_CHOICES, PAYBACK_CHOICES,
} from "../../../utils/aprCalculatorEngine";
import { formatNumber } from "../../../utils/irrCalculatorEngine";

const HELP = {
  loanedFees: "Loaned fees are fees that are added to the loan amount, increasing the total borrowed amount. They do not need to be paid at the loan closing.",
  upfrontFees: "Upfront fees are fees that lenders request borrowers to pay before or during the loan closing process, prior to the distribution of funds. These are the fees that borrowers need to pay out of pocket in order to finalize a loan.",
};
const GENERAL_TEXT = ["amount", "years", "months", "rate", "loanedFees", "upfrontFees"];
const MORTGAGE_TEXT = Object.keys(MORTGAGE_DEFAULTS);
const empty = (keys) => Object.fromEntries(keys.map((k) => [k, ""]));

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const sectionText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" };
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
const labelTd = { ...td, background: "var(--bg-muted)", textAlign: "left", fontWeight: 400, whiteSpace: "normal" };
const linkButton = { background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 };
const money = (v) => `$${formatNumber(v, 2)}`;

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

function Row({ label, help, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 120px", minWidth: 0 }}><FieldLabel hint={help}>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>{children}</div>
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

function ButtonRow({ onCalculate, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
      <button type="button" onClick={onCalculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

// Compact cells so all five columns fit a phone screen without sideways scrolling.
const schedTd = { padding: "4px 4px", fontSize: 11, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };

function AmortizationTable({ amortization }) {
  const rows = buildAmortization(amortization);
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px" }}>Amortization Schedule</p>
      <div style={{ overflowX: "auto", position: "relative", maxHeight: 480, overflowY: "auto" }}>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
          <thead>
            <tr>
              {["", "Beginning Balance", "Interest", "Principal", "Ending Balance"].map((h, k) => (
                <th key={k} style={{ ...schedTd, background: "var(--bg-muted)", fontWeight: 700, whiteSpace: "normal", position: "sticky", top: 0 }}>
                  {h || <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Payment</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (r.yearEnd ? (
              <tr key={k}><td colSpan={5} style={{ ...schedTd, textAlign: "center", fontWeight: 700, background: "var(--bg-muted)" }}>Year #{r.yearEnd} End</td></tr>
            ) : (
              <tr key={k}>
                <td style={{ ...schedTd, whiteSpace: "normal" }}>{r.label}</td>
                {[r.begin, r.interest, r.principal, r.end].map((v, j) => <td key={j} style={schedTd}>{money(v)}</td>)}
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultCard({ result, idle, withSchedule }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const ok = result && !result.errors && !result.sorry;
  return (
    <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
        {ok ? `Real APR: ${result.apr}` : "Result"}
      </div>
      <div style={{ padding: "14px 16px" }} aria-live="polite">
        {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>{idle}</p>}
        {result?.errors && <ErrorPanel messages={result.errors} />}
        {result?.sorry && <ErrorPanel messages={[result.sorry]} />}
        {ok && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
              <div style={{ flex: "1 0 auto", maxWidth: "100%", minWidth: 0 }}>
                <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", maxWidth: "100%" }}>
                  <tbody>
                    {result.rows.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row" style={labelTd}>{label}</th>
                        <td style={{ ...td, textAlign: "right" }}><strong>{value}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.notes.map((n) => <p key={n} style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "6px 0 0" }}>{n}</p>)}
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                {/* Small slices (fees are often 1–2%) would crowd the ring, so the
                    legend carries every percentage. */}
                <InvestmentPieChart
                  segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${Math.round((p.value / result.pie.reduce((s, x) => s + Math.max(0, x.value), 0)) * 100)}%)` }))}
                  labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                />
              </div>
            </div>
            {withSchedule && (
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button type="button" style={linkButton} onClick={() => setShowSchedule((s) => !s)} aria-expanded={showSchedule}>
                  {showSchedule ? "Hide Amortization Table" : "View Amortization Table"}
                </button>
              </div>
            )}
            {withSchedule && showSchedule && <AmortizationTable amortization={result.amortization} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ── General APR Calculator ───────────────────────────────────── */

function GeneralAprCalculator() {
  const D = GENERAL_DEFAULTS;
  const [v, setV] = useState(empty(GENERAL_TEXT));
  const [compound, setCompound] = useState(D.compound);
  const [payback, setPayback] = useState(D.payback);
  const [result, setResult] = useState(null);
  const [runId, setRunId] = useState(0);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  // The example applies only while every box is empty; otherwise a blank box
  // means what it means on the reference.
  const calculate = () => {
    const values = GENERAL_TEXT.every((k) => v[k] === "") ? D : v;
    setResult(calculateGeneralApr({ ...values, compound, payback }));
    setRunId((n) => n + 1);
  };
  const clear = () => { setV(empty(GENERAL_TEXT)); setCompound(D.compound); setPayback(D.payback); setResult(null); };

  return (
    <section aria-labelledby="apr-general-title">
      <h2 id="apr-general-title" style={sectionTitle}>General APR Calculator</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginTop: 8 }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 16 }}>
          <Row label="Loan Amount"><DollarField value={v.amount} onChange={set("amount")} placeholder={D.amount} /></Row>
          <Row label="Loan Term">
            <UnitField value={v.years} onChange={set("years")} placeholder={D.years} unit="years" />
            <UnitField value={v.months} onChange={set("months")} placeholder={D.months} unit="months" />
          </Row>
          <Row label="Interest Rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Row>
          <Row label="Compound"><SelectField value={compound} onChange={setCompound} options={COMPOUND_CHOICES} style={{ width: "100%" }} /></Row>
          <Row label="Pay Back"><SelectField value={payback} onChange={setPayback} options={PAYBACK_CHOICES} style={{ width: "100%" }} /></Row>
          <Row label="Loaned Fees" help={HELP.loanedFees}><DollarField value={v.loanedFees} onChange={set("loanedFees")} placeholder={D.loanedFees} /></Row>
          <Row label="Upfront Fees" help={HELP.upfrontFees}><DollarField value={v.upfrontFees} onChange={set("upfrontFees")} placeholder={D.upfrontFees} /></Row>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <ResultCard key={runId} result={result} withSchedule idle="Enter the loan details, then click Calculate to see the real APR." />
      </div>
    </section>
  );
}

/* ── Mortgage APR Calculator ──────────────────────────────────── */

function MortgageAprCalculator() {
  const D = MORTGAGE_DEFAULTS;
  const [v, setV] = useState(empty(MORTGAGE_TEXT));
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const calculate = () => setResult(calculateMortgageApr(MORTGAGE_TEXT.every((k) => v[k] === "") ? D : v));
  const clear = () => { setV(empty(MORTGAGE_TEXT)); setResult(null); };

  return (
    <section aria-labelledby="apr-mortgage-title">
      <h2 id="apr-mortgage-title" style={sectionTitle}>Mortgage APR Calculator</h2>
      <p style={sectionText}>Use the calculator below for mortgage loans in the United States.</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 16 }}>
          <Row label="House Value"><DollarField value={v.houseValue} onChange={set("houseValue")} placeholder={D.houseValue} /></Row>
          <Row label="Down Payment"><PercentField value={v.downPayment} onChange={set("downPayment")} placeholder={D.downPayment} /></Row>
          <Row label="Loan Term"><UnitField value={v.years} onChange={set("years")} placeholder={D.years} unit="years" /></Row>
          <Row label="Interest Rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Row>
          <Row label="Loan Fees"><DollarField value={v.loanFees} onChange={set("loanFees")} placeholder={D.loanFees} /></Row>
          <Row label="Points"><TextField value={v.points} onChange={set("points")} placeholder={D.points} /></Row>
          <Row label="PMI Insurance"><UnitField value={v.pmi} onChange={set("pmi")} placeholder={`$${D.pmi}`} unit="/year" /></Row>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <ResultCard result={result} idle="Enter the mortgage details, then click Calculate to see the real APR." />
      </div>
    </section>
  );
}

export default function AprCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <GeneralAprCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <MortgageAprCalculator />
    </div>
  );
}
