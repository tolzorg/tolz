import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import {
  calculateSavings, validateSavingsInputs, COMPOUND_OPTIONS, DEFAULTS, formatCurrency,
} from "../../../utils/savingsCalculatorEngine";

const BAR_LABELS = { starting: "Initial deposit", contributions: "Contributions", interest: "Interest" };

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.-]/g, "");
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return (negative ? "-" : "") + cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned || cleaned === "-") return cleaned;
  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;
  const [intPart, decPart] = body.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  return (negative ? "-" : "") + formatted;
}

// Reference allows a leading "-" on deposit/contribution fields (confirmed
// live — see savingsCalculatorEngine.js's doc comment), so this DollarField
// keeps the sign through instead of stripping it like most other
// calculators' dollar fields do.
function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19 }}
      />
    </div>
  );
}

/** A plain red error line with a small warning icon — matches this app's
 * established validation-message convention (e.g. Interest Rate, Sales
 * Tax calculators). */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

function toTableRows(rows, hasTax) {
  return rows.map((row) => ({ period: row.period, deposit: row.deposit, interest: row.interest, tax: row.tax, balance: row.balance }));
}

export default function SavingsCalculatorTool() {
  const [initialDeposit, setInitialDeposit] = useState("");
  const [annualContribution, setAnnualContribution] = useState("");
  const [annualIncrease, setAnnualIncrease] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [monthlyIncrease, setMonthlyIncrease] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [compound, setCompound] = useState("annually");
  const [years, setYears] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scheduleView, setScheduleView] = useState("annual");

  function calculate() {
    const inputs = {
      interestRatePercent: interestRate || DEFAULTS.interestRatePercent,
      taxRatePercent: taxRate || DEFAULTS.taxRatePercent,
      years: years || DEFAULTS.years,
    };
    const validationError = validateSavingsInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateSavings({
      initialDeposit: initialDeposit || DEFAULTS.initialDeposit,
      annualContribution: annualContribution || DEFAULTS.annualContribution,
      annualContributionIncreasePercent: annualIncrease || DEFAULTS.annualContributionIncreasePercent,
      monthlyContribution: monthlyContribution || DEFAULTS.monthlyContribution,
      monthlyContributionIncreasePercent: monthlyIncrease || DEFAULTS.monthlyContributionIncreasePercent,
      compound,
      ...inputs,
    }));
    setScheduleView("annual");
  }

  function clear() {
    setInitialDeposit(""); setAnnualContribution(""); setAnnualIncrease("");
    setMonthlyContribution(""); setMonthlyIncrease("");
    setInterestRate(""); setCompound("annually"); setYears(""); setTaxRate("");
    setResult(null); setError(null);
  }

  const scheduleColumns = [
    { key: "deposit", label: "Deposit" },
    { key: "interest", label: "Interest" },
    ...(result?.hasTax ? [{ key: "tax", label: "Tax" }] : []),
    { key: "balance", label: "Ending balance" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18, flex: "1 1 360px", minWidth: 320 }}>
          <FieldRow label="Initial deposit">
            <DollarField value={initialDeposit} onChange={setInitialDeposit} placeholder={DEFAULTS.initialDeposit} />
          </FieldRow>

          <FieldRow label="Annual contribution">
            <DollarField value={annualContribution} onChange={setAnnualContribution} placeholder={DEFAULTS.annualContribution} />
          </FieldRow>
          <FieldRow label="increase" suffix="% /year">
            <TextField value={annualIncrease} onChange={setAnnualIncrease} placeholder={DEFAULTS.annualContributionIncreasePercent} />
          </FieldRow>

          <FieldRow label="Monthly contribution">
            <DollarField value={monthlyContribution} onChange={setMonthlyContribution} placeholder={DEFAULTS.monthlyContribution} />
          </FieldRow>
          <FieldRow label="increase" suffix="% /year">
            <TextField value={monthlyIncrease} onChange={setMonthlyIncrease} placeholder={DEFAULTS.monthlyContributionIncreasePercent} />
          </FieldRow>

          <FieldRow label="Interest rate" suffix="%">
            <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRatePercent} />
          </FieldRow>

          <FieldRow label="Compound">
            <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
          </FieldRow>

          <FieldRow label="Years to save" suffix="years">
            <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} />
          </FieldRow>

          <FieldRow label="Tax rate" suffix="%" hint="Your marginal tax rate on interest earned. Tax is deducted from the interest as it's earned each period, not as a single lump sum at the end.">
            <TextField value={taxRate} onChange={setTaxRate} placeholder={DEFAULTS.taxRatePercent} />
          </FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result && !error ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see your savings growth.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : (
                <>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>End balance</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.endingBalance)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Initial deposit</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.initialDeposit)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total contributions</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalContributions)}</span>
                  </div>
                  {result.hasTax ? (
                    <>
                      <div style={rowStyle}>
                        <span style={{ color: "var(--text-secondary)" }}>Total interest earned (after tax)</span>
                        <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterestAfterTax)}</span>
                      </div>
                      <div style={{ ...rowStyle, borderBottom: "none" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Total tax</span>
                        <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalTax)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ ...rowStyle, borderBottom: "none" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Total interest earned</span>
                      <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterestAfterTax)}</span>
                    </div>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <InvestmentPieChart segments={[
                      { label: "Initial deposit", value: result.initialDeposit, color: "#2b7ddb" },
                      { label: "Contributions", value: result.totalContributions, color: "#8bbc21" },
                      { label: "Interest", value: result.totalInterestAfterTax, color: "#910000" },
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
            Accumulation Schedule
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

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 380px", minWidth: 300 }}>
              <LoanScheduleTable
                title={scheduleView === "annual" ? "Annual Schedule" : "Monthly Schedule"}
                periodLabel={scheduleView === "annual" ? "Year" : "Month"}
                schedule={toTableRows(scheduleView === "annual" ? result.annualSchedule : result.monthlySchedule)}
                columns={scheduleColumns}
              />
            </div>
            <div className="card" style={{ flex: "1 1 380px", minWidth: 320, padding: 16 }}>
              <InvestmentBarChart barData={result.barData} labels={BAR_LABELS} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
