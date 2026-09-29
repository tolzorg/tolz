import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much rent can I afford based on my income?",
    a: "A common benchmark is 28% of your gross monthly income, as long as your total debt payments (rent included) stay under 36%. Put your income and debts into the rent calculator above and it applies both tests and shows the lower number.",
  },
  {
    q: "How much rent can I afford making $50,000 a year?",
    a: "At 28% of gross income, that's about $1,167 a month, or about $1,250 at 30%. If you have monthly debts like a car loan or student loans, the total-debt limit could bring it lower, so run it through the calculator.",
  },
  {
    q: "How much rent can I afford making $60,000 or $100,000 a year?",
    a: "At 28%, $60,000 comes to about $1,400 a month and $100,000 comes to about $2,333. Debt can reduce those, so use the calculator with your actual payments.",
  },
  {
    q: "What is the 28/36 rule for rent?",
    a: "It's a debt-to-income guideline. No more than 28% of your gross income should go to housing, and no more than 36% to all your debt combined. Lenders use it for mortgages, and it works for renting too.",
  },
  {
    q: "What percentage of my income should go to rent?",
    a: "Most people use about 30% as a baseline. Spending around 20% leaves more room for savings, and going up to 40% is possible on a high income but comes with more risk. The 28/36 rule is a good middle ground because it accounts for your debt.",
  },
  {
    q: "Is the 30% rule or the 28% rule better for rent?",
    a: "The 28% limit is a bit more conservative, and it comes with a 36% total-debt check. The 30% rule is simpler but ignores your other debts, so it can overestimate what you can afford.",
  },
  {
    q: "Should I use gross or net income to calculate rent?",
    a: "Use gross income, before taxes. Landlords and lenders calculate their ratios from gross pay. It's still smart to check the result against your actual take-home budget.",
  },
  {
    q: "Do utilities count toward my housing budget?",
    a: "For a practical budget, yes. Include utilities and renter's insurance in your housing costs, which means picking a rent below your calculated maximum if they aren't included.",
  },
  {
    q: "What debts should I include in a rent affordability calculator?",
    a: "Minimum monthly payments on student loans, car loans, credit cards, personal loans, buy-now-pay-later plans and similar obligations. Leave out groceries, phone bills and subscriptions.",
  },
  {
    q: "Can I use the rent calculator if I'm self-employed or freelance?",
    a: "Yes. Enter your average monthly gross income from recent months. A conservative estimate is safer than your best month, and landlords often ask for tax returns or bank statements to verify variable income.",
  },
  {
    q: "What is the 3x rent rule?",
    a: "Many landlords require your gross monthly income to be at least three times the rent. It's a screening rule, not a budgeting guide.",
  },
  {
    q: "Does paying off debt increase how much rent I can afford?",
    a: "Yes, when the total-debt limit is the one controlling your result. Every dollar of monthly payment you clear frees up a dollar of room for rent.",
  },
  {
    q: "What's the difference between rent and a lease?",
    a: "Rent is the payment you make to a landlord. A lease is the contract that spells out the rent amount, the length of the agreement and the rules you both agree to.",
  },
  {
    q: "What upfront costs should I expect when renting?",
    a: "Typically a security deposit, first month's rent, an application fee, and possibly pet fees or last month's rent. Ask for a full list before applying.",
  },
  {
    q: "What if I can't afford rent even with the calculator's number?",
    a: "Look at roommates, a less expensive area, negotiating, or rental assistance. Local housing authorities, community organizations and 211 can point you to programs in your area.",
  },
  {
    q: "Is this rent calculator free, and do I need to sign up?",
    a: "It's free to use and doesn't require an account or any payment.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "How much rent can I afford based on my income?",
    a: "A common benchmark is 28% of your gross monthly income, as long as your total debt payments, rent included, stay under 36%. The rent calculator applies both tests and shows the lower figure.",
  },
  {
    q: "How much rent can I afford making $50,000 a year?",
    a: "At 28% of gross income, about $1,167 a month, or about $1,250 at 30%. Existing debt payments can lower that number, so run your figures through the calculator.",
  },
  {
    q: "What is the 28/36 rule for rent?",
    a: "No more than 28% of gross income on housing and no more than 36% on all debt combined. Lenders use it for mortgages, and it works well for renting too.",
  },
  {
    q: "What percentage of my income should go to rent?",
    a: "Most people use about 30% as a baseline. Around 20% leaves more room for savings, and up to 40% is possible on a high income but riskier. The 28/36 rule accounts for your debt.",
  },
  {
    q: "Should I use gross or net income to calculate rent?",
    a: "Use gross income, before taxes. Landlords and lenders calculate ratios from gross pay.",
  },
  {
    q: "What debts should I include in a rent affordability calculator?",
    a: "Include minimum monthly payments on student loans, car loans, credit cards, personal loans and similar obligations. Exclude everyday expenses like groceries, phone bills and subscriptions.",
  },
  {
    q: "What is the 3x rent rule?",
    a: "Many landlords require gross monthly income to be at least three times the monthly rent. It is a screening requirement, not a budgeting guide.",
  },
  {
    q: "What's the difference between rent and a lease?",
    a: "Rent is the payment made to a landlord for using a property. A lease is the contract that sets the rent amount, the length of the agreement and the rules both sides agree to.",
  },
  {
    q: "What upfront costs should I expect when renting?",
    a: "Typically a security deposit, first month's rent, an application fee, and possibly pet fees or last month's rent.",
  },
  {
    q: "Is this rent calculator free, and do I need to sign up?",
    a: "It is free to use and does not require an account or any payment.",
  },
];

