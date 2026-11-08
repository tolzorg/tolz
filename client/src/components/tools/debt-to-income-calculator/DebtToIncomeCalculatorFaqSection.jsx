import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a debt-to-income ratio?",
    a: "It’s the percentage of your gross monthly income that goes toward required debt payments. Lenders use it to judge whether you can handle more borrowing.",
  },
  {
    q: "How do I calculate my debt-to-income ratio?",
    a: "Add up your monthly debt payments, divide by your gross monthly income, and multiply by 100. The Tolz debt-to-income ratio calculator does it for you and shows front-end and back-end ratios separately.",
  },
  {
    q: "What is a good debt-to-income ratio for a mortgage?",
    a: "A back-end DTI of 36% or less is generally seen as strong. Many conventional loans allow up to 45% with solid credit and reserves, and automated approvals can reach 50%. Limits vary by lender and loan type.",
  },
  {
    q: "What’s the difference between front-end and back-end DTI?",
    a: "Front-end covers only housing costs. The back-end covers housing plus all other monthly debts. Lenders check both, and the back-end number usually carries more weight.",
  },
  {
    q: "Does DTI include rent?",
    a: "Not when you’re applying for a mortgage. Lenders replace your current rent with the projected mortgage payment, since the rent presumably stops after you buy. If you’re applying to rent, landlords may look at rent against income instead.",
  },
  {
    q: "Does DTI include utilities, groceries, or insurance?",
    a: "No. Everyday living costs aren’t counted. Homeowners insurance is included only as part of your housing payment.",
  },
  {
    q: "Is DTI the same as credit utilization?",
    a: "No. Credit utilization compares your card balances to your credit limits and affects your credit score. DTI compares your monthly debt payments to your income and doesn’t appear on your credit report.",
  },
  {
    q: "Does my credit score affect my DTI?",
    a: "Not directly. But lenders look at both together, and a strong score can help offset a higher ratio.",
  },
  {
    q: "What’s the 28/36 rule?",
    a: "It’s a guideline that says housing costs should stay under 28% of gross income and total debt under 36%. It’s a conservative benchmark, not a hard lending requirement.",
  },
  {
    q: "What DTI do I need for an FHA loan?",
    a: "FHA manual underwriting uses baselines of 31% front-end and 43% back-end. Automated approvals can go higher when other parts of your application are strong. Check current limits with your lender.",
  },
  {
    q: "What DTI do I need for a VA loan?",
    a: "The VA uses 41% as a guideline, but it also looks at residual income. Many borrowers get approved above 41% when their leftover monthly income is healthy.",
  },
  {
    q: "Do student loans in deferment count toward DTI?",
    a: "Often, yes. Lenders usually count a payment based on a percentage of your balance or on your documented payment, even if you aren’t paying yet.",
  },
  {
    q: "How can I lower my DTI quickly?",
    a: "Pay off small loans with big payments, pay down credit cards, avoid new debt before applying, and look into adding documented income or a co-borrower.",
  },
  {
    q: "Can I use yearly figures instead of monthly?",
    a: "Yes. The tool accepts monthly or yearly amounts for income and debts.",
  },
];

// FAQ schema carries the supplied JSON-LD exactly: only these questions, with
// these answer wordings where they differ from the displayed text.
const FAQ_SCHEMA_QUESTIONS = [
  "What is a debt-to-income ratio?",
  "How do I calculate my debt-to-income ratio?",
  "What is a good debt-to-income ratio for a mortgage?",
  "What’s the difference between front-end and back-end DTI?",
  "Does DTI include rent?",
  "Does DTI include utilities, groceries, or insurance?",
  "Is DTI the same as credit utilization?",
  "What’s the 28/36 rule?",
  "Do student loans in deferment count toward DTI?",
  "How can I lower my DTI quickly?",
  "Can I use yearly figures instead of monthly?",
];

