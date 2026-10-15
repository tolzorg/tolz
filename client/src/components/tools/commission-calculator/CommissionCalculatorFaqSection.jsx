import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate a commission?",
    a: "Multiply the sales price by the commission rate. A 3% commission on a $200,000 sale is $200,000 × 3% = $6,000. To find the sales price instead, divide the commission by the rate; to find the rate, divide the commission by the sales price.",
  },
  {
    q: "How does a tiered commission work?",
    a: "Each rate applies only to the part of the sale inside its tier. With 3% up to $20,000 and 5% above it, a $200,000 sale earns $20,000 × 3% + $180,000 × 5% = $600 + $9,000 = $9,600, not 5% of the whole $200,000.",
  },
  {
    q: "What is a base commission?",
    a: "An amount paid whether or not a sale happens, such as a base salary. Enter it as a dollar amount, or as a percentage of the sales price, and it is added to the rest of the commission.",
  },
  {
    q: "Can a tier pay a flat dollar amount?",
    a: "Yes. Switch a tier's unit from % to $ and that tier pays the flat amount once the sales price passes the tier's starting point, instead of a percentage of the sales inside it.",
  },
  {
    q: "What if the top tier has no upper limit?",
    a: "Leave its \"To\" box blank. Every dollar of sales above the previous tier then earns that tier's rate. Each \"To\" value must be at least as large as the one before it.",
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

export default function CommissionCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this commission calculator solves for the commission, sales price or
          commission rate from the other two, and works out tiered commissions with an optional base amount.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A commission is pay that salespeople earn based on how much they sell, which motivates them because their sales directly drive
          their earnings. In its simplest form it is a percentage of revenue: at 3%, a $100 sale earns $3. Commissions can also be based on
          profit or paid as bonuses, and salespeople may earn commission only or a mix of hourly pay or salary plus commission.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Different Commission Structures</h2>
        <p style={pStyle}>
          Businesses choose a structure to encourage the behaviour they want: some reduce commission when discounts are given, others reward
          repeat customers. This calculator covers three common structures.
        </p>
        <p style={pStyle}>
          <strong>Commission only.</strong> Pay comes entirely from sales, as a percentage of revenue. A real estate agent on 3% who sells a
          $500,000 house earns 500,000 × 3% = $15,000, but earns nothing without a sale. The formula is: sale price × commission percentage =
          compensation.
        </p>
        <p style={pStyle}>
          <strong>Base salary plus commission.</strong> A base salary gives some security, and commission adds to it. With a $500 monthly base and
          1.5% commission, selling one $25,000 car earns 500 + 25,000 × 1.5% = $875; two such cars earn 500 + 25,000 × 2 × 1.5% = $1,250; and one
          $25,000 car plus two $33,000 cars earn 500 + (25,000 + 33,000 × 2) × 1.5% = $1,865. In general: base salary + (n<sub>1</sub> × price<sub>1</sub> +
          n<sub>2</sub> × price<sub>2</sub> + …) × commission percentage. The &quot;Sales Price&quot; box takes your total accumulated sales.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Tiered commission.</strong> The rate rises with total sales, but each rate applies only to the sales within its tier. With 3% on
          $0–20,000, 5% on $20,000–25,000 and 10% on $25,000–30,000, selling $27,000 earns 20,000 × 3% + 5,000 × 5% + 2,000 × 10% = $1,050, not
          10% of $27,000. The formula is t<sub>1</sub> × c<sub>1</sub> + (t<sub>2</sub> − t<sub>1</sub>) × c<sub>2</sub> + … + (sales price −
          t<sub>n−1</sub>) × c<sub>n</sub>, where t is each tier&apos;s upper limit and c its rate. For related pay figures, see the{" "}
          {link("/calculators/financial/salary-calculator", "Salary Calculator")} and the{" "}
          {link("/calculators/financial/take-home-pay-calculator", "Take-Home-Paycheck Calculator")}.
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
