import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much is 20% off a price?",
    a: "Multiply the price by 0.20 to get the savings, or by 0.80 to get the final price directly. On $50, you save $10 and pay $40.",
  },
  {
    q: "Can I use two discounts at once?",
    a: "Yes. Apply the first discount, then apply the second to the reduced price. A 40% discount followed by an extra 20% gives you 52% off in total, not 60%.",
  },
  {
    q: "Is 20% off plus 20% off the same as 40% off?",
    a: "No. Two 20% discounts in a row leave you paying 0.80 × 0.80 = 64% of the original price, which is 36% off.",
  },
  {
    q: "Is 50% off the same as buy one, get one half off?",
    a: "No. On two items of equal price, buy one, get one 50% off means you pay 75% of the total, which is 25% off each item.",
  },
  {
    q: "Is sales tax calculated before or after the discount?",
    a: "In most cases, tax is calculated on the discounted price. Rules vary by state and by coupon type, so check your local policy.",
  },
  {
    q: "What’s the difference between percent off and percentage points off?",
    a: "Percent off is a share of the price. Percentage points compare two percentages. Going from 20% off to 30% off is 10 percentage points more, but the discount itself is 50% larger.",
  },
  {
    q: "How do I calculate a markup instead of a discount?",
    a: "Multiply the price by one plus the percentage as a decimal. A 15% increase on $200 is $200 × 1.15 = $230.",
  },
  { q: "When is Black Friday in 2027?", a: "Black Friday 2027 is Friday, November 26. Cyber Monday follows on November 29." },
  { q: "Is this percent off calculator free?", a: "Yes. It’s free for every calculation, with no payment required." },
];

// FAQ schema wording from the supplied JSON-LD where it differs from the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "Is 20% off plus 20% off the same as 40% off?": "No. Two 20% discounts in a row leave you paying 64% of the original price, which is 36% off.",
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) }));

