import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is Base64?",
    a: "Base64 is a way of writing binary data (any sequence of bytes) using only 64 printable ASCII characters: A–Z, a–z, 0–9, + and /, with = as padding. It lets images, files and other binary data travel through systems that were built to handle text.",
  },
  {
    q: "Is Base64 encryption?",
    a: "No. Base64 is an encoding, not encryption: anyone can decode it without a key. Don't use it to protect passwords or other secrets.",
  },
  {
    q: "Why is Base64 output about a third larger than the input?",
    a: "Each Base64 character carries 6 bits, while each byte has 8 bits. Every 3 bytes (24 bits) become 4 characters, so the encoded text is about 4/3 (≈1.33) times the size of the original data, plus up to two padding characters.",
  },
  {
    q: "What does the = at the end mean?",
    a: "It is padding. When the number of input bytes isn't a multiple of 3, the last group is short: one leftover byte gives two characters plus ==, and two leftover bytes give three characters plus =. The decoder also accepts input without the padding.",
  },
  {
    q: "What does the Character option do?",
    a: "It is used when decoding: the decoded bytes are read as text in the character set you choose, such as UTF-8, UTF-16, Shift JIS or Windows-1251. Text is always encoded as UTF-8. If the decoded text shows � symbols, the bytes were probably written in another character set.",
  },
  {
    q: "Why can't my text be decoded?",
    a: "Standard Base64 only uses A–Z, a–z, 0–9, + and /, with = padding at the end. Spaces and line breaks are ignored, but any other character (for example - or _ from the URL-safe variant), = in the middle, or a length that leaves a single stray character makes the input invalid.",
  },
  {
    q: "Are my text and files uploaded anywhere?",
    a: "No. Encoding and decoding run entirely in your browser. Your text and files aren't sent to a server or stored, and you don't need to sign up.",
  },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const ALPHABET_ROWS = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => c * 8 + r));

// The reference's worked examples: each letter's bits, regrouped into 6-bit values.
const bitsOf = (s) => [...s].map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0")).join("");
function example(word) {
  const bits = bitsOf(word);
  const padBits = (6 - (bits.length % 6)) % 6;
  const all = bits + "0".repeat(padBits);
  const groups = all.match(/.{6}/g).map((g) => parseInt(g, 2));
  return { word, bits, padBits, groups, pad: "=".repeat((3 - (word.length % 3)) % 3) };
}
const EXAMPLES = ["Dog", "Do", "Dogs"].map(example);

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const padCell = { color: "var(--error)", fontWeight: 700 };
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

