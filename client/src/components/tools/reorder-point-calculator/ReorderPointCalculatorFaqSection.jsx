import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate the reorder point?",
    a: "Use the ROP formula: reorder point = (safety stock + basic stock + lead time) × unit sales, with the stocks and the lead time in days and the unit sales in items per day. For example, (2 + 10 + 1) × 10 = 130 items.",
  },
  {
    q: "What is the difference between basic stock and safety stock?",
    a: "Basic stock is your regular inventory, enough to meet customers' demand at any moment. Safety stock is an extra portion kept for extraordinary circumstances, such as a delayed delivery or a sudden spike in sales. Both are given in days' worth of sales.",
  },
  {
    q: "What is lead time?",
    a: "Lead time is the time between ordering a product and it arriving at your door. In some fields, delivery can take weeks or even months, which makes it one of the most important factors in when to reorder.",
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
const h3Style = { ...h2Style, fontSize: 15, margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
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

export default function ReorderPointCalculatorFaqSection() {
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
        <h2 style={h2Style}>Reorder Point Calculator</h2>
        <p style={pStyle}>
          Don&apos;t know when to reorder? Afraid of shortages and overstock? The {link("/", "Tolz")} reorder point calculator tells you precisely
          when to order a new batch of items.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Below we explain the reorder level and the inventory replenishment formula, and how to calculate the reorder point (also called the
          reorder level of inventory).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Reorder Point?</h2>
        <p style={pStyle}>
          The reorder point is the number of items left in your inventory at which you should order more. It matters most for perishable
          products such as food: badly timed orders can mean massive overstock, spoilage and a lot of lost money.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the other hand, ordering fewer products than you really need to save a little leads to lost sales and dissatisfied customers,
          which can hurt your business badly. For other sales maths, see the {link("/calculators/financial/sales-tax-calculator", "sales tax calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Reorder Point Calculator</h2>
        <p style={pStyle}>Reorder point (ROP) calculations rest on a few definitions:</p>
        <h3 style={h3Style}>Basic stock 📦</h3>
        <p style={pStyle}>
          The typical number of items you keep, enough to meet customers&apos; demand at any moment and keep sales going. Enter how long your
          typical stock lasts, in hours, days, weeks, months or years.
        </p>
        <h3 style={h3Style}>Safety stock 🗄️</h3>
        <p style={pStyle}>
          An extra portion of items kept for extraordinary circumstances, also given in days&apos; (or weeks&apos;, months&apos;) worth. Keep it at a
          moderate level, although sometimes it pays off handsomely (think of a stock of masks and hand sanitizer just before the COVID-19
          pandemic).
        </p>
        <h3 style={h3Style}>Lead time ⏱️</h3>
        <p style={pStyle}>
          The time between ordering a product and it arriving at your door. In some fields it is one of the most critical factors: delivery
          can take weeks or even months.
        </p>
        <h3 style={h3Style}>Unit sales 🎁</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          How many items of a given kind you usually sell in a period of time; choose the period (day, week, month, three months, half a year
          or year) from the dropdown.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Reorder Point for Inventory</h2>
        <p style={pStyle}>The reorder point formula (ROP formula) is:</p>
        <p style={formula}>Reorder point = (Safety stock + Basic stock + Lead time) × Unit sales</p>
        <ul style={listStyle}>
          <li>Safety stock, basic stock and lead time are in days; and</li>
          <li>Unit sales are in items per day.</li>
        </ul>
        <p style={pStyle}>
          Example: a shop sells bottles of beer 🍺. Its basic stock lasts 10 days, its safety stock is 2 days, the lead time is 1 day, and it
          usually sells 10 bottles a day.
        </p>
        <p style={formula}>Reorder point = (2 + 10 + 1) × 10 = 130</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The shop should reorder when it has 130 bottles left. The calculator also works backwards: leave any one value blank and enter the
          reorder point to find it. More tools are in the {link("/calculators/logistics", "logistics calculators")}.
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
