import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { STRENGTHS } from "../../../utils/passwordGeneratorEngine";

const FAQ_ITEMS = [
  {
    q: "Is this password generator safe to use?",
    a: "Yes. Passwords are generated entirely in your browser with its cryptographically secure random number generator (crypto.getRandomValues). Nothing is sent to a server, logged or stored. Save Settings only remembers your options, never a password.",
  },
  {
    q: "How long should a password be?",
    a: "Longer is stronger. With all four character types, 12 characters gives about 73 bits of entropy (Strong) and 16 characters about 97 bits. For accounts you care about, 16 or more random characters, kept in a password manager, is a good choice.",
  },
  {
    q: "What is password entropy?",
    a: "Entropy measures how unpredictable a password is, in bits. For a random password it is the length × log2(number of possible characters). Each extra bit doubles the number of guesses a brute-force attack needs: 60 bits means 2^60 possibilities.",
  },
  {
    q: "How is the strength rating decided?",
    a: "From the entropy: under 36 bits is Very Weak, 36 to under 48 Weak, 48 to under 60 Good, 60 to under 120 Strong, and 120 bits or more Very Strong.",
  },
  {
    q: "What are ambiguous characters?",
    a: "Characters that are easy to confuse when read or typed, such as the letters i, I, l, L and o, O, the digits 1 and 0, and symbols like | ` ' - _ \" : ; . and ,. Excluding them makes a password easier to read out or type from paper, at the cost of a slightly smaller character pool.",
  },
  {
    q: "Why does 'No Repeated Characters' sometimes give an error?",
    a: "Without repeats, each character can be used only once, so the password can't be longer than the number of characters available. For example, with the default options there are 68 characters to choose from, so the longest non-repeating password is 68 characters.",
  },
  {
    q: "Does every password include each selected character type?",
    a: "Yes. One character from each ticked set (lower case, upper case, numbers, symbols) is always included, the rest are drawn at random from all ticked sets, and the result is shuffled.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: "14px 0 8px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 420 };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

const bandText = (i) => {
  const lo = i === 0 ? 0 : STRENGTHS[i - 1].max;
  const hi = STRENGTHS[i].max;
  if (i === 0) return `Under ${hi} bits`;
  if (hi === Infinity) return `${lo} bits or more`;
  return `${lo} to under ${hi} bits`;
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
        <h2 style={h2Style}>Random Password Generator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} password generator creates secure, random passwords from the character types you choose, and shows how
          strong each one is. Pick a length from 4 to 5,000 characters, choose lower case, upper case, numbers and symbols, and optionally
          leave out ambiguous characters and brackets or forbid repeated characters.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A password is typically a string of characters that may include letters, numbers, and symbols that can be used to access something,
          typically an account, and prevent others from accessing it. In today&apos;s Internet age, it is likely that most people have
          experience with having a password for some kind of account. As such, it is important to understand how to construct a strong
          password (or use a password generator) as well as to understand how to take measures to safeguard the password.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Password Strength</h2>
        <p style={pStyle}>
          Password strength is a measure of how effective a password is against being guessed or against brute-force attacks. Although it
          varies, usually, password strength is an estimate of how many trials would be required on average for someone to successfully guess
          the password. This is affected by the length, complexity, and unpredictability of the password. For example, if a password involves
          a person&apos;s name, birthday, or other personal information that typically would not be very difficult to find out, the password
          would likely make for a weak password.
        </p>
        <p style={pStyle}>
          Aside from the actual password, proper security controls play a significant role in reducing the risk of a security breach. Security
          controls include safeguards that are in place to detect, avoid, or minimize security risks. This includes controls such as two-step
          authentication for your password, or locking the account for a period of time after a given number of failed attempts.
        </p>
        <p style={pStyle}>The generator rates each password from its entropy:</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Entropy</th><th>Strength</th></tr></thead>
            <tbody>
              {STRENGTHS.map((s, i) => (
                <tr key={s.label}><td>{bandText(i)}</td><td style={{ fontWeight: 700 }}>{s.label}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Create a Secure Password</h2>
        <p style={pStyle}>
          Creating a secure password can be achieved by following certain rules that are designed to increase password security. This largely
          involves constructing a strong password, but includes other aspects such as changing a password periodically, as well as being aware
          of, and avoiding the use of common passwords (password, 123456, qwert...). Below are some rules that can be used for creating a strong
          password:
        </p>
        <ul style={listStyle}>
          <li>Include lower-case letter(s) [a-z]</li>
          <li>Include upper-case letter(s) [A-Z]</li>
          <li>Include numbers [0-9]</li>
          <li>Include symbols [!@#$%^&amp;*()...]</li>
          <li>Exclude words involving the user&apos;s personal information</li>
          <li>Exclude words found in a password blacklist: there are password blacklists that can be found on the Internet, or a company or other institution may have its own</li>
          <li>Exclude the company or institution name, as well as abbreviations of the name</li>
          <li>Exclude passwords that match common formats such as calendar dates, license plate numbers, phone numbers, or other common number formats</li>
        </ul>
        <p style={pStyle}>
          Also, many password policies typically include a minimum password length because generally, the longer a password, and the larger the
          variety of character types, the more secure the password.
        </p>
        <p style={pStyle}>
          The random password generator on this page provides the option to exclude ambiguous characters. This includes characters like the
          letters &quot;L&quot; and &quot;I&quot; which may be difficult to distinguish on a computer. This is particularly relevant when using a
          random password generator. An upper-case &quot;i&quot; can be difficult to distinguish from a lower-case &quot;L&quot; or the number 1
          in some cases. Confusion arising from ambiguous characters could potentially lock the user out of their own account. Note however,
          that excluding characters generally lowers the potential strength of a password.
        </p>
        <h3 style={h3Style}>Password entropy</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The password generator also determines the password entropy, measured in bits. The higher the entropy, the more difficult it will be
          for the password to be guessed. In the context of a brute force search (where every possibility is tested), a password entropy of 100
          bits would require 2<sup>100</sup> attempts for all possibilities to be exhausted. On average however, about half of these
          possibilities would need to be exhausted before the correct one is found in a brute force search. For a random password, entropy =
          length × log<sub>2</sub>(number of possible characters); with No Repeated Characters it is log<sub>2</sub> of N × (N − 1) × … for
          each character, where N is the number of possible characters.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Protect Your Password</h2>
        <p style={pStyle}>
          Protecting your password is as important as coming up with a strong password. Below are some suggested measures you can take to help
          protect your password. There are likely other measures a person can take, but the following are some guidelines that may help:
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Don&apos;t share your password with other people.</strong> Ideally, the user should be the only person who knows their
            password. Even if you trust the person that you share your password with, and even if that person has no malicious intent, they may
            be less careful about safeguarding your password than you would be. The more people who know your password, the more potential for
            your information to be stolen by someone else.
          </li>
          <li>
            <strong>Don&apos;t use the same password across different websites and accounts.</strong> Although it may be more convenient, having
            the same password for all your accounts, no matter how strong the password, may mean that a security breach on any single account
            compromises the safety of all of your accounts. A password manager can help you use different passwords for different accounts.
          </li>
          <li>
            <strong>Change your passwords regularly.</strong> This helps in cases where someone may know your password but may not immediately
            try to do something harmful: changing it limits the period over which they have access. If you saved your password on an old
            device you sold or threw away, changing it stops anyone from using the saved password.
          </li>
          <li>
            <strong>Never save your passwords to public devices.</strong> Ideally, try not to save passwords at all to reduce the risk of people
            gaining unwanted access to your accounts. In a similar vein, be careful of accessing sensitive accounts on unsecured public networks.
          </li>
          <li>
            <strong>Don&apos;t keep obvious lists of your passwords that someone may be able to access, physical or electronic.</strong> A sticky
            note on your desk, a document on your desktop named &quot;passwords&quot;, or a note on your phone could open you up to unnecessary
            risk. Phones and notebooks can be lost or stolen; consider using a password manager instead. More tools are in the{" "}
            {link("/calculators/internet-network", "internet and network calculators")}.
          </li>
        </ul>
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
