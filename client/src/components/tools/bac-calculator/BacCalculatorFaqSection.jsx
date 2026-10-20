import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is BAC calculated?",
    a: "With the Widmark formula: BAC = 5.24 × alcohol (US fluid ounces) ÷ (body weight in pounds × r) − 0.015 × hours since the first drink, where r is 0.73 for men and 0.66 for women (women usually have less body water for alcohol to spread into). The alcohol is each drink's size times its alcohol by volume (ABV).",
  },
  {
    q: "How long does it take to get back to 0%?",
    a: "The body removes alcohol at a roughly constant rate of about 0.015% BAC per hour, so the calculator divides your current BAC by 0.015 and rounds up. Coffee, cold showers or food do not speed this up.",
  },
  {
    q: "Is it safe to drive if I'm under 0.08%?",
    a: "Not necessarily. 0.08% is the legal limit for drivers 21 and over in most of the US, but impairment starts well below it, limits for younger drivers are 0.01-0.05%, and many countries set lower limits. This is only an estimate: never drive after drinking.",
  },
  {
    q: "Why might my real BAC differ from the estimate?",
    a: "Food in the stomach, how fast you drank, medications, health conditions, body composition and individual metabolism all change how alcohol is absorbed and removed. The formula assumes all the alcohol was absorbed at once.",
  },
  {
    q: "What counts as one drink?",
    a: "In the US, a standard drink is about 12 fl oz of 5% beer, 5 fl oz of 12% wine or 1.5 fl oz of 40% spirits, each containing about 0.6 fl oz of pure alcohol. Use the Other row for any drink by size and ABV.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const EFFECTS = [
  ["0.001–0.029", ["Average individual appears normal"], ["Subtle effects that can be detected with special tests"]],
  ["0.030–0.059", ["Mild euphoria", "Relaxation", "Joyousness", "Talkativeness", "Decreased inhibition"], ["Concentration"]],
  ["0.060–0.099", ["Blunted feelings", "Reduced sensitivity to pain", "Euphoria", "Disinhibition", "Extraversion"], ["Reasoning", "Depth perception", "Peripheral vision", "Glare recovery"]],
  ["0.100–0.199", ["Over-expression", "Boisterousness", "Possibility of nausea and vomiting"], ["Reflexes", "Reaction time", "Gross motor control", "Staggering", "Slurred speech", "Temporary erectile dysfunction"]],
  ["0.200–0.299", ["Nausea", "Vomiting", "Emotional swings", "Anger or sadness", "Partial loss of understanding", "Impaired sensations", "Decreased libido", "Possibility of stupor"], ["Severe motor impairment", "Loss of consciousness", "Memory blackout"]],
  ["0.300–0.399", ["Stupor", "Central nervous system depression", "Loss of understanding", "Lapses in and out of consciousness", "Low possibility of death"], ["Bladder function", "Breathing", "Dysequilibrium", "Heart rate"]],
  ["0.400–0.500", ["Severe central nervous system depression", "Coma", "Possibility of death"], ["Breathing", "Heart rate", "Positional alcohol nystagmus"]],
  [">0.50", ["High possibility of death"], []],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 10px", paddingLeft: 20 };
const cellList = { margin: 0, paddingLeft: 16 };
const cardStyle = { padding: "20px 20px" };

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
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Blood Alcohol Concentration?</h2>
        <p style={pStyle}>
          Blood alcohol concentration (BAC) is a commonly used measure of alcohol intoxication (drunkenness). It is usually expressed as a
          percentage of alcohol per volume of blood: in the United States, a BAC of 0.08% means 0.08 grams of alcohol per 100 mL of blood.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the US, the legal BAC limit for driving is 0.08%. Drivers over 21 (the legal drinking age) with a BAC of 0.08% or more can face
          penalties. Penalties for drivers under 21 are stricter and vary by state, with legal limits from 0.01% to 0.05%.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Alcohol and Health</h2>
        <p style={pStyle}>
          Alcohol has short-term effects, such as dehydration and intoxication, and long-term effects, such as changes in the metabolism of the
          liver and brain. Drinking can also lead to alcoholism, generally described as alcohol use that causes mental or physical health
          problems.
        </p>
        <p style={pStyle}>
          Some studies support the idea that a glass of red wine a day may have health benefits, but these claims have not been rigorously
          proven, and any benefits come with risks. More recent studies recommend not drinking for potential health benefits. Light to moderate
          drinkers (about 1 drink a day: 12 fl oz of beer, 5 fl oz of wine or 1.5 fl oz of spirits) can stay healthy and may see some benefit,
          but it is not known whether that is worth the risks, since the possible benefits are small compared with them.
        </p>
        <p style={{ ...pStyle, marginBottom: 4 }}>Possible benefits of light to moderate drinking include a lower risk of:</p>
        <ul style={listStyle}>
          <li>developing and dying from heart disease</li>
          <li>ischemic stroke</li>
          <li>diabetes</li>
        </ul>
        <p style={pStyle}>
          These are only possible benefits, and even light to moderate drinking can raise the risk of some cancers; driving while intoxicated can
          have severe consequences. Heavy drinking has no health benefits. The Mayo Clinic defines it as more than three drinks a day for women
          and for men over 65, and more than four drinks a day or more than 14 a week for men under 65. Excessive drinking can cause:
        </p>
        <ul style={{ ...listStyle, columns: "2 220px" }}>
          <li>an increased risk of certain cancers</li>
          <li>sudden death from existing cardiovascular disease</li>
          <li>heart muscle damage leading to heart failure</li>
          <li>stroke</li>
          <li>high blood pressure</li>
          <li>liver disease</li>
          <li>accidental serious injury or death</li>
          <li>brain damage</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          No one should start drinking for its possible health benefits. People who already drink lightly or moderately without problems can
          probably continue, as long as they are not at risk of heavy drinking and stay healthy. Most importantly, talk to your doctor about what
          is safe for you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Effects by Blood Alcohol Concentration</h2>
        <p style={pStyle}>
          Impairment depends on BAC, from subtle effects detectable only with special tests at 0.001-0.029%, through problems with concentration,
          reflexes and motor control, to a serious risk of death at 0.50% or more.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 520 }}>
            <thead><tr><th style={{ textAlign: "left" }}>BAC (%)</th><th style={{ textAlign: "left" }}>Behavior</th><th style={{ textAlign: "left" }}>Impairment</th></tr></thead>
            <tbody>
              {EFFECTS.map(([range, behavior, impairment]) => (
                <tr key={range}>
                  <td style={{ whiteSpace: "nowrap", verticalAlign: "top", fontWeight: 700 }}>{range}</td>
                  <td style={{ verticalAlign: "top" }}><ul style={cellList}>{behavior.map((b) => <li key={b}>{b}</li>)}</ul></td>
                  <td style={{ verticalAlign: "top" }}>{impairment.length ? <ul style={cellList}>{impairment.map((b) => <li key={b}>{b}</li>)}</ul> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 style={h3Style}>Disclaimer</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator gives an estimate for education only. It cannot tell you whether you are safe or legal to drive. If you have been
          drinking, don&apos;t drive.
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
