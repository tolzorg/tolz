import { useState } from "react";
import { FieldRow, TextField, TermYearsMonthsField } from "../loan-calculator/LoanFormControls";
import InterestRateLineChart from "./InterestRateLineChart";
import InterestRatePieChart from "./InterestRatePieChart";
import {
  calculateInterestRate, validateInterestRateInputs, formatCurrency, formatPercent, DEFAULTS,
} from "../../../utils/interestRateCalculatorEngine";

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

// Live thousands-separator formatting on the DISPLAYED value only — state
// stays a plain numeric string — matching the established DollarField
// convention used throughout this app's loan-family calculators (added
// after a recurring real-world mistake where bare, unformatted digit
// fields were easy to mistype or miscount against the reference's own
// comma-formatted screenshots).
function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function DollarField({ value, onChange, placeholder, style }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 22, ...style }}
      />
    </div>
  );
}

/** A plain red error line with a small warning icon — matches the
 * reference's own validation styling exactly (a `<font color="red">`
 * message replacing the entire Result panel), confirmed live for all 3
 * of this calculator's validation messages: distinct from the yellow
 * "⚠" banner style used elsewhere in this app (e.g. the Retirement/401K
 * calculators), which is that reference site's OWN different convention
 * for THOSE calculators specifically. */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

export default function InterestRateCalculatorTool() {
  const [loanAmount, setLoanAmount] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = {
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      monthlyPayment: monthlyPayment || DEFAULTS.monthlyPayment,
    };
    const validationError = validateInterestRateInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateInterestRate(inputs));
  }

  function clear() {
    setLoanAmount(""); setYears(""); setMonths(""); setMonthlyPayment("");
    setResult(null); setError(null);
  }

  const loanAmountNum = Number(loanAmount || DEFAULTS.loanAmount) || 0;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 16, flex: "1 1 320px", minWidth: 300 }}>
          <FieldRow label="Loan amount">
            <DollarField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} />
          </FieldRow>

          <FieldRow label="Loan term" fieldWidth={200}>
            <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
          </FieldRow>

          <FieldRow label="Monthly payment">
            <DollarField value={monthlyPayment} onChange={setMonthlyPayment} placeholder={DEFAULTS.monthlyPayment} />
          </FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result && !error ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see the implied interest rate.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : result.noSolution ? (
                <ErrorPanel message="Sorry, this calculator can not find the interest rate based on the inputs." />
              ) : (
                <>
                  <div style={{ ...rowStyle, background: "var(--bg-muted)", margin: "-18px -20px 0", padding: "10px 20px" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Interest rate</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{formatPercent(result.iy)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total of {result.n} monthly payments</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalPayments)}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total interest paid</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && !error && !result.noSolution && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="card" style={{ padding: 16, flex: "1 1 340px", minWidth: 300 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", textAlign: "center", marginBottom: 14 }}>
              Loan Amortization Graph
            </p>
            <InterestRateLineChart series={result.annualSeries} loanAmount={loanAmountNum} />
          </div>

          <div className="card" style={{ padding: 16, flex: "1 1 300px", minWidth: 280 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", textAlign: "center", marginBottom: 14 }}>
              Payment Breakdown
            </p>
            <InterestRatePieChart segments={result.pieSegments} />
          </div>
        </div>
      )}
    </div>
  );
}
