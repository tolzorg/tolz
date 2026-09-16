import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import PensionLineChart from "../pension-calculator/PensionLineChart";
import SocialSecurityBarChart from "./SocialSecurityBarChart";
import {
  calculateIdealApplicationAge, calculateCompareTwoAges,
} from "../../../utils/socialSecurityCalculatorEngine";

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

function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
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

const cardRow = { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" };
const inputCard = { flex: "1 1 420px", minWidth: 320, padding: 16 };
const resultCard = { flex: "1 1 380px", minWidth: 320, padding: 0, overflow: "hidden", alignSelf: "flex-start" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" };
const resultBody = { padding: "16px 18px" };
const sentenceStyle = { fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 10px" };

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
// 1. Determine the ideal application age
// ═══════════════════════════════════════════════════════════════════
function IdealApplicationAgeSection() {
  const [birthYear, setBirthYear] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [investmentReturn, setInvestmentReturn] = useState("");
  const [cola, setCola] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateIdealApplicationAge({
      birthYear: birthYear || 1970,
      lifeExpectancy: lifeExpectancy || 83,
      investmentReturn: investmentReturn || 5,
      cola: cola || 3,
    }));
  }
  function clear() {
    setBirthYear(""); setLifeExpectancy(""); setInvestmentReturn(""); setCola(""); setResult(null);
  }

  return (
    <div style={cardRow}>
      <div className="card" style={inputCard}>
        <FieldRow label="Your birth year"><PlainField value={birthYear} onChange={setBirthYear} placeholder="1970" /></FieldRow>
        <FieldRow label="Your life expectancy"><PlainField value={lifeExpectancy} onChange={setLifeExpectancy} placeholder="83" /></FieldRow>
        <FieldRow label="Your investment return" suffix="per year"><PercentField value={investmentReturn} onChange={setInvestmentReturn} placeholder="5" /></FieldRow>
        <FieldRow label="Cost of living adjustment" hint="Increases your Social Security benefit annually to help keep up with inflation." suffix="per year"><PercentField value={cola} onChange={setCola} placeholder="3" /></FieldRow>

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
              Fill in the fields and click <strong>Calculate</strong> to find your ideal Social Security application age.
            </p>
          ) : result.error ? (
            <ErrorPanel message={result.error} />
          ) : result.alreadyTooOld ? (
            <p style={{ ...sentenceStyle, marginBottom: 0 }}>
              Since you are already {result.currentAge}, you should apply for Social Security retirement benefits as soon as possible.
            </p>
          ) : (
            <>
              <p style={sentenceStyle}>
                Financially, the best age for you to apply for Social Security retirement benefit is <strong>{result.bestAge}</strong>. At {result.bestAge}, you receive benefits {Math.abs(result.monthsDiff)} months {result.monthsDiff >= 0 ? "after" : "before"} you reach your normal retirement age of {result.nraLabel}. Your benefit will be {Math.round(result.bestPctOfPia * 100) / 100}% of your primary insurance amount.
              </p>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textAlign: "center", margin: "0 0 4px" }}>
                Value comparison of application ages
              </p>
              <SocialSecurityBarChart points={result.points} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. Compare two application ages
// ═══════════════════════════════════════════════════════════════════
function CompareTwoAgesSection() {
  const [retirementAge1, setRetirementAge1] = useState("");
  const [monthlyIncome1, setMonthlyIncome1] = useState("");
  const [retirementAge2, setRetirementAge2] = useState("");
  const [monthlyIncome2, setMonthlyIncome2] = useState("");
  const [investmentReturn, setInvestmentReturn] = useState("");
  const [cola, setCola] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateCompareTwoAges({
      retirementAge1: retirementAge1 || 62,
      monthlyIncome1: monthlyIncome1 || 1600,
      retirementAge2: retirementAge2 || 70,
      monthlyIncome2: monthlyIncome2 || 2810,
      investmentReturn: investmentReturn || 5,
      cola: cola || 3,
    }));
  }
  function clear() {
    setRetirementAge1(""); setMonthlyIncome1(""); setRetirementAge2(""); setMonthlyIncome2("");
    setInvestmentReturn(""); setCola(""); setResult(null);
  }

  return (
    <div style={cardRow}>
      <div className="card" style={inputCard}>
        <SectionHeader>Social security claim option 1</SectionHeader>
        <FieldRow label="Retirement age"><PlainField value={retirementAge1} onChange={setRetirementAge1} placeholder="62" /></FieldRow>
        <FieldRow label="Monthly payment" suffix="per month"><DollarField value={monthlyIncome1} onChange={setMonthlyIncome1} placeholder="1600" /></FieldRow>

        <SectionHeader>Social security claim option 2 (work longer)</SectionHeader>
        <FieldRow label="Retirement age"><PlainField value={retirementAge2} onChange={setRetirementAge2} placeholder="70" /></FieldRow>
        <FieldRow label="Monthly payment" suffix="per month"><DollarField value={monthlyIncome2} onChange={setMonthlyIncome2} placeholder="2810" /></FieldRow>

        <SectionHeader>Other information</SectionHeader>
        <FieldRow label="Your investment return" suffix="per year"><PercentField value={investmentReturn} onChange={setInvestmentReturn} placeholder="5" /></FieldRow>
        <FieldRow label="Cost of living adjustment" hint="Increases your Social Security benefit annually to help keep up with inflation." suffix="per year"><PercentField value={cola} onChange={setCola} placeholder="3" /></FieldRow>

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
              Fill in the fields and click <strong>Calculate</strong> to compare two Social Security application ages.
            </p>
          ) : result.error ? (
            <ErrorPanel message={result.error} />
          ) : (
            <>
              <p style={sentenceStyle}>
                {result.sentence.kind === "alwaysLater" && `It is better to apply for social security at age ${result.sentence.laterAge}.`}
                {result.sentence.kind === "alwaysEarlier" && `It is better to apply for social security at age ${result.sentence.earlierAge}.`}
                {result.sentence.kind === "crossover" && (
                  <>Financially, if you think you can live to <strong>{result.sentence.crossoverAge} or older</strong>, it is better to apply for social security at age {result.sentence.laterAge}. Otherwise, it is better to apply for social security at age {result.sentence.earlierAge}.</>
                )}
              </p>
              <PensionLineChart series={[
                { label: `If retire at age ${result.retirementAge1}`, color: "#2b7ddb", points: result.option1Series },
                { label: `If retire at age ${result.retirementAge2}`, color: "#8bbc21", points: result.option2Series },
              ]} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SocialSecurityCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
        <a href="https://www.ssa.gov/benefits/calculators/" target="_blank" rel="noopener noreferrer">The U.S. Social Security website provides calculators for various purposes</a>. While
        they are all useful, there currently isn't a way to help determine the ideal (financially speaking) age at
        which a person between the ages of 62-70 should apply for their Social Security retirement benefits. This
        tool is designed specifically for this purpose. Please note that this calculator is intended for U.S.
        Social Security purposes only.
      </p>

      <div>
        <SectionTitle subtitle="Use the following calculation to determine the ideal age to apply for Social Security retirement benefits based on age, life expectancy, and average investment performance.">
          Determine the ideal application age
        </SectionTitle>
        <IdealApplicationAgeSection />
      </div>

      <div>
        <SectionTitle subtitle={(
          <>
            Use the following calculation to compare the financial difference between two Social Security
            retirement benefit application ages. <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer">The U.S. Social Security website</a> provides
            estimated benefit payment amounts of different claim ages.
          </>
        )}>
          Compare two application ages
        </SectionTitle>
        <CompareTwoAgesSection />
      </div>
    </div>
  );
}
