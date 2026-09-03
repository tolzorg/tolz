import { formatCurrency, formatMonthYear, formatYearsAndMonths, formatDecimalYears } from "../../../utils/mortgageCalculatorEngine";
import MortgagePieChart from "./MortgagePieChart";

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };
const metricRowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

export default function MortgageResultsPanel({ result }) {
  if (!result) {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13.5 }}>
        Fill in the loan details and click <strong>Calculate</strong> to see your monthly payment and full breakdown.
      </div>
    );
  }

  const { homePrice, downPaymentDollars, loanAmount, schedule, baselineSchedule, biweekly, includeTaxesAndCosts, hasExtraPayments } = result;
  const first = schedule.monthlyRows[0] || { propertyTaxMonthly: 0, homeInsuranceMonthly: 0, pmiMonthly: 0, hoaMonthly: 0, otherCostsMonthly: 0, extraPayment: 0 };
  const monthlyPI = schedule.monthlyPI;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          background: "var(--success)", color: "#fff", padding: "18px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Monthly Pay:</span>
          <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)", flex: 1, textAlign: "right" }}>{formatCurrency(monthlyPI)}</span>
          <button
            type="button"
            onClick={() => window.print()}
            title="Print / Save as PDF"
            aria-label="Print or save these results"
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "var(--radius-sm)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 2.5h6l2 2v3H4v-5z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M4 11.5h6V14H4v-2.5z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
              <rect x="2" y="6.5" width="12" height="5" rx="1" stroke="#fff" strokeWidth="1.3" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {hasExtraPayments && baselineSchedule && (
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
              With the extra payment(s), the loan will be paid off in <strong>{formatYearsAndMonths(schedule.totalMonths)}</strong>, and{" "}
              <strong style={{ color: "var(--success)" }}>{formatCurrency(baselineSchedule.totalInterest - schedule.totalInterest, { decimals: 0 })} interest</strong> will be saved.
            </p>
          )}

          {includeTaxesAndCosts ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", paddingBottom: 8 }}>
                <span></span>
                <div style={{ display: "flex", gap: 28 }}>
                  <span style={{ width: 90, textAlign: "right" }}>{hasExtraPayments ? "First Month" : "Monthly"}</span>
                  <span style={{ width: 100, textAlign: "right" }}>Total</span>
                </div>
              </div>

              {[
                ["Mortgage Payment", monthlyPI, schedule.totalMortgagePayment, true],
                ...(hasExtraPayments ? [["Extra Payment", first.extraPayment, schedule.totalExtraPayments, false]] : []),
                ["Property Tax", first.propertyTaxMonthly, schedule.totalPropertyTax, false],
                ["Home Insurance", first.homeInsuranceMonthly, schedule.totalHomeInsurance, false],
                ["HOA Fee", first.hoaMonthly, schedule.totalHoaFee, false],
                // "Other Costs" bundles PMI with the raw "Other Costs" field
                // — HOA gets its own line above instead of being folded in.
                ["Other Costs", first.pmiMonthly + first.otherCostsMonthly, schedule.totalOtherCosts, false],
              ].map(([label, monthly, total, bold]) => (
                <div key={label} style={{ ...rowStyle, fontWeight: bold ? 700 : 500, color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  <span>{label}</span>
                  <div style={{ display: "flex", gap: 28 }}>
                    <span style={{ width: 90, textAlign: "right" }}>{formatCurrency(monthly)}</span>
                    <span style={{ width: 100, textAlign: "right" }}>{formatCurrency(total)}</span>
                  </div>
                </div>
              ))}

              <div style={{ ...rowStyle, borderBottom: "none", fontWeight: 800, color: "var(--text-primary)", fontSize: 14.5 }}>
                <span>Total Out-of-Pocket</span>
                <div style={{ display: "flex", gap: 28 }}>
                  <span style={{ width: 90, textAlign: "right" }}>
                    {formatCurrency(monthlyPI + first.extraPayment + first.propertyTaxMonthly + first.homeInsuranceMonthly + first.hoaMonthly + first.pmiMonthly + first.otherCostsMonthly)}
                  </span>
                  <span style={{ width: 100, textAlign: "right" }}>
                    {formatCurrency(schedule.totalMortgagePayment + schedule.totalExtraPayments + schedule.totalPropertyTax + schedule.totalHomeInsurance + schedule.totalHoaFee + schedule.totalOtherCosts)}
                  </span>
                </div>
              </div>

              {/* Uses TOTAL life-of-loan sums, not first-month figures — the
                  two diverge once cost escalation is active (a cost that's
                  small in month 1 but compounds significantly over a
                  30-year term is invisible in a first-month snapshot but
                  very real over the life of the loan), so first-month
                  percentages would visibly misrepresent where the money
                  actually goes. Verified against the reference's own
                  worked example with escalation active. */}
              <div style={{ marginTop: 20 }}>
                <MortgagePieChart segments={[
                  { label: "Principal & Interest", value: schedule.totalMortgagePayment, color: "#3b7bfc" },
                  { label: "Property Taxes", value: schedule.totalPropertyTax, color: "#16a34a" },
                  { label: "Home Insurance", value: schedule.totalHomeInsurance, color: "#dc2626" },
                  { label: "HOA Fee", value: schedule.totalHoaFee, color: "#0ea5e9" },
                  { label: "Other Cost", value: schedule.totalOtherCosts, color: "#7c3aed" },
                ]} />
              </div>
            </>
          ) : (
            <MortgagePieChart segments={[
              { label: "Principal", value: schedule.totalPrincipalPaid, color: "#3b7bfc" },
              { label: "Interest", value: schedule.totalInterest, color: "#16a34a" },
            ]} />
          )}
        </div>
      </div>

      <div className="card" style={{ padding: "18px 22px" }}>
        {[
          ["House Price", formatCurrency(homePrice, { decimals: 2 })],
          ["Loan Amount", formatCurrency(loanAmount, { decimals: 2 })],
          ["Down Payment", formatCurrency(downPaymentDollars, { decimals: 2 })],
          [`Total of ${schedule.totalMonths} Mortgage Payments`, formatCurrency(schedule.totalMortgagePayment, { decimals: 2 })],
          ["Total Interest", formatCurrency(schedule.totalInterest, { decimals: 2 })],
          ...(hasExtraPayments ? [["Total Extra Payments", formatCurrency(schedule.totalExtraPayments, { decimals: 2 })]] : []),
          ["Mortgage Payoff Date", formatMonthYear(schedule.payoffDate.month, schedule.payoffDate.year)],
        ].map(([label, value]) => (
          <div key={label} style={metricRowStyle}>
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
          </div>
        ))}
      </div>

      {biweekly && (
        <>
          <div className="card" style={{ padding: "18px 22px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 10 }}>
              If Payback Biweekly without Extra Payments
            </p>
            {[
              ["Biweekly Payment", formatCurrency(biweekly.biweeklyPaymentAmount)],
              ["Total Interest", formatCurrency(biweekly.biweeklyTotalInterest, { decimals: 2 })],
              ["Payoff Length", formatDecimalYears(biweekly.biweeklyMonths)],
            ].map(([label, value]) => (
              <div key={label} style={metricRowStyle}>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "18px 22px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 10 }}>
              Interest to be Saved
            </p>
            {hasExtraPayments && baselineSchedule && (
              <div style={metricRowStyle}>
                <span style={{ color: "var(--text-secondary)" }}>With the extra payment(s)</span>
                <span style={{ fontWeight: 700, color: "var(--success)" }}>{formatCurrency(baselineSchedule.totalInterest - schedule.totalInterest, { decimals: 2 })}</span>
              </div>
            )}
            <div style={{ ...metricRowStyle, borderBottom: "none" }}>
              <span style={{ color: "var(--text-secondary)" }}>With Biweekly Payment Only<br /><span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>(without Extra Payments)</span></span>
              <span style={{ fontWeight: 700, color: "var(--success)" }}>{formatCurrency(biweekly.interestSaved, { decimals: 2 })}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
