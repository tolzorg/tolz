import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { calculateRent, validateRentInputs, formatCurrency, DEFAULTS } from "../../../utils/rentCalculatorEngine";

const INCOME_UNIT_OPTIONS = [
  { value: "year", label: "per year" },
  { value: "month", label: "per month" },
];

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.-]/g, "");
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return (negative ? "-" : "") + cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned || cleaned === "-") return cleaned;
  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;
  const [intPart, decPart] = body.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  return (negative ? "-" : "") + formatted;
}

function DollarField({ value, onChange, placeholder, style }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19, ...style }}
      />
    </div>
  );
}

/** The reference's own 3-zone "safe / acceptable / aggressive" gauge is a
 * static illustrative image (its two dollar labels are placed in a plain
 * 50/50 table above it, NOT positioned proportionally to their actual
 * values) — this is a from-scratch recreation of that same fixed-zone
 * illustration (not a to-scale chart), with the two labels positioned
 * above the safe/acceptable and acceptable/aggressive boundaries. */
function RentGauge({ safe, afford }) {
  const b1 = 42; // safe/acceptable boundary, %
  const b2 = 60; // acceptable/aggressive boundary, %
  return (
    <div style={{ maxWidth: 420, margin: "18px auto 0" }}>
      <div style={{ position: "relative", height: 40 }}>
        <div style={{ position: "absolute", left: `${b1}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--success)" }}>{formatCurrency(safe, { decimals: 0 })}</div>
          <div style={{ fontSize: 11, color: "var(--text-primary)", lineHeight: 1 }}>▾</div>
        </div>
        <div style={{ position: "absolute", left: `${b2}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>{formatCurrency(afford, { decimals: 0 })}</div>
          <div style={{ fontSize: 11, color: "var(--text-primary)", lineHeight: 1 }}>▾</div>
        </div>
      </div>
      <div style={{ display: "flex", height: 30, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
        <div style={{ flex: `0 0 ${b1}%`, background: "#4f9d3f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 11.5, fontFamily: "var(--font-display)" }}>safe</span>
        </div>
        <div style={{ flex: `0 0 ${b2 - b1}%`, background: "#e6d84a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#5a4a00", fontWeight: 700, fontSize: 10.5, fontFamily: "var(--font-display)" }}>acceptable</span>
        </div>
        <div style={{ flex: "1 1 auto", background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 11.5, fontFamily: "var(--font-display)" }}>aggressive</span>
        </div>
      </div>
    </div>
  );
}

function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

export default function RentCalculatorTool() {
  const [income, setIncome] = useState("");
  const [incomeUnit, setIncomeUnit] = useState(DEFAULTS.incomeUnit);
  const [monthlyDebt, setMonthlyDebt] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = { income: income || DEFAULTS.income };
    const validationError = validateRentInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateRent({
      ...inputs,
      incomeUnit,
      monthlyDebt: monthlyDebt || DEFAULTS.monthlyDebt,
    }));
  }

  function clear() {
    setIncome(""); setIncomeUnit(DEFAULTS.incomeUnit); setMonthlyDebt("");
    setResult(null); setError(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 620 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--text-primary)", margin: 0 }}>
        How Much Rent Can I Afford?
      </h2>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Result
        </div>
        <div style={{ padding: "16px 18px" }}>
          {!result && !error ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in the details below and click <strong>Calculate</strong> to see how much rent you can afford.
            </p>
          ) : error ? (
            <ErrorPanel message={error} />
          ) : result.hardToMeet ? (
            <ErrorPanel message="At that income and debt level, it will be hard to meet rent payments." />
          ) : (
            <>
              <p style={{ fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>
                You can afford up to <strong style={{ color: "var(--success)" }}>{formatCurrency(result.afford, { decimals: 0 })}</strong> per month on a rental payment.
                <br />
                It is recommended to keep your rental payment below <strong style={{ color: "var(--success)" }}>{formatCurrency(result.safe, { decimals: 0 })}</strong> per month.
              </p>

              <RentGauge safe={result.safe} afford={result.afford} />

              {result.showOneThird && (
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: "18px 0 0" }}>
                  Some landlords may not accept applications with more than 1/3 of gross income on rent, which is{" "}
                  <strong>{formatCurrency(result.oneThird, { decimals: 0 })}</strong>.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <FieldRow label="Your pre-tax income" fieldWidth={280}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <DollarField value={income} onChange={setIncome} placeholder={DEFAULTS.income} style={{ flex: "1 1 110px", minWidth: 0 }} />
            <SelectField value={incomeUnit} onChange={setIncomeUnit} options={INCOME_UNIT_OPTIONS} style={{ flex: "1 1 110px", minWidth: 0 }} />
          </div>
        </FieldRow>

        <FieldRow
          label="Your monthly debt payback"
          hint="The total of the minimum amounts you pay each month to keep up with the ongoing debts, such as student loans, car loans, credit cards, child support, alimony paid, and personal loans."
          suffix="car/student loan, credit cards, etc"
          fieldWidth={140}
        >
          <DollarField value={monthlyDebt} onChange={setMonthlyDebt} placeholder={DEFAULTS.monthlyDebt} />
        </FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>
    </div>
  );
}
