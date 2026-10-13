import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a Roth IRA calculator?",
    a: "It's a tool that projects how much a Roth IRA could grow to by retirement, based on your contributions, time horizon, and expected return. This one also compares the result with a taxable account.",
  },
  {
    q: "How much can I contribute to a Roth IRA in 2026?",
    a: "The limit is $7,500, or $8,600 if you're 50 or older. That's the combined total across all your traditional and Roth IRAs, and you also can't contribute more than your earned income.",
  },
  {
    q: "What are the Roth IRA income limits for 2026?",
    a: "For single filers and heads of household, contributions phase out between $153,000 and $168,000. For married couples filing jointly, it's $242,000 to $252,000. Above the top number, you can't contribute directly.",
  },
  {
    q: "How much will my Roth IRA be worth in 30 years?",
    a: "It depends on what you put in and what it earns. At $7,500 a year and a 7% average return, you'd have roughly $708,000. At 5%, it's closer to $498,000, and at 9%, about $1 million.",
  },
  {
    q: "Is a Roth IRA better than a taxable account?",
    a: "For retirement savings, a Roth usually wins on after-tax growth because you never pay tax on the gains. A taxable account has no contribution cap and no withdrawal rules, so many people use both.",
  },
  {
    q: "Roth IRA or traditional IRA, which is better?",
    a: "It mostly comes down to your tax rate now versus later. A Roth tends to favor people who expect a higher rate in retirement, and a traditional IRA favors those expecting a lower one. Plenty of people use both.",
  },
  {
    q: "What return should I use?",
    a: "Most people test somewhere between 5% and 8%. Running a few rates beats betting on one number.",
  },
  {
    q: "Can I take money out of a Roth IRA before retirement?",
    a: "You can withdraw your own contributions anytime, tax-free and penalty-free. Earnings are tax-free only if you're 59½ and the account has been open five years, with a few exceptions.",
  },
  {
    q: "What is the Roth IRA five-year rule?",
    a: "Your first five-year clock starts January 1 of the year you first contribute to any Roth IRA. You need it to pass before withdrawing earnings tax-free. Conversions have their own five-year periods for the 10% penalty if you're under 59½.",
  },
  {
    q: "Do Roth IRAs have required minimum distributions?",
    a: "Not during your lifetime. Beneficiaries who inherit one usually have to withdraw it within 10 years, though spouses can treat it as their own.",
  },
  {
    q: "Can I have a Roth IRA and a 401(k)?",
    a: "Yes. They're separate accounts with separate limits. The 401(k) limit for 2026 is $24,500, on top of your $7,500 IRA limit.",
  },
  {
    q: "Can I open a Roth IRA if I earn too much?",
    a: "Not directly. But you can use a backdoor Roth by making a nondeductible traditional IRA contribution and converting it. Watch the pro-rata rule if you have other pre-tax IRA money.",
  },
  {
    q: "Does the calculator account for inflation?",
    a: "It projects growth using the return you enter. To think in today's dollars, lower the return by the inflation rate, keeping in mind that this assumes your contributions rise with inflation.",
  },
  {
    q: "Is the Roth IRA calculator free?",
    a: "Yes, it's free to use.",
  },
];

// Structured data uses the supplied schema wording, which phrases two questions differently.
const FAQ_SCHEMA_QUESTIONS = {
  "What return should I use?": "What return should I use in a Roth IRA calculator?",
  "Does the calculator account for inflation?": "Does the Roth IRA calculator account for inflation?",
};
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  FAQ_SCHEMA_QUESTIONS[item.q] ? { ...item, q: FAQ_SCHEMA_QUESTIONS[item.q] } : item
);

const RETURN_HEADERS = ["Average annual return", "Balance after 30 years"];
const RETURN_ROWS = [
  ["5%", "about $498,000"],
  ["7%", "about $708,000"],
  ["9%", "about $1,022,000"],
];

const INCOME_HEADERS = ["Filing status", "Full contribution", "Partial contribution", "No direct contribution"];
const INCOME_ROWS = [
  ["Single or head of household", "Under $153,000", "$153,000 to $168,000", "$168,000 and up"],
  ["Married filing jointly", "Under $242,000", "$242,000 to $252,000", "$252,000 and up"],
  ["Married filing separately (lived with spouse)", "$0", "Up to $10,000", "$10,000 and up"],
];

