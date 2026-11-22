import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a CBM calculator?", a: "A CBM calculator converts the dimensions of a carton or shipment into cubic meters. It also helps estimate total volume, volumetric weight, and container capacity so you can plan freight costs." },
  { q: "What does CBM mean in shipping?", a: "CBM means cubic meter. It measures the volume your cargo occupies and is the standard unit used to price and plan sea freight, especially LCL shipments." },
  { q: "How is CBM calculated for shipping?", a: "Multiply length × width × height in meters. If your measurements are in centimeters, multiply them and divide by 1,000,000. Multiply the result by the number of cartons for the total CBM." },
  { q: "How do I calculate CBM from inches?", a: "Multiply length × width × height in inches to get cubic inches, then divide by 61,023.7. For example, 24 × 18 × 16 in = 6,912 cubic inches, or about 0.113 CBM." },
  { q: "How many cubic meters is a 40ft container?", a: "A 40ft standard container holds about 67 CBM, and a 40ft high cube holds about 76 CBM. A 20ft container holds about 33 CBM. Practical loading is usually 85–90% of those figures." },
  { q: "How do I convert CBM to kg?", a: "CBM measures volume, not weight, so there is no direct conversion. In LCL sea freight, 1 CBM is generally treated as 1,000 kg for billing. In air freight, volumetric weight is calculated from dimensions using a divisor of 6000, or 5000 for some couriers." },
  { q: "What is the difference between total weight and volumetric weight?", a: "Total weight is what your cargo weighs on a scale. Volumetric weight is calculated from the space it occupies. Carriers charge for whichever is higher." },
  { q: "Why do shipping companies charge by weight and not size?", a: "They usually charge by both. The carrier compares actual weight and volumetric weight (or CBM) and bills the higher one, so it is paid fairly for space and for weight." },
  { q: "How much does it cost to ship 10 CBM from China?", a: "It depends on the destination, season, and carrier. Ocean freight for LCL often runs from about $100 to $180 per CBM to the US, and all-in costs with local fees and surcharges can be much higher. Get quotes for both LCL and FCL, because 10 CBM is close to the point where a full container can make sense." },
  { q: "What is the standard LCL cost per CBM from China?", a: "There is no single standard rate. Published ocean-only rates range from roughly $50 to $200 per CBM depending on the destination and season, plus origin charges, destination charges, and surcharges. A current quote from a forwarder is the only reliable number." },
  { q: "Is it cheaper to ship LCL or FCL?", a: "It depends on volume and route. Many guides suggest comparing FCL once an LCL shipment reaches about 13–15 CBM, and sometimes earlier once handling fees are included." },
  { q: "Can I use the calculator for different carton sizes?", a: "Yes. Calculate each carton size separately and add the CBM totals for the full shipment." },
  { q: "Is this CBM calculator free, and do I need to sign up?", a: "It is free to use, and no account is needed to calculate." },
  { q: "Is the container capacity result exact?", a: "It is a planning estimate. Actual loading depends on carton shapes, pallets, stacking limits, and weight restrictions, so confirm with your forwarder before booking." },
];

// The supplied FAQ schema matches the list above except for one answer.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate CBM from inches?": "Multiply length × width × height in inches to get cubic inches, then divide by 61,023.7. For example, 24 × 18 × 16 in equals 6,912 cubic inches, or about 0.113 CBM.",
};

const CONTAINER_HEADERS = ["Container type", "Approx. internal dimensions (L × W × H)", "Approx. capacity", "Typical max payload"];
const CONTAINER_ROWS = [
  ["20ft standard", "5.90 × 2.35 × 2.39 m", "~33 CBM", "~28,000 kg"],
  ["40ft standard", "12.03 × 2.35 × 2.39 m", "~67 CBM", "~26,500 kg"],
  ["40ft high cube", "12.03 × 2.35 × 2.70 m", "~76 CBM", "~26,500 kg"],
  ["45ft high cube", "13.56 × 2.35 × 2.70 m", "~86 CBM", "~26,000 kg"],
];

