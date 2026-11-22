import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a PCB impedance calculator?", a: "It is a tool that estimates the characteristic impedance of a PCB trace from its width, copper thickness, substrate height, and relative permittivity. It helps you choose trace dimensions so signals travel without harmful reflections." },
  { q: "What is PCB impedance?", a: "It is the characteristic impedance of a trace, measured in ohms. It describes how a signal wave travels along the trace and depends on the trace geometry and the dielectric material, not on the trace length." },
  { q: "What does “impedance-controlled PCB” mean?", a: "It means selected traces are built to a specific target impedance within a stated tolerance, usually ±10 percent. The designer and fabricator agree on a stackup and trace dimensions, and the fabricator verifies the result with test coupons." },
  { q: "How do I calculate PCB impedance?", a: "Select the conductor type that matches your stackup, enter the thickness, width, substrate height, and relative permittivity, and click Calculate. Adjust the trace width until the result matches your target." },
  { q: "What impedance should my PCB traces be?", a: "It depends on the interface. Single-ended signals are most often 50 Ω, USB 2.0 pairs target 90 Ω differential, Ethernet and LVDS commonly use 100 Ω differential, and PCIe commonly uses 85 Ω differential. Check the standard or chip datasheet you are working with." },
  { q: "Is PCB trace impedance different from transmission line characteristic impedance?", a: "No. A PCB trace over a reference plane is a transmission line, so its trace impedance is its characteristic impedance. “Trace impedance” is simply the term designers use on a board." },
  { q: "Do I need to consider impedance on a DC circuit PCB?", a: "Usually not. Traces carrying DC or slow signals are electrically short compared with the signal’s edge rate, so reflections are not a concern. Impedance matters when the signals have fast rise times." },
  { q: "How do you do impedance matching on a PCB?", a: "Size the trace to the target impedance, terminate the line with series or parallel resistors where needed, and avoid discontinuities such as width changes, stubs, and gaps in the reference plane." },
  { q: "Why is impedance control important in high-speed PCB design?", a: "A mismatch reflects part of the signal back toward the source, causing ringing, distorted edges, and timing errors. Controlled impedance protects signal quality and helps designs pass compliance testing." },
  { q: "What is the difference between microstrip and stripline impedance?", a: "Microstrip traces sit on an outer layer with one reference plane, so the field is shared between the board and the air above. Stripline traces sit between two planes on an inner layer, so the field stays inside the dielectric. Stripline is usually better shielded and has a higher ε_eff." },
  { q: "What is effective dielectric constant (ε_eff)?", a: "It is the single dielectric constant a wave experiences when its field passes through more than one material. In microstrip, it falls between air and the laminate’s relative permittivity, and it controls signal speed and propagation delay." },
  { q: "What FR-4 dielectric constant should I use?", a: "Many designers start with about 4.2 to 4.5, but the exact value varies by manufacturer, resin content, and frequency. Use your fabricator’s or laminate datasheet value whenever possible." },
  { q: "How does trace width affect impedance?", a: "Wider traces lower impedance and narrower traces raise it. Increasing the substrate height has the opposite effect, because more distance to the plane raises impedance." },
  { q: "How accurate is a PCB impedance calculator?", a: "For standard geometries, it is typically close enough for design and layout planning. Etch variation, material tolerance, and solder mask can shift the final board by several ohms, so critical designs should be verified with a field solver or a manufacturer test coupon." },
  { q: "Is this PCB impedance calculator free?", a: "Yes. It is free to use on Tolz and does not require you to upload any files." },
];

