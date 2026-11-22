import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a dimensional weight calculator?", a: "It’s a tool that converts a package’s length, width and height into DIM weight using a carrier’s divisor, then compares that with the actual weight to show which one you’ll be billed for." },
  { q: "What is DIM weight?", a: "DIM weight, or dimensional weight, is a billing weight based on the space a package takes up instead of how heavy it is. Carriers use it so large, light boxes pay for their volume." },
  { q: "How do you calculate dimensional weight?", a: "Multiply length × width × height, round each side up, and divide by the carrier’s divisor, which is usually 139 in inches and pounds or 5,000 in centimeters and kilograms. Round the result up and compare it to the actual weight." },
  { q: "What is the DIM divisor for UPS, FedEx and USPS?", a: "UPS Daily Rates and FedEx use 139, UPS Retail Rates use 166, and USPS uses 139 for larger packages as of July 12, 2026. In metric, UPS and FedEx use 5,000. Negotiated contracts may differ." },
  { q: "Does USPS charge by weight or size?", a: "Both. USPS applies dimensional weight only to packages larger than 1,728 cubic inches (one cubic foot). Anything at or below that is billed on actual weight." },
  { q: "Does UPS or FedEx charge by weight or size?", a: "Both. They bill the greater of actual weight and dimensional weight, and they can apply dimensional pricing to small packages too." },
  { q: "How do I measure a package that isn’t a rectangle?", a: "Measure the longest point in each of the three directions, as if the package were inside the smallest rectangular box that would hold it, and enter those three numbers." },
  { q: "What is the largest package UPS, FedEx and USPS will accept?", a: "UPS and FedEx accept up to 150 lb, 108 inches in length and 165 inches in length plus girth. USPS accepts up to 70 lb and 130 inches in length plus girth on most services." },
  { q: "How do I find the shipping weight of a product?", a: "Weigh the packed package, including the box, padding and tape, then calculate its dimensional weight. The higher of the two is the shipping weight." },
  { q: "Why is my billed weight higher than the scale reading?", a: "The package’s volume probably produced a higher DIM weight than its actual weight, so you were billed on the larger figure." },
  { q: "Do carriers refund me if I overestimate the weight?", a: "Possibly. Carriers can correct a charge up or down after they measure the package, but corrections are more often charges than credits. Dispute any that look wrong, with photos as proof." },
  { q: "How can I avoid dimensional weight charges?", a: "Use a smaller box, reduce empty space, choose softer packaging, and compare carriers, since USPS skips DIM pricing for packages up to one cubic foot." },
  { q: "Is the Tolz dimensional weight calculator free?", a: "Yes. It’s free and doesn’t require a signup." },
];

