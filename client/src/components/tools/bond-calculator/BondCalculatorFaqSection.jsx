import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a bond's price calculated?",
    a: "A bond's price is the present value of its future cash flows: every coupon payment plus the face value at maturity, each discounted at the yield. For a $1,000 bond with a 5% coupon paid semiannually, 10 years to maturity, and a 6% yield, that's 20 payments of $25 discounted at 3% per period plus $1,000 at the end, for a price of $925.61.",
  },
  {
    q: "Why does a bond's price fall when yields rise?",
    a: "The coupon payments are fixed, so the only way a bond can offer a higher yield is to cost less. When the yield is above the coupon rate the bond trades below face value (at a discount); when it's below, the bond trades above face value (at a premium).",
  },
  {
    q: "What's the difference between the clean price and the dirty price?",
    a: "The clean price excludes accrued interest and is how bond prices are usually quoted. The dirty (invoice) price adds the interest accrued since the last coupon payment and is what the buyer actually pays: dirty price = clean price + accrued interest.",
  },
  {
    q: "Which day-count convention should I use?",
    a: "Use the convention in the bond's terms. U.S. corporate and municipal bonds commonly use 30/360, U.S. Treasuries use Actual/Actual, and money-market instruments often use Actual/360 or Actual/365. The convention changes how many days of interest have accrued and how long the coupon period is.",
  },
  {
    q: "Why does the first calculator need a whole number of periods?",
    a: "It assumes the bond is traded on a coupon date, so the time to maturity must be an exact number of coupon periods; for example 2.5 years works for semiannual coupons but not annual ones. For a bond traded between coupon dates, use the bond pricing calculator with actual dates.",
  },
  {
    q: "Can the yield be negative?",
    a: "Yes. If the price is higher than the total of all remaining coupons plus the face value, the buyer loses money by holding to maturity, which shows up as a negative yield.",
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
const formulaStyle = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)",
  background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: "10px 14px", margin: "0 0 10px",
};
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

export default function BondCalculatorFaqSection() {
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
          This bond calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, has two parts. The first
          solves for any one of a fixed-rate coupon bond's price, face value, yield, time to maturity, or coupon when
          the bond trades on a coupon date. The second prices a bond traded between coupon dates, giving the dirty
          price, clean price, accrued interest, and days accrued under four common day-count conventions. Neither
          accounts for other factors that move real bond prices, such as credit quality or supply and demand.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          <strong>Bond calculator:</strong> fill in four of the five fields and leave the one you want blank, then
          click <strong>Calculate</strong>. The annual coupon can be a percent of face value or a dollar amount; switching
          the unit converts the value you entered.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Bond pricing calculator:</strong> enter the face value, yield, coupon and frequency, the maturity
          and settlement dates, and the bond's day-count convention, then click <strong>Calculate</strong>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Bond?</h2>
        <p style={pStyle}>
          A bond is a fixed-income investment: a loan from an investor to a borrower such as a corporation or a
          government. The bond sets out the loan's terms and the payments the bondholder will receive. Common types
          include government, municipal, corporate, and high-yield (junk) bonds. Bonds are generally lower-risk than
          stocks, but the risk and return vary widely with the issuer's creditworthiness and the bond's term.
        </p>
        <ul style={listStyle}>
          <li><strong>Face value</strong> (par value): the amount repaid at maturity, and the basis for coupon payments.</li>
          <li><strong>Maturity date</strong>: when the principal is repaid; time to maturity is what remains until then.</li>
          <li><strong>Coupon rate</strong>: the annual interest rate paid on face value; these calculators assume a fixed rate.</li>
          <li><strong>Coupon frequency</strong>: how often interest is paid: annually, semiannually, quarterly, or monthly.</li>
          <li><strong>Yield</strong>: the annual return expected if the bond is held to maturity.</li>
          <li><strong>Price</strong>: what the bond trades for in the market.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bond Price Formula</h2>
        <p style={formulaStyle}>Price = C × [1 − (1 + r)<sup>−N</sup>] ÷ r + F ÷ (1 + r)<sup>N</sup></p>
        <ul style={listStyle}>
          <li>C = coupon payment per period</li>
          <li>N = number of periods until maturity</li>
          <li>r = yield per period</li>
          <li>F = face value</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Example: a $1,000 bond with a 5% coupon paid semiannually, 10 years to maturity, and a 6% yield has
          C = $25, N = 20, and r = 3%, giving a price of $925.61.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Clean Price, Dirty Price, and Accrued Interest</h2>
        <p style={pStyle}>
          Most bonds trade between coupon dates. The seller has earned interest since the last coupon but won't
          receive it, so the buyer pays it on top of the quoted price. <strong>Accrued interest</strong> = coupon payment
          × days since the last coupon ÷ days in the coupon period, with days counted by the bond's day-count
          convention.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The <strong>clean price</strong> leaves accrued interest out, so bonds can be compared on an equal footing; it's
          the price usually quoted. The <strong>dirty price</strong> (invoice price) is what actually changes hands:
          dirty price = clean price + accrued interest. For related calculations, see
          the <Link to="/calculators/financial/investment-calculator" className="inline-home-link">Investment Calculator</Link> and
          the <Link to="/calculators/financial/interest-calculator" className="inline-home-link">Interest Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your figures are stored, logged, or shared.
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
