import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate square yards from square feet?",
    a: "Divide the total square footage by 9, since one square yard equals 9 square feet. This calculator does that conversion automatically once you enter your shape's dimensions, so you don't need to do the math by hand.",
  },
  {
    q: "What is the formula for square yards for a rectangular room?",
    a: "Multiply the length by the width in feet, then divide by 9 to get square yards. Simply enter your length and width into the rectangle option and the calculator returns the result instantly.",
  },
  {
    q: "How many square yards of sod do I need for my yard?",
    a: "Select the shape that best matches your yard (rectangle, L-shape, circle, or custom), enter your measurements, and the built-in sod estimator will convert the calculated area into the material quantity you need to order.",
  },
  {
    q: "Is carpet sold by square yards or square feet?",
    a: "Most carpet retailers price and cut carpet by the square yard rather than square feet, which is why an accurate square yardage figure is important before requesting quotes or placing an order.",
  },
  {
    q: "Can this tool calculate irregular or L-shaped areas?",
    a: "Yes. The L-shape option lets you calculate combined rectangular sections for irregular rooms or yards, and the custom shape option offers additional flexibility for spaces that don't match a standard geometric layout.",
  },
  {
    q: "Do I need to sign up or pay to use this calculator?",
    a: "No. The square yards calculator is completely free with no signup required, and you can use it as many times as you need for different projects.",
  },
  {
    q: "How accurate is the square yards calculator for material estimation?",
    a: "The tool calculates area based on the exact measurements you enter, so accuracy depends on how precisely you measure your space. For best results, measure length, width, radius, or base/height carefully before entering values.",
  },
  {
    q: "What materials can I estimate with this calculator besides area?",
    a: "Alongside area calculation, the tool includes a material estimator for sod, carpet, tile, mulch, gravel, and artificial grass, helping you translate your square yardage into a practical order quantity.",
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

export default function SquareYardsCalculatorFaqSection() {
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
          Whether you're laying new sod, ordering carpet, or estimating tile for a renovation, getting your
          area measurement right in square yards saves you money and prevents costly material shortages. The
          square yards calculator on Tolz lets you work out the exact area of almost any space, from a simple
          rectangular room to a curved garden bed, in seconds, without any manual formulas or unit
          conversions. It's built for homeowners, contractors, landscapers, and flooring installers who need a
          fast, accurate number they can trust before placing an order.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Square Yards Calculator and Why It Matters</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A square yards calculator converts the dimensions of a space into a single area figure measured in
          square yards, which is the standard unit used across the flooring, carpet, sod, and landscaping
          industries in the United States. While square feet is common for general home measurements, most
          material suppliers price carpet, turf, and sod by the square yard, so converting your measurements
          correctly is essential before you buy. Getting this conversion wrong, even by a small margin, can
          mean ordering too little material and facing a mid-project shortage, or over-ordering and wasting
          money on excess product. This tool removes that risk by calculating the area directly in square
          yards for ten different shape types, so you never have to manually convert square feet to square
          yards or second-guess a formula.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Square Yards Calculator Works</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Using the calculator is straightforward. Select the shape that matches your space, enter the
          required measurements (such as length and width, radius, or base and height depending on the
          shape), and the tool instantly returns the area in square yards. There's no need to memorize
          geometry formulas or perform manual unit conversions, the calculator handles rectangles, squares,
          circles, triangles, trapezoids, ellipses, semi-circles, L-shapes, rings, and custom configurations,
          covering nearly every real-world space you'll encounter in a home or outdoor project. For rooms or
          yards that aren't a single clean shape, the L-shape and custom options let you account for irregular
          layouts without needing to break the space into multiple separate calculations yourself.
        </p>
      </div>

      {/* Shapes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Area for Different Shapes</h2>
        <p style={pStyle}>
          Each shape type follows its own geometric logic, and the calculator applies the correct formula
          automatically based on your selection.
        </p>
        <p style={pStyle}>
          For a <strong>rectangle or square</strong>, the calculator multiplies length by width to get the
          area, then converts that figure into square yards. This is the most common calculation for
          bedrooms, living rooms, and rectangular patios.
        </p>
        <p style={pStyle}>
          For a <strong>circle</strong>, the tool uses the radius to calculate area using standard circular
          area principles, which is useful for round garden beds, circular patios, or fire pit areas where you
          need to estimate gravel or mulch coverage.
        </p>
        <p style={pStyle}>
          A <strong>triangle</strong> calculation is based on the base and height of the shape, which comes in
          handy for triangular yard sections or oddly angled rooms created by bay windows or angled walls.
        </p>
        <p style={pStyle}>
          <strong>Trapezoids and ellipses</strong> require two different measurements along their parallel or
          major/minor axes, and the calculator handles both without requiring you to look up the formula
          yourself; this matters for garden beds, pool surrounds, and non-rectangular room extensions.
        </p>
        <p style={pStyle}>
          A <strong>semi-circle</strong> works similarly to a circle but accounts for only half the area,
          which is common for rounded porch steps, semi-circular driveways, or garden borders.
        </p>
        <p style={pStyle}>
          The <strong>ring shape</strong> (also called an annulus) calculates the area between two circles, an
          outer and inner radius, which is particularly useful for circular flower beds with a center cutout,
          or decorative paving around a fixed feature like a tree or fountain.
        </p>
        <p style={pStyle}>
          <strong>L-shaped areas</strong> are calculated by combining two rectangular sections, making this
          option ideal for rooms with closets, hallways, or extensions, as well as yards with irregular
          boundaries.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Finally, the <strong>custom shape</strong> option gives you flexibility when your space doesn't fit
          neatly into any standard geometric category, allowing you to input measurements that reflect the
          actual footprint of your project.
        </p>
      </div>

      {/* Material estimation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Material Estimation: From Area to Order Quantity</h2>
        <p style={pStyle}>
          Knowing your area in square yards is only half the equation, the next step is figuring out how much
          material to actually purchase. This calculator includes a built-in material estimator covering six
          of the most commonly ordered materials: sod, carpet, tile, mulch, gravel, and artificial grass. Once
          your area is calculated, the estimator translates that figure into a practical material quantity,
          helping you avoid the common mistake of ordering based on rough guesswork.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For sod and artificial grass, area in square yards is the direct unit most turf suppliers use for
          pricing and delivery, since sod is typically sold and rolled by the square yard. For carpet, most
          retailers also quote and cut carpet by the square yard rather than square feet, so an accurate
          square yardage figure is critical to avoid buying an odd-sized remnant or running short
          mid-installation. Tile is usually priced by square footage, but knowing your square yardage is still
          useful for cross-checking supplier quotes and comparing bulk pricing. For mulch and gravel, area
          feeds into volume calculations once you factor in depth, helping you estimate how many bags or
          truckloads you'll need for a landscaping project.
        </p>
      </div>

      {/* Practical scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Practical Scenarios: When You'd Use This Tool</h2>
        <p style={pStyle}>
          There are several everyday situations where knowing your square yardage accurately makes a real
          difference:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>Ordering new carpet or flooring for a bedroom, living room, or entire home before getting installation quotes from contractors.</li>
          <li style={{ marginBottom: 6 }}>Installing sod or artificial grass in a backyard, front lawn, or sports court area where suppliers price and deliver by the square yard.</li>
          <li style={{ marginBottom: 6 }}>Planning a landscaping project that involves mulch or gravel beds around trees, pathways, or garden borders with curved or irregular edges.</li>
          <li style={{ marginBottom: 6 }}>Budgeting a renovation where you need to compare material costs per square yard across multiple suppliers before committing.</li>
          <li style={{ marginBottom: 6 }}>Estimating tile for a kitchen or bathroom remodel, especially when the room includes an L-shaped layout or an island that breaks up the floor space.</li>
          <li style={{ marginBottom: 6 }}>Preparing for a real estate listing or appraisal where accurate square yardage of outdoor space adds context to a property description.</li>
          <li>Calculating fabric, turf, or paving material for shapes with curves, such as a circular patio or a ring-shaped flower bed around a fixed structure.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, manually measuring, converting, and calculating areas introduces room for
          error, a small mistake in a formula can lead to an incorrect order and wasted money. Using a
          dedicated square yards calculator removes that risk and gives you a number you can act on
          immediately.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Accuracy Matters for Home and Landscaping Projects</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Material suppliers rarely offer partial refunds on unused sod, carpet, or turf, and running short
          mid-project usually means a second delivery fee, a mismatched dye lot for carpet, or a delay while
          you wait for more material to arrive. Because most flooring and landscaping materials are sold in
          fixed-width rolls or bulk units, even a modest miscalculation in square yardage can result in
          significant waste or a frustrating gap in coverage. A precise area calculation, broken down by the
          correct shape type, gives contractors and homeowners a reliable baseline for ordering the right
          amount the first time, which is especially valuable on larger projects where material costs
          represent a significant part of the overall budget.
        </p>
      </div>

      {/* Free & private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Ready to Use</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This square yards calculator is completely free to use, with no signup, account creation, or hidden
          charges required at any step. You can calculate area and material estimates as many times as needed
          for different rooms, shapes, or projects without restrictions. The tool processes your measurements
          directly in your browser to generate results, so there's no need to submit personal information or
          wait for a response, you get your square yardage and material estimate instantly, every time you use
          it.
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
