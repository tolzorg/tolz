import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a 401k calculator work?",
    a: "It starts with your age, retirement age, current balance, salary, contribution rate, employer match, and expected return, then adds your contributions each year and grows the total by your assumed return. It repeats that until your retirement date and shows the projected balance.",
  },
  {
    q: "How much will my 401k be worth when I retire?",
    a: "It depends on how much you save, how long you save, your match, and your returns. As an example, $6,750 a year (your contribution plus match) growing at 7% for 30 years comes to roughly $637,000, before inflation.",
  },
  {
    q: "What percentage of my paycheck should I put into my 401k?",
    a: "Start with whatever it takes to get your full employer match. After that, a lot of planners suggest aiming for about 15% of your income toward retirement, counting the match, but the right number depends on when you start and what you want your retirement to look like.",
  },
  {
    q: "How do I find the contribution percentage that gets my full match?",
    a: "Look at your plan's formula. If your employer matches 50% up to 6% of pay, contribute at least 6%. If it matches 100% on the first 3% and 50% on the next 2%, contribute at least 5%. The calculator's match tool finds this for you.",
  },
  {
    q: "Can I lose my match by contributing too much?",
    a: "Yes, in some plans. If you hit the annual IRS limit early in the year, contributions stop, and in plans that match each paycheck, the match stops too. Spreading contributions evenly across the year avoids this, unless your plan has a year-end true-up.",
  },
  {
    q: "What is the 401k contribution limit for 2026?",
    a: "$24,500 if you're under 50, $32,500 if you're 50 or older, and $35,750 if you're between 60 and 63. The combined limit for you and your employer is $72,000 or 100% of your pay, whichever is less.",
  },
  {
    q: "What will the 401k limit be in 2027?",
    a: "The IRS typically announces it in late October or early November, and it usually rises slightly with inflation. Check IRS.gov once it's out.",
  },
  {
    q: "What is the penalty for withdrawing from a 401k early?",
    a: "Before age 59½, you'll generally owe ordinary income tax plus a 10% additional tax. Exceptions include the Rule of 55, disability, certain medical costs, and substantially equal periodic payments.",
  },
  {
    q: "Does a hardship withdrawal avoid the 10% penalty?",
    a: "Not automatically. A hardship withdrawal lets you take money for an urgent need, but you'll still owe income tax, and the penalty applies unless you also qualify for an exception.",
  },
  {
    q: "What is vesting in a 401k?",
    a: "Vesting is how much of your employer's contributions you actually own. Your own contributions are always 100% yours. Employer money may vest gradually or all at once after a set number of years.",
  },
  {
    q: "What's the difference between a traditional and a Roth 401k?",
    a: "Traditional contributions are pre-tax and withdrawals are taxed. Roth contributions are after-tax and qualified withdrawals are tax-free. Which one is better depends on whether you expect your tax rate to be higher or lower in retirement.",
  },
  {
    q: "When do I have to start taking money out of my 401k?",
    a: "RMDs begin at 73 if you were born from 1951 to 1959, and at 75 if you were born in 1960 or later. Roth 401(k)s no longer have lifetime RMDs.",
  },
  {
    q: "What happens to my 401k if I change jobs?",
    a: "You can leave it, roll it into your new plan, roll it into an IRA, or cash it out. A direct rollover avoids taxes and penalties, while a cash-out doesn't.",
  },
  {
    q: "What rate of return should I use?",
    a: "Many people use somewhere between 5% and 7% for a diversified portfolio. Use a lower number if you want to be cautious, and run several to see the range.",
  },
  {
    q: "Is this 401k calculator free?",
    a: "Yes, it's free to use.",
  },
];

