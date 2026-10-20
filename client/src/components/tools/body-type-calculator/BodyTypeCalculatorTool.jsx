import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { calculateBodyType, formatWhr, BODY_TYPE_DEFAULTS, SIZE_UNITS } from "../../../utils/bodyTypeCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 104px", fontSize: 13.5, color: "var(--text-primary)" };
const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const FIELDS = [
  ["bust", "Bust Size"],
  ["waist", "Waist Size"],
  ["highHip", "High Hip Size"],
  ["hip", "Hip Size"],
];
// "Waist circumference and waist-hip ratio: report of a WHO expert consultation" (2008), the source of the 0.85 cut-off.
const WHO_REPORT = "https://www.who.int/publications/i/item/9789241501491";
const D = BODY_TYPE_DEFAULTS;
const EMPTY = { ...D, bust: "", waist: "", highHip: "", hip: "" };
/** The example size in the selected unit. */
const example = (key, unit) => (unit === "in" ? String(Math.round((Number(D[key]) / 2.54) * 10) / 10) : D[key]);

/** Where each measurement is taken, as dotted lines across a torso outline. */
function MeasureDiagram() {
  const lines = [["bust", 62], ["waist", 92], ["high hip", 114], ["hip", 128]];
  return (
    <svg viewBox="0 0 220 170" width="220" height="170" role="img" aria-label="Where to measure bust, waist, high hip and hip" style={{ maxWidth: "100%" }}>
      <circle cx="118" cy="22" r="13" fill="none" stroke="#1e4f80" strokeWidth="2" />
      <path
        d="M110 35 Q108 46 84 51 Q74 55 80 66 Q86 80 96 92 Q92 103 88 114 Q82 124 84 134 Q87 150 94 166 M126 35 Q128 46 152 51 Q162 55 156 66 Q150 80 140 92 Q144 103 148 114 Q154 124 152 134 Q149 150 142 166 M118 140 v26"
        fill="none" stroke="#1e4f80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M92 66 q10 10 22 2 M144 66 q-10 10 -22 2" fill="none" stroke="#1e4f80" strokeWidth="1.5" strokeLinecap="round" />
      {lines.map(([name, y]) => (
        <g key={name}>
          <line x1="6" y1={y} x2="66" y2={y} stroke="var(--text-primary)" strokeWidth="1" />
          <line x1="66" y1={y} x2="166" y2={y} stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="2 3" />
          <text x="6" y={y - 4} fontSize="11" fill="var(--text-primary)">{name}</text>
        </g>
      ))}
    </svg>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your measurements, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  return (
    <>
      <HighlightSummary
        label="Body shape" value={r.shape || "Not classified"} color={r.highRisk ? "#dc2626" : "#16a34a"}
        badge={`WHR ${formatWhr(r.whr)}`} note={r.highRisk ? "above 0.85: higher health risk" : "waist-hip ratio"}
      />
      {r.shape ? (
        <p style={{ ...para, fontSize: 18, color: "var(--text-primary)" }}>
          Body shape: <strong style={{ color: "var(--success)" }}>{r.shape}</strong>
        </p>
      ) : (
        <p style={{ ...para, color: "var(--text-primary)" }}>
          Unfortunately, this calculator was unable to classify your body shape within one of the &quot;seven female body shapes.&quot; Each
          individual is unique, and this calculator is unable to consider all possibilities.
        </p>
      )}
      <p style={{ ...para, fontSize: 18, color: "var(--text-primary)" }}>
        Waist-hip ratio (WHR): <strong style={{ color: "var(--success)" }}>{formatWhr(r.whr)}</strong>
      </p>
      {r.highRisk && (
        <p style={{ ...para, margin: 0 }}>
          Based on a{" "}
          <a href={WHO_REPORT} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>WHO publication</a>, this
          waist-hip ratio indicates abdominal obesity and higher health risk.
        </p>
      )}
    </>
  );
}

export default function BodyTypeCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    Object.fromEntries(FIELDS.map(([key]) => [key, v[key]])),
    (fill) => calculateBodyType(Object.fromEntries(Object.entries(v).map(([key, value]) => [key, fill.has(key) ? example(key, v[`${key}Unit`]) : value]))),
  ));
  const clear = () => { setV((prev) => ({ ...prev, bust: "", waist: "", highHip: "", hip: "" })); req.clear(); setResult(null); };

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0, lineHeight: 1.6 }}>
        The Body Type Calculator is designed for females to find their &quot;body shape,&quot; which can be used for getting targeted outfit
        ideas. Even though there is some research linking certain body shapes with some health risks, the body shape result of this calculator
        is not intended to be a serious indication of health or an ideal that must be met. Instead, the waist-hip ratio, which is also shown in
        the results of this calculator, is a better indicator of health.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 460 }}>
          <div className="card" style={{ padding: 18 }}>
            {FIELDS.map(([key, label]) => (
              <label key={key} style={rowStyle}>
                <span style={labelStyle}>{label}</span>
                <div style={{ flex: 1, minWidth: 0 }}><Req name={key}><TextField value={v[key]} onChange={set(key)} placeholder={example(key, v[`${key}Unit`])} /></Req></div>
                <SelectField value={v[`${key}Unit`]} onChange={set(`${key}Unit`)} options={SIZE_UNITS} style={{ width: 100 }} />
              </label>
            ))}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}><MeasureDiagram /></div>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Results</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
