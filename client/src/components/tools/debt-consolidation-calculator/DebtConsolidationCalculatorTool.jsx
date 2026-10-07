import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import {
  calculateDebtConsolidation, validateDebtConsolidationInputs,
  formatPayoffLength, makeEmptyRows, applyDebtDefaults, DEFAULT_DEBTS, MAX_DEBTS,
  DEFAULTS, formatCurrency, formatPercent,
} from "../../../utils/debtConsolidationCalculatorEngine";

const VISIBLE_ROWS_DEFAULT = 6;
const FEE_UNIT_OPTIONS = [{ value: "p", label: "%" }, { value: "d", label: "$" }];

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

function PercentCell({ value, onChange, placeholder, style }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ ...cellInputStyle, paddingRight: 20, ...style }} />
      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 11.5, pointerEvents: "none" }}>%</span>
    </div>
  );
}

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

// Reference shows a negative cash-flow figure as "$-250.00" (sign AFTER
// the currency symbol, not before) — same non-standard convention already
// verified for the Finance/Interest Rate Calculators — confirmed live
// for this calculator's own "Upfront cash flow" line specifically.
function formatCashFlow(value) {
  return value < 0 ? `$-${formatCurrency(Math.abs(value)).slice(1)}` : formatCurrency(value);
}

const compareTh = { textAlign: "right", padding: "8px 8px", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", borderBottom: "2px solid var(--border)" };
const compareLabelTd = { padding: "7px 8px", fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border)" };
const compareTd = { padding: "7px 8px", fontSize: 12.5, textAlign: "right", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" };

export default function DebtConsolidationCalculatorTool() {
  const [debts, setDebts] = useState(makeEmptyRows());
  const [visibleRows, setVisibleRows] = useState(VISIBLE_ROWS_DEFAULT);
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [loanCost, setLoanCost] = useState("");
  const [loanCostUnit, setLoanCostUnit] = useState(DEFAULTS.loanCostUnit);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function updateDebt(index, field, value) {
    setDebts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function calculate() {
    const inputs = {
      debts: applyDebtDefaults(debts),
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      interestRate: interestRate || DEFAULTS.interestRate,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      loanCost: loanCost || DEFAULTS.loanCost,
      loanCostUnit,
    };
    const validationError = validateDebtConsolidationInputs(inputs);
    if (validationError) { setError(validationError); setResult(null); return; }
    setError(null);
    const calcResult = calculateDebtConsolidation(inputs);
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
    setLoanAmount(""); setInterestRate(""); setYears(""); setMonths("");
    setLoanCost(""); setLoanCostUnit(DEFAULTS.loanCostUnit);
    setResult(null); setError(null);
  }

  const plural = !result || result.debtCount !== 1;

  return (
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

        <div style={{ marginTop: 8, marginBottom: 18 }}>
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

        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 10px" }}>
          Consolidation loan
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", flex: "0 0 100px" }}>Loan amount</label>
            <div style={{ width: 160 }}>
              <DollarCell value={loanAmount} onChange={setLoanAmount} placeholder={formatWithCommas(DEFAULTS.loanAmount)} style={{ padding: "7px 9px", fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", flex: "0 0 100px" }}>Interest rate</label>
            <div style={{ width: 160 }}>
              <PercentCell value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} style={{ padding: "7px 9px", fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", flex: "0 0 100px", paddingTop: 7 }}>Loan term</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} style={{ padding: "7px 9px", fontSize: 13, width: "100%" }} />
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>years</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TextField value={months} onChange={setMonths} placeholder={DEFAULTS.months} style={{ padding: "7px 9px", fontSize: 13, width: "100%" }} />
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>months</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", flex: "0 0 100px" }}>Loan fee/points</label>
            <div style={{ display: "flex", gap: 6, width: 160 }}>
              <TextField value={loanCost} onChange={setLoanCost} placeholder={DEFAULTS.loanCost} style={{ padding: "7px 9px", fontSize: 13, flex: 1, minWidth: 0 }} />
              <div style={{ width: 60 }}>
                <SelectField value={loanCostUnit} onChange={setLoanCostUnit} options={FEE_UNIT_OPTIONS} style={{ padding: "7px 6px", fontSize: 13 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      {/* ── Result ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden", flex: "1 1 400px", minWidth: 320 }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Results
        </div>
        <div style={{ padding: "14px 16px" }}>
          {!result && !error ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              Fill in your debts and proposed loan, then click <strong>Calculate</strong> to compare them.
            </p>
          ) : error ? (
            <ErrorPanel message={error} />
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                The APR of your current {plural ? "debts are" : "debt is"} <strong>{formatPercent(result.existing.apr)}</strong>.
                The APR of your consolidation loan, with fee considered, is <strong>{formatPercent(result.loan.apr)}</strong>.
                {" "}So the financial cost of {result.isLower ? "the" : "this"} consolidation loan is {result.isLower ? "lower" : "more expensive than your existing debt" + (plural ? "s" : "")}.
                {" "}
                {result.isLower ? (
                  <strong style={{ color: "var(--success)" }}>This consolidation loan will save you money.</strong>
                ) : (
                  <><strong style={{ color: "#dc2626" }}>It is not recommended to use this consolidation loan.</strong></>
                )}
                {" "}After loan fee of {formatCurrency(result.fee)}, you can get {formatCurrency(result.netProceeds)} to be used to payoff your remaining debt balance of {formatCurrency(result.totalBalance)}.
                {" "}
                {result.cashFlow < 0 ? (
                  <>So, you will need additional {formatCurrency(Math.abs(result.cashFlow))} for consolidation.</>
                ) : (
                  <>You can keep the remaining {formatCurrency(result.cashFlow)} after consolidation.</>
                )}
              </p>

              <div style={{ overflowX: "auto" }}>
                <table className="data-table data-table-head" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...compareTh, textAlign: "left" }}></th>
                      <th style={compareTh}>Existing {plural ? "debts" : "debt"}</th>
                      <th style={compareTh}>Consolidation loan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={compareLabelTd}>APR</td>
                      <td style={compareTd}>{formatPercent(result.existing.apr)}</td>
                      <td style={compareTd}>{formatPercent(result.loan.apr)}</td>
                    </tr>
                    <tr>
                      <td style={compareLabelTd}>Monthly pay</td>
                      <td style={compareTd}>{formatCurrency(result.existing.monthlyPay)}</td>
                      <td style={compareTd}>{formatCurrency(result.loan.monthlyPay)}</td>
                    </tr>
                    <tr>
                      <td style={compareLabelTd}>Time to payoff</td>
                      <td style={compareTd}>{formatPayoffLength(result.existing.months)}</td>
                      <td style={compareTd}>{formatPayoffLength(result.loan.months)}</td>
                    </tr>
                    <tr>
                      <td style={compareLabelTd}>Loan fee/points</td>
                      <td style={compareTd}>$0</td>
                      <td style={compareTd}>{formatCurrency(result.fee)}</td>
                    </tr>
                    <tr>
                      <td style={compareLabelTd}>Upfront cash flow for consolidation</td>
                      <td style={compareTd}>$0</td>
                      <td style={compareTd}>{formatCashFlow(result.cashFlow)}</td>
                    </tr>
                    <tr>
                      <td style={compareLabelTd}>Total payments</td>
                      <td style={compareTd}>{formatCurrency(result.existing.totalPayments)}</td>
                      <td style={compareTd}>{formatCurrency(result.loan.totalPayments)}</td>
                    </tr>
                    <tr>
                      <td style={{ ...compareLabelTd, borderBottom: "none" }}>Total interests</td>
                      <td style={{ ...compareTd, borderBottom: "none" }}>{formatCurrency(result.existing.totalInterest)}</td>
                      <td style={{ ...compareTd, borderBottom: "none" }}>{formatCurrency(result.loan.totalInterest)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>
                *The calculation of the existing {plural ? "debts" : "debt"} assumes you pay {formatCurrency(result.existing.monthlyPay)} per month until paid off.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
