import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate voltage drop?", a: "Multiply the current by the resistance of the full round-trip wire length. For DC and single-phase, use VD = (2 × K × I × L) ÷ CM, and for 3-phase replace the 2 with 1.732. The calculator does this for you once you enter the circuit details." },
  { q: "What is an acceptable voltage drop percentage?", a: "The NEC recommends no more than 3% on a branch circuit or feeder and 5% overall from the service to the load. Some equipment and project specifications require less, so check your own requirements." },
  { q: "How much voltage drop can a motor handle?", a: "Most standard motors are built to run within about 10% of nameplate voltage, but efficiency and temperature get worse well before that point. Keep the wiring drop at 3% or less where you can, and check the dip at starting current." },
  { q: "Does voltage drop affect LED lights?", a: "Yes. Most LED fixtures have a driver that hides small changes, but a large drop can make them flicker, dim or shut off. Low-voltage LED strips show the effect sooner." },
  { q: "Does DC voltage drop over distance?", a: "Yes. Wire has resistance whether the current is DC or AC, so a longer run loses more voltage. The effect is bigger at 12 V and 24 V, where each volt lost is a large part of the supply." },
  { q: "Do I enter the one-way or round-trip length?", a: "Enter the one-way distance from the source to the load. The tool includes the return path for DC and single-phase circuits." },
  { q: "Can voltage drop make a breaker trip?", a: "Indirectly, yes. Low voltage makes motors draw more current, which can trip an overcurrent breaker. Voltage drop on its own does not trip a residual current device (RCCB or GFCI), which reacts to current leaking to ground. A loose connection at a breaker can overheat and cause problems of its own." },
  { q: "Can a bad connection or ground cause voltage drop?", a: "A loose or corroded connection can, because it adds resistance. A damaged neutral can too. A bad equipment ground rarely does in an AC circuit, but in vehicle and boat systems where the frame carries the return current, a poor ground is a common cause." },
  { q: "When voltage drops, does current drop too?", a: "It depends on the load. A resistive load like a heater draws less current at lower voltage. A motor or power supply that needs a fixed amount of power draws more current as voltage falls." },
  { q: "Can I use my own resistance values instead of AWG?", a: "Yes. Use the Other tab to enter resistance or impedance data from another standard or a wire manufacturer." },
  { q: "Is this voltage drop calculator really free?", a: "Yes. It is free to use online with no signup required, and there is no charge for any result." },
];

// The supplied FAQ schema matches the list above except for one trimmed answer.
const FAQ_SCHEMA_OVERRIDES = {
  "Can voltage drop make a breaker trip?": "Indirectly, yes. Low voltage makes motors draw more current, which can trip an overcurrent breaker. Voltage drop on its own does not trip a residual current device (RCCB or GFCI), which reacts to current leaking to ground.",
};

const WIRE_HEADERS = ["Wire size (AWG)", "Area (kcmil)", "Copper resistance (ohms per 1,000 ft)"];
const WIRE_ROWS = [
  ["14", "4.11", "2.525"], ["12", "6.53", "1.588"], ["10", "10.4", "0.9989"], ["8", "16.5", "0.6282"], ["6", "26.3", "0.3951"],
  ["4", "41.7", "0.2485"], ["2", "66.4", "0.1563"], ["1/0", "106", "0.09827"], ["4/0", "212", "0.04901"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 340 }}>
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

