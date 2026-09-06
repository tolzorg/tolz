import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is compound interest different from simple interest?",
    a: "Simple interest is calculated only on your original principal, so it grows at a constant amount each period. Compound interest is calculated on the principal plus any interest already earned, so the growth amount increases over time. Over long periods, this difference becomes substantial.",
  },
  {
    q: "What is the Rule of 72?",
    a: "It's a quick mental shortcut for estimating how long it takes an investment to double: divide 72 by the annual interest rate. At 8%, for example, that's 72 ÷ 8 = 9 years. It's most accurate for rates between roughly 6% and 10%, and still reasonably close for anything under about 20%, but it's an estimate, not a substitute for running exact numbers.",
  },
  {
    q: "Does this calculator handle floating or variable interest rates?",
    a: "No. This calculator is built for fixed interest rates, which stay constant for the full term and can be projected precisely. Floating rates move with a reference benchmark like the federal funds rate, so they can't be modeled with a fixed growth formula.",
  },
  {
    q: "Does it matter if contributions are added at the start or end of a period?",
    a: "Yes, slightly. A contribution added at the start of a compounding period earns interest during that same period, while one added at the end doesn't start earning interest until the next period, so otherwise identical contribution schedules can produce marginally different totals depending on timing.",
  },
  {
    q: "How often should interest compound for the best return?",
    a: "More frequent compounding, daily or monthly, produces a slightly higher effective return than less frequent compounding (like annual) at the same nominal rate, because interest starts earning interest sooner. The difference is small in any single year but grows meaningfully over long timeframes.",
  },
  {
    q: "Should I make monthly or annual contributions?",
    a: "Monthly contributions typically produce a marginally higher balance than one equivalent annual contribution, since smaller amounts are added and start compounding sooner throughout the year. The practical difference is usually modest, so consistency matters more than frequency.",
  },
  {
    q: "Does this calculator account for taxes on interest?",
    a: "Yes. You can enter a tax rate, and the calculator reduces interest earned at each compounding period accordingly, producing an after-tax projection instead of a pre-tax figure.",
  },
  {
    q: "Why does the calculator show two final numbers when I add an inflation rate?",
    a: "The first is your nominal (unadjusted) projected balance. The second reflects that same balance's value in today's purchasing power, based on the inflation rate you entered, so you can see both the raw total and its real-world equivalent.",
  },
  {
    q: "Is this compound interest calculator really free to use?",
    a: "Yes. There's no signup, no account, and no hidden charges to use the calculator or view the full accumulation schedule.",
  },
  {
    q: "Is my financial data safe when I use this tool?",
    a: "The figures you enter are used only to run the calculation in your browser and are not stored or transmitted, so your financial details remain private.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
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

export default function InterestCalculatorFaqSection() {
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
          Figuring out how much a sum of money will actually grow into over time is harder than it sounds
          once you factor in contributions, compounding frequency, taxes, and inflation. A single "future
          value" formula from a textbook rarely reflects how people actually save, most of us add money
          monthly or yearly on top of an initial deposit, and we want to know what that really adds up to in
          real, spendable terms. This calculator, available free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, was built to answer that question precisely.
          It projects growth on a lump-sum investment combined with ongoing monthly or annual contributions,
          lets you set any compounding frequency, and includes optional tax and inflation adjustments so the
          number you see is closer to what you'll actually have.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Interest, and Why Does It Drive Nearly Every Financial Product?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Interest is, at its core, the price of using someone else's money. A bank pays you interest for
          keeping your cash on deposit because it lends that money out to others; a borrower pays interest
          to a lender because they get to use funds now instead of waiting to save them up. This single idea
          underpins savings accounts, mortgages, bonds, credit cards, and investment returns, which is why
          understanding how it's calculated matters far beyond one specific account or loan. There are two
          fundamentally different ways interest gets calculated: simple interest and compound interest, and
          the gap between them widens dramatically the longer money sits.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Simple Interest vs. Compound Interest</h2>
        <p style={pStyle}>
          Simple interest is the easiest to picture. Say you deposit $2,000 into an account paying 5%
          interest per year. After one year, the bank owes you:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>$2,000 × 5% = $100</p>
        <p style={pStyle}>
          giving you a balance of $2,100. If the account paid simple interest over three years, that same
          $100 would be paid out again each year, since simple interest is always calculated on the original
          principal only:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>interest = principal × rate × term</p>
        <p style={pStyle}>
          Over three years, that's $300 in total interest, for a final balance of $2,300. When the frequency
          of interest is something other than annual, say, monthly or quarterly, the formula adjusts to
          account for the number of periods within the term:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>
          interest = principal × rate × (term ÷ frequency)
        </p>
        <p style={pStyle}>
          In practice, simple interest is rare outside of very short-term loans and some auto loans. Almost
          everything you'll actually encounter, savings accounts, CDs, credit cards, most bonds, and every
          serious investment projection, uses compound interest instead, which is exactly what this
          calculator is built to model.
        </p>
        <p style={pStyle}>
          Compound interest works differently because each period's interest gets folded back into the
          balance before the next period's interest is calculated. Using the same $2,000 at 5%, annually
          compounded, the first year looks identical to simple interest, you earn $100, ending the year with
          $2,100. But in year two, the 5% is applied to $2,100, not the original $2,000:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>$2,100 × 5% = $105</p>
        <p style={pStyle}>
          bringing the balance to $2,205. By year three, 5% is applied to $2,205, adding $110.25 and bringing
          the total to $2,315.25, noticeably more than the $2,300 that simple interest would have produced.
          That $15.25 difference might look small over three years, but stretch the same account out to 25
          or 30 years and the gap between simple and compound growth becomes the single biggest factor
          separating a mediocre outcome from a strong one, since every year's interest is now earning
          interest of its own on top of interest already earned in prior years.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator handles all of that recalculation automatically. It takes your starting balance,
          your chosen interest rate, and your compounding frequency, then works through the balance period
          by period, adding any scheduled contributions along the way, rather than relying on one blanket
          shortcut formula that can miss details like contributions landing on a different schedule than
          compounding, or a tax rate that should only apply to interest and not to the whole balance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Interest Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Using the tool takes under a minute. Enter your initial lump-sum deposit, this can be zero if
          you're starting purely from contributions. Add your expected annual interest rate; if you're
          modeling a savings account, this is usually the advertised APY, and if you're modeling an
          investment, it's typically a long-term average return estimate. Choose your compounding frequency,
          daily, monthly, quarterly, semi-annually, or annually, since this determines how often interest is
          calculated and added to the balance. Then, if applicable, enter a recurring contribution amount
          and whether it's added monthly or annually. Finally, set the number of years you want to project,
          and optionally add a tax rate on interest earned and an expected inflation rate. The calculator
          instantly displays your projected ending balance, the total amount contributed, the total interest
          earned, and, if inflation is included, the equivalent value of that final balance in today's
          purchasing power.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Compounding Frequency Changes Your Results</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One detail that trips up a lot of people is assuming that a 6% annual rate produces the same
          result regardless of how often it compounds. It doesn't. Daily compounding produces a slightly
          higher effective return than monthly compounding, which in turn produces a higher return than
          annual compounding, because interest starts earning interest sooner and more often. If you plotted
          the growth of the same starting balance at daily, monthly, quarterly, and annual compounding, all
          four lines would sit almost on top of one another in the early years, the real separation only
          shows up once enough periods have passed for the extra compounding events to stack up. Taken to
          its mathematical extreme, continuous compounding, where interest is calculated at every
          conceivable instant rather than at fixed intervals, produces the theoretical ceiling on how much a
          given nominal rate can earn, and daily compounding sits very close to that ceiling in practice.
          This is also why two accounts advertising the same nominal interest rate can pay out different
          amounts: the one compounding daily has a higher effective annual rate than the one compounding
          annually, even though the stated rate is identical. Because this tool lets you switch the
          compounding frequency and instantly see the recalculated outcome, it's a fast way to compare
          products like high-yield savings accounts, CDs, or bonds that use different compounding schedules.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Rule of 72: A Fast Way to Estimate Doubling Time</h2>
        <p style={pStyle}>
          Before running exact numbers through a calculator, it helps to have a quick mental shortcut for
          roughly how long an investment takes to double, and that's exactly what the rule of 72 gives you.
          Divide 72 by the annual interest rate, and the result is approximately the number of years needed
          to double your money. For example, at a 9% return:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>72 ÷ 9 = 8 years</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          so a lump sum earning a steady 9% would roughly double in eight years. This shortcut is most
          accurate for rates between about 6% and 10%; it still holds up reasonably well anywhere under
          roughly 20%, but the estimate drifts further from the true, exact figure as the rate climbs
          higher. It's a useful gut-check for comparing offers at a glance, but for anything you're actually
          planning around, a real contribution schedule, a specific compounding frequency, taxes, or
          inflation, the full calculator above will give you a precise number instead of an approximation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed vs. Floating Interest Rates</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Interest rates generally come in one of two forms: fixed or floating. A fixed rate stays the same
          for the entire term of the account or loan, which is what makes it predictable and straightforward
          to project, exactly the kind of rate this calculator is built around. A floating (or variable)
          rate, by contrast, moves up and down over time because it's tied to a reference benchmark, such as
          the U.S. Federal Reserve's federal funds rate or a similar interbank lending rate used elsewhere.
          Lenders typically set their loan rates a bit above that benchmark and their savings or deposit
          rates a bit below it, with the spread between the two representing the institution's margin.
          Because floating rates change unpredictably with monetary policy and market conditions, they can't
          be projected with a fixed-rate growth formula, this calculator is designed for fixed-rate
          scenarios, which cover the vast majority of savings accounts, CDs, personal loans, and fixed-rate
          bonds people are typically trying to plan around.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lump Sum vs. Monthly and Annual Contributions</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most long-term savings and investment growth doesn't come from a single deposit sitting untouched,
          it comes from consistent contributions added on top of that deposit. This calculator handles both,
          and it treats them as genuinely separate inputs rather than folding them into one blended number,
          which matters because the timing of contributions affects the outcome. A monthly contribution of
          $200 compounds more times per year than an equivalent $2,400 annual contribution, so even though
          the total money put in is identical, the monthly version typically ends with a slightly higher
          balance. There's a related detail worth knowing: whether a contribution is assumed to land at the
          start or the end of a compounding period changes the result too, since a deposit made at the start
          of a period is exposed to that period's interest, while one made at the end isn't credited with
          interest until the following period. Seeing contribution size and frequency side by side is useful
          when deciding whether to automate smaller monthly transfers or make one larger annual deposit, for
          example, into an RRSP, IRA, or general investment account. The tool's full accumulation schedule
          (covered below) makes this difference visible year by year rather than as a single abstract final
          number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Adjusting for Taxes on Interest</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Interest income is taxable in most jurisdictions unless it's earned inside a tax-advantaged
          account, and ignoring that fact is one of the most common mistakes in DIY savings projections.
          Bonds, standard savings accounts, and certificates of deposit are common examples of interest that
          typically gets taxed, though the treatment isn't always uniform, in the United States, for
          instance, interest from federal treasury bonds is generally taxed at the federal level but exempt
          from state and local tax, while ordinary corporate bond interest is usually taxed at every level.
          The impact of ignoring this can be large. Take $5,000 growing at 6% annually for 20 years with no
          tax drag at all: it compounds to roughly $16,035. Apply a 25% marginal tax rate to the interest
          earned in every compounding period instead, and the same deposit ends up closer to $11,975, a
          difference of about $4,000 that a tax-blind projection would completely miss. This tool lets you
          enter your expected tax rate so that interest is reduced accordingly at each compounding step
          before it's added back into the balance, giving you a realistic after-tax projection instead of an
          inflated gross figure. This is particularly useful for comparing a taxable brokerage or savings
          account against a tax-sheltered one, since the after-tax gap between them often turns out to be
          larger than people expect.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Adjusting for Inflation</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A dollar amount 20 years from now doesn't buy what it buys today, and a projection that ignores
          this can create a false sense of security. Inflation is simply the sustained rise in the price of
          goods and services over time, and in the United States it has averaged somewhere around 3% a year
          over the past century, a useful long-term benchmark, even though any given year can run well above
          or below that figure. For comparison, the S&P 500 stock index has returned an average of roughly
          10% annually over that same long stretch, which is part of why equities are generally viewed as
          one of the few asset classes that can meaningfully outpace inflation over long time horizons, even
          though returns in any single year can vary enormously and losses are entirely possible. By
          entering an expected annual inflation rate, this calculator recalculates your final balance in
          terms of today's purchasing power, alongside the nominal (unadjusted) figure. Seeing both numbers
          side by side is often the more honest way to plan: a nominal balance of $150,000 in 25 years might
          sound like a strong result, but if inflation averages 3% annually over that period, its real
          purchasing power could be closer to $70,000. Including this adjustment doesn't change how much
          money you'll actually have, it changes how much that money will actually be worth, which is the
          number that matters for real financial planning.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Taxes and Inflation Together Are Harder to Outpace Than They Look</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Taxes and inflation rarely get evaluated together, but stacked on top of each other they make it
          genuinely difficult to grow the real value of money. Consider someone in a 25% marginal tax
          bracket saving during a period when inflation is running at its long-run average of around 3%. To
          simply preserve the purchasing power of their money, not grow it, just keep it from shrinking,
          their pre-tax rate of return needs to be high enough that, after 25% is taken off in tax, what
          remains still beats 3% inflation. That works out to needing a pre-tax return of roughly 4% or
          higher just to break even in real terms, which is a higher bar than it first appears once you
          consider that many standard savings accounts and CDs pay less than that. This is exactly why
          running both a tax rate and an inflation rate through the same projection, rather than looking at
          either one in isolation, gives a far more realistic picture of what a savings or investment plan
          will actually be worth by the time you need it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Full Accumulation Schedule</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond the final headline numbers, the calculator generates a complete annual or monthly
          accumulation schedule showing the starting balance, contributions, interest earned, taxes deducted
          (if applicable), and ending balance for every period of your chosen timeframe. This turns an
          abstract projection into something you can actually study. It's useful for spotting the point
          where interest earned starts to outweigh your own contributions, the stage where compounding truly
          takes over, and for checking how sensitive your outcome is to changes in rate, contribution size,
          or time horizon. Reviewing the schedule period by period, rather than trusting a single final
          number, is often what separates a realistic savings plan from a rough guess.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use This Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is built for the specific, practical moments when a rough mental estimate isn't
          good enough. It's useful when comparing two savings accounts with different advertised rates and
          compounding schedules to see which actually pays more over time. It helps when deciding between a
          lump-sum deposit now versus spreading the same money out as monthly contributions, or when trying
          to determine how much a monthly contribution needs to be to hit a specific savings target, like a
          $50,000 down payment in six years. It's also relevant when planning retirement contributions and
          wanting to see the after-tax, inflation-adjusted value rather than an optimistic gross number, or
          when a parent is projecting how a monthly contribution to a child's education fund will grow over
          15–18 years. In each of these cases, the value isn't just the final number, it's seeing how
          changing one input, like compounding frequency or contribution size, shifts the entire trajectory.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Trust</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator uses standard, transparent compound interest formulas applied period by period, so
          the results reflect exactly what you'd get from working out the math manually, just done instantly
          and without room for arithmetic error. It's completely free to use, with no signup, account
          creation, or hidden charges required to access any part of it, including the full accumulation
          schedule. All calculations run directly in your browser; the numbers you enter, your balance,
          contributions, and rate assumptions, are not stored, logged, or sent anywhere, which means your
          financial details stay private to your own session. As with any projection tool, the output is
          only as reliable as the assumptions entered: actual interest rates, tax treatment, and inflation
          will vary, so results should be treated as an informed estimate rather than a guarantee.
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
