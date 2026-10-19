import { useState } from "react";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { lengthToCm, cmToLength } from "../../../utils/bodyFatCalculatorEngine";
import {
  calculateArmyBodyFat, ARMY_BODY_FAT_DEFAULTS, LENGTH_UNITS, WHTR_LIMIT,
} from "../../../utils/armyBodyFatCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 };
const labelStyle = { flex: "0 0 58px", fontSize: 13.5, color: "var(--text-primary)" };
const hintStyle = { fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 12px 68px", lineHeight: 1.4 };
const COLORS = { meets: "#16a34a", flagged: "#b90606" };
const LENGTHS = [
  ["waist", "Waist", "waist circumference at the level of the belly button (navel)"],
  ["height", "Height", "standing height, without shoes"],
];

const D = ARMY_BODY_FAT_DEFAULTS;
const DEFAULT_CM = Object.fromEntries(LENGTHS.map(([k]) => [k, lengthToCm(D[`${k}Unit`], D[k], D[`${k}2`])]));

/** The example values, in whatever units are selected, shown as placeholders. */
const placeholdersFor = (v) => Object.fromEntries(LENGTHS.map(([k]) => [
  k, v[`${k}Unit`] === D[`${k}Unit`] ? [D[k], D[`${k}2`]] : cmToLength(v[`${k}Unit`], DEFAULT_CM[k]),
]));
/** The typed values, with the example put in for each field named in `fill` (used only to
 * work out which empty fields are required — placeholders never reach a shown result). */
function withExamples(v, fill) {
  const ph = placeholdersFor(v);
  const out = { ...v };
  for (const [k] of LENGTHS) if (fill.has(k)) { out[k] = ph[k][0]; out[`${k}2`] = ph[k][1]; }
  return out;
}
const EMPTY = { ...D, waist: "", waist2: "", height: "", height2: "" };
const fmtRatio = (x) => x.toFixed(3);
const fmtLength = (x, unit) => `${(Math.round(x * 10) / 10).toLocaleString("en-US")} ${unit}`;

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your waist and height, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  const color = r.meets ? COLORS.meets : COLORS.flagged;
  return (
    <>
      <HighlightSummary
        label="Waist-to-height ratio" value={fmtRatio(r.ratio)} color={color}
        badge={r.meets ? "Meets the standard" : "Flagged"} note={`Army limit: below ${WHTR_LIMIT}`}
      />
      <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5, margin: "0 0 10px" }}>
        {r.meets
          ? `You meet the Army body composition standard: your waist-to-height ratio is below ${WHTR_LIMIT}.`
          : `You do not meet the Army body composition standard: your waist-to-height ratio is ${WHTR_LIMIT} or higher.`}
      </p>
      {!r.meets && (
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 10px" }}>
          You would be flagged and enrolled in the Army Body Composition Program until you meet the standard. To meet it, your waist needs
          to be under {fmtLength(r.maxWaist, r.unit)} — a reduction of more than {fmtLength(r.reduceBy, r.unit)}.
        </p>
      )}
      <StatList>
        <StatRow label="Waist-to-Height Ratio">{fmtRatio(r.ratio)}</StatRow>
        <StatRow label="Army Limit (must be below)">{WHTR_LIMIT}</StatRow>
        <StatRow label="Your Waist">{fmtLength(r.waist, r.unit)}</StatRow>
        <StatRow label="Waist Needed to Meet the Standard" tone={r.meets ? undefined : "#d97706"}>under {fmtLength(r.maxWaist, r.unit)}</StatRow>
        {!r.meets && <StatRow label="Waist Reduction Needed" tone="#d97706">more than {fmtLength(r.reduceBy, r.unit)}</StatRow>}
      </StatList>
    </>
  );
}

export default function ArmyBodyFatCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const ph = placeholdersFor(v);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    Object.fromEntries(LENGTHS.map(([k]) => [k, [v[k], v[`${k}2`]]])),
    (fill) => calculateArmyBodyFat(withExamples(v, fill)),
  ));
  const clear = () => {
    setV((prev) => ({ ...prev, waist: "", waist2: "", height: "", height2: "" }));
    req.clear();
    setResult(null);
  };
  // Switching a unit converts what is already typed.
  const changeUnit = (key) => (unit) => setV((prev) => {
    const [a, b] = cmToLength(unit, lengthToCm(prev[`${key}Unit`], prev[key], prev[`${key}2`]));
    return { ...prev, [`${key}Unit`]: unit, [key]: a, [`${key}2`]: b };
  });

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The <i>Army Body Fat Calculator</i> uses the Army's current body composition test, adopted on July 7, 2026: the{" "}
        <strong>waist-to-height ratio</strong> (waist at the belly button ÷ height). A ratio below {WHTR_LIMIT} meets the standard. For
        accuracy, measure your waist three times at the navel and use the average.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 440, padding: 18 }}>
          {LENGTHS.map(([key, label, hint]) => (
            <div key={key}>
              <div style={rowStyle}>
                <span style={labelStyle}>{label}</span>
                <Req name={key}><UnitMeasureField
                  label={label} units={LENGTH_UNITS} unit={v[`${key}Unit`]} onUnitChange={changeUnit(key)}
                  values={[v[key], v[`${key}2`]]} placeholders={ph[key]} onChange={(i, text) => set(i ? `${key}2` : key)(text)}
                /></Req>
              </div>
              <p style={hintStyle}>{hint}</p>
            </div>
          ))}

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
    </RequiredProvider>
  );
}
