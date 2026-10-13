import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate profit margin?",
    a: "Subtract cost from revenue to get profit, then divide profit by revenue. A product that costs $120 and sells for $160 earns $40 of profit, a 25% margin. In the calculator, enter any two of cost, revenue, margin, and profit and it fills in the rest.",
  },
  {
    q: "What's the difference between margin and markup?",
    a: "Both compare profit to something else. Margin is profit as a percentage of revenue (the selling price); markup is profit as a percentage of cost. The same $40 profit on a $120 cost and $160 price is a 25% margin but a 33.33% markup, so markup is always the bigger number when there's a profit.",
  },
  {
    q: "How do I find the selling price for a target margin?",
    a: "Divide the cost by (1 − margin). To earn a 25% margin on something that costs $120, charge $120 ÷ 0.75 = $160. Enter the cost and the margin, and the calculator works out the revenue and profit.",
  },
  {
    q: "Why can't the margin be 100% or more?",
    a: "A margin is profit as a share of revenue, and profit can never be larger than revenue unless the cost is zero or negative. A 100% margin would mean selling something that cost nothing, so the calculator only handles margins below 100%.",
  },
  {
    q: "What is buying stock on margin?",
    a: "It means borrowing part of the purchase price from your broker. The margin requirement is the share you must put up yourself. With a 30% requirement, buying 100 shares at $18.30 ($1,830) needs at least $549 of your own money.",
  },
  {
    q: "What is a margin call?",
    a: "If the value of the securities in a margin account falls, your equity can drop below the broker's maintenance margin. The broker then asks you to deposit more money or sell holdings, and it can sell them for you if you don't. Losses on margin can exceed the money you put in.",
  },
  {
    q: "How does currency margin work?",
    a: "Forex brokers let you control a large position with a small deposit. A 20:1 margin ratio means you need 1/20 of the position's value. Buying 100 units at an exchange rate of 1.3 is worth 130 in your home currency, so you need 130 ÷ 20 = 6.5.",
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

export default function MarginCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this margin calculator works out profit margin
          and markup from any two of cost, revenue, margin, and profit, plus the money needed to buy stocks or currency on
          margin.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Profit Margin and Markup</h2>
        <p style={pStyle}>
          In business, margin usually means profit margin: how much of each dollar of revenue is left over after the cost
          of the product. Markup measures the same profit against the cost instead.
        </p>
        <div style={formulaStyle}>
          Profit = Revenue − Cost
          <br />
          Margin = Profit ÷ Revenue × 100%
          <br />
          Markup = Profit ÷ Cost × 100%
        </div>
        <p style={pStyle}>
          Companies track several kinds of profit margin, depending on which costs are subtracted:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Gross margin</strong>: revenue minus the direct cost of goods sold.</li>
          <li style={liStyle}><strong>Operating margin</strong>: also subtracts operating expenses such as wages, rent, and marketing.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Net margin</strong>: what's left after every expense, including interest and taxes.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Buying Stocks on Margin</h2>
        <p style={pStyle}>
          A margin account lets you borrow from your broker to buy securities, using the securities as collateral. The
          initial margin requirement is the portion of the purchase you must pay with your own money. In the U.S.,
          Regulation T sets it at 50% for most stocks, and brokers can require more.
        </p>
        <div style={formulaStyle}>Amount required = Stock price × Number of shares × Margin requirement</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Margin magnifies both gains and losses. If the account's value falls below the maintenance margin, the broker
          will issue a margin call, and you may have to add money or sell at a loss.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Currency Exchange Margin</h2>
        <p style={pStyle}>
          Foreign exchange trading usually uses much higher leverage. The margin ratio says how many times your deposit
          the position can be: at 50:1, a $1,000 deposit controls $50,000 of currency.
        </p>
        <div style={formulaStyle}>Amount required = Exchange rate × Units ÷ Margin ratio</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The exchange rate is the price of one unit of the currency you're buying, in your home currency. If 1 EUR costs
          1.22 USD and your home currency is USD, the exchange rate is 1.22.
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
