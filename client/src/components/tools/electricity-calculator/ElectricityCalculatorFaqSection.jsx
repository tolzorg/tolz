import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the electricity cost of an appliance?",
    a: "Multiply the appliance's power in kilowatts by the share of its capacity it actually runs at and by the hours it is used, to get kilowatt-hours (kWh); then multiply by your price per kWh. A 1,000 W appliance running all day uses 24 kWh, which at $0.15 per kWh costs $3.60 a day.",
  },
  {
    q: "What is a kilowatt-hour?",
    a: "A unit of energy: the energy used to keep up one kilowatt (1,000 watts) of power for one hour. Electricity is usually measured and billed in kilowatt-hours.",
  },
  {
    q: "What does the use/run at capacity mean?",
    a: "The percentage of the power actually being used. Most appliances don't run at full capacity all the time: an AC or oven uses less power to maintain the temperature, a fan may not run at full speed, and the burners of a cooktop are rarely all on at full power.",
  },
  {
    q: "How many watts is a BTU or a ton?",
    a: "One BTU per hour is about 0.2931 W (1 kWh ≈ 3,412 BTU), and one ton of refrigeration is about 3,517 W, or 12,000 BTU/h.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const APPLIANCE_WATTS = [
  ["Home appliances", [
    ["Air conditioner (HVAC)", "2,500–10,000"], ["Air conditioner (window unit)", "1,500–5,000"], ["Heater (home)", "5,000–20,000"],
    ["Heater (portable)", "750–2,000"], ["Humidifier", "25–350"], ["Dehumidifier", "200–750"], ["Fan (ceiling, table)", "15–200"],
    ["Light bulb (LED)", "3–25"], ["Light bulb (incandescent)", "15–200"], ["Electric water heater", "3,000–6,600"],
  ]],
  ["Kitchen appliances", [
    ["Refrigerator", "500–1,000"], ["Electric range/oven", "2,000–5,000"], ["Electric cooktop/stove", "750–5,000"], ["Microwave oven", "750–1,500"],
    ["Dishwasher", "1,200–2,000"], ["Coffee maker", "600–1,200"], ["Toaster", "750–1,500"], ["Electric kettle", "1,000–2,000"], ["Electric cooker", "160–1,500"],
  ]],
  ["Other appliances", [
    ["Electric vehicle charger", "1,500–20,000"], ["Television", "25–500"], ["Washing machine", "400–1,500"], ["Clothes dryer", "1,800–5,000"],
    ["Clothes iron", "750–2,000"], ["Hair dryer", "750–2,000"], ["Desktop computer", "100–250"], ["Laptop computer", "35–150"],
    ["Smart phone charger", "5–25"], ["Water pump/motor", "750–2,000"],
  ]],
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

export default function ElectricityCalculatorFaqSection() {
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
        <h2 style={h2Style}>Units of Electricity</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} electricity calculator estimates what an appliance costs to run. The most common unit of electrical power for
          appliances is the watt (W); other common units of power are kilowatts (kW), British thermal units per hour (BTU/h), horsepower (hp)
          and tons.
        </p>
        <h3 style={{ ...h2Style, fontSize: 15 }}>Watts, kilowatts and kilowatt-hours</h3>
        <p style={pStyle}>
          The watt is a unit of power, the rate of energy transfer: 1 joule per second. A kilowatt is 1,000 watts. Both are SI units and the
          most common units of power. The kilowatt-hour (kWh) is a unit of energy: the energy used to keep up one kilowatt of power for one
          hour. When we talk about the cost of electricity, we talk about energy. Energy (E) and power (P) are related through time (t):
        </p>
        <p style={{ ...pStyle, ...mono }}>P = E / t &nbsp; &nbsp; E = P × t</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Electricity is usually measured and paid for in kilowatt-hours rather than watt-hours simply because of scale: a typical US household
          uses millions of watt-hours a year, so kilowatt-hours are easier to talk about.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BTU, Horsepower and Tons</h2>
        <p style={pStyle}>
          <strong>BTU and BTU/h.</strong> The British thermal unit (BTU), part of the Imperial and US customary units, is the heat needed to
          raise the temperature of 1 pound of water by 1 degree Fahrenheit. Heat is energy, so BTU compares directly with joules, calories
          and kilowatt-hours:
        </p>
        <ul style={listStyle}>
          <li>1 BTU = 0.2931 watt-hours = 0.0002931 kWh</li>
          <li>1 kWh ≈ 3,412 BTU</li>
        </ul>
        <p style={pStyle}>
          BTU/h (BTU per hour) is a unit of power, often shortened to just BTU on appliances: an AC labeled 12,000 BTU transfers 12,000 BTU
          per hour.
        </p>
        <p style={pStyle}>
          <strong>Horsepower.</strong> Horsepower is most often used for the output of engines and motors, and has several definitions. One
          mechanical horsepower is 745.7 watts and one metric horsepower is 735.5 watts (the calculator uses metric horsepower). The term was
          coined by James Watt, who compared steam engines with draft horses by how many times a horse could turn a mill wheel in an hour.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Ton.</strong> In the context of power, a ton means a ton of refrigeration: the rate of heat transfer needed to melt 2,000
          pounds (1 short ton) of pure ice at 0°C in 24 hours. It is used mainly in the United States to describe how well refrigerators and
          air conditioners remove heat: 1 ton ≈ 3,517 watts ≈ 12,000 BTU/h.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Energy Common Appliances Use</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          Estimated power of various appliances (actual values vary a lot between models). The figure on an appliance&apos;s packaging is
          usually its maximum; typical use draws much less, so its energy can&apos;t simply be calculated as power × time — that&apos;s what
          the use/run at capacity is for.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Common appliances</th><th>Estimated wattage (W)</th></tr></thead>
            <tbody>
              {APPLIANCE_WATTS.map(([group, items]) => [
                <tr key={group}><td colSpan={2} style={{ fontWeight: 700 }}>{group}</td></tr>,
                ...items.map(([name, w]) => <tr key={name}><td style={{ paddingLeft: 20 }}>{name}</td><td style={center}>{w}</td></tr>),
              ])}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Energy Saving Tips</h2>
        <p style={pStyle}>Not all of these are always possible, but even a few can lower your electricity bills:</p>
        <ul style={listStyle}>
          <li>
            <strong>Monitor your energy habits.</strong> Tracking how you use electricity for a while shows where it goes. Turning off unused
            lights and appliances, using a standing fan instead of air conditioning, wearing more clothes instead of heating, and washing smaller
            loads of laundry or dishes by hand can all make a real difference.
          </li>
          <li>
            <strong>Replace older light bulbs</strong>, especially incandescent ones, with LEDs. A typical incandescent bulb needs 75 W, an LED
            only 9 W. LEDs cost more up front but save a lot over time.
          </li>
          <li>
            <strong>Install a programmable thermostat</strong> if you can. Heating and cooling are usually a large share of energy costs, and
            adjusting the temperature to your schedule saves a lot. A smart thermostat isn&apos;t required: adjusting it by hand works too.
          </li>
          <li><strong>Consider energy efficiency when buying appliances</strong>, counting the running cost, not just the purchase price.</li>
          <li>
            <strong>Check your windows.</strong> Windows lose a lot of heat, especially in cold regions; more efficient windows help. In hot
            climates, choose windows that reflect more light, and use curtains or blinds during the brightest hours to cut cooling costs.
          </li>
          <li>
            <strong>Insulate your home</strong> as well as you can: poorly insulated windows, doors, vents, the attic, walls, floors, basement
            and crawlspace raise heating and cooling bills.
          </li>
        </ul>
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
