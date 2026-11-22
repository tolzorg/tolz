import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is takt time in simple terms?", a: "It is the time available to produce one unit so that output matches customer demand. If you need to build 100 items in 400 minutes, takt time is 4 minutes per item." },
  { q: "How do you calculate takt time?", a: "Divide net available production time by customer demand for the same period. Net time is the shift length minus breaks and other planned stoppages." },
  { q: "Who invented takt time?", a: "No single person did. The concept comes from German aircraft manufacturing in the 1930s, spread to Japan, and was later built into the Toyota Production System." },
  { q: "What is a good takt time?", a: "There is no universal good number, because takt time depends on demand and working time. The goal is for your cycle time to be equal to or slightly below takt time, so the line meets demand without overproducing." },
  { q: "Does takt time include breaks?", a: "No. Breaks are subtracted first, so the calculation uses only the time workers are actually available to produce." },
  { q: "What is the difference between takt time and cycle time?", a: "Takt time is the pace demand requires, while cycle time is how long a process step actually takes. Cycle time should not exceed takt time." },
  { q: "How is batch takt time different?", a: "Batch takt time is the interval at which a full batch must be started or finished. You find it by multiplying the single-unit takt time by the batch size." },
  { q: "When should I use weekly takt time?", a: "Use it when customers order every day but you produce only on some days, or when daily demand is uneven but weekly volume is steady." },
  { q: "How do I convert takt time into units per hour?", a: "Divide 60 by the takt time in minutes. A takt time of 2 minutes equals 30 units per hour. The calculator shows this as the required pace." },
  { q: "Can takt time be used outside manufacturing?", a: "Yes. Software teams, call centers, laboratories and hospitals use it to match the pace of work to incoming requests." },
  { q: "What if my cycle time is higher than takt time?", a: "You cannot meet demand with the current setup. Your options are adding operators or machines, rebalancing work between stations, reducing waste, or working extra hours." },
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

