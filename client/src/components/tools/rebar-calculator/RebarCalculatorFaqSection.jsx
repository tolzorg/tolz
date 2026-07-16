import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the weight of rebar?",
    a: "Rebar weight is calculated by multiplying the total length of bar required by the standard unit weight for that specific bar size (weight per foot or per meter). Since unit weight varies by size, a #8 bar weighs significantly more per foot than a #3 bar, the size selected has a major impact on total weight. The calculator applies the correct standard unit weight automatically once you select your bar size.",
  },
  {
    q: "How much rebar do I need for a 10x10 slab?",
    a: "It depends on your chosen bar spacing and size. For a typical residential slab using #3 or #4 bars on 16\" or 18\" spacing in both directions, you'd generally need a grid of roughly 7–8 bars running each way for a 10-foot span, though exact quantities shift with spacing and cover requirements. Entering your slab dimensions and spacing into the calculator gives an exact bar count and total length rather than a rough estimate.",
  },
  {
    q: "What is the difference between US and metric rebar sizes?",
    a: "US rebar sizes are numbered based on diameter in eighths of an inch (a #4 bar is about ½ inch across), while metric sizes are labeled directly by diameter in millimeters (such as 12mm or 16mm). The two systems don't convert to exact round numbers, so it's important to select the correct standard for your project rather than approximating between them.",
  },
  {
    q: "How is rebar priced, by weight or by length?",
    a: "Rebar can be priced either way depending on the supplier and order size. Large orders are often priced per ton or per kilogram, while smaller retail purchases are frequently priced per individual bar length. The calculator supports entering a price per unit that matches whichever pricing method your supplier uses.",
  },
  {
    q: "Does rebar spacing affect the amount of steel I need?",
    a: "Yes, significantly. Tighter spacing (for example, 12 inches instead of 18 inches) increases the number of bars required across the same area, which directly increases both total weight and cost. Spacing is usually set by structural requirements or local building code, so it's worth confirming your required spacing before estimating quantities.",
  },
  {
    q: "Is this rebar calculator accurate enough for professional estimating?",
    a: "The calculator uses standard industry unit weights for each bar size and performs the same length and weight calculations an estimator would do manually, making it reliable for preliminary budgeting, quote verification, and bid preparation. For final structural sign-off, quantities should still be confirmed against your project's engineering drawings.",
  },
  {
    q: "Do I need to create an account to use the rebar calculator?",
    a: "No. The tool is free to use directly in your browser with no signup, login, or payment required, and there are no limits on how many times you can run a calculation.",
  },
  {
    q: "Can I use this calculator for both slabs and vertical elements like columns or walls?",
    a: "Yes. The calculator works for any concrete element where you can define a bar length and spacing, including slabs, footings, foundation walls, columns, and beams; simply adjust the dimensions and bar configuration to match the specific element you're estimating.",
  },
];

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
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)",
        }}>
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

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

