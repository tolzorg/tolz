import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between \"beginning\" and \"end\" of period?",
    a: "It's the difference between an annuity due and an ordinary (immediate) annuity. \"Beginning\" means each addition is credited before that period's growth is applied, so it earns a return for the whole period it's added in. \"End\" means growth is applied first and the addition is credited afterward, so it doesn't start earning anything until the next period. Over many years the gap compounds into a real difference in the final balance, even though the addition amounts are identical.",
  },
  {
    q: "Can I use an annual addition and a monthly addition at the same time?",
    a: "Yes. The two are independent and both accumulate on the same schedule, so you can model a lump sum added once a year (a bonus or tax refund, for example) alongside a smaller recurring monthly contribution, and the calculator will grow both together.",
  },
  {
    q: "Why is there no accumulation schedule for a 1-year term?",
    a: "The year-by-year and month-by-month breakdown only appears once the term is longer than a single year. At exactly one year there's only one full period to show, so the calculator displays the summary results without a schedule table or chart.",
  },
  {
    q: "Can the starting principal, additions, or growth rate be negative?",
    a: "Yes, and the calculator computes with them literally rather than rejecting them. A negative addition behaves like a scheduled withdrawal, and a negative growth rate models a balance that shrinks over time (for example, an annuity being drawn down faster than it grows). Only the number of years is restricted, since a term of zero, a negative length, or an unreasonably long one isn't a meaningful input.",
  },
  {
    q: "Is this the same as an annuity payout calculator?",
    a: "No. This tool covers the accumulation phase only, growing a starting principal plus contributions into a future balance. It doesn't calculate the fixed payments an insurance company would pay out from an existing annuity contract; that's a separate, payout-phase calculation.",
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

export default function AnnuityCalculatorFaqSection() {
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
          An annuity is usually built up over years before it ever pays out a cent, and figuring out what a
          starting balance plus regular contributions will actually be worth later isn't something most
          people want to do by hand. This annuity calculator, free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, projects how a starting principal plus an
          annual addition, a monthly addition, or both together will grow at a given rate over time, and
          shows a full year-by-year and month-by-month breakdown of exactly how it got there.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Annuity?</h2>
        <p style={pStyle}>
          In everyday use, an annuity is a contract, typically sold by an insurance company, that pays out a
          stream of income over time in exchange for money paid in earlier, either as a single lump sum or as
          a series of contributions. Most people buy them as a supplement to other retirement savings, since
          the payout can be structured to last for a fixed number of years or for the rest of the owner's
          life. Before any of that payout math matters, though, an annuity has to grow, and that growth phase
          is what this calculator models.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Annuities generally come in two families: fixed annuities, which pay a rate set largely by
          market interest rates at the time the contract is signed and guarantee the return of principal, and
          variable annuities, which invest the funds (commonly in mutual funds) and can gain or lose value
          based on how those investments perform. A third category, indexed annuities, sits in between, tying
          part of the return to a market index while still guaranteeing a minimum. Whichever type you're
          modeling, it reduces to the same inputs this calculator asks for: a starting amount, a growth rate,
          contributions, and a length of time.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Annuity Due vs. Ordinary Annuity</h2>
        <p style={pStyle}>
          Every contribution has to land somewhere within its period, either at the very start or the very
          end, and which one it is changes how much time that money has to grow. An <strong>annuity due</strong>
          {" "}credits each addition at the beginning of its period, so it earns a return immediately. An{" "}
          <strong>ordinary annuity</strong> (also called an immediate annuity in this context) credits the
          addition at the end of the period instead, after that period's growth has already been applied, so
          the money doesn't start earning anything until the following period.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The difference sounds small for a single contribution but compounds meaningfully over a long
          holding period, since a beginning-of-period contribution effectively gets one extra period of
          growth compared to the same contribution timed at the end. This calculator lets you switch between
          the two so you can see exactly how much that timing is worth for your own numbers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Enter a starting principal, this can be zero if you're starting from scratch. Add an annual
          addition, a monthly addition, or both if you plan to contribute on more than one schedule at once.
          Choose whether those additions are credited at the beginning or end of each period, enter an
          expected annual growth rate, and set how many years the annuity will accumulate for. The calculator
          returns the projected end balance immediately, split into how much came from the starting
          principal, how much came from contributions, and how much came from growth.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For any term longer than a single year, a full accumulation schedule is also shown, toggleable
          between an annual and a monthly view, along with a chart breaking down the balance's composition
          year by year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use an Annuity Calculator</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Evaluating an annuity contract you're considering.</strong> Before committing money to an
            insurance company's annuity product, running the numbers on the accumulation phase shows whether
            the quoted rate actually gets you to the balance you'd expect by the time you plan to annuitize.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing lump-sum vs. contribution-based funding.</strong> Some annuities are funded
            with a single deposit, others are built up with regular payments over many years. Entering both
            an annual and a monthly addition alongside a starting principal makes it easy to compare either
            approach, or a mix of the two.
          </li>
          <li>
            <strong>Planning retirement income alongside other accounts.</strong> If an annuity is one piece
            of a broader retirement plan that also includes an IRA, a 401(k), or other savings, projecting
            its growth on its own terms makes it easier to see how it fits alongside those other balances.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This annuity calculator is completely free, with no account creation, email address, or payment
          required to use it. All calculations run directly based on the numbers you enter, and none of your
          financial figures are stored, logged, or shared, you can close the page and nothing you entered
          persists anywhere.
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
