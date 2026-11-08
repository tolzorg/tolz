import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this payback period calculator free?",
    a: "Yes. It’s free, and the discounted payback, IRR, and full schedule are included at no extra cost.",
  },
  {
    q: "Can I enter negative cash flows in later years?",
    a: "Yes. Years with losses, repairs, or reinvestment can be entered as negative values, and the schedule will show how they affect the running total.",
  },
  {
    q: "What happens if my investment never pays back?",
    a: "It means the cumulative cash flow never reaches zero within the periods you entered. Try extending the timeline, check whether your cash flow estimates are too low, or look at whether your discount rate is so high that the discounted version can’t recover the cost.",
  },
  {
    q: "Should I use pre-tax or after-tax cash flows?",
    a: "After-tax is better for business and larger investment decisions, since taxes are a real cash cost. For quick personal estimates, pre-tax is fine as long as you’re consistent.",
  },
  {
    q: "Which discount rate should I use if I’m not sure?",
    a: "Use your cost of capital if you have one, or the return you’d expect from another investment with similar risk. Run it at two or three rates and see if the conclusion changes.",
  },
  {
    q: "Should I adjust for inflation?",
    a: "Be consistent. If your cash flows are in today’s dollars, use a “real” discount rate that excludes inflation. If they include expected price increases, use a normal (nominal) rate. Mixing the two skews the result.",
  },
  {
    q: "Is a payback period under one year realistic?",
    a: "Yes, for some things, like low-cost efficiency upgrades, small tools, or marketing campaigns. For big assets and property, multiple years is normal.",
  },
  {
    q: "Why is my discounted payback so much longer than the simple one?",
    a: "Either your discount rate is high, or most of your cash arrives late in the project’s life. Both make discounting hit harder. It’s a signal that the project leans on distant returns.",
  },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "Should I adjust for inflation?": {
    q: "Should I adjust for inflation in a payback calculation?",
    a: "Be consistent. If your cash flows are in today's dollars, use a real discount rate that excludes inflation. If they include expected price increases, use a nominal rate. Mixing the two skews the result.",
  },
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => {
  const o = FAQ_SCHEMA_OVERRIDES[item.q] || {};
  return { q: straight(o.q ?? item.q), a: straight(o.a ?? item.a) };
});

