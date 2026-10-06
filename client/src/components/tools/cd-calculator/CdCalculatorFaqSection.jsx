import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is CD interest calculated?",
    a: "The deposit grows by compound interest at the CD's rate. With the defaults ($10,000 at 5% compounded annually for 3 years) the balance is $10,000 × 1.05³ = $11,576.25, so you earn $1,576.25. The schedule spreads this over months using the equivalent monthly rate, so each year's figures still match the annual compounding exactly.",
  },
  {
    q: "What is the difference between APY and APR on a CD?",
    a: "APY (annual percentage yield) already includes compounding, so it's the actual yearly growth; choose \"annually (APY)\" when your bank quotes an APY. APR is the nominal rate before compounding; \"monthly (APR)\" compounds it 12 times a year, so 5% APR monthly equals about 5.116% APY. The calculator shows that equivalent annual rate under the results.",
  },
  {
    q: "Why does the compounding frequency matter?",
    a: "More frequent compounding adds interest to the balance sooner, so it starts earning interest of its own. Over 3 years, $10,000 at 5% grows to $11,576.25 compounded annually, $11,614.72 monthly, and $11,618.34 compounded continuously.",
  },
  {
    q: "How does the marginal tax rate change the result?",
    a: "Interest on a CD is generally taxed as ordinary income in the U.S. unless it's held in a tax-advantaged account such as an IRA. The calculator deducts the tax from each month's interest as it's earned, which also reduces future compounding. At 25%, the default CD ends at $11,160.92 instead of $11,576.25.",
  },
  {
    q: "Can I enter a term that isn't a whole number of years?",
    a: "Yes. Enter years and months separately, for example 0 years and 6 months, or 2 years and 5 months. Partial months work too: the last month earns a prorated share of the monthly rate.",
  },
  {
    q: "Are CDs insured?",
    a: "CDs from FDIC-insured banks are insured up to $250,000 per depositor, per bank, per ownership category, and credit union CDs have equivalent NCUA coverage. That makes them one of the lowest-risk places to keep savings.",
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

export default function CdCalculatorFaqSection() {
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
          This CD calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, shows how much a certificate
          of deposit will be worth at maturity and how much interest it earns along the way, with an optional tax rate
          for a more realistic after-tax figure. It includes a year-by-year and month-by-month schedule and charts of how
          the balance grows. To add regular deposits, use
          the <Link to="/calculators/financial/savings-calculator" className="inline-home-link">Savings Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter the initial deposit and the CD's interest rate, then choose how often it compounds: pick{" "}
          <strong>annually (APY)</strong> if your bank quotes an APY. Enter the term in years and months, and your
          marginal tax rate if the interest will be taxed (use 0 for an IRA or to see interest before tax). Click{" "}
          <strong>Calculate</strong> to see the end balance, total interest, and the full accumulation schedule. Any
          field left blank uses the example value shown in it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Certificate of Deposit?</h2>
        <p style={pStyle}>
          A certificate of deposit (CD) is an agreement to leave money with a bank or credit union for a fixed term in
          exchange for a set interest rate. Terms commonly run from three months to five years, and longer terms or
          larger deposits usually earn higher rates. CDs sit at the low-risk, low-return end of investing: rates are
          typically above savings and money market accounts but well below the long-run return of stocks.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator works with fixed-rate CDs. CD interest is taxable as income in the U.S. unless the CD is held
          in a tax-deferred or tax-free account such as a traditional or Roth IRA.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use CDs</h2>
        <ul style={listStyle}>
          <li>Reduce overall risk in a diversified portfolio, especially as retirement gets closer.</li>
          <li>Park money you won't need for a few years, such as savings for a home or car down payment.</li>
          <li>Plan with confidence: a fixed rate makes the final balance predictable.</li>
        </ul>
        <p style={pStyle}>
          Money in a CD is meant to stay put until maturity. Withdrawing early usually costs a penalty (liquid CDs are
          the exception), and the penalty depends on the term and the bank. At maturity, funds typically roll into a new
          CD unless you ask the bank to move them.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>CD ladder:</strong> instead of putting everything into one long-term CD, split it across several CDs
          that mature at staggered dates, for example 1, 2, 3, 4, and 5 years. Part of your money becomes available
          every year, while each maturing CD can be reinvested at the longest, usually highest-paying, term.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your financial figures are stored, logged, or shared. For other kinds of
          growth, see the <Link to="/calculators/financial/interest-calculator" className="inline-home-link">Interest Calculator</Link> or
          the <Link to="/calculators/financial/investment-calculator" className="inline-home-link">Investment Calculator</Link>.
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
