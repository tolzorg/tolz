import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How wide should a PCB trace be for 1 amp?", a: "On an outer layer with 1 oz copper and a 10 °C rise, IPC-2221 gives about 12 mil (0.30 mm). Most designers go wider for margin, often 20 mil or more." },
  { q: "How wide should a PCB trace be for 2 amps?", a: "Under the same conditions, about 31 mil (0.78 mm) on an external layer, or about 80 mil (2 mm) on an internal layer." },
  { q: "What is a good temperature rise for PCB traces?", a: "Ten degrees Celsius is a common conservative default. Use less for hot, sealed or long-life products, and confirm that your laminate and nearby parts can handle anything higher." },
  { q: "Why do internal traces need to be wider than external ones?", a: "Inner layers lose heat less effectively because insulating material surrounds them, while outer layers release heat into the air. IPC-2221 reflects this with a lower constant for internal copper." },
  { q: "What is the difference between IPC-2221 and IPC-2152?", a: "IPC-2221 uses older, simpler charts and is generally conservative. IPC-2152 is based on newer testing and considers board thickness and nearby copper planes, so it can be more accurate for demanding designs." },
  { q: "Does copper thickness change the trace width?", a: "Yes. Thicker copper has more cross-sectional area per unit of width, so a 2 oz trace can be about half as wide as a 1 oz trace for the same current." },
  { q: "Does voltage affect PCB trace width?", a: "Not for current capacity. Voltage affects the spacing you need between conductors, not the trace width." },
  { q: "What is the minimum trace width for a PCB?", a: "It depends on your manufacturer. Many standard processes support 5 to 6 mil, and advanced processes go lower. Heavier copper needs wider minimums." },
  { q: "Does the calculator account for vias?", a: "No. It sizes the trace only. Vias have their own current limits, so use multiple vias on high-current paths." },
  { q: "Is this PCB trace width calculator free?", a: "Yes, it is free to use on Tolz." },
];

// The supplied FAQ schema rewords the first answer and adds two questions that
// are not in the visible FAQ list, so it is kept verbatim here.
const FAQ_SCHEMA_ITEMS = [
  { q: "How wide should a PCB trace be for 1 amp?", a: "On an outer layer with 1 oz copper and a 10 °C temperature rise, IPC-2221 gives about 12 mil (0.30 mm). Most designers go wider for margin, often 20 mil or more." },
  FAQ_ITEMS[1],
  { q: "How much current can a 10 mil PCB trace carry?", a: "About 0.9 A on an outer layer with 1 oz copper and a 10 °C temperature rise. On an inner layer, the limit is lower." },
  ...FAQ_ITEMS.slice(2, 8),
  { q: "How do I calculate PCB trace resistance?", a: "Use R = ρ × L ÷ A, where ρ is the resistivity of copper, L is the length and A is the cross-sectional area. The calculator does this once you enter the trace length and ambient temperature." },
  ...FAQ_ITEMS.slice(8),
];

const CURRENT_HEADERS = ["Current", "External layer", "Internal layer"];
const CURRENT_ROWS = [
  ["1 A", "12 mil (0.30 mm)", "31 mil (0.78 mm)"],
  ["2 A", "31 mil (0.78 mm)", "80 mil (2.0 mm)"],
  ["3 A", "54 mil (1.37 mm)", "140 mil (3.56 mm)"],
  ["5 A", "109 mil (2.77 mm)", "283 mil (7.19 mm)"],
  ["10 A", "283 mil (7.19 mm)", "736 mil (18.7 mm)"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 320 }}>
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