// The supplied FAQ schema matches the list above with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const LIMIT_HEADERS = ["", "UPS", "FedEx", "USPS"];
const LIMIT_ROWS = [
  ["Max weight", "150 lb", "150 lb", "70 lb"],
  ["Max length", "108 in", "108 in (Ground)", "Set by length plus girth"],
  ["Max length plus girth", "165 in", "165 in", "130 in for most services"],
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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 380 }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{j === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>
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

export default function DimensionalWeightCalculatorFaqSection() {
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

      <Card title="What Is DIM Weight?">
        <P>
          DIM weight is short for dimensional weight. It’s also called volumetric weight. It’s a weight figure based on how much space a package
          takes up, not on what it weighs on a scale. The carrier converts the box’s volume into a pretend weight using a fixed number called the
          DIM divisor or DIM factor.
        </P>
        <P>
          Think about a floor lamp packed in a long, wide carton. It might weigh 8 pounds, but it fills as much space in a truck as a much heavier
          box. If carriers charged only by scale weight, that lamp would cost about the same to ship as a dense 8-pound box of books, even though
          it takes up several times the room. Starting around 2015, UPS and FedEx began applying dimensional pricing to ground packages of all
          sizes, and it has been a normal part of <Link to="/tools/freight-class-calculator" className="inline-home-link">shipping</Link> costs ever since.
        </P>
        <P>
          The carrier compares two numbers for every package: the actual weight and the DIM weight. The larger one becomes the billable weight,
          and the billable weight drives your price. If your box weighs 10 pounds but its DIM weight is 14, you pay for 14.
        </P>
      </Card>

      <Card title="Why Do Shipping Companies Charge by Weight and Not Just Size?">
        <P>
          Carriers don’t really choose one or the other. They charge for both, and the dimensional weight formula is how they combine them.
          Weight matters because heavier packages burn more fuel, strain equipment and need more labor to handle. Size matters because every
          vehicle, container and sorting belt has a fixed amount of space. A truck can be completely full while still being well under its
          weight limit if it’s loaded with bulky, light <Link to="/tools/pallet-calculator" className="inline-home-link">boxes</Link>.
        </P>
        <P>
          Billing the greater of actual weight and DIM weight protects the carrier in both cases. Dense, heavy boxes pay for their weight. Large,
          light boxes pay for the space they take. That’s why a calculator that shows both numbers side by side is the quickest way to see what
          you’ll really be charged.
        </P>
      </Card>

      <Card title="How to Use This Dimensional Weight Calculator">
        <P>
          Start by choosing your units, either in/lb or cm/kg. Then enter the length, width and height of the packed box and its actual weight,
          and click Calculate. The Clear button resets the fields so you can test another package.
        </P>
        <P>
          The results show your shipping weight and whether it’s the actual or the dimensional weight. A table below lists each carrier, the
          divisor it uses, the dimensional weight, and the weight you’ll be charged for. As an example, a 10 × 30 × 10 cm box weighing 20 kg has
          a volume of 3,000 <Link to="/tools/cbm-calculator" className="inline-home-link">cubic</Link> centimeters. Divided by 5,000, that’s 0.6 kg, which the table shows as 1 kg. The actual weight of 20 kg is
          higher, so you’re charged for 20 kg with both UPS and FedEx.
        </P>
        <P>
          Measure the finished package, not the product or the empty carton. Include any bulging, padding or tape, and measure the widest points.
          Carriers measure what they receive, and they round up. For best results, round each side up to the next whole inch or centimeter before
          you enter it. Keep your units consistent too: a length in centimeters with a weight in pounds will give you a meaningless answer.
        </P>
      </Card>

      <Card title="How Do You Calculate Dimensional Weight?">
        <P>The formula is simple:</P>
        <Formula>DIM weight = (length × width × height) ÷ DIM divisor</Formula>
        <P>
          The only thing that changes from carrier to carrier is the divisor. A smaller divisor gives a bigger DIM weight, which is worse for the
          shipper. Here’s how to do it by hand:
        </P>
        <List ordered items={[
          ["", "Measure the length, width and height of the packed box and round each up to the next whole unit."],
          ["", "Multiply the three numbers to get the volume."],
          ["", "Divide the volume by the carrier’s divisor."],
          ["", "Round the result up to the next whole pound or kilogram."],
          ["", "Compare it to the actual weight. The higher number is the billable weight."],
        ]} />
        <P>Here are four examples.</P>
        <Lead lead="Bulky and light.">
          A box measuring 22 × 14 × 10 inches and weighing 9 lb has a volume of 3,080 cubic inches. At a divisor of 139, that’s 22.16, which
          rounds up to 23 lb. The carrier bills 23 lb, not 9 lb. With a divisor of 166 (UPS Retail Rates), the same box comes to 18.55, rounded
          up to 19 lb, so the rate type matters.
        </Lead>
        <Lead lead="Dense and compact.">
          A 10 × 8 × 6 inch box weighing 5 lb has a volume of 480 cubic inches. At 139, that’s 3.45, rounded up to 4 lb. The actual weight is
          higher, so you’re billed for 5 lb.
        </Lead>
        <Lead lead="Rounding effect.">
          A box measured at 18.5 × 12.2 × 10 inches looks like 2,257 cubic inches. Rounded up to 19 × 13 × 10, it becomes 2,470 cubic inches, and
          2,470 ÷ 139 is 17.77, or 18 lb billable. Rounding applies to all three sides, so small decimals add up fast.
        </Lead>
        <Lead lead="Metric.">
          A box 50 × 40 × 30 cm has 60,000 cm³. Divided by 5,000, that’s 12 kg. If the parcel weighs 7 kg, you’re billed for 12 kg. In
          centimeters and kilograms, UPS and FedEx both use 5,000. Some older contracts and rate cards use 6,000, which is closer to the 166
          divisor, so use your carrier’s number if it’s different.
        </Lead>
      </Card>

      <Card title="Does USPS Charge by Weight or Size? Does UPS Ship by Weight or Size?">
        <P>All three carriers use a mix of weight and size, but they apply the size part differently.</P>
        <H3>UPS Dimensional Weight</H3>
        <P>
          UPS uses two divisors. Daily Rates use 139. These apply if you have a UPS account, schedule pickups or ship regularly. Retail Rates use
          166 and apply if you only ship now and then from a UPS Store or a UPS Customer Center. UPS rounds each dimension up to the next whole
          inch before multiplying and rounds the result up to the next whole pound. If you have a negotiated contract, check your agreement,
          because some specify a different divisor.
        </P>
        <H3>FedEx Dimensional Weight</H3>
        <P>
          FedEx uses 139 for inches and pounds on most domestic services and 5,000 for centimeters and kilograms. It rounds up like UPS, and it
          bills the greater of dimensional and actual weight. Both UPS and FedEx can apply dimensional pricing to small boxes, so even a compact,
          light parcel can be billed by volume.
        </P>
        <H3>USPS Dimensional Weight</H3>
        <P>
          USPS used to be the cheap option for bulky packages. Before mid-2019, it applied dimensional weight only for zones 5 and above, using a
          divisor of 194. In 2019, the rules changed and the divisor became 166. On July 12, 2026, USPS lowered it again to 139 for Priority Mail,
          Priority Mail Express, Ground Advantage and Parcel Select, and it began rounding fractional inches up. That matches UPS Daily Rates and
          FedEx.
        </P>
        <P>
          USPS still keeps one big advantage. It applies dimensional weight only to packages larger than one cubic foot (1,728 cubic inches). A box
          at or under that size is billed on actual weight, no matter how light it is.
        </P>
      </Card>

      <Card title="How Can I Know the Shipping Weight of a Product?">
        <P>
          The shipping weight is the billable weight of the whole package, not just the product. Start with the product’s weight, then add the
          box, the padding, the tape and any labels or inserts. Weigh the finished package on a scale, ideally one accurate to an ounce or better.
        </P>
        <P>
          Then calculate the DIM weight from the packed dimensions and compare the two. Whichever is higher is your shipping weight. The
          calculator does this comparison for you. For a product you haven’t packed yet, use the supplier’s carton size and add a little for
          padding, then run the numbers. Weigh and measure again once you have a real box, because a small change in size can change the
          billable weight.
        </P>
      </Card>

      <Card title="How Are Measurements for Non-Rectangular Packages Calculated?">
        <P>
          The formula needs three numbers, so carriers treat every package as if it were a rectangular box. For an irregular item like a tube, a
          bagged item, a chair or a bike, measure the longest point in each of the three directions, as if you were fitting the package inside
          the smallest rectangular box possible. Those three measurements are the ones that go into the calculator.
        </P>
        <P>
          For a bulging bag or a soft package, measure at the thickest point rather than the average. For a tube or cylinder, the length is the
          long side, and the width and height are both the diameter. A rounded or odd shape doesn’t earn a discount, because the empty corners of
          that imaginary box still take up space in the truck. Keep in mind that tubes, drums, pails and other packages not in a standard
          cardboard box can also trigger extra handling fees on top of the billable weight.
        </P>
      </Card>

      <Card title="How Do Parcel Delivery Companies Determine Package Shapes?">
        <P>
          You enter the dimensions when you buy a label, but carriers don’t take your word for it. Packages are scanned and measured by automated
          equipment as they move through sorting facilities, and USPS runs an Automated Package Verification check on weight and dimensions. If
          the measured size or weight differs from what’s on the label, the carrier can correct the charge.
        </P>
        <P>
          Carriers also sort packages into shape and size categories that affect surcharges. The main measurements are the longest side, the
          length plus girth, and increasingly the total cubic volume. Girth is the distance around the thickest part of the package, calculated as
          2 × width + 2 × height. To get length plus girth, add the length. For example, a 40 × 20 × 15 inch box has a length plus girth of 40 +
          40 + 30 = 110 inches. Packages that go past certain limits can be hit with Additional Handling, Large Package or Oversize surcharges,
          which are separate from dimensional weight.
        </P>
      </Card>

      <Card title="What Is the Largest Size or Weight UPS, FedEx and USPS Will Accept?">
        <DataTable headers={LIMIT_HEADERS} rows={LIMIT_ROWS} />
        <P>Some USPS services stop at 108 inches, and on Ground Advantage, parcels between 108 and 130 inches get an oversized price.</P>
        <P>
          Surcharges kick in well before these maximums. For instance, UPS adds a Large Package Surcharge for packages over 96 inches long or 130
          inches in length plus girth. Both UPS and FedEx also use cubic volume as a trigger now. Surcharge rules change often, so check the
          carrier’s current tables before shipping something big.
        </P>
      </Card>

      <Card title="How Do FedEx, UPS and USPS Compare for Similar Packages?">
        <P>
          Prices depend on the service, the distance (zone), the day and any surcharges, so no calculator can give a single price that holds
          everywhere. What you can compare is the billable weight, because it’s the starting point for every quote.
        </P>
        <P>
          Take a box measuring 18 × 14 × 12 inches and weighing 10 lb. The volume is 3,024 cubic inches. With a divisor of 139, the DIM weight is
          21.76, so UPS Daily Rates, FedEx and USPS all bill 22 lb. With UPS Retail Rates (166), it’s 18.22, so 19 lb is billed.
        </P>
        <P>
          Now take a smaller box, 12 × 10 × 8 inches, weighing 4 lb. The volume is 960 cubic inches, which is under one cubic foot. UPS and FedEx
          calculate a DIM weight of 6.9, or 7 lb, and bill 7 lb. USPS bills the actual 4 lb. That’s why USPS is often cheaper for small, light
          boxes, even after its divisor change.
        </P>
        <P>
          Also remember that UPS and FedEx typically add a residential delivery surcharge, while USPS does not charge extra for residential
          addresses. When you compare quotes, look at the total price, not just the billable weight.
        </P>
      </Card>

      <Card title="When You Need a DIM Weight Calculator">
        <Lead lead="Online sellers.">
          If you charge customers for shipping, an underestimate comes straight out of your margin. Calculate the DIM weight before you list bulky
          items like bedding, lamps, plastic goods and foam products.
        </Lead>
        <Lead lead="Choosing a carrier.">
          USPS skips dimensional pricing at or below one cubic foot and UPS and FedEx don’t, so the best carrier for a small light parcel may
          differ from the best one for a large parcel. Check the same package against each before you buy a label.
        </Lead>
        <Lead lead="Checking an invoice.">
          If a carrier billed you more than you expected, compare their billed weight to your own calculation. Re-measurement and rounding often
          explain the gap.
        </Lead>
        <Lead lead="Choosing packaging.">If you’re deciding between box sizes, compare each one’s billable weight.</Lead>
        <Lead lead="Moving or one-off shipping.">
          If you’re sending a large parcel to your family, returning an item or shipping goods abroad, it helps to know the number before you get
          a quote at the counter.
        </Lead>
      </Card>

      <Card title="How to Reduce Your Billable Weight">
        <P>
          Right-size the box first. Take the 22 × 14 × 10 inch box from earlier and cut it down to 21 × 13 × 9. That gives 2,457 cubic inches, or
          17.7, which rounds up to 18 lb billable. Compared with 23 lb, that’s a 5 lb drop from packaging changes alone.
        </P>
        <P>Other practical steps:</P>
        <List items={[
          ["", "Use poly mailers or soft packaging for items that don’t need a rigid carton."],
          ["", "Fill empty space with less bulk, such as paper or air pillows in place of an oversized box."],
          ["", "Compress soft goods where the product allows it."],
          ["", "Ship multiple items in one right-sized box when it saves volume."],
          ["", "Measure each box type once, write down the numbers and reuse them for quotes."],
        ]} />
        <P>
          Also stay under the surcharge limits. Very large packages can trigger Additional Handling or Large Package charges on top of billable
          weight, so keeping the box under those limits matters as much as the DIM number.
        </P>
      </Card>

      <Card title="Will I Get a Refund If I Overestimate a Package’s Weight?">
        <P>
          Sometimes, but you shouldn’t count on it. When you buy a label, you enter a weight and dimensions. The carrier later checks the package,
          and if its measurements don’t match your label, it can correct the charge. A correction can go either way. If the package was bigger or
          heavier than declared, you’re billed the difference. If it was smaller or lighter, USPS and other carriers can refund the difference,
          although with UPS and FedEx the adjustments you see are more often charges than credits.
        </P>
        <P>
          If you think a correction is wrong, dispute it through the carrier or the shipping platform where you bought the label, and keep photos
          of the package on a scale and with a tape measure. See this guide to{" "}
          <Ext href="https://www.shipstation.com/en-ca/blog/billing-adjustment-fedex-usps-ups/">UPS, USPS and FedEx billing adjustments</Ext> for
          common causes and how disputes work. The simplest way to avoid both overcharges and surprise bills is to enter accurate measurements to
          begin with.
        </P>
      </Card>

      <Card title="Accuracy, Privacy and Cost">
        <P>
          The calculator applies the standard dimensional formula with the carrier divisors described above, so the DIM weight you see should
          match what a carrier computes from the same measurements. It estimates billable weight only. Postage, zone, fuel surcharges and other
          fees are separate, and your final charge depends on your carrier agreement and on the size the carrier measures when it receives the
          package. If you have contract rates, confirm your divisor with your account representative.
        </P>
        <P>
          The tool is free to use and doesn’t ask you to create an account. You only enter package measurements and weight, and you aren’t asked
          for personal or payment details.
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
