import { useState } from "react";
import { FieldLabel, TextField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import {
  GRADES, COURSE_TYPES, MAX_COURSES, GPA_DEFAULTS, emptyCourse, modeOf, visibleRows, calculateGpa,
} from "../../../utils/gpaCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const titleStyle = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)",
  margin: "0 0 14px", paddingLeft: 10, borderLeft: "4px solid var(--accent)", lineHeight: 1.35,
};
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 };
const groupLabel = { display: "block", marginBottom: 8 };
const line = { fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 8px" };
const notice = (tone) => ({
  fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px",
  borderRadius: "var(--radius-sm)", background: `var(--${tone}-light)`, border: `1px solid var(--${tone})`,
});

const GRADE_OPTIONS = GRADES.map(([g]) => ({ value: g, label: g }));
const TYPE_OPTIONS = COURSE_TYPES.map((t) => ({ value: t.value, label: t.label }));
const EMPTY = { ...GPA_DEFAULTS, courses: Array.from({ length: MAX_COURSES }, emptyCourse), priorGpa: "", priorCredits: "", priorCourses: "" };

/** Site colours by GPA: 3.5+ green, 3+ blue, 2+ amber, below red. */
const gpaColor = (g) => (g >= 3.5 ? "var(--success)" : g >= 3 ? "var(--accent)" : g >= 2 ? "var(--warning)" : "var(--error)");
const BADGE = {
  "This is your unweighted GPA.": "Unweighted GPA",
  "This is your GPA weighted with credits.": "Weighted with credits",
  "This is your GPA weighted with credits and course difficulty.": "Weighted with credits & difficulty",
  "This is your GPA weighted with course difficulty, commonly called your weighted GPA.": "Weighted GPA",
};

/** The reference's hint above the course rows. */
function instructions(mode) {
  if (mode.credits && mode.honors) return "course grade and its corresponding credits and course type into the last box.";
  if (mode.credits) return "course grade and its corresponding credits into the last box.";
  if (mode.honors) return "course grade and its corresponding course type into the last box.";
  return "course grade into the last box.";
}

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Choose your course grades, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      {result.gpa !== null && (
        <HighlightSummary label="Your GPA" value={result.gpa} color={gpaColor(result.gpa)} badge={BADGE[result.gpaNote]} note={`${result.count} ${result.count === 1 ? "course" : "courses"}`} />
      )}
      {result.cumulative !== null && (
        <HighlightSummary label="Cumulative GPA" value={result.cumulative} color="var(--cat-image)" note="All terms combined" />
      )}
      <p style={line}>You&apos;ve entered <strong>{result.count}</strong> {result.count === 1 ? "course." : "courses."}</p>
      {result.totalCreditsLine && <p style={line}>{result.totalCreditsLine}</p>}
      {result.gpaLine && <p style={line}>{result.gpaLine}</p>}
      {result.gpaNote && <p style={{ ...line, color: "var(--text-secondary)" }}>{result.gpaNote}</p>}
      <p style={line}>{result.cumulativeLine}</p>
      {result.collegesCare && <p style={{ ...line, color: "var(--text-secondary)" }}>This is usually the cumulative GPA that colleges care about (omitting non-core classes).</p>}
      {result.warnings.map((w) => <p key={w} role="alert" style={notice("warning")}>⚠ {w}</p>)}
      {result.alerts.map((a) => <p key={a} role="alert" style={notice("warning")}>⚠ {a}</p>)}
    </>
  );
}

const INTRO = "Calculate your high school or college GPA with or without credits, including honors, AP, IB and college courses, and find your cumulative GPA across terms.";

