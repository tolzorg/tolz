import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import {
  calculateAutoLease, convertRateText, formatPercent2, DEFAULTS, RATE_TYPE_OPTIONS,
} from "../../../utils/autoLeaseCalculatorEngine";
import { formatMoney } from "../../../utils/simpleInterestCalculatorEngine";

// Tooltip text copied from the reference's own "?" icons.
const HINTS = {
  tradeIn: "The amount that a dealership will offer for your current vehicle when you trade it in as a partial payment towards the vehicle you want to purchase or lease.",
  taxRate: "The tax that is imposed by the state or local government. This tax is usually calculated as a percentage of the total purchase price and varies based on location.",
  residual: "Residual value is an estimation of the worth of the vehicle at the end of the lease period. Financial institutions that issue lease contracts, not the dealers, set residual values on vehicles. Sometimes, it is also called the lease-end value.",
};

const TABS = [["price", "Total Price"], ["payment", "Monthly Payment"]];
const EMPTY = { price: "", monthlyPay: "", term: "", rate: "", downPayment: "", tradeIn: "", taxRate: "", residual: "" };

const cell = { fontSize: 13.5, color: "var(--text-primary)" };
const noteStyle = { fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "12px 0 0" };

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

function ResultRows({ rows, indent }) {
  return rows.map(([label, value]) => (
    <tr key={label}>
      <td style={{ ...cell, paddingLeft: indent ? 20 : undefined }}>{label}</td>
      <td style={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>{value}</td>
    </tr>
  ));
}

function LeaseResults({ result }) {
  const { lease: L, purchase: P, termText } = result;
  const leaseRows = [
    ["Monthly Depreciation", formatMoney(L.depreciation)],
    ["Monthly Interest", formatMoney(L.interest)],
    ["Monthly Tax", formatMoney(L.monthlyTax)],
    ...(L.apr !== null ? [["Money Factor Equivalent APR", formatPercent2(L.apr)]] : []),
    ["Down Payment", formatMoney(L.downPayment)],
    ...(L.upfrontTax !== null ? [["Upfront Tax", formatMoney(L.upfrontTax)]] : []),
    [`Total ${termText} Lease Payments`, formatMoney(L.totalPayments)],
    ["Total Cost to Own After Lease Ends", formatMoney(L.costToOwn)],
  ];
  const purchaseRows = [
    ["Monthly Payment", formatMoney(P.monthlyPayment)],
    ...(P.saleTax !== null ? [["Sale Tax", formatMoney(P.saleTax)]] : []),
    ["Upfront Payment", formatMoney(P.upfrontPayment)],
    ["Total Loan Amount", formatMoney(P.loanAmount)],
    [`Total of ${termText} Loan Payments`, formatMoney(P.totalPayments)],
    ["Total Loan Interest", formatMoney(P.interest)],
    ["Total Cost to Own", formatMoney(P.costToOwn)],
  ];
  return (
    <>
      <table className="data-table" style={{ width: "100%" }}>
        <tbody><ResultRows rows={leaseRows} /></tbody>
      </table>
      <table className="data-table" style={{ width: "100%", marginTop: 14 }}>
        <thead>
          <tr>
            <th colSpan={2} style={{ background: "var(--bg-muted)", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", padding: "7px 10px" }}>
              If purchased under the same conditions
            </th>
          </tr>
        </thead>
        <tbody><ResultRows rows={purchaseRows} indent /></tbody>
      </table>
      <p style={noteStyle}>
        *Documentation, tag, title, and registration fees are the same for both leases and purchases. They are not
        included in the calculated results above. Car dealers might ask for acquisition, security deposit, and
        disposition fees; these are normally associated with car leases, not car purchases.
      </p>
      <p style={noteStyle}>
        The "Total Cost to Own After Lease Ends" and "Total Cost to Own" calculations given by the calculator above may
        not result in a large difference due to the assumption that all conditions are the same. However, in real life,
        car lease conditions are normally less favorable to consumers. For example, auto leases tend to have some extra
        costs such as acquisition fee, security deposit, and disposition fee. In addition, interest rates are normally
        higher for car leasing. Generally speaking, when added together, it can cost a few thousand dollars more to lease
        rather than buy.
      </p>
    </>
  );
}

export default function AutoLeaseCalculatorTool() {
  const [tab, setTab] = useState("price");
  const [rateType, setRateType] = useState("moneyfactor");
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const ratePlaceholder = rateType === "moneyfactor" ? DEFAULTS.moneyFactor : DEFAULTS.interestRate;

  function run(mode) {
    const fallback = { ...DEFAULTS, rate: ratePlaceholder };
    const filled = Object.fromEntries(Object.keys(v).map((k) => [k, v[k] || fallback[k]]));
    setResult(calculateAutoLease({ ...filled, mode, rateType }));
  }

  // Like the reference, switching tabs recalculates in the new mode.
  function switchTab(next) {
    setTab(next);
    run(next);
  }

  // Switching Money Factor ⇄ Interest Rate converts the typed value (×/÷ 2400).
  function changeRateType(next) {
    if (next === rateType) return;
    setRateType(next);
    if (v.rate) setV((prev) => ({ ...prev, rate: convertRateText(prev.rate, next) }));
  }

  function clear() {
    setV(EMPTY);
    setResult(null);
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ─────────────────────────────────────────────────── */}
      <div style={{ flex: "1 1 340px", minWidth: 300 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
          >
            Print
          </button>
        </div>

        <div role="tablist" aria-label="Calculate from" style={{ display: "flex", marginBottom: -1 }}>
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => switchTab(key)}
              style={{
                flex: 1, padding: "11px 0", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)",
                cursor: "pointer", border: "1px solid var(--border)", borderBottom: tab === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                borderTopLeftRadius: key === "price" ? "var(--radius-md)" : 0,
                borderTopRightRadius: key === "payment" ? "var(--radius-md)" : 0,
                background: tab === key ? "var(--accent)" : "var(--bg-white)",
                color: tab === key ? "#fff" : "var(--text-primary)",
                position: "relative", zIndex: tab === key ? 1 : 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          {tab === "price" ? (
            <FieldRow label="Auto Price"><DollarField value={v.price} onChange={set("price")} placeholder={DEFAULTS.price} /></FieldRow>
          ) : (
            <FieldRow label="Monthly Pay"><DollarField value={v.monthlyPay} onChange={set("monthlyPay")} placeholder={DEFAULTS.monthlyPay} /></FieldRow>
          )}
          <FieldRow label="Lease Term" suffix="months">
            <TextField value={v.term} onChange={set("term")} placeholder={DEFAULTS.term} />
          </FieldRow>
          {/* Same layout as FieldRow, but the label slot holds the rate-type
              menu, which must be able to shrink on narrow screens. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <SelectField
                value={rateType}
                onChange={changeRateType}
                options={RATE_TYPE_OPTIONS}
                style={{ width: "100%", maxWidth: 150, fontSize: 12, fontWeight: 600, paddingLeft: 6, paddingRight: 4 }}
              />
            </div>
            <div style={{ flex: "0 1 180px", minWidth: 140, display: "flex" }}>
              {rateType === "moneyfactor" ? (
                <TextField value={v.rate} onChange={set("rate")} placeholder={ratePlaceholder} />
              ) : (
                <PercentField value={v.rate} onChange={set("rate")} placeholder={ratePlaceholder} />
              )}
            </div>
          </div>
          <FieldRow label="Down Payment"><DollarField value={v.downPayment} onChange={set("downPayment")} placeholder={DEFAULTS.downPayment} /></FieldRow>
          <FieldRow label="Trade-in Value" hint={HINTS.tradeIn}><DollarField value={v.tradeIn} onChange={set("tradeIn")} placeholder={DEFAULTS.tradeIn} /></FieldRow>
          <FieldRow label="Sales Tax" hint={HINTS.taxRate}><PercentField value={v.taxRate} onChange={set("taxRate")} placeholder={DEFAULTS.taxRate} /></FieldRow>
          <FieldRow label="Residual Value" hint={HINTS.residual}><DollarField value={v.residual} onChange={set("residual")} placeholder={DEFAULTS.residual} /></FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={() => run(tab)} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 380px", minWidth: 300, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {(result && !result.errors ? result.headlineLabel : tab === "price" ? "Monthly Lease Payment" : "Vehicle Price")}:
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
            {result && !result.errors ? formatMoney(result.headlineValue) : "$0.00"}
          </span>
        </div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in the lease details and click <strong>Calculate</strong> to see your monthly lease payment, the full
              breakdown, and what the same car would cost if you bought it instead.
            </p>
          ) : result.errors ? (
            <ErrorPanel messages={result.errors} />
          ) : (
            <LeaseResults result={result} />
          )}
        </div>
      </div>
    </div>
  );
}
