import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { FieldLabel } from "../mortgage-calculator/MortgageFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import { calculateRmd, rmdYearOptions, DEFAULTS, formatMoney, formatPeriod } from "../../../utils/rmdCalculatorEngine";

const HINTS = {
  year: "The year the Required Minimum Distribution (RMD) to be made.",
  rate: "The average annual return of your retirement account. If provided, it will be used to predict your future Required Minimum Distribution amount.",
};

const SCHEDULE_COLUMNS = [
  { key: "ageText", label: "Your Age", text: true },
  { key: "periodText", label: "Distribution period", text: true },
  { key: "rmd", label: "RMD" },
  { key: "balance", label: "End of Year Balance" },
];
const BAR_LABELS = { starting: "Balance", contributions: null, interest: "RMD" };

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const resultText = { fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 10px" };

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

/** RMD = balance / period = amount, with the division drawn as a fraction. */
function Formula({ balanceText, period, rmd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, color: "var(--text-primary)", margin: "4px 0 14px" }}>
      <span>RMD =</span>
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.3 }}>
        <span style={{ borderBottom: "1px solid var(--text-primary)", padding: "0 4px" }}>${balanceText}</span>
        <span style={{ padding: "0 4px" }}>{formatPeriod(period)}</span>
      </span>
      <span>= {formatMoney(rmd)}</span>
    </div>
  );
}

export default function RmdCalculatorTool() {
  const years = rmdYearOptions();
  const [birthYear, setBirthYear] = useState("");
  const [rmdYear, setRmdYear] = useState(years[1]);
  const [balance, setBalance] = useState("");
  const [spouseIsBeneficiary, setSpouseIsBeneficiary] = useState(true);
  const [spouseYear, setSpouseYear] = useState("");
  // Pre-filled (not a placeholder): blank is meaningful — no projection.
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateRmd({
      birthYear: birthYear || DEFAULTS.birthYear,
      rmdYear,
      balance: balance || DEFAULTS.balance,
      spouseIsBeneficiary,
      spouseYear: spouseYear || DEFAULTS.spouseYear,
      rate,
    }));
  }

  function clear() {
    setBirthYear(""); setRmdYear(years[1]); setBalance(""); setSpouseIsBeneficiary(true);
    setSpouseYear(""); setRate(""); setResult(null);
  }

  const balanceYear = Number(rmdYear) - 1;
  const ok = result && !result.errors;
  const projection = ok ? result.projection : null;
  const scheduleRows = projection
    ? projection.rows.map((row) => ({
      period: row.year,
      ageText: String(row.age),
      periodText: row.period === null ? "NA" : formatPeriod(row.period),
      rmd: row.rmd,
      balance: row.balance,
    }))
    : [];
  const bars = projection
    ? projection.rows.map((row, i) => ({ year: i, startingAmount: row.balance, contributions: 0, interest: row.rmd, total: row.balance + row.rmd }))
    : [];
  const ticks = projection ? projection.rows.map((row) => (Number.isInteger(row.age) && row.age % 5 === 0 ? String(row.age) : null)) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        Once a person reaches the age of 73, the IRS requires retirement account holders to withdraw a minimum amount
        of money each year – this amount is referred to as the Required Minimum Distribution (RMD). This calculator
        calculates the RMD depending on your age and account balance. The calculations are based on the IRS
        Publication 590-B, so the calculator is intended for residents of the United States only.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Your year of birth"><TextField value={birthYear} onChange={setBirthYear} placeholder={DEFAULTS.birthYear} /></FieldRow>
          <FieldRow label="Year of RMD" hint={HINTS.year}>
            <SelectField value={rmdYear} onChange={setRmdYear} options={years.map((y) => ({ value: y, label: y }))} style={{ flex: 1, minWidth: 0 }} />
          </FieldRow>
          <FieldRow label={`Account balance as of 12/31/${balanceYear}`}>
            <DollarField value={balance} onChange={setBalance} placeholder={DEFAULTS.balance} />
          </FieldRow>

          <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ padding: 0, marginBottom: 6 }}><FieldLabel>Is your spouse the primary beneficiary?</FieldLabel></legend>
            <div style={{ display: "flex", gap: 18, paddingLeft: 6 }}>
              {[[true, "Yes"], [false, "No"]].map(([value, label]) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                  <input type="radio" name="rmdSpouse" checked={spouseIsBeneficiary === value} onChange={() => setSpouseIsBeneficiary(value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          {spouseIsBeneficiary && (
            <FieldRow label="Your spouse's date of birth"><TextField value={spouseYear} onChange={setSpouseYear} placeholder={DEFAULTS.spouseYear} /></FieldRow>
          )}
          <FieldRow label="Estimated rate of return (Optional)" hint={HINTS.rate}>
            <PercentField value={rate} onChange={setRate} />
          </FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 380px", minWidth: 300, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 18px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter your year of birth, the RMD year and your account balance, then click <strong>Calculate</strong>.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : (
              <>
                <p style={{ ...resultText, fontSize: 16 }}>
                  Your RMD for {result.year} is{" "}
                  <strong style={{ color: "var(--success)" }}>{result.period === null ? "$0" : formatMoney(result.rmd)}</strong>.
                </p>
                {result.period === null ? (
                  result.begin && <p style={resultText}>{result.begin}</p>
                ) : (
                  <>
                    <p style={resultText}>The distribution period for your case is: {formatPeriod(result.period)}.</p>
                    <Formula balanceText={result.balanceText} period={result.period} rmd={result.rmd} />
                  </>
                )}
                {projection && (
                  <>
                    <p style={{ ...resultText, fontSize: 13.5, color: "var(--text-secondary)" }}>
                      If you only withdraw the RMD at the end of each year and your return rate is {projection.rateText}% per year,
                      your future account balance and RMDs will look like the following.
                    </p>
                    <InvestmentBarChart barData={bars} labels={BAR_LABELS} tickLabels={ticks} xAxisLabel="Your age" />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {projection && (
        <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
          <LoanScheduleTable title="RMD Schedule" periodLabel="Year" schedule={scheduleRows} columns={SCHEDULE_COLUMNS} formatValue={formatMoney} />
        </div>
      )}
    </div>
  );
}
