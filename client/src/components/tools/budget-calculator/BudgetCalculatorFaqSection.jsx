import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a budget calculator?",
    a: "It’s a tool that adds up your income and expenses to show how much you’ve got left after bills. This one also shows your after-tax income, debt-to-income ratio, and a breakdown of spending by category.",
  },
  { q: "Is this budget calculator free?", a: "Yes, it’s free with no hidden charges." },
  { q: "Can I do a monthly and a yearly budget?", a: "Yes. Pick whichever view fits how you earn and spend, or do both." },
  {
    q: "How do I make a budget from scratch?",
    a: "List every source of income. Then list every expense by category, using real numbers from your statements. Subtract total expenses from your after-tax income. If you’re in the positive, that’s your surplus. If you’re negative, adjust categories until the numbers work.",
  },
  {
    q: "What’s a good debt-to-income ratio?",
    a: "Many lenders consider anything under about 36% healthy, and above roughly 43% can make getting a mortgage harder. Exact limits depend on the lender and the type of loan.",
  },
  {
    q: "Should I budget with gross or after-tax income?",
    a: "After-tax. It’s the money that actually reaches you. Gross income overstates what you can spend.",
  },
  {
    q: "What percentage of my income should go to housing?",
    a: "A common guideline is about 30% of gross income. Since this calculator uses after-tax income, that works out to roughly 35 to 40% of take-home pay for most people. Your situation and local costs matter.",
  },
  {
    q: "How much should I save each month?",
    a: "Many guidelines suggest 15 to 20% of income, including retirement. If that’s out of reach right now, start with something smaller and increase it as your budget improves.",
  },
  {
    q: "How big should my emergency fund be?",
    a: "Three to six months of essential expenses is the usual advice. If your income is irregular or you support others, aim higher.",
  },
  {
    q: "What if my expenses are more than my income?",
    a: "Check for entry errors first. Then cut variable spending, lower fixed bills, pay down high-interest debt, and look for ways to earn more.",
  },
  {
    q: "How do I budget with irregular income?",
    a: "Use the yearly view to find your average, then build the budget around a conservative figure rather than your best months. Put extra from good months into savings to cover the slow ones.",
  },
  {
    q: "How often should I update my budget?",
    a: "Monthly at first, and any time your income, housing, or family situation changes.",
  },
  {
    q: "Does this replace financial advice?",
    a: "No. It helps you understand your cash flow. For complex decisions, talk to a qualified advisor.",
  },
];

// FAQ schema exactly as supplied (its wording differs slightly from the displayed FAQ).
const FAQ_SCHEMA_ITEMS = [
  { q: "What is a budget calculator?", a: "A budget calculator adds up your income and expenses to show how much you have left after bills. This one also shows after-tax income, debt-to-income ratio, and a spending breakdown by category." },
  { q: "Is this budget calculator free?", a: "Yes, it is free with no hidden charges." },
  { q: "Can I do a monthly and a yearly budget?", a: "Yes. Pick whichever view fits how you earn and spend, or do both." },
  { q: "How do I make a budget from scratch?", a: "List every source of income, then every expense by category using real numbers from your statements. Subtract total expenses from after-tax income. A positive result is a surplus and a negative result is a deficit. Adjust categories until the numbers work." },
  { q: "What's a good debt-to-income ratio?", a: "Many lenders consider a DTI under about 36% healthy, and above roughly 43% can make getting a mortgage harder. Exact limits depend on the lender and loan type." },
  { q: "Should I budget with gross or after-tax income?", a: "After-tax income. It is the money that actually reaches you, while gross income overstates what you can spend." },
  { q: "What percentage of my income should go to housing?", a: "A common guideline is about 30% of gross income, which works out to roughly 35 to 40% of take-home pay for many people. Local costs and your situation matter." },
  { q: "How much should I save each month?", a: "Many guidelines suggest 15 to 20% of income, including retirement. If that is out of reach right now, start smaller and increase it as your budget improves." },
  { q: "How big should my emergency fund be?", a: "Three to six months of essential expenses is the usual advice. If your income is irregular or you support others, aim higher." },
  { q: "What if my expenses are more than my income?", a: "Check for entry errors first. Then cut variable spending, lower fixed bills, pay down high-interest debt, and look for ways to earn more." },
  { q: "How do I budget with irregular income?", a: "Use the yearly view to find your average, then build the budget around a conservative figure. Put extra from good months into savings to cover slow ones." },
  { q: "How often should I update my budget?", a: "Monthly at first, and any time your income, housing, or family situation changes." },
  { q: "Does this replace financial advice?", a: "No. It helps you understand your cash flow. For complex decisions, talk to a qualified advisor." },
];

