import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import {
  calculateCollegeCost, COLLEGE_AVERAGES, DEFAULTS, formatDollars, yearsLabel,
} from "../../../utils/collegeCostCalculatorEngine";

const AVERAGE_OPTIONS = [{ value: "", label: "Select an Average" }, ...COLLEGE_AVERAGES];
const DEFAULT_AVERAGE = "30990";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionHeading = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.01em", margin: "0 0 6px" };
const row = { display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 10px", fontSize: 13.5, color: "var(--text-primary)" };
const highlightRow = { ...row, background: "var(--accent-light)", borderRadius: "var(--radius-sm)" };
const noteStyle = { fontSize: 11.5, color: "var(--text-muted)", margin: "-4px 0 8px", textAlign: "right", lineHeight: 1.4 };

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

function ResultRow({ label, children, highlight }) {
  return (
    <div style={highlight ? highlightRow : row}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ textAlign: "right" }}>{children}</span>
    </div>
  );
}

function CoveredRow() {
  return (
    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--success)", margin: "8px 10px 0" }}>
      Your college savings balance now is enough to cover it already!
    </p>
  );
}

function FreshmanRow({ freshman }) {
  return (
    <ResultRow label={`Freshman year cost (rise ${freshman.increase}% for ${yearsLabel(freshman.startIn)})`}>
      {formatDollars(freshman.cost)} v.s. {formatDollars(freshman.now)} now
    </ResultRow>
  );
}

function Results({ result }) {
  const years = yearsLabel(result.years);
  if (result.fullCovered) {
    return (
      <>
        <ResultRow label="Total college cost" highlight>{formatDollars(result.totalCost)}</ResultRow>
        <ResultRow label="Total college cost in today's money">{formatDollars(result.totalToday)}</ResultRow>
        {result.freshman && <FreshmanRow freshman={result.freshman} />}
        <CoveredRow />
      </>
    );
  }
  const p = result.percentSection;
  return (
    <>
      <h3 style={sectionHeading}>If paying college costs in full</h3>
      <ResultRow label="Total college cost" highlight>{formatDollars(result.totalCost)}</ResultRow>
      <ResultRow label="Total college cost in today's money">{formatDollars(result.totalToday)}</ResultRow>
      {result.fullAdditional !== null && <ResultRow label="Additional amount to save in today's money">{formatDollars(result.fullAdditional)}</ResultRow>}
      <ResultRow label="Equivalent monthly saving">{formatDollars(result.fullMonthly)} per month for {years}</ResultRow>
      {result.freshman && <FreshmanRow freshman={result.freshman} />}

      {p && (
        <div style={{ marginTop: 22 }}>
          <h3 style={sectionHeading}>If {p.percent}% of college costs come from savings</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>
            The rest maybe paid by grants, scholarships, student loans, or other financial aids.
          </p>
          <ResultRow label="You will need to save" highlight>{formatDollars(p.needToSave)}</ResultRow>
          <ResultRow label="Your target saving amount in today's money">{formatDollars(p.targetToday)}</ResultRow>
          {p.covered ? (
            <CoveredRow />
          ) : (
            <>
              {p.additional !== null && <ResultRow label="Additional amount to save in today's money">{formatDollars(p.additional)}</ResultRow>}
              <ResultRow label="Equivalent monthly saving">{formatDollars(p.monthly)} per month for {years}</ResultRow>
            </>
          )}
          <ResultRow label="Amount needed in freshman year:">{formatDollars(p.freshmanNeeded)}</ResultRow>
        </div>
      )}
    </>
  );
}

function YearsInput({ value, onChange, placeholder }) {
  return <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ flex: 1, minWidth: 0 }} />;
}

export default function CollegeCostCalculatorTool() {
  const [todayCost, setTodayCost] = useState("");
  const [average, setAverage] = useState(DEFAULT_AVERAGE);
  const [costIncrease, setCostIncrease] = useState("");
  const [duration, setDuration] = useState("");
  const [savingPercent, setSavingPercent] = useState("");
  const [balanceNow, setBalanceNow] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [startIn, setStartIn] = useState("");
  const [result, setResult] = useState(null);

  function pickAverage(value) {
    setAverage(value);
    if (value) setTodayCost(value);
  }

  function calculate() {
    setResult(calculateCollegeCost({
      todayCost: todayCost || DEFAULTS.todayCost,
      costIncrease: costIncrease || DEFAULTS.costIncrease,
      duration: duration || DEFAULTS.duration,
      savingPercent: savingPercent || DEFAULTS.savingPercent,
      balanceNow: balanceNow || DEFAULTS.balanceNow,
      returnRate: returnRate || DEFAULTS.returnRate,
      taxRate: taxRate || DEFAULTS.taxRate,
      startIn: startIn || DEFAULTS.startIn,
    }));
  }

  function clear() {
    setTodayCost(""); setAverage(DEFAULT_AVERAGE); setCostIncrease(""); setDuration(""); setSavingPercent("");
    setBalanceNow(""); setReturnRate(""); setTaxRate(""); setStartIn(""); setResult(null);
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ───────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 400px", minWidth: 300, padding: 16 }}>
        <FieldRow label="Today's annual college costs"><DollarField value={todayCost} onChange={setTodayCost} placeholder={DEFAULTS.todayCost} /></FieldRow>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "-2px 0 10px" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>or</span>
          <SelectField value={average} onChange={pickAverage} options={AVERAGE_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
        </div>

        <FieldRow label="College cost increase rate"><PercentField value={costIncrease} onChange={setCostIncrease} placeholder={DEFAULTS.costIncrease} /></FieldRow>
        <p style={noteStyle}>5% recommended</p>
        <FieldRow label="Expected college attendance duration" suffix="years"><YearsInput value={duration} onChange={setDuration} placeholder={DEFAULTS.duration} /></FieldRow>
        <FieldRow label="Percent of costs from savings"><PercentField value={savingPercent} onChange={setSavingPercent} placeholder={DEFAULTS.savingPercent} /></FieldRow>
        <FieldRow label="College savings balance now"><DollarField value={balanceNow} onChange={setBalanceNow} placeholder={DEFAULTS.balanceNow} /></FieldRow>
        <p style={noteStyle}>amount saved so far</p>
        <FieldRow label="Interest or investment return rate"><PercentField value={returnRate} onChange={setReturnRate} placeholder={DEFAULTS.returnRate} /></FieldRow>
        <FieldRow label="Tax rate on interest or investment return"><PercentField value={taxRate} onChange={setTaxRate} placeholder={DEFAULTS.taxRate} /></FieldRow>
        <p style={noteStyle}>Including federal, state, and local tax<br />use 0% for 529 plan savings</p>
        <FieldRow label="College will start in" suffix="years"><YearsInput value={startIn} onChange={setStartIn} placeholder={DEFAULTS.startIn} /></FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 420px", minWidth: 300, padding: 0, overflow: "hidden", alignSelf: "flex-start" }}>
        <div style={resultBanner}>Results:</div>
        <div style={{ padding: "16px 18px" }} aria-live="polite">
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in your college and savings details and click <strong>Calculate</strong> to estimate the total cost and how much to save each month.
            </p>
          ) : result.errors ? (
            <ErrorPanel messages={result.errors} />
          ) : (
            <Results result={result} />
          )}
        </div>
      </div>
    </div>
  );
}
