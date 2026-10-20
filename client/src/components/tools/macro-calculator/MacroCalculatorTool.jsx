import { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { lengthToCm, cmToLength, weightToKg, kgToWeight } from "../../../utils/bodyFatCalculatorEngine";
import {
  calculateMacros, slidePlan, MACRO_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS, ACTIVITY_OPTIONS, GOAL_OPTIONS, PLANS,
} from "../../../utils/macroCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 70px", fontSize: 13.5, color: "var(--text-primary)" };
const subHead = { fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" };
const muted = { fontSize: 12, color: "var(--text-muted)" };
const TABS = [...PLANS.map((p) => ({ value: p.value, label: p.label })), { value: "custom", label: "Create Your Own" }];

const D = MACRO_DEFAULTS;
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
const g = (x) => Math.round(x).toLocaleString("en-US");
const clamp = (x, [lo, hi]) => Math.min(hi, Math.max(lo, x));

function MacroRow({ name, sub, children }) {
  return (
    <tr>
      <th scope="row" style={{ textAlign: "left", fontWeight: 700, width: "38%", verticalAlign: "middle" }}>
        {name}{sub && <div style={{ ...muted, fontWeight: 400 }}>{sub}</div>}
      </th>
      <td style={{ background: "#16a34a14" }}>{children}</td>
    </tr>
  );
}
const Amount = ({ value, unit }) => (
  <><strong style={{ fontSize: 22, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{value}</strong> <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{unit}</span></>
);

function Slider({ label, value, range, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-primary)", marginBottom: 6 }}>
      <span style={{ flex: "0 0 56px" }}>{label}:</span>
      <input
        type="range" min={range[0]} max={range[1]} step="any" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, minWidth: 0, accentColor: "var(--accent)" }}
        aria-valuetext={`${Math.round(value)} grams`}
      />
      <span style={{ flex: "0 0 44px", textAlign: "right", fontWeight: 700 }}>{Math.round(value)} g</span>
    </label>
  );
}

function ResultBody({ result, tab, onTab, custom, onSlide }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your details, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.tooLow) return <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>Please consult with a doctor to guide your daily food energy needs.</p>;
  const r = result;
  const plan = tab === "custom" ? custom : r.plans[tab];
  return (
    <>
      <HighlightSummary label="Daily food energy" value={r.calories.toLocaleString("en-US")} unit="Calories/day" color="#16a34a" badge={TABS.find((t) => t.value === tab)?.label} note={`or ${r.kj.toLocaleString("en-US")} kJ/day`} />
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 10px" }}>
        The results below are the suggested amounts of macronutrients and food energy (Calories) you need to consume daily to {r.goalText}.
        Each macronutrient amount is represented as a range of values. Please click whichever tab best suits your needs, or create your own plan.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }} role="tablist" aria-label="Macro plan">
        {TABS.map((t) => (
          <button
            key={t.value} type="button" role="tab" aria-selected={tab === t.value} onClick={() => onTab(t.value)}
            style={{
              flex: "1 1 auto", padding: "7px 10px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
              border: "1px solid var(--border)", marginLeft: -1, marginBottom: -1,
              background: tab === t.value ? "var(--accent)" : "var(--bg-white)", color: tab === t.value ? "#fff" : "var(--text-primary)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "custom" && (
        <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 10 }}>
          <p style={{ ...subHead, marginBottom: 8 }}>Slide the bars to create your own plan</p>
          <Slider label="Protein" value={custom.protein} range={r.ranges.protein} onChange={(x) => onSlide("protein", x)} />
          <Slider label="Carbs" value={custom.carbs} range={r.ranges.carbs} onChange={(x) => onSlide("carbs", x)} />
          <Slider label="Fat" value={custom.fat} range={r.ranges.fat} onChange={(x) => onSlide("fat", x)} />
        </div>
      )}

      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
        <tbody>
          <MacroRow name="Protein">
            <Amount value={g(plan.protein)} unit="grams/day" />
            <div style={muted}>Range: {g(r.ranges.protein[0])} - {g(r.ranges.protein[1])}</div>
          </MacroRow>
          <MacroRow name="Carbs" sub="Includes Sugar">
            <Amount value={g(plan.carbs)} unit="grams/day" />
            <div style={muted}>Range: {g(r.ranges.carbs[0])} - {g(r.ranges.carbs[1])}</div>
          </MacroRow>
          <MacroRow name="Fat" sub="Includes Saturated Fat">
            <Amount value={g(plan.fat)} unit="grams/day" />
            <div style={muted}>Range: {g(r.ranges.fat[0])} - {g(r.ranges.fat[1])}</div>
          </MacroRow>
          <MacroRow name="Sugar"><Amount value={`<${r.sugar}`} unit="grams/day" /></MacroRow>
          <MacroRow name="Saturated Fat"><Amount value={`<${r.saturatedFat}`} unit="grams/day" /></MacroRow>
          <MacroRow name="Food Energy">
            <Amount value={r.calories.toLocaleString("en-US")} unit="Calories/day" />
            <div style={muted}>or {r.kj.toLocaleString("en-US")} kJ/day</div>
          </MacroRow>
        </tbody>
      </table>

      <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55, margin: "10px 0 0" }}>
        The results above are a guideline for more typical situations. Please consult with a doctor for your macronutrient needs if you are
        an athlete, training for a specific purpose, or on special diet due to a disease, pregnancy, or other conditions. The protein range is
        calculated based on the guidelines set by the American Dietetic Association (ADA), The Centers for Disease Control and Prevention
        (CDC), and the World Health Organization. The carbohydrate range is based on the guidelines and joint recommendations of The
        Institute of Medicine, The Food and Agriculture Organization and the World Health Organization.
      </p>
    </>
  );
}

