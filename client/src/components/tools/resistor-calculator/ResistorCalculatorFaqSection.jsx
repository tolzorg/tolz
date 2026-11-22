import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I use a resistor calculator?", a: "Pick the calculator you need. For color codes, select the number of bands and choose each color. For series or parallel, enter your values separated by commas. For a conductor, enter its length, diameter, and conductivity. Click Calculate for the result." },
  { q: "What is a resistor color code calculator?", a: "It is a tool that converts the colored bands on a resistor into its resistance, tolerance, and, for 6-band parts, temperature coefficient, so you do not have to look up each color by hand." },
  { q: "How do I read a 4-band resistor color code?", a: "The first two bands are digits, the third is the multiplier, and the fourth is tolerance. Brown-black-red-gold is 1, 0, ×100, ±5%, which is 1 kΩ." },
  { q: "How do I read a 3-band resistor?", a: "Use the first two bands as digits and the third as the multiplier. With no tolerance band, assume ±20%." },
  { q: "What is the difference between 4-band, 5-band, and 6-band resistors?", a: "A 4-band resistor has two digit bands. A 5-band resistor has three, for finer precision. A 6-band resistor adds a temperature coefficient band." },
  { q: "What is red, red, red, gold?", a: "It is 2, 2, ×100, ±5%, which equals 2.2 kΩ at ±5%." },
  { q: "Why are resistors color coded?", a: "Bands are easy to apply to tiny parts, can be read from any angle, and follow one worldwide standard." },
  { q: "Is learning the resistor color code still useful?", a: "Yes. SMD parts use printed codes, but through-hole resistors with color bands remain common in prototyping, repairs, and education." },
  { q: "How do I calculate resistors in series and parallel?", a: "In series, add the values. In parallel, add the reciprocals and take the reciprocal of the sum. The parallel total is always lower than the smallest resistor." },
  { q: "Does voltage stay the same across parallel resistors?", a: "Yes. Every branch of a parallel circuit has the same voltage, while the current splits according to each branch’s resistance." },
  { q: "How do I find the resistance of a wire?", a: "Use R = L / (A × σ). Enter the length, diameter, and conductivity, or select a material, and the calculator does the rest." },
  { q: "Does temperature change a conductor’s resistance?", a: "In metals, yes. Resistance increases as temperature rises, since heat makes it harder for electrons to move." },
  { q: "Does the resistor color code show wattage?", a: "No. Wattage depends on the physical size of the resistor, not its bands." },
  { q: "Is this resistor calculator free?", a: "Yes. It is free to use, with no hidden fees." },
];

// The supplied FAQ schema writes symbols in plain ASCII (x100, +/-5%,
// kilo-ohm, sigma) and trims one answer, so it is kept verbatim here.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I use a resistor calculator?", a: "Pick the calculator you need. For color codes, select the number of bands and choose each color. For series or parallel, enter your values separated by commas. For a conductor, enter its length, diameter, and conductivity. Click Calculate for the result." },
  { q: "What is a resistor color code calculator?", a: "It is a tool that converts the colored bands on a resistor into its resistance, tolerance, and, for 6-band parts, temperature coefficient." },
  { q: "How do I read a 4-band resistor color code?", a: "The first two bands are digits, the third is the multiplier, and the fourth is tolerance. Brown-black-red-gold is 1, 0, x100, +/-5%, which is 1 kilo-ohm." },
  { q: "How do I read a 3-band resistor?", a: "Use the first two bands as digits and the third as the multiplier. With no tolerance band, assume +/-20%." },
  { q: "What is the difference between 4-band, 5-band, and 6-band resistors?", a: "A 4-band resistor has two digit bands. A 5-band resistor has three, for finer precision. A 6-band resistor adds a temperature coefficient band." },
  { q: "What is red, red, red, gold?", a: "It is 2, 2, x100, +/-5%, which equals 2.2 kilo-ohms at +/-5%." },
  { q: "Why are resistors color coded?", a: "Bands are easy to apply to tiny parts, can be read from any angle, and follow one worldwide standard." },
  { q: "Is learning the resistor color code still useful?", a: "Yes. SMD parts use printed codes, but through-hole resistors with color bands remain common in prototyping, repairs, and education." },
  { q: "How do I calculate resistors in series and parallel?", a: "In series, add the values. In parallel, add the reciprocals and take the reciprocal of the sum. The parallel total is always lower than the smallest resistor." },
  { q: "Does voltage stay the same across parallel resistors?", a: "Yes. Every branch of a parallel circuit has the same voltage, while the current splits according to each branch's resistance." },
  { q: "How do I find the resistance of a wire?", a: "Use R = L / (A x sigma). Enter the length, diameter, and conductivity, or select a material, and the calculator does the rest." },
  { q: "Does temperature change a conductor's resistance?", a: "In metals, yes. Resistance increases as temperature rises, since heat makes it harder for electrons to move." },
  { q: "Does the resistor color code show wattage?", a: "No. Wattage depends on the physical size of the resistor, not its bands." },
  { q: "Is this resistor calculator free?", a: "Yes. It is free to use, with no hidden fees." },
];

