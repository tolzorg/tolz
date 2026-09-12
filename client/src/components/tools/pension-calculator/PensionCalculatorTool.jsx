import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import PensionLineChart from "./PensionLineChart";
import {
  calculateLumpSumOrMonthly, calculateSingleLifeOrJoint, calculateWorkLonger, formatCurrency,
} from "../../../utils/pensionCalculatorEngine";

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.-]/g, "");
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return (negative ? "-" : "") + cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned || cleaned === "-") return cleaned;
  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;
  const [intPart, decPart] = body.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  return (negative ? "-" : "") + formatted;
}

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19 }}
      />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={(v) => onChange(stripToNumberString(v))} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>%</span>
    </div>
  );
}

function PlainField({ value, onChange, placeholder }) {
  return <TextField value={value} onChange={(v) => onChange(stripToNumberString(v))} placeholder={placeholder} style={{ flex: 1, minWidth: 0 }} />;
}

function SectionHeader({ children }) {
  return (
    <div style={{
      background: "var(--accent)", color: "#fff", padding: "7px 12px", fontSize: 12.5,
      fontWeight: 700, fontFamily: "var(--font-display)", marginTop: 14, marginBottom: 4,
      borderRadius: "var(--radius-sm)",
    }}>
      {children}
    </div>
  );
}

function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

