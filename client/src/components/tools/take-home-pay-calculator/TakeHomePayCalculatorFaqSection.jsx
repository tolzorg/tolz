import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my take-home pay?",
    a: "Start with your gross pay and subtract pre-tax deductions like 401(k) and health premiums. Then subtract federal income tax, Social Security, Medicare, and any state and local tax. After that, subtract post-tax deductions. What’s left is your net pay. This calculator does all of that for you.",
  },
  {
    q: "What percentage of my paycheck goes to taxes?",
    a: "It varies a lot. Many people keep roughly 70% to 80% of their gross pay, but high-tax states, local taxes and big deductions can push that lower. Your income, filing status and location are the main factors.",
  },
  {
    q: "Is biweekly or semi-monthly better?",
    a: "Biweekly gives you 26 paychecks a year and semi-monthly gives you 24, so biweekly checks are smaller but you get two extra months with three paychecks. Your total annual pay and your tax are the same either way.",
  },
  {
    q: "How much is $75,000 a year after taxes?",
    a: "For a single filer in a state with no income tax and no pre-tax deductions, it’s about $61,600 a year after federal tax and FICA, or around $2,369 biweekly. State tax and deductions will change that number.",
  },
  {
    q: "Does this calculator include state and city taxes?",
    a: "Yes. It estimates state and local income tax along with federal tax, Social Security and Medicare.",
  },
  {
    q: "What’s the difference between gross pay and net pay?",
    a: "Gross pay is what you earn before anything’s taken out. Net pay, also called take-home pay, is what actually lands in your account after taxes and deductions.",
  },
  {
    q: "How do I fill out Steps 3 and 4 of the W-4?",
    a: "In Step 3, enter $2,200 for each qualifying child under 17 and $500 for each other dependent. Step 4 handles other income, extra deductions and extra withholding. The calculator gives you the numbers for both.",
  },
  {
    q: "Should I take the standard deduction or itemize?",
    a: "Pick whichever is bigger. For 2026, the standard deduction is $16,100 for single filers, $32,200 for joint filers and $24,150 for heads of household. Most people don’t have enough itemized deductions to beat those amounts.",
  },
  {
    q: "How much are Social Security and Medicare taxes in 2026?",
    a: "Employees pay 6.2% for Social Security on wages up to $184,500, and 1.45% for Medicare on all wages. Earners above $200,000 also pay an extra 0.9% in Additional Medicare Tax.",
  },
  {
    q: "Why is my real paycheck different from the estimate?",
    a: "Employer-specific benefits, local taxes, bonus withholding and your year-to-date earnings can all cause differences. Compare your pay stub line by line to find the reason.",
  },
  {
    q: "Are tips and overtime taxed in 2026?",
    a: "Yes, they’re still taxable income, but new federal deductions may reduce what you owe. Qualified tips are deductible up to $25,000, and the extra premium portion of qualified overtime is deductible up to $12,500 for single filers or $25,000 for joint filers, with income limits. These are scheduled to run through 2028.",
  },
  {
    q: "Is the calculator free, and do I need to sign up?",
    a: "It’s free to use, and you don’t need an account to get your estimate.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const FREQUENCY_HEADERS = ["Pay Frequency", "How it works", "Paychecks per year"];
const FREQUENCY_ROWS = [
  ["Weekly", "Same day every week", "52"],
  ["Biweekly", "Every other week", "26"],
  ["Semi-monthly", "Two fixed dates a month, often the 15th and the last day", "24"],
  ["Monthly", "One fixed date a month", "12"],
  ["Daily, quarterly, semi-annually, annually", "Rare for regular jobs", "Varies"],
];

const OBBB_HEADERS = ["Deduction", "Maximum", "Income phase-out begins (single / joint)"];
const OBBB_ROWS = [
  ["Qualified tips", "$25,000", "$150,000 / $300,000"],
  ["Qualified overtime pay", "$12,500 single, $25,000 joint", "$150,000 / $300,000"],
  ["Car loan interest (qualified vehicle)", "$10,000", "$100,000 / $200,000"],
  ["Extra deduction for age 65+", "$6,000 per eligible person", "$75,000 / $150,000"],
];

const BRACKET_HEADERS = ["Rate", "Single", "Married filing jointly", "Head of household"];
const BRACKET_ROWS = [
  ["10%", "$0 – $12,400", "$0 – $24,800", "$0 – $17,700"],
  ["12%", "$12,400 – $50,400", "$24,800 – $100,800", "$17,700 – $67,450"],
  ["22%", "$50,400 – $105,700", "$100,800 – $211,400", "$67,450 – $105,700"],
  ["24%", "$105,700 – $201,775", "$211,400 – $403,550", "$105,700 – $201,775"],
  ["32%", "$201,775 – $256,225", "$403,550 – $512,450", "$201,775 – $256,200"],
  ["35%", "$256,225 – $640,600", "$512,450 – $768,700", "$256,200 – $640,600"],
  ["37%", "Over $640,600", "Over $768,700", "Over $640,600"],
];

const MEDICARE_HEADERS = ["Filing status", "Additional Medicare Tax threshold"];
const MEDICARE_ROWS = [
  ["Single", "$200,000"],
  ["Head of household", "$200,000"],
  ["Married filing jointly", "$250,000"],
  ["Married filing separately", "$125,000"],
  ["Qualifying surviving spouse", "$200,000"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const tableCaptionStyle = { ...h3Style, fontSize: 13.5, margin: "4px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows, minWidth = 480 }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", minWidth, borderCollapse: "collapse", fontSize: 13 }}>
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

export default function TakeHomePayCalculatorFaqSection() {
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
        <h2 style={h2Style}>Gross Pay vs. Take-Home Pay: Why the Difference Matters</h2>
        <p style={pStyle}>
          When people talk about salary in the U.S., they almost always mean gross pay, the amount before anything gets taken
          out. That’s the number on a job offer, the one lenders look at for a mortgage, and the one you use to compare jobs.
          It makes sense, because it’s the raw figure before things that differ from person to person, like taxes and health
          insurance, come into play.
        </p>
        <p style={pStyle}>
          But gross pay isn’t what you spend. Net pay, also called take-home pay or disposable income, is what’s actually
          deposited. If you’re budgeting for rent, car payments and groceries, that’s the only number that counts. Plenty of
          people get into trouble by planning their lives around a gross figure and then wondering why they’re short every
          month.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A good take home pay calculator closes that gap. You can see what a $90,000 offer really looks like per paycheck
          before you sign anything, and you can set up a budget that matches reality.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Take Home Pay Calculator</h2>
        <p style={pStyle}>
          Start with your pay. Put in your annual salary, or your hourly rate and typical weekly hours if you’re paid by the
          hour. Next, pick how often you get paid, since that decides how your yearly total gets split up. Then choose your
          filing status, your state, and your city if you live somewhere with a local income tax.
        </p>
        <p style={pStyle}>
          After that, add your deductions. The calculator separates them into pre-tax deductions your employer withholds
          (like 401(k) and health premiums), deductions that aren’t withheld (like IRA contributions or student loan
          interest), and itemized deductions. If you don’t itemize, leave that blank and the standard deduction applies.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You’ll get your net pay per paycheck, plus monthly and annual versions, with a breakdown of federal tax, state and
          local tax, Social Security and Medicare. The best way to learn from it is to change one thing at a time. Bump your
          401(k) from 3% to 8%, or switch from single to head of household, and watch what moves.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pay Frequency: Weekly, Biweekly, Semi-Monthly and Monthly</h2>
        <p style={pStyle}>
          How often you’re paid doesn’t change how much tax you owe for the year. It only changes how the total gets sliced
          up. Still, it affects what each check looks like, so it matters for budgeting.
        </p>
        <DataTable headers={FREQUENCY_HEADERS} rows={FREQUENCY_ROWS} />
        <p style={pStyle}>
          People mix up biweekly and semi-monthly all the time, and the difference is bigger than it looks. Biweekly gets you
          26 checks a year, and semi-monthly gets you 24. On a biweekly schedule, two months out of the year will have three
          paychecks. Those are great months for catching up on bills or building savings, but don’t count them as regular
          income when you budget.
        </p>
        <p style={pStyle}>
          A common mistake is turning a biweekly check into a monthly number by doubling it. That overshoots. The right math
          is the biweekly amount times 26, divided by 12.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the legal side, federal law doesn’t pick your pay schedule. It just says the schedule has to be regular and
          predictable, so an employer can’t pay you biweekly one month and monthly the next. Some states set their own
          minimums for how often employers must pay. In general, employees like being paid more often, and employers prefer
          fewer pay runs because each one costs money to process.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Filing Status: Which One Applies to You</h2>
        <p style={pStyle}>
          Your filing status sets your standard deduction and which tax brackets apply, so it has a real effect on your
          take-home pay. Here’s how the IRS defines the options:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Single:</strong> You’re unmarried, divorced, or legally separated under your state’s law.</li>
          <li style={liStyle}><strong>Married filing jointly:</strong> A married couple files one return together.</li>
          <li style={liStyle}><strong>Married filing separately:</strong> Each spouse files their own return. It’s usually only worth it in specific situations, like keeping finances separate or limiting responsibility for a spouse’s tax issues.</li>
          <li style={liStyle}><strong>Head of household:</strong> You’re unmarried and paid more than half the cost of keeping up a home for yourself and a qualifying person, often a child or dependent relative.</li>
          <li style={lastLi}><strong>Qualifying surviving spouse:</strong> You have a dependent child and your spouse passed away within the last two years. It lets you keep the joint-filer rates and deduction.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most people use single, married filing jointly, or head of household. Some people qualify for more than one status,
          and in that case you should compare and pick whichever gives you the lower tax bill. The head of household standard
          deduction ($24,150 for 2026) is much bigger than the single one ($16,100), and its brackets are wider, so qualifying
          for it can make a noticeable difference.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Deductions That Change Your Paycheck</h2>
        <p style={pStyle}>
          A deduction lowers the amount of income that gets taxed, which lowers your tax bill. They come in a few different
          flavors, and it helps to know which is which.
        </p>

        <h3 style={h3Style}>Pre-tax deductions your employer withholds</h3>
        <p style={pStyle}>These come out of your pay before income tax is calculated. Common ones include:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Traditional 401(k) or 403(b) contributions</li>
          <li style={liStyle}>Your share of health, dental and vision premiums</li>
          <li style={liStyle}>HSA contributions made through payroll</li>
          <li style={liStyle}>Flexible spending account (FSA) contributions</li>
          <li style={liStyle}>Commuter and parking benefits</li>
          <li style={lastLi}>Union and uniform dues, in some cases</li>
        </ul>
        <p style={pStyle}>
          For 2026, you can put up to $24,500 into a 401(k). People 50 and older can add catch-up contributions on top.
          There’s one detail worth knowing. Health premiums paid through a cafeteria plan generally reduce your Social
          Security and Medicare wages as well, but 401(k) deferrals don’t. So your FICA tax is still calculated on the money
          you put into your 401(k).
        </p>

        <h3 style={h3Style}>Deductions that aren’t withheld</h3>
        <p style={pStyle}>
          These don’t show up on your pay stub, but you can still subtract them from taxable income when you file. Examples
          include traditional IRA contributions (when you qualify), student loan interest (up to $2,500), and certain
          education-related items. Since your employer isn’t accounting for them, you only feel the benefit as a bigger
          refund, unless you adjust your W-4 to reflect them.
        </p>

        <h3 style={h3Style}>Standard deduction vs. itemizing</h3>
        <p style={pStyle}>
          You can take the standard deduction or itemize, and you’d normally pick whichever is bigger. For 2026 the standard
          deduction is $16,100 for single filers, $32,200 for married couples filing jointly, and $24,150 for heads of
          household.
        </p>
        <p style={pStyle}>
          Itemizing means adding up things like mortgage interest, state and local taxes, charitable gifts, and medical
          expenses above 7.5% of your adjusted gross income. For 2026, the cap on state and local tax deductions is $40,400,
          up from the old $10,000, though it phases down for higher earners. That change helps people in high-tax states, but
          most households still come out ahead with the standard deduction unless they have a mortgage plus significant other
          deductions.
        </p>

        <h3 style={h3Style}>New deductions for 2025 through 2028</h3>
        <p style={pStyle}>
          The One Big Beautiful Bill Act added several deductions. You can claim them whether you itemize or take the standard
          deduction, and they’re scheduled to end after 2028 unless Congress extends them.
        </p>
        <DataTable headers={OBBB_HEADERS} rows={OBBB_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The overtime deduction trips people up. It only covers the extra half in “time and a half,” not your full overtime
          pay. If you earn $30 an hour normally and $45 on overtime, the deductible part is the extra $15, and only up to the
          caps above. The car loan deduction also has strict rules, including that the vehicle generally must be new and
          assembled in the U.S. Check the IRS guidance before assuming you qualify for any of these.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Federal Income Tax: Brackets and Marginal vs. Effective Rates</h2>
        <p style={pStyle}>
          Federal income tax is progressive, so higher income gets taxed at higher rates. For 2026 there are seven rates,
          from 10% up to 37%. It’s usually the biggest single deduction on a paycheck, and it funds the federal government
          (individual income tax is the largest source of federal revenue).
        </p>
        <p style={pStyle}>
          The most common misunderstanding is that moving into a higher bracket means your whole income gets taxed at that
          higher rate. It doesn’t. Each rate only applies to the slice of income inside that bracket. So a raise can’t leave
          you with less money than before, even if it pushes you over a bracket line.
        </p>
        <p style={tableCaptionStyle}>2026 federal tax brackets (taxable income)</p>
        <DataTable headers={BRACKET_HEADERS} rows={BRACKET_ROWS} minWidth={560} />
        <p style={pStyle}>
          Those figures apply to taxable income, meaning what’s left after the standard or itemized deduction. A single filer
          earning $75,000 doesn’t pay 22% on $75,000. After the $16,100 standard deduction, taxable income is $58,900, and
          only the part above $50,400 is taxed at 22%.
        </p>
        <p style={pStyle}>
          If you’re comparing against last year, the 2025 standard deduction was $15,750 for single filers, $31,500 for joint
          filers and $23,625 for heads of household. The top of the 10% bracket for a single filer was $11,925 in 2025,
          compared with $12,400 now. Those small inflation adjustments mean most people see a slightly larger paycheck in 2026
          than the year before, all else equal.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your effective tax rate is the share of your income that actually goes to federal income tax. It’s almost always
          well below your top bracket, and it’s a better number to use when you’re estimating what you’ll keep.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>State Income Tax</h2>
        <p style={pStyle}>
          States tax income differently, and it’s one of the biggest reasons two people with the same salary can take home
          very different amounts.
        </p>
        <p style={pStyle}>
          Nine states don’t tax wages at all: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas,
          Washington and Wyoming. Tennessee and New Hampshire used to tax interest and dividends, but both have since
          repealed those taxes. Most of the other states use graduated rates, a growing number have switched to flat rates,
          and California has the highest top rate in the country at 13.3%.
        </p>
        <p style={pStyle}>Some things the headline rate doesn’t tell you:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>State payroll charges.</strong> California, New York, New Jersey, and a few other states take out disability insurance or paid family leave contributions. Washington has its own payroll programs too. They show up as separate lines on your stub.</li>
          <li style={liStyle}><strong>Where you work vs. where you live.</strong> If you work in one state and live in another, you may have tax withheld for the work state and then claim a credit on your home state return. Some neighboring states have reciprocity agreements that simplify this. Remote workers should double-check which state their employer is withholding for.</li>
          <li style={lastLi}><strong>Different treatment of income types.</strong> States commonly tax interest from municipal bonds issued elsewhere, and many give a full or partial break on pension income. Some tax Social Security benefits, though most don’t.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>City and Local Income Tax</h2>
        <p style={pStyle}>
          Most U.S. cities and counties don’t charge an income tax, but some do, and it affects roughly one in ten Americans.
          The highest rates tend to be in big cities like New York City. Philadelphia, many municipalities in Ohio and
          Pennsylvania, parts of Maryland and Indiana, and a handful of other places have local taxes too. Some, like Denver,
          charge a flat monthly amount instead of a percentage.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Local tax can come out to hundreds or even a couple thousand dollars a year, which is why this calculator asks for
          it. If you’re weighing a move across town or two job offers in different cities, don’t skip that field.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FICA: Social Security and Medicare Tax</h2>
        <p style={pStyle}>
          FICA is the payroll tax that funds Social Security and Medicare. If you’re an employee, you pay half and your
          employer pays the other half. If you’re self-employed, you pay both halves yourself, which works out to 15.3%.
          That’s one reason contractors tend to charge more per hour than employees earn doing the same work.
        </p>
        <p style={pStyle}>
          <strong>Social Security.</strong> The employee rate is 6.2% (12.4% including the employer’s share). It only applies
          up to a yearly wage cap, which is $184,500 for 2026 (up from $176,100 in 2025). The most an employee can pay is
          $11,439. People who earn above the cap often notice their paychecks get bigger late in the year when Social
          Security withholding stops.
        </p>
        <p style={pStyle}>
          <strong>Medicare.</strong> The employee rate is 1.45% (2.9% total with the employer’s share), and there’s no wage
          cap. High earners also owe an Additional Medicare Tax of 0.9% on wages over a threshold. Unlike regular Medicare
          tax, your employer doesn’t match this one.
        </p>
        <DataTable headers={MEDICARE_HEADERS} rows={MEDICARE_ROWS} minWidth={360} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There’s a quirk with how this works. Employers start withholding the extra 0.9% once your wages with them pass
          $200,000, no matter your filing status. Your actual liability gets settled when you file your return. A married
          couple earning $120,000 each, for example, wouldn’t hit the employer’s withholding trigger but would owe the tax on
          their joint return, because their combined wages are over $250,000.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Two Worked Examples</h2>
        <p style={pStyle}>
          <strong>Example 1: $75,000 salary, single, biweekly, no state income tax, no pre-tax deductions.</strong>
        </p>
        <p style={pStyle}>
          Taxable income after the $16,100 standard deduction is $58,900. Federal income tax is about $7,670 (10% on the
          first $12,400, 12% on the next $38,000, and 22% on the remaining $8,500). FICA is $5,737.50. Your total is roughly
          $13,400, leaving about $61,600 a year, or around $2,369 per paycheck. Your effective federal income tax rate is
          only around 10%.
        </p>
        <p style={pStyle}>
          <strong>Example 2: same person, but contributing 6% to a traditional 401(k).</strong>
        </p>
        <p style={pStyle}>
          The contribution is $4,500. Taxable income drops to $54,400, and federal income tax falls to about $6,680. FICA
          stays at $5,737.50 since 401(k) deferrals don’t reduce it. Annual take-home is about $58,080, or roughly $2,234 per
          paycheck.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So the 401(k) contribution is $173 per paycheck, but your take-home only drops about $135. The other $38 or so is
          tax you didn’t have to pay. That’s why it often costs less than people think to save more, and if your employer
          matches, it’s even better. This kind of side-by-side test is what a take home pay calculator is great for.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bonuses, Overtime and PTO Payouts</h2>
        <p style={pStyle}>Some kinds of pay get withheld in ways that surprise people.</p>
        <p style={pStyle}>
          <strong>Bonuses.</strong> These are classed as supplemental wages. Employers can withhold a flat 22% for federal
          income tax (37% on supplemental wages above $1 million in a year), or they can combine the bonus with your regular
          pay and withhold based on the combined total. Either way, that withholding is only an estimate. The true tax gets
          settled when you file. A bonus that seems to be “taxed at 40%” is usually just aggressive withholding on top of
          FICA and state tax, not a higher tax rate.
        </p>
        <p style={pStyle}>
          <strong>Overtime.</strong> Under the Fair Labor Standards Act, non-exempt employees must be paid at least one and a
          half times their regular rate for hours over 40 in a workweek. Many companies pay exactly that, and some pay double.
          A few states, like California, also require overtime for long days or certain weekly schedules. Salaried exempt
          employees generally don’t get overtime. Overtime isn’t taxed at a special rate. It just raises that paycheck’s
          wages, which can make withholding look high for that period.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>PTO payouts.</strong> If your employer lets you cash out unused paid time off, the payout is usually taxed
          as supplemental wages too. It does boost a paycheck, but some of it will disappear into withholding.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Filling Out Steps 3 and 4 of Your W-4</h2>
        <p style={pStyle}>
          The W-4 tells your employer how much federal income tax to hold back. A lot of people fill in Step 1 and sign. If
          your tax situation is anything beyond basic, Steps 3 and 4 are worth the extra few minutes.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Step 3: Claim dependents and other credits.</strong> Add $2,200 for each qualifying child under 17, and $500 for each other dependent. The total goes on the line and cuts the tax withheld from every paycheck. If you and your spouse both work, don’t claim the same dependents on both W-4s. Put them on one.</li>
          <li style={liStyle}><strong>Step 4(a): Other income.</strong> Use this if you have income that doesn’t have tax withheld, like interest, dividends, or side income. Entering it raises your withholding so you’re not hit with a bill later.</li>
          <li style={liStyle}><strong>Step 4(b): Deductions.</strong> Use this if you expect deductions bigger than the standard deduction (for instance, high itemized deductions), or other deductions you want your employer to account for. Check the current W-4 worksheet to see how the newer deductions for tips, overtime and similar items are handled.</li>
          <li style={lastLi}><strong>Step 4(c): Extra withholding.</strong> A flat dollar amount held back from each paycheck on top of the normal amount. It’s a simple fix if you keep owing at tax time.</li>
        </ul>
        <p style={pStyle}>
          The calculator gives you figures to plug into Steps 3 and 4 based on your inputs. If you have more than one job, or
          a working spouse, Step 2 matters a lot too, and the IRS Tax Withholding Estimator is a great way to double-check
          your numbers. You can submit a new W-4 to your employer anytime. It goes to payroll, not the IRS.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A big refund every year means you’ve been lending the government your money with no interest. A surprise bill
          means you didn’t have enough withheld. Aim to land close to zero.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Increase Your Take-Home Pay</h2>
        <p style={pStyle}>There are a few legitimate ways to bring home more.</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Ask for a raise or switch jobs.</strong> If your performance has been strong or the company’s doing well, make the case for a raise or promotion. If that isn’t possible, changing employers is often where the biggest pay jumps happen.</li>
          <li style={liStyle}><strong>Look at your payroll deductions.</strong> If you’re healthy, you may not need the priciest health plan. If you and your spouse both have employer coverage, compare the two plans and pick the better deal for your family.</li>
          <li style={liStyle}><strong>Use pre-tax accounts.</strong> FSA and HSA contributions come out before income tax, so you pay less tax on money you’d spend on medical costs anyway. An HSA requires a high-deductible health plan, but it rolls over each year and you keep it if you change jobs. An FSA is generally use-it-or-lose-it, with limited carryover. A dependent care FSA can also help if you pay for child care. It won’t make your paycheck bigger right away, but it can leave more money in your pocket over the year.</li>
          <li style={liStyle}><strong>Work overtime if you’re eligible.</strong> Non-exempt employees get paid more for hours over 40, and some of that overtime pay may now be deductible.</li>
          <li style={liStyle}><strong>Cash out unused PTO,</strong> if your employer allows it.</li>
          <li style={liStyle}><strong>Adjust your W-4.</strong> If you got a big refund last year, you can reduce withholding and get that money in your paychecks instead.</li>
          <li style={lastLi}><strong>Pause 401(k) contributions only as a last resort.</strong> If you’re in a real cash crunch, it can help, but try to at least contribute enough to get your employer’s full match. Skipping the match is leaving free money on the table.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You’d Actually Use a Paycheck Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Comparing job offers.</strong> A higher salary in a high-tax state or city can shrink a lot after taxes. Compare net pay, not gross.</li>
          <li style={liStyle}><strong>Moving.</strong> Your salary stays the same, but state and local taxes change what you keep.</li>
          <li style={liStyle}><strong>Your first job.</strong> See what your first paycheck will look like so you can plan rent and savings.</li>
          <li style={liStyle}><strong>Negotiating a raise.</strong> See what an extra $5,000 a year turns into per paycheck.</li>
          <li style={liStyle}><strong>Changing benefits.</strong> Test a bigger 401(k) or HSA contribution before committing.</li>
          <li style={liStyle}><strong>Big life changes.</strong> Getting married, having a baby, or taking a second job all change your withholding.</li>
          <li style={liStyle}><strong>Budgeting.</strong> Build your monthly budget around net pay, not what your salary sounds like.</li>
          <li style={lastLi}><strong>Mortgage and rent planning.</strong> Lenders use gross income, but your real comfort level depends on what’s left after taxes.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Is This Calculator?</h2>
        <p style={pStyle}>
          It gives you a solid estimate, not an exact payroll figure. Your actual paycheck can differ for a few reasons. Your
          employer’s benefit plans may have deductions the calculator can’t see. Payroll software uses the IRS’s withholding
          methods (Publication 15-T), which can handle things slightly differently than a year-end tax calculation. Local
          taxes and state payroll programs can vary by employer or location. Year-to-date earnings, bonuses, and the Social
          Security wage cap can also shift withholding partway through the year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The best test is comparing your estimate to your actual pay stub. If there’s a gap, it’s usually one specific line,
          like a benefit premium or a local tax, that explains it. The calculator uses 2026 figures for the federal standard
          deduction, tax brackets, Social Security wage base and FICA rates.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and No Hidden Catches</h2>
        <p style={pStyle}>
          The take home pay calculator on Tolz is free to use. There are no hidden fees and no paywall on the results. You
          don’t need to put in your name, Social Security number, or employer information to get an estimate. The only things
          that matter are your pay, location, filing status and deductions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Keep in mind that the results are for planning and information. They’re not tax or legal advice. If you have a more
          complicated situation, like income in multiple states, stock compensation, or self-employment income, talk to a
          qualified tax professional.
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