// Structured data uses the supplied schema wording, which differs slightly from the visible FAQ text.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How does a 401k calculator work?",
    a: "It starts with your age, retirement age, current balance, salary, contribution rate, employer match, and expected return, then adds your contributions each year and grows the total by your assumed return until your retirement date.",
  },
  {
    q: "How much will my 401k be worth when I retire?",
    a: "It depends on how much you save, how long you save, your match, and your returns. For example, $6,750 a year (your contribution plus match) growing at 7% for 30 years comes to roughly $637,000, before inflation.",
  },
  {
    q: "What percentage of my paycheck should I put into my 401k?",
    a: "Start with whatever it takes to get your full employer match. After that, many planners suggest aiming for about 15% of income toward retirement, counting the match, though the right number depends on when you start and your goals.",
  },
  {
    q: "How do I find the contribution percentage that gets my full match?",
    a: "Look at your plan's formula. If your employer matches 50% up to 6% of pay, contribute at least 6%. If it matches 100% on the first 3% and 50% on the next 2%, contribute at least 5%.",
  },
  {
    q: "Can I lose my match by contributing too much?",
    a: "Yes, in some plans. If you hit the annual IRS limit early in the year, contributions stop, and in plans that match each paycheck, the match stops too. Spreading contributions evenly across the year avoids this unless your plan has a year-end true-up.",
  },
  {
    q: "What is the 401k contribution limit for 2026?",
    a: "$24,500 if you're under 50, $32,500 if you're 50 or older, and $35,750 if you're between 60 and 63. The combined limit for you and your employer is $72,000 or 100% of your pay, whichever is less.",
  },
  {
    q: "What will the 401k limit be in 2027?",
    a: "The IRS typically announces next year's limits in late October or early November, and they usually rise slightly with inflation. Check IRS.gov once they are published.",
  },
  {
    q: "What is the penalty for withdrawing from a 401k early?",
    a: "Before age 59½, you'll generally owe ordinary income tax plus a 10% additional tax. Exceptions include the Rule of 55, disability, certain medical costs, and substantially equal periodic payments.",
  },
  {
    q: "Does a hardship withdrawal avoid the 10% penalty?",
    a: "Not automatically. A hardship withdrawal lets you take money for an urgent need, but you'll still owe income tax, and the penalty applies unless you also qualify for an exception.",
  },
  {
    q: "What is vesting in a 401k?",
    a: "Vesting is how much of your employer's contributions you actually own. Your own contributions are always 100% yours. Employer money may vest gradually or all at once after a set number of years.",
  },
  {
    q: "What's the difference between a traditional and a Roth 401k?",
    a: "Traditional contributions are pre-tax and withdrawals are taxed. Roth contributions are after-tax and qualified withdrawals are tax-free. Which is better depends on whether you expect your tax rate to be higher or lower in retirement.",
  },
  {
    q: "When do I have to start taking money out of my 401k?",
    a: "RMDs begin at 73 if you were born from 1951 to 1959, and at 75 if you were born in 1960 or later. Roth 401(k)s no longer have lifetime RMDs.",
  },
  {
    q: "What happens to my 401k if I change jobs?",
    a: "You can leave it in the old plan, roll it into your new employer's plan, roll it into an IRA, or cash it out. A direct rollover avoids taxes and penalties, while a cash-out does not.",
  },
  {
    q: "What rate of return should I use?",
    a: "Many people use between 5% and 7% for a diversified portfolio. Use a lower number if you want to be cautious, and run several rates to see the range.",
  },
  {
    q: "Is this 401k calculator free?",
    a: "Yes, it's free to use.",
  },
];

