import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does this calculator find the interest rate?",
    a: "There's no direct formula to solve for the rate given a fixed loan amount, term, and payment, so the calculator instead searches for the rate that makes the loan pay down to exactly $0 by the end of the term, trying rates repeatedly until it converges on the right one.",
  },
  {
    q: "What if the monthly payment I enter is too low to ever pay off the loan?",
    a: "If the payment doesn't even cover the loan amount over the term, the calculator can still find an answer: a negative interest rate, meaning the balance still gets paid off, but only because more was paid in total than would be owed at 0% interest.",
  },
  {
    q: "Why does the graph only show up to 3 years for a 3-year loan?",
    a: "The Loan Amortization Graph plots the remaining balance and running totals of interest and payments made over the life of the loan, one point per year, so its horizontal axis always matches the loan term entered.",
  },
  {
    q: "What does the Payment Breakdown chart show?",
    a: "It's the split between the original loan amount (Principal) and the Total interest paid over the life of the loan, as a percentage of the total amount paid back.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Every calculation runs directly in your browser. Nothing you enter is transmitted anywhere or stored, and no signup or personal information is required to use it.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

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

export default function InterestRateCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this interest rate calculator finds the
          interest rate implied by a loan amount, term, and fixed monthly payment, along with the total interest
          paid over the life of the loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Interest Rate?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Interest rate is the amount charged by lenders to borrowers for the use of money, expressed as a
          percentage of the principal, or original amount borrowed. It can also be described as the cost to borrow
          money: an 8% interest rate on a $100 loan for a year obligates the borrower to pay $108 by year-end.
          Borrowers generally want the lowest possible rate; lenders and investors seek the highest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter the loan amount, the loan term in years and months, and the fixed monthly payment being made (or
          planned), then click Calculate. The calculator solves for the interest rate that reconciles those three
          numbers, along with the total of all monthly payments and the total interest paid over the loan's life.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This interest rate calculator is completely free, with no account, email address, or payment required.
          Every calculation runs directly in your browser, nothing you enter is stored, logged, or transmitted
          anywhere.
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
