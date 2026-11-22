import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is the GFR calculator free, and do I need to sign up?",
    a: "Yes, it is free and you do not need to create an account. You can run as many calculations as you like.",
  },
  {
    q: "How do I calculate GFR from creatinine?",
    a: "Enter your serum creatinine, age and gender into the calculator and pick a formula. Make sure the creatinine unit matches your lab report. If it is in µmol/L, divide by 88.4 to get mg/dL.",
  },
  {
    q: "Which GFR formula is the most accurate?",
    a: "For most adults, the 2021 CKD-EPI equation is the recommended choice. MDRD fits lower GFR ranges, Mayo Quadratic is designed for normal or near-normal kidney function, and Schwartz is for children.",
  },
  {
    q: "Can I use this calculator for children?",
    a: "Yes. Use the bedside Schwartz formula, which needs the child’s height in centimeters and serum creatinine in mg/dL. Do not use the adult equations for children.",
  },
  {
    q: "What is a good GFR?",
    a: "A GFR of 90 or higher is generally considered normal, provided there are no other signs of kidney damage. Normal values drop gradually with age, so a lower number can still be normal for an older adult.",
  },
  {
    q: "How bad is a GFR of 83?",
    a: "It falls in stage G2, which is a mild reduction. On its own, and especially after age 50, it does not mean kidney disease. Your doctor may repeat the test and check your urine and blood pressure.",
  },
  {
    q: "What is the difference between creatinine and GFR?",
    a: "Creatinine is a waste product measured in your blood. GFR is the rate at which your kidneys filter blood. As GFR falls, creatinine rises, and the calculator converts one into the other.",
  },
  {
    q: "Why do different formulas give different results?",
    a: "Each equation was built on a different group of patients and works best in a different range. Small differences are normal. If the results fall in different stages, talk to a healthcare professional.",
  },
  {
    q: "Can I improve my GFR?",
    a: "It depends on the cause. Reversible causes such as dehydration, certain medicines or uncontrolled blood pressure and blood sugar can often be corrected. Lost kidney tissue does not grow back, but treatment can slow further decline.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const AGE_HEADERS = ["Age group", "Average eGFR (mL/min/1.73 m²)"];
const AGE_ROWS = [
  ["20–29", "116"],
  ["30–39", "107"],
  ["40–49", "99"],
  ["50–59", "93"],
  ["60–69", "85"],
  ["70 and older", "75"],
];
const STAGE_HEADERS = ["Stage", "eGFR (mL/min/1.73 m²)", "General description"];
const STAGE_ROWS = [
  ["G1", "90 or above", "Normal or high"],
  ["G2", "60–89", "Mildly decreased"],
  ["G3a", "45–59", "Mild to moderately decreased"],
  ["G3b", "30–44", "Moderately to severely decreased"],
  ["G4", "15–29", "Severely decreased"],
  ["G5", "Below 15", "Kidney failure"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8, overflowX: "auto",
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
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 360 }}>
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

export default function GfrCalculatorFaqSection() {
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

      <Card title="What Is Glomerular Filtration Rate (GFR)?">
        <P>
          Glomerular filtration rate, or GFR, measures how much blood your kidneys filter every minute. Each kidney holds about a
          million tiny filtering units called nephrons, and every nephron begins with a small cluster of blood vessels called a
          glomerulus. GFR adds up the work of all of them. A higher number generally means your kidneys are clearing waste well. A lower
          number means fewer filters are working, or the ones that remain are working less efficiently.
        </P>
        <P>
          GFR is reported in milliliters per minute per 1.73 square meters (mL/min/1.73 m²). The 1.73 m² figure is the average adult
          {" "}<Link to="/tools/body-surface-area-calculator" className="inline-home-link">body surface area</Link>. Adjusting for it lets doctors compare a small person and a large person on the same scale, so the result
          reflects how well the kidneys are working rather than how big the body is.
        </P>
        <P>
          This is why GFR is the main number doctors use to judge kidney function. Failing kidneys rarely cause pain, and people can lose
          a large share of their function while feeling mostly fine. GFR picks up that loss early. It is used to screen for chronic
          kidney disease (CKD), stage it, follow it over time, check whether a treatment is working, adjust the dose of medicines the
          kidneys clear, and decide whether someone is healthy enough to donate a kidney. Early detection matters because treatment that
          starts sooner has a better chance of slowing the damage and delaying or avoiding dialysis.
        </P>
      </Card>

      <Card title="How Does Glomerular Filtration Work?">
        <P>
          Blood reaches each glomerulus through a small vessel called the afferent arteriole. Pressure inside the glomerular capillaries
          pushes water and small dissolved substances through a three-layer filter made of the capillary wall, a thin basement membrane
          and a layer of cells called podocytes. Water, salts, glucose, amino acids and wastes such as urea and creatinine pass through
          into a cup-shaped space called Bowman’s capsule. Blood cells and most proteins are too large to get through and stay in the
          blood, which leaves the glomerulus through the efferent arteriole.
        </P>
        <P>
          The fluid collected in Bowman’s capsule is called filtrate. Filtration depends on a balance of forces. Blood pressure in the
          capillaries pushes fluid out, while the pressure of fluid already in the capsule and the pull of proteins in the blood push
          back. The pressure left over drives filtration. Healthy kidneys filter roughly 180 liters of fluid a day, far more than the
          body holds, so nearly all of it has to be taken back. That job falls to the tubules, which reabsorb most of the water and salts
          and return them to the blood. Only about 1 to 2 liters leave the body as urine.
        </P>
        <P>
          This recovery step also explains a common question about glucose. Glucose is not missing from the filtrate. It passes through
          the filter freely. It is missing from normal urine because the first section of the tubule, called the proximal tubule, pulls
          almost all of it back into the blood using transporter proteins. Amino acids are recovered the same way. Only when blood sugar
          climbs above roughly 180 mg/dL do the transporters get overwhelmed and sugar spill into the urine, which is one reason urine
          glucose can point to diabetes.
        </P>
      </Card>

      <Card title="What Is a Normal GFR?">
        <P>
          In healthy younger adults, a normal GFR is usually between about 90 and 120 mL/min/1.73 m². Averages run slightly higher in men
          than in women under age 40, commonly cited as about 100 to 130 for men and 90 to 120 for women. A GFR of 90 or above is
          generally considered normal or good, as long as there are no other signs of kidney damage.
        </P>
        <P>GFR does not stay the same for life. It starts to decline gradually after about age 40, and the table below shows typical averages by age group.</P>
        <DataTable headers={AGE_HEADERS} rows={AGE_ROWS} />
        <P>
          These are population averages, not targets. A value of 75 is typical for a healthy 70-year-old, but the same number in a
          30-year-old would deserve a closer look. On average, GFR falls about 1 point per year after 40, although the pace varies a lot
          from person to person. So does GFR drop with age, or does a low value always mean disease? It is both. A slow decline is a
          normal part of aging, because kidneys lose nephrons and the small vessels stiffen and scar over time. High blood pressure,
          diabetes, obesity, smoking and certain medicines speed that decline up. A drop that is faster than expected, or a value far
          below the average for your age, is worth a conversation with a doctor.
        </P>
        <P>
          People in their 80s and 90s usually have an eGFR in their 50s or 60s, and a value above 90 at that age is uncommon. There is no
          fixed upper limit, since some people keep strong kidney function very late in life.
        </P>
        <P>
          Children are different. GFR is low at birth, rises quickly over the first weeks and reaches adult levels, adjusted for body
          size, at around age 2. Because adult equations do not fit growing bodies, children are assessed with the bedside Schwartz
          formula covered below.
        </P>
      </Card>

      <Card title="What Does eGFR Mean on a Blood Test Report?">
        <P>
          The “e” in eGFR stands for estimated. Measuring true GFR takes a lot of effort. The reference method uses inulin, a substance
          that the kidneys filter freely without absorbing, secreting or breaking it down. Doctors give it by continuous intravenous
          infusion and take timed blood and urine samples. That makes it accurate, but too slow and complicated for routine care.
        </P>
        <P>
          Instead, labs measure creatinine in your blood and put the result into an equation that also uses your age and gender.
          Creatinine is a waste product made by normal muscle activity. Creatinine and GFR move in opposite directions: as filtration
          drops, creatinine builds up in the blood. That is why the two numbers are related but not the same. Creatinine is a lab value
          measured in mg/dL, while GFR is a rate of filtering.
        </P>
        <P>
          Creatinine alone can be misleading because muscle mass and diet affect it. A creatinine value inside the lab’s normal range can
          hide a real loss of filtering in an older or smaller person. eGFR corrects for age and gender, which makes it a better
          indicator of kidney function than creatinine by itself. It is reliable for screening and for tracking change over time, but it
          remains an estimate, and the accuracy section later on this page explains where it can fall short.
        </P>
      </Card>

      <Card title="How to Use the GFR Calculator Online">
        <P>The tool needs only a few inputs, and getting each one right matters more than the formula you pick.</P>
        <P>
          Start with your serum creatinine value from a blood test. Check the unit printed on your report. US labs normally report mg/dL,
          while many other countries, including Pakistan, the UK and much of Europe, use µmol/L. Use the unit shown next to the
          creatinine field, and convert your number first if your report uses a different one. Mixing up the two units is the most common
          reason for an absurd result.
        </P>
        <P>
          Next, enter your age in years, select your gender and choose the race option. Both gender and age are built into every
          equation, since creatinine production differs between men and women and falls with age. The race option applies to older
          equations, and the section on it below explains when it matters. If you are using the Schwartz formula for a child, you will
          also need height in centimeters, because that equation scales creatinine against body length rather than age.
        </P>
        <P>
          Then choose your formula and calculate. The result appears as a single eGFR value, which you can compare against the stage table
          later on this page. To get a second opinion on the number, change the formula and run it again. The inputs stay the same, so the
          comparison takes seconds.
        </P>
        <P>There is nothing to download and no account to create. Open the page, enter the values and read the result.</P>
      </Card>

      <Card title="Choosing a Formula: CKD-EPI vs MDRD vs Mayo Quadratic vs Schwartz">
        <P>
          An eGFR is only as meaningful as the equation behind it. Each of the four options here was built on a different group of people
          for a different purpose. In every formula below, SCr is serum creatinine in mg/dL and age is in years. The{" "}
          <Ext href="https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults">NIDDK equation reference</Ext>{" "}
          lists the published versions in full.
        </P>
        <H3>CKD-EPI</H3>
        <P>
          The CKD-EPI equation is the default choice for most adults and the one most laboratories now report. It was developed to improve
          accuracy at higher filtration rates, where older equations tended to underestimate kidney function. The 2021 version removed race
          entirely, and major guideline bodies now recommend it for routine use. If you are unsure which to select, start with CKD-EPI.
        </P>
        <Formula>
          eGFR = 142 × min(SCr/κ, 1)<sup>α</sup> × max(SCr/κ, 1)<sup>−1.200</sup> × 0.9938<sup>age</sup> × 1.012 (if female)<br />
          κ = 0.7 for women, 0.9 for men<br />
          α = −0.241 for women, −0.302 for men
        </Formula>
        <P>
          Here, min means the smaller of SCr/κ and 1, and max means the larger of the two. The earlier 2009 version used a constant of 141
          and multiplied the result by 1.159 for Black patients.
        </P>
        <H3>MDRD</H3>
        <P>
          The MDRD equation was derived from patients who already had chronic kidney disease, so it works reasonably well at lower
          filtration rates but becomes less reliable above roughly 60 mL/min/1.73 m². It tends to read lower than CKD-EPI in healthy
          people, which can make normal kidneys look mildly impaired. Many older lab reports and research papers still use it, which is why
          this calculator keeps it available for side-by-side comparison.
        </P>
        <Formula>eGFR = 175 × SCr<sup>−1.154</sup> × age<sup>−0.203</sup> × 0.742 (if female) × 1.212 (if Black)</Formula>
        <H3>Mayo Quadratic</H3>
        <P>
          The Mayo Quadratic equation was built to estimate GFR in people with normal or mildly reduced kidney function, a range where
          other equations lose precision. It is often used when screening potential kidney donors or assessing patients whose creatinine
          sits in the normal range. If creatinine is below 0.8 mg/dL, the equation uses 0.8 instead, so results do not become
          unrealistically high.
        </P>
        <Formula>eGFR = e<sup>(1.911 + 5.249/SCr − 2.114/SCr² − 0.00686 × age − 0.205 (if female))</sup></Formula>
        <H3>Bedside Schwartz for Children</H3>
        <P>
          Adult equations are not valid for children. The bedside Schwartz formula multiplies height in centimeters by a constant of 0.413
          and divides by serum creatinine in mg/dL. It was validated against measured GFR in children with chronic kidney disease and is
          the standard pediatric estimate. NIDDK’s own bedside calculator is intended for children ages 1 to 16, so use it for children
          and teens rather than adults, and make sure the height is a recent measurement.
        </P>
        <Formula>eGFR = 0.413 × height (cm) / SCr</Formula>
        <H3>A Worked Example</H3>
        <P>
          Take a 55-year-old woman with a serum creatinine of 1.1 mg/dL. Using the 2021 CKD-EPI equation, SCr divided by κ is 1.1 / 0.7,
          or about 1.57. That is above 1, so the max term applies: 1.57 raised to −1.200 is about 0.58. The age term, 0.9938 raised to
          the 55th power, is about 0.71. Multiplying 142 × 0.58 × 0.71 × 1.012 gives an eGFR of about 59 mL/min/1.73 m², which sits at
          the top of stage G3a. For a child, a 10-year-old who is 140 cm tall with a creatinine of 0.6 mg/dL has an eGFR of 0.413 × 140 /
          0.6, or about 96. Doing the arithmetic by hand is a useful check, but the calculator saves you the exponents.
        </P>
        <H3>Which One Should You Trust?</H3>
        <P>
          For healthy or unknown kidney status, CKD-EPI is the safest starting point. For a known reduced GFR, CKD-EPI and MDRD usually
          land within a few points of each other. For high-normal values, Mayo Quadratic offers a useful cross-check. If two equations
          differ by more than a stage, that is a signal to discuss the result with a clinician rather than to pick whichever number you
          prefer. It also helps to stick with one equation when you track results over time, because part of any change between
          equations comes from the math, not from your kidneys.
        </P>
      </Card>

      <Card title="Reading Your Result: GFR Stages and What the Number Means">
        <P>Kidney guidelines (KDIGO) group eGFR results into stages:</P>
        <DataTable headers={STAGE_HEADERS} rows={STAGE_ROWS} />
        <P>
          Two cautions matter here. First, a diagnosis of chronic kidney disease is not made from a single eGFR. Guidelines look for
          reduced filtration or other signs of kidney damage that last at least three months, and a urine albumin test is part of staging
          alongside GFR. Second, a stage G1 or G2 result without any other sign of kidney damage is not considered CKD. A sudden drop from
          your own previous results can matter more than the stage itself, because it can be an early sign of trouble even when the new
          number still looks acceptable.
        </P>
        <P>
          So how bad is a GFR of 83? It falls in stage G2, mildly decreased. For many adults, especially past age 50, that is within the
          normal range for age and does not mean kidney disease on its own. Doctors usually repeat the test and check urine albumin and
          blood pressure before drawing any conclusion. A GFR of 54 falls in stage G3a. It points to a mild to moderate reduction, and the
          more useful question is the trend: a stable 54 over several years is a different situation from a fall from 75 to 54 in one
          year. Either way, a doctor will look for the cause.
        </P>
        <P>
          People also ask what the ideal eGFR is for someone with kidney disease. There is no single target number. The aim is to keep the
          eGFR as stable as possible and slow any decline by treating the cause. Dialysis does not have one cutoff either. It is usually
          considered when eGFR falls below about 15, but the decision rests on symptoms such as nausea, fluid buildup and high potassium,
          as well as lab results.
        </P>
      </Card>

      <Card title="What Affects Your GFR?">
        <P>
          Several things can lower GFR, and some of them are temporary. Dehydration, vomiting, diarrhea and blood loss lower blood volume
          and the pressure that drives filtration. Low blood pressure and heart problems reduce the blood that reaches the kidneys. Over
          time, diabetes and high blood pressure damage the glomeruli themselves. Other causes include kidney infections, inflammation of
          the glomeruli (glomerulonephritis), lupus, polycystic kidney disease, liver disease and a blockage in the urinary tract, such as
          a kidney stone or an enlarged prostate.
        </P>
        <P>
          Medicines matter too. Anti-inflammatory painkillers such as ibuprofen and naproxen, some antibiotics and the contrast dye used in
          certain scans can reduce kidney function, especially in people who are already dehydrated or who have existing kidney disease.
          Blood pressure drugs called ARBs, such as losartan, and ACE inhibitors work differently. They relax the outlet vessel of the
          glomerulus, which lowers pressure inside it. A small drop in eGFR in the first weeks of treatment is common and usually accepted,
          since these drugs protect the kidneys over the long run. Never stop them on your own because of an eGFR change. Diuretics, or
          water pills, can lower GFR when they remove too much fluid. Doctors adjust all of these based on your results, which is why they
          track eGFR closely after any change.
        </P>
        <P>
          A few things raise GFR. It rises by roughly 40 to 50 percent in early pregnancy. A large high-protein meal can raise it for a
          few hours. In early diabetes, GFR is often higher than normal because the kidneys filter under extra pressure, a state called
          hyperfiltration. A high number is not always good news. Years of hyperfiltration can strain and scar the filters, and a falsely
          high estimate can also appear in people with very low muscle mass because their creatinine is low. When GFR rises briefly, the
          tubules usually reabsorb a fixed share of what is filtered, so the body keeps its fluid and salt balance steady without a large
          swing in urine output.
        </P>
        <P>
          Diabetes deserves its own mention, because it is a leading cause of kidney failure and the link with GFR is strong. GFR often
          runs high in the early years, then falls as damage builds. After normal aging, which costs about 1 point a year, diabetic kidney
          disease often brings a faster decline, commonly several points a year once damage is established. KDIGO treats a sustained fall
          of more than 5 points a year as rapid. The pace varies widely, which is why regular testing is advised for anyone with diabetes.
        </P>
        <P>
          Heart failure affects GFR in several ways. A weak heart pumps less blood to the kidneys, pressure builds in the veins and
          congests them, and the body releases hormones that tighten the kidney’s blood vessels. This combination is known as cardiorenal
          syndrome. GFR also guides treatment in heart failure, since it affects how well a patient responds to diuretics and which doses
          are safe. Many people with heart failure take drugs that change creatinine, so doctors read the number alongside symptoms and
          blood pressure.
        </P>
        <P>
          Surgery and exercise also play a role. A person who donates a kidney loses about half of their filtering tissue, yet the
          remaining kidney grows and compensates. GFR drops by roughly a third to start, then recovers partly and often settles at around
          60 to 75 percent of the pre-donation level. Hard exercise can temporarily raise creatinine and lower the estimate for a day or
          so, so avoid blood tests right after a heavy workout. Regular, moderate activity helps over the long run by supporting blood
          pressure, blood sugar and weight.
        </P>
      </Card>

      <Card title="How the Kidneys Regulate GFR">
        <P>
          Healthy kidneys hold GFR steady even when blood pressure changes through the day. They do this with two built-in controls. The
          first is a simple stretch response: when blood pressure rises, the afferent arteriole that feeds the glomerulus tightens, and
          when it falls, the vessel relaxes. The second is called tubuloglomerular feedback. A small group of cells called the macula
          densa sits in the tubule right next to the glomerulus and measures how much sodium chloride flows past. If GFR runs too high,
          more salt arrives, and the macula densa sends a signal that tightens the afferent arteriole and brings filtration down. If GFR
          runs low, less salt arrives. The signal reverses, the afferent vessel opens, and nearby cells release a hormone called renin.
          Renin leads to angiotensin II, which tightens the efferent arteriole and raises pressure inside the glomerulus, helping to
          restore filtration.
        </P>
        <P>
          Which vessel widens or narrows matters a great deal, and this clears up a point that confuses many students. Think of the
          glomerulus as a sink with a tap and a drain. Opening the inlet, the afferent arteriole, lets more blood and pressure in, so GFR
          goes up. Opening the outlet, the efferent arteriole, lets pressure drain away, so GFR goes down even though more blood flows
          through. That is why vasodilation in the body as a whole lowers blood pressure, yet widening the afferent vessel specifically
          raises filtration. It is also why ARB and ACE inhibitor drugs, which relax the efferent vessel, lower GFR a little at first.
        </P>
        <P>
          It also helps to separate GFR from renal plasma flow. Renal plasma flow is the amount of plasma that reaches the kidneys each
          minute, roughly 600 to 700 mL. GFR is only the portion that actually gets filtered, around 120 mL per minute in a healthy
          adult. The ratio between them, called the filtration fraction, is about one-fifth.
        </P>
      </Card>

      <Card title="What Happens When GFR Drops?">
        <P>
          In the early stages, a falling GFR usually causes no symptoms at all, which is why testing matters. As filtration declines,
          waste products such as urea and creatinine build up in the blood. The kidneys also lose the ability to remove extra sodium and
          water. That retained fluid explains why people with low GFR often feel puffy or swollen, especially in the ankles, legs and
          around the eyes. The extra fluid also raises blood pressure and can cause shortness of breath.
        </P>
        <P>
          As kidney function falls further, people may notice tiredness, poor appetite, nausea, itchy skin, muscle cramps and foamy urine.
          Other effects build up quietly. Anemia can develop because the kidneys make a hormone that supports red blood cell production.
          Bones can weaken, and potassium and acid can rise to unsafe levels. Because the body usually compensates when GFR falls, the
          first noticeable symptoms often appear only after a lot of function is gone.
        </P>
        <P>
          Low GFR also changes how the body handles medicines. Many drugs are cleared by the kidneys, so doses may need to be lowered to
          avoid a buildup. Some drug labels give dosing advice in terms of creatinine clearance, which is usually calculated with the
          Cockcroft-Gault equation and uses body weight. eGFR is adjusted to a standard body size instead. For most people the two lead to
          similar decisions, but in very large, very small or older patients they can differ, so doctors and pharmacists choose the method
          deliberately. This calculator is not a tool for changing a dose on your own.
        </P>
      </Card>

      <Card title="Can You Increase Your GFR?">
        <P>
          It depends on why GFR is low. When the cause is temporary or treatable, such as dehydration, a medicine, an infection, a urinary
          blockage or poorly controlled blood pressure or blood sugar, eGFR can improve, sometimes back to normal. When the cause is
          long-term scarring from chronic kidney disease, filters that are gone do not grow back. In that case the realistic goal is to
          protect the nephrons you still have and slow further loss. If your eGFR is 54, for example, the next step is not a home fix. It
          is to find out what is behind the number and whether it is stable.
        </P>
        <P>
          Will drinking water increase your GFR? Staying well hydrated supports kidney function and lowers the risk of stones. Dehydration
          can temporarily lower eGFR, so if you were low on fluids when the blood was drawn, a repeat test after drinking normally may read
          higher. But drinking extra water does not push a healthy kidney, or a damaged one, above its baseline. People with advanced
          kidney disease or heart failure are sometimes told to limit fluids, so ask your doctor before changing how much you drink.
        </P>
        <P>
          You can still do a lot without medication, and most of it protects the kidneys over time. Keep blood pressure in the range your
          doctor recommends. Manage blood sugar if you have diabetes. Cut back on salt, eat a balanced diet with plenty of vegetables, and
          talk to your doctor about how much protein is right for you. Stay active, keep a <Link to="/tools/healthy-weight-calculator" className="inline-home-link">healthy weight</Link>, stop smoking, limit alcohol and
          avoid regular use of anti-inflammatory painkillers. No supplement, juice or detox product has been proven to raise GFR, and some
          herbal products can harm the kidneys.
        </P>
        <P>
          People do see their numbers improve, mostly when a reversible cause is found and fixed. Medicines such as ACE inhibitors, ARBs
          and SGLT2 inhibitors are proven to slow kidney decline in the right patients, but they must be prescribed and monitored by a
          doctor.
        </P>
      </Card>

      <Card title="When You Might Need a GFR Calculator">
        <P>Most people reach for this tool in one of a handful of situations.</P>
        <P>
          The most common is a lab report that lists creatinine but no eGFR, or one eGFR from a clinic and a different one from a
          hospital. Running the creatinine through the same equation resolves the discrepancy and shows whether the difference comes from
          the formula or from a real change in kidney function.
        </P>
        <P>
          People with diabetes, high blood pressure or a family history of kidney disease are advised to track kidney function over time.
          Entering each new result into the same equation, with the same units, gives a clean trend line that is easier to follow than a
          series of reports from different labs.
        </P>
        <P>
          Medical and pharmacy students use a GFR calculator to check manual working, and clinicians use it for quick bedside estimates
          when deciding whether a drug dose needs adjusting. Many medicines, including some antibiotics, anticoagulants and diabetes drugs,
          are cleared by the kidneys, and prescribing guidance is often written in terms of GFR bands.
        </P>
        <P>
          Parents of children with kidney conditions use the pediatric Schwartz option to follow growth-adjusted values. Prospective living
          kidney donors and the clinicians evaluating them look at estimates from multiple equations before moving on to formal
          measurement.
        </P>
        <P>
          In each case the tool saves time, but it also works as a reference point: a number to ask better questions about, not a
          replacement for a clinician’s judgment.
        </P>
      </Card>

      <Card title="Creatinine Units and Input Tips">
        <P>
          {" "}<Link to="/tools/unit-converter" className="inline-home-link">Unit conversion</Link> trips up more users than the formulas do. To convert µmol/L to mg/dL, divide by 88.4. To go the other way,
          multiply by 88.4. A creatinine of 88 µmol/L is roughly 1.0 mg/dL, which is a typical value for a healthy adult.
        </P>
        <P>
          To get a dependable estimate, use a result from a standard blood test taken under ordinary conditions. Creatinine can rise
          temporarily after a very large meal of cooked red meat or when you are dehydrated. Creatine supplements can also raise it without
          any change in kidney function. If your result looks unexpectedly poor and you recently did any of these, repeating the test under
          normal conditions is sensible before drawing conclusions.
        </P>
        <P>
          Enter ages as whole years and double-check that the decimal point in your creatinine value is in the right place. A creatinine of
          0.9 and 9.0 are worlds apart, and the calculator will produce exactly what you enter.
        </P>
      </Card>

      <Card title="About the Race Field">
        <P>
          Older equations, including the original 2009 CKD-EPI and MDRD, included a coefficient for Black patients. It came from study data
          in which Black participants had higher average creatinine levels, and it raised the estimated GFR to match. That is why GFR values
          could differ for people of African descent on the same blood test. Current guidance has moved away from this. Race is a social
          category, not a biological measure, and individual differences within any group are far larger than differences between groups.
          The adjustment could also overstate kidney function in some patients and delay diagnosis, referral and transplant evaluation. The
          2021 CKD-EPI equation removes the race term entirely.
        </P>
        <P>
          The race option in this tool exists so you can reproduce results from legacy reports or follow a protocol that still specifies
          it. If you are calculating a fresh value for your own use, the race-free CKD-EPI result is the one current guidelines support.
        </P>
      </Card>

      <Card title="Accuracy, Limits and When an eGFR Can Mislead">
        <P>
          Every eGFR is an estimate. Even under good conditions, estimating equations can differ from measured GFR by 10 to 30 percent in a
          meaningful share of patients, and they tend to become less precise as GFR rises. The{" "}
          <Ext href="https://www.niddk.nih.gov/health-information/professionals/clinical-tools-patient-management/kidney-disease/laboratory-evaluation/estimated-gfr-calculators/adults-pediatrics">NIDDK guidance on eGFR calculators</Ext>{" "}
          notes that trends over time are often more informative than a single result.
        </P>
        <P>
          Creatinine depends heavily on muscle mass. People with very high muscle mass, such as bodybuilders, may show a high creatinine
          and a falsely low eGFR even though their kidneys are healthy. People with low muscle mass, including older adults and those with
          amputations, malnutrition or muscle-wasting conditions, may show a normal creatinine despite reduced filtration, producing a
          falsely reassuring result. Creatinine clearance from a 24-hour urine collection has its own flaw. The tubules release a small
          amount of creatinine into the urine, so it tends to overestimate true GFR by about 10 to 20 percent.
        </P>
        <P>
          These equations also assume stable kidney function. In acute kidney injury, creatinine lags behind the true change in filtration,
          so an eGFR from a rapidly changing situation can be misleading in either direction. The same applies during pregnancy, in people
          on dialysis, and in those with extreme body size.
        </P>
        <P>
          When creatinine is likely to be unreliable, clinicians may order cystatin C, a protein whose level does not depend on muscle
          mass, or combine the two markers for a more robust estimate. If your situation fits any of the cases above, treat the number from
          this calculator as a starting point and discuss confirmatory testing with your doctor.
        </P>
      </Card>

      <Card title="Free, Private and Straightforward to Use">
        <P>
          The GFR calculator is free to use, with no registration required and no charge at any step. You do not need to provide your name
          or email to get a result. Kidney values are sensitive health information, so it is sensible to enter only what the calculation
          needs: creatinine, age, gender, race and, for children, height. Nothing else is asked for, and nothing else is needed.
        </P>
        <P>
          On accuracy, the tool applies the published equations as written, so the same inputs will give the same output every time. The
          results match what you would get doing the calculation by hand or with other standard implementations of the same formula.
          Remember that the estimate is informational and does not replace a professional assessment.
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
