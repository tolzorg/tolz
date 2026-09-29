import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a financial calculator used for?",
    a: "It solves time-value-of-money problems, future value, present value, payment amounts, interest rates, or number of periods, for loans, savings, investments, and cash flow analysis, by using any four known values to find the fifth.",
  },
  {
    q: "What does \"time value of money\" actually mean?",
    a: "It's the idea that a dollar today is worth more than a dollar promised in the future, because money you have now can be invested, spent, or used to pay off debt right away.",
  },
  {
    q: "What's the difference between present value and future value?",
    a: "Present value is what a future amount of money is worth today, discounted at a given rate. Future value is what a current amount grows into after a set period at a given rate. Same math, opposite direction.",
  },
  {
    q: "What is PMT and when do I need it?",
    a: "PMT is a recurring payment or cash flow, think rental income, a mortgage payment, or a monthly contribution to savings. You need it any time you're dealing with a repeating amount instead of a single lump sum.",
  },
  {
    q: "Does it matter if payments happen at the beginning or end of a period?",
    a: "Yes. A payment at the beginning of a period earns interest for one extra period compared to one at the end, which changes your final future value or payment amount, sometimes significantly over a long term.",
  },
  {
    q: "Can this replace a BA II Plus or HP 12C?",
    a: "For standard TVM calculations, yes, it uses the same five-variable methodology (FV, PV, PMT, I/Y, N). It's a solid backup or alternative when you don't have a physical calculator handy.",
  },
  {
    q: "How do I solve for interest rate instead of payment?",
    a: "Enter your known values for future value, present value, payment, and number of periods, and leave interest rate blank. The calculator works out the rate that makes those numbers consistent.",
  },
  {
    q: "Does it account for compounding interest?",
    a: "Yes, it applies proper compounding across your entered number of periods rather than a flat estimate, which matters a lot for anything longer than a year or two.",
  },
  {
    q: "Is my financial data stored?",
    a: "No. Your inputs are used only to calculate your result and aren't stored or logged.",
  },
  {
    q: "Why does my calculated payment not match what my lender quoted me?",
    a: "Usually it's a rate-to-period mismatch, extra fees the lender folded into the payment, or rounding. Make sure your rate is converted to match your payment frequency before comparing.",
  },
  {
    q: "Can I use this for retirement planning?",
    a: "Yes. Solve for future value to see how your contributions grow over time, or solve for payment to figure out what you need to contribute regularly to hit a specific number by a target date.",
  },
  {
    q: "Why do financial calculators matter for finance classes?",
    a: "Professors expect students to understand the underlying TVM concepts, not to grind through exponential formulas by hand every time. Financial calculators are standard tools in finance coursework and are typically allowed on exams for exactly that reason.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "What is a financial calculator used for?",
    a: "It solves time-value-of-money problems — future value, present value, payment amounts, interest rates, or number of periods — for loans, savings, investments, and cash flow analysis, by using any four known values to find the fifth.",
  },
  {
    q: "What is PMT and when do I need it?",
    a: "PMT is a recurring payment or cash flow, such as rental income, a mortgage payment, or a monthly contribution to savings. It's needed any time you're dealing with a repeating amount instead of a single lump sum.",
  },
  {
    q: "Is this financial calculator free?",
    a: "Yes, it's completely free with no signup required and no hidden charges.",
  },
  {
    q: "Can this replace a BA II Plus or HP 12C?",
    a: "For standard time-value-of-money calculations, yes — it uses the same five-variable methodology (FV, PV, PMT, I/Y, N), making it a solid backup or alternative when a physical calculator isn't on hand.",
  },
  {
    q: "Is my financial data stored?",
    a: "No. Inputs are used only to calculate the result and are not stored or logged.",
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
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
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
          If you've ever tried to figure out what a loan is really going to cost you, or wondered how much a
          monthly savings habit will turn into down the road, you've run into what finance people call the
          "time value of money." This financial calculator, part of the free tool lineup on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, works exactly like a 5-key TVM calculator,
          the same kind of logic you'd find on a BA II Plus or HP 12C. You plug in four of the five values
          (future value, present value, payment, interest rate, or number of periods), leave the one you're
          trying to find blank, and it does the math for you. No app to download, no account to make, just
          numbers in and an answer out.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Financial Calculator, and Why Does "Time Value of Money" Matter?</h2>
        <p style={pStyle}>
          Let's start with the idea that this whole calculator is built around, because once it clicks,
          everything else makes sense.
        </p>
        <p style={pStyle}>
          Say somebody owes you $500. Would you rather get it all right now, or spread out over the next
          year in four payments? Most people would take the money now, and there's a good reason for that,
          money in your hand today can actually do something for you. You could invest it, throw it at a
          loan you're carrying, or just stick it in a savings account where it starts earning interest.
          Money you're promised later can't do any of that until it actually shows up. That gap in
          usefulness is what "time value of money" is really describing: a dollar today is worth more than
          a dollar you're told you'll get next year, even if it's technically the same dollar amount.
        </p>
        <p style={pStyle}>
          This is exactly why interest exists in the first place. When you put money in a savings account,
          the bank pays you a little something for letting them hold onto it and use it. The longer you
          commit that money, or the more you're willing to lock it away, generally the more the bank is
          willing to pay you for the privilege.
        </p>
        <p style={pStyle}>
          Here's the math version of that idea. Let's say you put $100 into a savings account paying 10%
          interest a year. After one year, you'd have $110, your original $100 (that's the present value,
          or PV) plus $10 in interest. That $110 is the future value (FV) of $100 sitting for a year at
          10%. Put another way, $100 right now and $110 a year from now are worth the same thing, as long
          as we're using a 10% rate.
        </p>
        <p style={pStyle}>
          The formula behind that is simple: whatever you invest grows by (1 + interest rate) for each
          period. In this case, that's 1 + 0.10 = 1.10, so $100 becomes $100 × 1.10 = $110.
        </p>
        <p style={pStyle}>
          Now leave that money in the account for a second year, still at 10%. You'd earn another $11 in
          interest, not $10, and that's the important part. Why $11 and not $10? Because you're now earning
          interest on the whole $110 balance, not just your original $100. So after year two:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
          $110 + $11 = $121
        </p>
        <p style={pStyle}>
          That $121 is the future value of your original $100 after two years at 10%. And present value
          works the same way in reverse, a discount rate applied backward. If someone tells you they'll pay
          you $121 in two years and the discount rate is 10%, that promise is worth $100 to you today.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you break that $121 down, it's actually made up of four separate pieces: your original $100
          principal, the $10 you earned in year one, the $10 you earned in year two, and one extra dollar,
          interest earned on the interest from year one ($10 × 0.10 = $1). That last dollar is compounding
          in action, and it's a small example, but stretch this out over 20 or 30 years and that compounding
          effect is the difference between a decent retirement account and a great one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Five Variables: FV, PV, I/Y, N, and PMT</h2>
        <p style={pStyle}>Every calculation this tool runs comes down to five pieces:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>
            <strong>Future Value (FV)</strong> — what your money grows into after a certain amount of time
            at a given rate
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Present Value (PV)</strong> — what a future amount is worth in today's dollars
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Interest Rate (I/Y)</strong> — the rate applied each period, usually stated per year
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Number of Periods (N)</strong> — how many compounding or payment periods you're dealing
            with
          </li>
          <li>
            <strong>Payment (PMT)</strong> — a recurring amount that comes in or goes out each period
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Most basic finance classes focus heavily on PV, FV, I/Y, and N, those four show up constantly.
          PMT gets added into the mix once you're dealing with anything that involves recurring cash flow
          instead of a single lump sum.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where PMT Comes In</h2>
        <p style={pStyle}>
          PMT is any amount, in or out, that repeats at a set interval. A rental property is the classic
          example, say it brings in $1,000 a month. If you're thinking about buying that property, you'd
          probably want to know what ten years of that $1,000-a-month income stream is actually worth in
          today's money before you commit your cash to it. The same idea applies if you're valuing a small
          business that throws off $100 a year in profit, or figuring out what a $30,000 down payment plus a
          $1,000 monthly mortgage payment actually costs you over the life of the loan.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Doing that math by hand gets messy fast, which is exactly why a calculator like this one exists,
          you just plug the numbers in and let it solve the PMT side of the equation. One thing people miss
          constantly: whether payments happen at the beginning or the end of each period actually changes
          the answer. A payment made at the start of the month has an extra period to earn interest compared
          to one made at the end, and over a long loan term that difference adds up to real money. Always
          double check which one applies to your situation before trusting the output.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use This Calculator: Real Scenarios</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 10 }}>
            <strong>Comparing loan offers side by side.</strong> Two lenders can quote you different rates,
            terms, and payment amounts, and it's genuinely hard to tell which one costs less overall just by
            eyeballing the numbers. Run each offer's terms through the calculator and solve for payment or
            future cost, and you'll see which one is actually cheaper instead of guessing based on the
            advertised rate.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Figuring out a savings or retirement number.</strong> If you're putting away a fixed
            amount every month, you can solve for future value to see what that turns into by retirement. Or
            flip it around, if you know your target number, solve for the payment you need to contribute
            each month to get there.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Valuing a rental property or a small business.</strong> Like the rental example above, if
            you're looking at buying something that generates recurring income, you need to know what that
            income stream is worth today, not just what it adds up to on paper.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Checking a mortgage or auto loan before you sign.</strong> Plug in the stated principal,
            rate, and term and solve for payment to see if it matches what the lender is telling you. This
            also helps you catch situations where a lower monthly payment is being achieved by stretching the
            loan term out longer, which usually means paying more in total interest.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Getting through a finance class.</strong> If you're taking corporate finance, prepping
            for the CFA or FRM, or just working through a business finance course, you're going to be doing
            PV, FV, PMT, I/Y, and N calculations constantly. Professors generally expect you to use a
            financial calculator for this stuff, the point of the class isn't proving you can grind through
            the algebra by hand, it's making sure you actually understand what these numbers mean and how
            they connect. Having a version that works on your phone means you're never stuck without it,
            whether you're in a lecture hall or doing homework on the couch.
          </li>
          <li>
            <strong>Deciding on business financing.</strong> If you're running a small business and weighing
            whether to lease equipment or finance it, or whether to offer clients a payment plan instead of
            asking for money upfront, the same five variables tell you what those choices actually cost in
            real terms.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Financial Calculator vs. BA II Plus or HP 12C</h2>
        <p style={pStyle}>
          Physical financial calculators like the BA II Plus and HP 12C get the job done, but they come with
          a learning curve of their own, specific button sequences, a small screen, and the fact that you
          actually have to have the thing with you. An online version runs the same underlying TVM math
          without any of that. You don't need to memorize keystroke order, and you're not out of luck if you
          left your calculator at home.
        </p>
        <p style={pStyle}>
          It's also worth having around even if you already own a physical one. Sometimes you just want a
          quick second check on a number, or you're somewhere without your calculator and need an answer
          fast. The math doesn't change, only how you get to it does.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing a physical calculator generally can't do that this version can: show you the numbers
          visually. Seeing a payment schedule laid out, or a graph of how a balance grows over time, makes
          it a lot easier to actually understand what's happening with your money instead of just reading a
          single number off a screen.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Is It, and What Can Throw Off Your Results</h2>
        <p style={pStyle}>
          The math itself follows standard TVM formulas and handles compounding properly across however many
          periods you enter, this isn't a rough estimate, it's the same calculation method used in
          professional finance work and coursework. That said, no calculator can fix bad inputs. If your
          interest rate or period count doesn't match reality, your answer won't either.
        </p>
        <p style={pStyle}>A few things that commonly trip people up:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Rate mismatches.</strong> If your interest rate is annual but your periods are monthly,
            you need to convert the rate first. Plugging a straight annual rate into a monthly calculation
            will throw your answer way off.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Sign conventions.</strong> Money going out (a payment you're making) and money coming in
            (a payment you're receiving) need to be treated as opposites. Mixing these up flips your answer
            in a way that's easy to miss if you're not paying attention.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Period counts that don't match payment frequency.</strong> A 5-year loan with monthly
            payments is 60 periods, not 5. This trips up more people than you'd think.
          </li>
          <li>
            <strong>Beginning vs. end-of-period payments</strong> — as mentioned above, pick the wrong one
            and your PMT or FV will be off, sometimes by a noticeable amount over a long loan.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, and Your Numbers Aren't Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator doesn't cost anything, and there's no account creation or signup step standing
          between you and using it. No hidden fees, no premium version gating the features you actually
          need. The numbers you type in, loan amounts, savings targets, whatever you're working through, are
          used to generate your result and aren't stored or logged anywhere on Tolz's end. That means you
          can run through personal financial scenarios, including ones you'd rather not have tied to your
          name anywhere, without worrying about a data trail. Nothing to download, nothing left behind once
          you close the tab.
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
