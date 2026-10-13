import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my RMD?",
    a: "Take your account balance as of December 31 of the previous year and divide it by the distribution period from the IRS table that applies to you. The calculator handles both steps once you enter your age and balance.",
  },
  {
    q: "What age do RMDs start?",
    a: "Age 73 if you were born between 1951 and 1959. Age 75 if you were born in 1960 or later.",
  },
  {
    q: "When is my first RMD due?",
    a: "By December 31 of the year you reach RMD age, or by April 1 of the following year if you use the delay. If you delay, you'll have to take a second RMD by December 31 of that same year, so you'll have two RMDs in one tax year.",
  },
  {
    q: "Which IRS table does this calculator use?",
    a: "It uses the Uniform Lifetime Table by default. If your spouse is your sole beneficiary and is more than 10 years younger, it uses the Joint Life and Last Survivor Expectancy Table, which gives a lower RMD.",
  },
  {
    q: "What's the penalty for missing an RMD?",
    a: "A 25% excise tax on the amount you didn't withdraw. If you correct it within two years, it can drop to 10%. The IRS can waive it if the shortfall was a reasonable error and you've taken steps to fix it.",
  },
  {
    q: "Do Roth IRAs have RMDs?",
    a: "Not for the original owner. Roth 401(k) accounts also stopped requiring RMDs in 2024. Beneficiaries who inherit a Roth account do have to follow distribution rules.",
  },
  {
    q: "Can I take my RMD from any account?",
    a: "Only within the same type. You can total your IRA RMDs and take them from any IRA, and the same goes for 403(b)s. A 401(k) RMD has to come from that specific plan.",
  },
  {
    q: "What if I have more than one IRA?",
    a: "Calculate the RMD for each one, add them up, and withdraw that total from one IRA or spread it across several. Your spouse's IRAs can't be combined with yours.",
  },
  {
    q: "Can I withdraw more than my RMD?",
    a: "Yes. The RMD is a minimum. Extra money you take out is taxable, but it doesn't reduce next year's RMD.",
  },
  {
    q: "Are RMDs taxable?",
    a: "Yes. They're generally taxed as ordinary income at the federal level and in most states. A qualified charitable distribution is the main way to satisfy an RMD without adding to your taxable income.",
  },
  {
    q: "Can I reinvest my RMD or roll it over?",
    a: "You can't put it back into an IRA or 401(k), and an RMD can't be rolled over or converted to Roth. You can put the money into a regular taxable brokerage account.",
  },
  {
    q: "What information do I need to use the calculator?",
    a: "Your age or birth year, the account balance as of last December 31, and your spouse's age if they're your sole beneficiary and more than 10 years younger.",
  },
  {
    q: "What if my balance changed because of a rollover or transfer?",
    a: "If money was in transit between accounts at year-end, the amount generally gets added back to the December 31 balance. Check with your custodian to confirm the figure they're using.",
  },
  {
    q: "What happens to RMDs after age 100?",
    a: "The Uniform Lifetime Table keeps going to age 120 and over, and the divisor keeps shrinking. At 100 the factor is 6.4, which means you'd withdraw about 15.6% of the prior year-end balance.",
  },
  {
    q: "Does this calculator work for inherited IRAs?",
    a: "No. Inherited accounts follow different rules, including the 10-year rule and the Single Life table. This tool is for people taking RMDs from their own accounts.",
  },
];

// Structured data uses the supplied schema wording, which differs from the visible text in one answer.
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  item.q === "When is my first RMD due?"
    ? { ...item, a: "By December 31 of the year you reach RMD age, or by April 1 of the following year if you use the delay. If you delay, you must take a second RMD by December 31 of that same year, so you'll have two RMDs in one tax year." }
    : item
);

