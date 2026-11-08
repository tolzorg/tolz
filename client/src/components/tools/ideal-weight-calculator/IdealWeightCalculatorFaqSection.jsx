import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the most accurate ideal weight formula?",
    a: "None is the most accurate across the board, because each was designed for a different purpose. Devine is the most commonly used in clinical settings, while Robinson and Miller adjust for tall and short people. The best approach is to compare all four with your healthy BMI range, as this calculator does.",
  },
  {
    q: "How do I calculate my ideal weight by height?",
    a: "Take your height in inches above five feet and apply a formula. With Devine, a man adds 2.3 kg per inch to a 50 kg base, and a woman adds 2.3 kg per inch to 45.5 kg. The calculator does this for four formulas at once.",
  },
  {
    q: "What is a healthy weight range for my height?",
    a: "A healthy adult weight is the weight at which your BMI falls between 18.5 and 24.9. For a person 170 cm tall, that’s roughly 53.5 to 72 kg.",
  },
  {
    q: "Is ideal body weight the same as healthy BMI weight?",
    a: "No. Ideal body weight formulas return a single estimate, while the BMI approach gives a range. They often overlap, which is why both are shown together.",
  },
  {
    q: "How is ideal weight calculated for children?",
    a: "Children aged 2 to 20 are assessed with BMI-for-age percentiles instead of adult formulas. A BMI between the 5th and 85th percentile for the child’s age and sex is generally considered a healthy weight.",
  },
  {
    q: "Is the ideal weight different for men and women?",
    a: "Yes. All four formulas use different baselines for men and women, reflecting average differences in body composition.",
  },
  {
    q: "Does the ideal weight calculator work for athletes or bodybuilders?",
    a: "It can be used, but the results may be misleading. Muscle raises body weight without adding health risk, so BMI-based ranges often classify muscular people as overweight.",
  },
  {
    q: "Does age affect ideal weight?",
    a: "The four adult formulas don’t include age. For children and teens, age is central because BMI is read against age-based percentiles. For older adults, a doctor can advise on whether a slightly higher weight suits you.",
  },
  {
    q: "Can I use this calculator in kilograms and pounds?",
    a: "Yes. You can enter measurements in metric or imperial units.",
  },
  {
    q: "Is this ideal weight calculator free, and do I need to sign up?",
    a: "It’s free to use. Check the live tool page for current details on accounts and data handling.",
  },
];

// The supplied FAQ schema matches the displayed FAQ word for word, with
// straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const MEN_HEADERS = ["Height", "Devine formula (men)", "Healthy BMI range"];
const MEN_ROWS = [
  ["5'0\" (152 cm)", "110 lb (50 kg)", "95–127 lb (43–58 kg)"],
  ["5'2\" (157 cm)", "120 lb (55 kg)", "101–136 lb (46–62 kg)"],
  ["5'4\" (163 cm)", "131 lb (59 kg)", "108–145 lb (49–66 kg)"],
  ["5'6\" (168 cm)", "141 lb (64 kg)", "115–154 lb (52–70 kg)"],
  ["5'8\" (173 cm)", "151 lb (68 kg)", "122–164 lb (55–74 kg)"],
  ["5'10\" (178 cm)", "161 lb (73 kg)", "129–174 lb (59–79 kg)"],
  ["6'0\" (183 cm)", "171 lb (78 kg)", "136–184 lb (62–83 kg)"],
  ["6'2\" (188 cm)", "181 lb (82 kg)", "144–194 lb (65–88 kg)"],
  ["6'4\" (193 cm)", "191 lb (87 kg)", "152–204 lb (69–93 kg)"],
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
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
/** An outside source, opened in a new tab so this page stays open. */
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const FDA = "https://www.fda.gov/";
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const List = ({ items, ordered }) => {
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
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {cell}
                </td>
              ))}
            </tr>
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

