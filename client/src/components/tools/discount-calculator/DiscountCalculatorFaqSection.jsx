import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate a discount?",
    a: "Multiply the original price by the discount percentage divided by 100 to get the amount saved, then subtract that from the original price. For example, 15% off $120 saves you $18, so you pay $102.",
  },
  {
    q: "How do I calculate the discount percentage from two prices?",
    a: "Subtract the sale price from the original price, divide by the original price, and multiply by 100. If an item dropped from $150 to $112.50, you saved $37.50, which is 25%.",
  },
  {
    q: "How do I calculate 10% off?",
    a: "Move the decimal one place left to get 10% of the price, then subtract it. For $64, 10% is $6.40, so the price is $57.60.",
  },
  {
    q: "How do I take 20% off the price?",
    a: "Multiply the price by 0.80. A $50 item comes to $40, and you save $10.",
  },
  {
    q: "How do I calculate 30% off?",
    a: "Multiply by 0.70. A $90 item becomes $63, and you save $27.",
  },
  {
    q: "How do I find the original price after a discount?",
    a: "Divide the sale price by the share you paid. If you paid $80 after 20% off, divide by 0.80 to get $100. Don't add the percentage back onto the sale price.",
  },
  {
    q: "What are the main types of discounts?",
    a: "The common ones are percentage discounts, flat-amount discounts, stackable discounts, promotional discounts (coupons and seasonal sales), quantity discounts, trade discounts, and clearance markdowns.",
  },
  {
    q: "Can I calculate a flat discount, like $20 off?",
    a: "Yes. Choose the fixed-amount option, enter the original price and the amount off, and the calculator returns the final price and the equivalent percentage. The flat amount can't be larger than the price.",
  },
  {
    q: "How do I calculate two discounts in a row?",
    a: "Apply them one after the other. After 20% and then 15% off $150, you pay $102, a combined saving of 32%.",
  },
  {
    q: "Is the discount applied before or after tax?",
    a: "Usually before, so tax is charged on the lower price. Rules vary by location and by coupon type, so check local rules for big purchases.",
  },
  {
    q: "How does a \"buy one, get one free\" deal translate to a percentage?",
    a: "It works out to 50% off across the two items. \"Buy one, get one 50% off\" is 25% off overall, and \"buy 2, get 1 free\" is about 33% off.",
  },
  {
    q: "What are fake discounts?",
    a: "Fake discounts (fictitious pricing) are sales where the \"original\" price is inflated or was never really charged, so the sale looks bigger than it is. Checking price history and comparing across stores helps you catch them.",
  },
  {
    q: "Why do stores run clearance sales?",
    a: "They need space for new stock. Seasonal items lose value fast, so stores mark them down at the end of the season rather than store them.",
  },
  {
    q: "How do I calculate a discount percentage in Excel?",
    a: "If the original price is in A2 and the sale price is in B2, use =(A2-B2)/A2 and format the cell as a percentage.",
  },
  {
    q: "Is this discount calculator free?",
    a: "Yes, it's free to use with no hidden charges.",
  },
];

// Structured data uses the supplied schema wording, which differs slightly for a few questions.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I take 20% off the price?": { q: "How do I take 20% off a price?" },
  "Is the discount applied before or after tax?": {
    a: "Usually before, so tax is charged on the lower price. Rules vary by location and coupon type, so check local rules for big purchases.",
  },
  "How does a \"buy one, get one free\" deal translate to a percentage?": {
    q: "How does a buy one, get one free deal translate to a percentage?",
    a: "It works out to 50% off across the two items. Buy one, get one 50% off is 25% off overall, and buy 2, get 1 free is about 33% off.",
  },
  "What are fake discounts?": {
    a: "Fake discounts (fictitious pricing) are sales where the original price is inflated or was never really charged, so the sale looks bigger than it is. Checking price history and comparing across stores helps you catch them.",
  },
};
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ ...item, ...FAQ_SCHEMA_OVERRIDES[item.q] }));