const GUIDELINE_HEADERS = ["Category", "Common guideline"];
const GUIDELINE_ROWS = [
  ["Housing (rent or mortgage plus utilities)", "About 30% of gross income"],
  ["Car payment", "Under 10% of gross income"],
  ["Total transportation (payment, fuel, insurance, upkeep)", "Under 15% of income"],
  ["Food (groceries plus dining out)", "Under 15% of income"],
  ["Savings and investments", "15% or more of income"],
];

const EXAMPLE_HEADERS = ["Category", "Monthly"];
const EXAMPLE_ROWS = [
  ["Rent", "$1,450"],
  ["Utilities and internet", "$210"],
  ["Groceries", "$480"],
  ["Dining out", "$320"],
  ["Car payment", "$395"],
  ["Gas, insurance, upkeep", "$360"],
  ["Student loan", "$280"],
  ["Credit card minimums", "$120"],
  ["Phone, subscriptions", "$150"],
  ["Healthcare", "$140"],
  ["Entertainment, shopping", "$400"],
  ["Savings", "$200"],
  [<strong key="t">Total</strong>, <strong key="v">$4,505</strong>],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const firstH3 = { ...h3Style, marginTop: 0 };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, verticalAlign: "bottom" }}>
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

export default function BudgetCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is a Budget, and Why Bother Making One?</h2>
        <p style={pStyle}>
          A budget is just a plan for your money. You estimate what’s coming in, you estimate what’s going out, and you decide
          ahead of time how to split it up. That’s it. It’s not a punishment and it’s not about never buying anything fun.
        </p>
        <p style={pStyle}>
          People usually start one for a specific reason. Maybe they want to pay off a credit card, save for a down payment,
          stop running short before payday, or get ready for a big change like a move, a baby, or a career switch. Others
          just have a vague feeling that they’re spending too much and want proof.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You’ve got plenty of options for how to do it: apps, spreadsheets, envelopes of cash, or a notebook on the kitchen
          counter. Honestly, the best system is whichever one you’ll keep using. A fancy app you abandon after three weeks
          does less for you than a simple calculator you check every month. That’s the idea behind this tool. It’s quick
          enough that you’ll actually come back to it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Budget Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Pick monthly or yearly.</strong> Go with whichever matches how your money works. If you get a steady paycheck and pay most bills monthly, start with monthly. If you’re a freelancer, work seasonally, or get a big chunk of income once or twice a year, the yearly view is more honest.</li>
          <li style={liStyle}><strong>Enter your income.</strong> List each source on its own line: your job, side work, rental income, interest, benefits, child support, whatever applies. Separate lines show you how much you lean on any one source. If your main paycheck disappeared, would the rest cover the basics?</li>
          <li style={liStyle}><strong>Enter your expenses by category.</strong> Housing, utilities, groceries, transportation, insurance, debt payments, healthcare, subscriptions, entertainment, savings, and so on. Be specific. “Misc: $600” tells you nothing. “Pet food $70, haircuts $45, gifts $90” tells you plenty.</li>
          <li style={lastLi}><strong>Check the results.</strong> Everything updates as you type, so there’s nothing to submit. That makes it easy to play with “what if” scenarios. What if rent goes up $150? What if you drop the gym and two streaming services? What if you pick up four extra shifts a month? Change one number and watch the bottom line move.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting Accurate Numbers</h2>
        <p style={pStyle}>
          Garbage in, garbage out. Don’t work from memory. Pull your last two or three months of bank and card statements and
          read them line by line. Almost everyone underestimates the small stuff: delivery fees, app subscriptions, parking,
          coffee runs, bank charges.
        </p>
        <p style={pStyle}>
          Also don’t forget the expenses that only show up once in a while. Car registration, annual insurance premiums,
          holiday gifts, vet bills, dental work, back-to-school costs. Working monthly? Add up the yearly total and divide by
          twelve. Working yearly? Enter the full amount.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more thing to watch for: double-counting. If you put a $60 dinner on your credit card, count it once, either
          under dining out or under the card payment, not both. This mistake quietly inflates expenses and makes you think
          you’re in worse shape than you are. The reverse happens too, when people leave out the card payment entirely and
          assume the spending doesn’t count.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Your Results Mean</h2>

        <h3 style={firstH3}>After-Tax Income</h3>
        <p style={pStyle}>
          Gross income is what your employer says you earn. After-tax income is what actually shows up in your bank account.
          Your budget should run on the second number, because you can’t spend money that went to taxes, health insurance
          premiums, or a retirement contribution.
        </p>
        <p style={pStyle}>
          This matters more than it sounds. Many popular budgeting rules, including some you’ll see quoted online, are based
          on gross income. If you apply them to your take-home pay without adjusting, the math is off. More on that in the
          benchmarks section.
        </p>
        <p style={pStyle}>
          Tax situations vary a lot depending on where you live, how you file, and what deductions you’ve got. If your
          numbers look different from your pay stub, go with the pay stub.
        </p>

        <h3 style={h3Style}>Net Surplus or Deficit</h3>
        <p style={pStyle}>
          This is your after-tax income minus all your expenses. If it’s positive, you’ve got a surplus. That’s money you can
          put toward savings, extra debt payments, or a goal. If it’s negative, you’ve got a deficit, which means you’re
          spending more than you bring in and making up the difference with savings, credit cards, or loans.
        </p>
        <p style={pStyle}>
          A deficit isn’t a character flaw. It’s information, and honestly, finding out is the whole point. Seeing it on
          screen is a lot better than finding out when the card gets declined.
        </p>
        <p style={pStyle}>
          Be careful with a thin surplus, too. If it only looks positive because you left out irregular costs, it’s not real.
          A $40 surplus won’t survive a $400 car repair.
        </p>

        <h3 style={h3Style}>Debt-to-Income Ratio (DTI)</h3>
        <p style={pStyle}>
          Your DTI compares what you pay toward debts each month to what you earn each month. Lenders look at it to judge
          whether you can handle another loan. Rough guidelines many mortgage lenders use: under about 36% is comfortable, and
          above roughly 43% can make a mortgage tough to get. These aren’t universal. Different lenders, loan types, and
          countries use different cutoffs, and some count only housing debt while others count everything.
        </p>
        <p style={pStyle}>
          If you’re planning to apply for a mortgage, auto loan, or new card in the next year, check your DTI now. If it’s
          high, you’ve got two ways to bring it down: lower the debt payments or raise income. You can test both in the
          calculator before you do anything.
        </p>

        <h3 style={h3Style}>Expense Breakdown by Category</h3>
        <p style={pStyle}>
          This is where the real insight tends to come from. Seeing your spending as slices of a whole makes it obvious what’s
          eating your income. Housing is usually the biggest slice, then transportation, then food. If your list looks
          different, that’s not automatically wrong, but it’s worth asking why.
        </p>
        <p style={pStyle}>
          Look for surprises. Maybe dining out is bigger than groceries. Maybe your subscriptions add up to more than your
          electric bill. Maybe housing is taking up so much that nothing else has room to breathe.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also helps to split expenses into two types. Fixed expenses stay roughly the same every month: rent, loan
          payments, insurance. Variable expenses move around: groceries, gas, entertainment, shopping. Cutting a fixed cost
          takes effort once, like calling your internet provider or finding a cheaper phone plan, and then it pays you back
          every month. Cutting variable costs works faster but takes ongoing willpower.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Monthly vs. Yearly Budget: Which Should You Use?</h2>
        <p style={pStyle}>They use the same math but answer different questions.</p>
        <p style={pStyle}>
          The monthly view is for day-to-day control. Does this month’s income cover this month’s bills? Rent, utilities, and
          loan payments all follow a monthly rhythm, so this is the best place to start if you’ve never budgeted before.
        </p>
        <p style={pStyle}>
          The yearly view is for the bigger picture. It catches the costs that hit you once or twice a year: insurance
          renewals, property taxes, tuition, holiday travel, annual memberships. It’s also the better choice for anyone with
          uneven income. A freelancer might earn $9,000 in March and $2,500 in July. Looking at a single month is misleading,
          but the yearly total tells you what you can really count on.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Best approach? Do both. Use the yearly view to catch the lumpy costs, then use the monthly view to manage cash flow.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When a Budget Calculator Comes in Handy</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Your first real job.</strong> The offer says $55,000, but your first few paychecks say something else. Plug in your take-home pay and realistic living costs to see what you can save from the start.</li>
          <li style={liStyle}><strong>Moving.</strong> Before you sign a lease, add the new rent plus the stuff people forget: higher utilities, parking, commute costs, renter’s insurance, the move itself. Many people only discover the deficit after they’ve signed.</li>
          <li style={liStyle}><strong>Saving for something big.</strong> A wedding, a car, a down payment. Take your target amount and divide it by your monthly surplus. That’s roughly how many months you’ll need. If it’s 80 months, you’ll want to rethink the plan.</li>
          <li style={liStyle}><strong>Getting ready to borrow.</strong> Run your DTI before you apply for anything. If it’s borderline, you’ve got time to pay down a card or two before a lender sees your file.</li>
          <li style={liStyle}><strong>Irregular income.</strong> Freelancers, gig workers, and commission-based sales folks can use the yearly view, average things out, then budget off a conservative number rather than their best month.</li>
          <li style={liStyle}><strong>After a setback.</strong> Job loss, cut hours, medical bills, a divorce. A fresh budget shows what you absolutely have to cover and what can be paused. It also shows how long your savings will realistically last.</li>
          <li style={lastLi}><strong>Sharing finances with a partner or family.</strong> When both people can see the same numbers, money conversations get less emotional. It’s easier to argue about a number on a screen than about who’s “bad with money.”</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Living Within Your Means (and Why It’s Harder Than It Sounds)</h2>
        <p style={pStyle}>
          Almost everyone agrees you should spend less than you earn. Almost everyone struggles with it anyway, and it’s
          usually for a handful of reasons.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Spending more than comes in.</strong> It sounds obvious, but this is the root of most debt. A deficit of $200 a month doesn’t feel dramatic, but it’s $2,400 a year, and with interest it keeps growing.</li>
          <li style={liStyle}><strong>Keeping up appearances.</strong> Social media made this worse. When everyone around you seems to have a new car, a nice vacation, and a remodeled kitchen, it’s easy to spend money just to feel like you belong. Plenty of those people are carrying heavy debt you can’t see.</li>
          <li style={liStyle}><strong>Leaning on credit.</strong> Credit lets you spend money you don’t have yet, which is fine as a short-term bridge and a problem as a lifestyle. Once the balance carries month to month, interest turns every purchase into a more expensive one.</li>
          <li style={lastLi}><strong>Not knowing the basics.</strong> Nobody teaches this in school, at least not well. If you’re not sure how interest works, what an emergency fund is for, or why your DTI matters, that’s normal, and it’s fixable.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A budget doesn’t require perfect discipline. It just takes away the guesswork, so you’re making decisions on
          purpose instead of by accident.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Planning Ahead: What a Budget Helps You Do</h2>
        <p style={pStyle}>
          Companies have whole departments for budgeting and forecasting because it’s hard to hit a goal you haven’t planned
          for. The same applies to you. A decent budget helps you:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Handle surprises without panicking, since you’ve got a cushion built in</li>
          <li style={liStyle}>Build an emergency fund over time</li>
          <li style={liStyle}>Get through stretches when debt payments are heavy</li>
          <li style={liStyle}>Save toward a house, car, wedding, or other major purchase</li>
          <li style={liStyle}>Plan for kids, school, or retirement</li>
          <li style={lastLi}>Decide how much insurance you actually need, and whether you’re overpaying for it</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Should You Spend on Each Category?</h2>
        <p style={pStyle}>Here’s a set of commonly cited guidelines. Treat them as rough checkpoints rather than rules.</p>
        <DataTable headers={GUIDELINE_HEADERS} rows={GUIDELINE_ROWS} />
        <p style={pStyle}>
          One catch worth knowing: most of these were written for gross income. This calculator works from after-tax income,
          so the percentages look bigger on your screen. If you pay roughly 20 to 25% in taxes and payroll deductions, then
          housing at 30% of gross is really somewhere around 35 to 40% of take-home pay. Don’t panic when your housing slice
          looks higher than 30%. Convert it first.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The other catch: these numbers assume an average situation. In an expensive city, housing can easily run over 40%
          even for careful people. In a cheaper area with a long commute, transportation might be your pressure point. Use
          the guidelines to spot outliers, not to judge yourself.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Category by Category: Where to Look for Savings</h2>

        <h3 style={firstH3}>Housing and Utilities</h3>
        <p style={pStyle}>
          For most people, rent or a mortgage is the biggest line in the budget. If yours is well above the guideline, you do
          have options, though none are painless. You can refinance a mortgage if rates have dropped, move somewhere cheaper,
          downsize, or rent out a spare room. Roommates aren’t glamorous, but they’re one of the fastest ways to cut housing
          costs.
        </p>
        <p style={pStyle}>
          Smaller moves help too. A programmable thermostat, LED bulbs, sealing drafts around windows and doors, and washing
          clothes in cold water all trim utility bills. Call your electric or gas provider and ask whether they have a budget
          billing plan, which levels out seasonal spikes so you’re not hit with a $300 bill in January. Also shop for your
          renter’s or homeowner’s insurance every year or two. Rates drift, and loyalty rarely gets rewarded.
        </p>

        <h3 style={h3Style}>Transportation</h3>
        <p style={pStyle}>
          Car payments are usually the largest piece. The best time to control this cost is before you buy: pick a price
          range based on your budget instead of on what the dealer approves you for. A lender will happily approve a payment
          that’s too high for your life.
        </p>
        <p style={pStyle}>
          After the payment, you’ve got fuel, insurance, maintenance, registration, and parking. A few things move the needle:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Keep tires properly inflated, stay on top of oil changes and basic upkeep, and you’ll avoid bigger repair bills later.</li>
          <li style={liStyle}>Smooth driving, without hard acceleration and braking, saves real money on gas over a year.</li>
          <li style={liStyle}>Traffic tickets don’t just cost the fine. They can raise your insurance premium for years.</li>
          <li style={liStyle}>Shop your auto insurance regularly, and ask about discounts for bundling, low mileage, or a clean record.</li>
          <li style={lastLi}>If you live somewhere with decent transit, or work close enough to bike, consider whether you need a second car at all.</li>
        </ul>

        <h3 style={h3Style}>Debt and Loan Payments</h3>
        <p style={pStyle}>
          Credit cards get a bad reputation in budgeting, and it’s fair. The interest rates are high, and it’s easy to treat
          the limit like extra income. It’s not. If you carry a balance, you’re paying a premium on everything you’ve bought.
        </p>
        <p style={pStyle}>
          That said, cards aren’t evil. If you pay the full balance every month, they can be a convenient way to track
          spending, earn rewards, and build credit. The problem starts when you carry a balance you can’t clear.
        </p>
        <p style={pStyle}>If you’ve got more than one debt, the order you tackle them matters. Two popular approaches:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Avalanche:</strong> Pay the minimums on everything, then throw extra money at the debt with the highest interest rate. This saves the most money overall.</li>
          <li style={lastLi}><strong>Snowball:</strong> Pay off the smallest balance first, then roll that payment into the next. It costs a bit more in interest, but the quick wins keep a lot of people motivated.</li>
        </ul>
        <p style={pStyle}>Either works. The best one is the one you’ll stick with.</p>
        <p style={pStyle}>
          On student loans: if you’re juggling several, consolidating can simplify things, but be careful. Combining federal
          loans is different from refinancing them into a private loan, and the latter can mean giving up protections like
          income-driven repayment and forgiveness programs. Look at the details before you decide.
        </p>

        <h3 style={h3Style}>Food and Daily Living</h3>
        <p style={pStyle}>
          These costs feel small individually, which is exactly why they pile up. Dining out and takeout tend to be the
          easiest place to find money, because cooking at home usually costs a fraction of ordering the same meal. You don’t
          have to quit restaurants. Just see what the monthly total looks like, and decide whether you’re getting your money’s
          worth.
        </p>
        <p style={pStyle}>
          A few practical things that work: plan meals for the week before you shop, don’t grocery shop hungry, check the unit
          price instead of the sticker price, and keep a couple of cheap, fast dinners in rotation so you’re not tempted to
          order out on tired nights.
        </p>
        <p style={pStyle}>
          Remember to keep groceries and dining out in separate lines in the calculator. When they’re mashed together, you
          can’t see which one is the problem.
        </p>

        <h3 style={h3Style}>Healthcare</h3>
        <p style={pStyle}>
          Healthcare is one of the hardest categories to trim, and in the U.S. it’s a big one. Average spending per person
          runs well into five figures a year when you include everything insurers and employers pay, though what you
          personally pay out of pocket depends on your plan. Either way, it’s worth planning for rather than hoping you don’t
          need it.
        </p>
        <p style={pStyle}>Ways to keep it in check:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Stay in-network whenever you can. Out-of-network bills can be brutal.</li>
          <li style={liStyle}>Review your insurance every year during open enrollment. The plan that made sense last year may not now.</li>
          <li style={liStyle}>If you’re eligible, use a Health Savings Account (HSA) or Flexible Spending Account (FSA). The money goes in pre-tax, which lowers your taxable income.</li>
          <li style={liStyle}>Ask for generics, and compare pharmacy prices. The same prescription can cost wildly different amounts depending on where you fill it.</li>
          <li style={liStyle}>Preventive care is usually covered at little or no cost, and catching things early is almost always cheaper.</li>
          <li style={lastLi}>For older adults, a safer home matters. Falls are a leading cause of expensive hospital stays, so things like grab bars, better lighting, and removing loose rugs are worth the small cost.</li>
        </ul>

        <h3 style={h3Style}>Children and Education</h3>
        <p style={pStyle}>
          Kids are expensive, and the costs show up in layers: childcare, food, clothing, healthcare, activities, and
          eventually college. This category isn’t about cutting back so much as planning ahead. If you’re expecting, build the
          new costs into the budget before the baby arrives, not after.
        </p>
        <p style={pStyle}>
          For education, look into financial aid, grants, scholarships, and 529 plans, which grow tax-advantaged when used for
          qualified education expenses. Even small, regular contributions add up over 15 or 18 years.
        </p>

        <h3 style={h3Style}>Savings and Investments</h3>
        <p style={pStyle}>
          If there’s one category you shouldn’t treat as optional, it’s this one. A good budget pays your future self first
          instead of whatever’s left over at the end of the month. A common target is 15% of income or more toward savings
          and investments, although if you’re starting from zero, any consistent number beats waiting until you can do more.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Emergency fund first.</strong> Most financial planners suggest three to six months of essential expenses in an easy-to-access account. If your income is irregular or you’re the only earner in the house, aim for the higher end. Having this cushion is often what keeps a surprise expense from turning into credit card debt.</li>
          <li style={liStyle}><strong>Employer retirement match.</strong> If your employer matches contributions to a 401(k) or similar plan, contribute at least enough to get the full match. It’s essentially free money, and skipping it is leaving part of your pay on the table.</li>
          <li style={lastLi}><strong>Then everything else.</strong> Retirement accounts, college savings, a home down payment, other investments. A quick note for later: Social Security benefits can start as early as 62, but claiming early permanently reduces the monthly amount. It’s worth planning around rather than assuming.</li>
        </ul>

        <h3 style={h3Style}>Miscellaneous and “Fun” Spending</h3>
        <p style={pStyle}>
          This is the flexible category, and it’s the one that usually decides whether a budget works. It includes travel,
          hobbies, gifts, pets, shopping, and entertainment, which are all things that sit somewhere between needs and wants,
          depending on who you ask.
        </p>
        <p style={pStyle}>
          The flexibility cuts both ways. Overspend here and it can sink everything else. But a budget with zero room for
          enjoyment doesn’t last. People who cut everything usually burn out and swing the other direction. A better approach
          is to set a specific, realistic amount for fun, and spend it without guilt.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your budget is struggling, this is the first place to look. Not because fun doesn’t matter, but because it’s the
          category where small changes are easiest and hurt least.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Surprise Costs: Sinking Funds</h2>
        <p style={pStyle}>
          An emergency fund covers things you can’t predict. A sinking fund covers things you can predict but don’t happen
          monthly: car registration, holiday gifts, annual insurance, a vacation, vet checkups.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The method is simple. Take the yearly cost, divide by 12, and set that amount aside each month in its own category.
          When the bill arrives, the money’s already there. In the calculator, add each one as a separate line so these costs
          show up in your monthly expenses instead of ambushing you later.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Quick Example</h2>
        <p style={pStyle}>Say someone brings home $4,200 a month after taxes. Their expenses look like this:</p>
        <DataTable headers={EXAMPLE_HEADERS} rows={EXAMPLE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Result: a $305 deficit. Instead of guessing, they can see where to look. Dining out plus entertainment is $720, and
          food costs combined are $800. Trim dining out by $150, trim shopping by $100, and cut a couple of subscriptions for
          $55, and the deficit is gone. Nothing dramatic, just some small, targeted changes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Do If You’re in a Deficit</h2>
        <p style={pStyle}>Don’t panic. Work through it in order:</p>
        <ol style={listGapStyle}>
          <li style={liStyle}><strong>Double-check the numbers.</strong> Make sure nothing is entered twice, and that annual bills weren’t entered as monthly ones.</li>
          <li style={liStyle}><strong>Trim variable spending.</strong> Subscriptions you forgot about, takeout, impulse buys.</li>
          <li style={liStyle}><strong>Lower your fixed bills.</strong> Call your phone, internet, and insurance companies. Ask what they can do. Switch if they won’t budge.</li>
          <li style={liStyle}><strong>Go after high-interest debt.</strong> Interest is a hidden cost that eats your surplus every month.</li>
          <li style={lastLi}><strong>Bring in more income.</strong> Overtime, freelance work, selling things you don’t use, a raise conversation. Sometimes the cleanest fix is a bigger number on top, not a smaller number on the bottom.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          After each change, update the calculator and see how it looks. Watching a deficit shrink is surprisingly motivating.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Budgeting Methods You Can Pair With the Calculator</h2>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>50/30/20.</strong> Roughly half of after-tax income for needs, 30% for wants, and 20% for savings and debt payoff. It’s a handy yardstick. Compare it with your breakdown and you’ll see right away where you’re off. In high-cost areas, needs often run past 50%, and that’s a reason to adjust the rule, not to feel like you’ve failed.</li>
          <li style={liStyle}><strong>Zero-based budgeting.</strong> Every dollar gets a job. Income minus expenses and savings equals zero. If you’ve got a surplus, it goes to a goal rather than sitting around and slowly disappearing.</li>
          <li style={liStyle}><strong>Pay yourself first.</strong> Enter savings as a fixed expense and build everything else around it, so saving isn’t dependent on what’s left.</li>
          <li style={lastLi}><strong>Envelope method.</strong> You set a cash (or digital) limit for categories like groceries or fun, and when it’s gone, it’s gone. It’s old-school, but it works well for problem categories.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Pick the one that fits your personality, and don’t be afraid to mix them.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use a Calculator Instead of a Spreadsheet?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Spreadsheets are flexible, and plenty of people love them. But they take time to build, one wrong formula can throw
          everything off, and you may not notice. A calculator does the math automatically: totals, surplus or deficit, DTI,
          and the category breakdown. It’s quicker, there’s less to go wrong, and it works on your phone when you’re standing
          in a store trying to decide if you can afford something.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Easy to Trust</h2>
        <p style={pStyle}>
          This budget calculator is free to use with no hidden charges. The calculations run in your browser, nothing you
          enter is stored or sent anywhere, and you don’t need to sign up.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy: the calculator does straightforward math on whatever you enter, so the results are only as good as
          your inputs. It’s a planning tool, not tax, legal, or financial advice. If you’ve got a complicated tax situation,
          big investments, or a major loan decision, it’s worth talking to a qualified professional.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Better Results</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Use real numbers from statements, not memory.</li>
          <li style={liStyle}>Be a little pessimistic: round expenses up and income down.</li>
          <li style={liStyle}>Treat savings as a bill, not a leftover.</li>
          <li style={liStyle}>Keep irregular costs on their own lines.</li>
          <li style={liStyle}>Revisit your budget every month for the first few months, then at least every quarter. Rebuild it after any big change, like a raise, a move, a new baby, or a job switch.</li>
          <li style={lastLi}>Don’t aim for perfection. A budget that’s 90% accurate and gets used beats a perfect one you never open.</li>
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