export default function IdealWeightCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
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

      <Card title="How Does One Determine One’s Ideal Weight?">
        <P>
          There’s no single test that spits out your perfect weight. What works in real life is stacking a few different
          measurements and seeing where they overlap. That overlap is your realistic zone.
        </P>
        <H3>Start With the Formulas and the BMI Range</H3>
        <P>
          The four ideal body weight (IBW) formulas each give you one number based on height and sex. The healthy BMI range gives
          you a band instead. Put them side by side and you’ll usually see the formula results sitting somewhere in the middle of
          that band. That’s your starting estimate.
        </P>
        <H3>Add Waist Size and Body Composition</H3>
        <P>
          BMI can’t tell muscle from fat, and it can’t tell where the fat sits. Belly fat is the kind doctors worry about most. As a
          rule of thumb, a waist measurement over 40 inches for men or 35 inches for women is linked to higher health risk,
          according to the <Ext href="https://www.nhlbi.nih.gov/health/educational/lose_wt/risk.htm">National Institutes of Health</Ext>. Another quick check is waist-to-height ratio. If your waist is less than
          half your height, you’re generally in good shape on that front.
        </P>
        <H3>Check How You Feel and What Your Labs Say</H3>
        <P>
          Numbers on a screen are only part of it. Blood pressure, fasting glucose or A1C, cholesterol, energy levels and sleep tell
          you a lot about whether your current weight is working for you. Two people at the same height and weight can have very
          different lab results. If you haven’t had bloodwork in a while, that’s often a more useful data point than any formula.
        </P>
      </Card>

      <Card title="How Do You Know Your Body Has Found Its Ideal Weight?">
        <P>
          Your body doesn’t send a notification. But it does give you clues, and they’re more reliable than a number on the scale.
          You’ve probably landed in a good spot if:
        </P>
        <List items={[
          ["", "Your weight stays within a few pounds for months without you white-knuckling it"],
          ["", "You’ve got steady energy through the day and you sleep decently"],
          ["", "Your blood pressure, blood sugar and cholesterol are in normal ranges"],
          ["", "Your periods are regular (if that applies to you), and your hormones aren’t off"],
          ["", "You can eat a normal variety of food without obsessing over every bite"],
          ["", "Your joints don’t ache more than they should and you can climb stairs or play with your kids without getting winded"],
          ["", "Your mood is stable and you’re not constantly thinking about food or the scale"],
        ]} />
        <P>
          One trap to avoid: your ideal weight isn’t the lowest number you’ve ever hit. Plenty of people crash down to a weight they
          could only hold by barely eating, then call that their goal. If you can’t maintain it comfortably, it isn’t ideal for
          you, no matter what the formula says.
        </P>
      </Card>

      <Card title="How Can I Find Out the Ideal Weight for My Height and Age?">
        <P>
          For adults, height and sex do most of the work. Enter them into the calculator above and you’ll get four formula
          estimates plus the healthy BMI range in both kilograms and pounds. Age barely changes the math once you’re past your
          growing years, though it does change how you should read the result.
        </P>
        <P>
          For kids and teens, age is the whole game. A BMI that’s fine for a 25-year-old can be way off for a 10-year-old, so the
          calculator switches to BMI-for-age percentiles for anyone from 2 to 20. We’ll cover that in its own section further down.
        </P>
        <P>
          For older adults, it’s worth knowing that people shrink. Men lose roughly an inch and a half in height by age 70 and women
          closer to two inches, which nudges BMI up even when weight hasn’t changed. Muscle also tends to drop with age while fat
          creeps up, so the same weight can mean a different body. Many doctors are fine with older patients sitting toward the
          upper part of the healthy range, because losing weight without trying later in life can signal a health problem. If
          you’re 65 or older, use the result as a conversation starter with your doctor, not a hard target.
        </P>
      </Card>

      <Card title="Ideal Weight for a Man at Different Heights">
        <P>
          This is one of the most searched questions around this topic, so here’s a quick reference. The Devine column is the
          single formula figure, and the BMI column shows the full healthy range (BMI 18.5 to 24.9) for each height.
        </P>
        <DataTable headers={MEN_HEADERS} rows={MEN_ROWS} />
        <P>
          Notice how wide the BMI range gets as men get taller. A 6'2" guy has about 50 pounds of wiggle room inside the “healthy”
          band. That’s why a single formula number shouldn’t be treated like a finish line. For women, or to see the Robinson,
          Miller and Hamwi results at your exact height, just use the calculator at the top of the page.
        </P>
      </Card>

      <Card title="What Is the Ideal Weight for Having Six Pack Abs?">
        <P>
          Here’s the thing: there isn’t one. Abs show up based on body fat percentage, not body weight. Two men can both be 5'10"
          and 175 pounds, and one has a visible six pack while the other doesn’t, because they carry different amounts of muscle
          and fat.
        </P>
        <P>
          As a rough guide, most men start seeing a clear ab definition somewhere around 10 to 14 percent body fat. For women it’s
          usually around 16 to 20 percent, though some women need to go lower and some can show abs a bit higher. Genetics matter
          too. Some people store fat around the midsection and need to get leaner than others before the abs pop.
        </P>
        <P>
          So what weight does that translate to? Take a 5'10" man with an average build. At around 12 percent body fat, he might
          weigh somewhere in the 155 to 170 pound range, depending on how much muscle he’s carrying. Someone with more muscle could
          weigh 180 and still be lean enough. The formula weight for that height is about 161 pounds, so it’s close, but it’s a
          coincidence of averages, not a rule.
        </P>
        <P>
          If abs are your goal, track body fat (a smart scale, skinfold calipers or a DEXA scan if you want accuracy), waist
          measurements and progress photos, along with weight. Building the muscle underneath helps as much as dropping fat on top.
          And be honest with yourself about sustainability. Single-digit body fat for men and very low body fat for women can mess
          with hormones, sleep and mood, and it’s not a place most people can stay long term.
        </P>
      </Card>

      <Card title="How Much Should I Weigh? The Real Story Behind Ideal Body Weight">
        <P>
          Most people have tried to lose weight at some point, or know someone who has. A lot of that comes from the idea of an
          “ideal” weight that we absorb from social media, TV, movies and magazines. It’s easy to assume ideal body weight was
          invented to describe what looks good. It wasn’t. IBW formulas were created to help doctors estimate drug dosages, and they
          have nothing to do with appearance. Researchers found that how the body handles certain medications tracks closer with
          ideal body weight than with total body weight, so the formulas stuck around in hospitals and pharmacies. They’re also used
          in sports, since many sports group athletes by weight class.
        </P>
        <P>
          IBW isn’t a perfect measure, and it’s worth being upfront about that. It doesn’t account for how much of your body is
          muscle versus fat. A fit, healthy athlete can land in the “overweight” zone and be in great shape. Going the other way,
          someone can be right on their ideal weight and still have poor fitness or metabolic health. Being over or under your IBW
          doesn’t automatically mean you’re unhealthy.
        </P>
        <P>
          The bigger point is that how much a person should weigh isn’t an exact science. No measurement, whether IBW, BMI or
          anything else, can say for sure what weight is healthy for you. They’re reference points. Regular exercise, a varied diet
          built on mostly unprocessed food, enough sleep and manageable stress will do more for your health than chasing a specific
          number from a formula.
        </P>
      </Card>

      <Card title="What Affects Your Ideal Weight?">
        <P>Several things push your ideal weight up or down. These are the big ones.</P>
        <H3>Age</H3>
        <P>
          Once you’re done growing, age shouldn’t change your ideal weight much. Most girls stop growing around 14 to 15, and most
          boys around 16 to 17. After that, the number doesn’t need to change, but your body does. Lean muscle mass slowly declines
          with age and it gets easier to pick up extra body fat. That’s a natural process. You can slow it down with decent eating
          habits, strength training, good sleep and stress management, but it’s worth knowing it’s happening.
        </P>
        <H3>Gender</H3>
        <P>
          Women generally weigh less than men even though they naturally carry a higher percentage of body fat. Men tend to have
          more muscle, and muscle is denser than fat. Men also usually have higher bone density and tend to be taller. That’s why
          every IBW formula uses a different starting point for men and women.
        </P>
        <H3>Height</H3>
        <P>
          Taller people have more muscle, more bone and more fat, so they weigh more. As a general guide, a man at the same height
          as a woman will weigh about 10 to 20 percent more.
        </P>
        <H3>Body Frame Size</H3>
        <P>
          Frame size is the factor most calculators skip, and it can make a real difference. People are usually grouped as small,
          medium or large boned, and the quick way to figure out which you are is by measuring the wrist. Wrap a tape measure around
          the narrowest part of your wrist and compare it to these ranges.
        </P>
        <P><strong>For women:</strong></P>
        <List items={[
          ["Under 5'2\":", "small boned is a wrist under 5.5\", medium is 5.5\" to 5.75\", large is over 5.75\""],
          ["5'2\" to 5'5\":", "small is under 6\", medium is 6\" to 6.25\", large is over 6.25\""],
          ["Over 5'5\":", "small is under 6.25\", medium is 6.25\" to 6.5\", large is over 6.5\""],
        ]} />
        <P><strong>For men (over 5'5"):</strong></P>
        <List items={[
          ["", "Small boned is a wrist of 5.5\" to 6.5\""],
          ["", "Medium is 6.5\" to 7.5\""],
          ["", "Large is over 7.5\""],
        ]} />
        <P>
          A large-framed person will naturally weigh more than a small-framed one at the same height. If you’re large boned, aiming
          for the top half of your healthy range is perfectly reasonable. If you’re small boned, the bottom half may feel more
          natural.
        </P>
        <H3>Other Factors</H3>
        <P>
          Health conditions, where your body stores fat, family history, and muscle mass all play a part too. Pregnancy, thyroid
          problems, fluid retention and certain medications can throw off any formula. Some health organizations also suggest lower
          BMI cut-offs for certain populations, including people of South Asian descent, because health risks can show up at lower
          BMI values.
        </P>
      </Card>

      <Card title="The Four Ideal Body Weight Formulas Explained">
        <P>
          All four formulas follow the same pattern. Each one starts with a base weight for someone who’s 5 feet tall, then adds a
          set number of kilograms for every inch above that. They differ because the researchers behind them used different data
          and had different goals.
        </P>
        <P>
          For example, a 5'10" man using the Devine formula adds 2.3 kg for each of his 10 extra inches (23 kg) to a base of 50 kg.
          That gives 73 kg, or about 161 pounds.
        </P>
        <P>The Devine formula is the most widely used of the four.</P>
        <H3>Hamwi Formula (1964)</H3>
        <P>The oldest of the group. G. J. Hamwi built it for medical dosing, and it was also used in diabetes and dietetics work.</P>
        <Formula>
          Men: 48 kg + 2.7 kg per inch over 5 feet<br />
          Women: 45.5 kg + 2.2 kg per inch over 5 feet
        </Formula>
        <P>It adds the most weight per inch, so tall men tend to see the highest numbers here.</P>
        <H3>Devine Formula (1974)</H3>
        <P>
          B. J. Devine published his version in 1974, also for drug dosing based on height and weight. Over time it became the
          go-to formula for ideal body weight.
        </P>
        <Formula>
          Men: 50 kg + 2.3 kg per inch over 5 feet<br />
          Women: 45.5 kg + 2.3 kg per inch over 5 feet
        </Formula>
        <H3>Robinson Formula (1983)</H3>
        <P>J. D. Robinson tweaked the Devine formula in 1983.</P>
        <Formula>
          Men: 52 kg + 1.9 kg per inch over 5 feet<br />
          Women: 49 kg + 1.7 kg per inch over 5 feet
        </Formula>
        <P>Because it adds less weight per inch, it runs lower than Devine for taller people.</P>
        <H3>Miller Formula (1983)</H3>
        <P>D. R. Miller also modified Devine’s numbers the same year, with a higher starting weight and a gentler slope.</P>
        <Formula>
          Men: 56.2 kg + 1.41 kg per inch over 5 feet<br />
          Women: 53.1 kg + 1.36 kg per inch over 5 feet
        </Formula>
        <P>For shorter adults it often gives the highest result of the four, and for taller adults the lowest.</P>
        <H3>A Worked Example: Why the Results Differ</H3>
        <P>Take a man who’s 5'10" (178 cm). He’s 10 inches over the 5-foot baseline:</P>
        <List items={[
          ["Devine:", "50 + 23 = 73 kg"],
          ["Robinson:", "52 + 19 = 71 kg"],
          ["Miller:", "56.2 + 14.1 = about 70.3 kg"],
          ["Hamwi:", "48 + 27 = 75 kg"],
        ]} />
        <P>
          That’s nearly a 5 kg spread for the same guy, and none of the answers are wrong. Now take a woman who’s 5'6" (168 cm), 6
          inches over the baseline:
        </P>
        <List items={[
          ["Devine:", "45.5 + 13.8 = about 59.3 kg"],
          ["Robinson:", "49 + 10.2 = about 59.2 kg"],
          ["Miller:", "53.1 + 8.2 = about 61.3 kg"],
          ["Hamwi:", "45.5 + 13.2 = about 58.7 kg"],
        ]} />
        <P>
          Here the four land within about 2.5 kg of each other. The calculator does all of this instantly in metric or imperial, so
          you don’t have to do the math by hand.
        </P>
      </Card>

      <Card title="Ideal Weight vs. Healthy BMI Range">
        <P>
          BMI is your weight in kilograms divided by your height in meters squared. The World Health Organization treats 18.5 up to
          (but not including) 25 as the healthy adult range for both men and women, which is why you’ll see it written as 18.5 to
          24.9. Work backward from those two limits using your height and you get the lowest and highest weights that fall in that
          band.
        </P>
        <P>
          For the 5'10" man above, BMI 18.5 works out to about 58.5 kg and BMI 24.9 to about 78.7 kg. All four formula results sit
          comfortably inside that window. That’s the main reason the calculator shows both. The formulas give you a central
          estimate, and the BMI range shows how much room around it is still considered healthy.
        </P>
        <P>
          BMI is a quick screening tool doctors use to flag possible problems. Generally, the higher the BMI, the greater the chance
          of conditions like type 2 diabetes, heart disease and high blood pressure, and it’s the standard way of classifying
          obesity levels. The <Ext href="https://www.cdc.gov/bmi/about/index.html">CDC explains how BMI is used and where it falls short</Ext>. The short version: it can’t separate muscle
          from fat, it ignores where fat is stored, and it doesn’t factor in age, ethnicity or fitness. Treat it as a screening
          number, not a diagnosis.
        </P>
      </Card>

      <Card title="Ideal Weight for Children and Teens (Ages 2 to 20)">
        <P>
          Adult formulas don’t apply to growing bodies, so for ages 2 to 20 the calculator uses BMI-for-age percentiles. These
          compare a child’s BMI to other children of the same age and sex. On the CDC growth charts, a healthy weight falls from the
          5th percentile up to (but not including) the 85th. You can read more in the <Ext href="https://www.cdc.gov/bmi/child-teen-calculator/index.html">CDC’s guide to BMI for children and teens</Ext>.
        </P>
        <P>
          This matters because a BMI that’s normal for an adult can be underweight for a 12-year-old, and vice versa. Kids’ weight
          also jumps around with growth spurts, so one reading says very little about the trend. Pediatricians usually look at a
          growth curve over several visits instead of one measurement. If the tool puts your child outside the healthy range, take
          it as a reason to ask the pediatrician, not as a reason to put a child on a diet. Restricting food for kids without
          medical guidance can backfire.
        </P>
      </Card>

      <Card title="How to Use the Ideal Weight Calculator">
        <P>It takes under a minute:</P>
        <List ordered items={[
          ["", "Pick your sex and enter your age. Age decides whether the adult formulas or the child percentile method is used."],
          ["", "Enter your height in centimeters or feet and inches."],
          ["", "Add your current weight if you want it compared with the results."],
          ["", "Read the four formula estimates and the healthy BMI range together."],
        ]} />
        <P>
          For the cleanest numbers, measure your height without shoes against a flat wall, and weigh yourself in the morning,
          before eating, in similar clothes each time.
        </P>
      </Card>

      <Card title="When You Might Need an Ideal Weight Calculator">
        <P>People reach for ideal body weight estimates for all kinds of reasons:</P>
        <List items={[
          ["Starting or reassessing a weight plan.", "A realistic range beats an arbitrary number from a friend or a magazine."],
          ["Sanity-checking a goal.", "If a target sits way below the bottom of your BMI range, talk to a doctor before chasing it."],
          ["Prepping for a medical or dietitian visit.", "IBW is used in nutrition planning and drug dosing, so knowing your numbers helps you follow along."],
          ["Watching a child’s growth.", "Parents can see where their kid’s BMI falls between checkups."],
          ["Coursework or research.", "Nutrition, nursing and pharmacy students often need to compare the formulas side by side."],
          ["Fitness and weight-class sports.", "Athletes use the range as a loose reference, keeping in mind that muscle changes the picture."],
        ]} />
      </Card>

      <Card title="How Long Does It Take to Actually See Weight Loss?">
        <P>
          The scale usually moves first, and it moves fast. In the first week or two, most people drop a few pounds, but a good
          chunk of that is water and stored carbohydrate (glycogen), not fat. After that, a steady pace is about 1 to 2 pounds a
          week, which is what the <Ext href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html">CDC recommends</Ext> for most adults. Faster isn’t better. People who lose weight slowly are more likely
          to keep it off.
        </P>
        <P>
          Seeing it in the mirror or in how your clothes fit takes longer. Plan on about 4 to 6 weeks before other people notice,
          and 8 to 12 weeks before the change feels obvious to you. Energy, sleep and blood pressure often improve before any of
          that shows up, sometimes after losing just 5 percent of your body weight. Weigh in at the same time of day, look at the
          weekly average instead of daily swings, and don’t panic over a flat week. Water retention, salty meals and hormonal shifts
          can hide fat loss for days.
        </P>
      </Card>

      <Card title="How Could You Calculate How to Maintain Your Ideal Weight?">
        <P>Maintenance comes down to matching the calories you eat with the calories you burn. Here’s a simple way to estimate it.</P>
        <H3>Step 1: Estimate Your Resting Calorie Burn</H3>
        <P>
          The Mifflin-St Jeor equation is one of the most commonly used. Use your weight in kilograms, height in centimeters and age
          in years:
        </P>
        <Formula>
          Men: (10 × weight) + (6.25 × height) − (5 × age) + 5<br />
          Women: (10 × weight) + (6.25 × height) − (5 × age) − 161
        </Formula>
        <P>A 35-year-old woman who’s 5'6" (168 cm) and 160 pounds (72.6 kg) works out to about 1,440 calories a day at rest.</P>
        <H3>Step 2: Multiply by Your Activity Level</H3>
        <List items={[
          ["Mostly sitting:", "× 1.2"],
          ["Light exercise 1 to 3 days a week:", "× 1.375"],
          ["Moderate exercise 3 to 5 days a week:", "× 1.55"],
          ["Hard exercise most days:", "× 1.725"],
        ]} />
        <P>
          For that same woman, a desk job plus a few workouts a week lands her around 2,000 calories a day to hold her weight.
          That’s your starting estimate for maintenance.
        </P>
        <H3>Step 3: Test It in Real Life</H3>
        <P>
          Every formula is a guess. Eat around that number for two to three weeks, track your average weight, and adjust. If you’re
          slowly gaining, trim about 100 to 150 calories a day. If you’re losing without trying, add a little. Real-world data beats
          any equation.
        </P>
      </Card>

      <Card title="Maintaining Your Ideal Weight Is the Logical Consequence of What?">
        <P>
          It’s the logical result of habits you can actually live with. Not a crash diet, not a 12-week challenge, but the everyday
          way you eat, move and sleep once the “program” is over. If the plan you used to lose weight is something you’d never keep
          doing, the weight tends to come back, because the plan was the only thing holding it down. Think of your ideal weight as
          the byproduct of a lifestyle, not a prize you win and then stop working for.
        </P>
      </Card>

      <Card title="What Are Some of the Best Ways to Maintain Your Weight?">
        <P>None of this is exciting, but it works.</P>
        <List items={[
          ["Weigh yourself regularly.", "Once a week, or even a few times a week, catches a 3-pound creep before it becomes 15."],
          ["Keep eating enough protein and fiber.", "They keep you full, and protein helps protect muscle."],
          ["Lift weights twice a week.", "Muscle burns more energy than fat at rest and keeps your body composition in check as you age."],
          ["Walk a lot.", "Daily steps do more for maintenance than most people expect."],
          ["Sleep seven hours or more.", "Short sleep raises hunger hormones and makes junk food more tempting. The CDC lists seven or more hours as the target for adults."],
          ["Plan for the weekend and holidays.", "Eating well 80 to 90 percent of the time leaves room for the rest."],
          ["Set a “red line.”", "Pick a weight a few pounds above your comfort zone, and when you hit it, tighten things up right away."],
        ]} />
      </Card>

      <Card title="How Do People at a Healthy Weight Maintain It?">
        <P>
          Most people who stay at a healthy weight aren’t doing anything dramatic. The best data comes from the National Weight
          Control Registry, which follows thousands of people who’ve lost at least 30 pounds and kept it off for a year or more. A
          few patterns show up again and again: they eat breakfast, they weigh themselves often, they stay active (many get close
          to an hour of movement a day), they keep their eating pattern pretty consistent on weekends, and they catch small regains
          early.
        </P>
        <P>
          They also don’t treat food as the enemy. People who cope well long term tend to eat mostly whole foods without cutting out
          everything they enjoy. They plan meals, they cook at home more than most, and they don’t beat themselves up over a bad
          day. One slip doesn’t wreck a year. Giving up after the slip does.
        </P>
      </Card>

      <Card title="What Are the Best Ways to Lose Weight?">
        <P>
          The boring answer is the right one: eat a bit fewer calories than you burn, and do it in a way you can keep up.
          Everything else is a tool for making that easier.
        </P>
        <H3>What Is the Most Effective Weight Loss Method or Program?</H3>
        <P>
          The programs with the strongest evidence share a few things: a moderate calorie deficit, regular physical activity,
          ongoing behavioral support, and a way to track progress. The CDC’s National Diabetes Prevention Program is a good example.
          In the research behind it, people who lost 5 to 7 percent of their body weight and got about 150 minutes of activity a
          week cut their risk of developing type 2 diabetes by 58 percent. No special foods or gadgets were involved. Pick whatever
          approach (Mediterranean, higher protein, lower carb, plain calorie counting) you can stick with, because adherence matters
          more than which diet you choose.
        </P>
        <H3>What Is the Most Natural Way to Lose Weight?</H3>
        <P>
          Build your meals around whole foods: vegetables, fruit, beans, whole grains, eggs, fish, poultry and some nuts. Walk
          daily. Lift something heavy a couple of times a week. Get your sleep. Cut back on alcohol and sugary drinks. That’s it.
          The <Ext href="https://www.dietaryguidelines.gov/">Dietary Guidelines for Americans</Ext> lay out the same basics, and there’s no supplement or hack that beats them.
        </P>
        <H3>Which Food Habit Should I Start to Reduce My Weight?</H3>
        <P>
          If you only pick one, stop drinking your calories. Soda, sweet coffee drinks, juice and energy drinks can add 300 to 500
          calories a day without making you feel any fuller. Swapping them for water, sparkling water or unsweetened coffee and tea
          is the easiest cut most people can make.
        </P>
        <P>
          If you want a second habit, build every meal around protein and a vegetable first. That alone takes care of a lot of
          overeating. And slow down. It takes about 20 minutes for fullness signals to kick in, so eating fast gives you plenty of
          time to go back for seconds.
        </P>
      </Card>

      <Card title="Why Am I Not Losing Weight on a Keto Diet?">
        <P>Keto works for some people, but it’s not magic, and plenty of folks stall. The usual culprits are pretty consistent.</P>
        <List items={[
          ["You’re still eating too many calories.", "Cheese, nuts, creamy sauces, butter in the coffee and oils are all very calorie-dense. Keto cuts hunger for many people, but if you eat more fat than you need, you won’t lose fat."],
          ["Hidden carbs are kicking you out of ketosis.", "Sauces, sweeteners, “keto” snacks, and larger-than-expected portions of low-carb veggies add up fast."],
          ["Portion creep.", "After a few weeks, people stop measuring and start eyeballing, and the eyeballing gets generous."],
          ["Not enough protein.", "Too little protein can cost you muscle and leave you hungrier."],
          ["Alcohol and “keto treats.”", "Keto-labeled bars and desserts still have calories."],
          ["Sleep and stress.", "Poor sleep and high stress can raise hunger and make it harder to stick to the plan."],
          ["Water weight masking fat loss.", "If your measurements and clothes are changing, you may be losing fat even when the scale sits still."],
          ["Medications and medical issues.", "Thyroid problems, PCOS, insulin resistance and some prescription drugs (certain antidepressants, steroids and others) can slow loss."],
        ]} />
        <P>
          Give it a clean three to four weeks of weighing and measuring food before you decide it isn’t working. If you’re doing
          everything right and still stuck, bring it up with your doctor.
        </P>
      </Card>

      <Card title="Which Food Is Good at Night for Weight Loss?">
        <P>
          No food burns fat while you sleep, so don’t believe the late-night snack lists that say otherwise. What matters is your
          total calories for the day. That said, if you’re genuinely hungry at night, a small, protein-forward snack of around 150
          to 200 calories is a smart move.
        </P>
        <List items={[
          ["", "Plain Greek yogurt with berries"],
          ["", "Cottage cheese with a few slices of fruit"],
          ["", "A hard-boiled egg or two"],
          ["", "A small handful of nuts (measure it, because it’s easy to overdo)"],
          ["", "An apple or banana with a spoonful of peanut butter"],
          ["", "Air-popped popcorn"],
        ]} />
        <P>
          Skip the chips, ice cream and anything you’d eat straight from the bag. Eating in front of the TV makes it easy to blow
          through hundreds of extra calories without noticing. A lot of people do better by deciding on a “kitchen closed” time,
          then having a planned snack before it if needed.
        </P>
      </Card>

      <Card title="If You Don’t Eat for Two Days, How Much Weight Will You Lose?">
        <P>
          On the scale, usually somewhere around 2 to 5 pounds. But most of that isn’t fat. When you stop eating, your body burns
          through stored glycogen, and each gram of glycogen is stored with a few grams of water. That’s a few pounds of water that
          comes right back when you eat and drink normally again.
        </P>
        <P>
          The fat piece is much smaller. If you burn around 2,000 calories a day, two full days without food is a deficit of about
          4,000 calories. Using the rough rule of 3,500 calories per pound of fat, that’s a little over a pound of actual fat, and
          probably less once your body adapts and slows down a bit. It’s a lot of suffering for about a pound.
        </P>
      </Card>

      <Card title="How Quickly Will Weight Fall Off If You Stop Eating Completely?">
        <P>
          Fast at first, then slower, and with growing risks. Beyond the first couple of days, your body starts breaking down muscle
          along with fat, your metabolism slows, and you’ll deal with dizziness, headaches, fatigue, low blood pressure and
          electrolyte problems. Rapid weight loss also raises the risk of gallstones. Going without food is dangerous for people
          with diabetes (especially those on insulin or similar medications), pregnant women, kids and teens, and anyone with a
          history of disordered eating. Long periods of starvation followed by normal eating can also cause a dangerous shift in
          electrolytes called refeeding syndrome.
        </P>
        <P>
          In short: it’s not a safe way to lose weight, and the weight you lose tends to come back, often with extra. If you like
          the idea of fasting, shorter eating windows (such as 12 to 14 hours overnight) are far gentler and can work as a way of
          controlling calories. If you’re restricting food out of fear of eating, or you binge and then restrict, that may be an
          eating disorder, and help is available. The <Ext href="https://www.allianceforeatingdisorders.com/">National Alliance for Eating Disorders</Ext> runs a helpline and referral service.
        </P>
      </Card>

      <Card title="What Are Some of the Best Supplements to Lose Extra Body Weight?">
        <P>
          Honestly, the best supplement is a bit of a letdown: nothing on the shelf has strong evidence for big, lasting fat loss.
          The NIH’s Office of Dietary Supplements has reviewed the research and concluded that most weight-loss supplements show
          little to no meaningful effect, and some carry real risks. Here’s where the common ones stand.
        </P>
        <List items={[
          ["Fiber (glucomannan, psyllium):", "May help you feel full and can lead to small losses, about a pound or two over several weeks in some studies. Take with plenty of water."],
          ["Caffeine and green tea extract:", "A very small bump in calorie burn. Concentrated green tea extract has been linked to liver injury in rare cases, so be careful with high doses."],
          ["Protein powder:", "Not a fat burner, but it’s a handy way to hit protein targets and stay full."],
          ["Probiotics, CLA, garcinia, raspberry ketones, “fat burners”:", "Weak or inconsistent evidence at best."],
          ["Orlistat (60 mg, sold over the counter):", "One of the few that has real data behind it, but the effect is modest and it can cause oily stools and gas."],
        ]} />
        <P>
          Be extra careful with anything marketed as a “miracle” or sold online with before-and-after photos. The <Ext href={FDA}>FDA</Ext> has repeatedly
          found <Ext href="https://www.fda.gov/drugs/medication-health-fraud/tainted-weight-loss-products">tainted weight loss products</Ext> that contained hidden prescription drugs not listed on the label. Check the{" "}
          <Ext href="https://ods.od.nih.gov/factsheets/WeightLoss-HealthProfessional/">NIH fact sheet on weight loss supplements</Ext> before buying anything, and tell your doctor what you’re taking.
        </P>
      </Card>

      <Card title="Do Weight Loss Supplements Help You Lose Weight?">
        <P>
          A little, at best. Most supplements shave off less than a few pounds beyond what diet and exercise already do, and the
          results usually fade. Many studies are small, short or funded by the company selling the product. The honest takeaway: if
          a supplement seems to be working for someone, it’s probably because they started paying more attention to what they eat.
          If you do want to try one, pick products with third-party testing (look for USP or NSF marks), keep the dose within the
          label, and stop if you get heart palpitations, stomach trouble or anything else that feels off.
        </P>
      </Card>

      <Card title="What Are the Best Weight Loss Drugs and Medicines?">
        <P>
          This is the area that’s changed the most in the last few years. Prescription medications for obesity are now far more
          effective than they used to be, and they’re worth a serious conversation with a doctor if you’ve got a BMI of 30 or
          higher, or 27 or higher along with a weight-related condition like high blood pressure, type 2 diabetes or sleep apnea.
        </P>
        <List items={[
          ["Semaglutide (Wegovy) and tirzepatide (Zepbound)", "are the leading options. In clinical trials, semaglutide led to an average loss of around 15 percent of body weight and tirzepatide at the highest dose to around 20 percent over about a year and a half. They work by mimicking gut hormones that reduce appetite and slow digestion."],
          ["Liraglutide (Saxenda)", "is an older injectable in the same family, with smaller average results."],
          ["Phentermine, naltrexone-bupropion (Contrave) and orlistat (Xenical)", "are other approved options, usually with more modest results."],
        ]} />
        <P>
          A few honest caveats. Nausea, vomiting, diarrhea and constipation are common, especially when the dose goes up. Rare but
          serious problems include gallbladder disease and pancreatitis. Muscle loss can come along with the fat loss, so protein and
          strength training matter. Most people regain a large share of the weight if they stop the drug without changing anything
          else. These drugs also aren’t for use during pregnancy. Be cautious about “compounded” or online versions that haven’t
          gone through FDA review, and know that approvals, supply and insurance coverage keep changing, so check the <Ext href={FDA}>FDA</Ext> and the{" "}
          <Ext href="https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity">NIDDK’s overview of prescription weight loss medications</Ext> for current information. A doctor can tell you whether you’re a
          candidate and what to expect.
        </P>
      </Card>

      <Card title="How Much Weight Can You Lose With Meal Replacement Shakes?">
        <P>
          In studies, people using meal replacements for one or two meals a day usually lose a few extra pounds compared with people
          following a standard diet on their own. The reason isn’t that the shakes are special. They take the guesswork and
          willpower out of two meals, so calories are easy to count and hard to blow. Supervised programs that use them for most or
          all meals under medical care have produced larger losses, but those are run by doctors and aren’t the same as grabbing a
          shake at the store.
        </P>
        <P>
          If you want to try them, look for a shake with 15 to 25 grams of protein, some fiber, and not much added sugar. Don’t live
          on them forever, since most people eventually need to transition back to real food, and that’s where weight often
          returns. Pairing them with real meals that include vegetables and lean protein works better than replacing everything.
        </P>
      </Card>

      <Card title="Is Kolors a Good Choice for Weight Loss Treatment?">
        <P>
          We couldn’t find solid, independent research or regulatory documentation on a weight loss program or treatment under that
          name, so we can’t tell you it works. Rather than guess, here’s how to judge any weight loss treatment or program you come
          across:
        </P>
        <List items={[
          ["", "Look for published studies on the actual product, not just the ingredients."],
          ["", "Check whether a licensed clinician is involved, especially if it includes prescription medicine."],
          ["", "Be wary of promises like “lose 20 pounds in a week” or “no diet or exercise.”"],
          ["", <>Check for FDA approval or clearance if it’s a drug or medical device, and search the <Ext href={FDA}>FDA</Ext>’s warnings list.</>],
          ["", "Read the refund and subscription terms before paying."],
          ["", "Talk to your doctor first, particularly if you have a medical condition or take medication."],
        ]} />
        <P>If you tell us more about what the treatment involves, it’s easier to say whether the claims hold up.</P>
      </Card>

      <Card title="Free, Private and Accurate">
        <P>
          The calculator is free to use, and the calculation runs on the height, sex and age values you enter. Nothing about it
          requires a paid plan. The arithmetic follows the published formulas exactly, and the BMI range uses the standard WHO adult
          categories and CDC percentile method for ages 2 to 20, so the numbers match what you’d get working them out yourself.
        </P>
        <P>
          One limit applies to any online tool like this: the output is general information, not medical advice. It doesn’t replace
          a conversation with a healthcare professional, especially if you’ve got a medical condition, are pregnant, take medication
          that affects your weight, or are checking a child’s weight.
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
