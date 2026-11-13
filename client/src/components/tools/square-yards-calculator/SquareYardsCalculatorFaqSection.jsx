import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate square yards from square feet?",
    a: "Divide the square footage by 9, since one square yard equals 9 square feet. The calculator does this for you once you enter your dimensions.",
  },
  {
    q: "What is the formula for square yards for a rectangular room?",
    a: "Multiply length by width in feet, then divide by 9. A 12 ft × 15 ft room is 180 sq ft, or 20 square yards.",
  },
  {
    q: "How many square feet are in a square yard?",
    a: "Nine. The number 27 applies only to cubic yards.",
  },
  {
    q: "How many square yards of sod do I need for my yard?",
    a: "Choose the shape that fits your yard, enter the measurements, and the sod estimator gives you the quantity. It’s a good idea to add about 5% for cuts and edges.",
  },
  {
    q: "Is carpet sold by square yards or square feet?",
    a: "Most carpet retailers price and cut carpet by the square yard, while tile, hardwood, vinyl, and laminate are usually sold by the square foot.",
  },
  {
    q: "Can this tool calculate irregular or L-shaped areas?",
    a: "Yes. The L-shape option combines two rectangles, and the custom option handles layouts that don’t match a standard shape.",
  },
  {
    q: "How many square yards are in an acre?",
    a: "4,840.",
  },
  {
    q: "How many square yards make one square meter?",
    a: "1.19599 square yards.",
  },
  {
    q: "How many square meters are in one square yard?",
    a: "About 0.8361.",
  },
  {
    q: "Do I need to sign up or pay to use this calculator?",
    a: "No. It’s free, with no signup, and you can use it as often as you need.",
  },
  {
    q: "How accurate is the calculator for material estimation?",
    a: "It calculates from the exact numbers you enter, so accuracy depends on how carefully you measure. Measure twice and add a small waste allowance.",
  },
  {
    q: "What materials can I estimate besides area?",
    a: "Sod, carpet, tile, mulch, gravel, and artificial grass.",
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
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const last = { ...pStyle, marginBottom: 0 };
const firstH3 = { ...h3Style, marginTop: 0 };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What is a square yard */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Square Yard?</h2>
        <p style={last}>
          A square yard is a unit of area equal to a square that measures 1 yard (3 feet) on every side. It’s the
          standard unit for carpet, turf, and fabric in the United States, and it’s also used for land measurement in
          countries like India and Pakistan. If you picture a square about as wide as a kitchen counter is tall, that’s
          roughly one square yard.
        </p>
      </div>

      {/* Square feet in a square yard */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Many Square Feet Are in a Square Yard?</h2>
        <p style={pStyle}>
          One square yard equals 9 square feet. The reason is simple: a yard is 3 feet long, and the area multiplies two
          sides together, so 3 × 3 = 9.
        </p>
        <p style={last}>
          You may see “27” mentioned in this context, but that number belongs to cubic measurements. A cubic yard holds
          27 cubic feet (3 × 3 × 3). Square yards measure flat surfaces, and cubic yards measure volume, so the two are
          not interchangeable.
        </p>
      </div>

      {/* Square yards vs square feet */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Difference Between Square Yards and Square Feet?</h2>
        <p style={last}>
          Both measure area, just at different scales. A square foot is a 1-foot by 1-foot square, and a square yard is
          nine of them. Square feet are the usual choice for home sizes, tile, hardwood, and real estate listings. Square
          yards are more common for carpet, sod, turf, and land in some countries. Using the wrong one in an order is a
          common and expensive mistake, so always check which unit your supplier quotes.
        </p>
      </div>

      {/* How to calculate */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Square Yards</h2>
        <p style={pStyle}>
          To work out square yards, measure the space in feet, find the area in square feet, and divide by 9.
        </p>
        <p style={pStyle}>
          <strong>Formula:</strong> Square yards = square feet ÷ 9
        </p>
        <p style={pStyle}>
          If you measure in yards instead, multiply length by width and you already have square yards. If you measure in
          inches, convert to feet first by dividing by 12.
        </p>
        <h3 style={h3Style}>How to Convert Square Feet to Square Yards</h3>
        <p style={pStyle}>
          Divide the square footage by 9. A 450-square-foot room is 450 ÷ 9 = 50 square yards. To go the other way,
          multiply square yards by 9.
        </p>
        <h3 style={h3Style}>How to Calculate Square Yards from Length and Width</h3>
        <p style={pStyle}>
          Multiply length by width, then divide by 9 (if both are in feet). A room that’s 15 feet by 12 feet is 180
          square feet, which is 20 square yards. If you have feet and inches, such as 12 feet 6 inches, convert the
          inches to a decimal first: 6 ÷ 12 = 0.5, so the measurement is 12.5 feet.
        </p>
        <p style={pStyle}>
          You can’t avoid arithmetic when converting feet and inches, but you can avoid doing it by hand. Enter your
          numbers into the calculator and it handles the conversion. If you don’t have a tape measure, you can estimate
          with your stride (an average adult step is about 2.5 feet), but treat that as a rough guess, not a number to
          order materials from.
        </p>
        <h3 style={h3Style}>Quick Examples</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            100 square feet is 11.11 square yards. If it’s a 10 ft × 10 ft area, each side is 3.33 yards.
          </li>
          <li>20 feet by 20 feet is 400 square feet, or 44.44 square yards.</li>
        </ul>
        <h3 style={h3Style}>How to Convert Yards to Square Yards</h3>
        <p style={pStyle}>
          You can’t convert a single length into an area. A yard is a length, and a square yard is an area, so you need
          a second measurement. Multiply the length in yards by the width in yards. A strip 10 yards long and 2 yards
          wide is 20 square yards.
        </p>
        <h3 style={h3Style}>How to Convert Square Yards to Linear Feet</h3>
        <p style={last}>
          This also needs a width. Linear feet = (square yards × 9) ÷ width in feet. For example, 20 square yards of
          carpet cut from a roll 12 feet wide covers (20 × 9) ÷ 12 = 15 linear feet of roll.
        </p>
      </div>

      {/* How the calculator works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Square Yards Calculator Works</h2>
        <p style={pStyle}>
          Pick the shape that matches your space, enter the measurements it asks for (such as length and width, radius,
          or base and height), and the tool returns the area in square yards right away. It supports rectangles,
          squares, circles, triangles, trapezoids, ellipses, semi-circles, L-shapes, rings, and custom shapes.
          Everything is calculated in your browser, so there’s nothing to submit or wait for.
        </p>
        <h3 style={h3Style}>Calculating Area for Different Shapes</h3>
        <p style={pStyle}>
          Each shape type follows its own geometric logic, and the calculator applies the correct formula automatically
          based on your selection.
        </p>
        <p style={pStyle}>
          For a <strong>rectangle or square</strong>, the calculator multiplies length by width to get the area, then
          converts that figure into square yards. This is the most common calculation for bedrooms, living rooms, and
          rectangular patios.
        </p>
        <p style={pStyle}>
          For a <strong>circle</strong>, the tool uses the radius to calculate area using standard circular area
          principles, which is useful for round garden beds, circular patios, or fire pit areas where you need to
          estimate gravel or mulch coverage.
        </p>
        <p style={pStyle}>
          A <strong>triangle</strong> calculation is based on the base and height of the shape, which comes in handy
          for triangular yard sections or oddly angled rooms created by bay windows or angled walls.
        </p>
        <p style={pStyle}>
          <strong>Trapezoids and ellipses</strong> require two different measurements along their parallel or
          major/minor axes, and the calculator handles both without requiring you to look up the formula yourself; this
          matters for garden beds, pool surrounds, and non-rectangular room extensions.
        </p>
        <p style={pStyle}>
          A <strong>semi-circle</strong> works similarly to a circle but accounts for only half the area, which is
          common for rounded porch steps, semi-circular driveways, or garden borders.
        </p>
        <p style={pStyle}>
          The <strong>ring</strong> shape (also called an annulus) calculates the area between two circles, an outer and
          inner radius, which is particularly useful for circular flower beds with a center cutout, or decorative paving
          around a fixed feature like a tree or fountain.
        </p>
        <p style={pStyle}>
          <strong>L-shaped</strong> areas are calculated by combining two rectangular sections, making this option ideal
          for rooms with closets, hallways, or extensions, as well as yards with irregular boundaries.
        </p>
        <p style={last}>
          Finally, the <strong>custom shape</strong> option gives you flexibility when your space doesn't fit neatly
          into any standard geometric category, allowing you to input measurements that reflect the actual footprint of
          your project.
        </p>
      </div>

      {/* Land and plots */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Measure Land and Plots</h2>
        <h3 style={firstH3}>How Do You Measure a Yard of Land?</h3>
        <p style={pStyle}>
          Use a measuring tape or measuring wheel and measure in feet, then divide by 3 to get yards. For long distances,
          a wheel is faster and more accurate than a tape. Measure along the ground in a straight line, and have a helper
          hold the other end so it doesn’t sag.
        </p>
        <h3 style={h3Style}>How to Calculate the Area of a Rectangular Plot</h3>
        <p style={pStyle}>
          Measure the length and width, multiply them, and divide by 9. A plot that’s 60 feet by 90 feet is 5,400
          square feet, or 600 square yards. Before you trust the result, check that the corners are square by measuring
          both diagonals. If they’re equal, the plot is a true rectangle.
        </p>
        <h3 style={h3Style}>How to Measure an Irregular-Shaped Plot</h3>
        <p style={pStyle}>
          Split the plot into simple shapes, usually rectangles and triangles. Measure and calculate each one, then add
          the areas together. The calculator’s L-shape and custom options help with this. For a plot with many sides or
          curved edges, a licensed surveyor can give you an exact figure, and that figure is the one to use for legal
          purposes.
        </p>
        <h3 style={h3Style}>How to Calculate the Size of a Plot</h3>
        <p style={pStyle}>
          Whatever the shape, the process is the same. Measure the boundaries, work out the area in square feet or
          square yards, and compare it with the figure on your deed or survey. Small differences are normal. Large gaps
          are worth checking with the seller or a surveyor.
        </p>
        <h3 style={h3Style}>How to Calculate Land Area and Residential Plot Area in Square Yards</h3>
        <p style={pStyle}>
          Take the plot’s area in square feet and divide by 9. If your measurements are in meters, multiply the area in
          square meters by 1.19599. For a residential plot, measure only the boundary of the lot itself. The built-up
          area of the house is a separate number.
        </p>
        <h3 style={h3Style}>How Do Real Estate Agents Calculate Plot Sizes?</h3>
        <p style={pStyle}>
          Agents rarely measure plots themselves. They rely on the recorded survey, plat map, or deed, and appraisers or
          licensed surveyors take measurements when needed. In the United States, lot sizes are usually listed in square
          feet or acres. Square yards are standard in some other markets, including parts of South Asia. Listings can
          contain errors, so for a big purchase, confirm the size with a survey.
        </p>
        <h3 style={h3Style}>How Many Square Yards Are in an Acre?</h3>
        <p style={pStyle}>One acre equals 4,840 square yards, or 43,560 square feet.</p>
        <h3 style={h3Style}>How Many Square Yards Is a 5 Marla Plot?</h3>
        <p style={pStyle}>
          It depends on which marla is being used, because the size varies by region. Under the official Pakistani
          standard, one marla is 272.25 square feet (30.25 square yards), so 5 marla is 151.25 square yards. Many
          housing societies use a 225-square-foot marla (25 square yards), which makes 5 marla equal to 125 square yards.
          Always ask which definition applies before you buy.
        </p>
        <h3 style={h3Style}>Is Permission Required to Build on a 76-Square-Yard Plot?</h3>
        <p style={last}>
          In most places, yes. Building rules apply regardless of plot size, and a small plot usually still needs
          approved plans and proof of ownership. Requirements vary a lot by city and country, and the rules depend on
          where your plot is, so check with your local municipal or building authority before you start. They can tell
          you about setbacks, height limits, and the documents you’ll need.
        </p>
      </div>

      {/* Project guides */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Project Guides</h2>
        <h3 style={firstH3}>How to Calculate the Area of a Backyard</h3>
        <p style={pStyle}>
          Divide the yard into simple shapes, such as a rectangle for the lawn and a semi-circle for a patio. Calculate
          each one, add them up, and subtract anything you won’t cover, like a shed or deck. Use the calculator’s
          L-shape or custom option for odd layouts.
        </p>
        <h3 style={h3Style}>How to Calculate the Size of a Garden</h3>
        <p style={pStyle}>
          Measure each bed separately. Use a rectangle for raised beds, circle or ellipse for round beds, and ring for a
          bed around a tree. Add the totals together and use the material estimator for mulch or gravel.
        </p>
        <h3 style={h3Style}>How to Calculate Square Yards for Flooring</h3>
        <p style={pStyle}>
          Measure the room’s length and width in feet, multiply, and divide by 9. Add 5% to 10% for waste, cuts, and
          pattern matching. Use the higher end for diagonal layouts or patterned carpet. For rooms with closets or
          alcoves, use the L-shape option.
        </p>
        <h3 style={h3Style}>
          Why carpet is sold by the square yard while tile, hardwood, vinyl, and laminate are sold by the square foot
        </h3>
        <p style={pStyle}>
          It mostly comes down to history and how each product is packaged. Carpet is sold from wide rolls,
          traditionally 12 feet wide, and has long been priced by the square yard. Tile, hardwood, vinyl, and laminate
          come in boxes, and each box lists its coverage in square feet. Because of this, always convert your area to
          whichever unit the supplier uses.
        </p>
        <h3 style={h3Style}>How to Calculate Square Yards for Concrete</h3>
        <p style={pStyle}>
          Concrete is ordered by volume in cubic yards, not square yards, so you need a thickness too. First find the
          slab’s area in square feet, then use this formula:
        </p>
        <p style={pStyle}>
          <strong>Cubic yards = area (sq ft) × thickness (ft) ÷ 27</strong>
        </p>
        <p style={pStyle}>
          A 10 ft × 10 ft patio that’s 4 inches thick (0.33 ft) needs 100 × 0.33 ÷ 27 ≈ 1.23 cubic yards. Add about 5%
          to 10% extra for uneven ground and spillage.
        </p>
        <h3 style={h3Style}>How to Calculate Square Yards for a Construction Project</h3>
        <p style={pStyle}>
          Break the site into sections, such as the building footprint, driveway, and landscaped areas, and calculate
          each one separately. Totals in square yards help with surface materials like paving, turf, and carpet. For
          materials with depth, like gravel, concrete, or fill, you’ll also need volume, so convert to cubic yards using
          thickness.
        </p>
        <h3 style={h3Style}>How Do I Convert Asphalt Pavement Square Yards to Tons?</h3>
        <p style={pStyle}>
          Asphalt is sold by weight, so you need the thickness. A common rule of thumb is that asphalt weighs about 110
          pounds per square yard for every inch of thickness.
        </p>
        <p style={pStyle}>
          <strong>Tons = square yards × thickness (inches) × 110 ÷ 2,000</strong>
        </p>
        <p style={last}>
          For 100 square yards at 3 inches thick: 100 × 3 × 110 ÷ 2,000 = 16.5 tons. Actual density varies by mix, so
          confirm it with your asphalt supplier.
        </p>
      </div>

      {/* Material estimation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Material Estimation: From Area to Order Quantity</h2>
        <p style={pStyle}>Once you know the area, the estimator turns it into a quantity you can order.</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Sod and artificial grass:</strong> Area is the main number. Some suppliers sell by the square yard,
            while others sell by the pallet or the square foot, so check which one they use.
          </li>
          <li style={liStyle}>
            <strong>Carpet:</strong> Quoted and cut by the square yard. Matching your figure to the supplier’s roll width
            helps you avoid awkward remnants.
          </li>
          <li style={liStyle}>
            <strong>Tile:</strong> Usually priced by the square foot. Square yards are still handy for cross-checking
            quotes.
          </li>
          <li>
            <strong>Mulch and gravel:</strong> Sold by volume, usually cubic yards. Area is only the first step, and you
            also need the depth you plan to spread.
          </li>
        </ul>
      </div>

      {/* Metric conversions */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Square Yards and Metric Conversions</h2>
        <p style={pStyle}>
          The official definitions come from the international yard, which is exactly 0.9144 meters (see the{" "}
          <Ext href="https://www.nist.gov/pml/owm/metric-si/unit-conversion">NIST unit conversion guide</Ext>).
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>1 square yard = 0.8361 square meters</li>
          <li>1 square meter = 1.19599 square yards</li>
        </ul>
        <p style={pStyle}>
          So is a square yard bigger than a square meter? No. A square meter is the bigger of the two, since a yard is
          only 0.9144 m and a meter is longer. A square meter covers about 1.2 yd², while a square yard covers about
          0.84 m².
        </p>
        <p style={pStyle}>
          <strong>Example: a soccer field.</strong> A pitch that’s 103.5 m by 71.5 m has an area of 103.5 × 71.5 =
          7,400.25 m². Multiply by 1.19599 and you get about 8,850.6 square yards.
        </p>
        <h3 style={h3Style}>How Many Square Yards Are in a Cubic Yard?</h3>
        <p style={pStyle}>
          None. They measure different things, area versus volume, so there’s no direct conversion. A cubic yard is 27
          cubic feet. If you spread one cubic yard 1 foot deep, it covers 27 square feet. At 3 inches deep, it covers 108
          square feet (12 square yards).
        </p>
        <h3 style={h3Style}>Are Denim Fabrics Categorized by Ounces per Square Yard?</h3>
        <p style={pStyle}>
          Yes, in the US, denim weight is commonly given in ounces per square yard (oz/yd²). Lightweight denim is usually
          under 12 oz, mid-weight runs from about 12 to 14 oz, and heavyweight is above that. Many mills outside the US
          use grams per square meter instead.
        </p>
        <h3 style={h3Style}>Why Accuracy Matters</h3>
        <p style={last}>
          Suppliers rarely take back cut carpet or sod, and running short usually means a second delivery fee. With
          carpet, a second order can also come from a different dye lot, so the color may not match. Measuring carefully
          and calculating by shape gives you a reliable number to order from the first time.
        </p>
      </div>

      {/* Practical scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Practical Scenarios: When You'd Use This Tool</h2>
        <p style={pStyle}>
          There are several everyday situations where knowing your square yardage accurately makes a real difference:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Ordering new carpet or flooring for a bedroom, living room, or entire home before getting installation
            quotes from contractors.
          </li>
          <li style={liStyle}>
            Installing sod or artificial grass in a backyard, front lawn, or sports court area where suppliers price and
            deliver by the square yard.
          </li>
          <li style={liStyle}>
            Planning a landscaping project that involves mulch or gravel beds around trees, pathways, or garden borders
            with curved or irregular edges.
          </li>
          <li style={liStyle}>
            Budgeting a renovation where you need to compare material costs per square yard across multiple suppliers
            before committing.
          </li>
          <li style={liStyle}>
            Estimating tile for a kitchen or bathroom remodel, especially when the room includes an L-shaped layout or an
            island that breaks up the floor space.
          </li>
          <li style={liStyle}>
            Preparing for a real estate listing or appraisal where accurate square yardage of outdoor space adds context
            to a property description.
          </li>
          <li>
            Calculating fabric, turf, or paving material for shapes with curves, such as a circular patio or a
            ring-shaped flower bed around a fixed structure.
          </li>
        </ul>
        <p style={last}>
          In each of these cases, manually measuring, converting, and calculating areas introduces room for error, a
          small mistake in a formula can lead to an incorrect order and wasted money. Using a dedicated square yards
          calculator removes that risk and gives you a number you can act on immediately.
        </p>
      </div>

      {/* Free, private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Ready to Use</h2>
        <p style={last}>
          The calculator is completely free, with no signup, account, or hidden charges. Use it as many times as you
          like. Your measurements are processed in your browser, so you get results instantly without submitting any
          personal information.
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
