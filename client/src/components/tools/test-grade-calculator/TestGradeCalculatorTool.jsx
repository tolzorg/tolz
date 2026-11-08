import { useState } from "react";
import { FieldLabel, TextField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  FIELDS, LIMITS, DEFAULT_LIMITS, MAX_TABLE_ROWS, INCREMENT_MESSAGE, calculateTestGrade, gradeTable,
} from "../../../utils/testGradeCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const pair = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const solvedStyle = { color: "var(--accent)", fontWeight: 700 };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };

const LABELS = { total: "Number of points / questions ❓", wrong: "Number wrong ❌", right: "Number correct ✅", percentage: "Percentage" };
const EMPTY = () => ({ values: Object.fromEntries(FIELDS.map((k) => [k, ""])), increment: "1", limits: { ...DEFAULT_LIMITS } });

/** Site colours by letter: A green, B blue, C amber, D / F red. */
const letterColor = (l) => ({ A: "var(--success)", B: "var(--accent)", C: "var(--warning)" }[l?.[0]] || "var(--error)");

function GradeTable({ table }) {
  return (
    <>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--text-primary)", margin: "18px 0 8px" }}>Grade table</h3>
      <div style={{ overflowX: "auto", maxHeight: 420, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
        <table className="data-table data-table--framed data-table-head" style={tableStyle}>
          <thead><tr><th># Right</th><th># Wrong</th><th>Percentage</th><th>Grade</th></tr></thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                <td style={center}>{r[0]}</td><td style={center}>{r[1]}</td><td style={center}>{r[2]}</td>
                <td style={{ ...center, fontWeight: 700, color: letterColor(r[3]) }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.truncated && <p style={{ ...muted, fontSize: 12.5, marginTop: 6 }}>Showing the first {MAX_TABLE_ROWS.toLocaleString("en-US")} rows. Use a bigger increment to see the whole scale.</p>}
    </>
  );
}

function ResultBody({ result, table, incrementAlert }) {
  if (!result) return <p style={muted}>Enter any two of the four values (or just the percentage), then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { values, solved, grade, alerts } = result;
  const tone = (k) => (solved.includes(k) ? "var(--accent)" : undefined);
  return (
    <>
      <HighlightSummary label="Percentage" value={values.percentage} unit="%" color={grade ? letterColor(grade) : "var(--error)"} badge={grade || undefined} />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
        The grade is{grade ? <> <strong>{grade}</strong>.</> : "…"}
      </p>
      {alerts.map((a) => <p key={a} role="alert" style={notice}>⚠ {a}</p>)}
      {values.total !== "" && (
        <StatList>
          <StatRow label="Number of points / questions" tone={tone("total")}>{values.total}</StatRow>
          <StatRow label="Number wrong" tone={tone("wrong")}>{values.wrong}</StatRow>
          <StatRow label="Number correct" tone={tone("right")}>{values.right}</StatRow>
        </StatList>
      )}
      {incrementAlert && <p role="alert" style={notice}>⚠ {INCREMENT_MESSAGE}</p>}
      {table && <GradeTable table={table} />}
    </>
  );
}

export default function TestGradeCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [order, setOrder] = useState([]); // typed boxes, least recent first
  const [solved, setSolved] = useState([]); // boxes filled in by the last calculation (blue)
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();

  const run = (state, typedOrder, solvedNow) => {
    const input = Object.fromEntries(FIELDS.map((k) => [k, solvedNow.includes(k) ? "" : state.values[k]]));
    const r = calculateTestGrade(input, typedOrder.filter((k) => !solvedNow.includes(k)), state.limits);
    if (r.missing) {
      req.flag(r.missing);
      setS({ ...state, values: input });
      setSolved([]);
      return null;
    }
    req.flag([]);
    if (r.errors) return r;
    setS({ ...state, values: r.values });
    setSolved(r.solved);
    return r;
  };
  const setValue = (key) => (value) => {
    setS((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));
    setOrder((prev) => [...prev.filter((k) => k !== key), key]);
    setSolved((prev) => prev.filter((k) => k !== key)); // typed over: it's the user's value now
  };
  // Table settings and the grade scale update an existing result straight away.
  const setSetting = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result && !result.errors) setResult(run(next, order, solved));
  };
  const setLimit = (key) => (value) => setSetting({ limits: { ...s.limits, [key]: value } });
  const calculate = () => setResult(run(s, order, solved));
  const clear = () => { setS(EMPTY()); setOrder([]); setSolved([]); setResult(null); req.clear(); };

  const showTable = result && !result.errors && result.tableTotal !== "";
  const table = showTable ? gradeTable(result.tableTotal, s.increment, s.limits) : null;
  const inc = Number(s.increment);
  const incrementAlert = showTable && s.increment.trim() !== "" && Number.isFinite(inc) && inc < 0.1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Turn a test score into a percentage and a letter grade: enter the number of points or questions and how many you got wrong or
        right, or any two of the four values. See the full grading scale for the test in the grade table.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Test score">
            {FIELDS.map((k) => (
              <label key={k} style={fieldWrap}>
                <FieldLabel>{LABELS[k]}</FieldLabel>
                <Req name={k} flagged={req.flagged}>
                  {k === "percentage"
                    ? <PercentField value={s.values[k]} onChange={setValue(k)} style={solved.includes(k) ? solvedStyle : undefined} />
                    : <TextField value={s.values[k]} onChange={setValue(k)} style={solved.includes(k) ? solvedStyle : undefined} />}
                </Req>
              </label>
            ))}
            <p style={{ ...muted, fontSize: 12.5, marginBottom: 12 }}>
              Values the calculator fills in are shown in blue. With more than two values typed, the two you typed last are kept.
            </p>
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={summary}>Grade table</summary>
            <label style={{ ...fieldWrap, margin: "12px 0 0" }}>
              <FieldLabel>Increment by</FieldLabel>
              <TextField value={s.increment} onChange={(v) => setSetting({ increment: v })} />
            </label>
            <p style={{ ...muted, fontSize: 12.5, marginTop: 6 }}>
              Difference between rows in the full grading scale table. Use 0.5 if it&apos;s possible to get half-points.
            </p>
          </details>

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={summary}>Grade scale</summary>
            <p style={{ ...muted, margin: "10px 0 12px" }}>The lowest percentage for each letter grade. Below the D- limit the grade is F.</p>
            <div style={pair}>
              {LIMITS.map(([key, label]) => (
                <label key={key} style={{ ...fieldWrap, marginBottom: 0 }}>
                  <FieldLabel>Grade {label} ≥</FieldLabel>
                  <PercentField value={s.limits[key]} onChange={setLimit(key)} />
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} table={table} incrementAlert={incrementAlert} />
          </div>
        </div>
      </div>
    </div>
  );
}
