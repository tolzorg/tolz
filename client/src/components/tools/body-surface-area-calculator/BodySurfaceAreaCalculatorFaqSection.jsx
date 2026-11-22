import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the best formula for calculating body surface area?",
    a: "No single formula is best for everyone. Du Bois and Mosteller are the most widely used for adults, while Haycock, Gehan and George, and Boyd are often preferred for children. If a protocol names a formula, use that one.",
  },
  {
    q: "What is the normal BSA for an adult?",
    a: "Averages are about 1.9 m² for men and 1.6 m² for women, with around 1.7 m² often quoted for adults generally. Healthy values vary widely with height and weight.",
  },
  {
    q: "How do I calculate BSA in m² with the Mosteller formula?",
    a: "Multiply height in centimeters by weight in kilograms, divide by 3,600, then take the square root. For 175 cm and 70 kg, that gives about 1.84 m².",
  },
  {
    q: "What is the difference between Du Bois and Mosteller?",
    a: "Du Bois uses fractional exponents and was published in 1916, while Mosteller uses a simple square-root equation from 1987. For typical adults, their results differ by roughly 1 to 2 percent.",
  },
  {
    q: "Why is chemotherapy based on body surface area?",
    a: "BSA correlates with metabolic rate and blood volume more closely than weight alone, so it became a way to scale doses across patients of different sizes. It isn’t perfect, so doses are often adjusted for each patient’s response and lab results.",
  },
  {
    q: "Why is pediatric dosing based on weight and BSA?",
    a: "Children’s bodies change quickly as they grow, so doses are scaled to size. Weight-based dosing is common for everyday medicines, while BSA is used more often for chemotherapy and some specialized drugs.",
  },
  {
    q: "What is the difference between BSA and BMI?",
    a: "BMI is a weight-status screening number, while BSA estimates skin surface area and is used for dosing and standardizing physiological measurements. Neither tells you how much of a person’s weight is muscle or fat.",
  },
  {
    q: "What percentage of body surface area is an adult’s arm?",
    a: "Under the rule of nines, each adult arm counts as 9 percent of total body surface area. The head and neck are also 9 percent, and each leg is 18 percent.",
  },
  {
    q: "Why is creatinine clearance adjusted for BSA?",
    a: "Kidney filtration scales with body size, so results are standardized to an average adult BSA of 1.73 m² to allow fair comparisons between people.",
  },
  {
    q: "How do I convert BSA from m² to ft²?",
    a: "Multiply the value in square meters by 10.7639. For example, 1.8 m² is about 19.4 ft².",
  },
  {
    q: "Can I use this calculator for children?",
    a: "Yes, the formulas work for any height and weight, but pediatric-oriented methods such as Haycock and Boyd are generally more suitable. Always verify with a clinician for medical decisions.",
  },
  {
    q: "Is this body surface area calculator free?",
    a: "Yes, it is free to use.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
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

export default function BodySurfaceAreaCalculatorFaqSection() {
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

      <Card title="What Is Body Surface Area (BSA) and How Do You Calculate It?">
        <P>
          Body surface area (BSA) is the total external area of the human body, usually expressed in square meters (m²). Since skin is
          the body’s largest organ, BSA is essentially a measure of how much skin a person has. For most adults, it falls somewhere
          between 1.5 and 2.2 m².
        </P>
        <P>
          BSA matters because many body processes scale more closely with surface area than with weight alone. Heat loss, metabolic
          rate, blood volume, cardiac output and kidney filtration all track body size in ways that raw kilograms don’t capture well.
          Comparing a 55 kg adult and a 110 kg adult by weight alone exaggerates their differences in some measurements. Dividing by BSA
          puts them on a more comparable footing.
        </P>
        <P>
          You can’t practically measure skin area directly, so BSA is calculated from height and weight using a formula. Each formula is
          a power equation fitted to measured data. The simplest is the Mosteller formula: multiply height in centimeters by weight in
          kilograms, divide by 3,600, and take the square root. The others use more complicated exponents, which is why a calculator is
          so handy.
        </P>
      </Card>

      <Card title="Is Measuring Body Surface Area Difficult in Medicine?">
        <P>
          Yes, which is exactly why formulas exist. Measuring the true area of someone’s skin would mean wrapping the body in paper or
          tape, using a 3D body scanner, or applying geometric methods to dozens of body segments. The first approaches were developed in
          the early 1900s, and they were slow, awkward and often impractical for hospital use. Even with modern 3D scanning, direct
          measurement isn’t something a nurse or pharmacist can do at the bedside.
        </P>
        <P>
          Researchers solved this by measuring the surface area of a group of people, then finding an equation that predicted those
          results from height and weight, two numbers anyone can measure in seconds. That is how the Du Bois formula was developed in
          1916, and it is the basis of every method in this calculator. The trade-off is that each result is an estimate, not a
          measurement, which we cover in more detail in the accuracy section below.
        </P>
      </Card>

      <Card title="How Do I Calculate BSA in m² With This Calculator?">
        <P>
          The tool needs three inputs: weight, height and gender. Enter them in the fields provided, then run the calculation. Each
          formula returns its own result, and you can read it in square meters, <Link to="/tools/square-footage-calculator" className="inline-home-link">square feet</Link> and square inches.
        </P>
        <P>
          Every formula works on kilograms and centimeters. If you measure in pounds and inches, convert first: divide pounds by 2.2046
          to get kilograms, and multiply inches by 2.54 to get centimeters. Gender is used by only one formula (Schlich), but it is part
          of the form so every method can run from a single entry.
        </P>
        <List items={[
          ["m²", "is the standard in clinical practice, research papers and drug references."],
          ["ft²", "is handy for readers more familiar with imperial measurements."],
          ["in²", "gives the largest numbers, which can be useful for engineering or physical-modeling work."],
        ]} />
        <P>
          Because all eight results appear together, you can see right away whether the methods agree. For people of average build, they
          usually fall within a few hundredths of a square meter of each other.
        </P>
      </Card>

      <Card title="Body Surface Area Formulas Explained">
        <P>In the formulas below, W is weight in kilograms and H is height in centimeters. The result is in m².</P>
        <H3>Du Bois and Du Bois (1916)</H3>
        <Formula>BSA = 0.007184 × W<sup>0.425</sup> × H<sup>0.725</sup></Formula>
        <P>
          This is the oldest and most widely cited method. It was derived from only nine subjects, yet it has been a benchmark for over a
          century and underpins a great deal of published reference data. You can read the original paper on{" "}
          <Ext href="https://pubmed.ncbi.nlm.nih.gov/2520314/">PubMed</Ext>.
        </P>
        <H3>Mosteller (1987)</H3>
        <Formula>BSA = √(H × W ÷ 3600)</Formula>
        <P>
          Published in the New England Journal of Medicine as a simpler alternative, it is easy to compute by hand and tracks Du Bois
          closely in adults. Many oncology guidelines and clinical tools favor it for that simplicity. The{" "}
          <Ext href="https://pubmed.ncbi.nlm.nih.gov/3657876/">original Mosteller paper</Ext> is a single page long.
        </P>
        <H3>Haycock (1978)</H3>
        <Formula>BSA = 0.024265 × W<sup>0.5378</sup> × H<sup>0.3964</sup></Formula>
        <P>Developed from a dataset that included infants, children and adults, it is often preferred in pediatrics.</P>
        <H3>Gehan and George (1970)</H3>
        <Formula>BSA = 0.0235 × W<sup>0.51456</sup> × H<sup>0.42246</sup></Formula>
        <P>Derived mainly from children, it has historically been used in pediatric oncology dosing.</P>
        <H3>Boyd (1935)</H3>
        <Formula>BSA = 0.03330 × W<sup>(0.6157 − 0.0188 × log₁₀W)</sup> × H<sup>0.3</sup></Formula>
        <P>
          Its logarithmic weight term makes it more complex, but it was built from a broad age range and is regarded as well suited to
          children and adolescents.
        </P>
        <H3>Fujimoto (1968)</H3>
        <Formula>BSA = 0.008883 × W<sup>0.444</sup> × H<sup>0.663</sup></Formula>
        <P>Based on Japanese subjects, it is useful when working with East Asian populations.</P>
        <H3>Takahira (1925)</H3>
        <Formula>BSA = 0.007241 × W<sup>0.425</sup> × H<sup>0.725</sup></Formula>
        <P>
          Also derived from Japanese data, it has the same exponents as Du Bois with a slightly different constant, so the two results sit
          very close together.
        </P>
        <H3>Schlich (2010)</H3>
        <Formula>
          Women: BSA = 0.000975482 × W<sup>0.46</sup> × H<sup>1.08</sup><br />
          Men: BSA = 0.000579479 × W<sup>0.38</sup> × H<sup>1.24</sup>
        </Formula>
        <P>This is the only sex-specific formula in the set, designed to reflect differences in body composition between men and women.</P>
      </Card>

      <Card title="Which BSA Formula Should You Use?">
        <P>
          There is no single correct answer. Follow whichever method your protocol, institution or reference source specifies. If you are
          completing a clinical form, a trial protocol or a study that names a formula, use that one, because consistency matters more
          than theoretical precision.
        </P>
        <P>When no formula is required, these general guidelines help:</P>
        <List items={[
          ["Adults of average build:", "Du Bois and Mosteller are the most common and the easiest to compare with published data."],
          ["Children and infants:", "Haycock, Gehan and George, and Boyd were developed with younger subjects in their datasets."],
          ["East Asian populations:", "Fujimoto and Takahira were built from Japanese measurements."],
          ["Sex-specific modeling:", "Schlich accounts for gender-related differences in body composition."],
        ]} />
        <P>
          For a typical adult, the gap between Du Bois and Mosteller is only about 1 to 2 percent, which rarely changes a decision. The
          differences grow at the extremes, such as very tall, very short, very heavy or very small people. That is exactly where seeing
          several formulas together is useful.
        </P>
        <H3>Worked Example: BSA for a 70 kg, 175 cm Adult</H3>
        <P>
          Take an adult who weighs 70 kg and stands 175 cm tall. The Mosteller formula gives √(175 × 70 ÷ 3600) = √3.403, or about 1.84
          m². Du Bois gives roughly 1.85 m², and Haycock lands at about 1.85 m² as well. Converted, 1.85 m² is approximately 19.9 ft², or
          2,867 in².
        </P>
        <P>
          This level of agreement is typical. For someone with average proportions, the formulas converge within a narrow band. If your
          own results show a wider spread, your build likely sits outside the populations the equations were fitted to.
        </P>
      </Card>

      <Card title="What Is the Average Body Surface Area of an Adult?">
        <P>
          BSA depends on size, so there is no single healthy number. Commonly cited averages for adults are about 1.9 m² for men and 1.6
          m² for women, and many references use roughly 1.7 m² as a general adult figure. A newborn has a BSA of about 0.25 m², which
          rises steadily through childhood. A typical ten-year-old is in the region of 1.1 m².
        </P>
        <P>
          These are statistical averages, not targets. A tall, heavy person can have a BSA above 2.2 m², and a small adult may sit near
          1.4 m². A higher or lower BSA doesn’t point to a health problem by itself. It simply describes size.
        </P>
      </Card>

      <Card title="How Important Is Body Surface Area in Drug Dosing?">
        <P>
          For some medications, BSA is central. Certain drugs are prescribed in milligrams per square meter (mg/m²) instead of milligrams
          per kilogram. If a drug is ordered at 75 mg/m² and the patient’s BSA is 1.85 m², the dose works out to about 139 mg. Change the
          BSA and the dose changes with it.
        </P>
        <P>
          The thinking behind this is that BSA tracks blood volume, metabolic rate and organ function more closely than weight does, so a
          BSA-based dose is more likely to produce a similar drug exposure across people of different sizes. This is common with cancer
          drugs, and it also appears in some pediatric and burn-care dosing.
        </P>
        <P>
          BSA-based dosing has limits, though. It doesn’t account for liver or <Link to="/tools/gfr-calculator" className="inline-home-link">kidney function</Link>, genetics, other medications or body
          composition. For drugs with a narrow therapeutic index, where the gap between an effective dose and a toxic one is small, even a
          modest error in BSA can matter. That is why clinicians often adjust doses based on a patient’s response and lab results, and why
          a calculated BSA should be confirmed against your hospital’s protocol before anyone acts on it.
        </P>
      </Card>

      <Card title="Why Is Chemotherapy Based on Body Surface Area?">
        <P>
          Chemotherapy drugs are powerful and have little room for error. Too little drug may not control the cancer, and too much can
          cause serious side effects. In the mid-20th century, researchers noticed that drug tolerance in animals and humans lined up
          better with body surface area than with body weight. Dosing by BSA has been standard in oncology ever since.
        </P>
        <P>
          Studies have shown that BSA-based dosing produces more consistent drug levels than dosing by weight alone, though it is far from
          perfect. Patients with the same BSA can still process a drug very differently. For patients with obesity, guidance from the
          American Society of Clinical Oncology supports using full weight-based doses instead of arbitrarily capping the BSA, since
          capping can lead to underdosing. Whatever the case, the BSA you calculate should be used as your protocol directs.
        </P>
      </Card>

      <Card title="Why Are Pediatric Doses Based on Weight and Body Surface Area?">
        <P>
          Children aren’t small adults. Their organs, <Link to="/tools/body-fat-calculator" className="inline-home-link">body fat</Link>, water content and drug-processing systems change quickly as they grow, so
          a flat adult dose doesn’t work. Pediatric doses are therefore scaled to body size, either in mg/kg or in mg/m².
        </P>
        <P>
          Weight-based dosing is the most common approach for everyday medications because it is simple and easy to check. BSA-based
          dosing is more common for chemotherapy and some other specialized drugs, where matching drug exposure to the child’s physiology
          matters more. For very young infants, many protocols switch back to weight-based dosing or apply adjustments, because their
          kidneys and liver handle drugs differently from older children. The right method depends on the drug, and pediatric dosing
          should always follow the product label or a pediatric pharmacist’s guidance.
        </P>
        <H3>What Does “an Infant’s Body Surface Area Is Greater Than an Adult’s Relative to Weight” Mean?</H3>
        <P>
          It means that an infant has far more skin per pound or kilogram of body weight than an adult does. Using the 70 kg adult from
          the example above, the BSA is about 1.85 m², which is roughly 0.026 m² per kilogram. A newborn weighing about 3.5 kg with a BSA
          of 0.25 m² has roughly 0.07 m² per kilogram, nearly three times more.
        </P>
        <P>
          This has real consequences. Infants lose heat and water through their skin much faster than adults, so they get cold easily and
          dehydrate quickly. Their metabolic rate per kilogram is also higher. These factors are why surface area plays such a large role
          in newborn care, fluid management and pediatric dosing.
        </P>
      </Card>

      <Card title="What Is the Relationship Between BSA and Metabolic Rate?">
        <P>
          The body produces heat as a byproduct of metabolism and loses much of it through the skin, so a larger surface area generally
          goes along with a higher energy requirement. This is one reason BSA has been used to estimate metabolic size.
        </P>
        <P>
          Strictly speaking, metabolic rate is driven more by <Link to="/tools/lean-body-mass-calculator" className="inline-home-link">fat-free mass</Link>, meaning everything except body fat, such as muscle, organs,
          bone and blood. Fat tissue is far less metabolically active. BSA correlates reasonably well with fat-free mass, which is why it
          works as a practical stand-in. It isn’t a perfect one. Two people with the same BSA can have different metabolic rates depending
          on muscle mass, age and sex.
        </P>
      </Card>

      <Card title="Why Is Creatinine Clearance Expressed in Terms of Body Surface Area?">
        <P>
          Creatinine clearance and estimated glomerular filtration rate (eGFR) measure how well the kidneys filter blood. Kidney size and
          filtering capacity scale with body size, so a large person naturally filters more blood per minute than a small one. To compare
          people fairly, results are standardized to an average adult BSA of 1.73 m². A reported eGFR of 90 mL/min/1.73 m² means the
          kidneys perform at that level for someone of average size.
        </P>
        <P>
          The adjustment has a downside for drug dosing. A person with a BSA much larger or smaller than 1.73 m² has a different actual
          filtration rate than the indexed number suggests. Clinicians sometimes “de-index” the result by multiplying it by BSA ÷ 1.73 to
          get the person’s true rate before adjusting a dose. This is one of the most common reasons nurses and pharmacists calculate BSA
          outside of oncology.
        </P>
      </Card>

      <Card title="What Is the Difference Between Body Surface Area and Body Mass Index?">
        <P>
          Both use height and weight, but they answer different questions. <Link to="/tools/bmi-calculator" className="inline-home-link">BMI</Link> (weight in kilograms divided by height in meters squared)
          is a screening tool that places a person in a weight category such as underweight, healthy weight, overweight or obese. BSA
          estimates the area of the skin, and clinicians use it to scale doses, standardize organ measurements and compare physiological
          values across people.
        </P>
        <P>
          BMI says something general about weight status, while BSA says nothing about whether a weight is healthy. Neither distinguishes
          muscle from fat. A muscular athlete can have a high BMI and a high BSA without carrying excess fat, so both numbers should be
          read with that in mind.
        </P>
      </Card>

      <Card title="What Is the Rule of Nines for Body Surface Area?">
        <P>
          The rule of nines is a quick method for estimating how much of the body is burned. It divides an adult’s body surface into
          sections that are each about 9 percent, or a multiple of 9, of the total:
        </P>
        <List items={[
          ["Head and neck:", "9%"],
          ["Each arm:", "9%"],
          ["Front of the torso:", "18%"],
          ["Back of the torso:", "18%"],
          ["Each leg:", "18%"],
          ["Genital area:", "1%"],
        ]} />
        <P>
          So according to the rule of nines, an adult’s arm represents 9 percent of body surface area. Emergency staff use these
          percentages to estimate burn size and guide fluid replacement. Another quick check is the palm method, where the patient’s palm,
          including the fingers, is roughly 1 percent.
        </P>
        <P>
          The rule is less accurate for children, whose heads are proportionally larger and legs smaller, so pediatric teams use charts
          such as Lund-Browder. It is also less reliable for people with obesity. The calculator’s BSA result can help turn that
          percentage into an actual area. If a patient has a BSA of 1.85 m² and 20 percent is burned, that is about 0.37 m². It does not
          replace a clinical burn assessment.
        </P>
      </Card>

      <Card title="Other Reasons You Might Need a BSA Calculator">
        <P>Beyond the topics above, a few other practical situations come up often:</P>
        <List items={[
          ["Cardiac measurements.", "Cardiac output, stroke volume and valve areas are indexed to BSA so results can be compared across patients of different sizes. Cardiac index, for example, is cardiac output divided by BSA."],
          ["Research and education.", "Medical and nursing students use a BSA calculator to check manual work, and researchers use BSA to standardize measurements such as organ size or metabolic rate."],
          ["Comparing formulas.", "If you are reviewing a study or protocol, running the same height and weight through all eight formulas shows how much your choice of method could change the result."],
        ]} />
      </Card>

      <Card title="Understanding the Units: m², ft² and in²">
        <P>
          Square meters are the international standard, and almost every dosing guideline and journal article uses them. The calculator
          also converts to the other two units using exact factors: 1 m² equals 10.7639 ft² and 1,550.0031 in². Showing all three saves
          you from switching to a conversion tool, which helps when a source quotes imperial values or when you are working on a physical
          model, such as a heat-transfer or clothing-sizing calculation.
        </P>
      </Card>

      <Card title="How Accurate Are Body Surface Area Calculations?">
        <P>
          Every BSA equation is an estimate. None measures your true skin area. They predict it from two inputs, so the result is only as
          accurate as the weight and height you enter. Measure both carefully, ideally in light clothing and without shoes.
        </P>
        <P>For most adults of average build, the eight formulas agree closely, and the error compared with a 3D scan is small. Accuracy gets worse in certain situations:</P>
        <List items={[
          ["", "The formulas were fitted to specific groups, and the original Du Bois dataset was very small."],
          ["", "Accuracy can drop in people with severe obesity, very low body weight, amputations or unusual body proportions."],
          ["", "Standard formulas don’t account for muscle mass versus fat mass."],
          ["", "Children’s proportions change rapidly, so pediatric-specific formulas are preferable when your protocol allows."],
        ]} />
        <P>
          For people at the extremes of height and weight, clinicians sometimes consider other measures, such as lean body mass, alongside
          BSA. Even so, BSA-based dosing has proven more consistent than weight alone for many drugs, which is why it remains in use.
        </P>
        <P>
          This tool provides calculations for information and education. It is not a medical device and should never replace a
          clinician’s judgment or a hospital’s verified dosing process. If a result will influence treatment, confirm it with a qualified
          professional and your local protocol.
        </P>
      </Card>

      <Card title="Free, Simple and Built for Privacy">
        <P>
          The Tolz body surface area calculator is free to use, with no payment step and no hidden charges. The calculation requires only
          three inputs: weight, height and gender. It does not ask for your name, date of birth, medical record number or any other
          identifying detail. Running all eight formulas in one place also means you don’t have to retype your figures into several
          separate calculators, which saves time and reduces transcription errors.
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
