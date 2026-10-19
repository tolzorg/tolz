import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import PaceBarChart from "./PaceBarChart";
import { SectionLayout, ResultOrErrors, SummaryText } from "./PaceParts";
import { srOnly } from "./paceStyles";
import { calculateMultipoint, MULTIPOINT_DEFAULTS, DISTANCE_UNITS, PACE_UNITS } from "../../../utils/paceCalculatorEngine";

const ROWS = 12;
const DISTANCE_OPTIONS = DISTANCE_UNITS.map((u) => ({ value: u, label: u }));
const PACE_OPTIONS = PACE_UNITS.map((u) => ({ value: u.value, label: u.label }));
const emptyRows = () => Array.from({ length: ROWS }, () => ({ distance: "", unit: "Kilometers", time: "" }));
const th = { padding: "6px 8px", fontSize: 12, textAlign: "right", verticalAlign: "bottom" };
const td = { padding: "4px 8px", fontSize: 13, textAlign: "right", whiteSpace: "nowrap" };

/** Boxes a calculation needs but that are empty: the first row when nothing is entered,
 * otherwise the time of each row (up to the first blank distance) that has a distance. */
function missingCells(rows) {
  const first = rows.findIndex((r) => r.distance.trim() === "");
  const used = first < 0 ? rows : rows.slice(0, first);
  if (!used.length) return ["d0", ...(rows[0].time.trim() ? [] : ["t0"])];
  return used.flatMap((r, i) => (r.time.trim() ? [] : [`t${i}`]));
}

function MultipointResult({ result: r }) {
  return (
    <>
      <HighlightSummary label="Average pace" value={<SummaryText>{r.average}</SummaryText>} color="#008137" />
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table--framed data-table-head" style={{ borderCollapse: "collapse", color: "var(--text-primary)", width: "100%" }}>
          <thead>
            <tr>
              <th style={th} aria-label="Section" />
              <th style={th}>Distance<br />({r.distanceUnit})</th>
              <th style={th}>Time<br />(H:M:S)</th>
              <th style={th}>Pace<br />({r.paceHeader})</th>
              <th style={th}>Accumulated Pace<br />({r.paceHeader})</th>
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row, i) => (
              <tr key={i}>
                <td style={td}>{i + 1}.</td><td style={td}>{row.distance}</td><td style={td}>{row.time}</td>
                <td style={td}>{row.pace}</td><td style={{ ...td, fontWeight: 600 }}>{row.accumulated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.rows.length > 1 && <PaceBarChart values={r.rows.map((row) => row.chartValue)} yTitle={r.chartTitle} />}
    </>
  );
}

export default function MultipointSection() {
  const [rows, setRows] = useState(emptyRows);
  const [paceUnit, setPaceUnit] = useState("tpm");
  const [result, setResult] = useState(null); // no result until Calculate
  const setCell = (i, key) => (value) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const req = useRequiredFields();
  const calculate = () => {
    const missing = missingCells(rows);
    req.flag(missing);
    setResult(missing.length ? null : calculateMultipoint({ points: rows, paceUnit }));
  };
  const clear = () => { setRows(emptyRows()); req.clear(); setResult(null); };

  const form = (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "26px minmax(60px, 1fr) minmax(108px, 1.2fr) minmax(70px, 1fr)", gap: "6px 6px", alignItems: "center" }}>
        <span />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>Distance</span>
        <span />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>Time (hh:mm:ss)</span>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "contents" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "right" }}>{i + 1}.</span>
            <label><span style={srOnly}>{`Distance ${i + 1}`}</span><Req name={`d${i}`}><TextField value={r.distance} onChange={setCell(i, "distance")} placeholder={MULTIPOINT_DEFAULTS[i]?.[0] ?? ""} /></Req></label>
            <label><span style={srOnly}>{`Unit ${i + 1}`}</span><SelectField value={r.unit} onChange={setCell(i, "unit")} options={DISTANCE_OPTIONS} /></label>
            <label><span style={srOnly}>{`Time ${i + 1}`}</span><Req name={`t${i}`}><TextField value={r.time} onChange={setCell(i, "time")} placeholder={MULTIPOINT_DEFAULTS[i]?.[1] ?? ""} /></Req></label>
          </div>
        ))}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, color: "var(--text-primary)" }}>Your Preferred Pace Unit</span>
        <div style={{ flex: "1 1 160px" }}><SelectField value={paceUnit} onChange={setPaceUnit} options={PACE_OPTIONS} /></div>
      </label>
      <ButtonRow onCalculate={calculate} onClear={clear} />
    </div>
  );

  return (
    <RequiredProvider flagged={req.flagged}>
      <SectionLayout form={form} formWidth={440} result={<ResultOrErrors result={result}><MultipointResult result={result} /></ResultOrErrors>} />
    </RequiredProvider>
  );
}
