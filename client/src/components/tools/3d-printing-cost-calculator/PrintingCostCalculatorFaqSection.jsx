import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate 3D printing cost?", a: "Add material cost and labor cost, then apply your markup. Material cost is the filament volume times its density times the price per unit of weight. Labor cost is print time times your hourly rate. Include electricity, wear and failures in your hourly rate." },
  { q: "Is 3D printing expensive?", a: "It depends on the job. One-off and custom parts are usually cheap compared with tooling-based methods, but large, slow prints get expensive because of machine time. Metal printing costs far more than plastic." },
  { q: "How much does 3D printing filament cost?", a: "Standard PLA, PETG and ABS typically run about $15 to $30 per kilogram. Specialty filaments such as TPU or carbon-fiber blends cost more. Use your actual spool price in the calculator." },
  { q: "How do I find the filament length for a print?", a: "Most slicers show the filament length and weight after slicing. If yours shows only weight, divide the weight by the grams-per-meter figure for your material and filament diameter." },
  { q: "Which materials does the calculator support?", a: "ABS, PLA, PETG, PETT, HIPS and TPU are built in. For anything else, choose the custom material option and enter the density." },
  { q: "Does the calculator include electricity costs?", a: "Not as a separate field. To include electricity, printer wear and failed prints, build them into your cost per hour." },
  { q: "Do I need to upload an STL file?", a: "No. You enter the filament length and print time from your slicer, so your model file stays on your device." },
  { q: "How much does 3D printing cost in different countries?", a: "Filament prices are similar worldwide, but labor, electricity and taxes vary. Choose your local currency in the calculator and use your own spool price and hourly rate." },
  { q: "Can I use it for metal 3D printing?", a: "No. It is built for filament printing and doesn’t cover powder-based metal processes. You can use the custom material option for metal-filled filament if you know its density." },
  { q: "What is a good markup for 3D prints?", a: "Many sellers use roughly 30 to 100% on standard parts and two to three times the cost on custom work. A 100% markup equals a 50% profit margin." },
  { q: "Is this 3D printing cost calculator free?", a: "Yes. It is free to use, and no signup is required to calculate a price." },
];

// The supplied FAQ schema rewords several answers, so it is kept verbatim here
// rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I calculate 3D printing cost?", a: "Add material cost (filament volume times density times price per unit of weight) and labor cost (print time times your hourly rate), then apply your markup. Include electricity, wear and failures in your hourly rate." },
  { q: "Is 3D printing expensive?", a: "It depends on the job. One-off and custom parts are usually cheap compared with tooling-based methods, but large, slow prints get expensive because of machine time. Metal printing costs far more than plastic." },
  { q: "How much does 3D printing filament cost?", a: "Standard PLA, PETG and ABS typically run about $15 to $30 per kilogram. Specialty filaments cost more." },
  { q: "How do I find the filament length for a print?", a: "Most slicers show filament length and weight after slicing. If yours shows only weight, divide the weight by the grams-per-meter figure for your material and filament diameter." },
  { q: "Which materials does the calculator support?", a: "ABS, PLA, PETG, PETT, HIPS and TPU are built in. For anything else, choose the custom material option and enter the density." },
  { q: "Does the calculator include electricity costs?", a: "Not as a separate field. Build electricity, printer wear and failed prints into your cost per hour." },
  { q: "Do I need to upload an STL file?", a: "No. You enter the filament length and print time from your slicer, so your model file stays on your device." },
  { q: "How much does 3D printing cost in different countries?", a: "Filament prices are similar worldwide, but labor, electricity and taxes vary. Choose your local currency and use your own spool price and hourly rate." },
  { q: "Can I use it for metal 3D printing?", a: "No. It is built for filament printing and does not cover powder-based metal processes. You can use the custom material option for metal-filled filament if you know its density." },
  { q: "What is a good markup for 3D prints?", a: "Many sellers use roughly 30 to 100 percent on standard parts and two to three times cost on custom work. A 100 percent markup equals a 50 percent profit margin." },
  { q: "Is this 3D printing cost calculator free?", a: "Yes. It is free to use and no signup is required to calculate a price." },
];

