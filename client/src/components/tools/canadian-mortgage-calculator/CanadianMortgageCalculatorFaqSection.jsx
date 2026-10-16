import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Why is the payment lower than a US-style calculation?",
    a: "Canadian fixed-rate mortgages compound interest semi-annually, not monthly. A 5% rate works out to a monthly rate of (1 + 0.05/2)^(1/6) − 1 ≈ 0.4124%, slightly less than 5% ÷ 12. In the default example, a $640,000 loan over 25 years costs $3,722.27 a month, or $476,681.57 in total interest.",
  },
  {
    q: "What is included in the Total Out-of-Pocket?",
    a: "The mortgage payment plus the optional property taxes (a percentage of the home price per year), home insurance, mortgage insurance, condo/HOA fee and other costs, each spread over the months of the loan. Untick \"Include Optionals Below\" to see the mortgage on its own.",
  },
  {
    q: "How is mortgage insurance handled?",
    a: "As on calculator.net, it is a yearly amount charged monthly only when the loan starts above 80% of the price, and it stops once the balance falls to 80%; the PMI payoff date shows when. In Canada, mortgage default insurance is required with less than 20% down and is usually a one-time premium added to the loan, so you can also model it by raising the home price or lowering the down payment.",
  },
  {
    q: "Can I use a term that is not a whole number of years?",
    a: "Yes. A 2.55-year amortization is 30.60 monthly payments: the last one is a partial payment that clears the balance. Terms can be up to 100 years; the amortization schedule is shown for terms from just over 1 year to just under 60 years.",
  },
  {
    q: "What is the difference between the amortization and the term?",
    a: "The amortization (the Loan Term box here) is the time to pay the mortgage off completely, traditionally 25 years. The term is how long the current contract and rate last, usually five years, after which the mortgage is renewed.",
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

export default function CanadianMortgageCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this Canadian mortgage calculator works out the monthly payment in
          Canadian dollars with semi-annual compounding, the full cost with taxes, insurance and condo fees, and a monthly and annual
          amortization schedule with charts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a UK mortgage in pounds, see the {link("/calculators/financial/mortgage-calculator-uk", "Mortgage Calculator UK")}; for a US-style
          mortgage with monthly compounding, try the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting Your First Mortgage</h2>
        <p style={pStyle}>
          The traditional amortization period (the time to pay a mortgage off) is 25 years, handled five years at a time. You can pay it off
          faster, but a longer amortization means smaller monthly payments and a higher total cost.
        </p>
        <p style={pStyle}>
          Most mortgages have a five-year term, though shorter terms are available. The term is how long the mortgage contract and its agreed
          interest rate are in effect. At the end of each term the mortgage is renewed, which is the chance to renegotiate the rate and other
          details for the next term.
        </p>
        <p style={pStyle}>
          An open mortgage lets you repay all or part of it at any time without a prepayment charge; a closed mortgage limits prepayment but
          usually has a lower interest rate.
        </p>
        <p style={pStyle}>
          Payments are traditionally monthly, but bi-weekly payments of half the monthly amount every two weeks give 26 payments a year instead
          of 24, repaying the loan faster and at a lower total cost.
        </p>
        <p style={pStyle}>
          Some mortgages let you build up a cash account: as the principal is paid down, those funds can be borrowed back when needed and are
          simply added back to the principal. There are also options for flexible or skipped payments.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most Canadian mortgages are portable: if you move before the term is up, you can carry the mortgage to the new home and, for a more
          expensive home, borrow the difference.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Homeowners&apos; Association (HOA) Fees</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Condo or homeowners&apos; association fees are collected from owners, usually monthly, to pay for things such as the building&apos;s
          master insurance, interior and exterior maintenance, landscaping, water, sewer and garbage. Enter the yearly total in the Condo/HOA
          Fee box to include it in your monthly cost.
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
