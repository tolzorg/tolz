import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a freight class calculator?", a: "A freight class calculator turns a shipment’s size and weight into a density in lb/ft³ and matches it to an NMFC class from 50 to 500. LTL carriers use that class to price your shipment." },
  { q: "How do I calculate freight class?", a: "Multiply length × width × height in inches and divide by 1,728 to get cubic feet. Divide the weight in pounds by that volume to get density, then look up the density on the NMFC chart." },
  { q: "What is freight class based on?", a: "It is based on four factors: density, stowability, handling, and liability. For many pallets, density decides the class." },
  { q: "Is a higher freight class more expensive?", a: "Generally, yes. Higher classes cover lighter, bulkier, or more fragile freight, and carriers charge more per hundred pounds for them." },
  { q: "What does freight class 60 mean?", a: "Class 60 covers freight with a density of 30 to under 35 lb/ft³. It is dense freight that costs less per hundred pounds than higher classes." },
  { q: "How do I choose a freight class?", a: "You don’t pick it freely. Use the NMFC listing for your product and the density of the packed pallet, then confirm the class with your carrier." },
  { q: "How do freight carriers price shipments?", a: "They start with a base rate from their tariff, based on class, weight, and route. Then they add a fuel surcharge and any extra service fees." },
  { q: "Do I include the pallet in the weight and size?", a: "Yes. Include the pallet, packaging, and any overhang, since carriers weigh and measure the whole shipping unit." },
  { q: "Does the total freight cost include fuel and other fees?", a: "No. The tool multiplies your rate by the weight and the number of pallets. Fuel surcharges, insurance, and extra service fees are not included." },
  { q: "Is this freight class calculator free, and do I need to sign up?", a: "Yes, it is free, and no signup is required." },
  { q: "What happens if I declare the wrong freight class?", a: "The carrier can reclassify the shipment after inspection and bill you the difference plus an adjustment fee. That often costs more than the original quote." },
];

// The supplied FAQ schema matches the list above with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const CLASS_HEADERS = ["Density (lb/ft³)", "NMFC Freight Class"];
const CLASS_ROWS = [
  ["50 or more", "50"], ["35 to under 50", "55"], ["30 to under 35", "60"], ["22.5 to under 30", "65"],
  ["15 to under 22.5", "70"], ["13.5 to under 15", "77.5"], ["12 to under 13.5", "85"], ["10.5 to under 12", "92.5"],
  ["9 to under 10.5", "100"], ["8 to under 9", "110"], ["7 to under 8", "125"], ["6 to under 7", "150"],
  ["5 to under 6", "175"], ["4 to under 5", "200"], ["3 to under 4", "250"], ["2 to under 3", "300"],
  ["1 to under 2", "400"], ["Less than 1", "500"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 280 }}>
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

