import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many balusters do I need for a 10-foot railing?",
    a: "It depends on the width of your chosen baluster and your spacing method. For a typical 1.5-inch square baluster with standard 4-inch gaps, a 10-foot (120-inch) railing usually requires between 18 and 21 balusters, but the exact number changes based on post width and end margins. Enter your measurements into the calculator for a precise count.",
  },
  {
    q: "What is the standard spacing between balusters?",
    a: "Most codes require the clear gap between balusters to be no more than 4 inches, based on the sphere rule designed to prevent young children from passing through or getting stuck. The actual center-to-center spacing will be wider than 4 inches once you add the baluster's own width.",
  },
  {
    q: "Do stair railings need different spacing than deck railings?",
    a: "The maximum gap rule stays the same, but stair railings involve a sloped rake angle, which changes how spacing is measured and distributed compared to a level, straight railing. Some jurisdictions also apply a separate 6-inch rule to the triangular space at the base of a stair guard.",
  },
  {
    q: "Is the 4-inch rule the same in every state?",
    a: "The 4-inch sphere rule is standard under the IRC and IBC, which most U.S. states adopt as a baseline, but local amendments can make requirements stricter. Always verify with your local building department, especially for permitted or inspected projects.",
  },
  {
    q: "Can I use this calculator for glass or cable railings?",
    a: "This calculator is designed specifically for individual, evenly spaced balusters such as wood, metal, or composite spindles. Cable and glass panel systems follow different spacing logic and are not covered by this tool.",
  },
  {
    q: "Does the calculator account for post width?",
    a: "Yes. When you select equal end margins or fixed offset, the tool factors in the space taken by your starting and ending posts so the resulting layout reflects the actual usable run length, not just the raw railing measurement.",
  },
  {
    q: "Is this baluster calculator really free, and do I need to sign up?",
    a: "Yes, it's completely free with no signup, no downloads, and no hidden charges. You can run as many calculations as you need directly in your browser.",
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

export default function BalusterCalculatorFaqSection() {
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
          Building or replacing a railing sounds simple until you actually have to figure out how many
          balusters fit between two posts without violating local code. A single miscalculation means gaps
          that are too wide, spindles that look uneven, or a wasted trip back to the hardware store. This
          baluster calculator on <Link to="/" className="inline-home-link">Tolz</Link> removes that guesswork entirely, it takes your railing length, baluster
          width, and spacing preference, then returns the exact count, spacing, and layout you need, whether
          you're working on a straight deck railing or an angled stair run.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Baluster Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A baluster calculator is a purpose-built math tool that determines how many balusters (also called
          spindles or pickets) are required to fill a given railing span while keeping the gaps between them
          consistent and code-compliant. Instead of manually dividing railing length by baluster width and
          adjusting for post thickness, the calculator does the arithmetic instantly. It accounts for the
          total run length, the width of each baluster, the minimum and maximum gap allowed, and whether the
          railing is straight or follows a staircase. The output isn't just a single number, it includes the
          spacing between centers, the margin at each end, and often a cost estimate based on your chosen
          baluster type or pack size. For contractors quoting a job or homeowners planning a weekend build,
          this turns a slow manual process into a two-minute task.
        </p>
      </div>

      {/* 4-inch sphere rule */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding the 4-Inch Sphere Rule</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most residential and commercial railing codes in the United States, including the International
          Residential Code (IRC) and International Building Code (IBC), require that no gap in a guardrail
          allow a 4-inch sphere to pass through. This rule exists specifically to prevent young children from
          slipping through railing openings or getting their heads stuck between balusters. The 4-inch limit
          applies to the clear space between balusters, not the space including their width, which is a
          detail many DIY builders overlook when measuring by eye. Some jurisdictions apply stricter rules on
          stair railings, where the triangular opening formed by the tread, riser, and bottom rail is also
          restricted, typically to a 6-inch sphere. Because code requirements can vary slightly by state,
          county, or even specific inspector interpretation, this calculator defaults to the standard 4-inch
          maximum but allows you to adjust the value if your local code differs. Always confirm your exact
          local requirement with your building department before finalizing a purchase order, since the
          calculator provides mathematical guidance, not legal certification.
        </p>
      </div>

      {/* Layout methods */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Equal End Margins, Fixed Offsets, and Centered Layouts Explained</h2>
        <p style={pStyle}>
          Baluster spacing isn't just about hitting a maximum gap, it's about distributing that gap evenly so
          the finished railing looks intentional rather than patched together. This tool supports three common
          layout methods:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Equal End Margins</strong> spaces balusters so the gap at each end of the railing matches
            the gap between individual balusters as closely as possible. This is the most common approach for
            new builds because it produces a visually balanced result without requiring the first or last
            baluster to sit flush against a post.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Fixed Offset</strong> is used when you need a specific, non-negotiable distance from a
            post or wall to the first baluster, often because of an existing structural element, a rail
            bracket, or a design specification from an architect or HOA guideline. You set the offset, and the
            calculator distributes the remaining balusters within the leftover span.
          </li>
          <li>
            <strong>Centered Layout</strong> prioritizes symmetry around the midpoint of the railing section,
            which is useful for shorter runs, gates, or decorative panels where the visual center matters more
            than matching end margins exactly.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Choosing the right method up front prevents rework. Many first-time builders default to equal
          spacing without realizing a fixed offset is required because of an existing newel post or corner
          bracket; this calculator lets you test all three before committing to a material order.
        </p>
      </div>

      {/* Straight vs stair */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Straight Railings vs. Stair Railings</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Stair railings introduce a variable that straight deck or porch railings don't have: the rake angle.
          Because a staircase rises at a consistent slope, the vertical spacing between baluster tops changes
          even though the horizontal spacing along the stringer stays the same. A calculator built only for
          straight runs will give you the wrong baluster count or an inconsistent visual rhythm if applied
          directly to a stair section. This tool separates the two calculation modes so that stair users get
          spacing adjusted for the pitch of their staircase, while straight-railing users get a simpler linear
          calculation. If your project includes both a straight deck section and a connecting staircase,
          you'll want to run the calculation twice, once for each section, since they are structurally and
          visually distinct.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Baluster Calculator</h2>
        <p style={pStyle}>
          There are several practical situations where manually estimating baluster counts leads to costly
          mistakes:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Ordering materials for a new deck build.</strong> Contractors and homeowners need an
            accurate parts list before placing an order, since buying too few balusters means a delayed second
            shipment and buying too much wastes money on materials that can't always be returned.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Replacing a damaged or outdated railing.</strong> If you're swapping wood balusters for
            metal or composite ones, spacing often needs to be recalculated because the new material's width
            differs from the original.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Passing a home inspection or code review.</strong> Older railings built before current
            code updates frequently fail the 4-inch sphere test. Recalculating spacing before a sale or
            renovation avoids a failed inspection.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Quoting a client as a contractor.</strong> Fast, accurate material counts let you provide
            a firm price rather than a rough estimate, which matters when competing for bids.
          </li>
          <li>
            <strong>Custom or decorative railing design.</strong> Homeowners working with an architect or
            designer often need to verify that a proposed spacing pattern still meets code before finalizing
            the look.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, the calculator turns a task that normally involves a tape measure, a
          notepad, and several rounds of trial and error into a single, repeatable calculation.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Tolz Baluster Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Using the tool requires no technical background. Enter the total length of your railing run, the
          width of a single baluster, and your preferred spacing method (equal end margins, fixed offset, or
          centered). If you're calculating for a staircase, select stair mode and enter the additional
          measurements requested, such as tread depth or rake angle where applicable. The calculator instantly
          returns the total number of balusters needed, the exact center-to-center spacing, and the resulting
          gap size so you can confirm it stays under the 4-inch limit. If you'd like a cost estimate, enter a
          price per baluster, per pack, or per box, and the tool will calculate your total material cost based
          on the quantity required, useful for comparing suppliers or finalizing a budget before checkout.
        </p>
      </div>

      {/* Cost estimating */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Baluster Costs</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond spacing math, this calculator includes a pricing layer that many similar tools skip. Once you
          know the exact baluster count, material costs can vary significantly depending on whether you're
          buying individually, in bundled packs, or by the box. Entering a per-unit price gives you a
          straightforward total, but the pack and box options are particularly useful because most suppliers
          sell balusters in fixed quantities that rarely match your exact need; you'll often have to round up
          to the next full pack. Seeing that total cost immediately, rather than calculating it separately
          after getting your spacing numbers, helps you compare suppliers or material types (wood, metal,
          composite, glass) on a true apples-to-apples basis before you commit to an order.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Free Access</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is free to use, with no signup, account creation, or hidden fees required. All
          calculations run directly in your browser using the measurements you enter, no files are uploaded,
          stored, or shared, and no personal data is required to get a result. The math follows standard
          construction spacing formulas and the widely adopted 4-inch sphere guideline referenced in IRC and
          IBC code sections, giving you a reliable starting point for planning and material ordering. That
          said, because building codes can differ by jurisdiction and are periodically updated, it's good
          practice to confirm final spacing requirements with your local building department before purchasing
          materials or beginning construction, particularly for permitted work or projects that will be
          formally inspected.
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