export default function RebarCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Ordering the right amount of reinforcement steel is one of the easiest places for a construction
          budget to go wrong, too little rebar compromises structural integrity, while too much wastes money
          on unused steel. The Rebar Calculator on Tolz removes the guesswork by instantly converting your
          slab, footing, wall, column, or beam dimensions into precise rebar weight, total length, and
          estimated material cost. Whether you're a contractor pricing a job, an estimator double-checking a
          supplier's quote, or a homeowner planning a small foundation pour, this calculator gives you numbers
          you can act on in seconds, without opening a spreadsheet or memorizing bar weight tables.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Rebar Calculator Works</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool is built around three calculation modes, so you can work from whichever information you
          already have on hand. In the first mode, you enter the dimensions of your concrete element, length,
          width or depth, and bar spacing, and the calculator determines how many rebar pieces are required
          and their total combined length. In the second mode, you can calculate directly from a known
          quantity of bars and their individual lengths, useful when you're verifying a materials list a
          supplier has already sent you. The third mode focuses on weight and cost: once the total length is
          known, the calculator applies the correct unit weight for your selected bar size to output total
          rebar weight, and then multiplies that by your entered price per unit (per kilogram, per ton, or per
          length) to generate an instant cost estimate. Because the calculator supports both US customary bar
          sizes (#3 through #11) and metric bar sizes (10mm through 32mm), it works whether your project
          specifications, drawings, or supplier quotes are in imperial or metric units, a common pain point on
          international or mixed-standard projects.
        </p>
      </div>

      {/* Why needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You'd Need a Rebar Calculator</h2>
        <p style={pStyle}>
          Reinforcement steel calculations come up constantly across residential and commercial construction,
          and getting them right the first time saves both money and rework. A few common scenarios where
          this tool becomes essential:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Estimating a concrete slab pour.</strong> Before pouring a driveway, patio, or floor slab,
            you need to know how much rebar grid material to order based on your slab dimensions and chosen
            spacing (commonly 12", 16", or 18" on center, or 300mm/400mm in metric projects).
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Sizing footings and foundations.</strong> Footings often require specific bar
            configurations based on load requirements from an engineer's drawing. Converting those specs into
            an actual steel order, and a dollar figure, is exactly what this calculator handles.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pricing out walls, columns, and beams.</strong> Vertical elements like foundation walls
            and columns typically use vertical and horizontal bar combinations. Estimating total length across
            multiple bar runs by hand is time-consuming and error-prone; the calculator does it instantly.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Checking supplier quotes.</strong> Contractors frequently use this tool as a sanity check,
            plugging in the same dimensions a supplier used to confirm that a quoted weight and price actually
            line up with the job specs, catching overcharges or measurement errors before signing off.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Bidding and budgeting.</strong> For contractors preparing multiple bids, quickly running
            rebar quantities and costs across several project scenarios makes it possible to compare options
            and adjust bar spacing or size to hit a target budget without recalculating everything manually.
          </li>
          <li>
            <strong>Learning and DIY projects.</strong> Homeowners and students working on smaller pours, a
            shed foundation, a small retaining wall, often need a way to translate basic dimensions into a
            materials list without prior estimating experience.
          </li>
        </ul>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Rebar Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Using the tool takes only a few steps. First, select your calculation mode based on what
          information you're starting with, dimensions, known bar count, or weight/cost only. Next, choose
          your rebar size from the US or metric size list; this determines the unit weight the calculator
          applies. Then enter your project measurements, such as the slab length and width or the footing run
          length, along with your desired bar spacing. If you want a cost figure, enter your local price per
          unit, this can usually be found on a recent supplier invoice or current market rate. The calculator
          instantly displays the number of bars required, total linear length, total weight, and estimated
          cost, all recalculated in real time as you adjust any input. This live recalculation is particularly
          useful for comparing scenarios, such as seeing how switching from 16" to 12" spacing changes both
          material weight and price before committing to an order.
        </p>
      </div>

      {/* Size reference */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rebar Size and Weight Reference</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Accurate rebar weight depends entirely on selecting the correct bar size, since weight per linear
          foot or meter varies significantly across the size range. In the US system, bar sizes are numbered
          based on their diameter in eighths of an inch, a #4 bar is roughly ½ inch in diameter, while a #8
          bar is a full inch. Smaller bars like #3 and #4 are common in residential slabs and light footings,
          while #6 through #11 bars are typically reserved for structural elements such as foundation walls,
          columns, and beams carrying heavier loads. Metric bar sizes follow a similar logic, denoted by
          diameter in millimeters, 10mm and 12mm bars cover most light-duty applications, while 20mm, 25mm,
          and 32mm bars are used in heavier structural work. Because weight per unit length increases roughly
          with the square of the diameter, doubling the bar size does not simply double the weight, it can
          increase it three to four times over. This is exactly why manual weight calculations are so easy to
          get wrong, and why the calculator applies the precise standard unit weight for each size
          automatically rather than relying on rounded approximations.
        </p>
      </div>

      {/* Cost estimation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Rebar Cost Accurately</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Material cost is rarely as simple as multiplying weight by a flat steel price, and this calculator
          is built to reflect that. Rebar is commonly priced per ton, per kilogram, or per individual length
          depending on your supplier and region, so the tool allows you to enter cost in whatever unit matches
          your quote. For larger jobs, pricing per ton tends to be more standard and can fluctuate with
          regional steel market conditions, so it's worth cross-checking your rate against a recent invoice
          rather than an outdated figure. It's also worth remembering that a rebar cost estimate covers
          material only, cutting, bending, delivery, and installation labor are typically priced separately
          and should be added when building a full project budget. Running the same project through the
          calculator at a couple of different price points is a fast way to see how sensitive your total cost
          is to steel price changes, which is particularly useful when steel markets are volatile.
        </p>
      </div>

      {/* Spacing/cover/lap */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Spacing, Cover, and Lap Length Considerations</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond raw weight and cost, a few structural details affect how much rebar you actually need to
          order, and it helps to understand them before entering your inputs. Bar spacing, the center-to-center
          distance between parallel bars, is usually specified by an engineer or local building code and
          directly determines how many bars fit across a given slab or wall dimension; tighter spacing means
          more bars and more weight. Concrete cover, the distance between the rebar and the outer surface of
          the concrete, doesn't change the calculator's weight output directly but does affect how you measure
          your usable slab or footing dimension, since bars are placed inside the cover zone rather than at
          the very edge. Lap length, the amount by which two bars overlap when tying them together to form a
          continuous run, adds extra material beyond the raw span length; on longer runs that require multiple
          bar lengths, factoring in a reasonable lap allowance keeps your material estimate from running
          short. These are worth accounting for in your input dimensions so the resulting weight and cost
          figures reflect what you'll actually need to order, not just the theoretical minimum.
        </p>
      </div>

      {/* Free */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Accurate, and Ready When You Need It</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The Rebar Calculator is completely free to use, with no signup, account creation, or hidden charges
          required at any step. All calculations run instantly in your browser using standard industry unit
          weights for both US and metric bar sizes, so results are consistent and repeatable every time you
          use the tool. Because no project data, dimensions, or pricing information you enter is stored or
          shared, you can run sensitive job estimates or client-specific figures without concern. Whether
          you're pricing a single footing or comparing bar sizes across an entire project, the calculator is
          built to be used as often as needed, with no limits on how many calculations you run.
        </p>
      </div>

      {/* FAQ */}
      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 6 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
