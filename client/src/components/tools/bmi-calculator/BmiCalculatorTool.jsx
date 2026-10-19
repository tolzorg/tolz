import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import BmiGauge from "./BmiGauge";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  calculateBmi, BMI_DEFAULTS, HEIGHT_UNITS, WEIGHT_UNITS,
  heightToMeters, metersToHeight, weightToKg, kgToWeight,
} from "../../../utils/bmiCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const sup2 = <sup>2</sup>;

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your age, gender, height and weight, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  return (
    <>
      <HighlightSummary
        label="Your BMI" value={r.bmi} unit={<>kg/m{sup2}</>} color={r.color} badge={r.category}
        note={r.child ? `${r.percentile}% BMI-for-age percentile` : null}
      />

      {r.gauge && <BmiGauge kind={r.gauge.kind} angle={r.gauge.angle} bmi={r.bmi} />}

      <StatList>
        {r.change && (
          <StatRow label={"To reach a healthy BMI"} tone="#d97706">
            {r.change.verb} {r.change.amount} (BMI {r.change.target} kg/m{sup2})
          </StatRow>
        )}
        <StatRow label="Healthy weight for the height">{r.healthyWeight.lo} - {r.healthyWeight.hi}</StatRow>
        <StatRow label="Healthy BMI range">
          {r.child ? <>{r.healthyBmi.lo} - {r.healthyBmi.hi} kg/m{sup2}</> : <>{r.healthyBmi.lo} kg/m{sup2} - {r.healthyBmi.hi} kg/m{sup2}</>}
        </StatRow>
        {r.child && <StatRow label="Weight-for-age percentile">{r.weightPercentile}%</StatRow>}
        {r.child && <StatRow label="Height-for-age percentile">{r.heightPercentile}%</StatRow>}
        {r.prime !== null && <StatRow label="BMI Prime">{r.prime}</StatRow>}
        <StatRow label="Ponderal Index">{r.ponderal} kg/m<sup>3</sup></StatRow>
      </StatList>
    </>
  );
}

export default function BmiCalculatorTool() {
  const [v, setV] = useState({ ...BMI_DEFAULTS });
  const [result, setResult] = useState(() => calculateBmi(BMI_DEFAULTS));
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const calculate = () => setResult(calculateBmi(v));
  const clear = () => { setV((prev) => ({ ...prev, age: "", height: "", height2: "", weight: "" })); setResult(null); };

  // Switching a unit converts what is already typed, so nothing has to be re-entered.
  const changeHeightUnit = (unit) => setV((prev) => {
    const [height, height2] = metersToHeight(unit, heightToMeters(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height, height2 };
  });
  const changeWeightUnit = (unit) => setV((prev) => ({ ...prev, weightUnit: unit, weight: kgToWeight(unit, weightToKg(prev.weightUnit, prev.weight)) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          Print
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 400, padding: 18 }}>
          <label style={rowStyle}>
            <span style={labelStyle}>Age</span>
            <div style={{ flex: "0 1 110px", minWidth: 70 }}>
              <TextField value={v.age} onChange={set("age")} />
            </div>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ages: 2 - 120</span>
          </label>

          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
            <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
              <RadioOption checked={v.sex === "male"} onChange={() => set("sex")("male")} label="Male" />
              <RadioOption checked={v.sex === "female"} onChange={() => set("sex")("female")} label="Female" />
            </div>
          </fieldset>

          <div style={rowStyle}>
            <span style={labelStyle}>Height</span>
            <UnitMeasureField
              label="Height" units={HEIGHT_UNITS} unit={v.heightUnit} onUnitChange={changeHeightUnit}
              values={[v.height, v.height2]} onChange={(i, text) => set(i ? "height2" : "height")(text)}
            />
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Weight</span>
            <UnitMeasureField
              label="Weight" units={WEIGHT_UNITS} unit={v.weightUnit} onUnitChange={changeWeightUnit}
              values={[v.weight, ""]} onChange={(_, text) => set("weight")(text)}
            />
          </div>

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
  );
}
