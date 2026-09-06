import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the difference between amortization and a regular loan payment?",
    a: "Amortization describes how a fixed loan payment is internally split between interest and principal over time, and how that split changes as the balance goes down. The payment amount itself typically stays the same each period on a fixed-rate loan.",
  },
  {
    q: "Does making extra payments always save money?",
    a: "In most cases, yes, since extra payments reduce the principal balance that future interest is calculated on. If your rate is very low, though, the savings may be smaller than what that money could earn elsewhere, so it's worth comparing both paths before deciding.",
  },
  {
    q: "Why does my early payment go mostly toward interest?",
    a: "Interest is calculated on your current outstanding balance, which is highest at the start of the loan. As the balance shrinks with each payment, less interest accrues, so a growing share of each payment shifts toward principal.",
  },
  {
    q: "What is the \"tipping point\" or crossover point in an amortization schedule?",
    a: "It's the point where the principal portion of your payment finally becomes larger than the interest portion. On a typical 30-year mortgage this tends to land around year 18–19; on a 15-year mortgage it usually arrives by year three or four.",
  },
  {
    q: "Can I use this calculator for a mortgage, car loan, or personal loan?",
    a: "Yes. The same amortization logic applies to any fixed-rate installment loan, including mortgages, auto loans, personal loans, and student loans, just enter the specific loan amount, rate, and term.",
  },
  {
    q: "How does an adjustable-rate loan (ARM) affect amortization?",
    a: "After the initial fixed period ends, an ARM's rate adjusts with the market, and the lender builds a new amortization schedule using the current balance, the new rate, and the years remaining on the original term. You can model each rate period as a separate scenario using this calculator.",
  },
  {
    q: "Should I refinance if I'm partway through my loan?",
    a: "It depends on how far along you are. If you're still in the interest-heavy early years, a lower-rate refinance can genuinely save money. If you've already paid down a significant amount of principal, restarting the amortization clock can sometimes cost more in total interest than staying on your current schedule.",
  },
  {
    q: "How accurate is an online amortization calculator compared to my lender's numbers?",
    a: "The calculation method mirrors standard lending formulas, so figures should closely match your lender's schedule as long as the loan amount, rate, and term entered are accurate. Small differences can occur due to rounding, fees, or how a specific lender applies payment dates.",
  },
  {
    q: "Is this amortization calculator really free with no signup required?",
    a: "Yes. There's no account creation, no payment information required, and no hidden fees. You can generate as many schedules and scenarios as needed at no cost.",
  },
  {
    q: "What's the best extra payment strategy, monthly, yearly, or one-time?",
    a: "It depends on your cash flow. Consistent extra monthly payments tend to produce the most cumulative interest savings over time, while yearly lump sums, like a bonus or tax refund, can still meaningfully shorten a loan. One-time payments are useful for applying unexpected windfalls whenever they occur.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

const WORKED_EXAMPLE_ROWS = [
  ["End of year 1", "~$2,011", "~$413", "~$395,179"],
  ["End of year 5", "~$1,897", "~$527", "~$372,674"],
  ["End of year 10", "~$1,710", "~$714", "~$335,631"],
  ["End of year 15", "~$1,456", "~$968", "~$285,419"],
  ["End of year 19", "~$1,189", "~$1,235", "~$232,670"],
  ["End of year 25", "~$645", "~$1,779", "~$125,081"],
];

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
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

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Amortization?</h2>
        <p style={pStyle}>
          Amortization simply means paying off a debt gradually through regular payments, where each
          payment is split between interest and principal until the balance reaches zero. When you take out
          a mortgage, auto loan, or personal loan, the lender sets up a fixed monthly payment. A portion of
          that payment covers the interest charged on the amount you still owe, and the rest goes toward
          reducing the principal itself. Because interest is always calculated on the current outstanding
          balance, the interest portion shrinks a little with every payment as the balance goes down, and
          the principal portion grows in its place.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Not every type of debt works this way. Credit cards are revolving debt rather than amortized debt,
          the balance can be carried from month to month and the payment amount isn't fixed, so there's no
          set schedule leading to payoff. Interest-only loans and balloon loans also fall outside standard
          amortization: an interest-only loan has a stretch where payments cover interest alone with no
          reduction in principal, and a balloon loan ends with one large principal payment due at maturity
          rather than being paid down evenly over the term. This calculator is built for standard
          fixed-rate, fully amortizing loans, the type most mortgages, car loans, personal loans, and
          student loans use.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Amortization Outside of Loans: The Business Use of the Term</h2>
        <p style={pStyle}>
          The word "amortization" also shows up in accounting, where it means something related but
          distinct: spreading the cost of a long-lived asset across the periods it benefits, rather than
          recording the full expense at once. When a company buys something expensive that will be used for
          years, machinery, a building, equipment, recognizing the entire cost in the quarter it was
          purchased would distort that quarter's financial picture. So the cost gets spread out instead. For
          physical assets, this is usually called depreciation; for intangible assets, it's called
          amortization.
        </p>
        <p style={pStyle}>
          Under U.S. tax law (Section 197), businesses can amortize the cost of certain intangible assets
          over time rather than deducting them all at once. Assets commonly amortized under this rule
          include goodwill, the value of a business as a going concern, an assembled workforce, patents,
          copyrights, trade secrets and formulas, customer and supplier relationships, government-issued
          licenses and permits, non-compete agreements tied to a business acquisition, and trademarks or
          trade names. Some intangibles, goodwill with an indefinite useful life, for instance, or assets a
          business creates internally rather than acquires, generally can't be amortized for tax purposes.
          Certain items are excluded from Section 197 entirely, including interests in a business itself,
          most off-the-shelf computer software, existing leases or debt, and mortgage servicing rights
          unless acquired as part of buying a business.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A related case is startup costs. Expenses incurred while investigating or setting up a new
          business, things like consulting fees, market research, advertising before launch, or early
          employee costs, generally have to be amortized rather than deducted immediately, and only once the
          business officially becomes active. This calculator is built around loan repayment rather than
          business accounting, but if you've landed here researching the accounting meaning of amortization,
          the underlying math, spreading a cost or balance over time in defined increments, is the same
          concept applied to a different kind of asset.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Amortization Calculator</h2>
        <p style={pStyle}>Using the calculator takes just a few inputs:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}><strong>Loan amount</strong> — the total principal you're borrowing.</li>
          <li style={{ marginBottom: 6 }}><strong>Interest rate</strong> — your loan's annual percentage rate.</li>
          <li style={{ marginBottom: 6 }}><strong>Loan term</strong> — the repayment period, typically in years or months.</li>
          <li><strong>Optional extra payments</strong> — additional monthly, yearly, or one-time amounts you plan to contribute beyond the required payment.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Once you enter these details, the calculator instantly generates your monthly payment amount, the
          total interest you'll pay over the life of the loan, and a full amortization table showing the
          principal-to-interest split for every single payment period. There's no need to manually build a
          spreadsheet or apply the amortization formula yourself, the tool handles the calculation the
          moment you submit your numbers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Formula Behind the Numbers</h2>
        <p style={pStyle}>For a fixed-rate loan, the monthly principal-and-interest payment is calculated as:</p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
          M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ − 1]
        </p>
        <p style={pStyle}>Where:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 4 }}>M is your monthly payment</li>
          <li style={{ marginBottom: 4 }}>P is the loan principal (the amount borrowed)</li>
          <li style={{ marginBottom: 4 }}>r is the monthly interest rate (your annual rate divided by 12)</li>
          <li>n is the total number of payments (loan term in years multiplied by 12)</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          You don't need to work through this by hand, it's exactly what the calculator does behind the
          scenes, but knowing the formula helps explain why the numbers behave the way they do: because
          interest is recalculated on the remaining balance every period, the split between interest and
          principal keeps shifting even though the payment itself stays flat.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Your Amortization Schedule</h2>
        <p style={pStyle}>
          The amortization schedule is the heart of this tool, and reading it correctly helps you make
          smarter financial decisions. Each row typically represents one payment period and shows the
          payment amount, how much of it went to interest, how much went to principal, and the balance
          remaining afterward.
        </p>
        <p style={pStyle}>
          Early in the schedule, the interest portion is significantly higher than the principal portion,
          even though the total payment doesn't change. This is because interest is calculated on the
          outstanding balance, which is at its highest point at the start of the loan. As the balance drops,
          less interest accrues, so a growing share of each payment goes toward principal instead. This is
          why paying extra toward a loan early on has a much bigger long-term effect than doing the same
          thing later in the term.
        </p>
        <p style={pStyle}>
          <strong>The tipping point.</strong> There's a specific point in every loan where the principal
          portion of your payment finally overtakes the interest portion, this is sometimes called the
          crossover point. On a typical 30-year fixed loan, that point doesn't usually arrive until
          somewhere around year 18 or 19, which is a big part of why home equity builds so slowly in the
          early years of a mortgage. A 15-year loan reaches that same crossover much sooner, often by year
          three or four, since most of each payment is principal from the start.
        </p>
        <p style={pStyle}>
          <strong>Total interest paid.</strong> Looking at the total interest column at the end of the
          schedule is often the most eye-opening part of the exercise. On a large, long-term loan, total
          interest can end up rivaling or even exceeding the amount originally borrowed, which is exactly
          why comparing the total interest figure between two loan offers matters more than comparing
          monthly payments alone.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Equity growth.</strong> For a mortgage specifically, your equity is your down payment plus
          however much principal you've paid off so far (assuming the home's value hasn't changed). Because
          the schedule tracks the principal paid down period by period, it also effectively tracks how your
          equity builds over time, slowly at first, then faster as more of each payment shifts toward
          principal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Affects How Your Loan Amortizes</h2>
        <p style={pStyle}>Three variables largely determine the shape of your amortization schedule:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 10 }}>
            <strong>Loan term.</strong> A longer term, like a 30-year mortgage, produces a lower monthly
            payment but amortizes more slowly, meaning a larger share of total interest paid over the life
            of the loan. A shorter term, like 15 years, comes with a higher monthly payment but builds
            equity and reduces principal much faster, cutting total interest substantially even though the
            loan amount is identical.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Interest rate.</strong> Since interest is calculated on your remaining balance, a higher
            rate means more of every payment goes toward interest rather than principal, particularly in
            the early years when the balance is largest. Even a modest difference in rate can add up to a
            large difference in total interest paid over a 15- or 30-year term.
          </li>
          <li>
            <strong>Extra payments.</strong> This is the one factor fully within a borrower's control after
            the loan is already signed. Directing even a small amount extra toward principal each month
            reduces the balance that future interest is calculated on. Because that reduction compounds,
            less balance means less interest, which means more of each subsequent payment goes to
            principal, consistent extra payments can shorten a loan by years and cut total interest by a
            significant margin.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Extra Payments Shorten Your Loan and Save Interest</h2>
        <p style={pStyle}>This calculator lets you model extra payments before committing any real money to them. You can test three types:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}><strong>Extra monthly payments</strong> — a fixed additional amount added to every regular payment.</li>
          <li style={{ marginBottom: 6 }}><strong>Extra yearly payments</strong> — a lump sum applied once per year, such as from a tax refund or bonus.</li>
          <li><strong>One-time extra payments</strong> — a single additional payment applied at a specific point in the loan term.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because extra payments go straight to principal, they lower the balance that interest accrues on
          for every remaining payment, not just the current one. The calculator shows your new projected
          payoff date, how much interest you'd save compared to the original schedule, and how that savings
          compares to the size of the extra payment itself, useful information whether you're deciding
          between paying down debt or refinancing, or simply deciding where a windfall is best spent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example</h2>
        <p style={pStyle}>
          Take a $400,000 mortgage at a 6.10% fixed rate over 30 years. The monthly principal-and-interest
          payment comes out to roughly $2,424. In the first year, well over three-quarters of every payment
          is going toward interest rather than principal. That ratio doesn't flip in the borrower's favor
          until roughly the midpoint of the loan, by year 19 or so, the principal finally makes up the
          larger share of each payment. Here's roughly how the balance and payment split move over time on a
          loan like this:
        </p>
        <DataTable headers={["Point in loan", "Monthly interest", "Monthly principal", "Remaining balance"]} rows={WORKED_EXAMPLE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Running your own numbers through the calculator produces the same kind of breakdown tailored to
          your specific loan amount, rate, and term, rather than relying on a generic example.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Note on Adjustable-Rate Loans</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is built for fixed-rate loans, where the interest rate and payment amount stay
          constant for the entire term. Adjustable-rate loans (ARMs) work differently: after an initial
          fixed period, the rate moves up or down with market conditions, and the lender recalculates a new
          amortization schedule using the current balance, the new rate, and however many years remain on
          the original term. That recalculation can change the monthly payment meaningfully, sometimes more
          than once over the life of the loan. If you have an ARM, you can still use this calculator to
          model each rate period separately by entering the current balance, the new rate, and the
          remaining term as its own scenario.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Actually Need an Amortization Calculator</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 10 }}>
            <strong>Comparing loan offers.</strong> When two lenders quote different rates or terms, the
            monthly payment alone doesn't tell the full story. Running each offer through the calculator
            reveals total interest paid over the full term, which is often the more meaningful number for
            comparing true cost.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Planning a mortgage or refinance.</strong> Homebuyers use this tool to understand how
            their payment breaks down over 15, 20, or 30 years, and how refinancing to a shorter term or
            lower rate would change both the monthly payment and the lifetime interest cost. Worth noting:
            refinancing resets your amortization schedule back to month one, where the interest share of
            each payment is at its highest. If you're still early in your current loan's interest-heavy
            years, a lower-rate refinance can save real money, but if you've already worked through much of
            that front-loaded interest, restarting the clock can sometimes cost more than staying the
            course.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Deciding whether to pay off debt early.</strong> Before committing extra funds to a
            loan, it helps to see the actual dollar impact, some loans benefit enormously from early extra
            payments, while others with very low rates may not justify diverting money away from
            higher-return uses.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Budgeting for a car or personal loan.</strong> Auto and personal loan terms are shorter,
            but the same principal-versus-interest dynamic applies. Seeing the schedule helps buyers avoid
            loans where a large share of early payments goes to interest with minimal equity gained.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Financial planning and tax preparation.</strong> Some borrowers need to estimate annual
            interest paid for tax purposes or long-term budgeting, and a full year-by-year breakdown makes
            this straightforward without waiting for an official statement.
          </li>
          <li>
            <strong>Student loan repayment strategy.</strong> Borrowers evaluating whether to make extra
            payments during or after school can see precisely how early contributions reduce total
            repayment cost.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Why This Tool Is Free</h2>
        <p style={pStyle}>
          The calculations behind this tool follow the standard amortization formula used across lending and
          finance, applying your inputs consistently to generate the monthly payment, interest breakdown,
          and schedule. Because the math mirrors the same principal-and-interest logic lenders use
          internally, the output reflects how your actual loan would amortize under the terms you enter.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is completely free to use, with no signup, account creation, or hidden charges required.
          You can run as many scenarios as you like, comparing different rates, terms, or extra payment
          amounts, without limits or paywalls. No personal or financial information you enter is stored;
          calculations happen for your session only, so there's no loan data left behind for you to worry
          about. This makes it practical to test multiple "what if" scenarios freely, whether you're
          shopping for a mortgage rate or deciding how aggressively to pay down an existing loan.
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
