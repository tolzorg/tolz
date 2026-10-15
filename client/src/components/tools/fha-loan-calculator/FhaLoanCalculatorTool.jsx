import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { MonthYearField, ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import AmortizationLineChart from "../amortization-calculator/AmortizationLineChart";
import {
  calculateFhaLoan, suggestedAnnualMip, convertUnit, FHA_DEFAULTS, MIP_DURATIONS, wholeMoney,
} from "../../../utils/fhaLoanCalculatorEngine";

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

const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
const labelTd = { ...td, textAlign: "left", fontWeight: 400, whiteSpace: "normal" };
const shaded = { background: "var(--bg-muted)", fontWeight: 700 };
const linkButton = { background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 };
// Compact cells so all five schedule columns fit a phone screen.
const schedTd = { padding: "4px 4px", fontSize: 11, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };

function thisMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: String(now.getFullYear()) };
}

function initialDates() {
  const { month, year } = thisMonthYear();
  return {
    startMonth: month, startYear: year, extraMonthlyMonth: month, extraMonthlyYear: year,
    extraYearlyMonth: month, extraYearlyYear: year, extraOneTimeMonth: month, extraOneTimeYear: year,
  };
}

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

function Row({ label, children, suffix }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 120px", minWidth: 0 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex" }}>{children}</div>
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer", margin: "6px 0 10px" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
      {children}
    </label>
  );
}

function ExtraRow({ label, word, amount, onAmount, month, year, onMonth, onYear }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 4 }}>
        <div style={{ flex: "1 1 110px", minWidth: 0, display: "flex" }}><DollarField value={amount} onChange={onAmount} placeholder="0" /></div>
        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{word}</span>
        <div style={{ flex: "1 1 150px", minWidth: 0 }}><MonthYearField month={month} year={year} onMonthChange={onMonth} onYearChange={onYear} /></div>
      </div>
    </div>
  );
}

