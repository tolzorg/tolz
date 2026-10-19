import { useState } from "react";
import { Link } from "react-router-dom";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { inputStyle } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateFixedIrr, calculateIrregularIrr, FIXED_DEFAULTS, IRREGULAR_DEFAULTS, FREQUENCIES,
  IRREGULAR_YEARS, IRREGULAR_VISIBLE,
} from "../../../utils/irrCalculatorEngine";
import { useRequiredFields, pickFields, withFill, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const FLOW_TYPES = [{ value: "d", label: "Deposit" }, { value: "w", label: "Withdraw" }];
const FREQUENCY_OPTIONS = FREQUENCIES.map(({ value, label }) => ({ value, label }));
const FIXED_TEXT_KEYS = ["initial", "years", "months", "ending", "amount"];
const EMPTY_FIXED = Object.fromEntries(FIXED_TEXT_KEYS.map((k) => [k, ""]));
const blankFlows = () => Array(IRREGULAR_YEARS).fill("");

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const sectionText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" };
const linkButton = { background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" };
// Full grid like the site's other result tables: every cell bordered, labels shaded.
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, textAlign: "right", whiteSpace: "nowrap" };
const labelTd = { ...td, background: "var(--bg-muted)", textAlign: "left", fontWeight: 400 };

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

/** A dollar box that keeps a leading minus sign (cash flows can be negative). */
function SignedDollarField({ value, onChange, placeholder, label }) {
  const invalid = useRequiredState(value);
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <input
        type="text" inputMode="decimal" value={value} {...requiredInputProps(invalid, placeholder)} aria-label={label}
        onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, paddingLeft: 19 }}
      />
    </div>
  );
}

function UnitField({ value, onChange, placeholder, unit }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 58 }} />
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12.5, pointerEvents: "none" }}>{unit}</span>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 120px", minWidth: 0 }}>{label && <FieldLabel>{label}</FieldLabel>}</div>
      <div style={{ flex: "1 1 220px", maxWidth: 280, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function ResultBody({ result, idle }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>{idle}</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.sorry) return <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{result.sorry}</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
      {/* Table keeps its natural width (never squeezed); the pie wraps below when the row is too narrow. */}
      <div style={{ flex: "1 0 auto", maxWidth: "100%", minWidth: 0 }}>
        <p style={{ fontSize: 18, color: "var(--text-primary)", margin: "0 0 12px", fontFamily: "var(--font-display)" }}>
          IRR = <strong style={{ color: "var(--success)" }}>{result.irr} per year</strong>.
        </p>
        <div style={{ overflowX: "auto", position: "relative" }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
            <tbody>
              {result.rows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row" style={labelTd}>{label}</th>
                  <td style={td}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.note && <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "8px 0 0" }}>{result.note}</p>}
      </div>
      {result.pie && (
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          {/* Dollar labels outside the ring get clipped on narrow cards, so the
              legend carries the amounts and the ring shows percentages. */}
          <InvestmentPieChart
            segments={result.pie.map((p) => ({ ...p, label: `${p.label} (${p.text})` }))}
            labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
          />
        </div>
      )}
    </div>
  );
}

/* ── 1. IRR based on fixed cash flow ───────────────────────────── */

