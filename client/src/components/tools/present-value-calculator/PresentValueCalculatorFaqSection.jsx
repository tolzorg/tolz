import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a present value calculator?",
    a: "It’s a tool that converts a future amount, or a series of future payments, into what they’re worth today using a discount rate and a number of periods.",
  },
  {
    q: "How do you calculate the present value?",
    a: "For a single sum, divide the future value by (1 + r)ⁿ. For equal payments, use the annuity formula, or enter the numbers into the calculator.",
  },
  {
    q: "What is the difference between present value and future value?",
    a: "PV is what a future amount is worth now. FV is what today’s money grows to after a set time at a given rate.",
  },
  {
    q: "What is the difference between an ordinary annuity and an annuity due?",
    a: "An ordinary annuity pays at the end of each period. An annuity due pays at the beginning, so its present value is higher.",
  },
  {
    q: "What’s the difference between PV and NPV?",
    a: "PV discounts future cash to today. NPV subtracts the upfront cost (and any outflows) from the present value of the inflows, and tells you whether an investment makes sense.",
  },
  {
    q: "What’s the difference between PVIF and PVIFA?",
    a: "PVIF is the discount factor for one lump sum. PVIFA is the factor for a stream of equal payments, and it’s the sum of the individual PVIFs.",
  },
  {
    q: "Can I calculate the present value of uneven payments?",
    a: "Yes, but by discounting each payment separately and adding them up, usually in a spreadsheet. The annuity formula only works for equal payments.",
  },
  {
    q: "How is salvage value treated in NPV?",
    a: "As a cash inflow in the final period, discounted like any other lump sum. Use the after-tax amount and subtract any disposal costs.",
  },
  {
    q: "What discount rate should I use?",
    a: "Use something that reflects your opportunity cost or required return, like an expected investment return, a cost of capital, or a loan rate. Test a few to see how sensitive the result is.",
  },
  {
    q: "Why does a higher discount rate lower present value?",
    a: "Because money today could earn more elsewhere, so future payments are worth less in today’s terms.",
  },
  {
    q: "Can I calculate the present value for monthly payments?",
    a: "Yes. Convert the annual rate to a monthly rate and use the total number of months as your period count.",
  },
  {
    q: "Does present value account for inflation?",
    a: "Only if your discount rate does. A nominal rate that includes expected inflation already reflects it. Otherwise, adjust with the real-rate formula.",
  },
  { q: "Is this present value calculator free?", a: "Yes." },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "How do you calculate the present value?": {
    q: "How do you calculate present value?",
    a: "For a single sum, divide the future value by (1 + r)^n. For equal payments, use the annuity formula, or enter the numbers into the calculator.",
  },
  "What’s the difference between PV and NPV?": {
    a: "PV discounts future cash to today. NPV subtracts the upfront cost and any outflows from the present value of the inflows, and tells you whether an investment makes sense.",
  },
  "Can I calculate the present value for monthly payments?": { q: "Can I calculate present value for monthly payments?" },
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => {
  const o = FAQ_SCHEMA_OVERRIDES[item.q] || {};
  return { q: straight(o.q ?? item.q), a: straight(o.a ?? item.a) };
});

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function PresentValueCalculatorFaqSection() {
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
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="How Do You Calculate the Present Value of an Annuity?">
        <P>
          An annuity is just a series of equal payments made at regular intervals, like rent, a car loan, or monthly deposits
          into a savings plan. To get its present value, you discount each payment back to today and add them up. Doing that
          one payment at a time is a pain, so there’s a shortcut formula for an ordinary annuity (payments at the end of each
          period):
        </P>
        <Formula>PV = PMT × [1 − (1 + r)⁻ⁿ] ÷ r</Formula>
        <P>PMT is the payment each period, r is the rate per period, and n is the number of periods.</P>
        <P>
          Say you’ll receive $1,000 a year for 10 years and you use a 5% discount rate. The bracketed part works out to about
          7.7217, so the present value is roughly $7,721.73. Ten payments of $1,000 add up to $10,000 on paper, but because
          you’re waiting on most of them, they’re worth about $7,700 today.
        </P>
        <P>
          If the payments land at the start of each period (an annuity due), multiply the result by (1 + r). Here that gives
          $7,721.73 × 1.05, or about $8,107.82. Same money, same rate, but each payment shows up a year earlier, so it’s worth
          more. The beginning/end option in the calculator does this for you.
        </P>
        <P>
          For a perpetuity, which is a payment that never ends, the math gets simpler: PV = PMT ÷ r. A $1,000 yearly payment
          forever at 5% is worth $20,000 today.
        </P>
      </Card>

      <Card title="How Do You Calculate the Present Value of an Annuity With Uneven Payments?">
        <P>
          The annuity shortcut only works when every payment is the same size. If the amounts change, you go back to basics:
          discount each cash flow separately, then add the results.
        </P>
        <Formula>PV = CF₁ ÷ (1 + r)¹ + CF₂ ÷ (1 + r)² + CF₃ ÷ (1 + r)³ + …</Formula>
        <P>Here’s a quick example at a 6% rate:</P>
        <List items={[
          ["Year 1:", "$1,000 → $1,000 ÷ 1.06 = $943.40"],
          ["Year 2:", "$2,000 → $2,000 ÷ 1.1236 = $1,779.99"],
          ["Year 3:", "$500 → $500 ÷ 1.1910 = $419.81"],
        ]} />
        <P>Add them up and the present value is about $3,143.20, even though the payments total $3,500.</P>
        <P>
          This calculator is built for a single future sum or equal periodic deposits. For uneven streams, a spreadsheet is the
          usual tool. One catch: Excel’s NPV function assumes the first cash flow comes at the end of the first period. If your
          first amount is happening today, add it separately instead of including it in the range, or you’ll discount it one
          period too many. If the payments fall on specific dates instead of neat intervals, XNPV handles that.
        </P>
        <P>
          If the payments grow at a steady rate, say a salary share that rises 3% a year, there’s a growing-annuity formula,
          which we’ll use further down.
        </P>
      </Card>

      <Card title="How Would Salvage Value Be Treated in a Net Present Value Calculation?">
        <P>
          Salvage value is what you expect to get when you sell or scrap an asset at the end of its useful life. In an NPV
          calculation, it’s treated as one more cash inflow, and it lands in the final period. You discount it using that last
          period’s factor, just like any other lump sum.
        </P>
        <P>
          Here’s an example. You spend $50,000 on equipment that brings in $15,000 a year for 5 years, and you expect to sell it
          for $8,000 at the end. Using a 10% discount rate:
        </P>
        <List items={[
          ["", "Present value of the $15,000 annuity: about $56,862"],
          ["", "Present value of the $8,000 salvage: $8,000 ÷ 1.6105 ≈ $4,967"],
          ["", "Total present value of inflows: about $61,829"],
          ["", "NPV = $61,829 − $50,000 ≈ $11,829"],
        ]} />
        <P>
          A few details trip people up. Use the after-tax salvage amount if selling the asset creates a taxable gain or a
          deductible loss. If you’ll have to pay to remove or dispose of the asset, that’s a cash outflow and it reduces salvage
          value, sometimes below zero. And depreciation by itself isn’t a cash flow, so it doesn’t go into the NPV. What does
          count is the tax savings depreciation creates.
        </P>
      </Card>

      <Card title="In Accounting, What Is the Difference Between FVA and PVA vs FV and PV?">
        <P>The short version is single sum versus stream of payments.</P>
        <List items={[
          ["PV and FV", "deal with one lump sum. PV is what that sum is worth today. FV is what it’ll be worth later."],
          ["PVA and FVA", "deal with an annuity, meaning a series of equal payments. PVA is what the whole stream is worth today. FVA is what it’ll be worth at the end, with every payment compounded forward."],
        ]} />
        <P>
          The FVA formula is FVA = PMT × [(1 + r)ⁿ − 1] ÷ r. If you put $1,000 a year into an account earning 5% for 10 years,
          FVA is about $12,577.89. The present value of that same stream (ordinary annuity) is $7,721.73. They’re two views of
          the same cash flows, one measured today and one measured at the end of year 10. Multiply $7,721.73 by 1.05¹⁰ and you
          land right back at $12,577.89.
        </P>
        <P>That’s the reason this tool shows present value and future value side by side.</P>
      </Card>

      <Card title="What Is the Difference Between PVIFA and PVIF?">
        <P>
          They’re the factors you’d look up in an old-school present value table, and the difference is the same
          single-versus-stream split.
        </P>
        <P>
          <strong>PVIF</strong> (present value interest factor) is for a single sum: PVIF = 1 ÷ (1 + r)ⁿ. At 6% over 5 years,
          it’s about 0.7473. Multiply a future amount by that and you’ve got its present value, so $10,000 × 0.7473 ≈ $7,473.
        </P>
        <P>
          <strong>PVIFA</strong> (present value interest factor of an annuity) is for a stream of equal payments: PVIFA = [1 −
          (1 + r)⁻ⁿ] ÷ r. At 6% over 5 years it’s about 4.2124, so a $1,000 yearly payment has a present value of roughly
          $4,212.
        </P>
        <P>
          PVIFA is really just the PVIFs for every individual period added together. Before calculators were everywhere,
          people used printed tables of these factors. These days it’s mainly something you’ll see in accounting and finance
          exams.
        </P>
      </Card>

      <Card title="How Can the Time Value of Money Be Explained in Simple Terms?">
        <P>A dollar today is worth more than a dollar a year from now. There are three reasons:</P>
        <List items={[
          ["You can put it to work.", "Today’s dollar can earn interest or returns. Next year’s dollar can’t."],
          ["Prices rise.", "Inflation means the same dollar buys a little less later."],
          ["Waiting is risky.", "A promised payment might arrive late, shrink, or never show up."],
        ]} />
        <P>
          Picture a friend offering you $100 right now or $100 a year from now. Almost everyone takes it now. If you’d need at
          least $105 a year from now to be indifferent, then your discount rate is 5%, and $100 next year is worth about $95.24
          to you today.
        </P>
        <P>
          Time value of money is built on five moving parts: present value (PV), future value (FV), interest rate (I/Y), number
          of periods (N), and payment amount (PMT). Know any four and you can solve for the fifth. Pretty much everything in
          personal finance, from loans to retirement planning to bond pricing, is some version of that puzzle.
        </P>
      </Card>

      <Card title="Where Should the Annuity Formula and the Present Value of Annuity Formula Be Used?">
        <P>Use them anytime you’ve got equal payments at regular intervals and a fixed rate. Typical places that happens:</P>
        <List items={[
          ["Loans and mortgages.", "The loan amount is the present value of all your future payments. That’s how monthly payments get calculated in the first place."],
          ["Leases and rent.", "Comparing a lease with upfront cash versus monthly payments."],
          ["Retirement income.", "Figuring out what a pension or a $2,000-a-month withdrawal plan is worth today."],
          ["Structured settlements and lottery payouts.", "Deciding between a lump sum and installments."],
          ["Bonds.", "Coupon payments are an annuity, and the face value at maturity is a separate lump sum."],
          ["Insurance and annuity products.", "Comparing a quoted payout to what you’d get on your own."],
        ]} />
        <P>
          The future value annuity formula is the one you want for savings goals, like how much you’ll have if you contribute
          $300 a month for 25 years. The present value formula is the one you want when you’re asking “what’s this stream of
          payments worth right now?” or “how big a loan can this payment support?”
        </P>
        <P>
          Skip them if payments are uneven, if the rate changes over time, or if payments are irregular. Those call for the
          cash-flow-by-cash-flow method described earlier.
        </P>
      </Card>

      <Card title="If Someone Offered an Average Joe Money Upfront in Exchange for a Percentage of His Future Earnings, Would That Be a Deal Worth Taking?">
        <P>You can actually test this with present value, and the answer swings a lot depending on the rate you plug in.</P>
        <P>
          Say Joe earns $60,000 now, expects 3% raises, and is offered $50,000 today for 10% of his income over the next 15
          years. His first-year payment would be $6,000, growing 3% a year. The present value of a growing stream is:
        </P>
        <Formula>PV = P₁ ÷ (r − g) × [1 − ((1 + g) ÷ (1 + r))ⁿ]</Formula>
        <List items={[
          ["At an 8% discount rate,", "the stream is worth about $61,000. He’d be giving up more than he’s getting."],
          ["At a 15% rate,", "it drops to about $40,400. Now the $50,000 looks like a good deal."],
        ]} />
        <P>
          So it comes down to what Joe’s money is worth to him. If he could invest at 8%, or he’s got no urgent need for cash,
          he’s probably selling himself short. If the alternative is 20% credit card debt or he can’t get funded any other way,
          the upfront cash may be worth more than the math on future payments suggests.
        </P>
        <P>Present value isn’t the whole picture here, though. Joe should also look at:</P>
        <List items={[
          ["Upside risk.", "If his income takes off, 10% of a $200,000 salary is a lot more than he bargained for. Is there a cap?"],
          ["Downside protection.", "If he earns less, the arrangement may cost him less. That insurance has real value."],
          ["Taxes and fees,", "which aren’t in the simple math."],
          ["Exit terms.", "Can he buy out early? What happens if he stops working or moves abroad?"],
        ]} />
        <P>Present value gives you a number to negotiate with, not a verdict.</P>
      </Card>

      <Card title="What a Present Value Calculator Actually Measures">
        <P>
          Present value is the value today of money you’ll receive (or pay) later. It’s the reverse of compounding.
          Compounding asks “what will this grow to?” and discounting asks “what future amount is this equivalent to?”
        </P>
        <P>
          Another name for it is present discounted value, which makes sense because you’re discounting future cash by a rate
          that reflects what you could earn elsewhere or how risky the payment is.
        </P>
        <P>This calculator handles two cases:</P>
        <List items={[
          ["A single future sum.", "For example, $25,000 due in seven years."],
          ["Equal periodic deposits or payments", "made at the beginning or end of each period."],
        ]} />
        <P>
          You enter the amounts, the rate, and the timeframe, and the tool does the discounting and gives you a schedule to
          check against.
        </P>
      </Card>

      <Card title="How to Use This Present Value Calculator">
        <H3>Step 1: Pick your scenario</H3>
        <P>
          Choose between discounting a single future sum or a stream of periodic deposits. For deposits, choose whether they
          happen at the beginning or end of each period.
        </P>
        <H3>Step 2: Enter the numbers</H3>
        <P>
          Put in the amount (the future sum, or the payment per period), the interest or discount rate as a percentage, and the
          number of years or periods.
        </P>
        <H3>Step 3: Read the results</H3>
        <P>You’ll get the present value, the future value, total interest, and the schedule.</P>
        <H3>Step 4: Change one input at a time</H3>
        <P>
          Bump the rate up a point, then extend the term by a year. That tells you more than any single answer will, because it
          shows how sensitive the result is to your assumptions.
        </P>
        <P>
          If you’re working with monthly or quarterly payments, make sure the rate and period count match. An annual rate of 6%
          with monthly payments means 0.5% per month, and 10 years means 120 periods.
        </P>
      </Card>

      <Card title="The Present Value Formula, Step by Step">
        <P>For a single payment, the formula is:</P>
        <Formula>PV = FV ÷ (1 + r)ⁿ</Formula>
        <P>
          If you’re only looking one year out, n is 1 and the formula simplifies to PV = FV ÷ (1 + r). For more periods, you
          raise (1 + r) to the number of periods. This is compound interest running in reverse, so the discounting gets heavier
          each period.
        </P>
        <H3>A worked example with a short timeline</H3>
        <P>Take $100 due in 2 years at 8%:</P>
        <List items={[
          ["Future value:", "$100"],
          ["Rate:", "8% (0.08)"],
          ["Periods:", "2"],
        ]} />
        <Formula>$100 ÷ (1.08)² = $100 ÷ 1.1664 = $85.73</Formula>
        <H3>A worked example with a longer timeline</H3>
        <P>
          $10,000 due in 5 years at 6%. The compounding factor is 1.06⁵ = 1.3382, so PV = $10,000 ÷ 1.3382 = $7,472.58. That
          means $7,472.58 invested today at 6% would grow to exactly $10,000 in five years. The roughly $2,527 gap is what
          waiting costs you.
        </P>
        <P>Try either one in the calculator. If your result matches, you’ve got the mechanics down.</P>
      </Card>

      <Card title="Present Value vs. Net Present Value">
        <P>People mix these up all the time, and they’re not the same.</P>
        <P>
          <strong>Present value</strong> discounts a cash flow, or a stream of them, to today. It tells you what something is
          worth.
        </P>
        <P>
          <strong>Net present value (NPV)</strong> takes the present value of all the money coming in and subtracts the present
          value of all the money going out, usually starting with the initial investment. It tells you whether something is
          worth doing.
        </P>
        <P>
          Think of PV as the gross figure and NPV as the net. A project with a PV of inflows of $120,000 sounds great until you
          learn it costs $130,000 to start. The NPV is −$10,000, and you’d lose money in today’s terms.
        </P>
        <P>
          A common rule of thumb: positive NPV means the project earns more than your required rate of return, negative means
          it doesn’t, and zero means you break even at that rate. NPV is used for capital budgeting, equipment purchases,
          comparing projects, and anything where money goes out first and comes back over time.
        </P>
        <P>This calculator gives you the PV piece. To get NPV, subtract your upfront cost from the present value of the inflows.</P>
      </Card>

      <Card title="Reading the Results: Present Value, Future Value, Total Interest, and Schedule">
        <List items={[
          ["Present value", "is the headline: what the future sum or stream is worth today."],
          ["Future value", "is the same relationship viewed from the other end: what today’s amount, or your deposits, would grow to at that rate over that time. If you discount the future value, you land back at the present value, which is a handy sanity check."],
          ["Total interest", "is the portion of the end value that’s growth rather than the principal or deposits themselves. For a savings-style scenario, it shows how much your money earned versus what you put in."],
          ["The schedule", "breaks everything down period by period. It’s useful for checking by hand, for pasting into a report, or for showing a client or professor how you got there."],
        ]} />
      </Card>

      <Card title="How to Choose the Right Discount Rate">
        <P>
          The rate matters more than the arithmetic, and it’s the part people guess at. A higher rate shrinks present value. A
          lower one raises it. There’s no universal “correct” rate, but here are some sensible starting points:
        </P>
        <List items={[
          ["Personal decisions:", "the return you could realistically earn elsewhere, like a high-yield savings rate or a long-term investment return. That’s your opportunity cost."],
          ["Business decisions:", "the company’s cost of capital or required rate of return for projects of that risk level."],
          ["Loan or debt choices:", "the interest rate on the debt. If you’d use the money to pay off a 7% loan, 7% is your benchmark."],
          ["Inflation-focused:", "if you just want to know what a future payment buys in today’s terms, use expected inflation. If you want the real rate, take (1 + nominal rate) ÷ (1 + inflation) − 1."],
        ]} />
        <P>
          Riskier cash flows deserve higher discount rates. A guaranteed payment from a government bond and a promised payment
          from a struggling business shouldn’t be discounted the same way.
        </P>
        <P>Try two or three rates. If the decision flips between 4% and 7%, it’s sensitive and you’ll want to dig deeper.</P>
      </Card>

      <Card title="When You’d Actually Need This Tool">
        <H3>Lump sum vs. payments</H3>
        <P>
          Lottery winnings, legal settlements, pensions, and buyouts often give you a choice. Discounting the installments lets
          you compare them with the lump sum fairly.
        </P>
        <H3>Setting a savings or investment target</H3>
        <P>
          If you need a certain amount in the future, say for a down payment, a car, or college, present value shows how much
          you’d need today at a given return. The same math tells you how much to set aside.
        </P>
        <H3>Business and investment decisions</H3>
        <P>
          Comparing projects with different payback timelines means putting everything on the same date. PV is the building
          block of NPV analysis.
        </P>
        <H3>Loans, leases, and mortgages</H3>
        <P>
          The present value of payments tells you what a financing deal really costs, especially when payments are due at the
          start of each period.
        </P>
        <H3>Valuing assets</H3>
        <P>
          Bond pricing and discounted cash flow valuation for stocks are based on present value. Future dividends or cash flows
          get discounted to estimate what an investment’s worth now.
        </P>
        <H3>School and exam prep</H3>
        <P>Students can use the schedule to check homework and understand how rate and time interact.</P>
      </Card>

      <Card title="Common Mistakes That Throw Off Present Value">
        <List items={[
          ["Mismatched rate and period.", "If payments are monthly, you need a monthly rate and a monthly period count. Using an annual rate with monthly periods is probably the single most common error."],
          ["Wrong payment timing.", "Treating an annuity due like an ordinary annuity understates the present value, as the $7,721 versus $8,108 example shows."],
          ["Using one rosy rate.", "A low discount rate makes future money look almost as good as cash today. A high one makes it look nearly worthless. Test a range."],
          ["Ignoring inflation.", "A rate that doesn’t account for inflation can make a long-term payment look better than it is in purchasing-power terms."],
          ["Forgetting what the model leaves out.", "PV assumes the payments are certain and the rate holds steady. Taxes, fees, and the risk that someone doesn’t pay aren’t built in, so treat the result as a decision aid, not a guarantee."],
        ]} />
      </Card>

      <Card title="Present Value Calculator vs. Spreadsheet vs. Financial Calculator">
        <P>
          You can do all of this in Excel or Google Sheets with the PV function: =PV(rate, nper, pmt, [fv], [type]). Note that
          Excel returns a negative number, because it treats the present value as an outflow. Put a minus sign in front of the
          function, or enter the payment as a negative, to get a positive result. The type argument is 0 for end-of-period
          payments and 1 for beginning-of-period.
        </P>
        <P>
          A financial calculator uses the same five keys (N, I/Y, PV, PMT, FV). The advantage of an online present value
          calculator is speed and clarity. There’s nothing to set up, and you get the schedule right there. For uneven cash
          flows or complex models, spreadsheets still win.
        </P>
      </Card>

      <Card title="Free to Use, With Standard Math You Can Check">
        <P>
          This tool is free to use. It works from standard time-value-of-money formulas, so you can double-check any result
          against a spreadsheet, a financial calculator, or the worked examples on this page.
        </P>
        <P>
          On privacy, the tool only needs numbers like amounts, rates, and time periods. It doesn’t need names or account
          details to work, so there’s no reason to enter anything personal. When you’re testing scenarios for a client or an
          employer, it’s still smart to keep identifying details out of it.
        </P>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
