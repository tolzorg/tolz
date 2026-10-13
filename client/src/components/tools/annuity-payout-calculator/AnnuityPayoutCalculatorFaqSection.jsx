import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an annuity payout calculator?",
    a: "It's a tool that works out the regular payment you can collect from a lump sum over a set period, or how long a fixed payment will last. You enter the balance, interest rate, and either a term or a payment amount.",
  },
  {
    q: "How do I calculate my annuity payout?",
    a: "Enter your starting balance, the annual interest rate, how often you want payments, and the number of years. The calculator uses the level-payment formula to return your payment and a year-by-year schedule.",
  },
  {
    q: "How long will my annuity last?",
    a: "Use the fixed-payment mode. Enter your balance, rate, and the amount you want each period, and it returns the number of payments. If your payment is no larger than the interest the balance earns, the money never runs out.",
  },
  {
    q: "How much does a $100,000 annuity pay per month?",
    a: "Over a fixed 20 years at 5%, it's about $660 a month. Over 10 years it's about $1,061, and over 30 years about $537. Lifetime payouts for a 65-year-old are often in the $550 to $700 range, but they depend on age, sex, and current rates.",
  },
  {
    q: "What's the formula for an annuity payout?",
    a: "For payments at the end of each period, Payment = PV × r ÷ (1 − (1 + r)^−n). PV is the starting balance, r is the rate per period, and n is the number of payments.",
  },
  {
    q: "What's the difference between a fixed-length and a fixed-payment annuity payout?",
    a: "With a fixed length, you pick the number of years and the payment is calculated. With a fixed payment, you pick the amount and the calculator finds how long it lasts.",
  },
  {
    q: "What's the difference between life only and joint and survivor?",
    a: "Life only pays until you die, with a higher monthly check and nothing left for heirs. Joint and survivor keeps paying until the second person dies, so the monthly amount is lower.",
  },
  {
    q: "What's the difference between qualified and non-qualified annuities?",
    a: "Qualified annuities are held in pre-tax retirement accounts, so payouts are fully taxable. Non-qualified annuities are bought with after-tax money, so only the earnings are taxed.",
  },
  {
    q: "Is there a penalty for taking money out of an annuity early?",
    a: "Usually, yes. Withdrawals before age 59½ generally carry a 10% tax penalty on the taxable portion, plus regular income tax. Many contracts also charge a surrender fee in the early years, though most allow a limited free withdrawal each year.",
  },
  {
    q: "What is a 1035 exchange?",
    a: "It's an IRS rule that lets you move money from one annuity or life insurance contract into certain new contracts without paying tax on the switch. Only specific swaps qualify, and the owner and annuitant have to stay the same.",
  },
  {
    q: "Does deferring an annuity increase my payout?",
    a: "Yes. Deferral lets the balance keep growing before payments start, so the payout is calculated on a larger amount. You give up the income during the wait.",
  },
  {
    q: "Does the calculator include taxes or inflation?",
    a: "No. It shows gross, nominal amounts. Taxes, fees, and inflation will all reduce what you keep and what the payments can buy.",
  },
  {
    q: "Is this annuity payout calculator free, and do I need to sign up?",
    a: "It's free, and there's no signup or account required.",
  },
];

