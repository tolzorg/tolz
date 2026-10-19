import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is lean body mass?",
    a: "Lean body mass (LBM) is your total body weight minus your body fat: the combined mass of bones, muscles, organs, blood, skin, water and everything else. It usually makes up about 60-90% of body weight, and men generally have a higher proportion than women.",
  },
  {
    q: "Which lean body mass formula is the most accurate?",
    a: "No single formula is best for everyone, which is why the calculator shows all of them side by side. Boer (1984) is often preferred for adults; James (1976) can give odd results for people with a high body weight for their height; Hume (1966) is the oldest. For children aged 14 or younger, the Peters formula is designed for that age group.",
  },
  {
    q: "Why do I see negative or huge percentages?",
    a: "The formulas are statistical fits for realistic adult heights and weights. With extreme or impossible inputs (for example a height of a few centimeters) they produce meaningless numbers, including negative lean mass or body fat over 100%. Check that the height and weight units are right.",
  },
  {
    q: "How is body fat calculated here?",
    a: "Each row's body fat is simply 100% minus the lean body mass share of your weight. For a direct body fat estimate from tape measurements, use the Body Fat Calculator.",
  },
  {
    q: "Is lean body mass the same as fat-free mass?",
    a: "Not exactly. Lean body mass includes the essential fat inside organs, while fat-free mass excludes all fat. The difference is about 2-3% of body weight for men and 5-12% for women.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const FORMULAS = [
  ["Boer", 1, "0.407W + 0.267H − 19.2", "0.252W + 0.473H − 48.3"],
  ["James", 2, "1.1W − 128(W/H)²", "1.07W − 148(W/H)²"],
  ["Hume", 3, "0.32810W + 0.33929H − 29.5336", "0.29569W + 0.41813H − 43.2933"],
];
const REFERENCES = [
  'Boer P. "Estimated lean body mass as an index for normalization of body fluid volumes in man." Am J Physiol 1984; 247: F632-5.',
  'James W. "Research on obesity: a report of the DHSS/MRC group." HM Stationery Office, 1976.',
  'Hume R. "Prediction of lean body mass from height and weight." J Clin Pathol. 1966 Jul; 19(4): 389-91.',
  'Peters A. M., Snelling H. L. R., Glass D. M., Bird N. J. "Estimation of lean body mass in children." British Journal of Anaesthesia 106(5): 719-23 (2011).',
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = { fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)" };
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

export default function LeanBodyMassCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is Lean Body Mass?</h2>
        <p style={pStyle}>
          Lean body mass (LBM) is the part of body composition that is left when body fat is taken away from total body weight. It counts
          the mass of everything except body fat, including bones, muscles, blood, skin and organs. Although the percentage is not usually
          computed, LBM typically makes up 60-90% of total body weight, and men generally have a higher proportion than women.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The doses of some anesthetic agents, particularly water-soluble drugs, are routinely based on LBM, and some medical exams use it
          too. For fitness and everyday life, people usually care more about body fat percentage: for that, try the{" "}
          {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")} or the{" "}
          {link("/calculators/health/ideal-weight-calculator", "Ideal Weight Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lean Body Mass Formulas</h2>
        <p style={pStyle}>
          Several formulas have been developed to estimate lean body mass (eLBM), and the calculator above shows the results of all of them.
          In every formula, W is body weight in kilograms and H is height in centimeters.
        </p>
        <h3 style={h3Style}>Formulas for Adults</h3>
        <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 460 }}>
            <thead><tr><th style={{ textAlign: "left" }}>Formula</th><th style={{ textAlign: "left" }}>Males</th><th style={{ textAlign: "left" }}>Females</th></tr></thead>
            <tbody>
              {FORMULAS.map(([name, ref, male, female]) => (
                <tr key={name}>
                  <td>{name}<sup>{ref}</sup></td>
                  <td style={formulaStyle}>eLBM = {male}</td>
                  <td style={formulaStyle}>eLBM = {female}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 style={h3Style}>Formula for Children: Peters<sup>4</sup></h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The author suggests this formula for children aged 13-14 or younger. It estimates LBM from an estimated extracellular volume (eECV):{" "}
          <span style={formulaStyle}>eECV = 0.0215 · W<sup>0.6469</sup> · H<sup>0.7236</sup></span> and{" "}
          <span style={formulaStyle}>eLBM = 3.8 · eECV</span>. Choose "Age 14 or younger: yes" in the calculator to add it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lean Body Mass vs. Fat-Free Mass</h2>
        <p style={pStyle}>
          Lean body mass and fat-free mass are often used interchangeably. That rarely causes problems, but they are not exactly the same.
          Lean body mass includes the combined mass of bones, muscles, water, ligaments, tendons and internal organs. Internal organs contain
          some essential fat, and that fat is counted in lean body mass; the subcutaneous fat around them is not.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Fat-free mass is total body mass minus all fat, including essential fat. Subtracting the essential fat from lean body mass gives
          fat-free mass; the difference is about 2-3% of body weight in men and 5-12% in women.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>References</h2>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          {REFERENCES.map((r, i) => <li key={i} id={`lbm-ref-${i + 1}`}>{r}</li>)}
        </ol>
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
