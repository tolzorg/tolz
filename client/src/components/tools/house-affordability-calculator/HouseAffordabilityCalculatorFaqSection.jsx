import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much house can I afford on my salary?",
    a: "It depends on more than salary. Your debts, down payment, interest rate, and local taxes and insurance all shift the answer. As a rough guide, the 28% rule caps housing costs at about 28% of gross monthly income. On a $100,000 salary with no other debts, that works out to roughly $2,333 a month and a home price around $318,000 under typical assumptions. Real numbers will vary.",
  },
  {
    q: "What is the 28/36 rule?",
    a: "It's a guideline saying no more than 28% of your gross monthly income should go to housing costs, and no more than 36% to your total monthly debt, housing included. Lenders often approve higher ratios, but it's a dependable benchmark for staying comfortable.",
  },
  {
    q: "What's the difference between front-end and back-end DTI?",
    a: "Front-end DTI looks only at your housing costs (mortgage payment, taxes, insurance, HOA dues) compared to gross income. Back-end DTI adds every other monthly debt, like car loans, student loans, and credit card minimums.",
  },
  {
    q: "What DTI do I need to get a mortgage?",
    a: "It depends on the loan. The 28/36 rule is the traditional Conventional benchmark, FHA commonly uses 31/43, and VA looks at about 41% back-end. Many lenders approve higher ratios when you have strong credit, savings, or other compensating factors, but lower is safer and gives you more options.",
  },
  {
    q: "How much should I put down on a house?",
    a: "Conventional loans can go as low as 3% down, FHA loans 3.5% (with a 580+ credit score), and VA loans often require nothing. Putting 20% down on a Conventional loan avoids PMI, but a smaller down payment can still be the right call if it gets you into a home without leaving you with no savings.",
  },
  {
    q: "Does the calculator include property taxes, insurance, and HOA dues?",
    a: "Yes. Those are part of your monthly housing cost, so they reduce the loan amount your budget can support. Using accurate local numbers will make your result more realistic.",
  },
  {
    q: "Why do FHA, VA, and Conventional results come out different?",
    a: "Each program has its own DTI limits, mortgage insurance rules, and fees. FHA adds both an upfront and an annual mortgage insurance premium. VA charges a one-time funding fee but has no monthly mortgage insurance. Conventional pricing depends a lot on your credit score and down payment.",
  },
  {
    q: "Is the result the same as a pre-approval?",
    a: "No. The calculator gives you an estimate from the numbers you enter. Pre-approval is a lender's formal review of your credit, income, and assets, and it results in a letter you can show sellers.",
  },
  {
    q: "Should I borrow the maximum I qualify for?",
    a: "Usually not. Approval shows what a lender is willing to lend, not what fits your life. Childcare, commuting, retirement savings, and home maintenance aren't part of DTI formulas, so lots of buyers choose a price below their maximum.",
  },
  {
    q: "How does my credit score affect how much house I can afford?",
    a: "A higher score generally means a lower interest rate and lower mortgage insurance costs. That lowers your monthly payment and raises the price you can afford. It also opens up more loan options.",
  },
  {
    q: "What debts count toward DTI?",
    a: "Recurring obligations that show up on your credit report or are court-ordered: car loans, student loans, credit card minimum payments, personal loans, child support, and alimony. Groceries, utilities, phone, and subscriptions don't count.",
  },
  {
    q: "Can I use a fixed monthly budget instead of my income?",
    a: "Yes. Enter the monthly payment you want to stay within, and the tool estimates the home price it supports. It's a good reality check against the lender-based maximum.",
  },
  {
    q: "What if I'm self-employed?",
    a: "Lenders typically average your net income over the past two years using your tax returns, so your qualifying income may be lower than your gross business revenue. Enter the net figure to get a more realistic result.",
  },
  {
    q: "Can I afford a house with student loan debt?",
    a: "Often yes, but the payment counts toward your back-end DTI. Lenders may calculate a payment from your balance even if your loans are deferred, so a high student loan balance can shrink your price range.",
  },
];

