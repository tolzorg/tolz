import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between the two calculators on this page?",
    a: "The first one is for when you know your original loan amount, original term, and how much term is left, good for a loan you've never made extra payments on. The second is for when you only know your current statement's unpaid balance, interest rate, and monthly payment, useful if you don't have (or don't trust) the original loan paperwork, or the loan has already been modified.",
  },
  {
    q: "What does \"Payback altogether\" actually calculate?",
    a: "It calculates your current lump-sum payoff amount, the exact balance a lender would require to close out the loan completely today, treating it like a single payment rather than a stream of future ones. That figure is the true present-day payoff quote a bank would give you, not just the original loan amount minus what you've paid so far.",
  },
  {
    q: "How does adding extra payments actually save on interest?",
    a: "Every extra dollar goes straight to principal rather than interest, since the required monthly interest for that period is already covered by the regular payment. A smaller principal balance means less interest accrues the following month, which compounds over the life of the loan, shortening it and reducing the total interest paid, often by a surprisingly large margin relative to the extra amount contributed.",
  },
  {
    q: "How is biweekly repayment different from just paying extra monthly?",
    a: "Biweekly repayment means paying half your normal monthly payment every two weeks instead of the full payment once a month. Since a year has 52 weeks, that works out to 26 half-payments, the equivalent of 13 full monthly payments a year instead of 12. That extra, roughly one month's payment a year, is what accelerates the payoff, without ever feeling like a separate large payment.",
  },
  {
    q: "Is a one-time extra payment worth it compared to spreading it out monthly?",
    a: "A one-time payment applied immediately saves more interest per dollar than the same amount spread out over future months, since it starts reducing the balance (and the interest that balance generates) right away rather than gradually. That said, a recurring monthly or annual extra payment adds up on its own over time, so the better choice usually comes down to whether the money is available now or only in smaller amounts going forward.",
  },
  {
    q: "Why does paying off a mortgage early save money if the interest rate is fixed?",
    a: "A fixed rate sets the percentage charged each period, not the total amount of interest paid, that depends on how long the balance stays outstanding. Interest is calculated on whatever principal remains, so shortening the loan's life by paying down principal faster directly reduces how much interest accrues in total, even though the rate itself never changes.",
  },
  {
    q: "Are there any downsides to paying off a mortgage faster?",
    a: "Extra payments reduce liquidity, since that money is no longer available for other uses like an emergency fund, a higher-return investment, or a higher-interest debt that might be worth paying down first. Some loans also carry prepayment penalties, though these are uncommon on standard modern mortgages. It's worth confirming a loan allows penalty-free extra payments before committing to a payoff plan.",
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

export default function MortgagePayoffFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this mortgage payoff calculator helps
          evaluate how adding extra payments or switching to biweekly payments can save on interest and shorten a
          mortgage's remaining term, or shows exactly what it costs to pay a loan off in full today.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How a Typical Mortgage Payment Breaks Down</h2>
        <p style={pStyle}>
          A typical loan repayment consists of two parts, the principal and the interest. The principal is the
          amount originally borrowed, while the interest is the lender's charge for borrowing that money,
          calculated as a percentage of the outstanding balance. Each payment covers that period's interest
          first, with whatever remains going toward principal.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Since a larger outstanding balance requires a larger interest charge, early payments put a bigger
          share toward interest and a smaller share toward principal. As the balance declines, that ratio
          flips, so later payments send more toward principal and less toward interest, even though the payment
          amount itself stays the same on a standard fixed loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Strategies for Paying Off a Mortgage Early</h2>
        <p style={pStyle}>
          <strong>Extra payments.</strong> Additional payments made on top of the regular scheduled payment,
          whether as a one-time lump sum, a recurring monthly amount, or an annual contribution. Even a modest
          extra amount can meaningfully shorten a loan and cut the total interest paid, since every extra
          dollar reduces the principal balance that future interest is calculated on.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Biweekly payments.</strong> Paying half the regular mortgage payment every two weeks instead
          of the full payment once a month. With 52 weeks in a year, this works out to 26 half-payments, the
          equivalent of 13 full monthly payments, one extra month of payments every year. It's a natural fit
          for anyone paid every two weeks, since a portion of each paycheck can go straight toward the mortgage
          without it ever feeling like a separate, larger payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          If the remaining term of the loan is known, use the first calculator: enter the original loan amount,
          original term, interest rate, and how much term is left, then choose a repayment option. If the
          remaining term isn't known, use the second calculator instead with the unpaid principal balance,
          interest rate, and monthly payment found on a mortgage statement.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Either way, four repayment options are available (three on the second calculator): pay the loan off
          entirely right now, add extra payments on top of the regular schedule, switch to biweekly payments,
          or simply continue the normal schedule with no changes, useful as a baseline to compare the other
          options against.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This mortgage payoff calculator is completely free, with no account, email address, or payment
          required. Every calculation runs directly in your browser, nothing you enter is stored, logged, or
          transmitted anywhere, so it's safe to test real numbers from your own mortgage statement without
          leaving a record tied to your identity.
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
