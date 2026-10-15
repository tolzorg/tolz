import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { ErrorPanel, Row, Checkbox, ButtonRow, ScheduleSection } from "../fha-loan-calculator/MortgageResultParts";
import BorrowLimitCalculator from "./BorrowLimitCalculator";
import {
  calculateHomeEquityLoan, calculateBorrowLimit, scheduleMoney, LOAN_DEFAULTS, BORROW_DEFAULTS, LTV_CHOICES,
} from "../../../utils/homeEquityLoanCalculatorEngine";

const L = LOAN_DEFAULTS;
const HELP = {
  closing: "They are the fees and expenses incurred during the loan process. They can include appraisal fee, origination fee, title search fee, document fees, notary fees, among others. Many lenders offer no-closing-cost home equity loan.",
  "Cost of loan": "The total amount of interest and closing costs.",
  APR: "The Annual Percentage Rate (APR) is the annualized cost of borrowing money, including both the interest and the closing costs. It provides a more accurate indication of the true cost of a home equity loan.",
};
// Closing-cost example per unit — placeholders only.
const CLOSING_EXAMPLE = { amount: L.closingCosts, percentage: "5" };

const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };

/** Converts the closing-cost box the way the reference does when its unit changes. */
function convertClosing(value, loan, toUnit) {
  const c = Number(String(value).replace(/,/g, ""));
  const l = Number(String(loan).replace(/,/g, ""));
  if (value === "" || !Number.isFinite(c) || !Number.isFinite(l) || l <= 0) return value;
  return toUnit === "percentage" ? String(Math.round((100000 * c) / l) / 1000) : String(Math.round((l * c) / 100));
}

function PaymentCalculator() {
  const [v, setV] = useState({ amount: "", rate: "", years: "", closingCosts: "" });
  const [includeClosing, setIncludeClosing] = useState(false);
  const [closingUnit, setClosingUnit] = useState("amount");
  const [closingPaid, setClosingPaid] = useState("deduct");
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const changeUnit = (unit) => {
    setV((p) => ({ ...p, closingCosts: convertClosing(p.closingCosts, p.amount || L.amount, unit) }));
    setClosingUnit(unit);
  };
  const calculate = () => {
    const keys = ["amount", "rate", "years", ...(includeClosing ? ["closingCosts"] : [])];
    const values = keys.every((k) => v[k] === "") ? { ...L, closingCosts: CLOSING_EXAMPLE[closingUnit] } : v;
    setResult(calculateHomeEquityLoan({ ...values, includeClosing, closingUnit, closingPaid }));
    setView("annual");
  };
  const clear = () => {
    setV({ amount: "", rate: "", years: "", closingCosts: "" });
    setIncludeClosing(false); setClosingUnit("amount"); setClosingPaid("deduct"); setResult(null);
  };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Loan amount"><DollarField value={v.amount} onChange={set("amount")} placeholder={L.amount} /></Row>
          <Row label="Interest rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={L.rate} /></Row>
          <Row label="Loan term" suffix="years"><TextField value={v.years} onChange={set("years")} placeholder={L.years} /></Row>
          <Checkbox checked={includeClosing} onChange={setIncludeClosing}>{includeClosing ? "Include closing costs below" : "Include closing costs"}</Checkbox>
          {includeClosing && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ marginBottom: 6 }}><FieldLabel hint={HELP.closing}>Closing costs</FieldLabel></div>
              <Row label="Amount">
                <ValueUnitField
                  value={v.closingCosts} unit={closingUnit === "percentage" ? "percent" : "dollar"} placeholder={CLOSING_EXAMPLE[closingUnit]}
                  onValueChange={set("closingCosts")} onUnitChange={(u) => changeUnit(u === "percent" ? "percentage" : "amount")}
                />
              </Row>
              <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "center" }}>
                <legend style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", float: "left", marginRight: 8 }}>to be</legend>
                {[["deduct", "deducted from loan"], ["upfront", "paid upfront"]].map(([value, label]) => (
                  <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                    <input type="radio" name="he-closing-paid" value={value} checked={closingPaid === value} onChange={() => setClosingPaid(value)} />
                    {label}
                  </label>
                ))}
              </fieldset>
            </div>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 380px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>{ok ? `Monthly pay: ${result.monthlyPay}` : "Result"}</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the loan details, then click Calculate to see your monthly payment.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
                    <tbody>
                      {result.rows.map(([label, value]) => (
                        <tr key={label}>
                          <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 400, whiteSpace: "normal" }}>
                            {HELP[label] ? <FieldLabel hint={HELP[label]}>{label}</FieldLabel> : label}
                          </th>
                          <td style={{ ...td, textAlign: "right" }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <InvestmentPieChart
                  segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${Math.round((p.value / pieTotal) * 100)}%)` }))}
                  labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {ok && result.schedule && <ScheduleSection schedule={result.schedule} view={view} setView={setView} idPrefix="home-equity" cell={scheduleMoney} />}
    </div>
  );
}

export default function HomeEquityLoanCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <PaymentCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <BorrowLimitCalculator
        idPrefix="he" title="The loan amount you can borrow" calculate={calculateBorrowLimit}
        intro="Use the calculator below to estimate the maximum home equity loan amount you may be able to borrow, based on the value of your home, your remaining mortgage balance, and the loan-to-value (LTV) ratio acceptable by the lender."
      />
    </div>
  );
}
