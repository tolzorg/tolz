import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does an FHA loan calculator work?",
    a: "It takes your home price, down payment, rate and term, works out the loan amount, then adds the upfront and annual mortgage insurance premiums. It also includes property taxes, homeowners insurance, HOA dues and other costs to give you a total monthly payment.",
  },
  {
    q: "Can you get an FHA loan with no down payment?",
    a: "Not on your own. FHA requires at least 3.5% down. But that 3.5% can come entirely from a gift from a family member or a down payment assistance grant, so you may not have to use your own savings. If you truly want zero down, look at VA loans for eligible veterans and service members, or USDA loans for qualifying rural properties.",
  },
  {
    q: "How much down payment does a VA loan need compared to FHA?",
    a: "VA loans allow 0% down for eligible borrowers, versus 3.5% for FHA. VA loans don’t have monthly mortgage insurance, but they charge a one-time funding fee, which runs from roughly 1.25% to 3.3% depending on your down payment and whether it’s your first VA loan. Disabled veterans and some others are exempt from it. If you’re eligible for both, VA is usually the cheaper route, but you’ll need a Certificate of Eligibility.",
  },
  {
    q: "How does the FHA appraisal process work?",
    a: "Your lender orders it through the FHA’s system and assigns the appraiser from HUD’s approved roster, so you don’t get to pick one. After the lender gets an FHA case number, the appraiser checks the home’s value and looks over whether it meets HUD minimum property standards for safety and soundness. The appraisal is generally good for 180 days and tied to your case number. Costs typically run several hundred dollars, often $500 to $800 depending on location. If repairs are required, they usually need to be completed and re-inspected before closing, and the seller can often be asked to handle them.",
  },
  {
    q: "Can I take out a home equity loan on a house with an FHA mortgage?",
    a: "It’s possible, but it’s not easy. The FHA doesn’t ban second mortgages, though it limits them, and many lenders won’t offer a home equity loan or HELOC behind an FHA first mortgage. Combined loan-to-value limits apply. If you think you’ll need a second loan in the future, ask your lender before you close. Another option is a cash-out refinance, which replaces the first mortgage and pulls out equity at the same time.",
  },
  {
    q: "Can I reduce or avoid the upfront fees on an FHA loan?",
    a: "You can’t skip the appraisal or the upfront mortgage insurance premium, but there are ways to soften the blow. The 1.75% premium can be financed into the loan. Sellers can contribute up to 6% of the price toward closing costs and prepaid items. Gift funds and assistance programs can cover cash to close. Lender credits, usually in exchange for a slightly higher rate, can also reduce what you pay at the table. And get Loan Estimates from at least three lenders. Origination fees vary a lot, and that’s the part you have control over.",
  },
  {
    q: "What are the requirements for FHA manufactured (mobile) home loans?",
    a: "The FHA has two main paths. A Title II loan is a regular FHA mortgage on a manufactured home that’s treated as real property. The home generally must have been built on or after June 15, 1976, bear the HUD certification label, sit on a permanent foundation that meets HUD guidelines, and be on land you own or lease long term. An engineer’s foundation certification is commonly required. A Title I loan covers manufactured homes that are treated as personal property (sometimes called chattel loans), with different, lower limits and fewer lenders offering them. Rates and credit rules often run tighter on these, so shop lenders who do manufactured housing specifically.",
  },
  {
    q: "Can I use an FHA loan to buy an investment property or rental?",
    a: "Not a pure investment. FHA is for owner-occupied homes, and you’re expected to move in within 60 days of closing and live there for at least a year. There’s a workaround: you can buy a two-, three- or four-unit property, live in one unit and rent out the others. The rental income from the other units can help you qualify. For three- and four-unit homes, FHA also checks that the property’s rent roughly covers the mortgage. Generally you can only have one FHA loan at a time, with exceptions for things like a job relocation or a growing family.",
  },
  {
    q: "How long does it take to get an FHA loan after pre-qualification?",
    a: "Pre-qualification is a quick estimate based on what you tell the lender, and it can take minutes. Pre-approval takes longer because you submit documents like pay stubs, W-2s, tax returns and bank statements, and it often takes a few days. The formal application comes after you have a signed purchase contract. From there, closing usually takes about 30 to 45 days, depending on how fast the appraisal comes back, how cleanly your paperwork goes and how busy the lender is.",
  },
  {
    q: "Can I refinance a house I bought with cash using an FHA loan?",
    a: "Yes, in the right situation. For a primary residence you own free and clear, an FHA cash-out refinance can pull equity out up to 80% of the home’s value. You generally need to have owned and lived in the home for at least 12 months. FHA’s minimum credit score is 580, but lenders often want more for cash-out. If you bought with cash recently and want to borrow right away, conventional options may fit better, so it’s worth asking about both.",
  },
  {
    q: "What happens to an FHA mortgage when you sell the house?",
    a: "In most sales, the loan gets paid off from your proceeds at closing and it’s done. FHA doesn’t charge a prepayment penalty. FHA loans are also assumable, meaning a buyer can take over your loan and its rate, if the lender approves them and they qualify. That can be a big draw if your rate is well below current market rates. If you refinance into another FHA loan within the first few years, you may get a partial refund of the unused upfront premium.",
  },
  {
    q: "Can you remove MIP from an FHA loan?",
    a: "With 10% or more down, annual MIP ends after 11 years. With less than 10% down, it lasts for the life of the loan. Many borrowers refinance into a conventional loan once they have enough equity and a good credit score.",
  },
  {
    q: "What are the FHA loan limits for 2026?",
    a: "For one-unit homes it’s $541,287 in most counties and up to $1,249,125 in high-cost areas. Two-, three- and four-unit homes have higher limits. Check your county on HUD’s lookup tool.",
  },
  {
    q: "Is a bi-weekly payment better than monthly?",
    a: "It can be. Half payments every two weeks add up to 13 full payments a year, which cuts the loan term and the interest. Confirm with your servicer that extra funds are applied to principal.",
  },
  {
    q: "Is this FHA loan calculator free, and is the result a loan offer?",
    a: "It’s free. And no, the result is an estimate for planning. Your lender’s Loan Estimate has the final figures.",
  },
];

