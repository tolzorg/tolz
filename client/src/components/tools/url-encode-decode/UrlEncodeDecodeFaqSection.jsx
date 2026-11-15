import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { RESERVED, UNRESERVED } from "../../../utils/urlEncodeDecodeEngine";

const FAQ_ITEMS = [
  {
    q: "What is URL encoding?",
    a: "URL encoding (percent-encoding) replaces characters that aren't safe in a URL with a percent sign followed by two hexadecimal digits for each byte, so data such as spaces, symbols and non-English text can travel inside a URL without being misread.",
  },
  {
    q: "Is a space encoded as %20 or +?",
    a: "This tool encodes a space as %20, the percent-encoding defined by RFC 3986. The + sign for a space only applies to HTML form data (application/x-www-form-urlencoded); when decoding, a + is left as a + rather than turned into a space.",
  },
  {
    q: "Which characters are not encoded?",
    a: "Letters A–Z and a–z, digits 0–9 and the characters - _ . ! ~ * ' ( ) are left as they are. Every other character, including reserved characters such as / ? & = and #, is percent-encoded, so the result can be used safely as a single query-string value or path segment.",
  },
  {
    q: "How are non-English characters and emoji encoded?",
    a: "They are first converted to UTF-8 bytes, and each byte becomes a %XX sequence. For example, 'Ω' becomes %CE%A9 and '😀' becomes %F0%9F%98%80.",
  },
  {
    q: "Why can't my text be decoded?",
    a: "Decoding fails when a % isn't followed by two hexadecimal digits (for example '100%' or '%G1'), or when the %XX bytes don't form valid UTF-8 (for example a lone %E9). Encode the % itself as %25 if it is meant literally.",
  },
  {
    q: "Are spaces at the start or end kept?",
    a: "No. As on the reference tool, leading and trailing spaces and line breaks are trimmed before the text is encoded or decoded. Spaces inside the text are kept.",
  },
  {
    q: "Is my text sent anywhere?",
    a: "No. Encoding and decoding run entirely in your browser. Nothing is sent to a server or stored, and you don't need to sign up.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const charBlock = {
  ...mono, fontSize: 14, textAlign: "center", wordBreak: "break-all", margin: "0 0 10px", padding: "10px 12px",
  borderRadius: "var(--radius-sm)", background: "var(--accent-light)", border: "1px solid var(--border)", color: "var(--text-primary)",
};
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 520 };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;
const EXAMPLE_URL = "/calculators/internet-network/url-encode-decode?toprocess=encode%20%2F%20and%20%3F";

const EXAMPLES = [
  ["space", " ", "%20"], ["^", "^", "%5E"], ["<", "<", "%3C"], ["/", "/", "%2F"], ["?", "?", "%3F"], ["&", "&", "%26"],
  ["Ω", "Ω", "%CE%A9"], ["β", "β", "%CE%B2"], ["😀", "😀", "%F0%9F%98%80"],
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

export default function UrlEncodeDecodeFaqSection() {
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
        <h2 style={h2Style}>URL Encoder &amp; Decoder</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} URL encoder and decoder converts text to and from percent-encoding, the format used to put data safely
          inside a URL. Paste a value and click Encode to get a URL-safe string, or paste an encoded string and click Decode to read it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          URL encoding is a way to convert data into a format that can be safely included in a URL. URLs can only safely contain certain
          US-ASCII characters, which are limited to letters, numbers, and a few symbols. Data that contains other characters, such as
          spaces, punctuation, or non-English characters, needs to be encoded to ensure that browsers and servers interpret it correctly. URL
          encoding of these incompatible characters is achieved by replacing them with a percent sign (%) followed by two hexadecimal digits
          representing the character&apos;s byte value. For example, &lsquo;^&rsquo; is encoded as &lsquo;%5E&rsquo;, and &lsquo;&lt;&rsquo;
          is encoded as &lsquo;%3C&rsquo;. Unicode or other characters that occupy more than one byte are first converted into a sequence of
          bytes (typically using UTF-8) and then represented by a percent sign (%) followed by two hexadecimal digits for each byte. For
          example, &lsquo;Ω&rsquo; is encoded as &lsquo;%CE%A9&rsquo;, and &lsquo;β&rsquo; is encoded as &lsquo;%CE%B2&rsquo;.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Percent-Encodings</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Character</th><th>Encoded</th></tr></thead>
            <tbody>
              {EXAMPLES.map(([name, , enc]) => (
                <tr key={name}><td style={mono}>{name}</td><td style={{ ...mono, fontWeight: 700, color: "var(--accent)" }}>{enc}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reserved and Unreserved Characters</h2>
        <p style={pStyle}>
          Because URL encoding uses the percent sign, it is also called percent-encoding. This encoding method is not limited to URLs;
          therefore, the term percent-encoding should be preferred.
        </p>
        <p style={pStyle}>
          The US-ASCII characters allowed in a URL are categorized as either reserved or unreserved. Reserved characters have special meanings
          in a URL, while unreserved characters do not. Based on RFC 3986, the reserved characters are:
        </p>
        <p style={charBlock}>{RESERVED}</p>
        <p style={pStyle}>and the unreserved characters are:</p>
        <p style={charBlock}>{UNRESERVED}</p>
        <p style={pStyle}>
          When reserved characters are used for their intended meanings in a URL, they do not need to be encoded. However, when used for
          other purposes, they need to be percent-encoded to distinguish them from their reserved meanings. For example, in the URL:
        </p>
        <p style={{ ...charBlock, fontSize: 13 }}>
          <Link to={EXAMPLE_URL} reloadDocument style={{ color: "var(--accent)" }}>https://www.tolz.org{EXAMPLE_URL}</Link>
        </p>
        <p style={pStyle}>
          the &lsquo;/&rsquo; is not encoded when serving as a path delimiter, and &lsquo;?&rsquo; is not encoded when indicating the start of
          the query string. However, they are encoded as &lsquo;%2F&rsquo; and &lsquo;%3F&rsquo; when used as part of the data in the value of
          &lsquo;encode / and ?&rsquo; for the parameter &lsquo;toprocess&rsquo;. Opening that link fills the tool above with the decoded value.
        </p>
        <p style={pStyle}>
          Unreserved characters can be used directly in URLs in all situations without being percent-encoded. Characters that are not in either
          category must be percent-encoded to be used safely in URLs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are numerous online and offline tools available to encode and decode data to and from a URL-safe format. The tool above provides
          a convenient way to perform these conversions directly in the browser without sending data over the internet. To encode binary data
          or files instead, use the {link("/calculators/internet-network/base64-encode-decode", "Base64 encoder and decoder")}.
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
