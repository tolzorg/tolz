import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the simple interest formula?",
    a: "I = P × r × t, where P is the principal, r is the annual rate as a decimal, and t is the time in years. The end balance is A = P(1 + rt).",
  },
  {
    q: "How do I calculate simple interest on a loan?",
    a: "Convert the rate to a decimal, convert the term to years, and multiply the three together. For a $2,000 loan at 7% for 2 years, interest is $2,000 × 0.07 × 2 = $280, so you'd repay $2,280.",
  },
  {
    q: "What's the difference between I = Prt and I = Prn?",
    a: "Prt uses an annual rate and time in years. Prn uses a rate per period and a number of periods, like a monthly rate over 8 months. They give the same result when the units are consistent.",
  },
  {
    q: "Can I calculate simple interest for months or days?",
    a: "Yes. Divide months by 12 or days by 365 to get years, or use the Prn version with a monthly or daily rate. If your loan uses a 360-day year, divide by 360 instead.",
  },
  {
    q: "Can the calculator find the interest rate?",
    a: "Yes. With the principal, interest, and term, it uses r = I ÷ (P × t). That's helpful for loans advertised with a flat fee.",
  },
  {
    q: "Can it find the principal or the time?",
    a: "Yes. P = I ÷ (r × t) and t = I ÷ (P × r). Choose which value to solve for and enter the rest.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: "Simple interest is calculated on the principal only. Compound interest is calculated on the principal plus all the interest that has already built up, so balances grow faster.",
  },
  {
    q: "Is simple interest better for borrowers or savers?",
    a: "Borrowers generally come out ahead with simple interest, since total cost stays lower. Savers generally come out ahead with compounding.",
  },
  {
    q: "Do car loans use simple interest?",
    a: "Many do, but \"simple interest\" on a car loan usually means interest accrues daily on your remaining balance. That's different from applying I = Prt to the full original amount for the full term.",
  },
  {
    q: "Do credit cards use simple interest?",
    a: "Almost never. Most cards compute interest daily on your balance and compound it, so a simple interest estimate will come in low.",
  },
  {
    q: "How do I calculate interest on an interest-only loan?",
    a: "Multiply the principal by the annual rate and divide by 12. On $50,000 at 6%, the monthly payment is $250.",
  },
  {
    q: "How long does it take to double money with simple interest?",
    a: "Divide 1 by the rate as a decimal. At 5%, it's 20 years. With annual compounding at the same rate, it's about 14.4 years.",
  },
  {
    q: "Why does a \"flat rate\" loan cost more than the rate suggests?",
    a: "Because interest is figured on the original amount for the whole term, but you're repaying in installments and holding less of the money as time goes on. A flat 5% over three years with monthly payments works out to an APR near 9.3%.",
  },
  {
    q: "Does the calculator show a schedule and chart?",
    a: "Yes. You get a period-by-period schedule and a growth chart, along with the calculation steps.",
  },
  {
    q: "Is this calculator free?",
    a: "Yes, it's free to use online.",
  },
  {
    q: "How accurate is it?",
    a: "It uses the standard formula, so it matches a correct manual calculation. Actual loan figures can differ if your lender adds fees or uses a different day-count method.",
  },
];

