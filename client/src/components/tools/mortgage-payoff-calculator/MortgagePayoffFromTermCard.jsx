import { useState } from "react";
import { FieldLabel, DollarField, PercentField, YearsField, RadioOption } from "./MortgagePayoffFormControls";
import { FieldRow, TermYearsMonthsField } from "../loan-calculator/LoanFormControls";
import MortgagePayoffChart from "./MortgagePayoffChart";
import MortgagePayoffAmortizationTable from "./MortgagePayoffAmortizationTable";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import {
  calculateFromRemainingTerm, formatCurrency, formatWholeCurrency, formatYearsAndMonths,
  formatYearsMosShort, formatPercentWhole,
} from "../../../utils/mortgagePayoffCalculatorEngine";

const DEFAULTS = {
  loanAmount: "400000", loanTermYears: "30", annualRatePercent: "6",
  remainingYears: "25", remainingMonths: "0",
  extraMonthly: "500", extraYearly: "0", extraOneTime: "0",
};

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

/** "extra $500.00 per month and $1,200.00 annually at the year end and
 * $10,000.00 starting now" — built from whichever of the 3 extra-
 * payment types are active, in this fixed order, joined by " and ",
 * with " starting now" appended once at the end — confirmed against 4
 * live reference combinations (monthly alone, yearly alone, one-time
 * alone, and all 3 combined) rather than guessed. */
function buildExtraDescription({ extraMonthly, extraYearly, extraOneTime }) {
  const clauses = [];
  if (extraMonthly > 0) clauses.push(`${formatCurrency(extraMonthly)} per month`);
  if (extraYearly > 0) clauses.push(`${formatCurrency(extraYearly)} annually at the year end`);
  if (extraOneTime > 0) clauses.push(formatCurrency(extraOneTime));
  if (!clauses.length) return "no extra payments";
  return `extra ${clauses.join(" and ")} starting now`;
}

function SavingsBox({ title, titleValue, originalLabel, payoffLabel, originalValue, payoffValue, percentLabel }) {
  const barWidth = originalValue > 0 ? Math.round(150 * (payoffValue / originalValue)) : 0;
  return (
    <div style={{ flex: "1 1 200px", textAlign: "center" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.5 }}>{title}<br />{titleValue}</p>
      <p style={{ fontSize: 11.5, color: "#888", marginBottom: 3 }}>Original: {originalLabel}</p>
      <div style={{ height: 10, width: 150, background: "#888", margin: "3px auto" }} />
      <div style={{ height: 10, width: Math.max(0, barWidth), background: "#518428", margin: "3px auto" }} />
      <p style={{ fontSize: 11.5, color: "#518428", marginBottom: 6 }}>With payoff: {payoffLabel}</p>
      <p style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{percentLabel}</p>
    </div>
  );
}

