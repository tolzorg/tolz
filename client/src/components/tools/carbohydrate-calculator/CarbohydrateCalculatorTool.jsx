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
  calculateCarbs, sentenceAmount, formatGrams, formatCalories, formatOz, formatLb,
  CARB_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS, ACTIVITY_OPTIONS, MIN_CARBS,
} from "../../../utils/carbohydrateCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 70px", fontSize: 13.5, color: "var(--text-primary)" };
const subHead = { fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" };
const muted = { fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" };
const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const CARB_COLOR = "#ea580c";

const D = CARB_DEFAULTS;
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

/** One table cell: grams (bold), plus ounces and pounds for US units. */
function GramsCell({ grams, us }) {
  return (
    <td style={{ textAlign: "center", lineHeight: 1.35 }}>
      <strong style={{ whiteSpace: "nowrap" }}>{formatGrams(grams)} grams</strong>
      {us && (<><div style={muted}>({formatOz(grams)} Oz)</div><div style={muted}>({formatLb(grams)} lb)</div></>)}
    </td>
  );
}

function ResultTable({ result }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
        <thead>
          <tr>
            <th>Goal</th>
            <th>Daily Calorie Allowance</th>
            {["40%", "55%", "65%", "75%"].map((h) => <th key={h} style={{ textAlign: "center" }}>{h}*</th>)}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => (
            <tr key={row.label}>
              <td style={{ whiteSpace: "nowrap", fontWeight: row.maintain ? 700 : 400 }}>{row.label}</td>
              <td style={{ whiteSpace: "nowrap" }}>{formatCalories(row.calories)} Calories</td>
              {row.grams.map((gr, i) => <GramsCell key={i} grams={gr} us={result.us} />)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "(4.59 Oz or 0.287 Lb)" / "(4.59 - 6.99 Oz or 0.287 - 0.437 Lb)" — US units only. */
const extra = (us, lo, hi) => {
  if (!us) return "";
  return hi == null ? ` (${formatOz(lo)} Oz or ${formatLb(lo)} Lb)` : ` (${formatOz(lo)} - ${formatOz(hi)} Oz or ${formatLb(lo)} - ${formatLb(hi)} Lb)`;
};

/** The reference's sentence layout, used when 40% of maintenance is under 130 grams. */
function ResultSentences({ result }) {
  const { us } = result;
  return result.rows.map((row) => {
    const a = sentenceAmount(row);
    return (
      <p key={row.label} style={{ ...para, color: "var(--text-primary)" }}>
        You need{" "}
        <strong style={row.maintain ? { color: "var(--success)" } : undefined}>{formatCalories(row.calories)}</strong>{" "}
        Calories/day to {row.goalText}. You should take{" "}
        {a.kind === "min" && <><strong>{MIN_CARBS}</strong> grams{extra(us, MIN_CARBS)}</>}
        {a.kind === "low" && <><strong>{MIN_CARBS} - {formatGrams(a.hi)}</strong> (75%) grams{extra(us, a.lo, a.hi)}</>}
        {a.kind === "range" && <><strong>{formatGrams(a.lo)} (40%) - {formatGrams(a.hi)} (75%)</strong> grams{extra(us, a.lo, a.hi)}</>}
        {" "}of carbohydrate for your energy needs.
        {a.mid && ` (55% = ${formatGrams(a.mid[0])} grams${extra(us, a.mid[0])}, 65% = ${formatGrams(a.mid[1])} grams${extra(us, a.mid[1])})`}
      </p>
    );
  });
}

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your details, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const m = result.rows[0];
  const a = sentenceAmount(m);
  const value = result.text
    ? (a.kind === "min" ? String(MIN_CARBS) : `${MIN_CARBS} - ${formatGrams(a.hi)}`)
    : `${formatGrams(m.grams[0])} - ${formatGrams(m.grams[3])}`;
  return (
    <>
      <HighlightSummary
        label="Daily carbs to maintain weight" value={value} unit="grams/day" color={CARB_COLOR}
        badge={result.text ? "Minimum 130 g" : "40% - 75%"} note={`of ${formatCalories(m.calories)} Calories/day`}
      />
      {result.text ? <ResultSentences result={result} /> : (
        <>
          <p style={{ ...para, fontSize: 14.5, color: "var(--text-primary)" }}>It is recommended that carbohydrates comprise 40-75% of daily caloric intake.</p>
          <ResultTable result={result} />
        </>
      )}
      <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55, margin: "10px 0 0" }}>
        *The Institute of Medicine recommends American and Canadian adults to get 40% to 65% of their dietary energy from carbohydrates.
        The Food and Agriculture Organization and the World Health Organization jointly recommend 55% to 75% of total energy from
        carbohydrates, but only 10% directly from sugars.
      </p>
    </>
  );
}

export default function CarbohydrateCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const katch = v.formula === "katch";

  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { age: v.age, height: [v.height, v.height2], weight: v.weight, ...(katch ? { bodyFat: v.bodyFat } : {}) },
    (fill) => calculateCarbs(withExamples(v, fill)),
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
        The <i>Carb Calculator</i> estimates the percentage of carbohydrates a person should consume each day.
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

        <div className="card" style={{ flex: "1 1 640px", minWidth: 280, padding: 0, overflow: "hidden" }}>
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
