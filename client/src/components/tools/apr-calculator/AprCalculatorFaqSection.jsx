import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does \"Real APR\" mean?",
    a: "It's the true annual cost of the loan once fees are included. The calculator finds the rate at which your payments are worth exactly what you actually receive (the loan minus upfront fees) and states it as an annual rate compounded monthly. In the default example, a $100,000, 10-year loan at 6% with $2,500 of upfront fees has a real APR of 6.563%.",
  },
  {
    q: "What's the difference between loaned fees and upfront fees?",
    a: "Loaned fees are added to the loan amount, so you borrow them and pay interest on them. Upfront fees are paid out of pocket before or at closing. Both raise the APR above the interest rate.",
  },
  {
    q: "How are points and PMI handled in the mortgage calculator?",
    a: "Each point is 1% of the loan amount paid upfront, and points count toward the APR. PMI applies when the down payment is under 20%: it is charged monthly until the loan balance falls to 80% of the house value, and those payments are included in the APR and in the fees shown.",
  },
  {
    q: "Why is APR higher than the interest rate?",
    a: "Fees reduce the money you effectively receive while your payments stay the same, so the true cost of borrowing is higher than the quoted rate. With no fees, the APR equals the interest rate.",
  },
  {
    q: "What's the difference between APR and APY?",
    a: "APR is a nominal annual rate compounded monthly; APY (also called EAR or EAPR) is the effective annual rate after compounding. A 10% APR equals a 10.47% APY, which is why lenders quote APR on loans and banks quote APY on savings.",
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

export default function AprCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this APR calculator finds the real annual percentage
          rate of a loan once its fees are included, for general loans with any compounding and payment frequency and for
          U.S. mortgages with points and PMI, with an amortization schedule.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The APR is an all-inclusive, annualized measure of a loan&apos;s cost: it includes interest as well as fees and
          other charges. Borrowers often confuse it with the interest rate, which only reflects the cost of the principal.
          Because the APR adds the fees on top of the interest, it is a better way to compare offers from different lenders.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fees Included in a Mortgage APR</h2>
        <p style={pStyle}>
          In the U.S., the Truth in Lending Act requires lenders to show APRs so borrowers can compare costs. Every lender is
          different, so ask each one to list the costs packed into its APR. For mortgages, the APR may include:
        </p>
        <ul style={{ ...ulStyle, columns: 2, columnGap: 28 }}>
          {["Administration fees", "Application fees", "Mortgage insurance", "Mortgage broker fees", "Audit fees", "Certain closing fees", "Escrow fees", "Origination points", "Discount points", "Processing fees", "Refinance fees", "Underwriting fees"].map((x) => <li key={x} style={{ ...liStyle, breakInside: "avoid" }}>{x}</li>)}
        </ul>
        <p style={pStyle}>Fees usually left out of a mortgage APR include:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["Appraisal fees", "Survey fees", "Title insurance and fees", "Builder warranties", "Pre-paid items on escrow balances, such as taxes or insurance", "Intangible taxes"].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Limitations of the APR</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The APR assumes the loan runs its full term. If you pay it off early, the APR understates the impact of upfront
          costs: fees spread over 30 years look much cheaper than over 10. Most U.S. 30-year mortgages end early through a sale,
          a refinance, or prepayments, so between two loans with the same APR, the one with lower upfront fees is better if you
          expect to pay it off early.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed vs. Variable APRs</h2>
        <h3 style={h3Style}>Fixed APRs</h3>
        <p style={pStyle}>
          A fixed APR stays the same for the life of the loan. It is worth locking in an attractive fixed rate when market rates
          are relatively low, since they are likely to rise. Fixed rates are usually higher than variable rates at the start.
        </p>
        <h3 style={h3Style}>Variable APRs</h3>
        <p style={pStyle}>
          A variable APR can change over time, typically following an index such as the Federal Funds Rate. Lenders may also add
          a credit-based margin, so borrowers with poor credit may not get the lowest variable rate, if they are approved at all.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A variable rate can make sense when market rates are high and expected to fall; historically, borrowers have generally
          paid less interest with variable rates. The longer the loan, the more rate swings matter, so a 30-year loan is affected
          more than a 10- or 15-year one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>APR vs. APY</h2>
        <p style={pStyle}>
          APY, the annual percentage yield, is used mostly for deposit accounts. Also called the effective annual rate (EAR or
          EAPR), it reflects interest compounded over a year. APR is a nominal rate compounded monthly, so for the same positive
          rate the APR looks lower than the APY. That is why lenders advertise APRs on loans and banks advertise APYs on savings.
        </p>
        <p style={{ ...pStyle, textAlign: "center", fontWeight: 700, color: "var(--text-primary)" }}>
          $100 × ((1 + 10% ÷ 12)<sup>12</sup> − 1) = $10.47
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So a 10% APR costs the same as a 10.47% APY. Use the {link("/calculators/financial/compound-interest-calculator", "Compound Interest Calculator")} to
          convert between APR, APY, and other compounding frequencies, and see the {link("/calculators/financial/loan-calculator", "Loan Calculator")} and
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
