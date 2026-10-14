import { useState } from "react";
import { FieldLabel, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateBudget, INCOME_FIELDS, TAX_FIELD, EXPENSE_SECTIONS, ALL_FIELDS, BUDGET_DEFAULTS, BUDGET_DEFAULT_UNITS,
} from "../../../utils/budgetCalculatorEngine";

const EMPTY = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, ""]));
const UNIT_OPTIONS = [{ value: "m", label: "Month" }, { value: "y", label: "Year" }];
const GOOD = "var(--success)";
const BAD = "#dc2626";

const sectionTitle = { background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-display)", padding: "7px 10px", borderRadius: "var(--radius-sm)", margin: "4px 0 10px" };
const subTitle = { fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-display)", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", padding: "4px 0 5px", margin: "12px 0 8px" };
const resultTitle = { fontWeight: 700, fontSize: 15, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "18px 0 8px" };
// Full grid like the reference's tables: every cell bordered, labels shaded.
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", verticalAlign: "middle", border: "1px solid var(--border)", lineHeight: 1.4, textAlign: "right" };
const th = { ...td, background: "var(--bg-muted)", fontWeight: 700 };
const labelTd = { ...td, background: "var(--bg-muted)", textAlign: "left" };
const tableStyle = { borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" };

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: BAD, fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function AmountRow({ field, value, unit, onValue, onUnit }) {
  return (
    // Label beside the inputs, wrapping above them on narrow screens.
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4 }}>
        <div style={{ flex: "1 1 150px", minWidth: 0 }}><FieldLabel>{field.label}</FieldLabel></div>
        <div style={{ flex: "1 1 220px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {onUnit ? (
            <>
              <DollarField value={value} onChange={onValue} placeholder={BUDGET_DEFAULTS[field.key]} style={{ minWidth: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 13 }} aria-hidden="true">/</span>
              <SelectField value={unit} onChange={onUnit} options={UNIT_OPTIONS} style={{ flex: "0 0 92px", minWidth: 0 }} />
            </>
          ) : (
            <PercentField value={value} onChange={onValue} placeholder={BUDGET_DEFAULTS[field.key]} />
          )}
        </div>
      </div>
      {field.hint && <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "3px 0 0", textAlign: "right" }}>{field.hint}</p>}
    </div>
  );
}

function Results({ result }) {
  const netColor = result.net.good ? GOOD : BAD;
  return (
    <>
      <div style={{ overflowX: "auto", position: "relative" }}>
        <table className="data-table data-table--framed" style={tableStyle}>
          <thead>
            <tr>
              <th style={th}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Item</span></th>
              <th style={th}>Annual</th>
              <th style={th}>Monthly</th>
            </tr>
          </thead>
          <tbody>
            {result.summary.map(([label, annual, monthly]) => (
              <tr key={label}>
                <th scope="row" style={{ ...labelTd, fontWeight: 400 }}>{label}</th>
                <td style={td}><strong>{annual}</strong></td>
                <td style={td}><strong>{monthly}</strong></td>
              </tr>
            ))}
            <tr>
              <th scope="row" style={{ ...labelTd, fontWeight: 400 }}>{result.net.label}</th>
              {result.net.values.map((x, i) => <td key={i} style={td}><strong style={{ color: netColor }}>{x}</strong></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      {result.dti && (
        <>
          <p style={resultTitle}>Debt-to-Income (DTI) Ratio</p>
          <div style={{ overflowX: "auto", position: "relative" }}>
            <table className="data-table data-table--framed" style={tableStyle}>
              <tbody>
                <tr>
                  <th scope="row" style={{ ...labelTd, fontWeight: 400, whiteSpace: "nowrap" }}>DTI Ratio</th>
                  <td style={td}><strong>{result.dti.ratio}</strong></td>
                  <td style={{ ...td, textAlign: "left" }}>{result.dti.message}</td>
                </tr>
                <tr>
                  <th scope="row" style={{ ...labelTd, fontWeight: 400, whiteSpace: "nowrap" }}>Front-End DTI Ratio</th>
                  <td style={td}><strong>{result.dti.frontEnd}</strong></td>
                  <td style={{ ...td, textAlign: "left" }}>housing costs by gross income</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {result.pie && (
        <>
          <p style={resultTitle}>Expenses Breakdown</p>
          {/* Thin slices sit side by side and their ring labels collide, so the
              ring labels only slices ≥ 5% and the legend carries every percent. */}
          <InvestmentPieChart
            segments={result.pie.map((p) => ({ ...p, label: `${p.label} (${p.percent}%)` }))}
            labelText={(s, pct) => (pct >= 5 ? `${s.percent}%` : null)}
          />
        </>
      )}

      {result.breakdown && (
        <div style={{ overflowX: "auto", position: "relative", marginTop: 18 }}>
          <table className="data-table data-table--framed" style={tableStyle}>
            <thead>
              <tr>
                <th style={th}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Category</span></th>
                <th style={th}>Annual</th>
                <th style={th}>Monthly</th>
                <th style={th}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Share of income</span></th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((r) => (
                <tr key={r.label}>
                  <th scope="row" style={{ ...labelTd, fontWeight: 400 }}>{r.label}</th>
                  <td style={td}>{r.annual}</td>
                  <td style={td}>{r.monthly}</td>
                  <td style={{ ...td, textAlign: "left", fontSize: 13 }}>
                    {r.percent}
                    {r.notes.map((n) => (
                      <span key={n.text} style={{ display: "block", fontSize: 12, color: n.warn ? BAD : "var(--text-muted)" }}>{n.text}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function BudgetCalculatorTool() {
  const [values, setValues] = useState(EMPTY);
  const [units, setUnits] = useState(BUDGET_DEFAULT_UNITS);
  const [result, setResult] = useState(null);

  // The example applies only while every box is empty; otherwise a blank
  // box counts as $0, exactly as on the reference.
  const calculate = () => setResult(calculateBudget({
    values: ALL_FIELDS.every((f) => values[f.key] === "") ? BUDGET_DEFAULTS : values,
    units,
  }));
  const clear = () => { setValues(EMPTY); setUnits(BUDGET_DEFAULT_UNITS); setResult(null); };
  const row = (f) => (
    <AmountRow
      key={f.key} field={f} value={values[f.key]} unit={units[f.key]}
      onValue={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
      onUnit={f.unit ? (u) => setUnits((p) => ({ ...p, [f.key]: u })) : null}
    />
  );

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your incomes and expenses, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = <Results result={result} />;
  }

  const buttons = (
    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
      <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
        Calculate
      </button>
      <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 400px", minWidth: 280, maxWidth: 520, padding: 18 }}>
        <div style={sectionTitle}>Incomes (Before Tax)</div>
        {INCOME_FIELDS.map(row)}
        {row(TAX_FIELD)}
        <div style={{ ...sectionTitle, marginTop: 14 }}>Expenses</div>
        {EXPENSE_SECTIONS.map((s) => (
          <section key={s.title} aria-label={s.title}>
            <div style={subTitle}>{s.title}</div>
            {s.fields.map(row)}
          </section>
        ))}
        {buttons}
      </div>
      <div className="card" style={{ flex: "1 1 440px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Results</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
