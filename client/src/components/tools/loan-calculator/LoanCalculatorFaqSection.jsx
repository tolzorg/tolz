import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this loan calculator free to use?",
    a: "Yes. It's completely free, with no signup, account, or hidden charges needed to see your results or the full schedule.",
  },
  {
    q: "Does it handle loans where interest compounds more often than I make payments?",
    a: "Yes. You can set compounding frequency and payment frequency independently, which matches how many real loans are structured.",
  },
  {
    q: "What is a deferred payment loan, and how is it different from a regular loan?",
    a: "A deferred payment loan has no scheduled payments. Interest compounds on the balance until the maturity date, when the full principal and accumulated interest are due in one payment.",
  },
  {
    q: "How does the bond present value calculation work?",
    a: "It takes the bond's face value, the time until maturity, and a discount rate, then calculates what that future amount is worth today by discounting it back over the remaining period.",
  },
  {
    q: "Can I see how much of each payment goes toward interest versus principal?",
    a: "Yes. The schedule shows the interest portion, principal portion, and remaining balance for every payment period.",
  },
  {
    q: "Is my financial information stored?",
    a: "No. Calculations are processed in your session only, and no loan or personal details are saved on a server.",
  },
  {
    q: "Why does changing the compounding frequency change my total interest?",
    a: "More frequent compounding means interest is added to the balance more often, so you're charged interest on a larger amount over time, even when the nominal annual rate stays the same.",
  },
  {
    q: "Can this help me decide whether to refinance?",
    a: "Yes. Check the remaining balance at a future period in the schedule and compare it with a new loan's terms to see whether refinancing would lower your total cost.",
  },
  {
    q: "What's the difference between a coupon bond and a zero-coupon bond?",
    a: "A coupon bond pays periodic interest based on a percentage of its face value, plus the face value at maturity. A zero-coupon bond pays no periodic interest. It's sold at a discount, and the return is the gap between the price and the face value. This calculator is built for the zero-coupon case.",
  },
  {
    q: "What's the difference between APR and APY?",
    a: "APR is typically used for loans and includes interest plus most fees. APY is typically used for deposit accounts and reflects the effect of compounding on earnings. They aren't directly comparable.",
  },
  {
    q: "Does a longer loan term always cost more?",
    a: "In total interest, yes. A longer term lowers each payment but gives interest more time to build. A shorter term raises the payment and reduces the total interest.",
  },
  {
    q: "Can I use this calculator for a mortgage or car loan?",
    a: "Yes, for the principal-and-interest portion of a fixed-rate loan. It doesn't include property taxes, insurance, closing costs, or other fees, so add those separately.",
  },
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
const cardStyle = { padding: "20px 20px" };
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