const SIMPLE_HEADERS = ["Year", "Cash flow", "Cumulative cash flow"];
const SIMPLE_ROWS = [
  ["0", "-$80,000", "-$80,000"],
  ["1", "$10,000", "-$70,000"],
  ["2", "$18,000", "-$52,000"],
  ["3", "$25,000", "-$27,000"],
  ["4", "$25,000", "-$2,000"],
  ["5", "$8,000", "$6,000"],
  ["6", "$25,000", "$31,000"],
  ["7", "$25,000", "$56,000"],
];
const DISCOUNTED_HEADERS = ["Year", "Cash flow", "Present value", "Cumulative PV"];
const DISCOUNTED_ROWS = [
  ["0", "-$80,000", "-$80,000", "-$80,000"],
  ["1", "$10,000", "$9,259", "-$70,741"],
  ["2", "$18,000", "$15,432", "-$55,309"],
  ["3", "$25,000", "$19,846", "-$35,463"],
  ["4", "$25,000", "$18,376", "-$17,087"],
  ["5", "$8,000", "$5,445", "-$11,642"],
  ["6", "$25,000", "$15,755", "$4,113"],
  ["7", "$25,000", "$14,587", "$18,700"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
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
const List = ({ items, ordered }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
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

export default function PaybackPeriodCalculatorFaqSection() {
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

      <Card title="Payback Period Basics">
        <H3>What is the definition and formula for the payback period?</H3>
        <P>
          The payback period is the amount of time it takes for an investment’s cash inflows to cover what you put in. It’s
          usually measured in years, and it’s almost always a decimal, like 3.4 years. Once you hit that point, you’ve got your
          money back and everything after that is gain.
        </P>
        <P>
          Finance people use it most in capital budgeting, where a company has to decide which projects deserve its limited
          cash. The logic is simple: the sooner you recover the money, the less time it’s at risk, and the sooner you can use
          it again.
        </P>
        <P>When the cash coming in is the same every year, the formula is just:</P>
        <Formula>Payback Period = Initial Investment ÷ Annual Net Cash Inflow</Formula>
        <P>
          Say you buy a rental condo for $150,000 and it brings in $18,000 a year after expenses. That’s $150,000 ÷ $18,000, or
          about 8.33 years. As a rule of thumb, shorter is better, and anything that takes a long time to pay back needs a good
          reason to justify the wait.
        </P>

        <H3>If your investment has regular annual cash inflows, how do you determine the payback period?</H3>
        <P>If the same amount comes in every year, you just divide. But a few things are worth checking before you trust the answer.</P>
        <P>
          First, make sure the inflow is net. If a machine brings in $40,000 a year in extra sales but costs $12,000 a year to
          run and maintain, your inflow is $28,000, not $40,000. Second, make sure the cash flow really is level. A “steady”
          rental income usually isn’t, since rents go up, vacancies happen, and the roof leaks eventually. If you know the
          number will drift, use the growing or irregular option instead.
        </P>
        <P>
          Third, the decimal part is a fraction of a year. A result of 8.33 years means 8 years and about 4 months (0.33 × 12).
          It assumes the cash arrives evenly across the year, which isn’t always how it works in real life, but it’s close
          enough for screening.
        </P>

        <H3>How do we calculate the payback period with calculated examples?</H3>
        <P>Here are a few quick ones so you can see the pattern.</P>
        <List items={[
          ["Example 1: even cash flow.", "You buy a $60,000 delivery van that adds $15,000 a year in net cash. $60,000 ÷ $15,000 = 4 years."],
          ["Example 2: a result with a fraction.", "You spend $45,000 on a kitchen upgrade that saves $12,000 a year. $45,000 ÷ $12,000 = 3.75 years, or 3 years and 9 months."],
          ["Example 3: a small, clean one.", "A $100 investment that returns $20 a year takes 5 years to pay back."],
        ]} />
        <P>
          The next section covers what happens when the cash doesn’t come in evenly, because that’s where a simple division
          stops working.
        </P>

        <H3>How do you calculate the payback period for inconsistent cash flow?</H3>
        <P>
          When cash flows jump around, you can’t divide. Instead, you add them up year by year until the running total covers
          your investment, then figure out how far into that final year you were when you crossed the line.
        </P>
        <P>
          Let’s say you put $80,000 into a food truck business. Your expected net cash flows over seven years look like this,
          with a $8,000 year in year 5 because the truck needs a new engine component:
        </P>
        <DataTable headers={SIMPLE_HEADERS} rows={SIMPLE_ROWS} />
        <P>
          The cumulative number flips from negative to positive during year 5. After year 4 you’re still $2,000 short, and year
          5 brings in $8,000, so:
        </P>
        <Formula>Payback = 4 + ($2,000 ÷ $8,000) = 4.25 years</Formula>
        <P>
          The general version of that formula is: years fully completed before recovery + (unrecovered amount at the start of
          the recovery year ÷ cash flow during that year).
        </P>

        <H3>How do you calculate the cumulative payback period?</H3>
        <P>
          “Cumulative payback” is really the same method as above, just with a name that emphasizes the running total. You
          build a column that starts at your negative initial investment and adds each year’s cash flow to the previous
          balance. The payback year is the first year where that column turns positive.
        </P>
        <P>
          One catch: sometimes the running total crosses zero, then dips back below it because of a big repair, a lawsuit, or a
          required reinvestment, and then climbs again. That means you technically have more than one crossing. Most analysts
          use the first crossing for a quick answer, but if a later dip is large and expected, it’s worth mentioning both. A
          schedule makes this obvious. A single number hides it.
        </P>

        <H3>How do I calculate the payback period of a project in months?</H3>
        <P>
          Multiply the result by 12. A payback of 4.25 years is 51 months. If you’d rather think in months from the start,
          divide the investment by the monthly net cash inflow. A $9,000 piece of equipment that adds $750 a month pays back in
          12 months.
        </P>
        <P>
          If you’re doing a discounted payback in months, don’t just plug the annual discount rate into a monthly calculation.
          Convert it first: monthly rate = (1 + annual rate)^(1/12) − 1. A 10% annual rate works out to roughly 0.80% a month,
          not 0.83% and definitely not 10%.
        </P>

        <H3>How do you calculate the payback period for an asset?</H3>
        <P>
          For an asset, like a machine, a truck, or a software system, you’re comparing what it costs to get it up and running
          against the extra cash it produces or the costs it saves.
        </P>
        <P>
          Start with the full cost: purchase price, delivery, installation, training, and anything else needed to get it
          working. If you’re replacing an old asset and can sell it, subtract what you’ll get for it. Then estimate the annual
          net benefit, which is extra revenue plus savings minus added operating and maintenance costs.
        </P>
        <P>
          Example: a new forklift costs $45,000, and you’ll sell the old one for $5,000, so your net outlay is $40,000. It saves
          $14,000 a year in labor and $2,000 in product damage, but costs $3,000 a year to maintain. Net benefit is $13,000.
          Payback is $40,000 ÷ $13,000 ≈ 3.08 years.
        </P>
        <P>
          For bigger purchases, use after-tax cash flows. Depreciation isn’t cash, but it does lower your taxes, and that tax
          savings is real money that belongs in the cash flow.
        </P>

        <H3>How do you calculate payback period for a business?</H3>
        <P>
          If you’re asking how long until a business investment, like opening a second location, launching a product, or
          starting the company itself, pays you back, use cash flow, not profit.
        </P>
        <P>
          Net profit can mislead you here. Depreciation reduces profit but doesn’t leave your bank account, so it gets added
          back. Loan principal payments and inventory buildup don’t show up in profit but do eat cash. Working capital you tie
          up in receivables and stock is part of what you’ve invested. So the cleanest approach is to take your total cash
          outlay, including working capital, and compare it against the net operating cash the new venture generates each
          period.
        </P>

        <H3>Is the payback period the same as the break-even point?</H3>
        <P>They’re related, but they’re not the same thing, and people mix them up constantly.</P>
        <P>
          Payback period is about time for an investment to recover its cost from cash flows. The break-even point usually
          refers to the level of sales, units, or revenue where total revenue equals total costs. A coffee shop might have a
          break-even of 120 cups a day and a payback period of 3 years on the build-out.
        </P>
        <P>
          The confusing part is that some textbooks describe payback as reaching the “break-even point” in the sense that
          cumulative cash flow hits zero. That’s the same idea, just applied to an investment rather than to a product’s sales
          volume. If you see “break-even” in a sales or pricing context, it’s about volume. If you see it in capital budgeting,
          it’s about time.
        </P>

        <H3>What is an undiscounted payback period?</H3>
        <P>
          It’s just the regular, simple payback period. “Undiscounted” means nobody has adjusted the future cash flows for the
          time value of money. A dollar in year six counts as a full dollar. People add the word “undiscounted” when they want
          to make the contrast with the discounted version clear.
        </P>
      </Card>

      <Card title="Discounted Payback Period">
        <H3>What is the discounted payback period?</H3>
        <P>
          Money today is worth more than the same money later, because you can invest it, and because inflation chips away at
          what it buys. The discounted payback period handles this by shrinking each future cash flow to its present value
          before adding it up. It tells you how long it takes for the present value of your inflows to cover your investment.
        </P>
        <P>The present value of a cash flow is:</P>
        <Formula>PV = Cash Flow ÷ (1 + r)^t</Formula>
        <P>
          where r is your discount rate and t is the year. Then you do the same cumulative thing as before, just with the
          discounted numbers.
        </P>
        <P>If your cash flows are level, there’s a shortcut that skips the table:</P>
        <Formula>DPP = −ln(1 − (Investment × r ÷ Annual Cash Flow)) ÷ ln(1 + r)</Formula>
        <P>
          Take the $100 investment returning $20 a year with a 10% discount rate. The simple payback is 5 years. The discounted
          payback is −ln(1 − 0.5) ÷ ln(1.10) = 7.27 years. Same investment, same cash, and it takes about two and a quarter
          years longer once you account for time.
        </P>
        <P>With the $150,000 condo from earlier and a 6% discount rate, the 8.33-year payback stretches to about 11.9 years.</P>
        <P>
          Here’s something most pages don’t mention. If Investment × discount rate ≥ annual cash flow, that formula breaks, and
          for good reason: the investment never pays back on a discounted basis. Put $100 in, earn $20 a year, and use a 20%
          discount rate, and you’ll never get there, because the present value of $20 a year forever is only $100 at 20%. If
          you ever see “no payback” for a project that looks fine on a simple basis, that’s usually why.
        </P>
        <P>
          For uneven flows, you build the table, find the year where cumulative present value turns positive, and use the same
          fractional formula as before, but with discounted numbers. Using the food truck from earlier at an 8% discount rate:
        </P>
        <DataTable headers={DISCOUNTED_HEADERS} rows={DISCOUNTED_ROWS} />
        <P>
          Break-even lands in year 6. You’re still $11,642 short at the end of year 5, and year 6 contributes $15,755 in present
          value:
        </P>
        <Formula>Discounted payback = 5 + ($11,642 ÷ $15,755) ≈ 5.74 years</Formula>
        <P>
          The simple payback was 4.25 years. That’s a gap of nearly a year and a half, and it’s the difference between “this
          looks great” and “this is decent.”
        </P>

        <H3>Why is the discounting payback period better than the regular payback period?</H3>
        <P>
          It’s better at answering the question most people actually care about: when am I really whole, in today’s dollars?
          The regular version treats late cash as if it were worth as much as early cash, which flatters any project that leans
          on far-off returns. The discounted version is stricter and more realistic.
        </P>
        <P>
          It also gives you something regular payback can’t: a built-in comparison to your required return. If a project can’t
          pay back, even on a discounted basis, within its useful life, it isn’t earning your required rate. That’s a clean
          pass/fail test.
        </P>
        <P>
          “Better” has limits, though. Discounted payback still ignores everything that happens after break-even, and it’s only
          as good as the discount rate you pick. Use it alongside other metrics. Don’t treat it as the final word.
        </P>

        <H3>What is the meaning of the same value of payback period and discounted payback period?</H3>
        <P>
          With a positive discount rate and positive cash flows, the discounted payback should always be longer. If you see
          identical numbers, there are only a few explanations.
        </P>
        <P>
          The most common one is a discount rate of zero, which makes the two methods mathematically identical. Another is that
          both results are being shown as whole years, and break-even happens to fall in the same year under both methods. A
          third is that the cash that pays back the investment arrives at time zero, like an upfront grant or deposit, so
          there’s nothing to discount. And sometimes both just say “no payback” because the project never recovers its cost in
          the timeframe you entered.
        </P>
        <P>If you expected a gap and don’t see one, double-check that the discount rate field isn’t blank or zero.</P>

        <H3>Cash flow, discount rate and WACC: the inputs behind the math</H3>
        <P>Everything above depends on two inputs, so it’s worth understanding them.</P>
        <P>
          <strong>Cash flow</strong> is the actual cash coming in and going out, not accounting profit. Money that arrives
          (sales, savings, tax refunds) is positive. Money that leaves (operating costs, repairs, taxes) is negative. For payback
          work, you net them for each period and use that single figure. A business’s cash position is also a rough health
          check: steady positive cash flow means it can pay its bills and fund growth.
        </P>
        <P>
          <strong>The discount rate</strong> is basically an interest rate run backward. Instead of asking what $1,000 today
          will be worth in five years, it asks what $1,000 five years from now is worth today. It lets you take payments from
          different years and compare them at a single point in time.
        </P>
        <P>
          For businesses, the discount rate is often the <strong>weighted average cost of capital (WACC)</strong>, which blends
          the cost of what the company pays on debt with what shareholders expect on equity, weighted by how much of each it
          uses. It’s a good proxy for the opportunity cost of tying up the company’s money. For a person making a personal
          decision, a reasonable discount rate is whatever you could realistically earn on another investment of similar risk.
          If you’re not sure, run the calculator at a couple of different rates, like 6%, 8%, and 10%, and see whether the
          answer changes your decision. If it doesn’t, you’re good.
        </P>
      </Card>

      <Card title="Advantages, Disadvantages and Selection Bias">
        <H3>What are the advantages and disadvantages of a payback period?</H3>
        <P>The advantages are real, which is why it’s still everywhere:</P>
        <List items={[
          ["", "It’s quick to calculate and easy to explain to people who don’t live in spreadsheets."],
          ["", "It shows liquidity risk. Faster recovery means less time exposed."],
          ["", "It works well as a first filter when you have a pile of projects and not much time."],
          ["", "It’s a good fit for industries where things change quickly, like tech and consumer products, because far-off cash flows are really guesses anyway."],
          ["", "It doesn’t need a discount rate (the simple version), so there’s one less assumption to argue over."],
        ]} />
        <P>The disadvantages are just as real:</P>
        <List items={[
          ["", "The simple version ignores the time value of money."],
          ["", "It ignores every cash flow after break-even, so it can’t tell a project that pays back and dies from one that pays back and keeps producing for 20 years."],
          ["", "The cutoff (“we only do projects under 3 years”) is arbitrary."],
          ["", "It says nothing about total profitability or the size of the project."],
          ["", "It doesn’t account for risk beyond how quickly you get your money back."],
        ]} />

        <H3>Why does the payback period bias the process of asset selection?</H3>
        <P>
          Because it rewards speed and ignores everything else, it pushes decisions toward assets that return cash quickly, even
          when a slower asset would make you far more money.
        </P>
        <P>
          Here’s a simple example. Project A costs $100,000 and returns $50,000 in each of two years, then nothing. It pays back
          in 2 years. Project B costs $100,000 and returns $25,000 a year for ten years. It pays back in 4 years.
        </P>
        <P>
          A payback rule says pick A. But at a 10% discount rate, Project A’s net present value is about −$13,200, so it
          actually loses money once you account for time. Project B’s NPV is roughly +$53,600. The payback rule picks the loser.
        </P>
        <P>
          That’s the bias in a nutshell. Companies that rely heavily on payback tend to underinvest in long-lived projects like
          research, infrastructure, brand building, and energy efficiency, and overinvest in quick wins. It also favors smaller,
          safer-looking projects, even when a bigger one adds more total value. This is why payback is best used to screen, not
          to rank.
        </P>

        <H3>Does the payback period include salvage value?</H3>
        <P>
          Usually not. The standard payback calculation only looks at the operating cash flows until you’ve recovered your
          investment, and salvage value, meaning what you’d get from selling the asset at the end of its life, typically comes
          years later, after payback has already happened.
        </P>
        <P>
          There’s an exception. If a project only pays back because of the sale at the end, as with a short-term lease or a
          flip, then the sale proceeds are part of the cash flow in that final year and belong in the calculation. Likewise, if
          you’re selling an old asset to fund a new one today, that sale reduces your net initial outlay, as in the forklift
          example earlier.
        </P>

        <H3>When calculating payback period using Excel, do we include sunk costs?</H3>
        <P>
          For a forward-looking decision, no. A sunk cost (some people call these “sunken costs”) is money already spent that you
          can’t get back, like a feasibility study you paid for last year. It’s gone whether you go ahead with the project or
          not, so it shouldn’t affect whether the project is worth doing.
        </P>
        <P>
          Your initial investment should include only the money you still have to spend going forward. If you’re looking back at
          a finished project and want to see how long it took to earn back everything you put in, including what you spent
          early on, then include it. The difference is simply whether you’re making a decision or reviewing one.
        </P>
      </Card>

      <Card title="Payback Period vs. ROI, NPV and IRR">
        <H3>What is the difference between payback period and return on investment?</H3>
        <P>
          They answer different questions. Payback tells you how fast you get your money back. ROI tells you how much you made
          relative to what you put in.
        </P>
        <P>
          ROI is calculated as (total gain − cost) ÷ cost. Using the $50,000 equipment example from earlier, with inflows of
          $12,000, $15,000, $18,000, $20,000, and $22,000 over five years, total inflows are $87,000. Net gain is $37,000. ROI
          is 74%. Payback is 3.25 years.
        </P>
        <P>
          ROI doesn’t care about timing, so 74% over five years looks the same as 74% over fifteen. Payback doesn’t care what
          happens after break-even. You need both to see the whole picture.
        </P>

        <H3>What is the expected return on investment (ROI) and payback period?</H3>
        <P>
          When people set targets, they usually pair the two: “we want at least a 25% ROI and a payback under three years.”
          That’s a reasonable way to use them because they cover each other’s blind spots.
        </P>
        <P>
          To figure out your expected ROI, estimate total cash flows over the project’s useful life, subtract the investment,
          and divide by the investment. For expected payback, run those same projected flows through the cumulative method.
          Keep the assumptions identical in both calculations. A common mistake is using an optimistic life span for ROI and a
          conservative cash flow for payback.
        </P>

        <H3>What is the implication of the payback period and return on investment?</H3>
        <P>Putting them side by side tells you something useful:</P>
        <List items={[
          ["Short payback, high ROI:", "the best case. Quick recovery and strong total returns."],
          ["Short payback, low ROI:", "you get your money back fast, but the project doesn’t earn much beyond that. Fine for a quick flip, a poor use of a long-term asset."],
          ["Long payback, high ROI:", "slow to start, but valuable over time. Common with infrastructure and long-lived equipment, and riskier because so much depends on distant cash flows."],
          ["Long payback, low ROI:", "usually a pass."],
        ]} />

        <H3>Which is better: using the payback period method or IRR?</H3>
        <P>Neither on its own. They measure different things and fail in different ways.</P>
        <P>
          The payback method is simple and tells you about speed and risk, but it ignores profitability past break-even. IRR
          gives you an annualized return rate that accounts for timing and the full life of the project, but it has its own
          quirks: projects with flows that flip between positive and negative can have more than one IRR, it doesn’t tell you
          the size of the gain, and it quietly assumes interim cash can be reinvested at the same high rate, which is often too
          optimistic.
        </P>
        <P>
          In practice, use payback to see how quickly you’d be out of the woods, and IRR to see whether the project earns more
          than your required return. When they disagree, that’s a signal to look at the schedule more closely.
        </P>

        <H3>Why is NPV considered a more sophisticated capital budgeting technique than payback period?</H3>
        <P>
          Three reasons. NPV discounts every cash flow at your cost of capital, so the time value of money is baked in. It
          counts all cash flows over the project’s life, not just the ones before break-even. And it gives you a dollar answer:
          how much value the project adds. That makes it easy to compare projects and even to add them up, since the NPV of two
          independent projects is the sum of their individual NPVs.
        </P>
        <P>
          The trade-off is that NPV needs a discount rate and a full set of long-term forecasts, and the answer is only as good
          as those inputs. Payback needs less. That’s why it hangs around.
        </P>

        <H3>NPV, IRR or the payback period: what’s the preferred method in corporations?</H3>
        <P>
          Most large companies use all three, with NPV and IRR doing the heavy lifting. In the well-known survey of corporate
          CFOs by Graham and Harvey, roughly three-quarters said they used IRR and NPV always or almost always, and payback
          wasn’t far behind at somewhere around 57%. Smaller and privately held companies tend to lean on payback more, since
          they have less capital to spare and less data to build detailed models.
        </P>
        <P>
          The pattern most finance teams follow is to use payback as a quick liquidity and risk check, then use NPV and IRR to
          judge whether the project actually creates value.
        </P>

        <H3>Why is the payback period an important tool in capital budgeting?</H3>
        <P>
          A few practical reasons. Companies have limited cash, and payback shows how quickly it comes back for the next
          project. It’s an easy common language between finance and the people proposing projects. It builds in a rough risk
          screen, since forecasts get shakier the farther out they go. And in fast-changing industries where equipment becomes
          obsolete quickly, a short payback is a sensible safeguard.
        </P>
        <P>It’s rarely the only test. But it’s often the first one a project has to pass.</P>
      </Card>

      <Card title="Payback Period in Real-World Situations">
        <H3>What is the payback period on a set of solar panels?</H3>
        <P>
          For solar, take the system cost after any incentives you qualify for, then divide by the yearly electricity savings.
          Incentives change, so check what’s currently available where you live before you plug anything in.
        </P>
        <P>
          A good example: an $18,000 system saving $1,800 in the first year. Divide and you get 10 years. But electricity rates
          usually rise over time, and that helps you. If your savings grow 3% a year, the cumulative total passes $18,000 about
          8.9 years in. Panel output also slips slightly each year, so don’t assume the growth is perfectly smooth.
        </P>
        <P>This is a case where the growing-cash-flow option matters. A flat estimate undersells the payback.</P>

        <H3>How do you calculate the payback period for an electric car?</H3>
        <P>
          Compare the EV to the car you’d otherwise buy, not to nothing. Take the extra upfront cost of the EV (after any
          credits you’re eligible for, plus a home charger if you need one) and divide by the annual savings.
        </P>
        <P>
          Here’s an illustrative example. Say the EV costs $8,000 more than a comparable gas car. You drive 12,000 miles a year.
          The gas car gets 28 mpg and gas is $3.50 a gallon, so fuel runs about $1,500 a year. The EV uses roughly 3,400 kWh at
          $0.17 per kWh, around $580. That’s about $920 saved on fuel, and maybe $400 a year less on maintenance. Total savings
          are around $1,300, so payback is about 6 years.
        </P>
        <P>
          Change the mileage, local gas and electricity prices, or how long you plan to keep the car, and the answer moves a
          lot. Also, count insurance differences. They can eat into the savings.
        </P>

        <H3>What is the average payback period for commercial real estate developments?</H3>
        <P>
          There’s no single average worth quoting, since it swings a lot by property type, market, and financing. But there’s a
          useful way to think about it: on an all-cash basis, payback is roughly the inverse of your annual cash yield. A
          property with a 6% cap rate pays back in about 16.7 years (1 ÷ 0.06). At an 8% cash-on-cash return on the equity you
          invested, it’s 12.5 years.
        </P>
        <P>
          That’s why real estate investors usually pair payback with the cap rate, cash-on-cash return, and IRR. It also shows
          why growth matters: if rents rise, the real payback comes sooner than the flat estimate suggests, and the growing cash
          flow option helps with that.
        </P>

        <H3>What is the average payback period of capital-intensive industries?</H3>
        <P>
          Industries with huge up-front asset bases, like utilities, pipelines, telecom networks, mining, airlines, and
          semiconductor fabs, tend to have long paybacks, often in the range of many years to well over a decade. It varies
          widely by project and company, so be careful with any single “industry average.”
        </P>
        <P>
          The reason is simple: the equipment is expensive and lasts a long time, so the returns are spread over decades. In
          these cases, simple payback is a weak decision tool on its own. Discounted payback, NPV, and IRR matter far more,
          since so much of the value comes after break-even.
        </P>

        <H3>What does “payback period” mean in the context of SaaS metrics?</H3>
        <P>
          In SaaS, people usually mean the CAC payback period: how many months it takes to earn back what you spent to acquire a
          customer. The formula is:
        </P>
        <Formula>CAC ÷ (monthly recurring revenue per customer × gross margin %)</Formula>
        <P>
          Example: it costs $1,200 to acquire a customer paying $150 a month, and your gross margin is 80%. Gross profit per
          month is $120, so payback is 10 months.
        </P>
        <P>
          Many SaaS investors like to see this under about 12 months for smaller-ticket products, though longer periods (18
          months or more) are sometimes accepted for enterprise deals with low churn. Keep in mind this version is usually
          undiscounted and doesn’t automatically account for churn. A customer who cancels in month 8 never pays you back at
          all.
        </P>

        <H3>Which bitcoin miner has the fastest payback period?</H3>
        <P>
          There’s no honest answer to give by model name, because it changes constantly with the price of bitcoin, network
          difficulty, the machine’s efficiency, and, most of all, your electricity rate. A very efficient machine on expensive
          power can lose to an older machine on cheap power.
        </P>
        <P>
          What you can do is calculate it for any specific machine: add the purchase price, shipping, setup, and hosting or
          cooling costs, then divide by your expected daily net income (mining revenue minus electricity). For example, $4,000
          all-in and $8 a day net gives 500 days, or about 1.4 years.
        </P>
        <P>
          The problem is that revenue usually shrinks over time as difficulty rises and block rewards get cut, so a flat estimate
          is too rosy. A better approach is to enter declining cash flows for each period in the calculator, and to include the
          resale value of the hardware if you plan to sell it. Taxes matter too.
        </P>
      </Card>

      <Card title="Using This Payback Period Calculator">
        <H3>How to use it, step by step</H3>
        <List ordered items={[
          ["Enter the initial investment.", "Include everything it takes to get started: purchase price, installation, setup, and working capital. Subtract anything you’ll recover right away, like the sale of an old asset."],
          ["Add your cash flows.", "Use net figures for each period (inflows minus the ongoing costs tied to the project). Include zero or negative years where they’re expected."],
          ["Set your discount rate.", "Use your cost of capital or the return you’d expect elsewhere on something with similar risk."],
          ["Read the results.", "You’ll get the payback period, the discounted payback period, and the IRR, with the schedule beneath them."],
        ]} />
        <P>
          If you’re not sure about your estimates, run a cautious case and an optimistic one. The range tells you more than any
          single number.
        </P>

        <H3>Working with growing and irregular cash flows</H3>
        <P>
          Real cash flows are messy. A new product starts slow and picks up. Rent goes up each year. A big repair lands in year
          six. The calculator handles steady growth, where you set a starting cash flow and a growth rate, and fully custom
          flows, where you enter each period yourself. Many simpler tools only take one repeating number, which gives misleading
          results anytime the income changes.
        </P>

        <H3>Reading the yearly schedule</H3>
        <P>
          The schedule shows each period’s cash flow, cumulative cash flow, discounted cash flow, and cumulative discounted cash
          flow. It’s useful for more than just checking the math. You can see which year crosses zero, notice a year that drags
          the total back down, and show someone else exactly how you got your number. If you need to defend a result to a boss,
          a partner, or a lender, the table is what they’ll want to see.
        </P>

        <H3>IRR: the return rate behind the payback</H3>
        <P>
          IRR is the discount rate at which the present value of all future inflows equals your initial investment, which means
          the rate that makes NPV zero. It’s the annualized return the project earns on your money.
        </P>
        <P>
          It sits next to payback because they catch different problems. A project can pay back fast and still earn a poor
          overall return if the cash dries up right after break-even. Another can take longer but earn a lot more in total. If
          your IRR is above your required rate, the project clears the bar. If it’s below, your money would probably work harder
          somewhere else.
        </P>

        <H3>Doing it in Excel or Google Sheets</H3>
        <P>
          There’s no built-in “payback” function in Excel, but it takes about five minutes to set up. Put your cash flows in a
          column, with the initial investment as a negative number in year 0. Add a cumulative column. Then use this for the
          fractional payback once you’ve found the year before the cumulative turns positive:
        </P>
        <Formula>= year_before + ABS(cumulative_at_that_year) / cash_flow_next_year</Formula>
        <P>
          For discounted payback with level cash flows, =NPER(rate, annual_cash_flow, -investment) gives you the same number as
          the logarithm formula. For IRR, use =IRR(range_of_cash_flows). Use the calculator to double-check your spreadsheet.
          If the numbers don’t match, there’s usually a sign error or a missing year.
        </P>

        <H3>Common mistakes to avoid</H3>
        <List items={[
          ["", "Using revenue instead of net cash flow."],
          ["", "Forgetting working capital, installation, or training costs in the initial investment."],
          ["", "Using profit instead of cash flow, especially when depreciation is involved."],
          ["", "Using an annual discount rate with monthly periods."],
          ["", "Leaving out taxes on larger projects."],
          ["", "Treating one forecast as a fact. Run in the worst case."],
          ["", "Making a final decision on payback alone."],
        ]} />
      </Card>

      <Card title="Free, Accurate and Private">
        <P>
          This calculator is free to use, with no hidden charges and no paywall on the schedule, the discounted payback, or the
          IRR. The calculations follow standard finance formulas, so the results should match what you’d get from a textbook or
          a spreadsheet, and the yearly schedule lets you check every step. The results depend entirely on what you enter, so
          give your cash flow assumptions a second look before relying on them for a big decision. The numbers you enter are
          used only to produce your results.
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
