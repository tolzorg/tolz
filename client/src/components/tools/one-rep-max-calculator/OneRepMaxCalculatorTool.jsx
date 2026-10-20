import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import OneRepMaxChart from "./OneRepMaxChart";
import {
  calculateOneRepMax, ONE_REP_MAX_DEFAULTS, WEIGHT_UNIT_OPTIONS, FORMULA_OPTIONS, MAX_REPS,
} from "../../../utils/oneRepMaxCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 96px", fontSize: 13.5, color: "var(--text-primary)" };
const subHead = { fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const cell = { textAlign: "center" };

const D = ONE_REP_MAX_DEFAULTS;
const EMPTY = { ...D, lift: "", reps: "" };

function Table({ head, rows }) {
  return (
    <table className="data-table data-table--framed data-table-head" style={tableStyle}>
      <thead><tr>{head.map((h) => <th key={h} style={cell}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ ...cell, whiteSpace: "nowrap" }}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the weight and repetitions, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  const u = ` ${r.unit}`;
  return (
    <>
      <HighlightSummary label="Estimated one rep max" value={r.oneRepMax} unit={r.unit} color="#2563eb" badge={FORMULA_OPTIONS.find((f) => f.value === r.formula)?.label} />
      <p style={subHead}>Estimated max reps</p>
      <OneRepMaxChart bars={r.chart} unit={r.unit} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <Table head={["Repetitions", "Weight", "% of 1RM"]} rows={r.byReps.map((x) => [x.reps, `${x.weight}${u}`, `${x.percent}%`])} />
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <Table head={["% of 1RM", "Weight", "Repetitions"]} rows={r.byPercent.map((x) => [`${x.percent}%`, `${x.weight}${u}`, x.reps])} />
        </div>
      </div>
    </>
  );
}

export default function OneRepMaxCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const req = useRequiredFields();
  const evaluate = (values) => {
    const r = req.evaluate(
      { lift: values.lift, reps: values.reps },
      (fill) => calculateOneRepMax({ ...values, lift: fill.has("lift") ? D.lift : values.lift, reps: fill.has("reps") ? D.reps : values.reps }),
    );
    return r && !r.errors ? { ...r, formula: values.formula } : r;
  };
  const calculate = () => setResult(evaluate(v));
  // Settings (desired unit, formula) recalculate once there is a result.
  const choose = (key, value) => {
    const next = { ...v, [key]: value };
    setV(next);
    if (result) setResult(evaluate(next));
  };
  const clear = () => { setV((prev) => ({ ...prev, lift: "", reps: "" })); req.clear(); setResult(null); };

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        Use this One Rep Max (1RM) Calculator to estimate the maximum weight you can lift for a single repetition based on the number of
        repetitions you can perform with a certain weight. For the most accurate estimate, please use a weight that you can lift between 1
        and 10 times. Refer to the "<a href="#estimation-methods" style={{ color: "var(--accent)" }}>Estimation methods</a>" section for more
        detail on the formulas used and how this calculator works.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 420, padding: 18 }}>
          <div style={rowStyle}>
            <span style={labelStyle}>Weight Lifted</span>
            <Req name="lift"><UnitMeasureField
              label="Weight lifted" units={WEIGHT_UNIT_OPTIONS} unit={v.liftUnit} onUnitChange={set("liftUnit")}
              values={[v.lift, ""]} placeholders={[D.lift, ""]} onChange={(_, text) => set("lift")(text)}
            /></Req>
          </div>
          <label style={rowStyle}>
            <span style={labelStyle}>Repeated</span>
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <Req name="reps"><TextField value={v.reps} onChange={set("reps")} placeholder={D.reps} style={{ paddingRight: 46 }} /></Req>
                <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: "var(--text-muted)", pointerEvents: "none" }}>times</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", flexShrink: 0 }}>(1-{MAX_REPS})</span>
            </div>
          </label>

          <div style={{ textAlign: "center", margin: "4px 0 12px" }}>
            <button
              type="button" aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              {showSettings ? "− Settings" : "+ Settings"}
            </button>
          </div>
          {showSettings && (
            <div style={{ marginBottom: 12 }}>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 8px" }}>
                <legend style={subHead}>Desired unit:</legend>
                <div style={{ display: "flex", gap: 18, paddingLeft: 12 }}>
                  <RadioOption checked={v.outUnit === "kg"} onChange={() => choose("outUnit", "kg")} label="Kilogram" />
                  <RadioOption checked={v.outUnit === "lb"} onChange={() => choose("outUnit", "lb")} label="Pound" />
                </div>
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={subHead}>
                  1RM estimation formula: <a href="#estimation-methods" style={{ color: "var(--accent)", fontWeight: 400, fontSize: 12.5 }}>(about the formulas)</a>
                </legend>
                <div style={{ paddingLeft: 12 }}>
                  {FORMULA_OPTIONS.map((f) => (
                    <RadioOption key={f.value} checked={v.formula === f.value} onChange={() => choose("formula", f.value)} label={f.label} />
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
