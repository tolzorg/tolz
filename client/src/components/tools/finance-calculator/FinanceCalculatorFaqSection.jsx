import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What do N, I/Y, PV, PMT, and FV actually mean?",
    a: "These are the five variables of the time-value-of-money equation used by financial calculators like the BA II Plus or HP 12C. N is the number of periods, I/Y is the nominal annual interest rate, PV is the present value (a lump sum at the start), PMT is a fixed payment made every period, and FV is the future value (a lump sum at the end). Given any four, the calculator solves for whichever one you leave out.",
  },
  {
    q: "Why do some results show a negative sign, like \"$-9,455.36\"?",
    a: "This calculator follows the same cash-flow sign convention as a physical financial calculator: money moving in one direction is entered as positive, money moving in the opposite direction comes out negative, and everything is solved so the present value, the payments, and the future value balance out to zero. It isn't an error, it's what lets the same formula handle deposits, loans, withdrawals, and investments all with one equation. If a result's sign looks backward for what you're modeling, try flipping the sign on PMT or PV and recalculating.",
  },
  {
    q: "What's the difference between N and the number of years?",
    a: "N is the number of periods, not years. If payments happen monthly, 10 years of monthly payments is N = 120, not N = 10. The P/Y and C/Y settings only affect how the interest rate is converted for each period, they don't multiply N for you.",
  },
  {
    q: "What are P/Y and C/Y, and when do I need to change them?",
    a: "P/Y is how many payment periods occur per year, and C/Y is how many times interest compounds per year. By default both are 1 (annual payments, annual compounding). If you're modeling monthly payments, set P/Y to 12. If interest compounds monthly but you only pay quarterly (or any other mismatched combination), set C/Y and P/Y independently, the calculator converts between them automatically using the standard effective-rate method, so the payment-period rate is always correct even when the two frequencies differ.",
  },
  {
    q: "What's the difference between payments at the \"beginning\" and \"end\" of each period?",
    a: "This is the classic annuity-due versus ordinary-annuity distinction. \"End of period\" (the default) means each payment happens after that period's interest has already accrued, common for loan payments made in arrears. \"Beginning of period\" means the payment happens first and then earns (or pays) interest for the rest of that period, common for rent, insurance premiums, or contributions made at the start of a pay cycle. Switching this setting changes the result even with every other field identical.",
  },
  {
    q: "Why is my computed N or I/Y a decimal instead of a whole number?",
    a: "Real-world numbers rarely divide evenly. If it takes 9.604 periods to reach a target future value, that's the mathematically exact answer, not a rounding artifact. The schedule below the result reflects this too: its final row is a partial period sized to exactly close out the balance, rather than a full period.",
  },
  {
    q: "Can I/Y come out negative?",
    a: "Yes, and it's a legitimate answer, not an error. If a present value, a stream of payments, and a target future value only balance out when the investment loses value over time, the calculator will return a negative interest rate rather than forcing a result that doesn't fit the numbers you entered.",
  },
  {
    q: "Is this the same as a loan or investment calculator?",
    a: "It's the general-purpose version behind both. A loan payment, a savings goal, a lease payment, and a bond's present value are all the same underlying equation with different variables filled in and different signs assigned. If you're specifically financing a loan or projecting a savings goal, dedicated tools like this site's Loan Calculator or Investment Calculator walk through those scenarios with labels suited to that use case, this calculator is the flexible, five-key version for everything else.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Every calculation runs directly in your browser. Nothing you enter is transmitted anywhere or stored, and no signup or personal information is required to use it.",
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

export default function FinanceCalculatorFaqSection() {
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
          Most financial questions, what a loan payment will be, how long it takes to hit a savings goal,
          what rate of return a deal actually implies, boil down to the same five numbers. This finance
          calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, works the same way as
          a 5-key time-value-of-money calculator like the BA II Plus or HP 12C: enter any four of N, I/Y,
          PV, PMT, and FV, and it solves for whichever one is missing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Five Variables Behind Every TVM Calculation</h2>
        <p style={pStyle}>
          <strong>N</strong> is the total number of periods, not years, if payments are monthly, a 5-year
          plan is N = 60. <strong>I/Y</strong> is the nominal annual interest rate. <strong>PV</strong> is
          the present value, a lump sum you have (or owe) right now. <strong>PMT</strong> is a fixed
          payment made every single period. <strong>FV</strong> is the future value, a lump sum at the end
          of the term. Every one of these five tabs solves the same underlying equation, it just treats a
          different variable as the unknown.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two additional settings refine how the rate itself is applied: <strong>P/Y</strong> (payment
          periods per year) and <strong>C/Y</strong> (compounding periods per year), plus whether PMT lands
          at the <strong>beginning</strong> or <strong>end</strong> of each period. Left at their defaults
          (1, 1, end), the calculator behaves like a simple annual annuity; changed, it correctly handles
          monthly payments against annual compounding, biweekly payments, mid-period contributions, and
          every other real-world mismatch between how often you pay and how often interest actually
          compounds.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding the Sign Convention</h2>
        <p style={pStyle}>
          The results here sometimes carry a minus sign that can look like a mistake at first, a positive
          $20,000 present value paired with a $-9,455.36 future value, for example. This is deliberate: the
          calculator treats cash moving in one direction as positive and cash moving in the other direction
          as negative, then solves so all of it, the starting lump sum, every periodic payment, and the
          ending lump sum, nets to zero. That's what allows one equation to describe a loan, a savings plan,
          an investment, or a bond redemption without needing a separate calculator for each.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In practice this means the sign you enter for PMT or PV determines what scenario you're modeling.
          Withdrawing money from an account you already funded, for instance, means PV is positive (money
          you have) and PMT is negative (money leaving the account each period). If a result's sign doesn't
          match the real-world situation you're picturing, try flipping the sign on one of your inputs
          rather than assuming the calculator is wrong.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          Pick the tab for whichever value you're solving for, FV, PMT, I/Y, N, or PV, that field disappears
          from the input list since it's the one being calculated. Fill in the remaining four, open{" "}
          <strong>+ Settings</strong> if payments and compounding don't both happen once a year or you need
          to switch payment timing, and click <strong>Calculate</strong>. The result appears immediately,
          along with the total of every periodic payment, the total interest involved, a chart showing how
          PV, FV, cumulative payments, and accumulated interest move period by period, and a full
          period-by-period schedule table underneath.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A fractional result, N = 8.617 rather than a clean whole number, for example, isn't rounding
          error, real payoff points and savings targets rarely land on an exact period boundary. The
          schedule's final row reflects this directly: instead of a full period, it's a partial one sized
          to close the balance out exactly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When Each Tab Is Useful</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>FV</strong> — Project what a lump sum plus recurring payments will grow to (or shrink
            to, if you're withdrawing) by a future date.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>PMT</strong> — Find the fixed payment needed each period to move from a known present
            value to a known future value, the same math behind a loan payment or an annuity payout.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>I/Y</strong> — Back into the interest rate implied by a deal when you already know the
            starting amount, the payments, and the ending amount, useful for comparing whether a financing
            offer is actually competitive.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>N</strong> — Find out how many periods it will take to reach a savings goal or pay off a
            balance at a fixed payment amount.
          </li>
          <li>
            <strong>PV</strong> — Find out what a future payment or lump sum is worth today, the basis for
            pricing a bond or valuing a stream of future payments.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This finance calculator is completely free, with no account, email address, or payment required.
          Every calculation runs directly in your browser, nothing you enter is stored, logged, or
          transmitted anywhere, so it's safe to test real numbers from your own accounts without leaving a
          record tied to your identity.
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
