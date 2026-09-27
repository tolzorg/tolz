import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between \"Fixed length\" and \"Fixed payment\"?",
    a: "Fixed length solves for how much you can withdraw each period so the fund runs out exactly at the end of a term you choose. Fixed payment works the other way: you choose the withdrawal amount, and the calculator tells you how long that amount can be sustained, or whether it never runs out at all.",
  },
  {
    q: "What does \"you can withdraw this amount forever\" mean?",
    a: "It shows up on the Fixed Payment tab whenever the chosen withdrawal amount doesn't exceed the interest the balance earns each period. In that case the principal is never touched, so the fund can support that withdrawal indefinitely, and there's no payoff length, total, or schedule to show.",
  },
  {
    q: "Why is there no Annuity Balances schedule for a short payout period?",
    a: "The year-by-year schedule and chart only appear once the payout period is longer than 2 years. For a shorter term, the calculator still shows the withdrawal amount and totals, just without the extra table and chart.",
  },
  {
    q: "Can the starting principal or payout amount be negative?",
    a: "No. Unlike this site's accumulation-phase Annuity Calculator, a negative starting principal or a negative payout amount is rejected here, since a payout calculation only makes sense against real money going in and real, non-negative withdrawals coming out. The growth rate itself can still be negative, which models a balance that loses value over time.",
  },
  {
    q: "Is this the same as the Annuity Calculator?",
    a: "No, they're opposite halves of the same lifecycle. The Annuity Calculator covers the accumulation phase, growing a starting balance plus contributions into a future amount. This calculator covers the payout (decumulation) phase, taking an existing balance and calculating how it depletes as it's withdrawn.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or transmitted for storage, the calculation happens on the page, and no signup or personal information is required to use it.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
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

export default function AnnuityPayoutCalculatorFaqSection() {
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
          Once an annuity (or any lump sum meant to fund retirement) has finished growing, the next question
          is how to draw it down without running out too soon, or leaving too much unspent. This annuity
          payout calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, answers that from
          either direction: tell it how many years you want the money to last and it solves for the
          withdrawal amount, or tell it the withdrawal amount you want and it solves for how long the fund
          will last.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accumulation vs. Payout</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          An annuity's life generally has two phases. During accumulation, money is deposited, either as a
          lump sum or as a series of contributions, and it compounds and grows (that phase is covered by this
          site's own <Link to="/calculators/financial/annuity-calculator" className="inline-home-link">Annuity Calculator</Link>).
          Once accumulation ends, the payout (or distribution) phase begins: the insurance company or account
          holder starts paying the balance back out, either over a specific length of time or as a specific
          payment amount, until the fund is exhausted, or in some cases, not exhausted at all. This calculator
          covers that second, payout phase.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed Length vs. Fixed Payment</h2>
        <p style={pStyle}>
          <strong>Fixed length</strong> (also called a fixed-period or period-certain payout) starts from a
          chosen number of years and solves for the periodic withdrawal that exactly exhausts the balance by
          the end of that period. This is the more common starting point when there's a specific time horizon
          in mind, for example, planning payouts to last until a certain retirement milestone.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Fixed payment</strong> works in the opposite direction: it starts from a chosen withdrawal
          amount and solves for how long that amount can be sustained. If the chosen amount is small enough
          that it never exceeds the interest the balance earns each period, the fund never runs out at all,
          and the calculator reports that directly instead of a payoff length.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter the starting principal (the balance available at the start of the payout phase) and an
          expected interest/return rate. On the Fixed Length tab, add how many years you want the payments to
          last; the calculator returns the periodic withdrawal amount. On the Fixed Payment tab, add the
          withdrawal amount instead; the calculator returns how long it will last. Either way, choose how
          often payments are made (annually, semiannually, quarterly, monthly, semimonthly, or biweekly), and
          for any payout period longer than 2 years, a full year-by-year schedule and chart are shown
          alongside the summary totals.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The results always include the total number of payments, the total amount withdrawn over the whole
          payout period, and how much of that total came from interest/return versus the original principal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use This Calculator</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning a retirement income stream.</strong> Given a known retirement balance, solving
            for a payout amount over a target number of years turns a lump sum into a concrete monthly income
            figure.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Checking whether a withdrawal rate is sustainable.</strong> Solving for length instead
            shows whether a desired withdrawal amount will outlast, exactly match, or fall short of a given
            time horizon, or whether it can be sustained indefinitely.
          </li>
          <li>
            <strong>Comparing payout frequencies.</strong> Since payments can be made annually, monthly, or
            on several other schedules, running the same balance through each frequency shows how the payout
            amount and total interest/return shift with each choice.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This annuity payout calculator is completely free, with no account creation, email address, or
          payment required to use it. All calculations run directly based on the numbers you enter, and none
          of your financial figures are stored, logged, or shared, you can close the page and nothing you
          entered persists anywhere.
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
