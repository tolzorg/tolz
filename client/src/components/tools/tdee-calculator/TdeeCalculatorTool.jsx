import { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { lengthToCm, cmToLength, weightToKg, kgToWeight } from "../../../utils/bodyFatCalculatorEngine";
import {
  calculateTdee, formatNumber, formatBmi, TDEE_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS, ACTIVITY_OPTIONS,
} from "../../../utils/tdeeCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 70px", fontSize: 13.5, color: "var(--text-primary)" };
const subHead = { fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" };
const muted = { fontSize: 12, color: "var(--text-muted)", fontWeight: 400 };
const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const TDEE_COLOR = "#16a34a";

const D = TDEE_DEFAULTS;
const DEFAULT_CM = lengthToCm(D.heightUnit, D.height, D.height2);
const DEFAULT_KG = weightToKg(D.weightUnit, D.weight);
/** The example values, in whatever units are selected, shown as placeholders. */
const placeholdersFor = (v) => ({
  age: D.age,
  height: v.heightUnit === D.heightUnit ? [D.height, D.height2] : cmToLength(v.heightUnit, DEFAULT_CM),
  weight: v.weightUnit === D.weightUnit ? D.weight : kgToWeight(v.weightUnit, DEFAULT_KG),
  bodyFat: D.bodyFat,
});
function withExamples(v, fill) {
  const ph = placeholdersFor(v);
  const out = { ...v };
  if (fill.has("age")) out.age = ph.age;
  if (fill.has("height")) { out.height = ph.height[0]; out.height2 = ph.height[1]; }
  if (fill.has("weight")) out.weight = ph.weight;
  if (fill.has("bodyFat")) out.bodyFat = ph.bodyFat;
  return out;
}
const EMPTY = { ...D, age: "", height: "", height2: "", weight: "", bodyFat: "" };

/** One goal: label and rate, then the energy and its share of the TDEE. */
function GoalRows({ goals, unit }) {
  return (
    <StatList>
      {goals.map((g) => (
        <StatRow key={g.label} label={<>{g.label}<div style={muted}>{g.rate}/week</div></>} tone={TDEE_COLOR}>
          {formatNumber(g.value)} <span style={{ ...muted, fontWeight: 700 }}>{g.percent}%</span>
          <div style={muted}>{unit}/day</div>
        </StatRow>
      ))}
    </StatList>
  );
}

const sectionHead = { fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "16px 0 0" };

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your details, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  if (r.bmrOnly) return <HighlightSummary label="Basal Metabolic Rate (BMR)" value={formatNumber(r.value)} unit={`${r.unit}/day`} color={TDEE_COLOR} />;
  return (
    <>
      <HighlightSummary
        label="TDEE (maintenance energy)" value={formatNumber(r.value)} unit={`${r.unit}/day`} color={TDEE_COLOR}
        badge="per day" note={`BMI ${formatBmi(r.bmi.score)} kg/m²${r.bmi.category ? ` (${r.bmi.category})` : ""}`}
      />
      <p style={{ ...para, fontSize: 15, color: "var(--text-primary)" }}>
        The estimated TDEE or body weight maintenance energy requirement is{" "}
        <strong style={{ color: "var(--success)" }}>{formatNumber(r.value)}</strong> {r.unit} per day.
      </p>
      <p style={{ ...para, margin: 0 }}>
        BMI Score: {formatBmi(r.bmi.score)} kg/m<sup>2</sup>
        {r.bmi.category && <> (<span style={{ color: r.bmi.color, fontWeight: 700 }}>{r.bmi.category}</span>), Healthy BMI Range: 18.5 - 25 kg/m<sup>2</sup></>}
      </p>
      {r.lose && (
        <>
          <p style={sectionHead}>Energy intake to lose weight:</p>
          <GoalRows goals={r.lose} unit={r.unit} />
          {r.loseNote && (
            <p style={{ ...para, margin: "8px 0 0" }}>
              Please consult with a doctor when losing {r.loseNote.rate} or more per week since it requires that you consume less than the
              minimum recommendation of {formatNumber(r.loseNote.minimum)} {r.unit === "kJ" ? "kJ" : "calories"} a day.
            </p>
          )}
        </>
      )}
      {r.gain && (
        <>
          <p style={sectionHead}>Energy intake to gain weight:</p>
          <GoalRows goals={r.gain} unit={r.unit} />
        </>
      )}
    </>
  );
}

