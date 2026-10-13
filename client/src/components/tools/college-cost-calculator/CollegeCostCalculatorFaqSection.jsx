import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the total cost of college?",
    a: "Start with one year's cost of attendance, grow it by a yearly tuition increase for each year until you enroll and each year you're in school, then add the annual totals together. The calculator handles the compounding for you.",
  },
  {
    q: "How much will college cost in 18 years?",
    a: "It depends on the school and the rate of increase. At $25,000 a year today and a 4% annual rise, the first year would be about $50,600 and the four-year total would pass $215,000. Plug in your own numbers for a figure that fits.",
  },
  {
    q: "How much should I save per month for college?",
    a: "Take the projected total, subtract what you already have, and divide by the months left. Then decide how much of the cost you want to cover yourself. If you invest the money, growth lowers the monthly amount, though returns aren't guaranteed.",
  },
  {
    q: "How much does college cost per year?",
    a: "It varies widely. In-state public schools usually cost much less than private colleges or out-of-state public schools, and community colleges are cheaper still. Check College Navigator or the school's own cost page for current figures.",
  },
  {
    q: "What is the average yearly increase in college tuition?",
    a: "A range of 3% to 6% is a common planning assumption, though it changes by year, state, and school type. Testing a low, middle, and high case is smarter than relying on one guess.",
  },
  {
    q: "What does \"value in today's money\" mean?",
    a: "It's the projected future cost discounted back to current purchasing power. It shows how big your goal is compared to today's prices and income.",
  },
  {
    q: "What's the difference between sticker price and net price?",
    a: "Sticker price is what a school advertises. Net price is what you pay after grants and scholarships. Every U.S. college has a net price calculator on its site.",
  },
  {
    q: "What's the difference between the EFC and the SAI?",
    a: "The Student Aid Index replaced the Expected Family Contribution on the FAFSA starting with the 2024–25 school year. Both estimate what a family can contribute, but the SAI uses an updated formula.",
  },
  {
    q: "Does the calculator include room and board?",
    a: "Only if it's part of your starting number. Use the full cost of attendance for the most realistic result.",
  },
  {
    q: "Is a 529 plan the best way to save for college?",
    a: "It's popular thanks to the tax advantages, but it depends on your state, income, and goals. Compare plans, fees, and investment options, and consider talking to a financial professional.",
  },
  {
    q: "What can I use 529 money for?",
    a: "Tuition, fees, books, required supplies, computers, internet access, and room and board for students enrolled at least half-time. Transportation and health insurance don't qualify.",
  },
  {
    q: "What happens if my child doesn't go to college?",
    a: "You can change the beneficiary to another eligible family member, hold the account for later, or withdraw it. Earnings on a non-qualified withdrawal are generally taxed and carry a 10% penalty, with some exceptions.",
  },
  {
    q: "Is this college cost calculator free?",
    a: "Yes. It's free, with no signup needed to see your results.",
  },
  {
    q: "Can I use it to cover only part of the cost?",
    a: "Yes. Set the percentage you want to fund and the monthly figure adjusts.",
  },
  {
    q: "How accurate are the results?",
    a: "They're planning estimates. The math is standard, but real tuition, aid, and investment returns will vary, so update your numbers every year.",
  },
];

// The structured-data FAQ covers a subset of the visible questions, as supplied.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How do I calculate the total cost of college?",
    a: "Start with one year's cost of attendance, grow it by a yearly tuition increase for each year until you enroll and each year you're in school, then add the annual totals together. The calculator handles the compounding for you.",
  },
  {
    q: "How much should I save per month for college?",
    a: "Take the projected total, subtract what you already have, and divide by the months left. Then decide how much of the cost you want to cover yourself. If you invest the money, growth lowers the monthly amount, though returns aren't guaranteed.",
  },
  {
    q: "What is the average yearly increase in college tuition?",
    a: "A range of 3% to 6% is a common planning assumption, though it changes by year, state, and school type. Testing a low, middle, and high case is smarter than relying on one guess.",
  },
  {
    q: "What does value in today's money mean?",
    a: "It's the projected future cost discounted back to current purchasing power. It shows how big your goal is compared to today's prices and income.",
  },
  {
    q: "What's the difference between sticker price and net price?",
    a: "Sticker price is what a school advertises. Net price is what you pay after grants and scholarships. Every U.S. college has a net price calculator on its website.",
  },
  {
    q: "What's the difference between the EFC and the SAI?",
    a: "The Student Aid Index replaced the Expected Family Contribution on the FAFSA starting with the 2024-25 school year. Both estimate what a family can contribute, but the SAI uses an updated formula.",
  },
  {
    q: "What can I use 529 money for?",
    a: "Tuition, fees, books, required supplies, computers, internet access, and room and board for students enrolled at least half-time. Transportation and health insurance don't qualify.",
  },
  {
    q: "Is this college cost calculator free?",
    a: "Yes. It's free, with no signup needed to see your results.",
  },
  {
    q: "How accurate are the results?",
    a: "They're planning estimates. The math is standard, but real tuition, aid, and investment returns will vary, so update your numbers every year.",
  },
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

