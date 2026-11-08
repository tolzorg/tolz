import { useState } from "react";
import { FieldLabel, TextField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { SCALES, scaleOf, emptyCourse, ordinal, visibleRows, calculateGpaPakistan } from "../../../utils/gpaPakistanCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const titleStyle = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)",
  margin: "0 0 14px", paddingLeft: 10, borderLeft: "4px solid var(--accent)", lineHeight: 1.35,
};
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const pair = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const colHead = { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" };

const OPTIONS = Object.fromEntries(SCALES.map((s) => [s.value, s.grades.map((x) => ({ value: x.label, label: x.label }))]));
const blankRows = () => Object.fromEntries(SCALES.map((s) => [s.value, Array.from({ length: s.rows }, emptyCourse)]));
const EMPTY = () => ({ scale: "4", rows: blankRows(), cgpa: false, previousGpa: "", previousCredits: "" });

/** Site colours by GPA as a share of the scale's maximum: 87.5%+ green, 75%+ blue, 50%+ amber, below red. */
const gpaColor = (gpa, max) => {
  const r = gpa / max;
  return r >= 0.875 ? "var(--success)" : r >= 0.75 ? "var(--accent)" : r >= 0.5 ? "var(--warning)" : "var(--error)";
};
const maxOf = (scale) => (scale.value === "4" ? 4 : 5);

function ResultBody({ result, scale }) {
  if (!result) return <p style={muted}>Choose your course grades and enter their credit hours, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      {result.gpa !== null
        ? <HighlightSummary label="Your GPA" value={result.gpa} unit={`/ ${maxOf(scale)}`} color={gpaColor(result.gpa, maxOf(scale))} badge={scale.label} />
        : <p style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: 700, margin: "0 0 8px" }}>{result.gpaLine}</p>}
      {result.cgpa !== null && <HighlightSummary label="Your cGPA" value={result.cgpa} unit={`/ ${maxOf(scale)}`} color="var(--cat-image)" note="All semesters combined" />}
      <StatList>
        <StatRow label="Total courses">{result.courses}</StatRow>
        <StatRow label="Total credits">{result.totalCredits}</StatRow>
        <StatRow label="Total points">{result.totalPoints}</StatRow>
      </StatList>
    </>
  );
}

export default function GpaPakistanCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const scale = scaleOf(s.scale);
  const courses = s.rows[s.scale];
  const shown = visibleRows(scale, courses);

  const run = (state) => {
    const first = state.rows[state.scale][0];
    const missing = [];
    if (first.grade === "") missing.push("grade-0");
    if (first.credits.trim() === "") missing.push("credits-0");
    if (state.cgpa && state.previousGpa.trim() === "") missing.push("previousGpa");
    if (state.cgpa && state.previousCredits.trim() === "") missing.push("previousCredits");
    req.flag(missing);
    // As on the reference, results show once the first course has both a grade and credit hours.
    if (missing.includes("grade-0") || missing.includes("credits-0")) return null;
    return calculateGpaPakistan({ ...state, courses: state.rows[state.scale] });
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const setCourse = (i, key) => (value) => setS((prev) => ({
    ...prev, rows: { ...prev.rows, [prev.scale]: prev.rows[prev.scale].map((c, j) => (j === i ? { ...c, [key]: value } : c)) },
  }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Calculate your university GPA and cGPA on the 4-point or 5-point scale used in Pakistan, or the Quaid-e-Azam University (MPhil)
        scale, from your course grades and credit hours.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Grading scale and cGPA">
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 8px" }}>
              <legend style={{ display: "block", marginBottom: 8 }}><FieldLabel>Grading scale</FieldLabel></legend>
              {SCALES.map((x) => <RadioOption key={x.value} checked={s.scale === x.value} onChange={() => update({ scale: x.value })} label={x.label} />)}
            </fieldset>
            <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 10px", cursor: "pointer" }}>
              <input type="checkbox" checked={s.cgpa} onChange={(e) => update({ cgpa: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
              <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Calculate cGPA</span>
            </label>
            {s.cgpa && (
              <div style={pair}>
                <label style={fieldWrap}>
                  <FieldLabel>Previous GPA</FieldLabel>
                  <Req name="previousGpa" flagged={req.flagged}><TextField value={s.previousGpa} onChange={(v) => setS((p) => ({ ...p, previousGpa: v }))} /></Req>
                </label>
                <label style={fieldWrap}>
                  <FieldLabel>Sum of previous credit hours</FieldLabel>
                  <Req name="previousCredits" flagged={req.flagged}><TextField value={s.previousCredits} onChange={(v) => setS((p) => ({ ...p, previousCredits: v }))} /></Req>
                </label>
              </div>
            )}
          </section>

          <section className="card" style={{ padding: 18 }} aria-labelledby="pk-courses-title">
            <h2 id="pk-courses-title" style={titleStyle}>Course grades and credit hours</h2>
            <div style={pair}>
              <p style={colHead}>{scale.gradeHeading}</p>
              <p style={colHead}>Credit hours</p>
            </div>
            {courses.slice(0, shown).map((c, i) => (
              <div key={`${s.scale}-${i}`} style={pair}>
                <label style={fieldWrap}>
                  <FieldLabel>{ordinal(i + 1)} course</FieldLabel>
                  <Req name={`grade-${i}`} flagged={req.flagged}><SelectField value={c.grade} onChange={setCourse(i, "grade")} options={OPTIONS[s.scale]} placeholder="Select" /></Req>
                </label>
                <label style={fieldWrap}>
                  <FieldLabel>{ordinal(i + 1)} credit</FieldLabel>
                  <Req name={`credits-${i}`} flagged={req.flagged}><TextField value={c.credits} onChange={setCourse(i, "credits")} /></Req>
                </label>
              </div>
            ))}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Results 🎓</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} scale={scale} />
          </div>
        </div>
      </div>
    </div>
  );
}