// Structured data uses the supplied schema wording, which differs slightly from the visible FAQ text.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "What is the simple interest formula?",
    a: "I = P × r × t, where P is the principal, r is the annual rate as a decimal, and t is the time in years. The end balance is A = P(1 + rt).",
  },
  {
    q: "How do I calculate simple interest on a loan?",
    a: "Convert the rate to a decimal, convert the term to years, and multiply the three together. For a $2,000 loan at 7% for 2 years, interest is $280, so you would repay $2,280.",
  },
  {
    q: "What's the difference between I = Prt and I = Prn?",
    a: "Prt uses an annual rate and time in years. Prn uses a rate per period and a number of periods, such as a monthly rate over 8 months. Both give the same result when the units are consistent.",
  },
  {
    q: "Can I calculate simple interest for months or days?",
    a: "Yes. Divide months by 12 or days by 365 to get years, or use the Prn version with a monthly or daily rate. If your loan uses a 360-day year, divide by 360 instead.",
  },
  {
    q: "Can the calculator find the interest rate?",
    a: "Yes. With the principal, interest, and term, it uses r = I ÷ (P × t). This is useful for loans advertised with a flat fee.",
  },
  {
    q: "Can it find the principal or the time?",
    a: "Yes. Principal is I ÷ (r × t) and time is I ÷ (P × r). Choose which value to solve for and enter the rest.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: "Simple interest is calculated on the principal only. Compound interest is calculated on the principal plus previously accumulated interest, so balances grow faster.",
  },
  {
    q: "Is simple interest better for borrowers or savers?",
    a: "Borrowers generally come out ahead with simple interest because total cost stays lower. Savers generally come out ahead with compounding.",
  },
  {
    q: "Do car loans use simple interest?",
    a: "Many do, but on a car loan the term usually means interest accrues daily on the remaining balance. That is different from applying I = Prt to the full original amount for the whole term.",
  },
  {
    q: "Do credit cards use simple interest?",
    a: "Almost never. Most cards calculate interest daily on your balance and compound it, so a simple interest estimate will come in low.",
  },
  {
    q: "How do I calculate interest on an interest-only loan?",
    a: "Multiply the principal by the annual rate and divide by 12. On $50,000 at 6%, the monthly payment is $250.",
  },
  {
    q: "How long does it take to double money with simple interest?",
    a: "Divide 1 by the rate as a decimal. At 5%, it takes 20 years. With annual compounding at the same rate, it takes about 14.4 years.",
  },
  {
    q: "Why does a flat rate loan cost more than the rate suggests?",
    a: "Interest is figured on the original amount for the whole term, but you repay in installments and hold less of the money over time. A flat 5% over three years with monthly payments works out to an APR near 9.3%.",
  },
  {
    q: "Does the calculator show a schedule and chart?",
    a: "Yes. It shows a period-by-period schedule and a growth chart, along with the calculation steps.",
  },
  {
    q: "Is this simple interest calculator free?",
    a: "Yes, it is free to use online.",
  },
  {
    q: "How accurate is the result?",
    a: "It uses the standard simple interest formula, so it matches a correct manual calculation. Actual loan figures can differ if your lender adds fees or uses a different day-count method.",
  },
];

const SCHEDULE_HEADERS = ["Year", "Interest earned", "Cumulative interest", "Balance"];
const SCHEDULE_ROWS = [
  ["1", "$300", "$300", "$5,300"],
  ["2", "$300", "$600", "$5,600"],
  ["3", "$300", "$900", "$5,900"],
];

