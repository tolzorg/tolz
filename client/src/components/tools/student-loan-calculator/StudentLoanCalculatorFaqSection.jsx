import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my monthly student loan payment?",
    a: "Use payment = balance × r ÷ (1 − (1 + r)^−n), where r is the monthly rate (APR ÷ 12) and n is the number of payments. Or enter your balance, rate and term in the calculator and it does the math for you.",
  },
  {
    q: "How much can I take out in student loans?",
    a: "It depends on the loan type and your status. Dependent undergraduates can borrow up to $31,000 in federal loans over their lifetime, independent undergraduates up to $57,500, graduate students $100,000, and professional students $200,000. Private loans typically go up to your school's cost of attendance. Borrow only what you need.",
  },
  {
    q: "What are the federal student loan interest rates for 2026-27?",
    a: "For loans first paid out between July 1, 2026 and June 30, 2027, undergraduate loans are 6.52%, graduate unsubsidized loans are 8.07%, and PLUS loans are 9.07%. These rates stay fixed for the life of each loan.",
  },
  {
    q: "What's a good student loan interest rate?",
    a: "Lower is better, and for private loans a good rate sits toward the bottom of a lender's range. Compare any private offer to the federal rate, since federal loans come with protections private loans don't.",
  },
  {
    q: "How much interest will I pay on my student loan?",
    a: "It depends on balance, rate and term. A $30,000 loan at 6% over ten years costs about $9,970 in interest. Enter your own figures to see your total.",
  },
  {
    q: "Does paying extra reduce student loan interest?",
    a: "Yes. Extra money applied to principal lowers the balance that interest is charged on, which shortens the term and cuts total interest. Ask your servicer to apply extra payments to principal.",
  },
  {
    q: "Does interest accrue while I'm in school?",
    a: "On unsubsidized federal loans and most private loans, yes. On subsidized federal loans, eligible undergraduates generally don't accrue interest while enrolled at least half-time or during the grace period.",
  },
  {
    q: "What's the difference between subsidized and unsubsidized loans?",
    a: "With subsidized loans, the government covers your interest during school and the grace period. With unsubsidized loans, interest starts building right away. Subsidized loans are for undergraduates with financial need.",
  },
  {
    q: "Are federal or private student loans better?",
    a: "Federal loans usually come first, because they offer fixed rates, no credit check for most borrowers, income-based repayment options and forgiveness programs. Private loans make sense when federal aid doesn't cover your costs.",
  },
  {
    q: "Is there a penalty for paying off student loans early?",
    a: "No. Federal and private student loans in the U.S. don't charge prepayment penalties, so you can pay extra anytime.",
  },
  {
    q: "Can I use the calculator for private loans or multiple loans?",
    a: "Yes. It works for any fixed-rate loan. For several loans, calculate each separately and add the payments together.",
  },
  {
    q: "Is the student loan calculator free, and do I need to sign up?",
    a: "It's free, and you don't need to sign up to use it.",
  },
  {
    q: "Will the result match my servicer's number?",
    a: "It should be close. Daily interest, payment dates and rounding can cause small differences, so rely on your servicer's statement for exact payoff amounts.",
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

export default function StudentLoanCalculatorFaqSection() {
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
        <h2 style={h2Style}>What the Student Loan Calculator Does</h2>
        <p style={pStyle}>
          Every loan comes down to four numbers: balance, interest rate, term, and monthly payment. If you know three,
          the fourth is just math. This student loan calculator lets you choose which one to solve for, so you can use
          it a few different ways:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Check what a loan will cost per month before you sign.</li>
          <li style={liStyle}>Find out how long payoff takes at a payment you can afford.</li>
          <li style={liStyle}>Work out the rate hiding inside an offer that only shows a payment.</li>
          <li>Figure out how much you can borrow at a payment that fits your budget.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also handles extra payments, so you can see how much sooner you'd finish and how much interest you'd
          skip. And it projects your balance after school. So it works as a payment calculator, a payoff calculator,
          and an interest calculator without bouncing between pages.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Student Loan Calculator</h2>
        <p style={pStyle}>
          Grab three things first, either from your servicer's dashboard or the loan paperwork. For the balance, use
          today's principal if you're already paying, not the amount you originally borrowed. For the rate, use the
          APR. For the term, use what's left, in months or years.
        </p>
        <p style={pStyle}>
          If you've got more than one loan, run them one at a time. Rates are almost never identical across loans,
          and doing it separately shows you which one is costing you the most. Then add the payments up for your real
          monthly total.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Look at three results in this order: monthly payment, total repaid, and total interest. The difference
          between total repaid and what you borrowed is what the loan really costs you. To test a payoff plan, type in
          an extra amount and compare the new payoff date to the old one. Change only one thing at a time. That way
          you can tell whether the rate, the term, or the extra payment is doing the heavy lifting.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solve for Payment, Term, Rate or Balance</h2>

        <h3 style={{ ...h3Style, marginTop: 0 }}>Monthly payment</h3>
        <p style={pStyle}>
          This is the one most people start with. Say you borrow $30,000 at 6% over ten years. The calculator gives
          you about $333 a month, roughly $39,970 repaid overall, and close to $10,000 of that is interest. Better to
          see that number before you borrow than after.
        </p>

        <h3 style={h3Style}>Payoff term</h3>
        <p style={pStyle}>
          Flip it around: "I can swing $250 a month, so how long does this take?" One warning here. If your payment is
          smaller than the interest piling up each month, the balance won't go down, and there's no payoff date at
          all. Good to know early.
        </p>

        <h3 style={h3Style}>Interest rate</h3>
        <p style={pStyle}>
          Sometimes an offer gives you a payment and a term but plays down the rate. Enter the balance, payment and
          term, and the calculator shows the rate behind the deal. It's a quick way to compare lenders or a refinance
          offer on equal footing.
        </p>

        <h3 style={h3Style}>Loan balance</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you know the payment you can handle, plus the rate and term, you can solve for how much you can borrow.
          Do this before you accept a financial aid package. Plenty of people take the full offered loan without
          asking whether they need all of it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Can You Borrow in Student Loans?</h2>
        <p style={pStyle}>
          Lots of people search this before they ever touch a calculator, so here's the federal picture. These are
          the figures as of fall 2026, and they changed this year, so double-check them on StudentAid.gov before you
          plan around them.
        </p>
        <p style={pStyle}>
          <strong>Undergraduates.</strong> Limits depend on whether you're a dependent or independent student. You're
          generally dependent if your parents support you. You're treated as independent if you're 24 or older,
          married, a veteran, or otherwise meet the federal criteria. Dependent undergrads can borrow $5,500 in year
          one, $6,500 in year two, and $7,500 in years three and up, with a lifetime cap of $31,000. Independent
          students get $9,500, $10,500, and $12,500 over those same years, up to $57,500 total. In every case, only
          part of each year's amount can be subsidized: $3,500, $4,500, then $5,500, for a lifetime subsidized max of
          $23,000. If your parents are denied a PLUS loan, you may be able to borrow at the independent level even as
          a dependent.
        </p>
        <p style={pStyle}>
          <strong>Graduate and professional students.</strong> Since July 1, 2026, Grad PLUS loans are gone for new
          borrowers. Graduate students can take Direct Unsubsidized Loans up to $20,500 a year, with a $100,000 cap.
          Professional students (think medicine or law) can borrow up to $50,000 a year, capped at $200,000. There's
          also an overall lifetime ceiling of $257,000 across undergraduate and graduate federal loans. If you were
          counting on Grad PLUS to cover the gap, you'll likely be looking at private loans now.
        </p>
        <p style={pStyle}>
          <strong>Parents.</strong> Parent PLUS loans used to cover the full cost of attendance minus other aid. For
          loans starting July 1, 2026, they're capped at $20,000 per year and $65,000 total per dependent student.
        </p>
        <p style={pStyle}>
          <strong>Private loans.</strong> There's no single federal-style cap. Lenders generally let you borrow up to
          your school's cost of attendance, though your credit, your cosigner, your degree, and the lender's own
          aggregate limit all play in. Some lenders top out around $200,000 or more, others tie the limit to the cost
          of attendance.
        </p>
        <p style={pStyle}>
          Now the part that matters more than the limit: being allowed to borrow it doesn't mean you should. A quick
          way to find your real number is to add up tuition, housing, food, books and transportation, then subtract
          grants, scholarships, savings and what your family is putting in. What's left is the gap. Borrow that, not
          the maximum. Then run the gap through this student loan calculator and look at the monthly payment next to
          what people in your field typically earn. The Bureau of Labor Statistics publishes pay data by occupation,
          and it's a decent reality check.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A rough rule some financial aid counselors use: try not to borrow more in total than you expect to earn in
          your first year out. It's not a law, but it keeps payments from eating your whole paycheck.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Federal, State and Private Student Loans: What's the Difference?</h2>
        <p style={pStyle}>
          Where the money comes from changes your rate, your flexibility, and what happens if things get tough.
          Here's the quick tour.
        </p>

        <h3 style={h3Style}>Direct Subsidized Loans</h3>
        <p style={pStyle}>
          These are for undergrads with financial need. The government pays the interest while you're in school at
          least half-time, during your six-month grace period, and during approved deferment. Not having interest
          built in the background is a real advantage.
        </p>

        <h3 style={h3Style}>Direct Unsubsidized Loans</h3>
        <p style={pStyle}>
          Available to undergrads, grad students and professional students, and need doesn't matter. Interest starts
          building the moment the loan is paid out. You can pay it during school or let it stack up, but if it's
          unpaid when repayment begins, it can get added to your balance. That's capitalization, and it means you
          then pay interest on the interest.
        </p>

        <h3 style={h3Style}>Parent PLUS Loans</h3>
        <p style={pStyle}>
          These are borrowed by parents of dependent undergraduates. They need a credit check that doesn't show
          serious adverse history, they carry the highest federal rate, and they have the biggest origination fee. Use
          the calculator on these carefully, because the balances and rates are both high.
        </p>

        <h3 style={h3Style}>Direct Consolidation Loans</h3>
        <p style={pStyle}>
          If you've got several federal loans, you can roll them into one. The upside is a single bill, and sometimes
          a longer term and a lower monthly payment. The downside is that a longer term usually means more total
          interest. The new rate is the weighted average of your old rates, rounded up to the nearest eighth of a
          percent, so consolidation doesn't lower your rate. It can also affect progress toward forgiveness programs,
          so check before you pull the trigger.
        </p>

        <h3 style={h3Style}>State loans</h3>
        <p style={pStyle}>
          Many states or state-affiliated nonprofits offer their own student loans. They vary a lot. Some come with
          perks like forgiveness if you work in a high-need field (nursing and teaching come up often) and stay in the
          state afterward. Deadlines sometimes land earlier than the federal ones, and residency or in-state
          enrollment rules usually apply. Your state's higher education agency has the details.
        </p>

        <h3 style={h3Style}>Private student loans</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Banks, credit unions and online lenders issue these. Approval depends on credit and income, which is why
          many undergraduates need a cosigner. Rates can be fixed or variable, and the best ones go to borrowers with
          strong credit. Private loans usually don't offer income-driven repayment or federal forgiveness. They do
          come with a few upsides: quick funding, no need-based requirement, and sometimes a cosigner release after a
          run of on-time payments. Most advisors say to use up your federal options first and treat private loans as
          the backup. If you do need one, compare several lenders and run each offer through the calculator.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Good Student Loan Interest Rate?</h2>
        <p style={pStyle}>
          For federal loans, you don't get to shop around. Rates are set by formula each year. For loans first paid
          out between July 1, 2026 and June 30, 2027, they're 6.52% for undergraduate loans, 8.07% for graduate
          unsubsidized loans, and 9.07% for PLUS loans. Once a federal loan is issued, its rate is fixed for the life
          of the loan.
        </p>
        <p style={pStyle}>
          For private loans, a "good" rate is one toward the low end of that lender's range, and it depends heavily
          on your credit, your cosigner's credit, and whether it's fixed or variable. Always compare the rate against
          the federal one for the same situation. If a private rate is lower and you're comfortable giving up federal
          protections, it might make sense. If it's higher, you're paying extra for nothing.
        </p>
        <p style={pStyle}>A few ways to bring your rate down:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Build up your credit score and pay down other debt before applying.</li>
          <li style={liStyle}>Use a cosigner with strong credit.</li>
          <li style={liStyle}>
            Turn on autopay. Many lenders knock a fraction of a point off, and you can check the savings by entering
            the lower rate in the calculator.
          </li>
          <li>
            Consider refinancing later if your credit improves, but think hard before refinancing federal loans, since
            you'd lose federal protections.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To see why this matters, run $30,000 over ten years at 5% and again at 7%. The first costs about $8,200 in
          interest and the second about $11,800. That's a $3,600 swing from two points of rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Loan Fees: The Cost Beyond Interest</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Federal loans take an origination fee off the top. For loans disbursed through September 2027, it's about
          1.06% on Direct Subsidized and Unsubsidized loans and about 4.23% on PLUS loans. So if you borrow $20,000 in
          unsubsidized loans, around $212 is deducted before the money reaches your school, but you still owe the
          full $20,000. On a $20,000 PLUS loan, the fee is roughly $846. When you're deciding how much to borrow, you
          may need to borrow slightly more than your gap to net the amount you need. Enter the full borrowed amount in
          the calculator, because that's what accrues interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Student Loan Payoff Calculator With Extra Payments</h2>
        <p style={pStyle}>
          Extra payments are the most dependable way to shrink the cost of student debt. Every extra dollar goes
          against principal, and a smaller principal means less interest every month after that.
        </p>
        <p style={pStyle}>
          Back to the $30,000 at 6% example. Add $100 to the $333 payment and the loan is gone in about 85 months
          instead of 120. That's close to three years sooner. Interest drops from roughly $9,970 to about $6,940, so
          about $3,000 saved for $100 a month.
        </p>
        <p style={pStyle}>
          You can test your own number, a recurring extra amount, or a one-time lump sum like a tax refund or bonus.
          One practical tip: tell your servicer to apply extra money to principal. Some will just push your next due
          date forward instead, which doesn't save you anything. With multiple loans, send the extra to the
          highest-rate one first (the avalanche method). Some people prefer paying off the smallest balance first (the
          snowball method) because the quick wins keep them motivated. The avalanche saves more money. The snowball
          keeps some people on track. Either beats doing nothing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Good news on prepayment: federal and private student loans in the U.S. don't charge a penalty for paying
          early, so you can throw extra money at them whenever you're able.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where Your Payment Actually Goes</h2>
        <p style={pStyle}>
          Student loans are amortized, which just means every payment is split between interest and principal, and
          the split changes over time. Early on, interest eats most of it. On the $30,000 example, your first payment
          includes $150 of interest and only about $183 of principal. By last year, nearly the entire payment was
          principal.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That's why extra payments in the first few years are so effective, and why paying only the minimum can feel
          like treading water. You can see this in the calculator's results as the interest total shrinks when you add
          money early.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Project What You'll Owe After Graduation</h2>
        <p style={pStyle}>
          A lot of students are shocked by their balance at graduation. The reason is simple: on unsubsidized federal
          loans and most private loans, interest starts building as soon as the money is paid out, even if no payment
          is due while you're in school.
        </p>
        <p style={pStyle}>
          Subsidized loans work differently. For eligible undergrads, the government covers the interest while you're
          enrolled at least half-time and during the grace period.
        </p>
        <p style={pStyle}>
          Here's an example. Borrow $5,000 a year for four years at 7%, all unsubsidized. By graduation, you've picked
          up about $3,500 in interest, so you leave owing around $23,500 instead of $20,000. If that interest gets
          capitalized when repayment starts, your monthly payment is based on the larger number, and you pay interest
          on it for years.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The graduation projection in the calculator shows you this ahead of time. Try a few versions: borrow less,
          take a subsidized loan if you qualify, or pay just the interest each month while in school. Even small
          interest payments during school can keep the balance from growing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Federal Repayment Plans in 2026-2027</h2>
        <p style={pStyle}>Repayment rules changed this summer, so this part is worth reading carefully.</p>
        <p style={pStyle}>
          For federal loans first disbursed on or after July 1, 2026, the main options are the Tiered Standard plan
          and the Repayment Assistance Plan (RAP), which bases your payment on your income. Older plans are being
          phased out or changed for existing borrowers, and the details have been shifting, so confirm your options on
          StudentAid.gov or with your servicer instead of relying on an old chart.
        </p>
        <p style={pStyle}>
          The older choices you'll still see mentioned online include Standard (fixed payments over ten years),
          Graduated (payments start low and rise every couple of years), Extended (up to 25 years for larger
          balances), and income-driven plans like Income-Based Repayment that set payments as a share of income and may
          forgive the leftover balance after 20 to 25 years. Public service workers can also qualify for Public
          Service Loan Forgiveness after 120 qualifying payments while working for an eligible employer.
        </p>
        <p style={pStyle}>
          Here's the catch for calculator users. This tool uses standard fixed-payment math, so it matches a standard
          plan. Income-based payments move with your paycheck, so your bill won't match the calculator's monthly
          figure. You can still use it to see what a standard payment would be, so you can compare the two. Longer
          terms and lower payments feel easier, but they almost always cost more in interest overall, which the
          calculator makes obvious.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're struggling to pay, call your servicer early. Options like deferment, forbearance and income-based
          plans exist for exactly that reason, and missing payments is far more expensive than asking for help.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Student Loan Calculator</h2>
        <p style={pStyle}>
          The biggest moment is when you're comparing financial aid offers. Different schools bundle different loans,
          and running each through the calculator shows which package costs less and how much of the loan you can
          decline.
        </p>
        <p style={pStyle}>
          Current students can use it each semester to decide whether to take the full loan or cover part of it with
          savings, work income, or a cheaper housing arrangement. If you've hit your federal limit, it also helps you
          see how much a private loan would add to your monthly bill before you commit.
        </p>
        <p style={pStyle}>
          Recent grads have a different problem: the grace period is about to end. Calculating the payment ahead of
          time lets you build it into your budget and decide whether to start paying early. Existing borrowers use it
          to weigh extra payments against other goals, like an emergency fund or retirement savings, and to test
          whether a refinance offer actually saves money.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Parents with PLUS loans, graduate and professional students with large balances, and anyone going back to
          school mid-career benefit too. The higher the balance and rate, the more a small change in inputs matters.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Borrow Less Before You Borrow At All</h2>
        <p style={pStyle}>
          If you're up against your limit, or just don't love the numbers the calculator is showing, here are some
          ways to cut down the balance:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Start at a community college.</strong> Knocking out two years of general ed courses can cut the
            cost of a bachelor's degree significantly.
          </li>
          <li style={liStyle}>
            <strong>Pick an in-state public school</strong> over an out-of-state or private one when the program is
            comparable.
          </li>
          <li style={liStyle}>
            <strong>Look at online programs.</strong> You can save on housing and commuting.
          </li>
          <li style={liStyle}>
            <strong>Apply for work-study</strong> if you qualify for need-based aid.
          </li>
          <li style={liStyle}>
            <strong>Chase scholarships and grants.</strong> This is free money you don't repay. Local scholarships
            often have smaller applicant pools.
          </li>
          <li style={liStyle}>
            <strong>Live at home or with roommates</strong>, and rent or buy used textbooks.
          </li>
          <li style={liStyle}>
            <strong>Work part-time</strong>, including tutoring or freelance work, and put that money toward tuition
            first.
          </li>
          <li>
            <strong>Pay interest while in school</strong> on unsubsidized loans if you can, even small amounts.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Make FAFSA your first step either way. Many state and school grants require it, and it's what unlocks
          federal loans and work-study.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Student Loan Calculator Free, Private and Accurate?</h2>
        <p style={pStyle}>
          It's free, there are no hidden charges, and you don't need an account to use it. You only type in loan
          numbers. You'll never be asked for your name, Social Security number, or a servicer login.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The math is the standard amortization formula lenders use, so results should land close to your servicer's
          figures. Small gaps can show up because servicers often calculate interest daily, apply payments on specific
          dates, or round differently. Treat the results as a solid planning estimate, not financial advice, and use
          your servicer's statement as the final word on your exact balance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Practical Ways to Pay Off Student Loans Faster</h2>
        <p style={pStyle}>Once you've got your numbers, here's how to put them to work:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Round up your payment.</strong> If the bill is $333, pay $350 or $400 automatically. You won't
            miss it much, and you'll see the payoff date move.
          </li>
          <li style={liStyle}>
            <strong>Sign up for autopay</strong> if your servicer offers a rate discount, and check the savings in the
            calculator.
          </li>
          <li style={liStyle}>
            <strong>Send windfalls to the principal.</strong> Tax refunds, bonuses and gifts go a long way early on.
          </li>
          <li style={liStyle}>
            <strong>Try biweekly payments.</strong> Paying half your bill every two weeks adds up to one extra full
            payment per year, if your servicer applies them correctly.
          </li>
          <li style={liStyle}>
            <strong>Target the highest rate first</strong> when you have multiple loans.
          </li>
          <li style={liStyle}>
            <strong>Check the student loan interest deduction.</strong> You may be able to deduct up to $2,500 of
            interest paid per year, subject to income limits. Ask a tax professional or check IRS guidance for your
            situation.
          </li>
          <li>
            <strong>Be careful about refinancing federal loans into private ones.</strong> You'd lose income-driven
            repayment, deferment options and forgiveness eligibility. If your job is stable, your credit is strong, and
            the new rate is clearly lower, it can still be worth it.
          </li>
        </ul>
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
