import { useState } from "react";
import { FieldLabel, TextField, TermYearsMonthsField } from "../loan-calculator/LoanFormControls";
import { MonthYearField } from "../mortgage-calculator/MortgageFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import AmortizationPieChart from "./AmortizationPieChart";
import AmortizationLineChart from "./AmortizationLineChart";
import {
  calculateAmortization, buildCumulativeSeries, formatCurrency, formatMonthYear, formatYearsAndMonths,
} from "../../../utils/amortizationCalculatorEngine";

// Demo numbers shown only as placeholder hint text — fields start blank,
// Calculate falls back to these only when a field is left empty (the
// established convention across every calculator in this app).
const DEFAULTS = { loanAmount: "200000", years: "15", months: "0", interestRate: "6" };
const ADDITIONAL_PAYMENT_SLOTS = 10;

function todayMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: String(now.getFullYear()) };
}

function emptyAdditionalPayments() {
  const { month, year } = todayMonthYear();
  return Array.from({ length: ADDITIONAL_PAYMENT_SLOTS }, () => ({ amount: "", month, year }));
}

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };
const extraFieldWrap = { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 };

// Live thousands-separator formatting on the DISPLAYED value only — state
// stays a plain numeric string — matching the Retirement Calculator's
// established DollarField convention (added after a recurring real-world
// mistake where bare, unformatted digit fields were easy to mistype or
// miscount against the reference's own comma-formatted screenshots).
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