const RENT_BY_INCOME_ROWS = [
  ["$30,000", "$2,500", "$700", "$750"],
  ["$40,000", "$3,333", "$933", "$1,000"],
  ["$50,000", "$4,167", "$1,167", "$1,250"],
  ["$60,000", "$5,000", "$1,400", "$1,500"],
  ["$75,000", "$6,250", "$1,750", "$1,875"],
  ["$100,000", "$8,333", "$2,333", "$2,500"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
  color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 10, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
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

export default function RentCalculatorFaqSection() {
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
        <h2 style={h2Style}>How Much Rent You Can Afford</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out how much rent you can afford shouldn't come down to a gut feeling, but that's how a
          lot of people do it. This rent calculator from <Link to="/" className="inline-home-link">Tolz</Link>{" "}
          takes your gross monthly income and your existing monthly debt, then shows the most rent you can
          carry using the same 28% and 36% debt-to-income guidelines lenders use for mortgages. Enter two
          numbers and you'll know your ceiling before you look at a single listing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Rent Calculator Works</h2>
        <p style={pStyle}>The calculator runs two tests and gives you the stricter result.</p>
        <p style={pStyle}>
          The first is the front-end ratio. It says no more than 28% of your gross monthly income should go
          to housing. If you make $5,000 a month before taxes, that's $1,400.
        </p>
        <p style={pStyle}>
          The second is the back-end ratio. It says your total monthly debt payments, rent included,
          shouldn't go past 36% of your gross income. That's where your existing obligations come in. Car
          payments, student loans, credit card minimums and the like get subtracted from that 36% before
          rent gets a dime.
        </p>
        <p style={pStyle}>
          Whichever limit is lower becomes your maximum rent. With little debt, the 28% test usually decides
          the answer. With a lot of debt, the 36% test takes over and your number drops. That's why two
          people with the same paycheck can get very different results.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's a useful way to think about it. Once the back-end ratio is the one in charge, every $100 of
          monthly debt payment takes $100 off your maximum rent. Wipe out a $300 car payment and your
          affordable rent goes up by $300.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Rent Calculator Step by Step</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter your gross income.</strong> Use the amount before taxes and deductions, straight
            off your pay stub or offer letter. Landlords and lenders screen on gross pay, so the calculator
            does too. If you only know your yearly salary, divide by 12. If you're paid hourly, multiply
            your hourly rate by the hours you work in a week, then by 52, then divide by 12. For example,
            $20 an hour at 40 hours a week comes to about $3,467 a month.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter your monthly debt payments.</strong> Add up the minimum payment on each recurring
            debt. Don't use the total balance. Skip rent, utilities, groceries and subscriptions.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Read your result.</strong> That's the highest monthly rent that keeps you inside both
            guidelines.
          </li>
          <li>
            <strong>Play with the numbers.</strong> Try a raise, a paid-off loan, or a roommate's income and
            see how the range changes before you start touring places.
          </li>
        </ul>

        <h3 style={h3Style}>Worked Example: Two Renters, One Salary</h3>
        <p style={pStyle}>
          Say two people each earn $72,000 a year, or $6,000 a month before tax.
        </p>
        <p style={pStyle}><strong>Renter A</strong> has $500 a month in debt payments.</p>
        <ul style={ulStyle}>
          <li>Front-end limit: 28% of $6,000 = $1,680</li>
          <li>Back-end limit: 36% of $6,000 = $2,160, minus $500 = $1,660</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>The lower number wins, so the max rent is about $1,660.</p>
        <p style={pStyle}>
          <strong>Renter B</strong> has $900 a month in debt payments, mostly a car loan and student loans.
        </p>
        <ul style={ulStyle}>
          <li>Front-end limit: $1,680</li>
          <li>Back-end limit: $2,160 minus $900 = $1,260</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>Max rent lands at about $1,260.</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Same salary, but Renter B's debt costs them roughly $400 a month in rent. A basic "28% of income"
          rule would've told both people the same thing, and it would've been wrong for Renter B.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Quick Reference: Rent by Annual Income</h2>
        <p style={pStyle}>
          These figures are only the income side, before any debt is subtracted. Your calculator result may
          come out lower if you carry debt.
        </p>
        <DataTable
          headers={["Annual gross income", "Monthly gross", "28% of income", "30% of income"]}
          rows={RENT_BY_INCOME_ROWS}
        />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Percentage of Your Income Should Go to Rent?</h2>
        <p style={pStyle}>
          There's no single right answer, because it depends on your income, your city, your debt and what
          you want your life to look like. Still, there are a few commonly used ratios, and each one is a
          tradeoff.
        </p>
        <p style={pStyle}>
          Around 20% is the thrifty route. You'll have more room for savings, debt payoff and fun spending.
          The catch is that in expensive metros, 20% often means a smaller place, a longer commute or a
          roommate. If you're comfortable with a few compromises to build savings faster, it's a solid
          option.
        </p>
        <p style={pStyle}>
          Around 30% is the standard. It's the number most people have heard, and for a reason. On a typical
          income it usually gets you a decent place and still leaves room for bills, debt and some savings.
          The 28% front-end limit in this calculator sits right next to it, just a bit tighter, and adds the
          debt check the plain 30% rule doesn't have.
        </p>
        <p style={pStyle}>
          Around 40% is a stretch. It can get you a nicer location or more space, and if your income is well
          above average it might be doable. But you're giving up 10 points of income compared to the
          standard, and that's where budgets get tight fast. A car repair or a medical bill can knock you
          off balance. If you go this high, track your spending closely and keep an emergency fund.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The percentages are guidelines, not laws. Treat the calculator's result as a planning number and
          adjust from there based on your own circumstances.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Counts as Income and Debt</h2>
        <p style={pStyle}>Good inputs give you a good answer, so it's worth being precise.</p>
        <p style={pStyle}>
          <strong>Income to include:</strong> salary or wages before tax, regular overtime, and bonuses or
          commissions if they show up consistently and you can document them. If you're self-employed or
          freelance, average your recent months, and lean conservative rather than using your best month.
          Steady side income, benefits and alimony can count if they're reliable and ongoing. If you're
          applying with a partner or roommate, their income can be added on a joint application, but they'll
          be on the lease and responsible for the full rent too.
        </p>
        <p style={pStyle}>
          <strong>Debts to include:</strong> minimum monthly payments on student loans, auto loans, personal
          loans, credit cards, buy-now-pay-later plans, and court-ordered payments like child support.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>What to leave out:</strong> rent, utilities, phone, insurance premiums, groceries and
          streaming services. Those are living costs, not debt obligations, and lenders don't count them in
          DTI. Use the minimum payment even if you usually pay more, since that's what shows up on your
          credit report.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why You'd Use a Rent Affordability Calculator</h2>
        <p style={pStyle}>It's handy in more situations than just apartment hunting.</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Before you start searching.</strong> Knowing your ceiling up front makes it easier to
            skip the gorgeous listing that costs $300 too much.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Relocating for a job.</strong> Rent can be wildly different from city to city. Plug the
            new salary in before you accept and see what the offer supports. It also helps you negotiate.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Deciding between roommates and living alone.</strong> Run your solo number, then compare
            it to your share of a split lease. Sometimes a one-bedroom is realistic, and sometimes the math
            says no.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Before renewing a lease.</strong> If your landlord announces an increase, check whether
            the new rent still fits, especially if your debts have changed.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Paying down debt.</strong> You can see exactly how much rent room a paid-off loan opens
            up, which can help you decide what to attack first.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Getting ready to apply.</strong> Many landlords check income against rent before
            approving you. If you know your numbers, you'll waste fewer application fees on places you
            won't qualify for.
          </li>
          <li>
            <strong>Going from renting toward buying.</strong> The same 28/36 ratios show up in mortgage
            underwriting, so this is a preview of how a lender will see your finances.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Rent Rules of Thumb and How They Compare</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>The 30% rule.</strong> Spend no more than 30% of gross income on rent. Simple and
            popular, but it ignores debt completely. Someone with hefty loan payments can pass the 30% test
            and still be overextended.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>The 3x rule.</strong> Many landlords want your gross monthly income to be at least three
            times the rent, which works out to be roughly 33% of income. It's a screening rule for
            landlords, not a budgeting tool for you. Passing it doesn't mean the rent will feel comfortable.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>The 50/30/20 budget.</strong> Split your after-tax income into needs, wants and savings.
            Rent is part of the 50% for needs, so use this as a check on your total spending, not to set a
            rent ceiling.
          </li>
          <li>
            <strong>The 28/36 rule.</strong> Two tests, and your existing debt is part of the math. It was
            built for mortgages, but it works well for renting because it protects the thing that matters
            most: your total debt load. If you're in an expensive city, going slightly over 28% for housing
            might be unavoidable. The 36% total-debt ceiling is the one to protect.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where U.S. Renters Stand Right Now</h2>
        <p style={pStyle}>
          Money is tight for a lot of people, so if the calculator gives you a lower number than you hoped,
          you're in good company.
        </p>
        <p style={pStyle}>
          According to Harvard's Joint Center for Housing Studies, 22.7 million renter households spent more
          than 30 percent of their income on rent and utilities in 2024, which is 49 percent of all renters.
          Of those, some 12.1 million were severely cost burdened, paying more than half their income for
          housing. The squeeze isn't limited to low earners either. Just over 49% of renters earning between
          $45,000 and $74,999 were cost burdened.
        </p>
        <p style={pStyle}>
          Prices have climbed a lot. Median gross rents rose from $1,088 in 2019 to $1,498 in 2024, a 37.3%
          increase. Rents have cooled a bit lately, with a 0.5% annual decline in the first quarter of 2026,
          but they're still 29% higher than in 2020. The dip isn't spread evenly either. Harvard's
          researchers note that the recent decline in asking rents was concentrated in regions where new
          supply has been heavily delivered, so where you live matters a lot.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more number worth knowing: the "cost burdened" figures count rent and utilities together
          against that 30% line. That's one more reason to budget utilities as part of your housing costs
          and not treat them as an afterthought.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Rent, and How Is It Different From a Lease?</h2>
        <p style={pStyle}>
          People use the two words interchangeably, but they're not the same thing. Rent is the payment you
          make to a landlord for the right to live in a property. A lease is the contract that sets the
          terms: how much you pay, how long the agreement lasts, and what rules you and the landlord both
          have to follow.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Getting that difference straight matters. The rent might be $1,500, but the lease is where you'll
          find the late fees, the pet rules, the notice you have to give before moving out, and whether the
          rent can go up at renewal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Renting Process, Start to Finish</h2>
        <p style={pStyle}>How hard it is to find a place depends mostly on where you're looking.</p>
        <p style={pStyle}>
          In smaller towns and rural areas it can be as easy as spotting a "For Rent" sign or walking into a
          leasing office. In or near big metros, where demand is high and vacancies are rare, it's more of a
          race. You'll be checking listing sites constantly, and when something good pops up you may have to
          see it the same day and apply right away. Some renters hire a broker in tight markets. Depending
          on the city and how competitive things are, the landlord or the renter pays that fee, and it often
          runs about one month's rent, so ask up front who's responsible.
        </p>
        <p style={pStyle}>
          Once you pick a place, you'll fill out a rental application. It usually asks for your name,
          current address, ID, pets and references, and often your income and debts. Expect the landlord to
          run a background check too, which can include your credit report, criminal history and prior
          evictions. Applications frequently come with a fee, so this is where knowing your affordable range
          pays off.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          After approval, you and the landlord settle on the rent, the length of the lease and the other
          terms, and a lease gets drafted. Once both of you sign, it's a legal contract. Then you get the
          keys on the move-in date.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Real Cost of Renting: Beyond the Monthly Rent</h2>
        <p style={pStyle}>
          Treat the calculator's number as your total housing budget, and subtract the extras before you
          pick a unit.
        </p>
        <p style={pStyle}><strong>Upfront costs:</strong></p>
        <ul style={ulStyle}>
          <li>Security deposit, often equal to one month's rent, though limits vary by state</li>
          <li>First month's rent, and sometimes the last month's too</li>
          <li>Application and screening fees</li>
          <li>Pet deposits or pet fees</li>
          <li>Moving costs, and furniture if you're starting from scratch</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}><strong>Recurring costs:</strong></p>
        <ul style={ulStyle}>
          <li>Electricity, gas, water, sewer and trash, unless the rent covers them</li>
          <li>Internet and phone</li>
          <li>Renter's insurance, which many landlords require and which tends to be inexpensive</li>
          <li>Parking, pet rent, storage or amenity fees</li>
          <li>Laundry, if there's no in-unit machine</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          A quick way to check utility costs before you sign: call the local utility companies and ask what
          a typical monthly bill looks like for that address or unit size. Some will share averages, and it
          beats guessing.
        </p>
        <p style={pStyle}>
          If utilities aren't included, aim for rent comfortably under your maximum. Landing 5% to 10% below
          your limit gives you a cushion for rent increases and surprise expenses, and it makes saving
          easier.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also keep in mind that a calculator only sees income and debt. It doesn't know about your commute,
          health costs, family size or savings goals. If you're saving for a down payment or helping support
          a family, your personal limit may be lower than the tool suggests.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Choose a Rental: Location, Quality, Size and Landlord</h2>
        <p style={pStyle}>Price is only one piece. Here's what else deserves a look.</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Location.</strong> Most people want to be close to work, family and friends, but think
            about the everyday stuff too. Is there a grocery store nearby? A gym? A trail if you hike, a
            coffee shop if that's your thing? Some people care about a specific school district, low crime
            or access to public transit. A cheaper place farther out can end up costing more once you add
            gas, parking or transit fares, so count your commute in dollars and hours.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Quality.</strong> Check when the building went up and when it was last renovated. Tour
            the unit in person if you can. Test the faucets, look under sinks for water damage, check
            windows and locks, and make sure the appliances actually work. For apartment buildings, tenant
            reviews online can tell you a lot about maintenance and management.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Size.</strong> Look beyond bedrooms and bathrooms. Are there enough closets and cabinets?
            Is there room for pets to move around? Where would a desk go if you work from home?
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Landlord.</strong> A landlord can make or break your time in a place. Landlords set
            rules, sometimes strict ones, about noise, lawn care, painting, hanging things on walls and
            pets. Ask current tenants how repairs get handled and how fast.
          </li>
          <li>
            <strong>Neighbors.</strong> They matter more than people think. Be friendly with them from day
            one. Neighbors who like you are more likely to give you a heads-up about problems, keep an eye on
            your place, and cut you some slack if you have a loud night now and then.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rent vs. Buy</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most homeowners rented first, so at some point you'll probably face this question. The calculator
          can help there too. If your rent number feels comfortable but a mortgage estimate for a similar
          home lands far above it, that gap tells you something. Buying comes with a down payment, closing
          costs, property taxes, insurance and repairs, and you're on the hook when the roof leaks. Renting
          gives you flexibility and predictable costs but no equity. If you expect to move within a few
          years, renting often makes more sense. If you're staying put and have stable income and savings,
          buying may pay off over time.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Lower Your Rent</h2>
        <p style={pStyle}>If the numbers aren't working, you have more options than just paying up.</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Get a roommate.</strong> Splitting a two-bedroom usually costs each person less than
            renting a one-bedroom alone. The best roommates tend to come through friends or family:
            respectful, clean, responsible and on the same page about noise, guests and bills.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Move a bit farther out.</strong> Rent often drops quickly as you leave the center of
            town. Just factor in transportation.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Negotiate.</strong> Ask about a lower rent, a longer lease in exchange for a discount, or
            a free month. The worst thing they can say is no. Your odds go up if the unit has been sitting
            empty, if it's the slow season (often late fall and winter), or if you have strong credit and
            steady income.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Trade work for rent.</strong> Some smaller landlords will knock down the rent if you
            handle maintenance, landscaping or cleaning. Get any deal like this in writing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Stay with family or a friend for a while.</strong> If it's an option, it can help you
            save. It's also a good idea to pay them back when you're in a better spot.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Shop patiently.</strong> Compare several places, take your time, and be willing to walk
            away from a bad deal.
          </li>
          <li>
            <strong>Consider a mobile home or a tiny living setup.</strong> Upfront costs can be high
            compared to a month of rent, but the monthly cost may be lower over the long run. Do the numbers
            and check lot fees and local rules.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rental Assistance: HUD, Section 8 and Local Help</h2>
        <p style={pStyle}>If you truly can't make rent work, there's help, though it's not easy to get.</p>
        <p style={pStyle}>
          Public housing is run by local housing authorities and funded by HUD. It's aimed mostly at
          low-income families, seniors and people with disabilities, and tenants generally pay around 30% of
          their adjusted income toward rent.
        </p>
        <p style={pStyle}>
          Section 8 (Housing Choice Vouchers) helps low-income households rent from private landlords. The
          voucher covers part of the rent and you pay the rest, and the requirements are strict. Waiting
          lists are often long, and some are closed for years, so it's smart to apply to several and get on
          lists early. Approval also depends on landlords accepting vouchers, which can slow things down.
        </p>
        <p style={pStyle}>
          Local help can be faster. Community action agencies, churches, nonprofits and social service
          organizations sometimes offer emergency rent help, deposit assistance or referrals. In many areas
          you can dial 211 to get connected to local resources. Your local housing authority's website is
          another good place to start.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Harvard's 2026 research found that 11 million extremely low-income households are competing for
          just 3.8 million affordable and available rental homes. So if you don't get help right away,
          that's the market, not a problem with you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Practical Pointers Before You Sign</h2>
        <p style={pStyle}>Some of this is common sense and some is stuff people learn the hard way.</p>
        <p style={pStyle}><strong>On paperwork:</strong></p>
        <ul style={ulStyle}>
          <li>Get every promise in writing, from repairs the landlord agrees to make to who pays for what.</li>
          <li>
            Read the whole lease. Look at late fees, renewal terms, early termination penalties, subletting
            rules, and how much notice you need to give before leaving.
          </li>
          <li>
            Ask how rent increases are handled at renewal. If you have a fixed-term lease, the landlord
            generally can't raise your rent during that term, but check your state's rules and the lease
            language.
          </li>
          <li>Ask when and how your security deposit gets returned, and what counts as an allowable deduction.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}><strong>On move-in day:</strong></p>
        <ul style={ulStyle}>
          <li>
            Walk the unit with a checklist, note every scratch, stain and broken item, and have the landlord
            sign it.
          </li>
          <li>
            Take dated photos and videos of everything. If the landlord later tries to charge you for
            damage, that's your proof it was already there.
          </li>
          <li>Keep the place clean. At move-out, anything beyond normal wear and tear can come out of your deposit.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}><strong>Protect yourself:</strong></p>
        <ul style={ulStyle}>
          <li>
            Consider renter's insurance. Your landlord's policy covers the building, not your stuff. If
            there's a fire, theft or pipe burst, your belongings are on you.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}><strong>Check the neighborhood and unit:</strong></p>
        <ul style={ulStyle}>
          <li>Test cell reception inside the unit. Some buildings are dead zones.</li>
          <li>
            Call a nearby pizza place and ask if they deliver to that address late at night. If they won't,
            that may hint at safety concerns.
          </li>
          <li>Visit at different times, like weeknight evenings and weekend mornings, to gauge noise and parking.</li>
          <li>If there are train tracks nearby, listen for passing trains. They can be worse than you think at 3 a.m.</li>
          <li>Check water pressure, outlets, heating and cooling, and look for signs of pests or mold.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Be nice to your landlord. The landlord-tenant relationship has plenty of gray areas. Pay on time,
          treat the place well, and communicate politely. Landlords are more likely to be flexible when
          you've been a good tenant, and that can mean a smaller increase at renewal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Spotting Rental Scams</h2>
        <p style={pStyle}>Scams spike when rents are high, so watch for these:</p>
        <ul style={ulStyle}>
          <li>A price that's way below similar units nearby</li>
          <li>A "landlord" who can't show you the unit and wants a deposit first</li>
          <li>Requests to pay by wire transfer, gift cards or cash app before you've seen the place or signed anything</li>
          <li>Pressure to act fast or claims the owner is out of the country</li>
          <li>Listings copied from other sites with different contact details</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Verify ownership through county property records if something feels off, and never send money for
          a place you haven't seen in person or through a verified video tour.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Know Your Rights as a Renter</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Tenant laws are set mostly at the state and local level, so the details vary. In general, though,
          it's worth finding out how much notice a landlord has to give before entering your unit, what the
          rules are on security deposit limits and returns, how much notice is required before a rent
          increase, and what repairs the landlord must handle. Your state attorney general's website or
          local housing authority usually has a plain-language tenant guide. If you run into a dispute, a
          local tenant union or legal aid office can point you in the right direction.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy and Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is free to use, with no hidden charges. It works from the two numbers you enter and
          doesn't ask for bank account details, a credit check or a Social Security number. The result is an
          estimate based on widely used lending guidelines. It isn't a lender's approval or a promise that a
          landlord will accept you, since every landlord sets their own income and credit rules. Use it as a
          planning benchmark, and always check the real lease terms and fees before committing.
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
