import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an annuity calculator?",
    a: "It estimates what a series of regular deposits, plus any starting amount, will be worth later at a given interest rate. You see the ending balance, your total contributions, and the interest earned.",
  },
  {
    q: "How do I calculate the future value of an annuity?",
    a: "For an ordinary annuity, use FV = PMT × [((1 + r)ⁿ − 1) / r], then add the starting principal grown by P × (1 + r)ⁿ. For an annuity due, multiply the payment portion by (1 + r). The calculator does this for you.",
  },
  {
    q: "What's the difference between an annuity due and an ordinary annuity?",
    a: "Timing. An annuity due takes payments at the start of each period, and an ordinary annuity takes them at the end. Annuity due deposits earn one extra period of interest, so the ending balance is higher.",
  },
  {
    q: "Which is better, annuity due or ordinary annuity?",
    a: "For a saver, annuity due grows a bit more. The right one for your calculation is whichever matches when your money really moves.",
  },
  {
    q: "Can I enter both monthly and annual contributions?",
    a: "Yes. You can use a starting principal, an annual addition, and a monthly addition together in one projection.",
  },
  {
    q: "Does this calculator show how much monthly income I'd get?",
    a: "No. It covers accumulation only. Payout amounts depend on your age, the payout option, interest rates, and the insurer's terms, so you'd need a quote from a provider.",
  },
  {
    q: "How much does a $100,000 annuity pay per month?",
    a: "For a 65-year-old buying an immediate annuity, it's often in the range of $600 to $700 a month, though rates, age, and payout structure change that. Ask for current quotes.",
  },
  {
    q: "What's the difference between fixed and variable annuities?",
    a: "A fixed annuity pays a guaranteed rate. A variable annuity's value moves with the investments inside it, so the principal isn't protected, and fees tend to be higher.",
  },
  {
    q: "What's the difference between immediate and deferred annuities?",
    a: "An immediate annuity starts paying within about a year. A deferred annuity grows first and pays out at a later date you choose. This calculator is for the deferred, accumulation side.",
  },
  {
    q: "Can I take money out of an annuity early?",
    a: "Usually, but it can be expensive. Many contracts charge a surrender fee for several years, and taking earnings out before age 59½ can add a 10% IRS additional tax plus regular income tax.",
  },
  {
    q: "Can I roll a 401(k) or IRA into an annuity?",
    a: "Yes, a rollover into an annuity can be done without tax if it's handled properly. A direct transfer between institutions is generally the safest way to avoid mistakes with the 60-day rule.",
  },
  {
    q: "Are annuity fees included in the results?",
    a: "Only if you include them. Subtract your annual fees from the interest rate before you enter it to get a net-of-fees projection.",
  },
  {
    q: "How accurate is an annuity calculator?",
    a: "The math is exact for what you enter. How realistic it is depends on your rate, contribution habits, and time frame, and taxes and inflation aren't included unless you adjust for them.",
  },
  {
    q: "Is the annuity calculator free?",
    a: "Yes. There's no charge for the results or the accumulation schedule.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "What is an annuity calculator?",
    a: "It estimates what a series of regular deposits, plus any starting amount, will be worth later at a given interest rate. You see the ending balance, your total contributions, and the interest earned.",
  },
  {
    q: "How do I calculate the future value of an annuity?",
    a: "For an ordinary annuity, use FV = PMT × [((1 + r)^n − 1) / r], then add the starting principal grown by P × (1 + r)^n. For an annuity due, multiply the payment portion by (1 + r). The calculator does this for you.",
  },
  {
    q: "What's the difference between an annuity due and an ordinary annuity?",
    a: "Timing. An annuity due takes payments at the start of each period, and an ordinary annuity takes them at the end. Annuity due deposits earn one extra period of interest, so the ending balance is higher.",
  },
  {
    q: "Which is better, annuity due or ordinary annuity?",
    a: "For a saver, annuity due grows a bit more. The right one for your calculation is whichever matches when your money really moves.",
  },
  {
    q: "Can I enter both monthly and annual contributions?",
    a: "Yes. You can use a starting principal, an annual addition, and a monthly addition together in one projection.",
  },
  {
    q: "Does this calculator show how much monthly income I'd get?",
    a: "No. It covers accumulation only. Payout amounts depend on your age, the payout option, interest rates, and the insurer's terms, so you would need a quote from a provider.",
  },
  {
    q: "How much does a $100,000 annuity pay per month?",
    a: "For a 65-year-old buying an immediate annuity, it is often in the range of $600 to $700 a month, though rates, age, and payout structure change that. Ask for current quotes.",
  },
  {
    q: "What's the difference between fixed and variable annuities?",
    a: "A fixed annuity pays a guaranteed rate. A variable annuity's value moves with the investments inside it, so the principal is not protected, and fees tend to be higher.",
  },
  {
    q: "What's the difference between immediate and deferred annuities?",
    a: "An immediate annuity starts paying within about a year. A deferred annuity grows first and pays out at a later date you choose. This calculator is for the deferred, accumulation side.",
  },
  {
    q: "Can I take money out of an annuity early?",
    a: "Usually, but it can be expensive. Many contracts charge a surrender fee for several years, and taking earnings out before age 59½ can add a 10% IRS additional tax plus regular income tax.",
  },
  {
    q: "Can I roll a 401(k) or IRA into an annuity?",
    a: "Yes, a rollover into an annuity can be done without tax if it is handled properly. A direct transfer between institutions is generally the safest way to avoid mistakes with the 60-day rule.",
  },
  {
    q: "Are annuity fees included in the results?",
    a: "Only if you include them. Subtract your annual fees from the interest rate before you enter it to get a net-of-fees projection.",
  },
  {
    q: "How accurate is an annuity calculator?",
    a: "The math is exact for what you enter. How realistic it is depends on your rate, contribution habits, and time frame, and taxes and inflation are not included unless you adjust for them.",
  },
  {
    q: "Is the annuity calculator free?",
    a: "Yes. There is no charge for the results or the accumulation schedule.",
  },
];

