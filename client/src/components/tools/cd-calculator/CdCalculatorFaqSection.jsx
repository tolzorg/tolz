import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate CD interest?",
    a: "Use A = P × (1 + r/n)^(n×t) and subtract your deposit. The CD calculator does it for you with annual, monthly, or continuous compounding.",
  },
  {
    q: "How much will $10,000 earn in a CD?",
    a: "At 4.5% for five years with monthly compounding, you'd end up with about $12,517, which is roughly $2,517 in interest. Change the rate or term and the answer changes.",
  },
  {
    q: "How much interest will I earn on $1,000 in a CD?",
    a: "At 4.5% for one year with monthly compounding, about $46. It scales with your deposit.",
  },
  {
    q: "Is CD interest taxable?",
    a: "In the U.S., yes, as ordinary income, in the year it's credited. Inside a traditional IRA it's tax-deferred. Inside a Roth IRA, qualified withdrawals are tax-free.",
  },
  {
    q: "Is CD interest paid monthly or at maturity?",
    a: "It depends on the CD. Many compound monthly. Some let you take interest as payments. Check your terms and match the calculator's setting.",
  },
  {
    q: "What's the difference between APY and interest rate?",
    a: "The interest rate is the base rate. APY adds in the effect of compounding for a full year. Don't enter an APY as a rate and then compound it again.",
  },
  {
    q: "Can I add money to a CD after opening it?",
    a: "Usually not. Most CDs take one deposit at the start. Some banks offer add-on CDs, but they're less common.",
  },
  {
    q: "What happens if I withdraw early?",
    a: "You'll usually pay a penalty, often several months of interest. For long terms it can be a year or more. It can cut into principal if you withdraw early in the term.",
  },
  {
    q: "Does this calculator include early withdrawal penalties?",
    a: "No. It assumes you hold the CD to maturity. Subtract your bank's penalty if you might cash out early.",
  },
  {
    q: "Is a CD better than a savings account?",
    a: "It depends. A CD locks in a rate and often pays more, but you give up access. A savings account stays flexible, but the rate can drop. Many people use both.",
  },
  {
    q: "Are CDs safe?",
    a: "At FDIC-insured banks, deposits are covered up to $250,000 per depositor, per bank, per ownership category. Credit unions have NCUA coverage.",
  },
  {
    q: "What happens when my CD matures?",
    a: "You'll typically get a grace period of about a week or so to take the money or change terms. After that, many banks auto-renew it.",
  },
  {
    q: "Is this CD calculator free?",
    a: "Yes, you can use it as often as you like.",
  },
];

// Structured data uses the supplied schema wording, which phrases one question differently.
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  item.q === "What happens if I withdraw early?" ? { ...item, q: "What happens if I withdraw from a CD early?" } : item
);

