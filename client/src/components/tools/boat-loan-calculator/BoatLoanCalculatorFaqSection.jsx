import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate a boat loan payment?",
    a: "Subtract your down payment and trade-in from the boat price, add sales tax and any fees you’re financing, then apply the APR and term to the amortization formula. The calculator does that for you.",
  },
  {
    q: "How much is the monthly payment on a $50,000 boat loan?",
    a: "At 8.5% APR, it’s about $620 a month over 10 years, $492 over 15 years, and $434 over 20 years. Your actual rate will change those numbers.",
  },
  {
    q: "How long can you finance a boat?",
    a: "Terms commonly run from 2 to 20 years. Bigger and newer boats usually get the longer terms, and smaller or older boats get shorter ones.",
  },
  {
    q: "How much down payment do you need for a boat?",
    a: "Many lenders want 10% to 20%. A bigger down payment can help you get approved, lower your rate, and shrink your payment.",
  },
  {
    q: "What credit score do you need for a boat loan?",
    a: "It depends on the lender, but scores in the high 600s or better tend to qualify for the better rates. Lower scores can still get approved, usually at a higher rate or with a larger down payment.",
  },
  {
    q: "Does the calculator include sales tax and fees?",
    a: "Yes. Enter your tax rate and fees and they’ll be included in the total.",
  },
  {
    q: "Can I use a trade-in with this calculator?",
    a: "Yes. Enter the trade-in value and it gets subtracted from what you need to finance.",
  },
  {
    q: "How much boat can I afford on a $500 monthly payment?",
    a: "It depends on your rate, term, down payment, and trade-in. At 8.5%, a $500 payment supports roughly $50,800 over 15 years or $40,300 over 10 years, before adding your down payment and subtracting tax and fees.",
  },
  {
    q: "Is it better to take a shorter or longer boat loan?",
    a: "A shorter loan has a higher payment but costs less in interest. A longer loan lowers the payment but costs more overall and keeps you in debt longer. Try both in the calculator.",
  },
  {
    q: "Can I pay off a boat loan early?",
    a: "Usually, yes. Extra payments save interest, but some lenders charge a prepayment penalty, so ask before you sign.",
  },
  {
    q: "Are boat loans secured?",
    a: "Most are. The boat is the collateral, so the lender can repossess it if you stop paying.",
  },
  {
    q: "Is boat loan interest tax deductible?",
    a: "It can be in the U.S. if the boat qualifies as a second home. Ask a tax professional about your situation.",
  },
  {
    q: "Does this tool cover insurance and maintenance?",
    a: "No. It estimates the loan only. Budget separately for insurance, storage, fuel, and upkeep.",
  },
  {
    q: "Can I use this calculator outside the U.S.?",
    a: "Yes, but it’s built around U.S. buying. Enter your local tax and fees, and keep in mind that loan terms may differ.",
  },
  {
    q: "Is this boat loan calculator free, and do I need to sign up?",
    a: "It’s free, and you don’t need to sign up to use it.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const APR_HEADERS = ["APR", "Monthly payment", "Total interest"];
const APR_ROWS = [
  ["7.0%", "about $411", "about $19,200"],
  ["8.5%", "about $444", "about $23,900"],
  ["10.0%", "about $478", "about $28,800"],
];

const TERM_HEADERS = ["Term", "Monthly payment"];
const TERM_ROWS = [
  ["10 years", "about $620"],
  ["15 years", "about $492"],
  ["20 years", "about $434"],
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

export default function BoatLoanCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Boat Loan Calculator Does</h2>
        <p style={pStyle}>
          The tool works two ways. In the first, you enter the boat price and the loan terms. It gives you the estimated
          monthly payment, total interest, and total cost, including your down payment and the other amounts you put in. In
          the second, you enter the payment you want and the calculator backs into a boat price, using your rate, term, down
          payment, trade-in, tax, and fees. That second mode is the reverse boat loan calculation, and it’s the one a lot of
          people should start with. Most buyers know what they can spend each month long before they know which boat they
          want.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It’s built around U.S. boat purchases, since the tax and fee inputs follow how things work in the States. If you’re
          buying somewhere else, you can still use it. Just enter your local tax rate and fees, and keep in mind that loan
          structures, rate quotes, and registration costs can differ from country to country.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Boat Loan Calculator</h2>
        <p style={pStyle}>Pick whether you want to calculate a payment or find a price. Then fill in the fields.</p>
        <p style={pStyle}>
          Enter the boat price the way it appears on the purchase agreement, before tax and fees. Add your down payment, and
          a trade-in value if you’re handing over a boat, trailer, or tow vehicle. Put in your sales tax rate as a percentage
          and any dealer or documentation fees as a dollar amount. Last, enter the APR and the loan term.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hit calculate, then change one thing at a time. Bump the down payment by $2,000. Drop the term from 15 years to 10.
          Try a rate a point lower. Seeing the payment move as you tweak each input is the whole point. A lender’s quote gives
          you one scenario, and here you can check ten in a couple of minutes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Each Input Means</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>Boat Price</h3>
        <p style={pStyle}>
          Use the negotiated price, not the sticker price or the listing price. If you’re still haggling, run a few versions.
          A $2,000 difference in price changes the payment less than people expect, but it’s still money that earns interest
          for years.
        </p>
        <h3 style={h3Style}>Down Payment</h3>
        <p style={pStyle}>
          Most marine lenders want somewhere around 10% to 20% down, depending on the boat, the lender, and your credit. More
          money down means a smaller loan, a lower payment, and less interest. It also protects you from being upside-down,
          which is when you owe more than the boat is worth. That happens a lot with boats, because they lose value fast in
          the first few years and a loan with almost nothing down starts out behind.
        </p>
        <h3 style={h3Style}>Trade-In Value</h3>
        <p style={pStyle}>
          A trade-in reduces how much you need to borrow, so use a number you’d actually believe. Dealers pay wholesale and
          sell retail, so their offer is nearly always lower than what you’d get selling privately. Check how your state
          taxes trades too. In some states you only pay tax on the difference between the new price and the trade-in
          credit. In others you pay tax on the full price no matter what.
        </p>
        <h3 style={h3Style}>Sales Tax</h3>
        <p style={pStyle}>
          Boat sales tax depends on the state where you’ll register or keep the boat, and the rules are all over the place.
          Rates in most states land somewhere between 4% and 8%, some states cap the taxable amount on expensive boats, and
          some carve out exemptions for certain situations. If you’re buying out of state, you may owe tax to your home state
          instead of where you bought it. Your state’s revenue department can tell you for sure. Since tax usually gets
          rolled into the loan, it earns interest like everything else. Skipping it makes the loan look cheaper than it is.
        </p>
        <h3 style={h3Style}>Fees</h3>
        <p style={pStyle}>
          Documentation, title, registration, delivery, and prep fees add up fast. Enter the total of whatever’s being
          financed. If you’re paying some of it out of pocket at signing, leave that part out of the loan and think of it as
          extra cash you need on closing day.
        </p>
        <h3 style={h3Style}>Interest Rate (APR)</h3>
        <p style={pStyle}>
          APR is what borrowing costs per year. Use the rate from an actual quote if you have one. If you don’t, try a few and
          see how much it matters. The table further down shows how a few points change the total.
        </p>
        <h3 style={h3Style}>Loan Term</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Terms usually run from about 2 years up to 20, with the longest ones reserved for bigger, newer, more expensive
          boats. A small used fishing boat might only get 5 to 10 years. A new cabin cruiser can stretch to 15 or 20.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fees You’ll Run Into When Buying a Boat</h2>
        <p style={pStyle}>
          The sticker price is only where the bill starts. Here’s what usually gets added, and what’s worth asking about
          before you sign.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Sales tax.</strong> Covered above. It’s the biggest add-on for most people, and it can run into the thousands on a pricier boat.</li>
          <li style={liStyle}><strong>Loan origination fees.</strong> Some lenders charge for processing the loan, usually 1% to 3% of the amount you borrow. On a $50,000 loan, that’s $500 to $1,500 up front. Plenty of lenders don’t charge one at all, so ask. If you’re comparing two offers, an origination fee can make the lower-rate loan more expensive.</li>
          <li style={liStyle}><strong>Marine survey.</strong> For used boats and larger boats, lenders often want a survey, which is basically a home inspection for a boat. A surveyor checks the hull, engine, electrical system, and so on. It costs money, but it can save you from buying something with a soft deck or a failing engine. If a lender requires one, you’ll pay for it.</li>
          <li style={liStyle}><strong>Title and registration.</strong> Every boat has to be titled and registered with your state, and the cost depends on where you live and how big the boat is. Dealers normally handle this and bill you for it. In a private sale, you’re on your own at the DMV or wildlife agency. Larger boats can also be federally documented through the Coast Guard, and lenders often want that for bigger vessels because it makes recording their lien easier.</li>
          <li style={liStyle}><strong>Documentation fees.</strong> Dealers charge these for paperwork. They vary a lot from one dealer to another, and some are more negotiable than the dealer will admit.</li>
          <li style={liStyle}><strong>Delivery, prep, and commissioning.</strong> Dealers often add charges for getting the boat ready and delivering it. Ask whether those are real costs or padding.</li>
          <li style={liStyle}><strong>Trailer.</strong> Smaller boats need one, and it may not be included in the price. A decent trailer can run a few thousand dollars.</li>
          <li style={lastLi}><strong>Add-ons.</strong> Extended warranties, gap coverage, and similar extras often get offered during financing. Some are worth it. Just remember that anything rolled into the loan gets charged interest for the full term.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Ask for a written breakdown of every charge before you agree to anything. Altogether these can easily reach
          thousands of dollars, and they’re the first thing people forget when they’re excited about a boat.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How a Boat Loan Works</h2>
        <p style={pStyle}>
          A boat loan is money you borrow specifically to buy a boat. It works a lot like a car loan. You get the money from
          a lender, and you pay it back in fixed monthly installments that include interest. In most cases the boat itself is
          collateral, which means if you stop paying, the lender can repossess it. Some lenders offer unsecured loans for
          boats, but that’s less common and usually means a higher rate, and it’s more likely to be used for smaller
          purchases.
        </p>
        <p style={pStyle}>
          You can borrow from banks, credit unions, specialized marine lenders, or through the dealer. Each one has different
          rate ranges, minimum loan amounts, and rules about the age of the boat. Dealer financing is convenient, but it’s
          often a markup of what the lender approved you for, so you should compare it with at least one outside offer.
        </p>
        <p style={pStyle}>
          Boat loans can cover pretty much anything on the water, from a small fishing boat or pontoon to a luxury yacht or a
          commercial vessel. Lenders generally want a down payment, and approval and rate depend on your credit history, your
          income, your debt, and the boat itself. Credit scores in the high 600s or better tend to get the most attractive
          offers, though that varies by lender.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two things to ask any lender up front: whether the rate is fixed or variable, and whether there’s a prepayment
          penalty. Most marine loans are fixed, which is what this calculator assumes. A prepayment penalty matters if you
          want to pay the loan off early, which we’ll get to.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Math Behind the Payment</h2>
        <p style={pStyle}>
          The calculator uses the standard amortization formula for a fixed-rate loan. Your monthly rate is the APR divided
          by 12. The payment equals the loan amount times the monthly rate, divided by one minus (1 plus the monthly rate)
          raised to the negative number of payments.
        </p>
        <p style={pStyle}>
          You don’t need to do that by hand, but it helps to know what it does. Every payment is split between interest and
          principal. Early on, most of it goes to interest, because the balance is big. As the balance shrinks, more of each
          payment chips away at the principal. That’s why extra money early in the loan saves a lot more than extra money
          near the end.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The amount financed is the price, minus your down payment and trade-in, plus tax and any fees you’re rolling in.
          Everything else in the result comes from that number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Example: Same Boat, Two Loan Terms</h2>
        <p style={pStyle}>
          Say you’re buying a $60,000 boat. You put $8,000 down and trade in a smaller boat worth $5,000. Sales tax is 7% on
          the price after the trade-in, so $3,850, and fees come to $750. That leaves $51,600 to finance.
        </p>
        <p style={pStyle}>
          At 8.5% APR over 15 years, the payment is about $508 a month. Over 180 payments you’d pay roughly $91,500 on the
          loan, and about $39,900 of that is interest.
        </p>
        <p style={pStyle}>
          Shorten it to 10 years at the same rate and the payment goes up to about $640. Total interest drops to roughly
          $25,200. So you’re paying around $132 more each month to save close to $14,700.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Neither choice is automatically right. The longer term is easier on your monthly budget, and the shorter one costs
          a lot less overall. The calculator just makes the tradeoff visible so you can decide with real numbers. These
          figures are examples, and your actual rate will depend on your lender and your credit.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much a Few Points of APR Really Cost</h2>
        <p style={pStyle}>
          Rates can look close on paper, but over a long loan the gap is real. Here’s the same $40,000 loan over 12 years at
          three different rates:
        </p>
        <DataTable headers={APR_HEADERS} rows={APR_ROWS} />
        <p style={pStyle}>
          The difference between 7% and 10% is only about $67 a month, which doesn’t sound like much. Over the loan it’s
          roughly $9,600. That’s why it’s worth spending an afternoon getting quotes from more than one lender, and why you
          should plug each one into the calculator instead of just comparing monthly payments.
        </p>
        <p style={pStyle}>Here’s another way to see how term length changes things. Take a $50,000 loan at 8.5%:</p>
        <DataTable headers={TERM_HEADERS} rows={TERM_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Stretching from 10 to 20 years drops the payment by about $186 a month, but you’ll pay a lot more interest, and
          you’ll be making payments on an aging boat.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Boat Can I Afford?</h2>
        <p style={pStyle}>
          Switch the calculator to payment mode and it answers the question most people start with. Say you want to stay
          around $600 a month at 8.5% over 15 years. That payment supports a loan of roughly $60,900. Add your down payment
          and trade-in, then take out the tax and fees that live inside that loan, and you’ve got a realistic price ceiling.
        </p>
        <p style={pStyle}>
          A few things to keep in mind. Lenders look at your debt-to-income ratio, so a boat payment stacked on a mortgage and
          a car loan has to fit within what they’ll approve. But getting approved and being comfortable aren’t the same
          thing. A good gut check is to add your monthly payment to one-twelfth of what you expect to spend each year on
          insurance, storage, fuel, and maintenance. If that total number makes you wince, shop lower.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here’s a quick example for $500 a month at 8.5%. Over 15 years that supports about $50,800 in financing. Over 10
          years it’s about $40,300. The shorter loan means a smaller boat, but you’ll own it outright sooner.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Use This Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>See what a lower rate saves you.</strong> Enter the same loan at two or three rates. If one lender is half a point lower, you’ll see exactly what that’s worth.</li>
          <li style={liStyle}><strong>Lower the monthly payment.</strong> Extend the term and watch the payment drop. Just remember the tradeoff: you’ll pay more interest overall, and you stay in debt longer, which raises the risk of owing more than the boat is worth.</li>
          <li style={liStyle}><strong>Pay the loan off faster.</strong> Take the example loan from above, $51,600 at 8.5% over 15 years. Add $100 a month and the loan is gone in about 10 years and 10 months instead of 15. That cuts roughly $12,000 in interest. Check with your lender first, because some loans charge a penalty for paying early, and make sure extra payments go toward principal.</li>
          <li style={liStyle}><strong>Compare a new boat and a used one.</strong> Run both. A used boat might cost half as much, but the rate could be higher and the term shorter, so the payment may not be as different as you’d think.</li>
          <li style={liStyle}><strong>Check a dealer’s quote.</strong> Dealers love quoting a monthly payment and skipping the rate, term, and fees behind it. Enter the quoted price and see if the payment matches. If it doesn’t, something’s been added.</li>
          <li style={liStyle}><strong>Decide how much to put down.</strong> Run 10% down against 20% and see how much interest the extra cash saves. Then decide whether that cash is worth more to you in the loan or in the bank.</li>
          <li style={liStyle}><strong>Look at your trade-in.</strong> If you’re upgrading, you can see how much your current boat’s value lowers the payment on the next one.</li>
          <li style={liStyle}><strong>Compare lenders.</strong> Banks, credit unions, and marine lenders will all quote differently. Put each offer in the calculator and you can compare them side by side.</li>
          <li style={lastLi}><strong>Think about refinancing.</strong> If your rate has dropped or your credit has improved, plug in a lower rate or shorter term and see what it could save.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>New vs. Used Boat Loans</h2>
        <p style={pStyle}>
          Lenders tend to like new boats. The value is easy to establish, the boat is in good shape, and you can usually get a
          longer term and a lower rate. Used boats can be a little trickier. Lenders often have age limits, they may require
          a survey, and rates tend to run higher on older boats, especially older than about 10 to 15 years. Minimum loan
          amounts can also be higher than you’d expect, so very small purchases sometimes end up with a personal loan or
          cash.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the other hand, a used boat has already taken its biggest depreciation hit. New boats lose a lot of value in the
          first few years. Buying used means you owe less, the loan is smaller, and you’re less likely to be upside-down. Run
          both through the calculator and look at the total cost, not just the payment. If you can’t afford the loan plus the
          costs of owning a boat, renting or joining a boating club might be worth a look.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What’s a Good Boat Loan Rate?</h2>
        <p style={pStyle}>There’s no single answer, because every lender has its own formula. Your rate depends on a few things:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Credit score and history.</strong> This is the big one. A borrower with excellent credit and one with fair credit can be several points apart.</li>
          <li style={liStyle}><strong>Debt-to-income ratio.</strong> The more of your income already spoken for, the riskier you look.</li>
          <li style={liStyle}><strong>New or used, and boat type.</strong> Age, size, and type all affect the rate.</li>
          <li style={liStyle}><strong>Down payment and loan size.</strong> More money down usually helps.</li>
          <li style={liStyle}><strong>Term.</strong> Longer loans often come with higher rates.</li>
          <li style={lastLi}><strong>Lender type.</strong> Credit unions are often competitive, and marine lenders know the market well.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Shop around. Get a pre-approval before you walk into a dealership, since it gives you a number to beat and shows
          you what you can borrow. Credit scoring models typically treat multiple loan inquiries made within a short window,
          usually a couple of weeks, as a single inquiry, so comparing offers shouldn’t wreck your score.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What It Costs to Own a Boat</h2>
        <p style={pStyle}>The loan payment is only one piece. Here’s what else to plan for:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Insurance.</strong> Lenders almost always require it. It covers damage, liability, and theft, and the cost depends on the boat’s value, type, and where you keep it. In hurricane areas, there can be separate deductibles for named storms.</li>
          <li style={liStyle}><strong>Maintenance and repairs.</strong> Engine service, hull cleaning, bottom paint, and winterization if you’re in a cold climate. Skipping these costs more later.</li>
          <li style={liStyle}><strong>Fuel.</strong> It varies a lot. A small boat might cost around $20 for a day out. A larger boat with a 150 hp outboard can burn something like 7 to 10 gallons an hour at cruising speed, so a day on the water can easily run into hundreds of dollars. Boats are far less fuel-efficient than cars.</li>
          <li style={liStyle}><strong>Storage.</strong> If you don’t have a driveway or dock, you’ll pay for a marina slip or dry storage. Prices depend heavily on your area, and slips in popular places can cost more per month than the loan payment.</li>
          <li style={liStyle}><strong>Gear and accessories.</strong> Life jackets, fire extinguishers, anchors, electronics, fishing gear, and upgrades. It’s easy to spend a few thousand dollars here in the first year.</li>
          <li style={lastLi}><strong>Trailer, registration, and renewals.</strong> Don’t forget the yearly fees and trailer upkeep.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As a rough guide, a mid-sized boat worth about $30,000 can run $3,000 to $7,000 a year on top of the loan. Boat
          owners often use around 10% of the boat’s value per year as a rule of thumb, but it depends on how much you use the
          boat and where you keep it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Few Things to Do Before You Sign</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Settle on the price first.</strong> Negotiate the boat’s price before talking about financing or monthly payments. Once the conversation turns to payments, it’s much easier for fees and a longer term to sneak in.</li>
          <li style={liStyle}><strong>Get pre-approved.</strong> An offer from your bank or credit union gives you leverage with the dealer.</li>
          <li style={liStyle}><strong>Ask about prepayment penalties.</strong> If there’s a fee for paying off early, it cancels out some of the benefit of extra payments.</li>
          <li style={liStyle}><strong>Read the add-ons.</strong> Anything rolled into the loan accrues interest.</li>
          <li style={liStyle}><strong>Time your purchase.</strong> Fall, winter, and boat shows often bring better deals than peak summer, when demand is high.</li>
          <li style={liStyle}><strong>Check on the interest deduction.</strong> In the U.S., interest on a boat loan may be deductible if the boat qualifies as a second home, which generally means it has a sleeping area, cooking facilities, and a toilet. A tax professional can tell you whether yours does.</li>
          <li style={lastLi}><strong>Do a sea trial and get a survey for used boats.</strong> It’s cheaper than finding problems after you’ve bought it.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use the Tolz Boat Loan Calculator</h2>
        <p style={pStyle}>
          The tool is free, and you can run as many scenarios as you want. You don’t need an account to use it. It uses a
          standard fixed-rate amortization, so the results are consistent, and you can check them against a lender’s
          amortization schedule.
        </p>
        <p style={pStyle}>
          On privacy, the numbers you enter are loan assumptions, not personal information. You’re never asked for your name,
          Social Security number, or bank details.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As for accuracy, the output is an estimate. Lenders can round differently, structure fees differently, or require
          things like insurance, and your actual terms depend on credit approval. Use the calculator to plan and compare,
          then confirm the exact numbers in your loan documents.
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
