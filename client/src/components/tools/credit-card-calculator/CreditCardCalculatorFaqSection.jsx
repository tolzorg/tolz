import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate how long it will take to pay off my credit card?",
    a: "Enter your balance, your APR, and the fixed monthly payment you plan to make. The calculator returns the number of months until you reach zero and the total interest you'll pay.",
  },
  {
    q: "How much do I need to pay each month to clear my credit card by a certain date?",
    a: "Switch to the target-timeframe mode, enter your balance, APR, and the number of months. The result is the monthly payment needed to finish on time.",
  },
  {
    q: "Is this credit card payoff calculator free?",
    a: "Yes. There's no charge and no account required, and you can run as many scenarios as you want.",
  },
  {
    q: "What interest rate should I enter?",
    a: "Use the purchase APR from your latest statement. If the balance came from a cash advance or balance transfer, use that rate instead.",
  },
  {
    q: "Why does it say my payment is too low?",
    a: "Your payment is less than or equal to the first month's interest, so the balance never goes down. Raise the payment above the monthly interest.",
  },
  {
    q: "How is credit card interest calculated?",
    a: "Most issuers divide your APR by 365 to get a daily rate, multiply it by your average daily balance, then multiply by the number of days in the billing cycle. This calculator uses a monthly rate (APR ÷ 12), which is close.",
  },
  {
    q: "Does paying only the minimum keep me in debt longer?",
    a: "Yes, usually by a lot. The minimum shrinks as your balance falls, and most of each payment goes to interest. Plug your minimum in as a fixed payment to see the full timeline.",
  },
  {
    q: "Is the result exactly what my statement will show?",
    a: "It's a close estimate. Issuers often compound daily and may add fees or change your rate, so your statement may differ slightly.",
  },
  {
    q: "Should I pay off my highest-APR card first?",
    a: "Mathematically, yes. The avalanche method saves the most interest. If small wins keep you motivated, the snowball method may work better for you. You can model both.",
  },
  {
    q: "Can I use the calculator for more than one card?",
    a: "Yes. Run each card on its own, then compare to decide where extra money should go.",
  },
  {
    q: "Is a balance transfer worth it?",
    a: "It can be, if the transfer fee (usually 3% to 5%) is smaller than the interest you'd save and you can pay off the balance before the promo ends. Use the target-date mode to find the payment you'd need.",
  },
  {
    q: "Does the calculator store my information?",
    a: "It only uses the numbers you enter and doesn't ask for card numbers or personal details.",
  },
];

const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => {
  if (item.q === "How is credit card interest calculated?") {
    return { ...item, a: item.a.replace("APR ÷ 12", "APR divided by 12") };
  }
  if (item.q === "Does paying only the minimum keep me in debt longer?") {
    return { ...item, a: item.a.replace("Plug your minimum in", "Enter your minimum") };
  }
  return item;
});

const APR_HEADERS = ["APR", "Interest in the first month"];
const APR_ROWS = [
  ["15%", "$62.50"],
  ["20%", "$83.33"],
  ["25%", "$104.17"],
  ["29.99%", "$124.96"],
];

