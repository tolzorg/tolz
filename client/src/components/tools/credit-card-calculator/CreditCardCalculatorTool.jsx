import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import AnnuityPayoutLineChart from "../annuity-payout-calculator/AnnuityPayoutLineChart";
import {
  calculatePayCertainAmount, calculatePayoffTimeframe,
  validatePayCertainAmountInputs, validatePayoffTimeframeInputs,
  formatPayoffDuration, formatTimeframe, suggestedPayment,
  QUICK_FILL_OPTIONS, DEFAULTS, formatCurrency,
} from "../../../utils/creditCardCalculatorEngine";

// Reference rejects a literal negative balance/rate/payment (see
// creditCardCalculatorEngine.js's doc comment), so — unlike the
// accumulation Annuity Calculator's DollarField — this one does not
// accept a leading "-".
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
 * established validation-message convention. */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

export default function CreditCardCalculatorTool() {
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [payoffMode, setPayoffMode] = useState("certainamount");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function quickFill(percentOption) {
    const b = balance || DEFAULTS.balance;
    const r = rate || DEFAULTS.ratePercent;
    setPaymentAmount(suggestedPayment(b, r, percentOption).toFixed(2));
  }

  function calculate() {
    const shared = { balance: balance || DEFAULTS.balance, ratePercent: rate || DEFAULTS.ratePercent };
    if (payoffMode === "certainamount") {
      const inputs = { ...shared, paymentAmount: paymentAmount || DEFAULTS.paymentAmount };
      const validationError = validatePayCertainAmountInputs(inputs);
      if (validationError) { setError(validationError); setResult(null); return; }
      setError(null);
      setResult(calculatePayCertainAmount(inputs));
    } else {
      const inputs = { ...shared, years: years || DEFAULTS.years, months: months || DEFAULTS.months };
      const validationError = validatePayoffTimeframeInputs(inputs);
      if (validationError) { setError(validationError); setResult(null); return; }
      setError(null);
      setResult(calculatePayoffTimeframe(inputs));
    }
  }

  function clear() {
    setBalance(""); setRate(""); setPayoffMode("certainamount");
    setPaymentAmount(""); setYears(""); setMonths("");
    setResult(null); setError(null);
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 18, flex: "1 1 360px", minWidth: 320 }}>
        <FieldRow label="Credit card balance">
          <DollarField value={balance} onChange={setBalance} placeholder={DEFAULTS.balance} />
        </FieldRow>

        <FieldRow label="Interest rate">
          <PercentField value={rate} onChange={setRate} placeholder={DEFAULTS.ratePercent} />
        </FieldRow>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "12px 0 6px" }}>How do you plan to pay off?</p>

        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
          <input type="radio" name="payoffMode" checked={payoffMode === "certainamount"} onChange={() => setPayoffMode("certainamount")} />
          Pay a certain amount
        </label>
        {payoffMode === "certainamount" && (
          <div style={{ paddingLeft: 26, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-secondary)" }}>pay</span>
              <div style={{ width: 130 }}>
                <DollarField value={paymentAmount} onChange={setPaymentAmount} placeholder={DEFAULTS.paymentAmount} />
              </div>
              <span style={{ color: "var(--text-secondary)" }}>per month</span>
            </div>
            <div style={{ fontSize: 12.5, marginTop: 6, color: "var(--text-secondary)" }}>
              or use{" "}
              {QUICK_FILL_OPTIONS.map((pct, i) => (
                <span key={pct}>
                  <button
                    type="button"
                    onClick={() => quickFill(pct)}
                    style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 }}
                  >
                    {pct === 1 ? "Interest + 1% of Balance" : `${pct}%`}
                  </button>
                  {i < QUICK_FILL_OPTIONS.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
          <input type="radio" name="payoffMode" checked={payoffMode === "timeframe"} onChange={() => setPayoffMode("timeframe")} />
          Pay off within a certain timeframe
        </label>
        {payoffMode === "timeframe" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexWrap: "wrap", paddingLeft: 26, marginBottom: 10 }}>
            <span style={{ color: "var(--text-secondary)" }}>pay off in</span>
            <div style={{ width: 70 }}>
              <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>years</span>
            <div style={{ width: 70 }}>
              <TextField value={months} onChange={setMonths} placeholder={DEFAULTS.months} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>months</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      {/* ── Result ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden", flex: "1 1 360px", minWidth: 320 }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Result
        </div>
        <div style={{ padding: "14px 16px" }}>
          {!result && !error ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              Fill in the details and click <strong>Calculate</strong> to see your payoff plan.
            </p>
          ) : error ? (
            <ErrorPanel message={error} />
          ) : result.isImpossible ? (
            <ErrorPanel message={`It is unlikely that you can pay off the balance with a monthly payment of $${result.payment}. You will need to pay an amount higher than ${formatCurrency(result.minPayment)}.`} />
          ) : (
            <>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {result.mode === "certainamount" ? (
                  <>It will take <strong style={{ color: "var(--success)" }}>{formatPayoffDuration(result.totalMonthsRounded)}</strong> to pay off the balance.</>
                ) : (
                  <><strong style={{ color: "var(--success)" }}>{formatCurrency(result.payment)} per month</strong> is needed to pay off the balance in {formatTimeframe(result.years, result.months)}.</>
                )}
                {" "}The total interest is <strong style={{ color: "var(--success)" }}>{formatCurrency(result.totalInterest)}</strong>.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <InvestmentPieChart segments={[
                  { label: "Principal", value: result.principal, color: "#2b7ddb" },
                  { label: "Interest", value: result.totalInterest, color: "#8bbc21" },
                ]} />
                <AnnuityPayoutLineChart
                  lineData={result.lineData}
                  startingPrincipal={result.principal}
                  xKey="month"
                  xLabel="Month"
                  interestLabel="Interest"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
