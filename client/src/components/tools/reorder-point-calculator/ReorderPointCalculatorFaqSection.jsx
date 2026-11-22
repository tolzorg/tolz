import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a reorder point calculator?", a: "A reorder point calculator finds the stock level at which you should place a new order. It uses your basic stock, safety stock, lead time and unit sales so replenishment arrives before you run out." },
  { q: "How do you calculate the reorder point?", a: "Add your basic stock, safety stock and lead time in the same time unit, then multiply by your sales per day. For example, (5 + 8 + 3) days × 10 items per day = a reorder point of 160 items." },
  { q: "What is the reorder point formula with safety stock?", a: "The textbook formula is ROP = (Average Daily Usage × Lead Time) + Safety Stock. This calculator also adds a basic stock term, so ROP = Daily Sales × (Basic Stock Days + Safety Stock Days + Lead Time Days)." },
  { q: "How do I calculate safety stock?", a: "A simple method is (maximum daily usage × maximum lead time) − (average daily usage × average lead time). A statistical method uses Z × standard deviation of daily demand × √lead time, based on your target service level." },
  { q: "What is the difference between safety stock and reorder level?", a: "Safety stock is the protective buffer you hope not to use. The reorder level is the total stock level that triggers an order, and it includes safety stock." },
  { q: "What is the difference between reorder point, reorder quantity and minimum stock level?", a: "The reorder point tells you when to order. The reorder quantity tells you how many to order. The minimum stock level is the lowest amount you want to hold and is often equal to safety stock." },
  { q: "How are the reorder point, EOQ and lead time related?", a: "Lead time and demand set the reorder point, which tells you when to order. EOQ sets the order size. Longer lead times raise the reorder point but do not change EOQ." },
  { q: "Can this calculator solve for lead time or safety stock instead of the reorder point?", a: "Yes. If you know the reorder point and the other values, the calculator can solve for the one you are missing." },
  { q: "How do I handle backorders in a reorder point?", a: "Compare the reorder point with your inventory position: on-hand stock plus on-order stock, minus backorders. Reorder when that figure drops to the reorder point." },
  { q: "How often should I recalculate my reorder point?", a: "Review it whenever demand, lead time or supplier terms change. Quarterly works for steady products, while fast-moving or seasonal items may need monthly updates." },
  { q: "What happens if my reorder point is too low or too high?", a: "Too low, and you risk stockouts and lost sales. Too high, and you hold excess inventory, which raises storage costs and ties up cash." },
  { q: "Is this reorder point calculator free?", a: "Yes, it is free to use on Tolz." },
];

// The supplied FAQ schema matches the list above except for one answer.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate safety stock?": "A simple method is (maximum daily usage × maximum lead time) − (average daily usage × average lead time). A statistical method uses Z × standard deviation of daily demand × square root of lead time, based on your target service level.",
};

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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
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

