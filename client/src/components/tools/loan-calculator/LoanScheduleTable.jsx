import { formatCurrency as defaultFormatCurrency } from "../../../utils/loanCalculatorEngine";

const th = { textAlign: "right", padding: "8px 10px", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", position: "sticky", top: 0, background: "var(--bg-white)", borderBottom: "1px solid var(--border)" };
const thLeft = { ...th, textAlign: "left" };
const td = { textAlign: "right", padding: "7px 10px", fontSize: 13, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" };
const tdLeft = { ...td, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" };

/** Shared period-by-period schedule table, reused across the Loan/Auto
 * Loan/Interest/Payment/Amortization/Finance calculators. `columns` is
 * an ordered list of {key, label, text?} pairs pulled from each row
 * object — formatted as currency by default, or printed as plain text
 * when `text: true` (e.g. a calendar-date column like the Amortization
 * Calculator's "Sep. 2026", which the reference shows alongside the
 * period number); the first column's header defaults to "Period" but
 * can be overridden (e.g. "Month"/"Year") via `periodLabel` to match a
 * reference site's own schedule table exactly. `formatValue` optionally
 * overrides the currency formatter (default: loanCalculatorEngine's
 * `formatCurrency`, i.e. native "-$2,000.00") — added for the Finance
 * Calculator, whose reference shows negatives as "$-2,000.00" instead. */
export default function LoanScheduleTable({ title, schedule, columns, periodLabel = "Period", formatValue = defaultFormatCurrency }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
        {title}
      </p>
      <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thLeft}>{periodLabel}</th>
              {columns.map((c) => <th key={c.key} style={th}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.period}>
                <td style={tdLeft}>{row.period}</td>
                {columns.map((c) => (
                  <td key={c.key} style={td}>{c.text ? row[c.key] : formatValue(row[c.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
