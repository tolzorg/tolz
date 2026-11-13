import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate square footage of a room?",
    a: "Measure the length and width in feet and multiply them. For rooms that aren't rectangular, split the space into rectangles and triangles, calculate each area, and add them together. You can also use the L-shape or custom polygon option in this calculator.",
  },
  {
    q: "How do I convert square meters to square feet?",
    a: "Multiply the area in square meters by 10.764. The calculator converts automatically when you choose your unit.",
  },
  {
    q: "What's the difference between square footage and area?",
    a: "Area is the general term for the size of a flat surface. Square footage is area measured in square feet, the standard unit in U.S. flooring, real estate, and construction.",
  },
  {
    q: "Can I calculate the square footage of an irregularly shaped room?",
    a: "Yes. Use the L-shape option for a room with one angled section, or the custom polygon option for multi-sided layouts.",
  },
  {
    q: "How much flooring do I need?",
    a: "Calculate the room's square footage and add 5% to 10% for cuts, pattern alignment, and mistakes.",
  },
  {
    q: "Does house square footage include a garage, balcony, or basement?",
    a: "No. Garages, balconies, and basements (finished or not) are not counted in above-ground living area. Finished basements are usually listed separately.",
  },
  {
    q: "Are closets, hallways, bathrooms, and stairs included?",
    a: "Yes. They count when they are finished, heated, and above ground. Stairs are counted on the floor they descend from.",
  },
  {
    q: "How do I get square footage from inches?",
    a: "Multiply length by width in inches, then divide by 144.",
  },
  {
    q: "Is this square footage calculator free?",
    a: "Yes. It's free with no signup, subscription, or hidden charges.",
  },
  {
    q: "Does this tool store my measurements?",
    a: "No. Calculations happen in your browser, and nothing you enter is saved.",
  },
  {
    q: "What units does the calculator support?",
    a: "Feet, inches, meters, and centimeters.",
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
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What is square footage */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Square Footage and How Do You Calculate It?</h2>
        <p style={pStyle}>
          Square footage is the amount of flat surface a space covers, measured in square feet. One square foot is a
          square that is 1 foot long and 1 foot wide. For any rectangular space, the math is simple: multiply the length
          by the width. A room that measures 12 feet by 15 feet has 180 square feet.
        </p>
        <p style={pStyle}>
          The calculator does this for you, and it handles the harder shapes too. You don't need to remember a separate
          formula for a circle, a trapezoid, or an L-shaped room. Choose the shape that matches your space, enter the
          measurements it asks for (length, width, radius, base, or height, or a known total area for custom polygons),
          and the result appears right away.
        </p>
        <p style={last}>
          You can enter measurements in feet, inches, meters, or centimeters and get the answer in the unit you need.
          That helps when a blueprint lists meters but your flooring supplier prices by the square foot.
        </p>
      </div>

      {/* Room */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Square Footage of a Room</h2>
        <p style={pStyle}>For a standard rectangular room, follow these steps:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>Measure the length of the room from wall to wall.</li>
          <li style={liStyle}>Measure the width the same way.</li>
          <li>Multiply the two numbers.</li>
        </ol>
        <p style={pStyle}>
          If the room isn't a perfect rectangle, split it into simpler pieces, such as two rectangles or a rectangle and
          a triangle. Find the area of each piece and add them together. The L-shape option in this calculator does that
          work for you, and the custom polygon option takes the total once you've added the pieces. For flooring,
          measure at floor level instead of at the baseboard, and measure every section that will be covered.
        </p>
        <h3 style={h3Style}>Quick Tricks for Feet and Inches</h3>
        <p style={pStyle}>
          Most rooms aren't measured in whole feet, and that's where mistakes creep in. These shortcuts make it easier:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Convert inches to decimal feet.</strong> Divide the inches by 12. A room that is 11 feet 6 inches
            wide is 11.5 feet. Nine inches is 0.75 feet, three inches is 0.25, and six inches is 0.5.
          </li>
          <li style={liStyle}>
            <strong>Multiply, then round.</strong> Once both sides are in decimal feet, multiply them. A room that is 11
            feet 6 inches by 14 feet 3 inches is 11.5 × 14.25, which is about 164 square feet.
          </li>
          <li style={liStyle}>
            <strong>Or work in inches and divide by 144.</strong> Multiply the two measurements in inches, then divide by
            144, since one square foot equals 144 square inches.
          </li>
          <li>
            <strong>Keep your units matching.</strong> Don't multiply feet by inches. Convert one side first.
          </li>
        </ul>
        <h3 style={h3Style}>How to Get Square Footage from Inches</h3>
        <p style={last}>
          Multiply length by width in inches, then divide by 144. For example, a countertop that is 96 inches by 25
          inches covers 2,400 square inches. Divide by 144 and you get about 16.7 square feet. You can also enter inches
          directly into the calculator and let it convert.
        </p>
      </div>

      {/* Each shape */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Square Footage Is Calculated for Each Shape</h2>
        <p style={pStyle}>Knowing the formulas helps you catch measurement errors before they get expensive.</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Rectangle:</strong> length × width.</li>
          <li style={liStyle}><strong>Square:</strong> side × side.</li>
          <li style={liStyle}>
            <strong>Circle:</strong> π × radius². If you only have the diameter, divide it by 2 to get the radius. The
            calculator does this automatically.
          </li>
          <li style={liStyle}>
            <strong>Triangle:</strong> ½ × base × height, with the height measured at a right angle to the base.
          </li>
          <li style={liStyle}>
            <strong>Trapezoid:</strong> ½ × (the two parallel sides added together) × the height between them.
          </li>
          <li style={liStyle}>
            <strong>Ellipse:</strong> π × semi-major axis × semi-minor axis. These are half the longest and shortest
            widths.
          </li>
          <li style={liStyle}>
            <strong>Semi-circle:</strong> half the area of a full circle with the same radius.
          </li>
          <li style={liStyle}>
            <strong>L-shape:</strong> the shape is split into two rectangles, and their areas are added.
          </li>
          <li style={liStyle}>
            <strong>Ring (annulus):</strong> the outer circle's area minus the inner circle's area. This works for
            circular paths, pipes, and decorative borders.
          </li>
          <li>
            <strong>Custom polygon:</strong> for shapes with any number of sides, split the shape into simple pieces, add
            their areas, and enter the total. The calculator converts it to the unit you need.
          </li>
        </ul>
        <h3 style={h3Style}>Circles vs. Squares</h3>
        <p style={pStyle}>
          A square and a circle do not have the same square footage, even when they seem to match in size. A square
          that is 10 feet on each side covers 100 square feet. A circle that is 10 feet across (diameter) covers about
          78.5 square feet. A circle always takes up about 78.5% of the square that fits around it. If you're comparing
          the two for a patio, rug, or garden bed, that difference matters.
        </p>
        <h3 style={h3Style}>How to Find the Square Footage of a Circle</h3>
        <p style={pStyle}>
          Measure the diameter, divide by 2 for the radius, square the radius, and multiply by 3.1416. A round table 6
          feet across has a 3-foot radius, so its area is 3.1416 × 9, or about 28.3 square feet.
        </p>
        <h3 style={h3Style}>How to Find the Square Footage of an Irregular Shape</h3>
        <p style={pStyle}>
          Break it into rectangles, triangles, and circle parts, calculate each, and add them. For shapes with many
          sides, add up the pieces and enter the total in the custom polygon option to convert it to any unit.
        </p>
        <h3 style={h3Style}>How to Calculate the Square Footage of a Curve</h3>
        <p style={last}>
          It depends on what you're measuring. For a curved wedge, like a pie-slice garden bed, use (angle ÷ 360) × π ×
          radius². For a curved path or walkway, multiply the length along the center of the curve by the width. For a
          curved edge on an otherwise straight room, treat the curve as part of a circle or ellipse, then add its area to
          the rest of the room.
        </p>
      </div>

      {/* House */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How House Square Footage Is Measured</h2>
        <p style={pStyle}>
          There's no single law that defines square footage, but most appraisers, builders, and agents in the U.S.
          follow the ANSI Z765 standard for single-family homes. The key ideas are simple.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Measurements are taken from the outside of the house, at each finished floor level.</li>
          <li style={liStyle}>
            Only finished space counts. That means walls, floors, and ceilings are complete, and the space is heated or
            cooled in the same way as the rest of the home.
          </li>
          <li style={liStyle}>
            The ceiling must generally be at least 7 feet high. For sloped ceilings, at least half the floor area must be
            7 feet or higher, and only the parts that are at least 5 feet high count.
          </li>
          <li>The space has to be above ground and directly accessible from the main living area.</li>
        </ul>
        <p style={pStyle}>
          Square footage of the house, often called gross living area, is the total of every finished above-ground
          floor. If a home has a main floor and a second floor, both count. The main level isn't the only one included,
          even though it's often the largest.
        </p>
        <h3 style={h3Style}>What Rooms Count Toward a House's Total Square Footage?</h3>
        <p style={pStyle}>
          Living rooms, bedrooms, kitchens, dining rooms, bathrooms, hallways, closets, laundry rooms, finished attics
          that meet the ceiling rule, and the stairs all count when they are finished, heated, and above ground.
        </p>
        <h3 style={h3Style}>What Is Not Included?</h3>
        <p style={pStyle}>Spaces that are generally left out:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Garages and carports</li>
          <li style={liStyle}>Balconies, decks, patios, and open porches</li>
          <li style={liStyle}>Unfinished basements, attics, and crawl spaces</li>
          <li style={liStyle}>Basements and other below-ground rooms, even when finished</li>
          <li style={liStyle}>Space with ceilings that are too low</li>
          <li>Detached buildings, such as a shed or separate guest house</li>
        </ul>
        <h3 style={h3Style}>Is a Garage Included in the Square Footage of a House?</h3>
        <p style={pStyle}>
          No. Garages are not living space, so they're listed separately, such as "two-car garage." The exception is a
          garage that has been converted into a finished, heated room with permits, and then it may count.
        </p>
        <h3 style={h3Style}>Does Square Footage Include a Balcony?</h3>
        <p style={pStyle}>
          No. Balconies are outdoor spaces that are not enclosed or climate-controlled, so they don't count as living
          areas. Agents may mention balcony size separately as a selling point. A fully enclosed and heated sunroom,
          however, can count.
        </p>
        <h3 style={h3Style}>Does a Pool House Count?</h3>
        <p style={pStyle}>
          Usually not. A detached pool house is a separate structure, so it's typically listed on its own or as an
          accessory building. If it's attached to the home, finished, and heated like the rest of the house, it may be
          included.
        </p>
        <h3 style={h3Style}>Are Closets, Hallways, and Bathrooms Included?</h3>
        <p style={pStyle}>
          Yes. Closets, hallways, and bathrooms (including half bathrooms) are part of the finished interior, so they
          count. The same is true for apartments: bathrooms are almost always included. Rental listings aren't held to
          one national standard, though, so some measure to the outside of the walls and others measure inside them.
        </p>
        <h3 style={h3Style}>Are Stairs and Steps Included?</h3>
        <p style={pStyle}>
          Yes, for interior stairs. The stairway is counted on the floor it descends from, and it isn't counted a second
          time on the floor below. Exterior steps and porch stairs are not included.
        </p>
        <h3 style={h3Style}>How Do You Calculate the Square Footage of Stairs?</h3>
        <p style={pStyle}>There are two different answers, depending on why you ask.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>For a house's square footage:</strong> measure the footprint of the stairway on the upper floor. It's
            already inside the floor's measurement, so you usually don't need to add it separately.
          </li>
          <li>
            <strong>For flooring or carpet:</strong> each step has a tread (the part you step on) and a riser (the
            vertical part). Add the tread depth and riser height, multiply by the width of the stair, and divide by 144.
            For example, a step with a 10.5-inch tread, a 7.5-inch riser, and a 36-inch width is 18 × 36 = 648 square
            inches, or 4.5 square feet. Multiply by the number of steps, then add the landings.
          </li>
        </ul>
        <h3 style={h3Style}>Does Ceiling Height Affect Square Footage?</h3>
        <p style={pStyle}>
          It doesn't change the area itself, because square footage only measures the floor. It can still change what
          gets counted: space with a ceiling under about 7 feet usually doesn't qualify as a living area. Ceiling height
          does affect volume (cubic feet), which matters for heating, cooling, and the feel of a room.
        </p>
        <h3 style={h3Style}>Why Are Houses Valued by Square Footage and Not Volume?</h3>
        <p style={pStyle}>
          Square footage is easier to measure, easier to compare, and it follows how people use a home. A buyer can look
          at two listings and quickly compare size. Most homes also have similar ceiling heights, so volume wouldn't add
          much. Ceiling height can still affect price, but it's treated as a feature rather than the main measurement.
        </p>
        <h3 style={h3Style}>Is the Square Footage of a House the Same as the Roof?</h3>
        <p style={last}>
          No. A roof is almost always larger than the floor area below it because of the slope (pitch) and the overhang
          at the edges. A roof with a 6/12 pitch is about 12% larger than the floor area it covers. Roofers often measure
          in "squares," where one square equals 100 square feet.
        </p>
      </div>

      {/* Basements */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Basements and Square Footage</h2>
        <h3 style={firstH3}>Why Isn't Basement Space Included?</h3>
        <p style={pStyle}>
          Basements are below ground, and standard measuring guidelines only count above-ground living space. Appraisers
          separate the two because below-ground space tends to have less natural light, more moisture risk, and limited
          exits, and it costs less to build. Finished basement space is usually reported on its own line, such as "1,800
          sq ft above grade plus 900 sq ft finished basement."
        </p>
        <h3 style={h3Style}>Should an Unfinished Basement Be Included?</h3>
        <p style={pStyle}>
          No. An unfinished basement should not be counted in the home's square footage. You can mention it as a
          feature, since it offers room to expand.
        </p>
        <h3 style={h3Style}>Why Do Basements Add Little Value for Appraisers?</h3>
        <p style={last}>
          A finished basement does add value, but typically less per square foot than the upper floors. The reasons are
          the lack of windows and light, the lower ceiling height, the risk of dampness, and the fact that buyers see it
          as secondary space. The actual value depends on your local market, the quality of the finish, and whether the
          room has an egress window.
        </p>
      </div>

      {/* Average sizes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Average Sizes: Homes, Bedrooms, and More</h2>
        <h3 style={firstH3}>What Is the Average Home Size in the U.S.?</h3>
        <p style={pStyle}>
          According to U.S. Census Bureau data on new construction, the median new single-family home has been around
          2,100 to 2,300 square feet in recent years. Older homes tend to be smaller, so the typical home across all
          U.S. housing is closer to 1,900 to 2,000 square feet. You can find current numbers in the{" "}
          <Ext href="https://www.census.gov/construction/chars/index.html">
            Census Bureau's characteristics of new housing
          </Ext>
          .
        </p>
        <h3 style={h3Style}>What Is Considered a Small Home?</h3>
        <p style={pStyle}>
          A home under about 1,000 square feet is generally considered small. A "tiny house" is defined in the
          International Residential Code as 400 square feet or less.
        </p>
        <h3 style={h3Style}>What Is the Average Bedroom Size?</h3>
        <p style={pStyle}>
          A typical secondary bedroom is about 100 to 150 square feet, such as 10 × 12 feet. A primary bedroom is usually
          200 to 250 square feet. Building codes require at least 70 square feet for a bedroom.
        </p>
        <h3 style={h3Style}>What Is the Average Size of a Double-Wide Mobile Home?</h3>
        <p style={pStyle}>
          Double-wide manufactured homes are commonly 20 to 32 feet wide and 40 to 76 feet long, so most land between
          1,000 and 2,000 square feet. About 1,500 square feet is a reasonable average.
        </p>
        <h3 style={h3Style}>What Is the Average Apartment Size in New York City?</h3>
        <p style={pStyle}>
          Most New York City apartments are roughly 700 to 800 square feet. Studios often run 400 to 500 square feet, and
          size varies a lot by borough and building age.
        </p>
        <h3 style={h3Style}>What Is the Average Home Size in Norway?</h3>
        <p style={pStyle}>
          Homes in Norway are typically around 100 to 120 square meters, which is about 1,100 to 1,300 square feet.
          Detached houses are larger, while apartments in cities are smaller.
        </p>
        <h3 style={h3Style}>How Much Space Does a Person Need to Live Comfortably?</h3>
        <p style={pStyle}>
          The International Residential Code requires at least one room of 120 square feet and other habitable rooms of
          at least 70 square feet. For comfort, many people find 200 to 400 square feet per person works well, with
          enough room for sleeping, cooking, and storage. Small studios and tiny homes can work with less if the layout
          is well planned.
        </p>
        <h3 style={h3Style}>What Is the Ideal Size for an Artist's Studio?</h3>
        <p style={pStyle}>
          For a solo artist, 100 to 150 square feet works for drawing or small-scale painting. For larger canvases,
          sculpture, or printmaking, aim for 250 to 400 square feet. Leave space for storage, a work table, and walking
          room around large pieces.
        </p>
        <h3 style={h3Style}>What Is the Minimum Size for a Half Bathroom?</h3>
        <p style={pStyle}>
          A half bath (a toilet and sink) can be as small as about 15 square feet, or 3 × 5 feet. Code requires roughly
          30 inches of width for the toilet and 21 inches of clear space in front of it. A 20 to 25 square foot half
          bath is more comfortable.
        </p>
        <h3 style={h3Style}>What Are the Living Quarters at the White House?</h3>
        <p style={pStyle}>
          The White House has about 55,000 square feet of total floor space across six levels. The first family's
          private residence is on the second and third floors. An official square footage figure for just the family's
          living space isn't widely published, so any specific number you see online is an estimate.
        </p>
        <h3 style={h3Style}>What Are the Largest Single-Floor Buildings?</h3>
        <p style={last}>
          Two buildings are often cited. The Aalsmeer flower auction complex in the Netherlands is commonly listed as
          the largest by footprint, at roughly 5 million square feet or more. Boeing's Everett factory in Washington is
          the largest by volume, with a footprint of about 4.3 million square feet. Figures vary by source and by how
          each building is measured.
        </p>
      </div>

      {/* Larger spaces */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Measuring Larger Spaces</h2>
        <h3 style={firstH3}>How Do You Calculate the Square Footage of a Complicated House?</h3>
        <p style={pStyle}>Work from a floor plan, or sketch one.</p>
        <ol style={ulStyle}>
          <li style={liStyle}>Divide each floor into rectangles, triangles, or other simple shapes.</li>
          <li style={liStyle}>Measure each shape and calculate its area.</li>
          <li style={liStyle}>Subtract any cutouts, such as a stairwell open to the floor below.</li>
          <li>Add the areas for each floor, then add the floors together.</li>
        </ol>
        <p style={pStyle}>
          For rooms with odd angles, split them into triangles and rectangles, then enter the combined total in the
          custom polygon option.
        </p>
        <h3 style={h3Style}>How Do You Calculate Square Footage from a Floor Plan?</h3>
        <p style={pStyle}>
          Floor plans usually show room dimensions. Multiply the length and width for each room, then add up the rooms,
          hallways, and closets. If the plan has a scale instead of written dimensions, such as 1/4 inch = 1 foot,
          measure each side with a ruler and convert it. Keep in mind that a plan may show interior measurements, while
          an appraiser measures from the outside.
        </p>
        <h3 style={h3Style}>How Do You Use a Measuring Wheel?</h3>
        <p style={pStyle}>
          A measuring wheel is useful for large rooms, yards, and parking areas. Zero it, roll it along one side at a
          steady pace, and note the distance. Do the same for the next side, then multiply. On uneven ground, measure in
          smaller sections. Check that the wheel reads in feet and not meters before you begin.
        </p>
        <h3 style={h3Style}>How Do You Find the Square Footage of Your Property?</h3>
        <p style={pStyle}>
          Lot size is different from house size. Check your deed, survey, or plat map. Your county assessor's website
          often lists lot size in square feet or acres, and many counties offer an online map. One acre equals 43,560
          square feet. If you need to measure an irregular lot yourself, split it into simple shapes, add their areas,
          and enter the total in the polygon option to convert units.
        </p>
        <h3 style={h3Style}>What Is the Square Footage of a Hectare?</h3>
        <p style={pStyle}>
          One hectare is 10,000 square meters, which equals about 107,639 square feet or 2.47 acres.
        </p>
        <h3 style={h3Style}>How Do You Find the Square Footage of a Wall?</h3>
        <p style={pStyle}>
          Multiply the wall's width by its height. For painting, subtract the areas of windows and doors. A wall that is
          12 feet wide and 8 feet high has 96 square feet. If the wall has a gable or slope, split it into a rectangle
          and a triangle.
        </p>
        <h3 style={h3Style}>How Do You Calculate the Square Footage of a Round Pipe?</h3>
        <p style={pStyle}>
          This usually means surface area, such as for insulation or paint. Multiply π × diameter × length, with all
          values in feet. A pipe 6 inches (0.5 feet) across and 20 feet long has a surface area of 3.1416 × 0.5 × 20, or
          about 31.4 square feet. For the opening inside the pipe, use the circle formula with the inner radius.
        </p>
        <h3 style={h3Style}>How Do You Convert a Perimeter into Square Footage?</h3>
        <p style={pStyle}>
          A perimeter alone doesn't give you an area, because many shapes can have the same perimeter. You need the shape
          plus at least one more measurement. If it's a square with a 40-foot perimeter, each side is 10 feet, so the
          area is 100 square feet. For a rectangle, you need one side. For a circle, divide the perimeter by 2π to get
          the radius.
        </p>
        <h3 style={h3Style}>A Renovation Adds 25% to an 1,800 Square Foot House. What's the New Size?</h3>
        <p style={last}>
          Multiply 1,800 by 1.25. The renovated house has 2,250 square feet, which is 450 square feet more than before.
        </p>
      </div>

      {/* Software */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Square Footage in Software</h2>
        <h3 style={firstH3}>How Do You Calculate Square Footage in Excel?</h3>
        <p style={pStyle}>
          Put the length in cell A2 and the width in B2, then type <code style={mono}>=A2*B2</code> in C2. For a circle
          with the radius in A2, use <code style={mono}>=PI()*A2^2</code>. If your measurements are in inches, use{" "}
          <code style={mono}>=(A2*B2)/144</code> to get square feet. Copy the formula down to calculate more rooms, then
          use <code style={mono}>=SUM(C2:C10)</code> for the total.
        </p>
        <h3 style={h3Style}>How Do You Calculate Square Footage in AutoCAD?</h3>
        <p style={last}>
          Type <code style={mono}>AREA</code> and press Enter. Then pick the corners of the space, or use the Object
          option and click a closed shape like a polyline. The result appears in the command line. Check your drawing
          units first: if the drawing is in inches, divide the result by 144 to get square feet.
        </p>
      </div>

      {/* Verification and commercial */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Verification and Commercial Space</h2>
        <h3 style={firstH3}>Who Is Responsible for Verifying Square Footage?</h3>
        <p style={pStyle}>
          No single party carries that responsibility. Listing agents and sellers often provide the number, but it may
          come from old records or an earlier measurement, and many listings say buyers should verify it themselves. A
          licensed appraiser, who measures during an appraisal, is the most reliable source. If size matters to your
          decision, measure it yourself or hire an appraiser.
        </p>
        <h3 style={h3Style}>How Is Parking Counted?</h3>
        <p style={pStyle}>
          For homes, garages and driveways are not part of the finished square footage. For commercial properties,
          parking is usually described by the number of spaces. A standard stall is about 9 × 18 feet, or 162 square
          feet, but with aisles, a full space typically needs 300 to 350 square feet.
        </p>
        <h3 style={h3Style}>How Do You Find the Size of an Occupied Retail Space?</h3>
        <p style={last}>
          Start with the lease, which should list the rentable area. County assessor records, the landlord or property
          manager, and listing sites for commercial space can also help. Be aware that commercial leases often use
          rentable square footage, which includes a share of shared areas, rather than usable square footage.
        </p>
      </div>

      {/* Good measurement */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Makes a Good Measurement</h2>
        <h3 style={firstH3}>How Can You Visualize Square Footage?</h3>
        <p style={pStyle}>These comparisons help:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>A queen bed is about 33 square feet.</li>
          <li style={liStyle}>A standard parking space is about 160 square feet.</li>
          <li style={liStyle}>A 10 × 10 foot room is 100 square feet.</li>
          <li style={liStyle}>A tennis court is about 2,800 square feet.</li>
          <li>A basketball court is about 4,700 square feet.</li>
        </ul>
        <p style={pStyle}>
          To see a size in person, mark it out with painter's tape on the floor or stakes and string in the yard.
        </p>
        <h3 style={h3Style}>Tips for Accurate Measurements</h3>
        <p style={pStyle}>
          Measure at floor level, not at the baseboard. Break alcoves, closets, and bay windows into simple shapes
          instead of forcing them into one rectangle, which tends to undercount. Measure diameter for round items, since
          it's easier than finding the center. Make sure all numbers use the same unit, because mixing feet and inches is
          the most common reason for wrong results.
        </p>
        <h3 style={h3Style}>Planning Multiple Rooms and Ordering Extra</h3>
        <p style={last}>
          For larger projects, calculate each room or section on its own, then add them up. Don't average them or treat
          the whole floor plan as one rectangle. For flooring and tile, order 5% to 10% more than your total for cuts,
          pattern matching, and mistakes. Use closer to 10% for diagonal layouts or complex patterns.
        </p>
      </div>

      {/* Why you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You Might Need a Square Footage Calculator</h2>
        <p style={pStyle}>Square footage comes up in more everyday projects than most people expect.</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Flooring and renovation.</strong> Hardwood, tile, carpet, and vinyl are sold by the square foot or in
            boxes that cover a set area. Measuring accurately helps you avoid overspending or running short mid-project.
          </li>
          <li style={liStyle}>
            <strong>Painting.</strong> Paint is based on wall area rather than floor area, but the same shape-based math
            applies. Knowing the exact size of angled or curved walls helps you buy the right number of cans.
          </li>
          <li style={liStyle}>
            <strong>Real estate.</strong> Buyers and sellers often need to check a room, unit, or lot, especially when
            records are outdated or in dispute.
          </li>
          <li style={liStyle}>
            <strong>Landscaping.</strong> Garden beds, patios, and lawns are often round, curved, or irregular. Area tells
            you how much sod, mulch, gravel, or paving you need.
          </li>
          <li style={liStyle}>
            <strong>Construction and remodeling.</strong> Contractors use square footage to estimate materials, labor,
            and timelines. Rooms with an L-shaped layout or a bay window need to be broken into simple shapes, which the
            L-shape and polygon options handle.
          </li>
          <li>
            <strong>Tile and countertops.</strong> Kitchens and bathrooms often have curved edges, islands, or round
            sinks, so support for circles, ellipses, and rings comes in handy.
          </li>
        </ul>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy, and Cost</h2>
        <p style={pStyle}>
          All calculations run in your browser. The measurements you enter are not stored, logged, or sent anywhere, so
          you can use the tool for personal or client projects without worrying about where the data goes.
        </p>
        <p style={last}>
          The calculator is free, with no subscription, usage limit, or signup. The formulas are standard geometry, so
          results are only as precise as your measurements.
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
