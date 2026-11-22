import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a hash identifier?", a: "A hash identifier is an online tool that examines a hash string and lists the algorithms that could have produced it. It relies on digest length and character set, so it returns likely matches such as MD5, SHA-1, or SHA-256 rather than one guaranteed answer." },
  { q: "How do I identify a hash type online?", a: "Paste the hash into the hash identifier and click Calculate, then read the candidate list. Confirm using context, such as the software that generated the hash, or by hashing a known value and comparing the output." },
  { q: "How can I tell MD5 from SHA-1?", a: "Count the digits. MD5 produces 32 hexadecimal digits and SHA-1 produces 40. SHA-256 produces 64 and SHA-512 produces 128. Length separates the families, and context separates lookalikes within a length." },
  { q: "Can a hash identifier crack or decrypt a hash?", a: "No. Hashing is one-way, and identification only reads the length and format of the string. Recovering the original input needs separate techniques and is outside what a hash identifier does." },
  { q: "Why does the hash identifier show several results?", a: "Different algorithms often share an output size. A 32-digit hex string can be MD5, MD4, NTLM, or others, so the tool lists every plausible match and leaves the final call to you and your context." },
  { q: "What hash is 64 characters long?", a: "Most often SHA-256. SHA3-256, RIPEMD-256, and BLAKE2s also produce 64 hex characters, so check where the hash came from before assuming." },
  { q: "Does the hash identifier accept uppercase letters or a 0x prefix?", a: "Yes. Upper case works, and so does an optional 0x prefix. The input must otherwise contain only hexadecimal digits, 0–9 and a–f." },
  { q: "Is the hash identifier free, and do I need to sign up?", a: "The hash identifier is free, and you do not need an account to run a check." },
  { q: "Can it identify bcrypt or Argon2 hashes?", a: "This tool matches raw digests by length and format. Bcrypt and Argon2 strings carry their own prefixes, such as 2b or argon2id, which name the scheme directly." },
  { q: "What is the difference between a hash function and a hash algorithm?", a: "The terms are used interchangeably. Strictly, the algorithm is the written set of steps, and the function is the mapping or the code that carries those steps out." },
  { q: "Is MD5 still safe to use?", a: "Not for security. MD5 is fine for spotting accidental file corruption, but practical collisions make it unsuitable for signatures, certificates, or password storage." },
];

// The supplied FAQ schema matches the list above except that it writes the
// hex range as "0-9 and a-f" with plain hyphens.
const plainDashes = (s) => s.replace(/–/g, "-");

const LENGTH_HEADERS = ["Algorithm", "Bits", "Bytes", "Hex digits"];
const LENGTH_ROWS = [
  ["CRC32", "32", "4", "8"],
  ["CRC64, FNV-1 64, FNV-1a 64", "64", "8", "16"],
  ["MD5", "128", "16", "32"],
  ["NTLM", "128", "16", "32"],
  ["SHA-1", "160", "20", "40"],
  ["RIPEMD-160", "160", "20", "40"],
  ["Tiger-192", "192", "24", "48"],
  ["SHA-224", "224", "28", "56"],
  ["SHA-256", "256", "32", "64"],
  ["SHA3-256", "256", "32", "64"],
  ["RIPEMD-256", "256", "32", "64"],
  ["SHA-384", "384", "48", "96"],
  ["SHA-512", "512", "64", "128"],
  ["SHA3-512", "512", "64", "128"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const codeStyle = { fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--text-primary)", wordBreak: "break-all" };

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
const C = ({ children }) => <code style={codeStyle}>{children}</code>;
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 340 }}>
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

