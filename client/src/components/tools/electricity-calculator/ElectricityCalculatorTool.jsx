import { useState } from "react";
import { FieldLabel, TextField, DollarField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import {
  POWER_UNITS, USAGE_UNITS, APPLIANCES, PLACEHOLDERS, CAPACITY_HELP, calculateElectricity,
} from "../../../utils/electricityCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const small = { width: "auto", flexShrink: 0, padding: "8px 6px", fontSize: 13, maxWidth: "50%" };
const suffix = { fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0, paddingBottom: 10 };
const tableStyle = { borderCollapse: "collapse", fontSize: 13.5, color: "var(--text-primary)", width: "100%" };

const opts = (list) => list.map((o) => ({ value: o.value, label: o.label }));
const APPLIANCE_OPTIONS = [{ value: "", label: "Define your own" }, ...APPLIANCES.map((a, i) => ({ value: String(i), label: a.label }))];
const EMPTY = () => ({ appliance: "", power: "", powerUnit: "W", capacity: "", usage: "", usageUnit: "hpd", price: "" });

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the appliance&apos;s power, how much it is used and the electricity price (or pick a typical appliance), then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const month = result.rows[2];
  return (
    <>
      <HighlightSummary label="Cost per month" value={month.costText} color="var(--success)" note={month.kwhText} />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 10px" }}>
        The estimated average electricity usage for this appliance, with the cost of the electricity over varying spans of time:
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table-head" style={tableStyle}>
          <thead><tr><th>Electricity usage</th><th>Cost</th><th>Time span</th></tr></thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.span}>
                <td style={{ textAlign: "right" }}>{r.kwhText}</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{r.costText}</td>
                <td>{r.span}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>This calculator assumes there are 30.44 days in a month and 365.25 days in a year on average.</p>
    </>
  );
}

export default function ElectricityCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();

  const run = (state) => {
    const r = calculateElectricity(state);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const update = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  /** A typical appliance fills in its power, usage and capacity, as on the reference ("Define your own" keeps the boxes). */
  const pickAppliance = (value) => {
    const a = APPLIANCES[Number(value)];
    update(value === "" || !a ? { appliance: value } : {
      appliance: value, power: a.power, powerUnit: a.powerUnit, usage: a.usage, usageUnit: a.usageUnit, capacity: a.capacity,
    });
  };
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const row = (label, k, after, hint) => (
    <div style={fieldWrap}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
          <FieldLabel hint={hint}>{label}</FieldLabel>
          <Req name={k} flagged={req.flagged}>
            {k === "price"
              ? <DollarField value={s[k]} onChange={(v) => update({ [k]: v })} placeholder={PLACEHOLDERS[k]} />
              : <TextField value={s[k]} onChange={(v) => update({ [k]: v })} placeholder={PLACEHOLDERS[k]} style={{ width: "100%" }} />}
          </Req>
        </label>
        {after}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Estimate the electricity usage and cost of an appliance from its power and how much it is used. How long and how hard each appliance
        runs varies a lot between households, so for the best results adjust the usage to match your own.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, padding: 18 }}>
          <label style={fieldWrap}>
            <FieldLabel>Typical appliance</FieldLabel>
            <SelectField value={s.appliance} onChange={pickAppliance} options={APPLIANCE_OPTIONS} />
          </label>
          {row("Appliance power", "power", <SelectField value={s.powerUnit} onChange={(v) => update({ powerUnit: v })} options={opts(POWER_UNITS)} style={small} />)}
          {row("Use/run at", "capacity", <span style={suffix}>% capacity</span>, CAPACITY_HELP)}
          {row("Usage", "usage", <SelectField value={s.usageUnit} onChange={(v) => update({ usageUnit: v })} options={opts(USAGE_UNITS)} style={small} />)}
          {row("Electricity price", "price", <span style={suffix}>per kWh</span>)}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