const LCL_HEADERS = ["Destination", "Typical LCL ocean rate per CBM (indicative)", "Notes"];
const LCL_ROWS = [
  ["USA", "About 50–180", "West Coast is usually cheaper than East Coast"],
  ["UK, Germany, France, Italy", "About 100–200", "Rates vary by port and carrier"],
  ["Canada, Australia, New Zealand", "Varies widely", "Get a direct quote for your port pair"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
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
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 420 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
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

export default function CbmCalculatorFaqSection() {
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

      <Card title="What Is CBM in Shipping? Meaning, Usage, and Why It Matters">
        <P>
          CBM stands for cubic meter. It is the volume of a space that measures one meter long, one meter wide, and one meter high. In shipping,
          it is the standard way to describe how much room your cargo takes up. If you work in imperial units, 1 CBM equals about 35.31 cubic
          feet.
        </P>
        <P>
          Freight forwarders, shipping lines, suppliers, and customs brokers all use CBM. It shows up on packing lists, commercial invoices,
          booking confirmations, and freight quotes. Importers use it to plan how much cargo will fit in a container. Suppliers use it to quote
          shipping terms. Forwarders use it to price space on a vessel, truck, or aircraft.
        </P>
        <P>
          CBM matters because carriers sell space, and space is limited. A container can fill up completely while the cargo is still well under
          the weight limit. Light but bulky goods such as pillows, plastic furniture, or empty bottles are good examples. This is why sea freight,
          especially LCL (less than container load), is priced per CBM.
        </P>
        <P>
          If you know your CBM before you ask for a quote, you can compare forwarders fairly, catch estimates that look too high, and decide
          whether sharing a container (LCL) or booking a whole one (FCL) makes more sense.
        </P>
      </Card>

      <Card title="What Is the Usable Internal Volume (CBM) of a Shipping Container?">
        <P>
          Usable internal volume is the space inside the walls, floor and ceiling that your cargo can actually occupy. For a <Link to="/tools/container-loading-calculator" className="inline-home-link">20ft container</Link>, 5.90 ×
          2.35 × 2.39 gives about 33.1 CBM. A 10ft container comes to roughly 15.9 CBM by the same math, and a 40ft standard container to roughly
          67.6 CBM.
        </P>
        <P>
          Shipping lines publish rated capacities that are a little different.{" "}
          <Ext href="https://www.maersk.com/support/faqs/cargo-weight-limit">Maersk's cargo weight limit page</Ext> lists about 33.2 CBM for a
          20ft, 67.7 CBM for a 40ft, 76.4 CBM for a 40ft high cube and 86 CBM for a 45ft high cube. Use those rated figures when you compare
          freight quotes.
        </P>
      </Card>

      <Card title="How to Calculate CBM in Shipping: Formula and Examples">
        <P>The CBM formula is simple:</P>
        <Formula>CBM = Length × Width × Height (all in meters)</Formula>
        <P>
          All three measurements must use the same unit. If your numbers are in centimeters, multiply them together and divide by 1,000,000. If
          they are in inches, multiply them together and divide by 61,023.7.
        </P>
        <P>Once you have the CBM of one carton, finding the total takes one more step:</P>
        <Formula>Total CBM = CBM per carton × number of cartons</Formula>
        <Lead lead="Example 1: centimeters.">
          A carton measures 60 cm × 40 cm × 40 cm. That equals 96,000 cm³, or 0.096 CBM. If you ship 200 of these cartons, the total is 19.2 CBM.
        </Lead>
        <Lead lead="Example 2: inches.">
          A carton measures 24 in × 18 in × 16 in. That equals 6,912 cubic inches, or about 0.113 CBM per carton. Twenty-five cartons come to
          roughly 2.83 CBM.
        </Lead>
        <P>Always use the outer dimensions of the packed carton, including any padding or strapping. Do not use the size of the product inside.</P>
      </Card>

      <Card title="How to Use the CBM Calculator">
        <P>The calculator does the conversions and the math for you:</P>
        <List ordered items={[
          ["Enter the carton dimensions.", "Add the length, width, and height of one carton."],
          ["Select your unit.", "Choose centimeters, meters, inches, or feet to match your supplier’s packing list."],
          ["Add the number of cartons.", "This gives you the total volume of the shipment."],
          ["Enter the weight per carton (optional).", "This lets the tool show total weight and volumetric weight."],
          ["Choose a container type.", "The tool estimates how many cartons fit."],
        ]} />
        <P>
          If your shipment has cartons of different sizes, calculate each size separately and add the totals together. A calculator also protects
          you from small errors that add up, such as rounding too early or mixing units. It keeps full precision during the calculation and
          rounds only the final result, which matters when a quote is priced per cubic meter.
        </P>
      </Card>

      <Card title="Total Weight vs. Volumetric Weight">
        <P>When you enter the weight of one carton, the calculator shows two weight figures. They mean different things.</P>
        <Lead lead="Total weight">
          is what your cargo actually weighs. Multiply the weight of one carton by the number of cartons. This is the number a scale would show,
          including packaging.
        </Lead>
        <Lead lead="Volumetric weight,">
          also called <Link to="/tools/dimensional-weight-calculator" className="inline-home-link">dimensional weight</Link>, is a calculated number based on the space your cargo takes up. It exists because a carrier’s capacity
          is limited by both space and weight. Think about a flight with a very light but oversized bag. The airline cannot fill that space with
          other paying cargo, so it bills for the space instead.
        </Lead>
        <P>For air freight and express shipments, the formula is:</P>
        <Formula>Volumetric weight (kg) = (L × W × H in cm × number of cartons) ÷ 6000</Formula>
        <P>
          Some express couriers use 5000 as the divisor instead. This number is called the shipping factor, and it varies by carrier, so always
          confirm which one yours uses. A divisor of 5000 gives a higher volumetric weight, which means a higher bill for bulky goods. If your
          carrier uses a different factor than the one in the calculator, you can adjust the result by hand with the formula above.
        </P>
        <P>
          Example: A carton measuring 50 × 50 × 60 cm weighs 12 kg. Its volume is 150,000 cm³, so the volumetric weight is 25 kg at a divisor of
          6000. The carrier will bill for 25 kg, not 12 kg.
        </P>
        <P>
          For sea freight, the rule is different. LCL carriers typically use a “weight or measurement” (W/M) rule, where 1 CBM is treated as equal
          to 1,000 kg. Whichever number is larger, the volume in CBM or the weight in metric tons, becomes the billing unit. A shipment of 2 CBM
          that weighs 2,500 kg is billed as 2.5 freight units, not 2.
        </P>
      </Card>

      <Card title="Do Shipping Companies Charge by Weight or by Size?">
        <P>
          This is a common question, and the short answer is: both. Carriers compare the two figures and bill whichever is higher. That higher
          figure is called the chargeable weight.
        </P>
        <P>
          The logic is easy to follow. A carrier has two limits to manage, the space available and the weight a vehicle can safely carry. If it
          was billed only by weight, bulky, lightweight cargo would take up valuable space for almost no revenue. If it was billed only by size, a
          {" "}<Link to="/tools/pallet-calculator" className="inline-home-link">pallet</Link> of dense steel parts would cost the same as a pallet of foam. Charging for the greater of the two keeps pricing fair on both
          ends.
        </P>
        <P>
          In practice, this means low-density goods such as clothing, bedding, or plastic items are usually billed on volume. Dense goods such as
          tiles, metal parts, or canned food are usually billed on weight. Express carriers like FedEx and UPS use dimensional weight pricing in
          the same way, though exact rates depend on the carrier, origin, and destination.
        </P>
        <P>
          Knowing which side your cargo falls on tells you what to change to save money. If volume drives your cost, better packing can help. If
          weight drives your cost, packing smaller will not change your bill.
        </P>
      </Card>

      <Card title="How Many Cubic Meters Is a 40ft Container? Common Container Sizes">
        <P>Container capacity is one of the most searched questions in shipping. A 40ft standard container holds about 67 cubic meters. Here are the common sizes:</P>
        <DataTable headers={CONTAINER_HEADERS} rows={CONTAINER_ROWS} />
        <P>
          These figures are rounded. Internal dimensions and payload limits vary slightly by manufacturer and shipping line, so treat the table as
          a planning guide. Your forwarder can confirm exact numbers for the container you book.
        </P>
      </Card>

      <Card title="CBM Calculations for Container Loading (Import and Export)">
        <P>Both importers and exporters use CBM to decide how much cargo goes into a container and which container to book.</P>
        <P>
          The stated capacity is a theoretical maximum. In real loading, usable space is usually about 85–90% of the stated volume. Cartons do not
          always tile perfectly, pallets add height and footprint, and a safe load needs clearance near the doors and roof.
        </P>
        <P>
          For the 0.096 CBM carton from earlier, a 20ft container offers about 345 cartons in theory, but plans for roughly 300 in practice. In a
          40ft standard container, the theoretical count is about 700, and a realistic plan is around 600.
        </P>
        <P>
          Weight is the second limit. A 20ft container often has a maximum payload of around 28,000 kg. Dense products can hit that limit long
          before the container is full. Always check total weight and total CBM together.
        </P>
        <P>
          For importers, the calculation shows whether an order fits one container, whether you need two, and whether LCL is smarter. It also
          helps you check the supplier’s figures before you pay a deposit. For exporters, it helps you quote buyers accurately, book the right
          space, and see whether a slightly different carton size would let you fit more units in each load.
        </P>
        <P>The tool’s container estimate gives you a quick planning number. Confirm the final loading plan with your forwarder or warehouse before booking.</P>
      </Card>

      <Card title="How to Calculate the Cost of Shipping 10 CBM from China">
        <P>
          Shipping cost per CBM is among the most searched questions in the freight world, and it is hard to give one number. Rates change with
          fuel prices, demand, the season, the carrier, and the port. Treat any figure you read, including the ones here, as a working range and
          get a current quote before you commit.
        </P>
        <P>A practical way to estimate the cost of a 10 CBM shipment is to work through the charges one by one:</P>
        <List items={[
          ["Ocean freight:", "the per-CBM rate multiplied by your CBM (or by your weight in metric tons if the cargo is dense)."],
          ["Surcharges:", "bunker or fuel adjustment (BAF) and currency adjustment (CAF) fees, and in busy months, a peak season surcharge."],
          ["Origin charges:", "warehouse handling, export customs clearance, and local trucking in China."],
          ["Destination charges:", "unloading, warehouse fees, import customs clearance, and delivery to your address."],
          ["Duties and taxes:", "these depend on your product and your country."],
        ]} />
        <P>Add everything up and divide by your actual CBM. That is your true cost per CBM, and it is almost always higher than the headline ocean rate.</P>
        <P>
          As a rough example, published 2026 ocean-only rates from China to the US range from about $50 to $180 per CBM depending on the source,
          coast, and season. At $100 to $180 per CBM, 10 CBM would cost roughly $1,000 to $1,800 for ocean freight alone. Once port, handling, and
          customs charges are added, all-in costs for LCL often land between $150 and $380 per CBM, according to one 2026 industry guide, which
          would put 10 CBM at around $1,500 to $3,800.
        </P>
        <P>
          Ten CBM is also close to the point where a full container becomes worth pricing. Many guides, including{" "}
          <Ext href="https://www.exfreight.com/shipping-from-china-to-usa-a-complete-guide-by-exfreight/">ExFreight’s China to USA overview</Ext>,
          suggest comparing FCL once cargo reaches around 13 to 15 CBM. Because LCL carries extra handling fees, the real break-even point can be
          lower, sometimes closer to 10 to 12 CBM. Ask for both quotes.
        </P>
      </Card>

      <Card title="What Is the Standard LCL Shipping Cost per CBM from China?">
        <P>There is no single standard rate, but you can use these indicative ranges for ocean freight alone, before local charges:</P>
        <DataTable headers={LCL_HEADERS} rows={LCL_ROWS} />
        <P>
          These ranges are broad because published figures differ from source to source. Most carriers also apply a minimum charge, often 1 CBM
          or a flat fee, so very small shipments cost more per CBM than larger ones. The last quarter of the year usually brings peak season
          surcharges, and the weeks around Lunar New Year can tighten space and raise prices. For a current look at costs and ways to save,{" "}
          <Ext href="https://www.epicsourcing.co/post/sea-freight-from-china-to-usa-costs-transit-times-2026">Epic Sourcing’s sea freight guide</Ext>{" "}
          breaks down typical ranges and timing. For quotes into 2027, treat today’s rates as a starting point only, because they can move in
          either direction before you ship.
        </P>
      </Card>

      <Card title="Tips for Lowering Shipping Costs When Importing from China">
        <P>Once you know your CBM and weight, you can act on them:</P>
        <List items={[
          ["Right-size your cartons.", "Cutting 2–3 cm of empty space per side can noticeably lower total CBM on a large order."],
          ["Ask the factory for exact carton dimensions and weights before production.", "Changing packaging after the order is made costs far more than fixing it early."],
          ["Compare LCL and FCL once you pass about 10 CBM.", "A full container often costs about the same as LCL and involves less handling."],
          ["Consolidate suppliers.", "If you buy from several factories in the same region, a forwarder can combine the orders into one shipment."],
          ["Avoid peak periods.", "Booking outside the busiest months can avoid surcharges and tight space."],
          ["Get all-in quotes from more than one forwarder.", "A cheap ocean rate can hide high local fees. Ask for the total cost to your door."],
          ["Understand your trade terms.", "Terms such as EXW, FOB, and DDP change who pays for what. Make sure you know which charges are in your quote."],
          ["Standardize carton sizes.", "Uniform cartons stack and load more efficiently."],
          ["Know your density.", "If your goods are billed on volume, packing smaller helps. If they are billed on weight, it will not."],
        ]} />
      </Card>

      <Card title="Common CBM Calculation Mistakes to Avoid">
        <P>Small measurement errors add up quickly across hundreds of cartons. Watch for these:</P>
        <List items={[
          ["Measuring the product instead of the packed carton.", "Freight is calculated on outer dimensions."],
          ["Mixing units.", "Entering length in centimeters and height in inches gives a wrong result. Keep one unit for all three, or use the unit selector."],
          ["Rounding too early.", "Rounding 0.0963 CBM up to 0.1 across 500 cartons adds about 1.85 CBM, which can change your billing tier."],
          ["Ignoring pallets.", "If cargo ships on pallets, calculate the palletized dimensions, including pallet height."],
          ["Treating different carton sizes as one.", "Calculate each size on its own and then add the results."],
          ["Assuming 100% container utilization.", "Always leave room for imperfect stacking."],
          ["Comparing only the ocean rate.", "Local charges, surcharges, and duties can change which option is cheapest."],
        ]} />
      </Card>

      <Card title="When Would You Need a CBM Calculator?">
        <P>CBM comes up in more situations than most people expect:</P>
        <List items={[
          ["Importing from suppliers.", "Supplier quotes list carton sizes and quantities. Calculating CBM yourself lets you estimate freight before you place an order and confirm that the supplier’s figures are accurate."],
          ["Comparing LCL and FCL.", "A quick total CBM tells you which side of the break-even line you are on."],
          ["Amazon FBA and e-commerce sellers.", "Sellers shipping to fulfillment centers need volume per carton and per shipment to plan freight and budget landed costs."],
          ["Exporters and small manufacturers.", "Packing teams use CBM to quote buyers, book container space, and find ways to pack more efficiently."],
          ["Freight forwarders and logistics coordinators.", "Pre-booking checks, consolidations, and customer quotes all depend on fast, accurate volume numbers."],
          ["Moving and relocation.", "Movers often price international moves by volume. Adding up your boxes in CBM helps you compare offers."],
          ["Warehouse and storage planning.", "Knowing the cubic volume of stock helps with rack space, pallet positions, and storage costs."],
        ]} />
      </Card>

      <Card title="Free to Use, Private, and Reliable">
        <P>
          The CBM calculator is free, with no hidden fees and no payment required. You do not need to create an account or provide personal
          details to calculate your shipment volume.
        </P>
        <P>
          The tool only needs your carton dimensions, quantity, and weight. No document uploads or personal information are required, and you
          never need to enter confidential product details to get a result.
        </P>
        <P>
          On accuracy, the calculator applies the standard volume formula and commonly used volumetric weight divisors, so results are consistent
          and repeatable. Results are estimates for planning. Your carrier’s final invoice may differ because of local surcharges, rounding rules,
          or their own dimensional factors.
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