export default function TaktTimeCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  // The supplied FAQ schema matches the visible FAQ list word for word.
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
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Takt Time? Purpose, History and Formula">
        <H3>What Takt Time Means and Why It Matters</H3>
        <P>
          Takt time is the amount of time you can spend making one unit if you want to meet customer demand exactly. It is also the interval at
          which a new unit, or a new batch, needs to be finished or started.
        </P>
        <P>
          The purpose is to keep production in step with demand. Overproduction ties up cash in inventory, takes up floor space and hides quality
          problems. Underproduction means late orders and unhappy customers. Takt time gives everyone on the floor one number to work toward, so
          the pace is set by what customers want rather than by whatever the machines or people can do at the moment. The{" "}
          <Ext href="https://www.lean.org/lexicon-terms/takt-time">Lean Enterprise Institute</Ext> describes it as the rate of customer demand
          and treats it as a core lean measure.
        </P>
        <P>Takt time is not how long a task actually takes. It is a target, and real performance is measured against it.</P>

        <H3>Who Invented Takt Time?</H3>
        <P>
          No single person invented takt time. The word is German and means beat, pulse or rhythm, the way a conductor’s baton keeps an orchestra
          together. The idea is usually traced to German aircraft manufacturing in the 1930s, where assembly lines were paced to move at a steady,
          scheduled rate. Japanese manufacturers learned the approach through their collaboration with German industry during that period, and
          the concept spread widely in Japan after World War II.
        </P>
        <P>
          Toyota then built takt time into the Toyota Production System, often called Just-in-Time production, and that is how most of the world
          met it. Today it is a standard tool in lean manufacturing. You can read more background on takt time on Wikipedia.
        </P>

        <H3>Takt Time Formula</H3>
        <P>The formula behind any takt time calculator is:</P>
        <Formula>Takt Time = Net Available Production Time ÷ Customer Demand</Formula>
        <P>
          Net available production time is the time your team can truly spend producing. That means the shift length minus planned stoppages
          such as lunch, rest breaks, meetings, setup, cleanup and scheduled maintenance. Customer demand is the number of units required in that
          same period, whether a shift, a day or a week.
        </P>
        <P>For batch production, the formula changes so demand is counted in batches instead of units:</P>
        <Formula>Takt Time per Batch = Net Available Production Time ÷ (Customer Demand ÷ Units per Batch)</Formula>
        <P>
          Two details cause most wrong answers. Both figures must cover the same period, so you cannot divide weekly demand by a single day’s
          hours. And the time must be net, not gross. If you use a full eight hours when the crew really works seven and a half, the takt time
          looks achievable on paper and fails on the floor.
        </P>
      </Card>

      <Card title="Is ASAP a Takt Time?">
        <P>
          No. “As soon as possible” is a wish, not a rate. It has no link to demand, no fixed period and no way to be measured. A takt time, on the
          other hand, is a specific number, such as one unit every 120 seconds, based on how many units customers need and how much time you have.
        </P>
        <P>
          Working “ASAP” usually pushes teams to run as fast as they can, which leads to overproduction, rushed work and uneven workloads. Takt
          time asks a different question: how fast do we need to go, no more and no less? If your calculated takt time turns out to be shorter
          than your process can handle, that tells you where to add capacity or remove waste, which a vague push for speed never does.
        </P>
      </Card>

      <Card title="How to Use the Takt Time Calculator">
        <List ordered items={[
          ["Choose the calculation type.", "Select simple takt time, batch production takt time or weekly takt time, depending on how your work is organized."],
          ["Enter your working time.", "For the weekly option, enter the working days per week and the hours per day. Each time field has a unit selector, so you can enter values in minutes, hours or other units."],
          ["Subtract breaks.", "Enter the lunch break and any other breaks. Use the “other breaks” field for anything that is not direct production, such as shift changes, meetings, setup, cleanup or maintenance."],
          ["Enter demand.", "Add the number of units required for the period you chose. For weekly takt time, this is the weekly demand."],
          ["Click Calculate.", "You will see the takt time, the same value in seconds and in minutes, the required pace in units per hour, and your net production time."],
        ]} />
        <P>If your result is a decimal in minutes, check the seconds figure. A takt time of 1.75 minutes is easier to use on the shop floor as 105 seconds.</P>
      </Card>

      <Card title="Simple, Batch and Weekly Takt Time Explained">
        <Lead lead="Simple takt time">
          applies when units move one at a time. It is the basic formula above and suits assembly lines, packing stations and most discrete
          manufacturing. It answers the question: how often must one unit be completed?
        </Lead>
        <Lead lead="Batch production takt time">
          applies when products move in groups, such as trays, pallets, oven loads or lots. The question becomes: how often must one batch be
          started or finished? The batch takt time equals the single-unit takt time multiplied by the batch size. If takt is 2 minutes per unit and
          you move batches of 10, a batch is due every 20 minutes. Lean practitioners often call this interval pitch, and it is useful for
          scheduling material handlers and replenishment runs.
        </Lead>
        <Lead lead="Weekly takt time">
          fits operations where customers can order every day but production happens only on certain days. Picture a shop that sells handmade
          candles seven days a week but pours and packs them Monday through Friday. A daily calculation would not match reality, because demand
          builds up over seven days and gets produced in five. Dividing the full week’s net working time by the full week’s demand gives a pace
          that fits the actual schedule. It also works well for seasonal products and for plants with uneven shift patterns across the week.
        </Lead>
        <P>The same plant can show different takt times depending on the period used, so pick the type that matches how you plan and release work.</P>
      </Card>

      <Card title="Takt Time Examples, Step by Step">
        <H3>Simple Takt Time Example</H3>
        <P>A workshop operates one 8-hour shift and needs to produce 215 units per shift to meet customer demand.</P>
        <Lead lead="Step 1: Calculate available production time">
        </Lead>
        <List items={[
          ["", "Total shift time: 8 hours × 60 = 480 minutes"],
          ["", "Lunch break: 30 minutes"],
          ["", "Other breaks: 20 minutes"],
          ["", "Total break time: 50 minutes"],
          ["", "Net available production time: 480 − 50 = 430 minutes"],
        ]} />
        <Lead lead="Step 2: Identify customer demand">The customer requires 215 units per shift.</Lead>
        <Lead lead="Step 3: Calculate takt time"></Lead>
        <Formula>Takt Time = Net Available Production Time ÷ Customer Demand = 430 ÷ 215 = 2 minutes per unit (120 seconds)</Formula>
        <P>This means the workshop must complete one unit every 2 minutes to meet customer demand.</P>
        <Lead lead="Step 4: Estimate the number of operators needed">Suppose each unit requires 6 minutes of total hands-on work.</Lead>
        <Formula>Operators Needed = Total Work Content ÷ Takt Time = 6 ÷ 2 = 3 operators</Formula>
        <P>This means approximately 3 operators are needed to meet the required production pace.</P>
        <P>
          Note: This is an initial staffing estimate. Actual staffing may vary depending on task distribution, operator skills, machine
          constraints, and line balancing.
        </P>

        <H3>Batch Production Takt Time</H3>
        <P>
          A kitchen produces frozen meal trays using an oven that holds 20 trays per batch. Daily demand is 800 trays, with 400 minutes of
          available production time.
        </P>
        <List items={[
          ["Batches required:", "800 ÷ 20 = 40 batches"],
          ["Batch takt time:", "400 ÷ 40 = 10 minutes"],
        ]} />
        <P>This means a new batch must start every 10 minutes to meet daily demand.</P>
        <P>
          However, if each batch takes 15 minutes to bake, one oven cannot keep up with the required pace. The kitchen must either add another
          oven, reduce baking time, or extend production hours.
        </P>
        <P>To meet demand with a 15-minute bake cycle, production time would need to increase to 40 × 15 = 600 minutes (10 hours).</P>
        <P>Batch takt time helps identify production capacity gaps before they affect output.</P>

        <H3>Weekly Takt Time</H3>
        <P>
          The candle shop operates 5 days a week, with 7.5 working hours per day. After deducting 30 minutes for lunch and 20 minutes for other
          breaks, the actual production time is 400 minutes per day.
        </P>
        <List items={[
          ["Daily net production time:", "450 − 50 = 400 minutes"],
          ["Weekly net production time:", "400 × 5 = 2,000 minutes"],
          ["Weekly customer demand:", "80 candles"],
        ]} />
        <Formula>Takt Time = Available Production Time ÷ Customer Demand = 2,000 ÷ 80 = 25 minutes per candle</Formula>
        <P>
          This means the team must produce one candle every 25 minutes to meet the weekly demand of 80 candles within five working days.
        </P>
      </Card>

      <Card title="How to Choose the Right Unit: Seconds, Minutes or Hours">
        <P>
          There is no strict rule, but one habit works well: use the unit that gives a number people can picture and use. If the takt time is a
          few minutes or less, seconds are usually clearest, since operators think in seconds on fast assembly work. For a takt time between a few
          minutes and a couple of hours, minutes work well. When it reaches several hours, as in heavy fabrication, custom builds or large
          batches, hours (or hours and minutes) are more natural.
        </P>
        <P>
          So a five-minute takt time is often written as 300 seconds, and a five-hour takt time is better left as 5 hours or 300 minutes than
          broken into seconds, which would give a number like 18,000 that nobody can use. The other point to keep in mind is consistency. Express
          takt time in the same unit as your cycle times so the two can be compared directly. The calculator shows seconds, minutes and units per
          hour together, so you can pick the one that fits.
        </P>
      </Card>

      <Card title="Takt Time in Lean Manufacturing and Line Balancing">
        <P>
          In lean manufacturing, takt time is the starting point for designing flow. It tells you the pace the whole process must follow, and every
          other decision comes from that number.
        </P>
        <P>
          Line balancing is the clearest example. Once you know takt time and the total work content for one unit, you can work out the minimum
          number of stations or operators: divide work content by takt time and round up. Then you divide tasks between stations so that no
          station’s work takes longer than takt time, and so that workloads are as even as possible. A station that takes longer than takt becomes
          the bottleneck, and one that takes far less is sitting idle.
        </P>
        <P>
          Takt time is also a required input in value stream mapping. On a current-state map, you compare each step’s cycle time against takt time
          to see where flow breaks down. Without a correct takt time, the whole analysis rests on a guess.
        </P>
      </Card>

      <Card title="Takt Time in Car Manufacturing">
        <P>
          Car plants show clearly how takt time sets the speed of a moving line. The line is paced so that one vehicle is completed at a steady
          interval, and every station has to finish its work within that interval before the vehicle moves on.
        </P>
        <P>
          Here is a simple, hypothetical case. A plant runs two shifts a day with 450 net minutes each, so 900 net minutes a day. It needs to build
          450 vehicles a day.
        </P>
        <Formula>Takt time = 900 ÷ 450 = 2 minutes per vehicle</Formula>
        <P>
          The line must deliver a finished vehicle every two minutes, a pace of 30 vehicles per hour. If demand rises to 600 vehicles a day, takt
          time drops to 1.5 minutes, and the plant has to speed up the line, add a shift, or rebalance stations. Real plants add detail such as
          multiple models and planned downtime, but the logic is the same: demand and available time set the line speed, not the other way
          around.
        </P>
      </Card>

      <Card title="Using Takt Time in a Service Industry">
        <P>
          Takt time works outside factories whenever work arrives as repeatable requests. Examples include support tickets, lab samples, loan
          applications, insurance claims and patient check-ins.
        </P>
        <P>
          The method is the same. Take the net time your team can spend on the work, then divide by the number of requests expected. If a support
          team has 7 net hours a day, or 420 minutes, and expects 70 tickets, takt time is 6 minutes per ticket. That does not mean every ticket
          must be resolved in six minutes. It means that on average, the team must finish one ticket every six minutes to avoid a growing
          backlog.
        </P>
        <P>
          A few things make services different. The work varies more from one request to the next, demand is less predictable, and some requests
          take much longer than others. Many teams handle this by calculating takt time for each type of work, or by using a weekly figure to
          smooth out daily swings. Compare the result with the average handling time to see whether the team has enough capacity, and recalculate
          whenever staffing or volume changes.
        </P>
      </Card>

      <Card title="Takt Time vs Cycle Time vs Lead Time">
        <P>
          These three terms answer different questions. Takt time is demand-driven: how often a unit needs to be finished. Cycle time is
          process-driven: how long a unit actually takes at a given step. Lead time is customer-driven: the total time from order to delivery,
          including waiting.
        </P>
        <P>
          The comparison that matters most is between takt time and cycle time. When cycle time is at or below takt, you can meet demand. When it
          is above takt, you fall behind unless you add capacity, split the task or remove waste. Ideally, cycle time sits just under takt with a
          small buffer for normal variation.
        </P>
        <H3>What Happens If You Replace Cycle Time With Takt Time?</H3>
        <P>
          The two are not interchangeable, and swapping them causes problems. Cycle time is a measurement of what your process does. Takt time is
          a target based on demand. If you plan around takt time while ignoring cycle time, you assume the process can hit the target without
          checking. A step that actually takes longer than takt then becomes a hidden bottleneck, and the line starves or stops.
        </P>
        <P>
          The reverse mistake is just as costly. If you use cycle time as your pace, you may produce too much when your process is faster than
          demand, or too little when it is slower. Neither number alone is enough. Use takt time to set the pace, and use measured cycle times to
          see how far each step is from it.
        </P>
        <H3>Takt Time vs Cycle Time on Mixed Assembly Lines</H3>
        <P>
          On a mixed-model line, several products share the same stations, and each one has its own work content. Takt time stays a single number
          for the line, calculated from net production time and the combined demand for all models. Cycle time, however, differs by model. A
          basic model may take 90 seconds at a station while a fully equipped one takes 140 seconds.
        </P>
        <P>
          Because of that, you compare takt time with the weighted average cycle time, based on the mix of models you expect. If the average fits
          within takt but one model exceeds it, stations can fall behind when several of those models arrive in a row. Scheduling models in a
          steady, repeating order, known as production leveling, helps avoid that. The calculator gives you the overall takt time from total
          demand. You then compare it with your cycle times by model.
        </P>
      </Card>

      <Card title="When You Need a Takt Time Calculator">
        <List items={[
          ["Setting up a new line.", "You need the target pace before deciding how many stations and operators the line requires."],
          ["Responding to a demand change.", "If an order doubles or volume drops, recalculating shows right away whether line speed, headcount or shifts must change."],
          ["Evaluating overtime or an extra shift.", "Add the extra hours to net time and see how far takt time moves before committing labor costs."],
          ["Value stream mapping.", "Takt time is a required input for comparing process steps."],
          ["Finding bottlenecks.", "Any step with a cycle time above takt time is a constraint, so you know where to focus improvement work."],
          ["Quoting and capacity planning.", "Sales and planning teams can check whether a proposed order fits within available capacity."],
          ["Studying and exams.", "Students of industrial engineering, operations management and Six Sigma can use it to check their answers quickly."],
        ]} />
      </Card>

      <Card title="Common Mistakes When Calculating Takt Time">
        <List items={[
          ["Using gross instead of net time.", "Leaving out breaks, shift handovers, setup or planned maintenance inflates available time and makes takt time look easier than it is."],
          ["Mixing time periods.", "Daily demand with weekly hours, or the reverse, is the most common source of wrong answers."],
          ["Using unchecked forecasts.", "Takt time is only as reliable as the demand figure. Use confirmed orders or a trusted average, not an optimistic target."],
          ["Treating takt time as a speed limit for individuals.", "It is a pace for the whole process. The goal is balanced flow, not pushing each operator to beat a number."],
          ["Never recalculating.", "Demand, staffing and shift patterns change. Revisit takt time whenever they do, and at least quarterly in stable operations."],
          ["Ignoring changeovers and unplanned downtime.", "Planned changeovers and setup belong in the break and non-production time you subtract. Unplanned stops should be tracked separately, because they quietly use up the buffer you thought you had."],
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
