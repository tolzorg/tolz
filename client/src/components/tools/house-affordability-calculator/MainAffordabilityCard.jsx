import { useState } from "react";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { FieldRow, DollarField, ValueUnitField, TextField, ResultTable } from "./HouseAffordabilityFormControls";
import { calculateHouseAffordability, validateHouseAffordabilityInputs, formatCurrency, formatPercent } from "../../../utils/houseAffordabilityCalculatorEngine";

/** A plain red error line with a small warning icon — matches the
 * reference's own validation styling exactly (a `<font color="red">`
 * message replacing the whole Results panel), confirmed live for all 8
 * of this calculator's validation/edge-case messages. */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

const DEFAULTS = {
  annualIncome: "120000", loanTermYears: "30", interestRate: "6.792", monthlyDebt: "0",
  downValue: "20", downUnit: "percent",
  taxValue: "1.5", taxUnit: "percent",
  hoaValue: "0", hoaUnit: "percent",
  insValue: "0.5", insUnit: "percent",
  dtiUnit: "cv",
};

const DTI_OPTIONS = [
  { value: "cv", label: "Conventional loan (28/36 rule)" },
  { value: "fha", label: "FHA loan (31% front-end, 43% back-end)" },
  { value: "va", label: "VA loan (41%)" },
  { value: "10", label: "10%" }, { value: "15", label: "15%" }, { value: "20", label: "20%" },
  { value: "25", label: "25%" }, { value: "30", label: "30%" }, { value: "35", label: "35%" },
  { value: "40", label: "40%" }, { value: "45", label: "45%" }, { value: "50", label: "50%" },
];

const smallInput = { width: "100%", padding: "6px 8px", fontSize: 13, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)" };

