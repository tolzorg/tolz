import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate IRR?",
    a: "Enter your starting investment as a negative number and each later cash flow by year. Or use the recurring deposit option with an ending balance. The calculator solves for the rate that brings the net present value to zero.",
  },
  {
    q: "Can this IRR calculator handle irregular cash flows?",
    a: "Yes. You enter a separate amount for each year, including zero for years when nothing happened.",
  },
  {
    q: "Can I calculate IRR from a recurring deposit and an ending balance?",
    a: "Yes. Enter the fixed deposit or withdrawal, the number of years, and the final balance, and the tool returns the annual rate connecting them.",
  },
  {
    q: "Is a higher IRR always better?",
    a: "No. A high IRR on a small or short investment can produce less total profit than a lower IRR on a bigger, longer one. Look at total return and NPV too.",
  },
  {
    q: "Why is my IRR negative?",
    a: "It means you got back less than you put in, even before accounting for timing. Check that your signs are right and that you included the final value or sale proceeds.",
  },
  {
    q: "Why can’t I get an IRR for my numbers?",
    a: "IRR needs at least one outflow and one inflow. If all your numbers are positive or all negative, there’s no rate that works, so check that your initial investment is entered as money out.",
  },
  {
    q: "Can IRR have more than one answer?",
    a: "It can, when the cash flows switch between negative and positive several times. In that case, use NPV at your own discount rate to decide.",
  },
  {
    q: "What’s the difference between IRR and XIRR?",
    a: "IRR assumes evenly spaced periods, while XIRR uses the exact date of each cash flow. Use XIRR when payments land on random dates.",
  },
  {
    q: "What’s a good IRR for real estate?",
    a: "It varies by market and risk, but most investors want a rate that clearly beats safe alternatives like bonds. Riskier or more hands-on properties should clear a higher bar.",
  },
  {
    q: "Does IRR account for inflation or taxes?",
    a: "No. IRR only reflects the numbers you enter. To include taxes or fees, enter them as outflows, and compare your result to a baseline that accounts for inflation.",
  },
  { q: "Is this IRR calculator free?", a: "Yes, you can run as many calculations as you want at no cost." },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const COMPARE_HEADERS = ["Year", "Investment A", "Investment B"];
