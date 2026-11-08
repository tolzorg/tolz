import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate a mortgage payment in Canada?",
    a: "Convert the quoted annual rate to a monthly rate using semi-annual compounding, then apply the standard payment formula with the loan amount and the total number of monthly payments. This Canadian mortgage calculator does both steps for you.",
  },
  {
    q: "Why do Canadian mortgages use semi-annual compounding?",
    a: "The Interest Act requires fixed-rate mortgage interest to be stated on a basis no more frequent than twice a year, so lenders compound semi-annually. It gives a slightly lower monthly payment than monthly compounding at the same quoted rate.",
  },
  {
    q: "How much down payment do I need in Canada?",
    a: "At least 5% on the first $500,000, 10% on the portion between $500,000 and $1.5 million, and 20% on homes of $1.5 million or more. Under 20% down, mortgage default insurance is required.",
  },
  {
    q: "How long are mortgages in Canada?",
    a: "Amortization is typically 25 years, with 30 years available on insured mortgages for first-time buyers and new builds, and often on uninsured ones. The term, the period your rate is locked in, usually runs from one to five years, and up to ten at many lenders.",
  },
  {
    q: "What’s the difference between amortization and term?",
    a: "Amortization is the total time to repay the mortgage, such as 25 years. The term is how long your rate and conditions stay in place, such as five years, after which you renew or switch lenders.",
  },
  {
    q: "Is mortgage insurance required in Canada?",
    a: "Yes, when your down payment is under 20%. Premiums run from about 2.80% to 4.00% of the mortgage amount and are normally added to your balance.",
  },
  {
    q: "How long does mortgage pre-approval take in Canada?",
    a: "With your documents ready, usually 24 to 72 hours. Most lenders hold the quoted rate for 90 to 120 days.",
  },
  {
    q: "What is the mortgage stress test?",
    a: "You must qualify at the greater of 5.25% or your contract rate plus 2 percentage points. Run the calculator at that rate to see the payment lenders use to assess you.",
  },
  {
    q: "Can I get a mortgage in Canada as a newcomer?",
    a: "Yes. Many lenders have newcomer programs, though down payment requirements vary with your status and credit history.",
  },
  {
    q: "Can I pay off my mortgage in 10 years?",
    a: "Yes. You can choose a 10-year amortization or use prepayment options on a longer one. A shorter amortization means much higher payments but far less interest.",
  },
  { q: "Can I get a 45-year mortgage in Canada?", a: "No. Thirty years is the practical maximum at mainstream lenders." },
  {
    q: "Does this calculator include property tax and condo fees?",
    a: "Yes. You can add annual property tax, home insurance and monthly condo fees to see your full monthly housing cost, not just the mortgage payment.",
  },
  {
    q: "Can I get a mortgage with bad credit in Canada?",
    a: "Yes, usually through alternative lenders, with higher rates and a bigger down payment.",
  },
  {
    q: "Is a halal mortgage available in Canada?",
    a: "Yes. Providers offer Sharia-compliant financing, usually through co-ownership or cost-plus structures instead of interest.",
  },
  { q: "Is this mortgage calculator free?", a: "Yes, it’s free to use with no hidden charges." },
];

