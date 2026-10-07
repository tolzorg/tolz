import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the calculator compare a Roth IRA with a taxable account?",
    a: "Both accounts start with the same balance and get the same yearly contributions at the same return. The Roth IRA grows tax-free, while the taxable account pays your marginal tax rate on each year's earnings. With the defaults ($30,000 now, $7,500 a year, 6%, ages 30 to 65, 25% tax) the Roth IRA ends at $1,066,343 versus $751,245, about $315,000 more.",
  },
  {
    q: "What are the 2026 Roth IRA contribution limits?",
    a: "$7,500 a year if you're under 50 and $8,600 if you're 50 or older. If you enter more than the limit for your current age, the calculator uses the limit instead and tells you so. Choosing \"Maximize contributions\" applies the right limit for each year, switching to the higher one from age 50.",
  },
  {
    q: "Who can contribute to a Roth IRA?",
    a: "You need earned income (wages, tips, bonuses, or self-employment income) in the year you contribute. For 2026, eligibility ends above a modified adjusted gross income of $168,000 for single and head-of-household filers and $252,000 for married couples filing jointly.",
  },
  {
    q: "When can I withdraw money from a Roth IRA?",
    a: "Your contributions can be withdrawn tax-free and penalty-free at any time. Earnings are tax-free and penalty-free once you're 59½ and the account is at least five years old; earlier withdrawals of earnings may owe tax and a penalty unless an exception applies, such as disability or up to $10,000 for a first home.",
  },
  {
    q: "Do Roth IRAs have required minimum distributions?",
    a: "No. Unlike traditional IRAs and 401(k)s, Roth IRAs have no required minimum distributions during the owner's lifetime, so the money can keep growing tax-free for as long as you like.",
  },
  {
    q: "When are contributions added?",
    a: "Each year's contribution is added at the end of that year, so it starts earning a return the following year. The Annual Schedule shows the start and end balance of the principal, the Roth IRA, and the taxable account for every year until retirement.",
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

export default function RothIraCalculatorFaqSection() {
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
          This Roth IRA calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, projects how much a
          Roth IRA could grow by retirement and compares it with the same savings in a regular taxable account, showing
          exactly how much the Roth's tax-free growth is worth to you, year by year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter your current Roth IRA balance and how much you'll contribute each year, or choose{" "}
          <strong>Maximize contributions</strong> to use the IRS limit every year. Add your expected annual return,
          your current and retirement ages, and your combined federal and state marginal tax rate. Click{" "}
          <strong>Calculate</strong> to see both accounts' balances at retirement, a growth graph, and a full annual
          schedule. Any field left blank uses the example value shown in it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Roth IRA?</h2>
        <p style={pStyle}>
          A Roth IRA is an individual retirement arrangement that offers tax-free growth and tax-free income in
          retirement. Unlike a traditional IRA, contributions aren't tax-deductible, but your contributions (not
          earnings) can be withdrawn tax-free at any time without penalty. It was created by the Taxpayer Relief Act of
          1997 and named after Senator William Roth.
        </p>
        <ul style={listStyle}>
          <li>Contributions are made with after-tax dollars. Lower- and middle-income savers may qualify for the Saver's Credit on the first $2,000 contributed.</li>
          <li>The 2026 limit is $7,500 under age 50 and $8,600 at 50 and over. Contributions for a tax year can be made until the tax filing deadline the following April.</li>
          <li>Eligibility phases out above a modified AGI of $168,000 (single or head of household) or $252,000 (married filing jointly) for 2026.</li>
          <li>There are no required minimum distributions during the owner's lifetime.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pros and Cons of a Roth IRA</h2>
        <p style={pStyle}>
          <strong>Pros:</strong> contributions can be withdrawn any time without tax or penalty, which also makes the
          account a backup emergency fund; retirement withdrawals are tax-free; there's a wide choice of investments; it
          isn't reported as an asset on the FAFSA; heirs inherit it tax-free; and tax-free withdrawals help you manage
          your tax bracket in retirement.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Cons:</strong> you pay tax up front; the contribution limit is far below a 401(k)'s ($24,500 for 2026);
          high earners can't contribute directly; contributions don't reduce taxable income; earnings need a five-year
          holding period to come out tax-free; and it's less efficient for money you plan to leave to charity. Compare
          other options with the <Link to="/calculators/financial/401k-calculator" className="inline-home-link">401(k) Calculator</Link> and
          the <Link to="/calculators/financial/retirement-calculator" className="inline-home-link">Retirement Calculator</Link>.
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
