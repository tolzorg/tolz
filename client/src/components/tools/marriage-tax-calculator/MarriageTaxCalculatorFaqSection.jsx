import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a marriage tax penalty?",
    a: "A marriage tax penalty happens when a married couple filing jointly owes more in combined federal income tax than they would have paid as two single filers with the same individual incomes. It typically affects couples with similar, higher incomes rather than couples with a large income gap.",
  },
  {
    q: "What is a marriage tax bonus?",
    a: "A marriage tax bonus occurs when a couple's combined tax bill filing jointly is lower than what they would have paid filing as two single people. This is most common when one spouse earns significantly more than the other.",
  },
  {
    q: "Does getting married always increase your taxes?",
    a: "No. Whether marriage increases or decreases your combined tax bill depends on how your incomes compare. Couples with one dominant earner often see a bonus, while couples with two similar high incomes are more likely to see a penalty.",
  },
  {
    q: "Is it better to file jointly or separately after marriage?",
    a: "For most couples, filing jointly results in a lower combined tax bill and access to more credits and deductions than filing separately. Married filing separately is usually only advantageous in specific circumstances, such as certain medical deduction thresholds or income-based student loan repayment plans.",
  },
  {
    q: "Does the marriage penalty apply to everyone?",
    a: "No. It primarily affects dual-income couples with comparable, higher earnings, since the top federal tax brackets for joint filers aren't fully double the single-filer brackets. Couples with a larger income gap between spouses are more likely to see a bonus instead.",
  },
  {
    q: "What tax year does this calculator use?",
    a: "The calculator is based on current federal income tax brackets and standard deduction amounts for the applicable IRS tax year, so results reflect up-to-date thresholds rather than outdated figures.",
  },
  {
    q: "Do I need to sign up or enter personal details to use this tool?",
    a: "No. The calculator is free, requires no signup, and doesn't collect personal identifying information. You only need approximate income figures to get a result.",
  },
  {
    q: "Does this calculator include state taxes?",
    a: "No, the calculator focuses on federal income tax brackets only. State income tax rules vary widely and are not factored into the comparison.",
  },
  {
    q: "Can this calculator help decide when to get married?",
    a: "It can inform the conversation. Since your filing status for the full tax year is based on your marital status as of December 31, some couples use this kind of comparison to understand the potential tax impact of marrying before versus after year-end.",
  },
  {
    q: "Does getting married on December 31st count as being married for the whole year?",
    a: "Yes. The IRS only looks at your marital status on the last day of the tax year. If you're legally married by December 31st, you're treated as married for all twelve months of that year, even if the wedding happened that same week.",
  },
  {
    q: "Can combining incomes with my spouse disqualify us from tax credits we'd get individually?",
    a: "It can. Because joint filing measures your combined income as a single number, two people who'd each qualify for something like the Earned Income Tax Credit on their own can end up over the income limit once their incomes are added together. This is one of the less obvious ways the marriage penalty shows up.",
  },
  {
    q: "What's a spousal IRA, and why does it matter for married couples?",
    a: "Normally you need your own earned income to contribute to an IRA. A spousal IRA is an exception that only exists for married couples filing jointly; it lets a non-working or low-earning spouse contribute to their own retirement account based on their spouse's income, which isn't available to single filers.",
  },
  {
    q: "Does marriage protect assets from the federal estate tax?",
    a: "Yes, to an extent. Under the unlimited marital deduction, a surviving spouse can inherit assets from their deceased spouse without those assets being subject to federal estate tax. This protection is specific to legally married couples.",
  },
  {
    q: "Are there other taxes where marriage doesn't fully double the single-filer threshold?",
    a: "Yes, a couple of examples worth knowing about are the Net Investment Income Tax (3.8% on investment income above $200,000 single / $250,000 joint) and the Additional Medicare Tax (0.9% on wages above the same $200,000 single / $250,000 joint thresholds). Since $250,000 isn't double $200,000, dual-income couples can cross these thresholds sooner than you'd expect.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "What is a marriage tax penalty?",
    a: "A marriage tax penalty happens when a married couple filing jointly owes more in combined federal income tax than they would have paid as two single filers with the same individual incomes. It typically affects couples with similar, higher incomes rather than couples with a large income gap.",
  },
  {
    q: "What is a marriage tax bonus?",
    a: "A marriage tax bonus occurs when a couple's combined tax bill filing jointly is lower than what they would have paid filing as two single people. This is most common when one spouse earns significantly more than the other.",
  },
  {
    q: "Does getting married always increase your taxes?",
    a: "No. Whether marriage increases or decreases your combined tax bill depends on how your incomes compare. Couples with one dominant earner often see a bonus, while couples with two similar high incomes are more likely to see a penalty.",
  },
  {
    q: "Is it better to file jointly or separately after marriage?",
    a: "For most couples, filing jointly results in a lower combined tax bill and access to more credits and deductions than filing separately. Married filing separately is usually only advantageous in specific circumstances, such as certain medical deduction thresholds or income-based student loan repayment plans.",
  },
  {
    q: "Does the marriage penalty apply to everyone?",
    a: "No. It primarily affects dual-income couples with comparable, higher earnings, since the top federal tax brackets for joint filers aren't fully double the single-filer brackets. Couples with a larger income gap between spouses are more likely to see a bonus instead.",
  },
  {
    q: "What tax year does this calculator use?",
    a: "The calculator is based on current federal income tax brackets and standard deduction amounts for the applicable IRS tax year, so results reflect up-to-date thresholds rather than outdated figures.",
  },
  {
    q: "Do I need to sign up or enter personal details to use this tool?",
    a: "No. The calculator is free, requires no signup, and doesn't collect personal identifying information. You only need approximate income figures to get a result.",
  },
  {
    q: "Does this calculator include state taxes?",
    a: "No, the calculator focuses on federal income tax brackets only. State income tax rules vary widely and are not factored into the comparison.",
  },
  {
    q: "Can this calculator help decide when to get married?",
    a: "It can inform the conversation. Since your filing status for the full tax year is based on your marital status as of December 31, some couples use this kind of comparison to understand the potential tax impact of marrying before versus after year-end.",
  },
  {
    q: "Does getting married on December 31st count as being married for the whole year?",
    a: "Yes. The IRS only looks at your marital status on the last day of the tax year. If you're legally married by December 31st, you're treated as married for all twelve months of that year, even if the wedding happened that same week.",
  },
  {
    q: "Can combining incomes with my spouse disqualify us from tax credits we'd get individually?",
    a: "It can. Because joint filing measures your combined income as a single number, two people who'd each qualify for something like the Earned Income Tax Credit on their own can end up over the income limit once their incomes are added together.",
  },
  {
    q: "What's a spousal IRA, and why does it matter for married couples?",
    a: "A spousal IRA is an exception to the usual earned-income requirement for IRA contributions. It only exists for married couples filing jointly, and it lets a non-working or low-earning spouse contribute to their own retirement account based on their spouse's income.",
  },
  {
    q: "Does marriage protect assets from the federal estate tax?",
    a: "Yes, to an extent. Under the unlimited marital deduction, a surviving spouse can inherit assets from their deceased spouse without those assets being subject to federal estate tax. This protection is specific to legally married couples.",
  },
  {
    q: "Are there other taxes where marriage doesn't fully double the single-filer threshold?",
    a: "Yes. Examples include the Net Investment Income Tax (3.8% on investment income above $200,000 single / $250,000 joint) and the Additional Medicare Tax (0.9% on wages above the same $200,000 single / $250,000 joint thresholds). Since $250,000 isn't double $200,000, dual-income couples can cross these thresholds sooner than expected.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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

export default function MarriageTaxCalculatorFaqSection() {
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
        <h2 style={h2Style}>How the Marriage Tax Calculator Works</h2>
        <p style={pStyle}>
          Getting married changes a lot more than your last name or your relationship status with the IRS,
          it can move your tax bill by a real, noticeable amount, sometimes saving you money and sometimes
          costing you money you didn't see coming. The Marriage Tax Calculator on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> takes each spouse's income and runs it two
          ways: once as a joint married return, and once as if each of you were still filing single, using
          the current U.S. federal income tax brackets. You're not stuck doing the bracket math by hand or
          flipping between two different IRS tables, just plug in the numbers and the tool lays both
          outcomes side by side so you can actually see the difference in dollars.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's why that comparison actually matters. The U.S. runs on a progressive tax system, meaning
          your income gets taxed in layers, not as one flat percentage. When two incomes get combined onto a
          single joint return, that combined pile of money can climb into higher brackets faster than it
          would have separately, or, just as often, it doesn't, and the lower-earning spouse's income
          actually pulls things into a better spot overall. It really depends on how your two incomes stack
          up against each other, and that's exactly what this calculator sorts out for your actual numbers
          instead of making you guess based on general rules of thumb you read somewhere.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the IRS Decides If You're "Married" for Tax Purposes</h2>
        <p style={pStyle}>
          One thing that trips people up: your marital status for the entire tax year comes down to a
          single date, December 31st. If you're legally married on the last day of the year, the IRS treats
          you as married for all twelve months, even if you got married on New Year's Eve. The same logic
          works in reverse. If your divorce is finalized by December 31st, you're considered unmarried for
          the whole year, even if you were married for the first eleven months of it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters more than people realize when it comes to wedding planning. Couples who are close to
          a January vs. December wedding date sometimes run the numbers both ways, because that single date
          decision determines which set of brackets and which filing status applies to the entire year's
          income, not just the days you were actually married.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Marriage Penalty vs. Marriage Bonus: What's the Difference</h2>
        <p style={pStyle}>
          Two phrases come up over and over in any conversation about marriage and taxes: the marriage
          penalty and the marriage bonus. Neither one is an actual law or a separate tax line item, they're
          just shorthand for what happens when you compare a couple's combined tax bill filing jointly
          against what they'd have owed as two single people.
        </p>
        <p style={pStyle}>
          A marriage penalty is when a couple ends up owing more tax filing jointly than they would've paid
          as two individual single filers. This shows up most often when both spouses are earning similar,
          higher incomes, because the joint bracket thresholds aren't a clean doubling of the single
          thresholds across the board, especially once you get into the higher tax brackets, where the
          joint numbers get compressed compared to what two single filers with the same combined income
          would've paid separately.
        </p>
        <p style={pStyle}>
          A marriage bonus is the opposite, the couple pays less filing jointly than they would've as two
          singles. This tends to happen when there's a big income gap between spouses, like one person
          earning a strong salary and the other earning little or nothing. In that setup, joint filing
          effectively lets the higher earner's income spread out across the wider joint brackets, which can
          pull a chunk of it into a lower rate than it would've hit as a single filer.
        </p>
        <p style={pStyle}>
          There's a sneakier version of the penalty too, and it doesn't just hit high earners. Because your
          combined income gets measured as one number on a joint return, two people who each earned a
          modest amount individually can find themselves bumped above the income limits for certain tax
          credits once their incomes are added together, credits either one of them might've qualified for
          on their own. So a couple with two lower-to-moderate incomes can lose access to things like the
          Earned Income Tax Credit purely because combining their income pushed them past the cutoff, even
          though neither income alone would've disqualified them. It's a real penalty, it just shows up as a
          lost credit instead of a higher bracket.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether you land on the penalty side or the bonus side comes down almost entirely to how your two
          incomes compare to each other, which is exactly what this calculator is built to show you using
          your actual numbers, not generic assumptions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Real Perks of Filing Jointly</h2>
        <p style={pStyle}>
          Most married couples end up filing jointly, and it's usually the better move, not just because
          it's simpler, but because a chunk of the tax code is written specifically around the joint-filing
          status. Here's what you actually get access to once you're filing as married filing jointly that
          you didn't have as a single filer:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Credits and deductions that single filers often can't touch.</strong> Things like the
            Earned Income Tax Credit, education credits (the American Opportunity Credit and Lifetime
            Learning Credit), the student loan interest deduction, and the credit for the elderly or
            disabled all come with income and eligibility rules that are generally more favorable, or only
            available at all, under joint filing. Single filers can miss out on these entirely, or qualify
            for a smaller version of them.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>A lower combined tax rate when incomes are lopsided.</strong> If one spouse earns
            considerably more than the other, filing jointly usually means that income gets spread across
            the wider joint brackets instead of hitting the single-filer brackets at full force. That
            difference in income spread is often where the "marriage bonus" comes from.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>A spousal IRA for a non-working or lower-earning spouse.</strong> Normally, you need
            earned income to contribute to an IRA. But once you're married and filing jointly, a spouse who
            isn't working, or who works but earns very little, can still contribute to their own IRA based
            on the working spouse's income. That's a real retirement-savings opportunity that doesn't exist
            for single filers or for a stay-at-home spouse filing separately.
          </li>
          <li>
            <strong>Protection for a surviving spouse's inherited assets.</strong> Federal tax law lets a
            spouse inherit assets from their deceased partner without those assets being hit by the federal
            estate tax, thanks to what's called the unlimited marital deduction. This is a big deal for
            couples with meaningful assets, because it means a surviving spouse isn't forced to deal with
            estate tax on what their partner leaves behind, that protection only exists because they were
            legally married.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Married Filing Separately - Why Almost Nobody Uses It</h2>
        <p style={pStyle}>
          Married filing separately (MFS) is technically an option once you're married, but it's rare that
          it actually saves a couple money. In most cases, filing separately means losing access to several
          credits and deductions altogether, getting a smaller standard deduction relative to what you'd get
          jointly, and often landing in a worse overall tax position than either filing jointly or than
          you'd have been in as two single filers. Because of that, this calculator focuses on the
          comparison that actually matters to most people, joint filing versus your prior single-filer
          status, rather than modeling out separate filing, which is a rare-use case that usually isn't the
          better path.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That said, there are specific situations where filing separately can genuinely make sense: when
          one spouse has heavy medical expenses that only clear the deduction threshold against their
          individual income, when a couple wants to keep their tax liability legally distinct from each
          other (sometimes relevant with student loans or legal exposure), or in certain income-driven
          student loan repayment plans that calculate payments off individual rather than household income.
          Outside of those specific cases, joint filing is almost always the more financially sound choice.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where Marriage Can Quietly Cost You More (Beyond the Basic Brackets)</h2>
        <p style={pStyle}>
          The regular income tax brackets aren't the only place where combining incomes can work against
          you. A few other thresholds in the tax code don't fully double for married couples the way you'd
          expect, and they tend to catch higher-earning dual-income couples off guard:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>The Net Investment Income Tax (NIIT).</strong> This is a 3.8% surtax on investment
            income, think dividends, capital gains, rental income - that kicks in once your modified adjusted
            gross income crosses $200,000 for a single filer, but only $250,000 for a married couple filing
            jointly. That's not double; it's just $50,000 more, which means two single people each earning
            close to $200,000 wouldn't owe this tax individually, but the same two people married and filing
            jointly with the same combined income likely would.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>The Additional Medicare Tax.</strong> Similar story here, this adds an extra 0.9%
            Medicare tax on wages and self-employment income above $200,000 for single filers, but the joint
            threshold is also just $250,000, not $400,000. Two dual-income spouses each earning $150,000
            wouldn't hit this individually, but combined at $300,000 on a joint return, part of that income
            crosses the threshold and gets hit with the extra tax.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Child Tax Credit phase-outs.</strong> The Child Tax Credit starts phasing out at a much
            higher income for joint filers than for single filers, which is a genuine married-filing benefit
            for most families, but it's still a cliff worth knowing about if your household income is high
            enough to approach it, since it can reduce or eliminate the credit depending on how many kids
            you're claiming.
          </li>
          <li>
            <strong>Medicare premium surcharges (IRMAA) down the road.</strong> This one isn't about your tax
            bill directly, but it's connected, once you're on Medicare, the premium surcharge thresholds are
            based on your tax return income from two years prior, and while the joint threshold is generally
            double the single threshold, it's still something dual-income retired couples should keep an eye
            on, since crossing a bracket by even a small amount can add real money to monthly premiums for
            both spouses.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          None of these show up in a basic bracket comparison, but they're exactly the kind of thing that
          turns "we probably owe about the same" into "wait, why is our combined tax bill higher than we
          expected." If your household income is solidly in the six-figure range for both spouses, it's
          worth understanding that these thresholds exist even after you've already worked out where you
          land on the standard brackets.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Need This Tool</h2>
        <p style={pStyle}>
          This isn't just a tool for satisfying curiosity, people pull it up for pretty specific, practical
          reasons. Here's when it actually comes in handy:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Before getting married.</strong> Engaged couples with solid, comparable incomes sometimes
            want to know what they're walking into before they say "I do." If you're weighing a
            late-December wedding against an early-January one, this is exactly the kind of decision that
            comparison can inform, since, as covered above, your status on December 31st decides your filing
            status for the whole year.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Deciding between filing jointly and filing separately.</strong> Even though joint filing
            wins out for most couples, it's still worth confirming that for your specific income split
            rather than just assuming it. Running your numbers against your old single-filer status gives
            you a real number to compare against, instead of relying on the general advice that "joint is
            usually better."
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>After a raise, a new job, or picking up freelance work.</strong> Once one spouse's income
            shifts meaningfully, a promotion, a new job, a side hustle that's taken off, the household's
            combined income profile changes too. Rerunning the calculator after a big income change helps
            you see whether you've drifted closer to penalty territory or bonus territory, and it's also a
            good gut-check before adjusting your W-4 withholding.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Working through financial planning with an advisor or on your own.</strong> Financial
            planners and accountants use this kind of comparison to help couples make calls on things like
            retirement contributions, timing a bonus or stock vesting for a particular tax year, and whether
            itemizing deductions makes more sense than taking the standard deduction now that you're married.
          </li>
          <li>
            <strong>Figuring out if a second income is really worth it.</strong> Because joint brackets treat
            your combined income as one pool, the marginal tax rate on a second paycheck can be a lot higher
            than it looks at first glance. This calculator makes that marginal hit visible instead of leaving
            you to eyeball it off a gross salary number.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>2025 Federal Tax Brackets: Joint vs. Single Filing</h2>
        <p style={pStyle}>
          The calculator's numbers are pulled straight from the IRS's federal income tax brackets for the
          2025 tax year, the one you'll file in 2026. Laying the joint and single brackets side by side
          makes it a lot easier to see why the tool can spit out a bonus for one couple and a penalty for
          another.
        </p>
        <p style={pStyle}><strong>Married Filing Jointly (2025):</strong></p>
        <ul style={ulStyle}>
          <li>10% on income up to $23,850</li>
          <li>12% on income from $23,851 to $96,950</li>
          <li>22% on income from $96,951 to $206,700</li>
          <li>24% on income from $206,701 to $394,600</li>
          <li>32% on income from $394,601 to $501,050</li>
          <li>35% on income from $501,051 to $751,600</li>
          <li>37% on income above $751,600</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}><strong>Single Filers (2025):</strong></p>
        <ul style={ulStyle}>
          <li>10% on income up to $11,925</li>
          <li>12% on income from $11,926 to $48,475</li>
          <li>22% on income from $48,476 to $103,350</li>
          <li>24% on income from $103,351 to $197,300</li>
          <li>32% on income from $197,301 to $250,525</li>
          <li>35% on income from $250,526 to $626,350</li>
          <li>37% on income above $626,350</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Look closely and you'll notice most of the joint brackets are just about double the single
          brackets, that's not an accident, and it's a big part of why couples with a wide income gap tend
          to land on the bonus side. But the top two brackets, 35% and 37%, break that pattern. The joint
          35% bracket runs all the way up to $751,600, while a single filer hits the 35% rate at $626,350.
          If you had two single filers each earning that same higher income, they'd individually stay under
          the 35% threshold longer than they would have combined on a joint return. That compression at the
          top is really the structural reason higher-earning, dual-income couples end up seeing a penalty
          more often than everyone else. The standard deduction, by contrast, stays neutral, for 2025 it's
          $30,000 for joint filers and $15,000 for single filers, an exact doubling, so it doesn't tip the
          scale either way based on how your incomes are split.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and How This Tool Handles Your Data</h2>
        <p style={pStyle}>
          The Marriage Tax Calculator is free to use, and there's no account to create, no email to hand
          over, no signup wall to click through. You type in income numbers, the calculation runs right
          there, and nothing you enter gets stored or saved anywhere. Since the tool only needs income
          figures to do its job, it never asks for your name, your Social Security number, or anything else
          that could identify you, none of that is necessary to get an accurate result.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The math behind it is built on the IRS's official, published federal income tax bracket thresholds
          and standard deduction amounts for the relevant tax year, run through standard progressive bracket
          calculations. One thing worth being upfront about: this tool is built to give you a clear, fast
          read on the marriage penalty or bonus based on federal income tax brackets specifically, it's not
          modeling state income taxes, tax credits, itemized deductions, self-employment tax, or every other
          variable that could nudge your actual tax bill up or down. If you want an exact number to file
          with, it's worth pairing this estimate with a real tax professional or full tax prep software,
          especially in a year where your income changed a lot or you've got major deductions to account
          for.
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
