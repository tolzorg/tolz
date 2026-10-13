import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the calculator decide which offer is better?",
    a: "It compares the interest you'd save with the low rate against the cash back. With the defaults ($50,000 car, $1,000 cash back at 5% vs. 2%, 60 months) the low rate saves $3,092 in interest, more than the $1,000 cash back, so the low rate wins. When the two are within about 0.05% of the car's price, it calls the offers similar.",
  },
  {
    q: "Is a cash rebate taxed?",
    a: "It depends on your state. Many states tax the full price before the rebate, so a $2,000 rebate on a $30,000 car is still taxed on $30,000. Alaska, Arizona, Delaware, Iowa, Kansas, Kentucky, Louisiana, Massachusetts, Minnesota, Missouri, Montana, Nebraska, New Hampshire, Oklahoma, Oregon, Pennsylvania, Rhode Island, Texas, Utah, Vermont and Wyoming don't tax the rebate. Pick your state and the calculator applies the right rule.",
  },
  {
    q: "Does my trade-in reduce the sales tax?",
    a: "In most states, yes: you pay tax only on the price minus the trade-in. California, the District of Columbia, Hawaii, Kentucky, Maryland, Michigan, Montana and Virginia tax the full price instead, and the calculator accounts for this when you choose your state.",
  },
  {
    q: "What if I'm paying cash for the car?",
    a: "Then the cash rebate is always the better deal. Without a loan, the interest rate doesn't matter, so only the rebate lowers what you pay.",
  },
  {
    q: "What does \"Include All Fees in Loan\" do?",
    a: "It adds the sales tax and the title, registration and other fees to the amount you borrow instead of paying them upfront. That lowers what you pay at signing but means you pay interest on them too.",
  },
  {
    q: "Does this work for introductory low rates?",
    a: "No. The calculator assumes the low rate applies for the whole loan. If the special rate only lasts for an introductory period, such as the first 12 months, the results won't apply.",
  },
  {
    q: "Is my information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
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

export default function CashBackOrLowInterestFaqSection() {
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
          This cash back or low interest calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>,
          compares a car deal's cash rebate with its low-rate financing offer. It shows the loan, monthly payment,
          interest and total cost of each, including your state's sales tax rules, so you can see which saves more.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cash Rebates</h2>
        <p style={pStyle}>
          A cash rebate is a discount off a car's purchase price, usually a few hundred to a few thousand dollars, and
          sometimes enough to cover the whole down payment. Beyond rebates open to everyone, there are often special
          rebates for military members, students, first-time buyers, loyal returning customers, or buyers switching
          from a competitor (a "conquest" incentive). Some require financing through the manufacturer's own lender.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Rebates are paid either instantly, as a deduction off the negotiated price, or as a mail-in rebate that
          arrives weeks later. Nearly all come from the manufacturer rather than the dealer, typically to clear old
          inventory or boost slow sellers. Don't confuse them with a dealer holdback, the 2–3% of MSRP a dealer
          receives back from the manufacturer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Low-Interest Financing</h2>
        <p style={pStyle}>
          Low-interest financing is a better-than-usual rate offered directly through the dealer. It cuts the interest
          you pay over the loan, and the lower the rate, the more likely it beats a rebate. These offers are usually
          reserved for "well-qualified buyers" with excellent credit, sometimes with a larger down payment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both offers lower the total cost of the car; the question is which lowers it more. Plan a single loan in
          detail with the <Link to="/calculators/financial/auto-loan-calculator" className="inline-home-link">Auto Loan Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your figures are stored, logged, or shared.
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
