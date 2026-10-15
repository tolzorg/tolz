import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { linkButton } from "../fha-loan-calculator/mortgageFormHelpers";
import {
  calculateFixedCashFlow, calculateIrregularCashFlow, FIXED_DEFAULTS, IRREGULAR_DEFAULTS, MAX_YEARS,
} from "../../../utils/paybackPeriodCalculatorEngine";

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 10px" };
// Compact cells so all five columns fit a phone screen.
const cell = { padding: "4px 5px", fontSize: 11.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };
const head = { ...cell, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" };
const VISIBLE_FLOWS = 8;

// Values inside the result sentences (years, $ amounts, rates) get the same
// green highlight as the labelled results.
const VALUE_PATTERN = /(\$-?[\d,]+(?:\.\d+)?(?:\/year)?|-?[\d,]+(?:\.\d+)?%|-?[\d,]+(?:\.\d+)? years)/;

function HighlightedText({ text }) {
  return text.split(VALUE_PATTERN).map((part, i) => (i % 2 === 1
    ? <strong key={i} style={{ color: "var(--success)" }}>{part}</strong>
    : part));
}

const ALL_COLUMNS = [["cash", "Cash Flow"], ["net", "Net Cash Flow"], ["disc", "Discounted Cash Flow"], ["netDisc", "Net Discounted Cash Flow"]];

function ScheduleTable({ rows, columns }) {
  return (
    <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
      <thead>
        <tr>
          <th style={head}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Year</span></th>
          {columns.map(([key, label]) => <th key={key} style={head}>{label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row" style={{ ...cell, fontWeight: 400, textAlign: "left" }}>{r.label}</th>
            {columns.map(([key]) => <td key={key} style={cell}>{r[key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultCard({ result }) {
  const ok = result && !result.errors;
  return (
    <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>Result</div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }} aria-live="polite">
        {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the investment and cash flows, then click Calculate.</p>}
        {result?.errors && <ErrorPanel messages={result.errors} />}
        {ok && (
          <>
            {result.lines.map((l, i) => (
              <p key={i} style={{ fontSize: 15.5, color: "var(--text-primary)", margin: 0, lineHeight: 1.45 }}>
                {l.text ? <HighlightedText text={l.text} /> : <>{l.label}: <strong style={{ color: "var(--success)" }}>{l.value}</strong></>}
              </p>
            ))}
            <div className="desktop-only" style={{ overflowX: "auto", marginTop: 4 }}>
              <ScheduleTable rows={result.rows} columns={result.discounted ? ALL_COLUMNS : ALL_COLUMNS.slice(0, 2)} />
            </div>
            {/* Phones: the schedule split into two three-column tables so every value fits. */}
            <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              <ScheduleTable rows={result.rows} columns={ALL_COLUMNS.slice(0, 2)} />
              {result.discounted && <ScheduleTable rows={result.rows} columns={ALL_COLUMNS.slice(2)} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FixedCashFlow() {
  const D = FIXED_DEFAULTS;
  const keys = Object.keys(D);
  const blank = () => Object.fromEntries(keys.map((k) => [k, ""]));
  const [v, setV] = useState(blank);
  const [direction, setDirection] = useState("increase");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const calculate = () => setResult(calculateFixedCashFlow({ ...(keys.every((k) => v[k] === "") ? D : v), direction }));
  const clear = () => { setV(blank()); setDirection("increase"); setResult(null); };

  return (
    <section aria-labelledby="pb-fixed-title">
      <h2 id="pb-fixed-title" style={sectionTitle}>Fixed Cash Flow</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Initial Investment"><DollarField value={v.investment} onChange={set("investment")} placeholder={D.investment} /></Row>
          <Row label="Cash Flow" suffix="/Year"><DollarField value={v.cashFlow} onChange={set("cashFlow")} placeholder={D.cashFlow} /></Row>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
            <div style={{ flex: "1 1 120px", minWidth: 0 }}>
              <SelectField value={direction} onChange={setDirection} options={[{ value: "increase", label: "Increase" }, { value: "decrease", label: "Decrease" }]} style={{ width: 130 }} />
            </div>
            <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex" }}><PercentField value={v.changeRate} onChange={set("changeRate")} placeholder={D.changeRate} /></div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/Year</span>
            </div>
          </div>
          <Row label="Number of Years"><TextField value={v.years} onChange={set("years")} placeholder={D.years} /></Row>
          <Row label="Discount Rate"><PercentField value={v.discountRate} onChange={set("discountRate")} placeholder={D.discountRate} /></Row>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <ResultCard result={result} />
      </div>
    </section>
  );
}

function IrregularCashFlow() {
  const D = IRREGULAR_DEFAULTS;
  const emptyFlows = () => Array.from({ length: MAX_YEARS }, () => "");
  const [investment, setInvestment] = useState("");
  const [discountRate, setDiscountRate] = useState("");
  const [flows, setFlows] = useState(emptyFlows);
  const [showMore, setShowMore] = useState(false);
  const [result, setResult] = useState(null);
  const setFlow = (k) => (value) => setFlows((p) => p.map((x, i) => (i === k ? value : x)));

  const calculate = () => {
    // Hidden boxes still count, as on the reference (they are only collapsed).
    const allEmpty = investment === "" && discountRate === "" && flows.every((x) => x === "");
    setResult(calculateIrregularCashFlow(allEmpty ? D : { investment, discountRate, flows }));
  };
  const clear = () => { setInvestment(""); setDiscountRate(""); setFlows(emptyFlows()); setShowMore(false); setResult(null); };
  const shown = showMore ? MAX_YEARS : VISIBLE_FLOWS;

  return (
    <section aria-labelledby="pb-irregular-title">
      <h2 id="pb-irregular-title" style={sectionTitle}>Irregular Cash Flow Each Year</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Initial Investment"><DollarField value={investment} onChange={setInvestment} placeholder={D.investment} /></Row>
          <Row label="Discount Rate"><PercentField value={discountRate} onChange={setDiscountRate} placeholder={D.discountRate} /></Row>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", textAlign: "center", margin: "8px 0" }}>Cash Flow</p>
          <div style={{ maxHeight: showMore ? 420 : undefined, overflowY: showMore ? "auto" : undefined }}>
            {flows.slice(0, shown).map((x, k) => (
              <Row key={k} label={`Year ${k + 1}.`}><DollarField value={x} onChange={setFlow(k)} placeholder={D.flows[k] || ""} /></Row>
            ))}
          </div>
          <div style={{ textAlign: "center", margin: "6px 0 8px" }}>
            <button type="button" style={linkButton} onClick={() => setShowMore((s) => !s)} aria-expanded={showMore}>
              {showMore ? "Hide Fields Below" : "Show More Input Fields"}
            </button>
          </div>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <ResultCard result={result} />
      </div>
    </section>
  );
}

export default function PaybackPeriodCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The Payback Period Calculator can calculate payback periods, discounted payback periods, average returns, and schedules of investments.
      </p>
      <FixedCashFlow />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <IrregularCashFlow />
    </div>
  );
}
