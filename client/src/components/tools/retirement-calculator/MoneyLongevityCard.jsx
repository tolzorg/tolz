import { useState } from "react";
import { DollarField, PercentField, ResultTable } from "./RetirementFormControls";
import { calculateMoneyLongevity, formatCurrency, formatYearsAndDecimalMonths } from "../../../utils/retirementCalculatorEngine";

const DEFAULTS = { amountYouHave: "500000", monthlyWithdraw: "3000", avgReturn: "6" };

export default function MoneyLongevityCard() {
  const [amountYouHave, setAmountYouHave] = useState("");
  const [monthlyWithdraw, setMonthlyWithdraw] = useState("");
  const [avgReturn, setAvgReturn] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateMoneyLongevity({
      amountYouHave: amountYouHave || DEFAULTS.amountYouHave,
      monthlyWithdraw: monthlyWithdraw || DEFAULTS.monthlyWithdraw,
      avgReturnPercent: avgReturn || DEFAULTS.avgReturn,
    }));
  }

  function clear() {
    setAmountYouHave(""); setMonthlyWithdraw(""); setAvgReturn("");
    setResult(null);
  }

  const amountDisplay = formatCurrency(Number(amountYouHave || DEFAULTS.amountYouHave), { decimals: 0 });
  const monthlyDisplay = formatCurrency(Number(monthlyWithdraw || DEFAULTS.monthlyWithdraw), { decimals: 0 });

  return (
    <section aria-label="How long can your money last calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
          How long can your money last?
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          This calculation estimates how long retirement savings can last given a fixed monthly withdrawal amount.
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 20, flex: "1 1 320px", minWidth: 300 }}>
          <DollarField label="The amount you have" value={amountYouHave} onChange={setAmountYouHave} placeholder={DEFAULTS.amountYouHave} fieldWidth={140} />
          <DollarField label="Your planned monthly withdrawal" value={monthlyWithdraw} onChange={setMonthlyWithdraw} placeholder={DEFAULTS.monthlyWithdraw} fieldWidth={140} />
          <PercentField label="Average investment return" value={avgReturn} onChange={setAvgReturn} placeholder={DEFAULTS.avgReturn} fieldWidth={140} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see how long your money can last.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 18 }}>
                    If withdraw <strong>{monthlyDisplay}</strong> per month, <strong>{amountDisplay}</strong> can last{" "}
                    <strong style={{ color: "var(--success)" }}>{formatYearsAndDecimalMonths(result.months)}</strong>.
                  </p>

                  <ResultTable
                    columns={["Withdraw length", "Withdraw amount"]}
                    rows={result.withdrawLengthTable.map((row) => ({
                      label: `${row.years} ${row.years === 1 ? "year" : "years"}`,
                      cells: [`${formatCurrency(row.monthlyAmount, { decimals: 2 })}/month`],
                    }))}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
