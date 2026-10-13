import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a repayment calculator?",
    a: "It estimates how much you need to pay each period to clear a loan, or how long it'll take at a payment you choose. It uses your loan amount, interest rate, and payment schedule.",
  },
  {
    q: "How do I calculate loan repayment?",
    a: "Convert your annual rate to a rate per payment period, then use Payment = P × r / (1 − (1 + r)^−n), where P is the principal, r is the periodic rate, and n is the number of payments. The calculator handles all of that for you.",
  },
  {
    q: "How do I find out how long it'll take to pay off my loan?",
    a: "Enter your balance, interest rate, and the payment you plan to make, then choose the payoff-time option. You'll get the number of payments and the time in years and months.",
  },
  {
    q: "Why am I getting an error instead of a payoff time?",
    a: "Your payment likely doesn't cover the interest charged each period, so the balance never goes down. Raise the payment or check that the interest rate is entered correctly.",
  },
  {
    q: "Does paying biweekly save money?",
    a: "Usually, yes. Paying half your monthly amount every two weeks adds up to 13 full payments a year instead of 12, and the extra goes toward principal. Some lenders hold the payments until they have a full month's worth, which reduces the benefit, so ask first.",
  },
  {
    q: "What's the difference between compounding frequency and payment frequency?",
    a: "Compounding frequency is how often interest is added to your balance. Payment frequency is how often you make payments. They can be different, and this calculator treats them separately.",
  },
  {
    q: "Can I use it for a credit card?",
    a: "Yes. Choose the fixed-payment option, enter the amount you'll pay each month, and set compounding to daily if your card works that way. It assumes you stop adding new charges.",
  },
  {
    q: "Does it work for mortgages, car loans, and student loans?",
    a: "It works for any fixed-rate loan with level payments. For a mortgage, the result covers principal and interest only, not taxes, insurance, or PMI. It doesn't model variable rates.",
  },
  {
    q: "Is it better to pay off a loan early?",
    a: "It depends on the interest rate and your financial cushion. High-rate debt is usually worth paying off fast. With a low-rate loan, an emergency fund or other investments may be the better use of extra cash.",
  },
  {
    q: "Does extra payment reduce my loan term?",
    a: "Yes, if the extra goes toward principal. Use the payoff-time mode with a higher payment to see how much sooner you'd finish and how much interest you'd save.",
  },
  {
    q: "Is the repayment calculator free?",
    a: "Yes, there's no charge, and you can try as many scenarios as you like.",
  },
  {
    q: "Why doesn't the result match my lender's number exactly?",
    a: "Small differences usually come from rounding, fees, how the first period is counted, or variable rates. If the gap is large, double-check your rate and frequency settings.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

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

export default function RepaymentCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Repayment Calculator Does</h2>
        <p style={pStyle}>
          It works for pretty much any debt that gets paid down over time: mortgages, auto loans, personal loans,
          student loans, and credit card balances. You can use it on a loan you haven't taken yet (to see if the deal
          makes sense) or on one you've been paying on for years (to see where you stand and what a change would do).
        </p>
        <p style={pStyle}>There are two ways to run it, and they answer two different questions.</p>
        <p style={pStyle}>
          <strong>Fixed loan term.</strong> You pick how long you want to take, and the calculator tells you the
          payment needed to finish on time. This is the right mode when the term is set by a lender or by your own
          goal, like a 60-month car loan or deciding between a 15-year and 30-year mortgage.
        </p>
        <p style={pStyle}>
          <strong>Fixed payment.</strong> You pick how much you can pay each period, and the calculator tells you how
          long it'll take to reach zero. This is the one to use when your budget is the constraint. Say you've got
          $300 a month of breathing room and a credit card balance you want gone. Plug in $300 and see what happens.
        </p>
        <p style={pStyle}>
          You'll get the payment or payoff time, plus the total you'll repay and how much of that is interest. That
          last number is the one people tend to find eye-opening.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more thing that makes this tool a little different: it lets you set compounding frequency and payment
          frequency separately. Most calculators quietly assume they're the same thing. On a lot of real loans, they
          aren't. More on that in a minute.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Repayment Calculator</h2>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Enter the loan amount.</strong> That's the amount you're borrowing, or the balance you still owe
            if the loan already exists.
          </li>
          <li style={liStyle}>
            <strong>Enter the annual interest rate.</strong> Use the rate on your loan agreement. (There's a note on
            APR vs. interest rate further down, since it trips people up.)
          </li>
          <li style={liStyle}>
            <strong>Choose the compounding frequency.</strong> This is how often the lender adds interest to your
            balance. Monthly is the usual default for mortgages, auto loans, and personal loans. Credit cards often
            compound daily. Your loan paperwork should say.
          </li>
          <li style={liStyle}>
            <strong>Choose the payment frequency.</strong> Monthly is the most common in the U.S., but weekly,
            biweekly, and quarterly are all options.
          </li>
          <li>
            <strong>Pick what to solve for.</strong> Either the payment (and enter your term) or the payoff time (and
            enter your payment).
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Change one input at a time and watch what happens. Testing a few versions of the same loan takes about a
          minute, and you'll learn more from comparing them than from any single result.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solving for the Payment When You Know the Term</h2>
        <p style={pStyle}>
          Say a dealer offers you 48, 60, or 72 months on a car. The calculator shows you the payment for each, and the
          pattern is always the same: longer term, lower payment, more total interest.
        </p>
        <p style={pStyle}>
          A bigger example is the classic mortgage question. Take a $300,000 loan at 6.5%. On a 30-year term, the
          payment comes out around $1,896 a month, and you'd pay roughly $383,000 in interest over the life of the
          loan. On a 15-year term, the payment jumps to about $2,613 a month, but total interest drops to roughly
          $170,000. That's a difference of over $200,000 for a payment that's about $700 higher. Whether that trade
          makes sense depends on your budget and what else you could do with that $700, but at least you're deciding
          with real numbers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing worth knowing about how these loans work: with a level payment, the early payments are mostly
          interest and the later ones are mostly principal. That's what amortization means. It's why paying down
          principal early has such an outsized effect, and why you can make payments for years on a mortgage and feel
          like the balance barely moved.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solving for Payoff Time When You Know the Payment</h2>
        <p style={pStyle}>
          This mode is how most people get to the "oh, wow" moment, especially with credit cards.
        </p>
        <p style={pStyle}>
          Let's say you owe $5,000 at 22% interest and pay $150 a month. The calculator shows it'll take about 52
          months, over four years, and you'll pay around $2,800 in interest. Bump the payment to $250 and it drops to
          about 25 months, with roughly $1,280 in interest. An extra $100 a month cuts the timeline in half and saves
          you more than $1,500. Small changes in the payment matter a lot when the rate is high.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's also a floor you need to clear. If your payment doesn't cover the interest charged each period, the
          balance never goes down, and there's no payoff date to find. The calculator will flag that instead of
          spitting out a nonsense number. If you see the warning, either bump up the payment or double-check that you
          entered the rate correctly (a 2.5% vs. 25% typo happens more than you'd think).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compounding Frequency vs. Payment Frequency</h2>
        <p style={pStyle}>These two get mixed up all the time, so here's the short version.</p>
        <p style={pStyle}>
          <strong>Compounding frequency</strong> is how often interest gets added to what you owe.{" "}
          <strong>Payment frequency</strong> is how often you actually pay. They're independent. A loan can compound
          daily while you pay monthly, or compound monthly while you pay every two weeks.
        </p>
        <p style={pStyle}>
          Why it matters: the more often interest compounds, the more total interest you pay at the same stated rate,
          because interest starts earning interest sooner. Daily compounding costs a bit more than annual compounding
          at the same percentage. And the more often you pay, the less time interest has to build up between
          payments.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The part most tools skip is the conversion. If a loan is 8% compounded monthly and you pay biweekly, the
          interest per payment period isn't just 8% divided by 26. This calculator converts the compounding schedule
          into the right rate for your payment schedule, so the interest figure matches what actually accrues between
          your payments. On a small loan, you might see a difference of a few dollars. On a big, long loan, it can add
          up to hundreds.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Different Types of Loans Get Repaid</h2>
        <p style={pStyle}>
          The math is the same everywhere, but the rules around each type of loan aren't. Here's what to keep in mind.
        </p>
        <p style={pStyle}>
          <strong>Mortgages.</strong> In the U.S., mortgage payments are monthly. With a fixed-rate mortgage, the
          principal-and-interest payment stays the same for the whole term. Adjustable-rate mortgages can change over
          time, and this calculator doesn't model those. It also covers only principal and interest, so your real
          monthly bill will be higher once you add property taxes, homeowners insurance, and (if you put down less
          than 20%) private mortgage insurance. Most lenders let you pay more than the required amount, but never
          less.
        </p>
        <p style={pStyle}>
          <strong>Auto loans.</strong> Also monthly, usually at a fixed rate. Because the car is collateral, the loan
          is secured, and rates tend to run lower than for unsecured personal loans. You can generally pay extra, but
          check your contract for prepayment penalties first. Be careful with long terms: a 72- or 84-month loan makes
          the payment look friendly, but you can end up owing more than the car is worth for years.
        </p>
        <p style={pStyle}>
          <strong>Personal loans.</strong> These are usually fixed-rate, fixed-term installment loans, so they're a
          clean fit for the fixed-term mode. Some lenders charge an origination fee, which comes out of your loan
          proceeds. That fee isn't in the calculator, so keep it in mind when comparing offers.
        </p>
        <p style={pStyle}>
          <strong>Student loans.</strong> Federal student loans work differently from private loans. They typically
          come with a grace period after you leave school (six months is the standard for many federal loans), and you
          can usually choose from several repayment plans, including income-driven options and extended plans that
          stretch payments out as far as 25 years. A longer plan means a smaller payment but significantly more
          interest overall. Federal repayment rules and plan options have been changing, so check studentaid.gov for
          what's currently available. Private student loans don't follow any standard rulebook, so their grace
          periods, deferment options, and repayment terms vary by lender. Read the terms before you sign. For a
          standard fixed-term plan, this calculator gives you a good estimate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Credit cards.</strong> These are revolving credit, which is a different animal. There's no set term
          and no fixed payment, just a minimum due each month. That minimum is typically a small percentage of your
          balance (plus interest and fees), and it shrinks as the balance shrinks, which is exactly why minimum
          payments can keep you in debt for decades. To use this calculator for a credit card, choose the
          fixed-payment mode and enter the amount you're actually going to pay each month, not the minimum. Set
          compounding to daily if that's how your card works. It'll show you how long it takes if you stick to that
          number and don't add new charges.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Pay Off a Loan Faster</h2>
        <p style={pStyle}>
          Almost everyone likes the idea of being debt-free. Here are the ways to actually get there sooner, and how
          to check each one with this tool.
        </p>
        <p style={pStyle}>
          <strong>Pay extra.</strong> If your loan has no prepayment penalty, every extra dollar goes straight to the
          principal. That reduces the balance interest is charged on, so you finish earlier and pay less interest. Even
          small, regular extras help. To test it, run the payoff-time mode with your regular payment, then again with
          a bit more, and compare. When you make an extra payment, tell your lender to apply it to the principal. Some
          will otherwise treat it as an early payment on the next installment, which doesn't save you much.
        </p>
        <p style={pStyle}>
          <strong>Switch to biweekly payments.</strong> Paying half your monthly payment every two weeks gives you 26
          half-payments a year, which equals 13 full monthly payments instead of 12. That one extra payment a year goes
          straight at the principal, and the more frequent payments trim interest slightly too. On a 30-year mortgage,
          this often takes off several years, depending on the rate. To model it here, set the payment frequency to
          biweekly, choose the payoff-time mode, and enter half your monthly payment. Two cautions: first, some
          lenders hold biweekly payments until they have enough for a full monthly payment, which cuts into the
          benefit. Second, a few charge fees for setting up a biweekly plan. You can get the same result for free by
          adding one-twelfth of your payment to each monthly payment.
        </p>
        <p style={pStyle}>
          <strong>Refinance.</strong> Replacing your current loan with a new one at a lower rate or shorter term can
          save a lot of money. But refinancing usually comes with closing costs or fees, sometimes thousands of dollars
          on a mortgage. The way to evaluate it is the break-even point: divide the total fees by your monthly
          savings. If the fees are $4,000 and you'll save $150 a month, you need to stay in the loan about 27 months
          before you come out ahead. If you might move or sell before then, it's not worth it. Run both your current
          loan and the new offer through the calculator to compare total interest side by side.
        </p>
        <p style={pStyle}>
          <strong>Consolidate high-interest debt.</strong> If you've got several balances, especially credit cards,
          rolling them into one loan at a lower rate can cut your interest and simplify things. It only works if the
          new rate is actually lower (check the APR, including any fees) and you don't run the cards back up
          afterward.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Pick a payoff order.</strong> If you have multiple debts, there are two popular approaches. The
          avalanche method puts extra money toward the highest-rate balance first, which saves the most interest. The
          snowball method goes after the smallest balance first, which gives you quick wins and helps some people stay
          motivated. The math favors the avalanche, but the best method is the one you'll stick with. You can run each
          debt through this tool to see how long it'd take.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Paying Off a Loan Early Always a Good Idea?</h2>
        <p style={pStyle}>Not always. Paying extra is great, but it isn't mandatory, and there are real trade-offs.</p>
        <p style={pStyle}>
          First, think about your emergency fund. If you throw every spare dollar at a car loan and then get hit with a
          medical bill or a transmission repair, you may end up putting it on a credit card at a much higher rate.
          Having a few months of expenses in savings usually comes first.
        </p>
        <p style={pStyle}>
          Second, think about the rate. If you've got a loan at 3% or 4%, the guaranteed return from paying it off
          early is also 3% or 4%. Money in a high-yield savings account, a retirement account with an employer match,
          or even long-term investments may earn more than that. On the flip side, paying off a 22% credit card is
          almost always a better move than nearly anything else you could do with the money.
        </p>
        <p style={pStyle}>
          Third, check for prepayment penalties. They're less common than they used to be, but some loans still charge
          you for paying early.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A decent rule of thumb: high-interest debt first, then build the cushion, then decide on lower-rate debt
          based on how much the interest bugs you versus what else the money could do.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Loan Terms Worth Knowing</h2>
        <p style={pStyle}>You'll run into these words in almost any loan document.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Principal:</strong> the amount you borrowed, or the amount you still owe.
          </li>
          <li style={liStyle}>
            <strong>Amortized loan:</strong> a loan where each payment covers both interest and some principal, so the
            balance reaches zero by the end of the term. Most mortgages, auto loans, and personal loans work this way.
          </li>
          <li style={liStyle}>
            <strong>APR (annual percentage rate):</strong> the yearly cost of the loan, including certain fees. It's
            meant for comparing offers. Since it can include fees, it isn't the same as the interest rate used to
            calculate payments.
          </li>
          <li style={liStyle}>
            <strong>Interest-only period:</strong> a stretch at the start of some loans where you only pay the
            interest. Payments are lower during that time, but the balance doesn't go down, and payments jump when the
            period ends.
          </li>
          <li style={liStyle}>
            <strong>Debt consolidation:</strong> combining several debts into one new loan, ideally at a lower rate.
          </li>
          <li style={liStyle}>
            <strong>Refinancing:</strong> replacing an existing loan with a new one, usually to get a lower rate or
            change the term.
          </li>
          <li style={liStyle}>
            <strong>Debt-to-income ratio (DTI):</strong> your total monthly debt payments divided by your gross
            monthly income. Lenders use it to judge whether you can handle another payment.
          </li>
          <li>
            <strong>Prepayment penalty:</strong> a fee some lenders charge if you pay off the loan early or pay down a
            big chunk.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Do After You Run the Numbers</h2>
        <p style={pStyle}>
          Once you've got a payment, check how it fits your actual monthly budget. Not what you hope to spend, what you
          really spend. If it's tight, you've got a few moves: a longer term (lower payment, more interest), a smaller
          loan, a bigger down payment, or a different lender.
        </p>
        <p style={pStyle}>
          It's also worth checking your credit score before you apply. Your score affects both the rate you're offered
          and which lenders will approve you. If your score is on the lower side, some lenders specialize in borrowers
          with fair or poor credit, but their rates are usually higher, so compare carefully.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you apply, most lenders ask for similar paperwork: your Social Security number, contact info, proof of
          identity (a driver's license or passport), proof of address (like a utility bill), proof of income (pay
          stubs, W-2s, 1099s, or tax returns), and a list of your current debts and assets. Having those ready makes
          the process a lot smoother.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Math Behind the Results</h2>
        <p style={pStyle}>
          You don't need to know any of this to use the tool, but it explains why the numbers move the way they do.
        </p>
        <p style={pStyle}>
          First, the calculator converts your annual rate into a rate that matches your payment schedule:
        </p>
        <div style={formulaStyle}>r = (1 + i / m)^(m / p) − 1</div>
        <p style={pStyle}>
          Here, i is the annual rate, m is how many times per year interest compounds, and p is how many payments you
          make per year.
        </p>
        <p style={pStyle}>For a fixed term with n total payments, the payment is:</p>
        <div style={formulaStyle}>Payment = P × r / (1 − (1 + r)^−n)</div>
        <p style={pStyle}>For a fixed payment, the formula gets rearranged to solve for the number of payments:</p>
        <div style={formulaStyle}>n = −ln(1 − P × r / Payment) / ln(1 + r)</div>
        <p style={pStyle}>
          P is the principal. This also shows why a payment at or below P × r can't pay off a loan: the logarithm
          breaks down because there's nothing left to reduce the balance. Multiply your payment by n to get the total
          repaid, then subtract the principal to get total interest.
        </p>
        <p style={pStyle}>
          <strong>Example 1: Finding the payment.</strong> You borrow $20,000 at 7%, compounded monthly, and want it
          paid off in 5 years with monthly payments. The payment is about $396.02. Over 60 payments, you'd repay
          roughly $23,761, about $3,761 of it interest.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Example 2: Finding the payoff time.</strong> You owe $15,000 at 9%, compounded monthly, and pay $400
          a month. It takes about 44 months (just under 3 years and 8 months), with around $2,680 in interest. Raise
          the payment to $450 and it drops to roughly 38 to 39 months, with about $2,300 in interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting More Accurate Results</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Use the interest rate, not the APR,</strong> unless that's all your lender gives you. APR can
            include fees, so using it as the rate may overstate your cost.
          </li>
          <li style={liStyle}>
            <strong>Match your frequencies to your loan agreement.</strong> If you're not sure how interest compounds,
            ask your lender.
          </li>
          <li style={liStyle}>
            <strong>Know what's left out.</strong> Origination fees, insurance, taxes, late charges, and rate changes
            on variable-rate loans aren't part of this calculation.
          </li>
          <li style={liStyle}>
            <strong>Expect small differences from your statement.</strong> Lenders round payments to the cent, the
            first period might be a different length, and the final payment is often a little different.
          </li>
          <li>
            <strong>Re-run it when things change.</strong> If you make a lump-sum payment or your rate resets, enter
            your current balance and the new rate.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free and Private</h2>
        <p style={pStyle}>
          The repayment calculator is free to use, with no hidden fees, and you can run as many scenarios as you want.
        </p>
        <p style={pStyle}>
          The numbers you enter are just loan figures. You don't need to give your name, Social Security number, or
          account details to get a result.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The results come from standard time-value-of-money formulas, the same kind lenders and finance textbooks
          use. They're estimates for planning, so your lender's official figures are what count. This tool isn't
          financial advice, and for big decisions like a mortgage or refinance, it's worth talking with a licensed
          professional.
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
