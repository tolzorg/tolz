import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I convert amp-hours to watt-hours?", a: "Multiply the battery’s voltage by its capacity in amp-hours. A 12V 100Ah battery stores 12 × 100 = 1,200Wh." },
  { q: "How do I calculate amp-hours from watt-hours?", a: "Divide the watt-hours by the voltage. A 26.4Wh battery at 12V has a capacity of 26.4 ÷ 12 = 2.2Ah." },
  { q: "How do I convert mAh to Wh?", a: "Divide the mAh by 1,000 to get Ah, then multiply by the voltage. For example, 5,000mAh at 3.7V is 5 × 3.7 = 18.5Wh." },
  { q: "What is the C-rate of a battery?", a: "The C-rate is the charge or discharge current divided by the battery’s capacity. A 1C rate drains a battery in one hour, 2C in 30 minutes, and 0.5C in two hours." },
  { q: "How do I find the discharge current of a battery?", a: "Multiply the C-rate by the capacity in Ah. A 10Ah battery discharging at 2C delivers 20A." },
  { q: "How long will a 100Ah battery last?", a: "It depends on the load. At 10A, a 100Ah battery lasts about 10 hours in theory. At 12V with a 100W load, it draws about 8.3A and lasts around 12 hours at full capacity, and less once depth of discharge and efficiency are considered." },
  { q: "Do batteries with higher amp-hours deliver more power?", a: "Not by themselves. Amp-hours show how much charge a battery holds. Power depends on voltage and the current the battery can safely supply, which is set by its C-rating." },
  { q: "Is Ah or Wh a better measure of battery capacity?", a: "Wh is better for comparison because it accounts for voltage. Ah only compares batteries of the same voltage." },
  { q: "How many watt-hours are in an 18650 battery?", a: "Most 18650 cells hold about 7 to 13Wh. A 3.7V cell rated at 3,000mAh stores about 11.1Wh." },
  { q: "How high of an amp can a battery safely charge?", a: "It depends on the battery’s maximum charge rate. As a general guide, lead-acid is about 0.1C to 0.2C, and lithium batteries are often 0.5C to 1C. Check the datasheet." },
  { q: "Can I connect batteries with different amp-hour ratings in parallel?", a: "It is possible if the voltage and chemistry match, but it is risky. A mismatch in state of charge can cause large current between the batteries. Identical batteries are the safer choice." },
  { q: "What is the airline limit for batteries in Wh?", a: "Most airlines allow lithium batteries up to 100Wh in carry-on baggage, with 100–160Wh typically requiring airline approval. Check your airline’s current rules before you travel." },
  { q: "Is the Tolz battery capacity calculator free?", a: "Yes. It is free to use, and you don’t need to sign up to run a calculation." },
];

// The supplied FAQ schema matches the list above with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

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

