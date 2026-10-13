import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate sales tax?",
    a: "Multiply the price by the tax rate as a decimal, then add that to the price. $50 at 7% is $50 × 0.07 = $3.50 in tax, for a total of $53.50.",
  },
  {
    q: "How do I calculate the price before tax from a total?",
    a: "Divide the total by 1 plus the rate as a decimal. $53.50 ÷ 1.07 = $50.00. Don't just subtract 7% of the total, because that gives you the wrong number.",
  },
  {
    q: "How do I find the sales tax rate if I only have the prices?",
    a: "Subtract the before-tax price from the after-tax price, divide by the before-tax price, and multiply by 100. Or enter both prices into the calculator and it'll give you the rate.",
  },
  {
    q: "Which states have no sales tax?",
    a: "Alaska, Delaware, Montana, New Hampshire, and Oregon don't have a statewide sales tax. Alaska allows local sales taxes, Montana has some local resort taxes, and Delaware taxes businesses through a gross receipts tax.",
  },
  {
    q: "What sales tax rate should I enter?",
    a: "Use the combined rate for the place where the sale happens: state, county, and city together. Your state revenue department has official rates, and a recent local receipt will show what a store charged.",
  },
  {
    q: "Which state has the highest sales tax?",
    a: "Louisiana has the highest average combined rate, at about 10.13%, followed by Tennessee, Washington, Arkansas, and Alabama. California has the highest state-level base rate at 7.25%.",
  },
  {
    q: "Do I charge sales tax to out-of-state customers?",
    a: "Often not, but it depends on whether you have nexus in the customer's state. Since the 2018 Wayfair decision, sellers who pass a state's sales threshold may have to collect tax there. If the customer picks the item up in your state, your own state's tax usually applies.",
  },
  {
    q: "What's the difference between sales tax and excise tax?",
    a: "Sales tax is a general percentage tax on most retail purchases. Excise tax targets specific products like gas, alcohol, and tobacco, and it's often a fixed amount per unit.",
  },
  {
    q: "How much is sales tax on a car?",
    a: "It's usually the state and local rate applied to the purchase price, often minus your trade-in value. Many states base it on where you register the vehicle, so check the rules for your home address.",
  },
  {
    q: "Do you pay sales tax on a house?",
    a: "No. Houses are subject to property tax and, in many areas, a transfer or recording tax at closing, but not sales tax.",
  },
  {
    q: "Is sales tax regressive?",
    a: "Yes. It's a flat percentage of what you spend, and lower-income households spend a larger share of their income, so it takes a bigger portion of their earnings.",
  },
  {
    q: "Can I use this calculator for VAT or GST?",
    a: "Yes. VAT and GST are percentage-based, so the same math works. Enter your country's rate to find the net price, the tax-inclusive price, or the rate.",
  },
  {
    q: "Is this sales tax calculator free, and do I need to sign up?",
    a: "It's free, and you don't need an account.",
  },
];

// Structured data uses the supplied schema wording, which differs from the visible text in one answer.
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  item.q === "How do I find the sales tax rate if I only have the prices?"
    ? { ...item, a: "Subtract the before-tax price from the after-tax price, divide by the before-tax price, and multiply by 100. Or enter both prices into the calculator and it will give you the rate." }
    : item
);

