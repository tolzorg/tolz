import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does amortization mean?",
    a: "It means paying off a debt in regular installments, where each payment covers interest and some principal until the balance is zero. In accounting, it also means spreading the cost of an intangible asset over its useful life.",
  },
  {
    q: "What is amortization in a loan?",
    a: "It's the way each fixed payment is split between interest and principal. Early on, most of the payment goes to interest. Over time, more goes to principal.",
  },
  {
    q: "What is a good example of amortization?",
    a: "A $400,000 mortgage at 6.10% over 30 years has a payment of about $2,424. About $2,033 of the first payment goes to interest, and about $391 goes to principal. By year 19, the principal part becomes larger.",
  },
  {
    q: "Does making extra payments always save money?",
    a: "In most cases, yes. Extra payments cut the balance that future interest is based on. If your rate is very low, the savings may be smaller than what that money could earn elsewhere, and some loans charge a prepayment penalty.",
  },
  {
    q: "Why does my early payment go mostly toward interest?",
    a: "Interest is charged on your current balance, which is highest at the start. As the balance shrinks, the interest portion shrinks too.",
  },
  {
    q: "What is the crossover point in an amortization schedule?",
    a: "It's when the principal portion of your payment becomes larger than the interest portion. On a 30-year mortgage around 6%, that's roughly year 18 or 19. On a 15-year mortgage, it's usually year three or four.",
  },
  {
    q: "What's the difference between amortization and depreciation?",
    a: "Depreciation spreads the cost of physical assets over time. Amortization does the same for intangible assets. Loan amortization is separate and is about repaying debt in installments.",
  },
  {
    q: "What is negative amortization?",
    a: "It happens when your payment is lower than the interest charged, so the unpaid interest is added to the balance and the amount you owe grows.",
  },
  {
    q: "Can I use this calculator for a mortgage, car loan, or personal loan?",
    a: "Yes. It works for any fixed-rate installment loan, including mortgages, auto loans, personal loans, student loans, and business loans with fixed payments.",
  },
  {
    q: "Can a loan's amortization period be different from its term?",
    a: "Yes. The term is how long your loan contract lasts. The amortization period is how long it would take to pay it off. A loan with a 5-year term and a 25-year amortization leaves a balance due at the end of year five.",
  },
  {
    q: "How does an adjustable-rate loan (ARM) affect amortization?",
    a: "After the fixed period, the rate changes and the lender recalculates the payment using your current balance, the new rate, and the years remaining. You can model each period as its own scenario here.",
  },
  {
    q: "Should I refinance if I'm partway through my loan?",
    a: "It depends on how far along you are. Early in the loan, a lower rate can save real money. If you've already paid down a lot of principal, restarting the schedule can cost more in total interest, even at a lower rate.",
  },
  {
    q: "How accurate is this calculator compared to my lender's numbers?",
    a: "It uses the same formula lenders use, so the figures should be very close if your inputs are right. Small differences can come from rounding, fees, escrow, or payment dates.",
  },
  {
    q: "What's the best extra payment strategy: monthly, yearly, or one-time?",
    a: "It depends on your cash flow. Steady extra monthly payments usually save the most over time. Yearly lump sums and one-time payments still help, and the earlier you make them, the more interest you avoid.",
  },
  {
    q: "Is this amortization calculator free?",
    a: "Yes. There's no signup, no payment information, and no limit on how many scenarios you run.",
  },
];

