import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import {
  calculatePresentValueOfFutureMoney, calculatePresentValueOfDeposits, FUTURE_DEFAULTS, DEPOSIT_DEFAULTS,
} from "../../../utils/presentValueCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 10px" };
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
// Compact cells so the schedule fits a phone screen.
const cell = { padding: "4px 6px", fontSize: 11.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };
const head = { ...cell, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center" };
const big = { fontSize: 18, color: "var(--text-primary)", margin: 0 };
const BAR_LABELS = { starting: "Accumulated deposits", contributions: null, interest: "Accumulated interest" };

function FutureMoney() {
  const D = FUTURE_DEFAULTS;
  const keys = Object.keys(D);
  const blank = () => Object.fromEntries(keys.map((k) => [k, ""]));
  const [v, setV] = useState(blank);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(pickFields(v, keys), (fill) => calculatePresentValueOfFutureMoney(withFill(v, D, fill))));
  const clear = () => { req.clear(); setV(blank()); setResult(null); };
  const ok = result && !result.errors;

  return (
    <section aria-labelledby="pv-future-title">
      <h2 id="pv-future-title" style={sectionTitle}>Present Value of Future Money</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Future Value (FV)"><Req name="futureValue" flagged={req.flagged}><DollarField value={v.futureValue} onChange={set("futureValue")} placeholder={D.futureValue} /></Req></Row>
          <Row label="Number of Periods (N)"><Req name="periods" flagged={req.flagged}><TextField value={v.periods} onChange={set("periods")} placeholder={D.periods} /></Req></Row>
          <Row label="Interest Rate (I/Y)"><Req name="rate" flagged={req.flagged}><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Req></Row>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>Results</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the future value, periods and rate, then click Calculate.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                <p style={big}>Present Value: <strong style={{ color: "var(--success)" }}>{result.presentValue}</strong></p>
                <p style={big}>Total Interest: {result.totalInterest}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PeriodicalDeposits() {
  const D = DEPOSIT_DEFAULTS;
  const keys = Object.keys(D);
  const blank = () => Object.fromEntries(keys.map((k) => [k, ""]));
  const [v, setV] = useState(blank);
  const [timing, setTiming] = useState("end");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(pickFields(v, keys), (fill) => calculatePresentValueOfDeposits({ ...withFill(v, D, fill), timing })));
  const clear = () => { req.clear(); setV(blank()); setTiming("end"); setResult(null); };
  const ok = result && !result.errors;
  const pieTotal = ok && result.pie ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <section aria-labelledby="pv-deposits-title">
      <h2 id="pv-deposits-title" style={sectionTitle}>Present Value of Periodical Deposits</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Number of Periods (N)"><Req name="periods" flagged={req.flagged}><TextField value={v.periods} onChange={set("periods")} placeholder={D.periods} /></Req></Row>
          <Row label="Interest Rate (I/Y)"><Req name="rate" flagged={req.flagged}><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Req></Row>
          <Row label="Periodic Deposit (PMT)" suffix="/period"><Req name="deposit" flagged={req.flagged}><DollarField value={v.deposit} onChange={set("deposit")} placeholder={D.deposit} /></Req></Row>
          <fieldset style={{ border: "none", padding: 0, margin: "4px 0 10px", minWidth: 0 }}>
            <legend style={{ fontSize: 13, color: "var(--text-secondary)", padding: 0, marginBottom: 4 }}>PMT made at the</legend>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 18px" }}>
              {[["beginning", "beginning"], ["end", "end"]].map(([value, label]) => (
                <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                  <input type="radio" name="pv-timing" value={value} checked={timing === value} onChange={() => setTiming(value)} />
                  {label}
                </label>
              ))}
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>of each compound period</span>
            </div>
          </fieldset>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>Results</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the periods, rate and deposit, then click Calculate.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                <p style={big}>Present Value: <strong style={{ color: "var(--success)" }}>{result.presentValue}</strong></p>
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
        <div style={{ marginTop: 18 }}>
          <h3 style={{ ...sectionTitle, fontSize: 15.5 }}>Schedule</h3>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", minWidth: 0, overflowX: "auto" }}>
              <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={head}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Period</span></th>
                    <th style={head}>Deposits</th><th style={head}>Interest</th><th style={head}>End balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((r) => (
                    <tr key={r.period}>
                      <th scope="row" style={{ ...cell, fontWeight: 400 }}>{r.period}</th>
                      <td style={cell}>{r.deposits}</td><td style={cell}>{r.interest}</td><td style={cell}>{r.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ flex: "1 1 320px", minWidth: 0, padding: 16 }}>
              <InvestmentBarChart
                xAxisLabel="Period"
                labels={BAR_LABELS}
                barData={result.schedule.map((r) => ({
                  year: r.period, startingAmount: r.rawDeposits, contributions: 0,
                  interest: r.rawBalance - r.rawDeposits, total: r.rawBalance,
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function PresentValueCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        This present value calculator can be used to calculate the present value of a certain amount of money in the future or periodical annuity payments.
      </p>
      <FutureMoney />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <PeriodicalDeposits />
    </div>
  );
}
