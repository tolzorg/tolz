import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my monthly loan payment?",
    a: "Enter your loan amount, annual interest rate, and loan term into the calculator. It applies the standard amortization formula to show your fixed monthly payment, along with a full breakdown of principal and interest over time.",
  },
  {
    q: "What information do I need to use this calculator?",
    a: "You need the loan amount and the interest rate, plus either the loan term (to find the monthly payment) or the monthly payment you plan to make (to find the payoff time).",
  },
  {
    q: "Can this tool tell me how long it will take to pay off my loan?",
    a: "Yes. Enter your loan amount, interest rate, and a fixed monthly payment, and the calculator shows how many months or years it will take to pay off the balance. This is especially useful for credit cards and other debt without a set term.",
  },
  {
    q: "What if the monthly payment I enter isn't enough to pay off the loan?",
    a: "If the payment is lower than the interest charged each month, the balance never goes down and no payoff time can be calculated. Raise the payment, lower the loan amount, or test a lower interest rate.",
  },
  {
    q: "Does a longer loan term always mean I pay more overall?",
    a: "In most cases, yes. A longer term lowers the monthly payment but increases the total interest, since the balance is charged interest for longer. A shorter term has a higher payment but costs less overall. This is true for mortgages, auto loans, and most other installment debt.",
  },
  {
    q: "Does paying a loan off early save money?",
    a: "Usually, yes. Interest is charged on your remaining balance, so paying it down faster means less interest. Check for a prepayment penalty first and make sure extra payments are applied to principal.",
  },
  {
    q: "Is it better to pay a loan twice a month?",
    a: "Paying half your payment every two weeks adds up to one extra full payment per year, which shortens the loan and saves interest. Paying half twice a month on set dates makes only 12 full payments a year, so the savings are small.",
  },
  {
    q: "What is the monthly payment on a $100,000, 30-year mortgage at 8%?",
    a: "About $733.76 for principal and interest. Taxes, insurance, and other charges are extra.",
  },
  {
    q: "What's the difference between interest rate and APR?",
    a: "The interest rate is the base cost of borrowing. APR adds certain lender fees and costs, spread over the life of the loan. When there are no extra fees, the two are the same. When there are fees, APR gives a fuller picture of the loan's true cost.",
  },
  {
    q: "Should I choose a fixed or variable interest rate?",
    a: "A fixed rate keeps your payment the same for the whole term, which makes budgeting easier. A variable rate can rise or fall with a benchmark such as the prime rate or SOFR, which can lower your costs when rates fall and raise them when rates climb. Many variable-rate loans have a cap on how high the rate can go.",
  },
  {
    q: "Does overpaying or underpaying affect my FICO score?",
    a: "Paying extra does not hurt your score, and paying down card balances can help it. Paying less than the minimum can lead to a late payment on your credit report once you are 30 days past due, which can lower your score significantly.",
  },
  {
    q: "What's the difference between the monthly and annual amortization schedule?",
    a: "The monthly schedule shows the principal and interest split for every payment. The annual schedule summarizes those numbers by year, which is handy for a quick look at how your balance falls over time.",
  },
  {
    q: "Is this loan payment calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges. You can run as many calculations as you like.",
  },
  {
    q: "Is my financial information stored when I use this calculator?",
    a: "No. Your calculations run in your browser, and no loan or personal data is stored or shared.",
  },
  {
    q: "Will the numbers match my lender's offer exactly?",
    a: "They should be very close for a fixed-rate loan with the same inputs. Actual offers may include fees, insurance, or other charges this tool doesn't include, so always confirm final terms with your lender.",
  },
  {
    q: "Can I use this calculator for mortgages, auto loans, and credit cards?",
    a: "Yes. Fixed-term loans like mortgages, auto loans, and personal loans work with the standard payment mode. The fixed-payment mode works well for estimating how long it will take to pay off a credit card or other debt without a set term.",
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
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
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
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* Two modes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed Term vs. Fixed Monthly Payment: Two Ways to Use This Calculator</h2>
        <p style={pStyle}>
          <strong>Solving for the monthly payment (fixed term).</strong> This is the more familiar approach, and it fits
          loans like mortgages and auto loans where the repayment period is set up front. Enter the loan amount, the
          interest rate, and the number of months or years, and the calculator shows your fixed monthly payment.
        </p>
        <p style={pStyle}>
          The term you pick matters more than most people expect. With a mortgage, a 15-year loan has a higher monthly
          payment but costs far less in interest than a 30-year loan. Some borrowers choose the shorter term to be
          debt-free sooner, while others pick the longer one to keep the monthly bill low and flexible. Auto loans work
          the same way. Terms often run from 36 to 84 months, and some lenders go up to 96. A longer term makes the
          payment look easier, but you usually pay more in total interest, and you may owe more than the car is worth
          for longer. Running a few different terms through the calculator side by side shows exactly what each one
          costs.
        </p>
        <p style={pStyle}>
          <strong>Solving for the payoff time (fixed monthly payment).</strong> This approach flips the question.
          Instead of asking what your payment will be, you ask how long it will take to pay off the balance if you pay a
          certain amount each month. It is especially useful for credit cards and other debt with no set end date. Enter
          the balance, the interest rate, and your planned monthly payment, and the calculator tells you how many months
          it will take to reach zero.
        </p>
        <p style={last}>
          This mode also helps if you already have a loan and want to see what happens when you pay more than the
          minimum. Add the extra amount to the payment field and compare the new payoff date to the old one.
        </p>
      </div>

      {/* How calculated */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Your Monthly Payment Is Calculated</h2>
        <p style={pStyle}>
          Fixed-rate loan payments use a standard amortization formula based on three things: the loan amount, the
          monthly interest rate (the annual rate divided by 12), and the total number of payments. The payment stays the
          same every month, but what it is made of changes. In the early months, most of it goes to interest because
          your balance is still high. As the balance drops, more of each payment goes to principal.
        </p>
        <p style={pStyle}>
          That is why a longer term lowers your monthly payment but raises the total interest you pay. Interest has more
          time to build up on the balance. A shorter term does the opposite: a bigger payment, but much less interest
          overall.
        </p>
        <h3 style={h3Style}>What is the loan payment on a 30-year, fixed-rate mortgage of $100,000 at 8%?</h3>
        <p style={pStyle}>
          The monthly principal and interest payment is about $733.76. Over 360 payments, you would pay roughly $264,154
          in total, which means about $164,154 of that is interest. In other words, you would pay back more than two and
          a half times what you borrowed. You can check this by entering $100,000, 8%, and 30 years into the calculator
          above.
        </p>
        <p style={pStyle}>
          Keep in mind that a mortgage payment from your lender usually includes more than principal and interest.
          Property taxes, homeowners insurance, and sometimes mortgage insurance are often added to the monthly bill, so
          your actual payment will likely be higher than the figure above.
        </p>
        <h3 style={h3Style}>How can I make a spreadsheet that calculates total payments, current balance, and monthly payment?</h3>
        <p style={pStyle}>
          If you would rather build your own, Excel and Google Sheets both make it easy. Put the loan amount in cell B1,
          the annual interest rate in B2 (for example, 8%), and the number of years in B3. Then use these formulas:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Monthly payment:</strong> <code style={mono}>=PMT(B2/12, B3*12, -B1)</code>
          </li>
          <li style={liStyle}>
            <strong>Total of all payments:</strong> <code style={mono}>=PMT(B2/12, B3*12, -B1) * B3*12</code>
          </li>
          <li style={liStyle}>
            <strong>Total interest:</strong> the total of all payments minus the loan amount
          </li>
          <li>
            <strong>Current balance after a certain number of payments</strong> (put that number in B4):{" "}
            <code style={mono}>=-FV(B2/12, B4, -PMT(B2/12, B3*12, -B1), B1)</code>
          </li>
        </ul>
        <p style={last}>
          To build a full schedule, create one row per month. Interest for the month is the previous balance times the
          annual rate divided by 12. Principal is the payment minus that interest. The new balance is the previous
          balance minus the principal. Copy the row down for every month of the loan. The most common mistake is
          forgetting to divide the annual rate by 12 or to multiply the years by 12, and either one throws off every
          number in the sheet. A calculator like this one avoids that problem.
        </p>
      </div>

      {/* Not enough */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If Your Monthly Payment Isn't Enough</h2>
        <p style={pStyle}>
          In fixed-payment mode, some combinations of numbers simply don't work. If your monthly payment is lower than
          the interest charged each month, the balance never goes down, so there is no payoff date to show. For example,
          on a $10,000 balance at 24% interest, the monthly interest is $200. A $150 payment would not even cover that.
        </p>
        <p style={last}>
          To fix it, raise the monthly payment, lower the loan amount, or test a lower interest rate. If this is a real
          situation and not just a what-if, treat it as a warning. A payment that does not cover the interest will leave
          you stuck, and you need a different repayment plan.
        </p>
      </div>

      {/* Rate vs APR */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Interest Rate vs. APR: Why the Difference Matters</h2>
        <p style={pStyle}>
          People often use these two terms as if they mean the same thing, but they don't. The interest rate is the cost
          of borrowing the principal, shown as a percentage of your balance. The APR (annual percentage rate) includes
          the interest rate plus certain other costs, such as lender fees, discount points, and some closing costs,
          spread over the life of the loan. If a loan has no extra fees, the two numbers are the same.
        </p>
        <p style={last}>
          Use the interest rate when you want to see the payment structure on its own. Use the APR when comparing offers
          from different lenders, since two loans with the same rate can cost very different amounts once fees are
          added. For a large loan like a mortgage, the gap can add up to thousands of dollars. You can run both numbers
          through the calculator to see how much a loan's fees add to your effective cost. The Consumer Financial
          Protection Bureau has a{" "}
          <Ext href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-127/">
            plain-language explanation of APR and loan costs
          </Ext>{" "}
          if you want more detail.
        </p>
      </div>

      {/* Fixed vs variable */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed vs. Variable Interest Rates</h2>
        <p style={pStyle}>
          Most loans use one of two rate types. A <strong>fixed rate</strong> stays the same for the whole loan, so your
          payment never changes. Conventional mortgages, most auto loans, and federal student loans work this way. A{" "}
          <strong>variable rate</strong> (also called adjustable) can go up or down over time. You will see it on
          adjustable-rate mortgages, home equity lines of credit, many credit cards, and some private student and
          personal loans.
        </p>
        <h3 style={h3Style}>How variable rates change over time</h3>
        <p style={pStyle}>
          A variable rate is tied to a benchmark that moves with the economy. In the U.S., common benchmarks are the
          prime rate, which follows the Federal Reserve's rate decisions, and SOFR (the Secured Overnight Financing
          Rate). SOFR replaced LIBOR, which was phased out in 2023. When the benchmark changes, your lender adjusts your
          rate on a schedule set in your loan agreement. That means a change in the benchmark does not always show up in
          your payment right away.
        </p>
        <p style={pStyle}>
          When your rate rises, so does your payment and the total interest you will owe. Many variable-rate loans
          include a cap that limits how high the rate can go, which gives you some protection. In general, variable rates
          help borrowers when benchmark rates are falling and hurt when they are rising.
        </p>
        <p style={last}>
          Credit cards add a twist. A card with a variable APR can change whenever its index changes, and the issuer does
          not have to give you advance notice for that. For cards with a fixed APR, though, U.S. rules generally require
          the issuer to give you 45 days' notice before raising the rate on new purchases. In either case, borrowers with
          good credit can often call the lender or card issuer and ask for a lower rate. It does not always work, but it
          costs nothing to ask.
        </p>
      </div>

      {/* Repay early */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Does Repaying a Loan Early Reduce the Interest?</h2>
        <p style={pStyle}>
          Yes, in most cases. Interest is charged on your remaining balance, so the faster the balance drops, the less
          interest builds up. Every extra dollar that goes to principal today also stops that dollar from collecting
          interest for the rest of the loan.
        </p>
        <p style={pStyle}>
          Here is an example. On the $100,000, 30-year, 8% loan above, adding just $100 a month to the $733.76 payment
          pays the loan off in about 20 years instead of 30, and cuts total interest by roughly $60,000. The effect is
          biggest when you start early, since that is when most of each payment is going to interest.
        </p>
        <p style={last}>
          Before you pay extra, check two things with your lender. Some loans have a prepayment penalty, which is a fee
          for paying early. Also, make sure extra money is applied to the principal. Some lenders will treat it as an
          early payment toward next month's bill unless you tell them otherwise.
        </p>
      </div>

      {/* Pay more than minimum */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Effects of Paying More Than the Minimum?</h2>
        <p style={pStyle}>
          Paying more than the minimum shortens your loan and lowers the total interest on loans, mortgages, and credit
          cards alike. The difference is largest with credit cards, because the minimum payment is usually small and the
          interest rate is high. Paying only the minimum on a card can keep you in debt for many years.
        </p>
        <p style={pStyle}>
          For example, a $5,000 card balance at 22% interest takes about 34 months to clear if you pay $200 a month, and
          costs around $1,750 in interest. Raise the payment to $300 and you finish in about 20 months, with interest
          closer to $1,000. Try your own numbers in the calculator's fixed-payment mode to see your own timeline.
        </p>
        <p style={last}>
          With a mortgage, extra payments build equity faster and can save tens of thousands of dollars over time. The
          only real downside is that the money is tied up in your home and is harder to get back than cash in a savings
          account. That is why it is wise to keep an emergency fund before sending extra money to any loan.
        </p>
      </div>

      {/* Twice a month */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Better to Pay a Loan Twice a Month?</h2>
        <p style={pStyle}>
          It depends on what "twice a month" means. If you pay half your payment every two weeks (biweekly), you make 26
          half payments a year, which equals 13 full payments instead of 12. That one extra payment each year goes
          straight to principal and can shorten a 30-year mortgage by several years.
        </p>
        <p style={pStyle}>
          If you pay half your payment on two fixed dates each month (semi-monthly), you make 24 half payments, which
          adds up to just 12 full payments. You would save only a small amount of interest, because part of each payment
          reaches the lender a little earlier.
        </p>
        <p style={last}>
          Before switching, ask your lender whether it accepts partial or split payments, whether it applies them right
          away, and whether it charges a fee. Some third-party services charge a setup fee for biweekly plans, and you
          can usually get the same result for free by making one extra payment a year or adding about one-twelfth of
          your payment to each monthly bill.
        </p>
      </div>

      {/* Pay in full */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can I Pay Off a Loan in Full?</h2>
        <p style={pStyle}>
          Yes, in most cases. To do it right, contact your lender and ask for a payoff statement. This is different from
          the balance shown on your latest bill, because interest keeps building daily and the payoff amount includes
          interest up to the date you pay. The statement gives you the exact figure, a deadline, and instructions for
          sending the money.
        </p>
        <p style={last}>
          Also ask whether there is a prepayment penalty. These are less common on mortgages and auto loans today but
          still exist, so check your loan agreement. After you pay, get written confirmation that the account is closed
          with a zero balance. For a mortgage, the lender should also release the lien on your property, and for a car
          loan, you should receive the title.
        </p>
      </div>

      {/* How to pay back */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Can I Pay Back My Loan?</h2>
        <p style={pStyle}>Most lenders accept several payment methods:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Automatic payments (ACH)</strong> from your bank account. This is the easiest way to avoid late
            payments, and some lenders offer a small rate discount for it.
          </li>
          <li style={liStyle}><strong>Online payments</strong> through the lender's website or app.</li>
          <li style={liStyle}><strong>Debit card or bank transfer.</strong></li>
          <li style={liStyle}>
            <strong>Check or money order</strong> by mail. Allow several days for delivery.
          </li>
          <li style={liStyle}><strong>Phone or in-person payments</strong> at a branch.</li>
          <li>
            <strong>Wire transfer or cashier's check</strong> for a final payoff, if the lender requires guaranteed funds.
          </li>
        </ul>
        <p style={pStyle}>Whichever method you use, set up reminders or autopay so you never miss a due date.</p>
        <h3 style={h3Style}>How do I make a partial payment on a home loan, and what is the best method?</h3>
        <p style={pStyle}>
          A partial payment can mean two things. One is an extra principal payment, which is money above your regular
          payment. Most mortgage servicers let you add this online, by check, or by phone. Make sure it is marked
          "principal only," so it reduces the balance and does not just count toward next month's payment.
        </p>
        <p style={pStyle}>
          The other is paying less than the full amount due. Servicers often do not apply this as a payment. Many will
          hold the money in a suspense account until you have paid enough to cover a full installment, so the payment is
          still considered late. If you cannot make the full payment, call your servicer before the due date and ask
          about a hardship option, such as forbearance or a repayment plan.
        </p>
        <p style={last}>
          If you are trying to stop a foreclosure, ask for a written reinstatement quote (the amount needed to catch up
          on missed payments, fees, and costs) or a payoff quote. Servicers usually require guaranteed funds for this,
          such as a wire transfer or cashier's check, so ask which payment methods they will accept and how long they
          will give you.
        </p>
      </div>

      {/* Best way */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Best Way to Pay Off a Loan with Interest?</h2>
        <p style={pStyle}>
          The best approach is usually a simple one: pay on time, pay a little extra toward principal when you can, and
          avoid adding new debt while you are paying the old debt down. Beyond that, a few steps help:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Make your regular payment every month</strong>, preferably by autopay. Late payments cost you fees and
            damage your credit.
          </li>
          <li style={liStyle}>
            <strong>Add extra to the principal.</strong> Even $25 or $50 a month shortens the loan. Putting a tax refund
            or bonus toward the balance works too.
          </li>
          <li style={liStyle}>
            <strong>Refinance if rates drop.</strong> A lower rate can reduce your interest cost, but check the closing
            costs first and make sure you will stay in the loan long enough to come out ahead.
          </li>
          <li><strong>Target the highest rate first</strong> if you have more than one loan.</li>
        </ul>
        <p style={last}>Use the calculator to test each option so you can see what works before you change anything.</p>
      </div>

      {/* Credit card debt */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Pay Off Credit Card Debt?</h2>
        <p style={pStyle}>
          Credit card debt is expensive because the interest rates are high, so it is usually the first debt worth
          attacking. Here is a practical way to do it:
        </p>
        <ol style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Stop adding new charges</strong> to the cards you are paying off, or at least avoid carrying a
            balance on them.
          </li>
          <li style={liStyle}>
            <strong>Pay more than the minimum.</strong> Use the calculator's fixed-payment mode to pick an amount that
            clears the balance by a date you choose.
          </li>
          <li style={liStyle}>
            <strong>Pick a payoff order.</strong> The avalanche method puts extra money toward the card with the highest
            interest rate first, which saves the most money. The snowball method starts with the smallest balance, which
            gives you quick wins and keeps some people motivated. Both work if you stick with them.
          </li>
          <li style={liStyle}>
            <strong>Consider a lower rate.</strong> A balance transfer card with a 0% introductory rate or a fixed-rate
            consolidation loan can cut your interest, but watch for transfer fees (often 3% to 5%) and make sure you can
            pay off the balance before the promotional period ends.
          </li>
          <li>
            <strong>Ask for help if you need it.</strong> A nonprofit credit counseling agency can set up a debt
            management plan, which can lower your interest rates. Be careful with companies that promise to erase your
            debt or charge large upfront fees.
          </li>
        </ol>
      </div>

      {/* Interest each year */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Do People Pay in Interest Each Year?</h2>
        <p style={pStyle}>
          There is no single number, because it depends on how much a person owes and at what rate. Credit cards carry
          the highest rates, and recent Federal Reserve data put the average rate on cards that are charged interest
          above 20%. Mortgages and car loans usually have lower rates, but the balances are much larger. Here are some
          examples of first-year interest:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Credit card:</strong> a $6,000 balance at 22% costs about $1,300 a year if you do not pay it down.
          </li>
          <li style={liStyle}>
            <strong>Mortgage:</strong> a $300,000 loan at 6.5% costs about $19,400 in interest in the first year.
          </li>
          <li>
            <strong>Car loan:</strong> a $30,000, 60-month loan at 7% costs about $1,900 in interest in the first year.
          </li>
        </ul>
        <p style={last}>
          Interest is highest in the early years of a loan and falls as the balance shrinks. Your amortization schedule
          shows exactly how much you will pay each year.
        </p>
      </div>

      {/* FICO */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Effect of Overpaying or Underpaying on Your FICO Score?</h2>
        <p style={pStyle}>
          <strong>Overpaying does not hurt your FICO score.</strong> Paying more than the minimum, or paying a card in
          full, is good for your credit. On credit cards, paying down the balance lowers your credit utilization, which is
          how much of your available credit you are using. Lower utilization (many experts suggest staying below 30%)
          helps your score. You can read more about how scores are built in{" "}
          <Ext href="https://www.myfico.com/credit-education/whats-in-your-credit-score">
            myFICO's guide to what's in your credit score
          </Ext>
          .
        </p>
        <p style={pStyle}>
          <strong>Underpaying is where problems start.</strong> Paying less than the minimum counts as a missed payment.
          Lenders usually do not report to the credit bureaus until you are 30 days late, but when they do, it can drop
          your score significantly and stay on your report for up to seven years. Payment history is the biggest part of
          a FICO score, at around 35%.
        </p>
        <p style={pStyle}>
          Paying only the minimum does not hurt your score directly. It just keeps your balance, and your utilization,
          high, and costs you more in interest.
        </p>
        <p style={last}>
          One small exception: when you pay off an installment loan such as a car loan, your score may dip a few points
          for a short time, since an account was closed. That is minor, and paying off debt is still a good move.
        </p>
      </div>

      {/* 6 months */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If I Don't Repay My Loan for Another 6 Months?</h2>
        <p style={pStyle}>The longer you wait, the worse it gets. A rough timeline looks like this:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Right away:</strong> you may be charged a late fee, and interest keeps adding up.
          </li>
          <li style={liStyle}>
            <strong>30 days late:</strong> the lender can report the missed payment to the credit bureaus, and your score
            can fall sharply.
          </li>
          <li style={liStyle}>
            <strong>60 to 90 days late:</strong> you may be sent to the collections department and face more fees.
            Further late marks pile on.
          </li>
          <li style={liStyle}>
            <strong>About 120 days (mortgage):</strong> federal rules generally do not allow a servicer to begin
            foreclosure until you are more than 120 days behind, but the process can start soon after that.
          </li>
          <li style={liStyle}>
            <strong>About 180 days (credit cards):</strong> the issuer typically charges off the account and may sell it
            to a debt collector. You still owe the money.
          </li>
          <li style={liStyle}>
            <strong>Secured loans (car or home):</strong> the lender can repossess the car or foreclose on the home.
          </li>
          <li>
            <strong>Federal student loans:</strong> these go into default after about 270 days without a payment, which
            can lead to wage garnishment and withholding of tax refunds.
          </li>
        </ul>
        <p style={last}>
          Six months of missed payments can also lead to a lawsuit and a judgment, and it can make it hard to qualify for
          credit for years. If you are falling behind, call your lender early. Many offer hardship programs, such as a
          lower payment, a temporary pause (forbearance), or a modified loan. It is much easier to work something out
          before you miss payments than after.
        </p>
      </div>

      {/* Alternatives */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Alternative to Repaying a Loan? Can You Close a Loan Without Paying?</h2>
        <p style={pStyle}>
          You can't just walk away from a loan without consequences, but there are legitimate alternatives to paying it
          back in the usual way:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Refinancing</strong> replaces the loan with a new one, ideally with a lower rate or a payment you can
            afford.
          </li>
          <li style={liStyle}>
            <strong>Debt consolidation</strong> combines several debts into one loan with a single payment.
          </li>
          <li style={liStyle}>
            <strong>Loan modification or forbearance</strong> changes the terms or pauses payments for a while if you are
            having a hardship.
          </li>
          <li style={liStyle}>
            <strong>Debt settlement</strong> means the lender agrees to accept less than you owe. It can hurt your credit,
            and any forgiven amount may be taxable income.
          </li>
          <li style={liStyle}>
            <strong>Deed in lieu of foreclosure or a short sale</strong> lets you give up a home to settle a mortgage,
            with the lender's approval.
          </li>
          <li style={liStyle}>
            <strong>Loan forgiveness or discharge</strong> exists for some federal student loans, for example through
            Public Service Loan Forgiveness or in cases of total and permanent disability.
          </li>
          <li>
            <strong>Bankruptcy</strong> can eliminate some debts, but it has serious, long-lasting credit effects and
            should be a last resort.
          </li>
        </ul>
        <p style={pStyle}>
          As for gifts instead of payment, a lender is not required to accept anything other than the agreed repayment.
          Handing over goods or property in place of money only works if the lender specifically agrees in writing,
          usually as part of a settlement. If a family member wants to help, they can make payments toward your loan or
          give you money to pay it off. Large gifts may have tax or lending-rule implications, so it helps to get advice
          for bigger amounts.
        </p>
        <p style={last}>
          Be wary of anyone who offers to make your debt disappear for a fee. The Consumer Financial Protection Bureau
          offers{" "}
          <Ext href="https://www.consumerfinance.gov/consumer-tools/debt-collection/">free guidance on dealing with debt</Ext>{" "}
          and avoiding scams.
        </p>
      </div>

      {/* Companies */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do Companies Pay Off Multiple Loans?</h2>
        <p style={last}>
          Companies handle multiple loans with the same basic tools individuals use, just on a larger scale. They list
          every loan with its balance, rate, and payment date, then decide how to use their cash. Most pay the loans with
          the highest interest rates first, while keeping up the required payments on all the others. Many also
          refinance or consolidate several loans into one to lower the interest cost or simplify payments. They also pay
          close attention to cash flow and to loan agreement terms, called covenants, which can limit when and how a
          company can pay off or take on debt. You can use this same approach at home: list your debts, pay the minimum
          on all of them, and put every spare dollar toward the one with the highest rate.
        </p>
      </div>

      {/* Debt or invest */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should I Pay Off My Debt or Invest?</h2>
        <p style={pStyle}>
          A good way to decide is to compare the interest rate on your debt with the return you might reasonably expect
          from investing. Investment returns are never guaranteed, but paying off a loan gives you a guaranteed "return"
          equal to its interest rate.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>High-interest debt</strong> (such as credit cards at 20% or more): paying it off almost always wins,
            since few investments can reliably beat that rate.
          </li>
          <li style={liStyle}>
            <strong>Low-interest debt</strong> (such as a mortgage at 3% to 4%): investing may make sense, especially if
            you can get an employer match in a retirement plan.
          </li>
          <li>
            <strong>In between:</strong> many people split the difference. They put extra money toward both debt and
            investments.
          </li>
        </ul>
        <p style={last}>
          Whatever you choose, keep an emergency fund first. It keeps an unexpected expense from forcing you back onto a
          credit card. And if your employer matches your 401(k) contributions, it is usually smart to contribute enough
          to get the full match even while paying down debt, since that is essentially free money.
        </p>
      </div>

      {/* Other structures */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed-Term Loans vs. Other Loan Structures</h2>
        <p style={last}>
          The amortization math in this calculator is built for fixed-rate, fixed-term loans, which cover most auto
          loans, personal loans, standard mortgages, and other installment debt. Loans with changing rates, lines of
          credit with variable draws, and loans with balloon payments follow different rules and will not match a
          standard schedule. For a variable-rate loan, you can still test different interest rates to see how your
          payment would change if the rate moves. For a fixed-rate loan, the results should closely match your lender's
          official amortization table.
        </p>
      </div>

      {/* Rules */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Rule for Paying a Loan?</h2>
        <p style={pStyle}>There is no single rule, but a few widely used guidelines can help:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Pay on time, every time.</strong> This is the most important rule, since it protects your credit and
            avoids fees.
          </li>
          <li style={liStyle}>
            <strong>Pay at least the minimum, and more when you can.</strong> Extra payments go straight to principal.
          </li>
          <li style={liStyle}>
            <strong>The 28/36 guideline for mortgages.</strong> Housing costs should be no more than about 28% of your
            gross monthly income, and total debt payments no more than about 36%.
          </li>
          <li style={liStyle}>
            <strong>The 20/4/10 guideline for cars.</strong> Put at least 20% down, finance for no more than 4 years, and
            keep total car costs under 10% of your income.
          </li>
          <li>
            <strong>Read your loan terms.</strong> Know your rate, whether it is fixed or variable, and whether there is
            a prepayment penalty.
          </li>
        </ul>
        <p style={last}>
          These are rules of thumb, not requirements. Your own budget matters more, and the calculator can show whether a
          payment fits.
        </p>
      </div>

      {/* When you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Loan Payment Calculator</h2>
        <p style={pStyle}>Running the numbers ahead of time helps in a lot of situations:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Comparing loan offers.</strong> Put each lender's rate and term into the calculator to compare
            monthly payments and total interest side by side, instead of relying on the advertised rate alone.
          </li>
          <li style={liStyle}>
            <strong>Budgeting for a car, home, or personal loan.</strong> Know how a new payment will fit into your budget
            before you commit, especially when a lender pre-approves you for more than you are comfortable paying.
          </li>
          <li style={liStyle}>
            <strong>Choosing a term.</strong> See the real cost difference between a 15-year and a 30-year mortgage, or
            between a 48-month and a 72-month car loan.
          </li>
          <li style={liStyle}>
            <strong>Paying off debt faster.</strong> Find out what monthly payment it takes to clear a loan in a set time,
            such as paying off a personal loan in two years instead of five.
          </li>
          <li style={liStyle}>
            <strong>Paying down a credit card.</strong> See how many months it takes at your current payment, and how
            much sooner you finish if you add a little extra.
          </li>
          <li style={liStyle}>
            <strong>Checking an existing loan.</strong> Confirm that a lender's amortization table matches what you
            expect, or model the effect of extra payments.
          </li>
          <li>
            <strong>Business and equipment financing.</strong> Business owners use payment estimates to plan cash flow
            before applying for equipment or expansion loans.
          </li>
        </ul>
      </div>

      {/* Why online */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use an Online Calculator Instead of Manual Math?</h2>
        <p style={last}>
          The amortization formula involves compound interest, which is tedious to do by hand and easy to get wrong in a
          spreadsheet. One mix-up between annual and monthly rates can throw off every number in the schedule. A
          calculator applies the math the same way every time, and you can change any input and see the results
          instantly, which makes comparing scenarios much faster.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy, and Cost</h2>
        <p style={last}>
          This calculator is completely free, with no hidden charges, subscriptions, or usage limits, and there is no
          signup. All calculations run in your browser, so your loan details are not stored or sent anywhere, and nothing
          is saved when you leave the page. The figures are based on the standard amortization formula used across the
          lending industry, so they should closely match what a bank calculates for the same inputs. Your actual loan
          terms are set by your lender, though, and may include fees, insurance, or conditions this tool does not account
          for.
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
