import { useState } from "react";
import { Link } from "react-router-dom";
import { FieldLabel, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { PARTS, FIELDS, fieldLabel, calculateSemesterGrade } from "../../../utils/semesterGradeCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, minWidth: 0 };
const pair = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const tip = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: 0, padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "10px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const solvedStyle = { color: "var(--accent)", fontWeight: 700 };
const SLICE_COLORS = ["var(--accent)", "var(--accent-2)", "var(--warning)"];

const EMPTY = () => Object.fromEntries(FIELDS.map((k) => [k, ""]));

/** Grade colours: green from 90%, blue from 70%, amber from 50%, red below. */
const gradeColor = (g) => (g >= 90 ? "var(--success)" : g >= 70 ? "var(--accent)" : g >= 50 ? "var(--warning)" : "var(--error)");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter your grades and weights, leaving blank the value you want to find, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { values, numbers, solved, warnings } = result;
  const solvedGrade = solved.find((k) => k !== "semesterGrade" && k.endsWith("Grade"));
  const solvedWeight = solved.find((k) => k.endsWith("Weight"));
  const impossible = warnings.length > 0;
  return (
    <>
      {solvedGrade ? (
        <>
          <HighlightSummary
            label={`You need on the ${fieldLabel(solvedGrade).replace(" grade", "").toLowerCase()}`} value={values[solvedGrade]} unit="%"
            color={impossible ? "var(--error)" : gradeColor(numbers[solvedGrade])} note={`for a semester grade of ${values.semesterGrade}%`}
          />
        </>
      ) : (
        <HighlightSummary label="Semester grade" value={values.semesterGrade} unit="%" color={impossible ? "var(--error)" : gradeColor(numbers.semesterGrade)} />
      )}
      {warnings.map((w) => <p key={w} role="alert" style={notice}>⚠ {w}</p>)}
      <StatList>
        {PARTS.map((p) => (
          <StatRow key={p.key} label={`${p.icon} ${p.label}`} tone={solved.includes(`${p.key}Grade`) || solved.includes(`${p.key}Weight`) ? "var(--accent)" : undefined}>
            {values[`${p.key}Grade`]}% grade · {values[`${p.key}Weight`]}% weight
          </StatRow>
        ))}
        <StatRow label="🎓 Semester grade" tone={solved.includes("semesterGrade") ? "var(--accent)" : undefined}>{values.semesterGrade}%</StatRow>
      </StatList>
      {solvedWeight && <p style={{ ...muted, fontSize: 12.5, marginTop: 8 }}>The {fieldLabel(solvedWeight).toLowerCase()} is what is left of 100%.</p>}
      <h3 style={{ ...cardTitle, fontSize: 14, margin: "18px 0 10px" }}>Weights of semester grade elements [%]</h3>
      <InvestmentPieChart segments={PARTS.map((p, i) => ({ label: p.label, value: numbers[`${p.key}Weight`], color: SLICE_COLORS[i] }))} />
    </>
  );
}

export default function SemesterGradeCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [solved, setSolved] = useState([]); // boxes filled in by the last calculation (shown in blue, re-solved next time)
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();

  const set = (key) => (value) => {
    setV((prev) => ({ ...prev, [key]: value }));
    setSolved((prev) => prev.filter((k) => k !== key)); // typed over: it's the user's value now
  };
  const calculate = () => {
    const input = Object.fromEntries(FIELDS.map((k) => [k, solved.includes(k) ? "" : v[k]]));
    const r = calculateSemesterGrade(input);
    if (r.missing) {
      req.flag(r.missing);
      setV(input);
      setSolved([]);
      setResult(null);
      return;
    }
    req.flag([]);
    if (r.errors) { setResult(r); return; }
    setV(r.values);
    setSolved(r.solved);
    setResult(r);
  };
  const clear = () => { setV(EMPTY()); setSolved([]); setResult(null); req.clear(); };

  const box = (key) => (
    <Req name={key} flagged={req.flagged}>
      <PercentField value={v[key]} onChange={set(key)} style={solved.includes(key) ? solvedStyle : undefined} />
    </Req>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Work out your semester grade from your quarter grades and final exam, or leave the final exam grade blank and enter the semester
        grade you want to find what you need on your final.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={tip}>
            🛠️ Want to add more grades or use a different grading system? Use the{" "}
            <Link to="/calculators/education/grade-calculator" style={{ color: "var(--accent)", fontWeight: 700 }}>grade calculator</Link> or the{" "}
            <Link to="/calculators/education/final-grade-calculator" style={{ color: "var(--accent)", fontWeight: 700 }}>final grade calculator</Link>.
          </p>

          {PARTS.map((p) => (
            <section key={p.key} className="card" style={{ padding: 18 }} aria-label={p.label}>
              <h3 style={cardTitle}><span aria-hidden="true">{p.icon}</span> {p.label}</h3>
              <div style={pair}>
                <label style={fieldWrap}>
                  <FieldLabel>Grade</FieldLabel>
                  {box(`${p.key}Grade`)}
                </label>
                <label style={fieldWrap} title="Percent of semester grade.">
                  <FieldLabel>Weight</FieldLabel>
                  {box(`${p.key}Weight`)}
                </label>
              </div>
            </section>
          ))}

          <section className="card" style={{ padding: 18 }} aria-label="Semester grade">
            <h3 style={cardTitle}><span aria-hidden="true">🎓</span> Semester grade</h3>
            <label style={{ ...fieldWrap, marginBottom: 12 }}>
              <FieldLabel>Grade</FieldLabel>
              {box("semesterGrade")}
            </label>
            <p style={{ ...muted, fontSize: 12.5, marginBottom: 12 }}>
              Weights are percents of the semester grade. Leave one weight blank to use what is left of 100%, and leave the final exam grade
              blank (with the semester grade filled in) to find the grade you need on your final.
            </p>
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
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
