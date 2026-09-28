import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateCreditCardPayoff, validateCreditCardPayoffInputs,
  formatPayoffLength, makeDefaultRows, MAX_CARDS,
  DEFAULT_BUDGET, formatCurrency,
} from "../../../utils/creditCardPayoffCalculatorEngine";

const VISIBLE_ROWS_DEFAULT = 6;

// Balances/minimums/rates are all rejected if negative (see
// creditCardPayoffCalculatorEngine.js's doc comment), so — like the plain
// Credit Card Calculator's fields — none of these accept a leading "-".
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

function DollarCell({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 11.5, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder}
        style={{ ...cellInputStyle, paddingLeft: 15 }}
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

export default function CreditCardPayoffCalculatorTool() {
  const [budget, setBudget] = useState("");
  const [cards, setCards] = useState(makeDefaultRows());
  const [visibleRows, setVisibleRows] = useState(VISIBLE_ROWS_DEFAULT);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function updateCard(index, field, value) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function calculate() {
    const inputs = { budget: budget || DEFAULT_BUDGET, cards };
    const validationError = validateCreditCardPayoffInputs(inputs);
    if (validationError) { setError(validationError); setResult(null); return; }
    setError(null);
    setResult(calculateCreditCardPayoff(inputs));
  }

  function clear() {
    setBudget("");
    setCards(makeDefaultRows());
    setVisibleRows(VISIBLE_ROWS_DEFAULT);
    setResult(null); setError(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18, flex: "1 1 480px", minWidth: 320 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              Monthly budget set aside for credit cards
            </label>
            <div style={{ width: 140 }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
                <TextField
                  value={formatWithCommas(budget)}
                  onChange={(v) => setBudget(stripToNumberString(v))}
                  placeholder={formatWithCommas(DEFAULT_BUDGET)}
                  style={{ paddingLeft: 19 }}
                />
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px" }}>
            Info of your credit cards
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
              <thead>
                <tr>
                  <th style={th}>Credit card</th>
                  <th style={th}>Balance</th>
                  <th style={th}>Minimum payment</th>
                  <th style={th}>Interest rate</th>
                </tr>
              </thead>
              <tbody>
                {cards.slice(0, visibleRows).map((card, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontSize: 12, color: "var(--text-muted)", width: 18 }}>{i + 1}.</td>
                    <td style={{ ...td, minWidth: 100 }}>
                      <TextField value={card.name} onChange={(v) => updateCard(i, "name", v)} placeholder={`Card ${i + 1}`} style={cellInputStyle} />
                    </td>
                    <td style={{ ...td, minWidth: 90 }}>
                      <DollarCell value={card.balance} onChange={(v) => updateCard(i, "balance", v)} placeholder="" />
                    </td>
                    <td style={{ ...td, minWidth: 90 }}>
                      <DollarCell value={card.minPayment} onChange={(v) => updateCard(i, "minPayment", v)} placeholder="" />
                    </td>
                    <td style={{ ...td, minWidth: 80 }}>
                      <PercentCell value={card.ratePercent} onChange={(v) => updateCard(i, "ratePercent", v)} placeholder="" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 8 }}>
            {visibleRows < MAX_CARDS ? (
              <button
                type="button"
                onClick={() => setVisibleRows(MAX_CARDS)}
                style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 }}
              >
                Show more input fields
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setVisibleRows(VISIBLE_ROWS_DEFAULT)}
                style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 }}
              >
                Hide fields below
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
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
                Fill in your budget and card details, then click <strong>Calculate</strong> to see your payoff plan.
              </p>
            ) : error ? (
              <ErrorPanel message={error} />
            ) : result.isBudgetTooLow ? (
              <ErrorPanel message="Your monthly budget is less than the total of your cards' minimum payments. Increase your budget, or reduce it elsewhere, so every card's minimum can be covered — otherwise the balances will keep growing instead of shrinking." />
            ) : (
              <>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                  You can pay off your credit cards in <strong style={{ color: "var(--success)" }}>{formatPayoffLength(result.totalMonths)}</strong> if you pay back {formatCurrency(result.budget)} every month.
                  To pay off, you will need to pay a total of <strong style={{ color: "var(--success)" }}>{formatCurrency(result.totalPayments)}</strong>, within which interest is <strong style={{ color: "var(--success)" }}>{formatCurrency(result.totalInterest)}</strong>.
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

      {/* ── Payback Schedule (full width, per card) ───────────────────── */}
      {result && !result.isBudgetTooLow && (
        <div className="card" style={{ padding: 18 }}>
          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 8px" }}>
            Payback Schedule
          </p>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
            The debt avalanche method pays the highest-interest card first with every extra dollar of budget,
            while every other card gets just its own minimum payment. Once a card is paid off, its former
            payment rolls into the next highest-interest card. This schedule assumes no new charges are added
            to any of the cards.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={th}>Credit Card</th>
                  <th style={{ ...th, textAlign: "right" }}>Payoff Length</th>
                  <th style={{ ...th, textAlign: "right" }}>Total Interest</th>
                  <th style={{ ...th, textAlign: "right" }}>Total Payments</th>
                  <th style={th}>Payment Schedule</th>
                </tr>
              </thead>
              <tbody>
                {result.cards.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...td, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>#{c.id}: {c.name}</td>
                    <td style={{ ...td, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{formatPayoffLength(c.payoffMonth)}</td>
                    <td style={{ ...td, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(c.totalInterest)}</td>
                    <td style={{ ...td, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(c.totalPaid)}</td>
                    <td style={{ ...td, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.scheduleText}</td>
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