const COMPARE_ROWS = [
  ["1", "$5,000", "$0"],
  ["2", "$20,000", "$10,000"],
  ["3", "$25,000", "$30,000"],
  ["4", "$40,000", "$30,000"],
  ["5", "$60,000", "$80,000"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
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

export default function IrrCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is IRR (Internal Rate of Return)?</h2>
        <p style={pStyle}>
          IRR is the annual rate that makes an investment break even once you account for timing. Technically, it’s the
          discount rate that sets the net present value (NPV) of all your cash flows to zero. In plain English, it’s the
          yearly return your money earned, given when it went out and when it came back.
        </p>
        <p style={pStyle}>
          Timing matters because a dollar today is worth more than a dollar five years from now. You could invest it, earn
          interest on it, or just use it. So a future payment has to be “discounted” to see what it’s worth today. IRR finds
          the one discount rate where the discounted money coming in exactly matches the money you put in.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you’re hoping for a single number to compare against your goals, that’s the appeal. Say your IRR is 11% and you
          were hoping to beat 8%. You cleared the bar. If it’s 6%, you didn’t.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Does This IRR Calculator Show You?</h2>
        <p style={pStyle}>You get three numbers:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>IRR:</strong> the annualized rate your cash flows imply.</li>
          <li style={liStyle}><strong>Total return:</strong> how much your money grew over the whole period.</li>
          <li style={lastLi}><strong>Gross return:</strong> the overall gain from the cash flows you entered.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>They answer different questions, so look at all three. We’ll get into why later.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the IRR Calculator</h2>
        <p style={pStyle}>Pick the mode that fits what you’ve got.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Recurring deposit or withdrawal with an ending balance.</strong> Enter the fixed amount you add or take out each year, the number of years, and the balance at the end. This is the one for savings plans, retirement contributions, or any steady habit where you know where you ended up but not what rate you earned.</li>
          <li style={lastLi}><strong>Irregular yearly cash flows.</strong> Enter your starting investment first as money going out, then a figure for each following year. Inflows like rent, dividends, or sale proceeds are positive. Extra money you put in later is negative. If nothing happened in a given year, enter zero. Don’t skip it, because skipping a year slides every later payment one year closer and changes the answer.</li>
        </ul>
        <p style={pStyle}>
          Once you run it, read the IRR first, then check the total and gross return next to it. If you want to test “what
          if,” change one input at a time so you can see which assumption matters most.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two quick habits that save headaches. Put the sign on every number (money out is negative, money in is positive).
          And use the actual cash that moved, not revenue or projected profit before costs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The IRR Formula</h2>
        <p style={pStyle}>Here’s the equation IRR solves:</p>
        <div style={formulaStyle}>0 = CF₀ + CF₁/(1+r) + CF₂/(1+r)² + … + CFₙ/(1+r)ⁿ</div>
        <p style={pStyle}>
          CF₀ is your starting investment (negative). CF₁ through CFₙ are the cash flows in each later year. And r is the rate
          you’re after, which is the IRR.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It’s basically the NPV formula, except instead of plugging in a discount rate and getting a dollar amount, you hunt
          for the rate that makes the dollar amount zero.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate IRR Manually</h2>
        <p style={pStyle}>
          Once you’ve got more than two or three periods, there’s no neat algebra that isolates r. Everyone, including Excel,
          solves it by trial and error. You guess a rate, see if NPV comes out positive or negative, nudge the guess, and
          repeat until you land on zero.
        </p>
        <p style={pStyle}>
          Here’s a small example. You invest $10,000 and get back $3,000, $4,000, and $5,000 over the next three years.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>At 10%, the inflows are worth about $9,790 today. That’s under $10,000, so 10% is too high.</li>
          <li style={liStyle}>At 9%, they’re worth about $9,980. Closer, still a hair short.</li>
          <li style={lastLi}>At about 8.9%, they come to almost exactly $10,000.</li>
        </ul>
        <p style={pStyle}>So the IRR is roughly 8.9%.</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Doing that by hand takes a few rounds and it’s easy to slip on a decimal. The calculator does the same hunt
          instantly. It also gives you a handy gut check: an NPV calculated at any discount rate below your IRR should come out
          positive, and above it, negative. If that doesn’t hold up when you test a result, something’s off with your inputs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating IRR From Recurring Deposits and an Ending Balance</h2>
        <p style={pStyle}>
          Lots of people don’t have a clean list of cash flows. They have a routine, like putting $1,000 a year into an
          account, and a balance at the end.
        </p>
        <p style={pStyle}>
          Say you deposit $1,000 at the end of each year for ten years and finish with $13,000. You put in $10,000 and made
          $3,000, which is a 30% total return. Sounds good, but 30% over ten years says nothing about the pace. The IRR here
          comes out to about 5.7% a year (assuming year-end deposits), and that’s the figure you’d compare to a savings
          account, a bond yield, or inflation.
        </p>
        <p style={pStyle}>
          Withdrawals work in reverse. If you pull a fixed amount out each year and still have a balance left, the calculator
          finds the rate that ties those withdrawals to what remains. That’s a decent way to check whether a retirement
          drawdown is being carried by actual growth or whether you’re just spending down principal.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing to watch is timing. A deposit at the start of the year earns a full extra year of growth compared with one
          at the end. So for the same ending balance, earlier deposits mean a lower implied rate. Be consistent about how you
          enter things, since small timing differences can shift the result by a noticeable fraction of a percent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating IRR for Irregular Cash Flows</h2>
        <p style={pStyle}>
          Real investments are messy. A rental might cost $200,000, need a $15,000 repair in year two, bring in uneven rent,
          and sell at the end. A small business might lose money for two years before it turns a profit. For cases like these,
          you enter each year as its own line.
        </p>
        <p style={pStyle}>A few things that keep the result honest:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Use net cash.</strong> Enter what actually moved after expenses, not gross revenue.</li>
          <li style={liStyle}><strong>Count every outflow.</strong> Follow-on investments, renovations, and extra capital calls go in as negatives.</li>
          <li style={liStyle}><strong>Don’t forget the exit.</strong> Sale proceeds or the final value belong in the last year. Leave that out and the return will look way worse than it is.</li>
          <li style={lastLi}><strong>Include the costs that eat into returns.</strong> Fees, commissions, and taxes belong in the year you paid them. That way the IRR reflects what you kept, not what you hoped.</li>
        </ul>

        <h3 style={h3Style}>Two examples with real numbers</h3>
        <p style={pStyle}>
          <strong>A simple project.</strong> A small manufacturer buys a machine for $40,000. It brings in $10,000 at the end
          of year one, $20,000 at the end of year two, and $30,000 at the end of year three. The IRR works out to about 19.4%
          per year.
        </p>
        <p style={pStyle}>
          Is that good? It depends on the company’s cost of capital. If it borrows or raises money at around 12%, then a 19.4%
          IRR clears the bar with room to spare. If its required return is 20%, the machine falls just short.
        </p>
        <p style={pStyle}>
          <strong>Two properties that look identical on paper.</strong> Say you’re comparing two investments, each costing
          $100,000 and each paying back $150,000 over five years.
        </p>
        <DataTable headers={COMPARE_HEADERS} rows={COMPARE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both have a 50% ROI, because $50,000 profit on $100,000 is the same either way. But Investment A’s IRR is about 11.3%
          while B’s is about 10.3%. A pays out sooner, so your money gets back to work earlier. ROI can’t see that difference,
          and IRR can.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Does the IRR Actually Show, and What’s Considered Good?</h2>
        <p style={pStyle}>
          IRR shows how fast your money grows each year, taking timing into account. It doesn’t tell you how much money you
          made. That’s why it’s one number you should never read alone.
        </p>
        <p style={pStyle}>
          There’s no universal “good” number. It depends on what you could have done with the money instead. A few useful
          yardsticks:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Your hurdle rate.</strong> This is the minimum return you or your company will accept. If the IRR is above it, the project passes.</li>
          <li style={liStyle}><strong>Safer alternatives.</strong> A 6% IRR on a risky deal looks weak if a low-risk bond pays nearly the same.</li>
          <li style={liStyle}><strong>Inflation.</strong> If your IRR is below inflation, you lose buying power even though the balance went up.</li>
          <li style={lastLi}><strong>What’s normal for that asset type?</strong> More on that next.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Riskier investments should have to clear a higher bar. That’s the whole point of a hurdle rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Are These Rates of Return Normal?</h2>
        <p style={pStyle}>
          It helps to have ballpark numbers in your head, with the caveat that they swing a lot by era and by market.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Savings accounts and government bonds:</strong> typically low to mid single digits, moving with interest rates.</li>
          <li style={liStyle}><strong>Broad stock market:</strong> the U.S. market has historically returned somewhere around 10% a year before inflation and roughly 6–7% after. That’s a long-run average, not a promise for any given decade.</li>
          <li style={liStyle}><strong>Rental real estate:</strong> often mid to high single digits when you count rent and eventual appreciation, higher if you use a mortgage and it works out.</li>
          <li style={lastLi}><strong>Private equity and venture capital:</strong> targets are usually 20% or more, because the risk of losing money, or never getting it back at all, is much higher.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your calculation gives you 40% on something that sounds boring, double-check your inputs. A missing outflow or a
          skipped year is the usual culprit. And a really high IRR on a short, small deal doesn’t mean what it seems to mean,
          which brings us to the next section.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Is a Higher IRR More Appealing?</h2>
        <p style={pStyle}>
          The short answer is that a higher IRR means each dollar you invested is working harder. Money that grows faster can
          be reinvested sooner, and you carry the risk for less time.
        </p>
        <p style={pStyle}>
          It’s also what makes projects comparable. If one project returns 15% and another returns 9%, and everything else is
          equal, the 15% one wins. That’s why companies often rank projects by IRR when they have limited money to spend.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          But “higher is better” has strings attached. A 40% IRR on a $500 investment makes you $200. A 9% IRR on $500,000
          over ten years makes you far more. Size, risk, and how long you’re tied up all matter too. That’s why you should
          look at total return and NPV alongside it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IRR vs. NPV: What’s the Difference?</h2>
        <p style={pStyle}>
          NPV gives you a dollar amount: how much value a project adds today, at a discount rate you choose. IRR gives you a
          rate: the discount rate at which that value would shrink to zero.
        </p>
        <p style={pStyle}>
          They’re two views of the same math, and they usually agree about whether a project is worth doing. Where they
          differ:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>NPV is better for comparing projects of different sizes.</strong> It tells you which one adds more actual dollars.</li>
          <li style={liStyle}><strong>IRR is easier to explain.</strong> “It earns 12% a year” lands better than “NPV is $38,400 at a 9% discount rate.”</li>
          <li style={lastLi}><strong>NPV is more reliable when cash flows are weird.</strong> If your flows flip signs more than once, IRR can give confusing answers, while NPV at a chosen rate stays clear.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>If the two disagree, trust NPV for the final call.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IRR vs. ROI vs. CAGR</h2>
        <p style={pStyle}>
          <strong>ROI</strong> is total gain divided by cost. It ignores time completely. A 50% ROI after two years and a 50%
          ROI after twenty look the same, even though one is a great deal and the other isn’t.
        </p>
        <p style={pStyle}>
          <strong>CAGR</strong> is the smooth annual growth rate between a starting value and an ending value, and it only
          works when there’s one amount in at the start and one value at the end. If you put $10,000 in and it grew to
          $14,000 over four years, CAGR is about 8.8%. When you have just one deposit and one final value, IRR and CAGR give
          the same answer.
        </p>
        <p style={pStyle}>
          <strong>IRR</strong> is what you use once money moves in and out along the way. It’s basically CAGR for messy
          real-life cash flows.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>MOIC</strong> (multiple on invested capital) is another one you’ll see in private investing. It’s total
          money back divided by money in. Like ROI, it ignores timing, which is why people usually quote it next to IRR rather
          than instead of it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Internal Rate of Return of a Property</h2>
        <p style={pStyle}>
          Rental property is one of the most common reasons people look up IRR, and the setup is easy once you know what goes
          where.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Year 0:</strong> your total cash outlay as a negative. That includes the purchase price, closing costs, and any upfront repairs.</li>
          <li style={liStyle}><strong>Each year after that:</strong> your net rental income, meaning rent minus property taxes, insurance, maintenance, vacancies, and management fees. Big one-off costs like a new roof go in as extra negatives that year.</li>
          <li style={lastLi}><strong>Final year:</strong> add the sale proceeds on top of that year’s rent, after subtracting selling costs like agent fees.</li>
        </ul>
        <p style={pStyle}>
          Here’s a quick example. You pay $250,000 all in. The place nets you $15,000 a year for five years, and you sell at
          the end for $300,000 after costs, so year five’s cash flow is $315,000. The IRR comes out to about 9.3% a year.
        </p>
        <p style={pStyle}>
          A couple of notes. If you use a mortgage, there are two valid ways to do this. You can look at the whole property
          (the version above), or you can model only your own cash: the down payment as the outflow, then yearly cash after
          mortgage payments, then sale proceeds after paying off the loan. The second version often shows a higher IRR when
          things go well and a much lower one when they don’t. Neither is wrong, but don’t compare one to the other.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And be honest about the sale price. For a rental, most of the IRR depends on that last number, so it’s worth running
          it with a conservative figure too.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Compute Your Rate of Return?</h2>
        <p style={pStyle}>It depends on how much is going on with your money.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>One deposit, one ending value:</strong> use simple return for the total, or CAGR for the annual rate.</li>
          <li style={liStyle}><strong>Regular deposits or withdrawals:</strong> use IRR, since the dollars you add later have had less time to grow.</li>
          <li style={lastLi}><strong>Several uneven flows:</strong> same thing. IRR with one entry per year.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The mistake people make is taking a simple “ending balance minus what I put in, divided by what I put in” on a long
          stretch of regular deposits. That ignores that your last deposit only worked for a few months, so the real annual
          rate is usually higher than that number suggests.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should You Use IRR or Time-Weighted Return?</h2>
        <p style={pStyle}>If you’ve got a portfolio, you’ll see both.</p>
        <p style={pStyle}>
          <strong>IRR is money-weighted.</strong> It’s affected by when you added or withdrew money. If you put a big chunk in
          right before a market jump, your IRR looks great, and if you did it right before a drop, it looks bad.
        </p>
        <p style={pStyle}>
          <strong>Time-weighted return (TWR)</strong> strips out the effect of your deposits and withdrawals. It shows how the
          investments themselves performed.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So which one for a quarterly report? If you want to judge the fund manager or the strategy, TWR is fairer because
          the manager didn’t control when you added money. If you want to know what you actually earned on your money, IRR is
          the right one. Plenty of reports show both for that reason.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Do We Need the Internal Rate of Return?</h2>
        <p style={pStyle}>
          Because looking at a stack of future payments and trying to guess which deal is better doesn’t work. Once the
          amounts and dates differ, you can’t just add things up. IRR squashes it all into a single yearly rate, so two very
          different deals can finally be compared directly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It’s also useful for communicating. Almost everybody understands “8% a year,” while “it returns 1.4 times your money
          eventually” leaves people asking, “Over how long?”
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where IRR Gets Used</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Investment decisions:</strong> if the IRR beats your hurdle rate, the opportunity is worth a closer look.</li>
          <li style={liStyle}><strong>Capital budgeting:</strong> companies rank projects by IRR when they can’t afford all of them.</li>
          <li style={liStyle}><strong>Real estate:</strong> investors weigh purchase price, rent, upkeep, and resale value in a single rate.</li>
          <li style={liStyle}><strong>Private equity and venture capital:</strong> funds report IRR because money goes in through capital calls and comes out through distributions on an uneven schedule.</li>
          <li style={liStyle}><strong>Loans and leases:</strong> lenders use it to figure out the true yield on a financing deal, and borrowers can use it to see the true cost.</li>
          <li style={liStyle}><strong>Insurance and annuities:</strong> a policy with premiums and a maturity payout has a built-in return, and IRR reveals it.</li>
          <li style={liStyle}><strong>Business purchases:</strong> testing whether equipment or a new location earns its keep.</li>
          <li style={liStyle}><strong>Personal savings:</strong> finding out what your regular contributions actually earned.</li>
          <li style={lastLi}><strong>Finance classes:</strong> checking your homework.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Does IRR Work for Active Trading?</h2>
        <p style={pStyle}>
          Not really, at least not as the main tool. IRR needs a defined set of cash flows over time, and it works best on
          investments you hold for a while. Active traders usually care more about risk-reward ratio, win rate, and expectancy
          per trade.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A trader who makes only one or two trades a month at a very high reward-to-risk ratio can still look at IRR for their
          account overall, by entering deposits, withdrawals, and the ending balance. But it’ll mostly reflect how much
          capital you had in and when. For judging a strategy itself, track results trade by trade.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Baseline Rate Should You Compare Your IRR To?</h2>
        <p style={pStyle}>Pick a baseline that fits the risk you took:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Risk-free rate.</strong> Something like a government bond yield for a similar time frame. If you can’t beat this, you’re taking a risk for nothing.</li>
          <li style={liStyle}><strong>Inflation.</strong> The minimum to keep your purchasing power.</li>
          <li style={liStyle}><strong>A market benchmark.</strong> A broad stock index return is the usual stand-in for “what I could have done with this money anyway.”</li>
          <li style={lastLi}><strong>Your own hurdle rate or cost of capital.</strong> For a business, it’s what the money costs to raise. For a person, it’s the return on your next-best option.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then add a risk premium on top. The riskier the deal, the further above the safe baseline your IRR should sit. If you
          can’t beat it, simply buying an index fund starts to look like the smarter play.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Limitations of IRR</h2>
        <p style={pStyle}>IRR’s helpful, but it’s not perfect. Know these before you rely on it:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>It ignores scale.</strong> A small project with a huge IRR may make you less money than a big one with a modest rate.</li>
          <li style={liStyle}><strong>It ignores risk.</strong> IRR just takes your projected cash flows as given. A steady 9% can beat a shaky 14%.</li>
          <li style={liStyle}><strong>It assumes reinvestment at the IRR.</strong> The math quietly assumes any cash you receive along the way earns the same rate. That’s often unrealistic, especially for high IRRs.</li>
          <li style={liStyle}><strong>It can give multiple answers.</strong> When cash flows flip between negative and positive more than once, for example invest, earn, then pay a big cleanup cost at the end, there can be more than one valid IRR. Use NPV at a chosen discount rate in that case.</li>
          <li style={liStyle}><strong>It may not exist.</strong> If every cash flow is in the same direction (all money out or all money in), no rate can make NPV zero. You need at least one outflow and one inflow.</li>
          <li style={liStyle}><strong>It doesn’t adjust for inflation.</strong> Compare it to a baseline that does.</li>
          <li style={lastLi}><strong>This tool uses yearly periods.</strong> If your payments are monthly or on specific dates, add them up by year or use a dated method like XIRR for precise timing.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Simple, and Reliable</h2>
        <p style={pStyle}>
          This IRR calculator is free to use, and you don’t pay anything to run your numbers. What you type is just figures
          about your own situation, so there’s nothing to upload and no file to share.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculation solves the same standard equation used by spreadsheets and financial calculators, so you should get
          matching answers for the same inputs. Just keep in mind that the answer is only as good as what you put in. Check
          amounts, signs, and timing before you lean on a number for a real decision. It’s a tool for analysis, not personal
          financial advice.
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
