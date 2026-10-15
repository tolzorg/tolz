import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the FHA monthly payment calculated?",
    a: "The upfront MIP is added to the loan, and the principal and interest payment is the standard fixed-rate mortgage payment on that total. In the default example, a $500,000 home with 3.5% down and a 1.75% upfront MIP gives a $491,250 loan; at 7.388% for 30 years the payment is $3,397.30 a month.",
  },
  {
    q: "How is the upfront MIP worked out here?",
    a: "As on the reference calculator, the upfront MIP percentage is applied to the home price and the result is financed into the loan. The annual MIP is charged on the base loan (price minus down payment) and divided into twelve equal monthly payments.",
  },
  {
    q: "What do the Annual FHA MIP Duration options mean?",
    a: "Loan Term charges the annual MIP for every payment. 11 Years and 5 Years stop it after 132 or 60 payments. 78% LTV stops it once the month-end balance falls to 78% of the home price, and No Annual MIP leaves it out. The results show the date the annual MIP ends.",
  },
  {
    q: "Why did the Annual FHA MIP rate change when I edited the loan?",
    a: "Changing the home price, down payment or term refills the rate from the 2026 FHA table: for terms over 15 years it is 0.55% (or 0.50% with at least 5% down), and higher for loans above $726,200; for terms of 15 years or less it is 0.40% or 0.15%. You can still type your own rate.",
  },
  {
    q: "How do extra payments and the bi-weekly option work?",
    a: "Extra monthly, yearly or one-time payments go straight to principal, so the loan ends sooner and the time-based costs stop earlier. The bi-weekly comparison pays half the monthly payment every two weeks, which adds up to one extra monthly payment a year.",
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
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
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

export default function FhaLoanCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this FHA loan calculator estimates the monthly payment
          of a U.S. FHA mortgage with its upfront and annual mortgage insurance premiums (MIP), property taxes, insurance and
          other costs, extra payments, a bi-weekly comparison and a full amortization schedule.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          FHA loans are mortgages insured by the Federal Housing Administration. The FHA doesn&apos;t lend money itself; it
          insures lenders, which lets them offer loans with down payments as low as 3.5% and to borrowers with lower credit
          scores.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mortgage Insurance Premiums</h2>
        <p style={pStyle}>
          FHA borrowers pay a one-time upfront MIP, usually 1.75%, which can be financed into the loan, plus an annual MIP paid
          monthly. The annual rate depends on the term, the loan amount and the loan-to-value (LTV) ratio. With at least 10%
          down (LTV of 90% or less), the annual MIP can end after 11 years; otherwise it stays for the life of the loan.
        </p>
        <h3 style={h3Style}>2026 annual MIP rates: terms longer than 15 years</h3>
        <ul style={ulStyle}>
          {["$726,200 or less, LTV 95% or less: 0.50%", "$726,200 or less, LTV above 95%: 0.55%", "Above $726,200, LTV 95% or less: 0.70%", "Above $726,200, LTV above 95%: 0.75%"].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <h3 style={h3Style}>2026 annual MIP rates: terms of 15 years or less</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["$726,200 or less, LTV 90% or less: 0.15%", "$726,200 or less, LTV above 90%: 0.40%", "Above $726,200, LTV 78% or less: 0.15%", "Above $726,200, LTV 78% to 90%: 0.40%", "Above $726,200, LTV above 90%: 0.65%"].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pros and Cons of FHA Loans</h2>
        <h3 style={h3Style}>Pros</h3>
        <ul style={ulStyle}>
          {["Down payments as low as 3.5%.", "Approval with credit scores of 580 or even lower.", "No prepayment penalties.", "No minimum income, as long as you can show you can repay.", "In some cases, total monthly debts of up to 57% of income are allowed."].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <h3 style={h3Style}>Cons</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["The MIP makes FHA loans more expensive than conventional loans, and it isn't cancelled at 20% equity.", "Loan limits are lower, so expensive homes may need a conventional loan.", "Borrowers with excellent credit can often get better rates elsewhere.", "Properties must meet basic health and safety standards."].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Affordability and Prepayment</h2>
        <p style={pStyle}>
          HUD sets FHA debt-to-income limits of 31% (front-end) and 43% (back-end), with exceptions for compensating factors
          such as a larger down payment, a strong payment history, excellent credit or substantial savings. Use
          the {link("/calculators/financial/house-affordability-calculator", "House Affordability Calculator")} to see what you
          can afford.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          FHA loans have no prepayment penalty. Open More Options to add extra monthly, yearly or one-time payments and see how
          much sooner the loan ends. For a conventional loan, try the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FHA 203(k) Loans</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          An FHA 203(k) loan finances both the purchase and the renovation of a primary residence, or the renovation of a home
          you already own. It shares the regular FHA loan&apos;s easy qualification and insurance premiums; the work must be
          finished within six months, and the funds are paid to contractors from escrow as improvements are made.
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
