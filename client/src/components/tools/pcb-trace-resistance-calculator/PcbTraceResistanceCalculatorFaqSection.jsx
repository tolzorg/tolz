import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate PCB trace resistance?", a: "Use R = ρ × L ÷ (W × T). Multiply width by copper thickness for the cross-sectional area, then multiply resistivity by length and divide by that area. The calculator does this and handles unit conversion for you." },
  { q: "How do I quickly estimate PCB trace resistance?", a: "Divide the trace length by its width to count squares, then multiply by 0.48 mΩ for 1 oz copper at 20 °C. A trace 100 mm long and 1 mm wide has 100 squares, or about 48 mΩ." },
  { q: "What is the resistance of a 1 oz copper trace?", a: "A 1 oz trace has a sheet resistance of about 0.48 mΩ per square at 20 °C. The total depends on how many squares the trace contains." },
  { q: "Do turns in a PCB trace add resistance?", a: "Not by themselves. DC resistance depends on path length and cross-section. A 90° corner does concentrate current, but it counts as only about 0.56 of a square, so measuring along the centerline gives a slightly conservative result." },
  { q: "How do I measure PCB trace resistance accurately?", a: "Use a four-wire (Kelvin) method or a milliohm meter. A regular two-wire multimeter adds lead and contact resistance that can be larger than the trace itself." },
  { q: "Does trace resistance change with temperature?", a: "Yes. Copper’s resistance rises about 0.393% per °C, so a trace at 85 °C has roughly 25% higher resistance than at 20 °C." },
  { q: "How do I find the voltage drop across a PCB trace?", a: "Multiply the trace resistance by the current flowing through it (V = I × R). Enter the current in the tool and it returns the drop along with the resistance." },
  { q: "How wide should a PCB trace be for a given current?", a: "That depends on the allowed temperature rise, copper weight and layer, and is covered by IPC-2221 style charts. Use the resistance calculator alongside them to confirm the voltage drop is also acceptable." },
  { q: "Is this PCB trace resistance calculator free?", a: "Yes, it is free to use with no signup needed." },
  { q: "Can I use it for metals other than copper?", a: "Yes. Replace the resistivity and the temperature coefficient with the values for your material." },
  { q: "Does it account for vias and skin effect?", a: "No. It calculates DC resistance of a straight trace. Add via resistance separately, and use a dedicated AC model for high-frequency work." },
  { q: "Why is my measured resistance different from the calculated value?", a: "Common causes include plating thickness variation, etching that reduces the actual width, probe and lead resistance, temperature differences, and extra length from corners." },
];

// The supplied FAQ schema covers 8 of the questions above, with straight
// apostrophes and one answer slightly reworded.
const FAQ_SCHEMA_QUESTIONS = [
  "How do I calculate PCB trace resistance?",
  "How do I quickly estimate PCB trace resistance?",
  "Do turns in a PCB trace add resistance?",
  "How do I measure PCB trace resistance accurately?",
  "Does trace resistance change with temperature?",
  "How do I find the voltage drop across a PCB trace?",
  "Is this PCB trace resistance calculator free?",
  "Can I use it for metals other than copper?",
];
const FAQ_SCHEMA_OVERRIDES = {
  "Do turns in a PCB trace add resistance?": "Not by themselves. DC resistance depends on path length and cross-section. A 90° corner concentrates current but counts as only about 0.56 of a square, so measuring along the centerline gives a slightly conservative result.",
};
const straight = (s) => s.replace(/’/g, "'");

const COPPER_HEADERS = ["Copper weight", "Approx. thickness", "Sheet resistance at 20 °C"];
const COPPER_ROWS = [
  ["0.5 oz", "17.5 µm (0.69 mil)", "~0.96 mΩ/sq"],
  ["1 oz", "35 µm (1.37 mil)", "~0.48 mΩ/sq"],
  ["2 oz", "70 µm (2.74 mil)", "~0.24 mΩ/sq"],
  ["3 oz", "105 µm (4.11 mil)", "~0.16 mΩ/sq"],
];

const METAL_HEADERS = ["Metal", "Resistivity (Ω·m)"];
const METAL_ROWS = [
  ["Silver", "1.59 × 10⁻⁸"], ["Copper", "1.68 × 10⁻⁸"], ["Gold", "2.44 × 10⁻⁸"],
  ["Aluminum", "2.82 × 10⁻⁸"], ["Nickel", "6.99 × 10⁻⁸"],
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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 300 }}>
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

