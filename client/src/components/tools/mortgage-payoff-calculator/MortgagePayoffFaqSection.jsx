import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a mortgage payoff calculator work?",
    a: "It takes your loan amount, term, interest rate, and payment, builds your amortization schedule, then reruns it with your extra or biweekly payments added. The difference between the two schedules is your time saved and interest saved.",
  },
  {
    q: "Why should I pay off my mortgage early?",
    a: "The main reason is interest. A 30-year loan can cost as much in interest as you borrowed, and paying early cuts that dramatically. Other reasons include owning your home outright going into retirement, removing your biggest monthly bill, and having more cash flow later.",
  },
  {
    q: "Are there other advantages to making extra mortgage payments?",
    a: "Yes. You build equity faster, which gives you more options if you want to sell or borrow. You may reach 80% equity sooner and get rid of private mortgage insurance. It also gives you a guaranteed return equal to your mortgage rate, and there's the peace of mind of being debt-free.",
  },
  {
    q: "How much can I save by making extra mortgage payments?",
    a: "It depends on your balance, rate, and how much time is left. On a $300,000, 30-year loan at 6.5%, an extra $200 a month saves roughly $103,000 in interest and cuts about seven years off the term. Enter your own numbers in the calculator for a real estimate.",
  },
  {
    q: "Are biweekly mortgage payments worth it?",
    a: "They can be, since 26 half-payments equal 13 full payments a year. But it only works well if your servicer applies each payment promptly and doesn't charge a fee. The 1/12 rule, where you add one-twelfth of your payment to each monthly payment, gets you nearly the same result for free.",
  },
  {
    q: "What is the 1/12 rule for mortgages?",
    a: "Divide your monthly principal and interest payment by 12, then add that amount to each monthly payment. You'll make the equivalent of 13 payments a year instead of 12.",
  },
  {
    q: "What's the difference between my loan balance and my payoff amount?",
    a: "Your balance is the principal still owed. Your payoff amount adds interest that's accrued since your last payment, plus any fees. It changes daily, so request an official payoff statement when you're ready to close out the loan.",
  },
  {
    q: "Do extra payments automatically go toward principal?",
    a: "Not always. Some servicers apply the money to your next scheduled payment instead. Designate the extra as \"principal only,\" then check your next statement to confirm the balance dropped.",
  },
  {
    q: "Is there a penalty for paying off a mortgage early?",
    a: "Most modern mortgages don't have one, but some do, usually in the first few years. FHA and VA loans can't include them. Check your note or closing disclosure, or ask your servicer.",
  },
  {
    q: "Is it better to make extra payments or refinance to a shorter term?",
    a: "Extra payments keep your current loan and let you stop anytime. A shorter-term refinance can lower your rate but comes with closing costs and a higher required payment. Compare your total interest savings against the refinance costs to see which comes out ahead.",
  },
  {
    q: "What should I pay off first, my mortgage or other debt?",
    a: "Usually the higher-interest debt. Credit cards and many personal or auto loans charge much more than a typical mortgage, so clearing them first saves more.",
  },
];

