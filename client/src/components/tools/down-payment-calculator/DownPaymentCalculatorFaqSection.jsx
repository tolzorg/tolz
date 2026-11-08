import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much should I put down on a house?",
    a: "Many buyers aim for 20% to avoid PMI and keep the payment low, but loans exist with 0% to 5% down. The right number balances monthly cost, cash reserves and how long you plan to stay. First-time buyers put down a median of about 10%, according to NAR.",
  },
  {
    q: "How do I calculate my down payment?",
    a: "Multiply the home price by your down payment percentage. For a $300,000 home at 10%, that’s $30,000. The calculator also adds closing costs and shows your loan and monthly payment.",
  },
  {
    q: "How much house can I afford with my down payment?",
    a: "Use the cash-based mode. Enter your available cash, your target down payment percentage and closing cost estimate, and it returns the maximum price. Your income, debts and credit also limit what a lender will approve.",
  },
  {
    q: "Is 20% down required to buy a home?",
    a: "No. It’s only needed to avoid PMI on conventional loans. FHA allows 3.5% down, VA and USDA loans can require nothing, and some conventional programs allow 3%.",
  },
  {
    q: "Does the calculator include closing costs?",
    a: "Yes. Enter a percentage or dollar amount and the tool adds it to your total cash needed. A typical planning range is 2% to 5% of the price.",
  },
  {
    q: "What is a good down payment for a first-time buyer?",
    a: "Between 3.5% and 10% is common, often paired with assistance programs. Compare the cost of mortgage insurance against the benefit of buying sooner.",
  },
  {
    q: "Can I use gift money for a down payment?",
    a: "Often, yes. FHA loans allow the entire down payment to be a gift with a signed gift letter. Conventional loans allow gifts under certain conditions. Your lender will tell you what documentation they need.",
  },
  {
    q: "Can I use my 401(k) or IRA for a down payment?",
    a: "Yes, with limits. You can borrow up to $50,000 or half your vested balance from a 401(k) if your plan allows it. First-time buyers can withdraw up to $10,000 from an IRA without the 10% early withdrawal penalty, though income tax may still apply.",
  },
  {
    q: "What is PMI and when does it go away?",
    a: "Private mortgage insurance protects the lender when you put down less than 20% on a conventional loan. You can request removal at 80% of the original home value, and it ends automatically at 78%.",
  },
  {
    q: "What is an 80-10-10 piggyback loan?",
    a: "It’s a setup with two mortgages: 80% of the price in a first loan, 10% in a second loan, and 10% from your own cash. It avoids PMI but the second loan often has a higher rate.",
  },
  {
    q: "How long does it take to save for a down payment?",
    a: "It depends on your goal and monthly savings. Saving $1,000 a month toward 10% plus closing costs on a $300,000 home takes about three and a half years.",
  },
  {
    q: "Is it bad to buy a house with no down payment?",
    a: "Not necessarily. VA and USDA zero-down loans are legitimate programs. Just know you’ll start with no equity, a higher payment, and a fee or insurance cost, so keep cash reserves for repairs.",
  },
  { q: "Is this down payment calculator free?", a: "Yes, it’s free to use with no sign-up required." },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const SAVING_HEADERS = ["Down payment goal", "Total cash needed", "Saving $500/mo", "Saving $1,000/mo", "Saving $2,000/mo"];
const SAVING_ROWS = [
  ["3.5%", "$19,500", "~3.3 years", "~1.6 years", "~10 months"],
  ["10%", "$39,000", "~6.5 years", "~3.3 years", "~1.6 years"],
  ["20%", "$69,000", "~11.5 years", "~5.75 years", "~2.9 years"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

// Small layout helpers: every card drops the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
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
      <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontSize: 13 }}>
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
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

