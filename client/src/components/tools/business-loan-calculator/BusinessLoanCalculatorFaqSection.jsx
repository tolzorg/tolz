import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a business loan payment calculated?",
    a: "With the standard amortization formula: payment = loan × r ÷ (1 − (1 + r)^−n), where r is the interest rate per payment period and n is the number of payments. A $10,000 loan at 10% APR over 5 years of monthly payments works out to $212.47 a month, or $12,748.23 in total.",
  },
  {
    q: "What is the real rate (APR) with fees?",
    a: "Fees such as the origination and documentation fee come out of the money you receive, but your payments are still based on the full loan. The real rate is the interest rate that matches those payments to the money you actually got. In the default example, $1,250 of fees turn a 10% loan into a real rate of about 15.93%.",
  },
  {
    q: "What is an origination fee?",
    a: "A charge for processing and approving the loan, usually 1% to 6% of the loan amount. On a $10,000 loan, a 5% origination fee is $500. Lenders often deduct it from the amount they pay out.",
  },
  {
    q: "How does an interest-only business loan work?",
    a: "You pay only the interest each month, then repay the whole principal when the loan matures. Payments are lower during the term, but you pay more interest overall because the balance never goes down. $10,000 at 10% costs $83.33 a month, then $10,000 at the end.",
  },
  {
    q: "What does paying back \"In the End\" mean?",
    a: "No payments are made during the term. Interest compounds on the balance and the whole amount is repaid in one lump sum at maturity. $10,000 at 10% APR for 5 years grows to $16,453.09.",
  },
  {
    q: "Why does paying more often lower the total interest?",
    a: "Each payment reduces the balance sooner, so less interest builds up between payments. At the same 10% APR over 5 years, paying every week costs about $40 less interest than paying monthly, while paying once a year costs about $600 more.",
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
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

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

export default function BusinessLoanCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this business loan calculator works out the
          payment, total interest, and real rate of a business loan once origination, documentation, and other fees are
          included, for regular, interest-only, or lump-sum repayment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business Loans</h2>
        <p style={pStyle}>
          Business loans are loans intended for business purposes. Like other loans, the borrower pays back both the
          principal and the interest. Most business loans are repaid monthly, though some call for weekly, daily, or
          interest-only payments, and a few are repaid in one sum when the loan matures.
        </p>
        <div style={formulaStyle}>Payment = Loan × r ÷ (1 − (1 + r)^−n)</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here r is the interest rate per payment period and n is the number of payments. When interest compounds at a
          different frequency than you pay, the rate is first converted to its effective annual rate and then to the rate
          for one payment period.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>SBA Loans</h2>
        <p style={pStyle}>
          Small Business Administration (SBA) loans are made by banks, community organizations, and other lenders, and
          partly guaranteed by the U.S. Small Business Administration: 75% to 90% of the loan if the borrower defaults.
          That lowers the lender&apos;s risk, but SBA loans involve more paperwork, extra fees, and longer approval. The
          four main types are:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>7(a) loan</strong>: the main SBA loan, up to $5 million, for working capital, equipment, real estate, or refinancing; up to 10 years for working capital or 25 years for fixed assets.</li>
          <li style={liStyle}><strong>Microloan</strong>: up to $50,000 (averaging about $15,000) for new or growing small businesses, with terms of up to six years.</li>
          <li style={liStyle}><strong>CDC/504 loan</strong>: long-term fixed-rate financing for real estate or equipment, up to $5.5 million over 10, 20, or 25 years.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Disaster loan</strong>: up to $2 million to repair or replace property, equipment, or inventory damaged in a declared disaster.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Loan Types</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Conventional loans</strong>: from banks and other lenders without a government guarantee. They usually have higher rates and shorter terms but a quicker, less regulated process, and come in many forms, such as asset-based, invoice, and cash flow financing.</li>
          <li style={liStyle}><strong>Personal loans</strong>: sometimes used for small business purposes, especially by new businesses without a credit history of their own.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Interest-only loans</strong>: only interest is paid during the term and the full principal is due at maturity, which keeps payments low when higher income is expected later.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business Loan Fees</h2>
        <p style={pStyle}>
          Besides interest, lenders charge fees to cover verifying your information and preparing the paperwork. The most
          common are:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Origination fee</strong>: for processing and approving the loan, either flat or a percentage of the loan, generally 1% to 6%.</li>
          <li style={liStyle}><strong>Documentation fee</strong>: for processing the paperwork.</li>
          <li style={liStyle}><strong>Other fees</strong>: application fees, monthly administrative or annual fees, prepayment penalties, late payment fees, wire transfer fees, and so on. Some only apply in certain situations.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          All these fees make the real cost of a loan higher than its stated interest rate. The calculator includes them
          and shows the real rate, so you can compare loans on their true cost.
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
