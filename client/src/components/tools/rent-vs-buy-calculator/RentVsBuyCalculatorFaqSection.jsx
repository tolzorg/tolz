import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the calculator compare renting and buying?",
    a: "For every stay from 1 to 30 years, it adds up all costs of buying (down payment and closing costs, mortgage payments, property tax, insurance, HOA, maintenance, minus tax savings, minus what you get back when you sell) and of renting (rent, renter's insurance, upfront cost and the deposit's lost return), and shows the average cost per year and per month.",
  },
  {
    q: "Why does the investment return matter?",
    a: "Money spent on a down payment, closing costs or rent could otherwise be invested. The calculator carries every cost forward at your investment return after federal and state tax, so earlier spending weighs more. With a 5% return and a 25% tax rate, that is 3.75% a year.",
  },
  {
    q: "How are taxes handled?",
    a: "Mortgage interest and property tax are treated as itemized deductions: the savings are your federal plus state rate times the amount above a standard-deduction threshold ($15,000, or $22,500 for head of household), as on calculator.net. When you sell, the gain above the home-sale exclusion ($500,000 for joint filers, $250,000 for single filers) is taxed at 15%.",
  },
  {
    q: "What does \"Buying is cheaper if you stay for 6.0 years or longer\" mean?",
    a: "It is the break-even point: the stay length at which the average cost of buying falls to the average cost of renting, interpolated between whole years. If you plan to stay longer, buying works out cheaper; if not, renting does.",
  },
  {
    q: "What does the calculator leave out?",
    a: "It assumes constant appreciation, rent increases and returns, and that you can afford either option. It does not include PMI, moving costs or the non-financial value of owning or renting, so treat it as an estimate.",
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

export default function RentVsBuyCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this rent vs. buy calculator compares the average yearly
          and monthly cost of buying a home and of renting one for every stay from 1 to 30 years, and tells you how long you need
          to stay for buying to come out ahead.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It looks at the decision purely financially, using constant appreciation, rent increases and returns, and it assumes you
          can afford either option. Personal factors, such as wanting to paint the walls or preferring a predictable rent, are up to
          you. It is intended for U.S. residents.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Expect When Buying a Home</h2>
        <p style={pStyle}>
          Owning brings tax incentives and builds equity, but often less than people expect: Robert Shiller found that U.S. home
          prices rose only about 0.2% a year after inflation over the twentieth century, and maintenance, repairs and property taxes
          eat into that. Markets vary widely by region.
        </p>
        <p style={pStyle}>
          Buying and selling are expensive: the down payment, closing costs and commissions can reach 10% or more of the home&apos;s
          value. The largest recurring costs are PITI:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["Principal: the amount borrowed, the only part of PITI that builds equity.", "Interest: the cost of borrowing; mortgage interest is tax-deductible.", "Taxes: property taxes, usually 1% to 3% of the home's value a year.", "Insurance: homeowners insurance, plus PMI with less than 20% down."].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Know When Renting</h2>
        <p style={pStyle}>
          Renting costs the monthly rent plus a security deposit, application fees and possibly insurance. Its main advantage is
          flexibility, which suits anyone with an uncertain future. Before signing a lease:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["Negotiate the rent and terms; landlords may budge.", "Get every promise and responsibility in writing.", "Photograph the unit when you move in, as proof of its condition.", "Know your rights: federal law bans discrimination by race, sex, religion, disability, national origin or familial status, and fixed leases can't be raised mid-term."].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should I Buy or Rent?</h2>
        <p style={pStyle}>
          Financially, it comes down to two questions: can you cover the upfront costs, and will you stay long enough? The one-time
          costs of buying and selling only pay off over time, so the longer you stay, the more buying makes sense. The calculator
          shows that minimum stay.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To check what you can afford, use the {link("/calculators/financial/house-affordability-calculator", "House Affordability Calculator")};
          for an affordable rent, the {link("/calculators/financial/rent-calculator", "Rent Calculator")}; and for the mortgage itself,
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