export default function BatteryCapacityCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is a Battery Amp, Amp-Hour, and Watt-Hour?">
        <P>These three terms show up on almost every battery, and they measure different things.</P>
        <Lead lead="Amp (A)">
          is the unit of electric current, meaning how much charge flows through a circuit each second. A phone charger might supply 2 amps. A car
          starter motor might pull several hundred.
        </Lead>
        <Lead lead="Amp-hour (Ah)">
          measures how much electric charge a battery can deliver. One amp-hour means the battery can supply one amp of current for one hour. A
          100Ah battery can, in theory, supply 100 amps for one hour, 10 amps for ten hours, or 1 amp for 100 hours. Smaller batteries use
          milliamp-hours (mAh), where 1,000mAh equals 1Ah. This is what the amp-hour capacity of a chemical battery represents: the amount of
          charge its chemistry can release before it is empty.
        </Lead>
        <Lead lead="Watt-hour (Wh)">
          measures energy. One watt-hour is one watt of power sustained for one hour. Energy is what actually runs your devices, which is why
          watt-hours tell you more about a battery than amp-hours do. A larger unit, the kilowatt-hour (kWh), equals 1,000Wh and is what you see on
          electricity bills and in electric vehicle specs.
        </Lead>
      </Card>

      <Card title="How Do Amp-Hour Batteries Work?">
        <P>
          A battery stores energy in chemical form. When you connect a load, a chemical reaction inside the cells moves electrons through the
          circuit, and that flow of electrons is the current. The amount of active material in the cells sets how much charge the battery can
          deliver, and that is the amp-hour rating.
        </P>
        <P>
          Two things then decide how the battery performs. The chemistry sets the voltage, for example about 3.6–3.7V per lithium-ion cell, 3.2V
          per LiFePO4 cell, and 2V per lead-acid cell. The number of cells wired in series sets the total pack voltage. More active material, or
          more cells in parallel, raises the capacity. As the battery discharges, the reaction consumes its active material, the voltage slowly
          falls, and eventually the battery can’t supply the load anymore.
        </P>
      </Card>

      <Card title="How to Use the Battery Capacity Calculator">
        <P>
          The tool has three main inputs and three additional battery parameters. You don’t need to fill in everything. Enter what you know, leave
          the rest blank, and press Calculate.
        </P>
        <List ordered items={[
          ["", "Enter the voltage, using millivolts, volts, kilovolts or megavolts."],
          ["", "Enter the battery capacity in amp-hours (Ah) or milliamp-hours (mAh)."],
          ["", "Or enter the stored energy in watt-hours, kilowatt-hours, joules, kilojoules or megajoules."],
          ["", "Under Other battery parameters, enter a C-rate or a discharge current (in amps, milliamps or microamps) if you want to find the other one, plus the runtime to full capacity, which you can display in seconds, minutes or hours."],
          ["", "Press Calculate. Values the calculator fills in are shown in blue."],
        ]} />
        <P>
          If you type more values than the calculator needs, it keeps the ones you typed last. The page also includes two ready-made examples: a
          medical device battery (14.8V, 3.65Ah, which gives 54.02Wh) and a drone battery (22.2V, 97.7Wh, which gives about 4.40Ah). They are a
          quick way to see how the fields work.
        </P>
        <P>
          Use the nominal voltage printed on the battery, not the reading from a multimeter. A “12V” lead-acid battery measures around 12.6–12.8V
          fully charged and drops under load, but capacity ratings are based on the nominal value.
        </P>
      </Card>

      <Card title="Battery Capacity Formula: Convert Amp Hours to Watt Hours">
        <P>
          The core of any Ah to Wh calculator is a single formula. It comes straight from basic electrical relationships. Power equals voltage
          times current (P = V × I), and energy equals power times time (E = P × t). Combine them and you get E = V × I × t. Since current
          multiplied by time is charge in amp-hours (Q), the battery capacity formula becomes:
        </P>
        <Formula>Energy (Wh) = Voltage (V) × Capacity (Ah)</Formula>
        <P>
          Because energy depends on voltage as well as charge, two batteries with the same Ah rating can store very different amounts of energy. A
          100Ah battery at 12V stores 1,200Wh. A 100Ah battery at 48V stores 4,800Wh, four times as much.
        </P>
        <P>Here are a few worked examples:</P>
        <List items={[
          ["12V, 100Ah:", "12 × 100 = 1,200 Wh (1.2 kWh)"],
          ["24V, 50Ah:", "24 × 50 = 1,200 Wh"],
          ["3.7V, 5,000mAh:", "5,000mAh is 5Ah, so 3.7 × 5 = 18.5 Wh"],
          ["48V, 100Ah:", "48 × 100 = 4,800 Wh (4.8 kWh)"],
        ]} />
        <P>
          The second example shows why Ah alone is a poor way to compare batteries. A 50Ah battery can hold as much energy as a 100Ah one if its
          voltage is twice as high.
        </P>
        <H3>How to Calculate Amp Hours From Watt Hours</H3>
        <P>
          To go the other way, divide the energy by the voltage: Ah = Wh ÷ V. Say you have a standard 12V battery that stores 26.4Wh. The capacity
          is 26.4 ÷ 12 = 2.2Ah. In the calculator, enter 12 for voltage and 26.4 for stored energy, leave capacity blank, and it returns 2.2Ah.
        </P>
        <H3>How Many Watt Hours Are in an 18650 Battery?</H3>
        <P>
          The 18650 is a common lithium-ion cell found in laptop packs, flashlights and power tools. Most have a nominal voltage of 3.6–3.7V and a
          capacity between about 2,000 and 3,500mAh. A 3.7V cell rated at 3,000mAh holds 3.7 × 3 = 11.1Wh. Across the usual range, a single 18650
          stores roughly 7 to 13Wh. Enter 3.7V and the mAh value from the cell’s label and the calculator gives the exact figure.
        </P>
      </Card>

      <Card title="How Does Battery Voltage Relate to Current and Amp Hours?">
        <P>
          Voltage, current and amp-hours are connected, but they are not the same thing. Voltage is set by the battery’s chemistry and how many
          cells are in series. Amp-hours are set by how much active material the cells hold. Current is not a fixed property of the battery at
          all. It depends on the load you connect.
        </P>
        <P>
          The link between them is power. A device that needs a certain number of watts pulls current equal to power divided by voltage (I = P ÷
          V). A 120W load on a 12V battery draws 10 amps. The same load on a 24V battery draws only 5 amps. This is why higher-voltage systems can
          use thinner wiring and lose less energy as heat. Voltage also determines energy: more volts at the same Ah means more watt-hours.
        </P>
      </Card>

      <Card title="Why Are Batteries Rated in Ah Instead of Wh?">
        <P>
          Amp-hours became the standard rating partly because they are easy to measure. A lab can discharge a cell at a known current and time how
          long it lasts. Amp-hours also stay fairly consistent for a given cell, even as the voltage drifts down during discharge. Watt-hours depend
          on that whole changing voltage curve, so they are harder to state with a single number.
        </P>
        <P>
          The drawback is that Ah only makes sense when you compare batteries of the same voltage. That is why watt-hours are the better figure for
          comparing packs, and why many e-bike, power station and airline-regulated products now list Wh. Converting from Ah takes one
          multiplication, which is exactly what this calculator does.
        </P>
      </Card>

      <Card title="Do Batteries With Higher Amp Hours Deliver More Power?">
        <P>
          Not necessarily. Amp-hours tell you how much charge a battery holds, which relates to how long it can run, not how much power it can
          deliver at one moment. Power is voltage times current, and the current a battery can safely supply depends on its C-rating.
        </P>
        <P>
          Take a 56V 7.0Ah battery and an 80V 2.0Ah battery. The first stores 56 × 7 = 392Wh. The second stores 80 × 2 = 160Wh. The 56V pack holds
          more than twice the energy, so it will run a tool much longer, even though the 80V pack has the higher voltage. The 80V pack may deliver
          more peak power if its cells allow a high discharge current, but it will run out much sooner. Compare Wh for runtime and compare voltage
          and C-rating for power.
        </P>
      </Card>

      <Card title="What Is a Battery C-Rate and How Do You Calculate It?">
        <P>The C-rate describes how fast a battery is charged or discharged relative to its capacity:</P>
        <Formula>C-rate = Current (A) ÷ Capacity (Ah)</Formula>
        <P>
          A 1C rate would fully drain the battery in one hour. At 2C it takes 30 minutes, and at 0.5C it takes two hours. For example, a 100Ah
          battery at 100A is running at 1C. At 200A it is at 2C. At 50A it is at 0.5C. A full explanation of the concept is available from{" "}
          <Ext href="https://batteryuniversity.com/article/bu-402-what-is-c-rate">Battery University</Ext>.
        </P>
        <P>
          The C-rate matters because every battery has a limit to how fast it can be charged or discharged. Staying inside that limit keeps the
          battery cooler, protects its lifespan, and avoids dangerous overheating, especially in lithium cells. It also helps you pick the right
          battery. A drone needs a pack that can handle high C-rates, while a battery for a slow, steady load does not.
        </P>
        <H3>What Determines a Battery’s C-Rating?</H3>
        <P>The C-rating comes from how the cell is built. The main factors are:</P>
        <List items={[
          ["Internal resistance.", "Lower resistance means less heat when current flows, so the cell can handle more."],
          ["Electrode design.", "Thin electrodes with more surface area move current faster than thick, energy-focused ones."],
          ["Chemistry.", "Lead-acid batteries are usually limited to a low C-rate. LiFePO4 typically handles around 1C to 3C. High-power lithium-polymer packs for drones and RC cars can be rated at 20C or more."],
          ["Heat management.", "How well the cell sheds heat limits how long it can run at a high rate."],
        ]} />
        <P>The manufacturer tests the cell and publishes the continuous and peak ratings on the datasheet. Use those numbers rather than guessing.</P>
        <H3>Can You Exceed a Battery’s C-Rating for Short Bursts?</H3>
        <P>
          Some batteries list two ratings: a continuous rating and a higher burst rating, usually for a few seconds. Going up to the burst rating
          for the stated time is fine. Going past it is not safe. Exceeding the rating causes heat buildup and voltage sag, reduces cycle life, and
          in lithium cells can lead to swelling, fire or failure. If a datasheet gives no burst rating, assume the continuous rating is the limit.
        </P>
      </Card>

      <Card title="Discharge Current and Runtime to Full Capacity">
        <P>The calculator links the C-rate to current with a simple equation:</P>
        <Formula>Discharge current (A) = C-rate × Capacity (Ah)</Formula>
        <P>
          A 5Ah battery at 20C delivers up to 100A. A 100Ah LiFePO4 battery at 0.5C delivers 50A. The calculator uses the same value for charging
          or discharging, so it is simply the current flowing in or out of the battery.
        </P>
        <P>
          The runtime to full capacity is the time it takes to fully charge or discharge the battery at that current. It equals 1 ÷ C-rate in
          hours, or 60 ÷ C-rate in minutes. At 1C it is 60 minutes, at 2C it is 30 minutes, and at 0.5C it is 120 minutes. This is a theoretical
          figure. It assumes the battery delivers its full rated capacity, which real batteries rarely do.
        </P>
      </Card>

      <Card title="How High of an Amp Can a Battery Safely Charge?">
        <P>The safe charging current is set by the battery’s C-rate for charging, and it is usually lower than the discharge rating. Common guidelines are:</P>
        <List items={[
          ["Lead-acid:", "about 0.1C to 0.2C, or 10–20A for a 100Ah battery."],
          ["Lithium-ion:", "commonly 0.5C to 1C, depending on the cell."],
          ["LiFePO4:", "typically 0.2C to 0.5C, with some cells rated higher."],
        ]} />
        <P>Always check the manufacturer’s maximum charge rate. Charging too fast heats the cells and shortens battery life.</P>
        <H3>How Do You Determine the Amperage Needed to Charge a Battery?</H3>
        <P>
          Start with the capacity and your target charge time. To charge a 100Ah battery in about 5 hours, you need 100 ÷ 5 = 20A, which is 0.2C.
          Then add a little extra time for charging losses. Lead-acid batteries are usually 80–85% efficient on charge, and lithium batteries are
          closer to 95% or better. At 85% efficiency, that 5-hour estimate becomes about 5.9 hours. Make sure the result stays within the battery’s
          recommended charge rate. If it doesn’t, charge more slowly. You can enter your capacity and a planned current in the calculator to see the
          C-rate and check it right away.
        </P>
      </Card>

      <Card title="Battery Runtime: How Long Will It Last?">
        <P>Runtime is what most people want to know. There are two equivalent ways to calculate it. With the load current:</P>
        <Formula>Runtime (hours) = Capacity (Ah) ÷ Load current (A)</Formula>
        <P>With the load power:</P>
        <Formula>Runtime (hours) = Energy (Wh) ÷ Load power (W)</Formula>
        <P>
          A 12V 100Ah battery (1,200Wh) powering a 100W load runs for 1,200 ÷ 100 = 12 hours in theory. A 300W load cuts that to 4 hours. In this
          calculator, enter the capacity and the load current to get the runtime to full capacity. If you only know the wattage, divide it by the
          voltage to get the current first.
        </P>
        <H3>How Can a Couple of Dome Lights Drain a 40Ah Car Battery Overnight?</H3>
        <P>
          Two 5W interior bulbs draw 10W in total. On a 12V system that is about 0.83A. Over a 10-hour night, that uses about 8.3Ah, which is
          roughly 20% of a 40Ah battery. On a healthy battery that usually won’t prevent the engine from starting. But a car battery is not meant to
          be drained deeply, and an aging battery may hold only half its rated capacity. Add a second small drain, such as a faulty module or a
          stuck bulb, and a battery that seems fine can fail by morning. This is a good example of how a small, steady load adds up over time.
        </P>
      </Card>

      <Card title="What Is the Watt-Hour Efficiency of a Battery?">
        <P>
          Not all the energy you put into a battery comes back out. Watt-hour efficiency, also called round-trip efficiency, compares the energy
          you get out with the energy you put in. Lithium-ion batteries usually reach about 90–95%. Lead-acid batteries are lower, often 70–85%.
          The difference is lost mostly as heat. If you charge a lead-acid battery with 1,200Wh, you might only get about 900–1,000Wh back out.
        </P>
        <P>The calculator shows rated stored energy and does not calculate efficiency. For real planning, multiply the result by the efficiency of your battery type.</P>
      </Card>

      <Card title="Can You Connect Batteries With Different Amp-Hour Ratings in Parallel?">
        <P>
          Connecting batteries in parallel adds their capacity while the voltage stays the same. A 100Ah battery and a 50Ah battery in parallel
          make a 150Ah bank, and at 12V that is 1,800Wh. Connecting in series adds voltage and keeps capacity the same.
        </P>
        <P>
          Mixing different Ah ratings can work, but it needs care. The batteries must have the same nominal voltage and chemistry, and they should
          be at a similar state of charge and age when connected. Otherwise a large current can flow between them. The smaller battery also
          carries a bigger share of the load compared with its size, so it works at a higher C-rate than the larger one. When in doubt, use
          identical batteries and follow the manufacturer’s guidance.
        </P>
      </Card>

      <Card title="When and Why You Need a Battery Capacity Calculator">
        <P>Capacity calculations come up in many situations:</P>
        <List items={[
          ["Solar and off-grid systems.", "Sizing a battery bank starts with your daily energy use in Wh. Once you know that, you can work out how many batteries at what voltage you need to cover a night or a cloudy day."],
          ["RVs, vans and boats.", "A 12V house battery runs lights, a fridge, a water pump and chargers. Converting Ah to Wh and dividing by your total load tells you how long you can go between charges."],
          ["Power banks and travel.", <>Airlines generally limit lithium batteries in carry-on bags to 100Wh, and larger ones (up to 160Wh) need airline approval, as explained in the <Ext href="https://www.faa.gov/hazmat/packsafe/lithium-batteries">FAA’s guidance on lithium batteries</Ext>. Power banks often print only mAh, so converting to Wh is how you check. A 20,000mAh bank at 3.7V is about 74Wh, which is within the limit.</>],
          ["UPS and backup power.", "To know how long a UPS or home backup battery will keep a router, computer or medical device running, you need the runtime at a specific load."],
          ["Electric bikes and scooters.", "Range depends on battery energy in Wh. Comparing a 36V 10Ah pack (360Wh) with a 48V 14Ah pack (672Wh) is much clearer in watt-hours than in amp-hours."],
          ["Electronics projects.", "Hobbyists building Arduino, Raspberry Pi or sensor projects need to know whether a small lithium cell can last a day, a week or a season."],
          ["Drones and RC models.", "The C-rate is critical because flight demands high bursts of current, and an under-rated pack can sag or overheat mid-flight."],
        ]} />
      </Card>

      <Card title="What Affects Real-World Battery Capacity and Runtime">
        <P>The formulas give a clean number, but a battery in actual use rarely delivers exactly that.</P>
        <List items={[
          ["Depth of discharge (DoD).", "Not all of a battery’s capacity should be used. Lead-acid batteries last longest when discharged only to about 50%, so a 100Ah lead-acid battery has roughly 50Ah of practical capacity. LiFePO4 batteries tolerate 80–100% DoD. Multiply the full-capacity result by the usable fraction."],
          ["Battery chemistry.", "Lithium-ion, LiFePO4, lead-acid (flooded, AGM, gel) and NiMH batteries differ in voltage behavior, efficiency and tolerance to deep discharge."],
          ["Discharge rate and the Peukert effect.", "Lead-acid batteries deliver less total capacity when drained quickly. A 100Ah rating is usually specified at a slow 20-hour rate, so a heavy load reduces the effective capacity. Lithium batteries are far less affected but still lose some usable energy at very high C-rates."],
          ["Inverter and converter efficiency.", "When you run AC appliances from a DC battery, the inverter typically wastes 5–15% of the energy. A 1,200Wh battery behind an 88%-efficient inverter delivers around 1,056Wh to the load."],
          ["Temperature.", "Cold weather reduces available capacity, sometimes sharply below freezing, and heat speeds up aging."],
          ["Age and health.", "A battery that has been cycled hundreds of times holds less than its original rating. Use a measured capacity if you have one."],
        ]} />
        <P>
          A practical approach is to take the full-capacity runtime, then multiply by your usable DoD and system efficiency. For a 1,200Wh
          lead-acid battery with a 300W AC load, that is 4 hours × 0.5 × 0.88, or about 1.8 hours of realistic runtime. That gap between theory and
          reality is why planning with a margin protects you from unexpected shutdowns.
        </P>
      </Card>

      <Card title="Is This Battery Capacity Calculator Accurate and Safe to Use?">
        <P>
          The calculator uses standard electrical relationships: Wh = V × Ah, C = I ÷ Ah, and runtime = capacity ÷ current. The math is
          dependable, but the results are only as accurate as the values you enter. Use the rated nominal voltage and the correct capacity unit.
          The output reflects ideal conditions, so read it alongside the real-world factors above.
        </P>
        <P>
          The tool is free to use, and you don’t need to create an account to run a calculation. You only type in simple electrical values such as
          voltage and capacity, not personal documents or files. For safety-critical setups such as medical equipment, large lithium banks or
          anything with a fire risk, treat the calculator as a planning aid and follow the manufacturer’s specifications and a qualified
          electrician’s advice.
        </P>
      </Card>

      <Card title="Tips for Getting the Most Accurate Results">
        <List items={[
          ["Check your units.", "If the capacity is in mAh, make sure the unit selector says mAh. Watch for Wh versus kWh as well."],
          ["Use the correct pack voltage.", "Cells in series add voltage, so four 3.7V cells make a 14.8V pack. Cells in parallel add capacity but not voltage."],
          ["Measure your actual load.", "A plug-in power meter gives a better wattage figure than an appliance label, which usually shows the maximum draw."],
          ["Add a safety margin.", "Plan for 20–30% more capacity than the calculation suggests."],
          ["Compare batteries in Wh.", "It is the fairest way to compare packs of different voltages."],
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
