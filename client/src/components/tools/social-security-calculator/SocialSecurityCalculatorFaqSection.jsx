import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the best age to claim Social Security?",
    a: "There's no universal answer. If you're healthy, have other income to live on, and expect a long life, waiting until 70 usually gives you the most lifetime money. If you need the income, have health concerns, or don't expect to live into your 80s, claiming earlier can make sense. The calculator shows how the numbers compare for your situation.",
  },
  {
    q: "Can I use the calculator to compare two ages?",
    a: "Yes. Pick any two ages between 62 and 70 and compare monthly benefits, yearly totals, and lifetime totals side by side, including the break-even age.",
  },
  {
    q: "What's the full retirement age if I was born in 1960 or later?",
    a: "67. For people born from 1955 to 1959, it's 66 plus two months for each year after 1954.",
  },
  {
    q: "How much is my check reduced if I claim at 62?",
    a: "With an FRA of 67, you get about 70% of your full benefit, and that reduction is permanent. Claiming at 63 gets you about 75%.",
  },
  {
    q: "How much more will I get by waiting until 70?",
    a: "8% for each year past FRA. If your FRA is 67, you'd get 124% of your full benefit at 70.",
  },
  {
    q: "How many credits do I need to qualify?",
    a: "40 credits, usually about 10 years of work. In 2026, you earn one credit per $1,890 in earnings, up to four per year.",
  },
  {
    q: "Can I work while collecting Social Security?",
    a: "Yes. Before FRA, benefits are withheld once you pass the yearly limit ($24,480 in 2026), and you get them back through a higher benefit at FRA. After FRA there's no limit.",
  },
  {
    q: "Is Social Security taxable?",
    a: "It can be. Up to 85% of your benefit may count as taxable income, depending on your combined income and filing status. That doesn't mean 85% is taken as tax. It means that portion gets added to your income and taxed at your regular rate.",
  },
  {
    q: "Will Social Security still be there when I retire?",
    a: "Yes, but not necessarily at the full scheduled amount. The 2026 Trustees Report projects that without changes, retirement benefits could be reduced to about 78% starting in 2032 or combined funds to about 83% starting in 2034. Congress can change this.",
  },
  {
    q: "Does a pension reduce my Social Security?",
    a: "Not anymore for most people. The WEP and GPO were repealed in 2025. Private pensions never reduced benefits.",
  },
  {
    q: "Does the calculator work for disability or SSI?",
    a: "No. It estimates retirement benefits only.",
  },
  {
    q: "Is the calculator free and do I need to sign up?",
    a: "It's free, with no hidden charges and no SSN required.",
  },
  {
    q: "Is the result official?",
    a: "No. It's an estimate based on published formulas. SSA determines your actual benefit when you apply.",
  },
];

// The structured-data FAQ covers a subset of the visible questions, worded as supplied.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "What's the best age to claim Social Security?",
    a: "There's no universal answer. If you're healthy, have other income to live on, and expect a long life, waiting until 70 usually gives you the most lifetime money. If you need the income, have health concerns, or don't expect to live into your 80s, claiming earlier can make sense. The calculator shows how the numbers compare for your situation.",
  },
  {
    q: "What's the full retirement age if I was born in 1960 or later?",
    a: "67. For people born from 1955 to 1959, it's 66 plus two months for each year after 1954.",
  },
  {
    q: "How much is my check reduced if I claim at 62?",
    a: "With a full retirement age of 67, you get about 70% of your full benefit, and that reduction is permanent. Claiming at 63 gets you about 75%.",
  },
  {
    q: "How much more will I get by waiting until 70?",
    a: "8% for each year past full retirement age. If your full retirement age is 67, you'd get 124% of your full benefit at 70.",
  },
  {
    q: "How many credits do I need to qualify for Social Security?",
    a: "40 credits, usually about 10 years of work. In 2026, you earn one credit per $1,890 in earnings, up to four per year.",
  },
  {
    q: "Can I work while collecting Social Security?",
    a: "Yes. Before full retirement age, benefits are withheld once you pass the yearly limit ($24,480 in 2026), and you get them back through a higher benefit at full retirement age. After full retirement age there's no limit.",
  },
  {
    q: "Is Social Security taxable?",
    a: "It can be. Up to 85% of your benefit may count as taxable income, depending on your combined income and filing status. That doesn't mean 85% is taken as tax. It means that portion is added to your income and taxed at your regular rate.",
  },
  {
    q: "Will Social Security still be there when I retire?",
    a: "Yes, but not necessarily at the full scheduled amount. The 2026 Trustees Report projects that without changes, retirement benefits could be reduced to about 78% starting in 2032, or combined funds to about 83% starting in 2034. Congress can change this.",
  },
  {
    q: "Does a pension reduce my Social Security?",
    a: "Not anymore for most people. The Windfall Elimination Provision and Government Pension Offset were repealed in 2025. Private pensions never reduced benefits.",
  },
  {
    q: "Is the Social Security calculator free and do I need to sign up?",
    a: "It's free, with no hidden charges and no Social Security number required.",
  },
];