const EXAMPLE_HEADERS = ["Compounding", "Ending balance", "Interest earned"];
const EXAMPLE_ROWS = [
  ["Annual", "$12,461.82", "$2,461.82"],
  ["Monthly", "$12,517.30", "$2,517.30"],
  ["Continuous", "$12,523.20", "$2,523.20"],
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

export default function CdCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Certificate of Deposit Calculator Does</h2>
        <p style={pStyle}>
          You give it a lump sum, an interest rate, and a length of time. It tells you what the CD will be worth at
          maturity. You can choose annual, monthly, or continuous compounding, so you can match the math to how your bank
          credits interest. If you enter a tax rate, you'll also see your after-tax earnings.
        </p>
        <p style={pStyle}>
          You get more than one number back. There's the ending balance, the total interest earned, and two schedules.
          One is an annual breakdown for the big picture. The other is month by month, for when you want to know what the
          CD is worth at a particular point along the way. So it covers what people usually mean by a CD interest
          calculator, a CD maturity calculator, and a CD earnings calculator.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One limit up front. The calculator is built for standard fixed-rate CDs. There are other kinds, like bump-up or
          callable CDs, and those don't follow a single locked rate. For those, treat the result as a rough estimate. More
          on that further down.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the CD Calculator</h2>
        <p style={pStyle}>
          <strong>Enter your deposit.</strong> That's the amount you'll put in when you open the CD. With most CDs, this
          is the only deposit you get to make. You usually can't add money later.
        </p>
        <p style={pStyle}>
          <strong>Set the term.</strong> Common terms run from three months up to five years, and some banks go longer.
          Enter it in months or years, whichever you've got.
        </p>
        <p style={pStyle}>
          <strong>Enter the rate.</strong> Banks usually advertise APY, which already counts compounding. If you've got
          an APY, set compounding to annual so you don't compound it twice. If you've got the plain interest rate, use
          that and pick the compounding your bank states.
        </p>
        <p style={pStyle}>
          <strong>Pick the compounding.</strong> Annual, monthly, or continuous. Monthly is the most common for real
          CDs.
        </p>
        <p style={pStyle}>
          <strong>Add a tax rate (optional).</strong> Use your marginal rate. If you owe state income tax too, add the
          two together for a more realistic number.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then look at the ending balance and total interest. Open the schedules after that. A good habit is to change
          one thing at a time, like the term or the compounding, so you can see what actually moves the result. Usually
          it's the rate and the term, not the compounding.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Decides How Much You'll Earn</h2>
        <p style={pStyle}>
          Three inputs do most of the work: your deposit, the term, and the rate. A few features of how CDs work shape the
          rest.
        </p>
        <p style={pStyle}>
          <strong>One deposit only.</strong> In most cases you fund the CD when you open it, and that's it. If you want
          to keep adding money over time, a savings account fits better.
        </p>
        <p style={pStyle}>
          <strong>A fixed term.</strong> The longer the term, the longer your interest has to compound. Longer terms also
          tend to pay higher rates, though that's not guaranteed. It depends on where rates are at the time.
        </p>
        <p style={pStyle}>
          <strong>A fixed rate.</strong> Unlike a savings account, whose rate can change any time, a standard CD's rate is
          locked. That's great if rates fall after you open it. It stings if rates climb.
        </p>
        <p style={pStyle}>
          <strong>A penalty for leaving early.</strong> Pull money out before maturity and you'll usually forfeit some
          interest. In some cases it can even dip into your principal.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because the rate is fixed, you can figure out up front exactly what you'll have at the end. That predictability
          is the whole appeal, and it's why a calculator is so useful here.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate CD Interest by Hand</h2>
        <p style={pStyle}>If you like seeing the math, here's the formula for annual or monthly compounding:</p>
        <div style={formulaStyle}>A = P × (1 + r/n)^(n×t)</div>
        <ul style={listGapStyle}>
          <li style={liStyle}>A is your ending balance</li>
          <li style={liStyle}>P is your principal, meaning the deposit</li>
          <li style={liStyle}>r is the annual rate as a decimal (4.5% becomes 0.045)</li>
          <li style={liStyle}>n is how many times a year interest compounds (1 for annual, 12 for monthly)</li>
          <li style={liStyle}>t is the term in years</li>
        </ul>
        <p style={pStyle}>
          To get just the interest, subtract your deposit from the ending balance: Interest = A − P.
        </p>
        <p style={pStyle}>For continuous compounding, the formula is:</p>
        <div style={formulaStyle}>A = P × e^(r×t)</div>
        <p style={pStyle}>where e is about 2.71828.</p>
        <p style={pStyle}>Here's a real example. Say you put $10,000 into a five-year CD at 4.5%:</p>
        <DataTable headers={EXAMPLE_HEADERS} rows={EXAMPLE_ROWS} />
        <p style={pStyle}>
          Monthly beats annual by about $55 over five years. Continuous adds only about $6 more on top of monthly. So once
          you're comparing offers, the rate matters far more than how often it compounds.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick shortcut for context is the rule of 72. Divide 72 by the rate and you get the rough number of years to
          double your money. At 4%, that's about 18 years. CDs are great for protecting and steadily growing savings, but
          they won't double your money fast.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Annual, Monthly, and Continuous Compounding</h2>
        <p style={pStyle}>
          Compounding just means your interest starts earning interest. The more often it's credited, the more you end up
          with, though the gains shrink fast as frequency goes up.
        </p>
        <p style={pStyle}>
          <strong>Annual</strong> adds interest once a year. It's the simplest setup, and it's the one to use when you're
          working from a published APY.
        </p>
        <p style={pStyle}>
          <strong>Monthly</strong> is what most banks and credit unions actually do. If your statement shows interest in
          posting each month, this is your match.
        </p>
        <p style={pStyle}>
          <strong>Continuous</strong> is the theoretical limit, where interest compounds nonstop. Almost no real CD works
          this way, but it's a handy ceiling. If the continuous number is barely above the monthly one, you know extra
          compounding isn't worth chasing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's one more thing the calculator can't see: whether your bank pays interest out or lets it compound. Some
          CDs send interest to your checking account every month. If you take it as a payout, it can't compound inside
          the CD. In that case you'll earn closer to simple interest on the original deposit, so the ending balance will be
          lower than the calculator shows. If compounding matters to you, make sure the interest stays in the CD.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>APY vs. APR vs. Interest Rate</h2>
        <p style={pStyle}>These get mixed up constantly, so here's the quick version.</p>
        <p style={pStyle}>
          <strong>APR</strong> is the annualized rate before compounding. Banks lean on it for debts like mortgages,
          credit cards, and car loans. <strong>APY</strong> is what you actually earn over a full year once compounding is
          counted. CDs and savings accounts are almost always advertised in APY, and APY is the fairer way to compare
          them.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A 4.40% rate compounded monthly works out to roughly a 4.49% APY. That small difference is why you shouldn't
          feed an APY into a monthly-compounding setting. The calculator would compound it a second time and show you a
          bit more than you'll really get.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>CD Calculator With Taxes</h2>
        <p style={pStyle}>
          In the U.S., CD interest is taxable as ordinary income, the same as wages. The catch is timing. You owe tax on
          the interest in the year it's credited, even if the money's locked up until maturity. Banks send a Form 1099-INT
          when you earn $10 or more in a year, though you're supposed to report it all either way.
        </p>
        <p style={pStyle}>
          That's why the tax field matters. Take the five-year, monthly example above. You earn $2,517.30 in interest. At
          a 24% tax rate, you'd owe about $604.15 and keep around $1,913.15. Your after-tax ending balance is roughly
          $11,913.15.
        </p>
        <p style={pStyle}>A few things worth knowing:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Retirement accounts change the picture.</strong> CDs held inside a traditional IRA grow tax-deferred.
            Inside a Roth IRA, qualified withdrawals are tax-free.
          </li>
          <li style={liStyle}>
            <strong>State tax can bite.</strong> Add your state rate to your federal one if you want a more honest number.
          </li>
          <li style={liStyle}>
            <strong>Treasuries are different.</strong> Interest on Treasury bills is taxable federally but exempt from
            state and local income tax. If you live in a high-tax state, that can tip the comparison.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Tax rules vary, and your situation might have wrinkles, so use the result as a planning estimate. For anything
          complicated, talk to a tax pro.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Read the Annual and Monthly Schedules</h2>
        <p style={pStyle}>The ending balance tells you where you land. The schedules show how you get there.</p>
        <p style={pStyle}>
          The <strong>annual schedule</strong> shows balance and interest year by year. You'll notice the interest you
          earn in year five is bigger than in year one, even though the rate never changed. That's compounding at work,
          since you're earning on a bigger balance.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The <strong>monthly schedule</strong> is more granular. It helps if you need to know what the CD would be worth
          at month 14, or if you want to check your statements against what you should be seeing. If your bank's numbers
          are a few cents off, the cause is usually a different day-count method or a rate that got rounded.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Certificate of Deposit?</h2>
        <p style={pStyle}>
          A CD is a deal with a bank or credit union. You agree to leave a sum of money alone for a set period, and they
          agree to pay you interest for it. Terms commonly run from three months to five years. Some go longer.
        </p>
        <p style={pStyle}>
          The "certificate" part is a leftover from the old days, when buyers got an actual paper certificate for their
          deposit. These days it's all electronic.
        </p>
        <p style={pStyle}>
          In effect, you're lending money to the bank. The bank puts those funds to work by lending them out at a higher
          rate, holding some in reserve, and covering operating costs. What it pays you depends on a mix of things: the
          federal funds rate, what competing banks are paying, how badly it wants deposits, and how long you'll lock up
          the money.
        </p>
        <p style={pStyle}>
          Compared with other options, CDs sit at the low-risk, low-return end. They usually pay more than regular savings
          accounts and often more than money market accounts. They pay a lot less, over the long haul, than the stock
          market has historically returned. What you're buying is certainty, not growth.
        </p>
        <p style={pStyle}>
          Generally, a bigger deposit or a longer term can earn a better rate. But longer terms also carry more
          interest-rate risk. If rates climb after you lock in, you're stuck with the lower one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          How safe are they? CDs from FDIC-insured banks are covered up to $250,000 per depositor, per bank, per
          ownership category. Joint accounts get their own coverage, so a couple can often protect more at one bank. If
          you've got more than the limit, spread it across banks. Credit unions have the same kind of protection through
          the NCUA. Credit unions often call their version a "share certificate," which is worth knowing when you're
          searching for rates.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of CDs</h2>
        <p style={pStyle}>Most people deal with the traditional kind, but you've got options.</p>
        <p style={pStyle}>
          <strong>Traditional CD.</strong> Fixed rate, fixed term, penalty for early withdrawal. If you deposit $100,000
          or more, it's often called a jumbo CD, and those sometimes pay a bit more.
        </p>
        <p style={pStyle}>
          <strong>Bump-up CD.</strong> Lets you raise your rate if the bank's rates go up during your term. It's handy
          when rates are climbing. The starting rate is usually lower than a traditional CD's.
        </p>
        <p style={pStyle}>
          <strong>No-penalty (liquid) CD.</strong> You can withdraw without a penalty, often after a short initial
          period. The trade-off is a lower rate, though it's usually still better than a standard savings account.
        </p>
        <p style={pStyle}>
          <strong>Zero-coupon CD.</strong> You buy it at a discount and get the full face value at maturity. No interest
          is paid along the way. These tend to have long terms.
        </p>
        <p style={pStyle}>
          <strong>Callable CD.</strong> The bank can end it early after a protected period and hand back your money plus
          the interest earned so far. If rates drop, that's bad for you, so these pay more to make up for it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Brokered CD.</strong> Sold through a brokerage account instead of directly by a bank. You can shop many
          banks in one place, and you can often sell on a secondary market before maturity. But the price you get depends
          on current rates and could be lower than what you paid.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where and How to Buy a CD</h2>
        <p style={pStyle}>
          You can open one at banks, credit unions, online banks, and brokerages. Online banks and credit unions often
          have the strongest rates, since they don't carry the cost of branches.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It really pays to shop around. Rates for the same term can differ by a full percentage point or more between
          institutions. Compare the APY, the term, the minimum deposit (some want $500 or $1,000, some ask for much more),
          and the early withdrawal penalty. If you're going through a broker, ask about fees too.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Early Withdrawal Penalties</h2>
        <p style={pStyle}>
          Pull your money out early and you'll normally pay a penalty, typically expressed as a number of days or months
          of interest. The longer the term, the bigger the penalty. From bank disclosures I've seen, a one-year CD might
          charge anywhere from about two to nine months of interest. A five-year CD can charge a year of interest or more,
          and a few banks go to two years. Check your own bank's terms, because these change.
        </p>
        <p style={pStyle}>
          Two things to remember. First, the penalty can eat into your principal if you pull out early enough that you
          haven't earned much interest yet. Second, the calculator assumes you hold to maturity, so it doesn't subtract
          any penalty. If there's a real chance you'll need the cash, subtract the penalty yourself.
        </p>
        <p style={pStyle}>
          Rough example. You open a $10,000, five-year CD at 4.5% with a 12-month interest penalty. Two years in, you've
          earned roughly $940. Cashing out would cost about $490, so you'd walk away with around $450 of that interest.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Is paying the penalty ever worth it? Sometimes, yes. Try this break-even test. Say you're in a 4% CD with a
          six-month penalty on $10,000. The penalty is about $200. A new CD paying 5% earns you about $100 more per year.
          You'd break even in two years. If the new CD's term is longer than that, switching can come out ahead.
          Researchers who studied CD offerings across thousands of banks over two decades found something similar. On
          average, savers who paid a penalty to move to a longer, higher-paying CD still came out ahead on interest. Your
          numbers will differ, so run them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Avoid the Penalty in the First Place</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Keep a separate emergency fund, ideally three to six months of expenses, in a liquid savings account.
          </li>
          <li style={liStyle}>Consider a no-penalty CD if you might need the money.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            Build a CD ladder (below), so some of your money comes free regularly.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>CD Ladders</h2>
        <p style={pStyle}>
          Longer CDs usually pay more, but they lock your money up longer. A ladder gets around that. Instead of putting
          everything into one CD, you split it across several with staggered maturity dates.
        </p>
        <p style={pStyle}>
          Say you've got $15,000. You put $5,000 each into a 1-, 2-, and 3-year CD. Here's what each rung grows to at
          maturity, using annual compounding and hypothetical rates of 4.0%, 4.2%, and 4.4%:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>1-year: $5,200.00 (about $200 in interest)</li>
          <li style={liStyle}>2-year: $5,428.82 (about $429 in interest)</li>
          <li style={liStyle}>3-year: $5,689.46 (about $689 in interest)</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Each year, a CD matures. You can pull the cash out if you need it, or roll it into a new three-year CD at
          whatever the going rate is. After a couple of years, you've got a CD maturing every year, and they're all
          earning the longer-term rate. To model a ladder, run each rung through the CD calculator separately and add up
          the totals.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use a CD Calculator</h2>
        <p style={pStyle}>
          <strong>Comparing offers.</strong> One bank pays 4.6% for 12 months, another 4.4% for 18. Run both for the same
          time frame and compare actual dollars.
        </p>
        <p style={pStyle}>
          <strong>Saving for a goal.</strong> A down payment, tuition, or a wedding two or three years out. Adjust your
          deposit until the ending balance hits your target.
        </p>
        <p style={pStyle}>
          <strong>Checking a rollover.</strong> When a CD matures, banks often renew it automatically at the current
          rate, which might be lower. Compare that against moving the money.
        </p>
        <p style={pStyle}>
          <strong>Planning around retirement.</strong> People close to retiring often want some guaranteed money. A CD
          gives you a known amount on a known date.
        </p>
        <p style={pStyle}>
          <strong>Comparing against other savings.</strong> Put your CD result next to a high-yield savings account. Just
          remember a savings rate can change, while a CD's is locked.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Weighing a withdrawal.</strong> Use the break-even idea above with real numbers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens When a CD Matures</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Banks typically give you a grace period after maturity, often around a week to ten days, to withdraw, change
          terms, or move the money. If you do nothing, many banks automatically renew the CD into a new one with the same
          term at whatever rate they're offering then. That rate might be lower, and the penalty clock restarts. Put the
          maturity date in your calendar a couple of weeks ahead, and look at rates elsewhere before the grace period
          ends.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Alternatives to CDs</h2>
        <p style={pStyle}>
          <strong>High-yield savings accounts.</strong> Your money stays accessible, and the rate is variable. That helps
          if rates are rising. It hurts if they fall.
        </p>
        <p style={pStyle}>
          <strong>Money market accounts.</strong> Bank accounts that usually pay savings-like rates and sometimes come
          with check-writing or a debit card. They're typically FDIC-insured.
        </p>
        <p style={pStyle}>
          <strong>Money market funds.</strong> Not the same thing. These are investment funds, regulated by the SEC, and
          they're not FDIC-insured. They're low-risk but not no-risk.
        </p>
        <p style={pStyle}>
          <strong>Treasury bills and bonds.</strong> Backed by the U.S. government, with state-tax-exempt interest.
        </p>
        <p style={pStyle}>
          <strong>Bond funds and corporate bonds.</strong> Often higher yield, but they can lose value. Not insured.
        </p>
        <p style={pStyle}>
          <strong>Paying down debt.</strong> If you're carrying a credit card balance at 20%+, paying it off beats any CD.
          Even a mortgage rate above what CDs pay means extra payments can be the better "return."
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Peer-to-peer lending and mortgage-backed securities.</strong> Possible, but they carry real risk and
          aren't a drop-in CD substitute.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Short History of CDs and Their Rates</h2>
        <p style={pStyle}>
          Banks have long paid interest to people who agree to leave money alone for a while. The modern negotiable CD
          took off in the early 1960s. After the bank failures of the Great Depression, the FDIC was created in 1933,
          which is a big part of why CDs feel so safe today.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Rates have swung a lot. In the late 1970s and early 1980s, with inflation raging, CD yields went well into the
          double digits, reaching the high teens around 1981. They fell steadily after that, sat around 4% in 2007, and
          dropped under 1% for one-year CDs in 2021. As the Fed hiked rates to fight inflation, yields climbed past 5% in
          2023 and 2024, then began easing again.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where CD Rates Are Headed Next</h2>
        <p style={pStyle}>
          Nobody can promise where rates go, but you can understand what moves them. Banks tend to follow the Federal
          Reserve. When the Fed raises its benchmark rate, new CD rates generally climb. When it cuts, they drift down.
          Markets often price in expected moves ahead of time, so CD rates can shift before the Fed actually acts.
        </p>
        <p style={pStyle}>Here's how that translates into decisions:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>If rates look likely to fall,</strong> locking in a longer CD can protect today's higher yield. Rates
            on existing CDs don't drop when the Fed cuts.
          </li>
          <li style={liStyle}>
            <strong>If rates look steady,</strong> shorter terms work fine, and you keep flexibility.
          </li>
          <li style={liStyle}>
            <strong>If rates look likely to rise,</strong> short-term, no-penalty, or bump-up CDs keep you from getting
            stuck.
          </li>
          <li style={liStyle}>
            <strong>If you really can't tell,</strong> a ladder spreads the bet.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more check: compare your rate to inflation. A 4.5% CD during 3% inflation gives you roughly 1.5% in real
          terms. A CD that lags inflation still protects your principal, but it loses buying power. The calculator shows
          nominal numbers, so factor that in.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Reliable</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This CD calculator is free. You don't pay to run it or to see the schedules. You only enter numbers like a
          deposit, rate, and term, so you never need to share an account number or anything personal. The math is the
          standard compound interest formula that banks and finance textbooks use, so you'd get the same result with a
          spreadsheet. Treat the output as a solid estimate for planning. Your bank's disclosure is the final word on what
          your specific CD will pay.
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