export default function PcbTraceWidthCalculatorFaqSection() {
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

      <Card title="What Is a PCB Trace?">
        <P>
          A PCB trace is a thin strip of copper on a printed circuit board that connects one part of a circuit to another. Think of it as the wire
          of a circuit board. Instead of running a separate wire between two pins, the manufacturer etches a copper path into the board during
          fabrication. The trace is held in place by the board’s insulating material, usually FR-4 fiberglass laminate.
        </P>
        <P>
          Traces do one job: they carry electrical energy from point A to point B. Some carry tiny signals between chips, such as data lines,
          clocks and sensor outputs. Others carry real power, such as a battery line, a motor supply or the output of a voltage regulator. A trace
          can run on the outer layers of the board, where it is exposed to air or covered by a solder mask, or on inner layers of a multilayer
          board, where it is sealed inside the laminate.
        </P>
        <P>
          You will find traces in nearly every electronic product, from a simple LED flasher or Arduino shield to phones, laptops, car
          electronics, power supplies and industrial controllers. The width of each trace is a design choice. Signal traces are often thin to save
          space. Power traces need to be wider because they carry more current, and that is the problem this calculator solves.
        </P>
      </Card>

      <Card title="PCB Trace Width Formula and Calculation">
        <P>The IPC-2221 standard provides a formula to calculate PCB trace width based on current, temperature rise, and copper thickness:</P>
        <Formula>I = k × ΔT<sup>0.44</sup> × A<sup>0.725</sup></Formula>
        <P>Where:</P>
        <List items={[
          ["I", "= Current (A)"],
          ["ΔT", "= Temperature rise (°C)"],
          ["A", "= Copper cross-sectional area (mil²)"],
          ["k", "= 0.048 for external layers and 0.024 for internal layers"],
        ]} />
        <H3>Step 1: Calculate Copper Area</H3>
        <P>Rearrange the formula to find the required copper area:</P>
        <Formula>A = (I ÷ (k × ΔT<sup>0.44</sup>))<sup>1/0.725</sup></Formula>
        <H3>Step 2: Calculate Trace Width</H3>
        <P>Once the copper area is known, calculate the trace width:</P>
        <Formula>Width = A ÷ Copper Thickness</Formula>
        <P>Copper thickness in mils can be calculated as:</P>
        <Formula>Thickness = Copper Weight (oz) × 1.378</Formula>
        <H3>Worked Example</H3>
        <P>Let's calculate the trace width for the following conditions:</P>
        <List items={[
          ["Current:", "2 A"],
          ["Temperature rise:", "10°C"],
          ["Copper weight:", "1 oz"],
          ["Layer:", "External"],
        ]} />
        <P>Using the IPC-2221 formula:</P>
        <Formula>A = (2 ÷ (0.048 × 10<sup>0.44</sup>))<sup>1/0.725</sup> ≈ 42.4 mil²</Formula>
        <P>The copper thickness for 1 oz copper is:</P>
        <Formula>1 × 1.378 = 1.378 mil</Formula>
        <P>Therefore, the required trace width is:</P>
        <Formula>Width = 42.4 ÷ 1.378 ≈ 30.8 mil</Formula>
        <P>Final Result:</P>
        <List items={[
          ["External layer:", "30.8 mil (0.78 mm)"],
          ["Internal layer:", "Approximately 80 mil (2.0 mm)"],
        ]} />
        <P>The internal layer requires a wider trace because it has less ability to dissipate heat than an external layer.</P>
        <P>Understanding these calculations makes it easier to verify PCB trace width requirements and select appropriate dimensions for your design.</P>
      </Card>

      <Card title="How to Use the PCB Trace Width Calculator">
        <P>Enter the following details to calculate the required PCB trace width:</P>
        <List items={[
          ["Trace Location:", "Select whether the trace is on an external layer (top or bottom) or an internal layer. This determines the formula constant used in the calculation."],
          ["Maximum Current:", "Enter the maximum continuous current the trace needs to carry. You can use amps (A), milliamps (mA), or microamps (µA). For pulsed loads, use RMS current as a starting point."],
          ["Trace Thickness:", "Enter the copper thickness of the PCB layer. The default is oz/ft². Standard 1 oz copper is approximately 35 µm."],
          ["Maximum Temperature Rise:", "Set the maximum temperature increase allowed above the surrounding temperature. A lower temperature rise requires a wider trace."],
          ["Ambient Temperature:", "Enter the surrounding temperature to calculate the trace's estimated operating temperature."],
          ["Trace Length:", "Enter the trace length to calculate its resistance, voltage drop, and power dissipation."],
        ]} />
        <P>Click Calculate to view the required trace width and copper cross-sectional area. You can change the output units to suit your preference.</P>
        <P>To compare different designs, adjust one input at a time, such as copper thickness or allowable temperature rise, and recalculate.</P>
      </Card>

      <Card title="What Is the Importance of PCB Trace Width in PCB Design?">
        <P>
          Trace width affects whether a board works reliably over its lifetime, not only on the day you test it. A trace that is too narrow for its
          current heats up. That heat can discolor and weaken the laminate, lift the copper from the board, or push nearby components past their
          rated temperature. In the worst case the trace opens like a fuse and the board fails.
        </P>
        <P>
          Width also controls <Link to="/tools/voltage-drop-calculator" className="inline-home-link">voltage drop</Link>. A narrow trace has higher resistance, so some voltage is lost before it reaches the load. On a
          low-voltage rail such as 1.8 V or 3.3 V, even a small loss can cause resets, noisy behavior or weak performance.
        </P>
        <P>
          Going too wide has costs too. Oversized traces use board area, make dense routing harder and can add unwanted capacitance. A good design
          uses enough copper to be safe and no more than it needs. That balance is what a PCB trace width calculator helps you find.
        </P>
      </Card>

      <Card title="What Are the Factors That Determine PCB Trace Width?">
        <P>Several things decide the final width, and a few of them are easy to overlook:</P>
        <List items={[
          ["Current.", "The more current, the more copper area you need. The relationship is not a straight line, which is why simple rules of thumb drift off at higher currents."],
          ["Allowed temperature rise.", "A tighter limit demands a wider trace."],
          ["Copper thickness.", "Heavier copper gives more area for each mil of width."],
          ["Layer location.", "Inner layers shed heat poorly compared with outer layers."],
          ["Trace length.", "It does not change the safe current, but it sets the resistance and voltage drop."],
          ["Ambient temperature.", "A hot enclosure leaves less thermal headroom."],
          ["Board construction.", "Board thickness, nearby copper planes, thermal vias and airflow all change how well heat leaves the trace."],
          ["Manufacturing limits.", "Your fabricator sets minimum widths, spacing and available copper weights."],
        ]} />
        <P>The calculator covers the first six directly. The last two are why the result is a strong starting point, not a final guarantee.</P>
      </Card>

      <Card title="How Much Current Can a PCB Trace Carry?">
        <P>
          {" "}<Link to="/tools/pcb-trace-current-calculator" className="inline-home-link">Current capacity</Link> depends on the trace’s cross-sectional area, its location and how much temperature rise you allow. A common question is
          whether a smaller trace width limits the current. It does. A narrower trace has less copper, higher resistance and less surface to shed
          heat, so it reaches the temperature limit at a lower current. Width is, in practice, what sets the current limit of a trace.
        </P>
        <P>Here are the widths IPC-2221 gives for 1 oz copper with a 10 °C rise:</P>
        <DataTable headers={CURRENT_HEADERS} rows={CURRENT_ROWS} />
        <P>
          Going the other way, a 10 mil external trace in 1 oz copper can carry about 0.9 A at a 10 °C rise. With 2 oz copper, you can cut the
          widths above roughly in half. For currents of 10 A and up, a copper pour or a wide polygon is usually more practical than a single trace.
          The original IPC-2221 data covers currents up to about 35 A, so treat anything near or beyond that range with caution.
        </P>
      </Card>

      <Card title="What Is the Rule of Thumb for PCB Trace Width?">
        <P>
          You will often hear that a 1 oz outer trace needs about 10 mil per amp. It is easy to remember, but it only holds up at low current. At 1
          A the rule says 10 mil, and IPC-2221 says about 12 mil, which is close. At 5 A the rule says 50 mil, while IPC-2221 calls for about 109
          mil, more than twice as much.
        </P>
        <P>
          The rule fails because width does not grow in proportion to current. Doubling the current needs about 2.6 times the width. Use the rule
          for a rough sketch if you like, but run the real numbers before you finalize any trace above 1 A.
        </P>
      </Card>

      <Card title="Internal vs. External Trace Width">
        <P>
          Outer-layer copper can release heat into the air. Inner-layer copper is buried in laminate and prepreg, which conducts heat poorly.
          IPC-2221 reflects this with a smaller constant for internal traces, so an internal trace has to be about two and a half times wider than
          an external one for the same current and temperature rise.
        </P>
        <P>
          When board space allows, route high-current nets on outer layers. If you must use an inner layer, as on dense multilayer boards, set the
          calculator to internal and plan for the extra width. Real inner-layer behavior also depends on nearby copper planes, which the basic
          IPC-2221 model does not capture.
        </P>
      </Card>

      <Card title="How Copper Weight Affects Trace Width">
        <P>
          Copper weight is stated in ounces per square foot, which describes how thick the layer is when that much copper is spread evenly over
          one square foot. One ounce is about 35 µm, two ounces about 70 µm. Since current capacity depends on cross-sectional area, doubling the
          copper thickness lets you use about half the width for the same area.
        </P>
        <P>
          This helps when space is tight. A 2 oz outer layer carries the same current in a much narrower trace. The trade-off is cost and
          fine-pitch routing, because heavier copper needs wider minimum traces and spacing. Test these options in the calculator before you lock
          in a stackup with your manufacturer.
        </P>
      </Card>

      <Card title="Understanding Temperature Rise">
        <P>
          Temperature rise is the difference between the trace temperature and the ambient temperature around it. It is the input designers most
          often set carelessly. If your enclosure sits at 60 °C and you allow a 30 °C rise, the copper reaches 90 °C. That approaches the limit of
          common FR-4 laminate and may exceed what nearby parts can take.
        </P>
        <P>
          A 10 °C rise is a sound default for general designs. Use a smaller rise for packed assemblies, sealed enclosures or products with long
          service lives. A higher rise can work for short or intermittent loads, but check the board’s glass transition temperature and the
          ratings of connected components first.
        </P>
      </Card>

      <Card title="PCB Trace Resistance, Voltage Drop and Power Loss">
        <P>
          Current capacity is only part of the picture. PCB traces also have resistance, which can cause voltage drop and power loss, especially in
          long or narrow traces.
        </P>
        <P>{" "}<Link to="/tools/pcb-trace-resistance-calculator" className="inline-home-link">Trace resistance</Link> is calculated using:</P>
        <Formula>R = ρ × L ÷ A</Formula>
        <P>Where ρ is copper resistivity, L is trace length, and A is its cross-sectional area.</P>
        <P>The resulting voltage drop and power loss are:</P>
        <Formula>V = I × R</Formula>
        <Formula>P = I² × R</Formula>
        <P>
          For example, a 1-inch-long, 31-mil-wide trace with 1 oz copper has approximately 16 mΩ resistance. At 2 A, this produces a voltage drop of
          about 32 mV and a power loss of 64 mW.
        </P>
        <P>
          Although these values seem small, they can affect low-voltage power rails and battery-powered circuits. Also, copper resistance increases
          by approximately 0.4% per °C as temperature rises.
        </P>
        <P>To reduce voltage drop and power loss, use wider traces, shorter routing paths, or thicker copper.</P>
      </Card>

      <Card title="Is Voltage Important for PCB Trace Width?">
        <P>
          Not for the width calculation. The width needed to carry a current depends on the current, copper area and temperature rise, not on the
          voltage. A 5 A trace on a 5 V board and a 5 A trace on a 48 V board need the same copper to stay cool.
        </P>
        <P>
          Voltage matters for spacing. The higher the voltage, the more clearance you need between conductors to prevent arcing or leakage across
          the board surface. For external, uncoated conductors at sea level, IPC-2221 calls for roughly 0.6 mm between 50 V and 100 V, about 1.25
          mm at 250 V and about 2.5 mm at 500 V. Conformal coating, altitude, internal layers and safety standards for mains-connected products can
          all change these values, so check the current standard for your application. For a high-voltage board, use the current table above to
          set the width and the IPC clearance tables to set the spacing.
        </P>
      </Card>

      <Card title="What Is the Minimum Trace Width and Spacing for a PCB?">
        <P>
          The minimum depends on your manufacturer. Many standard fabrication services handle 5 to 6 mil (about 0.13 to 0.15 mm) traces with the
          same spacing, and advanced processes go down to 3 or 4 mil at a higher price. Heavier copper raises the minimum, since thick copper is
          harder to etch cleanly. A 2 oz layer may need 8 to 10 mil or more.
        </P>
        <P>
          For signal lines, the minimum is usually a manufacturing question. For power lines, the calculator result will almost always exceed it.
          Always check your fabricator’s design rules before finalizing the layout, because going below their minimums can raise cost or cause
          yield problems.
        </P>
      </Card>

      <Card title="How Do You Calculate Trace Width for Two Traces in Parallel?">
        <P>
          Sometimes one wide trace does not fit, so designers split the current across two traces. If both traces have the same length, width and
          copper thickness, they share current evenly, and each carries half. Enter half the total current into the calculator and use the
          resulting width for each trace.
        </P>
        <P>
          Because width grows faster than current, two traces each sized for half the current add up to less total width than one trace sized for
          the full amount, about 20% less on paper. Be conservative, though. If the traces run close together, they heat each other, and any
          difference in length or resistance will push more current into one path. When in doubt, make the combined width equal to the
          single-trace result.
        </P>
      </Card>

      <Card title="Why Do We Use Copper for PCB Traces?">
        <P>
          Copper has very low electrical resistivity. Among common metals, only silver conducts better, and silver costs far more. Copper is also
          easy to laminate onto boards, etches cleanly, solders well and moves heat away from the trace effectively. That combination of
          conductivity, workability and cost is why nearly every PCB uses it, and the calculator’s resistance output relies on standard copper
          resistivity.
        </P>
      </Card>

      <Card title="How Do You Arrange a PCB Trace, and Why Do Traces Angle?">
        <P>A few layout habits make the calculator result hold up on a real board.</P>
        <List items={[
          ["Use 45-degree bends or curves instead of sharp 90-degree corners.", "Older etching processes could trap acid in sharp corners. Today the bigger reasons are cleaner current flow, better signal behavior at high speed and a neater layout. The 45-degree angle is the standard."],
          ["Keep power traces short and direct.", "Shorter runs mean less resistance and less voltage drop."],
          ["Watch the narrowest point.", "A trace is only as capable as its narrowest section. Necks at pads, between pins and through vias can become the bottleneck."],
          ["Use pours for large currents.", "Where the width reaches several millimeters, a copper pour is easier to route and spreads heat better."],
          ["Use multiple vias.", "A single via carries far less current than a wide trace, so add several vias wherever a high-current net changes layers."],
          ["Keep sensitive signals away from noisy power traces.", "Switching currents can couple into nearby lines."],
        ]} />
      </Card>

      <Card title="When Do You Need a PCB Trace Width Calculator?">
        <P>Any design that carries more than a trivial current benefits from calculating width. Common cases include:</P>
        <Lead lead="Power supplies and regulators.">
          Buck converters, LDOs and battery chargers push enough current that undersized traces cause heat and regulation errors.
        </Lead>
        <Lead lead="Motor and relay drivers.">
          Inductive loads draw high currents, sometimes in bursts. Size for the sustained current, then add margin for transients.
        </Lead>
        <Lead lead="LED lighting boards.">
          High-power LED strings can draw several amps, and voltage drop along narrow traces causes uneven brightness.
        </Lead>
        <Lead lead="USB-C and fast-charging paths.">Higher-power profiles need properly sized VBUS and ground return traces.</Lead>
        <Lead lead="Automotive and industrial controllers.">Wide temperature ranges and long service lives make thermal margin essential.</Lead>
        <Lead lead="Hobby and prototype boards.">
          Even a quick Arduino shield or breakout board benefits from checking the width for 1 A, 3 A or 5 A before ordering.
        </Lead>
      </Card>

      <Card title="Limits of IPC-2221 and Where IPC-2152 Fits">
        <P>
          The IPC-2221 charts come from decades-old test work, and the method is generally seen as conservative, especially for internal layers.
          IPC-2152 is the newer standard. It draws on more extensive testing and accounts for board thickness, nearby copper planes and the
          thermal conductivity of surrounding materials.
        </P>
        <P>This tool gives general engineering guidance and is best used for early design and planning. Real trace performance also depends on:</P>
        <List items={[
          ["", "Board stackup construction"],
          ["", "Copper distribution around the trace"],
          ["", "Enclosure design and airflow"],
          ["", "Ambient operating temperature"],
          ["", "Thermal vias and heat-spreading paths"],
          ["", "The overall cooling strategy of the product"],
        ]} />
        <P>
          For most everyday designs, the IPC-2221 result is a safe starting width. For high-current, thermally critical or cost-sensitive boards,
          treat it as a baseline and confirm it with IPC-2152 data, thermal simulation or a prototype measurement. Always review your final design
          against your fabricator’s capabilities and any standards that apply to your product. You can read more about the standards body at{" "}
          <Ext href="https://www.ipc.org/">IPC</Ext>, and{" "}
          <Ext href="https://en.wikipedia.org/wiki/Printed_circuit_board">this overview of printed circuit boards</Ext> explains how boards are
          built.
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
