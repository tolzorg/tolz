import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate how many boxes fit in a container?", a: "Divide the container's internal volume by the volume of one box for a quick estimate, then use a container loading calculator for the real count. The calculator accounts for how each box dimension divides into the container, which a simple volume division ignores." },
  { q: "How many boxes fit in a 20ft container?", a: "It depends on the carton size. A 20ft container holds about 33 CBM, so small cartons of 0.06 CBM suggest around 551 on paper, and the real count is lower. Enter your actual dimensions for an exact number." },
  { q: "How many boxes fit in a 40ft container?", a: "A standard 40ft container holds about 67.7 CBM and a high cube about 76.4 CBM. The count depends on how your carton dimensions divide into the container's internal length, width and height." },
  { q: "What is the usable internal volume of a shipping container?", a: "A 20ft container holds about 33 CBM, a 40ft about 67.7 CBM, a 40ft high cube about 76.4 CBM and a 45ft high cube about 86 CBM. These are rated maximums, and real loads fill less of that space." },
  { q: "Should I load boxes lengthwise or widthwise?", a: "It depends on how your box dimensions divide into the container. Check how many boxes fit across the 2.35 m width first, since leftover width repeats down the whole load." },
  { q: "How many boxes fit if I rotate them 90 degrees?", a: "Rotation changes how each side divides into the container. A 50 × 40 × 30 cm carton gives 385 boxes one way and 392 the other in a 20ft container, with every box facing the same way." },
  { q: "How many layers fit in a 20ft vs. a 40ft high cube?", a: "Layers depend on height. A standard 20ft or 40ft has a 2.39 m interior, and a high cube has 2.69 m. For 30 cm cartons, that is 7 layers versus 8." },
  { q: "What is a good space utilization percentage?", a: "For uniform, floor-loaded cartons, the 80s is generally good and the 90s is excellent. Lower results often mean the carton size does not divide well into the container." },
  { q: "How much weight can a shipping container hold?", a: "Maximum payload is about 28,300 kg for a 20ft, 28,870 kg for a 40ft, 28,690 kg for a 40ft high cube and 27,650 kg for a 45ft high cube, per Maersk. Limits vary by line, and road limits may be lower." },
  { q: "Does the calculator consider cargo weight?", a: "No. It works from dimensions and shows volume-based results. Multiply your box count by the weight per box and compare it to the container's payload limit." },
  { q: "Is FCL better than LCL?", a: "FCL means less handling, more control over packing and often faster transit. LCL can cost less for small shipments. The calculator shows how full a container would be, which helps you decide." },
  { q: "Can I use a custom container size?", a: "Yes. Choose the custom option and enter the internal length, width and height. This works for trailers, vans, refrigerated units and storage rooms. High cube and pallet-wide containers are already available as presets." },
  { q: "Can I calculate palletized cargo?", a: "Yes. Work out the size of one loaded pallet, including the pallet's height, and enter it as the box size to see how many pallets fit." },
];

// The supplied FAQ schema writes "50 x 40 x 30" with a plain x and adds one
// question that is not in the visible FAQ list, so it is kept as given.
const FAQ_SCHEMA_ITEMS = [
  ...FAQ_ITEMS.map((item) => ({ q: item.q, a: item.a.replace("50 × 40 × 30", "50 x 40 x 30") })),
  { q: "Is the container loading calculator free?", a: "Yes, it is free to use on Tolz." },
];

const SIZE_HEADERS = ["Container type", "Internal length", "Internal width", "Internal height"];
const SIZE_ROWS = [
  ["Standard 10ft", "2.83 m (9 ft 3 in)", "2.35 m (7 ft 8.5 in)", "2.39 m (7 ft 10.1 in)"],
  ["Standard 20ft", "5.90 m (19 ft 4.2 in)", "2.35 m (7 ft 8.5 in)", "2.39 m (7 ft 10.1 in)"],
  ["Standard 40ft", "12.03 m (39 ft 5.7 in)", "2.35 m (7 ft 8.5 in)", "2.39 m (7 ft 10.1 in)"],
  ["High Cube 20ft", "5.90 m (19 ft 4.2 in)", "2.35 m (7 ft 8.5 in)", "2.69 m (8 ft 10.2 in)"],
  ["High Cube 40ft", "12.03 m (39 ft 5.7 in)", "2.35 m (7 ft 8.5 in)", "2.69 m (8 ft 10.2 in)"],
  ["High Cube 45ft", "13.56 m (44 ft 6 in)", "2.35 m (7 ft 8.5 in)", "2.69 m (8 ft 10.2 in)"],
  ["Pallet Wide 20ft", "5.89 m (19 ft 4 in)", "2.44 m (8 ft 0 in)", "2.39 m (7 ft 10.1 in)"],
  ["Pallet Wide 40ft", "12.02 m (39 ft 5 in)", "2.44 m (8 ft 0 in)", "2.39 m (7 ft 10.1 in)"],
];

