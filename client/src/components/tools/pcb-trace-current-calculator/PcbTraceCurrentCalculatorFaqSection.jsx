import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How much current can a PCB trace carry?", a: "It depends on width, copper thickness, allowed temperature rise and whether the trace is internal or external. For example, a 20 mil, 1 oz external trace can carry about 1.46 A at a 10 °C rise under IPC-2221." },
  { q: "How wide should a PCB trace be for 1 amp?", a: "On 1 oz outer copper with a 10 °C rise, about 12 mil (0.3 mm). Most designers go wider, often 20 mil or more, for margin and lower voltage drop." },
  { q: "How do I calculate PCB trace max current?", a: "Use the IPC-2221 formula, I = k × ΔT^0.44 × A^0.725, where k is 0.048 for external layers and 0.024 for internal layers, and A is the cross-section in square mils. The calculator does this for you." },
  { q: "What is the maximum current rating for a PCB trace?", a: "There is no fixed rating. It changes with width, copper weight, layer and temperature rise, so you have to calculate it for each trace." },
  { q: "What does 1 oz copper mean on a PCB?", a: "It means one ounce of copper spread over one square foot, which equals a thickness of about 1.37 mil or 35 µm." },
  { q: "Why do internal traces carry less current than external ones?", a: "Internal traces are insulated by laminate and cannot shed heat to the air as easily. IPC-2221 reflects this with a lower constant, which gives internal traces roughly half the capacity of an equal external trace." },
  { q: "What temperature rise should I use?", a: "Ten degrees Celsius is a safe general-purpose choice. Use 20 to 30 °C only if your enclosure, components and board material can tolerate the extra heat." },
  { q: "How hot is too hot for a PCB trace?", a: "Keep the trace well below the glass transition temperature of your board material and within the ratings of nearby parts. Remember to add your worst-case ambient temperature to the rise." },
  { q: "Why did my trace burn out at a low current?", a: "Common causes are a narrow spot in the path, a single via, inrush current, a short circuit or copper that came out thinner than designed." },
  { q: "Does trace length affect current capacity?", a: "Not under IPC-2221, which addresses cross-sectional area and temperature rise. Length does affect resistance, voltage drop and total power loss, which is why the calculator reports those separately." },
  { q: "Does voltage change how much current a trace can carry?", a: "No. Current capacity depends on the copper and the temperature rise. Voltage affects the spacing you need between conductors." },
  { q: "Can I use this for pulsed or high-frequency currents?", a: "The result is valid for continuous DC current. For repeating pulses, check the RMS current against the result. Short surges, high-frequency skin effect and fault currents need separate analysis." },
  { q: "Is IPC-2221 still accurate?", a: "It is a conservative and widely accepted method, but IPC-2152 reflects more recent testing and accounts for board thickness and nearby planes. IPC-2221 works well for quick checks, and prototype testing is recommended for demanding designs." },
  { q: "Is this PCB trace current calculator free?", a: "Yes, it is free to use." },
];

// The supplied FAQ schema trims or rewords a few answers.
const FAQ_SCHEMA_OVERRIDES = {
  "How much current can a PCB trace carry?": "It depends on width, copper thickness, allowed temperature rise and whether the trace is internal or external. A 20 mil, 1 oz external trace can carry about 1.46 A at a 10 °C rise under IPC-2221.",
  "How do I calculate PCB trace max current?": "Use the IPC-2221 formula, I = k × ΔT^0.44 × A^0.725, where k is 0.048 for external layers and 0.024 for internal layers, and A is the cross-section in square mils.",
  "What is the maximum current rating for a PCB trace?": "There is no fixed rating. It changes with width, copper weight, layer and temperature rise, so it must be calculated for each trace.",
  "Why do internal traces carry less current than external ones?": "Internal traces are insulated by laminate and cannot shed heat to the air as easily. IPC-2221 reflects this with a lower constant, giving internal traces roughly half the capacity of an equal external trace.",
  "How hot is too hot for a PCB trace?": "Keep the trace well below the glass transition temperature of your board material and within the ratings of nearby parts. Add your worst-case ambient temperature to the temperature rise.",
  "Does trace length affect current capacity?": "Not under IPC-2221, which addresses cross-sectional area and temperature rise. Length does affect resistance, voltage drop and total power loss.",
};

