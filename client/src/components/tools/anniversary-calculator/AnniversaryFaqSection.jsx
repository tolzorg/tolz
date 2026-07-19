import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does an anniversary calculator work?",
    a: "It calculates the exact time elapsed between two dates, typically a starting date, like a wedding or first date, and today's date (or another date you choose), and breaks the result down into years, months, weeks, and days.",
  },
  {
    q: "Is the Anniversary Calculator on Tolz free to use?",
    a: "Yes. The tool is completely free, with no hidden fees, subscriptions, or usage limits.",
  },
  {
    q: "Do I need to sign up or create an account to use it?",
    a: "No. There's no signup or registration required. You can use the calculator directly on the page as many times as you need.",
  },
  {
    q: "Can I calculate a future anniversary instead of today's date?",
    a: "Yes. You can set the comparison date to any future date to see exactly how many days, weeks, or months remain until that anniversary.",
  },
  {
    q: "Does the calculator account for leap years?",
    a: "Yes. The calculation uses precise calendar logic, so leap years and varying month lengths are automatically accounted for, giving you an accurate result rather than a rough estimate.",
  },
  {
    q: "Can this tool be used for anniversaries other than weddings?",
    a: "Yes. It works for any date-based milestone, including dating anniversaries, engagements, work anniversaries, business founding dates, and personal milestones like sobriety or move-in dates.",
  },
  {
    q: "How do I find out what anniversary gift matches my year?",
    a: "Once you know your exact anniversary year from the calculator, you can match it against traditional or modern anniversary gift-by-year lists, which assign a material or theme to each year (e.g., paper for year 1, silver for year 25, gold for year 50).",
  },
  {
    q: "Is my data safe when I use this calculator?",
    a: "Yes. The tool only processes the dates you enter to generate your result, no personal data is stored or shared, and no account is required.",
  },
];

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
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)",
        }}>
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

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const olStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