const LAYER_HEADERS = ["Carton height", "Standard (2.39 m)", "High cube (2.69 m)"];
const LAYER_ROWS = [
  ["20 cm", "11 layers", "13 layers"],
  ["30 cm", "7 layers", "8 layers"],
  ["40 cm", "5 layers", "6 layers"],
  ["50 cm", "4 layers", "5 layers"],
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
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function ContainerLoadingCalculatorFaqSection() {
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

      <Card title="Container Size Chart: Internal Dimensions">
        <P>
          The inside of the container is what counts, not the outside. These are the internal dimensions behind the calculator's container
          presets, in metric and imperial units. Exact figures vary a little by manufacturer and shipping line, so check your carrier's
          specification sheet before you book.
        </P>
        <DataTable headers={SIZE_HEADERS} rows={SIZE_ROWS} />
        <P>
          If your container is not on the list, such as a refrigerated unit, a trailer or a storage room, choose Custom and enter your own length,
          width and height. Pallet wide containers are about 2.44 m wide inside, roughly 9 cm wider than a standard container, which helps
          standard pallets fit side by side. Choose carefully, because these dimensions directly change how many boxes fit.
        </P>
      </Card>

      <Card title="How the Container Loading Calculator Works">
        <P>
          Loading a container is a three-dimensional puzzle. The container has a fixed length, width and height. Your carton has its own length,
          width and height, and it can sit flat, stand on its side or stand on its end. Each choice divides differently into the container, so
          each one leaves a different amount of wasted space.
        </P>
        <P>
          You enter two things: the container (a preset or custom internal dimensions) and the package (side A, side B and side C). The
          calculator then gives you:
        </P>
        <List items={[
          ["Packages that fit:", "the maximum count for the chosen container."],
          ["Container utilization:", "the percentage of the container's volume your cartons fill."],
          ["Number of layers:", "how many stacked levels the load builds from floor to ceiling."],
          ["Packages per layer:", "how many cartons sit on each level."],
          ["Container volume and single package volume:", "the two numbers behind the utilization figure."],
          ["Arrangement instructions:", "a short written guide to positioning the packages, so you can repeat the result on the loading dock."],
        ]} />
        <P>
          The arrangement matters as much as the count. The number tells you what is possible. The layout tells you how to get there. The
          calculator writes it out as a short set of steps: which side of the package runs along the container's width, which side runs along its
          length, and how to repeat the pattern layer by layer.
        </P>
      </Card>

      <Card title="How to Calculate Container Volume">
        <P>A container is basically a big rectangular box, so its volume is length times width times height. In plain form:</P>
        <Formula>Volume = Length × Width × Height</Formula>
        <P>
          Use the internal dimensions from the chart above and keep all three in the same unit. Shipping volume is usually quoted in cubic meters,
          or CBM.
        </P>
        <P>
          The same formula works for a single carton. Divide the container volume by the carton volume and you get a rough box count. That number
          is a ceiling, not a promise. Boxes have flat sides and fixed sizes, and they rarely divide evenly into the container's length, width and
          height. The gaps left at the end of a row, along a wall or under the roof add up quickly, which is why a count based on volume alone is
          almost always too high.
        </P>
      </Card>

      <Card title="How Many Boxes Fit in a Container?">
        <P>This is the question most people start with, and the honest answer is that it depends on your box.</P>
        <P>
          Take a carton that measures 50 × 40 × 30 cm. It has a volume of 0.06 CBM, so a 20ft container's 33.1 CBM suggests about 551 cartons on
          paper. Once you account for how the carton actually divides into the container's dimensions, the real count is lower. The next sections
          show why, using this same carton.
        </P>
        <P>
          A 40ft container holds a little more than twice the volume of a 20ft, but that does not always mean twice the boxes. A carton that fits
          the 20ft almost perfectly can leave awkward gaps in a 40ft. Running both sizes through the calculator before you book takes seconds and
          can save a container.
        </P>
      </Card>

      <Card title="Should I Load Boxes Lengthwise or Widthwise in a Shipping Container?">
        <P>
          Lengthwise means the longest side of the box runs along the container's length. Widthwise means that side runs across the container's
          width. Neither is always better. What matters is how neatly your box dimensions divide into the container's 5.90 m length (20ft) or
          12.03 m length (40ft), and its fixed 2.35 m width.
        </P>
        <P>
          The width is usually where the biggest waste hides. A container is only 2.35 m wide, so a leftover of 30 or 40 cm across the floor
          repeats down the entire length of the load. When you plan by hand, check the width first. Ask how many boxes fit across, and how much
          space is left over. If a different orientation uses that width better, it often wins even when it fits slightly fewer boxes along the
          length.
        </P>
        <P>
          The calculator handles this for you. Its arrangement instructions tell you which side of the package to place parallel to the
          container's width and which to place along its length. Follow those steps as written, then check the result against your handling
          limits.
        </P>
      </Card>

      <Card title="How Many Boxes Fit If I Rotate Them 90 Degrees?">
        <P>
          Turning a box 90 degrees swaps which side runs along which part of the container, and that can change the count noticeably. Here is a
          simple example. Using the 50 × 40 × 30 cm carton in a 20ft container (590 × 235 × 239 cm), with every box facing the same way:
        </P>
        <List items={[
          ["", "50 cm along the length and 40 cm across the width, standing 30 cm high: 11 × 5 × 7 = 385 boxes"],
          ["", "40 cm along the length and 50 cm across the width, standing 30 cm high: 14 × 4 × 7 = 392 boxes"],
        ]} />
        <P>
          Same carton, same container, and a single 90-degree turn adds seven boxes. On a large order, that kind of difference can decide whether
          you need a second container. Tipping the carton onto its side changes the layer count as well, so a rotation can shift both the floor
          pattern and the number of layers. You do not have to work this out by hand. The calculator's arrangement instructions say which package
          side goes parallel to the container's width and which goes along its length, so the orientation is part of the answer.
        </P>
        <P>
          Before you rotate anything for real, confirm the carton is allowed to be stored that way. Some products must stay upright, and some
          cartons are marked "this side up."
        </P>
      </Card>

      <Card title="How Many Layers of Boxes Can I Stack in a 20ft vs. 40ft High Cube Container?">
        <P>
          Layers depend on height, not length. A standard 20ft and a standard 40ft container have the same 2.39 m interior height, so they stack
          the same number of layers. A high cube, whether it is a 40ft or 45ft, adds about 30 cm, with a 2.69 m interior. Here is how many layers
          fit for a few common carton heights:
        </P>
        <DataTable headers={LAYER_HEADERS} rows={LAYER_ROWS} />
        <P>
          The extra 30 cm does not always buy you a full layer, but for the right carton height it adds one or two, which is a big gain across a
          container's full floor area. If your cartons are taller than about 30 cm, check whether a high cube picks up a layer before you decide
          on the standard height. Many people choose a 40ft high cube for light, bulky goods for exactly this reason.
        </P>
        <P>
          The calculator reports both the number of layers and the packages per layer, and multiplying the two gives the total count. Layers also
          raise a strength question. A box rated for four high cannot safely go six high, even if the geometry allows it. If the layer count is
          more than your packaging can handle, you can lower the stack height and accept less utilization, or upgrade the packaging. The
          calculator shows the tradeoff, and you decide which cost is smaller.
        </P>
      </Card>

      <Card title="What Is a Good Space Utilization Percentage for Floor-Loaded Containers?">
        <P>
          Space utilization is the share of the container's internal volume that your boxes occupy. If the calculator shows 88%, the other 12% is
          empty air: gaps along the walls, room above the top layer and leftover width that no box can use.
        </P>
        <P>
          No real load reaches 100%. For uniform cartons that are floor-loaded, meaning stacked directly on the container floor, a result in the
          80s is generally considered good, and anything in the 90s is excellent. Results in the 70s are common with oversized or awkward cartons.
          The 50 × 40 × 30 cm carton above lands around 71%, for example, which tells you something. A small change to the carton size, even a
          few centimeters, might let the boxes fit the container much better.
        </P>
        <P>
          Many exporters redesign their packaging for this exact reason. Better utilization means fewer containers per order. Remember that
          utilization is about volume only. A container can be full by volume long before it reaches its weight limit, and the reverse is also
          true.
        </P>
      </Card>

      <Card title="How to Measure Your Package (Side A, Side B and Side C)">
        <P>
          The calculator needs three measurements for your carton: length, width and height, which the calculator labels side A, side B and side
          C. Getting these right is the single biggest factor in an accurate result, and small errors multiply fast across hundreds of boxes.
        </P>
        <List items={[
          ["Measure the outside of a packed, sealed carton.", "Do not use the dimensions of the product inside, and do not use the size of a flat, empty box."],
          ["Measure at the widest point.", "Filled cartons bulge, especially with soft goods like clothing or bags. A box labeled 40 cm can measure 41 cm once it is full. Across ten boxes in a row, that one centimeter becomes ten centimeters of lost length, and boxes that were supposed to fit get stuck."],
          ["Include tape, straps and corner guards", "if they add thickness."],
          ["Measure all three sides.", "Use a tape measure rather than trusting the printed size."],
          ["Check the real total.", "Stack ten cartons and measure the whole stack. This catches a bulge that a single box hides."],
          ["Round up, not down.", "If a side measures 40.4 cm, enter 41 cm. A box that fits on paper but not in practice causes real delays."],
          ["Check your units.", "The calculator lets you pick a unit for each field, including centimeters, meters, inches, feet and feet with inches. Make sure the unit next to each value matches what you measured, because a wrong unit is the most common reason a result looks off."],
        ]} />
      </Card>

      <Card title="When to Use Custom Dimensions: Door Clearance vs. Interior Size">
        <P>
          The presets use the interior dimensions of the container, which is the right starting point for most loads. But the interior is not the
          only limit. The doorway is smaller than the inside of the box. According to{" "}
          <Ext href="https://kh.one-line.com/dry-containers">ONE's dry container specifications</Ext>, a standard 20ft container has an interior
          height of 2,390 mm but a door opening of about 2,340 mm wide and 2,280 mm high.
        </P>
        <P>
          That gap matters when you load by hand. The last stack of boxes right at the door has to pass under the door header, so it cannot be the
          full 2.39 m tall. If you want a plan that works for every stack, including the final one, you can use custom dimensions and lower the
          height from 2.39 m to about 2.28 m. The count will usually be the same or a layer lower per column near the door, which is a more
          careful number to plan around. Running the calculation both ways shows you the best case and the safe case.
        </P>
        <P>Custom dimensions are also the right choice when:</P>
        <List items={[
          ["", "Your container is not on the preset list."],
          ["", "You are loading a refrigerated container, where insulated walls make the interior smaller than the standard figures."],
          ["", "You are loading a truck trailer, van, shed or storage room."],
          ["", "You need to leave room at the top or front for airbags, bracing or dunnage. Reduce the length or height by that amount."],
          ["", "You measured the real container and found that fixtures, lighting or ribbing reduce the usable space."],
        ]} />
        <P>
          If you are working in a 10ft container, accurate measurements matter even more, since a few centimeters of lost space take up a larger
          share of the total.
        </P>
      </Card>

      <Card title="Floor Loading vs. Palletizing: Why Direct Carton Calculation Matters">
        <P>
          Floor loading, also called loose loading, means stacking cartons directly on the container floor and against the walls, with no pallets.
          Palletizing means stacking cartons on pallets first and moving the pallets with a forklift. Each method has real advantages.
        </P>
        <P>
          Palletizing is faster to load and unload, and it protects the goods. But a pallet takes up space. A standard pallet adds around 5 to 6
          inches (about 14 cm) of height to every stack, and its fixed footprint can leave unused gaps along the container's width. Loose loading
          gives up speed and takes more labor, but it uses the full interior, so more cartons fit.
        </P>
        <P>
          This is why the calculator works with cartons directly against the container walls. The number you get shows how many loose boxes fit,
          with no pallet space taken out. That makes it the right tool for floor-loaded cargo and the best way to see how much volume you could
          gain by skipping pallets.
        </P>
        <P>
          If your cargo ships on pallets, plan the pallet first. The Tolz{" "}
          <Link to="/tools/pallet-calculator" className="inline-home-link">Pallet Calculator</Link> can help you work out how many cartons go on
          each pallet. Then take the loaded pallet's length, width and height, including the pallet itself, and enter them here as the package
          size to see how many pallets fit in the container. The Pallet Wide presets can help, since their wider interior is built for pallets. If
          you are comparing the two approaches, run the numbers both ways and weigh the extra cartons against the extra labor.
        </P>
      </Card>

      <Card title="Column Stacking vs. Interlocking (Brick) Patterns During Loading">
        <P>Once you have an arrangement, you still have to build it. There are two common ways to stack the layers.</P>
        <Lead lead="Column stacking">
          places each box directly over the one below, with the corners lined up. It carries weight straight down through the corners of the
          cartons, which is where corrugated boxes are strongest. It is also easy to count and easy for a crew to follow. The downside is that the
          stacks are not tied together, so they can lean or shift if the load is not tight.
        </Lead>
        <Lead lead="Interlocking, or brick, stacking">
          offsets each layer, like a brick wall, so the boxes in one layer overlap the ones below. This ties the load together and resists
          shifting, but it can reduce the stacking strength of the cartons because the corners no longer line up. It also needs row lengths that
          allow the offset.
        </Lead>
        <P>
          The calculator's arrangement instructions describe straight rows. Every package faces the same way, and each layer repeats the one below
          it, which makes it a column stack. If you switch to an interlocking pattern, expect the final count to differ a little from the
          calculator's number, since the offset can leave partial gaps at the walls.
        </P>
        <P>A few practical points apply to either pattern:</P>
        <List items={[
          ["", "Start at the back wall of the container and build row by row toward the door."],
          ["", "Put the heaviest cartons on the bottom and spread weight evenly along the floor, not all at one end."],
          ["", "Keep each stack square and tight to its neighbors."],
          ["", "Fill leftover gaps, especially near the door, with airbags or dunnage so nothing can fall out when the doors open."],
          ["", "Follow the box count and layer count from the calculator, and mark row positions on the floor if the crew needs guidance."],
        ]} />
        <P>
          For most uniform cartons in a closed container, column stacking with tight bracing is a solid default. If your boxes are not very
          strong, or the load will see a rough trip, an interlocking pattern may give better stability.
        </P>
      </Card>

      <Card title="How Much Weight Can a Shipping Container Support?">
        <P>
          Every container has a maximum payload, which is the weight of the cargo alone, not counting the container itself. According to Maersk's
          published cargo weight limits, maximum payload is about 28,300 kg (62,390 lb) for a 20ft container, 28,870 kg (63,650 lb) for a 40ft,
          28,690 kg (63,250 lb) for a 40ft high cube and 27,650 kg (60,957 lb) for a 45ft high cube. These figures vary by shipping line and by
          the individual container, so confirm the number for your booking.
        </P>
        <P>
          The road is often the tighter limit. Trucks and rail have their own weight rules, and in many places they cap the load well below what
          the container can legally carry on a ship. Ask your trucker or forwarder what the real limit is for your route.
        </P>
        <P>
          The calculator works from dimensions, so it does not check weight. Do a quick check yourself. Multiply the number of boxes by the weight
          of one box. At 392 cartons, a 20 kg carton gives 7,840 kg, which is well within the limit. A carton weighing 80 kg gives 31,360 kg,
          which is over it, even though every box fits. Dense goods such as tiles, machine parts and canned food usually hit the weight limit
          first, while light, bulky goods hit the volume limit first.
        </P>
      </Card>

      <Card title="When You Need a Container Loading Calculator">
        <P>This tool is most useful where space turns directly into money.</P>
        <Lead lead="Exporters and manufacturers.">
          Before you confirm a purchase order, find out whether it fills one 40ft container, fits a 20ft with room to spare or spills into a
          second container. That decision affects freight cost, delivery time and your quote to the buyer.
        </Lead>
        <Lead lead="Importers and buyers.">
          Knowing container capacity helps you set order quantities. Rounding an order up to fill a container often lowers the freight cost per
          unit.
        </Lead>
        <Lead lead="E-commerce sellers.">
          If you send inventory to a fulfillment network, you need to know how many cartons a container holds so you can plan production runs and
          inbound dates.
        </Lead>
        <Lead lead="Warehouse and logistics teams.">
          A layout plan helps the crew load faster and avoids arguments about whether the cargo should have fit.
        </Lead>
        <Lead lead="Packaging designers.">
          Test carton sizes against container sizes before you finalize a design. It costs far less than finding a poor fit after production.
        </Lead>
      </Card>

      <Card title="Choosing Between 20ft, 40ft and 45ft Containers">
        <P>
          A 20ft container suits dense, heavy cargo and smaller orders, and it is easier to move on roads and in tight yards. A 40ft container
          gives the best cost per cubic meter for light, bulky goods, which is why furniture, apparel and consumer products often ship in it. The
          high cube adds about 30 cm of height, which can add a full layer for shorter cartons. The 45ft high cube offers the most volume, but it
          is less widely available, and not every port, trucker or route handles it.
        </P>
        <P>
          The right choice is rarely obvious without numbers. Run the same carton through each size, compare utilization and layers, then check
          freight quotes. Sometimes two 20ft containers cost less than one 40ft, and sometimes one 40ft high cube holds an order that would
          otherwise need two.
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