const FAQ_SCHEMA_OVERRIDES = {
  "What’s the difference between front-end and back-end DTI?":
    "Front-end covers only housing costs. Back-end covers housing plus all other monthly debts. Lenders check both, and the back-end number usually carries more weight.",
  "Does DTI include rent?":
    "Not when you're applying for a mortgage. Lenders replace your current rent with the projected mortgage payment, since the rent presumably stops after you buy.",
  "Is DTI the same as credit utilization?":
    "No. Credit utilization compares your card balances to your credit limits and affects your credit score. DTI compares monthly debt payments to income and doesn't appear on your credit report.",
  "Do student loans in deferment count toward DTI?":
    "Often, yes. Lenders usually count a payment based on a percentage of your balance or your documented payment, even if you aren't paying yet.",
};

const straight = (s) => s.replace(/’/g, "'");

const FAQ_SCHEMA_ITEMS = FAQ_ITEMS
  .filter((item) => FAQ_SCHEMA_QUESTIONS.includes(item.q))
  .map((item) => ({ q: straight(item.q), a: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) }));

const LOAN_LIMIT_HEADERS = ["Loan type", "Manual underwriting (front-end / back-end)", "Automated underwriting"];
const LOAN_LIMIT_ROWS = [
  ["Conventional", "28% / 36%, up to 45% on the back-end with strong credit and reserves", "Up to 50% back-end"],
  ["FHA", "31% / 43%, sometimes higher with compensating factors", "Often higher than manual limits"],
  ["VA", "41% back-end guideline (no front-end limit)", "Often approved above 41% when residual income is strong"],
  ["USDA", "29% / 41%", "Can go higher with strong profiles"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5,
  color: "var(--text-primary)", margin: "14px 0 8px",
};
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: j === 0 ? "nowrap" : "normal", verticalAlign: "top" }}>
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

