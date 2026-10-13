import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateProfitMargin, calculateStockMargin, calculateCurrencyMargin,
  PROFIT_DEFAULTS, STOCK_DEFAULTS, CURRENCY_DEFAULTS, MARGIN_RATIO_OPTIONS,
} from "../../../utils/marginCalculatorEngine";

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const sectionText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" };
const defsStyle = { fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "12px 0 0" };
const PIE_COLORS = { Cost: "#2b7ddb", "Profit margin": "#8bbc21" };

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

function ButtonRow({ onCalculate, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
      <button type="button" onClick={onCalculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

/** Shared section shell: title, intro, inputs card, result card, definitions. */
function CalculatorSection({ id, title, intro, inputs, result, definitions }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} style={sectionTitle}>{title}</h2>
      <p style={sectionText}>{intro}</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 18 }}>{inputs}</div>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{result}</div>
        </div>
      </div>
      <div style={defsStyle}>
        {definitions.map(([term, text]) => (
          <div key={term}><strong style={{ color: "var(--text-primary)" }}>{term}:</strong> {text}</div>
        ))}
      </div>
    </section>
  );
}

const placeholderNote = (text) => <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>{text}</p>;
const amountLine = (amount) => (
  <p style={{ fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
    Amount required: <strong style={{ color: "var(--success)" }}>{amount}</strong>
  </p>
);

/* ── 1. Profit Margin ───────────────────────────────────────────── */

function ProfitMarginCalculator() {
  const EMPTY = { cost: "", revenue: "", margin: "", profit: "" };
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  // Which boxes are blank decides what gets solved, so the example (cost
  // and revenue) is used only while every box is empty.
  const calculate = () => setResult(calculateProfitMargin(Object.values(v).every((x) => x === "") ? PROFIT_DEFAULTS : v));

  let body;
  if (!result) body = placeholderNote("Enter any two of cost, revenue, margin, and profit, then click Calculate.");
  else if (result.errors) body = <ErrorPanel messages={result.errors} />;
  else if (result.empty) body = null;
  else {
    body = (
      <>
        <table style={{ borderCollapse: "collapse", marginBottom: 6 }}>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label}>
                <td style={{ fontSize: 15, padding: "3px 18px 3px 0", color: "var(--text-primary)", fontWeight: r.strong ? 700 : 400 }}>{r.label}:</td>
                <td style={{ fontSize: 15, padding: "3px 0", textAlign: "right", color: "var(--text-primary)", fontWeight: r.strong ? 700 : 400 }}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.pie && (
          <InvestmentPieChart
            segments={result.pie.map((s) => ({ ...s, color: PIE_COLORS[s.label] }))}
            labelText={(segment) => `${segment.percent}%`}
          />
        )}
      </>
    );
  }

  return (
    <CalculatorSection
      id="margin-profit-title"
      title="Profit Margin Calculator"
      intro="Calculate the profit margin of making, trading products, or doing business in general. Please provide any two of the following to calculate the rest values."
      inputs={(
        <>
          <FieldRow label="Cost"><DollarField value={v.cost} onChange={set("cost")} placeholder={PROFIT_DEFAULTS.cost} /></FieldRow>
          <FieldRow label="Revenue"><DollarField value={v.revenue} onChange={set("revenue")} placeholder={PROFIT_DEFAULTS.revenue} /></FieldRow>
          <FieldRow label="Margin"><PercentField value={v.margin} onChange={set("margin")} /></FieldRow>
          <FieldRow label="Profit"><DollarField value={v.profit} onChange={set("profit")} /></FieldRow>
          <ButtonRow onCalculate={calculate} onClear={() => { setV(EMPTY); setResult(null); }} />
        </>
      )}
      result={body}
      definitions={[
        ["Cost", "The cost of the product."],
        ["Revenue", "The income generated by selling the product."],
        ["Profit", "The money left after deducting cost from revenue."],
        ["Margin", "The percentage of profit vs. revenue."],
        ["Markup", "The percentage of profit vs. cost."],
      ]}
    />
  );
}

