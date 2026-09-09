import { useState } from "react";
import { NumberField, DollarField, PercentField, ResultTable, ScheduleTable, ValidationWarning } from "./Four01kFormControls";
import BalanceGrowthChart from "./BalanceGrowthChart";
import { calculateBalanceProjection, validate401kAges, formatCurrency } from "../../../utils/four01kCalculatorEngine";

const DEFAULTS = {
  currentAge: "30", currentSalary: "75000", currentBalance: "35000", contributionPercent: "10",
  employerMatchPercent: "50", employerMatchLimitPercent: "3",
  retirementAge: "65", lifeExpectancy: "85", salaryIncreasePercent: "3", avgReturnPercent: "6", inflationPercent: "3",
};

export default function BalanceProjectionCard() {
  const [currentAge, setCurrentAge] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [contributionPercent, setContributionPercent] = useState("");
  const [employerMatchPercent, setEmployerMatchPercent] = useState("");
  const [employerMatchLimitPercent, setEmployerMatchLimitPercent] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [salaryIncreasePercent, setSalaryIncreasePercent] = useState("");
  const [avgReturnPercent, setAvgReturnPercent] = useState("");
  const [inflationPercent, setInflationPercent] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = {
      currentAge: currentAge || DEFAULTS.currentAge,
      retirementAge: retirementAge || DEFAULTS.retirementAge,
      lifeExpectancy: lifeExpectancy || DEFAULTS.lifeExpectancy,
    };
    const validationError = validate401kAges(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateBalanceProjection({
      ...inputs,
      currentSalary: currentSalary || DEFAULTS.currentSalary,
      currentBalance: currentBalance || DEFAULTS.currentBalance,
      contributionPercent: contributionPercent || DEFAULTS.contributionPercent,
      employerMatchPercent: employerMatchPercent || DEFAULTS.employerMatchPercent,
      employerMatchLimitPercent: employerMatchLimitPercent || DEFAULTS.employerMatchLimitPercent,
      salaryIncreasePercent: salaryIncreasePercent || DEFAULTS.salaryIncreasePercent,
      avgReturnPercent: avgReturnPercent || DEFAULTS.avgReturnPercent,
      inflationPercent: inflationPercent || DEFAULTS.inflationPercent,
    }));
  }

  function clear() {
    setCurrentAge(""); setCurrentSalary(""); setCurrentBalance(""); setContributionPercent("");
    setEmployerMatchPercent(""); setEmployerMatchLimitPercent(""); setRetirementAge(""); setLifeExpectancy("");
    setSalaryIncreasePercent(""); setAvgReturnPercent(""); setInflationPercent("");
    setResult(null); setError(null);
  }

  const retireAgeDisplay = result ? result.effectiveRetireAge : (retirementAge || DEFAULTS.retirementAge);
  const lifeExpectancyDisplay = lifeExpectancy || DEFAULTS.lifeExpectancy;

  const scheduleRows = result
    ? result.schedule.map((row) => ({
        age: row.age,
        cells: [formatCurrency(row.contribution, { decimals: 2 }), formatCurrency(row.investmentReturn, { decimals: 2 }), formatCurrency(row.endBalance, { decimals: 2 })],
      })).concat(result.payoutSchedule.map((row) => ({
        age: row.age,
        cells: [`(${formatCurrency(row.payout, { decimals: 2 })})`, formatCurrency(row.investmentReturn, { decimals: 2 }), formatCurrency(row.endBalance, { decimals: 2 })],
      })))
    : [];

  return (
    <section aria-label="401K Calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
          401K Calculator
        </h2>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Estimate a 401(k) balance at retirement, and how much can be withdrawn from it afterward, based on income,
          contribution percentage, age, salary increases, and investment return.
        </p>
      </div>

      {error && <ValidationWarning message={error} />}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 16, flex: "1 1 340px", minWidth: 300 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 10 }}>Basic info</p>
          <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} />
          <DollarField label="Current annual salary" value={currentSalary} onChange={setCurrentSalary} placeholder={DEFAULTS.currentSalary} />
          <DollarField label="Current 401(k) balance" value={currentBalance} onChange={setCurrentBalance} placeholder={DEFAULTS.currentBalance} />
          <PercentField label="Contribution (% of salary)" value={contributionPercent} onChange={setContributionPercent} placeholder={DEFAULTS.contributionPercent} />
          <PercentField label="Employer match" hint="Percentage of your contribution the employer matches, up to the limit below." value={employerMatchPercent} onChange={setEmployerMatchPercent} placeholder={DEFAULTS.employerMatchPercent} />
          <PercentField label="Employer match limit" hint="The employer only matches contributions up to this percentage of salary." value={employerMatchLimitPercent} onChange={setEmployerMatchLimitPercent} placeholder={DEFAULTS.employerMatchLimitPercent} />

          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em", margin: "18px 0 10px" }}>Projections</p>
          <NumberField label="Expected retirement age" value={retirementAge} onChange={setRetirementAge} placeholder={DEFAULTS.retirementAge} />
          <NumberField label="Life expectancy" value={lifeExpectancy} onChange={setLifeExpectancy} placeholder={DEFAULTS.lifeExpectancy} />
          <PercentField label="Expected salary increase" suffix="per year" value={salaryIncreasePercent} onChange={setSalaryIncreasePercent} placeholder={DEFAULTS.salaryIncreasePercent} />
          <PercentField label="Expected annual return" suffix="per year" value={avgReturnPercent} onChange={setAvgReturnPercent} placeholder={DEFAULTS.avgReturnPercent} />
          <PercentField label="Expected inflation rate" suffix="per year" value={inflationPercent} onChange={setInflationPercent} placeholder={DEFAULTS.inflationPercent} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see your projected 401(k) balance.
                </p>
              ) : (
                <>
                  {result.alreadyRetired ? (
                    // Retirement age <= current age: no accumulation years
                    // exist to project, so the reference collapses the
                    // entire headline+chart+breakdown-table section down to
                    // this single line instead — verified live.
                    <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 16 }}>
                      Total investment returns: <strong style={{ color: "var(--success)" }}>{formatCurrency(result.contributionsBreakdown.investmentReturns, { decimals: 0 })}</strong>
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 16 }}>
                        At the retirement age of <strong>{retireAgeDisplay}</strong>, the 401(k) balance will be{" "}
                        <strong style={{ color: "var(--success)" }}>{formatCurrency(result.balanceAtRetirement, { decimals: 0 })}</strong>,
                        which is equivalent to <strong style={{ color: "var(--success)" }}>{formatCurrency(result.todaysPurchasingPower, { decimals: 0 })}</strong> in
                        purchasing power today.
                      </p>

                      <div style={{ marginBottom: 16 }}>
                        <BalanceGrowthChart chartData={result.chartData} />
                      </div>

                      <ResultTable
                        columns={["", "Amount"]}
                        rows={[
                          { label: `Balance at ${retireAgeDisplay}:`, emphasize: true, cells: [formatCurrency(result.balanceAtRetirement, { decimals: 0 })] },
                          { label: "Total contributions:", cells: [formatCurrency(result.contributionsBreakdown.employee + result.contributionsBreakdown.employer, { decimals: 0 })] },
                          { label: "Employee contributions:", indent: true, cells: [formatCurrency(result.contributionsBreakdown.employee, { decimals: 0 })] },
                          { label: "Employer match:", indent: true, cells: [formatCurrency(result.contributionsBreakdown.employer, { decimals: 0 })] },
                          { label: "Investment returns:", cells: [formatCurrency(result.contributionsBreakdown.investmentReturns, { decimals: 0 })] },
                        ]}
                      />
                    </>
                  )}

                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "18px 0 10px" }}>Withdrawal</p>

                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
                    If withdrawing at fixed purchasing power monthly, <strong>{formatCurrency(result.growing.monthlyAtRetirement, { decimals: 0 })}</strong> per
                    month can be withdrawn from age {retireAgeDisplay + 1} and increase {inflationPercent || DEFAULTS.inflationPercent}% per year until {lifeExpectancyDisplay}.
                    {/* The "today's money at retirement" clause is trivially
                        equal to the actual amount when 0 years have passed —
                        the reference omits it entirely in that case. */}
                    {!result.alreadyRetired && (
                      <> It is equivalent to <strong>{formatCurrency(result.growing.todaysMoney, { decimals: 0 })}</strong> in purchasing power today.</>
                    )}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
                    If withdrawing at fixed amount monthly, <strong>{formatCurrency(result.flatMonthly.amount, { decimals: 0 })}</strong> per
                    month can be withdrawn in retirement until {lifeExpectancyDisplay}.{" "}
                    {result.alreadyRetired ? (
                      <>At {lifeExpectancyDisplay}, it is equivalent to <strong>{formatCurrency(result.flatMonthly.todaysAtLifeExpectancy, { decimals: 0 })}</strong> in purchasing power today.</>
                    ) : (
                      <>
                        At {retireAgeDisplay + 1}, this is equivalent
                        to <strong>{formatCurrency(result.flatMonthly.todaysAtRetirement, { decimals: 0 })}</strong> in purchasing power today, and
                        at {lifeExpectancyDisplay}, is equivalent to <strong>{formatCurrency(result.flatMonthly.todaysAtLifeExpectancy, { decimals: 0 })}</strong>.
                      </>
                    )}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    If withdrawing at fixed amount annually, <strong>{formatCurrency(result.flatAnnual.amount, { decimals: 0 })}</strong> per
                    year can be withdrawn in retirement until {lifeExpectancyDisplay}.{" "}
                    {result.alreadyRetired ? (
                      <>At {lifeExpectancyDisplay}, it is equivalent to <strong>{formatCurrency(result.flatAnnual.todaysAtLifeExpectancy, { decimals: 0 })}</strong> in purchasing power today.</>
                    ) : (
                      <>
                        At {retireAgeDisplay}, this is equivalent
                        to <strong>{formatCurrency(result.flatAnnual.todaysAtRetirement, { decimals: 0 })}</strong> in purchasing power today, and
                        at {lifeExpectancyDisplay}, is equivalent to <strong>{formatCurrency(result.flatAnnual.todaysAtLifeExpectancy, { decimals: 0 })}</strong>.
                      </>
                    )}
                  </p>

                  <ScheduleTable rows={scheduleRows} columns={["Contribution / Payout", "Investment return", "End balance"]} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
