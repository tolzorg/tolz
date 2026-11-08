import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an ROI calculator?",
    a: "It measures how much an investment earned or lost compared to its cost. You enter what you invested and what you got back, and it shows your gain or loss and your return as a percentage.",
  },
  {
    q: "How do you calculate ROI?",
    a: "Subtract the cost of the investment from the gain, divide by the cost, and multiply by 100. If you turn $2,000 into $2,600, that’s (600 ÷ 2,000) × 100 = 30%.",
  },
  {
    q: "What is annualized ROI?",
    a: "It’s the yearly rate of return that would produce your total result over the time you held the investment, with compounding. It makes it possible to compare investments held for different lengths of time.",
  },
  {
    q: "What’s the difference between ROI and ROR?",
    a: "ROR (rate of return) usually comes with a time period, like per year. Basic ROI doesn’t. Annualized ROI turns ROI into a yearly rate.",
  },
  {
    q: "What’s the difference between ROE and ROI?",
    a: "ROI measures the return on any investment. ROE, return on equity, is a company measure: net income divided by shareholders’ equity.",
  },
  {
    q: "Can I calculate ROI with dates?",
    a: "Yes. Enter the start and end dates and the calculator works out the time between them. You can also enter the investment length directly.",
  },
  {
    q: "Can ROI be negative?",
    a: "Yes. A negative ROI means you lost money. Buying at $5,000 and selling at $4,200 is a −16% ROI.",
  },
  {
    q: "What is a good ROI?",
    a: "It depends on risk and time. A good result usually beats inflation and what you could earn from a comparable alternative. Long-term stock market averages are a common benchmark.",
  },
  {
    q: "Is a 30% ROI realistic?",
    a: "A 30% total return over several years is realistic. A steady 30% every year isn’t, and promises of that should be treated with suspicion.",
  },
  {
    q: "How do you calculate ROI on a marketing campaign?",
    a: "Take the profit from the campaign (not just revenue), subtract the total campaign cost, and divide by that cost. Include creative, tools, and agency fees in the cost.",
  },
  {
    q: "Should I include fees and taxes?",
    a: "If you want a net result, yes. Add costs to the amount invested, and subtract taxes and fees from what you got back. If you leave them out, you get a gross ROI that’ll look better than your real outcome.",
  },
  {
    q: "What are the limitations of ROI?",
    a: "It ignores risk, doesn’t capture the timing of cash flows, depends on how you define cost and gain, and in its basic form it doesn’t account for time. That’s why annualized ROI, NPV, and IRR are useful alongside it.",
  },
  {
    q: "How much money do I need to live off investments?",
    a: "A common rule of thumb is about 25 times your yearly spending, based on a 4% withdrawal rate. Taxes, health insurance, and market swings can change that number.",
  },
  { q: "Is this ROI calculator free?", a: "Yes, it’s free to use, and you don’t need to sign up." },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "Can ROI be negative?": "Yes. A negative ROI means you lost money. Buying at $5,000 and selling at $4,200 is a -16% ROI.",
  "Should I include fees and taxes?": "If you want a net result, yes. Add costs to the amount invested, and subtract taxes and fees from what you got back. If you leave them out, you get a gross ROI that will look better than your real outcome.",
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) }));

