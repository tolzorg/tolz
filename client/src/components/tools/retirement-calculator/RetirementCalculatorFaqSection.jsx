import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much money do I need to retire comfortably?",
    a: "A common starting estimate is about 25 times your expected annual retirement spending, based on a 4% withdrawal rate. The exact figure depends on your expected lifestyle, retirement age, other income sources like Social Security, and how long you expect retirement to last, which is why running your own numbers through a calculator gives a more accurate target than a generic rule.",
  },
  {
    q: "What is the 4% rule in retirement planning?",
    a: "The 4% rule estimates the nest egg needed to support a given level of annual spending in retirement. You divide your expected annual spending by 4% to get the target savings figure, for example, $100,000 in annual spending points to a target of $2.5 million.",
  },
  {
    q: "What is the 80% rule for retirement income?",
    a: "It's a guideline suggesting that most people can maintain their pre-retirement standard of living on roughly 70% to 80% of their pre-retirement income, since certain work-related expenses disappear after retiring.",
  },
  {
    q: "How much of my income does Social Security actually replace?",
    a: "In the U.S., Social Security is generally designed to replace about 40% of the average worker's pre-retirement income, which is why most financial plans treat it as a supplement rather than a sole source of retirement income.",
  },
  {
    q: "What information do I need to use this retirement calculator?",
    a: "You'll typically need your current age, planned retirement age, current retirement savings, expected monthly contribution, and an assumed annual rate of return. These inputs are enough to project your future savings and estimate a sustainable withdrawal amount.",
  },
  {
    q: "Is this retirement calculator really free, and do I need to sign up?",
    a: "Yes. The tool is completely free with no signup, account, or payment required. You can enter your numbers and get results immediately.",
  },
  {
    q: "How does the calculator estimate how long my savings will last?",
    a: "It projects your account balance forward year by year, subtracting your chosen withdrawal amount while accounting for continued growth on the remaining balance, until the funds are depleted or your target time horizon is reached.",
  },
  {
    q: "What is a safe withdrawal rate in retirement?",
    a: "A safe withdrawal rate is the percentage of your retirement savings you can withdraw annually with a low risk of running out of money over a typical multi-decade retirement. Roughly 4% of the initial balance, adjusted for inflation each year, is a widely referenced historical benchmark, though your ideal rate can be higher or lower depending on your specific timeline and risk tolerance.",
  },
  {
    q: "Does this calculator account for inflation?",
    a: "The calculator's projections are designed to reflect realistic, inflation-aware growth and withdrawal assumptions rather than nominal figures alone, since ignoring inflation significantly overstates future purchasing power over long retirement horizons.",
  },
  {
    q: "What's the difference between a traditional IRA and a Roth IRA?",
    a: "Traditional IRA contributions are typically made pre-tax and taxed upon withdrawal in retirement, while Roth IRA contributions are made after-tax but withdrawn tax-free, including growth, as long as retirement withdrawal rules are met.",
  },
  {
    q: "Can I use this calculator if I'm already retired?",
    a: "Yes. If you're already retired, you can use the withdrawal projection feature to check how long your current balance will last at your planned monthly withdrawal amount, which is useful for confirming your spending is sustainable.",
  },
  {
    q: "How often should I recalculate my retirement plan?",
    a: "Once a year is a reasonable minimum, or any time you experience a significant change such as a raise, a new expense, a market downturn, or a change in your planned retirement age.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Planning for retirement starts with one question: how much money will actually be enough? This
          retirement calculator, built by <Link to="/" className="inline-home-link">Tolz</Link>, helps you
          answer that question with real numbers instead of guesswork. Enter your current age, savings,
          monthly contributions, and expected retirement age, and the tool projects your future nest egg,
          tells you whether you're on track, and shows how long your savings could realistically last once
          you start withdrawing from them. Whether you're just starting to save or double-checking a plan
          you already have, this calculator turns retirement planning into a clear, actionable process.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You Need a Retirement Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most people have a rough idea that they should "save for retirement," but very few have an actual
          number in mind. That gap is exactly where a retirement calculator earns its value. A few common
          situations where this tool becomes essential: you're in your 30s or 40s and want to know if your
          current savings rate will get you to retirement, or if you need to increase your monthly
          contributions now while you still have decades of compounding ahead of you. You're closer to
          retirement, perhaps five to ten years out, and need to stress-test your plan against different
          retirement ages to see how retiring at 60 versus 65 changes your required savings. You've
          received an inheritance, bonus, or windfall and want to model how a lump-sum contribution today
          shortens your timeline. You're already retired or about to be, and your main concern has shifted
          from saving to spending, specifically, how much you can safely withdraw each month without
          running out of money. Each of these situations calls for a different answer, and a single blanket
          rule doesn't account for your specific age, savings, or goals. A calculator that runs your actual
          numbers gives a far more useful answer than a generic guideline.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Retirement Actually Means, and Why People Choose It</h2>
        <p style={pStyle}>
          Retirement is the point at which someone steps away from active working life, and for most
          retirees, it lasts for the rest of their years. It isn't a single event with one cause behind it,
          a mix of personal, physical, and financial factors usually pushes the decision one way or another.
        </p>
        <p style={pStyle}>
          Health is often the deciding factor. When a job becomes physically difficult to perform, or when a
          disability or mental decline makes it hard to keep up with the demands of a role, retiring, or at
          least moving to less demanding work, becomes the practical choice. Job-related stress plays a
          similar role; when the toll of a career outweighs the satisfaction it brings, people start
          planning an exit. Age matters too, though not in a fixed way. Retirement can technically happen at
          any point in a working life, and the path there isn't always a hard stop. Some people ease into it
          through semi-retirement, gradually cutting back their hours. Others announce retirement, step away
          for a while, and then return to work later. Most people, though, retire somewhere between their
          mid-fifties and early seventies.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Underneath all of this sits the most practical factor of all: whether retiring is financially
          possible in the first place. It's technically possible to retire with little to no personal
          savings and lean entirely on Social Security, and a meaningful number of people do exactly that.
          It's rarely a comfortable path, though, because Social Security in the U.S. is designed to replace
          only around 40% of the average worker's pre-retirement income, nowhere near enough to maintain the
          same standard of living for most households. Outside of situations forced by illness or
          disability, most people wait until they feel financially ready before making the decision final.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Retirement Calculator Works</h2>
        <p style={pStyle}>
          The tool takes a small set of inputs, your current age, target retirement age, current retirement
          savings, monthly contribution amount, and an expected annual rate of return, and projects how your
          savings will grow year over year through compound interest. It then estimates a sustainable
          withdrawal amount for retirement based on how long you expect your savings to last, factoring in
          continued (though usually more conservative) growth on the remaining balance during retirement.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This mirrors how financial planners typically think about retirement math: an accumulation phase,
          where money is saved and grown, followed by a decumulation phase, where it's drawn down without
          running out too early. Because each input can be adjusted independently, you can see exactly which
          lever, contributing more, working a few extra years, or accepting a slightly lower monthly
          withdrawal, moves your outcome the most. That makes the tool useful not just as a one-time
          estimate, but as something worth revisiting every year or two as income, savings, and goals shift.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Money Do You Actually Need to Retire?</h2>
        <p style={pStyle}>
          There's no single number that works for everyone, but a few widely used guidelines give a
          reasonable starting point, and each one answers a slightly different version of the same question.
        </p>
        <p style={pStyle}>
          The 10% rule focuses on the saving phase rather than the end goal. It suggests putting away 10% to
          15% of pre-tax income every working year. Someone earning $50,000 a year, for example, would set
          aside somewhere between $5,000 and $7,500 annually. Saving consistently at 10% starting around age
          25 can realistically build toward a $1 million nest egg by the time retirement arrives, thanks
          largely to decades of compounding.
        </p>
        <p style={pStyle}>
          The 80% rule looks at retirement from the income-replacement side. It suggests that most people
          can maintain their existing standard of living on 70% to 80% of their pre-retirement income. A
          person averaging $100,000 a year while working could likely live comparably on $70,000–$80,000 a
          year after retiring. This range isn't fixed, though, someone planning an active, travel-heavy
          retirement will likely need more, while someone planning a quieter lifestyle may need less.
        </p>
        <p style={pStyle}>
          The 4% rule works backward from annual spending to a target nest egg. If you know roughly how much
          you'll need per year in retirement, dividing that figure by 4% gives you the savings required to
          support it. Someone who expects to need $100,000 a year, for instance, would target a nest egg of
          $100,000 ÷ 4% = $2.5 million. Some planners frame this slightly differently, suggesting a target of
          15 to 25 times current annual income as a rough range depending on lifestyle and risk tolerance.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          None of these rules are precise on their own, they're shortcuts that ignore your actual expenses,
          other income sources, and life expectancy. Running your real numbers through a calculator, rather
          than relying on a single rule of thumb, gives a target built around your situation instead of an
          average household's. It's also worth speaking with a licensed financial professional when a plan
          starts involving larger, harder-to-reverse decisions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Building a Retirement Savings Plan You Can Stick To</h2>
        <p style={pStyle}>
          Once you know your target number, the next challenge is building a savings plan that gets you
          there without requiring sacrifices you can't sustain for decades. A workable plan usually has
          three components. First, a monthly contribution amount that's automated so it doesn't depend on
          willpower each month. Second, an asset allocation appropriate for your time horizon, generally
          more growth-oriented investments when retirement is far away, shifting toward more conservative
          holdings as it approaches. Third, periodic check-ins, ideally once a year, to adjust contributions
          if you get a raise, pay off a major expense, or fall behind schedule.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Where the calculator adds the most value here is in showing the real impact of small changes.
          Increasing a monthly contribution by even $100–$200 can shift your projected retirement date by
          years, because that additional amount also compounds over time rather than sitting idle. Testing a
          few different contribution levels side by side, rather than settling for the first number you
          tried, is one of the most effective ways to use this tool.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Inflation Quietly Erodes Retirement Savings</h2>
        <p style={pStyle}>
          Inflation is the steady rise in prices and the corresponding drop in what a dollar can buy over
          time. Over the past three decades, average inflation in the U.S. has run at roughly 2.6% a year.
          That sounds small in isolation, but compounded over 30 years, it means a dollar today buys less
          than half of what it bought three decades ago. This is one of the main reasons people underestimate
          how much they'll actually need in retirement, they plan around today's cost of living instead of
          what that same lifestyle will cost decades from now.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because inflation is largely unpredictable and outside anyone's direct control, most retirement
          planning focuses less on forecasting it precisely and more on aiming for a steady, strong total
          return that outpaces it over the long run. That said, some investors take more direct steps to
          guard against it. Treasury Inflation-Protected Securities (TIPS) in the U.S. — and similar
          inflation-linked government bonds elsewhere — are built specifically to adjust with inflation.
          Gold and other commodities are traditionally treated as a hedge as well, and dividend-paying
          stocks are often favored over short-term bonds by investors trying to keep pace with rising prices
          while still generating income.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where Retirement Income Actually Comes From</h2>
        <p style={pStyle}>
          Most retirees don't rely on a single source of income, they piece together a mix of the following,
          and understanding each one helps clarify where your own retirement savings should be concentrated.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 10 }}>
            <strong>Social Security.</strong> In the U.S., Social Security is a government-run social
            insurance program funded through FICA payroll withholdings during a person's working years. It's
            designed to replace only about 40% of a typical worker's pre-retirement income, yet a large
            share of workers and retirees, roughly a third of current workers and half of retirees, expect
            it to be their main source of income after leaving the workforce. Benefits are loosely tied to
            lifetime earnings but not proportionally: someone earning $20,000 a year might receive around
            $800 a month in benefits, while someone earning $100,000 a year might receive around $2,000 a
            month. The increase isn't 5x even though the income is 5x, which means lower earners get
            proportionally more back relative to what they paid in.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>401(k), 403(b), and 457 plans.</strong> These are the most common employer-sponsored
            retirement accounts in the U.S. A 401(k) is offered by most private employers, while a 403(b)
            serves employees of nonprofits, schools, and religious organizations, and a 457 plan typically
            covers government employees. Many employers match a portion of employee contributions, for
            example, matching up to 3% of gross pay, which on a $60,000 salary could mean an extra $1,800 a
            year contributed on the employee's behalf at no direct cost. Only a small fraction of companies
            offering these plans decline to contribute anything at all, which is why it's generally worth
            contributing at least enough to capture the full employer match. Contributions are typically
            made pre-tax, allowing the balance to grow tax-deferred until withdrawals begin in retirement,
            when the money is taxed as ordinary income, often at a lower rate than during peak earning
            years.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Traditional and Roth IRAs.</strong> Individual Retirement Accounts work similarly to
            employer plans but are opened independently rather than through a job. The core difference
            between the two types comes down to when taxes apply. Traditional IRA contributions are
            typically made with pre-tax income and are taxed upon withdrawal in retirement. Roth IRA
            contributions are made with after-tax income, but withdrawals in retirement, including
            investment growth, aren't taxed at all, which can be a meaningful advantage for people who
            expect to be in a similar or higher tax bracket later in life.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Pension plans.</strong> A pension is a fund that an employer pools and manages on behalf
            of employees until retirement, at which point retirees can typically choose fixed periodic
            payouts or, in some cases, a lump-sum payment. Public sector employees in the U.S. are more
            likely to have pension coverage than Social Security alone, while private-sector pensions have
            become far less common than they once were, largely because increasing life expectancy means
            each retiree's payout now needs to stretch across more years, supported by fewer active workers
            paying in.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Investments and CDs.</strong> Once tax-advantaged accounts like 401(k)s and IRAs are
            maxed out, and all of them have annual contribution limits, additional retirement savings often
            go into general investments. Common options include mutual funds, index funds, individual
            stocks, real estate, bonds, commodities like gold, and Certificates of Deposit. Each carries a
            different risk and return profile: broad funds tend to offer steadier long-term growth,
            individual stocks are more volatile, gold and real estate tend to move with broader economic
            conditions, and CDs offer low but stable returns that suit people who are already retired or
            close to it and want to protect their principal rather than grow it aggressively.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Personal savings.</strong> Checking, savings, and money market accounts are usually the
            first place surplus income lands, but they rarely make a strong long-term retirement vehicle on
            their own. Interest rates on standard savings accounts are typically low, and after accounting
            for taxes, the real return often fails to keep pace with inflation. That said, keeping some
            money in an accessible account still matters, a solid emergency fund protects the rest of a
            retirement plan from being disrupted by unexpected expenses, and any leftover emergency savings
            can eventually be redirected into longer-term retirement accounts.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Home equity and reverse mortgages.</strong> For homeowners, equity built up over decades
            can become a retirement income source through a reverse mortgage. In simple terms, it works in
            the opposite direction of a normal mortgage: instead of the homeowner paying down a loan until
            they own the home outright, a lender pays the homeowner over time, with ownership of the home
            transferring once the arrangement ends. It essentially allows someone to be paid to continue
            living in a home they already own.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Annuities.</strong> An annuity provides a fixed, recurring income stream, often
            structured to last for the rest of a person's life. Immediate annuities begin paying out shortly
            after an upfront premium is paid. Deferred annuities work in two stages, an accumulation phase
            where money is contributed over time, followed by an annuitization phase where regular payments
            begin, often years or decades later.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Passive income.</strong> Rental income, business income, stock dividends, and royalties
            all fall under this category. Passive income becomes particularly useful once contribution
            limits on 401(k)s and IRAs have been reached, giving retirees another place to direct additional
            savings without waiting on tax-advantaged account rules.
          </li>
          <li>
            <strong>Inheritance.</strong> Money or assets passed down from a deceased family member can also
            support retirement income, though inheritances aren't always as straightforward as they seem.
            Depending on where you live, inherited estates can be subject to federal estate tax, and in some
            U.S. states, a separate inheritance tax as well. If inherited assets like real estate or
            valuables are later sold for a profit, capital gains tax may apply, and market or legal factors
            can also change the value of an estate between the time it's left and the time it's received.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Safe Withdrawal Rates: How Long Will Your Savings Last?</h2>
        <p style={pStyle}>
          Saving enough is only half the equation, the other half is making sure you don't outlive your
          money. This is where the withdrawal rate matters as much as the savings rate. Withdraw too
          aggressively in the early years of retirement, and a market downturn can permanently damage your
          remaining balance; withdraw too conservatively, and you may end up unnecessarily limiting your
          lifestyle.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator's withdrawal projection estimates how long a given savings balance will last at a
          chosen monthly withdrawal amount, accounting for continued (typically modest) growth on the
          remaining funds. This lets you test questions like: "If I withdraw $3,000 a month starting at 65,
          does my balance last to 90?" or "What monthly withdrawal keeps my savings intact through a 30-year
          retirement?" Running a few different withdrawal scenarios before you actually retire, rather than
          after, gives you time to adjust your savings rate or retirement age if the numbers don't line up
          with your expectations.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Retirement Planning Mistakes to Avoid</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few recurring mistakes show up across almost every retirement plan that falls short.
          Underestimating inflation is one of the most damaging, a comfortable income today can lose
          significant purchasing power over a 20–30 year retirement if growth doesn't at least keep pace
          with rising costs. Starting to save too late is another, since the earliest contributions have the
          most time to compound and are disproportionately valuable compared to money saved later. Ignoring
          healthcare costs is a frequent oversight as well; medical expenses tend to rise faster than general
          inflation and often increase with age. Finally, many people build a single static plan and never
          revisit it, even as income, expenses, and market conditions change significantly over a working
          career. Treating your retirement number as a living target that gets checked periodically, rather
          than a one-time calculation, avoids most of these pitfalls.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Reach Your Retirement Number Faster</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your projected retirement date is later than you'd like, a handful of adjustable factors
          typically move the needle most. Increasing your monthly contribution has a direct and compounding
          effect, especially the earlier it happens. Extending your working years by even two or three years
          can meaningfully change your outcome, since it adds more contribution years while also shortening
          the number of years your savings need to cover. Reducing planned retirement expenses, even
          modestly, lowers your overall target and the withdrawal rate you'll need in retirement. Finally,
          reviewing your expected rate of return assumption against your actual investment allocation
          ensures your projections are realistic rather than overly optimistic or overly cautious. Testing
          each of these adjustments individually in the calculator shows you which one closes the gap most
          efficiently for your specific situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Built to Be Accurate</h2>
        <p style={pStyle}>
          This retirement calculator is completely free to use, with no signup, account creation, or hidden
          charges of any kind. You don't need to provide an email address or any personal financial account
          information, just the numbers you choose to enter, which are used only to generate your results on
          the page. Nothing you enter is stored or shared, and no financial data is transmitted anywhere
          beyond calculating your projection at the moment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The underlying calculations follow standard, widely used compound growth and withdrawal formulas
          rather than proprietary or opaque logic, which means the results are transparent and reproducible,
          you can sanity-check them against other reputable retirement calculators or your own spreadsheet
          if you'd like. As with any projection tool, the output is an estimate based on the assumptions you
          provide, not a guarantee of future investment performance, so it's best used as a planning aid
          alongside, not a replacement for, professional financial advice for major decisions.
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
