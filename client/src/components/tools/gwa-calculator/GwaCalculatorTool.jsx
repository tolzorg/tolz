import { useState } from "react";
import { FieldLabel, TextField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { SYSTEMS, MAX_COURSES, systemOf, emptyCourse, visibleRows, calculateGwa } from "../../../utils/gwaCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const titleStyle = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)",
  margin: "0 0 14px", paddingLeft: 10, borderLeft: "4px solid var(--accent)", lineHeight: 1.35,
};
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const pair = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const line = { fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 8px" };

const OPTIONS = Object.fromEntries(SYSTEMS.map((s) => [s.value, s.grades.map((x) => ({ value: x.label, label: x.label }))]));
const blankRows = () => Object.fromEntries(SYSTEMS.map((s) => [s.value, Array.from({ length: MAX_COURSES }, emptyCourse)]));
const EMPTY = () => ({ system: "gps5", rows: blankRows() });

/** Site colours by GWA. On the 1.00-5.00 scale lower is better (1.00 highest, 3.00 passing); elsewhere higher is better. */
function gwaColor(system, gwa) {
  if (system === "gps5") return gwa <= 1.75 ? "var(--success)" : gwa <= 2.5 ? "var(--accent)" : gwa <= 3 ? "var(--warning)" : "var(--error)";
  return gwa >= 3.5 ? "var(--success)" : gwa >= 2.5 ? "var(--accent)" : gwa >= 1 ? "var(--warning)" : "var(--error)";
}
/** Badge: the letter grade (letter systems), or passing / failing (grade point systems, the passing marks in the FAQ). */
function badgeOf(system, result) {
  if (result.letter) return `Letter grade ${result.letter}`;
  if (system === "gps5") return result.gwa <= 3 ? "Passing" : "Failing";
  if (system === "gps4") return result.gwa >= 1 ? "Passing" : "Failing";
  return undefined;
}

function ResultBody({ result, system }) {
  if (!result) return <p style={muted}>Choose your course grades and enter their units, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      {result.gwa !== null && (
        <HighlightSummary label="Your GWA" value={result.gwa} color={gwaColor(system, result.gwa)} badge={badgeOf(system, result)} note={systemOf(system).label} />
      )}
      <p style={result.negative ? { ...line, color: "var(--error)", fontWeight: 600 } : line}>{result.gwaLine}</p>
      {result.letterLine && <p style={line}>{result.letterLine}</p>}
    </>
  );
}

export default function GwaCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const system = systemOf(s.system);
  const courses = s.rows[s.system];
  const shown = visibleRows(system, courses);

  const run = (state) => {
    const rows = state.rows[state.system];
    const typedAny = rows.some((c) => c.grade !== "" || c.credits.trim() !== "");
    req.flag(typedAny ? [] : ["grade-0", "credits-0"]);
    return typedAny ? calculateGwa({ system: state.system, courses: rows }) : null;
  };
  const changeSystem = (value) => {
    const next = { ...s, system: value };
    setS(next);
    if (result) setResult(run(next));
  };
  const setCourse = (i, key) => (value) => setS((prev) => ({
    ...prev, rows: { ...prev.rows, [prev.system]: prev.rows[prev.system].map((c, j) => (j === i ? { ...c, [key]: value } : c)) },
  }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Compute your general weighted average (GWA) in college from your course grades and units, on the grade point or letter grading
        system your university uses.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Grading system">
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ display: "block", marginBottom: 8 }}><FieldLabel>Grading system</FieldLabel></legend>
              {SYSTEMS.map((x) => <RadioOption key={x.value} checked={s.system === x.value} onChange={() => changeSystem(x.value)} label={x.label} />)}
            </fieldset>
          </section>

          <section className="card" style={{ padding: 18 }} aria-labelledby="gwa-courses-title">
            <h2 id="gwa-courses-title" style={titleStyle}>Courses</h2>
            {courses.slice(0, shown).map((c, i) => (
              <div key={`${s.system}-${i}`} style={pair}>
                <label style={fieldWrap}>
                  <FieldLabel>#{i + 1} Course grade</FieldLabel>
                  <Req name={`grade-${i}`} flagged={req.flagged}><SelectField value={c.grade} onChange={setCourse(i, "grade")} options={OPTIONS[s.system]} placeholder="Select" /></Req>
                </label>
                <label style={fieldWrap}>
                  <FieldLabel>Units</FieldLabel>
                  <Req name={`credits-${i}`} flagged={req.flagged}><TextField value={c.credits} onChange={setCourse(i, "credits")} /></Req>
                </label>
              </div>
            ))}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Your GWA</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} system={s.system} />
          </div>
        </div>
      </div>
    </div>
  );
}
