import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is compound interest different from simple interest?",
    a: "Simple interest is calculated only on your original principal, so it adds the same amount every period. Compound interest is calculated on the principal plus the interest already earned, so the amount grows over time.",
  },
  {
    q: "What is the rule of 72?",
    a: "It's a shortcut for estimating doubling time: divide 72 by the annual rate. At 8%, that's 72 ÷ 8 = 9 years. It's most accurate between roughly 6% and 10%.",
  },
  {
    q: "Does this calculator handle variable interest rates?",
    a: "No. It's built for fixed rates that stay the same for the full term. For a variable rate, run a few scenarios at different rates to see a range.",
  },
  {
    q: "Does it matter if contributions are added at the start or end of a period?",
    a: "Yes, slightly. A deposit at the start of a period earns interest right away, while one at the end waits until the next period.",
  },
  {
    q: "Which compounding frequency gives the best return?",
    a: "More frequent compounding, like daily or monthly, gives a slightly higher effective return than annual at the same stated rate. The difference is small each year but builds over time.",
  },
  {
    q: "Should I make monthly or annual contributions?",
    a: "Monthly usually gives a marginally higher balance because the money starts earning sooner. The difference is modest, so consistency matters more.",
  },
  {
    q: "Does the calculator account for taxes?",
    a: "Yes. Enter a tax rate and the calculator reduces interest in each period, giving you an after-tax result.",
  },
  {
    q: "Why do I see two final numbers when I add inflation?",
    a: "The first is your nominal balance. The second is that same balance in today's purchasing power.",
  },
  {
    q: "Is it really free?",
    a: "Yes. No signup, no account, and no hidden charges, including for the full schedule.",
  },
  {
    q: "Is my financial data safe?",
    a: "Yes. Your numbers are used only in your browser to run the calculation and aren't stored or transmitted.",
  },
];