export default function CollegeCostCalculatorFaqSection() {
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
        <h2 style={h2Style}>What the College Cost Calculator Does</h2>
        <p style={pStyle}>The tool does three things, in this order.</p>
        <p style={pStyle}>
          First, it starts with what one year of college costs right now. Second, it applies a yearly increase, both
          during the years before you enroll and during the years you're actually in school. Third, it adds up the
          whole bill and works backward to a monthly savings number.
        </p>
        <p style={pStyle}>You end up with three results:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Total projected cost.</strong> What the full program will likely cost in future dollars.
          </li>
          <li style={liStyle}>
            <strong>Value in today's money.</strong> The same total, adjusted so you can compare it to current prices
            and income.
          </li>
          <li>
            <strong>Monthly savings needed.</strong> What you'd need to set aside each month to cover all of it, or
            just a share of it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It only takes a minute to run, so try a few versions. Switch the school type, shorten the timeline, drop the
          percentage you want to cover, and watch how the monthly number moves.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Goes Into the Cost of College</h2>
        <p style={pStyle}>
          A lot of people plug in tuition and stop there. That's the most common reason families come up short,
          because tuition is usually the biggest piece but it's not the whole thing. Schools use the term cost of
          attendance, or COA, for the full yearly figure. Here's what's in it.
        </p>

        <h3 style={h3Style}>Tuition and fees</h3>
        <p style={pStyle}>
          Tuition is what you pay for instruction. It swings a lot depending on the school, the program, how many
          credit hours you take, and whether you're considered a resident. Public colleges charge residents far less,
          and out-of-state students often pay close to double. Fees are separate. They cover things like the gym, the
          library, tech services, and student activities. Some programs, such as nursing, engineering, and art, add
          their own lab or studio fees on top.
        </p>

        <h3 style={h3Style}>Room and board</h3>
        <p style={pStyle}>
          If you live on campus, housing and a meal plan come bundled in. Meal plans vary, from a set number of meals a
          week to unlimited dining hall access. Some schools require first-year students to live on campus, so living
          at home isn't always an option. Students who do live with family skip this cost, though the school still
          includes a budget for it in its COA figure. Off-campus rent, utilities, and groceries are a different budget
          entirely, and in expensive cities they can run higher than a dorm.
        </p>

        <h3 style={h3Style}>Textbooks and supplies</h3>
        <p style={pStyle}>
          Course materials cost real money, and textbook prices have climbed for years. Buying used, renting, or using
          the library's copy can cut this down a lot. Some scholarships cover books too. Your school's COA will list a
          typical yearly figure, but it's an average, and a pre-med schedule looks nothing like an English major's.
        </p>

        <h3 style={h3Style}>The costs people forget</h3>
        <p style={pStyle}>This is the stuff that blows up a budget:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>A laptop, and maybe a better one if your major needs it</li>
          <li style={liStyle}>Transportation, whether that's a bus pass, gas, parking permits, or flights home</li>
          <li style={liStyle}>
            Health insurance, if you can't stay on a parent's plan or the school requires its own
          </li>
          <li style={liStyle}>Furniture, bedding, and dorm supplies in year one</li>
          <li style={liStyle}>Summer housing, if you're not heading home</li>
          <li style={liStyle}>Study abroad, which can cost more or less than a regular semester</li>
          <li>Personal spending, from phone bills to the occasional pizza</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some colleges also publish a comprehensive fee, which bundles tuition, fees, and room and board into a single
          number. If a school does that, make sure you know exactly what's in it before comparing it with another
          school's itemized price.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Tuition Keeps Rising, and Why That Changes Your Number</h2>
        <p style={pStyle}>
          College prices have gone up faster than general inflation for decades, and that's the reason a flat estimate
          doesn't work. The pace changes by year, by state, and by type of school. Public schools tend to jump when
          state funding drops, since the shortfall lands on tuition. Private schools raise sticker prices but often
          give back more in aid.
        </p>
        <p style={pStyle}>
          For planning, a yearly increase somewhere between 3% and 6% is a reasonable range. The exact figure matters
          less than building a range into your thinking, because the compound increases. Each year's bump is applied
          on top of the last one. That's why a program costing $25,000 a year today won't cost $25,000 a decade from
          now.
        </p>
        <p style={pStyle}>
          Here's a quick example. Say you're looking at $25,000 a year, enrollment starts in 10 years, it's a four-year
          program, and tuition rises 4% annually. Your four annual bills would come out to about $37,000, $38,500,
          $40,000, and $41,600. That's roughly $157,000 total.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Now stretch the timeline. With 18 years to go, which is about right for a newborn, that same $25,000 grows to
          around $50,600 for the first year alone, and the four-year total passes $215,000. It sounds scary, but it's
          also why starting early works so well.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Future Dollars vs. Today's Money</h2>
        <p style={pStyle}>
          That $157,000 figure is real, but it's hard to judge on its own. A dollar in ten years buys less than a
          dollar today, so the calculator also shows the value in today's money, sometimes called present value.
        </p>
        <p style={pStyle}>
          Using a 3% inflation assumption, that same $157,000 is worth about $112,000 in current purchasing power.
          Both numbers are right. They just answer different questions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The future total is how many actual dollars you'll hand over. The today's-money version tells you how heavy
          the goal is compared with what you earn and spend now. If your household makes $90,000 a year, a $112,000
          goal spread over a decade feels a lot more manageable than "$157,000" does.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sticker Price vs. Net Price</h2>
        <p style={pStyle}>
          The advertised price is the sticker price. What you pay after grants and scholarships is the net price, and
          for a lot of families the gap is big. Private colleges in particular often list a high sticker price and then
          discount it heavily for most students.
        </p>
        <p style={pStyle}>
          U.S. law requires every college and university to post a net price calculator on its website. They all do
          the same basic job, which is estimating what you would pay at that school. Some take a few minutes and ask
          only for basics. Others want tax return details, W-2 info, GPA, or test scores.
        </p>
        <p style={pStyle}>A few honest warnings about them:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            They're estimates, not offers. The real aid package comes after you apply and get admitted.
          </li>
          <li style={liStyle}>
            Each school builds its own calculator, so results aren't always comparable. One might include loans in the
            "net price" while another leaves them out. Read the fine print.
          </li>
          <li>
            They can't account for everything, like changes in your income or the school's budget in a given year.
          </li>
        </ul>
        <p style={pStyle}>
          If you want a quick look at what schools really charge, the federal College Navigator tool (run by the
          National Center for Education Statistics) lets you search by school and see published costs and average net
          prices. The College Scorecard is another good place to compare. Then use this college cost calculator to
          project those numbers forward, since the net price calculators only tell you about this year.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A decent workflow is to grab the net price from the school's own calculator, type that in as your starting
          annual cost, and let the tool grow from there.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Financial Aid Fits In</h2>
        <p style={pStyle}>
          The calculator projects the sticker cost and your savings target. Aid is what can shrink that target. It's
          worth understanding how it works, because many families leave money on the table by assuming they won't
          qualify.
        </p>
        <p style={pStyle}>
          Aid comes in four basic forms: grants, scholarships, work-study, and loans. Most students end up with a mix.
        </p>

        <h3 style={h3Style}>Grants</h3>
        <p style={pStyle}>
          A grant is money you don't have to repay. Most come from the federal government, though states and schools
          have them too, and some are based on need, merit, or specific circumstances.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Pell Grants</strong> are the most common federal grant. They go to undergraduates with financial
            need who haven't earned a bachelor's degree. The maximum award has been around $7,400 a year recently, but
            it changes, so check studentaid.gov for the current number.
          </li>
          <li style={liStyle}>
            <strong>FSEOG</strong> (Federal Supplemental Educational Opportunity Grants) go to undergrads with
            exceptional need. Funding is limited and handled by each school's aid office, so applying early matters.
          </li>
          <li>
            <strong>TEACH Grants</strong> help students who plan to teach high-need subjects in low-income schools.
            There's a catch worth knowing: if you don't complete the required teaching service, the grant converts to a
            loan.
          </li>
        </ul>

        <h3 style={h3Style}>Scholarships</h3>
        <p style={pStyle}>
          Scholarships are also free money. They come from schools, community groups, employers, companies, and
          nonprofits. Some are need-based, but plenty are merit-based, rewarding grades, athletics, music, art,
          leadership, or a specific background or career goal. Merit scholarships don't depend on family income, which
          means higher-earning families can still land them.
        </p>
        <p style={pStyle}>
          A tip most people don't hear: small local scholarships are often less competitive. A $1,000 award from a
          local civic group might get 20 applicants instead of 20,000. A few of those every year add up, and they're
          easy to count against your monthly target.
        </p>

        <h3 style={h3Style}>Work-study</h3>
        <p style={pStyle}>
          Federal Work-Study gives students with financial need a part-time job, usually on campus. Think library desk,
          athletic office, or residence hall front desk. The pay is often modest, but the setup has real perks.
          Schedules are built around classes, there's no commute, and work-study earnings generally aren't counted
          against you on the next year's aid application. The standard cap is around 15 hours a week, which is a
          typical guideline more than a hard rule.
        </p>
        <p style={pStyle}>
          Not every aid package includes work-study, and not every student gets all they're offered, so ask the
          financial aid office.
        </p>

        <h3 style={h3Style}>Loans</h3>
        <p style={pStyle}>
          Loans are the most common form of aid, and unlike the others, they have to be paid back with interest.
          Federal loans usually have friendlier terms than private ones.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Direct Subsidized Loans</strong> are for undergrads with demonstrated need. The government covers
            the interest while you're in school at least half-time, so the balance doesn't grow until repayment starts.
          </li>
          <li style={liStyle}>
            <strong>Direct Unsubsidized Loans</strong> don't require need, but interest starts building immediately,
            even while you're in school.
          </li>
          <li>
            <strong>Private loans</strong> come from banks and other lenders. Rates and terms vary widely, and you
            generally lose the federal protections like income-driven repayment.
          </li>
        </ul>
        <p style={pStyle}>
          Federal loan limits and programs have been changing, including new caps on some parent and graduate borrowing
          that took effect in 2026. If loans are part of your plan, check studentaid.gov for the current rules before
          you count on a certain amount.
        </p>
        <p style={pStyle}>
          Whatever you borrow becomes a bill later, so treat loans as the last piece of the plan, not the first. A
          monthly savings target is often the cheapest way to borrow less.
        </p>

        <h3 style={h3Style}>Tax credits</h3>
        <p style={pStyle}>
          One more thing people overlook. The American Opportunity Tax Credit is worth up to $2,500 per eligible
          student for the first four years of college, and the Lifetime Learning Credit offers up to $2,000 per
          return. Neither one lowers your sticker price, but they put some of it back at tax time. Income limits apply.
        </p>

        <h3 style={h3Style}>How the FAFSA works</h3>
        <p style={pStyle}>
          Nearly all federal aid and many school and state programs start with the Free Application for Federal
          Student Aid, or FAFSA. It's free, and the form opens every year on October 1 for the following school year.
          Some state and school aid is first-come, first-served, so earlier is better.
        </p>
        <p style={pStyle}>
          The FAFSA produces a number called the Student Aid Index (SAI). You'll still see the older term, Expected
          Family Contribution (EFC), on lots of websites, because the SAI replaced it starting with the 2024–25 form.
          They work in the same general way. The SAI is an index the school uses to measure what your family can
          contribute, based on income, assets, and household details. Schools then subtract it from their cost of
          attendance to figure out your demonstrated need.
        </p>
        <p style={pStyle}>
          The basic math looks like this. If a school costs $30,000 and your SAI is $10,000, your calculated need is
          $20,000. The school then builds an aid package to cover some or all of that. How much of the gap they
          actually fill varies a lot from school to school.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Aid doesn't show up in the calculator's projection, so treat it as a bonus on top of your plan rather than
          something to depend on.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much to Save Each Month</h2>
        <p style={pStyle}>
          This is the number most people come here for. The monthly savings estimate takes the projected total,
          subtracts what you've already saved, and spreads the rest over the months you have left.
        </p>
        <p style={pStyle}>
          Going back to our example, covering the full $157,000 over 120 months with zero investment growth means about
          $1,310 a month. That's a hard number for most households, so it helps to see which dials you can turn.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Add some investment growth.</strong> Money saved in a long-term investment account typically earns
            something. If you assume a 5% annual return, that same goal drops to about $1,010 a month, since your
            savings are working too. Returns aren't guaranteed, and markets go down sometimes, so treat this as a rough
            gauge.
          </li>
          <li style={liStyle}>
            <strong>Start earlier.</strong> Time does a lot of the work. The same $157,000 goal over 18 years instead of
            10 is a much smaller monthly bite.
          </li>
          <li style={liStyle}>
            <strong>Aim for a share, not the whole thing.</strong> Many families target a third or half. The rest comes
            from aid, scholarships, student earnings, and maybe some borrowing. A goal you can actually stick to beats a
            perfect goal you abandon.
          </li>
          <li style={liStyle}>
            <strong>Count your existing balance.</strong> Savings you've already built shrink the gap, and the growth on
            that balance helps too.
          </li>
          <li>
            <strong>Pick a cheaper path.</strong> Two years at a community college and then a transfer to a four-year
            school can cut the total dramatically.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>529 Plans: A Popular Place to Put the Money</h2>
        <p style={pStyle}>
          Once you know your monthly target, the next question is where to keep it. The most common answer is a 529
          plan. It's named after Section 529 of the Internal Revenue Code, and it's built for education savings.
        </p>

        <h3 style={h3Style}>529 savings plans</h3>
        <p style={pStyle}>
          You put money into investments, usually mutual funds or similar portfolios, and the account grows
          tax-deferred. When you use the money for qualified education expenses, the withdrawals are free of federal
          income tax, and usually state income tax too.
        </p>
        <p style={pStyle}>A few things worth knowing:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Contributions aren't federally deductible,</strong> but many states give a state tax deduction or
            credit for putting money into their plan.
          </li>
          <li style={liStyle}>
            <strong>You're not stuck with your home state's plan.</strong> Almost every state runs its own, and most
            let any U.S. resident open one. Someone in California can use a Vermont plan to pay for school in New York.
            Just check whether you'd lose a home-state tax break by going elsewhere.
          </li>
          <li style={liStyle}>
            <strong>Age-based portfolios are common.</strong> The investment mix shifts to more conservative holdings
            as the student gets closer to college age, much like a target-date retirement fund. That lowers risk as you
            get near the finish line, but doesn't remove it. It's still market investing and the value can drop.
          </li>
          <li style={liStyle}>
            <strong>Starting early and staying consistent works best.</strong> Compounding needs time.
          </li>
          <li>
            <strong>It helps with aid.</strong> A 529 owned by a parent or a dependent student is generally reported as
            a parent asset on the FAFSA, and parent assets are assessed at a much lower rate than student assets, which
            are assessed at about 20%. Rules also changed so that distributions from a grandparent-owned 529 no longer
            count as student income on the FAFSA. Previously that could hurt aid, so it's good news for families
            getting help from grandparents.
          </li>
        </ul>

        <h3 style={h3Style}>What counts as a qualified expense</h3>
        <p style={pStyle}>
          You can use 529 money, both your contributions and the earnings, tax-free for:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Tuition and fees</li>
          <li style={liStyle}>Textbooks, supplies, and required course materials</li>
          <li style={liStyle}>Room and board, for students enrolled at least half-time</li>
          <li style={liStyle}>Computers, related equipment, and internet access</li>
          <li>Equipment for students with special needs</li>
        </ul>
        <p style={pStyle}>
          A few things don't qualify, including transportation, health insurance, and student loan payments (though
          there are limited exceptions for loan repayment under federal law). Since the 2017 tax law, you can also use
          up to $10,000 a year for K-12 tuition. Congress has since raised that cap for later years, so check current
          rules if that's your plan.
        </p>

        <h3 style={h3Style}>What if you don't use it all?</h3>
        <p style={pStyle}>
          You can withdraw contributions anytime. But the earnings part of a non-qualified withdrawal is usually taxed
          as regular income and hit with a 10% penalty, though there are exceptions, such as when the student gets a
          scholarship or attends a military academy.
        </p>
        <p style={pStyle}>
          You also have options before it gets to that point. You can change the beneficiary to another family member,
          including a sibling, cousin, or yourself. And under federal rules introduced in 2023, a long-held 529 account
          can roll over some leftover funds into a Roth IRA for the beneficiary, up to a lifetime cap of $35,000, with
          conditions on how old the account is and annual Roth limits. It's worth reading the details before you plan
          around it.
        </p>

        <h3 style={h3Style}>529 prepaid plans</h3>
        <p style={pStyle}>
          There's a second type that's less common, the prepaid plan. You buy tuition credits now, either as a lump sum
          or in installments, and the plan covers a matching amount of tuition later, usually at participating in-state
          public schools. Because you're locking in today's prices, it works as a hedge against tuition inflation.
        </p>
        <p style={pStyle}>The tradeoffs are real, though:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>They tend to cover only tuition and fees, not room, board, or books.</li>
          <li style={liStyle}>They often work best if you attend an in-state public school.</li>
          <li style={liStyle}>
            They're less flexible if plans change. Cancel and many only refund what you put in, with reduced or no
            earnings, and some charge a fee.
          </li>
          <li>
            Only a handful of states offer them, and some have closed to new enrollment, so check what's open to you.
          </li>
        </ul>
        <p style={pStyle}>
          There's also a separate prepaid option for private colleges, the Private College 529 Plan, which is accepted
          by a few hundred participating private schools. You can hold both a savings plan and a prepaid plan at the
          same time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most families, a 529 savings plan is the more flexible tool. Prepaid plans fit best when you're already
          sure about an in-state public school.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Practical Scenarios: When This Tool Helps</h2>
        <p style={pStyle}>
          <strong>You just had a baby.</strong> Eighteen years is a long runway. Run the numbers at 3%, 4%, and 6%
          tuition growth and see how small a monthly amount can make a dent if you start now.
        </p>
        <p style={pStyle}>
          <strong>Your kid's in middle or high school.</strong> The timeline's shorter, so the monthly figure goes up.
          Use the calculator to decide how much of the cost to fund yourself and how much to cover with aid,
          scholarships, or a more affordable school.
        </p>
        <p style={pStyle}>
          <strong>You're comparing schools.</strong> Enter the net price from each school's own calculator. A $20,000
          yearly difference turns into a six-figure gap over four years once tuition increases are added in.
        </p>
        <p style={pStyle}>
          <strong>You're an adult going back to school.</strong> Shorten the timeline and the number of years. The tool
          works the same way for a certificate, associate degree, or master's.
        </p>
        <p style={pStyle}>
          <strong>You're a grandparent or relative who wants to help.</strong> Figure out a monthly gift that makes a
          real difference. Just check how it's structured, since a 529 you own is treated differently than cash given
          directly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>You're a counselor or advisor.</strong> It's a fast way to put a realistic number in front of a
          family before getting into a more detailed plan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Calculator</h2>
        <p style={pStyle}>Grab these numbers first:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Current annual cost.</strong> Use the full cost of attendance, or better yet, the net price from the
            school's calculator.
          </li>
          <li style={liStyle}>
            <strong>Years until enrollment.</strong> A newborn is about 18.
          </li>
          <li style={liStyle}>
            <strong>Years of study.</strong> Four for a bachelor's, two for an associate, more for graduate or
            professional programs.
          </li>
          <li style={liStyle}>
            <strong>Expected yearly tuition increase.</strong> Start with 3% to 5%, then test a lower and a higher
            number.
          </li>
          <li style={liStyle}>
            <strong>Inflation rate.</strong> This drives the today's-money value.
          </li>
          <li style={liStyle}>
            <strong>Savings already set aside.</strong> Any existing college fund balance.
          </li>
          <li>
            <strong>Share of the cost you want to cover.</strong> 100% for the whole thing, or less for a partial goal.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then look at your three results. If the monthly number's too big, change one input at a time. That way you
          can see what actually moves the needle instead of guessing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ways to Bring the Total Down</h2>
        <p style={pStyle}>The numbers aren't fixed. Here are the moves that tend to make the biggest difference.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Start at a community college.</strong> Plenty of states have transfer agreements that guarantee
            credits will count at in-state public universities. Check them before you enroll, since credits that don't
            transfer erase the savings.
          </li>
          <li style={liStyle}>
            <strong>Earn credit before you start.</strong> AP exams, CLEP tests, and dual enrollment (taking college
            classes in high school) can cut a semester or more. Check each school's credit policy first, because it
            varies.
          </li>
          <li style={liStyle}>
            <strong>Plan for the real timeline.</strong> Plenty of students take longer than four years to finish. If
            you want a safer estimate, run the tool for five years to see what a delay would cost.
          </li>
          <li style={liStyle}>
            <strong>Look at tuition discounts.</strong> Some states offer reduced out-of-state rates through regional
            exchange programs, and some schools have tuition guarantee programs that lock your rate for four years.
          </li>
          <li style={liStyle}>
            <strong>Find a cheaper housing setup.</strong> Living at home, a lower-cost meal plan, or becoming a
            resident assistant can cut thousands off the yearly bill.
          </li>
          <li style={liStyle}>
            <strong>Apply for scholarships every year,</strong> not just as a senior. Many are open to current college
            students.
          </li>
          <li style={liStyle}>
            <strong>Compare net prices, not sticker prices.</strong> A school with a $60,000 sticker price and a big aid
            offer can end up cheaper than a $30,000 school with none.
          </li>
          <li>
            <strong>Revisit your plan every year.</strong> Income, savings, and tuition announcements all change. A
            yearly check-in lets you adjust before a small shortfall gets big.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Worth It? A Quick Reality Check</h2>
        <p style={pStyle}>
          Cost isn't the only side of the story. On average, people with a bachelor's degree earn more over their
          lifetimes than those with only a high school diploma, and they're less likely to be unemployed. Jobs that
          require a degree also tend to come with perks like health coverage and retirement plans.
        </p>
        <p style={pStyle}>
          That said, averages hide a lot. What you study, where you go, and how much you borrow all change the return.
          A degree with a modest salary outlook and heavy debt is a very different deal than a high-demand field with
          low debt. It's worth looking at what graduates from your program actually earn, which the College Scorecard
          shows by school, and weighing that against what you'll pay. The calculator can handle the cost side of that
          comparison.
        </p>

        <h3 style={h3Style}>College vs. University</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Quick note since the terms get mixed up. In everyday U.S. usage, "college" usually means a two-year associate
          or four-year bachelor's program, while "university" often means an institution that also offers graduate
          degrees. Schools themselves aren't always consistent about it. Either way, this calculator works for any
          program, including community colleges, trade schools, public and private four-year schools, and graduate
          programs. Just enter the right cost and duration.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is the Tool Free, Accurate, and Private?</h2>
        <p style={pStyle}>
          It's free to use, and you don't need to create an account to see your results. Type in your numbers and the
          results appear on the page.
        </p>
        <p style={pStyle}>
          On accuracy, the tool uses standard compound growth and present-value math, so the output is only as reliable
          as what you put in. It's a planning estimate. It isn't a quote from a school, and it isn't financial or tax
          advice. Real tuition, aid packages, and investment returns will differ. If you're making a big decision,
          especially around 529 plans, loans, or tax credits, talk to a qualified financial professional and check the
          official rules at studentaid.gov, IRS.gov, and your state's plan website.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator only asks for planning figures like costs, timelines, and percentages. You don't need to enter
          your name, Social Security number, or any account details.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Quick Glossary</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Cost of attendance (COA):</strong> The full yearly cost, including tuition, fees, housing, food,
            books, transportation, and personal expenses.
          </li>
          <li style={liStyle}>
            <strong>Net price:</strong> COA minus grants and scholarships.
          </li>
          <li style={liStyle}>
            <strong>Sticker price:</strong> The published price before any aid.
          </li>
          <li style={liStyle}>
            <strong>Student Aid Index (SAI):</strong> The FAFSA number schools use to gauge a family's ability to pay.
            It replaced the EFC.
          </li>
          <li style={liStyle}>
            <strong>Present value:</strong> A future dollar amount expressed in today's purchasing power.
          </li>
          <li style={liStyle}>
            <strong>Subsidized loan:</strong> A federal loan where the government pays interest while you're in school.
          </li>
          <li>
            <strong>529 plan:</strong> A tax-advantaged account for education savings.
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
