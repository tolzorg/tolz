import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What kinds of debt can I include?",
    a: "Anything with a balance, a monthly or minimum payment, and an interest rate: auto loans, mortgages, personal loans, student loans, and credit cards can all be entered side by side in the same plan, up to 20 at once.",
  },
  {
    q: "What's the difference between the two \"Fixed total amount\" options?",
    a: "Choosing \"Yes\" keeps your total monthly spend on debt constant: once a debt is cleared, whatever was being paid toward it keeps being paid, just redirected to whichever remaining debt has the highest interest rate. Choosing \"No\" lets your total monthly spend shrink as each debt is paid off, since that debt's payment simply stops rather than rolling over.",
  },
  {
    q: "How do the three extra payment options work?",
    a: "All three add to the pool of money available beyond the required monthly/minimum payments, and all get funneled to whichever debt is the current avalanche target. The monthly extra is added every month, the yearly extra is added once a year (starting from month 1), and the one-time extra is added just once, during whichever month you specify.",
  },
  {
    q: "How is this different from the Credit Card Payoff Calculator?",
    a: "The Credit Card Payoff Calculator is scoped to credit cards specifically and doesn't support extra payments or the fixed/not-fixed choice. This calculator handles any mix of debt types together and adds those extra payment and budget options on top.",
  },
  {
    q: "What does the \"#\" in front of each debt's name mean?",
    a: "It's that debt's row number from the input table above. The schedule itself is listed in the order each debt actually gets paid off, not input order.",
  },
  {
    q: "What happens if a debt's payment can't cover its own interest?",
    a: "If a debt is never able to be paid off, even after every other debt is cleared and all the extra payments are directed its way, the calculator shows a message identifying which debt it is instead of a payoff plan.",
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

export default function DebtPayoffCalculatorFaqSection() {
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
          Most people carrying debt aren't juggling just one kind, a car loan, a mortgage, and a card or two
          are common all at once, and each one has a different rate quietly working against you. This debt
          payoff calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, takes every debt
          you're carrying, an optional extra payment budget, and builds a single cost-efficient payoff plan
          using the debt avalanche method, showing exactly how long it takes and how much interest the whole
          picture costs. For credit cards specifically, see the{" "}
          <Link to="/calculators/financial/credit-card-payoff-calculator" className="inline-home-link">Credit Card Payoff Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter each debt's name (optional), remaining balance, monthly or minimum payment, and interest
          rate. Up to 6 debts are shown at first, with room for up to 20 via "Show more input fields". Add
          any extra payments you plan to make beyond the required minimums, monthly, once a year, or a single
          one-time amount at a specific month, and choose whether the total monthly amount should stay fixed
          as debts get paid off, or shrink.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The result shows the total time to clear every debt, the total amount paid, and how much of that is
          interest, along with a Principal/Interest breakdown chart. Below that, a full payment schedule
          breaks the plan down debt by debt: how long each one takes, its own total interest and payments,
          and exactly which months its payment amount changes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Debt Avalanche Method</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every dollar beyond the required minimums goes to whichever debt currently has the highest interest
          rate, while every other debt still gets its own required payment. Once the highest-rate debt is
          cleared, the next-highest-rate debt becomes the new target. Attacking the highest rate first
          minimizes the total interest paid across the whole group of debts compared to spreading extra
          payments evenly or targeting the smallest balance first (the "debt snowball" approach), which can
          feel more motivating but usually costs more overall.
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
