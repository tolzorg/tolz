import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  ErrorPanel, Row, Checkbox, CostFields, MoreOptionsFields, ButtonRow, MonthlyTotalTable, SummaryTable, ScheduleSection,
} from "./MortgageResultParts";
import { linkButton, initialDates } from "./mortgageFormHelpers";
import { calculateFhaLoan, suggestedAnnualMip, convertUnit, FHA_DEFAULTS, MIP_DURATIONS } from "../../../utils/fhaLoanCalculatorEngine";
import { useRequiredFields, pickFields, withFill, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = FHA_DEFAULTS;
// Example values per unit — placeholders only.
const UNIT_EXAMPLE = {
  downPayment: { percent: D.downPayment, dollar: "17500" },
  propertyTaxes: { percent: D.propertyTaxes, dollar: "6000" },
};
// Boxes that decide whether the example applies (every visible one empty).
const MAIN_KEYS = ["price", "downPayment", "years", "rate", "upfrontMip", "annualMip"];
const OPTIONAL_KEYS = ["propertyTaxes", "homeInsurance", "hoa", "otherCosts"];
const MORE_KEYS = ["taxIncrease", "insuranceIncrease", "hoaIncrease", "otherIncrease", "extraMonthly", "extraYearly", "extraOneTime"];
const ALL_KEYS = [...MAIN_KEYS, ...OPTIONAL_KEYS, ...MORE_KEYS];
const blank = () => Object.fromEntries(ALL_KEYS.map((k) => [k, ""]));

export default function FhaLoanCalculatorTool() {
  const [v, setV] = useState(blank);
  const [downUnit, setDownUnit] = useState("percent");
  const [taxUnit, setTaxUnit] = useState("percent");
  const [mipDuration, setMipDuration] = useState("term");
  const [includeOptionals, setIncludeOptionals] = useState(true);
  const [moreOptions, setMoreOptions] = useState(false);
  const [showBiweekly, setShowBiweekly] = useState(true);
  const [dates, setDates] = useState(initialDates);
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");

  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const setDate = (key) => (value) => setDates((p) => ({ ...p, [key]: value }));

  // Like the reference, changing the price, down payment or term refills the
  // MIP rates with the 2026 FHA schedule (blank boxes use their examples).
  const refillMip = (next, unit) => {
    const pick = (k) => next[k] || (k === "downPayment" ? UNIT_EXAMPLE.downPayment[unit] : D[k]);
    return { ...next, upfrontMip: "1.75", annualMip: String(suggestedAnnualMip(pick("price"), pick("downPayment"), unit, pick("years"))) };
  };
  const setLoanField = (key) => (value) => setV((p) => refillMip({ ...p, [key]: value }, downUnit));

  const changeUnit = (field, unit, setUnit) => {
    const price = v.price || D.price;
    setV((p) => {
      const next = { ...p, [field]: p[field] === "" ? "" : convertUnit(p[field], price, unit) };
      return field === "downPayment" ? refillMip(next, unit) : next;
    });
    setUnit(unit);
  };

  const visibleKeys = [...MAIN_KEYS, ...(includeOptionals ? OPTIONAL_KEYS : []), ...(moreOptions ? MORE_KEYS : [])];
  const req = useRequiredFields();
  const calculate = () => {
    const examples = { ...D, downPayment: UNIT_EXAMPLE.downPayment[downUnit], propertyTaxes: UNIT_EXAMPLE.propertyTaxes[taxUnit] };
    setResult(req.evaluate(pickFields(v, visibleKeys), (fill) => calculateFhaLoan({ ...withFill(v, examples, fill), ...dates, downUnit, taxUnit, mipDuration, includeOptionals, moreOptions, showBiweekly })));
    setView("annual");
  };
  const clear = () => {
    req.clear(); setV(blank()); setDownUnit("percent"); setTaxUnit("percent"); setMipDuration("term");
    setIncludeOptionals(true); setShowBiweekly(true); setDates(initialDates()); setResult(null);
  };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ── */}
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 16 }}>
          <Row label="Home Price"><Req name="price" flagged={req.flagged}><DollarField value={v.price} onChange={setLoanField("price")} placeholder={D.price} /></Req></Row>
          <Row label="Down Payment">
            <Req name="downPayment" flagged={req.flagged}><ValueUnitField
              value={v.downPayment} unit={downUnit} placeholder={UNIT_EXAMPLE.downPayment[downUnit]}
              onValueChange={setLoanField("downPayment")} onUnitChange={(u) => changeUnit("downPayment", u, setDownUnit)}
            /></Req>
          </Row>
          <Row label="Loan Term" suffix="years"><Req name="years" flagged={req.flagged}><TextField value={v.years} onChange={setLoanField("years")} placeholder={D.years} /></Req></Row>
          <Row label="Interest Rate"><Req name="rate" flagged={req.flagged}><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Req></Row>
          <Row label="Upfront FHA MIP"><Req name="upfrontMip" flagged={req.flagged}><PercentField value={v.upfrontMip} onChange={set("upfrontMip")} placeholder={D.upfrontMip} /></Req></Row>
          <Row label="Annual FHA MIP"><Req name="annualMip" flagged={req.flagged}><PercentField value={v.annualMip} onChange={set("annualMip")} placeholder={D.annualMip} /></Req></Row>
          <Row label="Annual FHA MIP Duration">
            <SelectField value={mipDuration} onChange={setMipDuration} options={MIP_DURATIONS} style={{ width: "100%" }} />
          </Row>

          <Checkbox checked={includeOptionals} onChange={setIncludeOptionals}>Include Optionals Below</Checkbox>
          {includeOptionals && (
            <CostFields flagged={req.flagged}
              v={v} set={set} taxUnit={taxUnit} taxPlaceholder={UNIT_EXAMPLE.propertyTaxes[taxUnit]}
              onTaxUnit={(u) => changeUnit("propertyTaxes", u, setTaxUnit)} dates={dates} setDate={setDate} defaults={D}
            />
          )}

          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <button type="button" style={linkButton} onClick={() => setMoreOptions((m) => !m)} aria-expanded={moreOptions}>
              {moreOptions ? "– Fewer Options" : "+ More Options"}
            </button>
          </div>
          {moreOptions && <MoreOptionsFields v={v} set={set} dates={dates} setDate={setDate} showBiweekly={showBiweekly} setShowBiweekly={setShowBiweekly} />}

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        {/* ── Results ── */}
        <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {ok ? `Monthly Pay: ${result.monthlyPay}` : "Result"}
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the home and loan details, then click Calculate to see your FHA payment.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                {result.sentence && <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>{result.sentence}</p>}
                {result.table && <MonthlyTotalTable result={result} />}
                {/* Small slices crowd the ring, so the legend carries every percentage. */}
                <InvestmentPieChart
                  segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${Math.round((p.value / pieTotal) * 100)}%)` }))}
                  labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                />
                <SummaryTable rows={result.summary} />
                {result.biweekly && <SummaryTable title={result.biweekly.title} rows={result.biweekly.rows} />}
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.schedule && <ScheduleSection schedule={result.schedule} view={view} setView={setView} idPrefix="fha" />}
    </div>
  );
}
