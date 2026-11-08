import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate profit margin?",
    a: "Subtract cost from revenue to get profit, divide profit by revenue, then multiply by 100. For $30 cost and $50 revenue, profit is $20 and margin is 40%.",
  },
  {
    q: "What's the difference between margin and markup?",
    a: "Margin is profit as a percentage of the selling price. Markup is profit as a percentage of cost. For the same sale, markup is always the bigger number, so a 40% margin equals a 66.67% markup.",
  },
  {
    q: "Is a 30% margin the same as a 30% markup?",
    a: "No. A 30% markup gives a 23.08% margin. To get a 30% margin, you need a 42.86% markup.",
  },
  {
    q: "How do I calculate a 20% profit margin?",
    a: "Take 0.20 away from 1 to get 0.80, then divide your cost by 0.80. A $40 cost means a $50 price.",
  },
  {
    q: "How do I calculate a 30% margin?",
    a: "Subtract 0.30 from 1 to get 0.70, then divide your cost by 0.70. A $40 cost means a $57.14 price.",
  },
  {
    q: "How do I calculate a 10% margin?",
    a: "Subtract 0.10 from 1 to get 0.90, then divide your cost by 0.90. A $40 cost means a $44.44 price.",
  },
  {
    q: "How do I calculate markup from margin?",
    a: "Turn the margin into a decimal, subtract it from 1, divide 1 by that result, then subtract 1. For a 30% margin: 1 ÷ 0.7 = 1.4286, minus 1 = 0.4286, so markup is 42.86%.",
  },
  {
    q: "What's the difference between gross and net profit margin?",
    a: "Gross margin only subtracts the direct cost of the goods you sold. Net margin subtracts all expenses, including rent, wages, marketing, interest and taxes.",
  },
  {
    q: "What is a good profit margin?",
    a: "It depends on your industry and on whether you mean gross or net. As a loose rule, a net margin around 10% is okay and 20% is strong, but compare yourself with similar businesses first.",
  },
  {
    q: "Are margin and profit the same thing?",
    a: "No. Profit is a dollar amount. Margin is that profit as a percentage of revenue, which makes it easier to compare businesses of different sizes.",
  },
  {
    q: "Can profit margin be negative?",
    a: "Yes. Sell below cost and both profit and margin go negative. The calculator will show it as a loss.",
  },
  {
    q: "How do I calculate margin in Excel?",
    a: "Put cost in one cell and revenue in another. Margin is =(revenue-cost)/revenue, formatted as a percentage.",
  },
  {
    q: "How do I calculate the amount required to buy stocks on margin?",
    a: "Multiply the number of shares by the price, then by the margin ratio. 200 shares at $40 with a 50% ratio needs $4,000.",
  },
  {
    q: "How do I calculate forex margin?",
    a: "Multiply units by the exchange rate, then by the margin ratio. 10,000 EUR at 1.10 with a 2% ratio needs $220.",
  },
  {
    q: "What does a 2% margin requirement mean in leverage?",
    a: "It's 50:1 leverage. You can control a $10,000 position with a $200 deposit.",
  },
  {
    q: "What is a margin call?",
    a: "It's a demand from your broker to add funds when your account equity falls below the maintenance requirement. If you don't, the broker can sell your positions to cover the loan.",
  },
  {
    q: "Is the margin calculator free?",
    a: "Yes. It's free to use online, with no charges and no account needed.",
  },
];

// Structured data uses the supplied schema wording, which rewords a few answers.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate markup from margin?":
    "Turn the margin into a decimal, subtract it from 1, divide 1 by that result, then subtract 1. For a 30% margin: 1 divided by 0.7 is 1.4286, minus 1 is 0.4286, so markup is 42.86%.",
  "Can profit margin be negative?":
    "Yes. If you sell below cost, both profit and margin go negative. The calculator will show it as a loss.",
  "How do I calculate margin in Excel?":
    "Put cost in one cell and revenue in another. Margin is (revenue minus cost) divided by revenue, formatted as a percentage.",
};
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  FAQ_SCHEMA_OVERRIDES[item.q] ? { ...item, a: FAQ_SCHEMA_OVERRIDES[item.q] } : item
);

