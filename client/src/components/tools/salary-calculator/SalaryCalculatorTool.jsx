import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { calculateSalary, formatCurrency, UNIT_OPTIONS } from "../../../utils/salaryCalculatorEngine";

const DEFAULTS = {
  amount: "50", unit: "Hourly", hoursPerWeek: "40", daysPerWeek: "5",
  holidaysPerYear: "10", vacationDaysPerYear: "15",
};

const ROWS = [
  { key: "hourly", label: "Hourly", decimals: 2 },
  { key: "daily", label: "Daily", decimals: 2 },
  { key: "weekly", label: "Weekly", decimals: 0 },
  { key: "biweekly", label: "Bi-weekly", decimals: 0 },
  { key: "semimonthly", label: "Semi-monthly", decimals: 0 },
  { key: "monthly", label: "Monthly", decimals: 0 },
  { key: "quarterly", label: "Quarterly", decimals: 0 },
  { key: "annual", label: "Annual", decimals: 0 },
];

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
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

export default function SalaryCalculatorTool() {
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [holidaysPerYear, setHolidaysPerYear] = useState("");
  const [vacationDaysPerYear, setVacationDaysPerYear] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateSalary({
      amount: amount || DEFAULTS.amount,
      unit,
      hoursPerWeek: hoursPerWeek || DEFAULTS.hoursPerWeek,
      daysPerWeek: daysPerWeek || DEFAULTS.daysPerWeek,
      holidaysPerYear: holidaysPerYear || DEFAULTS.holidaysPerYear,
      vacationDaysPerYear: vacationDaysPerYear || DEFAULTS.vacationDaysPerYear,
    }));
  }

  function clear() {
    setAmount(""); setUnit(DEFAULTS.unit);
    setHoursPerWeek(""); setDaysPerWeek(""); setHolidaysPerYear(""); setVacationDaysPerYear("");
    setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div style={{ flex: "1 1 320px", minWidth: 300 }}>
          <div className="card" style={{ padding: 18 }}>
            <FieldRow label="Salary amount" fieldWidth={280}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                <DollarField value={amount} onChange={setAmount} placeholder={DEFAULTS.amount} style={{ flex: "1 1 100px", minWidth: 0 }} />
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", flexShrink: 0 }}>per</span>
                <SelectField value={unit} onChange={setUnit} options={UNIT_OPTIONS} style={{ flex: "1 1 120px", minWidth: 0 }} />
              </div>
            </FieldRow>
            <FieldRow label="Hours per week">
              <TextField value={hoursPerWeek} onChange={setHoursPerWeek} placeholder={DEFAULTS.hoursPerWeek} />
            </FieldRow>
            <FieldRow label="Days per week">
              <TextField value={daysPerWeek} onChange={setDaysPerWeek} placeholder={DEFAULTS.daysPerWeek} />
            </FieldRow>
            <FieldRow label="Holidays per year">
              <TextField value={holidaysPerYear} onChange={setHolidaysPerYear} placeholder={DEFAULTS.holidaysPerYear} />
            </FieldRow>
            <FieldRow label="Vacation days per year">
              <TextField value={vacationDaysPerYear} onChange={setVacationDaysPerYear} placeholder={DEFAULTS.vacationDaysPerYear} />
            </FieldRow>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: result ? 0 : "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                  Fill in the details and click <strong>Calculate</strong> to see every pay-frequency equivalent.
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ background: "var(--bg-muted)", padding: "10px 14px" }} />
                      <th style={{ textAlign: "right", padding: "10px 14px", fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-muted)" }}>Unadjusted</th>
                      <th style={{ textAlign: "right", padding: "10px 14px", fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-muted)" }}>Holidays &amp; vacation days adjusted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, i) => (
                      <tr key={row.key} style={{ background: i % 2 === 0 ? "var(--bg-white)" : "var(--bg-muted)" }}>
                        <td style={{ padding: "8px 14px", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{row.label}</td>
                        <td style={{ padding: "8px 14px", fontSize: 13.5, textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(result.unadjusted[row.key], { decimals: row.decimals })}</td>
                        <td style={{ padding: "8px 14px", fontSize: 13.5, textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(result.adjusted[row.key], { decimals: row.decimals })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
        This salary calculator assumes the hourly and daily salary inputs to be unadjusted values. All other pay
        frequency inputs are assumed to be holidays and vacation days adjusted values. This calculator also assumes
        52 working weeks or 260 weekdays per year in its calculations. The unadjusted results ignore the holidays
        and paid vacation days.
      </p>
    </div>
  );
}