// Structured-data answers use the shorter wording supplied for the schema.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How does a mortgage payoff calculator work?",
    a: "It takes your loan amount, term, interest rate, and payment, builds your amortization schedule, then reruns it with your extra or biweekly payments added. The difference between the two schedules is your time saved and interest saved.",
  },
  {
    q: "Why should I pay off my mortgage early?",
    a: "The main reason is interest. A 30-year loan can cost as much in interest as you borrowed, and paying early cuts that dramatically. Other reasons include owning your home outright going into retirement and removing your biggest monthly bill.",
  },
  {
    q: "Are there other advantages to making extra mortgage payments?",
    a: "Yes. You build equity faster, may reach 80% equity sooner and drop private mortgage insurance, earn a guaranteed return equal to your mortgage rate, and gain the peace of mind of being debt-free.",
  },
  {
    q: "How much can I save by making extra mortgage payments?",
    a: "It depends on your balance, rate, and remaining term. On a $300,000, 30-year loan at 6.5%, an extra $200 a month saves roughly $103,000 in interest and cuts about seven years off the term.",
  },
  {
    q: "Are biweekly mortgage payments worth it?",
    a: "They can be, since 26 half-payments equal 13 full payments a year. It works well only if your servicer applies each payment promptly and doesn't charge a fee. The 1/12 rule gets nearly the same result for free.",
  },
  {
    q: "What is the 1/12 rule for mortgages?",
    a: "Divide your monthly principal and interest payment by 12, then add that amount to each monthly payment. You make the equivalent of 13 payments a year instead of 12.",
  },
  {
    q: "What's the difference between my loan balance and my payoff amount?",
    a: "Your balance is the principal still owed. Your payoff amount adds interest accrued since your last payment, plus any fees. It changes daily, so request an official payoff statement from your servicer.",
  },
  {
    q: "Do extra payments automatically go toward principal?",
    a: "Not always. Some servicers apply the money to your next scheduled payment instead. Designate the extra as principal only and confirm on your next statement that the balance dropped.",
  },
  {
    q: "Is there a penalty for paying off a mortgage early?",
    a: "Most modern mortgages don't have one, but some do, usually in the first few years. FHA and VA loans can't include them. Check your note or closing disclosure, or ask your servicer.",
  },
  {
    q: "Is it better to make extra payments or refinance to a shorter term?",
    a: "Extra payments keep your current loan and let you stop anytime. A shorter-term refinance can lower your rate but comes with closing costs and a higher required payment. Compare your interest savings against the refinance costs.",
  },
  {
    q: "What should I pay off first, my mortgage or other debt?",
    a: "Usually the higher-interest debt. Credit cards and many personal or auto loans charge much more than a typical mortgage, so clearing them first saves more.",
  },
];