// FAQ schema exactly as supplied: its own selection of questions (two of them
// answered in the "FHA Loan Requirements" section above the FAQ) and wording.
const FAQ_SCHEMA_ITEMS = [
  { q: "How does an FHA loan calculator work?", a: "It takes your home price, down payment, rate and term, works out the loan amount, then adds the upfront and annual mortgage insurance premiums. It also includes property taxes, homeowners insurance, HOA dues and other costs to give you a total monthly payment." },
  { q: "Can you get an FHA loan with no down payment?", a: "Not on your own. FHA requires at least 3.5% down. But that 3.5% can come entirely from a gift or a down payment assistance grant, so you may not have to use your own savings. For zero down, look at VA loans for eligible veterans and service members, or USDA loans for qualifying rural properties." },
  { q: "How much down payment does a VA loan need compared to FHA?", a: "VA loans allow 0% down for eligible borrowers, versus 3.5% for FHA. VA loans have no monthly mortgage insurance but charge a one-time funding fee, which runs from roughly 1.25% to 3.3% depending on the down payment and whether it is a first VA loan." },
  { q: "Can I use an FHA loan to buy an investment property or rental?", a: "Not a pure investment. FHA is for owner-occupied homes, and you are expected to move in within 60 days of closing and live there for at least a year. You can buy a two-, three- or four-unit property, live in one unit and rent out the others." },
  { q: "Can you remove MIP from an FHA loan?", a: "With 10% or more down, annual MIP ends after 11 years. With less than 10% down, it lasts for the life of the loan. Many borrowers refinance into a conventional loan once they have enough equity and a good credit score." },
  { q: "What is the minimum down payment for an FHA loan?", a: "It is 3.5% with a credit score of 580 or higher. Scores from 500 to 579 generally require 10% down. Many lenders set their own higher minimum scores." },
  { q: "Is there an asset limit for FHA loans?", a: "No. There is no cap on savings or investments you can have and still qualify. You do need documented funds for the down payment, closing costs and often a few months of reserves." },
  { q: "What are the FHA loan limits for 2026?", a: "For one-unit homes it is $541,287 in most counties and up to $1,249,125 in high-cost areas. Two-, three- and four-unit homes have higher limits. Check your county on HUD's lookup tool." },
  { q: "What happens to an FHA mortgage when you sell the house?", a: "In most sales the loan is paid off from the proceeds at closing, and there is no prepayment penalty. FHA loans are also assumable, so a qualified buyer can take over the loan and its rate with lender approval." },
  { q: "Is this FHA loan calculator free?", a: "Yes, it is free, and you can run as many scenarios as you like. The result is an estimate for planning, not a loan offer." },
];