const MARKUP_HEADERS = ["Margin", "Equivalent markup", "Price = cost ×"];
const MARKUP_ROWS = [
  ["10%", "11.11%", "1.111"],
  ["15%", "17.65%", "1.176"],
  ["20%", "25%", "1.25"],
  ["25%", "33.33%", "1.333"],
  ["30%", "42.86%", "1.429"],
  ["35%", "53.85%", "1.538"],
  ["40%", "66.67%", "1.667"],
  ["50%", "100%", "2.0"],
  ["60%", "150%", "2.5"],
  ["75%", "300%", "4.0"],
];

const LEVERAGE_HEADERS = ["Margin ratio", "Leverage"];
const LEVERAGE_ROWS = [
  ["5%", "20:1"],
  ["3.33%", "30:1"],
  ["2%", "50:1"],
  ["1%", "100:1"],
  ["0.5%", "200:1"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
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

export default function MarginCalculatorFaqSection() {
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
        <h2 style={h2Style}>What the Margin Calculator Does</h2>
        <p style={pStyle}>
          Say you paid $30 for something and you sell it for $50. Type in those two numbers and you&apos;ll see $20 in
          profit, a 40% margin and a 66.67% markup. Flip it around. Maybe you know your cost is $30 and you want a 40%
          margin. Enter those, and the tool tells you to charge $50. Or you know you can sell at $200 and need a 35% margin,
          so it shows the most you can pay for the item, which is $130.
        </p>
        <p style={pStyle}>
          That&apos;s the whole idea. Real pricing questions never start from the same place, so the calculator doesn&apos;t
          force you to. Buyers usually know the cost and want a margin. Sellers know the price and want to see what&apos;s
          left. A bookkeeper might only have revenue and profit from last month&apos;s report.
        </p>
        <p style={pStyle}>The calculator works with these four values:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Cost:</strong> what you paid to make or buy the item (COGS, or cost of goods sold)</li>
          <li style={liStyle}><strong>Revenue:</strong> what you sell it for</li>
          <li style={liStyle}><strong>Profit:</strong> revenue minus cost, in dollars</li>
          <li style={liStyle}><strong>Margin:</strong> profit as a percentage of revenue</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Margin is the health check for a business. A thin margin means one bad month, one supplier price hike or one
          surprise refund can wipe out your profit. A fat margin gives you room to mess up, run a sale or absorb a rough
          patch.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Profit Margin Step by Step</h2>
        <p style={pStyle}>You don&apos;t need a calculator for this, though it&apos;s nice to have one. Here&apos;s the manual way:</p>
        <ol style={olStyle}>
          <li style={liStyle}>Find your cost of goods sold. Let&apos;s say $30.</li>
          <li style={liStyle}>Find your revenue, the price you sell at. Say $50.</li>
          <li style={liStyle}>Subtract: $50 − $30 = $20. That&apos;s your gross profit.</li>
          <li style={liStyle}>Divide profit by revenue: $20 ÷ $50 = 0.4.</li>
          <li style={liStyle}>Multiply by 100 to get a percentage: 40%.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The important bit is step 4. You divide by revenue, the selling price, not by cost. That one detail is the entire
          difference between margin and markup, and it trips up more people than anything else in pricing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Margin Formulas</h2>
        <p style={pStyle}>
          All of these are the same relationship written in different ways, so use whichever fits what you know.
        </p>
        <div style={formulaStyle}>
          Profit = Revenue − Cost
          <br />
          Margin (%) = (Profit ÷ Revenue) × 100, or equivalently ((Revenue − Cost) ÷ Revenue) × 100
          <br />
          Markup (%) = (Profit ÷ Cost) × 100
          <br />
          Revenue = Profit ÷ Margin (with margin as a decimal), or Cost ÷ (1 − Margin)
          <br />
          Cost = Revenue − (Margin × Revenue), or Revenue × (1 − Margin)
          <br />
          Markup from margin = Margin ÷ (1 − Margin)
          <br />
          Margin from markup = Markup ÷ (1 + Markup)
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Margin and markup in those last two lines are decimals, so 40% is 0.40.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solving Margin From Any Two Values</h2>
        <p style={pStyle}>
          This is where most calculators get vague, so here&apos;s every combination worked out. Each one is just a
          rearrangement of the formulas above.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Profit and revenue.</strong> Margin = profit ÷ revenue. A $30 profit on $150 revenue is 30 ÷ 150 = 20%.</li>
          <li style={liStyle}>
            <strong>Profit and cost.</strong> Revenue isn&apos;t given, so add profit and cost first. With $25 profit and $100
            cost, revenue is $125 and margin is 25 ÷ 125 = 20%.
          </li>
          <li style={liStyle}><strong>Cost and revenue.</strong> The one most people use. With $80 cost and $100 revenue, profit is $20 and margin is 20%.</li>
          <li style={liStyle}>
            <strong>Cost and markup.</strong> Convert markup to margin with markup ÷ (1 + markup). A 50% markup gives 0.5 ÷
            1.5 = 33.33% margin, whatever the cost is.
          </li>
          <li style={liStyle}><strong>Revenue and markup.</strong> Same conversion. A 25% markup gives 0.25 ÷ 1.25 = 20% margin, whatever the revenue is.</li>
          <li style={liStyle}><strong>Profit and markup.</strong> Same again. A 43% markup gives 0.43 ÷ 1.43 = 30.07% margin.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Notice something odd about the last three? The actual dollar amounts don&apos;t matter. Margin and markup are tied
          together by a fixed relationship, so if you know one percentage you know the other. That&apos;s why the calculator
          can convert between them without asking you for a single dollar figure.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Margin vs Markup: They Aren&apos;t the Same</h2>
        <p style={pStyle}>
          Margin is profit divided by the selling price. Markup is profit divided by what it cost you. Same dollars,
          different yardstick. Because cost is smaller than the selling price on any profitable sale, markup is always the
          bigger percentage.
        </p>
        <p style={pStyle}>
          People mix these up constantly, and it&apos;s expensive. Here&apos;s how it goes. A shop owner wants a 30% margin, so
          she adds 30% to the cost. Her margin comes out at 23.08%. To really get 30%, she needed a 42.86% markup. On a
          business doing $500,000 in sales, that gap is about $34,000 a year.
        </p>
        <DataTable headers={MARKUP_HEADERS} rows={MARKUP_ROWS} />
        <p style={pStyle}>
          Margin can never hit 100%, because that would mean the item cost you nothing. Markup has no ceiling at all. A 100%
          markup just means you doubled the price, and that only equals a 50% margin.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So which one should you use? Retailers and wholesalers often quote markup because it&apos;s easier to apply:
          multiply cost by 1.5 and you&apos;re done. Accountants, investors and most financial reports use margin, because it
          shows how much of each sales dollar you keep. Honestly, it doesn&apos;t matter which you think about as long as you
          know which one someone else means. When a supplier says &quot;we work on 40,&quot; ask whether that&apos;s margin or
          markup. It&apos;s a very different price.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate a Specific Profit Margin (10%, 20%, 30%)</h2>
        <p style={pStyle}>
          These are some of the most searched questions around margins, and the method is the same each time. Take your
          target margin as a decimal, subtract it from 1, then divide your cost by that number.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>20% margin:</strong> 1 − 0.20 = 0.80. A $40 item should sell at 40 ÷ 0.80 = $50.</li>
          <li style={liStyle}><strong>30% margin:</strong> 1 − 0.30 = 0.70. A $40 item should sell at 40 ÷ 0.70 = $57.14.</li>
          <li style={liStyle}><strong>10% margin:</strong> 1 − 0.10 = 0.90. A $40 item should sell at 40 ÷ 0.90 = $44.44.</li>
        </ul>
        <p style={pStyle}>
          Don&apos;t be tempted to just multiply cost by 1.2 for a 20% margin. That gives $48, which is a 16.67% margin.
          You&apos;d lose over three points without noticing. The &quot;divide by one minus margin&quot; trick is the one to
          remember.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And if you want to go from margin to markup by hand: turn the margin into a decimal, subtract it from 1, divide 1
          by that, then subtract 1. For a 30% margin that&apos;s 1 ÷ 0.7 = 1.4286, minus 1 = 0.4286, or 42.86% markup.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Gross Margin vs Net Margin</h2>
        <p style={pStyle}>
          You&apos;ll see &quot;margin,&quot; &quot;profit margin,&quot; &quot;gross margin&quot; and &quot;gross profit
          margin&quot; used almost interchangeably online. They aren&apos;t strictly identical, and it helps to know where the
          lines sit.
        </p>
        <p style={pStyle}>
          Gross margin only subtracts the direct cost of what you sold (materials, manufacturing, or what you paid your
          supplier). Net margin subtracts everything: rent, wages, software subscriptions, marketing, insurance, interest
          and taxes.
        </p>
        <p style={pStyle}>
          Here&apos;s an example with a small business. Revenue is $200,000 and COGS is $120,000, so gross profit is $80,000
          and gross margin is 40%. But the business also paid $60,000 in rent, wages and other running costs. That leaves
          $20,000, so net margin is just 10%. Same year, same books, two very different-looking numbers.
        </p>
        <p style={pStyle}>
          This calculator works with whatever you call &quot;cost.&quot; Put in only COGS and you get gross margin. Put in COGS
          plus shipping, packaging and payment fees and you get something closer to a real margin. Put in every expense and
          you&apos;ve got net margin. Garbage in, garbage out. The tool does the math right, but the number only means
          something if your cost figure covers what you intend it to cover.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Investors tend to care more about net margin, because it shows whether the business pays for itself after
          overhead. But gross margin is still the one you need for pricing, since you set prices before you know how the
          year&apos;s overhead will shake out.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Margin vs Profit</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These get swapped a lot, but they&apos;re different things. Profit is a dollar amount: you made $20. Margin is a
          percentage: you kept 40 cents of every dollar. Profit is great for day-to-day decisions and for comparing one month
          to the next. Margin is great for comparing things of different sizes. A shop with $5,000 profit on $20,000 in
          sales (25% margin) is doing better, relatively, than a big company with $50,000 profit on $1,000,000 in sales
          (5%), even though the dollar profit is ten times smaller.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Your Margin Changes When Costs Move</h2>
        <p style={pStyle}>
          Margin is sensitive to costs in a way people don&apos;t expect. Say your cost goes from $60 to $66 (a 10% jump) and
          your price stays at $100. Profit falls from $40 to $34, so margin drops from 40% to 34%. A 10% cost increase turned
          into a 15% drop in profit.
        </p>
        <p style={pStyle}>When that happens, you&apos;ve got a few options:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            Raise your price to restore the old margin. To keep 40% on a $66 cost, you&apos;d charge $110. The risk is that
            customers leave for a cheaper option.
          </li>
          <li style={liStyle}>
            Keep the price and accept a smaller margin, and try to sell more. That only works if the extra volume actually
            shows up.
          </li>
          <li style={liStyle}>Cut cost somewhere else: a better supplier price, cheaper packaging, less waste.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Run the options through the calculator first. It takes thirty seconds and shows you what each choice really costs.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Discounts and Fees: Where Margin Disappears</h2>
        <p style={pStyle}>Two things quietly eat margin: discounts and transaction fees. Both are easy to underestimate.</p>
        <p style={pStyle}>
          <strong>Discounts hit harder than they look.</strong> Take a $60 cost and a $100 price, a 40% margin. Offer 10%
          off. The price drops to $90, but cost stays $60, so profit falls from $40 to $30. That&apos;s a 25% cut in profit for
          a 10% price cut, and margin sinks to 33.3%.
        </p>
        <p style={pStyle}>
          How much extra do you have to sell to make up for it? There&apos;s a quick formula: required increase in units =
          discount ÷ (margin − discount), with both as decimals. For a 10% discount on a 40% margin, that&apos;s 0.10 ÷ 0.30 =
          33.3%. You&apos;d need a third more customers just to break even on profit. Make that discount 20% and the number
          jumps to 100%, so you&apos;d have to double your sales. That&apos;s worth knowing before you slap &quot;20% OFF&quot; on
          the window.
        </p>
        <p style={pStyle}>
          <strong>Fees count as cost.</strong> Say you sell an item that costs you $25 and you want a 30% margin, and you take
          card payments at 2.9% plus $0.30 a sale. If you ignore the fee and price at 25 ÷ 0.70, you get $35.71, but the fee
          is $1.34 of that, so your real margin is only about 26%. To actually hit 30%, you need to solve for price with the
          fee built in: (25 + 0.30) ÷ (1 − 0.30 − 0.029) = $37.71. That&apos;s a price you can check in the calculator.
        </p>
        <p style={pStyle}>
          The same goes for marketplace commissions, shipping you absorb, returns, and packaging. If you sell on a platform
          that takes 15%, treat that as part of the cost side or your numbers are fantasy.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more small thing. Use revenue before sales tax. Tax isn&apos;t your money; you just collect it, so including it
          inflates your margin.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Margin in Excel or Google Sheets</h2>
        <p style={pStyle}>If you track a lot of products, a spreadsheet is handy. Put cost in A1 and revenue in B1, then:</p>
        <div style={formulaStyle}>
          Profit: =B1-A1
          <br />
          Margin: =(B1-A1)/B1
          <br />
          Markup: =(B1-A1)/A1
          <br />
          Price from a target margin (say it&apos;s in C1 as 0.30): =A1/(1-C1)
        </div>
        <p style={pStyle}>
          Format the margin and markup cells as Percentage (right-click, Format Cells, Number, Percentage) and pick how many
          decimals you want. Otherwise you&apos;ll see 0.4 instead of 40%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A spreadsheet is great for a whole catalog. For a quick one-off check, or when you&apos;re double-checking a formula
          you wrote, the calculator is faster and less likely to hide a typo in a cell reference.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Counts as a Good Profit Margin?</h2>
        <p style={pStyle}>
          There&apos;s no single answer, and anyone who gives you one number is oversimplifying. Still, you do need something
          to measure against. A common rule of thumb for net margin is that around 5% is weak, 10% is okay, and 20% is
          strong. But that&apos;s a generic yardstick, and plenty of perfectly healthy industries sit well below it.
        </p>
        <p style={pStyle}>
          Roughly speaking, and this varies by year and source, grocery stores and restaurants often run net margins in the
          low single digits. They make it work through volume. Software and digital products can post gross margins of 70%
          or higher, because copying a file costs almost nothing. Retail clothing often lands somewhere in the middle for
          gross margin.
        </p>
        <p style={pStyle}>
          The better approach is to compare yourself to businesses like yours, same industry, similar size. A corner
          restaurant and a Fortune 500 chemical company aren&apos;t playing the same game, so measuring one against the other
          tells you nothing. Also compare yourself to your own history. If your margin has been 28% for three years and
          suddenly it&apos;s 21%, something changed, and you want to know what.
        </p>
        <p style={pStyle}>
          The only hard rule: never run a negative margin on purpose for long. If you&apos;re below zero, you&apos;re losing
          money on every sale. Selling at a loss can be a deliberate move for a short time (to win customers or clear
          stock), but it&apos;s not a business model.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Can a margin be too high? Sort of. A very high margin isn&apos;t a problem on its own, but it can signal that
          you&apos;re overpriced, undercutting your own growth, or not reinvesting enough. If your margin is far above everyone
          in your industry, ask why customers aren&apos;t going to the competition. Sometimes the answer is that your product
          is better. Sometimes you just haven&apos;t been tested yet.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Margin Trading: Buying Stocks on Margin</h2>
        <p style={pStyle}>
          The other half of this tool uses the word &quot;margin&quot; in a totally different way. In investing, margin means
          borrowing money from your broker to buy more than you could with your own cash. The securities in your account
          act as collateral.
        </p>
        <p style={pStyle}>The formula is simple:</p>
        <div style={formulaStyle}>Amount required = Number of shares × Price per share × Margin ratio</div>
        <p style={pStyle}>
          For example, 200 shares at $40 is an $8,000 position. At a 50% margin ratio, you put up $4,000 and your broker lends
          the other $4,000.
        </p>
        <p style={pStyle}>
          In the US, Federal Reserve Regulation T lets you borrow up to 50% of a purchase, which is called the initial margin
          requirement. After that, you also have to meet a maintenance margin, which is the minimum equity you must keep in
          the account. The minimum is 25% of the market value of the securities, but most brokers ask for more, often 30% to
          40%, and some stocks carry stricter requirements. Not every stock can be bought on margin at all.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Margin amplifies everything. If the stock rises 20%, your gain on the money you actually put up is about 40%
          (before interest). If it drops 20%, your loss on your own money is about 40% too. And you pay interest on the loan
          the whole time you hold it, which the calculator doesn&apos;t include. Check your broker&apos;s rate, since it can make
          a long hold a lot more expensive than it looks.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Forex Margin: Buying Currency on Margin</h2>
        <p style={pStyle}>
          In currency trading, margin isn&apos;t a fee, and it isn&apos;t borrowed in the same way. It&apos;s a good-faith deposit
          your broker holds to keep your position open, a bit like a security deposit on an apartment. It&apos;s set aside
          from your account equity while the trade is live.
        </p>
        <p style={pStyle}>The calculator asks for four things:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Exchange rate:</strong> how much your home currency buys of the currency you&apos;re purchasing. If 1 EUR =
            1.22 USD and you&apos;re in the US, the rate is 1.22.
          </li>
          <li style={liStyle}><strong>Margin ratio:</strong> the share of the position you have to put up.</li>
          <li style={liStyle}><strong>Units:</strong> how much currency you&apos;re buying.</li>
          <li style={liStyle}><strong>Amount required:</strong> the result, in your home currency.</li>
        </ul>
        <div style={formulaStyle}>Amount required = Units × Exchange rate × Margin ratio</div>
        <p style={pStyle}>
          Example: you want to buy 10,000 EUR at 1.10 with a 2% margin ratio. The position is worth 10,000 × 1.10 =
          $11,000, and the deposit is 11,000 × 0.02 = $220.
        </p>
        <p style={pStyle}>Margin ratio and leverage are two ways of saying the same thing. Flip one to get the other:</p>
        <DataTable headers={LEVERAGE_HEADERS} rows={LEVERAGE_ROWS} />
        <p style={pStyle}>
          At 2% margin, $200 controls a $10,000 position. At 1%, $100 does. That sounds great until the market moves against
          you, because your losses are measured against the full position, not the deposit. A 1% move at 100:1 leverage can
          erase your entire deposit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Leverage limits depend on where you live. Retail traders in the US are capped at 50:1 on major currency pairs and
          20:1 on others. In the UK and EU, retail leverage on major pairs is capped at 30:1. Brokers also adjust margin
          requirements from time to time, especially when markets get choppy, so use your broker&apos;s current number rather
          than a rule of thumb.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Margin Call?</h2>
        <p style={pStyle}>
          A margin call is your broker telling you your account equity has fallen below the required minimum. You either add
          cash or securities, or they start closing positions.
        </p>
        <p style={pStyle}>
          Here&apos;s a walk-through. You buy $10,000 of stock with $5,000 of your own money and $5,000 borrowed. The
          maintenance requirement is 25%. Your equity is the stock&apos;s value minus the loan. A margin call kicks in when
          equity drops below 25% of the stock&apos;s value. That happens when the stock value falls to about $6,667, since
          (6,667 − 5,000) ÷ 6,667 = 25%. So a drop of just one-third in the stock triggers it. At a 30% maintenance level, the
          trigger is $7,143, a drop of about 28.6%.
        </p>
        <p style={pStyle}>
          The part people forget is that brokers can usually sell your positions without asking you first, and without
          waiting for you to deposit funds. They&apos;ll often do it at the worst possible time. The best defense is not
          borrowing the maximum, so you&apos;ve got room to ride out a dip.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          None of this is meant to scare you off, only to say that margin trading is risky, and the amount you need to put up
          is the start of the risk, not the end. This tool&apos;s trading numbers are estimates for planning, not financial
          advice.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You&apos;ll Actually Use a Margin Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Online sellers</strong> on Amazon, Etsy, eBay or Shopify check margins before listing, after fees and
            shipping, so a &quot;sale&quot; doesn&apos;t turn out to be a loss.
          </li>
          <li style={liStyle}>
            <strong>Restaurant and café owners</strong> price dishes from ingredient costs. A plate with $4.50 in food cost and
            a 70% target margin needs to sell for $15, which is probably a very different number than your gut said.
          </li>
          <li style={liStyle}>
            <strong>Freelancers and small agencies</strong> turn hourly costs and subcontractor fees into quotes that leave room
            for profit.
          </li>
          <li style={liStyle}>
            <strong>Wholesalers and distributors</strong> talk markup with some customers and margin with others, so they
            convert back and forth all day.
          </li>
          <li style={liStyle}><strong>Retail buyers</strong> compare supplier quotes and check what a shelf price will really earn.</li>
          <li style={liStyle}>
            <strong>Students and accounting trainees</strong> verify homework and see how the formulas behave when numbers
            change.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Traders and investors</strong> check how much cash a leveraged position will lock up before they commit.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Cost and Privacy</h2>
        <p style={pStyle}>
          The calculator uses the standard formulas shown on this page, so the math is exact. Results are rounded for
          readability. The tool is free to use, there are no hidden charges, and you don&apos;t need an account to run a
          calculation. It only asks for business numbers, like cost, price, percentages, units and exchange rates, so
          there&apos;s no personal information involved.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Keep in mind that the results are only as accurate as the numbers you put in, and that trading outputs are
          estimates. Always confirm margin rules and rates with your own broker before you place a trade.
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
