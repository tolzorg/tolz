import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the best way to pay off multiple credit cards?",
    a: "For most people, the cheapest way is the debt avalanche. Pay the minimum on every card, then put all your extra money on the card with the highest APR. When it's gone, move to the next-highest one. If you need quick wins to stay motivated, the snowball (smallest balance first) is a fair alternative.",
  },
  {
    q: "How does a credit card payoff calculator work?",
    a: "It adds monthly interest to each balance, subtracts your payments, and repeats until everything's at zero. This one follows the avalanche method, so after the minimums, your extra money goes to the highest-rate card first. You get the number of months, total interest, and the payoff order.",
  },
  {
    q: "How long will it take to pay off my credit card debt?",
    a: "It depends on your balances, your rates, and how much you pay each month. Enter your cards and a realistic monthly budget and the calculator will show your timeline. Then try a few higher budgets to see how much sooner you could finish.",
  },
  {
    q: "Is the debt avalanche better than the debt snowball?",
    a: "Avalanche is cheaper because it goes after the highest-rate debt first. Snowball can feel better early on because small balances disappear quickly. How much money you save by choosing avalanche depends on how different your rates are. Pick the one you'll actually stick with.",
  },
  {
    q: "Can I use this to pay off more than one credit card?",
    a: "Yes, that's exactly what it's built for. Add each card with its balance, APR, and minimum, and it builds one combined schedule.",
  },
  {
    q: "Do I need to sign up to use the credit card payoff calculator?",
    a: "No. It's free, and you don't need an account.",
  },
  {
    q: "What if I can only afford the minimum payments?",
    a: "Put the total of your minimums in as your budget to see the real cost and timeline. Then try adding even $25 or $50 extra to see how much interest it saves. If you can't cover the minimums, contact your issuers about hardship options and consider a nonprofit credit counselor.",
  },
  {
    q: "Does the calculator include new purchases or fees?",
    a: "No. It assumes you stop charging on the cards and doesn't factor in late fees, annual fees, or cash advance charges. New purchases will push your real payoff date back.",
  },
  {
    q: "Is a balance transfer better than the avalanche method?",
    a: "It can be, if the fee is low, the 0% period is long enough to clear most of the balance, and you don't run up the old cards again. Run your current plan here, then compare its total interest to the transfer fee plus any interest you'd still owe after the promo ends.",
  },
  {
    q: "Should I use a personal loan to consolidate my credit cards?",
    a: "It might help if you can get a rate clearly lower than what your cards charge. Check for origination fees and compare the total cost to your avalanche numbers. A loan also gives you a fixed end date, which some people like.",
  },
  {
    q: "Will paying off credit cards raise my credit score?",
    a: "Usually, yes, mostly because it lowers your credit utilization. That's the share of your available credit you're using. Lower is better, and getting under 30% is a common goal.",
  },
  {
    q: "Should I close my credit cards after paying them off?",
    a: "Not necessarily. Closing a card lowers your total available credit, which can raise your utilization, and it may shorten your credit history. If a card has no annual fee, keeping it open is often better. If it does have a fee you don't want to pay, ask the issuer about switching to a no-fee version first.",
  },
  {
    q: "What APR should I enter?",
    a: "Use the purchase APR on your latest statement. If a promotional or penalty rate currently applies, use that one. If a promo ends during your payoff window, rerun the calculation when the rate changes.",
  },
  {
    q: "How accurate are the results?",
    a: "They're a reliable estimate based on standard monthly interest math. Rate changes, billing cycle timing, and fees can make small differences compared to your real statements, so recheck every few months.",
  },
];

const CARD_HEADERS = ["Card", "Balance", "APR", "Minimum"];
const CARD_ROWS = [
  ["Card A", "$6,000", "24.99%", "$150"],
  ["Card B", "$3,500", "19.99%", "$90"],
  ["Card C", "$1,500", "15.99%", "$40"],
];