export default function MortgagePayoffFromTermCard() {
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTermYears, setLoanTermYears] = useState("");
  const [annualRatePercent, setAnnualRatePercent] = useState("");
  const [remainingYears, setRemainingYears] = useState("");
  const [remainingMonths, setRemainingMonths] = useState("");
  const [payoffOption, setPayoffOption] = useState("extra");
  const [extraMonthly, setExtraMonthly] = useState("");
  const [extraYearly, setExtraYearly] = useState("");
  const [extraOneTime, setExtraOneTime] = useState("");
  const [result, setResult] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);

  function calculate() {
    const r = calculateFromRemainingTerm({
      loanAmount: loanAmount || DEFAULTS.loanAmount,
      loanTermYears: loanTermYears || DEFAULTS.loanTermYears,
      annualRatePercent: annualRatePercent || DEFAULTS.annualRatePercent,
      remainingYears: remainingYears || DEFAULTS.remainingYears,
      remainingMonths: remainingMonths || DEFAULTS.remainingMonths,
      payoffOption,
      extraMonthly: Number(extraMonthly || (payoffOption === "extra" ? DEFAULTS.extraMonthly : 0)) || 0,
      extraYearly: Number(extraYearly || DEFAULTS.extraYearly) || 0,
      extraOneTime: Number(extraOneTime || DEFAULTS.extraOneTime) || 0,
    });
    setResult(r);
    setShowAmortization(false);
  }

  function clear() {
    setLoanAmount(""); setLoanTermYears(""); setAnnualRatePercent("");
    setRemainingYears(""); setRemainingMonths("");
    setPayoffOption("extra"); setExtraMonthly(""); setExtraYearly(""); setExtraOneTime("");
    setResult(null);
    setShowAmortization(false);
  }

  const hasNew = result && (result.mode === "extra" || result.mode === "biweekly");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: "var(--text-primary)", margin: 0 }}>
        If you know the remaining loan term
      </h2>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        Use this calculator if the term length of the remaining loan is known and there is information on the
        original loan &ndash; good for new loans or preexisting loans that have never been supplemented with any
        external payments.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 18 }}>
            <FieldRow label="Original loan amount">
              <DollarField value={loanAmount} onChange={setLoanAmount} placeholder={DEFAULTS.loanAmount} style={{ width: "100%" }} />
            </FieldRow>
            <FieldRow label="Original loan term">
              <YearsField value={loanTermYears} onChange={setLoanTermYears} placeholder={DEFAULTS.loanTermYears} style={{ width: "100%" }} />
            </FieldRow>
            <FieldRow label="Interest rate">
              <PercentField value={annualRatePercent} onChange={setAnnualRatePercent} placeholder={DEFAULTS.annualRatePercent} style={{ width: "100%" }} />
            </FieldRow>
            <FieldRow label="Remaining term" fieldWidth={200}>
              <TermYearsMonthsField years={remainingYears} months={remainingMonths} onYearsChange={setRemainingYears} onMonthsChange={setRemainingMonths} />
            </FieldRow>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Repayment options</FieldLabel>
              <div style={{ marginTop: 8 }}>
                <RadioOption checked={payoffOption === "together"} onChange={() => setPayoffOption("together")} label="Payback altogether" />
                <RadioOption checked={payoffOption === "extra"} onChange={() => setPayoffOption("extra")} label="Repayment with extra payments">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <DollarField value={extraMonthly} onChange={setExtraMonthly} placeholder={DEFAULTS.extraMonthly} style={{ width: 110 }} />
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>per month</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <DollarField value={extraYearly} onChange={setExtraYearly} placeholder={DEFAULTS.extraYearly} style={{ width: 110 }} />
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>per year</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <DollarField value={extraOneTime} onChange={setExtraOneTime} placeholder={DEFAULTS.extraOneTime} style={{ width: 110 }} />
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>one time</span>
                    </div>
                  </div>
                </RadioOption>
                <RadioOption checked={payoffOption === "biweekly"} onChange={() => setPayoffOption("biweekly")} label="Biweekly repayment" />
                <RadioOption checked={payoffOption === "original"} onChange={() => setPayoffOption("original")} label="Normal repayment" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {!result ? "Results"
                : result.mode === "together" ? `Payoff Amount: ${formatCurrency(result.balance)}`
                : result.mode === "original" ? "Result"
                : `Payoff in ${formatYearsAndMonths(result.newMonths)}`}
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see your payoff breakdown.
                </p>
              ) : result.mode === "together" ? (
                <>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    The remaining balance is <strong>{formatCurrency(result.balance)}</strong>. This is the amount
                    required to repay the entire loan altogether. It will result in savings of{" "}
                    <strong style={{ color: "var(--success)" }}>{formatCurrency(result.remainingTotalInterest)}</strong> in interest.
                  </p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>If payoff altogether</p>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Total Payments</span><span>{formatCurrency(result.totalIfPayoff)}</span></div>
                  <div style={{ ...rowStyle, borderBottom: "none", marginBottom: 12 }}><span style={{ color: "var(--text-secondary)" }}>Total Interest</span><span>{formatCurrency(result.totalInterestIfPayoff)}</span></div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>The original payoff schedule</p>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Monthly Pay</span><span>{formatCurrency(result.monthlyPay)}</span></div>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Total Payments</span><span>{formatCurrency(result.originalTotalPayments)}</span></div>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Total Interest</span><span>{formatCurrency(result.originalTotalInterest)}</span></div>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Remaining Payments</span><span>{formatCurrency(result.remainingTotalPayments)}</span></div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}><span style={{ color: "var(--text-secondary)" }}>Remaining Interest</span><span>{formatCurrency(result.remainingTotalInterest)}</span></div>
                </>
              ) : result.mode === "original" ? (
                <>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 12 }}>Normal loan repayment without extra payments:</p>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Monthly Pay</span><span>{formatCurrency(result.monthlyPay)}</span></div>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Total Payments</span><span>{formatCurrency(result.originalTotalPayments)}</span></div>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Total Interest</span><span>{formatCurrency(result.originalTotalInterest)}</span></div>
                  <div style={rowStyle}><span style={{ color: "var(--text-secondary)" }}>Remaining Payments</span><span>{formatCurrency(result.remainingTotalPayments)}</span></div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}><span style={{ color: "var(--text-secondary)" }}>Remaining Interest</span><span>{formatCurrency(result.remainingTotalInterest)}</span></div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    The remaining balance is <strong>{formatCurrency(result.balance)}</strong>. By paying{" "}
                    {result.mode === "biweekly"
                      ? <><strong>{formatCurrency(result.biweeklyPayment)}</strong> biweekly starting now</>
                      : buildExtraDescription({ extraMonthly: Number(extraMonthly || DEFAULTS.extraMonthly) || 0, extraYearly: Number(extraYearly) || 0, extraOneTime: Number(extraOneTime) || 0 })}
                    , the loan will be paid off in <strong>{formatYearsAndMonths(result.newMonths)}</strong>. It is{" "}
                    <strong>{formatYearsAndMonths(result.remainingTotalMonths - result.newMonths)} earlier</strong>. This
                    results in savings of{" "}
                    <strong style={{ color: "var(--success)" }}>{formatWholeCurrency(result.originalTotalInterest - result.newTotalInterest)}</strong> in interest.
                  </p>

                  <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                    <SavingsBox
                      title="Interest savings"
                      titleValue={formatWholeCurrency(result.originalTotalInterest - result.newTotalInterest)}
                      originalLabel={formatWholeCurrency(result.originalTotalInterest)}
                      payoffLabel={formatWholeCurrency(result.newTotalInterest)}
                      originalValue={result.originalTotalInterest}
                      payoffValue={result.newTotalInterest}
                      percentLabel={`Pay ${formatPercentWhole((result.originalTotalInterest - result.newTotalInterest) / result.originalTotalInterest * 100)} less on interest`}
                    />
                    <SavingsBox
                      title="Time savings"
                      titleValue={formatYearsAndMonths(result.remainingTotalMonths - result.newMonths)}
                      originalLabel={formatYearsMosShort(result.remainingTotalMonths)}
                      payoffLabel={formatYearsMosShort(result.newMonths)}
                      originalValue={result.remainingTotalMonths}
                      payoffValue={result.newMonths}
                      percentLabel={`Payoff ${formatPercentWhole((result.remainingTotalMonths - result.newMonths) / result.remainingTotalMonths * 100)} faster`}
                    />
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th></th>
                        <th style={{ textAlign: "right", fontWeight: 700, color: "var(--text-secondary)", paddingBottom: 6 }}>Original</th>
                        <th style={{ textAlign: "right", fontWeight: 700, color: "var(--text-secondary)", paddingBottom: 6 }}>With payoff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.showMonthlyPayRow && (
                        <tr><td style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Monthly pay</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.monthlyPay)}</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.newMonthlyPay)}</td></tr>
                      )}
                      <tr><td style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Total payments</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.originalTotalPayments)}</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.newTotalPayments)}</td></tr>
                      <tr><td style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Total interest</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.originalTotalInterest)}</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.newTotalInterest)}</td></tr>
                      <tr><td style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Remaining payments</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.remainingTotalPayments)}</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.newRemainingPayments)}</td></tr>
                      <tr><td style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>Remaining interest</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.remainingTotalInterest)}</td><td style={{ textAlign: "right", borderBottom: "1px solid var(--border)" }}>{formatCurrency(result.newRemainingInterest)}</td></tr>
                      <tr><td style={{ padding: "6px 0" }}>Payoff in</td><td style={{ textAlign: "right" }}>{formatYearsMosShort(result.remainingTotalMonths)}</td><td style={{ textAlign: "right" }}>{formatYearsMosShort(result.newMonths)}</td></tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className="card" style={{ padding: 20 }}>
            <MortgagePayoffChart
              oldSchedule={result.oldSchedule}
              newSchedule={hasNew ? result.newSchedule : undefined}
              elapsedYears={hasNew ? result.elapsedMonths / 12 : 0}
            />
          </div>
          <p style={{ textAlign: "center" }}>
            <button type="button" onClick={() => setShowAmortization((v) => !v)} style={{ background: "none", border: "none", color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
              {showAmortization ? "Hide Amortization Table" : "View Amortization Table"}
            </button>
          </p>
          {showAmortization && (
            hasNew ? (
              <MortgagePayoffAmortizationTable
                oldSchedule={result.oldSchedule}
                newSchedule={result.newSchedule}
                elapsedMonths={result.elapsedMonths}
                payoffOption={result.mode}
              />
            ) : (
              <LoanScheduleTable
                title="Monthly Amortization Schedule"
                schedule={result.oldSchedule}
                columns={[
                  { key: "interest", label: "Interest" },
                  { key: "principal", label: "Principal" },
                  { key: "balance", label: "End Balance" },
                ]}
                periodLabel="Month"
              />
            )
          )}
        </>
      )}
    </div>
  );
}
