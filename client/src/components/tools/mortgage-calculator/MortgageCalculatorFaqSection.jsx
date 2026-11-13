import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a monthly mortgage payment calculated?",
    a: "The calculator uses your loan amount, interest rate, and term to find the principal-and-interest payment with the standard amortization formula. It then adds monthly costs for property taxes, homeowners insurance, PMI where it applies, and HOA fees.",
  },
  {
    q: "What is PITI?",
    a: "PITI stands for principal, interest, taxes, and insurance, the four parts that make up a full monthly mortgage payment when taxes and insurance are paid through escrow.",
  },
  {
    q: "Do I need to include PMI in my mortgage calculation?",
    a: "Yes, if you're putting down less than 20% on a conventional loan. You can usually ask to cancel PMI when your balance reaches 80% of the home's original value, and it ends automatically at 78%.",
  },
  {
    q: "How much can extra payments save on a mortgage?",
    a: "It depends on your balance, rate, and how much extra you pay. Because early payments go mostly to interest, even a modest extra amount each month can shorten the loan by years and cut total interest noticeably.",
  },
  {
    q: "What's the difference between biweekly and monthly payments?",
    a: "Monthly payments add up to 12 a year. Biweekly payments split the monthly amount in half and are paid every two weeks, which makes 26 half-payments, or the equivalent of 13 full payments. The extra payment goes to principal. Check that your servicer applies biweekly payments right away.",
  },
  {
    q: "What is a prepayment penalty?",
    a: "It's a fee some loans charge if you pay off the mortgage early. It isn't allowed on FHA, VA, or USDA loans, and on qualified mortgages it can only apply for the first three years, with a cap that shrinks each year.",
  },
  {
    q: "Is an adjustable-rate mortgage riskier than a fixed-rate mortgage?",
    a: "Yes, in that your payment can rise after the initial fixed period. ARMs usually start with a lower rate, so they can suit buyers who plan to move or refinance before the adjustments begin.",
  },
  {
    q: "What closing costs should I expect?",
    a: "Typically 2% to 5% of the purchase price. They include lender fees, appraisal, inspection, title services, recording fees, and prepaid taxes and insurance.",
  },
  {
    q: "What's a good mortgage rate right now?",
    a: "It's one that's below the current market average for someone with your credit and down payment. In early November 2026, the Freddie Mac weekly average for a 30-year fixed loan was around 7.2%. Compare Loan Estimates from at least three lenders.",
  },
  {
    q: "What credit score do I need for a mortgage?",
    a: "Conventional loans usually require at least 620. FHA loans allow 580 with 3.5% down, and as low as 500 with 10% down at some lenders. Higher scores get better rates.",
  },
  {
    q: "Can I pay my mortgage with a credit card?",
    a: "Most servicers don't accept credit cards. Third-party services will, but they charge fees that usually outweigh any rewards.",
  },
  {
    q: "What happens to a mortgage if the borrower dies?",
    a: "The loan stays in place. It's paid from the estate or by the heirs, and a lender generally can't demand full payment just because the owner died if the home passes to a relative who lives there. Contact the loan servicer and send a death certificate.",
  },
  {
    q: "Is mortgage interest tax deductible?",
    a: "If you itemize, you can generally deduct interest on up to $750,000 of mortgage debt. See IRS Publication 936 or ask a tax professional.",
  },
  {
    q: "Is this mortgage calculator free to use?",
    a: "Yes. It's free, needs no signup, and has no usage limits or hidden charges.",
  },
  {
    q: "Does this tool store my financial information?",
    a: "No. The numbers you enter are used only to generate your results and are not stored or shared.",
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
const firstH3 = { ...h3Style, marginTop: 0 };
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

export default function MortgageCalculatorFaqSection() {
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

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mortgage Calculator: Estimate Your Monthly Payment, PMI, and Payoff Timeline</h2>
        <p style={pStyle}>
          A mortgage is a loan used to buy a home, with the home itself serving as collateral. For most people it's the
          biggest debt they'll ever take on, so guessing at the monthly cost is a risky way to start.
        </p>
        <p style={last}>
          The Tolz mortgage calculator above adds up your principal, interest, property taxes, homeowners insurance,
          PMI, and HOA fees to give you one realistic monthly number. You can then test extra payments or a biweekly
          schedule to see how much sooner you'd pay off the loan and how much interest you'd skip. It also builds a full
          amortization schedule that shows how every payment splits between principal and interest.
        </p>
      </div>

      {/* What is a mortgage */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Mortgage, and How Does It Work?</h2>
        <p style={pStyle}>
          A mortgage is a loan secured by real estate. You borrow money from a lender to buy a home (or to borrow
          against one you already own), and you agree to repay it with interest over a set number of years. If you stop
          paying, the lender has the legal right to foreclose, which means selling the property to recover what you owe.
        </p>
        <p style={pStyle}>Here's how the process works in practice:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            You make a down payment, and the lender covers the rest of the purchase price. That remaining amount is your
            loan principal.
          </li>
          <li style={liStyle}>
            You repay the loan in equal monthly installments for the length of the term, usually 15 or 30 years.
          </li>
          <li style={liStyle}>
            In the early years, most of each payment goes to interest. Over time, more goes to principal, and your
            equity (the part of the home you actually own) grows.
          </li>
          <li>
            When the balance reaches zero, you own the home free and clear, and the lender releases its claim on the
            property.
          </li>
        </ul>
        <p style={pStyle}>
          Most lenders collect property taxes and homeowners insurance along with your monthly payment and hold them in
          an escrow account. When the bills come due, the lender pays them for you.
        </p>
        <h3 style={h3Style}>What's the difference between a loan and a mortgage?</h3>
        <p style={pStyle}>
          A mortgage is one specific kind of loan. A loan is any borrowed money you repay with interest, and it can be
          unsecured (like most credit cards and personal loans) or secured. A mortgage is always secured by real estate.
          That collateral is why mortgage rates are usually lower than rates on unsecured loans, and it's also why
          missing payments can cost you your home rather than just your credit score.
        </p>
        <h3 style={h3Style}>Mortgagor, mortgagee, and servicer: who is who?</h3>
        <p style={pStyle}>
          The terms can be confusing because they sound alike. The mortgagor is the borrower. The mortgagee is the
          lender. This trips up a lot of people, since it feels backwards, but the person who gives the mortgage to the
          lender is the mortgagor, and the lender who holds it is the mortgagee.
        </p>
        <p style={last}>
          In daily life you usually pay neither one directly. You pay your loan servicer, the company that collects
          payments, manages escrow, and answers questions. The servicer may be your original lender, or your loan may
          have been sold and transferred to a different company. If that happens, you'll get a notice telling you where
          to send payments. Always check that notice before sending money anywhere new.
        </p>
      </div>

      {/* Factors */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Factors That Determine Your Monthly Payment</h2>
        <p style={pStyle}>Three inputs do most of the work in setting your payment.</p>
        <p style={pStyle}>
          <strong>Home price and down payment</strong> set your loan principal. A bigger down payment lowers your
          monthly payment directly. It can also help you avoid private mortgage insurance, which is usually required
          when you put down less than 20%.
        </p>
        <p style={pStyle}>
          <strong>Loan term</strong> controls how fast you repay. A 15-year loan has a higher monthly payment than a
          30-year loan for the same amount, but it costs far less interest overall because the balance shrinks much
          faster. Terms of 20 and 25 years are also common, and a few lenders offer 40-year loans, though those are rare
          and cost more in total interest.
        </p>
        <p style={pStyle}>
          <strong>Interest rate</strong> is the price of borrowing, shown as a yearly percentage. A small difference
          adds up over decades. On a $300,000 loan, a rate of 7.25% instead of 6.25% means a payment about $200 higher
          every month. When you compare offers, look at the APR as well as the rate. The APR folds in certain lender
          fees, so it gives you a fairer side-by-side comparison.
        </p>
        <p style={pStyle}>Mortgages also come in two main styles.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>A <strong>fixed-rate mortgage</strong> keeps the same rate for the whole term.</li>
          <li>
            An <strong>adjustable-rate mortgage (ARM)</strong> keeps the rate fixed for a starting period, often 5, 7,
            or 10 years, then adjusts based on a market index, usually once or twice a year, within limits written into
            the loan.
          </li>
        </ul>
        <p style={pStyle}>
          ARMs often start with a lower rate than a fixed loan, but the gap changes with the market and sometimes nearly
          disappears. An ARM can make sense if you expect to sell or refinance before the adjustment period begins. It's
          riskier if you plan to stay.
        </p>
        <h3 style={h3Style}>How are mortgage interest rates calculated?</h3>
        <p style={pStyle}>
          Lenders build your rate in layers. They start with a baseline that follows the bond market, mainly the price
          of mortgage-backed securities, which tends to move with the 10-year Treasury yield. Then they add their own
          margin to cover costs and profit. Finally, they adjust for your risk: credit score, down payment, loan type,
          property type (a primary home costs less than a rental), and the loan term.
        </p>
        <p style={last}>
          Once your rate is set, interest is figured on your remaining balance. Divide your annual rate by 12 to get the
          monthly rate, then multiply it by the balance. That's why interest shrinks a little with each payment on a
          fixed-rate loan.
        </p>
      </div>

      {/* PITI */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding PITI: Principal, Interest, Taxes, and Insurance</h2>
        <p style={pStyle}>Lenders call a full monthly payment PITI: principal, interest, taxes, and insurance.</p>
        <p style={pStyle}>
          <strong>Principal</strong> is the part of your payment that reduces the loan balance. Early on it's a small
          share of each payment. As the balance falls, the split flips, which is the whole idea behind an amortization
          schedule.
        </p>
        <p style={pStyle}>
          <strong>Interest</strong> is charged on whatever balance remains. Your total payment stays flat on a
          fixed-rate loan, but the interest portion drops over time.
        </p>
        <p style={pStyle}>
          <strong>Property taxes</strong> are set by your local government and usually collected monthly through escrow.
          Across the U.S., the typical effective rate is around 1% of a home's value per year, but it ranges from well
          under 0.5% in some states to over 2% in others. That's why the calculator lets you enter your own number.
        </p>
        <p style={last}>
          <strong>Homeowners insurance</strong> covers the home against fire, storms, theft, and similar events. Lenders
          require it, and premiums depend on the home's value, location, and coverage. Like taxes, it's usually
          escrowed. If you live in a flood zone, you'll likely need separate flood insurance too.
        </p>
      </div>

      {/* PMI and HOA */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PMI and HOA Fees: The Costs Buyers Often Underestimate</h2>
        <p style={pStyle}>
          <strong>Private mortgage insurance (PMI)</strong> protects the lender, not you. It's usually required on
          conventional loans when your down payment is under 20%. The yearly cost typically runs from about 0.3% to 1.5%
          of the loan amount, depending on your credit score, down payment, and loan type. Divide that by 12 for the
          monthly cost.
        </p>
        <p style={pStyle}>
          PMI doesn't last forever on a conventional loan. You can ask to cancel it once your balance reaches 80% of the
          home's original value, as long as you're current on payments. Under federal law, it ends automatically when
          your balance is scheduled to reach 78%. FHA loans work differently: they charge a mortgage insurance premium
          (MIP) that, on most loans with less than 10% down, stays for the life of the loan unless you refinance.
        </p>
        <p style={last}>
          <strong>HOA fees</strong> apply to condos, townhomes, and many planned communities, and they cover shared
          maintenance and amenities. They aren't part of the loan, but they're a fixed monthly cost and lenders count
          them when deciding what you can afford. Dues commonly run a few hundred dollars a month and can be much higher
          in buildings with lots of amenities. Include them when comparing a condo against a single-family home, because
          the HOA can erase what looks like a price advantage.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Mortgage Payment Formula</h2>
        <p style={pStyle}>Here's the standard formula lenders use for a fixed monthly payment:</p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
          M = P × [ r(1 + r)ⁿ / ((1 + r)ⁿ − 1) ]
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}><strong>M:</strong> the monthly principal-and-interest payment</li>
          <li style={{ marginBottom: 6 }}><strong>P:</strong> the loan amount</li>
          <li style={{ marginBottom: 6 }}>
            <strong>r:</strong> the monthly interest rate (your annual rate divided by 12, so 5% becomes about 0.004167)
          </li>
          <li>
            <strong>n:</strong> the total number of payments (the term in years times 12, so a 30-year loan has 360)
          </li>
        </ul>
        <p style={last}>
          For example, a $300,000 loan at 7% for 30 years works out to about $1,996 a month in principal and interest.
          The formula covers only that part. Taxes, insurance, PMI, and HOA fees go on top, which the calculator handles
          for you.
        </p>
      </div>

      {/* Loan types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Different Types of Mortgage Loans?</h2>
        <p style={pStyle}>
          The right loan depends on your credit, your down payment, where the home is, and who you are as a borrower.
          These are the main options in the U.S.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Conventional loans</strong> aren't backed by the government. They're the most common type.
            Conforming loans stay within limits set by the Federal Housing Finance Agency (about $832,750 for most of the
            country in 2026) and can be sold to Fannie Mae or Freddie Mac. Loans above the limit are called jumbo loans
            and usually have stricter requirements.
          </li>
          <li style={liStyle}>
            <strong>FHA loans</strong> are insured by the Federal Housing Administration. They allow down payments as
            low as 3.5% with a credit score of 580 or higher, and they're popular with first-time buyers. The trade-off
            is mortgage insurance premiums.
          </li>
          <li style={liStyle}>
            <strong>VA loans</strong> are for eligible veterans, active-duty service members, and some surviving
            spouses. They often need no down payment and have no monthly mortgage insurance, though there's usually a
            one-time funding fee.
          </li>
          <li style={liStyle}>
            <strong>USDA loans</strong> help moderate- and low-income buyers purchase homes in eligible rural and
            suburban areas, often with no down payment.
          </li>
          <li style={liStyle}>
            <strong>Fixed-rate and adjustable-rate loans</strong> describe how the rate behaves, and they can apply to
            most of the types above.
          </li>
          <li style={liStyle}>
            <strong>Interest-only and balloon loans</strong> are less common. Interest-only loans let you pay only
            interest for a set period, and balloon loans leave a large payment due at the end. Both can be risky if you
            can't refinance or sell when the time comes.
          </li>
          <li style={liStyle}>
            <strong>Reverse mortgages (HECMs)</strong> let homeowners 62 and older borrow against their equity without
            making monthly payments. The loan is repaid when they sell, move out, or pass away.
          </li>
          <li style={liStyle}>
            <strong>Home equity loans and HELOCs</strong> let you borrow against equity in a home you already own. These
            are often called second mortgages.
          </li>
          <li>
            <strong>Construction loans</strong> fund building a new home, usually converting to a regular mortgage once
            it's finished.
          </li>
        </ul>
      </div>

      {/* Good rate */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Good Mortgage Rate?</h2>
        <p style={pStyle}>
          A good rate is one that's low compared with what's available today for someone with your credit and down
          payment. In early November 2026, Freddie Mac's weekly survey showed the average 30-year fixed rate at around
          7.2%. Averages move week to week, so check a current source before you set expectations.
        </p>
        <h3 style={h3Style}>Is 3.25%, 4%, or 5% a good rate?</h3>
        <p style={pStyle}>
          Any of those would be a very good rate today. Rates under 4% were common only in 2020 and 2021, when they hit
          record lows (the weekly average bottomed out near 2.65% in January 2021). A rate of 5% is also well below
          today's market. If you already have a loan at 3.25%, 4%, or 5%, think hard before refinancing, because you'd
          likely be giving up a cheaper loan for a pricier one.
        </p>
        <h3 style={h3Style}>What is a super low mortgage rate?</h3>
        <p style={pStyle}>
          There's no official cutoff, but people use the phrase for rates far below the long-term norm. The rates of
          2020 and 2021 are the best examples, and they were unusual. The average 30-year rate was above 7% through much
          of the 1990s and well above that in the 1980s. Don't build your budget around getting a rate like that again.
        </p>
        <h3 style={h3Style}>Who actually gets the lowest rate?</h3>
        <p style={pStyle}>The lowest advertised rates usually go to borrowers with the strongest profile:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>A credit score of about 740 or higher</li>
          <li style={liStyle}>A down payment of 20% or more</li>
          <li style={liStyle}>A low debt-to-income ratio</li>
          <li style={liStyle}>A primary residence (not a rental property)</li>
          <li style={liStyle}>A shorter term, such as 15 years</li>
          <li>A willingness to pay discount points up front</li>
        </ul>
        <p style={pStyle}>
          If you don't fit every box, you can still get a competitive rate. The advertised rate is often the best case,
          so ask for a personalized Loan Estimate.
        </p>
        <h3 style={h3Style}>How do you get the best mortgage rate?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Improve your credit first.</strong> Pay down credit card balances, fix any errors on your reports,
            and avoid opening new accounts before you apply.
          </li>
          <li style={liStyle}>
            <strong>Save a bigger down payment.</strong> More money down means less risk for the lender.
          </li>
          <li style={liStyle}>
            <strong>Shop at least three lenders.</strong> The Consumer Financial Protection Bureau has found that
            borrowers who compare multiple offers save thousands over the life of a loan. Do your rate shopping within a
            two-week window, so the credit inquiries count as one.
          </li>
          <li style={liStyle}>
            <strong>Compare Loan Estimates line by line</strong>, including APR, fees, and points, not just the headline
            rate.
          </li>
          <li style={liStyle}>
            <strong>Consider a shorter term</strong> if the higher payment fits your budget.
          </li>
          <li style={liStyle}>
            <strong>Ask about discount points</strong> and whether paying for them makes sense given how long you'll
            keep the loan.
          </li>
          <li>
            <strong>Lock your rate</strong> once you're happy with an offer, so a market jump doesn't change it before
            closing.
          </li>
        </ul>
        <h3 style={h3Style}>What are mortgage points?</h3>
        <p style={pStyle}>
          One point equals 1% of your loan amount. There are two kinds. Discount points are optional fees you pay up
          front to get a lower interest rate. Each point usually lowers the rate by roughly 0.25%, though it varies by
          lender and market. Origination points are fees the lender charges for creating the loan.
        </p>
        <p style={last}>
          To see if discount points are worth it, divide the cost of the points by the monthly savings. That tells you
          how many months it takes to break even. On a $300,000 loan, one point costs $3,000. If it saves you $50 a
          month, you'd break even in 60 months, or five years. If you expect to sell or refinance sooner than that, the
          points won't pay for themselves.
        </p>
      </div>

      {/* Income ratio */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Suggested Income Ratio for a Mortgage?</h2>
        <p style={pStyle}>
          A common guideline is the 28/36 rule. Your housing payment (PITI plus HOA) should stay at or under about 28%
          of your gross monthly income, and your total monthly debts, including the mortgage, car loans, student loans,
          and credit card minimums, should stay under about 36%.
        </p>
        <p style={pStyle}>
          That's a guideline, not a hard limit. Many lenders approve borrowers with a total debt-to-income ratio (DTI) of
          43%, and some loan programs go to 45% or 50% for borrowers with strong credit or savings. But being approved
          for a payment and being comfortable with it are two different things. If a payment leaves you with little room
          for savings, repairs, or surprises, a lower target is safer.
        </p>
        <p style={last}>
          For example, with a household income of $90,000 a year ($7,500 a month), 28% comes to about $2,100 for your
          full monthly housing payment.
        </p>
      </div>

      {/* How to apply */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Apply for a Mortgage in the U.S.</h2>
        <p style={pStyle}>
          The process is similar at most lenders, whether you're applying at a bank, credit union, online lender, or
          through a broker.
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Check your finances.</strong> Look at your credit reports (you can get them free at
            AnnualCreditReport.com), your savings for the down payment and closing costs, and your monthly debts.
          </li>
          <li style={liStyle}>
            <strong>Get preapproved.</strong> The lender reviews your income, assets, debts, and credit and tells you how
            much you can likely borrow. A preapproval letter shows sellers you're serious. Preapproval can often be done
            in a day or two.
          </li>
          <li style={liStyle}>
            <strong>Find a home and make an offer.</strong> Once the seller accepts, you're under contract.
          </li>
          <li style={liStyle}>
            <strong>Submit your full application.</strong> Within three business days, the lender must send you a Loan
            Estimate that spells out your rate, payment, and costs. This is the document to use when comparing lenders.
          </li>
          <li style={liStyle}>
            <strong>Send your documents.</strong> Expect to provide recent pay stubs, W-2s or tax returns (two years for
            most people), bank statements, ID, and your Social Security number. Self-employed borrowers usually need
            more.
          </li>
          <li style={liStyle}>
            <strong>Underwriting and appraisal.</strong> An underwriter checks your file, and an appraiser confirms the
            home is worth what you're paying. The lender may come back with follow-up requests.
          </li>
          <li>
            <strong>Close.</strong> At least three business days before closing, you'll get a Closing Disclosure showing
            the final numbers. Compare it with your Loan Estimate, then sign, pay your closing costs, and get the keys.
          </li>
        </ol>
        <h3 style={h3Style}>How long does a mortgage take to process?</h3>
        <p style={pStyle}>
          Most purchase loans close in about 30 to 45 days after the offer is accepted. Some close faster, and delays
          are common when the appraisal is backed up, the title search turns up a problem, or documents come in late.
          Responding to your lender's requests the same day is the easiest way to keep things moving.
        </p>
        <h3 style={h3Style}>How long does a bank take to verify property documents?</h3>
        <p style={pStyle}>
          There's no single timeline. The title search, which confirms the seller actually owns the property and that no
          unpaid liens or legal claims are attached, usually takes a few days to two weeks. The appraisal often takes one
          to two weeks to schedule and complete, longer in busy markets. If the title company finds an issue, such as an
          old lien or a missing signature, resolving it can add days or weeks.
        </p>
        <h3 style={h3Style}>What is mortgage origination?</h3>
        <p style={pStyle}>
          Origination is the process of creating a loan, from the application through underwriting to closing. The
          lender (or a loan officer or broker working with the lender) handles it. Lenders often charge an origination
          fee, commonly around 0.5% to 1% of the loan amount, to cover the work. It's listed on your Loan Estimate, and
          it's negotiable at some lenders.
        </p>
        <h3 style={h3Style}>What are digital mortgage loans?</h3>
        <p style={pStyle}>
          A digital mortgage is a regular mortgage handled mostly online. You apply through a website or app, upload
          documents, check your status, and e-sign many of the forms. Some lenders also offer eClosings and remote online
          notarization, so you can finish part or all of the closing from home, where state law allows it. The loan
          itself is the same. It still goes through underwriting, an appraisal, and a title search, so it doesn't
          automatically close faster, though fewer paper handoffs can help. Compare the rate and fees as you would with
          any other lender.
        </p>
        <h3 style={h3Style}>How do I apply for a mobile home loan?</h3>
        <p style={pStyle}>
          It depends on how the home is classified. A manufactured home (the modern term for a mobile home, built under
          the federal HUD code after June 1976) that's permanently attached to land you own can often qualify for a
          standard mortgage: conventional, FHA, VA, or USDA. If the home sits on rented land, such as a lot in a park, or
          isn't on a permanent foundation, it's usually financed with a chattel loan. That's a personal property loan,
          which typically has a higher rate and a shorter term, often 15 to 20 years.
        </p>
        <p style={pStyle}>
          The steps are the same as for any home loan: check your credit, get preapproved, compare lenders, and apply.
          Ask each lender whether it finances manufactured homes, since many don't. The home will need to meet HUD
          standards and pass an appraisal, and lenders usually require it to be on a permanent foundation if you want a
          traditional mortgage.
        </p>
        <h3 style={h3Style}>How many mortgage loan applications are made in the U.S. each year?</h3>
        <p style={last}>
          It varies with interest rates and the housing market. Home Mortgage Disclosure Act data for 2025 shows roughly
          6.7 million applications for home-purchase loans, according to the National Association of Realtors, and about
          3.6 million of those ended in a loan. Refinance applications add millions more. The 2025 total of all loans
          made, including refinances, was about 6.75 million in one industry analysis.
        </p>
      </div>

      {/* Broker vs bank */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mortgage Broker vs. Bank: Which Should You Use?</h2>
        <p style={pStyle}>
          A bank (or credit union) lends its own money and offers only its own loan products. A mortgage broker doesn't
          lend. Instead, the broker works with many lenders, collects your information once, and shops it around.
        </p>
        <p style={pStyle}><strong>Benefits of using a broker:</strong></p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Access to many lenders and loan programs in one application, including some that don't deal directly with
            the public
          </li>
          <li style={liStyle}>
            Help finding options if your situation is complicated, such as self-employment income, a lower credit score,
            or a non-standard property
          </li>
          <li style={liStyle}>Time saved on rate shopping</li>
          <li>Help with paperwork, and guidance from start to closing</li>
        </ul>
        <p style={pStyle}>
          <strong>What brokers typically do:</strong> collect your application, pull your credit, match you to lenders
          and loan types, present offers, negotiate terms, and help you lock a rate. The lender, not the broker, still
          underwrites and funds the loan.
        </p>
        <p style={last}>
          <strong>How they differ from a bank:</strong> brokers are paid by the lender, by you, or occasionally both,
          with a typical fee of around 1% to 2% of the loan. Banks may offer relationship perks, like a rate discount if
          you keep your accounts with them, and they usually service their own loans. Brokers can save money, but a
          broker isn't automatically cheaper. The best approach is to get a Loan Estimate from at least one bank and one
          broker and compare them.
        </p>
      </div>

      {/* Bad credit */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting a Mortgage With Bad Credit</h2>
        <p style={pStyle}>
          It's harder, but it's possible. A conventional loan generally requires a score of at least 620. FHA loans
          accept scores as low as 580 with 3.5% down, and some lenders approve scores of 500 to 579 if you put down 10%.
          VA loans have no minimum score set by the VA, though most lenders want to see 580 to 620 or higher.
        </p>
        <p style={pStyle}>Ways to improve your chances:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Get your credit reports and dispute errors.</strong> Even small corrections can raise your score.
          </li>
          <li style={liStyle}>
            <strong>Pay down credit card balances.</strong> Keeping balances under 30% of your limits helps, and lower
            is better.
          </li>
          <li style={liStyle}>
            <strong>Save a larger down payment</strong>, which offsets the lender's risk.
          </li>
          <li style={liStyle}>
            <strong>Add a co-borrower</strong> with stronger credit and steady income.
          </li>
          <li style={liStyle}>
            <strong>Pay everything on time</strong> for several months before you apply.
          </li>
          <li>
            <strong>Shop FHA-friendly lenders and compare offers.</strong> Be wary of any lender that promises approval
            without looking at your credit, or that pushes high fees, an adjustable rate you don't understand, or a
            prepayment penalty.
          </li>
        </ul>
        <h3 style={h3Style}>How can I lower my mortgage cost with bad credit?</h3>
        <p style={last}>
          You'll probably pay a higher rate at first, but you aren't stuck with it. Once your score improves and you've
          made on-time payments for a year or so, you can refinance to a lower rate. If you start with an FHA loan, you
          can often refinance into a conventional loan once you have 20% equity, which also removes mortgage insurance.
          In the meantime, make extra principal payments when you can, and ask your servicer about recasting
          (re-calculating your payment after a lump-sum principal payment) if you come into extra cash. The Consumer
          Financial Protection Bureau offers free{" "}
          <Ext href="https://www.consumerfinance.gov/consumer-tools/mortgages/">mortgage guides and rate-shopping tools</Ext>{" "}
          that can help you compare offers and spot unfair terms.
        </p>
      </div>

      {/* For someone else */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Get a Mortgage for Someone Else?</h2>
        <p style={pStyle}>
          You can help someone qualify, but you can't take out a mortgage in another person's name without their
          knowledge. That would be fraud. There are legitimate ways to help:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Co-borrower:</strong> you apply together. Both names are on the loan, and both of you are fully
            responsible for the payments. Often you're also on the title.
          </li>
          <li style={liStyle}>
            <strong>Non-occupant co-borrower (co-signer):</strong> you're on the loan to help with income and credit but
            you don't live in the home. FHA and conventional loans allow this under certain rules, and you'll typically
            be on the title as well.
          </li>
          <li style={liStyle}>
            <strong>Gift funds:</strong> a family member can give money toward your down payment, as long as it's
            documented with a gift letter and isn't a loan.
          </li>
          <li>
            <strong>Power of attorney:</strong> if someone can't attend closing, a lender may accept a power of
            attorney, but not all do, and it has to be specific to the transaction.
          </li>
        </ul>
        <p style={last}>
          Before you co-sign, understand the risk. If the borrower misses a payment, your credit takes the hit, and the
          lender can come after you for the full balance. The debt also counts toward your own debt-to-income ratio,
          which can make it harder to get a loan for yourself.
        </p>
      </div>

      {/* Rental mortgage */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Regular Mortgage vs. Rental (Investment) Mortgage</h2>
        <p style={pStyle}>
          A regular mortgage finances a home you plan to live in. A rental or investment property mortgage finances a
          property you plan to rent out. Lenders see rentals as riskier, because borrowers tend to walk away from rental
          properties first when money gets tight. That means:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>A bigger down payment, commonly 15% to 25%</li>
          <li style={liStyle}>
            A higher interest rate, often half a point to a full point or more above rates for primary homes
          </li>
          <li style={liStyle}>Larger cash reserves, often six months of payments or more</li>
          <li style={liStyle}>Stricter credit requirements</li>
          <li>
            No FHA, VA, or USDA financing for a pure rental. The exception is an owner-occupied building with up to four
            units, where you live in one unit and rent out the others.
          </li>
        </ul>
        <p style={pStyle}>
          Lenders also look at rental income. Many count about 75% of expected rent, to allow for vacancies and
          expenses. Some investor loans, known as DSCR loans, approve you based on the property's rental income instead
          of your personal income, usually at a higher rate.
        </p>
        <h3 style={h3Style}>How many mortgages can one person have?</h3>
        <p style={last}>
          There's no law limiting you to one. The limits come from lenders and loan programs. Fannie Mae, for example,
          allows a borrower to have up to 10 financed properties on conventional loans, with stricter credit and reserve
          requirements as the number grows. FHA generally allows only one FHA loan at a time. VA loans depend on how much
          entitlement you have left. Beyond those limits, portfolio lenders and commercial loans may allow more, but
          they'll look hard at your income, debt, and savings.
        </p>
      </div>

      {/* Paying */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Pay a Mortgage?</h2>
        <p style={pStyle}>
          Your payment is due on the first of the month for most loans, with a grace period (commonly 15 days) before a
          late fee applies. A payment made within the grace period is still late for reporting purposes only if it's 30
          days overdue, but don't count on that. Pay on time. Common ways to pay include:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Automatic bank transfers (ACH) from your checking account, which prevents missed due dates
          </li>
          <li style={liStyle}>Your servicer's online portal or app</li>
          <li style={liStyle}>Check by mail</li>
          <li>Phone or in-person payment, sometimes with a fee</li>
        </ul>
        <h3 style={h3Style}>Can you pay a mortgage with a credit card?</h3>
        <p style={pStyle}>
          Usually not. Most servicers don't accept credit cards, because the processing fees would eat into their
          margins. Third-party payment services will do it, but they charge a fee, often around 2.5% to 3%, which is
          typically more than the rewards you'd earn. If you carry a credit card balance, you'd also pay interest of 20%
          or more on mortgage money, far above your mortgage rate. Cash advances are even worse. It's rarely worth it.
        </p>
        <h3 style={h3Style}>What is the period of a mortgage loan?</h3>
        <p style={last}>
          The loan period, also called the term, is how long you have to repay. The most common terms are 30 and 15
          years, and 20-year terms are also available. A longer term lowers the monthly payment but raises the total
          interest. A shorter term does the opposite.
        </p>
      </div>

      {/* Extra payments */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Extra Payments, Biweekly Schedules, and Paying Off Early</h2>
        <p style={pStyle}>
          There are a few proven ways to pay off a mortgage faster and cut the total interest, and the calculator lets
          you model the first two.
        </p>
        <p style={pStyle}>
          <strong>Extra payments</strong> go straight to principal. Because so much of the early payments goes to
          interest, even an extra $100 a month can take years off a 30-year loan and save a meaningful amount of
          interest. Tell your servicer to apply the extra amount to principal, not to future payments. Some people add
          extra every month, and others add lump sums, like a bonus or tax refund.
        </p>
        <p style={pStyle}>
          <strong>Biweekly payments</strong> mean paying half of your monthly payment every two weeks. There are 26
          half-payments in a year, which equals 13 full payments instead of 12. That extra payment goes to the
          principal. One caution: not every servicer applies biweekly payments the day they arrive. Some hold the money
          until they have a full payment, which wipes out the benefit. Third-party biweekly services also charge setup
          or per-payment fees. A simpler option is to divide your monthly payment by 12 and add that amount to each
          payment, which gets you the same result without special setup.
        </p>
        <p style={pStyle}>
          <strong>Refinancing to a shorter term</strong> is the third option. It speeds up the payoff and cuts interest
          but raises your payment and comes with closing costs. The next section covers refinancing in more detail.
        </p>
        <h3 style={h3Style}>Is it unwise to pay off your mortgage completely?</h3>
        <p style={pStyle}>
          Not necessarily, but it isn't right for everyone. Paying early means less interest, a shorter timeline, and
          peace of mind. It can also be the wrong move in a few situations:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Opportunity cost.</strong> If your rate is 4% and you could reasonably earn more by investing the
            money, the extra mortgage payment may not be your best use of cash. This only works if you'll actually
            invest it and can handle the market ups and downs. Paying off a mortgage is a guaranteed return equal to
            your interest rate.
          </li>
          <li style={liStyle}>
            <strong>Liquidity.</strong> Money you put into the house is hard to get back without selling or borrowing
            against it. Make sure you have an emergency fund first.
          </li>
          <li style={liStyle}>
            <strong>Higher-interest debt.</strong> Credit card and car loan balances should usually be paid first.
          </li>
          <li style={liStyle}>
            <strong>Retirement savings.</strong> If you're missing out on an employer match, take the match first.
          </li>
          <li style={liStyle}>
            <strong>Prepayment penalties.</strong> Some loans charge a fee for paying off early. Federal rules limit
            these on most home loans: they aren't allowed on FHA, VA, and USDA loans, and qualified mortgages can only
            charge them for the first three years, capped at 3%, 2%, and 1% in years one, two, and three. Check your
            loan documents.
          </li>
          <li>
            <strong>Taxes.</strong> If you itemize, paying down the loan means less deductible interest. That's rarely a
            good reason to keep a mortgage, because you still pay a dollar of interest to save a fraction of a dollar in
            tax.
          </li>
        </ul>
        <p style={last}>
          If your rate is low, you have other priorities, or you value flexibility, keeping the mortgage can be
          perfectly reasonable. If your rate is high and you have plenty of savings, paying it off is a safe and
          sensible choice.
        </p>
      </div>

      {/* Refinancing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Refinancing a Mortgage: What You Need to Know</h2>
        <h3 style={firstH3}>What is refinancing?</h3>
        <p style={pStyle}>
          Refinancing means replacing your current mortgage with a new one, usually to get a lower rate, a different
          term, or cash from your home equity. The new loan pays off the old one, and you start making payments on the
          new loan. There are three common types:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Rate-and-term refinance:</strong> changes your rate, your term, or both, without taking cash out.
          </li>
          <li style={liStyle}>
            <strong>Cash-out refinance:</strong> you borrow more than you owe and take the difference in cash.
          </li>
          <li>
            <strong>Streamline refinance:</strong> a simplified process for existing FHA and VA loans (the FHA
            Streamline and the VA IRRRL), with less paperwork and often no appraisal.
          </li>
        </ul>
        <h3 style={h3Style}>When should you refinance?</h3>
        <p style={pStyle}>
          The main test is whether you'll save more than you spend. To find your break-even point, divide your closing
          costs by your monthly savings. Closing costs on a refinance typically run about 2% to 5% of the loan amount. If
          the refinance costs $6,000 and saves you $200 a month, you break even in 30 months, so it makes sense if you'll
          stay in the home longer than that.
        </p>
        <p style={pStyle}>These are the most common reasons people refinance:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Lower your interest rate.</strong> The old rule of thumb was to wait for a drop of one full point,
            but a smaller drop can pay off if your closing costs are low and you're staying put. Rates are higher now
            than they were in 2020 and 2021, so many homeowners don't have a rate they can beat. Check before you assume.
          </li>
          <li style={liStyle}>
            <strong>Shorten your term.</strong> Going from a 30-year to a 15-year loan raises your payment but can cut
            your total interest a lot.
          </li>
          <li style={liStyle}>
            <strong>Switch from an ARM to a fixed rate</strong> before your adjustment period begins.
          </li>
          <li style={liStyle}>
            <strong>Remove PMI.</strong> If your home has gained value and you now have 20% equity, refinancing can end
            mortgage insurance, though you can often cancel PMI without refinancing by asking your servicer.
          </li>
          <li style={liStyle}>
            <strong>Take out cash.</strong> Some homeowners tap equity for renovations, college costs, or to pay off
            higher-interest debt. This turns unsecured debt into debt secured by your home, so be careful.
          </li>
          <li>
            <strong>Change who's on the loan</strong>, for example after a divorce.
          </li>
        </ul>
        <h3 style={h3Style}>How much will my payment go down if I refinance?</h3>
        <p style={pStyle}>
          It depends on your balance, your old rate, and your new rate. As an example, on a $300,000 balance, dropping
          from 7.25% to 6.25% on a new 30-year loan would cut your principal-and-interest payment from about $2,047 to
          about $1,847, a savings of roughly $200 a month. Use the calculator above to run your own numbers. Remember
          that restarting a 30-year term on a loan you've had for 10 years can lower your payment while raising your
          total interest, because you're stretching the debt out again.
        </p>
        <h3 style={h3Style}>What should I do before refinancing?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>Decide what you want out of it: a lower payment, a shorter term, or cash.</li>
          <li style={liStyle}>Check your credit score and fix errors, since the score drives your rate.</li>
          <li style={liStyle}>
            Estimate your home's value and your equity. Lenders generally want at least 5% to 20% equity, depending on
            the loan.
          </li>
          <li style={liStyle}>
            Look at your current loan for a prepayment penalty and for how much you still owe.
          </li>
          <li style={liStyle}>Calculate your break-even point.</li>
          <li style={liStyle}>
            Gather your documents: pay stubs, tax returns, bank statements, and your current mortgage statement.
          </li>
          <li style={liStyle}>Get Loan Estimates from at least three lenders, and compare the APR and fees.</li>
          <li>Lock your rate when you find a good offer.</li>
        </ul>
        <h3 style={h3Style}>How do I qualify to refinance?</h3>
        <p style={pStyle}>
          Requirements are close to what you needed for your original loan. Most lenders look for a credit score of at
          least 620 for a conventional refinance (FHA can go lower), a debt-to-income ratio of around 45% or less (some
          programs allow up to 50%), steady income, and enough equity. For a cash-out refinance, conventional lenders
          typically limit you to borrowing up to 80% of your home's value. Many lenders also want you to have owned the
          home for at least six months.
        </p>
        <h3 style={h3Style}>How do I choose a mortgage refinance?</h3>
        <p style={pStyle}>
          First, pick the loan type that fits your goal: rate-and-term for savings, cash-out for equity, or a streamline
          for an FHA or VA loan. Then compare lenders by the full cost, not just the rate. Look at the APR, origination
          fees, points, and total closing costs on each Loan Estimate. Ask whether the lender will roll closing costs
          into the loan (convenient, but you'll pay interest on them), or give you a lender credit in exchange for a
          slightly higher rate. Finally, think about how long you'll stay in the home, since that determines whether
          paying points makes sense.
        </p>
        <h3 style={h3Style}>What happens to my mortgage payments during a refinance?</h3>
        <p style={pStyle}>
          Keep paying your current mortgage on time until the refinance closes. Missed payments during the process can
          hurt your credit and may derail the new loan. Your old loan stays in place until the new loan pays it off at
          closing. Your first payment on the new loan is usually due about one to two months after closing. It can feel
          like a skipped payment, but it isn't a free month, because mortgage interest is paid after it accrues, and
          you'll typically pay some prepaid interest at closing. Any money left in your old escrow account is refunded to
          you, usually within a few weeks.
        </p>
        <h3 style={h3Style}>Why is it sometimes harder to refinance than to get a new mortgage?</h3>
        <p style={pStyle}>
          It isn't always harder, since the underwriting is similar. But a few things make it feel that way. You have to
          prove you'll come out ahead after closing costs, and with today's higher rates you may be comparing a new rate
          against a cheaper existing loan. You need enough equity, so a drop in home values can block you. Your income,
          debts, or credit may have changed since your original loan. And cash-out refinances have tougher equity limits
          than a purchase with the same down payment. If you're having trouble, ask about a streamline program or try a
          lender that specializes in your situation.
        </p>
        <h3 style={h3Style}>How do I refinance when I have a second mortgage?</h3>
        <p style={pStyle}>You have a few options:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Refinance the first mortgage and keep the second.</strong> The new first-mortgage lender wants to be
            in first position, so the second lender must agree to a subordination, which keeps its loan in second place.
            Some second lenders charge a fee, and some refuse.
          </li>
          <li style={liStyle}>
            <strong>Combine both loans into one</strong> with a cash-out refinance that pays off both balances. This
            simplifies your payments, but you'll face cash-out limits and a rate that applies to the whole balance.
          </li>
          <li>
            <strong>Pay off the second mortgage separately</strong>, if you have the savings, and refinance only the
            first.
          </li>
        </ul>
        <h3 style={h3Style}>How do I refinance a reverse mortgage?</h3>
        <p style={pStyle}>
          If you have a Home Equity Conversion Mortgage (HECM), you can refinance into a new HECM, usually to get a
          better rate, access more equity, or remove a co-borrower. You can also pay off the reverse mortgage with a
          traditional mortgage if you qualify, or with savings or proceeds from selling the home. HUD requires counseling
          from an approved agency before you get a HECM, and a refinance has to give you a real financial benefit.
          Closing costs and mortgage insurance premiums can be significant, so ask for a full cost breakdown and
          consider speaking with a HUD-approved counselor or a trusted family member before you sign.
        </p>
        <h3 style={h3Style}>What are the disadvantages of refinancing?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Closing costs</strong> of 2% to 5% of the loan can wipe out your savings if you move or refinance
            again too soon.
          </li>
          <li style={liStyle}>
            <strong>A longer repayment period</strong> if you restart a 30-year term, which can mean more total
            interest.
          </li>
          <li style={liStyle}>
            <strong>Less equity</strong> with a cash-out refinance, and a bigger balance to repay.
          </li>
          <li style={liStyle}>
            <strong>A higher rate</strong> than you have now, if you give up a low-rate loan in a high-rate market.
          </li>
          <li style={liStyle}>
            <strong>The hassle:</strong> an appraisal, new paperwork, a hard credit check, and possibly new PMI.
          </li>
          <li>
            <strong>Possible prepayment penalties</strong> on your existing loan.
          </li>
        </ul>
        <h3 style={h3Style}>Is refinancing a good financial move?</h3>
        <p style={last}>
          It can be, when the numbers work: you'll be in the home well past the break-even point, the new loan has a
          lower rate or better terms, and you aren't just stretching debt over a longer period. It's usually a poor move
          if you're sitting on a low rate, plan to move soon, or are refinancing to spend equity on things that won't
          hold their value. Use the calculator to compare your current loan with a new one before you apply.
        </p>
      </div>

      {/* Tax */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Mortgage Interest Tax Deductible?</h2>
        <p style={pStyle}>
          Often, yes, but only if you itemize your deductions instead of taking the standard deduction. You can
          generally deduct interest on up to $750,000 of mortgage debt for a primary or second home ($1 million if the
          loan dates from before December 16, 2017). Property taxes may also be deductible, subject to the state and
          local tax (SALT) limit, which was raised significantly starting in 2025 for most filers, with income limits.
          Mortgage insurance premiums became deductible again starting in 2026 under recent tax law, so check the
          current rules or ask a tax professional. The IRS explains the details in{" "}
          <Ext href="https://www.irs.gov/publications/p936">Publication 936, Home Mortgage Interest Deduction</Ext>.
        </p>
        <h3 style={h3Style}>Does the 1099 go to the titleholder or the mortgagee?</h3>
        <p style={pStyle}>
          Two things to untangle. First, the form you're probably thinking of is Form 1098, the Mortgage Interest
          Statement, not a 1099. Your lender or servicer sends it if you paid $600 or more in interest during the year.
          It goes to the borrower on the loan, not necessarily the person whose name is on the title, and the lender
          sends a copy to the IRS.
        </p>
        <p style={last}>
          Second, if the names don't match, the general IRS rule is that the person who actually paid the interest, and
          is legally responsible for the debt, can deduct it. If you paid the interest but the 1098 lists someone else,
          include the deduction on your return and attach a statement showing the name and address of the person who
          received the form. A true 1099 doesn't apply to regular mortgage payments, though lenders may send a 1099-C if
          debt is forgiven or a 1099-A if a property is abandoned or foreclosed. A tax professional can help if your
          situation is unusual.
        </p>
      </div>

      {/* Borrower dies */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens to a Mortgage When the Borrower Dies?</h2>
        <p style={pStyle}>
          The mortgage doesn't disappear, and the lender doesn't automatically forgive or pay off the loan. The debt
          stays with the property, and it gets paid from the estate or by the people who inherit the home. What happens
          next depends on who's on the loan and who inherits.
        </p>
        <h3 style={h3Style}>What if a mortgage customer dies? How do banks handle it?</h3>
        <p style={pStyle}>
          The bank keeps the loan in place. The estate or a family member should notify the servicer and send a copy of
          the death certificate. The servicer will explain the options. If payments stop and no one steps in, the lender
          can eventually foreclose, so it's important to act quickly and keep communicating.
        </p>
        <h3 style={h3Style}>Does a bank have to transfer a mortgage to an heir if the original borrower dies?</h3>
        <p style={pStyle}>
          In many cases, yes. Under the federal Garn-St Germain Act, a lender can't demand full repayment just because
          the borrower died and the home passed to a relative, such as a spouse, child, or other heir who will live
          there. Federal servicing rules also require servicers to recognize a confirmed successor in interest, meaning
          the heir, and to treat them like a borrower for things like loss-mitigation options and account information.
          The heir can generally keep making payments on the existing loan terms. A lender can still require proof of
          ownership and may ask for documents before it talks to you about the account.
        </p>
        <h3 style={h3Style}>If my wife dies and we're both on the mortgage, what happens?</h3>
        <p style={pStyle}>
          You stay fully responsible for the loan. The bank doesn't pay it off unless there's mortgage life insurance or
          a similar policy that covers the balance. Call your loan servicer (the number is on your monthly statement) and
          send the death certificate. If the home was owned jointly, it usually passes to you automatically, but ask an
          attorney to confirm how it's titled. Also check for life insurance, credit life insurance, or other benefits
          that could help with the payments, and keep paying while you sort things out.
        </p>
        <h3 style={h3Style}>Can you keep a mortgage in a dead person's name?</h3>
        <p style={pStyle}>
          For a while, yes. The loan can stay in the deceased person's name while the estate is settled, as long as
          payments continue. Long term, the heir will usually want to take over the loan, refinance it, or sell the home,
          so that the title and loan are cleaned up.
        </p>
        <h3 style={h3Style}>Can an executor keep a house by continuing to make the mortgage payments?</h3>
        <p style={pStyle}>
          Yes, an executor can keep paying the mortgage from estate funds to protect the property during probate. This
          keeps the loan in good standing while the estate is settled. The executor doesn't personally own the house.
          After probate, the home goes to the heirs named in the will, or to heirs under state law. If the heir wants to
          keep it, they'll continue paying the existing loan or refinance.
        </p>
        <h3 style={h3Style}>What happens to a mortgage application if the applicant dies before closing?</h3>
        <p style={pStyle}>
          The application ends, and no loan is funded in that person's name. A co-applicant can sometimes continue on
          their own if they qualify alone. The estate isn't responsible for repaying a loan that never closed.
        </p>
        <h3 style={h3Style}>If an unmarried person dies with no kids and no will, who inherits?</h3>
        <p style={last}>
          State law decides. Most states follow a priority list that typically goes to a surviving spouse first, then
          children, then parents, then siblings, and then more distant relatives. If no relatives can be found, the
          property goes to the state. Whoever inherits gets the home with its mortgage still attached. A local probate
          attorney can tell you the exact order in your state.
        </p>
      </div>

      {/* Other terms */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Mortgage Terms You Might Run Into</h2>
        <h3 style={firstH3}>What does mortgagee-in-possession mean?</h3>
        <p style={pStyle}>
          A mortgagee-in-possession is a lender that has taken physical control of the mortgaged property, usually after
          the borrower defaults, to collect rent or protect its investment. It's an old legal concept and is used less
          often in the U.S. today, where lenders typically foreclose instead. A mortgagee in possession has to take
          reasonable care of the property and account for any income it collects. If you're a borrower, the term mostly
          comes up in legal documents or disputes.
        </p>
        <h3 style={h3Style}>What's the difference between a registered mortgage and an equitable mortgage?</h3>
        <p style={pStyle}>
          These terms are mostly used in India, the UK, and other Commonwealth countries, not in the U.S. A registered
          mortgage is created by a formal, signed deed that's recorded with the land registry. It gives the lender strong
          legal rights and is the usual choice for larger loans. An equitable mortgage is created more informally, often
          by handing the lender the property's title deeds with the intention of securing a loan. It's quicker and
          cheaper, but it gives the lender weaker protection. In the U.S., mortgages and deeds of trust are recorded with
          the county, and unrecorded arrangements are risky for both sides.
        </p>
        <h3 style={h3Style}>Can a borrower use the mortgaged property for business?</h3>
        <p style={pStyle}>
          Often yes, within limits. A standard home mortgage is meant for a home you live in, and your loan documents
          include an occupancy requirement. Working from a home office is generally fine. Running a business that brings
          in regular customers, employees, or heavy traffic, or turning part of the home into a rental, can conflict with
          your loan terms or local zoning. If you're planning something beyond a home office, check with your lender and
          your city or county first. A property used mainly for business needs a commercial loan.
        </p>
        <h3 style={h3Style}>Who do I pay, the mortgagee or the lender?</h3>
        <p style={pStyle}>
          They're the same thing: the mortgagee is the lender. In practice you pay your loan servicer, which might be the
          original lender or a company that bought or took over the loan. Your monthly statement lists where to send
          payment.
        </p>
        <h3 style={h3Style}>Which U.S. banks offer a mortgage with a 100% offset account?</h3>
        <p style={last}>
          None of the major ones, because offset accounts aren't a standard product in the U.S. They're common in
          Australia, New Zealand, and the UK. In an offset mortgage, your savings balance is subtracted from your loan
          balance when interest is calculated. In the U.S., the closest options are making extra principal payments, or
          using a home equity line of credit with a linked checking account. A few lenders offer these "all-in-one"
          products, but they're rare and often carry a higher rate, so read the terms closely. Be skeptical of anything
          marketed as a U.S. offset mortgage.
        </p>
      </div>

      {/* Other costs */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Homeownership Costs Worth Budgeting For</h2>
        <p style={pStyle}>
          Your mortgage payment is the biggest recurring cost of owning a home, but it's not the only one.
        </p>
        <p style={pStyle}>
          <strong>Recurring costs.</strong> Beyond taxes, insurance, PMI, and HOA fees, plan on maintenance and repairs,
          often about 1% or more of the home's value each year. That covers things like roof repairs, HVAC service, and
          plumbing. Utilities and insurance premiums also tend to creep up over time, so build in a cushion above
          whatever the calculator shows today.
        </p>
        <p style={last}>
          <strong>One-time costs.</strong> Closing costs are paid when the sale finalizes. They usually run 2% to 5% of
          the purchase price and include the loan origination fee, appraisal, inspection, title services, recording fees,
          attorney fees, points, prepaid insurance, and prorated property taxes. On a $400,000 home, that's roughly
          $8,000 to $20,000. In some cases you can negotiate a seller credit or lender credit to cover part of it. Don't
          forget moving costs, furniture, appliances, and any repairs or renovations you plan to do before moving in.
        </p>
      </div>

      {/* Reading results */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Results and Amortization Schedule</h2>
        <p style={pStyle}>Once you run the numbers, the results break down into a few key pieces.</p>
        <p style={pStyle}>
          <strong>Principal and interest</strong> is your base cost before taxes, insurance, and fees. Early payments
          lean heavily toward interest, later payments lean toward principal, and the amortization schedule shows that
          shift payment by payment.
        </p>
        <p style={pStyle}>
          <strong>The total cost of the loan</strong> adds up to every payment over the full term. It's often the most
          eye-opening number, because it shows what the home actually costs once decades of interest are included.
        </p>
        <p style={pStyle}>
          <strong>Payoff date</strong> shows when the loan would be fully repaid, including any extra or biweekly
          payments you've modeled. It's an easy way to compare scenarios side by side.
        </p>
        <p style={last}>
          Once you have a baseline, try a few what-if scenarios. See how a half-point rate increase changes what you can
          afford, since that can mean the difference between homes that are $15,000 to $20,000 apart in price for the
          same payment. Add a modest extra payment and watch the payoff date and total interest. And if you're tempted to
          wait for rates to fall, remember that home prices can rise in the meantime and offset any savings. Many buyers
          choose a home they can afford now and refinance later if rates drop, rather than trying to time both the rate
          and the market.
        </p>
      </div>

      {/* When you'd use it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use This Calculator</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>House hunters</strong> use it before touring, to match a monthly payment to a price range.
          </li>
          <li style={liStyle}>
            <strong>Buyers comparing lenders</strong> use it to see what a difference in rate or term means in dollars
            over the life of the loan.
          </li>
          <li style={liStyle}>
            <strong>Current homeowners</strong> use it to compare their payment with a refinance offer.
          </li>
          <li style={liStyle}>
            <strong>People planning a move</strong> use it to test how a bigger or smaller loan changes affordability.
          </li>
          <li>
            <strong>Future buyers</strong> use it to see how a target price, down payment, or expected rate would affect
            their payment, which makes savings goals more concrete.
          </li>
        </ul>
      </div>

      {/* Before you apply */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Check Before You Apply</h2>
        <p style={pStyle}>Once a payment looks right, test it against the rest of your finances.</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Debt-to-income ratio:</strong> most lenders want total monthly debts, including the new mortgage, at
            roughly 36% to 43% of your pre-tax income, though some programs go higher. Going over can affect approval
            even if the payment feels fine to you.
          </li>
          <li style={liStyle}>
            <strong>A financial test drive:</strong> for a few months, set aside the difference between your current
            rent and your expected mortgage payment. If that's comfortable, the payment is probably sustainable. If it
            isn't, adjust your target price or save a bigger down payment.
          </li>
          <li style={liStyle}>
            <strong>How long you'll stay:</strong> an ARM's lower starting rate can make sense if you expect to move
            within five to seven years. A fixed rate is safer for the long haul.
          </li>
          <li style={liStyle}>
            <strong>Your full housing budget</strong>, including maintenance, utilities, and a reserve for repairs.
          </li>
          <li>
            <strong>Your credit:</strong> a few months of paying down balances or fixing report errors can sometimes
            improve your rate enough to justify the wait.
          </li>
        </ul>
      </div>

      {/* History */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Mortgages in the U.S. Got to Where They Are Today</h2>
        <p style={pStyle}>
          Mortgages haven't always looked like they do now. In the early 1900s, buyers typically needed a down payment of
          around 50% and borrowed for just a few years, ending with a large balloon payment. That put homeownership out
          of reach for most families, and during the Great Depression, many homeowners lost their homes because they
          couldn't refinance those balloon loans.
        </p>
        <p style={pStyle}>
          The government responded in the 1930s by creating the Federal Housing Administration (1934) and Fannie Mae
          (1938). Those programs helped make long-term, fixed-rate loans with smaller down payments the standard. After
          World War II, the GI Bill helped returning veterans buy homes with little or no money down, which fueled
          decades of suburban growth. Freddie Mac was created in 1970 to add competition and liquidity to the secondary
          market.
        </p>
        <p style={pStyle}>
          Access wasn't equal. Until the 1970s, many lenders could refuse to lend to single women, require a husband or
          male relative to co-sign, or discount a woman's income when deciding whether to approve a loan. The Equal
          Credit Opportunity Act of 1974 (effective in 1975) made it illegal for lenders to discriminate in credit on the
          basis of sex or marital status, and later amendments added other protected categories. Women can now apply for
          a mortgage in their own name on the same terms as anyone else.
        </p>
        <p style={last}>
          The homeownership rate peaked at around 69% in 2004 and has hovered closer to 65% in recent years. During the
          2008 financial crisis, Fannie Mae and Freddie Mac were placed into federal conservatorship, where they remain,
          and the FHA expanded its role to help keep lending going. Government-backed loans and Fannie and Freddie's
          standards still shape how most mortgages work, and the 30-year fixed-rate loan remains the most popular
          product.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost</h2>
        <p style={pStyle}>
          This calculator is free to use, with no signup, no account, and no hidden charges. There's no limit on how many
          scenarios you can run. Results come directly from the numbers you enter, and nothing you type is stored or
          shared. It's used only to generate your results.
        </p>
        <p style={last}>
          As with any calculator, treat the output as an estimate. Your actual property tax rate, insurance premium, and
          PMI cost may differ, so confirm them with your lender, your insurance agent, and your local tax records.
          Mortgage rules also change, so check with a lender or a qualified professional before making a big financial
          decision. This tool is for information and isn't financial, tax, or legal advice.
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