export default function HashIdentifierCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: plainDashes(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Are Hash Functions?">
        <P>
          A hash function takes input of any size, such as a single word, a large file, or an entire database, and turns it into a short string of
          fixed length called a hash. You will also hear it called a digest or a message digest. The output is usually written in hexadecimal,
          which means it uses only the digits 0 to 9 and the letters a to f.
        </P>
        <P>
          A good way to picture a hash is as a digital fingerprint. Two identical files produce the same hash, so comparing hashes is a fast way to
          confirm that a copy matches the original or that a download was not changed on the way to you. Cryptographic hash functions share a few
          key properties:
        </P>
        <List items={[
          ["Deterministic.", "The same input always produces the same hash."],
          ["Avalanche effect.", <>A tiny change in the input produces a completely different hash. The MD5 hash of <C>hello</C> is <C>5d41402abc4b2a76b9719d911017c592</C>, but <C>Hello</C> with a capital H gives <C>8b1a9953c4611296a827abf8c47804d7</C>.</>],
          ["Any input, fixed output.", "The input can be any length. Most functions return a hash of one fixed size, although a few can produce different lengths."],
          ["Hard to invert, hard to collide.", "Going from a hash back to the input is not practical, and finding two different inputs with the same hash (a collision) should be extremely difficult."],
        ]} />
        <P>
          Hash functions also show up outside security. A hash table is a data structure that uses a hash to jump straight to stored data instead of
          searching through it. That is a different job from checking file integrity or storing <Link to="/tools/password-generator" className="inline-home-link">passwords</Link>, but the core idea is the same: turn data
          into a short, predictable value.
        </P>
      </Card>

      <Card title="What Is the Simplest Example of a Hash Function?">
        <P>
          The simplest hash function you can build by hand is a sum. Add up the character codes of a piece of text, divide the total by 256, and
          keep the remainder. Every input, no matter how long, lands on a number between 0 and 255. It is deterministic and fast, which are two of
          the properties a hash function needs.
        </P>
        <P>
          It also shows why real designs need more work. The words <C>ab</C> and <C>ba</C> add up to the same number, so different inputs collide
          right away, and anyone can build text that produces a chosen result. Real functions mix the bits of the input many times to avoid this.
          CRC and FNV, both of which this tool recognizes, are still simple and fast, but they are built for speed and error detection rather than
          security.
        </P>
      </Card>

      <Card title="What Is the Standard Hash Function?">
        <P>
          There is no single standard hash function for every job. The closest thing to an official reference is the work published by NIST, the
          U.S. National Institute of Standards and Technology. Its Secure Hash Standard (FIPS 180-4) defines SHA-1 and the SHA-2 family, which
          includes SHA-224, SHA-256, SHA-384, and SHA-512. A second standard (FIPS 202) defines SHA-3. You can read more on the NIST{" "}
          <Ext href="https://csrc.nist.gov/projects/hash-functions">hash functions page</Ext>.
        </P>
        <P>
          In practice, SHA-256 is the default choice for most new work, including checksums, digital signatures, and blockchain systems. MD5 and
          SHA-1 are still common in older software, but they are not recommended where security matters. Password storage has its own standard
          approach, covered later on this page.
        </P>
      </Card>

      <Card title="What Are the Different Types of Hash Functions?">
        <P>Hash functions fall into a few groups, and knowing which group a result belongs to tells you what the hash was meant for.</P>
        <Lead lead="Cryptographic hash functions">
          are designed to be one-way and collision resistant. MD5, SHA-1, the SHA-2 and SHA-3 families, RIPEMD-160, Tiger, and BLAKE2 all belong
          here, though MD5 and SHA-1 are now considered weak.
        </Lead>
        <Lead lead="Non-cryptographic hash functions">
          are built for speed. CRC is used to catch accidental errors in stored or transmitted data, and FNV is popular in hash tables. The tool
          labels these as checksums or fast non-cryptographic hashes, because they offer no protection against deliberate tampering.
        </Lead>
        <Lead lead="Password hashing functions">
          such as bcrypt, scrypt, and Argon2 are deliberately slow and add a random salt, which makes large-scale guessing expensive.
        </Lead>
        <Lead lead="Keyed hashes">
          such as HMAC mix a secret key into the hash so only someone with the key can produce a valid value. An HMAC has the same length as the
          hash underneath it.
        </Lead>
      </Card>

      <Card title="What Is the Difference Between a Hash Function and a Hash Algorithm?">
        <P>
          In everyday use, the two terms mean the same thing, and most documentation swaps them freely. If you want to be precise, the algorithm is
          the written set of steps, and the function is the mapping those steps create or the code that carries them out. SHA-256 is an algorithm
          defined in a standard. The <C>sha256sum</C> command and the SHA-256 call in a programming library are implementations of it.
        </P>
        <P>
          This matters for identification because a hash identifier names the algorithm. Any correct implementation of that algorithm returns the
          same hash for the same input, whether it ran on Linux, in a web app, or inside a database.
        </P>
      </Card>

      <Card title="Why Are Hash Functions One Way?">
        <P>
          Hash functions throw information away. A file of any size gets squeezed into a fixed number of bits, such as 256. Many different inputs
          map to each possible hash, so the hash simply does not hold enough information to rebuild the original.
        </P>
        <P>
          The design adds a second layer of protection. The steps scramble the bits so thoroughly that there is no known shortcut for working
          backward from a hash to an input. This property is called preimage resistance.
        </P>
        <P>
          It also separates hashing from encryption. Encryption is two-way: with the right key, you get the original data back. Hashing has no key
          and no decrypt step, so there is nothing to undo.
        </P>
      </Card>

      <Card title="Why Can’t You Reverse a Hash Like MD5, MD4, or SHA?">
        <P>
          There is no practical way to reverse them, and the reason is not a lack of computing power. A 128-bit MD5 hash of a one-gigabyte file
          cannot contain the file, so the file cannot be recovered from it. MD5, MD4, and SHA behave the same way on this point.
        </P>
        <P>
          What people call cracking a hash is something else: guess an input, hash it, and compare the result to the target. This works only when
          the original was short or predictable, such as a common password, because the guesser only has to try likely candidates. It is guessing,
          not reversing. Long, random inputs and slow, salted password hashing hold up well against it.
        </P>
        <P>A hash identifier does none of this. It only tells you which algorithm a hash probably came from.</P>
      </Card>

      <Card title="Why Do We Use Hashing?">
        <P>Hashing is useful because it gives you a short, fixed-size stand-in for data of any size. The most common uses are:</P>
        <List items={[
          ["Checking file integrity.", "Software sites publish the hash of a download. You hash your copy and compare. A match means the file is identical, and a mismatch means it was corrupted or altered."],
          ["Storing passwords.", "A well-built system stores a hash of the password instead of the password. At login, it hashes what you typed and compares the two."],
          ["Digital signatures.", "Signing software usually signs the hash of a document instead of the whole document, which is faster."],
          ["Version control and deduplication.", "Git identifies commits by hash, and storage systems use hashes to spot duplicate files."],
          ["Fast lookups.", "Hash tables and caches use hashes as keys."],
        ]} />
      </Card>

      <Card title="What a Hash Identifier Is and How It Works">
        <P>
          A hash identifier looks at a hash value and suggests which algorithm created it. Every algorithm has its own output size. MD5 always
          returns 128 bits, written as 32 hexadecimal digits. SHA-1 returns 160 bits, or 40 digits. SHA-256 returns 256 bits, or 64 digits. Because
          those sizes never change, the tool can narrow the field by counting the digits and checking that the string contains only valid hex
          characters.
        </P>
        <P>
          What comes back is a list of candidates, not a verdict. Several algorithms share the same digest length, so a 32-digit string might be
          MD5, MD4, NTLM, or a 128-bit RIPEMD or Tiger variant. Length is the only dependable clue available, and the tool says so on the results
          screen: every function it lists produces digests of that size, so the hash alone cannot show which one was used. The tool does not
          reverse a hash or recover the original text. Identification only tells you what kind of fingerprint you are holding, not what it was made
          from.
        </P>
      </Card>

      <Card title="How to Use the Hash Identifier Online">
        <P>
          Using the hash identifier takes three steps. Copy the hash from wherever you found it, paste it into the Hash field, and click Calculate.
          The Clear button resets the field, and the example hashes under the input are a quick way to see how results look. The field accepts
          hexadecimal digits only (0–9 and a–f). Upper case is fine, and so is an optional <C>0x</C> prefix.
        </P>
        <P>
          The result panel shows how many algorithms match, the digest size, and a table with each algorithm’s name, size, and a short note, such as
          checksum, not cryptographic. It also reports the number of hex digits, the digest size in bits, and the size in bytes. For example, the
          16-digit string <C>1a2b3c4d5e6f7a8b</C> comes back as a 64-bit digest with three candidates: CRC64, FNV-1 64, and FNV-1a 64.
        </P>
        <P>
          Clean the input before pasting. A trailing space or line break copied from a terminal adds a character and can point you to the wrong
          algorithm family. If the string contains letters beyond f, or characters such as + or =, you are probably looking at <Link to="/tools/base64-encode-decode" className="inline-home-link">Base64</Link> or another
          encoding, not a raw hex digest. If it begins with a prefix such as 2b or argon2id, it is a password-hashing format whose structure names
          the scheme itself, so check that prefix against the scheme’s documentation instead of treating it as a bare digest.
        </P>
        <P>
          Once you have candidates, test the most likely one. Hash a known value with that algorithm and compare the output format, or check the
          documentation of the system the hash came from. Two minutes of confirmation can save hours of work built on a wrong assumption.
        </P>
      </Card>

      <Card title="How to Identify a Hash by Length: Hash Length Chart">
        <P>
          You can do the same check by hand. Count the hex digits in the hash and divide by two to get the number of bytes, since each byte takes two
          hex digits. Multiply the bytes by eight to get bits, then match the result against the chart below.
        </P>
        <DataTable headers={LENGTH_HEADERS} rows={LENGTH_ROWS} />
        <P>
          Some lengths are crowded. At 32 digits, MD5 is the usual answer, but MD4, NTLM (used for Windows password hashes), RIPEMD-128, and
          Tiger-128 produce the same length. At 40 digits, SHA-1 leads, with RIPEMD-160 and Tiger-160 as alternatives, and Git has traditionally
          used SHA-1 identifiers of this size for commits. At 64 digits, SHA-256 is the common match, alongside SHA3-256, RIPEMD-256, and BLAKE2s.
          At 128 digits, SHA-512 is typical, sharing that length with SHA3-512, Whirlpool, and BLAKE2b.
        </P>
        <P>
          Short hashes of 8 or 16 digits are most likely checksums, such as CRC32 or a 32-bit or 64-bit FNV hash. You do not need to memorize any of
          this. The hash identifier does the lookup, and the chart simply helps you sanity-check what comes back.
        </P>
      </Card>

      <Card title="Why and When You Need a Hash Identifier">
        <P>People reach for a hash identifier when an unlabeled hash blocks the next step.</P>
        <Lead lead="Security testing and audits.">
          During an authorized penetration test or a review of a leaked-credentials report, the first question is which algorithm protects the
          stored values. An unsalted MD5 or SHA-1 column tells a very different story from a bcrypt column, and you need the type before you can
          judge the risk.
        </Lead>
        <Lead lead="Legacy migrations.">
          Developers who inherit an old application often find passwords stored with a fast hash. Identifying the format is the starting point for
          planning a move to a modern scheme, including how to rehash users at their next login.
        </Lead>
        <Lead lead="File verification.">
          Download pages sometimes publish a checksum without naming the algorithm. Matching its length to SHA-256 or SHA-1 tells you whether to
          run <C>sha256sum</C>, <C>sha1sum</C>, or <C>md5sum</C> before you trust the file.
        </Lead>
        <Lead lead="Incident response and forensics.">
          Threat reports list file hashes, and analysts need the type to search the right databases or detection rules. A hash type identifier
          removes the guesswork when a report leaves out the label.
        </Lead>
        <Lead lead="Debugging and learning.">
          Mismatched API signatures, cache keys, and deduplication logic often come down to one side using a different algorithm than expected.
          Students and CTF players use a hash identifier for the same reason: to see how algorithms differ in output before choosing an analysis
          method.
        </Lead>
      </Card>

      <Card title="What Affects the Accuracy of Hash Identification">
        <P>
          The accuracy of any hash identifier is limited by how much information the string itself carries. Length and character set are strong
          filters, but they cannot separate algorithms that share an output size. Several other situations blur the picture further.
        </P>
        <P>
          A salted hash may look like a plain digest if the salt is stored elsewhere. An HMAC has the same length as its underlying hash, so an
          HMAC-SHA256 value looks identical to a SHA-256 value. A truncated hash, such as the first 32 characters of a SHA-256 digest, will be
          reported as a 32-digit candidate and point you toward MD5 even though it is nothing of the kind. Double hashing, where one hash is fed
          into another, leaves no visible trace either.
        </P>
        <P>
          That is why context matters as much as the tool. Look at the field name, the framework, and the age of the system. A 32-digit value in a
          legacy PHP application is far more likely to be MD5 than Tiger-128. When you want certainty, use a known test vector: the MD5 of an empty
          string is <C>d41d8cd98f00b204e9800998ecf8427e</C>, and the SHA-1 of an empty string is{" "}
          <C>da39a3ee5e6b4b0d3255bfef95601890afd80709</C>. Reproducing a value like that in your own environment confirms what the algorithm does.
          Treat the hash identifier as a fast first filter and your own testing as the final check.
        </P>
      </Card>

      <Card title="How Secure Is MD5?">
        <P>
          MD5 is not secure for any purpose where someone might try to cheat. Researchers showed practical MD5 collisions in 2004, which means two
          different files can be built to share the same MD5 hash. That breaks MD5 for digital signatures and certificates. MD5 is also very fast,
          which helps anyone trying to guess passwords stored with it.
        </P>
        <P>
          MD5 is still fine for jobs with no attacker involved, such as catching accidental file corruption, spotting duplicate files, or building
          cache keys. If the hash identifier returns a 32-digit result for a password field, treat it as a sign that the system needs an upgrade.
        </P>
      </Card>

      <Card title="Which Hash Is More Secure: SHA-256, SHA-512, or MD5?">
        <P>
          MD5 is last by a wide margin. SHA-256 and SHA-512 are both members of the SHA-2 family, and both are considered secure for integrity
          checks and digital signatures today.
        </P>
        <P>
          SHA-512 has a longer output, so on paper it has a larger safety margin. SHA-256 already offers far more strength than any known attack
          can reach, so in practice the choice usually comes down to other factors. SHA-512 is often faster on 64-bit processors when hashing large
          amounts of data, while SHA-256 produces a shorter value and is supported almost everywhere. Neither is the right tool for storing
          passwords, because both are built to be fast.
        </P>
        <P>
          The rest of the lineup, in short: SHA-1 had its first public collision in 2017, and NIST has set 2030 as the date to phase it out. CRC and
          FNV are not meant for security at all. RIPEMD-160 is uncommon in everyday software, though Bitcoin address generation still applies it
          after SHA-256. Tiger is rarely seen outside older software and peer-to-peer file-sharing tools.
        </P>
        <P>
          For passwords, use a slow, salted algorithm such as bcrypt, scrypt, or Argon2. The OWASP{" "}
          <Ext href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html">Password Storage Cheat Sheet</Ext>{" "}
          recommends Argon2id as the first choice.
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
