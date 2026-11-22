import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate battery life from mAh?", a: "Multiply the battery’s mAh rating by the usable fraction (1 minus the discharge safety), then divide by the device’s current draw in mA. For example, a 3,000 mAh battery with 20 percent discharge safety and a 300 mA load gives 2,400 ÷ 300 = 8 hours." },
  { q: "How do I calculate battery life with watts?", a: "Convert the battery to watt-hours (Wh = Ah × volts), subtract the discharge safety, and divide by the load in watts. A 100 Wh battery with 20 percent discharge safety running a 20 W device lasts about 4 hours." },
  { q: "What does discharge safety mean?", a: "It is the percentage of the battery’s capacity you plan to leave unused. Setting 20 percent means the calculator counts only 80 percent as usable, which protects battery health and avoids sudden shutdowns." },
  { q: "Why is my actual battery life shorter than the calculated result?", a: "Common causes are cold weather, an aged battery, conversion losses in chargers or inverters, and loads that spike above the average you entered. Raising the discharge safety setting or entering a measured current usually brings the estimate closer to reality." },
  { q: "How do I estimate battery life for a device that sleeps?", a: "Use the awake/sleep mode. Enter the awake time, sleep time, and sleep consumption, and the calculator averages the draw. This works well for Arduino, ESP32, and other low-power projects." },
  { q: "Does a bigger battery always last longer?", a: "No. Runtime depends on capacity and consumption together, so an efficient device with a smaller battery can outlast a power-hungry one with a larger battery." },
  { q: "Does cold weather reduce battery life?", a: "Yes. Cold temporarily lowers the energy a battery can deliver, and the capacity usually returns once it warms up." },
  { q: "Does fast charging damage a battery?", a: "Occasional fast charging does little harm on modern phones, but the extra heat can speed up aging over time. Keeping the phone cool matters more than the charging speed." },
  { q: "How low can I safely discharge a LiPo battery?", a: "Most guidance is to stay above about 3.3 V per cell under load and never let a cell fall to 3.0 V. Using a 20 percent discharge safety setting in the calculator helps you plan around that limit." },
  { q: "What is the difference between LiFePO4 and LiPo batteries?", a: "LiPo packs are lighter and deliver very high currents but are less thermally stable and last fewer cycles. LiFePO4 batteries are heavier, safer, and often last for thousands of cycles, and they usually tolerate deeper discharges." },
  { q: "What happens if a lithium-ion or lead-acid battery is fully drained?", a: "A fully drained lithium-ion cell can suffer permanent internal damage and may become unsafe to recharge. A lead-acid battery left deeply discharged develops sulfation, which permanently reduces its capacity." },
  { q: "What is the difference between mAh, Ah, and Wh?", a: "mAh and Ah measure charge, with 1 Ah equal to 1,000 mAh. Wh measures energy and accounts for voltage, which makes it the better unit for comparing batteries of different voltages." },
  { q: "Can I use this calculator for lithium-ion, LiPo, and lead-acid batteries?", a: "Yes. The math is the same for any chemistry. Just choose a discharge safety setting that suits your battery type, since lead-acid and lithium batteries tolerate different depths of discharge." },
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
const codeStyle = { fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--text-primary)" };
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