const WORKED_EXAMPLE_ROWS = [
  ["End of year 1", "~$2,011", "~$413", "~$395,179"],
  ["End of year 5", "~$1,897", "~$527", "~$372,674"],
  ["End of year 10", "~$1,710", "~$714", "~$335,631"],
  ["End of year 15", "~$1,456", "~$968", "~$285,419"],
  ["End of year 19", "~$1,189", "~$1,235", "~$232,670"],
  ["End of year 25", "~$645", "~$1,779", "~$125,081"],
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
const formulaStyle = { ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };

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

export default function AmortizationCalculatorFaqSection() {
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

      {/* What is amortization */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Amortization?</h2>
        <p style={pStyle}>
          Amortization means paying off a debt gradually through regular payments until the balance reaches zero. Each
          payment is split into two parts: interest and principal. Interest is the fee the lender charges for the money
          you borrowed. Principal is the part that actually reduces what you owe.
        </p>
        <p style={pStyle}>
          The word comes from an old French term meaning "to kill off," which is a fair description. Every payment kills
          off a little more of the debt.
        </p>
        <p style={pStyle}>
          Here's how it plays out on a typical mortgage, car loan, or personal loan. The lender sets one fixed monthly
          payment. Interest is always charged on the balance you still owe, so the interest part is biggest in month
          one. Each payment lowers the balance a bit, the next month's interest is a bit smaller, and more of your fixed
          payment goes to principal. The payment stays the same while the split between interest and principal keeps
          shifting.
        </p>
        <p style={last}>
          That's also how it relates to you directly: amortization decides how fast you build equity in a home, how much
          a loan really costs, and how much you save by paying extra.
        </p>
      </div>

      {/* Schedule */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Amortization Schedule?</h2>
        <p style={pStyle}>
          An amortization schedule is a table that shows every payment on a loan from the first to the last. Each row
          usually lists the payment number, the payment amount, how much went to interest, how much went to principal,
          and the balance left afterward.
        </p>
        <p style={last}>
          This calculator builds that table for you. Enter your loan amount, interest rate, and term, and you'll see
          exactly where each dollar goes. You can also add extra payments and watch the schedule shrink.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Amortization Calculator</h2>
        <p style={pStyle}>You only need a few numbers:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Loan amount:</strong> the total principal you're borrowing.</li>
          <li style={liStyle}><strong>Interest rate:</strong> your annual interest rate (APR).</li>
          <li style={liStyle}><strong>Loan term:</strong> how long you have to repay, in years or months.</li>
          <li>
            <strong>Extra payments (optional):</strong> a monthly, yearly, or one-time amount on top of the required
            payment.
          </li>
        </ul>
        <p style={pStyle}>
          The calculator then shows your monthly payment, your total interest over the life of the loan, your payoff
          date, and the full payment-by-payment table. If you added extra payments, it also shows how much interest
          you'd save and how much sooner you'd be done.
        </p>
        <p style={last}>
          It works for any standard fixed-rate loan: mortgages, auto loans, personal loans, student loans, and business
          loans with fixed payments.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Amortization and Loan Installments</h2>
        <p style={pStyle}>The monthly payment on a fixed-rate loan comes from this formula:</p>
        <p style={formulaStyle}>M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ − 1]</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}><strong>M</strong> is your monthly payment</li>
          <li style={{ marginBottom: 6 }}><strong>P</strong> is the loan amount</li>
          <li style={{ marginBottom: 6 }}><strong>r</strong> is the monthly interest rate (annual rate divided by 12)</li>
          <li><strong>n</strong> is the total number of payments (years × 12)</li>
        </ul>
        <p style={pStyle}>Once you have the payment, building the schedule is simple. For each month:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>Multiply the current balance by the monthly rate. That's the interest.</li>
          <li style={liStyle}>Subtract the interest from the payment. That's the principal.</li>
          <li style={liStyle}>Subtract the principal from the balance. That's your new balance.</li>
          <li>Repeat until the balance hits zero.</li>
        </ol>
        <p style={pStyle}>
          You can do this by hand, but it gets tedious fast on a 360-month mortgage. That's what the calculator is for.
        </p>
        <h3 style={h3Style}>Building a schedule in Excel or Google Sheets</h3>
        <p style={pStyle}>If you'd rather build your own, a spreadsheet handles it well. These functions do most of the work:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><code style={mono}>=PMT(rate/12, years*12, -loan)</code> gives the monthly payment.</li>
          <li style={liStyle}>
            <code style={mono}>=IPMT(rate/12, period, years*12, -loan)</code> gives the interest part of any single
            payment.
          </li>
          <li><code style={mono}>=PPMT(rate/12, period, years*12, -loan)</code> gives the principal part.</li>
        </ul>
        <p style={last}>
          List the payment numbers down column A, then use these functions in the next columns and subtract principal
          from the balance each row. To handle extra payments, add one more column for the extra amount and subtract it
          from the balance too. Wrap the balance in <code style={mono}>MIN()</code> so the last payment doesn't push the
          balance below zero. It takes a bit of setup, which is why many people use a calculator like this one instead.
        </p>
      </div>

      {/* Worked example */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example</h2>
        <p style={pStyle}>
          Take a $400,000 mortgage at 6.10% fixed over 30 years. The monthly principal-and-interest payment is about
          $2,424. Over 30 years, that adds up to roughly $872,700 in payments, which means about $472,700 of it is
          interest. That's more than the amount you borrowed.
        </p>
        <p style={pStyle}>
          In the first month, about $2,033 of the payment goes to interest and only about $391 to principal. Here's how
          the split changes over time:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead>
              <tr><th>Point in loan</th><th>Monthly interest</th><th>Monthly principal</th><th>Remaining balance</th></tr>
            </thead>
            <tbody>
              {WORKED_EXAMPLE_ROWS.map(([point, interest, principal, balance]) => (
                <tr key={point}><td>{point}</td><td>{interest}</td><td>{principal}</td><td>{balance}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={last}>
          Notice that after five years you've made 60 payments, but the balance has dropped by only about $27,300. Your
          own numbers will differ, so run your loan through the calculator for a breakdown that matches your amount,
          rate, and term.
        </p>
      </div>

      {/* Total interest */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Schedule Affects Your Total Interest</h2>
        <p style={pStyle}>
          The shape of the schedule is what drives total interest. Because interest is charged on the remaining balance,
          anything that lowers the balance sooner reduces the interest you pay later. Three things control this.
        </p>
        <p style={pStyle}>
          <strong>Loan term.</strong> A 30-year loan has a lower monthly payment, but the balance falls slowly, so you pay
          far more interest overall. A 15-year loan has a higher payment, but you pay down principal much faster and cut
          total interest substantially, even with the same loan amount and a slightly lower rate.
        </p>
        <p style={pStyle}>
          <strong>Interest rate.</strong> A higher rate means more of every payment goes to interest, especially in the
          early years when the balance is largest. A difference of even half a percentage point can mean tens of
          thousands of dollars on a large mortgage.
        </p>
        <p style={pStyle}>
          <strong>Extra payments.</strong> This is the one lever you control after the loan is signed. Extra money goes
          straight to principal, which lowers the balance that all future interest is based on. That's why consistent
          extra payments can shorten a loan by years.
        </p>
        <p style={last}>
          This is also why comparing total interest, not just the monthly payment, is the better way to compare two loan
          offers.
        </p>
      </div>

      {/* Early payments */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Early Payments Go Mostly to Interest</h2>
        <p style={pStyle}>
          This surprises a lot of first-time borrowers. If your first mortgage payment seems to barely dent the balance,
          nothing is wrong. Interest is calculated on your current balance, and that balance is at its highest on day
          one.
        </p>
        <p style={pStyle}>
          There's a practical reason lenders set loans up this way. Interest is the lender's payment for having your
          money out on loan. Charging it on the balance you actually owe is the fairest way to price it, and keeping the
          total payment level makes it easy to budget. The tradeoff is that the principal share starts small and grows
          over time.
        </p>
        <p style={pStyle}>
          <strong>The crossover point.</strong> At some point, the principal part of your payment becomes larger than
          the interest part. On a typical 30-year mortgage at around 6%, that happens somewhere around year 18 or 19. On a
          15-year loan, it usually comes by year three or four. In the example above at 6.10%, it lands close to year 19.
          A lower rate moves the crossover earlier, and a higher rate pushes it later.
        </p>
        <p style={last}>
          This is also why home equity builds slowly in the first years. Your equity is your down payment plus the
          principal you've paid off, plus or minus any change in the home's value.
        </p>
      </div>

      {/* Extra payments */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Paying Extra Affects Your Amortization Schedule</h2>
        <p style={pStyle}>
          Extra payments are the fastest way to change a schedule in your favor. When you pay extra, the money goes to
          principal, so every future interest charge is calculated on a smaller balance. The savings stack up month
          after month.
        </p>
        <p style={pStyle}>You can test three kinds of extra payments in this calculator:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Extra monthly payment:</strong> a fixed amount added to every payment.</li>
          <li style={liStyle}>
            <strong>Extra yearly payment:</strong> a lump sum once a year, like a bonus or tax refund.
          </li>
          <li>
            <strong>One-time payment:</strong> a single extra payment at a point you choose, like an inheritance or the
            sale of a car.
          </li>
        </ul>
        <p style={pStyle}>
          The calculator shows your new payoff date, the interest you'd save, and how that compares to what you put in.
          Timing matters: the earlier you make extra payments, the more interest you avoid, because the balance is higher
          early on.
        </p>
        <p style={last}>
          Before sending extra money to a loan, check with your lender that extra payments are applied to principal and
          not held as an early payment on next month's bill. Some loans also charge a prepayment penalty, so it's worth a
          quick look at your loan terms.
        </p>
      </div>

      {/* Term vs amortization period */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Loan Term vs. Amortization Period</h2>
        <p style={pStyle}>These two terms often get mixed up, and they aren't always the same thing.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            The <strong>loan term</strong> is how long your current contract with the lender lasts, including the
            interest rate.
          </li>
          <li>
            The <strong>amortization period</strong> is how long it would take to pay the loan off completely at the
            scheduled payment.
          </li>
        </ul>
        <p style={pStyle}>
          On most U.S. home and car loans, the two are identical. A 30-year fixed mortgage has a 30-year term and a
          30-year amortization. But they can differ. Many commercial loans use a 20- or 25-year amortization to keep the
          payment low, but the loan itself comes due in 5 or 10 years. At that point, the remaining balance is due as one
          large "balloon" payment unless you refinance. Canadian mortgages work this way too, with typical terms of one
          to five years on a 25-year amortization.
        </p>
        <p style={last}>
          This calculator is built for loans where the term and amortization period match. If your loan has a shorter
          term, enter the full amortization period to get your payment, then use the balance at the end of your term as
          the amount due.
        </p>
      </div>

      {/* Amortizing vs non-amortizing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Amortizing vs. Non-Amortizing Debt</h2>
        <p style={pStyle}>Not all debt works this way.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Amortizing debt</strong> has a fixed schedule that pays the balance down to zero. Mortgages, car
            loans, personal loans, and student loans are the common examples.
          </li>
          <li>
            <strong>Non-amortizing debt</strong> doesn't pay itself off on a set schedule. Credit cards are revolving
            debt, so the balance and the minimum payment change from month to month. Interest-only loans and balloon
            loans are also non-amortizing, since they leave all or most of the principal untouched until the end.
          </li>
        </ul>
        <p style={last}>
          People sometimes ask why amortization applies to mortgages but not to personal loans. It does apply. Most
          personal loans are fixed-rate installment loans with the same kind of schedule. Mortgages just get the most
          attention because the amounts are large and the terms are long, so the interest-heavy early years are easier
          to notice.
        </p>
      </div>

      {/* Types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Amortization</h2>
        <p style={pStyle}>
          <strong>Positive amortization</strong> is the standard kind. Your payment covers all the interest plus some
          principal, so the balance goes down every month. This is what this calculator models.
        </p>
        <p style={pStyle}>
          <strong>Zero amortization</strong> means the payment covers only the interest, so the balance doesn't change.
          Interest-only loans work this way during their interest-only period.
        </p>
        <p style={pStyle}>
          <strong>Negative amortization</strong> happens when your payment is less than the interest charged. The unpaid
          interest gets added to the balance, so you can owe more over time instead of less. It shows up in some option
          adjustable-rate mortgages, certain graduated-payment loans, and student loans on some income-driven repayment
          plans when the payment doesn't cover the monthly interest. It's risky because it quietly raises your debt and
          your future payments.
        </p>
        <p style={pStyle}>
          <strong>Reverse mortgages</strong> are a related case. The lender pays you, and you make no monthly payments,
          so interest is added to the loan balance each month and the balance grows over time. It's repaid later,
          usually when you sell the home or move out. There's no regular schedule to amortize, so this calculator doesn't
          apply to reverse mortgages.
        </p>
        <h3 style={h3Style}>Common amortization methods</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Level payment (fixed payment):</strong> the same payment every month with a shifting interest and
            principal split. This is the most common method and the one this calculator uses.
          </li>
          <li style={liStyle}>
            <strong>Constant principal:</strong> the same principal amount every month, so payments start higher and
            shrink as interest drops. It costs less interest overall, but the early payments are heavier.
          </li>
          <li style={liStyle}>
            <strong>Interest-only with a balloon:</strong> small payments for a set period, then a large lump sum.
          </li>
          <li>
            <strong>Straight-line (accounting):</strong> an even amount each period, used for business assets.
          </li>
        </ul>
      </div>

      {/* Advantages and disadvantages */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Advantages and Disadvantages of Amortization</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>Advantages</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Predictable payments.</strong> A fixed-rate amortized loan has the same payment every month, which
            makes budgeting easier.
          </li>
          <li style={liStyle}>
            <strong>A clear end date.</strong> You know exactly when the debt will be gone.
          </li>
          <li style={liStyle}>
            <strong>Built-in equity.</strong> Each payment builds ownership in your home or car, even if you never pay
            extra.
          </li>
          <li>
            <strong>Flexibility.</strong> You can pay extra at any time to finish earlier and save interest.
          </li>
        </ul>
        <h3 style={h3Style}>Disadvantages</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Slow start.</strong> Early payments are mostly interest, so the balance drops slowly in the
            beginning.
          </li>
          <li style={liStyle}>
            <strong>High total cost on long loans.</strong> A 30-year loan can cost nearly as much in interest as the
            amount borrowed, or more.
          </li>
          <li style={liStyle}>
            <strong>Selling or refinancing early.</strong> If you leave the loan early, you may have paid mostly interest
            and built little equity.
          </li>
          <li>
            <strong>Less flexible for some.</strong> A fixed payment can be a strain if your income drops.
          </li>
        </ul>
        <p style={last}>
          For homebuyers, the biggest benefit is the equity you build in a house that you can borrow against or use when
          you sell, along with a payment that doesn't jump around.
        </p>
      </div>

      {/* When you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need an Amortization Calculator</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Comparing loan offers.</strong> Two lenders may quote different rates or terms. Running each through
            the calculator shows the total interest, which is often the more important number.
          </li>
          <li style={liStyle}>
            <strong>Planning a mortgage or refinance.</strong> See how your payment changes over 15, 20, or 30 years.
            Keep in mind that refinancing resets your schedule to month one, where the interest share is highest. A
            lower-rate refinance can save real money if you're early in your loan. If you've already worked through most
            of the interest-heavy years, restarting the clock can cost you more in total interest than staying put, even
            at a lower rate.
          </li>
          <li style={liStyle}>
            <strong>Deciding whether to pay debt off early.</strong> See the exact dollar impact first. Loans with very
            low rates may not be worth rushing if that money could earn more elsewhere.
          </li>
          <li style={liStyle}>
            <strong>Budgeting for a car or personal loan.</strong> The terms are shorter, but the same pattern applies.
            Seeing the schedule helps you avoid loans where most early payments go to interest.
          </li>
          <li style={liStyle}>
            <strong>Tax planning.</strong> If you need to estimate how much interest you'll pay in a given year, the
            year-by-year breakdown makes it easy without waiting for a statement.
          </li>
          <li style={liStyle}>
            <strong>Student loan strategy.</strong> See how extra payments during or after school reduce your total
            repayment cost.
          </li>
          <li>
            <strong>Business loans.</strong> Business loans with fixed payments amortize the same way. The calculator
            gives you the payment and the interest for each period. In your books, the interest portion is recorded as
            interest expense, and the principal portion reduces the loan liability. It isn't an expense.
          </li>
        </ul>
      </div>

      {/* ARM */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Note on Adjustable-Rate Loans</h2>
        <p style={pStyle}>
          This calculator is built for fixed-rate loans. With an adjustable-rate mortgage (ARM), the rate changes after
          the initial fixed period, and the lender recalculates the payment using your current balance, the new rate,
          and the years left on the loan. The payment can change significantly, and sometimes more than once.
        </p>
        <p style={last}>
          To estimate an ARM, run each rate period as its own scenario: enter your current balance, the new rate, and
          the remaining term.
        </p>
      </div>

      {/* Accounting */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Amortization in Accounting and Business</h2>
        <p style={pStyle}>
          In accounting, amortization means something related but different. Instead of paying off debt, you spread the
          cost of an intangible asset over the years. It's useful. Intangible assets are things you can't touch, like
          patents, copyrights, licenses, trademarks, customer lists, and non-compete agreements.
        </p>
        <p style={pStyle}>
          <strong>Amortization vs. depreciation.</strong> The idea is the same, but the term depends on the asset.
          Depreciation applies to physical assets like machinery, vehicles, and buildings. Amortization applies to
          intangible assets. (Loan amortization is a third use of the word, about repaying debt.)
        </p>
        <p style={pStyle}>
          <strong>Purpose.</strong> Spreading the cost matches the expense to the years the asset helps produce revenue.
          Recording a $60,000 patent as an expense in one year would make that year look much worse than it really was,
          and the following years look better than they should.
        </p>
        <p style={pStyle}>
          <strong>Amortization expense.</strong> This is the portion of an intangible asset's cost recognized each
          period. For example, a $60,000 patent with a 10-year life is amortized at $6,000 per year using the
          straight-line method.
        </p>
        <p style={pStyle}>
          <strong>Is amortization a debit or credit?</strong> Both, in a way. The expense is a debit, and the matching
          entry is a credit. A typical journal entry looks like this:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
              <tr><td>Amortization Expense</td><td>$6,000</td><td></td></tr>
              <tr><td>Accumulated Amortization (or the asset account)</td><td></td><td>$6,000</td></tr>
            </tbody>
          </table>
        </div>
        <p style={pStyle}>
          <strong>Cash flow.</strong> Amortization is a non-cash expense. It reduces reported profit but doesn't take
          cash out of the business. That's why it's added back when calculating operating cash flow. Loan payments are
          different: the principal and interest you pay on a loan are real cash outflows.
        </p>
        <p style={pStyle}>
          <strong>EBITDA.</strong> EBITDA stands for earnings before interest, taxes, depreciation, and amortization, so
          amortization of intangible assets is added back. Amortization of deferred financing costs is usually reported
          as part of interest expense, so it's already excluded through the interest add-back. Adding it back again would
          count it twice, so check how it's presented in your financial statements.
        </p>
        <p style={pStyle}>
          <strong>Tax amortization benefit.</strong> For tax purposes, you generally can't deduct the full cost of an
          acquired intangible in the year you buy it. Under Section 197 of the U.S. tax code, most acquired intangibles,
          including purchased goodwill, customer relationships, licenses, and non-compete agreements, are amortized over
          15 years. The yearly deduction lowers taxable income, which lowers the tax bill. Goodwill and other intangibles
          a business creates itself usually don't qualify. Certain items are excluded from Section 197, including most
          off-the-shelf computer software, which is generally amortized over 36 months.
        </p>
        <p style={pStyle}>
          <strong>Startup costs.</strong> Costs to investigate or set up a new business can be partly deducted right
          away, up to $5,000, with the rest amortized over 15 years once the business opens. The $5,000 amount starts to
          phase out when total startup costs exceed $50,000.
        </p>
        <p style={last}>
          <strong>Investments subject to amortization.</strong> Besides intangible assets, bonds bought at a premium or
          discount are amortized over their life, and loan origination or financing fees are often spread over the loan
          term.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Why This Tool Is Free</h2>
        <p style={pStyle}>
          The calculator uses the standard amortization formula that lenders use, so results should closely match your
          loan under the terms you enter. Small differences can come from rounding, fees, escrow for taxes and
          insurance, or the way a lender counts days between payments.
        </p>
        <p style={last}>
          The tool is free, with no signup or hidden charges. You can run as many scenarios as you like. The information
          you enter isn't stored, so no loan data is left behind.
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