export default function MacroCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(null); // no result until Calculate
  const [tab, setTab] = useState("balanced");
  const [custom, setCustom] = useState(null);
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const katch = v.formula === "katch";

  const req = useRequiredFields();
  const calculate = () => {
    const r = req.evaluate(
      { age: v.age, height: [v.height, v.height2], weight: v.weight, ...(katch ? { bodyFat: v.bodyFat } : {}) },
      (fill) => calculateMacros(withExamples(v, fill)),
    );
    setResult(r);
    // The sliders start from the Balanced plan, as on the reference.
    if (r && r.plans) setCustom({ ...r.plans.balanced });
  };
  const clear = () => {
    setV((prev) => ({ ...prev, age: "", height: "", height2: "", weight: "", bodyFat: "" }));
    req.clear(); setResult(null); setCustom(null); setTab("balanced");
  };
  // Moving one bar rebalances the other two (the browser keeps each bar within its range).
  const onSlide = (macro, value) => setCustom((prev) => {
    const next = slidePlan(result, prev, macro, value);
    return { protein: clamp(next.protein, result.ranges.protein), carbs: clamp(next.carbs, result.ranges.carbs), fat: clamp(next.fat, result.ranges.fat) };
  });
  const changeHeightUnit = (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });
  const changeWeightUnit = (unit) => setV((prev) => ({ ...prev, weightUnit: unit, weight: kgToWeight(unit, weightToKg(prev.weightUnit, prev.weight)) }));

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        This calculator can provide a range of suggested values for a person's macronutrient and Calorie needs under normal conditions.
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
            <label style={rowStyle}>
              <span style={labelStyle}>Your Goal</span>
              <SelectField value={v.goal} onChange={set("goal")} options={GOAL_OPTIONS.map(({ value, label }) => ({ value, label }))} style={{ flex: 1, minWidth: 0 }} />
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
            <ResultBody result={result} tab={tab} onTab={setTab} custom={custom} onSlide={onSlide} />
          </div>
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
