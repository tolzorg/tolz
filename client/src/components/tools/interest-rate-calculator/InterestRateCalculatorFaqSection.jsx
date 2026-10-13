import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the interest rate on a loan from the monthly payment?",
    a: "Enter the loan amount, the term, and the fixed monthly payment into the calculator. It solves the amortization formula for the rate and shows it as an annual percentage, along with total interest paid.",
  },
  {
    q: "Can I find the interest rate if I only know the payment, amount, and term?",
    a: "Yes. For a fixed-rate loan, those three numbers match exactly one rate, and the calculator finds it by testing rates until the payment lines up.",
  },
  {
    q: "How do I find the interest rate on my car loan?",
    a: "Use the amount financed, the number of payments, and the payment from your contract. If insurance or other add-ons are baked into the payment, take them out first so it's principal and interest only.",
  },
  {
    q: "What's the difference between an interest rate and APR?",
    a: "The interest rate is the cost of borrowing the principal. APR adds certain fees on top, so it's usually a bit higher and better for comparing loans.",
  },
  {
    q: "Is the result the same as APR?",
    a: "Not exactly. If you enter the money you actually received and your payment includes financed fees, the result will land closer to an APR than to the stated rate.",
  },
  {
    q: "How is total interest calculated?",
    a: "Multiply the monthly payment by the number of payments, then subtract the original loan amount. What's left is total interest.",
  },
  {
    q: "Why is the rate higher than what my lender told me?",
    a: "Usually it's financed fees, bundled add-ons, or rounding. Check whether your payment includes anything beyond principal and interest.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: "Simple interest is figured on the original principal only. Compound interest is figured on principal plus previously added interest, so it grows faster.",
  },
  {
    q: "What's the difference between fixed and variable rates?",
    a: "A fixed rate never changes over the life of the loan. A variable rate moves with a benchmark, so payments can rise or fall. This calculator is for fixed rates.",
  },
  {
    q: "What's a good interest rate?",
    a: "It depends on the loan type, your credit, the term, and market conditions. The best way to judge is to compare your rate against several current offers for the same kind of loan.",
  },
  {
    q: "What credit score gets the best interest rate?",
    a: "Scores above about 750 generally get the best pricing, though each lender sets its own cutoffs.",
  },
  {
    q: "Does applying for loans hurt my credit score?",
    a: "A hard inquiry can drop your score by a few points. Multiple inquiries for the same loan type within a short window are usually counted as one, so group your applications.",
  },
  {
    q: "Does the calculator work for mortgages?",
    a: "Yes, for fixed-rate mortgages, as long as you enter principal and interest only, without taxes, insurance, or PMI.",
  },
  {
    q: "Can it handle variable-rate loans?",
    a: "No. A variable rate changes over time, so one payment can't pin down a single rate.",
  },
  {
    q: "Is the interest rate calculator free?",
    a: "Yes, it's free to use on Tolz.",
  },
];