const STACK_HEADERS = ["First discount", "Second discount", "Actual total off"];
const STACK_ROWS = [
  ["10%", "10%", "19%"],
  ["20%", "10%", "28%"],
  ["20%", "20%", "36%"],
  ["30%", "20%", "44%"],
  ["40%", "20%", "52%"],
  ["50%", "25%", "62.5%"],
  ["50%", "50%", "75%"],
];

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
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function PercentOffCalculatorFaqSection() {
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
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What This Percent Off Calculator Does">
        <P>
          A percent off calculator answers one of four questions, depending on which two numbers you already have. Enter an
          original price and a discount percentage, and you get the sale price plus the money you keep. Enter an original price
          and a sale price, and you learn how deep the discount really is. Enter a sale price and the percentage taken off, and
          you can work backward to what the item cost before the markdown.
        </P>
        <P>
          Most basic discount tools only handle the first case. Being able to start from any two values matters because shoppers
          rarely have the same information every time. A tag might show only the sale price and “30% off.” A receipt might show
          what you paid and what the item cost. A seller might need to know what percentage they have to cut to hit a target
          price.
        </P>
      </Card>

      <Card title="The Four Calculation Modes Explained">
        <List items={[
          ["Final price.", "You know the original price and the percent off. The result is the price you pay after the reduction, shown alongside the amount saved."],
          ["Amount saved.", "The same inputs also reveal the savings in currency terms. This is the figure to compare against other offers, since “$25 off” and “20% off” are not the same deal across different price points."],
          ["Percent off.", "You know the original price and the sale price. The tool shows what share of the original price was removed. This is the quickest way to check whether a “huge markdown” is really huge."],
          ["Original price.", "You know the sale price and the discount percentage. The tool reconstructs the price before the discount, which is useful for verifying that a retailer’s “was” price is believable."],
        ]} />
      </Card>

      <Card title="How to Calculate Percent Off: Formulas and Worked Examples">
        <P>Knowing the formulas helps you check any result and do rough estimates in your head.</P>
        <Formula>
          Amount saved = original price × (percent off ÷ 100)<br />
          Final price = original price − amount saved, or equivalently original price × (1 − percent off ÷ 100)<br />
          Percent off = (original price − sale price) ÷ original price × 100<br />
          Original price = sale price ÷ (1 − percent off ÷ 100)
        </Formula>
        <P>
          <strong>Example 1: finding the sale price.</strong> A jacket costs $80 and is 25% off. The savings are 80 × 0.25 = $20,
          so the final price is $60.
        </P>
        <P>
          <strong>Example 2: finding the percent off.</strong> A pair of headphones was $120 and is now $90. The reduction is $30,
          and 30 ÷ 120 = 0.25, so the discount is 25%.
        </P>
        <P>
          <strong>Example 3: finding the original price.</strong> A tablet is on sale for $45 after 30% off. Because you are paying
          70% of the original, divide 45 by 0.70 to get about $64.29.
        </P>
        <P>
          That third example is where people most often go wrong. Adding 30% to $45 gives $58.50, which is incorrect, because the
          30% was calculated on the larger, original price, not on the sale price. Dividing by the remaining share (here 0.70) is
          the correct method, and it is exactly what the reverse mode does for you.
        </P>
      </Card>

      <Card title="Practical Scenarios: When You Need a Percent Off Calculator">
        <List items={[
          ["Comparing sales across stores.", "One store advertises 35% off a $64 item, another offers $20 off the same item at $62. The calculator shows the first costs $41.60 and the second $42, so a small difference becomes visible quickly."],
          ["Checking clearance claims.", "Prices marked “was $200, now $140” are easy to inflate. Running the two values through the tool confirms the discount is 30%, and you can compare it against what the item typically sells for."],
          ["Budgeting a big purchase.", "If you have a fixed budget, you can enter the original price and the discount to see whether the final cost fits, or work backward from your budget to learn what discount you need to wait for."],
          ["Pricing as a seller.", "Small business owners and marketplace sellers use percent-off calculations to set promotional prices and to confirm that a planned markdown still leaves an acceptable margin."],
          ["Planning ahead for events.", "Before a large sale season, you can pre-calculate the sale price of items on your wishlist so you recognize a good deal immediately instead of guessing under time pressure."],
          ["Splitting and expense cases.", "Group orders, bulk purchases, and wholesale price lists are often discounted by tier. Applying the right percentage per tier is more reliable with a calculator than by mental math."],
        ]} />
      </Card>

      <Card title="Mental Math Shortcuts for Common Discounts">
        <P>A calculator is faster and exact, but a few shortcuts help you estimate on the shop floor.</P>
        <List items={[
          ["10% off:", "move the decimal point one place left and subtract. For $46, take off $4.60."],
          ["20% off:", "find 10% and double it."],
          ["15% off:", "find 10%, add half of that, and subtract the total."],
          ["25% off:", "take a quarter of the price, or halve it twice."],
          ["50% off:", "divide by two."],
          ["33% off:", "roughly a third of the price."],
        ]} />
        <P>For something like 17% or 28%, estimate with the nearest shortcut and let the tool produce the precise number.</P>
      </Card>

      <Card title="Common Percent Off Mistakes to Avoid">
        <List items={[
          ["Treating percentage points as percent.", "A discount that goes from 20% to 30% is a 10 percentage point increase in the markdown, but the savings on the price grow by half (from 20% to 30% of the original), not by 10%."],
          ["Assuming a discount and a markup cancel out.", "Taking 20% off $100 gives $80. Adding 20% back to $80 gives $96, not $100. Percentages always apply to whatever number they are applied to."],
          ["Ignoring when sales tax is applied.", "In most places, tax is charged on the discounted price. If an item is $60 after discount and the tax rate is 8%, you pay $64.80. Confirm how tax is handled locally, because a few cases (such as certain manufacturer coupons) are treated differently."],
          ["Misreading “buy one, get one 50% off.”", "On two identical items, you pay full price for one and half for the other, which is 75% of the combined price. That equals 25% off per item, not 50%."],
          ["Confusing “percent of” with “percent off.”", "A price that is 70% of the original is 30% off. The two phrasings describe the same deal from opposite directions."],
        ]} />
      </Card>

      <Card title="How Do You Calculate 10 Percent Off a Product?">
        <P>
          Ten percent is the easiest discount to do in your head, and it’s the building block for a lot of other percentages.
          Move the decimal point one place to the left, and that’s your savings. Subtract it from the price and you’re done.
        </P>
        <P>
          Say a pair of sneakers costs $84. Ten percent of $84 is $8.40, so the sale price is $84 − $8.40 = $75.60. Another way to
          get there is to multiply the price by 0.90 in one step, since paying 90% of something is the same as taking 10% off.
        </P>
        <P>
          Here’s one more with a bigger number. A $279 item at 10% off saves you $27.90, so you pay $251.10. If you’re looking at a
          price like $19.99, don’t worry about the cents. Round it to $20, take off $2, and you know you’re around $18. The
          calculator gives you the exact figure to the penny.
        </P>
      </Card>

      <Card title="How Do You Find the Percent Discount in a Sale Price?">
        <P>
          This is the one you need when a tag shows two prices and doesn’t tell you the percentage, or when you want to
          double-check a store’s claim. You need the original price and the sale price.
        </P>
        <P>
          First, subtract the sale price from the original to get the dollar amount of the discount. Then divide that by the
          original price. Finally, multiply by 100.
        </P>
        <P>Take a jacket that was $120 and is now $90. The difference is $30. Then $30 ÷ $120 = 0.25, so the discount is 25%.</P>
        <P>
          Always divide by the original price, not the sale price. If you divide $30 by $90 you get 33%, which is wrong, and it’s a
          mistake that makes sales look bigger than they are. The discount is always measured against where the price started.
        </P>
        <P>
          This is also how you’d spot a weak “deal.” If something went from $48.99 to $44.99, the drop is $4, and $4 ÷ $48.99 is
          about 8%. That’s not nothing, but it’s far from the “big savings” some banners imply.
        </P>
      </Card>

      <Card title="How Do You Find the Price Before a Discount?">
        <P>
          Sometimes you only see what you paid, and you want to know the original price. Maybe you’re checking a “was” price, or
          you’re trying to figure out what a friend’s gift really cost.
        </P>
        <P>
          The trick is to divide, not add. If you know the sale price and the percent off, divide the sale price by what’s left
          after the discount.
        </P>
        <P>
          Here’s a tablet that cost you $45 after 30% off. You paid 70% of the original, so you divide $45 by 0.70 and get about
          $64.29. To check it, take 30% off $64.29 and you’ll land back on $45.
        </P>
        <P>
          Plenty of people try to add 30% to $45 instead, and they get $58.50. That’s wrong because the 30% was taken from the
          bigger original price, not from the smaller sale price. Your 30% was worth more than 30% of $45.
        </P>
        <P>
          You can use the same approach on the $1,250 TV from earlier. It was 75% off, so you paid 25%. Divide $1,250 by 0.25 and
          you get the original $5,000.
        </P>
        <P>The reverse mode in the calculator does this for you, so you don’t have to think about which direction to go.</P>
      </Card>

      <Card title="What This Percent Off Calculator Does">
        <P>
          The calculator works from any two values, which matters because shoppers rarely have the same information each time. A
          tag might show only the sale price and “30% off.” A receipt might list what you paid and the old price. A seller might
          want to find the percent they have to cut to hit a target price.
        </P>
        <H3>Final Price</H3>
        <P>You know the original price and the percent off. The result is the price you’ll pay after the reduction.</P>
        <H3>Amount Saved</H3>
        <P>
          The same two inputs also show your savings in dollars. That’s the number to compare across offers, because “$25 off” and
          “20% off” aren’t the same deal at every price point.
        </P>
        <H3>Percent Off</H3>
        <P>
          You know the original and sale prices. The tool tells you how much of the original price was removed. It’s the quickest
          way to check whether a “huge markdown” really is huge.
        </P>
        <H3>Original Price</H3>
        <P>
          You know the sale price and the discount percentage. The tool rebuilds the price from before the markdown, which helps
          when you’re checking whether a retailer’s “was” price is believable.
        </P>
        <H3>Stacking Additional Discounts</H3>
        <P>
          Stores love to layer offers. You’ll see 40% off clearance, then an extra 20% off at checkout with a code. It’s natural to
          assume those add up to 60% off. They don’t, and the calculator’s additional discount option is built for exactly this
          situation.
        </P>
      </Card>

      <Card title="Why 20% Plus 15% Isn’t 35%">
        <P>
          Each discount applies to the price left after the one before it. Let’s use the $279 item again. The store takes 20% off,
          which saves $55.80 and leaves $223.20. You’ve also got a coupon for another 15% off. That 15% applies to $223.20, not to
          $279.
        </P>
        <P>
          Fifteen percent of $223.20 is $33.48, so the final price is $223.20 − $33.48 = $189.72. Your total savings are $55.80 +
          $33.48 = $89.28. Divide that by the original $279 and you get 32%, not 35%.
        </P>
        <H3>The One-Line Version</H3>
        <P>You don’t need to run each step separately. Multiply the original price by each multiplier:</P>
        <Formula>Final price = $279 × 0.80 × 0.85 = $189.72</Formula>
        <P>
          Each multiplier represents what’s left after that discount. To find the combined discount, multiply the multipliers
          together and subtract the result from 1. Here, 0.80 × 0.85 = 0.68, so you pay 68% and save 32%.
        </P>
        <H3>Quick Reference for Common Combinations</H3>
        <DataTable headers={STACK_HEADERS} rows={STACK_ROWS} />
        <H3>Does the Order Matter?</H3>
        <P>
          Not for two percentage discounts. 0.60 × 0.80 is the same as 0.80 × 0.60, so the final price comes out identical either
          way. Flat-dollar coupons are different. A $10 coupon applied before a 20% discount gives you a different total than a $10
          coupon applied after it. Taking the dollar amount off first lets the percentage reduce it too, which usually puts a
          little more money in your pocket. Check your checkout page to see which order the store uses.
        </P>
      </Card>

      <Card title="Percent Off vs. Dollar Off: Which Deal Is Better?">
        <P>
          Comparing “20% off” to “$15 off” gets confusing fast, and the answer depends on the price. Take a $40 item. Twenty
          percent off saves $8, while $15 off saves $15, which works out to 37.5% off. On a $120 item, 20% off saves $24, and the
          $15 coupon looks pretty small.
        </P>
        <P>
          To find the break-even point, divide the dollar amount by the percentage. For $15 vs. 20%, that’s $15 ÷ 0.20 = $75.
          Below $75, the $15 coupon wins. Above $75, the 20% coupon wins. It’s a small calculation, but it can save you real money
          when a store lets you pick one offer.
        </P>
      </Card>

      <Card title="Discounts, Sales Tax, and What You’ll Actually Pay at Checkout">
        <P>
          In most places in the U.S., sales tax is charged on the price after the discount. That works in your favor, since a
          cheaper price also means less tax. A $60 sale price with 8% tax comes to $60 × 1.08 = $64.80.
        </P>
        <P>
          There’s a wrinkle. Some manufacturer coupons and rebates are treated differently, and the tax may be based on the
          pre-coupon price. If a $100 item is 25% off and tax is 8%, you’d pay $81 when the tax is charged on the $75 sale price.
          If the tax were charged on the full $100 before a $25 manufacturer coupon came off, you’d pay $108 − $25 = $83. It’s not
          a huge gap, but it can show up on a big purchase. Tax rules vary by state and sometimes by city, and they change over
          time, so check your local rules if the exact total matters.
        </P>
      </Card>

      <Card title="Seeing Through Sale Pricing">
        <H3>The Anchoring Effect</H3>
        <P>
          Discounts don’t just lower prices. They change how a price feels. When you see a crossed-out $200 next to $140, your
          brain treats $200 as the “real” price, which makes $140 feel like a win. Psychologists call this the anchoring effect.
          The original price becomes a reference point, and it can make the sale price seem better than it is.
        </P>
        <P>
          For retailers, a percent-off deal creates urgency and nudges impulse buys. It can also build loyalty when used
          sparingly. There’s a catch, though. Run discounts all the time and shoppers learn to wait for them, and the brand can
          start to look cheaper than it wants to. As a buyer, knowing this helps you slow down and ask what the item is worth to
          you, not what the tag says it used to cost.
        </P>
        <H3>“Up to 70% Off” and Other Fine Print</H3>
        <P>
          “Up to” means a few items hit that number, and most don’t. Run the discount on the specific thing you’re buying instead
          of trusting the banner. If the original price looks high, check what other stores charge or look at a price history
          tracker.
        </P>
        <H3>Planning for Black Friday 2027</H3>
        <P>
          People often ask how much percent off Black Friday really is. There’s no single answer, since it varies by category.
          Electronics, small appliances, and TVs often see deep cuts, while many other items get modest ones. Black Friday 2027
          falls on Friday, November 26, and Cyber Monday is November 29. If you’re after something specific, pick a few items now,
          note their current prices, and run the numbers in the calculator ahead of time. When the deals go live, you’ll know in a
          few seconds whether an offer beats what you’d normally pay.
        </P>
      </Card>

      <Card title="Percent Off for Sellers and Small Businesses">
        <P>
          If you sell products, a discount isn’t just a number. It’s a cut in your profit. Say an item costs you $50 to buy and you
          sell it for $80. Your margin is $30, or 37.5% of the selling price. Offer 25% off and the price drops to $60. You still
          make $10 per sale, but your margin has fallen to about 16.7%.
        </P>
        <P>
          To find the deepest discount you can offer without losing money, subtract your cost from the price, then divide by the
          price. In this case, ($80 − $50) ÷ $80 = 37.5%. Anything above that and you’re selling at a loss, before you count
          shipping, fees, and packaging. Run your planned discount through the calculator before you launch a promotion so you
          know where your floor is.
        </P>
      </Card>

      <Card title="Handling Price Increases">
        <P>
          The same math works in reverse when a price goes up. To add a percentage, multiply by one plus the percentage as a
          decimal. A $200 item with a 15% increase becomes $200 × 1.15 = $230.
        </P>
        <P>
          Remember that a discount and an increase of the same percent don’t cancel out. Take 20% off $100 and you’ve got $80. Add
          20% back to $80 and you’re at $96, not $100. To get back to the starting price, you’d need to add 25%.
        </P>
      </Card>

      <Card title="Accuracy, Privacy, and Why You Can Trust the Results">
        <P>
          The calculator uses the standard percentage formulas shown above, so you’ll get the same answer on paper. It handles
          decimals, so inputs like 12.5% or $19.99 work as expected. Results are rounded to the cent, and in rare cases you might
          see a one-cent difference from a retailer’s system, since stores sometimes round at different steps.
        </P>
        <P>
          The tool is free, and there are no hidden charges for any of the four modes or for stacked discounts. You only enter
          prices and percentages, which aren’t personal information, so you never have to share anything sensitive. The formulas
          don’t change from year to year, so the method works the same for deals you spot in 2027 as it does today.
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
