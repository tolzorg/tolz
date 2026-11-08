import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my monthly personal loan payment?",
    a: "Enter the loan amount, interest rate, and term into the calculator above. It uses the standard amortization formula and gives you the payment, total interest, and payoff date instantly.",
  },
  {
    q: "What’s the difference between interest rate and APR?",
    a: "The interest rate is the cost of borrowing the principal. APR adds in fees like the origination fee, so it shows the true yearly cost. This calculator also includes insurance to get your real APR.",
  },
  {
    q: "How much is an origination fee on a personal loan?",
    a: "It commonly runs from about 1% to 10% of the loan amount, and it’s usually deducted from your funds. Enter it in the calculator to see how it raises your APR.",
  },
  {
    q: "What is a good personal loan payment?",
    a: "One that fits comfortably in your budget without pushing your debt-to-income ratio too high. On $6,000 over five years, payments range from roughly $122 at 8% to $194 at 30%, so your rate matters a lot.",
  },
  {
    q: "Is a longer term better?",
    a: "It lowers your monthly payment but increases total interest. A shorter term does the opposite. Choose based on what you can afford each month and how much total cost you’ll accept.",
  },
  {
    q: "Can I use this for debt consolidation?",
    a: "Yes. Enter the total you’re rolling together, plus the offered rate, term, and fee. Compare the real APR and total interest against your current debts. It only helps if the overall cost drops.",
  },
  {
    q: "How can I pay off a personal loan faster?",
    a: "Make extra principal payments, pick a shorter term, or pay biweekly if your lender allows it. Check the schedule to see the savings, and confirm there’s no prepayment penalty.",
  },
  {
    q: "Does a personal loan calculator affect my credit score?",
    a: "No. It’s just a planning tool. Only a formal application can lead to a hard inquiry.",
  },
  {
    q: "What is an amortization schedule?",
    a: "It’s a table of every payment showing interest, principal, and remaining balance. It shows how your balance falls over time.",
  },
  {
    q: "Does this work as an EMI calculator?",
    a: "Yes. EMI, or equated monthly installment, is the fixed monthly payment on an amortizing loan, so the monthly payment result is your EMI.",
  },
  {
    q: "Are personal loans secured or unsecured?",
    a: "Most are unsecured, with no collateral. Secured versions exist, usually from banks and credit unions, and use a car, savings, or a CD as collateral.",
  },
  {
    q: "What credit score do I need for a personal loan?",
    a: "It depends on the lender. Better scores get lower rates, and lower scores mean fewer options and higher costs. Some lenders also weigh income, employment, and DTI.",
  },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate my monthly personal loan payment?": {
    a: "Enter the loan amount, interest rate, and term into the calculator. It uses the standard amortization formula and gives you the payment, total interest, and payoff date instantly.",
  },
  "How much is an origination fee on a personal loan?": {
    a: "It commonly runs from about 1% to 10% of the loan amount and is usually deducted from your funds. Enter it in the calculator to see how it raises your APR.",
  },
  "Is a longer term better?": {
    q: "Is a longer loan term better?",
    a: "A longer term lowers your monthly payment but increases total interest. A shorter term does the opposite. Choose based on what you can afford each month and how much total cost you'll accept.",
  },
  "Can I use this for debt consolidation?": { q: "Can I use this calculator for debt consolidation?" },
  "Does a personal loan calculator affect my credit score?": {
    a: "No. It's just a planning tool. Only a formal loan application can lead to a hard inquiry.",
  },
};

const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => {
  const o = FAQ_SCHEMA_OVERRIDES[item.q] || {};
  return { q: straight(o.q ?? item.q), a: straight(o.a ?? item.a) };
});

