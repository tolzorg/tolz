import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a good return on a rental property?",
    a: "There’s no universal number. Many investors treat 8% to 12% as attractive and 5% to 8% as reasonable for lower-risk deals, but it depends on your market, financing and risk tolerance. Compare it against what else your money could earn.",
  },
  {
    q: "How do you calculate ROI on a rental property?",
    a: "Divide your annual net return by the cash you invested. For a quick version, use net income over purchase price. With a loan involved, cash-on-cash return and IRR give a more accurate picture.",
  },
  {
    q: "How do you calculate cash-on-cash return?",
    a: "Take annual pre-tax cash flow, divide it by your total cash invested (down payment, closing costs and upfront repairs), then multiply by 100.",
  },
  {
    q: "What’s the difference between cap rate and cash-on-cash return?",
    a: "Cap rate is NOI divided by price and ignores financing. Cash-on-cash return is cash flow divided by the cash you actually put in, so it reflects your down payment and loan terms.",
  },
  {
    q: "What is IRR in real estate?",
    a: "IRR is the annualized return that accounts for the timing of every cash flow, from your initial investment through yearly income to the sale. It’s useful for comparing investments with different timelines.",
  },
  {
    q: "What is the 1% rule?",
    a: "Monthly rent should be at least 1% of the purchase price. It’s a quick screen, not a substitute for running full numbers.",
  },
  {
    q: "What is the 50% rule?",
    a: "It assumes operating expenses will run about half of your rental income, not counting the mortgage. The rest goes toward your loan payment and profit.",
  },
  {
    q: "What’s the 70% rule?",
    a: "It’s a guideline for flippers: pay no more than 70% of the after-repair value, minus repair costs.",
  },
  {
    q: "Does the calculator include vacancy and maintenance?",
    a: "You can account for both through your income and expense inputs. Leaving them at zero overstates your returns, so use realistic allowances.",
  },
  {
    q: "Is it still worth buying a rental property in 2027?",
    a: "It can be, but higher borrowing costs mean thinner margins. Run the numbers at today’s rate and at a higher one, and only buy if the deal holds up in a conservative case.",
  },
  {
    q: "Is Section 8 a good strategy for rental income?",
    a: "It can be reliable for the subsidized part of the rent, but it comes with inspections, rent limits and paperwork. Check your local payment standard and run it through the calculator.",
  },
  { q: "Is the rental property calculator free?", a: "Yes, it’s free to use on Tolz." },
  {
    q: "Does it account for taxes?",
    a: "Returns are pre-tax. Depreciation and capital gains vary by situation, so consult a tax professional.",
  },
];

// The supplied FAQ schema lists only these questions, with the displayed
// wording and straight apostrophes.
const FAQ_SCHEMA_QUESTIONS = [
  "What is a good return on a rental property?",
  "How do you calculate ROI on a rental property?",
  "How do you calculate cash-on-cash return?",
  "What’s the difference between cap rate and cash-on-cash return?",
  "What is IRR in real estate?",
  "What is the 1% rule?",
  "Is it still worth buying a rental property in 2027?",
  "Is the rental property calculator free?",
];
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS
  .filter((item) => FAQ_SCHEMA_QUESTIONS.includes(item.q))
  .map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const nestedUl = { paddingLeft: 18, marginTop: 8, marginBottom: 0 };
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

