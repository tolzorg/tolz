import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the debt avalanche method?",
    a: "It's a strategy for paying off multiple debts that puts every extra dollar of budget toward the single highest-interest-rate balance, while every other balance still gets its own minimum payment. Once the highest-rate balance is cleared, its former payment rolls into whichever balance has the next-highest rate, and so on. Mathematically, it minimizes the total interest paid across all the debts compared to any other fixed order of attack.",
  },
  {
    q: "How is this different from the plain Credit Card Calculator?",
    a: "The plain Credit Card Calculator handles a single balance on its own. This calculator is for juggling several cards at once, it decides which card should get the extra payment each month and produces a full payback schedule for every card, not just one.",
  },
  {
    q: "What does the \"#\" in front of each card's name mean?",
    a: "It's simply that card's row number from the input table above, shown as a quick way to match a schedule row back to the card you entered. The rows themselves are listed in the order each card actually gets paid off, not in input order, so the fastest-clearing card appears first.",
  },
  {
    q: "What happens if my budget doesn't cover all my minimum payments?",
    a: "The calculator shows a warning instead of a payoff plan. If the combined minimum payments already exceed what's set aside, none of the balances can shrink, they can only grow, so increasing the budget (or reducing the number of cards being carried) has to happen first before a payoff schedule makes sense.",
  },
  {
    q: "Does the order cards are entered in matter?",
    a: "No. The calculator always attacks cards in order of interest rate, highest first, regardless of which row a card was typed into. Input order only affects the default \"Card N\" name suggestion and the \"#N\" row reference in the schedule.",
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

export default function CreditCardPayoffCalculatorFaqSection() {
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
          Carrying more than one credit card balance at once makes it hard to see which one is actually
          costing the most, and an even split of extra payments across all of them isn't the cheapest way
          out. This credit cards payoff calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>,
          takes a monthly budget and up to 20 card balances and builds a cost-efficient payback schedule using
          the debt avalanche method, showing exactly how long it takes and how much interest it costs to clear
          every one of them. For a single card on its own, see the{" "}
          <Link to="/calculators/financial/credit-card-calculator" className="inline-home-link">Credit Card Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter the total monthly budget set aside for paying down credit card debt across all your cards.
          Then, for each card, enter a name (optional), its current balance, its minimum payment, and its
          interest rate. Up to 6 cards are shown at first; a "Show more input fields" link reveals room for up
          to 20.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The result shows the total time to clear every balance, the total amount paid, and how much of that
          is interest, along with a Principal/Interest breakdown chart. Below that, a full payback schedule
          breaks the plan down card by card: how long each one takes, its own total interest and payments, and
          exactly which months its payment amount changes as other cards get paid off and free up their
          budget.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Attack the Highest Rate First</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every dollar of extra payment stops earning interest for whichever card it retires the fastest per
          dollar spent, and the balance with the highest interest rate is generating the most interest per
          dollar of remaining balance. Clearing that one first, while still meeting the minimums everywhere
          else, means fewer total dollars go to interest overall compared to spreading extra payments evenly
          or targeting the smallest balance first. The savings show up directly in this calculator's own
          numbers: run the same budget and balances through an even split instead, and the total interest paid
          comes out higher.
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
