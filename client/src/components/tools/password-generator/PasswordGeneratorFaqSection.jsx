import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a password generator?", a: "A password generator is a tool that creates random passwords from a set of characters you choose, such as letters, numbers and symbols. Because the result has no pattern, it is far harder to guess or crack than a password a person makes up." },
  { q: "Is this password generator free?", a: "Yes. You can use the Tolz password generator for free, and you can generate as many passwords as you like." },
  { q: "Is a random password generator really random?", a: "A well-built one is random for every practical purpose. Good generators use a cryptographically secure random source, which makes the output unpredictable, even though no computer produces true physical randomness on its own." },
  { q: "Are passwords generated here stored or sent anywhere?", a: "The passwords are generated in your browser and are not sent across the internet. Copy the result into a password manager or the account you are securing, since that is where it needs to be kept." },
  { q: "How strong is a generated password?", a: "It depends on length and character types. The tool displays a strength rating and an entropy value in bits. A 16-character password using letters, numbers and symbols has roughly 105 bits of entropy, which is very strong for most uses." },
  { q: "What is password entropy?", a: "Entropy measures how unpredictable a password is, in bits. Higher entropy means more guesses are needed to crack it, and every extra bit doubles the effort in the worst case." },
  { q: "How long should my password be?", a: "Use at least 12 characters for general accounts, 16 as a good default, and 20 or more for email, banking and password manager master passwords." },
  { q: "Can a hacker crack a random password?", a: "Not by guessing, if it is long and unique. Attackers usually go after reused passwords, phishing pages, malware and poor storage instead of trying every combination." },
  { q: "Why exclude ambiguous characters?", a: "Characters like O and 0, or l, I and 1, look alike in many fonts. Excluding them avoids mistakes when you read or type a password by hand. It makes the character pool a bit smaller, so add a few characters of length." },
  { q: "Why would I exclude brackets?", a: "Brackets and braces can cause errors in some login forms, scripts and configuration files. Removing them makes the password easier to paste and use in those places." },
  { q: "What does No Repeated Characters do?", a: "It makes sure no character appears more than once in the password. Use it only when a site requires it, since it slightly reduces the number of possible passwords." },
  { q: "Does Save Settings save my password?", a: "No. It saves only your chosen options, such as length and character types, in your browser for your next visit." },
  { q: "Do I need symbols in my password?", a: "Symbols widen the character pool and raise entropy, but length matters more. If a site rejects symbols, use a longer password made of letters and numbers instead." },
  { q: "Is a random password better than one I create myself?", a: "Yes. People fall into predictable patterns, even when they try to be creative. A generator picks each character independently, so the result does not follow a guessable habit." },
  { q: "Can I use the same generated password on multiple sites?", a: "No. Reusing a password lets one breach expose all your accounts. Generate a new, unique password for each service." },
  { q: "How often should I change my passwords?", a: "Change a password when there is a reason, such as a breach, a suspicious login, a shared account losing a member or an old device being sold. Frequent forced changes without a reason are no longer recommended." },
  { q: "How do I remember a generated password?", a: "You should not need to. Store it in a password manager and let the manager fill it in." },
];

