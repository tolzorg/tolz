import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a debt payoff calculator?",
    a: "It's a tool that estimates how long it'll take to pay off your debts and how much interest you'll pay, based on your balances, interest rates, and monthly payments.",
  },
  {
    q: "How does the debt avalanche method work?",
    a: "You pay the minimum on every debt, then put all extra money toward the one with the highest interest rate. When it's gone, you move that payment to the next-highest rate. This approach costs the least in interest.",
  },
  {
    q: "Is debt avalanche better than debt snowball?",
    a: "Avalanche usually saves more money. Snowball pays off the smallest balance first and can feel more motivating. The best method is the one you'll stick with.",
  },
  {
    q: "Does this calculator use the snowball method?",
    a: "No, it uses the avalanche method only.",
  },
  {
    q: "Can I use it for credit cards, loans, and mortgages together?",
    a: "Yes. Add each debt with its balance, APR, and minimum payment, and the calculator combines them into one schedule.",
  },
  {
    q: "How do extra payments change my payoff date?",
    a: "Extra money reduces your principal, which lowers future interest. Even a small extra payment can move your debt-free date up by months.",
  },
  {
    q: "Can I add a one-time extra payment?",
    a: "Yes. You can add a one-time payment, a monthly extra, a yearly extra, or any mix of them.",
  },
  {
    q: "Should I pay off debt or build savings first?",
    a: "Many people build a small emergency fund first, then put extra money toward high-interest debt. The right balance depends on your income stability and expenses, so a financial professional can help you decide.",
  },
  {
    q: "Which debt should I pay off first?",
    a: "With the avalanche method, the one with the highest interest rate. The calculator shows the exact order for your debts.",
  },
  {
    q: "Is it a good idea to pay off a low-interest mortgage early?",
    a: "It depends. Paying off a mortgage guarantees a return equal to its rate, but investments or other goals might do better, and you'd also want to keep cash available. Check for prepayment penalties too.",
  },
  {
    q: "Is debt consolidation better than the avalanche method?",
    a: "Not always. Consolidation helps if you get a much lower rate with low fees. Compare total interest and fees with your avalanche results before deciding.",
  },
  {
    q: "What's the difference between debt settlement and bankruptcy?",
    a: "Settlement negotiates a lower payoff on specific debts and may create a tax bill. Bankruptcy is a court process that can discharge or restructure debts. Both hurt your credit, and bankruptcy stays on your report longer.",
  },
  {
    q: "Is this debt payoff calculator free, and do I need to sign up?",
    a: "It's free, and you don't need an account.",
  },
  {
    q: "How accurate is the payoff schedule?",
    a: "It's a reliable planning estimate. Actual results can differ a bit depending on how your lender calculates interest, fees, and payment timing.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
  color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 10, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };

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

