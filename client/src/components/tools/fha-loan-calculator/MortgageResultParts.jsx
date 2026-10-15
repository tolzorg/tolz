// Pieces shared by the FHA Loan and VA Mortgage calculators, which mirror
// calculator.net pages built on the same mortgage machinery.
import { FieldLabel } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { MonthYearField, ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import AmortizationLineChart from "../amortization-calculator/AmortizationLineChart";
import { wholeMoney } from "../../../utils/fhaLoanCalculatorEngine";

const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
const labelTd = { ...td, textAlign: "left", fontWeight: 400, whiteSpace: "normal", overflowWrap: "anywhere" };
const shaded = { background: "var(--bg-muted)", fontWeight: 700 };
// Compact cells so all five schedule columns fit a phone screen.
const schedTd = { padding: "4px 4px", fontSize: 11, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };
const hidden = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };
const panelHeading = { fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 8px" };

export function ErrorPanel({ messages }) {
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

export function Row({ label, children, suffix }) {
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

export function Checkbox({ checked, onChange, children }) {
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

/** Property taxes, insurance, HOA, other costs and the start date. */
export function CostFields({ v, set, taxUnit, taxPlaceholder, onTaxUnit, dates, setDate, defaults }) {
  return (
    <>
      <Row label="Property Taxes">
        <ValueUnitField value={v.propertyTaxes} unit={taxUnit} placeholder={taxPlaceholder} onValueChange={set("propertyTaxes")} onUnitChange={onTaxUnit} />
      </Row>
      <Row label="Home Insurance" suffix="/year"><DollarField value={v.homeInsurance} onChange={set("homeInsurance")} placeholder={defaults.homeInsurance} /></Row>
      <Row label="HOA Fee" suffix="/year"><DollarField value={v.hoa} onChange={set("hoa")} placeholder={defaults.hoa} /></Row>
      <Row label="Other Costs" suffix="/year"><DollarField value={v.otherCosts} onChange={set("otherCosts")} placeholder={defaults.otherCosts} /></Row>
      <Row label="Start Date">
        <MonthYearField month={dates.startMonth} year={dates.startYear} onMonthChange={setDate("startMonth")} onYearChange={setDate("startYear")} />
      </Row>
    </>
  );
}

/** Annual cost increases, extra payments and the bi-weekly checkbox. */
export function MoreOptionsFields({ v, set, dates, setDate, showBiweekly, setShowBiweekly }) {
  return (
    <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: 12, marginBottom: 10 }}>
      <p style={panelHeading}>Annual Tax &amp; Cost Increase</p>
      <Row label="Property Taxes Increase"><PercentField value={v.taxIncrease} onChange={set("taxIncrease")} placeholder="0" /></Row>
      <Row label="Home Insurance Increase"><PercentField value={v.insuranceIncrease} onChange={set("insuranceIncrease")} placeholder="0" /></Row>
      <Row label="HOA Fee Increase"><PercentField value={v.hoaIncrease} onChange={set("hoaIncrease")} placeholder="0" /></Row>
      <Row label="Other Costs Increase"><PercentField value={v.otherIncrease} onChange={set("otherIncrease")} placeholder="0" /></Row>
      <p style={{ ...panelHeading, marginTop: 10 }}>Extra Payments</p>
      <ExtraRow label="Extra Monthly Pay" word="from" amount={v.extraMonthly} onAmount={set("extraMonthly")}
        month={dates.extraMonthlyMonth} year={dates.extraMonthlyYear} onMonth={setDate("extraMonthlyMonth")} onYear={setDate("extraMonthlyYear")} />
      <ExtraRow label="Extra Yearly Pay" word="from" amount={v.extraYearly} onAmount={set("extraYearly")}
        month={dates.extraYearlyMonth} year={dates.extraYearlyYear} onMonth={setDate("extraYearlyMonth")} onYear={setDate("extraYearlyYear")} />
      <ExtraRow label="Extra One-time Pay" word="on" amount={v.extraOneTime} onAmount={set("extraOneTime")}
        month={dates.extraOneTimeMonth} year={dates.extraOneTimeYear} onMonth={setDate("extraOneTimeMonth")} onYear={setDate("extraOneTimeYear")} />
      <Checkbox checked={showBiweekly} onChange={setShowBiweekly}>Show Biweekly Payback Results</Checkbox>
    </div>
  );
}

export function ButtonRow({ onCalculate, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      <button type="button" onClick={onCalculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

export function MonthlyTotalTable({ result }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ ...td, background: "var(--bg-muted)" }}><span style={hidden}>Item</span></th>
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
    </div>
  );
}

/** Label/value rows; the first row is shaded like the reference's "House Price". */
export function SummaryTable({ rows, title }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
        <tbody>
          {title && <tr><th colSpan={2} scope="colgroup" style={{ ...labelTd, ...shaded }}>{title}</th></tr>}
          {rows.map(([label, value], i) => {
            const shade = !title && i === 0 && label === "House Price" ? shaded : {};
            return (
              <tr key={label}>
                <th scope="row" style={{ ...labelTd, ...shade }}>{label}</th>
                <td style={{ ...td, textAlign: "right", ...shade }}>{value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleTable({ schedule, view, cell = wholeMoney }) {
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
                <td style={schedTd}>{cell(r.interest)}</td>
                <td style={schedTd}>{cell(r.principal)}</td>
                <td style={schedTd}>{cell(r.balance)}</td>
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

/** "Amortization schedule" with Annual/Monthly tabs (active tab blue) and the line chart. */
export function ScheduleSection({ schedule, view, setView, idPrefix, cell }) {
  return (
    <section aria-labelledby={`${idPrefix}-schedule-title`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 id={`${idPrefix}-schedule-title`} style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>Amortization schedule</h2>
      <div role="tablist" aria-label="Schedule view" style={{ display: "flex", maxWidth: 360 }}>
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
        <div style={{ flex: "1 1 360px", minWidth: 0 }}><ScheduleTable schedule={schedule} view={view} cell={cell} /></div>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 0, padding: 16 }}>
          <AmortizationLineChart series={schedule.chart} loanAmount={schedule.loan} />
        </div>
      </div>
    </section>
  );
}
