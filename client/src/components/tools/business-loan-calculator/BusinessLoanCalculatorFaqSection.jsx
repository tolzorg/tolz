import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate business loan payments?",
    a: "Use the amortization formula with your loan amount, the periodic interest rate and the number of payments, or just enter those details into the calculator above. You'll get your payment, total interest and APR right away.",
  },
  {
    q: "What's the difference between the interest rate and APR on a business loan?",
    a: "The interest rate is the cost of borrowing the principal. The APR also includes fees like origination and documentation charges, so it shows the true yearly cost of the loan.",
  },
  {
    q: "How do origination fees affect my loan?",
    a: "They usually come out of the money you receive, but your payments are still based on the full loan amount. That makes your effective rate higher than the stated rate.",
  },
  {
    q: "What's a typical origination fee for a business loan?",
    a: "It varies, but many lenders charge between 1% and 6% of the loan amount, and some charge a flat amount. Ask for it in writing, because it directly affects your APR.",
  },
  {
    q: "What's a good APR for a business loan?",
    a: "It depends on the loan type, your credit and the lender. Bank and SBA loans generally cost less than online lenders or merchant cash advances, which can cost far more. The best approach is to compare the APR on every offer you get.",
  },
  {
    q: "How does an interest-only business loan work?",
    a: "You pay only interest during the loan, so your payments are lower, but the full principal is due at the end. Use the interest-only option in the calculator to see your payment and total cost.",
  },
  {
    q: "What is a lump-sum or balloon repayment?",
    a: "It's a single payment, covering the principal and interest, due at the end of the loan. The calculator shows the amount you'd owe and what the loan costs overall.",
  },
  {
    q: "Can I use this as an SBA loan calculator?",
    a: "Yes. Enter the SBA loan's rate, term and fees (including the guarantee fee and any closing costs), and you'll get a solid estimate. Keep in mind that many SBA loans have variable rates, so your payment may change over time.",
  },
  {
    q: "Does the calculator work for startups?",
    a: "Yes. It works for startups and established businesses, whether you're financing equipment, working capital, expansion or real estate. Just enter the numbers from your quote.",
  },
  {
    q: "How do I convert a factor rate to an APR?",
    a: "Multiply the amount borrowed by the factor rate to get the total repayment, then enter that total, the amount you received and the repayment term. Short repayment periods can push the annual cost far above what the factor rate suggests.",
  },
  {
    q: "What's the difference between a business loan and a personal loan for business use?",
    a: "A business loan is made to your company, while a personal loan is made to you, so you're personally responsible for it. Personal loans often have smaller limits, and some lenders don't allow business use.",
  },
  {
    q: "How can I lower my business loan payment?",
    a: "Extend the term, negotiate a lower rate or fee, or borrow less. Just remember a longer term lowers your payment but raises your total interest, so check both numbers.",
  },
  {
    q: "Is the business loan calculator really free?",
    a: "Yes. It's free to use, with no charges and no signup.",
  },
];

// Structured data uses the supplied schema wording, which shortens several answers.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate business loan payments?":
    "Use the amortization formula with your loan amount, the periodic interest rate and the number of payments, or enter those details into the calculator. You'll get your payment, total interest and APR right away.",
  "What's a typical origination fee for a business loan?":
    "Many lenders charge between 1% and 6% of the loan amount, and some charge a flat amount. Ask for it in writing, because it directly affects your APR.",
  "What's a good APR for a business loan?":
    "It depends on the loan type, your credit and the lender. Bank and SBA loans generally cost less than online lenders or merchant cash advances. Compare the APR on every offer you get.",
  "How does an interest-only business loan work?":
    "You pay only interest during the loan, so your payments are lower, but the full principal is due at the end.",
  "What is a lump-sum or balloon repayment?":
    "It's a single payment, covering the principal and interest, due at the end of the loan.",
  "Can I use this as an SBA loan calculator?":
    "Yes. Enter the SBA loan's rate, term and fees, including the guarantee fee and closing costs, to get a solid estimate. Many SBA loans have variable rates, so your payment may change over time.",
  "Does the calculator work for startups?":
    "Yes. It works for startups and established businesses financing equipment, working capital, expansion or real estate.",
  "How do I convert a factor rate to an APR?":
    "Multiply the amount borrowed by the factor rate to get the total repayment, then enter that total, the amount received and the repayment term. Short repayment periods can push the annual cost far above what the factor rate suggests.",
  "How can I lower my business loan payment?":
    "Extend the term, negotiate a lower rate or fee, or borrow less. A longer term lowers your payment but raises your total interest.",
};
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  FAQ_SCHEMA_OVERRIDES[item.q] ? { ...item, a: FAQ_SCHEMA_OVERRIDES[item.q] } : item
);

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
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};
const lastLi = { ...liStyle, marginBottom: 0 };

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

