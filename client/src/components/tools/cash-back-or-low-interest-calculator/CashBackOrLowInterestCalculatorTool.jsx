import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import {
  calculateCashBackOrLowInterest, DEFAULTS, US_STATES,
} from "../../../utils/cashBackOrLowInterestEngine";
import { formatMoney } from "../../../utils/simpleInterestCalculatorEngine";

const STATE_OPTIONS = [{ value: "", label: "-- Select --" }, ...US_STATES.map((s) => ({ value: s, label: s }))];

const groupHeader = { background: "#336699", color: "#fff", padding: "7px 10px", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)", borderRadius: "var(--radius-sm)", margin: "0 0 10px" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionBar = { background: "var(--accent-light)", padding: "6px 10px", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: "12px 0 0" };
const cell = { fontSize: 13.5, color: "var(--text-primary)" };

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

function OfferTable({ title, offer, termText }) {
  const rows = [
    ["Total Loan Amount", offer.loan],
    ...(offer.tax !== 0 ? [["Sale Tax", offer.tax]] : []),
    ["Upfront Payment", offer.upfront],
    ["Monthly Pay", offer.monthly, true],
    [`Total of ${termText} Loan Payments`, offer.totalPayments],
    ["Total Loan Interest", offer.interest],
    ["Total Cost (price, interest, tax, fees)", offer.totalCost],
  ];
  return (
    <>
      <div style={sectionBar}>{title}</div>
      <table className="data-table" style={{ width: "100%" }}>
        <tbody>
          {rows.map(([label, value, strong]) => (
            <tr key={label}>
              <td style={{ ...cell, fontWeight: strong ? 700 : 400 }}>{label}</td>
              <td style={{ ...cell, textAlign: "right", fontWeight: strong ? 700 : 400, whiteSpace: "nowrap" }}>{formatMoney(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function CashBackOrLowInterestCalculatorTool() {
  const [v, setV] = useState({
    cashBack: "", rateHigh: "", rateLow: "", price: "", term: "", downPayment: "", tradeIn: "", taxRate: "", fees: "",
  });
  const [state, setState] = useState("");
  const [includeFees, setIncludeFees] = useState(false);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  function calculate() {
    const filled = Object.fromEntries(Object.keys(v).map((k) => [k, v[k] || DEFAULTS[k]]));
    setResult(calculateCashBackOrLowInterest({ ...filled, state, includeFees }));
  }

  function clear() {
    setV(Object.fromEntries(Object.keys(v).map((k) => [k, ""])));
    setState(""); setIncludeFees(false); setResult(null);
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ─────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 340px", minWidth: 300, padding: 16 }}>
        <p style={groupHeader}>Cash Back Offer</p>
        <FieldRow label="Cash Back Amount"><DollarField value={v.cashBack} onChange={set("cashBack")} placeholder={DEFAULTS.cashBack} /></FieldRow>
        <FieldRow label="Interest Rate (High)"><PercentField value={v.rateHigh} onChange={set("rateHigh")} placeholder={DEFAULTS.rateHigh} /></FieldRow>

        <p style={{ ...groupHeader, marginTop: 16 }}>Low Interest Rate Offer</p>
        <FieldRow label="Interest Rate (Low)"><PercentField value={v.rateLow} onChange={set("rateLow")} placeholder={DEFAULTS.rateLow} /></FieldRow>

        <p style={{ ...groupHeader, marginTop: 16 }}>Other Information</p>
        <FieldRow label="Auto Price"><DollarField value={v.price} onChange={set("price")} placeholder={DEFAULTS.price} /></FieldRow>
        <FieldRow label="Loan Term" suffix="months"><TextField value={v.term} onChange={set("term")} placeholder={DEFAULTS.term} /></FieldRow>
        <FieldRow label="Down Payment"><DollarField value={v.downPayment} onChange={set("downPayment")} placeholder={DEFAULTS.downPayment} /></FieldRow>
        <FieldRow label="Trade-in Value"><DollarField value={v.tradeIn} onChange={set("tradeIn")} placeholder={DEFAULTS.tradeIn} /></FieldRow>
        <FieldRow label="Your State"><SelectField value={state} onChange={setState} options={STATE_OPTIONS} style={{ flex: 1, minWidth: 0 }} /></FieldRow>
        <FieldRow label="Sales Tax"><PercentField value={v.taxRate} onChange={set("taxRate")} placeholder={DEFAULTS.taxRate} /></FieldRow>
        <FieldRow label="Title, Registration and Other Fees"><DollarField value={v.fees} onChange={set("fees")} placeholder={DEFAULTS.fees} /></FieldRow>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer", margin: "4px 0 0" }}>
          <input type="checkbox" checked={includeFees} onChange={(e) => setIncludeFees(e.target.checked)} />
          Include All Fees in Loan
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 380px", minWidth: 300, padding: 0, overflow: "hidden" }}>
        <div style={resultBanner}>Results</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Enter both offers and the car's details, then click <strong>Calculate</strong> to see which deal costs less.
            </p>
          ) : result.errors ? (
            <ErrorPanel messages={result.errors} />
          ) : result.note ? (
            <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>{result.note}</p>
          ) : (
            <>
              <div style={{ background: "var(--accent-light)", padding: "6px 10px", fontWeight: 700, fontSize: 14.5, color: "#dc2626" }}>
                {result.headline}
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "8px 0 0" }}>{result.sentence}</p>
              <OfferTable title="With Cash Back Offer" offer={result.cashBackOffer} termText={result.termText} />
              <OfferTable title="With Low Interest Rate Offer" offer={result.lowRateOffer} termText={result.termText} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
