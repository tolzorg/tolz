import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the simple interest formula?",
    a: "Simple interest = Principal × Interest rate × Time, often written I = Prt. With $20,000 at 3% per year for 10 years, the interest is $20,000 × 0.03 × 10 = $6,000, so the end balance is $26,000.",
  },
  {
    q: "How do I find the principal, term, or rate instead?",
    a: "Pick the matching tab. Principal = End balance ÷ (1 + rate × term). Term = (End balance ÷ Principal − 1) ÷ rate. Rate = (End balance ÷ Principal − 1) ÷ term. For example, $20,000 growing to $30,000 in 10 years needs a 5% yearly rate.",
  },
  {
    q: "How do monthly rates and terms in months work?",
    a: "The rate and term can each be set per year or per month, and the calculator converts between them. A 3% monthly rate over 10 years is $20,000 × 3% × 10 × 12 = $72,000 of interest; a 3% yearly rate over 30 months is $20,000 × 3% × 30 ÷ 12 = $1,500.",
  },
  {
    q: "Why does the term result not always land exactly on the end balance in the schedule?",
    a: "The Term tab rounds the answer to two decimals (for example 16.67 years) and builds the schedule from that rounded term, so the last row can be a few dollars above or below the target end balance.",
  },
  {
    q: "What is the difference between simple and compound interest?",
    a: "Simple interest is charged only on the original principal, so it grows by the same amount every period. Compound interest is also charged on interest already added, so it grows faster. A $10,000 loan at 5% for 5 years costs $2,500 in simple interest but $2,833.59 if compounded monthly.",
  },
  {
    q: "Where is simple interest used?",
    a: "Some short-term personal and auto loans, certain bonds that pay a fixed coupon, and some certificates or notes use simple interest. Most savings accounts, credit cards, and mortgages compound instead.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)",
  background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: "10px 14px", margin: "0 0 10px",
};
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };

function FaqRow({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, padding: "13px 2px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
          {item.q}
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }} aria-hidden="true">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function SimpleInterestCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This simple interest calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, works out the
          interest and end balance from the simple interest formula, and can also solve backward for the principal, the
          term, or the interest rate. It shows each calculation step, a year-by-year (or month-by-month) schedule, and a
          chart of how the balance grows. Most real-world loans and savings accounts use compound interest instead; for
          those, use the <Link to="/calculators/financial/interest-calculator" className="inline-home-link">Interest Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Choose what to solve for with the tabs: <strong>Balance</strong> (end balance and total interest),{" "}
          <strong>Principal</strong>, <strong>Term</strong>, or <strong>Rate</strong>. Fill in the remaining fields,
          set the rate as per year or per month and the term in years or months, then click{" "}
          <strong>Calculate</strong>. Any field left blank uses the example value shown in it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Simple Interest?</h2>
        <p style={pStyle}>
          Interest is the cost of borrowing money, or the reward for lending or depositing it. Simple interest is
          calculated only on the original amount, the principal, for the whole term. Interest that has already built up
          never earns interest itself, so the balance grows by the same amount every period.
        </p>
        <p style={formulaStyle}>Simple Interest = Principal × Interest Rate × Time</p>
        <p style={pStyle}>Written with years, the formula is <strong>I = Prt</strong>:</p>
        <ul style={listStyle}>
          <li>I = total simple interest</li>
          <li>P = principal, the original balance</li>
          <li>r = annual interest rate, as a decimal</li>
          <li>t = term in years (six months is 0.5)</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With a rate per period, such as a monthly rate, use <strong>I = Prn</strong>, where r is the rate per period
          and n is the number of periods.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Simple Interest Examples</h2>
        <p style={pStyle}>
          <strong>I = Prt:</strong> a $10,000 loan at 5% simple interest per year, repaid over five years, costs
          $10,000 × 0.05 = $500 of interest per year, or $500 × 5 = $2,500 in total. The total to repay is
          $10,000 + $2,500 = $12,500.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>I = Prn:</strong> the same $10,000 at 5% per month for one year costs
          $10,000 × 0.05 × 12 = $6,000 of interest, so the total to repay is $16,000.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Simple Interest vs. Compound Interest</h2>
        <p style={pStyle}>
          Compound interest is charged on the principal <em>and</em> on interest already added to the balance. It
          costs a borrower more over time and earns an investor more. Compound interest uses the formula
          A = P × (1 + r/n)<sup>nt</sup>, where n is the number of times interest compounds per year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The $10,000 loan at 5% over five years totals $12,500 with simple interest, but $12,833.59 when compounded
          monthly. The gap widens the longer the term. Simple interest favors borrowers; compounding favors savers and
          investors. To compare compounding frequencies, try
          the <Link to="/calculators/financial/compound-interest-calculator" className="inline-home-link">Compound Interest Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your financial figures are stored, logged, or shared.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
