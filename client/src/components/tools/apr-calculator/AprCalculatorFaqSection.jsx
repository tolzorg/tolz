import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an APR calculator?",
    a: "It turns a loan’s interest rate and upfront fees into one annual percentage that shows the full cost of borrowing, so you can compare loans with different rates and fees.",
  },
  {
    q: "How do I calculate APR on a loan?",
    a: "Subtract upfront fees from the loan amount to get your net proceeds, then find the periodic rate that makes your scheduled payments equal that net amount, and annualize it. The calculator handles the iteration for you.",
  },
  {
    q: "Is APR the same as the interest rate?",
    a: "No. The interest rate is the base cost of borrowing. APR adds fees and other finance charges, so it’s usually higher.",
  },
  {
    q: "Why is my APR higher than my interest rate?",
    a: "Fees reduce the money you receive, but interest still builds on the full principal. The bigger the fees and the shorter the term, the wider the gap.",
  },
  {
    q: "What is a good APR in 2027?",
    a: "It depends on the loan type and your credit. Recent averages are around 12.5% for personal loans, about 7% for 30-year mortgages and near 20% for credit cards. The best APR is the lowest one you qualify for.",
  },
  {
    q: "Does APR include closing costs on a mortgage?",
    a: "Partly. Origination fees, points, underwriting and mortgage insurance are typically included. Appraisals, surveys, title fees and prepaid taxes and insurance usually aren’t. Your Loan Estimate shows the exact treatment.",
  },
  {
    q: "Does the calculator include PMI and points?",
    a: "Yes. Mortgage mode lets you enter both so the APR reflects them.",
  },
  {
    q: "Do discount points lower my APR?",
    a: "Points lower your rate but add an upfront cost. Whether the APR falls depends on how much the rate drops compared with the points paid, and the payoff usually only comes if you keep the loan long enough.",
  },
  {
    q: "What’s the difference between APR and APY?",
    a: "APR is the annual cost of borrowing, including fees. APY is the yearly yield on savings and reflects compounding. For borrowing, use APR.",
  },
  {
    q: "Is a fixed or variable APR better?",
    a: "Fixed gives predictable payments. Variable can start lower and may work if rates fall or you’ll pay off the loan fast, but your cost can rise if the index goes up.",
  },
  {
    q: "How do I get the monthly rate from an effective annual rate?",
    a: "Use (1 + EAR)^(1/12) − 1. A 12% effective annual rate works out to about 0.949% per month.",
  },
  {
    q: "What’s the periodic rate on a $10,000 loan at 15% compounded monthly?",
    a: "It’s 15% ÷ 12, which is 1.25% per month.",
  },
  {
    q: "How do I find my student loan APR?",
    a: "Check your rate and any origination fee at studentaid.gov or in your private loan agreement, then enter the fee as an upfront cost in the calculator.",
  },
  {
    q: "Can I use this calculator for credit cards?",
    a: "It’s built for installment loans with fixed terms. Credit card APRs are usually variable and apply to a revolving balance, so results won’t match exactly.",
  },
  {
    q: "Is a lower APR always better?",
    a: "Generally, yes, if the loans have the same term and structure. If you expect to repay early, compare the total cost over the time you’ll actually hold the loan.",
  },
  {
    q: "How can I lower my APR?",
    a: "Improve your credit score, compare multiple lenders, skip origination fees, use a cosigner if needed, take autopay discounts, choose a shorter term, or refinance when it pays off.",
  },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I get the monthly rate from an effective annual rate?": "Use (1 + EAR)^(1/12) - 1. A 12% effective annual rate works out to about 0.949% per month.",
  "What’s the periodic rate on a $10,000 loan at 15% compounded monthly?": "It's 15% divided by 12, which is 1.25% per month.",
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) }));

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8,
};

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

