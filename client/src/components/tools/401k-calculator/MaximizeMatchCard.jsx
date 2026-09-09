import { useState } from "react";
import { NumberField, DollarField, PercentField } from "./Four01kFormControls";
import { calculateMaximizeMatch, formatCurrency, formatPercent } from "../../../utils/four01kCalculatorEngine";

const DEFAULTS = {
  currentAge: "30", currentSalary: "75000",
  employerMatch1Percent: "50", employerMatch1LimitPercent: "3",
  employerMatch2Percent: "20", employerMatch2LimitPercent: "6",
};

export default function MaximizeMatchCard() {
  const [currentAge, setCurrentAge] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [employerMatch1Percent, setEmployerMatch1Percent] = useState("");
  const [employerMatch1LimitPercent, setEmployerMatch1LimitPercent] = useState("");
  const [employerMatch2Percent, setEmployerMatch2Percent] = useState("");
  const [employerMatch2LimitPercent, setEmployerMatch2LimitPercent] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateMaximizeMatch({
      currentAge: currentAge || DEFAULTS.currentAge,
      currentSalary: currentSalary || DEFAULTS.currentSalary,
      employerMatch1Percent: employerMatch1Percent || DEFAULTS.employerMatch1Percent,
      employerMatch1LimitPercent: employerMatch1LimitPercent || DEFAULTS.employerMatch1LimitPercent,
      employerMatch2Percent: employerMatch2Percent || DEFAULTS.employerMatch2Percent,
      employerMatch2LimitPercent: employerMatch2LimitPercent || DEFAULTS.employerMatch2LimitPercent,
    }));
  }

  function clear() {
    setCurrentAge(""); setCurrentSalary(""); setEmployerMatch1Percent(""); setEmployerMatch1LimitPercent("");
    setEmployerMatch2Percent(""); setEmployerMatch2LimitPercent("");
    setResult(null);
  }

  return (
    <section aria-label="Maximize Employer 401K Match Calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
          Maximize Employer 401(k) Match Calculator
        </h2>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Contribution percentages that are too low or too high may not take full advantage of employer matches. If
          the percentage is too high, contributions may reach the IRS limit before the end of the year. As a result,
          employers will not match for the rest of the year. This calculation can show the contribution percentage
          window in order to take full advantage of the employer's matching contributions.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 16, flex: "1 1 320px", minWidth: 300 }}>
          <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} />
          <DollarField label="Current annual salary" value={currentSalary} onChange={setCurrentSalary} placeholder={DEFAULTS.currentSalary} />
          <PercentField label="Employer match 1" value={employerMatch1Percent} onChange={setEmployerMatch1Percent} placeholder={DEFAULTS.employerMatch1Percent} />
          <PercentField label="Employer match 1 limit" value={employerMatch1LimitPercent} onChange={setEmployerMatch1LimitPercent} placeholder={DEFAULTS.employerMatch1LimitPercent} />
          <PercentField label="Employer match 2" hint="An optional second match tier, applied to contributions between match 1's limit and match 2's limit." value={employerMatch2Percent} onChange={setEmployerMatch2Percent} placeholder={DEFAULTS.employerMatch2Percent} />
          <PercentField label="Employer match 2 limit" value={employerMatch2LimitPercent} onChange={setEmployerMatch2LimitPercent} placeholder={DEFAULTS.employerMatch2LimitPercent} />

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
                  Fill in the details and click <strong>Calculate</strong> to see the contribution window that
                  captures your full employer match.
                </p>
              ) : (
                <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.7 }}>
                  It is recommended to make contributions to your 401(k) somewhere between{" "}
                  <strong style={{ color: "var(--success)" }}>{formatPercent(result.lowerBoundPercent)}</strong> and{" "}
                  <strong style={{ color: "var(--success)" }}>{formatPercent(result.upperBoundPercent)}</strong> of
                  annual income to take full advantage of your employer match. By contributing {formatPercent(result.lowerBoundPercent)},
                  the total 401(k) contribution amount will be <strong>{formatCurrency(result.lower.totalContribution, { decimals: 0 })}</strong>,
                  within which employer match is <strong>{formatCurrency(result.lower.employerMatch, { decimals: 0 })}</strong> and
                  employee contribution is <strong>{formatCurrency(result.lower.employeeContribution, { decimals: 0 })}</strong>.
                  By contributing {formatPercent(result.upperBoundPercent)}, the total 401(k) contribution amount will
                  be <strong>{formatCurrency(result.upper.totalContribution, { decimals: 0 })}</strong>, within which employer
                  match is <strong>{formatCurrency(result.upper.employerMatch, { decimals: 0 })}</strong> and employee
                  contribution is <strong>{formatCurrency(result.upper.employeeContribution, { decimals: 0 })}</strong>.
                  {result.isHighContribution && (
                    <> {formatPercent(result.upperBoundPercent)} is a very high contribution percentage, and not all employers allow such high contribution percentages.</>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
