import { useState } from "react";
import { Link } from "react-router-dom";
import { FieldLabel, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateDebtToIncome, INCOME_FIELDS, DEBT_FIELDS, DTI_DEFAULTS, MORTGAGE_RATE,
} from "../../../utils/debtToIncomeCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const ALL_FIELDS = [...INCOME_FIELDS, ...DEBT_FIELDS];
const EMPTY = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, ""]));
const DEFAULT_UNITS = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.unit]));
const UNIT_OPTIONS = [{ value: "m", label: "Month" }, { value: "y", label: "Year" }];
const LEVEL_COLOR = { good: "var(--success)", mid: "#e0a800", high: "#dc2626" };

const sectionTitle = { background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-display)", padding: "7px 10px", borderRadius: "var(--radius-sm)", margin: "4px 0 10px" };
// A full grid like the reference's summary table: every cell bordered, labels shaded.
const infoTd = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", verticalAlign: "middle", border: "1px solid var(--border)", lineHeight: 1.35 };
const labelTd = { background: "var(--bg-muted)", fontWeight: 400, textAlign: "left", whiteSpace: "nowrap" };

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

/** The reference's DTI bar: safe up to 35%, amber to 50%, "Very Stressful" to 100%, arrow at the ratio. */
function DtiGauge({ ratio, label }) {
  const pos = Math.max(0, Math.min(100, ratio));
  return (
    <div style={{ maxWidth: 360, width: "100%" }} aria-hidden="true">
      <div style={{ position: "relative", height: 34 }}>
        <div style={{ position: "absolute", left: `${pos}%`, bottom: 0, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          {ratio > 4 && <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>}
          <div style={{ fontSize: 14, lineHeight: 1, color: "var(--text-primary)" }}>▼</div>
        </div>
      </div>
      <div style={{ display: "flex", height: 18, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ flex: "0 0 35%", background: "#2e9e3e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>Safe</div>
        <div style={{ flex: "0 0 15%", background: "linear-gradient(90deg, #f5d000, #ffc903)" }} />
        <div style={{ flex: "1 1 auto", background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>Very Stressful</div>
      </div>
      <div style={{ position: "relative", height: 16, fontSize: 10.5, fontWeight: 700, color: "var(--text-secondary)" }}>
        <span style={{ position: "absolute", left: "35%", transform: "translateX(-50%)" }}>35%</span>
        <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>50%</span>
      </div>
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
          <DollarField value={value} onChange={onValue} placeholder={DTI_DEFAULTS[field.key]} style={{ minWidth: 0 }} />
          <span style={{ color: "var(--text-muted)", fontSize: 13 }} aria-hidden="true">/</span>
          <SelectField value={unit} onChange={onUnit} options={UNIT_OPTIONS} style={{ flex: "0 0 92px", minWidth: 0 }} />
        </div>
      </div>
      {field.hint && <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "3px 0 0", textAlign: "right" }}>{field.hint}</p>}
    </div>
  );
}

export default function DebtToIncomeCalculatorTool() {
  const [values, setValues] = useState(EMPTY);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [result, setResult] = useState(null);

  // A blank box counts as $0, exactly as on the reference; some income has to be
  // entered (flagged on the first income box). Placeholders are examples only.
  const req = useRequiredFields();
  const calculate = () => setResult(!req.require({ [INCOME_FIELDS[0].key]: INCOME_FIELDS.map((f) => values[f.key]) }) ? null : calculateDebtToIncome({
    values,
    units,
  }));
  const clear = () => { req.clear(); setValues(EMPTY); setUnits(DEFAULT_UNITS); setResult(null); };
  const row = (f) => (
    <Req key={f.key} name={f.key} flagged={req.flagged}><AmountRow
      key={f.key} field={f} value={values[f.key]} unit={units[f.key]}
      onValue={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
      onUnit={(u) => setUnits((p) => ({ ...p, [f.key]: u }))}
    /></Req>
  );

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your income and debts, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        <p style={{ fontSize: 20, color: "var(--text-primary)", margin: "0 0 14px", fontFamily: "var(--font-display)" }}>
          Debt-to-Income (DTI) Ratio: <strong style={{ color: LEVEL_COLOR[result.level] }}>{result.ratioText}</strong>.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
          {result.showGauge && <DtiGauge ratio={result.ratio} label={result.ratioText} />}
          <p style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, flex: "1 1 200px", lineHeight: 1.5 }}>{result.message}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", flex: "0 1 auto" }}>
            <tbody>
              {result.rows.map(([label, a, b]) => (
                <tr key={label}>
                  <th scope="row" style={{ ...infoTd, ...labelTd }}>{label}</th>
                  <td style={infoTd}>{a}{b && <><br />{b}</>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.pie && (
            <div style={{ flex: "1 1 260px" }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: "0 0 6px", textAlign: "center" }}>Income Breakdown</p>
              <InvestmentPieChart segments={result.pie} labelText={(s) => `${s.percent}%`} />
            </div>
          )}
        </div>
        <p style={{ fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.55, margin: "16px 0 6px" }}>{result.affordability}</p>
        {result.affordabilityNote && (
          <>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
              * The calculation is based on the assumption of using 30 years conventional loans with {MORTGAGE_RATE}% interest
              rate containing a 20% down payment and estimation of 2% spent on property tax and insurance. Please use our{" "}
              <Link to="/calculators/financial/house-affordability-calculator" style={{ color: "var(--accent)" }}>House Affordability Calculator</Link> for other variations.
            </p>
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 400px", minWidth: 280, maxWidth: 520, padding: 18 }}>
        <div style={sectionTitle}>Incomes (Before Tax)</div>
        {INCOME_FIELDS.map(row)}
        <div style={{ ...sectionTitle, marginTop: 14 }}>Debts / Expenses</div>
        {DEBT_FIELDS.map(row)}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>
      <div className="card" style={{ flex: "1 1 400px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Results</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