const RATE_HEADERS = ["State Base Rate", "States"];
const RATE_ROWS = [
  ["0%", "Alaska, Delaware, Montana, New Hampshire, Oregon"],
  ["2.9%", "Colorado"],
  ["4%", "Alabama, Georgia, Hawaii, New York, Wyoming"],
  ["4.2%", "South Dakota"],
  ["4.225%", "Missouri"],
  ["4.5%", "Oklahoma"],
  ["4.75%", "North Carolina"],
  ["4.875%", "New Mexico"],
  ["5%", "Louisiana, North Dakota, Wisconsin"],
  ["5.3%", "Virginia"],
  ["5.5%", "Maine, Nebraska"],
  ["5.6%", "Arizona"],
  ["5.75%", "Ohio"],
  ["6%", "District of Columbia, Florida, Idaho, Iowa, Kentucky, Maryland, Michigan, Pennsylvania, South Carolina, Vermont, West Virginia"],
  ["6.1%", "Utah"],
  ["6.25%", "Illinois, Massachusetts, Texas"],
  ["6.35%", "Connecticut"],
  ["6.5%", "Arkansas, Kansas, Washington"],
  ["6.625%", "New Jersey"],
  ["6.85%", "Nevada"],
  ["6.875%", "Minnesota"],
  ["7%", "Indiana, Mississippi, Rhode Island, Tennessee"],
  ["7.25%", "California"],
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
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: j === 0 ? "nowrap" : "normal", verticalAlign: "top" }}>
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

