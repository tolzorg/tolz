import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { FieldLabel } from "../mortgage-calculator/MortgageFormControls";
import PensionLineChart from "../pension-calculator/PensionLineChart";
import { calculateRothIra, DEFAULTS, formatDollars } from "../../../utils/rothIraCalculatorEngine";

// Tooltips copied verbatim from the reference (including its own
// inconsistent limit figures between the first two).
const HINTS = {
  contribution: "The amount you plan to contribute to the Roth IRA account each year. The maximum contribution limit is $7,500 for individuals under the age of 50 and increases to $8,600 for individuals aged 50 and above.",
  maximize: "Please select 'yes' if you plan to contribute the maximum allowed amount each year. The maximum contribution limit is $7,000 before the age of 50 and increases to $8,000 after the age of 50.",
  rate: "The expected average annual return you will earn on your money in the account.",
  tax: "The tax rate you pay on additional income. Please includes the combined federal and state/local marginal tax rates, if applicable.",
};

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 10px" };
const cell = { padding: "6px 10px", fontSize: 13, textAlign: "right", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-secondary)" };
const headCell = { ...cell, fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", background: "var(--bg-white)", position: "sticky", top: 0 };

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

function ResultTable({ r }) {
  const rows = [
    [`Balance at age ${r.retirementAge}`, r.roth.balance, r.taxable.balance, true],
    ["Total principal", r.roth.principal, r.taxable.principal],
    ["Total interest", r.roth.interest, r.taxable.interest],
    ["Total tax", r.roth.tax, r.taxable.tax],
  ];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
      <thead>
        <tr>
          <th />
          <th style={{ ...cell, fontWeight: 700, color: "var(--text-primary)" }}>Roth IRA</th>
          <th style={{ ...cell, fontWeight: 700, color: "var(--text-primary)" }}>Taxable account</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, roth, taxable, strong]) => (
          <tr key={label}>
            <td style={{ ...cell, textAlign: "left", fontWeight: strong ? 700 : 400, color: "var(--text-primary)" }}>{label}</td>
            <td style={{ ...cell, fontWeight: strong ? 700 : 400, color: "var(--text-primary)" }}>{formatDollars(roth)}</td>
            <td style={{ ...cell, fontWeight: strong ? 700 : 400, color: "var(--text-primary)" }}>{formatDollars(taxable)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnnualSchedule({ rows }) {
  const groups = ["Principal", "Roth IRA", "Taxable account"];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ maxHeight: 520, overflow: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...headCell, textAlign: "left", verticalAlign: "bottom" }}>Age</th>
              {groups.map((g) => <th key={g} colSpan={2} style={{ ...headCell, textAlign: "center" }}>{g}</th>)}
            </tr>
            <tr>
              {groups.flatMap((g) => [
                <th key={`${g}-s`} style={{ ...headCell, top: 31 }}>Start</th>,
                <th key={`${g}-e`} style={{ ...headCell, top: 31 }}>End</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.age}>
                <td style={{ ...cell, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" }}>{row.age}</td>
                <td style={cell}>{formatDollars(row.principalStart)}</td>
                <td style={cell}>{formatDollars(row.principalEnd)}</td>
                <td style={cell}>{formatDollars(row.rothStart)}</td>
                <td style={cell}>{formatDollars(row.rothEnd)}</td>
                <td style={cell}>{formatDollars(row.taxableStart)}</td>
                <td style={cell}>{formatDollars(row.taxableEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RothIraCalculatorTool() {
  const [balance, setBalance] = useState("");
  const [contribution, setContribution] = useState("");
  const [maximize, setMaximize] = useState(false);
  const [rate, setRate] = useState("");
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [tax, setTax] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateRothIra({
      balance: balance || DEFAULTS.balance,
      contribution: contribution || DEFAULTS.contribution,
      maximize,
      rate: rate || DEFAULTS.rate,
      currentAge: currentAge || DEFAULTS.currentAge,
      retirementAge: retirementAge || DEFAULTS.retirementAge,
      tax: tax || DEFAULTS.tax,
    }));
  }

  function clear() {
    setBalance(""); setContribution(""); setMaximize(false); setRate("");
    setCurrentAge(""); setRetirementAge(""); setTax(""); setResult(null);
  }

  const ok = result && !result.errors;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Current balance"><DollarField value={balance} onChange={setBalance} placeholder={DEFAULTS.balance} /></FieldRow>
          <FieldRow label="Annual contribution" hint={HINTS.contribution}>
            {maximize
              ? <span style={{ fontSize: 13.5, color: "var(--text-secondary)", padding: "8px 2px" }}>maxing out</span>
              : <DollarField value={contribution} onChange={setContribution} placeholder={DEFAULTS.contribution} />}
          </FieldRow>
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ padding: 0, marginBottom: 6 }}>
              <FieldLabel hint={HINTS.maximize}>Maximize contributions?</FieldLabel>
            </legend>
            <div style={{ display: "flex", gap: 18, paddingLeft: 6 }}>
              {[[true, "Yes"], [false, "No"]].map(([value, label]) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                  <input type="radio" name="rothMaximize" checked={maximize === value} onChange={() => setMaximize(value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <FieldRow label="Expected rate of return" hint={HINTS.rate}><PercentField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} /></FieldRow>
          <FieldRow label="Current age"><TextField value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} /></FieldRow>
          <FieldRow label="Retirement age"><TextField value={retirementAge} onChange={setRetirementAge} placeholder={DEFAULTS.retirementAge} /></FieldRow>
          <FieldRow label="Marginal tax rate" hint={HINTS.tax}><PercentField value={tax} onChange={setTax} placeholder={DEFAULTS.tax} /></FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 400px", minWidth: 300, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 18px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter your balance, contributions, expected return, ages and tax rate, then click <strong>Calculate</strong> to compare a Roth IRA with a regular taxable account.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : (
              <>
                {result.notice && (
                  <p style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.5, margin: "0 0 12px" }}>{result.notice}</p>
                )}
                <ResultTable r={result} />
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "14px 0 0" }}>
                  According to provided information, the Roth IRA account can accumulate{" "}
                  <strong style={{ color: "var(--success)" }}>{formatDollars(result.advantage)}</strong> more than a regular taxable account by age {result.retirementAge}.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.showChart && (
        <div className="card" style={{ padding: 16 }}>
          <p style={{ ...sectionTitle, fontSize: 15, textAlign: "center" }}>Balance Accumulation Graph</p>
          <PensionLineChart series={result.chart} xLabel="Age" />
        </div>
      )}

      {ok && (
        <div>
          <h2 style={sectionTitle}>Annual Schedule</h2>
          <AnnualSchedule rows={result.rows} />
        </div>
      )}
    </div>
  );
}
