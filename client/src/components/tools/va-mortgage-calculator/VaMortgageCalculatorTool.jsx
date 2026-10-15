import { useState } from "react";
import { TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  ErrorPanel, Row, CostFields, MoreOptionsFields, ButtonRow, MonthlyTotalTable, SummaryTable, ScheduleSection,
} from "../fha-loan-calculator/MortgageResultParts";
import { linkButton, initialDates } from "../fha-loan-calculator/mortgageFormHelpers";
import { calculateVaMortgage, VA_DEFAULTS, ELIGIBILITY } from "../../../utils/vaMortgageCalculatorEngine";
import { convertUnit } from "../../../utils/fhaLoanCalculatorEngine";

const D = VA_DEFAULTS;
// Example values per unit — placeholders only.
const UNIT_EXAMPLE = {
  downPayment: { percent: D.downPayment, dollar: "0" },
  propertyTaxes: { percent: D.propertyTaxes, dollar: "6000" },
};
// Boxes that decide whether the example applies (every visible one empty).
const MAIN_KEYS = ["price", "downPayment", "years", "rate"];
const MORE_KEYS = ["propertyTaxes", "homeInsurance", "hoa", "otherCosts", "taxIncrease", "insuranceIncrease", "hoaIncrease", "otherIncrease", "extraMonthly", "extraYearly", "extraOneTime"];
const ALL_KEYS = [...MAIN_KEYS, ...MORE_KEYS];
const blank = () => Object.fromEntries(ALL_KEYS.map((k) => [k, ""]));
const YES_NO = [{ value: "y", label: "Yes" }, { value: "n", label: "No" }];

function RadioGroup({ legend, name, options, value, onChange, inline }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: "0 0 10px", minWidth: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", padding: 0, marginBottom: 4 }}>{legend}</legend>
      <div style={{ display: "flex", flexDirection: inline ? "row" : "column", gap: inline ? 18 : 4, paddingLeft: 4 }}>
        {options.map((o) => (
          <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function VaMortgageCalculatorTool() {
  const [v, setV] = useState(blank);
  const [downUnit, setDownUnit] = useState("percent");
  const [taxUnit, setTaxUnit] = useState("percent");
  const [eligibility, setEligibility] = useState("v");
  const [usedBefore, setUsedBefore] = useState("n");
  const [disabled, setDisabled] = useState("n");
  const [feeOption, setFeeOption] = useState("f");
  const [moreOptions, setMoreOptions] = useState(false);
  const [showBiweekly, setShowBiweekly] = useState(true);
  const [dates, setDates] = useState(initialDates);
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");

  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const setDate = (key) => (value) => setDates((p) => ({ ...p, [key]: value }));
  const changeUnit = (field, unit, setUnit) => {
    const price = v.price || D.price;
    setV((p) => ({ ...p, [field]: p[field] === "" ? "" : convertUnit(p[field], price, unit) }));
    setUnit(unit);
  };

  const visibleKeys = [...MAIN_KEYS, ...(moreOptions ? MORE_KEYS : [])];
  const calculate = () => {
    const example = visibleKeys.every((k) => v[k] === "");
    const values = example
      ? { ...D, downPayment: UNIT_EXAMPLE.downPayment[downUnit], propertyTaxes: UNIT_EXAMPLE.propertyTaxes[taxUnit] }
      : v;
    setResult(calculateVaMortgage({
      ...values, ...dates, downUnit, taxUnit, eligibility, usedBefore: usedBefore === "y", disabled: disabled === "y",
      feeFinanced: feeOption === "f", moreOptions, showBiweekly,
    }));
    setView("annual");
  };
  const clear = () => {
    setV(blank()); setDownUnit("percent"); setTaxUnit("percent"); setEligibility("v"); setUsedBefore("n");
    setDisabled("n"); setFeeOption("f"); setShowBiweekly(true); setDates(initialDates()); setResult(null);
  };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ── */}
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 16 }}>
          <Row label="Home Price"><DollarField value={v.price} onChange={set("price")} placeholder={D.price} /></Row>
          <Row label="Down Payment">
            <ValueUnitField
              value={v.downPayment} unit={downUnit} placeholder={UNIT_EXAMPLE.downPayment[downUnit]}
              onValueChange={set("downPayment")} onUnitChange={(u) => changeUnit("downPayment", u, setDownUnit)}
            />
          </Row>
          <Row label="Loan Term" suffix="years"><TextField value={v.years} onChange={set("years")} placeholder={D.years} /></Row>
          <Row label="Interest Rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Row>

          <div style={{ marginTop: 6 }}>
            <RadioGroup legend="VA Eligibility:" name="va-eligibility" options={ELIGIBILITY} value={eligibility} onChange={setEligibility} />
            <RadioGroup legend="Used VA Loan Before?" name="va-used" options={YES_NO} value={usedBefore} onChange={setUsedBefore} inline />
            <RadioGroup legend="Service-Related Disability (10+%)?" name="va-disabled" options={YES_NO} value={disabled} onChange={setDisabled} inline />
            <RadioGroup
              legend="VA Funding Fee" name="va-fee" value={feeOption} onChange={setFeeOption}
              options={[{ value: "f", label: "Financed Into Loan" }, { value: "u", label: "Paid Upfront" }]}
            />
          </div>

          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <button type="button" style={linkButton} onClick={() => setMoreOptions((m) => !m)} aria-expanded={moreOptions}>
              {moreOptions ? "– Less Options" : "+ More Options"}
            </button>
          </div>
          {moreOptions && (
            <>
              <CostFields
                v={v} set={set} taxUnit={taxUnit} taxPlaceholder={UNIT_EXAMPLE.propertyTaxes[taxUnit]}
                onTaxUnit={(u) => changeUnit("propertyTaxes", u, setTaxUnit)} dates={dates} setDate={setDate} defaults={D}
              />
              <MoreOptionsFields v={v} set={set} dates={dates} setDate={setDate} showBiweekly={showBiweekly} setShowBiweekly={setShowBiweekly} />
            </>
          )}

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        {/* ── Results ── */}
        <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {ok ? `Monthly Pay: ${result.monthlyPay}` : "Result"}
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the home and loan details, then click Calculate to see your VA mortgage payment.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {ok && (
              <>
                {result.sentence && <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>{result.sentence}</p>}
                {result.table && <MonthlyTotalTable result={result} />}
                <SummaryTable rows={result.summary} />
                {/* Small slices crowd the ring, so the legend carries every percentage. */}
                <InvestmentPieChart
                  segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${Math.round((p.value / pieTotal) * 100)}%)` }))}
                  labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                />
                {result.biweekly && <SummaryTable title={result.biweekly.title} rows={result.biweekly.rows} />}
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.schedule && <ScheduleSection schedule={result.schedule} view={view} setView={setView} idPrefix="va" />}
    </div>
  );
}