const APPROACH_HEADERS = ["Approach", "Monthly payment", "Time to pay off", "Total interest"];
const APPROACH_ROWS = [
  ["Minimums only", "$280", "about 73 months", "about $9,235"],
  ["Snowball", "$800", "about 17 months", "about $1,950"],
  ["Avalanche", "$800", "about 16 months", "about $1,690"],
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

export default function CreditCardPayoffCalculatorFaqSection() {
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
        <h2 style={h2Style}>How the Credit Card Payoff Calculator Works</h2>
        <p style={pStyle}>
          Think of it as a month-by-month simulation of your debt. Every month, the calculator adds interest to each
          card, pays the minimum on all of them, and then sends whatever's left of your budget to the card with the
          highest interest rate. When that card hits zero, the money that was going to it rolls over to the
          next-highest-rate card. And so on, until you're done.
        </p>
        <p style={pStyle}>
          The reason that rolling effect matters is simple. Your total monthly payment stays the same the whole way
          through, but the amount aimed at your most expensive debt keeps growing as each card disappears. That's why
          the last few cards tend to go fast, and why people call it an avalanche.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          What you get back is a full timeline instead of one vague number. You can see which card clears first,
          when each one is gone, your total interest cost, and your debt-free date.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What You Need to Enter</h2>
        <p style={pStyle}>Grab your most recent statements before you start. For every card, you'll need:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Current balance.</strong> What you owe right now, not your credit limit.
          </li>
          <li style={liStyle}>
            <strong>APR.</strong> The purchase APR listed on your statement. If a promotional rate is running, use
            whatever's actually being charged at the moment.
          </li>
          <li>
            <strong>Minimum payment.</strong> The lowest amount your issuer will accept this month.
          </li>
        </ul>
        <p style={pStyle}>
          Then you set your total monthly budget for credit cards. That's the full amount, minimums included. It has
          to be at least as much as all your minimums added together. Whatever's above that total is your "extra,"
          and the extra is what makes the avalanche work.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One piece of advice here: be honest about the number. A plan built on a payment you can only keep up for a
          few months isn't much of a plan. It's better to run the calculator with a number you can actually hit every
          month, then bump it up later when you get a raise or free up some cash.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Calculator Assumes</h2>
        <p style={pStyle}>
          Every payoff calculator simplifies a few things, and it's better to know what they are up front. This one
          assumes:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>No new purchases.</strong> You stop charging on these cards. If you keep adding to them, your real
            payoff date will be later than the schedule says.
          </li>
          <li style={liStyle}>
            <strong>Fixed minimum payments.</strong> The minimums you enter stay the same each month.
          </li>
          <li>
            <strong>Static interest rates.</strong> Your APR doesn't change during the payoff period.
          </li>
        </ul>
        <p style={pStyle}>
          Those last two are reasonable but not perfect. Most issuers calculate minimums as a percentage of your
          balance plus interest and fees (often with a flat floor like $25 or $35), so real minimums drift lower as
          your balance drops. That doesn't hurt you here, since you're paying a set budget anyway.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On rates, federal law gives you some protection. Under the CARD Act, an issuer has to give you 45 days'
          notice before raising your rate, and in most cases it can't raise the rate on a balance you already owe.
          The exceptions include variable-rate cards (which move with a benchmark rate), the end of a promotional
          rate, and falling more than 60 days behind on payments. So if you have a variable APR, check your
          statements every few months and rerun the numbers if the rate has moved.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Debt Avalanche Method</h2>
        <p style={pStyle}>
          Here's how the avalanche works. You pay the minimum on every card, no exceptions, because missing one means
          late fees and possibly a penalty rate. Then you take everything left in your budget and throw it at the
          card with the highest APR. When it's paid off, you move to the card with the next-highest rate.
        </p>
        <p style={pStyle}>
          It saves the most money because interest is a cost you pay for every day a balance sits there. A dollar of
          debt at 29% costs you way more than a dollar at 16%, so killing the 29% dollars first shrinks the total
          bill. Under fixed balances and rates, no other ordering costs less.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two quick details people get wrong. First, the avalanche looks at the rate, not the balance. A $900 card at
          28% goes before a $7,000 card at 18%, even if the big one feels scarier. Second, if two cards have the
          exact same APR, it doesn't matter which one you pick first. The interest comes out the same either way, so
          go with whichever is smaller if you want a quicker win.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Debt Snowball Method</h2>
        <p style={pStyle}>
          The snowball is another well-known approach. The first step is identical: minimums on everything. After
          that, all your extra money goes to the card with the smallest balance, no matter what the rate is. When
          that one's gone, you roll its payment onto the next-smallest, and so on.
        </p>
        <p style={pStyle}>
          It usually costs more in interest, but it's not a bad strategy, because the math isn't the only thing that
          matters. Wiping out a card entirely feels good. You get a statement that says $0, one fewer due date to
          track, and some proof you're making headway. A lot of people stick with a plan much longer when they can
          see that kind of progress early, and a plan you quit in month six saves you nothing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So there isn't one right answer for everyone. If the numbers motivate you, go avalanche. If you tend to lose
          steam on long grinds, a snowball might get you to the finish line more reliably. The one thing that's
          definitely wrong is using neither and just paying minimums.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Avalanche vs. Snowball vs. Minimums Only</h2>
        <p style={pStyle}>
          Here's a real comparison so you can see what's at stake. Say you have three cards:
        </p>
        <DataTable headers={CARD_HEADERS} rows={CARD_ROWS} />
        <p style={pStyle}>
          That's $11,000 total with $280 in required minimums. Here's how three approaches compare, using fixed
          minimums as the calculator does:
        </p>
        <DataTable headers={APPROACH_HEADERS} rows={APPROACH_ROWS} />
        <p style={pStyle}>
          Look at the gap between the first row and the other two. Paying $520 more per month turns a six-year slog
          into a bit over a year, and it keeps around $7,500 in your pocket. The difference between snowball and
          avalanche is real, but it's much smaller, about $260 here. That's worth knowing if you're debating between
          the two. Picking any real plan matters far more than picking the perfect one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          How big the avalanche advantage gets depends on how spread out your rates are. If all your cards sit within
          a couple of points of each other, the two methods land close together. If one card is at 29% and the rest
          are at 15%, avalanche pulls ahead more.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Credit Card Interest Actually Works</h2>
        <p style={pStyle}>
          Most of us never learned this in school, and it explains a lot about why card debt is so sticky.
        </p>
        <p style={pStyle}>
          Your APR is an annual number, but issuers don't charge it once a year. They divide it by 365 to get a daily
          rate, then apply that to your balance each day. That's the average daily balance method that most issuers
          use. At the end of the billing cycle, they add up the daily interest and tack it onto your balance. Because
          that interest becomes part of the balance, it then earns interest too. This calculator uses the common
          simplification of APR divided by 12 each month, which lands very close to the real thing for planning
          purposes.
        </p>
        <p style={pStyle}>Two things follow from this:</p>
        <p style={pStyle}>
          <strong>Paying earlier in the month lowers your interest.</strong> If you pay $500 on day 5 of your cycle
          instead of day 28, that $500 stops accruing interest 23 days sooner. It's not a huge difference per
          payment, but if you split your monthly payment into two halves (say, one on payday and one two weeks
          later), you'll shave a little off the interest over time.
        </p>
        <p style={pStyle}>
          <strong>The grace period disappears when you carry a balance.</strong> Normally you get a window where new
          purchases don't accrue interest as long as you pay the full statement balance. Once you're carrying debt,
          that goes away on most cards, and new purchases start accruing interest right away. That's one more reason
          to stop using the cards during the payoff.
        </p>
        <p style={pStyle}>
          Now, why are minimum payments such a trap? Take a single card with $5,000 at 22% APR:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            Paying $100 a month takes around 137 months, over 11 years, and costs roughly $8,700 in interest.
          </li>
          <li style={liStyle}>Paying $150 a month takes around 52 months and costs about $2,800.</li>
          <li>Paying $200 a month takes around 34 months and costs about $1,750.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Going from $150 to $200, just $50 more, cuts about a year and a half off and saves around $1,000. Small
          bumps hit hard when the rate is this high, which is why it's worth testing a few different budget numbers
          in the calculator.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading Your Results</h2>
        <p style={pStyle}>When the schedule comes back, there are three numbers to look at.</p>
        <p style={pStyle}>
          <strong>Payoff time.</strong> This is how many months until every card's at zero. Count forward on a
          calendar and write down the date. It makes the whole thing real.
        </p>
        <p style={pStyle}>
          <strong>Total interest.</strong> This is what the debt actually costs you under your plan. Compare it to
          the minimums-only number. That gap is what you're saving, and for most people it's the thing that gets them
          to bump their budget up.
        </p>
        <p style={pStyle}>
          <strong>Payoff order.</strong> Check which card goes first. Sometimes it's the one you weren't thinking
          about, like an old store card with a sneaky 27% rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the timeline's longer than you hoped, don't give up on it. Try a few different budget amounts and see
          what changes. Sometimes an extra $75 a month moves the finish line by half a year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Pay Off Credit Card Debt, Step by Step</h2>
        <p style={pStyle}>
          The calculator does the math, but here's a sensible order of operations for the real-life side of it:
        </p>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>List every card</strong> with its balance, APR, and minimum. Include the ones you barely use.
          </li>
          <li style={liStyle}>
            <strong>Figure out your real monthly budget.</strong> Look at what's left after rent, food, utilities,
            and other essentials. Be conservative.
          </li>
          <li style={liStyle}>
            <strong>Run the numbers</strong> in the calculator, then try a few different budgets.
          </li>
          <li style={liStyle}>
            <strong>Set up autopay for the minimums</strong> on every card so nothing slips.
          </li>
          <li style={liStyle}>
            <strong>Aim the extra at your target card</strong> each month, either manually or with a scheduled extra
            payment.
          </li>
          <li style={liStyle}>
            <strong>Stop adding new charges.</strong> If you need a card for essentials, pick one and pay it off in
            full each month.
          </li>
          <li>
            <strong>Recheck every few months.</strong> If your rates, income, or balances change, rerun the plan.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're not sure whether you want an avalanche or a snowball, there's also a middle route. Some people run
          a snowball for the first card or two to get a quick win, then switch to avalanche for the rest. It's not as
          mathematically clean, but it works fine when it keeps you going.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Want a Payoff Plan</h2>
        <p style={pStyle}>This kind of calculator comes in handy in more situations than you'd think:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>You've got several cards at different rates.</strong> Store card, travel card, the one from
            college. It's easy to lose track of which one's costing you the most.
          </li>
          <li style={liStyle}>
            <strong>You just got a bonus or tax refund.</strong> Before it disappears into something else, you can see
            exactly how much sooner it'd wipe out your debt.
          </li>
          <li style={liStyle}>
            <strong>You're planning a big purchase.</strong> If you're thinking about a mortgage, car loan, or
            apartment lease, a lender will look at your debts. Knowing your debt-free date helps with timing.
          </li>
          <li style={liStyle}>
            <strong>You're weighing a balance transfer or loan.</strong> Your current plan is the baseline everything
            else has to beat.
          </li>
          <li style={liStyle}>
            <strong>You're getting back on your feet.</strong> After a job loss, medical bill, or move, a written plan
            feels a lot better than a pile of statements.
          </li>
          <li>
            <strong>You're helping a parent, partner, or friend.</strong> Seeing the numbers laid out makes a
            stressful conversation easier.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why People End Up With Several Cards</h2>
        <p style={pStyle}>
          Having more than one card isn't a mistake on its own. Most adults with decent credit end up with a few, and
          there are good reasons for it.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Different perks.</strong> One card might give you airline miles, another cash back on groceries,
            another a 0% intro rate on transferred balances, and a business card can keep work expenses separate from
            personal ones at tax time.
          </li>
          <li style={liStyle}>
            <strong>More total available credit.</strong> Two cards with $5,000 limits give you $10,000 of room
            instead of $5,000.
          </li>
          <li style={liStyle}>
            <strong>A backup.</strong> If a card gets lost, stolen, frozen for fraud checks, or just isn't accepted
            somewhere, you've got another one.
          </li>
          <li style={liStyle}>
            <strong>Spreading out risk.</strong> If one card number gets compromised, the damage is limited to that
            account instead of everything you spend.
          </li>
          <li>
            <strong>Better credit utilization.</strong> More total credit limit means the same spending looks like a
            smaller percentage of what's available. More on that below.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Downsides of Carrying Multiple Cards</h2>
        <p style={pStyle}>
          Of course, there's a flip side, and it's the reason a lot of people end up needing a payoff calculator in
          the first place.
        </p>
        <p style={pStyle}>
          The biggest issue is overspending. Credit card debt tends to come from the same few places: purchases that
          weren't really necessary, emergencies like medical bills or car repairs, essentials that income didn't
          cover, and stretches without a paycheck. Everyday spending that creeps up is probably the biggest piece of
          it. More cards means more available credit, and more available credit makes it easier to spend past your
          means without noticing.
        </p>
        <p style={pStyle}>
          Cards are also unsecured debt, and the interest rates are high compared to most other consumer borrowing,
          often well above 20%. Miss a payment and you can get hit with a late fee and, depending on the card, a
          higher penalty rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And then there's the logistics. Four cards means four due dates, four logins, four statements, and four
          chances to forget one. A single missed payment can dent your credit and cost you more than a month of
          interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Managing Multiple Cards</h2>
        <p style={pStyle}>
          <strong>Line up your due dates.</strong> Most issuers let you change your payment due date, and many make it
          easy to do online. Putting all your cards on the same day, or just two days a month, makes tracking much
          simpler.
        </p>
        <p style={pStyle}>
          <strong>Turn on autopay for at least the minimum.</strong> That one step protects you from late fees and
          credit score hits. Pay extra manually or set up a larger fixed payment on your target card.
        </p>
        <p style={pStyle}>
          <strong>Think before closing cards.</strong> Cutting down on cards you don't use can simplify things,
          especially ones with annual fees. But closing a card lowers your total available credit, which can bump up
          your utilization, and it can shorten your credit history over time. If a card has no annual fee, it's often
          better to keep it open, stash it somewhere, and use it for one tiny recurring charge so it doesn't get
          closed for inactivity.
        </p>
        <p style={pStyle}>
          <strong>Match cards to their strengths.</strong> If you do keep several, use each where it earns the most,
          like the travel card for flights and the no-foreign-fee card for trips abroad. If you can't remember which
          card does what, you probably have too many.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Check statements, not just balances.</strong> Look for fees, rate changes, and charges you don't
          recognize. It's also a good habit for catching fraud early.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Lower Your Interest Rate</h2>
        <p style={pStyle}>
          Avalanche reduces how much interest you pay by ordering your payments smartly. These options go after the
          rate itself.
        </p>
        <p style={pStyle}>
          <strong>Balance transfer cards.</strong> You move debt from one or more high-rate cards to a new card that
          has a low or 0% introductory APR, usually for something like 12 to 21 months. Most charge a transfer fee,
          commonly 3% to 5% of what you move. The deal works if you can pay off the balance before the promo ends.
        </p>
        <p style={pStyle}>
          Here's what that looks like. Say you have $6,000 at 24.99%, and you can pay $400 a month. Left alone, that
          takes about 19 months and costs roughly $1,270 in interest. Move it to a 0% card for 15 months with a 3%
          fee ($180), and the same $400 payments clear it in about 16 months for around $185 total. That's a big
          savings, but only because the payments fit inside the promo window. If you'd only been able to pay $150 a
          month, a good chunk of the balance would still be sitting there when the regular rate kicked in.
        </p>
        <p style={pStyle}>
          Watch out for two things. Some store cards advertise "no interest" deals that are actually deferred
          interest, meaning if you don't clear the balance by the deadline, you owe interest back to day one. That's
          different from a true 0% APR. And as the competitor guides tend to stress, don't run your old cards back up
          after transferring. That's how people end up with double the debt.
        </p>
        <p style={pStyle}>
          <strong>Personal loans.</strong> A fixed-rate personal loan can pay off your cards and leave you with one
          payment and a set end date. Rates for people with strong credit can be well under card rates, though
          they're often not great for people with weaker credit. Check for origination fees, which some lenders take
          out of the loan up front, and compare the total cost to your avalanche numbers.
        </p>
        <p style={pStyle}>
          <strong>Home equity loans or lines of credit.</strong> The rates can be lower still, but your house is the
          collateral. Turning unsecured card debt into debt secured by your home is a serious risk. If you're thinking
          about it, make sure you're confident about your income and your plan to stop the cards from filling back
          up.
        </p>
        <p style={pStyle}>
          <strong>Asking your issuer for a lower rate.</strong> It's worth a call, especially if you've been paying on
          time for a while. Be direct: say you've been a customer for X years, you're working on paying down your
          balance, and you'd like a lower APR. Sometimes they say yes, sometimes they don't, but it costs nothing to
          ask. One thing I'd steer clear of is the idea, which floats around online, that you have to stop making
          payments before an issuer will negotiate. That can wreck your credit, trigger fees and a penalty rate, and
          send the account to collections. Plenty of issuers have hardship programs you can ask about while staying
          current.
        </p>
        <p style={pStyle}>
          <strong>Nonprofit credit counseling.</strong> If your payments are too tight to make the math work, a
          nonprofit credit counseling agency (look for ones affiliated with the National Foundation for Credit
          Counseling) can review your whole budget, often for free or a small fee. They may set you up with a debt
          management plan, where they negotiate lower interest rates with your issuers and you make one monthly
          payment to the agency. You usually have to close the enrolled cards, but it can make an impossible
          situation workable.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Debt settlement companies.</strong> Be careful here. Settlement usually means stopping payments
          while you save up for a lump-sum offer. That can tank your credit, the fees are high, and forgiven debt can
          create a tax bill. For most people it's a last resort at best.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Consolidation vs. the Avalanche Method</h2>
        <p style={pStyle}>
          So should you consolidate or just avalanche? It comes down to rates, fees, and what you'll actually do.
        </p>
        <p style={pStyle}>
          <strong>Consolidation makes sense</strong> when you can get a meaningfully lower rate than what you're
          paying now and the fees don't eat the savings. It also gives you a single payment, which helps if juggling
          due dates is your problem. A personal loan adds structure, since it has a fixed end date.
        </p>
        <p style={pStyle}>
          <strong>The avalanche makes sense</strong> when your credit isn't strong enough for a good consolidation
          offer, when your rates are already moderate, or when you'd rather not open another account. It's free to
          do, and there's nothing to qualify for.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's a simple test: run your current plan through the calculator and write down the total interest. Then
          work out the same total for the consolidation option, including all the fees. Whichever is lower, wins. You
          can also do both: consolidate part of your debt, and avalanche what's left.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Credit Card Debt Affects Your Credit Score</h2>
        <p style={pStyle}>
          Your credit utilization ratio is how much of your available revolving credit you're using. If you owe
          $3,000 across cards that have $10,000 in total limits, you're at 30%. It's one of the biggest pieces of your
          score, because the "amounts owed" category makes up roughly 30% of a FICO score.
        </p>
        <p style={pStyle}>
          The usual advice is to stay under 30%, and lower is better. People with the highest scores often sit in the
          single digits. If you're up near your limits, your score's probably getting dragged down, so paying down
          balances is one of the fastest ways to lift it.
        </p>
        <p style={pStyle}>A couple of details worth knowing:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Issuers usually report your balance on your statement closing date</strong>, not your due date.
            So even if you pay in full every month, a big balance on the closing date can show up as high
            utilization. Paying down your card a few days before it closes can help.
          </li>
          <li style={liStyle}>
            <strong>Each card's utilization counts</strong>, not just the total. One maxed-out card can hurt even if
            your overall ratio looks fine. This is another reason the avalanche is useful, since it tends to hit your
            high-rate cards, which are often your most loaded ones.
          </li>
          <li>
            <strong>Closing a paid-off card can raise your ratio.</strong> If you pay off a card and close it, you
            lose that credit limit, and your remaining balances now take up a bigger slice of what's left.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As you pay things down, check your score every so often. Many banks and card issuers show it for free. It's
          a nice way to watch your progress, and it can also point out other problems you can fix, like an old error
          on your report.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Speed Things Up</h2>
        <p style={pStyle}>Small changes add up, especially at 20-something percent interest:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Round your payment up.</strong> If your budget works out to $737, call it $750.
          </li>
          <li style={liStyle}>
            <strong>Send windfalls to the target card.</strong> Tax refunds, bonuses, and side income do the most good
            when they hit the highest-rate balance.
          </li>
          <li style={liStyle}>
            <strong>Make two payments a month</strong> instead of one to cut your average daily balance.
          </li>
          <li style={liStyle}>
            <strong>Sell stuff you don't use</strong> and put the cash toward the debt.
          </li>
          <li style={liStyle}>
            <strong>Pause nonessential subscriptions</strong> for the length of the plan and redirect the money.
          </li>
          <li style={liStyle}>
            <strong>Keep a small cash cushion</strong> so a surprise car repair doesn't end up back on a card.
          </li>
          <li>
            <strong>Rerun the calculator whenever your budget changes</strong>, so the timeline stays real.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>If You Can't Cover Your Minimums</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your required minimums are more than you can pay right now, the calculator can't build a working plan,
          and that's a signal to act early rather than wait. Start by calling your issuers and asking about hardship
          programs, which may include lower rates, reduced payments, or waived fees for a set period. Then look at
          nonprofit credit counseling, as described above. The earlier you reach out, the more options you tend to
          have. Missing payments quietly is the worst way to handle it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Reliable</h2>
        <p style={pStyle}>
          This credit card payoff calculator is free to use, and you don't need to sign up or create an account.
          There are no locked features, and nothing about it costs you anything. It only needs the balances, rates,
          and payments you decide to enter. It doesn't ask for card numbers, logins, your name, or anything else that
          identifies you, and you shouldn't type any of that into any calculator.
        </p>
        <p style={pStyle}>
          For accuracy, the tool uses standard monthly interest math and the avalanche ordering rule, so you'll get
          the same results every time you enter the same numbers. Still, treat the output as a solid estimate, not a
          promise. Actual statements can differ a little because of billing cycle dates, daily interest, fees, and
          rate changes. Check your real balances every few months and adjust.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator gives you general information, not personal financial advice. If your situation is
          complicated, like collections, a lawsuit, or income that's changing a lot, talking to a nonprofit credit
          counselor is a smart move.
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
