import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a future value calculator?",
    a: "It estimates what an amount of money will be worth on a future date, given an interest rate, a time period and optional regular deposits. This one also shows total interest, present value and a schedule.",
  },
  {
    q: "How do you calculate the future value of money?",
    a: "Multiply the starting amount by (1 + r)^n, where r is the rate per period and n is the number of periods. For regular deposits, add PMT × [((1 + r)^n − 1) ÷ r].",
  },
  {
    q: "How much will $1,000 be worth in 10 years?",
    a: "At 5% compounded yearly, about $1,628.89. At 7%, about $1,967.15. The rate you use changes the answer a lot, so test a few.",
  },
  {
    q: "How long does it take to double my money?",
    a: "Divide 72 by the annual rate for a quick estimate. At 6%, that’s about 12 years. The exact figure is ln(2) ÷ ln(1 + r).",
  },
  {
    q: "What’s the difference between present value and future value?",
    a: "Future value is what money today will grow into. Present value is what a future amount is worth today. They’re linked by the interest rate and the number of periods.",
  },
  {
    q: "Why is the future value of an annuity due higher than an ordinary annuity?",
    a: "Each deposit goes in one period earlier, so it earns one extra period of interest. The total is the ordinary annuity result multiplied by (1 + r).",
  },
  {
    q: "How do I calculate future value in Excel?",
    a: "Use =FV(rate, nper, pmt, pv, type), with deposits entered as negative numbers. Set type to 1 for beginning-of-period deposits and 0 for end.",
  },
  {
    q: "What is a future value factor?",
    a: "It’s the growth multiplier (1 + r)^n for $1 over a given number of periods. At 5% for 10 years, it’s 1.6289. Multiply your starting amount by it to get the future value.",
  },
  {
    q: "Does the calculator include inflation or taxes?",
    a: "No. It shows a nominal amount based on the rate you enter. To estimate real growth, enter your rate after subtracting inflation, taxes and fees.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

// Small layout helpers: every card drops the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function FutureValueCalculatorFaqSection() {
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
      <style>{".faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Future Value?">
        <P>
          Future value, or FV, is what a chunk of money is expected to be worth at a set date in the future, assuming it earns
          a steady rate of return until then. Put $10 in an account that pays 6% and leave it alone for a year, and you’ll have
          $10.60. That $10.60 is the future value of your $10.
        </P>
        <P>
          It’s the “what will this grow into?” number. Cash in a savings account, a CD or a bond usually earns compound
          interest, so the balance keeps changing over time, and FV tells you where it’ll land. The same idea applies to any
          asset where you can reasonably estimate a growth rate.
        </P>
        <P>
          Formally, future value equals the present value multiplied by an accumulation factor. That factor just expresses how
          much one dollar grows over the period. For compound interest, it’s (1 + r)^n.
        </P>
        <H3>The Five Variables Behind Every Time Value Calculation</H3>
        <P>Finance calculators and textbooks describe every one of these problems with the same five pieces:</P>
        <List items={[
          ["N:", "the number of periods"],
          ["I/Y:", "the interest or yield rate"],
          ["PV:", "the present value, or starting amount"],
          ["PMT:", "the payment you add each period"],
          ["FV:", "the future value"],
        ]} />
        <P>
          Know any four, and you can solve for the fifth. This page’s calculator solves for FV and also reports PV, but the same
          logic lets you work backward to find a required deposit, a needed rate or the time it takes to hit a goal. We’ll cover
          those further down.
        </P>
      </Card>

      <Card title="The Time Value of Money: Why $100 Today Beats $100 Next Year">
        <P>
          Here’s a quick gut check. Would you rather have $100 today or $100 a year from now? If you said today, you already
          understand the time value of money. It’s the idea that money you can use now is worth more than the same amount
          later, and it’s the foundation of nearly everything in finance.
        </P>
        <H3>Why Money Today Is Worth More</H3>
        <P>There are three reasons, and they stack:</P>
        <List items={[
          ["It can earn something.", "Your $100 can sit in a savings account and turn into $100 plus interest by next year. Waiting means giving that up."],
          ["Prices usually rise.", "A year from now, $100 typically buys a little less than it does today."],
          ["Waiting carries risk.", "A payment promised later might arrive late, shrink or not show up at all."],
        ]} />
        <P>
          Economists put it simply: the future value of money is its present value plus the interest it earns. The rest of this
          page is about calculating that interest correctly.
        </P>
      </Card>

      <Card title="How Do You Calculate the Future Value of Money?">
        <P>The basic formula is:</P>
        <Formula>FV = PV × (1 + r)^n</Formula>
        <P>
          PV is your starting amount, r is the interest rate per period, and n is the number of periods. It works as written
          when the compounding period matches the rate’s period, like annual compounding with an annual rate.
        </P>
        <P>Try it: $1,000 at 4% compounded yearly for 3 years gives $1,000 × 1.04³ = $1,124.86.</P>
        <H3>What Changes When Interest Compounds More Than Once a Year</H3>
        <P>Many accounts compound quarterly, monthly or daily. In that case, the formula becomes:</P>
        <Formula>FV = PV × (1 + r/k)^(n × k)</Formula>
        <P>
          Here k is how many times per year interest compounds. Take the same $1,000 at 4% for 3 years, but compounded monthly.
          You get $1,000 × (1 + 0.04/12)^36 = $1,127.27. That’s about $2.41 more than annual compounding, and the only thing
          that changed was how often interest got added. More frequent compounding means a higher future value, though the gap
          is small at low rates and short time frames.
        </P>
        <H3>How to Solve for the Rate or the Time</H3>
        <P>Sometimes you already know the target and need to find the missing piece.</P>
        <P>
          To find the rate needed to grow PV into FV over n years: r = (FV ÷ PV)^(1/n) − 1. If you want $5,000 to become $8,000
          in 6 years, you need about 8.15% a year.
        </P>
        <P>To find how long growth takes: n = ln(FV ÷ PV) ÷ ln(1 + r). At 5%, an investment doubles in about 14.2 years.</P>
        <P>
          For a quick mental version, use the Rule of 72. Divide 72 by the annual rate to estimate doubling time. At 6%, that’s
          about 12 years. At 9%, it’s about 8.
        </P>
      </Card>

      <Card title="What Is the Formula for the Future Value of an Annuity?">
        <P>
          An annuity is just a series of equal payments made at regular intervals. A monthly $200 savings transfer is an
          annuity. So is a $50 weekly deposit. Each payment grows at the same rate, but each one has a different amount of time
          to grow. The formula adds them all up in one step.
        </P>
        <H3>Future Value of an Ordinary Annuity</H3>
        <P>When payments happen at the end of each period:</P>
        <Formula>FV = PMT × [((1 + r)^n − 1) ÷ r]</Formula>
        <P>If you also have a starting balance, add the lump sum growth on top:</P>
        <Formula>FV = PV × (1 + r)^n + PMT × [((1 + r)^n − 1) ÷ r]</Formula>
        <P>If r is zero, the bracket just becomes n, so FV = PV + PMT × n.</P>
        <H3>Future Value of an Annuity Due</H3>
        <P>When payments happen at the beginning of each period, multiply the annuity portion by (1 + r):</P>
        <Formula>FV = PMT × [((1 + r)^n − 1) ÷ r] × (1 + r)</Formula>
        <P>Rent, insurance premiums and savings transfers scheduled for the first of the month are typical annuity due examples.</P>
      </Card>

      <Card title="Why Is the Future Value of an Annuity Due More Than an Ordinary Annuity?">
        <P>
          It comes down to timing. With an annuity due, every deposit lands one period earlier than it would in an ordinary
          annuity, so every deposit earns one extra period of interest. Mathematically, the entire stream is the ordinary
          annuity result multiplied by (1 + r).
        </P>
        <P>
          A quick example: $1,000 a year for 10 years at 5%. As an ordinary annuity, you’d end up with $12,577.89. As an annuity
          due, it’s $13,206.79. The difference is $628.90, which is exactly 5% of the ordinary result, as you’d expect.
        </P>
        <P>
          The gap widens with higher rates, longer time frames and bigger deposits. It’s the reason the beginning-or-end setting
          on a future value calculator isn’t a minor detail. If you’re planning around a number, make sure it matches how your
          deposits really work.
        </P>
      </Card>

      <Card title="How Is the Future Value of a Single Amount Computed Using a Table?">
        <P>
          Before calculators and spreadsheets, finance students used printed tables. You looked up a factor for a given rate and
          number of periods, multiplied it by your starting amount, and that was the answer. These tables are still in
          textbooks and some exams, and the idea behind them is useful.
        </P>
        <H3>What Are Future Value Factors?</H3>
        <P>
          A future value factor (often written FVIF) is just (1 + r)^n, the growth multiplier for $1 over n periods at rate r.
          At 5% for 10 years, the factor is 1.6289. Multiply any starting amount by it. Start with $4,000, and you get $4,000 ×
          1.6289 = $6,515.58.
        </P>
        <P>
          For annuities, the factor (FVIFA) is [((1 + r)^n − 1) ÷ r]. At 5% for 10 periods, it’s 12.5779. A $1,000 payment each
          period gives $12,577.90, which matches the example earlier. For an annuity due, multiply that factor by (1 + r) to get
          13.2068.
        </P>
        <H3>What Are Future Value Factors Used For?</H3>
        <List items={[
          ["", "Quick hand calculations without redoing the full formula"],
          ["", "Comparing options by looking at multipliers side by side"],
          ["", "Exam and certification problems that give you a table"],
          ["", "Building spreadsheets and models, since a factor can be reused across many amounts"],
          ["", "Sanity-checking a calculator result against a known multiplier"],
        ]} />
      </Card>

      <Card title="How Do You Tell Present Value From Future Value?">
        <P>
          They’re two views of the same relationship. Future value asks what money today will become. Present value asks what a
          future amount is worth today. The interest rate and time connect them.
        </P>
        <H3>What Is Present Value?</H3>
        <P>
          Present value is future money translated into today’s terms. You find it by reversing the formula: PV = FV ÷ (1 +
          r)^n. If you want $8,000 in 5 years and your account pays 3% compounded yearly, you’d need to deposit $8,000 ÷ 1.03⁵ =
          $6,900.88 today. If interest compounds quarterly instead, you’d need just $6,889.52, since more frequent compounding
          does more of the work.
        </P>
        <H3>Why Present Value and Future Value Both Matter</H3>
        <P>
          Present value helps you judge offers and decisions made today that involve money later. Future value helps you plan
          how today’s decisions will play out. Together they let you compare things that arrive at different times, which you
          can’t fairly do by just looking at the dollar amounts.
        </P>
        <H3>How Do You Know When to Use Which?</H3>
        <P>
          Use future value when you know what you’re putting in and want to see what you’ll end up with. Think retirement
          contributions or a college fund.
        </P>
        <P>
          Use present value when you know what you want or what someone promised you, and you need to know what it’s worth now.
          A settlement offered as a lump sum versus payments over ten years is a classic case. So is working out how much to
          deposit today to reach a specific goal.
        </P>
      </Card>

      <Card title="Why Do We Discount Future Cash Flows?">
        <P>
          Discounting is how you convert future money into today’s value. You do it because a future dollar is worth less than a
          present one. Three reasons drive that: you could have earned a return on it in the meantime, inflation will erode its
          buying power, and there’s always some chance it won’t arrive as planned.
        </P>
        <P>
          The discount rate you pick is basically a statement about all three. A safe, near-guaranteed payment gets a low
          discount rate. A speculative or risky one gets a higher rate, which shrinks its present value.
        </P>
      </Card>

      <Card title="What Is Net Present Value, and Why Does It Matter?">
        <P>
          Net present value (NPV) takes every expected cash flow, discounts each back to today, adds them up and subtracts what
          you pay up front. A positive NPV means the project or investment earns more than your discount rate. A negative one
          means it falls short.
        </P>
        <P>
          Say you put $10,000 into something that pays $12,000 in 3 years, and you want a 6% return. The present value of
          $12,000 is $12,000 ÷ 1.06³ = $10,075. Your NPV is about +$75, so it clears your hurdle, barely. At a 7% target, it
          flips to negative. That’s why NPV is the standard tool for comparing business projects, equipment purchases and
          investments that pay out over different timelines.
        </P>
      </Card>

      <Card title="How Can You Get the Most Out of Compound Interest?">
        <P>Compound interest rewards time more than almost anything else, but some habits make a bigger difference than others.</P>
        <List items={[
          ["Start earlier than feels necessary.", "Say you invest $200 a month at 7%, compounded monthly. Over 30 years, you’d end up with roughly $244,000. Over 20 years, it’s roughly $104,000. Ten extra years meant $24,000 more in deposits, but about $140,000 more at the end."],
          ["Keep deposits automatic and regular.", "A steady transfer on payday beats good intentions. Since the beginning-of-period setting yields more, investing as soon as the money lands, not at the end of the month, helps a little too."],
          ["Compare APY, not just the quoted rate.", "APY includes the effect of compounding, so it’s the fair way to compare accounts. An account with a slightly lower rate that compounds daily can match one with a higher rate that compounds annually."],
          ["Watch fees.", "A 1% annual fee sounds trivial. On $10,000 over 30 years, 7% annual growth gets you about $76,100. At 6% after fees, it’s about $57,400, which is nearly $18,700 lost."],
          ["Reinvest, don’t withdraw.", "Interest only compounds if it stays in the account."],
          ["Use tax-advantaged accounts when you can.", "Accounts like a 401(k) or an IRA let growth build without being trimmed by yearly taxes, and an employer match is basically an instant return on your contribution."],
          ["Raise your deposit when your income rises.", "Even adding $25 or $50 a month with each raise adds up faster than people expect."],
        ]} />
        <P>
          One more thing: compounding works against you, too. A credit card at 22% doubles what you owe in about 3.3 years if
          you don’t pay it down.
        </P>
      </Card>

      <Card title="How to Calculate Future Value in Excel or Google Sheets">
        <P>Both programs have a built-in FV function:</P>
        <Formula>=FV(rate, nper, pmt, [pv], [type])</Formula>
        <List items={[
          ["rate", "is the interest rate per period"],
          ["nper", "is the total number of periods"],
          ["pmt", "is the payment per period"],
          ["pv", "is the starting amount (optional)"],
          ["type", "is 0 for end-of-period payments, or 1 for beginning (optional)"],
        ]} />
        <P>
          The sign convention trips people up. Money you pay out (deposits, starting balance) should be entered as negative
          numbers, and the result comes back positive. For $5,000 up front plus $200 a month at 6% compounded monthly for 10
          years, type:
        </P>
        <Formula>=FV(0.06/12, 120, -200, -5000, 0)</Formula>
        <P>
          That returns about $41,872.85. Change the last argument to 1, and you’ll get about $42,036.73. For a single lump sum,
          like $1,000 at 4% for 3 years, use =FV(0.04, 3, 0, -1000), which returns $1,124.86.
        </P>
        <P>
          Related functions work the same way: PV for present value, PMT for the payment needed, NPER for how long, and RATE
          for the required return. What Excel doesn’t do on its own is show a clean year-by-year schedule, which is where the
          calculator on this page saves you some setup.
        </P>
      </Card>

      <Card title="What Is a Guaranteed Future Value?">
        <P>A guaranteed future value is one where the end amount is known upfront, because the rate and terms are fixed. A few common examples:</P>
        <List items={[
          ["CDs (certificates of deposit):", "the bank agrees to a fixed rate for a set term. In the U.S., FDIC insurance covers deposits up to $250,000 per depositor, per bank, per ownership category."],
          ["Treasury securities:", "backed by the U.S. government, with known payments if held to maturity."],
          ["Zero-coupon bonds:", "you buy at a discount and receive the full face value at maturity. At 5% for 6 years, a $1,000 bond would sell for about $746."],
          ["Fixed annuities:", "an insurer guarantees a rate or payout, but the guarantee depends on the insurer’s financial strength, and it isn’t FDIC-insured."],
        ]} />
        <P>
          “Guaranteed” refers to the nominal dollar amount. It doesn’t protect against inflation, so $1,000 locked in for ten
          years can still buy less than $1,000 does today.
        </P>
      </Card>

      <Card title="Future Value When There’s No Fixed Rate">
        <P>The formulas on this page assume a steady rate. A lot of real assets don’t behave that way.</P>
        <H3>Who Determines Stock Market Future Values?</H3>
        <P>
          Nobody sets them. Prices come from buyers and sellers on an exchange agreeing on a number, and that number moves
          constantly with earnings, interest rates, news and sentiment. Analysts try to estimate a stock’s fair value by
          projecting future cash flows and discounting them back, which is the same present value logic covered above. For
          planning, many people use the long-run historical average for broad U.S. stocks, which has been around 10% a year
          before inflation, or about 7% after. It’s an average, not a promise, and individual years can swing widely.
        </P>
        <H3>How Do Analysts Estimate the Future Value of Bitcoin?</H3>
        <P>
          It’s tough, because Bitcoin doesn’t produce earnings, dividends or interest, so there’s nothing to discount. Analysts
          typically rely on scenario modeling instead. They’ll guess how large Bitcoin’s role might become, say as a share of
          the market for stores of value like gold, and work backward to a price. Some use network activity measures. The
          stock-to-flow model got a lot of attention for a while and then drew heavy criticism after its price forecasts
          missed. Any figure you see is a scenario, not a calculation, so if you use this calculator for crypto, treat the rate
          as a “what if” and test several.
        </P>
        <H3>Will Bitcoin Change the Value of Currencies Around the World?</H3>
        <P>
          No one knows, and no calculator can answer that. So far, national currencies remain the standard for taxes, wages and
          most trade, and their values mainly track interest rates, inflation and economic conditions in each country. What you
          can do is plug in different growth and inflation assumptions to see how your own savings hold up.
        </P>
      </Card>

      <Card title="Inflation, Deflation and Real Future Value">
        <P>
          Future value tells you a nominal number, which is the dollar amount. What you probably care about is real value, or
          what that money can buy. The quick conversion is: real rate ≈ (1 + nominal rate) ÷ (1 + inflation) − 1. A 6% return
          with 3% inflation is about 2.9% in real terms. At 3% inflation, $41,873 ten years from now has the buying power of
          roughly $31,150 today.
        </P>
        <H3>Can an Economy With Deflation Keep Growing?</H3>
        <P>
          Sometimes, yes, when prices fall because things get cheaper to produce. The U.S. saw falling prices through much of
          the late 1800s while output expanded a lot, and tech goods get cheaper every year without hurting anyone. Broad,
          persistent deflation tends to be a different story. When people expect prices to keep dropping, they hold off on
          spending and investing, debts get heavier in real terms and growth can stall. Japan’s long stretch of weak prices from
          the 1990s is the usual example.
        </P>
        <P>
          For your own planning, deflation does flip one thing: a savings balance gains buying power even at 0% interest. Real
          return then ends up higher than the nominal rate. It’s rare in practice, but the formula above handles it if you enter
          inflation as a negative number.
        </P>
      </Card>

      <Card title="How to Use This Future Value Calculator">
        <P>
          Start with the starting amount, the money you already have. Leave it at zero if you’re building from scratch. Then
          enter the regular deposit, which is the amount you add each period. Use zero if you only want to see what a lump sum
          grows into.
        </P>
        <P>
          Next, enter the interest rate and the length of time, and make sure the two match. If you’re depositing monthly, the
          rate and the number of periods should both be monthly figures, so an annual 6% over 10 years becomes 0.5% over 120
          months. Then choose whether deposits go in at the beginning or end of each period.
        </P>
        <P>
          You’ll see the future value, your total deposits, the total interest and the present value. The schedule shows the
          opening balance, deposit, interest and closing balance for every period. It’s handy for spotting when you cross a
          target, or for checking against your own spreadsheet.
        </P>
        <H3>Worked Example: $5,000 Plus $200 a Month for 10 Years</H3>
        <P>
          Say you start with $5,000 and add $200 a month at 6% compounded monthly for 10 years. With deposits at the end of each
          month, you’ll have about $41,873. You put in $29,000, so about $12,873 is interest. With deposits at the beginning of
          the month, it’s about $42,037, roughly $164 more for the same money. Discounting the first result back 10 years at the
          same rate gives a present value of about $23,015.
        </P>
        <H3>Working Backward: How Much Do You Need to Deposit?</H3>
        <P>Often you’ve got a goal and need the deposit. Rearranging the annuity formula gives:</P>
        <Formula>PMT = FV × r ÷ ((1 + r)^n − 1)</Formula>
        <P>
          To reach $50,000 in 10 years at 5% compounded monthly, you’d need to put in about $322 a month. You can confirm it by
          entering $322 into the calculator and checking that it lands close to $50,000. Adjust until it fits your target.
        </P>
      </Card>

      <Card title="When Do You Need a Future Value Calculator?">
        <List items={[
          ["Retirement and long-term savings:", "see what regular contributions could become, and test how a $50 bump changes the outcome."],
          ["College funds:", "project a fund started when a child is young, using a cautious rate."],
          ["Big purchases:", "check whether a monthly transfer will cover a down payment, a wedding or a car by your deadline."],
          ["Comparing accounts:", "run a CD, a high-yield savings account and a bond fund side by side with each one’s real rate."],
          ["Business planning:", "map out a fund for equipment replacement or a tax reserve built up in regular amounts."],
          ["Lump sum or payments:", "compare a settlement or buyout offer against a stream of payments by running both through the same rate."],
          ["School and exams:", "check homework, especially annuity due problems, where it’s easy to flip the timing."],
        ]} />
      </Card>

      <Card title="What the Result Can and Can’t Tell You">
        <P>
          The calculator assumes one constant rate for the whole period. Real returns bounce around, so treat the number as a
          planning estimate. Run a conservative, a middle and an optimistic rate to see a range. Fixed-rate accounts fit the
          assumption well, and stocks fit it poorly.
        </P>
        <P>
          The result is also before taxes and fees, and it’s in future dollars. If you want a closer estimate of what you’ll
          keep, subtract expected fees and taxes from the rate. For real buying power, adjust for inflation as shown above.
        </P>
      </Card>

      <Card title="Free, Private and Built for Accurate Results">
        <P>
          This calculator is free to use, and you can see the full results and schedule without paying for anything. It uses
          the same time-value-of-money formulas taught in finance classes and built into spreadsheet functions like FV, so the
          output lines up with standard methods. You don’t have to share personal information to get an answer. Since the result
          depends entirely on what you enter, take a second to double-check the rate, the number of periods and the deposit
          timing before relying on it.
        </P>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
