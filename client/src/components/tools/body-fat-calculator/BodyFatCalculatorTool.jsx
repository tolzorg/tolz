import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import BodyFatGauge from "./BodyFatGauge";
import {
  calculateBodyFat, BODY_FAT_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS,
  lengthToCm, cmToLength, weightToKg, kgToWeight,
} from "../../../utils/bodyFatCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const CATEGORY_COLORS = {
  "Less than Essential Fat": "#b90606",
  "Essential Fat": "#ffd400",
  Athletes: "#16a34a",
  Fitness: "#008137",
  Average: "#d97706",
  Obese: "#b90606",
};
const LENGTHS = [["height", "Height"], ["neck", "Neck"], ["waist", "Waist"], ["hip", "Hip"]];
const METHODS = [["navy", "With measurements", "U.S. Navy method"], ["bmi", "Without measurements", "BMI method"]];

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your measurements, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  return (
    <>
      <HighlightSummary
        label="Body fat" value={`${r.bodyFat}%`} color={CATEGORY_COLORS[r.category]} badge={r.category}
        note={r.method === "bmi" ? "BMI method" : "U.S. Navy method"}
      />
      {r.gauge && <BodyFatGauge sex={r.sex} percent={r.gauge.percent} label={`${r.bodyFat}%`} />}
      <StatList>
        {r.method === "navy" && <StatRow label="Body Fat (U.S. Navy Method)">{r.bodyFat}%</StatRow>}
        <StatRow label="Body Fat Category">{r.category}</StatRow>
        <StatRow label="Body Fat Mass">{r.fatMass}</StatRow>
        <StatRow label="Lean Body Mass">{r.leanMass}</StatRow>
        {r.ideal && <StatRow label="Ideal Body Fat for Given Age (Jackson & Pollock)">{r.ideal}</StatRow>}
        {r.toIdeal && <StatRow label={`Body Fat to ${r.toIdeal.verb} to Reach Ideal`} tone="#d97706">{r.toIdeal.amount}</StatRow>}
        {r.method === "navy"
          ? <StatRow label="Body Fat (BMI method)">{r.bmiMethod}</StatRow>
          : <StatRow label="BMI">{r.bmi} kg/m<sup>2</sup></StatRow>}
      </StatList>
    </>
  );
}

export default function BodyFatCalculatorTool() {
  const [v, setV] = useState({ ...BODY_FAT_DEFAULTS });
  const [result, setResult] = useState(() => calculateBodyFat(BODY_FAT_DEFAULTS));
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const female = v.sex === "female";
  const tape = v.method !== "bmi";

  const calculate = () => setResult(calculateBodyFat(v));
  const pickMethod = (method) => {
    setV((prev) => ({ ...prev, method }));
    setResult(calculateBodyFat({ ...v, method }));
  };
  const clear = () => {
    setV((prev) => ({ ...prev, age: "", weight: "", ...Object.fromEntries(LENGTHS.flatMap(([k]) => [[k, ""], [`${k}2`, ""]])) }));
    setResult(null);
  };
  // Switching a unit converts what is already typed.
  const changeLengthUnit = (key) => (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev[`${key}Unit`], prev[key], prev[`${key}2`]));
    return { ...prev, [`${key}Unit`]: unit, [key]: a, [`${key}2`]: b };
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
        <div style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 410 }}>
          <div style={{ display: "flex", marginBottom: -1 }} role="group" aria-label="Method">
            {METHODS.map(([key, label, sub], i) => (
              <button
                key={key}
                type="button"
                aria-pressed={v.method === key}
                onClick={() => pickMethod(key)}
                style={{
                  flex: 1, padding: "8px 4px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)", lineHeight: 1.3,
                  cursor: "pointer", border: "1px solid var(--border)",
                  borderBottom: v.method === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderTopLeftRadius: i === 0 ? "var(--radius-md)" : 0,
                  borderTopRightRadius: i === METHODS.length - 1 ? "var(--radius-md)" : 0,
                  background: v.method === key ? "var(--accent)" : "var(--bg-white)",
                  color: v.method === key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: v.method === key ? 1 : 0,
                }}
              >
                {label}
                <span style={{ display: "block", fontSize: 11, fontWeight: 500, opacity: 0.85 }}>{sub}</span>
              </button>
            ))}
          </div>
        <div className="card" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
            <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
              <RadioOption checked={!female} onChange={() => set("sex")("male")} label="male" />
              <RadioOption checked={female} onChange={() => set("sex")("female")} label="female" />
            </div>
          </fieldset>

          <label style={rowStyle}>
            <span style={labelStyle}>Age</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TextField value={v.age} onChange={set("age")} />
            </div>
          </label>

          <div style={rowStyle}>
            <span style={labelStyle}>Weight</span>
            <UnitMeasureField
              label="Weight" units={WEIGHT_UNITS} unit={v.weightUnit} onUnitChange={changeWeightUnit}
              values={[v.weight, ""]} onChange={(_, text) => set("weight")(text)}
            />
          </div>

          {LENGTHS.filter(([key]) => (tape || key === "height") && (female || key !== "hip")).map(([key, label]) => (
            <div key={key} style={rowStyle}>
              <span style={labelStyle}>{label}</span>
              <UnitMeasureField
                label={label} units={LENGTH_UNITS} unit={v[`${key}Unit`]} onUnitChange={changeLengthUnit(key)}
                values={[v[key], v[`${key}2`]]} onChange={(i, text) => set(i ? `${key}2` : key)(text)}
              />
            </div>
          ))}

          {!tape && (
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>
              No tape measure needed: body fat is estimated from your BMI, age and gender. For a more personal estimate, use
              "With measurements".
            </p>
          )}

          <ButtonRow onCalculate={calculate} onClear={clear} />
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
