import { useState } from "react";
import { FieldLabel, TextField, RadioOption, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { TYPES, LETTER_GRADES, THRESHOLDS, DEFAULT_SCALE, MAX_GRADES, emptyRow, calculateGrade } from "../../../utils/gradeCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const pair = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const info = { fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: "12px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--accent-light)" };

const GRADE_OPTIONS = LETTER_GRADES.map(([label]) => ({ value: label, label }));
const UNITS = ["decimal", "percent"];
const blankRows = () => Object.fromEntries(TYPES.map((t) => [t.value, Array.from({ length: MAX_GRADES }, emptyRow)]));
const EMPTY = () => ({ type: "letters", count: "2", rows: blankRows(), scale: { ...DEFAULT_SCALE } });

/** Site colours by letter: A green, B blue, C amber, D / F red. */
const letterColor = (l) => ({ A: "var(--success)", B: "var(--accent)", C: "var(--warning)" }[l?.[0]] || "var(--error)");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter your grades and their weights, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      {result.message ? (
        <p style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>{result.message}</p>
      ) : (
        <>
          <HighlightSummary
            label="Your overall grade" value={result.overall} color={letterColor(result.letter)}
            badge={result.detail && result.or ? (result.percent === null ? `${result.detail} GPA` : `${result.detail} · ${result.or}`) : result.letter}
            note={result.percent === null ? result.or : undefined}
          />
          <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>{result.sentence}</p>
        </>
      )}
      {result.alerts.map((a) => <p key={a} role="alert" style={notice}>⚠ {a}</p>)}
      <p style={info}>
        The calculator uses a common grading scale (see the &quot;How this grading calculator works&quot; section below). You can change it
        in the <em>Grading scale (thresholds)</em> section at the end of the calculator.
      </p>
    </>
  );
}

export default function GradeCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const rows = s.rows[s.type];
  const n = Number(s.count);
  const shown = Number.isInteger(n) && n >= 1 ? Math.min(n, MAX_GRADES) : 0;

  const run = (state) => {
    const r = state.rows[state.type].slice(0, Math.max(0, Math.min(Number(state.count) || 0, MAX_GRADES)));
    const missing = [];
    if (state.count.trim() === "") missing.push("count");
    const filled = (row) => (state.type === "letters" ? row.grade !== "" : row.value.trim() !== "");
    if (state.count.trim() !== "" && !r.some(filled)) missing.push("value-0", ...(state.type === "points" ? ["max-0"] : []));
    req.flag(missing);
    return missing.length ? null : calculateGrade({ type: state.type, count: state.count, rows: state.rows[state.type], scale: state.scale });
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const setRow = (i, key) => (value) => setS((prev) => ({
    ...prev, rows: { ...prev.rows, [prev.type]: prev.rows[prev.type].map((r, j) => (j === i ? { ...r, [key]: value } : r)) },
  }));
  const setScale = (key) => (value) => setS((prev) => ({ ...prev, scale: { ...prev.scale, [key]: value } }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const weightField = (r, i) => (
    <label style={fieldWrap}>
      <FieldLabel>#{i + 1} Weight</FieldLabel>
      <ValueUnitField value={r.weight} unit={r.unit} units={UNITS} onValueChange={setRow(i, "weight")} onUnitChange={setRow(i, "unit")} />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Estimate your overall grade from your component marks: letter grades, percentages or points, unweighted or weighted, with a grading
        scale you can adjust to your teacher&apos;s.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Grades type">
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 8px" }}>
              <legend style={{ display: "block", marginBottom: 8 }}><FieldLabel>Grades type</FieldLabel></legend>
              {TYPES.map((t) => <RadioOption key={t.value} checked={s.type === t.value} onChange={() => update({ type: t.value })} label={t.label} />)}
            </fieldset>
            <label style={{ ...fieldWrap, marginBottom: 0 }}>
              <FieldLabel>Enter the number of grades (up to 15)</FieldLabel>
              <Req name="count" flagged={req.flagged}><TextField value={s.count} onChange={(v) => setS((p) => ({ ...p, count: v }))} /></Req>
            </label>
          </section>

          {shown > 0 && (
            <section className="card" style={{ padding: 18 }} aria-label="Grades">
              {rows.slice(0, shown).map((r, i) => (
                <div key={`${s.type}-${i}`} style={{ marginBottom: s.type === "points" ? 8 : 0, borderBottom: s.type === "points" && i < shown - 1 ? "1px dashed var(--border)" : "none" }}>
                  {s.type === "letters" && (
                    <div style={pair}>
                      <label style={fieldWrap}>
                        <FieldLabel>#{i + 1} Grade</FieldLabel>
                        <Req name={`value-${i}`} flagged={req.flagged}><SelectField value={r.grade} onChange={setRow(i, "grade")} options={GRADE_OPTIONS} placeholder="Select" /></Req>
                      </label>
                      {weightField(r, i)}
                    </div>
                  )}
                  {s.type === "percentage" && (
                    <div style={pair}>
                      <label style={fieldWrap}>
                        <FieldLabel>#{i + 1} Grade</FieldLabel>
                        <Req name={`value-${i}`} flagged={req.flagged}><PercentField value={r.value} onChange={setRow(i, "value")} /></Req>
                      </label>
                      {weightField(r, i)}
                    </div>
                  )}
                  {s.type === "points" && (
                    <>
                      <div style={pair}>
                        <label style={fieldWrap}>
                          <FieldLabel>#{i + 1} Points</FieldLabel>
                          <Req name={`value-${i}`} flagged={req.flagged}><TextField value={r.value} onChange={setRow(i, "value")} /></Req>
                        </label>
                        <label style={fieldWrap}>
                          <FieldLabel>#{i + 1} Max points</FieldLabel>
                          <Req name={`max-${i}`} flagged={req.flagged}><TextField value={r.max} onChange={setRow(i, "max")} /></Req>
                        </label>
                      </div>
                      {weightField(r, i)}
                    </>
                  )}
                </div>
              ))}
              <ButtonRow onCalculate={calculate} onClear={clear} />
            </section>
          )}
          {shown === 0 && <ButtonRow onCalculate={calculate} onClear={clear} />}

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={{ cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>
              Grading scale (thresholds)
            </summary>
            <p style={{ ...muted, margin: "10px 0 12px" }}>The lowest percentage for each letter grade. Below the D- threshold the grade is F.</p>
            <div style={pair}>
              {THRESHOLDS.map(([key, name]) => (
                <label key={key} style={fieldWrap}>
                  <FieldLabel>{name}</FieldLabel>
                  <PercentField value={s.scale[key]} onChange={setScale(key)} />
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
