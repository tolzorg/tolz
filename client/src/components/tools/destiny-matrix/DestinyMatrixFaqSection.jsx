import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a Destiny Matrix calculator?",
    a: "It’s a tool that takes your date of birth and builds a numerology-based chart. The chart maps numbers to life areas like personality, relationships, money, and talents.",
  },
  {
    q: "Is the Destiny Matrix Calculator free?",
    a: "Yes. It’s completely free, with no signup, no hidden fees, and no limit on how many charts you can generate.",
  },
  {
    q: "Do I need my birth time?",
    a: "No. You only need the day, month, and year. Birth time and place aren’t part of the calculation.",
  },
  {
    q: "How accurate is a Destiny Matrix reading?",
    a: "The numbers are calculated consistently using a fixed method. How well the descriptions fit your life is subjective, like other numerology and self-reflection tools.",
  },
  {
    q: "Can I calculate a chart for someone else?",
    a: "Yes. You can do it for a partner, friend, child, or anyone else if you have their date of birth.",
  },
  {
    q: "What is the karmic tail?",
    a: "It’s the position in the chart believed to show a recurring pattern or lesson that keeps appearing in your life in different forms.",
  },
  {
    q: "What’s the difference between a Destiny Matrix and a life path number?",
    a: "A life path number is a single digit from your birth date. The Destiny Matrix calculates several connected positions to build a fuller chart.",
  },
  {
    q: "Is the Destiny Matrix a prediction of my future?",
    a: "No. It describes tendencies and themes, not fixed events. What you do with them is up to you.",
  },
];

const ARCANA = [
  [1, "Magician", "initiative, skill, starting things"],
  [2, "High Priestess", "intuition, privacy, inner knowing"],
  [3, "Empress", "creativity, care, abundance"],
  [4, "Emperor", "structure, authority, stability"],
  [5, "Hierophant", "tradition, teaching, guidance"],
  [6, "Lovers", "choice, attraction, values"],
  [7, "Chariot", "drive, movement, control"],
  [8, "Justice", "fairness, cause and effect, responsibility"],
  [9, "Hermit", "solitude, wisdom, reflection"],
  [10, "Wheel of Fortune", "cycles, luck, change"],
  [11, "Strength", "courage, patience, self-control"],
  [12, "Hanged Man", "surrender, a new point of view"],
  [13, "Death", "endings, transformation, clearing out"],
  [14, "Temperance", "balance, patience, moderation"],
  [15, "Devil", "attachment, temptation, material pull"],
  [16, "Tower", "sudden change, breakdown of what isn’t solid"],
  [17, "Star", "hope, healing, renewal"],
  [18, "Moon", "intuition, illusion, fear, the unclear"],
  [19, "Sun", "joy, success, vitality"],
  [20, "Judgement", "awakening, calling, a turning point"],
  [21, "World", "completion, achievement, wholeness"],
  [22, "Fool", "new beginnings, freedom, risk"],
];

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
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)",
        }}>
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

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 12,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

