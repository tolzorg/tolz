import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does the rental property calculator show?",
    a: "It projects a rental property year by year: income after vacancy and management, mortgage payments, operating expenses, cash flow, cash-on-cash return, equity, and what you would receive and earn (IRR) if you sold at the end of each year. In the default example, a $200,000 property bought with 20% down and rented for $2,000 a month returns 18.42% a year (IRR) over 20 years.",
  },
  {
    q: "How is the IRR calculated?",
    a: "IRR is the yearly rate that makes the present value of every cash flow zero: the cash you invest at the start (down payment, closing and repair costs), each year's cash flow, and the sale proceeds after the cost to sell and the remaining loan balance.",
  },
  {
    q: "What is the cap rate?",
    a: "The capitalization rate is the first year's net operating income divided by the purchase price. Net operating income is rental income after vacancy and management fees minus operating expenses, before mortgage payments. In the default example, $16,100 of NOI on a $200,000 price is a cap rate of 8.05%.",
  },
  {
    q: "What is cash-on-cash return?",
    a: "Cash-on-cash return (cash flow return on investment) divides cash flow by the cash you invested. The yearly table shows each year's cash flow return; the total shows the overall profit, including the sale, as a percentage of the money you put in.",
  },
  {
    q: "What do the 50%, 1%, and 70% rules mean?",
    a: "The 50% rule estimates operating expenses, excluding the mortgage, at about half of rental income. The 1% rule says monthly rent should be at least 1% of the purchase price after repairs. The 70% rule, for house flipping, says to pay less than 70% of the after-repair value minus repair costs.",
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

export default function RentalPropertyCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this rental property calculator projects the
          returns of a rental investment over your holding period, including IRR, total profit, cash-on-cash return, cap
          rate, yearly cash flow, equity, and what you would receive if you sold at the end of any year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rental Property Investments</h2>
        <p style={pStyle}>
          A rental property investment means buying real estate, then holding, leasing, and eventually selling it. It can
          be a single unit, a duplex, a single-family home, an apartment complex, a retail plaza, an office, or even an
          industrial property. Larger commercial properties are harder to analyze, and older properties usually need more
          maintenance and repairs.
        </p>
        <p style={pStyle}>
          Rental properties need a lot of capital, depend on cash flow, and are hard to sell quickly. Compared with stocks,
          they are usually more stable, offer tax benefits, and tend to hedge against inflation.
        </p>
        <h3 style={h3Style}>Income</h3>
        <p style={pStyle}>
          Rental properties earn regular cash flow from tenants&apos; rent, usually monthly, plus a possible profit from
          appreciation when the property is sold. Unlike rent, a sale pays out once, in one large sum.
        </p>
        <h3 style={h3Style}>Responsibilities</h3>
        <p style={pStyle}>Owning a rental is not passive income. The landlord&apos;s work includes:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Tenant management</strong>: finding and screening tenants, writing leases, collecting rent, and evicting when necessary.</li>
          <li style={liStyle}><strong>Property maintenance</strong>: repairs, upkeep, and renovations.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Administration</strong>: paperwork, setting rent, taxes, staff, and budgeting.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Many owners hire a property management company instead, typically for about 10% of rental income. Enter that
          percentage as the management fee.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>General Guidelines</h2>
        <p style={pStyle}>
          These rules of thumb are quick starting points, not a replacement for real financial analysis or advice from real
          estate professionals. Every market is different.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>50% rule</strong>: operating expenses, excluding mortgage principal and interest, come to about 50% of income. The other half is left to pay the mortgage.</li>
          <li style={liStyle}><strong>1% rule</strong>: gross monthly rent should be at least 1% of the purchase price after repairs. Some investors aim for 2% or even 3%.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>70% rule</strong>: when flipping distressed property, pay less than 70% of the after-repair value (ARV) minus repair costs.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Internal Rate of Return</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The internal rate of return (IRR), or annualized total return, is the yearly rate earned on each dollar for as long
          as it is invested. It is the standard way to compare investments: the higher the IRR, the better. It is arguably
          the most important measure of a rental&apos;s profitability, because the cap rate is too basic and cash-on-cash
          return ignores the time value of money. See also
          the {link("/calculators/financial/average-return-calculator", "Average Return Calculator")} and
          the {link("/calculators/financial/investment-calculator", "Investment Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Capitalization Rate</h2>
        <p style={pStyle}>
          The capitalization (cap) rate is net operating income (NOI) divided by the property&apos;s price or current market
          value:
        </p>
        <p style={{ ...pStyle, textAlign: "center", fontWeight: 700, color: "var(--text-primary)" }}>Cap rate = Net Operating Income ÷ Price</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It is the best quick way to compare investment properties, and a property&apos;s past cap rates can hint at how it
          may perform in the future. When NOI is hard to measure, a discounted cash flow analysis can be more accurate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cash Flow Return on Investment</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With a loan, cash flow needs close attention: unsustainable negative cash flow is a common reason rental
          investments fail. Cash flow return on investment (CFROI), also called cash-on-cash return, shows the gain or loss
          from ongoing cash flow relative to the cash invested. A healthy rental usually shows a rising CFROI each year, as
          the mortgage payment stays fixed while rent rises. See
          the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")} to explore the loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Things to Keep in Mind</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Higher IRR, CFROI, and cap rates are generally better, but real investments rarely go exactly as calculated.
          Assumptions stretched over decades can bring surprises. A recession can cut a property&apos;s value, while a new
          shopping center nearby can raise it, and rising maintenance costs or vacancy rates change the numbers too. Rent can
          swing from year to year, so projecting today&apos;s rent decades ahead may not be realistic. Appreciation is
          included, but inflation is not, which can distort large long-term figures.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Types of Real Estate Investments</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>REITs</strong>: Real Estate Investment Trusts pool investors&apos; money into a collection of properties or real estate debt. They can be private, publicly traded, or public non-traded, and give passive real estate exposure alongside stocks and bonds.</li>
          <li style={liStyle}><strong>Buy and sell</strong>: buying property, often improving it, and selling it for a profit within a short time, with little or no renting. With houses, this is called flipping, and it takes deep market knowledge.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Wholesaling</strong>: finding a deal, putting it under contract, and selling the contract to another buyer without ever owning the property.</li>
        </ul>
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