export default function MainAffordabilityCard() {
  const [annualIncome, setAnnualIncome] = useState("");
  const [loanTermYears, setLoanTermYears] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyDebt, setMonthlyDebt] = useState("");
  const [downValue, setDownValue] = useState("");
  const [downUnit, setDownUnit] = useState("percent");
  const [taxValue, setTaxValue] = useState("");
  const [taxUnit, setTaxUnit] = useState("percent");
  const [hoaValue, setHoaValue] = useState("");
  const [hoaUnit, setHoaUnit] = useState("percent");
  const [insValue, setInsValue] = useState("");
  const [insUnit, setInsUnit] = useState("percent");
  const [dtiUnit, setDtiUnit] = useState(DEFAULTS.dtiUnit);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = {
      annualIncome: annualIncome || DEFAULTS.annualIncome,
      loanTermYears: loanTermYears || DEFAULTS.loanTermYears,
      interestRate: interestRate || DEFAULTS.interestRate,
      monthlyDebt: monthlyDebt || DEFAULTS.monthlyDebt,
      downValue: downValue || DEFAULTS.downValue,
      taxValue: taxValue || DEFAULTS.taxValue,
      hoaValue: hoaValue || DEFAULTS.hoaValue,
      insValue: insValue || DEFAULTS.insValue,
    };
    const validationError = validateHouseAffordabilityInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateHouseAffordability({ ...inputs, downUnit, taxUnit, hoaUnit, insUnit, dtiUnit }));
  }

  function clear() {
    setAnnualIncome(""); setLoanTermYears(""); setInterestRate(""); setMonthlyDebt("");
    setDownValue(""); setDownUnit("percent");
    setTaxValue(""); setTaxUnit("percent");
    setHoaValue(""); setHoaUnit("percent");
    setInsValue(""); setInsUnit("percent");
    setDtiUnit(DEFAULTS.dtiUnit);
    setResult(null); setError(null);
  }

  const isCustomPct = !["cv", "fha", "va"].includes(dtiUnit);
  const showPmiNote = dtiUnit === "cv" || isCustomPct;

  let headline = null;
  if (result && !result.unaffordable) {
    // Confirmed live: this trailing "which is X% of the house price"
    // clause also appears when a percent-mode down payment of 100%+ was
    // silently reinterpreted as a flat dollar amount (downTreatedAsDollar),
    // not just when the user explicitly chose dollar mode.
    const downPctText = downUnit === "dollar" || result.downTreatedAsDollar
      ? `, which is ${formatPercent(result.downPercentActual, 1)} of the house price` : "";
    if (result.ruleLabel) {
      headline = (
        <>
          You can afford a house up to <strong style={{ color: "var(--success)" }}>{formatCurrency(result.house)}</strong> {result.ruleLabel}, within
          which <strong>{formatCurrency(result.loan)}</strong> is the loan and <strong>{formatCurrency(result.downPayment)}</strong> is the down
          payment{downPctText}.{result.ruleNote ? ` ${result.ruleNote}` : ""}
        </>
      );
    } else {
      headline = (
        <>
          You can afford a house up to <strong style={{ color: "var(--success)" }}>{formatCurrency(result.house)}</strong>, within
          which <strong>{formatCurrency(result.loan)}</strong> is the loan and <strong>{formatCurrency(result.downPayment)}</strong> is the down
          payment{downPctText}.
        </>
      );
    }
  }

  const topRows = result && !result.unaffordable ? [
    { label: "You can borrow:", cells: [formatCurrency(result.loan)] },
    { label: "Total price of the house:", cells: [formatCurrency(result.house)] },
    { label: "Down payment:", cells: [formatCurrency(result.downPayment)] },
    ...(result.program === "fha" ? [{ label: "FHA upfront insurance premium (1.75%):", cells: [formatCurrency(result.upfrontFhaPremium)] }] : []),
    { label: "Estimated closing cost (one time, assume 3%):", cells: [formatCurrency(result.closingCost)] },
    ...(result.showDtiRatios ? [
      { label: "Front-end debt-to-income (DTI) ratio:", cells: [formatPercent(result.frontEndRatio)] },
      { label: "Back-end debt-to-income (DTI) ratio:", cells: [formatPercent(result.backEndRatio)] },
    ] : []),
    { label: "Total one-time payment at closing:", cells: [formatCurrency(result.totalOneTimeAtClosing)], emphasize: true },
  ] : [];

  const bottomRows = result && !result.unaffordable ? [
    { label: "Monthly mortgage payment:", cells: [formatCurrency(result.monthlyPI)] },
    ...(result.program === "fha" ? [{ label: `Monthly MIP payment (${formatPercent(result.programFeeRate, 2)}):`, cells: [formatCurrency(result.monthlyProgramFee)] }] : []),
    ...(result.program === "va" ? [
      {
        label: (
          <>
            Monthly VA loan funding fee ({formatPercent(result.programFeeRate, 2)}):
            <br /><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Assuming veteran first time use</span>
          </>
        ),
        cells: [formatCurrency(result.monthlyProgramFee)],
      },
    ] : []),
    ...(result.monthlyPmi > 0 ? [{ label: "Monthly PMI insurance payment:", cells: [formatCurrency(result.monthlyPmi)] }] : []),
    { label: "Annual property tax:", cells: [formatCurrency(result.annualTax)] },
    { label: "Annual HOA or co-op fee:", cells: [formatCurrency(result.annualHoa)] },
    { label: "Annual insurance cost:", cells: [formatCurrency(result.annualIns)] },
    { label: "Estimated annual maintenance cost (repair, utility etc., assume 1.5%):", cells: [formatCurrency(result.annualMaintenance)] },
    { label: "Total monthly cost on the house:", cells: [formatCurrency(result.totalMonthlyCost)], emphasize: true },
  ] : [];

  return (
    <section aria-label="House Affordability Calculator" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 3 }}>
          House Affordability Calculator
        </h2>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
          Estimates an affordable house purchase amount based on household income, debts, and lending guidelines.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: "10px 16px", flex: "0 1 380px", maxWidth: 380, minWidth: 280 }}>
          <FieldRow label="Annual household income" hint="The entire before-tax income of the household, including salary, tips, commissions, bonuses, investment income, dividends, alimony received, and more." suffix="before tax">
            <DollarField value={annualIncome} onChange={setAnnualIncome} placeholder={DEFAULTS.annualIncome} />
          </FieldRow>
          <FieldRow label="Mortgage loan term" suffix="years">
            <TextField value={loanTermYears} onChange={setLoanTermYears} placeholder={DEFAULTS.loanTermYears} style={smallInput} />
          </FieldRow>
          <FieldRow label="Interest rate" suffix="%">
            <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} style={smallInput} />
          </FieldRow>
          <FieldRow label="Monthly debt payback" hint="The total of the minimum amounts you pay each month to keep up with ongoing debts, such as student loans, car loans, credit cards, child support, alimony paid, and personal loans." suffix="debts, car, etc">
            <DollarField value={monthlyDebt} onChange={setMonthlyDebt} placeholder={DEFAULTS.monthlyDebt} />
          </FieldRow>
          <FieldRow label="Down payment">
            <ValueUnitField value={downValue} unit={downUnit} onValueChange={setDownValue} onUnitChange={setDownUnit} placeholder={DEFAULTS.downValue} />
          </FieldRow>
          <FieldRow label="Property tax" suffix="per year">
            <ValueUnitField value={taxValue} unit={taxUnit} onValueChange={setTaxValue} onUnitChange={setTaxUnit} placeholder={DEFAULTS.taxValue} />
          </FieldRow>
          <FieldRow label="HOA or co-op fee" suffix="per year">
            <ValueUnitField value={hoaValue} unit={hoaUnit} onValueChange={setHoaValue} onUnitChange={setHoaUnit} placeholder={DEFAULTS.hoaValue} />
          </FieldRow>
          <FieldRow label="Insurance" suffix="per year">
            <ValueUnitField value={insValue} unit={insUnit} onValueChange={setInsValue} onUnitChange={setInsUnit} placeholder={DEFAULTS.insValue} />
          </FieldRow>
          <FieldRow label="Debt-to-income (DTI) ratio" fieldWidth={200}>
            <SelectField value={dtiUnit} onChange={setDtiUnit} options={DTI_OPTIONS} style={{ width: "100%", padding: "6px 22px 6px 8px" }} />
          </FieldRow>

          {showPmiNote && (
            <p style={{ fontSize: 9.5, color: "var(--text-muted)", lineHeight: 1.3, margin: "1px 0 5px" }}>
              PMI insurance will automatically be added to monthly housing costs when the down payment is under 20%,
              since these are assumed to be calculations for conventional loans.
            </p>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: showPmiNote ? 0 : 5 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "8px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "0 1 340px", maxWidth: 340, minWidth: 280 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result && !error ? (
                <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see the affordable house price.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : result.unaffordable ? (
                <ErrorPanel message={result.unaffordableMessage} />
              ) : (
                <>
                  {result.downTreatedAsDollar && (
                    <p style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 8 }}>
                      The down payment was treated as a dollar amount instead of a percentage.
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 13 }}>{headline}</p>
                  <ResultTable columns={["", "Amount"]} rows={topRows} />
                  <ResultTable columns={["", "Amount"]} rows={bottomRows} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
