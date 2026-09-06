import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is an online auto loan calculator?",
    a: "An auto loan calculator is highly accurate for the math itself, since it uses the same amortization formula lenders use. The variable that can shift your real-world payment is the exact APR a lender offers you, which depends on your credit profile and the lender's underwriting at the time of application.",
  },
  {
    q: "Does a car loan calculator include sales tax?",
    a: "Not all of them do, but this one does. You can enter your local sales tax rate so it's factored into your loan amount, which gives you a more realistic total cost than calculators that only account for the vehicle price and interest rate.",
  },
  {
    q: "How does a trade-in affect my auto loan payment?",
    a: "Your trade-in value is typically subtracted from the vehicle price before your loan amount is calculated, and in most states it also reduces the amount subject to sales tax. A handful of states, including California, Hawaii, and Virginia, don't offer this tax reduction, so it's worth checking your state's rule before assuming your trade-in will lower your tax bill.",
  },
  {
    q: "What's the difference between dealership financing and direct lending?",
    a: "Direct lending means securing a loan from a bank or credit union before you buy, then paying the dealer with those funds. Dealership financing means the loan is arranged through the dealer, often with a lender tied to the manufacturer. Direct lending generally gives buyers more negotiating leverage, while dealership financing is more convenient for buyers who'd rather not shop lenders themselves.",
  },
  {
    q: "Are manufacturer rebates taxed?",
    a: "It depends on the state. In many states, sales tax is calculated on the vehicle's price before the rebate is subtracted, so the rebate doesn't reduce your taxable amount. A number of other states, including Texas, Oregon, and Pennsylvania, don't tax rebates this way. Selecting your state in the calculator applies the right rule automatically.",
  },
  {
    q: "What credit score do I need for the best auto loan rate?",
    a: "Lenders generally reserve their lowest advertised APRs for borrowers with scores in the high 700s and above, though rates are offered across a range of credit tiers. Checking your score before applying helps you set a realistic rate expectation when using the calculator.",
  },
  {
    q: "Is it better to choose a longer or shorter auto loan term?",
    a: "A shorter term means a higher monthly payment but less total interest paid and faster equity buildup. A longer term lowers the monthly payment but increases total interest cost and raises the risk of owing more than the car is worth. The right choice depends on your monthly budget versus your total cost priorities.",
  },
  {
    q: "How much should I put down on a car?",
    a: "A down payment between 15% and 20% of the vehicle's total cost is a reasonable target for most buyers. Putting down more reduces your loan principal, your monthly payment, and your total interest cost, while also lowering the chance of ending up upside-down on the loan.",
  },
  {
    q: "Is it better to pay cash or finance a car?",
    a: "Paying cash avoids interest entirely and removes any risk of owing more than the car is worth, while financing can make sense if you can secure a very low rate and have a better use for your cash elsewhere, or if you're using the loan to build credit history through consistent on-time payments.",
  },
  {
    q: "Can I pay off my auto loan early to save on interest?",
    a: "In most cases, yes — paying extra toward principal or paying off the loan ahead of schedule reduces total interest paid. Some lenders include prepayment penalties or restrictions, though, so it's worth checking your loan agreement before counting on an early payoff.",
  },
  {
    q: "Is this auto loan calculator really free with no signup required?",
    a: "Yes. There's no account creation, no email requirement, and no hidden fees to use the calculator or view your full amortization schedule.",
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

export default function AutoLoanCalculatorFaqSection() {
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
          Buying a car involves more moving parts than most people expect, and the sticker price rarely
          reflects what you'll actually pay each month. This auto loan calculator, available free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, lets you factor in sales tax, trade-in
          credit, cash incentives, and title or registration fees so you can see a realistic monthly
          payment before you sit down at a dealership finance desk. Whether you're comparing loan offers,
          checking if a deal fits your budget, or working backward from a payment you can afford to find
          the right vehicle price, this tool gives you accurate numbers in seconds. It's built primarily
          around U.S. auto financing conventions and tax rules, so buyers outside the U.S. should adjust the
          tax and fee inputs to match their own market.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This Auto Loan Calculator Works</h2>
        <p style={pStyle}>
          The calculator uses the standard amortization formula that lenders apply to auto loans, factoring
          in your vehicle price, down payment, trade-in value, loan term, and interest rate (APR). Instead
          of just estimating a bare-bones payment, it also lets you add sales tax and title/registration
          fees to your loan amount, and subtract any manufacturer cash incentives or rebates you're eligible
          for. That matters because these extra costs are often rolled into the financed amount, quietly
          increasing both your monthly payment and the total interest you'll pay over the life of the loan.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You also have the flexibility to solve for either the monthly payment or the vehicle price. If
          you already know what you can afford each month, you can work backward, sometimes called a
          reverse auto loan calculation, to find the maximum price you should be negotiating for. If you
          already know the price of the car, the calculator will show you exactly what your payment will
          look like across different loan terms and rates.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Entering Your Vehicle Price, Down Payment, and Trade-In</h2>
        <p style={pStyle}>
          Getting an accurate estimate starts with entering the right inputs, and each field affects your
          payment differently.
        </p>
        <p style={pStyle}>
          Vehicle price is your starting point, either the negotiated price or MSRP if you haven't
          negotiated yet. Down payment reduces the amount you need to finance dollar for dollar, which
          shortens your effective loan and lowers your total interest cost. A larger down payment generally
          means fewer months of payments and less interest paid overall, while a smaller one stretches the
          loan out and increases the total interest you'll pay across the term.
        </p>
        <p style={pStyle}>
          Trade-in value works in a similar way, reducing both the amount financed and, in most states, the
          amount subject to sales tax, though the exact tax treatment varies by location, which is covered
          in detail further down this page. It's worth noting that dealership trade-in offers are often
          lower than what you could get selling the same vehicle privately, so it's worth weighing the
          convenience of a trade-in against the extra effort of a private sale before deciding which route
          nets you more value toward your next car.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can also check how much you'd save by paying certain costs upfront instead of rolling them
          into the loan. Dealer fees, sales tax, and add-ons the finance office tries to sell you all
          increase your loan balance if financed, so it's worth running the numbers both ways, financed
          versus paid out of pocket, to see which produces a lower total cost.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Sales Tax, Registration, and Other Purchase Fees</h2>
        <p style={pStyle}>
          A car purchase comes with a number of costs beyond the negotiated price, and most of these can
          either be rolled into your loan or paid upfront, depending on the dealer and your credit
          situation. Buyers with limited credit are sometimes required to pay certain fees out of pocket
          rather than financing them. Here's what typically shows up on a car purchase in the U.S.:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Sales tax</strong> — Most states charge sales tax on vehicle purchases, and this amount
            can usually be financed along with the price of the car. Alaska, Delaware, Montana, New
            Hampshire, and Oregon are the five states that don't charge sales tax on vehicle purchases at
            all.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Documentation (doc) fee</strong> — This is charged by the dealer for handling the
            paperwork behind your title and registration. It varies widely by dealer and state.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Title and registration fees</strong> — These are fees collected by your state's motor
            vehicle agency to title and register the car in your name.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Advertising fee</strong> — Some dealers pass along a regional advertising cost tied to
            promoting the manufacturer's vehicles in their area. If it isn't itemized separately, it's
            usually already baked into the advertised price. This typically runs a few hundred dollars when
            charged.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Destination fee</strong> — This covers shipping the vehicle from the factory to the
            dealership and is usually somewhere between $900 and $1,500 on a new car.
          </li>
          <li>
            <strong>Insurance</strong> — Auto insurance is legally required to drive in the U.S. and
            dealers generally won't complete financing paperwork without proof of coverage. Full coverage,
            which lenders typically require when you finance rather than pay cash, can run over $1,000 a
            year depending on your driving record and location. Many dealers can arrange short-term coverage
            to get you off the lot while you finalize a longer-term policy.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          If your dealer is bundling taxes and fees into the loan, make sure that's reflected in how you
          enter your numbers into the calculator so the payment estimate matches what you'll actually owe.
          If they're being paid upfront instead, leave them out of the financed amount. And if a dealer
          tries to include an unfamiliar or vaguely described charge in your paperwork, it's reasonable to
          ask exactly what it covers before agreeing to pay it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Dealership Financing vs. Direct Lending</h2>
        <p style={pStyle}>
          There are two main ways to finance a vehicle: direct lending and dealership financing. Direct
          lending means getting a loan straight from a bank, credit union, or other lender before you buy,
          then using those funds to pay the dealer once you've agreed on a price. Dealership financing works
          differently, the loan paperwork is arranged through the dealer, who typically works with a
          captive lender tied to the vehicle's manufacturer or with an outside bank that later purchases the
          loan contract from the dealer.
        </p>
        <p style={pStyle}>
          Direct lending tends to give buyers more negotiating leverage, since walking into a dealership
          with financing already arranged puts pressure on the dealer to either match or beat that rate. It
          also means you're not locked into any single dealership, so you can walk away from a bad deal more
          easily. Dealership financing, on the other hand, is often more convenient if you'd rather not shop
          multiple lenders yourself, though your rate options are generally more limited than what you'd
          find comparing offers on your own.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's also worth checking directly with car manufacturers, since they frequently offer promotional
          financing to move inventory, rates as low as 0%, 0.9%, 1.9%, or 2.9% aren't unusual on select
          models, and these can beat anything a bank or credit union will offer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Manufacturer Rebates and Incentives Affect Your Loan</h2>
        <p style={pStyle}>
          Cash rebates and other incentives from manufacturers reduce your loan amount much like a down
          payment would, but how they interact with sales tax depends on your state. In some states, sales
          tax is calculated on the vehicle's price before the rebate is subtracted, so a $50,000 car with a
          $2,000 rebate is still taxed as if it cost $50,000, not $48,000. A number of states don't tax
          rebates this way, including Alaska, Arizona, Delaware, Iowa, Kansas, Kentucky, Louisiana,
          Massachusetts, Minnesota, Missouri, Montana, Nebraska, New Hampshire, Oklahoma, Oregon,
          Pennsylvania, Rhode Island, Texas, Utah, Vermont, and Wyoming. Rules can change, so it's worth
          confirming current treatment with your state's tax authority before finalizing your numbers.
          Selecting your state in the calculator applies the right rule for you automatically.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Rebates are also typically limited to new vehicles. A handful of used car dealers offer cash
          incentives, but it's uncommon, largely because pinning down a fair market value for a used vehicle
          is harder than pricing a new one off MSRP.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding the Numbers Behind Your Car Payment</h2>
        <p style={pStyle}>
          A car payment is driven by four core variables: the principal you're financing, your interest
          rate, your loan term, and whether the vehicle is new or used.
        </p>
        <p style={pStyle}>
          Principal is simply how much you're borrowing after your down payment, trade-in credit, and any
          rebate are subtracted from the purchase price (plus tax and fees, if financed). A bigger down
          payment shrinks the principal directly, which shortens your effective repayment burden and lowers
          total interest, while a smaller one does the opposite.
        </p>
        <p style={pStyle}>
          Interest rate (APR) is the cost of borrowing, expressed annually, and it's the figure you should
          compare across lenders rather than a bare "interest rate," since APR bundles in certain fees along
          with the base rate. You don't get to pick your own APR, lenders set it based on your credit
          profile, the loan term, and whether the vehicle is new or used. Someone with subprime credit can
          end up paying a rate roughly 10 percentage points higher than someone with excellent credit, which
          is why improving your credit before applying is one of the highest-leverage things you can do.
        </p>
        <p style={pStyle}>
          Loan term, typically ranging from 24 to 84 months in the U.S., determines how your total cost is
          spread out. A longer term lowers your monthly payment but stretches out interest charges and slows
          down how quickly you build equity, sometimes to the point where you owe more than the car is
          worth, a situation known as being upside-down or having negative equity. A shorter term raises the
          monthly payment but reduces total interest and gets you to full ownership faster.
        </p>
        <p style={pStyle}>
          Vehicle condition, new versus used, also shapes your numbers. New cars carry a higher MSRP and
          therefore a larger principal, but they typically qualify for lower APRs than comparable used-car
          loans. Used vehicles cost less upfront and depreciate more slowly than new ones, though they can
          come with higher maintenance costs over time, which is worth factoring into your overall budget
          even though it won't show up in the loan calculation itself.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To see how these variables interact, consider a $32,000 vehicle with a $4,000 trade-in and a 6.5%
          local sales tax rate. If your state taxes the price after the trade-in credit is applied, you'd
          be taxed on $28,000 instead of the full $32,000, a savings of roughly $260 in tax alone. Add a
          $1,500 down payment and a $500 rebate that isn't taxed in your state, and your financed amount
          drops meaningfully below the sticker price before interest even enters the picture. Running that
          same loan at 60 months instead of 72 months at a 7% APR typically shows a payment that's
          noticeably higher per month but saves well over a thousand dollars in total interest by payoff,
          exactly the kind of trade-off this calculator is built to make visible instantly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Trade-In Value and How It Affects Your Sales Tax</h2>
        <p style={pStyle}>
          Trading in your current vehicle reduces the price you're financing, and in most states with
          sales tax, it also reduces the amount that tax is calculated on. For example, on a $50,000 new
          car with a $10,000 trade-in and an 8% sales tax rate, if your state applies tax to the post-trade-in
          price, the math looks like this:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>
          ($50,000 − $10,000) × 8% = $3,200 in sales tax
        </p>
        <p style={pStyle}>
          Not every state offers this reduction, though. California, the District of Columbia, Hawaii,
          Kentucky, Maryland, Michigan, Montana, and Virginia are commonly cited as not reducing the taxable
          amount for a trade-in, meaning the same purchase would be taxed on the full price:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>
          $50,000 × 8% = $4,000 in sales tax
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That's an $800 difference on this example alone, which is a meaningful enough gap that buyers in
          these states sometimes come out ahead selling their old vehicle privately and applying the
          proceeds toward the new purchase instead of trading it in at the dealership. As with rebate
          taxation, confirm your state's current rule before assuming either scenario applies to your
          purchase.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Actually Need an Auto Loan Calculator</h2>
        <p style={pStyle}>
          There are several common situations where running the numbers ahead of time saves you money and
          stress.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Before visiting a dealership, you walk in knowing your target price range instead of relying on
          the salesperson's numbers. When comparing loan offers from a bank, credit union, and dealer, even
          a one-point difference in APR can change your total cost by hundreds or thousands of dollars over
          a multi-year term. When deciding between a shorter and longer loan term, since seeing the monthly
          payment and total interest side by side makes the tradeoff concrete instead of abstract. When you
          have a trade-in vehicle and want to know how much it actually reduces your new loan and your tax
          bill, rather than guessing based on the dealer's initial offer. When you're budgeting for a car
          purchase and need to work backward from an affordable monthly payment to figure out what price
          range to shop in. When refinancing an existing auto loan, to compare your current payment against
          what a new rate or term would produce. And when a manufacturer incentive or rebate is on the
          table, you can see its real effect on your bottom line after accounting for how, or whether, it's
          taxed in your state.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Auto Loan Amortization Schedule</h2>
        <p style={pStyle}>
          Once you calculate your payment, the amortization schedule breaks down exactly how each
          installment is split between principal and interest over the loan term. It typically shows, for
          every scheduled payment: the due date, how much goes toward principal, how much goes toward
          interest, the remaining balance after that payment, and eventually the projected payoff date.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Early in the loan, a larger share of each payment goes toward interest; as the balance shrinks,
          more of each payment shifts toward principal. This breakdown is useful in a few practical ways.
          It shows you how much you'd save in interest by making extra principal payments. It tells you
          your outstanding balance at any point in time, which matters if you're considering selling or
          trading in the vehicle before the loan is paid off. And it gives you the true total cost of the
          loan, principal plus total interest, so you can compare that figure across different rate and
          term combinations rather than judging a loan only by its monthly payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Smart Auto Loan Strategies</h2>
        <p style={pStyle}>
          <strong>Preparation.</strong> The most effective way to get a good deal is to know what you can
          afford and what a fair rate looks like before you ever walk into a dealership. Research typical
          pricing for the make and model you want, and get quotes from more than one lender so you have
          leverage in negotiations. Dealers, like most businesses, aim to maximize what they make on a
          sale, but they're often willing to come down significantly from an opening offer when a buyer has
          done their homework and has other options on the table. Getting pre-approved through direct
          lending before you shop strengthens your position considerably.
        </p>
        <p style={pStyle}>
          <strong>Credit.</strong> Your credit, and to a lesser degree your income, largely determines both
          whether you're approved and what rate you're offered, regardless of whether you finance through a
          dealer or a direct lender. Borrowers with strong credit consistently pay less over the life of the
          loan, so taking steps to improve your score before applying, even modestly, can shift you into a
          meaningfully better rate tier.
        </p>
        <p style={pStyle}>
          <strong>Cash rebate vs. lower interest rate.</strong> Manufacturers frequently let buyers choose
          between a cash rebate that lowers the purchase price immediately or a reduced interest rate that
          saves money over time through lower interest charges. Which one saves you more depends on the
          loan amount, term, and how the rebate is taxed in your state, running both scenarios through the
          calculator is the fastest way to see which comes out ahead for your specific numbers.
        </p>
        <p style={pStyle}>
          <strong>Early payoff.</strong> Paying off your auto loan ahead of schedule shortens the loan and
          can meaningfully reduce the interest you pay overall. That said, some lenders build in prepayment
          penalties or restrict early payoff in the loan agreement, so it's worth reading the contract terms
          carefully before you sign, especially if paying the loan off early is part of your plan from the
          start.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Considering alternatives.</strong> A brand-new car depreciates quickly, often more than
          10% the moment it leaves the lot, so a car that's just a few years old can offer significant
          savings over buying new, with a much smaller portion of that early depreciation already absorbed
          by the previous owner. For drivers who mainly want the experience of driving something new every
          few years rather than long-term ownership, leasing is worth considering too, since it typically
          has a lower upfront cost than a full purchase, though you won't build equity in the vehicle.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Choosing Your Down Payment and Loan Term</h2>
        <p style={pStyle}>
          A down payment in the range of 15% to 20% of the vehicle's total cost is a reasonable target for
          most buyers, since it keeps your loan-to-value ratio healthy and reduces the odds of ending up
          upside-down on the loan later. A bigger down payment on the same vehicle lowers both your monthly
          payment and your total interest cost, for example, on a $45,000 vehicle financed at 6.4% over 60
          months, moving from a $9,000 down payment to a $12,000 down payment drops the principal from
          $36,000 to $33,000, which brings the payment down from roughly $703 to $664 a month and cuts
          total interest paid from about $6,162 to $5,648.
        </p>
        <p style={pStyle}>
          Your loan term matters just as much as the rate you're charged. On a $30,000 loan, choosing a
          48-month term over 60 months might mean paying around $719 a month instead of $593, a higher
          monthly cost, but it can also mean paying roughly $1,000 less in total interest by the time the
          loan is paid off, even if the shorter term carries a slightly higher rate. Before settling on a
          term, decide the maximum payment you can comfortably handle each month, factoring in the other
          costs of ownership, fuel, insurance, and maintenance, that don't show up in the loan calculation
          itself but absolutely affect your budget. Walking into a dealership already knowing that number
          puts you in a stronger position to negotiate the purchase price rather than negotiating around a
          monthly payment the dealer proposes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because even a small difference in APR compounds over a multi-year term, it's worth running the
          same loan amount and term through the calculator using rate quotes from a few different lenders
          before committing. This is also a good moment to check current average auto loan rates for your
          credit tier, which gives you a realistic benchmark for what you should expect to be offered, and
          helps you judge whether paying down other debt or adding a cosigner before applying is likely to
          improve your rate meaningfully.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should You Pay Cash Instead of Financing?</h2>
        <p style={pStyle}>
          Most vehicle purchases in the U.S. are financed, but paying cash outright has real advantages
          worth weighing.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>No monthly payments.</strong> Paying cash means there's no loan looming over you for
            years and no risk of late fees for a missed payment.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>No interest cost.</strong> Skipping financing means skipping interest entirely. As an
            example, financing $32,000 over five years at 6% works out to a monthly payment of about
            $618.65 and roughly $5,119 in total interest paid over the loan, money a cash buyer keeps.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Full ownership from day one.</strong> With the car paid off in full, there are no
            lender-imposed restrictions on selling it, choosing your insurance coverage, or modifying it
            however you like.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>A natural check on overspending.</strong> Paying in a single lump sum limits you to
            what's actually in your budget, whereas financing makes it easy to stretch into a pricier
            vehicle by extending the term a little further, something dealers are often happy to help you do
            through added fees or extended financing terms.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Occasional cash-only discounts.</strong> Some rebate offers are structured specifically
            for buyers who aren't financing, so paying cash can occasionally unlock a better price than a
            financed purchase would.
          </li>
          <li>
            <strong>No risk of going upside-down.</strong> Since a depreciating asset can end up worth less
            than what's owed on it, paying in full removes that risk completely.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          That said, financing isn't automatically the worse choice. If you can secure a very low
          promotional rate and have a better use for your cash, investing it somewhere with a higher
          expected return, for instance, financing the car while investing the difference can leave you
          ahead financially. Financing responsibly and making every payment on time is also one of the more
          straightforward ways to build a stronger credit history, which pays off in other areas of your
          finances down the line. Which approach makes sense depends on your own financial picture, not a
          one-size-fits-all rule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Accurate: What to Expect From This Tool</h2>
        <p style={pStyle}>
          This auto loan calculator is completely free to use, with no signup, account creation, or hidden
          charges required. You can run as many calculations as you need, comparing different terms, rates,
          or trade-in scenarios, without any usage limits.
        </p>
        <p style={pStyle}>
          Because the calculator runs directly in your browser, the numbers you enter (vehicle price,
          trade-in value, personal financial details) are not stored or transmitted anywhere. Nothing you
          input is saved on Tolz's servers, so you can freely test different loan scenarios without any
          privacy concerns. The math behind the tool follows the same amortization formula used by banks and
          auto lenders, so the payment estimates you see closely match what you'd be quoted in a real loan
          agreement, though your final rate and terms will always depend on the lender's underwriting.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You also don't need to download anything or build a spreadsheet to get a full amortization
          breakdown, the calculator works directly in your browser on desktop or mobile, and you can rerun
          it as many times as you want while you shop around, negotiate, or compare offers from different
          lenders.
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
