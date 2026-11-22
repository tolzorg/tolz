import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate the electricity cost of an appliance?", a: "Divide its wattage by 1,000 to get kilowatts, multiply by the hours of daily use to get kWh, then multiply by your price per kWh. The calculator does all of this and extends the result to a week, month and year." },
  { q: "How do I convert watts to kWh?", a: "Divide watts by 1,000 and multiply by the hours the device runs. A 500 W device running for 3 hours uses 1.5 kWh." },
  { q: "How much does a kWh of electricity cost?", a: "It is whatever rate your utility charges. In the U.S. the average household rate is around 18 cents per kWh, in the UK it is about 26 pence under the current price cap, and rates in some countries are far lower or higher. Check your bill for your own rate." },
  { q: "Where do I find my price per kWh?", a: "Look on your electricity bill for “unit rate,” “tariff” or “price per unit.” If there is no single rate, divide the total amount by the total units used to get an effective price." },
  { q: "What is the average cost of electricity globally?", a: "The global household average is about $0.18 per kWh as of late 2026, with Europe near $0.26 and Asia near $0.09." },
  { q: "How much does electricity cost per watt?", a: "One watt running all year uses about 8.77 kWh. At 17 cents per kWh, that costs about $1.49 per year." },
  { q: "How much does 1 volt of electricity cost?", a: "Volts alone have no price. Utilities bill for energy in kWh, which depends on watts and time. Watts equal volts times amps." },
  { q: "What does AC electricity cost per month?", a: "It depends on the unit’s watts, hours, capacity and your rate. A 1,200 W unit running 8 hours a day at 70% capacity uses about 205 kWh a month, which costs about $41 at $0.20 per kWh." },
  { q: "How can I calculate the monthly electricity cost of operating my PC?", a: "Estimate your PC’s average draw in watts, multiply by hours per day and by 30.44, divide by 1,000, then multiply by your rate. A desktop averaging 200 W for 8 hours a day uses about 49 kWh a month." },
  { q: "Do power savers actually lower electrical costs?", a: "Generally not. Independent tests have found little or no measurable reduction in kWh. Using less power or running appliances for fewer hours is what actually lowers a bill." },
  { q: "Is solar worth it compared with paying rising electricity rates?", a: "It depends on your rate, sunlight, system cost, incentives and how long you will stay. Use the calculator to find your yearly kWh, then compare the savings with quotes." },
  { q: "Can I use this tool to estimate my whole monthly bill?", a: "Yes. Calculate each major appliance, add the monthly kWh values, and multiply by your rate. Add fixed charges and taxes to compare with your actual bill." },
  { q: "Is this electricity calculator free to use?", a: "Yes, it is free on Tolz with no hidden charges." },
  { q: "How accurate are the results?", a: "The math is exact, but accuracy depends on your inputs. Rated wattage can exceed real draw, and tariffs may be tiered, so treat the output as a close estimate and verify with a plug-in energy meter if you need precision." },
];

// The supplied FAQ schema matches the list above with straight apostrophes and
// without the quotation marks around the bill labels.
const schemaText = (s) => s.replace(/’/g, "'").replace(/[“”]/g, "");

