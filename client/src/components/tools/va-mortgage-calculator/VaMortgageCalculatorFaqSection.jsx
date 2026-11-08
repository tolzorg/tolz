import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a VA mortgage calculator?",
    a: "It estimates the monthly payment on a VA-backed home loan. It builds in the VA funding fee, your down payment, rate and term, and it can add property taxes, insurance and HOA dues so you see the full monthly cost.",
  },
  {
    q: "How much is the VA funding fee in 2026?",
    a: "For purchases, first-time users pay 2.15% with less than 5% down, 1.5% with 5% to 9.99% down, and 1.25% with 10% or more. Subsequent users pay 3.3% with less than 5% down, then the same lower rates at higher down payments. Cash-out refinances are 2.15% or 3.3%, and an IRRRL is 0.5%.",
  },
  {
    q: "Can I roll the funding fee into my VA loan?",
    a: "Yes. Most borrowers finance it. That raises your balance and payment slightly, but you don’t need the cash at closing. You can also pay it upfront.",
  },
  {
    q: "Who doesn’t have to pay the VA funding fee?",
    a: "Veterans receiving compensation for a service-connected disability rated 10% or higher, Purple Heart recipients, and surviving spouses receiving Dependency and Indemnity Compensation are generally exempt.",
  },
  {
    q: "Do VA loans have mortgage insurance?",
    a: "No. There’s no monthly mortgage insurance on a VA loan, even with nothing down. The funding fee is the main VA-specific cost.",
  },
  {
    q: "What credit score do I need for a VA loan?",
    a: "VA doesn’t set a minimum score. Lenders do, and many look for 620 or higher. Some will go lower with strong income and other positives.",
  },
  {
    q: "Is there a limit on how much I can borrow with a VA loan?",
    a: "If you have full entitlement, VA doesn’t set a loan limit. Your lender still decides how much you can borrow based on income, credit and debts. If you have partial entitlement, the county conforming loan limit affects how much you can borrow without a down payment. In 2026, that’s $832,750 in most counties.",
  },
  {
    q: "Can I use a VA loan for an investment property?",
    a: "No. VA loans are only for primary residences. The exception is a multi-unit property up to four units where you live in one unit.",
  },
  {
    q: "Can I make extra payments on a VA loan?",
    a: "Yes, and there’s no prepayment penalty. Extra payments reduce principal, cut your interest, and shorten the loan. Ask your servicer to apply them to principal.",
  },
  {
    q: "Are bi-weekly payments better than monthly?",
    a: "They can help because 26 half-payments equal 13 full payments a year. Check that your servicer doesn’t charge fees or hold the half-payments before applying them.",
  },
  {
    q: "How accurate is this VA loan calculator?",
    a: "It uses standard amortization math, so it’s accurate for what you enter. Your real payment can differ because of rate changes, tax reassessments, insurance changes and lender fees.",
  },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "Is there a limit on how much I can borrow with a VA loan?": "If you have full entitlement, VA doesn't set a loan limit, though your lender still decides how much you can borrow. If you have partial entitlement, the county conforming loan limit affects how much you can borrow without a down payment. In 2026, that's $832,750 in most counties.",
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) }));

