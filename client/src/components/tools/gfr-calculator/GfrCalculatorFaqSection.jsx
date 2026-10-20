import { useState } from "react";
import JsonLd from "../../JsonLd";
import { CKD_STAGES } from "../../../utils/gfrCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "Which GFR formula should I use?",
    a: "CKD-EPI is generally considered the most accurate of the three for adults, especially at normal or near-normal kidney function, and is the one most labs report. MDRD tends to underestimate GFR above 60, and the Mayo Quadratic formula was developed to work better for people with healthy kidneys. For children, use the bedside Schwartz formula in the second calculator.",
  },
  {
    q: "What is a normal GFR?",
    a: "For adults under 40, about 100-130 mL/min/1.73 m² for men and 90-120 for women, falling gradually with age (see the population averages above). A GFR above 60 is usually adequate on its own; below 60 for three months or more, or any value with signs of kidney damage, suggests chronic kidney disease.",
  },
  {
    q: "Why does race appear in the calculation?",
    a: "The MDRD (2006) and CKD-EPI (2009) equations were published with a race coefficient, so the calculator includes it to reproduce them. Many labs now use the 2021 race-free CKD-EPI equation instead; ask your doctor which one your results are based on.",
  },
  {
    q: "Can I enter creatinine in micromoles per liter?",
    a: "Yes. Choose micromole/L next to the creatinine box; it is converted to mg/dL by dividing by 88.4.",
  },
  {
    q: "Can this calculator diagnose kidney disease?",
    a: "No. It only estimates GFR from a blood test value. Diagnosing and staging kidney disease also needs other tests, such as urine protein, and your doctor's assessment.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const MEAN_GFR = [["20-29", "116"], ["30-39", "107"], ["40-49", "99"], ["50-59", "93"], ["60-69", "85"], ["70+", "75"]];
const CKD_EPI = [
  ["Black female", "166", "0.7", "-0.329"], ["Black male", "163", "0.9", "-0.411"],
  ["Non-Black female", "144", "0.7", "-0.329"], ["Non-Black male", "141", "0.9", "-0.411"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const formula = { fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.7, margin: "0 0 8px", paddingLeft: 16, fontFamily: "var(--font-mono, monospace)" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const cardStyle = { padding: "20px 20px" };
const Scr = () => <>S<sub>Cr</sub></>;
const M2 = <>mL/min/1.73 m<sup>2</sup></>;

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

export default function GfrCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is Glomerular Filtration Rate (GFR)?</h2>
        <p style={pStyle}>
          Glomerular filtration rate is the rate at which filtered fluid flows through the kidneys, and it is used as a measure of kidney
          function. Generally, a higher GFR means better kidney function. A significant drop in GFR means the kidneys are not working properly
          and filter less fluid in a given time. The normal range adjusted for body surface area is 100 to 130 mL/min/1.73 m² for men and 90 to
          120 mL/min/1.73 m² for women under 40; after 40, GFR falls gradually with age. The table below shows the population mean estimated
          GFR by age.
        </p>
        <h3 style={h3Style}>Population mean estimated GFR</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Age</th><th>Mean estimated GFR ({M2})</th></tr></thead>
            <tbody>{MEAN_GFR.map(([age, gfr]) => <tr key={age}><td>{age}</td><td style={{ textAlign: "center" }}>{gfr}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Chronic Kidney Disease Stages</h2>
        <p style={pStyle}>
          A GFR above 60 mL/min/1.73 m² is usually adequate for most patients and on its own does not necessarily mean chronic kidney disease
          (CKD). A significant decline since a previous test, however, could be an early sign of kidney disease, and the sooner kidney disease
          is diagnosed and treated, the better the chance of avoiding dialysis. The stages below also depend on other factors besides GFR, as
          noted in the table.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Stage</th><th style={{ textAlign: "left" }}>GFR value ({M2})</th></tr></thead>
            <tbody>{CKD_STAGES.map(([stage, value]) => <tr key={stage}><td>{stage}</td><td>{value}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Measuring GFR</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>The IDMS-traceable MDRD study equation</h3>
        <p style={formula}>GFR = 175 × (<Scr />)<sup>−1.154</sup> × (age)<sup>−0.203</sup> × (0.742 if female) × (1.212 if Black)</p>
        <p style={pStyle}>where <Scr /> = serum creatinine in mg/dL</p>
        <h3 style={h3Style}>The CKD-EPI formula</h3>
        <p style={formula}>GFR = A × (<Scr /> / κ)<sup>α</sup> × 0.993<sup>age</sup> if <Scr /> &lt; κ</p>
        <p style={formula}>GFR = A × (<Scr /> / κ)<sup>−1.209</sup> × 0.993<sup>age</sup> if <Scr /> &gt; κ</p>
        <div style={{ overflowX: "auto", margin: "6px 0 4px" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Group</th><th>A</th><th>κ</th><th>α</th></tr></thead>
            <tbody>{CKD_EPI.map(([group, ...cells]) => <tr key={group}><td>{group}</td>{cells.map((c, i) => <td key={i} style={{ textAlign: "center" }}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <h3 style={h3Style}>The Mayo Quadratic formula</h3>
        <p style={formula}>GFR = e<sup>(1.911 + 5.249/<Scr /> − 2.114/<Scr /><sup>2</sup> − 0.00686 × age − (0.205 if female))</sup></p>
        <p style={pStyle}>If <Scr /> &lt; 0.8 mg/dL, 0.8 mg/dL is used for <Scr />.</p>
        <h3 style={h3Style}>Estimated GFR for children (bedside Schwartz formula)</h3>
        <p style={{ ...formula, marginBottom: 0 }}>GFR = 0.413 × height (in cm) / <Scr /></p>
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
