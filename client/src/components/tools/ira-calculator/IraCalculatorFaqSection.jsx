import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an IRA calculator?",
    a: "It's a tool that estimates how your contributions to an individual retirement account will grow over time and what you'd keep after taxes. It helps you compare account types and plan for retirement.",
  },
  {
    q: "Is this IRA calculator free?",
    a: "Yes. You can use it as many times as you want and try different assumptions.",
  },
  {
    q: "Which is better, a Roth IRA or a Traditional IRA?",
    a: "It mostly comes down to whether your tax rate will be higher or lower in retirement than it is now. A lower future rate favors Traditional, a higher one favors Roth, and similar rates give similar results. If you're not sure, many people split contributions between both.",
  },
  {
    q: "Can I compare a SEP or SIMPLE IRA with a Roth IRA here?",
    a: "Yes. The calculator compares Traditional, SIMPLE and SEP IRAs with a Roth IRA and a taxable account in one view.",
  },
  {
    q: "What are the IRA contribution limits for 2026?",
    a: "For Traditional and Roth IRAs, it's $7,500 across all accounts, plus $1,100 if you're 50 or older. SEP IRAs allow up to the lesser of 25% of compensation or $72,000. SIMPLE IRA employee deferrals are capped at $17,000, with higher catch-up amounts for people 50 and over. Confirm on IRS.gov, since the limits are adjusted regularly.",
  },
  {
    q: "How much will my IRA be worth in 20 or 30 years?",
    a: "It depends on your starting balance, how much you contribute, your rate of return and how long you stay invested. Enter your numbers and try more than one return rate.",
  },
  {
    q: "What rate of return should I use?",
    a: "Most people pick a conservative long-term figure rather than recent market highs. Testing a range is a better move than betting on a single number.",
  },
  {
    q: "Is an IRA better than a taxable account?",
    a: "Usually, thanks to the tax breaks, but IRAs come with contribution limits and withdrawal rules. A taxable account is more flexible. Plenty of people use both.",
  },
  {
    q: "At what age can I withdraw from an IRA without a penalty?",
    a: "At 59½ for most IRAs. Before that, you'll generally owe a 10% additional tax plus income tax, unless an exception applies. SIMPLE IRA withdrawals in the first two years can carry a 25% penalty.",
  },
  {
    q: "What is the Roth IRA 5-year rule?",
    a: "To take earnings out tax-free, your Roth IRA generally has to have been open for at least five tax years (counting from your first contribution to any Roth IRA) and you have to meet a qualifying condition, like being 59½ or older. Your contributions aren't affected, since you can withdraw those anytime.",
  },
  {
    q: "When do I have to start taking RMDs?",
    a: "Traditional, SEP and SIMPLE IRAs require minimum distributions starting at age 73 if you were born between 1951 and 1959, or 75 if you were born in 1960 or later. Roth IRAs have no RMDs for the original owner.",
  },
  {
    q: "Can I contribute to both an IRA and a 401(k)?",
    a: "Yes. The limits are separate. Your income can affect whether your Traditional IRA contribution is deductible and whether you can contribute directly to a Roth.",
  },
  {
    q: "What's the difference between a direct and indirect rollover?",
    a: "In a direct rollover, the money moves straight from one custodian to another, with no tax withheld. In an indirect rollover, you get a check and have 60 days to deposit it. Workplace plans generally withhold 20% on indirect rollovers.",
  },
  {
    q: "Does the calculator include taxes on withdrawals?",
    a: "Yes. Results are shown before and after tax so you can compare the accounts fairly.",
  },
  {
    q: "Is this financial advice?",
    a: "No. It's an educational planning tool. For personal tax or investment decisions, check with a qualified professional.",
  },
];

// Structured data uses the supplied schema wording, which punctuates one answer differently.
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  item.q === "What is the Roth IRA 5-year rule?"
    ? { ...item, a: "To take earnings out tax-free, your Roth IRA generally has to have been open for at least five tax years, counting from your first contribution to any Roth IRA, and you have to meet a qualifying condition like being 59½ or older. Your contributions aren't affected, since you can withdraw those anytime." }
    : item
);

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