const PAYOUT_TABLE_HEADERS = ["Annual rate", "10 years", "20 years", "25 years", "30 years"];
const PAYOUT_TABLE_ROWS = [
  ["4%", "$1,012", "$606", "$528", "$477"],
  ["5%", "$1,061", "$660", "$585", "$537"],
  ["6%", "$1,110", "$716", "$644", "$600"],
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap" }}>
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

export default function AnnuityPayoutCalculatorFaqSection() {
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
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What an Annuity Payout Calculator Actually Does</h2>
        <p style={pStyle}>
          An annuity payout calculator takes a pool of money and spreads it out into equal payments. Each payment
          pulls some cash out, and whatever's left keeps earning interest until the balance hits zero at the end.
          That's the whole idea.
        </p>
        <p style={pStyle}>
          The tool works in two directions. In the first, you tell it how many years you want payments to run, and
          it solves for the payment. In the second, you tell it how much you want per payment, and it tells you how
          long the money will last. Same math, different unknown.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Even though it's called an annuity calculator, the math isn't limited to insurance contracts. It fits
          retirement withdrawals, structured settlements, an inheritance you want to stretch out, or a college fund
          you're drawing down. Anywhere a balance gets paid out on a schedule, this is the calculation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What You Need to Enter</h2>
        <p style={pStyle}>There are only a few inputs, but each one moves the result.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Starting balance.</strong> This is the amount you have on day one of payouts. If you're using a
            retirement account, it's what's in there when you start withdrawing. If you're looking at an insurance
            annuity, it's the premium or account value at annuitization.
          </li>
          <li style={liStyle}>
            <strong>Annual interest rate.</strong> This is the return you assume the remaining balance earns. With a
            fixed annuity, the insurer tells you the rate. With an investment account, you're guessing, so be a
            little conservative. The effect is bigger than people expect. On a $500,000 balance paid over 20 years,
            going from 4% to 6% moves the monthly payment from about $3,030 to about $3,580.
          </li>
          <li style={liStyle}>
            <strong>Payment frequency.</strong> Monthly, quarterly, semiannual, or annual. Paying less often leaves
            money in the account longer, so the same balance supports a slightly different payment. On $100,000 at
            5% over 20 years, monthly payments come out to about $660, while annual payments work out to about
            $8,024 a year, which is around $669 a month. The difference is small, but it's there.
          </li>
          <li>
            <strong>Term or payment amount.</strong> Which one you enter depends on the direction you're
            calculating.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed Length vs. Fixed Payment: Which Mode to Use</h2>
        <p style={pStyle}>
          <strong>Fixed length.</strong> Use this when you know your time horizon. Maybe you need 15 years of income
          to bridge the gap until a pension kicks in, or you want a payout that finishes when your kid graduates.
          Enter the years and the calculator gives you the payment that drains the balance right on schedule.
        </p>
        <p style={pStyle}>
          <strong>Fixed payment.</strong> Use this when you already know the income you need. Enter a monthly
          amount and the calculator returns how many payments the balance will cover. If you've ever typed "how
          long will my annuity last" into a search bar, this is the mode you want.
        </p>
        <p style={pStyle}>
          Both approaches carry a risk, and it's worth being straight about it. Pick a term that's too short and
          you'll get big checks, but then the money's gone and you're still around. Pick one that's too long and
          your checks will be smaller than they needed to be. The same goes for fixed payments. Set the payment too
          high and you run dry early. Set it too low and you may end up with a pile left over that you could've
          spent. Running a few different versions is the point.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more thing to watch: if the payment you enter is no bigger than the interest the balance earns each
          period, the balance never shrinks. A $300,000 balance at 4% earns about $1,000 a month, so a $900 payment
          just sits there forever. The calculator flags this so you don't mistake it for a glitch.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Formula Behind the Numbers</h2>
        <p style={pStyle}>
          You don't need the math to use the tool, but it helps to know there's nothing mysterious going on. This
          is the standard level-payment formula, the same one behind a mortgage or car loan, just flipped around.
          You're the lender and the account is the borrower.
        </p>
        <p style={pStyle}>For payments at the end of each period:</p>
        <div style={formulaStyle}>Payment = PV × r ÷ (1 − (1 + r)^−n)</div>
        <p style={pStyle}>
          PV is your starting balance, r is the interest rate per payment period (annual rate divided by payments
          per year), and n is the total number of payments.
        </p>
        <p style={pStyle}>To find how long a payment lasts, the formula gets rearranged:</p>
        <div style={formulaStyle}>n = −ln(1 − PV × r ÷ Payment) ÷ ln(1 + r)</div>
        <p style={pStyle}>
          Since the leftover balance keeps earning interest while payments go out, the total you collect is more
          than what you started with. That's why the schedule is worth looking at. Early on, the balance drops
          slowly because a big chunk of each payment is just interest being handed back to you. Near the end, it
          drops fast.
        </p>

        <h3 style={h3Style}>Worked Examples</h3>
        <p style={pStyle}>
          <strong>Fixed length.</strong> You've got $500,000 earning 5% and you want monthly payments for 20 years.
          The monthly rate is about 0.4167% and there are 240 payments. The payment works out to about $3,300. Over
          the full 20 years you'd collect around $792,000, so roughly $292,000 of that is interest earned along the
          way.
        </p>
        <p style={pStyle}>
          <strong>Fixed payment.</strong> You've got $300,000 earning 4% and you plan to take $2,000 a month. The
          balance earns about $1,000 a month in interest, so you're only eating into principal by about $1,000 at
          first. The money lasts around 208 payments, or about 17 years and 4 months. Bump the withdrawal to $2,500
          and that drops to roughly 13 years. An extra $500 a month costs you over four years of income, which is
          the kind of thing that's hard to see until you run it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Annuity due.</strong> If payments come at the start of each period instead of the end, each one
          is slightly smaller, because the money leaves the account a period earlier. As a quick adjustment, take
          the end-of-period payment and divide it by (1 + r). For the $500,000 example, that turns $3,300 into about
          $3,286.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Does a $100,000 Annuity Pay Per Month?</h2>
        <p style={pStyle}>
          This is one of the most common questions out there, and the honest answer is: it depends on the term and
          the rate. Here's $100,000 paid out fully over a fixed period, with monthly payments:
        </p>
        <DataTable headers={PAYOUT_TABLE_HEADERS} rows={PAYOUT_TABLE_ROWS} />
        <p style={pStyle}>
          The math scales in a straight line, so you can multiply for other amounts. $250,000 at 5% over 20 years is
          2.5 × $660, or about $1,650 a month. $750,000 is 7.5 × $660, or about $4,950.
        </p>
        <p style={pStyle}>
          The term matters more than the rate. Going from 20 years to 10 roughly doubles the check at any rate in
          the table. A one-point change in rate only moves it by about 8 to 9 percent.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick note on lifetime payouts, which work differently. A 65-year-old buying a single-life income
          annuity might get somewhere in the neighborhood of $550 to $700 a month per $100,000, depending on the
          insurer, the day's interest rates, and whether it's a man or a woman. Younger buyers get less because the
          insurer expects to pay for more years. Treat those as ballpark figures and get real quotes before relying
          on them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Payout Options Explained</h2>
        <p style={pStyle}>
          The calculator models the first two options below, the most common fixed-period choices. The rest show up
          in real annuity contracts, and they change both your payment and what happens after you die. Not every
          insurer offers every option.
        </p>
        <p style={pStyle}>
          <strong>Lump sum.</strong> You take the whole account value at once. It's the simplest route, but if the
          money's in a pre-tax account or the annuity has gains, the taxable amount lands in a single year and can
          push you into a higher bracket. A lump sum taken before age 59½ can also trigger the early withdrawal
          penalty covered below.
        </p>
        <p style={pStyle}>
          <strong>Fixed length (period certain).</strong> Payments are guaranteed for a set number of years, like
          10, 15, or 20. Somebody who's 60 and picks a 10-year period gets paid until about 70. If they die early,
          the remaining payments go to their heirs. Since the payout doesn't depend on how long you live, it also
          doesn't protect you if you live well past the term.
        </p>
        <p style={pStyle}>
          <strong>Fixed payment amount.</strong> You choose the payment, and it continues until the balance is
          gone. How long that takes depends on the amount and the value at the start. It carries the same risk as a
          fixed length: you can guess wrong in either direction.
        </p>
        <p style={pStyle}>
          <strong>Life only.</strong> Payments continue as long as you're alive and stop when you die. Since the
          insurer is betting on your life expectancy, this gives the biggest monthly check of the lifetime options.
          The catch is that if you die a year or two in, the rest of the money is gone and nothing goes to heirs. On
          the flip side, if you live to 100, you can collect far more than you put in.
        </p>
        <p style={pStyle}>
          <strong>Joint and survivor.</strong> Payments continue for two people, usually spouses, until the second
          one dies. Because the insurer expects to pay for longer, the monthly amount is lower than life only. Many
          contracts let you pick how much the survivor keeps, such as 50%, 75%, or 100% of the original payment. A
          higher survivor percentage means a smaller starting check.
        </p>
        <p style={pStyle}>
          <strong>Life with period certain.</strong> This one combines the last two ideas. You're paid for life,
          but if you die inside a set window, like the first 10 years, your beneficiary collects the remaining
          payments until that window ends. If you die after the window, payments stop. You give up a bit of monthly
          income in exchange for the safety net.
        </p>
        <p style={pStyle}>
          Some contracts also offer refund options that return any unpaid premium to heirs, and some let you add
          cost-of-living increases. Both lower your starting payment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing to keep in mind about all of this: when you annuitize, the choice is generally permanent. You
          can't go back later and ask for a different payout type or pull your principal out. That's why it pays to
          test scenarios before signing anything.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Three Phases of an Annuity</h2>
        <p style={pStyle}>
          Annuities move through a life cycle, and knowing where you are tells you which numbers to use.
        </p>
        <p style={pStyle}>
          <strong>Accumulation.</strong> This is the saving stage. You fund the annuity with a lump sum or a series
          of payments, and the money grows tax-deferred. People close to retirement tend to use a lump sum so they
          can start income right away. That's called an immediate annuity, and it has almost no accumulation phase.
          Younger savers usually fund over time. The money keeps growing in every phase until it's paid out, whether
          the annuity is fixed, indexed, or variable.
        </p>
        <p style={pStyle}>
          <strong>Annuitization.</strong> This is a one-time event, not really a phase. It's the moment you stop
          paying into the contract and the insurer starts paying you back. With variable annuities, your
          accumulation units get converted into annuity units. Once it's done, it's done.
        </p>
        <p style={pStyle}>
          <strong>Payout.</strong> This is the phase the calculator covers. You're receiving payments monthly,
          quarterly, semiannually, or annually, and the balance is declining according to the schedule.
        </p>

        <h3 style={h3Style}>What About Deferral?</h3>
        <p style={pStyle}>
          If you're not ready to take payments yet, deferring lets the money grow first, and the payout afterward is
          bigger because it's calculated on a larger balance. You can model this with the calculator in two steps.
          First, grow your balance: Balance × (1 + rate)^years. Then use that number as your starting balance.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, $250,000 growing at 5% for 10 years becomes about $407,000. Paid out over 20 years at 5%,
          that supports roughly $2,687 a month. Start payouts today instead and the same $250,000 supports only
          about $1,650. Waiting 10 years lifts the payment by about 63%. The trade-off is ten years without that
          income, and ten years of your other money carrying the load.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Qualified vs. Non-Qualified Annuities</h2>
        <p style={pStyle}>
          How your annuity was funded decides how it's taxed, so this matters as much as the payout math.
        </p>
        <p style={pStyle}>
          <strong>Qualified annuities</strong> sit inside tax-advantaged retirement plans like an IRA, 401(k), or
          403(b). The contributions are generally pre-tax, so none of it has been taxed yet. That means every dollar
          that comes out, principal and growth alike, is taxed as ordinary income. The account's own rules also
          apply, including required minimum distributions (currently starting at age 73 for most people, though
          that's shifting to 75 for younger folks, so check your own birth year).
        </p>
        <p style={pStyle}>
          <strong>Non-qualified annuities</strong> are bought with after-tax money. You've already paid tax on the
          principal, so only the earnings get taxed, and they're taxed as ordinary income rather than at capital
          gains rates. There's no required minimum distribution during your lifetime, and there's no cap on how much
          you can put in or how many contracts you can own.
        </p>
        <p style={pStyle}>How the earnings are taxed depends on how you take the money:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Regular withdrawals</strong> from a non-qualified annuity bought after August 13, 1982 are taxed
            "last in, first out." Earnings come out first and get taxed first. Your tax-free principal comes out
            last.
          </li>
          <li>
            <strong>Annuitized payments</strong> work differently. Each payment is split using an exclusion ratio,
            which is your investment in the contract divided by the total expected payments. Say you paid in
            $100,000 and expect to collect $150,000 in total. About two-thirds of each payment is a tax-free return
            of your money, and one-third is taxable. Once you've recovered your full investment, every payment after
            that is fully taxable.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is why the "gross" number from any calculator is not your take-home.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Early Withdrawals and Surrender Charges</h2>
        <p style={pStyle}>
          Take money from an annuity before age 59½ and you'll generally owe a 10% penalty on the taxable portion, on
          top of regular income tax. There are exceptions, including death, disability, and certain series of equal
          periodic payments. The details get technical, especially with that last one, so it's worth checking with
          a tax pro before you rely on an exception.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Separately, most annuity contracts charge a surrender fee if you pull out too much too soon. The penalty
          usually declines over several years and eventually drops to zero. Many contracts let you withdraw a slice
          of the value each year, often around 10%, without any surrender charge. Some also waive charges for things
          like a terminal illness diagnosis or nursing home stay. Read the contract, because it varies a lot between
          insurers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>1035 Exchanges</h2>
        <p style={pStyle}>
          If you've got an old annuity with high fees or poor options, a 1035 exchange lets you move the money into
          a new contract without it counting as a sale. So there's no tax bill just for switching.
        </p>
        <p style={pStyle}>The IRS only allows certain swaps:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>An annuity for another annuity (or for one with long-term care benefits)</li>
          <li style={liStyle}>A life insurance policy for another life insurance policy, or for an annuity</li>
          <li>An endowment contract for an annuity, or for another qualifying endowment</li>
        </ul>
        <p style={pStyle}>
          Going the other way, from an annuity into life insurance, doesn't qualify and is taxable. The owner and
          annuitant on the new contract also have to match the old one.
        </p>
        <p style={pStyle}>
          You can do a partial exchange too, moving part of the contract and keeping the rest. The cost basis gets
          split pro rata. Suppose you've got a $50,000 annuity with a $40,000 basis, meaning $10,000 of gain. A
          $10,000 withdrawal would be fully taxable because the gain comes out first. But if you move half into a
          second contract, each contract holds $25,000 with a $20,000 basis and $5,000 of gain, so a $10,000
          withdrawal from either one is only $5,000 taxable.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The catch is timing. Generally, taking money out of either contract within 180 days of the exchange can
          cause the IRS to treat the whole thing differently. Not every insurer even allows partial exchanges. Given
          the tax stakes, a professional is worth paying for on this one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use This Calculator</h2>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Retirement income.</strong> You've got a rollover or pension buyout and want to know what it
            supports over 20, 25, or 30 years. One useful point of comparison: a level payment of $500,000 at 5%
            over 30 years comes to about $2,684 a month, which is over 6% of the balance per year. That looks a lot
            higher than the "4% rule," but the two aren't the same thing. The 4% rule raises withdrawals each year
            for inflation and is built to survive bad markets. A level payout assumes a steady 5% return and never
            adjusts.
          </li>
          <li style={liStyle}>
            <strong>Checking an insurer's quote.</strong> Run the same premium, term, and a realistic rate through
            the calculator. Insurers use this same math, then adjust for their costs, and for lifetime options they
            price in your age. If the quote is well below what you see here, ask why.
          </li>
          <li style={liStyle}>
            <strong>Structured settlements and windfalls.</strong> If you've received an inheritance, settlement, or
            lottery prize, you can see how far it stretches across different payout lengths.
          </li>
          <li style={liStyle}>
            <strong>Bridging a gap.</strong> Covering years before Social Security starts, or before a pension
            begins, is a classic fixed-length job.
          </li>
          <li>
            <strong>Stress-testing your withdrawal plan.</strong> Run the fixed-payment mode at 3%, 5%, and 7%. If
            the money only survives in the optimistic case, that's good to know now.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Already receiving payments and thinking of selling them? That's a different calculation. This tool works
          out what a balance can pay you. Figuring out what an existing stream is worth as a lump sum today takes a
          discount rate set by a buyer, and you'll usually get noticeably less than the face value of the payments.
          If you go that route, get quotes from several buyers, and check whether your state or a court requires
          approval for the sale, which is common with structured settlements.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Calculator Doesn't Cover</h2>
        <p style={pStyle}>
          The result is a clean estimate, but it isn't a quote. A few things sit outside the math.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Inflation.</strong> A level payment buys less each year. At 3% inflation, a $3,300 payment in
            year 20 has the purchasing power of about $1,830 today. Longer payouts need some cushion for that, or a
            plan for other income that can grow.
          </li>
          <li style={liStyle}>
            <strong>Taxes.</strong> The calculator shows gross amounts. Depending on the account, part or all of
            each payment is taxable.
          </li>
          <li style={liStyle}>
            <strong>Fees and riders.</strong> Real annuities come with charges, and riders for things like death
            benefits or income guarantees cost extra. A pure math model has none of that, which is one reason real
            quotes come in lower.
          </li>
          <li style={liStyle}>
            <strong>Rates that change.</strong> The calculator assumes one steady rate for the whole period. That's
            accurate for a fixed annuity with a locked rate, but not for an investment account.
          </li>
          <li style={liStyle}>
            <strong>Insurer strength.</strong> An annuity is only as good as the company behind it. State guaranty
            associations back contracts up to a limit, which in many states is at least $250,000 of benefits per
            insurer, but the limits differ by state.
          </li>
          <li>
            <strong>Lifetime guarantees.</strong> A fixed-term calculator can't reproduce an insurer pooling
            longevity risk. If your main worry is outliving your money, talk with a licensed professional about
            lifetime options.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Accurate, Free, and Private?</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Accuracy.</strong> It uses the standard time-value-of-money formulas that banks and finance
            textbooks use. The numbers are exact for the inputs you give it. They're only as realistic as your rate
            and timing assumptions.
          </li>
          <li style={liStyle}>
            <strong>Cost.</strong> It's free, and you can run as many scenarios as you want.
          </li>
          <li style={liStyle}>
            <strong>Signup.</strong> You don't need an account. Type in your numbers and read the results.
          </li>
          <li style={liStyle}>
            <strong>Privacy.</strong> The calculator only needs a balance, a rate, and a term or payment. It doesn't
            ask for your name, account numbers, or anything that identifies you.
          </li>
          <li>
            <strong>Limits.</strong> This is a planning tool, not tax, legal, or investment advice. Before you buy an
            annuity or choose a pension payout, run it by a licensed professional.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting More From Your Results</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Run at least three rates, like 3%, 5%, and 7%, so you can see the spread.</li>
          <li style={liStyle}>
            In fixed-payment mode, bump the payment up a few hundred dollars at a time to find where the duration
            starts falling off fast.
          </li>
          <li style={liStyle}>Test monthly versus annual payments if your plan lets you choose.</li>
          <li>
            Save or print the year-by-year schedule, then compare it to your real statements down the road. If your
            balance is tracking below the schedule, you'll see it early enough to adjust.
          </li>
        </ul>
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