export default function SalesTaxCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Sales Tax Calculator Does</h2>
        <p style={pStyle}>
          Most online calculators only go one way: you type a price and a rate, and you get a total. This one handles
          three jobs.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>You know the price and the rate, and you want the total.</strong> That's the classic "how much will
            this actually cost me" question.
          </li>
          <li style={liStyle}>
            <strong>You know the total and the rate, and you want the original price.</strong> This is the reverse sales
            tax calculator part. It's handy when all you have is a receipt or an invoice with tax already baked in.
          </li>
          <li style={liStyle}>
            <strong>You know both prices and want the rate.</strong> If the subtotal was $250 and the total was $271.25,
            the tool tells you the store charged 8.5%.
          </li>
        </ul>
        <p style={pStyle}>
          That third one is the one people rarely find. It's also the quickest way to check whether a seller charged the
          right percentage.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick note on terms. You'll see "net price" and "gross price" in a lot of tax writing. Net is the price
          before tax. Gross is the price after tax. Same thing as before-tax and after-tax, just different labels. The
          tax amount itself is simply the gap between the two.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Sales Tax Calculator</h2>
        <p style={pStyle}>
          Fill in the two numbers you already have and let the tool give you the third. A few examples:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Want the total?</strong> Enter the before-tax price and the tax rate.
          </li>
          <li style={liStyle}>
            <strong>Want the price before tax?</strong> Enter the final amount you paid and the tax rate.
          </li>
          <li style={liStyle}>
            <strong>Want the rate?</strong> Enter the price before tax and the price after tax.
          </li>
        </ul>
        <p style={pStyle}>
          Type the rate as a regular percentage. For 7.25%, enter 7.25, not 0.0725. If you're not sure what rate applies
          where you shop, look at a recent receipt from a store nearby, or check your state revenue department's website.
          Plenty of receipts print the rate or show the tax line, so you can work it out in about ten seconds.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the result looks off, the most common cause is that one of the numbers isn't what you think it is. People
          paste in a total when the field wants the pre-tax price, or the other way around. Double-check which one you've
          got before you blame the math.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Sales Tax: The Formulas</h2>
        <p style={pStyle}>
          The math is simple enough to do yourself, which is also how you can sanity-check any calculator, this one
          included. There are really only three relationships.
        </p>
        <div style={formulaStyle}>
          Tax amount = before-tax price × (rate ÷ 100)
          <br />
          After-tax price = before-tax price × (1 + rate ÷ 100)
          <br />
          Rate = ((after-tax price − before-tax price) ÷ before-tax price) × 100
        </div>
        <p style={pStyle}>Here's how each one plays out.</p>
        <p style={pStyle}>
          <strong>Finding the total.</strong> A jacket is $80.00 and the rate is 8.25%. Tax is $80 × 0.0825 = $6.60, so
          you pay $86.60.
        </p>
        <p style={pStyle}>
          <strong>Finding the total with a messier number.</strong> Say you're buying something for $62.50 in a place
          that charges 6.25%. Tax comes to $3.90625, which rounds to $3.91, and the total is $66.41. Stores round to the
          nearest cent, so you do too.
        </p>
        <p style={pStyle}>
          <strong>Finding the rate.</strong> An invoice shows $250.00 before tax and $271.25 after. The difference is
          $21.25, and $21.25 ÷ $250 = 0.085. That's 8.5%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you've ever worked out a percent increase, this is the same thing. Adding sales tax is just a percent
          increase where the percentage happens to be set by the government.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Take Sales Tax Out of a Total</h2>
        <p style={pStyle}>This is where most hand calculations go wrong, so it gets its own section.</p>
        <p style={pStyle}>
          When you've got a total and you want the original price, the instinct is to take the tax percentage of the
          total and subtract it. It feels right. It's wrong, because the tax was figured on the smaller, pre-tax price,
          not on the final number.
        </p>
        <p style={pStyle}>
          Try it with a $108.00 total and an 8% rate. The right move is to divide by 1.08, which gives $100.00. So $8.00
          of that total was tax. The shortcut, 8% of $108, is $8.64, and subtracting it leaves $99.36. You're off by 64
          cents on a small purchase, and the gap grows with the price. On a $2,000 purchase at 8%, you'd be off by about
          $12.
        </p>
        <p style={pStyle}>So the rule is:</p>
        <div style={formulaStyle}>Price before tax = total ÷ (1 + rate ÷ 100)</div>
        <p style={pStyle}>
          If you only want the tax portion of a tax-inclusive total, there's a shortcut: tax = total × rate ÷ (100 +
          rate). For $108 at 8%, that's 108 × 8 ÷ 108 = $8.00.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more real-world example. You're selling at a craft fair and want to charge a round $20 with tax included,
          in a place that charges 8.5%. Divide $20 by 1.085 and you get $18.43 before tax, with $1.57 going to tax.
          That's the number to record in your books.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Quick Mental Math for Sales Tax</h2>
        <p style={pStyle}>
          You won't always have a calculator open. For most rates you can get close in your head with the 10% trick.
        </p>
        <p style={pStyle}>
          Find 10% of the price by moving the decimal one spot left, then 1% by moving it two spots. Build the rate from
          those. Say you're looking at a $40 item and the rate is 8%. Ten percent is $4.00, one percent is $0.40, so
          eight percent is $3.20. At 7% on a $60 item, 10% is $6.00 and 1% is $0.60, so 7% is $4.20.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's good enough for deciding whether something fits your budget. When the exact figure matters, like
          invoices, expense reports, and anything you'll be filing, use the calculator.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Sales Tax Calculator</h2>
        <p style={pStyle}>Here's where it comes in handy in real life.</p>
        <p style={pStyle}>
          <strong>Shopping and budgeting.</strong> In the U.S., the price on the tag almost never includes sales tax. A
          $1,500 TV costs $1,590 at a 6% rate and $1,650 at a 10% rate. If you're comparing a store across town to one
          across a city or county line, that $60 gap is real money.
        </p>
        <p style={pStyle}>
          <strong>Buying a car.</strong> Car sales tax is a big number, so small details matter. Take a $28,000 car with
          a $6,000 trade-in at 7.5%. In most states, the trade-in reduces the taxable amount, so you'd pay tax on
          $22,000, which is $1,650. If your state doesn't give you that credit, tax is on the full $28,000, which is
          $2,100. Also, vehicle tax is often based on where you register the car, not where the dealer is. Check your
          state's rules before you sign, and run both scenarios.
        </p>
        <p style={pStyle}>
          <strong>Pricing for a small business.</strong> If you sell at markets, in a shop, or at events, you may want
          clean tax-inclusive prices. Working back from the target total tells you what portion is revenue and what
          portion you owe.
        </p>
        <p style={pStyle}>
          <strong>Bookkeeping and expense reports.</strong> A lot of receipts only show a total. If your accountant or
          your employer wants the tax broken out, you need to split the total into subtotal and tax. That's the reverse
          calculation above.
        </p>
        <p style={pStyle}>
          <strong>Checking invoices.</strong> When a vendor sends a subtotal and a total, calculating the rate shows you
          whether the tax charged matches the rate that should apply. It's easier to raise a billing issue when you can
          point to a percentage.
        </p>
        <p style={pStyle}>
          <strong>Selling online.</strong> If you ship to customers in several states, you need to know roughly what tax
          each one will see. A quick calculation helps you spot-check that your store's tax settings are producing
          sensible totals.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Comparing prices abroad.</strong> Many countries display prices with VAT already included. Using the
          reverse mode, you can see the net price and the tax portion of any price tag.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Sales Tax?</h2>
        <p style={pStyle}>
          Sales tax is a consumption tax. It's charged when you buy certain goods and services, and the seller collects
          it and sends it to the government. You pay it, but the business does the paperwork. That's what "indirect tax"
          means.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the U.S., the standard version is a retail sales tax, meaning it's charged once, at the point of sale to the
          end customer. You'll see it as a separate line on your receipt. And since it only applies to final retail
          sales, most business-to-business purchases are exempt. A bakery doesn't pay sales tax on flour it plans to turn
          into bread, because the tax shows up when the customer buys the bread.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sales Tax in the United States</h2>
        <p style={pStyle}>
          There's no federal sales tax in the U.S. It's a state and local thing. That's why the same $100 purchase can
          cost you different amounts depending on where you live.
        </p>

        <h3 style={h3Style}>States with no sales tax</h3>
        <p style={pStyle}>
          Five states have no statewide sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. People call them
          the NOMAD states. But "no sales tax" can be misleading. Alaska lets cities and boroughs add their own taxes.
          Montana has local resort taxes in some towns. New Hampshire charges a tax on meals and rooms. Delaware skips
          the sales tax but charges businesses a gross receipts tax, which many of them build into their prices. So
          "tax-free" is a little more complicated than it sounds.
        </p>

        <h3 style={h3Style}>State rates</h3>
        <p style={pStyle}>
          Here are state base rates as of January 1, 2026, grouped by rate. These are the state portion only. Counties
          and cities add more on top.
        </p>
        <DataTable headers={RATE_HEADERS} rows={RATE_ROWS} />
        <p style={pStyle}>
          Two footnotes. Hawaii and New Mexico technically run on a general excise tax and a gross receipts tax, which
          work a little differently from a standard retail sales tax, but shoppers see them as sales tax at the register.
          And South Dakota's 2023 rate cut is set to expire after 2026, so expect that rate to change.
        </p>

        <h3 style={h3Style}>Local taxes are where it gets interesting</h3>
        <p style={pStyle}>
          The state rate is only part of what you pay. Thirty-eight states allow local sales taxes, and in some places
          the local piece rivals or beats the state rate. Louisiana is the best example. Its state rate is 5%, but its
          average combined rate is the highest in the country at 10.13%, followed by Tennessee (9.61%), Washington
          (9.57%), Arkansas (9.48%), and Alabama (9.46%). On the local side, Alabama, Louisiana, Colorado, Oklahoma, and
          New York have the highest average local add-ons. And the population-weighted national average combined rate is
          about 7.53%.
        </p>
        <p style={pStyle}>
          Averages are only a starting point. The rate you'll actually pay depends on the specific address. Some cities
          in Alabama, Louisiana, and Colorado reach double digits, while the state next door could be well below that.
          For a precise number, use your state department of revenue's rate lookup and enter the exact address.
        </p>
        <p style={pStyle}>
          State base rates have been steady lately. No state raised its base rate between January and July 2026, but
          local rates change all the time, usually on January 1 and July 1.
        </p>

        <h3 style={h3Style}>What's taxable and what isn't</h3>
        <p style={pStyle}>Every state sets its own list, which is why this trips people up. Some general patterns:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Groceries</strong> are exempt or taxed at a reduced rate in most states. Prepared food, like
            restaurant meals, is usually fully taxed.
          </li>
          <li style={liStyle}>
            <strong>Prescription drugs</strong> are exempt in nearly every state. Over-the-counter medicine varies.
          </li>
          <li style={liStyle}>
            <strong>Clothing</strong> is mostly taxable, but a few states, including New Jersey, Pennsylvania, and
            Minnesota, generally exempt it. Some others exempt it below a price cap.
          </li>
          <li style={liStyle}>
            <strong>Digital goods and software</strong> are taxed in some states and not in others.
          </li>
          <li style={liStyle}>
            <strong>Services</strong> are mostly untaxed, though a growing number of states tax certain ones.
          </li>
          <li style={liStyle}>
            <strong>Shipping and delivery charges</strong> are taxable in some states and not in others.
          </li>
        </ul>
        <p style={pStyle}>
          Some states also hold sales tax holidays, usually around the back-to-school season, where certain items like
          clothing or school supplies are exempt for a weekend.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If a receipt has a mix of taxable and non-taxable items, calculate the taxable part separately. Running the
          whole subtotal through the calculator will overstate the tax.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Your Receipt Doesn't Match Your Calculation</h2>
        <p style={pStyle}>
          If you've ever done the math and come up a few cents or a few dollars off, one of these is probably why.
        </p>
        <p style={pStyle}>
          <strong>You used the wrong rate.</strong> The most common one. You used the state rate and forgot the city or
          county add-on, or you used a rate from a different location. ZIP codes can also cross jurisdiction lines, so
          two houses with the same ZIP can have different rates.
        </p>
        <p style={pStyle}>
          <strong>Some items weren't taxed.</strong> Groceries, medicine, and clothing in some states don't get the full
          rate, and the tax on a mixed receipt isn't a flat percentage of the total.
        </p>
        <p style={pStyle}>
          <strong>Coupons and discounts.</strong> A store coupon usually reduces the taxable price. If an item is $120,
          you have a 25% off coupon, and the rate is 8%, you'd pay tax on $90, which is $7.20, for a total of $97.20.
          Manufacturer coupons often work differently, because the store gets reimbursed and the tax may be figured on
          the pre-coupon price. This varies by state.
        </p>
        <p style={pStyle}>
          <strong>Rounding.</strong> Some stores round the tax on each line item. Others add everything up and calculate
          tax on the subtotal. Both are legal, and they can produce results that differ by a cent or two.
        </p>
        <p style={pStyle}>
          <strong>Shipping, fees, or bottle deposits.</strong> These sometimes get taxed and sometimes don't.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Tax rules on cars and big items.</strong> As mentioned earlier, trade-ins, rebates, and registration
          location can change the taxable amount.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sales Tax vs. Use Tax vs. Excise Tax</h2>
        <p style={pStyle}>These get mixed up constantly.</p>
        <p style={pStyle}>
          <strong>Use tax</strong> is the companion to sales tax. If you buy something from a seller who doesn't charge
          you sales tax, say an out-of-state vendor, your home state generally expects you to pay use tax at the same
          rate. Individuals technically owe it, though plenty of people never report it. Businesses get audited on it
          more often.
        </p>
        <p style={pStyle}>
          <strong>Excise tax</strong> is a tax on specific products, like gasoline, alcohol, tobacco, and airline
          tickets. It's often a flat amount per unit rather than a percentage, and it's usually built into the shelf
          price, so you don't see it as a separate line. Sales tax is a general percentage tax on a wide range of
          purchases.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Property and transfer taxes</strong> are what you deal with when you buy a house. You don't pay sales
          tax on real estate in the usual sense, but you'll face property taxes, and in many places a transfer or
          recording tax at closing. If someone asks whether you pay sales tax on a house, the short answer is no, but
          there are other taxes to plan for.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sales Tax vs. VAT vs. GST</h2>
        <p style={pStyle}>
          Outside the U.S., most countries use value-added tax. About 160 countries do. Many call it GST, for goods and
          services tax, including Canada, India, Australia, New Zealand, and Singapore. The names vary and the details
          differ a lot from one country to the next, but the basic idea is the same.
        </p>
        <p style={pStyle}>
          The difference from U.S. sales tax is when the tax is collected. Sales tax hits once, at the register. VAT hits
          at every step of the supply chain, but each business deducts the VAT it already paid, so each one is really
          only paying on the value it adds. The final customer ends up carrying the whole tax.
        </p>
        <p style={pStyle}>
          Here's a simple example at 10%. A grower sells grain to a mill for $100, so VAT is $10. The mill sells flour to
          a bakery for $180. VAT on that sale is $18, but the mill already paid $10, so it sends $8. The bakery sells
          bread to a shop for $280. VAT is $28, minus the $18 it paid, so $10. The shop sells to the customer for $400.
          VAT is $40, minus the $28 it paid, so $12. Add them up: $10 + $8 + $10 + $12 = $40. A 10% retail sales tax on
          a $400 sale is also $40. Same total, different collection method.
        </p>
        <p style={pStyle}>
          Each setup has its supporters. VAT is harder to dodge, because tax gets collected all along the chain. But
          it's more complicated for businesses and has a regressive effect, since people with lower incomes spend a
          bigger share of what they earn. Retail sales tax is simpler to administer, since only the final sale is taxed,
          but it relies on the seller collecting correctly at one point.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The practical bit for this tool: in many countries, advertised prices include VAT already. That makes the
          displayed price an after-tax price, and dividing by one plus the rate gives you the price before tax. The
          calculator works for any percentage you enter, so it handles VAT and GST too.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sales Tax Rules for Sellers</h2>
        <p style={pStyle}>
          If you sell goods, a calculator helps with pricing, but the rules about what you have to collect matter more.
        </p>
        <p style={pStyle}>
          <strong>Nexus</strong> means you have enough of a connection to a state that you have to collect its sales
          tax. That used to mean a physical presence, like a store or warehouse. After the 2018 Supreme Court decision in
          South Dakota v. Wayfair, states can also require out-of-state sellers to collect tax once they pass a sales
          threshold. $100,000 in sales into a state is common, but some states set it higher, and some also count a
          number of transactions. Because the rules differ, look up each state where you sell a meaningful amount.
        </p>
        <p style={pStyle}>
          <strong>Marketplace facilitator laws</strong> now require platforms like Amazon, eBay, and Etsy to collect and
          remit sales tax on behalf of third-party sellers in most states. If you sell mainly through a marketplace, a lot
          of this is handled for you. Sales through your own website are still your responsibility.
        </p>
        <p style={pStyle}>
          <strong>Sourcing rules</strong> decide which rate applies. Most states use destination-based sourcing, meaning
          the rate depends on where the buyer receives the item. A smaller group, including Texas, Arizona, Ohio,
          Pennsylvania, and Virginia, use origin-based rules for certain in-state sales, meaning the seller's location
          sets the rate. Selling to an out-of-state customer generally doesn't mean charging your own state's tax, but if
          they're picking the item up in your store, usually it does.
        </p>
        <p style={pStyle}>
          <strong>Streamlined Sales Tax.</strong> This is a multi-state agreement that's been going since 2005, aimed at
          simplifying things. Member states agree on common definitions, a single state-level rate, and central
          registration. Roughly two dozen states are members. If you sell in several states, it's worth looking at.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Registration, collection, and filing obligations come with real penalties for mistakes. A calculator is a good
          check, but use your state's guidance or a tax professional for the actual compliance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Short History of Sales Tax</h2>
        <p style={pStyle}>
          Sales taxes are old. Tomb paintings from ancient Egypt show tax collectors, and Rome under Julius Caesar
          charged a 1% tax on sales. Spain had a national sales tax from the 1300s into the 1700s, and France's version
          was so unpopular that there were dozens of rebellions against it in the 1600s.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the U.S., the modern retail sales tax is a product of the Great Depression. State governments were losing
          income and property tax revenue fast, and a tax on purchases was something they could collect quickly.
          Mississippi adopted one in 1930, and many states followed. Congress has debated a national sales tax over the
          years, most seriously around wartime, but it's never passed. That's why the system stayed at the state and
          local level, with all the variation that creates.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Deduct Sales Tax?</h2>
        <p style={pStyle}>
          Sometimes. On your federal return, you can deduct either your state and local income taxes or your state and
          local general sales taxes, but not both. Most people take the income tax deduction because it's usually bigger.
          The sales tax option makes more sense if you live in a state with no income tax, or if you made large purchases
          that year, such as a car, a boat, a major home renovation, or a lot of appliances.
        </p>
        <p style={pStyle}>
          You also have to itemize, which means filing Schedule A rather than taking the standard deduction. Most people
          take the standard deduction, so this applies to a relatively small share of filers. There's also a cap on the
          total amount of state and local taxes you can deduct, and Congress changed that cap in 2025, so check the
          current limit before you plan around it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To claim the sales tax route, you can either add up actual receipts or use the IRS's sales tax deduction
          calculator, which estimates the amount from your income and location. With the calculator method, you can add
          the actual tax on certain large purchases, like a vehicle, on top of the estimate. If you go with receipts,
          keep them organized.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Sales Tax Hits Hardest</h2>
        <p style={pStyle}>
          Sales tax is regressive. It's a flat percentage of what you spend, and lower-income households spend a larger
          share of their income, so the tax takes a bigger bite out of their budget. That's a big reason many states cut
          or remove the tax on groceries and medicine.
        </p>
        <p style={pStyle}>
          It's also a major revenue source. Retail sales taxes make up about 24% of combined state and local tax
          collections. Some states depend on it far more than others, especially states without an income tax, like
          Texas, Florida, Tennessee, Washington, and Nevada.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Online shopping has shifted things, too. Before the 2018 Wayfair decision, states lost a lot of sales tax
          revenue on online purchases. These days, most big online retailers collect tax in most states, which closes a
          lot of that gap.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Sales Tax Calculation Mistakes</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Applying the rate to the total instead of the pre-tax price.</strong> Covered above. It understates
            the original price.
          </li>
          <li style={liStyle}>
            <strong>Typing the rate as a decimal.</strong> Entering 0.08 into a field that expects a percent gives you
            0.08%, so the tax looks almost nonexistent.
          </li>
          <li style={liStyle}>
            <strong>Using only the state rate.</strong> You'll come in lower than the register shows.
          </li>
          <li style={liStyle}>
            <strong>Taxing everything on a mixed receipt.</strong> Exempt items shouldn't be in the taxable amount.
          </li>
          <li style={liStyle}>
            <strong>Rounding too early.</strong> Round at the end, not at each step.
          </li>
          <li style={liStyle}>
            <strong>Forgetting the order of discounts and tax.</strong> Discounts that reduce the price generally come
            first, then tax.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Assuming one rate applies to your whole state.</strong> It doesn't, because local rates vary by city
            and county.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Sales Tax Calculator Accurate, Private, and Free?</h2>
        <p style={pStyle}>
          It's free. There's no charge, no paywall, and no account to create. The math is standard percentage
          arithmetic, the same formulas shown above, so you can check any result by hand.
        </p>
        <p style={pStyle}>
          The tool only needs numbers like prices and percentages. It doesn't ask for personal information, payment
          details, or documents.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One thing to keep in mind: the calculator uses whatever rate you give it. If you enter the wrong rate, you'll
          get an accurate answer to the wrong question. For taxes you'll actually file or remit, confirm the current
          combined rate with your state's revenue department. And this tool is for calculating, not for tax or legal
          advice. For filing, complex exemptions, or multi-state sales, talk to your state tax agency or an accountant.
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
