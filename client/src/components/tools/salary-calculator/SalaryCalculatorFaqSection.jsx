import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my annual salary from an hourly wage?",
    a: "Multiply your hourly rate by the hours you work each week, then by 52. For example, $20 × 40 × 52 = $41,600 a year. If you take unpaid holidays or vacation, subtract those hours too.",
  },
  {
    q: "How do I convert salary to hourly pay?",
    a: "Divide your annual salary by the hours you work in a year. For a standard full-time schedule that's 2,080 hours, so $52,000 works out to $25 an hour.",
  },
  {
    q: "How many working hours are in a year?",
    a: "A full-time year is typically 2,080 hours (40 × 52), or 260 working days at eight hours each. Subtract unpaid holiday and vacation hours to get your actual working hours.",
  },
  {
    q: "What's the difference between unadjusted and adjusted salary?",
    a: "Unadjusted salary assumes you're paid for every scheduled working day. Adjusted salary subtracts holidays and vacation days you aren't paid for. Using $30 an hour, the unadjusted annual figure is $62,400, and with 25 unpaid days off it's $56,400.",
  },
  {
    q: "What's the difference between biweekly and semi-monthly pay?",
    a: "Biweekly is every two weeks, which gives you 26 paychecks a year (occasionally 27). Semi-monthly is twice a month, which gives you 24. The annual total is the same, but each semi-monthly check is a bit bigger.",
  },
  {
    q: "Does the salary calculator include taxes?",
    a: "No. It shows gross pay before taxes and deductions. Your take-home pay depends on federal, state and local taxes, FICA, benefits and other deductions.",
  },
  {
    q: "What's the difference between gross pay and net pay?",
    a: "Gross pay is what you earn before anything is taken out. Net pay, or take-home pay, is what's left after taxes and deductions: gross pay minus taxes minus benefits and other deductions.",
  },
  {
    q: "What's the difference between salary and wage?",
    a: "A salary is a set amount, usually annual, that stays the same no matter how many hours you work. A wage is based on hours worked times an hourly rate. Wage earners are usually entitled to overtime under the FLSA, while many salaried workers are exempt.",
  },
  {
    q: "How do holidays and vacation affect my pay?",
    a: "If your time off is paid, your yearly pay stays the same, but your effective hourly rate for days worked goes up. If it's unpaid, your annual earnings go down by the hours you miss.",
  },
  {
    q: "How much is $60,000 a year per hour?",
    a: "At 40 hours a week and 52 weeks a year, it's about $28.85 an hour. At 45 hours a week it's about $25.64.",
  },
  {
    q: "What's overtime pay?",
    a: "Under US federal law, non-exempt employees generally get at least 1.5 times their regular rate for hours over 40 in a week. Some states have stricter rules. Most salaried exempt employees don't get overtime.",
  },
  {
    q: "Do employers have to give paid vacation in the US?",
    a: "No. Federal law doesn't require paid or unpaid vacation. It's up to the employer, which is why it's smart to ask about PTO before accepting an offer.",
  },
  {
    q: "Can I use the calculator for part-time work?",
    a: "Yes. Enter your real hours per day and days per week, and the results will reflect your actual schedule.",
  },
  {
    q: "Is this salary calculator free?",
    a: "Yes. It's free to use, and no signup is needed.",
  },
];

