import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between \"Repay within a fixed time\" and \"Repay with a fixed installment\"?",
    a: "Repay within a fixed time starts from a term you choose (years and months) and solves for the periodic payment that clears the loan by then. Repay with a fixed installment works the other way: you choose the payment amount, and the calculator solves for how long it will take to pay off the loan.",
  },
  {
    q: "What's the difference between \"Compound\" and \"Pay back\"?",
    a: "Compound is how often interest capitalizes on the balance; Pay back is how often you actually make a payment. They're often the same (monthly compounding, monthly payments), but they don't have to be, for example, interest that compounds monthly with payments made biweekly. When they differ, the calculator converts the compounding rate to an effective annual rate first, then re-expresses it at the payment frequency, so the numbers stay accurate either way.",
  },
  {
    q: "Why does the payoff length show as, e.g., \"3 years and 3.2 months\" instead of a whole number of months?",
    a: "On the fixed-installment side, the payoff length is solved rather than chosen, so it's rarely an exact whole number of periods. The decimal reflects that the final payment is smaller than a regular one, covering just what's left rather than a full extra period.",
  },
  {
    q: "What does \"you need to pay at least $X\" mean?",
    a: "It shows up on the fixed-installment side whenever the chosen payment doesn't even cover one period's interest. In that case the balance never shrinks no matter how long you keep paying, so the calculator reports the minimum payment that would actually start making progress instead of a payoff length.",
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

export default function RepaymentCalculatorFaqSection() {
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
          A loan can be worked out from either direction: pick a payoff date and find the payment, or pick a
          payment and find the payoff date. This repayment calculator, free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, handles both, with independent compounding and
          payment frequencies so it fits everything from a simple monthly loan to one with interest compounding
          on a different schedule than the payments themselves.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter the loan balance and interest rate, then choose how often interest compounds and how often
          payments are made. Pick one of the two payoff modes: a fixed time (enter years and months, get the
          payment) or a fixed installment (enter the payment, get the payoff time). The result includes the
          total number of payments, the total amount paid, and the total interest, along with a Principal/
          Interest breakdown chart and a full amortization table.
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
