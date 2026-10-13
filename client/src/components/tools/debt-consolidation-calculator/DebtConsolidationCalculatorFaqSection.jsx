import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a debt consolidation calculator work?",
    a: "You enter your current debts (balance, APR, and monthly payment) and the terms of the consolidation loan (amount, term, rate, and fees). The calculator then compares monthly payment, payoff time, and total cost for each option.",
  },
  {
    q: "Is debt consolidation a good idea?",
    a: "It can be, if the new loan's real APR is clearly lower than what you're paying now, the fees are reasonable, and you won't run the old balances back up. It's not a great idea if the savings are tiny or if you could pay everything off in the next year or so anyway.",
  },
  {
    q: "How do I know if I'll save money by consolidating?",
    a: "Compare total cost, not just monthly payment. If the loan's total repayment, including fees, is lower than what you'd pay on your current debts, you're saving. Also check that the real APR is meaningfully below your blended APR.",
  },
  {
    q: "What's the difference between APR and interest rate?",
    a: "The interest rate is the base cost of borrowing. APR adds in fees, so it shows what the loan really costs per year. That's why APR is the fairer number for comparing loans.",
  },
  {
    q: "What's real APR?",
    a: "It's the APR after accounting for upfront fees. If a loan has a 5% origination fee, you're getting less money than you're paying interest on, which pushes the real cost above the advertised rate.",
  },
  {
    q: "What is a good APR for a debt consolidation loan?",
    a: "There's no single number, since offers depend on credit, income, and term. A useful rule is that the loan's real APR should come in clearly under your blended APR after all fees. A gap of several points usually matters. One point rarely does.",
  },
  {
    q: "Will debt consolidation hurt my credit score?",
    a: "You might see a small, short-term dip from the hard inquiry and the new account. Over time, lower utilization and on-time payments can help. Missing payments will hurt.",
  },
  {
    q: "What's the difference between a debt consolidation loan and a personal loan?",
    a: "Not much. A debt consolidation loan is just a personal loan used to pay off other debts. Some lenders send the funds straight to your creditors.",
  },
  {
    q: "Which is better, a balance transfer card or a consolidation loan?",
    a: "A balance transfer card can win if you can pay the balance off during the 0% promo period, usually 12 to 21 months, and you can handle the 3% to 5% transfer fee. A loan is usually better when you need more time and want a fixed payment.",
  },
  {
    q: "Is it safe to use my home equity to consolidate debt?",
    a: "It usually gets you a lower rate, but your home secures the loan. If you can't keep up the payments, you could lose it. For most people, that risk is worth weighing carefully.",
  },
  {
    q: "How long does debt consolidation take?",
    a: "Pre-qualifying can take minutes. Approval and funding often take a few days to a couple of weeks, depending on the lender. Rolling in multiple debts, paying them off, and confirming each one can take longer.",
  },
  {
    q: "Can I use this calculator for credit cards and loans together?",
    a: "Yes. Add each credit card and installment loan separately, then enter the consolidation loan details.",
  },
  {
    q: "Is this debt consolidation calculator free, and do I need to sign up?",
    a: "It's free, and no signup is required.",
  },
];