export default function DebtPayoffCalculatorFaqSection() {
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
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Debt Payoff Calculator Does</h2>
        <p style={pStyle}>
          A debt payoff calculator estimates how long it'll take to clear one or more debts and what you'll pay in
          interest along the way. The useful part is that it looks at all your debts together. Each month it applies
          your payments, figures out the interest that piled up, and rolls the money from any paid-off account into
          the next one.
        </p>
        <p style={pStyle}>
          For every debt, you enter the current balance, the annual interest rate (APR), and the minimum monthly
          payment. The calculator pays the minimum on everything, puts all leftover money on the debt with the
          highest rate, and keeps repeating that until nothing's left.
        </p>
        <p style={pStyle}>Here's what you get back:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>The order your debts will be paid off</li>
          <li style={liStyle}>Your projected debt-free date</li>
          <li style={liStyle}>Total interest over the whole plan</li>
          <li style={liStyle}>A month-by-month breakdown of principal and interest</li>
          <li>How much you save compared to making minimum payments only</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Debt Payoff Calculator</h2>
        <p style={pStyle}>
          Grab your latest statements before you start. Accurate numbers in, accurate plan out.
        </p>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Add each debt.</strong> Give it a name (like "Chase card" or "Truck loan"), the current balance,
            the APR, and the minimum payment. Add as many as you've got: credit cards, auto loans, student loans,
            personal loans, a mortgage, whatever applies.
          </li>
          <li style={liStyle}>
            <strong>Add extra payments if you want them.</strong> You can set a fixed extra amount every month, a
            yearly extra (a tax refund or bonus, say), or a one-time payment (like money from selling a car). You can
            use any mix of the three.
          </li>
          <li style={liStyle}>
            <strong>Run the schedule.</strong> You'll see the payoff order, months to debt-free, and total interest.
          </li>
          <li>
            <strong>Tweak and compare.</strong> Change the extra amount and watch the debt-free date move. Even small
            changes can shave off months.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few input tips that save headaches. Use the APR on your statement, not the teaser rate you were quoted
          years ago. Enter today's balance, not the original loan amount. And make sure you type the annual rate.
          Plugging in a monthly rate by accident is one of the most common reasons results look off.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Debt Avalanche Method Works</h2>
        <p style={pStyle}>
          The idea is simple: interest is what debt actually costs you, so go after the most expensive debt first. You
          still pay the minimum on everything so nothing goes late. All the extra goes to the highest rate.
        </p>
        <p style={pStyle}>Let's use real numbers. Say you have:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>A credit card: $4,000 at 24% APR, $120 minimum</li>
          <li style={liStyle}>A personal loan: $9,000 at 9% APR, $250 minimum</li>
          <li>A car loan: $6,000 at 6% APR, $200 minimum</li>
        </ul>
        <p style={pStyle}>
          In month one, the card racks up about $80 in interest (4,000 × 0.24 ÷ 12). Your $120 minimum only knocks
          about $40 off the balance. The personal loan charges around $67.50 in interest, and the car loan about $30.
          So out of $570 in total minimum payments, roughly $177.50 goes to interest and the other $392.50 goes
          toward balances.
        </p>
        <p style={pStyle}>
          Now say you add $200 extra a month. Under the avalanche method, all $200 goes to the card, because each
          dollar there avoids 24% interest instead of 9% or 6%. Put another way: $1,000 thrown at that card saves you
          roughly $240 a year in interest, while the same $1,000 on the car loan saves about $60. Once the card is
          gone, the whole payment (minimum plus extra) moves to the personal loan, then the car loan. That rollover is
          where the "avalanche" name comes from. The payments get bigger as the debts disappear.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Over the full schedule, this order produces the lowest total interest of any payoff sequence, which is why
          it's called the cost-efficient method. One thing to know: this calculator uses the avalanche method only. It
          doesn't run the snowball approach.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Debt Avalanche vs. Debt Snowball</h2>
        <p style={pStyle}>
          The snowball method flips the logic. You pay off the smallest balance first, no matter what the interest
          rate is, then move to the next smallest.
        </p>
        <p style={pStyle}>
          Snowballs usually cost more in interest. What it gives you is quick wins. Knocking out a small account in a
          couple of months feels great, and for some people that feeling is what keeps them going. Avalanche is the
          better deal mathematically, but if your highest-rate debt is also your biggest, it can take a long time
          before you cross anything off the list.
        </p>
        <p style={pStyle}>
          So which one? If you're someone who stays motivated by numbers and savings, avalanche is a good fit. If
          you've tried to quit debt plans before and you need early momentum, snowball might be worth the extra
          interest. The difference also depends on your actual debts. If your smallest balance happens to have the
          highest rate, both methods give you the same order. If a big balance carries the highest rate, an avalanche
          can save a noticeable chunk of money.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Run your numbers through the calculator to see the cost-optimized path. If the savings look small,
          snowball's psychological boost may be worth it. If they're big, you'll probably want to stick with an
          avalanche.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Adding Extra Monthly, Yearly, and One-Time Payments</h2>
        <p style={pStyle}>
          Minimum payments are set up to keep you paying for a long time. On credit cards especially, the minimum is
          often just slightly more than the monthly interest, so the balance barely moves. Extra payments are what
          change that. Any extra goes straight to principal, which lowers the interest you're charged next month,
          which lets more of your next payment hit principal too. It builds on itself.
        </p>
        <p style={pStyle}>The calculator handles three types:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Extra monthly payments</strong> are the most dependable. Even $50 a month on your highest-rate
            debt makes a real difference over a few years.
          </li>
          <li style={liStyle}>
            <strong>Extra yearly payments</strong> are great for irregular money. Got a tax refund, annual bonus, or
            seasonal income? Schedule it once a year without messing with your monthly budget.
          </li>
          <li>
            <strong>One-time payments</strong> cover windfalls like a gift, a work bonus, or a car sale. The earlier
            you make one, the more it saves, since it wipes out principal before it can rack up more interest.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can combine all three. A realistic plan might be $75 a month, your tax refund each spring, and one lump
          sum from selling something you don't use. The calculator rebuilds the whole schedule so you can see the
          combined effect.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should You Pay Off Debt Early? Things to Check First</h2>
        <p style={pStyle}>
          Most people love the idea of being debt-free, but paying early isn't automatically the right call for every
          debt. A few things to check first.
        </p>
        <p style={pStyle}>
          <strong>Early payoff penalties.</strong> Some loans, especially certain personal loans and some mortgages,
          charge a fee if you pay off the balance ahead of schedule. Check your loan agreement or ask the lender. A
          penalty can eat up some or all of what you'd save.
        </p>
        <p style={pStyle}>
          <strong>Your emergency fund.</strong> If every spare dollar goes to debt and then your car dies or you have
          a medical bill, you may end up putting that expense right back on a credit card. Many people keep a starter
          cushion before going all-in on payoff. How big depends on your income stability and household, so there's
          no single right number.
        </p>
        <p style={pStyle}>
          <strong>The interest rate itself.</strong> A common rule of thumb: attack high-rate debt (credit cards,
          store cards, most personal loans) aggressively. For low-rate debt, like a mortgage at 3% or 4%, it's worth
          thinking about alternatives. Investments can earn more over long stretches, though returns aren't
          guaranteed and markets go down too. Paying off a debt is a sure return equal to its interest rate. An
          investment is a gamble that may or may not beat it.
        </p>
        <p style={pStyle}>
          <strong>Employer retirement match.</strong> If your job matches 401(k) contributions, that's effectively an
          instant return. Many people grab the full match before sending extra to moderate-rate debt.
        </p>
        <p style={pStyle}>
          <strong>Credit score effects.</strong> Paying down credit card balances usually helps your score because it
          lowers your credit utilization. Closing the card afterward, though, can hurt by shrinking your available
          credit. Paying off an installment loan completely can sometimes cause a small, temporary dip. Don't let that
          stop you from getting out of debt, but it's good to know.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If a debt has a high rate and no penalty, paying it early is usually a smart move. For low-rate debts, it
          comes down to your goals and your comfort with risk.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Needs a Multiple Debt Payoff Calculator? Real Scenarios</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>You've got several credit cards at different rates.</strong> A 28% store card, a 21% rewards card,
            and a 15% balance transfer each deserve different priority. The calculator ranks them for you.
          </li>
          <li style={liStyle}>
            <strong>You're deciding between extra mortgage payments and other debts.</strong> Running both sides shows
            whether that extra $300 saves more against a 7% car loan than against a 4% mortgage. It usually does.
          </li>
          <li style={liStyle}>
            <strong>You just got a windfall.</strong> Before deciding what to do with it, enter it as a one-time
            payment and see how many months and dollars it saves. Then compare that with other options, like building
            up savings.
          </li>
          <li style={liStyle}>
            <strong>You've got a target date.</strong> Maybe you're buying a house in three years or you're planning
            to retire soon. Raise the extra payment until the debt-free date lines up, then ask yourself if that
            monthly number is realistic.
          </li>
          <li style={liStyle}>
            <strong>You're considering consolidation or a balance transfer.</strong> Run your current debts first to
            get a baseline. Then compare it to the offer. If the new loan or card has fees, include them in your math.
          </li>
          <li>
            <strong>You're curious how bad minimum payments really are.</strong> Run the schedule with zero extra and
            look at total interest. For many people, that number is the wake-up call.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Read Your Results</h2>
        <p style={pStyle}>
          <strong>Payoff order</strong> shows which debt goes first, second, and so on. With avalanche, it's sorted
          from highest rate to lowest.
        </p>
        <p style={pStyle}>
          <strong>Debt-free date</strong> is when your final balance hits zero. It assumes you keep making the
          payments you entered, so treat it as a projection, not a guarantee.
        </p>
        <p style={pStyle}>
          <strong>Total interest</strong> is what the debt costs you overall. Compare it to the minimum-only run to
          see your savings.
        </p>
        <p style={pStyle}>
          <strong>Monthly breakdown</strong> splits each payment into principal and interest. Early on, high-rate
          debts show a lot of interest. As balances drop, more of each payment goes to principal.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the results look way off from what you expected, check the inputs. Wrong balances, a monthly rate typed
          as an annual one, or a minimum payment that doesn't match your statement account for most surprises.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Pay Off Debt Faster</h2>
        <p style={pStyle}>A calculator shows you the plan. Here's how to actually follow through.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Build a budget and find the money.</strong> Go through your last two or three months of spending.
            Subscriptions you forgot about, delivery fees, and bank fees add up. Even $100 found is $100 you can put
            toward principal.
          </li>
          <li style={liStyle}>
            <strong>Sell stuff you don't use.</strong> Furniture, electronics, and gear sitting in a closet can become
            one-time payments.
          </li>
          <li style={liStyle}>
            <strong>Keep your payment the same as debts disappear.</strong> When a debt is gone, don't let that money
            slip back into spending. Roll it into the next one. This is where the avalanche picks up speed.
          </li>
          <li style={liStyle}>
            <strong>Ask for a lower APR.</strong> Call your card issuer and ask. It doesn't always work, but if you've
            got a good payment history, it sometimes does. A drop of even a few points can save real money.
          </li>
          <li style={liStyle}>
            <strong>Check balance transfer offers carefully.</strong> A 0% intro APR can save a lot, but transfer fees
            are commonly around 3% to 5%, and the promo rate expires. If you can't pay it off before then, the
            leftover balance jumps to a regular rate. Watch out for "deferred interest" deals too, which can charge
            back interest if you don't pay in full.
          </li>
          <li style={liStyle}>
            <strong>Use biweekly or extra payments when your lender allows it.</strong> Making half your payment every
            two weeks results in 26 half-payments a year, which equals 13 full ones instead of 12. Make sure the extra
            goes to principal, not just credited toward next month.
          </li>
          <li style={liStyle}>
            <strong>Don't add new debt.</strong> The projection assumes your balances only go down. New charges change
            everything.
          </li>
          <li>
            <strong>Re-run the calculator every few months.</strong> Life changes. Updated balances keep your target
            date realistic.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What About Debt Consolidation?</h2>
        <p style={pStyle}>
          Debt consolidation means taking out one new loan (a personal loan, home equity loan, or balance transfer
          card) and using it to pay off several smaller debts. You end up with a single monthly payment, ideally at a
          lower rate.
        </p>
        <p style={pStyle}>
          It works best when you're stuck with high-interest balances like credit cards and you can qualify for a
          meaningfully lower rate. A single payment is also easier to manage than a stack of due dates.
        </p>
        <p style={pStyle}>
          There are catches. Origination fees or transfer fees can cancel out the savings. A longer loan term can
          lower your monthly payment but increase total interest. And a home equity loan puts your house on the line.
          Also, consolidating doesn't fix whatever caused the debt. If the cards fill back up, you'll be in a worse
          spot.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The way to compare: run your current debts through the calculator, note the total interest and the months
          to payoff, then compare that to the consolidation loan's rate, fees, and term. If the consolidation option
          doesn't beat your avalanche plan on total cost, it may not be worth it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When a Payoff Plan Isn't Enough</h2>
        <p style={pStyle}>
          Sometimes extra payments aren't realistic. A job loss, serious illness, or a mountain of debt can make
          payoff plans feel impossible. In the U.S., there are options for these situations, but each one has
          trade-offs. It's smart to talk to a nonprofit credit counselor or a financial professional before committing
          to any of them.
        </p>

        <h3 style={h3Style}>Debt Management Plans</h3>
        <p style={pStyle}>
          A debt management plan (DMP) goes through a credit counseling agency. A counselor reviews your finances and
          may negotiate with your creditors for lower interest rates or smaller payments. If they set up a plan, you
          send one monthly payment to the agency, and the agency distributes it to your creditors. There's usually a
          setup fee and a monthly fee, and you're typically asked to stop using credit cards and may have to close
          them.
        </p>
        <p style={pStyle}>
          Look for a nonprofit agency. The U.S. Trustee Program, part of the Department of Justice, keeps lists of
          approved credit counseling agencies. A DMP can stop the collection calls and give you a clear end date, but
          it may hurt your score at first. It's still usually much less damaging than settlement or bankruptcy.
        </p>

        <h3 style={h3Style}>Debt Settlement</h3>
        <p style={pStyle}>
          With debt settlement, you or a company on your behalf negotiates to pay less than what you owe. Settlement
          companies often tell you to stop paying creditors while you save up money, which can lead to late fees,
          collections, and lawsuits. Companies typically charge a percentage of the debt, and under federal rules,
          companies selling debt relief services over the phone can't charge fees before they actually settle a debt.
        </p>
        <p style={pStyle}>
          Settled debt shows up on your credit report as not paid in full, which hurts your score. The IRS may also
          treat forgiven debt (generally $600 or more) as taxable income, and you might get a 1099-C form for it.
          There's an exception if you're insolvent, but that takes paperwork. Some people do better settling directly
          with the creditor rather than through a company.
        </p>

        <h3 style={h3Style}>Bankruptcy</h3>
        <p style={pStyle}>
          Bankruptcy is a legal process for people who can't repay their debts. For individuals, the two common types
          are Chapter 7 and Chapter 13.
        </p>
        <p style={pStyle}>
          <strong>Chapter 7</strong> discharges (erases) many unsecured debts, like credit cards and medical bills.
          You may have to give up certain assets, though many people keep most of what they own because of
          exemptions. It's available based on income (there's a means test), and the process usually takes several
          months. Some debts generally aren't wiped out: child support, alimony, most tax debts, and student loans
          (unless you can prove undue hardship, which is hard).
        </p>
        <p style={pStyle}>
          <strong>Chapter 13</strong> puts you on a court-approved repayment plan for three to five years. Whatever's
          left on eligible debts after you finish can be discharged. You generally keep your property, and it can
          help people catch up on missed mortgage or car payments.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Bankruptcy stays on your credit report for up to 10 years (Chapter 7) or about seven years (Chapter 13).
          That makes it harder to get loans, credit cards, apartments, and sometimes jobs. It's a real fresh start for
          some, but it's a serious step and worth discussing with a bankruptcy attorney or a nonprofit counselor
          first.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Debt Payoff Calculator Free, Private, and Accurate?</h2>
        <p style={pStyle}>
          The Tolz debt payoff calculator is free to use, and you don't need to create an account. All it needs are
          numbers: balances, rates, and payments. You never need to enter card numbers, account numbers, or
          passwords. Nicknames like "Card 1" work fine.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, the math follows standard monthly interest calculations, which is solid for planning. It's
          still an estimate. Real lenders may calculate interest daily, post payments on specific dates, charge fees,
          or change variable rates. For the exact amount you owe on a single debt, ask your lender for a payoff
          statement. And this tool is for planning, not a replacement for advice from a financial professional.
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
