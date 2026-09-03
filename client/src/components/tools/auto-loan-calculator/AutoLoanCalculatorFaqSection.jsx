import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Auto Loan Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What's the difference between the \"Total Price\" and \"Monthly Payment\" tabs?",
    a: "Total Price starts from the vehicle's price and calculates your monthly payment. Monthly Payment works in reverse — tell it the monthly payment you can afford, and it solves for the vehicle price that would produce it, using the exact same loan terms, taxes, and fees.",
  },
  {
    q: "How is Sales Tax calculated?",
    a: "Sales Tax = (Auto Price − Trade-in Value − Cash Incentives, if your state exempts them) × your sales tax rate. Nearly every state gives a tax credit for the value of a trade-in. Whether Cash Incentives (manufacturer rebates) are also exempt from tax depends on your state — most states exempt them, but several tax the full pre-rebate price. Selecting your state under \"Your State\" applies the right rule; leaving it unselected assumes the rebate is exempt.",
  },
  {
    q: "What does \"Include taxes and fees in loan\" change?",
    a: "Unchecked, Sales Tax and Title/Registration/Other Fees are paid upfront alongside your down payment, and only the vehicle's net price is financed. Checked, those amounts are rolled into the loan itself — your Upfront Payment drops to just your down payment, but your loan amount (and total interest paid) goes up.",
  },
  {
    q: "How is the Total Loan Amount calculated?",
    a: "Auto Price − Cash Incentives − Down Payment − Trade-in Value + Amount Owed on Trade-in — plus Sales Tax and fees if you've chosen to include them in the loan. Amount Owed on Trade-in (negative equity you still owe on the vehicle you're trading in) gets added back in, since it's rolled into the new loan rather than paid off separately.",
  },
  {
    q: "What's included in \"Total Cost\"?",
    a: "Auto Price + Total Loan Interest + Sales Tax + Title/Registration/Other Fees − Cash Incentives — everything you'll actually pay in total to buy and finance the vehicle, from the day you sign to your final payment, net of any rebate.",
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

export default function AutoLoanCalculatorFaqSection() {
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
          Calculate your monthly auto loan payment including sales tax, trade-in credit, cash incentives, and
          title/registration fees — with a full amortization schedule. Free, right in your browser. Also try the{" "}
          <Link to="/calculators/financial/loan-calculator" className="inline-home-link">Loan Calculator</Link>
          {" "}for general amortized, deferred, or bond loans, built as part of{" "}
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
