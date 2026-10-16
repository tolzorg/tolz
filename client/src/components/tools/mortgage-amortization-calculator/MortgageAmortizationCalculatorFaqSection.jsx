import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the monthly payment calculated?",
    a: "It is the fixed payment that repays the loan with interest over the term, with interest compounded monthly. In the default example, a $500,000 home with 20% down leaves a $400,000 loan, which at 7.449% over 30 years costs $2,782.90 a month and $601,844.86 in total interest.",
  },
  {
    q: "Why does so little of the early payments go to principal?",
    a: "Interest is charged on the remaining balance, which is largest at the start. In year 1 of the default example, $29,671 of the payments is interest and only $3,724 is principal; by year 30 it is $1,309 interest and $32,086 principal.",
  },
  {
    q: "How is PMI handled?",
    a: "As on calculator.net, PMI is a yearly amount charged monthly only when the loan starts above 80% of the home price, and it stops once the balance falls to 80% of the price; the PMI payoff date shows when.",
  },
  {
    q: "Can I use a term that is not a whole number of years?",
    a: "Yes. A 2.55-year term is 30.60 monthly payments: the last one is a partial payment that clears the balance. Terms can be up to 100 years; the amortization schedule is shown for terms from just over 1 year to just under 60 years.",
  },
  {
    q: "What does the Total Out-of-Pocket include?",
    a: "The mortgage payment plus the optional property taxes (a percentage of the home price per year), home insurance, PMI, HOA fee and other costs, each spread over the months of the loan. Untick \"Include Optionals Below\" to see the loan on its own.",
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

const sampleTd = { padding: "5px 8px", fontSize: 12.5, color: "var(--text-primary)", border: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" };
const h3 = { fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 6px" };
// $20,000 over 5 years at 5%: payment $377.42 (interest and principal unrounded, shown to the cent).
const SAMPLE = [
  ["1", "$20,000.00", "$83.33", "$294.09", "$19,705.91"],
  ["2", "$19,705.91", "$82.11", "$295.32", "$19,410.59"],
  ["3", "$19,410.59", "$80.88", "$296.55", "$19,114.04"],
  ["4", "$19,114.04", "$79.64", "$297.78", "$18,816.26"],
  ["…", "…", "…", "…", "…"],
  ["58", "$1,122.90", "$4.68", "$372.75", "$750.16"],
  ["59", "$750.16", "$3.13", "$374.30", "$375.86"],
  ["60", "$375.86", "$1.57", "$375.86", "$0.00"],
];

export default function MortgageAmortizationCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this mortgage amortization calculator shows the monthly payment, how
          much of each payment goes to interest and principal, the full cost with taxes, insurance, PMI and HOA fees, and an annual or monthly
          amortization schedule with charts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To add extra payments or see bi-weekly savings, try the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}; for
          any loan, the {link("/calculators/financial/amortization-calculator", "Amortization Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Amortization?</h2>
        <p style={pStyle}>
          For a loan, amortization spreads the debt into a series of payments over time. The balance falls with each payment, and the loan is
          paid off once the scheduled payments are complete. Banks amortize many consumer loans, such as mortgages, auto loans and personal
          loans; this calculator is designed for home mortgages.
        </p>
        <p style={pStyle}>
          Amortized payments are usually fixed monthly payments spread evenly over the term. Each has two parts: interest, the fee for borrowing,
          charged as a percentage of the outstanding balance; and principal, which pays the balance down. As the balance falls, the interest part
          shrinks and the principal part grows, until near the end almost the whole payment goes to principal.
        </p>
        <p style={pStyle}>
          For example, a five-year, $20,000 loan at 5% amortizes into payments of $377.42 a month:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          {/* Phones drop Beginning Balance (the previous row's Ending Balance) so the table fits. */}
          {[false, true].map((compact) => (
            <table key={String(compact)} className={`data-table data-table--framed ${compact ? "mobile-only" : "desktop-only"}`} style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%", maxWidth: 560 }}>
              <thead>
                <tr>
                  {["Month", "Beginning Balance", "Interest", "Principal", "Ending Balance"].filter((h, j) => !(compact && j === 1)).map((h) => (
                    <th key={h} style={{ ...sampleTd, background: "var(--bg-muted)", textAlign: "center", whiteSpace: "normal" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE.map((row, i) => (
                  <tr key={`${row[0]}-${i}`}>{row.filter((c, j) => !(compact && j === 1)).map((cell, j) => <td key={j} style={sampleTd}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator also estimates the other costs of owning a home, for a fuller picture of what a home really costs each month.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Amortizing a Mortgage Faster and Saving Money</h2>
        <p style={pStyle}>
          Paying a mortgage off early saves interest and frees you from debt sooner. Longer loans earn lenders more, since interest is
          concentrated at the start, and some contracts restrict early repayment, so check with your lender first. Where it is allowed, these
          techniques help:
        </p>
        <h3 style={h3}>Increasing regular payments</h3>
        <p style={pStyle}>
          Small extra monthly payments add up. A $150,000 mortgage over 25 years at 5.45% is paid off 2.5 years sooner with an extra $50 a
          month, saving over $14,000 in interest.
        </p>
        <h3 style={h3}>Accelerating payments</h3>
        <p style={pStyle}>
          Paying half the monthly amount every two weeks makes 26 half-payments a year, the same as one extra monthly payment. On a $150,000
          mortgage over 25 years at 6.45%, that saves nearly $30,000 in interest.
        </p>
        <h3 style={h3}>Lump-sum payments or prepayments</h3>
        <p style={pStyle}>
          A prepayment on top of the regular installments reduces the balance and shortens the mortgage; the earlier it is made, the more
          interest it saves. Lenders may limit prepayments with penalties, caps or minimum amounts, usually set out in the mortgage agreement.
        </p>
        <h3 style={h3}>Refinancing</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Refinancing replaces the existing mortgage with a new one, usually at a different rate and on new terms, but it involves a new
          application, underwriting and closing, with significant fees. It can pay off, but compare carefully and read the new agreement
          thoroughly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Drawbacks of Amortizing a Mortgage Faster</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Mortgage rates are usually lower than rates on personal loans or credit cards, so money used to pay ahead can&apos;t be invested for
          higher returns elsewhere: paying off a 4% mortgage early has a real opportunity cost if that money could earn 10%. Prepayment
          penalties and lost mortgage interest deductions are other costs to weigh before making extra payments.
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
