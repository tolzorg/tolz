import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import { calculateCd, DEFAULTS, COMPOUND_OPTIONS, formatMoney } from "../../../utils/cdCalculatorEngine";

const TAX_HINT = "Your marginal income tax rate applies to the interest. If you only want to calculate interest compounding or if your interest income is not taxable, enter 0.";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function ResultRow({ label, value, strong, last }) {
  return (
    <div style={{ ...rowStyle, borderBottom: last ? "none" : rowStyle.borderBottom }}>
      <span style={{ color: strong ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: strong ? 700 : 400 }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: strong ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function scheduleColumns(hasTax) {
  return [
    { key: "deposit", label: "Deposit" },
    { key: "interest", label: "Interest" },
    ...(hasTax ? [{ key: "tax", label: "Tax" }] : []),
    { key: "balance", label: "Ending balance" },
  ];
}

export default function CdCalculatorTool() {
  const [deposit, setDeposit] = useState("");
  const [rate, setRate] = useState("");
  const [compound, setCompound] = useState("annually");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [tax, setTax] = useState("");
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");

  function calculate() {
    setResult(calculateCd({
      deposit: deposit || DEFAULTS.deposit,
      rate: rate || DEFAULTS.rate,
      compound,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      tax: tax || DEFAULTS.tax,
    }));
    setView("annual");
  }

  function clear() {
    setDeposit(""); setRate(""); setCompound("annually"); setYears(""); setMonths(""); setTax("");
    setResult(null);
  }

  const ok = result && !result.errors;
  const schedule = ok ? result.schedule : null;
  const showMonthly = schedule && (schedule.monthlyOnly || view === "monthly");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Initial deposit">
            <DollarField value={deposit} onChange={setDeposit} placeholder={DEFAULTS.deposit} />
          </FieldRow>
          <FieldRow label="Interest rate">
            <PercentField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} />
          </FieldRow>
          <FieldRow label="Compound">
            <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
          </FieldRow>
          <FieldRow label="Deposit length" suffix="years">
            <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} />
          </FieldRow>
          <FieldRow label="" suffix="months">
            <TextField value={months} onChange={setMonths} placeholder={DEFAULTS.months} />
          </FieldRow>
          <FieldRow label="Marginal tax rate" hint={TAX_HINT}>
            <PercentField value={tax} onChange={setTax} placeholder={DEFAULTS.tax} />
          </FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Results</div>
          <div style={{ padding: "14px 18px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter your CD details and click <strong>Calculate</strong> to see the end balance and interest earned.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : (
              <>
                <ResultRow label="End balance" value={formatMoney(result.endBalance)} strong />
                <ResultRow label="Total interest" value={formatMoney(result.totalInterest)} last={!result.hasTax} />
                {result.hasTax && (
                  <>
                    <ResultRow label="Total tax" value={formatMoney(result.totalTax)} />
                    <ResultRow label="Interest after tax" value={formatMoney(result.interestAfterTax)} last />
                  </>
                )}
                {result.footnote && (
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "8px 0 0" }}>{result.footnote}</p>
                )}
                {result.showCharts && (
                  <div style={{ marginTop: 16 }}>
                    <InvestmentPieChart segments={result.pie} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {schedule && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>
            Accumulation Schedule
          </h2>
          {!schedule.monthlyOnly && (
            <div style={{ display: "flex", gap: 18, fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {[["annual", "Annual Schedule"], ["monthly", "Monthly Schedule"]].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    color: view === key ? "var(--text-primary)" : "var(--accent)",
                    textDecoration: view === key ? "none" : "underline",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 380px", minWidth: 300 }}>
              <LoanScheduleTable
                title={showMonthly ? "Monthly Schedule" : "Annual Schedule"}
                periodLabel={showMonthly ? "Month" : "Year"}
                schedule={showMonthly ? schedule.monthly : schedule.annual}
                columns={scheduleColumns(result.hasTax)}
                formatValue={formatMoney}
              />
            </div>
            {result.showCharts && (
              <div className="card" style={{ flex: "1 1 380px", minWidth: 300, padding: 16 }}>
                <InvestmentBarChart
                  barData={result.bars}
                  labels={{ starting: "Initial deposit", contributions: null, interest: result.interestLabel }}
                  tickLabels={result.barTickLabels}
                  xAxisLabel={result.barUnit}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