function MonthlyTotalTable({ result }) {
  return (
    <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ ...td, background: "var(--bg-muted)" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Item</span></th>
          <th style={{ ...td, background: "var(--bg-muted)", textAlign: "right" }}>{result.firstColumn}</th>
          <th style={{ ...td, background: "var(--bg-muted)", textAlign: "right" }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {result.table.map((x) => (
          <tr key={x.label}>
            <th scope="row" style={{ ...labelTd, ...(x.bold ? shaded : {}) }}>{x.label}</th>
            <td style={{ ...td, textAlign: "right", ...(x.bold ? shaded : {}) }}>{x.first}</td>
            <td style={{ ...td, textAlign: "right", ...(x.bold ? shaded : {}) }}>{x.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SummaryTable({ result }) {
  return (
    <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
      <tbody>
        {result.summary.map(([label, value], i) => (
          <tr key={label}>
            <th scope="row" style={{ ...labelTd, ...(i === 0 && label === "House Price" ? shaded : {}), overflowWrap: "anywhere" }}>{label}</th>
            <td style={{ ...td, textAlign: "right", ...(i === 0 && label === "House Price" ? shaded : {}) }}>{value}</td>
          </tr>
        ))}
        {result.biweekly && (
          <>
            <tr><th colSpan={2} scope="colgroup" style={{ ...labelTd, ...shaded }}>{result.biweekly.title}</th></tr>
            {result.biweekly.rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row" style={labelTd}>{label}</th>
                <td style={{ ...td, textAlign: "right" }}>{value}</td>
              </tr>
            ))}
          </>
        )}
      </tbody>
    </table>
  );
}

function ScheduleTable({ schedule, view }) {
  const rows = view === "annual" ? schedule.annual : schedule.monthly;
  const heads = [view === "annual" ? "Year" : "Month", ...(schedule.showDates ? ["Date"] : []), "Interest", "Principal", "Ending Balance"];
  return (
    <div style={{ overflowX: "auto", maxHeight: view === "monthly" ? 560 : undefined, overflowY: view === "monthly" ? "auto" : undefined }}>
      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
        <thead>
          <tr>{heads.map((h) => <th key={h} style={{ ...schedTd, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal", position: "sticky", top: 0 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.flatMap((r) => {
            const out = [(
              <tr key={r.label}>
                <td style={schedTd}>{r.label}</td>
                {schedule.showDates && <td style={{ ...schedTd, whiteSpace: "normal" }}>{r.date}</td>}
                <td style={schedTd}>{wholeMoney(r.interest)}</td>
                <td style={schedTd}>{wholeMoney(r.principal)}</td>
                <td style={schedTd}>{wholeMoney(r.balance)}</td>
              </tr>
            )];
            if (r.yearEnd) out.push(<tr key={`y${r.yearEnd}`}><td colSpan={heads.length} style={{ ...schedTd, textAlign: "center", fontWeight: 700, background: "var(--bg-muted)" }}>End of year {r.yearEnd}</td></tr>);
            return out;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function FhaLoanCalculatorTool() {
  const [v, setV] = useState(Object.fromEntries(ALL_KEYS.map((k) => [k, ""])));
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
  const calculate = () => {
    const example = visibleKeys.every((k) => v[k] === "");
    const values = example
      ? { ...D, downPayment: UNIT_EXAMPLE.downPayment[downUnit], propertyTaxes: UNIT_EXAMPLE.propertyTaxes[taxUnit] }
      : v;
    setResult(calculateFhaLoan({
      ...values, ...dates, downUnit, taxUnit, mipDuration, includeOptionals, moreOptions, showBiweekly,
    }));
    setView("annual");
  };
  const clear = () => {
    setV(Object.fromEntries(ALL_KEYS.map((k) => [k, ""])));
    setDownUnit("percent"); setTaxUnit("percent"); setMipDuration("term");
    setIncludeOptionals(true); setShowBiweekly(true); setDates(initialDates()); setResult(null);
  };

  const ok = result && !result.errors;
  const pieTotal = ok ? result.pie.reduce((s, p) => s + Math.max(0, p.value), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ── */}
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 16 }}>
          <Row label="Home Price"><DollarField value={v.price} onChange={setLoanField("price")} placeholder={D.price} /></Row>
          <Row label="Down Payment">
            <ValueUnitField
              value={v.downPayment} unit={downUnit} placeholder={UNIT_EXAMPLE.downPayment[downUnit]}
              onValueChange={setLoanField("downPayment")} onUnitChange={(u) => changeUnit("downPayment", u, setDownUnit)}
            />
          </Row>
          <Row label="Loan Term" suffix="years"><TextField value={v.years} onChange={setLoanField("years")} placeholder={D.years} /></Row>
          <Row label="Interest Rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={D.rate} /></Row>
          <Row label="Upfront FHA MIP"><PercentField value={v.upfrontMip} onChange={set("upfrontMip")} placeholder={D.upfrontMip} /></Row>
          <Row label="Annual FHA MIP"><PercentField value={v.annualMip} onChange={set("annualMip")} placeholder={D.annualMip} /></Row>
          <Row label="Annual FHA MIP Duration">
            <SelectField value={mipDuration} onChange={setMipDuration} options={MIP_DURATIONS} style={{ width: "100%" }} />
          </Row>

          <Checkbox checked={includeOptionals} onChange={setIncludeOptionals}>Include Optionals Below</Checkbox>
          {includeOptionals && (
            <>
              <Row label="Property Taxes">
                <ValueUnitField
                  value={v.propertyTaxes} unit={taxUnit} placeholder={UNIT_EXAMPLE.propertyTaxes[taxUnit]}
                  onValueChange={set("propertyTaxes")} onUnitChange={(u) => changeUnit("propertyTaxes", u, setTaxUnit)}
                />
              </Row>
              <Row label="Home Insurance" suffix="/year"><DollarField value={v.homeInsurance} onChange={set("homeInsurance")} placeholder={D.homeInsurance} /></Row>
              <Row label="HOA Fee" suffix="/year"><DollarField value={v.hoa} onChange={set("hoa")} placeholder={D.hoa} /></Row>
              <Row label="Other Costs" suffix="/year"><DollarField value={v.otherCosts} onChange={set("otherCosts")} placeholder={D.otherCosts} /></Row>
              <Row label="Start Date">
                <MonthYearField month={dates.startMonth} year={dates.startYear} onMonthChange={setDate("startMonth")} onYearChange={setDate("startYear")} />
              </Row>
            </>
          )}

          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <button type="button" style={linkButton} onClick={() => setMoreOptions((m) => !m)} aria-expanded={moreOptions}>
              {moreOptions ? "– Fewer Options" : "+ More Options"}
            </button>
          </div>
          {moreOptions && (
            <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: 12, marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 8px" }}>Annual Tax &amp; Cost Increase</p>
              <Row label="Property Taxes Increase"><PercentField value={v.taxIncrease} onChange={set("taxIncrease")} placeholder="0" /></Row>
              <Row label="Home Insurance Increase"><PercentField value={v.insuranceIncrease} onChange={set("insuranceIncrease")} placeholder="0" /></Row>
              <Row label="HOA Fee Increase"><PercentField value={v.hoaIncrease} onChange={set("hoaIncrease")} placeholder="0" /></Row>
              <Row label="Other Costs Increase"><PercentField value={v.otherIncrease} onChange={set("otherIncrease")} placeholder="0" /></Row>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: "10px 0 8px" }}>Extra Payments</p>
              <ExtraRow label="Extra Monthly Pay" word="from" amount={v.extraMonthly} onAmount={set("extraMonthly")}
                month={dates.extraMonthlyMonth} year={dates.extraMonthlyYear} onMonth={setDate("extraMonthlyMonth")} onYear={setDate("extraMonthlyYear")} />
              <ExtraRow label="Extra Yearly Pay" word="from" amount={v.extraYearly} onAmount={set("extraYearly")}
                month={dates.extraYearlyMonth} year={dates.extraYearlyYear} onMonth={setDate("extraYearlyMonth")} onYear={setDate("extraYearlyYear")} />
              <ExtraRow label="Extra One-time Pay" word="on" amount={v.extraOneTime} onAmount={set("extraOneTime")}
                month={dates.extraOneTimeMonth} year={dates.extraOneTimeYear} onMonth={setDate("extraOneTimeMonth")} onYear={setDate("extraOneTimeYear")} />
              <Checkbox checked={showBiweekly} onChange={setShowBiweekly}>Show Biweekly Payback Results</Checkbox>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
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
                {result.table && <div style={{ overflowX: "auto" }}><MonthlyTotalTable result={result} /></div>}
                {/* Small slices crowd the ring, so the legend carries every percentage. */}
                <InvestmentPieChart
                  segments={result.pie.filter((p) => p.value > 0).map((p) => ({ ...p, label: `${p.label} (${Math.round((p.value / pieTotal) * 100)}%)` }))}
                  labelText={(s, pct) => (pct >= 5 ? `${Math.round(pct)}%` : null)}
                />
                <div style={{ overflowX: "auto" }}><SummaryTable result={result} /></div>
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.schedule && (
        <section aria-labelledby="fha-schedule-title" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="fha-schedule-title" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>Amortization schedule</h2>
          <div role="tablist" aria-label="Schedule view" style={{ display: "flex", gap: 0, maxWidth: 360 }}>
            {[["annual", "Annual Schedule"], ["monthly", "Monthly Schedule"]].map(([key, label]) => (
              <button
                key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)}
                style={{
                  flex: 1, padding: "8px 10px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
                  border: "1px solid var(--accent)", background: view === key ? "var(--accent)" : "transparent",
                  color: view === key ? "#fff" : "var(--accent)",
                  borderRadius: key === "annual" ? "var(--radius-sm) 0 0 var(--radius-sm)" : "0 var(--radius-sm) var(--radius-sm) 0",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 360px", minWidth: 0 }}><ScheduleTable schedule={result.schedule} view={view} /></div>
            <div className="card" style={{ flex: "1 1 320px", minWidth: 0, padding: 16 }}>
              <AmortizationLineChart series={result.schedule.chart} loanAmount={result.schedule.loan} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