export default function PcbTraceResistanceCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.filter((item) => FAQ_SCHEMA_QUESTIONS.includes(item.q)).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is PCB Trace Resistance?">
        <P>
          PCB trace resistance is the opposition a copper track offers to the flow of electric current. It depends mainly on the trace's length,
          width, thickness, material, and temperature.
        </P>
        <P>The resistance of a PCB trace can be calculated using the following formula:</P>
        <Formula>R = ρ × L ÷ (W × T) × [1 + α(T<sub>amb</sub> − T<sub>ref</sub>)]</Formula>
        <P>Where:</P>
        <List items={[
          ["ρ (rho):", "Resistivity of the copper"],
          ["L:", "Trace length"],
          ["W:", "Trace width"],
          ["T:", "Copper thickness"],
          ["α (alpha):", "Temperature coefficient of copper"],
          ["Tₐₘᵦ:", "Operating temperature"],
          ["Tᵣₑf:", "Reference temperature at which resistivity is measured"],
        ]} />
        <P>
          The formula calculates resistance based on the trace's physical dimensions and material properties, making it useful during PCB design
          when the board has not yet been manufactured.
        </P>
        <P>
          For copper at 20 °C, resistivity is approximately 1.68 × 10⁻⁸ Ω·m, while the commonly used annealed copper reference value is 1.724 ×
          10⁻⁸ Ω·m. Actual PCB copper values are generally close to these figures.
        </P>
        <P>
          Once the trace resistance is known, Ohm's law (V = I × R) can be used to estimate <Link to="/tools/voltage-drop-calculator" className="inline-home-link">voltage drop</Link> at a given current. This helps designers
          evaluate power losses and ensure reliable power delivery across the PCB.
        </P>
      </Card>

      <Card title="How Do I Quickly Estimate PCB Trace Resistance in a Few Seconds?">
        <P>
          The quickest way to estimate PCB trace resistance is the squares method. Simply divide the trace length by its width to get the number of
          squares, then multiply by copper sheet resistance.
        </P>
        <P>For 1 oz copper at 20°C, the sheet resistance is approximately 0.48 mΩ per square.</P>
        <P>For example:</P>
        <List items={[
          ["", "A 50 mm long, 0.5 mm wide trace has 100 squares, giving approximately 48 mΩ."],
          ["", "A 20 mm long, 2 mm wide trace has 10 squares, giving approximately 4.8 mΩ."],
        ]} />
        <P>
          For quick mental calculations, use 0.5 mΩ per square for 1 oz copper. Remember that resistance increases by roughly 0.4% per °C as
          temperature rises.
        </P>
        <P>
          This method is ideal for quick estimates. For more accurate results, different copper weights, or temperature adjustments, use a PCB
          trace resistance calculator.
        </P>
      </Card>

      <Card title="How to Use the PCB Trace Resistance Calculator">
        <P>The tool has a short list of inputs, and each one has its own unit selector:</P>
        <List items={[
          ["Trace width (W).", "Enter the width of the routed trace. Units range from nanometers to inches, including mil."],
          ["Length (L).", "Enter the full routed length of the trace in the unit you prefer."],
          ["Trace thickness (T).", "Enter the copper thickness directly, or use ounces per square foot if your fabricator quotes copper by weight."],
          ["Ambient temperature.", "Enter the temperature the board will operate at. You can use °C, °F or kelvins."],
          ["Resistivity (ρ) and temperature coefficient (α).", "These are set to copper by default. To calculate for another metal, replace both values with the ones for that material."],
          ["Current (optional).", "Enter a current in amperes, milliamperes or microamperes to get the voltage drop along the trace."],
        ]} />
        <P>
          Click Calculate, and the result shows the trace resistance. If you enter a current, it also shows the voltage drop. Changing any field and
          calculating again makes the tool useful for quick what-if checks, such as “What happens if I widen this trace to 0.5 mm?”
        </P>
      </Card>

      <Card title="Trace Width, Length and Copper Thickness Explained">
        <P>
          Width and length come straight from your layout software. Measure the actual routed length of the net, not the straight-line distance
          between pads. A trace that snakes around components can be much longer than it looks. If the width changes along the route, split the
          trace into segments, calculate each one, and add the resistances together.
        </P>
        <P>Copper thickness is usually specified as weight per square foot:</P>
        <DataTable headers={COPPER_HEADERS} rows={COPPER_ROWS} />
        <P>
          A square of 1 oz copper has about 0.48 mΩ of resistance no matter how big the square is. That is why the squares method works, and why
          doubling both the width and the length of a trace leaves its resistance unchanged.
        </P>
        <P>
          Outer layers on a finished board are often thicker than the nominal weight because of plating, while inner layers stay close to nominal.
          Check your fabricator’s stackup if you need tighter numbers.
        </P>
      </Card>

      <Card title="Do Turns in a PCB Trace Create Additional Resistance?">
        <P>
          A turn does not add resistance on its own. For DC current, what counts is the length of the path and the cross-section of the copper, so
          a trace with bends has the same resistance as a straight trace of the same length, width and thickness.
        </P>
        <P>
          Corners do change how current moves, though. At a sharp 90° bend, current bunches up along the inside edge and spreads out in the outer
          corner. In the squares method, a 90° corner counts as roughly 0.56 of a square rather than a full one. This means that adding up the
          length along the centerline of the trace gives a slightly higher resistance than the real value. The effect is small, and it errs on the
          safe side.
        </P>
        <P>
          In practice, a few corners barely change the result. A route with dozens of turns, such as a long serpentine trace, can pick up a small
          difference, and using 45° bends or rounded corners reduces current crowding. Corners matter far more for high-frequency signals and
          impedance than they do for DC resistance. The calculator treats the trace as a uniform rectangle, so enter the centerline length and
          treat the result as a close, slightly conservative estimate.
        </P>
      </Card>

      <Card title="How Temperature Changes Trace Resistance">
        <P>Copper resistance increases as temperature rises. The relationship is approximately linear:</P>
        <Formula>R(T) = R<sub>20</sub> × [1 + α(T − 20)]</Formula>
        <P>
          For copper, the temperature coefficient (α) is approximately 0.00393/°C. This means resistance increases by about 0.4% for every 1°C
          rise.
        </P>
        <P>For example:</P>
        <List items={[
          ["", "At 85°C, resistance increases by approximately 25%."],
          ["", "At 105°C, resistance increases by approximately 33%."],
        ]} />
        <P>
          This matters because traces that perform well at room temperature may experience greater voltage drop inside hot enclosures or near
          power components. Always enter the expected maximum operating temperature for more accurate results.
        </P>
        <P>
          Note: Copper resistivity values are commonly referenced at either 20°C or 25°C. Keep the reference temperature consistent when using
          resistivity and temperature coefficient values.
        </P>
      </Card>

      <Card title="Calculating Voltage Drop and Power Loss">
        <P>
          Once the trace resistance is known, Ohm’s law can be used to calculate voltage drop. Power loss can also be calculated using P = I² × R,
          which represents the heat generated in the copper trace.
        </P>
        <P>
          Example: Consider a 1 oz copper trace that is 100 mm long and 0.25 mm wide. It has 400 squares and a resistance of approximately 0.192 Ω
          at 20 °C.
        </P>
        <P>At 1 A:</P>
        <List items={[
          ["Voltage drop:", "0.192 V"],
          ["Power loss:", "0.192 W"],
        ]} />
        <P>At 85 °C, the resistance increases to approximately 0.241 Ω, resulting in a 0.241 V drop.</P>
        <P>Widening the trace to 1 mm reduces its resistance to one-quarter, bringing the voltage drop down to approximately 48 mV at 1 A.</P>
        <P>
          This shows how <Link to="/tools/pcb-trace-width-calculator" className="inline-home-link">trace width</Link> and temperature affect voltage drop and power loss. However, resistance alone does not determine the safe
          {" "}<Link to="/tools/pcb-trace-current-calculator" className="inline-home-link">current capacity</Link> of a trace. You must also consider its allowable temperature rise when designing your PCB.
        </P>
      </Card>

      <Card title="Copper and Other Metals">
        <P>
          Copper covers nearly every PCB, but the tool accepts any resistivity and temperature coefficient, so you can use it for other conductors.
          Typical resistivity values at 20 °C:
        </P>
        <DataTable headers={METAL_HEADERS} rows={METAL_ROWS} />
        <P>
          Aluminum shows up on metal-core boards and wire-bond pads. Gold and nickel matter mostly for plating layers, which add little bulk
          conductance compared with the copper beneath them. Each metal also has its own temperature coefficient, so change α along with ρ. The
          resistivity field accepts several units, including Ω·m, Ω·cm and Ω·mm, which saves you from converting by hand.
        </P>
      </Card>

      <Card title="How Do You Measure the Resistance of a PCB Trace?">
        <P>
          Measuring a trace is the best way to check a calculation, but it is harder than it sounds. Most traces are only a few milliohms to a few
          hundred milliohms, and a standard two-wire multimeter cannot read that accurately. The probe leads and the contact points add anywhere
          from a tenth of an ohm to a full ohm, which can swamp the trace itself.
        </P>
        <P>
          The reliable method is a four-wire measurement, also called Kelvin sensing. One pair of probes pushes a known current through the trace,
          and a second pair measures the voltage across it at the two points of interest. Because the voltage probes carry almost no current, lead
          and contact resistance drop out of the reading. Divide the measured voltage by the test current to get resistance. The{" "}
          <Ext href="https://en.wikipedia.org/wiki/Four-terminal_sensing">four-terminal sensing</Ext> page explains the setup in detail. A
          dedicated milliohm meter does all of this automatically.
        </P>
        <P>Some practical tips:</P>
        <List items={[
          ["", "Keep the test current modest, so the trace does not heat up and change its own resistance."],
          ["", "Place the voltage probes right at the ends of the section you want to measure, not farther out on the pads."],
          ["", "Note the board temperature, and enter the same temperature in the calculator to compare like with like."],
          ["", "If you only have a power supply and a voltmeter, you can run a known current through the trace and read the drop across it."],
        ]} />
        <P>If the measured value is higher than the calculated one, see the list of common causes in the FAQ below.</P>
      </Card>

      <Card title="When You Need to Calculate Trace Resistance">
        <Lead lead="Power distribution.">
          Motor drivers, LED arrays and battery-powered products carry enough current that a few tens of milliohms produce visible drop and heat.
        </Lead>
        <Lead lead="Current sensing.">
          Some designs deliberately use a copper trace as a shunt. Knowing the resistance at operating temperature lets you calibrate the reading,
          and the 0.39%/°C drift often needs compensation.
        </Lead>
        <Lead lead="Precision analog circuits.">Long traces to reference pins or in feedback paths can introduce offset errors.</Lead>
        <Lead lead="Low-voltage logic.">A 1.0 V or 1.2 V core supply leaves very little room for IR drop between regulator and processor.</Lead>
        <Lead lead="Debugging.">
          If a board delivers less voltage than expected at the load, comparing the measured drop with a calculated value tells you whether the
          trace is to blame.
        </Lead>
        <Lead lead="Cost trade-offs.">
          Choosing between 1 oz and 2 oz copper, or between a wider trace and a plane, is easier with numbers in hand.
        </Lead>
      </Card>

      <Card title="What the Calculator Does Not Model">
        <P>
          The tool calculates DC resistance of a uniform rectangular trace, which covers the great majority of board-level checks. A few cases need
          extra attention:
        </P>
        <List items={[
          ["High frequency.", "The skin effect pushes current toward the surface of the conductor. In copper the skin depth is about 66 µm at 1 MHz, so a 35 µm trace is mostly unaffected at that frequency, but AC resistance grows well above DC in the tens of megahertz and higher."],
          ["Vias.", "Each via adds its own resistance, usually a few milliohms. Power paths that change layers should include several in parallel."],
          ["Current crowding.", "Sharp corners and abrupt width changes concentrate current and slightly change the effective resistance."],
          ["Current capacity.", "Resistance tells you the voltage drop, but allowable current depends on temperature rise, covered by standards such as IPC-2221. A trace needs to pass both checks."],
        ]} />
      </Card>

      <Card title="Ways to Reduce Trace Resistance">
        <P>
          Widening the trace is the cheapest fix, since resistance falls in direct proportion to width. Shortening the route comes next, then
          moving to heavier copper. If the layout allows, a pour or plane has far lower resistance than a track. Parallel traces on adjacent layers
          stitched with vias also help. Keep power traces away from heat sources so the temperature term does not erode your margin.
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
