import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

// The first 18 questions are the page's FAQ; the last 9 come from the supplied
// FAQ schema, shown here too so every schema question is visible on the page.
const FAQ_ITEMS = [
  {
    q: "What does amortization mean?",
    a: "Amortization is the process of paying off a debt through scheduled installments that cover both interest and principal, so the balance reaches zero by a set date. In accounting, it also means spreading the cost of an intangible asset over its useful life.",
  },
  {
    q: "What is an amortization schedule?",
    a: "It’s a table listing every loan payment with the amount applied to interest, the amount applied to principal, and the remaining balance afterward. It shows your total interest cost and your balance at any future date.",
  },
  {
    q: "What is positive amortization?",
    a: "Positive amortization means each payment covers all the interest due and also reduces principal, so your balance goes down. Standard fixed-rate mortgages and auto loans work this way. The opposite is negative amortization, where unpaid interest is added to the balance.",
  },
  {
    q: "What is the difference between amortization and depreciation?",
    a: "Depreciation spreads the cost of tangible assets, such as vehicles and equipment, over their useful life. Amortization applies to intangible assets, such as patents and software, and also describes how loans are repaid in installments.",
  },
  {
    q: "How can I amortize a loan?",
    a: "Divide the annual rate by 12 to get the monthly rate, calculate the fixed payment with the standard formula, then for each month multiply the balance by the monthly rate to get interest. Subtract that interest from the payment to get principal and repeat until the balance reaches zero.",
  },
  {
    q: "Do banks use the same formula as this calculator?",
    a: "For standard fixed-rate mortgages, yes. Lenders use the same time-value-of-money formula, so principal-and-interest results should match closely. Differences of a few dollars usually come from rounding, the first partial month, or day-count conventions.",
  },
  {
    q: "What’s the difference between mortgage term and mortgage amortization?",
    a: "Amortization is the full period over which the loan is scheduled to be repaid. The term is how long your current rate and contract apply. A 30-year fixed U.S. mortgage usually has the same term and amortization, but a balloon loan or a Canadian mortgage can have a shorter term than its amortization.",
  },
  {
    q: "What happens if I still owe a balance at the end of my amortization term?",
    a: "On a standard loan with on-time payments, this shouldn’t happen. A leftover balance usually means a balloon, interest-only or negative-amortization loan, or missed payments. You would generally need to pay it off, refinance, sell, or negotiate an extension with your lender, so contact your servicer early.",
  },
  {
    q: "Are student loans amortized like a home mortgage?",
    a: "Under standard repayment, yes: fixed payments, interest on the remaining balance, and a payoff date. Income-driven plans, deferment and forbearance can change this, and unpaid interest may accrue or capitalize. Federal repayment rules are being restructured, so check studentaid.gov or your servicer for current terms.",
  },
  {
    q: "How can I find my mortgage amortization schedule?",
    a: "Check your Closing Disclosure and your lender’s online portal, or ask your servicer for a full table. If you can’t get one, enter your original loan amount, rate and term into this calculator to rebuild it, then compare it with your latest statement.",
  },
  {
    q: "How can I tell if I’m amortizing my mortgage from Form 1098?",
    a: "Compare the outstanding principal in Box 2 from one year’s Form 1098 to the next. A falling balance means you’re amortizing. A flat balance suggests interest-only payments, and a rising balance means negative amortization.",
  },
  {
    q: "How can I pay off my mortgage faster?",
    a: "Make extra principal payments, switch to biweekly payments (13 full payments per year instead of 12), apply windfalls as lump sums, or refinance to a shorter term. Always label extra money as principal-only, and check your loan for prepayment penalties.",
  },
  {
    q: "How does paying extra affect my amortization schedule?",
    a: "Extra payments lower your balance right away, so later interest is calculated on a smaller amount and the loan ends sooner. On a $320,000 loan at 6.5%, an extra $200 a month shortens the term to about 23.5 years and saves roughly $100,000 in interest. Earlier extra payments have the biggest effect.",
  },
  {
    q: "Can I increase the amortization on my mortgage?",
    a: "You can lengthen it only by refinancing or modifying the loan (or, in Canada, sometimes at renewal), which lowers the payment but increases total interest. You can shorten it by paying extra principal or refinancing into a shorter term.",
  },
  {
    q: "Are there still negative amortization mortgages?",
    a: "They’re much rarer since 2008 and are restricted for qualified mortgages. They still appear in reverse mortgages, some specialized loans, certain modifications and income-driven student loan plans. If a minimum payment doesn’t cover the interest, your balance can grow even when you pay on time.",
  },
  {
    q: "How do you calculate a balloon mortgage payment without amortization?",
    a: "For an interest-only balloon, multiply the balance by the annual rate and divide by 12. On $320,000 at 6.5%, that’s $1,733.33 a month, with the full balance due at the end. For a partially amortized balloon, calculate the payment as if the loan ran 30 years and pay off whatever balance remains at the end of the shorter term.",
  },
  {
    q: "Does a reverse mortgage amortize?",
    a: "No, not in the usual sense. A reverse mortgage has no required monthly payments, and interest and fees are added to the balance, so the debt grows over time. This calculator is built for traditional forward mortgages, not reverse mortgages.",
  },
  {
    q: "What are the best mortgage amortization strategies in 2027?",
    a: "Rates for 2027 can’t be predicted, so focus on strategies that work in any market. Compare terms using the full monthly cost including taxes, insurance, PMI and HOA. Prepay principal only after building an emergency fund, refinance only if the break-even period is short, and request PMI removal as soon as you reach 80% loan-to-value. Recast after a lump sum if you want a lower payment, and review your escrow each year.",
  },
  {
    q: "What is a mortgage amortization calculator?",
    a: "It’s a tool that calculates your monthly mortgage payment and shows how each payment splits between principal and interest over the life of the loan. A good mortgage amortization calculator also includes a full schedule and the total interest you’ll pay.",
  },
  {
    q: "How do I calculate mortgage amortization?",
    a: "Multiply your remaining balance by the monthly interest rate (annual rate ÷ 12) to find that month’s interest. Subtract it from your fixed payment to find the principal paid, then repeat with the new balance. A mortgage amortization calculator does this for every payment automatically.",
  },
  {
    q: "How much of my payment goes to interest?",
    a: "Early in a 30-year loan, most of it. On a $320,000 loan at 6.5%, about $1,733 of the first $2,023 payment is interest. The share declines every month as the balance falls.",
  },
  {
    q: "Does this calculator include taxes, insurance, PMI and HOA fees?",
    a: "Yes. You can add property tax, homeowners insurance, PMI and HOA dues to see your total monthly housing cost alongside the principal-and-interest portion.",
  },
  {
    q: "What’s the difference between the annual and monthly schedule?",
    a: "The monthly schedule lists every payment individually. The annual schedule summarizes interest, principal and ending balance by year. Both use the same underlying math.",
  },
  {
    q: "When can I stop paying PMI?",
    a: "On conventional loans in the U.S., you can generally request removal once your balance reaches 80% of the home’s original value, and lenders must typically terminate it automatically at 78%. FHA and other loan types follow different rules, so check with your servicer.",
  },
  {
    q: "Do extra payments reduce total interest?",
    a: "Yes. Extra principal lowers your balance sooner, so less interest accrues afterward. Use the standard schedule as a baseline and compare it with your actual statements as you prepay.",
  },
  {
    q: "Is a mortgage amortization calculator the same as a mortgage payment calculator?",
    a: "They overlap, but a payment calculator usually shows only the monthly figure. An amortization calculator adds the full payment-by-payment breakdown and total interest.",
  },
  {
    q: "Is this mortgage amortization calculator free?",
    a: "Yes, it’s free to use, and you only enter loan figures, not personal identifying information.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const DDD_HEADERS = ["", "Depreciation", "Amortization", "Depletion"];
const DDD_ROWS = [
  ["Applies to", "Tangible assets (machinery, buildings)", "Intangible assets (patents, licenses); also loans", "Natural resources (oil, minerals, timber)"],
  ["Basis for expense", "Time or usage", "Mostly time (straight-line)", "Units extracted"],
  ["Salvage value", "Often considered", "Usually none", "May be considered"],
  ["Common methods", "Straight-line, declining balance, units of production", "Straight-line", "Cost or percentage depletion (tax)"],
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
      <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 13 }}>
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

export default function MortgageAmortizationCalculatorFaqSection() {
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

      <Card title="Amortization Basics: Definitions and Real-Life Meaning">
        <H3>What Does Amortization Mean?</H3>
        <P>
          Amortization means gradually paying off or writing down a balance over time through scheduled installments. The word
          comes from the old French amortir, “to deaden,” and the idea is that a debt is slowly “killed off” by regular payments.
          In everyday finance, it usually refers to a loan being repaid in fixed installments that cover both interest and
          principal, so the balance reaches zero on a set date. In accounting, the same word describes spreading the cost of an
          intangible asset over its useful life. Both meanings share one principle: a large amount is broken into predictable
          pieces across a defined period.
        </P>

        <H3>What Is Amortization, and How Is It Related to You?</H3>
        <P>
          If you’ve ever financed a home, a car, a personal loan or student loans, you’ve been on an amortizing loan. Your required
          payment is the same each period, but the split between interest and principal changes behind the scenes, and that split
          determines how fast you build equity and how much the loan costs you overall. Credit cards are different: they are
          revolving debt without a fixed payoff schedule. Understanding amortization helps you answer practical questions, such
          as how much of your payment is working for you, what an extra payment saves, and whether a refinance makes sense.
        </P>

        <H3>Where Does Amortization Apply in Real Life?</H3>
        <P>
          Mortgages and auto loans are the most familiar examples, and almost every fixed-installment consumer loan follows the
          same logic. It also shows up in student loans, personal loans, small-business term loans and commercial real estate
          financing. On the business side, companies amortize patents, trademarks, copyrights, licenses, customer lists and
          acquired software over time. Bond premiums and discounts are amortized too, which is how investors and issuers align
          interest cost with the bond’s life. If a cost or debt is spread over a schedule instead of hitting all at once,
          amortization is probably involved.
        </P>

        <H3>What Is a Good Example of Amortization?</H3>
        <P>
          Take a $320,000 mortgage at 6.5% over 30 years. The fixed principal-and-interest payment is about $2,023. In the first
          month, roughly $1,733 is interest and $289 goes to principal. The next month, interest is calculated on the slightly
          lower balance, so a bit less goes to interest and a bit more to principal. That gradual shift continues until the final
          payment, when almost the entire installment reduces principal.
        </P>
        <P>
          A business example works differently. A company buys a patent for $150,000 with a 15-year useful life. Using
          straight-line amortization, it records $10,000 of amortization expenses each year, reducing the asset’s book value until
          it reaches zero.
        </P>

        <H3>What Is an Amortization Schedule?</H3>
        <P>
          An amortization schedule is a table that lists every payment on a loan and shows how it’s divided between interest and
          principal, plus the remaining balance after each payment. It’s the complete payoff roadmap. Lenders generate one when a
          loan closes, and the schedule is what lets you see total interest, project your balance on any future date, and verify
          your lender’s statements. The schedule on this page can be viewed monthly or annually.
        </P>

        <H3>What Is a Loan Amortization Schedule, and How Are These Schedules Used?</H3>
        <P>A loan amortization schedule is the same table applied specifically to a loan. People use it in several ways:</P>
        <List items={[
          ["Budgeting:", "to see the true long-term cost of a home or car purchase."],
          ["Comparing offers:", "to measure how rate and term differences change total interest."],
          ["Planning a sale or refinance:", "to find the exact payoff balance and equity at a future date."],
          ["Modeling extra payments:", "to see how prepayment shortens the term."],
          ["Verifying statements:", "to confirm the lender is applying payments correctly."],
          ["Tax and accounting records:", "to track annual interest for deduction purposes (confirm eligibility with a tax professional) or for business loan bookkeeping."],
        ]} />

        <H3>What Is Positive Amortization?</H3>
        <P>
          Positive amortization happens when your payment covers all the interest due for the period and also reduces some
          principal, so the loan balance goes down. Standard fixed-rate mortgages, auto loans and most installment loans are
          positively amortizing. The opposite is negative amortization, where the payment is smaller than the interest charged and
          the unpaid interest is added to the balance, so you owe more over time. If you’re keeping an eye on your equity,
          positive amortization is the outcome you want: every payment moves you closer to owning the property outright.
        </P>
      </Card>

      <Card title="Mortgage Payment Breakdown: Principal, Interest, Taxes, Insurance, PMI and HOA">
        <P>
          Lenders often describe a payment as PITI: principal, interest, taxes and insurance. Principal reduces what you owe.
          Interest is the lender’s charge for the loan. Property taxes and homeowners insurance are frequently collected monthly
          into an escrow account and paid on your behalf. A mortgage payment calculator that stops at principal and interest
          understates your true monthly cost, sometimes by several hundred dollars.
        </P>
        <P>
          Two more costs deserve attention. Private mortgage insurance (PMI) typically applies to conventional loans with less than
          20% down, and it commonly runs from roughly 0.3% to 1.5% of the loan amount per year depending on your credit and down
          payment. HOA dues apply to condominiums and many planned communities, and they can range from a small fee to well over
          $500 a month. Neither one builds equity, so it helps to see them separated from principal in your results. Including
          them is what makes this mortgage amortization calculator more realistic than a bare loan formula, and it’s why a
          mortgage calculator with taxes and insurance gives a far better budget picture than a principal-and-interest estimate
          alone.
        </P>
      </Card>

      <Card title="Interest vs Principal: How Mortgage Amortization Works">
        <P>The standard formula for a fixed-rate payment is:</P>
        <Formula>M = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1]</Formula>
        <P>
          P is the loan amount, r is the monthly interest rate (the annual rate divided by 12), and n is the total number of
          payments. Each month, interest is calculated on the remaining balance, and whatever is left of your payment reduces
          principal. As the balance shrinks, so does the interest charge, and the principal portion grows.
        </P>
        <P>
          Here’s a worked example. Suppose you buy a $400,000 home with 20% down, leaving a $320,000 loan at 6.5% for 30 years. The
          monthly principal-and-interest payment comes to about $2,023. In month one, roughly $1,733 of that is interest and only
          about $289 is principal. Across 360 payments you’d repay around $728,000, which means roughly $408,000 is interest. That
          interest-heavy front end is why the schedule matters: the first several years of a 30-year loan build equity slowly. A
          mortgage amortization calculator lets you see that curve rather than guess at it.
        </P>
      </Card>

      <Card title="15-Year vs 30-Year Mortgage: Comparing Loan Terms">
        <P>
          The term you choose has an outsized effect on total cost. Take the same $320,000 loan at 6.5%. Over 15 years the payment
          rises to about $2,788, roughly $765 more per month than the 30-year version. But total interest falls to about $182,000,
          compared with $408,000 over 30 years, a saving of around $226,000. In practice, shorter terms often carry lower interest
          rates too, which widens the gap further.
        </P>
        <P>
          The trade-off is monthly flexibility. A higher required payment leaves less room for emergencies, retirement
          contributions or other goals. Some borrowers take a 30-year loan for the lower required payment and prepay when they
          can. To weigh these options, run both terms through the mortgage amortization calculator and compare monthly cost, total
          interest and the balance after five and ten years. Seeing the numbers side by side usually settles the question faster
          than rules of thumb.
        </P>
      </Card>

      <Card title="When You Need a Mortgage Amortization Calculator">
        <P>Most people reach for a mortgage amortization calculator at one of a handful of decision points.</P>
        <List items={[
          ["Before house hunting.", "Lenders may pre-approve you for more than you’re comfortable paying. Running the numbers with realistic taxes, insurance and HOA dues helps you set a budget based on monthly cash flow, not the maximum loan on offer."],
          ["Comparing loan offers.", "A quarter-point rate difference or a different term can change total interest by tens of thousands of dollars. Entering each offer into the mortgage amortization calculator gives you a like-for-like comparison."],
          ["Considering a refinance.", "Enter your current balance, the new rate and the new term to see whether lower payments are worth the extra years of interest. Resetting a 30-year clock after ten years of payments often costs more than it saves."],
          ["Planning a sale or payoff.", "The schedule shows your remaining balance at any point, so you can estimate equity and sale proceeds in advance."],
          ["Evaluating a rental or investment property.", "HOA dues, taxes and insurance directly affect cash flow, and the breakdown makes those costs visible before you commit."],
          ["Checking your lender’s figures.", "Comparing your own results with a Loan Estimate or Closing Disclosure is a simple way to catch discrepancies early."],
        ]} />
      </Card>

      <Card title="What Are the Advantages and Disadvantages of Amortization?">
        <P>
          <strong>Advantages.</strong> Amortizing loans give you predictable payments, which makes budgeting easier. They
          guarantee a payoff date if you pay as scheduled, and every payment builds equity. They also make comparison shopping
          straightforward, because total cost can be calculated up front. For businesses, amortizing intangible assets matches
          expenses to the periods in which the asset generates revenue and can lower taxable income.
        </P>
        <P>
          <strong>Disadvantages.</strong> Payments are front-loaded with interest, so equity builds slowly in the early years,
          which hurts if you sell or refinance within a few years. Long terms lower the payment but add substantially to total
          interest. Fixed schedules are inflexible, and you can’t simply skip a payment without consequences. On the accounting
          side, amortization requires estimating useful life, which involves judgment, and misjudging it can distort reported
          earnings.
        </P>
      </Card>

      <Card title="Amortization in Accounting and Business">
        <H3>What Is Amortization in Accounting?</H3>
        <P>
          In accounting, amortization is the systematic allocation of the cost of an intangible asset over its useful life. The
          cost is recorded as an expense on the income statement each period, and the asset’s carrying value on the balance sheet
          falls by the same amount. Under U.S. GAAP and IFRS, intangible assets with finite lives, such as patents, licensed
          software and customer relationships, are amortized, while goodwill is generally not amortized under IFRS and is tested
          for impairment under U.S. GAAP for most companies. In U.S. tax rules, many acquired intangibles are amortized over 15
          years under Section 197. Always check current tax treatment with a CPA, since the rules change from year to year.
        </P>

        <H3>What Is Amortization in Business?</H3>
        <P>
          For a business, amortization appears in two places. First, it’s the debt-repayment schedule on loans, equipment
          financing and commercial mortgages, which affects cash flow planning. Second, it’s the expense recognized on intangible
          assets. Both affect financial statements: loan amortization splits payments into interest expense and debt reduction,
          while asset amortization reduces net income without using cash, which is why investors often add it back when looking at
          metrics like EBITDA. Startup costs and certain acquired intangibles also follow amortization rules for tax purposes, and
          U.S. tax law on research expenses has changed recently, so businesses should confirm the current treatment with a
          professional.
        </P>

        <H3>What Is the Difference Between Amortization and Depreciation?</H3>
        <P>
          Both spread a cost over time, but they apply to different asset types. Depreciation applies to tangible assets you can
          touch, such as buildings, vehicles and equipment. Amortization applies to intangible assets (patents, trademarks,
          software) and also describes loan repayment. Depreciation often uses accelerated methods and typically accounts for
          salvage value, while amortization of intangibles is usually straight-line with no salvage value. Loan amortization is a
          separate concept from accounting amortization, but the shared name reflects the same underlying idea of gradual
          write-down.
        </P>

        <H3>What Are the Differences Between Depreciation, Amortization and Depletion?</H3>
        <P>
          Depletion is the third member of the family, and it applies to natural resources such as oil, gas, minerals and timber.
          As the resource is extracted, its cost is gradually expensed in proportion to the quantity removed. The three are
          compared below.
        </P>
        <DataTable headers={DDD_HEADERS} rows={DDD_ROWS} />
        <P>
          Similarities: all three are non-cash expenses that allocate an asset’s cost across the periods it benefits, which
          matches expenses with revenue and reduces reported profit and, in many cases, taxable income.
        </P>
      </Card>

      <Card title="How Mortgage Amortization Works for Borrowers">
        <H3>Mortgages: What Is the Purpose of Amortization? Why Do We Amortize Interest in a Mortgage?</H3>
        <P>
          Amortization exists so that a large loan can be repaid with one manageable, unchanging payment. Without it, borrowers
          would face either interest-only payments with a huge lump sum at the end or irregular payments that make budgeting hard.
          Interest is calculated on the outstanding balance, so it’s highest at the start and falls as principal is repaid. That’s
          why early payments are interest-heavy, and why lenders structure loans this way: they earn the most when the balance is
          highest and still receive a full payoff by the end. For you, the purpose is certainty about the payoff date and the
          total cost.
        </P>

        <H3>How Can I Amortize a Loan? What Is the Procedure for Equal Periodic Payments?</H3>
        <P>Amortizing a loan into equal periodic payments follows four steps:</P>
        <List ordered items={[
          ["", "Gather the loan amount, annual interest rate and number of payments."],
          ["", "Divide the annual rate by the number of payments per year to get the periodic rate (6.5% ÷ 12 = 0.5417% per month)."],
          ["", "Calculate the fixed payment using the standard formula shown later on this page."],
          ["", "For each period, multiply the current balance by the periodic rate to get interest, subtract that from the payment to get principal, and subtract principal from the balance. Repeat until the balance hits zero."],
        ]} />
        <P>The calculator on this page does all four steps instantly, but knowing the procedure helps you check any lender’s figures.</P>

        <H3>How Do You Calculate the Mortgage Amortization Formula With Fixed Payments?</H3>
        <P>
          The fixed payment comes from M = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1], where P is the loan amount, r is the periodic interest
          rate and n is the number of payments. For $320,000 at 6.5% over 360 months, r is 0.005417 and the result is about
          $2,022.55. The formula works because it’s the payment amount that makes the present value of all future payments equal
          the amount borrowed. Spreadsheets give you the same answer with =PMT(rate/12, years*12, -loan), and financial
          calculators do it by entering N, I/Y and PV and solving for PMT.
        </P>

        <H3>Do Banks Use the Same Math Formula to Calculate the Mortgage Amortization Table?</H3>
        <P>
          For standard U.S. fixed-rate mortgages, yes. Banks use the same time-value-of-money math, so a correctly built calculator
          or spreadsheet matches the lender’s principal-and-interest figures. Small differences arise from rounding each payment
          to the cent, how the first partial month is handled, and day-count conventions (some commercial loans use actual/360
          instead of 30/360). Canadian fixed mortgages compound semi-annually by law, which makes their payment slightly different
          from a U.S.-style monthly calculation. If your figures are off by a few dollars, check those details first.
        </P>

        <H3>How Can I Find My Mortgage Amortization?</H3>
        <P>
          You have several options. Your Closing Disclosure and loan documents often include or reference the payment schedule.
          Your lender’s online portal usually has a schedule or payment history, and you can request a full amortization table
          from your servicer. If you can’t find one, enter your original loan amount, rate and term into this mortgage
          amortization calculator to recreate it. Compare the balance it shows against your latest statement. They should be very
          close, with any difference traced to extra payments or fees.
        </P>

        <H3>How Do I Find Amortization Tables From My Specific Lender?</H3>
        <P>
          Large servicers (Wells Fargo, Chase, Bank of America and others) typically show schedules in their online account
          sections, under loan details or a payment-calculator tool, and you can call or send a secure message to request a
          printed copy. If your loan was sold to another servicer, which is common, ask the current servicer, because the original
          lender may no longer hold the records. As a backup, rebuilding the table from your loan terms works for any lender.
        </P>

        <H3>How Can I Tell If I’m Amortizing My Mortgage From Form 1098?</H3>
        <P>
          Form 1098 shows the mortgage interest your lender received during the year (Box 1) and the outstanding principal
          balance as of January 1 (Box 2). Compare Box 2 from one year’s form to the next. If the balance is falling, you’re
          amortizing. A flat balance suggests an interest-only period, and a rising balance indicates negative amortization, which
          is rare on standard loans. Also compare Box 1 against your schedule’s yearly interest total: it should be in the same
          ballpark, and a lower figure each year is the normal pattern.
        </P>

        <H3>How Do You Calculate If a Mortgage Monthly Payment Is Right?</H3>
        <P>
          First, recalculate principal and interest using the formula or this calculator with your exact loan amount, rate and
          term, which should match your Loan Estimate or statement. Then verify the escrow portion by confirming your actual
          property tax bill and homeowners insurance premium, plus PMI and any HOA dues. Add them for your total monthly cost. If
          the totals don’t match, ask your servicer for an escrow analysis, since taxes and insurance often change at the annual
          review. As a sanity check on affordability, many lenders look at housing costs of roughly 28% of gross income and total
          debt of about 36% to 43%, though limits vary by program.
        </P>

        <H3>How Do You Calculate Cash Payment on Mortgage Amortization?</H3>
        <P>
          If you mean your actual monthly cash outlay, it’s principal and interest plus escrowed taxes and insurance, plus PMI and
          HOA dues if applicable. For the example loan, that’s $2,023 for principal and interest, plus perhaps $400 to $600 or
          more for the other costs depending on location. If you instead mean cash needed at closing, that’s your down payment
          plus closing costs, which are separate from the amortization schedule.
        </P>

        <H3>How Can We Calculate a Mortgage Amortization Schedule Manually, Without Software?</H3>
        <P>
          Calculate the payment with the formula (a scientific calculator is enough), then work month by month. For the $320,000
          loan at 6.5% with a $2,022.55 payment:
        </P>
        <List items={[
          ["Month 1:", "Interest = $320,000 × 0.005417 = $1,733.33. Principal = $289.22. New balance ≈ $319,710.78."],
          ["Month 2:", "Interest = $319,710.78 × 0.005417 ≈ $1,731.76. Principal ≈ $290.79. New balance ≈ $319,419.99."],
          ["Month 3:", "Interest ≈ $1,730.19. Principal ≈ $292.36. New balance ≈ $319,127.63."],
        ]} />
        <P>
          Notice the principal grows by about $1.57 each month. Continuing 360 rows by hand is tedious, so for a full schedule a
          spreadsheet or this tool is the practical choice. A shortcut for the balance at any point is B = P(1+r)ⁿ − M[((1+r)ⁿ −
          1) ÷ r], with n as the number of payments made.
        </P>

        <H3>How Do You Make an Amortization Schedule?</H3>
        <P>
          The fastest route is to use this calculator, which builds the entire table from your inputs. To build one yourself in a
          spreadsheet, create columns for payment number, payment, interest, principal and balance. Use =PMT() for the payment,
          then set interest to the previous balance times the monthly rate, principal to payment minus interest, and new balance
          to previous balance minus principal. Copy the row down for every payment. Excel and Google Sheets also have IPMT and
          PPMT functions that return the interest and principal portions directly for any period.
        </P>

        <H3>How Long Can You Amortize a Mortgage With a Financial Calculator?</H3>
        <P>
          Most financial calculators handle 360 payments (30 years) without difficulty, as N usually accepts values far higher
          than any mortgage needs. In the U.S., 30 years is the standard maximum for conventional and government-backed purchase
          loans, although 40-year terms exist through some loan modifications and certain lenders. Longer terms such as 50-year
          mortgages have been discussed publicly, but availability and underwriting rules are still evolving, so confirm with a
          lender before relying on one. In Canada, amortization periods are commonly capped at 25 to 30 years depending on the
          loan type.
        </P>

        <H3>What’s the Difference Between Mortgage Term and Mortgage Amortization?</H3>
        <P>
          Mortgage amortization is the total time over which the loan is scheduled to be repaid. Mortgage term is the length of
          time your current rate and contract conditions apply. In the U.S., a 30-year fixed loan typically has a 30-year term and
          a 30-year amortization, so they’re the same. In Canada, a mortgage might be amortized over 25 years but carry a 5-year
          term, after which you renew at new rates. The same distinction applies to balloon mortgages in the U.S., where the term
          (say, 7 years) is shorter than the amortization (30 years).
        </P>

        <H3>What Happens If You Still Have a Mortgage Balance at the End of Your Amortization Term?</H3>
        <P>
          On a standard fixed-rate loan with on-time payments, the balance reaches zero at the end of the amortization period. A
          remaining balance usually occurs in specific situations: a balloon loan, an interest-only loan, a negative-amortization
          loan, or a missed payment history. If a balance remains, you generally must pay it in full, refinance it, sell the
          property, or negotiate a modification or extension with the lender. If you can’t do any of these, the loan can go into
          default and ultimately foreclosure. If you see this risk coming, contact your servicer well before the due date, because
          options are far broader early on.
        </P>

        <H3>How Do You Calculate Balloon Mortgage Payments Without Amortization?</H3>
        <P>
          A balloon mortgage has payments calculated one of two ways. With an interest-only structure, there’s no amortization at
          all: the payment equals balance × annual rate ÷ 12, which on $320,000 at 6.5% is $1,733.33, and the entire $320,000 is
          due at the end. With a partially amortized structure, payments are calculated as if the loan ran 30 years (about
          $2,022.55), but the full balance is due at the end of the shorter term. After 5 years, you’d still owe roughly $299,600,
          and that remaining amount is the balloon payment. Balloon loans carry refinancing risk, because you need to qualify for
          new financing or sell when the balloon comes due.
        </P>
      </Card>

      <Card title="Special Cases: Student Loans, Negative Amortization and Reverse Mortgages">
        <H3>Are Student Loans Amortized Like a Home Mortgage?</H3>
        <P>
          Mostly yes under standard repayment: a fixed payment, with interest charged on the remaining balance and a payoff date
          at the end of the term. But student loans have features that change this. Income-driven plans tie payments to your
          earnings, and if a payment is lower than the monthly interest, the unpaid interest can accrue or capitalize, which is
          negative amortization. Deferment and forbearance can also add interest. Federal repayment options are being restructured
          during 2026 and 2027, so check studentaid.gov or your servicer for the plan and rules that apply to your loans. Private
          student loans follow their own contracts.
        </P>

        <H3>Are There Still Negative Amortization Mortgages?</H3>
        <P>
          They’re far less common than before the 2008 crisis. Option ARMs and pay-option loans largely disappeared, and
          post-crisis rules restricted negative amortization in qualified mortgages. It still appears in reverse mortgages (by
          design), some specialized non-qualified mortgages, certain loan modifications, and income-driven student loan plans. If a
          lender offers a minimum-payment option that doesn’t cover the interest, read the terms carefully, because your balance
          can rise even while you make every payment.
        </P>

        <H3>How Do I Amortize a Reverse Mortgage? What Does the Table Look Like With No Cash Take-Outs?</H3>
        <P>
          A reverse mortgage doesn’t amortize in the usual sense, because there are no required monthly payments. Instead,
          interest, mortgage insurance premiums (for FHA-insured HECMs) and servicing fees are added to the balance each month, so
          the loan balance grows over time, which is negative amortization. A reverse mortgage “table” with no cash taken out
          starts with the closing costs and any financed fees. Then each month it adds interest and insurance charges to the
          balance. Because the balance compounds, the growth accelerates in later years. The table shows rising debt and declining
          home equity, the opposite of what you’d see in this calculator, which is built for traditional forward mortgages.
        </P>

        <H3>What Happens If You Outlive Your Reverse Mortgage?</H3>
        <P>
          With a federally insured HECM, you generally can stay in the home for as long as you live there as your primary
          residence and keep up with property taxes, insurance and maintenance. The loan comes due when the last borrower dies,
          sells or permanently moves out. HECMs are non-recourse, meaning that if the loan balance exceeds the home’s value,
          neither you nor your heirs owe more than the home’s value, and FHA insurance covers the lender’s shortfall. Your heirs
          can repay the balance and keep the home, sell it, or hand it over to the lender.
        </P>

        <H3>What Are My Payments on a Zero-Interest Mortgage Amortized Over 10 Years?</H3>
        <P>
          With zero interest, payments are simply the loan amount divided by the number of payments. A $300,000 loan over 10 years
          is $300,000 ÷ 120 = $2,500 per month, with every dollar going to principal. Truly interest-free mortgages are rare. They
          tend to be offered through seller financing, family loans or special programs, and they may be structured with fees or
          higher prices instead. If you see a “zero-interest” offer, calculate the total cost including points, fees and price
          markups.
        </P>

        <H3>Why Is a Zero-Interest Mortgage Different From a Reverse Mortgage, and How Do Fees Compare?</H3>
        <P>
          They solve opposite problems. A zero-interest forward loan finances a purchase and requires monthly payments that reduce
          what you owe. A reverse mortgage lets homeowners 62 and older borrow against existing equity with no monthly payments,
          and the debt grows over time. The fees also differ. Zero-interest loans may have minimal or no interest cost but can
          include origination or other fees depending on the arrangement. HECM reverse mortgages typically include an upfront FHA
          mortgage insurance premium (2% of the home value, in my understanding of the current structure), an ongoing annual
          premium, origination and closing costs, and servicing fees, which are verified at the time of application. Neither is
          “better” in general. The right choice depends on whether you’re buying a home or tapping equity in one you already own.
        </P>
      </Card>

      <Card title="Paying Off Your Mortgage Faster">
        <H3>Can I Increase the Amortization on My Mortgage?</H3>
        <P>
          It depends on what you mean. If you want a longer amortization to lower your payment, you’d generally refinance or
          modify the loan (in Canada, some lenders allow extending amortization at renewal). You’ll pay more total interest. If you
          want a faster amortization, you can usually pay extra principal at any time, or refinance into a shorter term. Before
          committing to either, check your loan for prepayment penalties, which are uncommon on modern U.S. conventional loans but
          do occur.
        </P>

        <H3>How Can I Pay Off My Mortgage Balance Faster?</H3>
        <P>The main methods are:</P>
        <List items={[
          ["Extra monthly principal:", "even a modest amount reduces your balance sooner, and the interest saved compounds."],
          ["Biweekly payments:", "paying half your payment every two weeks results in 26 half-payments, or 13 full payments a year, which typically shortens a 30-year loan by roughly five to six years. Confirm your servicer applies each payment promptly."],
          ["Lump sums:", "apply bonuses, tax refunds or windfalls directly to principal."],
          ["Refinance to a shorter term:", "this works if the rate and closing costs make sense."],
          ["Recasting:", "some lenders let you make a large lump-sum payment and then re-amortize the remaining balance for a lower required payment."],
        ]} />
        <P>Always specify that extra money should go “to principal only,” or the servicer may treat it as an early payment on the next installment.</P>

        <H3>How Does Paying Extra on My Mortgage Affect My Amortization Schedule?</H3>
        <P>
          Extra payments reduce your balance immediately, so every future interest calculation is based on a smaller number. The
          required payment stays the same, but more of each regular payment goes to principal and the loan ends early. For
          example, a $320,000 loan at 6.5%, adding $200 a month would cut the term to roughly 23.5 years and save around $100,000
          in interest. The earlier in the loan you make extra payments, the bigger the impact, because interest is heaviest in the
          early years. The schedule from this calculator serves as your baseline, and you can compare your actual servicer
          statements to see how far ahead of it you are.
        </P>
      </Card>

      <Card title="What Are the Best Mortgage Amortization Strategies for 2027?">
        <P>I can’t predict where rates will be in 2027, so these strategies focus on decisions that hold up in any rate environment:</P>
        <List items={[
          ["Run the full-cost numbers first.", "Use the calculator with real taxes, insurance, PMI and HOA dues before choosing a loan."],
          ["Compare terms, not just rates.", "A 15-year loan costs far less in interest, but only choose it if the payment doesn’t strain your budget."],
          ["Prepay strategically.", "If your rate is above what you’d confidently earn from other low-risk uses of cash, extra principal is a guaranteed return. Keep an emergency fund first."],
          ["Refinance only when the break-even works.", "Divide closing costs by monthly savings to find how many months it takes to recover the cost, and don’t forget that resetting to a fresh 30-year term can raise total interest."],
          ["Remove PMI as early as you can.", "Request cancellation at 80% loan-to-value on conventional loans and consider a new appraisal if your home value has risen."],
          ["Consider recasting", "if you receive a large lump sum and want a lower payment without refinancing."],
          ["Review tax treatment each year.", "U.S. rules on the mortgage interest deduction and mortgage insurance deductibility changed under recent legislation, and thresholds may shift again, so confirm current rules with a tax professional before relying on any deduction."],
          ["Watch for annual changes in escrow.", "Rising taxes and insurance premiums can raise your payment even though your principal-and-interest stays fixed."],
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