/** One worked example as a bit table (input letters → bits → 6-bit values → Base64 letters). */
function ExampleTable({ ex }) {
  const realBits = ex.bits.length;
  const allBits = (ex.bits + "0".repeat(ex.padBits)).split("");
  return (
    <div style={{ overflowX: "auto", marginBottom: 12 }}>
      <table className="data-table data-table--framed" style={{ ...tableStyle, ...mono, textAlign: "center" }}>
        <caption style={{ ...pStyle, textAlign: "left", marginBottom: 6 }}>
          &lsquo;{ex.word}&rsquo; → <strong style={{ color: "var(--accent)" }}>{ex.groups.map((g) => ALPHABET[g]).join("") + ex.pad}</strong>
        </caption>
        <tbody>
          <tr>
            <th scope="row" style={{ textAlign: "left" }}>Input letter</th>
            {[...ex.word].map((ch, i) => <td key={i} colSpan={8}>{ch}</td>)}
            {ex.padBits > 0 && <td colSpan={ex.padBits + 1} rowSpan={2} />}
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: "left" }}>8-bit decimal value</th>
            {[...ex.word].map((ch, i) => <td key={i} colSpan={8}>{ch.charCodeAt(0)}</td>)}
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: "left" }}>Bits</th>
            {allBits.map((b, i) => <td key={i} style={{ padding: "4px 3px", ...(i >= realBits ? padCell : null) }}>{b}</td>)}
            {ex.padBits > 0 && <td rowSpan={2} style={padCell}>Padding</td>}
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: "left" }}>6-bit decimal value</th>
            {ex.groups.map((g, i) => <td key={i} colSpan={6}>{g}</td>)}
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: "left" }}>Encoded Base64 letter</th>
            {ex.groups.map((g, i) => <td key={i} colSpan={6} style={{ fontWeight: 700 }}>{ALPHABET[g]}</td>)}
            {ex.pad && <td style={padCell}>{ex.pad}</td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Base64EncodeDecodeFaqSection() {
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
        <h2 style={h2Style}>Base64 Encoder &amp; Decoder</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} Base64 encoder and decoder converts text, images and files to and from Base64, right in your browser:
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>Encode any text to Base64 (as UTF-8), or decode Base64 back to text in one of 40 character sets;</li>
          <li>Encode any file or image to Base64 text;</li>
          <li>Decode a Base64 file back to text, or to the original binary file or image;</li>
          <li>Copy the result or download it as a file.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Base64 Encoding?</h2>
        <p style={pStyle}>
          Base64 encoding and decoding is a method used to convert binary data to and from text format. Some computer systems, especially
          legacy systems, and certain transmission or storage formats are designed to handle text more reliably than raw binary data. Base64
          encoding allows binary information, such as images, files, or other data, to be represented using a set of 64 printable ASCII
          characters, making it suitable for use in these systems and environments.
        </p>
        <p style={pStyle}>
          The Base64 character set includes uppercase letters A–Z, lowercase letters a–z, digits 0–9, and two additional characters, usually +
          and /. The symbol = is sometimes used as padding at the end of the encoded output to ensure that the encoded string has the proper
          length. The following table shows the Base64 characters and their corresponding numeric values based on RFC 4648.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table--framed" style={{ ...tableStyle, ...mono, margin: "0 auto 10px" }}>
            <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              The Base64 alphabet: values 0 to 63 and their characters
            </caption>
            <tbody>
              {ALPHABET_ROWS.map((row, r) => (
                <tr key={r}>
                  {row.map((n) => <td key={n} style={{ whiteSpace: "nowrap" }}>{n}: <strong>{ALPHABET[n]}</strong></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Modern computers are byte-based (8 bits per byte), while Base64 encoding represents data using 6-bit values mapped to 64 characters.
          As a result, Base64-encoded data is typically about 4/3 (≈1.33) times the size of the original data.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Base64 Encoding Works</h2>
        <p style={pStyle}>As an example, the simple text &lsquo;Dog&rsquo; can be encoded in Base64 as &lsquo;RG9n&rsquo;, as shown in the table below.</p>
        <ExampleTable ex={EXAMPLES[0]} />
        <p style={pStyle}>
          In the example above, the three ASCII characters in &lsquo;Dog&rsquo; have a total of 3 × 8 = 24 bits. This can be divided evenly into
          four 6-bit blocks. In many cases, there will be 2 or 4 bits remaining at the end. In such situations, one or two &lsquo;=&rsquo;
          padding characters are added to the end of the encoded result to represent the missing bits. For example, &lsquo;Do&rsquo; can be
          encoded in Base64 as &lsquo;RG8=&rsquo;, as shown below.
        </p>
        <ExampleTable ex={EXAMPLES[1]} />
        <p style={pStyle}>Similarly, &lsquo;Dogs&rsquo; can be encoded in Base64 as &lsquo;RG9ncw==&rsquo;, as shown below.</p>
        <ExampleTable ex={EXAMPLES[2]} />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Uses of Base64</h2>
        <p style={pStyle}>
          Base64 encoding and decoding are widely used in data transmission, web development, and file processing. The following are two
          examples of many uses:
        </p>
        <p style={pStyle}>
          <strong>E-mail attachments:</strong> Originally, SMTP was designed to transport only 7-bit ASCII characters. Encoding binary data
          using Base64 allows older SMTP servers to correctly transmit attachments.
        </p>
        <p style={pStyle}>
          <strong>Embedding binary data in text files:</strong> Text-based formats are widely used in computer systems, especially for
          transmitting data over the internet. Base64 enables the embedding of binary data in these text files. For example, binary data can be
          Base64-encoded and included in JSON or XML files. Images or PDF files can also be Base64-encoded and embedded in HTML or CSS as a
          data URL, such as <span style={{ ...mono, overflowWrap: "anywhere" }}>&lt;img src=&quot;data:image/png;base64,iVBORw0KGgo…&quot; /&gt;</span>.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are numerous online and offline tools, as well as built-in commands in operating systems, to convert data to and from Base64
          format. The tools above provide a convenient way to perform these conversions directly in the browser without sending data across the
          internet. More tools are in the {link("/calculators/internet-network", "internet and network calculators")}.
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
