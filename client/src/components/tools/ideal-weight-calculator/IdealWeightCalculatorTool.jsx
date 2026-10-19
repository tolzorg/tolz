import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  calculateIdealWeight, IDEAL_WEIGHT_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS, lengthToCm, cmToLength,
} from "../../../utils/idealWeightCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const RESULT_UNITS = WEIGHT_UNITS.map((u) => ({ value: u.value, label: u.label }));

const D = IDEAL_WEIGHT_DEFAULTS;
const DEFAULT_CM = lengthToCm(D.heightUnit, D.height, D.height2);

/** The example values, in whatever unit is selected, shown as placeholders. */
const placeholdersFor = (v) => ({ age: D.age, height: cmToLength(v.heightUnit, DEFAULT_CM) });
/** The typed values, with the example put in for each field named in `fill` (used only to
 * work out which empty fields are required — placeholders never reach a shown result). */
function withExamples(v, fill) {
  const ph = placeholdersFor(v);
  const out = { ...v };
  for (const key of fill) {
    const example = ph[key];
    if (Array.isArray(example)) { out[key] = example[0]; out[`${key}2`] = example[1]; } else out[key] = example;
  }
  return out;
}
const EMPTY = { ...D, age: "", height: "", height2: "" };

/** "128.9 - 174.2 lbs" → value "128.9 - 174.2" and unit "lbs" for the summary (stones keep their own units). */
function splitRange(text) {
  const m = text.match(/^(.*) (kg|lbs)$/);
  return m ? [m[1], m[2]] : [text, null];
}

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your age, gender and height, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  const [value, unit] = splitRange(r.healthyRange);
  return (
    <>
      <HighlightSummary label="Healthy weight range" value={<span style={{ fontSize: "0.8em" }}>{value}</span>} unit={unit} color="#008137" note="Based on a healthy BMI" />
      {r.sentence && <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "4px 0 0", lineHeight: 1.6 }}>{r.sentence}</p>}
      {r.formulas && (
        <>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 0" }}>The ideal weight based on popular formulas:</p>
          <StatList>
            {r.formulas.map((f) => <StatRow key={f.name} label={f.name}>{f.value}</StatRow>)}
            <StatRow label="Healthy BMI Range" tone="#008137">{r.healthyRange}</StatRow>
          </StatList>
        </>
      )}
    </>
  );
}

export default function IdealWeightCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const req = useRequiredFields();
  const evaluate = (values) => req.evaluate({ age: values.age, height: [values.height, values.height2] }, (fill) => calculateIdealWeight(withExamples(values, fill)));
  const calculate = () => setResult(evaluate(v));
  const clear = () => { setV((prev) => ({ ...prev, age: "", height: "", height2: "" })); req.clear(); setResult(null); };
  // Switching the height unit converts what is already typed.
  const changeHeightUnit = (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });
  // The result unit applies straight away to the current result.
  const changeResultUnit = (unit) => {
    setV((prev) => ({ ...prev, resultUnit: unit }));
    setResult((prev) => (prev && !prev.errors ? evaluate({ ...v, resultUnit: unit }) : prev));
  };

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          The <i>Ideal Weight Calculator</i> computes ideal body weight (IBW) ranges based on height, gender, and age. The idea of finding the
          IBW using a formula has been sought after by many experts for a long time. Currently, there persist several popular formulas, and
          our Ideal Weight Calculator provides their results for side-to-side comparisons.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          Print
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 410, padding: 18 }}>
          <label style={rowStyle}>
            <span style={labelStyle}>Age</span>
            <div style={{ flex: "0 1 110px", minWidth: 70 }}>
              <Req name="age"><TextField value={v.age} onChange={set("age")} placeholder={ph.age} /></Req>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ages 2 - 80</span>
          </label>

          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
            <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
              <RadioOption checked={v.sex === "male"} onChange={() => set("sex")("male")} label="male" />
              <RadioOption checked={v.sex === "female"} onChange={() => set("sex")("female")} label="female" />
            </div>
          </fieldset>

          <div style={rowStyle}>
            <span style={labelStyle}>Height</span>
            <Req name="height"><UnitMeasureField
              label="Height" units={LENGTH_UNITS} unit={v.heightUnit} onUnitChange={changeHeightUnit}
              values={[v.height, v.height2]} placeholders={ph.height} onChange={(i, text) => set(i ? "height2" : "height")(text)}
            /></Req>
          </div>

          <label style={rowStyle}>
            <span style={labelStyle}>Show in</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <SelectField value={v.resultUnit} onChange={changeResultUnit} options={RESULT_UNITS} />
            </div>
          </label>

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
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