// Structured data uses the supplied schema wording, which shortens most answers.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How much house can I afford on my salary?",
    a: "It depends on your debts, down payment, interest rate, and local taxes and insurance. As a rough guide, the 28% rule caps housing costs at about 28% of gross monthly income. On a $100,000 salary with no other debts, that works out to roughly $2,333 a month and a home price around $318,000 under typical assumptions.",
  },
  {
    q: "What is the 28/36 rule?",
    a: "No more than 28% of your gross monthly income should go to housing costs and no more than 36% to total monthly debt, housing included. Lenders often approve higher ratios, but it is a dependable benchmark.",
  },
  {
    q: "What's the difference between front-end and back-end DTI?",
    a: "Front-end DTI compares your housing costs to gross income. Back-end DTI adds every other monthly debt, such as car loans, student loans, and credit card minimums.",
  },
  {
    q: "What DTI do I need to get a mortgage?",
    a: "The 28/36 rule is the traditional Conventional benchmark, FHA commonly uses 31/43, and VA looks at about 41% back-end. Many lenders approve higher ratios with strong credit, savings, or other compensating factors.",
  },
  {
    q: "How much should I put down on a house?",
    a: "Conventional loans can go as low as 3% down, FHA loans 3.5% with a 580+ credit score, and VA loans often require none. Putting 20% down on a Conventional loan avoids PMI.",
  },
  {
    q: "Does the calculator include property taxes, insurance, and HOA dues?",
    a: "Yes. Property taxes, homeowners insurance, and HOA dues count toward your monthly housing cost and reduce the loan amount your budget can support.",
  },
  {
    q: "Why do FHA, VA, and Conventional results come out different?",
    a: "Each program has its own DTI limits, mortgage insurance rules, and fees. FHA adds upfront and annual mortgage insurance, VA charges a one-time funding fee with no monthly insurance, and Conventional pricing depends on credit score and down payment.",
  },
  {
    q: "Is the result the same as a pre-approval?",
    a: "No. The calculator gives an estimate from the numbers you enter. Pre-approval is a lender's formal review of your credit, income, and assets.",
  },
  {
    q: "Should I borrow the maximum I qualify for?",
    a: "Usually not. Approval shows what a lender is willing to lend, not what fits your life. Childcare, commuting, savings goals, and maintenance are not part of DTI formulas.",
  },
  {
    q: "How does my credit score affect how much house I can afford?",
    a: "A higher score generally means a lower interest rate and lower mortgage insurance costs, which lowers your monthly payment and raises the price you can afford.",
  },
  {
    q: "What debts count toward DTI?",
    a: "Recurring obligations such as car loans, student loans, credit card minimum payments, personal loans, child support, and alimony. Groceries, utilities, and subscriptions do not count.",
  },
  {
    q: "Can I use a fixed monthly budget instead of my income?",
    a: "Yes. Enter the monthly payment you want to stay within, and the tool estimates the home price it supports.",
  },
  {
    q: "What if I'm self-employed?",
    a: "Lenders typically average your net income over the past two years using your tax returns, so your qualifying income may be lower than your gross business revenue.",
  },
  {
    q: "Can I afford a house with student loan debt?",
    a: "Often yes, but the payment counts toward your back-end DTI. Lenders may calculate a payment from your balance even if your loans are deferred.",
  },
];

const LOAN_HEADERS = ["", "Conventional", "FHA", "VA"];
const LOAN_ROWS = [
  ["Typical DTI benchmark", "28/36 (higher possible)", "31/43 (higher possible)", "41% back-end"],
  ["Minimum down payment", "As low as 3%", "3.5% (580+ score)", "Often 0%"],
  ["Mortgage insurance", "PMI if under 20% down", "Upfront and annual MIP", "None monthly; one-time funding fee"],
  ["Typical minimum credit score", "Around 620", "580 (500 with 10% down)", "No official minimum; lenders often want 580–620"],
  ["Who it's for", "Buyers with solid credit", "Smaller down payments, lower scores", "Eligible veterans, service members, some spouses"],
];

