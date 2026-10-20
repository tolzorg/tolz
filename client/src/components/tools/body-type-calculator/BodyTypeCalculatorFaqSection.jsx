import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I measure myself?",
    a: "Use a soft tape measure, kept level and snug but not tight. Bust: around the fullest part of your chest. Waist: around the narrowest part of your torso, usually just above the belly button. High hip: around the top of the hip bones, a few inches below the waist. Hip: around the widest part of your hips and buttocks.",
  },
  {
    q: "Why does my result show two body shapes?",
    a: "The rules for the seven shapes overlap slightly, so some measurements fit two of them (for example Hourglass and Spoon). Both are shown; either can guide your outfit choices.",
  },
  {
    q: "What if my body shape can't be classified?",
    a: "Some measurements don't fit any of the seven shapes, which is normal: everyone is unique, and the categories are only a guide. Your waist-hip ratio is still shown.",
  },
  {
    q: "What is a healthy waist-hip ratio?",
    a: "The World Health Organization treats a ratio above 0.85 for women (0.90 for men) as abdominal obesity with a higher risk of conditions such as heart disease and type 2 diabetes. The calculator flags a ratio above 0.85.",
  },
  {
    q: "Can I mix inches and centimeters?",
    a: "Yes. Each measurement has its own unit menu; everything is converted to inches (1 inch = 2.54 cm) before the shape rules are applied.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const RULES = [
  ["Hourglass", "(bust − hips) ≤ 1\" and (hips − bust) < 3.6\" and ((bust − waist) ≥ 9\" or (hips − waist) ≥ 10\")"],
  ["Bottom hourglass", "(hips − bust) ≥ 3.6\" and (hips − bust) < 10\" and (hips − waist) ≥ 9\" and (high hip ÷ waist) < 1.193"],
  ["Top hourglass", "(bust − hips) > 1\" and (bust − hips) < 10\" and (bust − waist) ≥ 9\""],
  ["Spoon", "(hips − bust) > 2\" and (hips − waist) ≥ 7\" and (high hip ÷ waist) ≥ 1.193"],
  ["Triangle", "(hips − bust) ≥ 3.6\" and (hips − waist) < 9\""],
  ["Inverted triangle", "(bust − hips) ≥ 3.6\" and (bust − waist) < 9\""],
  ["Rectangle", "(hips − bust) < 3.6\" and (bust − hips) < 3.6\" and (bust − waist) < 9\" and (hips − waist) < 10\""],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
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

export default function BodyTypeCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is My Body Shape?</h2>
        <p style={pStyle}>
          A study of more than 6,000 women at North Carolina State University in 2005 found that 46% of women were banana-shaped (rectangle),
          just over 20% pear-shaped (triangle), just under 14% apple-shaped (inverted triangle) and only 8% hourglass-shaped.
        </p>
        <p style={pStyle}>
          Female body shapes are based on societal standards that are subjective and differ between cultures. This calculator uses the
          algorithm from a study in the International Journal of Clothing Science and Technology, which divides women&apos;s body shapes into 7
          categories (Lee, Istook, Nam &amp; Park, 2007). Actual sizes vary widely within each shape, and some bodies don&apos;t fit any of
          them. Each shape is tested with the measurements in inches:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 480 }}>
            <thead><tr><th style={{ textAlign: "left" }}>Body shape</th><th style={{ textAlign: "left" }}>Rule</th></tr></thead>
            <tbody>{RULES.map(([shape, rule]) => <tr key={shape}><td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{shape}</td><td>{rule}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Waist-Hip Ratio</h2>
        <p style={pStyle}>
          Waist-hip ratio (WHR) is waist circumference divided by hip circumference: a 34&quot; waist and 40&quot; hips give 34/40, or 0.85. It
          is sometimes used as an indicator of health. Research shows that people who carry more weight around the waist (&quot;apple-shaped&quot;)
          are at higher risk than those who carry it around the hips (&quot;pear-shaped&quot;). According to the National Institute of Diabetes
          and Digestive and Kidney Diseases (NIDDK), women with a WHR above 0.8 and men above 1.0 have higher health risks because of their fat
          distribution.
        </p>
        <p style={pStyle}>
          WHR is also used to measure obesity. The World Health Organization defines a WHR above 0.90 for men and 0.85 for women as obese,
          corresponding to a BMI above 30. Obesity can point to serious conditions such as high blood pressure, coronary heart disease, diabetes
          and some cancers. WHR has been found to predict mortality in people over 75 better than waist circumference or BMI, and to predict
          cardiovascular disease better than both; one study (Yusuf et al., 2005) found that defining obesity by WHR instead of BMI would triple
          the number of people classed as at risk of a heart attack.
        </p>
        <p style={pStyle}>
          Abdominal fat (as in &quot;apple-shaped&quot; bodies) carries higher health risks than fat elsewhere: the higher the WHR, the more
          abdominal fat and the higher the risk. See the {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")} for more about
          types of fat and the risks of being overweight or obese.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          WHR is also linked to fertility: women with a WHR above 0.80 have significantly lower pregnancy rates than those between 0.70 and 0.79,
          and men with a WHR around 0.9 tend to be more fertile and healthier, with a lower chance of prostate and testicular cancer. WHR has
          also been studied in relation to cognitive ability, attractiveness and diet.
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
