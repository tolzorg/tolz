import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Should I take the lump sum or the monthly pension?",
    a: "It depends on your health, your other income, how comfortable you are investing, and whether you want to leave money to heirs. The monthly pension gives you guaranteed income for life and protects against outliving your money. The lump sum gives you flexibility and something to pass on. Run both through the calculator with a few different return assumptions before you decide.",
  },
  {
    q: "How do I calculate the break-even age for a pension?",
    a: "Divide the lump sum by your yearly pension. A $400,000 lump sum against $28,800 a year breaks even in about 13.9 years, so around age 79 if payments start at 65. A more accurate version discounts future payments to today's dollars, which the calculator does for you.",
  },
  {
    q: "What's the difference between a single-life and joint-and-survivor pension?",
    a: "A single-life pension pays the most but stops when you die. A joint-and-survivor pension pays less each month, but a percentage of it (like 50%, 75%, or 100%) continues to your spouse after you're gone.",
  },
  {
    q: "Is a joint-and-survivor pension worth it?",
    a: "Usually, if your spouse or partner relies on your pension and doesn't have enough other income. The reduction is the price of that protection. It's most valuable when your spouse is younger than you or in good health.",
  },
  {
    q: "What is a survivor benefit ratio?",
    a: "It's the percentage of your pension your spouse keeps after you die. Common ratios are 50%, 66%, 75%, and 100%. If you both receive $1,000 a month under a 50% option and one of you dies, the survivor gets $500 a month.",
  },
  {
    q: "What is a period of certainty or guarantee period?",
    a: "It's an add-on to a single-life pension that pays your beneficiary for a set number of years (often 5 or 10) if you die early. After that period, payments stop. The monthly amount is lower than a plain single-life option.",
  },
  {
    q: "Can I change my pension payout option after I retire?",
    a: "In most plans, no. Once payments begin, the election is usually final, with only narrow exceptions. That's why it's worth comparing everything first.",
  },
  {
    q: "Is it worth working longer to get a bigger pension?",
    a: "Sometimes. If you're below your plan's normal retirement age, an extra year can wipe out an early-retirement reduction and add service credit. If you're already at the max benefit, the gain may be small. The calculator compares the increase against the checks you delay.",
  },
  {
    q: "How is a pension lump sum calculated?",
    a: "Plans convert your expected future monthly payments into a present value using an interest rate and mortality tables. Higher interest rates produce smaller lump sums, which is why buyout offers can change from year to year.",
  },
  {
    q: "Are pension lump sums taxable?",
    a: "A lump sum paid directly to you is generally taxable income that year, and the plan typically withholds 20% up front. A direct rollover into an IRA or another qualified plan usually defers the tax. A tax professional can confirm how the rules apply to you.",
  },
  {
    q: "What's the difference between a defined-benefit and a defined-contribution plan?",
    a: "A defined-benefit plan promises a set benefit based on your pay and years of service, and the employer carries the investment risk. A defined-contribution plan, like a 401(k), builds an account from contributions, and your balance depends on the markets. This calculator is designed for defined-benefit pensions.",
  },
  {
    q: "Do pensions have cost-of-living adjustments?",
    a: "Some do, especially public pensions. Most private-sector pensions don't, so the payment stays flat while prices rise. If your plan has a COLA, enter it in the calculator. If not, use 0%.",
  },
  {
    q: "What happens to my pension if my employer goes bankrupt?",
    a: "For most private-sector plans, the PBGC steps in and pays benefits up to a legal maximum. Some people with large benefits get less than they were promised. Public pensions depend on the funding of the state or local plan.",
  },
  {
    q: "Is this pension calculator free?",
    a: "Yes. It's free to use online, and there's no charge for any of the comparisons.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "Should I take the lump sum or the monthly pension?",
    a: "It depends on your health, other income, how comfortable you are investing, and whether you want to leave money to heirs. The monthly pension gives guaranteed lifetime income, while the lump sum gives flexibility and something to pass on. Run both through the calculator with several return assumptions before deciding.",
  },
  {
    q: "How do I calculate the break-even age for a pension?",
    a: "Divide the lump sum by your yearly pension. A $400,000 lump sum against $28,800 a year breaks even in about 13.9 years, or around age 79 if payments start at 65. A more accurate version discounts future payments, which the calculator does automatically.",
  },
  {
    q: "What's the difference between a single-life and joint-and-survivor pension?",
    a: "A single-life pension pays the most but stops when you die. A joint-and-survivor pension pays less each month, but a percentage of it continues to your spouse after you're gone.",
  },
  {
    q: "Is a joint-and-survivor pension worth it?",
    a: "Usually, if your spouse or partner relies on your pension and lacks other income. The reduction is the price of that protection, and it's most valuable when your spouse is younger than you or in good health.",
  },
  {
    q: "What is a survivor benefit ratio?",
    a: "It's the percentage of your pension your spouse keeps after you die. Common ratios are 50%, 66%, 75%, and 100%.",
  },
  {
    q: "What is a period certain or guarantee period?",
    a: "It's an add-on to a single-life pension that pays your beneficiary for a set number of years, often 5 or 10, if you die early. Monthly payments are lower than a plain single-life option.",
  },
  {
    q: "Can I change my pension payout option after I retire?",
    a: "In most plans, no. Once payments begin, the election is usually final, with only narrow exceptions.",
  },
  {
    q: "Is it worth working longer to get a bigger pension?",
    a: "Sometimes. If you're below your plan's normal retirement age, an extra year can remove an early-retirement reduction and add service credit. If you already receive the maximum benefit, the gain may be small.",
  },
  {
    q: "How is a pension lump sum calculated?",
    a: "Plans convert your expected future monthly payments into a present value using an interest rate and mortality tables. Higher interest rates produce smaller lump sums.",
  },
  {
    q: "Are pension lump sums taxable?",
    a: "A lump sum paid directly to you is generally taxable income that year, and the plan typically withholds 20%. A direct rollover into an IRA or another qualified plan usually defers the tax. Confirm with a tax professional.",
  },
  {
    q: "What's the difference between a defined-benefit and a defined-contribution plan?",
    a: "A defined-benefit plan promises a set benefit based on pay and years of service, with the employer carrying the investment risk. A defined-contribution plan, like a 401(k), builds an account from contributions, and the balance depends on investment performance.",
  },
  {
    q: "Do pensions have cost-of-living adjustments?",
    a: "Some do, especially public pensions. Most private-sector pensions don't, so the payment stays flat while prices rise.",
  },
  {
    q: "What happens to my pension if my employer goes bankrupt?",
    a: "For most private-sector plans, the PBGC steps in and pays benefits up to a legal maximum. Public pensions depend on the funding of the state or local plan.",
  },
  {
    q: "Is this pension calculator free?",
    a: "Yes. It is free to use online, with no charge for any of the comparisons.",
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

export default function PensionCalculatorFaqSection() {
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
          Pension decisions are hard to undo. Once you pick a payout and the checks start, that's usually
          it, so it pays to run the numbers before you sign anything. The pension calculator from{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> is built for that moment. Plug in your offer
          and you can see how a lump sum stacks up against monthly pension income, how a single-life payout
          compares with a joint-and-survivor option, and whether staying on the job a few more years is
          actually worth it. It's a free online pension calculator made for the choice you're facing, not a
          generic "how much will I have at 65" projector.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Pension Calculator Does</h2>
        <p style={pStyle}>
          Most retirement tools ask how much you're saving and guess where you'll end up. This one starts
          later in the story. You already have a pension, or you're about to get an offer, and you need to
          know which version of it makes the most sense.
        </p>
        <p style={pStyle}>It covers three common situations:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Lump sum vs monthly pension:</strong> a one-time payout versus a check every month for
            life.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Single-life vs joint-and-survivor:</strong> the biggest possible payment for you versus
            a smaller payment that keeps going for your spouse or partner.
          </li>
          <li>
            <strong>Retire now vs work longer:</strong> what you gain from more service credit, a higher pay
            average, and a smaller early-retirement cut, compared with the pension checks you skip while you
            keep working.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          The results show up as plain numbers: monthly and annual income, break-even age, and what you'd
          have collected by different ages. You get to see the trade-off instead of just taking the
          calculator's word for it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One heads-up. Pension rules vary a lot from one employer to the next, and the calculator can only
          work with what you give it. Your plan's own paperwork is always the final word.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pension Basics: Defined-Benefit vs Defined-Contribution Plans</h2>
        <p style={pStyle}>
          "Pension" gets used loosely. Some people mean a traditional employer pension, and some just mean
          any retirement account. Knowing which one you have matters, because this calculator is built for
          the first kind.
        </p>
        <p style={pStyle}>
          Defined-benefit (DB) plans are the classic pension. Your employer promises a specific benefit at
          retirement, usually based on your age, your pay history, and how many years you worked there.
          Longer service and higher pay generally mean a bigger check. The employer carries the investment
          risk and is on the hook for paying what it promised. Employees sometimes chip in too, depending on
          the plan. If the company is sold or reorganized, your earned benefit doesn't just vanish, though as
          we'll get to, a company in serious financial trouble is a different story.
        </p>
        <p style={pStyle}>
          Defined-contribution (DC) plans work the other way around. Money goes into an account for you,
          often your own paycheck contributions plus an employer match, and you decide how to invest it.
          What you end up with depends on how much went in and how the markets treated it. Nobody promises
          you a number. The 401(k), 403(b), 457 plan, IRA, and Roth IRA all fall in this bucket, and most
          people call them by those names rather than "DC plans."
        </p>
        <p style={pStyle}>
          The upside of a DC plan is control and portability. You pick the investments, and if you change
          jobs you can often roll the balance into an IRA or your next employer's plan (though not every
          plan accepts rollovers). The downside is that you carry the risk. A big market drop right before
          retirement can hurt, and there's no guaranteed floor.
        </p>
        <p style={pStyle}>
          If you have a 401(k) and no traditional pension, the pension-specific features here (survivor
          options, lump sum vs monthly) won't apply. If you have both, which is common among public
          employees and longtime employees of older companies, you'll be using this calculator for the DB
          piece and handling the rest separately.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Social Security is technically a defined-benefit program too, and it's the one nearly every
          American worker gets. But it's designed to replace only around 40% of the average worker's
          pre-retirement earnings. That's why a pension or personal savings matters so much.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Traditional Pensions Are Getting Rarer (and Why That Matters to You)</h2>
        <p style={pStyle}>
          Private employers have been moving away from DB plans for decades, and it's worth understanding
          why, because some of those reasons affect the value of the pension you do have.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Cost and unpredictability.</strong> The employer bears the risk when investments
            underperform or people live longer than expected. Administration also costs more than running a
            401(k).
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Short job tenures.</strong> Traditional pensions reward long service. Many plans only
            deliver their full value if you stay for 20 or 25 years, and fewer people do that now.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Vesting rules.</strong> Most plans require a minimum number of years before the benefit
            is yours. Some use a "cliff" (nothing until year five, say, then 100%) and others phase in
            gradually. Leave before you're vested and you may walk away with nothing from the employer's
            side.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Frozen plans.</strong> A company can freeze its plan, which means some or all employees
            stop earning new benefits from that date forward. What you've already earned stays, but growth
            stops. Rising costs and unfavorable interest rates are common triggers.
          </li>
          <li>
            <strong>Employer failure.</strong> If a private company can't fund its pension, the Pension
            Benefit Guaranty Corporation (PBGC) steps in as a backstop. That's real protection, but it has
            limits. The PBGC's maximum guarantee is capped, adjusted each year, and is lower if you start
            collecting early, so higher earners with big benefits can end up with less than they were
            promised. You can check current limits on pbgc.gov.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Public sector pensions (teachers, police, state and local workers) are still fairly common,
          partly because governments are less likely to disappear. They still can be underfunded, though,
          and that's worth knowing about.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your plan is frozen or your employer is shaky, that changes how much weight you might give to
          the lump sum. It doesn't automatically make the lump sum better, but it makes the "guaranteed for
          life" part of the pension less certain than it looks.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lump Sum vs Monthly Pension: How the Comparison Works</h2>
        <p style={pStyle}>
          Most DB plans that offer a choice give you two routes: a one-time lump sum (sometimes called the
          commuted value) or monthly payments for life. The lump sum is basically the plan's estimate of
          what your future monthly checks are worth today, converted to a single amount using an interest
          rate and a life expectancy table.
        </p>
        <p style={pStyle}>
          Here's a quick example. Your employer offers either $400,000 now or $2,400 a month starting at
          65. That's $28,800 a year. Divide $400,000 by $28,800 and you get about 13.9 years, so the pension
          "catches up" to the lump sum right around age 79. Live past that and the pension has paid you more
          in total. Don't make it that far and the lump sum wins.
        </p>
        <p style={pStyle}>
          That's the break-even age, and the pension payout calculator shows it first. But it's a rough
          tool, because it treats a dollar in 2045 as if it were worth the same as a dollar today. It isn't.
          Money you take now can be invested, and money you receive later gets chipped away by inflation. So
          the calculator also lets you set an assumed investment return (the discount rate) and an inflation
          rate, which converts future pension payments into today's dollars. Then you're comparing apples to
          apples.
        </p>
        <p style={pStyle}>The assumption you pick matters a lot:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            A high assumed return makes the lump sum look better, since your invested money is expected to
            grow faster.
          </li>
          <li>
            A low assumed return makes the pension look better, since the guaranteed check is worth more
            compared to what you could safely earn.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          A good sanity check is the implied payout rate. In our example, $28,800 on $400,000 works out to
          7.2% a year. Most people can't safely pull 7.2% a year from a portfolio for 30 years, because a
          common planning guideline for sustainable withdrawals is closer to 4%. That gap is why a pension
          often looks pretty good in a lump sum vs annuity calculator, especially for someone who expects to
          live a long time.
        </p>
        <p style={pStyle}>What's good about the monthly pension:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            It's guaranteed income you can't outlive, and you can't blow it all in the first few years.
          </li>
          <li style={{ marginBottom: 8 }}>
            Your employer carries the obligation, so stock market swings don't change your check.
          </li>
          <li>You don't have to manage investments or make withdrawal decisions.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>What's good about the lump sum:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Flexibility.</strong> You can spend, save, or invest it however you like. Want to spend
            more in your first ten years, when you're healthiest? You can. That's tough with a fixed monthly
            check.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Leaving something behind.</strong> Most pension payments stop when you die, unless you
            choose a survivor option. Lump sum money rolled into an IRA can go to your beneficiaries.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Shorter life expectancy.</strong> If you have a serious health condition and don't
            expect to reach the break-even age, the lump sum often comes out ahead.
          </li>
          <li>
            <strong>Tax deferral.</strong> A direct rollover into an IRA keeps the money tax-deferred until
            you withdraw it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Flexibility cuts both ways, though. If you're someone who struggles with big chunks of cash, or
          you don't have a financial advisor you trust, a lump sum can turn into a problem. Markets drop,
          spending creeps up, and 30 years is a long time to make good decisions. If protection against
          outliving your money is your priority, that's what the monthly pension is built for.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Single-Life vs Joint-and-Survivor: Protecting a Spouse or Partner</h2>
        <p style={pStyle}>
          Say you've decided on the monthly pension. Now you have to pick how long it pays.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>A single-life pension</strong> pays the highest monthly amount, but it stops when you
            die. If you're married and your spouse depends on that income, they're left without it. This is
            why single-life is most common for retirees without a spouse or dependents.
          </li>
          <li>
            <strong>A joint-and-survivor pension</strong> pays less each month, but it continues for your
            spouse or partner after you're gone. You're basically trading some income now for insurance on
            their future.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          The amount that continues is called the survivor benefit ratio, and it's set when payments begin.
          Common options are 50%, 66%, 75%, and 100%. Here's how that could look, using illustrative
          numbers. Say your single-life benefit is $2,400 a month:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            50% survivor: you might get $2,250 a month. After you die, your spouse gets $1,125.
          </li>
          <li>100% survivor: you might get $2,100 a month. After you die, your spouse still gets $2,100.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          The exact cuts depend on your plan and on both of your ages, so use the real figures from your
          benefits statement. The joint and survivor pension calculator shows the monthly reduction, the
          yearly cost of the survivor protection, and the total expected income across a range of lifespans.
        </p>
        <p style={pStyle}>
          A third choice: single-life with a guarantee period. Some plans offer a "period certain" (usually
          5 or 10 years). If you die inside that window, your beneficiary collects the remaining payments
          until it's over, and then payments stop. This pays less than a plain single-life option but more
          than most joint options. It's a middle ground for people who want some protection but not
          lifelong survivor coverage.
        </p>
        <p style={pStyle}>A few things people miss:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Age gap.</strong> A survivor benefit for a spouse who's 10 years younger is worth much
            more than one for a spouse your own age, because it's expected to last longer. The calculator
            accounts for this.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Spousal consent.</strong> Under federal rules for most private-sector plans, married
            participants generally get a joint-and-survivor payout by default. Picking single-life usually
            requires your spouse's written consent. Public plans follow their own rules, so check with your
            administrator.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>The life insurance workaround.</strong> Some people take the higher single-life payment
            and buy life insurance to replace the survivor income. It can work, but you're adding premiums
            and health underwriting to the equation, and it only makes sense if the insurance costs less
            than the pension reduction. Get real quotes before betting on it.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>"Pop-up" features.</strong> Some plans will bump your payment back up to the single-life
            amount if your spouse dies before you. If yours does, it makes the joint option more attractive,
            so ask your administrator.
          </li>
          <li>
            <strong>Divorce and remarriage.</strong> Whoever is named survivor at retirement is usually
            locked in. A later divorce might not change it, depending on the plan and any court order, so
            it's worth getting this right up front.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Working Longer Worth It? The Pension Math</h2>
        <p style={pStyle}>
          The third comparison answers something many people wonder about: what does one more year of work
          actually get me?
        </p>
        <p style={pStyle}>
          In a typical final-average-salary plan, the pension equals a percentage multiplier, times years of
          service, times your average pay. Say the multiplier is 1.5%, your final average salary is
          $70,000, and you have 25 years of service. That's a $26,250 pension a year. Work one more year and
          it rises to about $27,300. That's an extra $1,050 a year for the rest of your life, and more if
          raises push your salary average up.
        </p>
        <p style={pStyle}>
          Now look at what waiting costs. If you could have started collecting, you skipped a year of
          $26,250 in pension checks. On the other hand, you also earned a salary, probably kept contributing
          to a 401(k), and didn't touch your savings. The calculator stacks all of that so you see the whole
          picture and not just the pension bump.
        </p>
        <p style={pStyle}>
          Working longer can matter even more if you're retiring before your plan's normal retirement age.
          Many plans cut your benefit for each year you retire early. Reductions of around 3% to 6% a year
          are common, though it varies. Waiting until you hit the unreduced age, or the plan's "rule of 85"
          or similar threshold, can raise your monthly check by more than the extra service alone would
          suggest. Some plans also pay a bonus for delaying past normal retirement age.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The answer varies plan to plan. In some, another year adds a small bump, and the paycheck is the
          real payoff. In others, it crosses a line that changes your benefit a lot. That's what the
          calculator is for: you see the difference before you tell your boss you're leaving.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cost-of-Living Adjustments (COLA) and Inflation</h2>
        <p style={pStyle}>
          Prices go up over time. A $2,400 check feels comfortable now, but 25 years from now it buys a lot
          less. A cost-of-living adjustment (COLA) raises your payments over time to help keep up.
        </p>
        <p style={pStyle}>
          Social Security has an automatic COLA. Many public pensions include one too, sometimes fixed at a
          set percentage and sometimes tied to inflation with a cap. Most private-sector pensions don't.
          Your check stays the same for life, and inflation quietly eats away at it. A plan that's well
          funded might be able to afford increases from time to time, but that's up to the employer, and
          underfunded plans usually can't.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Inflation is one of the biggest reasons the monthly-vs-lump-sum decision isn't simple. A fixed
          pension at 65 looks great, but by 85 it may cover a lot less. Meanwhile a lump sum invested in a
          mix that includes stocks has a shot at keeping pace, though with no guarantee. In the tool, put in
          your plan's COLA if it has one. If it doesn't, use 0%. And if you're not sure what inflation will
          do, try a few values. Inflation has averaged around 3% over the long run, but it's been well above
          that at times, and a few years of high inflation early in retirement can do real damage.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What You Need to Use the Pension Calculator</h2>
        <p style={pStyle}>
          You'll get the best results if you have your benefits statement handy. Here's what to gather:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>
            Your monthly pension estimate at your planned retirement age, or the pieces of the formula:
            multiplier, years of service, and average salary.
          </li>
          <li style={{ marginBottom: 6 }}>
            The lump sum offer, if your plan gives one. It might be labeled commuted value, buyout, or
            cash-out.
          </li>
          <li style={{ marginBottom: 6 }}>Your age and your spouse's or partner's age.</li>
          <li style={{ marginBottom: 6 }}>
            The survivor reduction for each joint option. Your plan administrator can provide this.
          </li>
          <li style={{ marginBottom: 6 }}>Whether there's a COLA, and how it works.</li>
          <li>Your assumed investment return and inflation rate.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          No lump sum offer yet? You can still test the monthly side and the survivor choices. Not sure what
          return to use? Run the numbers three times with a cautious, a middle, and an optimistic rate. If
          all three point to the same answer, you can feel a lot better about it. If they flip depending on
          the assumption, that's useful to know too, and it probably means the decision hinges on things
          like health or risk comfort, not just math.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick tip on rates: stocks have returned around 10% a year historically, but that's a long-run
          average that includes big swings, and it's not what you'd want to count on in retirement, when
          you're more likely to hold safer investments. Rates in the 4% to 6% range are common for retirees
          with a mixed portfolio, and lower for very conservative ones.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Need This Tool</h2>
        <p style={pStyle}>Here are the situations where people usually reach for a pension calculator:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>A buyout offer shows up.</strong> Companies sometimes offer former employees a lump sum
            to take pension obligations off their books. You usually have a limited window to decide.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're close to retirement.</strong> Your plan wants you to choose a payout form, and
            it's usually final once payments start.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're leaving a job with a vested pension.</strong> Some plans let you take a lump sum
            now or leave the pension alone and collect it later.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Your spouse's health or age changes the picture.</strong> Survivor options look
            different when one of you has a shorter life expectancy.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're deciding whether to retire early.</strong> The working-longer comparison shows
            whether waiting is worth it.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're mapping out retirement income.</strong> Knowing what your pension is really
            worth helps you decide how much to pull from savings and when to start Social Security.
          </li>
          <li>
            <strong>You're reviewing a divorce settlement.</strong> Pensions are often a big marital asset,
            and understanding present value vs monthly benefit is essential.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Your Pension Fits Into the Bigger Retirement Picture</h2>
        <p style={pStyle}>
          A pension is one piece of your retirement income. Before deciding, it helps to see the whole
          thing.
        </p>
        <p style={pStyle}>
          Most people's retirement income comes from a few places: Social Security, a pension (if they have
          one), personal savings like a 401(k) or IRA, and sometimes part-time work. Add up what you need to
          cover essential expenses like housing, food, healthcare, and insurance. Then see how much of that
          is covered by guaranteed sources, meaning Social Security plus the pension. If those cover your
          essentials, you have more room to take risks with the rest, and a lump sum becomes easier to
          justify. If they don't, the monthly pension may be doing important work that's hard to replace.
        </p>
        <p style={pStyle}>
          A common rule of thumb is that you'll need somewhere around 70% to 80% of your pre-retirement
          income to maintain your lifestyle, though it varies a lot. Some people spend less once the
          mortgage is paid off and commuting stops, and some spend more because of travel and healthcare.
        </p>
        <p style={pStyle}>
          Also remember that pension payments are generally taxable, and this tool focuses on the pension
          decision itself, so factor taxes into your overall plan. If you're married and both of you have a
          pension or Social Security benefit, work through each person's options individually.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more note for public employees. For years, the Windfall Elimination Provision and Government
          Pension Offset reduced Social Security benefits for some people with government pensions. Those
          rules were repealed in early 2025, so if you were told your Social Security would be cut because
          of a public pension, it's worth rechecking your situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Numbers Can't Tell You</h2>
        <p style={pStyle}>
          A calculator gives you a clean comparison, not a verdict. Some things deserve real thought
          alongside the results.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Taxes.</strong> Monthly pension checks are generally taxed as ordinary income. A lump
            sum taken as cash can push a huge amount into one tax year. If it's paid directly to you, the
            plan is typically required to withhold 20% for federal taxes, and if you're under 59½ you may
            owe a 10% early withdrawal penalty on top, with some exceptions. A direct rollover into an IRA
            avoids the immediate tax hit, but you'll pay tax when you withdraw. And at 73, required minimum
            distributions kick in for most IRAs. Ask a tax professional to run the numbers on your
            situation.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Medicare premiums.</strong> A big income spike, like an unrolled lump sum, can raise
            your Medicare Part B and D premiums two years later through income-related surcharges (IRMAA).
            It's easy to miss, and it can cost thousands.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Retiree health coverage.</strong> Some employers tie retiree medical benefits to the
            pension. Taking the lump sum could mean giving up that coverage. Ask before you decide, because
            replacing it can be expensive.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Health and life expectancy.</strong> Break-even ages are based on averages. Your own
            health and family history are a better guide than population statistics.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Employer strength.</strong> Private pensions in the U.S. are generally covered by the
            PBGC, but only up to limits. Public pensions depend on the plan's funding. Some people choose a
            lump sum to remove that dependence.
          </li>
          <li>
            <strong>How you'd handle the money.</strong> Be honest with yourself here. A lump sum only
            works if you can manage it well over decades.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          For a decision this size, use the results to prepare good questions. Then confirm the details
          with your plan administrator and consider a fee-only financial advisor or tax professional.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Straightforward</h2>
        <p style={pStyle}>
          This pension calculator is free, with no hidden charges and no locked results. You enter the
          numbers you choose to share and see the comparison right away. Pension details are personal, so
          the tool only asks for what the math needs: ages, benefit amounts, and your assumptions. It
          doesn't need your name, employer, or account information.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, it uses standard present-value and break-even calculations and shows the assumptions
          you entered so you can check the logic and change it. Results are estimates based on your inputs.
          Your official plan documents come first, so verify the final numbers with your administrator
          before making an election you can't reverse.
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
