import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is an online investment calculator?",
    a: "The math itself is exact, future value calculations based on compound interest are a fixed formula, so given the same inputs, the output will always be correct. The accuracy of the real-world outcome, however, depends on how closely your assumed rate of return and contribution schedule match what actually happens, since markets don't grow at a constant rate every year.",
  },
  {
    q: "What rate of return should I use for a realistic projection?",
    a: "There's no single correct number, since it depends on the mix of investments held. A common approach is to run the calculator at a few different rates, a conservative, moderate, and optimistic estimate, to see a range of outcomes rather than a single figure that may not materialize.",
  },
  {
    q: "Can this calculator account for monthly contributions instead of a single deposit?",
    a: "Yes. You can enter a starting amount, a recurring contribution, and how frequently that contribution is made, and the calculator will compound both the initial amount and each contribution separately based on the time remaining for each.",
  },
  {
    q: "How is this different from a compound interest calculator?",
    a: "A compound interest calculator typically shows growth on a single deposit. This tool covers that case but goes further by supporting recurring contributions and by solving backward for contribution amount, rate of return, or time when you already know your target.",
  },
  {
    q: "Does the calculator account for inflation?",
    a: "Not automatically, since inflation assumptions vary and aren't part of a standard future value formula. To approximate real purchasing power, you can subtract an estimated inflation rate from your expected return before entering it.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or transmitted for storage, the calculation happens on the page, and no signup or personal information is required to use it.",
  },
  {
    q: "How do I figure out how much to invest monthly to reach a specific goal?",
    a: "Enter your target amount, current savings, expected rate of return, and time horizon, then set the calculator to solve for the required contribution instead of the future value. It will return the monthly amount needed to reach that target.",
  },
  {
    q: "What counts as \"additional contribution\" in an investment calculation?",
    a: "It refers to any money added to the investment on a recurring basis after the initial amount, sometimes called an annuity payment in financial terminology. It's optional, a lump sum left alone will still grow, but regular contributions add to the end balance because each one compounds separately for whatever time remains.",
  },
  {
    q: "Can I use this calculator for stocks, bonds, real estate, or gold, not just cash savings?",
    a: "Yes. As long as an investment can be described using a starting amount, a rate of return, and a length of time, it fits the calculator, whether that's a certificate of deposit, a bond held to maturity, a stock or fund position, a rental property, or a holding in gold or another commodity. The harder part with these assets is usually deciding on a realistic return rate, since unlike a CD's fixed rate, returns on stocks, real estate, and commodities fluctuate and are often based on historical averages or forecasts rather than a guaranteed figure.",
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

export default function InvestmentCalculatorFaqSection() {
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
          Planning where your money will be in five, ten, or thirty years shouldn't require a finance degree
          or a spreadsheet full of formulas. This investment calculator, available free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, lets you project how a lump sum or ongoing
          contributions will grow over time, or work in the opposite direction, starting from a target
          amount and solving for the contribution, rate of return, or time needed to reach it. Whether
          you're mapping out a retirement fund, a house down payment, or a child's education savings, this
          tool turns a vague goal into a concrete number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Investment Calculator Does</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          At its core, an investment calculator answers one question: given a starting amount, a
          contribution schedule, a rate of return, and a time period, what will the investment be worth in
          the future? This tool handles that calculation instantly, but it also does something most basic
          calculators don't, it works backward. If you already know how much you want to end up with, you
          can leave that field fixed and solve for whichever variable you're missing: the monthly
          contribution required, the annual return you'd need to earn, or the number of years it will take.
          This flexibility makes it useful whether you're starting a plan from scratch or checking whether
          an existing one is on track.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding the Four Variables Behind Every Investment Calculation</h2>
        <p style={pStyle}>
          Every projection this calculator produces comes down to four building blocks. Knowing what each
          one represents makes it much easier to trust the number the calculator hands back, and to know
          which field to adjust when the result doesn't match what you were hoping for.
        </p>
        <p style={pStyle}>
          <strong>Starting amount.</strong> Also called the principal, this is whatever money is already
          sitting in the investment on day one, savings you've built up for a house, an inheritance you've
          decided to invest rather than spend, or the value of gold or another asset you already hold. It's
          the base the rest of the calculation grows from.
        </p>
        <p style={pStyle}>
          <strong>Additional contribution.</strong> In financial terms this is sometimes called an annuity
          payment, and it simply refers to money added to the investment on a recurring basis after the
          starting amount. An investment doesn't need ongoing contributions to grow, a single lump sum left
          alone will still compound, but any regular contribution added on top accelerates the end result,
          since each new deposit gets its own stretch of time to compound before the end date.
        </p>
        <p style={pStyle}>
          <strong>Return rate.</strong> This is the percentage gain the investment produces, and for most
          people comparing options, it's the number that matters most. It's a simple percentage on the
          surface, but it's the figure that lets you weigh a savings account against a stock fund against a
          rental property, even though the underlying assets have nothing in common.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Investment length.</strong> This is how long the money stays invested before you need the
          end amount. Longer investment periods generally carry more uncertainty, since there's more time
          for unexpected events to affect the outcome, but they also allow more compounding periods to
          accumulate, which is typically why longer-held investments tend to produce stronger overall
          growth. Alongside these four, the calculator also lets you fix an end amount, the specific balance
          you're aiming to reach, and solve for whichever of the other variables you don't already know.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Investment Growth Is Calculated</h2>
        <p style={pStyle}>
          Investment growth is driven by compounding, the process where returns earned in one period start
          generating their own returns in the next. A starting balance grows through investment returns, and
          if contributions are added regularly, each new deposit compounds separately from that point
          forward. Over short periods the difference between compounding annually, monthly, or continuously
          is small, but over a decade or more it becomes significant, which is why this calculator accounts
          for contribution frequency rather than treating all deposits as if they were made on day one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The underlying math combines two components: growth on the initial principal and growth on the
          stream of periodic contributions. The calculator applies the rate of return you specify to both,
          compounding at the frequency selected, and sums the results to produce a future value. This
          mirrors how actual brokerage or retirement accounts grow, which is why the projections here track
          closely with real-world investment behavior rather than offering a rough estimate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Investment Calculator</h2>
        <p style={pStyle}>
          Using the calculator takes less than a minute. Enter your starting investment amount, this can be
          zero if you're beginning fresh. Add the amount you plan to contribute regularly, along with how
          often you'll contribute (monthly contributions are the most common choice for ongoing savings
          plans). Next, enter an expected annual rate of return; if you're unsure what to use, a conservative
          long-term average for a diversified portfolio is a reasonable starting point, though the exact
          figure depends on your specific investments. Finally, set the number of years you plan to invest.
          The calculator immediately returns your projected future value, along with a breakdown of how much
          came from contributions versus how much came from growth.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you'd rather solve for something other than the future value, switch the calculator's target
          field. You can fix the end goal and let the tool calculate the required contribution, the required
          rate of return, or the required time horizon instead, the same inputs, rearranged around whichever
          number you actually need.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solving Backward for Contribution, Rate, or Time</h2>
        <p style={pStyle}>
          Most investment calculators only move in one direction: inputs in, future value out. This one
          also solves in reverse, which is often the more useful calculation in practice. If you know you'll
          need a specific amount by a specific date, say, a down payment in seven years, you can enter that
          target and your current savings, and the calculator will tell you exactly how much you need to
          contribute each month to get there. If your contribution amount is fixed by your budget, you can
          instead solve for the rate of return your investments would need to earn to hit the same target,
          which is a useful gut-check on whether a goal is realistic given how much risk you're willing to
          take on. And if both your contribution and expected return are already set, you can solve for
          time, finding out how many years it will actually take rather than guessing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This backward-solving capability turns the tool from a simple projection chart into a planning
          instrument. It's the difference between "here's what happens if I invest $300 a month" and
          "here's exactly what I need to do to reach $50,000."
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use an Investment Calculator</h2>
        <p style={pStyle}>There are several common situations where running the numbers first prevents a lot of guesswork later:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Starting a retirement account.</strong> Before choosing how much to contribute to a
            401(k), IRA, or other retirement vehicle, running a projection shows whether your current
            contribution rate puts you on track for the retirement age and income you're aiming for, or
            whether you need to increase it.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Saving for a major purchase.</strong> A house down payment, a wedding, or a vehicle
            purchase all have a target amount and a rough timeline. Entering both lets you solve for the
            monthly contribution needed, which is far more actionable than an estimate.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Evaluating a lump sum decision.</strong> If you've received an inheritance, a bonus, or
            proceeds from a sale, projecting how that amount alone would grow over time, with no further
            contributions, helps you compare letting it sit invested against other uses for the money.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing contribution scenarios.</strong> Increasing a monthly contribution by even a
            small amount can produce a disproportionately larger result over a long time horizon because of
            compounding. Running the numbers side by side makes that difference visible rather than
            theoretical.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Setting a college savings target.</strong> With a rough tuition estimate and a number of
            years until enrollment, the calculator can show what monthly contribution is required, adjusted
            for whatever return assumption fits a 529 plan or similar account.
          </li>
          <li>
            <strong>Checking progress on an existing plan.</strong> If you already have savings in place,
            entering your current balance as the starting amount shows what it will grow to under your
            current contribution habits, so you can catch a shortfall early rather than at the finish line.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Investments You Can Model With This Calculator</h2>
        <p style={pStyle}>
          The four variables above apply to almost any investment that can be reduced to a starting amount,
          a rate of return, and a length of time, which covers a much wider range of assets than most people
          initially assume. Here's how some of the most common ones map onto the calculator.
        </p>
        <p style={pStyle}>
          <strong>Certificates of deposit (CDs).</strong> A CD, offered by most banks, is about as close to
          a plug-and-play example as this calculator gets. Banks in the U.S. are typically insured through
          the Federal Deposit Insurance Corporation, so a CD held within FDIC limits carries very little
          risk. It pays a fixed rate for a set term, which makes the return rate and investment length easy
          to enter with confidence, and it's common for banks to offer a better rate the longer the term you
          commit to. Savings accounts and money market accounts work similarly, though they generally pay
          less interest than a CD.
        </p>
        <p style={pStyle}>
          <strong>Bonds.</strong> Bond investing introduces risk as a real factor, and in general, taking on
          more risk is what earns a higher rate of return. Corporate debt is rated by agencies such as
          Moody's, Fitch, and Standard & Poor's, and bonds from lower-rated, riskier issuers pay more
          interest to compensate investors for the chance the issuer could default, while bonds from highly
          rated, financially stable issuers pay less because that risk is much smaller. Some bond investors
          trade actively, buying when prices dip and selling once prices recover, since bond prices tend to
          move in the opposite direction of interest rates. Others take a buy-and-hold approach, collecting
          scheduled interest payments, usually twice a year, and receiving the bond's face value back at
          maturity, largely ignoring day-to-day price swings unless they intend to sell early. One notable
          category is Treasury Inflation-Protected Securities (TIPS), issued by the U.S. government, which
          adjust with the Consumer Price Index so their value keeps pace with inflation. That inflation
          protection, combined with a government guarantee, makes TIPS popular even though their return
          tends to be modest compared with other fixed-income options.
        </p>
        <p style={pStyle}>
          <strong>Stocks.</strong> Buying stock means buying a slice of ownership in a company, and unlike
          CDs or bonds, the return isn't fixed in advance. Shareholders can benefit from dividend payments as
          long as the company chooses to pay them, and from price appreciation if the stock is sold for more
          than it cost. Rather than picking individual shares, many investors put money into mutual funds,
          which pool many stocks together under a manager who charges a fee (often referred to as a load)
          for running the fund. Exchange-traded funds (ETFs) offer a similar pooling effect but trade on an
          exchange just like an individual stock, and can be built to track almost anything, a broad index
          such as the S&P 500, a specific sector, a commodity, or a basket of bonds.
        </p>
        <p style={pStyle}>
          <strong>Real estate.</strong> Property investing commonly takes one of two forms: buying a house
          or apartment to resell quickly at a profit (often called flipping), or holding and renting it out
          for ongoing income with the option to sell later. Land itself can also be purchased and increased
          in value through improvements over time. For investors who'd rather not manage tenants or repairs
          directly, Real Estate Investment Trusts (REITs) offer a more hands-off route, these are companies
          or funds that own or finance income-producing property, letting investors buy in without owning
          physical buildings themselves. Real estate returns typically depend on values rising over time,
          driven by factors like neighborhood redevelopment, nearby infrastructure growth, or broader
          economic shifts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Commodities.</strong> This category spans precious metals like gold and silver as well as
          energy commodities like oil and natural gas. Gold's price isn't tied to industrial demand the way
          many commodities are, its value comes largely from being scarce and widely trusted as a store of
          wealth, which is why investors often buy more of it during periods of war, financial instability,
          or economic uncertainty, pushing its price higher. Silver behaves differently, since its price is
          heavily influenced by industrial use in solar panels, automotive manufacturing, and other
          practical applications. Oil is traded globally on spot markets for immediate delivery, with prices
          moving in line with the health of the global economy and ongoing demand for fuel. Natural gas and
          similar commodities are more often traded through futures exchanges, the CBOT in Chicago is the
          largest in the U.S. — where contracts for future delivery are bought and sold, and most private
          investors close out their position before the contract's actual delivery date arrives. Whichever
          asset type you're modeling, the honest challenge isn't running the calculation, it's choosing
          believable numbers to put into it. A return rate for a rental property might be based on recent
          sale prices of comparable homes nearby, or on a more speculative forecast of where the neighborhood
          is headed. A contribution figure for a small business or a piece of land might include every
          renovation cost and fee, or it might reflect only the direct purchase price, depending on what
          you're trying to measure. Because there's rarely one single "correct" way to define these inputs
          across every asset type, it's worth treating any projection, from this calculator or any other, as
          a well-informed estimate rather than a guarantee.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Factors That Affect Your Real Investment Returns</h2>
        <p style={pStyle}>
          A calculator's projection is only as accurate as the assumptions entered into it, so it's worth
          understanding what can shift the real outcome. The rate of return you choose has an outsized
          effect, a 1-2 percentage point difference compounds into a large gap over twenty or thirty years,
          so it's worth running the numbers at more than one assumed rate rather than relying on a single
          optimistic figure. Contribution consistency matters almost as much as the amount; a lower
          contribution made reliably every month often outperforms a larger one made sporadically, because
          missed periods lose their compounding time permanently.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Inflation is another factor worth accounting for separately. A future value in nominal dollars can
          look larger than it will actually feel, since prices rise over the same period. Many people find
          it useful to run the calculator twice, once with a standard return assumption, and once with a
          reduced "real return" figure that subtracts an estimated inflation rate, to get a more realistic
          sense of future purchasing power rather than just the raw number. Finally, fees and taxes on
          investment accounts reduce the effective rate of return below the market's raw performance, so a
          rate assumption that reflects your actual account type, after typical costs, will produce a more
          dependable projection than a headline market average.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This investment calculator is completely free, with no account creation, email address, or payment
          required to use it. All calculations run directly based on the numbers you enter, and none of your
          financial figures are stored, logged, or shared, you can close the page and nothing you entered
          persists anywhere. That makes it safe to test different scenarios freely, including real numbers
          from your own accounts, without creating any record tied to your identity. There are no hidden
          charges, no premium tier blocking core functionality, and no limit on how many times you can run a
          projection.
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
