import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between \"Pay a certain amount\" and \"Pay off within a certain timeframe\"?",
    a: "Pay a certain amount starts from a fixed monthly payment you choose and solves for how long it will take to clear the balance. Pay off within a certain timeframe works the other way: you choose the number of years and months, and the calculator solves for the fixed monthly payment that clears the balance exactly on schedule.",
  },
  {
    q: "What does \"it is unlikely that you can pay off the balance\" mean?",
    a: "It shows up on the Pay a certain amount tab whenever the chosen monthly payment doesn't even cover one month's interest. In that case the balance never shrinks, no matter how long you keep paying, so there's no payoff time or total interest to show, just the minimum payment that would actually start making progress.",
  },
  {
    q: "What do the \"Interest + 1% of Balance\", \"2%\", \"3%\", \"4%\", \"5%\" links do?",
    a: "They're a shortcut for filling in a reasonable starting payment amount based on the current balance and rate, similar to how many card issuers calculate a minimum payment. Only the first option adds that period's interest on top of 1% of the balance; the 2%, 3%, 4%, and 5% options are a flat percentage of the balance alone. Either way, the suggested amount only pre-fills the payment field, it's still a fixed dollar amount from that point on, not a payment that keeps shrinking as the balance does.",
  },
  {
    q: "Can the balance, interest rate, or payment be negative?",
    a: "No. A credit card balance, its interest rate, and a monthly payment amount are all rejected if entered as negative, since none of those have a meaningful negative value in this context.",
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
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
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

export default function CreditCardCalculatorFaqSection() {
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
          Credit card interest compounds fast enough that a balance carried for years can end up costing far
          more than the original purchases. This credit card calculator, free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, answers the two questions that matter most
          once a balance exists: how long will it take to pay off at a given monthly payment, or how much do
          you need to pay each month to clear it by a target date, either way showing the total interest that
          debt will actually cost.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter the credit card balance and its interest rate (APR). Then choose one of two ways to plan the
          payoff. On <strong>Pay a certain amount</strong>, enter the fixed monthly payment you plan to make;
          the calculator solves for how long it will take to reach a zero balance. On{" "}
          <strong>Pay off within a certain timeframe</strong>, enter how many years and months you want the
          balance cleared in instead; the calculator solves for the fixed monthly payment that gets there
          exactly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Either way, the result includes the total interest paid over the life of the payoff, along with a
          Principal/Interest breakdown chart and a month-by-month balance chart showing the debt shrinking
          (and the cumulative interest paid growing) over time.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Paying More Than the Minimum Matters</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Credit card interest rates are among the highest of any common consumer loan, since the debt is
          unsecured, there's no collateral for the issuer to fall back on if a cardholder defaults, so that
          risk gets priced into a higher rate. A payment set only slightly above the interest owed each month
          barely reduces the principal, stretching payoff time out for years and multiplying the total
          interest paid. Running a few different payment amounts through this calculator makes that tradeoff
          concrete: even a modest increase in the monthly payment can cut both the payoff time and the total
          interest substantially.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This credit card calculator is completely free, with no account creation, email address, or payment
          required to use it. All calculations run directly based on the numbers you enter, and none of your
          financial figures are stored, logged, or shared, you can close the page and nothing you entered
          persists anywhere.
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