/* ── 2. Stock Trading Margin ────────────────────────────────────── */

function StockMarginCalculator() {
  const EMPTY = { price: "", shares: "", requirement: "" };
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const calculate = () => setResult(calculateStockMargin(Object.fromEntries(Object.keys(v).map((k) => [k, v[k] || STOCK_DEFAULTS[k]]))));

  return (
    <CalculatorSection
      id="margin-stock-title"
      title="Stock Trading Margin Calculator"
      intro="Calculate the required amount or maintenance margin needed for investors to make securities purchase on margin."
      inputs={(
        <>
          <FieldRow label="Stock price"><DollarField value={v.price} onChange={set("price")} placeholder={STOCK_DEFAULTS.price} /></FieldRow>
          <FieldRow label="Number of shares"><TextField value={v.shares} onChange={set("shares")} placeholder={STOCK_DEFAULTS.shares} /></FieldRow>
          <FieldRow label="Margin requirement"><PercentField value={v.requirement} onChange={set("requirement")} placeholder={STOCK_DEFAULTS.requirement} /></FieldRow>
          <ButtonRow onCalculate={calculate} onClear={() => { setV(EMPTY); setResult(null); }} />
        </>
      )}
      result={!result ? placeholderNote("Enter the stock price, number of shares, and margin requirement, then click Calculate.")
        : result.errors ? <ErrorPanel messages={result.errors} /> : amountLine(result.amount)}
      definitions={[
        ["Stock price", "The per-share stock price."],
        ["Number of shares", "The number of shares you want to purchase."],
        ["Margin requirement", "The percentage required by the broker to make the margin purchase."],
        ["Amount required", "The minimum amount required in your account to purchase."],
      ]}
    />
  );
}

/* ── 3. Currency Exchange Margin ────────────────────────────────── */

function CurrencyMarginCalculator() {
  const [rate, setRate] = useState("");
  const [ratio, setRatio] = useState(CURRENCY_DEFAULTS.ratio);
  const [units, setUnits] = useState("");
  const [result, setResult] = useState(null);
  const calculate = () => setResult(calculateCurrencyMargin({ rate: rate || CURRENCY_DEFAULTS.rate, ratio, units: units || CURRENCY_DEFAULTS.units }));

  return (
    <CalculatorSection
      id="margin-currency-title"
      title="Currency Exchange Margin Calculator"
      intro="Calculate the minimum amount to maintain in the margin account to make currency trading."
      inputs={(
        <>
          <FieldRow label="Exchange rate"><TextField value={rate} onChange={setRate} placeholder={CURRENCY_DEFAULTS.rate} /></FieldRow>
          <FieldRow label="Margin ratio"><SelectField value={ratio} onChange={setRatio} options={MARGIN_RATIO_OPTIONS} style={{ flex: 1, minWidth: 0 }} /></FieldRow>
          <FieldRow label="Units"><TextField value={units} onChange={setUnits} placeholder={CURRENCY_DEFAULTS.units} /></FieldRow>
          <ButtonRow onCalculate={calculate} onClear={() => { setRate(""); setUnits(""); setRatio(CURRENCY_DEFAULTS.ratio); setResult(null); }} />
        </>
      )}
      result={!result ? placeholderNote("Enter the exchange rate, margin ratio, and units, then click Calculate.")
        : result.errors ? <ErrorPanel messages={result.errors} /> : amountLine(result.amount)}
      definitions={[
        ["Exchange rate", "The exchange rate of the currency to purchase in your home currency. For example, if you plan to purchase 100 EUR and your home currency is USD. In the currency market, 1 EUR = 1.22 USD, then the exchange rate is 1.22."],
        ["Margin ratio", "The ratio of margin to use."],
        ["Units", "The amount of currency to purchase."],
        ["Amount required", "The amount required in your home currency to make the purchase."],
      ]}
    />
  );
}

export default function MarginCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <ProfitMarginCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <StockMarginCalculator />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <CurrencyMarginCalculator />
    </div>
  );
}
