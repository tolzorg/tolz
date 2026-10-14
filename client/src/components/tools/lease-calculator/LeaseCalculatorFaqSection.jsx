import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a lease payment calculated?",
    a: "The monthly payment pays off the asset's value minus the present value of its residual value, with interest: payment = (asset value − residual ÷ (1 + i)^n) × i ÷ (1 − (1 + i)^−n), where i is the monthly rate. A $20,000 asset with an $8,000 residual over 3 years at 6% costs $405.06 a month.",
  },
  {
    q: "How do I find the interest rate of a lease?",
    a: "Use the Fixed Pay tab: enter the asset value, residual value, term, and monthly payment, and the calculator solves for the rate. A $20,000 asset with an $8,000 residual and $400 a month for 3 years works out to about 5.58%.",
  },
  {
    q: "What is residual value?",
    a: "Residual value, sometimes called salvage value, is what the asset is expected to be worth when the lease ends. A $30,000 car leased for 3 years might have a $16,000 residual. The higher the residual, the lower the monthly payment, because you only pay for the value you use.",
  },
  {
    q: "What does it mean if the rate is negative?",
    a: "If the monthly payments don't even add up to the asset value minus the residual, the lessor would lose money, so the implied interest rate is negative. The calculator tells you instead of showing a rate.",
  },
  {
    q: "What's the difference between a lease and rent?",
    a: "A lease is the contract itself; rent is the periodic payment for using the asset. In neither case do you build equity in what you're leasing or renting.",
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

export default function LeaseCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this lease calculator works out the monthly payment
          of a lease from the asset value, residual value, term, and interest rate, or, with the Fixed Pay tab, the interest
          rate implied by a given monthly payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What is a Lease?</h2>
        <p style={pStyle}>
          A lease is a contract between a lessor (the asset&apos;s legal owner) and a lessee (who wants to use it). The lessee
          gets the right to use the asset for a set term in return for regular payments. Living spaces, offices, and cars are
          the most familiar examples, but almost anything that can be owned can be leased, from software and servers to
          aircraft and cleaning equipment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          &quot;Lease&quot; and &quot;rent&quot; are often used interchangeably, but a lease is the contract itself, while rent is the
          periodic payment. Neither builds equity in the asset.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Residual Value</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Residual (salvage) value is an estimate of what the asset will be worth when the lease ends, most often used for car
          leases. For most assets, the longer the lease, the lower the residual value; real estate is an exception, since it
          may appreciate. See the {link("/calculators/financial/depreciation-calculator", "Depreciation Calculator")} for more
          on how assets lose value.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Leasing a Car</h2>
        <p style={pStyle}>
          Leasing lets you drive a new car for a short term, usually under warranty, without the cost of buying it, though it
          generally costs more than owning the car over its life. Monthly payments mainly depend on the difference between the
          car&apos;s price (capitalized cost) and its residual value. Car leases often quote a money factor instead of an interest
          rate; multiply it by 2,400 to get the approximate APR.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Leasing is also different from renting a car: leases run for years and come from dealerships, while rentals last days
          or weeks. For a full car lease breakdown with taxes and fees, use
          the {link("/calculators/financial/auto-lease-calculator", "Auto Lease Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business Leasing</h2>
        <p style={pStyle}>
          Businesses lease machinery, equipment, and buildings to use expensive assets while paying only a fraction of the
          cost upfront, which especially helps new businesses. Operating lease payments are also usually tax-deductible as a
          business expense.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Capital lease</strong>: treated like a purchase and shown as an asset on the balance sheet, so it can be depreciated. Used for long-term leases.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Operating lease</strong>: the lessee isn&apos;t the owner, and payments are an operating expense. Used for shorter terms or assets that become obsolete quickly.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Leasing Real Estate</h2>
        <p style={pStyle}>
          Residential leases are most often 12 months; lease-to-own agreements add an option to buy the home later at an
          agreed price. Commercial leases are usually stricter and longer, and come in several forms:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Gross lease</strong>: the tenant pays a flat rent and the landlord covers most expenses, such as property tax, insurance, and maintenance.</li>
          <li style={liStyle}><strong>Net leases</strong>: lower base rent, with the tenant paying some expenses: property tax (N), plus insurance (NN), plus common area maintenance (NNN, the most common).</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Modified leases</strong>: a negotiated middle ground between gross and net leases.</li>
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