// FAQ schema exactly as supplied (its wording differs slightly from the displayed FAQ).
const FAQ_SCHEMA_ITEMS = [
  { q: "How do you calculate a mortgage payment in Canada?", a: "Convert the quoted annual rate to a monthly rate using semi-annual compounding, then apply the standard payment formula with the loan amount and the total number of monthly payments." },
  { q: "Why do Canadian mortgages use semi-annual compounding?", a: "The Interest Act requires fixed-rate mortgage interest to be stated on a basis no more frequent than twice a year, so lenders compound semi-annually. It gives a slightly lower monthly payment than monthly compounding at the same quoted rate." },
  { q: "How much down payment do I need in Canada?", a: "At least 5% on the first $500,000, 10% on the portion between $500,000 and $1.5 million, and 20% on homes of $1.5 million or more. Under 20% down, mortgage default insurance is required." },
  { q: "How long are mortgages in Canada?", a: "Amortization is typically 25 years, with 30 years available on insured mortgages for first-time buyers and new builds, and often on uninsured ones. The term, the period your rate is locked in, usually runs from one to five years, and up to ten at many lenders." },
  { q: "What is the difference between amortization and term?", a: "Amortization is the total time to repay the mortgage, such as 25 years. The term is how long your rate and conditions stay in place, such as five years, after which you renew or switch lenders." },
  { q: "Is mortgage insurance required in Canada?", a: "Yes, when your down payment is under 20%. Premiums run from about 2.80% to 4.00% of the mortgage amount and are normally added to your balance." },
  { q: "How long does mortgage pre-approval take in Canada?", a: "With your documents ready, usually 24 to 72 hours. Most lenders hold the quoted rate for 90 to 120 days." },
  { q: "What is the mortgage stress test?", a: "You must qualify at the greater of 5.25% or your contract rate plus 2 percentage points." },
  { q: "Can I get a mortgage in Canada as a newcomer?", a: "Yes. Many lenders have newcomer programs, though down payment requirements vary with your status and credit history." },
  { q: "Can I pay off my mortgage in 10 years in Canada?", a: "Yes. You can choose a 10-year amortization or use prepayment options on a longer one. A shorter amortization means higher payments but much less interest." },
  { q: "Can I get a 45-year mortgage in Canada?", a: "No. Thirty years is the practical maximum at mainstream lenders." },
  { q: "Does this calculator include property tax and condo fees?", a: "Yes. You can add annual property tax, home insurance and monthly condo fees to see your full monthly housing cost." },
  { q: "Can I get a mortgage with bad credit in Canada?", a: "Yes, usually through alternative lenders, with higher rates and a bigger down payment." },
  { q: "Is a halal mortgage available in Canada?", a: "Yes. Providers offer Sharia-compliant financing, usually through co-ownership or cost-plus structures instead of interest." },
  { q: "Is this mortgage calculator free?", a: "Yes, it is free to use with no hidden charges." },
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
/** An outside source, opened in a new tab so this page stays open. */
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const RBC = "https://www.rbcroyalbank.com/";
const TD = "https://www.td.com/us/en/personal-banking";
const BMO = "https://www.bmo.com/en-us/main/personal/";
const RATEHUB = "https://www.ratehub.ca/blog/bank-of-canada-october-2026-rate-hike/";
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

export default function CanadianMortgageCalculatorFaqSection() {
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

      <Card title="How This Canadian Mortgage Calculator Works">
        <P>
          You enter the home price, your down payment, the interest rate and the amortization period. If they apply to you, add
          annual property tax, annual home insurance and monthly condo fees. The calculator gives you your monthly mortgage
          payment, your total monthly housing cost, the total interest over the life of the loan, and the full cost of the home
          once everything’s added up.
        </P>
        <P>
          The big difference from most tools is the compounding. A US-style calculator compounds monthly. Canadian fixed-rate
          mortgages compound semi-annually, so a US calculator will be off by a bit. The gap is small each month, but it adds up,
          and I’ll show you the numbers further down.
        </P>
      </Card>

      <Card title="Canadian Mortgage Basics">
        <H3>What Is a Canadian Mortgage?</H3>
        <P>
          A mortgage is a loan you take out to buy property, with the property itself as collateral. If you stop paying, the
          lender can eventually take the home and sell it to get its money back. In Canada, the loan is built from a few moving
          parts: the amount you borrow, the interest rate, the amortization (how long it’d take to pay the whole thing off) and
          the term (how long your current rate and contract last before you have to renew).
        </P>
        <P>
          Most people never pay a mortgage off on the original contract. You sign for, say, a five-year term, and when it ends you
          renew into a new term at whatever rates are available then. That renewal moment is the single biggest difference
          between how Canadian and American mortgages feel to live with.
        </P>

        <H3>How Long Are Mortgages in Canada?</H3>
        <P>There are two clocks running, and people mix them up all the time.</P>
        <P>
          <strong>Amortization</strong> is the total payoff timeline. The traditional number is 25 years. Since December 2024, 30
          years is allowed on insured mortgages for first-time buyers and for anyone buying a newly built home, and uninsured
          mortgages commonly go to 30 as well. Those changes took effect on December 15, 2024. You can always choose a shorter
          amortization than the maximum. Going longer than your lender or the rules allow isn’t an option.
        </P>
        <P>
          <strong>The term</strong> is how long the contract runs. Terms can range from a few months to ten years, with five
          years being the most common by far. At the end of each term you renew, switch lenders, or pay it off, and that’s your
          chance to renegotiate the rate and other conditions. The rate you agreed to stays put for the term.
        </P>
        <P>So a “25-year mortgage” in Canada usually means a 25-year amortization made up of five or so back-to-back five-year terms.</P>

        <H3>Why Are Canadian Mortgages Limited to Five Years?</H3>
        <P>
          They aren’t, really. Terms go up to ten years at many lenders, and you’ll even see a handful of longer ones. Five years
          is just where most borrowers land, because it balances rate certainty against flexibility.
        </P>
        <P>
          There’s a legal reason it feels like a hard line, though. Under the federal Interest Act, once a mortgage has run for
          five years, the borrower has the right to prepay it, with the penalty capped at three months of interest. That
          discourages lenders from writing long, locked-in contracts, and it’s part of why five years became the norm.
        </P>

        <H3>Open vs. Closed Mortgages</H3>
        <P>
          An open mortgage lets you pay off all or part of the balance at any time with no penalty. A closed mortgage restricts
          how much extra you can pay, and breaking it early costs you.
        </P>
        <P>
          Closed mortgages come with lower rates, and open ones cost noticeably more, so open only makes sense if you know you’re
          about to sell, or you’re expecting a big lump sum soon. Nearly everyone chooses closed. Most closed mortgages still let
          you prepay a chunk each year without penalty, often 10% to 20% of the original loan, and many let you raise your
          regular payment by a similar amount.
        </P>

        <H3>Monthly, Bi-Weekly and Accelerated Payments</H3>
        <P>
          Payments are traditionally monthly, but most lenders offer other schedules. Standard bi-weekly takes your annual total
          and splits it across 26 payments, which doesn’t change much. Accelerated bi-weekly is the one worth knowing about. You
          pay half of your monthly payment every two weeks, so you make 26 half-payments a year. That works out to one extra full
          monthly payment annually, and it shortens your amortization quite a bit.
        </P>
        <P>
          On a $480,000 mortgage at 5% with a monthly payment around $2,792, accelerated bi-weekly means roughly $1,396 every two
          weeks. That’s about $2,800 extra a year going straight to principal. Some lenders also allow skipped or flexible
          payments in specific situations, but skipped payments still accrue interest, so they cost you later.
        </P>

        <H3>What’s a Readvanceable Mortgage, and Can You Borrow Against It?</H3>
        <P>
          Some lenders offer a readvanceable mortgage, which is a mortgage paired with a home equity line of credit. As you pay
          down your principal, the available credit limit grows, and you can borrow against that room when you need cash. When you
          use it, that amount is added back to your debt. It’s handy for renovations or an emergency fund, but the interest rate on
          the credit line is usually higher than the mortgage rate, and it’s easy to slide back into debt you thought you’d
          cleared. Use it deliberately.
        </P>

        <H3>What Does It Mean That Canadian Mortgages Are Portable?</H3>
        <P>
          Most Canadian closed mortgages are portable. If you sell and buy another home before your term ends, you can usually
          take the existing mortgage, with its rate and remaining term, to the new property. If the new home costs more, the lender
          can add a new loan for the difference, and you’ll end up with a blended rate. Lenders usually give you a window to
          complete the purchase, often somewhere between 30 and 120 days depending on the lender. Porting lets you avoid a
          prepayment penalty, so it’s worth asking about before you list your house.
        </P>

        <H3>How Do Home Mortgages Work in Canada, and Why Aren’t 30-Year Fixed Rates Common Like in the U.S.?</H3>
        <P>
          In the U.S., you can lock a fixed rate for 30 years, and you can prepay at any time without penalty. That’s possible
          largely because of government-backed mortgage agencies that absorb much of the long-term risk. Canada doesn’t have the
          same structure. Canadian lenders fund fixed mortgages with bonds and deposits over shorter periods, and the contract
          resets every few years instead.
        </P>
        <P>
          What you get instead is a long amortization (25 to 30 years) with a short rate commitment (usually five years or less).
          You carry the renewal risk, meaning that when your term ends, rates might be higher or lower. The upside is that you
          aren’t locked into a rate for decades if rates fall.
        </P>

        <H3>How Is a Canadian Mortgage Different from an American One?</H3>
        <P>A few differences matter in practice:</P>
        <List items={[
          ["Compounding.", "Canadian fixed-rate mortgages compound semi-annually, while US loans compound monthly."],
          ["Term and renewal.", "Canadian mortgages renew every few years. US mortgages typically run at one rate for the full life of the loan."],
          ["Prepayment penalties.", "Breaking a closed Canadian mortgage early can be expensive. Breaking a US mortgage usually isn’t."],
          ["Tax treatment.", "Interest on your primary home isn’t tax-deductible in Canada. In the US it often is, for those who itemize."],
          ["Insurance.", "Canadian default insurance is mandatory with under 20% down and protects the lender, and you pay the premium."],
          ["Recourse.", "Whether a lender can chase you for a shortfall after a foreclosure depends on the province in Canada and the state in the US, so the rules aren’t uniform on either side."],
        ]} />

        <H3>Is the Canadian Mortgage System Messed Up Like the American One?</H3>
        <P>
          Not in the same way. Canada didn’t have the kind of widespread subprime lending that triggered the 2008 US crisis.
          Borrowers have to pass the stress test, and anyone with less than 20% down needs insurance, which adds underwriting
          scrutiny.
        </P>
        <P>
          That said, it isn’t problem-free. Household debt levels in Canada are high compared to income, home prices in some
          cities are stretched, and the short term means borrowers feel rate changes faster. The system has more guardrails, but
          it isn’t risk-free.
        </P>

        <H3>Is a Mortgage a Scam?</H3>
        <P>
          No. A mortgage from a bank, credit union or licensed lender is a legitimate loan, and it’s how most people buy a home.
          The scams that do exist tend to sit around the edges, so watch for a few red flags:
        </P>
        <List items={[
          ["", "Anyone asking for an upfront fee before they’ve done any work."],
          ["", "A “lender” who guarantees approval no matter your credit."],
          ["", "Pressure to sign quickly, or to leave out details of your income or debts."],
          ["", "Private lenders with unclear fees and short terms that you don’t fully understand."],
        ]} />
        <P>
          If you work with a licensed mortgage broker, a bank or a credit union, and you read your documents with a real estate
          lawyer, you’re on solid ground. Misrepresenting income on an application, even if someone else suggests it, is
          mortgage fraud and can fall back on you.
        </P>
      </Card>

      <Card title="Getting a Mortgage in Canada: Requirements, Pre-Approval and Process">
        <H3>What Are the Requirements to Apply for a Mortgage in Canada?</H3>
        <P>Lenders look at four things: income, credit, down payment and the property itself. In practice, you’ll typically need:</P>
        <List items={[
          ["", "Government ID and your Social Insurance Number."],
          ["", "Proof of income, such as recent pay stubs, a letter of employment, T4s and Notices of Assessment (NOAs). If you’re self-employed, expect to hand over two years of tax returns and financial statements."],
          ["", "A credit history. A score of at least 600 is generally the floor for insured mortgages, and 680 or higher opens up better rates."],
          ["", "Proof of your down payment, often with 90 days of bank statements to show where the money came from."],
          ["", "Details on your debts: credit cards, car loans, student loans and any other monthly obligations."],
          ["", "The purchase agreement and, later, an appraisal of the property."],
        ]} />

        <H3>What’s the Process for Getting a Mortgage in Canada?</H3>
        <P>Here’s how it usually goes:</P>
        <List ordered items={[
          ["Check your numbers.", "Know your income, debts, credit score and savings, and run a rough budget with the calculator above."],
          ["Get pre-approved.", "The lender reviews your finances and tells you how much you can borrow, and holds a rate for a set time."],
          ["", "Shop for a home within that budget, keeping closing costs in mind."],
          ["", "Make an offer and sign the purchase agreement, often with conditions such as financing and a home inspection."],
          ["", "Submit your final application, with the property details. The lender orders an appraisal and confirms everything."],
          ["", "Get your mortgage commitment and remove your conditions."],
          ["", "Meet with a real estate lawyer or notary, who handles the paperwork, title and funds transfer."],
          ["Close.", "You get the keys on the closing date, and your first payment follows."],
        ]} />

        <H3>How Long Does It Take to Get Pre-Approved for a Mortgage in Canada?</H3>
        <P>
          If you have your documents ready, a pre-approval can come back in as little as 24 to 72 hours. Self-employed borrowers or
          anyone with a complicated file can take longer.
        </P>
        <P>
          Most lenders hold your quoted rate for somewhere between 90 and 120 days, which protects you if rates rise while you
          shop. A pre-approval isn’t a guarantee, though. The final approval still depends on the property appraisal and on your
          finances staying the same. Avoid new debt or big purchases between pre-approval and closing, because they can change
          the outcome.
        </P>

        <H3>How Do Canadian Banks Decide How Much They’ll Lend, and How Much Can I Afford?</H3>
        <P>
          Lenders use two ratios. Gross Debt Service (GDS) compares your housing costs (mortgage payment, property tax, heat and
          half of any condo fees) to your gross income. Total Debt Service (TDS) adds all your other debt payments to that. The
          common ceiling for GDS is 39%, and TDS is typically capped at around 44%.
        </P>
        <P>
          Here’s a quick example. Say your household earns $120,000, or $10,000 a month. Thirty-nine percent is $3,900. Take off
          $350 for property tax and $100 for heat, and you have about $3,450 a month available for the mortgage payment. The lender
          doesn’t test that payment at your real rate, though. They use the stress-test rate, say 6.5% if you’re being offered
          4.5%. At 6.5% over 25 years, $3,450 a month supports a loan of roughly $515,000. With 20% down, that’s a purchase price
          near $644,000.
        </P>
        <P>
          The calculator above helps you go the other direction. Put in the home price, the stress-test rate and your tax and condo
          costs, and see whether the payment fits under your limit.
        </P>

        <H3>How Do Lenders Treat Bonuses, Commissions and Overtime?</H3>
        <P>
          Variable income is usually counted, but conservatively. Most lenders want a two-year history and average the amounts, so
          a bonus you’ve just started getting will carry little weight. Some count 100% of a steady two-year average, others only
          50% to 75%. Base salary is the easiest to qualify with. If much of your pay is commission, a broker can help find lenders
          who treat it more generously.
        </P>

        <H3>Do Canadian Banks Consider Foreign Income?</H3>
        <P>
          Sometimes. Some lenders will count income earned outside Canada, but they ask for more paperwork, such as employment
          letters, tax documents and bank statements, often with a longer history. They may only count a portion of it, convert it
          at a conservative exchange rate, and ask for a bigger down payment, often 20% or more. Many mainstream lenders won’t use
          it at all. If you earn abroad, a mortgage broker who works with newcomers is usually the quickest way to find who will.
        </P>

        <H3>How Many Names Can Be on a Mortgage in Canada?</H3>
        <P>
          There’s no single legal limit, but most lenders cap the number of borrowers, commonly at four. Everyone on the mortgage
          is fully responsible for the entire debt, and everyone’s income and credit get assessed.
        </P>
        <P>
          Being on the mortgage and being on title are separate things. You can be on the title (the ownership record) without
          being on the mortgage, and vice versa. Co-borrowers also have to decide how to hold title, as joint tenants or tenants in
          common, which affects what happens if one owner dies. A real estate lawyer can explain which fits your situation.
        </P>

        <H3>Is It Still Possible to Assume a Mortgage in Canada?</H3>
        <P>
          Yes, but it’s uncommon and requires the lender’s approval. In an assumption, the buyer takes over the seller’s existing
          mortgage, including its rate and remaining term. The buyer typically has to qualify with the lender, and there may be a
          fee. The seller should ask to be formally released from liability.
        </P>
        <P>
          It’s only worth chasing if the seller’s rate is clearly lower than what you’d get today. With the best 5-year fixed rates
          sitting around 4.3% in late October 2026, that means a seller who locked in at something meaningfully below that. If
          their rate is close to current rates, it’s usually not worth the effort.
        </P>

        <H3>Can You Get a Mortgage Without a Job in Canada?</H3>
        <P>
          Possibly, if you have other income that lenders accept: retirement income, rental income, investment income, or income
          from a spouse or co-borrower. You’d need documents to prove each source. Without verifiable income, you’re mostly
          looking at alternative or private lenders, higher rates, and a large down payment. A mortgage broker can sort out what’s
          realistic.
        </P>

        <H3>How Do You Get an Out-of-Province Mortgage in Canada?</H3>
        <P>
          You can get a mortgage in one province for property in another. Many lenders operate nationwide, but not all lend in
          every province, and some local credit unions only lend within their region. You’ll want a lawyer licensed in the
          province where the property is, or a notary in Quebec, since land title and mortgage registration rules differ by
          province. A broker makes this easier because they can compare lenders across provinces.
        </P>

        <H3>Can I Get a Mortgage with Bad Credit in Canada?</H3>
        <P>
          Yes, but you’ll pay more for it. Mainstream lenders and mortgage insurers generally want a score of at least 600. Below
          that, you’d go through alternative (“B”) lenders or private lenders, which means higher rates, often a lender fee of 1%
          or more, and a bigger down payment, commonly 20% to 35%. A short term of one or two years is common, with the plan of
          rebuilding your credit and moving to a regular lender at renewal.
        </P>

        <H3>Is It Possible to Get a Mortgage While in a Consumer Proposal?</H3>
        <P>
          It’s harder but not impossible. Some lenders will consider you after the consumer proposal has been completed and a
          period has passed, while a few alternative lenders will look at applicants who are still in one, usually with a large
          down payment and a higher rate. Details vary a lot, so speak with a broker who handles credit-challenged files.
        </P>

        <H3>Will Canadian Lenders Consider US Credit Scores?</H3>
        <P>
          Not directly. Canadian credit bureaus keep their own records, and a US score doesn’t transfer. Some lenders and newcomer
          programs can use international credit reports through certain services, or they’ll look at alternative evidence such as
          rent history and utility bills. If you’re moving from the US, ask lenders about their newcomer programs before you apply.
        </P>

        <H3>Can a Newcomer Get a Mortgage After Six Months in Canada?</H3>
        <P>
          Yes, and many lenders have programs designed for it. You’d typically need permanent residency or a valid work permit,
          proof of employment and some savings. Some insured programs allow as little as 5% down using alternative credit data,
          while bank newcomer programs often ask for 10% to 20%. Work-permit holders who don’t yet have PR may face stricter
          requirements, so check each lender’s rules.
        </P>

        <H3>As a New <Ext href="https://en.immigrant.today/canada/23677-stress-test.htm">Immigrant</Ext>, How Much Down Payment Do I Need?</H3>
        <P>
          It depends on your status and the lender. A newcomer with permanent residency and a solid job can sometimes qualify with
          5% down through insured programs. Many bank programs ask for 10% to 20% if you have no Canadian credit history. If you’re
          on a work permit, lenders may want 20% or more. The calculator above lets you test different down payment amounts and
          see how they change your payment.
        </P>

        <H3>How Can I Get a Halal Mortgage in Canada?</H3>
        <P>
          Conventional mortgages charge interest, which many Muslims avoid. Canada does have Islamic financing providers, such as
          Eqraz and Manzil, that offer Sharia-compliant alternatives. These usually work through structures like diminishing
          co-ownership, where you and the provider buy the home together and you gradually buy out their share while paying rent,
          or through cost-plus (murabaha) arrangements.
        </P>
        <P>
          You pay a profit or rent rather than interest. The total can still be comparable to a conventional mortgage, and a
          lender’s Sharia certification and fees are worth checking carefully. This calculator is built around standard
          interest-based mortgages, so you can use it as a rough benchmark to compare against a halal quote, but the structure and
          numbers will differ.
        </P>

        <H3>What Are the Downsides of Using a Mortgage Broker?</H3>
        <P>
          Brokers are useful, and for most people they’re a good idea, but there are limits. A broker can only offer lenders they
          work with, and some banks sell certain products only directly. Broker compensation is typically paid by the lender, and
          some lenders pay more than others, so it’s fair to ask a broker why they’re recommending one lender over another.
        </P>
        <P>
          Also check the prepayment terms and penalty rules on whatever they recommend, not just the rate. Broker-channel lenders
          sometimes have stricter penalty formulas than the big banks. A good broker will walk you through that without being
          asked.
        </P>

        <H3>Which Bank in Canada Is Best for a Mortgage, and Who Has the Lowest Rate?</H3>
        <P>
          There’s no permanent winner. The best rate changes weekly, and the lowest rates are often not at the big banks. Brokers
          usually get access to lower rates from monoline lenders and credit unions. The big banks (<Ext href={RBC}>RBC</Ext>, <Ext href={TD}>TD</Ext>,{" "}
          <Ext href={BMO}>BMO</Ext>, <Ext href="https://www.scotiabank.com/">Scotiabank</Ext>, <Ext href="https://us.cibc.com/">CIBC</Ext>{" "}
          and <Ext href="https://www.nbc.ca/">National Bank</Ext>) tend to post higher “sticker” rates, but they’ll often negotiate, especially if you bring other
          business.
        </P>
        <P>
          Rather than choosing by name, compare three things: the rate, the prepayment penalty and how flexible the lender is if
          your life changes. If you want a sense of where posted and discounted rates stand, check the banks’ own websites and a
          rate comparison site, and ask for the actual rate, not the posted one.
        </P>
      </Card>

      <Card title="Down Payments and Mortgage Insurance">
        <H3>Is Mortgage Insurance Necessary in Canada?</H3>
        <P>
          It’s required by law if your down payment is under 20% of the purchase price. The insurance protects the lender, not
          you, but you pay the premium. It comes from CMHC, Sagen or Canada Guaranty.
        </P>
        <P>
          The premium is a percentage of the mortgage and depends on your down payment: about 4.00% for 5% to 9.99% down, 3.10% for
          10% to 14.99% and 2.80% for 15% to 19.99%. It’s normally added to your mortgage balance. Choosing a 30-year amortization
          on an insured mortgage adds about 0.20% to the premium. In Ontario, Quebec and Saskatchewan, provincial sales tax applies
          to the premium, and you pay that tax in cash at closing rather than adding it to the loan.
        </P>
        <P>With 20% or more down, you don’t need it.</P>

        <H3>What’s the Typical Down Payment to Qualify for a Mortgage in Canada?</H3>
        <P>
          The minimum is 5% on the first $500,000 of the price, 10% on the portion between $500,000 and $1.5 million, and 20% on
          homes at $1.5 million or more. So a $900,000 home needs $65,000 at minimum: $25,000 on the first $500,000 plus $40,000 on
          the remaining $400,000.
        </P>
        <P>
          Lots of buyers put down more than the minimum, partly to avoid insurance and partly because a bigger down payment means a
          smaller loan and lower interest costs.
        </P>

        <H3>Is It Hard to Get a Residential Mortgage with 5% Down?</H3>
        <P>
          It isn’t unusual, but it requires a clean profile. You need a decent credit score, stable income, manageable debts and
          enough cash for closing costs on top of the down payment. The stress test applies, and the insurance premium makes the
          loan bigger. For first-time buyers, 5% down is a common route, and plenty of people get approved this way.
        </P>

        <H3>How Can I Arrange a Mortgage Without a 20% Down Payment?</H3>
        <P>You’ve got several options, and you can combine some of them:</P>
        <List items={[
          ["Insured mortgage with 5% to 19.99% down.", "This is the standard route, with the premium added to your balance."],
          ["First Home Savings Account (FHSA).", "You can contribute $8,000 a year, up to $40,000 over your lifetime. Contributions are tax-deductible and qualifying withdrawals for a first home are tax-free."],
          ["RRSP Home Buyers’ Plan.", "First-time buyers can withdraw up to $60,000 from an RRSP and repay it over time."],
          ["Gifted down payment.", "Immediate family can usually give you money, with a signed gift letter confirming it’s not a loan."],
          ["Combining sources,", "such as savings, an FHSA and a gift."],
        ]} />
        <P>
          Borrowing your down payment, for example with a personal loan, is generally frowned on and many lenders won’t accept it,
          so check before you try it.
        </P>

        <H3>How Much Down Payment Does a Canadian Need for a US House Mortgage?</H3>
        <P>
          There’s no single number. If you’re a non-resident buying a US home, many lenders ask for 20% to 35% down, and some want
          even more for a vacation or investment property. If you live and work in the US and have established US credit, the
          requirements can be much lower, sometimes as little as 3% to 5%. Expect to provide documentation of your income, assets
          and credit history, and expect a higher rate than a US resident would get.
        </P>

        <H3>Can Canadian Citizens Get a Mortgage in Canada to Buy a Home in the USA?</H3>
        <P>
          Not typically in the way people imagine. Most Canadian lenders won’t write a mortgage on a US property. What many
          Canadians do instead is use a cross-border program through the US arms of the big Canadian banks, such as <Ext href={TD}>TD</Ext> Bank US, <Ext href={BMO}>BMO</Ext>{" "}
          and <Ext href={RBC}>RBC</Ext>, or work with a US lender who accepts international borrowers.
        </P>
        <P>
          Another route is borrowing against equity in your Canadian home, through a HELOC or refinance, and using that cash for the
          US purchase. Before you buy, talk to a cross-border tax professional, because US property comes with its own tax
          obligations in both countries.
        </P>
      </Card>

      <Card title="The Math Behind This Calculator: Semi-Annual Compounding">
        <H3>How Do I Calculate a House Mortgage in Canada?</H3>
        <P>
          Two steps. First, convert the quoted annual rate to an equivalent monthly rate using semi-annual compounding. Then use the
          standard payment formula with the loan amount and total number of payments.
        </P>
        <P>
          Under the federal Interest Act, fixed-rate mortgages must state interest on a basis no more frequent than twice a year,
          so lenders compound fixed rates semi-annually. To get a monthly rate, divide the annual rate by two, add one, raise it to
          the power of one-sixth, then subtract one. At a 5.00% quoted rate, that’s about 0.4124% per month. Dividing 5% by twelve
          would give 0.4167%, which is what a US-style calculator uses.
        </P>
        <P>
          Let’s make it concrete. Take a $480,000 mortgage at 5.00% over 25 years. With semi-annual compounding, the payment is
          about $2,792 a month. A monthly-compounding calculator shows roughly $2,806. That’s about $14 a month, or around $4,400
          over 25 years. Not huge, but it’s enough to matter if you’re comparing offers or working with a tight budget.
        </P>
        <P>
          Variable-rate mortgages are often compounded monthly, so if yours floats with prime, check your lender’s terms for how
          they compound.
        </P>

        <H3>What Are the Rules After Insurance Is Added?</H3>
        <P>
          If your down payment is under 20%, add the insurance premium to your mortgage amount before you run the numbers. On a
          $500,000 home with 5% down, the mortgage is $475,000, the premium at 4.00% is $19,000, and your total loan becomes
          $494,000. Your payment is based on that bigger number.
        </P>
      </Card>

      <Card title="Mortgage Rates in Canada: What They’re Based On and Where They’re Heading">
        <H3>What Are Canadian Mortgage Rates Based On?</H3>
        <P>
          Fixed and variable rates run off different benchmarks. Fixed rates track Government of Canada bond yields. Lenders look
          at those yields, with 5-year yields as the benchmark for 5-year fixed rates, then add a spread to cover their costs and
          profit. Variable rates are based on the lender’s prime rate, which moves with the Bank of Canada’s overnight rate, with a
          discount or premium on top.
        </P>
        <P>
          Your personal rate also depends on whether the mortgage is insured, your credit score, the size of the down payment, the
          term, the type of property and whether you’ll live in it or rent it out.
        </P>

        <H3>What Is the Current Canadian Mortgage Rate, and How’s It Calculated?</H3>
        <P>
          Here’s where things stood on October 31, 2026. On October 28, the Bank of Canada raised its overnight rate from 2.25% to
          2.50%, its first hike since July 2023. Banks follow by raising prime, which had been 4.45% for the past year, by the same
          0.25 points. That pushes the lowest available variable rates from 3.45% to roughly 3.70%, according to <Ext href={RATEHUB}>Ratehub</Ext>.
        </P>
        <P>
          Fixed rates move separately. The lowest 5-year fixed rate on the market sat at about 4.34%, and the big banks had been
          raising select fixed rates through October. These numbers change often, so treat them as a snapshot and check with a
          lender or broker before you commit.
        </P>
        <P>
          To see what a rate does to your payment, put it into the calculator. A variable-rate holder with a roughly $600,000
          mortgage pays about $82 more per month when the rate goes from 3.45% to 3.70%.
        </P>

        <H3>Does the Canadian Mortgage Rate Always Follow the US Rate?</H3>
        <P>
          No, but they’re related. Canadian and US bond yields tend to move in the same general direction because global investors
          move money between the two markets. The Bank of Canada sets its own policy rate based on Canada’s inflation and economy,
          though, and Canadian lenders price using Canadian conditions. You’ll often see the two drift apart, especially when the
          economies are on different tracks.
        </P>

        <H3>Where Can I See Posted Rates and the Current Yield on Mortgage Bonds?</H3>
        <P>
          Posted rates are on each bank’s website under mortgages. Rate comparison sites like <Ext href={RATEHUB}>Ratehub</Ext> list what lenders and brokers
          are actually offering, which is usually lower than the posted number. Both are worth a look, because the posted rate is
          rarely what a good negotiator pays.
        </P>
        <P>
          For bond yields, the Bank of Canada publishes Government of Canada benchmark yields, including the 5-year, which lenders
          use for pricing fixed rates. Canada Mortgage Bonds are issued by the Canada Housing Trust through CMHC. Their yields are
          priced as a small spread over comparable Government of Canada bonds, and CMHC publishes details on the program.
        </P>

        <H3>How Is the Mortgage Rate Calculated After the Initial Five Years?</H3>
        <P>
          It isn’t automatic. At the end of your term, your lender sends a renewal offer with a new rate based on market conditions
          at that moment. That offer is often higher than what you could get elsewhere, so don’t just sign it. You can negotiate
          with your current lender, switch to another, or see what a broker can find.
        </P>
        <P>
          Since November 2024, uninsured borrowers can switch lenders at renewal without taking the stress test again if the loan
          amount and amortization stay the same, which has made shopping around easier. Variable-rate holders don’t renew their
          rate in the same way, since their rate moves with prime throughout the term.
        </P>

        <H3>What’s the Maximum Interest Rate for a Mortgage in Canada?</H3>
        <P>
          There’s no mortgage-specific cap that you’d run into in everyday borrowing. Federal law does set an outer limit on
          lending in general, the criminal interest rate, which is 35% APR for most consumer loans since 2025, with some
          exceptions. In practice, mainstream mortgages sit nowhere near that. Private and second-position lenders charge a lot
          more than banks do, often high single digits or more, but still far below the legal ceiling. If a lender quotes you
          something that seems out of line, talk to a lawyer.
        </P>

        <H3>Fixed or Variable Right Now?</H3>
        <P>
          It depends on your situation, and no one can promise which will end up cheaper. The Bank of Canada expects inflation to
          reach 3.5% by year-end, and variable rates could rise multiple times by the second quarter of 2027. A variable rate gives
          you lower payments now and flexibility, with less painful penalties if you break early. A fixed rate gives you a payment
          that won’t change, which matters if your budget is tight.
        </P>
        <P>
          A good test is to run both scenarios in the calculator, then run the variable one at a rate 1% to 2% higher. If you’d
          struggle with that payment, the fixed option is probably the safer choice.
        </P>
      </Card>

      <Card title="Property Tax, Home Insurance and Condo Fees: Your True Monthly Cost">
        <P>A mortgage payment is only part of what owning a home costs. This calculator lets you add the rest.</P>

        <H3>Property Tax</H3>
        <P>
          Property tax depends on your municipality and the assessed value of your home, and it ranges from under 0.5% of value in
          some regions to over 1% in others. It’s usually billed by your city or paid through your mortgage in monthly
          installments. Look up the actual number for the property you’re considering rather than guessing.
        </P>

        <H3>Home Insurance</H3>
        <P>
          Lenders require home insurance. The cost depends on the home’s age, location, construction and what you’re covering, as
          well as your claims history. Condo owners need a separate policy covering their unit’s contents and improvements, while
          the condo corporation insures the building itself.
        </P>

        <H3>Condo Fees (Canada’s Version of HOA Fees)</H3>
        <P>
          If you’ve seen competitors talk about Homeowners’ Association fees, that’s the American term. In Canada they’re called
          condo fees or common element fees. They’re collected monthly from owners to cover things like building insurance,
          maintenance of common areas, landscaping, water, sewer and garbage, plus contributions to a reserve fund for future big
          repairs. Depending on the building, they can also include heat and other utilities.
        </P>
        <P>
          Condo fees can add several hundred dollars a month, so they matter as much as the mortgage payment. Always ask for the
          building’s reserve fund study and recent meeting minutes to check for special assessments, which are one-time charges
          owners may have to pay for major repairs.
        </P>
        <P>
          Lenders count half of your condo fees in their debt ratios, as well as property tax and heating costs, so these affect how
          much you can borrow too.
        </P>

        <H3>What’s the Average Monthly Mortgage Payment for a Canadian Family?</H3>
        <P>
          There isn’t one number worth quoting, because it depends heavily on where you live. Instead, here’s a worked example. Say
          you buy a $600,000 home with 10% down. The mortgage is $540,000, plus a 3.10% insurance premium of $16,740, so you borrow
          $556,740. At 4.5% over 25 years, with semi-annual compounding, your payment comes to about $3,080 a month.
        </P>
        <P>
          Now add $400 for property tax, $120 for insurance and $350 in condo fees, and your real monthly cost is close to $3,950.
          Plug in your own numbers to see where you’d land.
        </P>

        <H3>Reading the Amortization Schedule</H3>
        <P>
          The amortization schedule shows every payment split into interest and principal, with the remaining balance after each
          one. It reveals how a mortgage actually behaves. At the start, most of each payment goes to interest. On the $480,000
          example at 5%, the first payment has about $1,980 of interest and only about $812 of principal.
        </P>
        <P>
          Over time the interest portion shrinks and the principal portion grows, even though the payment stays the same. By the
          midpoint of a 25-year amortization, you’ve usually paid off well under half the original balance, which surprises many
          first-time buyers.
        </P>
        <P>
          You can use the schedule to see what you’d still owe at the end of your term, which tells you what you’ll be renewing. It
          also shows how much equity you’re building, and how a lump-sum prepayment or higher payment would reduce the balance.
        </P>
      </Card>

      <Card title="Paying Your Mortgage Off Faster (or Slower)">
        <H3>Is It Possible to Pay Off a Mortgage in Canada in 10 Years?</H3>
        <P>
          Yes. Banks allow it. You can choose a 10-year amortization from the start, or keep a longer one and use prepayment
          options to accelerate.
        </P>
        <P>
          The payments are steep, though. On a $480,000 mortgage at 5%, a 10-year amortization means about $5,080 a month, compared
          with about $2,790 for 25 years. The trade-off is that your total interest falls from around $357,000 to about $130,000. A
          middle path is to keep a 25-year amortization, then make lump-sum prepayments and increase your payment whenever your
          lender’s rules allow.
        </P>

        <H3>How Much More Does a 30-Year Amortization Cost?</H3>
        <P>
          Using the same $480,000 at 5%: a 25-year amortization costs about $2,792 a month, and 30 years costs about $2,562. That
          saves you around $230 a month, but total interest goes from roughly $358,000 to about $442,000. That’s roughly $85,000
          more over the life of the loan.
        </P>
        <P>
          A longer amortization can help you qualify and ease your monthly budget. If you go that way, consider making extra
          payments when you can.
        </P>

        <H3>Can I Get a 45-Year Mortgage in Canada?</H3>
        <P>
          No, not as a regular home mortgage. The maximum amortization at mainstream lenders is 30 years, and a few niche lenders
          may go a bit longer. Nothing close to 45 years is available. You can lower your payments by taking the longest allowed
          amortization and then paying extra when your budget allows.
        </P>

        <H3>Other Ways to Cut Your Total Cost</H3>
        <P>
          A bigger down payment cuts both the loan and any insurance premium. Accelerated bi-weekly payments act like one extra
          monthly payment each year. Annual lump-sum prepayments, within your lender’s limits, go straight to principal. And when
          your term ends, shop around instead of accepting the first renewal offer, because that alone can save thousands.
        </P>
      </Card>

      <Card title="When Life Gets Complicated">
        <H3>What Is Getting a Second Mortgage Like in Canada?</H3>
        <P>
          A second mortgage is a loan secured against your home behind your first mortgage. It’s useful if you need a large amount
          of cash and don’t want to break your first mortgage and pay a penalty. The catch is cost. Second mortgages generally
          carry higher rates than first mortgages, along with lender and legal fees, and a home appraisal is usually required.
          Banks usually cap your combined borrowing at around 80% of the home’s value, and private lenders sometimes go a bit
          higher. A home equity line of credit is a cheaper option for many people, so compare both.
        </P>

        <H3>What Happens If You Can’t Afford Your Mortgage Payments?</H3>
        <P>
          Call your lender early, before you miss a payment. Lenders have more options for people who reach out first. Depending
          on your situation, they may offer a temporary deferral, an extended amortization, a change in payment schedule, or
          refinancing. Federal guidelines announced in late 2024 also encourage lenders to offer tailored help to struggling
          borrowers.
        </P>
        <P>
          If it keeps going, you can sell the home yourself, which usually leaves you better off than a forced sale. A nonprofit
          credit counsellor can help you build a plan. If payments are missed long enough, the lender can start legal action, such
          as power of sale or foreclosure, depending on your province. In some cases you can still owe money if the home sells for
          less than the debt.
        </P>

        <H3>Can You Delay Paying Off Your Mortgage When You Move?</H3>
        <P>
          Often, yes. If your mortgage is portable, you can move it to your new home and avoid paying it off. If you want to move to
          a more expensive place, the lender can add a new tranche at current rates, producing a blended rate.
        </P>
        <P>
          If you don’t port, you’ll pay off the mortgage at closing and may owe a prepayment penalty, which is usually three months
          of interest on a variable rate, or the greater of three months of interest and the interest rate differential on a fixed
          one. Ask for the exact penalty before you list.
        </P>

        <H3>How Long Should I Keep My Mortgage Statements?</H3>
        <P>
          Keep your annual statements at least until the mortgage is paid off, and your closing documents and discharge papers
          essentially permanently. For tax purposes, the Canada Revenue Agency generally expects you to keep records for six
          years. If you ever claim a principal residence exemption, rent out part of your home or run a business from it, keep the
          purchase and sale documents and any renovation receipts for at least six years after you sell.
        </P>
      </Card>

      <Card title="The Stress Test and Canadian Mortgage Policies">
        <H3>How Does the Stress Test Work?</H3>
        <P>
          You have to prove you can afford payments at a higher rate than the one you’ll actually pay. The qualifying rate is the
          greater of 5.25% or your contract rate plus 2 percentage points, and that rule is unchanged for 2026. If a lender offers
          you 4.5%, you’d need to qualify at 6.5%. <Ext href="https://loanscanada.ca/?p=16147">Loanscanada</Ext>
        </P>
        <P>
          To approximate this in the calculator, enter the qualifying rate in the interest field and see what payment you’d need
          to show. Then compare it to your real rate.
        </P>

        <H3>What Are the Main Canadian Mortgage Policies?</H3>
        <P>A few rules shape most mortgages:</P>
        <List items={[
          ["Insured mortgage limits.", <>The price cap for insured mortgages rose from $1 million to $1.5 million, so buyers with less than 20% down can buy more expensive homes. <Ext href="https://www.cbc.ca/lite/story/1.7324474">cbc</Ext></>],
          ["30-year amortization.", "Available for first-time buyers and buyers of newly built homes on insured mortgages."],
          ["Loan-to-value limits.", "Conventional mortgages generally cap at 80% of the home’s value, and refinancing is limited as well."],
          ["The Interest Act.", "Sets the compounding rule and the right to prepay after five years."],
          ["Provincial rules.", "Land transfer taxes, registration, foreclosure processes and notary or lawyer requirements differ across provinces."],
          ["Foreign buyer rules.", "Covered in the 2027 section below."],
        ]} />
      </Card>

      <Card title="What’s Changing Heading Into 2027">
        <P>A few things are worth watching if you’re planning to buy or renew soon.</P>
        <List items={[
          ["Rates are moving up.", "With the Bank of Canada’s hike in October, variable rates are going up, and fixed rates have been creeping higher. Inflation is expected to stay elevated, so the next couple of decisions matter. If you’re buying, a pre-approval with a rate hold can protect you while you shop."],
          ["The foreign buyer ban is set to expire.", <>The federal ban on foreign purchases of residential property is scheduled to end on January 1, 2027, and the government has signaled it doesn’t plan to simply extend it again. What replaces it, if anything, isn’t settled, so if this affects you, check the latest rules before you sign anything. Provincial foreign buyer taxes are separate and apply regardless. <Ext href="https://www.mpamag.com/ca/mortgage-industry/industry-trends/canadas-foreign-buyer-ban-is-expiring-what-comes-next-could-reshape-the-market/582215">mpamag</Ext></>],
          ["The stress test stays in place.", "For now, the qualifying rule hasn’t changed, so you should budget for it."],
        ]} />
        <P>
          Rules and rates can change quickly, so confirm anything time-sensitive with a lender, broker or the official government
          source before making a decision.
        </P>
      </Card>

      <Card title="When You’d Actually Use a Mortgage Payment Calculator in Canada">
        <H3>Before You Start House Hunting</H3>
        <P>
          Work backward from a monthly budget to a realistic price range. That way you shop inside your limits and don’t fall for
          homes you can’t sustain.
        </P>
        <H3>Comparing Rate Offers</H3>
        <P>
          A lender at 4.89% and another at 5.04% give you different payments and a different total interest bill. Running both
          shows the actual dollar gap over your term.
        </P>
        <H3>Deciding on a Down Payment</H3>
        <P>
          See how an extra $20,000 changes your payment, your insurance premium and total interest. It helps you decide whether to
          buy now or wait and save more.
        </P>
        <H3>Planning a Renewal</H3>
        <P>
          If your term is ending, test new rates against your remaining balance and remaining amortization to see what the new
          payment would look like.
        </P>
        <H3>Condo Versus House</H3>
        <P>
          Condo fees and lower property taxes behave differently from a detached home’s heating, maintenance and higher tax bill.
          Running both side by side makes the comparison concrete.
        </P>
        <H3>Investment Properties</H3>
        <P>
          If you’re buying a rental, you can check whether projected rent covers the full carrying cost and not just the principal
          and interest.
        </P>
      </Card>

      <Card title="Don’t Forget Closing Costs">
        <P>
          Closing costs sit outside the mortgage payment. Land transfer tax, legal fees, title insurance, inspection and
          adjustments typically add 1.5% to 4% of the purchase price. In Ontario, Quebec and Saskatchewan, the sales tax on your
          mortgage insurance premium is paid in cash at closing too. Keep savings aside for all of this in addition to your down
          payment.
        </P>
      </Card>

      <Card title="Accuracy, Privacy and Free Access">
        <P>
          The calculator uses the standard Canadian formula for fixed-rate mortgages, with semi-annual compounding converted to an
          exact monthly rate, so results line up closely with lender quotes. Small differences can still show up because lenders
          may round payments, use different conventions or count payment dates differently. Treat the numbers as a dependable
          planning estimate, and rely on your lender’s written offer and a mortgage professional for final figures.
        </P>
        <P>
          The tool is free, with no hidden charges, and you don’t need to create an account to use it. You only enter the property
          and loan numbers needed for the math, and no personal details like your name, address or income are required.
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
