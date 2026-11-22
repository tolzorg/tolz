import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is a BAC calculator?",
    a: "It gives an estimate based on averages, and real BAC can differ by 0.02% or more depending on metabolism, food, medication and how precisely you enter your drinks. Only a breath or blood test gives a true reading.",
  },
  {
    q: "Is BAC blood alcohol concentration or blood alcohol content?",
    a: "Both terms mean the same thing. “Concentration” is the more common technical term, and “content” is widely used in everyday speech.",
  },
  {
    q: "How many drinks does it take to reach 0.08% BAC?",
    a: "Roughly four standard drinks for a 160-pound man or three for a 130-pound woman within an hour or two, before elimination is counted. Results vary widely, so enter your own details in the calculator.",
  },
  {
    q: "How long does it take for BAC to reach 0?",
    a: "On average, the body clears about 0.015% per hour, so a BAC of 0.08% takes a little over five hours. Individual rates range from about 0.010% to 0.020% per hour.",
  },
  {
    q: "What is the legal BAC limit for driving?",
    a: "It is 0.08% in most US states, 0.05% in Utah, 0.04% for commercial drivers and 0.00% to 0.02% for drivers under 21. Other countries range from zero tolerance to 0.08%.",
  },
  {
    q: "Where does the 0.08% limit come from?",
    a: "It comes from crash-risk research in the 1960s onward, which showed risk rising sharply near that level. All US states had adopted it by 2004 after Congress tied highway funding to it.",
  },
  {
    q: "Can I use a blood alcohol calculator to decide if I can drive?",
    a: "No. The result is an estimate, and impairment exists below legal limits. If you have been drinking, use a taxi, rideshare or sober driver.",
  },
  {
    q: "Does eating before drinking lower BAC?",
    a: "Food slows absorption, which lowers and delays your peak. It does not remove alcohol from your body faster, and the same alcohol is still processed over time.",
  },
  {
    q: "Why do women often have a higher BAC than men after the same drinks?",
    a: "On average, women have less body water and a higher proportion of body fat, so the same amount of alcohol is less diluted. Enzyme activity can also differ.",
  },
  {
    q: "Does dehydration raise your BAC?",
    a: "It can. With less water in your body, the same amount of alcohol is more concentrated. Dehydration also makes hangovers worse.",
  },
  {
    q: "What is the highest BAC a person can survive?",
    a: "There is no official record. Cases of survival around 1.4% to 1.5% have been reported, usually in heavy drinkers who received hospital care. For most people, 0.40% to 0.50% can be fatal.",
  },
  {
    q: "Does coffee, water or a cold shower sober you up?",
    a: "No. They may help you feel more awake or hydrated, but only time lowers BAC.",
  },
  {
    q: "How long does alcohol stay in your system?",
    a: "Alcohol leaves the blood at about 0.015% per hour. Some tests detect it longer: urine tests can pick up alcohol metabolites for a day or more, and EtG tests for up to around 80 hours in some cases.",
  },
  {
    q: "Does refusing a breathalyzer raise your BAC?",
    a: "No. Refusing does not change your BAC, but your level may still be rising when you are tested later. In most states, refusing can lead to an automatic license suspension.",
  },
  {
    q: "Is this BAC calculator free to use?",
    a: "Yes, it is free, requires no signup and has no hidden charges.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight quotes and apostrophes.
const straight = (s) => s.replace(/[’]/g, "'").replace(/[“”]/g, '"');

const EFFECT_HEADERS = ["BAC (%)", "Typical behavior", "What is affected"];
const EFFECT_ROWS = [
  ["0.001–0.029", "Appears normal", "Subtle effects that show up only in special tests"],
  ["0.030–0.059", "Relaxed, talkative, mild euphoria, lower inhibition", "Concentration"],
  ["0.060–0.099", "Dulled feelings, less sensitivity to pain, loosened inhibitions", "Reasoning, depth perception, peripheral vision, recovery from glare"],
  ["0.100–0.199", "Loud or overly expressive, possible nausea and vomiting", "Reflexes, reaction time, motor control, speech, balance"],
  ["0.200–0.299", "Nausea, vomiting, mood swings, confusion", "Severe motor impairment, memory blackouts, loss of consciousness"],
  ["0.300–0.399", "Stupor, drifting in and out of consciousness", "Breathing, heart rate, balance, bladder control"],
  ["0.400–0.500", "Coma", "Breathing and heart rate; death is possible"],
  ["Above 0.50", "Very high chance of death", "Vital functions"],
];
const STATE_HEADERS = ["Location", "Standard drivers", "Commercial drivers", "Under 21"];
const STATE_ROWS = [
  ["Most US states", "0.08%", "0.04%", "0.00%–0.02%"],
  ["Utah", "0.05%", "0.04%", "Zero tolerance"],
  ["Nevada (including Las Vegas)", "0.08%", "0.04%", "0.02%"],
  ["Florida", "0.08%", "0.04%", "0.02%"],
  ["Minnesota", "0.08%", "0.04%", "Zero tolerance"],
];
const WORLD_HEADERS = ["Country", "Typical limit for regular drivers"];
const WORLD_ROWS = [
  ["United States", "0.08% (0.05% in Utah)"],
  ["Canada", "0.08% criminal limit; most provinces add penalties starting at 0.05%"],
  ["England, Wales, Northern Ireland", "0.08%"],
  ["Scotland, Germany, France, Australia", "0.05%"],
  ["Japan, India", "0.03%"],
  ["Sweden", "0.02%"],
  ["Brazil, Czech Republic", "Zero tolerance"],
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

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows, minWidth = 360 }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth }}>
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

