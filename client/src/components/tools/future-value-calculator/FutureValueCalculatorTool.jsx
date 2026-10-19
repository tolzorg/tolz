import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { calculateFutureValue, FV_DEFAULTS } from "../../../utils/futureValueCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = FV_DEFAULTS;
const KEYS = Object.keys(D);
const blank = () => Object.fromEntries(KEYS.map((k) => [k, ""]));
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15.5, color: "var(--text-primary)", margin: "0 0 10px" };
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
// Compact cells so all five schedule columns fit a phone screen.
const cell = { padding: "4px 4px", fontSize: 11, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };
const head = { ...cell, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" };

export default function FutureValueCalculatorTool() {
  const [v, setV] = useState(blank);
  const [timing, setTiming] = useState("end");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(pickFields(v, KEYS), (fill) => calculateFutureValue({ ...withFill(v, D, fill), timing })));
  const clear = () => { req.clear(); setV(blank()); setTiming("end"); setResult(null); };
  const ok = result && !result.errors;
  const pieTotal = ok && result.pie ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The future value calculator can be used to calculate the future value (FV) of an investment with given inputs of compounding periods (N),
        interest/yield rate (I/Y), starting amount, and periodic deposit/annuity payment per period (PMT).
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Number of Periods (N)"><Req name="periods" flagged={req.flagged}><TextField value={v.periods} onChange={set("periods")} placeholder={D.periods} /></Req></Row>
          <Row label="Starting Amount (PV)"><Req name="start" flagged={req.flagged}><DollarField value={v.start} onChange={set("start")} placeholder={D.start} /></Req></Row>
          <Row label="Interest Rate (I/Y)"><Req name="rate" flagged={req.flagged}><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Req></Row>
          <Row label="Periodic Deposit (PMT)" suffix="/period"><Req name="deposit" flagged={req.flagged}><DollarField value={v.deposit} onChange={set("deposit")} placeholder={D.deposit} /></Req></Row>
          <fieldset style={{ border: "none", padding: 0, margin: "4px 0 10px", minWidth: 0 }}>
            <legend style={{ fontSize: 13, color: "var(--text-secondary)", padding: 0, marginBottom: 4 }}>PMT made at the</legend>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 18px" }}>
              {["beginning", "end"].map((value) => (
                <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                  <input type="radio" name="fv-timing" value={value} checked={timing === value} onChange={() => setTiming(value)} />
                  {value}
                </label>
              ))}
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>of each compound period</span>
            </div>
          </fieldset>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>Results</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the periods, amounts and rate, then click Calculate.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                <p style={{ fontSize: 18, color: "var(--text-primary)", margin: 0 }}>Future Value: <strong style={{ color: "var(--success)" }}>{result.futureValue}</strong></p>
                <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
                  <tbody>
                    {result.rows.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 400, background: "var(--bg-muted)" }}>{label}</th>
                        <td style={{ ...td, textAlign: "right" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.pie && (
                  <InvestmentPieChart
                    segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${pieTotal ? Math.round((p.value / pieTotal) * 100) : 0}%)` }))}
                    labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.schedule.length > 0 && (
        <section aria-labelledby="fv-schedule-title">
          <h2 id="fv-schedule-title" style={sectionTitle}>Schedule</h2>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 340px", minWidth: 0, overflowX: "auto", maxHeight: 560, overflowY: "auto" }}>
              {/* Phones drop Start balance (it is the previous row's End balance) so large values still fit. */}
              {[false, true].map((compact) => (
                <table key={String(compact)} className={`data-table data-table--framed ${compact ? "mobile-only" : "desktop-only"}`} style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={head}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Period</span></th>
                      {!compact && <th style={head}>Start balance</th>}
                      {result.hasDeposits && <th style={head}>Deposit</th>}
                      <th style={head}>Interest</th><th style={head}>End balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((r) => (
                      <tr key={r.period}>
                        <th scope="row" style={{ ...cell, fontWeight: 400 }}>{r.period}</th>
                        {!compact && <td style={cell}>{r.startBalance}</td>}
                        {result.hasDeposits && <td style={cell}>{r.deposit}</td>}
                        <td style={cell}>{r.interest}</td><td style={cell}>{r.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
            <div className="card" style={{ flex: "1 1 320px", minWidth: 0, padding: 16 }}>
              <InvestmentBarChart
                xAxisLabel="Period"
                labels={{ starting: "Starting amount", contributions: result.hasDeposits ? "Accumulated deposits" : null, interest: "Accumulated interest" }}
                barData={result.schedule.map((r) => ({
                  year: r.period, startingAmount: r.rawStart, contributions: r.rawDeposits,
                  interest: r.rawBalance - r.rawStart - r.rawDeposits, total: r.rawBalance,
                }))}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