export default function TdeeCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const katch = v.formula === "katch";

  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { age: v.age, height: [v.height, v.height2], weight: v.weight, ...(katch ? { bodyFat: v.bodyFat } : {}) },
    (fill) => calculateTdee(withExamples(v, fill)),
  ));
  const clear = () => {
    setV((prev) => ({ ...prev, age: "", height: "", height2: "", weight: "", bodyFat: "" }));
    req.clear(); setResult(null);
  };
  const changeHeightUnit = (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });
  const changeWeightUnit = (unit) => setV((prev) => ({ ...prev, weightUnit: unit, weight: kgToWeight(unit, weightToKg(prev.weightUnit, prev.weight)) }));

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        This calculator can be used to estimate your Total Daily Energy Expenditure (TDEE).
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 460 }}>
          <div className="card" style={{ padding: 18 }}>
            <label style={rowStyle}>
              <span style={labelStyle}>Age</span>
              <div style={{ width: 110 }}><Req name="age"><TextField value={v.age} onChange={set("age")} placeholder={ph.age} /></Req></div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ages 18 - 80</span>
            </label>
            <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
              <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
              <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
                <RadioOption checked={v.sex !== "female"} onChange={() => set("sex")("male")} label="male" />
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
            <div style={rowStyle}>
              <span style={labelStyle}>Weight</span>
              <Req name="weight"><UnitMeasureField
                label="Weight" units={WEIGHT_UNITS} unit={v.weightUnit} onUnitChange={changeWeightUnit}
                values={[v.weight, ""]} placeholders={[ph.weight, ""]} onChange={(_, text) => set("weight")(text)}
              /></Req>
            </div>
            <label style={rowStyle}>
              <span style={labelStyle}>Activity</span>
              <SelectField value={v.activity} onChange={set("activity")} options={ACTIVITY_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
            </label>

            <div style={{ margin: "4px 0 12px" }}>
              <button
                type="button" aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}
                style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                {showSettings ? "− Settings" : "+ Settings"}
              </button>
            </div>
            {showSettings && (
              <>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 10px" }}>
                <legend style={subHead}>Results unit:</legend>
                <div style={{ display: "flex", gap: 18, paddingLeft: 12 }}>
                  <RadioOption checked={v.resultUnit !== "kilojoules"} onChange={() => set("resultUnit")("calories")} label="Calories" />
                  <RadioOption checked={v.resultUnit === "kilojoules"} onChange={() => set("resultUnit")("kilojoules")} label="Kilojoules" />
                </div>
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
                <legend style={subHead}>BMR estimation formula:</legend>
                <div style={{ paddingLeft: 12 }}>
                  <RadioOption checked={!katch} onChange={() => set("formula")("mifflin")} label="Mifflin St Jeor" />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <RadioOption checked={katch} onChange={() => set("formula")("katch")} label="Katch-McArdle" />
                    <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 13 }}>
                      <Link to="/calculators/health/body-fat-calculator" style={{ color: "var(--accent)" }} title="Find your body fat % with the Body Fat Calculator">Body Fat:</Link>
                      <div style={{ position: "relative", width: 76 }}>
                        <Req name="bodyFat"><TextField value={v.bodyFat} onChange={set("bodyFat")} placeholder={ph.bodyFat} style={{ paddingRight: 22 }} /></Req>
                        <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: "var(--text-muted)", pointerEvents: "none" }}>%</span>
                      </div>
                    </label>
                  </div>
                </div>
              </fieldset>
              </>
            )}

            <ButtonRow onCalculate={calculate} onClear={clear} />
          </div>
          <ul style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "10px 0 0", paddingLeft: 18 }}>
            <li><strong>Exercise:</strong> 15-30 minutes of elevated heart rate activity.</li>
            <li><strong>Intense exercise:</strong> 45-120 minutes of elevated heart rate activity.</li>
            <li><strong>Very intense exercise:</strong> 2+ hours of elevated heart rate activity.</li>
          </ul>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 280, padding: 0, overflow: "hidden" }}>
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
