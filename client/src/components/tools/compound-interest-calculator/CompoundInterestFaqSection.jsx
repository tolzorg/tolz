import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a compound interest calculator?",
    a: "It's a tool that shows how interest grows when earned interest gets added to the balance and starts earning interest too. This one compares and converts rates between compounding frequencies, so you can judge different offers on the same footing.",
  },
  {
    q: "How do I calculate compound interest?",
    a: "Use A = P(1 + r/n)^(nt). P is the starting amount, r is the annual rate as a decimal, n is how many times a year interest compounds, and t is the number of years. Subtract P from A to get just the interest. For example, $5,000 at 5% compounded monthly for one year grows to $5,255.81.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: "Simple interest is calculated only on the original amount. Compound interest is calculated on the original amount plus any interest already earned. On $5,000 at 8% for three years, simple interest gives you $6,200 and annual compounding gives you $6,298.56.",
  },
  {
    q: "Is daily or monthly compounding better?",
    a: "For savers, daily pays slightly more. For borrowers, it costs slightly more. At 6%, the effective rate is 6.1831% daily versus 6.1678% monthly. The gap is small at low rates but grows with higher rates and bigger balances.",
  },
  {
    q: "What's the difference between APR and APY?",
    a: "APR is the nominal yearly rate before compounding. APY is the effective rate after compounding. APY is always the same as or higher than APR. Mortgage and auto loan APRs may also include fees.",
  },
  {
    q: "How do I convert APY to a nominal rate?",
    a: "Use r = n × [(1 + APY)^(1/n) − 1]. For a 6% APY with monthly compounding, that's about 5.84%.",
  },
  {
    q: "How do I convert a monthly rate to an annual rate?",
    a: "Calculate (1 + r/12)^12 − 1, where r is the nominal annual rate as a decimal. For 5% compounded monthly, that comes to about 5.116%.",
  },
  {
    q: "What is continuous compounding?",
    a: "It's the theoretical limit of compounding infinitely often, using A = Pe^(rt). It gives the maximum growth for a given rate, and it's used mainly in finance theory and modeling.",
  },
  {
    q: "How long does it take to double my money?",
    a: "Use the Rule of 72: divide 72 by the annual rate. At 8%, it's about 9 years. It's an estimate, but it's close for rates between about 6% and 10%.",
  },
  {
    q: "Does compounding frequency really matter?",
    a: "It matters more when rates are high and time horizons are long. At 2%, monthly versus daily compounding is worth pennies per $1,000. At 24%, annual versus daily is more than three percentage points.",
  },
  {
    q: "Is this compound interest calculator free? Do I need to sign up?",
    a: "It's free, and you don't need an account. Use it as often as you like.",
  },
];

// Structured data uses the supplied schema wording, which shortens one answer.
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  item.q === "Is daily or monthly compounding better?"
    ? { ...item, a: "For savers, daily pays slightly more. For borrowers, it costs slightly more. At 6%, the effective rate is 6.1831% daily versus 6.1678% monthly." }
    : item
);

const EAR_HEADERS = ["Compounding", "6% nominal", "10% nominal", "24% nominal"];
const EAR_ROWS = [
  ["Annually", "6.0000%", "10.0000%", "24.0000%"],
  ["Semiannually", "6.0900%", "10.2500%", "25.4400%"],
  ["Quarterly", "6.1364%", "10.3813%", "26.2477%"],
  ["Monthly", "6.1678%", "10.4713%", "26.8242%"],
  ["Daily", "6.1831%", "10.5156%", "27.1100%"],
  ["Continuously", "6.1837%", "10.5171%", "27.1249%"],
];

