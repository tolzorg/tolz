import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What does URL encoding do?", a: "It replaces characters that aren’t safe in a URL with a percent sign and two hexadecimal digits, so the data is transmitted without being misread as part of the URL’s structure." },
  { q: "How do I decode a URL online?", a: "Paste the encoded string into the input box and click Decode. Each %XX sequence is converted back to its original character, and multi-byte UTF-8 sequences are reassembled into full characters." },
  { q: "What does %20 mean in a URL?", a: "It represents a space. The value 20 is the hexadecimal code for the space character in ASCII and UTF-8." },
  { q: "Is URL encoding the same as encryption?", a: "No. It is a reversible format change with no secret key. Anyone can decode it, so never rely on it to protect sensitive information." },
  { q: "Why is my URL showing %2520?", a: "The text was encoded twice. The first pass produced %20, and the second pass encoded the percent sign as %25. Decode once to get back to the correct form." },
  { q: "Which characters need to be encoded?", a: "Spaces, non-ASCII characters, unsafe characters like quotes and angle brackets, and any reserved character, such as &, ?, #, or =, that you want treated as data rather than URL structure." },
  { q: "Why does a copied non-English URL look like %XX codes?", a: "Browsers display readable text in the address bar, but the actual URL is percent-encoded, and it often stays that way when you copy it. Paste it into the decoder to read it." },
  { q: "How do I decode a URL from the command line?", a: "Use a one-line Python command with urllib.parse.unquote, or a short Bash function with printf. Both are shown above." },
  { q: "How does Java decode URL-encoded data?", a: "Use URLDecoder.decode(encoded, StandardCharsets.UTF_8). Keep in mind that it converts + to a space and throws an error on malformed sequences." },
  { q: "Does this tool support non-English text?", a: "Yes. It handles full UTF-8, so Arabic, Urdu, Chinese, Japanese, Cyrillic, accented Latin characters, and emoji encode and decode correctly." },
  { q: "Is the text I enter uploaded or stored?", a: "No. Processing happens in your browser, and nothing is sent to a server." },
  { q: "Should I encode the whole URL or just part of it?", a: "Usually just the individual values, such as a query parameter. Encoding the entire address converts the slashes, colon, and question mark, which breaks the link." },
  { q: "Is the tool free?", a: "Yes, it’s free to use." },
];

// The supplied FAQ schema matches the list above with straight apostrophes and
// one reworded answer.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_OVERRIDES = {
  "How do I decode a URL from the command line?": "Use a one-line Python command with urllib.parse.unquote, or a short Bash function with printf. Both work well for typical strings.",
};

const REF_HEADERS = ["Character", "Encoded", "Character", "Encoded"];
const REF_ROWS = [
  ["Space", "%20", "/", "%2F"], ["!", "%21", ":", "%3A"], ['"', "%22", "<", "%3C"], ["#", "%23", "=", "%3D"],
  ["$", "%24", ">", "%3E"], ["%", "%25", "?", "%3F"], ["&", "%26", "@", "%40"], ["+", "%2B", "^", "%5E"],
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
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "left", lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre",
};

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
const Code = ({ children }) => <pre style={formulaStyle}>{children}</pre>;
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 300 }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
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