export default function AnniversaryFaqSection() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every relationship carries a date worth remembering, a wedding, a first date, an engagement, or even
          a work milestone, and keeping accurate track of how much time has passed can be surprisingly tricky
          once you're counting across multiple years, leap years, and varying month lengths. The Anniversary
          Calculator on <Link to="/" className="inline-home-link">Tolz</Link> removes the guesswork entirely. Simply enter the original date, and the tool
          instantly tells you exactly how many years, months, weeks, and days have passed, along with how many
          days remain until your next anniversary. It's built for anyone who wants a fast, reliable, and
          completely free way to calculate anniversary dates without doing manual math or relying on a
          physical calendar.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Anniversary Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          An anniversary calculator is a date-difference tool that measures the exact time elapsed between a
          starting date, such as a wedding day, first date, or engagement, and the current date, or any future
          date you specify. Rather than manually subtracting years and adjusting for varying month lengths and
          leap years, the calculator processes the math instantly and returns a precise, error-free breakdown.
          Most versions of this tool also calculate the countdown to your next upcoming anniversary, which is
          useful for planning celebrations, gifts, or reminders in advance. Unlike a basic date subtraction you
          might do in your head, an accurate anniversary calculator accounts for calendar irregularities
          automatically, which matters more than most people expect, a rough mental estimate can easily be off
          by several days when leap years or 31-day months are involved.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Use This Tool</h2>
        <p style={pStyle}>
          There are several everyday situations where an anniversary calculator becomes genuinely useful
          rather than just a novelty:
        </p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning a milestone celebration.</strong> If you're approaching a significant
            anniversary, a 10th, 25th, or 50th, knowing the exact date and countdown helps you book venues,
            order gifts, or plan surprises with enough lead time.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Settling a friendly debate.</strong> Couples often disagree on exactly how long they've
            been together, especially when the relationship spans an engagement period, a long-distance
            stretch, or a pause and restart. A calculator gives an objective, indisputable answer.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Writing a card, speech, or social media post.</strong> People frequently want to mention a
            precise duration, "6 years, 3 months, and 12 days", for anniversary posts, toasts, or personalized
            gifts like engraved jewelry, which often require the exact date.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Tracking a non-romantic milestone.</strong> Anniversaries aren't limited to couples. Work
            anniversaries, business founding dates, sobriety milestones, and homeownership dates are all
            commonly tracked using the same date-difference logic.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Gift and tradition research.</strong> Traditional and modern anniversary gift themes are
            tied to specific years (paper for the first, silver for the twenty-fifth, gold for the fiftieth),
            so knowing the exact year number matters when shopping for a themed gift.
          </li>
          <li>
            <strong>Reminder setting.</strong> Some people use the tool simply to confirm how many days remain
            before an important date, so they don't forget to make plans in time.
          </li>
        </ul>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Anniversary Calculator</h2>
        <p style={pStyle}>Using the tool takes a few seconds:</p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter the starting date</strong>, this could be a wedding date, the day you started
            dating, an engagement date, a hire date, or any other date you want to measure from.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Select the comparison date</strong>, by default, this is today's date, but many users
            choose a future date to see how far away a specific anniversary is.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Review the results</strong>, the calculator displays the elapsed time broken down into
            years, months, weeks, and days, along with a running day count and the date of the next upcoming
            anniversary.
          </li>
          <li>
            <strong>Recalculate anytime</strong>, because the tool is free and requires no signup, you can
            return and re-check the count as often as you like, whether for a different couple, a different
            milestone, or a quick recheck closer to the date.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          No installation, account creation, or payment is involved at any step, the entire process happens
          directly in the browser.
        </p>
      </div>

      {/* Types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Anniversaries You Can Track</h2>
        <p style={pStyle}>
          While "wedding anniversary" is the most commonly searched use case, the same date-calculation logic
          applies to many other milestones people track regularly:
        </p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 6 }}>
            <strong>Wedding anniversaries</strong>, the most popular use, often searched alongside gift-by-year
            traditions.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Dating anniversaries</strong>, tracking the exact day a relationship began, especially
            popular among couples who didn't formally announce a start date.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Engagement anniversaries</strong>, separate from the wedding date, and often celebrated
            independently.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Work anniversaries</strong>, used by employees and HR teams to track tenure milestones.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Business anniversaries</strong>, companies tracking years since founding for marketing or
            internal recognition.
          </li>
          <li>
            <strong>Personal milestones</strong>, sobriety dates, move-in dates, adoption dates, or any other
            date someone wants to measure against the present.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          The calculator doesn't require you to specify which type of anniversary you're tracking, it simply
          measures the time between two dates, which makes it flexible enough for any of these scenarios.
        </p>
      </div>

      {/* Milestones */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Anniversary Milestones and What They Mean</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Certain anniversary years carry cultural significance, particularly for weddings, and knowing the
          exact year number (not just an approximate "a few years") is often the reason people use a
          calculator in the first place. Traditional Western wedding anniversary themes assign a material or
          symbol to specific years, paper for the 1st, cotton for the 2nd, leather for the 3rd, wood for the
          5th, tin for the 10th, silver for the 25th, pearl for the 30th, ruby for the 40th, and gold for the
          50th. Modern gift lists have evolved alongside these traditions, often substituting more practical or
          personalized gift ideas. Because these milestone names are tied to a specific year number rather than
          a rounded estimate, an exact calculation matters, someone in year 24 and someone in year 25 are in
          very different gift-shopping situations, even though both might casually say "about 25 years."
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy You Can Rely On</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Date calculations seem simple until leap years, differing month lengths, and time zones are factored
          in. A manual estimate, counting years in your head and rounding the months, is prone to small errors
          that compound over long relationships. The Anniversary Calculator performs the calculation using
          precise calendar logic, which means leap years are automatically accounted for and every month
          length is calculated correctly rather than assumed to be a flat 30 days. This is particularly
          important for people who want to state an exact figure, for a speech, a card, or an engraved gift,
          where "close enough" isn't good enough.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy & Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The Anniversary Calculator on Tolz is completely free to use, with no hidden charges, subscription
          requirements, or usage limits. No signup or account creation is needed, you can open the page and
          start calculating immediately. The tool does not require you to submit any personal or sensitive
          information beyond the dates you choose to enter, and those dates are processed only to generate your
          result; nothing is stored or shared. This makes it a straightforward, low-friction option for anyone
          who wants a quick, private answer without creating an account or handing over personal details just
          to check a date.
        </p>
      </div>

      {/* Making the most */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Making the Most of Your Result</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once you have your exact anniversary breakdown, a few practical next steps are worth considering. If
          a milestone year is approaching, use the countdown figure to set a reminder well in advance rather
          than waiting until the final week. If you're shopping for a themed gift, cross-reference the exact
          year number against traditional or modern anniversary gift lists to find a fitting idea. And if the
          result is for a card, toast, or social post, using the precise year/month/day breakdown, rather than
          a rounded number, tends to feel more personal and thoughtful than a generic "X years" statement.
        </p>
      </div>

      {/* FAQ */}
      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 6 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
