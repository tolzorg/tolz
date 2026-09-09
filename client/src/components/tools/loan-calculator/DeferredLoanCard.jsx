import { useState } from "react";
import { FieldRow, TextField, SelectField, TermYearsMonthsField } from "./LoanFormControls";
import MortgagePieChart from "../mortgage-calculator/MortgagePieChart";
import LoanScheduleTable from "./LoanScheduleTable";
import { calculateDeferredLoan, formatCurrency, COMPOUND_OPTIONS, DEFAULT_COMPOUND } from "../../../utils/loanCalculatorEngine";

const DEFAULTS = { loanAmount: "100000", years: "10", months: "0", interestRate: "6" };
const cardStyle = { padding: 18 };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 };

export default function DeferredLoanCard() {
  const [loanAmount, setLoanAmount] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [compound, setCompound] = useState("annually");
  const [result, setResult] = useState(null);
  const [showTable, setShowTable] = useState(false);

  function calculate() {
    setResult(calculateDeferredLoan({
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      annualRatePercent: interestRate || DEFAULTS.interestRate,
      compound,
    }));
    setShowTable(false);
  }

  function clear() {
    setLoanAmount(""); setYears(""); setMonths(""); setInterestRate("");
    setCompound("annually");
    setResult(null); setShowTable(false);
  }

  return (
    <section aria-label="Deferred Payment Loan calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
          Deferred Payment Loan: Paying Back a Lump Sum Due at Maturity
        </h2>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Many commercial or short-term loans work this way — instead of payments spread uniformly over the loan's
          lifetime, there's a single, large lump sum due once the loan reaches maturity.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ ...cardStyle, flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FieldRow label="Loan Amount">
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
                <TextField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} style={{ paddingLeft: 19 }} />
              </div>
            </FieldRow>

            <FieldRow label="Loan Term" fieldWidth={200}>
              <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
            </FieldRow>

            <FieldRow label="Interest Rate" suffix="%">
              <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} />
            </FieldRow>

            <FieldRow label="Compound">
              <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
            </FieldRow>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={calculate} className="btn-primary" style={{ flex: 1, padding: "9px 0", fontSize: 12.5 }}>Calculate</button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results:
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Fill in the loan details and click <strong>Calculate</strong> to see the amount due at maturity.</p>
              ) : (
                <>
                  {[
                    ["Amount Due at Loan Maturity", formatCurrency(result.amountDue)],
                    ["Total Interest", formatCurrency(result.totalInterest)],
                  ].map(([label, value]) => (
                    <div key={label} style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 18 }}>
                    <MortgagePieChart segments={[
                      { label: "Principal", value: result.amountDue - result.totalInterest, color: "#3b7bfc" },
                      { label: "Interest", value: result.totalInterest, color: "#16a34a" },
                    ]} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "14px 0 0", textDecoration: "underline" }}
                  >
                    {showTable ? "Hide Schedule Table" : "View Schedule Table"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && showTable && (
        <LoanScheduleTable
          title="Schedule Table"
          schedule={result.schedule}
          columns={[{ key: "interest", label: "Interest" }, { key: "balance", label: "Balance" }]}
        />
      )}
    </section>
  );
}