const MATERIAL_HEADERS = ["Material", "Full name", "Density (g/cm³)", "Approx. grams per meter (1.75 mm)"];
const MATERIAL_ROWS = [
  ["ABS", "Acrylonitrile Butadiene Styrene", "1.05", "2.5"],
  ["PLA", "Polylactic Acid", "1.27", "3.1"],
  ["PETG", "Polyethylene Terephthalate Glycol", "1.25", "3.0"],
  ["PETT", "T-Glase filament", "1.45", "3.5"],
  ["HIPS", "High Impact Polystyrene", "1.04", "2.5"],
  ["TPU", "Thermoplastic Polyurethane", "1.30", "3.1"],
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
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

export default function PrintingCostCalculatorFaqSection() {
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

      <Card title="What the 3D Printing Cost Calculator Measures">
        <P>
          The calculator estimates your total printing cost by combining material cost and labor cost, then applying a markup to calculate the
          selling price.
        </P>
        <P>
          Enter your material type (ABS, PLA, PETG, PETT, HIPS, TPU, or custom), filament diameter, and filament length. Then add the material
          price per unit of weight, printing time, hourly machine cost, and desired markup.
        </P>
        <P>You can choose your preferred units for filament length and printing time. The calculator automatically converts them.</P>
        <P>
          This gives you a clearer picture of what each print actually costs. Instead of counting only the filament used, you also account for
          machine time and profit.
        </P>
      </Card>

      <Card title="How to Use the 3D Printing Cost Calculator">
        <P>
          Start by slicing your model in Cura, PrusaSlicer, Bambu Studio, or OrcaSlicer. Note the estimated print time and filament usage.
        </P>
        <P>
          Enter your filament type, diameter, length, and spool price. If your slicer shows filament weight instead of length, use the
          grams-per-meter table to convert it. Then add the print time, hourly rate, and desired markup.
        </P>
        <P>Click Calculate to see your material cost, labor cost, and final price. Use Clear to reset the calculator.</P>
        <P>
          For accurate estimates: Add a few extra percent for purge and failed prints. Always recalculate when changing materials or print
          settings, as infill, layer height, and supports can significantly affect costs.
        </P>
      </Card>

      <Card title="How 3D Printing Cost Is Calculated: The Formulas">
        <P>The math is simple, and knowing it lets you check any quote you come across.</P>
        <Formula>
          Filament volume = π × (diameter ÷ 2)² × length<br />
          Material cost = volume × material density × price per unit of weight<br />
          Labor cost = printing time × hourly rate<br />
          Final price = (material cost + labor cost) × (1 + markup)
        </Formula>
        <P>
          Here is a worked example with illustrative numbers. A PLA print uses 40 meters (4,000 cm) of 1.75 mm filament. The filament volume is
          about 96.2 cm³, and with PLA’s density of 1.27 g/cm³ that comes to roughly 122 g. At $22 per kilogram, the material cost is about $2.69.
          The print takes 6 hours at $3 per hour, so labor is $18.00 and the base cost is about $20.69. A 30% markup adds about $6.21, which brings
          the final price to roughly $26.90. The plastic is the cheap part here; the machine hours are not, and that is typical for large, slow
          prints.
        </P>
      </Card>

      <Card title="Is 3D Printing Cost Efficient or Expensive?">
        <P>
          It depends on what you compare it to. For one-off parts, prototypes, replacement pieces and custom items, 3D printing is usually very
          cost efficient. There is no mold or tooling to pay for, only filament and machine time. For thousands of identical items, injection
          molding and other mass-production methods win on cost per unit, because the upfront tooling cost gets spread across a huge run.
        </P>
        <P>
          Within 3D printing itself, time is usually the expensive part. Filament for a typical part costs a few dollars, but a large part can run
          for a day or more. The printer, nozzles, build plates and failed prints add to the bill, which is why costs feel higher for people who
          print only now and then. The quickest way to judge a specific job is to price it. Enter your numbers, then compare the final price with
          what a store charges or a print service quotes.
        </P>
      </Card>

      <Card title="How Much Do 3D Printing Raw Materials Cost?">
        <P>
          Filament is cheaper than most people expect. Standard spools of PLA, PETG and ABS typically sell for roughly $15 to $30 per kilogram,
          while specialty materials such as TPU, PETT and carbon-fiber blends often cost more, sometimes several times as much. A 1 kg spool of 1.75
          mm PLA holds around 330 meters of filament, which covers many small and medium prints.
        </P>
        <P>
          Take a small plastic figure, like a toy soldier, as an example. If it weighs 10 grams, it uses about 22 cents of PLA at $22 per kilogram.
          A set of 50 uses about $11 in plastic. For small items like this, material is a minor cost, and print time and markup decide the price.
        </P>
        <P>
          The material you choose affects how much plastic a part uses, because density differs from one filament to the next. The table lists the
          densities built into the calculator, plus the approximate weight of one meter of 1.75 mm filament.
        </P>
        <DataTable headers={MATERIAL_HEADERS} rows={MATERIAL_ROWS} />
        <P>
          Most desktop printers use a process called{" "}
          <Ext href="https://en.wikipedia.org/wiki/Fused_filament_fabrication">fused filament fabrication</Ext>, and this calculator is built
          around it. Material choice also affects failure risk. ABS can warp without an enclosure, and PETG can string if it is damp, so a spool
          that looks cheaper per kilogram can cost more per good part once rejects are counted. If you use a filament that is not listed, choose the
          custom material option and enter its density.
        </P>
      </Card>

      <Card title="How Much Does 3D Printing Cost in the USA, UK, Italy, Canada, Australia, Germany and India?">
        <P>
          The cost of 3D printing varies across the USA, UK, Italy, Canada, Australia, Germany and India. The final price depends on several
          factors, including the material used, print time, labor, electricity and service fees.
        </P>
        <P>
          Although 3D printing materials such as PLA and PETG are available at relatively similar global prices, the cost of printing services can
          differ significantly between countries. This is mainly due to differences in labor costs, electricity rates and business overheads. As a
          result, professional 3D printing services in India are often more affordable than those in the USA, UK, Canada or Australia.
        </P>
        <P>
          Taxes can also affect the final cost. For example, the UK, Italy and Germany apply VAT, while Australia charges GST. In Canada, the
          applicable sales tax depends on the province.
        </P>
        <P>
          Use this calculator to estimate costs in your local market. Select your currency, enter the price of your filament spool and set your
          hourly labor rate. The calculator will use these values to estimate your printing costs. If you're considering outsourcing, compare your
          estimate with quotes from several local 3D printing services to find the most cost-effective option.
        </P>
      </Card>

      <Card title="How Much Does 3D Printing Cost at UPS and Other Print Shops?">
        <P>
          The UPS Store has offered 3D printing at select locations, but its stores are independently owned, so availability and pricing depend on
          the store and the job. Most retail shops quote after looking at your model, since size, material, print time and design work all change
          the price. Because fixed rates vary by store, call a nearby location or send your file for a quote.
        </P>
        <P>
          Retail and online print services usually cost more than printing at home. Their price includes the machine, staff, setup time, minimum
          order fees and profit, and design help is often billed separately. That doesn’t make them a bad deal. For a one-time part, a quote can be
          cheaper than buying a printer. For repeat jobs, work out your own cost with the calculator and see how far it sits below the quote.
        </P>
      </Card>

      <Card title="How Much Does 3D Metal Printing Cost?">
        <P>
          Metal printing costs far more than plastic filament printing. Industrial processes such as selective laser melting and binder jetting use
          metal powder and machines that can cost hundreds of thousands of dollars, so service bureaus commonly quote tens to thousands of dollars
          for a single part, depending on size and metal.
        </P>
        <P>
          This calculator is designed for filament, where you enter a filament diameter and length, so it does not cover powder-based metal
          processes. If you print with metal-filled filament on a regular printer, you can use the custom material option with the density from the
          manufacturer’s data sheet. Keep in mind that those parts often need extra steps, such as debinding and sintering, and the tool does not
          include those costs.
        </P>
      </Card>

      <Card title="Hidden Costs Most 3D Print Price Estimates Miss">
        <P>
          Material and labor give you a solid base, but a few smaller costs sit underneath every print. Electricity comes first. A typical desktop
          FDM printer averages somewhere around 100 to 200 watts while running, depending on bed and nozzle temperature, so a six-hour print can use
          roughly one kilowatt-hour. That is small per print, but it adds up across hundreds of prints.
        </P>
        <P>
          Machine wear is next. Nozzles, build plates, belts and fans have a limited life, and the printer itself loses value with every hour of
          use. Failed and test prints are a real cost too, and many sellers quietly absorb a failure rate of 5 to 10% and recover it in their
          prices. Then there is post-processing: removing supports, sanding, painting, assembling, packing and shipping all take time.
        </P>
        <P>
          The calculator has no separate field for these, so the cleanest approach is to fold them into your cost per hour. Set a rate that covers
          your time, electricity, wear and a failure allowance. You still get one transparent number, and your quotes stop depending on how
          smoothly a given week went.
        </P>
      </Card>

      <Card title="Choosing a Markup and Profit Margin">
        <P>
          Markup and margin are not the same thing, and mixing them up is a common pricing mistake. Markup is the percentage you add on top of cost.
          Margin is the share of the selling price that is profit. A 30% markup gives a margin of about 23%, and a 100% markup (doubling your cost)
          gives a 50% margin. If you want a 40% margin, you need a markup of about 67%.
        </P>
        <P>
          There is no single correct number. Simple production parts usually carry lower markups because volume makes up the difference. Custom
          one-offs justify much higher markups, since you are also selling design time, setup and risk. Many small sellers land on two to three
          times their base cost for custom work, then adjust based on what their market will pay. Use the markup field to test several levels and
          compare the results with similar listings.
        </P>
      </Card>

      <Card title="What Other Methods Reduce 3D Printing Cost Besides Hollowing?">
        <P>
          Hollowing a model or lowering infill is the first fix most people try, and it works because it cuts both filament and print time. Several
          other changes help just as much.
        </P>
        <P>
          Orient the part to avoid supports, which saves plastic and removes cleanup time. Use a larger nozzle and thicker layers for draft or
          functional prints, since fewer layers mean fewer hours. Scale the model down if it doesn’t need to be full size; volume drops fast when
          you shrink a part. Remove brims and rafts you don’t need, and print several parts on one plate to cut setup time per piece.
        </P>
        <P>
          On the material side, buy filament in bulk or during sales, and store it dry so it doesn’t go to waste. Use cheaper filament for test
          fits and save premium material for the final print. Finally, reduce failures through bed leveling, calibration and dry filament. A print
          that succeeds the first time is the cheapest print there is. Run the calculator before and after each change to see the savings in real
          currency.
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