export default function AmortizationCalculatorTool() {
  const [loanAmount, setLoanAmount] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [extraEnabled, setExtraEnabled] = useState(false);

  const initialDate = todayMonthYear();
  const [startMonth, setStartMonth] = useState(initialDate.month);
  const [startYear, setStartYear] = useState(initialDate.year);

  const [exMonthlyAmount, setExMonthlyAmount] = useState("");
  const [exMonthlyMonth, setExMonthlyMonth] = useState(initialDate.month);
  const [exMonthlyYear, setExMonthlyYear] = useState(initialDate.year);

  const [exYearlyAmount, setExYearlyAmount] = useState("");
  const [exYearlyMonth, setExYearlyMonth] = useState(initialDate.month);
  const [exYearlyYear, setExYearlyYear] = useState(initialDate.year);

  const [exOneTimeAmount, setExOneTimeAmount] = useState("");
  const [exOneTimeMonth, setExOneTimeMonth] = useState(initialDate.month);
  const [exOneTimeYear, setExOneTimeYear] = useState(initialDate.year);

  const [showMore, setShowMore] = useState(false);
  const [additionalPayments, setAdditionalPayments] = useState(emptyAdditionalPayments);

  const [result, setResult] = useState(null);
  const [scheduleView, setScheduleView] = useState("annual"); // annual | monthly

  function updateAdditional(index, field, value) {
    setAdditionalPayments((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function calculate() {
    const startDate = { month: Number(startMonth), year: Number(startYear) || initialDate.year };
    setResult(calculateAmortization({
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      termYears: years || DEFAULTS.years,
      termMonths: months || DEFAULTS.months,
      annualRatePercent: interestRate || DEFAULTS.interestRate,
      extraPaymentsEnabled: extraEnabled,
      startDate,
      extraMonthly: { amount: Number(exMonthlyAmount) || 0, month: Number(exMonthlyMonth), year: Number(exMonthlyYear) },
      extraYearly: { amount: Number(exYearlyAmount) || 0, month: Number(exYearlyMonth), year: Number(exYearlyYear) },
      extraOneTime: { amount: Number(exOneTimeAmount) || 0, month: Number(exOneTimeMonth), year: Number(exOneTimeYear) },
      additionalOneTimePayments: additionalPayments.map((p) => ({ amount: Number(p.amount) || 0, month: Number(p.month), year: Number(p.year) })),
    }));
    setScheduleView("annual");
  }

  function clear() {
    setLoanAmount(""); setYears(""); setMonths(""); setInterestRate(""); setExtraEnabled(false);
    setStartMonth(initialDate.month); setStartYear(initialDate.year);
    setExMonthlyAmount(""); setExMonthlyMonth(initialDate.month); setExMonthlyYear(initialDate.year);
    setExYearlyAmount(""); setExYearlyMonth(initialDate.month); setExYearlyYear(initialDate.year);
    setExOneTimeAmount(""); setExOneTimeMonth(initialDate.month); setExOneTimeYear(initialDate.year);
    setShowMore(false); setAdditionalPayments(emptyAdditionalPayments());
    setResult(null);
  }

  const loanAmountNum = Number(loanAmount || DEFAULTS.loanAmount);

  function toTableRows(rows, isMonthly) {
    return rows.map((row) => ({
      period: isMonthly ? row.monthIndex + 1 : row.year,
      dateLabel: isMonthly ? formatMonthYear(row.date.month, row.date.year) : formatMonthYear(row.startDate.month, row.startDate.year),
      interest: row.interest,
      principal: isMonthly ? row.principal + row.extraPayment : row.principal,
      endingBalance: row.endingBalance,
    }));
  }

  const scheduleColumns = [
    ...(result?.extraPaymentsEnabled ? [{ key: "dateLabel", label: "Date", text: true }] : []),
    { key: "interest", label: "Interest" },
    { key: "principal", label: "Principal" },
    { key: "endingBalance", label: "Ending Balance" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div className="card" style={{ padding: 24, flex: "1 1 340px", minWidth: 300 }}>
          <div style={fieldWrap}>
            <FieldLabel>Loan amount</FieldLabel>
            <DollarField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Loan term</FieldLabel>
            <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Interest rate</FieldLabel>
            <div style={{ position: "relative" }}>
              <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} style={{ paddingRight: 26 }} />
              <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer", marginBottom: extraEnabled ? 14 : 0 }}>
            <input type="checkbox" checked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
            Optional: make extra payments
          </label>

          {extraEnabled && (
            <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={extraFieldWrap}>
                <FieldLabel>Loan start date</FieldLabel>
                <MonthYearField month={startMonth} year={startYear} onMonthChange={setStartMonth} onYearChange={setStartYear} />
              </div>

              <div style={extraFieldWrap}>
                <FieldLabel>Extra monthly pay</FieldLabel>
                <DollarField value={exMonthlyAmount} onChange={setExMonthlyAmount} placeholder="0" />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>from</span>
                  <MonthYearField month={exMonthlyMonth} year={exMonthlyYear} onMonthChange={setExMonthlyMonth} onYearChange={setExMonthlyYear} />
                </div>
              </div>

              <div style={extraFieldWrap}>
                <FieldLabel>Extra yearly pay</FieldLabel>
                <DollarField value={exYearlyAmount} onChange={setExYearlyAmount} placeholder="0" />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>from</span>
                  <MonthYearField month={exYearlyMonth} year={exYearlyYear} onMonthChange={setExYearlyMonth} onYearChange={setExYearlyYear} />
                </div>
              </div>

              <div style={extraFieldWrap}>
                <FieldLabel>Extra one-time pay</FieldLabel>
                <DollarField value={exOneTimeAmount} onChange={setExOneTimeAmount} placeholder="0" />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>in</span>
                  <MonthYearField month={exOneTimeMonth} year={exOneTimeYear} onMonthChange={setExOneTimeMonth} onYearChange={setExOneTimeYear} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "6px 0 0", textDecoration: "underline", textAlign: "center" }}
                >
                  {showMore ? "− Hide inputs below" : "+ More one-time payments"}
                </button>

                {showMore && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {additionalPayments.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <DollarField value={p.amount} onChange={(v) => updateAdditional(i, "amount", v)} placeholder="0" />
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>in</span>
                        <MonthYearField
                          month={p.month} year={p.year}
                          onMonthChange={(v) => updateAdditional(i, "month", v)}
                          onYearChange={(v) => updateAdditional(i, "year", v)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "16px 20px" }}>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                {!result ? "Fill in the loan details and click Calculate" : <>Monthly Pay:&nbsp;&nbsp;{formatCurrency(result.monthlyPI)}</>}
              </span>
            </div>

            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the loan details and click <strong>Calculate</strong> to see your payment breakdown.
                </p>
              ) : (
                <>
                  {result.extraPaymentsEnabled && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      With the extra payment(s), the loan will be paid off in{" "}
                      <strong style={{ color: "var(--text-primary)" }}>{formatYearsAndMonths(result.totalMonths)}</strong>, and{" "}
                      <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(result.interestSaved, { decimals: 0 })}</strong> interest will be saved.
                    </p>
                  )}

                  <div style={{ marginBottom: 18 }}>
                    <AmortizationPieChart segments={[
                      { label: "Principal", value: result.totalPrincipalPaid, color: "#3b7bfc" },
                      { label: "Interest", value: result.totalInterest, color: "#16a34a" },
                    ]} />
                  </div>

                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total of {result.totalMonths} monthly payments</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.totalOfPayments)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total interest</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>
                  {result.extraPaymentsEnabled && (
                    <>
                      <div style={rowStyle}>
                        <span style={{ color: "var(--text-secondary)" }}>Total extra payment(s)</span>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.totalExtraPayments)}</span>
                      </div>
                      <div style={rowStyle}>
                        <span style={{ color: "var(--text-secondary)" }}>Interest to be saved due to the extra payment(s)</span>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.interestSaved)}</span>
                      </div>
                      <div style={{ ...rowStyle, borderBottom: "none" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Loan payoff date</span>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatMonthYear(result.payoffDate.month, result.payoffDate.year)}</span>
                      </div>
                    </>
                  )}
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

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 400px", minWidth: 300 }}>
              <LoanScheduleTable
                title={scheduleView === "annual" ? "Annual Schedule" : "Monthly Schedule"}
                periodLabel={scheduleView === "annual" ? "Year" : "Month"}
                schedule={toTableRows(scheduleView === "annual" ? result.annualRows : result.monthlyRows, scheduleView === "monthly")}
                columns={scheduleColumns}
              />
            </div>
            <div className="card" style={{ flex: "1 1 380px", minWidth: 320, padding: 20 }}>
              <AmortizationLineChart series={buildCumulativeSeries(result.annualRows)} loanAmount={loanAmountNum} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
