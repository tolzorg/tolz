import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does an anniversary calculator work?",
    a: "It finds the exact time between two dates, usually a starting date like a wedding and today, and breaks it into years, months, weeks, and days.",
  },
  {
    q: "Is the Anniversary Calculator on Tolz free?",
    a: "Yes. There are no hidden fees, subscriptions, or usage limits.",
  },
  {
    q: "Do I need to sign up to use it?",
    a: "No. Open the page and use it as often as you like.",
  },
  {
    q: "Can I calculate a future anniversary?",
    a: "Yes. Set the comparison date to any future date to see how much time is left.",
  },
  {
    q: "Does it account for leap years?",
    a: "Yes. Leap years and different month lengths are handled automatically.",
  },
  {
    q: "Can I use it for anniversaries other than weddings?",
    a: "Yes. It works for dating, engagement, work, business, sobriety, move-in, and any other date.",
  },
  {
    q: "What's the difference between a wedding anniversary and a marriage anniversary?",
    a: "They mean the same thing. \"Wedding anniversary\" is the standard phrase in American English.",
  },
  {
    q: "What are the 20th, 25th, 50th, and 100th anniversaries called?",
    a: "China (20th), silver (25th), gold (50th), and centennial (100th, with no official gift theme).",
  },
  {
    q: "How do I find the gift that matches my anniversary year?",
    a: "Use the calculator to confirm your exact year, then match it to the traditional or modern gift list above.",
  },
  {
    q: "Is my data safe?",
    a: "The tool only uses the dates you enter to show your result. Nothing is stored or shared, and no account is needed.",
  },
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
  color: "var(--text-primary)", marginBottom: 6, marginTop: 14,
};
const h4Style = {
  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
  color: "var(--text-primary)", marginBottom: 4, marginTop: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const olStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const last = { ...pStyle, marginBottom: 0 };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

export default function AnniversaryFaqSection() {
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
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What is it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Anniversary Calculator?</h2>
        <p style={pStyle}>
          An anniversary calculator measures the exact time between a starting date, like your wedding day, and today
          (or any other date you pick). Instead of subtracting years in your head and guessing at the months, you get a
          precise breakdown in seconds. It also shows how long you have until the next anniversary, which helps when
          you're planning a dinner, a trip, or a gift.
        </p>
        <p style={last}>
          Doing this by hand is easy to get wrong. Months have 28, 29, 30, or 31 days, and leap years add an extra day
          every four years. A rough mental estimate can easily be off by several days, and that matters if the number is
          going on a card, a toast, or an engraved gift.
        </p>
      </div>

      {/* Wedding anniversaries */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Wedding Anniversaries</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>Wedding Anniversary or Marriage Anniversary: Which Is Correct?</h3>
        <p style={pStyle}>
          Both are understood, but "wedding anniversary" is the standard phrase in American English. Strictly speaking,
          you're celebrating the date of the wedding, so "wedding anniversary" is the more accurate term. "Marriage
          anniversary" is common in Indian English and in some other regions, and nobody will misunderstand it. If
          you're writing a card or caption for an American audience, go with "wedding anniversary."
        </p>
        <h3 style={h3Style}>Is It Important to Celebrate Wedding Anniversaries?</h3>
        <p style={pStyle}>
          It's not required, but it's worth doing in some form. An anniversary gives you a set time each year to slow
          down and acknowledge the effort you both put into the marriage. It doesn't have to be big. A home-cooked
          dinner, a walk, or a handwritten note can mean more than an expensive night out. Couples who skip the
          celebration aren't doing anything wrong. What matters is that both people feel appreciated, and that's easier
          when there's a regular moment set aside for it.
        </p>
        <h3 style={h3Style}>Anniversary Names by Year</h3>
        <p style={pStyle}>Traditional Western themes assign a material to certain years:</p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 4 }}>1st: paper</li>
          <li style={{ marginBottom: 4 }}>2nd: cotton</li>
          <li style={{ marginBottom: 4 }}>3rd: leather</li>
          <li style={{ marginBottom: 4 }}>5th: wood</li>
          <li style={{ marginBottom: 4 }}>10th: tin or aluminum</li>
          <li style={{ marginBottom: 4 }}>20th: china (platinum on modern lists)</li>
          <li style={{ marginBottom: 4 }}>25th: silver</li>
          <li style={{ marginBottom: 4 }}>30th: pearl</li>
          <li style={{ marginBottom: 4 }}>40th: ruby</li>
          <li style={{ marginBottom: 4 }}>50th: gold</li>
          <li>60th: diamond</li>
        </ul>
        <p style={pStyle}>For the big ones, here are the common names:</p>
        <ul style={olStyle}>
          <li style={liStyle}><strong>20th anniversary:</strong> the china anniversary.</li>
          <li style={liStyle}>
            <strong>25th anniversary:</strong> the silver anniversary, sometimes called a silver jubilee.
          </li>
          <li style={liStyle}><strong>50th anniversary:</strong> the golden anniversary, or golden jubilee.</li>
          <li>
            <strong>100th anniversary:</strong> there's no official gift theme, since a couple rarely reaches 100 years
            together. It's usually called a centennial. People use it for businesses, schools, and institutions.
          </li>
        </ul>
        <p style={pStyle}>
          If you want to read more about how these traditions developed,{" "}
          <Ext href="https://en.wikipedia.org/wiki/Wedding_anniversary">Wikipedia's wedding anniversary page</Ext> has a
          full list by country.
        </p>
        <h3 style={h3Style}>How Do People Celebrate Wedding Anniversaries?</h3>
        <p style={pStyle}>
          There's no single way. Common choices include dinner at the restaurant where you had a first date, a weekend
          trip, a family gathering, or a quiet evening at home with a favorite movie. Many couples exchange cards or
          small gifts, look through wedding photos, or recreate something from their wedding day. Milestone years like
          the 25th or 50th often bring a party with family and friends. Pick whatever fits your budget and your
          personality.
        </p>
        <h3 style={h3Style}>Should You Renew Your Vows on Your 4th Anniversary?</h3>
        <p style={pStyle}>
          You can renew your vows at any point, and there's no rule saying you have to wait for a milestone. Most
          couples do it at the 10th, 25th, or 50th anniversary, but a 4th anniversary works fine if you want to. It's a
          good fit if you had a rushed or tiny wedding, went through a hard stretch and came out stronger, or just want
          to say your promises again with more perspective. Keep it simple: a few words in the backyard with close family
          counts.
        </p>
        <h3 style={h3Style}>Why Aren't Men Always Excited About Wedding Anniversaries?</h3>
        <p style={pStyle}>
          It's not true of every man, but it does come up. Common reasons include pressure to plan something impressive,
          forgetting dates in general, or having a different idea of how to show love. Some people feel an anniversary is
          just another day, and they'd rather show care through everyday actions. The fix is usually a simple
          conversation. Tell each other what you'd actually enjoy, and agree on something small that both of you look
          forward to. A shared reminder on your phones doesn't hurt, either.
        </p>
        <h3 style={h3Style}>If You're a Widower, Can You Still Celebrate Your Wedding Anniversary?</h3>
        <p style={last}>
          Yes. The date doesn't stop mattering when a spouse passes away, and many widowers and widows keep marking it.
          Some visit the cemetery, look through old photos, cook a favorite meal, or write a letter to their spouse.
          Others spend the day with family and share stories. There's no right or wrong way, and your feelings may change
          from year to year. If the day feels heavy, it's fine to keep it quiet.
        </p>
      </div>

      {/* Wishes and messages */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Anniversary Wishes and Messages</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>How Do You Say Happy Anniversary to a Couple?</h3>
        <p style={pStyle}>
          Keep it warm and specific. A simple "Happy anniversary! Wishing you both another year of love and laughter"
          works anywhere. If you know the couple well, mention something real, like their sense of humor or how they
          support each other. For a couple celebrating a milestone, you can add the number of years: "Congratulations on
          25 years together. You two make it look easy."
        </p>
        <h3 style={h3Style}>Romantic Messages for Your Partner</h3>
        <p style={pStyle}>The best messages are personal. Here are a few starting points you can adapt:</p>
        <ul style={olStyle}>
          <li style={liStyle}>"Every year with you is my favorite one yet. I'd choose you again every single time."</li>
          <li style={liStyle}>"Thank you for being my best friend, my partner, and my home."</li>
          <li>"I love the life we've built, and I can't wait to see what comes next."</li>
        </ul>
        <p style={pStyle}>
          A specific memory, like the trip you almost missed or the apartment you first shared, will do more than any
          generic line.
        </p>
        <h3 style={h3Style}>Creative Ways to Wish Someone a Happy Anniversary</h3>
        <ul style={olStyle}>
          <li style={liStyle}>Write the message on the back of a framed photo they'll find later.</li>
          <li style={liStyle}>Record a short video or voice note with a memory from the past year.</li>
          <li style={liStyle}>Leave small sticky notes around the house, each with a reason you love them.</li>
          <li style={liStyle}>Send a letter in the mail, since few people get real ones anymore.</li>
          <li style={liStyle}>Make a playlist of songs from key moments in your relationship.</li>
          <li>
            Use the exact count from the Tolz calculator: "It's been 8 years, 2 months, and 5 days, and I'd do all of
            them again."
          </li>
        </ul>
        <h3 style={h3Style}>Bible Verses for a Wedding Anniversary</h3>
        <p style={pStyle}>Couples who want a scripture reference for a card or toast often use these passages:</p>
        <ul style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>1 Corinthians 13:4–7:</strong> the well-known description of what love is and does.</li>
          <li style={liStyle}><strong>Ecclesiastes 4:9–12:</strong> on the strength of two people working together.</li>
          <li style={liStyle}><strong>Song of Solomon 8:6–7:</strong> on the lasting power of love.</li>
          <li style={liStyle}><strong>Genesis 2:24:</strong> on two people becoming one family.</li>
          <li style={liStyle}><strong>Colossians 3:14:</strong> on love holding everything together.</li>
          <li><strong>Ephesians 5:25:</strong> on loving your spouse selflessly.</li>
        </ul>
      </div>

      {/* Gift ideas */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Anniversary Gift Ideas</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>Best Gifts for a Wife or Other Women</h3>
        <p style={pStyle}>
          The best gift usually shows you've been paying attention. Good options include jewelry she can wear daily (a
          birthstone piece or a necklace with the wedding date engraved), a favorite perfume, a weekend trip, a spa day,
          or a photo book of your year together. If she prefers experiences, book a cooking class or a nice dinner and
          plan the details yourself so she doesn't have to. Flowers still work well when paired with a handwritten note.
        </p>
        <h3 style={h3Style}>Best Gifts for a Husband or Other Men</h3>
        <p style={pStyle}>
          Think about what he uses and enjoys. A quality watch, a leather wallet, a favorite hobby accessory, or tickets
          to a game or concert are safe picks. Personalized items like an engraved keychain or a framed photo carry extra
          meaning. If he's hard to shop for, plan a day around something he loves, like a round of golf, a fishing trip,
          or his favorite meal.
        </p>
        <h3 style={h3Style}>Last-Minute Anniversary Gifts</h3>
        <p style={pStyle}>If the date snuck up on you:</p>
        <ul style={olStyle}>
          <li style={liStyle}>Order flowers or a dessert for same-day delivery.</li>
          <li style={liStyle}>
            Book a dinner reservation (try apps like OpenTable) and write a card to go with it.
          </li>
          <li style={liStyle}>Print a photo from your phone and frame it.</li>
          <li style={liStyle}>Write a letter listing what you've loved most this year.</li>
          <li style={liStyle}>
            Buy an e-gift card for a massage, a restaurant, or a streaming service and add a personal note.
          </li>
          <li>Cook a full dinner at home with candles and music.</li>
        </ul>
        <p style={pStyle}>A thoughtful note matters more than how fast you shop.</p>
        <h3 style={h3Style}>Gift Ideas for an Older Couple</h3>
        <p style={pStyle}>
          Simple, sentimental gifts tend to land best. Consider a photo album or digital frame filled with pictures from
          over the years, a family tree or framed wedding photo, a dinner at their favorite restaurant, or a day trip
          somewhere nostalgic. If they have grandchildren, a card signed by everyone or a short video message from the
          family is often what they treasure most. Comfort items, like a cozy blanket or tickets to a local show, work
          well, too.
        </p>
        <h3 style={h3Style}>Seven Things You Can Give a Couple on Their Anniversary</h3>
        <ol style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}>Flowers or a small plant they can keep</li>
          <li style={liStyle}>A framed photo or custom photo book</li>
          <li style={liStyle}>A gift card for a nice restaurant</li>
          <li style={liStyle}>A weekend getaway or overnight stay</li>
          <li style={liStyle}>A personalized item, like an engraved cutting board or ornament</li>
          <li style={liStyle}>A bottle of wine or a gourmet food basket</li>
          <li>A handwritten card with a heartfelt message</li>
        </ol>
      </div>

      {/* Other anniversaries */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Anniversaries Worth Marking</h2>

        <h3 style={{ ...h3Style, marginTop: 0 }}>Dating Anniversaries</h3>
        <p style={pStyle}>
          A dating anniversary marks the day your relationship began. Choose a date you both agree on, usually your first
          date or the day you became official. Early on, many couples celebrate monthly or yearly with a dinner, a small
          gift, or a note. It doesn't need to be a big deal. Just don't pick the date alone, since the two of you may
          remember it differently.
        </p>
        <h4 style={h4Style}>Do you still celebrate a dating anniversary after you're married?</h4>
        <p style={pStyle}>
          Many couples do, usually in a low-key way, like going back to the place of the first date. Some focus only on
          their wedding anniversary, and that's fine too.
        </p>
        <h4 style={h4Style}>Is it normal to celebrate them at all?</h4>
        <p style={pStyle}>
          It's common, but not universal. Plenty of couples don't mark the day, and it says nothing about how strong
          their relationship is.
        </p>
        <h4 style={h4Style}>Are relationship anniversaries important?</h4>
        <p style={pStyle}>
          They can be, if they mean something to you. They're a good reminder to appreciate each other, but they're not
          a test of love. If one partner cares more than the other, talk about it openly.
        </p>

        <h3 style={h3Style}>How Do 100, 200, 300, and 500-Day Anniversaries Work?</h3>
        <p style={pStyle}>
          Counting days is most popular in South Korea, where the 100th day (baek-il) is a major milestone for new
          couples, followed by 200, 300, 500, and 1,000 days. Koreans typically count the first day together as day one,
          so the 100th day falls 99 days after the start date. Young couples in China celebrate in a similar way, and on
          May 20 (520, which sounds like "I love you" in Mandarin).
        </p>
        <p style={pStyle}>
          In the U.S. and Europe, couples usually stick to monthly or yearly anniversaries, though some do mark 100 days.
          In India, younger couples often celebrate "monthsaries," and day milestones are less formal. Typical gifts
          across all these cultures include flowers, a handwritten letter, matching accessories, couple outfits, a
          favorite meal, or a small cake. The easiest way to count is to enter your start date in the Tolz calculator and
          compare it to different future dates until you reach the day you want.
        </p>

        <h3 style={h3Style}>Engagement Anniversaries</h3>
        <p style={pStyle}>
          An engagement anniversary marks the day you got engaged, which is a separate date from your wedding. It's not
          a widely observed tradition anywhere, including the UK, and there's no standard way to celebrate. Most couples
          keep it simple with dinner, a toast, or a visit to the place where the proposal happened.
        </p>
        <p style={pStyle}>
          For parents, a thoughtful surprise could be a framed photo from their engagement, a dinner reservation at the
          place where they got engaged, or a short video of family members sharing memories. Other common activities
          include re-creating the proposal, looking through old photos, or writing a letter about what has changed
          since.
        </p>

        <h3 style={h3Style}>Friendship Anniversaries</h3>
        <p style={pStyle}>
          A friendship anniversary can be a fun way to recognize someone who matters to you. For ideas, try a meal at the
          place where you first met, a day trip, a framed photo, or a letter listing your favorite memories together. To
          make it feel more special, bring up a specific moment only the two of you share, like an old inside joke.
        </p>
        <p style={pStyle}>
          For a short message, something like "Thanks for being the friend who stuck around through everything" works
          well.
        </p>
        <p style={pStyle}>
          On Facebook, friendship anniversaries show up in the Memories ("On This Day") feature and in notifications when
          you become friends. You can also open a friend's profile and look for the option to see your friendship page,
          which shows your shared history.
        </p>

        <h3 style={h3Style}>Work Anniversaries</h3>
        <p style={pStyle}>
          <strong>Why does it matter?</strong> A year at the same job means something. It shows commitment, builds
          skills, and helps a team run smoothly. Recognizing it makes people feel valued, and employees who feel valued
          are more likely to stay.
        </p>
        <p style={pStyle}>
          <strong>How do companies celebrate?</strong> Common approaches include a shout-out in a team meeting, a
          handwritten card from the manager, a small gift card, extra paid time off, or a lunch. Larger milestones, like
          5, 10, or 20 years, often get bigger awards.
        </p>
        <p style={pStyle}>
          <strong>Should you be upset if your employer forgets yours?</strong> It's normal to feel a little
          disappointed, especially if you watched others get recognized. Often it's an oversight, not a message. If it
          bothers you, bring it up politely, or use the moment to ask for feedback on your role.
        </p>
        <p style={pStyle}>
          <strong>How do you wish a boss a happy work anniversary?</strong> Keep it professional and sincere:
          "Congratulations on your anniversary with the company. Thank you for your leadership and support."
        </p>
        <p style={pStyle}>
          <strong>Best gifts and what to bring to the office:</strong> For coworkers, a card signed by the team, a small
          plant, a catered lunch, coffee or donuts for everyone, or a gift card works well.
        </p>
        <p style={pStyle}>
          <strong>Celebrating virtually:</strong> Send a group e-card, share messages in Slack or Teams, set up a short
          video call with a few kind words, or mail a small gift to their home.
        </p>
        <p style={pStyle}>
          <strong>Why doesn't my work anniversary show on LinkedIn?</strong> The most common causes are a missing start
          date or month on your Experience entry, a role not marked as current, or notification settings that are turned
          off. Check that the position has a month and year, and make sure the "notify network" setting is on when you
          edit it.
        </p>

        <h3 style={h3Style}>High School Graduation Anniversaries</h3>
        <p style={pStyle}>
          <strong>How do schools track down former students?</strong> Most use alumni associations, reunion committees,
          social media groups, yearbook contact lists, and class volunteers who reach out to classmates. Word of mouth
          plays a big role.
        </p>
        <p style={pStyle}>
          <strong>What should you do to celebrate your graduation?</strong> Gather with family and friends for a dinner
          or backyard party, take photos in your cap and gown, or write a letter to your future self.
        </p>
        <p style={pStyle}>
          <strong>Why would a student skip graduation?</strong> Some do because of cost, anxiety, or family situations.
          For most students, though, going is worth it, because it's a one-time experience you can't redo. If you do
          skip, you'll typically still get your diploma.
        </p>
        <p style={pStyle}>
          <strong>Are there schools named after dates?</strong> Yes, especially outside the U.S. Many schools carry the
          name of a national or historical date, such as the "9 de Julio" and "25 de Mayo" schools in Argentina or the
          "23 Nisan" schools in Turkey.
        </p>
        <p style={pStyle}>
          <strong>What's the simplest way to say it?</strong> Most people just say "class reunion" or "our 20-year
          reunion."
        </p>

        <h3 style={h3Style}>Death Anniversaries</h3>
        <p style={pStyle}>
          <strong>What is it called?</strong> The first anniversary is commonly just called the "first death
          anniversary." Some traditions use special words: yahrzeit in Judaism, barsi in Hindi and Urdu, and a "year's
          mind" Mass in some Catholic traditions.
        </p>
        <p style={pStyle}>
          <strong>Do people observe death anniversaries?</strong> Yes, in many cultures and religions. People use the day
          to remember someone, honor their life, and support each other.
        </p>
        <p style={pStyle}>
          <strong>Why do people remember them?</strong> Grief doesn't follow a calendar, but an anniversary gives it a
          place to go. Remembering helps people feel connected to the person they lost.
        </p>
        <p style={pStyle}>
          <strong>What should you do on that day?</strong> There's no single right answer, but common choices include:
        </p>
        <ul style={olStyle}>
          <li style={liStyle}>Visiting the grave or a meaningful place</li>
          <li style={liStyle}>Lighting a candle or saying a prayer</li>
          <li style={liStyle}>Gathering with family to share stories</li>
          <li style={liStyle}>Cooking their favorite meal</li>
          <li style={liStyle}>Donating to a cause they cared about</li>
          <li>Looking through photos or writing them a letter</li>
        </ul>
        <p style={pStyle}>
          If it's your dad's death anniversary, you could also do something he loved, like fishing, watching his favorite
          team, or visiting his favorite spot.
        </p>
        <p style={pStyle}>
          <strong>How do you acknowledge a widow's first anniversary after her husband's death?</strong> Reach out. A
          short call, card, or message shows you remember: "I'm thinking of you today. I remember how much he meant to
          you. I'm here if you want company or want to talk." Don't wait for her to bring it up, and don't push her to
          talk if she doesn't want to.
        </p>
        <p style={last}>
          <strong>What about birthdays and death anniversaries in Islam?</strong> Views differ, so there's no single
          answer. Many scholars say that neither birthdays nor fixed annual death-anniversary gatherings have a basis in
          the Sunnah. Others see remembering a loved one as acceptable, as long as it avoids practices they consider
          religious innovations. Most agree that making dua, giving charity on the person's behalf, and recalling their
          good deeds are always welcome. If you're unsure, a trusted local scholar can tell you what your tradition
          recommends.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Anniversary Calculator</h2>
        <ol style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Enter the starting date.</strong> This can be a wedding date, the day you started dating, an
            engagement date, a hire date, or any other date you want to measure from.
          </li>
          <li style={liStyle}>
            <strong>Choose the comparison date.</strong> It defaults to today. Pick a future date if you want to see how
            far away an upcoming anniversary is.
          </li>
          <li style={liStyle}>
            <strong>Read your results.</strong> You'll see the time broken down into years, months, weeks, and days,
            along with a total day count and the date of your next anniversary.
          </li>
          <li>
            <strong>Run it again any time.</strong> There's no limit, so you can check a different couple or milestone,
            or recheck as the date gets closer.
          </li>
        </ol>
      </div>

      {/* When people use it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When People Use It</h2>
        <p style={pStyle}>Most people reach for an anniversary calculator for one of these reasons:</p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Planning a milestone.</strong> Knowing exactly when your 10th, 25th, or 50th anniversary falls gives
            you time to book a venue or order a gift.
          </li>
          <li style={liStyle}>
            <strong>Settling a friendly debate.</strong> Couples often disagree on how long they've been together,
            especially after an engagement, a long-distance stretch, or a breakup and restart. A calculator gives a clear
            answer.
          </li>
          <li style={liStyle}>
            <strong>Writing a card, toast, or post.</strong> "6 years, 3 months, and 12 days" feels more personal than
            "about six years."
          </li>
          <li style={liStyle}>
            <strong>Tracking other milestones.</strong> Work anniversaries, business founding dates, sobriety dates,
            move-in days, and adoption dates all work the same way.
          </li>
          <li>
            <strong>Matching a gift to the year.</strong> Anniversary gift traditions depend on the exact year number, so
            it helps to know whether you're in year 24 or year 25.
          </li>
        </ul>
        <p style={last}>
          The tool doesn't ask what kind of anniversary you're tracking. It simply measures the time between two dates,
          so it works for all of the above.
        </p>
      </div>

      {/* Accurate, free, private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accurate, Free, and Private</h2>
        <p style={pStyle}>
          The calculator uses real calendar logic. Leap years are handled automatically, and each month is counted at
          its actual length rather than a flat 30 days. That means the number you get is one you can safely put in a
          speech or on a piece of jewelry.
        </p>
        <p style={last}>
          It's also completely free, with no hidden charges, subscriptions, or usage limits, and you don't need an
          account. The only thing you enter is a date, and it's used just to produce your result. Nothing is stored or
          shared.
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
