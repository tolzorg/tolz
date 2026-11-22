import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much protein do I need per day?",
    a: "Most healthy adults need at least 0.8 g of protein per kg of body weight, which is about 56 grams for a 70 kg person. Active people, older adults, and those trying to build muscle often need 1.2 to 2.0 g/kg. The protein calculator adjusts for your profile.",
  },
  {
    q: "How do I calculate my protein intake based on weight?",
    a: "Divide your weight in pounds by 2.2 to get kilograms, then multiply by a factor between 0.8 and 2.0, depending on your activity and goals. For example, 75 kg × 1.4 = 105 grams per day.",
  },
  {
    q: "How much protein should I eat to build muscle?",
    a: "Aim for about 1.6 g/kg of body weight per day. Research shows little extra benefit above that for most people, though some lifters go up to 2.0 g/kg during hard training or while cutting calories.",
  },
  {
    q: "Do I need protein shakes to build muscle?",
    a: "No. Shakes are a convenient way to reach your target, but whole foods work just as well. If you hit your daily number from meals, a shake adds nothing special.",
  },
  {
    q: "Can vegans get enough protein?",
    a: "Yes. Soy foods, lentils, beans, seitan, quinoa, nuts, and seeds can easily cover a vegan’s needs. Many vegans aim for about 10 percent above their calculated target to account for digestibility.",
  },
  {
    q: "Is 0.8 g/kg of protein enough?",
    a: "It is enough to prevent deficiency in healthy, sedentary adults. It may fall short for people who train regularly, are losing weight, are recovering from injury, or are over 65.",
  },
  {
    q: "How much protein should I eat to lose weight?",
    a: "Many people aim for 1.2 to 1.6 g/kg while in a calorie deficit. Higher protein helps preserve muscle and keeps you fuller, which makes the deficit easier to maintain.",
  },
  {
    q: "Is whey protein safe?",
    a: "For most healthy adults, yes. Some people get gas or bloating, especially if they are lactose intolerant. There is no solid evidence that whey causes cancer or harms healthy kidneys. Choose a product that has been tested by a third party.",
  },
  {
    q: "Is the protein calculator free to use?",
    a: "Yes. It is free, and you can get your result without creating an account.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const RDA_HEADERS = ["Age group", "Protein (grams per day)"];
const RDA_ROWS = [
  ["1–3 years", "13"],
  ["4–8 years", "19"],
  ["9–13 years", "34"],
  ["14–18 years (girls)", "46"],
  ["14–18 years (boys)", "52"],
  ["Adult women (19+)", "46"],
  ["Adult men (19+)", "56"],
];
const FOOD_HEADERS = ["Food", "Serving", "Protein (approx.)"];
const FOOD_ROWS = [
  ["Egg", "1 large", "6 g"],
  ["Milk", "1 cup (8 oz)", "8 g"],
  ["Milk", "1 liter", "33 g"],
  ["Chicken breast, cooked", "3.5 oz (100 g)", "31 g"],
  ["Lean beef, cooked", "3.5 oz (100 g)", "26 g"],
  ["Beef, raw lean", "1 kg", "about 200 g"],
  ["Mutton or lamb, raw", "1 kg", "about 170–200 g"],
  ["Tuna, canned", "3.5 oz (100 g)", "25 g"],
  ["Shrimp, cooked", "3.5 oz (100 g)", "24 g"],
  ["Greek yogurt, plain", "6 oz (170 g)", "17 g"],
  ["Cottage cheese", "1 cup", "25 g"],
  ["Lentils, cooked", "1 cup", "18 g"],
  ["Tofu, firm", "3.5 oz (100 g)", "10–17 g"],
  ["Bread", "1 slice", "3–4 g"],
  ["Rice, cooked", "1 cup", "4–5 g"],
  ["Peanut butter", "2 tbsp", "7–8 g"],
  ["Pizza", "1 slice", "12 g"],
];
const SEED_HEADERS = ["Seed", "Serving", "Protein (approx.)"];
const SEED_ROWS = [
  ["Hemp seeds", "3 tbsp (30 g)", "9–10 g"],
  ["Pumpkin seeds", "1 oz (28 g)", "8–9 g"],
  ["Sunflower seeds", "1 oz (28 g)", "5–6 g"],
  ["Flaxseed", "1 oz (28 g)", "5 g"],
  ["Sesame seeds", "1 oz (28 g)", "5 g"],
  ["Chia seeds", "1 oz (28 g)", "4–5 g"],
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

export default function ProteinCalculatorFaqSection() {
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

      <Card title="What Is Protein and Why Does Your Body Need It?">
        <P>
          Protein is one of the three <Link to="/tools/macro-calculator" className="inline-home-link">macronutrients</Link>, along with <Link to="/tools/carbohydrate-calculator" className="inline-home-link">carbohydrates</Link> and fat. Like carbs, it provides 4 calories per gram,
          but its main job is not energy. Protein is the material your body uses to build and repair itself.
        </P>
        <P>
          Every protein is a chain of amino acids. There are 20 amino acids in all, and the order they appear in decides what the
          protein looks like and what it does. Your body can make 11 of them. The other nine are called essential amino acids,
          because you can only get them from food.
        </P>
        <P>Proteins do far more than build muscle. They have several jobs:</P>
        <List items={[
          ["Structure:", "Muscle, skin, hair, nails, bones, and connective tissue are all built largely from protein."],
          ["Enzymes:", "These proteins speed up the chemical reactions behind digestion, energy production, and cell repair."],
          ["Messengers:", "Hormones such as insulin are proteins that carry signals between organs and tissues."],
          ["Defense:", "Antibodies attach to viruses and bacteria so the immune system can remove them."],
          ["Transport and storage:", "Hemoglobin moves oxygen through your blood, and other proteins carry fats, vitamins, and minerals."],
          ["Fluid balance:", "Proteins in the blood help keep fluid inside the right compartments."],
        ]} />
        <P>
          Your body does not keep a large reserve of protein the way it stores fat, so you need a steady supply every day. That is the
          reason a protein calculator is useful: it gives you a daily target in grams instead of leaving you to guess.
        </P>
      </Card>

      <Card title="How the Protein Calculator Works">
        <P>
          The protein calculator asks for five details: age, gender, height, weight, and activity level. Each one has a job. Weight
          sets the foundation, because protein needs scale with body mass. Age shifts the target, since children, adults, and older
          adults are advised different amounts. Gender and height help estimate how much energy your body uses, which matters because
          the percentage-based guidelines apply to your daily calories. Activity level then raises or lowers the estimate depending on
          how much you train or move.
        </P>
        <P>
          Because the standards behind the tool are expressed as ranges, treat your result as a target zone, not one exact figure. A
          daily protein calculator gives you a sensible starting point that you can fine-tune over a few weeks based on your appetite,
          performance, and how you feel.
        </P>
      </Card>

      <Card title="Protein Guidelines Behind Your Result: ADA, CDC, and WHO">
        <P>A protein intake calculator is only as reliable as the standards underneath it. This one draws on three respected sources.</P>
        <P>
          The American Dietetic Association, now called the Academy of Nutrition and Dietetics, supports individualized protein
          targets, with higher amounts for athletes and people building muscle. The CDC refers to the Acceptable Macronutrient
          Distribution Range, which places protein at 10 to 35 percent of daily calories for adults. Since protein supplies 4 calories
          per gram, a 2,000-calorie diet works out to roughly 50 to 175 grams. The World Health Organization sets a safe intake of
          about 0.83 grams per kilogram of body weight for adults, which sits close to the 0.8 g/kg Recommended Dietary Allowance
          (RDA) used in the United States.
        </P>
        <P>
          These sources agree on the floor and differ on the ceiling, which is why your protein calculator result may show a spread.
          The low end protects against deficiency. The higher end suits people with larger energy needs or demanding training goals.
        </P>
      </Card>

      <Card title="How Much Protein Do You Need Per Day?">
        <P>
          For most healthy adults who do little structured exercise, the baseline is about 0.8 grams per kilogram of body weight, or
          0.36 grams per pound. A 70 kg (154 lb) person lands near 56 grams a day. That amount prevents deficiency, but it is not
          necessarily the best amount for performance, recovery, or healthy aging.
        </P>
        <P>
          Moderately active adults often do better between 1.0 and 1.4 g/kg. People who lift weights or train for endurance events
          typically fall in the 1.2 to 2.0 g/kg range supported by sports nutrition position statements. Older adults are commonly
          advised 1.0 to 1.2 g/kg to help slow age-related muscle loss. A good daily protein calculator reflects these tiers instead
          of applying one number to everyone, which is why entering an honest activity level changes your result so much.
        </P>
        <P>
          Your daily needs depend on three main things: how much energy you take in, whether you are still growing, and how active you
          are. It is also not an exact science. If you have a medical condition or a specific performance goal, a registered dietitian
          or doctor can help you fine-tune the number.
        </P>
        <H3>Recommended Protein Intake by Age</H3>
        <P>The table below shows the U.S. RDA for protein by age group. These figures are minimums for healthy people, not upper limits.</P>
        <DataTable headers={RDA_HEADERS} rows={RDA_ROWS} />
      </Card>

      <Card title="Calculating Protein Per Kg and Per Pound by Hand">
        <P>
          Want to check the math yourself? Convert your weight to kilograms by dividing pounds by 2.2, then multiply by the factor
          that fits your lifestyle. An 80 kg person with a mostly sedentary routine needs about 80 × 0.8 = 64 grams. The same person
          lifting weights four days a week at 1.6 g/kg needs 80 × 1.6 = 128 grams.
        </P>
        <P>
          The percentage method gives a wider picture. On a 2,400-calorie diet, 10 to 35 percent equals 240 to 840 calories from
          protein, or 60 to 210 grams. The gap looks large, but it is intentional. The percentage range describes what is acceptable,
          while the per-kilogram figure describes what your body mass actually requires. The protein calculator by weight and calories
          shows both so you can see where a sensible target sits.
        </P>
      </Card>

      <Card title="Protein Needs by Goal">
        <H3>Protein Calculator for Weight Loss</H3>
        <P>
          When calories drop, the body can burn muscle along with fat. Keeping protein toward the upper half of your range, often 1.2
          to 1.6 g/kg, helps preserve lean mass. Protein also keeps you fuller between meals than carbs or fat do, and your body uses
          more energy to digest it. That is why a higher-protein diet often makes a <Link to="/tools/calorie-tracker" className="inline-home-link">calorie deficit</Link> easier to stick with. It is the
          most common reason people look for a protein calculator for weight loss.
        </P>
        <H3>Protein Calculator for Muscle Gain</H3>
        <P>
          If your goal is gaining muscle, use the higher end of your calculated range and track your progress over several weeks. The
          next section explains how much protein muscle growth really needs and what to do with it.
        </P>
        <H3>Endurance and General Fitness</H3>
        <P>
          Runners, cyclists, and swimmers usually need around 1.2 to 1.6 g/kg to repair tissue and recover from long sessions. For
          general health and maintenance, the lower-middle part of your range is enough. More protein is not automatically better.
        </P>
      </Card>

      <Card title="The Role of Protein in Building Muscle">
        <P>
          Strength training causes tiny tears in muscle fibers. During recovery, your body uses amino acids from food to repair those
          fibers and make them slightly bigger and stronger. Without enough protein, that repair slows down, no matter how hard you
          train.
        </P>
        <H3>How Much Protein Do You Need to Optimize Muscle Growth?</H3>
        <P>
          A large review of 49 studies, published in the British Journal of Sports Medicine, found that{" "}
          <Ext href="https://pubmed.ncbi.nlm.nih.gov/28698222/">protein intake above about 1.6 g/kg per day produced no further gains in fat-free mass</Ext>{" "}
          in people doing resistance training. For most lifters, that means 1.6 g/kg is a strong target. Some people go up to 2.0
          g/kg or slightly higher when they are training hard or eating fewer calories, but the extra benefit is small.
        </P>
        <P>
          How you spread protein throughout the day also matters. Most people get the best response from 20 to 40 grams per meal,
          spread across three to five meals.
        </P>
        <H3>Can You Build Muscle Without Protein Supplements?</H3>
        <P>
          Yes. Supplements are a convenience, not a requirement. Muscle responds to total protein, training, sleep, and enough
          calories. If you can reach your target with eggs, dairy, meat, fish, beans, tofu, and grains, a powder adds nothing special.
          Supplements help mainly when your schedule or appetite makes whole foods hard to manage.
        </P>
        <H3>Can You Build Muscle Without Eating a Lot of Protein?</H3>
        <P>
          Beginners can gain some muscle on a modest intake, especially if they were not training before. But gains come slower and
          stall sooner when protein is too low. Aim to at least reach the middle of your calculated range if building muscle is your
          goal.
        </P>
        <H3>Are Protein Shakes Necessary for Muscle Gain?</H3>
        <P>
          No. A shake is just a quick, portable source of protein. If you already hit your daily number from food, a shake will not
          give you extra muscle. If you struggle to reach it, a shake can close the gap.
        </P>
        <H3>Can Incomplete Protein Build Muscle?</H3>
        <P>
          Yes. Plant proteins such as beans, lentils, nuts, and grains each run low in one or more essential amino acids, but eating a
          mix of them over the day covers everything your body needs. Plant proteins are also a little lower in leucine, an amino acid
          that helps trigger muscle growth, so plant-based lifters often aim for the higher end of their range.
        </P>
        <H3>Should You Drink Protein Shakes Before or After a Workout?</H3>
        <P>
          Total daily protein matters far more than the exact timing. Having 20 to 40 grams within a couple of hours before or after
          training works well. If you train first thing in the morning without eating, a shake or meal afterward is a good idea.
          Otherwise, choose whichever fits your routine.
        </P>
      </Card>

      <Card title="Which Is the Best Protein Food?">
        <P>
          No single food wins every category. The best protein foods are the ones that give you plenty of protein per serving, contain
          all the essential amino acids, and fit your budget and taste. Eggs, fish, poultry, lean meat, dairy, and soy all do that
          well. Beans, lentils, and whole grains add fiber and nutrients that animal foods lack, so a mix works better than relying on
          any one source.
        </P>
        <H3>Protein in Common Foods</H3>
        <DataTable headers={FOOD_HEADERS} rows={FOOD_ROWS} />
        <P>Values vary by brand and cooking method.</P>
        <H3>Complete vs. Incomplete Proteins</H3>
        <P>
          A complete protein contains good amounts of all nine essential amino acids. Meat, poultry, fish, eggs, and dairy are
          complete. Soy, quinoa, and buckwheat are complete plant foods. Most other plant foods, including nuts, seeds, grains, and
          legumes, are incomplete on their own. That is not a problem. If you eat a variety of them through the day, such as beans
          with rice or hummus with pita, you get everything you need.
        </P>
      </Card>

      <Card title="High-Protein Vegetarian Foods and Meat-Free Options">
        <P>Foods that are not meat but still rich in protein include:</P>
        <List items={[
          ["Dairy and eggs:", "Greek yogurt, cottage cheese, milk, paneer (about 18 g per 100 g), and eggs."],
          ["Soy foods:", "Tofu, tempeh (about 19 g per 100 g), and edamame (about 18 g per cooked cup)."],
          ["Legumes:", "Lentils, chickpeas, black beans, and kidney beans, at roughly 14 to 18 g per cooked cup."],
          ["Grains:", "Quinoa (about 8 g per cooked cup), oats, and buckwheat."],
          ["Nuts and nut butters:", "Peanuts, almonds, and peanut butter."],
          ["Seitan:", "Made from wheat gluten, with about 25 g per 100 g. It is not suitable for anyone with celiac disease or gluten sensitivity."],
        ]} />
        <P>
          For vegetarians, the best plant-based sources are soy foods, lentils, beans, and dairy. Pair them with whole grains and you
          will cover your amino acids with ease.
        </P>
      </Card>

      <Card title="How Do Vegans Get Enough Protein?">
        <P>
          Vegans get protein from soy foods, legumes, seitan, grains, nuts, and seeds. A vegan diet can easily meet a protein target if
          you plan your meals around those foods. A typical day might include tofu scramble at breakfast, lentil soup or a bean bowl at
          lunch, tempeh with quinoa at dinner, and nuts or hummus for snacks.
        </P>
        <H3>How Hard Is It to Get Enough Protein on a Vegan Diet?</H3>
        <P>
          It takes some planning, but it is not hard. Plant foods usually carry less protein per serving than meat and dairy, and some
          plant proteins are a bit harder to digest. Because of this, many vegans aim for about 10 percent more than their calculated
          target, and they build at least one protein-rich food into every meal.
        </P>
        <H3>How Do Vegan Bodybuilders Get Enough Protein?</H3>
        <P>
          Vegan lifters follow the same principles as everyone else: 1.6 to 2.0 g/kg of body weight, spread over four or five meals.
          They rely heavily on tofu, tempeh, seitan, lentils, and soy milk, and many add a pea, rice, or soy protein powder to hit
          their number. Use the protein calculator to set the target, then track your meals for a couple of weeks to see whether you
          are reaching it.
        </P>
      </Card>

      <Card title="Which Seeds Are the Best Source of Protein?">
        <P>
          Seeds are a good source of protein, but they are also calorie-dense, so they work best as an addition to meals. Hemp seeds
          come out on top. Pumpkin seeds are a close second, followed by sunflower, flax, sesame, and chia.
        </P>
        <DataTable headers={SEED_HEADERS} rows={SEED_ROWS} />
      </Card>

      <Card title="Is There Protein in Vegetables, Fruit, and Pulses?">
        <H3>Which Vegetable Has the Most Protein?</H3>
        <P>
          Vegetables contain protein, but most have only a few grams per serving. The leader is edamame, which are young soybeans, at
          about 18 grams per cooked cup. Green peas come next with 8 to 9 grams per cup. Spinach, broccoli, Brussels sprouts, and
          asparagus each give about 4 to 5 grams per cooked cup. They won’t carry your daily total, but they add up.
        </P>
        <H3>Which Fruit Is Highest in Protein?</H3>
        <P>
          Fruit is a poor protein source overall. Guava is one of the best, with about 4 grams per cup. Avocado, technically a fruit,
          has about 3 to 4 grams, and jackfruit has about 3 grams per cup. Most other fruits, including berries, oranges, and bananas,
          supply 1 to 2 grams. Look to other foods for your protein and enjoy fruit for its vitamins and fiber.
        </P>
        <H3>How Much Protein Is in Pulses?</H3>
        <P>
          Pulses such as lentils, chickpeas, split peas, and beans are among the most affordable plant proteins. A cooked cup gives
          roughly 14 to 18 grams, along with plenty of fiber, iron, and potassium.
        </P>
      </Card>

      <Card title="High-Protein Breakfast Foods">
        <P>
          Many people eat most of their protein at dinner. Moving some of it to the morning makes it easier to spread your intake. Good
          options include:
        </P>
        <List items={[
          ["Eggs:", "Two large eggs give about 12 grams."],
          ["Greek yogurt:", "About 17 grams in a 6-ounce cup, and more in some brands."],
          ["Cottage cheese:", "About 12 grams per half cup."],
          ["Peanut butter toast:", "Two slices with 2 tablespoons of peanut butter give about 15 grams."],
          ["Tofu scramble:", "About 15 to 20 grams per serving."],
          ["Oatmeal made with milk and nuts:", "About 12 to 15 grams."],
          ["A smoothie with milk, yogurt, or protein powder:", "Often 20 grams or more."],
        ]} />
      </Card>

      <Card title="The Cheapest Ways to Get 100 Grams of Protein">
        <P>
          Getting enough protein does not have to be expensive. The best budget sources are eggs, dried lentils and beans, canned tuna,
          chicken thighs, milk, oats, peanut butter, and plain yogurt sold in large tubs. Tofu is also inexpensive in most stores.
        </P>
        <P>Here is an example of a day that adds up to about 100 grams:</P>
        <List items={[
          ["Breakfast:", "Three eggs (18 g) and oatmeal made with milk (13 g), for about 31 grams."],
          ["Lunch:", "A cup of cooked lentils (18 g) with rice (5 g), for about 23 grams."],
          ["Snack:", "Peanut butter on two slices of bread, for about 15 grams."],
          ["Dinner:", "Four ounces of cooked chicken (30 g) with vegetables (5 g), for about 35 grams."],
        ]} />
      </Card>

      <Card title="High-Protein Foods With the Fewest Calories">
        <P>
          If you are watching calories, choose lean sources. Skinless chicken or turkey breast, white fish like cod, shrimp, canned
          tuna in water, egg whites, nonfat Greek yogurt, low-fat cottage cheese, and extra-firm tofu all deliver a lot of protein for
          relatively few calories. Three ounces of cod, for example, has about 20 grams of protein and around 90 calories.
        </P>
      </Card>

      <Card title="Protein Powders and Supplements">
        <H3>What Is Whey Protein?</H3>
        <P>
          Whey is a protein that comes from milk. It is the liquid left over when milk is turned into cheese. It is a complete protein
          that digests quickly and is rich in leucine, which is why it is so popular. Whey comes in three main forms: concentrate (the
          least processed, with a little lactose and fat), isolate (filtered further, with very little lactose), and hydrolysate
          (partly broken down for faster digestion). One scoop usually provides 20 to 25 grams of protein.
        </P>
        <H3>What Is the Best Protein Powder?</H3>
        <P>
          The best powder depends on your needs. Whey isolate suits most people, especially if dairy bothers you a little. Casein
          digests more slowly and is often used before bed. Plant blends, such as pea and rice or soy, work for vegans and anyone
          avoiding dairy. Whichever you choose, look for a label that lists protein per scoop, has little added sugar, and carries a
          third-party testing seal such as NSF Certified for Sport or Informed Choice. If you are a beginner, a basic whey concentrate
          or isolate is a good place to start.
        </P>
        <H3>Are Protein Powders Safe?</H3>
        <P>
          For most healthy adults, yes, when used as a supplement to a balanced diet. The main risk is quality. Supplements are not
          approved by the FDA before they are sold, and independent tests have found heavy metals in some products. Choosing a brand
          with third-party testing lowers that risk.
        </P>
        <H3>What Are the Side Effects of Whey Protein?</H3>
        <P>
          Most side effects are mild and digestive: gas, bloating, cramps, or loose stools, especially in people who are lactose
          intolerant. Switching to whey isolate or a plant-based powder often solves this. Some people notice more acne. A milk allergy
          is a different matter, and anyone with one should avoid whey completely.
        </P>
        <H3>Does Whey Protein Cause Cancer?</H3>
        <P>
          No solid evidence shows that whey protein causes cancer in people. Claims you may see online usually come from animal studies
          or from misreading general research on high-fat diets. If you have a personal or family history of cancer, or any health
          condition, talk with your doctor before starting supplements.
        </P>
        <H3>Does Whey Protein Affect the Kidneys?</H3>
        <P>
          In people with healthy kidneys, studies have not shown that higher protein intake from food or whey causes kidney damage.
          People who already have kidney disease are different. They often need to limit protein and should follow their doctor’s
          advice.
        </P>
        <H3>Is It Bad to Have Three Protein Shakes a Day?</H3>
        <P>
          It is not harmful for most healthy people, but it is usually unnecessary. Three shakes can supply 60 to 75 grams of protein.
          If that fits your calculated target and you still eat real meals, it’s fine. If shakes replace food, you may miss fiber,
          vitamins, and minerals.
        </P>
        <H3>Mass Gainer or Whey Protein for Skinny People?</H3>
        <P>
          A mass gainer is mostly carbohydrates with some protein, and it is high in calories. It can help people who struggle to eat
          enough. Whey gives you protein without many extra calories. If your main problem is eating enough overall, a mass gainer can
          help. If you simply need more protein, whey is the better pick. You can also make a calorie-dense shake at home with milk,
          oats, peanut butter, and a banana.
        </P>
        <H3>Are Homemade Protein Powders Beneficial?</H3>
        <P>
          They can be. A homemade mix has no artificial flavors, sweeteners, or additives, and you control every ingredient. The
          downside is that it holds less protein per scoop than commercial powder, and it is not lab-tested. Because it contains nuts
          and seeds, store it in a cool, dry place and use it within a few weeks.
        </P>
        <H3>How to Make Homemade Protein Powder With Simple Ingredients</H3>
        <P>Combine these in a blender or food processor until you have a fine powder:</P>
        <List items={[
          ["", "1 cup rolled oats"],
          ["", "1 cup nonfat dry milk powder"],
          ["", "½ cup almonds"],
          ["", "¼ cup hemp seeds"],
          ["Optional:", "1 to 2 tablespoons cocoa powder and a pinch of cinnamon"],
        ]} />
        <P>
          This makes about 2 cups with roughly 60 grams of protein in total, so a one-third cup serving gives about 10 grams. Blend it
          into milk, yogurt, or oatmeal. Vegans can swap the milk powder for pea protein or soy flour.
        </P>
        <H3>What Are the Benefits of Protein Bars?</H3>
        <P>
          Protein bars are handy when you are traveling or short on time. A good one has 10 to 20 grams of protein, little added sugar,
          and a short ingredient list. Many bars are closer to candy bars with added protein, so check the label.
        </P>
      </Card>

      <Card title="What Happens When You Eat a Lot of Protein?">
        <H3>How Much Protein Can the Body Absorb in a Day?</H3>
        <P>
          Your body absorbs nearly all the protein you eat. Digestion starts in the stomach, where acid and enzymes begin breaking
          protein into smaller pieces, and finishes in the small intestine. The idea that your body can only use 30 grams at a time is
          a common myth. What is true is that muscle repair responds best to about 20 to 40 grams per meal, and extra protein beyond
          what you need is used for energy or stored as fat.
        </P>
        <H3>Are There Negative Effects From Eating Too Much Protein?</H3>
        <P>
          Healthy adults tolerate intakes at the upper end of the acceptable range well. Problems tend to show up with very high
          intakes, such as digestive discomfort, extra thirst, and less room for fiber-rich foods. High-protein diets built on red and
          processed meat can also bring in more saturated fat and sodium. People with kidney or liver disease may need limits and
          should follow medical advice instead of a general calculator.
        </P>
        <H3>How Do You Know You Have Protein Deficiency?</H3>
        <P>
          True deficiency is rare in people who eat enough calories, but it can happen with restrictive diets, illness, or poor
          appetite. Signs include constant fatigue, muscle loss, swelling (especially in the legs, feet, and hands), thinning hair,
          brittle nails, slow wound healing, getting sick often, and feeling hungry all the time. If you notice several of these, see a
          doctor instead of guessing.
        </P>
      </Card>

      <Card title="How Age, Gender, and Body Size Change Your Protein Requirement">
        <P>
          Growing bodies need more protein per kilogram than adults. In the United States, the RDA is about 0.95 g/kg for children aged
          4 to 13 and 0.85 g/kg for teenagers aged 14 to 18. Adult men generally carry more lean mass, so their absolute daily figure is
          usually higher than that of women with the same activity level, even when the per-kilogram factor is identical. Taller,
          heavier people have more tissue to maintain.
        </P>
        <P>
          Pregnancy and breastfeeding raise requirements. The World Health Organization suggests adding about 1 gram a day in the first
          trimester, 10 grams in the second, and 31 grams in the third. During breastfeeding, it recommends an extra 19 grams a day in
          the first six months and 13 grams after that. People in these situations should treat any online estimate as a starting
          point and confirm it with a midwife, doctor, or registered dietitian. The same applies to adults over 65, who benefit from
          the higher end of the range and from evenly spaced meals.
        </P>
      </Card>

      <Card title="When and Why You Would Use a Protein Calculator">
        <P>People reach for a protein calculator at very different moments, and the practical value is similar in each.</P>
        <P>
          A new gym member wants to know whether the powder in the cupboard is even necessary. Someone cutting calories needs to protect
          muscle while the scale moves. A vegetarian or vegan planning meals wants proof that plant foods can cover the target. An adult
          child helping a parent in their seventies checks whether meals provide enough to support strength and mobility. A parent of a
          teenage athlete wants a figure that respects growth. And anyone recovering from illness or low appetite may want a benchmark
          to discuss with their doctor or dietitian.
        </P>
        <P>
          In every case, the benefit is the same: replacing guesswork with a number grounded in published guidelines, so your meal
          planning, shopping, and supplement decisions rest on something concrete.
        </P>
      </Card>

      <Card title="Free, Private, and Reliable: What to Expect From This Tool">
        <P>
          The Tolz protein calculator is free to use, with no hidden charges and no signup step before you see your result. It asks
          only for the five details the calculation needs, and it does not ask for your name, email address, or any other identifying
          information.
        </P>
        <P>
          On accuracy, the tool applies established ADA, CDC, and WHO guidance to the numbers you enter, so the output is only as good
          as the input. Use your current weight, be honest about your activity level, and recalculate after a significant change in
          either. The results are educational estimates and not medical advice. If your goals or health conditions are complex, use the
          result as a starting point for a conversation with a qualified professional.
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