const COMPARE_HEADERS = ["Years", "Simple interest balance", "Compound balance", "Difference"];
const COMPARE_ROWS = [
  ["1", "$10,500", "$10,500", "$0"],
  ["5", "$12,500", "$12,763", "$263"],
  ["10", "$15,000", "$16,289", "$1,289"],
  ["20", "$20,000", "$26,533", "$6,533"],
  ["30", "$25,000", "$43,219", "$18,219"],
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

export default function SimpleInterestCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Does a Simple Interest Calculator Do?</h2>
        <p style={pStyle}>
          It applies one rule: interest is figured on the original amount only. It never gets figured on interest
          you've already earned or been charged. If you borrow or invest $5,000 at 6% a year, that's $300 every year.
          Year one, year five, doesn't matter.
        </p>
        <p style={pStyle}>Here are the pieces the calculator works with:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Principal (P):</strong> the starting amount, either what you borrowed or what you put in.
          </li>
          <li style={liStyle}>
            <strong>Interest rate (r):</strong> the percentage charged or earned, usually quoted per year.
          </li>
          <li style={liStyle}>
            <strong>Term (t):</strong> how long the money is borrowed or invested.
          </li>
          <li style={liStyle}>
            <strong>Interest (I):</strong> the total interest over the whole term.
          </li>
          <li style={liStyle}>
            <strong>End balance (A):</strong> principal plus interest. For a loan, that's what you owe at the end. For a
            deposit, it's what you walk away with.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Normally you'd need a different version of the formula depending on what you're missing. The calculator
          handles all of them in one place, so you don't have to rearrange anything yourself.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Simple Interest?</h2>
        <p style={pStyle}>
          Interest is just the price of using someone else's money. If you borrow, you pay it. If you lend, or put money
          in a bank (which is really lending to the bank), you earn it. Car loans, credit cards, savings accounts, CDs,
          and bonds all work this way. What differs is how the interest gets calculated.
        </p>
        <p style={pStyle}>
          With simple interest, the rate is applied to the original principal and nothing else. In most cases the rate is
          a fixed percentage for the whole term. It doesn't matter how often you calculate it, monthly, daily, or once a
          year, because the base never grows. Interest from earlier periods doesn't get added to the amount that earns
          interest later.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That's the whole concept, and it's why simple interest is so easy to predict. The interest for period 10 is
          exactly the same as the interest for period 1.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Simple Interest Formula: I = Prt</h2>
        <p style={pStyle}>The standard formula is:</p>
        <div style={formulaStyle}>I = P × r × t</div>
        <ul style={listGapStyle}>
          <li style={liStyle}>I is the total interest</li>
          <li style={liStyle}>P is the principal</li>
          <li style={liStyle}>r is the annual rate as a decimal (6% = 0.06)</li>
          <li style={liStyle}>t is the time in years</li>
        </ul>
        <p style={pStyle}>To get the end balance, add the interest back to the principal:</p>
        <div style={formulaStyle}>A = P + I = P(1 + rt)</div>
        <p style={pStyle}>
          Say you borrow $10,000 at 5% for five years. Multiply $10,000 by 0.05 and you get $500 a year. Over five years
          that's $2,500 in interest, so you'd repay $12,500 in total.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The "t" is the part people trip on. It has to be in years. Six months is 0.5. Eighteen months is 1.5. Ninety
          days is about 0.2466 (90 ÷ 365). If you plug in a 6 for six months, you'll overstate your interest by a factor
          of twelve.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Other Version: I = Prn</h2>
        <p style={pStyle}>
          You'll sometimes see the formula written as I = P × r × n. It looks almost the same, but the letters mean
          something slightly different:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>r is the rate per period (per month, per week, per day)</li>
          <li style={liStyle}>n is the number of periods</li>
        </ul>
        <p style={pStyle}>
          This version is useful when the rate you're given isn't annual. Say a small lender charges 1.5% per month on a
          $2,000 loan for 8 months. You'd calculate $2,000 × 0.015 × 8 = $240. You never have to convert to years. As
          long as the rate and the number of periods use the same unit, it works.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both versions give the same answer. If you convert that 1.5% monthly rate to an annual 18% and the 8 months to
          0.6667 years, you land on $240 again. Use whichever one matches how the rate was quoted to you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Simple Interest Step by Step</h2>
        <p style={pStyle}>
          If you'd rather see the process than trust the answer, here's the order. It's also the order the calculator
          uses in its steps.
        </p>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Turn the rate into a decimal.</strong> Divide by 100. A 4.5% rate is 0.045.
          </li>
          <li style={liStyle}>
            <strong>Turn the term into years.</strong> Divide months by 12 and days by 365. Nine months is 0.75.
          </li>
          <li style={liStyle}>
            <strong>Multiply P × r × t.</strong> That's the total interest.
          </li>
          <li style={liStyle}>
            <strong>Add it to the principal.</strong> That's your end balance.
          </li>
        </ol>
        <p style={pStyle}>
          Try $10,000 at 8% for nine months. The term is 0.75 years, so interest is $10,000 × 0.08 × 0.75 = $600, and
          the end balance is $10,600.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want the yearly, monthly, or daily piece of that interest, just divide. For a $1,000 deposit at 5%, the
          yearly interest is $50. Divide by 12 and you get about $4.17 a month. Divide by 365 and you get about $0.14 a
          day. Run your own numbers by hand and compare them with the calculator's steps. If they don't match, the
          mismatch usually points straight to the mistake.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Solve for Principal, Rate, or Time</h2>
        <p style={pStyle}>
          This is where a good calculator saves you real time, because each missing variable needs a rearranged formula.
        </p>
        <p style={pStyle}>
          <strong>Finding the principal:</strong>
        </p>
        <div style={formulaStyle}>P = I ÷ (r × t)</div>
        <p style={pStyle}>
          Let's say you want your savings to earn $240 over 2 years at 4%. P = 240 ÷ (0.04 × 2) = $3,000. This is the
          one to use when you're working backward from an income goal. If you want $2,500 a month ($30,000 a year) from a
          simple-interest source paying 5%, you'd need $30,000 ÷ 0.05 = $600,000 sitting there.
        </p>
        <p style={pStyle}>
          <strong>Finding the rate:</strong>
        </p>
        <div style={formulaStyle}>r = I ÷ (P × t)</div>
        <p style={pStyle}>
          Suppose you borrowed $3,000 and the total interest came to $450 over 2.5 years. r = 450 ÷ (3,000 × 2.5) =
          0.06, or 6%. This one is great for decoding a loan where the lender quotes a flat dollar fee instead of a rate.
          Plug in the numbers and you'll see the rate you're really paying.
        </p>
        <p style={pStyle}>
          <strong>Finding the term:</strong>
        </p>
        <div style={formulaStyle}>t = I ÷ (P × r)</div>
        <p style={pStyle}>
          If $4,000 at 5% needs to earn $600, t = 600 ÷ (4,000 × 0.05) = 3 years. It tells you how long a deposit has
          to sit to hit a target.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter the three values you know, pick the one you want to solve for, and the calculator does the rearranging
          and shows the working.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading the Growth Chart and Full Schedule</h2>
        <p style={pStyle}>
          A single result doesn't show you how the money behaves over time, and that's what the chart and schedule are
          for.
        </p>
        <p style={pStyle}>
          Simple interest grows in a straight line. The chart's slope is fixed by your rate and principal, so a steeper
          line means more interest per period, and it never curves upward. If you ever put a simple interest chart next
          to a compound one, the difference is obvious: one's a ruler, the other's a ski jump.
        </p>
        <p style={pStyle}>The schedule gives you the same thing as a table. For $5,000 at 6% over three years:</p>
        <DataTable headers={SCHEDULE_HEADERS} rows={SCHEDULE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The interest column stays flat. That's the signature of simple interest, and if you ever look at a schedule
          where that column creeps up, you're looking at compounding.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Months, Days, and Why "365 vs. 360" Matters</h2>
        <p style={pStyle}>
          Real deals rarely last a neat number of years. A 90-day invoice, a six-month note, a 15-month deposit. All of
          them need converting before you use the formula.
        </p>
        <p style={pStyle}>
          Months are easy: divide by 12. Days are where it gets interesting, because there are two common conventions:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Actual/365:</strong> divide days by 365 (some use 366 in a leap year). This is the usual default for
            consumer loans and savings.
          </li>
          <li style={liStyle}>
            <strong>Actual/360 (the "banker's year"):</strong> divide days by 360. Many commercial loans, money market
            instruments, and some bonds use this.
          </li>
        </ul>
        <p style={pStyle}>
          The 360 version produces slightly more interest, because you're dividing by a smaller number. Take $10,000 at
          6% for 90 days:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>On 365 days: $10,000 × 0.06 × 90/365 = $147.95</li>
          <li style={liStyle}>On 360 days: $10,000 × 0.06 × 90/360 = $150.00</li>
        </ul>
        <p style={pStyle}>
          It's only a couple of dollars here, but on a $2 million commercial loan the gap gets real. If your loan
          agreement mentions a day-count convention, use that one. If it doesn't say, 365 is a safe assumption.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick daily number: $10,000 at 5% works out to $500 a year, or about $1.37 a day. That figure is handy for
          payoff quotes and for figuring out what a few days' delay costs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where Simple Interest Shows Up in Real Life</h2>
        <p style={pStyle}>
          Most everyday products use compounding, so it helps to know where simple interest actually lives.
        </p>
        <p style={pStyle}>
          <strong>Short-term and personal loans.</strong> Plenty of small, short-term loans, especially informal ones
          between family members or friends, use simple interest because it's easy to explain and write down.
        </p>
        <p style={pStyle}>
          <strong>Bonds and coupons.</strong> A bond that pays a fixed coupon is essentially paying simple interest on
          face value. You get the same payment every period. If you want that money to compound, you have to reinvest it
          yourself.
        </p>
        <p style={pStyle}>
          <strong>Car loans (with a catch).</strong> Lenders often call these "simple interest loans," but the phrase
          means something a little different. Interest accrues daily on the remaining balance, which shrinks as you pay.
          That's covered in the next section, because it affects how you use the calculator.
        </p>
        <p style={pStyle}>
          <strong>Federal student loans.</strong> In the U.S., federal student loans accrue simple daily interest: you
          divide the annual rate by the number of days in the year to get a daily rate, then apply it to your outstanding
          principal. On $30,000 at 6%, that's about $4.93 a day. The catch is that unpaid interest can be added to the
          principal in certain situations (that's called capitalization), and after that you're paying interest on a
          larger balance.
        </p>
        <p style={pStyle}>
          <strong>Business invoices.</strong> Sellers sometimes offer a discount for paying early, like a 2% discount if
          you pay within 10 days of a 30-day invoice (written "2/10 net 30"). It doesn't look like interest, but it works
          like one. You're paid 2% for paying 20 days sooner, which annualizes to roughly 37%. That's a better return
          than almost anything else you'll find, which is why businesses with spare cash often take early-payment
          discounts.
        </p>
        <p style={pStyle}>
          <strong>Short-term, high-cost loans.</strong> Payday-style loans are usually quoted as a flat fee. A $15 fee on
          a $100 loan for 14 days sounds small, but as a simple annual rate it's $15 ÷ $100 ÷ (14/365) = about 391%.
          Using the "solve for rate" feature with a term of 14 days makes that obvious in seconds.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Credit cards.</strong> The competitor example of simple interest on a card is a fine classroom
          exercise ($1,700 × 15% ÷ 12 = $21.25), but in practice most cards compute interest daily on your balance and
          compound it. Don't use a simple interest result to predict a card's true cost.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>"Simple Interest" Loans vs. the I = Prt Formula</h2>
        <p style={pStyle}>
          This one confuses a lot of people, and most calculator pages never mention it.
        </p>
        <p style={pStyle}>
          The formula I = Prt assumes the principal stays the same for the whole term. That's true if you pay everything
          back at once at the end, or if you pay interest only. It's not true on a typical installment loan, where every
          payment chips away at the balance and the interest drops along with it.
        </p>
        <p style={pStyle}>
          Here's why it matters. Say a lender offers $10,000 at a "flat 5%" for three years, repaid monthly. Interest
          calculated on the full $10,000 for 3 years is $1,500, so you'd repay $11,500, or about $319.44 a month. That
          sounds like 5%. But you're making payments every month, so you're not holding $10,000 for three years; you're
          holding less and less of it. The actual annual percentage rate on that deal works out to roughly 9.3%.
        </p>
        <p style={pStyle}>So there are two situations:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Flat or add-on interest:</strong> interest is figured once on the original principal and spread
            across payments. The calculator's result is accurate for the interest total, but the true APR is a lot higher
            than the quoted rate.
          </li>
          <li style={liStyle}>
            <strong>Daily simple interest on a declining balance:</strong> the lender charges interest only on what you
            still owe. Interest is lower than I = Prt on the original principal, and paying early saves you money.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When someone quotes you a "simple interest" loan, ask which one they mean. And if you only know the total
          interest and want the real cost, use the calculator to turn it into a rate, then remember that for an
          installment loan the effective rate is higher.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Simple Interest vs. Compound Interest</h2>
        <p style={pStyle}>
          With simple interest, only the principal earns. With compound interest, the interest also earns interest,
          because each period's interest is added to the balance before the next period's interest is calculated.
        </p>
        <p style={pStyle}>
          The compound formula is A = P(1 + r/n)^(nt), where n is how many times per year interest compounds (12 for
          monthly, 365 for daily).
        </p>
        <p style={pStyle}>
          Over one year, the two are basically the same. Over longer periods, they drift apart quickly. Here's $10,000
          at 5%, compounded annually:
        </p>
        <DataTable headers={COMPARE_HEADERS} rows={COMPARE_ROWS} />
        <p style={pStyle}>
          Compounding more often pushes the result up a bit more. At 5% compounded monthly, that same $10,000 over five
          years becomes $12,833.59, versus $12,500 on simple interest.
        </p>
        <p style={pStyle}>It cuts both ways:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>As a borrower,</strong> simple interest is cheaper. You owe less than you would on a compounded loan
            at the same rate.
          </li>
          <li style={liStyle}>
            <strong>As a saver or investor,</strong> compounding wins. Your balance grows faster.
          </li>
        </ul>
        <p style={pStyle}>
          A fun comparison is how long it takes money to double. With simple interest at a given rate, it's 1 ÷ r. At 5%,
          that's 20 years. With annual compounding at 5%, it's about 14.4 years (the "rule of 72" gives you a quick
          estimate: 72 ÷ 5 ≈ 14.4). Same rate, very different timelines.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your account or loan compounds, a simple interest result will understate what you'll really earn or owe, so
          check how yours works before you rely on the numbers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Interest-Only Loans and Perpetuities</h2>
        <p style={pStyle}>
          Some arrangements use simple interest in its purest form: you pay only the interest and the principal never
          changes.
        </p>
        <p style={pStyle}>
          On an interest-only loan, the monthly payment is just P × r ÷ 12. Borrow $50,000 at 6% and you'd pay $250 a
          month. That payment covers the cost of the loan and nothing else, so after 10 years you'd still owe the full
          $50,000. That's the difference between this and a mortgage or auto loan, where each payment also pays down some
          principal.
        </p>
        <p style={pStyle}>
          A perpetuity is the same idea taken to the limit: a payment stream that goes on forever, with the principal
          never touched. The formula is just the simple interest formula rearranged. To get $100,000 a year at a constant
          4%, you'd need $100,000 ÷ 0.04 = $2,500,000. Real perpetuities are rare today. The most famous were British
          "consols," government bonds that paid interest indefinitely, and the last of them were redeemed in 2015.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Compare that to leaving the money alone. A million dollars at 5% paid out as simple interest gives you $50,000 a
          year, forever, and you still have the million. If you let that interest compound for 100 years, you'd have
          around $131.5 million, but you'd have taken no income along the way. It's a good reminder that simple and
          compound interests aren't good or bad. They suit different goals.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use This Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Checking a loan offer before you sign, to see the total repayment.</li>
          <li style={liStyle}>Decoding flat fees by solving for the rate.</li>
          <li style={liStyle}>Estimating deposit or bond returns at maturity.</li>
          <li style={liStyle}>Planning a savings goal with the principal and term modes.</li>
          <li style={liStyle}>Verifying a statement when the interest looks off.</li>
          <li style={liStyle}>Homework and exam prep, where you need to see each step.</li>
          <li style={liStyle}>Late-payment charges on invoices at a flat annual rate.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Comparing two offers by changing one rate or term and seeing how the total shifts.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes and Tips for Accurate Results</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Mixing up annual and monthly rates.</strong> A 1% monthly rate is 12% a year, not 1%.
          </li>
          <li style={liStyle}>
            <strong>Mismatched units.</strong> Entering 12 as years when you meant months overstates interest twelvefold.
          </li>
          <li style={liStyle}>
            <strong>Counting fees as interest.</strong> Origination fees, insurance, and processing charges aren't
            interest. If you want the true cost of a loan, include them in what you repay and solve for the rate.
          </li>
          <li style={liStyle}>
            <strong>Assuming a loan is simple when it isn't.</strong> Credit cards and most savings accounts compound.
          </li>
          <li style={liStyle}>
            <strong>Rounding too early.</strong> Keep the full decimals until the final answer, especially when you
            convert days to years.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Skipping the reverse check.</strong> After you get an answer, plug it back in with a different
            variable left blank. You should land on your original number.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Simple Interest Calculator Free and Safe?</h2>
        <p style={pStyle}>
          It's free to use. You enter your numbers, and you get the result, the steps, the chart, and the schedule
          without paying anything. The inputs are just a principal, a rate, and a term, so there's no reason to enter
          your name, account numbers, or loan paperwork.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, the calculator uses the standard formula, so you'll get the same answer you'd get with pen and
          paper or a spreadsheet. Think of it as a planning and checking tool. It can't see lender fees, penalties, or
          compounding clauses hidden in a contract, so for anything binding, go by the numbers in your signed agreement,
          or run them past your lender or a licensed financial adviser.
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
