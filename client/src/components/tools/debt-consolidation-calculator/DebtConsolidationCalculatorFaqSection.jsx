import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is debt consolidation?",
    a: "It's combining several existing debts into a single new loan, ideally one with a lower overall cost of borrowing. Instead of tracking multiple balances, minimum payments, and rates, you make one payment toward the new consolidation loan, which is used to pay off the old debts.",
  },
  {
    q: "Why compare APR instead of just the interest rate?",
    a: "APR (Annual Percentage Rate) folds in fees on top of the interest rate, giving a single figure that reflects the true cost of borrowing. A consolidation loan can have a lower interest rate than your existing debts but still cost more overall once its origination fee is factored in, which is exactly what the fee-adjusted APR shown here captures.",
  },
  {
    q: "What does \"Upfront cash flow for consolidation\" mean?",
    a: "It's what's left over (or still owed) after the loan's fee is taken out and the proceeds are used to pay off your existing balances. A positive number is cash you keep; a negative number is additional money you'd need to come up with to fully retire the old debts.",
  },
  {
    q: "How is the APR of my existing debts calculated?",
    a: "Your existing debts are paid off together using the debt avalanche method (the same approach as this site's Debt Payoff Calculator): every debt gets at least its own minimum payment, and any additional budget goes to whichever remaining debt has the highest rate. The APR shown is the single blended rate that would make a loan for your total balance, paid at your combined minimum payment, take exactly as long to pay off as that real payoff plan does.",
  },
  {
    q: "What happens if my current minimum payments can't cover the interest?",
    a: "If a debt is never payable, even after every other debt is cleared, the calculator shows a message identifying which one instead of a comparison.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or transmitted for storage, the calculation happens on the page, and no signup or personal information is required to use it.",
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

export default function DebtConsolidationCalculatorFaqSection() {
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
          A consolidation loan is only worth taking if it genuinely costs less than the debts it replaces,
          and comparing a single interest rate against several different ones isn't a fair test on its own.
          This debt consolidation calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>,
          puts both sides on the same footing by comparing their APR (which folds in fees), then shows the
          side-by-side monthly payment, payoff length, and total cost so the tradeoff is concrete rather than
          a guess. For a payoff plan across multiple debts without a new loan, see the{" "}
          <Link to="/calculators/financial/debt-payoff-calculator" className="inline-home-link">Debt Payoff Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter each existing debt's name (optional), remaining balance, monthly or minimum payment, and
          interest rate, up to 20 total. Then enter the proposed consolidation loan's amount, interest rate,
          term, and fee (as a percentage of the loan or a flat dollar amount).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The result leads with a plain-language verdict on whether the loan will save money, followed by a
          side-by-side comparison table covering APR, monthly payment, payoff length, fee, upfront cash flow,
          and total cost for both the existing debts and the proposed loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account creation, email address, or payment required to
          use it. All calculations run directly based on the numbers you enter, and none of your financial
          figures are stored, logged, or shared, you can close the page and nothing you entered persists
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