export default function BatteryLifeCalculatorFaqSection() {
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

      <Card title="How Is Battery Life Specified?">
        <P>“Battery life” gets used for several different things, which is why the numbers on a spec sheet can be confusing.</P>
        <List items={[
          ["Capacity", "is the amount of charge or energy the battery stores, listed in mAh, Ah, or watt-hours (Wh). This is not a time. It only becomes a time once you know how fast the device uses it."],
          ["Runtime per charge", "is how long the device runs before the battery is empty. Manufacturers often publish this as hours of video playback, talk time, or standby time, measured under specific test conditions."],
          ["Cycle life", "is how many charge and discharge cycles the battery can go through before its capacity drops noticeably, often to around 80 percent of the original rating."],
          ["Shelf life", "is how well the battery holds its charge while sitting unused."],
        ]} />
        <P>
          This calculator deals with the second one. It takes the capacity on the label and converts it into runtime for your own load, which is
          usually more useful than a generic number from a product page.
        </P>
      </Card>

      <Card title="Understanding the Inputs: Capacity, Discharge Safety, and Load">
        <Lead lead="Battery capacity.">
          Small <Link to="/tools/battery-capacity-calculator" className="inline-home-link">batteries</Link> are usually rated in mAh, larger ones in Ah, and laptops and power stations in Wh. A 2,000 mAh battery can, in theory,
          supply 2,000 mA for one hour or 200 mA for ten hours. You can usually find the number printed on the battery or in the product’s
          specifications.
        </Lead>
        <Lead lead="Discharge safety.">
          This is the percentage of the battery’s capacity that you never use. It keeps a healthy reserve in the battery. Draining lithium-ion and
          LiPo cells to zero speeds up aging, and deep discharges can damage lead-acid batteries. If you set discharge safety to 20 percent, the
          calculator treats only 80 percent of the rated capacity as usable. A 20 percent setting is a common starting point for LiPo packs in
          drones and RC vehicles. This one setting often decides whether you get a flattering number or a trustworthy one.
        </Lead>
        <Lead lead="Current draw or wattage.">
          Use the average draw you expect during normal operation, not the peak figure on the spec sheet. If the device only lists <Link to="/tools/electricity-calculator" className="inline-home-link">watts</Link>, which is
          typical for power banks, routers, mini PCs, and appliances, use the wattage option.
        </Lead>
      </Card>

      <Card title="How Battery Life Is Calculated">
        <P>Battery life depends on how much usable energy a battery holds and how quickly a device consumes it.</P>
        <Formula>Battery Life (hours) = Usable Capacity ÷ Power Consumption</Formula>
        <P>To calculate usable capacity, subtract your discharge safety margin from the total capacity.</P>
        <List items={[
          ["Using mAh:", "Divide usable capacity (mAh) by current draw (mA)."],
          ["Using Wh:", "Divide usable energy (Wh) by power consumption (W)."],
        ]} />
        <P>If you only know mAh and <Link to="/tools/voltage-drop-calculator" className="inline-home-link">voltage</Link>, convert to watt-hours first:</P>
        <Formula>Wh = (mAh ÷ 1,000) × Voltage</Formula>
        <P>For example, a 5,000 mAh lithium-ion battery at 3.7 V stores approximately 18.5 Wh.</P>
        <H3>Example 1: Handheld Device</H3>
        <P>A 2,500 mAh battery with a 20% safety margin provides 2,000 mAh of usable capacity. At a 250 mA draw, it lasts approximately 8 hours.</P>
        <H3>Example 2: Power Bank</H3>
        <P>
          A 20,000 mAh power bank at 3.7 V stores 74 Wh. After a 20% safety margin, 59.2 Wh remains. At a 15 W load, it provides approximately 3.9
          hours of runtime.
        </P>
        <P>Note: Power bank mAh ratings refer to internal battery cells, not USB output. For accurate estimates, always calculate using watt-hours.</P>
      </Card>

      <Card title="Estimating Battery Life With Sleep Mode">
        <P>
          Many low-power devices, such as wireless sensors, don't run continuously. They wake up to perform a task, then enter sleep mode to save
          power.
        </P>
        <P>To estimate battery life accurately, you need three additional values:</P>
        <List items={[
          ["Awake time:", "How long the device stays active."],
          ["Sleep time:", "How long the device remains inactive."],
          ["Sleep current:", "How much current it consumes while sleeping, usually measured in µA."],
        ]} />
        <P>The calculator uses these values to find the average current consumption:</P>
        <Formula>I<sub>avg</sub> = (I<sub>a</sub> × T<sub>a</sub> + I<sub>s</sub> × T<sub>s</sub>) ÷ (T<sub>a</sub> + T<sub>s</sub>)</Formula>
        <P>You can use seconds, minutes, or hours, as long as both time values use the same unit.</P>
        <P>Example:</P>
        <P>Consider a wireless sensor with a 2,400 mAh battery and 20% safety margin.</P>
        <List items={[
          ["Awake:", "10 seconds at 50 mA"],
          ["Sleep:", "590 seconds at 0.02 mA"],
          ["Battery capacity:", "2,400 mAh"],
        ]} />
        <P>
          The average current consumption is approximately 0.85 mA. After accounting for the safety margin, usable capacity is 1,920 mAh.
        </P>
        <P>Estimated battery life: 2,250 hours, or approximately 94 days.</P>
        <P>
          The biggest takeaway? Reducing awake time can significantly extend battery life. For Arduino, ESP32, and other low-power projects,
          optimizing how long your device stays awake is often the best place to start.
        </P>
      </Card>

      <Card title="What Is the Relationship Between Battery Life and Charge?">
        <P>People use “battery life” for two related ideas, and charge affects both.</P>
        <P>
          The first is how long one charge lasts. That’s a direct relationship: more stored charge means more runtime at the same load. A battery at
          50 percent has half the runtime of a full one, which is why the calculator starts from capacity.
        </P>
        <P>
          The second is how many years the battery stays useful, and here the way you charge matters. Lithium-ion batteries wear faster when they
          are held at 100 percent or drained to 0 percent for long periods. Shallow cycles, such as running between roughly 20 and 80 percent, put
          less stress on the cell than full swings. Battery University explains this in its guide to{" "}
          <Ext href="https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries">prolonging lithium-based batteries</Ext>.
          This is also the reasoning behind the discharge safety setting. Keeping a reserve protects the battery’s long-term capacity.
        </P>
      </Card>

      <Card title="What This Battery Life Calculator Does">
        <P>
          This tool estimates how long a battery will run a device based on three things: the battery’s capacity, a discharge safety percentage,
          and the device’s load.
        </P>
        <P>
          You can choose how to describe the load. If you know the device’s current draw, enter it in microamperes, milliamperes, or amperes. If you
          know its wattage rating instead, switch to the wattage option. Battery capacity can be entered in milliampere-hours (mAh) or
          ampere-hours (Ah).
        </P>
        <P>
          You can also pick between two modes. “No sleep mode” is for devices that draw about the same power the whole time, like a flashlight or a
          fan. “Awake/sleep modes” is for devices that spend most of their time idle and wake up briefly, like sensors, trackers, and
          microcontroller projects.
        </P>
        <P>
          The result shows the battery life in hours and in days. It also shows the usable capacity and the device current draw it used, so you
          can see exactly what the answer is based on. For example, a 5,000 mAh battery with a 20 percent discharge safety setting and a 34 mA load
          gives a usable capacity of 4,000 mAh and a runtime of about 117.65 hours, or just under 5 days.
        </P>
      </Card>

      <Card title="Why Does Completely Depleting a Tesla’s Battery Destroy It?">
        <P>
          A large electric car battery is a good example of why the discharge safety setting exists. Every lithium-ion cell has a minimum safe
          voltage. If a cell is pushed below it, the chemistry inside starts to break down. Copper from the cell’s internal parts can dissolve and
          later deposit as tiny metal growths, which can cause internal short circuits. Once that happens, the damage is permanent, and a cell that
          has gone too low may not be safe to charge again.
        </P>
        <P>
          Car makers build in a hidden buffer, so 0 percent on the dashboard is not truly empty. The problem is that a parked car keeps drawing
          power for its computers, security system, and sensors. A car left at 0 percent for days can slowly slide past the safe floor. For that
          reason, Tesla’s guidance is to avoid letting the battery reach 0 percent and to plug in when the charge gets low, especially before
          leaving the car parked for a long time. Check your owner’s manual for the exact wording for your model.
        </P>
        <P>
          The same principle applies to any battery you plug into the calculator. Treat the rated capacity as a ceiling, not as energy you can
          safely spend down to the last drop.
        </P>
      </Card>

      <Card title="What Are the Effects of an Overcharged or Discharged Lead-Acid Battery?">
        <P>Lead-acid batteries are common in cars, UPS units, boats, RVs, and solar storage, and they are sensitive at both ends of the charge range.</P>
        <Lead lead="Over-discharge.">
          When a lead-acid battery is drained very low, lead sulfate forms on the plates. If the battery then sits discharged, that sulfate hardens
          into crystals that are difficult to reverse. This is called sulfation, and it permanently cuts capacity. Repeated deep discharges also
          shorten the battery’s cycle life. Starting batteries in cars are meant for short, high-current bursts, not deep draining. Deep-cycle
          batteries handle it better, but a 50 percent discharge safety setting is still a common, sensible choice.
        </Lead>
        <Lead lead="Overcharging.">
          Too much voltage for too long splits the water in the electrolyte into hydrogen and oxygen, which is called gassing. In flooded batteries,
          this dries out the cells. It also corrodes the internal plates and generates heat. Sealed batteries can swell or vent when overcharged.
        </Lead>
        <Lead lead="Safety.">
          The hydrogen released is flammable, so charge lead-acid batteries in a ventilated area, away from sparks and open flames. The electrolyte
          is sulfuric acid, so wear eye protection and gloves when handling a flooded battery.
        </Lead>
        <P>
          In the calculator, a higher discharge safety percentage is the simplest way to account for this. A 100 Ah lead-acid battery with 50
          percent discharge safety has 50 Ah usable, and a 5 A load would run about 10 hours.
        </P>
      </Card>

      <Card title="LiFePO4 vs. LiPo: Charging, Discharging, and Safety">
        <P>Both are lithium-based, but they behave differently, and that changes the discharge safety value you should pick.</P>
        <List items={[
          ["Voltage:", "A LiPo cell has a nominal voltage of 3.7 V and charges to 4.2 V. A LiFePO4 cell has a nominal 3.2 V and charges to about 3.65 V. Use a charger made for the specific chemistry, because the wrong one can overcharge the cell."],
          ["Safety:", "LiFePO4 is more thermally stable and less likely to overheat or catch fire. LiPo packs can swell, vent, or burn if they are overcharged, punctured, or shorted."],
          ["Cycle life:", "LiFePO4 batteries often last for thousands of cycles, while LiPo packs usually last a few hundred. That makes LiFePO4 popular for solar storage, RVs, and trolling motors."],
          ["Energy and weight:", "LiPo packs store more energy for their weight and can deliver very high currents, which is why drones and RC vehicles use them. LiFePO4 is heavier for the same capacity."],
          ["Discharge depth:", "LiFePO4 generally tolerates deeper discharges than LiPo, so users often plan on using most of the capacity. Check the manufacturer’s recommendation before setting a very low safety margin."],
          ["Voltage curve:", "LiFePO4 holds a nearly flat voltage for most of the discharge and then drops quickly at the end. That makes a battery meter harder to read and makes a calculated runtime more useful."],
        ]} />
        <P>
          For a LiPo drone pack, a 20 percent discharge safety setting is a reasonable start. For a LiFePO4 battery, you may be able to use a lower
          value if the manufacturer says so.
        </P>
      </Card>

      <Card title="Safety Precautions for Charging, Storing, and Discharging LiPo Batteries">
        <P>LiPo batteries are powerful and unforgiving. These habits cover the basics.</P>
        <H3>Charging</H3>
        <List items={[
          ["", "Use a balance charger set to the correct chemistry and cell count."],
          ["", "Charge at or below the pack’s rated charge rate, commonly 1C, unless the manufacturer says otherwise."],
          ["", "Never leave a charging pack unattended, and charge it on a non-flammable surface or in a fire-resistant LiPo bag."],
          ["", "Don’t charge a pack that is swollen, punctured, hot, or damaged."],
        ]} />
        <H3>Storing</H3>
        <List items={[
          ["", "Store packs at about 3.8 V per cell, roughly 40 to 60 percent charge, rather than full or empty."],
          ["", "Keep them in a cool, dry place away from flammable materials. A fire-resistant container is a good idea."],
          ["", "Don’t leave packs fully charged for more than a few days."],
        ]} />
        <H3>Discharging</H3>
        <List items={[
          ["", "Avoid draining a cell below about 3.3 V under load, and never let it fall to 3.0 V. Many pilots set an alarm around 3.5 V per cell."],
          ["", "Use a low-voltage cutoff or alarm, and land or stop when the pack hits your reserve. The calculator’s discharge safety setting helps you plan for that point."],
          ["", "Let a pack cool before charging it after heavy use."],
          ["", "Stop using any pack that puffs up, smells odd, or gets very hot."],
        ]} />
      </Card>

      <Card title="Safety Tips for Lithium-Ion Batteries at High Charge and Discharge Rates">
        <P>High loads make batteries hot, and heat is the main enemy of lithium-ion cells.</P>
        <List items={[
          ["Respect the current rating.", "Every cell has a maximum continuous discharge current, often given as a C-rate. A 2,000 mAh pack rated for 20C can deliver up to 40 A. Staying well below the limit keeps the cell cooler and longer-lived. Be skeptical of unusually high ratings on unbranded cells."],
          ["Match the wires and connectors.", "Thin wires or poor connectors get hot at high current. Use parts rated above your peak draw."],
          ["Use protection.", "Batteries with a built-in protection circuit or battery management system guard against over-discharge, overcharge, and short circuits. Add a fuse in high-current builds."],
          ["Watch the temperature.", "If a battery is too hot to hold comfortably, stop and let it cool. Allow airflow around it."],
          ["Don’t mix or damage cells.", "Avoid combining cells of different ages, brands, or charge levels, and retire any cell with dents, swelling, or torn wrap."],
          ["Expect less runtime.", "High discharge rates reduce the capacity a battery actually delivers. If your load is near the cell’s limit, treat the calculator’s result as an upper bound and raise the discharge safety setting."],
        ]} />
      </Card>

      <Card title="Does a Larger Phone Battery Mean a Longer Battery Life?">
        <P>
          Not always. Capacity is only half the equation. Runtime depends on capacity divided by consumption, so a larger battery in a power-hungry
          phone can lose to a smaller battery in an efficient one.
        </P>
        <P>
          Compare two phones with 20 percent discharge safety. Phone A has a 5,000 mAh battery and averages 250 mA, so 4,000 mAh ÷ 250 mA gives 16
          hours. Phone B has a 4,000 mAh battery and averages 150 mA, so 3,200 ÷ 150 gives about 21 hours. Phone B wins despite the smaller
          battery. Screen size, refresh rate, processor efficiency, and software all change the average draw. If you can estimate or measure each
          phone’s consumption, the calculator makes this kind of comparison easy.
        </P>
        <H3>How Long Does an iPhone’s Battery Last?</H3>
        <P>
          It depends on the model, the age of the battery, and how you use the phone. Apple publishes runtime figures for each model, such as hours
          of video playback, but those come from controlled tests. Real use, with a mix of calls, apps, maps, and a screen that is on for long
          stretches, is usually different.
        </P>
        <P>
          For a rough idea of your own phone, find your average consumption. If a phone has about 3,000 mAh of capacity and averages 200 mA in
          mixed use, then with 20 percent safety, 2,400 ÷ 200 gives about 12 hours. Your numbers will differ, but the method works for any phone.
          Over time, battery aging lowers the capacity you plug into the formula, so the same phone lasts less on a charge after a couple of years.
          Apple’s <Ext href="https://www.apple.com/batteries/maximizing-performance/">battery page</Ext> explains how its devices handle this.
        </P>
      </Card>

      <Card title="When You Would Need a Battery Runtime Calculator">
        <List items={[
          ["Electronics and IoT projects:", "choosing between a coin cell, AA pack, or LiPo for a sensor, data logger, or wearable prototype."],
          ["Backup power:", "estimating how long a small UPS, router backup, or 12V battery will keep equipment running in an outage."],
          ["Camping, travel, and field work:", "checking whether a power bank can charge a phone twice or run a portable fridge or light overnight."],
          ["Solar and off-grid setups:", "sizing storage so loads survive nights and cloudy days."],
          ["Drones, RC vehicles, and e-bikes:", "planning flight or ride time against pack capacity and average power."],
          ["Security cameras and trackers:", "predicting when to replace batteries before they fail."],
          ["Buying decisions:", "comparing two batteries by the runtime each delivers for your actual load."],
        ]} />
      </Card>

      <Card title="Does Cold Decrease Battery Life?">
        <P>
          Yes. Cold slows the chemical reactions inside a battery and raises its internal <Link to="/tools/resistor-calculator" className="inline-home-link">resistance</Link>, so it can deliver less usable energy. A phone
          that shows 40 percent in freezing weather may shut off suddenly, then work again after it warms up. The capacity is usually still there,
          but it is temporarily out of reach. Apple recommends keeping iPhones in an ambient temperature range of about 62° to 72°F (16° to 22°C),
          and heat is worse than cold for long-term battery health.
        </P>
        <P>
          If you will use a battery outdoors in cold weather, raise the discharge safety setting in the calculator, or plan on a larger battery.
          Keeping the device inside a coat pocket can also help.
        </P>
      </Card>

      <Card title="Why Real-World Battery Life Differs From the Estimate">
        <P>Cold isn’t the only reason. A calculator gives an idealized figure, and a few other factors usually push actual runtime lower:</P>
        <List items={[
          ["High discharge rates.", "Drawing current quickly can reduce delivered capacity, a behavior tied to the Peukert effect in lead-acid batteries."],
          ["Battery age.", "A battery with hundreds of cycles may deliver only 70 to 80 percent of its original rating."],
          ["Self-discharge.", "All batteries lose some charge on their own, which matters for devices meant to run for months on one cell."],
          ["Conversion losses.", "Boost converters, inverters, and USB output stages waste some energy, often 10 to 20 percent or more."],
          ["Variable load.", "Screens, radios, motors, and processors rarely draw perfectly steady current."],
        ]} />
        <P>
          The most practical fix is to run the calculation with a conservative discharge safety setting, then measure real consumption with a
          multimeter or power meter if accuracy matters. Replacing an estimated load with a measured one is the biggest accuracy improvement you can
          make.
        </P>
      </Card>

      <Card title="Does Charging a Phone Slowly Affect Battery Life? Does Fast Charging Reduce It?">
        <P>Neither changes how long a charge lasts in the short term. The effect is on long-term battery health, and the main factor is heat.</P>
        <P>
          Fast charging pushes more current into the cell and generates more heat, especially when the battery is already close to full. Heat and
          high voltage speed up aging. That said, modern phones manage this with charging curves that slow down as the battery fills, so
          occasional fast charging does little harm. Slow charging is generally gentler on the cell, but the difference over a normal phone
          lifespan is usually modest.
        </P>
        <P>A few habits matter more than the charging speed:</P>
        <List items={[
          ["", "Avoid charging under a pillow or in a hot car."],
          ["", "Take off a thick case if the phone gets warm while charging."],
          ["", "Use a reputable charger and cable."],
          ["", "Turn on any optimized or limited-charging feature your phone offers."],
        ]} />
      </Card>

      <Card title="If a Laptop Is Always Plugged In, What Is the Effect on the Battery?">
        <P>
          Most modern laptops stop charging at 100 percent and run from the adapter, so the battery isn’t being “overcharged.” The real issue is that
          a lithium-ion battery sitting at full charge, especially when the laptop runs warm, ages faster than one kept at a middle level.
        </P>
        <P>
          If your laptop is a desktop replacement, check for a charge limit setting in the manufacturer’s power software and cap it around 80
          percent. If you travel with it often and need the full runtime, charge it normally. Either way, a worn battery means a smaller capacity
          value for the calculator.
        </P>
      </Card>

      <Card title="Does an SSD Improve Battery Life?">
        <P>
          Slightly. SSDs have no moving parts and usually draw less power than spinning hard drives, particularly when the drive is active. They
          also finish tasks faster, so the system can return to idle sooner.
        </P>
        <P>
          The screen, processor, and wireless radios use much more power than storage, though. Replacing a hard drive with an SSD often adds only a
          modest amount of runtime. The change is easier to see on older laptops with traditional drives.
        </P>
      </Card>

      <Card title="What Are Some Ways to Increase Smartphone Battery Life?">
        <P>Because runtime is capacity divided by consumption, the most effective moves lower the average draw:</P>
        <List items={[
          ["Lower the screen’s power use.", "Reduce brightness, turn on auto-brightness, shorten the screen timeout, and use dark mode on OLED displays."],
          ["Reduce refresh rate.", "A 60 Hz setting uses less power than 120 Hz."],
          ["Limit background activity.", "Restrict apps that constantly refresh, sync, or use location."],
          ["Mind your signal.", "In weak coverage, the cellular radio works harder and drains the battery quickly. Wi-Fi uses less power, and airplane mode helps when there is no service."],
          ["Use the built-in battery saver.", "It trims background work and visual effects."],
          ["Keep software updated.", "Updates often fix battery drain bugs."],
        ]} />
        <H3>How Do I Get Better Battery Life From My iPhone?</H3>
        <P>
          Open Settings &gt; Battery to see which apps use the most power and to check Battery Health. Turn on Low Power Mode when you need to
          stretch a charge, and limit Background App Refresh for apps that don’t need it. Also review Location Services, and turn on Optimized
          Battery Charging so the phone doesn’t sit at 100 percent all night.
        </P>
        <H3>What’s the Best Way to Extend Battery Life on My Android Phone?</H3>
        <P>
          Go to Settings &gt; Battery to find heavy users and turn on Battery Saver or Adaptive Battery if your phone has them. Menu names vary by
          manufacturer. Set adaptive brightness, restrict background use for apps you rarely open, and remove apps that drain power without being
          useful.
        </P>
        <H3>Can a Reset to Factory Default Help My Battery Life?</H3>
        <P>
          Sometimes. If a software problem, a runaway app, or corrupted settings is draining the battery, a factory reset can fix it. It is a last
          resort, though. Restart the phone, update the software, and check the battery usage screen first. If you do reset, back up your data
          beforehand. A reset won’t help if the battery itself is worn out, because aging is a hardware issue.
        </P>
      </Card>

      <Card title="What Are the Best Methods to Extend a Laptop’s Battery Life?">
        <List items={[
          ["", "Lower the screen brightness, since the display is often the biggest drain."],
          ["", "Use the operating system’s battery saver or efficiency mode."],
          ["", "Close apps and browser tabs running in the background."],
          ["", "Turn off keyboard backlighting, Bluetooth, and Wi-Fi when you don’t need them."],
          ["", "Unplug USB devices that draw power."],
          ["", "Update the operating system and drivers."],
          ["", <>On Windows, run <code style={codeStyle}>powercfg /batteryreport</code> in a command prompt to see how much capacity the battery has lost.</>],
        ]} />
        <H3>How Can We Improve the Battery Life of Gaming Laptops?</H3>
        <P>
          Gaming laptops can draw 60 to 100 watts or more under load, so they drain fast. As a quick check, an 80 Wh battery with 20 percent
          discharge safety has 64 Wh usable. At a light 15 W workload, that’s about 4.3 hours. At 90 W while gaming, it’s under 45 minutes.
        </P>
        <P>
          To stretch it, switch to integrated graphics for everyday tasks, cap the frame rate, lower the screen refresh rate, use a balanced power
          profile, and plug in for demanding games. Many gaming laptops also reduce performance on battery power to save energy.
        </P>
      </Card>

      <Card title="How Can I Extend the Life of Car Batteries?">
        <P>
          The calculator can also estimate how long a 12V battery will run accessories with the engine off. As covered in the lead-acid section
          above, a 50 percent discharge safety setting is a sensible choice. A 60 Ah battery at 50 percent safety leaves 30 Ah, and a 5 A load would
          run about 6 hours. Standard starting batteries aren’t built for deep discharge, so use this with care.
        </P>
        <P>To extend the life of a car battery:</P>
        <List items={[
          ["", "Take longer drives now and then so the alternator can fully recharge it."],
          ["", "Keep the terminals clean and tight."],
          ["", "Don’t leave lights or accessories on with the engine off."],
          ["", "Park in shade when you can, because heat shortens battery life."],
          ["", "Have the battery and charging system tested once a year."],
        ]} />
      </Card>

      <Card title="How to Get Longer Battery Life in Any Device">
        <P>The same logic applies to every device:</P>
        <List items={[
          ["Cut the average draw.", "Lower the brightness, radio power, or processor speed, and switch off unused parts."],
          ["Sleep more, wake less.", "In duty-cycled designs, shortening the active time gives the largest gains."],
          ["Choose the right chemistry.", "Lithium primary cells suit low-drain, long-life devices, while rechargeable lithium-ion packs suit higher loads. LiFePO4 suits long-life, deep-cycle storage."],
          ["Match capacity to need.", "Use the calculator to find the smallest battery that meets your target with some margin."],
          ["Store and charge sensibly.", "Avoid leaving lithium cells fully drained or fully charged for long periods, and keep them away from extreme heat."],
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
