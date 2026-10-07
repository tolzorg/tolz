import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the calculator work out the ending value?",
    a: "Your balance grows each month at the fund's return minus its operating expenses. The sales charge is taken from each deposit before it's invested, and any deferred sales charge is deducted when you sell. With the defaults ($20,000 plus $1,000 a month for 5 years at 5%, a 2% sales charge and 0.5% expenses) the fund ends at $90,077.09.",
  },
  {
    q: "What is the net IRR?",
    a: "The net internal rate of return is the annual return that makes all your deposits equal to what you take out at the end, after every fee. It's the fund's real, after-cost return: in the default example, 5% gross becomes 3.844% net once the sales charge and expenses are paid.",
  },
  {
    q: "What's the difference between a front-end and a deferred sales charge?",
    a: "A front-end load (sales charge) is taken from each purchase, so less of your money gets invested. A deferred (back-end) load is charged when you sell, usually on the lower of what you put in or what the fund is worth. Funds normally charge one or the other, and no-load funds charge neither.",
  },
  {
    q: "How much do operating expenses cost over time?",
    a: "Operating expenses (the expense ratio) are charged continuously on your whole balance, so they grow as the fund grows. In the default example a 0.5% expense ratio costs $1,323.40 over 5 years. Even actively managed funds rarely exceed 2% a year, and some index funds charge 0.1% or less.",
  },
  {
    q: "When are contributions added?",
    a: "Monthly contributions are added at the end of each month and annual contributions at the end of each year, and the sales charge applies to every contribution as well as the initial investment.",
  },
  {
    q: "Why can the net return be negative?",
    a: "If the fund's return is low or negative, or the fees are high enough, you can end up with less than you put in. The chart is hidden in that case because there's no positive return to show.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
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

export default function MutualFundCalculatorFaqSection() {
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
          This mutual fund calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, estimates what a
          mutual fund investment will be worth after sales charges, deferred charges, and ongoing operating expenses,
          and shows the net internal rate of return (IRR) you actually earn once every fee is counted.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter your initial investment, any annual or monthly contributions, the fund's expected annual return
          before fees, and how long you'll hold it. Then add the fund's sales charge (front-end load), deferred sales
          charge (back-end load), and operating expenses (expense ratio), which you'll find in its prospectus. Click{" "}
          <strong>Calculate</strong> to see the ending value, net return, net IRR, and what the fees cost you. Any field
          left blank uses the example value shown in it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Mutual Fund?</h2>
        <p style={pStyle}>
          A mutual fund pools money from many investors to buy stocks, bonds, or other securities. Each investor owns
          shares representing a proportional interest in the fund's holdings. At the end of each trading day the fund
          calculates its net asset value (NAV) per share, and buy and sell orders placed that day are executed at that
          price.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Funds are grouped by what they hold (money market, bond, stock, hybrid), by management style (passive index
          funds or actively managed funds), and by structure (open-end, closed-end, unit investment trusts). They're
          popular for diversification, low minimums, simplicity, liquidity, and professional management, and are
          widely used in retirement accounts and long-term savings.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mutual Fund Fees and Expenses</h2>
        <p style={pStyle}>
          <strong>Sales charge (front-end load):</strong> taken when you buy, so it reduces the amount invested. A 5%
          load on a $20,000 investment costs $1,000, leaving $19,000 to buy shares.
        </p>
        <p style={pStyle}>
          <strong>Deferred sales charge (back-end load):</strong> taken when you sell, usually as a percentage of the
          lesser of what you invested and what the fund is worth. With a 5% charge, a $20,000 investment that grew to
          $30,000 costs $1,000; if it fell to $10,000 the charge is $500. Many funds use a contingent deferred sales
          charge (CDSC) that shrinks each year you hold the fund, often to zero.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Operating expenses (expense ratio):</strong> ongoing yearly fees, charged as a percentage of the
          fund's assets, covering management fees, distribution and service (12b-1) fees, and administration. Active
          funds usually cost more than passive index funds. Because fees compound over time, compare funds on their net
          return after costs, not just their headline return. To model growth without fund fees, try
          the <Link to="/calculators/financial/investment-calculator" className="inline-home-link">Investment Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your financial figures are stored, logged, or shared.
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