// Structured data uses the supplied schema wording, which differs slightly from the visible FAQ text.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How do I calculate my annual salary from an hourly wage?",
    a: "Multiply your hourly rate by the hours you work each week, then by 52. For example, $20 × 40 × 52 = $41,600 a year. If you take unpaid holidays or vacation, subtract those hours too.",
  },
  {
    q: "How do I convert salary to hourly pay?",
    a: "Divide your annual salary by the hours you work in a year. For a standard full-time schedule that's 2,080 hours, so $52,000 works out to $25 an hour.",
  },
  {
    q: "How many working hours are in a year?",
    a: "A full-time year is typically 2,080 hours (40 × 52), or 260 working days at eight hours each. Subtract unpaid holiday and vacation hours to get your actual working hours.",
  },
  {
    q: "What is the difference between unadjusted and adjusted salary?",
    a: "Unadjusted salary assumes you are paid for every scheduled working day. Adjusted salary subtracts holidays and vacation days you are not paid for. At $30 an hour, the unadjusted annual figure is $62,400, and with 25 unpaid days off it is $56,400.",
  },
  {
    q: "What is the difference between biweekly and semi-monthly pay?",
    a: "Biweekly is every two weeks, which gives 26 paychecks a year (occasionally 27). Semi-monthly is twice a month, which gives 24. The annual total is the same, but each semi-monthly check is a bit bigger.",
  },
  {
    q: "Does the salary calculator include taxes?",
    a: "No. It shows gross pay before taxes and deductions. Take-home pay depends on federal, state and local taxes, FICA, benefits and other deductions.",
  },
  {
    q: "What is the difference between gross pay and net pay?",
    a: "Gross pay is what you earn before anything is taken out. Net pay, or take-home pay, is what remains after taxes and deductions: gross pay minus taxes minus benefits and other deductions.",
  },
  {
    q: "What is the difference between salary and wage?",
    a: "A salary is a set amount, usually annual, that stays the same regardless of hours worked. A wage is based on hours worked times an hourly rate. Wage earners are usually entitled to overtime under the FLSA, while many salaried workers are exempt.",
  },
  {
    q: "How do holidays and vacation affect my pay?",
    a: "If your time off is paid, your yearly pay stays the same but your effective hourly rate for days worked goes up. If it is unpaid, your annual earnings go down by the hours you miss.",
  },
  {
    q: "How much is $60,000 a year per hour?",
    a: "At 40 hours a week and 52 weeks a year, it is about $28.85 an hour. At 45 hours a week it is about $25.64.",
  },
  {
    q: "What is overtime pay?",
    a: "Under US federal law, non-exempt employees generally get at least 1.5 times their regular rate for hours over 40 in a week. Some states have stricter rules. Most salaried exempt employees do not get overtime.",
  },
  {
    q: "Do employers have to give paid vacation in the US?",
    a: "No. Federal law does not require paid or unpaid vacation. It is up to the employer, which is why it is smart to ask about PTO before accepting an offer.",
  },
  {
    q: "Can I use the salary calculator for part-time work?",
    a: "Yes. Enter your real hours per day and days per week, and the results will reflect your actual schedule.",
  },
  {
    q: "Is this salary calculator free?",
    a: "Yes. It is free to use, and no signup is needed.",
  },
];

const PAY_PERIOD_HEADERS = ["Pay period", "How often", "Paychecks per year", "Good to know"];
const PAY_PERIOD_ROWS = [
  ["Daily", "Every working day", "About 260", "Mostly short-term contractors and day-rate work."],
  ["Weekly", "Once a week, often Fridays", "52", "Great for cash flow, but pricey for employers to process, which is why it's less common than biweekly or semi-monthly."],
  ["Biweekly", "Every two weeks", "26 (sometimes 27)", "The most common schedule in the US. Two months a year have three paydays."],
  ["Semi-monthly", "Twice a month, often the 15th and last day", "24", "Predictable dates, but the number of days between checks varies."],
  ["Monthly", "Once a month", "12", "Cheapest for employers to run. More common in Europe and for salaried professionals than in the US."],
  ["Quarterly", "Every three months", "4", "Typical for consultants, bonuses and some executive pay."],
  ["Annual", "Once a year, as a headline figure", "1", "What you'll see in job ads and contracts."],
];

const WAGE_HEADERS = ["Hourly", "Weekly", "Monthly", "Annual"];
const WAGE_ROWS = [
  ["$15", "$600", "$2,600", "$31,200"],
  ["$18", "$720", "$3,120", "$37,440"],
  ["$20", "$800", "$3,466.67", "$41,600"],
  ["$25", "$1,000", "$4,333.33", "$52,000"],
  ["$30", "$1,200", "$5,200", "$62,400"],
  ["$35", "$1,400", "$6,066.67", "$72,800"],
  ["$40", "$1,600", "$6,933.33", "$83,200"],
  ["$50", "$2,000", "$8,666.67", "$104,000"],
];

