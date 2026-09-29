import { useState } from "react";
import { FieldRow, TextField, SelectField, TermYearsMonthsField } from "../loan-calculator/LoanFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateFixedTime, calculateFixedInstallment,
  validateFixedTimeInputs, validateFixedInstallmentInputs,
  formatFixedInstallmentDuration, paybackPhrase,
  COMPOUND_OPTIONS, PAYBACK_OPTIONS, DEFAULT_COMPOUND, DEFAULT_PAYBACK,
  DEFAULTS, formatCurrency,
} from "../../../utils/repaymentCalculatorEngine";

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

const SCHEDULE_COLUMNS = [
  { key: "payment", label: "Payment" },
  { key: "interest", label: "Interest" },
  { key: "principal", label: "Principal" },
  { key: "balance", label: "Balance" },
];

function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

export default function RepaymentCalculatorTool() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [compound, setCompound] = useState(DEFAULT_COMPOUND);
  const [payback, setPayback] = useState(DEFAULT_PAYBACK);
  const [payoffMode, setPayoffMode] = useState("fixedtime");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);

  function calculate() {
    const shared = {
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      interestRate: interestRate || DEFAULTS.interestRate,
      compound, payback,
    };
    if (payoffMode === "fixedtime") {
      const inputs = { ...shared, years: years || DEFAULTS.years, months: months || DEFAULTS.months };
      const validationError = validateFixedTimeInputs(inputs);
      if (validationError) { setError(validationError); setResult(null); return; }
      setError(null);
      setResult(calculateFixedTime(inputs));
    } else {
      const inputs = { ...shared, installmentAmount: installmentAmount || DEFAULTS.installmentAmount };
      const validationError = validateFixedInstallmentInputs(inputs);
      if (validationError) { setError(validationError); setResult(null); return; }
      setError(null);
      const calcResult = calculateFixedInstallment(inputs);
      if (calcResult.isImpossible) {
        setError(`You need to pay at least ${formatCurrency(calcResult.minPayment)} ${paybackPhrase(calcResult.payback)}.`);
        setResult(null);
        return;
      }
      setResult(calcResult);
    }
    setShowTable(false);
  }

  function clear() {
    setLoanAmount(""); setInterestRate(""); setCompound(DEFAULT_COMPOUND); setPayback(DEFAULT_PAYBACK);
    setPayoffMode("fixedtime"); setYears(""); setMonths(""); setInstallmentAmount("");
    setResult(null); setError(null); setShowTable(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18, flex: "1 1 360px", minWidth: 320 }}>
          <FieldRow label="Loan balance">
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
              <TextField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} style={{ paddingLeft: 19 }} />
            </div>
          </FieldRow>

          <FieldRow label="Interest rate" suffix="%">
            <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} />
          </FieldRow>

          <FieldRow label="Compound">
            <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
          </FieldRow>

          <FieldRow label="Pay back">
            <SelectField value={payback} onChange={setPayback} options={PAYBACK_OPTIONS} />
          </FieldRow>

          <div style={{ margin: "12px 0 6px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
              <input type="radio" name="payoffMode" checked={payoffMode === "fixedtime"} onChange={() => setPayoffMode("fixedtime")} />
              Repay within a fixed time
            </label>
            {payoffMode === "fixedtime" && (
              <div style={{ paddingLeft: 26, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>of</span>
                <div style={{ width: 180 }}>
                  <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
                </div>
              </div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
              <input type="radio" name="payoffMode" checked={payoffMode === "fixedinstallment"} onChange={() => setPayoffMode("fixedinstallment")} />
              Repay with a fixed installment
            </label>
            {payoffMode === "fixedinstallment" && (
              <div style={{ paddingLeft: 26, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>of</span>
                <div style={{ position: "relative", width: 130 }}>
                  <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
                  <TextField value={installmentAmount} onChange={setInstallmentAmount} placeholder={DEFAULTS.installmentAmount} style={{ paddingLeft: 19 }} />
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{paybackPhrase(payback)}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Result ───────────────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result && !error ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the loan details and click <strong>Calculate</strong> to see your payment breakdown.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : (
                <>
                  {result.mode === "fixedinstallment" && (
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      By paying <strong style={{ color: "var(--success)" }}>{formatCurrency(result.payment)}</strong> {paybackPhrase(result.payback)}, the loan will be paid off in <strong style={{ color: "var(--success)" }}>{formatFixedInstallmentDuration(result.totalMonthsExact)}</strong>.
                    </p>
                  )}

                  {result.mode === "fixedtime" && (
                    <div style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>Pay back {paybackPhrase(result.payback)}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.payment)}</span>
                    </div>
                  )}
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total of {result.paymentCount} loan payments</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalOfPayments)}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Interest</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <InvestmentPieChart segments={[
                      { label: "Principal", value: result.loanAmount, color: "#2b7ddb" },
                      { label: "Interest", value: result.totalInterest, color: "#8bbc21" },
                    ]} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "16px 0 0", textDecoration: "underline" }}
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
          periodLabel={result.periodLabel}
          schedule={result.schedule}
          columns={SCHEDULE_COLUMNS}
        />
      )}
    </div>
  );
}
