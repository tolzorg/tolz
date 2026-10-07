import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the calculator compare the three accounts?",
    a: "It takes the same pre-tax money and tracks it three ways. A Traditional, SIMPLE, or SEP IRA invests all of it and is taxed at your retirement tax rate when you withdraw. A Roth IRA invests what's left after paying today's tax but grows tax-free. A regular taxable account also starts after tax and pays tax on its earnings every year.",
  },
  {
    q: "Which is better, a Traditional IRA or a Roth IRA?",
    a: "It mostly comes down to your tax rate now versus in retirement. If you expect a lower rate in retirement, a Traditional IRA usually ends up ahead after tax; if you expect a higher rate, a Roth usually wins; if the rates are equal, they come out the same. With the defaults (25% now, 15% in retirement) the Traditional IRA ends about $106,634 ahead.",
  },
  {
    q: "Why does a regular taxable account fall behind?",
    a: "It pays tax on its earnings every year, so less money stays invested to compound. Both kinds of IRA shelter the growth from yearly tax, which is why they accumulate more over long periods.",
  },
  {
    q: "What are SEP and SIMPLE IRAs?",
    a: "SEP IRAs are funded by employers, often small businesses or the self-employed, with a 2026 limit of the lesser of 25% of pay or $72,000. SIMPLE IRAs are for businesses with 100 or fewer employees, with a 2026 employee limit of $17,000 plus catch-up amounts. Both are taxed like a Traditional IRA, which is why the calculator groups them together.",
  },
  {
    q: "When can I withdraw from an IRA without penalty?",
    a: "Generally after age 59½. Earlier withdrawals usually face a 10% penalty on top of income tax (25% for SIMPLE IRAs in their first two years), with some exceptions. Traditional IRAs require minimum distributions from age 73; Roth IRAs have none during the owner's lifetime.",
  },
  {
    q: "Does the calculator apply contribution limits?",
    a: "No. It uses the before-tax amount you enter every year, contributed at the end of each year, so you can model any plan, including SEP and SIMPLE IRAs with their higher limits.",
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

export default function IraCalculatorFaqSection() {
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
          This IRA calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, compares how the same
          savings grow in a Traditional, SIMPLE, or SEP IRA, a Roth IRA, and a regular taxable account, before and after
          tax, so you can see which account leaves you the most money at retirement.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter your current balance, how much you'll contribute each year before tax, your expected return, your
          current and retirement ages, your current marginal tax rate, and the tax rate you expect in retirement. Click{" "}
          <strong>Calculate</strong> to see each account's balance at retirement before and after tax, a growth graph,
          and a full annual schedule. Any field left blank uses the example value shown in it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an IRA?</h2>
        <p style={pStyle}>
          An individual retirement account (IRA) is a U.S. retirement plan with tax advantages, set out in IRS
          Publication 590, meant to encourage saving for retirement. The two most common are Traditional and Roth IRAs.
          Traditional IRA contributions are usually tax-deductible, but withdrawals in retirement are taxed. Roth IRA
          contributions aren't deductible, but qualified withdrawals are tax-free.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most people earn less in retirement than while working, so their tax rate is often lower then, which can make
          a Traditional IRA the better deal. Either type usually beats a regular taxable account because the
          investment growth is sheltered from yearly tax.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of IRAs</h2>
        <p style={pStyle}>
          <strong>Traditional IRA:</strong> contributions are usually deductible and grow tax-deferred; withdrawals are
          taxed as income. Withdrawals are penalty-free after 59½, and required minimum distributions start at 73.
        </p>
        <p style={pStyle}>
          <strong>Roth IRA:</strong> funded with after-tax money; growth and qualified withdrawals are tax-free, and
          there are no required distributions during the owner's lifetime. For a deeper look, use
          the <Link to="/calculators/financial/roth-ira-calculator" className="inline-home-link">Roth IRA Calculator</Link>.
        </p>
        <p style={pStyle}>
          <strong>SEP IRA:</strong> set up by employers, mainly small businesses and the self-employed, and taxed like a
          Traditional IRA. The 2026 limit is the lesser of 25% of compensation or $72,000, contributions vest
          immediately, and there's no catch-up for those 50 and older.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>SIMPLE IRA:</strong> for businesses with 100 or fewer employees, with lower costs than a 401(k).
          Employers either match up to 3% of pay or contribute a flat 2%. The 2026 employee limit is $17,000, plus
          $4,000 at 50+ or $5,250 at ages 60–63. Early withdrawals in the first two years carry a 25% penalty.
          Compare employer plans with the <Link to="/calculators/financial/401k-calculator" className="inline-home-link">401(k) Calculator</Link>.
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
