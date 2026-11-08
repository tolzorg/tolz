import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a refinance calculator work?",
    a: "It compares your current loan with a proposed new one using standard amortization math. It works out the new payment, total interest, and upfront costs, then shows how long it takes for your monthly savings to cover those costs.",
  },
  {
    q: "What is the break-even point on a refinance?",
    a: "It’s the number of months it takes for your monthly savings to pay back your closing costs. Divide total closing costs by monthly savings. Stay in the loan longer than that, and the refinance pays off.",
  },
  {
    q: "When is it worth refinancing a mortgage?",
    a: "When your break-even point is shorter than the time you plan to keep the loan, and the savings hold up after fees and APR. A drop of about 0.75 to 1 percentage point is a common rule of thumb, but the actual math matters more.",
  },
  {
    q: "How much does it cost to refinance?",
    a: "Closing costs typically run about 2% to 6% of the loan amount, depending on the lender, location, and loan type. Many lenders let you roll those costs into the new loan, though you’ll pay interest on them.",
  },
  {
    q: "Does refinancing hurt your credit score?",
    a: "A new application triggers a credit inquiry, which can cause a small, temporary dip. Opening a new account and closing the old one can also nudge your score for a while. Rate shopping within a short window is generally treated as a single inquiry.",
  },
  {
    q: "What’s the difference between the interest rate and APR?",
    a: "The rate is the cost of borrowing the principal. APR adds points and certain fees, so it’s a fuller picture of cost and a better number for comparing lenders.",
  },
  {
    q: "How is the cash-out amount calculated?",
    a: "It’s the new loan amount minus the payoff of your existing loan and your closing costs. What’s left is the cash you receive.",
  },
  {
    q: "How much equity do I need for a cash-out refinance?",
    a: "Most conventional lenders want you to keep about 20% equity after the cash-out, meaning the new loan is usually capped near 80% of your home’s value. Requirements vary by loan type and lender.",
  },
  {
    q: "Can I refinance an FHA loan to get rid of mortgage insurance?",
    a: "Often, yes. Once you have roughly 20% equity and qualify, refinancing into a conventional loan can end FHA mortgage insurance. Compare the two payments before you decide.",
  },
  {
    q: "Should I roll closing costs into my new loan?",
    a: "It saves cash now, but your balance goes up and you pay interest on those costs. Run the numbers both ways in the calculator.",
  },
  {
    q: "Will a shorter loan term save me money?",
    a: "Usually, yes. A shorter term raises your payment but cuts total interest, and shorter loans often carry lower rates too.",
  },
  {
    q: "Is it a good idea to refinance student loans?",
    a: "It depends. Refinancing federal loans into a private loan means giving up federal protections like income-driven repayment and forgiveness programs. It tends to make more sense for private loans or for borrowers with stable income and strong credit.",
  },
  {
    q: "Can I use this calculator for car or personal loans?",
    a: "Yes. Enter the balance, rate, and remaining term for the current loan, then the new rate, term, and any fees. The math works the same for any fixed-rate loan.",
  },
  {
    q: "Is this refinance calculator free?",
    a: "Yes. It’s free to use, and no payment is required to see your results.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const FEE_HEADERS = ["Fee", "What it covers", "Ballpark"];
const FEE_ROWS = [
  ["Lender / origination fee", "The lender’s charge for creating the loan", "Often 0.5% to 1% of the loan"],
  ["Discount points", "Optional upfront payment to buy a lower rate", "1% of the loan per point"],
  ["Application or processing fee", "Handling your paperwork", "Varies, a few hundred dollars"],
  ["Appraisal", "Confirms the home’s current value", "Roughly $400 to $700"],
  ["Credit report", "Pulls your credit", "Usually under $100"],
  ["Title search and insurance", "Confirms ownership and protects the lender", "Varies widely by state and loan size"],
  ["Attorney or settlement fee", "Closing handled at signing", "Varies by state"],
  ["Recording fee", "Filing documents with the local government", "Often under a few hundred dollars"],
  ["Flood certification", "Checks flood zone status", "Typically small"],
  ["Transfer taxes", "Charged by some states or cities", "Depends on location"],
  ["Prepaid interest, taxes, insurance", "Funds your escrow account and covers interest until your first payment", "Depends on timing"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const firstH3 = { ...h3Style, marginTop: 0 };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top" }}>
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

export default function RefinanceCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Refinance Calculator Does</h2>
        <p style={pStyle}>
          Refinancing means taking out a new loan to pay off an old one. The new loan usually has a different rate, a
          different term, or both. People do it with mortgages most often, but the same idea applies to car loans, student
          loans, personal loans, and even credit card balances.
        </p>
        <p style={pStyle}>
          The calculator compares two futures side by side. First, you keep your current loan exactly as it is. In the
          second, you swap it for the new loan, with its rate, term, points, and fees. Then it tells you which one leaves
          more money in your pocket, how much, and how long it takes to get there.
        </p>
        <p style={pStyle}>You’ll need these numbers:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Your current loan balance (what you owe today, not what you originally borrowed)</li>
          <li style={liStyle}>Your current interest rate and how much time is left on the loan</li>
          <li style={liStyle}>The new interest rate and new term</li>
          <li style={liStyle}>Discount points and closing costs from the lender’s estimate</li>
          <li style={lastLi}>Any cash you want to take out</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because the math behind a fixed-rate loan is the same no matter what the loan is for, you can use this as a
          mortgage refinance calculator, and also for an auto loan, a personal loan, or a student loan. Just plug in that
          loan’s balance, rate, and term.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Refinance Calculator</h2>
        <p style={pStyle}>
          Grab your latest loan statement first. If you’ve already gotten quotes, have the lender’s Loan Estimate handy too,
          since that’s where the points and fees live.
        </p>
        <ol style={listGapStyle}>
          <li style={liStyle}>Enter your current balance from the most recent statement.</li>
          <li style={liStyle}>Enter your current rate and remaining time. If you’ve got 22 years left on a 30-year mortgage, enter 22, not 30.</li>
          <li style={liStyle}>Enter the new rate and new term from the offer.</li>
          <li style={liStyle}>Add the points and closing costs. If a lender quotes “no closing costs,” ask whether that’s because they raised the rate. It usually is, so enter the higher rate.</li>
          <li style={liStyle}>Enter a cash-out amount if you want to pull equity out.</li>
          <li style={lastLi}>Read the results, then change one number at a time to see what moves.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That last step is where the tool earns its keep. Try a 30-year term, then a 20-year. Try 6.25% with no points
          against 5.875% with two points. Ten seconds of tinkering beats an hour with a spreadsheet, and it works well for
          comparing lenders, since each one packages fees differently.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Read Your Results</h2>
        <p style={pStyle}>Every output answers a different question. Here’s what each one tells you and where it can fool you.</p>

        <h3 style={h3Style}>New Monthly Payment</h3>
        <p style={pStyle}>
          This is the principal and interest on the new loan. It doesn’t include property taxes, homeowners insurance, or
          mortgage insurance. If your lender collects those in escrow, your actual bill will be higher. For a fair
          comparison, check it against the principal-and-interest portion of your current payment, not the whole amount you
          send in each month.
        </p>

        <h3 style={h3Style}>Monthly Savings</h3>
        <p style={pStyle}>
          The gap between your current payment and the new one. Easy to read, but easy to misread. A lower payment from
          stretching the loan out isn’t the same thing as a cheaper loan.
        </p>

        <h3 style={h3Style}>APR With Points and Fees</h3>
        <p style={pStyle}>
          The interest rate is the price of the money itself. The APR rolls in points and certain lender fees, so it’s closer
          to what the loan really costs you. Two lenders can quote the same rate and have very different APRs, and that’s
          usually how you catch the one with heavy fees.
        </p>
        <p style={pStyle}>
          Use APR to compare offers, but remember it assumes you’ll keep the loan for its full term. If you might sell in
          four years, upfront costs hurt you more than the APR suggests. That’s where break-even does the heavy lifting.
        </p>

        <h3 style={h3Style}>Lifetime Savings</h3>
        <p style={pStyle}>
          This compares everything you’d pay under each scenario from today until the loan is gone. It’s the best check
          against the “lower payment” trap. If refinancing stretches a loan with 18 years left into a fresh 30, you could end
          up paying much more in total interest even though your monthly bill drops. Look at this number before you get
          excited about the payment.
        </p>

        <h3 style={h3Style}>Cash-Out Take-Home Amount</h3>
        <p style={pStyle}>
          In a cash-out refinance, you borrow more than you owe and keep the difference. The take-home amount is what you
          actually receive after the old loan is paid off and closing costs come out. People often forget that last part and
          think they’ll get more than they do. If you need a specific amount for a project, work backward and request enough
          to cover the costs too.
        </p>

        <h3 style={h3Style}>Break-Even Point</h3>
        <p style={pStyle}>
          Break-even is how long it takes for your monthly savings to pay back what you spent to refinance. Divide your total
          upfront costs by your monthly savings. If it costs $5,600 and saves you $175 a month, you break even at 32 months,
          which is just under three years. Stay past that and you’re ahead. Sell or refinance again before then and you’ve
          lost money.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your new payment comes out higher than your current one, there’s no payment-based break-even to speak of, and
          that’s fine. It just means the refinance has to be justified by something else, like paying off the loan years
          sooner or getting cash out. You’d judge it on lifetime interest and your goals instead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why People Refinance (and When It’s Not Worth It)</h2>

        <h3 style={firstH3}>To Get a Lower Interest Rate</h3>
        <p style={pStyle}>
          This is the big one. If rates have fallen since you borrowed, or your credit has improved enough to qualify for a
          better pricing tier, a new loan can cut your payment or your total interest, sometimes both. Lenders reserve their
          best pricing for borrowers with very strong credit, often a score around 740 to 780 or higher, so if your score has
          climbed since you closed, it’s worth checking again.
        </p>
        <p style={pStyle}>
          As a rough guide, a drop of about three-quarters of a point to a full point is often enough to cover typical
          closing costs within two to three years. That’s a rule of thumb, not a law. On a big balance with cheap fees, half a
          point can work. On a small balance with high fees, even a full point might not.
        </p>

        <h3 style={h3Style}>To Shorten the Loan</h3>
        <p style={pStyle}>
          Going from a 30-year mortgage to a 15-year usually means a lower rate and far less interest over the life of the
          loan, but a noticeably higher payment. If your budget can handle it, it’s one of the best ways to build equity
          faster. If it can’t, a 20- or 25-year term splits the difference. Try all three in the calculator and see what the
          payment looks like.
        </p>

        <h3 style={h3Style}>To Lower the Monthly Payment</h3>
        <p style={pStyle}>
          If money’s tight, refinancing into a longer term or a lower rate can ease the monthly burden. Just go in with your
          eyes open: a longer term almost always adds interest in the long run. Sometimes that’s the right trade, for example
          if you’re avoiding missed payments. It should be a choice, not a surprise.
        </p>

        <h3 style={h3Style}>To Switch From an Adjustable to a Fixed Rate</h3>
        <p style={pStyle}>
          An adjustable-rate mortgage starts low and then resets with the market. If yours is close to adjusting and fixed
          rates aren’t much higher than what you’re paying now, locking in a fixed rate can protect you from a payment jump.
          Going the other way, from fixed to adjustable, only makes sense if you’re confident you’ll sell or refinance before
          the fixed period ends.
        </p>

        <h3 style={h3Style}>To Drop Mortgage Insurance</h3>
        <p style={pStyle}>
          Put down less than 20% on a conventional loan and you’re probably paying private mortgage insurance. It typically
          drops off automatically when you reach 78% of the home’s original value, and you can ask for it to be removed at
          80%. But if your home has gone up in value, you might get there sooner by refinancing, since the new appraisal sets
          your equity. Most lenders want at least 20% equity based on the new value.
        </p>
        <p style={pStyle}>
          FHA loans work differently. Mortgage insurance on an FHA loan taken out with less than 10% down generally stays for
          the life of the loan. With 10% or more down, it runs for 11 years. For many people, the only way out is refinancing
          into a conventional loan once they have 20% equity. Compare the two payments in the calculator, and remember to
          account for what you’re currently paying toward insurance.
        </p>

        <h3 style={h3Style}>To Pull Cash Out</h3>
        <p style={pStyle}>
          Home equity can pay for renovations, tuition, medical bills, or high-interest debt. Cash-out refinances usually cost
          more than a standard refinance, with higher rates and fees, so unless the new rate is lower than what you have now,
          they tend to be expensive.
        </p>
        <p style={pStyle}>
          Before you do it, ask yourself one question. Will what I’m buying still be worth something when I’m still paying
          off this loan? Paying off 24% credit cards or fixing a roof makes sense. Paying for a vacation with money that’s now
          attached to your house doesn’t. Your home is the collateral, and if things go sideways, it’s the thing at risk.
        </p>

        <h3 style={h3Style}>To Combine Debts</h3>
        <p style={pStyle}>
          Rolling several debts into one loan gives you a single payment and, if the rate’s lower, less interest. The risk is
          converting unsecured debt like credit cards into debt secured by your house. If you refinance and then run the cards
          back up, you’re in a worse spot than before.
        </p>

        <h3 style={h3Style}>To Change Who’s on the Loan</h3>
        <p style={pStyle}>
          After a divorce, one person often needs to be removed from the mortgage. That usually means refinancing in the
          remaining person’s name, which requires that person to qualify alone. It’s a perfectly valid reason to refinance
          even when the math doesn’t save a dime.
        </p>

        <h3 style={h3Style}>When Refinancing Is a Bad Idea</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>You’re planning to move before you hit break-even.</li>
          <li style={liStyle}>You’ve paid your loan down for a long time, so most of your payment is already going to principal, and restarting would push you back into mostly-interest payments.</li>
          <li style={liStyle}>Your loan has a prepayment penalty that eats the savings.</li>
          <li style={liStyle}>Your credit score has dropped, and you’d land a worse rate than you have now.</li>
          <li style={lastLi}>The savings only show up because you extended the term, with no plan for how to handle the extra interest.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Mortgage Refinance</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Rate-and-term refinance.</strong> You replace your existing loan with a new one for the same balance, but a better rate, a different term, or both. No cash comes out. This is the standard option when rates fall.</li>
          <li style={liStyle}><strong>Cash-out refinance.</strong> The new loan is bigger than what you owe, and you pocket the difference. Lenders generally cap conventional cash-out loans at about 80% of the home’s value, which is why you need around 20% equity to qualify. You’d convert equity into cash, and you’ll pay fees on the whole new balance, not just the cash portion.</li>
          <li style={liStyle}><strong>Cash-in refinance.</strong> The opposite. You bring money to closing to cut the balance. That can lower your payment, get you under an 80% loan-to-value threshold to avoid mortgage insurance, or help you qualify for a better rate.</li>
          <li style={liStyle}><strong>FHA streamline refinance.</strong> If you already have an FHA loan, this lets you refinance into a new FHA loan with less paperwork, and often without a new appraisal. You typically need to be current on payments and show the new loan gives you a real benefit, like a lower payment or rate. It’s a good fit when you want to stay in the FHA program.</li>
          <li style={liStyle}><strong>FHA-to-conventional refinance.</strong> The way out of FHA mortgage insurance once you’ve built enough equity. You may also face upfront costs to enter a new loan, so run the numbers.</li>
          <li style={liStyle}><strong>VA streamline (IRRRL).</strong> For veterans with an existing VA loan, the interest rate reduction refinance typically requires minimal paperwork and often no appraisal. It carries its own funding fee, so enter it into the calculator under fees.</li>
          <li style={lastLi}><strong>ARM-to-fixed refinance.</strong> Covered above. It’s about trading some current savings for payment certainty.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What It Costs to Refinance</h2>
        <p style={pStyle}>
          Closing costs on a refinance typically run about 2% to 6% of the loan amount, depending on where you live, the loan
          type, the size of the loan, and the lender. On a $300,000 loan, that’s $6,000 to $18,000. Costs are often higher in
          states with transfer taxes and attorney requirements.
        </p>
        <p style={pStyle}>Here are the fees you’re likely to see:</p>
        <DataTable headers={FEE_HEADERS} rows={FEE_ROWS} />
        <p style={pStyle}>
          Those ballparks vary a lot, so treat them as orientation, not a quote. Your Loan Estimate lists the actual figures.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two things people miss. First, prepaid items and escrow deposits aren’t true “costs” in the same way, since you’d
          pay property taxes and insurance anyway. Your old escrow account also gets refunded after payoff, which can offset
          it. Second, you can usually pay costs upfront, roll them into the new loan, or take a slightly higher rate in
          exchange for the lender covering some of them. Each option shows up differently in the calculator, so try all
          three.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Discount Points: Are They Worth It?</h2>
        <p style={pStyle}>
          One point costs 1% of your loan and usually cuts the rate by around a quarter of a percent, though that varies by
          lender and market. Points make sense when you’ll keep the loan long enough to recover the cost. Compare the extra
          upfront cost to the additional monthly savings, and find that break-even. If you’re likely to move or refinance
          again in a few years, skip them.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A tax note. Points paid on a refinance are generally deducted gradually over the life of the loan rather than all
          at once, and only if you itemize. Mortgage interest on cash-out proceeds is deductible only if the money went into
          improving the home. A tax pro can sort out your situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Refinancing Other Loans</h2>

        <h3 style={firstH3}>Car Loans</h3>
        <p style={pStyle}>
          People usually refinance a car loan for a lower rate, particularly if their credit has improved since buying, or to
          lower the payment by extending the term. Extending makes the loan cost more overall, and it raises a bigger risk:
          being upside down. Cars lose value fast, so if you owe more than the vehicle is worth, many lenders won’t refinance
          you, and a longer term keeps you underwater longer.
        </p>
        <p style={pStyle}>
          Check for a prepayment penalty on the existing loan, and add up the smaller fees: a lien transfer fee, a title fee,
          and state re-registration costs. Put them under “fees” in the calculator. Lenders also have limits on vehicle age
          and mileage, so an older car may not qualify.
        </p>

        <h3 style={h3Style}>Student Loans</h3>
        <p style={pStyle}>
          This one needs more caution than any other. Refinancing federal student loans with a private lender turns them into
          private loans. You lose access to income-driven repayment plans, deferment and forbearance protections, and
          forgiveness programs like Public Service Loan Forgiveness. Federal repayment rules have also been changing recently,
          so check the current rules at studentaid.gov before you give any of that up.
        </p>
        <p style={pStyle}>
          Refinancing federal loans might still make sense if you have a stable, high income, solid credit, no interest in
          forgiveness programs, and a rate well below what you’re paying. It tends to work less well if your income is
          irregular, your current rate is already low, or your credit is on the weaker side (many private lenders want a
          score of at least the mid-600s, often higher for the best rates).
        </p>
        <p style={pStyle}>
          Private student loans, Grad PLUS, and Parent PLUS loans, which often carry higher rates, are usually the best
          candidates for refinancing. Also, don’t mix up refinancing and consolidation. Federal consolidation combines federal
          loans into one federal loan through the Department of Education. Refinancing replaces loans with a new private one.
        </p>

        <h3 style={h3Style}>Personal Loans</h3>
        <p style={pStyle}>
          Worth considering if rates have dropped, your credit has improved, or you didn’t get a great deal the first time.
          Many personal loans carry origination fees (sometimes several percent of the amount), so enter it as a fee and see
          whether the interest savings beat it. Some lenders require you to have paid down a portion of the original loan
          before approving a new one, and they’ll look at your credit and debt-to-income ratio.
        </p>

        <h3 style={h3Style}>Credit Cards</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Credit cards are revolving credit, so they don’t fit the fixed-loan format exactly, but you can still compare. The
          easiest route is a balance transfer card with a 0% introductory rate, often for 12 to 21 months. Most charge a
          transfer fee of around 3% to 5%, which you can enter as a fee. The catch is that any balance left when the promo
          ends starts accruing at the card’s regular rate. If you can’t pay it off in time, a fixed-rate debt consolidation
          loan might be a better fit. Borrowers with good credit have the best shot at a low rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Examples</h2>

        <h3 style={firstH3}>Example 1: Same Rate Drop, Two Terms</h3>
        <p style={pStyle}>
          You owe $280,000 at 7.0% with 25 years left. Your principal-and-interest payment is about $1,979. A lender offers
          6.0% with $5,600 in closing costs paid out of pocket.
        </p>
        <p style={pStyle}>
          <strong>Option A: new 30-year loan.</strong> Your payment drops to about $1,679, saving around $300 a month. You
          break even in about 19 months, which looks great. But you’ve restarted the clock. You’d pay about $593,700 over the
          rest of your current loan, compared to roughly $604,300 on the new one. That’s about $10,600 more over the long run,
          despite the lower payment.
        </p>
        <p style={pStyle}>
          <strong>Option B: new 25-year loan.</strong> Your payment is about $1,804, saving around $175 a month. Break-even
          stretches to 32 months, but total payments fall to about $541,200, saving you roughly $52,500.
        </p>
        <p style={pStyle}>
          Same rate, same costs, completely different outcomes. The only difference is the term. If the budget relief in
          Option A is what you need, that’s a legit choice. But it’s better to know the price of it.
        </p>

        <h3 style={h3Style}>Example 2: Cash-Out</h3>
        <p style={pStyle}>
          Your home is worth $400,000, and you owe $200,000. You borrow $240,000, a 60% loan-to-value ratio. Closing costs run
          about 3% of the new loan, or $7,200. Your take-home is $240,000 minus the $200,000 payoff minus $7,200, which is
          $32,800. Notice it’s not $40,000. This is why the take-home line matters.
        </p>

        <h3 style={h3Style}>Example 3: Do the Points Pay Off?</h3>
        <p style={pStyle}>
          Say a lender offers 6.25% with no points, or 5.99% with one point on a $300,000 loan. The point costs $3,000. If it
          lowers your payment by about $50 a month, break-even on the point alone is 60 months, or five years. Plan to stay
          longer than that and it’s worth it. Think you’ll move in three years, and it’s not.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>All figures are rounded and are meant for illustration. Your numbers will differ.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Refinancing Worth It? A Quick Test</h2>
        <p style={pStyle}>Skip the rule of thumb and ask three questions:</p>
        <ol style={listGapStyle}>
          <li style={liStyle}>Is my break-even point comfortably shorter than the time I expect to keep this loan?</li>
          <li style={liStyle}>Does the new term fit what I’m actually trying to do, whether that’s a smaller payment or less interest overall?</li>
          <li style={lastLi}>After APR and every fee, do the savings still hold up?</li>
        </ol>
        <p style={pStyle}>If all three are yes, keep going. If not, you might wait, negotiate, or look at other options.</p>

        <h3 style={h3Style}>Alternatives Worth a Look</h3>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Recasting.</strong> If you have a lump sum, some lenders will recalculate your payment based on the lower balance while keeping your existing rate and term. It usually costs a small fee, and FHA and VA loans typically aren’t eligible.</li>
          <li style={liStyle}><strong>Extra payments.</strong> Adding a bit to each payment shortens the loan without closing costs. Switching to biweekly payments works out to one additional monthly payment a year, which can take several years off a 30-year loan. Confirm with your servicer that extra money goes to principal and there’s no fee.</li>
          <li style={liStyle}><strong>A home equity loan or HELOC.</strong> If you want cash but have a great rate on your first mortgage, a second loan lets you keep that rate. The trade-off is that HELOC rates are variable.</li>
          <li style={lastLi}><strong>A loan modification.</strong> If you’re struggling with payments, talk to your servicer about options before a refinance, especially if your credit has taken a hit.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Shop Around Before You Choose</h2>
        <p style={pStyle}>
          This might be the most valuable tip on the page. Mortgage pricing varies from lender to lender, even for the same
          borrower on the same day. Freddie Mac research has found that borrowers who got just one additional quote saved an
          average of around $1,500 over the life of the loan, and those who got five saved around $3,000. Get official Loan
          Estimates from at least three lenders, then plug each one into the calculator. Doing this within a couple of weeks
          matters too, because multiple mortgage inquiries in a short window are usually counted as a single inquiry on your
          credit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders can only compare apples to apples if you ask for the same loan: same term, same loan amount, same lock
          period. Otherwise, you’re comparing different products.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Ignoring the term reset.</strong> Restarting a 30-year clock means your early payments are mostly interest again. If you’re 12 years into a loan, that matters a lot.</li>
          <li style={liStyle}><strong>Choosing by rate alone.</strong> A slightly higher rate with minimal fees can beat a lower rate that comes with big points.</li>
          <li style={liStyle}><strong>Rolling in costs without noticing.</strong> Financing your closing costs means paying interest on them for decades.</li>
          <li style={liStyle}><strong>Overestimating how long you’ll stay.</strong> Plans change. If there’s a real chance you’ll move in a few years, a long break-even is risky.</li>
          <li style={liStyle}><strong>Forgetting what the number leaves out.</strong> Taxes, homeowners insurance, and mortgage insurance aren’t part of principal and interest.</li>
          <li style={lastLi}><strong>Not locking your rate.</strong> Rates move daily. Ask how long the lock lasts, what it costs, and what happens if closing is delayed.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Better Results</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Use your current balance and remaining term, not the original loan details.</li>
          <li style={liStyle}>Copy points and fees straight from the Loan Estimate. Include lender, appraisal, title, and recording fees.</li>
          <li style={liStyle}>Run at least three scenarios: same term, shorter term, longer term.</li>
          <li style={liStyle}>Keep assumptions identical across lenders: same cash-out amount, same way of handling closing costs.</li>
          <li style={liStyle}>Re-run the numbers if rates move or your credit score changes.</li>
          <li style={lastLi}>Think about how long you’ll really stay before you trust any result.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Straightforward</h2>
        <p style={pStyle}>
          The refinance calculator on Tolz is free to use, and you don’t need to create an account to see your results. The
          math follows standard amortization formulas, the same kind lenders use, so you can double-check outputs by hand or
          against an official estimate. Small differences can pop up since lenders sometimes round figures, treat fees in
          their own way, or calculate APR with slightly different conventions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is for planning and comparing. It isn’t a loan offer or financial advice, and the numbers on your
          lender’s official disclosures are the ones that count. For a big decision, it’s worth running the figures by a
          licensed mortgage professional or a financial advisor.
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
