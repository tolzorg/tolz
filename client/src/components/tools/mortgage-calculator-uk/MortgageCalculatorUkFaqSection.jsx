import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a mortgage calculator work in the UK?",
    a: "It takes your loan amount, interest rate and term, then applies the standard amortization formula to work out a fixed monthly payment. On a repayment mortgage, that payment clears both interest and capital by the end of the term.",
  },
  {
    q: "How much deposit do I need for a mortgage in the UK?",
    a: "Most lenders ask for at least 5%, though 10% opens up more choice and a bigger deposit generally gets you better rates. Non-residents are often asked for 25% to 40%.",
  },
  {
    q: "How much can I borrow for a mortgage in the UK?",
    a: "Most lenders offer around 4 to 4.5 times your gross annual income, and some go to 5.5x or 6x for certain borrowers. Lenders also run affordability checks on your spending, debts and dependants, which can lower the figure.",
  },
  {
    q: "What’s the difference between repayment and interest-only?",
    a: "Repayment payments cover both interest and capital, so the debt clears by the end of the term. Interest-only payments cover just the interest, leaving the full loan to repay at the end.",
  },
  {
    q: "What is stamp duty on a UK home?",
    a: "In England and Northern Ireland, standard rates are 0% up to £125,000, 2% to £250,000, 5% to £925,000, 10% to £1.5 million and 12% above that. First-time buyers pay nothing up to £300,000 and 5% from £300,001 to £500,000. Scotland and Wales have their own taxes.",
  },
  {
    q: "Can I get a mortgage with a 5% deposit?",
    a: "Yes. Many lenders offer 95% LTV mortgages, and the government’s permanent Freedom to Buy scheme backs part of that lending. Rates tend to be higher than for bigger deposits, so compare deals carefully.",
  },
  {
    q: "Can I get a mortgage if I’m self-employed?",
    a: "Yes. Lenders usually want two years of accounts or tax returns, though some accept one year. Contractors on day rates can often qualify using their day rate over around 46 weeks.",
  },
  {
    q: "Can a non-UK resident get a UK mortgage?",
    a: "Yes, but fewer lenders offer it, the deposit is often 25% to 40%, and an extra 2% stamp duty surcharge applies in England and Northern Ireland.",
  },
  {
    q: "Does paying extra each month save money?",
    a: "Yes. Overpayments reduce your balance sooner, which cuts the interest charged on every later payment. On a £200,000 loan at 5%, an extra £200 a month would clear it about six years early. Check your lender’s overpayment limit first.",
  },
  {
    q: "What happens if I can’t pay my mortgage?",
    a: "Contact your lender straight away. They’re required to treat you fairly and may offer options like a term extension or a temporary switch to interest-only. Free advice is available from StepChange, Citizens Advice and MoneyHelper.",
  },
  {
    q: "Is this mortgage calculator free, and do I need to sign up?",
    a: "It’s free, and you can run as many calculations as you like without creating an account.",
  },
  {
    q: "Are the results the same as a lender’s quote?",
    a: "They should be close if you use the same rate, term and loan amount, but a lender’s quote may include fees and features the calculator doesn’t. Treat the result as a planning estimate.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const SDLT_HEADERS = ["Portion of the price", "Rate"];
const SDLT_ROWS = [
  ["Up to £125,000", "0%"],
  ["£125,001 to £250,000", "2%"],
  ["£250,001 to £925,000", "5%"],
  ["£925,001 to £1.5 million", "10%"],
  ["Over £1.5 million", "12%"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
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

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
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

export default function MortgageCalculatorUkFaqSection() {
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
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="How UK Mortgages Work, Start to Finish">
        <H3>How do UK mortgages work?</H3>
        <P>
          A mortgage is a loan that’s secured against the property you’re buying. If you stop paying and can’t sort it out with
          the lender, they can take the home back through the courts. That security is why mortgage rates are so much lower than
          rates on personal loans or credit cards.
        </P>
        <P>
          Most people borrow somewhere between 75% and 95% of the purchase price and cover the rest with a deposit. The loan runs
          over a set term, usually 25 to 35 years. You pay interest every month on whatever you still owe. On a repayment
          mortgage, part of each payment also chips away at the balance, so you own the home outright at the end. Most UK
          mortgages also come with an initial deal period, often two or five years at a fixed rate. When that ends, you drop
          onto the lender’s standard variable rate (SVR) unless you switch to a new deal, and that’s why so many people
          remortgage every few years.
        </P>

        <H3>How do you buy a house with a mortgage in the UK, step by step?</H3>
        <P>The process is pretty similar across England, Wales and Northern Ireland, with some Scottish quirks.</P>
        <List ordered items={[
          ["Work out your budget.", "Run the numbers on a calculator and decide what monthly payment you’re comfortable with."],
          ["Get a mortgage in principle.", "This is a quick check, sometimes called a decision in principle, that tells you roughly how much a lender would offer. It’s not a guarantee, but estate agents want to see one before they take your offer seriously."],
          ["Find a property and make an offer.", "Once it’s accepted, you’re not bound yet. In England, Wales and Northern Ireland, either side can still walk away until contracts are exchanged."],
          ["Make the full application.", "The lender checks your income, spending and credit file, and orders a valuation of the property."],
          ["Receive the mortgage offer.", "Offers usually stay valid for around three to six months."],
          ["Conveyancing.", "Your solicitor handles the legal work, searches and the stamp duty return."],
          ["Exchange and completion.", "Contracts get exchanged, you pay the deposit, and on completion day the lender sends the money and you get the keys."],
        ]} />
        <P>
          In Scotland, the sale becomes legally binding earlier, once the solicitors conclude the missives. So don’t put in a
          Scottish offer before your finances are fully lined up.
        </P>

        <H3>What do you need to get a mortgage in the UK?</H3>
        <P>Lenders will ask for a lot of paperwork, and having it ready can save you weeks. Here’s what to gather:</P>
        <List items={[
          ["", "Photo ID and proof of your address, plus addresses for the last three years, with no gaps"],
          ["", "Payslips for the last three months, and your P60 or the last few years of income records"],
          ["", "Bank statements for the last three months (more can help)"],
          ["", "Details of any loans, credit cards, car finance or other regular commitments"],
          ["", "Proof of your deposit and where it came from, such as savings statements or a gifted-deposit letter"],
          ["", "If you’re self-employed, tax returns (SA302s) and tax year overviews"],
        ]} />
        <P>
          Check your credit file before you apply. If something looks wrong, such as an old address you never lived at or a debt
          that’s already been settled, get it fixed first. If there’s a genuine blemish like a missed payment, tell your adviser
          upfront so they can pick lenders that are forgiving about it.
        </P>

        <H3>Why do so many people in the UK take out a mortgage?</H3>
        <P>
          Part of its culture and part of its math. Roughly two-thirds of households in England own their home, and owning has
          long been treated as the default goal. Social housing is limited, private tenancies can be short and rents can jump, so
          a fixed-rate mortgage gives people payment certainty for a few years at least. Historically, UK house prices have gone
          up over the long run, which has rewarded people who borrowed to buy. Government policy has pushed in the same
          direction for decades, from Right to Buy in the 1980s to today’s first-time buyer schemes.
        </P>
        <P>
          That said, “everyone should get a mortgage” isn’t a universal rule. If you might move in two years, can’t cover a rate
          rise, or don’t have a decent emergency fund, buying can be the wrong call. The mortgage calculator on this page is a
          good way to test how tight things would feel before you commit.
        </P>

        <H3>What’s the most common way to get a mortgage: bank or broker?</H3>
        <P>
          The large majority of UK mortgages are now arranged through brokers rather than directly with a bank. A whole-of-market
          broker can compare products across lenders you might never think to approach, and some deals are only available
          through brokers. Brokers charge a fee, a commission from the lender, or both, so ask upfront how they’re paid. Going
          direct to your own bank is simple and sometimes gets you a decent deal, but you’re only seeing one lender’s range.
          Always check an adviser is listed on the FCA Register.
        </P>

        <H3>What’s the easiest way to get a mortgage in the UK?</H3>
        <P>
          There’s no magic trick, but a few things make approval much smoother. Get your credit file in good shape, be on the
          electoral roll at your address, and avoid taking on new credit in the months before you apply. Save a bigger deposit if
          you can, because a 10% or 15% deposit puts you in front of many more lenders than 5% does. Pick a realistic price based
          on your income, not on what you hope a lender will stretch to. And use a broker, especially if your situation isn’t
          straightforward. Finally, have every document ready before you apply, since delays usually come from missing
          paperwork, not from the lender.
        </P>

        <H3>Who can get a mortgage in the UK?</H3>
        <P>
          Generally, you need to be 18 or over, have a steady income that supports the loan, a credit history that doesn’t scare
          lenders, and a deposit. UK citizens, residents with settled status or the right to live here, and in many cases foreign
          nationals on longer visas can all borrow. The sections further down cover self-employed buyers, non-residents,
          students, older borrowers and other situations in more detail.
        </P>
      </Card>

      <Card title="Specialist and Alternative Mortgage Types">
        <H3>What is a reverse mortgage in the UK?</H3>
        <P>
          “Reverse mortgage” is more of a US term. In the UK, the closest thing is a lifetime mortgage, which is a type of equity
          release for homeowners aged 55 or older. You borrow against the value of your home, but you usually don’t make monthly
          payments. Instead, the interest gets added to the loan each year and the whole thing is repaid from the sale of the
          home when you die or move into long-term care. The tradeoff is that the debt grows fast. At 5% interest, a lifetime
          mortgage balance roughly doubles in about 14 years, which can eat into what’s left for your family. There’s a separate
          product called a home reversion plan, where you actually sell part of your home in exchange for a lump sum or income.
        </P>

        <H3>What is a lifetime mortgage in the UK?</H3>
        <P>
          A lifetime mortgage is a loan secured on your home, available from age 55 at most providers, that lets you stay in the
          property for life. Interest typically rolls up, though some plans let you pay the interest monthly so the balance
          doesn’t grow. Providers who belong to the Equity Release Council follow standards that include a no-negative-equity
          guarantee, so you can never owe more than the home’s value when it’s sold, and a right to stay in the home for life.
          You’re also required to get advice from a qualified equity release adviser first. It’s a big decision, so compare it
          against downsizing, a retirement interest-only mortgage, or using savings.
        </P>

        <H3>What is a let-to-buy mortgage in the UK?</H3>
        <P>
          Let to buy is for people who want to move to a new home without selling their current one. You keep the old place and
          rent it out, typically by switching your existing mortgage to a buy-to-let (or consent-to-let) arrangement, and then
          take out a new residential mortgage on the home you’re moving to. Lenders will want the rent to cover the mortgage with
          some room to spare, commonly 125% to 145% of the interest payment at a stress-tested rate. They also usually like to
          see at least 25% equity in the property being let. One cost people miss: since you’ll own two properties, the
          higher-rate stamp duty surcharge usually applies to the new purchase.
        </P>

        <H3>What is a tracker mortgage?</H3>
        <P>
          A tracker mortgage follows another interest rate, most often the Bank of England base rate, plus a set margin. If the
          base rate is 3.75% and your tracker is base plus 1%, you pay 4.75%. When the base rate changes, your rate changes with
          it, usually within a month. That means you can benefit quickly from cuts, but you’re exposed to rises too. UK banks
          lean heavily on variable-rate products, so there’s a wide choice of trackers. Some start as trackers for a couple of
          years and then revert to the lender’s SVR. Lifetime trackers follow the base rate for the entire term, and these tend
          to carry early repayment charges for a while after you take them out. Always read what the early repayment charge is
          before you pick one, since it can be thousands of pounds if you leave early.
        </P>

        <H3>What is a flexible mortgage?</H3>
        <P>
          A flexible mortgage lets you change how much you pay as life changes. You can overpay, either with lump sums or by
          bumping up your monthly payment, to clear the debt faster. Some let you underpay for a stretch, and some allow payment
          holidays, which can last up to six months. These perks usually come with conditions. Rates are often a bit higher than
          on standard deals, and the amount you can underpay or skip is capped. Compare the full cost, not just the headline
          rate, and be sure you’ll actually use the flexibility before paying extra for it.
        </P>

        <H3>Which type of mortgage is best for me?</H3>
        <P>It depends on how much payment certainty you want and how long you’ll stay put.</P>
        <List items={[
          ["Fixed rate:", "Your payment stays the same for two, five or sometimes ten years. Best if you’re on a tight budget and hate surprises."],
          ["Tracker:", "Moves with the base rate. Suits people who can absorb a rate rise and want the chance to benefit from a cut."],
          ["Discount:", "A set amount off the lender’s SVR. Cheaper at first, but the SVR can change whenever the lender decides."],
          ["Offset:", "Your savings sit against the mortgage balance, so you pay interest on the difference. Works well if you have decent savings you want to keep accessible."],
          ["Interest-only:", "Lower payments, but you owe the full loan at the end. Mostly for buy-to-let investors and people with a solid repayment plan."],
        ]} />
        <P>
          For most first-time buyers who want stability, a two- or five-year fix is the default. The calculator makes it easy to
          compare what each rate would mean in actual pounds.
        </P>

        <H3>How do interest-only mortgages work in the UK?</H3>
        <P>
          With an interest-only mortgage, your monthly payment covers just the interest. You don’t reduce the loan, so you still
          owe the original amount when the term finishes. Lenders want evidence of a credible plan to repay it, whether that’s
          savings, investments, a pension lump sum or selling the property. Plain interest-only residential mortgages are rare
          now, and most lenders will only offer them with a big deposit or equity. They’re much more common in buy-to-let, where
          the plan is often to sell the property at the end of the term. Some lenders also offer part-and-part mortgages, where
          one portion of the loan is repaid and the other is interest-only.
        </P>

        <H3>What are the advantages of an interest-only mortgage?</H3>
        <P>
          The headline benefit is a lower monthly payment, which can free up cash and make a borrowing scenario work that
          wouldn’t on a repayment basis. For landlords, it keeps monthly costs low and rental yields look better on paper. It
          also gives you flexibility to invest the difference elsewhere. The downsides are real, though. You’re not building
          equity through payments, you’re relying on property prices or investments to cover the final bill, and if your plan
          falls short, you could be forced to sell. For a residential buyer, interest-only is usually a risky way to make a
          mortgage “fit”.
        </P>

        <H3>What are the pros and cons of a buy-to-let interest-only mortgage?</H3>
        <P>
          <strong>Pros:</strong> Lower monthly outgoings, better cash flow, and the potential to put the savings into other
          assets. Rent can cover the interest, and you may benefit if the property’s value grows. <strong>Cons:</strong> The
          full loan is still due at the end, you’re exposed if rates rise or rents fall, and you need a firm exit plan. Landlords
          also have to deal with the 5% extra stamp duty on additional properties, mortgage interest being only a 20% tax credit
          rather than a full deduction, and tenancy reforms that change how easy it is to end a tenancy. Lenders typically ask
          for a 25% deposit and want rent to cover 125% to 145% of the interest at a stress rate. For the right investor it can
          still work, but it’s a lot tighter than it was a decade ago.
        </P>

        <H3>Is buy-to-let still a good investment with a mortgage?</H3>
        <P>
          It can be, but margins are thinner. After the extra stamp duty, the shift in mortgage interest tax relief and higher
          borrowing costs, many landlords make a smaller return than they would’ve in the 2010s. It works best when the rental
          yield is strong, you’re buying at a good price, and you can handle a void period or a rate rise without stress. Run the
          numbers on the calculator with an interest-only setup, then compare against your expected rent minus insurance,
          maintenance, agent fees and tax. If the profit only exists in a best-case scenario, that’s a warning sign.
        </P>

        <H3>Which banks in the UK offer consumer buy-to-let mortgages?</H3>
        <P>
          Consumer buy-to-let mortgages are aimed at “accidental landlords”, for example someone who inherited a property or
          moved in with a partner and rented out their old home. Several high-street banks and building societies offer them,
          alongside specialist lenders. Since the lender list shifts and each has its own rules on rental cover, deposit size and
          tenant type, a broker who covers the whole market will find the current options faster than a list of names ever
          could.
        </P>
      </Card>

      <Card title="Deposits, Borrowing Limits and Affordability">
        <H3>How much deposit is needed for a mortgage in the UK?</H3>
        <P>
          Most lenders ask for at least 5% of the purchase price, which gets you a 95% loan-to-value (LTV) mortgage. A 10%
          deposit opens up more lenders and better rates. At 15% to 25% you start getting access to the more competitive LTV
          bands, and a 40% deposit often gets the best rates available. Non-residents are often asked for 25% to 40%. On a
          £250,000 home, 5% is £12,500, 10% is £25,000 and 20% is £50,000. That’s before stamp duty, legal fees and moving costs,
          which you’ll need to cover on top.
        </P>

        <H3>How does the 95% mortgage scheme work?</H3>
        <P>
          The government’s scheme is called Freedom to Buy, and it replaced the temporary Mortgage Guarantee Scheme that ran from
          2021 until mid-2025. It became permanent in July 2025. Here’s how it works: participating lenders offer 95% LTV
          mortgages, and the government guarantees part of the lender’s risk if a borrower defaults. You don’t get the guarantee
          yourself and you don’t borrow from the government. The result is that lenders feel safer offering small-deposit loans.
          Some lenders put conditions on it, like a cap on the property value or restrictions on new builds, and plenty of
          lenders now offer 95% mortgages outside the scheme anyway. So don’t pick a lender just because it’s in the scheme. A
          broker can compare the whole 95% market for you.
        </P>

        <H3>Can you get a mortgage in the UK without any savings?</H3>
        <P>
          It’s possible but difficult. You’d typically need a way around the deposit. Options include a family-backed or
          guarantor mortgage, where a relative pledges savings or property as extra security, or a gifted deposit from family
          (lenders will want a letter confirming it’s a gift, not a loan). Shared ownership lets you buy a share of a home, often
          10% to 75%, and pay rent on the rest, so the deposit is calculated on your share only. Some schemes, like a Lifetime
          ISA, add a 25% government bonus on savings, up to £1,000 a year, which helps a lot over time, though there are age and
          property-price limits to check. Taking out a loan to cover a deposit will usually get your application declined, since
          lenders ask where the money came from.
        </P>

        <H3>How much can you borrow for a UK mortgage?</H3>
        <P>
          Most lenders start with income multiples, then run a full affordability assessment on top. Standard lending sits around
          4 to 4.5 times your gross annual income. A growing number of lenders now go to 5.5x or even 6x for higher earners,
          first-time buyers who meet certain criteria, and some professions like doctors, solicitors and accountants. A few offer
          even more for their own premier customers. The Bank of England’s loan-to-income flow limit restricts how many loans a
          lender can make above 4.5x, which is why the higher multiples aren’t available to everyone. Affordability checks, which
          look at your debts, regular outgoings, dependants and a stress test for higher rates, can bring the figure down. On a
          £50,000 salary, 4.5x is £225,000 and 5.5x is £275,000.
        </P>

        <H3>How many times your salary can you borrow, and can you get 5x your joint salary?</H3>
        <P>
          For a single applicant, 4 to 4.5 times is the norm. Joint applications are usually calculated on the combined income,
          often at the same multiple, though some lenders use a lower figure for the second income. Five times joint salary is
          possible with certain lenders if your deposit is healthy, your income is stable and you have few debts. It’s more
          realistic once you’re in the higher-income brackets or fall into a favored profession. For example, on a combined
          £80,000 income, 4.5x is £360,000, 5x is £400,000 and 5.5x is £440,000. Whether you’re approved depends on your
          outgoings. Debts like car finance and student loan repayments can bring the number down, and having kids can reduce it
          further.
        </P>

        <H3>Is a £292,505 mortgage affordable in the UK?</H3>
        <P>
          There’s no yes or no without knowing your income and outgoings, but here’s a way to gauge it. At 4.5x income, you’d
          need roughly £65,000 a year to borrow £292,505, and at 5.5x about £53,000. At a 5% rate over 30 years, the payment
          would be around £1,570 a month, or about £1,710 over 25 years. A decent check is whether that payment still works if
          rates rose by two percentage points, and whether you’d still have money left for bills, savings and surprises. If it
          passes that test, the loan is probably within reach.
        </P>

        <H3>Do most people qualify for a mortgage worth 50% of what they make?</H3>
        <P>
          Not really, and the “50%” part tends to trip people up. Lenders talk about loan-to-income multiples, not a percentage
          of income going to the payment. A more useful way to think about it is how much of your take-home pay goes to the
          mortgage. Many people aim for around 30% to 35% of take-home, and once it climbs past 40% things usually feel tight. If
          half your take-home went toward housing, you’d have very little buffer, and most lenders’ affordability checks would
          flag it.
        </P>

        <H3>What mortgage can you afford in the UK, and how do you calculate affordability by income?</H3>
        <P>
          Start with income multiples to get a rough ceiling, then check it with a monthly budget. Take your gross income and
          multiply by 4 to 4.5 for a typical starting figure. Then add your deposit to see the maximum price. Next, list your
          fixed outgoings, like childcare, debts and bills, plus what you actually spend on food, transport and leisure. Subtract
          all that from your take-home pay and see what’s left for a mortgage payment. Plug that loan into the calculator at
          today’s rate and at a rate two points higher. If you’d still be comfortable at the higher rate, you’ve found a sensible
          number. If you’d be stretched, aim lower.
        </P>

        <H3>What credit score do you need for a mortgage in the UK?</H3>
        <P>
          There’s no single required score. The UK has three main credit reference agencies, Experian, Equifax and TransUnion,
          and each uses a different scale. Experian, for example, runs from 0 to 999, with 881 or above considered good. Lenders
          mostly use their own scorecards and look at what’s on your report. Late payments, defaults and county court judgments
          hurt the most, while a clean history, long-standing accounts and being on the electoral roll help. Applying for lots of
          credit in a short period can also lower your chances. Check all three reports free before applying, and fix any
          errors.
        </P>

        <H3>How do people afford a £1 million mortgage?</H3>
        <P>
          By having a very large income, a very large deposit, or both. A £1 million loan at 5% over 30 years costs about £5,370
          a month. At 4.5x income, you’d need to earn around £222,000. At 5.5x it’s about £182,000. In practice, most buyers at
          that level are in London or the South East, are on a dual income, and have equity from an earlier property. Often the
          loan is lower because the deposit is large. If you’re running the numbers on a big loan, use the calculator to see how
          a bigger deposit or longer term changes the monthly figure.
        </P>

        <H3>Are personal loans better than a mortgage for buying a house?</H3>
        <P>
          Almost never. Personal loans are unsecured, so rates are usually higher, and terms are much shorter, typically up to
          seven to ten years, which makes the payments huge on a home-sized amount. Lenders also won’t let you use borrowed money
          as your deposit, and any existing loan reduces how much you can borrow. The UK equivalent of a US home equity loan is a
          second-charge mortgage, which borrows against equity in a property you already own. That can make sense for home
          improvements or consolidating debts, but it puts your home on the line and adds to your overall borrowing.
        </P>
      </Card>

      <Card title="Special Situations: Who Can Borrow and How">
        <H3>How can you get a mortgage alone in the UK?</H3>
        <P>
          You can absolutely buy on one income, you just need to plan more carefully. Lenders will lend around 4 to 4.5 times
          your salary, some more, so your price range is narrower. Boost your odds by keeping your credit clean, paying down
          existing debts, and saving a bigger deposit. Look at schemes designed for solo buyers, like Freedom to Buy, shared
          ownership, First Homes and the Lifetime ISA bonus. Some lenders also offer higher income multiples for first-time
          buyers with certain incomes, so ask a broker about those. If a family member wants to help, a guarantor or
          family-assist mortgage might work.
        </P>

        <H3>Can a non-resident apply for a UK mortgage?</H3>
        <P>
          Yes, but the road is narrower. Fewer lenders will touch non-resident or expat applications, you’ll often need a deposit
          of 25% to 40%, and lenders may want proof of income in a currency they accept and extra checks on your finances. If
          you’re buying in England or Northern Ireland and aren’t in the UK for at least 183 days in the 12 months before the
          purchase, you’ll also pay a 2% non-resident surcharge on top of normal stamp duty. Specialist brokers who deal with
          expats are worth using here.
        </P>

        <H3>How can you get an international mortgage in the UK?</H3>
        <P>
          If you live overseas, start with lenders that specialize in expat and foreign national mortgages. They’ll typically
          want a bigger deposit, evidence of your income and employment, and sometimes a UK solicitor and a UK bank account. Some
          lenders only accept certain nationalities or countries of residence, and rates can be a bit higher. A broker with expat
          experience can narrow the list quickly.
        </P>

        <H3>How long do I need to live in the UK to get a mortgage?</H3>
        <P>
          For UK citizens, there’s no minimum. For foreign nationals, it depends on the lender and your visa. Some want you to
          have lived here for one to three years, and many want to see the remaining time on your visa, with a typical minimum of
          around 6 to 12 months left. Having a UK credit history, a UK bank account and steady UK employment helps a lot. Those
          with indefinite leave to remain or settled status are usually treated much like UK citizens.
        </P>

        <H3>Can UK residents who aren’t citizens get a mortgage?</H3>
        <P>
          Yes. Residents with indefinite leave to remain, settled or pre-settled status, or a valid visa can get mortgages. The
          details depend on the visa type and how long it has left. Lenders will ask for proof of your right to be in the UK, a
          share code or visa documents, and some are fine with work visas while others only accept settled status. A broker can
          point you to the lenders whose criteria fit your situation.
        </P>

        <H3>Can a freelancer or contractor get a mortgage in the UK?</H3>
        <P>
          Yes, though lenders ask for more evidence. Self-employed people typically need two years of accounts or tax returns
          (SA302s and tax year overviews), though some lenders accept one year. Lenders look at your average net profit, or for
          company directors, your salary plus dividends, and sometimes your share of retained profits. Contractors on day rates
          can often qualify using a day rate multiplied by around 46 weeks, as long as you have a track record or a contract that
          backs it up. Keep your accounts tidy, avoid big swings in income where you can, and speak to a broker who’s used to this
          kind of application.
        </P>

        <H3>Can students get a mortgage in the UK?</H3>
        <P>
          Full-time students without earnings can’t normally get one, because they don’t have the income to show affordability.
          Once you’re working, a student loan doesn’t count as normal debt, but the repayments reduce your take-home pay and
          lenders take that into account. Some mortgages are aimed at graduates and certain professions, such as trainee doctors.
          A guarantor, a family-assist mortgage or a larger gifted deposit can also help younger buyers.
        </P>

        <H3>Can a husband and wife get a mortgage at 50 and 40?</H3>
        <P>
          Yes. Lenders look at the age of the older applicant when setting the maximum term. Most lenders want the mortgage
          cleared by somewhere between 70 and 75, and some go much higher, so at 50 you could still take 20 to 25 years. Your
          lender will want to know your plans for retirement income if the term goes beyond your expected retirement age. Joint
          applications also use both incomes, so the younger partner’s earnings can help.
        </P>

        <H3>Can an 80-year-old get a 30-year mortgage?</H3>
        <P>
          Not in a typical sense. Maximum ages at the end of the term range from about 70 to 85 at many lenders, and a few go up
          to 95 or have no upper limit, but they’d need to see that you can afford the payments from retirement income like
          pensions. A 30-year term at age 80 would go well beyond that. Better options for older borrowers include a retirement
          interest-only (RIO) mortgage, where you pay only the interest and the loan is repaid when you die or move into care, or
          a lifetime mortgage. An independent adviser who specializes in later-life lending is a must.
        </P>

        <H3>Can I get a mortgage on land with no planning permission?</H3>
        <P>
          It’s very unlikely. Mortgage lenders generally won’t lend against land without planning permission, because it’s hard
          to value and hard to sell if something goes wrong. People in this position often buy with cash, use a bridging loan or a
          specialist land loan (at higher rates), or buy under an option agreement while they apply for planning. If you’re
          serious, get advice from a planning consultant before you buy.
        </P>

        <H3>How do you buy land for a self-build with a mortgage?</H3>
        <P>The usual route is a self-build mortgage. Here’s roughly how it goes:</P>
        <List ordered items={[
          ["", "Find a plot, ideally with planning permission already granted, and check access, services and flood risk."],
          ["", "Speak to a self-build mortgage broker. Lenders release money in stages as the build progresses, rather than as a lump sum."],
          ["", "Get your plans, building regulations approval and a detailed cost schedule together."],
          ["", "Arrange your deposit. Self-build lenders often want 15% to 25%, and you may need extra funds to cover costs between stage payments."],
          ["", "Have a building warranty or professional sign-off in place, since lenders require it before releasing funds."],
          ["", "Look into the VAT reclaim scheme for self-builders, which can return the VAT you pay on materials, and check for Community Infrastructure Levy exemptions."],
        ]} />
        <P>Some lenders will fund the land purchase as the first stage, and others only offer a mortgage once the build begins.</P>

        <H3>Can I use my house as security for a mortgage in the UK or Jersey?</H3>
        <P>
          In the UK, yes. You can remortgage your home to borrow more against its value, or take a second-charge loan or secured
          loan on top of your existing mortgage. Any of these puts your home at risk if you can’t keep up the payments. Jersey
          isn’t part of the UK. It has its own laws, lenders and conveyancing rules, so if the property is in Jersey, speak to a
          local lender or adviser rather than relying on UK guidance.
        </P>

        <H3>Can I use a UK mortgage to buy a flat in Spain?</H3>
        <P>
          Most UK high-street lenders won’t lend on overseas property. Your realistic options are a specialist international
          mortgage from a lender that covers Spain, a mortgage from a Spanish bank (which commonly lends non-residents a lower
          share of the value, often around 60% to 70%), or releasing equity from your UK home to fund the purchase. Budget for
          transfer tax and other purchase costs, which in Spain can add up to around 10% to 13% depending on region, and take
          advice on tax if you plan to rent it out. The UK mortgage calculator on this page covers UK property only, so run
          Spanish numbers on a tool that handles euros.
        </P>
      </Card>

      <Card title="Stamp Duty: What You’ll Actually Pay">
        <P>
          Stamp duty is a big UK-specific cost, and it changes. Here are the current rules for England and Northern Ireland,
          where it’s called Stamp Duty Land Tax (SDLT). Scotland has Land and Buildings Transaction Tax (LBTT), and Wales has Land
          Transaction Tax (LTT), each with different bands. Double-check the figures on gov.uk before you rely on them.
        </P>
        <H3>Current stamp duty rates in England and Northern Ireland</H3>
        <P>Since April 2025, the standard residential rates apply to the portion of the price that falls in each band:</P>
        <DataTable headers={SDLT_HEADERS} rows={SDLT_ROWS} />
        <P>
          Some older online guides still show a £250,000 zero band, which was a temporary measure that ended in March 2025. On a
          £300,000 home, you’d pay £5,000. On £500,000, it’s £15,000.
        </P>
        <H3>First-time buyer relief</H3>
        <P>
          If you and everyone you’re buying with are first-time buyers, you pay no stamp duty up to £300,000 and 5% on the
          portion from £300,001 to £500,000. If the price goes above £500,000, you don’t get any relief and the standard rates
          apply to the whole price. So a first-time buyer purchasing at £400,000 pays £5,000, while one at £500,000 pays
          £10,000, compared with £15,000 under standard rates. That £500,000 cliff-edge is worth knowing about if you’re
          deciding between two properties close to that price.
        </P>
        <H3>Extra stamp duty for additional homes and non-residents</H3>
        <P>
          If buying the new home means you’ll own more than one property, a 5% surcharge applies on top of the normal rates. That
          covers second homes, buy-to-let and let-to-buy purchases. If you’re replacing your main residence, there are rules that
          can refund the surcharge if you sell your old home within three years. Non-UK residents pay a further 2% surcharge.
        </P>
        <H3>Special stamp duty situations</H3>
        <P>
          There are other special rules for buying through a company, shared ownership, buying six or more properties in one
          transaction, multiple transfers between the same people, and more. Because stamp duty can get complicated, ask your
          solicitor to confirm the exact figure before exchange. In the calculator, enter your best estimate so your cash needs
          on completion day don’t come as a surprise.
        </P>
      </Card>

      <Card title="Rates: What They Are, How They Move and How to Get a Better One">
        <H3>What are current mortgage rates in the UK?</H3>
        <P>
          Rates move constantly, so any figure here would go stale fast. As a reference point, the Bank of England base rate was
          3.75% as of late October 2026, after being held at that level since December 2025. Its next decision is on 5 November
          2026. Fixed mortgage rates don’t follow the base rate directly. Moneyfacts data showed average two- and five-year fixed
          rates climbing back above 5% in spring 2026 as geopolitical tensions pushed up market expectations. Deals vary a lot by
          deposit size, with lower-LTV mortgages generally priced below 95% LTV ones. Check a comparison site or a broker for live
          figures before you plug a rate into the calculator.
        </P>

        <H3>How do banks calculate floating rates for mortgages?</H3>
        <P>
          For variable products, the rate is built from a few parts. A tracker is the base rate plus a fixed margin. A discount
          mortgage is the lender’s SVR minus a set amount. The SVR itself is set by the lender and tends to sit several points
          above the base rate, and the lender can change it when it likes. Fixed rates work differently. Lenders price them off
          swap rates, which reflect what financial markets expect rates to do over the next few years, plus the lender’s costs
          and profit margin. That’s why fixed mortgage rates can jump or fall even when the base rate hasn’t moved.
        </P>

        <H3>What does a Fed rate cut mean for UK mortgages?</H3>
        <P>
          Not much directly. The US Federal Reserve sets rates for America, and the Bank of England makes its own decisions. The
          effect is indirect. Fed moves influence global bond yields, the pound and market expectations about where UK rates are
          heading, and those feed into the swap rates that fixed mortgage pricing is based on. So a Fed cut might nudge UK fixed
          rates down slightly, but UK inflation and the Bank’s own decisions matter far more.
        </P>

        <H3>How does the government control the maximum mortgage interest rate in the UK?</H3>
        <P>
          It doesn’t. There’s no legal cap on mortgage interest rates. The Bank of England sets the base rate, which influences
          borrowing costs, but lenders set their own rates. What regulators do control is conduct and risk. The FCA requires
          lenders to check affordability and treat customers fairly, and the Bank of England’s Financial Policy Committee keeps
          an eye on risky lending, for example through the limit on how many high loan-to-income mortgages lenders can issue.
        </P>

        <H3>What are some ways to reduce your mortgage interest rate?</H3>
        <List items={[
          ["Save a bigger deposit.", "Dropping into a lower LTV band is one of the most reliable ways to unlock a better rate."],
          ["Clean up your credit.", "Pay bills on time, reduce card balances, register on the electoral roll and fix any errors."],
          ["Shop around.", "Use a whole-of-market broker and compare both the rate and the fees, since a lower rate with a big arrangement fee can cost more overall."],
          ["Start early.", "You can usually lock in a new deal three to six months before your current one ends, so you’re not stuck on the SVR."],
          ["Consider the term.", "A shorter term has a lower total interest cost, though higher monthly payments."],
          ["Look at special products.", "Some lenders offer cheaper rates for energy-efficient homes or for offset structures."],
        ]} />

        <H3>How do you get the best mortgage rates?</H3>
        <P>
          Pair a high deposit with a strong credit profile, a stable income and a clear affordability picture. Time your
          application well, because rates change weekly and offers hold for a few months, so secure a deal when you find a good
          one. Weigh the fee against the rate by comparing the total cost over the deal period. If you’re on a lender’s SVR,
          switching is often the single biggest saver.
        </P>

        <H3>What is a super low mortgage rate?</H3>
        <P>
          It depends on when you’re asking. In 2021, two-year fixes at 60% LTV dipped under 1.5% for a while, and those days are
          over. Today, a “super low” rate means one that’s meaningfully below the average for your deposit band. Don’t chase a
          headline rate alone. Look at the arrangement fee, the early repayment charges and how long the deal lasts.
        </P>

        <H3>Which bank gives the best mortgage interest rate?</H3>
        <P>
          There’s no single answer, because the best rate changes week to week and depends on your deposit, income and property
          type. Building societies, high-street banks and challenger lenders all take turns at the top of the tables. Use a
          comparison tool or a broker to see the current best-buy list for your deposit size, and then check your eligibility
          with a mortgage in principle.
        </P>

        <H3>What’s the best way to monitor mortgage rate changes?</H3>
        <P>
          Keep an eye on the Bank of England’s rate decisions, which come eight times a year. The next ones are 5 November and 17
          December 2026. Follow average rate data from Moneyfacts, set up alerts with a comparison site, or ask your broker to
          flag when better deals come up. And remember that fixed rates respond to market expectations, so they can change even
          when the base rate doesn’t. If you’ve found a good deal, lock it in. Most offers stay valid for several months, and some
          lenders let you switch to a better one if rates fall before completion.
        </P>

        <H3>How will Brexit affect the mortgage market?</H3>
        <P>
          By now, it’s mostly history. The 2016 referendum caused a dip in the pound and slowed price growth in some markets,
          particularly London, but didn’t crash the mortgage market. The lasting effects are more practical. EU nationals now
          need settled or pre-settled status, or the right visa, to satisfy lender criteria, and some lenders have stricter rules
          for non-UK nationals. The economic effects since then, like inflation and rate rises, have been driven by a lot more
          than Brexit.
        </P>

        <H3>What are the good and bad points of a 99% mortgage?</H3>
        <P>
          <strong>The good:</strong> More people could get on the ladder without years of saving a deposit, and renters stuck
          paying high rent might switch to owning. <strong>The bad:</strong> Tiny equity means a small price drop can leave you in
          negative equity, where you owe more than the home is worth. Rates on high-LTV loans are higher, and the risk of default
          rises if rates climb or incomes fall. Lenders and regulators have long worried about the consequences of too much
          high-LTV lending, which is why the permanent scheme caps out at 95%. If you’re considering one, test your payments at
          higher rates before committing.
        </P>
      </Card>

      <Card title="Paying Off Your Mortgage">
        <H3>How long does it take to pay off a mortgage in the UK?</H3>
        <P>
          A standard mortgage runs 25 years, though terms of 30 or 35 years are increasingly common for first-time buyers wanting
          lower payments. How long it actually takes depends on whether you overpay, remortgage into a shorter term, or extend
          the term to cope with rising costs. Using the calculator, you can see what a 25, 30 or 35-year term does to your
          monthly cost and the total interest.
        </P>

        <H3>What’s the average age people pay off their mortgage in the UK?</H3>
        <P>
          Surveys vary, but many people finish paying somewhere around their early to mid-60s, and a notable number still have a
          mortgage when they retire. Buying later, taking longer terms and borrowing more all push that age up. If clearing the
          debt before retirement is a goal, work backward from the age you want to be mortgage-free and set your term
          accordingly.
        </P>

        <H3>How does the amortization formula work, and how do you calculate your monthly payment?</H3>
        <P>The standard formula is:</P>
        <Formula>M = P × [r(1 + r)^n] ÷ [(1 + r)^n − 1]</Formula>
        <P>
          Where M is your monthly payment, P is the loan amount, r is the monthly interest rate (the annual rate divided by 12),
          and n is the total number of monthly payments. For a £200,000 loan at 5% over 25 years, r is 0.004167 and n is 300,
          which gives a payment of about £1,169 a month. Your lender’s mortgage illustration or your mortgage statements will
          show the actual figure, but the formula gets you very close.
        </P>

        <H3>How much of your mortgage payment goes toward principal?</H3>
        <P>
          In the early years, not much. On that same £200,000 loan at 5%, the first monthly payment of about £1,169 includes
          around £833 of interest and only about £336 of capital, so roughly 29% reduces the balance. That share grows each month,
          because as the balance falls, less interest gets charged. By the later years, almost all of the payment is capital. The
          amortization schedule in the calculator shows this month by month.
        </P>

        <H3>Is it worth paying extra on your mortgage?</H3>
        <P>
          For most people with a mortgage rate above what savings would earn, yes. Every pound you overpay cuts the balance, which
          cuts the interest charged on all future payments. For example, adding £200 a month to that £200,000 loan at 5% would
          clear it about six years sooner and save roughly £40,000 in interest. Before you start, check your overpayment limit.
          Many lenders allow up to around 10% of the balance each year without penalty, but going over can trigger an early
          repayment charge. Also make sure you have an emergency fund, since money you’ve put into the mortgage is hard to get
          back.
        </P>

        <H3>What’s the effect of paying extra principal?</H3>
        <P>
          Extra principal payments reduce the loan balance right away, so less interest accrues from then on. You can ask your
          lender to either shorten the term (which saves the most interest) or lower the monthly payment (which gives you
          breathing room). Early on, overpayments are powerful because they cut into the part of the loan that’s generating the
          most interest.
        </P>

        <H3>How can you pay off your mortgage quicker?</H3>
        <List items={[
          ["", "Make regular monthly overpayments, even small ones."],
          ["", "Put windfalls like bonuses, tax refunds or inheritances toward the balance, within your overpayment limit."],
          ["", "Choose a shorter term when you remortgage."],
          ["", "Keep your payment the same when your rate drops, instead of letting it fall."],
          ["", "Use an offset mortgage so savings reduce the interest you pay."],
          ["", "Switch to the best available deal at the end of each fixed period, so you’re not paying the SVR."],
        ]} />

        <H3>How can you pay off a mortgage in half the time?</H3>
        <P>
          To cut a 25-year term to roughly 12.5 years, you’d need to pay about 54% more each month. On a £200,000 loan at 5%,
          that means going from about £1,169 to about £1,796 a month. It’s doable if your income has grown, or if you’re willing
          to cut back on other things, but you need to be sure it won’t leave you short. A middle option is to overpay when you
          can instead of committing to a fixed higher amount.
        </P>

        <H3>Is it worth paying a lump sum off your mortgage?</H3>
        <P>
          It can be a smart move, especially early in the term or when your mortgage rate is high. A lump sum reduces the balance
          immediately and saves interest on every future payment. Check your lender’s overpayment allowance first to avoid an
          early repayment charge. Also think about what else the money could do. If you don’t have an emergency fund, a pension
          with employer matching, or high-interest debts to clear, those might deserve priority.
        </P>

        <H3>Is it better to pay off your mortgage or invest?</H3>
        <P>
          It depends on your mortgage rate, your tolerance for risk, and your tax situation. Paying off a 5% mortgage is
          effectively a guaranteed 5% return with no risk, while investments could earn more but might also lose value. Many
          people split the difference. They get any employer pension match first, build an emergency fund, use their ISA
          allowance, and then decide how to divide the rest. If your mortgage rate is low, investing might win on paper, but
          plenty of people value the security of owing less. This isn’t personal financial advice, so if the amounts are big,
          speak to an independent adviser.
        </P>

        <H3>What are the advantages of paying off a mortgage early?</H3>
        <P>
          You save a large amount of interest, you free up your monthly cash flow earlier, and you’re protected from future rate
          rises. Being mortgage-free also takes a lot of pressure off in retirement or during a job gap. The downsides are less
          flexibility, since cash in your house is harder to reach than cash in the bank, and early repayment charges if you pay
          off a fixed deal too soon.
        </P>

        <H3>How long does it take for your salary to pay off a mortgage in the UK?</H3>
        <P>
          There’s no neat answer, but here’s a way to think about it. House prices in England are around seven to eight times
          typical annual earnings, and higher in London. If you put about a third of your take-home pay toward a mortgage at
          current rates, you’re typically looking at 25 to 30 years to clear it, less if you overpay or have a large deposit. Use
          the calculator with your actual figures to see your own timeline.
        </P>

        <H3>What does it feel like to pay off a mortgage?</H3>
        <P>
          People who’ve done it often describe a mix of relief and a sudden jolt of freedom. That big monthly payment disappears,
          and with it a lot of financial anxiety. Some feel a bit lost at first, because a goal they worked toward for decades is
          suddenly done. It also changes the numbers on your budget, since you’ll still have insurance, maintenance and council
          tax to cover, but you won’t have the biggest bill hanging over you. If paying it off is on your wish list, the
          amortization schedule helps you see how close you are.
        </P>
      </Card>

      <Card title="When Things Go Wrong">
        <H3>What happens in the UK if you can’t pay your mortgage?</H3>
        <P>
          Contact your lender as soon as you see trouble coming, ideally before you miss a payment. UK lenders are required by
          FCA rules to treat borrowers in difficulty fairly and to consider options before repossession. They might offer a
          temporary switch to interest-only, extend your term, set up a payment arrangement, or give you a short payment break.
          Under the Mortgage Charter that was introduced in 2023, many lenders also let borrowers extend the term or switch to
          interest-only for six months without it affecting their credit file, and agree not to start repossession proceedings
          within 12 months of a missed payment. Free debt advice from charities like StepChange, Citizens Advice or MoneyHelper
          can help you work out a plan. Repossession is a last resort and goes through the courts.
        </P>

        <H3>Can you stop paying a UK mortgage?</H3>
        <P>
          You can’t simply stop. Missed payments go into arrears, you’ll be charged fees, your credit file will take a hit, and the
          lender can eventually go to court to repossess the home. If the sale doesn’t cover the debt, you can be pursued for the
          shortfall. If you can’t keep up, the better route is to talk to your lender, explore a sale on your own terms, or ask
          about options like a term extension or a voluntary sale to avoid repossession.
        </P>

        <H3>Does the UK government help with your mortgage if you become unemployed?</H3>
        <P>
          There’s some help, but it isn’t automatic and it’s not a handout. Support for Mortgage Interest (SMI) can help with the
          interest on your mortgage if you receive certain income-related benefits like Universal Credit. Since 2018, it’s been
          paid as a loan that you repay with interest when you sell or transfer the home, and you typically have to wait about 39
          weeks before payments start. There are loan limits, so check the latest rules on gov.uk. Other safety nets include
          mortgage payment protection insurance, if you took it out before losing your job, and your lender’s forbearance
          options.
        </P>

        <H3>What should you do if you face redundancy with a new mortgage?</H3>
        <P>
          Start with a budget and see how long your savings and redundancy pay would cover your payments. Talk to your lender
          early, because they have more options before you’re in arrears. Check whether you have any protection like income
          protection or payment protection cover, though policies often have waiting periods and exclusions. Look into benefits
          you’re entitled to, including SMI if you qualify. If you’d have to leave the UK, for example because your visa is tied
          to the job, ask your lender about a consent-to-let arrangement so you can rent the property out, or consider selling.
          Don’t ignore the problem, because the earlier you act, the more options you have.
        </P>

        <H3>What is the mortgage crisis in the UK?</H3>
        <P>
          People use the phrase for a few different episodes. The 2007 to 2009 credit crunch, which included the run on Northern
          Rock, saw lenders pull back sharply, 100% mortgages disappear and deposits balloon. In 2022, after the September
          mini-budget, mortgage rates spiked, with average two- and five-year fixes jumping from around 2% to 3% a year earlier to
          above 6%. Millions of households have since remortgaged onto much higher payments, which the media calls a mortgage time
          bomb. Then there’s the broader affordability crisis, where house prices have risen far faster than wages, which makes
          saving a deposit and passing lender checks hard. In 2026, geopolitical tensions pushed average fixed rates back above
          5%, keeping pressure on borrowers.
        </P>

        <H3>Why have some politicians called for state benefits to help mortgage holders?</H3>
        <P>
          In periods when rates spike, politicians from several parties have been pressed to give mortgage holders more help. The
          argument in favor is that sudden rate rises can push otherwise responsible households into hardship, that homeowners
          already get little support compared with renters on housing benefit, and that preventing repossessions protects
          communities. The arguments against it are that it would be expensive, it would mostly benefit people who already own
          property, it could push prices up, and it rewards borrowers who took on risk while renters get nothing similar. The
          government’s current approach leans on lender forbearance and the Mortgage Charter rather than direct payments.
        </P>
      </Card>

      <Card title="Tax and History: Mortgage Interest Relief">
        <H3>When was the tax deductibility of mortgage interest removed in the UK, and why?</H3>
        <P>
          For homeowners, it was phased out between the mid-1990s and April 2000. The relief was called MIRAS (Mortgage Interest
          Relief at Source) and it let you deduct tax on the interest on the first £30,000 of a mortgage. It was cut in stages
          through the 1990s and abolished in 2000. The reasons given were that it cost the Treasury a lot, it mainly helped
          homeowners, and it was seen as feeding house price inflation since it effectively subsidized borrowing. Landlords went
          through a similar change later. Between 2017 and 2020, buy-to-let mortgage interest relief was replaced by a
          basic-rate 20% tax credit.
        </P>

        <H3>What happened to UK house prices when the tax relief was phased out?</H3>
        <P>
          They didn’t fall. Prices rose strongly in the years after MIRAS was abolished, roughly doubling in the first half of the
          2000s. The main drivers were low interest rates, plentiful credit and a long-term shortage of homes, which easily
          outweighed the loss of a modest tax break. It’s a good reminder that rates, lending rules and supply have a much bigger
          impact on prices than small tax changes.
        </P>
      </Card>

      <Card title="How to Use the Mortgage Calculator UK">
        <P>The calculator is quick, but your result is only as good as your inputs. Here’s what each field means.</P>
        <H3>Property price and deposit</H3>
        <P>
          Use the asking price or what you plan to offer. Enter your deposit as a pound amount or a percentage. If you’re still
          browsing, run it at a few prices to see how sensitive your payment is. A bigger deposit means a smaller loan and,
          usually, access to cheaper rates.
        </P>
        <H3>Interest rate and term</H3>
        <P>
          Use the rate from a deal you’re actually considering. If you’re not sure, try your best estimate, then test a rate one
          or two points higher. Twenty-five years is a common term, and 30 or 35 years lowers your payment but raises total
          interest.
        </P>
        <H3>Extra costs</H3>
        <P>
          Add buildings insurance, ground rent and service charge for leasehold flats, and stamp duty where the tool supports it.
          These costs change the true price of owning far more than most first-time buyers expect. Read the monthly payment
          first, then check the schedule to see how the balance drops over time.
        </P>
      </Card>

      <Card title="Repayment vs Interest-Only: Run Both Through the Calculator">
        <P>
          A repayment mortgage clears both the interest and the capital by the end of the term. An interest-only mortgage covers
          only the interest, leaving the loan itself to repay later. Running the same loan both ways shows you what the lower
          payment is really buying. For instance, on a £200,000 loan at 5% over 25 years, the repayment figure is about £1,169 a
          month, while interest-only is about £833, a gap of roughly £336 that represents the part going toward owning the home.
          Use the interest-only result to see the bare cost of borrowing, and the repayment result to see what it takes to clear
          the debt.
        </P>
      </Card>

      <Card title="Deposit, LTV and Your Monthly Payment">
        <P>
          Your deposit determines your loan-to-value ratio (LTV): the loan as a percentage of the property’s value. A £250,000
          home with a £25,000 deposit is 90% LTV, and with £50,000 it’s 80%. Lenders price rates by LTV band, so crossing a
          threshold such as 90% to 85%, or 85% to 80%, can drop your rate. That’s why it’s worth running the calculator at several
          deposit levels. Sometimes a few extra thousand pounds saved changes the monthly payment more than you’d expect.
        </P>
      </Card>

      <Card title="Understanding Your Amortization Schedule">
        <P>
          The schedule lists every payment over the life of the mortgage, showing how much goes to interest, how much reduces the
          balance and what’s left. In the early years, most of each payment is interest. Over time, the capital share grows, which
          is why your balance seems to fall slowly at first and faster later. The schedule shows total interest over the full
          term, which is often a shock. It also helps you estimate how much equity you’ll have when your fixed deal ends, which
          matters when you remortgage. And it makes the case for overpayments concrete, since reducing the balance early cuts
          interest on every later payment.
        </P>
      </Card>

      <Card title="When You’d Use a Mortgage Calculator: Real Scenarios">
        <List items={[
          ["Before you start house hunting.", "Setting a realistic price range saves wasted viewings."],
          ["Comparing two properties.", "A cheaper flat with a high service charge can cost more per month than a slightly pricier house without one."],
          ["Choosing a term.", "Stretching from 25 to 35 years lowers the payment but raises total interest, and the schedule shows by how much."],
          ["Preparing to remortgage.", "Test new rates against your current balance to see whether switching pays off."],
          ["Planning a buy-to-let.", "Run the interest-only calculation against expected rent."],
          ["Stress-testing a rate rise.", "If your fixed deal is ending or you’re on a tracker, try a rate two points higher."],
          ["Planning overpayments.", "See how much time and interest an extra £100 or £200 a month saves."],
        ]} />
      </Card>

      <Card title="Why You Can Trust This Free Mortgage Calculator">
        <P>
          The calculator uses the standard amortization formula with monthly compounding, the same basic method lenders use for
          their illustrations. If you enter the same rate, term and loan as a lender’s quote, the numbers should be close. The
          tool is free, there are no hidden charges, and you don’t need an account to use it. The figures you enter are used to
          produce your result on the page, and it never asks for personal details like your name, address or National Insurance
          number.
        </P>
        <P>
          It’s an estimate for planning, not a lender’s quote. It doesn’t account for every product fee, lender rule or tax
          detail, and it isn’t financial advice. For a binding offer, speak to a lender or an FCA-authorized mortgage adviser.
        </P>
      </Card>

      <Card title="Tips for Getting More From Your Calculation">
        <P>
          Run the numbers at three rates: today’s offer, one point higher and one point lower. Test at least two deposit sizes to
          find the LTV bands where rates improve. Include insurance and service charges every time so you see real monthly costs.
          And rerun the schedule when something changes, like a pay rise, a new rate or an overpayment.
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
