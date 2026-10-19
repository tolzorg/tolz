import { useState } from "react";
import { Link } from "react-router-dom";
import { TextField } from "../loan-calculator/LoanFormControls";
import { RadioOption, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  calculateBmr, BMR_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS,
  lengthToCm, cmToLength, weightToKg, kgToWeight,
} from "../../../utils/bmrCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const linkButton = { background: "none", border: "none", padding: 0, color: "var(--accent)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" };
const radioRow = { display: "flex", gap: 18, flexWrap: "wrap", marginBottom: -10 };

const D = BMR_DEFAULTS;
const DEFAULT_CM = lengthToCm(D.heightUnit, D.height, D.height2);
const DEFAULT_KG = weightToKg(D.weightUnit, D.weight);

/** The example values, in whatever units are selected, shown as placeholders. */
const placeholdersFor = (v) => ({
  age: D.age,
  height: cmToLength(v.heightUnit, DEFAULT_CM),
  weight: kgToWeight(v.weightUnit, DEFAULT_KG),
  bodyFat: D.bodyFat,
});
/** Blank boxes fall back to their placeholder (a two-part height only when both parts are blank).
 * Body fat is the exception: its 20% is only a hint, so Katch-McArdle needs a typed value. */
function withPlaceholders(v) {
  const ph = placeholdersFor(v);
  const heightBlank = v.height === "" && v.height2 === "";
  return {
    ...v,
    age: v.age === "" ? ph.age : v.age,
    height: heightBlank ? ph.height[0] : v.height,
    height2: heightBlank ? ph.height[1] : v.height2,
    weight: v.weight === "" ? ph.weight : v.weight,
  };
}
const EMPTY = { ...D, age: "", height: "", height2: "", weight: "", bodyFat: "" };

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your age, gender, height and weight, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  return (
    <>
      <HighlightSummary label="Your BMR" value={r.bmr} unit={`${r.unit}/day`} color="#008137" note="Energy burned at complete rest" />
      <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 0" }}>Daily calorie needs based on activity level</p>
      <StatList>
        {r.levels.map((l) => <StatRow key={l.label} label={l.label}>{l.value} {r.unit}</StatRow>)}
      </StatList>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "10px 0 0", lineHeight: 1.6 }}>
        <b>Exercise:</b> 15-30 minutes of elevated heart rate activity.<br />
        <b>Intense exercise:</b> 45-120 minutes of elevated heart rate activity.<br />
        <b>Very intense exercise:</b> 2+ hours of elevated heart rate activity.
      </p>
    </>
  );
}

export default function BmrCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(() => calculateBmr(withPlaceholders(EMPTY)));
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const calculate = () => setResult(calculateBmr(withPlaceholders(v)));
  const clear = () => { setV((prev) => ({ ...prev, age: "", height: "", height2: "", weight: "", bodyFat: "" })); setResult(null); };
  // Switching a unit converts what is already typed.
  const changeHeightUnit = (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });
  const changeWeightUnit = (unit) => setV((prev) => ({ ...prev, weightUnit: unit, weight: kgToWeight(unit, weightToKg(prev.weightUnit, prev.weight)) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          The <i>Basal Metabolic Rate (BMR) Calculator</i> estimates your basal metabolic rate&mdash;the amount of energy expended while at
          rest in a neutrally temperate environment, and in a post-absorptive state (meaning that the digestive system is inactive, which
          requires about 12 hours of fasting).
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
              <TextField value={v.age} onChange={set("age")} placeholder={ph.age} />
            </div>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ages 15 - 80</span>
          </label>

          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
            <div style={radioRow}>
              <RadioOption checked={v.sex === "male"} onChange={() => set("sex")("male")} label="male" />
              <RadioOption checked={v.sex === "female"} onChange={() => set("sex")("female")} label="female" />
            </div>
          </fieldset>

          <div style={rowStyle}>
            <span style={labelStyle}>Height</span>
            <UnitMeasureField
              label="Height" units={LENGTH_UNITS} unit={v.heightUnit} onUnitChange={changeHeightUnit}
              values={[v.height, v.height2]} placeholders={ph.height} onChange={(i, text) => set(i ? "height2" : "height")(text)}
            />
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Weight</span>
            <UnitMeasureField
              label="Weight" units={WEIGHT_UNITS} unit={v.weightUnit} onUnitChange={changeWeightUnit}
              values={[v.weight, ""]} placeholders={[ph.weight, ""]} onChange={(_, text) => set("weight")(text)}
            />
          </div>

          <div style={{ marginBottom: 12, textAlign: "center" }}>
            <button type="button" style={linkButton} aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}>
              {showSettings ? "- Settings" : "+ Settings"}
            </button>
          </div>
          {showSettings && (
            <div style={{ marginBottom: 12, fontSize: 13.5, color: "var(--text-primary)" }}>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
                <legend style={{ fontWeight: 700, padding: 0, marginBottom: 6 }}>Results unit:</legend>
                <div style={radioRow}>
                  <RadioOption checked={v.resultUnit === "calories"} onChange={() => set("resultUnit")("calories")} label="Calories" />
                  <RadioOption checked={v.resultUnit === "kilojoules"} onChange={() => set("resultUnit")("kilojoules")} label="Kilojoules" />
                </div>
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 700, padding: 0, marginBottom: 6 }}>BMR estimation formula:</legend>
                <RadioOption checked={v.formula === "mifflin"} onChange={() => set("formula")("mifflin")} label="Mifflin St Jeor" />
                <RadioOption checked={v.formula === "harris"} onChange={() => set("formula")("harris")} label="Revised Harris-Benedict" />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <RadioOption checked={v.formula === "katch"} onChange={() => set("formula")("katch")} label="Katch-McArdle" />
                  <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Link to="/calculators/health/body-fat-calculator" style={{ color: "var(--accent)" }} title="Find your body fat % with the Body Fat Calculator">
                      Body Fat:
                    </Link>
                    <span style={{ width: 80, display: "flex" }}><PercentField value={v.bodyFat} onChange={set("bodyFat")} placeholder={ph.bodyFat} /></span>
                  </label>
                </div>
              </fieldset>
            </div>
          )}

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
