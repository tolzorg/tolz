import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import {
  calculateAdultGfr, calculateChildGfr, formatGfr, ADULT_DEFAULTS, CHILD_DEFAULTS, CREATININE_UNITS, HEIGHT_UNITS, CKD_STAGES,
} from "../../../utils/gfrCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" };
const labelStyle = { flex: "0 0 150px", fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", textAlign: "right" };
const h2Style = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" };
const UNIT = <>mL/min/1.73 m<sup>2</sup></>;
const UNIT_TEXT = "mL/min/1.73 m²";
const Scr = () => <>Serum creatinine (S<sub>Cr</sub>)</>;

/** The CKD stage a GFR falls in, for the summary badge. */
function stageOf(gfr) {
  if (gfr >= 90) return ["90+ (Normal or CKD1)", "#16a34a"];
  if (gfr >= 60) return ["CKD2 (Mild) range", "#65a30d"];
  if (gfr >= 30) return ["CKD3 (Moderate) range", "#ca8a04"];
  if (gfr >= 15) return ["CKD4 (Severe) range", "#ea580c"];
  return ["CKD5 Kidney failure range", "#dc2626"];
}

function ResultCard({ children }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
      <div style={resultBanner}>Result</div>
      <div style={{ padding: "14px 16px" }} aria-live="polite">{children}</div>
    </div>
  );
}

function StagesTable() {
  return (
    <>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "16px 0 6px" }}>Chronic Kidney Disease Stages</p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
          <thead><tr><th style={{ textAlign: "left" }}>Stage</th><th style={{ textAlign: "left" }}>GFR Value ({UNIT})</th></tr></thead>
          <tbody>{CKD_STAGES.map(([stage, value]) => <tr key={stage}><td>{stage}</td><td>{value}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function AdultResult({ result }) {
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const [stage, color] = stageOf(result.ckdEpi);
  const rows = [["MDRD 4-Variable Equation", result.mdrd], ["CKD-EPI Formula", result.ckdEpi], ["Mayo Quadratic Formula", result.mayo]];
  return (
    <>
      <HighlightSummary label="Estimated GFR (CKD-EPI)" value={formatGfr(result.ckdEpi)} unit={UNIT_TEXT} color={color} badge={stage} />
      <p style={para}>The following are the GFR results based on 3 formulas often used:</p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
          <thead><tr><th style={{ textAlign: "left" }}>Formula</th><th style={{ textAlign: "left" }}>Result</th></tr></thead>
          <tbody>
            {rows.map(([name, value]) => (
              <tr key={name}><td>{name}</td><td style={{ whiteSpace: "nowrap" }}><strong>{formatGfr(value)}</strong> {UNIT}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <StagesTable />
    </>
  );
}

function ChildResult({ result }) {
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const [stage, color] = stageOf(result.gfr);
  return (
    <>
      <HighlightSummary label="Estimated GFR (bedside Schwartz)" value={formatGfr(result.gfr)} unit={UNIT_TEXT} color={color} badge={stage} />
      <p style={{ ...para, margin: 0 }}>{formatGfr(result.gfr)} {UNIT}</p>
    </>
  );
}

function AdultCalculator() {
  const D = ADULT_DEFAULTS;
  const empty = { ...D, creatinine: "", age: "" };
  const [v, setV] = useState(empty);
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { creatinine: v.creatinine, age: v.age },
    (fill) => calculateAdultGfr({ ...v, creatinine: fill.has("creatinine") ? D.creatinine : v.creatinine, age: fill.has("age") ? D.age : v.age }),
  ));
  const clear = () => { setV(empty); req.clear(); setResult(null); };

  return (
    <RequiredProvider flagged={req.flagged}>
      <section id="adults" style={{ marginBottom: 22 }}>
        <h2 style={h2Style}>GFR Calculator for Adults</h2>
        <p style={para}>This calculator is for people aged 18 years or older.</p>
        {result && <ResultCard><AdultResult result={result} /></ResultCard>}
        <div className="card" style={{ padding: 18, maxWidth: 520 }}>
          <label style={rowStyle}>
            <span style={labelStyle}><Scr /></span>
            <div style={{ width: 110 }}><Req name="creatinine"><TextField value={v.creatinine} onChange={set("creatinine")} placeholder={D.creatinine} /></Req></div>
            <SelectField value={v.creatinineUnit} onChange={set("creatinineUnit")} options={CREATININE_UNITS} style={{ width: 140 }} />
          </label>
          <label style={rowStyle}>
            <span style={labelStyle}>Age</span>
            <div style={{ width: 110 }}><Req name="age"><TextField value={v.age} onChange={set("age")} placeholder={D.age} /></Req></div>
          </label>
          <div style={rowStyle}>
            <span style={labelStyle}>Gender</span>
            <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
              <RadioOption checked={v.sex !== "female"} onChange={() => set("sex")("male")} label="Male" />
              <RadioOption checked={v.sex === "female"} onChange={() => set("sex")("female")} label="Female" />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Race</span>
            <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
              <RadioOption checked={v.black} onChange={() => set("black")(true)} label="Black" />
              <RadioOption checked={!v.black} onChange={() => set("black")(false)} label="Not Black" />
            </div>
          </div>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
      </section>
    </RequiredProvider>
  );
}

function ChildCalculator() {
  const D = CHILD_DEFAULTS;
  const empty = { ...D, creatinine: "", height: "" };
  const [v, setV] = useState(empty);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const heightPlaceholder = v.heightUnit === "inch" ? String(Math.round((Number(D.height) / 2.54) * 10) / 10) : D.height;
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { creatinine: v.creatinine, height: v.height },
    (fill) => calculateChildGfr({ ...v, creatinine: fill.has("creatinine") ? D.creatinine : v.creatinine, height: fill.has("height") ? heightPlaceholder : v.height }),
  ));
  const clear = () => { setV(empty); req.clear(); setResult(null); };

  return (
    <RequiredProvider flagged={req.flagged}>
      <section id="children">
        <h2 style={h2Style}>GFR Calculator for Children</h2>
        <p style={para}>This calculator is for people aged 18 years or younger.</p>
        {result && <ResultCard><ChildResult result={result} /></ResultCard>}
        <div className="card" style={{ padding: 18, maxWidth: 520 }}>
          <label style={rowStyle}>
            <span style={labelStyle}><Scr /></span>
            <div style={{ width: 110 }}><Req name="creatinine"><TextField value={v.creatinine} onChange={set("creatinine")} placeholder={D.creatinine} /></Req></div>
            <SelectField value={v.creatinineUnit} onChange={set("creatinineUnit")} options={CREATININE_UNITS} style={{ width: 140 }} />
          </label>
          <label style={rowStyle}>
            <span style={labelStyle}>Height</span>
            <div style={{ width: 110 }}><Req name="height"><TextField value={v.height} onChange={set("height")} placeholder={heightPlaceholder} /></Req></div>
            <SelectField value={v.heightUnit} onChange={set("heightUnit")} options={HEIGHT_UNITS} style={{ width: 90 }} />
          </label>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
      </section>
    </RequiredProvider>
  );
}

export default function GfrCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ ...para, margin: "0 0 10px" }}>
        The GFR (glomerular filtration rate) Calculator estimates GFR values based on factors including serum creatinine value, age, race, and
        gender. For comparison purposes, the results for three prevalent formulas used for estimating GFR are provided.
      </p>
      <AdultCalculator />
      <ChildCalculator />
    </div>
  );
}