export default function BacCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
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

      <Card title="What Is Blood Alcohol Concentration (BAC)?">
        <P>
          Blood alcohol concentration is the amount of alcohol in your bloodstream, expressed as a percentage. A BAC of 0.08% means there
          are 0.08 grams of alcohol in every 100 milliliters of blood. It is the standard way to measure how intoxicated someone is, and
          it is the number police, doctors and courts use.
        </P>
        <P>
          You will see BAC written two ways: blood alcohol concentration and blood alcohol content. Both mean the same thing.
          “Concentration” is the term most health agencies and law enforcement use, while “content” is common in everyday speech. Some
          countries report the figure in grams per liter or per mille instead of a percentage. A 0.08% BAC equals 0.8 g/L, or 0.8‰.
        </P>
      </Card>

      <Card title="What a BAC Calculator Measures">
        <P>
          A BAC calculator cannot measure alcohol directly the way a breathalyzer or blood test does. It estimates your level from the
          details you enter, using a formula that has been used in alcohol research for nearly a century. Treat the result as an informed
          estimate based on averages. It is useful for seeing how drinks add up, how quickly your level climbs and roughly how long your
          body needs to clear the alcohol.
        </P>
      </Card>

      <Card title="How to Use This BAC Calculator">
        <P>
          Start by choosing your drinks. Pick beer, wine or liquor, or enter a custom drink if you know its size and strength. Set the
          volume and the alcohol by volume (ABV) for each one, then add how many you had. Next, enter your <Link to="/tools/healthy-weight-calculator" className="inline-home-link">body weight</Link> and select your
          gender, since both change how alcohol is distributed in your body. Finally, enter the time since your first drink. The tool then
          returns your estimated BAC, draws a chart of how it rises and falls, and shows the hours left until 0%.
        </P>
        <P>
          For a realistic result, be honest about quantities. Home pours are usually larger than standard measures, and a pint of strong
          craft beer can count as two standard drinks. The more accurately you describe what you drank, the more useful the estimate
          becomes.
        </P>
      </Card>

      <Card title="How to Calculate Blood Alcohol Concentration">
        <P>
          Most blood alcohol calculators rely on the Widmark formula, developed by Swedish scientist Erik Widmark in the 1930s. It compares
          the grams of pure alcohol you consumed with your body weight and a distribution ratio that reflects how much of your body is
          water, because alcohol dissolves in body water rather than fat. Commonly cited ratios are about 0.68 for men and 0.55 for women,
          since men on average carry more lean tissue and less <Link to="/tools/body-fat-calculator" className="inline-home-link">body fat</Link>. The result is then reduced by an elimination rate, usually around
          0.015% per hour, to account for your liver breaking alcohol down.
        </P>
        <P>
          Pure alcohol is the key input. A standard drink in the United States contains about 14 grams of it, which is roughly 12 ounces of
          5% beer, 5 ounces of 12% wine or 1.5 ounces of 40% spirits. That is why a good calculator asks for volume and ABV instead of just
          counting drinks. A 750 ml bottle of wine holds about five standard drinks, and a single large cocktail can contain three.
        </P>
        <P>
          Here is a worked example. A 180-pound man (about 81.6 kg) drinks four standard beers. That is 56 grams of alcohol. Dividing 56 by
          his body weight in grams (81,600) multiplied by 0.68 gives about 0.10%. If that took two hours, subtract about 0.03% for
          elimination (0.015% × 2 hours), and his estimated BAC is roughly 0.07%.
        </P>
      </Card>

      <Card title="Factors That Affect Your Blood Alcohol Concentration">
        <P>
          Weight, gender, amount and time are the four inputs the calculator uses, and they explain most of the difference between people.
          A heavier person has more body water to dilute the same amount of alcohol, so identical drinks produce a lower BAC.
        </P>
        <P>
          Women typically reach a higher BAC than men of the same weight. On average, women have less body water and a higher percentage of
          body fat, so the same amount of alcohol is less diluted. Differences in how the body breaks down alcohol, including enzyme activity
          in the stomach and liver, may add to the gap.
        </P>
        <P>Several factors sit outside any online calculator:</P>
        <List items={[
          ["Food:", "Drinking on a full stomach slows absorption, which lowers and delays your peak."],
          ["Pace and drink type:", "Fast drinking raises BAC more sharply than the same drinks spread over hours. Strong spirits and carbonated mixers can speed absorption."],
          ["Dehydration:", "Dehydration does not change how much alcohol you drank, but less water in your body means the same alcohol is more concentrated, so BAC can run somewhat higher. Alcohol also makes you urinate more, which adds to dehydration and makes hangovers worse."],
          ["Health and medication:", "Illness, fatigue, age, genetics, liver health and some medications all affect how efficiently you process alcohol."],
        ]} />
        <P>
          Elimination rates range from roughly 0.010% to 0.020% per hour between individuals. This is why two people with identical stats
          can feel very different, and why the estimate is best read as a range rather than a precise number.
        </P>
      </Card>

      <Card title="BAC Levels and Their Effects">
        <P>Impairment begins well before the legal driving limit. This table shows how behavior and function typically change as BAC rises.</P>
        <DataTable headers={EFFECT_HEADERS} rows={EFFECT_ROWS} minWidth={520} />
        <P>
          If someone is unresponsive, vomiting repeatedly, breathing slowly or has pale or bluish skin after drinking, treat it as an
          emergency and call local emergency services instead of checking a number.
        </P>
        <H3>How Dangerous Is a BAC of 0.30?</H3>
        <P>
          Very. At 0.30%, most people are in a stupor, barely aware of their surroundings and likely to pass out. Alcohol at this level
          suppresses the brain areas that control breathing, heart rate and the gag reflex, so there is a real risk of choking on vomit or
          of breathing stopping. It needs urgent medical attention. At the average elimination rate, it would take about 20 hours to return
          to zero.
        </P>
        <H3>What Is the Highest BAC a Person Can Have and Still Be Coherent?</H3>
        <P>
          There is no clear cutoff. Speech, balance and judgment are usually affected by 0.10%. People with a high tolerance, such as heavy
          long-term drinkers, may seem fairly normal at 0.15% to 0.20% or even higher. That does not mean they are functioning well.
          Reaction time, judgment and coordination are still impaired, and tolerance does nothing to protect against the physical danger of
          high BAC.
        </P>
        <H3>What Is the Highest BAC Ever Recorded?</H3>
        <P>
          No official worldwide record exists. Medical reports and news stories describe people who survived readings around 1.4% to 1.5%,
          usually heavy drinkers with high tolerance who got hospital treatment. Drivers have also been stopped with readings several times
          the legal limit. Figures reported this way are often unverified, so treat them cautiously. For most people, a BAC between 0.40%
          and 0.50% can be fatal.
        </P>
        <H3>Can You Survive a 3% BAC, or Reach 100%?</H3>
        <P>
          No. A 3% BAC would mean far more alcohol in the blood than a living person can hold, and breathing and heart function would stop
          long before. A 100% BAC is not possible at all, because it would mean the blood is nothing but pure alcohol. The numbers in cases
          that make headlines are usually far lower than this.
        </P>
        <H3>How Much Alcohol Is a 400 mg BAC?</H3>
        <P>
          A reading of 400 mg per 100 ml (400 mg/dL) equals 0.40% BAC, which is a life-threatening level. Using the Widmark formula, an
          average 154-pound (70 kg) man would need around 190 grams of pure alcohol, or roughly 13 to 14 standard drinks, absorbed all at
          once to reach it. In real life it takes more, because the body is clearing alcohol the whole time. Do not confuse this with 400 mg
          per liter, which is only 0.04%.
        </P>
      </Card>

      <Card title="Reading the BAC Chart and Time Until 0%">
        <P>
          The chart is the most practical part of this tool. Your BAC rises while alcohol is absorbed, usually peaking 30 to 90 minutes
          after your last drink, later if you ate. After the peak, it falls in a roughly straight line at your elimination rate. At 0.015%
          per hour, a BAC of 0.08% takes a little over five hours to clear, and 0.15% takes about ten.
        </P>
        <P>
          Nothing speeds this up. Coffee, cold showers, fresh air and sports drinks may make you feel more alert, but they do not change how
          fast your liver works. Reaching 0.00% also does not always mean you feel normal, because poor <Link to="/tools/sleep-calculator" className="inline-home-link">sleep</Link> and hangover effects can
          linger after alcohol has left your blood.
        </P>
      </Card>

      <Card title="What Is the Legal BAC Limit for Driving?">
        <P>
          In every US state, drivers 21 and older are over the legal limit at 0.08% BAC, with one exception: Utah, which lowered its limit to
          0.05% in 2018. Commercial drivers face 0.04%. Drivers under 21 fall under zero-tolerance laws, which set limits between 0.00% and
          0.02% depending on the state.
        </P>
        <P>
          You can also be charged with DUI below 0.08% if an officer can show that alcohol impaired your driving. Many states add harsher
          penalties at higher levels, often around 0.15% to 0.20%.
        </P>
        <H3>Where Does 0.08% Come From?</H3>
        <P>
          The number grew out of research on crash risk. Studies from the 1960s, including the well-known Grand Rapids study, found that the
          likelihood of a crash climbs steeply as BAC rises into the 0.08% range and above. States adopted 0.08% one at a time, and in 2000
          Congress tied highway funding to it, so all states had a 0.08% law by 2004. Safety groups continue to argue for 0.05%, noting that
          driving skills are already weaker at that level. Opponents say it would mainly affect moderate social drinkers instead of the
          high-BAC drivers behind most fatal crashes. Because each state sets its own DUI laws, change has been slow.
        </P>
        <H3>Why Do Legal Limits Differ by State?</H3>
        <P>
          DUI laws are written at the state level, so states are free to choose their own limits and penalties. Counties and cities do not
          set separate BAC limits, although local enforcement and court practices can vary.
        </P>
        <DataTable headers={STATE_HEADERS} rows={STATE_ROWS} minWidth={460} />
        <P>
          Minnesota doubles up on penalties at 0.16%, and Florida adds enhanced penalties at 0.15%. Yellowstone National Park lies mostly in
          Wyoming and also reaches into Montana and Idaho. Federal rules apply a 0.08% limit in national parks. Laws change, so check your
          state’s current rules.
        </P>
        <H3>Legal BAC Limits Around the World</H3>
        <P>Many countries set limits well below the US standard.</P>
        <DataTable headers={WORLD_HEADERS} rows={WORLD_ROWS} />
        <P>Morocco also enforces a very low limit, around 0.02%. New and young drivers often face stricter rules than the numbers above.</P>
        <H3>What If You Refuse a Breathalyzer?</H3>
        <P>
          Refusing a breathalyzer does not raise your BAC. The idea comes from the fact that your level can still be climbing after you stop
          drinking, so a test taken later could show a higher number than one taken at the roadside. In most US states, drivers have given
          implied consent to testing as a condition of licensing, so refusing usually leads to an automatic license suspension and sometimes
          other penalties. Police may also seek a warrant for a blood test. Laws vary by state, so if you face this situation, speak with a
          licensed attorney.
        </P>
        <H3>Is There a BAC Equivalent for Marijuana?</H3>
        <P>
          No. THC does not behave like alcohol in the body, and blood THC levels do not line up well with how impaired someone is. A heavy
          user may test high while sober, and an occasional user may feel impaired at a low level. States handle it differently: some set a
          per se limit (5 ng/mL of THC in blood in Washington, for example), some have zero-tolerance rules, and others rely on proof of
          impairment.
        </P>
        <H3>Does Alcohol Affect Your Ability to Drive?</H3>
        <P>
          Yes, and the effect begins at low levels. Alcohol slows reaction time, narrows vision, weakens coordination and makes it harder to
          judge speed and distance or to split attention between tasks. At the same time, it lowers inhibition, so people take more risks.
          The National Highway Traffic Safety Administration reports that{" "}
          <Ext href="https://www.nhtsa.gov/risky-driving/drunk-driving">alcohol-impaired driving kills roughly 13,000 people in the US each year</Ext>.
        </P>
        <P>
          Prevention works best before the first drink. Plan a ride, name a sober driver or book a rideshare. Sobriety checkpoints and
          ignition interlock devices, which stop a car from starting if the driver’s breath alcohol is above a set level, also help reduce
          drunk driving.
        </P>
      </Card>

      <Card title="Alcohol, Blood Pressure and Long-Term Health">
        <P>
          BAC measures a moment in time, but how much and how often you drink matters for your health too. Regular heavy drinking is linked
          to high blood pressure, and cutting back often lowers it. Over time, alcohol raises the risk of liver disease, several cancers,
          heart muscle damage, stroke and brain damage, and it is a leading contributor to accidental injury.
        </P>
        <P>
          The <Ext href="https://www.niaaa.nih.gov/">National Institute on Alcohol Abuse and Alcoholism</Ext> defines heavy drinking as more
          than three drinks on any day or seven per week for women, and more than four drinks on any day or 14 per week for men. Past a
          certain point, drinking also carries a risk of alcohol use disorder. Some older studies suggested a small heart benefit from light
          drinking, but those findings are disputed, and most experts now say nobody should start drinking for health reasons. If you drink,
          talk with your doctor about what is safe for you.
        </P>
      </Card>

      <Card title="When You Might Need a BAC Calculator">
        <P>
          Planning ahead is the most useful scenario. Before a wedding, party or night out, you can enter the drinks you expect to have and
          see how quickly your level would climb. That helps you set a limit and arrange a ride home before the first round. Hosts use a BAC
          calculator for similar reasons, to understand roughly how much guests may have consumed over an evening.
        </P>
        <P>
          It is just as helpful afterward. If you drank the night before, the estimate shows how many hours alcohol may still be in your
          system, which matters before work, a morning drive or a medication that interacts with alcohol. Students and health educators use
          it to show how weight, sex and pacing change outcomes, and people tracking their intake use it to see what “a few drinks” really
          adds up to. In every case, the goal is awareness and safer decisions.
        </P>
      </Card>

      <Card title="How Accurate Is a BAC Calculator?">
        <P>
          A BAC calculator gives a population-based estimate, so real values can differ by 0.02% or more in either direction. Accuracy
          depends on honest input: unmeasured pours, mislabeled ABV, forgotten drinks and a wrong start time all affect the output.
          Breathalyzers and blood tests measure actual alcohol and are far more reliable, and only certified testing has legal standing. Use
          the estimate to understand trends and timing, never as proof of sobriety. If you have been drinking, the safe choice is not to
          drive.
        </P>
      </Card>

      <Card title="Free, Private and Simple to Use">
        <P>
          This calculator is free, with no signup and no hidden charges, so you can run as many scenarios as you like. You are not asked for
          your name or email. The details you enter, such as weight, gender and drinks, are used only to produce your estimate.
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
