import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much money do I need to retire comfortably?",
    a: "A common starting estimate is 25 times your expected yearly spending, based on a 4% withdrawal rate. Your own number depends on your lifestyle, retirement age, other income like Social Security, and how long retirement lasts.",
  },
  {
    q: "What is the 4% rule?",
    a: "It's a guideline that says you can withdraw 4% of your savings in the first year of retirement, then adjust that amount for inflation each year, with a low chance of running out over 30 years. Divide your yearly spending by 0.04 to find your target. For $100,000 a year, that's $2.5 million.",
  },
  {
    q: "What is the 80% rule?",
    a: "It suggests you can keep your lifestyle on about 70% to 80% of your pre-retirement income, since some work-related costs go away.",
  },
  {
    q: "How much of my income does Social Security replace?",
    a: "About 40% for the average worker. Higher earners replace a smaller share, and lower earners a larger one.",
  },
  {
    q: "What information do I need to use this calculator?",
    a: "Your current age, planned retirement age, current savings, monthly contribution, and expected annual rate of return.",
  },
  {
    q: "Is this calculator really free?",
    a: "Yes. There's no signup, account, or payment.",
  },
  {
    q: "How does the calculator estimate how long my savings will last?",
    a: "It projects your balance year by year, subtracts your chosen withdrawal, and adds growth on what's left, until the money runs out or your time horizon is reached.",
  },
  {
    q: "What is a safe withdrawal rate?",
    a: "It's the percentage you can withdraw each year with a low chance of running out of money. About 4% in the first year, adjusted for inflation, is the most widely used benchmark, but your ideal rate depends on your timeline and flexibility.",
  },
  {
    q: "Does this calculator account for inflation?",
    a: "Inflation is one of the most important assumptions in any retirement plan. For the most realistic results, use a rate of return that's already adjusted for inflation, or lower your expected return by about 2% to 3%.",
  },
  {
    q: "What's the difference between a traditional and a Roth IRA?",
    a: "Traditional IRA contributions may be tax-deductible, and withdrawals are taxed. Roth contributions are made after tax, and qualified withdrawals, including growth, are tax-free.",
  },
  {
    q: "Can I use this calculator if I'm already retired?",
    a: "Yes. Use the withdrawal projection to see how long your balance will last at your planned monthly withdrawal.",
  },
  {
    q: "How often should I recalculate my plan?",
    a: "At least once a year, and after any big change, such as a raise, a new expense, a market drop, or a change in your retirement age.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const last = { ...pStyle, marginBottom: 0 };
const firstH3 = { ...h3Style, marginTop: 0 };
const cardStyle = { padding: "20px 20px" };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

export default function RetirementCalculatorFaqSection() {
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
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* Why important */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Is Retirement Planning Important?</h2>
        <p style={pStyle}>
          Retirement can last 25 to 30 years or more, and you'll need money for every one of them without a paycheck.
          For most Americans, there are fewer safety nets than there used to be. Social Security is designed to replace
          only about 40% of the average worker's pre-retirement income. Traditional pensions have mostly disappeared from
          the private sector, which means your own savings carry most of the weight. People are also living longer, and
          healthcare costs keep rising.
        </p>
        <p style={last}>
          Planning early gives your money time to grow. It also gives you choices later: when to stop working, where to
          live, and how much you can spend. Without a plan, those decisions tend to get made for you by your health, your
          employer, or the market.
        </p>
      </div>

      {/* How plans work */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do Retirement Plans Work?</h2>
        <p style={pStyle}>
          Every retirement plan has two phases. In the saving phase, you put money into accounts and investments, and it
          grows over time through returns and compounding. In the spending phase, you start drawing that money down to
          cover living costs, ideally without running out.
        </p>
        <p style={last}>
          Most U.S. retirement accounts come with tax benefits. With a traditional 401(k) or IRA, you contribute before
          taxes and pay income tax when you withdraw. With a Roth 401(k) or Roth IRA, you contribute after-tax money and
          generally pay no tax on qualified withdrawals. Employer plans may also include a matching contribution, which is
          extra money added to your account when you contribute.
        </p>
      </div>

      {/* How the calculator works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Does This Retirement Calculator Work?</h2>
        <p style={pStyle}>
          You enter your current age, target retirement age, current retirement savings, monthly contribution, and an
          expected annual rate of return. The calculator projects your balance year by year using compound growth. It
          then estimates how much you can withdraw each month and how long your savings will last, while still
          accounting for growth on the money you haven't spent yet.
        </p>
        <p style={last}>
          Because each input can be changed on its own, you can see which move helps the most: saving more, working a
          few extra years, or planning to spend a little less. Come back once a year or after any big change, like a
          raise, a job change, or a market drop.
        </p>
      </div>

      {/* How much is enough */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Money Is Enough to Retire On?</h2>
        <p style={pStyle}>There's no single number, but a few rules of thumb give you a starting point.</p>
        <p style={pStyle}>
          <strong>The 4% rule</strong> works backward from your spending. Divide your expected yearly spending by 0.04 to
          get a target. If you want $100,000 a year, you'd need about $2.5 million, or 25 times your annual spending. The
          rule comes from historical research on a 30-year retirement. It assumes you withdraw 4% in the first year and
          then adjust that dollar amount for inflation each year after.
        </p>
        <p style={pStyle}>
          <strong>The 80% rule</strong> looks at income. Many people can keep their lifestyle on 70% to 80% of what they
          earned while working, since they stop paying payroll taxes and saving for retirement, and may have no commute or
          mortgage. If you earned $100,000, plan on roughly $70,000 to $80,000 a year. Travel-heavy retirements can cost
          more.
        </p>
        <p style={pStyle}>
          <strong>The 10% to 15% rule</strong> focuses on saving. Put away 10% to 15% of your pre-tax income each year,
          including any employer match. Starting at 25 and sticking with it gets many people close to a seven-figure
          balance by retirement, though the result depends on your income and returns.
        </p>
        <p style={pStyle}>
          <strong>Age-based milestones</strong> are another check. Fidelity suggests having about 1 times your salary
          saved by 30, 3 times by 40, 6 times by 50, 8 times by 60, and 10 times by 67.
        </p>
        <p style={pStyle}>
          None of these rules know your real expenses, other income, or health. Use them to get oriented, then run your
          own numbers in the calculator.
        </p>
        <h3 style={h3Style}>Is $7,000 a Month a Decent Retirement for a Couple With No Debt?</h3>
        <p style={pStyle}>
          For many couples, yes. That's $84,000 a year, which is well above what most retired households spend. Having no
          mortgage or other debt helps a lot. Here's a rough picture. If you and your spouse each collect around $2,000 a
          month in Social Security, that covers about $4,000. The other $3,000 a month, or $36,000 a year, would come from
          savings. Using the 4% rule, that requires about $900,000. Since withdrawals from traditional accounts are taxed,
          it's safer to aim for a bit more.
        </p>
        <p style={pStyle}>
          Where you live matters too. $7,000 goes a long way in much of the Midwest and South, and a lot less in a
          high-cost city. Healthcare is the other big variable, so plan for it separately.
        </p>
        <h3 style={h3Style}>Can You Retire Comfortably With $500K?</h3>
        <p style={pStyle}>
          It's possible, but it depends on your spending and where you live. At a 4% withdrawal rate, $500,000 provides
          about $20,000 a year. Add Social Security, which averages roughly $2,000 a month per retiree, and a single person
          might have around $44,000 a year to spend. A couple with two benefits would have more. That can work in a
          lower-cost area with no mortgage and modest spending. It gets tight fast with rent, travel, or big medical bills.
          If you're retiring before Social Security starts, $500,000 won't stretch nearly as far.
        </p>
        <h3 style={h3Style}>Do You Like the 4% Rule? What Is the 6% Rule?</h3>
        <p style={pStyle}>
          The 4% rule is a useful starting point, not a guarantee. It's simple, it's based on real historical data, and
          it's easy to remember. Its weaknesses are that it assumes a fixed 30-year retirement, doesn't adapt to market
          swings, and treats everyone the same. Some recent research puts a safe starting rate a little below 4%, and
          others find that flexible spending allows a bit more. Treat it as a first estimate and adjust.
        </p>
        <p style={last}>
          There is no official "6% rule." The term usually refers to withdrawing 6% of your savings each year. That's a
          much higher rate, and over 30 years it has a far greater chance of running out of money, especially if the
          market drops early in retirement. It can make sense for a short retirement or if you're willing to cut spending
          when markets fall. People also use "6%" to mean saving 6% of pay to capture an employer match, which is a
          reasonable minimum but usually not enough on its own.
        </p>
      </div>

      {/* Safe withdrawal */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Safe Withdrawal Rates: How Long Will Your Savings Last?</h2>
        <p style={pStyle}>
          Saving enough is only half the job. The other half is not running out. Withdraw too much early on, and a market
          downturn can do lasting damage. Withdraw too little, and you may live more frugally than you need to.
        </p>
        <p style={last}>
          The calculator estimates how long your balance lasts at a monthly withdrawal you choose. Try questions like:
          "If I withdraw $3,000 a month starting at 65, will my money last to 90?" Test a few scenarios before you retire,
          while you still have time to change your savings or your retirement date.
        </p>
      </div>

      {/* Step by step */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Plan for Retirement: Step by Step</h2>
        <p style={pStyle}>
          Here's a simple way to build a plan, whether you're starting from scratch or fixing one that isn't working.
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Pick a retirement age and a lifestyle.</strong> Estimate your yearly spending in today's dollars.
            Include housing, food, insurance, taxes, travel, and healthcare.
          </li>
          <li style={liStyle}>
            <strong>List your income sources.</strong> Social Security, pensions, part-time work, rental income, and
            annuities all count.
          </li>
          <li style={liStyle}>
            <strong>Find the gap.</strong> Subtract guaranteed income from your spending. Your savings need to cover the
            difference.
          </li>
          <li style={liStyle}>
            <strong>Run the numbers.</strong> Use the calculator to see what monthly contribution gets you there.
          </li>
          <li style={liStyle}>
            <strong>Automate it.</strong> Set up automatic contributions so saving doesn't depend on willpower.
            Contribute at least enough to get your full employer match.
          </li>
          <li style={liStyle}>
            <strong>Choose investments that fit your timeline.</strong> More stocks when retirement is far away, more
            bonds and cash as it gets closer. A target-date fund does this automatically.
          </li>
          <li>
            <strong>Review once a year.</strong> Adjust after raises, job changes, or big market moves.
          </li>
        </ol>
        <h3 style={h3Style}>What Are the Key Considerations When Planning for Retirement?</h3>
        <p style={pStyle}>
          The main ones are when you'll retire, how much you'll spend, how long you'll live, what Social Security and
          pensions will pay, how much your investments can reasonably earn, how taxes will affect withdrawals, and what
          healthcare will cost. Inflation touches all of them. If you're married, plan for two lifespans, since one spouse
          often lives well into their 90s.
        </p>
        <h3 style={h3Style}>What Is Pre-Retirement Planning?</h3>
        <p style={pStyle}>
          Pre-retirement planning is the work you do in the five to ten years before you retire. This is when you
          finalize your target age, estimate your spending, decide when to claim Social Security, shift to a safer
          investment mix, pay down debt, and figure out health insurance until Medicare starts at 65. It's also the time
          to make larger catch-up contributions, which the IRS allows once you turn 50.
        </p>
        <h3 style={h3Style}>What Are the Misconceptions About Retirement Planning?</h3>
        <p style={last}>
          A few common ones: that you need to be wealthy to plan, that Social Security will cover everything, that you'll
          spend much less once you stop working, that you can catch up later, and that a good plan never needs changing.
          Spending often stays flat or even rises in the early, active years of retirement, and healthcare tends to rise
          with age.
        </p>
      </div>

      {/* Types of plans */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Different Types of Retirement Plans?</h2>
        <p style={pStyle}>
          Most people use a mix of the following. Each is a different kind of account or income source, so you can have
          several at the same time.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Social Security.</strong> A federal program funded by payroll taxes. It replaces about 40% of the
            average worker's earnings and pays more if you wait to claim. Full retirement age is 67 for anyone born in
            1960 or later, and you can claim as early as 62 or delay up to 70. The Social Security trustees project that
            the main trust fund could run short in the early 2030s, after which incoming taxes would cover roughly
            three-quarters of scheduled benefits unless Congress acts. Plan on Social Security as part of your income, but
            don't count on it for everything.
          </li>
          <li style={liStyle}>
            <strong>401(k), 403(b), and 457(b) plans.</strong> Employer-sponsored accounts. A 401(k) is common in private
            companies, a 403(b) in schools and nonprofits, and a 457(b) for many government workers. For 2026, the
            employee contribution limit for a 401(k) is $24,500, with extra catch-up contributions allowed at 50 and
            older. Many employers match part of what you contribute, and you should capture the full match first.
          </li>
          <li style={liStyle}>
            <strong>Traditional and Roth IRAs.</strong> Accounts you open yourself. The 2026 limit is $7,500, plus a
            catch-up for people 50 and older. Traditional IRA contributions may be tax-deductible, and you pay tax on
            withdrawals. Roth contributions aren't deductible, but qualified withdrawals are tax-free, which can help if
            you expect to be in a similar or higher tax bracket later. Roth IRAs also have income limits. You can check
            current limits on the <Ext href="https://www.irs.gov/retirement-plans">IRS retirement plans page</Ext>.
          </li>
          <li style={liStyle}>
            <strong>Pensions.</strong> A defined benefit plan pays a set monthly amount for life, usually based on your
            salary and years of service. They're still common for government workers and some union jobs, but rare in
            the private sector now.
          </li>
          <li style={liStyle}>
            <strong>Annuities.</strong> Insurance contracts that turn a lump sum into guaranteed income. Fixed and
            immediate annuities offer predictable payments, while deferred annuities start paying later. Fees and terms
            vary a lot, so compare them carefully.
          </li>
          <li style={liStyle}>
            <strong>Taxable investments, CDs, and savings.</strong> Once you've used your tax-advantaged accounts, you
            can invest in a regular brokerage account with index funds, stocks, bonds, or real estate. CDs and high-yield
            savings suit the money you need soon. Keep an emergency fund so unexpected bills don't force you to sell
            investments.
          </li>
          <li style={liStyle}>
            <strong>Home equity and reverse mortgages.</strong> Homeowners 62 and older can borrow against their home
            equity through a reverse mortgage and get monthly payments or a credit line. It can help in a pinch, but fees
            are high, interest builds up, and the loan is repaid when you move out or pass away. Treat it as a last
            resort, not a first plan.
          </li>
          <li>
            <strong>Passive income and inheritance.</strong> Rental income, dividends, royalties, and side business
            income can supplement your plan. Inheritances can help too, but they're unpredictable, so don't build a plan
            around one.
          </li>
        </ul>
        <h3 style={h3Style}>Can Someone Have Multiple Retirement Plans?</h3>
        <p style={pStyle}>
          Yes, and most people do. You might have a 401(k) at work, an IRA on your own, a pension from a past job, and a
          taxable account. The contribution limits apply across accounts of the same type. For example, the 401(k) limit
          applies to your total contributions to all 401(k)s, while IRA limits apply to all your IRAs combined. Keeping
          track of old 401(k)s is worth the effort; rolling them into an IRA or your new employer's plan keeps things
          organized.
        </p>
        <h3 style={h3Style}>What Do I Do If My Company Doesn't Offer a Retirement Plan?</h3>
        <p style={pStyle}>
          Open an IRA, either traditional or Roth, with a low-cost brokerage. If you're self-employed, a SEP IRA, SIMPLE
          IRA, or solo 401(k) allows much higher contributions. Many states also run auto-IRA programs for workers
          without a workplace plan, such as CalSavers and OregonSaves. Check whether your state has one. Lower-income
          savers may also qualify for the federal Saver's Credit.
        </p>
        <h3 style={h3Style}>Are There Family Retirement Plans?</h3>
        <p style={pStyle}>
          There's no official "family plan," but couples can plan together and use a spousal IRA, which lets a working
          spouse contribute to an IRA for a spouse with little or no income. Couples should also coordinate Social
          Security claiming, since it can raise the survivor's benefit, and review beneficiaries on every account.
        </p>
        <h3 style={h3Style}>Who Can Help Us With a Retirement Plan?</h3>
        <p style={pStyle}>
          A financial planner can help, especially for taxes, Social Security timing, and withdrawal strategy. Look for a
          Certified Financial Planner (CFP) who acts as a fiduciary, meaning they're legally required to put your
          interests first, and who charges a flat or hourly fee instead of commissions. Check their record on the SEC's
          adviser database or FINRA BrokerCheck. Your employer's plan provider may also offer free guidance.
        </p>
        <h3 style={h3Style}>Which Financial Firms Are Best for Long-Term Retirement Planning?</h3>
        <p style={pStyle}>
          There's no single best firm. Large, well-known providers like Fidelity, Vanguard, Charles Schwab, and T. Rowe
          Price are popular for low-cost index funds, solid planning tools, and good customer service. When you compare
          firms, look at fees, fund choices, account minimums, available advice, and how easy the website is to use. Fees
          matter more than most people think, since a 1% difference can cost you tens of thousands of dollars over
          decades.
        </p>
        <h3 style={h3Style}>Which Insurance Plan Is Best for Retirement Planning?</h3>
        <p style={last}>
          Insurance protects a plan but isn't a plan by itself. For most retirees, the key coverage is health insurance
          (Medicare plus a supplement or Medicare Advantage plan). Long-term care insurance, a fixed annuity for
          guaranteed income, and life insurance for a spouse who depends on your income can also make sense, depending on
          your situation. Be cautious of high-fee products sold as "retirement plans," and compare options with a
          fee-only adviser.
        </p>
      </div>

      {/* Start investing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Start Investing for Retirement?</h2>
        <p style={pStyle}>
          Start with what's easiest. If your employer offers a match, contribute enough to get all of it. Next, consider a
          Roth or traditional IRA. Then pick simple, low-cost investments. A target-date fund matches your expected
          retirement year and adjusts automatically, while a broad index fund tracks the whole market at a very low cost.
          You don't need to pick individual stocks.
        </p>
        <p style={pStyle}>
          Start with whatever amount you can, even 3% to 5% of pay, then raise it by 1% each year or whenever you get a
          raise.
        </p>
        <h3 style={h3Style}>What Rate of Return Should You Use for Retirement Planning?</h3>
        <p style={pStyle}>
          Be conservative. Over the long run, a stock-heavy portfolio has returned about 10% a year before inflation, or
          around 7% after inflation, but returns in any given decade can be far above or below that. For planning, many
          people use 5% to 7% a year for a growth-focused portfolio before retirement, and 3% to 5% once they've moved to a
          more balanced mix. A lower assumption is safer: if you earn more, great, and if you earn less, you aren't caught
          off guard.
        </p>
        <h3 style={h3Style}>What Are Some Best Mutual Fund Retirement Plans?</h3>
        <p style={pStyle}>
          Instead of chasing a "best" fund, look for these traits: low expense ratios (under 0.20% is a good target, and
          many index funds charge far less), broad diversification, and a long track record. Target-date funds and total
          market index funds are common choices. Compare fees on Morningstar or your plan's fund list.
        </p>
        <h3 style={h3Style}>Is Cryptocurrency a Bad Investment Choice for Retirement?</h3>
        <p style={pStyle}>
          For most people, it's too risky to be a core retirement investment. Crypto has no cash flow, prices swing
          wildly, and large drops can take years to recover from. If you're curious, many advisers suggest keeping it to a
          small slice of your portfolio, often 5% or less, and only money you can afford to lose. Your Social Security,
          pension, and core savings should rest on more stable ground.
        </p>
        <h3 style={h3Style}>What Will Be the Best No-Risk Retirement Plan?</h3>
        <p style={last}>
          No plan is completely risk-free. Treasury securities, CDs, and fixed annuities come close to protecting your
          principal, but they carry inflation risk, meaning your money may buy less over time. A balanced mix of
          guaranteed income (Social Security, a pension, or an annuity) covering essential bills, plus diversified
          investments for growth, is the usual way to manage risk without giving up all growth.
        </p>
      </div>

      {/* Mistakes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Retirement Planning Mistakes to Avoid</h2>
        <p style={pStyle}>
          Some of the same mistakes show up again and again. Here are the biggest ones, whether you're planning or
          investing.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Starting late.</strong> Early contributions have the most time to compound. Even small amounts matter
            at 25.
          </li>
          <li style={liStyle}>
            <strong>Not capturing the employer match.</strong> It's free money, and skipping it is like turning down a
            raise.
          </li>
          <li style={liStyle}>
            <strong>Underestimating inflation.</strong> At about 2.5% a year, prices roughly double in 28 years. A
            comfortable income today can feel tight in two decades.
          </li>
          <li style={liStyle}>
            <strong>Ignoring healthcare costs.</strong> Fidelity has estimated that a 65-year-old retiree may need around
            $170,000 in savings for medical costs, not including long-term care.
          </li>
          <li style={liStyle}>
            <strong>Taking Social Security too early without a plan.</strong> Claiming at 62 permanently reduces your
            benefit.
          </li>
          <li style={liStyle}>
            <strong>Investing too aggressively or too conservatively.</strong> Too much risk near retirement can be
            damaging, and too little can leave you short.
          </li>
          <li style={liStyle}>
            <strong>Chasing hot stocks, trends, or high-fee products.</strong> Fees and bad timing quietly drain returns.
          </li>
          <li style={liStyle}>
            <strong>Cashing out a 401(k) when changing jobs.</strong> You'll owe taxes and may pay a 10% penalty if you're
            under 59½.
          </li>
          <li style={liStyle}>
            <strong>Never revisiting the plan.</strong> Life and markets change.
          </li>
          <li>
            <strong>Relying on a windfall.</strong> Hoping to win the lottery isn't a strategy. The odds are tiny, and
            most big winners don't stay wealthy. A better use of a lottery ticket's cost is an automatic $5 deposit into an
            index fund.
          </li>
        </ul>
        <h3 style={h3Style}>How Do You Fix a Bad Retirement Plan?</h3>
        <p style={pStyle}>
          Start by finding out exactly what's wrong. Calculate the gap, then pick the levers that fit your situation: save
          more, delay retirement a few years, cut planned spending, work part-time in retirement, or delay Social Security
          to get a bigger check. If you're 50 or older, use catch-up contributions. Cut fees, pay off high-interest debt,
          and rebalance an investment mix that no longer fits your age. If your plan has truly failed, such as after a
          layoff or a market crash, the same steps apply, along with a close look at what you can cut for now and extra
          income you can bring in.
        </p>
        <h3 style={h3Style}>What Unexpected Events Change Retirement Plans the Most?</h3>
        <p style={last}>
          The most common are a health problem, a layoff or early retirement push, a market crash right before or after
          retiring, a divorce, the death of a spouse, and caring for a family member. A cash cushion, adequate insurance,
          and flexibility in your spending give you room to handle these.
        </p>
      </div>

      {/* Faster */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Reach Your Retirement Number Faster</h2>
        <p style={pStyle}>If your projected date is later than you'd like, these are the changes that move the needle most.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Save more, sooner.</strong> Even $100 to $200 more per month adds up over time.
          </li>
          <li style={liStyle}>
            <strong>Work a few extra years.</strong> It adds contribution years, lets your investments grow longer, boosts
            Social Security, and shortens the time your savings must cover.
          </li>
          <li style={liStyle}>
            <strong>Lower your planned spending.</strong> A smaller target means a smaller nest egg.
          </li>
          <li>
            <strong>Check your rate of return assumption.</strong> Make sure it fits your actual investments.
          </li>
        </ul>
        <p style={pStyle}>The calculator lets you test each one on its own.</p>
        <h3 style={h3Style}>What Are Some Things You Can Do to Retire Early?</h3>
        <p style={pStyle}>
          Retiring early takes a high savings rate, often 30% to 50% of income, and a plan for the years before benefits
          begin. Aim for 25 times your yearly spending and keep costs low. Know the access rules: you can generally take
          penalty-free withdrawals from the 401(k) of the job you leave at 55 or later (the "Rule of 55"), or use Roth
          conversions or substantially equal periodic payments for earlier access. Budget for private health insurance
          until Medicare at 65. Since the 4% rule was built for 30 years, early retirees usually use a lower rate, around
          3.25% to 3.5%.
        </p>
        <h3 style={h3Style}>Is 30 Too Late to Start? What's the Best Advice for Millennials?</h3>
        <p style={pStyle}>
          No, 30 isn't too late. Saving 15% of income from age 30 can still build a solid retirement. Start with the
          employer match, automate contributions, choose low-cost index or target-date funds, and raise your rate
          whenever your income goes up. Don't let student loans keep you from saving anything at all. Even small
          contributions now beat large ones later.
        </p>
        <h3 style={h3Style}>Is Retirement Planning Only for the Wealthy?</h3>
        <p style={pStyle}>
          No. It matters more for people without large cushions, since mistakes cost them more. Plenty of middle-income
          workers retire comfortably through steady saving, an employer match, and Social Security. Wealthy households
          plan too, but for different reasons: taxes, estate planning, and making sure their money lasts across
          generations.
        </p>
        <h3 style={h3Style}>What Is the Proper Time to Start Retirement Planning?</h3>
        <p style={last}>
          As soon as you start earning. Planning in your 20s and 30s is simple and cheap. Planning in your 50s gets more
          detailed and urgent. It's never too late to improve your situation, but the earlier you start, the more
          compounding does for you.
        </p>
      </div>

      {/* After 60 and 70 */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Retirement Planning After 60 and 70</h2>
        <h3 style={firstH3}>Why Would a 70-Year-Old Need a Retirement Plan?</h3>
        <p style={pStyle}>
          Because the plan is now about spending, taxes, and making the money last. A 70-year-old may live another 15 to
          25 years. They need to decide how much to withdraw, handle required minimum distributions, manage taxes, cover
          healthcare, and prepare for the unexpected. They also need an estate plan.
        </p>
        <h3 style={h3Style}>What Is an RMD (the "IRM 72" Rule), and Can You Still Contribute After 72?</h3>
        <p style={pStyle}>
          You may be thinking of required minimum distributions, or RMDs. These are mandatory yearly withdrawals from
          traditional IRAs and most workplace plans. The starting age used to be 72, but under current law it's 73, and it
          rises to 75 in 2033. Roth IRAs have no RMDs for the original owner, and since 2024 neither do Roth accounts in
          workplace plans.
        </p>
        <p style={last}>
          Yes, you can still contribute at any age as long as you have earned income. The old age limit for traditional
          IRA contributions was removed in 2020. Reasons to keep contributing include tax-deductible contributions,
          tax-free growth in a Roth, and continued employer matches if you still work. A Roth is especially useful at this
          stage since it has no RMDs and can be left to heirs.
        </p>
      </div>

      {/* Income and special situations */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Retirement Income and Special Situations</h2>
        <h3 style={firstH3}>Do You Factor Social Security Into Your Plan?</h3>
        <p style={pStyle}>
          Yes, but carefully. Social Security is a large and reliable source of income, and most plans should include it.
          Get your personal estimate from your account at ssa.gov rather than guessing. The average retired worker gets
          roughly $2,000 a month, though yours depends on your earnings and when you claim. Waiting from 62 to 70 can
          increase your monthly check by about 75% or more. Since the trust fund is projected to face a shortfall in the
          2030s, some planners run a second scenario with benefits reduced by 20% to 25% to see if the plan still holds
          up.
        </p>
        <h3 style={h3Style}>Should Retirement Planning Take Medical Expenses Into Account?</h3>
        <p style={pStyle}>
          Yes, absolutely. Medicare covers a lot, but not everything. You'll pay premiums (the standard Part B premium is
          $202.90 a month in 2026), deductibles, copays, prescription costs, and usually more for dental, vision, and
          hearing. Long-term care is another big expense that Medicare mostly doesn't cover. If you have a high-deductible
          health plan before retirement, a Health Savings Account (HSA) is a good way to save for these costs tax-free.
        </p>
        <h3 style={h3Style}>Does the U.S. Military Have Good Retirement Plans?</h3>
        <p style={pStyle}>
          Generally, yes. Service members who retire after 20 years can get a lifetime pension, and healthcare through
          TRICARE. Under the Blended Retirement System, which covers most people who joined in 2018 or later, the pension
          is 2% of your highest three years of base pay for each year served, which is 40% at 20 years. It's paired with
          the Thrift Savings Plan (TSP), where the government automatically contributes 1% and matches up to another 4%.
          Members who leave before 20 years keep their TSP, which is a big improvement over the old all-or-nothing system.
        </p>
        <h3 style={h3Style}>Which State Has the Best Teacher Retirement Plan?</h3>
        <p style={pStyle}>
          There's no single winner because plans differ in formulas, vesting, retirement age, cost-of-living adjustments,
          and whether teachers also get Social Security. Some states are more generous than others, and a few have
          funding problems. If you're a teacher, check your state's pension formula, how many years you need to vest,
          whether the plan is fully funded, and whether you can also contribute to a 403(b) or 457(b).
        </p>
        <h3 style={h3Style}>Do Veterinarians Get Retirement Plans?</h3>
        <p style={pStyle}>
          It depends on where they work. Vets at corporate clinics, universities, and government agencies often get
          401(k) or similar plans. Those in small private practices or who own their clinic usually set up their own, like
          a SEP IRA, SIMPLE IRA, or solo 401(k). With high student loan debt common, many vets need to balance repayment
          and saving.
        </p>
        <h3 style={h3Style}>Do Rich People Bother With Retirement Plans?</h3>
        <p style={pStyle}>
          Yes. They plan around taxes, estate transfers, charitable giving, and keeping their money working across a long
          life. Wealthy people still use retirement accounts for tax advantages, and they plan carefully because they want
          to keep their wealth over time.
        </p>
        <h3 style={h3Style}>What Has Gone Wrong With the German Retirement System?</h3>
        <p style={pStyle}>
          Germany's public pension relies on a pay-as-you-go model, where today's workers pay for today's retirees. As the
          population ages and birth rates stay low, there are fewer workers per retiree, which puts the system under
          strain. The government has had to use growing federal subsidies and has debated raising the retirement age and
          contribution rates. The U.S. Social Security system faces a similar demographic challenge. The lesson for
          individuals is to build private savings alongside any public benefit.
        </p>
        <h3 style={h3Style}>Will the U.S. Government Nationalize Retirement Accounts?</h3>
        <p style={pStyle}>
          There's no sign of that. Some countries have taken over private pension assets in past crises, but nothing like
          it has been enacted in the U.S., and your 401(k) and IRA are legally yours. Policy changes are more realistic:
          tax rules, contribution limits, and Social Security benefits can change over time. Diversifying across account
          types, including Roth and traditional, helps protect you from tax law changes.
        </p>
        <h3 style={h3Style}>How Ethical Is Automatic Enrollment in Retirement Plans?</h3>
        <p style={pStyle}>
          Most experts consider it a good approach. Workers can opt out at any time, and research shows it significantly
          increases participation, particularly among younger and lower-income employees. Critics point out that default
          contribution rates are often too low and that some people could be hurt by missing out on cash they need today.
          Federal law now requires most new 401(k) and 403(b) plans to enroll workers automatically, and the best practice
          is to raise your rate above the default.
        </p>
        <h3 style={h3Style}>Why Are People So Focused on Employment Perks Like Retirement Matches?</h3>
        <p style={last}>
          Because they're a real part of pay, and often tax-advantaged. A 401(k) match, for example, can be worth
          thousands of dollars a year and compounds for decades. Those perks can matter as much as a salary difference
          when you compare job offers.
        </p>
      </div>

      {/* Questions people ask */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Questions People Ask About Their Retirement Plans</h2>
        <h3 style={firstH3}>What Concerns Do People Have About Retirement Planning?</h3>
        <p style={pStyle}>
          The most common are outliving savings, rising healthcare costs, inflation, market crashes, and uncertainty about
          Social Security. A good plan responds to each one: a conservative withdrawal rate, a healthcare budget, a mix of
          investments, and some guaranteed income.
        </p>
        <h3 style={h3Style}>How Do People Save for Retirement?</h3>
        <p style={pStyle}>
          Most combine payroll deductions into a 401(k) or similar plan, an IRA, a taxable account, and, later, Social
          Security. The ones who do best usually automate their savings and raise them with their income.
        </p>
        <h3 style={h3Style}>What Surprises People Most About Retirement Planning?</h3>
        <p style={last}>
          Two things come up again and again: how much compounding matters in the early years, and how large healthcare
          costs can be. Many are also surprised that taxes continue in retirement, since withdrawals from traditional
          accounts and even part of Social Security can be taxable.
        </p>
      </div>

      {/* Free, private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Built to Be Accurate</h2>
        <p style={last}>
          This calculator is free to use, with no signup, account, or email required. The numbers you enter are used only
          to generate your results on the page, and nothing you type is stored or shared. It relies on standard compound
          growth and withdrawal formulas, so you can compare the results with another reputable calculator or your own
          spreadsheet. Like any projection, the results are estimates based on your assumptions, not a promise of future
          returns. Use them as a planning guide, and talk to a licensed financial professional before making large
          decisions.
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