// The supplied FAQ schema covers 10 of the questions above, word for word.
const FAQ_SCHEMA_QUESTIONS = [
  "What is a password generator?",
  "Is this password generator free?",
  "Is a random password generator really random?",
  "Are passwords generated here stored or sent anywhere?",
  "How strong is a generated password?",
  "What is password entropy?",
  "How long should my password be?",
  "Can a hacker crack a random password?",
  "Why exclude ambiguous characters?",
  "Can I use the same generated password on multiple sites?",
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

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

export default function PasswordGeneratorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.filter((item) => FAQ_SCHEMA_QUESTIONS.includes(item.q)).map((item) => ({
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

      <Card title="How Do Random Password Generators Work?">
        <P>
          A password generator follows a simple recipe. First, it builds a pool of allowed characters from the options you pick, such as lowercase
          letters, uppercase letters, numbers and symbols. Next, it picks one character from that pool for each position in the password, using a
          random number to make each choice. It repeats this until the password reaches the length you set, then shows you the result.
        </P>
        <P>
          Nothing about you goes into the process. Your name, your birthday and the words you like play no part, so there is nothing for an
          attacker to learn about you and use against the password. That is the main reason a generated password beats one a person makes up.
          People lean on patterns: a capital letter at the start, a few digits at the end, an “@” in place of an “a”. Cracking tools try those
          habits first. A password generator has no habits.
        </P>
        <P>
          On this page, the work happens in your browser. When you press Generate, the password is built on your own device, and the strength and
          entropy readout appear right next to it.
        </P>
      </Card>

      <Card title="Is a Random Password Generator Really Random?">
        <P>
          In practice, yes, as long as the generator is built correctly. Computers do not produce randomness on their own. Most software uses a
          pseudo-random number generator, which is a math formula that turns a starting value, called a seed, into a long stream of numbers that
          look random. If the formula is weak or the seed is easy to guess, someone who knows how it works can predict the output. That is the
          problem with the basic random functions meant for games and simple simulations.
        </P>
        <P>
          Security work uses a stronger kind, called a cryptographically secure random number generator. Modern browsers and operating systems
          include one. It collects unpredictable input from the device, such as the timing of hardware events, and processes it so that earlier
          output tells you nothing about the next number. A generator that draws from this kind of source is random for every practical purpose,
          even if it is not “true” randomness in the physics sense.
        </P>
        <P>
          Two other things matter just as much. The generator should run on your device, so the password is never sent anywhere. And your own
          settings shape the result: a short length or a tiny character set makes any password easier to guess, no matter how good the random
          source is.
        </P>
      </Card>

      <Card title="Is There an Algorithm to Create a Truly Random Password?">
        <P>
          No algorithm can create true randomness by itself. An algorithm is a fixed set of steps, and a fixed set of steps gives the same output
          when it gets the same input. What an algorithm can do is turn unpredictable input into a good password. The usual process is to collect
          unpredictable data from the device, feed it into a cryptographically secure generator, and use the numbers it returns to select
          characters from the pool.
        </P>
        <P>
          A careful version also avoids a flaw called modulo bias. If random numbers are squeezed into a pool whose size does not divide evenly into
          the number range, some characters come up slightly more often than others. Well-built generators throw out the numbers that would cause
          that skew, so every character has the same chance.
        </P>
        <P>
          True randomness does exist. It comes from physical sources such as atmospheric noise or radioactive decay, and rolling dice works for
          people who want to do it by hand. For passwords, the difference does not matter. A cryptographically secure generator is unpredictable
          enough that no attacker can tell it apart from the real thing. What counts is that each character is chosen independently, with no
          pattern, and that the password is long enough.
        </P>
      </Card>

      <Card title="How to Create Random Passwords With Upper and Lower Case Letters, Numbers and Symbols">
        <P>
          If you are wondering how to create a strong password that includes every character type, the process takes about ten seconds with this
          strong password generator.
        </P>
        <List ordered items={[
          ["Set the length.", "Use the slider, which runs from 4 to 100 characters, or type a number in the box. Start at 16 characters for important accounts and go to 20 or more for critical ones, such as email and banking. Need a 32-character password? Set the length to 32."],
          ["Select the character types.", "Turn on lowercase letters, uppercase letters, numbers and symbols. Leave all four on unless the site you are signing up for rejects some of them."],
          ["Apply exclusions if needed.", "Use the ambiguous-character and bracket options when you plan to type the password by hand, or when the field you are pasting into is picky."],
          ["Generate, check and copy.", "Press Generate, look at the strength and entropy display, press Regenerate if you want a different result, then use Copy Password."],
        ]} />
        <P>
          Most sites that require a mix of character types want at least one lowercase letter, one uppercase letter, one number and one symbol. A
          long password with all four types turned on will almost always contain each of them. If a site is strict about it, glance at the result
          before you paste it.
        </P>
        <P>
          Save the password right away in a password manager or the account’s password field. A random password cannot be recalled from memory, so
          it should not live only on your screen.
        </P>
      </Card>

      <Card title="Password Generator Options: Length, Character Types and Exclusions">
        <P>The tool gives you control over the details that decide how strong a password is and where it can be used.</P>
        <Lead lead="Password length.">
          Length is the biggest factor in strength. The slider covers 4 to 100 characters, and the box next to it accepts longer values if you ever
          need them. Each extra character multiplies the number of possible passwords, so going from 12 to 16 characters does far more than adding
          one more symbol type.
        </Lead>
        <Lead lead="Include lowercase (a-z) and uppercase (A-Z).">
          Together these give you a base pool of 52 characters. Mixing both cases is an easy way to widen the pool without making the password
          harder to type.
        </Lead>
        <Lead lead="Include numbers (0-9).">Digits add ten more possibilities to every position, and almost every login form accepts them.</Lead>
        <Lead lead="Include symbols.">
          Special characters widen the pool further, which raises the strength of a password of any length. The tool draws from standard keyboard
          punctuation. Some older systems restrict which symbols they allow, so you may occasionally need to turn this option off.
        </Lead>
        <Lead lead="Exclude ambiguous characters.">
          This removes characters that are easy to misread or mistype, such as the lowercase i, capital I, lowercase l, capital L, the digit 1 and
          the vertical bar, along with the letter o, capital O and the digit 0. It also removes a few punctuation marks, including quotes, dashes,
          periods, colons and semicolons. If you will ever read a password aloud, copy it by hand or type it from a printout, this option prevents
          typing mistakes that could lock you out of your own account. The trade-off is a smaller character pool, so the password is slightly
          weaker at the same length. Add a few extra characters to make up for it.
        </Lead>
        <Lead lead="Exclude brackets.">
          Parentheses, square brackets, curly braces and angle brackets can cause trouble in some login forms, command lines and configuration
          files. Turning them off gives you a password that pastes cleanly into more places.
        </Lead>
        <Lead lead="No repeated characters.">
          When this is on, no character appears twice in the password. It helps if a site’s rules ban repeats. It also shrinks the number of
          possible passwords a little, and it means the password cannot be longer than the number of characters in the pool, so use it only when
          you need it.
        </Lead>
        <Lead lead="Save Settings.">
          This keeps your chosen options, not the password itself, in this browser for your next visit, so you do not have to set everything up
          again.
        </Lead>
        <P>
          Because every option is optional, one password generator covers very different cases: a long, symbol-heavy password for a password
          manager, or a shorter letters-and-numbers password for a device that rejects punctuation.
        </P>
      </Card>

      <Card title="Password Strength and Entropy Explained">
        <P>
          Password strength is an estimate of how many guesses it would take to crack a password, on average. It depends on length, on how many
          character types are in use, and on how unpredictable the result is. A password built from a name, a birthday or another detail that is
          easy to find out is weak no matter how it is dressed up. A label such as “Good” or “Strong” is a handy summary, but entropy is the
          measurement behind it, so the tool shows both.
        </P>
        <P>
          Entropy is measured in bits. It is calculated as the password length multiplied by the base-2 logarithm of the character pool size, and
          every extra bit doubles the number of guesses an attacker would need. A password with 100 bits of entropy has 2^100 possible combinations.
          In a brute-force search, where every possibility is tried, an attacker would on average get through about half of them before landing on
          the right one.
        </P>
        <P>A few examples show how much the settings matter:</P>
        <List items={[
          ["", "An 8-digit numeric password has a pool of 10 characters and about 27 bits of entropy. A modern cracking setup can exhaust that almost instantly."],
          ["", "A 12-character password using only lowercase letters has about 56 bits."],
          ["", "A 12-character password using all four character types (a pool of roughly 94 characters) has about 79 bits."],
          ["", "A 16-character password using all four types has about 105 bits."],
          ["", "A 20-character password using all four types has about 131 bits, which is far beyond what brute force can realistically reach."],
        ]} />
        <P>
          Excluding characters has a small cost. A 16-character password drawn from a pool of 76 characters instead of 94 lands near 100 bits
          instead of 105. That is still very strong, but it shows why a little extra length is a better fix than a bigger pool.
        </P>
        <P>
          These figures describe a truly random password. The entropy of a password you wrote yourself is usually much lower than its length
          suggests, because predictable patterns shrink the real search space. For ordinary online accounts, aim for roughly 70 bits or more. For
          email, banking, your password manager’s master password and other accounts that can unlock everything else, aim higher.
        </P>
      </Card>

      <Card title="How Effective Are Long, Random Passwords?">
        <P>
          Very effective, and the reason is simple math. Each character you add multiplies the number of possible passwords by the size of the
          pool. With all four character types, that is a factor of about 94 per character. An 8-character password has around 52 bits of entropy. A
          16-character one has around 105 bits. That is not twice as hard to crack. It is roughly 2^52 times harder.
        </P>
        <P>
          Long random passwords also defeat the shortcuts attackers rely on. Dictionary attacks work through lists of real words and common
          phrases, and pattern attacks try things like a word plus a year plus an exclamation mark. A random string contains none of those, so the
          cracking tool has nothing to lean on and must try raw combinations.
        </P>
        <P>
          The effect has limits. A long random password only protects you if it is unique to one account and stored safely. If you reuse it on five
          sites, or leave it in a plain text file, its length no longer helps.
        </P>
      </Card>

      <Card title="How Can a Hacker Crack a Random Password With Billions of Possibilities?">
        <P>
          Usually, they don’t crack it by guessing every combination. That approach fails against a long random password. To see why, imagine an
          attacker who can test one trillion guesses per second against a 100-bit password. Working through the whole space would take tens of
          billions of years, and finding it on average would take about 20 billion, which is longer than the universe has existed.
        </P>
        <P>So attackers go around the password instead. The common routes are:</P>
        <List items={[
          ["Reused passwords.", "If you used the same password on another site that was breached, attackers try it everywhere."],
          ["Phishing.", "A fake login page that tricks you into typing the password works no matter how strong it is."],
          ["Malware and keyloggers.", "Software on your device can record what you type or copy."],
          ["Poor storage.", "A password saved in a plain text file, a sticky note or an unprotected spreadsheet is easy to take."],
          ["Weak choices.", "Short passwords and predictable patterns fall quickly to dictionary and pattern attacks."],
        ]} />
        <P>
          Security controls add another layer. Two-step authentication means a stolen password is not enough on its own. Lockouts and rate limits
          stop an attacker from making unlimited guesses against a live login. A strong random password closes the guessing route, and these
          controls help cover the rest.
        </P>
      </Card>

      <Card title="Why Is a Strong Random Password Generator Your Best Defense Against Hackers?">
        <P>
          It is the foundation of a good defense, not the whole of it. A strong random password generator solves the problem people are worst at:
          coming up with something long, unpredictable and different for every account. Nobody can invent and remember dozens of 16-character
          random strings, but a generator can produce them on demand, and a password manager can store them.
        </P>
        <P>
          That changes what a breach costs you. When every account has its own password, one leak exposes one account, not your whole digital life.
          Pair that with two-step authentication on your important accounts, and an attacker needs far more than a leaked password to get in. The
          U.S. Cybersecurity and Infrastructure Security Agency makes the same core recommendations:{" "}
          <Ext href="https://www.cisa.gov/secure-our-world/use-strong-passwords">long, random, unique passwords stored in a password manager</Ext>.
        </P>
      </Card>

      <Card title="What Are Some Good Ways to Generate Random Passwords?">
        <P>There are several reliable options, and each fits a different situation.</P>
        <List items={[
          ["A password manager’s built-in generator.", "This is the most convenient way, since the password is created and saved in one step."],
          ["A browser-based generator like this one.", "It is useful when you want control over length, character types and exclusions, and when you want to see the strength and entropy before you commit to a password."],
          ["Dice-based passphrases.", "Rolling dice to pick words from a list gives you a passphrase you can actually memorize. It suits the few secrets you must remember, such as a device login."],
          ["Your device’s own suggestion feature.", "Many phones and browsers offer to create and save a strong password when you sign up. It works well if you trust where it is stored."],
        ]} />
        <P>
          What to avoid: making up a “random-looking” password yourself, building one from a favorite phrase with a few swaps, or using any
          generator that sends the password over the internet or asks for personal details first.
        </P>
      </Card>

      <Card title="When and Why You Need a Password Generator">
        <P>A secure password generator is useful far more often than people expect. These are the situations where it earns its place.</P>
        <List items={[
          ["Creating a new account.", "Every new signup is a chance to start with a clean, unique password instead of recycling an old one."],
          ["Replacing reused passwords.", "Credential stuffing attacks take passwords leaked from one breach and try them on other services. Generating a different password for each service stops that chain."],
          ["After a data breach.", "When a service you use announces a breach, change that password immediately, and change it anywhere else you used it. A generated replacement shares nothing with the old one."],
          ["Setting up a Wi-Fi network or router.", "Default and hand-made Wi-Fi passwords are common weak points. A long random password protects the network, and you only type it once per device."],
          ["Protecting shared and work accounts.", "Team logins, admin panels, staging servers and databases should never rely on a password someone made up. Generate one, store it in a shared vault and rotate it when people leave."],
          ["Developers and system administrators.", "Test accounts, API credentials, database users and service accounts need strong secrets. The exclude-brackets option is handy for values that end up in config files or command-line arguments."],
          ["Securing your password manager.", "The master password protects everything inside the vault. A long random master password, or a passphrase, is a sensible choice here."],
          ["Helping family members.", "Older relatives and children often use simple passwords. Generating a strong one with the ambiguous characters excluded makes it easier for them to read and type correctly."],
        ]} />
      </Card>

      <Card title="How Long Should a Password Be?">
        <P>This is one of the most searched questions about passwords, and the honest answer depends on what the password protects.</P>
        <P>
          For most accounts, 12 characters is a reasonable minimum, and 16 is a better default if the site allows it. For high-value accounts, such
          as primary email, banking, cloud storage and your password manager, 20 characters or more gives a comfortable safety margin. Since you will
          paste it rather than type it, the extra length costs you nothing.
        </P>
        <P>
          Many password policies set a minimum length for this reason: in general, the longer the password and the more character types it uses,
          the harder it is to crack. Current guidance from{" "}
          <Ext href="https://pages.nist.gov/800-63-4/sp800-63b.html">NIST’s digital identity guidelines</Ext> has moved away from forcing
          complicated composition rules and frequent forced changes. It stresses length, checking passwords against lists of known-breached
          passwords, and allowing long passwords. The practical advice is the same: make it long, make it unique, and change it when there is a
          reason to.
        </P>
        <P>
          Some websites still cap password length or reject certain symbols. If the first attempt is refused, lower the length slightly or switch off
          the symbol option, and keep the result as long as the site allows.
        </P>
      </Card>

      <Card title="Random Password or Passphrase?">
        <P>
          A random string of characters is the strongest choice per character, but it is hard to remember. A passphrase made of several unrelated
          words is easier to memorize and can also be strong when it is long enough and truly random.
        </P>
        <P>
          A reasonable split looks like this. Use random passwords from a generator for the great majority of accounts, and store them in a password
          manager. Use a memorized passphrase only for the few secrets you must remember, such as your device login and your password manager’s
          master password. Avoid phrases drawn from song lyrics, quotes or personal facts, since those are predictable.
        </P>
      </Card>

      <Card title="Rules for Creating a Secure Password">
        <P>
          A generator takes care of most of these rules for you, but they are worth knowing, especially if you ever create a password by hand or
          review a company’s password policy.
        </P>
        <List items={[
          ["", "Use all four character types when the site allows it: lowercase, uppercase, numbers and symbols."],
          ["", "Skip personal information. Names, birthdays, phone numbers, addresses and pet names are easy to find or guess."],
          ["", "Skip common passwords. Entries like “password”, “123456” and “qwerty” appear at the top of every cracking list. Many companies and institutions keep their own blocklists of banned passwords."],
          ["", "Skip company or school names, and abbreviations of them."],
          ["", "Skip common formats, such as calendar dates, license plate numbers and phone numbers."],
          ["", "Skip predictable substitutions. Swapping “s” for “$” or “a” for “@” fools nobody, because cracking tools try those swaps automatically."],
          ["", "Skip keyboard patterns. Strings like “1q2w3e” are on every common-password list."],
          ["", "Do not rely on a short password with a few tricks. A short password with one symbol is weaker than a long one made of plain random characters."],
        ]} />
      </Card>

      <Card title="How to Protect Your Password">
        <P>A strong password only helps if it stays private. These habits matter as much as the password itself.</P>
        <List items={[
          ["Keep it to yourself.", "Ideally, you are the only person who knows your password. Even a trusted friend may be less careful with it than you would be, and the more people who know it, the more chances it has to leak."],
          ["Never reuse it.", "One breach on any site exposes every account that shares the password, however strong it is. A password manager makes unique passwords practical, since it remembers them for you."],
          ["Change it when there is a reason.", "Change a password after a breach, after a suspicious login, or when a shared account loses a member. Also change it if it was saved on an old phone or computer that you sold, gave away or threw out. Doing so cuts off anyone who still has the old device."],
          ["Do not save it on public devices.", "Avoid saving passwords on a shared computer, and be careful about signing in to sensitive accounts over an unsecured public network."],
          ["Do not keep an obvious list.", "A sticky note on your desk, a document on your desktop called “passwords” or a note on your phone is easy for someone else to find. Phones and notebooks get lost or stolen. A password manager is a safer home for your passwords."],
        ]} />
      </Card>

      <Card title="Is It Safe to Use an Online Password Generator?">
        <P>This is a fair question, because a password generator handles something sensitive. Safety depends on where the password is created.</P>
        <P>
          This tool generates passwords in your browser. The result is built on your own device as you use the page, and it is not sent across the
          internet. This is the approach security-minded users should look for in any online password generator. It also means the strength and
          entropy calculation is done locally.
        </P>
        <P>
          The tool is free to use, and its job is limited to one thing: producing a password for you to copy. No generator can protect a password
          after you have copied it, so a few habits still matter:
        </P>
        <List items={[
          ["", "Paste the password into a password manager or the target field right away, not into a chat, email or note that others can see."],
          ["", "Avoid generating passwords on shared or public computers, and clear your clipboard afterward if your system does not do it automatically."],
          ["", "Turn on two-step authentication wherever it is offered. A strong password and a second factor protect an account far better than either one alone."],
        ]} />
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
