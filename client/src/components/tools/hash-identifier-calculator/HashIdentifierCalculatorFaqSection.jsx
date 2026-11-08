import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I identify a hash function?",
    a: "By the length of the digest, which is the only practical way to narrow down the candidates: count how many hex digits (or bytes) the hash has and compare it with a table of digest sizes. A 32-digit hash is 128 bits (16 bytes), like MD5 or NTLM; a 64-digit one is 256 bits, like SHA-256. The hash identifier does this for you.",
  },
  {
    q: "What are the most popular hash types?",
    a: "MD5 and SHA-1 are the best-known historic hash types, but both have weak security. SHA-256, SHA3-256 and RIPEMD-256 are strong modern hash types, and SHA-512 and SHA3-512 are very strong ones for high-security needs.",
  },
  {
    q: "What are pseudorandom numbers?",
    a: "Numbers that look random but come from a deterministic algorithm: once you know the seed, the whole sequence can be recreated. They are used in simulations, Monte Carlo methods and cryptography.",
  },
  {
    q: "Which hash types are recommended for cryptography?",
    a: "SHA-256 and SHA-512 (from the SHA-2 family) and SHA-3 are considered safe. For password storage, also salt the passwords and use a dedicated password hashing function such as PBKDF2, bcrypt, scrypt or Argon2, which adds iterations and memory hardness on top of these hash functions.",
  },
  {
    q: "What is a salt in passwords?",
    a: "A random value added to a password before hashing, so every password hash is unique. Even two users with the same password get completely different hashes, thanks to the avalanche effect, which defeats precomputed tables such as rainbow tables.",
  },
  {
    q: "Is the hash I enter kept private?",
    a: "Yes. The identification runs entirely in your browser: nothing you paste is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SIZES = [
  ["MD5", "128", "16", "32"], ["NTLM", "128", "16", "32"], ["SHA-1", "160", "20", "40"], ["RIPEMD-160", "160", "20", "40"],
  ["SHA-256", "256", "32", "64"], ["SHA3-256", "256", "32", "64"], ["RIPEMD-256", "256", "32", "64"], ["SHA-384", "384", "48", "96"],
  ["SHA-512", "512", "64", "128"], ["SHA3-512", "512", "64", "128"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

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

export default function HashIdentifierCalculatorFaqSection() {
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
        <h2 style={h2Style}>Hash Identifier</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} hash identifier recognizes which hash functions could have produced a hash. If hash types are new to you,
          here are the basics:
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>What hashes are and why we need them;</li>
          <li>The role hashing plays in password security and data integrity; and</li>
          <li>How to identify a hash type by hand or with the identifier.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Hash?</h2>
        <p style={pStyle}>
          A hash, also called a message digest or just a digest, is the output of a hash function: a string of digits and letters. More
          precisely, it is a hexadecimal number, so the letters only run from a to f.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Think of hashes as digital fingerprints. They show whether two pieces of data are identical, for example whether a copy of a
          document matches the original or a download hasn&apos;t been tampered with. They also protect passwords: to check a login, the
          system compares the hash of what you typed with the stored hash of your password.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are Hash Functions?</h2>
        <p style={pStyle}>A hash function maps a string of characters to another string, the hash. Cryptographic hash functions are:</p>
        <ul style={listStyle}>
          <li><strong>Deterministic</strong>: the same input always gives the same output.</li>
          <li>
            <strong>Sensitive</strong>: a tiny change in the input gives a completely different hash (the avalanche effect). The MD5 of
            &quot;message&quot; is <code style={mono}>78e731027d8fd50ed642340b7c9a63b3</code>, while &quot;massage&quot; gives{" "}
            <code style={mono}>fd1b1aaa073bde801a551157fecc7dd4</code>.
          </li>
          <li><strong>Fixed-size</strong>: they accept input of any length and (in most cases) produce hashes of one fixed size.</li>
          <li><strong>One-way</strong>: with current technology it&apos;s virtually impossible to recover the input from its hash.</li>
          <li><strong>Collision-resistant</strong>: two different inputs should almost never give the same hash.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hash functions are also the key ingredient of hash tables, a data structure for very fast lookups; this tool deals with hashing in
          the security sense.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Identify a Hash Function?</h2>
        <p style={pStyle}>
          The only practical way is by the length of the digest. Count the hex digits (each is 4 bits, so two make a byte) and compare with
          the digest sizes of popular hash types:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Name</th><th>Bits</th><th>Bytes</th><th>Hex digits</th></tr></thead>
            <tbody>{SIZES.map(([n, b, y, h]) => <tr key={n}><td style={{ fontWeight: 600 }}>{n}</td><td style={center}>{b}</td><td style={center}>{y}</td><td style={center}>{h}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Functions with the same digest size can&apos;t be told apart from the hash alone, which is why the identifier lists every
          candidate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Hash Identifier</h2>
        <p style={pStyle}>
          The identifier knows 36 hash functions, from CRC32 (32 bits, 8 hex digits) through the MD, SHA, RIPEMD and Tiger families up to
          FNV-1 1024 (1,024 bits, 256 hex digits).
        </p>
        <ol style={olStyle}>
          <li>Paste the hash (digest) into the box. Upper or lower case and a 0x prefix are fine.</li>
          <li>Click Calculate.</li>
          <li>See the hash functions that could have produced it, with the digest size in bits and bytes.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>Try one of the example hashes to see how it works.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is Hashing the Same as Encryption?</h2>
        <ul style={listStyle}>
          <li>
            <strong>Encryption</strong> must be reversible so the original message can be recovered, so long messages produce equally long
            ciphertexts.
          </li>
          <li>
            <strong>Hashing</strong> produces digests of a constant length, whether you hash your name or all 24 books of the Iliad. The hash
            is a fingerprint that lets you detect changes, not a way to get the original back.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More tools are in the {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