const COMPARE_HEADERS = ["", "Roth IRA", "Traditional IRA"];
const COMPARE_ROWS = [
  ["Contributions", "After-tax, not deductible", "Often pre-tax or deductible"],
  ["Growth", "Tax-free", "Tax-deferred"],
  ["Qualified withdrawals", "Tax-free", "Taxed as ordinary income"],
  ["Required minimum distributions", "None during your life", "Start at 73 or 75, depending on your birth year"],
  ["Income limit to contribute", "Yes", "None (but deduction can phase out)"],
  ["Age limit to contribute", "None, with earned income", "None, with earned income"],
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

function DataTable({ headers, rows, wrap = false }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: wrap ? "normal" : "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: wrap ? "normal" : "nowrap", verticalAlign: "top", minWidth: wrap ? 120 : undefined }}>
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

export default function RothIraCalculatorFaqSection() {
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
        <h2 style={h2Style}>What a Roth IRA Actually Is</h2>
        <p style={pStyle}>
          A Roth IRA is an individual retirement account where you put in money you've already paid income tax on. You
          don't get a deduction up front. In exchange, everything the account earns grows tax-free, and qualified
          withdrawals in retirement come out tax-free too. Congress created it in the Taxpayer Relief Act of 1997, and
          it's named after Senator William Roth of Delaware, who pushed it through.
        </p>
        <p style={pStyle}>
          It's an account type, not an investment. Think of it as a container with special tax rules. You open one at a
          brokerage, a robo-advisor, a bank, or a mutual fund company, and then you choose what goes inside: index funds,
          ETFs, individual stocks, bonds, CDs, and so on. The IRS regulates all these providers the same way, so the real
          differences are fees, fund selection, and how easy the app is to use. The IRS does bar a few things, like life
          insurance and most collectibles (art, antiques, gems, most coins).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing people miss: you must designate the account as a Roth when you open it. And the contribution limit is
          shared. Your Roth and traditional IRAs together can't take more than the annual cap.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This Roth IRA Calculator Works</h2>
        <p style={pStyle}>
          The tool compounds your money one year at a time. Each year it adds your contribution, applies your assumed
          return, and rolls the total into the next year. Since every year's growth starts earning its own growth, the
          longer you run it, the steeper the curve gets.
        </p>
        <p style={pStyle}>
          You get three things back. First, a projected Roth IRA balance at your retirement age. Second, a taxable-account
          balance built from the same contributions and return, so you can see what the Roth tax treatment is actually
          worth. Third, an annual schedule listing contributions, growth, and ending balance for each year, along with a
          growth graph of the same data.
        </p>
        <p style={pStyle}>
          Watch the graph for the point where the growth line passes your total contributions. Early on, most of your
          balance is money you put in. Somewhere in the middle, growth takes over and starts doing more work than you do.
          That crossover is the whole reason starting early matters.
        </p>

        <h3 style={h3Style}>The inputs, and which ones matter most</h3>
        <p style={pStyle}>
          You'll typically enter your current age, planned retirement age, any balance you already have, how much you
          contribute each year, and an expected annual return. The comparison with a taxable account also leans on a tax
          assumption.
        </p>
        <p style={pStyle}>
          <strong>Time is the heavyweight.</strong> Nothing else you control moves the result as much, and the examples
          further down show how big the gap gets.
        </p>
        <p style={pStyle}>
          <strong>Contribution amount</strong> is the lever you control most directly. The 2026 limit is $7,500, or
          $8,600 if you're 50 or older. Putting in a number above your limit gives you a projection you can't legally
          follow.
        </p>
        <p style={pStyle}>
          <strong>Expected return</strong> is where people fool themselves. Plugging in 10% because the stock market has
          averaged close to that over very long stretches gives you a number that feels great and holds up badly. Run a
          few versions instead. For a 30-year plan at $7,500 a year, here's how much the return changes things:
        </p>
        <DataTable headers={RETURN_HEADERS} rows={RETURN_ROWS} />
        <p style={pStyle}>
          Same contributions, same time. The only difference is the return, and the gap between the low and high cases is
          more than half a million dollars. That's why a single optimistic number isn't a plan.
        </p>
        <p style={pStyle}>
          <strong>Starting balance</strong> gets the full time horizon to compound, so even a small existing balance lifts
          the end result more than you'd expect.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One detail on timing: the examples on this page assume one contribution at the end of each year. If you invest
          early in the year or contribute monthly, you'll land a little higher, because the money has more time in the
          market.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Roth IRA vs Taxable Account: What the Comparison Shows</h2>
        <p style={pStyle}>
          A basic compound interest calculator can't answer the question most people really have: why bother with a Roth
          IRA when I could just invest in a regular brokerage account?
        </p>
        <p style={pStyle}>
          Both are funded with after-tax money. The difference is what happens afterward. In a taxable account, you owe
          tax on dividends and interest in the year they're paid. When you sell something for a gain, you owe capital
          gains tax. Each of those bites takes money out of the account that would've kept compounding. Sure, it's usually
          a fraction of a percent per year, but it adds up over decades. In a Roth IRA, none of that applies. No tax on
          dividends, no tax when you sell, no tax at withdrawal if you meet the rules.
        </p>
        <p style={pStyle}>
          Take the 30-year, 7% example. You put in $225,000 total, and the Roth ends up around $708,000, so roughly
          $483,000 of it is growth. In a Roth, you keep every dollar of that. In a taxable account, if you sold everything
          at the end, a 15% capital gains rate alone would take around $72,000, and that's before counting the yearly tax
          on dividends along the way.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To be fair to the taxable account, it has real advantages. There's no contribution cap and no income limit, you
          can pull money out whenever you want with no age rules, and you can use losses to offset gains and lower your
          tax bill. So the sensible read of the comparison isn't "put everything in a Roth." It's "see what the tax
          shelter is worth, then decide how much flexibility you need to keep outside it."
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>2026 Roth IRA Contribution Limit and Income Limits</h2>
        <p style={pStyle}>
          The IRS announced the 2026 numbers in Notice 2025-67. The annual IRA limit rose to $7,500, up from $7,000 in
          2025. If you're 50 or older, you can add a $1,100 catch-up contribution (it was $1,000), for a total of $8,600.
        </p>
        <p style={pStyle}>A few rules sit on top of that:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>The cap is shared.</strong> If you put $3,000 in a traditional IRA, you only have $4,500 of room left
            for a Roth.
          </li>
          <li style={liStyle}>
            <strong>You need earned income.</strong> Wages, tips, bonuses, and self-employment income count. Investment
            income, rental income, and pensions don't. You can't contribute more than you earned that year.
          </li>
          <li style={liStyle}>
            <strong>The deadline is April 15 of the next year.</strong> For 2026 contributions, that's April 15, 2027.
            Extensions don't push it back.
          </li>
          <li style={liStyle}>
            <strong>Overfunding costs you.</strong> Excess contributions get hit with a 6% penalty every year they stay in
            the account, until you fix it.
          </li>
        </ul>

        <h3 style={h3Style}>Income limits for 2026</h3>
        <p style={pStyle}>
          Your eligibility depends on modified adjusted gross income (MAGI), which is roughly your adjusted gross income
          with a few items added back. Roth conversion income doesn't count toward it.
        </p>
        <DataTable headers={INCOME_HEADERS} rows={INCOME_ROWS} wrap />
        <p style={pStyle}>
          If you're in the partial range, take the top of the range minus your MAGI, divide by the width of the range,
          and multiply by the contribution limit. The IRS rounds up to the next $10, and if the result is above zero but
          under $200, you can still put in $200.
        </p>
        <p style={pStyle}>
          Say you're single with a MAGI of $160,500. The range is $15,000 wide, and you're $7,500 below the ceiling, so
          you're halfway through it. Your limit is half of $7,500, or $3,750.
        </p>

        <h3 style={h3Style}>Special cases worth knowing</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            A <strong>spousal IRA</strong> lets a non-working spouse contribute to their own Roth, as long as you file
            jointly and the working spouse's earned income covers both contributions. That can double a household's
            contributions with one paycheck.
          </li>
          <li style={liStyle}>
            A <strong>custodial Roth IRA</strong> lets a minor with earned income (a summer job, a family business) have a
            Roth managed by a parent until they're an adult. Someone who starts at 16 gets decades of tax-free
            compounding.
          </li>
          <li style={liStyle}>
            There's <strong>no age limit</strong> for contributing, as long as you have earned income. The old 70½ cutoff
            is gone.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Lower-income savers should also look at the <strong>Saver's Credit</strong>, covered below.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Roth IRA vs Traditional IRA</h2>
        <p style={pStyle}>This is the choice most people agonize over. The core difference is when you pay tax.</p>
        <DataTable headers={COMPARE_HEADERS} rows={COMPARE_ROWS} wrap />
        <p style={pStyle}>
          The usual rule of thumb is that a Roth tends to win if you expect your tax rate to be higher in retirement than
          it is today, and a traditional IRA wins if you expect it to be lower. The trouble is you can't know your future
          tax bracket, and tax law changes. A lot of people split the difference and use both, which gives them
          flexibility in retirement to pull from whichever bucket keeps their tax bill down in a given year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's an angle people overlook. The $7,500 limit applies to the dollar amount, not the tax-adjusted value.
          Someone in the 24% bracket who puts $7,500 into a traditional IRA is really putting in about $5,700 of take-home
          pay. Put the same $7,500 in a Roth, and you've sheltered more actual spending power. So a Roth lets you protect
          more of your retirement under the same cap.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Roth IRA vs Roth 401(k)</h2>
        <p style={pStyle}>
          If your employer offers a Roth option in its 401(k), 403(b), or governmental 457 plan, that's a separate account
          with different rules.
        </p>
        <p style={pStyle}>
          The biggest difference is room. The 2026 employee limit for 401(k) plans is $24,500, with extra catch-up room if
          you're 50 or older (and more if you're 60 to 63). The IRA cap is $7,500. A Roth 401(k) also has no income limit,
          so high earners who are shut out of a Roth IRA can still go Roth at work. Some plans allow loans, and you can
          only invest in what the plan offers.
        </p>
        <p style={pStyle}>
          The Roth IRA has the opposite strengths: you pick the provider and the investments, and you can withdraw
          contributions anytime. Many people use both. A common order is to take the full employer match first, then fund
          a Roth IRA, then go back to the 401(k).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One correction to an old claim you'll still see around: Roth 401(k)s used to require minimum distributions.
          Starting in 2024, they don't. And if you're a high earner, starting in 2026, 401(k) catch-up contributions
          generally have to go in as Roth, so check with your plan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Roth IRA Withdrawal Rules</h2>
        <p style={pStyle}>
          Withdrawal rules are where Roth IRAs are most useful and also where people get burned, so it's worth knowing the
          order.
        </p>
        <p style={pStyle}>
          <strong>Your contributions come out first, and they're always free.</strong> You already paid tax on that
          money, so you can take it out at any age, for any reason, with no tax and no penalty. If you've put in $50,000
          over the years and the account's worth $80,000, the first $50,000 you withdraw is untouched.
        </p>
        <p style={pStyle}>
          <strong>Conversions come next, then earnings.</strong> Earnings are the part with restrictions. Earnings come
          out tax-free and penalty-free only if the withdrawal is "qualified," which means two conditions are met: you're
          at least 59½ (or you're disabled, or the money goes to a beneficiary after your death, or it's a first-time home
          purchase), and the five-year clock has run.
        </p>

        <h3 style={h3Style}>The five-year rule, explained properly</h3>
        <p style={pStyle}>
          The five-year rule trips up a lot of people because there are really two of them. The first clock starts on
          January 1 of the tax year you first contributed to any Roth IRA. That's one clock for all your Roth IRAs, so
          opening a second account later doesn't restart it. You can even make a 2026 contribution in early 2027 and have
          it count toward 2026, which starts the clock on January 1, 2026.
        </p>
        <p style={pStyle}>
          The second clock applies to conversions. Each conversion has its own five-year period, starting January 1 of the
          year you converted. It only matters if you're under 59½, because pulling converted money out too early triggers
          the 10% penalty (though not tax, since you already paid it at conversion).
        </p>

        <h3 style={h3Style}>Early withdrawals of earnings</h3>
        <p style={pStyle}>
          If you take earnings out before meeting the rules, they're taxed as ordinary income and usually hit with a 10%
          penalty. The penalty (not the tax) is waived in several cases:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Disability</li>
          <li style={liStyle}>First-time home purchase, up to $10,000 lifetime</li>
          <li style={liStyle}>Qualified higher education expenses</li>
          <li style={liStyle}>
            Unreimbursed medical expenses above a percentage of your income, or health insurance premiums while unemployed
          </li>
          <li style={liStyle}>A birth or adoption, up to $5,000 per child</li>
          <li style={liStyle}>Substantially equal periodic payments</li>
          <li style={liStyle}>A small emergency withdrawal, up to $1,000 a year</li>
          <li style={liStyle}>Payments to a beneficiary after death</li>
        </ul>
        <p style={pStyle}>
          Check the current rules before relying on any of these. The exceptions have shifted a few times in recent years.
        </p>

        <h3 style={h3Style}>The emergency fund question</h3>
        <p style={pStyle}>
          Because contributions are always accessible, a lot of people treat a Roth IRA as a backup emergency fund. It
          works, but there's a catch: you generally can't put that money back. Once you withdraw a contribution, you've
          lost that tax-free space, and you can only re-contribute within your normal annual limit. A $7,500 withdrawal in
          your 30s can cost you much more than $7,500 by retirement. Use it as a last resort, not a first move.
        </p>

        <h3 style={h3Style}>No required minimum distributions</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With a traditional IRA, the government makes you start taking money out at 73 or 75 depending on your birth
          year. A Roth IRA has no required distributions during your life. So if you don't need the money, it can keep
          growing, and you control when income shows up on your tax return.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Saver's Credit</h2>
        <p style={pStyle}>
          The Saver's Credit is the one real tax break you can get for contributing to a Roth IRA. It's for lower- and
          moderate-income savers and works out to 10%, 20%, or 50% of your first $2,000 in contributions, depending on
          your income. At the top rate, that's up to $1,000 back. You claim it on Form 8880.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You must be 18 or older, not a full-time student, and not claimed as someone else's dependent. The credit is
          nonrefundable, so it only lowers a tax bill you actually owe. Income cutoffs change each year, and in round
          numbers the credit phases out somewhere around $40,000 for single filers and $80,000 for married couples. Check
          the current table before you count on it. A lot of eligible people never claim it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pros and Cons of a Roth IRA</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>The upsides</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}>Tax-free growth and tax-free qualified withdrawals.</li>
          <li style={liStyle}>Contributions can be withdrawn anytime.</li>
          <li style={liStyle}>No required minimum distributions for you.</li>
          <li style={liStyle}>Plenty of investment choices, limited mainly by your provider.</li>
          <li style={liStyle}>
            Tax flexibility in retirement. Since Roth withdrawals don't count as taxable income, they can help keep you in
            a lower bracket, and they won't make more of your Social Security taxable.
          </li>
          <li style={liStyle}>
            Retirement account balances aren't reported as assets on the FAFSA. That helps with need-based aid, though how
            withdrawals are treated can vary by aid formula, and some private schools use their own, so ask the financial
            aid office.
          </li>
          <li style={liStyle}>
            They're good for heirs. Most non-spouse beneficiaries have to empty an inherited Roth within 10 years, but
            qualified withdrawals are tax-free. Spouses can treat it as their own and leave it alone. Since there's no tax
            bill on a Roth, moving money into one can shrink your taxable estate.
          </li>
        </ul>
        <h3 style={h3Style}>The downsides</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>You pay tax up front.</li>
          <li style={liStyle}>The contribution cap is low compared to a 401(k).</li>
          <li style={liStyle}>High earners can't contribute directly.</li>
          <li style={liStyle}>No tax deduction, and nothing to lower your bill this year.</li>
          <li style={liStyle}>The five-year rule means you can't touch earnings tax-free right away.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            If you plan to leave money to charity, a Roth is the wrong account. Charities don't pay tax, so there's nothing
            to save by giving them Roth money. Leave the traditional IRA to the charity and the Roth to your family.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Roth Conversions and the Backdoor Roth</h2>
        <p style={pStyle}>
          If your income is too high to contribute directly, or you've got a big traditional IRA, you can convert to a
          Roth. There's no income limit on conversions and no annual cap. The catch is that the converted amount, minus any
          after-tax basis, is taxed as ordinary income in the year you do it.
        </p>
        <p style={pStyle}>
          That's why it's often called a backdoor Roth when it's used by high earners: they make a nondeductible
          contribution to a traditional IRA, then convert it. This works cleanly only if you have no other pre-tax IRA
          money. Otherwise the pro-rata rule applies, which treats all your traditional, SEP, and SIMPLE IRA balances as
          one pot at year-end and taxes the conversion proportionally. You report all this on Form 8606.
        </p>

        <h3 style={h3Style}>Three ways to convert</h3>
        <p style={pStyle}>
          <strong>Same institution.</strong> The simplest route is a transfer within the firm that holds your traditional
          IRA.
        </p>
        <p style={pStyle}>
          <strong>Different institutions.</strong> You can move the money to a new provider, which handles the paperwork.
          If you hold individual stocks you don't want to sell, they can often move in kind.
        </p>
        <p style={pStyle}>
          <strong>60-day rollover.</strong> You take a check and deposit it into the Roth yourself. Miss the 60-day
          deadline, and the amount becomes taxable, and if you're under 59½, you can owe the 10% penalty on top. The IRS
          can waive the deadline for things like a disaster or something truly beyond your control. This is the riskiest
          route.
        </p>
        <p style={pStyle}>
          You're limited to one 60-day IRA-to-IRA rollover per 12 months across all your IRAs. Direct transfers and
          conversions don't count toward it.
        </p>

        <h3 style={h3Style}>Things to check before converting</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Pay the tax from outside the IRA.</strong> Using IRA money to cover the bill defeats the point, because
            you lose the tax-free growth on it.
          </li>
          <li style={liStyle}>
            <strong>Check your bracket.</strong> A big conversion can push you into a higher bracket, raise your Medicare
            premiums, or reduce ACA subsidies. Converting in smaller chunks over several years, or in a low-income year,
            often works better than one big move.
          </li>
          <li style={liStyle}>
            <strong>Be careful with the funding source.</strong> Selling appreciated investments to pay the tax can trigger
            capital gains.
          </li>
          <li style={liStyle}>
            <strong>Mind the clock.</strong> If you're close to retirement, make sure the money has time to grow enough to
            make up for the tax you paid.
          </li>
          <li style={liStyle}>
            <strong>RMDs can't be converted.</strong> If you're old enough to owe a required distribution, take it first.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>You can't undo it.</strong> Since 2018, conversions can't be recharacterized. Once it's done, it's
            done.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Real-Number Scenarios</h2>
        <p style={pStyle}>
          Seeing the numbers on screen makes the abstract advice click. Here are some cases to run in the calculator, all
          at $7,500 a year and a 7% return.
        </p>
        <p style={pStyle}>
          <strong>Starting age.</strong> Start at 25 and keep going until 65, and you end up with about $1.5 million.
          Start at 35 and you land near $708,000. Start at 45, and it's about $307,000. Waiting ten years, from 25 to 35,
          cuts the result by more than half, even though you only skipped $75,000 of contributions.
        </p>
        <p style={pStyle}>
          <strong>Starting late.</strong> If you're 50 and just getting going, the picture's different but not hopeless.
          Maxing out at $8,600 a year for 15 years at 6% gives you around $200,000, from $129,000 of contributions.
        </p>
        <p style={pStyle}>
          <strong>Fees.</strong> A 1% annual fund fee sounds tiny. But a 7% return with 1% in fees leaves you with 6% to
          compound, and over 30 years, that drops your balance from about $708,000 to about $593,000. That's roughly
          $115,000, or 16% of the final amount. Check the expense ratios on whatever you buy, and run the calculator at
          your return after fees.
        </p>
        <p style={pStyle}>
          <strong>Inflation.</strong> The $708,000 projection is in future dollars. At 3% inflation, that has the buying
          power of about $292,000 today. If you want to think in today's dollars, you can lower your return by the
          inflation rate, but that assumes your contributions grow with inflation too. If you keep contributing a flat
          $7,500, the real result is lower.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Retirement target.</strong> Work backward. Start with the balance you want, then adjust the contribution
          until the projection hits it. Compare that to the $7,500 limit, and you'll know if a Roth alone can get you
          there.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Is This Roth IRA Calculator?</h2>
        <p style={pStyle}>
          The math is exact. The inputs are guesses. The calculator can compound your numbers with precision, but it can't
          know what the market does, so treat the output as a planning estimate, not a forecast.
        </p>
        <p style={pStyle}>
          Real life will differ in a few ways. Returns don't show up as a smooth average. A crash in your last few working
          years does far more damage than one in your first few. Contribution limits change almost every year, which means
          the cap in 2040 won't match today's. And tax law can change.
        </p>
        <p style={pStyle}>
          The most useful habit is to run three cases: a cautious one, an expected one, and an optimistic one. If your
          cautious case still gets you somewhere you can live with, you've got a solid plan. Check back once a year, when
          the IRS announces new limits.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is for planning and education. It's not financial or tax advice. For big decisions like large
          conversions, high-income strategies, or estate planning, talk to a tax professional who can look at your actual
          return.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Simple, and Easy to Trust</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The Roth IRA calculator on Tolz is free. There's no paid tier hiding the results and no charge to run as many
          scenarios as you want. The inputs are plain numbers, and the output is a graph and a table, so you don't need a
          finance background to read it. The 2026 limits are already in place, so you don't have to look them up first.
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
