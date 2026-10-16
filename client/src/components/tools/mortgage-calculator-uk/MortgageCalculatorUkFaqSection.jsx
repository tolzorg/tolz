import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the monthly repayment calculated?",
    a: "It is the fixed monthly payment that repays the loan with interest over the term. In the default example, a £500,000 home with a 25% deposit leaves a £375,000 loan, which at 5% over 25 years costs £2,192.21 a month, or £282,663.80 in total interest.",
  },
  {
    q: "What does \"Interest Only\" mean?",
    a: "It is the monthly payment on an interest-only mortgage: just the interest on the loan (£375,000 × 5% ÷ 12 = £1,562.50 in the example). The loan itself is not paid down, so the full amount is still owed at the end of the term.",
  },
  {
    q: "What are the optional costs?",
    a: "Taxes (a percentage of the home price per year), home insurance, mortgage insurance and other costs (each in pounds per year). They are spread over the months of the term and added to the mortgage payment to give the total out-of-pocket cost. Untick \"Include Optionals Below\" to see the mortgage on its own.",
  },
  {
    q: "Can I use a term that is not a whole number of years?",
    a: "Yes. A 2.55-year term is 30.6 monthly payments: the last one is a partial payment that clears the balance, and the yearly costs are charged for 30.6 months. Terms can be up to 100 years; the amortization schedule is shown for terms from just over 1 year to just under 60 years.",
  },
  {
    q: "Does this include stamp duty?",
    a: "No. Stamp duty is paid once when you buy, so it is not part of the monthly repayment. See the stamp duty bands above to estimate it separately.",
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

const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 12px", listStyleType: "disc" };
const bandTd = { padding: "6px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)" };
const BANDS = [["Up to £125,000", "0%"], ["£125,001 to £250,000", "2%"], ["£250,001 to £925,000", "5%"], ["£925,001 to £1,500,000", "10%"], ["Over £1,500,000", "12%"]];

export default function MortgageCalculatorUkFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this UK mortgage calculator works out the monthly repayment and the
          interest-only payment in pounds, with taxes, insurance and other costs, a monthly and annual amortization schedule and charts.
        </p>
        <p style={pStyle}>
          In the UK it helps to arrive well prepared when applying for a mortgage at a bank, bringing everything the lender may ask for, such as:
        </p>
        <ul style={listStyle}>
          <li>addresses for the last three years, with no gaps</li>
          <li>income details for the last three months, plus three years of income records</li>
          <li>bank statements for the past three months (more can help)</li>
          <li>documents for any loans or credit cards</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It is also worth checking your credit score and raising any questionable negative marks with the lender. With good credit it is
          possible to borrow with a fairly small deposit: many UK mortgages accept deposits of 5% or less of the property value, though this
          changes with market conditions. For a US-style mortgage with property tax and HOA fees, see the{" "}
          {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tracker Mortgage</h2>
        <p style={pStyle}>
          A tracker mortgage follows the movements of another rate, most commonly the Bank of England base rate. Most UK lenders favour
          variable-rate mortgages in one form or another, so there is a wide range of these. Some start as trackers and become standard
          variable-rate mortgages after a few years.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Introductory tracker rates can be among the lowest available, but like all variable rates they can rise as well as fall. Most
          introductory trackers carry an early repayment charge if you remortgage or repay during the introductory period, and lifetime
          trackers can carry one for a period after they are taken out.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Flexible Mortgage</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A flexible mortgage lets you overpay, underpay or take a payment holiday from time to time. Overpayments, as lump sums or as part of
          the regular payment, pay the loan down faster; underpayments lower some monthly payments; and payment holidays pause payments for
          short spells, sometimes up to six months. These features usually come with charges and conditions, so compare the costs of flexible
          mortgages carefully.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Stamp Duty</h2>
        <p style={pStyle}>
          Stamp Duty Land Tax is charged when you buy a property in England or Northern Ireland. Since 1 April 2025, each rate applies only to
          the part of the price inside its band:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%", maxWidth: 460 }}>
            <thead>
              <tr>
                <th style={{ ...bandTd, background: "var(--bg-muted)", textAlign: "left" }}>Portion of the price</th>
                <th style={{ ...bandTd, background: "var(--bg-muted)", textAlign: "right" }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {BANDS.map(([band, pct]) => (
                <tr key={band}><td style={bandTd}>{band}</td><td style={{ ...bandTd, textAlign: "right" }}>{pct}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={pStyle}>
          First-time buyers pay nothing on the first £300,000 and 5% on the portion from £300,001 to £500,000, as long as the price is
          £500,000 or less; above that the standard bands apply.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other rules apply too: higher rates for additional properties, separate taxes in Scotland (Land and Buildings Transaction Tax) and
          Wales (Land Transaction Tax), and special cases such as replacing a main residence, shared ownership, corporate buyers or buying six
          or more properties at once. Stamp duty can be complex, so check the current rules or take professional advice before you buy.
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
