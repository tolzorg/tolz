import { Fragment } from "react";
import { formatCurrency } from "../../../utils/mortgagePayoffCalculatorEngine";

const th = { textAlign: "right", padding: "8px 10px", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", position: "sticky", top: 0, background: "var(--bg-white)", borderBottom: "1px solid var(--border)" };
const thLeft = { ...th, textAlign: "left" };
const td = { textAlign: "right", padding: "7px 10px", fontSize: 13, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" };
const tdLeft = { ...td, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" };

/** The dual "Original (without payoff)" vs. "With payoff" amortization
 * table shown for the Extra Payments / Biweekly modes — matches the
 * reference's own table exactly, including its highlighted "Extra
 * Payment Starts" / "Biweekly Payment Starts" divider row at the month
 * the new plan takes over (confirmed from its own table-building JS).
 * Rows before that divider show only the original schedule (the new
 * plan hasn't started yet); rows after show both, with the "with
 * payoff" side reading $0.00 once that schedule has already paid off
 * while the original side is still running. */
export default function MortgagePayoffAmortizationTable({ oldSchedule, newSchedule, elapsedMonths = 0, payoffOption }) {
  const dividerLabel = payoffOption === "biweekly" ? "Biweekly Payment Starts" : "Extra Payment Starts";
  const totalRows = Math.max(oldSchedule.length, elapsedMonths + newSchedule.length);
  const zero = { interest: 0, principal: 0, balance: 0 };

  return (
    <div className="card" style={{ padding: 18 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
        Monthly Amortization Schedule
      </p>
      <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...thLeft, verticalAlign: "bottom" }}>Month</th>
              <th colSpan={3} style={{ ...th, textAlign: "center", borderBottom: "1px solid var(--border)" }}>Original (without payoff)</th>
              <th colSpan={3} style={{ ...th, textAlign: "center", borderBottom: "1px solid var(--border)" }}>With payoff</th>
            </tr>
            <tr>
              <th style={th}>Interest</th><th style={th}>Principal</th><th style={th}>End balance</th>
              <th style={th}>Interest</th><th style={th}>Principal</th><th style={th}>End balance</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: totalRows }, (_, i) => {
              const period = i + 1;
              const oldRow = oldSchedule[i] || zero;
              const newRow = period > elapsedMonths ? (newSchedule[period - elapsedMonths - 1] || zero) : null;
              return (
                <Fragment key={period}>
                  {period === elapsedMonths + 1 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "8px 10px", background: "#feb6b6", fontWeight: 700, fontSize: 12.5, color: "var(--text-primary)" }}>
                        {dividerLabel}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={tdLeft}>{period}</td>
                    <td style={td}>{formatCurrency(oldRow.interest)}</td>
                    <td style={td}>{formatCurrency(oldRow.principal)}</td>
                    <td style={td}>{formatCurrency(oldRow.balance)}</td>
                    <td style={td}>{newRow ? formatCurrency(newRow.interest) : "$0.00"}</td>
                    <td style={td}>{newRow ? formatCurrency(newRow.principal) : "$0.00"}</td>
                    <td style={td}>{newRow ? formatCurrency(newRow.balance) : "$0.00"}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