const CHART_HEADERS = ["Color", "Digit", "Multiplier", "Tolerance", "Temp. coefficient (ppm/K)"];
const CHART_ROWS = [
  ["Black", "0", "×1", "–", "250"],
  ["Brown", "1", "×10", "±1%", "100"],
  ["Red", "2", "×100", "±2%", "50"],
  ["Orange", "3", "×1,000", "±3%", "15"],
  ["Yellow", "4", "×10,000", "±4%", "25"],
  ["Green", "5", "×100,000", "±0.5%", "20"],
  ["Blue", "6", "×1,000,000", "±0.25%", "10"],
  ["Violet", "7", "×10,000,000", "±0.1%", "5"],
  ["Grey", "8", "×100,000,000", "±0.05%", "1"],
  ["White", "9", "×1,000,000,000", "–", "–"],
  ["Gold", "–", "×0.1", "±5%", "–"],
  ["Silver", "–", "×0.01", "±10%", "–"],
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

export default function ResistorCalculatorFaqSection() {
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

      <Card title="What Is a Resistor and What Does Color Coding Mean?">
        <P>
          A resistor is a small component that limits the flow of electric current in a circuit. It is used to protect LEDs, set voltage levels,
          control signals, and divide voltage. Its strength is measured in ohms (Ω). Larger values like kilohms (kΩ) and megohms (MΩ) are common.
        </P>
        <P>
          Most through-hole resistors are only a few millimeters long, which leaves no room for printed numbers that are easy to read. Manufacturers
          solve this by painting colored bands around the body. Each band stands for a digit, a multiplier, a tolerance, or a temperature
          coefficient. Once you know the system, a few stripes tell you everything you need.
        </P>
      </Card>

      <Card title="What Is the Resistor Color Code? Purpose and Importance">
        <P>
          The resistor color code is a standard way of marking a component’s resistance and accuracy using colors instead of numbers. It is defined
          internationally in IEC 60062, and the same code is used by manufacturers around the world. You can read more about how it works in this{" "}
          <Ext href="https://en.wikipedia.org/wiki/Electronic_color_code">overview of the electronic color code</Ext>.
        </P>
        <P>The code matters for a few practical reasons:</P>
        <List items={[
          ["", "It lets you identify a resistor’s value without any equipment."],
          ["", "Colors wrap around the entire body, so you can read them from any angle, which printed digits cannot do."],
          ["", "Bands stay legible on tiny parts, and they hold up through soldering and handling."],
          ["", "Because it is a worldwide standard, a resistor from any maker reads the same way."],
        ]} />
      </Card>

      <Card title="Why Are Resistors Color Coded?">
        <P>
          Early resistors were small, and printing was not reliable on curved surfaces. Paint bands were cheap to apply with machines, and they could
          be read quickly by assemblers on a production line. Color coding also removed any chance of mixing up a “5” and a “6” on a smudged label.
          Compared with plain numbers, bands are faster to apply, easier to see, and just as accurate once you know the code.
        </P>
      </Card>

      <Card title="A Short History of the Resistor Color Code">
        <P>
          The color code came out of the radio boom in the 1920s, when manufacturers in the United States began marking parts with colors so that
          technicians could identify them quickly. Over the following decades, industry groups refined the system, and it was later standardized
          internationally as IEC 60062. That is the version in use today, and it has hardly changed in decades. Tolerance bands, five-band
          precision parts, and temperature coefficient bands were added as electronics became more demanding.
        </P>
      </Card>

      <Card title="What the Resistor Color Code Calculator Does">
        <P>The tool on this page has four calculators in one:</P>
        <List items={[
          ["Resistor color code calculator:", "Choose 3, 4, 5, or 6 bands, pick each color, and click Calculate. It returns the resistance, tolerance, the minimum-to-maximum range, and (for 6-band parts) the temperature coefficient. A color chart is available beneath the tool for reference."],
          ["Parallel resistor calculator:", "Enter your values separated by commas and get the total resistance, along with a count of how many resistors you entered."],
          ["Series resistor calculator:", "Same input style, with the sum returned instantly."],
          ["Conductor resistance calculator:", "Enter length, diameter, and conductivity (or select a material such as copper), and it calculates the resistance of a round conductor."],
        ]} />
        <P>
          If you use the resistor calculator for decoding, the result shows the value with its tolerance letter, for example ±5% (J). That letter is
          part of the standard tolerance code and appears on datasheets.
        </P>
      </Card>

      <Card title="How to Read a Resistor Color Code Chart">
        <P>
          A resistor color code chart is a table that lists each color next to its meaning. The digit values are the same on every resistor, but the
          meaning of a band changes with its position.
        </P>
        <DataTable headers={CHART_HEADERS} rows={CHART_ROWS} />
        <P>
          To use the chart, hold the resistor with the tolerance band on the right. The tolerance band is usually gold or silver and often sits a
          little apart from the rest. Read the bands from left to right, convert each color to its meaning for that position, then combine them.
        </P>
      </Card>

      <Card title="How to Solve a Resistor Color Code Step by Step">
        <List ordered items={[
          ["", "Count the bands to decide whether you have a 3-, 4-, 5-, or 6-band resistor."],
          ["", "Orient the resistor so the widely spaced or gold/silver band is on the right."],
          ["", "Write down the digit for each significant-figure band."],
          ["", "Apply the multiplier band by moving the decimal or adding zeros."],
          ["", "Read the tolerance band to get the allowed variation."],
          ["", "On a 6-band resistor, read the last band for temperature coefficient."],
        ]} />
        <H3>How to read a 3-band resistor color code</H3>
        <P>
          A 3-band resistor has two digit bands and one multiplier. It has no tolerance band, which means the tolerance is ±20%. Orange-orange-brown
          reads 3, 3, ×10, so the resistor is 330 Ω ±20%. Three-band parts are mostly found in older equipment.
        </P>
        <H3>How to read a 4-band resistor</H3>
        <P>
          The first two bands are digits, the third is the multiplier, and the fourth is tolerance. Red-violet-orange-gold gives 2, 7, ×1,000, which
          is 27 kΩ at ±5%. This is the most common type for hobby projects.
        </P>
        <H3>How to read a 5-band resistor</H3>
        <P>
          Five-band resistors have three digit bands, then a multiplier, then tolerance. The extra digit allows more precise values.
          Brown-black-black-red-brown reads 1, 0, 0, ×100, which is 10 kΩ at ±1%. This is why the resistor calculator asks for the number of bands
          first: the same colors mean different things on a 4-band and a 5-band part.
        </P>
        <H3>How to read a 6-band resistor</H3>
        <P>
          A 6-band resistor has the same layout as a 5-band part, plus a sixth band for temperature coefficient. This value, in parts per million
          per kelvin, shows how much the resistance changes as the part heats or cools. Brown means 100 ppm/K, for example. Lower numbers mean
          steadier values, which is useful in measurement equipment and precision circuits. On some military-grade parts, a fifth band on a 4-band
          resistor can also show reliability, so check the datasheet if you have specialized components.
        </P>
      </Card>

      <Card title="Worked Examples: Red/Red/Red/Gold and Blue Bands">
        <Lead lead="What is red-red-red-gold?">
          Red is 2, red is 2, red as a multiplier is ×100, and gold is ±5%. The resistance is 2,200 Ω, or 2.2 kΩ, ±5%.
        </Lead>
        <Lead lead="What is the number on a blue band?">
          It depends on where it sits. As a digit, blue is 6. As a multiplier, it is ×1,000,000. As a tolerance, it means ±0.25%. As a temperature
          coefficient, it is 10 ppm/K. For example, green-blue-red-gold is 5, 6, ×100 = 5,600 Ω, or 5.6 kΩ, at ±5%.
        </Lead>
      </Card>

      <Card title="Understanding Tolerance and the Resistance Range">
        <P>
          Tolerance is the allowed difference between the marked value and the real value. A 1 kΩ resistor at ±5% can measure anywhere from 950 Ω to
          1,050 Ω. The tool shows this as a range, so you know what to expect when your multimeter shows a number that is close but not exact. If the
          measured value falls outside that range, the part is damaged or has been read incorrectly.
        </P>
      </Card>

      <Card title="How to Remember the Resistor Color Codes">
        <P>You do not need to memorize the whole chart on day one, but a few tricks make it easy:</P>
        <List items={[
          ["Think of the rainbow.", "From red through violet, the colors follow the rainbow: red 2, orange 3, yellow 4, green 5, blue 6, violet 7. Only black 0, brown 1, grey 8, and white 9 sit outside that run."],
          ["Use a mnemonic.", "Take the first letter of each color in order (B, B, R, O, Y, G, B, V, G, W) and build a sentence, such as “Better Be Right Or Your Great Big Values Go Wrong.” One caution: black and blue, and brown and blue, both start with B, so the order is what matters."],
          ["Learn anchors first.", "Brown is 1, red is 2, and gold is ±5%. Most resistors you will meet are 4-band with a gold band."],
          ["Practice with real parts.", "Decode a few resistors, then check yourself with the calculator."],
        ]} />
      </Card>

      <Card title="Is Learning the Color Code a Dying Art Since SMD Parts Do Not Use It?">
        <P>
          Not really. Surface-mount (SMD) resistors are too small for bands and use printed codes instead. A “103” marking, for instance, means 10
          followed by three zeros, which is 10 kΩ, and a marking like “4R7” means 4.7 Ω. These parts dominate modern manufactured boards.
        </P>
        <P>
          But through-hole resistors are still widely used in prototyping, education, repairs, hobby kits, and older equipment. Anyone working with a
          breadboard or fixing older gear will keep seeing colored bands, so the skill still pays off.
        </P>
      </Card>

      <Card title="Why Are Some Resistors Not Color Coded?">
        <P>
          Not every resistor has bands, and there are a few reasons. SMD resistors are too small for painted bands, so they carry printed numbers or
          no marking at all. Large power resistors, such as wirewound types, have enough surface area to print the value and wattage directly on the
          body. Some specialty parts are marked with part numbers instead. In each case, the manufacturer picks whatever marking is most practical
          for the size and use.
        </P>
      </Card>

      <Card title="Do Colorblind Engineers and Hobbyists Struggle With Resistor Colors?">
        <P>
          Yes, many do. Red, brown, and orange can look alike, and so can green and brown, which makes some bands hard to tell apart. People who are
          colorblind usually work around this in practical ways:
        </P>
        <List items={[
          ["", "Measure the resistor with a multimeter instead of relying on the colors."],
          ["", "Buy resistors sorted and labeled by value, or store them in marked bins."],
          ["", "Ask a colleague to double-check unclear parts."],
          ["", "Use good, bright, neutral lighting, since poor light makes confusion worse."],
          ["", "Use SMD or printed-value parts where possible."],
        ]} />
        <P>A multimeter is the best way to confirm any resistor, with or without color vision issues.</P>
      </Card>

      <Card title="Does the Color Code Show Wattage? And How Is It Different From a Wire Color Code?">
        <P>
          A resistor’s color bands do not show its power rating. Wattage depends on the physical size of the part. Common through-hole values are 1/8
          W, 1/4 W, and 1/2 W, and larger sizes carry more. Check the datasheet or compare the size with a known part.
        </P>
        <P>
          Wire color codes are a separate system. They are used to identify the function of a wire, such as live, neutral, or ground in a power
          cable, or the pairs inside a network cable. The resistor code gives a component’s value, while a wire code gives a conductor’s role.
        </P>
      </Card>

      <Card title="Calculating Resistors in Series and Parallel">
        <P>
          Real circuits rarely use a lone resistor. Most combine several, and complex networks can usually be broken down into groups connected in
          series or in parallel. Enter your values in the calculator separated by commas, and it totals them for you.
        </P>
        <H3>How to tell series from parallel</H3>
        <P>
          Look at how the parts connect. Two resistors are in series when they connect end to end along a single path, so the same current must pass
          through both. Resistors are in parallel when both of their ends connect to the same two points, giving current more than one path. If you
          can trace a path through one resistor without passing through the other, they are not in series.
        </P>
        <H3>Resistors in series</H3>
        <P>In series, resistances add up:</P>
        <Formula>R<sub>total</sub> = R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub> + …</Formula>
        <P>
          A 100 Ω and a 220 Ω resistor in series give 320 Ω. The values do not have to match, and the total is always larger than the largest
          individual resistor. The same current flows through every part, while the voltage divides among them in proportion to their resistance.
        </P>
        <H3>Resistors in parallel</H3>
        <P>In parallel, the total follows the reciprocal formula:</P>
        <Formula>1/R<sub>total</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + 1/R<sub>3</sub> + …</Formula>
        <P>
          For two resistors, you can use R_total = (R1 × R2) / (R1 + R2). A 100 Ω and a 220 Ω resistor in parallel give 22,000 / 320 = 68.75 Ω. The
          result is always lower than the smallest resistor. If you have n identical resistors in parallel, divide the value by n.
        </P>
        <H3>Voltage and current in a parallel network</H3>
        <P>
          Every branch in a parallel circuit has the same voltage across it, no matter what its resistance is. What differs is the current:
          lower-resistance branches carry more, and higher-resistance branches carry less. If you remove one branch from an ideal parallel circuit,
          the other branches keep the same current, since their voltage does not change. The total current from the source drops, though, and the
          total resistance goes up.
        </P>
        <H3>Does connecting in series or parallel increase wattage?</H3>
        <P>
          It can raise the combined power rating. When identical resistors share the load, each one handles part of the power. Two identical
          resistors in series or in parallel can handle about twice the power of one. The catch is the total resistance changes too, so you need to
          choose a layout that gives your target value, such as four resistors in a series-parallel arrangement.
        </P>
      </Card>

      <Card title="Finding the Resistance of a Conductor">
        <P>Wires, cables, and traces resist current too. This part of the resistor calculator uses the formula:</P>
        <Formula>R = L / (A × σ)</Formula>
        <P>
          Here L is the length, A is the cross-sectional area, and σ is the conductivity of the material in siemens per meter (S/m). Resistivity is
          the reciprocal of conductivity, so you may also see the equivalent form R = ρL / A.
        </P>
        <P>
          The tool assumes a round conductor, so you only need to enter the length, the diameter, and the conductivity. It works out the area using A
          = π(d/2)². If you do not know the conductivity, select a material such as copper, and the value is filled in for you.
        </P>
        <P>
          Here is a quick example: a copper wire 10 meters long with a diameter of 1 mm. Copper has a conductivity of about 5.96 × 10⁷ S/m. The area
          is about 7.85 × 10⁻⁷ m², so R = 10 / (7.85 × 10⁻⁷ × 5.96 × 10⁷), which is roughly 0.21 Ω. For more on the physics behind it, see this
          explanation of{" "}
          <Ext href="https://en.wikipedia.org/wiki/Electrical_resistivity_and_conductivity">electrical resistivity and conductivity</Ext>.
        </P>
        <H3>What factors affect the resistance of a conductor?</H3>
        <P>Four things set a conductor’s resistance:</P>
        <List items={[
          ["Length (meters):", "Longer conductors have more resistance. Double the length and the resistance doubles."],
          ["Cross-sectional area (square meters):", "Thicker conductors have less resistance. Double the area and it is cut in half."],
          ["Material (conductivity in S/m, or resistivity in Ω·m):", "Copper and silver conduct well, while materials like nichrome resist current far more."],
          ["Temperature (kelvin or °C):", "Heat changes resistance, as the next section explains."],
        ]} />
        <H3>How does temperature affect resistance?</H3>
        <P>
          In metals, resistance rises as temperature rises. Higher temperature makes the atoms vibrate more, which gets in the way of moving
          electrons and makes it harder for current to pass. That is why conductivity values are quoted at a reference temperature, usually 20 °C,
          and why a hot wire carries slightly less current than a cool one at the same voltage. For most hobby work, the effect is small, but it
          matters for long cable runs, heating elements, and precision measurement.
        </P>
        <H3>What happens to current when resistance goes up?</H3>
        <P>
          By Ohm’s law, I = V / R. If voltage stays the same and resistance rises, current falls. Double the resistance and the current drops to
          half.
        </P>
      </Card>

      <Card title="When You Will Need a Resistor Calculator">
        <List items={[
          ["Building and prototyping:", "Confirm the resistor in your hand matches your schematic, such as an LED current-limiting resistor."],
          ["Repairing electronics:", "Burnt resistors often have darkened bands. Decode what is left and compare it to the schematic."],
          ["Sorting loose components:", "Quickly sort a mixed bag of parts into labeled bins."],
          ["Studying electronics:", "Check homework on series-parallel networks and see how tolerance affects real values."],
          ["Reaching non-standard values:", "Standard series like E12 and E24 do not include every value. Combining two parts in series or parallel can get you close."],
          ["Planning wiring:", "Estimate cable resistance to avoid voltage drop in solar, automotive, and low-voltage projects."],
        ]} />
      </Card>

      <Card title="Tips for Accurate Results">
        <List items={[
          ["Confirm the band count.", "Choosing 4-band for a 5-band part is the most common mistake. Count carefully, and do not mistake the body color for a band."],
          ["Orient the resistor correctly.", "Put the tolerance band on the right and read left to right."],
          ["Verify with a multimeter.", "Measure the resistor out of the circuit, since other parts will skew the reading. A value within tolerance confirms your decoding."],
          ["Check the power rating.", "Resistance is only half the story. Verify power with P = I²R so the part does not overheat."],
          ["Use the right units.", "In the conductor calculator, make sure length, diameter, and conductivity are in the units the tool shows."],
        ]} />
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
