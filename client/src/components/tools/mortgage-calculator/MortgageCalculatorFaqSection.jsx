import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a monthly mortgage payment calculated?",
    a: "It's calculated using the loan amount, interest rate, and loan term to determine the base principal-and-interest payment through a standard amortization formula, then adding monthly costs for property taxes, homeowners insurance, PMI where it applies, and HOA fees to arrive at the total payment.",
  },
  {
    q: "What is PITI?",
    a: "PITI stands for principal, interest, taxes, and insurance — the four components that typically make up a full monthly mortgage payment when taxes and insurance are collected through an escrow account.",
  },
  {
    q: "Do I need to include PMI in my mortgage calculation?",
    a: "Yes, if your down payment is under 20% of the home's price. PMI generally stays in place until the loan balance drops to around 80% of the home's original value, at which point it can usually be removed.",
  },
  {
    q: "How much can extra payments save on a mortgage?",
    a: "The exact amount depends on your loan balance, rate, and how much extra you add, but because early payments are weighted heavily toward interest, even a modest recurring extra payment can meaningfully shorten the loan term and reduce total interest paid.",
  },
  {
    q: "What's the difference between biweekly and monthly mortgage payments?",
    a: "Monthly payments total 12 per year; biweekly payments split the monthly amount in half and collect it every two weeks, resulting in 26 half-payments a year, equal to 13 full payments instead of 12, with that extra payment going toward principal.",
  },
  {
    q: "What is a prepayment penalty?",
    a: "It's a fee some lenders charge if you pay off a mortgage faster than the loan agreement allows, usually calculated as a percentage of the remaining balance or a set number of months of interest. These typically decrease over time and often don't apply if you're selling the home.",
  },
  {
    q: "Is an adjustable-rate mortgage riskier than a fixed-rate mortgage?",
    a: "An ARM typically starts with a lower rate than a fixed-rate loan of the same term, but the rate adjusts periodically after an initial fixed period based on market conditions, meaning the payment can rise later. It tends to suit borrowers who don't plan to stay in the home long enough to reach the adjustable period.",
  },
  {
    q: "What closing costs should I expect on top of my mortgage payment?",
    a: "Closing costs typically include the loan application fee, appraisal and inspection fees, title services, recording fees, and prepaid taxes or insurance, often totaling several thousand dollars depending on the purchase price and location.",
  },
  {
    q: "Is this mortgage calculator free to use?",
    a: "Yes, it's completely free, requires no signup, and has no usage limits or hidden charges.",
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
        <h2 style={h2Style}>Mortgage Calculator: Estimate Your Monthly Payment, PMI, and Payoff Timeline</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A mortgage is a loan secured against a property, and for most buyers it's the largest financial
          commitment they'll ever take on, which is exactly why guessing at the monthly cost isn't a good
          starting point. The mortgage calculator above from{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> works out your full monthly payment by
          combining principal, interest, property taxes, homeowners insurance, PMI, and HOA fees into one
          realistic number, then lets you test extra payments and a biweekly payment schedule to see how
          much faster you could pay off the loan and how much interest you'd avoid along the way. You'll
          also get a complete amortization schedule showing exactly how each individual payment splits
          between principal and interest for the full life of the loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Calculator Actually Calculates</h2>
        <p style={pStyle}>
          A lot of basic mortgage calculators only work out principal and interest, which understates the
          real monthly cost by a wide margin. This tool is built to give you the full picture instead. You
          enter the loan amount (or home price and down payment), the interest rate, and the loan term, and
          it applies a standard amortization calculation to work out your base principal-and-interest
          payment. From there it adds in property taxes, homeowners insurance, PMI where it applies, and
          HOA dues where relevant, so the final figure reflects what you'd actually be paying each month
          rather than a partial estimate that looks better on paper than it does on a bank statement.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is worth doing properly because listings and lenders frequently quote a payment that only
          covers principal and interest, leaving buyers to discover the rest of the cost later. Working out
          the full monthly obligation upfront makes it much easier to compare properties, evaluate
          competing loan offers, and check whether a given price range actually fits comfortably into your
          budget.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Factors That Determine Your Monthly Payment</h2>
        <p style={pStyle}>
          Three inputs do most of the work in setting your monthly payment, and it helps to understand how
          each one moves the number.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Home price and down payment</strong> set your loan principal. A bigger down payment
            lowers your monthly obligation directly, and it can also help you sidestep private mortgage
            insurance altogether, since PMI is generally required whenever the down payment falls below 20%
            of the purchase price.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Loan term</strong> controls how fast you repay the loan. A 15-year term carries a higher
            monthly payment than a 30-year term on the same loan amount, but it cuts the total interest paid
            dramatically because there's far less time for interest to accumulate against the balance.
          </li>
          <li>
            <strong>Interest rate</strong> is simply the cost of borrowing the money, and it's usually
            expressed as an Annual Percentage Rate, or APR. Even a small shift in rate compounds over
            decades, a difference of half a percentage point on a 30-year loan can mean tens of thousands of
            dollars more or less in total interest by the time the loan is paid off.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Mortgages generally come in two forms: a fixed-rate mortgage (FRM), where the rate stays the same
          for the entire term, and an adjustable-rate mortgage (ARM), where the rate is fixed for an initial
          period and then adjusts periodically based on market benchmarks. Because ARMs shift some of the
          interest-rate risk onto the borrower, they usually start with a rate that's roughly half a point
          to two points lower than a comparable fixed-rate loan, useful if you don't plan to stay in the
          home long enough for the adjustable period to kick in, riskier if you do.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding PITI: Principal, Interest, Taxes, and Insurance</h2>
        <p style={pStyle}>
          Lenders and industry sites refer to a full mortgage payment as PITI, principal, interest, taxes,
          and insurance, and understanding each piece makes the calculator's output much easier to
          interpret.
        </p>
        <p style={pStyle}>
          Principal is the part of your payment that reduces the outstanding loan balance. Early on,
          principal makes up a small share of each payment while interest takes the larger share; as the
          balance shrinks, that split gradually reverses, which is the whole logic behind an amortization
          schedule. Interest is charged on whatever balance remains, so it naturally decreases over time as
          the balance drops, even though your total payment stays flat on a fixed-rate loan.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Property taxes are set by your local municipal or county government and are typically collected
          monthly into an escrow account, then paid out to the tax authority once or twice a year on your
          behalf. Rates vary a lot by location, nationally, property owners in the U.S. pay roughly 1.1% of
          a home's value in property tax each year on average, though your actual rate depends entirely on
          where the home is and what exemptions apply, which is why the calculator lets you enter your
          specific figure rather than relying on a flat national number. Homeowners insurance covers the
          property against events like fire, storm damage, and theft, and most lenders require it as a
          condition of the loan. Premiums depend on the home's value, location, and coverage level, and like
          property taxes they're usually escrowed monthly rather than billed as a separate expense.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PMI and HOA Fees: The Costs Buyers Often Underestimate</h2>
        <p style={pStyle}>
          Private mortgage insurance protects the lender, not the borrower, and it's required on most loans
          where the down payment is under 20% of the purchase price. It's added directly to the monthly
          payment, and the annual cost typically falls somewhere between roughly 0.3% and 1.9% of the loan
          amount, depending on the loan type, the size of the down payment, and the borrower's credit
          profile. Divide that annual figure by twelve to see the monthly hit. PMI generally stays in place
          until the loan balance drops to about 80% (sometimes 78%) of the home's original value, known as
          the loan-to-value ratio, at which point it can usually be cancelled, worth tracking on your
          amortization schedule if you're trying to plan around it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          HOA fees apply to condos, townhomes, and many planned communities, and they cover shared
          maintenance and amenities. They're not part of the loan itself, but they're a fixed cost that
          affects what you can genuinely afford each month, and annual HOA dues usually work out to less
          than 1% of the property's value. Including them in the calculation, rather than treating them as a
          side expense you'll figure out later, gives a much more honest comparison between, say, a condo
          with HOA fees and a single-family home without them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Mortgage Payment Formula</h2>
        <p style={pStyle}>
          If you'd rather see the math behind the number, the standard formula lenders use to calculate a
          fixed monthly payment is:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
          M = P × [ r(1 + r)ⁿ / ((1 + r)ⁿ − 1) ]
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}><strong>M</strong> — the total monthly principal-and-interest payment</li>
          <li style={{ marginBottom: 6 }}><strong>P</strong> — the principal loan amount</li>
          <li style={{ marginBottom: 6 }}><strong>r</strong> — the monthly interest rate, found by dividing your annual rate by 12 (a 5% annual rate becomes a monthly rate of about 0.004167)</li>
          <li><strong>n</strong> — the total number of payments over the loan's life, found by multiplying the loan term in years by 12 (a 30-year fixed loan has 360 payments)</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          This formula only produces the principal-and-interest portion, taxes, insurance, PMI, and HOA
          fees are added on top, which is exactly what the calculator does automatically so you don't have
          to run this equation by hand and then tack on everything else separately.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Homeownership Costs Worth Budgeting For</h2>
        <p style={pStyle}>
          Your monthly mortgage payment is the biggest recurring cost of owning a home, but it isn't the
          only one, and it's worth separating these into recurring and one-time categories so nothing
          catches you off guard.
        </p>
        <p style={pStyle}>
          On the recurring side, beyond taxes, insurance, PMI, and HOA fees, general maintenance and upkeep
          tend to run about 1% or more of the property's value per year, think roof repairs, HVAC servicing,
          and the small things that come up in any older home. Utilities and general upkeep also tend to
          rise gradually over time due to normal inflation, which is why it's worth building in a buffer
          above whatever the calculator shows you today.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the one-time side, closing costs are paid when the sale finalizes and can include the loan
          application fee, appraisal and inspection fees, title service charges, recording fees, attorney
          fees, points, prepaid insurance, and pro-rated property taxes, among other line items. It isn't
          unusual for total closing costs to run around $10,000 on a $400,000 home purchase, and while these
          costs typically fall on the buyer, it's sometimes possible to negotiate a credit from the seller
          or lender to offset part of them. If you're planning to renovate before moving in, new flooring, a
          repainted interior, an updated kitchen, that's another one-time cost to plan for separately, along
          with the more ordinary expenses of moving, new furniture, and appliances.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Extra Payments, Biweekly Schedules, and Refinancing</h2>
        <p style={pStyle}>
          Beyond the standard schedule, there are a few well-established ways to pay off a mortgage faster
          and reduce the total interest paid, and the calculator lets you model the first two directly.
        </p>
        <p style={pStyle}>
          Making extra payments means paying more than the required monthly amount, with the surplus
          applied straight to the principal. Because such a large share of early payments goes toward
          interest rather than principal on a long-term loan, even a modest extra amount, say, an additional
          $100 a month, can shave years off the payoff timeline and save a meaningful amount in interest
          over the life of the loan. Some borrowers do this every month as a habit; others add extra
          whenever they have spare cash, such as after a bonus or tax refund.
        </p>
        <p style={pStyle}>
          Biweekly payments work differently: instead of paying once a month, you pay half the monthly
          amount every two weeks. Since there are 52 weeks in a year, that works out to 26 half-payments
          annually, the equivalent of 13 full monthly payments instead of 12. This approach suits people who
          are paid biweekly themselves, since it's easy to set aside a portion of each paycheck rather than
          saving up for one larger monthly bill, and that extra payment each year goes entirely toward
          principal.
        </p>
        <p style={pStyle}>
          Refinancing to a shorter term is a third option: you take out a new loan to replace the existing
          one, generally at a lower rate and a shorter term, which speeds up the payoff and cuts total
          interest, at the cost of a higher monthly payment and a fresh round of closing costs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Paying ahead has real advantages: lower total interest, a shorter repayment period, and for many
          people, a genuine sense of relief at being closer to owning the home outright. But it's not
          automatically the right move for everyone. Some mortgages carry a prepayment penalty, usually a
          percentage of the outstanding balance or a set number of months' interest, charged if you pay off
          the loan faster than the contract allows, though this typically fades out within the first five
          years and generally doesn't apply if you're selling the home outright. There's also an opportunity
          cost to consider: if your mortgage rate is 4% and you could reasonably expect to earn 8–10% or
          more by investing that same money elsewhere, putting extra cash toward the mortgage may not be the
          highest-return choice available to you. And every extra dollar paid into the house is money you
          can't access again without refinancing or selling, which matters if you're the type of person who
          might need liquid savings on short notice. Homeowners who itemize deductions should also remember
          that a lower interest balance means a smaller mortgage interest deduction going forward, though
          this only affects people who itemize rather than take the standard deduction.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Results and Amortization Schedule</h2>
        <p style={pStyle}>
          Once you run the numbers, the output breaks down into a few key pieces worth understanding
          individually.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Principal and interest</strong> is your base cost before taxes, insurance, and fees are
            added. As noted earlier, this split shifts over time, early payments lean heavily toward
            interest, later payments lean toward principal, and the amortization schedule shows this shift
            payment by payment.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Total cost of the loan</strong>, visible in the amortization output, adds up every
            payment made over the full term. This number is often the most sobering part of the whole
            exercise, since it reveals what the home actually costs once decades of interest are included,
            not just the sticker price.
          </li>
          <li>
            <strong>Payoff date</strong> gives you a concrete date for when the loan, and any extra or
            biweekly payments you've modeled, would be fully repaid, which is useful for comparing scenarios
            side by side rather than working with abstract percentages.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          It's worth running a few "what-if" comparisons once you have a baseline: check how a half-point
          rate increase changes what you can afford (it can be the difference between homes $15,000–$20,000
          apart in price for the same monthly payment); add a modest extra payment to see the effect on
          your payoff date and total interest; and think carefully before waiting on the sidelines for
          rates to drop, since home prices climbing in the meantime can offset any savings from a better
          rate later. Many buyers find it more useful to secure a home they can afford now and revisit
          refinancing if rates improve down the line, rather than trying to time the market on both fronts
          at once.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          House hunters use it before touring properties, to work out what monthly payment corresponds to a
          given price range so they don't get attached to homes outside their budget. Buyers comparing
          offers from different lenders use it to see how a difference in rate or term translates into real
          dollars over the life of the loan, since a slightly better rate can be worth tens of thousands of
          dollars over 30 years. Current homeowners considering refinancing use it to compare their existing
          payment against a new rate or term before starting the application process. People planning a
          move, relocating, downsizing, or upsizing, use it to test how a different loan amount changes
          affordability. And anyone budgeting for a purchase that's still a year or two away can use it to
          understand how a target price, down payment, or expected rate environment would affect their
          future payment, which makes savings goals a lot more concrete than a rough guess.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Check Before You Apply</h2>
        <p style={pStyle}>
          Once a payment number feels right, it's worth checking it against your broader finances before
          contacting a lender.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Your debt-to-income ratio (DTI)</strong> matters even if the payment fits comfortably in
            your monthly budget: lenders typically want your total monthly debt obligations, including the
            new mortgage, to stay under roughly 36% to 43% of your pre-tax income, and exceeding that
            threshold can affect approval regardless of how affordable the payment feels to you personally.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>A financial test drive</strong> can be a useful gut check: for a few months, set aside
            the difference between your current rent and the projected mortgage payment in a savings
            account. If that's manageable without straining your budget, the payment is likely sustainable
            long-term; if it isn't, that's a signal to adjust your target price or build a larger down
            payment first.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>How long you plan to stay in the home</strong> affects whether a fixed-rate or
            adjustable-rate loan makes more sense, an ARM's lower introductory rate can be a reasonable
            trade-off if you expect to move again within five to seven years, while a fixed rate offers more
            certainty if you're planning to stay long-term.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Your total housing budget</strong>, not just the mortgage payment, should account for
            maintenance, utilities, and a reserve for unexpected repairs, since these ongoing costs are easy
            to underestimate when focused only on the monthly loan payment.
          </li>
          <li>
            <strong>Your credit readiness</strong> is worth a look before applying, since a few months of
            paying down other debt or correcting errors on your credit report can sometimes improve your
            rate enough to justify the wait. Checking your credit score and total debt load ahead of time
            gives you a realistic sense of where you stand.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Mortgages in the U.S. Got to Where They Are Today</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Mortgages haven't always looked the way they do now. In the early 1900s, buying a home typically
          required a 50% down payment and a short loan term of three to five years, ending in a large
          balloon payment, terms that put homeownership out of reach for most people, and during the Great
          Depression roughly a quarter of homeowners lost their homes entirely. In response, the government
          created the Federal Housing Administration and Fannie Mae in the 1930s to bring more stability and
          affordability to home lending, which paved the way for the 30-year fixed-rate mortgage and smaller
          down payments that are standard today. These programs also helped returning soldiers finance homes
          after World War II, fueling decades of home construction, and continued to play a stabilizing role
          through the inflation of the 1970s and the energy price shocks of the 1980s. By 2001, the U.S.
          homeownership rate had climbed to a record 68.1%. Government-backed entities stepped in again
          during the 2008 financial crisis, when Fannie Mae came under federal conservatorship after major
          losses, later returning to profitability by 2012, while the FHA expanded its role in backing
          mortgages to help stabilize the housing market through 2013. Both entities remain central to how
          conventional and government-backed loans work in the U.S. today, which is part of why the 30-year
          fixed-rate loan remains the most common mortgage product, making up the large majority of loans
          issued each year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is free to use, with no signup, account creation, or hidden charges required, and
          there's no limit on how many scenarios you can run, different loan amounts, rates, terms, extra
          payments, or biweekly setups. All calculations are based directly on the numbers you enter, so
          results reflect your specific situation rather than a generic average, and no personal or
          financial information you input is stored or shared; it's used only to generate your result and
          nothing beyond that. As with any calculator, treat the output as an estimate built on the standard
          amortization formula and the figures you supply, your actual property tax rate, insurance premium,
          and PMI cost should be confirmed with your lender or local records, since these vary by location
          and by loan.
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