export default function ReorderPointCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is a Reorder Point? Meaning, Purpose and Importance">
        <P>
          A reorder point (ROP), also called a reorder level, is the stock quantity that triggers a new purchase order. When the number of items
          on your shelf falls to that level, it is time to reorder, so the new shipment arrives before you run out.
        </P>
        <P>
          The purpose is simple: replace guesswork with a rule. Without a set reorder point, buying often runs on instinct, such as “we seem low
          on this one.” That works for a few products but breaks down across dozens or hundreds of SKUs. A calculated reorder point gives everyone
          on the team the same trigger.
        </P>
        <P>The importance comes down to two risks:</P>
        <List items={[
          ["Ordering too late", "leads to stockouts, missed sales and unhappy customers. Some buyers will wait, and others will go to a competitor."],
          ["Ordering too early or too much", "ties up cash and uses storage space. For perishable goods such as food, it can also mean spoilage and direct financial loss."],
        ]} />
        <P>
          Some businesses try to save money by ordering less than they need. That usually backfires, because the savings are smaller than the
          sales lost when a popular item is unavailable. A good reorder point sits between the two extremes.
        </P>
      </Card>

      <Card title="How This Reorder Point Calculator Works">
        <P>The calculator uses four inputs. Each one lets you choose a time unit, so you do not have to convert anything by hand.</P>
        <List items={[
          ["Basic stock:", "the regular inventory you normally keep, expressed as how long it lasts. It is the standing supply that keeps sales running without interruption. You can enter it in hours, days, weeks, months or years."],
          ["Safety stock:", "the extra inventory you hold for emergencies, such as a demand spike or a late delivery. It uses the same time units as basic stock."],
          ["Lead time:", "the time between placing an order and receiving the goods. You can enter it in days, weeks, months or years. In some industries, especially with overseas suppliers or custom production, lead times run into weeks or months."],
          ["Unit sales:", "the average number of items you sell in a chosen period. You can pick per day, week, month, three months, half a year or a year, so you can use whichever figure your sales reports already show."],
        ]} />
        <P>
          Fill in the fields and click Calculate. The result shows the reorder point in items, along with a plain statement of when to reorder.
          Clear resets the form so you can test another product or scenario.
        </P>
      </Card>

      <Card title="The Reorder Point Formula Explained">
        <P>
          Because basic stock, safety stock and lead time are all measured in time, the calculator first adds them together and then converts that
          total into items using your sales rate:
        </P>
        <Formula>Reorder Point = Unit Sales per Day × (Basic Stock Days + Safety Stock Days + Lead Time Days)</Formula>
        <P>
          Working example: A shop sells 10 items per day. Its basic stock covers 5 days, its safety stock covers 8 days, and its supplier delivers
          in 3 days.
        </P>
        <List items={[
          ["Total days to cover:", "5 + 8 + 3 = 16 days"],
          ["Reorder point:", "16 × 10 = 160 items"],
        ]} />
        <P>
          You should place a new order when you have 160 items left. Of those, 30 items cover sales during the 3-day delivery, 80 items form the
          safety buffer, and 50 items represent your regular stock.
        </P>
        <P>
          You may have seen the textbook version of the formula, which is average daily usage multiplied by lead time, plus safety stock. It is the
          same idea without a separate basic stock term. The calculator on this page includes basic stock because many businesses want their
          trigger to account for the regular inventory they plan to keep on hand, not just the bare minimum needed to survive the wait.
        </P>
        <P>
          Mixed units are not a problem. If your sales are 70 items per week, basic stock is 1 week, safety stock is 1 week and lead time is 2
          weeks, the reorder point is 70 × 4 = 280 items.
        </P>
      </Card>

      <Card title="How Is the Reorder Point Determined? Key Factors">
        <P>Four factors drive the number, and a reorder point is only as reliable as the data behind each one:</P>
        <List items={[
          ["Demand.", "Your average sales rate is the biggest driver. Use recent data, ideally the last 30 to 90 days, and adjust for seasonality or promotions."],
          ["Lead time.", "Count the full wait: order processing, production, shipping, customs and receiving. Use real averages from past orders, not the date the supplier promised."],
          ["Variability.", "Steady sellers need little protection. Erratic sellers or unreliable suppliers need a larger safety buffer."],
          ["Cost of a stockout versus the cost of holding stock.", "A best-selling item with high margins deserves a deeper buffer. A slow, low-margin item can run leaner."],
        ]} />
        <P>Other things can affect the final number, including supplier minimum order quantities, shelf life, available storage space and your cash position.</P>
      </Card>

      <Card title="How to Calculate Safety Stock and Reorder Point">
        <P>
          Safety stock is the most debated input, and there is no single correct figure. Two common methods exist. Since this calculator takes
          safety stock in time units, divide your result in items by your daily sales to convert it to days.
        </P>
        <Lead lead="The maximum-minus-average method.">This is the simplest approach and suits small businesses:</Lead>
        <Formula>Safety Stock = (Maximum Daily Usage × Maximum Lead Time) − (Average Daily Usage × Average Lead Time)</Formula>
        <P>
          If your best sales day reaches 55 units, your slowest delivery took 10 days, and your averages are 40 units per day and 7 days, then
          550 − 280 = 270 units of safety stock. At 40 units per day, that equals about 6.75 days. This method plans for the worst case, so it can
          be expensive for slow-moving items.
        </P>
        <Lead lead="The statistical method.">Use this when you have sales history and want to tie safety stock to a target service level:</Lead>
        <Formula>Safety Stock = Z × σ (daily demand) × √(Lead Time)</Formula>
        <P>
          Z is the service level factor: about 1.28 for 90%, 1.65 for 95% and 2.33 for 99%. The symbol σ is the standard deviation of daily
          demand. With a standard deviation of 8 units, a 7-day lead time and a 95% target, safety stock is about 1.65 × 8 × 2.65 ≈ 35 units,
          which is under one day of sales at 40 per day.
        </P>
        <P>
          The gap between 270 and 35 units shows why the method matters. The first covers a worst case, and the second covers a chosen
          probability of avoiding stockouts. Pick the one that matches the cost of running out of that product, then enter the result in days.
        </P>
      </Card>

      <Card title="How Safety Stock and Reorder Point Are Connected">
        <P>
          Safety stock is one of the layers inside the reorder point. The reorder point is the total trigger level. Safety stock is the cushion at
          the bottom of it.
        </P>
        <P>
          Think of the reorder point as the sum of what you expect to need plus the buffer for what you cannot predict. If you raise safety stock,
          the reorder point rises by the same amount. If a supplier becomes less reliable, increasing safety stock is the usual response, and the
          reorder point moves with it.
        </P>
      </Card>

      <Card title="Safety Stock vs. Reorder Level: What Is the Difference?">
        <P>The two terms are often mixed up, but they describe different things.</P>
        <List items={[
          ["Safety stock", "is a protective quantity you aim never to touch. It is only used when demand runs higher than expected or deliveries run late."],
          ["Reorder level (reorder point)", "is the signal to order. It includes the safety stock plus the demand expected during the wait for delivery."],
        ]} />
        <P>
          In the earlier example, the reorder level is 160 items, and 80 of those items are safety stock. If everything goes as planned, the new
          shipment arrives while you still hold your safety stock. If it does not, that buffer keeps you selling.
        </P>
      </Card>

      <Card title="Reorder Point vs. Reorder Quantity vs. Minimum Stock Level">
        <P>These three terms answer different questions:</P>
        <List items={[
          ["Reorder point", "answers when to order."],
          ["Reorder quantity", "answers how much to order."],
          ["Minimum stock level", "is the lowest quantity you are willing to hold. It is often set equal to safety stock, and it works as a floor rather than a trigger."],
        ]} />
        <P>
          Some businesses also use a min/max system, where the minimum acts as the reorder trigger and the maximum caps how high stock should rise
          after a delivery. A calculated reorder point makes a stronger minimum than a rough estimate.
        </P>
      </Card>

      <Card title="How the Reorder Point, EOQ and Lead Time Work Together">
        <P>These three ideas control how inventory moves through a business:</P>
        <List items={[
          ["Lead time", "sets how early you must order."],
          ["Reorder point", "turns that timing into a stock level."],
          ["Economic Order Quantity (EOQ)", "decides how many units to buy once the trigger is hit. It balances the cost of placing orders against the cost of holding inventory."],
        ]} />
        <P>
          A longer lead time raises the reorder point, because you need more stock to cover the wait. EOQ does not change with lead time, but it
          determines how often you reorder. Together they answer both questions every buyer faces: when to order, and how much. This calculator
          handles the first one.
        </P>
      </Card>

      <Card title="Solving for Basic Stock, Safety Stock, Lead Time, or Daily Unit Sales">
        <P>
          Sometimes the reorder point (R) is already established by an ERP system, supplier agreement, or previous business decision. In such
          cases, you may want to work backwards to understand what the existing reorder point assumes.
        </P>
        <P>The reorder point formula can be rearranged to calculate any missing variable.</P>
        <P>Let:</P>
        <List items={[
          ["R", "= Reorder point (units)"],
          ["S", "= Average daily sales (units per day)"],
          ["Basic Stock", "= Number of days of regular stock coverage"],
          ["Safety Stock", "= Additional days of stock kept as a buffer"],
          ["Lead Time", "= Number of days required for replenishment"],
        ]} />
        <P>First, divide the reorder point by daily sales to determine the total days of stock coverage.</P>

        <H3>1. Calculate Safety Stock (Days)</H3>
        <P>If you know the reorder point, daily sales, basic stock, and lead time, you can calculate how many days of safety stock are included.</P>
        <Formula>Safety Stock = R ÷ S − Basic Stock − Lead Time</Formula>
        <P>Example: reorder point = 160 units, daily sales = 10 units, basic stock = 5 days, lead time = 3 days.</P>
        <Formula>160 ÷ 10 − 5 − 3 = 8 days</Formula>
        <P>The existing reorder point includes 8 days of safety stock.</P>

        <H3>2. Calculate Lead Time (Days)</H3>
        <P>If you know the reorder point, daily sales, basic stock, and safety stock, you can determine the lead time assumed by the current reorder point.</P>
        <Formula>Lead Time = R ÷ S − Basic Stock − Safety Stock</Formula>
        <P>Example:</P>
        <Formula>160 ÷ 10 − 5 − 8 = 3 days</Formula>
        <P>This means the reorder point is designed to cover a 3-day replenishment lead time.</P>

        <H3>3. Calculate Basic Stock (Days)</H3>
        <P>If you know the reorder point, daily sales, safety stock, and lead time, you can calculate the basic stock coverage.</P>
        <Formula>Basic Stock = R ÷ S − Safety Stock − Lead Time</Formula>
        <P>Example:</P>
        <Formula>160 ÷ 10 − 8 − 3 = 5 days</Formula>
        <P>The current reorder point therefore includes 5 days of basic stock.</P>

        <H3>4. Calculate Daily Unit Sales</H3>
        <P>
          If the reorder point, basic stock, safety stock, and lead time are known, you can work backwards to determine the daily sales rate used to
          establish the reorder point.
        </P>
        <Formula>S = R ÷ (Basic Stock + Safety Stock + Lead Time)</Formula>
        <P>Example:</P>
        <Formula>160 ÷ (5 + 8 + 3) = 10</Formula>
        <P>The reorder point was calculated using an assumed sales rate of 10 units per day.</P>

        <H3>Why Is This Useful?</H3>
        <P>
          These calculations are particularly useful when auditing existing inventory settings. They help you identify the assumptions behind a
          reorder point and determine whether those assumptions are still realistic.
        </P>
        <P>For example, suppose the reorder point is still 160 units, but actual daily sales have increased from 10 to 14 units.</P>
        <P>The same 160 units now provide:</P>
        <Formula>160 ÷ 14 = 11.43 days</Formula>
        <P>Instead of the original 16 days of coverage, the inventory now provides only 11.43 days.</P>
        <P>
          This means the original safety buffer is no longer as large as it appears. Unless the reorder point is updated to reflect the higher
          sales rate, the business may face a greater risk of running out of stock before the next replenishment arrives.
        </P>
      </Card>

      <Card title="When You Need a Reorder Point Calculator">
        <Lead lead="Online sellers (Amazon FBA, Shopify, Etsy).">
          Marketplaces punish stockouts with lost ranking and sales momentum. Sellers who import from overseas, where lead times can run 30 to 60
          days, need a trigger well in advance.
        </Lead>
        <Lead lead="Retail shops.">
          Shelf space is limited and cash is tight. A calculated reorder point keeps fast sellers available without filling the back room.
        </Lead>
        <Lead lead="Restaurants and food businesses.">
          Perishables make over-ordering costly, but missing a key ingredient stops service. Short lead times and daily usage make the
          calculation quick and frequent.
        </Lead>
        <Lead lead="Manufacturers.">A missing part can halt a production line. Reorder points keep raw material supply in step with the schedule.</Lead>
        <Lead lead="Warehouse and purchasing teams.">A consistent trigger across SKUs creates purchasing rules that are easy to audit.</Lead>
        <Lead lead="Seasonal planning.">Before a peak season, enter higher unit sales to see how much earlier you need to order.</Lead>
        <Lead lead="Supplier changes.">Switching to a cheaper but slower supplier lengthens lead time, and the reorder point must rise with it.</Lead>
        <Lead lead="Students and analysts.">
          Operations and supply chain courses use this concept constantly, and solving for different variables helps check homework.
        </Lead>
      </Card>

      <Card title="Reorder Point with Backorders and Fixed Lot Sizes">
        <P>The calculator does not have separate fields for backorders or lot sizes, but you can account for both when you apply the result.</P>
        <Lead lead="Backorders.">
          A backorder is a customer order you have accepted but cannot yet ship. Compare your reorder point with your inventory position, not just
          what is on the shelf:
        </Lead>
        <Formula>Inventory Position = On-Hand Stock + On-Order Stock − Backorders</Formula>
        <P>
          Suppose your reorder point is 160. You have 120 on hand, 100 already on order, and 30 backordered. Your position is 120 + 100 − 30 = 190.
          That is above 160, so you do not need to place another order yet. Without this check, it is easy to reorder twice.
        </P>
        <Lead lead="Fixed lot sizes.">
          If your supplier only sells in fixed lots, such as cases of 200, the lot size controls your order quantity, not your reorder point. The
          trigger stays the same. When it is hit, you order the number of lots that best fits your needs. Keep in mind that a large lot can push
          stock well above what you need, which is where EOQ and storage limits come in.
        </Lead>
      </Card>

      <Card title="Reorder Points for Perpetual Inventory Systems">
        <P>
          A perpetual inventory system updates stock counts after every sale and delivery, usually through point-of-sale or warehouse software.
          This is the best setup for reorder points, because the system can compare live stock with the trigger and alert you the moment it is
          reached.
        </P>
        <P>
          You calculate the reorder point once, enter it into your system for each SKU, and refresh it when demand or lead time changes. If you
          only count stock at set intervals, such as weekly, you do not see the drop in real time. In that case, add the review interval to your
          lead time input. A 3-day supplier lead time with a weekly count means your real wait before action can be up to 10 days.
        </P>
      </Card>

      <Card title="How to Manage Inventory Levels and Reorder Points">
        <P>Calculating the number is the first step. Keeping it useful takes a routine:</P>
        <List items={[
          ["Start with clean data.", "Pull unit sales from sales or point-of-sale records, not memory."],
          ["Segment your products.", "Give your top sellers the most attention, with tighter safety stock and more frequent reviews. Slow movers can use a simpler rule."],
          ["Track lead times.", "Record the order date and receipt date for every order. After a few cycles, you will have a realistic average and a worst case."],
          ["Review on a schedule.", "Recalculate at least quarterly for stable items and monthly for volatile or seasonal ones."],
          ["Test scenarios.", "Try a longer lead time or a demand surge and watch how the reorder point shifts. Knowing that a two-week delay requires a much bigger buffer helps you decide whether to negotiate with your supplier or add a second one."],
          ["Round up.", "A result of 312.4 items should be treated as 313."],
        ]} />
      </Card>

      <Card title="Common Mistakes That Skew Your Reorder Point">
        <List items={[
          ["Mixing units.", "The calculator handles unit conversion, but make sure each value is entered in the right unit. An entry of “2” in weeks is very different from “2” in days."],
          ["Using the supplier’s quoted lead time.", "Promised delivery is not real delivery. Use your actual average."],
          ["Relying on lifetime averages.", "Last year’s sales may not reflect today’s demand."],
          ["Ignoring variability.", "Two products with the same average sales can behave very differently. Erratic demand needs more safety stock."],
          ["Treating the result as permanent.", "Demand, suppliers and shipping conditions change."],
          ["Looking only at on-hand stock.", "Count items already on order and subtract backorders before deciding to reorder."],
        ]} />
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
