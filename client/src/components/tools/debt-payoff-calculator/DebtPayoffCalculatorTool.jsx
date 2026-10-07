import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateDebtPayoff, validateDebtPayoffInputs,
  formatPayoffLength, makeEmptyRows, applyDebtDefaults, DEFAULT_DEBTS, MAX_DEBTS,
  DEFAULTS, formatCurrency,
} from "../../../utils/debtPayoffCalculatorEngine";

const VISIBLE_ROWS_DEFAULT = 6;

// Balances/minimums/rates/extra amounts are all rejected if negative (see
// debtPayoffCalculatorEngine.js's doc comment), so none of these accept a
// leading "-".
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

const cellInputStyle = { width: "100%", padding: "6px 7px", fontSize: 12.5, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)" };

function DollarCell({ value, onChange, placeholder, style }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 11.5, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder}
        style={{ ...cellInputStyle, paddingLeft: 15, ...style }}
      />
    </div>
  );
}

function PercentCell({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ ...cellInputStyle, paddingRight: 20 }} />
      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 11.5, pointerEvents: "none" }}>%</span>
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

const th = { textAlign: "left", padding: "6px 6px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
const td = { padding: "4px 6px", verticalAlign: "middle" };

export default function DebtPayoffCalculatorTool() {
  const [debts, setDebts] = useState(makeEmptyRows());
  const [visibleRows, setVisibleRows] = useState(VISIBLE_ROWS_DEFAULT);
  const [extraMonthly, setExtraMonthly] = useState("");
  const [extraYearly, setExtraYearly] = useState("");
  const [extraOneTime, setExtraOneTime] = useState("");
  const [extraOneTimeMonth, setExtraOneTimeMonth] = useState("");
  const [fixedTotal, setFixedTotal] = useState(DEFAULTS.fixedTotal);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function updateDebt(index, field, value) {
    setDebts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function calculate() {
    const inputs = {
      debts: applyDebtDefaults(debts),
      extraMonthly: extraMonthly || DEFAULTS.extraMonthly,
      extraYearly: extraYearly || DEFAULTS.extraYearly,
      extraOneTime: extraOneTime || DEFAULTS.extraOneTime,
      extraOneTimeMonth: extraOneTimeMonth || DEFAULTS.extraOneTimeMonth,
      fixedTotal,
    };
    const validationError = validateDebtPayoffInputs(inputs);
    if (validationError) { setError(validationError); setResult(null); return; }
    setError(null);
    const calcResult = calculateDebtPayoff(inputs);
    if (calcResult.isImpossible) {
      setError(`With ${formatCurrency(calcResult.debtMinPayment)} monthly payment, you cannot pay off debt #${calcResult.debtId}.`);
      setResult(null);
      return;
    }
    setResult(calcResult);
  }

  function clear() {
    setDebts(makeEmptyRows());
    setVisibleRows(VISIBLE_ROWS_DEFAULT);
    setExtraMonthly(""); setExtraYearly(""); setExtraOneTime(""); setExtraOneTimeMonth("");
    setFixedTotal(DEFAULTS.fixedTotal);
    setResult(null); setError(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18, flex: "1 1 520px", minWidth: 320 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 18 }} aria-hidden="true"></th>
                  <th style={th}>Debt name</th>
                  <th style={th}>Remaining balance</th>
                  <th style={th}>Monthly or min. payment</th>
                  <th style={th}>Interest rate</th>
                </tr>
              </thead>
              <tbody>
                {debts.slice(0, visibleRows).map((debt, i) => {
                  const fallback = DEFAULT_DEBTS[i];
                  return (
                    <tr key={i}>
                      <td style={{ ...td, fontSize: 12, color: "var(--text-muted)", width: 18 }}>{i + 1}.</td>
                      <td style={{ ...td, minWidth: 120 }}>
                        <TextField value={debt.name} onChange={(v) => updateDebt(i, "name", v)} placeholder={fallback ? fallback.name : `Debt ${i + 1}`} style={cellInputStyle} />
                      </td>
                      <td style={{ ...td, minWidth: 90 }}>
                        <DollarCell value={debt.balance} onChange={(v) => updateDebt(i, "balance", v)} placeholder={fallback ? formatWithCommas(fallback.balance) : ""} />
                      </td>
                      <td style={{ ...td, minWidth: 90 }}>
                        <DollarCell value={debt.minPayment} onChange={(v) => updateDebt(i, "minPayment", v)} placeholder={fallback ? formatWithCommas(fallback.minPayment) : ""} />
                      </td>
                      <td style={{ ...td, minWidth: 80 }}>
                        <PercentCell value={debt.ratePercent} onChange={(v) => updateDebt(i, "ratePercent", v)} placeholder={fallback ? fallback.ratePercent : ""} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 8, marginBottom: 16 }}>
            {visibleRows < MAX_DEBTS ? (
              <button type="button" onClick={() => setVisibleRows(MAX_DEBTS)} style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 }}>
                Show more input fields
              </button>
            ) : (
              <button type="button" onClick={() => setVisibleRows(VISIBLE_ROWS_DEFAULT)} style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 }}>
                Hide fields below
              </button>
            )}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px" }}>
            Extra payments
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ width: 110 }}>
                <DollarCell value={extraMonthly} onChange={setExtraMonthly} placeholder={DEFAULTS.extraMonthly} style={{ padding: "7px 9px", fontSize: 13, paddingLeft: 19 }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>per month</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ width: 110 }}>
                <DollarCell value={extraYearly} onChange={setExtraYearly} placeholder={DEFAULTS.extraYearly} style={{ padding: "7px 9px", fontSize: 13, paddingLeft: 19 }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>per year</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ width: 110 }}>
                <DollarCell value={extraOneTime} onChange={setExtraOneTime} placeholder={DEFAULTS.extraOneTime} style={{ padding: "7px 9px", fontSize: 13, paddingLeft: 19 }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>of one-time payment made during the</span>
              <div style={{ width: 56 }}>
                <TextField value={extraOneTimeMonth} onChange={setExtraOneTimeMonth} placeholder={DEFAULTS.extraOneTimeMonth} style={{ padding: "7px 9px", fontSize: 13, textAlign: "center" }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>th month</span>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px" }}>
            Fixed total amount towards monthly payment?
          </p>
          <div style={{ display: "flex", gap: 18, marginBottom: 8 }}>
            {[["y", "Yes"], ["n", "No"]].map(([value, label]) => (
              <label key={value} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
                <input type="radio" name="fixedTotal" checked={fixedTotal === value} onChange={() => setFixedTotal(value)} />
                {label}
              </label>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
            {fixedTotal === "y"
              ? "With “Yes”, once a debt is paid off, the money that had been going to it keeps getting paid, redirected to the highest-interest debt still remaining, until every debt is paid off — the total monthly amount stays fixed the whole time."
              : "With “No”, once a debt is paid off, its payment simply stops rather than rolling over to another debt, so the total amount you're paying each month shrinks as debts get cleared."}
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Result ───────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: "hidden", flex: "1 1 360px", minWidth: 320 }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            Results
          </div>
          <div style={{ padding: "14px 16px" }}>
            {!result && !error ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                Fill in your debts and extra payments, then click <strong>Calculate</strong> to see your payoff plan.
              </p>
            ) : error ? (
              <ErrorPanel message={error} />
            ) : (
              <>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                  You can pay off your debts in <strong style={{ color: "var(--success)" }}>{formatPayoffLength(result.totalMonths)}</strong>
                  {result.isFixed ? (
                    <> by making fixed payments of {formatCurrency(result.fixedMonthlyTotal)} every month{result.extraMonthlyAmount > 0 && <>, of which {formatCurrency(result.extraMonthlyAmount)} is the extra monthly payment</>}.</>
                  ) : (
                    <> with the monthly/min.{result.extraMonthlyAmount > 0 && " and extra"} payments.</>
                  )}
                  {" "}You will need to pay a total of <strong style={{ color: "var(--success)" }}>{formatCurrency(result.totalPayments)}</strong>, of which the total interest is <strong style={{ color: "var(--success)" }}>{formatCurrency(result.totalInterest)}</strong>.
                </p>
                <InvestmentPieChart segments={[
                  { label: "Principal", value: result.totalPrincipal, color: "#2b7ddb" },
                  { label: "Interest", value: result.totalInterest, color: "#8bbc21" },
                ]} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Payment Schedule (full width, per debt) ───────────────────── */}
      {result && (
        <div className="card" style={{ padding: 18 }}>
          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 8px" }}>
            Payment Schedule
          </p>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
            The most financially feasible method to pay off debts is to start by paying off the highest
            interest debts first while paying the monthly or minimum payments for the other debts. The
            following is the payment schedule.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table data-table-head" style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={th}>Debt</th>
                  <th style={{ ...th, textAlign: "right" }}>Payoff length</th>
                  <th style={{ ...th, textAlign: "right" }}>Total interest</th>
                  <th style={{ ...th, textAlign: "right" }}>Total payments</th>
                  <th style={th}>Payment schedule</th>
                </tr>
              </thead>
              <tbody>
                {result.debts.map((d) => (
                  <tr key={d.id}>
                    <td style={{ ...td, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>#{d.id}: {d.name}</td>
                    <td style={{ ...td, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{formatPayoffLength(d.payoffMonth)}</td>
                    <td style={{ ...td, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(d.totalInterest)}</td>
                    <td style={{ ...td, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(d.totalPaid)}</td>
                    <td style={{ ...td, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{d.scheduleText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
