import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate commission?",
    a: "Multiply the sale price by the commission rate, then divide by 100 (or use the rate as a decimal). A 4% commission on $25,000 is $25,000 × 0.04 = $1,000.",
  },
  {
    q: "How do I calculate the commission rate from sales and commission?",
    a: "Divide the commission by the sales amount and multiply by 100. If you earned $1,500 on $30,000 in sales, that’s 5%.",
  },
  {
    q: "Can I find the sales price from the commission?",
    a: "Yes. Divide the commission by the rate as a decimal. $2,100 at 3% means sales of $70,000.",
  },
  {
    q: "What is a tiered commission calculator?",
    a: "It figures out commission when the rate changes at different sales levels. Each slice of sales is multiplied by its own rate and the results are added together. You can also add a fixed base amount.",
  },
  {
    q: "What’s the difference between marginal and retroactive tiers?",
    a: "In a marginal plan, each rate applies only to the sales inside its bracket. In a retroactive plan, reaching a higher bracket applies the higher rate to all sales. The results can be very different, so check your agreement.",
  },
  {
    q: "Is commission calculated on gross or net sales?",
    a: "It depends on your agreement. Gross is the full sale amount. Net is what’s left after returns, discounts, or other agreed deductions. Check which one your plan uses.",
  },
  {
    q: "How do I calculate commission with a base salary?",
    a: "Calculate commission on total sales, then add the fixed base. A $2,000 base plus $1,050 in commission is $3,050.",
  },
  {
    q: "How do I price something so I keep a certain amount after commission?",
    a: "Divide your target amount by (1 minus the commission rate). To net $70 with a 14% commission, charge $70 ÷ 0.86 = $81.40.",
  },
  {
    q: "What’s a typical SaaS sales commission?",
    a: "For direct reps, around 8% to 12% of first-year contract value is common, and the pay mix is often roughly half base, half variable.",
  },
  {
    q: "Is a real estate commission negotiable?",
    a: "Yes. Historically agents split about 5% to 6% of the sale price, but rates are negotiable and buyer-agent compensation is handled separately since the 2024 NAR settlement.",
  },
  { q: "Is this commission calculator free?", a: "Yes, it’s free on Tolz, and you can use it as often as you need." },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

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
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8,
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

