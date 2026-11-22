import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How many boxes fit on a pallet?", a: "It depends on the box size, the pallet size, and the maximum load height. Work out how many boxes fit on the pallet footprint, multiply by the number of layers, and test each side of the box as the vertical side. A pallet calculator does all of this for you." },
  { q: "How do I calculate the number of boxes on each layer by hand?", a: "Fit the box length and width into the pallet length and width, rounding down in each direction. Then turn the box 90 degrees and do it again, and keep the larger number. Repeat with each of the three sides standing up, and compare the layer counts." },
  { q: "What is the standard pallet size?", a: "In the United States it is the 48 x 40 inch pallet (1219 x 1016 mm). In Europe it is the 1200 x 800 mm EUR 1 pallet. Other common sizes include 1200 x 1000 mm, 1100 x 1100 mm, 1067 x 1067 mm, and 1165 x 1165 mm." },
  { q: "How much weight can a pallet hold?", a: "A standard 48 x 40 inch pallet is often cited as holding up to about 4,600 pounds (2,087 kg), but real limits vary with material, design, and use. Pallets that are moved, stacked, or racked have different ratings, so check the exact pallet's specification." },
  { q: "What is pallet utilization, and what is a good percentage?", a: "It compares the volume of your boxes with the pallet volume. For uniform cartons, 85 percent or higher is strong. Lower numbers point to gaps on the footprint or unused height at the top." },
  { q: "Can I use a custom pallet size?", a: "Yes. Choose the custom size option and enter the pallet width and length. This works for half pallets, display pallets, and non-standard skids." },
  { q: "Does the weight limit change the result?", a: "Yes. If you turn on the weight option and the boxes exceed the maximum load before the pallet is full, the total is limited to the number that stays within that weight." },
  { q: "How do I calculate CBM for a pallet?", a: "Multiply the length, width, and total height of the loaded pallet in meters. Include the height of the pallet itself, since the calculator's pallet volume does not." },
  { q: "How many pallets fit in a truck?", a: "A 53-foot trailer typically carries about 26 standard 48 x 40 inch pallets on the floor, and a European 13.6 meter trailer commonly carries 33 EUR 1 pallets. The exact count depends on the trailer's interior size, the pallet orientation, and weight limits." },
  { q: "Is this pallet calculator free, and do I need to sign up?", a: "It is free to use and does not require you to register." },
];

// The supplied FAQ schema matches the list above except for one answer.
const FAQ_SCHEMA_OVERRIDES = {
  "Does the weight limit change the result?": "Yes. If you turn on the weight option and the boxes would exceed the maximum load before the pallet is full, the total is limited to the number that stays within that weight.",
};

const SIZE_HEADERS = ["Pallet size", "Inches", "Common regions"];
const SIZE_ROWS = [
  ["1219 x 1016 mm", "48 x 40", "North America"],
  ["1200 x 1000 mm", "47.24 x 39.37", "Europe and Asia"],
  ["1165 x 1165 mm", "45.90 x 45.90", "Australia"],
  ["1100 x 1100 mm", "43.30 x 43.30", "Asia"],
  ["1067 x 1067 mm", "42 x 42", "North America, Europe, and Asia"],
  ["1200 x 800 mm", "47.24 x 31.50", "Europe (the EUR 1 or EPAL pallet)"],
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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 360 }}>
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

