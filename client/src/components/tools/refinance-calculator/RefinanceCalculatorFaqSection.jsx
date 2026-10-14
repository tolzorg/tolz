import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I know if refinancing is worth it?",
    a: "Compare the new loan's APR with your current interest rate, and look at the lifetime savings after upfront costs. In the default example, refinancing $250,000 at 7% into a 20-year loan at 6% with 2 points and $1,500 of fees has an APR of 6.329% and saves $76,641.36 over the life of the loan.",
  },
  {
    q: "What is the break-even point?",
    a: "It's how many months it takes for the interest you save to cover the points and fees you pay upfront. In the default example, the $6,500 upfront cost is recovered after 30 months. If you plan to sell or refinance again before then, refinancing may not pay off.",
  },
  {
    q: "What are mortgage points?",
    a: "Points, or discount points, are prepaid interest that buys a lower rate. One point costs 1% of the loan amount, so 2 points on a $250,000 loan cost $5,000, paid upfront.",
  },
  {
    q: "How does a cash-out refinance work?",
    a: "You borrow more than you owe and take the difference in cash. The calculator adds the cash out to the new loan amount, charges points on the larger amount, and shows the take-home amount after upfront costs. Enter a negative cash out to pay down the balance instead (a cash-in refinance).",
  },
  {
    q: "Why is the APR higher than the interest rate?",
    a: "Points and fees reduce the money you effectively receive while your payments stay the same, so the true annual cost of the loan, the APR, is higher than the quoted rate.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

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

export default function RefinanceCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this refinance calculator compares your current loan
          with a new one, including points, fees, and cash out, and shows the new payment, the APR, your lifetime savings,
          and how long it takes to break even.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What is Loan Refinancing?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Refinancing means taking out a new loan, usually on better terms, to pay off an existing one. It is most common with
          mortgages, car loans, and student loans, and any collateral can transfer to the new loan. Replacing debt under
          financial distress is called debt restructuring instead. See also
          the {link("/calculators/financial/debt-consolidation-calculator", "Debt Consolidation Calculator")} and
          the {link("/calculators/financial/debt-payoff-calculator", "Debt Payoff Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reasons to Refinance</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Save money</strong>: lock in a lower rate if rates have fallen or your credit has improved.</li>
          <li style={liStyle}><strong>Need cash</strong>: once you&apos;ve built equity, borrow more than you owe and take the difference. Without a lower rate, this is usually expensive.</li>
          <li style={liStyle}><strong>Lower the payment</strong>: stretch the term to cut the monthly payment, usually at the cost of more total interest.</li>
          <li style={liStyle}><strong>Shorten the loan</strong>: for example, moving from a 30-year to a 15-year mortgage, often at a lower rate but with a higher payment.</li>
          <li style={liStyle}><strong>Consolidate debt</strong>: combine several loans into one, ideally at a lower rate.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Switch rate type</strong>: move from a variable to a fixed rate, or vice versa.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Refinancing Mortgages</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Cash-out refinance</strong>: a new loan larger than what you owe, with the difference paid to you; usually requires at least 20% equity. The reverse, paying in extra to cut the balance, is a cash-in refinance.</li>
          <li style={liStyle}><strong>FHA refinance</strong>: moving from an FHA loan to a conventional loan once you have 20% equity can end mortgage insurance premiums; an FHA Streamline Refinance can lower the rate on an FHA loan.</li>
          <li style={liStyle}><strong>Rate-and-term refinance</strong>: refinancing the remaining balance for a better rate or term, common when rates drop.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>ARM refinance</strong>: switching an adjustable-rate mortgage to a fixed rate before it adjusts.</li>
        </ul>
        <p style={pStyle}>Common costs to include in &quot;Costs and fees&quot;:</p>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}>Application fee (about 1% of the loan) and loan origination fee or points (usually 0–2%).</li>
          <li style={liStyle}>Home appraisal, inspection, and survey fees, typically a few hundred dollars each.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>Document preparation, title search, recording, and flood certification fees.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>See the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")} for more mortgage calculations.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Refinancing Student Loans and Car Loans</h2>
        <p style={pStyle}>
          Before refinancing federal student loans, consider income-based, graduated, or extended repayment plans, deferment,
          or forbearance: refinanced federal loans become private loans and lose those benefits. Refinancing may not help with
          irregular income, already-low rates, or a credit score under about 650. Private student loans and PLUS loans benefit
          most. See the {link("/calculators/financial/student-loan-calculator", "Student Loan Calculator")}.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Refinancing a car loan to a longer term lowers the payment but usually costs more interest, and can leave you owing
          more than the car is worth. Check for prepayment penalties first.
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