export default function VoltageDropCalculatorFaqSection() {
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

      <Card title="What Is Voltage Drop?">
        <P>
          Voltage drop is the reduction in voltage as electric current flows through a conductor, such as a wire. This happens because the
          conductor opposes the flow of current. In a DC circuit, this opposition is called resistance, while in an AC circuit, it is called
          impedance, which includes both resistance and reactance.
        </P>
        <P>
          For example, if a 120 V supply delivers only 112 V to a load, the voltage drop is 8 V. This lost voltage is converted into heat within the
          conductor.
        </P>
        <P>
          It is important to understand the difference between voltage and voltage drop. Voltage is the potential difference between two points,
          while voltage drop is the decrease in potential as current flows between those points.
        </P>
        <P>Voltage drop is also the same as the voltage across a resistor. According to Ohm's Law, it is calculated using:</P>
        <Formula>V = I × R</Formula>
        <P>
          The difference is that a resistor is designed to create a voltage drop, whereas voltage drop in a wire is generally unwanted because it
          reduces the voltage available to the load.
        </P>
        <P>
          Voltage drop is usually expressed as a positive value to represent the amount of voltage lost. In contrast, a voltage rise occurs when
          voltage increases across a source, such as a battery or generator. According to Kirchhoff's Voltage Law (KVL), the total voltage rise in a
          closed circuit equals the total voltage drop.
        </P>
      </Card>

      <Card title="Why Is Voltage Drop Important?">
        <P>
          A drop in voltage has two costs. The first is wasted energy: the lost voltage becomes heat inside the wire, and you pay for power that
          never does any work. The second is poor performance, because the equipment at the end of the run receives less voltage than it was
          designed for.
        </P>
        <P>
          The symptoms depend on the load. Lights flicker or burn dim. Heaters warm up slowly. Motors run hotter than normal, since they draw more
          current to do the same work, and that extra heat can shorten their life or burn them out. Electronics may reset or refuse to start. LED
          lights are usually more tolerant than older bulbs because most have a driver that regulates power, but once the supply falls below the
          driver's minimum input, the light can flicker, dim or shut off. Simple low-voltage LED strips have no such cushion and dim noticeably.
        </P>
        <P>
          So is a voltage drop ever a good thing in wiring? No. It is always a loss. Whether it causes the current to rise or fall depends on the
          load. A simple resistive load, such as a heater, draws less current when voltage falls. A constant-power load, such as a motor or an
          electronic power supply, draws more current when voltage falls, which makes the drop even worse.
        </P>
      </Card>

      <Card title="What Causes Voltage Drop?">
        <P>
          The main reason for voltage drop is the resistance of the conductors themselves. The longer and thinner the wire, and the more current it
          carries, the more voltage it loses. A few other causes are worth checking, especially when a circuit that should be fine still
          misbehaves.
        </P>
        <Lead lead="Series circuits.">
          In a series circuit, the supply voltage is shared among everything in the loop, and each part drops a share in proportion to its
          resistance. The wire is one of those parts. Add a long, thin run of wire in series with a load, and the load gets a smaller share.
        </Lead>
        <Lead lead="Poor connections.">
          A loose or corroded terminal, a worn switch, or a breaker lug that is not fully tightened adds resistance at one spot. That spot gets warm,
          and it can drop several volts even when the wire itself is sized correctly. A breaker does not drop much voltage when it is in good
          condition, but a loose connection at the breaker can.
        </Lead>
        <Lead lead="Bad neutral or ground return.">
          The return path is part of the circuit. A damaged neutral, or a poor chassis ground in a vehicle, boat or other DC system where the frame
          is the return path, adds resistance and causes flicker and low voltage. In an ordinary AC branch circuit, the equipment grounding
          conductor does not carry load current, so a bad ground alone usually does not cause voltage drop, but it is still a safety problem.
        </Lead>
        <Lead lead="Source-side sag.">
          The power source has its own internal resistance and reactance. Transformer windings, generator windings and battery internals all lose
          some voltage when the load increases, so the voltage at the source terminals falls as the current rises. This is why a generator or
          battery can read lower under load than with nothing connected. The calculator on this page covers the wiring, not the source, so keep
          this extra loss in mind when your measured voltage is lower than the result.
        </Lead>
      </Card>

      <Card title="On Which Factors Does Voltage Drop Depend?">
        <P>Six things decide how much voltage a circuit loses.</P>
        <List items={[
          ["Conductor material.", "Silver and gold conduct very well, but copper and aluminum are the practical choices because of cost. Copper conducts better, so it has less drop than aluminum of the same size and length."],
          ["Wire size.", "A thicker wire has lower resistance. In American wire gauge, every 3 gauge steps down doubles the cross-sectional area, and every 6 steps down doubles the diameter. That is why moving from 12 AWG to 10 AWG makes such a visible difference."],
          ["Length.", "Resistance grows with distance. Drop is rarely an issue inside a house, but it can become a real problem on a run to a garage, barn, well pump or other outbuilding."],
          ["Current.", "Drop rises in direct proportion to current. Double the amps and you double the volts lost."],
          ["Temperature.", "Wire resistance increases as the conductor heats up. Bundled cables and hot environments push resistance higher, and ampacity ratings are reduced for the same reason. The NEC data in this tool is based on 75°C."],
          ["AC factors.", "In alternating current circuits, reactance, power factor, the frequency and the material of the conduit also influence the result. Running several conductors per phase in parallel lowers the effective resistance, which cuts the drop."],
        ]} />
        <P>
          The table below shows typical resistance for bare copper wire, so you can see how fast it falls as the wire gets thicker. These are DC
          values at about 68°F (20°C), so they are lower than the NEC values the calculator uses at 75°C.
        </P>
        <DataTable headers={WIRE_HEADERS} rows={WIRE_ROWS} />
      </Card>

      <Card title="How Do You Calculate Voltage Drop?">
        <P>
          The starting point is Ohm's law: voltage drop equals current times resistance (V = I × R). The catch is that current flows out to the load
          and back again, so the resistance you care about is that of the full round trip. Wire resistance is usually listed per length, in ohms per
          1,000 feet or ohms per kilometer, so the length enters the formula too.
        </P>
        <P>
          The widely used version relies on a material constant K, about 12.9 for copper and 21.2 for aluminum (ohm-circular mils per foot, at
          roughly 75°C), and on the wire's area in circular mils (CM).
        </P>
        <Formula>
          DC and single-phase: VD = (2 × K × I × L) ÷ CM<br />
          3-phase: VD = (√3 × K × I × L) ÷ CM
        </Formula>
        <P>
          Here I is the current in amps and L is the one-way length in feet. If you already have a resistance value R in ohms per 1,000 feet, the
          same formulas become VD = (2 × I × R × L) ÷ 1,000 for DC and single-phase, and VD = (1.732 × I × R × L) ÷ 1,000 for 3-phase. The
          percentage is the drop divided by the source voltage, times 100, and the voltage at the end is the source voltage minus the drop.
        </P>
        <P>To find the drop across a single resistor, skip the length and use V = I × R directly. A 10-ohm resistor carrying 0.5 A drops 5 V.</P>
        <P>
          DC voltage drops over distance in exactly the same way as AC. Distance adds wire, wire adds resistance, and resistance takes voltage. The
          effect is more noticeable at low voltages such as 12 V or 24 V, because the same few volts are a much bigger share of the supply.
        </P>
        <Lead lead="Working example.">
          Take a 120 V single-phase circuit carrying 20 A over 100 feet one way, built with 12 AWG copper (6,530 CM). VD = (2 × 12.9 × 20 × 100) ÷
          6,530 = 7.90 V. That is 6.58% of 120 V, leaving about 112.1 V at the load, which is far too much loss. Moving to 8 AWG copper (16,510 CM)
          gives a drop of 3.13 V, or 2.60%, with roughly 116.9 V at the end. The wire change alone brings the circuit inside accepted limits.
        </Lead>
      </Card>

      <Card title="How This Voltage Drop Calculator Works">
        <P>The tool has three tabs, and each one gets its resistance data from a different place.</P>
        <List items={[
          ["NEC data", "uses the resistance and reactance values published in the National Electrical Code. The results are based on AC values for 60 Hz and 75°C."],
          ["Estimated resistance", "works out the resistance from the wire size you choose."],
          ["Other", "lets you enter your own resistance or impedance data, for example from another standard or from a wire manufacturer's datasheet."],
        ]} />
        <P>The form asks for the details of your circuit:</P>
        <List items={[
          ["Wire material and size.", "Choose copper or aluminum, then a size from 14 AWG up to 1000 kcmil."],
          ["Conduit material.", "Pick PVC, aluminum or steel. This matters for AC circuits because the conduit affects reactance."],
          ["Power factor and voltage.", "Enter the supply voltage and, for AC loads, the power factor."],
          ["Phase.", "Select DC, AC single phase or AC 3-phase."],
          ["Number of conductors.", "Use a single set, or choose from two to nine conductors per phase in parallel when large feeders are split across several wires."],
          ["Distance (one way).", "Enter the length in feet, meters, miles or kilometers. Do not double it yourself, since the return path is already included for DC and single-phase circuits."],
          ["Load current.", "Enter the current in amps. If you only know watts, divide by the voltage first (and by the power factor for AC loads)."],
        ]} />
        <P>
          After you press Calculate, you get three results: the voltage drop in volts, the voltage drop as a percentage of the supply, and the
          voltage at the end of the circuit. The tool also tells you whether the result is within the recommended maximum of 5% under full load. It
          is a fast way to try different wire sizes, materials and lengths until the number is where you want it.
        </P>
        <P>
          No calculation can predict every real-world detail. The actual drop can differ with the condition of the wire, the temperature, the
          connectors and the frequency, so treat the output as a dependable estimate for planning.
        </P>
      </Card>

      <Card title="Wire Size Voltage Drop Calculator: Choosing the Right AWG">
        <P>
          A common mistake is picking wire size by ampacity alone. Ampacity is the most current a conductor can carry safely without overheating,
          and it depends on the material, the insulation, the ambient temperature and how many cables are bundled together. It says nothing about
          how much voltage you will lose over distance. On short runs, ampacity usually decides the size. On long runs, voltage drop often calls for
          a larger conductor than the ampacity table suggests.
        </P>
        <P>
          Cable selection really comes down to two checks. The cable must carry the load current without overheating in the worst conditions it
          will see. It must also have a good enough earth or ground path to keep fault voltages safe and let a fault trip the protective device
          quickly. Voltage drop is a third check that sits on top of these.
        </P>
        <P>
          Start with the ampacity-based size, run it through this wire size voltage drop calculator at your actual length and load, and look at the
          percentage. If it is too high, move up one size and calculate again. Remember that a smaller AWG number means a thicker wire, so 6 AWG has
          less resistance than 10 AWG. You can read more about how the gauge system works in this overview of{" "}
          <Ext href="https://en.wikipedia.org/wiki/American_wire_gauge">American Wire Gauge</Ext>.
        </P>
        <P>
          Material changes the answer too. Aluminum has higher resistance than copper of the same size, so an aluminum feeder often needs to be one
          or two sizes larger to match copper. Switching the material in the AWG voltage drop calculator shows the difference right away, which
          helps when you are weighing cost against performance on a long run.
        </P>
      </Card>

      <Card title="NEC Voltage Drop Limits: The 3% and 5% Guideline">
        <P>
          People searching for an NEC voltage drop calculator usually want to know whether their result is acceptable. The{" "}
          <Ext href="https://en.wikipedia.org/wiki/National_Electrical_Code">National Electrical Code</Ext> includes informational notes (in
          sections such as 210.19 and 215.2) that recommend keeping voltage drop to about 3% on a branch circuit or feeder, and about 5% for the
          combined feeder and branch circuit from the service to the load. The result message in this tool uses the 5% full-load figure.
        </P>
        <P>
          Two points deserve attention. First, these are informational notes, not mandatory rules in most cases, although they are widely treated as
          the working standard, and project specifications, local amendments or equipment makers may make them requirements. Second, some
          applications need tighter limits, such as sensitive electronic equipment or long motor runs where starting voltage is critical. Confirm
          which limit applies with your inspector, the project specification or the equipment documentation.
        </P>
        <P>
          Use the percentage from the voltage drop percentage calculator as your comparison point. At or below 3% on a branch circuit is generally
          comfortable. Between 3% and 5% deserves a closer look, and anything above 5% usually means the wire should be upsized or the run changed.
        </P>
        <P>
          How much drop does it take to cause trouble for a motor? Most standard motors are designed to run within about 10% of their nameplate
          voltage, but heat, torque and efficiency suffer well before you reach that limit, which is why keeping the wiring drop at 3% or less is
          the safer target. The next section covers starting, which is harder on the wiring than running.
        </P>
      </Card>

      <Card title="When You Need a Voltage Drop Calculator: Practical Scenarios">
        <P>
          The need often shows up after something has already gone wrong, but the best time to use the tool is during design. These are the
          situations where it helps most.
        </P>
        <List items={[
          ["Detached garages, workshops and sheds.", "A 150-foot feeder to an outbuilding that powers a compressor or welder is a classic voltage drop problem. Check it before buying cable, because wire is the most expensive part to replace."],
          ["Long outdoor circuits.", "Pool pumps, yard lighting and well pumps are often far from the panel. A pump that struggles to start on a long run is frequently suffering from low voltage, not a bad motor."],
          ["Starting a motor.", "Voltage drops when a motor starts because the starting current is several times the running current, often five to seven times. Even a wire that is fine at running load can sag badly for a moment, which can cause dimming lights, a stalled start or a tripped breaker. Enter the starting current in the calculator to see how bad the dip will be."],
          ["Solar and battery systems.", "Low-voltage DC circuits are especially sensitive. At 12 V or 24 V, losing a single volt is a big percentage. Use the DC option to size panel-to-controller and battery-to-inverter cables, where even short runs can carry high current."],
          ["Commercial and industrial feeders.", "For 3-phase motors, panels and HVAC equipment, the 3-phase option confirms that the voltage at the terminals stays within the equipment's tolerance."],
          ["Automotive, marine and RV wiring.", "Low-voltage vehicle systems have the same sensitivity as solar. Long runs to lights, winches or refrigeration units need to be checked."],
          ["Troubleshooting.", "When lights dim at the end of a circuit, or a device behaves unpredictably, calculating the expected drop tells you whether the wiring is the cause before you start replacing equipment. If the measured voltage is much lower than the result, look for a loose connection or a source-side problem."],
        ]} />
      </Card>

      <Card title="How to Reduce Voltage Drop">
        <P>If the result is higher than you want, there are several ways to bring it down, and you can test most of them right in the calculator.</P>
        <List items={[
          ["Use a larger conductor.", "This is the most direct fix, since more cross-sectional area means less resistance."],
          ["Shorten the run.", "Moving a panel or subpanel closer to the load cuts the loss in proportion to distance."],
          ["Raise the supply voltage.", "The same power at 240 V draws half the current it does at 120 V, so the wire loses far less in absolute terms and as a percentage."],
          ["Choose copper over aluminum,", "or step up the aluminum size, if the budget allows."],
          ["Split the load.", "Lowering the current on a single wire, by dividing one heavy circuit into two or running conductors in parallel, reduces the drop."],
          ["Fix the connections.", "Tighten loose terminals and clean corroded ones, since a bad connection can drop more voltage than a hundred feet of good wire."],
          ["Watch extension cords.", "Use the shortest cord that works and a heavy enough gauge for the load, and do not chain several together."],
          ["Improve the power factor", "on large inductive AC loads where it is practical. A better power factor means less current for the same useful power."],
        ]} />
        <P>Sometimes a mix works best. A moderate upsize plus a shorter route can cost less than the largest wire on a long run.</P>
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