function FixedCashFlowCalculator() {
  const [v, setV] = useState(EMPTY_FIXED);
  const [flowType, setFlowType] = useState(FIXED_DEFAULTS.flowType);
  const [frequency, setFrequency] = useState(FIXED_DEFAULTS.frequency);
  const [timing, setTiming] = useState(FIXED_DEFAULTS.timing);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const D = FIXED_DEFAULTS;

  // The example applies only while every box is empty; otherwise a blank box
  // means what it means on the reference.
  const req = useRequiredFields();
  const calculate = () => {
    setResult(req.evaluate(pickFields(v, FIXED_TEXT_KEYS), (fill) => calculateFixedIrr({ ...withFill(v, D, fill), flowType, frequency, timing })));
  };
  const clear = () => {
    setV(EMPTY_FIXED); setFlowType(D.flowType); setFrequency(D.frequency); setTiming(D.timing); setResult(null);
  };

  return (
    <section aria-labelledby="irr-fixed-title">
      <h2 id="irr-fixed-title" style={sectionTitle}>IRR based on fixed cash flow</h2>
      <p style={sectionText}>This calculator computes the IRR based on a fixed recurring cash flow or no cash flow.</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 500, padding: 16 }}>
          <Row label="Initial Investment"><Req name="initial" flagged={req.flagged}><DollarField value={v.initial} onChange={set("initial")} placeholder={D.initial} /></Req></Row>
          <Row label="Holding">
            <Req name="years" flagged={req.flagged}><UnitField value={v.years} onChange={set("years")} placeholder={D.years} unit="years" /></Req>
            <Req name="months" flagged={req.flagged}><UnitField value={v.months} onChange={set("months")} placeholder={D.months} unit="months" /></Req>
          </Row>
          <Row label="Ending Balance"><Req name="ending" flagged={req.flagged}><DollarField value={v.ending} onChange={set("ending")} placeholder={D.ending} /></Req></Row>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <SelectField value={flowType} onChange={setFlowType} options={FLOW_TYPES} style={{ flex: "0 0 112px", minWidth: 0 }} />
            <div style={{ flex: "1 1 110px", minWidth: 0 }}><Req name="amount" flagged={req.flagged}><DollarField value={v.amount} onChange={set("amount")} placeholder={D.amount} /></Req></div>
            <SelectField value={frequency} onChange={setFrequency} options={FREQUENCY_OPTIONS} style={{ flex: "0 1 140px", minWidth: 0 }} />
          </div>
          <fieldset style={{ border: "none", padding: 0, margin: "2px 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontSize: 13.5, color: "var(--text-primary)" }}>
            <legend style={{ float: "left", padding: 0, marginRight: 4 }}>at the</legend>
            {[["b", "beginning"], ["e", "end of each period"]].map(([value, label]) => (
              <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: timing === value ? 700 : 400 }}>
                <input type="radio" name="irr-timing" checked={timing === value} onChange={() => setTiming(value)} />
                {label}
              </label>
            ))}
          </fieldset>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} idle="Enter the investment, holding time, ending balance and any recurring cash flow, then click Calculate." />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. IRR based on irregular cash flow ───────────────────────── */

function IrregularCashFlowCalculator() {
  const [initial, setInitial] = useState("");
  const [flows, setFlows] = useState(blankFlows);
  const [showMore, setShowMore] = useState(false);
  const [result, setResult] = useState(null);
  const D = IRREGULAR_DEFAULTS;

  const setFlow = (i) => (value) => setFlows((prev) => prev.map((f, j) => (j === i ? value : f)));
  // Blank years count as $0, as on the reference; empty boxes the IRR needs are flagged.
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { initial, ...Object.fromEntries(flows.map((f, i) => [`f${i}`, f])) },
    (fill) => calculateIrregularIrr({
      initial: fill.has("initial") ? D.initial : initial,
      flows: flows.map((f, i) => (fill.has(`f${i}`) ? D.flows[i] : f)),
    }),
  ));
  const clear = () => { req.clear(); setInitial(""); setFlows(blankFlows()); setResult(null); };
  const rowCount = showMore ? IRREGULAR_YEARS : IRREGULAR_VISIBLE;

  return (
    <section aria-labelledby="irr-irregular-title">
      <h2 id="irr-irregular-title" style={sectionTitle}>IRR based on irregular cash flow</h2>
      <p style={sectionText}>
        This calculator computes the IRR based on the initial investment and subsequent annual cash flows. If you want to
        calculate the IRR for cash flows that are not annual, please use our{" "}
        <Link to="/calculators/financial/average-return-calculator" style={{ color: "var(--accent)" }}>Average Return Calculator</Link>.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 420, padding: 16 }}>
          <Row label="Initial Investment"><Req name="initial" flagged={req.flagged}><DollarField value={initial} onChange={setInitial} placeholder={D.initial} /></Req></Row>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: "8px 0 8px" }}>Cash Flow:</p>
          {flows.slice(0, rowCount).map((flow, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, paddingLeft: 8 }}>
              <span style={{ flex: "0 0 62px", fontSize: 13, color: "var(--text-secondary)" }}>Year {i + 1}.</span>
              <Req name={`f${i}`} flagged={req.flagged}><SignedDollarField value={flow} onChange={setFlow(i)} placeholder={D.flows[i]} label={`Cash flow in year ${i + 1}`} /></Req>
            </div>
          ))}
          <div style={{ padding: "2px 0 0 78px" }}>
            <button type="button" onClick={() => setShowMore((s) => !s)} style={linkButton} aria-expanded={showMore}>
              {showMore ? "Hide Fields Below" : "Show More Input Fields"}
            </button>
          </div>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} idle="Enter the initial investment and the yearly cash flows (negative for further investments), then click Calculate." />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IrrCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <FixedCashFlowCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <IrregularCashFlowCalculator />
    </div>
  );
}