const RATE_HEADERS = ["Rate", "Loan amount that fits"];
const RATE_ROWS = [
  ["5.5%", "about $352,000"],
  ["6.5%", "about $316,000"],
  ["7.5%", "about $286,000"],
];

const INCOME_HEADERS = ["Household income (gross, yearly)", "Max monthly housing payment (28%)", "Rough home price"];
const INCOME_ROWS = [
  ["$60,000", "$1,400", "about $191,000"],
  ["$75,000", "$1,750", "about $239,000"],
  ["$100,000", "$2,333", "about $318,000"],
  ["$120,000", "$2,800", "about $382,000"],
  ["$150,000", "$3,500", "about $477,000"],
  ["$200,000", "$4,667", "about $637,000"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
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

function DataTable({ headers, rows, wrap = false }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: wrap ? "normal" : "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: wrap ? "normal" : "nowrap", verticalAlign: "top", minWidth: wrap ? 130 : undefined }}>
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

export default function HouseAffordabilityCalculatorFaqSection() {
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
        <h2 style={h2Style}>What a House Affordability Calculator Actually Does</h2>
        <p style={pStyle}>
          A regular mortgage calculator starts with a home price and spits out a payment. An affordability calculator
          works the other way. It starts with your money, figures out the biggest monthly housing payment you can carry,
          and then converts that into a loan amount and a purchase price.
        </p>
        <p style={pStyle}>
          That's why it's a better first step than scrolling Zillow. A price you fell in love with has nothing to do with
          your debts or a lender's limits. A price built from your own numbers does.
        </p>
        <p style={pStyle}>
          The tool offers two ways to get there. One is the <strong>income-and-debt method</strong>, which mirrors how
          lenders think. You enter what you earn and owe, pick a loan type, and the calculator applies that program's
          debt-to-income limits. The other is the <strong>fixed monthly budget method</strong>, where you decide what you
          want to pay each month and the calculator works out the price that payment supports. Both are useful, and they
          often give you different answers. We'll get to why that matters.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool is built around U.S. mortgage rules, so it's most useful if you're buying a home in the United States.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When People Use It (And What They're Usually Trying to Figure Out)</h2>
        <p style={pStyle}>
          You don't need to be in the middle of a home search. Here are the moments when running the numbers pays off.
        </p>
        <p style={pStyle}>
          <strong>You're thinking about buying but haven't talked to a lender.</strong> This is the most common one. You
          want a ballpark before you spend a weekend at open houses for homes you'd never get approved for.
        </p>
        <p style={pStyle}>
          <strong>Your income or debts just changed.</strong> A raise, a new job, a spouse joining the loan, a paid-off
          car, or a new student loan payment all move the number. It's worth rerunning.
        </p>
        <p style={pStyle}>
          <strong>You're choosing between loan types.</strong> If you've got a middling credit score and a small down
          payment, FHA might beat Conventional. If you served in the military, VA could beat both. Switching the
          guideline in the calculator shows you how each one treats your situation.
        </p>
        <p style={pStyle}>
          <strong>Rates moved.</strong> A one-point change in the rate can shift your buying power by tens of thousands
          of dollars. Plugging in a few different rates tells you whether waiting is worth it or whether you're just
          guessing.
        </p>
        <p style={pStyle}>
          <strong>You're moving to a different city.</strong> Property taxes and insurance swing wildly between states,
          sometimes between neighboring counties. If you're relocating, the price you could afford in your current town
          may not translate.
        </p>
        <p style={pStyle}>
          <strong>You're setting a hard ceiling before a bidding war.</strong> When you're competing against other
          offers, it's easy to talk yourself into "just a little more." Knowing your real limit ahead of time makes it
          easier to walk away.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>You're deciding whether to rent a while longer.</strong> Sometimes the honest answer from the
          calculator is "not yet," and that's useful too. More on that near the end.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What You'll Enter, and Why Each Number Matters</h2>
        <p style={pStyle}>Garbage in, garbage out applies here. Honest numbers beat optimistic ones.</p>
        <p style={pStyle}>
          <strong>Annual household income.</strong> Lenders use gross income, meaning before taxes and paycheck
          deductions. If you're buying with a partner, combine both incomes. You can usually find your number on a W-2.
          Count salary, regular overtime, and bonuses or commissions you've been earning consistently. Lenders typically
          want a two-year history on variable income, so one huge year won't carry your whole application. If you're
          self-employed, lenders generally average your net income over two years of tax returns, which is often lower
          than people expect after business deductions.
        </p>
        <p style={pStyle}>
          <strong>Monthly debts.</strong> Add up the minimum payments on car loans, student loans, credit cards, personal
          loans, and any court-ordered payments like child support or alimony. If you've got a $250 car payment and a $50
          minimum card payment, your debt number is $300. Don't include groceries, utilities, phone bills, streaming, or
          insurance. Lenders ignore those, even though they obviously hit your real budget.
        </p>
        <p style={pStyle}>
          One thing that trips people up: student loans in deferment or income-driven repayment. Lenders usually still
          count a payment, often a set percentage of the balance, even if you're currently paying little or nothing.
          Check with a lender if that applies to you.
        </p>
        <p style={pStyle}>
          <strong>Down payment.</strong> A bigger down payment shrinks the loan, lowers the payment, and can get rid of
          mortgage insurance. Conventional loans can go as low as 3% down for qualifying buyers. FHA allows 3.5% with a
          credit score of 580 or higher (10% if your score is between 500 and 579). VA loans often need nothing down.
          Putting down 20% on a Conventional loan avoids private mortgage insurance, but plenty of buyers put down less
          and that's fine if it gets them in the door without draining their savings.
        </p>
        <p style={pStyle}>
          <strong>Interest rate.</strong> Use a realistic current rate for your credit profile, then test a few higher
          and lower ones. Your actual rate depends on credit score, down payment, loan type, and how many points you pay.
        </p>
        <p style={pStyle}>
          <strong>Loan term.</strong> Thirty years is the standard. A 15-year loan has a lower rate and saves a ton of
          interest, but the monthly payment is much higher, so it'll lower the price you can afford.
        </p>
        <p style={pStyle}>
          <strong>Property tax, homeowners insurance, and HOA dues.</strong> These belong in your monthly housing cost,
          and people underestimate them all the time. A common rough rule for insurance is about $35 a month per $100,000
          of home value, but that swings a lot by region and coverage. Use local numbers whenever you can.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Private mortgage insurance (PMI).</strong> On a Conventional loan with less than 20% down, lenders
          usually require PMI. It commonly runs somewhere between 0.3% and 1.5% of the loan per year, depending on your
          credit score and down payment. It's part of your monthly payment and it reduces what you can afford.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Debt-to-Income Ratio: The Math Behind Every Result</h2>
        <p style={pStyle}>
          Debt-to-income ratio, or DTI, is the number lenders care about most. It's the share of your gross monthly
          income that goes to debt payments. Lenders look at it two ways.
        </p>
        <p style={pStyle}>
          <strong>Front-end ratio</strong> (sometimes called the housing ratio or mortgage-to-income ratio):
        </p>
        <div style={formulaStyle}>Monthly housing costs ÷ gross monthly income × 100</div>
        <p style={pStyle}>
          Housing costs here means principal, interest, property taxes, homeowners insurance, mortgage insurance, and HOA
          or co-op fees.
        </p>
        <p style={pStyle}>
          <strong>Back-end ratio</strong> (the one most people mean when they say "DTI"):
        </p>
        <div style={formulaStyle}>(Monthly housing costs + all other recurring monthly debt) ÷ gross monthly income × 100</div>
        <p style={pStyle}>
          So if you earn $7,500 a month, pay $2,000 in housing costs, and have $600 in other debts, your front-end ratio
          is about 26.7% and your back-end ratio is about 34.7%.
        </p>
        <p style={pStyle}>
          Here's the part most explanations skip. You're usually boxed in by one ratio, not both. If you have almost no
          other debt, the front-end limit holds you back. If you've got a big car payment and student loans, the back-end
          limit kicks in first. That's why paying off a $400 monthly car loan can raise your buying power more than saving
          another few thousand dollars toward the down payment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Generally, lenders like a DTI under 36%, though many approve higher, depending on the loan type, your credit,
          and your savings. Low DTI means you've got breathing room. High DTI means more of your income is spoken for
          before you've bought a single bag of groceries.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The 28/36 Rule, and Other Rules of Thumb</h2>
        <p style={pStyle}>
          The 28/36 rule is the classic benchmark. It says no more than 28% of your gross monthly income should go to
          housing, and no more than 36% to your total debt, housing included. It's been used for decades as a standard
          for Conventional loans, and it's a solid conservative starting point.
        </p>
        <p style={pStyle}>
          It's not a hard law, though. Lenders stretch it, especially when credit is strong, savings are healthy, or the
          market is hot. Approval at 45% DTI doesn't mean 45% is a comfortable place to live. It just means the lender is
          willing.
        </p>
        <p style={pStyle}>You'll run into a few other shortcuts:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>The 30% rule.</strong> Some calculators, including Zillow's, use roughly 30% of gross monthly income
            for housing costs (mortgage, taxes, and insurance). It's a bit looser than 28%.
          </li>
          <li style={liStyle}>
            <strong>The income multiple.</strong> You've probably heard "buy a house worth 2.5 to 3 times your income."
            It's easy to remember, but it ignores your debts, down payment, and the interest rate, so it can be way off.
            At a 3% rate it's too cautious. At 7% it can be too generous.
          </li>
          <li style={liStyle}>
            <strong>The take-home pay check.</strong> Some budgeters prefer to keep housing near 25% of take-home pay.
            That's often tighter than 28% of gross, and for many families it's the number that actually feels
            comfortable.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          None of these is "right." They just answer slightly different questions, which is why we suggest using the
          calculator to compare them against your own situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Conventional, FHA, and VA: How the Rules Differ</h2>
        <p style={pStyle}>
          Each loan program has its own limits, so the same buyer can qualify for different amounts depending on which
          one they pick. Here's a quick comparison, then the details.
        </p>
        <DataTable headers={LOAN_HEADERS} rows={LOAN_ROWS} wrap />
        <p style={pStyle}>
          <strong>Conventional loans.</strong> These aren't insured by the federal government. Most follow the guidelines
          set by Fannie Mae and Freddie Mac, which are the two big government-sponsored companies that buy mortgages from
          lenders. Loans that meet their rules and size limits are called conforming loans. Loans that don't (usually
          because they're too large) are non-conforming, or jumbo, loans, and those often have stricter requirements.
          With a Conventional loan, the 28/36 rule is the standard reference point, and strong borrowers can sometimes be
          approved at higher ratios. If you put down less than 20%, expect PMI, which drops off once you build enough
          equity.
        </p>
        <p style={pStyle}>
          <strong>FHA loans.</strong> These are insured by the Federal Housing Administration. Because the government
          backs them, lenders can be more flexible about credit scores, down payments, and DTI. The usual benchmark is
          31% front-end and 43% back-end, which gives you 3 more points of housing debt and 7 more points of total debt
          than the 28/36 rule. Approvals can go even higher with compensating factors like big savings or strong income.
          The tradeoff is mortgage insurance. You'll pay an upfront premium of 1.75% of the loan (most people roll it
          into the loan) plus an annual premium, billed monthly, which for most borrowers runs around 0.5% to 0.55% of
          the loan balance. That extra cost eats into your price range, so an FHA loan doesn't always let you buy more
          than Conventional would. It depends on your credit score and down payment.
        </p>
        <p style={pStyle}>
          <strong>VA loans.</strong> These are guaranteed by the U.S. Department of Veterans Affairs and available to
          eligible veterans, active-duty service members, National Guard members, reservists, and some surviving
          spouses. There's usually no down payment and no monthly mortgage insurance. Instead, there's a one-time funding
          fee, which varies depending on your service, how much you put down, and whether it's your first VA loan. It's
          about 2.15% for first-time use with no money down, and veterans with a service-connected disability are
          typically exempt. Lenders generally look at a 41% back-end DTI, and they don't focus on the front-end ratio.
          They also run a residual income test, which checks that you've got enough left each month after major expenses
          for your household size and region. That's why VA borrowers sometimes qualify for more than the 41% number
          alone would suggest.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Guidelines get updated, and individual lenders add their own rules on top (those are called overlays). Treat
          the calculator's result as a strong estimate, then confirm with a lender.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Income-Based vs. Fixed Budget: Which Number Should You Trust?</h2>
        <p style={pStyle}>
          The income-and-debt method tells you what a lender might approve. The fixed monthly budget method tells you
          what you're willing to pay. Those two numbers are rarely the same, and the gap between them says a lot.
        </p>
        <p style={pStyle}>
          A lender's formula doesn't know you've got two kids in daycare, a long commute, or a job with irregular pay. It
          doesn't know you want to keep putting money into a retirement account. It just divides numbers. So lots of
          people get approved for more than they'd feel good spending.
        </p>
        <p style={pStyle}>
          If you're not sure how conservative to be, here's one way to think about DTI as a dial:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Around 20% to 28% total DTI:</strong> Comfortable. You'll have room to save, handle surprises, and
            still enjoy your life.
          </li>
          <li style={liStyle}>
            <strong>Around 36%:</strong> The traditional "fine, but not loose" zone.
          </li>
          <li style={liStyle}>
            <strong>Around 43% to 45%:</strong> Approvable for many buyers, but there's not much slack. One expense you
            didn't plan for can sting.
          </li>
          <li style={liStyle}>
            <strong>50% and above:</strong> Most lenders get very nervous here, and it's tough to live with even if
            someone approves it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A smart move is to run both methods. If the lender-based price is way above your budget-based price, the lower
          number is usually the safer target.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example (With What Happens When Things Change)</h2>
        <p style={pStyle}>
          Say a household earns $90,000 a year, which is $7,500 a month. They've got $500 a month in debt (a car loan and
          a student loan), $20,000 saved for a down payment, and they're looking at a 30-year loan at 6.5%. They estimate
          $450 a month for property tax, insurance, and HOA dues combined.
        </p>
        <p style={pStyle}>
          <strong>Step 1: Find the limits.</strong> Using the 28/36 rule, the front-end cap is 28% of $7,500, which is
          $2,100. The back-end cap is 36% of $7,500, which is $2,700, minus $500 in debt, leaving $2,200. The lower number
          wins, so total housing costs top out at $2,100.
        </p>
        <p style={pStyle}>
          <strong>Step 2: Subtract the non-loan costs.</strong> Take out the $450 for taxes, insurance, and dues. That
          leaves $1,650 for principal and interest.
        </p>
        <p style={pStyle}>
          <strong>Step 3: Convert to a loan.</strong> At 6.5% over 30 years, a $1,650 payment supports a loan of roughly
          $261,000. Add the $20,000 down payment and the purchase price lands around $281,000.
        </p>
        <p style={pStyle}>Now watch what happens when you move one piece.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            If the rate drops one point to 5.5%, the same $1,650 payment supports a loan of about $290,000, roughly 11%
            more house.
          </li>
          <li style={liStyle}>If the rate goes up a point to 7.5%, the loan shrinks to about $236,000.</li>
        </ul>
        <p style={pStyle}>
          Here's a cleaner way to see how rates hit your buying power. Take a $2,000 monthly payment for principal and
          interest on a 30-year loan:
        </p>
        <DataTable headers={RATE_HEADERS} rows={RATE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Same budget, same income, a $66,000 difference in loan size from the rate alone. That's why we suggest running
          several rates instead of one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>About How Much House You Can Afford at Different Incomes</h2>
        <p style={pStyle}>
          People search "how much house can I afford on a $100k salary" all the time, so here's a rough guide. These
          numbers use the 28% housing guideline only, assume no other debts, and use these assumptions: 6.5% rate, 30-year
          term, 10% down, property tax at about 1.1% of the home price per year, homeowners insurance at roughly $35 a
          month per $100,000 of value, and PMI at 0.5% of the loan.
        </p>
        <DataTable headers={INCOME_HEADERS} rows={INCOME_ROWS} wrap />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Treat these as ballparks. Add a car payment and student loans and the back-end limit will pull the number down.
          Live somewhere with 2% property taxes and it drops further. Have 20% to put down instead of 10% and it goes up.
          Your own inputs will always beat a generic table.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Costs the Monthly Payment Doesn't Show</h2>
        <p style={pStyle}>
          An affordability calculator tells you what you can borrow. It can't tell you everything owning a home will
          cost, and this is where a lot of first-time buyers get squeezed.
        </p>
        <p style={pStyle}>
          <strong>Closing costs.</strong> Expect roughly 2% to 5% of the purchase price for lender fees, title work,
          appraisal, prepaid taxes and insurance, and so on. That's a separate pile of cash from your down payment. On a
          $300,000 home, think $6,000 to $15,000.
        </p>
        <p style={pStyle}>
          <strong>Maintenance and repairs.</strong> A common guideline is to set aside about 1% of the home's value each
          year, more for older houses. A new water heater, a roof, or an HVAC replacement can land at the worst possible
          time and cost thousands.
        </p>
        <p style={pStyle}>
          <strong>Utilities.</strong> Houses usually cost more to heat, cool, and keep running than apartments do. Water,
          sewer, trash, and lawn care might be new bills too.
        </p>
        <p style={pStyle}>
          <strong>Rising taxes and insurance.</strong> If your taxes and insurance are escrowed (paid through your
          mortgage), your monthly payment can go up after the first year when assessments or premiums change. Homeowners
          insurance in particular has climbed fast in a lot of areas.
        </p>
        <p style={pStyle}>
          <strong>Emergency savings.</strong> This one's big. Lenders often like to see reserves, meaning a few months of
          housing payments left in the bank after closing. For your own sake, aim to keep at least three to six months of
          expenses available. Emptying every account to hit a bigger down payment is a risky trade.
        </p>
        <p style={pStyle}>
          <strong>Moving and furnishing.</strong> Going from a one-bedroom apartment to a three-bedroom house means a lot
          of stuff to buy.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the numbers look tight once you include all of this, aim below the calculated maximum.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Location Changes Everything</h2>
        <p style={pStyle}>
          The same $100,000 income buys wildly different homes depending on where you are. Median home prices vary a lot
          from one metro area to the next, and the monthly cost isn't just about the price tag. Property tax rates run
          from well under 0.5% of a home's value in some states to over 2% in others. On a $350,000 house, that's the
          difference between about $1,500 a year and $7,000 or more.
        </p>
        <p style={pStyle}>
          Insurance is the same story. Coastal and storm-prone areas, and places with wildfire risk, can cost far more
          than a typical inland suburb. Flood insurance can be an additional requirement in some zones.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're comparing cities, don't just look at prices. Run the calculator with local tax and insurance numbers
          for each place. You may find a cheaper home in a high-tax area costs about the same per month as a pricier one
          somewhere else.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>If the Number Is Lower Than You Hoped</h2>
        <p style={pStyle}>
          A disappointing result isn't a dead end. It's information, and it tells you which lever to pull.
        </p>
        <p style={pStyle}>
          <strong>Pay down debt.</strong> Whatever's eating your back-end ratio is the best target. Credit card balances
          are usually first, because they hurt your DTI and your credit score at the same time. Skipping a new car or
          paying off a student loan can free up room.
        </p>
        <p style={pStyle}>
          <strong>Raise your credit score.</strong> A better score means a lower interest rate, and a lower rate means
          more buying power. Paying down card balances, making payments on time, and avoiding new credit applications
          before you apply all help. Crossing a pricing tier (say, from 659 to 660 or 739 to 740) can change your rate.
        </p>
        <p style={pStyle}>
          <strong>Save a bigger down payment.</strong> It lowers the loan, can cut out mortgage insurance, and usually
          gets you a better rate. It also gives the lender more confidence.
        </p>
        <p style={pStyle}>
          <strong>Build savings and reserves.</strong> When your DTI is borderline, lenders sometimes treat solid savings
          as a compensating factor and approve a higher ratio.
        </p>
        <p style={pStyle}>
          <strong>Boost your income.</strong> It's easier said than done, but it's the single biggest lever. A raise
          changes your DTI immediately. Adding a co-borrower with their own steady income can do the same thing, as long
          as they don't bring a pile of debt with them.
        </p>
        <p style={pStyle}>
          <strong>Look into down payment assistance.</strong> Many states, cities, and local housing agencies offer grants
          or low-interest loans to help with down payments and closing costs, often for first-time or lower-income
          buyers. These programs have income caps and rules, so check what's available where you want to live.
        </p>
        <p style={pStyle}>
          <strong>Shop lenders.</strong> Rates and fees can differ between lenders on the same day for the same borrower.
          Mortgage inquiries made within a short window are generally treated as one for credit scoring purposes, so
          getting multiple quotes won't wreck your score.
        </p>
        <p style={pStyle}>
          <strong>Consider a different price range or place.</strong> A smaller home, a condo or townhouse, or a
          different neighborhood or city can make a big difference.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Think about renting for now.</strong> Renting isn't a failure. If your DTI is tight, your savings are
          thin, or you might move in a couple of years, renting while you build credit and savings can set you up for a
          better purchase later. Buying costs a lot up front (closing costs, moving), so it usually makes sense when you
          plan to stay for several years.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pre-Qualification vs. Pre-Approval</h2>
        <p style={pStyle}>
          This calculator gives you an estimate, which is the first step. Next comes talking to a lender, and the terms
          get confusing.
        </p>
        <p style={pStyle}>
          <strong>Pre-qualification</strong> is a quick, informal look at your income, debts, and assets, often based on
          what you tell the lender. You get an idea of what you might borrow.
        </p>
        <p style={pStyle}>
          <strong>Pre-approval</strong> goes deeper. The lender pulls your credit, verifies your income and assets with
          documents like pay stubs, W-2s, tax returns, and bank statements, and issues a letter stating a specific loan
          amount. Sellers take pre-approval letters more seriously.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Use the calculator to get your range and decide how much you're comfortable spending. Then get pre-approved
          before you make offers, so you know the lender agrees with your math.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Is This, and What Does It Cost?</h2>
        <p style={pStyle}>
          The house affordability calculator is free to use. It applies standard lending formulas and the DTI guidelines
          for each loan type, so the result is a realistic starting point.
        </p>
        <p style={pStyle}>
          It's still an estimate, not an approval. Real lender decisions factor in your credit history, employment
          stability, assets, the property's appraisal, and lender-specific rules that no calculator can see. Property
          taxes, insurance, and mortgage insurance also vary by address and lender, so the more accurate your inputs, the
          better your result.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the best accuracy, use gross income instead of take-home pay, include every recurring debt, enter local tax
          and insurance figures, and test a few interest rates around today's market. Then treat the output as a planning
          range and confirm it with a lender.
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
