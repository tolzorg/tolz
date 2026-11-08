import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { calculateApScore } from "../../../utils/apScoreCalculatorEngine";

// Shared by the AP® exam score calculators (AP® Bio, AP® Chem, AP® Lang, AP® World): the exam's input sections and the
// composite / AP® score result.

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const titleStyle = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)",
  margin: "0 0 14px", paddingLeft: 10, borderLeft: "4px solid var(--accent)", lineHeight: 1.35,
};
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 };

/** Site colours by AP® score: 5 green, 4–3 blue, 2 amber, 1 red. */
const SCORE_COLOR = { 5: "var(--success)", 4: "var(--accent)", 3: "var(--accent)", 2: "var(--warning)", 1: "var(--error)" };
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Field({ field, value, onChange }) {
  return (
    <label style={fieldWrap}>
      <FieldLabel>{field.label}</FieldLabel>
      <Req name={field.key}><TextField value={value} onChange={onChange} /></Req>
    </label>
  );
}

function ResultBody({ exam, result }) {
  if (!result) return <p style={muted}>Enter your points for every question, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      <HighlightSummary
        label="AP® score (1-5)" value={result.apScore} color={SCORE_COLOR[result.apScore]}
        badge={capitalise(result.recommendation)} note="College Board recommendation"
      />
      <StatList>
        <StatRow label={`Composite score (0-${exam.maxComposite})`} tone="var(--accent)">{result.composite}</StatRow>
        {result.rows.map((row) => <StatRow key={row.label} label={row.label}>{row.points} / {row.max}</StatRow>)}
      </StatList>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        Recommendation: <strong>{result.recommendation}</strong>. <em>The actual AP® score may differ, as the College Board adjusts it each year.</em>
      </p>
    </>
  );
}

/** exam: an AP_EXAMS entry; intro: the sentence above the calculator. */
export default function ApScoreCalculatorTool({ exam, intro }) {
  const empty = () => Object.fromEntries(exam.fields.map((f) => [f.key, ""]));
  const [v, setV] = useState(empty);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const set = (key) => (text) => setV((prev) => ({ ...prev, [key]: text }));
  const calculate = () => setResult(req.require(v) ? calculateApScore(exam, v) : null);
  const clear = () => { setV(empty()); setResult(null); req.clear(); };
  const byKey = Object.fromEntries(exam.fields.map((f) => [f.key, f]));
  const last = exam.sections.length - 1;

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>{intro}</p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 260, maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}>
          {exam.sections.map((sec, i) => (
            <section key={sec.title} className="card" style={{ padding: 18 }} aria-labelledby={`ap-section-${i}`}>
              <h2 id={`ap-section-${i}`} style={titleStyle}>{sec.title}</h2>
              {sec.keys.map((k) => <Field key={k} field={byKey[k]} value={v[k]} onChange={set(k)} />)}
              {i === last && <ButtonRow onCalculate={calculate} onClear={clear} />}
            </section>
          ))}
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>{exam.resultTitle}</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody exam={exam} result={result} />
          </div>
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
