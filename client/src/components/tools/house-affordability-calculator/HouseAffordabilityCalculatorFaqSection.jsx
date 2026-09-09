import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between front-end and back-end DTI ratios?",
    a: "The front-end ratio is your housing costs alone (mortgage, tax, HOA, insurance, and any mortgage insurance) as a percentage of your gross monthly income. The back-end ratio adds in your other monthly debts, like car loans, student loans, and credit cards, on top of housing costs.",
  },
  {
    q: "When is PMI or mortgage insurance added to the estimate?",
    a: "For a Conventional loan or a custom DTI percentage, private mortgage insurance (PMI) is added automatically whenever the down payment is under 20%. FHA loans always carry a mortgage insurance premium (MIP) regardless of down payment, and VA loans carry a funding fee instead, both varying by down payment size.",
  },
  {
    q: "Why do property tax and insurance affect the result differently for FHA and VA loans?",
    a: "For a Conventional loan or a custom DTI percentage, property tax, HOA fees, and insurance are estimated as a percentage of the home's price. For FHA and VA loans specifically, this calculator estimates them as a percentage of the loan amount instead, matching how the reference calculator computes affordability for those loan types.",
  },
  {
    q: "What's the difference between the two calculators on this page?",
    a: "The main House Affordability Calculator works from your income, debts, and a debt-to-income guideline to estimate what you can afford. The second calculator instead works backward from a fixed monthly budget you choose for housing costs, ignoring income and DTI limits entirely.",
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

export default function HouseAffordabilityCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this house affordability calculator
          estimates an affordable house purchase amount based on either household income and debt, or a fixed
          monthly budget.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much House Can I Afford?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders typically use debt-to-income (DTI) guidelines to decide how large a mortgage they'll approve.
          Conventional loans commonly follow the "28/36 rule" — no more than 28% of gross monthly income on housing
          costs, and no more than 36% on housing plus other debts — while FHA and VA loans use their own, more
          generous guidelines. This calculator applies whichever guideline you choose to your income and debts to
          estimate an affordable purchase price.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          For the main calculator, enter household income, loan term, interest rate, existing monthly debt, down
          payment, property tax, HOA fee, insurance, and pick a DTI guideline, then click Calculate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the fixed-budget calculator, enter the amount you're willing to spend on housing each month instead,
          along with loan term, interest rate, and down payment, and optionally include tax and fees in that budget.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This house affordability calculator is completely free, with no account, email address, or payment
          required. Every calculation runs directly in your browser, nothing you enter is stored, logged, or
          transmitted anywhere.
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