const EXTRA_HEADERS = ["Extra per month", "Approx. payoff time", "Time saved", "Interest saved"];
const EXTRA_ROWS = [
  ["$100", "About 26 years", "About 4 years", "About $61,000"],
  ["$200", "About 23 years", "About 7 years", "About $103,000"],
  ["$500", "About 17.5 years", "About 12.5 years", "About $180,000"],
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap" }}>
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

export default function MortgagePayoffFaqSection() {
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
        <h2 style={h2Style}>What This Mortgage Payoff Calculator Does</h2>
        <p style={pStyle}>
          The calculator handles four jobs. It shows how extra payments change your timeline, whether that's a steady
          monthly amount, a yearly chunk, or a single lump sum. It models biweekly payments. It compares all of those
          against your current schedule, so you can see the time and interest you'd save. And it helps you estimate
          what it would cost to pay the whole loan off right now.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For each option you'll see the new payoff date, how many months or years you shave off, and the total
          interest saved compared with doing nothing. That last comparison is what makes it useful. A number like
          "$61,000 in interest saved" means something, while "pay a little extra" doesn't.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Goes Into the Calculator</h2>
        <p style={pStyle}>
          You'll need a few details from your loan paperwork or your latest statement. Here's what each one means,
          since a couple of them get mixed up a lot.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Original mortgage amount.</strong> This is what you borrowed when you closed, not what you owe
            today. People often confuse it with the remaining balance, which is why it's worth double-checking.
          </li>
          <li style={liStyle}>
            <strong>Original mortgage term.</strong> The full length of the loan when you took it out. Most are 15, 20,
            or 30 years.
          </li>
          <li style={liStyle}>
            <strong>Years remaining.</strong> How much time is left on that original term.
          </li>
          <li style={liStyle}>
            <strong>Annual interest rate.</strong> The rate your monthly payment is based on. This isn't the same as the
            APR, which rolls in costs like mortgage insurance, origination fees, and points. The APR is usually a bit
            higher, so use the plain interest rate from your note or statement.
          </li>
          <li style={liStyle}>
            <strong>Current monthly payment.</strong> Principal and interest only. If your bill includes escrow for
            property taxes and homeowners insurance, don't include that part. It doesn't pay down the loan.
          </li>
          <li style={liStyle}>
            <strong>Additional principal payment.</strong> The extra amount you're thinking about adding each month, on
            top of the scheduled payment.
          </li>
          <li style={liStyle}>
            <strong>Accelerated payment.</strong> Your regular payment plus that extra amount.
          </li>
          <li>
            <strong>Total savings.</strong> The interest you'd avoid if you kept up the accelerated payment until the
            loan is gone.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Run a few versions instead of just one. Try $100 extra, then $250, then a yearly lump sum from a bonus. You'll
          often see that the first few hundred dollars do a lot of the work, and that tells you where the sweet spot is
          for your budget.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where Your Mortgage Payment Actually Goes</h2>
        <p style={pStyle}>
          A mortgage payment has two parts. The principal is the money you borrowed. The interest is what the lender
          charges you for borrowing it, calculated as a percentage of whatever you still owe.
        </p>
        <p style={pStyle}>
          Each month, the interest gets covered first and whatever's left goes to principal. Early on, you owe a lot,
          so the interest charge is big and the principal chunk is tiny. As the balance shrinks, interest shrinks too,
          and more of each payment goes to principal. That's amortization.
        </p>
        <p style={pStyle}>
          Here's how lopsided it gets. Say you borrow $300,000 at 6.5% for 30 years. Your payment is about $1,896. In
          the very first month, around $1,625 of that is interest and only about $271 goes to principal. After five
          full years, you'll have paid roughly $113,800 in total, but your balance will have dropped by only about
          $19,200. The two lines don't cross until about year 19, when principal finally starts to outweigh interest in
          each payment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is the whole reason extra payments work. Every extra dollar you send toward principal early on stops
          accruing interest for the rest of the loan, and it also means the following month's interest is calculated
          on a smaller balance. The savings stack up on themselves.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Extra Payments: Small Amounts, Big Results</h2>
        <p style={pStyle}>
          An extra payment is any money you send above the scheduled amount. You can do it once, every month, or once a
          year.
        </p>
        <p style={pStyle}>
          Using the same $300,000 loan at 6.5% over 30 years, which would cost roughly $382,600 in interest if you never
          paid extra, here's what different monthly amounts do:
        </p>
        <DataTable headers={EXTRA_HEADERS} rows={EXTRA_ROWS} />
        <p style={pStyle}>
          These are estimates, and your results will shift with your own balance, rate, and how far along you are. But
          look at the pattern. Doubling the extra payment from $100 to $200 gets you more than the first $100 did on its
          own to some degree, but it also shows the returns aren't perfectly proportional. That's why testing a few
          amounts in the calculator is smart.
        </p>
        <p style={pStyle}>
          Lump sums work too, and timing matters a lot. A single $10,000 payment made at the very start of that same
          loan would cut it by nearly three years and save around $54,000 in interest. Make that same $10,000 payment in
          year 25 and the savings are a tiny fraction of that, because there's so little interest left to avoid.
        </p>
        <p style={pStyle}>A few practical things most people don't hear until they've already made a mistake:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Tell your servicer it's principal-only.</strong> Some servicers treat extra money as an early
            payment toward next month's bill, which does nothing to cut interest. Mark it as "additional principal" in
            the online portal, or include a note with a check, and then check your next statement to confirm the
            balance dropped by the right amount.
          </li>
          <li style={liStyle}>
            <strong>Ask about recasting before a big lump sum.</strong> With a recast, you send a large payment and the
            lender recalculates your monthly payment based on the new, lower balance. Your term stays the same but the
            payment drops. It usually costs a few hundred dollars, and it's not available on every loan type (FHA and VA
            loans generally don't allow it). It's worth asking about if you want lower payments instead of a shorter
            loan.
          </li>
          <li>
            <strong>Start early if you can.</strong> If you can only afford extra payments for a few years,
            front-loading them is better than waiting. Early dollars have decades of interest to eliminate.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Three Easy Ways to Make the Equivalent of a 13th Payment</h2>
        <p style={pStyle}>
          Making one extra payment a year is one of the simplest ways to speed things up, and you can get there without
          a big change to your monthly budget.
        </p>
        <p style={pStyle}>
          <strong>The 1/12 rule.</strong> Take your monthly principal and interest payment, divide by 12, and add that
          amount to each monthly payment. On a $1,896 payment, that's about $158 extra a month. At the end of the year
          you've made the equivalent of 13 payments instead of 12.
        </p>
        <p style={pStyle}>
          <strong>The savings account route.</strong> Put one-twelfth of your payment into a separate savings account
          each month, then send the whole balance as a lump sum toward principal once a year. This works well if you'd
          rather keep the money accessible until you're ready to send it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>A yearly lump sum.</strong> Tax refunds, work bonuses, and side income are natural candidates. Even if
          you can't commit to a monthly amount, one yearly payment makes a noticeable dent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Biweekly Mortgage Payments</h2>
        <p style={pStyle}>
          With biweekly payments, you pay half your monthly mortgage amount every two weeks. There are 52 weeks in a
          year, so that's 26 half-payments, which equals 13 full monthly payments. You end up making one extra payment a
          year without really feeling it, because the money comes out in smaller pieces.
        </p>
        <p style={pStyle}>
          It's a good fit if you're paid every other week. You can send part of each paycheck straight to the mortgage
          and it lines up nicely. Using the same $300,000 loan at 6.5%, a true biweekly schedule pays it off in about 24
          years instead of 30 and saves roughly $87,000 in interest.
        </p>
        <p style={pStyle}>There are some catches to know about:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Check how your servicer handles it.</strong> Some apply each half-payment when it arrives, which is
            what you want. Others hold the money until they've collected a full monthly payment, which waters down the
            benefit. Before you start, make sure your servicer is set up to accept biweekly payments and apply them
            properly.
          </li>
          <li style={liStyle}>
            <strong>Watch out for third-party programs.</strong> Some companies charge a setup fee and sometimes a fee
            per transaction to run a biweekly plan for you. You can get nearly the same result for free by using the
            1/12 rule above.
          </li>
          <li>
            <strong>Semi-monthly isn't biweekly.</strong> If your employer pays you on the 1st and 15th, you get 24
            paychecks a year, not 26. Splitting your payment across those 24 paychecks doesn't give you the extra
            payment. You'd have to deliberately add to it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Use the calculator to compare a biweekly plan with the 1/12 rule. In most cases the results are close enough
          that the simpler option wins.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Refinancing to a Shorter Term</h2>
        <p style={pStyle}>
          Instead of paying extra on your current loan, you could swap it for a new one with a shorter term. Shorter
          loans typically come with lower interest rates, so you get a double benefit: fewer years and a lower rate.
        </p>
        <p style={pStyle}>
          Here's an example. Say you owe $250,000 with 25 years left at 7%. Your payment is about $1,767 and you'd pay
          roughly $280,000 in interest over the rest of the loan. If you refinanced into a 15-year loan at 6%, your
          payment would jump to about $2,110, but total interest would drop to around $130,000. That's about $150,000
          less, minus the closing costs you'd pay to refinance.
        </p>
        <p style={pStyle}>The tradeoffs are real, though:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Closing costs.</strong> Refinancing usually runs somewhere in the range of 2% to 5% of the loan
            amount. Divide those costs by your monthly savings to find your break-even point. If you might move before
            then, refinancing won't pay off.
          </li>
          <li style={liStyle}>
            <strong>A higher required payment.</strong> With extra payments, you can scale back whenever money gets
            tight. With a 15-year loan, that higher payment is mandatory.
          </li>
          <li>
            <strong>A reset clock.</strong> If you refinance into a new 30-year loan after seven years, you've started
            over, even if the rate is lower.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If rates have dropped meaningfully since you got your loan, refinancing is worth a look. If they haven't,
          extra payments on your current loan usually give you most of the benefit with a lot more flexibility.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Find Your Mortgage Payoff Amount Today</h2>
        <p style={pStyle}>
          If you want to pay the loan off entirely, you need your payoff amount, and it's not the same as the balance on
          your monthly statement. The payoff amount is the principal you owe plus interest that has built up since your
          last payment, and sometimes small fees for things like processing or recording.
        </p>
        <p style={pStyle}>
          Mortgage interest is paid in arrears, meaning each payment covers the previous month's interest. So when you
          pay off the loan mid-month, you owe interest for the days since your last payment. That daily amount is called
          per diem interest. As a rough guide, on a $200,000 balance at 6.5%, it's about $35.60 a day.
        </p>
        <p style={pStyle}>
          The calculator gives you a solid estimate for planning, like checking whether a home sale, windfall, or
          savings account would be enough to clear the loan. When you're actually ready to pay it off, do these things:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Request an official payoff statement from your servicer.</strong> You'll typically get it within
            about seven business days of a written request, and it shows the exact amount owed through a specific date,
            plus the per diem if your payment lands late.
          </li>
          <li style={liStyle}>
            <strong>Pay by the date on the statement.</strong> The number is only valid through that date, so if you
            miss it, you'll need an updated figure.
          </li>
          <li style={liStyle}>
            <strong>Expect a wire or processing fee.</strong> Some servicers charge for wire transfers, so ask in
            advance.
          </li>
          <li style={liStyle}>
            <strong>Look for your escrow refund.</strong> If you had an escrow account, the leftover balance should come
            back to you. Federal rules give servicers up to 20 business days.
          </li>
          <li>
            <strong>Confirm the lien release.</strong> Your lender needs to record the satisfaction of the mortgage with
            the county. It can take a few weeks to a couple of months depending on the state, so follow up and keep a
            copy for your records.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Prepayment Penalties</h2>
        <p style={pStyle}>
          Before you commit to paying a mortgage off early, check whether your loan has a prepayment penalty. Lenders
          earn money from your interest over many years, so some of them write in a fee for paying early.
        </p>
        <p style={pStyle}>
          The formulas vary. Some lenders charge a percentage of the remaining balance, and others charge several months
          of interest. In the early years of a loan, those fees can run into thousands of dollars.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The good news is that these penalties have become rare. Federal rules limit them to certain fixed-rate loans,
          and where they're allowed, they can only apply for the first three years, with caps of 2% of the balance in
          the first two years and 1% in the third. FHA and VA loans don't allow prepayment penalties at all. Still,
          don't assume. Look in your note or your closing disclosure, or just call your servicer and ask. It's a
          two-minute question that can save you from a nasty surprise.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Should You Pay Off Your Mortgage Early? Opportunity Cost and Other Factors</h2>
        <p style={pStyle}>
          The calculator shows you what you can do. Whether you should is a different question, and it comes down to
          opportunity cost. Every dollar you send to the mortgage is a dollar you can't put anywhere else.
        </p>
        <p style={pStyle}>
          Paying extra toward your mortgage is basically a guaranteed return equal to your interest rate. That's
          low-risk, and at higher rates it's appealing. At low rates, less so. Here's how to think about it.
        </p>
        <p style={pStyle}>
          <strong>Pay off high-interest debt first.</strong> If you have credit cards at 20% or more, those are costing
          you far more than a mortgage at 5% or 6%. Student loans and car loans with higher rates also come first.
        </p>
        <p style={pStyle}>
          <strong>Build an emergency fund.</strong> Home equity isn't easy to get to in a hurry. Once your money is in
          the house, getting it back means borrowing against it or selling. If you lose your job, a paid-down mortgage
          doesn't cover groceries. Most people aim for three to six months of expenses in cash before sending extra to
          the loan.
        </p>
        <p style={pStyle}>
          <strong>Grab your employer match.</strong> If your company matches 401(k) contributions, that's free money,
          often an instant 50% to 100% return. Take it before you pay extra on your mortgage.
        </p>
        <p style={pStyle}>
          <strong>Compared against investing.</strong> Over long stretches, the stock market has historically returned
          more than most mortgage rates, but nothing's guaranteed and returns come with swings. A mortgage payoff is
          certain. If your rate is 3%, investing probably makes more sense. If it's 7%, paying down the loan looks a lot
          better. The in-between is a judgment call that depends on how much risk you're comfortable with.
        </p>
        <p style={pStyle}>
          <strong>Think about retirement accounts.</strong> Contributing to an IRA, Roth IRA, or 401(k) can come with
          tax benefits that paying down a mortgage doesn't, so it's worth maxing those out first for many people.
        </p>
        <p style={pStyle}>
          <strong>Mortgage insurance changes the math.</strong> If you pay private mortgage insurance on a conventional
          loan, you can request cancellation once your balance reaches 80% of the home's original value, and lenders
          have to drop it automatically at 78%. Extra payments get you there sooner. FHA loans work differently: if you
          put down less than 10% on a loan from 2013 or later, the mortgage insurance premium generally lasts for the
          life of the loan, so those borrowers sometimes refinance out of FHA once they have enough equity.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>The tax deduction isn't a reason to keep the debt.</strong> If you itemize, you can deduct mortgage
          interest, but you're still paying a dollar of interest to save some cents in taxes. And many people take the
          standard deduction anyway.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Real-Life Situations Where This Calculator Helps</h2>
        <p style={pStyle}>Here are some common scenarios, so you can see where your own situation might fit.</p>
        <p style={pStyle}>
          <strong>The person with spare cash every month.</strong> Maria has about $300 left over after bills and
          wonders if it should go to the mortgage or into savings. She runs it through the calculator, sees the exact
          interest she'd save, and then decides based on her emergency fund and other debts. Having an actual number
          turns a vague question into a clear decision.
        </p>
        <p style={pStyle}>
          <strong>The person with credit card balances.</strong> Dan wants to feel the satisfaction of owning his home
          outright. But he's carrying two credit cards at around 22%, and his mortgage is at 5%. Every extra dollar on
          the cards saves him more than the same dollar on the mortgage. He clears the cards first, then comes back to
          the calculator.
        </p>
        <p style={pStyle}>
          <strong>The person with job worries.</strong> Priya has no debt except the mortgage, plenty of income, and a
          thin emergency fund. Her company just announced layoffs. Even though her mortgage rate is low and the stock
          market has done well, the smart move is to build cash first. The calculator can wait a few months.
        </p>
        <p style={pStyle}>
          <strong>The person near retirement.</strong> Frank is a few years from retiring. He's maxed out his
          tax-advantaged accounts, has a solid emergency fund, and doesn't want to take on market risk this late. For
          him, an extra monthly payment is a steady, predictable move, and he can work backward from his retirement date
          to figure out how much extra he needs each month.
        </p>
        <p style={pStyle}>
          <strong>The person about to sell.</strong> If you're planning to sell, your payoff amount tells you how much
          equity you'll walk away with after closing. And if you plan to move in a few years, you can see how much
          principal extra payments would build in that window.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>The person with a windfall.</strong> A bonus, inheritance, or tax refund raises the question of where
          it should go. Model the lump sum and you'll see exactly how many months it would cut and how much interest it
          would erase, then weigh that against other options.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Cost, and What the Calculator Can't Cover</h2>
        <p style={pStyle}>
          This mortgage payoff calculator is free to use. Results are estimates based on standard amortization math, so
          they should land close to your lender's numbers. They can be off by small amounts because of how your
          servicer rounds, when payments post to your account, and how partial payments get handled.
        </p>
        <p style={pStyle}>A few things to keep in mind:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            It assumes a fixed interest rate. If you have an adjustable-rate mortgage, your actual numbers will change
            when the rate resets.
          </li>
          <li style={liStyle}>
            It covers principal and interest only. Property taxes, homeowners insurance, HOA fees, and escrow aren't
            part of the results.
          </li>
          <li style={liStyle}>
            Refinancing closing costs and any prepayment penalty need to be weighed separately.
          </li>
          <li>For anything final, like a payoff figure or your exact balance, rely on your lender's official statement.</li>
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
