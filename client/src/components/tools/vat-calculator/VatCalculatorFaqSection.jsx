import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate VAT?",
    a: "Multiply the net price by the VAT rate to get the tax, then add it to the net price for the gross price. At 20% VAT, a net price of 1,200 has 240 of VAT and a gross price of 1,440.",
  },
  {
    q: "How do I remove VAT from a gross price?",
    a: "Divide the gross price by 1 plus the VAT rate. At 20%, a gross price of 1,440 ÷ 1.2 = 1,200 net, so the VAT included was 240. Subtracting 20% of the gross price would give the wrong answer, because the VAT was charged on the net price.",
  },
  {
    q: "Which two values do I need?",
    a: "Any two of the VAT rate, net price, gross price, and tax amount. If you fill in more than two, the calculator uses the first matching pair in this order: rate and net price, rate and gross price, rate and tax amount, net and gross price, net price and tax amount, then gross price and tax amount.",
  },
  {
    q: "What is the difference between VAT and sales tax?",
    a: "Sales tax is charged once, when the final consumer buys. VAT is charged at every stage of the supply chain on the value added at that stage, and each business deducts the VAT it already paid, so there's no tax on tax. VAT makes evasion harder but costs more to administer.",
  },
  {
    q: "Is GST the same as VAT?",
    a: "GST (goods and services tax) is the name some countries, such as Australia and Canada, use for their VAT. The terms are often used interchangeably, though the details differ by country, and no country has both.",
  },
  {
    q: "Is my information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };

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

export default function VatCalculatorFaqSection() {
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
          This VAT calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, works out the missing
          values from any two of the VAT rate, net price, gross price, and tax amount, so you can add VAT to a price,
          remove it from a VAT-inclusive price, or find the rate that was charged.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is VAT?</h2>
        <p style={pStyle}>
          VAT (value-added tax) is an indirect consumption tax charged on the value added to goods and services at each
          stage of the supply chain: production, wholesale, distribution, and retail. It's the world's most common
          consumption tax, used in more than 160 countries and accounting for roughly a fifth of tax revenue
          worldwide. EU member states must apply at least a minimum VAT rate; the United States is the only developed
          country without a VAT.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Details vary by country: which goods are taxed or exempt, reduced rates for items such as books or food,
          whether imports and exports are taxed, and how filing and payment work. Some countries call it GST (goods
          and services tax).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How VAT Works: A Simple Example</h2>
        <p style={pStyle}>Take coffee sold in a café, with a 10% VAT at every stage:</p>
        <ul style={listStyle}>
          <li>A roaster buys beans from a farmer for $5.00 plus $0.50 VAT. The farmer passes the $0.50 to the government.</li>
          <li>The roaster sells roasted beans to the café for $10.00 plus $1.00 VAT, and pays the government only $0.50: the $1.00 collected minus the $0.50 already paid.</li>
          <li>The café sells five cups for $20.00 plus $2.00 VAT and pays $1.00: the $2.00 collected minus the $1.00 already paid.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In total the government receives $2.00, exactly 10% of the final $20.00 price, collected bit by bit along the
          chain with no tax charged on tax. A U.S.-style sales tax would collect the same $2.00 once, at the final sale.
          For that, use the <Link to="/calculators/financial/sales-tax-calculator" className="inline-home-link">Sales Tax Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and nothing you enter is stored, logged, or shared.
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
