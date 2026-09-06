import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this word finder tool free to use?",
    a: "Yes. The tool is completely free, with no signup, account creation, or hidden charges required to search or view results.",
  },
  {
    q: "Can I use this word finder for Scrabble and Words With Friends?",
    a: "Yes. Search by included letters to find valid words from your tile rack, and check word length and letter values to choose the highest-scoring option before playing your move.",
  },
  {
    q: "How do I use the word finder for Wordle?",
    a: "Use the fill-in-the-blanks pattern search. Enter the letters you already know in their correct positions and leave the rest blank; the tool returns matching words to help you narrow down your next guess.",
  },
  {
    q: "Does the word finder check for real, valid words?",
    a: "Yes. Results are matched against a standard dictionary word list (the ENABLE word list, over 172,000 entries), so every word returned is a genuine, spellable word rather than a random letter combination.",
  },
  {
    q: "Can I search by ending letters instead of starting letters?",
    a: "Yes. The tool supports searching by starting letters, ending letters, or letters contained anywhere in the word, depending on what information you already have.",
  },
  {
    q: "Is my search data stored or shared?",
    a: "No. The tool doesn't require an account, and no personal information or search history is stored or tied to your identity.",
  },
  {
    q: "Why are Scrabble and Words With Friends results sometimes different?",
    a: "The two games use slightly different official dictionaries. For unusual or obscure words, it's worth confirming against your specific game's built-in word checker before playing, especially in competitive matches.",
  },
  {
    q: "Can this tool help with crossword puzzles?",
    a: "Yes. If you know some letters from intersecting crossword answers, you can search by starting letters, ending letters, or a combined pattern to narrow down the correct answer.",
  },
  {
    q: "How do I find words with specific letters?",
    a: "Use the included-letters search and enter the letters you have. The tool returns every valid word containing those letters, regardless of where they fall in the word.",
  },
  {
    q: "Can I search for words that start with one letter and end with another?",
    a: "Yes. Use a pattern search with the known letters in place and blanks for the rest to find words that match both conditions at once — for example, a 5-letter pattern with the first and last letters filled in.",
  },
  {
    q: "How do I find words of a specific length, like 5-letter words?",
    a: "You can filter results by word length, so searches for Wordle-style five-letter words or longer Scrabble plays only return matches of the length you need.",
  },
  {
    q: "Does this word finder support blank tiles or wildcards?",
    a: "Yes. Represent an unknown letter, such as a Scrabble blank tile, with an open slot in the pattern search, and the tool returns every word that fits regardless of which letter fills that spot.",
  },
  {
    q: "Can I filter results by letter order or position?",
    a: "Yes. The pattern search respects exact letter position, while the included-letters search treats letters as unordered, so you can use whichever matches the information you already have.",
  },
  {
    q: "Is this word finder official for Scrabble or Words With Friends?",
    a: "No. It's an independent reference tool and isn't affiliated with either game's publisher, so it's worth confirming unusual results against your game's built-in word checker.",
  },
  {
    q: "What dictionary does this tool use?",
    a: "It draws on the ENABLE word list, a broad, standard public-domain dictionary built for word games, rather than a single official tournament list like TWL06 or SOWPODS, so for close competitive calls, double-check against your specific game's checker.",
  },
  {
    q: "How do I use wildcards or blank letters for Scrabble?",
    a: "Enter your known letters and leave an open slot for the blank tile in the pattern search. The tool returns every valid word that fits, with the blank able to represent any letter.",
  },
  {
    q: "What are the highest-scoring words I can make with my letters?",
    a: "Search using all the letters on your rack, then sort results by Scrabble score to see the highest-scoring options first, since high-value letters like Q, Z, X, and J combined with a premium board square usually produce the biggest score.",
  },
  {
    q: "What are the best 5-letter words to open Wordle with?",
    a: "Common five-letter words that spread across frequent letters like A, E, R, S, and T tend to eliminate the most possibilities in one guess, making them strong opening choices.",
  },
  {
    q: "What is the longest word I can make with these letters?",
    a: "Search using every letter you're holding and sort by length; the longest valid word returned is generally your strongest play, especially if it uses all seven tiles in Scrabble for a bingo bonus.",
  },
  {
    q: "Are proper nouns, acronyms, or slang included in the results?",
    a: "No. Results are limited to standard dictionary entries, since proper nouns, acronyms, and slang are typically not valid plays in games like Scrabble or Words With Friends anyway.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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

export default function WordFinderFaqSection() {
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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether you're stuck mid-game with a rack full of awkward tiles or staring at a half-finished
          crossword grid, a good word finder saves you from guesswork. This tool, available free through{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, lets you search by starting letters,
          ending letters, included letters, or a fill-in-the-blanks pattern, so you get a list of valid,
          real words in seconds instead of flipping through a dictionary or mentally rearranging letters
          over and over.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Word Finder and How Does It Work</h2>
        <p style={pStyle}>
          A word finder is a search utility that matches letters you already have against a full
          dictionary word list, returning every valid word that fits your criteria. Instead of typing a
          complete word and checking if it exists, you work in reverse: you give the tool a piece of
          information, the letters you're holding, the position they need to appear in, or a pattern with
          blanks, and it returns the possible matches.
        </p>
        <p style={pStyle}>
          This tool supports several core search methods, which cover nearly every situation a word game
          or puzzle can throw at you:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Starting letters</strong> — find every word that begins with a specific letter or
            letter combination, useful when you know how a word opens but not how it continues.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Ending letters</strong> — the reverse case, ideal for crossword answers where the last
            letters are already filled in from an intersecting clue.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Included letters</strong> — search for words that contain certain letters anywhere in
            the word, regardless of position, which is the most common need in Scrabble and Words With
            Friends when you're working from a random tile rack.
          </li>
          <li>
            <strong>Fill-in-the-blanks pattern</strong> — enter a pattern like _E_D_N and the tool returns
            words that match the known letters while filling the unknowns, which is exactly how modern word
            puzzles like Wordle are structured.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Beyond these core methods, you can also narrow results by word length, so if you specifically
          need five-letter words for Wordle or seven-letter words for a Scrabble bingo, you can filter
          straight to that length instead of scrolling past irrelevant matches. Letter order and position
          matter too: a pattern search respects the exact position of each known letter, while an
          included-letters search treats letters as unordered, the difference between asking whether a word
          contains a T anywhere versus whether T is specifically the third letter.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Behind each search is a standard dictionary reference, so results are real, playable words rather
          than arbitrary letter strings, an important distinction if you're using the output in a game with
          strict word-validity rules. That said, results are limited to standard dictionary entries: proper
          nouns, acronyms, and slang generally aren't included, since these are typically not accepted as
          valid plays in games like Scrabble or Words With Friends anyway.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You'd Need a Word Finder: Practical Scenarios</h2>
        <p style={pStyle}>
          Word finders solve a genuinely common problem, and the reasons people reach for one vary more
          than most people expect:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>You're stuck with a difficult tile rack.</strong> In Scrabble or Words With Friends,
            you'll often end up with a combination of consonants and vowels that don't obviously form
            anything. Rather than losing a turn or playing a low-value word, searching by included letters
            surfaces options you wouldn't have spotted on your own, including longer, higher-scoring words.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You want to maximize your score, not just find a word.</strong> Casual players often
            settle for the first word they see. A word finder shows the full range of valid options at
            once, so you can compare word length, letter value, and board placement before committing to a
            move.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're solving a daily word puzzle.</strong> Games like Wordle give you partial
            information after each guess, certain letters are correct and in place, others are correct but
            misplaced, and some are eliminated entirely. The pattern search function mirrors this exactly:
            you can enter what you know and let the tool narrow down the remaining possibilities.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're filling in a crossword and one clue is blocking your progress.</strong> Crossword
            grids are interconnected, so a single wrong or missing answer stalls the whole puzzle. If you
            know some letters from intersecting words (say, the word starts with "CO" and ends with "ING"),
            the tool narrows a huge dictionary down to a short, workable list.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>You're building vocabulary or checking word validity.</strong> Students, writers, and
            language learners sometimes use word finders simply to explore words that fit a particular
            structure, for spelling practice, poetry with specific letter patterns, or verifying whether a
            word they're unsure about is actually valid.
          </li>
          <li>
            <strong>You're short on time.</strong> Word games are frequently timed, whether it's a turn
            timer in a multiplayer app or a personal streak you're trying to keep in a daily puzzle.
            Manually working through letter combinations is slow; a structured search returns results
            instantly.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Using the Tool for Scrabble and Words With Friends</h2>
        <p style={pStyle}>
          Scrabble and Words With Friends share a similar core challenge: you have a fixed set of tiles and
          need to form the highest-value word possible, ideally one that also uses the board's premium
          squares. The included-letters search is the most useful mode here, because it lets you enter all
          your available tiles and see every valid word that can be built from some or all of them, rather
          than requiring you to already know the exact letter order.
        </p>
        <p style={pStyle}>
          This is particularly valuable when you're holding difficult letters like Q, X, Z, or J, which
          many players struggle to place. Instead of holding onto them and wasting turns, a quick search of
          words containing that letter often reveals playable options you hadn't considered, turning a
          "dead" tile into points. It's also worth checking word length: longer words generally score more,
          and can trigger bonus scoring if they use all seven tiles on your rack in Scrabble.
        </p>
        <p style={pStyle}>
          If your rack includes a blank tile, you can represent it with an open slot in the pattern search,
          leaving a blank in place of the unknown letter returns every word that fits regardless of which
          letter fills that spot, mirroring exactly how a blank tile works at the table. This is also the
          fastest way to find the highest-scoring word available to you: search using every letter on your
          rack, including any blanks, then sort the results by Scrabble score and compare how many
          high-value letters, Q, Z, X, J, they use, since those combined with a premium square typically
          produce the biggest score. If you want to know the absolute ceiling for a given rack, the longest
          word returned that still fits your available letters is usually your strongest play, especially
          if it happens to use all seven tiles for a bingo bonus.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's worth being upfront that this is an independent reference tool, not an official Scrabble or
          Words With Friends product, and it isn't affiliated with either game's publisher. It draws on the
          ENABLE word list, a broad, standard public-domain dictionary built for word games, rather than a
          single official tournament word list such as TWL06 or SOWPODS, so because Words With
          Friends and Scrabble also use slightly different official word lists from each other, it's good
          practice to double-check unusual or obscure results against your specific game's built-in checker
          before playing them, especially in ranked or competitive matches.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Using the Tool for Wordle and Daily Word Puzzles</h2>
        <p style={pStyle}>
          Wordle-style games are pattern puzzles by design: you're told which letters are correct and
          placed correctly, which are present but misplaced, and which don't appear at all. The
          fill-in-the-blanks search directly mirrors this structure. If you know the second letter is "A"
          and the puzzle is five letters long, you can search a pattern like _A___ and instantly see every
          word that fits, then cross-reference against letters you've already eliminated.
        </p>
        <p style={pStyle}>
          This approach is especially useful later in a puzzle, when you have three or four confirmed
          letters but are struggling to think of a word that uses all of them in the correct order. Rather
          than guessing randomly and risking your streak, a pattern search narrows the field to a
          manageable, accurate shortlist.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're looking for a strong opening guess rather than solving a partially completed puzzle,
          favor common five-letter words that spread across frequent letters like A, E, R, S, and T. An
          opener with a wide, common letter mix tends to eliminate or confirm the most letters in a single
          guess, which is why so many popular Wordle strategies start there before narrowing down with the
          pattern search on later turns.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Using the Tool for Crosswords</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Crossword clues often give you a definition, but the real difficulty is fitting the correct word
          into a fixed number of letters while matching the letters supplied by intersecting answers. If
          you already have two or three letters locked in from crossing words, searching by starting
          letters, ending letters, or a combined pattern narrows a seemingly impossible clue down to just a
          handful of realistic candidates. This is especially useful for longer crossword answers, where
          mentally generating word options becomes significantly harder as length increases.
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
