import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is it better to rent or buy a house?",
    a: "It depends on how long you’ll stay, how local prices compare to rents, your mortgage rate, and what your savings could earn if invested. This calculator compares both options for every stay from 1 to 30 years so you can see where the balance shifts.",
  },
  {
    q: "What is the break-even point in a rent vs buy comparison?",
    a: "It’s the first year when buying leaves you financially ahead of renting. Before that year, renting costs less overall once everything is counted. After it, owning is ahead under your assumptions.",
  },
  {
    q: "How long do I need to stay in a home for buying to make sense?",
    a: "There’s no one number, but transaction costs usually mean you need several years. Many people use five years as a minimum. The calculator shows your own break-even based on your inputs.",
  },
  {
    q: "What is the 5% rule for rent vs buy?",
    a: "Multiply the home’s price by 5%, divide by 12, and compare the result to monthly rent for a similar place. The 5% covers property tax, maintenance, and the cost of tying up your money. If rent is lower than that figure, renting is probably cheaper.",
  },
  {
    q: "What is a good price-to-rent ratio?",
    a: "Divide the home’s price by a year of rent. Under about 15 tends to favor buying, 16 to 20 is a gray area, and above 20 usually favors renting. It’s a rough guide, not a rule.",
  },
  {
    q: "Does the calculator include property tax, insurance, and maintenance?",
    a: "Yes. It factors in taxes, maintenance, appreciation, and investment returns, so you get a fuller picture than comparing a mortgage payment against rent.",
  },
  {
    q: "Why does a renter’s investment return matter?",
    a: "A renter keeps the down payment and any monthly savings and can invest them. Leaving that out would make buying look better than it is, so the comparison treats it as opportunity cost.",
  },
  {
    q: "What are typical closing costs when buying a home?",
    a: "Usually 2% to 6% of the loan amount, covering lender fees, appraisal, title insurance, and prepaid items. Your actual costs depend on your lender, location, and how you negotiate.",
  },
  {
    q: "How much should I budget for home maintenance?",
    a: "Many people plan on 1% to 2% of the home’s value each year. Older homes and homes with big systems nearing the end of their life can cost more.",
  },
  {
    q: "What appreciation rate should I use?",
    a: "Start with a conservative figure based on your local market’s long-run history, then try lower and higher values. If buying wins in all of them, the result is more dependable.",
  },
  {
    q: "Is renting really “throwing money away”?",
    a: "No. Rent pays for housing and flexibility, just like interest, taxes, insurance, and repairs do for an owner. Owners build equity through principal payments, but they also pay costs they never get back. The calculator shows both sides.",
  },
  { q: "Do I need to sign up to use this calculator?", a: "No. Open the page, enter your numbers, and read the results." },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_QUESTION_OVERRIDES = { "Is renting really “throwing money away”?": "Is renting really throwing money away?" };
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(FAQ_SCHEMA_QUESTION_OVERRIDES[item.q] ?? item.q), a: straight(item.a) }));

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

