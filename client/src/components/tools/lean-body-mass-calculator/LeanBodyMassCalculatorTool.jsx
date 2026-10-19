import { useState } from "react";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { lengthToCm, cmToLength, weightToKg, kgToWeight } from "../../../utils/bodyFatCalculatorEngine";
import { calculateLeanBodyMass, LBM_DEFAULTS, LENGTH_UNITS, WEIGHT_UNITS } from "../../../utils/leanBodyMassCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const radioRow = { display: "flex", gap: 18, marginBottom: -10 };
const REFS = { Boer: 1, James: 2, Hume: 3, Peters: 4 };

const D = LBM_DEFAULTS;
const DEFAULT_CM = lengthToCm(D.heightUnit, D.height, D.height2);
const DEFAULT_KG = weightToKg(D.weightUnit, D.weight);

/** The example values, in whatever units are selected, shown as placeholders. */
const placeholdersFor = (v) => ({
  height: v.heightUnit === D.heightUnit ? [D.height, D.height2] : cmToLength(v.heightUnit, DEFAULT_CM),
  weight: v.weightUnit === D.weightUnit ? D.weight : kgToWeight(v.weightUnit, DEFAULT_KG),
});
/** The typed values, with the example put in for each field named in `fill` (used only to
 * work out which empty fields are required — placeholders never reach a shown result). */
function withExamples(v, fill) {
  const ph = placeholdersFor(v);
  const out = { ...v };
  if (fill.has("height")) { out.height = ph.height[0]; out.height2 = ph.height[1]; }
  if (fill.has("weight")) out.weight = ph.weight;
  return out;
}
const EMPTY = { ...D, height: "", height2: "", weight: "" };

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your height and weight, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const lead = result.rows[0]; // Peters for children, otherwise Boer
  const name = lead.child ? "Peters (for Children)" : lead.formula;
  return (
    <>
      <HighlightSummary
        label={`Lean body mass (${name})`} value={lead.lbm} unit={result.unit} color="#16a34a"
        badge={`${lead.share}% of body weight`} note={`Body fat: ${lead.bodyFat}%`}
      />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 8px" }}>The lean body mass based on different formulas:</p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table--framed data-table-head" style={{ borderCollapse: "collapse", fontSize: 13.5, color: "var(--text-primary)", width: "100%", minWidth: 300 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Formula</th>
              <th style={{ textAlign: "center" }}>Lean Body Mass</th>
              <th style={{ textAlign: "center" }}>Body Fat</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.formula}>
                <td>{r.child ? "Peters (for Children)" : r.formula}<sup><a href={`#lbm-ref-${REFS[r.formula]}`} style={{ color: "inherit" }}>{REFS[r.formula]}</a></sup></td>
                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}><strong>{r.lbm} {result.unit}</strong> ({r.share}%)</td>
                <td style={{ textAlign: "center" }}>{r.bodyFat}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function LeanBodyMassCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const req = useRequiredFields();
  const evaluate = (values) => req.evaluate(
    { height: [values.height, values.height2], weight: values.weight },
    (fill) => calculateLeanBodyMass(withExamples(values, fill)),
  );
  const calculate = () => setResult(evaluate(v));
  // Gender / age choices recalculate once there is a result.
  const choose = (key, value) => {
    const next = { ...v, [key]: value };
    setV(next);
    if (result) setResult(evaluate(next));
  };
  const clear = () => {
    setV((prev) => ({ ...prev, height: "", height2: "", weight: "" }));
    req.clear();
    setResult(null);
  };
  // Switching a unit converts what is already typed.
  const changeHeightUnit = (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });
  const changeWeightUnit = (unit) => setV((prev) => ({ ...prev, weightUnit: unit, weight: kgToWeight(unit, weightToKg(prev.weightUnit, prev.weight)) }));

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The Lean Body Mass Calculator computes a person's estimated lean body mass (LBM) based on body weight, height, gender, and age. For
        comparison purposes, the calculator provides the results of multiple formulas.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 420, padding: 18 }}>
          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
            <div style={radioRow}>
              <RadioOption checked={v.sex !== "female"} onChange={() => choose("sex", "male")} label="male" />
              <RadioOption checked={v.sex === "female"} onChange={() => choose("sex", "female")} label="female" />
            </div>
          </fieldset>

          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ fontSize: 13.5, color: "var(--text-primary)", float: "left", padding: 0, marginRight: 12 }}>Age 14 or younger?</legend>
            <div style={radioRow}>
              <RadioOption checked={v.child} onChange={() => choose("child", true)} label="yes" />
              <RadioOption checked={!v.child} onChange={() => choose("child", false)} label="no" />
            </div>
          </fieldset>

          <div style={rowStyle}>
            <span style={labelStyle}>Height</span>
            <Req name="height"><UnitMeasureField
              label="Height" units={LENGTH_UNITS} unit={v.heightUnit} onUnitChange={changeHeightUnit}
              values={[v.height, v.height2]} placeholders={ph.height} onChange={(i, text) => set(i ? "height2" : "height")(text)}
            /></Req>
          </div>

          <div style={{ ...rowStyle, marginBottom: 16 }}>
            <span style={labelStyle}>Weight</span>
            <Req name="weight"><UnitMeasureField
              label="Weight" units={WEIGHT_UNITS} unit={v.weightUnit} onUnitChange={changeWeightUnit}
              values={[v.weight, ""]} placeholders={[ph.weight, ""]} onChange={(_, text) => set("weight")(text)}
            /></Req>
          </div>

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 360px", minWidth: 280, padding: 0, overflow: "hidden" }}>
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
