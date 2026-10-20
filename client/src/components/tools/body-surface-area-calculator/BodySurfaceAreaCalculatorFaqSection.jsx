import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Which BSA formula should I use?",
    a: "Du Bois is the most widely used and is shown at the top of the results. Mosteller is popular in clinical practice because it is simple to work out by hand; Haycock and Gehan & George are often used for children, and Fujimoto and Takahira were developed for Japanese populations. For most adults the formulas agree within a few percent.",
  },
  {
    q: "What is an average body surface area?",
    a: "About 1.9 m² for an adult man and 1.6 m² for an adult woman; 1.14 m² for a ten-year-old, 0.5 m² for a two-year-old and 0.25 m² for a newborn (see the table above).",
  },
  {
    q: "Why does the Schlich result depend on gender?",
    a: "The Schlich formula was derived from 3-D body scans and has separate equations for women and men; the other seven formulas use only weight and height.",
  },
  {
    q: "What is BSA used for?",
    a: "Mainly in medicine: dosing chemotherapy and some other drugs, calculating the cardiac index, and estimating metabolic mass. Always follow your doctor's or pharmacist's dose, which may also account for other factors.",
  },
  {
    q: "Can I enter metric units?",
    a: "Yes. Choose kilograms or grams for weight and centimeters for height from the unit menus next to each box. Results are shown in square meters, square feet and square inches.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const AVERAGES = [["Newborn child", "2.69", "0.25"], ["Two-year-old child", "5.38", "0.5"], ["Ten-year-old child", "12.27", "1.14"], ["Adult female", "17.22", "1.6"], ["Adult male", "20.45", "1.9"]];
const FORMULA_LIST = [
  ["Du Bois", <>BSA = 0.007184 × W<sup>0.425</sup> × H<sup>0.725</sup></>, "Du Bois D, Du Bois EF (1916). \"A formula to estimate the approximate surface area if height and weight be known\". Archives of Internal Medicine 17 (6): 863-71."],
  ["Mosteller", <>BSA = 0.016667 × W<sup>0.5</sup> × H<sup>0.5</sup></>, "Mosteller RD. \"Simplified calculation of body-surface area\". N Engl J Med 1987; 317:1098."],
  ["Haycock", <>BSA = 0.024265 × W<sup>0.5378</sup> × H<sup>0.3964</sup></>, "Haycock GB, Schwartz GJ, Wisotsky DH. \"Geometric method for measuring body surface area: a height-weight formula validated in infants, children and adults\". J Pediatr 1978; 93:62-66."],
  ["Gehan and George", <>BSA = 0.0235 × W<sup>0.51456</sup> × H<sup>0.42246</sup></>, "Gehan EA, George SL. Cancer Chemother Rep 1970; 54:225-235."],
  ["Boyd", <>BSA = 0.0333 × W<sup>(0.6157 − 0.0188 × log10(W))</sup> × H<sup>0.3</sup></>, "Boyd E (1935). The Growth of the Surface Area of the Human Body. University of Minnesota Press."],
  ["Fujimoto", <>BSA = 0.00883 × W<sup>0.444</sup> × H<sup>0.663</sup></>, "Fujimoto S, Watanabe T, Sakamoto A, Yukawa K, Morimoto K. Studies on the physical surface area of Japanese. 18. Calculation formulae in three stages over all ages. Nippon Eiseigaku Zasshi 1968; 5:443-50."],
  ["Takahira", <>BSA = 0.007241 × W<sup>0.425</sup> × H<sup>0.725</sup></>, "Fujimoto S, et al. Nippon Eiseigaku Zasshi 1968; 5:443-50."],
  ["Schlich", <>Women: BSA = 0.000975482 × W<sup>0.46</sup> × H<sup>1.08</sup>; men: BSA = 0.000579479 × W<sup>0.38</sup> × H<sup>1.24</sup></>, "Schlich E, Schumm M, Schlich M. \"3-D-Body-Scan als anthropometrisches Verfahren zur Bestimmung der spezifischen Körperoberfläche\". Ernährungs Umschau 2010; 57:178-183."],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 4px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
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

export default function BodySurfaceAreaCalculatorFaqSection() {
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
        <h2 style={h2Style}>Average Body Surface Area</h2>
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" }}>
            <thead><tr><th style={{ textAlign: "left" }}>&nbsp;</th><th>ft<sup>2</sup></th><th>m<sup>2</sup></th></tr></thead>
            <tbody>{AVERAGES.map(([who, ft, m]) => <tr key={who}><td>{who}</td><td style={{ textAlign: "center" }}>{ft}</td><td style={{ textAlign: "center" }}>{m}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={pStyle}>
          BSA is often used for clinical purposes instead of body weight because it is a more accurate indicator of metabolic mass (the body&apos;s
          need for energy). Metabolic mass can be estimated from fat-free mass: all of a person&apos;s body mass except fat, including bones,
          tendons, organs, muscles, blood and nerves. Since body fat is not metabolically active, fat-free mass is a reasonable estimate of
          metabolic mass.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          BSA is also used in other clinical settings, such as the cardiac index (relating heart performance to body size) and, most commonly,
          chemotherapy dosing. There are arguments against using BSA for drugs with a narrow therapeutic index (the margin between an effective
          dose and a toxic one), where BSA may not be precise enough, and BSA becomes less accurate at extremes of height and weight, where
          {" "}{link("/calculators/health/bmi-calculator", "BMI")} may be a better estimate. Even so, chemotherapy doses based on BSA remain more
          consistent than doses based on body weight alone.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BSA Formulas</h2>
        <p style={{ ...pStyle, marginBottom: 4 }}>
          Below are some of the most popular formulas for estimating BSA. The most widely used is the Du Bois formula, which has been shown to
          work for both obese and non-obese patients. BSA is in m², W is weight in kg and H is height in cm.
        </p>
        {FORMULA_LIST.map(([name, formula, ref]) => (
          <div key={name}>
            <h3 style={h3Style}>{name} formula</h3>
            <p style={{ ...pStyle, margin: "0 0 2px", color: "var(--text-primary)" }}>{formula}</p>
            <p style={{ ...pStyle, fontSize: 12, marginBottom: 6 }}>{ref}</p>
          </div>
        ))}
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
