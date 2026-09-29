import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Does the calculator factor in taxes on my interest?",
    a: "Yes. Enter your tax rate on interest income, and the calculator deducts it before compounding, so you get a realistic after-tax number instead of an inflated pre-tax one.",
  },
  {
    q: "What's the difference between monthly and annual contributions?",
    a: "Monthly contributions get added every month, so they have more time in the account to earn interest across the year. Annual contributions go in as one lump sum, usually with less overall time to compound. You can use either, or both, depending on how you actually save.",
  },
  {
    q: "What does APY mean, and where do I find mine?",
    a: "APY stands for annual percentage yield, it's the real annual interest rate your account pays, already accounting for compounding. You'll find your actual APY on your account statement or your bank's website; it can change over time since most standard savings accounts have variable rates.",
  },
  {
    q: "How accurate is this calculator's projection?",
    a: "As accurate as the numbers you put in. The math itself is standard compound interest, but things like future rate changes, account fees, or shifting tax rules aren't factored in unless you update your inputs to match.",
  },
  {
    q: "Can I use this for retirement planning?",
    a: "Yes, especially for taxable savings accounts outside of dedicated retirement plans, since it accounts for tax on interest, which a lot of other calculators skip.",
  },
  {
    q: "Why does my balance look lower here than on other savings calculators?",
    a: "A lot of free calculators only show pre-tax growth. This one deducts tax on interest earnings as part of the calculation, so your ending balance reflects what you'd actually walk away with.",
  },
  {
    q: "Is a savings account the best place for all my extra money?",
    a: "Not necessarily. Savings accounts are great for money you need to keep safe and accessible, like an emergency fund. But since savings interest often doesn't keep up with inflation, extra cash beyond your safety net may grow faster in other places like stocks, bonds, or real estate.",
  },
  {
    q: "Is there a limit to how much I can save?",
    a: "No hard limit on deposits, but FDIC insurance only covers up to $250,000 per depositor, per bank. Anything beyond that at a single institution isn't insured if the bank fails.",
  },
  {
    q: "Is my financial data stored anywhere when I use this calculator?",
    a: "No. Nothing you enter is saved or transmitted. It's calculated for your session only and disappears once you leave the page.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "Is this savings calculator free to use?",
    a: "Yes, completely. No fees, no subscription, no catch. Use it as often as you want.",
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "No. It works instantly with no registration or login required.",
  },
  {
    q: "Does the calculator factor in taxes on my interest?",
    a: "Yes. Enter your tax rate on interest income, and the calculator deducts it before compounding, giving a realistic after-tax number instead of an inflated pre-tax one.",
  },
  {
    q: "What's the difference between monthly and annual contributions?",
    a: "Monthly contributions are added every month and have more time to earn interest across the year, while annual contributions go in as one lump sum with less time to compound.",
  },
  {
    q: "What does APY mean, and where do I find mine?",
    a: "APY stands for annual percentage yield, the real annual interest rate your account pays including the effect of compounding. You can find it on your account statement or your bank's website.",
  },
  {
    q: "How accurate is this calculator's projection?",
    a: "It's as accurate as the numbers you enter. The math follows standard compound interest principles, though future rate changes, fees, or tax rule shifts aren't included unless you update your inputs.",
  },
  {
    q: "Can I use this for retirement planning?",
    a: "Yes, especially for taxable savings accounts outside dedicated retirement plans, since it accounts for tax on interest.",
  },
  {
    q: "Is a savings account the best place for all my extra money?",
    a: "Not necessarily. Savings accounts are great for safety and accessibility, but since interest often doesn't keep up with inflation, extra cash beyond an emergency fund may grow faster in other investments.",
  },
  {
    q: "Is there a limit to how much I can save?",
    a: "There's no deposit limit, but FDIC insurance only covers up to $250,000 per depositor, per bank.",
  },
  {
    q: "Is my financial data stored anywhere when I use this calculator?",
    a: "No. Nothing you enter is saved or transmitted. It's calculated for your session only and disappears once you leave the page.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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

export default function SavingsCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Savings Calculator Actually Does</h2>
        <p style={pStyle}>
          Let's be honest, most people have a vague idea of what they want to save for, but almost nobody
          sits down and does the actual math. This free savings calculator from{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> does that math for you. Plug in what you're
          starting with, what you plan to add each month or year, your interest rate, and your tax rate, and
          it'll show you exactly where you'll land after however many years you choose. No spreadsheet, no
          guessing, no "I'll figure it out later."
        </p>
        <p style={pStyle}>
          What makes this one a little more useful than the basic calculators you'll find elsewhere is that
          it doesn't just show you pretty, inflated numbers based on pre-tax interest. It actually subtracts
          what you'd owe in taxes on that interest before adding it back into your balance, which is closer
          to what you'll really end up with in your pocket. A lot of tools skip that step entirely, and it
          can make a real difference over several years.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether you're saving up for a house, building an emergency cushion, putting money away for a
          kid's college fund, or just trying to see what happens if you bump your monthly contribution by
          fifty bucks, this tool gives you a real number to work with instead of a wild guess.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Savings Calculator (Step by Step)</h2>
        <p style={pStyle}>
          You don't need to sign up for anything or download an app. Just fill in a handful of fields and
          the calculator does the rest instantly.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Initial deposit:</strong> Whatever you're starting with, whether that's $100 you had
            sitting around or $10,000 you're moving over from another account, put it here. It matters more
            than people think, because that starting chunk earns interest from day one, and interest earned
            on interest is basically the whole point of compounding.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Monthly deposit:</strong> This is what you're planning to add every single month. Think
            about your actual budget here, not some aspirational number you'll only hit twice. You can
            always come back and tweak this number to see how adding an extra $50 or $100 a month changes
            your ending balance, it's often a bigger difference than people expect.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Annual contribution:</strong> Some people don't save monthly; they get a bonus, a tax
            refund, or a year-end payout and dump it all in at once. If that's more your style, use this
            field instead of (or alongside) the monthly one.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Interest rate (APY):</strong> This is the annual percentage yield your bank or account
            actually pays, not the "up to" rate they slap on a billboard, but the real number tied to your
            account. APY already bakes in the effect of compounding, meaning it's interest on your original
            deposit plus interest on the interest you've already earned. You can find your real APY on your
            account statement or your bank's website. One thing worth keeping in mind: standard savings
            accounts have variable APYs, so your bank can raise or lower that rate whenever it wants. That
            means your real-world results a year from now could end up a bit higher or lower than what the
            calculator shows today, simply because rates moved in the meantime.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Tax rate on interest:</strong> This is the percentage of your interest earnings that
            goes to taxes. It depends on your country, your tax bracket, and the type of account you're
            using. Some retirement or tax-sheltered accounts don't tax interest at all, while a regular
            savings account usually gets taxed at your normal income rate.
          </li>
          <li>
            <strong>Time horizon:</strong> How many years out are you planning? Once everything's filled in,
            you'll instantly get your projected balance along with a breakdown of where that money actually
            came from.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Math Behind It (and Why It's Not Just Guesswork)</h2>
        <p style={pStyle}>
          You don't need to understand the formula to use the calculator, but if you're curious how it
          actually works, here's the plain-English version.
        </p>
        <p style={pStyle}>
          The tool is essentially solving for future value, meaning, given what you put in today and what
          you keep adding, plus a given rate of return, what will the total be worth down the road? The
          calculation has two moving parts that get combined:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            The first part figures out what your recurring deposits (monthly and/or annual) will grow into
            by the end of your time frame, since each contribution earns interest for a different length of
            time depending on when it went in, money you deposit in year one has way more time to compound
            than money you deposit in year nine.
          </li>
          <li>
            The second part figures out what your original lump-sum deposit grows into on its own,
            compounding the whole way through.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Add those two pieces together, subtract the tax owed on the interest portion along the way, and
          you get your final number. That tax step is the part a lot of calculators conveniently leave out,
          which is exactly why their numbers tend to look rosier than what you'll actually end up with.
        </p>
        <p style={pStyle}>
          Here's a quick real-world example to make it concrete. Say you start with a $1,000 deposit into an
          account earning 4% APY, and you're running the numbers over two years.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            If you add $200 a month, you'd end up with roughly $6,067 total, including about $267 in
            interest.
          </li>
          <li>
            If you bump that up to $400 a month, you'd end up with roughly $11,052 total, including about
            $452 in interest.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Notice that doubling your monthly contribution didn't just double your balance, it more than
          doubled your interest earned too, because more money sitting in the account earlier means more
          time for that money to compound. Small changes to your monthly number, run out over several
          years, add up to a lot more than most people assume.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Your Results</h2>
        <p style={pStyle}>
          Once you run the numbers, you'll see a breakdown instead of just one lump number, which makes it a
          lot easier to understand where your ending balance actually comes from:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}><strong>Initial deposit</strong> — the amount you started with.</li>
          <li style={{ marginBottom: 6 }}>
            <strong>Total contributions</strong> — everything you added over time, whether monthly, annual,
            or both, added together.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Interest earned</strong> — how much your money grows purely from interest, after tax has
            been taken out.
          </li>
          <li>
            <strong>Total savings</strong> — your grand total: initial deposit, plus contributions, plus
            after-tax interest.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Seeing it split out like this is actually pretty useful, because it shows you how much of your
          ending balance is money you put in versus money your account earned on its own. Early on, most of
          your balance is going to be your own contributions. But the longer your time horizon, the bigger
          that interest slice becomes, which is really the whole argument for starting sooner rather than
          later.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A good way to actually get value out of this tool is to run it more than once. Try your current
          numbers, then try bumping your monthly contribution up a little, then try a slightly higher
          interest rate to see what a better savings account or CD might do for you. Comparing a few
          scenarios side by side tells you a lot more than a single run ever will.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Savings Accounts 101: What You're Actually Working With</h2>
        <p style={pStyle}>
          Since this calculator is built around how savings accounts grow, it helps to actually understand
          what a savings account is and how it's different from the checking account you probably use for
          everyday spending.
        </p>
        <p style={pStyle}>
          In the U.S., a savings account is a bank account that pays you interest on the money you keep in
          it, and most of them are insured by the FDIC (the Federal Deposit Insurance Corporation), which
          protects your money up to certain limits if the bank itself ever fails. You can open one at pretty
          much any bank or credit union, and the terms, interest rate, minimum balance requirements, whether
          it's bundled with a checking account, will vary depending on where you open it. A lot of banks
          will waive monthly fees if you keep both a checking and savings account with them, so it's worth
          asking.
        </p>
        <p style={pStyle}>
          Checking accounts and savings accounts might feel similar, but they serve different purposes.
          Checking accounts are built for constant access, you can deposit and withdraw freely, usually
          without penalty, and that's exactly what makes them good for everyday spending. The tradeoff is
          that checking accounts either pay no interest or pay next to nothing.
        </p>
        <p style={pStyle}>
          Savings accounts flip that. They usually pay meaningfully more interest than a checking account,
          but in exchange, they come with some restrictions, many banks limit you to around six withdrawals
          a month before charging a fee, and some require you to maintain a minimum balance. That's actually
          not a bad thing. It nudges savings accounts into being the place you park money you don't need to
          touch constantly, like an emergency fund or savings for a future goal, rather than money for daily
          spending. And compared to other places you might stash money long-term, like cashing in bonds,
          pulling from a retirement account early, or selling off investments, a savings account is about as
          easy as it gets to access when you actually need the cash.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most people, having both makes sense: checking for the day-to-day stuff, saving for the money
          that can sit and earn a little something while you're not using it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Money Market Accounts: A Close Cousin Worth Knowing About</h2>
        <p style={pStyle}>
          Savings accounts aren't the only place to park money and earn interest. Money market accounts
          (MMAs) are another option offered by a lot of banks and credit unions, and they typically pay a
          bit more interest than a standard savings account. The reason is that the bank is investing MMA
          deposits into things like short-term securities rather than just holding the cash, which generally
          pays better than a basic loan-backed savings account.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That slightly higher yield comes with a tradeoff, though, because MMA funds are tied to financial
          markets in some way, there's a bit more risk involved compared to a plain savings account. Some
          MMAs also come with perks that regular savings accounts usually don't have, like a debit card or
          check-writing privileges, but accounts with those extra features sometimes pay a lower rate in
          exchange. If you're comparing options, it's worth plugging different APYs into this calculator to
          see how much of a real difference a money market account's typically higher rate would make over
          your specific time frame.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Should You Actually Be Saving?</h2>
        <p style={pStyle}>
          This is the question everybody actually wants answered, and honestly, there's no single right
          number, it depends on your income, expenses, and goals. That said, there are a few well-known
          rules of thumb that give you a starting point:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>The emergency fund rule.</strong> Try to keep three to six months' worth of living
            expenses in savings. This isn't about growing wealth, it's about having a cushion if you lose
            your job, face a medical bill, or run into some other unexpected expense. Having that buffer
            means you're not stuck relying on credit cards or loans just to get through a rough patch.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>The 10% rule.</strong> A simple, easy-to-remember approach: set aside 10% of every
            paycheck into savings before you spend on anything else. It's not perfect for everyone, but as a
            default habit, it's a solid place to start if you're not sure where else to begin.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>The 50-30-20 rule.</strong> This one splits your income into three buckets, 50% toward
            needs like rent, groceries, and bills, 30% toward wants like eating out or entertainment, and
            20% toward savings or paying down debt. It's a helpful way to think about your whole budget at
            once rather than just your savings in isolation.
          </li>
          <li>
            <strong>The $2,000 benchmark.</strong> The Federal Reserve has found that the average amount
            people need to cover a financial emergency comes out to around $2,000. It's not a magic number,
            but it's a reasonable initial target if you're starting from zero and need somewhere concrete to
            aim for.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Take all of these with a grain of salt, though. Nobody's financial situation fits neatly into a
          formula, how much you already have saved, how your income compares to your expenses, and what's
          coming up in your life all matter more than any generic rule. Use these as a starting point, then
          plug your real numbers into the calculator to see what actually makes sense for you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is There Such a Thing as Saving Too Much?</h2>
        <p style={pStyle}>
          Technically, there's no cap on how much you can deposit into a savings account. But there is a
          limit on how much of it is FDIC-insured, deposits are protected up to $250,000 per depositor, per
          insured bank. If you're sitting on more than that at a single institution, it's worth knowing that
          anything above that threshold isn't covered if something were to go wrong with the bank.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond the insurance question, there's a bigger issue worth thinking about: savings accounts just
          aren't built to be your only wealth-building tool. Inflation in the U.S. tends to run higher than
          what most savings accounts pay out in interest, which means money sitting in savings for years can
          actually lose purchasing power even while the account balance technically goes up. If you've got
          your emergency fund fully covered and extra cash piling up beyond that, options like stocks,
          bonds, or real estate tend to offer better long-term returns than a savings account ever will.
          Savings accounts are great for safety and accessibility, they're just not designed to be where
          your long-term wealth grows fastest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Real Scenarios Where This Calculator Actually Comes in Handy</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Building an emergency fund.</strong> Figure out how long it'll realistically take to hit
            three to six months of expenses based on what you can actually afford to set aside each month.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Saving for a house down payment.</strong> Down payments take years for most people.
            Punch in your current savings, a realistic monthly number, and your bank's actual APY, and
            you'll get a real target date instead of a vague hope.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning for a kid's education.</strong> Tuition costs are usually known well ahead of
            time, which makes this a great use case for a longer time horizon, see exactly what monthly
            contribution gets you there.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing strategies.</strong> Curious whether bumping your monthly deposit by $50
            matters more than chasing a slightly better interest rate somewhere else? Run both scenarios and
            compare the actual numbers instead of guessing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Big life events.</strong> Weddings, a new car, a sabbatical, a move across the country,
            all of these come with a price tag, and a defined monthly contribution target turns a vague goal
            into something trackable.
          </li>
          <li>
            <strong>Long-term or semi-retirement savings.</strong> Outside of a dedicated retirement account,
            a regular taxable savings account can still play a role in a bigger financial plan, and because
            this calculator factors in tax on interest, it's especially useful for modeling accounts that
            don't get special tax treatment.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Few Ways to Actually Grow Your Savings Faster</h2>
        <p style={pStyle}>
          Bumping up your monthly contribution, even by a small amount, usually moves the needle more than
          people expect, because that extra bit compounds every single month instead of just sitting there.
          Try adding even $25 or $50 to your current number in the calculator and watch what it does to your
          ending balance over ten years.
        </p>
        <p style={pStyle}>
          Shopping around for a better APY is worth the effort, especially once your balance gets bigger,
          since interest compounds on your whole balance every period, even a small rate bump adds up.
        </p>
        <p style={pStyle}>
          <strong>Know your tax situation.</strong> If part of your savings goal qualifies for a
          tax-advantaged account, moving money there (within whatever contribution limits apply) means you
          keep more of what you earn instead of handing a chunk of it over in taxes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And starting earlier beats contributing more later, basically every time. Because interest
          compounds on your full balance, including prior interest, a smaller head start today usually ends
          up ahead of a bigger contribution made several years down the road.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Trust</h2>
        <p style={pStyle}>
          This calculator is completely free, with no hidden fees, no premium tier, and nothing to unlock.
          You don't need to create an account or log in, just enter your numbers and get your answer right
          away.
        </p>
        <p style={pStyle}>
          On privacy: nothing you type in, your deposit amount, contributions, interest rate, tax rate, gets
          stored, saved, or sent anywhere. The calculation runs for your session only, and once you close or
          refresh the page, none of it sticks around. There's no file upload, no account creation, nothing
          tied to your identity.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy: the math follows standard compound interest principles and applies your tax rate
          consistently across each period. That said, it's a projection based on the numbers you give it,
          real bank rates change, tax rules vary by location, and this tool doesn't account for
          account-specific fees or future rate changes. For anything big, a major purchase, retirement
          planning, real financial decisions, it's smart to pair this projection with advice from your bank
          or a financial professional who knows your full situation.
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
