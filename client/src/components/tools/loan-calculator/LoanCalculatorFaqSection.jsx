import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this loan calculator free to use?",
    a: "Yes. The calculator is completely free, with no signup, account creation, or hidden charges required to view results or the full amortization schedule.",
  },
  {
    q: "Does this calculator handle loans where interest compounds more often than I make payments?",
    a: "Yes. You can set compounding frequency and payment frequency independently, which reflects how many real loans are actually structured rather than assuming both are identical.",
  },
  {
    q: "What is a deferred payment loan, and how is it different from a regular loan?",
    a: "A deferred payment loan has no scheduled periodic payments. Interest accrues and compounds on the balance until a set maturity date, at which point the full principal and accumulated interest are due in one payment.",
  },
  {
    q: "How does the bond present value calculation work?",
    a: "It takes a bond's known face value, the time remaining until maturity, and a discount rate, then calculates what that future amount is worth in today's terms by discounting it back over the remaining period.",
  },
  {
    q: "Can I see how much of each payment goes toward interest versus principal?",
    a: "Yes. The tool generates a full period-by-period amortization schedule showing the interest portion, principal portion, and remaining balance for every payment period.",
  },
  {
    q: "Is my financial information stored when I use this calculator?",
    a: "No. Calculations are processed for your session only; no loan or personal financial details are saved or stored on a server.",
  },
  {
    q: "Why does changing the compounding frequency change my total interest so much?",
    a: "More frequent compounding means interest is calculated and added to the balance more often, which increases the amount interest is charged on over time, even if the nominal annual rate stays the same.",
  },
  {
    q: "Can this calculator help me decide whether to refinance a loan?",
    a: "Yes. By checking the remaining balance at a specific future period in the schedule, you can compare it against a new loan's terms to see whether refinancing at that point would reduce your total cost.",
  },
  {
    q: "What's the difference between an amortized loan, a deferred payment loan, and a bond?",
    a: "An amortized loan is paid off through regular fixed payments over time. A deferred payment loan has no payments until the full balance is due in one lump sum at maturity. A bond pays a predetermined face value at maturity and, depending on the type, may also pay periodic interest along the way.",
  },
  {
    q: "What's the difference between a coupon bond and a zero-coupon bond?",
    a: "A coupon bond pays the holder periodic interest based on a percentage of the face value, in addition to the face value at maturity. A zero-coupon bond pays no periodic interest; instead, it is sold at a discount to its face value, and the return comes from that gap when the face value is paid at maturity.",
  },
  {
    q: "What's the difference between APR and APY?",
    a: "APR, or annual percentage rate, is typically used for loans and includes interest plus most fees. APY, or annual percentage yield, is typically used for deposit accounts and reflects the effect of compounding on returns.",
  },
  {
    q: "What's the difference between a secured and an unsecured loan?",
    a: "A secured loan requires collateral, such as a home or vehicle, which the lender can claim if the borrower defaults. An unsecured loan has no collateral and relies on the borrower's credit profile instead, which typically means higher interest rates and stricter approval requirements.",
  },
  {
    q: "What do lenders look at when evaluating an unsecured loan application?",
    a: "Lenders commonly weigh five factors: character, capacity, capital, collateral, and conditions, which together assess credit history, ability to repay, other assets, any collateral offered, and broader lending conditions.",
  },
  {
    q: "Does a longer loan term always cost more?",
    a: "A longer term lowers your individual payment amount but increases the total interest paid over the life of the loan, since interest has more time to accrue. A shorter term raises the payment but reduces total interest paid.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether you're financing a car, comparing mortgage offers, or trying to work out what a bond is
          really worth today, doing the math by hand invites mistakes. This loan calculator, part of the
          free tool library at <Link to="/" className="inline-home-link">Tolz</Link>, handles three
          distinct financial calculations in one place: standard amortized loan payments, deferred payment
          loans that come due in full at maturity, and the present value of a bond from its known face
          value. Instead of juggling separate spreadsheets or formulas for each scenario, you get a single
          tool that adapts to whichever calculation you need, complete with a full period-by-period
          schedule you can review line by line.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Loan Calculator Does</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          At its core, this is an amortization and loan payment calculator built for accuracy across
          different loan structures. Most loan calculators online only handle the simplest case, fixed
          monthly payments on a standard installment loan. This tool goes further by supporting any
          compounding frequency (daily, monthly, quarterly, semi-annually, annually) paired independently
          with any payment frequency, which matters because many real-world loans compound interest more
          often than payments are actually made. It also calculates deferred payment loans, where no
          payments occur until the full balance is due at a set maturity date, and it can determine the
          present value of a bond given its face value, coupon structure, and discount rate. Each
          calculation produces a complete schedule showing how principal and interest break down over every
          period, not just a single summary number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Three Loan Structures This Calculator Covers</h2>
        <p style={pStyle}>
          Almost every loan you'll come across falls into one of three basic structures, and knowing which
          one applies to your situation determines which calculation you should run.
        </p>
        <p style={pStyle}>
          <strong>Amortized loans</strong> are the type most people mean when they say "loan" in everyday
          conversation. Payments are fixed and made on a regular schedule, weekly, biweekly, or monthly,
          with each payment covering a mix of interest and principal until the debt is fully paid off by the
          end of the term. Mortgages, auto loans, student loans, and most personal loans are structured this
          way. Because the payment amount stays the same throughout the loan while the interest and
          principal portions shift over time, an amortized loan needs a full schedule to show what's
          actually happening to the balance period by period.
        </p>
        <p style={pStyle}>
          <strong>Deferred payment loans</strong> work differently: instead of spreading repayment over the
          life of the loan, the entire principal and all accrued interest are paid as a single lump sum at
          maturity. There are no scheduled payments in between. This structure is common in short-term
          commercial lending, bridge loans, and certain business financing arrangements. Some balloon loans
          blend the two ideas, small periodic payments during the term with one larger payment at the end,
          but the calculation covered here is for loans where the full balance, with nothing paid along the
          way, comes due at once.
        </p>
        <p style={pStyle}>
          <strong>Bonds</strong> are the third structure, and they work on a fundamentally different
          principle than a conventional loan. When you buy a bond, you're effectively lending money to the
          issuer, and the issuer promises to pay a fixed amount, the face value, also called par value, when
          the bond matures, assuming they don't default. What you pay for the bond today and what you'll
          receive at maturity are usually two different numbers, which is exactly what a present value
          calculation is used to reconcile.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Bonds themselves come in two common varieties. Coupon bonds pay the holder periodic interest,
          usually annually or semi-annually, calculated as a percentage of the face value, in addition to
          returning the face value at maturity. Zero-coupon bonds skip the periodic interest payments
          entirely; instead, they're sold at a price well below face value, and the return comes from the
          difference between the discounted purchase price and the full face value paid out at maturity. The
          bond calculation in this tool is built for the zero-coupon case, where a known face value is
          discounted back to find its present value. It's also worth knowing that once a bond is issued, its
          market price can move up or down over its lifetime based on interest rate changes and broader
          market conditions, this doesn't change the fixed amount paid at maturity, but it does mean a
          bond's price today isn't necessarily fixed even though its face value is.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate an Amortized Loan Payment</h2>
        <p style={pStyle}>
          To calculate the payment, you need four inputs: the loan amount (principal), the annual interest
          rate, the loan term, and how often interest compounds relative to how often you pay. Enter these
          into the calculator, and it applies the standard amortization formula to determine the fixed
          payment amount required to pay off the loan exactly on schedule.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          What makes this more useful than a basic online calculator is the separation between compounding
          frequency and payment frequency. A loan might compound interest monthly while you pay biweekly, or
          compound daily while payments are made quarterly, these mismatches change the effective interest
          you pay and are common in auto loans, personal loans, and some mortgage products. By letting you
          set each independently, the calculator reflects the actual terms in your loan agreement rather
          than assuming they're identical, which is where many simpler tools produce inaccurate results.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Deferred Payment Loans Due at Maturity</h2>
        <p style={pStyle}>
          Deferred payment loans accrue interest over the full term with no scheduled payments until the
          entire balance, principal plus accumulated interest, comes due at a single maturity date. These
          structures show up in bridge financing, some student loan deferment periods, certain business
          loans, and short-term notes between private parties.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To calculate this correctly, the tool takes the original principal, the interest rate, the
          compounding frequency, and the length of the deferment period, then compounds the balance forward
          to determine exactly how much will be owed at maturity. This is meaningfully different from a
          simple interest estimate, because compounding frequency has a real effect on the final payoff
          amount, the more frequently interest compounds, the larger the balance grows relative to a simple
          annual calculation. Anyone evaluating a deferred loan offer should run these numbers before
          signing, since the maturity balance can be substantially higher than the face value borrowed.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bond Present Value Calculation</h2>
        <p style={pStyle}>
          Given a bond's known face value (the amount paid at maturity), what is that bond worth today?
          This depends on the discount rate, essentially the required rate of return an investor expects,
          and the time remaining until maturity. The calculator applies present value discounting to
          convert a future face value into its equivalent value in today's terms, accounting for compounding
          over the remaining period.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculation is useful for anyone assessing whether a bond is priced fairly, comparing bond
          investments with different maturities, or working through coursework in finance that requires
          present value analysis. Because the discount rate has a direct and often underestimated effect on
          present value, small changes in rate produce noticeably different valuations over longer time
          horizons, testing a few different discount rate scenarios in the calculator gives a clearer
          picture than relying on a single assumption.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Amortization Schedule</h2>
        <p style={pStyle}>
          Once you run a calculation, the tool generates a full period-by-period schedule rather than just
          a final payment figure. For amortized loans, this schedule breaks down each period into the
          interest portion, the principal portion, and the remaining balance after that payment. Early in
          the loan term, a larger share of each payment goes toward interest; as the balance shrinks, more
          of each payment reduces principal. Seeing this laid out period by period makes it possible to
          answer practical questions: how much total interest will be paid over the life of the loan, what
          the balance will be at any given point if you're considering refinancing, and how much extra
          principal payments would actually save.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For deferred loans, the schedule shows how the balance compounds forward across each period until
          maturity, making it clear exactly how the final payoff figure was reached rather than presenting
          it as an unexplained lump sum. This level of transparency is what separates a genuinely useful
          calculator from one that only hands back a single output number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Interest Rate, APR, and APY: Know the Difference</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Interest is how lenders profit from lending money, and understanding how it's quoted matters just
          as much as knowing the rate itself. The interest rate is the percentage of the loan a borrower
          pays back on top of the principal, but the way lenders advertise that rate isn't always
          straightforward. Loan rates are typically expressed as APR, or annual percentage rate, which folds
          in both the interest charged and most associated fees, giving a more complete picture of what a
          loan actually costs over a year. Deposit products like savings accounts, money market accounts,
          and CDs, by contrast, are usually advertised using APY, or annual percentage yield, which reflects
          the effect of compounding on returns. Mixing these two up when comparing a loan offer to a savings
          rate, or comparing two loan offers where one lender quotes a simple rate and another quotes full
          APR, can lead to comparing numbers that aren't actually equivalent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compounding Frequency and Why It Matters</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Compound interest is interest calculated not only on the original principal but also on interest
          that has already accumulated from prior periods. The more frequently a loan compounds, daily
          versus monthly versus annually, the more total interest accrues over the same nominal rate and
          term, because each compounding period adds to the base amount future interest is calculated on.
          Most consumer loans compound monthly, but that's not universal, and the gap between a loan that
          compounds daily and one that compounds annually can be significant over a long term. This is
          exactly why the calculator lets you set compounding frequency independently from payment frequency
          rather than assuming they match.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Loan Term and Total Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The loan term is simply how long you have to repay the loan, assuming minimum required payments
          are made on schedule. Term length shapes the loan in ways that pull in opposite directions:
          stretching the term out lowers the size of each individual payment, which helps with monthly cash
          flow, but it also means interest has more time to accrue, which raises the total amount paid over
          the life of the loan. Shortening the term does the reverse, higher payments now, less interest
          paid overall. There's no universally "right" term; it depends on whether the priority is a lower
          payment today or a lower total cost over time, and running both scenarios through the calculator
          is the most direct way to see the trade-off in real numbers rather than guessing at it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Secured vs. Unsecured Loans</h2>
        <p style={pStyle}>
          Consumer loans generally fall into one of two categories based on whether they're backed by
          collateral, and this affects both approval odds and the interest rate offered.
        </p>
        <p style={pStyle}>
          A secured loan requires the borrower to pledge an asset as collateral before the loan is approved.
          The lender holds a lien, a legal right to take possession of that asset if the borrower defaults.
          Mortgages and auto loans are the most common examples: the lender holds the title or deed until
          the loan is paid off, and defaulting means the bank can foreclose on the home or the lender can
          repossess the vehicle. Because the collateral reduces the lender's risk, secured loans tend to come
          with easier approval and lower interest rates than unsecured alternatives, though if the collateral
          turns out to be worth less than what's still owed, the borrower can still remain on the hook for
          the difference.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          An unsecured loan has no collateral backing it, which means the lender relies entirely on the
          borrower's financial profile to decide whether to approve the loan and at what rate. Credit cards,
          most personal loans, and student loans typically fall into this category. Because there's nothing
          to seize if the borrower defaults, unsecured loans generally carry higher interest rates, lower
          borrowing limits, and shorter repayment terms than secured loans, and lenders may require a
          co-signer, someone who agrees to take on the debt if the original borrower doesn't pay, when the
          borrower is considered higher risk. Falling behind on an unsecured loan can also result in the debt
          being handed off to a collection agency, a company that specializes in recovering funds on
          past-due or defaulted accounts.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Lenders Evaluate Unsecured Borrowers</h2>
        <p style={pStyle}>
          Since there's no collateral to fall back on, lenders assessing an unsecured loan application
          typically weigh five broad factors, sometimes referred to as the five C's of credit:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Character</strong> — credit history and past repayment behavior, work history, income
            stability, and any relevant legal or financial red flags.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Capacity</strong> — the borrower's ability to actually repay the loan, usually measured
            through a debt-to-income comparison.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Capital</strong> — other assets the borrower has beyond regular income, such as savings,
            investments, or a down payment, that could be used to meet the obligation if needed.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Collateral</strong> — relevant only for secured loans; the asset pledged to back the
            loan if the borrower defaults.
          </li>
          <li>
            <strong>Conditions</strong> — broader factors like current lending conditions, trends in the
            relevant industry, and the stated purpose of the loan.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Actually Changes Your Loan Payment</h2>
        <p style={pStyle}>
          A handful of variables determine what you'll actually pay, and it helps to separate them out
          rather than treating the loan as one fixed number.
        </p>
        <p style={pStyle}>
          The loan amount is the starting point, but it's rarely the final cost. Fees and interest charged
          over the term push the total amount repaid above the original amount borrowed, sometimes
          considerably.
        </p>
        <p style={pStyle}>
          The interest rate is the percentage charged on top of the loan amount, the higher it is, the more
          a borrower pays back for the same amount borrowed, all else being equal. Credit profile, the
          presence of a co-signer, and lender-specific requirements all factor into what rate a given
          borrower is offered.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The repayment period, the loan term, determines how payments are spread out. Standard
          amortization, where equal payments are made monthly over a fixed term, is what this calculator
          assumes and what most conventional loans use. Alternative repayment structures, such as graduated
          repayment plans that start low and increase over time, or income-based plans tied to earnings,
          follow different math entirely and won't match the output of a standard amortization calculation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need This Calculator: Practical Scenarios</h2>
        <p style={pStyle}>
          There are several common situations where working through these numbers in advance makes a real
          financial difference:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing loan offers from different lenders</strong> becomes far more accurate when you
            can standardize the compounding and payment frequency across quotes, since lenders don't always
            present terms the same way. Someone shopping for a personal loan, auto loan, or private mortgage
            can plug in each lender's stated terms and see the true monthly payment and total interest cost
            side by side, rather than relying on the lender's own advertised figures.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Evaluating a balloon or deferred payment loan before signing</strong> is another case
            where this matters. Because no payments are due until maturity, it's easy to underestimate how
            much the balance will have grown by the time it's due. Running the numbers ahead of time avoids
            an unpleasant surprise at maturity and allows for realistic planning of how that lump sum will be
            covered.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessing a bond purchase or comparing bond investments</strong> is a third scenario,
            particularly for anyone managing a fixed-income portfolio or studying finance. Present value
            calculations let you judge whether a bond's asking price reflects a reasonable return given its
            face value, time to maturity, and current market discount rates.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning early payoff or refinancing decisions</strong> also benefits from a detailed
            schedule. By checking the remaining balance at a specific future period, you can determine
            whether refinancing at a lower rate at that point would actually save money once closing costs
            and remaining interest are factored in.
          </li>
          <li>
            <strong>Students and professionals working through finance coursework or certification exams</strong>{" "}
            (such as those covering time value of money, amortization, and bond valuation) can use the tool
            to verify manual calculations and build intuition for how compounding frequency and discount
            rates affect outcomes.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compounding and Payment Frequency Explained</h2>
        <p style={pStyle}>
          One of the more overlooked details in loan math is that compounding frequency and payment
          frequency are not the same thing, and treating them as identical produces inaccurate results.
          Compounding frequency determines how often interest is calculated and added to the balance, daily,
          monthly, quarterly, or annually. Payment frequency determines how often you actually make a
          payment. When these differ, the effective interest rate paid over the year can be noticeably
          higher or lower than the stated nominal rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, a loan with a nominal annual rate that compounds monthly but is paid quarterly will
          accrue interest for two months before each payment is applied, which increases the balance between
          payments compared to a loan with matching monthly compounding and monthly payments. This
          calculator handles that distinction directly instead of assuming a simplified, and often
          inaccurate, one-to-one relationship between compounding and payments.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy & Reliability</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator applies standard, well-established financial formulas for amortization, compound
          interest, and present value, the same mathematical principles used in financial textbooks and
          professional lending software. All calculations run instantly in your browser session; no loan
          details, personal information, or financial data are stored on any server, and there is no
          requirement to create an account or sign up before using the tool. It is free to use with no
          hidden fees, subscription requirements, or usage limits. Because the schedule is fully transparent
          and shows every period's breakdown, you can independently verify the results against your own
          manual calculation if you want additional assurance before making a financial decision.
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
