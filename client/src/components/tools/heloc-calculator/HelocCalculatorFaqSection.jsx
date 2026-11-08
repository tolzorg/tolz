import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a HELOC calculator?",
    a: "It estimates the payments, interest, and total cost of a home equity line of credit based on your balance, rate, term, and fees. It can also estimate how much you might be able to borrow.",
  },
  {
    q: "How do I calculate my HELOC payment?",
    a: "During the draw period, the interest-only payment is balance × annual rate ÷ 12. In repayment, the payment is set so principal and interest are paid off over the remaining term. The calculator handles both.",
  },
  {
    q: "How much HELOC can I get?",
    a: "Multiply your home value by the lender’s maximum CLTV, then subtract your mortgage balance. For example, $500,000 × 80% − $210,000 = $190,000. Credit, income, and the appraisal affect the final number.",
  },
  {
    q: "How does a home equity line of credit work?",
    a: "You get a credit limit secured by your home and borrow from it as needed during the draw period, usually paying interest only. After that, the repayment period starts, and you pay principal and interest until the balance is gone.",
  },
  {
    q: "Is a HELOC a good way to pay off debt?",
    a: "It can lower your interest cost if you’re replacing high-rate debt, but it turns unsecured debt into debt secured by your home. It works best with a firm payoff plan and stable income.",
  },
  {
    q: "What’s the difference between a HELOC and a home equity loan?",
    a: "A HELOC is a revolving line with a usually variable rate. A home equity loan is a lump sum with a usually fixed rate and fixed payments.",
  },
  {
    q: "Is it better to refinance or get a HELOC?",
    a: "If your current mortgage rate is lower than today’s rates and you need a modest amount, a HELOC often costs less. If rates have dropped below your current rate or you need a large amount, a cash-out refinance may win.",
  },
  {
    q: "What are the risks of a HELOC?",
    a: "The main risks are foreclosure if you can’t pay, rising variable rates, payment shock when repayment begins, a frozen or reduced line, and borrowing more than you can handle.",
  },
  {
    q: "How do I pay off a HELOC?",
    a: "Pay principal during the draw period, follow the repayment schedule, make extra payments, lock part of the balance at a fixed rate, pay it off in a lump sum, refinance, or sell the home.",
  },
  {
    q: "Is HELOC interest tax deductible?",
    a: "Generally only if the money is used to buy, build, or substantially improve the home securing the loan, and only if you itemize. Confirm with a tax professional.",
  },
  {
    q: "Can I get a HELOC without revolving credit?",
    a: "A HELOC is revolving by nature. A home equity loan is the non-revolving alternative. You still need some credit history to qualify for either.",
  },
  {
    q: "Where should I get a HELOC?",
    a: "Compare banks, credit unions, and online lenders, and check the APR, fees, caps, and terms, not just the rate.",
  },
  { q: "Is this HELOC calculator free?", a: "Yes. It’s free to use online, with no hidden charges." },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const COMPARE_HEADERS = ["", "HELOC", "Home equity loan"];
const COMPARE_ROWS = [
  ["How you get the money", "Draw as needed", "One lump sum"],
  ["Rate", "Usually variable", "Usually fixed"],
  ["Payment", "Interest-only at first, then principal and interest", "Fixed principal and interest from day one"],
  ["Best for", "Ongoing or uncertain costs", "One known, one-time expense"],
  ["Main risk", "Rate and payment increases", "Borrowing more than you need"],
];

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
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, verticalAlign: "top" }}>
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