const NEGATIVE_RATES = [
  ["Japan", "Yes, 2016 to March 2024", "The Bank of Japan ended its negative-rate policy in 2024. Pro: it supported lending and the yen’s weakness. Con: it hurt bank earnings with limited effect on inflation."],
  ["Eurozone (Italy, France)", "Yes, 2014 to 2022", "The ECB went as low as −0.5%. Pro: it lowered borrowing costs, especially for heavily indebted countries like Italy. Con: it pressured banks and savers."],
  ["USA", "No", "Rates were cut near zero, never below."],
  ["UK", "No", "The Bank of England studied the idea but never went negative."],
  ["Canada", "No", "The Bank of Canada’s lowest rate was 0.25% in 2020, and it said negative rates weren’t a preferred tool."],
  ["Australia", "No", "The RBA has said it ruled out negative rates."],
  ["New Zealand", "No", "The central bank prepared for the possibility in 2020 but didn’t use it."],
  ["China", "No", "China has not used negative policy rates."],
  ["Russia", "No", "Russia has generally had high rates and has not used negative ones."],
  ["Singapore", "No", "Singapore manages policy through its exchange rate, not a benchmark interest rate."],
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
const formulaStyle = { ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
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
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What is interest */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Interest, and Why Does It Matter?</h2>
        <p style={pStyle}>
          Interest is the price of using someone else’s money. A bank pays you interest on your deposit because it
          lends that money to other people. A borrower pays interest because they get money now instead of waiting
          years to save it. The same idea sits behind savings accounts, CDs, mortgages, credit cards, bonds, and car
          loans.
        </p>
        <h3 style={h3Style}>Who Invented Interest on Loans?</h3>
        <p style={last}>
          No single person invented it. Lending with interest goes back to ancient Mesopotamia, around 3000 BC, where
          temples and merchants lent out grain and silver and expected more back at repayment. Interest probably
          started with grain loans, since seeds planted and harvested really did produce more grain than was lent. The
          Code of Hammurabi, written around 1750 BC, even set maximum rates: roughly 33% a year on grain and 20% on
          silver. Lending rules appear in ancient Greece and Rome too, and interest has been part of finance ever since.
        </p>
      </div>

      {/* Simple vs compound */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Simple Interest vs. Compound Interest</h2>
        <p style={pStyle}>There are two ways to calculate interest, and the difference grows the longer your money sits.</p>
        <p style={pStyle}>
          <strong>Simple interest</strong> is paid only on your original amount. Say you deposit $2,000 at 5% a year.
          You earn $100 in year one, and the same $100 every year after that:
        </p>
        <p style={formulaStyle}>interest = principal × rate × years</p>
        <p style={pStyle}>
          After three years, that’s $300 in interest and a $2,300 balance. Simple interest is common on short-term loans
          and some auto loans.
        </p>
        <p style={pStyle}>
          <strong>Compound interest</strong> is paid on your original amount plus the interest you’ve already earned.
          With the same $2,000 at 5%, compounded yearly:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Year 1: $2,000 × 5% = $100, balance $2,100</li>
          <li style={liStyle}>Year 2: $2,100 × 5% = $105, balance $2,205</li>
          <li>Year 3: $2,205 × 5% = $110.25, balance $2,315.25</li>
        </ul>
        <p style={pStyle}>
          That’s $15.25 more than simple interest after three years. It looks small, but over 25 or 30 years it becomes
          the biggest factor in how much your money grows. Savings accounts, CDs, credit cards, most bonds, and nearly
          every investment projection use compound interest.
        </p>
        <p style={last}>
          The calculator does this math period by period and adds your contributions as they happen. That’s more
          accurate than a single textbook formula, which can miss things like contributions landing on a different
          schedule than compounding, or taxes that apply only to the interest and not the whole balance.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Interest Calculator</h2>
        <p style={pStyle}>It takes less than a minute:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Initial deposit.</strong> Enter your starting amount. It can be zero if you’re building up from
            contributions alone.
          </li>
          <li style={liStyle}>
            <strong>Interest rate.</strong> Use the advertised APY for a savings account, or a long-term average return
            for an investment.
          </li>
          <li style={liStyle}>
            <strong>Compounding frequency.</strong> Choose daily, monthly, quarterly, semi-annually, or annually.
          </li>
          <li style={liStyle}>
            <strong>Contributions.</strong> Add a recurring amount and choose monthly or yearly.
          </li>
          <li style={liStyle}>
            <strong>Time period.</strong> Enter the number of years.
          </li>
          <li>
            <strong>Optional:</strong> Add a tax rate on interest and an expected inflation rate.
          </li>
        </ol>
        <p style={last}>
          The results show your ending balance, total contributions, and total interest earned. If you enter inflation,
          you’ll also see what that final balance is worth in today’s purchasing power. A full schedule shows every
          period, so you can see how the balance builds.
        </p>
      </div>

      {/* Doubling */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Fast Can Your Money Double?</h2>
        <h3 style={firstH3}>The Rule of 72</h3>
        <p style={pStyle}>
          The rule of 72 is a quick way to estimate doubling time. Divide 72 by the annual rate. At 9%, that’s 72 ÷ 9 =
          8 years. It’s most accurate for rates between about 6% and 10%, and it drifts as rates get higher.
        </p>
        <h3 style={h3Style}>How many years will it take to double your money at 2%?</h3>
        <p style={pStyle}>
          About 36 years by the rule of 72 (72 ÷ 2). The exact answer with annual compounding is about 35 years. At a
          low rate like 2%, patience is the main ingredient.
        </p>
        <h3 style={h3Style}>What interest rate will double your money in 5 years?</h3>
        <p style={pStyle}>
          By the rule of 72, about 14.4% (72 ÷ 5). The exact rate with annual compounding is about 14.9%. With simple
          interest, it would take 20% a year, since you’d need to earn 100% of your principal over five years. A steady
          14% to 15% is far above what savings accounts pay, and it usually means taking real investment risk.
        </p>
        <h3 style={h3Style}>What happens to growth if the interest rate doubles?</h3>
        <p style={pStyle}>
          Doubling the rate does more than double your growth, because the extra interest also earns interest. Here’s
          $10,000 left alone for 20 years, compounded yearly:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Rate</th><th>Ending balance</th><th>Interest earned</th></tr></thead>
            <tbody>
              <tr><td>4%</td><td>$21,911</td><td>$11,911</td></tr>
              <tr><td>8%</td><td>$46,610</td><td>$36,610</td></tr>
            </tbody>
          </table>
        </div>
        <p style={last}>
          The rate doubled, but the interest earned more than tripled. The longer the time frame, the bigger this gap
          gets.
        </p>
      </div>

      {/* Compounding frequency */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Compounding Frequency Matters</h2>
        <p style={pStyle}>
          A 6% rate doesn’t always give the same result. The more often interest compounds, the sooner interest starts
          earning its own interest, so daily compounding pays slightly more than monthly, and monthly slightly more than
          annual. In the early years the differences are tiny. They only become noticeable after a long time.
        </p>
        <p style={pStyle}>
          This is also why two accounts with the same stated rate can pay different amounts. The one that compounds more
          often has a higher effective annual rate. Try switching the compounding frequency in the calculator to compare
          savings accounts, CDs, or bonds side by side.
        </p>
        <h3 style={h3Style}>Fixed vs. Floating Interest Rates</h3>
        <p style={pStyle}>
          A fixed rate stays the same for the whole term, which makes it easy to predict. A floating (or variable) rate
          moves with a benchmark such as the federal funds rate, which the Federal Reserve sets as part of its{" "}
          <Ext href="https://www.federalreserve.gov/monetarypolicy.htm">monetary policy</Ext>. Lenders usually price
          loans a bit above the benchmark and deposits a bit below it.
        </p>
        <p style={last}>
          Because floating rates change over time, this calculator is built for fixed-rate scenarios, like most CDs,
          savings accounts with a locked rate, personal loans, and fixed-rate bonds. For a variable rate, you can run a
          few scenarios at different rates to see a range of outcomes.
        </p>
      </div>

      {/* Lump sum vs contributions */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lump Sum vs. Monthly and Annual Contributions</h2>
        <p style={pStyle}>
          Most long-term savings growth comes from steady contributions, not one deposit. The calculator treats your
          lump sum and your contributions as separate inputs, because timing matters.
        </p>
        <p style={pStyle}>
          A $200 monthly contribution compounds more often than a single $2,400 annual contribution. The total put in is
          the same, but the monthly version usually ends with a slightly higher balance because the money starts earning
          sooner. Timing within a period matters too. A deposit made at the start of a period earns interest during that
          period, while one made at the end doesn’t earn until the next one.
        </p>
        <p style={last}>
          The difference is usually modest, so consistency matters more than frequency. Still, it helps to see both
          options side by side when deciding between automatic monthly transfers and one bigger yearly deposit into an
          IRA, 401(k), or brokerage account.
        </p>
      </div>

      {/* Taxes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Taxes Affect Interest Growth</h2>
        <p style={pStyle}>
          Interest is taxable in most cases unless it’s earned inside a tax-advantaged account. The{" "}
          <Ext href="https://www.irs.gov/taxtopics/tc403">
            IRS treats interest from savings accounts, CDs, and most bonds as ordinary income
          </Ext>
          , taxed at your regular rate. Ignoring this is one of the most common mistakes in DIY projections.
        </p>
        <p style={pStyle}>
          Here’s what it looks like. $5,000 at 6% for 20 years with no taxes grows to about $16,036. With a 25% tax on
          the interest each year, your effective rate drops to 4.5%, and the same deposit grows to about $12,058. That’s
          nearly $4,000 less.
        </p>
        <h3 style={h3Style}>How do taxes affect different types of accounts?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Regular savings, CDs, and brokerage accounts:</strong> Interest is taxed each year, which slows
            compounding.
          </li>
          <li style={liStyle}>
            <strong>Traditional IRA and 401(k):</strong> Growth is tax-deferred. You don’t pay tax on interest each year,
            but withdrawals are taxed as income in retirement.
          </li>
          <li style={liStyle}>
            <strong>Roth IRA and Roth 401(k):</strong> You pay tax on contributions up front, but qualified withdrawals,
            including all the growth, are tax-free.
          </li>
          <li style={liStyle}>
            <strong>HSA:</strong> Growth is tax-free when used for qualified medical expenses.
          </li>
          <li style={liStyle}>
            <strong>Treasury bonds:</strong> Interest is taxed federally but exempt from state and local tax.
          </li>
          <li>
            <strong>Municipal bonds:</strong> Interest is often exempt from federal tax, and sometimes from state tax if
            you live in the issuing state.
          </li>
        </ul>
        <p style={last}>
          When you enter a tax rate, the calculator reduces interest in each period before it’s added back to the
          balance. That gives you a more realistic after-tax number, and a fair way to compare a taxable account with a
          tax-sheltered one.
        </p>
      </div>

      {/* Inflation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Inflation Changes the Picture</h2>
        <p style={pStyle}>
          Inflation is the steady rise in prices over time. In the U.S., it has averaged roughly 3% a year over the long
          run, though individual years can be much higher or lower. The S&amp;P 500 has returned about 10% a year on
          average over the same long period, which is one reason stocks are often used to stay ahead of inflation. Stock
          returns can swing widely from year to year, and losses are possible.
        </p>
        <p style={pStyle}>
          If you enter an inflation rate, the calculator shows your balance in today’s dollars next to the nominal
          figure. For example, $150,000 in 25 years sounds great, but at 3% inflation it has the buying power of roughly
          $71,600 today. Inflation doesn’t change how much money you’ll have. It changes what that money can buy.
        </p>
        <h3 style={h3Style}>Why taxes and inflation together are hard to beat</h3>
        <p style={last}>
          Taxes and inflation are usually looked at separately, but together they set a high bar. Say you’re in the 25%
          tax bracket and inflation is 3%. To just keep your purchasing power, you need a pre-tax return of about 4%,
          because after 25% tax, 4% leaves you with 3%. Many standard savings accounts and CDs pay less than that. Running
          both numbers in the same projection shows you what your plan is really worth.
        </p>
      </div>

      {/* Schedule */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Full Interest Schedule</h2>
        <p style={last}>
          Beyond the final totals, the calculator builds a period-by-period schedule showing your starting balance,
          contributions, interest earned, taxes (if any), and ending balance. It helps you see when your interest starts
          to outweigh your own deposits, which is when compounding really takes over. You can also check how much the
          result changes if you adjust the rate, contribution, or time frame.
        </p>
      </div>

      {/* Economy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Interest Rates Mean for the Economy and Your Investments</h2>
        <p style={pStyle}>
          The calculator takes your rate as an input, but rates themselves change with the economy. These are the
          questions people ask most.
        </p>
        <h3 style={h3Style}>How do interest rate changes affect investment?</h3>
        <p style={pStyle}>
          <strong>Why does a rate increase reduce investment?</strong> Higher rates make borrowing more expensive, so
          fewer projects clear the bar for being worth the cost. Safe options like Treasury bills and CDs also pay more,
          so risky investments need to promise more to compete. And future profits are worth less in today’s terms when
          discounted at a higher rate.
        </p>
        <p style={pStyle}>
          <strong>What happens when rates are lower?</strong> Borrowing gets cheaper, so businesses expand and
          households spend more on homes, cars, and big purchases. More spending and investment can lift GDP growth. The
          effect isn’t automatic. If people are worried about the economy, they may not borrow or spend much even when
          rates are low.
        </p>
        <h3 style={h3Style}>How do rising rates affect stocks?</h3>
        <p style={pStyle}>
          Rising rates often put pressure on stocks, but they’re not the only factor. Rates affect stocks in three ways:
          they raise borrowing costs for companies, they make bonds more attractive, and they lower the present value of
          future earnings. Growth companies, whose profits are expected far in the future, usually feel this most.
        </p>
        <p style={pStyle}>
          Earnings and the reason behind the rate hike matter just as much. If rates are rising because the economy is
          strong and profits are growing, stocks can do fine. If rates are rising to fight high inflation, stocks often
          struggle. So it isn’t only rates, and it isn’t only earnings. It’s both.
        </p>
        <h3 style={h3Style}>Why do falling rates affect the stock market?</h3>
        <p style={pStyle}>
          Lower rates cut borrowing costs, raise the value of future earnings, and make bonds less appealing, so
          investors tend to move into stocks. The exception is when rates fall because the economy is in trouble. In that
          case, weaker earnings can outweigh the benefit of cheaper money.
        </p>
        <h3 style={h3Style}>If low rates are good for stocks, why aren’t they kept low?</h3>
        <p style={pStyle}>
          Because low rates have costs. Cheap money can fuel inflation, inflate asset bubbles, and encourage too much
          borrowing. Savers and retirees living on interest earn very little. Central banks also need room to cut rates
          in a future downturn, and they can’t do that if rates are already near zero. So rates are raised when the
          economy heats up and lowered when it cools down.
        </p>
        <h3 style={h3Style}>Are low interest rates good or bad?</h3>
        <p style={pStyle}>
          It depends on who you are. Borrowers, homebuyers, and growing businesses benefit. Savers and people on fixed
          incomes lose out. For the economy, low rates help during a slowdown but can cause problems if they stay low too
          long.
        </p>
        <h3 style={h3Style}>What should I do with my investments if rates rise?</h3>
        <p style={pStyle}>There’s no single right move, but these ideas are common:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Review any variable-rate debt, since payments will rise.</li>
          <li style={liStyle}>
            Consider short-term bonds, which lose less value than long-term bonds when rates climb.
          </li>
          <li style={liStyle}>
            Look at CDs, Treasury bills, or high-yield savings accounts, which pay more as rates rise.
          </li>
          <li>Keep a diversified mix instead of making big moves based on rate predictions.</li>
        </ul>
        <p style={pStyle}>
          This is general information, not personalized advice. A financial advisor can look at your full situation.
        </p>
        <h3 style={h3Style}>What are good investments when rates start to rise?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Short-term Treasuries and CDs:</strong> They reprice quickly at higher rates.
          </li>
          <li style={liStyle}>
            <strong>Floating-rate bonds and loans:</strong> Their payments rise with rates.
          </li>
          <li style={liStyle}>
            <strong>TIPS and I bonds:</strong> Their returns adjust with inflation, which often rises along with rates.
          </li>
          <li>
            <strong>Cash and high-yield savings:</strong> They earn more as rates go up.
          </li>
        </ul>
        <h3 style={h3Style}>Which stocks tend to do better when rates are high?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Banks and some financials:</strong> They can earn more on the gap between what they pay on deposits
            and charge on loans.
          </li>
          <li style={liStyle}>
            <strong>Companies with low debt and strong cash flow:</strong> Higher borrowing costs hurt them less.
          </li>
          <li style={liStyle}>
            <strong>Businesses with pricing power:</strong> They can pass costs on to customers.
          </li>
          <li>
            <strong>Value stocks:</strong> They tend to hold up better than high-growth stocks.
          </li>
        </ul>
        <p style={pStyle}>Past patterns don’t guarantee future results, so treat these as tendencies, not rules.</p>
        <h3 style={h3Style}>How do corporate loan interest rates affect your business?</h3>
        <p style={last}>
          Corporate loan rates are usually based on a benchmark rate plus a margin that depends on your credit and the
          loan’s risk. When they rise, interest payments take a bigger bite out of cash flow, expansion plans get
          costlier, and some projects no longer make financial sense. Businesses with floating-rate debt feel it right
          away, while those with fixed-rate loans feel it when they refinance. When rates fall, borrowing gets cheaper and
          refinancing existing debt can free up cash. Either way, it helps to know how much of your debt is fixed versus
          variable and when it comes due.
        </p>
      </div>

      {/* International */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>International Interest Rates</h2>
        <h3 style={firstH3}>Why do high interest rates attract foreign investment?</h3>
        <p style={pStyle}>
          Investors look for better returns. When a country pays higher rates, foreign money flows in to buy its bonds
          and deposit accounts. That demand for the local currency can push its value up and help fund the government
          and businesses. The downside is that this money can leave just as quickly if conditions change.
        </p>
        <h3 style={h3Style}>If U.S. rates are low, why don’t people invest abroad at 7% to 8%?</h3>
        <p style={pStyle}>Some do, but a higher rate usually comes with higher costs or risks:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Currency risk:</strong> If the foreign currency falls 8%, your gain can vanish.
          </li>
          <li style={liStyle}>
            <strong>Inflation:</strong> High rates often reflect high inflation, so the real return may be small.
          </li>
          <li style={liStyle}>
            <strong>Credit and political risk:</strong> The borrower might default, or rules might change.
          </li>
          <li style={liStyle}>
            <strong>Taxes and fees:</strong> Foreign withholding tax and transfer costs can eat into returns.
          </li>
          <li>
            <strong>Capital controls:</strong> Some countries limit moving money out.
          </li>
        </ul>
        <p style={pStyle}>
          A 7% to 8% rate abroad isn’t always better than a lower rate at home once you subtract these.
        </p>
        <h3 style={h3Style}>What causes a country to have low interest rates?</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Central bank policy:</strong> The central bank sets a low policy rate to boost the economy.
          </li>
          <li style={liStyle}>
            <strong>Low inflation:</strong> When prices barely rise, lenders don’t need a high rate to protect their
            returns.
          </li>
          <li style={liStyle}>
            <strong>Weak growth:</strong> Less demand for loans keeps rates down.
          </li>
          <li style={liStyle}>
            <strong>High savings and an aging population:</strong> A lot of savings chasing few investments pushes rates
            lower.
          </li>
          <li>
            <strong>Safe-haven demand:</strong> Investors who want security accept low yields. Japan and Switzerland are
            examples.
          </li>
        </ul>
      </div>

      {/* Negative rates */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Negative Interest Rates</h2>
        <h3 style={firstH3}>What does a negative interest rate mean?</h3>
        <p style={pStyle}>
          A negative rate means a lender or depositor pays to hold money instead of earning on it. Central banks have
          used negative policy rates, charging commercial banks a fee for parking cash at the central bank, to push banks
          to lend and spend instead of hoard. The idea is to stimulate a weak economy when regular rate cuts aren’t
          enough.
        </p>
        <h3 style={h3Style}>What is the impact of negative interest rates?</h3>
        <p style={pStyle}>
          They can encourage lending and spending, weaken a currency, and support exports. But they squeeze bank profits,
          since banks hesitate to pass negative rates on to regular depositors. They also push investors toward riskier
          assets in search of returns, and they can inflate asset prices. Economists disagree about how well they
          actually work.
        </p>
        <h3 style={h3Style}>What do negative rates mean for investors?</h3>
        <p style={pStyle}>
          Savers earn little or nothing, and some large depositors pay fees. Bond prices rise, and some government bonds
          have traded with negative yields, meaning you get back less than you paid if you hold them to maturity.
          Investors tend to move toward stocks, real estate, and other assets with more risk.
        </p>
        <h3 style={h3Style}>What do negative rates mean for mortgages?</h3>
        <p style={pStyle}>
          In theory, borrowers could pay back slightly less than they borrowed. In practice, it’s rare. Denmark is the
          best-known case: in 2019, Jyske Bank offered a 10-year fixed mortgage at a negative rate, though borrowers
          still paid fees. Most banks avoid negative consumer rates, so the effect usually shows up as very cheap
          mortgages, not paid-to-borrow loans.
        </p>
        <h3 style={h3Style}>Has America ever had negative interest rates?</h3>
        <p style={pStyle}>
          Not as an official policy. The Federal Reserve’s target rate has gone as low as 0% to 0.25% but never below
          zero. However, yields on some short-term Treasury bills briefly dipped below zero during moments of panic, such
          as late 2008 and early 2020, when investors rushed for safety. Also, real rates (after inflation) have been
          negative many times, including during the 1970s, when inflation ran higher than savings rates.
        </p>
        <h3 style={h3Style}>Will negative rates come to the U.S.?</h3>
        <p style={pStyle}>
          It’s unlikely but not impossible. Federal Reserve officials have repeatedly said negative rates aren’t
          appealing, preferring other tools like asset purchases and forward guidance. Americans have also never seen
          them, and U.S. banks and money market funds would face real problems with them. A severe future crisis is the
          only scenario where it might be reconsidered.
        </p>
        <h3 style={h3Style}>Negative rates by country: pros and cons</h3>
        <p style={pStyle}>
          <strong>General pros:</strong> They can push banks to lend, lower borrowing costs, weaken the currency to help
          exporters, and fight deflation.
        </p>
        <p style={pStyle}>
          <strong>General cons:</strong> They hurt bank profits, penalize savers, can create asset bubbles, and haven’t
          clearly lifted growth or inflation.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Country/Region</th><th>Negative rates?</th><th>Notes</th></tr></thead>
            <tbody>
              {NEGATIVE_RATES.map(([country, negative, notes]) => (
                <tr key={country}><td>{country}</td><td>{negative}</td><td>{notes}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 style={h3Style}>Why do some countries have no interest?</h3>
        <p style={last}>
          Some countries and banks operate under Islamic finance, which prohibits charging interest, known as riba.
          Instead, these systems use profit-sharing, leasing, or cost-plus sales. In a profit-sharing deal, a bank and a
          borrower split the profits instead of using a fixed interest rate. Iran runs a banking system under these
          principles, and Islamic banks operate in many other countries alongside conventional ones. In practice, returns
          are still tied to market rates, even if they’re described as profit or rent rather than interest. Separately,
          some countries, like Japan for many years, have had policy rates at or near zero, but that’s a central bank
          decision, not a ban on interest.
        </p>
      </div>

      {/* When you'd use it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You’d Use This Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Comparing two savings accounts with different rates and compounding schedules.</li>
          <li style={liStyle}>Deciding between a lump-sum deposit and monthly contributions.</li>
          <li style={liStyle}>
            Figuring out what monthly amount you need to reach a goal, like a $50,000 down payment in six years.
          </li>
          <li style={liStyle}>Planning retirement savings and seeing the after-tax, inflation-adjusted result.</li>
          <li>Projecting how a monthly deposit to a child’s education fund will grow over 15 to 18 years.</li>
        </ul>
        <p style={last}>
          The real value is seeing how changing one input, like the rate or contribution, shifts everything else.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Trust</h2>
        <p style={pStyle}>
          The calculator uses standard interest formulas applied period by period, so the results match what you’d get
          doing the math by hand, only faster. It’s free to use, with no signup or hidden charges, including the full
          schedule. All calculations run in your browser. The numbers you enter aren’t stored or sent anywhere.
        </p>
        <p style={last}>
          Results are only as good as the assumptions you enter. Real interest rates, taxes, and inflation will vary, so
          treat the output as an estimate, not a guarantee.
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