const cardRow = { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" };
const inputCard = { flex: "1 1 420px", minWidth: 320, padding: 16 };
const resultCard = { flex: "1 1 380px", minWidth: 320, padding: 0, overflow: "hidden", alignSelf: "flex-start" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" };
const resultBody = { padding: "16px 18px" };
const sentenceStyle = { fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 10px" };
const footnoteStyle = { fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, margin: "14px 0 0" };

function SectionTitle({ children, subtitle }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
        {children}
      </h2>
      {subtitle && <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. Lump sum payout or monthly pension income?
// ═══════════════════════════════════════════════════════════════════
function LumpSumOrMonthlySection() {
  const [retirementAge, setRetirementAge] = useState("");
  const [lumpSumAmount, setLumpSumAmount] = useState("");
  const [investmentReturn, setInvestmentReturn] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [cola, setCola] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateLumpSumOrMonthly({
      retirementAge: retirementAge || 65,
      lumpSumAmount: lumpSumAmount || 800000,
      investmentReturn: investmentReturn || 5,
      monthlyIncome: monthlyIncome || 5000,
      cola: cola || 3.5,
    }));
  }
  function clear() {
    setRetirementAge(""); setLumpSumAmount(""); setInvestmentReturn(""); setMonthlyIncome(""); setCola(""); setResult(null);
  }

  return (
    <div style={cardRow}>
      <div className="card" style={inputCard}>
        <FieldRow label="Your retirement age"><PlainField value={retirementAge} onChange={setRetirementAge} placeholder="65" /></FieldRow>

        <SectionHeader>Option 1: lump sum payment</SectionHeader>
        <FieldRow label="Lump sum payment amount"><DollarField value={lumpSumAmount} onChange={setLumpSumAmount} placeholder="800000" /></FieldRow>
        <FieldRow label="Your investment return" suffix="per year"><PercentField value={investmentReturn} onChange={setInvestmentReturn} placeholder="5" /></FieldRow>

        <SectionHeader>Option 2: monthly pension payment</SectionHeader>
        <FieldRow label="Monthly pension income" suffix="per month"><DollarField value={monthlyIncome} onChange={setMonthlyIncome} placeholder="5000" /></FieldRow>
        <FieldRow label="Cost-of-living adjustment" hint="Increases your pension payments annually to help keep up with inflation." suffix="per year"><PercentField value={cola} onChange={setCola} placeholder="3.5" /></FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      <div className="card" style={resultCard}>
        <div style={resultBanner}>Result</div>
        <div style={resultBody}>
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in the fields and click <strong>Calculate</strong> to compare a lump sum payout vs. monthly pension income.
            </p>
          ) : result.error ? (
            <ErrorPanel message={result.error} />
          ) : (
            <>
              <p style={sentenceStyle}>
                {result.sentence.kind === "alwaysMonthly" && "It is better to take monthly pension income."}
                {result.sentence.kind === "alwaysLumpSum" && `With this investment return of ${result.sentence.investmentReturn || 5}% per year, it is better to take the lump sum payout.`}
                {result.sentence.kind === "crossover" && (
                  <>With the investment return of {result.sentence.investmentReturn || 5}% per year, if you can live up to <strong>age {result.sentence.crossoverAge} or older</strong>, it is better to take monthly pension income. Otherwise, it is better to take the lump sum payout.</>
                )}
              </p>
              <PensionLineChart series={[
                { label: "Lump sum payout", color: "#2b7ddb", points: result.lumpSumSeries },
                { label: "Monthly pension income", color: "#8bbc21", points: result.monthlySeries },
              ]} />
              <p style={footnoteStyle}>
                * Please note that the calculation above assumes that the lump sum payment rollover (transfer) to tax deferred investment account such as IRA etc. without being taxed upfront. If the lump sum payment is taxable, you can use the after-tax amount in calculation.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. Single-life or joint-and-survivor pension payout?
// ═══════════════════════════════════════════════════════════════════
function SingleLifeOrJointSection() {
  const [retirementAge, setRetirementAge] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [spousesAge, setSpousesAge] = useState("");
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState("");
  const [singleLifePension, setSingleLifePension] = useState("");
  const [jointSurvivorPension, setJointSurvivorPension] = useState("");
  const [investmentReturn, setInvestmentReturn] = useState("");
  const [cola, setCola] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateSingleLifeOrJoint({
      retirementAge: retirementAge || 65,
      lifeExpectancy: lifeExpectancy || 77,
      spousesAge: spousesAge || 62,
      spouseLifeExpectancy: spouseLifeExpectancy || 82,
      singleLifePension: singleLifePension || 5000,
      jointSurvivorPension: jointSurvivorPension || 3000,
      investmentReturn: investmentReturn || 5,
      cola: cola || 3.5,
    }));
  }
  function clear() {
    setRetirementAge(""); setLifeExpectancy(""); setSpousesAge(""); setSpouseLifeExpectancy("");
    setSingleLifePension(""); setJointSurvivorPension(""); setInvestmentReturn(""); setCola(""); setResult(null);
  }

  return (
    <div style={cardRow}>
      <div className="card" style={inputCard}>
        <FieldRow label="Your retirement age"><PlainField value={retirementAge} onChange={setRetirementAge} placeholder="65" /></FieldRow>
        <FieldRow label="Your life expectancy"><PlainField value={lifeExpectancy} onChange={setLifeExpectancy} placeholder="77" /></FieldRow>
        <FieldRow label="Spouse's age when you retire"><PlainField value={spousesAge} onChange={setSpousesAge} placeholder="62" /></FieldRow>
        <FieldRow label="Spouse's life expectancy"><PlainField value={spouseLifeExpectancy} onChange={setSpouseLifeExpectancy} placeholder="82" /></FieldRow>
        <FieldRow label="Single life pension" suffix="per month"><DollarField value={singleLifePension} onChange={setSingleLifePension} placeholder="5000" /></FieldRow>
        <FieldRow label="Joint survivor pension" suffix="per month"><DollarField value={jointSurvivorPension} onChange={setJointSurvivorPension} placeholder="3000" /></FieldRow>
        <FieldRow label="Your investment return" suffix="per year"><PercentField value={investmentReturn} onChange={setInvestmentReturn} placeholder="5" /></FieldRow>
        <FieldRow label="Cost-of-living adjustment" hint="Increases your pension payments annually to help keep up with inflation." suffix="per year"><PercentField value={cola} onChange={setCola} placeholder="3.5" /></FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      <div className="card" style={resultCard}>
        <div style={resultBanner}>Result</div>
        <div style={resultBody}>
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in the fields and click <strong>Calculate</strong> to compare a single-life pension vs. a joint-and-survivor pension.
            </p>
          ) : result.error ? (
            <ErrorPanel message={result.error} />
          ) : (
            <>
              <p style={sentenceStyle}>
                Dying at age {result.retirementAge} requires a lump sum of <strong>{formatCurrency(result.lumpSum, { decimals: 0 })}</strong> to replace your survivor pension benefit.
              </p>
              <p style={sentenceStyle}>
                From term life insurance perceptive, if you can find a term life insurance with monthly premium of {formatCurrency(result.paymentDiff, { decimals: 0 })} or lower for {formatCurrency(result.lumpSum, { decimals: 0 })} and {result.insuranceTerm} years, it is better to take the single life pension payout option and purchase the term life insurance. This combination will provide the same or better coverage than the joint and survivor pension payout option.
              </p>
              <p style={{ ...sentenceStyle, marginBottom: 0 }}>
                From investment perceptive, <strong>it is better to take the {result.betterOption === "single" ? "single life" : "joint and survivor"} pension payout option</strong>. If you take the single life pension payout option, you can invest the payment difference of {formatCurrency(result.paymentDiff, { decimals: 0 })}. At the end of age {result.lifeExpectancy} (your life expectancy, your spouse age {result.spouseAgeAtVantage}), the investment accumulation of the payment difference would reach {formatCurrency(result.fvDiff, { decimals: 0 })}, yet the value of the remaining survivor pension payout until your spouse reach {result.spouseAgeAtVantage + result.remainingYears} is {formatCurrency(result.pvRemaining, { decimals: 0 })}.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3. Should you work longer for a better pension?
// ═══════════════════════════════════════════════════════════════════
function WorkLongerSection() {
  const [retirementAge1, setRetirementAge1] = useState("");
  const [monthlyIncome1, setMonthlyIncome1] = useState("");
  const [retirementAge2, setRetirementAge2] = useState("");
  const [monthlyIncome2, setMonthlyIncome2] = useState("");
  const [investmentReturn, setInvestmentReturn] = useState("");
  const [cola, setCola] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateWorkLonger({
      retirementAge1: retirementAge1 || 60,
      monthlyIncome1: monthlyIncome1 || 2500,
      retirementAge2: retirementAge2 || 65,
      monthlyIncome2: monthlyIncome2 || 3800,
      investmentReturn: investmentReturn || 5,
      cola: cola || 3.5,
    }));
  }
  function clear() {
    setRetirementAge1(""); setMonthlyIncome1(""); setRetirementAge2(""); setMonthlyIncome2("");
    setInvestmentReturn(""); setCola(""); setResult(null);
  }

  return (
    <div style={cardRow}>
      <div className="card" style={inputCard}>
        <SectionHeader>Pension option 1</SectionHeader>
        <FieldRow label="Retirement age"><PlainField value={retirementAge1} onChange={setRetirementAge1} placeholder="60" /></FieldRow>
        <FieldRow label="Monthly pension income" suffix="per month"><DollarField value={monthlyIncome1} onChange={setMonthlyIncome1} placeholder="2500" /></FieldRow>

        <SectionHeader>Pension option 2 (work longer)</SectionHeader>
        <FieldRow label="Retirement age"><PlainField value={retirementAge2} onChange={setRetirementAge2} placeholder="65" /></FieldRow>
        <FieldRow label="Monthly pension income" suffix="per month"><DollarField value={monthlyIncome2} onChange={setMonthlyIncome2} placeholder="3800" /></FieldRow>

        <SectionHeader>Other information</SectionHeader>
        <FieldRow label="Your investment return" suffix="per year"><PercentField value={investmentReturn} onChange={setInvestmentReturn} placeholder="5" /></FieldRow>
        <FieldRow label="Cost-of-living adjustment" hint="Increases your pension payments annually to help keep up with inflation." suffix="per year"><PercentField value={cola} onChange={setCola} placeholder="3.5" /></FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      <div className="card" style={resultCard}>
        <div style={resultBanner}>Result</div>
        <div style={resultBody}>
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in the fields and click <strong>Calculate</strong> to see which retirement age gives the better financial outcome.
            </p>
          ) : result.error ? (
            <ErrorPanel message={result.error} />
          ) : (
            <>
              <p style={sentenceStyle}>
                {result.sentence.kind === "alwaysLater" && `It is better to retire at age ${result.sentence.laterAge}.`}
                {result.sentence.kind === "alwaysEarlier" && `It is better to retire at age ${result.sentence.earlierAge}.`}
                {result.sentence.kind === "crossover" && (
                  <>Financially, if you think you can live to <strong>{result.sentence.crossoverAge} or older</strong>, it is better to retire at age {result.sentence.laterAge}. Otherwise, it is better to retire at age {result.sentence.earlierAge}.</>
                )}
              </p>
              <PensionLineChart series={[
                { label: `If retire at age ${result.retirementAge1}`, color: "#2b7ddb", points: result.option1Series },
                { label: `If retire at age ${result.retirementAge2}`, color: "#8bbc21", points: result.option2Series },
              ]} />
              <p style={footnoteStyle}>
                * Please note that this calculator only compares the financial value of the two pension options. It does not include the salary income. If you think you still need the salary income and retiring earlier is better financially, you can take the pension from your current job and find another job with equivalent or higher income.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PensionCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
        Pension policies can vary with different organizations. Because important pension-related decisions made
        before retirement cannot be reversed, employees may need to consider them carefully. The following
        calculations can help evaluate three of the most common situations.
      </p>

      <div>
        <SectionTitle subtitle="There are mainly two options regarding how to receive income from a pension plan: either take it out as a lump sum payment or have it distributed in a stream of periodic payments until the retiree passes away (or in some cases, until both the retiree and their spouse passes away).">
          Lump sum payout or monthly pension income?
        </SectionTitle>
        <LumpSumOrMonthlySection />
      </div>

      <div>
        <SectionTitle subtitle="A single-life pension means the employer will pay their employee's pension until their death. This payment option offers a higher payment per month but will not continue paying benefits to a spouse who outlives the retiree. In contrast, a joint-and-survivor pension payout pays a lower amount per month, but when the retiree dies, the surviving spouse will continue receiving benefits for the remainder of their life.">
          Single-life or joint-and-survivor pension payout?
        </SectionTitle>
        <SingleLifeOrJointSection />
      </div>

      <div>
        <SectionTitle subtitle="It is possible for some people to postpone retirement for several years for more pension income later. Use this calculation to see which option is preferred.">
          Should you work longer for a better pension?
        </SectionTitle>
        <WorkLongerSection />
      </div>
    </div>
  );
}