const UNIFORM_HEADERS = ["Age", "Distribution period", "Share of balance you must withdraw"];
const UNIFORM_ROWS = [
  ["73", "26.5", "about 3.77%"],
  ["75", "24.6", "about 4.07%"],
  ["80", "20.2", "about 4.95%"],
  ["85", "16.0", "6.25%"],
  ["90", "12.2", "about 8.20%"],
  ["95", "8.9", "about 11.24%"],
  ["100", "6.4", "about 15.63%"],
  ["110", "3.5", "about 28.57%"],
  ["120 and over", "2.0", "50%"],
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

export default function RmdCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is a Required Minimum Distribution?</h2>
        <p style={pStyle}>
          A required minimum distribution, or RMD, is the least amount the IRS says you have to withdraw each year from
          most tax-deferred retirement accounts once you hit a certain age. The reasoning is pretty simple. You (probably)
          got a tax break when the money went in, and it grew for years without being taxed. The government doesn't let
          that go on forever, so at some point it makes you start taking money out and paying tax on it.
        </p>
        <p style={pStyle}>
          It's a minimum, not a target. You can always take more. Plenty of retirees take far more than their RMD because
          they need the income, and that's fine. You just can't take less.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because most RMDs are taxed as ordinary income, an RMD calculator isn't only a withdrawal tool. It's also a
          quick way to see how much taxable income is coming your way, which matters for planning.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This RMD Calculator Works</h2>
        <p style={pStyle}>
          The math is a single division problem: your account balance on December 31 of the prior year, divided by a
          distribution period (the IRS calls it a life expectancy factor) from the right IRS table. That's it. The
          calculator takes three inputs.
        </p>
        <p style={pStyle}>
          <strong>Your age or birth year.</strong> The IRS uses the age you'll reach by the end of the calendar year, not
          your age today. Someone born in March who's 72 in January and turns 73 in March uses the factor for 73.
        </p>
        <p style={pStyle}>
          <strong>Last year's December 31 balance.</strong> Use the fair market value on that date, not whatever the
          account shows today. This is the mistake we see most often. People pull up their current balance, which has
          moved around since, and end up with the wrong number.
        </p>
        <p style={pStyle}>
          <strong>Your spouse's age, if it applies.</strong> This only matters when your spouse is your sole beneficiary
          for the whole year and is more than 10 years younger than you. That switches the calculation to the Joint Life
          table.
        </p>
        <p style={pStyle}>
          Your balance on December 31 isn't always the number on your year-end statement. If you had a rollover or
          transfer in motion at year-end, meaning money left one IRA but hadn't landed in the other by December 31, the
          amount in transit gets added back to the balance. Your custodian usually handles this, but it's worth knowing if
          your own math doesn't match theirs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more detail about timing. If you wait until April 1 to take your first RMD, that first one is still
          calculated off the December 31 balance from two years back (the end of the year before you turned 73). Your
          second RMD, due that same year, uses the balance from the end of the year you turned 73. The calculator keeps
          those straight so you don't have to.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Uniform Lifetime Table vs. Joint Life Table</h2>
        <p style={pStyle}>
          Most people use the <strong>Uniform Lifetime Table</strong>. It applies if you're single, widowed, or married to
          someone who's less than 10 years younger than you (or your spouse isn't your only beneficiary). The table
          assumes your beneficiary is exactly 10 years younger, which is why it works as a one-size-fits-all.
        </p>
        <p style={pStyle}>
          The <strong>Joint Life and Last Survivor Expectancy Table</strong> is the exception, and it only applies if both
          of these are true: your spouse is your sole beneficiary for the entire year, and your spouse is more than 10
          years younger than you. Since the two of you are expected to live longer together than a single person would,
          the divisor gets bigger and your RMD gets smaller. With a big age gap, that can leave a meaningful chunk of money
          invested for another year.
        </p>
        <p style={pStyle}>
          The IRS refreshed these tables starting with 2022 distributions to reflect that people are living longer. That
          lowered RMDs for most retirees compared to the old tables. Here's a sample of Uniform Lifetime factors so you
          can see how fast the divisor drops:
        </p>
        <DataTable headers={UNIFORM_HEADERS} rows={UNIFORM_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These tables come straight from IRS Publication 590-B. The calculator uses the current versions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RMD Age and Deadlines: When Do You Have to Start?</h2>
        <p style={pStyle}>
          The starting age has moved a few times, which is why so many people are confused about it. It was 70½ for
          years. The 2019 SECURE Act raised it to 72, and SECURE 2.0 (passed in December 2022) raised it to 73 starting
          in 2023 and set it to rise again to 75. Where you land depends on when you were born:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Born 1950 or earlier: you're already taking RMDs.</li>
          <li style={liStyle}>Born 1951 through 1959: age 73.</li>
          <li style={liStyle}>Born 1960 or later: age 75.</li>
        </ul>
        <p style={pStyle}>
          Your first RMD is for the year you reach your RMD age. You get a one-time break on timing: instead of taking it
          that year, you can wait until April 1 of the following year. Every RMD after that is due by December 31.
        </p>
        <p style={pStyle}>
          Before you use that April 1 grace period, think it through. Delaying means taking two RMDs in the same calendar
          year, the late first one and the regular second one. That stacks two years of taxable income into one. For a lot
          of people, that pushes some of the income into a higher bracket, can bump Medicare premiums, and can make more
          of their Social Security taxable. Here's the example: if you turn 73 in 2026, you can take your first RMD any
          time in 2026, or hold off until April 1, 2027. If you hold off, your second one is still due by December 31,
          2027, so 2027 would carry both.
        </p>
        <p style={pStyle}>
          <strong>The still-working exception.</strong> If you're still employed past RMD age and you own less than 5% of
          the company, your current employer's plan (like a 401(k) or 403(b)) may let you wait until the year you actually
          retire. Two catches. First, it only applies to the plan at the job you're still working at. Old 401(k)s from
          former employers don't qualify. Second, it doesn't apply to IRAs at all, including SEP and SIMPLE IRAs, even if
          you're still working. Some plans don't offer the delay either, so check with yours.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Can you skip a year?</strong> No. There have only been two one-year waivers in recent memory, one after
          the 2008 financial crisis (for 2009) and one during the pandemic (for 2020). Don't count on a repeat.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Two Worked Examples</h2>
        <p style={pStyle}>
          <strong>Example 1: A straightforward single account.</strong> Say you turn 73 this year, and your one IRA was
          worth $100,000 on December 31 of last year. The factor at 73 is 26.5. Divide $100,000 by 26.5 and your RMD is
          $3,773.58.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Example 2: A larger balance at 75.</strong> Suppose you're 75 with a traditional IRA that was worth
          $500,000 last December 31. The factor at 75 is 24.6. Divide $500,000 by 24.6 and you get $20,325, which works
          out to roughly 4.07% of the balance. If your spouse were your sole beneficiary and 13 years younger, the Joint
          Life table would give a larger divisor and a smaller RMD than that. The gap depends on both ages, so it's easier
          to run both versions in the calculator than to guess.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Projecting RMDs and Your Balance to Age 120</h2>
        <p style={pStyle}>
          A one-year RMD number answers what you owe right now. It doesn't tell you what happens in five, ten, or twenty
          years. That's what the projection part of the calculator is for. It runs your RMD and your ending balance
          forward for every year through age 120, which is where the Uniform Lifetime Table stops.
        </p>
        <p style={pStyle}>
          You'll see two things play out at the same time. Your balance changes with your investment growth (you choose
          the rate), and your RMD takes a bigger bite each year as the divisor shrinks. Using the example above: you
          withdraw $20,325 from $500,000, the remaining $479,675 grows at 5%, and your balance heads into the next year at
          about $503,700. At 76 the factor is 23.7, so your RMD becomes about $21,250. Notice that the RMD went up even
          though you took money out, simply because the account grew more than you withdrew.
        </p>
        <p style={pStyle}>Looking at the full path helps with questions that are hard to answer from a single year's figure:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Will your required withdrawals eventually outrun what you actually spend?</li>
          <li style={liStyle}>At what age might RMDs push you into a higher bracket or trigger higher Medicare premiums?</li>
          <li style={liStyle}>Does it make sense to convert some money to Roth in your 60s, while your income is lower?</li>
          <li style={liStyle}>Roughly how much could be left for your heirs at 85, 90, or 95?</li>
          <li style={liStyle}>How long does the account realistically last if you're also withdrawing extra?</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A word of caution on projections: they're only as good as the growth rate you plug in. Real returns bounce
          around, and a few bad years early in retirement can change the picture a lot. Try a few different rates,
          including a low one, and look at the range instead of fixating on one result.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Which Accounts Have RMDs, and How to Combine Them</h2>
        <p style={pStyle}>RMDs apply to most tax-deferred retirement accounts:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Traditional IRAs (including rollover IRAs)</li>
          <li style={liStyle}>SEP IRAs and SIMPLE IRAs</li>
          <li style={liStyle}>Traditional 401(k) plans</li>
          <li style={liStyle}>403(b) plans</li>
          <li style={liStyle}>Governmental 457(b) plans</li>
          <li style={liStyle}>Profit-sharing plans and other employer-sponsored defined contribution plans</li>
          <li style={liStyle}>Variable annuities held inside an IRA</li>
        </ul>
        <p style={pStyle}>
          Roth IRAs are the notable exception. The original owner never has to take RMDs, since the money went in after
          tax. Roth 401(k) and Roth 403(b) accounts used to require them, but that ended in 2024, so they're now treated
          the same as Roth IRAs for the original owner.
        </p>
        <p style={pStyle}>
          You calculate the RMD for every account, but you don't always have to withdraw from every account. How it works
          depends on the type:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Traditional, SEP, and SIMPLE IRAs:</strong> calculate each one separately, add the amounts together,
            and take the total from any one IRA or any mix of them.
          </li>
          <li style={liStyle}>
            <strong>403(b) accounts:</strong> same idea. Calculate each, then pull the combined total from one or several
            403(b)s.
          </li>
          <li style={liStyle}>
            <strong>401(k) and 457(b) plans:</strong> each plan stands on its own. Five old 401(k)s means five separate
            RMDs, taken from each plan.
          </li>
          <li style={liStyle}>
            <strong>Inherited accounts:</strong> accounts you inherited from the same person can be combined. Ones from
            different people can't.
          </li>
        </ul>
        <p style={pStyle}>
          You can't mix categories. Taking extra from your IRA doesn't cover a 401(k) RMD, and the reverse is true too.
          Roth withdrawals never count toward an RMD either. So if you've got both an IRA and a 401(k), run the calculator
          once for each.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also, taking more than your RMD in one year doesn't get you a break next year. There's no credit carried
          forward. And when you take money out of an IRA, the IRS treats the first dollars out as your RMD, so you can't
          make a withdrawal early in the year and claim it was something else.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use an RMD Calculator</h2>
        <p style={pStyle}>
          <strong>A few years before RMD age.</strong> If you're 68 or 70 and want to know how big your required
          withdrawals will get, the projection shows it, which helps you decide whether to start drawing down early or
          convert some money to Roth.
        </p>
        <p style={pStyle}>
          <strong>Early in the year.</strong> Once you've got your December 31 balance from last year, you can figure out
          your exact RMD and plan when to take it.
        </p>
        <p style={pStyle}>
          <strong>Checking your custodian's number.</strong> Brokerages and plan administrators have to offer to calculate
          your RMD, but if they get it wrong, the penalty is still yours. A second opinion takes about a minute.
        </p>
        <p style={pStyle}>
          <strong>A spouse more than 10 years younger.</strong> Comparing the two tables shows you how much the Joint Life
          rule changes your number.
        </p>
        <p style={pStyle}>
          <strong>Several accounts.</strong> If you've got a couple of IRAs and a few old 401(k)s from past jobs, this is a
          quick way to see the total.
        </p>
        <p style={pStyle}>
          <strong>Helping a parent.</strong> Adult kids who handle a parent's finances can check the figure without
          digging through IRS tables.
        </p>
        <p style={pStyle}>
          <strong>Charitable giving.</strong> If you give to charity, knowing your RMD tells you how much a qualified
          charitable distribution could cover.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Retirement income planning.</strong> Seeing guaranteed future RMDs makes it easier to plan how Social
          Security, pensions, and other withdrawals fit together.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Actually Take Your RMD</h2>
        <p style={pStyle}>Knowing the number is half of it. Here are the common ways to take the money out.</p>
        <p style={pStyle}>
          <strong>Cash.</strong> The simplest approach is to sell enough investments to raise the cash and withdraw it.
          Mutual funds in a workplace plan trade at the next available net asset value, which is typically posted after
          the market closes. One approach is to sell in proportion to your portfolio. If one fund is 20% of your account,
          it covers about 20% of the RMD, and your overall mix stays close to where you want it.
        </p>
        <p style={pStyle}>
          <strong>In-kind transfer.</strong> If you don't need the cash, you can move shares from your retirement account
          to a regular taxable brokerage account without selling them. This counts as your RMD and keeps you invested. The
          catch is that you still owe tax on the value of those shares on the day they move, and you may need other money
          to cover the tax bill or any withholding. The upside is that the shares' value on that day becomes your new cost
          basis.
        </p>
        <p style={pStyle}>
          <strong>Qualified charitable distribution (QCD).</strong> If you're 70½ or older, you can send money straight
          from an IRA to a qualified charity. A QCD counts toward your RMD and doesn't show up as taxable income, which
          helps if you don't want the extra income. You don't get a charitable deduction on top, but because it's not
          income in the first place, that's usually a good trade. It also works if you take the standard deduction. A few
          rules: the money has to go directly from the IRA to the charity, it has to be done by December 31, and it can't
          go to a donor-advised fund. There's an annual limit that adjusts with inflation (around $111,000 per person for
          2026). SECURE 2.0 also allows a one-time QCD to a charitable gift annuity, with a lifetime cap that's currently
          in the mid-$50,000s.
        </p>
        <p style={pStyle}>
          <strong>Automatic withdrawals.</strong> Most custodians will calculate your RMD and send it on a schedule you
          pick, monthly, quarterly, or once a year. It's a good way to make sure it gets done. The IRS only cares that the
          total hits the minimum by December 31, so you can take it all in one lump sum or spread it out.
        </p>
        <p style={pStyle}>
          <strong>Income annuity.</strong> If you buy an income annuity with money from the account, the payments
          automatically count as the RMD for the money used to buy it. SECURE 2.0 also lets you combine that annuity with
          your other IRAs when figuring your RMD.
        </p>
        <p style={pStyle}>
          <strong>Qualified longevity annuity contract (QLAC).</strong> A QLAC is a type of deferred annuity that lets you
          push the RMD start date for the money inside it as late as age 85. There's a dollar cap on how much you can put
          into one, and it makes sense for a pretty specific kind of person, so talk to a professional before going this
          route.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once the money's out, it's yours. Spend it, save it, or put it into a taxable account.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How RMDs Affect Your Taxes</h2>
        <p style={pStyle}>
          An RMD is generally taxed as ordinary income, at your regular federal rate, plus state income tax in most
          states. That's the main reason people dislike them: the income isn't optional, and it can be big.
        </p>
        <p style={pStyle}>A larger RMD can ripple into other places in your finances:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Tax brackets.</strong> If you've also got Social Security, a pension, or part-time income, an RMD can
            push some of it into a higher bracket.
          </li>
          <li style={liStyle}>
            <strong>Social Security.</strong> More income can make more of your benefit taxable (up to 85%).
          </li>
          <li style={liStyle}>
            <strong>Medicare premiums.</strong> Medicare Part B and D premiums rise at higher income levels through IRMAA,
            and the IRS looks back two years. So your RMD at 73 can affect your Medicare premiums at 75.
          </li>
          <li style={liStyle}>
            <strong>Withholding.</strong> IRA distributions usually have 10% federal tax withheld unless you change it.
            You can ask for more, and often for less or none, so a surprise bill doesn't show up in April. Your plan or
            custodian can set this up.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you take an in-kind transfer instead of cash, you're taxed on the shares' value when they move. Take, for
          example, shares you originally paid $5,000 for that are worth $2,500 now. You'd pay tax on the $2,500, and that
          becomes your new basis. If they've grown, the basis steps up to the current value.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RMD Penalties and Common Mistakes</h2>
        <p style={pStyle}>
          If you take less than you're supposed to, the IRS charges a 25% excise tax on the amount you missed. If you fix
          it within the correction window (generally two years), it drops to 10%. For example, if you were $1,000 short,
          you'd owe $250, or $100 if you corrected it in time. You report this on Form 5329. The IRS can also waive it
          entirely if the shortfall was due to a reasonable error and you've fixed it, but that's a request you make, not
          something that happens automatically.
        </p>
        <p style={pStyle}>
          Brokerages and plan administrators are required to offer to calculate your RMD, and many send reminders. But the
          IRS puts responsibility on you. If your custodian gets it wrong, the penalty still lands on you. That's why it's
          smart to check the number yourself each year, using this calculator or any other method you trust.
        </p>
        <p style={pStyle}>Most shortfalls come from the same handful of errors:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Using the current balance instead of the December 31 balance from the prior year.</li>
          <li style={liStyle}>
            Using the wrong table, usually missing that a spouse more than 10 years younger changes things, or applying the
            Joint Life table when the spouse isn't the sole beneficiary.
          </li>
          <li style={liStyle}>Taking an IRA RMD from a 401(k) (or the other way around) and assuming it counts.</li>
          <li style={liStyle}>
            Forgetting an old account, like a small 401(k) from a previous job. Every account has its own requirement.
          </li>
          <li style={liStyle}>
            Rolling over the RMD. An RMD can't be rolled over, and it can't be converted to Roth. If you've got a rollover
            or Roth conversion planned for the year, take your RMD first.
          </li>
          <li style={liStyle}>
            Waiting too long. December 31 is the deadline, and trades and transfers take time to settle. Don't leave it to
            the last week.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Counting the wrong withdrawals. Roth withdrawals and withdrawals made before RMD age don't satisfy anything.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Reduce the Tax Hit from RMDs</h2>
        <p style={pStyle}>You can't skip RMDs, but you can shrink or shape them.</p>
        <p style={pStyle}>
          <strong>Qualified charitable distributions.</strong> If you give to charity anyway, a QCD is usually the
          cleanest way to turn an RMD into something that doesn't raise your taxable income.
        </p>
        <p style={pStyle}>
          <strong>Roth conversions before RMD age.</strong> If you retired but haven't started Social Security or RMDs
          yet, your income might be unusually low. Converting some traditional IRA money to Roth during those years means
          paying tax now at a lower rate, and it shrinks the balance that future RMDs are based on. Just keep in mind that
          you can't convert the RMD itself.
        </p>
        <p style={pStyle}>
          <strong>Keeping money in Roth accounts.</strong> Since Roth IRAs and Roth 401(k)s have no lifetime RMDs, they
          give you flexible income later without adding to your taxable income. Rolling a Roth 401(k) into a Roth IRA is
          still worth considering if your plan has other quirks.
        </p>
        <p style={pStyle}>
          <strong>The still-working exception.</strong> If you qualify, keeping money in your current employer's plan
          lets you delay RMDs from it.
        </p>
        <p style={pStyle}>
          <strong>QLAC or income annuity.</strong> These can lower or defer the required amount on the money that goes
          into them.
        </p>
        <p style={pStyle}>
          <strong>Withholding and estimated payments.</strong> They don't reduce the tax, but they stop a nasty surprise at
          filing time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Timing within the year.</strong> Since the deadline is December 31, you can wait until you know your
          income for the year, but don't wait so long that you run into a market dip or a processing delay.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Inherited Accounts Work Differently</h2>
        <p style={pStyle}>
          This calculator is built for account owners taking RMDs from their own accounts. If you inherited an IRA or
          401(k), different rules apply, and they depend on who died, how old they were, and who you are.
        </p>
        <p style={pStyle}>The short version, in case you're wondering which bucket you're in:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Most non-spouse beneficiaries</strong> have to empty the account within 10 years of the owner's
            death. If the owner had already started taking RMDs, you generally also have to take annual withdrawals during
            years one through nine, and then clear the rest by year ten. If the owner died before RMD age, you typically
            just need to empty it by the end of year ten.
          </li>
          <li style={liStyle}>
            <strong>Eligible designated beneficiaries</strong> get more flexibility. That group includes surviving
            spouses, the owner's minor children (until they reach adulthood, when the 10-year clock starts), people who are
            disabled or chronically ill, and anyone not more than 10 years younger than the owner. Many can stretch
            withdrawals over their own life expectancy.
          </li>
          <li style={liStyle}>
            <strong>Surviving spouses</strong> can usually treat the account as their own, which means the normal RMD
            rules, or keep it as an inherited account with its own timing. That choice matters, and the better option
            depends on your age and your needs.
          </li>
          <li style={liStyle}>
            <strong>Inherited Roth IRAs</strong> still follow the 10-year rule for most non-spouse heirs.
          </li>
          <li style={liStyle}>
            <strong>Inherited 401(k)s</strong> depend heavily on the plan. Some let you leave the money in, others require
            a faster payout, and rolling it into an inherited IRA is often possible.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Inherited-account rules are complicated enough that most people benefit from a professional's help. The numbers
          also don't work the same way, because inherited IRAs use the Single Life table, not the Uniform Lifetime Table
          this tool is built on.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Based on IRS Tables</h2>
        <p style={pStyle}>
          The RMD calculator is free to use. It only needs numbers like your age and a balance, so there's no reason to
          enter your name, Social Security number, or account numbers. The factors come from the IRS tables in Publication
          590-B, so the math follows the same rules your custodian uses.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Still, treat the result as a solid estimate, not an official figure. Your custodian reports your actual December
          31 balance, and many include an RMD amount on Form 5498 or in a notice they send in January. If your number and
          theirs don't match, the difference usually comes down to one of the balance adjustments mentioned above. If
          you've got several plans, an inherited account, or a very large balance, it's worth a quick conversation with a
          tax professional before you withdraw.
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