export default function LoanCalculatorFaqSection() {
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

      {/* What is a loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Loan?</h2>
        <p style={pStyle}>
          A loan is money that one party (the lender) gives to another (the borrower) with the understanding that it
          will be paid back, usually with interest, over an agreed period. The agreement spells out the amount
          borrowed, the interest rate, the repayment schedule, and what happens if payments are missed.
        </p>
        <p style={last}>
          Lenders can be banks, credit unions, online lenders, businesses, or even individuals. Borrowers can be
          people, companies, or governments. Interest is what the lender earns for taking on the risk that the money
          might not come back and for giving up the use of that money in the meantime.
        </p>
      </div>

      {/* Assets or liabilities */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Are Loans Assets or Liabilities?</h2>
        <p style={pStyle}>
          It depends on which side of the loan you're on. For the borrower, a loan is a liability, meaning a debt you
          owe. For the lender, the same loan is an asset, because it's money they expect to collect. Banks list the
          loans they've made as assets on their balance sheets.
        </p>
        <p style={last}>
          There's one detail that trips people up. When you borrow, the cash you receive is an asset, but the debt you
          owe is a liability of the same size, so your net worth doesn't change on day one. It changes afterward, as
          you pay interest and as the thing you bought gains value (like a home) or loses value (like a car).
        </p>
      </div>

      {/* Loan vs advance */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Difference Between a Loan and an Advance?</h2>
        <p style={pStyle}>Both put money in your hands before you would normally have it, but they work differently.</p>
        <p style={pStyle}>
          A <strong>loan</strong> is a set amount of money you repay over time, with interest, on a fixed schedule.
          Mortgages, auto loans, and personal loans all fit this description.
        </p>
        <p style={pStyle}>
          An <strong>advance</strong> is money paid ahead of something you're already expecting to receive or earn.
          Common examples are a paycheck advance from an employer, a cash advance on a credit card, or a merchant cash
          advance, where a business gets money upfront and repays it from future card sales. Advances are usually
          smaller and shorter, and the repayment often comes straight out of your next paycheck or daily sales rather
          than from a payment schedule. They can still be expensive. A merchant cash advance and a credit card cash
          advance both tend to cost far more than a standard loan once you add up the fees.
        </p>
        <p style={last}>
          In business accounting, an advance can also mean money a customer pays before receiving a product or service.
          In that case, it's a liability for the business until the work is delivered.
        </p>
      </div>

      {/* What the calculator does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Loan Calculator Does</h2>
        <p style={pStyle}>
          Most online loan calculators only cover the simplest case: a fixed monthly payment on an installment loan.
          This one goes further. You can set the compounding frequency (daily, monthly, quarterly, semi-annually, or
          annually) separately from the payment frequency, which matters because many loans compound interest more
          often than you actually make payments.
        </p>
        <p style={pStyle}>
          It also handles deferred payment loans, where nothing is due until a set maturity date, and it finds the
          present value of a zero-coupon bond from its face value, discount rate, and time to maturity. Each
          calculation produces a full schedule showing how the balance changes period by period, not just a single
          number.
        </p>
        <p style={last}>
          One thing to keep in mind: the calculator assumes a fixed interest rate and doesn't include taxes, insurance,
          closing costs, or other fees. For a mortgage or car loan, treat the result as the principal-and-interest part
          of your payment.
        </p>
      </div>

      {/* Three structures */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Three Loan Structures This Calculator Covers</h2>
        <p style={pStyle}>
          Almost every loan you'll run into falls into one of three structures. Knowing which one fits your situation
          tells you which calculation to run.
        </p>
        <p style={pStyle}>
          <strong>Amortized loans</strong> are what most people mean when they say "loan." Payments are fixed and made
          on a regular schedule, such as weekly, biweekly, or monthly. Each payment covers some interest and some
          principal, and the debt is fully paid off by the end of the term. Mortgages, auto loans, student loans, and
          most personal loans work this way. Because the payment stays the same while the split between interest and
          principal keeps shifting, you need a full schedule to see what's happening to the balance.
        </p>
        <p style={pStyle}>
          <strong>Deferred payment loans</strong> skip the regular payments. The principal and all the accrued interest
          are paid as a single lump sum at maturity. You'll see this in short-term business lending, bridge loans, and
          some private notes. Balloon loans mix the two ideas, with small payments during the term and one large
          payment at the end, but the calculation here covers loans where nothing is paid until the balance comes due.
        </p>
        <p style={pStyle}>
          <strong>Bonds</strong> work on a different principle. When you buy a bond, you're lending money to the issuer,
          who promises to pay the face value (also called par value) at maturity, assuming they don't default. What you
          pay today and what you receive at maturity are usually different numbers, and a present value calculation
          connects the two.
        </p>
        <p style={last}>
          There are two common types of bonds. Coupon bonds pay periodic interest, usually every six months or once a
          year, on top of returning the face value at maturity. Zero-coupon bonds pay no periodic interest. They're
          sold well below face value, and your return is the gap between the purchase price and the face value you
          collect at the end. This calculator is built for the zero-coupon case. Keep in mind that after a bond is
          issued, its market price moves with interest rates and market conditions, even though the amount paid at
          maturity stays fixed.
        </p>
      </div>

      {/* Amortized payment */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate an Amortized Loan Payment</h2>
        <p style={pStyle}>
          You need four inputs: the loan amount, the annual interest rate, the loan term, and the compounding and
          payment frequencies. Enter them, and the calculator uses the standard amortization formula to find the fixed
          payment that pays the loan off exactly on schedule.
        </p>
        <p style={pStyle}>
          Here's a quick example. A $10,000 loan at 8% for three years, with monthly compounding and monthly payments,
          comes to about $313.36 a month. Over 36 payments, you'd pay roughly $11,281 in total, which means about $1,281
          of that is interest.
        </p>
        <p style={last}>
          What makes this more useful than a basic calculator is that compounding frequency and payment frequency are
          separate settings. A loan might compound monthly while you pay biweekly, or compound daily while you pay
          quarterly. These mismatches change the effective interest you pay, and they show up in some auto loans,
          personal loans, and mortgage products. Setting each one on its own means the result matches your actual loan
          agreement instead of assuming both are the same.
        </p>
      </div>

      {/* Deferred */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Deferred Payment Loans Due at Maturity</h2>
        <p style={pStyle}>
          A deferred payment loan builds up interest over the whole term, and nothing is paid until the full balance
          (principal plus accumulated interest) comes due on one date. These show up in bridge financing, certain
          business loans, and short-term notes between private parties.
        </p>
        <p style={last}>
          To find the amount due, enter the original principal, the interest rate, the compounding frequency, and the
          length of the term. The calculator compounds the balance forward period by period to show exactly what
          you'll owe at maturity. That's very different from a simple interest estimate. The more often interest
          compounds, the faster the balance grows, so the maturity balance can end up well above the amount you
          borrowed. If you're considering a deferred or balloon loan, run the numbers before you sign.
        </p>
      </div>

      {/* Bond */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bond Present Value Calculation</h2>
        <p style={pStyle}>
          Given a bond's face value (the amount paid at maturity), what is it worth today? The answer depends on the
          discount rate, which is the return an investor requires, and on how much time is left until maturity. The
          calculator discounts the future face value back to today's dollars, accounting for compounding over the
          remaining period.
        </p>
        <p style={last}>
          This is useful if you're checking whether a bond is priced fairly, comparing bonds with different maturities,
          or working through a finance course. The discount rate has a big effect on the result, especially over long
          time frames, so try a few different rates instead of relying on one assumption.
        </p>
      </div>

      {/* Schedule */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Amortization Schedule</h2>
        <p style={pStyle}>
          After you run a calculation, the tool shows a full period-by-period schedule instead of just a payment
          amount. For amortized loans, each row breaks the payment into interest, principal, and the balance remaining
          afterward. Early in the loan, most of each payment goes to interest. As the balance drops, more of each
          payment goes to principal.
        </p>
        <p style={last}>
          That lets you answer practical questions: how much total interest you'll pay, what you'll still owe at any
          point if you're thinking about refinancing, and how much extra principal payments would save. For deferred
          loans, the schedule shows the balance compounding forward until maturity, so the final payoff amount isn't an
          unexplained lump sum.
        </p>
      </div>

      {/* Compounding vs payment */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compounding Frequency vs. Payment Frequency</h2>
        <p style={pStyle}>
          Compound interest is interest calculated on the original principal plus any interest that has already built
          up. Compounding frequency is how often that happens: daily, monthly, quarterly, or annually. Payment
          frequency is how often you actually pay. People often treat them as the same thing, but they're not.
        </p>
        <p style={pStyle}>
          On the same nominal rate and term, more frequent compounding means more total interest, because each period
          adds to the amount that future interest is calculated on. Most consumer loans compound monthly, but not all
          do, and over a long term the gap between daily and annual compounding can add up.
        </p>
        <p style={last}>
          When the two frequencies differ, the effective rate changes too. Say a loan compounds monthly but you pay
          quarterly. Interest compounds three times between payments, so the balance keeps growing until the payment
          lands. That's different from a loan with monthly compounding and monthly payments. The calculator handles
          this directly, so you don't have to approximate.
        </p>
      </div>

      {/* APR / APY */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Interest Rate, APR, and APY: Know the Difference</h2>
        <p style={pStyle}>
          The interest rate is the percentage a lender charges on the amount you borrow. Loans are usually advertised
          with an APR (annual percentage rate), which includes the interest rate plus most fees, such as origination
          fees. That makes APR a better way to compare the real cost of loans. Savings accounts, money market accounts,
          and CDs are usually advertised with an APY (annual percentage yield), which includes the effect of
          compounding on what you earn.
        </p>
        <p style={last}>
          Mixing them up leads to bad comparisons. A loan's APR and a savings account's APY measure different things,
          and two lenders may quote a plain interest rate and an APR that can't be compared directly. When you shop for
          a loan, compare APR to APR.
        </p>
      </div>

      {/* Term */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Loan Term and Total Cost</h2>
        <p style={pStyle}>
          The term is how long you have to repay the loan. A longer term lowers each payment, which helps monthly cash
          flow, but it also gives interest more time to build, so you pay more overall. A shorter term does the
          opposite: higher payments, less total interest.
        </p>
        <p style={last}>
          There's no single right answer. It depends on whether you need a lower payment now or a lower total cost over
          time. The easiest way to see the trade-off is to run both versions in the calculator and compare the totals.
        </p>
      </div>

      {/* What changes payment */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Changes Your Loan Payment</h2>
        <p style={pStyle}>A few variables decide what you'll actually pay.</p>
        <p style={pStyle}>
          <strong>Loan amount.</strong> The amount you borrow is just the starting point. Interest and fees push the
          total repaid above that figure.
        </p>
        <p style={pStyle}>
          <strong>Interest rate.</strong> The higher the rate, the more you pay back for the same loan. Your credit
          profile, whether you have a co-signer, and the lender's own requirements all affect the rate you're offered.
        </p>
        <p style={last}>
          <strong>Repayment period.</strong> This calculator assumes standard amortization with equal payments over a
          fixed term, which is how most conventional loans work. Graduated repayment plans (which start low and rise)
          and income-driven plans (tied to what you earn) use different math, so they won't match the results here.
        </p>
      </div>

      {/* Secured vs unsecured */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Secured vs. Unsecured Loans</h2>
        <p style={pStyle}>
          Consumer loans fall into two groups, depending on whether they're backed by collateral. This affects both your
          chances of approval and the rate you're offered.
        </p>
        <p style={pStyle}>
          A <strong>secured loan</strong> requires you to pledge an asset, and the lender places a lien on it, which is
          a legal right to take the asset if you default. Mortgages and auto loans are the usual examples. Because the
          collateral lowers the lender's risk, secured loans tend to be easier to get and come with lower rates. If the
          asset sells for less than you still owe, though, you can be responsible for the difference.
        </p>
        <p style={last}>
          An <strong>unsecured loan</strong> has no collateral, so the lender relies on your financial profile. Credit
          cards, most personal loans, and many student loans are unsecured. With nothing to seize, lenders usually
          charge higher rates, set lower limits, and offer shorter terms. They may ask for a co-signer, someone who
          agrees to repay you if you don't, if you're considered a higher risk. Falling behind can also lead to the debt
          being sent to a collection agency.
        </p>
      </div>

      {/* Five C's */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Lenders Evaluate Borrowers: The Five C's of Credit</h2>
        <p style={pStyle}>Lenders, especially for unsecured loans, tend to look at five things:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Character:</strong> your credit history, repayment record, work history, and income stability.
          </li>
          <li style={liStyle}>
            <strong>Capacity:</strong> your ability to repay, usually measured by your debt-to-income (DTI) ratio.
          </li>
          <li style={liStyle}>
            <strong>Capital:</strong> savings, investments, or a down payment that show you have a cushion.
          </li>
          <li style={liStyle}>
            <strong>Collateral:</strong> the asset pledged for a secured loan.
          </li>
          <li>
            <strong>Conditions:</strong> the loan's purpose, plus broader lending and economic conditions.
          </li>
        </ul>
      </div>

      {/* Before approving */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Lenders Do Before Approving a Loan in the US</h2>
        <p style={pStyle}>The exact process varies, but most lenders follow the same general steps.</p>
        <ol style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Application.</strong> You submit your details, the amount you want, and the purpose of the loan.
          </li>
          <li style={liStyle}>
            <strong>Identity check.</strong> Lenders are required to verify who you are, usually with a government ID and
            a Social Security number or ITIN.
          </li>
          <li style={liStyle}>
            <strong>Credit check.</strong> They review your credit reports and score. Many online lenders let you
            prequalify with a soft inquiry, which doesn't affect your score. A hard inquiry happens when you formally
            apply.
          </li>
          <li style={liStyle}>
            <strong>Income and employment verification.</strong> Expect to provide pay stubs, W-2s, tax returns, or bank
            statements.
          </li>
          <li style={liStyle}>
            <strong>Debt-to-income review.</strong> Lenders compare your monthly debt payments to your gross income. Many
            prefer a ratio below roughly 36% to 43%, depending on the loan type.
          </li>
          <li style={liStyle}>
            <strong>Collateral review.</strong> For secured loans, an appraisal or inspection confirms the asset is worth
            enough to back the loan.
          </li>
          <li style={liStyle}>
            <strong>Underwriting and decision.</strong> An underwriter, or an automated system, weighs everything and
            approves, declines, or counters with different terms.
          </li>
          <li>
            <strong>Disclosures and closing.</strong> Federal law requires lenders to show you the APR, finance charges,
            and total cost before you commit. Once you sign, the money is sent to you or to the seller.
          </li>
        </ol>
      </div>

      {/* Best way to get a loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Best Way to Get a Loan in the US?</h2>
        <p style={pStyle}>
          The best way is to match the loan to what you need, then compare offers before you accept one. Start by
          checking your credit reports and score so you know where you stand. You can get free reports from all three
          credit bureaus at AnnualCreditReport.com. Next, decide how much you really need and what monthly payment you
          can handle. Then prequalify with several lenders. Prequalification uses a soft credit check, so it won't hurt
          your score, and it shows you estimated rates side by side. Compare the APR, fees, and term, not just the
          monthly payment, and apply with the lender that gives you the best overall deal.
        </p>
        <p style={pStyle}>
          <strong>Where to look.</strong> Credit unions are worth checking first. Federal credit unions generally cap
          their rates at 18% on most loans, and they're often more flexible with borrowers whose credit isn't perfect.
          Banks are a good choice if you already have an account, since existing customers sometimes get rate discounts
          or a faster process. Online lenders tend to be quick and convenient, and many let you compare offers in
          minutes.
        </p>
        <p style={pStyle}>
          <strong>What is the fastest place to get a loan?</strong> Online lenders are usually the fastest for personal
          loans. Many give a decision within minutes, and some send the money the same day or the next business day once
          you're approved. Your own bank can also be quick, particularly if you've been a customer for a while. Payday
          lenders and title lenders are fast too, but they charge very high rates, so they should be a last resort.
        </p>
        <p style={pStyle}>
          <strong>Which is the best loan provider in the US?</strong> There isn't one best lender for everyone. The
          right choice depends on your credit score, the loan type, the amount, and how fast you need the money. A
          borrower with excellent credit will probably get the lowest rate from a credit union or a large bank. Someone
          with fair credit may do better with an online lender. Rankings change often, so use prequalification to
          compare real offers instead of trusting a single list.
        </p>
        <p style={pStyle}>
          <strong>How can I get a bank loan?</strong> Walk into a branch or apply online. You'll need a government ID,
          your Social Security number, proof of income, and your address. If you already have a checking or savings
          account with the bank, mention it. Relationship customers sometimes qualify for lower rates, and the bank can
          already see your deposit history. The bank will run a credit check, verify your income, and either approve
          you, decline, or offer different terms. Most loans from banks and credit unions are decided within a few days,
          though mortgages take longer.
        </p>
        <p style={last}>
          <strong>Which bank is best for an instant personal loan?</strong> Instant approvals usually come from lenders
          with fully automated applications. Some large banks and many online lenders can approve you in minutes and
          deposit funds within one to two business days. Since offers vary by credit profile and change over time,
          check a few lenders through prequalification, and look closely at origination fees, which can take 1% to 10%
          off the amount you receive.
        </p>
      </div>

      {/* Personal loans */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Personal Loans: Requirements, Uses, and What to Know First</h2>
        <p style={pStyle}>
          A personal loan is an unsecured installment loan you repay in fixed monthly payments, typically over two to
          seven years. It's one of the most flexible loan types, so the questions people ask about it are worth
          answering in detail.
        </p>
        <h3 style={h3Style}>What are the requirements for a personal loan?</h3>
        <p style={pStyle}>
          Most lenders ask for proof of identity, a Social Security number or ITIN, proof of income, a bank account, and
          a U.S. address. They also check your credit and your debt-to-income ratio. Minimum credit scores vary. Some
          lenders go as low as the 500s or 600s, while the best rates are usually reserved for scores of about 720 and
          up.
        </p>
        <h3 style={h3Style}>What is the minimum salary to get a personal loan?</h3>
        <p style={pStyle}>
          There's no national minimum. Each lender sets its own, and many have an income floor somewhere between $10,000
          and $30,000 a year, while others don't set one at all. In practice, lenders care more about whether your
          income is steady and whether your debt payments leave room for a new one. A lower DTI helps more than a high
          salary on its own.
        </p>
        <h3 style={h3Style}>What are common reasons for personal loans?</h3>
        <p style={pStyle}>
          People use them for debt consolidation, home repairs, medical bills, moving costs, weddings, and unexpected
          expenses. Debt consolidation is among the most common, since swapping high-rate credit card balances for a
          lower-rate loan can cut interest costs. Lenders may restrict some uses, such as paying for college tuition or
          starting a business.
        </p>
        <h3 style={h3Style}>What are the benefits of a personal loan?</h3>
        <p style={pStyle}>
          The rate is fixed, so your payment doesn't change. You know the payoff date up front. There's no collateral to
          put at risk, and funding is quick. Rates are usually lower than credit card rates for people with good credit.
          Making on-time payments can also build your credit history.
        </p>
        <h3 style={h3Style}>What should you know before taking one?</h3>
        <p style={last}>
          Check the APR and the origination fee, ask whether there's a prepayment penalty, and make sure the monthly
          payment fits your budget with room to spare. Borrow only what you need. Missing payments will hurt your credit,
          and unsecured debt can still lead to collections or a lawsuit. If you want to see the full cost, put the loan
          amount, rate, and term into the calculator above and look at the total interest.
        </p>
      </div>

      {/* Bad credit */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Can I Get a Personal Loan With Bad Credit?</h2>
        <p style={pStyle}>
          It's harder, but it's possible. Lenders that work with lower scores exist, and your options improve if you
          prepare first.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Check your credit reports for mistakes.</strong> Dispute anything that's wrong. Even one fixed error
            can raise your score.
          </li>
          <li style={liStyle}>
            <strong>Prequalify with soft checks.</strong> This lets you see which lenders will work with you without
            piling up hard inquiries.
          </li>
          <li style={liStyle}>
            <strong>Try credit unions.</strong> Many federal credit unions offer payday alternative loans (PALs) of up to
            $2,000 with much lower rates than payday lenders.
          </li>
          <li style={liStyle}>
            <strong>Add a co-signer or offer collateral.</strong> A co-signer with stronger credit, or a secured loan
            backed by a car or savings account, can lower your rate or improve your odds.
          </li>
          <li style={liStyle}>
            <strong>Lower your DTI.</strong> Paying down some debt or asking for a smaller amount can make approval more
            likely.
          </li>
          <li style={liStyle}>
            <strong>Watch for scams.</strong> A legitimate lender doesn't ask for an upfront fee before approving you,
            and it doesn't guarantee approval without checking your credit.
          </li>
          <li>
            <strong>Expect a higher rate if you're approved.</strong> Use the calculator to confirm you can afford the
            payment before you accept.
          </li>
        </ul>
        <p style={last}>
          <strong>How do I get approved despite a bad credit report?</strong> The steps above apply, and the biggest
          levers are usually income stability, a lower DTI, and a co-signer or collateral. Lenders can overlook a low
          score if your income is strong and your recent payment history is clean. If you're declined, ask the lender
          for the reason. You have the right to a notice explaining the decision, and it tells you what to fix before you
          reapply.
        </p>
      </div>

      {/* Credit card vs personal loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Are Credit Card Loans Better Than Personal Loans?</h2>
        <p style={pStyle}>
          For most big, planned expenses, personal loans are the better choice. They have a fixed rate, a fixed payment,
          and a payoff date. Credit cards usually have higher, variable rates, and the minimum payment can keep you in
          debt for years. A personal loan can also be used to pay off card balances at a lower rate.
        </p>
        <p style={last}>
          Credit cards can make sense for smaller purchases you'll pay off quickly, or when a card offers a 0%
          introductory rate and you can clear the balance before it ends. A cash advance on a card is different. It
          usually comes with a fee, a higher rate, and interest that starts right away, so it's one of the most expensive
          ways to borrow.
        </p>
      </div>

      {/* No salary slip */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can I Get a Personal Loan Without a Salary Slip or If I'm Not Salaried?</h2>
        <p style={pStyle}>
          Yes. Salary slips are just one way to prove income. If you're self-employed, freelance, or do gig work,
          lenders will usually accept other documents:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Your last one or two years of tax returns, including Schedule C and any 1099 forms
          </li>
          <li style={liStyle}>Three to twelve months of bank statements showing regular deposits</li>
          <li style={liStyle}>A profit and loss statement for your business</li>
          <li style={liStyle}>
            Letters or statements for Social Security, pension, disability, or alimony income
          </li>
          <li>An offer letter or employment contract if you've just started a new job</li>
        </ul>
        <p style={last}>
          Self-employed borrowers are often judged on net income after business expenses, which can be lower than gross
          earnings. A co-signer or a secured loan can help if your income is irregular. Some online lenders are more
          flexible with non-traditional income, so it's worth prequalifying with a few.
        </p>
      </div>

      {/* Payday loans */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Payday Loans: What They Are, How Fast They Are, and Whether They're Legal</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>What are payday loans?</h3>
        <p style={pStyle}>
          A payday loan is a small, short-term loan, often $500 or less, that's due on your next payday, typically in
          about two weeks. The lender may ask for a post-dated check or access to your bank account. The fee usually runs
          about $15 per $100 borrowed, which works out to an APR near 400%. If you can't repay on time, the loan is often
          rolled over with new fees, and the debt can snowball.
        </p>
        <h3 style={h3Style}>How quickly can I get approved?</h3>
        <p style={pStyle}>
          Very quickly. Storefront lenders can often hand you cash within minutes, and online lenders usually deposit
          funds the same day or by the next business day. They rarely check credit in a traditional way, which is part
          of why they're so easy to get and so expensive.
        </p>
        <h3 style={h3Style}>Are payday loans legal?</h3>
        <p style={pStyle}>
          It depends on the state. They're legal in many states, but roughly 18 states and Washington, D.C. ban them or
          cap rates at 36% APR or lower, which effectively shuts them down. Federally, the CFPB's 2017 payday rule is
          still in place in part. Its limits on repeated debit attempts remain, but the requirement that lenders check
          your ability to repay was rolled back, and the agency has said it plans to revisit the rest. Active-duty
          service members and their families are protected by the Military Lending Act, which caps most consumer loans
          at 36% APR. Check your own state's rules, and see the{" "}
          <Ext href="https://www.consumerfinance.gov/consumer-tools/payday-loans/">CFPB's guide to payday loans</Ext>{" "}
          before you borrow.
        </p>
        <p style={last}>
          If you need quick cash, look at alternatives first: a credit union PAL, a small personal loan, an employer
          paycheck advance, a payment plan with the company you owe, or local assistance programs.
        </p>
      </div>

      {/* Can't pay */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If You Can't Pay Off a Personal Loan?</h2>
        <p style={pStyle}>The consequences build up in stages:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Late fees and calls.</strong> The lender charges a fee and starts contacting you, usually right after
            a missed due date.
          </li>
          <li style={liStyle}>
            <strong>Credit damage.</strong> A payment more than 30 days late is typically reported to the credit bureaus
            and can lower your score noticeably. The late payment stays on your report for up to seven years.
          </li>
          <li style={liStyle}>
            <strong>Collections.</strong> After a few months of non-payment, the lender may charge off the loan and sell
            it or hand it to a collection agency.
          </li>
          <li style={liStyle}>
            <strong>Lawsuit and judgment.</strong> A lender or collector can sue. If they win, they may be able to
            garnish wages or freeze a bank account, depending on state law.
          </li>
          <li>
            <strong>Taxes.</strong> If a lender forgives part of the debt, the forgiven amount may count as taxable
            income.
          </li>
        </ol>
        <p style={last}>
          In the US, you can't be jailed just for owing money. But don't wait. Call the lender before you miss a
          payment. Many offer hardship plans, a lower payment, or a new due date. A nonprofit credit counseling agency
          can also set up a debt management plan at little or no cost.
        </p>
      </div>

      {/* Another country */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Get a Loan From Another Country?</h2>
        <p style={pStyle}>
          Yes, but it's not simple. A U.S. resident can borrow from a foreign bank or lender, but cross-border lending
          involves currency risk, different laws, and tax reporting requirements. Most foreign banks want you to have a
          local presence, such as an account, residency, or income in that country. If you're a U.S. taxpayer with
          foreign accounts, you may need to report them to the IRS.
        </p>
        <p style={last}>
          The reverse is also common. Non-citizens living in the U.S. can often get loans from U.S. lenders if they have
          a Social Security number or ITIN, a steady income, and a credit history. Some lenders and community banks
          specialize in lending to immigrants and don't require a Social Security number.
        </p>
      </div>

      {/* Leave the country */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If You Take Out a Large Loan and Leave the Country Forever?</h2>
        <p style={pStyle}>
          The debt doesn't go away. The loan agreement stays in force wherever you live. The lender will report missed
          payments, which will destroy your U.S. credit, then send the account to collections, and may sue you. A court
          judgment can be enforced against any assets you still have in the U.S., and in some cases a lender can try to
          enforce it abroad, though that depends on the laws and treaties of the country where you live. Cosigners are
          fully responsible for the debt if you disappear, and secured loans mean the lender can take the collateral.
        </p>
        <p style={last}>
          There's a legal risk beyond unpaid debt. If you took the loan with the plan not to repay it, or you lied on the
          application, that can be treated as fraud, which is a crime. Federal student loan debt can also follow you
          overseas, with penalties and collection through the Treasury. The practical result is a damaged credit record,
          possible legal action, and a long-term problem if you ever want to return, travel, or apply for credit again.
          If your plans have changed, talk to the lender before you move. Many will work out a payment plan, and that's
          much better than defaulting.
        </p>
      </div>

      {/* Prenup */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Marriage, a Prenup, and a Home Loan: What Should You Do?</h2>
        <p style={pStyle}>
          Suppose a partner wants to marry so they can use your income to qualify for a mortgage, and asks you to sign a
          prenuptial agreement. That deserves a careful look before you agree to anything.
        </p>
        <p style={pStyle}>
          A prenup isn't a bad sign on its own. It's a legal contract that spells out who owns what and who owes what if
          the marriage ends, and plenty of healthy couples use one. The concern here is the reason for the marriage. If
          the main goal is to get a loan, you could end up co-signing a mortgage that you're fully responsible for, and
          the prenup might be worded so that you carry the risk while your partner keeps the benefits.
        </p>
        <p style={last}>
          <strong>Before you sign:</strong> hire your own attorney, not one shared with your partner, and have them read
          every line. Ask exactly what you'd owe, what you'd own, and what happens to the house in a divorce. Learn how
          your state treats property and debt, since community property states handle this differently from the rest.
          Don't sign if you feel rushed, and don't co-sign a mortgage you can't afford on your own. Marrying someone
          doesn't automatically make you liable for their earlier debts in most states, but signing the mortgage does
          make you liable for that loan. If the relationship is solid, a reasonable partner will give you time to get
          proper legal advice.
        </p>
      </div>

      {/* Business loans */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do Business Loans Work?</h2>
        <p style={pStyle}>
          A business loan gives a company money upfront in exchange for repayment with interest. Lenders look at the
          business's revenue, time in operation, cash flow, and credit, along with the owner's personal credit. Terms
          vary widely. A term loan is repaid in fixed installments, a line of credit lets you borrow and repay as needed,
          and equipment financing uses the equipment itself as collateral. Many small business loans also require a
          personal guarantee, which makes you personally responsible if the business can't pay.
        </p>
        <p style={last}>
          Use the amortization option in the calculator to estimate payments on a term loan. For a loan with a balloon or
          lump-sum payoff, use the deferred option.
        </p>
      </div>

      {/* Small business loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Get a Small Business Loan in the United States?</h2>
        <p style={pStyle}>
          Start with your paperwork. Lenders usually want a business plan or a clear description of what the money is
          for, financial statements, tax returns for the business and for you, bank statements, and a list of any debts
          you already have. Startups with no history will lean harder on personal credit and projections.
        </p>
        <p style={pStyle}>Then choose where to apply:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Banks and credit unions</strong> offer the lowest rates but have the strictest requirements.
          </li>
          <li style={liStyle}>
            <strong>SBA-backed loans</strong> are issued by participating lenders, with part of the loan guaranteed by
            the U.S. Small Business Administration. That guarantee makes lenders more willing to say yes. The SBA's 7(a)
            program is the most common, with loans up to $5 million, and its microloan program offers up to $50,000 for
            smaller needs.
          </li>
          <li style={liStyle}>
            <strong>Online lenders</strong> are faster and more flexible, but often charge higher rates.
          </li>
          <li>
            <strong>Nonprofit lenders and CDFIs</strong> (community development financial institutions) focus on
            underserved owners and can be a good fit if banks turn you down.
          </li>
        </ul>
        <p style={last}>
          <strong>What is the best resource for small business loans?</strong> The{" "}
          <Ext href="https://www.sba.gov/funding-programs/loans">U.S. Small Business Administration</Ext> is the best
          place to start. It explains each loan program and helps you find lenders. Free local help is also available
          through SCORE mentors and Small Business Development Centers, which can help you prepare an application.
        </p>
      </div>

      {/* Start a business with a loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It a Good Idea to Start a Business With a Bank Loan?</h2>
        <p style={pStyle}>
          Sometimes, but it carries real risk. A loan lets you start without giving up ownership, and you keep all the
          profit. The downside is that payments are due whether or not the business is making money, and a personal
          guarantee or collateral can put your savings or home at stake. Banks also rarely fund a brand-new business
          with no track record, so startups often need strong personal credit, collateral, or an SBA-backed loan.
        </p>
        <p style={last}>
          Before borrowing, estimate how long it will take to turn a profit, make sure you can cover payments from other
          income during that time, and borrow as little as you can. Many owners start small with savings, a microloan,
          or a business credit card, then take on larger financing once there's revenue.
        </p>
      </div>

      {/* Business bad credit */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>
          Can Someone With Bad Personal Credit Get a Business Loan? What Are Business Loans for Bad Credit?
        </h2>
        <p style={pStyle}>
          Yes, though options are narrower and costs are higher. For small businesses, lenders usually check the
          owner's personal credit, so a low score matters. Options to consider include:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            SBA microloans and nonprofit or CDFI lenders, which often weigh the whole picture and not only the score
          </li>
          <li style={liStyle}>Equipment financing, where the equipment secures the loan</li>
          <li style={liStyle}>Invoice financing, where you borrow against unpaid customer invoices</li>
          <li style={liStyle}>Online term loans or lines of credit from lenders with lower score requirements</li>
          <li>A co-signer, collateral, or a larger down payment to reduce the lender's risk</li>
        </ul>
        <p style={last}>
          Be careful with merchant cash advances. They're easy to get, but the effective cost can be extremely high and
          the daily or weekly repayments can strain cash flow. If you can, spend a few months improving your credit
          first, paying down existing debt and fixing errors on your reports.
        </p>
      </div>

      {/* Home loan process */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Process of Applying for a Home Loan?</h2>
        <p style={pStyle}>In the US, a home loan and a mortgage are the same thing. The usual process looks like this:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Check your credit and budget.</strong> Know your score, your DTI, and how much you can put down.
          </li>
          <li style={liStyle}>
            <strong>Get preapproved.</strong> The lender reviews your finances and tells you how much you can likely
            borrow. A preapproval letter makes your offer stronger.
          </li>
          <li style={liStyle}>
            <strong>Find a home and make an offer.</strong>
          </li>
          <li style={liStyle}>
            <strong>Submit a full application.</strong> Within three business days, the lender must send you a Loan
            Estimate that shows the rate, monthly payment, and costs.
          </li>
          <li style={liStyle}>
            <strong>Lock your rate</strong> if you want to protect against increases while the loan is processed.
          </li>
          <li style={liStyle}>
            <strong>Underwriting and appraisal.</strong> The lender verifies your documents and orders an appraisal to
            confirm the home's value.
          </li>
          <li>
            <strong>Closing.</strong> You get a Closing Disclosure at least three business days before closing, review
            the final numbers, sign, and pay closing costs.
          </li>
        </ol>
        <p style={last}>The whole thing commonly takes 30 to 45 days from contract to closing.</p>
      </div>

      {/* When to apply */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When Can I Apply for a Home Loan?</h2>
        <p style={last}>
          You can get preapproved any time, and it's best to do so before you start house hunting. You'll submit the
          formal application after you have a signed purchase contract. Most lenders want to see steady employment for
          about two years, a reasonable DTI, and enough savings for the down payment and closing costs. Typical minimum
          credit scores are about 620 for a conventional loan and 580 for an FHA loan with 3.5% down (a score of 500 to
          579 may qualify with 10% down). VA and USDA loans have their own rules, and lenders often set their own score
          minimums. Avoid opening new credit or making big purchases between preapproval and closing, since that can
          change your approval.
        </p>
      </div>

      {/* Documents */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Documents Are Required for a Home Loan?</h2>
        <p style={pStyle}>Lenders usually ask for:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Government-issued photo ID and your Social Security number</li>
          <li style={liStyle}>Pay stubs from the last 30 days and W-2s from the last two years</li>
          <li style={liStyle}>Federal tax returns from the last two years</li>
          <li style={liStyle}>Bank and investment statements from the last two months</li>
          <li style={liStyle}>A list of your debts and monthly payments</li>
          <li style={liStyle}>A signed purchase contract once you've found a home</li>
          <li>Gift letters if a family member is helping with the down payment</li>
        </ul>
        <p style={last}>
          Self-employed borrowers typically add two years of business tax returns and a year-to-date profit and loss
          statement. Veterans applying for a VA loan will need a Certificate of Eligibility.
        </p>
      </div>

      {/* Charges */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Charges for Home Loan Processing?</h2>
        <p style={pStyle}>
          There's no single processing fee. Most costs fall under closing costs, which typically run about 2% to 5% of
          the loan amount. Common items include:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Origination or underwriting fee:</strong> often around 0.5% to 1% of the loan, or a flat fee. Some
            lenders charge a separate processing fee, commonly a few hundred dollars.
          </li>
          <li style={liStyle}>
            <strong>Appraisal:</strong> usually several hundred dollars.
          </li>
          <li style={liStyle}>
            <strong>Credit report fee:</strong> a small charge, often under $100.
          </li>
          <li>
            <strong>Title search and title insurance, recording fees, and attorney or escrow fees</strong>, which vary by
            state and county.
          </li>
        </ul>
        <p style={last}>
          Your Loan Estimate lists every charge, and you can compare it with estimates from other lenders. Some fees are
          negotiable, and lenders must keep certain fees from rising much between the estimate and closing.
        </p>
      </div>

      {/* Home loan vs mortgage vs LAP */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Difference Between a Home Loan, a Mortgage Loan, and a Loan Against Property?</h2>
        <p style={last}>
          In the US, "home loan" and "mortgage loan" mean the same thing: a loan used to buy a home, with the home as
          collateral. "Loan against property" is a term you'll see more outside the U.S. It means borrowing against
          property you already own. The closest US equivalents are a home equity loan (a lump sum with a fixed rate), a
          home equity line of credit (HELOC, a revolving line with a variable rate), and a cash-out refinance (a new,
          larger mortgage that replaces your old one, with the difference paid to you in cash). All of them use your
          home as collateral, so missing payments can lead to foreclosure.
        </p>
      </div>

      {/* IMF */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Does the IMF Give Loans, and Who Can Borrow?</h2>
        <p style={pStyle}>
          The International Monetary Fund lends to its member countries, not to individuals or companies. The IMF has
          191 members, which covers nearly every country. A country outside the IMF can't borrow from it unless it first
          joins.
        </p>
        <p style={pStyle}>
          Here's how a loan usually works. A member country in financial trouble, often because it can't pay for imports
          or service its foreign debt, asks for help. IMF staff negotiate a policy program with the government, and the
          Executive Board approves it. The money is then paid out in installments, with each release tied to progress on
          agreed reforms, which is known as conditionality. Interest is based on the IMF's own rate plus a margin, with
          surcharges for very large or long-running loans. Low-income countries can get concessional loans at very low
          or zero interest.
        </p>
        <p style={pStyle}>
          <strong>Is there a limit?</strong> Yes, though it isn't rigid. Access is measured against a country's IMF
          quota, which reflects its economic size. Under the current rules, a country can normally borrow up to 200% of
          its quota in a year and up to 600% cumulatively, and these limits will be adjusted when the 16th quota increase
          takes effect. Countries can go above these levels in exceptional cases, but the Board applies extra scrutiny.
        </p>
        <p style={pStyle}>
          <strong>Why would a country borrow from the IMF?</strong> Mostly because it needs financing during a crisis
          and can't get it from private markets at a reasonable price. IMF support gives time to fix problems without
          sudden spending cuts, and an IMF-backed program often reassures other lenders and investors. The trade-off is
          that the conditions can be politically difficult.
        </p>
        <p style={last}>
          <strong>Why does the IMF lend to developing countries?</strong> The IMF's job is to support global financial
          stability, and it does that by lending to any member with a balance of payments problem. Developing and
          low-income countries get a lot of attention because they have fewer options in a crisis, so the IMF offers
          them cheaper loans through special facilities. But the IMF also lends to wealthier countries. Greece, Ireland,
          and Portugal all borrowed during the euro area crisis.
        </p>
      </div>

      {/* Can't repay IMF/WB */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If a Country Can't Repay the IMF or the World Bank?</h2>
        <p style={pStyle}>
          A country can't be taken to court like a person, and neither institution can seize its assets. What they can
          do is cut off future money and spread the pain through the wider lending system.
        </p>
        <p style={pStyle}>
          Both are treated as preferred creditors, meaning governments are expected to repay them ahead of other
          lenders. This is why missed payments are rare.
        </p>
        <p style={pStyle}>
          <strong>If a country falls behind on the IMF</strong>, the Fund stops new lending, and it can escalate by
          formally declaring the country ineligible to use IMF resources, suspending its voting rights, and, as a last
          resort, requiring withdrawal. In practice, countries that fell behind, such as Sudan and Zimbabwe in the past,
          cleared their arrears with help from other countries and creditors so they could regain access.
        </p>
        <p style={last}>
          <strong>If a country can't pay the World Bank</strong>, the Bank typically suspends new disbursements once
          payments are overdue, and long-overdue loans are placed in non-accrual status. The Bank doesn't usually
          reschedule its own loans the way commercial lenders do. Instead, it works with the country to clear arrears,
          often with help from other lenders or donors. Its recovery strategy is mostly pressure and negotiation, plus
          the fact that being cut off from World Bank support usually triggers problems with other lenders too. For the
          poorest countries, debt relief programs have cancelled some loans.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need This Calculator: Practical Scenarios</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Comparing loan offers.</strong> Plug in each lender's terms to see the true monthly payment and total
            interest side by side, instead of relying on advertised numbers.
          </li>
          <li style={liStyle}>
            <strong>Checking a deferred or balloon loan.</strong> With nothing due until maturity, it's easy to
            underestimate how much the balance will grow. Know the number before you sign.
          </li>
          <li style={liStyle}>
            <strong>Evaluating a bond.</strong> Find out whether a bond's price makes sense given its face value, time to
            maturity, and the discount rate you require.
          </li>
          <li style={liStyle}>
            <strong>Planning an early payoff or refinance.</strong> Check the balance at a future period to see if
            refinancing would save money after closing costs.
          </li>
          <li>
            <strong>Studying finance.</strong> Verify manual calculations for time value of money, amortization, and bond
            valuation.
          </li>
        </ul>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Reliability</h2>
        <p style={last}>
          The calculator uses standard financial formulas for amortization, compound interest, and present value, the
          same ones found in finance textbooks and lending software. Calculations run in your browser, and no loan
          details or personal information are stored on a server. You don't need an account, and the tool is free with
          no usage limits. Since the schedule shows every period, you can check any result against your own math. The
          calculator gives estimates for planning, so confirm final numbers with your lender before making a financial
          decision.
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