const FRA_HEADERS = ["Birth year", "Full retirement age"];
const FRA_ROWS = [
  ["1943–1954", "66"],
  ["1955", "66 and 2 months"],
  ["1956", "66 and 4 months"],
  ["1957", "66 and 6 months"],
  ["1958", "66 and 8 months"],
  ["1959", "66 and 10 months"],
  ["1960 or later", "67"],
];

const CLAIM_HEADERS = ["Claim age", "% of full benefit", "Monthly check", "Yearly"];
const CLAIM_ROWS = [
  ["62", "70%", "about $1,866", "about $22,400"],
  ["65", "86.7%", "about $2,310", "about $27,700"],
  ["67", "100%", "about $2,665", "about $32,000"],
  ["70", "124%", "about $3,306", "about $39,700"],
];

const BREAKEVEN_HEADERS = ["By age", "Claim at 62", "Claim at 67", "Claim at 70"];
const BREAKEVEN_ROWS = [
  ["75", "$291,000", "$256,000", "$198,000"],
  ["80", "$403,000", "$416,000", "$397,000"],
  ["85", "$515,000", "$576,000", "$595,000"],
  ["90", "$627,000", "$736,000", "$793,000"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };

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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap" }}>
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

export default function SocialSecurityCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Social Security Calculator Does (and Doesn't Do)</h2>
        <p style={pStyle}>
          The tool answers one question really well: when should you start collecting? You can run it two ways. One
          looks at every claiming age from 62 to 70 and shows you which one adds up to the most total money over the
          lifespan you're planning for. The other is a head-to-head. You pick two ages, say 62 and 67, and see the
          monthly check, the yearly total, and the running lifetime total for each.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's a retirement benefits calculator, not a full financial plan. It won't tell you how much to save, and it
          doesn't estimate disability (SSDI) or Supplemental Security Income (SSI) payments. Those programs have their
          own rules, and a retirement calculator isn't built for them. What it does is handle the part that's tedious
          to do by hand: the monthly reduction for claiming early, the monthly bonus for waiting, and the break-even
          point where the bigger check finally catches up.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Can Collect Social Security Retirement Benefits?</h2>
        <p style={pStyle}>
          You need 40 work credits, which works out to about 10 years of covered work. In 2026 you earn one credit for
          every $1,890 in covered earnings, and you can earn a maximum of four credits per year. So once you've made
          around $7,560 in a year, you've banked all four. Self-employment counts too, as long as you paid
          self-employment tax.
        </p>
        <p style={pStyle}>
          You can start benefits as early as 62, but you'll get a permanently smaller check. Full benefits come at your
          full retirement age (FRA), and you can keep waiting for bigger checks until 70. There's nothing to gain after
          that, so if you're 70 and haven't claimed, there's no reason to hold off.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One small thing that trips people up: you generally have to be 62 for the whole month to get a check for
          that month, and Social Security pays a month behind. So the first payment usually lands later than people
          expect.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Social Security Retirement Benefits Are Calculated</h2>
        <p style={pStyle}>
          Knowing the formula helps you understand why your estimate is what it is, and why a couple of extra working
          years can matter.
        </p>
        <p style={pStyle}>
          <strong>Step 1: Your 35 best years.</strong> The Social Security Administration (SSA) takes your earnings
          from every year you worked, adjusts the older years upward to reflect wage growth, and picks your 35
          highest. If you worked fewer than 35 years, the missing years count as zeros. The total gets divided by 420
          months (35 years × 12). That's your average indexed monthly earnings, or AIME.
        </p>
        <p style={pStyle}>
          <strong>Step 2: The bend-point formula.</strong> Your AIME runs through a three-tier formula to produce your
          primary insurance amount (PIA), which is your benefit at full retirement age. For people turning 62 in 2026,
          it works like this:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>90% of the first $1,286 of AIME</li>
          <li style={liStyle}>32% of AIME between $1,286 and $7,749</li>
          <li>15% of anything above $7,749</li>
        </ul>
        <p style={pStyle}>
          The dollar cutoffs (the "bend points") change every year, and the ones that apply to you are set by the year
          you turn 62. The formula is lopsided on purpose: lower earners get back a bigger share of what they earned.
        </p>
        <p style={pStyle}>
          A real example. Say your indexed earnings average out to $72,000 a year over 35 years. That's an AIME of
          $6,000.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>90% of $1,286 = $1,157.40</li>
          <li style={liStyle}>32% of ($6,000 − $1,286) = $1,508.48</li>
          <li>Nothing falls in the 15% tier</li>
        </ul>
        <p style={pStyle}>
          Add those up and your PIA is about $2,665 a month. That's what you'd get at full retirement age. SSA rounds
          down to the nearest dime, but you get the idea.
        </p>
        <p style={pStyle}>
          <strong>Step 3: The claiming-age adjustment.</strong> That $2,665 goes up or down depending on when you
          claim. More on that in a minute.
        </p>
        <p style={pStyle}>
          <strong>Step 4: Cost-of-living adjustments.</strong> Once you're collecting, your check gets a COLA each year
          to keep up with inflation. The 2026 bump was 2.8%. The next one is typically announced in October. COLAs also
          apply to the benefit you're eligible for before you claim, which is why waiting doesn't mean losing ground to
          inflation.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want to see your real numbers instead of an estimate, create a free account at ssa.gov. Your statement
          shows your actual earnings record, and it's worth scanning for missing or wrong years. Those errors are
          fixable, but only if you catch them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Full Retirement Age by Birth Year</h2>
        <DataTable headers={FRA_HEADERS} rows={FRA_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some simpler calculators round FRA up to a whole year, so someone born in 1957 gets treated like they're 67
          instead of 66 and 6 months. It's usually a small difference, but it's one reason two calculators can give you
          slightly different answers. Your exact birth year and month matter, so enter them as accurately as you can.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Claiming at 62, 67, or 70: What Early and Delayed Claiming Really Do</h2>
        <p style={pStyle}>
          <strong>Claiming early.</strong> For each of the first 36 months before your FRA, your benefit drops by 5/9
          of 1%. For every month beyond that, it drops 5/12 of 1%. If your FRA is 67 and you claim at 62, that's 60
          months early: a 20% cut for the first 36, plus another 10% for the other 24. You end up with 70% of your full
          benefit. Claiming at 63 gets you 75%, and at 64, about 80%.
        </p>
        <p style={pStyle}>
          <strong>Delaying.</strong> Each month you wait past FRA adds two-thirds of 1%, which is 8% a year, up to age
          70. With an FRA of 67, waiting until 70 gets you 124% of your PIA. People born in 1943 through 1954, with an
          FRA of 66, can get up to 132%.
        </p>
        <p style={pStyle}>Here's how it plays out with the $2,665 example from above (FRA 67):</p>
        <DataTable headers={CLAIM_HEADERS} rows={CLAIM_ROWS} />
        <p style={pStyle}>
          The 70-year-old check is nearly double the 62-year-old check. These are stated in today's dollars before
          COLAs, but COLAs hit both paths, so the gap holds up.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For context, the most anyone can get is capped. The SSA's maximum at full retirement age in 2026 is $4,152 a
          month ($49,824 a year), and for someone claiming at 70 it's around $5,181. Getting anywhere near that means
          earning at or close to the taxable maximum for most of 35 years, which very few people do. The average
          retired worker gets roughly $2,070 a month after the 2026 COLA. Social Security is meant to replace around
          40% of pre-retirement earnings for an average earner, which is why it's usually just one leg of the
          retirement stool.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Break-Even Age: When Does Waiting Actually Pay Off?</h2>
        <p style={pStyle}>
          Break-even is the age where the person who waited has collected as much total money as the person who
          started early. Before that age, the early claimer is ahead. After it, the later claimer pulls ahead for good.
        </p>
        <p style={pStyle}>Using the same example (no COLAs, to keep it simple):</p>
        <DataTable headers={BREAKEVEN_HEADERS} rows={BREAKEVEN_ROWS} />
        <p style={pStyle}>
          The crossover points land at about 78 and 8 months for 62 versus 67, about 82 and 6 months for 67 versus 70,
          and around 80 and 5 months for 62 versus 70. That's what the calculator pins down for your specific numbers.
        </p>
        <p style={pStyle}>A few things to keep in mind when reading a break-even result.</p>
        <p style={pStyle}>
          It's not just about who "wins" on total dollars. Claiming early gets you cash you could invest, or lets you
          avoid pulling from savings during the early retirement years. Waiting is closer to buying insurance. If you
          live to 95, a bigger inflation-adjusted check for life is worth a lot. If you don't, you gave up money you
          could've spent. Nobody knows which one they'll be, so the best use of the calculator is to test a few
          lifespans (say 80, 85, and 90) and see how much the answer changes.
        </p>
        <p style={pStyle}>
          COLAs don't move the break-even age much, since they raise both streams by the same percentage. Taxes can
          shift things a bit, though, and so can the earnings test if you're still working.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're in poor health or have a family history of shorter lifespans, claiming earlier can be a perfectly
          rational move. If you're healthy, have savings to bridge the gap, and your parents lived into their 90s,
          waiting usually wins.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use a Social Security Retirement Calculator</h2>
        <p style={pStyle}>Here are the situations where people tend to pull this up:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>You're about to turn 62 and don't know whether to start.</strong> Compare 62 with your FRA to see
            exactly what claiming right away costs you every month, permanently.
          </li>
          <li style={liStyle}>
            <strong>You want to retire early and need to cover the gap.</strong> If you stop working at 62 or 63, run
            the numbers on whether starting benefits or spending savings until 67 or 70 leaves you better off.
          </li>
          <li style={liStyle}>
            <strong>You're still working and healthy.</strong> Compare 67 to 70 to see if the extra 24% is worth the
            wait, especially if your paycheck covers the bills in the meantime.
          </li>
          <li style={liStyle}>
            <strong>You're married and one spouse earned a lot more.</strong> The higher earner's claiming age sets the
            survivor benefit. This is often the best reason to delay, even if that person doesn't expect to live a long
            time.
          </li>
          <li style={liStyle}>
            <strong>You're building a retirement budget.</strong> Plug in a few scenarios and compare the monthly checks
            to your actual expenses. Knowing that your benefit covers, say, your housing, food, and utilities but not
            travel is more useful than a vague "I'll get about $2,500."
          </li>
          <li>
            <strong>You're helping a parent decide.</strong> A side-by-side comparison is an easy way to explain why
            waiting a year or two might make sense.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Work and Collect Social Security at the Same Time?</h2>
        <p style={pStyle}>
          Yes, but it depends on your age. If you're under full retirement age for the whole year, there's a yearly
          earnings limit. In 2026 it's $24,480. Go over it, and Social Security withholds $1 of benefits for every $2
          you earn above the line. In the calendar year you reach FRA, the limit jumps to $65,160, and the withholding
          is $1 for every $3 over, only counting earnings until the month you hit FRA. Once you're at full retirement
          age or older for the whole year, there's no limit at all.
        </p>
        <p style={pStyle}>
          The part people miss is that withheld benefits aren't gone. When you reach FRA, SSA recalculates your
          monthly benefit to give you credit for the months it held back. You do get it back over time, just in higher
          future checks instead of a lump sum. Still, the earnings test is a real cash-flow issue if you're claiming at
          62 and working full time, so plan around it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also, only wages and net self-employment income count. Pension income, investment returns, and Social
          Security itself don't.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Married? Spousal and Survivor Benefits Change the Math</h2>
        <p style={pStyle}>If you're married, your decision isn't only about you.</p>
        <p style={pStyle}>
          <strong>Spousal benefits.</strong> A spouse can get up to 50% of the worker's full benefit (PIA), but only if
          the spouse waits until their own FRA to claim. If the spouse claims earlier, the spousal benefit shrinks. At
          62 with an FRA of 67, it's only about 32.5% of the worker's PIA. Spousal benefits don't get delayed credits,
          so waiting past FRA doesn't increase them. And receiving a spousal benefit doesn't reduce the working
          spouse's check. It's paid on top.
        </p>
        <p style={pStyle}>
          <strong>Survivor benefits.</strong> When one spouse dies, the survivor generally keeps the larger of the two
          benefits. Survivors can start as early as 60 (with a reduction, roughly 71.5% of the deceased spouse's
          amount) or wait until their own survivor FRA for the full amount. This is why the higher earner delaying to
          70 acts as insurance for the spouse who outlives them.
        </p>
        <p style={pStyle}>
          <strong>Divorced spouses.</strong> If your marriage lasted at least 10 years and you're not currently
          remarried, you may be able to collect on your ex's record, without affecting what they or their new spouse
          receive.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A lot of calculators, including simple ones, assume only one spouse worked and just bump the total by 50%.
          That falls apart when both spouses have their own earnings. In that case, run each person's numbers
          separately and compare. Each spouse generally gets the higher of their own benefit or the spousal benefit.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pensions, Disability, and Other Benefits</h2>
        <p style={pStyle}>
          <strong>Government pensions.</strong> If you worked for a state or local government job where you didn't pay
          into Social Security, you may have heard about the Windfall Elimination Provision and Government Pension
          Offset, which used to cut benefits. Congress repealed both with the Social Security Fairness Act in January
          2025, so affected people can now receive their full benefits and the repeal covered payments going back to
          January 2024. If you were told years ago that your benefits would be reduced, it's worth rechecking.
        </p>
        <p style={pStyle}>
          <strong>Disability.</strong> SSDI and SSI are separate programs from retirement. If you're on SSDI when you
          reach full retirement age, your disability benefit automatically converts to a retirement benefit of the
          same amount.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Regular private pensions and 401(k)s.</strong> These don't reduce your benefit. They can raise your
          tax bill on benefits, which brings us to the next section.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Are Social Security Benefits Taxable?</h2>
        <p style={pStyle}>Possibly, yes, and this is where a lot of people get surprised.</p>
        <p style={pStyle}>
          Whether you owe tax depends on your "combined income," which is your adjusted gross income plus any
          tax-exempt interest plus half of your Social Security benefits.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Single filers:</strong> below $25,000, none of your benefits are taxed. Between $25,000 and
            $34,000, up to 50% can be taxed. Above $34,000, up to 85%.
          </li>
          <li>
            <strong>Married filing jointly:</strong> below $32,000, none. Between $32,000 and $44,000, up to 50%. Above
            $44,000, up to 85%.
          </li>
        </ul>
        <p style={pStyle}>
          Those thresholds were set decades ago and never adjusted for inflation, so more retirees get caught every
          year.
        </p>
        <p style={pStyle}>
          Here's something that confuses a lot of people: "up to 85% taxable" doesn't mean you pay 85% in tax. It means
          up to 85% of your benefit gets added to your taxable income, and then it's taxed at your regular bracket.
        </p>
        <p style={pStyle}>
          Example: a single retiree collects $24,000 in Social Security and has $30,000 in other income. Combined
          income is $30,000 + $12,000 = $42,000, which is above $34,000. Working through the IRS formula, about $11,300
          of the benefit ends up taxable, roughly 47% of the total, not 85%. That $11,300 is taxed at their normal rate,
          probably 10% or 12%.
        </p>
        <p style={pStyle}>
          A temporary extra deduction for taxpayers 65 and older is also in effect through 2028, which can take some
          of the sting out. And a handful of states tax benefits too, so check yours.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Planning tip: pulling money out of a traditional IRA or 401(k) increases your combined income and can make
          more of your Social Security taxable. Some people reduce that by timing withdrawals, doing Roth conversions in
          lower-income years, or using Roth money later.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Is Social Security Funded?</h2>
        <p style={pStyle}>
          Payroll taxes. Under FICA, employees and employers each pay 6.2% of wages toward Social Security and 1.45%
          toward Medicare, for a combined 15.3%. Self-employed people pay both halves. The 6.2% only applies to
          earnings up to the taxable maximum, which is $184,500 in 2026. Earn $200,000 and the last $15,500 isn't hit by
          Social Security tax. Medicare tax has no cap, and an extra 0.9% applies to wages above $200,000 for single
          filers or $250,000 for joint filers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That money flows into trust funds, which pay current retirees, survivors, and disabled workers. Whatever
          isn't needed in a given year is invested in Treasury securities, and that earns interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Will Social Security Run Out?</h2>
        <p style={pStyle}>It won't disappear, but a funding gap is real, and it's reasonable to ask about it.</p>
        <p style={pStyle}>
          According to the 2026 Trustees Report, the retirement trust fund (OASI) is projected to run out of reserves
          in the fourth quarter of 2032. At that point, incoming payroll taxes would cover about 78% of scheduled
          benefits. Combined with the disability fund, the projection is 2034, with about 83% payable. Social
          Security's cost has been higher than its income since 2021.
        </p>
        <p style={pStyle}>
          So the program keeps paying as long as workers keep paying in, but without changes from Congress, benefits
          would be trimmed to what incoming taxes can cover. Lawmakers have a menu of options: raise the payroll tax,
          lift or remove the earnings cap, adjust the retirement age, or change the benefit formula. Which ones they'd
          pick is anyone's guess.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For your claiming decision, the question people ask is "should I just take it early before it gets cut?"
          Think twice. Claiming early locks in a permanent reduction for sure, while a cut is a possibility. And if
          benefits across the board were cut by a percentage, that would hit early and late claimers alike, so the gap
          between them would stay. Nobody can promise how it'll play out, but a certain 30% cut is a steep price to
          dodge an uncertain one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Social Security Calculator Step by Step</h2>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Get your benefit estimate.</strong> Log in at ssa.gov and look up your projected monthly benefit at
            full retirement age. Using your real record beats any guess.
          </li>
          <li style={liStyle}>
            <strong>Enter your birth year.</strong> This sets your FRA and the exact reduction or credit for each month
            you claim early or late.
          </li>
          <li style={liStyle}>
            <strong>Pick your mode.</strong> Choose "find my best age" or enter two ages to compare.
          </li>
          <li style={liStyle}>
            <strong>Test a few lifespans.</strong> Don't settle on one number. Check 80, 85, and 90. If the same age
            wins at all three, that's a strong signal. If the answer flips, your decision is closer than it looks.
          </li>
          <li style={liStyle}>
            <strong>Look at monthly income and the total.</strong> A bigger lifetime number isn't helpful if the check
            is too small to cover your bills at 62, and a bigger check isn't helpful if you can't afford to wait.
          </li>
          <li>
            <strong>Run it again when things change.</strong> New job, health news, a spouse's earnings, or a corrected
            earnings record can all shift the answer.
          </li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Are Social Security Calculators?</h2>
        <p style={pStyle}>
          Accurate enough to plan with, not accurate enough to treat as a promise. The formulas the tool applies are the
          ones the SSA publishes: reduction and credit percentages, FRA by birth year, bend points, and wage base. Where
          estimates go off is usually the input side.
        </p>
        <p style={pStyle}>
          Simplified calculators, including the ones from big retirement sites, often assume you earn steadily every
          year until you claim. If you had gaps, years in jobs not covered by Social Security, big swings in income, or
          you're planning to retire years before the claiming age you're testing, the estimate can run too high or too
          low. Your actual record at ssa.gov is the best source for your PIA.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Also remember that future laws, future COLAs, and your final claim date can all change what you end up
          receiving. Treat the results as a planning tool, not personalized advice. For complicated cases, like
          divorce, a government pension, a disability history, or a large age gap between spouses, it's worth checking
          with the SSA or a fee-only advisor.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and No Hidden Catch</h2>
        <p style={pStyle}>
          The calculator is free to use, with no paywall on the results and no hidden charges. You don't need to give
          your Social Security number, and you shouldn't enter it into any calculator. The only things it needs are
          your estimated benefit, birth year, and the ages you want to compare.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The math follows the SSA's published rules, so the monthly numbers aren't based on rough rules of thumb.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mistakes People Make When Choosing a Claiming Age</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Assuming 65 is full retirement age.</strong> That was true for people born in 1937 or earlier. For
            most people now, it's 67. Medicare starts at 65 regardless of when you claim Social Security, which adds to
            the confusion.
          </li>
          <li style={liStyle}>
            <strong>Ignoring the spouse.</strong> A claiming age that looks fine for you can leave a surviving spouse
            with a smaller check.
          </li>
          <li style={liStyle}>
            <strong>Claiming early while working a lot.</strong> If you're under FRA and earning over the limit, you'll
            have benefits withheld, which defeats the purpose of starting early.
          </li>
          <li style={liStyle}>
            <strong>Thinking you can't change your mind.</strong> You have a one-time option to withdraw your
            application within 12 months of first being entitled, but you'd need to pay back everything you received,
            including any Medicare premiums taken out. After you reach FRA, you can also voluntarily suspend your
            benefits to earn delayed credits up to 70.
          </li>
          <li style={liStyle}>
            <strong>Treating the break-even age as a prediction.</strong> It's a comparison point. Nobody knows when
            they'll die, which is exactly why the bigger check carries value.
          </li>
          <li>
            <strong>Skipping the tax angle.</strong> A gross number on a calculator isn't what lands in your bank
            account.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Key Terms in Plain English</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Primary insurance amount (PIA):</strong> the monthly benefit you'd get at full retirement age.
          </li>
          <li style={liStyle}>
            <strong>Full retirement age (FRA):</strong> the age you're entitled to 100% of your PIA, between 66 and 67
            for most people alive today.
          </li>
          <li style={liStyle}>
            <strong>Eligibility age:</strong> the earliest you can claim, which is 62. It's different from FRA.
          </li>
          <li style={liStyle}>
            <strong>AIME:</strong> your average monthly earnings across your best 35 indexed years.
          </li>
          <li style={liStyle}>
            <strong>Bend points:</strong> the dollar cutoffs in the formula where the percentages change.
          </li>
          <li style={liStyle}>
            <strong>Delayed retirement credits:</strong> the 8% yearly bonus for waiting past FRA, up to 70.
          </li>
          <li style={liStyle}>
            <strong>Earnings test:</strong> the rule that withholds benefits if you claim early and earn above the
            limit.
          </li>
          <li>
            <strong>COLA:</strong> the yearly cost-of-living increase tied to inflation.
          </li>
        </ul>
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