const MIP_HEADERS = ["Base loan amount", "Loan-to-value (LTV)", "Annual MIP"];
const MIP_LONG_ROWS = [
  ["$726,200 or less", "95% or less", "0.50%"],
  ["$726,200 or less", "More than 95%", "0.55%"],
  ["More than $726,200", "95% or less", "0.70%"],
  ["More than $726,200", "More than 95%", "0.75%"],
];
const MIP_SHORT_ROWS = [
  ["$726,200 or less", "90% or less", "0.15%"],
  ["$726,200 or less", "More than 90%", "0.40%"],
  ["More than $726,200", "78% or less", "0.15%"],
  ["More than $726,200", "78% to 90%", "0.40%"],
  ["More than $726,200", "More than 90%", "0.65%"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const firstH3 = { ...h3Style, marginTop: 0 };
const captionStyle = { ...h3Style, fontSize: 13.5, margin: "4px 0 6px" };
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

export default function FhaLoanCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This FHA Loan Calculator Shows You</h2>
        <p style={pStyle}>
          A basic mortgage calculator takes a loan amount and a rate and spits out principal and interest. That’s fine for a
          ballpark, but it skips the stuff that makes an FHA loan different. An FHA mortgage calculator has to handle two
          separate mortgage insurance charges, and it has to count the recurring housing costs a lender looks at when
          deciding whether you qualify.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This one starts with your home price and down payment, works out the base loan, adds the upfront premium, applies
          the annual premium, then layers on taxes, insurance, HOA and anything else you enter. What comes out is the number
          that matters: the total that leaves your bank account each month, not just the part that goes to the lender.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the FHA Mortgage Payment Is Built</h2>
        <h3 style={firstH3}>Principal and interest</h3>
        <p style={pStyle}>
          This is the core of the payment. It depends on how much you borrow, your rate and your term, usually 30 years or 15.
          Early on, most of each payment goes to interest. Over time that flips, and the amortization schedule below the
          calculator shows you exactly how.
        </p>
        <h3 style={h3Style}>Upfront mortgage insurance premium (UFMIP)</h3>
        <p style={pStyle}>
          Every FHA loan has an upfront premium of 1.75% of the base loan amount. Most buyers don’t write a check for it at
          closing. It gets rolled into the loan, which means you pay interest on it for as long as you have the mortgage. The
          calculator adds it for you, so your financed balance and payment reflect the real number and not the smaller base
          amount.
        </p>
        <h3 style={h3Style}>Annual mortgage insurance premium (MIP)</h3>
        <p style={pStyle}>
          The annual premium is a percentage of your loan, split into 12 monthly pieces and tacked onto your payment. The rate
          depends on your loan size, term and down payment, and you’ll find the full 2026 table further down this page. For
          the most common setup, a 30-year loan under $726,200 with less than 5% down, it’s 0.55% a year.
        </p>
        <h3 style={h3Style}>Property taxes, homeowners insurance and HOA dues</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most lenders collect taxes and insurance through an escrow account, so they show up inside your monthly bill. Add an
          HOA or condo fee and your housing cost can jump by a few hundred dollars. The calculator has fields for each, plus an
          “other costs” line for things like flood insurance or a maintenance cushion. Leaving these out is the number one
          reason buyers lowball their payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example</h2>
        <p style={pStyle}>
          Say you’re buying a $350,000 home with 3.5% down, which is $12,250. Your base loan is $337,750. The upfront premium
          at 1.75% comes to about $5,911, and rolling it in puts your financed balance at roughly $343,661.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          At a 6.25% rate over 30 years, principal and interest runs about $2,116 a month. Annual MIP at 0.55% of the base loan
          is around $1,858 in year one, or about $155 a month. So before you add a dime of taxes, insurance or HOA dues, you’re
          already near $2,271. These are illustrations, not a quote. But they show why a calculator that stops at principal
          and interest can be off by $150 or more a month before it even gets to the rest of your housing costs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This FHA Loan Calculator</h2>
        <p style={pStyle}>
          Start with the home price and your down payment, either as a dollar amount or a percentage. If you’re not sure what
          to enter, 3.5% is the floor for borrowers with a 580 credit score or higher. Then put in the interest rate you’ve
          been quoted (or a realistic current estimate if you haven’t shopped yet) and pick your loan term.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Next, fill in the recurring costs. Use the property tax figure from the listing or your county’s rate, get an
          insurance estimate from an agent, and add any HOA dues. If you want to pay extra toward principal, enter that amount
          and see how much sooner you’d finish and how much interest you’d skip. The results update as you change each field,
          so try a few versions: a bigger down payment, a shorter term, a slightly different rate. Look for the monthly
          number that feels comfortable, not just the one a lender might approve.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What an FHA Loan Actually Is (and Whether It’s Legit)</h2>
        <p style={pStyle}>
          An FHA loan is a regular mortgage from a bank, credit union or mortgage company that’s insured by the Federal
          Housing Administration. Here’s the part people mix up: the FHA doesn’t lend you money. It insures the lender. If you
          stop paying and the home sells for less than you owe, the government covers the lender’s loss. Because the lender’s
          risk is lower, they’re willing to approve borrowers with smaller down payments and less-than-perfect credit.
        </p>
        <p style={pStyle}>
          The agency was created in 1934, in the middle of the Great Depression, to get more Americans into homes and steady
          a housing market that had basically collapsed. It’s now part of HUD, and it’s one of the largest mortgage insurers
          in the world.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So, is it legit or a scam? It’s legit. It’s a federal program with published rules (HUD’s Handbook 4000.1 spells
          them out), and you can look up loan limits and approved lenders on HUD’s own site. Where people get burned isn’t the
          program, it’s the middlemen. Be careful with anyone who promises guaranteed approval, charges big upfront fees
          before doing any work, tells you to lie on an application, or pushes “FHA-backed” offers through random calls and
          mailers. A real lender gives you a Loan Estimate that spells out your costs. If someone dodges giving you one, walk
          away.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You Still Pay Mortgage Insurance If the FHA Insures the Loan</h2>
        <p style={pStyle}>
          This trips up a lot of people, and it’s a fair question. The insurance protects the lender, not you. You’re the one
          paying the premium, but if you default, the benefit goes to the bank. It’s how the FHA funds the whole program.
          Instead of using taxpayer money, premiums from borrowers go into an insurance fund that covers losses on the loans
          that go bad.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That’s also why you can’t skip it. Every FHA loan has both the upfront and annual premium, no matter how strong your
          credit is.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>2026 FHA Annual MIP Rates</h2>
        <p style={pStyle}>
          The table below shows the annual premium rates HUD set in March 2023 (Mortgagee Letter 2023-05), which are still the
          ones in effect. Rates are applied to your base loan amount.
        </p>
        <p style={captionStyle}>Loan term longer than 15 years</p>
        <DataTable headers={MIP_HEADERS} rows={MIP_LONG_ROWS} />
        <p style={captionStyle}>Loan term of 15 years or less</p>
        <DataTable headers={MIP_HEADERS} rows={MIP_SHORT_ROWS} />
        <p style={pStyle}>
          How long you pay it matters just as much as the rate. If your LTV at the start is 90% or lower (a down payment of 10%
          or more), annual MIP drops off after 11 years. If you put down less than 10%, it stays for the life of the loan.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You may see advice online that MIP goes away once you hit 20% equity, like private mortgage insurance on a
          conventional loan. It doesn’t. On an FHA loan with a small down payment, the only ways out are refinancing into a
          conventional loan or paying the mortgage off. If you’re planning to hold the house a long time, this is the single
          biggest long-term cost of going to FHA, and it’s why the calculator shows the premium separately.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FHA Loan Requirements: Down Payment, Credit, Assets and Minimum Loan Size</h2>
        <h3 style={firstH3}>What’s the minimum down payment for an FHA loan?</h3>
        <p style={pStyle}>
          It’s 3.5% of the purchase price if your credit score is 580 or higher. If your score falls between 500 and 579, you
          generally need 10% down. Plenty of lenders set their own minimum scores above 580, often 620 or higher, so you may
          need to shop around if your credit is on the lower side. Those extra rules are called lender overlays, and they vary
          a lot.
        </p>
        <p style={pStyle}>
          The money can come from savings, a gift from a relative, an employer, a close friend with a documented relationship,
          or a down payment assistance program from a state or local housing agency. Lenders will want to see where it came
          from, and a gift letter is usually required.
        </p>
        <h3 style={h3Style}>Is there a minimum loan amount for an FHA loan?</h3>
        <p style={pStyle}>
          The FHA itself doesn’t set a minimum loan size. Individual lenders do, though, and it’s common to see floors
          somewhere between $50,000 and $100,000 because tiny loans aren’t worth their processing costs. If you’re buying a
          lower-priced home, ask about it up front.
        </p>
        <h3 style={h3Style}>Is there an asset limit for FHA loans?</h3>
        <p style={pStyle}>
          No. There’s no cap on how much savings, investments or retirement money you can have and still qualify. FHA isn’t an
          income-tested or asset-tested welfare program. What you do need is enough documented money for the down payment,
          closing costs and, in many cases, a few months of reserves. Lenders pay close attention to large unexplained
          deposits in your bank statements, so if a big sum lands in your account during the process, be ready to show where
          it came from.
        </p>
        <h3 style={h3Style}>Do you need a minimum income?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There’s no dollar amount you have to earn. But you do need stable, documentable income, and your total debts have to
          fit within FHA’s ratios, which is the next section.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FHA Loan Limits for 2026</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a one-unit home, 2026 FHA limits run from a floor of $541,287 in most counties up to $1,249,125 in high-cost
          areas. Two-unit homes go from $693,050 to $1,599,375. Three- and four-unit properties have higher limits still. Where
          your county lands between the floor and the ceiling depends on local home prices, so use HUD’s FHA mortgage limit
          lookup and pick “FHA Forward” and the current year. Limits get adjusted each December. If you’re shopping in a
          pricey area, test your numbers in the calculator and see how close you are to your county’s cap.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How FHA Looks at Income and Debt, and Why Lenders Want Your Pay Stubs</h2>
        <p style={pStyle}>
          Lenders measure two ratios. The front-end ratio is your housing payment (principal, interest, MIP, taxes, insurance,
          HOA) divided by your gross monthly income. The back-end ratio adds in your other monthly debts, like car loans,
          student loans and credit card minimums. The standard FHA benchmark is 31% front-end and 43% back-end.
        </p>
        <p style={pStyle}>
          Those aren’t hard walls. If your loan runs through an automated underwriting system and you’ve got strong
          compensating factors, borrowers get approved with back-end ratios much higher than 43%, sometimes into the mid-50s.
          Compensating factors that help include:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>A bigger down payment than the 3.5% minimum.</li>
          <li style={liStyle}>A track record of paying rent or a mortgage that’s as high as or higher than your new payment.</li>
          <li style={liStyle}>Solid cash reserves, often at least three months of mortgage payments.</li>
          <li style={liStyle}>A strong credit score.</li>
          <li style={lastLi}>Little or no other debt.</li>
        </ul>
        <p style={pStyle}>
          So no, FHA doesn’t have loose rules on debt. It’s more flexible than a lot of conventional lenders, but it’s still
          checking that you can really carry the payment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Why do lenders want pay stubs if they already have your W-2? Because they’re looking at two different time frames.
          Your W-2 shows what you earned last year. Your pay stubs show what you earn right now, including your year-to-date
          total, overtime, bonuses and deductions. If you got a raise, changed jobs or lost hours, the W-2 won’t show it.
          Lenders also verify your employment by phone or email shortly before closing, and if anything changes, the loan can
          stall. So don’t switch jobs or take on new debt between application and closing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why FHA Loans Are Popular with First-Time Buyers</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The short answer is that saving for a down payment is the biggest roadblock for most first-timers, and FHA lowers
          that wall. Putting down 3.5% on a $300,000 house is $10,500, versus $60,000 for 20%. Add in the more forgiving credit
          rules, the option to use gift funds and assistance programs, and the ability to have a seller pay up to 6% of the
          price toward closing costs, and you can see why so many first-time buyers go this route. HUD’s own reports have
          shown that a large majority of FHA purchase loans go to first-time buyers, in the neighborhood of eight in ten in
          recent years.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FHA vs. Conventional Loans: Pros and Cons</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}><strong>The upsides</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Down payments start at 3.5%.</li>
          <li style={liStyle}>Credit scores of 580 can qualify, sometimes lower with a bigger down payment.</li>
          <li style={liStyle}>No prepayment penalty, so you can pay ahead anytime.</li>
          <li style={liStyle}>Higher allowed debt-to-income ratios when your file has strong compensating factors.</li>
          <li style={liStyle}>Rates are often competitive with conventional rates, especially for buyers with average credit.</li>
          <li style={lastLi}>FHA loans are assumable, which can be a real selling point if rates rise.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}><strong>The downsides</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Mortgage insurance is costly and hard to shake. You’ll pay upfront and annual premiums, and with less than 10% down, the annual one lasts as long as the loan.</li>
          <li style={liStyle}>Loan limits are lower than conventional limits, which can box you out of expensive markets.</li>
          <li style={liStyle}>If your credit is excellent and you’ve got a 5% or more down payment, a conventional loan may cost less per month, since private mortgage insurance gets cheaper as scores go up and goes away at 78% to 80% of the home’s value.</li>
          <li style={liStyle}>The home has to meet HUD minimum property standards for safety, soundness and security. A house with peeling paint on an older home, a failing roof or no working heat can hold up your closing until it’s fixed.</li>
          <li style={lastLi}>Some sellers still prefer conventional offers, thinking FHA appraisals and inspections add hassle. In a hot market that can matter, though a strong offer and a quick closing can offset it.</li>
        </ul>
        <h3 style={h3Style}>Why FHA isn’t always the cheapest option, and will that change?</h3>
        <p style={pStyle}>
          Conventional lenders have been competing hard for first-time buyers with low-down-payment options of their own,
          including programs from Fannie Mae and Freddie Mac that allow as little as 3% down. For borrowers with good credit,
          those loans can beat FHA because the insurance gets cancelled later. FHA wins when your credit is shaky, your debt
          is higher, or you need a bigger break on qualifying.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether that shifts depends on HUD policy. Premiums have moved before, with big cuts in 2015 and again in 2023.
          Another cut is possible but not something to count on. The best move is to price both options with your real
          numbers. Run the FHA payment in this calculator, then ask a lender for a conventional quote on the same home and
          compare the monthly cost and the total cost over the years you expect to own.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Extra Payments and the Bi-Weekly Comparison</h2>
        <p style={pStyle}>
          FHA loans don’t carry a prepayment penalty, so paying extra is one of the easiest ways to cut your total interest.
          Even a modest amount added to principal each month shortens your loan and trims the interest. The extra-payment
          feature shows your new payoff date and what you’d save, so you can decide if it fits your budget. We’d only suggest
          doing it if you’ve got an emergency fund and aren’t stretching to afford it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The bi-weekly comparison models pay half your monthly payment every two weeks. There are 26 two-week periods in a
          year, so you end up making 26 half payments, which equals 13 full ones instead of 12. That extra payment goes
          straight to the principal. Before you count on it, check with your servicer. Some don’t offer true bi-weekly plans,
          and some charge a fee to set one up. You can get nearly the same result by adding one-twelfth of your payment to
          each month or making one extra principal payment a year. Just make sure any extra money is labeled as “principal
          only” so it doesn’t get treated as an early payment on next month’s bill.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading the FHA Loan Amortization Schedule</h2>
        <p style={pStyle}>
          The amortization schedule breaks every payment into interest, principal and remaining balance. It’s the best way to
          see past the first month. You can see how little principal you pay in the early years, when you’d hit 20% equity,
          and how extra payments change the whole path.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also helps with the MIP question. If you put down 10% or more, you can spot the month the 11-year premium period
          ends. If you put down less, you can see how much equity you’d have in five or seven years and decide whether a
          refinance into a conventional loan, which can drop mortgage insurance once you’ve got enough equity and the credit
          to qualify, would make sense down the road.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FHA 203(k) Loans for Fixer-Uppers</h2>
        <p style={pStyle}>
          An FHA 203(k) loan lets you buy a home that needs work, or refinance the one you’ve got, and roll the repair costs
          into a single mortgage. You’ve got one loan, one payment and one closing instead of a mortgage plus a separate
          renovation loan.
        </p>
        <p style={pStyle}>
          The loan funds go into an escrow account and get paid out to contractors as the work gets done. You’ve got six
          months to finish the repairs. A standard 203(k) is for bigger projects, requires at least $5,000 in eligible work,
          and uses a HUD-approved consultant to oversee the job. It can also include up to six months of mortgage payments if
          you can’t live in the home during construction. The Limited 203(k), the smaller version some people call the
          streamlined 203(k), is meant for lighter repairs like a new roof, flooring or updated appliances, has a lower
          spending cap, and doesn’t need a consultant. It’s much quicker to set up. Check HUD for the current cap on the
          limited program, since it can change.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both versions have the same mortgage insurance and the same basic qualifying rules as a regular FHA loan, plus a few
          extra fees for the renovation side. If you want to estimate a 203(k) in this calculator, enter the purchase price
          plus the renovation budget as your total loan base to get a rough payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You’d Use an FHA Mortgage Calculator</h2>
        <p style={pStyle}>
          Most people grab one at a few specific moments. First-time buyers use it to compare 3.5% down against a bigger down
          payment and see whether the cash saved is worth the higher insurance cost. Renters use it to stack a likely mortgage
          against current rent before they start touring homes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Buyers with a pre-approval use it to test offers. A $15,000 difference in price changes your monthly payment by a
          small but real amount, and you’ll see it instantly. Current FHA homeowners use it to see what an extra $100 a month
          would do to their payoff date. People deciding between FHA and conventional enter the same home price in both and
          compare how the insurance works out. Agents and loan officers also lean on calculators like this in early
          conversations, before there’s a formal Loan Estimate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, Straight About Its Limits</h2>
        <p style={pStyle}>
          The Tolz FHA loan calculator is free, and you can run as many scenarios as you want. It’s built to give a realistic
          estimate using FHA’s insurance structure and the housing costs you enter. That means the results are only as good
          as your inputs. Your actual payment will depend on your lender’s rate, your credit profile, your local tax
          assessment, your insurance quote and the MIP schedule in effect when you close.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Use the results for planning, then confirm the real numbers with a licensed lender. The Loan Estimate that lenders
          have to give you after you apply is the document to trust for exact figures. If you spot a rule or rate that’s
          changed since this page was updated, plug in the new numbers. HUD resets loan limits every year and can adjust
          insurance rates when it wants.
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