export default function DownPaymentCalculatorFaqSection() {
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

      <Card title="What Is a Down Payment?">
        <P>
          A down payment is the chunk of the purchase price you pay up front, out of your own pocket, when you buy a home. The
          mortgage covers the rest. So the price of the house always equals your down payment plus your loan amount. Buy a
          $250,000 home with 3.5% down and you’re paying $8,750 in cash and borrowing the remaining $241,250. Put 20% down on
          the same house and that’s $50,000 in cash, with a loan of $200,000.
        </P>
        <P>
          Lenders almost always talk about down payments as a percentage, because that percentage decides a lot of things:
          which loan programs you qualify for, whether you’ll pay mortgage insurance, and how your interest rate gets priced.
          Your earnest money deposit, the good-faith deposit you put down when your offer is accepted, usually counts toward
          the down payment. It isn’t extra money on top.
        </P>
      </Card>

      <Card title="Calculator Inputs Explained">
        <P>The results are only as good as what you feed in, so here’s what each field means.</P>
        <List items={[
          ["Home price", "is the price you’ve agreed to pay, not the list price or the appraised value. Those can all be different."],
          ["Down payment", "is your cash contribution, entered as a percentage or a dollar amount."],
          ["Closing costs", "are the fees you pay to finalize the loan and transfer the property (more on those below)."],
          ["Interest rate and loan term", "drive the monthly payment. Rates move daily, so use a real quote from a lender instead of a number you saw in a headline, and try both 15-year and 30-year terms to see how payment size trades off against total interest."],
          ["Property tax, homeowners insurance and HOA dues", "aren’t part of the loan itself, but they’re part of what you’ll pay every month. Add them to your budget separately so you don’t get surprised later."],
        ]} />
      </Card>

      <Card title="Closing Costs: The Cash People Forget About">
        <P>
          The down payment is usually the biggest check you’ll write, but it’s not the only one. Closing costs can run a few
          thousand dollars or well into five figures, depending on the price and where you live. They typically include loan
          origination or underwriting fees, discount points if you buy your rate down, the appraisal, a home inspection,
          lender’s title insurance, a survey where required, recording fees, and prepaid items like the first year of
          homeowners insurance and a few months of property tax in escrow.
        </P>
        <P>
          A rough planning number is 3% of the purchase price, and many buyers land between 2% and 5%. Some states are more
          expensive than others because of transfer taxes and title rules. Once you apply with a lender, you’ll get a Loan
          Estimate within three business days, and that document replaces any guesswork. Until then, 3% is a solid
          placeholder.
        </P>
        <P>
          One more thing: don’t forget moving costs, immediate repairs, and the cash cushion you’ll want left over after
          closing. Most advisors suggest keeping at least a few months of living expenses in the bank after you buy. Empty
          accounts on day one are how people end up putting a furnace repair on a credit card.
        </P>
      </Card>

      <Card title="How Much Down Payment Do You Need?">
        <P>The 20% rule is a benchmark, not a requirement. A lot of people buy with much less. What you need depends on the loan.</P>
        <List items={[
          ["Conventional loans.", "Most follow rules set by Fannie Mae and Freddie Mac, the two government-sponsored companies that buy mortgages from lenders. 20% is the number that avoids mortgage insurance, but plenty of lenders go lower, to 10%, 5%, or even 3% for certain first-time or income-limited buyer programs. Go below 20% and you’ll pay private mortgage insurance (PMI)."],
          ["FHA loans.", "Backed by the Federal Housing Administration and aimed at buyers with modest savings or credit that isn’t perfect. You can put down 3.5% with a credit score of 580 or higher, or 10% with a score between 500 and 579. The catch is mortgage insurance. You’ll pay an upfront premium of 1.75% of the loan amount (usually rolled into the loan) plus an annual premium that’s paid monthly. If you put down less than 10%, that annual premium lasts for the life of the loan unless you refinance into a conventional mortgage. Put down 10% or more and it drops off after 11 years."],
          ["VA loans.", "For eligible veterans, active-duty service members and some surviving spouses. No down payment and no monthly mortgage insurance. There’s a one-time funding fee, which varies with your down payment and whether it’s your first VA loan, and it’s waived for veterans with certain service-connected disability ratings."],
          ["USDA loans.", "For homes in eligible rural and some suburban areas, with income limits. No down payment required, but there’s an upfront guarantee fee and a small annual fee."],
          ["Other zero-down options.", "A handful of lenders and credit unions offer their own 0% or very-low-down programs, sometimes limited to members. Navy Federal Credit Union is one example."],
          ["Jumbo loans.", "When the loan is above the conforming limit for your county, lenders usually want 10% to 20% or more down, plus stronger credit and more cash in reserve."],
        ]} />
        <P>
          These are program minimums, not guarantees. Lenders also look at your credit score, income, job history and
          debt-to-income ratio, and some add their own stricter rules. Use the percentage mode in the calculator to see exactly
          where your number lands against each threshold.
        </P>
      </Card>

      <Card title="How Your Down Payment Changes Your Monthly Payment">
        <P>
          A bigger down payment shrinks your loan, and that ripples through nearly everything else. The key number here is
          loan-to-value (LTV): your loan divided by the home’s value. Put 10% down and your LTV is 90%.
        </P>
        <P>
          When your LTV is above 80%, conventional lenders require PMI. It usually runs somewhere between 0.3% and 1.5% of the
          loan amount per year, depending mostly on your credit score and down payment. It protects the lender, not you, but
          you’re the one paying it. The good news is that on a conventional loan, you can ask to drop PMI once you reach 80% of
          the home’s original value, and the lender has to cancel it automatically when your balance is scheduled to hit 78%.
          Paying extra principal speeds that up.
        </P>
        <P>
          Your rate is also affected. Lenders price loans based on a mix of credit score and LTV, so a larger down payment often
          earns a lower interest rate, especially if your credit is on the weaker side. A lower rate on a smaller loan is a
          double win: less interest over time and a lower monthly payment.
        </P>
        <P>
          This is why a down payment and monthly payment calculator beats a percentage tool alone. When you can watch the
          payment drop as you raise the down payment, you can decide if the extra time spent saving is worth it.
        </P>
      </Card>

      <Card title="Down Payment Calculator Examples">
        <P>
          Let’s say a $400,000 home with a 30-year loan at 6.5%. These principal-and-interest numbers are rounded and don’t
          include taxes, insurance or PMI:
        </P>
        <List items={[
          ["5% down ($20,000):", "loan of $380,000, about $2,402 a month"],
          ["10% down ($40,000):", "loan of $360,000, about $2,275 a month"],
          ["20% down ($80,000):", "loan of $320,000, about $2,023 a month"],
        ]} />
        <P>
          Going from 5% to 20% down drops the payment by about $380 a month, and it also gets rid of PMI. On the 5% loan, PMI
          could easily add another $200 or more a month, so the true gap is bigger than it first looks. But it also takes
          $60,000 more cash up front. Add 3% closing costs ($12,000), and the total cash needed at 20% down is $92,000,
          compared to $32,000 at 5% down.
        </P>
        <P>
          Here’s an FHA example. A $300,000 house with 3.5% down means a $10,500 down payment and a base loan of $289,500. The
          upfront mortgage insurance premium of 1.75% adds roughly $5,066 if you roll it into the loan, and the annual premium
          on top of that might add around $130 a month. Low down payment, yes, but not low cost. It’s worth running the numbers
          both ways before you pick a program.
        </P>
      </Card>

      <Card title="Large vs. Small Down Payment">
        <P>There’s no universally right answer here. Each approach has real upsides and real downsides.</P>
        <P>
          <strong>Why a bigger down payment helps.</strong> You borrow less, so you pay less interest. You might qualify for a
          better rate. If you hit 20%, you skip PMI on a conventional loan, and that’s a fee that adds up to thousands over the
          years. Your monthly payment is lower, which gives you breathing room if your income dips. And you start with more
          equity, which protects you if prices soften.
        </P>
        <P>
          <strong>Why a bigger down payment can backfire.</strong> Your down payment is cash locked inside the house. You
          can’t easily get it back without selling or borrowing against it. If the market drops, the dollar value of that
          equity drops with it, so a big down payment doesn’t protect you from a recession as much as it might seem. It only
          means you owe less relative to what the house is worth.
        </P>
        <P>
          There’s also opportunity cost. Every dollar going toward the down payment can’t be used for something else. That
          might be paying off credit cards at 22% interest, building an emergency fund, contributing to a 401(k) with an
          employer match, or fixing a roof. Sometimes putting 10% down and using the rest to wipe out high-interest debt is the
          smarter play. A smaller down payment also means less cash due at closing, which matters if you’re trying to buy
          sooner.
        </P>
        <P>
          <strong>What lenders think.</strong> Lenders generally like bigger down payments. It means you have skin in the
          game, and a borrower who’s put in $60,000 is less likely to walk away than one who put in nothing. If you can’t pay
          and the home goes to foreclosure, you lose your down payment along with the house. That’s the whole reason lenders
          charge extra when the down payment is small.
        </P>
      </Card>

      <Card title="How Much Should I Really Save as a Down Payment for My First Home?">
        <P>
          It depends on your income, your credit, your local market and how long you plan to stay. But it helps to know what
          other people are doing. In the National Association of Realtors’ 2025 buyer survey, the median down payment was 10%
          for first-time buyers and 23% for repeat buyers, with 19% across all buyers. Repeat buyers put down more mostly
          because they’re rolling over equity from a home they sold.
        </P>
        <P>
          So for a first-time buyer, a range of 5% to 10% is very common, and 3.5% to 5% is common with FHA or low-down
          conventional programs. If you can reach 20%, great, but waiting years to hit it can cost you if prices and rents keep
          climbing. A good way to decide is to price out three scenarios in the calculator (say 5%, 10% and 20%) and compare
          the cash needed and the monthly payment. Then ask yourself which one leaves you comfortable after you’ve moved in.
        </P>
        <P>
          Whatever you pick, add closing costs and a cash cushion on top. A realistic goal for a first-time buyer is down
          payment plus closing costs plus three months of expenses left over.
        </P>
      </Card>

      <Card title="When You Need a Down Payment Calculator">
        <P>The tool pays for itself at a few specific points:</P>
        <List items={[
          ["Starting to save.", "Set a real target instead of guessing, then work backward from what you can save each month to find a purchase date."],
          ["Setting a search budget.", "Use the cash-based mode to find your price ceiling before you start looking at listings. It’s no fun falling for a house you can’t close on."],
          ["Comparing loan types.", "See what a 3.5% FHA loan costs next to a 10% conventional one, including the monthly difference."],
          ["Selling and moving up.", "Plug in your expected sale proceeds as the down payment to see what you can afford next."],
          ["Making an offer.", "Check your total cash to close, including closing costs, before you commit earnest money."],
          ["Getting family help.", "When relatives chip in, see how a gift changes your percentage and your loan amount."],
        ]} />
      </Card>

      <Card title="How Can I Save Up for a Down Payment on a New Home?">
        <P>
          Start with the number. Use the calculator to figure out your target: down payment plus closing costs plus a small
          cushion. A specific goal like “$38,000 by next September” is a lot easier to chase than “save more.”
        </P>
        <P>
          Then divide it into a monthly amount and automate it. Set up a recurring transfer the day your paycheck lands, so the
          money moves before you can spend it. People who wait to save “whatever’s left” usually find nothing’s left.
        </P>
        <P>
          After that, go hunting for money in your budget. Housing, transportation and food are the big three for most
          households, so even small changes there add up fast. Dropping a car payment, renegotiating insurance, cooking at home
          a few more nights a week, or getting a roommate for a year can free up hundreds each month. Cancel subscriptions you
          forgot about, and bundle your internet and phone if you haven’t shopped them in a while.
        </P>
        <P>
          Don’t ignore your credit while you’re at it. Paying down credit card balances helps in two ways: it lowers your
          debt-to-income ratio and raises your credit score, and a higher score means lower PMI and a better rate. Avoid
          opening new credit lines or financing a car in the months before you apply, since lenders pull your credit and look
          at recent changes.
        </P>
      </Card>

      <Card title="What’s the Best Way to Keep Savings for a House Down Payment?">
        <P>
          The best place for down payment money is somewhere safe, easy to access, and earning at least a little interest. A
          high-yield savings account at an FDIC-insured bank (or an NCUA-insured credit union) is the simplest option. Money
          market accounts work too. If you know you won’t need the money for a set period, certificates of deposit or
          short-term Treasury bills can lock in a fixed return, though you’ll want to avoid early-withdrawal penalties.
        </P>
        <P>
          It’s tempting to put the money in stocks or crypto to grow it faster. If your home purchase is more than five years
          away, a portion in a diversified investment might make sense. But if you’re buying within a few years, a market drop
          right before closing can wipe out months of progress. Safety matters more than returns when you have a deadline.
        </P>
        <P>
          One tip that surprises people: lenders want to see where your money came from. They’ll usually ask for two months of
          bank statements, and any large deposit that isn’t from your regular paycheck needs a paper trail. This is called
          seasoning. So keep your savings in one or two accounts, avoid moving big sums around right before applying, and hang
          on to records for any bonus, sale proceeds or gift.
        </P>
      </Card>

      <Card title="What Are the Fastest Ways to Save for a Down Payment?">
        <P>If you’re in a hurry, you’ll need to attack both sides of the equation, earning more and spending less.</P>
        <List items={[
          ["Use windfalls.", "Tax refunds, work bonuses, and cash gifts can go straight into the fund. For many people, a refund alone is a few thousand dollars."],
          ["Add income for a set period.", "Freelance work, overtime, a weekend job or selling things you don’t use. Even a year of extra $500 a month is $6,000."],
          ["Cut the big expenses temporarily.", "Move in with family, take on a roommate or downsize your car for a year or two. Big cuts beat small ones."],
          ["Pause other goals, carefully.", "Keep contributing enough to your 401(k) to get the full employer match, since that’s free money, but consider pausing extra investing or vacation funds until closing."],
          ["Check for down payment assistance early.", "Some programs take weeks to approve and have strict timelines, so don’t wait until you’ve found a house."],
          ["Reduce the target.", "A cheaper home, a lower-down loan program, or asking the seller for a closing cost credit can cut the cash you need more than any budgeting trick."],
        ]} />
      </Card>

      <Card title="How Long Does It Take to Save for a Down Payment?">
        <P>
          It comes down to your target and your monthly savings. Here’s what it looks like for a $300,000 home, with closing
          costs at 3%. These figures ignore interest earned, so they’re a little conservative.
        </P>
        <DataTable headers={SAVING_HEADERS} rows={SAVING_ROWS} />
        <P>
          That table explains why so many people end up buying with less than 20% down. For someone saving $500 a month, a 20%
          goal is more than a decade away, and home prices will probably move in the meantime. Raising your monthly savings by
          even a few hundred dollars shortens the timeline a lot. Plug your own numbers into the calculator and see which
          scenario feels right.
        </P>
      </Card>

      <Card title="How Do Other People Save Enough for a First Home?">
        <P>
          Most first-time buyers don’t get there with one big move. The usual pattern is a mix. According to the same NAR
          survey, personal savings are the top source of down payment money for first-time buyers (59%), followed by financial
          assets like 401(k)s, IRAs and stocks (26%), and then gifts or loans from friends and family (22%). Those add up to
          more than 100% because lots of buyers use more than one source.
        </P>
        <P>
          In practice, that looks like a few things happening together: months or years of automatic transfers into a savings
          account, a tax refund or bonus tossed in, help from parents or a partner, and sometimes a down payment assistance loan
          to fill the last gap. Most people also lower their original goal. Few buyers hit the number they started with, and
          the ones who succeed tend to be the ones who adjusted the plan instead of giving up when it didn’t match the
          textbook.
        </P>
      </Card>

      <Card title="What Are Some Down Payment Options If You Don’t Have Enough Saved?">
        <P>Falling short is common, and there are legitimate ways to close the gap.</P>
        <List items={[
          ["Low-down-payment loans.", "FHA at 3.5%, conventional programs at 3%, and zero-down VA and USDA loans are all designed for buyers who haven’t saved 20%. Compare the total monthly cost of each, not just the cash required."],
          ["Down payment assistance (DPA).", "Cities, counties, state housing finance agencies and nonprofits run programs that offer grants, forgivable loans, or low-interest second mortgages. Most are meant for first-time or income-limited buyers purchasing a primary residence, and many require a homebuyer education class, decent credit and documented income. Some grants have to be repaid if you sell or refinance within a certain number of years. HUD’s website lists programs by state, and your lender can tell you which ones fit your situation."],
          ["Gift funds.", "FHA loans let the whole down payment come from a gift from a relative, close friend or employer, as long as you include a signed gift letter confirming it doesn’t need to be repaid. Conventional loans allow gifts too, though rules are tighter for second homes, investment properties and multi-unit buildings. Lenders typically want to see the donor’s relationship to you, the amount, and proof the money moved from their account to yours."],
          ["Piggyback loan (80-10-10).", "You take out a first mortgage for 80% of the price, a second loan for 10%, and put down the final 10% yourself. Because the first loan is only 80% of the home’s value, you avoid PMI. The tradeoff is that the second loan usually carries a higher interest rate, and these loans are less widely available than they used to be."],
          ["IRA withdrawal.", "Normally, taking money out of a traditional IRA before age 59½ triggers a 10% penalty plus income tax. But there’s an exception for first-time homebuyers (generally someone who hasn’t owned a primary home in the past two years). You can pull up to $10,000 out of an IRA for a home purchase without the penalty, and that’s a lifetime limit per person. The money can also go toward a home for your spouse, parents, children or grandchildren. You have 120 days to use it. If you’re married, you and your spouse can each take $10,000 from your own IRAs for $20,000 total. Keep in mind that on a traditional IRA you’ll still owe regular income tax. With a Roth IRA, the contributions you’ve made can be withdrawn anytime without tax or penalty, and the earnings portion qualifies for the $10,000 penalty exception, and it’s tax-free if the account has been open at least five years."],
          ["401(k) loan.", "If your plan allows it, you can borrow the lesser of $50,000 or half your vested balance. There’s no tax or penalty as long as you repay on schedule, and the interest goes back into your own account. Most plans require repayment within five years, though some allow longer terms for a home purchase. The risks are real: your money is out of the market while it’s borrowed, the payments come out of your paycheck, and if you leave or lose your job, the balance can become due quickly. If you can’t repay, it’s treated as a taxable withdrawal, with a 10% penalty if you’re under 59½. Avoid hardship withdrawals if you can, since those are taxed and penalized with no option to repay."],
          ["Seller concessions and lender credits.", "These won’t cover your down payment itself, but they can cover closing costs, which frees up your cash for the down payment. Limits depend on the loan type and down payment size."],
          ["Co-buyer or co-signer.", "Buying with a partner, family member or friend lets you pool savings and incomes. Just make sure you’ve got a written agreement about ownership, payments and what happens if one person wants out."],
        ]} />
      </Card>

      <Card title="Is It Better to Save While You Rent or Buy With No Down Payment?">
        <P>It’s one of the toughest calls in home buying, and the answer depends on your situation, not a rule.</P>
        <P>
          <strong>Saving longer while renting</strong> gives you a bigger down payment, lower monthly payment, and possibly no
          mortgage insurance. The risk is that home prices and interest rates keep rising while you wait, and your rent doesn’t
          build equity. If prices go up 4% a year on a $300,000 house, that’s $12,000 more you’ll need to save next year, which
          can outpace what many people can set aside.
        </P>
        <P>
          <strong>Buying with little or nothing down</strong> gets you into the home sooner, starts building equity, and locks
          in your housing cost (aside from taxes and insurance). The tradeoff is a bigger loan, a higher monthly payment,
          mortgage insurance or a funding fee, and very little cushion if values dip.
        </P>
        <P>
          Here’s a practical way to think about it. First, compare your all-in monthly cost for owning (payment, taxes,
          insurance, mortgage insurance, maintenance) against your current rent. Second, think about how long you’ll stay.
          Buying and selling a home costs a lot, often 6% to 10% of the price once you add up closing costs and agent fees on
          the way out, so if you might move within three to five years, renting could come out ahead. Third, look at your
          finances after closing. If buying leaves you with no savings, that’s a red flag, no matter how good the deal looks on
          paper.
        </P>
      </Card>

      <Card title="Is It Bad to Buy a House With No Down Payment?">
        <P>
          Not automatically. VA and USDA loans exist for exactly this purpose, and plenty of people have built wealth through
          them. But there are things you should know going in.
        </P>
        <P>
          You’ll start with zero equity. With closing costs and selling costs, you may owe more than you’d net from a sale for
          the first few years unless the home appreciates. If you have to move early or prices dip, you could end up stuck or
          owing money at sale.
        </P>
        <P>
          Your monthly payment will be higher because you’re financing the whole price, and you’ll pay some form of mortgage
          insurance or fee, such as the VA funding fee or the USDA guarantee fee. Your rate may also be slightly higher.
        </P>
        <P>
          And you have less wiggle room. If you spend every penny getting in, there’s nothing left for repairs. A rule of thumb
          is to expect about 1% of the home’s value in maintenance every year, and that often shows up as a lump sum, like a
          water heater or roof leak.
        </P>
        <P>
          If you’re eligible for a zero-down program, have steady income, a good credit profile, and cash reserves left over,
          it can be a smart move. If it would drain your last dollar, a slightly larger down payment or waiting a bit longer is
          usually safer.
        </P>
      </Card>

      <Card title="Free, Accurate, and Private">
        <P>
          This down payment calculator is free, with no hidden charges and no account needed. It uses standard mortgage
          amortization math, the same formula lenders use for principal and interest, so the payment numbers are reliable as
          long as your inputs are realistic.
        </P>
        <P>
          Treat the results as planning estimates, not a loan offer. Your actual rate, fees, insurance and taxes will come from
          your lender and the property, and your Loan Estimate is the document to rely on before you commit. The calculation
          only needs numbers, so there’s no reason to type in your name, address or any account details.
        </P>
      </Card>

      <Card title="What a Down Payment Calculator Does">
        <P>
          A down payment calculator turns a fuzzy goal (“I want to buy a house someday”) into actual numbers. It ties together
          four things people usually guess at separately: the purchase price, the cash you put down, the closing costs due at
          signing, and the mortgage you’ll finance.
        </P>
        <P>
          This home down payment calculator goes beyond a simple percentage converter. A basic one tells you 10% of $400,000 is
          $40,000, which is fine, but it leaves out the closing costs you’ll also need cash for and the monthly payment that
          follows. This tool includes both, so the total you see is a lot closer to what needs to be sitting in your account on
          closing day.
        </P>
      </Card>

      <Card title="How to Use This House Down Payment Calculator">
        <P>There are three modes. Pick the one that matches what you already know.</P>
        <P>
          <strong>Find the home price your cash can buy.</strong> Use this when your savings are fixed and the price is
          unknown. Enter the total cash you have, the down payment percentage you’re aiming for, and your closing cost
          estimate. The calculator splits your cash between the down payment and closing costs and gives you the maximum
          price. Say you have $60,000, want 10% down, and expect closing costs of 3%. Since 13% of the price has to come from
          cash, the price works out to about $461,500.
        </P>
        <P>
          <strong>Find the cash needed for a home.</strong> Use this when you’ve got a specific house in mind. Enter the price,
          the down payment percentage and the closing cost estimate. You’ll see the down payment amount, the closing costs, the
          total cash to close, the loan amount and the monthly payment.
        </P>
        <P>
          <strong>Find the down payment percentage you can afford.</strong> Use this when you know the price and how many
          dollars you can put down. It returns the percentage, which is the number lenders care about. Putting $40,000 down on
          a $350,000 home is about 11.4%. That clears the 10% mark but not the 20% mark, and the difference matters for
          mortgage insurance.
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
