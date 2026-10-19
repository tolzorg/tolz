import { useState } from "react";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import HealthyWeightScale from "./HealthyWeightScale";
import { lengthToCm, cmToLength } from "../../../utils/bodyFatCalculatorEngine";
import {
  calculateHealthyWeight, HEALTHY_WEIGHT_DEFAULTS, LENGTH_UNITS, CATEGORIES, BMI_CUTS,
} from "../../../utils/healthyWeightCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };

const D = HEALTHY_WEIGHT_DEFAULTS;
const DEFAULT_CM = lengthToCm(D.heightUnit, D.height, D.height2);
const placeholdersFor = (v) => (v.heightUnit === D.heightUnit ? [D.height, D.height2] : cmToLength(v.heightUnit, DEFAULT_CM));
const EMPTY = { ...D, height: "", height2: "" };

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your height, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  const f = (x) => x.toLocaleString("en-US", { minimumFractionDigits: r.decimals, maximumFractionDigits: r.decimals });
  const range = (lo, hi) => (lo === null ? `under ${f(hi)} ${r.unit}` : hi === null ? `${f(lo)} ${r.unit} or more` : `${f(lo)} – ${f(hi)} ${r.unit}`);
  const bmiRange = (lo, hi) => (lo === null ? `BMI under ${hi}` : hi === null ? `BMI ${lo} or more` : `BMI ${lo} – ${hi}`);
  return (
    <>
      <HighlightSummary label="Healthy weight range" value={`${f(r.low)} – ${f(r.high)}`} unit={r.unit} color="#16a34a" badge="BMI 18.5 – 25" />
      <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5, margin: "0 0 6px" }}>
        The healthy weight range for the height is <strong style={{ color: "#16a34a" }}>{f(r.low)}{r.unit} - {f(r.high)}{r.unit}</strong>.
      </p>
      <HealthyWeightScale weights={r.weights} decimals={r.decimals} unit={r.unit} />
      <StatList>
        {CATEGORIES.map((name, i) => {
          const lo = i === 0 ? null : r.weights[i - 1];
          const hi = i === CATEGORIES.length - 1 ? null : r.weights[i];
          return (
            <StatRow key={name} label={`${name} (${bmiRange(i === 0 ? null : BMI_CUTS[i - 1], i === CATEGORIES.length - 1 ? null : BMI_CUTS[i])})`} tone={name === "Healthy" ? "#16a34a" : undefined}>
              {range(lo, hi)}
            </StatRow>
          );
        })}
      </StatList>
    </>
  );
}

export default function HealthyWeightCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);

  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { height: [v.height, v.height2] },
    (fill) => calculateHealthyWeight(fill.has("height") ? { ...v, height: ph[0], height2: ph[1] } : v),
  ));
  const clear = () => { setV((prev) => ({ ...prev, height: "", height2: "" })); req.clear(); setResult(null); };
  // Switching a unit converts what is already typed; US units give pounds, metric give kg.
  const changeUnit = (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev.heightUnit, prev.height, prev.height2));
    return { ...prev, heightUnit: unit, height: a, height2: b };
  });

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 400, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={labelStyle}>Height</span>
          <Req name="height"><UnitMeasureField
            label="Height" units={LENGTH_UNITS} unit={v.heightUnit} onUnitChange={changeUnit}
            values={[v.height, v.height2]} placeholders={ph} onChange={(i, text) => setV((prev) => ({ ...prev, [i ? "height2" : "height"]: text }))}
          /></Req>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 14px 68px", lineHeight: 1.4 }}>
          feet / inches or inches give pounds; centimeters or meters give kilograms
        </p>
        <ButtonRow onCalculate={calculate} onClear={clear} />
      </div>

      <div className="card" style={{ flex: "1 1 380px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={resultBanner}>Result</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">
          <ResultBody result={result} />
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