export default function FreightClassCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Freight Class and Why Does It Matter?">
        <P>
          Freight class is a standard code, from 50 to 500, that less-than-truckload (LTL) carriers use to group goods by how costly they are to
          ship. The codes come from the National Motor Freight Classification (NMFC), which is maintained by the{" "}
          <Ext href="https://www.nmfta.org/">National Motor Freight Traffic Association</Ext> (NMFTA). In simple terms, the class tells a carrier
          how much space and effort a shipment will take compared with its weight. Low classes like 50 or 55 describe dense, sturdy freight that
          is easy to load. High classes like 300 or 500 describe light, bulky, or delicate freight that takes up a lot of room for very little
          weight.
        </P>
        <P>
          You will see freight class in several places. Online LTL quote forms ask for it. Carriers use it with their rate tariffs to set your
          price. It is printed on the bill of lading, and carriers check it later against the actual shipment. It also plays a part in claims,
          since the class reflects how easily the goods can be damaged.
        </P>
        <P>
          The class matters because it directly affects what you pay. Two pallets can weigh the same and still cost very different amounts to
          ship, because a compact pallet of metal parts uses far less trailer space than a tall pallet of foam. A freight class calculator takes
          the guesswork out of this first step, so your quote starts from the right number.
        </P>
      </Card>

      <Card title="What Is Freight Class Based On?">
        <P>The NMFC sets a freight class using four factors:</P>
        <List items={[
          ["Density:", "how much the shipment weighs compared with the space it takes up, measured in pounds per cubic foot."],
          ["Stowability:", "how easily the freight fits with other cargo. Odd shapes, hazardous materials, and items that can’t be stacked are harder to stow."],
          ["Handling:", "how much effort it takes to load, secure, and unload the freight, including whether special equipment is needed."],
          ["Liability:", "how likely the goods are to be stolen, damaged, or to damage other freight, along with their value."],
        ]} />
        <P>
          For many everyday palletized goods, density is the deciding factor. That is why a density-based freight class calculator works well for
          most shipments. For fragile, hazardous, or high-value goods, the other three factors can push the class higher than density alone would
          suggest.
        </P>
      </Card>

      <Card title="How This Freight Class Calculator Works">
        <P>Start with the pallet specifications.</P>
        <List items={[
          ["", "Enter the length, width, and height, and pick the unit you prefer for each."],
          ["", "You can use millimeters, centimeters, meters, inches, feet, feet and inches, or meters and centimeters."],
          ["", "Then enter the weight of the pallet and choose its unit, from grams and kilograms to ounces, pounds, stones, or tons."],
        ]} />
        <P>
          Include the pallet itself and all packaging in both the size and the weight. Carriers bill for what actually arrives at the dock.
          Measure each side at its widest point, including overhang, banding, and any bulge in the shrink wrap. A pallet that is 52 inches wide at
          the top is billed as 52 inches wide, even if the base is 48.
        </P>
        <P>
          Click Calculate and the tool shows the NMFC freight class based on the U.S. standard. It also shows the density in pounds per cubic foot
          (lb/ft³) and in kilograms per cubic meter (kg/m³). To see the cost, fill in the total freight cost fields, which are covered below.
        </P>
      </Card>

      <Card title="How to Calculate Freight Class">
        <P>Knowing the math helps you double-check any result. There are three steps.</P>
        <List ordered items={[
          ["", "Multiply length × width × height in inches, then divide by 1,728 to get cubic feet."],
          ["", "Divide the weight in pounds by the cubic feet. The result is the density in lb/ft³."],
          ["", "Find that density in the chart below to get the class."],
        ]} />
        <P>
          Here is an example. A 48 × 40 × 48 inch pallet weighing 500 lb has a volume of 92,160 cubic inches, or 53.33 ft³. Divide 500 by 53.33
          and you get a density of 9.38 lb/ft³. That falls in the 9 to 10.5 range, so the class is 100.
        </P>
        <P>
          Now take a shorter, heavier pallet: 48 × 40 × 36 inches at 1,000 lb. The volume is 40 ft³ and the density is 25 lb/ft³, which gives
          class 65. The footprint is the same, but the denser pallet lands in a class that costs much less to ship.
        </P>
      </Card>

      <Card title="Freight Class Chart by Density">
        <P>This table shows the standard density scale used for goods that are classed by density. Use it as a reference and let the calculator do the lookup.</P>
        <DataTable headers={CLASS_HEADERS} rows={CLASS_ROWS} />
        <P>
          The pattern is easy to remember. The denser your cargo, the lower its class. Some NMFC items have their own fixed class or density
          brackets, and NMFTA updated parts of its density-based rules in 2025. So treat the calculator result as a strong estimate that your
          carrier will confirm against the item listing in the current NMFC.
        </P>
      </Card>

      <Card title="What Does Freight Class 60 Mean?">
        <P>
          Class 60 covers freight with a density of 30 lb/ft³ up to just under 35 lb/ft³. That is fairly dense, heavy freight, such as some bulk
          building materials, bottled liquids, or small machine parts packed tightly. On a standard 48 × 40 × 48 inch pallet (about 53.33 ft³),
          class 60 means a weight of roughly 1,600 to 1,866 lb.
        </P>
        <P>
          Class 60 sits near the low end of the scale, so it is generally cheaper to ship per hundred pounds than classes like 100 or 200. If the
          density stays the same and the item has no special rules, the calculator will return class 60 for any pallet that falls in that range.
        </P>
      </Card>

      <Card title="How Do You Determine Freight Class for LTL?">
        <P>Carriers expect you to class your own freight, and they will check it. A reliable way to do it looks like this:</P>
        <List ordered items={[
          ["Find the commodity in the NMFC.", "Each product has an item listing with a description and, in many cases, an item number."],
          ["Check how the item is classed.", "Some items have a fixed class. Others are classed by density, which is where this calculator helps."],
          ["Measure and weigh the handling unit.", "Use the full pallet with packaging, not just the product."],
          ["Calculate the density", "and read off the class, or use the calculator."],
          ["Review the other three factors.", "If the goods are fragile, hazardous, valuable, or awkward to stow, ask the carrier whether a higher class applies."],
          ["Put the class on the bill of lading", "and confirm it with the carrier before pickup."],
        ]} />
      </Card>

      <Card title="How Do I Choose a Freight Class?">
        <P>
          You don’t really choose a freight class. It is set by what you ship and how it is packed, and your job is to declare it accurately.
          Picking a lower class than the freight deserves might save money on the quote, but it will usually backfire once the carrier inspects
          the load.
        </P>
        <P>
          Start with the NMFC listing for your product, then use the density of the packed pallet. If one pallet holds several different items,
          ask your carrier how they class mixed loads. Many carriers apply the higher class to the whole pallet. If you are unsure, get a quote
          with the class you calculated and ask the carrier to confirm it.
        </P>
      </Card>

      <Card title="Is a Higher Freight Class More Expensive?">
        <P>
          Yes, in most cases. A higher class means less dense, bulkier, or more delicate freight, and carriers charge more per hundred pounds for
          it. A shipment in class 250 will usually cost noticeably more to ship than the same weight in class 70 on the same route.
        </P>
        <P>
          The class is only one part of the price, though. Distance, the carrier’s own discounts, weight, and extra services all affect the final
          number. This is why improving your pallet density can save money, but it doesn’t guarantee a specific price.
        </P>
      </Card>

      <Card title="How Do Freight Carriers Price Shipments?">
        <P>
          LTL carriers start with a base rate from their tariff, which depends on the freight class, the shipment weight, and the origin and
          destination. Rates are usually quoted per hundred pounds (cwt), and heavier shipments often get a lower rate per cwt. Most carriers
          apply a negotiated discount on top of the tariff, and they set a minimum charge so that very small shipments still cover their costs.
        </P>
        <P>
          After the base rate, carriers add a fuel surcharge and any extra services you need. Those add-ons are covered in the cost section below.
          The key point is that the class sits at the center of the calculation, so getting it right is the best way to get a quote you can
          trust.
        </P>
      </Card>

      <Card title="Total Freight Cost: How the Tool Calculates It">
        <P>
          Below the pallet specifications, the calculator has a total freight cost section. Enter the number of pallets and the freight rate, and
          choose your currency. The tool then multiplies rate × weight × number of pallets to show the total.
        </P>
        <P>
          The rate has to match the weight unit you picked. If you entered the weight in pounds, the rate should be per pound. If your carrier
          quotes per hundred pounds (cwt), divide that rate by 100 first. For example, $30 per cwt is $0.30 per pound.
        </P>
        <P>
          Keep in mind that this figure covers the base freight only. It does not include fuel surcharges, insurance, or fees for extra services.
          Treat it as a minimum, then confirm the final price with a live quote.
        </P>
      </Card>

      <Card title="What Charges Are Included in Freight?">
        <P>A freight invoice often has more than the base rate. Common charges include:</P>
        <List items={[
          ["", "The base rate for the class, weight, and route"],
          ["", "A fuel surcharge"],
          ["", "Accessorial fees, such as liftgate service, residential delivery, limited-access locations, or inside delivery"],
          ["", "Appointment or delivery notification fees"],
          ["", "Insurance or declared value coverage"],
          ["", "Reweigh, re-inspection, and reclassification fees if the carrier finds a difference in the class or weight"],
        ]} />
        <P>Ask your carrier which charges apply to your shipment so the total doesn’t come as a surprise.</P>
      </Card>

      <Card title="Why Do Freight Rates Fluctuate?">
        <P>
          Freight rates change because the costs and demand behind them change. Fuel prices move the fuel surcharge up and down. Seasonal peaks,
          such as the weeks before the holidays, tighten truck capacity and push rates higher. Carriers also raise their tariffs from time to
          time, and rates vary by lane, since some routes have fewer trucks coming back loaded. Driver supply, weather, and the broader economy
          all play a part too.
        </P>
        <P>
          Since the cost field uses the rate you enter, update it whenever you get a new quote. That way your estimate stays close to what you
          will actually pay.
        </P>
      </Card>

      <Card title="Types of Freight and Where Freight Class Applies">
        <P>
          Freight moves in several ways, and not all of them use freight class. LTL shipping combines freight from several customers on one truck
          and uses the NMFC class system. Full truckload (FTL) moves one shipper’s freight on a whole trailer and is usually priced by lane and
          truck, not by class. Parcel carriers handle small packages and price by dimensional weight, which compares actual weight with the space
          a box takes up. Other modes, like air, ocean, and intermodal, use their own pricing rules.
        </P>
        <P>If you are sending one or more pallets within the United States on an LTL carrier, freight class is the number you need.</P>
      </Card>

      <Card title="When You Need a Freight Class Calculator: Practical Scenarios">
        <P>
          Small businesses and online sellers often run into freight class the first time an order is too big for parcel shipping. A 600 lb order
          of ceramic tile or a set of cartons headed to a fulfillment center needs an LTL quote, and every quote form asks for a class. Having the
          answer ready makes it much faster to compare carriers.
        </P>
        <P>
          Warehouse and logistics teams use the same step to build bills of lading and to check that suppliers declared the right class.
          Manufacturers use it when quoting delivered prices, since freight is part of that number. Freight brokers rely on it when a customer
          can’t provide a class, and import and export teams use it to plan the U.S. leg of a shipment.
        </P>
        <P>
          It also helps you pack smarter. If a pallet lands in class 125 and a small change moves it into class 85, you can see that before you
          ship rather than on the invoice.
        </P>
      </Card>

      <Card title="Tips to Ship Efficiently and Lower Your Freight Class">
        <P>Because class follows density, the most practical way to lower it is to pack more efficiently.</P>
        <List items={[
          ["Remove empty space.", "Use cartons that fit the product, fill voids, and build the pallet tight to its edges."],
          ["Control height and overhang.", "Extra height and overhang add volume you pay for."],
          ["Watch the class boundaries.", "Say a pallet takes up 40 ft³ and weighs 319 lb. Its density is 7.98 lb/ft³, which is class 125. At 320 lb the density is 8.0 lb/ft³, which is class 110. If you are just under a boundary, tightening the pack or shipping a little more product on the same pallet can move you to a cheaper class. Run both versions in the calculator first, since extra weight also raises the cost per pallet."],
          ["Consolidate when you can.", "Fewer, denser pallets often cost less than many light ones."],
          ["Compare quotes.", "Carriers price the same class differently, so ask more than one."],
          ["Keep records.", "Take a photo of the loaded pallet and note its weight and measurements in case a carrier questions the class."],
        ]} />
      </Card>

      <Card title="Common Mistakes That Lead to Reclassification Fees">
        <P>
          Carriers inspect and reweigh freight. If your bill of lading doesn’t match what they measure, they issue a correction and charge a fee.
          The causes are easy to avoid. Shippers measure the product but forget the pallet and packaging. They measure the base but not the
          overhang. They round weight down or reuse a class from an earlier shipment that was packed differently. Mixed pallets cause problems
          too, since the pallet is classed as a whole and should be measured exactly as it will ship.
        </P>
        <P>
          Use real scale weight when you can, record sizes to the nearest inch, and round up instead of down. If a carrier assigns a different
          class, ask which NMFC item and density bracket they used. A fair correction will come with that reference.
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
