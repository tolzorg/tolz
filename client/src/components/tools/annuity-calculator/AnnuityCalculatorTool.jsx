import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import {
  calculateAnnuity, validateAnnuityInputs, DEFAULTS, formatCurrency,
} from "../../../utils/annuityCalculatorEngine";

const BAR_LABELS = { starting: "Start principal", contributions: "Additions", interest: "Return/interest" };
const SCHEDULE_COLUMNS = [
  { key: "deposit", label: "Addition" },
  { key: "interest", label: "Return" },
  { key: "balance", label: "Ending balance" },
];

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

// Reference accepts a leading "-" on principal/addition fields (confirmed
// live — see annuityCalculatorEngine.js's doc comment), so this DollarField
// keeps the sign through instead of stripping it, matching the Savings
// Calculator's own DollarField for the same reason.
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

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>%</span>
    </div>
  );
}

/** A plain red error line with a small warning icon — matches this app's
 * established validation-message convention (e.g. Savings, Interest Rate,
 * Sales Tax calculators). */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

function toTableRows(rows) {
  return rows.map((row) => ({ period: row.period, deposit: row.deposit, interest: row.interest, balance: row.balance }));
}

export default function AnnuityCalculatorTool() {
  const [startingPrincipal, setStartingPrincipal] = useState("");
  const [annualAddition, setAnnualAddition] = useState("");
  const [monthlyAddition, setMonthlyAddition] = useState("");
  const [additionAt, setAdditionAt] = useState("beginning");
  const [growthRate, setGrowthRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scheduleView, setScheduleView] = useState("annual");

  function calculate() {
    const inputs = { years: years || DEFAULTS.years };
    const validationError = validateAnnuityInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateAnnuity({
      startingPrincipal: startingPrincipal || DEFAULTS.startingPrincipal,
      annualAddition: annualAddition || DEFAULTS.annualAddition,
      monthlyAddition: monthlyAddition || DEFAULTS.monthlyAddition,
      growthRatePercent: growthRate || DEFAULTS.growthRatePercent,
      additionAt,
      ...inputs,
    }));
    setScheduleView("annual");
  }

  function clear() {
    setStartingPrincipal(""); setAnnualAddition(""); setMonthlyAddition("");
    setAdditionAt("beginning"); setGrowthRate(""); setYears("");
    setResult(null); setError(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18, flex: "1 1 360px", minWidth: 320 }}>
          <FieldRow label="Starting principal">
            <DollarField value={startingPrincipal} onChange={setStartingPrincipal} placeholder={DEFAULTS.startingPrincipal} />
          </FieldRow>

          <FieldRow label="Annual addition">
            <DollarField value={annualAddition} onChange={setAnnualAddition} placeholder={DEFAULTS.annualAddition} />
          </FieldRow>

          <FieldRow label="Monthly addition">
            <DollarField value={monthlyAddition} onChange={setMonthlyAddition} placeholder={DEFAULTS.monthlyAddition} />
          </FieldRow>

          <div style={{ margin: "10px 0 16px" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>Add at each period's</p>
            {[
              ["beginning", "beginning (annuity due)"],
              ["end", "end (ordinary/immediate annuity)"],
            ].map(([value, label]) => (
              <label key={value} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: 4 }}>
                <input type="radio" name="additionAt" checked={additionAt === value} onChange={() => setAdditionAt(value)} />
                {label}
              </label>
            ))}
          </div>

          <FieldRow label="Annual growth rate">
            <PercentField value={growthRate} onChange={setGrowthRate} placeholder={DEFAULTS.growthRatePercent} />
          </FieldRow>

          <FieldRow label="After" suffix="years">
            <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} />
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
                  Fill in the details and click <strong>Calculate</strong> to see how your annuity will grow.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : (
                <>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>End balance</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.endBalance)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Starting principal</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.startingPrincipal)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total additions</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalAdditions)}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total return/interest earned</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalReturn)}</span>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <InvestmentPieChart segments={[
                      { label: "Starting principal", value: result.startingPrincipal, color: "#2b7ddb" },
                      { label: "Additions", value: result.totalAdditions, color: "#8bbc21" },
                      { label: "Return/interest", value: result.totalReturn, color: "#910000" },
                    ]} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && result.showSchedule && (
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
                columns={SCHEDULE_COLUMNS}
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