const PAYMENT_HEADERS = ["Term", "Credit tier", "Sample APR", "Monthly payment", "Total interest"];
const PAYMENT_ROWS = [
  ["3 years", "Excellent", "8%", "$188", "about $770"],
  ["3 years", "Good", "12%", "$199", "about $1,175"],
  ["3 years", "Fair", "20%", "$223", "about $2,030"],
  ["3 years", "Bad", "30%", "$255", "about $3,170"],
  ["5 years", "Excellent", "8%", "$122", "about $1,300"],
  ["5 years", "Good", "12%", "$133", "about $2,010"],
  ["5 years", "Fair", "20%", "$159", "about $3,540"],
  ["5 years", "Bad", "30%", "$194", "about $5,650"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
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

export default function PersonalLoanCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Personal Loan Calculator Shows You</h2>
        <p style={pStyle}>You get five things from one set of inputs.</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Monthly payment.</strong> This is the first thing most people check, because it has to fit your budget.</li>
          <li style={liStyle}><strong>Total interest.</strong> This is the real price of borrowing. Two loans can have the same payment and very different total costs if the terms are different.</li>
          <li style={liStyle}><strong>Payoff date.</strong> “60 months” is abstract. “Final payment in November 2031” isn’t.</li>
          <li style={liStyle}><strong>Amortization schedule.</strong> A payment-by-payment table showing how much of each installment goes to interest and how much pays down your balance.</li>
          <li style={lastLi}><strong>Real APR.</strong> Many personal loans come with an origination fee, and some come with insurance. Both push the actual cost above the quoted rate. The calculator rolls them into one annual percentage rate so you can compare offers fairly.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Calculator</h2>
        <p style={pStyle}>
          Start with the three basics: the loan amount, the interest rate, and the term. That’s enough for a payment, total
          interest, and payoff date.
        </p>
        <p style={pStyle}>
          If your offer has an origination fee, add it as a percentage or a flat dollar amount. If the lender is selling
          credit life, disability, or job-loss coverage, add that cost too. You’ll then see your nominal rate and your real
          APR side by side.
        </p>
        <p style={pStyle}>Then start changing things, one at a time:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Compare rates.</strong> Personal loan rates run from the low single digits for borrowers with excellent credit to the mid-30s for those with weak credit. Plug in a few rates and see how the payment moves. That helps you decide what you’re actually willing to accept before a lender quotes you.</li>
          <li style={liStyle}><strong>Compare terms.</strong> Terms generally run from one year to seven. A short term means a bigger payment and less interest. A long term gives you a smaller payment and costs more overall.</li>
          <li style={liStyle}><strong>Fine-tune the amount.</strong> An extra $5,000 might not hurt on a seven-year term but could blow up a three-year plan. Sometimes the smarter move is to cover part of the expense with cash and borrow less.</li>
          <li style={lastLi}><strong>Check the total, not just the payment.</strong> If you’re saving for retirement, a house, or a kid’s tuition, make sure the loan’s total cost doesn’t eat into those goals.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Monthly Payment Is Calculated</h2>
        <p style={pStyle}>
          Most personal loans are fixed-rate installment loans, so the payment comes from a standard formula:
        </p>
        <div style={formulaStyle}>M = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)</div>
        <p style={pStyle}>
          P is the amount you borrow, r is the monthly rate (the annual rate divided by 12), and n is the number of monthly
          payments.
        </p>
        <p style={pStyle}>
          Here’s a real example. You borrow $15,000 at 11% for 48 months. The monthly rate is about 0.9167%, which gives you
          a payment of around $387.60. Over four years you’d pay back about $18,606, so roughly $3,600 of that is interest.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Now stretch it to 60 months. The payment drops to about $326, which feels a lot easier. But total interest climbs
          to around $4,570, so that $61 a month in relief costs you about $970 more. Sometimes that’s worth it. You should
          still see the number before you decide.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Good Personal Loan Payment?</h2>
        <p style={pStyle}>
          There’s no universal answer, because personal loans have one of the widest rate ranges of any loan product. Your
          credit decides a lot of it. This table shows a $6,000 loan at sample rates for different credit tiers. The rates
          are illustrations, not quotes, and actual offers vary by lender.
        </p>
        <DataTable headers={PAYMENT_HEADERS} rows={PAYMENT_ROWS} />
        <p style={pStyle}>
          A few things jump out. A borrower with bad credit on a five-year term pays more in interest than the original
          $6,000 loan was worth, close to it anyway. And stretching from three to five years at 8% costs an extra $530 or so
          in interest, while at 30% it costs about $2,480 more.
        </p>
        <p style={pStyle}>
          So how do you decide? If you need the lowest payment possible, go with the longer term. If you can handle the
          bigger payment, the shorter term gets you out of debt sooner and saves real money.
        </p>

        <h3 style={h3Style}>A quick sanity check with your income</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders care a lot about your debt-to-income ratio (DTI), which is your total monthly debt payments divided by your
          gross monthly income. Say you earn $4,500 a month and already pay $900 toward a car loan and credit cards. Add a
          $356 loan payment and your DTI goes from 20% to about 28%. Many lenders get cautious once DTI climbs past the high
          30s or low 40s, so run this math before you apply, not after a rejection.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading the Amortization Schedule</h2>
        <p style={pStyle}>
          An amortization schedule lists every payment and splits it into interest and principal. Early on, most of your
          payment goes to interest because the balance is still large. Over time that flips, and by the last few payments
          almost all of it is principal.
        </p>
        <p style={pStyle}>That’s useful for a few reasons:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Early payoff math.</strong> The schedule shows your remaining balance at any month, so you know what you’d owe if you wanted to pay it off.</li>
          <li style={liStyle}><strong>Extra payments work best early.</strong> Every dollar of principal you knock out in month 6 stops generating interest for the remaining years. In the $15,000 example, adding $50 a month would cut the loan from 48 months to roughly 41 and save around $500 in interest. That assumes your lender doesn’t charge a prepayment penalty and applies the extra to principal.</li>
          <li style={lastLi}><strong>A reality check on the paperwork.</strong> If the lender’s payment doesn’t match the calculator’s, the usual reasons are financed fees, rounding, or a different first payment date. It’s worth asking them to explain the gap.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fees, Insurance, and the Real APR</h2>
        <p style={pStyle}>
          Rate and APR aren’t the same thing. The interest rate is the cost of the money. APR is supposed to capture the
          yearly cost including certain fees. In practice, optional insurance often isn’t counted, and a lot of ads lead with
          the lowest rate they can show.
        </p>
        <p style={pStyle}>The common fees on a personal loan:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Origination fee.</strong> Some lenders call it an application fee. It covers processing and usually runs from about 1% to 10% of the loan, though a few lenders go higher. Most lenders deduct it from your funds after approval, so you get less than you borrowed but still repay the full amount. Borrow $10,000 with a 3% fee and you receive $9,700.</li>
          <li style={liStyle}><strong>Prepayment penalty.</strong> This is charged if you pay off the loan early. It’s rare these days, but check your contract.</li>
          <li style={liStyle}><strong>Late fee.</strong> It can be a flat amount or a percentage of the payment. If you know you’ll miss a due date, call the lender first. Some will work with you.</li>
          <li style={lastLi}><strong>Optional insurance.</strong> Some lenders offer coverage for death, disability, or job loss. It can make sense for some people, but it isn’t required, and it does add to the cost.</li>
        </ul>

        <h3 style={h3Style}>Why the APR jumps</h3>
        <p style={pStyle}>
          Take the same $15,000, 11%, 48-month loan with a 5% origination fee. The fee is $750, so you receive $14,250 but
          still owe $15,000 and still pay about $387.60 a month. You’re making the same payments on less usable money, which
          pushes your real APR to roughly 13.8%. That’s nearly three points above the rate that looked so competitive.
        </p>

        <h3 style={h3Style}>If you need a specific amount</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Since the fee comes out of your funds, borrow a bit extra to cover it. The formula is simple: divide the amount you
          need by (1 minus the fee percentage). Need $10,000 with a 5% fee? Borrow $10,000 ÷ 0.95, which is about $10,526.
          Then check what the extra does to your payment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Exactly Is a Personal Loan?</h2>
        <p style={pStyle}>
          A personal loan gives you a fixed amount up front, at a fixed rate, with fixed monthly payments over a set term. In
          the U.S., amounts typically fall between about $5,000 and $35,000, though some lenders go lower or higher, and
          terms are usually three to five years.
        </p>

        <h3 style={h3Style}>Unsecured vs. secured</h3>
        <p style={pStyle}>
          Most personal loans are unsecured, meaning there’s no collateral. The lender decides based on your credit score,
          income, existing debt, and similar factors. Since the lender has nothing to seize if you stop paying, rates run
          higher, sometimes 25% or more for riskier borrowers.
        </p>
        <p style={pStyle}>
          Secured personal loans exist too, though they’re less common. Banks and credit unions may offer them backed by a
          car, a savings account, or a certificate of deposit. The upside is usually a better rate or a bigger limit. The
          downside is obvious: miss payments and you can lose the collateral. This calculator is built mainly for unsecured
          loans, but it works fine for secured ones as long as you enter the rate, term, and fees correctly.
        </p>

        <h3 style={h3Style}>Bank and credit union loans</h3>
        <p style={pStyle}>
          Before the internet, personal loans came almost entirely from banks, credit unions, and finance companies. They
          take in deposits like savings, checking, and CDs, then lend that money out at higher rates. Pawnshops and payday
          stores also make personal loans, but at much higher costs.
        </p>

        <h3 style={h3Style}>Peer-to-peer lending</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Online peer-to-peer (P2P) platforms match borrowers with individual or institutional lenders. The platform doesn’t
          lend its own money. It acts as the middleman and takes a cut. Because these companies run mostly online without
          branches, their costs are lower, and that sometimes shows up in better terms. The investors who fund the loans, not
          the platform, take the hit if you default.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why People Take Out Personal Loans</h2>
        <p style={pStyle}>
          Roughly half of personal loans go toward debt consolidation. Here’s why that’s popular. Personal loan rates are
          often lower than credit card rates, so rolling several card balances into one loan can cut your interest cost and
          give you one fixed payment with a clear end date.
        </p>
        <p style={pStyle}>
          Here’s a real example. Someone has an $8,000 balance on a card at 19.99% and $7,000 on another at 24.99%. That’s a
          blended rate of about 22.3%. A lender offers $16,000 for five years at 12% with a 5% origination fee. The fee takes
          $800, leaving $15,200, which covers both cards with a little left over. The monthly payment comes to about $356,
          and the real APR works out to roughly 14.3%. That’s still well under both card rates. Without the APR calculation,
          you might only see the 12% and underestimate the cost.
        </p>
        <p style={pStyle}>A few caveats on consolidation:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Check the total, not just the payment.</strong> A longer term can lower the payment while raising total interest.</li>
          <li style={liStyle}><strong>Don’t run the cards back up.</strong> Paying them off and then charging them again leaves you with the loan and the card debt.</li>
          <li style={lastLi}><strong>Compare using APR.</strong> A 10% loan with a 7% fee may cost more than a 12% loan with no fee.</li>
        </ul>
        <p style={pStyle}>
          Other common uses include medical bills, home repairs and improvements, weddings, moving costs, boats and RVs,
          vacations, and small business expenses.
        </p>
        <p style={pStyle}>
          On home projects, seeing the actual payment may push you to pay cash for some of the work and borrow less. Or it
          may show you can afford a bigger project without touching your home equity.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On big life events, a personal loan gives you a set payment and a payoff date. Making minimum payments on a credit
          card usually leaves you carrying the balance for much longer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Credit, Applying, and Getting the Money</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>How credit affects your offer</h3>
        <p style={pStyle}>
          Your creditworthiness is the biggest factor in both approval and your rate. Good or excellent credit gets you the
          best offers. Lower scores mean fewer lenders and worse terms. Missing payments on a personal loan can hurt your
          score just like any other debt. Some lenders look beyond the score and also consider income, DTI, and employment
          history, which can help if your credit is thin.
        </p>

        <h3 style={h3Style}>Check your rate without hurting your score</h3>
        <p style={pStyle}>
          Most lenders offer prequalification with a soft credit check, which doesn’t affect your score. A formal application
          triggers a hard inquiry. If you’re comparing lenders, do your formal applications close together. Scoring models
          usually treat multiple loan inquiries in a short window as one, though the window varies, often somewhere between
          14 and 45 days.
        </p>

        <h3 style={h3Style}>The application</h3>
        <p style={pStyle}>
          Expect to provide personal details, employment and income information, and permission to pull your credit. Lenders
          often verify with tax returns, recent pay stubs, W-2s, or a personal financial statement. Most take applications
          online. Some decide instantly, while others take days. You’ll get approved, rejected, or approved with conditions,
          such as extra documents.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If approved, funding can happen in as little as a day. The money usually lands in your checking account as a lump
          sum. Some lenders send a check or load a prepaid card. Read the contract for any limits on how you can use the
          money.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Avoiding Predatory and Fraudulent Loans</h2>
        <p style={pStyle}>Some lenders aren’t legitimate, and some are legal but extremely expensive. Red flags:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>No credit check at all.</strong> A real lender wants to see your credit or at least verify your income.</li>
          <li style={liStyle}><strong>Unsolicited offers by phone or mail.</strong> These deserve extra suspicion.</li>
          <li style={liStyle}><strong>Fees up front before you get any money.</strong> A lender asking you to pay before funding is a classic scam setup.</li>
          <li style={lastLi}><strong>Payday loans, auto title loans, cash advances, and no-credit-check loans.</strong> These typically carry extremely high rates, heavy fees, and very short terms, and people often end up renewing them over and over.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you’re short on options, a federal credit union’s payday alternative loan is a much safer choice. Those have
          capped rates, though you generally need to be a member.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Alternatives to a Personal Loan</h2>
        <p style={pStyle}>Before signing, or if nobody will approve you, consider these:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Family or friends.</strong> They may lend at little or no interest. Put the terms in writing so the relationship doesn’t take the hit.</li>
          <li style={liStyle}><strong>A cosigner.</strong> Someone with good credit and stable income can help you qualify. But if you miss payments, they’re on the hook. Don’t ask lightly.</li>
          <li style={liStyle}><strong>0% intro APR credit cards.</strong> If you can pay off the balance before the promotional period ends, you’ll pay no interest. Watch for balance transfer fees (often 3% to 5%) and mark the date the promo ends.</li>
          <li style={liStyle}><strong>Secured borrowing.</strong> Using a home, car, or other asset as collateral can get you better rates and larger amounts. A home equity line of credit (HELOC) is a common option. The risk is losing the asset, and with a HELOC that could mean foreclosure.</li>
          <li style={liStyle}><strong>Nonprofits and community organizations.</strong> Religious groups and local charities sometimes help people through rough patches.</li>
          <li style={lastLi}><strong>Crowdfunding.</strong> No repayment, but it’s hard to pull off. It tends to work best for personal stories, new ventures, or disaster relief.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Get a Lower Rate and Cost</h2>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Improve your credit first if you can wait.</strong> Check your reports for mistakes, pay down credit card balances, and avoid new applications in the months before.</li>
          <li style={liStyle}><strong>Pick the shortest term you can comfortably afford.</strong> Run a few terms through the calculator and find the point where the payment is manageable but the loan isn’t dragging on.</li>
          <li style={liStyle}><strong>Shop several lenders.</strong> Use soft-pull prequalification and compare real APRs, not headline rates.</li>
          <li style={liStyle}><strong>Look for no-fee offers.</strong> A slightly higher rate with no origination fee can beat a lower rate with a big fee, and the APR figure will show you which.</li>
          <li style={liStyle}><strong>Ask about prepayment penalties</strong> before you sign, especially if you might pay early.</li>
          <li style={lastLi}><strong>Make extra payments when you can,</strong> and confirm they go to principal.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also worth knowing: interest on a personal loan used for personal expenses generally isn’t tax deductible in the
          U.S. Different rules can apply if the money goes to a business or investment, so ask a tax professional if that’s
          your situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Needs a Personal Loan Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Anyone comparing lenders.</strong> Banks, credit unions, and online lenders all quote differently. One calculator puts them on the same footing.</li>
          <li style={liStyle}><strong>People consolidating debt.</strong> It shows whether the new loan actually beats what you’re paying now.</li>
          <li style={liStyle}><strong>People planning a big expense.</strong> You’ll know the monthly commitment before you apply.</li>
          <li style={liStyle}><strong>Borrowers deciding whether to pay early.</strong> Test how much interest you’d save.</li>
          <li style={lastLi}><strong>Readers in Pakistan, India, and elsewhere.</strong> If you search for an EMI calculator, the monthly payment here is your EMI.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost</h2>
        <p style={pStyle}>
          The calculations use standard amortization math, the same formulas lenders use for fixed-rate installment loans.
          Still, treat the results as estimates for planning. Your lender’s figures may differ slightly because of rounding,
          payment dates, or how they treat fees. The loan agreement is what counts. This tool gives general information, not
          financial advice, so talk to a qualified professional about your specific situation.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator only asks for loan details like amount, rate, term, and fees. It doesn’t need your name, income, or
          credit score, so you can try any scenario you like. It’s free to use, and it never contacts a lender or credit
          bureau, so running numbers won’t affect your credit.
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