export default function AprCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This APR Calculator Does</h2>
        <p style={pStyle}>
          The APR is the yearly cost of a loan, shown as one percentage, with interest and fees both counted. The interest
          rate on your offer only tells you what the lender charges on the balance you owe. The APR tells you what the whole
          deal costs compared to the money you actually walk away with.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are two modes here. Loan mode covers personal loans, auto loans, business loans and most other installment
          borrowing. You enter the amount, nominal rate, term, upfront fees, compounding frequency and payment frequency.
          Mortgage mode is for U.S. home loans, and it adds discount points and private mortgage insurance on top of the
          basics. Both give you the real APR, the periodic payment, total interest, total cost and a payment-by-payment
          schedule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>APR vs Interest Rate: Why the Two Numbers Don’t Match</h2>
        <p style={pStyle}>
          The interest rate is the price of borrowing the principal. That’s it. It sets how much interest builds up each
          period and doesn’t say anything about the fees you pay to get the loan.
        </p>
        <p style={pStyle}>
          The APR takes that rate and adds the finance charges, like origination fees, broker fees and points, then spreads
          them across the life of the loan. So the APR is almost always higher than the rate. If the gap is small, the loan is
          mostly interest. If the gap is big, you’re paying a lot upfront.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the U.S., the Truth in Lending Act (implemented through Regulation Z) requires lenders to show you the APR so you
          can compare offers side by side. The catch is that every lender packages fees a little differently, so it’s worth
          asking for an itemized list of what’s baked into each APR you’re quoted.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the APR Calculator</h2>
        <ol style={listGapStyle}>
          <li style={liStyle}><strong>Pick your mode.</strong> Choose a standard loan or U.S. mortgage.</li>
          <li style={liStyle}><strong>Enter the loan amount.</strong> That’s the full principal you’re borrowing, before fees come out.</li>
          <li style={liStyle}><strong>Enter the nominal interest rate.</strong> Use the rate in the offer.</li>
          <li style={liStyle}><strong>Set the term.</strong> Years or months, whichever matches your paperwork.</li>
          <li style={liStyle}><strong>Add upfront fees.</strong> Origination, processing, application, broker fees, anything you pay to get the loan.</li>
          <li style={liStyle}><strong>Choose compounding and payment frequency.</strong> If you’re not sure, check the loan agreement. Monthly and monthly is the most common pairing.</li>
          <li style={liStyle}><strong>For a mortgage, add points and PMI.</strong> Enter the discount points you’re paying and your estimated PMI.</li>
          <li style={lastLi}><strong>Calculate.</strong> You’ll see the APR, payment, total interest, total cost and the schedule.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Comparing offers? Run each one separately and put the APRs next to each other. If the loans have similar terms, the
          lower APR is usually the cheaper loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Counts Toward a Mortgage APR (and What Usually Doesn’t)</h2>
        <p style={pStyle}>
          This is where people get tripped up, because two mortgage quotes with the same rate can have very different APRs
          depending on how fees are structured.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}><strong>Fees that usually get included in a U.S. mortgage APR:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Origination points and discount points</li>
          <li style={liStyle}>Underwriting, processing and administration fees</li>
          <li style={liStyle}>Application fees</li>
          <li style={liStyle}>Mortgage broker fees</li>
          <li style={liStyle}>Mortgage insurance</li>
          <li style={liStyle}>Escrow and certain closing fees</li>
          <li style={lastLi}>Refinance fees</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}><strong>Fees that are usually left out:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Appraisal fees</li>
          <li style={liStyle}>Survey fees</li>
          <li style={liStyle}>Title insurance and related title fees</li>
          <li style={liStyle}>Builder warranties</li>
          <li style={liStyle}>Prepaid items in escrow, like property taxes and homeowners insurance</li>
          <li style={lastLi}>Intangible taxes</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders don’t all treat every fee the same way, and not every loan has every fee. So the APR you calculate here can
          differ a bit from the one on your official Loan Estimate. Use this tool to compare and plan, then check your
          lender’s disclosure for the final word.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Your Mortgage Interest Rate and APR Are Different</h2>
        <p style={pStyle}>
          Say you’re quoted 7.00% on a $400,000 30-year mortgage, with $6,000 in lender fees. Your monthly principal and
          interest is about $2,661. But since $6,000 goes to fees, you only net about $394,000 in real terms while still
          paying back the full $400,000. Solve for the rate that makes those payments equal $394,000 and you land at roughly
          7.15%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That 0.15-point gap is the fees. It looks small, but a lender with a 7.10% rate and no fees could easily beat it.
          Remember too that these figures assume you keep the loan the full 30 years. Most people don’t, which brings us to
          the next point.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mortgage Points and PMI: Do They Pay Off?</h2>
        <p style={pStyle}>
          <strong>Discount points</strong> are prepaid interest. One point costs 1% of the loan amount and typically knocks a
          bit off your rate. Here’s a quick example: on that same $400,000 loan, one point costs $4,000. If it drops your rate
          from 7.25% to 7.00%, your payment falls by about $68 a month. Divide $4,000 by $68 and you get a break-even of about
          five years. Sell or refinance before then and the point was a money-loser. The APR shows this trade-off, but it
          assumes you stay for the whole term, so also think about how long you really plan to stay.
        </p>
        <p style={pStyle}>
          <strong>PMI</strong> (private mortgage insurance) usually kicks in when you put less than 20% down on a conventional
          loan. Cost varies with credit score and down payment, but it commonly runs somewhere between roughly 0.3% and 1.5% of
          the loan per year. You can generally ask your lender to drop it once you hit 80% loan-to-value, and it’s supposed to
          end automatically at 78% under federal law. FHA loans use a different charge called mortgage insurance premium
          (MIP), with its own rules, so don’t assume PMI math carries over.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Putting PMI in the calculation gives you a more honest cost for the years it’s on the loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Loan APR With Fees, Compounding and Payment Frequency</h2>
        <p style={pStyle}>
          A lot of basic calculators assume monthly compounding and monthly payments. Real loans are messier. Some business
          loans compound daily. Some personal loans take biweekly payments. Some compound quarterly but bill monthly.
        </p>
        <p style={pStyle}>
          When compounding and payment frequency don’t match, the cost changes. Interest that compounds more often than you
          pay builds up between payments, which pushes the effective cost up. This tool lets you set both separately so the
          APR matches your actual agreement.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Upfront fees work in a simple way: you owe the full amount, but you get less. A $10,000 loan with a $300 origination
          fee puts $9,700 in your pocket while you repay interest on $10,000. The calculator treats that gap as a cost,
          because it is one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the APR Is Calculated</h2>
        <p style={pStyle}>
          The APR is the rate that makes the value of all your payments equal to the money you actually received. In plain
          English, it’s the interest rate you’d be quoted if the fees were rolled into the rate.
        </p>
        <p style={pStyle}>
          Here’s how it works. The tool first figures out your regular payment from the loan amount, periodic rate and number
          of payments. Then it swaps in the net proceeds (loan amount minus upfront fees) and searches for the periodic rate
          that makes everything balance. There’s no neat formula for that, so it works by trial and refinement until it
          converges. The result gets annualized based on your payment frequency.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Working example:</strong> You borrow $10,000 for 36 months at 5% with monthly payments and a $300 fee. Your
          payment is about $299.71. Since you only receive $9,700, the rate that makes 36 payments of $299.71 worth $9,700
          comes out to about 7.0%. The $300 fee added roughly two full percentage points. That’s the number a quoted rate
          hides.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where APR Falls Short: Paying a Loan Off Early</h2>
        <p style={pStyle}>
          APR assumes you hold the loan to the end. If you don’t, it understates how much the upfront fees hurt, because
          you’ve spread them over fewer payments than the math assumed.
        </p>
        <p style={pStyle}>
          Take the same example and say you pay off the loan after 12 months. Now that $300 fee is spread over one year instead
          of three, the effective cost jumps to roughly 8.6%. Same loan, same fee, very different real cost.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters most on mortgages. Plenty of 30-year loans get paid off in a fraction of that time through home sales,
          refinancing or extra payments. If you expect to move or refinance within a few years, two loans with the same APR
          aren’t equal: the one with lower upfront fees is better for you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed APR vs Variable APR</h2>
        <p style={pStyle}>
          <strong>Fixed APR</strong> stays the same for the whole loan. That’s predictable, and it’s worth strongly considering
          when rates are high and could go higher, though fixed rates usually start out a bit above variable ones.
        </p>
        <p style={pStyle}>
          <strong>Variable APR</strong> moves with a benchmark index, often tied to the prime rate or SOFR, which tend to follow
          Federal Reserve moves. If the index goes up, so does your rate.
        </p>
        <p style={pStyle}>
          Many variable loans also have a credit-based margin, which is the lender’s markup based on your credit profile on
          top of the index. Two borrowers on the same index can end up with different rates because their margins differ. A
          weaker credit score means a bigger margin and can erase the benefit of a lower variable rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Variables can make sense if rates are expected to fall or if you’ll pay the loan off quickly. Longer terms leave you
          exposed for more years, so a move in rates will hit a 30-year balance harder than a 10- or 15-year one. One caution:
          don’t lean on the idea that variables always end up cheaper. It depends entirely on where rates go during your loan,
          and nobody knows that in advance. Also note this calculator assumes a rate that doesn’t change, so it’s best for
          fixed-rate loans or for testing “what if” scenarios on variable ones.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>APR vs APY</h2>
        <p style={pStyle}>
          APY (annual percentage yield) is mostly used for savings accounts and deposits. It shows what you’d earn over a year
          including compounding. You’ll sometimes see it called the effective annual rate (EAR).
        </p>
        <p style={pStyle}>
          Compounding is what separates them. A 10% nominal rate compounded monthly turns $100 into about $110.47 over a year.
          So 10% nominal is 10.47% effective:
        </p>
        <div style={formulaStyle}>100 × (1 + 0.10/12)^12 − 100 = $10.47</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Banks like showing the smaller-looking number when you borrow and the bigger-looking number when you save. That’s
          why loans are advertised with APR and savings accounts with APY. For borrowing decisions, stick with APR, and keep in
          mind that the compounding frequency in your agreement affects the real annual cost.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Find the Monthly Rate From an Effective Annual Rate</h2>
        <p style={pStyle}>If you know the effective annual rate and need the true monthly rate, use this:</p>
        <div style={formulaStyle}>monthly rate = (1 + EAR)^(1/12) − 1</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a 12% EAR, that’s 1.12^(1/12) − 1 ≈ 0.949% per month. Notice it’s a bit less than 1%, because compounding does
          some of the work across the year. If you just divide 12% by 12, you get 1.00% a month, which is the nominal monthly
          rate and would give a higher effective annual rate (about 12.68%). Which one you use depends on whether your number
          is nominal or effective, so check what the lender means.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Periodic Rate on a $10,000 Loan at 15% Compounded Monthly?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The periodic rate is just the nominal rate divided by compounding periods: 15% ÷ 12 = 1.25% per month. In month one,
          interest on $10,000 would be $125. Over a full year of monthly compounding, the effective annual rate works out to
          about 16.08%, which is why a 15% loan really costs more than 15%.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Find the Annual Rate on a Short Loan</h2>
        <p style={pStyle}>
          Sometimes you’ve got a tiny loan and need the annual rate. Take this one: a 4-month loan of $60 costs 80 cents in
          interest.
        </p>
        <p style={pStyle}>
          Simple interest = principal × rate × time. So 0.80 = 60 × r × (4/12). That’s 0.80 = 20r, which gives r = 0.04, or 4%
          a year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That’s a simple-interest answer. Once fees or compounding enter the picture, use the calculator instead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Splitting $10,000 Between an 8% and a 10% Loan</h2>
        <p style={pStyle}>
          This one shows up a lot in math homework: $10,000 is split, with part earning simple interest at 8% and the rest at
          10%, and the average rate is 9.2%. What are the two parts?
        </p>
        <p style={pStyle}>
          Let x be the amount at 8%. Then 10,000 − x is at 10%. Total interest is 9.2% of $10,000, which is $920:
        </p>
        <div style={formulaStyle}>
          0.08x + 0.10(10,000 − x) = 920<br />
          1,000 − 0.02x = 920<br />
          x = 4,000
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>So $4,000 at 8% and $6,000 at 10%. Check: $320 + $600 = $920. ✓</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Find Your Student Loan Rate and APR</h2>
        <p style={pStyle}>
          For federal loans, the rate is fixed for the life of the loan and set by the year you first took it out. Log into
          your account at studentaid.gov to see your exact rate for each loan. For private loans, check your promissory note
          or your lender’s portal.
        </p>
        <p style={pStyle}>
          For loans first disbursed between July 1, 2026 and June 30, 2027, the federal rates are 6.52% for undergraduate Direct
          loans, 8.07% for graduate unsubsidized loans, and 9.07% for PLUS loans. Federal loans also carry an origination fee of
          about 1.057%, which is deducted from what you receive, so the APR is a little higher than the rate. On a 10-year
          standard repayment at 6.52%, that fee nudges the APR to roughly 6.75%. Use the calculator with the fee entered as an
          upfront cost to check your own numbers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you borrow now, there are a few 2026 changes to know about. Grad PLUS ended for new borrowers on July 1, 2026, and
          new borrowing limits apply to graduate and Parent PLUS loans. New loans also only qualify for two repayment options:
          a standard plan or the Repayment Assistance Plan (RAP). Anyone relying on private loans to fill gaps should compare
          APRs carefully, since private rates and fees vary widely.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What’s a Good APR Heading Into 2027?</h2>
        <p style={pStyle}>
          There’s no single answer. It depends on the loan type, your credit and the lender. Still, here are some benchmarks
          from fall 2026 so you can tell if an offer is in the ballpark:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Personal loans:</strong> The average runs around 12.5% for someone with a 700 credit score borrowing $5,000 over three years. Excellent-credit borrowers can find rates well under 10%, and weaker credit can push APRs past 30%.</li>
          <li style={liStyle}><strong>Credit cards:</strong> Averages sit near 20% for accounts carrying a balance, which is why consolidating card debt into a lower-APR loan is common.</li>
          <li style={liStyle}><strong>30-year mortgages:</strong> Weekly national averages have been hovering around 7%, with the 15-year a bit lower.</li>
          <li style={liStyle}><strong>Federal student loans (2026–27):</strong> 6.52% undergraduate, 8.07% graduate, 9.07% PLUS.</li>
          <li style={lastLi}><strong>Federal credit unions:</strong> Most are capped at 18% APR on loans, a limit currently scheduled through September 2027.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A “good” APR is the lowest one you can get for your situation, and single digits are a realistic goal for strong
          borrowers on most loan types. As for the year ahead, rates have stayed stubbornly high, and there’s no reliable sign
          of a big drop. If a deal works at today’s rates, don’t hold out for a dip that might not come. These numbers shift,
          so treat them as a snapshot from October 2026 and compare against fresh quotes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Get a Low Interest Loan in 7 Steps</h2>
        <ol style={ulStyle}>
          <li style={liStyle}><strong>Check your credit reports first.</strong> Pull your free reports and dispute any errors. Even a small bump in your score can move you into a cheaper rate tier.</li>
          <li style={liStyle}><strong>Pay down revolving balances.</strong> Lower credit card utilization helps your score, often faster than anything else.</li>
          <li style={liStyle}><strong>Compare at least three lenders.</strong> Check banks, credit unions and online lenders. Credit unions often come in lower, and many let you prequalify with a soft credit check that doesn’t hurt your score.</li>
          <li style={liStyle}><strong>Skip origination fees when you can.</strong> Some lenders charge none. Use the calculator to see how much a fee adds to the APR.</li>
          <li style={liStyle}><strong>Add a cosigner or co-borrower if needed.</strong> A stronger co-applicant can lower your rate, but they’re on the hook too, so make sure everyone understands that.</li>
          <li style={liStyle}><strong>Ask about discounts.</strong> Autopay and existing-customer discounts can shave a bit off the rate.</li>
          <li style={lastLi}><strong>Choose a shorter term if you can handle the payment.</strong> Shorter terms usually carry lower rates and far less total interest. And if your rate drops later, refinancing may make sense, as long as the closing costs don’t wipe out the savings.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You’ll Want an APR Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Comparing offers.</strong> Two lenders quote 6.5% and 6.9%, but the first charges a 3% origination fee. The APR shows which is really cheaper for your term.</li>
          <li style={liStyle}><strong>Auto and personal loans.</strong> Dealer financing and bank loans bundle fees differently. APR levels the playing field.</li>
          <li style={liStyle}><strong>Deciding on mortgage points.</strong> Run the numbers with and without points, then compare that against how long you’ll realistically stay.</li>
          <li style={liStyle}><strong>Double-checking a lender’s disclosure.</strong> If the APR on your paperwork looks off, enter the figures and see. A big gap is worth a question.</li>
          <li style={liStyle}><strong>Short-term and business financing.</strong> Merchant cash advances and similar products often use flat fees or factor rates. Converting to APR lets you compare them to regular loans.</li>
          <li style={lastLi}><strong>Refinancing.</strong> Compare the new loan’s APR to your current one, then weigh the savings against closing costs and how long you’ll keep the loan.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Amortization Schedule</h2>
        <p style={pStyle}>
          Below the APR, you’ll see the amortization schedule. Each row is one payment, split into interest and principal, with
          the remaining balance.
        </p>
        <p style={pStyle}>
          Early on, most of each payment goes to interest. As the balance drops, more goes to principal. You can use that to
          see how much interest you’ll pay in year one versus year five, how fast you’ll build equity on a home, and how much an
          extra payment would save.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can also use it as a sanity check. The balance should hit zero at the end, and total payments minus the original
          principal should equal total interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy and Limitations</h2>
        <p style={pStyle}>The calculator uses the standard method for APR, so the math is reliable, but a few things can make real life differ:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Variable rates, balloon payments and interest-only periods change the true APR, since the future payment structure isn’t fixed.</li>
          <li style={liStyle}>APR assumes you keep the loan to the end. Early payoff raises your effective cost.</li>
          <li style={liStyle}>Lenders classify some fees differently, so your calculated APR may not exactly match an official disclosure.</li>
          <li style={lastLi}>Credit cards are revolving and variable, so a fixed-term calculation won’t match them exactly.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Results are estimates for comparing and planning. They’re not a loan offer or financial advice, and your lender’s
          disclosed APR is the one that governs your agreement.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private and Easy to Use</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This APR calculator is free. Results show up instantly as you type, so you can tweak fees, rates and terms and
          compare scenarios right away. All it needs is loan details, never personal information like your name, address or
          Social Security number. Keep your inputs to the numbers and you’ve given it everything it needs.
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