const FEE_HEADERS = ["Down payment", "First use", "Subsequent use"];
const FEE_ROWS = [
  ["Less than 5%", "2.15%", "3.3%"],
  ["5% to 9.99%", "1.5%", "1.5%"],
  ["10% or more", "1.25%", "1.25%"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
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

export default function VaMortgageCalculatorFaqSection() {
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
        <h2 style={h2Style}>What a VA Mortgage Calculator Does Differently</h2>
        <p style={pStyle}>
          A standard calculator takes a loan amount, a rate and a term, and spits out principal and interest. That’s it. A VA
          home loan calculator has to handle a few more things.
        </p>
        <p style={pStyle}>
          First, there’s the VA funding fee, a one-time charge that depends on your down payment and whether you’ve used the
          benefit before. Second, there’s the choice of paying that fee at closing or rolling it into the loan, which changes
          both your balance and your payment. Third, there’s what’s missing: VA loans don’t have monthly mortgage insurance.
          Plenty of calculators add it automatically, which makes a VA payment look higher than it really is.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If a calculator skips the fee, your balance will be too low. If it adds mortgage insurance, your payment will be too
          high. This VA loan payment calculator avoids both mistakes, and it goes further than the basics. You can layer in
          property taxes, homeowners insurance, HOA dues and other monthly costs, test extra payments, compare a bi-weekly
          schedule against regular monthly payments, and pull up a full amortization schedule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This VA Mortgage Calculator</h2>
        <p style={pStyle}>
          Start with the home price and your down payment. If you’re using the zero-down benefit, enter 0. Then add your
          interest rate and loan term. Thirty years is the usual pick, but 20 and 15 are common for people who’d rather pay
          less interest and don’t mind a bigger payment.
        </p>
        <p style={pStyle}>
          Next comes the funding fee. Pick first use or subsequent use, mark whether you’re exempt, and choose whether you’ll
          finance it or pay it upfront. After that, drop in your annual property tax, annual homeowners insurance, monthly HOA
          dues, and anything else you pay regularly for the house. Want to see how fast you could pay it off? Add an extra
          payment or turn on the bi-weekly comparison.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You’ll get your principal and interest, your estimated total monthly payment, the funding fee amount, the final loan
          balance, and the total interest over the life of the loan. Change one number at a time. That’s the quickest way to
          see which one is actually moving your payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>VA Funding Fee: Rates, Exemptions and How It’s Added to Your Loan</h2>
        <p style={pStyle}>
          The funding fee is the biggest VA-specific number in any VA funding fee calculator. It’s a one-time charge,
          calculated as a percentage of your loan amount. It helps keep the program running and covers losses when a
          VA-backed loan goes bad, so the program doesn’t depend on taxpayer money to keep going. For most purchases, it lands
          somewhere between 1.25% and 3.3%.
        </p>
        <p style={pStyle}>
          Here are the current purchase and construction rates. They’ve been in place since April 2023 and are still the same
          for 2026.
        </p>
        <DataTable headers={FEE_HEADERS} rows={FEE_ROWS} />
        <p style={pStyle}>
          A few other loan types have their own rates. Cash-out refinances are a flat 2.15% for first use and 3.3% for
          subsequent use, with no down payment tiers. An Interest Rate Reduction Refinance Loan (IRRRL), which lowers the rate
          on an existing VA loan, carries 0.5%. So does a loan assumption, where someone takes over your existing VA loan. A
          manufactured home that isn’t permanently affixed to land is 1%. Native American Direct Loans are 1.25% for
          purchases and 0.5% for refinances.
        </p>
        <p style={pStyle}>
          Some people don’t pay it at all. If you get VA disability compensation for a service-connected disability rated 10%
          or higher, you’re exempt. So are Purple Heart recipients and surviving spouses who receive Dependency and Indemnity
          Compensation. Service members who are on active duty and have a pending disability claim may qualify too, since
          they’d be rated eligible once the claim goes through. If your rating comes through after closing and it’s backdated
          to a date before your loan closed, you can ask VA for a refund of the fee. People miss that one all the time.
        </p>
        <p style={pStyle}>
          Here’s what the fee looks like in real dollars. On a $400,000 zero-down purchase, a first-time user pays $8,600. A
          repeat user pays $13,200. Roll the $8,600 into the loan and your balance goes to $408,600. At 6.5% over 30 years,
          that adds about $54 a month to principal and interest. Pay it in cash instead and the loan stays at $400,000, but
          you need the money on closing day.
        </p>
        <p style={pStyle}>
          You can finance the funding fee, but you can’t finance most other closing costs. That’s an important difference from
          what a lot of people assume. Everything else gets paid in cash at closing, through a seller credit, or through a
          lender credit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also try the 5% down scenario. For someone on their second VA loan, 5% down knocks the fee from 3.3% all the way to
          1.5%. On a $400,000 home, putting $20,000 down saves about $6,900 in fees on the smaller loan. Whether that trade
          makes sense depends on your cash, but it’s worth seeing the number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Else You’ll Pay at Closing</h2>
        <p style={pStyle}>The funding fee gets all the attention, but it’s not the only cost. Most buyers also run into these.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Loan origination fee.</strong> This covers the lender’s work processing the loan. VA caps it at 1% of the loan amount, and a lot of lenders charge less or use a flat fee.</li>
          <li style={liStyle}><strong>Discount points.</strong> You pay these to get a lower rate. One point costs 1% of the loan. On a $408,600 loan, that’s $4,086. If a point drops your rate from 6.5% to 6.25%, your payment falls by about $67 a month, so you’d break even in roughly five years. Plan to sell or refinance before that and points aren’t worth it. Two points or fewer is generally seen as reasonable, and the seller can pay for them.</li>
          <li style={liStyle}><strong>Credit report.</strong> Lenders pass this cost on to you. It’s usually small, and you don’t get it back if the loan falls through.</li>
          <li style={liStyle}><strong>VA appraisal.</strong> A VA-assigned appraiser checks the home’s value and also confirms it meets the VA’s minimum property requirements, which basically means it’s safe, sound and livable. The fee varies by region and generally runs from several hundred dollars to more than $1,000. You don’t get that back if the deal dies either.</li>
          <li style={liStyle}><strong>Prepaid taxes and homeowners insurance.</strong> Lenders usually collect a year of insurance upfront and set up an escrow account with a few months of taxes and insurance already in it.</li>
          <li style={lastLi}><strong>Title insurance and recording fees.</strong> Title insurance makes sure there are no liens or ownership problems with the property. Recording fees cover filing your deed with the county. Who pays for title insurance depends on your state and local custom, so ask your agent.</li>
        </ul>
        <p style={pStyle}>
          Total closing costs on a VA loan often land around 2% to 5% of the purchase price, not counting the funding fee. VA
          also keeps a list of fees that veterans aren’t allowed to be charged, and your lender has to follow it. If you see a
          fee you don’t understand, ask what it is and whether it’s allowed.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The seller can cover a lot of this. VA lets sellers pay your closing costs and also contribute up to 4% of the loan
          value in concessions on top of that, things like paying off your debts, covering discount points, or prepaying taxes
          and insurance. Sellers don’t have to do it, and in a hot market you might not get far asking. But it’s a real tool,
          and the calculator helps you see how much of a difference it makes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Beyond Principal and Interest: Taxes, Insurance, HOA and Other Costs</h2>
        <p style={pStyle}>
          The monthly payment lenders and budgets care about is called PITI: principal, interest, taxes and insurance. This VA
          mortgage calculator with taxes and insurance puts all four together, plus HOA dues and other recurring costs.
        </p>
        <p style={pStyle}>
          Here’s a rough example. Take that $408,600 loan at 6.5%, with a principal and interest payment around $2,583. Add
          property tax at roughly 1.1% of the home’s value, which is about $367 a month on a $400,000 house. Add $150 a month
          for homeowners insurance and a $75 HOA fee. Your real monthly payment is closer to $3,175, about $590 more than the
          number most people fixate on.
        </p>
        <p style={pStyle}>
          Property taxes vary a lot by county, and they can jump after you buy, since many places reassess a home when it
          sells. Using the seller’s current tax bill is a decent starting point, but call the county assessor and ask how they
          handle sales. Insurance depends on the home’s age, location and coverage, and in some areas you’ll need separate
          flood or windstorm coverage. Get a real quote before you settle on a number. HOA dues are usually paid separately
          from the mortgage, and they can go up, so ask about recent increases and any special assessments.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Seeing the total is what keeps you from falling in love with a house you can’t actually afford to carry.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You’d Use a VA Home Loan Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Figuring out a price range.</strong> Start with a monthly payment you’re comfortable with, then adjust the home price until the total payment fits.</li>
          <li style={liStyle}><strong>Comparing zero down against putting money down.</strong> Run the same house at 0%, 5% and 10% down. Watch how the funding fee, loan balance and payment all shift.</li>
          <li style={liStyle}><strong>Deciding whether to finance the fee.</strong> If cash is tight, financing is convenient. If you’ve got savings and want a smaller balance, paying upfront saves interest over time.</li>
          <li style={liStyle}><strong>Picking a term.</strong> A 15-year loan costs a lot more per month but saves a huge amount of interest. The calculator shows whether the payment is workable.</li>
          <li style={liStyle}><strong>Comparing two homes.</strong> A cheaper listing can still cost more each month if the tax rate or HOA is higher.</li>
          <li style={lastLi}><strong>Checking your numbers before you talk to a lender.</strong> A calculator isn’t a pre-approval, but it helps you ask better questions and catch anything that looks off.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Extra Payments: Paying Off a VA Loan Faster</h2>
        <p style={pStyle}>
          VA loans don’t have prepayment penalties. Federal rules say you can pay off all or part of the loan at any time
          without a fee or premium, as long as the payment is at least one installment or $100, whichever is less. That makes
          extra payments easy to use.
        </p>
        <p style={pStyle}>
          The VA loan calculator with extra payments lets you add an extra amount and see what happens. Use the same loan from
          earlier, $408,600 at 6.5% for 30 years. Adding $200 a month cuts the payoff time by roughly five years and saves in
          the neighborhood of $100,000 in interest. Early extra payments do the most because they shrink the balance that
          interest keeps getting charged on for decades. Try monthly, yearly and one-time amounts too, like a tax refund or a
          bonus, and see how each one changes the total interest and the payoff date.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That said, extra payments aren’t right for everybody. If you’re carrying credit card debt at 22%, paying that off
          first is a better move than sending extra to a 6.5% mortgage. If you don’t have an emergency fund, build one first,
          because money you’ve already put into your house is hard to pull back out. When you do pay extra, tell your servicer
          to apply it to principal, or some will just treat it as an early payment next month.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bi-Weekly Payments vs. Monthly Payments</h2>
        <p style={pStyle}>
          The bi-weekly comparison models a different way to pay. Instead of one full payment a month, you pay half every two
          weeks. There are 26 two-week periods in a year, so you end up making 26 half-payments, which equals 13 full
          payments. That extra payment goes toward principal, and it shortens the loan.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Before you sign up for a bi-weekly program through your servicer, ask about fees. Some charge a setup fee or a
          per-payment fee, and some hold your half-payments until they add up to a full one, which cancels out most of the
          benefit. You can get nearly the same result on your own by dividing your monthly payment by 12 and adding that
          amount to each regular payment. No program, no fees.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your VA Loan Amortization Schedule</h2>
        <p style={pStyle}>
          The amortization schedule breaks every payment into principal and interest, then shows what you still owe. At the
          start of the loan, most of each payment goes to interest. Over time, that flips.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It’s worth looking at for a few reasons. You can see how much equity you’ll have in five or ten years, which matters
          if you might sell or refinance. You can spot the month when principal finally overtakes interest. And if you’ve
          added extra payments, you can see how many payments disappear from the end of the schedule. For a lot of people,
          that last part is more motivating than a total-interest number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Advantages of Buying a Home With a VA Loan</h2>
        <p style={pStyle}>
          The headline benefit is that most buyers can purchase with nothing down. Not many mortgages work that way. USDA loans
          do, in eligible rural areas, and a few lenders offer their own low-down-payment programs. But conventional loans
          typically want 3% to 5% down, and FHA wants at least 3.5%.
        </p>
        <p style={pStyle}>
          The second big one is no monthly mortgage insurance. On a conventional loan with less than 20% down, private mortgage
          insurance runs roughly 0.5% to 1% of the loan a year. FHA loans charge mortgage insurance too, and on most FHA loans
          it sticks around for the life of the loan if you put down less than 10%. On a VA loan, there’s nothing like that.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are more. VA loans tend to carry slightly lower interest rates than comparable conventional loans. Closing
          costs are capped in ways that protect you, like the 1% limit on origination fees. The VA’s appraisal and minimum
          property standards give you a second look at the home’s condition and value, so you’re less likely to overpay or buy
          something with serious problems. Credit standards are looser than most conventional programs. There’s no prepayment
          penalty. And VA loans can be assumed by someone else with lender approval, which can be a selling point if rates go
          up later. You also don’t have to be a first-time buyer. Eligible borrowers can use the benefit again and again.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Home Loan Benefits Veterans Are Eligible For</h2>
        <p style={pStyle}>A lot of people hear “VA loan” and think of one product, but the home loan benefit covers more.</p>
        <p style={pStyle}>
          The purchase loan is the one most people use, and it works for single-family homes, townhomes, VA-approved condos,
          and multi-unit properties up to four units as long as you live in one. Construction loans and loans for building on
          land you own are possible too, though fewer lenders offer them.
        </p>
        <p style={pStyle}>
          On the refinance side, the IRRRL (sometimes called a streamline) lowers the rate on an existing VA loan, usually
          without an appraisal or much paperwork. You can even use it to swap an adjustable-rate loan for a fixed one. A
          cash-out refinance lets you tap equity, and it can also be used to refinance a non-VA mortgage into a VA loan.
        </p>
        <p style={pStyle}>
          There are some specialty options. Native American Direct Loans help eligible Native American veterans buy or build
          on federal trust land. Energy-efficient mortgages let you finance certain energy upgrades on top of the loan.
          Manufactured home loans cover mobile and manufactured homes in certain situations.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond loans, VA offers adapted housing grants for veterans with qualifying service-connected disabilities who need
          to modify a home. Many states also give disabled veterans property tax breaks, and those can be significant. They
          vary by state, so check with your county or state veterans office.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Does a VA Home Loan Work?</h2>
        <p style={pStyle}>
          The first thing to know is that VA doesn’t actually lend you the money. A private lender, like a bank or mortgage
          company, does that. What VA does is guarantee part of the loan, typically 25% of it. That guarantee protects the
          lender if you default, which is why lenders are willing to skip the down payment and offer better terms.
        </p>
        <p style={pStyle}>
          Here’s how it usually goes. You get your Certificate of Eligibility, which proves you qualify. You talk to a lender,
          who checks your credit, income and debt, and gives you a pre-approval. You find a home and make an offer, which
          includes a VA addendum with some protective terms. The lender orders a VA appraisal. If the appraisal comes in below
          your offer, the VA’s amendatory clause lets you walk away and get your earnest money back, or renegotiate, unless
          you choose to cover the gap. Then underwriting reviews everything, you close, and you pay the funding fee along with
          your other costs.
        </p>
        <p style={pStyle}>
          Underwriting looks at the usual stuff: credit, income stability, and debt-to-income ratio. VA adds a residual income
          test, which checks how much money you’d have left each month after housing, debts and living expenses. The test
          varies by loan size, family size and region. There’s no hard credit score cutoff from VA itself, but many lenders
          want 620 or higher. Closing typically takes around 30 to 45 days.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You have to plan on living in the home. VA loans are for primary residences, so you’ll certify you’ll move in,
          generally within about 60 days of closing. They can’t be used for vacation homes, investment properties or empty
          land.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is a VA Home Loan Worth It?</h2>
        <p style={pStyle}>For most people who qualify, yes. But it isn’t automatically the best deal for everybody, so run the numbers.</p>
        <p style={pStyle}>
          Say you’re buying that $400,000 house at the same 6.5% rate across three loans, with real-world rates differing a
          bit. With a VA loan and nothing down, you finance the funding fee and your principal and interest is about $2,583.
          With FHA and 3.5% down ($14,000), you’d pay the 1.75% upfront mortgage insurance premium and about 0.55% a year in
          ongoing mortgage insurance, so you’re looking at around $2,660 a month. With a conventional loan and 5% down
          ($20,000), your principal and interest is about $2,400, plus private mortgage insurance of maybe $200 or so, putting
          you near $2,620. The VA loan comes out cheapest each month and needs the least cash upfront. Credit and rate quotes
          can shift all of this, so your own numbers matter.
        </p>
        <p style={pStyle}>
          Where a conventional loan might win: you’ve got 20% to put down, so you skip both the funding fee and mortgage
          insurance, and you’d rather not deal with VA appraisal rules. If you’re exempt from the funding fee, VA is almost
          always ahead.
        </p>

        <h3 style={h3Style}>The downsides, in plain terms:</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}>Only people with qualifying service and discharge status can use it.</li>
          <li style={liStyle}>The funding fee can run into the thousands if you’re not exempt.</li>
          <li style={liStyle}>It’s for primary residences only. No rentals, no flips, no vacant land.</li>
          <li style={liStyle}>Not every home qualifies. Because VA sets minimum property standards, a house with a bad roof or peeling lead paint may need repairs before closing.</li>
          <li style={liStyle}>Some sellers and agents are less familiar with VA loans, and some lenders give out wrong information. Work with a lender that closes a lot of them.</li>
          <li style={liStyle}>Standard VA purchase loans don’t include a big renovation budget. There are limited ways around it, like energy-efficiency financing and a few renovation loan products, but a true fixer-upper is a tough fit.</li>
          <li style={lastLi}>There’s a pile of paperwork.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most buyers who can qualify, the benefits clearly outweigh the downsides. The funding fee is the thing to weigh.
          Make sure what you’d pay is less than what you’d save compared to the other options.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Have More Than One VA Loan?</h2>
        <p style={pStyle}>
          Yes. Your VA benefit isn’t a one-time deal. What limits you is entitlement, which is the dollar amount VA is willing
          to guarantee for you.
        </p>
        <p style={pStyle}>
          If you’ve never used your benefit, you have full entitlement, and there’s no VA loan limit at all. Lenders still set
          their own maximums based on your income and credit, but VA doesn’t cap how much you can borrow.
        </p>
        <p style={pStyle}>
          Once you have an active VA loan, part of your entitlement is tied up. What’s left is called remaining entitlement.
          For the second loan, the county conforming loan limit comes into play. In 2026, that’s $832,750 in most counties and
          up to $1,249,125 in high-cost areas. VA guarantees 25% of that limit, minus what you’ve already used.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here’s a simple example. Say your first VA loan was $300,000, so you’ve used about $75,000 of entitlement. In a county
          with the standard $832,750 limit, 25% is about $208,187. Subtract the $75,000 and you’ve got roughly $133,000 left,
          which supports a no-down-payment loan of about $532,750. Go above that and you’d have to put down enough to cover
          the gap, since lenders want to see 25% of the loan guaranteed between your entitlement and your down payment. Your
          Certificate of Eligibility shows your exact remaining entitlement, so check it before you start house hunting.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Do So Many Veterans Misunderstand How VA Loans Work?</h2>
        <p style={pStyle}>
          Mostly, it’s because the information is scattered and a lot of it is wrong. There are a few reasons it keeps
          happening.
        </p>
        <p style={pStyle}>
          The first is the name. “VA loan” sounds like VA is the lender, so people think they’re applying to the government.
          They’re not. They’re applying to a regular lender whose loan has a VA guarantee. That’s why rates, fees and customer
          service vary so much between lenders, and why shopping around matters.
        </p>
        <p style={pStyle}>
          Second, a bunch of myths keep going around. People think you can only use the benefit once, that you need to be a
          first-time buyer, that you have to have been in combat, that there’s a loan limit for everyone, that sellers hate VA
          offers, or that you can’t buy a condo. None of those are true. Some of them are partly true in specific situations,
          which is how they hang around.
        </p>
        <p style={pStyle}>
          Third, plenty of lenders and agents don’t work with VA loans much. If your loan officer closes two a year, you might
          hear wrong information about the appraisal process, the fee or the paperwork. It’s smart to ask any lender how many
          VA loans they close in a year before you commit.
        </p>
        <p style={pStyle}>
          Fourth, there’s a pile of other benefits that get mixed up with the home loan: the GI Bill, disability compensation,
          VA health care. People assume using one burns up another. Mostly it doesn’t.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want a straight answer, start with VA.gov, then confirm details with your lender and your COE.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the GI Bill and VA Home Loans Work Together</h2>
        <p style={pStyle}>
          These are two separate benefits, and using one doesn’t use up the other. The GI Bill is an education benefit.
          Depending on which version you have, it can pay for tuition, a housing allowance and books or supplies. The VA home
          loan is a guarantee that makes it easier to get a mortgage. They have different rules, different eligibility
          timelines, and different purposes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Where they connect is in real life. A lot of veterans use the GI Bill to finish a degree or learn a trade, then use
          the home loan benefit years later when they’ve got a steady job and want to buy. A degree can raise your income,
          which makes it easier to qualify for a bigger mortgage. A veteran who buys a home with a VA loan can also build
          equity that helps with a later move, a business or retirement. Together, they help turn military service into
          long-term financial stability. The honest catch is that these benefits don’t automatically feed each other, and you
          have to apply for each one separately.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Get a VA Loan With Your DD214</h2>
        <p style={pStyle}>Start with eligibility. To qualify for a VA loan, you generally need one of the following:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>90 consecutive days of active service during wartime</li>
          <li style={liStyle}>181 days of active service during peacetime</li>
          <li style={liStyle}>6 years in the National Guard or Selected Reserve</li>
          <li style={liStyle}>90 days of active duty for certain Guard and Reserve members (at least 30 consecutive days if the service was under Title 32 orders)</li>
          <li style={lastLi}>Status as the surviving spouse of a service member who died in service or from a service-connected disability</li>
        </ul>
        <p style={pStyle}>
          Your discharge also matters. You’ll often hear that you need an “honorable discharge,” but the real standard is a
          discharge that’s anything other than dishonorable. Some service members with other-than-honorable discharges can
          still qualify after VA reviews their case.
        </p>
        <p style={pStyle}>
          Next, get your Certificate of Eligibility, or COE. This is the document that proves to lenders that you meet the
          service rules. You can request it on VA.gov, by mail, or through your lender, and lenders can often pull it in
          minutes using VA’s online system. For veterans, the main document is your DD214, Member 4 copy if you can find it.
          Active-duty members use a statement of service signed by their commander. Guard and Reserve members have their own
          paperwork. Since July 2025, the Guard and Reserve issued a DD214-1 addendum along with the DD214.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A COE says you’re eligible. It doesn’t say you’re approved. The lender still reviews your credit, income, debts and
          residual income. Get pre-approved early, and have your DD214 ready before you start.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can a Veteran Over 70 Refinance With a VA Loan If They’ve Never Used One?</h2>
        <p style={pStyle}>
          Yes. VA loans have no maximum age. What counts is whether you meet the service requirements and whether you can show
          the income to repay the loan.
        </p>
        <p style={pStyle}>
          If you’ve never used the benefit, you can refinance an existing non-VA mortgage, like a conventional or FHA loan,
          into a VA loan. That’s a regular refinance or a cash-out refinance, not an IRRRL, since the IRRRL only works if you
          already have a VA loan. You’ll need a COE, the home has to be your primary residence, and it’ll need a VA appraisal.
          The funding fee on these refinances is 2.15% for first use, unless you’re exempt, and you can finance it.
        </p>
        <p style={pStyle}>
          Income is where older borrowers sometimes run into questions. Social Security, pensions, retirement account
          distributions and VA disability benefits can all count. Lenders usually want to see that the income will continue
          for at least three years. For retirement account withdrawals, they’ll document the account balance and how long
          it’ll last. VA disability is tax-free income, and some lenders count it at a higher value. If you’ve got a 10% or
          higher disability rating, you won’t pay the funding fee, which can make a refinance a lot more attractive.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether it makes sense depends on your rate, how long you plan to stay, and whether the closing costs and funding fee
          are paid back by lower payments. Plug the numbers into the calculator and compare your current payment with the new
          one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Use VA Loan Money to Start a Business?</h2>
        <p style={pStyle}>
          Not with a standard VA purchase loan. That money has to go toward a primary residence, and the lender sends it
          straight to the seller at closing. You can’t get cash out of it.
        </p>
        <p style={pStyle}>
          There’s a workaround people talk about: a VA cash-out refinance. It lets you borrow against your home’s equity, and
          VA doesn’t tell you what to do with the cash. In theory, some of it can go into a business. In practice, you’d be
          using your home as collateral for business risk, paying a funding fee of 2.15% or more, and increasing your mortgage
          balance. If the business fails, you still owe the mortgage. Many veterans find that SBA financing, equipment loans
          or savings are a safer way to fund a business.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want to run a business from home, that’s allowed. VA appraisals accept homes where a business use, like a home
          office or a small daycare, is incidental to the residence. It just can’t be a mostly commercial property.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Kinds of Businesses Do Veterans Start Using SBA Loans?</h2>
        <p style={pStyle}>
          The SBA doesn’t publish one clean number for this, but government and Census data on veteran-owned businesses show
          clear patterns. About 30% of veteran-owned firms are in construction or professional, scientific and technical
          services, which includes consulting, engineering and IT. Transportation and warehousing, finance and insurance, and
          franchises also show up often. A lot of veterans lean on skills from service, like logistics, security, project
          management and trades, so trucking companies, contractors, consultants, security firms and government contractors
          are common.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The SBA 7(a) is the most widely used loan, and veteran-owned businesses can use it for equipment, working capital,
          real estate or buying an existing business. The SBA has offered fee relief for veterans in the past, and the details
          change, so ask your lender what’s available now. Free help comes from programs like Boots to Business and the
          Veterans Business Outreach Centers. Most SBA lenders want to see at least a couple of years of operating history,
          though startups can still qualify with strong personal credit, collateral and a solid plan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting a VA Loan After Foreclosure</h2>
        <p style={pStyle}>A foreclosure doesn’t end your VA benefit. It does slow you down, and it can reduce your entitlement.</p>
        <p style={pStyle}>
          There are two things to deal with. The first is the waiting period. The common guideline is two years from the
          foreclosure date, and that’s usually a lender requirement rather than a hard VA rule. Lenders often add their own
          conditions, like a credit score around 620 or higher. For other housing events, two years after a Chapter 7
          bankruptcy discharge is typical, and one year into a Chapter 13 with court approval can work. Short sales vary by
          lender. These waits are shorter than most other programs. FHA is typically three years after foreclosure, and
          conventional loans commonly require seven.
        </p>
        <p style={pStyle}>
          The second is entitlement. If the foreclosure was on a VA loan and VA paid the lender a claim, that amount comes out
          of your entitlement. To get your full entitlement back, you’d generally need to repay the amount VA lost. Otherwise
          you can still buy with what’s left, but you may need a down payment on the new loan, depending on the price. A
          foreclosure on a non-VA loan, like FHA or conventional, doesn’t touch your entitlement.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Use the waiting period well. Pay everything on time, pay down balances, keep a steady job, and save for a down
          payment. Be ready to write a letter explaining what happened, especially if it was caused by something outside your
          control like a job loss, medical issue or divorce. Then get an updated COE and ask lenders how they treat prior
          foreclosures, since overlays vary.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Buy Multiple Homes With the VA Loan Program?</h2>
        <p style={pStyle}>
          You can use the VA loan more than once, but not like an investor. The rule is that each home you finance with it has
          to be your primary residence.
        </p>
        <p style={pStyle}>
          Here’s how it works in practice. You can have two VA loans at once if you still have remaining entitlement and you
          actually plan to live in the new place. A common example is a service member who gets orders to a new base. They
          keep the first home as a rental, which is allowed once they’ve lived there, and buy a new one with a second VA loan.
        </p>
        <p style={pStyle}>
          You can’t use a VA loan to buy a vacation house, a rental property, or a second home to sit in. You can buy a duplex,
          triplex or four-unit building if you live in one of the units and rent out the others. That’s one of the best
          house-hacking moves available.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you sell your first home and pay off the loan, your entitlement is fully restored. If you want to keep the
          property but regain your entitlement, VA has a one-time restoration for paid-off loans. Someone else can also take
          over your VA loan through an assumption, and if they’re a qualified veteran willing to substitute their entitlement,
          yours is freed up. Without that, your entitlement stays tied to the loan until it’s paid off.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Change the Name on a VA Loan</h2>
        <p style={pStyle}>It depends on what kind of change you mean, because the process is very different for each.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>A legal name change, like after a marriage or divorce.</strong> Your loan isn’t affected. Send your servicer a certified copy of the marriage certificate or court order, and they’ll update the records. Update your insurance and any escrow accounts too. You don’t need to refinance.</li>
          <li style={liStyle}><strong>Adding a spouse or co-owner to the title.</strong> You can usually add someone to the deed without touching the loan, and federal law generally protects transfers to a spouse from triggering the due-on-sale clause. Adding them to the loan itself is different, and usually requires a refinance or a formal assumption.</li>
          <li style={liStyle}><strong>Removing an ex-spouse from the loan.</strong> A divorce decree says who’s supposed to pay, but it doesn’t remove anyone’s legal responsibility to the lender. To take someone off, you’d normally refinance in your own name or complete an assumption with a release of liability, with lender approval.</li>
          <li style={lastLi}><strong>Transferring the loan to someone else.</strong> VA loans are assumable. The buyer has to get approved by the lender and pay a funding fee of 0.5%. They don’t have to be a veteran, though if they aren’t, your entitlement stays tied up unless a qualified veteran takes over.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Start with your servicer, since their requirements decide how it goes.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens If You Don’t Pay Your Down Payment on a VA Loan?</h2>
        <p style={pStyle}>
          First, a lot of VA buyers don’t owe one. If that’s you, nothing happens. You just pay the funding fee, which you can
          finance, plus your closing costs.
        </p>
        <p style={pStyle}>
          A down payment might be required if the home appraises for less than the price and you decide to pay the difference.
          It can also come into play if you’ve got partial entitlement and the loan is above what your remaining entitlement
          covers, or if a lender decides your finances need it. Putting some money down on purpose can also lower the funding
          fee and your payment.
        </p>
        <p style={pStyle}>
          If you’ve promised a down payment and can’t come up with it by closing, the lender can’t fund the loan, and the deal
          can fall apart. Depending on your contract, you could lose your earnest money or be held in breach. Talk to your
          agent and lender as early as you can. Sometimes the seller will agree to an extension, a price change or a credit,
          and sometimes you can restructure how much you put down. Gift money is generally allowed for VA down payments, but
          it has to be documented.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the problem is an appraisal that comes in under the price, the VA’s amendatory clause protects you. You aren’t
          forced to buy at the higher price, and you can usually get your earnest money back if you walk away.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private and Easy to Check</h2>
        <p style={pStyle}>
          This VA mortgage calculator is free to use. You don’t pay for results, the amortization schedule or the comparisons.
          You only need to enter numbers like price, rate, taxes and insurance. You don’t need to enter your name, Social
          Security number or service record, and you shouldn’t.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The results come from standard amortization math, so they’re only as good as what you type in. Use a rate from a
          current lender quote, real tax and insurance figures for the specific home, and the right funding fee tier for your
          situation. Treat the output as a planning estimate. Your lender’s Loan Estimate is the document with binding
          numbers, and your COE is the document that confirms your eligibility and remaining entitlement.
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
