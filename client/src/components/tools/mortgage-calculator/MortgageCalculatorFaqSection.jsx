import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Mortgage Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "How is the monthly mortgage payment calculated?",
    a: "Using the standard fixed-rate amortization formula: M = P × [r(1+r)ⁿ] / [(1+r)ⁿ − 1], where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12), and n is the number of monthly payments (loan term in years × 12).",
  },
  {
    q: "What's included in \"Total Out-of-Pocket\"?",
    a: "Your principal & interest payment plus property taxes, home insurance, HOA fees, and \"Other Costs\" (which bundles PMI with any other costs you entered) — everything you'd actually pay each month to keep the home.",
  },
  {
    q: "When does PMI stop, and do I even need it?",
    a: "PMI only applies at all if your down payment was under 20% (i.e. your starting loan-to-value is over 80%) — put down 20% or more and PMI never gets charged, no matter what PMI amount you enter. If it does apply, it automatically stops once your loan balance reaches 78% of the original home price — that's the federal Homeowners Protection Act's automatic termination threshold, distinct from the 80% figure (which is when a borrower may request cancellation, not when it happens automatically).",
  },
  {
    q: "What do the \"% of...\" values mean for Property Taxes, Insurance, PMI, HOA, and Other Costs?",
    a: "Property Taxes, Home Insurance, HOA, and Other Costs use percent of home price per year — the standard way property tax rates are quoted. PMI uses percent of loan amount per year, matching how PMI premiums actually work in practice.",
  },
  {
    q: "How do extra payments affect my loan?",
    a: "Any extra amount — monthly, yearly, a one-time lump sum, or several one-time payments — goes straight toward your principal, which shortens your payoff date and reduces total interest paid. The calculator recalculates your exact new payoff date and interest savings.",
  },
  {
    q: "What's the biweekly payment option?",
    a: "Paying half your monthly payment every two weeks works out to 26 payments a year — the equivalent of 13 monthly payments instead of 12, i.e. one extra payment every year. That modest acceleration can shave years off a 30-year loan and save a meaningful amount of interest.",
  },
  {
    q: "Is my information stored anywhere?",
    a: "No. Everything runs locally in your browser — nothing you enter is sent to a server or saved.",
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

export default function MortgageCalculatorFaqSection() {
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
        <p style={pStyle}>
          Calculate your monthly mortgage payment including principal, interest, property taxes, home insurance,
          PMI, HOA fees, and other costs — with a full amortization schedule, extra-payment payoff analysis, and
          biweekly payment comparison. Free, right in your browser. Built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online calculators.
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