// The supplied FAQ schema rewords most answers, so it is kept verbatim here
// rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "What is a PCB impedance calculator?", a: "It is a tool that estimates the characteristic impedance of a PCB trace from its width, copper thickness, substrate height, and relative permittivity, helping you choose trace dimensions that avoid harmful signal reflections." },
  { q: "What is PCB impedance?", a: "PCB impedance is the characteristic impedance of a trace, measured in ohms. It depends on trace geometry and the dielectric material, not on trace length." },
  { q: "What does impedance-controlled PCB mean?", a: "It means selected traces are built to a specific target impedance within a stated tolerance, usually plus or minus 10 percent. The designer and fabricator agree on a stackup and trace dimensions, and the fabricator verifies the result with test coupons." },
  { q: "How do I calculate PCB impedance?", a: "Select the conductor type that matches your stackup, enter thickness, width, substrate height, and relative permittivity, then click Calculate. Adjust the trace width until the result matches your target." },
  { q: "What impedance should my PCB traces be?", a: "Single-ended signals are most often 50 ohms, USB 2.0 pairs target 90 ohms differential, Ethernet and LVDS commonly use 100 ohms differential, and PCIe commonly uses 85 ohms differential. Always check the specification of your interface or chip." },
  { q: "Is PCB trace impedance different from transmission line characteristic impedance?", a: "No. A PCB trace over a reference plane is a transmission line, so its trace impedance is its characteristic impedance. Trace impedance is the term designers use on a board." },
  { q: "Do I need to consider impedance on a DC circuit PCB?", a: "Usually not. Traces carrying DC or slow signals are electrically short compared with the signal's edge rate, so reflections are not a concern. Impedance matters when signals have fast rise times." },
  { q: "How do you do impedance matching on a PCB?", a: "Size the trace to the target impedance, terminate the line with series or parallel resistors where needed, and avoid discontinuities such as width changes, stubs, and gaps in the reference plane." },
  { q: "Why is impedance control important in high-speed PCB design?", a: "A mismatch reflects part of the signal back toward the source, causing ringing, distorted edges, and timing errors. Controlled impedance protects signal quality and helps designs pass compliance testing." },
  { q: "What is the difference between microstrip and stripline impedance?", a: "Microstrip traces sit on an outer layer with one reference plane, so the field is shared between the board and air. Stripline traces sit between two planes on an inner layer, so the field stays within the dielectric." },
  { q: "What is effective dielectric constant (ε_eff)?", a: "It is the single dielectric constant a wave experiences when its field passes through more than one material. In microstrip it falls between air and the laminate's relative permittivity, and it controls signal speed and propagation delay." },
  { q: "What FR-4 dielectric constant should I use?", a: "Many designers start with about 4.2 to 4.5, but the exact value varies by manufacturer and frequency. Use your fabricator's or laminate datasheet value whenever possible." },
  { q: "How does trace width affect impedance?", a: "Wider traces lower impedance and narrower traces raise it. Increasing the substrate height has the opposite effect and raises impedance." },
  { q: "How accurate is a PCB impedance calculator?", a: "For standard geometries it is typically accurate enough for layout planning. Etch variation, material tolerance, and solder mask can shift the final board by several ohms, so critical designs should be verified with a field solver or a manufacturer test coupon." },
  { q: "Is this PCB impedance calculator free?", a: "Yes, it is free to use on Tolz and does not require you to upload any files." },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

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

