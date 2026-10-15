import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { ErrorPanel, Row, Checkbox, ButtonRow, ScheduleSection } from "../fha-loan-calculator/MortgageResultParts";
import { calculateHeloc, calculateHelocBorrowLimit, scheduleMoney, HELOC_DEFAULTS } from "../../../utils/helocCalculatorEngine";
import BorrowLimitCalculator from "../home-equity-loan-calculator/BorrowLimitCalculator";

const H = HELOC_DEFAULTS;
const HELP = {
  draw: "The draw period is the initial phase of a home equity line of credit during which you can withdraw funds up to the approved credit limit. It typically lasts for a set number of years, such as 10 years. Borrowers are normally only required to make interest-only payments during the draw period.",
  repay: "The repayment period begins after the draw period ends. During this phase, the home equity line of credit is closed to new withdrawals, and borrowers must make monthly payments that include both principal and interest. The repayment period typically lasts for a set number of years, often ranging from 10 to 20 years.",
  closing: "They are the fees and expenses incurred during the loan process. They can include application fee, appraisal fee, origination fee, title search fee, document fees, notary fees, among others. Some lenders offer no-closing-cost HELOCs.",
  fee: "An annual fee is a recurring yearly charge for keeping a home equity line of credit account open. The annual fee is typically charged during the draw period, but not during the repayment period. Some lenders offer HELOCs with no annual fee.",
  "Cost of loan": "The total amount of interest, closing costs, and fees.",
  APR: "The Annual Percentage Rate (APR) is the annualized cost of borrowing money, including interest, closing costs, and fees. It provides a more accurate indication of the true cost of a HELOC.",
};
// Closing-cost example per unit — placeholders only.
const CLOSING_EXAMPLE = { amount: H.closingCosts, percentage: "4" };

const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
const thLabel = { ...td, textAlign: "left", fontWeight: 400, whiteSpace: "normal" };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };

/** Converts the closing-cost box the way the reference does when its unit changes. */
function convertClosing(value, loan, toUnit) {
  const c = Number(String(value).replace(/,/g, ""));
  const l = Number(String(loan).replace(/,/g, ""));
  if (value === "" || !Number.isFinite(c) || !Number.isFinite(l) || l <= 0) return value;
  return toUnit === "percentage" ? String(Math.round((100000 * c) / l) / 1000) : String(Math.round((l * c) / 100));
}

function ResultRows({ rows, bold }) {
  return rows.map(([label, value]) => (
    <tr key={label}>
      <th scope="row" style={{ ...thLabel, fontWeight: bold ? 700 : 400, background: bold ? "var(--bg-muted)" : undefined }}>
        {HELP[label] ? <FieldLabel hint={HELP[label]}>{label}</FieldLabel> : label}
      </th>
      <td style={{ ...td, textAlign: "right", fontWeight: bold ? 700 : 400, background: bold ? "var(--bg-muted)" : undefined }}>{value}</td>
    </tr>
  ));
}

function PaymentCalculator() {
  const [v, setV] = useState({ amount: "", rate: "", drawYears: "", repayYears: "", closingCosts: "", annualFee: "" });
  const [includeCosts, setIncludeCosts] = useState(false);
  const [closingUnit, setClosingUnit] = useState("amount");
  const [closingPaid, setClosingPaid] = useState("upfront");
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const changeUnit = (unit) => {
    setV((p) => ({ ...p, closingCosts: convertClosing(p.closingCosts, p.amount || H.amount, unit) }));
    setClosingUnit(unit);
  };
  const calculate = () => {
    const keys = ["amount", "rate", "drawYears", "repayYears", ...(includeCosts ? ["closingCosts", "annualFee"] : [])];
    const values = keys.every((k) => v[k] === "") ? { ...H, closingCosts: CLOSING_EXAMPLE[closingUnit] } : v;
    setResult(calculateHeloc({ ...values, includeCosts, closingUnit, closingPaid }));
    setView("annual");
  };
  const clear = () => {
    setV({ amount: "", rate: "", drawYears: "", repayYears: "", closingCosts: "", annualFee: "" });
    setIncludeCosts(false); setClosingUnit("amount"); setClosingPaid("upfront"); setResult(null);
  };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Loan amount"><DollarField value={v.amount} onChange={set("amount")} placeholder={H.amount} /></Row>
          <Row label="Interest rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={H.rate} /></Row>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
            <div style={{ flex: "1 1 120px", minWidth: 0 }}><FieldLabel hint={HELP.draw}>Draw period</FieldLabel></div>
            <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex" }}><TextField value={v.drawYears} onChange={set("drawYears")} placeholder={H.drawYears} /></div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>years</span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
            <div style={{ flex: "1 1 120px", minWidth: 0 }}><FieldLabel hint={HELP.repay}>Repayment period</FieldLabel></div>
            <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex" }}><TextField value={v.repayYears} onChange={set("repayYears")} placeholder={H.repayYears} /></div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>years</span>
            </div>
          </div>
          <Checkbox checked={includeCosts} onChange={setIncludeCosts}>{includeCosts ? "Include closing costs and fees below" : "Include closing costs and fees"}</Checkbox>
          {includeCosts && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ marginBottom: 6 }}><FieldLabel hint={HELP.closing}>Closing costs</FieldLabel></div>
              <Row label="Amount">
                <ValueUnitField
                  value={v.closingCosts} unit={closingUnit === "percentage" ? "percent" : "dollar"} placeholder={CLOSING_EXAMPLE[closingUnit]}
                  onValueChange={set("closingCosts")} onUnitChange={(u) => changeUnit(u === "percent" ? "percentage" : "amount")}
                />
              </Row>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 10px", display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "center" }}>
                <legend style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", float: "left", marginRight: 8 }}>to be</legend>
                {[["upfront", "paid upfront"], ["deduct", "deducted from loan"]].map(([value, label]) => (
                  <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                    <input type="radio" name="heloc-closing-paid" value={value} checked={closingPaid === value} onChange={() => setClosingPaid(value)} />
                    {label}
                  </label>
                ))}
              </fieldset>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4 }}>
                <div style={{ flex: "1 1 120px", minWidth: 0 }}><FieldLabel hint={HELP.fee}>Annual fee</FieldLabel></div>
                <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <div style={{ flex: 1, minWidth: 0, display: "flex" }}><DollarField value={v.annualFee} onChange={set("annualFee")} placeholder={H.annualFee} /></div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/year</span>
                </div>
              </div>
            </div>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 380px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>Results</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the line of credit details, then click Calculate to see your payments.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
                    <tbody>
                      <ResultRows rows={result.results} bold />
                      <ResultRows rows={result.totals} />
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
      {ok && result.schedule && <ScheduleSection schedule={result.schedule} view={view} setView={setView} idPrefix="heloc" cell={scheduleMoney} />}
    </div>
  );
}

export default function HelocCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <PaymentCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <BorrowLimitCalculator
        idPrefix="heloc" title="The amount of line of credit you can borrow" calculate={calculateHelocBorrowLimit}
        intro="Use the calculator below to estimate the maximum home equity line of credit amount you may be able to borrow, based on the value of your home, your remaining mortgage balance, and the loan-to-value (LTV) ratio acceptable by the lender."
      />
    </div>
  );
}
