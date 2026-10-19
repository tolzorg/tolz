import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import BmiGauge from "./BmiGauge";
import BmiUnitConverter from "./BmiUnitConverter";
import { calculateBmi, BMI_DEFAULTS } from "../../../utils/bmiCalculatorEngine";

const TABS = [["us", "US Units"], ["metric", "Metric Units"], ["other", "Other Units"]];
const EMPTY = { age: "", sex: "male", feet: "", inches: "", pounds: "", cm: "", kg: "" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const sup2 = <sup>2</sup>;

/** A text box with its unit written inside on the right ("feet", "cm"…). */
function UnitInput({ value, onChange, unit, label }) {
  return (
    <label style={{ position: "relative", flex: 1, minWidth: 0, display: "block" }}>
      <TextField value={value} onChange={onChange} style={{ paddingRight: unit.length * 7 + 16 }} />
      <span aria-hidden="true" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>
        {unit}
      </span>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{label}</span>
    </label>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your age, gender, height and weight, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  // Bright yellow (#ffe400) is the reference's colour; a thin outline keeps it readable on white.
  const categoryStyle = { color: r.color, fontWeight: 700, textShadow: r.color === "#ffe400" ? "0 0 1px rgba(0,0,0,0.55)" : undefined };
  return (
    <>
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px", overflowWrap: "anywhere" }}>
        BMI = {r.bmi} kg/m{sup2}
        <span style={{ fontWeight: 400, marginLeft: 12 }}>
          ({r.child && `${r.percentile}%, `}<span style={categoryStyle}>{r.category}</span>)
        </span>
      </p>
      {r.gauge && <BmiGauge kind={r.gauge.kind} angle={r.gauge.angle} bmi={r.bmi} />}
      <ul style={{ margin: "12px 0 0", paddingLeft: 20, listStyle: "disc", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
        {r.child && <li>Weight-for-age percentile: {r.weightPercentile}%</li>}
        {r.child && <li>Height-for-age percentile: {r.heightPercentile}%</li>}
        {r.child
          ? <li>Healthy BMI range: {r.healthyBmi.lo} - {r.healthyBmi.hi} kg/m{sup2}</li>
          : <li>Healthy BMI range: {r.healthyBmi.lo} kg/m{sup2} - {r.healthyBmi.hi} kg/m{sup2}</li>}
        <li>Healthy weight for the height: {r.healthyWeight.lo} {r.unit} - {r.healthyWeight.hi} {r.unit}</li>
        {r.change && <li>{r.change.verb} {r.change.amount} {r.unit} to reach a BMI of {r.change.target} kg/m{sup2}.</li>}
        {r.prime !== null && <li>BMI Prime: {r.prime}</li>}
        <li>Ponderal Index: {r.ponderal} kg/m<sup>3</sup></li>
      </ul>
    </>
  );
}

export default function BmiCalculatorTool() {
  const [v, setV] = useState({ ...BMI_DEFAULTS });
  const [units, setUnits] = useState("us"); // the form shown: us | metric
  const [showConverter, setShowConverter] = useState(false);
  const [result, setResult] = useState(() => calculateBmi({ ...BMI_DEFAULTS, units: "us" }));
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const calculate = (system = units) => setResult(calculateBmi({ ...v, units: system }));
  const clear = () => { setV(EMPTY); setResult(null); };
  // Like the reference, US / Metric recalculate with that form's values;
  // Other Units only opens the converter above the current form.
  const pickTab = (key) => {
    if (key === "other") { setShowConverter(true); return; }
    setShowConverter(false);
    setUnits(key);
    calculate(key);
  };
  const activeTab = showConverter ? "other" : units;

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

      {showConverter && <BmiUnitConverter />}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 380 }}>
          <div style={{ display: "flex", marginBottom: -1 }}>
            {TABS.map(([key, label], i) => (
              <button
                key={key}
                type="button"
                aria-pressed={activeTab === key}
                onClick={() => pickTab(key)}
                style={{
                  flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
                  cursor: "pointer", border: "1px solid var(--border)",
                  borderBottom: activeTab === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderTopLeftRadius: i === 0 ? "var(--radius-md)" : 0,
                  borderTopRightRadius: i === TABS.length - 1 ? "var(--radius-md)" : 0,
                  background: activeTab === key ? "var(--accent)" : "var(--bg-white)",
                  color: activeTab === key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: activeTab === key ? 1 : 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
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
              {units === "us" ? (
                <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 0 }}>
                  <UnitInput value={v.feet} onChange={set("feet")} unit="feet" label="Height in feet" />
                  <UnitInput value={v.inches} onChange={set("inches")} unit="inches" label="and inches" />
                </div>
              ) : (
                <UnitInput value={v.cm} onChange={set("cm")} unit="cm" label="Height in centimeters" />
              )}
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Weight</span>
              {units === "us"
                ? <UnitInput value={v.pounds} onChange={set("pounds")} unit="pounds" label="Weight in pounds" />
                : <UnitInput value={v.kg} onChange={set("kg")} unit="kg" label="Weight in kilograms" />}
            </div>

            <ButtonRow onCalculate={() => calculate()} onClear={clear} />
          </div>
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
