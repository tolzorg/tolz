import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import AnnuityPayoutLineChart from "./AnnuityPayoutLineChart";
import {
  calculateFixedLength, calculateFixedPayment,
  validateFixedLengthInputs, validateFixedPaymentInputs,
  PAYOUT_FREQUENCY_OPTIONS, DEFAULT_FREQUENCY, DEFAULTS, formatCurrency,
} from "../../../utils/annuityPayoutCalculatorEngine";

const TABS = [
  { key: "fixlength", label: "Fixed length" },
  { key: "fixpayment", label: "Fixed payment" },
];

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

const SCHEDULE_COLUMNS = [
  { key: "beginning", label: "Beginning balance" },
  { key: "interest", label: "Interest/return" },
  { key: "balance", label: "Ending balance" },
];

// Reference rejects a literal negative starting principal/payout amount
// (see annuityPayoutCalculatorEngine.js's doc comment), so unlike the
// accumulation Annuity Calculator's DollarField, this one does not accept
// a leading "-".
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
 * established validation-message convention (e.g. Savings, Annuity,
 * Interest Rate calculators). */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

function toTableRows(rows) {
  return rows.map((row) => ({ period: row.period, beginning: row.beginning, interest: row.interest, balance: row.balance }));
}

export default function AnnuityPayoutCalculatorTool() {
  const [activeTab, setActiveTab] = useState("fixlength");
  const [startingPrincipal, setStartingPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [years, setYears] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function switchTab(key) {
    setActiveTab(key);
    setResult(null);
    setError(null);
  }

  function calculate() {
    const shared = {
      startingPrincipal: startingPrincipal || DEFAULTS.startingPrincipal,
      interestRatePercent: interestRate || DEFAULTS.interestRatePercent,
      frequency,
    };
    if (activeTab === "fixlength") {
      const inputs = { ...shared, years: years || DEFAULTS.yearsToPayout };
      const validationError = validateFixedLengthInputs(inputs);
      if (validationError) { setError(validationError); setResult(null); return; }
      setError(null);
      setResult(calculateFixedLength(inputs));
    } else {
      const inputs = { ...shared, payoutAmount: payoutAmount || DEFAULTS.payoutAmount };
      const validationError = validateFixedPaymentInputs(inputs);
      if (validationError) { setError(validationError); setResult(null); return; }
      setError(null);
      setResult(calculateFixedPayment(inputs));
    }
  }

  function clear() {
    setStartingPrincipal(""); setInterestRate(""); setYears(""); setPayoutAmount("");
    setFrequency(DEFAULT_FREQUENCY);
    setResult(null); setError(null);
  }

  const freqAdverb = (result?.frequency || PAYOUT_FREQUENCY_OPTIONS.find((o) => o.value === frequency) || PAYOUT_FREQUENCY_OPTIONS[3]).label.toLowerCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320, display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                style={{
                  flex: "1 1 auto", padding: "10px 8px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)",
                  cursor: "pointer", border: "1px solid var(--border)",
                  background: activeTab === tab.key ? "var(--accent)" : "var(--bg-white)",
                  color: activeTab === tab.key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: activeTab === tab.key ? 1 : 0, whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="card" style={{ padding: 18, marginTop: 12 }}>
            <FieldRow label="Starting principal">
              <DollarField value={startingPrincipal} onChange={setStartingPrincipal} placeholder={DEFAULTS.startingPrincipal} />
            </FieldRow>

            <FieldRow label="Interest/return rate">
              <PercentField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRatePercent} />
            </FieldRow>

            {activeTab === "fixlength" ? (
              <FieldRow label="Years to payout" suffix="years">
                <TextField value={years} onChange={setYears} placeholder={DEFAULTS.yearsToPayout} />
              </FieldRow>
            ) : (
              <FieldRow label="Payout amount">
                <DollarField value={payoutAmount} onChange={setPayoutAmount} placeholder={DEFAULTS.payoutAmount} />
              </FieldRow>
            )}

            <FieldRow label="Payout frequency">
              <SelectField value={frequency} onChange={setFrequency} options={PAYOUT_FREQUENCY_OPTIONS} />
            </FieldRow>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result && !error ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see your payout.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : (
                <>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: result.isForever ? 0 : 16 }}>
                    You can withdraw <strong style={{ color: "var(--success)" }}>{formatCurrency(result.payout)}</strong> {freqAdverb}
                    {result.mode === "fixpayment" && !result.isForever && (
                      <> for <strong style={{ color: "var(--success)" }}>{result.years.toFixed(2)}</strong> years</>
                    )}
                    {result.isForever ? " forever!" : "."}
                  </p>

                  {!result.isForever && (
                    <>
                      <div style={rowStyle}>
                        <span style={{ color: "var(--text-secondary)" }}>Total of {result.paymentCount} payments</span>
                        <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalWithdrawn)}</span>
                      </div>
                      <div style={{ ...rowStyle, borderBottom: "none" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Total interest/return</span>
                        <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                      </div>

                      <div style={{ marginTop: 16 }}>
                        <InvestmentPieChart segments={[
                          { label: "Starting principal", value: result.startingPrincipal, color: "#2b7ddb" },
                          { label: "Interest/return", value: result.totalInterest, color: "#8bbc21" },
                        ]} />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && !result.isForever && result.showSchedule && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>
            Annuity Balances
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 380px", minWidth: 300 }}>
              <LoanScheduleTable
                title="Annual Schedule"
                periodLabel="Year"
                schedule={toTableRows(result.annualSchedule)}
                columns={SCHEDULE_COLUMNS}
              />
            </div>
            <div className="card" style={{ flex: "1 1 380px", minWidth: 320, padding: 16 }}>
              <AnnuityPayoutLineChart lineData={result.lineData} startingPrincipal={result.startingPrincipal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