/** variant "highSchool": the High School GPA Calculator (no high school / college choice); intro: the line above it. */
export default function GpaCalculatorTool({ variant, intro = INTRO }) {
  const highSchool = variant === "highSchool";
  const empty = () => ({ ...EMPTY, variant, courses: EMPTY.courses.map(emptyCourse) });
  const [s, setS] = useState(empty);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const mode = modeOf(s);
  const rows = visibleRows(s, s.courses);

  const run = (state) => {
    const r = calculateGpa(state);
    const m = modeOf(state);
    const missing = [];
    const hasPrior = state.priorGpa.trim() !== "" && (m.credits ? state.priorCredits : state.priorCourses).trim() !== "";
    if (!r.errors && r.count === 0 && !(state.cumulative && hasPrior)) missing.push("grade-0");
    if (state.cumulative) {
      if (state.priorGpa.trim() === "") missing.push("priorGpa");
      const box = m.credits ? "priorCredits" : "priorCourses";
      if (state[box].trim() === "") missing.push(box);
    }
    req.flag(missing);
    return missing.includes("grade-0") ? null : r;
  };
  /** Change options; recalculate once a result is showing (as the site's mode switches do). */
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const setCourse = (i, key) => (value) => setS((prev) => ({ ...prev, courses: prev.courses.map((c, j) => (j === i ? { ...c, [key]: value } : c)) }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(empty()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>{intro}</p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 260, maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="GPA options">
            {!highSchool && (
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
                <legend style={groupLabel}><FieldLabel>Calculate GPA for...</FieldLabel></legend>
                <RadioOption checked={!mode.college} onChange={() => update({ level: "hs" })} label="📚 high school" />
                <RadioOption checked={mode.college} onChange={() => update({ level: "college" })} label="🎓 college" />
              </fieldset>
            )}
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
              <legend style={groupLabel}><FieldLabel>Courses have...</FieldLabel></legend>
              <RadioOption checked={!mode.credits} onChange={() => update(mode.college ? { collegeCredits: false } : { hsCredits: false })} label="equal weights" />
              <RadioOption checked={mode.credits} onChange={() => update(mode.college ? { collegeCredits: true } : { hsCredits: true })} label="different credits" />
            </fieldset>
            {!mode.college && (
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={groupLabel}><FieldLabel>Course types</FieldLabel></legend>
                <RadioOption checked={!s.honors} onChange={() => update({ honors: false })} label="Only regular courses" />
                <RadioOption checked={s.honors} onChange={() => update({ honors: true })} label="Honors / AP / IB / College" />
              </fieldset>
            )}
          </section>

          <section className="card" style={{ padding: 18 }} aria-labelledby="gpa-courses-title">
            <h2 id="gpa-courses-title" style={titleStyle}>Courses</h2>
            <p style={{ ...para, fontSize: 13 }}>
              🙋 You can enter up to <strong>20 courses</strong>. The next input fields appear when you enter the {instructions(mode)}
            </p>
            {s.courses.slice(0, rows).map((c, i) => (
              <div key={i} style={{ paddingBottom: 4, marginBottom: 8, borderBottom: i < rows - 1 ? "1px dashed var(--border)" : "none" }}>
                <label style={fieldWrap}>
                  <FieldLabel>✔️ #{i + 1} Course Grade</FieldLabel>
                  <Req name={`grade-${i}`} flagged={req.flagged}><SelectField value={c.grade} onChange={setCourse(i, "grade")} options={GRADE_OPTIONS} placeholder="Select" /></Req>
                </label>
                {mode.credits && (
                  <label style={fieldWrap}>
                    <FieldLabel>↳ #{i + 1} Credits</FieldLabel>
                    <TextField value={c.credits} onChange={setCourse(i, "credits")} />
                  </label>
                )}
                {mode.honors && (
                  <label style={fieldWrap}>
                    <FieldLabel>↳ #{i + 1} Course type</FieldLabel>
                    <SelectField value={c.type} onChange={setCourse(i, "type")} options={TYPE_OPTIONS} />
                  </label>
                )}
              </div>
            ))}
            <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px", cursor: "pointer" }}>
              <input type="checkbox" checked={s.cumulative} onChange={(e) => update({ cumulative: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
              <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Calculate your cumulative GPA</span>
            </label>
            {s.cumulative && (
              <div style={{ marginBottom: 6 }}>
                <h3 style={{ ...titleStyle, fontSize: 14, borderLeftColor: "var(--cat-image)" }}>Prior results</h3>
                <label style={fieldWrap}>
                  <FieldLabel hint="The GPA from previous terms.">Prior GPA</FieldLabel>
                  <Req name="priorGpa" flagged={req.flagged}><TextField value={s.priorGpa} onChange={(v) => setS((p) => ({ ...p, priorGpa: v }))} /></Req>
                </label>
                {mode.credits ? (
                  <label style={fieldWrap}>
                    <FieldLabel>Sum of previous credits</FieldLabel>
                    <Req name="priorCredits" flagged={req.flagged}><TextField value={s.priorCredits} onChange={(v) => setS((p) => ({ ...p, priorCredits: v }))} /></Req>
                  </label>
                ) : (
                  <label style={fieldWrap}>
                    <FieldLabel>Previous number of courses completed</FieldLabel>
                    <Req name="priorCourses" flagged={req.flagged}><TextField value={s.priorCourses} onChange={(v) => setS((p) => ({ ...p, priorCourses: v }))} /></Req>
                  </label>
                )}
              </div>
            )}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

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