const LIMIT_HEADERS = ["Category", "Limit"];
const LIMIT_ROWS = [
  ["Employee deferral (under 50)", "$24,500"],
  ["Age 50 and older (includes $8,000 catch-up)", "$32,500"],
  ["Ages 60 to 63 (includes $11,250 \"super catch-up\")", "$35,750"],
  ["Total from you and your employer combined", "$72,000 or 100% of pay, whichever is less"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
  color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 10, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

export default function Four01kCalculatorFaqSection() {
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
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This 401k Calculator Does</h2>
        <p style={pStyle}>
          This is really four calculators in one, because a 401(k) raises four different questions.
        </p>
        <p style={pStyle}>
          The first is the big one: what will my balance be at retirement? The tool looks at your age, salary,
          contribution percentage, expected salary increases, and investment return, then compounds everything year by
          year.
        </p>
        <p style={pStyle}>
          The second is what happens after you retire. Once you stop contributing and start withdrawing, the same
          balance has to last for decades, so the tool estimates distributions and how long the money holds out.
        </p>
        <p style={pStyle}>
          The third is the early withdrawal cost. If you're thinking about pulling money out before 59½, it shows what
          you'd really walk away with after taxes and the penalty.
        </p>
        <p style={pStyle}>
          The fourth is the match. Put your contribution percentage too low and you leave employer money on the table.
          Put it too high and, oddly enough, you can lose match dollars too. The calculator finds the window where you
          capture the full match. More on that below.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing to keep in mind: it's built mainly around U.S. rules, so it assumes IRS limits and U.S. tax
          treatment. And like any projection tool, the output is only as good as what goes in. Nobody knows what the
          market will do over the next 30 years, so treat the result as a reasonable range, not a promise.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When a 401k Calculator Is Actually Useful</h2>
        <p style={pStyle}>
          You don't need to run these numbers every week. They matter most at specific moments.
        </p>
        <p style={pStyle}>
          <strong>Starting a new job.</strong> You'll usually get a benefits packet and a form asking what percentage to
          defer. Before you fill it out, plug in the match formula and see what a 3% contribution looks like next to a
          6% one. The gap is often bigger than people expect.
        </p>
        <p style={pStyle}>
          <strong>Getting a raise.</strong> Most people leave their contribution rate alone for years while their pay
          goes up. A common trick is to bump your deferral by 1% (or half your raise) each time you get one. You barely
          notice it in your paycheck, but the calculator will show it adds up.
        </p>
        <p style={pStyle}>
          <strong>Checking if you're on track.</strong> If you're in your 30s or 40s and wondering whether your balance
          is "normal," this gives you a projection to measure against what you'd need.
        </p>
        <p style={pStyle}>
          <strong>Getting close to retirement.</strong> If you're within ten years or so, the withdrawal side matters
          more. You can test what happens if you retire at 62 vs. 67, or if the market has a rough first few years.
        </p>
        <p style={pStyle}>
          <strong>Thinking about cashing out.</strong> Whether you're changing jobs or facing a money crunch, seeing the
          after-tax number next to what that money could grow into often settles the question.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Comparing job offers.</strong> A job paying $5,000 less but with a generous match and no vesting wait
          can come out ahead. Run both.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the 401k Calculator</h2>
        <p style={pStyle}>
          Start with the basics: your current age and the age you plan to retire. The gap between the two is your time
          horizon, which is the single most powerful input in the whole model.
        </p>
        <p style={pStyle}>
          Next, enter your current 401(k) balance. If you're just starting, zero is fine. Then add your annual salary.
          Use your income from the job that sponsors the plan. Other income, like a spouse's pay or side work, doesn't
          go in here.
        </p>
        <p style={pStyle}>
          Then set your contribution percentage and your employer match. Get the match formula from your plan documents
          or HR, because guessing is how people end up with numbers that look good and aren't real. You'll typically see
          something like "50% of your contributions up to 6% of pay" or "dollar-for-dollar up to 4%."
        </p>
        <p style={pStyle}>
          After that, you'll pick a salary increase and an expected rate of return. For salary growth, 2% to 3% is a
          sensible default, since that's roughly in line with long-run inflation and modest raises. For returns, a lot of
          planners use somewhere around 5% to 7% for a diversified portfolio. If you want to be conservative, go lower.
          If your money is mostly in bonds or a stable value fund, go lower still.
        </p>
        <p style={pStyle}>
          Here's the part most people skip: change one input at a time and watch the result. Push retirement back two
          years. Drop the return by a point. Add 2% to your contribution. You'll quickly see which levers move your
          outcome and which ones barely matter. For most people, savings rate and time matter far more than trying to
          guess the "right" return.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick note on fees. Plan fees come out of your returns, so if your plan charges 0.8% in total and you assume
          a 7% return, your real figure is closer to 6.2%. If the tool doesn't have a fee field, just subtract the fee
          from your return assumption yourself.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Maximizing Your Employer Match</h2>
        <p style={pStyle}>
          An employer match is about the closest thing to free money you'll find in personal finance. If your company
          matches dollar-for-dollar, every dollar you contribute up to the cap instantly doubles. That's a 100% return
          before the market does anything, and you won't beat that by paying down a 7% car loan or a 22% credit card,
          though you'd obviously want to tackle truly high-interest debt too. If you're not capturing your full match,
          it's the first thing to fix.
        </p>
        <p style={pStyle}>
          Match formulas come in a few flavors, and the right contribution depends on which one you have.
        </p>
        <p style={pStyle}>
          <strong>Percentage of contributions up to a cap.</strong> Say your employer matches 50% of what you put in, up
          to 6% of pay. You'd have to contribute 6% to get the full match, and your employer would add 3% of your
          salary.
        </p>
        <p style={pStyle}>
          <strong>Dollar-for-dollar up to a cap.</strong> The employer matches 100% of the first 4% you contribute. You
          need 4% to get the full amount.
        </p>
        <p style={pStyle}>
          <strong>Tiered.</strong> The employer matches 100% on the first 3% and 50% on the next 2%. The full match takes
          a 5% contribution, and anything past that gets no match.
        </p>
        <p style={pStyle}>
          <strong>Non-elective or profit-sharing.</strong> Some employers put in a flat amount no matter what you do.
          Those are nice, but they're a different thing from a match, and you may still want to contribute your own
          money.
        </p>
        <p style={pStyle}>
          Not every plan has a match, and you can't get one if you don't contribute at all.
        </p>

        <h3 style={h3Style}>The "too much, too fast" trap</h3>
        <p style={pStyle}>
          This is the one that catches high earners. Suppose you make $200,000 and decide to contribute 25% of each
          paycheck. That's $50,000 a year, but the 2026 limit is $24,500. You'd hit the cap around mid-June. After that,
          your payroll stops sending money to your 401(k) for the rest of the year.
        </p>
        <p style={pStyle}>
          The problem is that many plans calculate the match paycheck by paycheck. If you stop contributing in June, the
          match stops too. With a 50% match up to 6% of pay, you'd have earned roughly $2,900 in match money by June and
          then missed out on about $3,100 more in the second half of the year, simply because you front-loaded.
        </p>
        <p style={pStyle}>
          Some plans have what's called a "true-up" feature, where the employer checks at year-end and tops off any
          match you missed. Plenty of plans don't. Check yours, and if you're a high earner, spread your contributions
          evenly across the year so the match keeps flowing all twelve months. The calculator's match feature shows the
          contribution window that avoids this problem.
        </p>

        <h3 style={h3Style}>Vesting: whether the match is really yours</h3>
        <p style={pStyle}>
          Your own contributions are always 100% yours. Employer contributions can come with strings. A vesting schedule
          says how long you need to stay before the employer money belongs to you.
        </p>
        <p style={pStyle}>
          There are two common types. With graded vesting, you earn ownership gradually. A typical version gives you 25%
          after year one, 50% after year two, 75% after year three, and 100% after year four. With cliff vesting, you get
          nothing until a set date, then you own everything at once. Under federal law, cliff vesting for matching
          contributions can't be longer than three years, and graded schedules can't stretch past six years.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're thinking about leaving a job, check your vesting status first. Leaving three months before a cliff
          date can cost you thousands. Your plan's summary or your HR team can tell you exactly where you stand.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Projecting Your Balance at Retirement</h2>
        <p style={pStyle}>
          The math here is compound growth. Each year, your contributions and your employer's match go in, and the whole
          balance earns the assumed return. The early dollars have the longest time to grow, which is why starting at 25
          beats starting at 35 even if the 35-year-old contributes more.
        </p>
        <p style={pStyle}>
          Here's a worked example. Say you earn $75,000, contribute 6% ($4,500), and your employer matches 50% of that
          ($2,250). That's $6,750 going in each year. At a 7% average return for 30 years, with no raises, you'd end up
          around $637,000. Only about $202,500 of that came out of your pockets and your employer's. The rest, over
          $430,000, is growth.
        </p>
        <p style={pStyle}>
          Now let's see what fees do. If your plan's total expenses knock your effective return down by a single
          percentage point, that same $6,750 a year grows to about $534,000 instead. That's roughly $104,000 gone to
          fees. It's why checking the expense ratios on your fund choices is worth ten minutes, and why low-cost index
          funds and target-date funds from a cheap provider tend to do well in a 401(k).
        </p>
        <p style={pStyle}>
          Inflation is the other thing to watch. That $637,000 is in future dollars. After 30 years of 2.5% to 3%
          inflation, it'll buy a lot less than $637,000 does today. A rough way to handle that is to run the calculator
          with a return that's already adjusted for inflation, like 4% instead of 7%, and read the result in today's
          dollars.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On investments: most plans give you a menu of mutual funds, index funds, and ETFs, covering stocks, bonds, and
          international markets. A lot of plans also offer target-date funds, which automatically shift from stocks
          toward bonds as your retirement year approaches. They're convenient, but the fees vary a lot from one provider
          to another, so don't assume they're all the same.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>401(k) Contribution Limits for 2026</h2>
        <p style={pStyle}>
          The IRS sets these every year, and they usually rise a little with inflation. For 2026:
        </p>
        <DataTable headers={LIMIT_HEADERS} rows={LIMIT_ROWS} />
        <p style={pStyle}>
          For context, the 2025 employee limit was $23,500. A few other points worth knowing:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            The $72,000 total limit covers your contributions, employer match, and any profit sharing or after-tax
            contributions. Most people never come close, but it matters for high earners and for some after-tax "mega
            backdoor" strategies.
          </li>
          <li style={liStyle}>
            The limit applies to you as a person, not per plan. If you switch jobs mid-year and have two 401(k)s, your
            combined deferrals across both still can't exceed the cap.
          </li>
          <li style={liStyle}>
            The 401(k) limit is separate from the IRA limit, which is $7,500 for 2026 ($8,600 if you're 50 or older).
            You can contribute to both.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Your plan can set stricter rules than the IRS. Some cap how much of your pay you can defer, especially for
            higher earners, so check your own plan.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What's Changing: Rules Worth Knowing Heading Into 2027</h2>
        <p style={pStyle}>A few things have shifted recently, and a couple more are on the way.</p>
        <p style={pStyle}>
          <strong>Roth catch-up for higher earners.</strong> Starting in 2026, if your wages from the plan sponsor were
          above roughly $150,000 in the prior year, your catch-up contributions have to go in as Roth (after-tax) money.
          The threshold is indexed, so check the current number. If your plan doesn't offer a Roth option, higher earners
          may not be able to make catch-up contributions at all, so it's worth asking HR.
        </p>
        <p style={pStyle}>
          <strong>The 2027 limits.</strong> The IRS usually announces next year's numbers in late October or early
          November. Expect a modest bump, probably a few hundred dollars on the base limit. It's worth checking in the
          next few weeks if you like to plan your contribution rate for January.
        </p>
        <p style={pStyle}>
          <strong>Saver's Match.</strong> Beginning in 2027, a federal matching contribution for lower and middle income
          savers is set to replace the current Saver's Credit. It's aimed at people who contribute to a retirement
          account and meet income limits, and the match goes straight into your retirement account. If your income is
          modest, keep an eye on how this rolls out.
        </p>
        <p style={pStyle}>
          <strong>Auto-enrollment.</strong> Many newer plans are now required to automatically sign employees up,
          usually at 3% to 10% of pay, with annual increases. If you were auto-enrolled at 3% and never touched it,
          that's probably too low. It's a starting point, not a recommendation.
        </p>
        <p style={pStyle}>
          <strong>Required minimum distribution (RMD) ages.</strong> If you were born between 1951 and 1959, RMDs start
          at 73. If you were born in 1960 or later, they start at 75. More on RMDs later.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          None of this changes how the calculator works, but it can change what you should plug into it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Traditional 401(k) vs. Roth 401(k)</h2>
        <p style={pStyle}>The difference comes down to when you pay taxes.</p>
        <p style={pStyle}>
          With a <strong>traditional 401(k)</strong>, contributions come out of your paycheck before income tax, which
          lowers your taxable income today. The money grows tax-deferred, and you pay ordinary income tax when you
          withdraw it. The bet is that you'll be in a lower bracket in retirement than you are now, which is often (not
          always) true.
        </p>
        <p style={pStyle}>
          With a <strong>Roth 401(k)</strong>, you contribute after-tax dollars. There's no tax break now, but qualified
          withdrawals in retirement, including all the growth, are tax-free. To be "qualified," you generally need to be
          59½ or older and have held the account for at least five years.
        </p>
        <p style={pStyle}>How to choose? A few rules of thumb:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            If you're early in your career and in a low bracket, Roth often makes sense, because you're paying tax at a
            low rate now.
          </li>
          <li style={liStyle}>
            If you're in your peak earning years and expect lower income in retirement, traditional tends to win.
          </li>
          <li style={liStyle}>
            If you're not sure, splitting contributions between the two gives you tax diversification, which helps
            because nobody knows what future tax rates will be.
          </li>
        </ul>
        <p style={pStyle}>
          You can contribute to both types in the same year as long as the total stays under the annual limit. And
          employers are now allowed to make their match contributions into the Roth side too, if the plan allows it,
          though that money is taxable in the year it's contributed.
        </p>
        <p style={pStyle}>
          One update on RMDs: Roth 401(k) accounts no longer have lifetime required minimum distributions, as of 2024.
          That used to be a difference from Roth IRAs and it's gone. Rolling a Roth 401(k) into a Roth IRA is still an
          option if you want more investment choices.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you run the calculator, keep in mind that a traditional balance is pre-tax, so $500,000 in a traditional
          account isn't the same as $500,000 in a Roth. If you're mostly traditional, think of your spendable amount as
          lower.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Early Withdrawals: What They Really Cost</h2>
        <p style={pStyle}>
          Pull money from a traditional 401(k) before age 59½ and you'll usually owe two things: ordinary income tax on
          the amount, plus an extra 10% penalty. There's a third cost that's easier to miss: the money you take out stops
          growing.
        </p>
        <p style={pStyle}>
          Here's an example. You're 40, in the 24% federal bracket, and you withdraw $20,000.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>10% penalty: $2,000</li>
          <li style={liStyle}>Federal income tax at 24%: $4,800</li>
          <li style={liStyle}>What lands in your pocket: about $13,200 (less if your state taxes it too)</li>
        </ul>
        <p style={pStyle}>
          And if you cash out directly instead of rolling the money over, your plan is required to withhold 20% for
          federal tax up front, so the check you get is smaller than you'd think, and you might owe more at tax time.
        </p>
        <p style={pStyle}>
          Now the real damage. If that $20,000 had stayed invested at 7% until age 67, it would have grown to roughly
          $124,000. So that withdrawal effectively costs you more than a hundred grand in future retirement money, to get
          $13,000 today. The calculator's early withdrawal tool is built to show you this comparison.
        </p>

        <h3 style={h3Style}>When the 10% penalty doesn't apply</h3>
        <p style={pStyle}>
          The penalty has exceptions, though you'll still owe income tax on most of them:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Rule of 55.</strong> If you leave your job in or after the year you turn 55, you can take money out
            of that employer's plan without the penalty. (It's 50 for certain public safety workers.) It only works for
            the plan at the job you just left, not old 401(k)s or IRAs.
          </li>
          <li style={liStyle}><strong>Disability.</strong> Total and permanent disability qualifies.</li>
          <li style={liStyle}><strong>Death.</strong> Payments to a beneficiary aren't hit with the penalty.</li>
          <li style={liStyle}>
            <strong>72(t) / SEPP payments.</strong> Substantially equal periodic payments let you take a fixed schedule
            of withdrawals at any age, but you have to stick with the schedule for at least five years or until 59½,
            whichever is longer. Break it and the IRS can hit you with back penalties.
          </li>
          <li style={liStyle}>
            <strong>Medical expenses.</strong> Unreimbursed medical costs above 7.5% of your adjusted gross income.
          </li>
          <li style={liStyle}>
            <strong>Court orders.</strong> Distributions under a qualified domestic relations order (QDRO), like a
            divorce settlement.
          </li>
          <li style={liStyle}><strong>Birth or adoption.</strong> Up to $5,000 per child.</li>
          <li style={liStyle}>
            <strong>Emergency expenses.</strong> A newer rule lets you take up to $1,000 a year for a personal emergency,
            with no penalty.
          </li>
          <li style={liStyle}><strong>Domestic abuse.</strong> Victims can take out a limited amount.</li>
          <li style={liStyle}>
            <strong>Terminal illness and certain disasters.</strong> Special rules apply.
          </li>
        </ul>
        <p style={pStyle}>
          Whether your plan actually allows each of these depends on how it's written, so ask your administrator.
        </p>

        <h3 style={h3Style}>Hardship withdrawals</h3>
        <p style={pStyle}>
          Some plans let you take a hardship withdrawal if you have an "immediate and heavy financial need." Common
          qualifying reasons include medical bills, buying a primary home, tuition for the next 12 months, preventing
          eviction or foreclosure, funeral costs, and repairs after damage to your main home.
        </p>
        <p style={pStyle}>
          Here's what people get wrong: a hardship withdrawal doesn't automatically waive the 10% penalty. It just means
          your plan allows you to take the money. Unless you also meet one of the exceptions above, you'll typically owe
          tax and the penalty. You can't pay it back into the account afterward, and the amount is limited to what you
          actually need. Not every employer offers these, and they usually require paperwork to prove the need.
        </p>

        <h3 style={h3Style}>401(k) loans</h3>
        <p style={pStyle}>
          Many plans let you borrow from your own balance instead, up to 50% of your vested balance or $50,000,
          whichever is less. You pay it back with interest (to yourself) through payroll deductions, usually over five
          years. There's no tax or penalty if you stick to the schedule.
        </p>
        <p style={pStyle}>
          The risk is leaving your job. Most plans want the loan repaid quickly after you leave, and if you can't, the
          unpaid balance can be treated as a withdrawal, taxes and penalty included. Loans also take money out of the
          market while you're paying it back. They're often cheaper than a hardship withdrawal, but they're not free.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick note: money in a 401(k) is generally protected from creditors, including in bankruptcy. That
          protection is one reason advisors push back on raiding the account to pay off ordinary debt.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Withdrawals in Retirement</h2>
        <p style={pStyle}>
          Once you turn 59½, you can take distributions without the early withdrawal penalty. You don't have to start
          right away, though. You can wait until your RMD age. Between those two points, here's what you can do.
        </p>
        <p style={pStyle}>
          <strong>Take it as income.</strong> You can withdraw a lump sum or set up regular installments. A lump sum
          means the whole thing gets taxed in one year, which can push you into a much higher bracket and ends the
          tax-deferred growth. Installments are usually smarter. You choose an amount to pull each month or year, and the
          rest stays invested.
        </p>
        <p style={pStyle}>
          How much to take is the hard part. A common rule of thumb is the 4% rule: withdraw 4% of your balance in your
          first year of retirement, then adjust that dollar amount for inflation each year after. On $637,000, that's
          about $25,500 in year one. It comes from historical U.S. data and a roughly 30-year retirement, so it's a
          starting point, not a guarantee. If you retire at 55, you may want something closer to 3.5%. If you've got a
          pension or large Social Security checks covering your basics, you can afford to be more flexible.
        </p>
        <p style={pStyle}>
          Other things that change the answer: your health and expected lifespan, whether you'll work part-time, when you
          plan to claim Social Security (full benefits start at 67 for anyone born in 1960 or later, and you can claim as
          early as 62 at a reduced amount), and whether the market takes a hit early in your retirement. That last one,
          called sequence risk, can do real damage because you're selling shares while prices are down. Many retirees
          keep a year or two of expenses in cash or bonds to avoid selling at a bad time.
        </p>
        <p style={pStyle}>
          Don't forget taxes. Traditional 401(k) withdrawals are ordinary income, so $25,500 withdrawn doesn't mean
          $25,500 spent. Roth withdrawals aren't taxed. It's worth knowing how much of your total retirement income is
          taxable.
        </p>
        <p style={pStyle}>
          <strong>Roll it over.</strong> You can move a 401(k) into an IRA or a new employer's plan without paying tax,
          as long as it's done correctly. The cleanest way is a direct rollover, where the money goes straight from one
          account to the next. If a check is made out to you instead, you have 60 days to deposit it, and your old plan
          will withhold 20% that you'll need to make up from other funds to roll over the full amount. IRAs usually give
          you way more investment choices and often lower fees. On the flip side, you lose the creditor protections and
          loan options that some 401(k)s have, and rollovers to a traditional IRA won't help you avoid RMDs.
        </p>
        <p style={pStyle}>
          <strong>Convert to an annuity.</strong> Some plans let you turn your balance into a stream of monthly payments
          through an insurance company, for life or for the life of you and a spouse. It gives you predictable income,
          but you give up flexibility and the money you've put in, so it takes careful thought.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Leave it alone.</strong> If you don't need the money, you can let it keep growing until RMDs force
          your hand.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Required Minimum Distributions</h2>
        <p style={pStyle}>
          The IRS doesn't let you defer taxes forever. RMDs start at 73 if you were born between 1951 and 1959, or 75 if
          you were born in 1960 or later. Your first RMD is due by April 1 of the year after you reach that age, and
          later ones are due by December 31 each year.
        </p>
        <p style={pStyle}>
          The amount comes from dividing your prior year-end balance by a life expectancy factor from an IRS table. As
          you get older the factor shrinks, so the percentage you have to take rises.
        </p>
        <p style={pStyle}>
          If you miss an RMD, the penalty is 25% of the amount you should have taken. If you fix it quickly, that drops
          to 10%. Older guides still say 50%, which was the rule before recent changes. You can also ask the IRS to waive
          it by filing Form 5329 and explaining what happened.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's one exception worth knowing. If you're still working for the employer that sponsors the plan when you
          hit RMD age, and you don't own 5% or more of the company, you may be able to delay RMDs on that plan until you
          retire. Your plan has to allow it, and it only applies to your current employer's plan, not old 401(k)s or
          IRAs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solo 401(k) for the Self-Employed</h2>
        <p style={pStyle}>
          If you work for yourself and have no employees (other than a spouse), a solo 401(k), sometimes called an
          individual or self-directed 401(k), lets you contribute as both the employee and the employer. That's how a
          lot of freelancers and small business owners save far more than they could in an IRA.
        </p>
        <p style={pStyle}>
          The rules mostly mirror a regular 401(k): tax-deferred contributions, a 10% penalty before 59½, and RMDs
          later. The big perks are higher total contribution potential, since you can add an employer-side contribution
          based on your net self-employment income, and in some cases wider investment options like real estate or
          precious metals, depending on the plan provider. Loans are typically allowed up to 50% of your balance or
          $50,000.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If that's you, the standard calculator will still give you a decent estimate. Treat your total (employee plus
          employer-side) contribution as one number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>401(k) vs. Pension: Why This Is a Defined Contribution Plan</h2>
        <p style={pStyle}>
          A traditional pension is a <strong>defined benefit</strong> plan. Your employer promises a set payout in
          retirement based on a formula, usually years of service and final pay, and carries the investment risk.
        </p>
        <p style={pStyle}>
          A 401(k) is a <strong>defined contribution</strong> plan. You and your employer put money in, you pick the
          investments, and what you end up with depends on how much went in and how the market performed. You carry the
          risk, but you also keep the account if you leave.
        </p>
        <p style={pStyle}>
          That portability is a big reason 401(k)s took over. Pensions reward staying at one company for 25 years or
          more, which fewer people do now. A 401(k) goes where you go. When you leave a job, you generally have four
          choices:
        </p>
        <ol style={listGapStyle}>
          <li style={liStyle}>Leave the money in your old employer's plan (if the balance is above their minimum)</li>
          <li style={liStyle}>Roll it into your new employer's 401(k)</li>
          <li style={liStyle}>Roll it into an IRA</li>
          <li style={liStyle}>Cash it out, which means income tax plus the 10% penalty if you're under 59½</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most people, options 1 through 3 are the better move. Option 4 is how a lot of 401(k)s quietly shrink over
          a career.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pros and Cons of a 401(k)</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>What works well</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Tax-deferred growth.</strong> Interest, dividends, and capital gains aren't taxed each year, so more
            of your money stays invested.
          </li>
          <li style={liStyle}>
            <strong>Employer match.</strong> It's a built-in raise, and plenty of surveys show employees value it highly.
          </li>
          <li style={liStyle}>
            <strong>Tax break up front.</strong> Traditional contributions reduce your taxable income right away.
          </li>
          <li style={liStyle}>
            <strong>High limits.</strong> You can contribute more than three times what an IRA allows.
          </li>
          <li style={liStyle}>
            <strong>Creditor protection.</strong> Funds are generally shielded in bankruptcy.
          </li>
          <li style={liStyle}>
            <strong>Automatic.</strong> Money comes out of your paycheck before you see it, which is a big reason it
            works.
          </li>
        </ul>
        <h3 style={h3Style}>What to watch out for</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Limited investment choices.</strong> You're stuck with your plan's menu.
          </li>
          <li style={liStyle}>
            <strong>Fees.</strong> Administrative and fund costs can eat into growth, especially in smaller company
            plans.
          </li>
          <li style={liStyle}>
            <strong>Locked up.</strong> Getting at the money before 59½ usually costs you.
          </li>
          <li style={liStyle}>
            <strong>Vesting.</strong> You may not keep the full match if you leave early.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Waiting periods.</strong> Some plans make new hires wait up to a year before they can join, though
            many have no wait.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Is This Calculator, and What Happens to Your Data?</h2>
        <p style={pStyle}>
          The tool is free to use. It does the math the same way every time, but the result depends on what you enter
          and on things nobody can know, like future returns, tax rates, and inflation. Think of it as a way to compare
          scenarios, not a forecast. For best results, use numbers from your latest plan statement, pull the match
          formula straight from your plan documents, and run a cautious case and an optimistic case.
        </p>
        <p style={pStyle}>
          This tool doesn't replace advice from a planner or tax professional, especially for decisions like rollovers,
          Roth conversions, or retiring early. Tax rules change, and your plan's details matter.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Tolz doesn't need personal details like your name or account numbers to give you an estimate. For specifics on
          how any data is handled, see the site's privacy policy.
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
