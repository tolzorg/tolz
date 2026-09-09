import { useState } from "react";
import { DollarField, PercentField, YesNoField, ResultTable } from "./Four01kFormControls";
import { calculateEarlyWithdrawal, formatCurrency } from "../../../utils/four01kCalculatorEngine";

const DEFAULTS = { withdrawalAmount: "10000", federalTaxPercent: "25", stateTaxPercent: "5", localTaxPercent: "0" };

export default function EarlyWithdrawalCard() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [federalTaxPercent, setFederalTaxPercent] = useState("");
  const [stateTaxPercent, setStateTaxPercent] = useState("");
  const [localTaxPercent, setLocalTaxPercent] = useState("");
  const [isEmployed, setIsEmployed] = useState(true);
  const [is55OrOlderWhenLeft, setIs55OrOlderWhenLeft] = useState(false);
  const [hasQualifyingDisability, setHasQualifyingDisability] = useState(false);
  const [hasOtherExemption, setHasOtherExemption] = useState(false);
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateEarlyWithdrawal({
      withdrawalAmount: withdrawalAmount || DEFAULTS.withdrawalAmount,
      federalTaxPercent: federalTaxPercent || DEFAULTS.federalTaxPercent,
      stateTaxPercent: stateTaxPercent || DEFAULTS.stateTaxPercent,
      localTaxPercent: localTaxPercent || DEFAULTS.localTaxPercent,
      isEmployed, is55OrOlderWhenLeft, hasQualifyingDisability, hasOtherExemption,
    }));
  }

  function clear() {
    setWithdrawalAmount(""); setFederalTaxPercent(""); setStateTaxPercent(""); setLocalTaxPercent("");
    setIsEmployed(true); setIs55OrOlderWhenLeft(false); setHasQualifyingDisability(false); setHasOtherExemption(false);
    setResult(null);
  }

  return (
    <section aria-label="401K Early Withdrawal Costs Calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
          401(k) Early Withdrawal Costs Calculator
        </h2>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Early 401(k) withdrawals will result in a penalty. This calculation can determine the actual amount
          received if opting for an early withdrawal.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 16, flex: "1 1 340px", minWidth: 300 }}>
          <DollarField label="Early withdrawal amount" value={withdrawalAmount} onChange={setWithdrawalAmount} placeholder={DEFAULTS.withdrawalAmount} />
          <PercentField label="Federal income tax rate" value={federalTaxPercent} onChange={setFederalTaxPercent} placeholder={DEFAULTS.federalTaxPercent} />
          <PercentField label="State income tax rate" value={stateTaxPercent} onChange={setStateTaxPercent} placeholder={DEFAULTS.stateTaxPercent} />
          <PercentField label="Local/city income tax rate" value={localTaxPercent} onChange={setLocalTaxPercent} placeholder={DEFAULTS.localTaxPercent} />

          <YesNoField label="Are you employed?" value={isEmployed} onChange={setIsEmployed} />
          {!isEmployed && (
            <YesNoField label="Were you 55 or older when you left employment?" value={is55OrOlderWhenLeft} onChange={setIs55OrOlderWhenLeft}
              hint="The 'Rule of 55' waives the early-withdrawal penalty if you left that employer's job in or after the year you turned 55." />
          )}
          <YesNoField label="Do you have a qualifying disability?" value={hasQualifyingDisability} onChange={setHasQualifyingDisability} />
          <YesNoField label="Do you qualify for other penalty exemptions?" value={hasOtherExemption} onChange={setHasOtherExemption}
            hint="E.g. unreimbursed medical expenses, a qualified domestic relations order, or IRS levy." />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see the actual amount you'd receive.
                </p>
              ) : (
                <>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 14 }}>
                    Amount to Receive: <span style={{ color: "var(--success)" }}>{formatCurrency(result.amountToReceive)}</span>
                  </p>
                  <ResultTable
                    columns={["", "Amount"]}
                    rows={[
                      { label: "Total Tax and Penalty:", emphasize: true, cells: [formatCurrency(result.totalTaxAndPenalty)] },
                      { label: "Penalty:", indent: true, cells: [formatCurrency(result.penalty)] },
                      { label: "Federal Income Tax:", indent: true, cells: [formatCurrency(result.federalTax)] },
                      { label: "State Income Tax:", indent: true, cells: [formatCurrency(result.stateTax)] },
                      { label: "Local Income Tax:", indent: true, cells: [formatCurrency(result.localTax)] },
                    ]}
                  />
                  {result.penaltyWaived && (
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      The 10% early-withdrawal penalty was waived based on the exemptions selected.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
