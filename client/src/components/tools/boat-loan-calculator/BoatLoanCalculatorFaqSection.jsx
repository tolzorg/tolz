import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a boat loan payment calculated?",
    a: "The loan amount is the boat price minus your down payment and trade-in (plus tax and fees if you roll them into the loan). The monthly payment is then the standard amortization formula at the monthly interest rate. A $35,000 boat with $7,000 down at 7% for 10 years costs $325.10 a month.",
  },
  {
    q: "How much boat can I afford for a given monthly payment?",
    a: "Use the Monthly Payment tab. It works backward from the payment you want: $350 a month for 10 years at 7%, with $7,000 down, 7% tax, and $2,000 of fees paid upfront, supports a boat price of about $37,144.",
  },
  {
    q: "Should I include the taxes and fees in the loan?",
    a: "Rolling them in lowers what you pay upfront but raises the loan amount, the monthly payment, and the total interest. In the default example, financing $4,450 of tax and fees raises the payment from $325.10 to $376.77 and adds about $1,750 of interest.",
  },
  {
    q: "Does a trade-in reduce the sales tax?",
    a: "In some states it does, often with caps. This calculator assumes the full sales tax on the boat price, so your actual tax and total cost may be slightly lower if your state gives a trade-in credit.",
  },
  {
    q: "How long are boat loans?",
    a: "Terms commonly range from 2 to 20 years, depending on the boat's price and age and the lender. Longer terms lower the monthly payment but increase the total interest paid.",
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

export default function BoatLoanCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this boat loan calculator works out your monthly
          payment, total interest, and total cost from the boat price, or, with the Monthly Payment tab, how much boat a
          given monthly payment can buy, including your down payment, trade-in, sales tax, and fees.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Boat Loans</h2>
        <p style={pStyle}>
          A boat loan is financing designed for buying a boat. As with auto loans and mortgages, you borrow from a bank,
          credit union, or specialized marine lender and repay it in fixed monthly installments that include interest.
          Usually the boat itself is the collateral, so the lender can repossess it if payments aren&apos;t made.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Boat loans cover new and used boats, from small fishing boats to yachts and commercial vessels. Lenders generally
          require a down payment, terms often run from 2 to 20 years, and the rate you are offered depends on your credit,
          income, and other financial factors. Comparing offers from several lenders helps you get the best terms. The
          calculator is intended for U.S. purchases.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fees Associated with Buying a Boat</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Sales tax</strong>: most states charge 4% to 8% of the purchase price; some have caps and trade-in exemptions.</li>
          <li style={liStyle}><strong>Loan origination fees</strong>: often 1% to 3% of the loan, so $500 to $1,500 on a $50,000 loan.</li>
          <li style={liStyle}><strong>Survey fees</strong>: lenders often require a marine survey for used or larger boats.</li>
          <li style={liStyle}><strong>Title and registration</strong>: vary by state and boat size; with private sales you may handle registration yourself.</li>
          <li style={liStyle}><strong>Documentation fees</strong>: charged by some dealers for paperwork.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Trailer</strong>: small boats usually need one, often bought separately.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Together these can add thousands of dollars, so ask for a detailed breakdown before you buy.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ongoing Costs of Boat Ownership</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Insurance</strong>: covers damage, liability, and theft, and is usually required for financed boats.</li>
          <li style={liStyle}><strong>Maintenance and repairs</strong>: engine servicing, hull cleaning, winterization, and so on.</li>
          <li style={liStyle}><strong>Fuel</strong>: from about $20 a trip for a small boat to hundreds for a larger one.</li>
          <li style={liStyle}><strong>Storage</strong>: marina slips or dry storage, unless you have your own.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Gear and accessories</strong>: life jackets, fire extinguishers, electronics, fishing gear, and upgrades.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a mid-sized boat worth about $30,000, these can run $3,000 to $7,000 a year on top of the loan. See also
          the <Link to="/calculators/financial/auto-loan-calculator" style={{ color: "var(--accent)" }}>Auto Loan Calculator</Link>.
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