export default function CommissionCalculatorFaqSection() {
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
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>.</P>
      </Card>

      <Card title="What This Commission Calculator Does">
        <P>
          Every straightforward commission deal comes down to three numbers: the sale amount, the commission rate, and the
          commission earned. If you know any two, you can find the third. The tool is built around exactly that relationship, so
          you can start from whichever figures you have.
        </P>
        <P>
          The first mode finds the commission itself. You enter the sales amount and the rate, and the calculator returns the
          payout. This is what a salesperson uses to estimate earnings or what an employer uses to verify a commission statement.
        </P>
        <P>
          The second mode works backward to find the sales price. If you know a $3,200 commission was paid at a 4% rate, the
          tool tells you the sale it came from. This is useful when you’re reconciling payouts against records and the original
          deal value is missing.
        </P>
        <P>
          The third mode finds the commission rate. When you know the sale and the commission paid, the tool tells you the
          percentage applied. This is how you check whether you were paid at the agreed rate, or work out the rate on a deal
          someone else negotiated.
        </P>
        <P>
          The fourth mode is the tiered calculator, covered in its own section below, where different slices of sales earn
          different rates and a fixed base amount can be added.
        </P>
      </Card>

      <Card title="How to Calculate Commission: The Formula Behind the Tool">
        <P>The standard commission formula is simple:</P>
        <Formula>Commission = Sales Amount × Commission Rate</Formula>
        <P>
          With a rate of 3% and a sale of $85,000, the commission is $85,000 × 0.03 = $2,550. Percentages must be converted to
          decimals before multiplying, which is where most manual mistakes happen.
        </P>
        <P>Rearranging the formula gives the other two calculations:</P>
        <Formula>
          Sales Amount = Commission ÷ Commission Rate<br />
          Commission Rate = Commission ÷ Sales Amount
        </Formula>
        <P>
          Using the same example, $2,550 ÷ 0.03 returns $85,000, and $2,550 ÷ $85,000 returns 0.03, or 3%. Each calculation
          checks the others, which makes it a useful sanity test. If the three figures don’t agree, one of them is wrong.
        </P>
        <P>
          One distinction affects results more than any other: whether commission is calculated on gross sales or net sales.
          Gross sales is the full transaction value. Net sales is what remains after returns, discounts, refunds, or sometimes
          costs. A 5% commission on a $10,000 gross sale is $500, but if $1,000 is refunded, 5% of the net $9,000 is $450.
          Always confirm which figure your agreement uses before entering it.
        </P>
      </Card>

      <Card title="Tiered Commission Calculator: Brackets and Base Amounts">
        <P>
          Many sales plans don’t pay one flat percentage. They use tiers, where the rate rises as sales volume grows, which
          rewards higher performance. A tiered commission calculator handles this by applying each rate to the right slice of
          sales.
        </P>
        <P>
          Take a plan that pays 5% on the first $10,000, 7% on sales from $10,000 to $30,000, and 10% above $30,000. For $45,000
          in sales, the calculation splits into three parts:
        </P>
        <List items={[
          ["", "$10,000 × 5% = $500"],
          ["", "$20,000 × 7% = $1,400"],
          ["", "$15,000 × 10% = $1,500"],
        ]} />
        <P>
          Total commission: $3,400. Working this out by hand is slow, and it is easy to apply the top rate to the whole amount by
          mistake, which would overstate the payout significantly.
        </P>
        <P>
          Tiered plans come in two common forms. In a marginal plan, as in the example, each rate applies only to the portion of
          sales within its bracket. In a retroactive or whole-tier plan, reaching a higher bracket raises the rate on all sales,
          including the earlier ones. The two produce different totals from identical sales, so check how your agreement is
          written before relying on any result.
        </P>
        <P>
          The optional base amount covers plans that combine fixed pay with variable commission. If the plan above includes a
          $2,000 base, the total payout is $2,000 + $3,400 = $5,400. Keeping the base separate in the calculation shows how much
          of your income comes from performance and how much is guaranteed, which helps when comparing job offers or setting
          targets.
        </P>
      </Card>

      <Card title="How Sales Commissions and Incentives Work">
        <H3>How do I best structure my sales commissions and incentives?</H3>
        <P>
          Start with what you want people to do, then pay for that. It sounds obvious, but a lot of plans reward the wrong
          thing. Pay on revenue alone and reps will discount to close. Pay only on new logos and nobody will look after existing
          customers.
        </P>
        <P>
          A solid structure usually has four parts. First, a pay mix that fits the sales cycle: long, complex sales usually need
          more base pay because reps can go months without a close. Second, a commission metric tied to something the business
          cares about, like revenue, gross profit, or collected cash. Third, a clear quota or target, so reps know what “good”
          looks like. Fourth, rules for the messy stuff: refunds, split deals, discounts, and what happens when someone leaves
          mid-quarter.
        </P>
        <P>
          Keep it simple enough that a rep can estimate their own paycheck on a napkin. If people need a spreadsheet and a
          meeting to figure out what they earned, the plan is doing less motivating than you think.
        </P>

        <H3>What is the best sales incentive?</H3>
        <P>
          There isn’t one winner, and anyone who tells you otherwise is selling something. Cash commission is the most direct and
          the most widely used, mostly because it’s easy to understand and it’s tied to a result. But it isn’t always the most
          effective.
        </P>
        <P>
          Short-term contests and spiffs (small cash bonuses for pushing a specific product) work well for a quick burst of
          attention. Accelerators, where the rate climbs after quota, tend to work better for sustained effort. Non-cash rewards
          like trips, extra time off, or public recognition help most when the cash part of the plan is already fair. For many
          reps, a clear path to promotion matters just as much as the commission rate.
        </P>
        <P>
          The honest answer is to match the incentive to the behavior and the person. A new rep building a pipeline responds to
          different things than a ten-year veteran who already hits quota.
        </P>

        <H3>Do sales incentive programs impact your business?</H3>
        <P>
          Yes, and not always in the direction you planned. A good program lifts sales, keeps top performers around, and shows
          new hires how to succeed. A bad one pushes people toward short-term wins that hurt you later: heavy discounting,
          overselling features, or closing customers who churn in three months.
        </P>
        <P>
          Watch the numbers beyond top-line revenue. If commissions rise but margins fall, or deals close faster but refunds and
          cancellations climb, the plan is steering behavior in a direction you won’t like. Incentive costs also need a sanity
          check: total commission as a percentage of revenue should fit within the margins of the business. That’s where a quick
          run through the calculator with realistic sales scenarios saves you from an expensive surprise at year end.
        </P>

        <H3>Should discounts and incentives affect commission?</H3>
        <P>
          This one’s a policy choice, and it matters more than most people realize. When commission is a percentage of the sale
          price, a discount lowers the rep’s pay a little, but not by much. When commission is a percentage of profit, a
          discount cuts the rep’s pay a lot, which naturally makes them think twice before giving away margin.
        </P>
        <P>
          Here’s a quick example. Say a product sells for $1,000 and costs $700 to deliver. On a revenue-based plan at 5%, the
          rep earns $50. Knock the price down to $900 and they still earn $45, so the discount barely hurts them. On a
          profit-based plan at 20%, the rep earns $60 at full price ($300 profit). At $900 the profit drops to $200 and their
          commission falls to $40. That’s a real cost to the rep, and it changes how they negotiate.
        </P>
        <P>
          Many companies split the difference: full commission down to a certain discount level, then a reduced rate beyond it,
          with manager approval required past a hard floor.
        </P>

        <H3>What are some examples of sales incentives?</H3>
        <P>A few that show up again and again:</P>
        <List items={[
          ["Straight commission:", "a percentage of each sale."],
          ["Tiered or accelerated commission:", "higher rates as the rep passes sales thresholds."],
          ["Quota bonuses:", "a lump sum for hitting a monthly, quarterly, or annual target."],
          ["Spiffs:", "short-term cash rewards for selling a specific product or closing before a deadline."],
          ["Contests:", "leaderboards with prizes, which work best when they’re short and winnable."],
          ["Retention or renewal bonuses:", "pay tied to customers who stay past a set period."],
          ["Non-cash perks:", "trips, equipment, extra vacation days, or stock options."],
        ]} />
        <P>You can mix these. Just don’t stack so many that nobody can tell what the plan is actually rewarding.</P>

        <H3>What are the types of sales commission structures?</H3>
        <P>The calculator on this page covers the main ones. Beyond those, you’ll run into a few more in real life.</P>
        <List items={[
          ["Commission only.", "The rep earns a percentage of sales and nothing else. No sale, no pay. Real estate agents, many insurance agents, and some independent reps work this way."],
          ["Base salary plus commission.", "A fixed amount plus a percentage of sales. It gives people some stability while still tying pay to results. Most SaaS and B2B sales roles look like this."],
          ["Tiered (graduated) commission.", "The rate changes as sales volume grows. Covered in detail below."],
          ["Revenue-based vs. profit-based.", "Commission can be a percentage of the sale price or a percentage of gross profit. Profit-based plans make more sense when margins vary a lot between products or deals."],
          ["Residual or recurring commission.", "The rep keeps earning a cut for as long as the customer keeps paying. Common in subscriptions, insurance, and some referral programs."],
          ["Draw against commission.", "The rep gets an advance each pay period that’s later deducted from earned commission. It smooths out income but can leave a rep “in the hole” after a slow stretch."],
        ]} />

        <H3>What’s the right sales commission, and what’s the best structure?</H3>
        <P>
          There’s no universal number. The right commission rate depends on your margins, your average deal size, how long deals
          take, and how much of the sale the rep actually creates. A rep who sells a product that practically sells itself
          shouldn’t earn what a rep earns for a six-month enterprise cycle.
        </P>
        <P>
          A practical way to test a rate: work backward from target pay. If a rep should earn $120,000 in total at quota, and
          you’re splitting 50/50 between base and variable, that’s $60,000 in commission at 100% of quota. Divide by the quota
          amount to get the effective rate. If the quota is $600,000, the rate is 10%. If that rate makes the economics of the
          business ugly, either the quota, the pay target, or the pricing needs to change.
        </P>
        <P>
          As for “best” structure: for most businesses with repeatable sales, base plus tiered commission with accelerators
          beyond quota is a strong default. Pure commission works best when the rep has plenty of qualified opportunities handed
          to them or when they’re independent contractors who want the upside.
        </P>

        <H3>How are sales commissions paid?</H3>
        <P>
          Most companies pay commission monthly or quarterly, usually one pay period after the month closes so the numbers can
          be reconciled. The bigger question is when the commission is considered earned. Three common triggers:
        </P>
        <List items={[
          ["On booking:", "when the contract is signed."],
          ["On invoice:", "when the customer is billed."],
          ["On collection:", "when the money actually arrives."],
        ]} />
        <P>
          Paying on collection protects the company from non-paying customers, but it frustrates reps in industries with long
          payment terms. Whatever you choose, put it in writing. Some states, California for one, require written commission
          agreements for employees, and vague terms are the number-one cause of commission disputes.
        </P>
        <P>
          Also keep in mind that commission is taxable income. In the U.S., employers often withhold federal tax on bonuses and
          commissions as “supplemental wages,” commonly at a flat 22% for amounts under $1 million, though the final tax bill
          depends on your actual bracket. Independent contractors get paid gross and handle their own taxes.
        </P>

        <H3>How do you design a sales commission scheme?</H3>
        <P>Here’s the sequence that works in practice:</P>
        <List ordered items={[
          ["Set the pay target.", "Decide what a fully ramped rep should earn at quota (on-target earnings), and what share is base versus variable."],
          ["Set a quota", "that’s based on real market opportunity and past results, not wishful thinking. If fewer than half your reps hit it, it’s probably too high."],
          ["Choose the commission metric:", "revenue, gross profit, or collected cash."],
          ["Calculate the effective rate:", "variable pay divided by quota."],
          ["Add tiers or accelerators", "if you want to reward overachievement."],
          ["Write the rules", "for splits, refunds, discounts, territory changes, and departures."],
          ["Test it", "by running several sales scenarios (a weak month, a typical month, a monster month) and checking that total payout still makes sense for the business."],
        ]} />
        <P>Step 7 is where this calculator is handy. Enter a range of sales totals and see exactly what each one costs you.</P>

        <H3>Is there ever a good reason for a cap on sales commission?</H3>
        <P>
          Sometimes, but caps are risky. A cap makes sense when a huge payout would come from something the rep didn’t really
          earn: a surprise whale of a deal from an inbound customer, a windfall from a territory the company handed them, or a
          pricing error. Caps also help when you’re a small company that simply can’t absorb a runaway payout.
        </P>
        <P>
          The downside is obvious: once a rep hits the cap, they have zero reason to close more deals this period, and some will
          hold deals until next quarter. Top performers tend to leave plans with hard caps. Many companies use decelerators or
          review-based adjustments instead, which let the rep keep earning but at a lower rate past a certain point.
        </P>

        <H3>Can I really make a fortune in commission-based sales?</H3>
        <P>
          Some people do. The ones who do usually sell high-value things (commercial real estate, enterprise software, large
          insurance policies, industrial equipment) or build a book of repeat business over years. But for every high earner
          there are plenty of people who struggled for a year and quit.
        </P>
        <P>
          Commission-only jobs come with real income swings. You need savings to cover slow months, a product or market with
          enough demand, and the patience to build a pipeline. If you’re evaluating an offer, run your realistic sales numbers,
          not the best-case ones, through the calculator. Then ask what the average rep at that company actually earns, not what
          the top rep earns.
        </P>

        <H3>How do I find salespeople who’ll work on commission?</H3>
        <P>
          Independent reps, agencies, and referral partners are the usual route. Look in industry-specific communities,
          LinkedIn, and sales networks. Former reps from competitors or adjacent products often already have the contacts you
          need.
        </P>
        <P>
          The key is making the deal attractive enough to be worth their time. Experienced salespeople will ask about the lead
          flow, average deal size, sales cycle length, and how quickly you pay. A commission-only offer with no leads, no brand
          awareness, and a long sales cycle is a tough sell. Sweeten it with a fair rate, quick payment, solid marketing
          materials, and a clear contract that spells out who owns the customer if the rep leaves.
        </P>

        <H3>Should a startup founder or CEO take a sales commission?</H3>
        <P>
          Generally, no. Founders already have equity, and the point of commission is to compensate employees for sales they
          bring in. A founder who closes the first dozen customers is doing what founders do. Paying yourself commission on top
          of that can look odd to investors and can drain scarce cash.
        </P>
        <P>
          There are exceptions. If you’re a founder drawing little or no salary and also acting as the full-time seller, some
          companies set up a modest commission to formalize the arrangement. If you do that, document it, keep the rate
          reasonable, and make sure the board or investors know about it.
        </P>
      </Card>

      <Card title="Commission in SaaS, B2B, and Advertising Sales">
        <H3>What’s a typical commission for a SaaS sales professional?</H3>
        <P>
          For direct account executives, commission is commonly in the neighborhood of 8% to 12% of first-year contract value,
          though it varies by deal size, sales cycle, and company stage. Most SaaS sales roles are structured as on-target
          earnings (OTE), with a roughly 50/50 or 60/40 split between base and variable pay.
        </P>

        <H3>What’s the average sales commission in B2B SaaS? Is 40%-50% fair?</H3>
        <P>
          That 40%–50% figure almost certainly isn’t a percentage of the deal. It’s probably the variable share of OTE. A rep
          with a $200,000 OTE and a 50/50 split has $100,000 in variable pay, so “50%” of their compensation comes from
          commission. That’s the number the sales folks are likely quoting.
        </P>
        <P>
          If someone really means 40% to 50% of deal value going to a rep, that’s way outside normal for direct sales. Channel
          partners and resellers are a different story. Partners who handle the sale, the implementation, and the support often
          keep a larger margin, so discounts in the range of 20% to 30% or more aren’t unusual there. But for your own
          employees, a rate in that range would be a red flag.
        </P>

        <H3>What commission should be paid for a lead that eventually converts?</H3>
        <P>It depends on who’s generating the lead and how much work the closing rep still has to do. A few common models:</P>
        <List items={[
          ["Flat bounty per qualified meeting or opportunity:", "Typical for SDRs or BDRs, who book meetings but don’t close deals."],
          ["Small percentage of closed-won revenue:", "Gives the lead generator a stake in quality, not just volume."],
          ["Split commission:", "The lead source and the closer share the commission, often with the closer taking the larger portion."],
          ["Referral fee:", "For outside partners, often a percentage of first-year revenue, commonly somewhere in the 10% to 20% range, but there’s a lot of variation."],
        ]} />
        <P>Whatever you pick, tie at least part of the payout to the deal actually closing. Paying only for leads encourages quantity over quality.</P>

        <H3>What commission structure works for closed B2B sales?</H3>
        <P>
          For reps who own the full cycle, base plus commission on closed-won revenue is the standard. Add accelerators past
          quota and clear rules for multi-year deals (do you pay on the first year or the full contract?), renewals, and
          upsells. If your sales cycle is long, think about paying a portion at signing and the rest when the customer goes live
          or pays, which protects you from deals that fall apart in onboarding.
        </P>

        <H3>What’s an appropriate commission-only structure for advertising sales?</H3>
        <P>
          Independent ad sales reps often work on a percentage of the ad revenue they bring in, and a range of roughly 10% to 20%
          is common, with higher rates for hard-to-sell inventory or brand-new products. The wrinkle in ad sales is payment
          timing: agencies and large advertisers frequently pay 60 to 90 days after the campaign runs. A fair arrangement pays
          commission when the advertiser actually pays, but spells out how long that can take and what happens with campaigns
          that get canceled or reduced.
        </P>

        <H3>What’s the best commission structure for ad sales at a new startup?</H3>
        <P>
          Early on, keep it simple and keep cash in mind. A modest base (or none, for contractors), a clear percentage on
          collected revenue, and a bonus for landing anchor advertisers is usually enough. Avoid heavy tier structures when you
          have no sales history to base them on. As you learn your average deal size and close rate, you can add accelerators
          and quotas. The main thing is not to promise rates that only work if revenue doubles.
        </P>
      </Card>

      <Card title="Typical Commission Rates by Industry and Platform">
        <P>Rates change, and they depend on the contract, so treat these as ballparks. Always check the current terms before you sign anything.</P>

        <H3>Referral and affiliate commissions for SaaS</H3>
        <P>
          Referral deals commonly pay somewhere around 10% to 30% of the customer’s payments, sometimes just the first year and
          sometimes for as long as the customer stays. Recurring affiliate programs in software often land toward the higher end
          because the lifetime value of a subscriber is high.
        </P>

        <H3>How to negotiate higher commission with affiliate programs</H3>
        <P>
          The best leverage is proof. Show your traffic, your audience’s relevance, your conversion data, and your track record
          with similar products. Then ask for something specific: a higher base rate, a tiered rate that rises with volume, a
          longer cookie window, or exclusive promo codes. Programs are far more willing to bump rates for a partner who’s
          already sending real sales than for someone with a pitch deck and big promises.
        </P>

        <H3>Commission rates in online marketplaces and ecommerce</H3>
        <P>
          Marketplaces typically charge sellers a referral fee that varies by product category, often roughly 8% to 20% of the
          sale price, plus separate fees for fulfillment, payments, and advertising. Rates differ by platform, country, and
          seller type, so look at the current fee schedule instead of guessing.
        </P>
        <P>
          If you sell on marketplaces, the number that matters is your margin after all fees, not just the headline commission
          rate. Run it through the calculator to see your real revenue, then compare it to your cost of goods.
        </P>

        <H3>How to optimize an ecommerce commission rate</H3>
        <P>
          It depends which side you’re on. As a seller paying marketplace fees, you can negotiate rarely, but you can choose
          categories carefully, reduce return rates, and decide whether to fulfill yourself or use the platform’s logistics. As a
          merchant paying affiliates, set rates based on your contribution margin (not revenue), pay less for existing customers
          than for new ones, and watch out for coupon-site traffic that grabs commission on sales you’d have made anyway.
        </P>

        <H3>Commission for fashion affiliates</H3>
        <P>
          Fashion affiliate programs frequently pay in the range of 5% to 15%, with the higher end showing up where margins are
          healthy and the brand wants to build awareness. There isn’t a single standard. Premium brands often pay less because
          they rely on brand strength; newer brands may pay more to attract traffic.
        </P>

        <H3>Amazon Associates rates</H3>
        <P>
          Amazon pays a fixed percentage by product category rather than one flat rate, and it has changed those rates over the
          years, including a round of cuts in several categories in 2020. Because the numbers move, check Amazon’s current
          Associates fee schedule rather than relying on an old article.
        </P>

        <H3>Google AdSense revenue share</H3>
        <P>
          Google has published a revenue share of 68% to publishers for content ads and 51% for search ads. This is a revenue
          split, not a sales commission in the usual sense, but people often search for it the same way. Confirm the current
          terms in AdSense since policies can change.
        </P>

        <H3>Ad agency commissions</H3>
        <P>
          The old model was a standard 15% media commission, where the agency kept about 15% of the media buy. These days it’s
          far more mixed: flat retainers, project fees, performance-based pay, and percentage-of-spend arrangements, all common.
          If you’re hiring an agency, ask exactly what’s included in a percentage-of-spend deal, because it can create an
          incentive to push spend higher.
        </P>

        <H3>Online travel agency commissions from hotels and airlines</H3>
        <P>
          Hotels commonly pay online travel agencies roughly 15% to 25% of the booking value, depending on the platform, market,
          and negotiated deal. Airlines are different. They’ve moved away from traditional percentage commissions on tickets, and
          travel agents are more often paid through fees, incentives, or distribution agreements.
        </P>

        <H3>Insurance broker commission</H3>
        <P>
          Insurance brokers are paid by the carrier as a percentage of the premium, and the rate depends heavily on the type of
          policy, the carrier, the state, and the size of the account. It’s often in the range of single digits to the
          mid-teens as a percentage of premium for commercial lines, with larger accounts frequently shifting toward negotiated
          fees. Ask your broker how they’re paid. They’re required to disclose it in many situations, and it’s a reasonable
          question.
        </P>

        <H3>Financial advisors and mutual fund distributors</H3>
        <P>
          Yes, you can negotiate with financial advisors, particularly on fees. Advisors paid by commission have an incentive to
          recommend products that pay them more, while fee-only advisors charge you directly and don’t earn product
          commissions. For mutual funds, distributors may earn sales charges, ongoing trailing commissions, or both, depending on
          the fund and the country. Comparing the share class or plan types (those with and without distributor commissions)
          shows you what you’re paying for.
        </P>

        <H3>Ride-hailing platform commissions</H3>
        <P>
          Uber’s take rate isn’t the same everywhere. It varies by city, ride type, time, and how the fare was priced, and Uber
          has changed its pricing models over time. Drivers can see the breakdown of each trip in the app, which is the most
          reliable source.
        </P>

        <H3>Real estate commissions</H3>
        <P>
          Historically, U.S. agents split a total commission of about 5% to 6% of the sale price. But commission is always
          negotiable, and the rules shifted after the 2024 National Association of Realtors settlement: buyer-agent compensation
          is now handled separately and isn’t offered through MLS listings the way it was. Sellers and buyers should talk about
          commission openly and get it in writing.
        </P>

        <H3>Does a low commission rate make a home harder to sell?</H3>
        <P>
          It can, but it’s not a guarantee. If buyer agents see a lower payout, some may be less motivated to show the home, or
          may ask the buyer to cover the difference. But price, condition, photos, and location matter much more than a small
          difference in commission. If you’re thinking of going lower, ask your agent how they’d handle buyer-agent compensation
          and talk to a few agents before deciding.
        </P>

        <H3>Why do realtors believe their commission is worth it?</H3>
        <P>
          Agents point to pricing strategy, marketing, negotiation, paperwork, scheduling, and getting deals past inspections and
          financing hurdles. Critics argue that online listings have made much of the search-and-access part of the job easy, so
          the fee should be lower. Both views have some truth. The value depends heavily on the specific agent and how
          complicated the sale is.
        </P>

        <H3>Car sales commission</H3>
        <P>
          Auto dealers commonly pay salespeople a percentage of the front-end gross profit on a vehicle (often cited around 20%
          to 30%) rather than a percentage of the sticker price, plus bonuses for hitting volume targets. Check the specific
          dealership’s pay plan, because it varies a lot.
        </P>
      </Card>

      <Card title="How the Commission Calculator Works">
        <H3>Calculate commission from the sale price and rate</H3>
        <P>
          This is the most common use. Enter the sale price and the commission percentage and you get the commission amount. Say
          a product sells for $70 and the salesperson earns 14%. The commission is $70 × 14% = $9.80.
        </P>
        <Formula>commission = sale price × commission rate ÷ 100</Formula>

        <H3>Find the sale price from the commission and rate</H3>
        <P>
          Working backward is useful for checking old records or figuring out what deal produced a given payout. If a commission
          of $2,100 was paid at 3%, the sale was $2,100 ÷ 0.03 = $70,000.
        </P>

        <H3>Find the commission rate from the sale and commission</H3>
        <P>
          If you know the sale and what was paid, divide the commission by the sale price and convert to a percentage. A $1,500
          commission on a $30,000 sale is 1,500 ÷ 30,000 = 5%. It’s a quick way to check whether the rate on your statement
          matches your contract.
        </P>

        <H3>Who pays the commission: seller or buyer?</H3>
        <P>
          Most of the time the seller (or the company that hired the salesperson) covers the commission. That means the
          commission comes off the revenue you keep. On a $70 sale with a 14% commission:
        </P>
        <Formula>Revenue after commission = $70 − $9.80 = $60.20</Formula>
        <P>Occasionally the buyer pays, and the commission is added on top of the base price:</P>
        <Formula>Price with commission = $70 + $9.80 = $79.80</Formula>

        <H3>Working out the price you need to charge to net a target amount</H3>
        <P>
          This is the part many calculators skip, and it trips people up. If you want to keep a specific amount after
          commission, don’t just add the commission percentage to your price. When the commission is calculated on the final
          sale price, you have to divide instead.
        </P>
        <P>Say you want to net $70 and the commission is 14% of the final price. The price you need is:</P>
        <Formula>Price = target net ÷ (1 − rate) = 70 ÷ 0.86 = $81.40</Formula>
        <P>
          Check it: 14% of $81.40 is $11.40, and $81.40 − $11.40 = $70.00. If you’d added 14% to $70 and charged $79.80, the
          commission would be about $11.17 and you’d net only $68.63. Small gap on one sale, a real hole across hundreds of
          them.
        </P>

        <H3>Base salary plus commission</H3>
        <P>
          Here the calculator adds a fixed base to the commission. Suppose someone earns $600 a month plus 2% of sales. In a
          month where they sell one car for $28,000 and two at $35,000:
        </P>
        <Formula>
          Total sales: $28,000 + $70,000 = $98,000<br />
          Commission: $98,000 × 2% = $1,960<br />
          Total pay: $600 + $1,960 = $2,560
        </Formula>
        <P>
          If several items are sold at different prices, add up the total sales first, then apply the percentage. In this
          calculator, the sales price field is the total sales amount.
        </P>

        <H3>Tiered commission: how the brackets work</H3>
        <P>
          In a tiered plan, the rate changes as sales grow. The key idea is that, in the standard marginal setup, each rate only
          applies to the slice of sales inside its bracket. It doesn’t apply to everything.
        </P>
        <P>Suppose the plan pays 3% on the first $20,000, 5% from $20,000 to $25,000, and 10% from $25,000 to $30,000. With $27,000 in sales:</P>
        <List items={[
          ["", "$20,000 × 3% = $600"],
          ["", "$5,000 × 5% = $250"],
          ["", "$2,000 × 10% = $200"],
        ]} />
        <P>Total commission: $1,050.</P>
        <P>
          The general formula: add up each tier’s slice of sales times that tier’s rate, stopping at the tier where the total
          sales land.
        </P>

        <H3>Marginal vs. retroactive tiers</H3>
        <P>
          Some plans work differently. In a retroactive (or whole-tier) plan, once you hit a higher bracket, the higher rate
          applies to all of your sales. Using the same brackets, $27,000 in sales would fall in the 10% bracket, so the
          commission would be 10% × $27,000 = $2,700, compared to $1,050 under the marginal approach.
        </P>
        <P>
          That’s a big difference, and you can’t tell which one a plan uses without reading the agreement. If your plan is
          retroactive, you can still use the calculator for each piece, but check the numbers against your contract.
        </P>

        <H3>Adding a base amount to a tiered plan</H3>
        <P>
          Calculate the tiered commission first, then add the base. With a $2,000 base and the $1,050 tiered commission above,
          total pay is $3,050. Keeping the two parts separate lets you see how much income depends on performance.
        </P>
      </Card>

      <Card title="When You Would Need a Commission Calculator">
        <P>The tool applies in a wide range of situations, and the practical needs differ.</P>
        <List items={[
          ["Real estate.", "Agents and clients regularly work out commission on property sales. At a 2.5% rate on a $420,000 sale, the commission is $10,500, and the result is often split between buyer’s and seller’s agents and their brokerages. A commission calculator gives you the starting figure for that split. Sellers can also use it to see what an agent’s rate costs them before signing a listing agreement."],
          ["Retail and direct sales.", "Store employees, car salespeople, and field reps often earn a percentage of what they sell, sometimes with a monthly base. Checking each pay period’s commission against the sales report helps catch missing deals or incorrect rates."],
          ["Freelancers and affiliates.", "If you take a cut of client spend, referral fees, or affiliate sales, the rate calculation shows what you are actually earning per deal. It also works in reverse: if a platform pays $18 on a sale and you want to know the rate, enter the two values."],
          ["Sales managers and finance teams.", "Budgeting for incentive payouts means modelling several scenarios. Entering different sales totals into the tiered calculator shows how cost grows as the team passes each threshold, which supports forecasting and quota design."],
          ["Job seekers comparing offers.", "One role offers a high base and low commission, another offers the reverse. Running the same projected sales through both, with and without a base amount, gives a like-for-like income comparison."],
        ]} />
      </Card>

      <Card title="Common Commission Structures Worth Knowing">
        <P>
          Understanding the plan type helps you enter the right inputs. A flat-rate plan pays one percentage on every sale and is
          the simplest to model. A tiered or graduated plan raises the rate at set sales levels, as covered above. A
          base-plus-commission plan pays a fixed amount plus a percentage, common in salaried sales jobs.
        </P>
        <P>
          Other structures include draw against commission, where an advance is paid and later deducted from earned commission,
          and accelerators, where rates rise once a quota is passed. This tool covers flat-rate calculations, reverse
          calculations, tiered brackets, and a base amount. If your plan includes draws, clawbacks, or split credit between
          colleagues, calculate the standard commission first and then apply those adjustments yourself.
        </P>
      </Card>

      <Card title="Common Mistakes That Throw Off Commission Numbers">
        <List items={[
          ["Mixing up percent and decimal.", "Entering 0.035 when the tool expects 3.5, or the reverse, throws the answer off by a factor of 100."],
          ["Gross vs. net sales.", "If refunds or discounts reduce the commissionable amount, use the net figure. A 5% commission on a $10,000 sale is $500, but if $1,000 is refunded, it’s $450."],
          ["", "Applying one tier’s rate to everything in a marginal plan."],
          ["Ignoring caps, clawbacks, and minimums.", "Some plans reduce or reverse commission on canceled deals or cap it at a maximum."],
          ["Forgetting splits.", "If two people share credit for a sale, the commission gets divided."],
          ["Ignoring fees and taxes.", "Payment processing fees, marketplace fees, and taxes all reduce what you actually keep."],
        ]} />
        <P>A fast gut check: 6% of $50,000 should be about $3,000. If the result is way off, recheck your inputs.</P>
      </Card>

      <Card title="Accuracy, Privacy, and Cost">
        <P>
          The calculator uses standard percentage formulas, so the math is exact for the numbers you put in. The result is only
          as good as your inputs, and it doesn’t know about contract fine print like caps, clawbacks, draws, or taxes. For
          anything legally binding or payroll-related, use the result to double-check your numbers against the contract or your
          finance team’s records.
        </P>
        <P>The tool is free. What you enter is just sales amounts and percentages, not personal details.</P>
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