const OPTION_HEADERS = ["Option", "Typically best for", "Upside", "Watch out for"];
const OPTION_ROWS = [
  ["Personal loan (unsecured)", "Good credit, mid-size balances", "Fixed rate, fixed payment, no collateral", "Origination fees, rates higher than secured loans"],
  ["Balance transfer card", "Debt you can pay off in roughly 12 to 21 months", "0% intro APR", "Transfer fees of 3% to 5%, regular APR kicks in after the promo"],
  ["Home equity loan", "Large balances, often $20,000+", "Much lower rates than cards", "Your home is the collateral"],
  ["HELOC", "Large balances, flexible borrowing", "Lower starting rate", "Variable rate, possible fees, home is collateral"],
  ["Cash-out refinance", "Homeowners who'd refinance anyway", "Lower rate, one mortgage payment", "Closing costs, longer payoff on the debt you roll in"],
  ["Debt management plan", "Struggling to qualify for good loans", "Counselor negotiates lower rates", "Not a loan, typically closes the enrolled cards"],
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top", minWidth: 140 }}>
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

export default function DebtConsolidationCalculatorFaqSection() {
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
        <h2 style={h2Style}>What a Debt Consolidation Calculator Actually Tells You</h2>
        <p style={pStyle}>
          Debt consolidation just means swapping several debts for one new loan. People do it to get a lower interest
          rate, a lower monthly payment, or simply to stop juggling five due dates. With a good loan you can sometimes
          get all three. With a bad one, you get a smaller payment and a bigger bill later.
        </p>
        <p style={pStyle}>
          That's the reason to run the numbers first. The calculator compares your current debts against the
          consolidation loan on three things:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Monthly payment:</strong> what you pay each month now versus after consolidating.
          </li>
          <li style={liStyle}>
            <strong>Payoff length:</strong> how many months until you're completely done.
          </li>
          <li>
            <strong>Total cost:</strong> everything you'll hand over by the end, interest and fees included.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Those three don't always agree. Stretch a loan over a longer term and the monthly payment drops, but you'll
          usually pay interest for more months. Looking at all three together keeps you from mistaking a lighter
          payment for a cheaper loan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Debt Consolidation Calculator</h2>
        <p style={pStyle}>
          Grab your most recent statements and the loan offer you're looking at. It takes about five minutes.
        </p>
        <p style={pStyle}>
          <strong>Step 1: Enter your credit card debts.</strong> For each card, add the current balance, the APR, and
          the monthly payment you actually make. If you have more than one card, add each as its own entry. Don't lump
          them together, because the calculator needs each rate to work out your real starting point.
        </p>
        <p style={pStyle}>
          <strong>Step 2: Enter your installment debts.</strong> These are loans with a fixed payment and end date,
          like personal loans, auto loans, or a medical payment plan. Same three numbers: balance, APR, monthly
          payment.
        </p>
        <p style={pStyle}>
          <strong>Step 3: Enter the consolidation loan.</strong> Add the loan term in months (36 for a three-year
          loan, 60 for five years), the interest rate, and any upfront fee the lender charges. If you only have a
          rough quote, use it for now and rerun it when the real offer comes in.
        </p>
        <p style={pStyle}>
          <strong>Step 4: Read the comparison.</strong> If consolidating wins on total cost and the new payment fits
          your budget, it's worth pursuing. If it only wins on monthly payment, you're basically paying extra for
          breathing room. That can be a fine choice sometimes, but you should know that's what you're doing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then play with it. Try a shorter term. Try another lender's rate. Try paying a little extra each month.
          Changing the term often moves the total cost more than shaving half a point off the rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Real APR Matters More Than the Rate in the Ad</h2>
        <p style={pStyle}>
          A lender's advertised interest rate and what the loan really costs are often two different numbers. Most
          consolidation loans come with an upfront fee, usually called an origination fee or sometimes "points." It's
          commonly somewhere between 1% and 8% of the loan amount, and it's typically taken out of the money you
          receive.
        </p>
        <p style={pStyle}>
          Here's what that does. Say you borrow $10,000 for 36 months at 11% interest with a 5% fee. The lender keeps
          $500, so you only get $9,500, but your payment is still based on the full $10,000. That's about $327 a
          month. Once you account for the fact that you only got $9,500 to work with, the loan's real cost is closer
          to 14.5% APR, not 11%.
        </p>
        <p style={pStyle}>
          That's why comparing APR to APR matters, and why the calculator factors in fees. If you compared the 11%
          headline rate to a credit card charging 13%, the loan would look like a win. At 14.5% real cost, it isn't.
        </p>
        <p style={pStyle}>
          The same thing works in reverse on the debts you already have. Your cards probably carry different APRs, so
          the number to beat is your blended rate, which is each APR weighted by its balance. A $6,000 balance at 25%
          matters way more than a $500 balance at 30%. If the loan's real APR comes in clearly under that blended
          number, there's real money to save. If it's only a point or two lower, fees and a longer term can wipe it
          out fast.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Fees can also flip an otherwise good deal. A loan that's clearly worth it with a 5% fee can turn into a
          money-loser at 15%, because you're paying so much just to get in the door. Always plug the real fee in, not
          zero.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example</h2>
        <p style={pStyle}>Say you've got three debts:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Credit card A: $6,000 at 24.99% APR</li>
          <li style={liStyle}>Credit card B: $3,500 at 21.5% APR</li>
          <li>Store card: $1,500 at 29.99% APR</li>
        </ul>
        <p style={pStyle}>
          That's $11,000 total, with a blended APR of about 24.6%. If you're paying around $330 a month across all
          three, you'll need roughly 57 months to clear everything and pay about $7,700 in interest along the way.
        </p>
        <p style={pStyle}>
          Now compare a 48-month fixed-rate loan for $11,000 at 12.9% APR. Your payment lands around $295, total
          interest is about $3,140, and you're done nine months sooner. You pay less per month, finish earlier, and
          keep around $4,500 in your pocket.
        </p>
        <p style={pStyle}>
          Add a 5% origination fee, which is $550, and the loan still comes out ahead. Now change the offer to 72
          months at 21% with a 6% fee. The payment drops to about $270, which looks great on paper, but you'd pay
          roughly $8,400 in interest plus another $660 in fees. That's more than the $7,700 your cards would have cost
          you. Same debts, different loans, opposite answer.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These are rounded estimates for illustration. Plug your own debts into the calculator for exact figures.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Consolidate Debt (and What Each One Costs)</h2>
        <p style={pStyle}>
          Not every consolidation looks like a traditional loan. Here's how the common routes compare so you know what
          terms to test.
        </p>
        <DataTable headers={OPTION_HEADERS} rows={OPTION_ROWS} />
        <p style={pStyle}>
          <strong>Secured versus unsecured.</strong> Home equity loans, HELOCs, and cash-out refinances are secured,
          meaning the loan is tied to something you own, usually your house. That makes them less risky for the
          lender, which is why the rates are lower. Personal loans and balance transfer cards are unsecured. They
          usually cost more and have lower limits, but there's nothing to lose except your credit if things go wrong.
        </p>
        <p style={pStyle}>
          That difference is worth taking seriously. Credit card debt that you can't pay is a credit problem. Credit
          card debt moved into a home equity loan, and then not paid, can become a foreclosure problem. You've taken a
          debt with no collateral and attached your house to it. Lower interest is nice, but make sure the trade is
          worth it.
        </p>
        <p style={pStyle}>
          A couple of other things people overlook. Interest on a home equity loan is generally only tax deductible
          when the money goes toward buying, building, or improving the home, so using it to pay off cards usually
          doesn't qualify. And borrowing from a 401(k) to pay off debt is a different animal altogether. You'd be
          giving up investment growth, and if you leave your job, the balance can come due quickly. Most people are
          better off looking elsewhere first.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Balance transfer cards deserve a quick mention. They can be the cheapest option on this list, but only if
          you actually clear the balance before the promotional rate ends. Run the transfer fee through the calculator
          as a loan fee. Then ask yourself honestly whether you can pay it off in time at the monthly payment you'd
          need. If you can't, the standard rate on what's left can be steep.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Debt Consolidation Loan vs. Personal Loan</h2>
        <p style={pStyle}>
          There's really not much of a difference. A debt consolidation loan is a personal loan that you use to pay
          off other debts. Some lenders market them under that name and send the money straight to your creditors,
          which saves you from having to do it yourself. Others just deposit the money into your account.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Either way, the terms come from the same things: your credit score, your credit history, your income, and
          how much you're borrowing. What you want is a low rate, a repayment period that's comfortable for your
          budget, and as few fees as possible. Banks, credit unions, and online lenders all offer them, and credit
          unions in particular tend to be worth checking because their rates are often competitive.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When Consolidation Makes Sense</h2>
        <p style={pStyle}>Consolidating tends to pay off when most of these are true:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Your balances carry high interest.</strong> If your cards are charging in the 20s and you can
            qualify for a personal loan well below that, the savings add up quickly.
          </li>
          <li style={liStyle}>
            <strong>Your income covers your payments.</strong> If you're making your current payments on time, you're
            in the right spot to take advantage of consolidation.
          </li>
          <li style={liStyle}>
            <strong>Your credit is in decent shape.</strong> A better score gets you better offers. If your score is
            lower, the rates you're quoted may not beat what you're already paying.
          </li>
          <li style={liStyle}>
            <strong>Your debt load is manageable.</strong> A common rule of thumb is that your debts, not counting your
            mortgage, should be under about half your income. Lenders look at your debt-to-income ratio, and if it's
            too high, you may not get approved for the best terms.
          </li>
          <li style={liStyle}>
            <strong>Your payments are scattered.</strong> Five due dates a month means five chances to slip. One date,
            one payment makes life easier, and a missed payment can cost you a fee and a credit hit.
          </li>
          <li>
            <strong>You want a finish line.</strong> Minimum payments on credit cards can drag on for years. A
            fixed-term loan gives you an end date.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When It's Not Worth It</h2>
        <p style={pStyle}>
          Consolidation isn't the move for everyone, and sometimes the calculator will tell you so.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>You can pay it off soon anyway.</strong> If you're on track to clear your balances in the next 12
            to 18 months at your current pace, fees and a new credit inquiry may cost you more than you'd save.
          </li>
          <li style={liStyle}>
            <strong>The new rate is barely better.</strong> A one-point improvement rarely covers an origination fee.
          </li>
          <li style={liStyle}>
            <strong>The fees are high.</strong> Once fees climb into the double digits, even a lower rate usually
            can't make up for them.
          </li>
          <li style={liStyle}>
            <strong>The old habits are still there.</strong> If the cards you pay off start filling up again, you'll
            end up with the loan and new card debt. That's a worse spot than where you started.
          </li>
          <li>
            <strong>You'd have to stretch the term way out.</strong> A lower payment that costs thousands more over
            time isn't a savings.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your credit is rough or you're already behind, a lower-rate loan may not be available. A nonprofit credit
          counseling agency can look at your whole situation and might set you up with a debt management plan. Just
          be careful with companies that charge big upfront fees or promise to make your debt vanish. Real help
          doesn't start with a surprise bill.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Consolidation Does to Your Credit Score</h2>
        <p style={pStyle}>
          This one's a mixed bag, and anyone who tells you it's all good or all bad is skipping part of the story.
        </p>
        <p style={pStyle}>
          <strong>Short-term dip.</strong> When you apply for a loan, the lender runs a hard inquiry on your credit,
          which usually knocks your score down a few points. A new account also lowers the average age of your credit
          history. If you keep up with on-time payments, these effects tend to fade.
        </p>
        <p style={pStyle}>
          <strong>Utilization can help.</strong> Your credit utilization ratio compares how much revolving credit
          you're using to how much you have available. If you pay off your cards with a personal loan, your card
          balances drop, and so does your utilization. That usually helps your score. But if the lender views the new
          loan as risky, it can offset some of that benefit.
        </p>
        <p style={pStyle}>
          <strong>Payment history is the big one.</strong> A fixed loan with on-time payments builds positive
          history. A single late payment does the opposite.
        </p>
        <p style={pStyle}>
          Two tips: First, many lenders offer pre-qualification with a soft pull that doesn't affect your score, so
          use it to compare real offers before you apply anywhere. Second, if you do formal applications, do them
          close together. Scoring models generally treat multiple loan inquiries within a short window as one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And about those old credit cards: closing them can shrink your available credit and push your utilization
          back up. Many people do better leaving them open with a zero balance, and just keeping them out of the
          wallet.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fix the Real Problem First</h2>
        <p style={pStyle}>
          Consolidation can lower your costs, but it won't fix whatever got you into debt. For some people that's
          spending that quietly outran their income. For others it's a layoff, a medical bill, or income that never
          kept up with expenses. Those have different solutions: a tighter budget, a spending cap, a side income, or a
          conversation about a higher salary.
        </p>
        <p style={pStyle}>
          If you don't deal with that part, a consolidation loan just resets the clock. Sort out a budget first, even
          a rough one. Know what comes in, what goes out, and what's left. Then decide whether consolidating still
          makes sense.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's also worth knowing that consolidation isn't the only way to pay debt down smartly. With the avalanche
          method, you pay minimums on everything and throw extra money at the highest-APR debt first, which saves the
          most interest. With the snowball method, you attack the smallest balance first, which gives quicker wins and
          helps some people stay motivated. If the interest savings from consolidating are small, one of these may do
          about as well without any fees.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Simple Action Plan</h2>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>List everything you owe.</strong> Balance, APR, and minimum payment for each debt. Add them up.
          </li>
          <li style={liStyle}>
            <strong>Find your blended APR.</strong> Weight each rate by its balance. That's the number a new loan has
            to beat.
          </li>
          <li style={liStyle}>
            <strong>Pre-qualify with a few lenders.</strong> Use soft-pull tools so your score stays put. Get the APR
            and fee in writing.
          </li>
          <li style={liStyle}>
            <strong>Run each offer through the calculator.</strong> Compare total cost, not only the payment.
          </li>
          <li style={liStyle}>
            <strong>Read the fine print.</strong> Check for prepayment penalties, late fees, and whether the lender
            pays your creditors directly or sends the money to you.
          </li>
          <li style={liStyle}>
            <strong>Pay off the old accounts and confirm it.</strong> Keep making your normal payments until you see
            each balance hit zero.
          </li>
          <li>
            <strong>Stop the balances from coming back.</strong> Cut up the cards, freeze them, or take them out of
            your wallet. Set up autopay on the new loan.
          </li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mistakes That Cost People Money</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Comparing the lender's interest rate to your card APR, instead of real APR with fees.
          </li>
          <li style={liStyle}>Picking the loan with the lowest monthly payment without checking the total.</li>
          <li style={liStyle}>Skipping the fee because it's "just rolled in."</li>
          <li style={liStyle}>Going straight to a home equity loan without considering what's on the line.</li>
          <li style={liStyle}>Using the loan to clear the cards, then running the cards up again.</li>
          <li>Missing the first payment because the due date changed.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting the Most Accurate Results</h2>
        <p style={pStyle}>
          The calculator is only as good as the numbers you give it. Use today's balances, not last month's. Use the
          APR from your statements. Include every fee, and if you pay more than the minimum on your existing debts,
          enter that amount so the comparison reflects what you actually do.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The results are estimates based on standard loan math, meaning a fixed rate and equal monthly payments. Real
          loans can differ because of variable rates, daily interest, or fees the lender adds that you didn't know
          about. Treat the final loan agreement as the source of truth, and rerun the numbers once you have it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free and Private</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This debt consolidation calculator is free to use and doesn't require an account or signup. You don't need
          to enter your name, email, or any account numbers to get a result. The only things it needs are the
          balances, rates, and terms you type in.
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