const BALANCE_HEADERS = ["Compounding", "Balance after 10 years"];
const BALANCE_ROWS = [
  ["Annually", "$17,908.48"],
  ["Quarterly", "$18,140.18"],
  ["Monthly", "$18,193.97"],
  ["Daily", "$18,220.23"],
  ["Continuously", "$18,221.19"],
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

export default function CompoundInterestFaqSection() {
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
        <h2 style={h2Style}>What This Compound Interest Calculator Does</h2>
        <p style={pStyle}>
          Plenty of calculators only answer one question: "how much will my deposit be worth in X years?" This one is
          built around the rate itself. It does two things.
        </p>
        <p style={pStyle}>
          <strong>It compares.</strong> Enter an interest rate and see how that same number behaves under annual,
          semiannual, quarterly, monthly, semi-monthly, bi-weekly, daily, and continuous compounding.
        </p>
        <p style={pStyle}>
          <strong>It converts.</strong> Say one bank quotes 5% compounded monthly and another quotes a slightly
          different rate compounded daily. The tool turns both into the same frequency, so you can see which one pays
          more (or costs more, if you're borrowing).
        </p>
        <p style={pStyle}>
          Both matter because a rate without its compounding schedule is only half a number. That's the reason banks
          are required to show an effective rate next to the nominal one, which we'll get to in a minute.
        </p>

        <h3 style={h3Style}>How to use it</h3>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Enter the annual interest rate.</strong> Type it as a percentage, like 6 or 4.25, exactly as the
            bank or lender states it.
          </li>
          <li style={liStyle}>
            <strong>Pick the compounding frequency that rate currently uses.</strong> Check the account terms or loan
            agreement. If it says interest is calculated daily and posted monthly, that's still daily compounding.
          </li>
          <li style={liStyle}>
            <strong>Pick the frequency you want to compare against or convert to.</strong> Annual is the usual
            baseline, since the nominal and effective rates are identical there.
          </li>
          <li style={liStyle}>
            <strong>Read the equivalent rate.</strong> You'll see what the rate works out to under the new frequency.
          </li>
          <li>
            <strong>Change things and run it again.</strong> Swap the rate, try another frequency, or check a competing
            offer. You don't need to reset anything between runs.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want to know what a specific deposit or loan balance will turn into, you'll need the formulas or the
          spreadsheet shortcuts further down this page. This tool is built for the rate side of the question, and
          that's usually where the confusion is.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Compound Interest Actually Is</h2>
        <p style={pStyle}>
          Compound interest is interest that earns more interest. You earn it on your original money and on all the
          interest that's been added so far. Each time interest gets added, the balance gets a little bigger, so the
          next round of interest is calculated on a bigger number.
        </p>

        <h3 style={h3Style}>Simple interest vs. compound interest</h3>
        <p style={pStyle}>
          Simple interest only ever applies to the original amount. Say you put $5,000 in an account paying 8% simple
          interest for three years. You earn $400 a year, so you end up with $6,200.
        </p>
        <p style={pStyle}>
          Compound it annually instead, and the picture changes. Year one earns $400 and your balance becomes $5,400.
          Year two earns 8% of $5,400, which is $432. Year three earns 8% of $5,832, which is about $466.56. You finish
          with $6,298.56, nearly $100 more than the simple version, and that's only after three years. Stretch it to 20
          or 30 years and the gap is huge.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Simple interest still shows up in some short-term loans, certain bonds, and a few auto loans. Most of the
          time, though, if money is sitting in an account or a balance is carrying over, compounding is involved.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compounding Frequencies and Where You'll Run Into Them</h2>
        <p style={pStyle}>Interest can compound on pretty much any schedule. The common ones are below.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Annual (1 time a year).</strong> The simplest case. Some CDs and bonds work this way, and it's the
            baseline for most comparisons.
          </li>
          <li style={liStyle}>
            <strong>Semiannual (2).</strong> Common with bonds. Fixed-rate mortgages in Canada also typically compound
            semiannually.
          </li>
          <li style={liStyle}>
            <strong>Quarterly (4).</strong> You'll see this on some CDs and certain corporate or municipal products.
          </li>
          <li style={liStyle}>
            <strong>Monthly (12).</strong> The usual schedule for mortgages, personal loans, auto loans, and many credit
            cards. Plenty of savings accounts also credit interest monthly.
          </li>
          <li style={liStyle}>
            <strong>Semi-monthly (24) and bi-weekly (26).</strong> Less common, but they pop up in payroll-linked
            products and some loan structures. Our tool handles both, which a lot of calculators skip.
          </li>
          <li style={liStyle}>
            <strong>Daily (365).</strong> Many high-yield savings accounts calculate interest daily, even if they only
            deposit it once a month. Credit cards generally work this way too. The daily rate is the APR divided by 365
            (a few lenders use 360).
          </li>
          <li>
            <strong>Continuous.</strong> This is the math limit, where interest compounds an infinite number of times.
            Almost no real product uses it, but it's the standard in finance theory and options pricing, and it shows
            you the ceiling. No matter how often interest compounds, you can't beat the continuous number for a given
            rate.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's one more thing worth knowing. A rate compounded more often looks smaller than the same rate
          compounded less often, even though they pay (or cost) the same. Lenders know this. A 6% mortgage is really
          0.5% per month, but after twelve rounds of compounding, you're paying 6.17% on an annual basis. Quoting the
          monthly version just sounds friendlier.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Compound Interest Formulas</h2>
        <p style={pStyle}>
          You don't need these to use the tool, but they're worth understanding, especially if you want to check a
          bank's math.
        </p>

        <h3 style={h3Style}>Basic formula (compounding once a year)</h3>
        <div style={formulaStyle}>A = P(1 + r)^t</div>
        <p style={pStyle}>
          A is the final amount, P is the starting amount, r is the annual rate as a decimal, and t is the number of
          years. Put $1,000 in an account at 6% compounded annually for two years: $1,000 × 1.06² = $1,123.60.
        </p>

        <h3 style={h3Style}>Formula for any compounding frequency</h3>
        <div style={formulaStyle}>A = P(1 + r/n)^(nt)</div>
        <p style={pStyle}>
          Now n is the number of times per year interest compounds. Take that same $1,000 at 6%, but compounded daily
          for two years. The daily rate is 6% ÷ 365, or about 0.016438%. After 730 days you have $1,000 ×
          (1.00016438)^730, which comes to about $1,127.49.
        </p>

        <h3 style={h3Style}>Continuous compounding</h3>
        <div style={formulaStyle}>A = Pe^(rt)</div>
        <p style={pStyle}>
          Here e is Euler's number, about 2.71828. Same $1,000, same 6%, same two years: $1,000 × e^0.12 ≈ $1,127.50.
        </p>
        <p style={pStyle}>
          Look at those three results. Annual gives you $1,123.60, daily gives you $1,127.49, and continuous gives you
          $1,127.50. Going from daily to continuous earns you a penny. That's the diminishing return, and it's why
          "compounded continuously" is a marketing line more than a meaningful advantage.
        </p>

        <h3 style={h3Style}>Effective annual rate</h3>
        <div style={formulaStyle}>EAR = (1 + r/n)^n − 1, and for continuous compounding, EAR = e^r − 1</div>

        <h3 style={h3Style}>Converting between frequencies</h3>
        <p style={pStyle}>
          To turn a rate at one frequency into the equivalent rate at another, you set the effective rates equal and
          solve:
        </p>
        <div style={formulaStyle}>r₂ = n₂ × [(1 + r₁/n₁)^(n₁/n₂) − 1]</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's not something you want to do by hand more than once, which is the whole reason the converter exists.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Does Frequency Matter? A Side-by-Side Look</h2>
        <p style={pStyle}>
          Here's how the same nominal rates stack up when you convert them to an effective annual rate:
        </p>
        <DataTable headers={EAR_HEADERS} rows={EAR_ROWS} />
        <p style={pStyle}>
          Two things jump out. First, at 6% the whole spread from annual to continuous is less than two-tenths of a
          point. Frequency barely matters at low rates. Second, at 24% (a typical credit card APR) it's more than three
          full points. The higher the rate, the more the compounding schedule matters.
        </p>
        <p style={pStyle}>Here's what that looks like in dollars. $10,000 at a 6% nominal rate for 10 years:</p>
        <DataTable headers={BALANCE_HEADERS} rows={BALANCE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Annual to monthly adds about $285 over the decade. Monthly to daily adds about $26. Daily to continuous adds
          under a dollar. Most of the benefit comes from the first couple of steps up.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>APR vs. APY: Why Banks Quote Different Numbers</h2>
        <p style={pStyle}>This is where most people get tripped up.</p>
        <p style={pStyle}>
          <strong>APR</strong> (annual percentage rate) is the stated yearly rate, before compounding. It's a nominal
          rate. <strong>APY</strong> (annual percentage yield) is the rate you actually earn over a full year after
          compounding. It's an effective rate. APY is always equal to or higher than APR, and the gap grows when rates
          are high or compounding is frequent.
        </p>
        <p style={pStyle}>
          In the U.S., banks have to show APY on deposit accounts, which helps you compare savings products fairly.
          Loans and credit cards go the other way and lead with APR. That can make borrowing look cheaper than it really
          is. A card charging 24% APR compounded daily has an effective rate of about 27.11%, so the true annual cost is
          more than three points above the number on the offer.
        </p>
        <p style={pStyle}>
          One warning for mortgages and auto loans: the "APR" there often rolls in fees and points, so it isn't purely a
          compounding number. On a credit card, it's just the nominal rate. The label is the same but the meaning shifts
          depending on the product.
        </p>

        <h3 style={h3Style}>Two conversions you'll actually use</h3>
        <p style={pStyle}>
          <strong>"I see a 6% APY. What nominal rate is that for monthly compounding?"</strong>
          <br />
          You need r = 12 × [(1.06)^(1/12) − 1], which is about 5.84%. So an account paying 5.84% compounded monthly is
          the same as a 6% APY.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>"I'm quoted 5% compounded monthly. What's that annually?"</strong>
          <br />
          (1 + 0.05/12)^12 − 1 ≈ 5.116%. An account that compounds only once a year would have to pay 5.116% to match
          it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compound Interest Over Time</h2>
        <p style={pStyle}>
          The first few years of compounding feel boring. Then the curve bends. Here's a clean example with $10,000 at
          6% compounded annually:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>After 20 years: about $32,071</li>
          <li>After 30 years: about $57,435</li>
        </ul>
        <p style={pStyle}>
          Those extra 10 years added over $25,000. That's more than the first 20 years combined produced in growth
          (about $22,000). Time does more work than almost anything else you control, which is why starting early beats
          investing more later.
        </p>

        <h3 style={h3Style}>Adding regular contributions</h3>
        <p style={pStyle}>
          Compounding gets even more powerful when you keep adding money. Say you open an account with $5,000 and add
          $200 at the end of each month. The rate is 6% compounded monthly, and you leave it for 20 years. You'd end up
          with roughly $108,959. You'd have put in $53,000 of your own money, so around $56,000 of that is interest.
        </p>
        <p style={pStyle}>
          This calculator is focused on rates, so for projections like this you can use a spreadsheet. In Excel or
          Google Sheets:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Future value with contributions:</strong> <code>=FV(0.06/12, 20*12, -200, -5000)</code>
          </li>
          <li style={liStyle}>
            <strong>Effective rate from a nominal rate:</strong> <code>=EFFECT(0.06, 12)</code>
          </li>
          <li>
            <strong>Nominal rate from an effective rate:</strong> <code>=NOMINAL(0.06, 12)</code>
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The EFFECT and NOMINAL functions need a whole number of periods per year. For continuous compounding, use{" "}
          <code>=EXP(rate)-1</code>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compounding Works on Investments Too, With a Catch</h2>
        <p style={pStyle}>
          If you invest in stocks or funds, you don't get a fixed interest rate. You get returns, and they go up and
          down. But if you keep those gains invested, they compound the same way interest does.
        </p>
        <p style={pStyle}>
          Invest $10,000 and earn 6% in a year, and you're at $10,600. Earn 6% again the next year and you're at
          $11,236, because the second year's gain was calculated on $10,600. Keep that going for 30 years and the
          $10,000 becomes more than $57,000.
        </p>
        <p style={pStyle}>
          The catch is that real returns don't arrive as a smooth 6% every year. Stocks can drop sharply, sometimes for
          more than one year, and a calculator that assumes a steady rate can't capture that. Historically, diversified
          stock portfolios have averaged higher returns than savings accounts over long stretches, but there's real
          risk of loss, especially over short periods. Use the calculator to see what a hypothetical average return does
          over time, and don't treat it as a promise.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Fees are the other quiet drag. A fund charging 1% a year turns a 6% gross return into 5% net. Over 30 years,
          $10,000 grows to about $43,219 at 5% versus $57,435 at 6%, a difference of more than $14,000 from a fee that
          looks tiny.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Other Side: When Compounding Works Against You</h2>
        <p style={pStyle}>
          Compound interest is great when you're the one earning it. When you owe money, the same math runs in reverse.
        </p>
        <p style={pStyle}>
          Take a $3,000 credit card balance at 22% APR, compounded monthly. If you made no payments for a year, interest
          alone would add about $731, and that's more than the $660 you'd owe with simple interest. The balance keeps
          growing on itself. (Cards typically give you a grace period if you pay in full each month, so this mostly
          bites when you carry a balance.)
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That's why paying off high-rate debt works like a guaranteed return equal to the rate you stop paying. And
          it's why compounding frequency matters most on loans and cards, where the rates are highest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Rule of 72</h2>
        <p style={pStyle}>
          Want to estimate how long it takes to double your money without a calculator? Divide 72 by the annual rate
          (use the whole number, like 8, not 0.08).
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>At 6%: 72 ÷ 6 = 12 years</li>
          <li style={liStyle}>At 8%: 72 ÷ 8 = 9 years (the exact answer is about 9.006)</li>
          <li>At 12%: 72 ÷ 12 = 6 years</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's most accurate for rates between about 6% and 10% and for annual compounding. For continuous compounding,
          69.3 is the more precise number. It also works backwards: if you want to double your money in 9 years, you
          need roughly an 8% return. Treat it as a quick gut check, not a precise answer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Want to Use This Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Comparing savings accounts and CDs.</strong> One offers 4.5% compounded daily, another 4.55%
            compounded annually. Which is better? Convert both to the same frequency and you'll know in seconds.
          </li>
          <li style={liStyle}>
            <strong>Reading loan and mortgage quotes.</strong> Lenders in different markets compound differently.
            Getting the effective rate shows what you'll really pay.
          </li>
          <li style={liStyle}>
            <strong>Sizing up a credit card.</strong> A high APR plus daily compounding costs noticeably more than the
            headline suggests. Seeing the effective rate can push you to pay a balance down faster.
          </li>
          <li style={liStyle}>
            <strong>Checking APY claims.</strong> When a bank advertises APY, you can work backwards to the nominal rate
            and see whether the numbers add up.
          </li>
          <li style={liStyle}>
            <strong>Modeling long-term plans.</strong> If you're projecting a fixed-rate deposit or bond, testing
            different frequencies shows how sensitive your plan is to that assumption.
          </li>
          <li style={liStyle}>
            <strong>Homework and exam prep.</strong> Time-value-of-money problems love rate conversions. This is a fast
            way to check your work.
          </li>
          <li>
            <strong>Auditing your own spreadsheet.</strong> If your model spits out a number that looks wrong, run the
            same rate here as a sanity check.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What a Compounding Calculation Doesn't Include</h2>
        <p style={pStyle}>A rate conversion is clean math. Real life is messier. Keep these in mind:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Inflation.</strong> If you earn 6% and prices rise 3%, your real gain is closer to 2.9%. The formula
            is (1 + nominal) ÷ (1 + inflation) − 1.
          </li>
          <li style={liStyle}>
            <strong>Taxes.</strong> Interest on savings is usually taxable, which lowers what you keep.
          </li>
          <li style={liStyle}>
            <strong>Fees.</strong> Account fees, loan origination fees, and fund expenses all cut into the result.
          </li>
          <li style={liStyle}>
            <strong>Variable rates.</strong> Savings APYs and many loan rates can change at any time. A calculation
            based on today's rate is a snapshot.
          </li>
          <li style={liStyle}>
            <strong>Day-count rules.</strong> Some commercial loans use a 360-day year, which makes the daily rate
            slightly higher than a 365-day calculation.
          </li>
          <li>
            <strong>Rounding.</strong> Banks round at different steps, so your statement may differ from a calculator
            by a few cents.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Quick Bit of History</h2>
        <p style={pStyle}>
          Compound interest is old. Clay tablets from ancient Mesopotamia show that the Babylonians and Sumerians were
          charging interest around 4,400 years ago, though their system worked differently than today's. Many societies
          were uneasy about it. Roman law restricted charging interest on interest, and both Christian and Islamic
          traditions condemned it as usury. Lenders kept doing it anyway, and by the early 1600s printed compound
          interest tables made the math easy to share.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also led to one of math's most famous constants. In 1683, Jacob Bernoulli was studying compound interest
          and noticed that as you compound more and more often, the result doesn't grow forever. It settles toward a
          limit. Leonhard Euler later worked out that value (about 2.71828) and gave it the letter e, which is why it
          carries his name today.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Accurate</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Free.</strong> There are no hidden fees, no usage caps, and no paid tier hiding the full results.
          </li>
          <li style={liStyle}>
            <strong>No signup.</strong> You don't need an account or an email address.
          </li>
          <li style={liStyle}>
            <strong>Privacy.</strong> The rates you enter are only used to calculate your result. Don't type in account
            numbers or personal banking details, because you never need to.
          </li>
          <li>
            <strong>Accuracy.</strong> The results come from the standard compound interest and effective rate formulas
            used in textbooks and bank disclosures. For real products, treat the output as a reliable estimate. Your
            bank's exact figures can differ slightly because of rounding, fees, and rate changes.
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