const CHEAT_HEADERS = ["Discount", "$50 item", "$100 item", "$250 item"];
const CHEAT_ROWS = [
  ["10% off", "$45.00", "$90.00", "$225.00"],
  ["15% off", "$42.50", "$85.00", "$212.50"],
  ["20% off", "$40.00", "$80.00", "$200.00"],
  ["25% off", "$37.50", "$75.00", "$187.50"],
  ["30% off", "$35.00", "$70.00", "$175.00"],
  ["40% off", "$30.00", "$60.00", "$150.00"],
  ["50% off", "$25.00", "$50.00", "$125.00"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5,
  color: "var(--text-primary)", margin: "14px 0 8px",
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const olStyle = { ...listGapStyle, listStyleType: "decimal" };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
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

export default function DiscountCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Discount Calculator Figures Out</h2>
        <p style={pStyle}>Every deal has four numbers attached to it, and you usually only know two.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Original price:</strong> what the item costs before any reduction.</li>
          <li style={liStyle}><strong>Discount:</strong> either a percentage or a flat dollar amount.</li>
          <li style={liStyle}><strong>Amount saved:</strong> the gap between the original price and what you pay.</li>
          <li style={liStyle}><strong>Final price:</strong> what actually leaves your wallet.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Know the original price and the discount? You get the final price and your savings. Know the original and sale
          prices, like when a store only shows you the new number? You get the discount percentage. Know what you paid and
          how much was taken off? The calculator works backward to the original price. Because it handles all three
          directions, the same page works for shoppers, small sellers, and anyone checking homework.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Discount Calculator</h2>
        <p style={pStyle}>It takes less than a minute.</p>
        <ol style={olStyle}>
          <li style={liStyle}>Pick the deal type: percent off or fixed amount off.</li>
          <li style={liStyle}>Enter the two numbers you already have, like the original price and the discount.</li>
          <li style={liStyle}>Read the results. The other values show up right away, including your total savings.</li>
          <li style={liStyle}>
            Change a number to compare. Try 15%, 20%, and 25% on the same price and you&apos;ll see exactly what each step is
            worth in real dollars.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Type plain numbers, no currency symbols or commas. The calculator doesn&apos;t care what currency you&apos;re in, so
          dollars, euros, pounds, and rupees all work the same way. Keep in mind that a percentage can&apos;t go past 100%,
          and a flat discount can&apos;t be bigger than the price itself, since you can&apos;t pay less than zero.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Discounts (and What They Mean for Your Wallet)</h2>
        <p style={pStyle}>
          &quot;Discount&quot; is a loose word. Stores use it for a bunch of different things, and knowing which one you&apos;re
          looking at changes how you calculate it.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Percentage discount.</strong> A cut based on the price, like 10% off a $45 item. You&apos;d save $4.50 and
            pay $40.50. The bigger the price, the bigger the savings.
          </li>
          <li style={liStyle}>
            <strong>Flat (fixed-amount) discount.</strong> A set number comes off no matter what the price is. If a service
            costs $95 and you&apos;ve got a $20-off coupon, you pay $75. Same $20 whether the bill was $95 or $400.
          </li>
          <li style={liStyle}>
            <strong>Stackable discounts.</strong> Two or more reductions in a row, like 20% off, then another 15% off the
            already-reduced price. These don&apos;t simply add together (more on that below).
          </li>
          <li style={liStyle}>
            <strong>Promotional discounts.</strong> The ones consumers see most: seasonal sales, flash sales, coupon codes,
            &quot;buy one, get one&quot; offers. They exist to get you to buy now.
          </li>
          <li style={liStyle}>
            <strong>Quantity discounts.</strong> You get a lower price per unit when you buy more. Think case pricing, bulk
            memberships, or &quot;$4 each or 3 for $10.&quot;
          </li>
          <li style={liStyle}>
            <strong>Trade discounts.</strong> A supplier gives a lower price to a retailer or distributor, who then marks it up
            and sells it. These are everywhere in business-to-business buying, and they&apos;re why a retailer can run a 30%
            sale and still make money.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Clearance and markdowns.</strong> Permanent price drops used to move leftover stock, usually at the end of
            a season or when a new model arrives.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Discount Terms You&apos;ll Run Into</h2>
        <p style={pStyle}>A few terms get used interchangeably, so here&apos;s how they line up.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>List price (original price, regular price, MSRP):</strong> the price before any discount. Keep in mind that
            &quot;list price&quot; and &quot;MSRP&quot; are what the manufacturer suggests. A store&apos;s actual regular price can
            be different.
          </li>
          <li style={liStyle}><strong>Sale price (selling price, final price):</strong> what you pay after the reduction.</li>
          <li style={liStyle}><strong>Amount saved:</strong> list price minus sale price. Some stores label this &quot;You save.&quot;</li>
          <li style={liStyle}>
            <strong>Markdown:</strong> a store lowering its own price. Basically the same math as a discount, though it&apos;s
            usually permanent.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Flat discount vs. percentage discount:</strong> a flat discount is a fixed dollar amount. A percentage
            discount scales with the price.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Discount Formulas, With Real Examples</h2>
        <p style={pStyle}>
          You don&apos;t need to memorize these. It just helps to know what&apos;s happening so you can double-check any result.
          The discount formula is the same thing as a percentage decrease, because a discount is simply a price going down by
          some percent.
        </p>

        <h3 style={h3Style}>Finding the sale price</h3>
        <div style={formulaStyle}>Sale price = Original price − (Original price × Discount % ÷ 100)</div>
        <p style={pStyle}>A $120 jacket at 25% off: 120 × 0.25 = $30 saved, so you pay $90.</p>
        <p style={pStyle}>
          Shortcut: multiply by what you still pay. At 25% off, you pay 75% of the price, so $120 × 0.75 = $90. Same answer,
          one step.
        </p>

        <h3 style={h3Style}>Finding the discount percentage</h3>
        <div style={formulaStyle}>Discount % = (Original price − Sale price) ÷ Original price × 100</div>
        <p style={pStyle}>
          Say headphones were $119.99 and are now $64.50. The difference is $55.49. Divide by 119.99 and you get about
          0.4625, so the discount is roughly 46.2%.
        </p>
        <p style={pStyle}>
          This is the one to use when a store just shows you the new price and a vague &quot;huge savings&quot; banner.
        </p>

        <h3 style={h3Style}>Finding the original price</h3>
        <div style={formulaStyle}>Original price = Sale price ÷ (1 − Discount % ÷ 100)</div>
        <p style={pStyle}>
          You paid $40 after a 20% discount. You paid 80% of the original, so $40 ÷ 0.80 = $50. The original was $50 and you
          saved $10.
        </p>

        <h3 style={h3Style}>Quick check</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Run any answer both ways. If $100 at 30% off gives $70, then going from $100 to $70 should be a 30% drop. If the
          numbers don&apos;t agree, something&apos;s off.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Quick Mental Math for Common Percentages</h2>
        <p style={pStyle}>Sometimes you don&apos;t want to open anything. These tricks cover most of what you&apos;ll see in a store.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>10% off:</strong> move the decimal one place left. 10% of $64 is $6.40.</li>
          <li style={liStyle}><strong>20% off:</strong> find 10% and double it.</li>
          <li style={liStyle}><strong>15% off:</strong> find 10%, then add half of that. On $80, that&apos;s $8 + $4 = $12.</li>
          <li style={liStyle}><strong>25% off:</strong> divide by 4.</li>
          <li style={liStyle}><strong>30% off:</strong> find 10% and triple it.</li>
          <li style={liStyle}><strong>50% off:</strong> cut it in half.</li>
          <li style={liStyle}><strong>5% off:</strong> find 10% and halve it.</li>
        </ul>
        <p style={pStyle}>Here&apos;s a cheat sheet for what you&apos;d pay at common discount levels:</p>
        <DataTable headers={CHEAT_HEADERS} rows={CHEAT_ROWS} />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Percent Off vs. Fixed Amount Off: Which Deal Is Better?</h2>
        <p style={pStyle}>
          A percentage deal grows with the price. Thirty percent off a $20 item saves you $6, but 30% off a $500 item saves
          $150. A flat deal saves the same amount every time, so &quot;$25 off&quot; is great on a $60 item and kind of a shrug
          on a $900 one.
        </p>
        <p style={pStyle}>
          To compare them fairly, convert the flat deal into a percentage. Say one store offers $45 off a $240 jacket and
          another offers 15% off the same jacket. Forty-five divided by 240 is 18.75%, so the flat deal wins. Enter $240 and
          $45 off into the calculator and you&apos;ll see the equivalent percentage directly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There&apos;s also a break-even point. For a $60 item, $20 off is about 33%, so a &quot;25% off&quot; deal loses. For a
          $200 item, $20 off is only 10%, so the 25% deal wins easily. Flat deals tend to favor cheaper items. Percentage
          deals tend to favor expensive ones.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Find the Original Price After a Discount</h2>
        <p style={pStyle}>
          This is where people mess up most. Say you paid $63 for something that was 30% off, and you want to know what it
          originally cost. The natural move is to add 30% back: $63 × 1.30 = $81.90. That&apos;s wrong, because the 30% came
          off the original price, not off $63.
        </p>
        <p style={pStyle}>
          Here&apos;s the right way. If 30% was removed, you paid 70% of the original. Divide by 0.70: $63 ÷ 0.70 = $90. The
          original price was $90 and you saved $27.
        </p>
        <p style={pStyle}>Where this comes in handy:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Checking whether a &quot;was/now&quot; tag is honest</li>
          <li style={liStyle}>Figuring out a list price for a return or price-match request</li>
          <li style={liStyle}>Working out what something cost when you only kept the receipt</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>Going back through old spending</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Stacked Discounts: Why 20% + 15% Isn&apos;t 35%</h2>
        <p style={pStyle}>
          If a store takes 20% off and then lets you use a 15% coupon, the savings aren&apos;t 35%. The second discount applies
          to a price that&apos;s already lower.
        </p>
        <p style={pStyle}>
          Take a $150 item. After 20% off, it&apos;s $120. Then 15% off $120 takes $18 off, leaving $102. You saved $48 total,
          which is 32%, not 35%.
        </p>
        <p style={pStyle}>
          A fast way to get the combined number: multiply what you still pay at each step. Paying 80% and then 85% gives 0.80
          × 0.85 = 0.68, so you pay 68% and save 32%. With percentages only, the order doesn&apos;t matter. Take 15% first and
          then 20%, and you land on the same $102.
        </p>
        <p style={pStyle}>
          Order does matter when you mix percentage and flat discounts. Say you&apos;ve got a $200 item, a 20% sale, and a $30
          coupon:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Percent first, then coupon:</strong> $200 → $160 → $130</li>
          <li style={liStyle}><strong>Coupon first, then percent:</strong> $200 → $170 → $136</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The store decides the order, and it usually isn&apos;t in your favor, but it&apos;s worth knowing when you&apos;re
          deciding whether a coupon is worth using. In the calculator, run each step separately and feed the result into the
          next one.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BOGO and Multi-Buy Deals: What the Percentage Really Is</h2>
        <p style={pStyle}>
          Deals like &quot;buy one, get one free&quot; sound big, but they&apos;re easier to judge once you turn them into a
          discount percentage. The calculator is built for a single price, so work out the effective percentage by hand and
          use it to compare the offer against a straight percent-off deal.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Buy one, get one free (2 for 1):</strong> you pay for one of two items, so it&apos;s 50% off overall.</li>
          <li style={liStyle}>
            <strong>Buy one, get one 50% off:</strong> on two $40 items, you pay $40 + $20 = $60 instead of $80, which is 25%
            off overall.
          </li>
          <li style={liStyle}><strong>Buy 2, get 1 free (3 for 2):</strong> you pay for two of three, so that&apos;s about 33% off.</li>
          <li style={liStyle}>
            <strong>3 for $10 vs. $4 each:</strong> $10 for three is about $3.33 each, which is 16.7% off the $4 price. And it
            only works if you actually need three.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One catch: these deals are only a bargain if you were going to buy the extra item anyway. A 50% deal on something
          you didn&apos;t need is still money spent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Does the Discount Come Before or After Tax?</h2>
        <p style={pStyle}>
          In most places, sales tax gets calculated on the discounted price, so a discount shrinks your tax too. A $80 item at
          25% off comes to $60. With 8% sales tax, you pay $60 × 1.08 = $64.80.
        </p>
        <p style={pStyle}>Two things to watch for:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Tax-inclusive prices.</strong> In many countries with VAT, the sticker price already includes tax. A
            percentage discount on a tax-inclusive price reduces the total by that same percentage, so you can run the
            calculator on the sticker price directly.
          </li>
          <li style={liStyle}>
            <strong>Coupon types.</strong> In some places, manufacturer coupons are treated differently from store discounts,
            and tax may be charged on the pre-coupon price. Rules vary by state and country, so check your local rules if the
            amount is large.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Shipping, handling fees, and &quot;free shipping&quot; thresholds sit outside the discount. Compare what you&apos;d pay
          at checkout, not just the item price.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Spot a Fake Discount</h2>
        <p style={pStyle}>
          Fake discounts (the formal term is fictitious pricing) show up when a store inflates the &quot;original&quot; price so
          the sale looks better. Maybe the item was never actually sold at that price, or it sat at the sale price for months.
          The goal is to make you feel like you&apos;re getting a deal when the price is basically normal.
        </p>
        <p style={pStyle}>Some ways to check:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Look at the price history.</strong> Browser extensions and price-tracking sites keep records for many
            online products. If the &quot;regular&quot; price has been the same as the sale price for months, it&apos;s not really
            a sale.
          </li>
          <li style={liStyle}>
            <strong>Compare across stores.</strong> If three other retailers list the same item for about the same price as the
            &quot;sale&quot; price, that&apos;s the market price.
          </li>
          <li style={liStyle}>
            <strong>Be skeptical of &quot;up to.&quot;</strong> &quot;Up to 70% off&quot; usually applies to one or two items, not
            the whole store.
          </li>
          <li style={liStyle}>
            <strong>Run the numbers.</strong> Enter the claimed original price and the sale price into the calculator and see
            what discount you&apos;re really getting. If the banner says 60% off and the math says 40%, the original price
            isn&apos;t the real one.
          </li>
          <li style={liStyle}>
            <strong>Watch for odd list prices.</strong> Prices that are far above what any competitor charges are a red flag.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the US, the FTC&apos;s pricing guidelines say a &quot;former price&quot; should be a price the item was genuinely
          offered at for a reasonable stretch of time. Enforcement is uneven, though, so it&apos;s better to do your own
          checking.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Clearance Sales Happen (and When to Shop Them)</h2>
        <p style={pStyle}>
          Retailers don&apos;t discount things out of generosity. They&apos;re making room. Seasonal stock is the classic case:
          nobody buys a light summer shirt in January, and warehouse space costs money. So stores mark things down at the end
          of the season to clear shelves for the next batch.
        </p>
        <p style={pStyle}>Some patterns that tend to repeat:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Winter coats and boots:</strong> deepest cuts usually come in January and February.</li>
          <li style={liStyle}><strong>Summer clothing and patio furniture:</strong> late summer into early fall.</li>
          <li style={liStyle}>
            <strong>Electronics:</strong> prices often drop when a new model is announced, and again around big sale events.
          </li>
          <li style={liStyle}><strong>Cars:</strong> dealers often discount outgoing model-year vehicles when the new ones arrive.</li>
          <li style={liStyle}><strong>Mattresses:</strong> holiday weekends are common sale periods.</li>
          <li style={liStyle}><strong>Holiday decor:</strong> the day after the holiday, steep markdowns.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Timing matters as much as the percentage. A 25% deal in peak season can be worse than a 15% deal at the right time
          of year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>For Sellers: How Much Can You Afford to Discount?</h2>
        <p style={pStyle}>
          If you sell products, discounts affect your profit more than you&apos;d think, because the money comes straight out
          of your margin.
        </p>
        <p style={pStyle}>
          Say an item costs you $70 and sells for $100. That&apos;s a $30 profit (a 30% margin). If you offer 10% off, the price
          is $90 and your profit drops to $20, a third lower. You&apos;d now need to sell 50% more units to make the same total
          profit.
        </p>
        <p style={pStyle}>
          At 20% off, the price is $80 and your profit is just $10 per unit. You&apos;d have to sell three times as many to
          break even on profit. That&apos;s the formula: the extra sales you need ≈ discount ÷ (margin − discount). With a 30%
          margin, a 10% discount needs a 50% bump in volume, and a 20% discount needs 200%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Before you run a promotion, plug your original price and planned discount into the calculator, subtract your costs
          from the sale price, and see what&apos;s actually left.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You&apos;d Actually Use a Discount Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Shopping:</strong> checking whether &quot;40% off&quot; on a specific item is really a good deal.</li>
          <li style={liStyle}>
            <strong>Haggling:</strong> at flea markets, car lots, and with contractors, knowing the number you want helps.
            Asking for 10% off a $400 item is asking for $40, so you can name a price confidently.
          </li>
          <li style={liStyle}><strong>Coupons:</strong> working out what a 15% promo code does to your cart total before you check out.</li>
          <li style={liStyle}><strong>Selling:</strong> deciding on sale prices without wiping out your margin.</li>
          <li style={liStyle}><strong>Invoices and quotes:</strong> checking the percentage behind a volume discount so nothing slips by.</li>
          <li style={liStyle}>
            <strong>Classified listings:</strong> when a seller drops a price from $450 to $380, that&apos;s roughly 15.6% off,
            which gives you a basis for negotiating.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>School:</strong> percentage problems are a staple of math and business classes, and checking your work
            shows where a mistake crept in.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Discount Formulas in Excel and Google Sheets</h2>
        <p style={pStyle}>
          If you prefer a spreadsheet, these work the same in Excel and Google Sheets. Put the original price in A2.
        </p>
        <div style={formulaStyle}>
          Sale price from a percent discount (discount in B2, like 20%): =A2*(1-B2)
          <br />
          Amount saved (sale price in B2): =A2-B2
          <br />
          Discount percentage (sale price in B2): =(A2-B2)/A2, then format the cell as a percentage
          <br />
          Original price (sale price in A2, discount in B2): =A2/(1-B2)
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Format the result cells as percentages or currency so the numbers display correctly. A spreadsheet is great if
          you&apos;ve got a long list of items to check. For one-off checks, the calculator is faster.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes People Make</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Using the sale price as the base.</strong> The percentage always applies to the original price, especially
            when you&apos;re working backward.
          </li>
          <li style={liStyle}><strong>Adding stacked percentages.</strong> 20% plus 15% is 32% when stacked, not 35%.</li>
          <li style={liStyle}>
            <strong>Comparing &quot;50% off&quot; and &quot;$40 off&quot; without checking the price.</strong> On a $60 item, $40
            off is about 67%, which beats 50%.
          </li>
          <li style={liStyle}>
            <strong>Confusing discount with markup.</strong> Undoing a 25% discount means dividing by 0.75, not adding 25%. A
            markup is calculated on a different base.
          </li>
          <li style={liStyle}><strong>Forgetting tax and shipping.</strong> Compare the final checkout total.</li>
          <li style={liStyle}><strong>Falling for &quot;up to&quot; claims.</strong> Calculate the discount on the product you actually want.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Treating rounding differences as errors.</strong> Stores round each line item, so a cent or two off is
            normal.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator is free, with no hidden charges. The results come from the standard percentage formulas shown on
          this page, so you can check any answer by hand. It only needs the numbers you type in, and it doesn&apos;t ask for
          personal information to give you a result. For large purchases or contracts, confirm the final figure against the
          seller&apos;s invoice, since taxes, fees, and rounding rules differ between stores and regions.
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