const PAYOUT_HEADERS = ["Option", "How it works", "Monthly amount", "Fits best when"];
const PAYOUT_ROWS = [
  ["Single life", "Pays for your lifetime only, nothing after death", "Highest", "You're the only one relying on the income"],
  ["Joint life", "Pays until both spouses have died", "Lower", "A spouse would need income after you're gone"],
  ["Life with period certain", "Pays for life, with a guaranteed minimum term (like 10 years) so a beneficiary gets the remainder if you die early", "Slightly below single life", "You want income plus some legacy protection"],
  ["Period certain only", "Pays for a fixed number of years, then stops", "Depends on the term", "You need income for a specific stretch"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top", minWidth: j === 1 ? 200 : 110 }}>
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

export default function AnnuityCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Annuity Calculator Does</h2>
        <p style={pStyle}>
          This annuity calculator covers the accumulation phase. That's the stretch of time when you're paying
          money in and it's earning interest, before any income is paid back out to you. It takes three types of
          money (a starting principal, yearly additions, and monthly additions) and runs them together in one
          projection. You choose between an ordinary annuity and an annuity due, and that single choice can move
          your ending balance by a noticeable amount.
        </p>
        <p style={pStyle}>
          A lot of calculators make you pick one style of deposit. Either it's a lump sum, or it's a monthly
          payment, and if you want both you're stuck running two calculations and adding them up yourself. Real
          savings don't work that way. Somebody might open an account with $10,000 from an old savings pot, set up
          $400 a month, and drop in a $2,000 tax refund every spring. Putting all of that into a single annuity
          calculator gets you a number that actually looks like your life.
        </p>
        <p style={pStyle}>
          What you get back isn't one lonely total. You get the balance at each stage, how much of it came from
          your own deposits, and how much came from interest. Seeing those two pieces separate is where the
          calculator earns its keep.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing to be clear about up front: this tool projects growth. It doesn't estimate the monthly income
          an insurer would pay you later. We'll get to that difference further down, because it trips people up.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Annuity Calculator</h2>
        <p style={pStyle}>It takes maybe a minute once you've got your numbers handy.</p>
        <ol style={listGapStyle}>
          <li style={liStyle}><strong>Starting principal.</strong> Whatever's already in the account. Starting fresh? Put in zero.</li>
          <li style={liStyle}><strong>Annual addition.</strong> Any deposit you make once a year, like a bonus or a set yearly contribution. Skip it (leave zero) if you only deposit monthly.</li>
          <li style={liStyle}><strong>Monthly addition.</strong> What you plan to put in every month.</li>
          <li style={liStyle}><strong>Interest rate.</strong> Use the rate your provider quotes, or a conservative estimate if you're just planning.</li>
          <li style={liStyle}><strong>Number of years.</strong> How long you'll keep contributing.</li>
          <li style={liStyle}><strong>Annuity type.</strong> Ordinary annuity if deposits happen at the end of each period, annuity due if they happen at the start.</li>
          <li>Calculate and look through the result and the schedule.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's a habit worth building: change only one thing at a time. Bump the monthly amount by $100 and see
          what happens. Then reset it and add five years instead. Then try dropping the rate by a point. After three
          or four of these you'll know which lever moves your outcome the most, and it's usually not the one people
          expect.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Annuity Due vs. Ordinary Annuity</h2>
        <p style={pStyle}>
          The only real difference is when the deposit happens, but timing matters because interest is paid on
          time.
        </p>
        <p style={pStyle}>
          With an <strong>ordinary annuity</strong>, you pay at the end of each period. A deposit made on the last
          day of the month hasn't earned anything yet for that month. Loan payments work this way, and so do plenty
          of standard savings setups.
        </p>
        <p style={pStyle}>
          With an <strong>annuity due</strong>, you pay at the beginning of the period. A deposit made on the 1st
          earns interest for the whole month. Rent, insurance premiums, and a lot of automatic savings plans that
          pull money right after payday fit this pattern.
        </p>
        <p style={pStyle}>
          The math is simple. The future value of an annuity due equals the future value of the same ordinary
          annuity multiplied by (1 + the periodic rate). So each deposit basically gets one extra period of growth.
          Early on, the gap looks tiny. Over decades, with bigger balances, it turns into real money.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Not sure which to pick? Think about when the money actually moves. If the deposit hits the account at the
          start of the month, go with annuity due. If your deposit usually posts after interest is credited, or
          you're modeling a contract that pays in arrears, use ordinary. The annuity calculator makes it painless to
          run both and compare.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Numbers Are Calculated</h2>
        <p style={pStyle}>
          The annuity calculator uses standard time-value-of-money formulas. That means you can check any result
          against a finance textbook or a spreadsheet's FV function and get the same answer.
        </p>
        <p style={pStyle}>For an ordinary annuity, the recurring payments grow to:</p>
        <div style={formulaStyle}>FV = PMT × [((1 + r)ⁿ − 1) / r]</div>
        <p style={pStyle}>
          PMT is the payment per period, r is the interest rate per period, and n is the number of periods. Your
          starting principal grows on its own as P × (1 + r)ⁿ, and the two pieces get added together. For an
          annuity due, multiply the payment portion by (1 + r).
        </p>
        <p style={pStyle}>
          <strong>Example 1: starting with a lump sum.</strong> You've got $10,000 to start, you add $500 a month,
          and you earn 6% a year compounded monthly for 20 years. That's 0.5% per month over 240 months.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>The starting $10,000 grows to about $33,102.</li>
          <li style={liStyle}>The monthly deposits grow to about $231,020 (ordinary annuity).</li>
          <li style={liStyle}>Total: about $264,122.</li>
          <li>You put in $130,000 of your own money, so roughly $134,000 is interest.</li>
        </ul>
        <p style={pStyle}>
          Switch to annuity due and the deposit portion becomes about $232,175, for a total near $265,277. Same
          money in, same rate, and it's over $1,100 better just from paying on the 1st instead of the 30th.
        </p>
        <p style={pStyle}>
          <strong>Example 2: starting from zero.</strong> You start with nothing, add $300 a month, and earn 7% a
          year compounded monthly for 30 years. That's about 0.583% a month over 360 months.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Ordinary annuity: roughly $366,000.</li>
          <li style={liStyle}>Annuity due: roughly $368,100.</li>
          <li>You contributed $108,000, so about $258,000 is interest, more than twice what you put in.</li>
        </ul>
        <p style={pStyle}>
          That second example is why time matters so much. Interest earned in the last decade is bigger than
          interest earned in the first two decades combined. If you're weighing "start now with less" against
          "start later with more," run both. Starting earlier almost always wins by more than people guess.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick mental shortcut, by the way: the Rule of 72. Divide 72 by your annual rate and you get the rough
          number of years it takes money to double. At 6% that's about 12 years; at 8% it's 9. It won't replace the
          calculator, but it's a decent gut check on whether a result looks sane.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Accumulation Schedule</h2>
        <p style={pStyle}>
          The schedule breaks the whole projection into periods. Each row typically shows your opening balance,
          what you contributed, the interest earned, and the closing balance.
        </p>
        <p style={pStyle}>A few things worth watching for:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>The early years are mostly your effort.</strong> Interest looks small at first because the
            balance is small. That's normal, and it's the part where a lot of people quit.
          </li>
          <li style={liStyle}>
            <strong>The crossover year.</strong> At some point, the interest earned in a year is bigger than the
            amount you contributed that year. Find that row. It's the moment your money starts doing more work than
            you are.
          </li>
          <li>
            <strong>The back-end surge.</strong> In a long schedule, the final stretch often adds more than the
            first two-thirds put together.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The schedule is also a good sanity check. If the balance at year ten looks too good, go back and look at
          your rate. A 10% assumption sitting in a box you forgot about can make a plan look better than it is.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What an Annuity Is (and Where This Calculator Fits)</h2>
        <p style={pStyle}>
          In the U.S., an annuity is a contract, usually with an insurance company. You hand over money, either all
          at once or over time, and in exchange the company agrees to pay you back later, often as regular income.
          People mostly use them to fund retirement.
        </p>
        <p style={pStyle}>
          There are a few roles in the contract. The <strong>owner</strong> is the person who controls it: they can
          cash it out, make withdrawals, or assign it. The <strong>annuitant</strong> is the person whose age and
          life expectancy are used to set the terms. Often those are the same person, but they don't have to be.
          Then there's the <strong>beneficiary</strong>, who receives what's left if the contract pays out at death.
        </p>
        <p style={pStyle}>
          Two phases matter for everything else on this page. During <strong>accumulation</strong>, you fund the
          annuity and it grows. During the <strong>payout phase</strong> (also called annuitization), the insurer
          starts sending income. This annuity calculator lives in the first phase.
        </p>
        <p style={pStyle}>
          One big feature of annuities is tax deferral. Earnings grow without being taxed each year, and taxes come
          due when you take money out. That's the same basic idea behind a traditional IRA or 401(k).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Annuities usually work best as a supplement, not a replacement, for other retirement accounts. Plenty of
          people max out their 401(k) or IRA and still want more tax-deferred space. Annuities don't have the same
          annual contribution caps those accounts do, which is why they come up for higher earners and for people
          close to retirement who are trying to catch up.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed, Variable, and Indexed Annuities</h2>
        <p style={pStyle}>
          Most annuities fall into one of three buckets, and your growth assumption in the calculator should depend
          on which one you're actually looking at.
        </p>
        <p style={pStyle}>
          <strong>Fixed annuities</strong> pay a guaranteed rate. The insurer takes on the investment risk. Rates
          are set based on interest rates when you buy, so a higher-rate environment generally means a better deal
          for new buyers. Once you've bought one, though, your rate is your rate; if the market moves up later, your
          contract doesn't follow. Most fixed annuities also don't adjust for inflation, so the purchasing power of
          the payments can fade over the years. If you use this annuity calculator for a fixed product, plug in the
          guaranteed rate from the contract.
        </p>
        <p style={pStyle}>
          Inside the fixed category there's a product called a <strong>multi-year guaranteed annuity (MYGA)</strong>.
          It locks in one rate for a set stretch, say three, five, or ten years. It behaves a lot like a CD, except
          growth is tax-deferred and the terms can run longer. It's a good fit for someone who'd otherwise park
          money in a CD and doesn't need it for a while. Since the rate is fixed, this is the easiest kind of annuity
          to model precisely with a calculator like this one.
        </p>
        <p style={pStyle}>
          <strong>Variable annuities</strong> invest your money in subaccounts that work a lot like mutual funds.
          Your balance goes up and down with the market, and the principal isn't guaranteed, so you can end up with
          less than you put in. Flexibility is the upside, since you can choose stocks, bonds, or money market
          options. The cost is fees, and variable annuities tend to carry some of the heaviest in the industry. When
          you model one, don't just use the market's historical average. Subtract the total annual costs (more on
          those below) first.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Indexed annuities</strong> sit in between. Your return is tied to an index, often the S&amp;P 500,
          but with limits. There's usually a floor (so you don't lose in a bad year) and a cap or participation rate
          (so you don't get all the upside in a good one). If the index gains 15% and your cap is 10%, you get 10%.
          That tradeoff between protection and upside is the whole point of the product. For projection purposes,
          the honest way to use the annuity calculator here is to test a low, middle, and high rate, because the
          credited rate changes year to year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Immediate vs. Deferred Annuities</h2>
        <p style={pStyle}>
          This is a separate choice from fixed vs. variable, and it decides whether the accumulation phase even
          exists for you.
        </p>
        <p style={pStyle}>
          An <strong>immediate annuity</strong> (sometimes called a single-premium immediate annuity, or SPIA)
          starts paying quickly, anywhere from the next month up to a year after you put in the money. There's
          basically no accumulation period, so this calculator isn't the right tool for it. These are popular with
          people who are already retired or about to be, and who want dependable paychecks.
        </p>
        <p style={pStyle}>
          A <strong>deferred annuity</strong> waits. You fund it, sometimes with a lump sum, often with deposits over
          many years, and payouts begin at a date you choose. This is the kind the annuity calculator was built for.
          The upside is tax-deferred growth on money that would otherwise be taxed as it earns. The catch is timing:
          pulling earnings out before age 59½ generally triggers a 10% federal additional tax on top of regular
          income tax, similar to early withdrawals from retirement accounts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's a third type worth knowing about: the <strong>deferred income annuity (DIA)</strong>. It's
          purchased up front but starts paying years later, often 5, 10, or even 20 years out. The longer you wait,
          the bigger the eventual payment tends to be, because the insurer has had longer to earn on your money and
          expects to pay for fewer years.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Annuity Fees You Should Plug Into Your Projection</h2>
        <p style={pStyle}>
          Here's where a lot of projections go wrong. People enter a 7% return and forget that 2.5% of it might be
          going to fees. Costs on annuities are sometimes described in basis points, where 100 basis points equals
          1%.
        </p>
        <p style={pStyle}>Here's what you may run into:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Surrender charges.</strong> Only apply if you cancel or pull out too much too early. More on this
            in the next section.
          </li>
          <li style={liStyle}>
            <strong>Administrative charges.</strong> Cover paperwork and account servicing. Often around 0.10% to
            0.30% of the contract value per year.
          </li>
          <li style={liStyle}>
            <strong>Commissions.</strong> Usually built into the product rather than billed to you directly, and they
            can be anywhere from about 1% on simple contracts up to 10% on complex indexed ones. If your statement
            doesn't show a commission, don't assume there isn't one. It may be baked into the contract's costs.
            Generally, longer surrender periods go along with higher commissions.
          </li>
          <li style={liStyle}>
            <strong>Investment management fees.</strong> Variable annuities charge these for running the
            subaccounts, much like a mutual fund's expense ratio.
          </li>
          <li style={liStyle}>
            <strong>Mortality and expense fee.</strong> The charge for insurance guarantees a death benefit during
            accumulation. Typically somewhere in the range of 0.40% to 1.75% a year.
          </li>
          <li>
            <strong>Rider charges.</strong> Riders are optional add-ons: an income guarantee, a yearly increase to
            help with inflation, long-term care coverage, or an enhanced death benefit. Each one adds cost. Once used
            only on variable contracts, riders are now available on fixed and indexed ones too.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The easy fix in the calculator: subtract your total ongoing annual fees from the rate before you enter it.
          If a variable annuity's underlying funds average 7% and total fees run 2.5%, model 4.5%. It'll look less
          exciting, but it's a lot closer to what shows up in your account.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Surrender Charges and the Free-Look Period</h2>
        <p style={pStyle}>
          Canceling an annuity is called surrendering it. Most contracts charge a fee if you do that during the
          first several years, commonly 5 to 9, and sometimes longer. The charge usually steps down over time. For
          example, on an eight-year schedule, it might be 8% the first year, 7% the second, and so on down to zero.
          The schedule generally starts on the contract's issue date, though some contracts track each deposit
          separately, which can keep you locked in longer if you keep adding money.
        </p>
        <p style={pStyle}>
          Two things to check before you sign anything. First, whether you can take out a small yearly amount (many
          contracts allow around 10%) without triggering the fee. Second, whether the surrender period restarts on
          new deposits.
        </p>
        <p style={pStyle}>
          If you cancel early and you're under 59½, that 10% IRS additional tax can stack on top of the surrender
          charge. That's a painful combination.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The good news is the <strong>free-look provision</strong>. Most states give you a window, usually
          somewhere between 10 and 30 days depending on where you live and the product, to cancel after signing
          without surrender charges. Use that time to read the contract from beginning to end, especially the fee
          table.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Taxes and Moving Money Into an Annuity</h2>
        <p style={pStyle}>
          Taxes depend on where the money came from, which is where "qualified" and "non-qualified" come in.
        </p>
        <p style={pStyle}>
          A <strong>qualified annuity</strong> is funded with pretax dollars, typically through a rollover from a
          401(k) or traditional IRA. Everything you take out is taxed as ordinary income. Because it's held inside a
          retirement account, required minimum distributions generally apply once you reach the age set by current
          law.
        </p>
        <p style={pStyle}>
          A <strong>non-qualified annuity</strong> is bought with after-tax money. You've already paid tax on what
          you put in, so only the earnings are taxed when they come out, and withdrawals are generally treated as
          earnings first. Required minimum distributions typically don't apply to these.
        </p>
        <p style={pStyle}>If you're rolling a retirement account into an annuity, some rules to keep in mind:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            A rollover between qualified accounts isn't taxable, but it does need to be reported on that year's tax
            return.
          </li>
          <li style={liStyle}>
            If you take the money yourself instead of a direct transfer, you have 60 days to get it into the new
            account. Whatever you miss counts as income.
          </li>
          <li style={liStyle}>
            You're limited to one indirect IRA-to-IRA rollover in any 12-month period. A direct trustee-to-trustee
            transfer doesn't count against that limit, so it's usually the cleaner route.
          </li>
          <li>
            If you already own an annuity and want a better one, a <strong>1035 exchange</strong> lets you swap
            contracts without triggering tax. Check surrender charges on the old contract first, since the exchange
            doesn't erase them.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Tax laws change, and contract details vary, so treat this as a map and not as a final answer. A tax
          professional can tell you what applies to your situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Are Annuities Worth It? A Straight Look at the Tradeoffs</h2>
        <p style={pStyle}>Annuities aren't good or bad. They solve certain problems and create others.</p>
        <p style={pStyle}><strong>What they do well:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Tax-deferred growth outside of 401(k) and IRA limits.</li>
          <li style={liStyle}>No annual contribution cap like the ones on IRAs and 401(k)s.</li>
          <li style={liStyle}>
            Guaranteed income options for people who worry more about outliving their money than about chasing
            returns.
          </li>
          <li>
            A structure that helps with discipline. Somebody who tends to overspend, or who just received a large
            windfall, can turn part of it into a steady paycheck.
          </li>
        </ul>
        <p style={pStyle}><strong>Where they can hurt:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Liquidity.</strong> Surrender charges and IRS penalties make early access expensive. Once you
            annuitize, that decision usually can't be undone.
          </li>
          <li style={liStyle}>
            <strong>Complexity.</strong> Every contract has its own rules for withdrawals, riders, and taxes. You
            need to read the fine print.
          </li>
          <li style={liStyle}><strong>Fees.</strong> Especially on variable and indexed products.</li>
          <li>
            <strong>Returns.</strong> Fixed and indexed annuities tend to earn returns closer to bonds than stocks,
            because insurers invest heavily in fixed-income assets. That's the price of the guarantees. You get less
            volatility and less upside.
          </li>
        </ul>
        <p style={pStyle}>
          An important note on that last point: guarantees are only as strong as the company behind them. Check the
          insurer's financial strength ratings. State guaranty associations also provide backup protection if an
          insurer fails, but coverage limits differ from state to state, and they're not a substitute for picking a
          solid company.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The annuity calculator can help you keep this honest. Compare the projected balance using the annuity's
          net rate against what a simple taxable account or IRA might do with the same contributions. If the annuity
          only wins because of tax deferral and you're not likely to use up your other accounts, that's worth
          knowing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens After Accumulation: Payout Options</h2>
        <p style={pStyle}>
          Once the accumulation phase ends, the insurer converts your balance into income. The calculator doesn't
          predict that number, but it gives you the starting balance that payout quotes are based on. Here's how the
          payout side generally works, so you know what to ask for.
        </p>
        <p style={pStyle}>Your monthly income depends mainly on four things:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Your age when income starts.</strong> Older buyers get larger payments, because the insurer
            expects to pay for fewer years.
          </li>
          <li style={liStyle}><strong>The payout structure.</strong> More protection means a smaller check.</li>
          <li style={liStyle}>
            <strong>Interest rates when you buy.</strong> Higher rates usually mean higher payouts.
          </li>
          <li>
            <strong>How long you deferred.</strong> More years of deferral generally means larger payments.
          </li>
        </ul>
        <p style={pStyle}>
          For a rough sense of scale, a $100,000 immediate annuity for a 65-year-old often works out to something in
          the neighborhood of $600 to $700 a month, but that swings with rates and the option you pick. Get real
          quotes before relying on any of that.
        </p>
        <p style={pStyle}><strong>Common payout structures:</strong></p>
        <DataTable headers={PAYOUT_HEADERS} rows={PAYOUT_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Notice the tradeoff. The more protection you build in for someone else, the less you personally receive
          each month. There's no universally right choice, only the one that fits who depends on you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need an Annuity Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Planning for retirement.</strong> You're building a deferred annuity, or funding one alongside
            other accounts. The calculator shows what balance you'll likely have when contributions stop, and
            whether your current savings rate is enough.
          </li>
          <li style={liStyle}>
            <strong>Testing deposit strategies.</strong> $6,000 once a year, or $500 every month? Run both. Since
            money deposited earlier earns longer, monthly deposits tend to come out a bit ahead, and now you'll know
            by how much.
          </li>
          <li style={liStyle}>
            <strong>Checking a sales projection.</strong> An agent or advisor hands you a projected value. Rebuild it
            with the same rate and term. If yours comes out much lower, ask about fees, caps, or assumptions they're
            using that you aren't.
          </li>
          <li style={liStyle}>
            <strong>Comparing an annuity to other options.</strong> Model the same contributions in a MYGA versus a
            CD, or an annuity against a taxable account. Adjust for fees and taxes and see which one really comes out
            ahead.
          </li>
          <li style={liStyle}>
            <strong>Saving toward a fixed goal.</strong> A college fund, a down payment, a business reserve. Work
            backward: keep changing the monthly amount until the projected balance hits your target.
          </li>
          <li style={liStyle}>
            <strong>Studying or checking work.</strong> Finance students use it to confirm future-value homework.
            Accountants and analysts use it for a fast cross-check before building a bigger model.
          </li>
          <li>
            <strong>Running a bad-year scenario.</strong> What if returns come in a couple points lower than you
            expected? What if you skip contributions for a year? Seeing the worst case makes the rest of the plan
            easier to trust.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for More Accurate Projections</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Use a rate you can defend.</strong> Don't plug in the best decade the market ever had. Run a low,
            medium, and high scenario and plan around the middle.
          </li>
          <li style={liStyle}>
            <strong>Match compounding to reality.</strong> Monthly, quarterly, and annual compounding produce
            different results at the same stated rate. Use what the contract actually uses.
          </li>
          <li style={liStyle}>
            <strong>Take out fees first.</strong> Subtract total annual costs, including any rider charges, from the
            rate.
          </li>
          <li style={liStyle}>
            <strong>Factor in inflation.</strong> $265,000 twenty years from now won't buy what it buys today.
            Subtract expected inflation from your rate to see a rough version in today's dollars.
          </li>
          <li style={liStyle}>
            <strong>Remember taxes.</strong> The result is a pre-tax growth figure. What you keep depends on how and
            when you withdraw.
          </li>
          <li style={liStyle}>
            <strong>Watch the surrender schedule.</strong> If you might need the money in the first several years,
            the number on the screen isn't the number you'd walk away with.
          </li>
          <li>
            <strong>Rerun it once a year.</strong> Update your balance and rate, then check whether you're still on
            track.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Simple, and Built to Be Checked</h2>
        <p style={pStyle}>
          The annuity calculator on Tolz is free to use. There are no hidden charges and no paywall on the results
          or the accumulation schedule. You put in your numbers and get a projection without installing anything.
        </p>
        <p style={pStyle}>
          The formulas are the standard ones, so you can verify any result by hand or with the FV function in a
          spreadsheet. The inputs are just financial assumptions, but as a general habit, don't type account
          numbers, Social Security numbers, or other sensitive details into any online calculator. You don't need
          any of that here.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Results are estimates. They depend on the rate and timing you enter, they aren't guaranteed, and they
          aren't financial, tax, or legal advice. If you're making a decision that involves significant money,
          especially signing an annuity contract, have a licensed professional look over the actual terms.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Try a Few Versions of Your Plan</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Run the annuity calculator with your current numbers. Then change just one thing: an extra $50 a month,
          one more year, or a rate half a point lower. Compare the results and you'll see where your attention is
          best spent. Generally, small changes made early beat big changes made late.
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
