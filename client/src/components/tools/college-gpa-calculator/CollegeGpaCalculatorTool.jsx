import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { MAX_COURSES, GRADE_OPTIONS, emptyCourse, visibleRows, calculateCollegeGpa } from "../../../utils/collegeGpaCalculatorEngine";

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
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };

const EMPTY = { courses: Array.from({ length: MAX_COURSES }, emptyCourse), cumulative: false, priorGpa: "", priorCredits: "" };
/** Site colours by GPA: 3.5+ green, 3+ blue, 2+ amber, below red. */
const gpaColor = (g) => (g >= 3.5 ? "var(--success)" : g >= 3 ? "var(--accent)" : g >= 2 ? "var(--warning)" : "var(--error)");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Choose your course grades and enter their credits, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      {result.gpa !== null && (
        <HighlightSummary label="Your GPA" value={result.gpa} color={gpaColor(result.gpa)} badge="Weighted with credits" note={`${result.count} ${result.count === 1 ? "course" : "courses"}`} />
      )}
      {result.cumulative !== null && <HighlightSummary label="Cumulative GPA" value={result.cumulative} color="var(--cat-image)" note="All semesters combined" />}
      <p style={line}>You&apos;ve entered <strong>{result.count}</strong> {result.count === 1 ? "course." : "courses."}</p>
      <p style={line}>{result.gpaLine}</p>
      <p style={line}>{result.cumulativeLine}</p>
      {[...result.warnings, ...result.alerts].map((w, i) => <p key={`${i}-${w}`} role="alert" style={notice}>⚠ {w}</p>)}
    </>
  );
}

export default function CollegeGpaCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const rows = visibleRows(s.courses);

  const run = (state) => {
    const missing = [];
    const typedAny = state.courses.some((c) => c.grade !== "" || c.credits.trim() !== "");
    const prior = state.cumulative && state.priorGpa.trim() !== "" && state.priorCredits.trim() !== "";
    if (!typedAny && !prior) missing.push("grade-0", "credits-0");
    if (state.cumulative) {
      if (state.priorGpa.trim() === "") missing.push("priorGpa");
      if (state.priorCredits.trim() === "") missing.push("priorCredits");
    }
    req.flag(missing);
    return missing.includes("grade-0") ? null : calculateCollegeGpa(state);
  };
  const setCourse = (i, key) => (value) => setS((prev) => ({ ...prev, courses: prev.courses.map((c, j) => (j === i ? { ...c, [key]: value } : c)) }));
  const toggleCumulative = (checked) => {
    const next = { ...s, cumulative: checked };
    setS(next);
    if (result) setResult(run(next));
  };
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Enter the grades from your college courses and the credits for each of them to find your GPA, and your cumulative GPA across
        semesters.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <section className="card" style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, padding: 18 }} aria-labelledby="cgpa-courses-title">
          <h2 id="cgpa-courses-title" style={titleStyle}>Courses</h2>
          <p style={{ ...para, fontSize: 13 }}>
            📚 You can enter up to <strong>30 courses</strong>, one per row. The next input fields appear when you enter the course grade and
            its corresponding credits into the last box.
          </p>
          {s.courses.slice(0, rows).map((c, i) => (
            <div key={i} style={pair}>
              <label style={fieldWrap}>
                <FieldLabel>#{i + 1} Grade</FieldLabel>
                <Req name={`grade-${i}`} flagged={req.flagged}><SelectField value={c.grade} onChange={setCourse(i, "grade")} options={GRADE_OPTIONS} placeholder="Select" /></Req>
              </label>
              <label style={fieldWrap}>
                <FieldLabel>#{i + 1} Credits</FieldLabel>
                <Req name={`credits-${i}`} flagged={req.flagged}><TextField value={c.credits} onChange={setCourse(i, "credits")} /></Req>
              </label>
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px", cursor: "pointer" }}>
            <input type="checkbox" checked={s.cumulative} onChange={(e) => toggleCumulative(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
            <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Calculate your cumulative GPA</span>
          </label>
          {s.cumulative && (
            <div style={{ marginBottom: 6 }}>
              <h3 style={{ ...titleStyle, fontSize: 14, borderLeftColor: "var(--cat-image)" }}>Prior results</h3>
              <label style={fieldWrap}>
                <FieldLabel hint="The GPA from previous semesters.">Prior GPA</FieldLabel>
                <Req name="priorGpa" flagged={req.flagged}><TextField value={s.priorGpa} onChange={(v) => setS((p) => ({ ...p, priorGpa: v }))} /></Req>
              </label>
              <label style={fieldWrap}>
                <FieldLabel hint="Sum of credits from previous semesters.">Total credits of prior GPA</FieldLabel>
                <Req name="priorCredits" flagged={req.flagged}><TextField value={s.priorCredits} onChange={(v) => setS((p) => ({ ...p, priorCredits: v }))} /></Req>
              </label>
            </div>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </section>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Your GPA</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