const METRIC_HEADERS = ["Metric", "What it measures", "Typical use"];
const METRIC_ROWS = [
  ["ROI", "Net gain vs. cost of an investment", "Almost any investment or spend"],
  ["ROR", "Return over a stated period", "Comparing returns per year, per month"],
  ["ROE", "Net income vs. shareholders’ equity", "Judging a company’s profitability"],
  ["ROIC", "Operating profit vs. capital invested in the business", "Judging how well a business uses its capital"],
  ["IRR", "Rate that makes the NPV of cash flows zero", "Investments with cash flows at different times"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const firstH3 = { ...h3Style, marginTop: 0 };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top" }}>
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

export default function RoiCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This ROI Calculator Does</h2>
        <p style={pStyle}>
          You give it three things: the amount you put in, the amount you got out, and the time period. It gives you three
          numbers back.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Gain or loss.</strong> The dollar difference between what you ended up with and what you started with.</li>
          <li style={liStyle}><strong>Total ROI.</strong> That difference as a percentage of your original investment.</li>
          <li style={lastLi}><strong>Annualized ROI.</strong> The yearly rate that would produce the same result over the time you actually held the investment.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That third number is the one a lot of basic return on investment calculators leave out, and it’s the one that makes
          comparisons fair. A 40% return sounds great until you find out it took nine years. Annualized ROI puts every
          investment on the same yearly scale, so a six-month flip and a decade-long hold can sit side by side.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the ROI Calculator</h2>
        <ol style={listGapStyle}>
          <li style={liStyle}><strong>Enter the amount invested.</strong> Count everything you paid to get in: the purchase price, plus commissions, closing costs, setup fees, or ad creative. If it came out of your pocket to start the thing, it belongs here.</li>
          <li style={liStyle}><strong>Enter the amount returned.</strong> That’s what you sold for, what it’s worth now, or what it brought in. If you got money along the way (dividends, rent, interest), add it to this number so you’re not shortchanging the result.</li>
          <li style={liStyle}><strong>Set the time period.</strong> Pick start and end dates if you know them, or type in the investment length if you’re just running a scenario. The calculator turns the gap into years for you, so odd stretches like 14 months and 12 days aren’t a problem.</li>
          <li style={lastLi}><strong>Read your results.</strong> You’ll see gain or loss, total ROI, and annualized ROI.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing worth knowing: the time period doesn’t change total ROI at all. It only changes the annualized figure. If
          you’re comparing two investments, lean on the annualized number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is ROI?</h2>
        <p style={pStyle}>
          ROI stands for return on investment. It’s a ratio: the net gain from an investment divided by what the investment
          cost you. Finance people usually write it as a percentage, so a result of 0.1 gets reported as 10%.
        </p>
        <p style={pStyle}>
          It’s one of the most common profitability measures out there, and the reason is pretty simple. The inputs are easy
          to get, the math is something you can do on a napkin, and the answer is easy to read. Because it’s a percentage, you
          can also compare a $2,000 investment with a $200,000 one without much fuss.
        </p>
        <p style={pStyle}>
          And ROI isn’t picky about what it measures. It works on stocks and rental houses, but also on a new hire, a piece of
          equipment, an ad budget, or a food truck. If something has a cost and might produce a gain, you can put an ROI on
          it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One warning before we go further: “ROI” gets used loosely. In some conversations people mean return on invested
          capital (ROIC), in others it’s average rate of return, return on equity, or even earnings per share. This page, and
          the calculator above, use the simple, classic version: net gain divided by cost. Whenever you see an ROI number
          somewhere else, it’s smart to ask how it was calculated.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The ROI Formula</h2>
        <p style={pStyle}>The formula is short:</p>
        <div style={formulaStyle}>ROI = (Gain from Investment − Cost of Investment) ÷ Cost of Investment</div>
        <p style={pStyle}>
          Multiply by 100 to get a percentage. If you like variables, it’s often written as ROI = (G − C) ÷ C.
        </p>
        <p style={pStyle}>
          The top part is your net gain. Dividing by cost shows how big that gain is compared to what you put at risk. If the
          top part comes out negative, you lose money, and the ROI is negative too.
        </p>
        <p style={pStyle}>
          Quick example. Say you buy a used food truck and equipment for $40,000. Over the next two years it brings in $58,000
          in profit. That’s (58,000 − 40,000) ÷ 40,000 = 0.45, so a 45% ROI.
        </p>

        <h3 style={h3Style}>Working the formula backward</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can flip it around when you’ve got a target in mind. If you want a 60% ROI on that $40,000, you need to end up
          with $64,000. In formula terms: required gain = cost × (1 + target ROI). It’s a handy way to sanity-check a plan
          before you commit. If the project would need to bring in more than seems realistic, you’ve learned something for
          free.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>ROI vs. ROR: What’s the Difference?</h2>
        <p style={pStyle}>
          People mix these up all the time, and sometimes they really are used interchangeably. But there’s a useful
          distinction. ROR, or rate of return, normally comes attached to a time period, like “8% per year.” ROI, in its plain
          form, doesn’t say anything about time. It’s just the total result.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That’s the whole reason annualized ROI exists. It takes the timeless ROI and turns it into something closer to a
          rate of return.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Annualized ROI: Why Time Matters</h2>
        <p style={pStyle}>
          Here’s the problem with plain ROI. Imagine you’ve got two options. A diamond that would return 1,000% and a piece of
          land that would return 50%. The diamond looks like a no-brainer.
        </p>
        <p style={pStyle}>
          Now add the timelines. The diamond takes 50 years to get there. The land gets you your 50% in six months. Suddenly it
          looks very different. Annualized, the diamond works out to about 4.9% a year. The land, if you could keep repeating
          that pace, is around 125% a year. (You usually can’t repeat it, which we’ll get to.)
        </p>
        <p style={pStyle}>The annualized formula is:</p>
        <div style={formulaStyle}>Annualized ROI = [(Final Value ÷ Initial Investment)^(1 ÷ Years) − 1] × 100</div>
        <p style={pStyle}>
          It uses compounding, so it’s a geometric average rather than a simple one. That’s why you can’t just divide total
          ROI by the number of years. A 35% total return over three years isn’t 11.67% a year. It’s about 10.5%, because each
          year’s growth builds on the last.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A caution on short holding periods. If you make 10% in two months, annualizing that gives you a huge number. But it
          only tells you the pace, not what you’ll earn over a year. Opportunities that are good rarely repeat on schedule. Use
          annualized numbers from short periods to compare, not to forecast.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>ROI Calculation Examples</h2>
        <p style={pStyle}>
          <strong>Example 1: Three years, steady growth.</strong> You invest $10,000 and it’s worth $13,500 three years later.
          Gain: $3,500. Total ROI: 35%. Annualized ROI: about 10.52%.
        </p>
        <p style={pStyle}>
          <strong>Example 2: Six months, strong result.</strong> You put in $10,000 and it turns into $12,000 in half a year.
          That’s a 20% total ROI. Annualized, it’s 44%, because 1.20 squared is 1.44. Looks amazing, but it’s a pace, not a
          promise.
        </p>
        <p style={pStyle}>
          <strong>Example 3: A loss.</strong> You invest $5,000 and eventually sell for $4,200 after two years. You’re down
          $800, which is a −16% ROI, or about −8.35% annualized.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Example 4: Same ROI, very different deals.</strong> Two people each earn 50% on their money. One does it in
          18 months and the other in six years. The first has an annualized ROI of about 31%. The second is about 7%. Same
          headline number, completely different deals.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Counts as “Cost” and “Gain”?</h2>
        <p style={pStyle}>The formula is easy. The hard part is deciding what goes into it.</p>
        <p style={pStyle}>
          Say two investors look at the same rental property. One counts the purchase price only. The other adds closing
          costs, repairs, property taxes, insurance, and years of maintenance. They’ll get two different ROIs from the same
          house, and both think they’re right.
        </p>
        <p style={pStyle}>
          Stocks have the same issue. Does your ROI include capital gains tax? What about trading fees? Dividends you got along
          the way? And what about cash you added or pulled out mid-way?
        </p>
        <p style={pStyle}>
          There’s no official answer. What matters is being consistent and being honest about what you included. If you’re
          comparing options, count the same things for each. If you want a net result, put all your costs on the “invested”
          side and all your income on the “returned” side. If you want a quick gross figure, leave the extras out, but know
          that it’ll look better than reality.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some things are really hard to pin down, like advertising a product. You can’t always draw a straight line from an ad
          to a sale, so people estimate the benefit using incremental sales or brand awareness. That’s fine, as long as
          everyone knows it’s an estimate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>ROE vs. ROI</h2>
        <p style={pStyle}>
          These two get confused because they sound alike and both show up in investing talk. They answer different
          questions.
        </p>
        <p style={pStyle}>
          <strong>ROI</strong> asks: “How much did I make on what I put in?” You can apply it to practically any investment.
        </p>
        <p style={pStyle}>
          <strong>ROE</strong>, return on equity, is a company metric. It’s net income divided by shareholders’ equity, and it
          tells you how well a business turns its owners’ money into profit. A company with $2 million in net income and $10
          million in equity has a 20% ROE.
        </p>
        <p style={pStyle}>A few differences worth keeping in mind:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>ROI is flexible. You decide what goes in. ROE comes from a company’s financial statements.</li>
          <li style={liStyle}>ROE can be pumped up by debt. If a company borrows heavily, equity shrinks, and the ROE looks better without the business actually being stronger.</li>
          <li style={lastLi}>As a stock investor, you might look at a company’s ROE to judge the business, then use ROI to see how your own purchase did.</li>
        </ul>
        <DataTable headers={METRIC_HEADERS} rows={METRIC_ROWS} />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>ROI and Financial Decisions</h2>
        <p style={pStyle}>
          ROI shines as a first filter. Before you spend hours digging into an opportunity, a quick ROI tells you whether it’s
          even in the ballpark. A project that needs $200,000 to return $210,000 over five years isn’t worth your weekend, and
          you learn that in about ten seconds.
        </p>
        <p style={pStyle}>Here’s how people actually use it:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Comparing options.</strong> Same money, different choices. Annualized ROI lets you line them up.</li>
          <li style={liStyle}><strong>Deciding whether to continue.</strong> If a project’s ROI is trending below what you could earn elsewhere, that’s a signal.</li>
          <li style={liStyle}><strong>Justifying a budget.</strong> Managers and founders use ROI to show why a spend makes sense.</li>
          <li style={lastLi}><strong>Reviewing past decisions.</strong> Looking back at what actually happened is one of the best ways to improve your judgment.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Where it gets tricky is treating ROI as the whole story. A higher ROI doesn’t automatically win. A lower-return
          option with way less risk, more flexibility, or better timing can be the smarter pick. ROI tells you what a choice
          has earned, or is expected to earn. It doesn’t tell you how likely you are to get there.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Advantages and Disadvantages of ROI</h2>
        <h3 style={firstH3}>Advantages</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}>It’s simple. Two numbers and basic division.</li>
          <li style={liStyle}>It’s universal. You can use it on a stock, a campaign, or a truck.</li>
          <li style={liStyle}>It’s easy to communicate. “We got 45%” needs no explanation.</li>
          <li style={liStyle}>It makes different-sized investments comparable.</li>
          <li style={lastLi}>It’s quick. You can run dozens of scenarios in minutes.</li>
        </ul>
        <h3 style={h3Style}>Disadvantages</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>No time element in the basic version, which is why annualized ROI matters.</li>
          <li style={liStyle}>No risk adjustment. A safe 8% and a risky 8% look identical.</li>
          <li style={liStyle}>Inconsistent definitions. Different people count costs and gains differently, so comparisons between people can be shaky.</li>
          <li style={liStyle}>Easy to manipulate. Leave out a few costs and almost any project looks good.</li>
          <li style={liStyle}>Ignores cash flow timing. Money received sooner is worth more than money received later, and plain ROI doesn’t care.</li>
          <li style={lastLi}>Harder to use on intangible benefits like brand awareness or employee morale.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Limitations of Using ROI?</h2>
        <p style={pStyle}>The disadvantages above are the headline version. Here are the limitations that actually bite in real decisions:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Risk gets ignored.</strong> ROI tells you what a result was, not how bumpy the ride was or how likely a wipeout was. If you’re comparing a stable bond with a speculative small-cap stock, the same ROI doesn’t mean the same quality of outcome.</li>
          <li style={liStyle}><strong>Cash flow timing is invisible.</strong> Suppose you put in money at different times or took money out along the way. One ROI number can’t capture that. Metrics like IRR and NPV exist for this reason.</li>
          <li style={liStyle}><strong>It’s backward-looking, and forecasts are only as good as their assumptions.</strong> A projected ROI is built on guesses about future revenue and costs. Small changes to those guesses can swing the number a lot.</li>
          <li style={liStyle}><strong>It doesn’t account for opportunity cost.</strong> If your 6% return came from tying up money that could’ve earned 9% somewhere similar, you didn’t really win.</li>
          <li style={liStyle}><strong>Inflation and taxes shrink real returns.</strong> A 3% return in a year with 4% inflation means you lost buying power.</li>
          <li style={lastLi}><strong>It doesn’t capture non-financial value.</strong> Plenty of worthwhile things, such as safety upgrades, training, or customer goodwill, are hard to fit into an ROI.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>None of this means you should skip ROI. It means you shouldn’t stop there.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Calculate ROI on Marketing Campaigns?</h2>
        <p style={pStyle}>
          Marketing is where ROI gets used and misused the most. The basic idea is the same: (profit from the campaign −
          campaign cost) ÷ campaign cost. But the details matter.
        </p>
        <p style={pStyle}>
          <strong>Use profit, not revenue.</strong> This is the most common mistake. Revenue ignores what it cost to make and
          deliver the product.
        </p>
        <p style={pStyle}>
          Here’s a real-looking example. You spend $6,000 on ads and $1,500 on creative and landing pages, so $7,500 total. The
          campaign brings in $18,000 in sales. Your cost of goods and fulfillment is about 40% of revenue, which is $7,200.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Gross profit from the campaign: $18,000 − $7,200 = $10,800</li>
          <li style={liStyle}>Net gain after campaign costs: $10,800 − $7,500 = $3,300</li>
          <li style={lastLi}>Marketing ROI: $3,300 ÷ $7,500 = 44%</li>
        </ul>
        <p style={pStyle}>
          If you’d used revenue instead, you’d have said (18,000 − 7,500) ÷ 7,500 = 140%. That looks great and is completely
          misleading.
        </p>
        <p style={pStyle}>A few more things to keep in mind:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>ROI vs. ROAS.</strong> Return on ad spend is revenue divided by ad spend. In the example above, ROAS on just the ad budget would be 3.0x. It’s useful for tuning ad accounts, but it doesn’t tell you whether you made money.</li>
          <li style={liStyle}><strong>Include all costs.</strong> Agency fees, software, freelancers, and staff time all count if you want a true number.</li>
          <li style={liStyle}><strong>Think about customer lifetime value.</strong> If a new customer buys again, the first-sale ROI undersells the campaign. Using lifetime value gives a fairer picture, but be careful and use realistic repeat rates.</li>
          <li style={liStyle}><strong>Attribution is messy.</strong> Someone might see an ad, hear about you from a friend, then search your name. Decide on an attribution approach up front and stick with it so month-to-month comparisons are consistent.</li>
          <li style={lastLi}><strong>Set a time window.</strong> Some campaigns pay back in days, others take months. Measure over a period that matches your sales cycle.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Might Need an ROI Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Stocks, ETFs, and funds.</strong> Check how a position did, compare holdings bought at different times, and include dividends for a full picture.</li>
          <li style={liStyle}><strong>Real estate.</strong> Rentals and flips. Add purchase costs, renovations, and net sale proceeds to what you invested and returned.</li>
          <li style={liStyle}><strong>Small business purchases.</strong> Equipment, software, a new location, or a hire. Estimate the extra income or savings, then compare to cost.</li>
          <li style={liStyle}><strong>Marketing and sales.</strong> Campaigns, events, sponsorships, and tools.</li>
          <li style={liStyle}><strong>Education.</strong> Courses, certifications, or degrees. More on that below.</li>
          <li style={liStyle}><strong>Side projects and hobbies that make money.</strong> Selling on Etsy, reselling, or flipping furniture. It’s good to know if it’s actually worth your money.</li>
          <li style={lastLi}><strong>Personal records.</strong> Track how decisions turned out, so you’re not relying on memory.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Best ROI Majors in 2027</h2>
        <p style={pStyle}>
          Nobody can give you a certified ranking for 2027 yet, because the job market for new graduates for that year hasn’t
          played out. What you can do is look at what long-running data tells us and then run your own numbers.
        </p>
        <p style={pStyle}>
          Research from sources like the Federal Reserve Bank of New York and Georgetown University’s Center on Education and
          the Workforce has pointed, year after year, to the same general pattern. Majors in engineering, computer science and
          related tech fields, nursing and other health fields, and business-related areas like finance and accounting tend
          to land at the high end for earnings. Majors in the arts, education, and some social services fields tend to earn
          less on average, though that varies a lot by what you actually do with the degree.
        </p>
        <p style={pStyle}>A few things are worth keeping in mind:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Employment and demand shift.</strong> Entry-level hiring in tech has been more uneven in recent years than it was a decade ago. Healthcare roles, on the other hand, have had steady demand because of an aging population. Check recent job data for the field you’re considering, not what was true ten years ago.</li>
          <li style={liStyle}><strong>What you pay matters as much as what you earn.</strong> A strong major at a very expensive school with heavy loans can have a worse ROI than a solid major at an in-state public school.</li>
          <li style={liStyle}><strong>The major is only part of it.</strong> Internships, location, and the specific job you land often matter as much as the title on the degree.</li>
          <li style={lastLi}><strong>Averages hide a lot.</strong> The spread inside any major is wide.</li>
        </ul>
        <p style={pStyle}>
          To run your own numbers, treat the degree like any other investment. Add up the total cost: tuition, fees, books,
          living costs you wouldn’t otherwise have, and the wages you gave up while studying. Then estimate the extra earnings
          compared to what you’d probably make without the degree, over the years you expect to work.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, if the total cost comes to $120,000 and you estimate $20,000 a year in extra earnings, that’s $600,000
          over 30 years. The simple ROI is (600,000 − 120,000) ÷ 120,000 = 400%. Plug the cost and total extra earnings into
          the calculator, set the time at 30 years, and you’ll get an annualized figure. Keep in mind that these dollars show
          up over decades, so inflation and taxes will take a bite. Be conservative with your guess about extra earnings.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Making a 30% Return on Investment Realistic?</h2>
        <p style={pStyle}>It depends on whether you mean 30% total or 30% every year.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>30% total over several years</strong> is very doable. For example, 30% over three years is about 9% a year. That’s in line with decent long-term stock market results.</li>
          <li style={liStyle}><strong>30% in a single year</strong> happens sometimes. Stock indexes have had years with gains in that range, and individual stocks, small businesses, and property flips can do it too. It’s usually luck plus risk, though, and the same strategies can lose just as big the next year.</li>
          <li style={lastLi}><strong>30% every year, year after year</strong> is a different story. A broad stock market index has historically averaged high single digits to around 10% a year over long periods. Almost nobody holds 30% annually for long. To see why, take $10,000 and compound it at 30% for 20 years. You’d end up with roughly $1.9 million. That’s why anyone promising steady 30% returns with no downside should make you suspicious. That pitch is a classic sign of a scam or a Ponzi-type scheme.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you’re chasing a high return, a few questions are worth asking: How is the return generated? What’s the
          worst-case scenario? Can I lose more than I put in? Who gets paid first, and how? If the answers are vague, walk
          away.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Quit Your Job and Live Entirely Off Investments?</h2>
        <p style={pStyle}>
          Some people do. The math is simple enough to run yourself, and it starts with the ROI idea in reverse: how big does
          the pile need to be to produce the income you need?
        </p>
        <p style={pStyle}>
          A common rule of thumb is the 4% rule. The idea is that if you withdraw about 4% of your portfolio in the first year
          and adjust for inflation after that, the money has historically had a good shot at lasting around 30 years. The
          flip side is that you need roughly 25 times your annual spending.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Want $50,000 a year? That’s about $1.25 million.</li>
          <li style={liStyle}>Want $60,000 a year? About $1.5 million.</li>
          <li style={lastLi}>Want $100,000 a year? About $2.5 million.</li>
        </ul>
        <p style={pStyle}>
          For a sense of how long it takes to build: investing $2,000 a month for 20 years at a 7% average annual return gets
          you to roughly $1 million. Returns aren’t smooth, though, so that’s an average, not a guarantee.
        </p>
        <p style={pStyle}>Things that can mess up the plan:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Sequence of returns risk.</strong> A big market drop in your first few years of withdrawals hurts a lot more than the same drop later.</li>
          <li style={liStyle}><strong>Taxes.</strong> Withdrawals from pre-tax accounts and capital gains get taxed, so what you can spend is lower than what you withdraw.</li>
          <li style={liStyle}><strong>Health insurance.</strong> If you retire before Medicare, this can be one of the largest costs.</li>
          <li style={liStyle}><strong>Retiring earlier than 30 years.</strong> If you’ll need the money for 40 or 50 years, many people use a lower withdrawal rate like 3.5% or less.</li>
          <li style={lastLi}><strong>Spending changes.</strong> Your real budget might shift a lot from year to year.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Plenty of people who leave a full-time job end up with some part-time or flexible income, which makes the plan far
          less fragile. If this is a goal, a fee-only financial planner can run your actual numbers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>One Piece of Investing Advice Everyone Should Know</h2>
        <p style={pStyle}>
          If we had to pick one, it’d be this: costs and time do most of the work, and you can control both.
        </p>
        <p style={pStyle}>
          Fees look small and aren’t. Say you invest $10,000 for 30 years and the market gives you 7% a year before costs.
          With a 0.1% annual fee, you end up with about $74,000. With a 1% annual fee, you end up with about $57,000. That’s
          roughly $16,500 lost to fees, from a difference that sounds tiny.
        </p>
        <p style={pStyle}>
          Time works the same way in your favor. Money that compounds for 30 years usually beats money that compounds for 20
          years, even with a lower return. Starting early and staying invested often matters more than finding the perfect
          investment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And since you’re here: when you use an ROI calculator, don’t just look at the percentage. Look at the annualized
          number, ask what’s included, and think about the risk you took to get it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business Questions Where ROI Isn’t Enough</h2>
        <p style={pStyle}>
          This part is for people making bigger, more complicated business decisions. If you’re just checking a stock or a
          campaign, feel free to skip it. These are questions that come up when the simple ROI isn’t enough, and each one
          shows a limit of the basic formula.
        </p>

        <h3 style={h3Style}>What Is a Project’s Net Present Value (NPV), Adjusted for the 2027 Cost of Capital?</h3>
        <p style={pStyle}>
          NPV fixes the timing problem. It discounts future cash flows back to today’s dollars, using a rate that reflects what
          your money could earn elsewhere or what it costs you to borrow and raise capital. The formula is the sum of each
          year’s cash flow divided by (1 + discount rate) raised to that year, minus the initial investment.
        </p>
        <p style={pStyle}>
          I can’t give you one number for the 2027 cost of capital, because it depends on the company, the industry, and
          interest rates when you read this. Instead, here’s how to choose it. Start with a current risk-free rate, usually
          the yield on U.S. Treasuries with a similar maturity. Add a premium for the project’s risk. For a company, many
          people use the weighted average cost of capital (WACC), which blends the cost of debt and equity. Then test a few
          rates, not just one.
        </p>
        <p style={pStyle}>
          Example: you invest $100,000 and get $35,000 a year for four years. That’s $140,000 back, a 40% ROI, and it looks
          great.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>At an 8% discount rate, NPV is about +$15,900. It’s worth doing.</li>
          <li style={lastLi}>At a 15% discount rate, NPV is roughly zero. You’re basically breaking even.</li>
        </ul>
        <p style={pStyle}>
          Same project, same cash flows. The only thing that changed is how expensive your money is. That’s why a
          decent-looking ROI isn’t enough, and why checking different rates is smart.
        </p>

        <h3 style={h3Style}>How Does the Fast Obsolescence of AI Infrastructure Affect Long-Term Net Return?</h3>
        <p style={pStyle}>
          Hardware that gets outdated quickly changes the math in a big way. Servers, accelerators, and networking gear can
          lose competitive value in just a few years, even if they still work. Two things go wrong when people use simple
          ROI:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>They use a depreciation schedule instead of real useful life.</strong> If the books say five years but the equipment is only competitive for three, the later years of projected income may never happen.</li>
          <li style={lastLi}><strong>They forget the replacement cost.</strong> If you’ll have to buy new gear to stay in the game, that spend belongs in the investment.</li>
        </ul>
        <p style={pStyle}>
          Example with made-up numbers: a $2 million cluster produces $900,000 a year in net cash flow. If it holds up for five
          years, that’s $4.5 million back. If it’s really only useful for three years, that’s $2.7 million, and the ROI falls
          from 125% to 35%. If you need $1.5 million in replacements at year three to keep the revenue going, the longer-term
          return falls even more.
        </p>
        <p style={pStyle}>
          Practical fixes: use the shorter realistic useful life, model a resale or salvage value (and keep it low), include
          refresh costs, and run a “what if prices drop 30%” scenario, because pricing for this kind of capacity can fall fast
          as supply increases.
        </p>

        <h3 style={h3Style}>What Is the Exact Cash-on-Cash Payback Period, Excluding Speculative Terminal Value?</h3>
        <p style={pStyle}>
          Cash-on-cash return looks only at actual cash going in and actual cash coming out in a year. It’s popular in real
          estate because it ignores paper gains. The payback period then asks how many years of that cash it takes to get
          your money back.
        </p>
        <p style={pStyle}>Here’s the process, and it’s pretty strict by design:</p>
        <ol style={listGapStyle}>
          <li style={liStyle}>Add up all the cash you put in: down payment, closing costs, repairs, reserves.</li>
          <li style={liStyle}>Calculate annual cash flow after all costs: debt payments, taxes, insurance, maintenance, vacancy.</li>
          <li style={liStyle}>Divide cash invested by annual cash flow.</li>
          <li style={lastLi}>Leave out any sale value, appreciation, or “exit” assumption.</li>
        </ol>
        <p style={pStyle}>
          Example: you buy a $300,000 rental with $60,000 down, $9,000 in closing costs, and $11,000 in repairs. Cash invested
          is $80,000. After everything, you net $6,400 a year. Cash-on-cash return is 8%, and the payback period is 80,000 ÷
          6,400 = 12.5 years, without counting on a sale.
        </p>
        <p style={pStyle}>
          If the deal only works when you assume a big sale price in year ten, that’s a sign the cash flow alone isn’t strong
          enough. If you do want to include a sale, use the ROI calculator with the final sale proceeds, but keep it separate
          from this “cash only” view so you know which part of your return is real money you’re getting, and which is a
          forecast.
        </p>

        <h3 style={h3Style}>How Do Local Supply Chain Redundancies Change Upfront Capital Spending vs. Operational Risk?</h3>
        <p style={pStyle}>
          Backup suppliers, extra inventory, a second warehouse, or a nearby production site all cost real money upfront.
          Their payoff shows up as fewer disasters. So the ROI is to avoid losses, which makes it harder to see.
        </p>
        <p style={pStyle}>One way to put numbers on it is expected loss. Multiply the chance of a disruption by its cost.</p>
        <p style={pStyle}>
          Example: suppose there’s a 10% chance each year of a supply disruption that costs your business $1.5 million in lost
          sales and rush fees. That’s an expected annual loss of $150,000. A $400,000 investment in a second local supplier and
          extra warehouse space cuts the chance to 3%, which brings expected loss down to $45,000. That’s $105,000 a year
          saved. If the setup costs $30,000 a year to maintain, the net benefit is $75,000 a year.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Payback: 400,000 ÷ 75,000 = about 5.3 years</li>
          <li style={lastLi}>Simple annual return on the spend: about 19%</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These numbers depend heavily on your probability guess, so test a few. Also consider benefits that aren’t in the
          math, like keeping key customers during a crunch or shorter delivery times, and costs that are, like tied-up cash
          in inventory. You’ll find out quickly if the case only works under optimistic assumptions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Simple, and Reliable</h2>
        <p style={pStyle}>
          The ROI calculator on Tolz is free. You don’t need an account, and there are no hidden charges. It only asks for what
          it needs to do the math: the amounts and the time period.
        </p>
        <p style={pStyle}>
          On accuracy: it uses the standard ROI and annualized ROI formulas shown on this page. If you want to check a result
          by hand, you can. That’s a good habit, especially for decisions that matter.
        </p>
        <p style={pStyle}>
          The output depends on what you enter. If you leave out fees, taxes, or income, the result won’t reflect them. Take a
          minute to check your inputs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool and page are for information and planning. They’re not financial, tax, or investment advice. For big
          decisions, talk to a qualified professional.
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