export default function PcbImpedanceCalculatorFaqSection() {
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

      <Card title="What Is PCB Impedance?">
        <P>
          PCB impedance is the opposition a trace presents to a signal as it travels along the board. For fast signals, the number that matters is
          the characteristic impedance, written Z0. It is the ratio of voltage to current for a wave moving down the trace, and it is measured in
          ohms.
        </P>
        <P>
          Z0 is not the same thing as the DC resistance of the copper. It does not depend on how long the trace is. It depends on the trace’s shape
          and surroundings: the conductor width, the copper thickness, the distance to the reference plane, and the dielectric constant of the
          material between them. Change any of these and the impedance changes with it.
        </P>
        <P>
          This is why impedance becomes a design issue only when signals get fast. At low speeds, a trace is just a wire. Once the edges are fast
          enough that the signal “sees” the trace as a transmission line, any change in impedance along the path reflects part of the signal back
          toward the source.
        </P>
      </Card>

      <Card title="PCB Trace Impedance vs. Transmission Line Characteristic Impedance">
        <P>
          People often ask whether “PCB trace impedance” and “transmission line characteristic impedance” are different things. In practice, they
          describe the same property. A PCB trace over a reference plane is a transmission line, and its characteristic impedance is what
          designers call the trace impedance.
        </P>
        <P>
          The difference is in how the terms are used. “Characteristic impedance” is the general term from transmission line theory, and it applies
          to coaxial cable, twisted pair, and traces alike. “Trace impedance” is the shorthand PCB designers use for that same value on a board.
          Neither one should be confused with the impedance of a power distribution network, which describes how well a supply holds its voltage
          as the load current changes. That is a separate topic, and this calculator does not model it.
        </P>
        <P>
          A trace starts behaving like a transmission line when its one-way delay becomes a meaningful fraction of the signal’s rise time. A common
          rule of thumb is about one sixth. On FR-4, a signal travels roughly 150 to 170 picoseconds per inch, so with a 1 ns edge, a trace of
          about one inch or longer should be treated as a transmission line. Faster edges shorten that limit.
        </P>
      </Card>

      <Card title="What Is an Impedance-Controlled PCB?">
        <P>
          An impedance-controlled PCB is a board where selected traces are built to a specific target impedance, within a stated tolerance, usually
          ±10 percent. The target is set by the interface, such as a 50 Ω single-ended or 100 Ω differential.
        </P>
        <P>
          To make this possible, the designer and the fabricator agree on a stackup, which lists the copper weights, the dielectric materials, and
          their thicknesses. The designer then sets trace widths and spacings that produce the target impedance on each layer. The fabricator
          adjusts those dimensions slightly to match their process and typically builds a test coupon on the production panel to measure the
          result. Controlled impedance is called out in the fabrication notes so the shop knows which nets, layers, and tolerances apply.
        </P>
      </Card>

      <Card title="Why Impedance Control Matters in High-Speed Designs">
        <P>
          At high speed, an impedance discontinuity acts like a small mirror. Part of the signal bounces back, and the reflected energy mixes with
          the original. The result is ringing, overshoot, distorted edges, and a smaller eye opening on the receiver. These problems often show up
          as intermittent errors that are hard to trace after boards are built.
        </P>
        <P>
          Controlled impedance keeps the path consistent from driver to receiver, which protects timing margin and helps the design pass compliance
          testing for interfaces like USB, HDMI, Ethernet, PCIe, and DDR memory. It also reduces radiated emissions, since a well-terminated line
          has less reflected energy to radiate. For RF circuits, a consistent 50 Ω path improves return loss and power transfer.
        </P>
      </Card>

      <Card title="Do You Need to Consider Impedance in a DC Circuit PCB?">
        <P>
          Usually not. A board that carries only DC or very slow signals, like a simple LED driver, a sensor on a slow ADC, or a basic relay
          circuit, does not need controlled impedance. The trace is electrically short compared with the signal’s edge rate, so reflections are not
          a concern. In those designs, trace <Link to="/tools/pcb-trace-current-calculator" className="inline-home-link">current capacity</Link> and <Link to="/tools/voltage-drop-calculator" className="inline-home-link">voltage drop</Link> are the more useful things to check.
        </P>
        <P>
          The picture changes if a “DC” board also carries fast edges. A switching regulator, a microcontroller with a fast clock, or an SPI bus
          running at tens of megahertz can all have edges fast enough to matter. What counts is the rise time of the signal, not its repetition
          rate. If you are unsure, estimate the rise time and compare the trace’s one-way delay against it, using the rule of thumb above.
        </P>
      </Card>

      <Card title="How to Use the PCB Impedance Calculator">
        <P>Using the tool takes only a few steps:</P>
        <List ordered items={[
          ["Select the PCB conductor.", "Choose from the list of microstrip and stripline types. The calculator shows a diagram of the selected conductor with every dimension labeled, so you can tell which type matches your stackup and which values to enter."],
          ["Enter the geometry.", "Fill in the trace thickness (T), trace width (W), and substrate height (H), which is the separation between the signal line and the reference plane. Each field has its own unit selector, so you can work in mils, millimeters, micrometers, inches, and more. The thickness field also accepts ounces per square foot, which is useful because copper weight is often given in ounces."],
          ["Enter the substrate dielectric.", "This is the relative permittivity of your substrate material."],
          ["Choose whether to show the effective signal width.", "Turn this on if you want the effective signal width reported along with the other results."],
          ["Click Calculate.", "You get the impedance for the selected conductor along with the effective dielectric constant. Use Clear to start over with a different setup."],
        ]} />
        <P>
          For coupled and multi-layer conductors, the diagram shows the extra dimensions that the selected type needs, so you can enter everything
          straight from your stackup drawing.
        </P>
      </Card>

      <Card title="The Process of Calculating PCB Impedance">
        <P>Whether you do it by hand or with a calculator, the process follows the same logic:</P>
        <List ordered items={[
          ["", "Identify where the trace sits in the stackup and what surrounds it. This tells you which geometry applies."],
          ["", "Gather the stackup data: copper thickness, dielectric height, and relative permittivity."],
          ["", "Apply the closed-form equation for that geometry, or enter the values into the calculator."],
          ["", "Compare the result with the target. If it is off, change the trace width, since that is the dimension you control most freely in layout."],
          ["", "Repeat until the result matches the target, then confirm the width is manufacturable."],
        ]} />
        <P>
          Doing this by hand means working through long equations with logarithms and correction terms, and one slip in a unit or a coefficient
          throws off the answer. A calculator removes that risk and lets you try several widths in seconds.
        </P>
      </Card>

      <Card title="Microstrip vs. Stripline: Choosing the Right Model">
        <P>The first decision in any impedance calculation is where the trace lives in the stackup.</P>
        <Lead lead="Microstrip">
          traces sit on an outer layer with a reference plane on one side and air, or solder mask, on the other. Because the electric field splits
          between the laminate and the air above, the wave sees a blend of two materials. That blend is the effective dielectric constant, and it
          always falls between 1 and the laminate’s relative permittivity. Microstrip is easier to probe and rework, but it radiates more and is
          more sensitive to solder mask thickness.
        </Lead>
        <Lead lead="Stripline">
          traces sit on an inner layer between two reference planes. The field stays almost entirely inside the dielectric, so ε_eff is essentially
          the same as the laminate’s relative permittivity. Stripline offers better shielding and lower crosstalk, which makes it a common choice
          for noisy or sensitive nets, at the cost of more layers and vias.
        </Lead>
        <P>The calculator also handles these variants:</P>
        <List items={[
          ["Microstrip:", "a single trace on an outer layer over one reference plane, the standard starting point for 50 Ω lines."],
          ["Edge-coupled microstrip:", "two traces side by side on the same outer layer. This is the common arrangement for differential pairs such as USB, HDMI, and Ethernet."],
          ["Wire microstrip:", "a round conductor held above a ground plane, useful for bond wires and similar structures."],
          ["Embedded microstrip:", "a surface trace covered by an extra layer of dielectric or coating. The added dielectric raises ε_eff and lowers impedance compared with a bare trace."],
          ["Wire stripline:", "a round conductor centered between two planes."],
          ["Edge-coupled stripline:", "two traces side by side on an inner layer between two planes."],
          ["Broadside-coupled stripline:", "two traces stacked on adjacent layers, one above the other, used when tight coupling is needed without using extra routing width."],
          ["Symmetric stripline:", "a trace placed midway between two planes."],
          ["Asymmetric stripline:", "a trace offset toward one plane, which is a frequent result of real-world stackups."],
        ]} />
        <P>
          Choosing the model that matches your actual stackup matters more than any other input. A correct formula applied to the wrong geometry
          gives a confident but wrong answer.
        </P>
      </Card>

      <Card title="Inputs You Need and What Each One Does">
        <Lead lead="Relative permittivity of the substrate.">
          Standard FR-4 is often quoted around 4.2 to 4.5, but the real value shifts with frequency, resin content, and glass weave. For critical
          work, use the figure from your laminate datasheet at your operating frequency rather than a generic number.
        </Lead>
        <Lead lead="Substrate height (H).">
          This is the distance from the trace to its reference plane. It is the most powerful lever: more height raises impedance, and less height
          lowers it. In a multilayer board, it comes from the prepreg or core thickness in your stackup.
        </Lead>
        <Lead lead="Trace width (W).">
          A wider trace lowers impedance and a narrower one raises it. This is usually the value you adjust to hit a target.
        </Lead>
        <Lead lead="Thickness (T).">
          This is the copper thickness. One ounce of copper is about 35 µm, or 1.4 mil, though plating on outer layers adds to the finished
          thickness. Thicker copper slightly lowers impedance.
        </Lead>
        <Lead lead="Spacing for coupled pairs.">
          For the coupled conductor types, closer spacing increases coupling and lowers the differential impedance, while wider spacing moves the
          pair toward two independent traces. Read the result labels to see which impedance value the tool reports for the selected type.
        </Lead>
      </Card>

      <Card title="How Effective Dielectric Constant Is Used">
        <P>
          ε_eff is not just a side output. It determines how fast signals travel on the trace. Propagation velocity equals the speed of light
          divided by the square root of ε_eff, so a higher ε_eff means a slower signal and more delay per inch. This feeds directly into length
          matching for DDR byte lanes, differential skew budgets, and timing on high-speed buses.
        </P>
        <P>
          For microstrip, ε_eff depends on the ratio of <Link to="/tools/pcb-trace-width-calculator" className="inline-home-link">trace width</Link> to substrate height, because that ratio controls how much of the field sits in
          the laminate versus the air. Stripline avoids this complication because the field stays in the dielectric. Seeing ε_eff next to the
          impedance lets you check timing and impedance in one pass.
        </P>
      </Card>

      <Card title="The Math Behind the Result">
        <P>
          Impedance calculators rely on closed-form approximations derived from transmission line theory. These equations appear in standard
          references, including IPC-2141 and the microstrip literature, and each one is accurate within a defined range of width-to-height ratios
          and permittivity values. They are simple enough to evaluate instantly in a browser.
        </P>
        <P>
          The trade-off is that approximations are only as good as their assumptions. They treat the trace as a clean rectangle, the dielectric as
          uniform, and the reference plane as continuous. Real boards have etch factor, solder mask over traces, mixed prepreg and core layers, and
          plane cutouts. A closed-form calculator is excellent for sizing and sanity checks. A 2D field solver is better for final sign-off on
          aggressive designs.
        </P>
      </Card>

      <Card title="How Do You Do Impedance Matching on a PCB?">
        <P>
          Impedance matching means making the impedance of the source, the trace, and the load agree so that as little signal as possible is
          reflected. On a PCB, there are three common ways to get there.
        </P>
        <Lead lead="Match the trace to the system impedance.">
          Use the calculator to size the trace for the target, such as 50 Ω for RF or 90 to 100 Ω for differential pairs, so the line itself
          matches the driver, connector, and receiver.
        </Lead>
        <Lead lead="Terminate the line.">
          A series <Link to="/tools/resistor-calculator" className="inline-home-link">resistor</Link> placed near the driver adds to its output impedance, so the total equals the trace impedance. A parallel resistor to a
          reference voltage at the receiver absorbs the arriving signal instead of reflecting it. Differential links often use a resistor across
          the pair at the receiver.
        </Lead>
        <Lead lead="Avoid discontinuities.">
          Keep the width and reference plane consistent, limit stubs, and place return vias next to signal vias when a trace changes layers. Each
          change in geometry is a small impedance step.
        </Lead>
        <P>
          The impedance required depends on the interface. The chip datasheet or the interface standard states the target, and the calculator
          helps you reach it with a practical trace width.
        </P>
      </Card>

      <Card title="How to Design Impedance Control for a PCB">
        <P>A reliable process for controlled impedance looks like this:</P>
        <List ordered items={[
          ["", "List the nets that need controlled impedance and their targets, based on interface specifications and chip datasheets."],
          ["", "Ask your fabricator for their standard stackups, including layer thicknesses and laminate permittivity values."],
          ["", "Pick a stackup that puts each controlled net next to a solid reference plane."],
          ["", "Use the calculator to find the trace width, and the spacing for pairs, that hits each target on its layer."],
          ["", "Check that the widths and spacings are routable, including breakouts from fine-pitch parts."],
          ["", "Enter those values as net class or design rules in your layout software."],
          ["", "Add a fabrication note that states the controlled nets, layers, targets, and tolerance, and send the stackup to the fabricator for confirmation."],
        ]} />
        <P>This workflow keeps the calculator in its best role: fast design exploration that you then verify with manufacturing data.</P>
      </Card>

      <Card title="When and Why You Would Use This Tool">
        <Lead lead="High-speed digital interfaces.">
          USB 2.0 uses 90 Ω differential, Ethernet and LVDS commonly use 100 Ω differential, and PCIe commonly uses 85 Ω differential, with
          single-ended lines typically at 50 Ω. Missing these targets by 10 to 15 percent can shrink your timing margin.
        </Lead>
        <Lead lead="RF and microwave traces.">
          Antenna feeds, filters, and matching networks usually need a clean 50 Ω path. At gigahertz frequencies, a trace that is slightly too
          narrow can cause measurable return loss.
        </Lead>
        <Lead lead="DDR memory routing.">
          Address, command, and data lines have strict impedance and length requirements, and ε_eff helps you turn length tolerances into timing
          tolerances.
        </Lead>
        <Lead lead="Stackup planning.">
          Before settling on a stackup, you can test how different substrate heights affect trace width. A stackup that forces a 2-mil trace to
          reach 50 Ω is a manufacturing risk you can catch early.
        </Lead>
        <Lead lead="Learning and prototyping.">
          Students and hobbyists building a first fast board can change one value at a time and see how each parameter moves the impedance.
        </Lead>
        <Lead lead="Troubleshooting.">
          If a board shows ringing or reflections, entering the as-built geometry can show whether an impedance mismatch is the cause.
        </Lead>
      </Card>

      <Card title="Tips for Better Impedance Results">
        <List items={[
          ["Use fabricator-supplied stackups.", "They list the actual prepreg and core thicknesses and the permittivity values the shop uses, which removes the largest source of error."],
          ["Keep a continuous reference plane.", "A perfect calculation fails if the trace crosses a gap in the plane beneath it."],
          ["Limit layer changes.", "Each transition between reference planes needs a nearby return via."],
          ["Match spacing to routability.", "A pair that calculates well but cannot escape a BGA is not a usable design."],
          ["Account for frequency.", "Permittivity and loss both change with frequency, so for multi-gigabit links, use laminate data at the relevant frequency."],
          ["Validate critical nets.", "Use simulation or a test coupon wherever a few ohms of error would break compliance."],
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
