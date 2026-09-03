import { formatCurrency, formatMonthYear, MONTH_NAMES } from "../../../utils/mortgageCalculatorEngine";

const th = { textAlign: "right", padding: "8px 10px", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", position: "sticky", top: 0, background: "var(--bg-white)", borderBottom: "1px solid var(--border)" };
const thLeft = { ...th, textAlign: "left" };
const td = { textAlign: "right", padding: "7px 10px", fontSize: 13, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" };
const tdLeft = { ...td, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" };

export default function MortgageAmortizationTable({ schedule, view, onViewChange }) {
  const rows = view === "monthly" ? schedule.monthlyRows : schedule.annualRows;

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Amortization Schedule</p>
        <div style={{ display: "flex", gap: 6 }}>
          {["annual", "monthly"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)",
                cursor: "pointer",
                border: `1px solid ${view === v ? "var(--accent)" : "var(--border)"}`,
                background: view === v ? "var(--accent-light)" : "var(--bg-white)",
                color: view === v ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {v === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thLeft}>{view === "monthly" ? "Date" : "Year"}</th>
              <th style={th}>Interest</th>
              <th style={th}>Principal</th>
              <th style={th}>Ending Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={view === "monthly" ? row.monthIndex : row.year}>
                <td style={tdLeft}>
                  {view === "monthly"
                    ? formatMonthYear(row.date.month, row.date.year)
                    : `${row.year} (${MONTH_NAMES[row.startDate.month - 1]} ${row.startDate.year} – ${MONTH_NAMES[row.endDate.month - 1]} ${row.endDate.year})`}
                </td>
                <td style={td}>{formatCurrency(row.interest)}</td>
                <td style={td}>{formatCurrency(row.principal)}</td>
                <td style={td}>{formatCurrency(row.endingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