export default function UrlEncodeDecodeFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is URL Encoding and Why Is It Necessary?">
        <P>
          URL encoding is a way to convert data into a format that can be safely included in a URL. A URL can only carry a limited set of US-ASCII
          characters: letters, numbers, and a few symbols. Anything else, such as spaces, quotation marks, accented letters, or non-English scripts,
          has to be converted before it can travel inside a web address.
        </P>
        <P>
          The conversion is simple. Each unsafe character is replaced with a percent sign (%) followed by two hexadecimal digits that represent the
          character's byte value. A space becomes %20, the caret (^) becomes %5E, and the less-than sign (&lt;) becomes %3C. Because of the percent
          sign, URL encoding is also called percent-encoding. That second name is more accurate, since the same method is used outside of URLs too.
        </P>
        <P>
          The reason it's necessary comes down to how URLs are read. Browsers and servers treat certain characters as instructions. A question mark
          starts the query string, an ampersand separates parameters, and a hash begins a fragment. If your data contains one of those characters
          and you leave it raw, the receiving system will read it as part of the URL's structure instead of as your data. A search term like salt
          &amp; pepper would be cut off at the ampersand. Encoding turns each unsafe character into a literal, unambiguous form so the data arrives
          exactly as you wrote it.
        </P>
        <P>
          Decoding is the reverse. It takes the %XX sequences and converts them back to the original characters so a person can read them. Neither
          step is encryption. There is no key and no secret, and anyone can reverse the result.
        </P>
      </Card>

      <Card title="How to Use the URL Encode Decode Tool">
        <P>
          The tool works in two directions. To encode, paste the text you want to place inside a URL, such as a search phrase, a parameter value, or
          a file name, into the input box and click Encode. Unsafe characters are replaced with their percent-encoded form. To decode, paste a
          string containing %XX sequences and click Decode. Each sequence is turned back into the character it represents, so{" "}
          <C>hello%20world%21</C> becomes <C>hello world!</C>.
        </P>
        <P>
          Below the result, the tool shows the number of input characters and output characters. That's a quick way to see how much longer a string
          gets after encoding, which is useful if you're working within a URL length limit. The Copy button places the result on your clipboard, and
          Clear resets the input so you can start fresh.
        </P>
        <P>A few habits improve accuracy:</P>
        <List items={[
          ["", "Encode only the part you need. Usually that's a single parameter value, not the whole URL."],
          ["", "Check the output before pasting it into code or a link."],
          ["", "If decoding returns something strange, look at the input for stray or incomplete percent signs."],
        ]} />
      </Card>

      <Card title="Is a Non-English URL Copied From the Address Bar Encoded?">
        <P>
          Often, yes. Most browsers show web addresses in readable form, so you may see Arabic, Urdu, Chinese, or accented Latin text right in the
          address bar. But what's displayed isn't always what gets copied. When you copy the link and paste it into a chat, email, or document, it
          frequently comes out as a long string of %XX sequences. The browser is showing you a friendly version, while the real URL sent over the
          network is percent-encoded.
        </P>
        <P>
          For example, a page whose address bar shows <C>/café</C> is actually requested as <C>/caf%C3%A9</C>. The behavior varies a little between
          browsers and between the address bar and other apps, but the underlying URL is the same either way. If you paste an encoded link into
          this tool and click Decode, you'll see the readable text again. You can also go the other way and encode a readable path to see what a
          server will receive.
        </P>
        <P>
          One related detail: this only applies to the path and query parts of a URL. Non-English domain names use a different system called
          Punycode, which produces names that start with xn--. Percent-encoding isn't used for the domain.
        </P>
      </Card>

      <Card title="Full UTF-8 Support for International Characters">
        <P>
          Percent-encoding was designed around ASCII, but modern web addresses carry text in every language. The accepted approach is to convert
          each character to its UTF-8 bytes first, then percent-encode every byte. The letter "é" becomes %C3%A9, which is two bytes. The Greek
          letter "Ω" becomes %CE%A9, and "β" becomes %CE%B2. The Japanese character "日" becomes %E6%97%A5, which is three bytes, and an emoji such
          as 😀 becomes %F0%9F%98%80, which is four.
        </P>
        <P>
          This tool handles that conversion in both directions. You can encode Arabic, Urdu, Chinese, Cyrillic, or accented Latin text and get
          standards-compliant output. When you decode, multi-byte sequences are reassembled into the original characters rather than showing up as
          scrambled symbols. If you see output like Ã© instead of é, a different encoding was probably used somewhere along the way. Decoding as
          UTF-8 is the correct default for nearly all modern web content.
        </P>
      </Card>

      <Card title="Reserved and Unreserved Characters: Which Ones Get Encoded?">
        <P>
          The standard that defines this is <Ext href="https://datatracker.ietf.org/doc/html/rfc3986">RFC 3986</Ext>. It splits URL characters into
          two groups.
        </P>
        <Lead lead="Unreserved characters">
          are safe everywhere and never need encoding: uppercase and lowercase letters, digits, and four symbols: hyphen, period, underscore, and
          tilde (- . _ ~).
        </Lead>
        <Lead lead="Reserved characters">
          have a special job in a URL: ! # $ &amp; ' ( ) * + , / : ; = ? @ [ ]. When one of these is used for its intended purpose, it stays as is.
          A slash separates path segments, a question mark starts the query string, and an equals sign joins a parameter name to its value. When the
          same character is part of your data instead, it must be encoded.
        </Lead>
        <P>
          Here's a simple example. In the URL <C>https://example.com/search?q=encode%20%2F%20and%20%3F</C>, the slash after .com and the question
          mark before q are doing their normal structural jobs, so they're left alone. Inside the value, the slash and question mark are just text,
          so they appear as %2F and %3F.
        </P>
        <P>Any character that isn't in either group must always be encoded. Here's what that looks like in practice:</P>
        <List items={[
          ["", "Spaces become %20. In HTML form submissions, spaces are sometimes written as + instead (covered below)."],
          ["", "Reserved characters used as data, such as & = ? # / : @, become sequences like %26, %3D, %3F, %23, %2F, %3A, and %40."],
          ["", "Non-ASCII characters become one %XX group per UTF-8 byte."],
          ["", "Unsafe characters like quotation marks, angle brackets, curly braces, the pipe, and backslash are always encoded, because browsers and servers handle them inconsistently when raw."],
          ["", "The percent sign itself becomes %25, which matters for the double-encoding problem covered later."],
        ]} />
      </Card>

      <Card title="When You Need to Encode a URL">
        <P>Most people reach for a URL encoder when something has already gone wrong, so these are the situations where it earns its place.</P>
        <Lead lead="Building API requests.">
          A query parameter like <C>city=São Paulo&amp;sort=price</C> breaks if the space or accent is left raw. Encoding each value first
          guarantees the server receives what you meant. This is routine when testing endpoints by hand in a browser, curl, or an API client.
        </Lead>
        <Lead lead="Marketing and tracking links.">
          Campaign URLs with UTM parameters often include spaces, slashes, or ampersands in campaign names. Encoding those values keeps analytics
          tools from truncating them.
        </Lead>
        <Lead lead="Redirect and callback URLs.">
          One URL passed as a parameter inside another, as in OAuth flows or login redirects, must be encoded. Otherwise its own ? and &amp;
          characters collide with the outer URL's structure.
        </Lead>
        <Lead lead="Sharing links with special characters.">
          File names with spaces, brackets, or non-Latin letters should be encoded before being placed in links, so email clients and chat apps
          don't cut them off midway.
        </Lead>
        <Lead lead="Embedding data in forms and templates.">
          Developers and content editors who build mailto links, deep links, or QR code payloads often need to encode subject lines and body text.
        </Lead>
      </Card>

      <Card title="When You Need to Decode a URL">
        <P>Decoding is the other half of the job, and it's usually about readability or debugging.</P>
        <Lead lead="Reading logs and analytics.">
          Server access logs and referrer reports show search queries and parameters in encoded form. Decoding turns{" "}
          <C>q=best%20laptops%20under%20%24800</C> into <C>q=best laptops under $800</C>, which a person can actually read.
        </Lead>
        <Lead lead="Debugging broken links.">
          If a link returns the wrong page or an error, decoding it shows exactly what the server is receiving. Often you'll find a missing slash, a
          stray character, or something that got encoded twice.
        </Lead>
        <Lead lead="Inspecting suspicious links.">
          Phishing and tracking URLs sometimes hide their real destination behind layers of encoding. Decoding reveals the actual target before you
          click, though you should still treat the link with caution.
        </Lead>
        <Lead lead="Recovering original text.">
          If someone sends you a file name or message in encoded form, decoding restores it without any manual lookup of hex values.
        </Lead>
      </Card>

      <Card title="Encoding Spaces: %20 vs the Plus Sign">
        <P>
          This is the most common source of confusion. Standard percent-encoding writes a space as %20. However, the older
          application/x-www-form-urlencoded format, which HTML forms use for query strings, writes a space as +. Both appear in the wild, and they
          are not interchangeable everywhere.
        </P>
        <P>
          In a URL's query string, most servers accept either. In the path portion of a URL, only %20 is correct, and a plus sign there means a
          literal plus. When you decode a string and see unexpected + characters, check whether the source was a form submission. When you encode
          something for a path or a general-purpose link, %20 is the safe choice.
        </P>
      </Card>

      <Card title="Encoding a Full URL vs a Single Component">
        <P>
          Many encoding mistakes come from encoding too much. If you encode an entire address like <C>https://example.com/search?q=test</C>, the
          colon, slashes, question mark, and equals sign are all converted, and the result no longer works as a link. The structural characters were
          never supposed to be touched.
        </P>
        <P>
          The right approach is to encode each data value separately, then assemble the URL around it. JavaScript makes the same distinction:{" "}
          <Ext href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent</Ext>{" "}
          is meant for individual values and escapes reserved characters, while encodeURI is meant for whole addresses and leaves structural
          characters alone. When using this tool, paste in the value you want to protect, not the whole address, unless you specifically need the
          entire string encoded, for example when embedding one URL as a parameter inside another.
        </P>
      </Card>

      <Card title="How to Decode a URL-Encoded String in a Shell">
        <P>If you're working in a terminal and need to decode a string without leaving it, a few built-in options work well.</P>
        <P>With Python, which is installed on most systems:</P>
        <Code>{"python3 -c 'import sys, urllib.parse; print(urllib.parse.unquote(sys.argv[1]))' 'hello%20world%21'"}</Code>
        <P>In Bash, a short function can handle simple strings. It swaps each % for \x and lets printf interpret the result:</P>
        <Code>{"urldecode() { local s=\"${1//+/ }\"; printf '%b' \"${s//%/\\\\x}\"; }\nurldecode 'hello%20world%21'"}</Code>
        <P>This works for typical input, but it can misbehave if the string contains backslashes, so use the Python version when accuracy matters.</P>
        <P>For encoding, curl can do it for you. The --data-urlencode option encodes a value before sending it, and -G puts it in the query string:</P>
        <Code>{'curl -G --data-urlencode "q=hello world" https://example.com/search'}</Code>
        <P>
          Shell commands are the better choice for scripts and automation. For a quick one-off check, such as a single link from an email or a log
          line, pasting it into the tool is usually faster.
        </P>
      </Card>

      <Card title="How Does Java Decode URL-Encoded Data?">
        <P>Java includes java.net.URLDecoder and java.net.URLEncoder for this. To decode, you pass the string and the character set:</P>
        <Code>{"String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);"}</Code>
        <P>
          The version that accepts a Charset was added in Java 10. In older versions, you pass the character set name as a string, as in{" "}
          <C>URLDecoder.decode(encoded, "UTF-8")</C>, and handle the checked exception. Always specify UTF-8 explicitly. Relying on the platform
          default is a common cause of garbled non-English text.
        </P>
        <P>
          There are two behaviors worth knowing. First, both classes follow the form-encoding rules, so URLDecoder turns + into a space, and
          URLEncoder writes spaces as + instead of %20. If you're building a URL path, replace + with %20 in the encoded result. Second, URLDecoder
          throws an IllegalArgumentException when it hits a malformed sequence like a lone % or %G5. If you're unsure whether a string is valid, you
          can paste it into this tool first to see what the decoder makes of it.
        </P>
      </Card>

      <Card title="How to Encode and Decode SEO URLs Through a Platform API">
        <P>
          This tool doesn't offer an API, so if you need to process many URLs, you'll want to handle encoding in code. Most content management
          systems, e-commerce platforms, and sitemap generators let you create or update URLs through an API, and the encoding step should happen
          before the request goes out. Use your language's standard function for this, such as encodeURIComponent in JavaScript,
          urllib.parse.quote in Python, or URLEncoder in Java, and apply it to each slug or parameter value instead of the full URL.
        </P>
        <P>A few practices keep SEO URLs clean:</P>
        <List items={[
          ["", "Keep slugs lowercase, use hyphens between words, and avoid spaces and special characters."],
          ["", "Use ASCII slugs where you can. Non-English slugs are valid, but they appear in encoded form when shared or copied, which makes links long and harder to read."],
          ["", "Be consistent with hex case. %C3%A9 and %c3%a9 mean the same thing, but some systems treat them as different URLs, which can create duplicate pages. Uppercase is the standard."],
          ["", "Don't encode twice. A slug that goes through encoding in your code and again in the platform can end up with %25 in it and lead to broken pages."],
        ]} />
        <P>When something looks wrong, paste the URL from your sitemap, log, or API response into the decoder to see what's actually being sent.</P>
      </Card>

      <Card title="Common Problems and How to Fix Them">
        <Lead lead="Double encoding.">
          Encoding text that is already encoded turns %20 into %2520, because the percent sign itself gets encoded as %25. The symptom is a URL
          showing literal %20 text instead of spaces. The fix is to decode once, check the result, and encode only if needed.
        </Lead>
        <Lead lead="Malformed sequences.">
          A percent sign not followed by two valid hex digits, such as %G5 or a trailing %, cannot be decoded. It usually means the string was cut
          off during copying, or a literal percent sign was never encoded as %25. Correct the input and run it again.
        </Lead>
        <Lead lead="Garbled characters after decoding.">
          This points to an encoding mismatch. Older systems sometimes used Latin-1 or Windows-1252 instead of UTF-8, which produces different byte
          values for accented letters. If decoded text looks wrong, the original source may not have used UTF-8.
        </Lead>
        <Lead lead="Links that still break after encoding.">
          Check that you haven't encoded the structural characters of the URL itself, and confirm that a plus sign isn't being read as a space (or
          the reverse) by the receiving system.
        </Lead>
      </Card>

      <Card title="Why Use an Online URL Encoder and Decoder?">
        <P>
          You can encode in code with a single function call, but a browser-based tool is faster whenever you're not already in a codebase. You may
          be checking a link from an email, cleaning up a parameter for a spreadsheet, or confirming what a developer sent you. Opening a console or
          writing a script for a one-off check wastes time, and looking up hex values by hand for non-English text is slow and error-prone.
        </P>
        <P>
          A dedicated tool also gives you a visible, consistent result you can compare against what your own code produces. That makes it useful
          for QA checks, documentation, and teaching others how percent-encoding works.
        </P>
      </Card>

      <Card title="Privacy, Safety, and Reliability">
        <P>
          The URL encode decode tool runs entirely in your browser. The text you enter is processed on your own device, and nothing is sent across
          the internet. That matters because the strings people decode often contain things they'd rather keep private, such as session tokens in
          callback URLs, internal endpoints, customer search terms, or email addresses inside tracking links.
        </P>
        <P>
          The tool is free to use. The output follows the percent-encoding rules in RFC 3986 with UTF-8 byte handling, so results match what
          browsers and mainstream programming languages produce for the same input. If you work with sensitive material, remember that encoding
          only changes how data is represented. It does not protect the data from anyone who can read the URL.
        </P>
      </Card>

      <Card title="Quick Reference: Common Encoded Characters">
        <DataTable headers={REF_HEADERS} rows={REF_ROWS} />
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