export default function IraCalculatorFaqSection() {
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
        <h2 style={h2Style}>What an IRA Calculator Does</h2>
        <p style={pStyle}>
          An IRA calculator projects how your contributions grow over the years and what you'd actually keep after taxes.
          Compounding does most of the heavy lifting. Your money earns returns, those returns start earning returns of
          their own, and after a few decades the effect gets big.
        </p>
        <p style={pStyle}>
          Taxes decide how much of that pile is really yours, and that's where a lot of simple calculators fall short.
          They spit out one balance and leave it there. But a Traditional IRA balance hasn't been taxed yet, and a Roth IRA
          balance mostly has. Comparing those two raw numbers is like comparing a pre-tax salary to a take-home paycheck.
          To make the comparison fair, this IRA calculator puts everything on a before-tax and after-tax basis.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also includes a regular taxable account as a baseline. That matters because the honest question usually
          isn't "IRA or nothing." It's whether the tax break is worth the strings attached, like contribution caps and
          withdrawal rules.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an IRA?</h2>
        <p style={pStyle}>
          An IRA, or individual retirement account, is a tax-advantaged account you open yourself to save for retirement.
          You don't need an employer to sponsor it, which is the big difference from a 401(k) or 403(b). Congress created
          IRAs to nudge people into saving, and the tax break is the nudge.
        </p>
        <p style={pStyle}>
          When people say "IRA" without any other word, they usually mean a Traditional IRA. Anyone with earned income can
          open one. Some types, like the SEP and SIMPLE, are built for small business owners and their employees, so they
          run through an employer.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can open an IRA at a bank, a brokerage, a mutual fund company or an insurance company. The account type
          matters more than where you open it, because the type controls how your money is taxed.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Traditional, Roth, SEP, SIMPLE and Other IRA Types</h2>
        <p style={pStyle}>
          Each account type changes when you pay tax, which is exactly what the calculator models. Here's how they stack
          up.
        </p>
        <p style={pStyle}>
          <strong>Traditional IRA.</strong> Contributions may be tax-deductible, depending on your income, filing status
          and whether you (or your spouse) have a workplace plan. Your money grows tax-deferred, and you pay ordinary
          income tax when you withdraw. It tends to work well if you expect to be in a lower bracket in retirement than
          you are now. Withdrawals are penalty-free starting at age 59½, and you'll eventually have to take required
          minimum distributions.
        </p>
        <p style={pStyle}>
          <strong>Roth IRA.</strong> You put in money you've already paid tax on. Contributions aren't deductible, but
          qualified withdrawals, including all the growth, come out tax-free. You can pull out your original contributions
          any time without tax or penalty, since you were already taxed on that money. There are no RMDs during your
          lifetime, so a Roth can keep growing for as long as you want it to. Roth eligibility phases out at higher
          incomes.
        </p>
        <p style={pStyle}>
          <strong>SEP IRA.</strong> SEP stands for Simplified Employee Pension. It's popular with freelancers,
          contractors and small business owners because it's easy to set up and has very high limits. The employer makes
          the contributions (if you're self-employed, that's you), and they're deductible as a business expense. The
          taxes work like a Traditional IRA. Every eligible employee has to get the same percentage of pay, so owners with
          a bunch of staff usually don't go this route. Contributions are 100% vested right away, and there's no extra
          catch-up amount for people over 50.
        </p>
        <p style={pStyle}>
          <strong>SIMPLE IRA.</strong> SIMPLE stands for Savings Incentive Match Plan for Employees. It's meant for
          businesses with 100 or fewer employees and costs a lot less to run than a 401(k). Employees contribute through
          payroll, and the employer has to contribute too. The employer picks between matching up to 3% of pay or giving
          everyone a flat 2% whether they contribute or not. The tax treatment mirrors a Traditional IRA.
        </p>
        <p style={pStyle}>
          <strong>Payroll Deduction IRA.</strong> This one's less well known. An employer sets up a way for you to send
          part of each paycheck into a Traditional or Roth IRA you open yourself at a financial institution. It's a
          convenience feature. The account is still a regular IRA with regular IRA limits.
        </p>
        <p style={pStyle}>
          <strong>SARSEP.</strong> This is an older salary-reduction version of the SEP. New ones haven't been allowed
          since 1997, but people who were already in one can keep contributing. If you've got one, you probably know it.
        </p>
        <p style={pStyle}>
          <strong>Rollover IRA.</strong> It's not a different tax type so much as a landing spot. You use it to
          consolidate an old 401(k), 403(b), 457(b) or another IRA into one account. More on that below.
        </p>
        <p style={pStyle}>
          <strong>Self-Directed IRA.</strong> A Traditional or Roth IRA with a custodian that lets you hold unusual
          assets. We'll cover it in its own section.
        </p>
        <p style={pStyle}>
          <strong>Taxable account.</strong> No tax shelter at all. You pay tax on dividends and interest as they show up,
          and on gains when you sell, often at capital gains rates. In exchange you get total flexibility: no contribution
          caps, no age rules, no penalties for touching the money.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Seeing all of these modeled on your own numbers makes the tradeoffs a lot less abstract.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This IRA Calculator</h2>
        <p style={pStyle}>The inputs are easy, but each one changes the result, so here's what to think about.</p>
        <p style={pStyle}>
          <strong>Starting balance.</strong> Whatever's in the account today. Starting from scratch? Enter zero.
        </p>
        <p style={pStyle}>
          <strong>Annual contribution.</strong> How much you plan to add each year. Check it against the limits in the
          next section. Putting in more than the limit triggers a 6% excise tax on the excess every year it stays in the
          account, so it pays to keep your inputs realistic.
        </p>
        <p style={pStyle}>
          <strong>Years to grow.</strong> Your time until retirement. A 30-year horizon and a 10-year horizon can point to
          different winners, so don't just guess.
        </p>
        <p style={pStyle}>
          <strong>Expected rate of return.</strong> This is the shakiest number on the page, and nobody knows it in
          advance. Stock-heavy portfolios have historically outpaced bond-heavy ones over long stretches, but there's no
          guarantee. A conservative number is safer than a hopeful one. If you want to account for inflation, use a return
          after inflation, like 4% or 5% instead of 7% or 8%, and read the final balance as "today's dollars."
        </p>
        <p style={pStyle}>
          <strong>Tax rates.</strong> Enter your current marginal rate and the rate you expect in retirement. This pair
          drives the Traditional versus Roth result more than anything else. Not sure what your retirement rate will be?
          Run it three times with a lower, equal and higher rate and see how much the answer moves.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hit calculate and you'll get the graph and the annual schedule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading the Growth Graph and Annual Schedule</h2>
        <p style={pStyle}>
          The graph plots each account's balance over time. In the early years the lines sit close together because
          compounding hasn't had much time to work. They spread out later, which is pretty much the visual case for
          starting early.
        </p>
        <p style={pStyle}>
          The annual schedule gives you the same story in numbers: contributions, growth and ending balance, year by year.
          Use it to find specific milestones, like your balance at 55 or 60, or the year your investment growth in a
          single year is bigger than what you contributed. That's a nice moment to see on paper.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're aiming at a target, scan the schedule for the year you cross it. Then nudge your annual contribution
          up or down until that year lines up with your planned retirement date.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Before-Tax vs. After-Tax Results: Why the Comparison Matters</h2>
        <p style={pStyle}>
          Here's the thing a good Roth IRA vs. Traditional IRA calculator gets right: a $7,000 Traditional contribution
          and a $7,000 Roth contribution don't cost you the same. If you're in the 24% bracket, that Traditional
          contribution might cut your tax bill by about $1,680 this year. To put the same amount in a Roth, you're
          spending after-tax dollars, so your real out-of-pocket cost is higher. Put differently, the same take-home money
          buys a smaller Roth contribution.
        </p>
        <p style={pStyle}>
          Once you account for that, something surprising shows up. If your tax rate is the same when you contribute and
          when you withdraw, Traditional and Roth end up almost identical after tax. The gap comes from rate changes,
          which is why the tax inputs matter so much.
        </p>
        <p style={pStyle}>
          A lot of people assume they'll be in a lower bracket in retirement, since working income usually goes away.
          That's often true, but not always. A big pension, large RMDs from a fat Traditional balance, Social Security,
          rental income and just having a lot of savings can keep you in a solid bracket. Tax rates could also be
          different by then, since Congress changes them from time to time. That's a good reason to split money between
          Traditional and Roth if you're truly unsure. It gives you some control over which bucket you pull from in any
          given year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The taxable account usually trails when the tax shelter is available, though not always by as much as people
          expect, especially with long-held, tax-efficient investments like broad index funds. The comparison helps you
          decide whether to fill your IRA first or invest in a regular account, or to do both once you hit the cap.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IRA Contribution Limits for 2026</h2>
        <p style={pStyle}>
          These are the 2026 figures. The IRS usually announces next year's numbers in the fall, so it's worth
          double-checking on IRS.gov before you contribute.
        </p>
        <p style={pStyle}>
          <strong>Traditional and Roth IRA.</strong> You can contribute up to $7,500 in total across all your IRAs, with
          an extra $1,100 catch-up if you're 50 or older, for a total of $8,600. Your contribution can't be more than your
          earned income for the year. So if you earned $6,000, that's your ceiling, even though the IRS limit is higher.
          The $7,500 is a combined cap, so splitting it between a Traditional and a Roth doesn't give you extra room.
        </p>
        <p style={pStyle}>
          <strong>SEP IRA.</strong> The limit is the lesser of 25% of compensation or $72,000 for 2026. Self-employed
          folks should know the percentage works out lower in practice. Because your own contribution reduces the net
          earnings it's based on, the real rate is closer to 20% of net self-employment income after a couple of
          adjustments. The IRS has a worksheet for this.
        </p>
        <p style={pStyle}>
          <strong>SIMPLE IRA.</strong> Employee deferrals are capped at $17,000 for 2026 (or 100% of pay, whichever is
          less). If you're 50 to 59 or 64 and up, you can add $4,000 for $21,000, and if you're 60 to 63 you can add
          $5,250 for $22,250. Some employers that offer a slightly richer employer contribution can qualify for a modestly
          higher deferral limit. Ask your plan administrator. The employer's own contribution goes on top of your
          deferral.
        </p>
        <p style={pStyle}>
          <strong>Deadlines.</strong> For Traditional and Roth IRAs, you can contribute for a given tax year up until the
          filing deadline the next April, not counting extensions. That means contributions for 2026 can be made through
          mid-April 2027. SEP contributions are due by the business's tax filing deadline, including extensions. SIMPLE
          employee deferrals must be deposited within 30 days after the end of the month they came out of your pay.
        </p>
        <p style={pStyle}>
          <strong>Income limits.</strong> Roth eligibility phases out as your modified adjusted gross income goes up, and
          the phase-out ranges depend on your filing status. A Traditional IRA is open to anyone with earned income, but
          the deduction can shrink or disappear if you're covered by a workplace plan and your income is above certain
          levels. Look up the current ranges on IRS.gov, since they get adjusted every year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Spousal IRA.</strong> If one spouse has little or no income, the working spouse's earnings can cover
          contributions for both, as long as you file jointly. It's a handy way to double up on retirement savings for a
          household with one earner.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IRA Withdrawal Rules, Penalties and RMDs</h2>
        <p style={pStyle}>Most of the confusion about IRAs is about getting your money out. Here's the short version.</p>
        <p style={pStyle}>
          <strong>Traditional, SEP and SIMPLE.</strong> Withdrawals are taxed as ordinary income. If you take money out
          before 59½, you generally owe a 10% additional tax on top of that. After 59½, the penalty goes away, but you
          still owe income tax.
        </p>
        <p style={pStyle}>
          <strong>SIMPLE IRA gotcha.</strong> If you withdraw in the first two years after you first joined the plan, the
          penalty jumps to 25% instead of 10%. After two years, it drops to the normal 10%. This catches people off guard.
        </p>
        <p style={pStyle}>
          <strong>Roth IRA.</strong> Your contributions can come out anytime, tax-free and penalty-free. Earnings are
          tax-free only if the withdrawal is "qualified," meaning you're at least 59½ and the account has met the
          five-year rule. That rule says at least five tax years must pass from the first tax year you contributed to a
          Roth IRA. The clock starts once, with your first Roth IRA contribution, and it applies across all your Roth
          IRAs. If you pull earnings out too soon, you may owe tax, a penalty, or both.
        </p>
        <p style={pStyle}>
          <strong>Exceptions to the 10% penalty.</strong> There are several, though the details differ by account and
          situation. Common ones include:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Up to $10,000 (lifetime) for a first-time home purchase</li>
          <li style={liStyle}>Qualified higher education expenses</li>
          <li style={liStyle}>Birth or adoption of a child, up to $5,000 per parent</li>
          <li style={liStyle}>Total and permanent disability</li>
          <li style={liStyle}>Certain unreimbursed medical expenses above an income threshold</li>
          <li style={liStyle}>Health insurance premiums while unemployed</li>
          <li style={liStyle}>A small emergency expense withdrawal (up to $1,000 a year)</li>
          <li style={liStyle}>A series of substantially equal periodic payments</li>
        </ul>
        <p style={pStyle}>
          An exception generally waives the penalty but not the income tax, except where the Roth rules make the earnings
          tax-free.
        </p>
        <p style={pStyle}>
          <strong>Required minimum distributions.</strong> Traditional, SEP and SIMPLE IRAs force you to start taking
          money out eventually, and you pay tax on it. Plenty of sources still list age 73, and that's correct for people
          born from 1951 through 1959. If you were born in 1960 or later, the starting age is 75. Roth IRAs have no RMDs
          for the original owner.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Inherited IRAs.</strong> If you inherit an IRA from someone other than your spouse, most beneficiaries
          have to empty the account within 10 years. Spouses get more options, including treating the IRA as their own.
          Name your beneficiaries and review them every few years. They override your will.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rolling Over Old Retirement Accounts into an IRA</h2>
        <p style={pStyle}>
          Changing jobs usually leaves you with an old 401(k) sitting around. You've got a few choices: leave it, move it
          to your new employer's plan if that's allowed, cash it out, or roll it into an IRA. Cashing out is usually the
          worst one, since you'll typically owe income tax plus the 10% penalty if you're under 59½.
        </p>
        <p style={pStyle}>
          A rollover IRA can take money from a 401(k), 403(b), 457(b), SEP IRA, SIMPLE IRA, a pension plan, or another
          IRA. Here's what to know:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Direct rollover.</strong> Your old custodian sends the money straight to the new one. No tax is
            withheld and nothing counts as income. This is almost always the better way to go.
          </li>
          <li style={liStyle}>
            <strong>Indirect rollover.</strong> The old plan cuts you a check. If it came from a workplace plan, 20% is
            generally withheld for taxes, and you have 60 days to deposit the full amount, including the portion that was
            withheld, into the new account. Miss the 60-day window and the whole thing may be treated as a taxable
            distribution, with penalties if you're under 59½. The IRS can waive the deadline in some cases, like a bank
            error or serious illness.
          </li>
          <li style={liStyle}>
            <strong>One indirect IRA-to-IRA rollover per 12 months.</strong> Direct rollovers don't count toward that
            limit.
          </li>
          <li style={liStyle}>
            <strong>Rollovers don't count toward your annual contribution limit.</strong>
          </li>
          <li style={liStyle}>
            <strong>Paperwork.</strong> You'll get a Form 1099-R from the plan that paid you and Form 5498 from the IRA
            that received the money. A rollover isn't taxed, but you still report it on your return.
          </li>
          <li style={liStyle}>
            <strong>SIMPLE IRA wrinkle.</strong> You can't roll a SIMPLE IRA into anything else tax-free until you've been
            in the plan for two years.
          </li>
          <li style={liStyle}>
            <strong>Roth vs. Traditional.</strong> Pre-tax money goes into a Traditional rollover IRA. Moving pre-tax
            money into a Roth is a conversion, which is taxable.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Form 5498 errors do happen.</strong> Check yours for the wrong contribution year, missing conversion
            info or wrong RMD amounts, since a mistake there can cause a mistake on your return.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IRA vs. 401(k): Which Comes First?</h2>
        <p style={pStyle}>
          Traditional IRAs and 401(k)s work similarly: pre-tax contributions, tax-deferred growth, taxable withdrawals.
          You can also contribute to both in the same year. For 2026, the 401(k) employee limit is $24,500, plus whatever
          you can do in an IRA.
        </p>
        <p style={pStyle}>The differences are practical:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Limits.</strong> 401(k)s let you save a lot more per year.
          </li>
          <li style={liStyle}>
            <strong>Employer match.</strong> A 401(k) often comes with a company match, which is free money. If yours has
            one, the usual advice is to contribute at least enough to get the full match before putting money elsewhere.
          </li>
          <li style={liStyle}>
            <strong>Investment choices.</strong> 401(k)s tend to offer a short menu of funds and can come with higher
            administrative fees. IRAs let you choose from nearly everything a brokerage offers.
          </li>
          <li style={liStyle}>
            <strong>Access.</strong> Anyone with earned income can open an IRA. A 401(k) only exists if your employer
            offers one.
          </li>
        </ul>
        <p style={pStyle}>
          For a lot of people, a sensible order looks like this: get the full 401(k) match, then max out an IRA (Roth or
          Traditional, depending on your situation), then go back and add more to the 401(k), then use a taxable account
          for anything left. Your situation may call for a different order, and the calculator can help you test it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          SEP and SIMPLE IRAs fill the gap for businesses too small to run a 401(k). They aren't the same as a 401(k)
          match, though. A SEP is employer-funded only, and a SIMPLE has the mandatory 3% match or 2% flat contribution.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Invest In Inside an IRA</h2>
        <p style={pStyle}>
          An IRA is an account, not an investment. What you put inside it matters just as much as which type you pick,
          and because most brokerages offer a huge menu, you have lots of options.
        </p>
        <p style={pStyle}>
          <strong>Individual stocks.</strong> You pick and manage the companies yourself. Returns can be higher, but so
          can the risk, and it takes real time and research. It's a harder road for beginners.
        </p>
        <p style={pStyle}>
          <strong>Mutual funds and index funds.</strong> A mutual fund pools money from lots of investors and a manager
          invests it. An index fund skips the manager and tracks a benchmark, like the S&amp;P 500 or the Dow. They're
          probably the most popular choice for IRAs because they're simple, diversified and meant to be held for the long
          term. Fees vary a lot, from under 0.1% to over 5%, and the difference compounds. Over 30 years, a fee that looks
          small can quietly eat a big chunk of your balance, so check the expense ratio.
        </p>
        <p style={pStyle}>
          <strong>Robo-advisors.</strong> Automated services that build and manage a diversified portfolio for you based
          on your goals, usually for a low fee. Handy if you want to set it up and leave it alone.
        </p>
        <p style={pStyle}>
          <strong>Other options.</strong> Bonds, CDs, annuities, REITs, and in some cases precious metals can sit inside
          an IRA. A CD or bond is the lower-risk end, and you'd probably expect a lower long-term return. That's something
          to keep in mind when you choose a rate in the calculator.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also, the IRS doesn't approve or endorse any IRA investment. That's on you and your custodian.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Self-Directed IRAs</h2>
        <p style={pStyle}>
          A self-directed IRA is a Traditional or Roth IRA that lets you hold things most brokerages won't, like private
          companies, real estate, limited partnerships, tax liens, crowdfunding deals and cryptocurrency. They're a small
          slice of the market, estimated at about 2% of all IRAs.
        </p>
        <p style={pStyle}>
          They're harder to open, since you'll usually need a specialized custodian rather than a big brokerage. The IRS
          also looks at them more closely, and the prohibited transaction rules are strict. For example, you generally
          can't buy a property from yourself, rent it to a family member or use it personally. You're also on your own for
          finding, valuing and vetting the investments. They make sense for experienced investors or people working with a
          qualified professional. Not for beginners.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some things aren't allowed in any IRA, self-directed or not: life insurance, S corporation stock, collectibles
          like art and antiques, and personal-use real estate. Certain derivative strategies are restricted too. Check with
          your custodian before buying anything unusual.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use an IRA Calculator</h2>
        <p style={pStyle}>
          <strong>Choosing Roth or Traditional.</strong> A young professional in a low bracket often comes out ahead
          paying tax now. Someone at their peak earning years might prefer the deduction. Test both with your numbers.
        </p>
        <p style={pStyle}>
          <strong>Self-employed planning.</strong> A freelancer weighing a SEP IRA against a Roth IRA can see how much
          more a high-limit SEP contribution could grow, and compare what's left after tax.
        </p>
        <p style={pStyle}>
          <strong>Small business owners and employees.</strong> If your employer offers a SIMPLE IRA, you can see how the
          match and the higher employee limit change your trajectory compared with a standard IRA.
        </p>
        <p style={pStyle}>
          <strong>Catching up late.</strong> Someone in their fifties with a small balance can check how much saving,
          including catch-up contributions, it'd take to hit a target.
        </p>
        <p style={pStyle}>
          <strong>Windfalls.</strong> Got a bonus, inheritance or tax refund? Compare tucking it into an IRA against
          leaving it in a taxable account.
        </p>
        <p style={pStyle}>
          <strong>Gut-checking a pitch.</strong> If a salesperson or advisor gives you a projection, run your own with
          conservative assumptions and see how close it is.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Figuring out how much you need.</strong> A commonly cited rule of thumb is that you may need somewhere
          between 55% and 80% of your pre-retirement income to live on in retirement. Social Security will cover part of
          it. Use the calculator to see whether your current savings path gets you there.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pros and Cons of IRAs</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>The good stuff</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}>Real tax benefits, either up front (Traditional) or later (Roth)</li>
          <li style={liStyle}>A wide menu of investments</li>
          <li style={liStyle}>Some flexibility to withdraw early under certain exceptions</li>
          <li style={liStyle}>You can usually hold multiple IRAs and a workplace plan at the same time</li>
          <li style={liStyle}>
            The Saver's Credit, which can cut your tax bill by up to $1,000 if you're a lower-income saver (up to $2,000
            for a married couple filing jointly)
          </li>
        </ul>
        <h3 style={h3Style}>The downsides</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>Penalties on early withdrawals, with exceptions</li>
          <li style={liStyle}>Required minimum distributions on everything except Roth IRAs</li>
          <li style={liStyle}>Lower annual limits than most workplace plans (the SEP is the big exception)</li>
          <li style={liStyle}>Roth income limits can lock higher earners out of direct contributions</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Prohibited investments and strict rules, especially for self-directed accounts
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Open an IRA</h2>
        <p style={pStyle}>It's less of a project than people think, and often takes under 30 minutes online.</p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Pick a provider.</strong> Look at fees, account minimums, investment choices and customer support.
            Many large brokerages have no account fees or minimums.
          </li>
          <li style={liStyle}>
            <strong>Pick the account type.</strong> Roth, Traditional, SEP or SIMPLE. If you're not sure, run the
            calculator first.
          </li>
          <li style={liStyle}>
            <strong>Fill out the application.</strong> You'll need your Social Security number, basic personal info and a
            bank account for funding. Some providers also ask for a driver's license or passport.
          </li>
          <li style={liStyle}>
            <strong>Fund it.</strong> Decide how much to put in and how often. Setting up recurring contributions makes it
            a habit and takes the guesswork out.
          </li>
          <li style={liStyle}>
            <strong>Choose investments.</strong> Money sitting in cash isn't growing. Pick your investments after funding.
            A lot of people forget this step, and their contributions sit uninvested for months.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Check in.</strong> Review the account once or twice a year. Update the calculator with your new
            balance, and rebalance if you've drifted from your plan.
          </li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy and Cost</h2>
        <p style={pStyle}>
          The calculator is free to use. The results are projections based on whatever assumptions you enter, not
          guarantees. Markets don't go up in a straight line, and tax law changes. A fixed annual return is a
          simplification, so treat the output as a planning guide and test a few scenarios.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool doesn't give personal tax or investment advice. If your situation is complicated, like a high income,
          several retirement accounts, a business, or a big rollover, talk to a qualified tax professional.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting More From Your Results</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Run a conservative, a middle-of-the-road and an optimistic return scenario, and go with a plan that holds up
            in all three.
          </li>
          <li style={liStyle}>Think in today's dollars. A million dollars in 30 years buys less than a million today.</li>
          <li style={liStyle}>
            Play with your retirement tax rate. It's the assumption most likely to flip which account wins.
          </li>
          <li style={liStyle}>Redo it every year with your updated balance, new limits and current income.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Don't wait for the perfect choice. Starting this year with a reasonable one usually beats waiting.
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