export default function RentalPropertyCalculatorFaqSection() {
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
        <h2 style={h2Style}>What a Rental Property Calculator Actually Does</h2>
        <p style={pStyle}>
          A rental property calculator models the full life of an investment: what you pay upfront, what the property earns
          each year, what it costs to own, and what you walk away with at sale. A quick “rent minus mortgage” check ignores
          property tax, insurance, repairs, vacancy and the cost of selling. A proper rental property calculator accounts for
          all of them.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This one is built for deal analysis, not just a monthly payment estimate. It answers three questions in order. Does
          the property produce positive income now? How efficiently does it use your cash? And what is the total return once
          appreciation, loan paydown and a sale are included? Running two or three properties through the same calculator
          lets you compare them on identical assumptions, which is the only fair way to rank them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What a Rental Property Calculator Does (and Why “Rent Minus Mortgage” Isn’t Enough)</h2>
        <p style={pStyle}>
          Everybody starts with the same quick check: monthly rent minus the mortgage payment. If it’s positive, the deal
          looks fine. The problem is everything that the check leaves out: property tax, insurance, repairs, vacancy,
          management, HOA fees, closing costs, and what it costs to sell later.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A rental property calculator puts all of that in one place. It follows the money in the order it actually moves.
          What do you put in upfront? What does the property bring in each year, and what does it cost to hold? What do you
          walk away with when you sell? Run two or three properties through the same assumptions and you’ve got a fair way to
          rank them, which beats going with a gut feeling about the one with the nicer kitchen.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Rental Property Investing Works</h2>
        <p style={pStyle}>
          Rental property investing means buying real estate, holding it, leasing it out, and eventually selling it. “Real
          estate” covers a lot: a single condo, a duplex, a single-family house, an apartment building, a retail plaza, an
          office, even industrial space. The bigger and more commercial the property, the harder it gets to analyze, because
          more tenants, more leases and more moving parts mean more ways for the numbers to shift. Older buildings usually
          come with higher maintenance and repair costs, so budget for that instead of assuming everything will be fine.
        </p>
        <p style={pStyle}>Rentals pay you in a few different ways, and it helps to separate them:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Cash flow.</strong> Rent comes in monthly. What’s left after expenses and the mortgage is yours.</li>
          <li style={liStyle}><strong>Appreciation.</strong> If the property gains value over time, you collect that when you sell. Unlike rent, it shows up as one big payout at the end.</li>
          <li style={liStyle}><strong>Loan paydown.</strong> Every mortgage payment moves a bit of money from interest to principal. Your tenant is, in effect, helping pay down your loan.</li>
          <li style={lastLi}><strong>Tax treatment.</strong> Residential rental property can be depreciated over 27.5 years, and mortgage interest and many operating costs are deductible. Rules vary by situation, so run this part past a tax pro.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the downside, rentals are capital-intensive, they depend on steady cash flow, and they’re hard to turn into cash
          fast. You can’t sell a bathroom to cover a surprise bill. Compared with stocks, though, rentals tend to be steadier,
          they carry tax advantages, and rents have a track record of rising with inflation. With a solid analysis behind
          them, they can be a good use of money. That’s what the calculator is for.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Still Worth Buying a Rental Property in 2027?</h2>
        <p style={pStyle}>
          It can be, but the bar is higher than it was a few years ago. Cheap debt did a lot of the heavy lifting in the 2010s
          and early 2020s. With borrowing costs where they are, plenty of deals that used to produce healthy cash flow now sit
          near break-even in year one.
        </p>
        <p style={pStyle}>
          That doesn’t mean the opportunity is gone. It means the margin for error is smaller. These things matter more than
          they used to:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Price discipline.</strong> Buying at a discount, from a motivated seller or a property that needs work, matters more when financing is expensive.</li>
          <li style={liStyle}><strong>Rent growth.</strong> Break-even today can turn into a good deal if rents rise while your payment stays fixed. Check whether your local market has the demand to support that.</li>
          <li style={liStyle}><strong>Refinance risk.</strong> Some investors plan to refinance if rates drop. That’s a bet, not a plan. Make sure the deal works at today’s rate so a refinance is a bonus and not a requirement.</li>
          <li style={lastLi}><strong>Cash reserves.</strong> Higher costs mean thinner cushions, which makes an emergency fund more important.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The way to answer it for your situation is to run the actual numbers at today’s rates, then at a rate one point
          higher and a rent figure a bit lower. If it clears your minimum return in all of those, it’s worth a serious look.
          If it only works when everything goes right, it’s a gamble.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Buying Rental Properties Actually Worth It?</h2>
        <p style={pStyle}>For plenty of people, yes. For some, no. And a lot of it comes down to expectations.</p>
        <p style={pStyle}>
          Rentals build wealth through the four sources mentioned earlier (cash flow, appreciation, loan paydown and tax
          treatment), and leverage lets you control a large asset with a smaller amount of your own money. That’s the upside,
          and it’s real.
        </p>
        <p style={pStyle}>
          Leverage works in both directions. A 10% drop in value hits you harder when you’ve borrowed most of the purchase
          price. A long vacancy or a big repair can wipe out a year of profit. And the money is tied up: you can’t pull it out
          quickly without selling or refinancing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It tends to be worth it for people who have stable income and cash reserves, who can handle the work (or pay for
          help), and who are thinking in terms of years or decades. It tends not to be worth it for someone who’s stretching to
          buy, who needs the money back soon, or who expects it to run on its own.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>It’s Not Passive Income: What Landlords Actually Do</h2>
        <p style={pStyle}>
          This is where a lot of first-timers get a surprise. Owning a rental is a job, even if it’s a part-time one. You’re
          the landlord, and that comes with responsibilities:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Tenant management:</strong> advertising the unit, screening applicants, writing a lease that holds up legally, collecting rent, and, when it comes to it, handling evictions.</li>
          <li style={liStyle}><strong>Maintenance:</strong> routine upkeep, repairs, turnover work between tenants, and occasionally a bigger renovation.</li>
          <li style={lastLi}><strong>Administration:</strong> setting rent, keeping records, handling taxes, budgeting, and paying anyone who works for you.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Plenty of owners hand all of that to a property manager. It makes sense if you’re short on time, live far from the
          property, don’t want to be hands-on, or can absorb the cost. A fee of around 10% of collected rent is a common
          ballpark, though it varies by market and by property type, and some managers charge extra for leasing a unit or
          handling renovations. If you’re going to hire one, put the fee in your numbers from day one. A deal that only works
          when you manage it yourself, for free, isn’t as good as it looks on paper.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Rental Property Calculator</h2>
        <p style={pStyle}>Have your numbers ready before you start. The results are only as honest as the inputs.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Purchase.</strong> Start with the purchase price, your down payment and your closing costs. If the place needs work before a tenant can move in, count that as cash you’ve put into the deal. Your return is measured against everything you spend, not just the down payment.</li>
          <li style={liStyle}><strong>Financing.</strong> Enter the loan amount, interest rate and loan term. Use the rate a lender has actually quoted you, not the lowest number in an ad. Investment property loans usually cost more than loans on a home you live in, which comes up again in the financing section below.</li>
          <li style={liStyle}>
            <strong>Operating expenses.</strong> This is where deals get inflated, so be thorough:
            <ul style={nestedUl}>
              <li style={liStyle}>Property tax (it’s based on the property’s value, not on your rent or your loan)</li>
              <li style={liStyle}>Insurance (a landlord policy, which is different from a regular homeowner policy)</li>
              <li style={liStyle}>Maintenance and repairs</li>
              <li style={liStyle}>HOA fees, if there are any</li>
              <li style={liStyle}>Utilities you cover</li>
              <li style={lastLi}>Anything else you’ll pay monthly or yearly, such as lawn care or pest control</li>
            </ul>
            <span style={{ display: "block", marginTop: 8 }}>If a cost is annual instead of monthly, just convert it so everything is on the same basis.</span>
          </li>
          <li style={liStyle}><strong>Income.</strong> Enter the rent you expect from the property. Then add a vacancy allowance, because units don’t stay rented 12 months a year, even in hot markets. If you’re hiring a manager, include the fee here too.</li>
          <li style={lastLi}><strong>Sale assumptions.</strong> Set an appreciation rate, how long you plan to hold, and your selling costs. If you already have a target sale price in mind, you can work from that. Otherwise, use a conservative appreciation estimate and let the tool project the value.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once the results are on screen, change one thing at a time. Bump the interest rate. Cut the rent by $150. Add two
          months of vacancy. You’ll quickly find out which assumption your deal depends on, and that’s the one worth
          researching harder.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Results Mean</h2>
        <p style={pStyle}>Each number answers a different question, and none of them tells the whole story on its own.</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>First-year cash flow.</strong> This is the money in your pocket after rent, vacancy, operating costs and the mortgage payment. Positive means the property pays for itself. Negative means you’re topping it off from your own account every month. Year one is also the toughest year, since rents usually creep up while a fixed-rate payment stays put.</li>
          <li style={liStyle}><strong>NOI (net operating income).</strong> Rent minus vacancy and operating expenses, with financing left out. It’s the property’s earning power before you factor in how you paid for it.</li>
          <li style={liStyle}><strong>Cap rate.</strong> NOI divided by the purchase price. Because financing isn’t in it, cap rate describes the property and not your particular deal, which is why it’s the quickest way to size up two listings against each other. A higher cap rate means more income per dollar of price, but it often comes with older buildings, rougher neighborhoods or slower markets. A low cap rate usually means you’re paying for expected appreciation. Compare cap rates within the same market and property type, or the comparison won’t mean much. It’s also worth looking at what a property’s cap rate has been over the past few years, since that can hint at how it might perform going forward. If the NOI is hard to pin down, a discounted cash flow analysis is the more accurate route.</li>
          <li style={liStyle}><strong>Cash-on-cash return.</strong> Annual pre-tax cash flow divided by the total cash you put in: down payment, closing costs, and any upfront repairs. Where cap rate describes the property, cash-on-cash describes your deal. Two buyers can buy the same building and see completely different cash-on-cash numbers because of their down payments and loan terms. On a healthy rental, this number should trend up over the years, since rent tends to rise while a fixed mortgage payment doesn’t. If you’re comparing a rental against an index fund or a savings account, this is the figure to start with.</li>
          <li style={liStyle}><strong>IRR (internal rate of return).</strong> The annualized return on your money that accounts for when each dollar shows up: what you put in at the start, each year’s cash flow, and the sale proceeds at the end. A dollar in year one is worth more than a dollar in year fifteen, and IRR reflects that. Cap rate is too basic to capture it, and cash-on-cash ignores the time value of money entirely. That’s why many investors treat IRR as the single most complete measure of a rental’s profitability. It’s also the best number for comparing a rental against a completely different kind of investment. Just remember it’s sensitive to the sale price and the holding period, so test a few versions.</li>
          <li style={lastLi}><strong>Total profit when sold.</strong> Every dollar of net cash flow over the years, plus what you net at sale, minus the cash you originally invested. It turns the percentages into a dollar figure you can picture. Selling costs like agent commissions and closing fees matter here. They’re the difference between the value on paper and the money you actually keep.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading the Year-by-Year Breakdown</h2>
        <p style={pStyle}>The annual table is where the calculator goes from a snapshot to a projection. Here’s what to look for.</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Cash flow over time.</strong> A property that’s break-even in year one but solidly positive by year five is a different investment from one that stays flat. Check whether the deal needs the growth assumptions to work, or whether it holds up even if rents stay put.</li>
          <li style={liStyle}><strong>Equity.</strong> Each year, loan paydown plus appreciation builds equity. You can’t spend equity until you sell or refinance, so a deal with thin cash flow and big equity growth fits a different goal than one that mails you a check every month.</li>
          <li style={lastLi}><strong>Sale proceeds by year.</strong> Seeing what you’d net if you sold in year 3 versus year 10 helps you pick a holding period. It also shows you whether most of the return comes early or only at the very end. If it’s back-loaded, you’re relying on a sale that may or may not go the way you hoped.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example, Step by Step</h2>
        <p style={pStyle}>
          Say you buy a property for $300,000 with 20% down ($60,000) and $9,000 in closing costs. Your cash invested is
          $69,000. Rent is $2,800 a month, or $33,600 a year. With a 5% vacancy allowance, you collect $31,920. Operating
          expenses (tax, insurance, maintenance, management) add up to $10,500.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>NOI: $31,920 − $10,500 = $21,420</li>
          <li style={liStyle}>Cap rate: $21,420 ÷ $300,000 = about 7.14%</li>
          <li style={liStyle}>Mortgage: $240,000 at 6.5% over 30 years comes to roughly $1,517 a month, or about $18,204 a year</li>
          <li style={liStyle}>First-year cash flow: $21,420 − $18,204 = $3,216</li>
          <li style={lastLi}>Cash-on-cash return: $3,216 ÷ $69,000 = about 4.66%</li>
        </ul>
        <p style={pStyle}>
          Now run the same property at 7.75%, which is closer to what investors are being quoted these days. The payment jumps
          to about $1,719 a month, or roughly $20,633 a year. Cash flow drops to about $787, and cash-on-cash falls to around
          1.1%. Same building, same rent, same cap rate. The financing is the only thing that changed, and it turned a decent
          deal into a marginal one. That’s the kind of thing a rental property calculator is there to show you, and why cap
          rate alone can mislead you.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more check: $2,800 on a $300,000 property is about 0.93%, which just misses the 1% rule. That’s worth knowing,
          though the rule is only a screen, as the next sections explain.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What’s a Good ROI on a Rental Property?</h2>
        <p style={pStyle}>
          There’s no single right answer. It depends on your market, the property’s condition, how you finance it and how
          much risk you can stomach. Some investors won’t touch anything under 10%. Others are happy with 5% to 8% if the
          property is stable, easy to manage and likely to appreciate.
        </p>
        <p style={pStyle}>These ranges are common rules of thumb, not guarantees:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>5% to 8%:</strong> reasonable for conservative, lower-risk deals</li>
          <li style={liStyle}><strong>8% to 12%:</strong> attractive for most mid-level investors</li>
          <li style={lastLi}><strong>12% and up:</strong> usually a strong deal, as long as the risk is manageable</li>
        </ul>
        <p style={pStyle}>
          The simplest version of ROI is annual net income divided by what you paid. So a $150,000 property that nets $12,000
          a year is an 8% return. That math works cleanly for a cash purchase. Once you add a loan, cash-on-cash and IRR give
          you a more accurate picture, because they account for how much of your own money is in the deal.
        </p>
        <p style={pStyle}>
          To calculate cash-on-cash return yourself: take annual net income (rent minus all expenses and the mortgage), divide
          it by your total cash invested, and multiply by 100.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A good benchmark is what else your money could do. If a low-risk alternative pays 4% to 5%, a rental has to clear
          that by enough to justify the hassle, the illiquidity and the risk.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rules of Thumb: The 1% Rule, 50% Rule and 70% Rule</h2>
        <p style={pStyle}>
          Real estate has a few quick screens that save time. They’re starting points. Don’t use them in place of actual
          analysis or advice from a local professional, because markets differ and the rules break down in plenty of them.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>The 1% rule.</strong> Monthly rent should be at least 1% of the purchase price (plus any repairs you need to do up front). On a $200,000 property, that’s $2,000 a month. Some investors hold out for 2% or higher, and the higher the better, but that kind of deal is rare in expensive markets. In high-priced metro areas, the 1% rule often can’t be met at all, which doesn’t automatically make every deal there a bad one.</li>
          <li style={liStyle}><strong>The 50% rule.</strong> Operating expenses tend to eat up around half of your rental income, not counting mortgage principal and interest. Whatever’s left covers the loan payment. On $2,800 a month in rent, that’s about $1,400 for expenses and $1,400 toward the mortgage. It’s a fast way to estimate cash flow, and a handy sanity check against numbers that look too good.</li>
          <li style={lastLi}><strong>The 70% rule.</strong> This one’s for flippers and distressed properties. The purchase price should be no more than 70% of the after-repair value (ARV), minus the cost of repairs. If a house will be worth $250,000 when it’s fixed up and the rehab will cost $40,000, then 70% of $250,000 is $175,000, less $40,000, so you shouldn’t pay more than $135,000.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Financing and Market Conditions Change Your Returns</h2>
        <p style={pStyle}>
          Your ROI is tied to how you pay for the property. A high interest rate or a small down payment can drag your return
          down even when the property itself produces solid income. That’s exactly what happened in the worked example above.
        </p>
        <p style={pStyle}>
          It’s a relevant issue right now. Thirty-year fixed rates for homebuyers have been bouncing around the low-to-mid 7%
          range in mid-October 2026. Rental financing costs more on top of that: investment property rates typically run half
          a point to a full point above primary residence rates. Most lenders also want 15% to 30% down on an investment
          property. Rates move daily, so check with a lender for a real quote before you plug a number into the calculator.
        </p>
        <p style={pStyle}>Beyond the loan, these factors move your results:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Interest rate and loan term (a 20-year loan has a higher payment than a 30-year loan but costs far less in total interest)</li>
          <li style={liStyle}>Down payment size</li>
          <li style={liStyle}>Local vacancy rates and how seasonal your rental market is</li>
          <li style={liStyle}>Appreciation trends in the specific neighborhood, not just the metro area</li>
          <li style={lastLi}>Property tax and insurance trends, which have climbed fast in many places</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want to see whether renting out a place beats other options, compare it against what you’d earn elsewhere,
          not just against zero.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Analyze a Rental Property, Step by Step</h2>
        <p style={pStyle}>If you’ve never done it, here’s a process that works.</p>
        <ol style={ulStyle}>
          <li style={liStyle}><strong>Pin down realistic rent.</strong> Look at what comparable units nearby are actually renting for, not what they’re listed at. Listings that sit for weeks are priced too high.</li>
          <li style={liStyle}><strong>Estimate every expense.</strong> Get the real property tax figure (and check whether it resets after a sale), call an insurance agent for a quote, and ask for the past two years of utility and repair costs if the seller has them.</li>
          <li style={liStyle}><strong>Set aside reserves.</strong> Plenty of investors budget roughly 5% to 10% of rent each for repairs and for big-ticket items like roofs, HVAC and water heaters. Older buildings need more.</li>
          <li style={liStyle}><strong>Add vacancy.</strong> Even 5% is a modest assumption. Check local rates, and use more if the unit is in a market with a lot of turnover.</li>
          <li style={liStyle}><strong>Run the calculator.</strong> Look at cash flow, cap rate, cash-on-cash and IRR together.</li>
          <li style={liStyle}><strong>Stress test it.</strong> Raise the rate, lower the rent, add vacancy, and cut the appreciation. If the deal only survives in the best case, pass.</li>
          <li style={liStyle}><strong>Compare it to alternatives.</strong> Other properties, an index fund, or paying down debt.</li>
          <li style={liStyle}><strong>Check the local rules.</strong> Landlord-tenant laws, rent control, eviction timelines, licensing, and short-term rental restrictions can change the whole picture.</li>
          <li style={lastLi}><strong>Get an inspection.</strong> The calculator can’t see a cracked foundation.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Pros, the Cons and the “Dark Side” of Owning Rentals</h2>
        <p style={pStyle}>
          The pros are the ones you’ve heard: monthly income, long-term appreciation, equity building, tax advantages,
          inflation protection and a tangible asset you control.
        </p>
        <p style={pStyle}>The downsides are less glamorous, and they’re what people mean by the “dark side”:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Bad tenants happen.</strong> Even careful screening misses things. Late payments, damage, and the occasional eviction are part of the business. Eviction rules and timelines vary a lot by state and can take months.</li>
          <li style={liStyle}><strong>Big expenses show up uninvited.</strong> A roof, a sewer line, an HVAC system. A single repair can erase a year of cash flow, which is why reserves matter.</li>
          <li style={liStyle}><strong>Your costs keep rising.</strong> Insurance premiums and property taxes have jumped in many areas, and you can’t always pass that along to tenants right away.</li>
          <li style={liStyle}><strong>It’s illiquid.</strong> Selling takes time and costs money.</li>
          <li style={liStyle}><strong>Your eggs are in one basket.</strong> One property, one neighborhood, one tenant. A single problem hits your whole income from that asset.</li>
          <li style={liStyle}><strong>It eats time and attention.</strong> The 9 p.m. call about a leaking pipe is a real thing. A manager helps, but you’re still responsible.</li>
          <li style={lastLi}><strong>The legal side is real.</strong> Fair housing laws, local licensing and lease rules all apply, and mistakes can get expensive.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          None of that is a reason to avoid rentals. It’s a reason to underwrite conservatively and not count on a perfect run.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Rental Investing Realistic for the Average Person?</h2>
        <p style={pStyle}>
          More than most people think, but not in the “buy five houses with no money down” way you see online.
        </p>
        <p style={pStyle}>
          The most practical entry point for a lot of people is house hacking: buy a small multi-unit property, live in one
          unit and rent out the others. An owner-occupied purchase of a two-to-four-unit building can qualify for lower down
          payment programs, including FHA financing with as little as 3.5% down, if you meet the requirements and live in the
          property. That lowers the cash you need and lets your tenants cover a chunk of your housing cost. Check the current
          program rules and the occupancy requirements with a lender before relying on them.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other realistic routes include buying a single-family home or condo in an affordable market, buying a modest
          property near where you live so it’s easier to manage, or partnering with someone you trust. What’s less realistic
          is buying with thin reserves, a tight budget and no plan for a bad month.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Long Does It Take Before a Rental Feels Worth It?</h2>
        <p style={pStyle}>
          There’s no fixed number, but a lot of landlords describe a similar arc. The first year or two is rough. You’re
          learning, fixing things you missed during the inspection and getting the property stable. Cash flow can be thin or
          negative.
        </p>
        <p style={pStyle}>
          Somewhere in years three to five, things tend to shift if the deal was sound. Rent has gone up, the mortgage hasn’t,
          the property’s been through a turnover or two, and the process is more routine. Equity is also building by then.
          For many people, the real payoff shows up around year ten and beyond, when the loan balance is a lot smaller, rents
          are meaningfully higher and the property’s value has had time to grow.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The year-by-year table in the calculator is a good way to see that for your own deal. Look for the year when cash
          flow turns positive and when your equity passes the cash you put in. Those are the milestones that tend to make
          people feel like it was worth it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>First Rental Property: Things People Wish They’d Known</h2>
        <p style={pStyle}>First-timers tend to run into the same issues:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Reserves matter more than you think.</strong> Have several months of expenses set aside, plus a repair fund, before you buy.</li>
          <li style={liStyle}><strong>Your estimates will be off.</strong> Expenses nearly always run higher than expected the first year. Pad your numbers.</li>
          <li style={liStyle}><strong>Screening tenants is the most important job.</strong> A good tenant in a mediocre property beats a bad tenant in a great one. Use consistent criteria and apply them to everyone, in line with fair housing law.</li>
          <li style={liStyle}><strong>Get the lease and paperwork right.</strong> Use a lease that fits your state’s laws, and keep records of everything.</li>
          <li style={liStyle}><strong>Insurance isn’t optional.</strong> Get a landlord policy, and ask about liability coverage.</li>
          <li style={liStyle}><strong>Separate your finances.</strong> A dedicated bank account for the property makes taxes and tracking much easier.</li>
          <li style={liStyle}><strong>Know your local rules before you buy.</strong> Rent control, licensing, inspection requirements and eviction processes vary widely.</li>
          <li style={lastLi}><strong>Don’t buy the first one just to be in the game.</strong> Run lots of numbers and walk away from the mediocre ones.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Section 8 a Good Passive Income Strategy?</h2>
        <p style={pStyle}>It can work well, but it isn’t passive, and it isn’t automatically better or worse than a regular rental.</p>
        <p style={pStyle}>
          Under the Housing Choice Voucher program, a local housing authority pays part of a qualifying tenant’s rent directly
          to the landlord. The tenant typically covers roughly 30% of their income toward rent, and the housing authority
          covers the rest, up to a local payment standard. For landlords, the big appeal is that the government’s share
          arrives reliably, which reduces the risk of missed payments on that portion.
        </p>
        <p style={pStyle}>
          There are trade-offs. The unit has to pass a housing quality inspection, and it’s rechecked periodically. Repairs
          flagged by the inspector have to be done on their timeline. The rent has to fit within the local payment standard
          and be considered reasonable for the area, so you can’t always charge what a market-rate tenant would pay. There’s
          more paperwork, and approvals and payments can sometimes be delayed. Rules also vary by housing authority.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether it makes sense depends on your market. In places where the payment standard is at or above market rent, the
          steady payments can be attractive. Where it’s well below, it’s harder to make the numbers work. The way to find out
          is to look up your local housing authority’s payment standard for the unit size you’re considering and plug that
          rent into the calculator. If the numbers still work with inspection-ready maintenance costs built in, it’s worth a
          closer look. Either way, you’ll still be screening tenants and managing the property, just under a different set of
          rules.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What These Numbers Can’t Tell You</h2>
        <p style={pStyle}>
          Every projection here rests on assumptions stretched over many years, sometimes decades. Real life doesn’t follow a
          straight line. A recession can knock the property’s value down for a while. A new shopping center or employer nearby
          can push it up. Maintenance costs can jump, vacancy can rise, and rents can swing from year to year, so extending
          today’s rent for 20 years at a flat growth rate is a stretch.
        </p>
        <p style={pStyle}>
          Inflation is another thing to keep in mind. Long-term projections in nominal dollars can look huge, but a dollar
          twenty years from now buys less than a dollar does today. When you’re looking at a long hold, think about what the
          figures are worth in real terms.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The practical fix is simple. Run a conservative case, a middle case and an optimistic case. If the deal still makes
          sense in the conservative one, you’ve got a margin of safety. If it only works in the optimistic one, treat that as a
          warning.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Ways to Invest in Real Estate</h2>
        <p style={pStyle}>A rental isn’t the only option, and it’s worth knowing the alternatives.</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>REITs.</strong> Real estate investment trusts pool money from many investors to buy properties or real estate debt. Some are publicly traded, some are private, and some are public but non-traded. They’re a way to get real estate exposure without handling a transaction or a tenant, and they work as a more passive piece of a diversified portfolio.</li>
          <li style={liStyle}><strong>Buying and selling (flipping).</strong> You buy a property, usually fix it up, and sell it quickly for a profit. Little or no renting is involved. It takes real market knowledge and a feel for renovation costs, and your timeline and carrying costs matter a lot.</li>
          <li style={lastLi}><strong>Wholesaling.</strong> You find a deal, put it under contract, and sell that contract to another buyer. You never own the property. It depends on finding good deals and a network of buyers, and the rules around it vary by state, so look into the local requirements before trying it.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mistakes That Skew Rental Property Analysis</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Skipping vacancy and repairs.</strong> Assuming full occupancy and zero maintenance is the most common way to inflate returns.</li>
          <li style={liStyle}><strong>Treating cap rate as the whole answer.</strong> A strong cap rate doesn’t help if financing is expensive or the building needs a new roof.</li>
          <li style={liStyle}><strong>Forgetting upfront costs.</strong> Closing costs, inspections and initial repairs raise your cash invested and lower cash-on-cash return.</li>
          <li style={liStyle}><strong>Using aggressive appreciation.</strong> Because IRR and total profit depend on the sale price, optimistic appreciation can make a weak deal look great.</li>
          <li style={liStyle}><strong>Ignoring taxes.</strong> The returns shown are pre-tax. Depreciation, interest deductions, passive loss rules and capital gains treatment (including depreciation recapture when you sell) can change your actual result. Talk to a qualified tax professional.</li>
          <li style={lastLi}><strong>Using an old interest rate.</strong> Rates change fast. Re-run your numbers with a current quote.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private and Simple to Use</h2>
        <p style={pStyle}>
          The Tolz rental property calculator is free to use, with no charges tied to your results. You can run as many
          scenarios as you want, and the results come from the figures you enter. The formulas for cap rate, cash-on-cash
          return and IRR are the standard ones, so you’d get the same answers from a spreadsheet using the same inputs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The output is only as good as your assumptions, which is why testing a range of rent, vacancy and appreciation
          figures is smarter than trusting one run. The calculator is for analysis, not financial, tax or legal advice, so
          confirm big decisions with a licensed professional or your lender.
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