export default function PalletCalculatorFaqSection() {
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

      <Card title="What Is a Pallet and What Is It Used For?">
        <P>
          A pallet is a flat platform, usually made of wood, that holds goods so they can be lifted and moved as one unit. The gap between the top
          and bottom decks lets a forklift or pallet jack slide underneath, so a stack of 50 cartons can be loaded onto a truck in seconds instead
          of one carton at a time. Pallets are used in factories, warehouses, stores, ports, and trucks, and almost every shipment of food, retail
          goods, building materials, and industrial parts spends time on one. For more background on how pallets are built and classified, see
          the <Ext href="https://en.wikipedia.org/wiki/Pallet">pallet overview on Wikipedia</Ext>.
        </P>
        <P>
          Most pallets are made of wood. Softwoods such as pine, spruce, and fir are the usual choice because they are light, inexpensive, and
          easy to repair, while hardwoods such as oak are used for heavier-duty pallets. Plastic, metal, and paper-based pallets are also common
          where cleanliness, repeated reuse, or low weight matters. Wooden pallets shipped overseas generally have to be heat-treated or fumigated
          and stamped under the ISPM 15 standard. Every material and design has a different weight rating, so ask your supplier for the capacity
          of the exact pallet you plan to use. You will need that number if you turn on the weight limit in the calculator.
        </P>
      </Card>

      <Card title="Standard Pallet Sizes by Region">
        <P>
          Pallet sizes are not the same everywhere. The table below lists the six standard footprints built into the tool and the regions where
          each one is most common.
        </P>
        <DataTable headers={SIZE_HEADERS} rows={SIZE_ROWS} />
        <P>
          The 48 x 40 inch pallet is the standard in the United States and Canada, and the 1200 x 800 mm pallet is the standard across much of
          Europe. The European pallet specification is maintained by{" "}
          <Ext href="https://www.epal-pallets.org/">EPAL</Ext>. If your pallet is not on the list, choose the custom size option and enter the
          deck width and length yourself. That covers half pallets, display pallets, and special industrial skids. Measure the top deck, not the
          overall size including any overhang.
        </P>
      </Card>

      <Card title="How the Pallet Calculator Works">
        <P>The pallet calculator asks for a few simple inputs.</P>
        <List ordered items={[
          ["", "First, pick the pallet type."],
          ["", "Second, choose whether to take weight into account. If you select yes, you also enter the pallet's maximum load weight and the weight of each package."],
          ["", "Third, enter the maximum load height, which is measured from the top of the pallet, so the pallet's own height is not part of it."],
          ["", "Finally, enter the package dimensions as Side A, Side B, and Side C."],
        ]} />
        <P>
          Each field accepts millimeters, centimeters, meters, inches, feet, feet and inches, or meters and centimeters, so you do not have to
          convert anything first.
        </P>
        <P>
          When you press Calculate, the tool checks the different ways the package can sit on the pallet and keeps the one that fits the most.
          The results show the maximum number of packages on one pallet, pallet utilization, the number of layers, packages per layer, and the
          pallet volume. You also get a written arrangement that tells you where to start and how to turn the package, so a warehouse worker can
          build the load without guessing.
        </P>
      </Card>

      <Card title="How Many Boxes Fit on a Pallet?">
        <P>
          The math behind the answer is simple. Packages per layer is the number of boxes that fit on the pallet footprint. The number of layers
          is the maximum load height divided by the box height, rounded down. Multiply the two and you have the total.
        </P>
        <P>
          The tricky part is that a box has three sides, and any of them can be the vertical one. Here is an example. Say a carton measures 15 x
          11 x 9 inches, the pallet is 48 x 40 inches, and the maximum load height is 50 inches.
        </P>
        <List items={[
          ["", "With the 9-inch side up, the 15 x 11 inch footprint fits 9 boxes per layer. Five layers give 45 boxes."],
          ["", "With the 11-inch side up, the 15 x 9 inch footprint fits 12 boxes per layer. Four layers give 48 boxes."],
          ["", "With the 15-inch side up, the 11 x 9 inch footprint fits 16 boxes per layer. Three layers give 48 boxes."],
        ]} />
        <P>
          The most natural way to load the carton, lowest side up, comes out three boxes short of the best result. Always round down at every
          step. A partial box does not exist on a pallet, and a layer that is almost full still counts as the number of whole boxes that fit.
        </P>
      </Card>

      <Card title="Calculating Boxes per Layer by Hand or With Software">
        <P>
          You can do this by hand. For each of the three sides, treat it as the vertical side and work out the footprint of the other two. Then
          fit that footprint onto the pallet in both directions, rounding down each time, and keep the better of the two. That gives six
          arrangements in total. Calculate the layers for each one, multiply, and take the largest total.
        </P>
        <P>
          It works, but it is slow and easy to get wrong, especially when you are comparing several box sizes or pallet types. A pallet calculator
          runs all six arrangements in one click and returns layers, packages per layer, and the total at the same time. The arrangement it gives
          is one consistent orientation repeated layer after layer, which is easy to follow on the warehouse floor. Mixed patterns can sometimes
          squeeze in an extra box or two, but they take more care to build and are harder to repeat.
        </P>
      </Card>

      <Card title="Understanding Pallet Utilization">
        <P>
          Utilization shows how well your boxes fill the pallet space. In this tool it compares the total volume of the packages with the pallet
          volume, which is the pallet's length times its width times the maximum load height. In the example above, 48 boxes of 1,485 <Link to="/tools/cbm-calculator" className="inline-home-link">cubic</Link>{" "}
          inches each fill 71,280 cubic inches of a 96,000 cubic inch space, so utilization is about 74 percent.
        </P>
        <P>
          What counts as good depends on the product. For uniform cartons, 85 percent or higher is strong. A lower number comes from two places:
          gaps around the edges of the footprint and unused height at the top of the stack. Both are worth a look. A slightly different carton
          size, a different pallet, or a load height that is one inch taller can add a full layer or a full row of boxes. Even a half-inch change
          in a carton can turn eight boxes per layer into ten, a 25 percent gain without changing anything else in the shipment.
        </P>
      </Card>

      <Card title="Box Arrangement and Stacking Patterns">
        <P>The pattern you use affects both the count and the stability of the load.</P>
        <Lead lead="Column stacking">
          places each layer directly over the one below. It protects the compression strength of corrugated boxes because the walls carry the
          weight in a straight line, but the stack has no interlock and can lean or shift unless it is wrapped or strapped well.
        </Lead>
        <Lead lead="Interlocked or brick stacking">
          rotates alternating layers so the boxes overlap, like bricks in a wall. It ties the load together and resists tipping, but it can lower
          the effective stacking strength of the boxes because the walls no longer line up.
        </Lead>
        <Lead lead="Pinwheel patterns">
          rotate boxes around a central gap or block. They are common for cartons that do not divide evenly into the pallet edges and can fit a
          few extra boxes on a layer.
        </Lead>
        <P>
          Use the calculator's arrangement as your starting point, then adjust for the real conditions of your product: how heavy the boxes are,
          how many layers sit on top of the bottom ones, and whether the pallet will be moved by forklift, pallet jack, or conveyor.
        </P>
      </Card>

      <Card title="Pallet Load Capacity and the Weight Limit">
        <P>
          Space is only half the limit. A pallet can reach its weight capacity long before it runs out of room, especially with dense goods such
          as beverages, tile, canned food, and brick. When you set Take weight into account to yes, the calculator uses the pallet's maximum load
          weight and each package's weight to cap the total at a count that stays within the limit.
        </P>
        <P>
          To check it by hand, divide the maximum load by the weight of one box and round down. If a pallet can carry 2,000 pounds and each box
          weighs 35 pounds, weight allows 57 boxes. If the space limit is 48 boxes, space decides. If each box weighs 50 pounds, weight allows only
          40, and weight decides.
        </P>
        <P>
          Load capacity is not one fixed number. A figure of about 4,600 pounds (2,087 kg) is often cited as the ceiling for a standard 48 x 40
          inch pallet, and a EUR 1 pallet is commonly rated around 1,500 kg for dynamic loads. Real limits depend on the material, the condition
          of the pallet, and how it is used: moving on a forklift, stacked on the floor, or sitting in a rack. Racked loads usually have the
          lowest limit. Rack capacity itself is set by the rack manufacturer for each beam level, so check the rack's load plate. The same goes
          for conveyors. The loaded weight of a pallet is the box count times the box weight plus the weight of the pallet, and the conveyor's
          rating depends on its roller spacing and design, so confirm it with the manufacturer. Use the lowest limit in your chain, and decide
          whether your limit includes the weight of the pallet, shrink wrap, and corner boards.
        </P>
      </Card>

      <Card title="Pallet Shipment Size and Weight">
        <P>
          Carriers want three things for a pallet shipment: the gross weight, the dimensions, and the number of pallets. Gross weight is the
          number of boxes times the weight of each box, plus the pallet itself and any wrap or protection. A standard wooden pallet often weighs
          somewhere around 30 to 50 pounds, so weigh yours or ask your supplier. For dimensions, use the pallet length and width and add the
          pallet height to the stack height. In the example above, a 50-inch load on a pallet about 6 inches tall makes the shipment roughly 48 x
          40 x 56 inches.
        </P>
      </Card>

      <Card title="How to Calculate CBM for a Pallet">
        <P>
          CBM means cubic meters. Multiply the length, width, and height of the loaded pallet in meters. A 48 x 40 inch pallet is about 1.22 x
          1.02 meters. Loaded to 50 inches (1.27 m) on a 0.15 m pallet, it is about 1.42 m tall, which gives roughly 1.76 CBM. For cubic feet,
          multiply CBM by 35.3.
        </P>
        <P>
          One detail matters here. The pallet volume in the calculator uses the maximum load height and does not include the pallet's own height,
          because that is how utilization is measured. For <Link to="/tools/freight-class-calculator" className="inline-home-link">freight</Link> CBM, use the real height of the finished stack and add the pallet height.
        </P>
      </Card>

      <Card title="How Many Pallets Fit in a Truck?">
        <P>
          Start with the floor. Divide the trailer's floor length by the pallet length, and the width by the pallet width, to see how many fit
          side by side and end to end. Then try turning the pallets the other way, because one direction almost always packs better. As a rough
          guide, a 53-foot trailer typically carries about 26 standard 48 x 40 inch pallets on the floor, and a 13.6 meter European trailer
          commonly carries 33 EUR 1 pallets. Pinwheel layouts can add a few more on some trailers, but the exact count depends on the trailer's
          interior size.
        </P>
        <P>
          Three more limits apply. Height decides whether pallets can be double-stacked, and that only works if the loads are strong enough to take
          the weight. The truck's weight limit often arrives before its floor space does with heavy freight. And the carrier may have rules on
          overhang and loading order. Work out the pallet count first with the calculator, then confirm the layout with your carrier.
        </P>
      </Card>

      <Card title="When You Need a Pallet Calculator">
        <P>
          E-commerce sellers use it before sending stock to a fulfillment center, where an inbound shipment must be built to a specific pallet
          size and height. Manufacturers use it to set standard pack-out quantities and quote freight correctly. Warehouse teams use it to plan
          putaway and estimate how many pallet positions an incoming order will fill. Small businesses use it to compare freight quotes, since
          knowing exactly how many boxes fit on a pallet tells you whether a shipment needs two pallets or three. Importers and exporters use it
          to plan loads, and packaging designers use it early in a project, because carton dimensions that fit a pallet well save money for the
          life of the product.
        </P>
      </Card>

      <Card title="Tips for Reliable Results">
        <P>
          Measure the outside dimensions of the finished carton, including any bulge from heavy contents, since half an inch can break a tight
          pattern. Leave a small tolerance if carton sizes vary. Remember that stretch wrap and corner protectors add a little width. Confirm the
          weight rating of the exact pallet, not a generic figure. And build one test pallet before a large production run, since the calculator
          assumes perfect boxes and real cartons never are.
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
