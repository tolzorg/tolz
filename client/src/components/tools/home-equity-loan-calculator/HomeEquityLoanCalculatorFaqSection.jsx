import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate a home equity loan payment?",
    a: "Use P × r ÷ (1 − (1 + r)^−n), where P is the loan amount, r is the monthly rate and n is the number of months. The calculator does it for you and adds total interest and total cost.",
  },
  {
    q: "How much home equity loan can I get?",
    a: "Multiply your home’s value by the lender’s maximum CLTV (often 80% to 85%), then subtract your mortgage balance. A $400,000 home with a $240,000 mortgage at 85% supports about $100,000. Credit, income and the appraisal decide the final number.",
  },
  {
    q: "What credit score do I need for a home equity loan?",
    a: "Many lenders want at least 620 to 680. Scores of 700 and above usually get the best rates, and lower scores may still qualify at higher cost.",
  },
  {
    q: "What’s the difference between a home equity loan and a HELOC?",
    a: "A home equity loan pays out a lump sum at a fixed rate with a fixed payment. A HELOC is a revolving line of credit, usually with a variable rate and a payment that can change.",
  },
  {
    q: "Is a home equity loan tax deductible?",
    a: "Only if you use the money to buy, build or substantially improve the home that secures it, and only if you itemize. Interest on debt consolidation, tuition or other spending isn’t deductible. Check with a tax professional.",
  },
  {
    q: "Can you lose your house with a home equity loan?",
    a: "Yes. Your home is the collateral, so missing payments can lead to foreclosure. Borrow only an amount you could still afford if your income dropped.",
  },
  {
    q: "Does a home equity loan hurt your credit?",
    a: "There’s usually a small, temporary dip from the credit check and the new account. On-time payments help over time, and using the loan to pay down credit cards can lower your utilization.",
  },
  {
    q: "Can I get a home equity loan without a mortgage?",
    a: "Yes. If your home is paid off, your loan simply becomes the first lien, and your maximum is home value times the lender’s CLTV limit.",
  },
  {
    q: "Can I get a home equity loan with no job or salary?",
    a: "You need documented income that shows you can repay, but it doesn’t have to be a paycheck. Retirement, Social Security, pension, rental and investment income can count.",
  },
  {
    q: "Are closing costs included in APR?",
    a: "Yes. APR combines the interest rate and lender fees, so it’s a better comparison tool than the rate alone.",
  },
  {
    q: "How long does it take to get a home equity loan?",
    a: "Most borrowers close within two to six weeks. Appraisals and title work are usually the slowest steps.",
  },
  {
    q: "Do 125% home equity loans still exist?",
    a: "Not in mainstream lending. Most lenders cap total borrowing at 80% to 90% of your home’s value.",
  },
  { q: "Is this home equity loan calculator free?", a: "Yes, it’s free to use online." },
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
const List = ({ items, ordered }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;

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

export default function HomeEquityLoanCalculatorFaqSection() {
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
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>.</P>
      </Card>

      <Card title="What This Home Equity Loan Calculator Does">
        <P>
          Most people come to a tool like this with two questions, and they usually come in this order: “How much can I get?”
          and “What’s it going to cost me?” This page handles both.
        </P>
        <P>
          The borrowing-limit part works from your home’s value, your remaining mortgage balance and the loan-to-value ratio a
          lender is willing to accept. The cost part takes a loan amount, rate and term and gives you the monthly payment,
          total interest, total repayment and an APR that includes closing costs. Then it builds an amortization schedule from
          the same numbers, so you don’t have to rebuild anything in a spreadsheet.
        </P>
        <P>
          Both calculators are built around how U.S. home equity lending works, so the terms, ratios and typical fees below
          are American ones. If you’re outside the U.S., the math still works, but lender rules and tax treatment will differ.
        </P>
      </Card>

      <Card title="Home Equity Loan vs. a Mortgage vs. a Fixed-Rate Mortgage">
        <P>People mix these up constantly, so here’s the plain version.</P>
        <P>
          A regular mortgage is how you buy the house. It’s usually your first lien, it’s large, and the term is typically 15
          or 30 years. A home equity loan is a separate, smaller loan you take later, after you’ve built equity. It’s second in
          line behind your mortgage, so the rate is usually a bit higher, and the term is often shorter. You also get a
          different cash flow: a mortgage funds a purchase, while a home equity loan puts cash in your hands for whatever you
          need.
        </P>
        <P>
          A fixed-rate mortgage and a home equity loan have more in common than people think. Both have a rate that doesn’t
          change and a payment that stays the same. The difference is purpose and position. A fixed-rate mortgage is the main
          loan on the home. A home equity loan is an add-on that you carry alongside it, and you’ll make two payments each
          month, one to each lender.
        </P>
        <P>
          If you own your home free and clear, there’s no mortgage to sit behind, so a home equity loan would be your only loan
          on the property. Lenders handle that case just fine. It’s a bit easier to qualify since there’s no other debt ahead
          of them.
        </P>
      </Card>

      <Card title="Factors That Decide How Much You Can Borrow">
        <P>
          Four things drive the number you see in the borrowing-limit calculator, and a few more come into play once a lender
          gets involved.
        </P>
        <List items={[
          ["Your home’s value.", "Everything starts here. Lenders don’t use what you think the house is worth. They confirm it with an appraisal or an automated valuation model (AVM), which is basically software that estimates value from recent sales and property data. A modest swing in value can move your borrowing power by tens of thousands of dollars, so if your estimate and the lender’s end up different, the lender’s number wins."],
          ["Your mortgage balance.", "What you still owe comes off the top. The lower it is, the more room you have. This is why long-time owners who’ve been paying down for ten or fifteen years often qualify for much more than someone who bought two years ago."],
          ["Your equity.", "Equity is simply value minus balance. It grows two ways: you pay down principal, and your home’s value rises. But you can’t borrow all of it. Lenders almost always want you to keep 15% to 20% equity in the house, which is where the 80% to 85% ratio comes from. The more equity you leave untouched, the lower the lender’s risk, and that often shows up as a better rate."],
          ["Your credit score.", "It affects both whether you’re approved and what rate you get. Scores of 700 and above tend to get the best offers. The cut-offs vary, but many lenders want at least 620 to 680."],
        ]} />
        <P>
          Beyond those four, lenders also look at income, employment history, existing debts, the type of property
          (single-family homes are easiest, condos and multi-unit buildings can be harder), whether you live there, and
          whether there are other liens on the house, like an unpaid tax bill or a contractor’s claim.
        </P>
      </Card>

      <Card title="The Home Equity Loan Formula: LTV and CLTV Explained">
        <P>There are two ratios here, and they’re easy to confuse.</P>
        <P><strong>LTV (loan-to-value)</strong> is what you owe divided by what the house is worth:</P>
        <Formula>LTV = mortgage balance ÷ home value × 100</Formula>
        <P><strong>CLTV (combined loan-to-value)</strong> adds the new loan to what you owe and compares that total to the home’s value:</P>
        <Formula>CLTV = (mortgage balance + new loan) ÷ home value × 100</Formula>
        <P>Lenders set a ceiling on CLTV. To find the most you could borrow, flip it around:</P>
        <Formula>Maximum loan = (home value × maximum CLTV) − mortgage balance</Formula>
        <P>
          Let’s use a $400,000 home with a $240,000 mortgage. Your current LTV is 60%. Here’s what different lender limits mean:
        </P>
        <List items={[
          ["At 80% CLTV:", "$320,000 − $240,000 = $80,000"],
          ["At 85% CLTV:", "$340,000 − $240,000 = $100,000"],
          ["At 90% CLTV:", "$360,000 − $240,000 = $120,000"],
        ]} />
        <P>
          Same house, same mortgage, and the answer swings by $40,000 just based on which lender you pick. That’s a good reason
          to talk to more than one.
        </P>
        <P>
          Keep in mind this gives you a ceiling, not an approval. Lenders also set their own absolute caps (often around $1
          million at the high end) and minimum loan sizes, and your credit and income can pull the final offer below what the
          formula says.
        </P>
      </Card>

      <Card title="What You Need to Qualify for a Home Equity Loan">
        <P>Requirements vary by lender, but most want to see the same handful of things.</P>
        <List items={[
          ["Enough equity.", "At least 15% to 20% left after the new loan."],
          ["Credit score.", "Often 620 to 680 as a floor, with better pricing at 700 and above."],
          ["Debt-to-income ratio (DTI).", "This is your total monthly debt payments divided by your gross monthly income. Many lenders cap it around 43%, and some allow up to 50% if the rest of your profile is strong. Don’t forget the new payment counts toward it."],
          ["Proof of income.", "Pay stubs, W-2s or tax returns, and bank statements. Self-employed borrowers usually need a couple of years of returns."],
          ["Property paperwork.", "Proof of homeowner’s insurance, a recent mortgage statement, and a title search to check for other liens."],
          ["An appraisal.", "Some lenders waive it and use an AVM instead, but you should expect one."],
        ]} />
      </Card>

      <Card title="How Easy Is It to Get a Home Equity Loan?">
        <P>
          It depends on where you stand. If you’ve got solid credit, plenty of equity and steady income, it’s pretty smooth:
          many borrowers close in two to six weeks. The slowest parts are usually the appraisal and the title work. If your
          credit is shaky, your DTI is high or the house is already tapped out, it gets a lot harder, and you may be turned
          down or offered a rate that doesn’t make sense.
        </P>
      </Card>

      <Card title="Can You Get a Home Equity Loan With No Salary?">
        <P>
          Yes, if you’ve got other income that you can document. Lenders need to see that you can repay, but they don’t care
          whether it’s a paycheck. Social Security, pension payments, retirement account withdrawals, rental income, investment
          income and, in some cases, alimony or child support can all count. If you’ve got no income at all and are leaning
          only on the equity, mainstream lenders will almost always say no, since they’re required to verify you can repay the
          loan.
        </P>
      </Card>

      <Card title="Can You Get a Home Equity Loan Without a Mortgage?">
        <P>
          Yes. If your house is paid off, you can borrow against it, and it’s actually one of the easier setups for lenders
          since nothing else is ahead of them. Technically your loan becomes the first lien. Your max loan is just home value ×
          the lender’s CLTV, with no balance to subtract.
        </P>
      </Card>

      <Card title="Where Can You Get a Home Equity Loan With Bad Credit?">
        <P>It’s possible, but expect to pay more. A few places to look:</P>
        <List items={[
          ["Credit unions and community banks.", "They often weigh your whole situation, not just a score, and tend to be more flexible than the big national lenders."],
          ["Lenders that specialize in lower-credit borrowers.", "They exist, but rates and fees run higher, so run the numbers here first and compare APR."],
          ["Smaller or alternative products.", "For a smaller home repair, an FHA-backed Title I property improvement loan may work, and it doesn’t require much equity."],
        ]} />
        <P>
          Be careful out there. Walk away from anyone who asks for fees upfront before you’ve got an offer, pushes you to sign
          fast, or won’t put the terms in writing. Loans pitched to people with weak credit are where a lot of predatory
          lending hides. If you’re unsure, a HUD-approved housing counselor can look over the paperwork for free or low cost.
          And sometimes the smartest move is to spend six months improving your credit first, since the rate difference over a
          15-year loan can add up to thousands.
        </P>
      </Card>

      <Card title="Can an LLC Take a Home Equity Loan on a Rental Property?">
        <P>
          Generally, no. Home equity loans are a consumer product designed for homes that individuals own and live in. If the
          property sits in an LLC, or it’s a rental, you’re usually looking at a commercial loan, an investment-property
          cash-out refinance or a business line of credit instead. Those have different rules and typically higher rates. Also,
          don’t move a home you’ve already got a mortgage on into an LLC without talking to a lawyer and your lender first,
          since it can trigger problems with the existing loan.
        </P>
      </Card>

      <Card title="Costs of a Home Equity Loan: Closing Costs, APR and “No-Closing-Cost” Deals">
        <P>There are two kinds of costs: what you pay to get the loan, and what you pay to keep it.</P>
        <P>
          <strong>Upfront costs</strong> commonly include an origination fee, appraisal, title search, document preparation
          and recording fees. All told, they often come to 2% to 5% of the loan amount, which can mean several thousand
          dollars. You can pay them at closing or, in some cases, roll them into the loan, but rolling them in means you’re
          paying interest on them for years.
        </P>
        <P>
          <strong>Ongoing costs</strong> are mostly interest. A few lenders also charge an annual fee or ask for extra insurance
          if your CLTV is very high, though that’s not the norm.
        </P>
        <H3>Why APR beats the interest rate</H3>
        <P>
          Say two lenders both quote you 8%. One charges $4,000 in fees, the other charges nothing. They’re not the same loan.
          The APR folds fees into the rate, so it shows what the loan actually costs per year. That’s why this calculator asks
          for closing costs, and why you should compare APRs rather than headline rates.
        </P>
        <P>
          Take the $50,000, 15-year loan at 8%. The payment is about $478 a month. If closing costs are $1,500, you only walk
          away with $48,500 in usable cash but still repay the full $50,000 plus interest. The APR works out to roughly 8.5%.
          The shorter the loan, the bigger that gap gets, because the fees get spread over fewer payments.
        </P>
        <H3>What’s the catch with no-closing-cost loans?</H3>
        <P>
          They’re not free. The lender is covering your fees, and they’ll get it back one of two ways. Either the rate is
          higher (sometimes a quarter to a half point or more), or there’s a clause saying you owe the fees back if you pay off
          or refinance within a certain window, often two to three years. If you plan to keep the loan a long time, paying the
          costs upfront is usually cheaper. If you might sell or refinance soon, a no-cost loan can make sense. Run both
          versions through the calculator and compare the total cost.
        </P>
      </Card>

      <Card title="Monthly Payment and Total Interest">
        <P>The payment on a fixed-rate loan comes from this formula:</P>
        <Formula>Payment = P × r ÷ (1 − (1 + r)^−n)</Formula>
        <P>Here, P is the loan amount, r is the monthly rate (annual rate ÷ 12) and n is the number of monthly payments.</P>
        <P>On a $50,000 loan at 8%:</P>
        <List items={[
          ["15 years:", "about $478 a month, roughly $86,000 repaid, so about $36,000 in interest."],
          ["10 years:", "about $607 a month, roughly $72,800 repaid, so about $22,800 in interest."],
        ]} />
        <P>
          Taking the shorter term costs you about $129 more each month, but it saves you around $13,000 in interest. Whether
          that trade is worth it depends on your budget. There’s no right answer, just the one that fits your cash flow without
          leaving you stretched.
        </P>
      </Card>

      <Card title="Reading Your Amortization Schedule">
        <P>
          The schedule lists each payment, how much went to principal, how much went to interest and what’s left owed. A few
          ways it’s actually useful:
        </P>
        <List items={[
          ["Payoff balance.", "If you might sell in year seven, the schedule tells you what you’ll still owe at that point, so you know what comes out of the sale."],
          ["Equity rebuild.", "Early on, you’re mostly paying interest, so your equity grows slowly. If you’re planning to refinance or tap equity again in a few years, don’t assume the balance has dropped a lot."],
          ["Extra payments.", "Interest is charged on the remaining balance, so even a small extra payment toward principal trims the term and the total interest. Check your loan agreement for a prepayment penalty first. Some lenders still charge one in the first few years."],
        ]} />
      </Card>

      <Card title="What Are Home Equity Loans Used For?">
        <P>Lenders don’t usually limit how you use the money, and people borrow for lots of reasons. These are the most common.</P>
        <List items={[
          ["Home improvements and repairs.", "This is the classic use. A new roof, a kitchen remodel, a foundation fix, replacing an aging HVAC system. It makes sense because the money goes back into the asset that secures the loan, and, as you’ll see in the tax section, it’s also the use that can make the interest deductible."],
          ["Debt consolidation.", "Rolling credit card balances into one fixed-rate loan. Say you’ve got $30,000 on cards at around 24%. That’s roughly $600 a month in interest alone, before touching the balance. A 10-year home equity loan at 9% would have a payment of about $380, and every dollar of it chips away at the debt. The math looks great. The catch is the risk, which is covered below: you’re turning unsecured debt into debt backed by your house."],
          ["Education.", "Tuition, certifications or career training. Compare it against federal and private student loans, which often have protections (deferment, income-based repayment, possible forgiveness) that a home equity loan won’t."],
          ["Medical bills and big life events.", "Surgery, a long recovery, a wedding, a family emergency. Home equity is a cheaper source of cash than a card, but a hospital billing office will sometimes work out a payment plan at 0% interest, so ask first."],
          ["Starting or funding a business.", "Plenty of small businesses start this way, but it puts your home on the line for something that might not work out. Think hard about it."],
          ["Helping family or building a safety cushion.", "Down payment help for a kid, for example. It can work, but you carry the risk if the other person can’t pay."],
        ]} />
      </Card>

      <Card title="What’s the Difference Between a Home Equity Loan and a Home Improvement Loan?">
        <P>
          They sound alike, but they’re different products. A home improvement loan is usually an unsecured personal loan.
          There’s no lien on your house, funding is quick (sometimes within days), and you don’t need equity. The tradeoff is a
          higher interest rate, a shorter term (often 2 to 7 years) and a lower borrowing cap. A home equity loan is secured,
          which means a lower rate and bigger amounts, but it takes longer to close, comes with closing costs and puts your
          house on the line. If you have decent equity and need a large amount for a long project, the home equity loan is
          usually cheaper. If you need $10,000 for a quick fix and don’t want a lien, a home improvement loan might be the
          better pick.
        </P>
      </Card>

      <Card title="What Is a Renovation Home Equity Loan?">
        <P>
          It isn’t a separate product. It’s simply a regular home equity loan that you use for renovation. There are, though,
          true renovation loans, like the FHA 203(k) and Fannie Mae HomeStyle, which are different. They’re based on what the
          house will be worth after the work, and they’re typically rolled into a purchase or a refinance. They can be a good
          fit when you don’t have much equity yet but plan big improvements, as you can borrow against future value.
        </P>
      </Card>

      <Card title="Is It a Good Idea to Use Home Equity to Buy Another Property?">
        <P>
          Some people do it. They use a home equity loan for the down payment on a rental or a vacation home, and if the new
          property goes up in value or brings in rent, they come out ahead. It’s a legitimate strategy. It’s also a risky one.
        </P>
      </Card>

      <Card title="Can I Use an Approved Home Equity Loan to Buy Another Property?">
        <P>
          Usually, yes. Once the money is in your account, most lenders don’t police how you spend it. Just make sure you read
          the loan terms, and be upfront if the application asks about the loan’s purpose. Also, using it as a down payment
          still means you have to qualify for the new mortgage, and the new payment from the equity loan counts against your
          DTI. So you may find that the loan you took out to buy makes it harder to get the mortgage.
        </P>
        <H3>Why you might want to avoid it</H3>
        <List items={[
          ["Two properties are now at risk.", "If the investment drops in value, goes vacant or needs unexpected repairs, you’re still on the hook for payments on the home equity loan, and your own house is the collateral."],
          ["You’re stacking leverage.", "Borrowing against one asset to buy another only pays off if the returns beat your borrowing cost, after taxes, insurance, maintenance and vacancy. A lot of first-time investors forget the last three."],
          ["Cash flow can get squeezed.", "You’d be carrying your mortgage, the equity loan payment, the new property’s mortgage and its expenses. One bad stretch can cause a chain reaction."],
          ["Tax treatment varies.", "Interest on money borrowed against your home and used for a rental is generally treated differently than interest used on your home, and what’s deductible depends on how the money was spent. Check with a CPA first."],
        ]} />
        <P>
          A good rule: only consider it if you could cover every payment from your regular income even if the investment sat
          empty for six months. If that sounds uncomfortable, you’ve got your answer.
        </P>
      </Card>

      <Card title="When Is a Good Time to Take Out a Home Equity Loan?">
        <P>
          There’s no perfect moment, and nobody can reliably call where rates are headed. I’m not going to quote today’s rates
          here, since they change constantly and any number on this page would go stale fast. What does hold up is knowing the
          situations where a home equity loan tends to make sense, and the ones where it’s better to wait.
        </P>
        <List items={[
          ["When your first mortgage rate is low.", "This is probably the biggest one. Say you locked in at 3% or 4% a few years back. Selling and buying somewhere else means trading that rate for a much higher one, and a cash-out refinance would do the same thing to your entire balance. A home equity loan skips all that. Your cheap mortgage stays exactly as it is, and you only pay the higher rate on the smaller amount you borrow. That’s a big reason a lot of homeowners are staying put and renovating instead of moving."],
          ["When the money is going into your home.", "A roof, a kitchen, a foundation repair, a failing HVAC system. These are projects that protect or add to the value of the house securing the loan, and they may also make the interest deductible. If you’re already planning the work, borrowing now at a fixed rate lets you lock in the cost before contractor prices creep up."],
          ["When you’ve built up solid equity.", "If you’ve paid your mortgage down for several years, or your home’s value has climbed, you’ll qualify for more and usually get a better rate. A lower CLTV makes you look like a safer borrower."],
          ["When your credit and income are in good shape.", "Scores in the 700s and a steady, documentable income get the best offers. If your score has recently taken a hit, or you’re about to change jobs, it can be worth waiting a few months. Improving your credit before you apply can save you thousands over a 15-year loan."],
          ["When you can comfortably afford the payment.", "A fixed payment is great as long as it fits. A good test: could you still make it if your income dropped by 20%? If the answer is no, hold off or borrow less."],
        ]} />
        <H3>When it’s probably not a good time</H3>
        <List items={[
          ["You’re planning to sell soon.", "Closing costs eat into the loan, and you’d have to pay it off at sale. Unless the money is going into an upgrade that clearly boosts your sale price, it rarely pays off."],
          ["Your income is shaky.", "Adding a second payment against your house is risky if your paycheck isn’t reliable."],
          ["The money is for something that disappears quickly.", "A vacation or a luxury purchase shouldn’t be tied to your home for 10 or 15 years."],
          ["Your home’s value is falling in your area.", "You could end up owing more than the house is worth, which makes it hard to sell or refinance later."],
          ["You’re only chasing a lower rate.", "If you’re eyeing a rate drop, remember that the fees come back each time you refinance, so wait only if you’ve got a real reason to believe it’ll save you money."],
        ]} />
        <H3>Don’t let rate headlines make the decision</H3>
        <P>
          If the loan is comfortable, the payment fits and the project is something you’d do anyway, a few tenths of a point
          one way or the other matters less than people think. Try this calculator at a few different rates, say half a point
          higher and half a point lower, and watch how much your monthly payment actually moves. On a $50,000 loan over 15
          years, half a point is only about $14 a month. That tells you more than any headline will.
        </P>
      </Card>

      <Card title="What Are the Latest Home Equity Loan Rates?">
        <P>
          Check directly with lenders, since rates change day to day. They depend on your credit score, CLTV, loan size, term
          and the lender’s own pricing. Many are based on a benchmark like the prime rate plus a margin. Expect home equity loan
          rates to be higher than first-mortgage rates (because of that second-lien position) and lower than credit cards or
          most personal loans. When you collect quotes, ask for the APR and a written fee list so you can plug the numbers in
          here and compare.
        </P>
        <H3>How do you get the lowest rate on a home equity loan?</H3>
        <List items={[
          ["Fix your credit first if you can.", "Paying cards down below 30% of their limits and fixing any errors on your report can move your score within a month or two."],
          ["Borrow less than the maximum.", "A lower CLTV means less risk to the lender, so you’ll usually get a better rate."],
          ["Pick a shorter term.", "Shorter loans often come with lower rates, plus you pay less total interest."],
          ["Shop at least three or four lenders.", "Include a credit union, a local bank and an online lender. When several lenders check your credit for the same type of loan in a short window, scoring models typically count them as one inquiry."],
          ["Ask about discounts.", "Autopay, an existing checking account or an existing mortgage with the lender can knock off a fraction of a point."],
          ["Negotiate fees.", "Origination and document fees are often flexible, especially if you’ve got a competing offer."],
          ["Compare APR, not rate.", "A slightly higher rate with no fees can beat a lower rate with a big origination charge."],
        ]} />
      </Card>

      <Card title="Home Equity Loan vs. HELOC (and Which One’s Better)">
        <P>This might be the question people ask most. Both let you borrow against your equity. They work differently.</P>
        <P>
          A <strong>home equity loan</strong> gives you a lump sum with a fixed rate and a fixed payment. You know the cost from
          day one.
        </P>
        <P>
          A <strong>HELOC</strong> (home equity line of credit) is a revolving credit line. During a draw period (commonly 10
          years), you borrow what you need, when you need it, and you often pay only interest on what you’ve used. After that, a
          repayment period begins (often 10 to 20 years), and you pay down principal and interest. The rate is normally
          variable, so the payment can change. Some lenders let you lock part of the balance at a fixed rate.
        </P>
      </Card>

      <Card title="What’s Better, a Home Equity Loan or a Line of Credit?">
        <P>Neither is better across the board. Here’s how I’d think about it:</P>
        <List items={[
          ["Pick the loan", "when you have a single, known expense, like a $40,000 roof, a one-time debt payoff or a tuition bill. You want a predictable payment and no surprises."],
          ["Pick the HELOC", "when costs come in pieces over time, like a remodel done room by room, ongoing tuition or a business that needs working capital. You only borrow and pay interest on what you use."],
        ]} />
        <P>
          The risk with a HELOC is payment shock. Interest-only payments during the draw period feel cheap, then the repayment
          period begins and the payment can jump a lot. If rates rise, it climbs even more.
        </P>
      </Card>

      <Card title="Should I Do a HELOC?">
        <P>
          It makes sense if you’re disciplined, expect uneven costs and can handle a payment that may change. It’s a bad fit if
          you tend to treat available credit as spendable money, or if you’re on a tight budget where a variable payment could
          cause trouble. If you aren’t sure, use this home equity loan calculator to see what a fixed payment would look like,
          then see if a HELOC’s flexibility is really worth the uncertainty.
        </P>
      </Card>

      <Card title="Home Equity Loan vs. Cash-Out Refinance">
        <P>
          A cash-out refinance replaces your existing mortgage with a new, bigger one, and you pocket the difference. You end
          up with one loan and one payment, which is simple. But you’re refinancing the entire balance, you’ll pay closing costs
          on the whole new amount (typically 2% to 5%), and you may reset your payoff clock.
        </P>
        <P>
          It tends to win when your current mortgage rate is higher than what you’d get today. It tends to lose when your
          current rate is lower, since you’d be swapping a cheap loan for a more expensive one just to get cash. In that case, a
          home equity loan on top of your existing mortgage often costs less overall. The easiest way to settle it is to add up
          the monthly cost of both: your existing mortgage plus the new home equity loan, versus the single new cash-out
          mortgage.
        </P>
        <P>
          One more thing on taxes: the same rules apply to both. The interest is deductible only for the portion used to buy,
          build or substantially improve the home. A cash-out refi doesn’t get a special pass.
        </P>
      </Card>

      <Card title="Advantages of a Home Equity Loan">
        <List items={[
          ["Fixed rate and fixed payment.", "You can budget around it for years."],
          ["Lower rates than unsecured debt.", "Cards and personal loans almost always cost more."],
          ["Large amounts.", "Depending on your equity, you can borrow far more than most unsecured lenders will offer."],
          ["Long terms.", "Spreading payments over 10, 15 or 20 years keeps them manageable."],
          ["No need to touch your first mortgage.", "If you’ve got a great rate, you keep it."],
          ["Possible tax benefit.", "If the money goes back into your home, the interest may be deductible."],
          ["Clear structure.", "There’s no temptation to keep borrowing like with a revolving line."],
        ]} />
      </Card>

      <Card title="What Are the Risks of a Home Equity Loan?">
        <P>You’ve probably noticed I keep mentioning the risk, so here’s the full list in one place.</P>
        <List items={[
          ["Your home is the collateral.", "That’s the big one. If you stop paying, the lender can start foreclosure, even though the loan is “just” a second mortgage."],
          ["You could end up owing more than the house is worth.", "If home prices drop after you borrow, you could be underwater. That makes it hard to sell or refinance until you’ve paid the balance down."],
          ["It adds to your monthly obligations.", "Two payments on one house leaves less room if your income falls."],
          ["Closing costs eat into the amount.", "Thousands of dollars in fees can make smaller loans a poor deal."],
          ["Fixed rate cuts both ways.", "If rates fall later, you’re locked in unless you refinance, which means paying fees again."],
          ["It can turn a short-term problem into a long-term one.", "Taking out a 15-year loan to pay off a medical bill, or to fund a vacation, ties the debt to your house for far longer than the original expense."],
          ["Debt consolidation can backfire.", "If you pay off your cards and then run them back up, you end up with the home equity loan and the new card debt. Also, credit card debt is unsecured, so in a worst-case situation, it’s a lot less dangerous than debt tied to your house."],
        ]} />
      </Card>

      <Card title="Can You Lose Your House With a Home Equity Loan?">
        <P>
          Yes. If you default, the lender can foreclose, even if your first mortgage is current. Defaulting on your first
          mortgage can also put the second lender at risk. Foreclosure doesn’t usually happen right away, and lenders typically
          prefer to work something out, so if you see trouble coming, call them early. But the risk is real, and it’s the
          reason to borrow carefully.
        </P>
      </Card>

      <Card title="How Safe Is a Home Equity Loan?">
        <P>
          As a financial product, it’s one of the more predictable ones: fixed rate, set payment, set term, heavy regulation and
          a three-day right to cancel on a primary residence. The danger doesn’t come from the structure, it comes from
          borrowing more than you can comfortably repay. A reliable rule of thumb is to ask yourself whether you could make this
          payment if your income dropped by 20%, or if you had a surprise expense.
        </P>
      </Card>

      <Card title="Are Home Equity Loans Bad?">
        <P>
          Not by nature. They’re tools. They’re good when the money goes toward something that raises your home’s value or
          replaces expensive debt with cheaper debt, and when the payment is comfortable. They’re bad when you use them for
          spending that disappears quickly, or when the payment strains your budget.
        </P>
      </Card>

      <Card title="What’s the Catch With “Sell and Stay” Home Equity Deals?">
        <P>
          First, these aren’t actually home equity loans. “Sell and stay” usually means a sale-leaseback, where you sell your
          home to an investor and rent it back, or a home equity investment, where a company gives you cash now in exchange for
          a share of the home’s future value. The sales pitch is cash with no monthly loan payment. The catches:
        </P>
        <List items={[
          ["You give up ownership.", "In a sale-leaseback, you become a tenant, and the rent can go up when the lease renews."],
          ["You give up future appreciation.", "With an equity investment, the company can end up taking a big slice of the gain, sometimes costing far more than a loan would."],
          ["Fees can be steep.", "Service and origination fees often come out of your proceeds."],
          ["", "The price may be below market value, especially if the buyer is counting on a quick deal."],
          ["", "There can be tax consequences, such as capital gains on the sale."],
          ["Scams use this pitch.", "Equity-stripping schemes target homeowners who are behind on payments or short on cash."],
        ]} />
        <P>
          If someone offers one of these, have a real estate attorney or HUD-approved counselor read every page before signing.
          Then compare it against what a regular home equity loan would cost you on this calculator.
        </P>
      </Card>

      <Card title="Do 125% Home Equity Loans Exist?">
        <P>
          They did in the late 1990s, when some lenders would loan more than a home was worth. They’ve pretty much disappeared
          from mainstream lending after the housing crisis, and most lenders today cap borrowing at 80% to 90% of value. If you
          see an offer for 125%, treat it with serious suspicion, since the interest would be on money not even secured by your
          house’s value.
        </P>
      </Card>

      <Card title="Does a Home Equity Loan Affect Your Taxes?">
        <P>
          The money you borrow isn’t taxable income. The question is whether the interest is deductible, and that depends on
          what you spend it on.
        </P>
        <P>
          Under current federal rules, you can deduct interest on a home equity loan only if the money is used to buy, build or
          substantially improve the home that secures it. A new addition, a roof replacement or a major kitchen remodel counts.
          Paying off credit cards, covering tuition, taking a vacation or buying a car doesn’t. You also have to itemize
          deductions, which means your total itemized deductions need to beat the standard deduction, and there’s a cap on the
          total mortgage debt that qualifies.
        </P>
        <H3>Is a home equity loan tax deductible?</H3>
        <P>
          Possibly, for improvement spending, as described above. Keep your receipts and contractor invoices as proof of how
          you used the funds. If you borrowed to buy rental property or fund a business, different rules apply, and you’d want
          to talk to a CPA, since the deduction depends on how the proceeds are used.
        </P>
        <H3>Is interest on a home equity loan deductible in the US?</H3>
        <P>
          Same answer: yes in limited cases, tied to home improvement, and only if you itemize. Tax laws change, so confirm the
          current rules with a tax professional before you count on a deduction in your budget.
        </P>
      </Card>

      <Card title="Does Taking Out a Home Equity Loan Hurt Your Credit?">
        <P>A little at first, and then it can help if you handle it well.</P>
        <List items={[
          ["Hard inquiry.", "When you apply, the lender pulls your credit, which usually causes a small, temporary dip. Shopping within a short window generally counts as one inquiry."],
          ["New account.", "It lowers the average age of your accounts, which can nudge your score down for a bit."],
          ["New debt.", "Your total debt goes up, which can matter to lenders even if scoring models don’t care much."],
          ["Payment history.", "Paying on time every month builds a positive history. Missing payments does the opposite, and quickly."],
          ["Using it to pay down cards.", "Since a home equity loan is installment debt, moving balances off your cards lowers your credit utilization, which often boosts your score. That effect only lasts if you don’t charge the cards up again."],
        ]} />
      </Card>

      <Card title="Can You Refinance a Home Equity Loan?">
        <P>
          Yes. You can replace it with a new home equity loan at a lower rate or a different term, fold it into a cash-out
          refinance of your first mortgage, or roll it into a HELOC. Refinancing makes sense if rates have dropped
          meaningfully, your credit has improved or you want to change the term. But it comes with closing costs again, so
          figure out your break-even point: divide the new fees by the monthly savings. If it’ll take you three years to break
          even and you’re selling in two, skip it. Also check your current loan for a prepayment penalty before you start.
        </P>
      </Card>

      <Card title="How to Build Home Equity">
        <P>You can’t borrow against equity you don’t have, so it’s worth knowing how it grows.</P>
        <List items={[
          ["Put down more at purchase.", "A bigger down payment gives you equity from day one."],
          ["Pay down principal faster.", "Extra payments toward principal, even small ones, build equity quicker and cut interest. Biweekly payments or rounding up each month are easy ways to do it."],
          ["Make improvements that add value.", "Kitchens, bathrooms, energy upgrades and curb appeal tend to pay off, but not dollar for dollar, so don’t overspend."],
          ["Let the market work.", "In many areas home values rise over time, and equity rises with them. That’s not something you control, and values can fall too."],
          ["Remove mortgage insurance when you can.", "If you pay PMI, once you hit about 20% equity you may be able to drop it. That frees up money you can use to pay down principal."],
        ]} />
      </Card>

      <Card title="Tips for More Accurate Results">
        <List items={[
          ["", "Use your latest mortgage statement for the balance, not the original loan amount."],
          ["", "For home value, look at recent comparable sales or an online estimate, then shave a bit off to be conservative."],
          ["", "Use the rate from an actual quote if you have one, rather than a rate you saw advertised."],
          ["", "Ask each lender for a written fee estimate so your closing cost number is complete. Include only fees tied to the loan."],
          ["", "Try the calculator with two or three scenarios, such as a smaller loan, a shorter term and a slightly higher rate, so you’re not blindsided if the final offer comes in different."],
        ]} />
      </Card>

      <Card title="Free, Private and Reliable">
        <P>
          This home equity loan calculator is free to use, with no charges or hidden upsells. It only needs the financial
          numbers you type in. It doesn’t ask for your name, address, Social Security number or account details, and you don’t
          need any of that to get a result.
        </P>
        <P>
          The payment, interest and amortization figures use the same standard fixed-rate formula lenders use, and the APR is
          solved from your net proceeds and payment stream. Still, treat results as estimates. A lender’s final numbers can
          differ because of rounding, payment dates, prepaid interest and how they structure fees. Use this tool for planning
          and comparing, then confirm the exact terms in your loan estimate before you sign. This page gives general
          information and isn’t financial, legal or tax advice.
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
