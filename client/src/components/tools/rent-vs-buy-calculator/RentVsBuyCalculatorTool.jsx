import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import PensionLineChart from "../pension-calculator/PensionLineChart";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { calculateRentVsBuy, RVB_DEFAULTS, FILING_STATUSES } from "../../../utils/rentVsBuyCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = RVB_DEFAULTS;
// [key, label, kind ("dollar" | "percent" | "years"), suffix]
const GROUPS = [
  ["Home Purchase", [
    ["price", "Home price", "dollar"], ["downPayment", "Down payment", "percent"], ["rate", "Interest rate", "percent"],
    ["years", "Loan term", "years"], ["buyClosing", "Buying closing costs", "percent"], ["propertyTax", "Property tax", "percent", "/ year"],
    ["propertyTaxIncrease", "Property tax increase", "percent", "/ year"], ["insurance", "Home insurance", "dollar", "/ year"],
    ["hoa", "HOA fee", "dollar", "/ year"], ["maintenance", "Maintenance cost", "percent", "/ year"],
    ["appreciation", "Home value appreciation", "percent", "/ year"], ["costIncrease", "Cost/insurance increase", "percent", "/ year"],
    ["sellClosing", "Selling closing costs", "percent"],
  ]],
  ["Home Rent", [
    ["rent", "Monthly rental fee", "dollar"], ["rentIncrease", "Rental fee increase", "percent", "/ year"],
    ["rentInsurance", "Renter's insurance", "dollar", "/ month"], ["deposit", "Security deposit", "dollar"], ["upfront", "Upfront cost", "dollar"],
  ]],
  ["Your Information", [
    ["investReturn", "Average investment return", "percent"], ["federalTax", "Marginal federal tax rate", "percent"],
    ["stateTax", "Marginal state tax rate", "percent"],
  ]],
];
const KEYS = GROUPS.flatMap(([, fields]) => fields.map(([k]) => k));
const blank = () => Object.fromEntries(KEYS.map((k) => [k, ""]));

const groupTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14.5, color: "var(--text-primary)", margin: "4px 0 10px", paddingBottom: 6, borderBottom: "1px solid var(--border)" };
// Compact cells so all five columns fit a phone screen.
const cell = { padding: "4px 5px", fontSize: 11.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };
const head = { ...cell, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" };

function Field({ kind, value, onChange, placeholder }) {
  if (kind === "dollar") return <DollarField value={value} onChange={onChange} placeholder={placeholder} />;
  if (kind === "percent") return <PercentField value={value} onChange={onChange} placeholder={placeholder} />;
  return <TextField value={value} onChange={onChange} placeholder={placeholder} />;
}

export default function RentVsBuyCalculatorTool() {
  const [v, setV] = useState(blank);
  const [filingStatus, setFilingStatus] = useState("MarriedJoint");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const req = useRequiredFields();

  const calculate = () => {
    setResult(req.evaluate(pickFields(v, KEYS), (fill) => calculateRentVsBuy({ ...withFill(v, D, fill), filingStatus })));
  };
  const clear = () => { req.clear(); setV(blank()); setFilingStatus("MarriedJoint"); setResult(null); };
  const ok = result && !result.errors;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 16 }}>
        {GROUPS.map(([title, fields]) => (
          <fieldset key={title} style={{ border: "none", padding: 0, margin: "0 0 12px", minWidth: 0 }}>
            <legend style={{ ...groupTitle, width: "100%", padding: "0 0 6px" }}>{title}</legend>
            {fields.map(([key, label, kind, suffix]) => (
              <Row key={key} label={label} suffix={kind === "years" ? "years" : suffix}>
                <Req name={key} flagged={req.flagged}><Field kind={kind} value={v[key]} onChange={set(key)} placeholder={D[key]} /></Req>
              </Row>
            ))}
            {title === "Your Information" && (
              <Row label="Tax filing status">
                <SelectField value={filingStatus} onChange={setFilingStatus} options={FILING_STATUSES} style={{ width: "100%" }} />
              </Row>
            )}
          </fieldset>
        ))}
        <ButtonRow onCalculate={calculate} onClear={clear} />
      </div>

      <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>Result</div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
          {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the home and rent details, then click Calculate to compare the costs.</p>}
          {result?.errors && <ErrorPanel messages={result.errors} />}
          {ok && (
            <>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{result.verdict}</p>
              <PensionLineChart
                xLabel="Year"
                series={[
                  { label: "Buy", color: "#2b7ddb", points: result.chart.map((p) => ({ x: p.year, y: p.buy })) },
                  { label: "Rent", color: "#8bbc21", points: result.chart.map((p) => ({ x: p.year, y: p.rent })) },
                ]}
              />
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>The following is the average cost based on the length you stay for the next 30 years.</p>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
                  <thead>
                    <tr>
                      <th rowSpan={2} style={head}>Staying Length</th>
                      <th colSpan={2} style={head}>Average Buying Cost</th>
                      <th colSpan={2} style={head}>Average Renting Cost</th>
                    </tr>
                    <tr>{["Monthly", "Annual", "Monthly", "Annual"].map((h, i) => <th key={i} style={head}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.table.map((r) => (
                      // Shaded where buying is the cheaper choice, as on the reference.
                      <tr key={r.label} style={r.buyCheaper ? { background: "var(--bg-muted)" } : undefined}>
                        <th scope="row" style={{ ...cell, fontWeight: 400 }}>{r.label}</th>
                        <td style={cell}>{r.buyMonthly}</td><td style={cell}>{r.buyAnnual}</td>
                        <td style={cell}>{r.rentMonthly}</td><td style={cell}>{r.rentAnnual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
