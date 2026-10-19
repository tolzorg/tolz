import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { MonthYearField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { ErrorPanel, Row, Checkbox, ButtonRow, MonthlyTotalTable, SummaryTable, ScheduleSection } from "../fha-loan-calculator/MortgageResultParts";
import { thisMonthYear } from "../fha-loan-calculator/mortgageFormHelpers";
import { calculateMortgageAmortization, AMORTIZATION_DEFAULTS } from "../../../utils/mortgageAmortizationCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = AMORTIZATION_DEFAULTS;
// Boxes that decide whether the example applies (every visible one empty).
const MAIN_KEYS = ["price", "downPayment", "years", "rate"];
const OPTIONAL_KEYS = ["propertyTaxes", "homeInsurance", "mortgageInsurance", "hoa", "otherCosts"];
const blank = () => Object.fromEntries([...MAIN_KEYS, ...OPTIONAL_KEYS].map((k) => [k, ""]));
const bar = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };

export default function MortgageAmortizationCalculatorTool() {
  const [v, setV] = useState(blank);
  const [includeOptionals, setIncludeOptionals] = useState(true);
  const [start, setStart] = useState(thisMonthYear);
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const req = useRequiredFields();

  const calculate = () => {
    const visible = [...MAIN_KEYS, ...(includeOptionals ? OPTIONAL_KEYS : [])];
    setResult(req.evaluate(pickFields(v, visible), (fill) => calculateMortgageAmortization({ ...withFill(v, D, fill), includeOptionals, startMonth: start.month, startYear: start.year })));
    setView("annual");
  };
  const clear = () => { req.clear(); setV(blank()); setIncludeOptionals(true); setStart(thisMonthYear()); setResult(null); };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + p.value, 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The Mortgage Amortization Calculator provides an annual or monthly amortization schedule of a mortgage loan. It also calculates the
        monthly payment amount and determines the portion of one&apos;s payment going to interest. Having such knowledge gives the borrower a
        better idea of how each payment affects a loan. It also shows how fast the overall debt falls at a given time.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ── */}
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Home Price"><Req name="price" flagged={req.flagged}><DollarField value={v.price} onChange={set("price")} placeholder={D.price} /></Req></Row>
          <Row label="Down Payment"><Req name="downPayment" flagged={req.flagged}><PercentField value={v.downPayment} onChange={set("downPayment")} placeholder={D.downPayment} /></Req></Row>
          <Row label="Loan Term" suffix="years"><Req name="years" flagged={req.flagged}><TextField value={v.years} onChange={set("years")} placeholder={D.years} /></Req></Row>
          <Row label="Interest Rate"><Req name="rate" flagged={req.flagged}><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Req></Row>

          <Checkbox checked={includeOptionals} onChange={setIncludeOptionals}>Include Optionals Below</Checkbox>
          {includeOptionals && (
            <>
              <Row label="Property Taxes"><Req name="propertyTaxes" flagged={req.flagged}><PercentField value={v.propertyTaxes} onChange={set("propertyTaxes")} placeholder={D.propertyTaxes} /></Req></Row>
              <Row label="Home Insurance" suffix="/year"><Req name="homeInsurance" flagged={req.flagged}><DollarField value={v.homeInsurance} onChange={set("homeInsurance")} placeholder={D.homeInsurance} /></Req></Row>
              <Row label="PMI Insurance" suffix="/year"><Req name="mortgageInsurance" flagged={req.flagged}><DollarField value={v.mortgageInsurance} onChange={set("mortgageInsurance")} placeholder={D.mortgageInsurance} /></Req></Row>
              <Row label="HOA Fee" suffix="/year"><Req name="hoa" flagged={req.flagged}><DollarField value={v.hoa} onChange={set("hoa")} placeholder={D.hoa} /></Req></Row>
              <Row label="Other Costs" suffix="/year"><Req name="otherCosts" flagged={req.flagged}><DollarField value={v.otherCosts} onChange={set("otherCosts")} placeholder={D.otherCosts} /></Req></Row>
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

      {ok && result.schedule && <ScheduleSection schedule={result.schedule} view={view} setView={setView} idPrefix="mortgage-amortization" />}
    </div>
  );
}
