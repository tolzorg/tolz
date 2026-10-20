import { useState } from "react";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { calculateBsa, formatArea, BSA_DEFAULTS, WEIGHT_UNITS, HEIGHT_UNITS } from "../../../utils/bodySurfaceAreaCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 100px", fontSize: 13.5, color: "var(--text-primary)" };
const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const SQ = <sup>2</sup>;

const D = BSA_DEFAULTS;
const KG = { lb: 0.453592, kg: 1, g: 0.001 };
const trim = (x, d) => String(Math.round(x * 10 ** d) / 10 ** d);
/** A weight typed in one unit, in another. */
const convertWeight = (text, from, to) => {
  const v = Number(text);
  return text === "" || !Number.isFinite(v) ? text : trim((v * KG[from]) / KG[to], to === "g" ? 0 : 1);
};
/** Height boxes for a unit, from cm. */
const heightBoxes = (unit, cm) => {
  if (!(cm > 0)) return ["", ""];
  if (unit === "cm") return [trim(cm, 1), ""];
  const totalIn = cm / 2.54;
  const feet = Math.floor(totalIn / 12);
  return [String(feet), trim(totalIn - feet * 12, 1)];
};
const toCm = (unit, a, b) => (unit === "cm" ? Number(a) : (Number(a || 0) * 12 + Number(b || 0)) * 2.54);
const DEFAULT_CM = toCm(D.heightUnit, D.feet, D.inches);
const DEFAULT_KG = Number(D.weight) * KG[D.weightUnit];
const placeholdersFor = (v) => ({
  weight: v.weightUnit === D.weightUnit ? D.weight : trim(DEFAULT_KG / KG[v.weightUnit], v.weightUnit === "g" ? 0 : 1),
  height: v.heightUnit === D.heightUnit ? [D.feet, D.inches] : heightBoxes(v.heightUnit, DEFAULT_CM),
});
const EMPTY = { sex: D.sex, weight: "", weightUnit: D.weightUnit, heightUnit: D.heightUnit, height: "", height2: "" };

/** The engine's reference-style input (feet / inches or cm box) from the form; a blank inches box counts as 0. */
function engineInput(v) {
  const ftIn = v.heightUnit === "ft-in";
  return {
    sex: v.sex, weight: v.weight, weightUnit: v.weightUnit,
    feet: ftIn ? (v.height === "" && v.height2 !== "" ? "0" : v.height) : "",
    inches: ftIn ? (v.height2 === "" && v.height !== "" ? "0" : v.height2) : "",
    cm: ftIn ? "" : v.height,
  };
}

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your details, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const du = result.rows[0];
  return (
    <>
      <HighlightSummary
        label="Body surface area (Du Bois)" value={formatArea(du.m2, 2)} unit="m²" color="#0891b2"
        badge={`${formatArea(du.ft2, 2)} ft²`} note={`${formatArea(du.in2, 0)} in²`}
      />
      <p style={para}>The following are the body surface area results based on popular formulas:</p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", fontSize: 13.5, width: "100%" }}>
          <thead><tr><th style={{ textAlign: "left" }}>Formula</th><th colSpan={3}>Results in different units</th></tr></thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.formula}>
                <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.formula}</td>
                <td style={{ whiteSpace: "nowrap" }}>{formatArea(r.m2, 2)} m{SQ}</td>
                <td style={{ whiteSpace: "nowrap" }}>{formatArea(r.ft2, 2)} ft{SQ}</td>
                <td style={{ whiteSpace: "nowrap" }}>{formatArea(r.in2, 0)} in{SQ}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.bmi !== null && (
        <p style={{ ...para, margin: "10px 0 0", color: "var(--text-primary)" }}>
          The Body Mass Index (BMI) of the given weight and height is {result.bmi} kg/m{SQ}.
        </p>
      )}
    </>
  );
}

export default function BodySurfaceAreaCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { weight: v.weight, height: [v.height, v.height2] },
    (fill) => calculateBsa(engineInput({
      ...v,
      ...(fill.has("weight") ? { weight: ph.weight } : {}),
      ...(fill.has("height") ? { height: ph.height[0], height2: ph.height[1] } : {}),
    })),
  ));
  const clear = () => { setV((prev) => ({ ...prev, weight: "", height: "", height2: "" })); req.clear(); setResult(null); };
  const changeWeightUnit = (unit) => setV((prev) => ({ ...prev, weightUnit: unit, weight: convertWeight(prev.weight, prev.weightUnit, unit) }));
  const changeHeightUnit = (unit) => setV((prev) => {
    const typed = prev.height !== "" || prev.height2 !== "";
    const [a, b] = typed ? heightBoxes(unit, toCm(prev.heightUnit, prev.height, prev.height2)) : ["", ""];
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        The calculator below computes the total surface area of a human body, referred to as body surface area (BSA). Direct measurement of BSA
        is difficult, and as such many formulas have been published that estimate BSA. The calculator below provides results for some of the
        most popular formulas.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 460 }}>
          <div className="card" style={{ padding: 18 }}>
            <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
              <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
              <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
                <RadioOption checked={v.sex !== "female"} onChange={() => set("sex")("male")} label="male" />
                <RadioOption checked={v.sex === "female"} onChange={() => set("sex")("female")} label="female" />
              </div>
            </fieldset>
            <div style={rowStyle}>
              <span style={labelStyle}>Body Weight</span>
              <Req name="weight"><UnitMeasureField
                label="Body weight" units={WEIGHT_UNITS} unit={v.weightUnit} onUnitChange={changeWeightUnit}
                values={[v.weight, ""]} placeholders={[ph.weight, ""]} onChange={(_, text) => set("weight")(text)}
              /></Req>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Body Height</span>
              <Req name="height"><UnitMeasureField
                label="Body height" units={HEIGHT_UNITS} unit={v.heightUnit} onUnitChange={changeHeightUnit}
                values={[v.height, v.height2]} placeholders={ph.height} onChange={(i, text) => set(i ? "height2" : "height")(text)}
              /></Req>
            </div>
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </div>
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