export default function DestinyMatrixFaqSection() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Destiny Matrix Calculator Works</h2>
        <p style={pStyle}>
          The calculator takes the day, month, and year of your birth and reduces each one to a number from 1 to 22.
          Those three numbers sit on the left, top, and right of the chart. They are added together to get the bottom
          point, and all four are added to get the center. More numbers are then worked out for the lines and zones
          between these points. Any total above 22 is reduced again. A simplified example: someone born on March 14,
          1990 gets 14 (day), 3 (month), and 19 (year, from 1+9+9+0). Those add up to 36, which reduces to 9 for the
          bottom point. The center is 14+3+19+9 = 45, which reduces to 9.
        </p>
        <p style={pStyle}>
          There is no randomness here. Because the whole chart comes from arithmetic on one date, the same birth date
          always gives the same chart. Different schools of the Matrix handle the reduction step a little differently,
          so you may see small differences if you compare this tool with another one. What matters is that each tool
          applies its own method consistently.
        </p>
        <p style={pStyle}>
          The number 22 is the cap because the system maps each number to one of the 22 Major Arcana cards. That is
          also where the meaning comes from. A 7 is not just a 7. It carries the themes of the Chariot card, and so on.
        </p>
        <h3 style={h3Style}>Can the Destiny Matrix really reveal insights about your life path?</h3>
        <p style={pStyle}>
          It can give you useful prompts, but it can’t predict your future. The Destiny Matrix is a symbolic framework,
          not a scientific test. Its value is in the questions it raises. If your chart points to a pattern in
          relationships or money and that pattern rings true, you now have something specific to look at. If it doesn’t
          ring true, you can set it aside. Think of it as a structured way to reflect, similar to journaling prompts,
          rather than a verdict on your life.
        </p>
        <h3 style={h3Style}>What can you learn from your birth date?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Through this system, your birth date gives you a map of natural strengths, recurring emotional patterns,
          relationship tendencies, money habits, and the kind of direction your life may organize around. It doesn’t
          tell you what will happen. It tells you what the system associates with the numbers in your date.
        </p>
      </div>

      {/* What the chart shows */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Your Destiny Matrix Chart Shows</h2>
        <p style={pStyle}>
          A finished chart is split into positions. Knowing what each one covers makes the reading much more useful
          than staring at loose numbers.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Core essence.</strong> The center number is treated as the anchor of the chart, your basic
            temperament and the energy behind how you handle life. It’s the easiest place for a beginner to start.
          </li>
          <li style={liStyle}>
            <strong>Karmic tail.</strong> This points to patterns that keep repeating, such as the same type of conflict
            showing up with different people or jobs. It’s one of the most talked-about parts of the system because it
            names a pattern instead of just describing a trait.
          </li>
          <li style={liStyle}>
            <strong>Love line.</strong> This covers what you’re drawn to in a partner and the emotional dynamic that
            tends to show up once things get serious.
          </li>
          <li style={liStyle}>
            <strong>Money line.</strong> This looks at financial energy: where money tends to come easily and where you
            hesitate or hit a ceiling. It’s usually read together with the core essence number.
          </li>
          <li style={liStyle}>
            <strong>Talent zone.</strong> These are natural abilities, often ones you’ve had so long you no longer think
            of them as talents.
          </li>
          <li style={liStyle}>
            <strong>Portrait zone.</strong> Sometimes called the mirror zone, this reflects how other people tend to see
            you, which isn’t always how you see yourself.
          </li>
          <li>
            <strong>Life purpose numbers.</strong> These point to the kind of contribution your life tends to build
            toward, often split into an earlier and a later stage.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every number has a stronger, more constructive expression and a weaker, more limiting one. A good reading
          looks at both sides. No number is simply good or bad.
        </p>
      </div>

      {/* How to read */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Read Your Destiny Matrix Chart</h2>
        <p style={pStyle}>Start in the center, then work outward. Here is a simple order that works for most people:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Read the core essence first.</strong> Look up the arcana number in the center. This is your
            baseline.
          </li>
          <li style={liStyle}>
            <strong>Move to the four corners.</strong> These show the main building blocks of your personality and the
            lessons tied to them.
          </li>
          <li style={liStyle}>
            <strong>Check the lines.</strong> The love line, money line, and karmic tail each use a short string of
            numbers. Read them in order, since the sequence tells a small story.
          </li>
          <li style={liStyle}>
            <strong>Look at the zones.</strong> The talent zone and portrait zone add detail about what you do well and
            how you come across.
          </li>
          <li>
            <strong>Compare both sides of each number.</strong> Ask where you see the positive version in your life and
            where you see the difficult one.
          </li>
        </ol>
        <p style={pStyle}>
          When a line has two or three numbers, don’t read them as separate facts. Read them as a progression. For
          example, a line of 6, 22, 16 can be read as a choice (6), followed by a leap into something new (22), followed
          by a shake-up (16). The order matters.
        </p>
        <h3 style={h3Style}>What the numbers mean</h3>
        <p style={pStyle}>
          This system uses the Marseille tarot order, which matters for numbers 8 and 11. Here is a quick reference for
          the 22 arcana, with one or two keywords each:
        </p>
        <ul style={ulStyle}>
          {ARCANA.map(([num, name, keywords], i) => (
            <li key={num} style={i === ARCANA.length - 1 ? undefined : { marginBottom: 4 }}>
              <strong>{num} {name}:</strong> {keywords}
            </li>
          ))}
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The same number can mean different things depending on where it sits. A 15 in the money line is read
          differently from a 15 in the love line. In money, it may point to a strong pull toward material security. In
          love, it may point to unhealthy attachment.
        </p>
      </div>

      {/* Numerology destiny numbers */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Destiny Numbers Mean in Numerology</h2>
        <p style={pStyle}>
          In traditional numerology, a destiny number (also called an expression number) is worked out from the letters
          in your full birth name, while the life path number comes from your birth date. Both are reduced to a single
          digit, except for the master numbers 11, 22, and 33. The destiny number is said to describe the talents and
          goals you’re meant to grow into. The life path number describes the road you walk. You can read more about
          the history of the practice in the{" "}
          <Ext href="https://www.britannica.com/topic/numerology">Britannica entry on numerology</Ext>.
        </p>
        <p style={pStyle}>
          The Destiny Matrix is different. It uses your birth date only and keeps numbers up to 22 instead of reducing
          everything to a single digit. That is why it can show more detail than a single destiny or life path number.
        </p>
        <p style={pStyle}>
          A quick note on common single-digit meanings in classic numerology: 1 is independence and leadership, 2 is
          cooperation, 3 is expression, 4 is discipline, 5 is change, 6 is responsibility and care, 7 is analysis and
          reflection, 8 is ambition and results, and 9 is compassion and completion.
        </p>
        <h3 style={h3Style}>What does the master number 11 mean?</h3>
        <p style={pStyle}>
          In numerology, 11 is a master number tied to intuition, sensitivity, and inspiration. People with 11 as a life
          path or destiny number are often described as perceptive and idealistic, and also prone to nervous energy and
          self-doubt. The usual advice is to learn to ground that sensitivity in routine and practical goals. In the
          Destiny Matrix, 11 matches the Strength card, so the same theme shows up as courage and calm self-control,
          especially under pressure.
        </p>
        <h3 style={h3Style}>What is the spiritual meaning of the number 8?</h3>
        <p style={pStyle}>
          The number 8 shows up in many traditions. In numerology it stands for power, results, and balance between the
          material and the spiritual. Its shape is the infinity symbol turned upright, which is why many people link it
          to cycles and continuity. In Christianity, 8 is often tied to new beginnings, since Sunday, the day of the
          Resurrection, is the eighth day counting from the previous Sunday. In Chinese culture, 8 is considered very
          lucky because it sounds like the word for prosperity.
        </p>
        <h3 style={h3Style}>Does the 8 arcana in the Destiny Matrix mean strength or justice?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the Destiny Matrix, 8 is Justice, and 11 is Strength. Many people mix them up because the common
          Rider-Waite tarot deck swaps them, putting Strength at 8 and Justice at 11. The Destiny Matrix follows the
          older Marseille order. If you see an 8 in your chart, read it as fairness, accountability, and cause and
          effect. If you see an 11, read it as courage and inner control.
        </p>
      </div>

      {/* Common chart questions */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Chart Questions</h2>
        <h3 style={h3Style}>What does it mean to have 777 in your Destiny Matrix?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There is no official position called 777 in the system. If you see 7 repeated three times in one line or
          across a zone, practitioners usually read it as a very strong emphasis on the Chariot: drive, motion, and the
          urge to take control. The positive side is determination and momentum. The challenging side is pushing too
          hard, burning out, or refusing to slow down. Where the sevens sit changes the meaning, so check which area of
          the chart they fall in.
        </p>
      </div>

      {/* 777 angel number */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is 777 an angel number?</h2>
        <p style={pStyle}>
          Yes, in popular angel number culture, 777 is considered a sign of spiritual alignment, good luck, and being on
          the right track. This is a modern belief with no scientific backing. In the Bible, 7 is a number often linked
          with completeness, which is one reason people connect it with something sacred. Whether you treat it as
          meaningful is a personal call. Seeing it a lot may simply mean you’re paying attention to it.
        </p>
        <h3 style={h3Style}>What does it mean if the love line is 6-22-16?</h3>
        <p style={pStyle}>
          Read in order, this line starts with the Lovers (6): strong attraction, and a real need to choose based on
          your values. The Fool (22) comes next, which suggests openness, spontaneity, and a willingness to jump in
          without a full plan. The Tower (16) closes the line, which points to sudden shake-ups, ruptured routines, or a
          relationship that forces a hard truth into the open. Together, this can describe someone who falls into love
          quickly and fully, and who tends to see a relationship end or change abruptly rather than fade slowly. The
          healthy version is learning to slow down at the Fool stage so the Tower doesn’t have to show up.
        </p>
        <h3 style={h3Style}>What does it mean to get 14 for this year?</h3>
        <p style={pStyle}>
          The year number shows the theme of a given year in your life. A 14 is Temperance, so the year is about
          balance, patience, and mixing things in the right proportions. It’s often a good time to repair relationships,
          find a steadier routine, and avoid extremes with work, money, or health. The caution is impatience. Temperance
          rewards slow, steady moves.
        </p>
        <h3 style={h3Style}>Why doesn’t my rising sign match my portrait zone?</h3>
        <p style={pStyle}>
          Because they come from two unrelated systems. Your rising sign is calculated from the exact time and place of
          your birth and describes the zodiac sign on the horizon at that moment. The portrait zone is calculated from
          the digits in your birth date and has no connection to the sky. There is no reason they should match. It’s
          also normal for people to come across differently in different settings, so no single description of your
          outer image will fit every situation.
        </p>
        <h3 style={h3Style}>How do I check appearance and attractiveness in my chart?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          No number in the chart measures physical looks. The closest thing is the portrait zone, which shows the
          impression you leave on others, including charm, presence, and how approachable you seem. The love line adds
          the kind of attention you tend to draw in relationships. Treat these as clues about presence and style, not
          as a score.
        </p>
      </div>

      {/* Fixed or shaped */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Your Destiny Fixed, or Do You Shape It?</h2>
        <p style={pStyle}>
          This is one of the oldest questions people ask, and thoughtful people land in different places. Here is how it
          breaks down.
        </p>
        <p style={pStyle}>
          <strong>Is life already written?</strong> Some traditions say yes, at least in part. Others say no.
          Philosophers separate the debate into determinism (every event follows from earlier causes) and free will
          (you can choose differently). Many hold a middle view, called compatibilism, which says you can be shaped by
          your background and still make real choices. The{" "}
          <Ext href="https://plato.stanford.edu/entries/freewill/">Stanford Encyclopedia of Philosophy</Ext> has a
          detailed overview if you want to go deeper.
        </p>
        <p style={pStyle}>
          <strong>Can you make your own destiny?</strong> In practice, most people live as if they can. Where you were
          born, your health, and your family aren’t chosen. How you respond to them often is. A fair way to put it: some
          things are given, and much of what you do with them is up to you.
        </p>
        <p style={pStyle}>
          <strong>Do I believe destiny is predetermined?</strong> Speaking for this tool, the Destiny Matrix doesn’t
          claim your life is fixed. It describes tendencies, strengths, and lessons. What you do with them is up to you,
          and that’s how most numerologists describe it too.
        </p>
        <h3 style={h3Style}>How do thoughts shape your destiny?</h3>
        <p style={pStyle}>
          Thoughts don’t change your circumstances by themselves, but they steer your attention and your actions, and
          those do. If you believe you’re bad with money, you might avoid looking at your accounts, and that avoidance
          creates real problems. Psychologists call this a self-fulfilling prophecy. Therapies like cognitive behavioral
          therapy are built on this link between thoughts, feelings, and behavior.
        </p>
        <h3 style={h3Style}>Can you change your destiny by changing your thoughts?</h3>
        <p style={pStyle}>
          Partly. Changing a thought can change what you notice, what you try, and how you handle setbacks. That can
          open doors you would have missed. But it works best when it’s paired with action. A new belief plus a new
          habit is far more effective than a new belief alone. Some things, like illness, loss, or other people’s
          choices, aren’t controlled by mindset, and it isn’t your fault when they happen.
        </p>
        <h3 style={h3Style}>Is destiny more powerful than choice in love, according to astrology?</h3>
        <p style={pStyle}>
          Most modern astrologers say the chart shows tendencies, such as what attracts you and where friction tends to
          show up, and that choice decides what happens. Traditional astrologers lean more toward fate, but even they
          usually allow for free will. Two people with a difficult chart match can build a strong relationship, and two
          with a great match can fail. The same applies to the love line in the Destiny Matrix.
        </p>
        <h3 style={h3Style}>What if you run from your destiny, like Neo in The Matrix?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In the first Matrix movie, Morpheus asks Neo if he believes in fate. Neo says no, because he doesn’t like the
          idea of not being in control of his life. That scene is with Neo, not Trinity, and it’s often misremembered as
          being from Revolutions. Morpheus is the believer in prophecy. Neo spends much of the story hesitating, and the
          films show that avoiding the call doesn’t make it go away. It makes things harder for him and those around
          him. Real life works in a similar way. If you ignore a pattern or purpose, it usually shows up again in a
          different form. In Destiny Matrix terms, this is what the karmic tail describes: a lesson that repeats until
          it’s dealt with.
        </p>
      </div>

      {/* Taken away */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can Someone Take Your Destiny or Fortune Away?</h2>
        <p style={pStyle}>
          Different beliefs answer this differently. Here is how the major traditions generally see it, followed by
          non-religious views.
        </p>
        <p style={pStyle}>
          <strong>Islam.</strong> Muslims believe in qadar, the divine decree. Provision (rizq), life span, and what
          befalls a person are known and written by God. A commonly cited hadith teaches that if everyone gathered to
          help or harm you, they could only do what God had already decreed. So in this view, no person can take away
          what God has written for you. At the same time, Islam stresses effort, accountability, and dua
          (supplication). Many scholars cite a narration that dua can affect what happens. Muslims are also taught to
          seek refuge in God from harm, including envy.
        </p>
        <p style={pStyle}>
          <strong>Christianity.</strong> Most Christians believe in divine providence, the idea that God cares for and
          guides human lives. Verses like Jeremiah 29:11 and Romans 8:28 are often cited for this. Other people can hurt
          you, steal from you, or block you, but many Christians read Romans 8:38-39 as saying nothing can separate a
          believer from God’s love or purpose. Denominations disagree about how fixed things are. Calvinists emphasize
          predestination, while Catholics and many Protestants stress free will and human cooperation with God.
        </p>
        <p style={pStyle}>
          <strong>Judaism.</strong> Jewish thought puts strong weight on free will and moral responsibility. A
          well-known teaching says that everything is in God’s hands except the fear of Heaven, meaning the choice to
          live rightly is yours. Maimonides wrote at length that people are free to choose good or evil. Others can harm
          you, and Jewish law takes harm and theft seriously, but your moral path and relationship with God are your
          own.
        </p>
        <p style={pStyle}>
          <strong>Hinduism.</strong> Hindu teaching explains life through karma and dharma. Some of what happens to you
          comes from past actions (often called prarabdha karma), while your present actions (kriyamana karma) shape
          what comes next. The Bhagavad Gita tells you to focus on right action and let go of attachment to results. In
          this view, others can disrupt your circumstances, but they can’t take your karma or your dharma, because those
          belong to you.
        </p>
        <p style={pStyle}>
          <strong>Atheist and secular views.</strong> Atheists generally don’t believe in a cosmic plan, so destiny is
          not something that can be given or stolen. Other people can absolutely take your money, opportunities, or
          time, and that’s a real loss. But your future isn’t sealed in advance, so there’s nothing predetermined to
          lose. Many secular thinkers say meaning and direction are things you build, and you can rebuild them after
          setbacks.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Across all of these views, one point repeats: other people can damage your circumstances, but they can’t
          cancel your character, your choices, or, for believers, what God or karma holds for you. For the Destiny
          Matrix, the same idea applies. The chart describes your own tendencies, and no one else can change what is in
          your date of birth.
        </p>
      </div>

      {/* Life purpose */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Finding Your Life Purpose When Nothing Seems to Fit</h2>
        <p style={pStyle}>
          If you’ve already studied astrology, Vedic systems, and the Matrix and still feel unsure, the problem may not
          be missing information. Every system gives you a different set of descriptions, and none can hand you a single
          answer called your purpose. Here is a more practical way to narrow it down:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Look for overlap.</strong> Which themes show up in every system you’ve tried, such as teaching,
            building, healing, or creating? Those are more reliable than any single reading.
          </li>
          <li style={liStyle}>
            Check your talent zone and life purpose numbers in the Matrix, then compare them with what people have
            always asked you for help with.
          </li>
          <li style={liStyle}>
            Notice what you do without being asked and what you lose track of time doing.
          </li>
          <li style={liStyle}>
            Think about what problems bother you most. Purpose is often tied to something you can’t ignore.
          </li>
          <li>
            <strong>Test it in real life.</strong> Try a small project or role connected to a theme. Purpose shows up
            more clearly through action than through more reading.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It’s also fine if your purpose changes with your age. Most people have more than one season of purpose.
        </p>
      </div>

      {/* Palm lines */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Do Palm Lines Change Your Destiny?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Palm lines don’t shape your destiny, and there’s no scientific evidence that they predict it. Palmistry reads
          the major lines, such as the life, head, and heart lines, as signs of health, thinking style, and emotional
          life. See the <Ext href="https://www.britannica.com/topic/palmistry">Britannica overview of palmistry</Ext>{" "}
          for its history. The lines are creases formed before birth and shaped by how the hand folds and moves. They
          can shift a little over time with age, injury, or use. Some unusual crease patterns are linked to certain
          genetic conditions, but that’s a medical observation, not a prediction about your future. If you enjoy
          palmistry, it’s fine as a reflection tool, just like the Destiny Matrix. It can’t tell you what is going to
          happen.
        </p>
      </div>

      {/* Nostradamus */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What About Nostradamus’ Predictions for the USA, 2025 to 2030?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are no reliable Nostradamus predictions for the USA in this period. His 16th-century quatrains are
          written in vague, symbolic language, and they were never about specific years in the way viral posts claim.
          Modern writers often read events into them only after those events have happened. Nearly every claim you see
          online about 2025 to 2030 comes from a recent interpreter, not from Nostradamus himself, and 2025 and much of
          2026 have already passed without the dramatic events many of those posts promised. A good rule is to treat
          these lists as entertainment, not forecasts.
        </p>
      </div>

      {/* Accuracy and privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and What to Know Before You Start</h2>
        <p style={pStyle}>
          The calculator follows a fixed Destiny Matrix method, so the numbers are the same every time. But the Destiny
          Matrix is a self-reflection framework based on numerology and symbolism. It isn’t a scientifically validated
          psychological or predictive tool, so please don’t use it to make major medical, legal, or financial
          decisions.
        </p>
        <p style={pStyle}>
          The tool is completely free, with no account, email address, or paywall. Your full chart appears in one view.
          A date of birth alone isn’t tied to your identity unless you add other details, so avoid entering anything
          beyond what the form asks for. What you do with your results is up to you.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          People use the calculator in many ways: to start a self-reflection habit, to understand a relationship
          pattern, to look at money habits, to think about a child’s temperament, to compare two people’s charts, or
          simply out of curiosity.
        </p>
      </div>

      {/* FAQ */}
      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 6 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
