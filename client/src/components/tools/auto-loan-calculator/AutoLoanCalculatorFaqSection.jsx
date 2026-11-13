import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is an online auto loan calculator?",
    a: "The math is highly accurate because it uses the same amortization formula lenders use. What can change your real payment is the exact APR a lender offers, which depends on your credit and underwriting.",
  },
  {
    q: "Does a car loan calculator include sales tax?",
    a: "Not all do, but this one does. Enter your local sales tax rate so it's included in your loan amount, which gives you a more realistic total.",
  },
  {
    q: "How much can I borrow for a car loan?",
    a: "It depends on your income, credit, existing debts, and the car's value. Many lenders want your total debt payments to stay under about 45% to 50% of your gross income.",
  },
  {
    q: "How does a trade-in affect my auto loan payment?",
    a: "It lowers the amount you finance, and in most states it also lowers the amount that's taxed. A few states, including California and Maryland, tax the full price, so check your state's rule.",
  },
  {
    q: "What's the difference between dealership financing and direct lending?",
    a: "Direct lending is a loan you get from a bank or credit union before you buy. Dealership financing is arranged through the dealer. Direct lending usually gives you more leverage, while dealership financing is more convenient and sometimes has special manufacturer rates.",
  },
  {
    q: "Are manufacturer rebates taxed?",
    a: "It depends on the state. In many states, tax is figured on the price before the rebate, so the rebate doesn't lower your tax. Confirm your state's current rule before you finalize your budget.",
  },
  {
    q: "What credit score do I need for the best auto loan rate?",
    a: "Lenders generally save their lowest rates for scores in the high 700s and above (781 and up is called super prime), though you can get approved at many score levels.",
  },
  {
    q: "What does pre-approval mean, and do I have to use it?",
    a: "Pre-approval is a conditional offer showing how much you can borrow and at what rate. You don't have to use it, and you only owe money after you sign the final loan.",
  },
  {
    q: "Is it better to choose a longer or shorter auto loan term?",
    a: "A shorter term has a higher payment but costs less in total interest and builds equity faster. A longer term, like 84 months, lowers the payment but costs much more in interest and raises the risk of owing more than the car is worth.",
  },
  {
    q: "How much should I put down on a car?",
    a: "Aim for 15% to 20% of the car's price. A bigger down payment lowers your payment, your interest cost, and your risk of going upside down.",
  },
  {
    q: "Is it better to pay cash or finance a car?",
    a: "Cash avoids interest and any risk of negative equity. Financing can make sense if you get a very low rate, have a better use for your cash, or want to build credit.",
  },
  {
    q: "Can I pay off my auto loan early?",
    a: "Usually, yes, and it reduces total interest. Some lenders charge prepayment penalties, so check your contract first.",
  },
  {
    q: "Can I refinance an auto loan?",
    a: "Yes. Refinancing can lower your rate or payment if your credit has improved or rates have dropped. Lenders may have limits on vehicle age, mileage, and loan balance.",
  },
  {
    q: "Is this auto loan calculator really free?",
    a: "Yes. There's no signup, no email requirement, and no hidden fees, including for the full amortization schedule.",
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
const firstH3 = { ...h3Style, marginTop: 0 };
const cardStyle = { padding: "20px 20px" };
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
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What is an auto loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Auto Loan, and How Do You Calculate It?</h2>
        <p style={pStyle}>
          An auto loan is money you borrow to buy a vehicle and pay back in fixed monthly payments over a set term,
          usually 36 to 84 months. The car itself secures the loan. That means the lender holds a lien on the title
          until you pay it off, and it can repossess the vehicle if you stop making payments.
        </p>
        <p style={pStyle}>Lenders figure your monthly payment with the standard amortization formula:</p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
          Payment = P × r ÷ (1 − (1 + r)⁻ⁿ)
        </p>
        <p style={pStyle}>
          In that formula, P is the amount you borrow, r is your monthly interest rate (your APR divided by 12), and n
          is the number of monthly payments. For example, a $30,000 loan at 7% APR over 60 months works out to about
          $594 a month. You'd pay roughly $35,640 in total, which includes about $5,640 in interest.
        </p>
        <p style={pStyle}>
          You don't need to do that math by hand. Enter your vehicle price, down payment, trade-in value, loan term, and
          APR, and the calculator does the rest. It also lets you add sales tax and title or registration fees to the
          loan, and subtract any manufacturer rebate you qualify for. Those extras are often rolled into the financed
          amount, which quietly raises both your payment and the total interest you pay.
        </p>
        <p style={last}>
          You can solve for either number. If you already know the price, the calculator shows your payment across
          different terms and rates. If you know what you can afford each month, work backward to find the highest
          price you should negotiate toward. This is sometimes called a reverse auto loan calculation.
        </p>
      </div>

      {/* What to enter */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Enter: Vehicle Price, Down Payment, and Trade-In</h2>
        <p style={pStyle}>Each input changes your payment in a different way, so it helps to know what to put in each field.</p>
        <p style={pStyle}>
          <strong>Vehicle price</strong> is the negotiated price, or the MSRP if you haven't negotiated yet.{" "}
          <strong>Down payment</strong> reduces the amount you borrow dollar for dollar. A bigger down payment means a
          lower payment and less interest overall, while a smaller one does the opposite.
        </p>
        <p style={pStyle}>
          <strong>Trade-in value</strong> also lowers the amount you finance, and in most states it lowers the amount
          that's taxed too (more on that below). Keep in mind that dealers often offer less for a trade-in than you'd get
          from a private sale. If you have the time, get a few quotes from online car buyers or other dealers before you
          accept the first number.
        </p>
        <p style={last}>
          It's also worth running the numbers both ways: once with fees and add-ons financed, and once with them paid
          out of pocket. Dealer fees, sales tax, and extras from the finance office all increase your loan balance and
          interest if you finance them.
        </p>
      </div>

      {/* Fees */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sales Tax, Registration, and Other Purchase Fees</h2>
        <p style={pStyle}>
          Most of the costs beyond the price can be rolled into your loan or paid upfront, depending on the dealer and
          your credit. Buyers with weaker credit are sometimes asked to pay certain fees out of pocket. Here's what
          usually shows up on a U.S. car purchase:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Sales tax.</strong> Most states tax vehicle purchases, and you can usually finance it. Alaska,
            Delaware, Montana, New Hampshire, and Oregon have no statewide sales tax. Some of them still charge other
            taxes or fees. Delaware, for example, charges a document fee based on the price, and Alaska allows local
            sales taxes.
          </li>
          <li style={liStyle}>
            <strong>Documentation (doc) fee.</strong> The dealer charges this for handling title and registration
            paperwork. It varies widely by dealer and state, and some states cap it.
          </li>
          <li style={liStyle}>
            <strong>Title and registration fees.</strong> Your state's motor vehicle agency collects these to put the car
            in your name.
          </li>
          <li style={liStyle}>
            <strong>Destination fee.</strong> This covers shipping a new car from the factory to the dealership. It's
            usually listed on the window sticker and often runs from about $1,000 to $2,000.
          </li>
          <li style={liStyle}>
            <strong>Advertising fee.</strong> Some dealers pass along a regional advertising charge. If it isn't
            itemized, it's usually already built into the advertised price.
          </li>
          <li>
            <strong>Insurance.</strong> You need proof of coverage before the dealer will finish the paperwork. Lenders
            also require full coverage (collision and comprehensive) while you owe money on the car. Depending on your
            driving record and where you live, full coverage can easily cost more than $2,000 a year. It doesn't show up
            in the loan, but it belongs in your monthly budget.
          </li>
        </ul>
        <p style={last}>
          If the dealer is rolling taxes and fees into the loan, include them in the calculator so the estimate matches
          what you'll owe. If you're paying them upfront, leave them out. And if you see a vague or unfamiliar charge on
          the paperwork, ask exactly what it covers before you agree to it.
        </p>
      </div>

      {/* How much can you borrow */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Can You Borrow on an Auto Loan?</h2>
        <p style={pStyle}>
          There's no single limit. Lenders look at your income, your credit, your existing debts, and the value of the
          car. Here's what matters most:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Debt-to-income ratio (DTI).</strong> This compares your monthly debt payments to your gross monthly
            income. Many lenders want your total DTI, including the new car payment, to stay under roughly 45% to 50%.
            Some also cap the car payment itself at around 15% to 20% of your gross income.
          </li>
          <li style={liStyle}>
            <strong>Credit score.</strong> A strong score can mean a higher approved amount and a better rate. A low
            score usually means a lower limit or a larger required down payment.
          </li>
          <li style={liStyle}>
            <strong>Loan-to-value ratio (LTV).</strong> Lenders compare the loan to what the car is worth. Borrowers with
            good credit may be approved for close to 100% of the car's value or a bit more. Weaker credit usually means a
            lower percentage.
          </li>
          <li>
            <strong>Minimum and maximum amounts.</strong> Most lenders set a floor (often $5,000 or so) and a ceiling
            that varies by lender and vehicle.
          </li>
        </ul>
        <p style={last}>
          For context, Experian reports that the average new car loan was about $43,600 in the second quarter of 2026,
          and the average used car loan was about $27,900. The amount a lender will approve isn't always the amount you
          should borrow, though. A common rule of thumb is to put 20% down, finance for no more than four years, and
          keep your total car costs (payment, insurance, and fuel) under 10% of your gross income. Many buyers need a
          longer term to make that work, but the idea is a useful target.
        </p>
      </div>

      {/* Process */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Auto Loan Process, Step by Step</h2>
        <p style={pStyle}>Getting a car loan is simpler when you do things in the right order.</p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Set a budget.</strong> Decide on a monthly payment you can handle, then use the calculator to see
            what price that supports.
          </li>
          <li style={liStyle}>
            <strong>Check your credit.</strong> Pull your free reports at AnnualCreditReport.com and your score from
            your bank or card issuer. Fix any errors before you apply.
          </li>
          <li style={liStyle}>
            <strong>Get pre-approved.</strong> Apply with a bank, credit union, or online lender to see your rate and
            maximum amount before you shop.
          </li>
          <li style={liStyle}>
            <strong>Shop for the car.</strong> Negotiate the price of the vehicle first, then talk about financing.
          </li>
          <li style={liStyle}>
            <strong>Compare financing.</strong> Ask the dealer if it can beat your pre-approved rate. Take the lower
            APR, not the lower payment.
          </li>
          <li style={liStyle}>
            <strong>Finalize the loan.</strong> The lender verifies your information and the car, and you review and
            sign the contract.
          </li>
          <li>
            <strong>Pay and register.</strong> The lender pays the dealer, you add the car to your insurance, and the
            title and registration are processed. Your payments start about 30 to 45 days later.
          </li>
        </ol>
        <p style={pStyle}>
          <strong>When should you apply?</strong> The best time is after you've set a budget and before you visit a
          dealership, ideally a week or two ahead of buying. Pre-approvals are usually good for 30 to 60 days. If you
          apply to several lenders, try to do it within a short window. Credit scoring models typically count multiple
          auto loan inquiries made within 14 days (and up to 45 days with some newer models) as a single inquiry.
        </p>
        <p style={pStyle}>
          <strong>How long does approval take?</strong> Online pre-approval often takes a few minutes. Final approval
          at a dealership can happen within a few hours, sometimes the same day. Banks and credit unions may take one to
          three business days, especially if they need extra documents.
        </p>
        <p style={pStyle}>
          <strong>What do you need for a car loan?</strong> Lenders typically ask for:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>A valid driver's license or other government ID</li>
          <li style={liStyle}>Your Social Security number (or ITIN with some lenders)</li>
          <li style={liStyle}>Proof of income, such as recent pay stubs, W-2s, or tax returns</li>
          <li style={liStyle}>Proof of address, such as a utility bill or lease</li>
          <li style={liStyle}>Proof of auto insurance</li>
          <li style={liStyle}>Vehicle details, including the VIN, mileage, and the purchase agreement</li>
          <li style={liStyle}>
            The title and loan payoff information if you're trading in a vehicle you still owe on
          </li>
          <li>Bank account details, if you want to set up automatic payments</li>
        </ul>
        <p style={last}>
          <strong>How do banks verify income?</strong> Lenders usually check pay stubs and W-2s, and they may call your
          employer or use a payroll database to confirm that you work there. If you're self-employed or have irregular
          income, expect to provide tax returns, bank statements, or 1099s. Some lenders also request your tax
          transcripts directly from the IRS with your permission.
        </p>
      </div>

      {/* Pre-approval */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Does a Pre-Approved Auto Loan Work?</h2>
        <p style={pStyle}>
          A pre-approval is a lender's conditional offer. After you share basic details about your income and credit,
          the lender tells you the maximum amount it's willing to lend, the rate, and the term. Some lenders use a soft
          credit check for a preliminary quote, and others run a hard inquiry, so ask which one applies before you
          submit.
        </p>
        <p style={pStyle}>
          The approval is conditional. The lender still has to verify your information and approve the specific car,
          and the offer expires after a set time, usually 30 to 60 days.
        </p>
        <p style={pStyle}><strong>The benefits of pre-approval:</strong></p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            You know your budget and rate before you walk in, so you negotiate from a stronger position.
          </li>
          <li style={liStyle}>
            It gives you a benchmark. If the dealer offers financing, you can tell whether it's actually a better deal.
          </li>
          <li style={liStyle}>
            It separates the car price from the financing, which makes it harder for a dealer to hide costs inside a
            monthly payment.
          </li>
          <li>It speeds up the purchase, since the paperwork is already started.</li>
        </ul>
        <p style={pStyle}>
          <strong>What happens after you're pre-approved?</strong> You shop for the car, choose one that fits the
          lender's limits, and send the lender the purchase details. The lender then verifies everything, issues the
          final loan documents, and pays the dealer once you sign. Check the final rate and terms against your
          pre-approval before you sign.
        </p>
        <p style={pStyle}>
          <strong>Can you decide not to take a loan you've been approved for?</strong> Yes. A pre-approval isn't a
          contract, and you're under no obligation to use it. You only owe money once you sign the final loan agreement
          and the funds are released. If you skip it, the only lasting effect is the credit inquiry, which has a small,
          temporary effect on your score.
        </p>
        <p style={last}>
          <strong>Can you lose a pre-approval if you quit your job?</strong> Yes, it's possible. Pre-approvals depend
          on your income and employment staying the same. Many lenders verify your job again right before funding, and
          a job change can lead them to cancel or reduce the offer. Avoid changing jobs, opening new credit accounts, or
          taking on new debt between pre-approval and closing. If something does change, tell the lender early.
        </p>
      </div>

      {/* Interest rate */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Interest Rate Can You Expect?</h2>
        <p style={pStyle}>
          Rates change often, so use current averages as a rough guide rather than a promise. According to{" "}
          <Ext href="https://www.experian.com/blogs/ask-experian/auto-loan-rates-financing/">
            Experian's State of the Automotive Finance Market report
          </Ext>
          , the average APR in the second quarter of 2026 was about 6.35% for new cars and 11.19% for used cars. Your
          own rate depends heavily on your credit tier. Early 2026 Experian data shows new car rates ranging from about
          4.5% for the highest scores to about 16% for the lowest, and used car rates running from around 6.3% for
          super prime borrowers to more than 21% for deep subprime borrowers.
        </p>
        <p style={pStyle}>
          <strong>Who sets auto loan interest rates?</strong> The lender does. No government agency sets the rate on
          your car loan. The Federal Reserve's policy rate influences what lenders pay for money, so rates tend to rise
          and fall with it, but each lender sets its own prices. If you finance at a dealership, the dealer may also add
          a markup to the lender's rate, which is another reason to arrive with a pre-approval.
        </p>
        <p style={pStyle}><strong>How do lenders decide your rate?</strong> The main factors are:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Your credit score and credit history</li>
          <li style={liStyle}>The loan term (longer terms often carry higher rates)</li>
          <li style={liStyle}>Whether the car is new or used, and its age and mileage</li>
          <li style={liStyle}>Your down payment and the loan-to-value ratio</li>
          <li style={liStyle}>Your income and debt-to-income ratio</li>
          <li>The type of lender, since credit unions often offer lower rates than banks or dealers</li>
        </ul>
        <p style={pStyle}>
          <strong>What are the cheapest ways to get an auto loan?</strong> Start by comparing offers from at least three
          lenders, including a credit union. Then:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Improve your credit score before applying, if you can wait.</li>
          <li style={liStyle}>Put more money down.</li>
          <li style={liStyle}>Choose the shortest term you can afford.</li>
          <li style={liStyle}>
            Check manufacturer financing deals, which sometimes offer rates as low as 0% on select new models.
          </li>
          <li style={liStyle}>Add a cosigner with strong credit if your own profile is thin.</li>
          <li>Turn down add-ons you don't need, because financing them means paying interest on them.</li>
        </ul>
        <p style={last}>
          <strong>Do banks match auto loan rates?</strong> Sometimes. A bank or credit union may match or beat a
          competitor's offer, especially if you're an existing customer. It's never guaranteed, but it costs nothing to
          ask. Bring a written offer from another lender, and focus on the APR rather than only the payment. Dealers are
          the most likely to match, since they have access to several lenders.
        </p>
      </div>

      {/* Subprime */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are Subprime Auto Loans?</h2>
        <p style={pStyle}>
          A subprime auto loan is made to a borrower with a lower credit score, generally in the range of 600 or below
          (Experian defines subprime as 501 to 600 and deep subprime as 500 and under). Because the lender takes on more
          risk, these loans come with much higher rates. Recent Experian data shows average used car rates around 19%
          for subprime and above 21% for deep subprime borrowers.
        </p>
        <p style={pStyle}>Subprime loans can help you get a car and rebuild credit, but they cost a lot. If you go this route:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            Compare offers from credit unions and online lenders before you accept a dealer's.
          </li>
          <li style={liStyle}>
            Put as much down as you can to reduce the amount financed and the lender's risk.
          </li>
          <li style={liStyle}>
            Be careful with buy-here-pay-here lots, which can charge very high rates, may not report your payments to
            the credit bureaus, and sometimes use tracking devices.
          </li>
          <li style={liStyle}>
            Look for a loan that doesn't carry prepayment penalties, so you can refinance when your credit improves.
          </li>
          <li>
            Pick a car that's reasonably priced. A cheaper, reliable vehicle usually makes more sense than stretching for
            a nicer one.
          </li>
        </ul>
      </div>

      {/* Down payment and term */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Choosing Your Down Payment and Loan Term</h2>
        <p style={pStyle}>
          A down payment of 15% to 20% of the vehicle's cost is a reasonable target for most buyers. It keeps your
          loan-to-value ratio healthy and lowers the risk of ending up upside down. A larger down payment also saves
          money. On a $45,000 vehicle at 6.4% APR over 60 months, going from a $9,000 down payment to a $12,000 down
          payment cuts the amount borrowed from $36,000 to $33,000. That lowers the payment from about $703 to about $644
          a month and reduces total interest from roughly $6,160 to about $5,650.
        </p>
        <p style={pStyle}>
          The loan term matters as much as the rate. On a $30,000 loan at 7% APR, a 48-month term costs about $718 a
          month, compared with about $594 for 60 months. The shorter loan has a higher payment, but it saves you around
          $1,160 in total interest.
        </p>
        <p style={pStyle}>
          <strong>Is a 7-year (84-month) car loan a bad idea?</strong> In most cases, yes. A longer term lowers the
          monthly payment, but the costs add up:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>You pay much more interest.</strong> A $35,000 loan at 7% costs about $6,580 in interest over 60
            months, but about $9,380 over 84 months. That's an extra $2,800 for the same car.
          </li>
          <li style={liStyle}>
            <strong>You can end up upside down.</strong> Cars lose value faster than your balance drops in the early
            years, so you may owe more than the car is worth for a long time.
          </li>
          <li style={liStyle}>
            <strong>Repair costs overlap with payments.</strong> By years six and seven, the car is likely out of
            warranty, and you could be paying for repairs and the loan at once.
          </li>
          <li><strong>Rates are often higher on longer terms.</strong></li>
        </ul>
        <p style={pStyle}>
          An 84-month loan can make sense if you get a very low promotional rate and can handle the risk of owing more
          than the car is worth, but it should be the exception. If a car only fits your budget at 84 months, consider a
          cheaper car, a bigger down payment, or a used vehicle.
        </p>
        <p style={last}>
          Before settling on a term, decide the highest payment you can comfortably handle once you add fuel,
          insurance, and maintenance. Walk into the dealership with that number, and negotiate the purchase price
          instead of letting the dealer negotiate around a monthly payment.
        </p>
      </div>

      {/* Trade-in tax */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Trade-In Value and How It Affects Sales Tax</h2>
        <p style={pStyle}>
          Trading in your current vehicle reduces what you finance, and in most states it also reduces the amount you
          pay tax on. For example, on a $50,000 car with a $10,000 trade-in and an 8% sales tax rate, the math looks like
          this:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
          ($50,000 − $10,000) × 8% = $3,200 in sales tax
        </p>
        <p style={last}>
          Not every state gives you that break. A few, including California and Maryland, tax the full price, so the
          same purchase would cost $4,000 in tax. That's an $800 difference, which is why buyers in those states
          sometimes come out ahead by selling the old car privately. Rules change, so check your state's current
          treatment with your motor vehicle agency or department of revenue before you decide.
        </p>
      </div>

      {/* Rebates */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Manufacturer Rebates and Incentives Affect Your Loan</h2>
        <p style={pStyle}>
          A cash rebate lowers the amount you finance, much like a down payment. How it affects your sales tax depends
          on your state. In many states, tax is figured on the price before the rebate is taken off, so a $50,000 car
          with a $2,000 rebate is still taxed as if it cost $50,000. Other states tax the lower amount. Confirm your
          state's rule before you finalize the numbers.
        </p>
        <p style={pStyle}>
          Rebates are usually limited to new vehicles. Used car dealers rarely offer them, because it's harder to pin
          down a fair price on a used car.
        </p>
        <p style={last}>
          <strong>Cash rebate or low interest rate?</strong> Manufacturers often make you choose between the two. The
          better deal depends on your loan amount, term, and how the rebate is taxed. Run both scenarios through the
          calculator to compare total cost, not just the monthly payment.
        </p>
      </div>

      {/* Dealer vs direct */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Dealership Financing vs. Direct Lending</h2>
        <p style={pStyle}>
          There are two main ways to finance a car. With <strong>direct lending</strong>, you get a loan from a bank,
          credit union, or online lender before you buy, then use it to pay the dealer. With{" "}
          <strong>dealership financing</strong>, the dealer arranges the loan, usually through the manufacturer's
          finance company or an outside bank that buys the contract.
        </p>
        <p style={last}>
          Direct lending gives you more leverage. If you arrive with financing already approved, the dealer has to match
          or beat your rate, and you can walk away from a bad deal easily. Dealership financing is more convenient, and
          it's sometimes the best option because manufacturers often run promotional rates like 0%, 1.9%, or 2.9% on
          select new models. Those can beat what a bank or credit union will offer, so it's worth checking both.
        </p>
      </div>

      {/* Who can get a loan */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Can Get a Car Loan?</h2>
        <h3 style={firstH3}>Can an 18-year-old get a car loan?</h3>
        <p style={pStyle}>
          Yes, in most cases. In most states, 18 is the legal age to sign a loan contract, though a few set it at 19 or
          21. The bigger hurdle is credit history. Most 18-year-olds have little or none, so lenders often ask for a
          cosigner or a larger down payment. Some lenders also set their own minimum age or income, so check before you
          apply.
        </p>
        <h3 style={h3Style}>Can you get a car loan if you already have one?</h3>
        <p style={pStyle}>
          Yes, as long as your income can support both payments. Lenders look at your debt-to-income ratio, your payment
          history on the existing loan, and the value of both vehicles. Having two car loans, or several, isn't illegal
          or unusual, but each new loan makes the next one harder to get and more expensive. If you owe more than the
          first car is worth, expect even tighter limits.
        </p>
        <h3 style={h3Style}>Can you get a car loan if you have a personal loan?</h3>
        <p style={pStyle}>
          Yes. A personal loan counts as debt in your debt-to-income ratio, so it reduces how much you can borrow, but it
          doesn't disqualify you. A history of on-time payments on the personal loan can actually help your application.
        </p>
        <h3 style={h3Style}>Can you get an auto loan during bankruptcy?</h3>
        <p style={last}>
          It's possible, but it takes extra steps. If you're in Chapter 13, you generally need permission from the
          bankruptcy trustee or court before you take on new debt. In Chapter 7, you may need court approval while the
          case is open, and it's often easier after the discharge. Some lenders specialize in borrowers with a recent
          bankruptcy, but expect a high interest rate and a down payment requirement. Talk to your bankruptcy attorney
          before you apply.
        </p>
      </div>

      {/* Negative equity */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Negative Equity, and How Do You Get Out of It?</h2>
        <p style={pStyle}>
          Negative equity means you owe more on the loan than the car is worth. It's also called being upside down. It
          happens most often when you put little or nothing down, choose a long term, or roll old debt into a new loan,
          since cars lose value quickly. A new car can lose around 10% of its value as soon as you drive it off the lot.
        </p>
        <p style={pStyle}>
          It's not a problem unless you need to sell the car or it's totaled. If you want to get out of it:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Pay extra toward principal.</strong> Even small extra payments help close the gap faster. Make sure
            your lender applies the extra to principal and not to future payments.
          </li>
          <li style={liStyle}>
            <strong>Keep the car and keep paying.</strong> Over time, your balance falls faster than the car's value, and
            you'll eventually be right-side up.
          </li>
          <li style={liStyle}>
            <strong>Refinance, if you qualify.</strong> A lower rate can reduce interest, though many lenders won't
            refinance a loan that's far underwater.
          </li>
          <li style={liStyle}>
            <strong>Sell the car and pay the difference.</strong> If you have savings or can get a small personal loan,
            this ends the problem.
          </li>
          <li>
            <strong>Be careful about rolling it into a new loan.</strong> Dealers often offer to add your old balance to
            a new loan. It makes the new car's loan even bigger, and you start upside down again.
          </li>
        </ul>
        <p style={last}>
          <strong>What is gap insurance?</strong> Gap insurance covers the difference between what you owe and what your
          car is worth if it's totaled or stolen. Without it, you'd still owe the leftover balance. It's worth considering
          if you made a small down payment (under 20%), chose a term of 60 months or longer, or rolled negative equity
          into the loan. You can often add it to your regular auto policy for a small yearly cost, which is usually
          cheaper than buying it from the dealer, where it's often a flat fee of several hundred dollars added to the
          loan. You can cancel it once you owe less than the car is worth.
        </p>
      </div>

      {/* Managing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Managing Your Auto Loan</h2>
        <h3 style={firstH3}>Where can you find your auto loan account number?</h3>
        <p style={pStyle}>
          Check your monthly statement, your online account or the lender's mobile app, or your welcome letter and
          original loan paperwork. If you can't find it, call the lender with your name, Social Security number, and
          vehicle information. Your car's title or registration lists the lender as the lienholder, which can help you
          figure out who to contact.
        </p>
        <h3 style={h3Style}>How can you make an auto loan payment?</h3>
        <p style={pStyle}>
          Most lenders accept payments online, through a mobile app, by phone, by mail, or in person at a branch. Autopay
          is the easiest way to avoid late payments, and some lenders give a small rate discount for it. Pay directly
          through the lender when possible, since third-party payment services may charge extra fees or take longer.
        </p>
        <h3 style={h3Style}>Can you change the due date of an auto loan?</h3>
        <p style={pStyle}>
          Often, yes. Many lenders let you move your due date so it lines up with your paycheck. Call or message your
          lender to ask. There may be a limit on how often you can do it, and a few lenders charge a small fee or add a
          few days of interest. Changing the due date doesn't change your loan term, rate, or balance.
        </p>
        <h3 style={h3Style}>What does delinquency mean?</h3>
        <p style={last}>
          An auto loan is delinquent when you miss a scheduled payment. Lenders usually add a late fee after a short
          grace period, and they typically report the missed payment to the credit bureaus once it's 30 days late, which
          can hurt your credit score. At 60 and 90 days, the damage grows, and the lender may start repossession
          proceedings. How quickly that happens depends on your contract and your state. If you think you'll miss a
          payment, call your lender before the due date. Many offer deferrals or modified payment plans.
        </p>
      </div>

      {/* Refinance */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Refinance or Switch an Auto Loan to Another Bank?</h2>
        <p style={pStyle}>
          Yes. Refinancing means taking out a new loan to pay off your current one. You can use it to move your loan to
          a different bank or credit union, get a lower rate, or change your term. Moving your loan to another lender is
          the same thing as refinancing.
        </p>
        <p style={pStyle}>It usually makes sense when:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Your credit score has improved since you took the loan</li>
          <li style={liStyle}>Market rates have dropped</li>
          <li style={liStyle}>You took dealer financing at a high rate and can now beat it</li>
          <li>You want a lower payment or a shorter term</li>
        </ul>
        <p style={pStyle}>
          Lenders typically have rules about the vehicle and the loan, such as age and mileage limits (for example, under
          10 years old and under 100,000 to 125,000 miles), a minimum loan balance, and a balance that isn't much higher
          than the car's value. Keep making your regular payments until the new loan closes. Also keep in mind that
          stretching out the term to lower the payment can increase your total interest, and some lenders charge title
          or application fees.
        </p>
        <p style={last}>
          <strong>Which companies are good for refinancing?</strong> Credit unions are often a good place to start
          because their rates tend to be lower. PenFed Credit Union, Navy Federal Credit Union (for military members and
          their families), and Capital One are well-known options, and many local credit unions refinance as well. Rates
          and eligibility change often, so get quotes from at least three lenders and compare the APR, any fees, and the
          new total cost with the calculator.
        </p>
      </div>

      {/* Cash or finance */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should You Pay Cash or Finance a Car?</h2>
        <p style={pStyle}>
          <strong>Is it worth taking a car loan if you can pay in full?</strong> It depends. Paying cash has real
          advantages:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>No interest.</strong> Financing $32,000 over five years at 6% means a payment of about $618.65 a
            month and roughly $5,119 in interest. A cash buyer keeps that money.
          </li>
          <li style={liStyle}>
            <strong>No monthly payment</strong> and no risk of late fees or repossession.
          </li>
          <li style={liStyle}>
            <strong>Full ownership from day one</strong>, with no lender rules about insurance, selling, or
            modifications.
          </li>
          <li style={liStyle}>
            <strong>No chance of going upside down.</strong>
          </li>
          <li style={liStyle}>
            <strong>A natural spending limit.</strong> Cash keeps you within your real budget, while financing makes it
            easy to stretch into a pricier car.
          </li>
          <li>
            <strong>Occasional cash discounts.</strong> Some rebates are only for buyers who aren't financing.
          </li>
        </ul>
        <p style={pStyle}>
          Financing can still make sense. If you can get a very low promotional rate, such as 0% to 2.9%, and your cash
          could earn more somewhere else, you may come out ahead by financing. It also keeps your savings available for
          emergencies, and making every payment on time helps build credit. If you do have the cash, a common compromise
          is a large down payment and a short term.
        </p>
        <p style={pStyle}>
          <strong>Are car loans worth it in general?</strong> For most people, a loan is the only practical way to buy a
          car, and it's worth it when you need reliable transportation, keep the term short, and borrow only what you can
          afford. It's not worth it if the loan pushes you into a longer term, a high rate, or a car that strains your
          budget.
        </p>
        <p style={last}>
          <strong>What is a fixed deposit auto loan?</strong> This is a type of secured loan that's common in countries
          like India. You use a fixed deposit (a bank savings deposit) as collateral, and the bank lends you a percentage
          of its value, often at a rate only a little above what the deposit earns. Your deposit keeps earning interest,
          but you can't withdraw it until you repay. In the U.S., the closest equivalent is a share-secured or
          CD-secured loan from a credit union or bank. These loans can offer low rates, and they're a useful way to build
          credit, but the lender can use your deposit to cover missed payments.
        </p>
      </div>

      {/* Lying about income */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Lie About Income on an Auto Loan Application?</h2>
        <p style={pStyle}>
          Don't. Giving false information about your income on a loan application is fraud, even if you plan to pay on
          time. Making false statements to a lender can lead to federal charges, and the penalties can include large
          fines and prison time. State charges are possible too.
        </p>
        <p style={pStyle}>
          If someone lied about their income but always paid on time and paid the loan off, they could still face
          consequences. Paying the loan doesn't erase the false statement. In practice, lenders and prosecutors focus on
          cases involving larger amounts, defaults, or patterns of fraud, and a small loan that was paid in full is less
          likely to be pursued. But there is no guarantee, and it's a risk that has no upside. The lender can also call
          the loan due immediately if it finds out. If this is something you did in the past, talk to a licensed
          attorney about your situation.
        </p>
        <p style={last}>
          If your income doesn't meet the lender's requirements, there are legal ways to improve your chances: add a
          cosigner, increase your down payment, choose a cheaper car, include other verifiable income such as a
          part-time job, or apply with a credit union that looks at your full financial picture.
        </p>
      </div>

      {/* Strategies */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Smart Auto Loan Strategies</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Prepare before you shop.</strong> Know your budget and a fair rate. Research typical prices for the
            car you want and get quotes from more than one lender. For free, plain-English guidance, the{" "}
            <Ext href="https://www.consumerfinance.gov/consumer-tools/auto-loans/">
              Consumer Financial Protection Bureau's auto loan resources
            </Ext>{" "}
            are a good place to start.
          </li>
          <li style={liStyle}>
            <strong>Work on your credit.</strong> Your credit largely decides whether you're approved and at what rate.
            Even a modest score increase can move you into a better rate tier.
          </li>
          <li style={liStyle}>
            <strong>Check for a tax deduction.</strong> Under federal law passed in 2025, interest on loans for certain
            new, U.S.-assembled personal vehicles may be deductible, up to $10,000 a year, for tax years 2025 through
            2028, with income limits. Confirm the current rules with the IRS or a tax professional.
          </li>
          <li style={liStyle}>
            <strong>Read the contract before you sign.</strong> Some lenders charge prepayment penalties or limit early
            payoff. If you plan to pay the loan off early, look for that in the contract.
          </li>
          <li>
            <strong>Consider alternatives.</strong> A car that's two or three years old has already absorbed the
            steepest depreciation, and it can cost far less than a new one. Leasing has a lower upfront cost and lower
            payments, but you build no equity and you have mileage limits.
          </li>
        </ul>
      </div>

      {/* Schedule */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Amortization Schedule and When to Use This Calculator</h2>
        <p style={pStyle}>
          Once you calculate your payment, the amortization schedule shows how each payment is split between principal
          and interest. For each payment, it lists the due date, the principal portion, the interest portion, and the
          remaining balance. Early in the loan, more of each payment goes toward interest. As the balance drops, more
          goes toward principal.
        </p>
        <p style={pStyle}>
          The schedule helps you see how much you'd save with extra payments, find your payoff balance if you want to
          sell or trade the car, and compare the true total cost (principal plus interest) across different loans.
        </p>
        <p style={pStyle}>The calculator is most useful when you're:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>Setting a price range before visiting a dealership</li>
          <li style={liStyle}>
            Comparing offers from a bank, credit union, and dealer, where even a one-point APR difference can change the
            total cost by hundreds or thousands of dollars
          </li>
          <li style={liStyle}>Choosing between a shorter and longer term</li>
          <li style={liStyle}>Seeing how a trade-in or rebate changes your loan and your tax bill</li>
          <li style={liStyle}>Working backward from a monthly payment to a price</li>
          <li>Checking whether refinancing would lower your payment</li>
        </ul>
      </div>

      {/* Free, private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Accurate</h2>
        <p style={last}>
          This calculator is free, with no signup, account, or usage limits. Run as many scenarios as you want. It works
          in your browser on desktop and mobile, and the numbers you enter aren't stored or sent to Tolz's servers. The
          math uses the same amortization formula banks use, so the estimates should closely match a real quote, though
          your final rate and terms depend on the lender's approval.
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
