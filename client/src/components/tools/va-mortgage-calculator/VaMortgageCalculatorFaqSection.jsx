import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the VA mortgage payment calculated?",
    a: "The VA funding fee is worked out on the loan amount before the fee (home price minus down payment). If it is financed, it is added to the loan, and the monthly payment is the standard fixed-rate mortgage payment on that total. In the default example, a $500,000 home with no down payment has a 2.15% fee of $10,750, a $510,750 loan and a $3,532.15 monthly payment at 7.388% for 30 years.",
  },
  {
    q: "What VA funding fee rate does the calculator use?",
    a: "With less than 5% down the fee is 2.15% for a first VA loan and 3.3% after a previous one; with 5% to under 10% down it is 1.5%; with 10% or more down it is 1.25%. Reservists and National Guard members pay the same rates.",
  },
  {
    q: "Who doesn't pay the funding fee?",
    a: "Borrowers with a service-related disability rated 10% or more, and surviving spouses, are exempt. The results then show a VA Funding Fee of 0%.",
  },
  {
    q: "What is the difference between financing the fee and paying it upfront?",
    a: "Financing adds the fee to the loan, so you pay interest on it over the term. Paying it upfront keeps the loan at the home price minus the down payment, which lowers the monthly payment and the total interest.",
  },
  {
    q: "What do the More Options add?",
    a: "Property taxes, home insurance, HOA fees and other costs (with optional yearly increases), a start date, extra monthly, yearly or one-time payments, and a bi-weekly payback comparison. The results then include monthly and lifetime totals and the payoff date.",
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

export default function VaMortgageCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this VA mortgage calculator estimates the monthly payment
          of a U.S. VA home loan with the VA funding fee, property taxes, insurance and other costs, extra payments, a bi-weekly
          comparison and a full amortization schedule.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          VA loans are mortgages for veterans, active-duty service members, National Guard members, reservists and surviving
          spouses, guaranteed by the U.S. Department of Veterans Affairs. Borrowers with a DD 214 showing an honorable
          discharge may qualify.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>VA Funding Fee</h2>
        <p style={pStyle}>
          The VA funding fee is a one-time charge that keeps the program running and covers losses when borrowers default. It
          ranges from 0% to 3.3% of the loan depending on the down payment, prior VA loan use, the type of home and the loan
          purpose. It is waived for borrowers with a service-related disability of 10% or more and for surviving spouses. The
          fee can be financed into the loan; other closing costs are paid at closing by the buyer or the seller, as negotiated.
        </p>
        <h3 style={h3Style}>Standard purchase loan rates</h3>
        <ul style={ulStyle}>
          {["Less than 5% down: 2.15% for first use, 3.3% for later use", "5% to less than 10% down: 1.5%", "10% or more down: 1.25%"].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <h3 style={h3Style}>Other scenarios</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["Interest Rate Reduction Refinancing Loans (IRRRL): 0.50%", "Loan assumptions: 0.50%", "Manufactured homes not permanently affixed: 1.00%"].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Common Closing Costs</h2>
        <ul style={ulStyle}>
          {["Loan origination fee, for processing the loan", "Discount points, to buy a lower rate (two points or less is considered reasonable)", "Credit report fee", "Appraisal fee", "Hazard insurance and real estate taxes for the first year", "Title insurance", "Recording fee"].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Brokerage fees and real estate commissions are normally not paid by the buyer.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pros and Cons of VA Loans</h2>
        <h3 style={h3Style}>Pros</h3>
        <ul style={ulStyle}>
          {["No down payment required.", "No mortgage insurance.", "Sellers may pay closing costs, up to 4% of the loan amount.", "Can be used again and for refinancing.", "Rates and closing costs are typically slightly lower.", "VA appraisals help avoid overpaying."].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <h3 style={h3Style}>Cons</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["Only borrowers with a DD 214 qualify.", "The funding fee can be expensive if you aren't exempt.", "No financing for planned renovations, so fixer-uppers are out.", "Not every seller or lender works with VA buyers.", "Only for primary residences, not investment property or land.", "More paperwork at closing."].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Prepayment and Affordability</h2>
        <p style={pStyle}>
          VA loans have no prepayment penalty: borrowers may prepay at any time, without premium or fee. Open More Options to add
          extra monthly, yearly or one-time payments and see how much sooner the loan ends and how much interest you save.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To see how much home you can afford with a VA loan, use
          the {link("/calculators/financial/house-affordability-calculator", "House Affordability Calculator")} and choose the VA
          loan debt-to-income option. You can also compare with the {link("/calculators/financial/fha-loan-calculator", "FHA Loan Calculator")} or
          the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}.
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