const EXAMPLE_HEADERS = ["Monthly payment", "Time to pay off", "Total interest"];
const EXAMPLE_ROWS = [
  ["$75", "About 81 months (6 years, 9 months)", "About $3,100"],
  ["$150", "About 26 months", "About $870"],
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
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

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

export default function CreditCardCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Credit Card Calculator Does</h2>
        <p style={pStyle}>It works in two directions, depending on what you already know.</p>
        <p style={pStyle}>
          <strong>Mode 1: you know the payment.</strong> Say you can put $200 a month toward the card. Enter your
          balance, APR, and that $200, and the calculator tells you how many months it'll take to hit zero and how
          much interest you'll pay along the way.
        </p>
        <p style={pStyle}>
          <strong>Mode 2: you know the deadline.</strong> Maybe you want the card gone before a wedding, a move, or
          the end of the year. Enter your balance, APR, and the number of months, and the calculator tells you the
          monthly payment you'll need.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Either way you get the total interest, which is usually the number that surprises people. Balance, rate,
          payment, and time are all tied together, so if you change one, the others move. The calculator lets you
          see that trade-off before you commit to a plan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Credit Card Payoff Calculator</h2>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Enter your current balance.</strong> That's what you owe right now, not your credit limit. Your
            banking app usually shows the live number. Your statement shows the balance as of the closing date,
            which may be a bit out of date.
          </li>
          <li style={liStyle}>
            <strong>Enter your APR.</strong> It's on your statement, typically in the interest charge section.
            Cards often list separate rates for purchases, cash advances, and balance transfers. Use the purchase
            rate unless the debt came from one of the others.
          </li>
          <li style={liStyle}>
            <strong>Pick your mode.</strong> Type a monthly payment to get a payoff time, or type a number of months
            to get the payment you'd need.
          </li>
          <li>
            <strong>Hit calculate and read the results.</strong> Look at both the timeline and the total interest.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A couple of habits help. Try three or four payment levels, like $150, $200, $300, and compare the results
          side by side. And if you have more than one card, run each one separately. Also, don't keep charging the
          card while you test a plan. The calculator assumes the balance only goes down, so new purchases will throw
          off the results.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Actually Drives Your Payoff Time</h2>
        <p style={pStyle}>Three things control how fast a card balance goes away.</p>
        <p style={pStyle}>
          <strong>Your balance.</strong> A bigger balance means more interest every month, which leaves less of your
          payment to chip away at what you borrowed.
        </p>
        <p style={pStyle}>
          <strong>Your APR.</strong> The rate decides how much of each payment gets eaten by interest. Here's what
          one month of interest looks like on a $5,000 balance:
        </p>
        <DataTable headers={APR_HEADERS} rows={APR_ROWS} />
        <p style={pStyle}>
          <strong>Your monthly payment.</strong> This is the one lever you fully control. A bigger payment cuts the
          balance faster, and because interest is charged on whatever's left, every dollar you pay early saves you
          interest in later months too.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your payment has to be bigger than that first month's interest. If you owe $5,000 at 25% and pay $100,
          you're paying less than the roughly $104 in interest, so the balance actually grows. The calculator can't
          give you a payoff date in that case, and if it shows an error, this is almost always why.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Calculator Works</h2>
        <p style={pStyle}>
          The calculator uses standard amortization. Each month your payment covers that month's interest first, and
          whatever's left goes to the balance. Early on, interest takes a big bite. As the balance drops, the
          interest shrinks and more of each payment goes to principal. That's why payoff accelerates toward the end.
        </p>
        <p style={pStyle}>
          It turns your APR into a monthly rate by dividing by 12, so 22% becomes about 1.83% a month. Then it uses
          these two formulas:
        </p>
        <div style={formulaStyle}>Months to pay off = −ln(1 − (monthly rate × balance ÷ payment)) ÷ ln(1 + monthly rate)</div>
        <div style={formulaStyle}>Payment for a set term = (balance × monthly rate) ÷ (1 − (1 + monthly rate)^−months)</div>
        <p style={pStyle}>
          You don't need to do this by hand, but it helps to know it's a well-established formula and not a guess.
        </p>

        <h3 style={h3Style}>Worked Examples With Real Numbers</h3>
        <p style={pStyle}><strong>Example 1: $5,000 at 22% APR</strong></p>
        <p style={pStyle}>
          At a fixed $200 a month, you're looking at about 34 months. You'd pay roughly $1,750 in interest, so around
          $6,750 total.
        </p>
        <p style={pStyle}>
          Want it done in 24 months? You'd need about $259 a month, and interest drops to roughly $1,225. That's about
          $59 more per month, ten months sooner, and about $525 saved.
        </p>
        <p style={pStyle}><strong>Example 2: $3,000 at 24% APR, a slow payment vs. a faster one</strong></p>
        <DataTable headers={EXAMPLE_HEADERS} rows={EXAMPLE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Doubling the payment takes it from nearly seven years to just over two, and saves around $2,200. At a
          payment close to the interest charge, you're mostly renting the money. The more the payment exceeds the
          interest, the faster things move.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When a Credit Card Calculator Comes in Handy</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Setting a debt-free date.</strong> "34 months" is a lot easier to stick with than "someday."
          </li>
          <li style={liStyle}>
            <strong>Building a budget.</strong> The target-date mode shows exactly how much to set aside each month.
          </li>
          <li style={liStyle}>
            <strong>Seeing what minimum payments cost.</strong> Put in something near your minimum and look at the
            interest total.
          </li>
          <li style={liStyle}>
            <strong>Getting ready for a loan or lease.</strong> Mortgage, auto, and rental applications tend to go
            better with lower card balances. Work backward from your application date.
          </li>
          <li style={liStyle}>
            <strong>Testing a balance transfer.</strong> Compare your current rate against a promo rate to see
            whether the savings beat the transfer fee.
          </li>
          <li style={liStyle}>
            <strong>Figuring out what a windfall buys you.</strong> Enter the balance after a bonus or tax refund and
            see how much time it knocks off.
          </li>
          <li>
            <strong>Checking your current plan.</strong> If you've been paying the same amount for a while, this
            shows whether you're actually on track.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Credit Card Interest Is Really Calculated</h2>
        <p style={pStyle}>
          This tool uses a monthly rate because it keeps things simple and gives a solid estimate. Your issuer,
          though, almost certainly works differently.
        </p>
        <p style={pStyle}>
          <strong>Average daily balance (ADB).</strong> Most issuers use this. They divide your APR by 365 to get a
          daily periodic rate (DPR), add up your balance at the end of each day in the billing cycle, divide by the
          number of days to get the average, and multiply.
        </p>
        <div style={formulaStyle}>Interest = DPR × ADB × days in the billing cycle</div>
        <p style={pStyle}>
          Here's an example. Your APR is 24%, so your DPR is 0.24 ÷ 365 = about 0.000658. Your balance is $3,000 for
          the first 10 days of a 30-day cycle, then you pay $600, so it's $2,400 for the last 20 days.
        </p>
        <div style={formulaStyle}>
          ADB = (10 × $3,000 + 20 × $2,400) ÷ 30 = $2,600
          <br />
          Interest = 0.000658 × $2,600 × 30 = about $51.29
        </div>
        <p style={pStyle}>
          If you'd waited until the end of the cycle to make that $600 payment, the ADB would've been $3,000 and the
          interest about $59. Paying earlier in the cycle really does cost less.
        </p>
        <p style={pStyle}>
          Two other methods exist but are rare. The <strong>previous balance method</strong> charges interest on last
          cycle's ending balance and ignores what you paid since. The <strong>adjusted balance method</strong>{" "}
          subtracts payments made during the cycle first, which gives you the lowest charge of the three. Check your
          cardholder agreement if you want to know which one your issuer uses.
        </p>
        <p style={pStyle}>
          <strong>Grace periods.</strong> If you pay your full statement balance by the due date every month, most
          cards charge no interest on new purchases. Once you carry any balance, that grace period usually disappears
          and interest starts piling up from the purchase date. That's why paying a card down to $50 instead of $0
          can still result in an interest charge the next month.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Daily compounding.</strong> Most issuers also compound interest daily, meaning each day's interest
          gets added to the balance and starts earning interest. That's part of why your actual statement can come
          out a little higher than a simple monthly calculation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Minimum Payments: Why They Keep You Paying So Long</h2>
        <p style={pStyle}>
          Issuers usually set the minimum as a small percentage of your balance, often around 1%, plus that month's
          interest, or a flat floor like $25 or $35, whichever is bigger. Because the minimum shrinks as your balance
          falls, payoff stretches out for years, sometimes decades.
        </p>
        <p style={pStyle}>
          U.S. law actually makes issuers print a warning on your statement showing how long payoff will take if you
          only pay the minimum, and what you'd need to pay to clear it in three years. Most people never read it.
          This calculator lets you test the same thing yourself: pick a fixed payment equal to your current minimum
          and compare it to a higher one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Skipping the minimum is far worse. A late payment can trigger a late fee, hurt your credit, and at 60 days
          past due, many issuers will apply a penalty APR, often near 30%, and can apply it to your existing balance.
          Keep at least the minimum on autopay as a safety net, then pay extra manually.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Credit Card Interest Rates: What's Normal and What Isn't</h2>
        <p style={pStyle}>
          Credit card APRs have run above 20% on average in recent years, which is steep compared to most other debt.
          Auto loans and personal loans from good credit usually sit in the single digits to low teens, and mortgages
          are lower still. Cards cost more because they're unsecured, meaning there's no house or car for the lender
          to take if you stop paying. The lender covers that risk with a higher rate.
        </p>
        <p style={pStyle}>A few things to know about APRs:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Variable rates</strong> move with the prime rate, so your rate can change even if you do nothing.
          </li>
          <li style={liStyle}>
            <strong>Intro APRs</strong> can be 0% for a limited time, then jump to the regular rate.
          </li>
          <li style={liStyle}>
            <strong>Cash advance and penalty APRs</strong> are usually higher than the purchase APR.
          </li>
          <li>
            <strong>Your rate depends on your credit.</strong> Better scores qualify for lower APRs, and issuers will
            sometimes lower your rate if you ask, especially if you've paid on time for a while.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Costs the Calculator Doesn't Include</h2>
        <p style={pStyle}>Because the tool assumes one steady rate and no new charges, it can't account for these:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Cash advances.</strong> Pulling cash from your card usually means an upfront fee (commonly 3% to
            5%), a higher APR, and no grace period, so interest starts immediately. They also typically don't earn
            rewards, and the ATM may charge its own fee. Treat it as a last resort.
          </li>
          <li style={liStyle}>
            <strong>Late fees and penalty APRs.</strong> One missed payment can change your numbers.
          </li>
          <li style={liStyle}>
            <strong>Annual fees.</strong> Common on rewards and premium cards.
          </li>
          <li style={liStyle}>
            <strong>Over-limit fees.</strong> If you opted in to over-limit transactions, you could be charged for
            going past your credit limit.
          </li>
          <li>
            <strong>Foreign transaction fees.</strong> Often around 3% on purchases made abroad.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>If any of these hit you, update your balance and run it again.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Strategies to Pay Off Credit Card Debt Faster</h2>
        <p style={pStyle}>
          <strong>Pay more than the minimum, and automate it.</strong> Set up an automatic payment at the amount your
          calculator results say you need. It removes the monthly decision.
        </p>
        <p style={pStyle}>
          <strong>Pick an avalanche or snowball for multiple cards.</strong> With the debt avalanche, you pay
          minimums on everything and throw extra at the card with the highest APR first. That saves the most
          interest. With the debt snowball, you attack the smallest balance first. It costs a bit more in interest
          but gives you quick wins that help some people stay with it. Run each card through the calculator in both
          orders to see the difference for your balances. By the way, federal rules say any amount you pay above the
          minimum has to go to the highest-rate balance on that card.
        </p>
        <p style={pStyle}>
          <strong>Look at a balance transfer card.</strong> Many offer 0% intro APRs for somewhere around 12 to 21
          months, though they typically charge a transfer fee of 3% to 5%. On a $5,000 transfer, that's $150 to $250
          upfront. To clear it before the promo ends, you'd need to pay about $278 a month over 18 months. Use the
          calculator's target-date mode to figure out that number before you apply. Also, you generally need good
          credit (a score in the high 600s or better) to qualify, and transfers usually don't earn rewards.
        </p>
        <p style={pStyle}>
          <strong>Watch out for deferred interest on store cards.</strong> Offers like "no interest if paid in full
          in 12 months" often mean the interest is just being delayed. If there's even $1 left when the promo ends,
          you may owe all the back interest from day one. That's different from a true 0% APR.
        </p>
        <p style={pStyle}>
          <strong>Consider a personal loan.</strong> A fixed-rate loan can replace card debt at a lower rate, with a
          set end date. Compare the loan's rate and any origination fee against your card's APR.
        </p>
        <p style={pStyle}>
          <strong>Ask for a lower rate.</strong> Call and ask. If you have a decent payment history, it sometimes
          works, and it costs nothing. Then rerun the calculator with the new rate.
        </p>
        <p style={pStyle}>
          <strong>Point windfalls at the balance.</strong> Tax refunds, bonuses, and side income can be treated as a
          smaller starting balance. Recalculate to see how many months you've saved.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Get help if it's too much.</strong> If the numbers don't work no matter how you adjust them, talk to
          a nonprofit credit counselor. Agencies affiliated with the National Foundation for Credit Counseling (NFCC)
          can review your budget and may set up a debt management plan with lower rates. Be careful about for-profit
          "debt settlement" companies, and think hard before using home equity or retirement money to pay off cards.
          You'd be swapping unsecured debt for debt that puts something you own at risk.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Credit Cards and How They Affect Payoff</h2>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Cash back cards</strong> typically give 1% to 2% back on everything, or up to 5% in select
            categories.
          </li>
          <li style={liStyle}>
            <strong>Rewards and travel cards</strong> give you miles, points, or hotel credits, and often come with
            annual fees.
          </li>
          <li style={liStyle}>
            <strong>Balance transfer cards</strong> have low or 0% intro rates for moving existing debt.
          </li>
          <li style={liStyle}>
            <strong>Secured cards</strong> need a refundable deposit that acts as your limit. They're a common way to
            build or rebuild credit.
          </li>
          <li style={liStyle}>
            <strong>Store cards</strong> offer discounts at one retailer, usually come with higher APRs, and are often
            easier to qualify for.
          </li>
          <li style={liStyle}>
            <strong>Charge cards</strong> have no preset limit but require the full balance every month, so there's
            no revolving debt to calculate.
          </li>
          <li style={liStyle}>
            <strong>Prepaid cards</strong> work more like a debit card. You can only spend what you've loaded.
          </li>
          <li>
            <strong>Business cards</strong> help separate expenses and track spending for taxes.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're carrying a balance, rewards matter much less than the rate. A 2% cash back card sounds nice, but
          at a 22% APR, you'd be paying roughly ten times more in interest than you earn in rewards.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Upsides and Downsides of Credit Cards</h2>
        <p style={pStyle}>Cards aren't the problem when they're used well.</p>
        <p style={pStyle}><strong>Upsides:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Fraud protection.</strong> Under the Fair Credit Billing Act, your liability for unauthorized
            charges is capped at $50, and most issuers offer zero-liability policies.
          </li>
          <li style={liStyle}>
            <strong>Rewards.</strong> On $3,000 of monthly spending, a 2% card returns $720 a year, as long as you pay
            it off in full.
          </li>
          <li style={liStyle}>
            <strong>Purchase protections.</strong> Extended warranties, return protection, price protection, and
            travel insurance vary by card.
          </li>
          <li style={liStyle}>
            <strong>Perks.</strong> Roadside assistance, rental car coverage, lost luggage reimbursement, and early
            ticket access.
          </li>
          <li>
            <strong>Credit building.</strong> On-time payments and low balances help your score over time.
          </li>
        </ul>
        <p style={pStyle}><strong>Downsides:</strong></p>
        <ul style={ulStyle}>
          <li style={liStyle}>Interest costs can overwhelm any rewards.</li>
          <li style={liStyle}>Easy overspending. It's easier to swipe than to hand over cash.</li>
          <li>Credit damage. Missed payments and maxed-out cards can pull your score down.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Paying Down Cards and Your Credit Score</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Credit utilization, the percentage of your limit you're using, is a big part of your score. Many lenders
          prefer to see it under 30%, and lower is better. As you pay down your balance, your utilization drops and
          your score often rises. Keep old accounts open if there's no annual fee, since closing them shrinks your
          total available credit and can push utilization up. Using the calculator to plan a payoff date lets you
          time it before a big credit application.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Are the Results?</h2>
        <p style={pStyle}>It's a reliable planning estimate, but not an exact copy of your statement. A few reasons:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            Issuers calculate interest daily on your average daily balance, while this tool uses a monthly rate.
          </li>
          <li style={liStyle}>
            It assumes your APR stays constant. A variable-rate card or an expiring promo changes that.
          </li>
          <li style={liStyle}>It doesn't factor in new purchases, fees, or late payments.</li>
          <li>The accuracy of the results depends on the accuracy of what you enter.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the closest match, use your exact balance and APR from your latest statement. For big decisions, confirm
          with your issuer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and No Account Needed</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This credit card calculator is free to use, has no hidden charges, and doesn't require a signup. It only
          asks for numbers: balance, rate, payment, and timeframe. Never enter your card number, CVV, or login info
          into any online calculator, and you don't need to here.
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