// Structured data uses the supplied schema, which covers a subset of the visible FAQs with slightly different wording.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How do I calculate the interest rate on a loan from the monthly payment?",
    a: "Enter the loan amount, the term, and the fixed monthly payment into the calculator. It solves the amortization formula for the rate and shows it as an annual percentage, along with total interest paid.",
  },
  {
    q: "Can I find the interest rate if I only know the payment, amount, and term?",
    a: "Yes. For a fixed-rate loan, those three numbers match exactly one rate, and the calculator finds it by testing rates until the payment lines up.",
  },
  {
    q: "How do I find the interest rate on my car loan?",
    a: "Use the amount financed, the number of payments, and the payment from your contract. If insurance or other add-ons are included in the payment, remove them first so it's principal and interest only.",
  },
  {
    q: "What's the difference between an interest rate and APR?",
    a: "The interest rate is the cost of borrowing the principal. APR adds certain fees on top, so it's usually a bit higher and better for comparing loans.",
  },
  {
    q: "How is total interest calculated?",
    a: "Multiply the monthly payment by the number of payments, then subtract the original loan amount. What's left is total interest.",
  },
  {
    q: "Why is the rate higher than what my lender told me?",
    a: "Usually it's financed fees, bundled add-ons like insurance or warranties, or rounding. Check whether your payment includes anything beyond principal and interest.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: "Simple interest is figured on the original principal only. Compound interest is figured on principal plus previously added interest, so it grows faster.",
  },
  {
    q: "What's the difference between fixed and variable interest rates?",
    a: "A fixed rate never changes over the life of the loan. A variable rate moves with a benchmark, so payments can rise or fall. This calculator is for fixed-rate loans.",
  },
  {
    q: "What credit score gets the best interest rate?",
    a: "Scores above about 750 generally get the best pricing, though each lender sets its own cutoffs.",
  },
  {
    q: "Does applying for loans hurt my credit score?",
    a: "A hard inquiry can drop your score by a few points. Multiple inquiries for the same loan type within a short window are usually counted as one, so it helps to group applications together.",
  },
  {
    q: "Does the calculator work for mortgages?",
    a: "Yes, for fixed-rate mortgages, as long as you enter principal and interest only, without taxes, insurance, or PMI.",
  },
  {
    q: "Can it handle variable-rate loans?",
    a: "No. A variable rate changes over time, so one payment can't pin down a single rate.",
  },
  {
    q: "Is the interest rate calculator free?",
    a: "Yes, it's free to use on Tolz.",
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

export default function InterestRateCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Interest Rate Calculator Does</h2>
        <p style={pStyle}>
          Most loan calculators go in one direction. You type in a rate and get a payment. This one runs backward. You
          give it the payment, and it gives you the rate.
        </p>
        <p style={pStyle}>
          That's useful because the monthly payment is the number lenders like to talk about. A payment can look
          friendly while the rate behind it isn't. Stretch a loan out long enough and almost any payment will look
          affordable, so the payment alone tells you very little about what the loan costs.
        </p>
        <p style={pStyle}>Under the hood, it uses the standard formula for a fixed-rate loan with level payments:</p>
        <div style={formulaStyle}>Payment = Loan × r ÷ (1 − (1 + r)^−n)</div>
        <p style={pStyle}>
          Here r is the monthly rate and n is the number of payments. The catch is that you can't rearrange that formula
          to get r by itself. So the calculator does what a spreadsheet's rate function does: it guesses a rate, checks
          what payment that rate would produce, compares it to your real payment, and keeps adjusting until the two line
          up. You get the answer without doing any of the trial and error.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once it has the rate, it adds up what you'll pay. Monthly payment times the number of months gives you total
          repayment. Subtract what you borrowed, and what's left is total interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Interest Rate Calculator</h2>
        <p style={pStyle}>
          You need three numbers, and they're all normally on your loan agreement, your quote, or your lender's online
          account page.
        </p>
        <p style={pStyle}>
          <strong>Loan amount.</strong> This is the principal, the money you actually borrowed. Not the total you'll
          repay.
        </p>
        <p style={pStyle}>
          <strong>Loan term.</strong> How long you're paying. Five years is 60 months, six years is 72, and so on. Just
          keep the units consistent with what the tool asks for.
        </p>
        <p style={pStyle}>
          <strong>Monthly payment.</strong> The fixed amount you pay each month, covering principal and interest only.
          If your payment includes insurance, property taxes, or an add-on product, take those out first.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hit calculate and you'll see the annual interest rate plus total interest paid. If the rate looks way off,
          double-check the inputs. The usual culprits are a payment that includes escrow or insurance, or a term entered
          in years when the box wanted months.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Examples</h2>
        <p style={pStyle}>Numbers explain this better than a formula does, so here are three situations.</p>
        <p style={pStyle}>
          <strong>A personal loan with no stated rate.</strong> You're offered $25,000, repaid over 60 months at about
          $495.05 a month. The paperwork talks about "affordable payments" and never mentions a rate. Plug it in and the
          calculator returns roughly 7%. Over 60 payments you'd repay about $29,703, so you'd pay around $4,703 in
          interest.
        </p>
        <p style={pStyle}>
          <strong>A dealer who only talks about the payment.</strong> A dealer offers $28,000 for a car over 72 months
          at $450 a month. The implied rate comes out just under 5%, and total repayment is $32,400, so about $4,400 is
          interest. That's a reasonable deal, but you only know that because you checked. The same $450 payment on a
          different loan could hide a much higher rate.
        </p>
        <p style={pStyle}>
          <strong>What a longer term really costs.</strong> Say you're borrowing $30,000 at 6%. Over 60 months the
          payment is about $580, and you'd pay roughly $4,799 in interest. Stretch it to 84 months and the payment drops
          to about $438, which feels like a win, but the interest climbs to roughly $6,809. That's about $2,000 more for
          the same loan at the same rate. Seeing both outcomes next to each other is the best argument for running the
          numbers before you sign.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more trick worth knowing. If you want a quick gut check before using any tool, divide total interest by
          the loan amount times the number of years. That gives you what's called the add-on rate. For most typical loan
          terms, the true annual rate is roughly 1.8 to 1.9 times that number. In the first example, $4,703 ÷ ($25,000 ×
          5) is about 3.8%, and multiplying by 1.86 lands you right around 7%. It's only an estimate, but it's a handy
          way to spot a quote that doesn't add up.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Interest Rate Basics</h2>
        <p style={pStyle}>
          If you just need the number, you can skip this part. If you want to understand what you're looking at, here's
          the short version.
        </p>

        <h3 style={h3Style}>What an interest rate is</h3>
        <p style={pStyle}>
          An interest rate is what a lender charges you for using their money, expressed as a percentage of the amount
          borrowed. Borrow $100 at 8% for a year and you owe $108 at the end. The rate is the cost of borrowing, and it
          directly drives how much interest you pay on any loan.
        </p>
        <p style={pStyle}>
          Borrowers want it low. Lenders and investors want it higher. Most rates are quoted per year, but they can also
          be stated monthly or daily, which is why you'll sometimes see a credit card quote a daily periodic rate in the
          fine print.
        </p>
        <p style={pStyle}>
          Rates show up in almost every kind of lending: mortgages, auto loans, credit cards, business loans, student
          loans, even the early-payment discount a supplier offers on an invoice. They also work on the other side of
          the table. Your savings account and retirement funds grow because someone else is paying interest to you.
        </p>

        <h3 style={h3Style}>Simple vs. compound interest</h3>
        <p style={pStyle}>
          Simple interest is calculated only on the original principal. Compound interest is calculated on the principal
          plus any interest that's already been added. The result is interest earning interest, and the more often it
          compounds, the more you end up with (or owe).
        </p>
        <p style={pStyle}>
          Nearly all modern loans use compounding or a monthly interest accrual, and that's what this calculator
          assumes. A quick example of why it matters: a 7% nominal rate compounded monthly works out to an effective
          annual rate of about 7.23%. Small difference, but it adds up on bigger and longer loans.
        </p>
        <p style={pStyle}>
          A side note on car loans. Most are simple-interest loans, meaning interest accrues daily on the balance you
          still owe. That's good news if you pay early or send extra, because the interest stops growing on whatever
          you've already paid off. It also means a payment that arrives a few days late can cost you slightly more.
        </p>

        <h3 style={h3Style}>Fixed vs. variable rates</h3>
        <p style={pStyle}>
          A fixed rate stays the same for the whole loan. A variable rate moves over time, usually tied to some benchmark
          or index, so your payment can go up or down. Each has trade-offs. Fixed gives you predictable payments, while
          variable often starts lower but carries the risk of rising.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool only handles fixed-rate loans. With a variable rate, one payment can't tell you the rate because the
          rate keeps changing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>APR vs. Interest Rate vs. APY</h2>
        <p style={pStyle}>These three get mixed up constantly, and the difference matters.</p>
        <p style={pStyle}>
          <strong>Interest rate</strong> is the basic cost of borrowing the principal.
        </p>
        <p style={pStyle}>
          <strong>APR (annual percentage rate)</strong> is the interest rate plus certain fees rolled in, such as
          origination or administrative fees. That's why APR is usually a little higher than the plain rate, and why
          it's the better number for comparing loans. In the U.S., lenders are generally required to show you the APR in
          their loan disclosures under the Truth in Lending rules, so look for it on your paperwork.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>APY (annual percentage yield)</strong> is the one you see on savings accounts and CDs. It's what you
          earn, not what you pay, and it includes the effect of compounding.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Your Result May Not Match the Advertised Rate</h2>
        <p style={pStyle}>
          Sometimes the calculator gives you a rate that's higher than the one you were quoted. Don't assume something's
          broken. There are usually a few explanations.
        </p>
        <p style={pStyle}>
          <strong>Fees rolled into the loan.</strong> Say you're quoted 6% on a $20,000 loan, and a $1,000 fee gets
          financed into the balance. Now you're paying $21,000 at 6%, which makes the payment about $406 a month for 60
          months. But you only received $20,000 in real money. If you type $20,000 and $406 into the calculator, it
          returns a bit over 8%. That's the actual cost of the money you walked away with, and it's why APR exists.
        </p>
        <p style={pStyle}>
          <strong>Add-ons inside the payment.</strong> Credit insurance, GAP coverage, extended warranties, and similar
          products can be folded into the loan. The calculator can't tell them apart from principal and interest, so the
          rate looks inflated. Ask for the payment to be broken down, or remove the add-ons from the amount before you
          test it.
        </p>
        <p style={pStyle}>
          <strong>Rounding.</strong> Lenders round payments to the cent, and that can nudge the implied rate by a
          hundredth of a percent or so. That's normal.
        </p>
        <p style={pStyle}>
          <strong>Mortgage extras.</strong> Many mortgage payments include escrow for taxes and insurance, and sometimes
          PMI. Only the principal-and-interest portion belongs in this tool.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Odd payment schedules.</strong> Biweekly payments, skipped months, or interest-only periods don't fit
          the level monthly model.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Drives Interest Rates</h2>
        <p style={pStyle}>
          Some of what sets your rate you can't touch. Some of it you can. It helps to know which is which.
        </p>

        <h3 style={h3Style}>Things outside your control</h3>
        <p style={pStyle}>
          <strong>Monetary policy and inflation.</strong> In most developed countries, central banks steer rates. In the
          U.S. that's the Federal Reserve, which sets its target rate at scheduled Federal Open Market Committee
          meetings, eight of them a year. A big part of the job is keeping inflation steady, meaning prices don't rise
          too fast and the purchasing power of money doesn't fall apart. Rate changes and inflation push on each other.
          Higher rates tend to cool inflation, and rising inflation tends to push rates up.
        </p>
        <p style={pStyle}>
          Worth knowing: the Fed's rate doesn't directly set your auto loan or mortgage rate. It sets the tone for
          short-term borrowing, and lenders price their own products off that, plus things like Treasury yields for
          mortgages. So loan rates tend to follow the Fed, but not in lockstep.
        </p>
        <p style={pStyle}>
          <strong>Economic activity.</strong> When rates drop, borrowing gets cheaper, so businesses expand and people
          buy homes and cars. That leads to jobs, higher pay, and more spending. When rates rise, borrowing slows.
          Central banks lean on this, cutting rates when the economy is sluggish and raising them when it's running too
          hot.
        </p>
        <p style={pStyle}>
          <strong>Unemployment.</strong> High unemployment means people spend less and growth slows, so rates tend to be
          pushed down to encourage spending. When unemployment is very low, wages rise quickly and inflation can heat up,
          which pushes rates higher.
        </p>
        <p style={pStyle}>
          <strong>Supply and demand for credit.</strong> If demand for loans is strong, lenders can charge more. If it's
          weak, they cut rates to attract borrowers. Banks and credit unions also have limits on how much they can lend at
          a given time, which affects pricing.
        </p>

        <h3 style={h3Style}>Things you can influence</h3>
        <p style={pStyle}>
          <strong>Your credit standing.</strong> This is the big one. In the U.S., a credit score generally runs from 300
          to 850, and the average is a bit above 700. Lenders use it to judge how risky you are. Scores above roughly 750
          usually qualify for the best rates, while scores below the mid-600s often mean noticeably higher ones, or a
          denial.
        </p>
        <p style={pStyle}>
          Payment history carries the most weight. Credit utilization, meaning how much of your revolving credit you're
          using, comes next. Keeping card balances well under 30% of your limits helps, and lower is better. Late
          payments, collections, and bankruptcy hurt, and they can stick around for years.
        </p>
        <p style={pStyle}>
          Lenders also reprice existing credit. A credit card issuer can raise your rate if you start missing payments.
        </p>
        <p style={pStyle}>
          <strong>Secured vs. unsecured.</strong> A secured loan is backed by collateral, like a car or a house. If you
          default, the lender can take it. Because of that safety net, secured loans usually carry lower rates than
          unsecured ones. Personal loans and credit cards, with nothing backing them, typically cost more.
        </p>
        <p style={pStyle}>
          <strong>Loan structure.</strong> A longer term is riskier for the lender, so it can come with a higher rate. A
          very small down payment can have the same effect. A bigger down payment and a shorter term often get you a
          better rate, and they cut total interest on top of that.
        </p>
        <p style={pStyle}>
          <strong>How often you apply.</strong> Each formal application typically triggers a hard inquiry, which can
          shave a few points off your score. Don't let that scare you off from shopping around, though. Scoring models
          generally treat multiple inquiries for the same type of loan within a short window as a single event. The
          window varies, from about 14 days up to 45 depending on the scoring model, so if you're comparing car or
          mortgage lenders, bunch your applications together instead of spreading them over months.
        </p>
        <p style={pStyle}>
          <strong>Timing.</strong> You can't control the economy, but you can sometimes choose when to borrow. If you're
          not in a rush, waiting out a period of high rates can pay off.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Shopping and negotiating.</strong> Lenders price differently. Banks, credit unions, and online lenders
          can come in with different rates for the same borrower. Credit unions are worth a look since they're often
          cheaper on auto loans. Getting a pre-approval from your bank before you walk into a dealership gives you
          something to compare against, and it takes away the dealer's ability to hide a high rate behind a payment. And
          yes, telling a lender you've got a better offer elsewhere is fair game. Just read the conditions and check for
          extra costs like fees or prepayment penalties.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Real vs. Nominal Interest Rates</h2>
        <p style={pStyle}>
          The rate on your loan is the nominal rate. The real rate is what's left after you subtract inflation. The basic
          relationship is:
        </p>
        <div style={formulaStyle}>real rate + inflation = nominal rate</div>
        <p style={pStyle}>
          So a 7% loan when inflation is 3% has a real cost of roughly 4%. Done precisely, it's closer to 3.9%, since the
          proper formula is (1 + nominal) ÷ (1 + inflation) − 1, but the simple subtraction is good enough for most
          purposes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Why does this matter to a borrower? When inflation is high, the money you pay back later is worth less than the
          money you borrowed, which is why borrowing can feel cheaper in real terms during inflationary periods. It's also
          why lenders push nominal rates up when inflation rises. They want a real return after inflation takes its bite.
          The calculator on this page shows the nominal rate, which is the number on your contract.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use an Interest Rate Calculator</h2>
        <p style={pStyle}>
          <strong>Checking a car loan quote.</strong> The classic case. Dealers love negotiating the monthly payment.
          Give the calculator the price, the term, and the payment, and you'll know if the financing is competitive.
        </p>
        <p style={pStyle}>
          <strong>Comparing offers with different terms.</strong> One lender offers a lower payment over 84 months,
          another a higher payment over 48. Converting each to a rate and total interest puts them on equal ground.
        </p>
        <p style={pStyle}>
          <strong>Verifying a verbal quote.</strong> A loan officer said "around six percent," but the payment looks
          high. This tells you whether the two agree.
        </p>
        <p style={pStyle}>
          <strong>Figuring out an existing loan.</strong> You inherited a loan, took over someone's payments, or lost the
          original paperwork. With the current balance, remaining months, and payment, you can recover the rate. Just use
          the remaining balance as the loan amount and the months left as the term.
        </p>
        <p style={pStyle}>
          <strong>Buy-now-pay-later and store financing.</strong> "Only $60 a month" can hide serious interest. Enter
          the item price, the number of payments, and the payment to see what you're paying.
        </p>
        <p style={pStyle}>
          <strong>Private and family loans.</strong> If a loan between people is documented as an amount and a schedule,
          the calculator shows the rate it implies. That's handy for keeping records and for tax reasons, since the IRS
          can treat loans that charge too little interest as having imputed interest.
        </p>
        <p style={pStyle}>
          <strong>Business equipment financing.</strong> Equipment leases and financing deals often quote only a
          payment. Same trick applies.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Learning how amortization works.</strong> Change one input at a time and watch how the rate and total
          interest move. It's a faster way to learn than reading a textbook.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Your Results</h2>
        <p style={pStyle}>You get two numbers, and they answer different questions.</p>
        <p style={pStyle}>
          <strong>The implied rate</strong> is the annual cost of borrowing as a percentage. Use it to compare offers,
          because it doesn't change with loan length.
        </p>
        <p style={pStyle}>
          <strong>Total interest paid</strong> is what that rate costs in dollars. A moderate rate on a long loan can
          cost more than a higher rate on a short one. Judging a loan on the payment alone is how people end up paying
          thousands more than they planned to.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Try this: run the same loan at a few different terms, adjusting the payment to match each one. You'll see the
          payment shrink and the total interest grow as the term gets longer. That's the trade almost every borrower is
          making, whether they realize it or not.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Pay Less Interest</h2>
        <p style={pStyle}>Once you know your rate, you can do something about it.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Shorten the term</strong> if the higher payment fits your budget. It's the most reliable way to cut
            total interest.
          </li>
          <li style={liStyle}>
            <strong>Raise your credit score</strong> before applying. Pay down card balances, fix errors on your credit
            reports, and avoid new accounts for a few months beforehand.
          </li>
          <li style={liStyle}>
            <strong>Put more money down.</strong> A bigger down payment lowers the amount financed and can lower the
            rate.
          </li>
          <li style={liStyle}>
            <strong>Compare at least three lenders</strong> and run each quote through the calculator so you're comparing
            rates, not payments.
          </li>
          <li style={liStyle}>
            <strong>Pay extra toward principal</strong> when you can. Make sure your lender applies it to principal and
            doesn't charge a prepayment penalty.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Look at refinancing</strong> if your implied rate is high and your credit has improved. Weigh the new
            rate and any closing costs against what you'd save over the remaining term.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, and What It Can't Do</h2>
        <p style={pStyle}>
          The interest rate calculator is free. It only asks for three figures about a loan: the amount, the term, and
          the payment. It doesn't need your name, account number, or Social Security number, and none of that helps get
          a result.
        </p>
        <p style={pStyle}>
          On accuracy, it uses the same fixed-rate amortization math banks and finance textbooks use, solved
          numerically, so you'll get the same answer a spreadsheet's rate function would give with identical inputs.
          It's a tool for checking and comparing. Your lender's loan disclosure is still the official word on your actual
          terms, and if the two disagree, that's a reason to ask questions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's what it won't do. It won't handle variable-rate loans, interest-only periods, balloon payments, or loans
          with irregular extra payments. It also isn't meant for credit cards, since card balances and payments change
          every month.
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
