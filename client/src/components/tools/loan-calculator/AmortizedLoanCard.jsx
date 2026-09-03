import { useState } from "react";
import { FieldLabel, TextField, SelectField, TermYearsMonthsField } from "./LoanFormControls";
import MortgagePieChart from "../mortgage-calculator/MortgagePieChart";
import LoanScheduleTable from "./LoanScheduleTable";
import {
  calculateAmortizedLoan, formatCurrency, COMPOUND_OPTIONS, PAYBACK_OPTIONS, DEFAULT_COMPOUND, DEFAULT_PAYBACK,
} from "../../../utils/loanCalculatorEngine";

// Demo numbers shown only as placeholder hint text (see the Mortgage
// Calculator's own MORTGAGE_PLACEHOLDERS for the established convention
// this follows) — fields start blank, and Calculate falls back to these
// only when a field is left empty.
const DEFAULTS = { loanAmount: "100000", years: "10", months: "0", interestRate: "6" };
const cardStyle = { padding: 24 };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

export default function AmortizedLoanCard() {
  const [loanAmount, setLoanAmount] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [compound, setCompound] = useState(DEFAULT_COMPOUND);
  const [payback, setPayback] = useState(DEFAULT_PAYBACK);
  const [result, setResult] = useState(null);
  const [showTable, setShowTable] = useState(false);

  function calculate() {
    setResult(calculateAmortizedLoan({
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      annualRatePercent: interestRate || DEFAULTS.interestRate,
      compound, payback,
    }));
    setShowTable(false);
  }

  function clear() {
    setLoanAmount(""); setYears(""); setMonths(""); setInterestRate("");
    setCompound(DEFAULT_COMPOUND); setPayback(DEFAULT_PAYBACK);
    setResult(null); setShowTable(false);
  }

  return (
    <section aria-label="Amortized Loan calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
          Amortized Loan: Paying Back a Fixed Amount Periodically
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Use this calculator for basic calculations of common loan types such as mortgages, auto loans, student
          loans, or personal loans — routine payments are made on principal and interest until the loan is fully
          paid off.
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ ...cardStyle, flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <FieldLabel>Loan Amount</FieldLabel>
              <div style={{ position: "relative", marginTop: 6 }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
                <TextField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} style={{ paddingLeft: 22 }} />
              </div>
            </div>

            <div>
              <FieldLabel>Loan Term</FieldLabel>
              <div style={{ marginTop: 6 }}>
                <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
              </div>
            </div>

            <div>
              <FieldLabel>Interest Rate</FieldLabel>
              <div style={{ position: "relative", marginTop: 6 }}>
                <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} style={{ paddingRight: 26 }} />
                <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
              </div>
            </div>

            <div>
              <FieldLabel>Compound</FieldLabel>
              <div style={{ marginTop: 6 }}>
                <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
              </div>
            </div>

            <div>
              <FieldLabel>Pay Back</FieldLabel>
              <div style={{ marginTop: 6 }}>
                <SelectField value={payback} onChange={setPayback} options={PAYBACK_OPTIONS} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={calculate} className="btn-primary" style={{ flex: 1, padding: "12px 0", fontSize: 14.5 }}>Calculate</button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results:
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Fill in the loan details and click <strong>Calculate</strong> to see your payment breakdown.</p>
              ) : (
                <>
                  {[
                    [`Payment Every ${result.periodLabel}`, formatCurrency(result.payment)],
                    [`Total of ${result.totalPayments} Payments`, formatCurrency(result.totalOfPayments)],
                    ["Total Interest", formatCurrency(result.totalInterest)],
                  ].map(([label, value]) => (
                    <div key={label} style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 18 }}>
                    <MortgagePieChart segments={[
                      { label: "Principal", value: result.totalOfPayments - result.totalInterest, color: "#3b7bfc" },
                      { label: "Interest", value: result.totalInterest, color: "#16a34a" },
                    ]} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "14px 0 0", textDecoration: "underline" }}
                  >
                    {showTable ? "Hide Amortization Table" : "View Amortization Table"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && showTable && (
        <LoanScheduleTable
          title="Amortization Table"
          schedule={result.schedule}
          columns={[{ key: "payment", label: "Payment" }, { key: "interest", label: "Interest" }, { key: "principal", label: "Principal" }, { key: "balance", label: "Balance" }]}
        />
      )}
    </section>
  );
}