export default function DebtToIncomeCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Debt-to-Income Ratio Calculator Does</h2>
        <p style={pStyle}>
          You can enter income and debts as monthly or yearly amounts, and that’s more useful than it sounds. Your salary is
          probably an annual number, but your rent, car payment, and credit card minimums all show up monthly. Instead of
          converting everything in your head, you just enter each figure the way you already have it.
        </p>
        <p style={pStyle}>
          The calculator gives you two ratios instead of one, because lenders look at two. The front-end ratio covers housing
          costs only. The back-end ratio adds all your other monthly debts on top. Once it runs the numbers, the tool shows
          where you land on a health scale and estimates a home price range based on your income and what you already owe
          each month.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To get a good result, grab a recent pay stub (or last year’s tax return if you’re self-employed) and your latest
          loan and credit card statements before you start. It takes about two minutes, and you’ll know a lot more than you
          did before.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Debt-to-Income Ratio?</h2>
        <p style={pStyle}>
          Your debt-to-income ratio, or DTI, is the share of your gross monthly income that goes toward required debt
          payments. Gross means before taxes and other deductions come out. If you earn $1,000 a month and $480 of it goes to
          debt payments, your DTI is 48%. If you owe nothing, it’s 0%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders use it as a quick read on risk. Credit card issuers, auto lenders, personal loan companies, and mortgage
          underwriters all look at it, because someone with a high ratio has less room to absorb a surprise, like a car repair
          or a few slow months at work. A lender might think a 45% ratio is fine for a credit card and still say no to a
          personal loan. Every company has its own comfort zone, and DTI is only one piece of the picture. Your credit
          history, income stability, savings, and down payment all matter too. All else being equal, though, lower is better.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>DTI vs. Credit Utilization: They’re Not the Same Thing</h2>
        <p style={pStyle}>
          People mix these up constantly. Credit utilization (also called your debt-to-credit ratio) compares your credit card
          balances to your credit limits. If you’ve got $3,000 in balances across cards with $10,000 in total limits, you’re
          at 30% utilization. That number feeds directly into your credit score, and higher utilization drags the score down.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          DTI doesn’t touch your credit score at all. It’s about income versus payments, and it never shows up on your credit
          report. But lenders check both. You can have a great score and still get turned down because your DTI is too high,
          or the reverse.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Debt-to-Income Ratio</h2>
        <p style={pStyle}>
          The formula is short: total monthly debt payments divided by gross monthly income, times 100.
        </p>
        <p style={pStyle}>Say someone earns $6,000 a month before taxes. Here’s what they owe each month:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Mortgage payment: $1,500</li>
          <li style={liStyle}>Car loan: $350</li>
          <li style={liStyle}>Student loan: $300</li>
          <li style={lastLi}>Credit card minimums: $150</li>
        </ul>
        <p style={pStyle}>
          That’s $2,300 in total debt. Divide $2,300 by $6,000 and you get about 38.3%. That’s their back-end DTI, and it’s
          the same math the debt-to-income ratio calculator runs behind the scenes.
        </p>
        <p style={pStyle}>A few things trip people up here:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Use the minimum payment, not the balance.</strong> If you owe $4,000 on a card and the minimum is $80, then $80 goes into the calculation. Lenders count what you’re required to pay, not what you owe in total and not what you choose to pay on top of that.</li>
          <li style={liStyle}><strong>Use gross income, not take-home pay.</strong> Your DTI will always look worse if you use your net paycheck, so don’t. Lenders use the pre-tax number.</li>
          <li style={liStyle}><strong>Count both people if you’re applying together.</strong> With a spouse or partner, add both incomes and both sets of debts.</li>
          <li style={lastLi}><strong>Rent works differently for homebuyers.</strong> When you apply for a mortgage, lenders swap your current rent for the new mortgage payment you’d be taking on. They assume the rent goes away once you own it. So don’t stack your rent on top of the projected mortgage payment when you’re checking buying power.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Front-End vs. Back-End DTI</h2>
        <p style={pStyle}>
          The <strong>front-end ratio</strong> (also called the housing ratio, or the mortgage-to-income ratio when you’re
          buying) is your total monthly housing cost divided by gross monthly income. For a buyer, housing cost means
          principal, interest, property taxes, and homeowners insurance, which is why you’ll hear the acronym PITI. It also
          includes HOA or co-op fees and mortgage insurance if you’re paying it. Using the example above, $1,500 ÷ $6,000
          gives a front-end ratio of 25%.
        </p>
        <p style={pStyle}>
          The <strong>back-end ratio</strong> (the total debt ratio) takes everything in the front-end number and adds all
          your other recurring debts: car loans, student loans, personal loans, credit card minimums, and legal obligations
          like child support or alimony. That’s the 38.3% figure from above. When someone just says “DTI” without any
          qualifier, they usually mean this one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders look at both. You can pass one test and fail the other, so a calculator that shows only a single number can
          leave you with a false sense of security. If your front-end looks fine but your back-end is high, the problem is
          your other debts. If it’s the other way around, you’re probably aiming at too much house.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Good Debt-to-Income Ratio?</h2>
        <p style={pStyle}>
          The old rule of thumb is the 28/36 rule: spend no more than 28% of gross income on housing, and no more than 36% on
          all debt combined. Lenders traditionally use it as the “ideal borrower” standard and work backward from it to
          figure out how big a monthly payment you can handle.
        </p>
        <p style={pStyle}>For your own finances, here’s a rough way to read the result:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Under 20%:</strong> Excellent. You’ve got lots of breathing room.</li>
          <li style={liStyle}><strong>20% to 35%:</strong> Healthy. Most lenders will be comfortable with this range.</li>
          <li style={liStyle}><strong>36% to 43%:</strong> Manageable, but things are getting tight. You can still qualify for most loans.</li>
          <li style={liStyle}><strong>43% to 50%:</strong> Approval is possible, but it’ll depend on strengths like credit score, savings, and down payment.</li>
          <li style={lastLi}><strong>Over 50%:</strong> More than half your income goes to debt. Lenders see this as high risk, and honestly, it’s a stressful place to live. Pay debt down before taking on anything new.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One other benchmark worth knowing: a DTI around one-third (33%) is generally viewed as manageable, while half of
          your income going to debt is where most lenders and financial counselors get nervous.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mortgage DTI Limits by Loan Type</h2>
        <p style={pStyle}>
          Here’s where it gets interesting. The limits lenders actually use depend on the type of loan and on how the file
          gets underwritten. Most applications go through an automated underwriting system (AUS), which looks at your whole
          profile and spits out an approve or refer decision. When the system can’t approve a file, or when a person reviews
          it instead, that’s manual underwriting, and the limits are usually tighter.
        </p>
        <DataTable headers={LOAN_LIMIT_HEADERS} rows={LOAN_LIMIT_ROWS} />
        <p style={pStyle}>
          The conventional numbers come straight from Fannie Mae’s guidelines: a 36% maximum for manually underwritten loans
          that stretches to 45% when you meet the credit score and reserve requirements, and a 50% cap for loans run through
          Desktop Underwriter. For FHA, VA, and USDA, the manual-underwriting figures are the standard baselines, and
          automated approvals can go beyond them. How far depends on the lender.
        </p>
        <p style={pStyle}>
          That last point matters. Plenty of lenders add their own rules on top of what the agencies allow, which are called
          overlays. One lender might approve a 50% DTI on a conventional loan while another stops at 45%. If a lender turns
          you down, it’s worth getting a second opinion from a different lender or a mortgage broker before you assume
          you’re stuck.
        </p>
        <p style={pStyle}>Compensating factors are what lenders look at when your DTI is high. The common ones are:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>A strong credit score</li>
          <li style={liStyle}>A bigger down payment</li>
          <li style={liStyle}>Cash reserves, often six months or more of housing payments</li>
          <li style={liStyle}>A long, stable job history</li>
          <li style={lastLi}>A small increase in housing payment compared to what you pay now</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          VA loans add something extra: residual income. That’s the money left over each month after your major obligations
          and living costs. If you’ve got plenty of it, the VA is more flexible about a higher DTI.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much House Can I Afford Based on Income?</h2>
        <p style={pStyle}>
          This is where the two ratios become practical. The calculator starts with the lender-style limits, figures out the
          largest total debt payment your income can support, subtracts your existing non-housing debt, and what’s left is
          your housing budget.
        </p>
        <p style={pStyle}>Using the same $6,000 monthly income:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>At a 36% back-end limit, total allowable debt is $2,160.</li>
          <li style={liStyle}>Subtract $800 in non-housing debts (car, student loan, card minimums), and $1,360 is left for housing.</li>
          <li style={liStyle}>At a 28% front-end limit, the housing ceiling would be $1,680.</li>
          <li style={lastLi}>The lower number wins, so the working housing budget is $1,360 a month.</li>
        </ul>
        <p style={pStyle}>
          That $1,360 isn’t all the mortgage, though. It has to cover property taxes and insurance too. Say those run about
          $350 a month where you’re buying. That leaves roughly $1,010 for principal and interest. At a 6.5% rate on a
          30-year loan, each $1,000 you borrow costs about $6.32 a month, so $1,010 supports a loan of around $160,000. Put
          10% down and the purchase price lands near $177,000.
        </p>
        <p style={pStyle}>
          Now look at what happens when debt changes. If that $300 student loan were gone, the housing budget would jump by
          $300 a month. That’s roughly $47,000 more in borrowing power at the same rate. Paying off a loan for a few thousand
          dollars can do more for your buying power than saving the same amount toward a down payment.
        </p>
        <p style={pStyle}>
          Keep a few things in mind about the estimate. Your actual numbers will shift with the interest rate you’re offered,
          your credit score, local property tax rates, insurance costs (which can be high in some regions), and whether
          mortgage insurance applies. A lower rate raises your price range, and a higher one cuts it. The estimate is a
          planning figure, not a loan offer, but it’s a good way to avoid wasting weekends at open houses you can’t finance.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more thing, and it’s worth being honest about: what a lender will approve and what you’ll feel comfortable
          paying aren’t the same. A 50% back-end DTI might get approved, but it leaves half your gross income going to debt,
          and that’s before taxes, groceries, utilities, childcare, and everything else. Many people find 36% or lower a lot
          more livable, even if the bank would let them borrow more.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Counts as Income and Debt</h2>
        <p style={pStyle}>
          Garbage in, garbage out. The ratio is only as accurate as what you type in, so here’s what lenders typically count.
        </p>
        <p style={pStyle}><strong>Income that counts:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Base salary or hourly wages</li>
          <li style={liStyle}>Overtime, bonuses, and commissions, if you have a documented history (usually two years)</li>
          <li style={liStyle}>Self-employment income, which is usually averaged over two years of tax returns, after business deductions</li>
          <li style={liStyle}>Social Security, pensions, and disability payments</li>
          <li style={liStyle}>Rental income, often with a haircut applied by the lender</li>
          <li style={lastLi}>Alimony or child support you receive, if it’ll continue for several more years and you can document it</li>
        </ul>
        <p style={pStyle}>
          If your income swings from month to month, be conservative. Underwriters usually take the average, and if it’s
          trending down, they may use the lower recent figure instead.
        </p>
        <p style={pStyle}><strong>Debts that count:</strong></p>
        <ul style={ulStyle}>
          <li style={liStyle}>Mortgage or rent (see the note above on how rent is treated for buyers)</li>
          <li style={liStyle}>Auto loans and leases</li>
          <li style={liStyle}>Student loans</li>
          <li style={liStyle}>Personal loans</li>
          <li style={liStyle}>Minimum credit card payments</li>
          <li style={liStyle}>Child support and alimony you pay</li>
          <li style={lastLi}>Any loan you’ve co-signed for someone else, unless you can show that the other person has been making the payments themselves</li>
        </ul>

        <h3 style={h3Style}>Things people get wrong:</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Student loans in deferment or income-driven plans.</strong> Even if you’re not paying right now, lenders often still count something. Depending on the loan program, they may use a percentage of your balance (often somewhere between 0.5% and 1%) or the actual payment if it’s documented. A $60,000 student loan in deferment can easily add $300 to $600 a month to your DTI on paper. Ask your lender how they’ll treat it.</li>
          <li style={liStyle}><strong>Installment loans that are almost paid off.</strong> Some loan programs let lenders leave out an installment debt with only a handful of payments left, usually around 10 months, as long as it doesn’t strain your finances. If you’re close, that’s worth asking about, because it could improve your ratio without you paying a dime extra.</li>
          <li style={lastLi}><strong>Co-signed debts.</strong> If your name’s on the loan, it’s on your DTI, even if someone else makes the payments.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>What doesn’t count:</strong> groceries, utilities, phone bills, streaming subscriptions, gas, car insurance,
          health insurance, and daycare. This is why DTI isn’t a full picture of affordability. Two people with the same
          ratio can have very different budgets depending on how much they spend on living costs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Debt-to-Income Ratio Calculator</h2>
        <p style={pStyle}>Most people reach for a DTI calculator at a handful of predictable moments:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Before applying for a mortgage.</strong> Check your numbers several months ahead if you can. If the ratio is too high, you’ve got time to pay down a card or a loan. Finding out during underwriting leaves you scrambling.</li>
          <li style={liStyle}><strong>Before refinancing.</strong> Lenders recheck your finances when you refinance. If your debts have grown since your original loan, you may not qualify for the rate you were hoping for. And if your file ends up manually underwritten, a stricter limit applies.</li>
          <li style={liStyle}><strong>Before buying a car.</strong> Adding a $450 payment can push your back-end ratio up more than you’d think. Run it through before you sign anything at the dealership.</li>
          <li style={liStyle}><strong>When you’re renting.</strong> Many landlords look for rent at about one-third of your gross income or less. It’s not the same as a DTI check, but it’s a similar idea.</li>
          <li style={liStyle}><strong>When you’re comparing job offers.</strong> A higher salary in an expensive city might not change your picture much once you factor in higher housing costs. Plug in the numbers for both.</li>
          <li style={liStyle}><strong>When you’re working on paying down debt.</strong> Recalculate after each loan is gone and watch the percentage drop. It’s a decent way to stay motivated.</li>
          <li style={lastLi}><strong>Before co-borrowing.</strong> If you’re applying with a partner or co-signer, you can test different combinations of income and debt to see what works.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Lower Your Debt-to-Income Ratio</h2>
        <p style={pStyle}>
          DTI is a fraction, so there are only two ways to improve it: shrink the debt on top or grow the income on the
          bottom. Most people find the debt side faster.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Pay off the right debts first.</strong> A loan that’s completely gone drops out of your DTI entirely, so a small balance with a big monthly payment gives you the most improvement per dollar. If you have a $2,000 balance on a loan with a $200 payment, paying it off helps your ratio more than putting the same $2,000 toward a $20,000 loan with a $250 payment. Credit cards help too, since the minimum payment generally drops as the balance goes down. Paying off the more expensive, high-interest debts also saves you the most money overall.</li>
          <li style={liStyle}><strong>Refinance existing loans.</strong> If rates have dropped since you took out a loan, refinancing can lower your monthly payment. Stretching the term out also lowers the payment, though you’ll pay more interest in the long run, so run the numbers first.</li>
          <li style={liStyle}><strong>Call your credit card company.</strong> It sounds too simple, but if you’ve paid on time and your account’s in good standing, a lot of issuers will lower your rate if you ask. A lower rate means more of each payment goes toward the balance.</li>
          <li style={liStyle}><strong>Consider consolidation.</strong> A debt consolidation loan rolls several high-interest debts into one loan, often with a fixed rate and a single payment. A balance transfer card with a low introductory rate can do something similar. Both can help, but watch for fees, and don’t run your cards back up afterward.</li>
          <li style={liStyle}><strong>Add income.</strong> Overtime, a raise, a second job, or a side gig like rideshare driving all help, as long as the income is documented. Keep in mind that lenders usually want to see a track record, often two years, before they’ll count a new side income. If you started something last month, it probably won’t help your application this time around.</li>
          <li style={liStyle}><strong>Bring in a co-signer or co-borrower.</strong> Someone with solid income and good credit can strengthen your application. On conventional loans, a co-signer who doesn’t live in the home may face additional requirements. FHA loans are generally more flexible about non-occupant co-borrowers. Either way, they’re taking on real responsibility for the loan, so it’s not a favor to ask lightly.</li>
          <li style={liStyle}><strong>Build a budget.</strong> It’s boring advice, but tracking spending usually turns up money you didn’t know was leaking out, whether that’s takeout, subscriptions, or impulse shopping. Redirect that toward debt, and recheck your DTI each month to see the change.</li>
          <li style={liStyle}><strong>Be careful with loan forgiveness.</strong> Forgiveness and settlement programs can erase debt, but they come with tradeoffs. Some can hurt your credit score, and forgiven debt may count as taxable income. Think hard before signing up, and talk to a tax professional or attorney first.</li>
          <li style={lastLi}><strong>Don’t open new credit before applying.</strong> Financing furniture, a new phone, or a car in the months before a mortgage application can raise your ratio and trigger extra questions from the underwriter. Wait until after closing.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Not sure how much you’d need to change? Use the debt-to-income ratio calculator to test scenarios. Try removing a
          loan, adding income, or changing the housing payment, and you’ll see exactly where you cross a threshold.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Calculator Free, Private, and Accurate?</h2>
        <p style={pStyle}>
          The calculator is free to use, and you don’t pay anything to see your results. It uses the standard formulas
          lenders rely on for front-end and back-end ratios, so the math is solid. Whether the output is useful comes down to
          what you put in, which is why using gross income and required minimum payments matters.
        </p>
        <p style={pStyle}>
          The health rating and the affordability estimate are educational guidelines built on commonly used benchmarks.
          They’re not a loan approval, a credit decision, or financial advice. Lender rules differ and change over time, so
          use the results to prepare for a conversation with a mortgage lender or a financial professional, not to replace
          one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You also don’t need to enter anything personal. The calculator only needs dollar amounts, not account numbers, your
          name, or other identifying details, so keep those out.
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
