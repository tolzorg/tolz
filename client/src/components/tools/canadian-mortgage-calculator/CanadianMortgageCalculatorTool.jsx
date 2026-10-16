import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { MonthYearField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { ErrorPanel, Row, Checkbox, ButtonRow, MonthlyTotalTable, SummaryTable, ScheduleSection } from "../fha-loan-calculator/MortgageResultParts";
import { thisMonthYear } from "../fha-loan-calculator/mortgageFormHelpers";
import { calculateCanadianMortgage, CA_DEFAULTS } from "../../../utils/canadianMortgageCalculatorEngine";

const D = CA_DEFAULTS;
// Boxes that decide whether the example applies (every visible one empty).
const MAIN_KEYS = ["price", "downPayment", "years", "rate"];
const OPTIONAL_KEYS = ["propertyTaxes", "homeInsurance", "mortgageInsurance", "hoa", "otherCosts"];
const blank = () => Object.fromEntries([...MAIN_KEYS, ...OPTIONAL_KEYS].map((k) => [k, ""]));
const bar = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };

export default function CanadianMortgageCalculatorTool() {
  const [v, setV] = useState(blank);
  const [includeOptionals, setIncludeOptionals] = useState(true);
  const [start, setStart] = useState(thisMonthYear);
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const calculate = () => {
    const visible = [...MAIN_KEYS, ...(includeOptionals ? OPTIONAL_KEYS : [])];
    const values = visible.every((k) => v[k] === "") ? D : v;
    setResult(calculateCanadianMortgage({ ...values, includeOptionals, startMonth: start.month, startYear: start.year }));
    setView("annual");
  };
  const clear = () => { setV(blank()); setIncludeOptionals(true); setStart(thisMonthYear()); setResult(null); };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + p.value, 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The Canadian Mortgage Calculator is mainly intended for Canadian residents and uses the Canadian dollar as currency, with interest
        rate compounded semi-annually.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ── */}
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Home Price"><DollarField value={v.price} onChange={set("price")} placeholder={D.price} /></Row>
          <Row label="Down Payment"><PercentField value={v.downPayment} onChange={set("downPayment")} placeholder={D.downPayment} /></Row>
          <Row label="Loan Term" suffix="years"><TextField value={v.years} onChange={set("years")} placeholder={D.years} /></Row>
          <Row label="Interest Rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Row>

          <Checkbox checked={includeOptionals} onChange={setIncludeOptionals}>Include Optionals Below</Checkbox>
          {includeOptionals && (
            <>
              <Row label="Property Taxes"><PercentField value={v.propertyTaxes} onChange={set("propertyTaxes")} placeholder={D.propertyTaxes} /></Row>
              <Row label="Home Insurance" suffix="/year"><DollarField value={v.homeInsurance} onChange={set("homeInsurance")} placeholder={D.homeInsurance} /></Row>
              <Row label="Mortgage Insurance" suffix="/year"><DollarField value={v.mortgageInsurance} onChange={set("mortgageInsurance")} placeholder={D.mortgageInsurance} /></Row>
              <Row label="Condo/HOA Fee" suffix="/year"><DollarField value={v.hoa} onChange={set("hoa")} placeholder={D.hoa} /></Row>
              <Row label="Other Costs" suffix="/year"><DollarField value={v.otherCosts} onChange={set("otherCosts")} placeholder={D.otherCosts} /></Row>
              <Row label="Start Date">
                <MonthYearField
                  month={start.month} year={start.year}
                  onMonthChange={(month) => setStart((p) => ({ ...p, month }))} onYearChange={(year) => setStart((p) => ({ ...p, year }))}
                />
              </Row>
            </>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        {/* ── Results ── */}
        <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={bar}>{ok ? `Monthly Pay: ${result.monthlyPay}` : "Result"}</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the home and loan details, then click Calculate to see your monthly payment.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                {result.table && <MonthlyTotalTable result={{ ...result, firstColumn: "Monthly" }} />}
                {/* Small slices crowd the ring, so the legend carries every percentage. */}
                <InvestmentPieChart
                  segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${pieTotal ? Math.round((p.value / pieTotal) * 100) : 0}%)` }))}
                  labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                />
                <SummaryTable rows={result.summary} />
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.schedule && <ScheduleSection schedule={result.schedule} view={view} setView={setView} idPrefix="ca-mortgage" />}
    </div>
  );
}