// Small layout helpers: every card drops the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function RentVsBuyCalculatorFaqSection() {
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
      <style>{".faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="How the Rent vs Buy Calculator Works">
        <P>
          Behind the scenes, the tool runs two versions of your life side by side. In one, you buy: you put money down, pay
          closing costs, make mortgage payments, and cover property tax, insurance, and repairs. In the other, you rent a
          comparable place and invest the cash you didn’t spend on a down payment and ownership costs.
        </P>
        <P>
          For every year from 1 to 30, it adds up what each path costs and what you’d walk away with if you left that year. For
          the buyer, that’s the home’s value minus the mortgage balance and selling costs. For the renter, it’s the invested
          money, grown at the return you entered. Whichever side is ahead in a given year is the better deal for that length of
          stay.
        </P>
        <P>
          You’ll start with the basics: home price, down payment, mortgage rate, and loan term. Then add your monthly rent and
          how fast you expect it to rise. After that come property tax, insurance, maintenance, and any condo or HOA fees. Last
          are your two big guesses: how fast the home will appreciate and what your invested money could earn. Change any
          number and the results shift right away, so it’s easy to test “what if” scenarios.
        </P>
      </Card>

      <Card title="What the Calculator Assumes (and What It Can’t Know)">
        <P>
          Like any tool of this kind, this one runs on steady yearly percentages. It assumes the home appreciates at the same
          rate every year and that rent goes up by the same percentage every year. Real life doesn’t work like that. Housing
          markets have good stretches and bad ones, and rent can jump 8% one year and barely move the next. So treat the output
          as an estimate built from your inputs, not a forecast.
        </P>
        <P>
          It also assumes you can afford either option. If a down payment would wipe out your emergency fund, no calculator can
          tell you that’s fine. And it only measures money. It can’t put a price on painting your living room whatever color you
          want, or on never having to call a landlord about a broken water heater.
        </P>
        <P>
          One more thing about the numbers: they’re based on U.S.-style costs and tax rules in the examples here. If you live
          somewhere else, swap in your local property taxes, fees, and deductions. The math works the same way.
        </P>
      </Card>

      <Card title="Should You Rent or Buy? Two Questions to Answer First">
        <P>Before you worry about appreciation rates, look at these two things.</P>
        <P>
          <strong>Do you have enough saved?</strong> Buying takes a lot of cash up front. There’s the down payment, closing
          costs, moving costs, and usually some immediate repairs or furniture. If your savings only cover the down payment and
          leave you with nothing in the bank, you’re one bad month away from trouble. Check your upfront cash first, because it
          settles the question for a lot of people.
        </P>
        <P>
          <strong>How long will you actually stay?</strong> This is probably the most important variable. Buying and selling a
          home costs a lot, often 8% to 10% of the home’s value combined once you add up closing costs, agent commissions, and
          moving expenses. You need enough years of ownership for the savings (and any equity growth) to cover that hit. Stay a
          short time and the transaction costs eat you alive. Stay a long time and they get spread thin. The break-even year the
          calculator shows is your minimum stay. If you’re confident you’ll live there longer than that, buying looks better. If
          not, renting probably wins.
        </P>
      </Card>

      <Card title="What Is Your Formula or Rule for Rent vs. Buy?">
        <P>
          There’s no single formula that works for everyone, but a few rules of thumb can sanity-check what the calculator
          tells you. Here’s how I’d use them.
        </P>
        <List items={[
          ["The break-even rule.", "This is the main one, and it’s what the tool gives you. Find the year when the buyer’s total position passes the renter’s, then ask yourself honestly whether you’ll stay that long. If you will, buy. If you won’t, rent. Simple, and it accounts for your actual inputs."],
          ["The 5% rule.", "This one’s a quick back-of-the-envelope check. Take 5% of the home’s price, divide it by 12, and compare that to the monthly rent for a similar place. The 5% comes from three costs you never get back as an owner: about 1% for property taxes, about 1% for maintenance, and about 3% for the cost of tying up your money (what you’d earn by investing it instead). Mortgage principal doesn’t count, because that goes into your equity. So on a $400,000 home, 5% is $20,000 a year, or about $1,667 a month. If you can rent something comparable for less than that, renting is probably the cheaper choice. If rent is clearly higher, buying has a good shot. It’s rough, because those percentages shift with your local taxes and rates, but it’s a handy gut check."],
          ["The price-to-rent ratio.", "Divide the home’s price by a full year of rent for a similar home. If the ratio is under about 15, buying tends to look good. Between about 16 and 20, it’s a toss-up that depends on your plans. Above 20 or so, renting usually wins financially. A $400,000 home that rents for $1,900 a month works out to $22,800 a year, which is a ratio of about 17.5. That’s gray-zone territory, so your time horizon matters a lot."],
          ["The payment-size rule.", "A common guideline says your housing costs shouldn’t go much above 28% of your gross monthly income, and your total debt payments shouldn’t go much above 36%. Lenders use versions of these, but they don’t know your life, so treat them as a ceiling and not a target. Plenty of people qualify for more houses than they’d feel comfortable paying for."],
          ["The five-year minimum.", "Many people use five years as a floor for buying. It’s not magic, but in a lot of markets it takes about that long for the numbers to work. Your own break-even could be shorter or longer, which is why you run the calculator instead of trusting a rule."],
        ]} />
        <P>
          When the 5% rule, the price-to-rent ratio, and the calculator all point in the same direction, you can feel pretty
          good about it. When they disagree, dig into which assumption is doing the damage.
        </P>
      </Card>

      <Card title="A Quick Example With Real Numbers">
        <P>
          Say you’re looking at a $400,000 home with 20% down ($80,000) and a 30-year mortgage at 6.5%. The loan is $320,000, so
          principal and interest come to about $2,023 a month. Add property tax, insurance, and maintenance and your all-in cost
          is higher, probably in the neighborhood of $2,700 a month, depending on where you live.
        </P>
        <P>
          In the first year, about $20,600 of your payments goes to interest and only around $3,600 builds equity. That’s why
          buying feels expensive early on. Meanwhile, a similar rental costs $1,900 a month, and the $80,000 you didn’t spend on
          the down payment sits in an investment account.
        </P>
        <P>
          Over the first few years, the renter is usually ahead. If you had to sell after two years, selling costs of 6% to 8%
          would run $24,000 to $32,000, which is a big chunk of anything you’d gained. But the mortgage payment stays fixed while
          rent climbs, the loan balance drops, and the home (probably) gains value. Somewhere down the line the lines cross. The
          calculator shows exactly where, using your numbers instead of mine.
        </P>
      </Card>

      <Card title="What to Expect When Buying a Home">
        <P>
          Owning a home used to be mostly for wealthy families. It didn’t become common for the average household until the
          middle of the twentieth century, thanks to things like the GI Bill, longer mortgages, and suburban growth. Today,
          owning is baked into the American idea of success, and the tax code backs that up with some perks. That’s a big reason
          buying looks like the obvious move on the surface.
        </P>
        <P>
          But the financial picture is more complicated than “rent is throwing money away.” Let’s break down what you’d pay.
        </P>
        <H3>PITI: the big four</H3>
        <P>Lenders use the acronym PITI for your main monthly housing costs: principal, interest, taxes, and insurance.</P>
        <List items={[
          ["Principal", "is the part of your payment that reduces your loan balance. It’s the only piece that builds equity, and it’s small in the early years of a 30-year loan."],
          ["Interest", "is what you pay the lender for borrowing the money. It’s the largest piece of your payment at first. If you itemize deductions, mortgage interest can be deductible, but plenty of people use the standard deduction instead, so check whether it actually helps you."],
          ["Taxes", "means property taxes, which go to your city, county, school district, or other local authorities. Rates vary a lot. Many homeowners pay somewhere around 1% to 3% of the home’s value each year, and some places are higher or lower. You can usually look up what a specific house pays on the county assessor’s website. Keep in mind that bills often go up after a sale because the home gets reassessed at its new price. The calculator wants both your annual tax amount and how fast you expect it to rise."],
          ["Insurance", "includes homeowners insurance, which lenders require. It covers fire, storms, and similar damage. If you put down less than 20% on a conventional loan, you’ll also pay private mortgage insurance, or PMI, which protects the lender if you default. PMI can usually be removed once you reach 20% equity, so ask your lender how that works. Some buyers also pay for a home warranty to help with appliance and system repairs."],
        ]} />
        <H3>Costs outside PITI</H3>
        <P>
          This is where people get surprised. PITI doesn’t cover maintenance and repairs, which commonly run around 1% to 2% of
          the home’s value each year. A decent middle estimate is 1.5%, and older homes can cost more. It also leaves out HOA or
          condo fees, which can be a few hundred dollars a month or more and can rise over time. And then there are utilities.
          Owners usually pay more than renters for heating and cooling a bigger space, and they often pick up water, sewer, and
          trash bills that a landlord might have covered before. Even an extra $100 a month adds up to $12,000 over a decade.
        </P>
        <H3>Upfront costs</H3>
        <P>
          Beyond the down payment, you’ll pay closing costs, typically 2% to 6% of the loan amount. They cover lender fees,
          appraisal, title insurance, attorney fees, prepaid taxes and insurance, and similar charges. Since 2024, when a
          settlement involving the National Association of Realtors changed how buyer agent fees work, buyers can negotiate
          their agent’s commission, and who pays it is up for discussion. Ask recent buyers in your area what they actually
          paid, because it still varies a lot.
        </P>
        <H3>Selling costs</H3>
        <P>
          When you leave, you’ll usually pay agent commissions, closing costs, and sometimes repairs or concessions the buyer
          asks for. Between buying and selling, the transaction costs can reach 10% of the home’s value or more. This is the
          number that punishes short stays.
        </P>
        <H3>Taxes when you sell</H3>
        <P>
          If the home is your primary residence and you’ve lived in it for at least two of the last five years, a U.S. homeowner
          can generally exclude up to $250,000 of profit from capital gains tax, or $500,000 for married couples filing jointly.
          For most people that covers all of it, but if you live in a pricey market and stay for decades, check your own
          situation.
        </P>
      </Card>

      <Card title="Does a Mortgage Really Build Wealth?">
        <P>
          It does, but less than people think. A lot of buyers assume the home will be a great investment, and sometimes it is.
          But economist Robert Shiller’s long-run research on U.S. home prices found that after adjusting for inflation, prices
          were almost flat over the twentieth century, with real appreciation averaging only a fraction of a percent per year.
          After you subtract taxes, repairs, and insurance, many owners end up roughly breaking even on the house as an
          investment.
        </P>
        <P>
          That doesn’t mean owning is a bad idea. It means the benefit usually comes from other places: a payment that stays
          fixed while rents rise, forced savings through principal paydown, and a place that’s yours. Also, markets differ a
          lot. A house in San Francisco can appreciate very differently than a comparable one in Wyoming. For most people, a
          primary home is more about stability, family, and having somewhere to live than about growing a portfolio.
        </P>
      </Card>

      <Card title="What to Know When Renting">
        <P>
          Renting means paying a landlord for the right to live in a property. The main cost is monthly rent, but there’s more to
          it: an application fee, a security deposit (usually returned if you leave the place in good shape), and renter’s
          insurance, which is cheap compared to homeowners coverage. The calculator treats your deposit as money that comes back
          to you at the end, and since you’d be tying up that cash, it’s part of the opportunity cost.
        </P>
        <P>
          The big advantage of renting is flexibility. Leases are often 6 to 12 months, so if your job changes, a relationship
          ends, or you just want to try a different city, you can move without selling anything. That makes renting a good fit
          when your future is uncertain.
        </P>
        <P>A few practical tips if you rent:</P>
        <List items={[
          ["Negotiate.", "Rent and lease terms aren’t always fixed. A landlord with an empty unit or a good tenant history often has some room, especially on length of lease or move-in specials."],
          ["Get everything in writing.", "If a landlord promises to fix something or let you have a pet, put it in the lease. Verbal promises are hard to prove later."],
          ["Take photos when you move in.", "Time-stamped pictures of scuffs, stains, and damage protect your deposit if the landlord tries to charge you for something that was already there."],
          ["Know your rights.", "Federal fair housing law bars landlords from refusing to rent based on race, color, religion, sex, national origin, disability, or family status, and many states and cities add more protections. In most cases, your rent can’t go up in the middle of a fixed-term lease."],
        ]} />
      </Card>

      <Card title="The Three Inputs That Move the Result Most">
        <P>If you only have time to think hard about three numbers, make them these.</P>
        <List items={[
          ["Average investment return.", "This is the opportunity cost of the money you put into a house. Historically, stock market returns have beaten mortgage rates over long stretches, which is one reason renting and investing can win. But returns are uneven, and the right number depends on you. Someone five years from retirement with mostly bonds shouldn’t plug in the same return as a 28-year-old in stock index funds. Be realistic, and be honest about whether you’d actually invest the difference."],
          ["Home appreciation rate.", "The higher the number, the better buying looks. Nationally, home prices have grown somewhere around 3% to 5% a year in nominal terms over long periods, though that’s an average and it hides big swings. To get a better estimate for your area, look at recent sales of comparable homes in your zip code and see how prices have moved over the last 10 or 15 years. If you’re not sure, use a lower number. It’s better to be pleasantly surprised."],
          ["Mortgage interest rate.", "On a large loan, even a small rate change moves the monthly payment and the total interest by a lot. Use a real quote from a lender when you can, not a rate you saw in a headline. A difference of one percentage point on a $320,000 loan changes your payment by roughly $200 a month."],
        ]} />
        <P>
          Smaller inputs still matter for accuracy: property taxes, insurance, maintenance, repairs, HOA fees, and buying and
          selling costs on the ownership side, and rent increases, deposit, and renter’s insurance on the rental side. The more
          precise your inputs, the more useful the result.
        </P>
      </Card>

      <Card title="Is Renting Always Cheaper?">
        <P>
          Not always, and the reason comes down to what the renter does with their money. Renting only wins if the renter
          invests what they save. That means the down payment they didn’t spend, plus any monthly difference between owning
          costs and rent. If that money gets spent on other things, the renter doesn’t get the benefit the calculator shows.
        </P>
        <P>
          In the early years, renting often comes out ahead, because buying has so many upfront costs and so much of the early
          payment goes to interest. Over time, though, it flips for many households. Your payments shift toward principal, your
          equity builds, rent keeps climbing, and your fixed mortgage payment looks better each year. It’s a slow-and-steady
          game. Owning rewards patience.
        </P>
        <P>
          Other things are out of your control, too: interest rates, local housing markets, property tax hikes, and what your
          investments actually return. That’s why running a few scenarios beats trusting a single answer.
        </P>
      </Card>

      <Card title="Why Would You Want to Rent vs Buy Real Estate?">
        <P>People land on one side or the other for different reasons, and some of them have nothing to do with money.</P>
        <P>
          <strong>Reasons to buy.</strong> You plan to stay a long time. You want a payment that won’t jump every year. You want
          to renovate, paint, put in a garden, or keep as many pets as you like without asking permission. You value the idea of
          building equity you can borrow against someday. Or you simply want to put down roots, in a good school district or
          near family, and don’t want to worry about a landlord selling the building.
        </P>
        <P>
          <strong>Reasons to rent.</strong> Your job or life might move you in the next few years. You’d rather keep your
          savings invested and liquid than locked in a house. Local prices are high compared to rents, so owning costs a lot
          more per month for the same place. You don’t want to deal with repairs, lawn care, or a surprise $9,000 roof bill. Or
          you want to live in a pricey neighborhood or city that you couldn’t afford to buy into.
        </P>
        <P>
          Neither list is “smarter” than the other. They reflect different priorities, and what matters is whether your choice
          matches your life for the next several years.
        </P>
      </Card>

      <Card title="What Are the Benefits and Drawbacks of Renting vs. Buying?">
        <P>
          <strong>Benefits of buying.</strong> Your fixed-rate mortgage payment stays the same for decades while rents tend to
          rise. You build equity as you pay down the loan, and you might get appreciation on top. You have full control over
          your space. There can be tax benefits, such as deducting mortgage interest and property taxes if you itemize, and the
          primary residence capital gains exclusion. And you gain stability, since no landlord can decide not to renew your
          lease.
        </P>
        <P>
          <strong>Drawbacks of buying.</strong> It takes a big chunk of cash upfront. You’re on the hook for every repair, big or
          small. Transaction costs make it expensive to move on short notice. Your money is concentrated in one asset in one
          location, and it’s hard to get at in an emergency. If the market drops and you need to sell, you could lose money. And
          property taxes, insurance, and HOA fees tend to climb over time, even with a fixed mortgage.
        </P>
        <P>
          <strong>Benefits of renting.</strong> Lower upfront costs and a small deposit instead of a large down payment. Easy to
          move when a lease ends. No repair bills, property taxes, or major maintenance, since those are the landlord’s job. Your
          savings can be invested in a diversified way instead of being tied up in one house. And you can live in a location you
          might not be able to afford to buy in.
        </P>
        <P>
          <strong>Drawbacks of renting.</strong> Rent can rise every time your lease renews, and a landlord can choose to sell
          or not renew. You build no equity in the property. You have less freedom to renovate or even paint, depending on your
          lease. And you may have to move more often than you’d like.
        </P>
      </Card>

      <Card title="What Would Make It an Unwise Idea to Rent vs Buy a Home?">
        <P>It’s just as useful to know when each option is a bad bet.</P>
        <H3>Buying is usually unwise when:</H3>
        <List items={[
          ["", "You might move within a few years. Selling costs can wipe out any gains."],
          ["", "Your job or income is shaky. A mortgage payment is hard to dodge when work dries up."],
          ["", "The down payment and closing costs would leave you with no emergency fund. Houses love to break right after you buy them."],
          ["", "You’re stretching to the top of what a lender approves. Being “approved” and being comfortable are two different things."],
          ["", "The price-to-rent ratio is very high in your area, meaning owning costs far more than renting a similar home each month."],
          ["", "You’re counting on a variable-rate loan or on refinancing later when rates might not cooperate."],
          ["", "You’re buying mainly because you feel pressure from family or friends, or because you’re afraid prices will run away."],
          ["", "You have high-interest debt. Paying that off first usually beats a down payment on the numbers."],
        ]} />
        <H3>Renting is usually unwise when:</H3>
        <List items={[
          ["", "You’re sure you’ll stay put for a decade or more, and you’re comfortable with your costs and your local market."],
          ["", "Rents in your area are climbing quickly and a fixed mortgage payment would be cheaper than your current rent."],
          ["", "You’re not going to invest the savings. If the money would just get spent, renting loses its main financial edge."],
          ["", "You can already comfortably afford a home you’d like, and what you really want is stability and control."],
          ["", "Your lease situation is unstable, like frequent non-renewals or a landlord who plans to sell."],
        ]} />
        <P>If a few items from either list sound like you, take that seriously, whatever the calculator says.</P>
      </Card>

      <Card title="Location and Lifestyle: The Stuff That Won’t Fit in a Spreadsheet">
        <P>
          Where you live can settle this question for you. In expensive markets like San Francisco or New York, buying a
          comparable home can cost far more per month than renting one, and renting may be your only realistic way to live in
          the city you want. In cheaper markets, owning can easily cost less than renting, and the decision tilts the other way.
        </P>
        <P>
          Beyond price, think about safety, school quality, walkability, transit, commute time, and how many good rentals or
          homes are actually available. If the rental market is thin and landlords have all the leverage, that’s a point for
          owning. If there’s a glut of for-sale homes and they sit for months, that’s a point for patience.
        </P>
        <P>
          Then there’s the personal side. Do you like fixing things, or does the thought of a leaky faucet make you tired? Do you
          want a yard? Will you feel boxed in by a mortgage? Do you value a payment you can predict, or the freedom to leave on
          60 days’ notice? None of this shows up in a break-even chart, but it often matters more than the last half a
          percentage point of appreciation.
        </P>
      </Card>

      <Card title="Who Gets the Most Out of This Calculator">
        <P>A rent vs buy calculator is handy at a few specific moments:</P>
        <List items={[
          ["", "You’re a renter whose lease is coming up and the new rent looks steep. Run the numbers to see whether buying actually changes your long-term picture."],
          ["", "You’re saving for a down payment and want to know whether it’s worth the wait."],
          ["", "You’re considering a job offer in another city and need to know whether to buy or rent there."],
          ["", "You’re comparing a stretch home to a cheaper one and want to see how the price changes your break-even."],
          ["", "You already own and are wondering whether selling and renting would put you ahead."],
          ["", "You’re planning around a timeline, like kids finishing school, and want to match your stay to the break-even year."],
        ]} />
      </Card>

      <Card title="Common Mistakes When Comparing Rent and Buy">
        <P>A few things trip people up again and again.</P>
        <List items={[
          ["Comparing a mortgage payment to rent and calling it a day.", "Taxes, insurance, repairs, and utilities belong in the comparison, as does the return on the down payment you’d keep if you rented."],
          ["Using one rosy appreciation number.", "Run low, medium, and high cases. If buying only wins in the optimistic one, that’s a warning."],
          ["Forgetting that renters have to actually invest.", "The renter’s advantage depends on it."],
          ["Ignoring selling costs.", "They hit hardest in the first five to seven years."],
          ["Assuming you’ll stay forever.", "Plans change more often than people expect, so check a shorter stay, too."],
          ["Treating the result as a promise.", "It’s an estimate based on steady rates, and markets don’t behave that neatly."],
        ]} />
      </Card>

      <Card title="Free, Private, and Honest About Its Limits">
        <P>
          This rent vs buy calculator is free to use on Tolz. There’s no charge and no signup, and you don’t have to share
          personal documents or account details. The inputs are general figures like a price, a rate, and a monthly rent, so you
          can test scenarios without handing over anything sensitive.
        </P>
        <P>
          On accuracy, the calculations rely on standard formulas for loan payments, compounding returns, and yearly cost
          growth. The output is only as good as what you put in, so use real quotes and local numbers wherever you can. It’s a
          planning estimate, not a lender quote or financial advice. If you’re about to make an offer or sign a lease, a
          mortgage professional or a fee-only financial planner can look at your whole picture.
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