const BRACKET_HEADERS = ["Rate", "Single", "Married filing jointly"];
const BRACKET_ROWS = [
  ["10%", "up to $12,400", "up to $24,800"],
  ["12%", "$12,401 to $50,400", "$24,801 to $100,800"],
  ["22%", "$50,401 to $105,700", "$100,801 to $211,400"],
  ["24%", "$105,701 to $201,775", "$211,401 to $403,550"],
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
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

function DataTable({ headers, rows, wrap = false }) {
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: wrap && j > 0 ? "normal" : "nowrap", verticalAlign: "top", minWidth: wrap && j === row.length - 1 ? 220 : undefined }}>
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

export default function SalaryCalculatorFaqSection() {
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
        <h2 style={h2Style}>What a Salary Calculator Does (and What It Doesn't)</h2>
        <p style={pStyle}>
          At its core, a salary calculator is a unit converter for money. One person says "$30 an hour," another says
          "$5,200 a month," and a job ad says "$62,400 a year." Those are the same income described three ways, and the
          calculator shows how they line up.
        </p>
        <p style={pStyle}>
          The tool works with gross pay, which is what you earn before taxes and deductions. It doesn't subtract income
          tax, Social Security, Medicare, health premiums or retirement contributions, so the numbers aren't your
          take-home pay. That's on purpose. Gross figures are the fair way to compare offers, since your tax situation
          depends on where you live, how you file and what benefits you pick. We'll cover the gross-to-net gap further
          down so you know what to expect.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Even though it's called a salary calculator, hourly workers can use it too. The math works the same whether
          you're a barista or a project manager.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Salary Calculator</h2>
        <p style={pStyle}>
          Start with the number you've got. It could be an hourly wage, a weekly amount, or a yearly salary. Select the
          pay period it belongs to. Then set your schedule: hours per day and days per week. The standard full-time
          setup is 8 hours a day, 5 days a week, which means 40 hours weekly, 260 working days and 2,080 hours a year.
        </p>
        <p style={pStyle}>
          Next, enter your holidays and vacation days. The calculator then shows every pay period twice. The first set
          assumes you work all 52 weeks. The second subtracts the days you won't be working. Change any field and
          everything updates right away, so you can try a four-day week, shorter shifts or an extra week off without
          starting over.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One quick tip: if you're typing in an hourly or daily rate, think of it as a rate for time actually worked. If
          you're typing in a monthly or annual amount, make sure you know whether your employer has already built
          vacation and holidays into that figure. Most salaried offers have.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Unadjusted vs Adjusted Salary: How the Math Works</h2>
        <p style={pStyle}>
          This is where most people get confused, so here's a worked example.
        </p>
        <p style={pStyle}>
          Say you earn $30 an hour, work 8 hours a day, and there are 260 weekdays in the year (52 weeks × 5 days).
        </p>
        <div style={formulaStyle}>Unadjusted annual pay: $30 × 8 × 260 = $62,400</div>
        <p style={pStyle}>
          That figure assumes you get paid for literally every weekday. Now say you get 10 holidays and 15 vacation
          days, and none of them are paid. That's 25 days off.
        </p>
        <div style={formulaStyle}>Adjusted annual pay: $30 × 8 × (260 − 25) = $30 × 8 × 235 = $56,400</div>
        <p style={pStyle}>
          The gap is $6,000. Nothing was cut from your hourly rate. You simply worked 200 fewer hours. Monthly,
          quarterly, biweekly and semi-monthly figures all come from the annual number, so they shift too.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your vacation and holidays are paid, as with most salaried jobs, your annual pay stays at the unadjusted
          figure. What changes is your effective rate for days you actually work. A $62,400 salary with 25 paid days off
          breaks down to about $33.19 an hour on the 235 days you're on the clock, not the $30 you get from dividing by
          2,080. Seeing both numbers is useful because "what do I earn per year" and "what do I earn per hour of real
          work" are different questions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pay Periods Explained</h2>
        <p style={pStyle}>
          Each pay period is a slice of the same annual amount, and employers pick different slices for practical
          reasons.
        </p>
        <DataTable headers={PAY_PERIOD_HEADERS} rows={PAY_PERIOD_ROWS} wrap />
        <p style={pStyle}>
          <strong>A note on biweekly:</strong> because a year has 52 weeks plus a day or two, some years contain 27
          biweekly paydays, depending on where the calendar falls. If you're paid biweekly, check your employer's pay
          calendar before assuming 26.
        </p>
        <p style={pStyle}>
          <strong>What the law says about pay frequency.</strong> In the US there's no federal rule that sets how often
          you must be paid. Employers just have to pay on a regular, predictable schedule. Most states do have their own
          minimum frequency requirements, though a few don't. Other countries have their own rules, and some set pay
          dates by law. If something about your schedule looks off, check your state labor department.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More paychecks per year means smaller individual paychecks. That's all it means. A $60,000 salary is $2,307.69
          biweekly or $2,500 semi-monthly. The second check isn't a raise, just a different way of cutting the same pie.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Hourly to Salary and Salary to Hourly: The Formulas</h2>
        <p style={pStyle}>If you'd like to check the tool by hand, here's the math.</p>
        <p style={pStyle}>
          <strong>Hourly to annual:</strong> hourly rate × hours per week × 52.
        </p>
        <div style={formulaStyle}>$25 × 40 × 52 = $52,000</div>
        <p style={pStyle}>From there:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Monthly: $52,000 ÷ 12 = $4,333.33</li>
          <li style={liStyle}>Biweekly: $52,000 ÷ 26 = $2,000</li>
          <li style={liStyle}>Semi-monthly: $52,000 ÷ 24 = $2,166.67</li>
          <li style={liStyle}>Weekly: $52,000 ÷ 52 = $1,000</li>
          <li style={liStyle}>Quarterly: $52,000 ÷ 4 = $13,000</li>
        </ul>
        <p style={pStyle}>
          <strong>Salary to hourly:</strong> annual salary ÷ hours worked in a year.
        </p>
        <div style={formulaStyle}>$60,000 ÷ 2,080 = $28.85 an hour</div>
        <p style={pStyle}>
          <strong>Annual from a per-paycheck amount:</strong> gross pay per period × number of periods. If you make
          $1,500 a week, that's $1,500 × 52 = $78,000.
        </p>
        <p style={pStyle}>
          Weekly hours matter more than people think. That same $60,000 salary works out to $28.85 an hour at 40 hours a
          week, but only $25.64 at 45 hours, and about $23.08 at 50. When two jobs advertise the same salary, the one
          with shorter weeks pays better per hour.
        </p>

        <h3 style={h3Style}>Quick reference: common hourly wages</h3>
        <p style={pStyle}>These assume 40 hours a week, 52 weeks a year, and no unpaid time off.</p>
        <DataTable headers={WAGE_HEADERS} rows={WAGE_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A handy shortcut: take an hourly wage, double it, and add three zeros. That's roughly the annual salary in
          thousands. $25 an hour becomes about $52,000. It works because 2,080 hours is just a little over 2,000.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Holidays, Vacation and PTO Change Your Numbers</h2>
        <p style={pStyle}>
          The simple formula assumes you're paid for 52 full weeks. Real life is messier, and what happens depends on
          whether your time off is paid.
        </p>
        <p style={pStyle}>
          <strong>If your time off is paid</strong>, your annual pay doesn't change. Your effective hourly rate on days
          worked is higher than the headline hourly figure, because you're paid for days you didn't work.
        </p>
        <p style={pStyle}>
          <strong>If your time off is unpaid</strong>, which is common for hourly, contract and part-time work, you lose
          pay for each day off. A $25-an-hour worker who skips two weeks of vacation and ten holidays unpaid loses 160
          hours, so annual pay drops from $52,000 to $48,000.
        </p>

        <h3 style={h3Style}>Federal holidays and what employers actually give</h3>
        <p style={pStyle}>
          There are 11 federal holidays in the US: New Year's Day, Martin Luther King Jr. Day, Washington's Birthday,
          Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving and Christmas.
          Federal employees get all of them. Private employers set their own policy, and most give somewhere between 6
          and 11 paid holidays. Unless a contract or union agreement says otherwise, a private employer doesn't have to
          pay extra for working on a holiday. Other countries have their own list of public holidays, and some have
          noticeably more than the US, so adjust the holidays field to match where you work.
        </p>

        <h3 style={h3Style}>Vacation, sick days and PTO</h3>
        <p style={pStyle}>
          Most US employers have moved to a PTO system, where vacation, sick days and personal days sit in one pool.
          It's simpler because you don't have to explain why you're taking a day. The downside is that a bad flu in
          March can eat into the beach week you were planning for August.
        </p>
        <p style={pStyle}>
          Here's something that surprises a lot of people: US federal law doesn't require employers to give any vacation
          time, paid or unpaid. Plenty do offer it, but it's a benefit, not a legal right. Average PTO in the US is
          somewhere around ten days a year for many workers, and lower-wage workers tend to get a lot less. Many
          employers increase PTO with years of service. In contrast, the European Union requires at least four weeks
          (20 working days) of paid annual leave, and some countries go beyond that.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So when you compare offers, ask about the PTO policy. Ten extra paid days is about 4% of a working year, which
          is worth real money. On a $60,000 salary, that's roughly $2,300.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Salary vs Wage: Why the Difference Matters</h2>
        <p style={pStyle}>
          People use "salary" and "wage" interchangeably, but they mean different things at work.
        </p>
        <p style={pStyle}>
          A <strong>salary</strong> is a fixed amount for a role, usually quoted yearly and paid in regular
          installments. It doesn't change based on whether you worked 38 hours or 46 that week. A <strong>wage</strong>{" "}
          is tied to hours: hourly rate times hours worked.
        </p>
        <p style={pStyle}>
          Under the Fair Labor Standards Act (FLSA), this connects to overtime. Most hourly workers are non-exempt,
          which means they're entitled to overtime pay, generally 1.5 times their regular rate for hours over 40 in a
          week. Some employers or states also pay premium rates for holidays or long days. Most exempt employees are
          salaried, so they don't get overtime. To qualify as exempt, a worker generally has to be paid on a salary
          basis, perform specific kinds of duties, and earn at least a minimum weekly salary. The federal minimum has
          been $684 a week ($35,568 a year) under the rule currently in force, but this is an area where rules have been
          contested in court, so check with the Department of Labor or your state before relying on a number. Some
          states set a higher bar.
        </p>
        <p style={pStyle}>What this means in practice:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            A non-exempt worker at $25 an hour who puts in 45 hours earns (40 × $25) + (5 × $37.50) = $1,187.50 for the
            week.
          </li>
          <li style={liStyle}>
            A salaried exempt employee making the same $52,000 who works 45 hours earns the same $1,000 a week. Their
            effective hourly rate drops to about $22.22.
          </li>
        </ul>
        <p style={pStyle}>
          That second calculation is one of the best uses of the tool. Convert your salary to hourly using your actual
          hours, not the 40 on the job posting.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The federal minimum wage is $7.25 an hour, and it hasn't changed in years. States and cities can set higher
          minimums, and where they do, the higher rate applies. A few states technically have lower numbers on the
          books, but the federal rate overrides them. Minimums change often, so check your local rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Salary Calculator: Practical Scenarios</h2>
        <p style={pStyle}>
          <strong>Comparing job offers.</strong> One company says $34 an hour. Another says $68,000. Put both into the
          same unit, then add each company's actual leave policy and typical hours. The better-looking offer isn't
          always the better one.
        </p>
        <p style={pStyle}>
          <strong>Negotiating.</strong> If you know what your target salary is in monthly, weekly and hourly terms, you
          won't get thrown when a recruiter switches units mid-conversation.
        </p>
        <p style={pStyle}>
          <strong>Moving from hourly to salaried.</strong> You'll give up overtime, so make sure the salary covers what
          you were making including OT. Calculate your average weekly pay over the last few months and compare.
        </p>
        <p style={pStyle}>
          <strong>Freelance and contract pricing.</strong> Work backward from the income you want, then factor in unpaid
          holidays, sick days and slow weeks. We'll walk through an example in the contractor section.
        </p>
        <p style={pStyle}>
          <strong>Budgeting.</strong> Rent is monthly. Your paycheck probably isn't. Converting to monthly gross pay
          helps you plan, and if you're paid biweekly, it flags those two months a year with three paychecks, which are
          great for catching up on savings or debt.
        </p>
        <p style={pStyle}>
          <strong>Part-time and shift work.</strong> If you work 25 hours a week, enter that. Most online comparisons
          quietly assume full-time.
        </p>
        <p style={pStyle}>
          <strong>Raises and cost-of-living checks.</strong> A 4% raise sounds good until inflation is 4%. Convert old
          and new salaries to the same unit and compare.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>HR, payroll and small business owners.</strong> Useful for drafting offer letters, explaining pay
          structure to new hires or double-checking a pay stub.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Biweekly vs Semi-Monthly Pay</h2>
        <p style={pStyle}>People mix these up all the time, and it matters for budgeting.</p>
        <p style={pStyle}>
          <strong>Biweekly</strong> means every other week, usually on the same weekday, like every other Friday. That's
          26 paychecks a year, and in most years two months will contain three paydays.
        </p>
        <p style={pStyle}>
          <strong>Semi-monthly</strong> means twice a month, typically the 15th and the last day. That's 24 paychecks of
          equal size. Paydays can land on weekends, so employers shift them to the nearest business day.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's how $52,000 breaks down: $2,000 per biweekly check or $2,166.67 per semi-monthly check. The
          semi-monthly check is bigger because there are fewer of them. If you're moving from a biweekly employer to a
          semi-monthly one, your annual pay hasn't changed, even though each deposit looks larger. On the flip side,
          monthly bills are easier to line up with semi-monthly pay, while biweekly pay gives you those two
          bonus-feeling months.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Salary Is Not the Whole Package</h2>
        <p style={pStyle}>
          Pay is only part of what an employer spends on you, and it's only part of what you get.
        </p>
        <p style={pStyle}>
          Employees, especially full-time salaried ones, often receive employer-paid or subsidized health insurance, a
          retirement match like a 401(k) match, paid holidays and PTO, bonuses, life and disability coverage, and
          sometimes perks like stipends or discounts. Employers also pay their share of payroll taxes. Part-time workers
          are less likely to get most of this.
        </p>
        <p style={pStyle}>
          These benefits can be worth thousands of dollars a year. A job paying $62,000 with solid health coverage and a
          4% retirement match can beat a $67,000 job with neither. So before you pick the bigger number, compare
          benefits too.
        </p>

        <h3 style={h3Style}>Contractors and freelancers</h3>
        <p style={pStyle}>
          If you're self-employed or on a 1099, you're working without that safety net. No paid time off, no employer
          health plan, and you cover the full Social Security and Medicare tax yourself, called self-employment tax,
          which is 15.3% on most net earnings (you can deduct half of it when you file). Because of that, your rate
          usually needs to be higher than what an employee in the same role would make.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's a simple way to price it. Say you want the equivalent of a $70,000 salary. That's $33.65 an hour across
          2,080 hours. But a freelancer can't bill 2,080 hours: you'll lose time to holidays, vacation, sick days, admin,
          invoicing and finding clients. If you realistically bill 1,700 hours, you need $70,000 ÷ 1,700 = $41.18 an hour
          just to match that salary, before covering self-employment tax, health insurance or retirement savings. Many
          freelancers end up charging 25% to 50% more than the employee-equivalent hourly rate for this reason, though
          what the market will pay also plays a big part.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Gross Pay vs Take-Home Pay</h2>
        <p style={pStyle}>
          Everything the salary calculator outputs is gross. Here's what typically stands between that number and your
          bank deposit.
        </p>
        <p style={pStyle}>
          <strong>Federal income tax withholding.</strong> Your employer withholds income tax from every paycheck based
          on what you put on your Form W-4. The current W-4 doesn't use allowances anymore. It asks for your filing
          status, whether you have multiple jobs or a working spouse, dependents, other income, deductions and any extra
          withholding you want. If your W-4 is out of date after a marriage, a new baby or a second job, your
          withholding may not match what you'll owe.
        </p>
        <p style={pStyle}>
          Federal rates are 10%, 12%, 22%, 24%, 32%, 35% and 37%, applied in tiers. For 2026, the first brackets look
          like this:
        </p>
        <DataTable headers={BRACKET_HEADERS} rows={BRACKET_ROWS} />
        <p style={pStyle}>
          The brackets go up from there. They apply to taxable income, after the standard deduction ($16,100 for single
          filers in 2026, $32,200 for married filing jointly). Brackets and deductions get adjusted every year, so verify
          the current numbers on IRS.gov.
        </p>
        <p style={pStyle}>
          <strong>FICA.</strong> This covers Social Security and Medicare. Employees pay 6.2% for Social Security on
          wages up to a yearly cap ($184,500 for 2026), and 1.45% for Medicare on all wages. Employers pay a matching
          amount. If you earn above $200,000 as a single filer, an extra 0.9% Medicare tax applies to the excess, paid
          only by the employee.
        </p>
        <p style={pStyle}>
          <strong>State and local taxes.</strong> Some states have no income tax, others have a lot, and some cities add
          their own. Some states also withhold for programs like disability insurance or paid family leave.
        </p>
        <p style={pStyle}>
          <strong>Pre-tax deductions.</strong> Health insurance premiums, HSA or FSA contributions and traditional
          401(k) or 403(b) contributions come out before income tax is calculated. They shrink your paycheck but also
          lower your taxable income.
        </p>
        <p style={pStyle}>
          <strong>Post-tax deductions.</strong> Roth 401(k) contributions and some other items come out after tax. You
          get no tax break now, but qualified withdrawals later are tax-free.
        </p>
        <p style={pStyle}>
          <strong>Garnishments.</strong> If there's a court order for things like unpaid taxes, child support or
          defaulted loans, employers must deduct the required amount.
        </p>
        <p style={pStyle}>
          <strong>Bonuses.</strong> These are usually taxed using the supplemental wage method, commonly a flat 22%
          federal rate for bonuses under $1 million. That's why a bonus check can look smaller than expected. It's not
          necessarily taxed more overall; much of it gets sorted out when you file.
        </p>

        <h3 style={h3Style}>A quick illustration</h3>
        <p style={pStyle}>Take a $52,000 salary, single filer, no dependents, with only the standard deduction:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Taxable income: $52,000 − $16,100 = $35,900</li>
          <li style={liStyle}>Federal income tax: 10% of $12,400 ($1,240) + 12% of $23,500 ($2,820) = about $4,060</li>
          <li style={liStyle}>FICA: 7.65% of $52,000 = $3,978</li>
          <li style={liStyle}>Roughly $43,960 left before state tax and benefit deductions</li>
        </ul>
        <p style={pStyle}>
          That's an estimate, not a payroll calculation. Credits, extra deductions and state rules all change it. For a
          real take-home number, use a paycheck calculator or your employer's payroll estimator, and plug in the gross
          figure from this tool.
        </p>
        <p style={pStyle}>
          On withholding strategy: if you tell your employer to withhold less, you'll have bigger paychecks but could
          owe in April. If you withhold more, you'll get a refund, but you've basically given the government an
          interest-free loan all year. Neither is wrong. It's about which risk you'd rather take.
        </p>

        <h3 style={h3Style}>Reading your pay stub</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most states require employers to provide pay stubs. Look for pay period dates, hours worked, gross pay, net
          pay, federal, state and local taxes, Social Security and Medicare, benefit deductions, garnishments,
          year-to-date totals and PTO balance. Compare the gross pay on your stub with what you get from the salary
          calculator. If they don't match and you can't explain it with unpaid time, bonuses or a mid-period rate
          change, ask payroll.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Influences Salary</h2>
        <p style={pStyle}>
          If you're wondering why two people with similar titles earn different amounts, a few things drive it.
        </p>
        <p style={pStyle}>
          <strong>Experience and skills.</strong> Pay usually climbs as you build a track record, take on more
          responsibility or develop in-demand skills.
        </p>
        <p style={pStyle}>
          <strong>Education.</strong> Workers with a bachelor's degree or higher earn considerably more on average than
          those with only a high school diploma, according to Bureau of Labor Statistics data. Averages hide a lot,
          though. Certifications and demonstrated skill count in many fields.
        </p>
        <p style={pStyle}>
          <strong>Industry.</strong> The same job pays differently at a hedge fund, a hospital and a public school.
          Profit margins, regulation and industry stability all play a role.
        </p>
        <p style={pStyle}>
          <strong>Location.</strong> Employers adjust pay to local supply and demand. A higher salary in an expensive
          city can leave you with less breathing room than a lower one somewhere cheaper, so compare cost of living, not
          just the paycheck.
        </p>
        <p style={pStyle}>
          <strong>Age and career stage.</strong> Earnings tend to peak in people's late 30s through their 50s.
        </p>
        <p style={pStyle}>
          <strong>Pay gaps.</strong> Gaps tied to gender, race and ethnicity show up in national wage data. The reasons
          are complicated and include occupation, hours, career interruptions and discrimination. It's worth knowing
          about when you negotiate, and it's a good reason to research market rates before you answer a salary
          question.
        </p>
        <p style={pStyle}>
          <strong>Working conditions.</strong> Dangerous work often comes with hazard pay, and night or overnight shifts
          may carry a differential. If you're comparing two roles, the hours and conditions matter as much as the
          figure.
        </p>
        <p style={pStyle}>
          <strong>Company performance.</strong> Profitable companies sometimes pay more to land strong candidates, and
          struggling ones tighten up.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For perspective, BLS data have put median weekly earnings for full-time workers at around $1,200 in 2025,
          which is a bit over $63,000 a year. That's a median, meaning half of full-time workers earn more and half earn
          less, and it moves with every quarterly update.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Increase Your Salary</h2>
        <p style={pStyle}>Easier said than done, but these are the moves that tend to work.</p>
        <p style={pStyle}>
          <strong>Build skills that employers pay for.</strong> You don't always need another degree. Certifications,
          licenses and specialized training can bump pay faster and cost much less. Staying current in your field
          through conferences, courses or just reading regularly keeps you competitive.
        </p>
        <p style={pStyle}>
          <strong>Stack up experience, and make it visible.</strong> Time in a field helps, but only if people know what
          you've done. Keep a running list of wins, like revenue you helped bring in, projects you led or costs you cut.
        </p>
        <p style={pStyle}>
          <strong>Network.</strong> Professional associations and trade groups open doors to openings you won't see on
          job boards, and referrals often carry a pay advantage.
        </p>
        <p style={pStyle}>
          <strong>Use your performance review.</strong> Most employers do annual reviews, and a good one should come with
          a raise. If it doesn't, ask about it directly.
        </p>
        <p style={pStyle}>
          <strong>Negotiate.</strong> Bring specifics: what you've accomplished, what you've taken on and what
          comparable roles pay. Use the salary calculator to frame your ask in whichever unit your employer thinks in.
          Negotiating at the offer stage matters too, since every future raise builds on your starting number.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Change jobs.</strong> Staying put is comfortable, but switching employers often brings a bigger bump
          than an internal raise. A jump of 10% or more isn't unusual, though it's not guaranteed and depends on the
          field and market.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy and Assumptions</h2>
        <p style={pStyle}>
          The tool uses standard assumptions: 52 weeks, 260 weekdays at a five-day schedule, 12 months, 24 semi-monthly
          periods and 26 biweekly periods. A full-time year is commonly counted as 2,080 hours. Some organizations, like
          the US federal government, use 2,087 hours for pay calculations, so if your employer uses a different
          convention, adjust your hours or days to match.
        </p>
        <p style={pStyle}>For the best results:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Enter your actual weekly hours, not the 40 on the job posting.</li>
          <li style={liStyle}>Only include holidays and vacation days that apply to you.</li>
          <li style={liStyle}>Know whether those days are paid or unpaid before comparing the adjusted figures.</li>
          <li style={liStyle}>Remember the output is gross pay.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Those inputs change your answer more than any rounding ever will.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Reliable</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The salary calculator is free, with no hidden charges and no signup required. You only enter numbers like pay,
          hours and days off. There's no need for your name, employer or any personal info, and you shouldn't share
          any. Results update instantly, so you can run as many comparisons as you like.
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
