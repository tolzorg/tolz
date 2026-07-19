import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the weight of a material from its size?",
    a: "Multiply the material's volume (length × width × height) by its density. The size to weight calculator does this automatically, just enter your dimensions, select the material, and the weight is calculated instantly.",
  },
  {
    q: "What's the difference between mass and weight in this calculation?",
    a: "In everyday and engineering use, \"weight\" and \"mass\" are often used interchangeably for this kind of calculation, and this tool reports the mass-based figure (in kilograms, pounds, etc.) that's standard for material estimating, shipping, and construction purposes.",
  },
  {
    q: "Can I calculate the weight of steel, aluminum, and other metals with this tool?",
    a: "Yes. The calculator supports more than 20 materials, including mild steel, stainless steel, aluminum, copper, brass, and cast iron, along with construction materials, several wood types, and common plastics.",
  },
  {
    q: "Do I need to sign up or pay to use this calculator?",
    a: "No. The tool is completely free with no signup, no account creation, and no hidden charges. You can use it as many times as you like.",
  },
  {
    q: "Which units does the calculator support?",
    a: "It supports both metric and imperial unit systems, so you can enter dimensions in millimeters, centimeters, meters, or inches and feet, and get results in the weight unit of your choice, such as kilograms or pounds.",
  },
  {
    q: "How accurate is the weight estimate compared to actual measured weight?",
    a: "The calculator uses standardized density values for each material, which produces results that closely match real-world weight for most practical use cases. For extremely precise applications, checking the exact density of your specific material grade or alloy is recommended.",
  },
  {
    q: "Can this tool calculate the weight of non-rectangular shapes?",
    a: "This calculator is built specifically for rectangular solids (blocks, plates, beams, and similar shapes). For irregular or curved shapes, the volume calculation would differ, since it's no longer a simple length × width × height formula.",
  },
  {
    q: "Why does material choice make such a big difference in the result?",
    a: "Because weight depends on density, not just size. Two objects with identical dimensions can have very different weights depending on what they're made of, for example, a steel block will weigh several times more than a wood block of the same size, because steel is significantly denser.",
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

export default function SizeToWeightCalculatorFaqSection() {
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
          Figuring out how much a piece of material will weigh before you order it, ship it, or build with it
          saves time, money, and guesswork. Whether you're a fabricator quoting a steel plate, a hobbyist
          calculating lumber weight for a project, or a logistics coordinator estimating shipping costs,
          knowing the exact weight of a rectangular solid before it arrives on-site changes how you plan. The
          size to weight calculator on <Link to="/" className="inline-home-link">Tolz</Link> was built exactly for this, enter the dimensions of your material,
          pick the substance it's made from, and get an accurate weight in seconds, without needing a scale, a
          reference manual, or a calculator app full of conversion formulas.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Size to Weight Calculator and How Does It Work</h2>
        <p style={pStyle}>
          A size to weight calculator determines the mass of a solid object using two pieces of information:
          its physical dimensions (length, width, and height or thickness) and the density of the material
          it's made from. Density is the defining variable — a block of steel and a block of foam with
          identical dimensions will have drastically different weights, because density measures how much
          mass is packed into a given volume.
        </p>
        <p style={pStyle}>
          The underlying calculation is straightforward once you understand it: the tool first computes the
          volume of the rectangular solid by multiplying length × width × height. It then multiplies that
          volume by the material's known density to produce the total weight. This is the same principle
          engineers, machinists, and construction estimators have used for decades, except the calculator
          removes the manual lookup and arithmetic, converts between unit systems automatically, and returns a
          precise figure instantly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As a size to weight calculator, this tool supports more than 20 materials, spanning common metals
          like steel, aluminum, and copper, construction materials like concrete and various wood species, and
          everyday plastics. Each material carries its own standardized density value, so switching from "mild
          steel" to "aluminum" in the dropdown recalculates the weight immediately without any extra input
          from you.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Need a Weight Calculator by Size</h2>
        <p style={pStyle}>
          Calculating weight from dimensions isn't a niche need, it comes up constantly across trades,
          industries, and everyday projects. Here are the situations where this tool becomes genuinely
          useful:
        </p>
        <p style={pStyle}>
          <strong>Construction and fabrication estimating.</strong> Contractors and metal fabricators often
          need to know the weight of steel beams, plates, or angle stock before ordering, both for cost
          calculation and to confirm that structural supports, cranes, or transport vehicles can handle the
          load. Getting this number wrong can mean a delayed delivery or an unsafe lift.
        </p>
        <p style={pStyle}>
          <strong>Shipping and freight planning.</strong> Freight costs are frequently calculated by weight,
          and carriers charge differently for underestimated versus overestimated shipments. If you're
          shipping raw material, sheet metal, lumber, or plastic stock, knowing the precise weight in advance
          prevents unexpected freight charges or failed bookings with weight-restricted carriers.
        </p>
        <p style={pStyle}>
          <strong>Manufacturing and machining quotes.</strong> Machine shops quoting a job from raw billet or
          bar stock need to know material weight to calculate cost, since metal is typically purchased and
          priced by weight. A quick, accurate weight calculation at the quoting stage avoids underpricing a
          job.
        </p>
        <p style={pStyle}>
          <strong>DIY and hobbyist projects.</strong> Woodworkers, metalworkers, and makers building
          furniture, enclosures, or custom parts often want to know how heavy a finished piece will be, for
          structural support, for mounting hardware, or simply to know if two people will be needed to move
          it.
        </p>
        <p style={pStyle}>
          <strong>Engineering and design verification.</strong> Engineers sanity-checking a bill of materials,
          or students working through material science coursework, use dimension-to-weight calculations
          regularly to confirm design assumptions before committing to detailed simulations or physical
          prototypes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In each of these cases, the alternative to using a size to weight calculator is manually looking up
          density values and doing the multiplication by hand, a process that's slow and prone to
          unit-conversion errors, especially when switching between metric and imperial systems mid-project.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Weight from Dimensions Using This Tool</h2>
        <p style={pStyle}>Using this size to weight calculator takes under a minute, even the first time:</p>
        <ol style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            Select your material from the list of over 20 supported options, including steel, aluminum,
            concrete, various wood types, and common plastics.
          </li>
          <li style={{ marginBottom: 8 }}>
            Enter the dimensions of your rectangular solid, length, width, and height (or thickness), in
            whichever unit system you're working in.
          </li>
          <li style={{ marginBottom: 8 }}>
            Choose your preferred unit system for both input and output. The tool supports metric and
            imperial units, so you can input in inches and get a result in kilograms, or any combination that
            fits your workflow.
          </li>
          <li>
            View your result instantly. The calculator displays the total weight the moment your inputs are
            complete, with no extra button-clicking or page reloads required.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because the tool recalculates live, you can adjust dimensions or swap materials to compare scenarios
          quickly, useful if you're deciding between two material options for the same project and want to see
          the weight difference before making a purchasing decision.
        </p>
      </div>

      {/* Materials */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Supported Materials and Density Reference</h2>
        <p style={pStyle}>
          Accuracy in a weight calculation depends entirely on using the correct density value, which is why
          this calculator draws on standardized density figures rather than rough averages. The tool covers
          the material categories most commonly needed for real-world estimating:
        </p>
        <p style={pStyle}>
          <strong>Metals:</strong> mild steel, stainless steel, aluminum, copper, brass, and cast iron are
          among the most frequently searched materials for weight estimation, particularly in fabrication and
          construction contexts where even small errors in weight compound across large orders.
        </p>
        <p style={pStyle}>
          <strong>Construction materials:</strong> concrete and various stone or aggregate options are
          included for site planning and structural load calculations, where weight directly affects
          foundation and support requirements.
        </p>
        <p style={pStyle}>
          <strong>Wood:</strong> multiple wood species are supported, since density varies significantly
          between softwoods and hardwoods, a plank of pine and a plank of oak with identical dimensions can
          differ in weight by a wide margin, which matters for furniture design, shipping, and structural
          framing.
        </p>
        <p style={pStyle}>
          <strong>Plastics:</strong> common plastic types are included for manufacturing and product design use
          cases, where material choice often comes down to a trade-off between weight, cost, and durability.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're unsure which specific grade or type applies to your material, for example, the difference
          between mild steel and stainless steel, the calculator's material list is designed to be
          self-explanatory, so you can select the closest match and get a reliable estimate without needing
          external reference material.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy and How the Calculation Stays Reliable</h2>
        <p style={pStyle}>
          The formula behind this tool, volume multiplied by density, is the same standard used in engineering
          and manufacturing environments worldwide, so the results are mathematically consistent with hand
          calculations, just faster and less error-prone. The one variable that can affect real-world accuracy
          is the specific density figure used for your exact material, since density can vary slightly between
          different grades, alloys, or manufacturing processes (for instance, different steel alloys have
          marginally different densities).
        </p>
        <p style={pStyle}>
          For most practical purposes, estimating, quoting, planning shipments, or sanity-checking a project,
          the standard density values used by this calculator will match real-world weight closely enough to
          make confident decisions. For applications with extremely tight tolerances, such as precision
          aerospace manufacturing, it's worth cross-referencing the exact material specification sheet from
          your supplier, since those documents will list the precise density for that specific batch or
          alloy.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unit conversion is another area where manual calculations commonly go wrong, particularly when
          switching between metric and imperial systems mid-project. Because this tool handles unit conversion
          internally, there's no risk of a misplaced decimal point or an incorrect conversion factor throwing
          off your final number.
        </p>
      </div>

      {/* Worked example */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Worked Example: Steel Plate Weight Calculation</h2>
        <p style={pStyle}>
          To see how the math plays out in practice, consider a steel plate measuring 1 meter long, 0.5 meters
          wide, and 0.02 meters (20mm) thick. The volume is calculated as 1 × 0.5 × 0.02, which equals 0.01
          cubic meters. Mild steel has a density of roughly 7,850 kg per cubic meter, so multiplying the
          volume by the density gives a weight of approximately 78.5 kilograms.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Now compare that to the same dimensions in aluminum, which has a density of about 2,700 kg per cubic
          meter, the identical-sized plate would weigh only around 27 kilograms, less than half the weight of
          the steel version. This is exactly why density matters as much as size: two plates that look
          identical on a drawing can require completely different handling equipment, shipping costs, and
          structural support depending on the material specified. The calculator performs this exact
          multiplication instantly, regardless of which units you enter, so you never have to convert
          millimeters to meters or kilograms to pounds by hand before running the numbers.
        </p>
      </div>

      {/* Common mistakes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes When Calculating Material Weight Manually</h2>
        <p style={pStyle}>
          Manual weight calculations go wrong more often than most people expect, usually for a handful of
          predictable reasons. Recognizing these helps explain why a dedicated calculator produces more
          reliable results than a quick mental estimate or a generic spreadsheet formula.
        </p>
        <p style={pStyle}>
          <strong>Mixing unit systems mid-calculation.</strong> One of the most frequent errors happens when
          someone measures a dimension in inches but pulls a density value listed in kilograms per cubic
          meter, then multiplies the two without converting first. The result looks like a real number but is
          off by orders of magnitude. Because this tool standardizes units internally before calculating, this
          specific error simply can't happen.
        </p>
        <p style={pStyle}>
          <strong>Using an outdated or generic density figure.</strong> Density values found through a quick
          web search vary depending on the source, and some pages list density for a different alloy or grade
          than the one actually being used. This calculator uses consistent, standardized values per material,
          so results stay comparable across repeated calculations rather than shifting depending on which
          reference was used that day.
        </p>
        <p style={pStyle}>
          <strong>Forgetting that weight scales with volume, not just one dimension.</strong> Doubling the
          thickness of a plate doubles its weight, but many manual estimates only adjust for length or width
          changes and overlook the compounding effect of a third dimension. Since the calculator always
          multiplies all three dimensions together, this kind of oversight is eliminated automatically.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Rounding errors compounding across large orders.</strong> A small rounding mistake per unit
          might seem negligible, but when scaled across dozens or hundreds of pieces for a fabrication order
          or bulk shipment, the cumulative error can become significant enough to affect pricing or freight
          weight declarations. Running each calculation through the same consistent tool keeps every figure
          precise and consistent.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Cost, and Ease of Use</h2>
        <p style={pStyle}>
          This size to weight calculator is completely free to use, with no hidden charges, subscription
          requirements, or usage limits. There's no signup or account creation needed, you can open the tool
          and get a weight calculation immediately, without providing an email address or any personal
          information.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          All calculations run directly in your browser using the dimensions and material you input. No files
          are involved, since this tool works with numerical dimensions rather than uploaded documents, so
          there's nothing to store or process on a server beyond the instant calculation itself. You can use
          it as many times as you need, for as many different materials and dimensions as your project
          requires, without any restriction.
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