const CAPACITY_HEADERS = ["Trace width", "1 oz external", "2 oz external", "1 oz internal"];
const CAPACITY_ROWS = [
  ["10 mil (0.25 mm)", "0.88 A", "1.46 A", "0.44 A"],
  ["20 mil (0.51 mm)", "1.46 A", "2.41 A", "0.73 A"],
  ["50 mil (1.27 mm)", "2.83 A", "4.68 A", "1.41 A"],
  ["100 mil (2.54 mm)", "4.68 A", "7.75 A", "2.34 A"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 380 }}>
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

export default function PcbTraceCurrentCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is PCB Trace Current and Where Is It Used?">
        <P>
          PCB trace current is the amount of current that flows through a copper trace on a printed circuit board. Every trace carries some, but
          the amount varies a lot. A trace that connects two logic pins might carry a few milliamps. A trace feeding a motor driver or a battery
          input might carry several amps for as long as the device is on.
        </P>
        <P>
          Copper has resistance, so any current flowing through it turns into heat. The higher the current, the more the trace heats up. If the
          trace is too narrow or the copper too thin, it can get hot enough to damage the board, lift off the laminate or burn open like a fuse.
          That is why designers check current before they finalize a layout.
        </P>
        <P>
          You will see this calculation in power supplies, battery chargers, motor controllers, LED lighting, USB-C power delivery, automotive
          electronics, industrial controls and any board with a power input. It also matters on hobby projects. You may never reach the limit on a
          small Arduino shield, but a quick check costs nothing and avoids a surprise later.
        </P>
      </Card>

      <Card title="Understanding PCB Trace Current Carrying Capacity">
        <P>
          Current carrying capacity is the maximum continuous current a trace can handle before it heats up more than you allow. It is not one
          fixed number. It depends on how much copper is in the trace, where the trace sits on the board and how much temperature rise you can
          accept.
        </P>
        <P>
          Think of it as a heat balance. Current flowing through the copper produces heat. The board then moves that heat away through the air,
          the laminate and any nearby copper. A trace reaches a stable temperature when the heat it produces equals the heat it can shed. A wider
          or thicker trace has less resistance, so it makes less heat for the same current, and it has more surface to give that heat off. This is
          why capacity rises as you add copper.
        </P>
        <P>
          Capacity is also tied to the limits of everything around the trace. The trace has to stay cool enough that the board material, the
          solder joints and the nearby parts are not stressed. In practice, the temperature rise you choose sets the capacity.
        </P>
      </Card>

      <Card title="How to Use the PCB Trace Current Calculator">
        <P>
          Start by choosing whether the trace is internal or external. External traces are on the top or bottom layer and can release heat to the
          air. Internal traces are buried between layers and run hotter at the same current.
        </P>
        <P>
          Next, enter the trace width. The calculator accepts nanometers, micrometers, millimeters, centimeters, mils (thousandths of an inch) and
          inches, so you can use whichever unit your layout software shows. Then enter the trace thickness. You can type it as a length or as
          copper weight in ounces per square foot (oz/ft²). For reference, 1 oz copper is the standard finish on most boards and equals about 1.37
          mil, or 35 µm.
        </P>
        <P>
          Then set the maximum desired temperature rise. This is how far above ambient you let the trace climb. Ten degrees Celsius is a
          conservative starting point for general electronics. You can enter it in Celsius, Fahrenheit or kelvins.
        </P>
        <P>
          The additional inputs are optional but useful. Enter the ambient temperature to see the actual trace temperature, and enter the trace
          length to get resistance, voltage drop and power dissipation. Click Calculate, and the outputs show:
        </P>
        <List items={[
          ["Maximum current:", "the most current the trace can carry continuously under your conditions, shown in amps, milliamps or microamps."],
          ["Cross section:", "the area of the copper in mm², cm², in², circular mils or square mils."],
          ["Trace temperature:", "the operating temperature of the trace at that current."],
          ["Resistance:", "the resistance of the trace over the length you entered."],
          ["Voltage drop:", "the voltage lost across the trace, calculated with Ohm’s law."],
          ["Power dissipation:", "the heat the trace produces at that current."],
        ]} />
        <P>
          If you already know your load current and need the width instead, adjust the width until the maximum current matches or exceeds your
          load. This trace width versus current relationship is the one most designers need.
        </P>
      </Card>

      <Card title="How Do You Calculate PCB Trace Max Current?">
        <P>
          The commonly used IPC-2221 standard provides an empirical formula to estimate the maximum current a PCB trace can carry based on its
          cross-sectional area and allowable temperature rise:
        </P>
        <Formula>I = k × ΔT<sup>0.44</sup> × A<sup>0.725</sup></Formula>
        <P>Where:</P>
        <List items={[
          ["I", "= Current capacity (amps)"],
          ["ΔT", "= Allowable temperature rise (°C)"],
          ["A", "= Trace cross-sectional area (square mils)"],
          ["k", "= 0.048 for external traces and 0.024 for internal traces"],
        ]} />
        <P>To calculate the current capacity:</P>
        <List ordered items={[
          ["", "Multiply the trace width by copper thickness (both in mils) to find the cross-sectional area."],
          ["", "Raise the area to the power of 0.725."],
          ["", "Raise the temperature rise to the power of 0.44."],
          ["", "Multiply both results by the appropriate k value."],
        ]} />
        <P>
          One important point: doubling the trace width does not double its current capacity. It increases it by approximately 65%. Similarly,
          doubling the allowable temperature rise increases current capacity by only about 36%. This shows why increasing copper area is generally
          more effective than allowing higher operating temperatures.
        </P>
      </Card>

      <Card title="How Much Current Can a PCB Trace Carry? Understanding the Maximum Current Rating">
        <P>
          There is no single maximum current rating for a PCB trace. A rating only makes sense for a specific width, copper weight, layer and
          temperature rise. A 10 mil trace on 1 oz outer copper is good for under 1 A at a 10 °C rise. A 100 mil trace on the same copper handles
          close to 5 A. Switch to 2 oz copper and the same widths carry noticeably more.
        </P>
        <P>This table shows IPC-2221 results at a 10 °C rise, so you can sanity-check the calculator and get a feel for typical numbers:</P>
        <DataTable headers={CAPACITY_HEADERS} rows={CAPACITY_ROWS} />
        <P>
          For a 1 A load on 1 oz outer copper at a 10 °C rise, you need a trace roughly 12 mil (0.3 mm) wide. Most designers round up for margin.
        </P>
      </Card>

      <Card title="Trace Width, Copper Thickness and Temperature Rise Explained">
        <Lead lead="Trace width.">
          Width is the easiest variable to change, and routing density usually limits it. Wider traces carry more current and run cooler, but they
          use board space and can make escape routing from fine-pitch parts harder.
        </Lead>
        <Lead lead="Copper thickness.">
          Copper weight describes how much copper covers one square foot of board. Half an ounce is about 0.69 mil (17.5 µm), 1 oz is 1.37 mil (35
          µm), 2 oz is 2.74 mil (70 µm) and 3 oz is 4.11 mil (105 µm). Since IPC-2221 uses a cross-sectional area, doubling the copper weight has
          the same effect as doubling the width. For heavy-current designs, thicker copper is often the better choice when board size is fixed.
          Keep in mind that thicker copper limits how fine your minimum trace and space can be, and fabricators charge more for it.
        </Lead>
        <Lead lead="Temperature rise.">
          This is the allowed increase above ambient, not an absolute temperature. If your enclosure sits at 50 °C and you accept a 20 °C rise, the
          trace reaches about 70 °C. Add that rise to your worst-case ambient and confirm the result stays well below the board’s glass transition
          temperature (Tg) and the ratings of nearby parts.
        </Lead>
        <Lead lead="External versus internal layers.">
          Outer traces shed heat to the air. Inner traces are surrounded by laminate, which conducts heat poorly. IPC-2221 therefore halves the
          constant for internal layers. In practice, an internal trace needs about 2.6 times the cross-sectional area of an external one to carry
          the same current at the same temperature rise. Newer research suggests this penalty is harsh for many real boards, which the accuracy
          section below covers.
        </Lead>
      </Card>

      <Card title="Pcb Current Carrying Capacity: How Hot Is Too Hot?">
        <P>There is no universal answer, because the limit depends on what the trace touches. A few things set the ceiling.</P>
        <P>
          The first is the board material. Standard FR-4 has a glass transition temperature (Tg) typically between about 130 °C and 170 °C. Near
          and above Tg, the laminate softens, and repeated heating can weaken the bond between copper and board. The trace should stay well below
          that point, with margin for your worst-case ambient.
        </P>
        <P>
          The second is the parts. Components, connectors and solder joints near a hot trace all absorb that heat. A trace that is safe for the
          board can still push a nearby capacitor or sensor past its rating.
        </P>
        <P>
          The third is resistance. Copper resistance rises about 0.39 percent per degree Celsius, so a hotter trace wastes more power and drops
          more voltage. That raises the temperature further.
        </P>
        <P>
          For that reason, many designers use a 10 °C rise as the default and go to 20 or 30 °C only when the board has room to run warm. In a
          sealed enclosure or a high-ambient environment, choose a smaller rise. The trace temperature output in the calculator helps here, since
          it shows the actual operating temperature once you enter ambient.
        </P>
      </Card>

      <Card title="Why Did a Trace Blow in a Low-Current Application?">
        <P>
          A trace that fails at a current well below its calculated limit is a common and frustrating problem. The calculator assumes a clean,
          uniform trace carrying steady current, and real boards often differ. These are the usual causes:
        </P>
        <List items={[
          ["A narrow spot in the path.", "A trace is only as strong as its thinnest section. Necked-down areas at pads, thermal relief spokes and tight gaps between pins can be much narrower than the rest of the trace and heat up first."],
          ["Inrush and startup surges.", "Charging large capacitors or starting a motor draws far more current than steady-state operation, even if only for a moment."],
          ["Short circuits and faults.", "A fault can push current far above normal, and the trace becomes the weakest link."],
          ["Vias.", "A single via carries much less current than most traces. A high-current path that changes layers through one via can fail there."],
          ["Manufacturing variation.", "Etching can leave a trace narrower than designed, and plating can leave the copper thinner than expected. Scratches and nicks do the same."],
          ["Heat from outside the trace.", "A hot regulator or resistor next to the trace raises its starting temperature, which leaves less room before it overheats."],
        ]} />
        <P>
          If you see this problem, check the narrowest point first, then add margin, add parallel vias and widen the path. A solid copper pour
          often works better than a routed trace.
        </P>
      </Card>

      <Card title="Rules of Thumb for Pulse Current Ratings">
        <P>
          This calculator is built for continuous DC current. Pulsed current behaves differently, because a trace has thermal mass and takes time
          to heat up. A short pulse can exceed the continuous rating without damage, while a long one cannot.
        </P>
        <P>A few general guidelines help:</P>
        <List items={[
          ["Repeating pulses.", "The trace heats according to the RMS (heating-equivalent) value of the current, not the peak. For a rectangular pulse, the RMS current is the peak current multiplied by the square root of the duty cycle. Check that RMS value against the calculator’s maximum current."],
          ["Single short surges.", "Very short events, such as a fuse-clearing fault or a one-time surge, are limited by how fast the copper heats and melts. Onderdonk’s equation is the usual reference for the fusing point of a copper conductor over a given time. Treat that result as a failure limit, never a design target."],
          ["Long pulses.", "Once a pulse lasts several seconds, the trace has time to heat close to its steady-state temperature. Treat it as continuous current."],
          ["Margin.", "Pulse ratings carry more uncertainty than DC ones, so keep a healthy safety factor and test on real hardware."],
        ]} />
      </Card>

      <Card title="What Does a High Measured Current on a PCB Trace Mean?">
        <P>
          If you measure a current on a trace that is higher than your calculated value, the trace is running hotter than you designed for. It is
          worth finding out why before it causes damage.
        </P>
        <P>
          First, confirm the measurement. A meter or probe that is in the wrong range, or a current spike that the meter averages out, can mislead
          you. Then check whether the load is drawing more than expected, which can point to a fault, a wrong component value or a firmware issue.
          If the measurement is correct, the fix is to add copper. Widen the trace, move to a heavier copper weight, add a copper pour or add
          parallel layers with several vias. Measuring trace temperature with a thermocouple or thermal camera under full load tells you how far
          off you are.
        </P>
        <P>
          Layers matter too. A high current on an inner layer is more of a concern than the same current on an outer layer, because inner traces
          shed heat poorly.
        </P>
      </Card>

      <Card title="PCB Trace Width vs. Current for High-Voltage Designs">
        <P>
          Voltage and current are separate issues on a PCB. The current capacity of a trace depends on its copper cross-section and temperature
          rise, not on the voltage. A 10 mil trace carries the same maximum current at 5 V as at 500 V.
        </P>
        <P>
          High voltage affects something else: spacing. As voltage goes up, you need more clearance between conductors, and longer creepage
          distance along the board surface, to prevent arcing and leakage. IPC-2221 includes conductor spacing guidance based on voltage, and
          safety standards set stricter limits for mains-connected equipment.
        </P>
        <P>
          So for a high-voltage design, use this calculator to size the trace for current, then set the spacing separately according to the
          voltage and the safety standard that applies to your product. A trace that passes the current check can still fail on spacing.
        </P>
      </Card>

      <Card title="When You Need a PCB Trace Width and Current Calculator">
        <Lead lead="Power supply and regulator layouts.">
          Buck converters, LDOs and battery inputs carry continuous current that can heat narrow traces. Checking widths early prevents a respin.
        </Lead>
        <Lead lead="Motor drivers and LED arrays.">
          Stall currents and LED strings pull far more current than signal-level routing, and these traces are often the longest on the board.
        </Lead>
        <Lead lead="USB-C and fast-charging boards.">
          Higher-wattage charging pushes several amps through connector pads and input traces that were once sized for 500 mA.
        </Lead>
        <Lead lead="Automotive and industrial boards.">
          Wide temperature ranges mean the ambient figure is already high before the trace heats at all, so the allowed rise must be chosen with
          care.
        </Lead>
        <Lead lead="Review and fabrication handoff.">
          A calculated result gives you a clear number to cite in a design review, or when a fabricator asks whether a heavier copper weight is
          really needed.
        </Lead>
        <Lead lead="Learning and coursework.">
          Students can change one input at a time and watch how width, copper and temperature rise trade off.
        </Lead>
      </Card>

      <Card title="How Accurate Is IPC-2221? Limits and IPC-2152">
        <P>
          IPC-2221’s current curves come from decades-old test data, and the standard is clear about its range: roughly up to 35 A, trace widths
          up to 400 mil, copper from 0.5 to 3 oz and temperature rises of 10 to 100 °C. Results outside that range are extrapolation, so treat
          them cautiously.
        </P>
        <P>
          IPC-2152, a later standard from <Ext href="https://www.ipc.org/">IPC</Ext>, is based on far more extensive testing. It showed that board
          thickness, nearby copper planes and trace position all affect how well heat spreads. A trace close to a solid ground plane runs cooler
          than IPC-2221 predicts, and internal traces are often penalized less than the older standard assumes. In short, IPC-2221 tends to be
          conservative, which suits a quick design check but not a precise thermal model.
        </P>
        <P>
          Treat the calculator’s output as a reliable engineering estimate for continuous DC current in an isolated trace. It does not model
          pulsed currents, nearby heat sources, adjacent traces carrying current or thermal vias. For high-current designs, build a prototype and
          measure it.
        </P>
      </Card>

      <Card title="Practical Tips for Sizing PCB Traces">
        <List items={[
          ["Add margin.", "Many designers target a 20 to 30 percent safety factor over the calculated current, especially on boards that are hard to rework."],
          ["Use pours for power.", "Copper pours carry current with far less temperature rise than a thin routed trace."],
          ["Watch the bottlenecks.", "Pads, necked-down areas at connectors and vias are common weak points."],
          ["Parallel vias.", "Use several vias in parallel when a high-current path changes layers."],
          ["Add copper around hot traces.", "The extra copper area spreads heat and lowers the temperature."],
          ["Check neighbors.", "Closely routed power traces heat each other, so give them extra spacing or width."],
          ["Confirm fabricator limits.", "Heavier copper may need wider minimum spacing, so verify capabilities before finalizing a stackup."],
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
