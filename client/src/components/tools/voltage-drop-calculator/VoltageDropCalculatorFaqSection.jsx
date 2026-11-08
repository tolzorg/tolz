import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an acceptable voltage drop?",
    a: "It is recommended that the voltage drop stays below 5% under a fully loaded condition. Too much drop makes lights flicker or burn dimly, heaters heat poorly and motors run hotter than normal and burn out.",
  },
  {
    q: "How do I calculate voltage drop?",
    a: "Use Ohm's law with the round trip of the wire: for DC or single-phase AC, V drop = 2 × I × R × L; for three-phase AC, V drop = √3 × I × R × L, where I is the current, R the resistance per unit length and L the one-way length. With n conductors per phase in parallel, divide by n.",
  },
  {
    q: "How do I reduce voltage drop?",
    a: "Use a larger wire (a lower AWG number), a better conductor (copper instead of aluminum), a shorter run, a higher supply voltage for the same power, or run conductors in parallel.",
  },
  {
    q: "Why does the NEC tab need a power factor?",
    a: "With alternating current, the wire opposes the current with both resistance R and reactance X. The NEC tab uses the effective impedance R × PF + X × sin(arccos PF), so the power factor of the load decides how much the reactance counts. For DC only the resistance matters.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const AWG = [
  ["0000 (4/0)","0.4600","11.684","2.17","0.856","212","107","0.1608","0.04901"],
  ["000 (3/0)","0.4096","10.404","2.44","0.961","168","85.0","0.2028","0.06180"],
  ["00 (2/0)","0.3648","9.266","2.74","1.08","133","67.4","0.2557","0.07793"],
  ["0 (1/0)","0.3249","8.252","3.08","1.21","106","53.5","0.3224","0.09827"],
  ["1","0.2893","7.348","3.46","1.36","83.7","42.4","0.4066","0.1239"],
  ["2","0.2576","6.544","3.88","1.53","66.4","33.6","0.5127","0.1563"],
  ["3","0.2294","5.827","4.36","1.72","52.6","26.7","0.6465","0.1970"],
  ["4","0.2043","5.189","4.89","1.93","41.7","21.2","0.8152","0.2485"],
  ["5","0.1819","4.621","5.50","2.16","33.1","16.8","1.028","0.3133"],
  ["6","0.1620","4.115","6.17","2.43","26.3","13.3","1.296","0.3951"],
  ["7","0.1443","3.665","6.93","2.73","20.8","10.5","1.634","0.4982"],
  ["8","0.1285","3.264","7.78","3.06","16.5","8.37","2.061","0.6282"],
  ["9","0.1144","2.906","8.74","3.44","13.1","6.63","2.599","0.7921"],
  ["10","0.1019","2.588","9.81","3.86","10.4","5.26","3.277","0.9989"],
  ["11","0.0907","2.305","11.0","4.34","8.23","4.17","4.132","1.260"],
  ["12","0.0808","2.053","12.4","4.87","6.53","3.31","5.211","1.588"],
  ["13","0.0720","1.828","13.9","5.47","5.18","2.62","6.571","2.003"],
  ["14","0.0641","1.628","15.6","6.14","4.11","2.08","8.286","2.525"],
  ["15","0.0571","1.450","17.5","6.90","3.26","1.65","10.45","3.184"],
  ["16","0.0508","1.291","19.7","7.75","2.58","1.31","13.17","4.016"],
  ["17","0.0453","1.150","22.1","8.70","2.05","1.04","16.61","5.064"],
  ["18","0.0403","1.024","24.8","9.77","1.62","0.823","20.95","6.385"],
  ["19","0.0359","0.912","27.9","11.0","1.29","0.653","26.42","8.051"],
  ["20","0.0320","0.812","31.3","12.3","1.02","0.518","33.31","10.15"],
  ["21","0.0285","0.723","35.1","13.8","0.810","0.410","42.00","12.80"],
  ["22","0.0253","0.644","39.5","15.5","0.642","0.326","52.96","16.14"],
  ["23","0.0226","0.573","44.3","17.4","0.509","0.258","66.79","20.36"],
  ["24","0.0201","0.511","49.7","19.6","0.404","0.205","84.22","25.67"],
  ["25","0.0179","0.455","55.9","22.0","0.320","0.162","106.2","32.37"],
  ["26","0.0159","0.405","62.7","24.7","0.254","0.129","133.9","40.81"],
  ["27","0.0142","0.361","70.4","27.7","0.202","0.102","168.9","51.47"],
  ["28","0.0126","0.321","79.1","31.1","0.160","0.0810","212.9","64.90"],
  ["29","0.0113","0.286","88.8","35.0","0.127","0.0642","268.5","81.84"],
  ["30","0.0100","0.255","99.7","39.3","0.101","0.0509","338.6","103.2"],
  ["31","0.00893","0.227","112","44.1","0.0797","0.0404","426.9","130.1"],
  ["32","0.00795","0.202","126","49.5","0.0632","0.0320","538.3","164.1"],
  ["33","0.00708","0.180","141","55.6","0.0501","0.0254","678.8","206.9"],
  ["34","0.00630","0.160","159","62.4","0.0398","0.0201","856.0","260.9"],
  ["35","0.00561","0.143","178","70.1","0.0315","0.0160","1079","329.0"],
  ["36","0.00500","0.127","200","78.7","0.0250","0.0127","1361","414.8"],
  ["37","0.00445","0.113","225","88.4","0.0198","0.0100","1716","523.1"],
  ["38","0.00397","0.101","252","99.3","0.0157","0.00797","2164","659.6"],
  ["39","0.00353","0.0897","283","111","0.0125","0.00632","2729","831.8"],
  ["40","0.00314","0.0799","318","125","0.00989","0.00501","3441","1049"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

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
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Voltage Drop Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} voltage drop calculator estimates how much voltage is lost along the wires of an electrical circuit. When
          current flows through a wire, it is pushed by the electrical potential (voltage) and has to overcome the wire&apos;s opposition to it.
          The voltage drop is the potential lost to that opposition.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With alternating current the opposition is called impedance: a two-dimensional quantity made of resistance and reactance (the
          reaction of a built-up electric field to a change of current). With direct current it is simply resistance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Voltage Drop Matters</h2>
        <p style={pStyle}>
          Excessive voltage drop makes lights flicker or burn dimly, heaters heat poorly, and motors run hotter than normal and burn out. Keep the
          drop below 5% under full load by choosing the right wire, and take care with extension cords and similar devices. There are four main
          causes of voltage drop:
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Wire material.</strong> Silver, copper, gold and aluminum are among the best conductors. Copper and aluminum are the most
            common because they cost much less than silver and gold, and copper conducts better than aluminum, so it drops less voltage for the
            same length and size.
          </li>
          <li>
            <strong>Wire size.</strong> Larger wires (greater diameter) drop less voltage than smaller ones of the same length. In the American
            Wire Gauge, every 6-gauge decrease doubles the diameter and every 3-gauge decrease doubles the cross-sectional area. In the metric
            gauge, the gauge is 10 times the diameter in millimeters, so a 50-gauge metric wire is 5 mm across.
          </li>
          <li>
            <strong>Wire length.</strong> Shorter wires drop less voltage than longer ones of the same size. It rarely matters inside a house,
            but it can when running wire to an outbuilding or a well pump.
          </li>
          <li>
            <strong>Current.</strong> More current through a wire means more voltage drop. The most current a wire can carry is its ampacity
            (ampere capacity), which depends on its material, the frequency of an alternating current and the temperature it works in.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Cables bundled together heat each other, which affects ampacity and voltage drop, so bundling follows strict rules. A cable must carry
          its load without overheating in the most extreme temperatures it will see, and provide sound earthing so that people are exposed only
          to a safe voltage and a fault current trips the fuse quickly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Voltage Drop Calculation</h2>
        <p style={pStyle}>Ohm&apos;s law is the basic law for calculating voltage drop:</p>
        <p style={{ ...pStyle, ...mono }}>V<sub>drop</sub> = I × R</p>
        <p style={pStyle}>
          where I is the current through the wire, in amperes, and R the resistance of the wire, in ohms. Wire resistance is usually given per
          unit length, in ohms per kilometer or ohms per 1,000 feet, and the current makes a round trip through the wire. So for a single-phase
          or direct current circuit:
        </p>
        <p style={{ ...pStyle, ...mono }}>V<sub>drop</sub> = 2 × I × R × L</p>
        <p style={pStyle}>and for a three-phase circuit:</p>
        <p style={{ ...pStyle, ...mono }}>V<sub>drop</sub> = √3 × I × R × L</p>
        <p style={pStyle}>
          where R is the resistance per unit length and L the one-way length. With several conductors per phase in parallel, the drop is divided
          by their number. For alternating current, the NEC tab replaces R with the effective impedance R × PF + X × sin(arccos PF), using the NEC
          resistance R and reactance X of the wire in its conduit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, 500 m of 3 AWG copper in steel conduit (R = 0.82 Ω/km, X = 0.194 Ω/km) carrying 1 A at a power factor of 0.85 on a 120 V
          single-phase circuit drops 2 × 1 × 0.7992 × 0.5 ≈ 0.80 V, or 0.67%, leaving 119.2 V at the end.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Typical AWG Wire Sizes</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          The American Wire Gauge (AWG) is the wire gauge system used mainly in North America for the diameters of round, solid, non-ferrous,
          electrically conducting wire. Typical AWG wires and their sizes:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={{ ...tableStyle, minWidth: 620 }}>
            <thead>
              <tr><th rowSpan={2}>AWG</th><th colSpan={2}>Diameter</th><th colSpan={2}>Turns of wire</th><th colSpan={2}>Area</th><th colSpan={2}>Copper resistance</th></tr>
              <tr><th>inch</th><th>mm</th><th>per inch</th><th>per cm</th><th>kcmil</th><th>mm²</th><th>Ω/km</th><th>Ω/1000ft</th></tr>
            </thead>
            <tbody>{AWG.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={i === 0 ? { fontWeight: 600, whiteSpace: "nowrap" } : center}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More tools are in the {link("/calculators/tech-electronics", "tech and electronics calculators")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
