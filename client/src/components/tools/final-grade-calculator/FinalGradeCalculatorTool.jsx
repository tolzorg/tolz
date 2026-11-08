import { useState } from "react";
import { FieldLabel, TextField, RadioOption, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  MODES, SYSTEMS, MAX_EXAMS, ORDINALS, isLetterSystem, letterOptions, visibleExamCount, calculateFinalGrade,
} from "../../../utils/finalGradeCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const suffix = { fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "10px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const TONES = {
  error: { background: "var(--accent-2-light)", border: "1px solid var(--error)" },
  success: { background: "var(--success-light)", border: "1px solid var(--success)" },
  info: { background: "var(--accent-light)", border: "1px solid var(--accent)" },
};

const blankExams = () => Array.from({ length: MAX_EXAMS }, () => ({ grade: "", weight: "" }));
const EMPTY = () => ({ mode: "previous", system: "percentage", current: "", wanted: "", finalWeight: "", exams: blankExams() });

/** A percentage box followed by a short note, e.g. "% of the final grade". */
function WeightField({ value, onChange, note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <PercentField value={value} onChange={onChange} />
      <span style={suffix}>{note}</span>
    </div>
  );
}

/** The grade input for the chosen grading system: a dropdown of letters, a % box or a plain number box. */
function GradeInput({ system, value, onChange }) {
  if (isLetterSystem(system)) return <SelectField value={value} onChange={onChange} options={letterOptions(system)} placeholder="Select" />;
  if (system === "percentage") return <PercentField value={value} onChange={onChange} />;
  return <TextField value={value} onChange={onChange} />;
}

function ResultBody({ result, mode }) {
  if (!result) return <p style={muted}>Enter your grades, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { message } = result;
  const color = message?.tone === "error" ? "var(--error)" : message?.tone === "success" ? "var(--success)" : "var(--accent)";
  return (
    <>
      {result.value !== null && (
        <HighlightSummary label="You need" value={result.value} unit={result.unit || undefined} color={color} note="on your final exam" />
      )}
      {result.value !== null && (
        <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
          You need <strong>{result.value}{result.unit}</strong> on your final exam.
        </p>
      )}
      {message && (
        <div role="status" style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.55, margin: "10px 0 0", padding: "10px 12px", borderRadius: "var(--radius-sm)", ...TONES[message.tone] }}>
          {message.title && <strong style={{ display: "block", marginBottom: 4 }}>{message.title}</strong>}
          {message.text}
        </div>
      )}
      {mode === "previous" && (
        <StatList>
          <StatRow label="Your final exam is worth">{result.finalWeight}% of the final grade</StatRow>
        </StatList>
      )}
      {result.warnings.map((w) => <p key={w} role="alert" style={notice}>⚠ {w}</p>)}
    </>
  );
}

export default function FinalGradeCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const letters = isLetterSystem(s.system);
  const shown = visibleExamCount(s.system, s.exams);

  const run = (state) => {
    const missing = [];
    const blank = (v) => String(v).trim() === "";
    if (state.mode === "current") {
      if (blank(state.current)) missing.push("current");
      if (blank(state.wanted)) missing.push("wanted");
      if (blank(state.finalWeight)) missing.push("finalWeight");
    } else {
      if (blank(state.exams[0].grade)) missing.push("grade-0");
      if (blank(state.exams[0].weight)) missing.push("weight-0");
      // "You want a final grade of..." is optional in this mode: blank still shows the final exam's weight.
    }
    req.flag(missing);
    return missing.length ? null : calculateFinalGrade(state);
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const set = (key) => (value) => setS((prev) => ({ ...prev, [key]: value }));
  const setExam = (i, key) => (value) => setS((prev) => ({ ...prev, exams: prev.exams.map((e, j) => (j === i ? { ...e, [key]: value } : e)) }));
  // Letter dropdowns and number boxes mean different things, so a new grading system starts with empty grades.
  const changeSystem = (system) => update({ system, current: "", wanted: "", exams: blankExams() });
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Find the grade you need on your final exam to reach the final grade you want, from your current grade or from the grades and weights
        of your previous exams, in numbers, percentages or letter grades.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Calculation settings">
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 8px" }}>
              <legend style={{ display: "block", marginBottom: 8 }}><FieldLabel>Calculate using your...</FieldLabel></legend>
              {MODES.map((m) => <RadioOption key={m.value} checked={s.mode === m.value} onChange={() => update({ mode: m.value })} label={m.label} />)}
            </fieldset>
            <label style={{ ...fieldWrap, marginBottom: 0 }}>
              <FieldLabel>Grading System</FieldLabel>
              <SelectField value={s.system} onChange={changeSystem} options={SYSTEMS} />
            </label>
          </section>

          {s.mode === "current" ? (
            <section className="card" style={{ padding: 18 }} aria-label="Your grade">
              <h3 style={cardTitle}>Your grade(s)</h3>
              <label style={fieldWrap}>
                <FieldLabel>Your current grade is...</FieldLabel>
                <Req name="current" flagged={req.flagged}><GradeInput system={s.system} value={s.current} onChange={set("current")} /></Req>
              </label>
              <label style={fieldWrap}>
                <FieldLabel>You want a final grade of...</FieldLabel>
                <Req name="wanted" flagged={req.flagged}><GradeInput system={s.system} value={s.wanted} onChange={set("wanted")} /></Req>
              </label>
              <label style={fieldWrap}>
                <FieldLabel>The final exam is</FieldLabel>
                <Req name="finalWeight" flagged={req.flagged}><WeightField value={s.finalWeight} onChange={set("finalWeight")} note="of the total grade" /></Req>
              </label>
              <ButtonRow onCalculate={calculate} onClear={clear} />
            </section>
          ) : (
            <>
              {s.exams.slice(0, shown).map((e, i) => (
                <section key={`${s.system}-${i}`} className="card" style={{ padding: 18 }} aria-label={`${ORDINALS[i]} exam`}>
                  <h3 style={cardTitle}>{ORDINALS[i]} exam</h3>
                  <label style={fieldWrap}>
                    <FieldLabel>Your grade was...</FieldLabel>
                    <Req name={`grade-${i}`} flagged={req.flagged}><GradeInput system={s.system} value={e.grade} onChange={setExam(i, "grade")} /></Req>
                  </label>
                  <label style={{ ...fieldWrap, marginBottom: 0 }}>
                    <FieldLabel>It is worth...</FieldLabel>
                    <Req name={`weight-${i}`} flagged={req.flagged}><WeightField value={e.weight} onChange={setExam(i, "weight")} note="of the final grade" /></Req>
                  </label>
                </section>
              ))}
              {shown < MAX_EXAMS && (
                <p style={{ ...muted, marginTop: -8 }}>
                  The next exam appears once you enter a {letters ? "grade" : "non-zero grade"} for exam {shown} (up to {MAX_EXAMS} exams).
                </p>
              )}
              <section className="card" style={{ padding: 18 }} aria-label="Wanted final grade">
                <label style={fieldWrap}>
                  <FieldLabel>You want a final grade of...</FieldLabel>
                  <GradeInput system={s.system} value={s.wanted} onChange={set("wanted")} />
                </label>
                <ButtonRow onCalculate={calculate} onClear={clear} />
              </section>
            </>
          )}
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} mode={s.mode} />
            {result && !result.errors && (result.value !== null || result.message) && (
              <p style={{ ...muted, fontSize: 12.5, marginTop: 12 }}>
                If the grade you need is above the maximum possible grade, the final grade you want can&apos;t be reached with your current grades.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