const WATT_HEADERS = ["Appliance", "Typical wattage (W)"];
const WATT_ROWS = [
  ["LED bulb", "3–25"], ["Incandescent bulb", "15–200"], ["Ceiling or table fan", "15–200"], ["Humidifier", "25–350"],
  ["Dehumidifier", "200–750"], ["Portable heater", "750–2,000"],
  ["Window air conditioner", "800–1,800 (1 to 1.5 ton); larger units up to 5,000"], ["Central air conditioner", "2,500–10,000"],
  ["Electric water heater", "3,000–6,600"], ["Refrigerator", "100–1,000 (compressor running)"], ["Microwave", "750–1,500"],
  ["Electric kettle", "1,000–2,000"], ["Coffee maker", "600–1,200"], ["Toaster", "750–1,500"], ["Electric oven or range", "2,000–5,000"],
  ["Dishwasher", "1,200–2,000"], ["Washing machine", "400–1,500"], ["Clothes dryer", "1,800–5,000"], ["Clothes iron", "750–2,000"],
  ["Hair dryer", "750–2,000"], ["Television", "25–500"], ["Laptop", "35–150"], ["Desktop computer", "100–250"],
  ["Phone charger", "5–25"], ["Water pump or motor", "750–2,000"], ["Electric vehicle charger", "1,500–20,000"],
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

export default function ElectricityCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: schemaText(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="Electricity Units Explained: Watts, Kilowatts, kWh, BTU, Horsepower and Tons">
        <P>Appliance labels use different units, so it helps to know how they <Link to="/tools/unit-converter" className="inline-home-link">convert</Link>. The calculator takes watts, so convert anything else first.</P>
        <List items={[
          ["Watt (W):", "the basic unit of power, equal to one joule per second."],
          ["Kilowatt (kW):", "1,000 watts."],
          ["Kilowatt-hour (kWh):", "a unit of energy, equal to one kilowatt used for one hour. This is what you pay for."],
          ["BTU/h:", "a heating or cooling rate. 1 BTU/h is about 0.293 W, and 1 kWh equals about 3,412 BTU. When a label says “12,000 BTU,” it means 12,000 BTU per hour."],
          ["Horsepower (hp):", "used for motors and pumps. One mechanical horsepower is 745.7 W, and one metric horsepower is 735.5 W."],
          ["Ton (of refrigeration):", "a cooling capacity. One ton is about 12,000 BTU/h, or roughly 3,517 W of heat removed."],
        ]} />
        <P>
          Here is the catch with air conditioners. BTU and tons describe how much heat the unit moves, not how much electricity it uses. A 1-ton,
          12,000 BTU/h air conditioner typically draws somewhere around 800 to 1,800 W of electricity, depending on efficiency. Look for the
          electrical input rating in watts or amps, and use that.
        </P>
        <P>
          Motors work the same way. A 1 hp pump motor delivers about 746 W of mechanical output, but it draws a bit more electricity than that
          because no motor is 100% efficient. Check the nameplate for input watts or amps when you can.
        </P>
      </Card>

      <Card title="The Formula Behind kWh and Electricity Cost">
        <P>Here is what the calculator does behind the scenes.</P>
        <Formula>
          Energy (kWh) per day = Power (W) ÷ 1,000 × Capacity (%) × Hours per day<br />
          Cost = Energy (kWh) × Price per kWh
        </Formula>
        <P>Weekly, monthly and yearly figures multiply the daily result by 7, 30.44 and 365.25.</P>
        <Lead lead="Example 1: a space heater.">
          A 1,500 W heater at 100% capacity runs 4 hours a day at $0.15 per kWh. Daily energy is 1.5 × 4 = 6 kWh, which costs $0.90. That is $6.30
          per week, about $27.40 per month and about $328.70 per year.
        </Lead>
        <Lead lead="Example 2: a dehumidifier.">
          A 500 W unit at 90% capacity for 10 hours a day uses 4.5 kWh daily. That is about 137 kWh per month. At $0.17 per kWh, it costs about
          $0.77 per day, $23.30 per month and $279 per year.
        </Lead>
        <Lead lead="Example 3: an air conditioner.">
          A 1,200 W unit running 8 hours a day at $0.20 per kWh uses 9.6 kWh daily if it draws full power the whole time, which comes to about
          $58.40 per month. If the compressor only runs at about 70% capacity, daily use drops to 6.72 kWh and the monthly cost to about $40.90. The
          capacity setting makes that kind of difference visible.
        </Lead>
        <P>To convert watts to kWh by hand, divide watts by 1,000 and multiply by the hours. A 60 W bulb running 5 hours uses 0.3 kWh.</P>
      </Card>

      <Card title="Daily, Weekly, Monthly and Yearly Results Explained">
        <P>Each time frame answers a different question.</P>
        <List items={[
          ["Daily figures", "let you compare appliances on equal terms. Knowing a kettle uses about 0.2 kWh a day while a water heater uses 4 kWh makes priorities obvious."],
          ["Weekly figures", "suit short budget cycles, or devices you only use on certain days, such as a washing machine or a workshop tool."],
          ["Monthly figures", "line up with your bill. If your bill is $180 and the calculator shows your air conditioner at $40, you have found more than a fifth of it in one appliance."],
          ["Yearly figures", "help with buying decisions. When two fans cost about the same but have different wattage, the yearly cost shows which one is cheaper to own."],
        ]} />
        <P>
          Remember that these estimates repeat the same daily use all year. If you run an air conditioner only in summer, your real annual cost will
          be lower than the yearly number shown.
        </P>
      </Card>

      <Card title="Typical Wattage of Common Household Appliances">
        <P>
          If you don’t have the label handy, these ranges give you a starting point. Actual values vary by brand, age and settings. Remember that
          package ratings usually show the maximum, so your real use is often lower.
        </P>
        <DataTable headers={WATT_HEADERS} rows={WATT_ROWS} />
        <P>
          A refrigerator shows why capacity matters. Its compressor cycles on and off, so it doesn’t draw full power for 24 hours. A fridge with a
          150 W compressor that runs about 40% of the time averages roughly 1.4 kWh a day. Entering 24 hours and 40% capacity gives a far more
          realistic result than assuming constant use.
        </P>
      </Card>

      <Card title="Ways to Lower Your Electricity Usage">
        <P>
          Once the calculator shows where energy goes, you can act on it. The biggest savings usually come from a few high-wattage devices, not from
          many small ones.
        </P>
        <List items={[
          ["Track your habits.", "Spend a couple of weeks noticing what runs and when. Turning off lights and devices you aren’t using, using a fan instead of the air conditioner when it’s mild, and washing full loads instead of small ones all add up."],
          ["Switch to LED bulbs.", "A typical incandescent bulb uses about 75 W, while an LED that gives similar light uses about 9 W. LEDs cost more upfront, but they pay for themselves."],
          ["Manage heating and cooling.", "Heating and cooling are often the largest part of a bill. A programmable thermostat helps, and so does manually adjusting the setting during the day. Raising the cooling set point by a degree or two cuts compressor run time without much change in comfort."],
          ["Check your windows and insulation.", "Leaky windows, doors, attics, walls, floors and crawlspaces force heating and cooling systems to work harder. In cold climates, better windows and weatherstripping help hold heat in. In hot climates, curtains, blinds and reflective window film cut the heat coming in."],
          ["Buy efficient appliances.", "Compare wattage and energy ratings, not just price. Use the calculator to put a dollar figure on the yearly difference. A slightly pricier efficient model often pays itself back within a couple of years."],
          ["Cut standby power.", "Televisions, game consoles and chargers draw small amounts even when “off.” A switched power strip stops that steady drain."],
        ]} />
      </Card>

      <Card title="Should You Accept Rising Electricity Costs or Buy Solar Panels?">
        <P>
          There is no single right answer, because it depends on your rate, your sun, your roof, local incentives and how long you will stay in the
          home. The calculator helps with the first step: knowing how much electricity you use.
        </P>
        <List items={[
          ["Step 1: Find your yearly kWh.", "Add up your major appliances using the calculator, or take the total from your bill history. Say it comes to 6,000 kWh a year."],
          ["Step 2: Estimate system size.", "Divide yearly kWh by 365, by your area’s average peak sun hours, and by about 0.8 to account for real-world losses. With 5 sun hours, that is 6,000 ÷ (365 × 5 × 0.8), or about 4.1 kW of panels."],
          ["Step 3: Estimate yearly savings.", "Multiply the kWh the system would offset by your rate. At $0.18 per kWh, offsetting all 6,000 kWh saves about $1,080 a year."],
          ["Step 4: Compare to cost.", "If the installed system costs $12,000 before incentives, simple payback is about 11 years. Incentives, financing, and rising rates change that number."],
        ]} />
        <P>
          Two things can shift the math. First, if your utility credits exported power at less than the retail rate, a solar system is worth less
          per kWh than the simple estimate. Second, if rates keep rising, each kWh you generate becomes more valuable over time. Get several quotes,
          ask about local incentives and export rules, and compare the payback to how long you plan to live there.
        </P>
        <P>Panels are not the only option. Cutting your biggest loads first makes any future system smaller and cheaper.</P>
      </Card>

      <Card title="What Does AC Electricity Cost?">
        <P>
          Air conditioners are usually the most expensive appliance in a warm-climate home, so this is one of the most common reasons people use the
          calculator.
        </P>
        <P>
          The cost depends on four things: the unit’s electrical input in watts, how many hours it runs, how much of that time the compressor is
          actually working, and your rate. Inverter models adjust their speed and often draw much less than their rated power once the room is
          cool. Non-inverter models cycle fully on and off.
        </P>
        <P>
          As a rough guide, a window or 1 to 1.5 ton split unit draws about 800 to 1,800 W while cooling, and a central system can draw anywhere from
          about 2,500 to 10,000 W depending on its size. To estimate your own cost:
        </P>
        <List ordered items={[
          ["", "Enter the unit’s input watts."],
          ["", "Set capacity to the share of time or power you expect (60% to 80% is a common starting point for an inverter unit on a hot day)."],
          ["", "Enter the hours per day and your rate."],
        ]} />
        <P>If you can, compare your estimate with your bill for the same month. A big difference usually means the capacity or hours need adjusting.</P>
      </Card>

      <Card title="How to Calculate the Monthly Electricity Cost of Running a PC">
        <P>
          A PC is a good example of why rated power and real power differ. A power supply labeled 650 W doesn’t draw 650 W. It only delivers what
          the components ask for.
        </P>
        <P>Typical real-world draws are roughly:</P>
        <List items={[
          ["Laptop:", "35 to 90 W"],
          ["Office desktop:", "50 to 150 W"],
          ["Gaming desktop under load:", "250 to 500 W or more"],
        ]} />
        <P>
          For a desktop, add up a realistic average, not the maximum. Say your PC averages 200 W over a workday and runs 8 hours a day. That is 1.6
          kWh daily, or about 48.7 kWh per month. At $0.17 per kWh, that is about $8.30 per month. A laptop averaging 60 W for 8 hours uses about 14.6
          kWh a month and costs about $2.50.
        </P>
        <P>
          In the calculator, you can also enter the power supply’s rating as the power and set capacity to the share you expect, such as 40% for a
          500 W supply that averages 200 W. Add your monitor and speakers as separate entries, since they draw their own power.
        </P>
      </Card>

      <Card title="How Much Does a kWh of Electricity Cost?">
        <P>
          A kilowatt-hour (kWh) is the unit your utility bills you in. One kWh is the energy a 1,000-watt device uses in one hour. The price of a kWh
          is whatever your bill says it is, and it changes a lot by country, state and even time of day.
        </P>
        <P>To make a kWh feel real, here is what one kWh buys:</P>
        <List items={[
          ["", "A 10 W LED bulb for 100 hours"],
          ["", "A 100 W laptop-and-monitor setup for 10 hours"],
          ["", "A 1,500 W space heater for about 40 minutes"],
          ["", "A 1,000 W microwave for one hour"],
        ]} />
        <P>
          So the cost of “a kWh” is your unit rate. At 18 cents per kWh, a kWh costs 18 cents, and a 1,500 W heater costs about 27 cents for each 60
          minutes it runs at full power. The calculator multiplies that rate by your real usage so you don’t have to do the math by hand.
        </P>
      </Card>

      <Card title="Current Electricity Rates by Country (Cost per Unit)">
        <P>
          Your own bill is always the best source for your rate. If you want a starting point, or you are comparing countries, these are recent
          household averages. They include taxes and fees, and they change often, so treat them as ballpark figures.
        </P>
        <List items={[
          ["United States:", "The national residential average was about 18.16 cents per kWh in August 2026. By state, North Dakota has been the lowest at around 11 cents, while Hawaii has been the highest at more than 41 cents."],
          ["Canada:", "Rates vary widely by province, which works out to roughly $83 to $375 per month for a household using 1,000 kWh. That is about 8 to 38 Canadian cents per kWh. Provinces with plentiful hydropower, such as Quebec and Manitoba, tend to be cheapest."],
          ["United Kingdom:", "The price cap from October to December 2026 averages 26.32 pence per kWh for electricity on a standard variable tariff, plus a daily standing charge of 54.83 pence. That means you enter 0.2632 in the calculator for pounds."],
          ["Germany:", "Eurostat reported household prices near €0.36 per kWh in the first half of 2026, among the highest in the EU."],
          ["Italy, Australia, New Zealand, China and Russia:", "GlobalPetrolPrices lists 2023–2026 household averages of about $0.415 per kWh in Italy, $0.259 in Australia, $0.213 in New Zealand, $0.076 in China and $0.070 in Russia."],
        ]} />
        <P>
          For more countries and the latest quarterly updates, see{" "}
          <Ext href="https://www.globalpetrolprices.com/electricity_prices/">GlobalPetrolPrices</Ext>. For U.S. state-by-state figures, the{" "}
          <Ext href="https://www.eia.gov/electricity/monthly/epm_table_grapher.php?+t=epmt_5_3">EIA’s electricity price tables</Ext> are the
          official source.
        </P>
        <P>
          A quick note on the standing charge: many bills include a fixed daily fee on top of the unit rate. The fee doesn’t change when you use one
          more appliance, so enter only the per-kWh rate for appliance estimates.
        </P>
      </Card>

      <Card title="What Is the Average Cost of Electricity Globally?">
        <P>
          As of the third quarter of 2026, the world average for household electricity is about $0.179 per kWh. That single number hides a huge
          spread. Europe is the most expensive region at about $0.26 per kWh, and Asia is the cheapest at about $0.088.
        </P>
        <P>
          The gaps come from a few things: how a country generates power (cheap hydro and coal versus imported gas), how much of the bill is taxes
          and network fees, and whether the government subsidizes household rates. A global average is useful for context, but it is a poor input
          for your own estimate. Use the rate on your bill.
        </P>
      </Card>

      <Card title="How Much Does Electricity Cost per Watt?">
        <P>
          A watt is a rate of power, not an amount of energy, so electricity doesn’t have a price “per watt” by itself. What you can price is a watt
          running over time.
        </P>
        <P>
          One watt running nonstop for a year uses about 8.77 kWh (1 W × 8,766 hours ÷ 1,000). At 17 cents per kWh, that is about $1.49 per year, or
          roughly 12 cents per month, for each watt of constant draw.
        </P>
        <P>
          This is a handy rule of thumb for always-on devices. A router that draws 10 W all the time costs about $15 a year at that rate. A set-top
          box that draws 25 W costs about $37. Multiply the watts by your rate and by 8.77 to get the yearly cost.
        </P>
      </Card>

      <Card title="How Much Does 1 Volt of Electricity Cost?">
        <P>
          Nothing, because volts are not what you pay for. <Link to="/tools/voltage-drop-calculator" className="inline-home-link">Voltage</Link> is the electrical “pressure” pushing current through a wire. Your utility bills
          you for energy in kilowatt-hours, which depends on watts and time.
        </P>
        <P>
          The link between them is: Watts = Volts × Amps. A 120 V outlet delivering 10 A supplies 1,200 W. The same 10 A at 230 V supplies 2,300 W.
          Voltage is one part of the power equation, but you can’t put a price on it alone.
        </P>
        <P>
          The same goes for large numbers. High-voltage power lines run at tens or hundreds of thousands of volts, and a lightning bolt reaches far
          higher, but neither has a “cost per volt.” What matters for cost is how much energy flows over how much time. If your appliance label
          lists volts and amps only, multiply them to get watts and enter that in the calculator.
        </P>
      </Card>

      <Card title="Do “Power Savers” Actually Lower Electrical Costs?">
        <P>
          Plug-in “power saver” or “energy saver” boxes are sold online with claims of 20% to 50% lower bills. In general, they don’t deliver. Most
          contain a small capacitor and a light, and independent tests have generally found little or no measurable drop in the kWh your meter
          records.
        </P>
        <P>
          The reason is simple. Residential meters bill for the real energy your appliances use. A box that plugs into an outlet can’t make your
          fridge or air conditioner need less energy to do the same job.
        </P>
        <P>
          You can test any claim yourself. Plug a basic energy meter in, record usage for a week without the device and a week with it, and compare.
          Better yet, use the calculator to estimate what an appliance should use, and be skeptical of any product promising far more than that.
        </P>
        <P>
          Things that do lower costs are changes that reduce wattage or run time: LED bulbs, efficient appliances, better insulation, smart or
          switched power strips that cut standby draw, and using high-load appliances less.
        </P>
      </Card>

      <Card title="How Are Capacitor Banks Useful in Saving Electricity Costs at Home?">
        <P>
          Capacitor banks correct power factor. Power factor describes how efficiently a load uses the current it pulls from the grid. Motors,
          compressors and transformers cause current to lag, which creates reactive power that does useful work for nobody but still flows through
          the wires.
        </P>
        <P>
          For factories, large commercial buildings and some utility customers, this matters. Many commercial tariffs bill by kVA or add penalties
          for a low power factor, so a capacitor bank can cut the bill by bringing the power factor up toward 1.
        </P>
        <P>
          At home, the story is different. A standard household meter charges for real energy (kWh), and capacitors don’t reduce the real power your
          appliances use. A small capacitor on a house circuit can improve the power factor a little on your side of the meter, but it will not
          noticeably change your bill. This is also the idea behind many of the power saver boxes above.
        </P>
        <P>
          If you run a workshop or small business on a commercial tariff, check your bill for kVA charges or power factor penalties, and ask an
          electrician or your utility whether correction makes sense. For regular household bills, focus on wattage and hours of use. The calculator
          already works in watts, which is real power, so power factor doesn’t affect its results.
        </P>
      </Card>

      <Card title="What This Electricity Calculator Does">
        <P>
          This tool estimates how much energy an appliance uses and what that energy costs. It works for a 9-watt LED bulb and a central air
          conditioner alike, because the math is the same for any device that draws power.
        </P>
        <P>
          You can start with the Typical appliance menu, which gives you a sample appliance to work from, or type in your own numbers. There are four
          inputs:
        </P>
        <List items={[
          ["Appliance power:", "the wattage, in watts (W)."],
          ["Use/run at (% capacity):", "how hard the appliance works on average. A fan on low or a fridge whose compressor cycles on and off rarely draws its full rated power, so you can lower this number to match real use."],
          ["Usage:", "the hours per day the appliance runs."],
          ["Electricity price:", "your cost per kWh."],
        ]} />
        <P>
          After you click Calculate, the result shows the cost per month and a table with energy use (kWh) and cost per day, week, month and year.
          Click Clear to start over.
        </P>
        <P>
          The capacity field matters more than it looks. Rated power on a label is usually the maximum the device can draw. Setting capacity to 60%
          or 70% usually gets you much closer to what you actually pay for.
        </P>
      </Card>

      <Card title="How to Use the Electricity Calculator Step by Step">
        <List ordered items={[
          ["Pick a typical appliance or enter your own.", "If you choose a typical appliance, the power field fills in with a sample value you can change."],
          ["Find the exact wattage.", "Look for a label on the back or bottom of the appliance, or check the manual. It may say W, watts or “power consumption.” If you only see amps and volts, multiply them. A device rated 5 A at 230 V draws about 1,150 W."],
          ["Set the capacity.", "Leave it at 100% for devices that run flat out, such as a kettle or an iron. Lower it for devices that vary, such as air conditioners, fans, fridges, computers and washing machines."],
          ["Enter daily usage.", "Type the hours the appliance runs in a typical day. Use decimals for partial hours, such as 0.5 for thirty minutes."],
          ["Enter your price per kWh.", "Take it from your latest bill, where it may be labeled “unit rate,” “tariff” or “price per unit.” Enter it in your own currency. The tool shows a dollar sign, but the math works the same in any currency, as long as you read the results in that currency."],
          ["Calculate and compare.", "Repeat for each major appliance and compare the results to see where your money goes."],
        ]} />
        <P>
          The calculator assumes an average month has 30.44 days and an average year has 365.25 days. That is why the monthly and yearly figures are
          slightly different from simple “30 × daily” or “365 × daily” math.
        </P>
      </Card>

      <Card title="When and Why You Would Need an Electricity Calculator">
        <P>Most people reach for a power consumption calculator when something about their bill surprises them. These are the situations where it earns its place.</P>
        <List items={[
          ["Investigating a high bill.", "If this month’s bill jumped, estimate your heaviest appliances first: air conditioners, water heaters, irons, electric heaters and washing machines. The numbers usually point to the cause quickly."],
          ["Comparing appliances before buying.", "An efficient inverter air conditioner can cost more upfront than a basic one, but the yearly running cost often closes the gap. Entering both wattages shows the real difference."],
          ["Budgeting for a new home or rental.", "Estimate monthly utility costs from a list of the devices you own, and you will know what to expect before the first bill arrives."],
          ["Running a home office or small business.", "Computers, monitors, printers, routers and lighting add up over long working days. The same applies to a shop, salon or workshop."],
          ["Planning for backup power.", "Before choosing a UPS, inverter or solar setup, you need total consumption. Each device’s daily kWh gives you a realistic load profile."],
          ["Checking always-on devices.", "Fridges, routers, set-top boxes and chargers run continuously. Entering 24 hours shows what they cost across a year."],
          ["Teaching and projects.", "Students and teachers use appliance electricity calculators for energy-efficiency exercises, since the inputs are simple and the results are easy to check."],
        ]} />
      </Card>

      <Card title="How Accurate Is This Electricity Cost Calculator?">
        <P>The calculation is exact: watts, capacity, hours and rate produce a precise result. What varies is the quality of the inputs.</P>
        <List items={[
          ["Rated power versus real power.", "The label shows maximum power. Many devices, including fans, air conditioners, fridges and computers, draw less most of the time. Use the capacity field to account for this."],
          ["Tiered tariffs.", "Some utilities charge more as your consumption rises. Use the rate that applies to your last units, since that is what an extra appliance actually costs you."],
          ["Taxes and fixed charges.", "For the most realistic number, enter an effective rate: your total bill divided by total units used. Leave out standing charges if you only want the cost of one appliance."],
          ["Time-of-use pricing.", "If your rate changes by time of day, enter the average rate for the hours the appliance runs."],
          ["Standby and idle draw.", "Devices that stay plugged in use a small amount when “off.” Add them as a separate entry if you want to include them."],
          ["Voltage and power factor.", "For household estimates these effects are small. Engineers sizing industrial loads should use dedicated electrical design tools."],
        ]} />
        <P>Treat the results as a reliable planning estimate. For exact numbers on a single appliance, a plug-in energy meter measures real consumption directly.</P>
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
