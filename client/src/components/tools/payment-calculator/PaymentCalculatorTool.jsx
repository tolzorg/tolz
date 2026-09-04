import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";
import MortgagePieChart from "../mortgage-calculator/MortgagePieChart";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import { calculateFixedTerm, calculateFixedPayments, formatCurrency, formatYearsAndDecimalMonths } from "../../../utils/paymentCalculatorEngine";

// Demo numbers shown only as placeholder hint text, not pre-filled values
// — the established convention from the Mortgage/Loan/Auto Loan/Interest
// calculators.
const DEFAULTS = { loanAmount: "200000", loanTerm: "15", monthlyPay: "2000", interestRate: "6" };

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingLeft: 22 }} />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
    </div>
  );
}

export default function PaymentCalculatorTool() {
  const [tab, setTab] = useState("fixedTerm"); // fixedTerm | fixedPayments
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [monthlyPay, setMonthlyPay] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [result, setResult] = useState(null);
  const [scheduleView, setScheduleView] = useState("annual"); // annual | monthly

  function calculate() {
    const shared = { loanAmount: loanAmount || DEFAULTS.loanAmount, annualRatePercent: interestRate || DEFAULTS.interestRate };
    setResult(
      tab === "fixedTerm"
        ? { mode: "fixedTerm", years: Number(loanTerm || DEFAULTS.loanTerm), ...calculateFixedTerm({ ...shared, years: loanTerm || DEFAULTS.loanTerm }) }
        : { mode: "fixedPayments", ...calculateFixedPayments({ ...shared, monthlyPay: monthlyPay || DEFAULTS.monthlyPay }) }
    );
  }

  function clear() {
    setLoanAmount(""); setLoanTerm(""); setMonthlyPay(""); setInterestRate("");
    setResult(null);
  }

  function switchTab(next) {
    setTab(next);
    setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Print
            </button>
          </div>

          <div style={{ display: "flex", marginBottom: -1 }}>
            {[["fixedTerm", "Fixed Term"], ["fixedPayments", "Fixed Payments"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                style={{
                  flex: 1, padding: "11px 0", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)",
                  cursor: "pointer", border: "1px solid var(--border)", borderBottom: tab === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderTopLeftRadius: key === "fixedTerm" ? "var(--radius-md)" : 0,
                  borderTopRightRadius: key === "fixedPayments" ? "var(--radius-md)" : 0,
                  // The clicked/active tab (whose fields are showing below)
                  // is the highlighted blue one — matches the Auto Loan
                  // Calculator's tab convention (fixed there per explicit
                  // feedback that the reference's own inverted-highlight
                  // convention read as confusing/backwards).
                  background: tab === key ? "var(--accent)" : "var(--bg-white)",
                  color: tab === key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: tab === key ? 1 : 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 24, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div style={fieldWrap}>
              <FieldLabel>Loan Amount</FieldLabel>
              <DollarField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} />
            </div>

            {tab === "fixedTerm" ? (
              <div style={fieldWrap}>
                <FieldLabel>Loan Term</FieldLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TextField value={loanTerm} onChange={setLoanTerm} placeholder={DEFAULTS.loanTerm} style={{ flex: 1 }} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>years</span>
                </div>
              </div>
            ) : (
              <div style={fieldWrap}>
                <FieldLabel>Monthly Pay</FieldLabel>
                <DollarField value={monthlyPay} onChange={setMonthlyPay} placeholder={DEFAULTS.monthlyPay} />
              </div>
            )}

            <div style={fieldWrap}>
              <FieldLabel>Interest Rate</FieldLabel>
              <PercentField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "16px 20px" }}>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                {!result
                  ? "Fill in the loan details and click Calculate"
                  : result.mode === "fixedTerm"
                    ? <>Monthly Payment:&nbsp;&nbsp;{formatCurrency(result.payment)}</>
                    : <>Payoff:&nbsp;&nbsp;{formatYearsAndDecimalMonths(result.totalPeriods)}</>}
              </span>
            </div>

            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the loan details and click <strong>Calculate</strong> to see your monthly payment or payoff time.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                    You will need to pay {formatCurrency(result.payment)} every month for{" "}
                    {result.mode === "fixedTerm" ? `${result.years} years` : formatYearsAndDecimalMonths(result.totalPeriods)} to payoff the debt.
                  </p>

                  {result.mode === "fixedPayments" && (
                    <div style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)" }}>Time Required to Clear Debt</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{result.payoffYears.toFixed(2)} years</span>
                    </div>
                  )}
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>
                      Total of {result.mode === "fixedTerm" ? result.totalPayments : result.totalPeriods.toFixed(2)} Payments
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.totalOfPayments)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total Interest</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <MortgagePieChart segments={[
                      { label: "Principal", value: result.totalOfPayments - result.totalInterest, color: "#3b7bfc" },
                      { label: "Interest", value: result.totalInterest, color: "#16a34a" },
                    ]} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>
            Amortization schedule
          </p>
          <div style={{ display: "flex", gap: 18, fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {[["annual", "Annual Schedule"], ["monthly", "Monthly Schedule"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScheduleView(key)}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  color: scheduleView === key ? "var(--text-primary)" : "var(--accent)",
                  textDecoration: scheduleView === key ? "none" : "underline",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <LoanScheduleTable
            title={scheduleView === "annual" ? "Annual Schedule" : "Monthly Schedule"}
            periodLabel={scheduleView === "annual" ? "Year" : "Month"}
            schedule={scheduleView === "annual" ? result.annualSchedule : result.monthlySchedule}
            columns={[{ key: "interest", label: "Interest" }, { key: "principal", label: "Principal" }, { key: "balance", label: "Ending Balance" }]}
          />
        </div>
      )}
    </div>
  );
}
