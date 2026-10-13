import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a monthly car lease payment calculated?",
    a: "It has three parts. Depreciation is the net capitalized cost (price minus down payment and trade-in) minus the residual value, divided by the number of months. The interest, or rent charge, is the net capitalized cost plus the residual value, multiplied by the money factor. Sales tax is then applied to the sum of the two. Add all three for the monthly payment.",
  },
  {
    q: "What is a money factor, and how do I convert it to an APR?",
    a: "The money factor is the lease's interest rate written as a small decimal. Multiply it by 2,400 to get the equivalent APR, or divide an APR by 2,400 to get the money factor. A money factor of 0.00208 is about a 4.99% APR. You can switch the calculator between Money Factor and Interest Rate and it converts the number for you.",
  },
  {
    q: "What does the Monthly Payment tab do?",
    a: "It works backward. Enter the monthly lease payment you want, along with the other terms, and the calculator finds the vehicle price that payment supports.",
  },
  {
    q: "What is residual value?",
    a: "It's the leasing company's estimate of what the car will be worth when the lease ends, and usually the price you can buy it for at that point. The lessor sets it, not the dealer. A higher residual means less depreciation to pay for, so cars that hold their value tend to lease for less.",
  },
  {
    q: "How is sales tax handled on a lease?",
    a: "Most states tax lease payments rather than the full price of the car, so the calculator adds tax to each monthly payment and charges tax on the down payment up front. The trade-in isn't taxed. Some states tax leases differently, so check your state's rules.",
  },
  {
    q: "What does \"Total Cost to Own After Lease Ends\" mean?",
    a: "It's what you'd pay in total if you leased the car and then bought it at the residual value when the lease ended: the down payment, trade-in, upfront tax, every lease payment, and the residual value plus tax. It sits next to the cost of buying the same car with a loan so you can compare the two.",
  },
  {
    q: "Does the calculator include lease fees?",
    a: "No. Acquisition fees, security deposits, disposition fees, and documentation, title, and registration fees aren't included. If an acquisition fee is rolled into the lease, you can add it to the auto price to see its effect.",
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

export default function AutoLeaseCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this auto lease calculator works out a car's
          monthly lease payment from its price, or the price a target payment can afford, and shows what the same car would
          cost if you bought it with a loan instead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Auto Lease Calculator</h2>
        <p style={pStyle}>
          Use the <strong>Total Price</strong> tab when you know the car's price and want the monthly payment. Use the{" "}
          <strong>Monthly Payment</strong> tab when you know the payment you can afford and want the vehicle price it
          supports. Then fill in:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Auto Price</strong> (the capitalized cost): the negotiated price of the car. Negotiate it the same way
            you would if you were buying.
          </li>
          <li style={liStyle}>
            <strong>Lease Term</strong>: the length of the lease in months, usually 24 to 48.
          </li>
          <li style={liStyle}>
            <strong>Money Factor or Interest Rate</strong>: pick whichever your lease quote uses. Switching between them
            converts the number for you (APR = money factor × 2,400).
          </li>
          <li style={liStyle}>
            <strong>Down Payment and Trade-in Value</strong>: both reduce the amount you're financing.
          </li>
          <li style={liStyle}>
            <strong>Sales Tax</strong>: your state and local rate.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Residual Value</strong>: what the lessor expects the car to be worth when the lease ends.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Monthly Lease Payment Is Calculated</h2>
        <p style={pStyle}>
          Take a car with an agreed price of $50,000, leased for 36 months. The lessor sets a residual value of $25,000
          and an APR of 6%. You put $8,000 down, trade in a car worth $5,000, and your sales tax rate is 6%.
        </p>
        <p style={pStyle}>First, subtract the down payment and trade-in to get the net capitalized cost:</p>
        <div style={formulaStyle}>$50,000 − $8,000 − $5,000 = $37,000</div>
        <p style={pStyle}>Subtract the residual value, then spread that depreciation over the term:</p>
        <div style={formulaStyle}>($37,000 − $25,000) ÷ 36 = $333.33</div>
        <p style={pStyle}>Convert the APR to a money factor:</p>
        <div style={formulaStyle}>6% ÷ 2,400 = 0.0025</div>
        <p style={pStyle}>Add the net capitalized cost and the residual value, then multiply by the money factor to get the monthly interest:</p>
        <div style={formulaStyle}>($37,000 + $25,000) × 0.0025 = $155.00</div>
        <p style={pStyle}>Apply the sales tax to the depreciation and interest:</p>
        <div style={formulaStyle}>($333.33 + $155.00) × 6% = $29.30</div>
        <p style={pStyle}>Add the three parts for the monthly payment:</p>
        <div style={formulaStyle}>$333.33 + $155.00 + $29.30 = $517.63</div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Leasing vs. Buying</h2>
        <p style={pStyle}>
          Below the lease results, the calculator shows the same car bought with a loan at the same rate and term. Leasing
          usually means a smaller upfront payment and a lower monthly payment, which is why it appeals to people who want a
          new car every few years or who use the car for business. Buying builds equity, has no mileage limits, and lets
          you modify or sell the car whenever you like.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Leases also come with conditions: an annual mileage cap (often 10,000 to 15,000 miles, with a per-mile charge
          for going over), charges for excess wear and tear, and fees such as acquisition and disposition fees. If you
          want out early, the usual options are returning the car and paying an early termination fee, transferring the
          lease to someone else, or buying the car out.
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