export default function HelocCalculatorFaqSection() {
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

      <Card title="How Does a Home Equity Line of Credit Work?">
        <P>
          A HELOC is a revolving line of credit secured by your house. You’re not handed a lump sum on day one. Instead, you
          get a credit limit and borrow from it as you need to, a lot like a credit card, except your home is the collateral.
          If your limit is $80,000 and you only use $15,000, you only owe (and pay interest on) the $15,000.
        </P>
        <P>Every HELOC runs in two phases.</P>
        <P>
          The <strong>draw period</strong> comes first, and it usually lasts 5 to 10 years. You can borrow up to your limit,
          pay it down, and borrow again as often as you want. Most lenders only require interest on whatever you’ve drawn
          during this stretch. That keeps the monthly bill low, but it also means you’re not chipping away at the debt unless
          you choose to.
        </P>
        <P>
          Then the <strong>repayment period</strong> kicks in, typically lasting 10 to 20 years. You can’t borrow anymore, and
          each payment now covers principal plus interest. The balance gets paid down on a set schedule, and the payment is
          almost always higher than what you were paying before.
        </P>
        <P>
          Most HELOCs also carry a variable rate. The lender takes a benchmark index (usually the prime rate) and adds a margin
          that’s set when you open the account. If the index goes up, your rate goes up. That’s why the same $50,000 balance
          can cost noticeably different amounts in different years. Because the loan is secured by your home, the starting
          rate is often lower than what you’d get on a credit card or personal loan, but the variable rate adds uncertainty
          you won’t see with a fixed-rate loan.
        </P>
      </Card>

      <Card title="HELOC Payments: Draw Period vs. Repayment Period">
        <P>
          Interest-only payments are easy math: balance × annual rate ÷ 12. On a $50,000 balance at 8.5%, that’s about $354 a
          month. It feels very manageable, and that’s the trap. Not a penny of it reduces what you owe.
        </P>
        <P>
          Say you reach the end of the draw period with that same $50,000 still outstanding, and the repayment period is 20
          years. The payment jumps to about $434 a month, and you’ll pay roughly $54,100 in interest over those 20 years.
          That’s more interest than the original balance. The $80 jump doesn’t sound dramatic here, but if the rate has
          climbed or you’ve drawn more, it can be a lot bigger. Borrowers who budget around the draw-period payment and never
          look ahead are the ones who get hit with payment shock.
        </P>
        <P>
          The calculator shows both numbers side by side so you can plan for the higher one while you’re still in the easy
          phase.
        </P>
      </Card>

      <Card title="How Much HELOC Can I Get?">
        <P>Your borrowing limit isn’t the same as your equity. Lenders apply a maximum CLTV and then subtract what you already owe:</P>
        <div style={formulaStyle}>Maximum credit line = (home value × maximum CLTV) − current mortgage balance</div>
        <P>
          Take a home worth $500,000 with a $210,000 mortgage balance and a lender cap of 80%. Eighty percent of $500,000 is
          $400,000. Subtract the $210,000 you owe, and the most you could borrow is $190,000. Your raw equity in that case is
          $290,000, so the lender is deliberately leaving a cushion in case home prices drop.
        </P>
        <P>The CLTV math is only the first filter. Lenders also look at a few other things:</P>
        <List items={[
          ["Credit score.", "Requirements vary, but many lenders want somewhere around 620 to 680 at minimum, and a score below roughly 630 can make approval tough. Better scores get lower margins."],
          ["Debt-to-income ratio (DTI).", "This compares your monthly debt payments to your gross monthly income. Lenders commonly like to see it at or below 43%, and some will stretch toward 50%. A high DTI is one of the most common reasons for a denial."],
          ["Absolute caps.", "Many lenders also set a maximum line regardless of how much equity you have, often around $1 million."],
          ["The property itself.", "Condition, occupancy (primary home vs. rental), existing liens, and insurance coverage all matter."],
        ]} />
        <P>
          So treat the number the calculator gives you as a planning estimate. The lender’s appraisal and underwriting decide
          the real one.
        </P>
      </Card>

      <Card title="HELOC Closing Costs, Fees, and APR">
        <P>Interest is only part of what you’ll pay. There are two kinds of cost to watch.</P>
        <P>
          <strong>Upfront costs</strong> are one-time charges at opening: origination fees, appraisal, title search, document
          and recording fees. Depending on the lender, they can run from a few hundred dollars to a few thousand, and they’re
          often quoted as a percentage of the line. Plenty of lenders advertise a “no closing cost” HELOC. That usually means
          the costs are being recovered another way, through a higher rate, or through an early-closure fee if you close the
          line within the first two or three years.
        </P>
        <P>
          <strong>Ongoing costs</strong> include the annual fee for keeping the line open, and sometimes inactivity fees,
          maintenance fees, or per-withdrawal fees. Annual fees are typically modest, but they add up over a 10-year draw
          period.
        </P>
        <P>
          Here’s why it matters. Suppose you open a $50,000 line with $500 in closing costs and a $75 annual fee, and you keep
          it for 10 years. That’s $1,250 in fees on top of interest. On a small balance, those fees can add a noticeable chunk
          to your effective cost.
        </P>
        <P>
          That’s what the APR in the results is for. It rolls the interest rate, the closing costs, and the annual fee into one
          yearly percentage, so you can compare offers with different rates and fee structures. A lender with a slightly lower
          rate and heavy fees can end up costing more than one with a higher rate and almost no fees. Compare APR and total
          cost, not the headline rate.
        </P>
      </Card>

      <Card title="Reading the HELOC Amortization Schedule">
        <P>
          The amortization schedule splits every payment into interest and principal and shows what you’ll owe afterward. It’s
          worth actually reading.
        </P>
        <P>
          During the draw period, the schedule shows interest-only payments with the balance sitting still. Once repayment
          starts, early payments are mostly interest. The principal share creeps up each month as the balance falls. That’s
          why extra payments early in the repayment period save the most. Every dollar you knock off the balance early stops
          accruing interest for years.
        </P>
        <P>
          Use it to answer practical questions. What will I still owe in five years? How much interest will I have paid by
          then? What happens to my payoff date if I add $100 a month? Run the calculator once with your planned payment and
          once with extra principal, then compare the totals. The difference is often bigger than people expect.
        </P>
      </Card>

      <Card title="What Do You Use a HELOC For?">
        <P>
          People use HELOCs for all kinds of things, but the better fits are costs that come in pieces or that you can’t
          predict exactly.
        </P>
        <List items={[
          ["Home improvements.", "This is the classic use. Remodels almost always cost more than the first quote, and you can draw as contractors need to be paid. Putting the money back into the house also keeps the debt tied to something that can add value."],
          ["Education costs.", "Tuition shows up in chunks every semester, so a line you can draw from fits that rhythm better than a lump sum that starts charging interest immediately."],
          ["Consolidating high-interest debt.", "More on this below, because it can help or backfire."],
          ["Emergency backup.", "Some homeowners open a line and never touch it, just so there’s a source of cash if a job disappears or a big repair hits. If that’s the plan, factor in the annual fee, since you’re paying for access."],
          ["Business or investment costs.", "Some people use a line for startup costs or to bridge a gap before a property sale closes. These carry more risk, and the repayment has to work even if the business doesn’t pan out."],
        ]} />
        <P>
          Comparing lender offers is the other big reason to use the calculator. Run each lender’s rate, fees, and terms
          through it in turn.
        </P>
      </Card>

      <Card title="Is a HELOC a Smart Way to Pay Off Debt?">
        <P>Sometimes. The math can look great, but the structure carries real risk.</P>
        <P>
          Here’s the upside. Say you have $30,000 on credit cards at 24%. That’s about $7,200 in interest in the first year if
          you don’t pay anything down. A HELOC at 9% on the same $30,000 is about $2,700 a year. That’s a savings of roughly
          $4,500 annually, which is real money.
        </P>
        <P>But a few things can go sideways:</P>
        <List items={[
          ["You’re swapping unsecured debt for secured debt.", "Credit card debt can hurt your credit and bring collections calls, but it can’t take your house. A HELOC can."],
          ["Interest-only payments tempt you to coast.", "If you consolidate and then only pay the minimum interest for ten years, you’ve lowered your monthly bill but not your debt. You need a plan to pay the principal."],
          ["The cards often fill back up.", "This is the biggest one. If the underlying spending habit hasn’t changed, you can end up with the HELOC balance plus new credit card debt. Think hard about why the balance built up in the first place."],
          ["The rate isn’t locked.", "A variable rate that starts at 9% can move."],
        ]} />
        <P>
          A HELOC for debt consolidation makes the most sense when the rates are much lower than what you’re paying now, you
          have a firm payoff plan with a set monthly principal payment, the budget is stable, and the original cause of the
          debt is fixed. If you can’t say yes to those, look at other options before putting your home on the line.
        </P>
      </Card>

      <Card title="Should I Get a Home Equity Line of Credit?">
        <P>Here’s a straight way to think about it. A HELOC tends to be a good fit when you:</P>
        <List items={[
          ["", "Have a specific purpose and a realistic idea of the amount"],
          ["", "Have enough equity to stay below the lender’s CLTV cap with some room to spare"],
          ["", "Have stable income and a DTI that’s comfortably under lender limits"],
          ["", "Can handle the repayment-phase payment, not just the interest-only one"],
          ["", "Can handle a rate increase of a couple of points without scrambling"],
        ]} />
        <P>
          It’s probably not a good fit if you’re borrowing for everyday spending, your income is shaky, you’re already
          stretched, or you’d be pulling out most of your available equity. It’s also worth a pause if you may sell the home
          within a couple of years, because closing costs and early-closure fees can eat the benefit.
        </P>
        <P>
          A good test: run the calculator with the repayment payment at a rate two or three points higher than today’s. If
          that number would make you nervous, borrow less or look at a fixed-rate option.
        </P>
      </Card>

      <Card title="What Are the Risks of a Home Equity Line of Credit?">
        <P>
          The big one is that your house secures the loan. If you can’t keep up with payments, the lender can foreclose.
          Beyond that:
        </P>
        <List items={[
          ["Rising rates.", "Variable-rate lines mean your payment can climb without you doing anything. Some lenders cap how far the rate can rise, but the caps are often high."],
          ["Payment shock.", "The jump from interest-only to principal and interest can be big, especially if you drew heavily."],
          ["A frozen or reduced line.", "If home values drop or your credit weakens, a lender can freeze the line or cut your limit. That’s a real problem if you were counting on it as an emergency fund."],
          ["Balloon payments.", "A few HELOCs are structured so that the balance is due in full at the end of the draw period. Check your agreement."],
          ["Going underwater.", "If you borrow a lot and prices fall, you could owe more than the house is worth, which makes selling or refinancing harder."],
          ["Overspending.", "Easy access to cash is a feature and a danger. A line that’s always there can be tempting to use."],
          ["Early-closure fees.", "If you close the line early, you may owe back the closing costs the lender waived."],
        ]} />
        <P>
          None of these mean a HELOC is a bad idea. They mean you should size it carefully and have a plan for each one.
        </P>
      </Card>

      <Card title="How Do You Pay Off a HELOC?">
        <P>There are a few ways, and the right one depends on where you are in the term.</P>
        <List items={[
          ["Pay more than the minimum during the draw period.", "The required payment is usually interest only, but nothing stops you from adding principal. Even a few hundred dollars a month early on cuts the balance and the interest that follows. It also shrinks the payment you’ll face when repayment starts."],
          ["Follow the repayment schedule.", "Once the draw period ends, regular payments pay the balance down to zero by the end of the term."],
          ["Make extra principal payments.", "Check that your lender applies extra money to principal and doesn’t penalize early payoff."],
          ["Lock part of the balance at a fixed rate.", "Many lenders let you convert some or all of the balance to a fixed-rate loan, which makes payments predictable."],
          ["Pay it off in a lump sum.", "If you get a bonus or an inheritance, you can often pay it off all at once. Ask the lender about any early-closure fee first."],
          ["Refinance.", "You can roll the balance into a new mortgage or a new loan, usually when rates are favorable."],
          ["Sell the home.", "The HELOC lien gets paid off from the sale proceeds at closing, so make sure you account for the balance when estimating what you’ll walk away with."],
        ]} />
        <P>Use the amortization schedule here to see how an extra monthly payment changes your payoff date and total interest.</P>
      </Card>

      <Card title="What Do I Need to Know About a Home Equity Loan and a HELOC?">
        <P>
          Both let you borrow against the equity in your home, and both use your house as collateral. That’s why rates are
          generally lower than on unsecured loans, and why the stakes are higher if you fall behind. Both also require an
          appraisal in most cases, and both add a lien to your property. Closing costs show up on both, though they can be
          lower with some lenders. Credit score, income, and DTI matter for both, and you can lose the home if you default on
          either.
        </P>
        <P>The real differences are in how the money is delivered and repaid, which is what the next sections cover.</P>

        <H3>What’s the Difference Between a Home Equity Loan and a HELOC?</H3>
        <P>
          A home equity loan is a closed-end loan. You get the whole amount at once, you pay it back over a fixed term, and the
          rate and payment are usually fixed. Think of it as a second mortgage with a lump sum.
        </P>
        <P>
          A HELOC is revolving. You get a limit, draw when you need to, pay interest on what you use, and the rate usually
          floats.
        </P>
        <DataTable headers={COMPARE_HEADERS} rows={COMPARE_ROWS} />

        <H3>Which Is Better, a HELOC or a Home Equity Loan?</H3>
        <P>Neither is better across the board. It comes down to the job.</P>
        <P>
          If you know exactly what you need, say $40,000 for a roof and new windows, a home equity loan is usually the cleaner
          option. You know your payment for the life of the loan, and there’s nothing to manage.
        </P>
        <P>
          If your costs will show up over time or the final number is fuzzy, such as a gut renovation or several semesters of
          tuition, a HELOC gives you flexibility and saves you from paying interest on money you haven’t used yet.
        </P>

        <H3>What Are the Advantages of a Home Equity Loan Over a HELOC?</H3>
        <P>
          A home equity loan wins on predictability. You get a fixed rate, so a jump in the prime rate won’t touch your
          payment. The payment is the same every month from the start, so there’s no payment shock. It’s easier to budget, and
          it takes away the temptation to keep drawing. Some borrowers also like that a lump sum can be paid straight to
          creditors in a consolidation. The tradeoff is that you start paying interest on the full amount right away, and the
          rate may start a bit higher than a HELOC’s introductory rate.
        </P>
      </Card>

      <Card title="Should You Get a Second Mortgage or a HELOC?">
        <P>
          This one confuses a lot of people, because a HELOC is a kind of second mortgage. If you already have a mortgage, a
          HELOC sits in second position behind it. A home equity loan does too. So the real question is whether you want a
          lump-sum second mortgage (a home equity loan) or a revolving one (a HELOC).
        </P>
        <P>
          Use the same logic as above: fixed amount and a fixed payment point toward the loan, flexible timing and amount point
          toward the HELOC. If you own your home free and clear, a HELOC isn’t a second mortgage at all. It’d be your first and
          only lien.
        </P>
      </Card>

      <Card title="How Does a Cash-Out Refinance Differ From a Home Equity Loan or HELOC?">
        <P>
          A cash-out refinance replaces your existing mortgage with a new, larger one, and you pocket the difference. You end
          up with a single loan and a single payment, rather than a mortgage plus a second loan.
        </P>
        <P>
          A HELOC or home equity loan leaves your current mortgage alone and adds a second lien. That matters most if your
          current mortgage rate is good. With a cash-out refinance, the new rate applies to your whole balance, not just the new
          money.
        </P>
      </Card>

      <Card title="Is It Better to Refinance or Get a HELOC?">
        <P>
          Look at the rate on your current mortgage first. Say you have $300,000 left at 3.5% and you need $50,000. If you
          refinance into a new loan at 6.5%, you’re paying 3 percentage points more on the entire $300,000, which is about
          $9,000 more in interest in the first year, before you even count closing costs. Meanwhile, a HELOC at 8.5% on just the
          $50,000 costs about $4,250 a year. The higher HELOC rate still wins because it only touches the small piece.
        </P>
        <P>
          It flips if your existing rate is high. If you have a 7.5% mortgage and can refinance at 6%, cash-out refinancing
          lets you pull cash and lower your rate in one move.
        </P>
      </Card>

      <Card title="When Is a HELOC More Advisable Than Refinancing?">
        <P>A HELOC usually comes out ahead when:</P>
        <List items={[
          ["", "Your current mortgage rate is lower than today’s rates"],
          ["", "You need a modest amount compared to your mortgage balance"],
          ["", "Your costs are spread over time"],
          ["", "You want lower or no closing costs, which many HELOCs offer"],
          ["", "You expect to pay the balance off within a few years"],
          ["", "You don’t want to restart the clock on your mortgage term"],
        ]} />
        <P>
          Refinancing is stronger when current rates are below what you’re paying, when you need a large amount, or when you
          want to simplify to a single fixed payment.
        </P>
      </Card>

      <Card title="Is a Home Equity Line of Credit Tax Deductible?">
        <P>
          Not automatically, and this is where people get tripped up. Under current federal rules, HELOC interest is generally
          deductible only if you use the money to buy, build, or substantially improve the home that secures the loan, and only
          if you itemize deductions. If you use the money to pay off credit cards, cover tuition, or buy a car, the interest
          isn’t deductible. There are also overall limits on how much mortgage debt qualifies. Keep records showing where the
          money went.
        </P>
        <P>
          It’s worth noting that the same use-of-proceeds test applies to cash-out refinances, so it’s not true that refinance
          interest is always deductible while HELOC interest isn’t. The portion of the new loan that pays off your old mortgage
          generally qualifies. The cash-out portion depends on how you spend it.
        </P>
        <P>Tax rules change, so check with a tax professional for your situation.</P>
      </Card>

      <Card title="Where Should I Get a Home Equity Line of Credit?">
        <P>There are three main places to shop: banks, credit unions, and online lenders. Each has trade-offs.</P>
        <List items={[
          ["Banks", "are worth a call if you already have your mortgage or checking account there. Relationship discounts on the rate or fees are common."],
          ["Credit unions", "often have lower margins and fewer fees, and they may be more flexible on borderline applications. You need to be a member, but membership is easier to get than most people think."],
          ["Online lenders", "are usually the fastest, with simple applications and quick appraisals, and some work with borrowers who have thinner credit. Compare their fees and rates carefully."],
        ]} />
        <P>
          Whichever you choose, ask about the index and margin, rate caps, the draw and repayment lengths, annual fees, closing
          costs, early-closure fees, and whether you can lock part of the balance at a fixed rate.
        </P>
      </Card>

      <Card title="Which Lender Offers the Best HELOC Rate?">
        <P>
          There’s no single lender that’s cheapest for everyone, and HELOC rates change frequently, so any list of “best”
          lenders goes stale fast. Your rate depends on your credit score, CLTV, DTI, the amount you borrow, and the lender’s
          margin.
        </P>
        <P>
          Get quotes from at least three or four lenders from a mix of banks, credit unions, and online companies. Ask each for
          the same loan amount and term so the quotes are comparable. Then put each one into the HELOC calculator, including all
          fees, and compare the APR and total cost. Also check whether the advertised rate is a promotional one that resets
          after six months or a year.
        </P>
      </Card>

      <Card title="Approval Rates: Banks vs. Online Lenders">
        <P>
          There’s no reliable public data that compares approval rates between banks and online lenders, so be wary of anyone
          who quotes you exact percentages. What you can say is that every lender looks at the same core things: equity,
          credit, income, and DTI. Where they differ is flexibility and speed. Credit unions and banks where you already have a
          relationship can sometimes be more flexible on borderline cases. Online lenders can be faster and sometimes more open
          to non-traditional income, but may charge more.
        </P>
        <P>
          If you’re worried about approval, strengthen the application first: pay down credit card balances, avoid new credit
          inquiries, and gather income documents. Then apply to a couple of lenders within a short window, since multiple
          inquiries for the same type of loan in a short period are usually treated as one for scoring purposes.
        </P>
      </Card>

      <Card title="Can You Get a Home Equity Line Without Revolving Credit?">
        <P>That question can mean two different things.</P>
        <P>
          If you mean you don’t want a revolving account, a HELOC is revolving by definition. A home equity loan is the
          non-revolving version. It gives you a lump sum and a fixed payment. Some lenders also let you convert part of a HELOC
          balance to a fixed-rate piece.
        </P>
        <P>
          If you mean you don’t have credit cards or other revolving accounts, you can still apply, but lenders need some
          credit history to evaluate you. If your file is thin, expect a harder time. Getting a small credit-builder loan or
          becoming an authorized user first can help.
        </P>
      </Card>

      <Card title="Is This HELOC Calculator Accurate and Safe to Use?">
        <P>
          The calculator uses standard loan math: interest on outstanding balances, payments derived from your inputs, and an
          APR computed from your fees and term. It’s a reliable planning estimate. What it can’t do is predict future rate
          changes or copy every lender’s specific rules, like minimum draws, rate caps, or daily interest calculation methods.
          For binding numbers, ask the lender for their official disclosures.
        </P>
        <P>
          The tool is free, with no hidden charges, and it doesn’t require your name or contact details to show results. Since
          you’re typing in numbers about your home and finances, only enter what the tool asks for, and don’t put sensitive
          identifiers like account or Social Security numbers anywhere on the page.
        </P>
      </Card>

      <Card title="What This HELOC Calculator Does">
        <P>
          Most online tools give you one monthly number and stop. This one covers the whole life of the line, from the first
          draw to the last payment.
        </P>
        <P>From a single set of inputs, you get:</P>
        <List items={[
          ["", "Your monthly payment during the draw period"],
          ["", "Your monthly payment during the repayment period"],
          ["", "Total interest paid over the full term"],
          ["", "The total cost of borrowing, including closing costs and annual fees"],
          ["", "An APR that reflects those fees instead of just the quoted rate"],
          ["", "A payment-by-payment amortization schedule"],
          ["", "An estimate of the maximum credit line your equity may support"],
        ]} />
        <P>
          Since the HELOC payment calculator accounts for fees, the result lands much closer to what you’ll really pay than a
          rate-only estimate would.
        </P>
      </Card>

      <Card title="How to Use the HELOC Calculator">
        <P>Fill in the fields above and the results update. The inputs are the same things a lender will ask you about.</P>
        <List items={[
          ["Home value and mortgage balance.", "Use what your home would realistically sell for today, not what you paid. Lenders order an appraisal, and an inflated number just gives you a borrowing limit you won’t get. For the mortgage, enter what you still owe, not the original loan amount."],
          ["Maximum combined loan-to-value (CLTV).", "Most lenders cap your total borrowing against the house at roughly 80% to 85% of its value, and a few go higher. If you don’t know your lender’s number yet, try 80% and 85% and see how much the limit moves."],
          ["Credit line or draw amount.", "Put in what you actually expect to borrow. You don’t have to use the full limit, so it makes sense to test a smaller draw."],
          ["Interest rate.", "Enter the rate you were quoted. If it’s variable, run it again at a rate a couple of points higher. You’ll learn quickly how sensitive your payment is."],
          ["Draw and repayment periods.", "Use the terms in the lender’s offer. A common setup is 10 years of drawing followed by 20 years of repayment, but plenty of lenders do 5 and 10, or 10 and 15."],
          ["Closing costs and annual fees.", "Appraisal, origination, title, and document fees all go in here, along with any yearly maintenance fee. If you leave them out, the APR will look better than the real deal."],
        ]} />
      </Card>

      <Card title="Tips for Getting a Better HELOC Deal">
        <List items={[
          ["Shop around.", "Margins, fees, and CLTV limits vary a lot."],
          ["Look past the promo rate.", "Model what happens after the intro period."],
          ["Check the caps.", "Ask for the lifetime rate cap and any floor."],
          ["Negotiate fees.", "Closing costs and annual fees can often be reduced or waived, especially with an existing relationship."],
          ["Ask about a fixed-rate lock.", "It gives you an option if rates jump."],
          ["Pay principal early.", "Don’t wait for repayment to start."],
          ["Tidy up your credit and DTI first.", "A few months of preparation can improve your margin."],
        ]} />
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