export default function BusinessLoanCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Business Loan Calculator Does</h2>
        <p style={pStyle}>
          A business loan is money you borrow for business purposes and pay back with interest. Most are repaid monthly,
          though some lenders want weekly or even daily payments, some only charge interest until the end, and a few want
          everything back in one shot at maturity.
        </p>
        <p style={pStyle}>The tool handles all of that. It gives you three numbers:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Your payment,</strong> which is what leaves your account each period.</li>
          <li style={liStyle}><strong>Total interest,</strong> which is what the loan costs you over its full life.</li>
          <li style={liStyle}>
            <strong>The real rate (APR),</strong> which rolls in origination, documentation and other fees so you can see what
            the money actually costs.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That last number matters most. Two loans can both say &quot;8%&quot; and still be very different deals once fees come
          into play. A calculator that only handles interest can&apos;t show you that. This one can, so it works as a business
          loan payment calculator and a business loan APR calculator at the same time.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Calculator</h2>
        <p style={pStyle}>It&apos;s simple, but a few inputs trip people up, so here&apos;s the walkthrough.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Loan amount.</strong> Enter the full amount you&apos;re borrowing, before any fees come out.</li>
          <li style={liStyle}>
            <strong>Interest rate.</strong> Use the stated annual rate from your quote or term sheet. If the loan has a variable
            rate, enter today&apos;s rate for now (more on that below).
          </li>
          <li style={liStyle}><strong>Term.</strong> Enter how long you&apos;ll be paying, in months or years.</li>
          <li style={liStyle}>
            <strong>Fees.</strong> Don&apos;t skip this part. Enter the origination fee, either as a percentage or a flat dollar
            amount, plus any documentation fee and other upfront costs the lender listed. If you&apos;re not sure what the fees
            are, ask the lender for a written fee schedule. A good lender will give you one without fuss.
          </li>
          <li style={liStyle}><strong>Repayment type.</strong> Choose regular payments, interest-only, or a single lump-sum payment at the end.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hit calculate and compare the results. Then change one thing at a time. Try a shorter term, a lower fee, a smaller
          loan. Seeing which change saves you the most is the best part of using a calculator like this.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Business Loan Payments Are Calculated</h2>
        <p style={pStyle}>
          For a standard loan where you pay down the balance over time, each payment covers that period&apos;s interest plus a
          chunk of principal. The math looks like this:
        </p>
        <div style={formulaStyle}>Payment = P × r ÷ (1 − (1 + r)^−n)</div>
        <p style={pStyle}>
          P is the amount you borrow, r is the interest rate per payment period (the annual rate divided by the number of
          payments per year), and n is the total number of payments.
        </p>
        <p style={pStyle}>
          Here&apos;s a real example. Say you borrow $100,000 at 8% for five years with monthly payments. Your payment comes out
          to about $2,028. Over 60 payments you&apos;ll pay back roughly $121,658, which means about $21,658 of that is
          interest.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing most people don&apos;t realize is that early payments are mostly interest. In month one of that loan,
          about $667 of your $2,028 goes to interest and only around $1,361 chips away at the balance. By the final year it
          flips. That&apos;s why paying extra early in the term saves you more than paying extra near the end.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business Loan Fees (and Why They Matter)</h2>
        <p style={pStyle}>
          Most business loans come with fees on top of interest. Lenders charge them to cover underwriting, paperwork and the
          cost of closing the loan. Here are the ones you&apos;ll see most often.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Origination fee.</strong> This covers processing and approving your application, including verifying your
            information. Some lenders charge a flat amount, but it&apos;s usually a percentage of the loan, commonly somewhere
            between 1% and 6%. A lot of the time it&apos;s taken out of the money you receive, so you borrow $100,000 but only
            get, say, $97,000.
          </li>
          <li style={liStyle}>
            <strong>Documentation fee.</strong> A charge for preparing and processing the loan paperwork. It&apos;s usually a
            smaller flat amount, but it still counts.
          </li>
          <li style={liStyle}>
            <strong>Application fee.</strong> Some lenders charge this upfront just to review your application, whether or not
            you get approved.
          </li>
        </ul>
        <p style={pStyle}>Then there are fees that can show up during or at the end of the loan:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Monthly administrative or servicing fees</li>
          <li style={liStyle}>Annual fees</li>
          <li style={liStyle}>Processing fees</li>
          <li style={liStyle}>Late payment fees</li>
          <li style={liStyle}>Wire transfer fees</li>
          <li style={liStyle}>Referral fees</li>
          <li style={liStyle}>Prepayment penalties</li>
        </ul>
        <p style={pStyle}>
          Not every lender charges all of these, and some only apply in certain situations. You won&apos;t pay a late fee if
          you pay on time, and a prepayment penalty only kicks in if you pay the loan off early. But you should know which ones
          are in your contract before you sign.
        </p>

        <h3 style={h3Style}>How Fees Change Your Real APR</h3>
        <p style={pStyle}>
          The interest rate tells you what the money costs. The APR tells you what the loan costs. Fees are the difference.
        </p>
        <p style={pStyle}>
          Let&apos;s go back to the $100,000, 8%, five-year loan. Suppose the lender charges a 3% origination fee ($3,000) and a
          $500 documentation fee. You&apos;d receive $96,500, but your payments are still based on the full $100,000, so
          you&apos;re still paying about $2,028 a month for 60 months. Run that through an APR calculation and the real rate
          comes out around 9.5%, not 8%.
        </p>
        <p style={pStyle}>
          Now here&apos;s the part people miss: the same fee hurts a lot more on a short loan. Take that same $100,000 at 8% with
          just a 3% origination fee, but over one year instead of five. The real APR jumps to roughly 14%. On the five-year
          loan, the same fee works out to around 9.3%. The fee is identical, but it&apos;s spread over a much shorter time, so
          each month of borrowing carries a bigger share of it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That&apos;s why you should compare loans by APR, not by the rate on the first page of the quote. A loan with a lower
          rate and heavy fees can easily cost more than a loan with a slightly higher rate and almost no fees.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Repayment Types Explained</h2>

        <h3 style={{ ...h3Style, marginTop: 0 }}>Regular (amortizing) payments</h3>
        <p style={pStyle}>
          You make equal payments, and each one covers interest plus some principal until the balance hits zero. It&apos;s the
          most common setup and usually the cheapest in total interest, since the balance goes down every month. It fits
          equipment purchases, expansion projects and most standard term loans.
        </p>

        <h3 style={h3Style}>Interest-only payments</h3>
        <p style={pStyle}>
          With an interest-only loan, you pay just the interest each period, and the whole principal is due when the loan
          matures. On that same $100,000 at 8%, you&apos;d pay about $667 a month instead of $2,028. That&apos;s a big
          cash-flow break, and it can make sense if you expect income to rise later, like a seasonal business or a project
          that won&apos;t earn anything until it&apos;s finished.
        </p>
        <p style={pStyle}>
          The catch is that you owe the full $100,000 at the end. You&apos;ll either need to pay it all off, refinance, or get
          approved for a new loan, and approval isn&apos;t guaranteed. So interest-only is really a bet on your future cash
          flow. Use the calculator to see the total interest and the real APR before you take that bet.
        </p>

        <h3 style={h3Style}>Lump-sum repayment</h3>
        <p style={pStyle}>
          Everything gets paid back in one payment at maturity. It shows up most with short-term loans and bridge financing.
          Because you&apos;re not paying anything down along the way, you owe interest on the full amount for the whole term,
          so the total cost can be higher than you&apos;d expect. Entering a lump-sum scenario shows you the exact amount
          that&apos;ll be due and what it really costs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you&apos;re torn between the three, remember the tradeoff: lower payments now usually mean more total interest,
          or more risk later.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Business Loans You Can Model</h2>
        <p style={pStyle}>
          The calculator works for just about any term loan, as long as you have the rate, term and fees. Here&apos;s what each
          common type looks like, since the type affects both your rate and your fees.
        </p>

        <h3 style={h3Style}>SBA loans</h3>
        <p style={pStyle}>
          SBA loans are guaranteed by the U.S. Small Business Administration, but the government doesn&apos;t actually lend the
          money. Banks, community lenders and other financial institutions do. The SBA backs a big portion of the loan
          (roughly 75% to 90%, depending on the program), which lowers the lender&apos;s risk and makes them more willing to
          approve businesses that might not qualify for a regular bank loan.
        </p>
        <p style={pStyle}>
          SBA loans can be used for a wide range of things, such as starting a business, buying one, working capital, real
          estate, franchise financing, refinancing debt, improvements and renovations.
        </p>
        <p style={pStyle}>
          The tradeoffs are more paperwork, extra fees, slower approval, and tighter rules about how you can use the money.
          Loan caps can also be too low for bigger projects.
        </p>
        <p style={pStyle}>There are four main SBA loan types:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>7(a) loans.</strong> This is the SBA&apos;s main program, and when people say &quot;SBA loan,&quot; this is
            usually what they mean. You can borrow up to $5 million. Terms run up to 10 years for working capital and
            equipment, and up to 25 years when the money is used for real estate. You can use it for working capital,
            equipment, land, buildings or refinancing debt.
          </li>
          <li style={liStyle}>
            <strong>Microloans.</strong> These are aimed at new or growing small businesses. You can borrow up to $50,000,
            though the average is far smaller, and the longest term is six years. They cover most of the same uses as a 7(a)
            loan, but you generally can&apos;t use them to pay off existing debt or buy real estate.
          </li>
          <li style={liStyle}>
            <strong>CDC/504 loans.</strong> These are for long-term, fixed-rate financing of real estate or major equipment.
            They can&apos;t be used for working capital or inventory. The SBA portion can go up to $5 million, or $5.5 million
            for certain manufacturing and energy projects, with terms of 10, 20 or 25 years.
          </li>
          <li style={liStyle}>
            <strong>Disaster loans.</strong> If a declared disaster damages or destroys your business property, equipment or
            inventory, you may qualify for a disaster loan of up to $2 million. These cover things like storms, floods, fires
            and earthquakes.
          </li>
        </ul>
        <p style={pStyle}>
          If you&apos;re running the numbers on an SBA loan, add the SBA guarantee fee and any packaging or closing fees into the
          fee field so your APR reflects the real cost. Many SBA 7(a) loans also carry variable rates tied to the prime rate,
          which we&apos;ll cover below.
        </p>

        <h3 style={h3Style}>Conventional business loans</h3>
        <p style={pStyle}>
          These come from banks and other financial institutions without a government guarantee. Because the lender takes on
          all the risk, you&apos;ll typically see higher rates and shorter terms than with SBA loans. If your credit is shaky or
          your business is young, an SBA loan may be easier to get. On the flip side, if your credit is strong, a conventional
          loan can come with competitive rates, and the process is usually faster with fewer rules.
        </p>
        <p style={pStyle}>
          Banks offer conventional financing in several forms, including cash flow loans, asset-based financing, invoice
          financing, mezzanine financing and business cash advances.
        </p>

        <h3 style={h3Style}>Personal loans for business use</h3>
        <p style={pStyle}>
          Some new business owners, especially those without a track record, use a personal loan to avoid the higher rates on
          business loans. It can work, but there are downsides. You&apos;re personally on the hook, personal loan limits are
          usually smaller, and some lenders don&apos;t allow business use. Make sure the loan terms allow it before you borrow.
        </p>

        <h3 style={h3Style}>Merchant cash advances and factor-rate financing</h3>
        <p style={pStyle}>
          This one isn&apos;t on most lists, but it matters. Some online lenders and merchant cash advance providers don&apos;t
          quote an interest rate at all. They quote a factor rate, like 1.3. You multiply the amount borrowed by the factor to
          get what you&apos;ll repay.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So on $50,000 with a 1.3 factor, you&apos;d repay $65,000. That sounds like a flat 30% cost, but if you&apos;re repaying
          it daily or weekly over six months, the annualized cost is well over 100% APR. That&apos;s because you&apos;re paying
          back the balance quickly, so you only have the full amount for a short while. If you&apos;re looking at one of these
          offers, enter the repayment total and term into the calculator to see the true annual cost. It&apos;ll often be a
          shock.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You&apos;d Use a Business Loan Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Before you apply.</strong> Figure out what monthly payment your business can actually carry before you talk
            to a lender. If the number makes you wince now, you&apos;ll be glad you found out early.
          </li>
          <li style={liStyle}>
            <strong>Comparing offers.</strong> When you&apos;ve got two or three quotes with different rates, fees and terms,
            calculating the APR on each puts them side by side on equal terms. The lowest rate isn&apos;t always the cheapest
            loan.
          </li>
          <li style={liStyle}>
            <strong>Buying equipment or a vehicle.</strong> You can see whether the revenue from the equipment will cover the
            payment, and how long it&apos;ll take to pay for itself.
          </li>
          <li style={liStyle}>
            <strong>Expanding.</strong> A second location, a bigger team, a larger space. Model the payment against projected
            revenue, and run a conservative version too in case sales come in lower than you hope.
          </li>
          <li style={liStyle}>
            <strong>Smoothing out seasonal cash flow.</strong> Landscapers, retailers, farmers and tax preparers all deal with
            slow stretches. The calculator shows what an interest-only period costs you compared to regular payments.
          </li>
          <li style={liStyle}>
            <strong>Refinancing.</strong> Put your current loan next to a new offer, fees included, to see if switching really
            saves anything. Fees on the new loan can wipe out what you&apos;d save on interest.
          </li>
          <li style={lastLi}>
            <strong>Funding a startup.</strong> New businesses often face higher rates and heavier fees. Running the numbers
            early helps you decide how much to borrow and whether you can afford it.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Will You Be Able to Make the Payment? A Quick Reality Check</h2>
        <p style={pStyle}>
          Lenders don&apos;t just look at credit scores. They want to know your business brings in enough cash to cover the
          loan. One common measure is the debt service coverage ratio (DSCR), which is your yearly net operating income
          divided by your yearly debt payments.
        </p>
        <p style={pStyle}>
          For example, if your business has $150,000 in net operating income a year and your total loan payments come to
          $100,000 a year, your DSCR is 1.5. Many lenders want to see a DSCR of at least 1.25, though it varies by lender and
          loan type. That means you&apos;d have about $1.25 in income for every $1 owed.
        </p>
        <p style={pStyle}>
          Take the annual payment from the calculator, multiply it out, and compare it with your income. If you&apos;re coming
          in under 1.25, you may have trouble getting approved, or you may want to borrow less or stretch the term.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also keep in mind that lenders often ask for a personal guarantee, which means you&apos;re personally responsible if
          the business can&apos;t pay. They may also want collateral, such as equipment, real estate or inventory, and they may
          file a lien against business assets. That&apos;s not something a calculator can show you, but it&apos;s a real part of
          what you&apos;re agreeing to.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Moves Your Loan Cost</h2>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Loan term.</strong> A longer term lowers the payment but raises the total interest. A shorter term does the
            opposite. Try both and see which tradeoff suits you.
          </li>
          <li style={liStyle}>
            <strong>Interest rate.</strong> Small differences add up. On the $100,000 five-year loan above, going from 8% to 9%
            raises the payment by about $48 a month and adds roughly $2,900 in total interest.
          </li>
          <li style={liStyle}><strong>Fees.</strong> As we covered, fees hit shorter loans harder.</li>
          <li style={liStyle}><strong>Repayment structure.</strong> Interest-only and lump-sum loans change both your cash flow and your total cost.</li>
          <li style={liStyle}>
            <strong>Payment frequency.</strong> Weekly and daily payments are common with online lenders. They can strain cash
            flow more than a single monthly payment, even when the dollar amount looks small. If your payments are weekly, look
            at the total you&apos;ll pay each month, and confirm how the lender calculates the APR.
          </li>
          <li style={liStyle}>
            <strong>Fixed vs. variable rate.</strong> A calculator uses one rate for the whole term. If your loan has a variable
            rate, like many SBA 7(a) loans tied to prime, your actual payment can go up or down over time. A smart move is to
            run the numbers at today&apos;s rate, then run them again at a rate 1 to 2 points higher, so you know what your
            payment looks like if rates rise.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your credit profile, time in business, revenue, industry and collateral all affect what rate and fees you&apos;re
          offered. The calculator can&apos;t change those, but it can show you what a better offer would be worth.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Pay Less</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Negotiate the origination fee.</strong> Many lenders have wiggle room, especially on bigger loans. Even
            knocking a point off can save you hundreds or thousands.
          </li>
          <li style={liStyle}>
            <strong>Ask about prepayment penalties first.</strong> Paying early only saves money if the lender doesn&apos;t charge
            you for it. Some loans have a flat penalty, some have a declining one, and some have none at all.
          </li>
          <li style={liStyle}>
            <strong>Shorten the term if you can afford it.</strong> The payment goes up, but the total interest drops a lot.
          </li>
          <li style={liStyle}>
            <strong>Borrow only what you need.</strong> Padding the amount &quot;just in case&quot; means paying interest on money
            you may not use.
          </li>
          <li style={liStyle}>
            <strong>Compare at least three offers on APR.</strong> Take each quote&apos;s rate, term and fees, and run them
            through the calculator.
          </li>
          <li style={lastLi}>
            <strong>Make extra payments toward principal.</strong> Early in the loan, they have the biggest effect. Confirm with
            your lender that the extra goes to principal and not to future interest.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Quick Checklist Before You Sign</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Do you have a written list of every fee, upfront and ongoing?</li>
          <li style={liStyle}>Is the rate fixed or variable?</li>
          <li style={liStyle}>Is there a prepayment penalty, and how is it calculated?</li>
          <li style={liStyle}>Are payments monthly, weekly or daily?</li>
          <li style={liStyle}>Is there a personal guarantee, and what collateral is required?</li>
          <li style={liStyle}>Does the final APR match what you calculated?</li>
          <li style={lastLi}>Will the loan&apos;s cost make sense against what the money will earn you?</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Note on Taxes</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In general, the interest on a business loan is deductible as a business expense, while the principal you repay is
          not. Origination and other loan costs are often spread out over the life of the loan instead of deducted all at
          once. There are limits and exceptions, so talk to your accountant about how it applies to your situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Calculator Free and Private?</h2>
        <p style={pStyle}>
          Yes. The calculator is free, with no hidden charges and no account to create. You don&apos;t need to give your business
          name, tax ID or bank information. Just type in the loan numbers, and you&apos;ll get your results.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As for accuracy, the calculations follow standard amortization and APR methods. Still, the results are estimates for
          planning and comparing. A lender&apos;s final numbers can be slightly different because of how they round payments,
          count days in a month, or define their fees. Always check the figures in your actual loan agreement. This tool gives
          you information, not financial advice, and it&apos;s smart to run big borrowing decisions past an accountant or
          financial advisor.
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
