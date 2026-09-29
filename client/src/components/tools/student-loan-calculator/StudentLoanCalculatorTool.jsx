import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import {
  calculateSimple, calculateRepayment, calculateProjection,
  SIMPLE_DEFAULTS, REPAYMENT_DEFAULTS, PROJECTION_DEFAULTS,
  formatCurrency, formatMoney, formatRate, formatDuration,
} from "../../../utils/studentLoanCalculatorEngine";

const cardRow = { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" };
const inputCard = { flex: "1 1 380px", minWidth: 300, padding: 16 };
const resultCard = { flex: "1 1 380px", minWidth: 300, padding: 0, overflow: "hidden", alignSelf: "flex-start" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const resultBody = { padding: "16px 18px" };
const sentenceStyle = { fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 12px" };
const placeholderStyle = { fontSize: 13.5, color: "var(--text-muted)", margin: 0 };
const bigRow = { display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", fontSize: 14.5, color: "var(--text-primary)" };
const tableRow = { display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 10px", fontSize: 13.5, borderBottom: "1px solid var(--border)" };
const PIE_COLORS = { principal: "#2b7ddb", interest: "#8bbc21" };

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

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function ButtonRow({ onCalculate, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      <button type="button" onClick={onCalculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

function PlainField({ value, onChange, placeholder }) {
  return <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ flex: 1, minWidth: 0 }} />;
}

function BigRow({ label, children, highlight }) {
  return (
    <div style={bigRow}>
      <span>{label}</span>
      <span style={highlight ? { color: "var(--success)", fontWeight: 800 } : undefined}>{children}</span>
    </div>
  );
}

function PrincipalInterestPie({ principal, interest }) {
  return (
    <div style={{ marginTop: 14 }}>
      <InvestmentPieChart segments={[
        { label: "Principal", value: principal, color: PIE_COLORS.principal },
        { label: "Interest", value: interest, color: PIE_COLORS.interest },
      ]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. Simple Student Loan Calculator
// ═══════════════════════════════════════════════════════════════════
// No DEFAULTS fallback on Calculate: a blank field means "solve this one",
// so the defaults are shown as placeholder hints only.

const SOLVED_LABEL = { payment: "Repayment:", term: "Remaining Term:", rate: "Interest Rate:", balance: "Loan Balance:" };

function solvedValue(result) {
  switch (result.solveFor) {
    case "payment": return `${formatMoney(result.payment)}/month`;
    case "term": return formatDuration(result.months);
    case "rate": return formatRate(result.rate);
    default: return formatMoney(result.balance);
  }
}

function SimpleSection() {
  const [balance, setBalance] = useState("");
  const [term, setTerm] = useState("");
  const [rate, setRate] = useState("");
  const [payment, setPayment] = useState("");
  const [result, setResult] = useState(null);

  function clear() {
    setBalance(""); setTerm(""); setRate(""); setPayment(""); setResult(null);
  }

  return (
    <section>
      <SectionTitle subtitle="Please provide any three values below to calculate.">Simple Student Loan Calculator</SectionTitle>
      <div style={cardRow}>
        <div className="card" style={inputCard}>
          <FieldRow label="Loan Balance"><DollarField value={balance} onChange={setBalance} placeholder={SIMPLE_DEFAULTS.balance} /></FieldRow>
          <FieldRow label="Remaining Term" suffix="years"><PlainField value={term} onChange={setTerm} placeholder={SIMPLE_DEFAULTS.term} /></FieldRow>
          <FieldRow label="Interest Rate"><PercentField value={rate} onChange={setRate} placeholder={SIMPLE_DEFAULTS.rate} /></FieldRow>
          <FieldRow label="Monthly Payment" suffix="/month"><DollarField value={payment} onChange={setPayment} /></FieldRow>
          <ButtonRow onCalculate={() => setResult(calculateSimple({ balance, term, rate, payment }))} onClear={clear} />
        </div>

        <div className="card" style={resultCard}>
          <div style={resultBanner}>Result</div>
          <div style={resultBody} aria-live="polite">
            {!result ? (
              <p style={placeholderStyle}>Fill in any three of the four fields and click <strong>Calculate</strong> to solve for the fourth.</p>
            ) : result.error ? (
              <ErrorPanel messages={[result.error]} />
            ) : result.message ? (
              <p style={{ ...sentenceStyle, margin: 0 }}>{result.message}</p>
            ) : (
              <>
                {result.basedOnNote && (
                  <p style={{ ...sentenceStyle, fontSize: 13.5, color: "var(--text-secondary)" }}>
                    The following results are based on loan balance, remaining term, and interest rate.
                  </p>
                )}
                <BigRow label={SOLVED_LABEL[result.solveFor]} highlight>{solvedValue(result)}</BigRow>
                <BigRow label="Total Interest:">{formatMoney(result.totalInterest)}</BigRow>
                <BigRow label="Total Payments:">{formatMoney(result.totalPayments)}</BigRow>
                <PrincipalInterestPie principal={result.principal} interest={result.totalInterest} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. Student Loan Repayment Calculator
// ═══════════════════════════════════════════════════════════════════

function ScheduleTable({ title, schedule }) {
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>{title}</p>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
        <div style={tableRow}><span>Remaining Term</span><span>{formatDuration(schedule.months)}</span></div>
        <div style={tableRow}><span>Total Payments</span><span>{formatMoney(schedule.totalPayments)}</span></div>
        <div style={{ ...tableRow, borderBottom: "none" }}><span>Total Interest</span><span>{formatMoney(schedule.totalInterest)}</span></div>
      </div>
    </div>
  );
}

function ExtraRow({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 130, display: "flex" }}><DollarField value={value} onChange={onChange} placeholder={placeholder} /></div>
      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function RepaymentResult({ result }) {
  if (result.option === "together") {
    return (
      <>
        <p style={sentenceStyle}>
          <strong>{formatCurrency(result.balance, { decimals: 0 })}</strong> is needed to payback altogether. This results in savings of <strong>{formatMoney(result.savings)}</strong> in interest payments.
        </p>
        <ScheduleTable title="The Original Payoff Schedule" schedule={result.original} />
      </>
    );
  }
  if (result.option === "original") {
    return (
      <>
        <p style={sentenceStyle}>Normal loan repayment without extra payments:</p>
        <ScheduleTable schedule={result.original} />
      </>
    );
  }
  return (
    <>
      <p style={sentenceStyle}>
        The remaining term of the loan is {formatDuration(result.original.months)}. By paying an extra {result.extraPhrase}, the loan will be paid off in {result.headline}.
        {result.monthsSaved > 0 && <> It is <strong>{formatDuration(result.monthsSaved)} earlier</strong>.</>}
        {" "}This results in savings of <strong>{formatMoney(result.savings)}</strong> in interest payments.
      </p>
      <ScheduleTable title={`If Pay Extra ${result.extraPhrase}`} schedule={result.withExtra} />
      <ScheduleTable title="The Original Payoff Schedule" schedule={result.original} />
    </>
  );
}

function RepaymentSection() {
  const [balance, setBalance] = useState("");
  const [payment, setPayment] = useState("");
  const [rate, setRate] = useState("");
  const [option, setOption] = useState("extra");
  const [extraMonthly, setExtraMonthly] = useState("");
  const [extraYearly, setExtraYearly] = useState("");
  const [extraOneTime, setExtraOneTime] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    const d = REPAYMENT_DEFAULTS;
    setResult(calculateRepayment({
      balance: balance || d.balance,
      payment: payment || d.payment,
      rate: rate || d.rate,
      option,
      extraMonthly: extraMonthly || d.extraMonthly,
      extraYearly: extraYearly || d.extraYearly,
      extraOneTime: extraOneTime || d.extraOneTime,
    }));
  }

  function clear() {
    setBalance(""); setPayment(""); setRate(""); setOption("extra");
    setExtraMonthly(""); setExtraYearly(""); setExtraOneTime(""); setResult(null);
  }

  const banner = result?.headline ? `Pay off in ${result.headline}` : "Result";

  return (
    <section>
      <SectionTitle subtitle="Use the calculator below to evaluate the student loan payoff options, as well as the interest to be saved. The remaining balance, monthly payment, and interest rate can be found on the monthly student loan bill.">
        Student Loan Repayment Calculator
      </SectionTitle>
      <div style={cardRow}>
        <div className="card" style={inputCard}>
          <FieldRow label="Loan Balance"><DollarField value={balance} onChange={setBalance} placeholder={REPAYMENT_DEFAULTS.balance} /></FieldRow>
          <FieldRow label="Monthly Payment" suffix="/month"><DollarField value={payment} onChange={setPayment} placeholder={REPAYMENT_DEFAULTS.payment} /></FieldRow>
          <FieldRow label="Interest Rate"><PercentField value={rate} onChange={setRate} placeholder={REPAYMENT_DEFAULTS.rate} /></FieldRow>

          <fieldset style={{ border: "none", padding: 0, margin: "14px 0 0" }}>
            <legend style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Repayment Options:</legend>
            <RadioOption checked={option === "together"} onChange={() => setOption("together")} label="Payoff altogether" />
            <RadioOption checked={option === "extra"} onChange={() => setOption("extra")} label="Repayment with extra payments" />
            <div style={{ marginLeft: 24, marginBottom: 10 }}>
              <ExtraRow label="per month" value={extraMonthly} onChange={setExtraMonthly} placeholder={REPAYMENT_DEFAULTS.extraMonthly} />
              <ExtraRow label="per year" value={extraYearly} onChange={setExtraYearly} placeholder={REPAYMENT_DEFAULTS.extraYearly} />
              <ExtraRow label="one time" value={extraOneTime} onChange={setExtraOneTime} placeholder={REPAYMENT_DEFAULTS.extraOneTime} />
            </div>
            <RadioOption checked={option === "original"} onChange={() => setOption("original")} label="Normal repayment" />
          </fieldset>

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={resultCard}>
          <div style={resultBanner}>{banner}</div>
          <div style={resultBody} aria-live="polite">
            {!result ? (
              <p style={placeholderStyle}>Enter your loan details, choose a repayment option, and click <strong>Calculate</strong> to see your payoff time and interest savings.</p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : result.message ? (
              <p style={{ ...sentenceStyle, margin: 0 }}>{result.message}</p>
            ) : (
              <RepaymentResult result={result} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3. Student Loan Projection Calculator
// ═══════════════════════════════════════════════════════════════════

function ProjectionSection() {
  const [yearsToGraduate, setYearsToGraduate] = useState("");
  const [annualAmount, setAnnualAmount] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [gracePeriod, setGracePeriod] = useState("");
  const [rate, setRate] = useState("");
  const [payInterestInSchool, setPayInterestInSchool] = useState(false);
  const [result, setResult] = useState(null);

  function calculate() {
    const d = PROJECTION_DEFAULTS;
    setResult(calculateProjection({
      yearsToGraduate: yearsToGraduate || d.yearsToGraduate,
      annualAmount: annualAmount || d.annualAmount,
      currentBalance: currentBalance || d.currentBalance,
      loanTerm: loanTerm || d.loanTerm,
      gracePeriod: gracePeriod || d.gracePeriod,
      rate: rate || d.rate,
      payInterestInSchool,
    }));
  }

  function clear() {
    setYearsToGraduate(""); setAnnualAmount(""); setCurrentBalance(""); setLoanTerm("");
    setGracePeriod(""); setRate(""); setPayInterestInSchool(false); setResult(null);
  }

  return (
    <section>
      <SectionTitle subtitle="Use the calculator below to estimate the loan balance and repayment obligation after graduation. This calculator is mainly for those still in college or who haven't started.">
        Student Loan Projection Calculator
      </SectionTitle>
      <div style={cardRow}>
        <div className="card" style={inputCard}>
          <FieldRow label="To Graduate In" suffix="years"><PlainField value={yearsToGraduate} onChange={setYearsToGraduate} placeholder={PROJECTION_DEFAULTS.yearsToGraduate} /></FieldRow>
          <FieldRow label="Estimated Loan Amount" suffix="/year"><DollarField value={annualAmount} onChange={setAnnualAmount} placeholder={PROJECTION_DEFAULTS.annualAmount} /></FieldRow>
          <FieldRow label="Current Balance"><DollarField value={currentBalance} onChange={setCurrentBalance} placeholder={PROJECTION_DEFAULTS.currentBalance} /></FieldRow>
          <FieldRow label="Loan Term" suffix="years"><PlainField value={loanTerm} onChange={setLoanTerm} placeholder={PROJECTION_DEFAULTS.loanTerm} /></FieldRow>
          <FieldRow label="Grace Period" hint="The period between the date of graduation and the date that repayment of a student loan must begin." suffix="months">
            <PlainField value={gracePeriod} onChange={setGracePeriod} placeholder={PROJECTION_DEFAULTS.gracePeriod} />
          </FieldRow>
          <FieldRow label="Interest Rate"><PercentField value={rate} onChange={setRate} placeholder={PROJECTION_DEFAULTS.rate} /></FieldRow>

          <fieldset style={{ border: "none", padding: 0, margin: "12px 0 0" }}>
            <legend style={{ fontSize: 13.5, color: "var(--text-primary)", marginBottom: 8 }}>Do you pay interest during school years?</legend>
            <div style={{ display: "flex", gap: 20, marginLeft: 12 }}>
              <RadioOption checked={payInterestInSchool} onChange={() => setPayInterestInSchool(true)} label="Yes" />
              <RadioOption checked={!payInterestInSchool} onChange={() => setPayInterestInSchool(false)} label="No" />
            </div>
          </fieldset>

          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={resultCard}>
          <div style={resultBanner}>Result</div>
          <div style={resultBody} aria-live="polite">
            {!result ? (
              <p style={placeholderStyle}>Fill in your school and loan details and click <strong>Calculate</strong> to project your balance and monthly repayment after graduation.</p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : (
              <>
                <BigRow label="Repayment:" highlight>{formatMoney(result.payment)}/month</BigRow>
                <div style={{ marginTop: 8 }}>
                  <BigRow label="Amount Borrowed:">{formatMoney(result.amountBorrowed)}</BigRow>
                  {result.balanceAfterGraduation !== null && <BigRow label="Balance After Graduation:">{formatMoney(result.balanceAfterGraduation)}</BigRow>}
                  {result.balanceAfterGrace !== null && <BigRow label="Balance After Grace Period:">{formatMoney(result.balanceAfterGrace)}</BigRow>}
                  <BigRow label="Total Interest:">{formatMoney(result.totalInterest)}</BigRow>
                </div>
                <PrincipalInterestPie principal={result.amountBorrowed} interest={result.totalInterest} />
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "12px 0 0" }}>
        <p style={{ margin: 0 }}>* The &quot;Grace Period&quot; is the period between the date of graduation and the date that repayment of a student loan must begin.</p>
        <p style={{ margin: 0 }}>* For some direct subsidized loans, you do not need to pay interest during school years or the grace period.</p>
        <p style={{ margin: 0 }}>* This calculator assumes loans to be repaid each month equally right after graduation or grace period. It also does not take into account any loan fees.</p>
      </div>
    </section>
  );
}

export default function StudentLoanCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <SimpleSection />
      <RepaymentSection />
      <ProjectionSection />
    </div>
  );
}
