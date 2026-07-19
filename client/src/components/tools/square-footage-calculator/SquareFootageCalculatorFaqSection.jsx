import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate square footage of a room?",
    a: "Measure the length and width of the room in feet, then multiply them together. For rooms that aren't perfectly rectangular, break the space into simpler shapes like rectangles and triangles, calculate each area separately, and add them together, or use the L-shape or custom polygon option in this calculator to do it automatically.",
  },
  {
    q: "How do I convert square meters to square feet?",
    a: "Multiply the area in square meters by 10.764 to get square feet. This calculator handles the conversion automatically when you select your preferred unit system, so no manual conversion is needed.",
  },
  {
    q: "What's the difference between square footage and area?",
    a: "Square footage is simply area expressed in square feet as the unit of measurement. \"Area\" is the general geometric term, while \"square footage\" specifically refers to that area measured in feet, which is the standard unit used in flooring, real estate, and construction in the United States.",
  },
  {
    q: "Can I calculate the square footage of an irregularly shaped room?",
    a: "Yes. Use the L-shape option for rooms with one angled section, or the custom polygon option for more complex, multi-sided layouts. The calculator breaks these shapes into calculable segments or uses coordinate-based area formulas to return an accurate total.",
  },
  {
    q: "How much flooring do I need based on square footage?",
    a: "Calculate the total square footage of the room, then add roughly 5–10% extra to account for cutting waste, pattern alignment, and mistakes. Most flooring suppliers sell by the square foot or in boxes covering a set area, so this buffer helps avoid running short mid-installation.",
  },
  {
    q: "Is this square footage calculator free to use?",
    a: "Yes, the tool is completely free with no signup, subscription, or hidden charges. You can use it as many times as needed for personal or professional projects.",
  },
  {
    q: "Does this tool store my measurements or project data?",
    a: "No. Calculations are processed directly without storing or logging the dimensions you enter, so there's no project data retained after you close the page.",
  },
  {
    q: "What units does the square footage calculator support?",
    a: "The tool supports all major unit systems, including feet, inches, meters, and centimeters, letting you input and receive results in whichever unit fits your project.",
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

export default function SquareFootageCalculatorFaqSection() {
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
          Measuring space accurately is one of those tasks that seems simple until you're standing in an
          oddly shaped room with a tape measure, trying to figure out how much flooring to order. This square
          footage calculator, built by <Link to="/" className="inline-home-link">Tolz</Link>, removes the guesswork by letting you calculate the area of ten
          different shapes, rectangle, square, circle, triangle, trapezoid, ellipse, semi-circle, L-shape,
          ring, and custom polygon, in seconds. Whether you're flooring a living room, fencing a garden,
          pricing out a construction project, or listing a property for sale, this tool gives you precise,
          unit-flexible results without the manual math.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Square Footage Calculator Does</h2>
        <p style={pStyle}>
          At its core, this tool solves one problem: turning physical dimensions into an accurate area
          measurement, expressed in square feet or whatever unit system you prefer. Instead of memorizing
          separate formulas for a circle, a trapezoid, and an L-shaped room, you simply select the shape that
          matches your space, enter the relevant measurements, length, width, radius, base, height, or vertex
          coordinates for custom polygons, and the calculator returns the square footage instantly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool supports all major unit systems, so you can input measurements in feet, inches, meters, or
          centimeters and get output in the unit that's most useful to you. This matters because real-world
          projects rarely come with dimensions in a single, convenient unit. A blueprint might list
          measurements in meters while your flooring supplier quotes prices per square foot, and switching
          between the two by hand invites errors. Having a calculator that handles unit conversion internally
          removes that friction entirely.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Need a Square Footage Calculator</h2>
        <p style={pStyle}>
          Square footage isn't just a number for architects and contractors, it comes up constantly in
          everyday planning and decision-making.
        </p>
        <p style={pStyle}>
          <strong>Home renovation and flooring:</strong> Before ordering hardwood, tile, carpet, or vinyl
          flooring, you need the exact area of the room to avoid over-ordering (wasted money) or
          under-ordering (project delays). Most flooring is sold by the square foot or in boxes covering a
          fixed area, so an accurate measurement directly affects your budget.
        </p>
        <p style={pStyle}>
          <strong>Painting and wall coverage:</strong> While paint coverage is usually calculated from wall
          area rather than floor area, the same shape-based logic applies, knowing the precise dimensions of a
          wall, especially in rooms with angled or curved sections, helps you buy the right number of cans and
          avoid mid-project trips to the store.
        </p>
        <p style={pStyle}>
          <strong>Real estate and property listings:</strong> Buyers and sellers frequently need to verify or
          calculate the square footage of a room, unit, or lot, particularly when official documentation is
          outdated, missing, or disputed. An accurate independent calculation can support pricing decisions or
          clarify listing details.
        </p>
        <p style={pStyle}>
          <strong>Landscaping and outdoor projects:</strong> Calculating the area of a garden bed, patio, or
          lawn, especially when the space is circular, semi-circular, or irregularly shaped, helps determine
          how much sod, mulch, gravel, or paving material is needed.
        </p>
        <p style={pStyle}>
          <strong>Construction and remodeling estimates:</strong> Contractors and DIYers alike need square
          footage figures to estimate material quantities, labor costs, and project timelines. Irregular
          rooms, such as those with an L-shaped layout or a bay window, require breaking the space into
          calculable segments, which this tool handles directly through its L-shape and custom polygon
          options.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Tile and countertop projects:</strong> Kitchens and bathrooms often include curved or
          non-rectangular counter edges, sinks, or islands, making tools that support circles, ellipses, and
          rings particularly useful for estimating material needs accurately.
        </p>
      </div>

      {/* Formulas */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Square Footage Is Calculated for Each Shape</h2>
        <p style={pStyle}>
          Understanding the underlying formulas helps you trust the output and catch any measurement errors
          before they turn into costly mistakes.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Rectangle and Square:</strong> Area equals length multiplied by width. For a square, since
            all sides are equal, this simplifies to side length squared.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Circle:</strong> Area equals pi multiplied by the radius squared. If you only have the
            diameter, the calculator halves it automatically to determine the radius.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Triangle:</strong> Area equals half the base multiplied by the height, measured
            perpendicular to the base.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Trapezoid:</strong> Area equals half the sum of the two parallel sides, multiplied by the
            height between them.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Ellipse:</strong> Area equals pi multiplied by both the semi-major and semi-minor axes.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Semi-circle:</strong> Area equals half of the full circle's area, calculated from the
            radius.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>L-shape:</strong> The calculator splits the shape into two rectangles, calculates each
            area separately, and sums them, the same method used manually when estimating irregular rooms.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Ring (Annulus):</strong> Area equals the area of the outer circle minus the area of the
            inner circle, useful for circular pathways, pipes, or decorative borders.
          </li>
          <li>
            <strong>Custom Polygon:</strong> For irregular shapes that don't fit a standard formula, the
            calculator uses vertex coordinates and the shoelace formula to compute area precisely, regardless
            of how many sides the shape has.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Knowing which shape most closely matches your space, or how to break an irregular space into simpler
          shapes, is often the biggest source of measurement error. This calculator's shape-specific inputs
          are designed to guide you toward the correct formula without requiring you to identify or remember
          it yourself.
        </p>
      </div>

      {/* Getting accurate measurements */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting Accurate Measurements Before You Calculate</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator's output is only as accurate as the measurements you enter, so a few practical
          habits make a meaningful difference. Measure at floor level rather than at trim or baseboard height,
          since trim can slightly reduce usable floor space. For rooms with alcoves, closets, or bay windows,
          break the space into simpler shapes, typically rectangles and triangles, and use the L-shape or
          custom polygon option rather than forcing an irregular room into a single rectangle measurement,
          which tends to undercount area. When measuring circular or curved features, measuring the diameter
          is usually easier and less error-prone than trying to measure the radius directly, and the
          calculator adjusts for this automatically. Finally, double-check that all measurements are in the
          same unit before entering them, since mixing feet and inches without conversion is one of the most
          common sources of incorrect results.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Data Privacy, Accuracy, and Access</h2>
        <p style={pStyle}>
          All calculations run directly in your browser, meaning the dimensions you enter are not stored,
          logged, or transmitted anywhere for processing. There's nothing to upload and nothing saved on a
          server, so you can use the tool for personal or client projects without concern about where your
          project data ends up.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The square footage calculator is completely free to use, with no hidden charges, subscription
          requirements, or usage limits. It also requires no signup or account creation, you can open the
          page, enter your measurements, and get a result immediately. The formulas used follow standard
          geometric principles, so results are as accurate as the measurements you provide; the calculator
          itself introduces no rounding shortcuts or approximations beyond standard floating-point precision.
        </p>
      </div>

      {/* Recurring projects */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Making the Most of This Tool for Recurring Projects</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're working on a larger project involving multiple rooms or sections, such as flooring an
          entire home or landscaping several yard areas, it helps to calculate each section separately using
          the shape that matches it most closely, then add the totals together rather than trying to average
          or estimate a single combined shape. This section-by-section approach, especially for irregular
          layouts, consistently produces more accurate results than attempting to treat a whole floor plan as
          one uniform rectangle. For contractors preparing material orders, it's also worth calculating
          slightly beyond the exact square footage to account for cutting waste, pattern matching, or trim,
          since suppliers typically recommend ordering five to ten percent extra for flooring and tiling
          projects.
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
