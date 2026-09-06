import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my monthly loan payment?",
    a: "Enter your loan amount, annual interest rate, and loan term into the calculator. It applies the standard amortization formula to return your fixed monthly payment, along with a full breakdown of principal and interest over time.",
  },
  {
    q: "What information do I need to use this loan payment calculator?",
    a: "You need three of the following: the loan principal, the interest rate, and either the loan term or the monthly payment amount you want to test. The calculator solves for whichever variable you're missing.",
  },
  {
    q: "Can this tool tell me how long it will take to pay off my loan?",
    a: "Yes. If you enter your loan amount, interest rate, and a fixed monthly payment, the calculator works backward to show how many months or years it will take to fully pay off the balance. This is especially useful for credit cards or other debt without a set term.",
  },
  {
    q: "What if the monthly payment I enter isn't enough to pay off the loan?",
    a: "If a payment amount is too low relative to the loan balance and interest rate, interest can build up faster than the payment reduces it, and no valid payoff timeline can be calculated. In that case, try a lower loan amount, a higher monthly payment, or a lower interest rate until the numbers work.",
  },
  {
    q: "Does a longer loan term always mean I pay more overall?",
    a: "Generally, yes. Longer terms lower your monthly payment but increase the total interest paid over the life of the loan, since the balance accrues interest for a longer period. Shorter terms raise the monthly payment but reduce total interest paid, this applies to mortgages, auto loans, and most other installment debt.",
  },
  {
    q: "What's the difference between interest rate and APR?",
    a: "The interest rate is the base cost of borrowing the principal. APR includes the interest rate plus additional lender costs like fees, discount points, and closing costs, spread across the life of the loan. When there are no extra fees, the two figures are the same; when there are fees, APR gives a more complete picture of the loan's true cost.",
  },
  {
    q: "Should I choose a fixed or variable interest rate?",
    a: "A fixed rate keeps your payment the same for the entire loan term, which offers predictability. A variable rate can rise or fall over time based on a financial benchmark, meaning your payment could change — this can work in your favor when benchmark rates are falling, but can increase costs when they're rising. Many variable-rate loans include a cap limiting how high the rate can climb.",
  },
  {
    q: "What's the difference between the monthly and annual amortization schedule?",
    a: "The monthly schedule shows the principal/interest split for every single payment, while the annual schedule summarizes those figures by year, useful for a quicker, higher-level view of how the loan balance decreases over time.",
  },
  {
    q: "Is this loan payment calculator free to use?",
    a: "Yes, it's completely free with no signup, subscription, or hidden charges. You can run unlimited calculations.",
  },
  {
    q: "Is my financial information stored when I use this calculator?",
    a: "No. All calculations happen using the numbers you enter for that session only, and no loan or personal data is stored or shared.",
  },
  {
    q: "Will the numbers from this calculator match my actual lender's offer exactly?",
    a: "The calculator uses the standard fixed-rate amortization formula, so figures should closely match a lender's numbers for the same inputs. However, actual loan offers may include fees, insurance, or other charges that this tool doesn't factor in, so always confirm final terms directly with your lender.",
  },
  {
    q: "Can I use this calculator for mortgages, auto loans, and credit cards?",
    a: "Yes. Fixed-term loans like mortgages, auto loans, and personal loans work directly with the standard payment mode, and the fixed-payment mode works well for estimating payoff timelines on credit card balances or other debt without a preset term.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
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

export default function PaymentCalculatorFaqSection() {
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
        <p style={pStyle}>
          Figuring out exactly what a loan will cost you each month shouldn't require a finance degree or a
          stack of spreadsheets. This loan payment calculator does the math for you in seconds, enter your
          loan amount, interest rate, and term, and it returns your monthly payment along with a complete
          amortization breakdown. Built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online utilities, the
          tool is designed for anyone comparing loan offers, budgeting for a major purchase, or simply
          trying to understand where their money goes each month before signing on the dotted line.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A loan, at its core, is an agreement between a borrower and a lender: the lender hands over a
          principal amount, and the borrower agrees to pay it back over time, usually with interest added
          on top. What varies from loan to loan is how that repayment is structured, and two of the biggest
          variables are the loan term and the monthly payment amount. This calculator is built around
          exactly those two variables, letting you solve for either one depending on what you already know
          and what you're trying to figure out.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed Term vs. Fixed Monthly Payment: Two Ways to Use This Calculator</h2>
        <p style={pStyle}>There are two common ways people approach a loan calculation, and this tool supports both.</p>
        <p style={pStyle}>
          <strong>Solving for the monthly payment (fixed term).</strong> This is the more familiar approach
          and applies to loans like mortgages and auto loans, where the repayment period is set in advance.
          You enter the loan amount, interest rate, and the number of months or years you'll be repaying,
          and the calculator tells you what your fixed monthly payment will be.
        </p>
        <p style={pStyle}>
          Term length matters more than most borrowers initially realize. For a mortgage, choosing between a
          15-year and a 30-year repayment period isn't just about affordability today, it shapes long-term
          financial planning for decades. Some borrowers deliberately choose a shorter term because they're
          uneasy about long-term job stability, or because they'd rather lock in a lower interest rate while
          they still have a solid amount saved up, even though the monthly payment is higher. Others go the
          opposite direction and choose a longer term on purpose, timing the mortgage payoff to line up with
          retirement income sources like Social Security, so the loan is still being paid down comfortably
          well into retirement.
        </p>
        <p style={pStyle}>
          The same trade-off shows up with auto loans, where terms commonly range anywhere from 12 months up
          to 96 months. It's tempting to stretch the loan out as long as possible since that produces the
          smallest monthly payment, but doing so almost always increases the total amount paid once you add
          up interest and principal together. A shorter auto loan term usually costs less overall, even
          though the monthly bill is bigger. Running a few different term lengths through the calculator
          side by side is the easiest way to see exactly how much that trade-off is worth in your specific
          situation, so you can pick the term your budget can actually sustain rather than just the one with
          the lowest sticker-shock payment.
        </p>
        <p style={pStyle}>
          <strong>Solving for the payoff time (fixed monthly payment).</strong> The other approach flips the
          question around: instead of asking "what will my payment be," you ask "how long will it take to
          pay this off if I pay a specific amount every month." This is especially useful for revolving or
          flexible debt like credit cards, where there isn't a preset term the way there is with a mortgage
          or auto loan. Enter the balance, the interest rate, and the amount you plan to pay monthly, and
          the calculator tells you how many months it will take to bring the balance to zero.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This mode is also useful if you already have a loan and want to see the effect of paying more than
          the minimum. If you have extra room in your budget at the end of the month, adding that amount to
          the monthly payment field shows you exactly how much sooner the debt would be paid off compared to
          sticking with the standard payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Your Monthly Payment Is Calculated</h2>
        <p style={pStyle}>
          Loan payment calculations for fixed-term loans rely on a standard amortization formula that
          accounts for three variables: the principal balance, the periodic interest rate, and the total
          number of payments. Each monthly payment is structured so that it stays the same for the life of
          the loan, but the composition of that payment changes over time. In the early months, a larger
          share goes toward interest because the outstanding balance is still high. As the balance shrinks
          with each payment, more of your money goes toward principal, and less toward interest, even though
          the total payment amount never moves.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is why two loans with the same monthly payment can have very different total costs if their
          interest rates or terms differ. A longer loan term generally lowers the monthly payment but
          increases the total interest paid over the life of the loan, since interest has more time to
          accrue on the remaining balance. A shorter term raises the monthly payment but reduces total
          interest paid substantially. Seeing this trade-off laid out numerically, rather than guessing, is
          one of the main reasons people turn to a calculator instead of estimating in their head.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Loan Payment Calculator</h2>
        <p style={pStyle}>There are several common situations where running the numbers ahead of time makes a real difference:</p>
        <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: 18 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing loan offers before you borrow.</strong> If you've received quotes from
            multiple lenders with different rates and terms, plugging each one into the calculator lets you
            compare actual monthly payments and total interest side by side, rather than relying on a
            lender's advertised rate alone.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Budgeting for a car, home, or personal loan.</strong> Before committing to a purchase,
            it helps to know exactly how a new monthly payment will fit into your existing budget. This is
            especially useful when a lender pre-approves you for more than you're comfortable paying each
            month.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Deciding between a 15-year and 30-year mortgage (or similar term choices).</strong> The
            calculator makes the long-term cost difference concrete; you can see precisely how much extra
            you'd pay in interest by choosing a longer term, versus how much lower your monthly obligation
            would be.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Choosing an auto loan term.</strong> With car financing terms stretching anywhere from
            one year to eight years, testing a few different lengths shows you the real cost difference
            between a lower monthly payment and a shorter, cheaper-overall loan.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning to pay off debt faster.</strong> If you're trying to figure out how much you'd
            need to pay monthly to clear a loan in a specific timeframe, say, paying off a personal loan in
            two years instead of five, the calculator's reverse function tells you the required payment
            amount.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Paying down a credit card balance.</strong> Because credit cards don't come with a fixed
            term, this calculator is a practical way to see how many months it will take to clear a balance
            at your current payment amount, and how much faster that timeline gets if you add extra money to
            the payment each month.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Understanding an existing loan.</strong> Even after a loan is already in place, borrowers
            use payment calculators to sanity-check their statements, verify that a lender's amortization
            schedule matches expectations, or model what would happen if they made extra payments.
          </li>
          <li>
            <strong>Business and equipment financing.</strong> Business owners frequently use loan payment
            calculators to model financing costs for equipment purchases or expansion loans before applying,
            since knowing the monthly obligation in advance is essential for cash flow planning.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If Your Monthly Payment Isn't Enough</h2>
        <p style={pStyle}>
          When using the fixed-payment mode, it's possible to enter numbers that don't actually work
          mathematically. If the monthly payment you enter is too low relative to the loan amount and
          interest rate, interest can accumulate faster than your payment is able to bring the balance down,
          meaning the loan would technically never be paid off at that rate. When this happens, the
          calculation simply won't produce a usable payoff timeline.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The fix is straightforward: adjust one of the three inputs until the numbers work. That means
          either lowering the loan amount, raising the monthly payment, or lowering the interest rate you're
          testing. This scenario is actually a useful warning sign in its own right, if a real-world monthly
          payment you're considering falls into this territory, it's a signal that the payment amount
          genuinely isn't sufficient to make progress on the debt, and a different repayment plan is needed.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Interest Rate vs. APR: Why the Difference Matters</h2>
        <p style={pStyle}>
          Borrowers often use "interest rate" and "APR" interchangeably, but they measure two different
          things, and the gap between them can amount to thousands of dollars on a large loan like a
          mortgage.
        </p>
        <p style={pStyle}>
          The interest rate is simply the cost of borrowing the principal, the percentage charged on the
          outstanding balance. APR (annual percentage rate) is a broader figure that folds in additional
          costs of the loan beyond just interest, such as lender fees, broker fees, discount points, closing
          costs, and other administrative charges. Rather than being paid as separate upfront costs, these
          fees are effectively spread out and built into the APR figure over the life of the loan. If a loan
          has no extra fees attached to it at all, the interest rate and the APR will be identical.
        </p>
        <p style={pStyle}>
          Because of this, the two numbers serve different purposes when you're evaluating a loan. Use the
          plain interest rate when you want to see the loan's payment structure in isolation, without other
          costs mixed in. Use the APR when you want the fullest possible picture of what the loan will
          actually cost you overall, since it accounts for the extra fees a lender charges on top of
          interest. When comparing offers from different lenders, the advertised APR is generally the more
          reliable figure for understanding true cost, since two loans with identical interest rates can
          still end up costing very different amounts once fees are factored in.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator lets you test both figures separately, so you can see how much a loan's fees are
          actually adding to your effective borrowing cost compared to the bare interest rate alone.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed vs. Variable Interest Rates</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most loans use one of two interest rate structures: fixed or variable (also called adjustable or
          floating). A fixed rate stays the same for the entire life of the loan, which is why conventional
          mortgages, standard auto loans, and most student loans use this structure, the borrower knows
          exactly what the payment will be from the first month to the last. A variable rate, by contrast,
          can move up or down over time, which is common with adjustable-rate mortgages, home equity lines
          of credit, and some personal and student loans.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Variable Interest Rates Change Over Time</h2>
        <p style={pStyle}>
          With a variable-rate loan, the interest rate isn't set once and left alone, it's tied to a broader
          financial benchmark that moves along with overall economic conditions, most commonly the rate set
          by the Federal Reserve or an index like LIBOR. As that underlying benchmark shifts, the lender
          adjusts the loan's rate to follow it.
        </p>
        <p style={pStyle}>
          Because the rate itself can change, so can the monthly payment and the total interest owed over
          the remaining life of the loan, a rate increase in a given month raises both the payment due for
          that period and the overall interest projected going forward. Many variable-rate loans include a
          rate cap, which sets a ceiling on how high the interest rate is allowed to climb regardless of how
          much the underlying index moves, offering the borrower some protection against runaway increases.
          Rate adjustments also aren't instantaneous or continuous, lenders update variable rates on a
          schedule spelled out in the loan agreement, so a change in the benchmark index doesn't necessarily
          mean an immediate change to what the borrower is paying. Broadly speaking, variable rates tend to
          work in the borrower's favor during periods when benchmark rates are falling, and against the
          borrower when rates are rising.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Credit cards add another layer to this, since card interest rates can be either fixed or variable
          depending on the issuer and card agreement. Unlike some other variable-rate products, credit card
          issuers aren't always required to give advance notice before raising a variable rate. On the flip
          side, borrowers with strong credit histories are often in a position to call their card issuer or
          lender directly and negotiate a more favorable rate, whether the loan or card is fixed or
          variable.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Your Amortization Schedule</h2>
        <p style={pStyle}>
          An amortization schedule is a table that shows every single payment over the life of the loan,
          broken down into three components: how much goes to interest, how much goes to principal, and
          what the remaining balance is after that payment. This tool generates both a monthly and an annual
          view, so you can either study payment-by-payment detail or get a faster high-level summary by
          year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Reading an amortization schedule is useful for a few practical reasons. First, it shows you
          exactly how much interest you'll pay in total over the life of the loan, a number that's often
          larger than borrowers expect, particularly on longer-term loans. Second, it reveals how slowly the
          principal balance drops in the early years of a loan, which explains why refinancing or selling an
          asset shortly after taking out a loan often results in less equity than people assume. Third, it
          gives you a reference point for evaluating the impact of extra payments: by comparing the
          scheduled balance at any given month to what the balance would be if you paid more than the
          minimum, you can estimate how much faster you'd pay off the loan and how much interest you'd save.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed-Term Loans vs. Other Loan Structures</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's worth noting that the core amortization math in this calculator is built specifically for
          fixed-term, fixed-rate loans, the most common structure for auto loans, personal loans, standard
          mortgages, and most installment debt. In this structure, the interest rate and payment amount
          don't change over the life of the loan, which is exactly what makes the amortization math
          predictable and calculable in advance. Adjustable-rate loans, lines of credit with variable draws,
          or loans with balloon payments follow different repayment logic and won't map cleanly onto a
          standard amortization schedule, since their payment structure can change mid-term. If your loan
          falls into the fixed-term category, the numbers this calculator produces will closely mirror what
          you'd see on an official lender amortization table. For a variable-rate loan, you can still use
          the calculator to model individual periods by testing different interest rates and seeing how the
          payment shifts if the rate moves.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use an Online Calculator Instead of Manual Math</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The amortization formula itself involves compounding interest calculations that are tedious and
          error-prone to do by hand or even in a basic spreadsheet without building out formulas correctly.
          A single misplaced decimal in an interest rate conversion (annual vs. monthly) can throw off every
          number in the schedule. Using a purpose-built calculator removes that risk entirely, the math is
          applied consistently every time, and you can adjust any input and instantly see how it changes
          your monthly payment and total interest, which makes comparing scenarios far faster than
          rebuilding a spreadsheet formula for each one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy, and Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This loan payment calculator is completely free to use, with no hidden charges, subscription
          requirements, or usage limits. There's no signup or account creation involved, you can open the
          tool and get results immediately. Because all calculations run directly in your browser based on
          the numbers you enter, no loan details, personal financial information, or identifying data are
          stored or transmitted anywhere; nothing you input is saved once you leave the page. The
          calculations themselves are based on the standard amortization formula used across the lending
          industry, so the monthly payment and schedule figures you see should closely match what a bank or
          lender would calculate for the same inputs, though final loan terms are always determined by your
          actual lender and may include fees or conditions this tool doesn't account for.
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
