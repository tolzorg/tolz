import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import CashFlowColumnChart from "./CashFlowColumnChart";
import {
  calculateCashFlowReturn, calculateCumulativeReturn, format2,
  CASH_FLOW_ROWS, RETURN_ROWS, VISIBLE_ROWS,
} from "../../../utils/averageReturnCalculatorEngine";
import { todayIso } from "../../../utils/depreciationCalculatorEngine";

const ACTIVITY_OPTIONS = [{ value: "d", label: "Deposit" }, { value: "w", label: "Withdraw" }];
const BLANK_DATE = "2024-01-01";

// The reference's example values, shown as placeholder hints only (the
// site's convention). An untouched calculator calculates with the example;
// once any row is typed in, the rows are used exactly as entered, since a
// blank row means "unused" rather than "use the example".
const START_BALANCE_HINT = "5600";
const END_BALANCE_HINT = "18000";
const FLOW_HINTS = ["5000", "1500", "3800"];
const RETURN_HINTS = [{ ret: "10", years: "1", months: "2" }, { ret: "-2", years: "", months: "5" }, { ret: "15", years: "2", months: "3" }];

// Activity menus and dates aren't text boxes, so they keep the reference's
// own starting values.
const defaultFlows = () => Array.from({ length: CASH_FLOW_ROWS }, (_, i) => (
  [{ type: "d", amount: "", date: "2024-01-15" }, { type: "w", amount: "", date: "2024-06-01" }, { type: "d", amount: "", date: "2025-01-18" }][i]
  ?? { type: "d", amount: "", date: BLANK_DATE }
));
const blankReturns = () => Array.from({ length: RETURN_ROWS }, () => ({ ret: "", years: "", months: "" }));

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const sectionText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" };
const headCell = { fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", textAlign: "left", padding: "0 4px 6px" };
const indexCell = { fontSize: 12.5, color: "var(--text-muted)", padding: "0 6px 6px 0", textAlign: "right", whiteSpace: "nowrap" };
const inputCell = { padding: "0 4px 6px" };
const dateInputStyle = {
  width: "100%", minWidth: 0, padding: "7px 8px", fontSize: 13, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
  fontFamily: "var(--font-display)", color: "var(--text-primary)", background: "var(--bg-white)",
};
const linkButton = { background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" };

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function ButtonRow({ onCalculate, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
      <button type="button" onClick={onCalculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

function MoreToggle({ open, onToggle }) {
  return (
    <div style={{ padding: "2px 0 0 26px" }}>
      <button type="button" onClick={onToggle} style={linkButton} aria-expanded={open}>
        {open ? "Hide Fields Below" : "Show More Input Fields"}
      </button>
    </div>
  );
}

/* ── 1. Average Return Based on Cash Flow ───────────────────────── */

function CashFlowCalculator() {
  const [startBalance, setStartBalance] = useState("");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endBalance, setEndBalance] = useState("");
  const [endDate, setEndDate] = useState(todayIso);
  const [flows, setFlows] = useState(defaultFlows);
  const [showMore, setShowMore] = useState(false);
  const [result, setResult] = useState(null);

  const setFlow = (i, key) => (value) => setFlows((prev) => prev.map((f, j) => (j === i ? { ...f, [key]: value } : f)));
  const calculate = () => {
    const untouched = flows.every((f) => f.amount === "");
    const used = untouched ? flows.map((f, i) => ({ ...f, amount: FLOW_HINTS[i] ?? "" })) : flows;
    setResult(calculateCashFlowReturn({
      startBalance: startBalance || START_BALANCE_HINT, startDate,
      endBalance: endBalance || END_BALANCE_HINT, endDate, flows: used,
    }));
  };
  const clear = () => {
    setStartBalance(""); setEndBalance("");
    setFlows((prev) => prev.map((f) => ({ ...f, amount: "" })));
    setResult(null);
  };

  const rowCount = showMore ? CASH_FLOW_ROWS : VISIBLE_ROWS;

  return (
    <section aria-labelledby="ar-cashflow-title">
      <h2 id="ar-cashflow-title" style={sectionTitle}>Average Return Based on Cash Flow</h2>
      <p style={sectionText}>
        This calculator estimates the average annual return of an entire account based on the starting and ending
        balances as well as the dates and amounts of deposits or withdrawals.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 380px", minWidth: 290, maxWidth: 520, padding: 16 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th aria-hidden="true" />
                  <th scope="col" style={headCell}>Activity</th>
                  <th scope="col" style={headCell}>Amount</th>
                  <th scope="col" style={headCell}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td />
                  <td style={{ ...inputCell, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" }}>Starting Balance</td>
                  <td style={inputCell}><DollarField value={startBalance} onChange={setStartBalance} placeholder={START_BALANCE_HINT} /></td>
                  <td style={inputCell}><input type="date" aria-label="Starting balance date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateInputStyle} /></td>
                </tr>
                <tr>
                  <td />
                  <td style={{ ...inputCell, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" }}>Ending Balance</td>
                  <td style={inputCell}><DollarField value={endBalance} onChange={setEndBalance} placeholder={END_BALANCE_HINT} /></td>
                  <td style={inputCell}><input type="date" aria-label="Ending balance date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateInputStyle} /></td>
                </tr>
                {flows.slice(0, rowCount).map((flow, i) => (
                  <tr key={i}>
                    <td style={indexCell}>{i + 1}.</td>
                    <td style={inputCell}>
                      <SelectField value={flow.type} onChange={setFlow(i, "type")} options={ACTIVITY_OPTIONS} style={{ width: "100%", minWidth: 96 }} />
                    </td>
                    <td style={inputCell}><DollarField value={flow.amount} onChange={setFlow(i, "amount")} placeholder={FLOW_HINTS[i]} /></td>
                    <td style={inputCell}><input type="date" aria-label={`Date of item ${i + 1}`} value={flow.date} onChange={(e) => setFlow(i, "date")(e.target.value)} style={dateInputStyle} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MoreToggle open={showMore} onToggle={() => setShowMore((v) => !v)} />
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 360px", minWidth: 290, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter the balances and any deposits or withdrawals with their dates, then click <strong>Calculate</strong>.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : result.outOfScope ? (
              <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>Sorry! Your data is out of the scope we can calculate!</p>
            ) : (
              <>
                <p style={{ fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" }}>
                  The average return for the investment is{" "}
                  <strong style={{ color: "var(--success)" }}>{format2(result.annualReturn)}% per year</strong>.
                </p>
                {result.chart && <CashFlowColumnChart points={result.chart} />}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. Average and Cumulative Return ───────────────────────────── */

function CumulativeReturnCalculator() {
  const [rows, setRows] = useState(blankReturns);
  const [showMore, setShowMore] = useState(false);
  const [result, setResult] = useState(null);

  const setRow = (i, key) => (value) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const calculate = () => {
    const untouched = rows.every((r) => r.ret === "" && r.years === "" && r.months === "");
    setResult(calculateCumulativeReturn({ rows: untouched ? RETURN_HINTS : rows }));
  };
  const clear = () => { setRows(blankReturns()); setResult(null); };
  const rowCount = showMore ? RETURN_ROWS : VISIBLE_ROWS;
  const summaryCell = { fontSize: 13.5, color: "var(--text-primary)" };

  return (
    <section aria-labelledby="ar-cumulative-title">
      <h2 id="ar-cumulative-title" style={sectionTitle}>Average and Cumulative Return</h2>
      <p style={sectionText}>
        This calculator estimates the average annual return as well as the cumulative return for different investment
        returns with different holding periods.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 270, maxWidth: 400, padding: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th aria-hidden="true" />
                <th aria-hidden="true" />
                <th colSpan={2} scope="colgroup" style={{ ...headCell, textAlign: "center" }}>Holding Length</th>
              </tr>
              <tr>
                <th aria-hidden="true" />
                <th scope="col" style={headCell}>Return</th>
                <th scope="col" style={headCell}>Years</th>
                <th scope="col" style={headCell}>Months</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, rowCount).map((row, i) => (
                <tr key={i}>
                  <td style={indexCell}>{i + 1}.</td>
                  <td style={inputCell}><PercentField value={row.ret} onChange={setRow(i, "ret")} placeholder={RETURN_HINTS[i]?.ret} /></td>
                  <td style={inputCell}><TextField value={row.years} onChange={setRow(i, "years")} placeholder={RETURN_HINTS[i]?.years || undefined} /></td>
                  <td style={inputCell}><TextField value={row.months} onChange={setRow(i, "months")} placeholder={RETURN_HINTS[i]?.months || undefined} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <MoreToggle open={showMore} onToggle={() => setShowMore((v) => !v)} />
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 360px", minWidth: 290, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter at least two returns with their holding lengths, then click <strong>Calculate</strong>.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : result.empty ? null : (
              <>
                <table className="data-table" style={{ width: "100%" }}>
                  <tbody>
                    <tr><td style={summaryCell}>Cumulative Return</td><td style={summaryCell}>{format2(result.cumulative)}%</td></tr>
                    <tr><td style={summaryCell}>Average Return</td><td style={summaryCell}><strong style={{ color: "var(--success)" }}>{format2(result.average)}%</strong> Per Year</td></tr>
                    <tr><td style={summaryCell}>Total Holding Period</td><td style={summaryCell}>{result.totalPeriod}</td></tr>
                  </tbody>
                </table>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: "18px 0 8px" }}>
                  Schedule if beginning with $100
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        {["Holding Period", "Return", "Ending Balance"].map((h) => (
                          <th key={h} scope="col" style={{ background: "#336699", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((s, i) => (
                        <tr key={i}>
                          <td style={summaryCell}>{s.label}</td>
                          <td style={summaryCell}>{s.returnText}</td>
                          <td style={summaryCell}>${format2(s.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AverageReturnCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <CashFlowCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <CumulativeReturnCalculator />
    </div>
  );
}
