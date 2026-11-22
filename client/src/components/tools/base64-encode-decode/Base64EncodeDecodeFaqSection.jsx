import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is Base64 encoding and decoding used for?", a: "It converts data to and from Base64, a text-safe format used to move binary or special-character data through systems built for plain text, such as email, JSON, XML, and HTML." },
  { q: "How do I decode a Base64 string?", a: "Paste the string into the text box, select the correct character set (usually UTF-8), and click Decode. For an image or file, use the file section, choose decode a file, and download the result." },
  { q: "How do I convert an image to Base64?", a: "Choose encode a file, add your image, and click Encode. You can copy or download the Base64 text. For web use, put data:image/png;base64, in front of it (using the correct file type) to make a data URI." },
  { q: "How can I convert a PNG file to text?", a: "Encode it with Base64. The output is a long string of letters and numbers that represents the entire image, and decoding it returns the original PNG." },
  { q: "Is Base64 encryption?", a: "No. It’s a reversible encoding with no key, so anyone can decode it. Never rely on it to protect passwords or sensitive information." },
  { q: "Why does Base64 end with an equals sign?", a: "The = is padding. It’s added when the input length isn’t divisible by three, so the output stays a multiple of four characters." },
  { q: "Why is my Base64 output larger than the original?", a: "Every three bytes become four characters, so the encoded version is about 33% larger." },
  { q: "How do I Base64 encode or decode a file in Linux?", a: "Use the built-in command: base64 file > output.txt to encode and base64 -d output.txt > file to decode. Or use the file section of this tool in your browser." },
  { q: "Is it better to send an image as a Base64 string or as a file?", a: "Base64 suits small images and text-only APIs. For large images, a regular file upload avoids the 33% size increase." },
  { q: "Are my files uploaded when I use this tool?", a: "No. Encoding and decoding happen in your browser, and nothing is sent to a server." },
  { q: "What is the maximum file size?", a: "The file section accepts files up to 25 MB each." },
  { q: "Which character set should I choose?", a: "Start with UTF-8, which suits most modern data. If decoded text looks wrong, try the character set used by the system that created the string." },
];

// The supplied FAQ schema matches the list above except that two answers spell
// out the contractions ("It is", "is not").
const FAQ_SCHEMA_OVERRIDES = {
  "Is Base64 encryption?": "No. It is a reversible encoding with no key, so anyone can decode it. Never rely on it to protect passwords or sensitive information.",
  "Why does Base64 end with an equals sign?": "The = is padding. It is added when the input length is not divisible by three, so the output stays a multiple of four characters.",
};

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
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8, wordBreak: "break-all",
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
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function Base64EncodeDecodeFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Base64 Encode/Decode and What Is It Used For?">
        <P>
          Base64 is a way to write binary data as plain text. Computers store files such as images, PDFs, and ZIP archives as raw bytes. Many
          systems, especially older ones, were built to handle text and can damage or reject raw bytes. Base64 solves this by converting any data
          into a string made of 64 safe, printable characters. Once the data is in that form, it can travel through email, JSON, XML, HTML, and URLs
          without being changed along the way. Decoding reverses the process and gives you back the exact original data.
        </P>
        <P>
          The 64 characters are uppercase A–Z, lowercase a–z, digits 0–9, plus + and /. In the standard numbering, A is 0, Z is 25, a is 26, z is
          51, the digits 0–9 are 52–61, + is 62, and / is 63. The = sign is not part of the alphabet. It only appears at the end as padding. The
          format is defined in <Ext href="https://www.rfc-editor.org/rfc/rfc4648">RFC 4648</Ext>, and the{" "}
          <Ext href="https://developer.mozilla.org/en-US/docs/Glossary/Base64">MDN Web Docs glossary</Ext> gives a good developer-focused
          overview.
        </P>
        <P>The purpose is compatibility, not secrecy. Base64 makes data safe to move. It does nothing to protect it.</P>
      </Card>

      <Card title="How Base64 Encoding Works, With a Simple Example">
        <P>
          Computers work in bytes, which are 8 bits each. Base64 works in groups of 6 bits, because six bits can represent 64 different values, one
          for each character in the alphabet. The encoder reads three bytes at a time, which is 24 bits, and splits them into four 6-bit groups.
          Each group becomes one character.
        </P>
        <P>
          Take the word "Dog." The letters D, o, and g have byte values 68, 111, and 103. Together they make 24 bits, which split into four groups
          with values 17, 6, 61, and 39. Those map to R, G, 9, and n, so "Dog" becomes <C>RG9n</C>.
        </P>
        <P>
          Padding appears when the input isn't a multiple of three bytes. "Do" is only two bytes, so the encoder fills the gap and adds one =, giving{" "}
          <C>RG8=</C>. "Dogs" is four bytes, which leaves two bytes' worth of leftover bits, so it ends with two equals signs: <C>RG9ncw==</C>. The
          padding keeps the output length a multiple of four.
        </P>
        <P>
          This also explains why Base64 output is about one-third larger than the original. Three bytes in, four characters out, so the size grows
          by a factor of roughly 1.33. The tool shows the input size and the Base64 length for text, so you can see this directly. A 162-byte input,
          for example, produces 216 Base64 characters.
        </P>
      </Card>

      <Card title="How to Use the Base64 Encoder and Decoder">
        <P>The tool has two parts: one for text and one for images and files.</P>
        <P>
          For text, type or paste your content into the text box and choose a character set. Click Encode to turn it into Base64, or Decode to turn
          a Base64 string back into readable text. The result appears below, and you can copy it or download it. Clear resets the box.
        </P>
        <P>
          For images and files, choose whether you want to encode a file or decode a file. Then drag and drop your file into the box or click to
          browse. Files can be up to 25 MB each. Click the action button and the tool does the rest. If the output is text, it shows in a box you can
          copy or download. If the output is an image or other binary file, it downloads directly. Larger files can take a few seconds.
        </P>
        <P>Choose the character set before you convert, not after. A wrong character set is the most common reason a result looks wrong.</P>
      </Card>

      <Card title="Encode Text to Base64 in 40 Character Sets">
        <P>Most online converters assume UTF-8 and stop there. This tool offers 40 character sets, which matters more than it might seem.</P>
        <P>
          Base64 doesn't encode letters. It encodes bytes. Before text can become Base64, it has to be turned into bytes, and each character set
          does that differently. The word "café" becomes different bytes in UTF-8 and in Latin-1 (ISO-8859-1), so the Base64 output is different
          too. If the system on the other end decodes with the wrong set, accented letters and symbols turn into garbage.
        </P>
        <P>The list covers the sets you're most likely to need:</P>
        <List items={[
          ["UTF-8", "is the right default for modern web work, APIs, and anything with emoji or several languages."],
          ["ASCII", "works for plain English text with no accents. Its output matches UTF-8 for those characters."],
          ["UTF-16 and UTF-16BE", "appear in data that came from Windows software and some other platforms."],
          ["ISO-8859 sets", "(Latin-1, Latin-2, Cyrillic, Greek, Hebrew, Arabic, and others) are common in older databases and legacy email."],
          ["Windows code pages", "(1250–1258 and Thai 874) match files exported from older Windows programs."],
          ["Regional sets", "such as Big5, GB 18030, and GB 2312 for Chinese, EUC-JP, ISO-2022-JP, and Shift JIS for Japanese, EUC-KR for Korean, and KOI8-R, KOI8-U, and CP866 for Russian and Ukrainian text."],
        ]} />
        <P>
          This also helps when you move data between programming environments. The JavaScript <C>btoa()</C> function only handles characters in the
          Latin-1 range. If a string created with <C>btoa()</C> decodes differently in Java or Kotlin, the cause is usually a character set
          difference between the two sides. Try decoding with ISO-8859-1 and UTF-8 and compare. If you see "Ã©" where "é" should be, you've found a
          mismatch.
        </P>
        <P>If you're not sure what a system expects, start with UTF-8.</P>
      </Card>

      <Card title="Decode a Base64 String to Text">
        <P>
          A Base64 decoder is often a debugging tool. You get an encoded string and need to know what it says, or whether it's what you expected.
          Paste the string, select the character set that was used to create it, and click Decode. Many strings you'll find in the wild turn out to
          be readable text, such as configuration values, email headers, log entries, or token contents.
        </P>
        <P>
          Paste only the encoded part. If the string came from a data URI, remove everything up to and including <C>base64,</C>. Stray spaces or
          line breaks from copying can also cause trouble, so check that you pasted the whole string and nothing else.
        </P>
      </Card>

      <Card title="How to Convert an Image to Base64 (or a PNG File to Text)">
        <P>
          An image is just bytes, so Base64 can turn it into a long text string. That is how you convert a PNG, JPG, or any other image to text.
          Switch to the file section, choose encode a file, add your image, and click Encode. The Base64 text appears in a box where you can copy it
          or download it as a file.
        </P>
        <P>
          The most common reason to do this is the data URI. A data URI puts the file directly into your code using this pattern:{" "}
          <C>data:image/png;base64,</C> followed by the encoded text. Add it to an HTML image tag like this:
        </P>
        <Formula>{'<img src="data:image/png;base64,YOUR_ENCODED_TEXT" />'}</Formula>
        <P>
          The same pattern works in CSS for background images. Developers use it to inline small icons and logos and save a separate request.
          Change <C>image/png</C> to match your file type, such as <C>image/jpeg</C> or <C>image/svg+xml</C>.
        </P>
      </Card>

      <Card title="Why Encode an Image as Base64 Before Uploading?">
        <P>
          Some systems only accept text. A JSON API, for example, can't carry raw bytes inside a field, but it can carry a string. Encoding the
          image as Base64 lets you send it as one field in a single request. This is also how images often end up stored inside JSON in React apps
          and other front-end projects. The image is held as a Base64 string, and the app builds a data URI from it to display the picture.
        </P>
        <P>So which is better, sending a Base64 string or uploading a regular file? It depends on the size.</P>
        <List items={[
          ["Base64 works well for small images", "such as icons, avatars, and thumbnails. It keeps the request simple and avoids extra file handling."],
          ["A regular file upload works better for large images.", "The string is about 33% larger than the file, it takes more memory to process, and a browser can't cache an inlined image separately from the page that contains it. For photos, scans, and anything beyond a few hundred kilobytes, uploading the file itself is usually the better practice."],
        ]} />
      </Card>

      <Card title="Decode Base64 to an Image, PDF, or Other File">
        <P>
          To turn a Base64 string back into a file, you need the string saved as a text file or pasted in a place the tool can read. Switch to the
          file section, choose to decode a file, and add the file that holds your Base64 text. For image and binary output, the tool downloads the
          result directly.
        </P>
        <P>
          This works for any file type. If you have a Base64 string that represents a PDF, an Excel workbook (XLSX), a ZIP archive, or an image,
          decoding it gives you the original file. When you open the downloaded file, make sure it has the correct extension for its type, such as
          .pdf or .xlsx, so your computer opens it with the right program.
        </P>
        <P>
          If the result won't open, the usual cause is a truncated or altered string. Base64 must be complete, because even a few missing characters
          can corrupt the output. Copy the source again instead of retyping or trimming it.
        </P>
      </Card>

      <Card title="Can You Reduce File Size After Base64 Encoding?">
        <P>
          The 33% growth is built into the format, so you can't shrink a Base64 string and still decode it by the same rules. What you can do is
          reduce the size of the data before you encode it.
        </P>
        <List items={[
          ["Compress first.", "Put files in a ZIP or gzip archive before encoding. Text, JSON, and documents shrink a lot this way."],
          ["Optimize images.", "Resize large images and use an efficient format such as JPEG or WebP before encoding. A smaller image means a shorter string."],
          ["Skip files that are already compressed.", "JPEG, PNG, and ZIP files don't shrink much more, so there's little to gain."],
          ["Use a regular file transfer for large files.", "If the size matters, sending the file directly avoids the extra 33% entirely."],
        ]} />
        <P>
          Whatever you shrink, decode the string and compare the result to the file you compressed. Decoding always returns exactly what you
          encoded, so if you encoded the compressed file, you'll get the compressed file back and need to unzip it.
        </P>
      </Card>

      <Card title="When You Actually Need a Base64 Converter">
        <P>People usually reach for a Base64 encoder and decoder because something specific is in front of them.</P>
        <Lead lead="Email attachments.">
          SMTP was originally designed to carry only 7-bit ASCII text. Base64 lets attachments pass through email systems that expect plain text,
          and decoding a section of raw email source shows what's inside.
        </Lead>
        <Lead lead="Reading API and webhook data.">
          Many APIs return file contents, signatures, or certificates as Base64 strings. Decoding them shows what you've actually received.
        </Lead>
        <Lead lead="Inspecting JWTs.">
          The header and payload of a JSON Web Token are Base64URL-encoded JSON. Decoding the middle section reveals claims such as expiry time and
          user ID. Base64URL swaps + and / for - and _ and drops padding, so you may need to adjust those characters first.
        </Lead>
        <Lead lead="HTTP Basic Authentication.">
          The <C>Authorization: Basic …</C> header holds username:password in Base64. Decoding it shows what a client is sending, and shows why
          Basic Auth should only be used over HTTPS.
        </Lead>
        <Lead lead="Embedding data in code.">
          Inline images, fonts, and small files in CSS, HTML, or JavaScript are typically Base64 data URIs. JSON and XML files can also carry binary
          content this way.
        </Lead>
        <Lead lead="Stored or exported data.">
          Spreadsheets, databases, and config files sometimes hold Base64 values, and decoding them is often the first step in tracking down a data
          problem.
        </Lead>
        <Lead lead="Learning and testing.">
          Students and developers use a converter to see how the encoding behaves and to check their own code against a known-correct result.
        </Lead>
      </Card>

      <Card title="How to Base64 Encode and Decode in Linux and in Code">
        <P>
          The tool is the quickest option when you have one string or file. For automation, scripts, and applications, you'll want to do the same
          thing in code or from the command line. Here are the most common ways.
        </P>
        <Lead lead="Linux command line.">
          The <C>base64</C> command is built in on most systems. To encode a binary file, run <C>base64 file.bin &gt; file.txt</C>. To decode it,
          run <C>base64 -d file.txt &gt; file.bin</C>. To encode a string, use <C>echo -n "hello" | base64</C>. The <C>-n</C> matters, because
          without it a newline is added to your text and changes the result. By default the output wraps at 76 characters per line, and{" "}
          <C>-w 0</C> turns wrapping off.
        </Lead>
        <Lead lead="Python.">
          Use the built-in <C>base64</C> module. <C>base64.b64encode(data)</C> encodes bytes, and <C>base64.b64decode(text)</C> decodes them. For
          an image, open the file in binary mode (<C>"rb"</C>), read it, and encode it. To decode an image string, run <C>b64decode</C> on the
          string and write the bytes to a file opened in <C>"wb"</C> mode. If the string came from a data URI, remove the{" "}
          <C>data:image/png;base64,</C> prefix first.
        </Lead>
        <Lead lead="JavaScript.">
          Browsers provide <C>btoa()</C> to encode and <C>atob()</C> to decode. Both are limited to Latin-1 characters, so for text with other
          scripts or emoji, convert the text to UTF-8 bytes first.
        </Lead>
        <Lead lead="Java.">
          The <C>java.util.Base64</C> class provides <C>getEncoder()</C> and <C>getDecoder()</C>. It also includes URL-safe and MIME variants.
        </Lead>
        <Lead lead="C#.">
          Use <C>Convert.ToBase64String(bytes)</C> and <C>Convert.FromBase64String(text)</C>. To show a decoded image on an HTML page, you don't
          need to decode it at all. Put the Base64 string in a data URI inside an image tag's src attribute and the browser displays it.
        </Lead>
        <Lead lead="C.">
          The standard library has no Base64 function. You can write the three-bytes-to-four-characters routine yourself or use a library such as
          OpenSSL.
        </Lead>
        <P>Whatever language you use, you can paste a result into this tool to check that your code produced the correct output.</P>
      </Card>

      <Card title="Is It Safe? Privacy and How Your Data Is Handled">
        <P>
          Encoded strings often hold things you wouldn't want to share, such as tokens, credentials, personal documents, and internal files. That's
          a good reason to be careful about where you paste them.
        </P>
        <P>
          This tool processes everything in your browser. Text, images, and files are not sent across the internet, so there is nothing to
          intercept in transit and nothing stored on our side. You copy or download the result straight from the page. Tolz tools are free to use,
          with no hidden charges.
        </P>
        <P>
          One habit is still worth keeping. If you work with live credentials or production secrets, rotate them if there's any chance they were
          exposed elsewhere, such as in a chat message or a shared document. A local tool protects what you do here, not what happened before.
        </P>
      </Card>

      <Card title="Base64 Is Encoding, Not Encryption">
        <P>
          A common and risky mistake is to treat Base64 as a way to hide or protect data. It isn't one. Base64 has no key and no secret. Anyone who
          sees an encoded string can decode it in seconds, and this decoder does exactly that.
        </P>
        <P>
          This is why "decrypting" a Base64 password is really just decoding it, and why encoding a password in Base64 doesn't protect it.
          Passwords should be hashed with a modern password-hashing method, and sensitive data should be encrypted and sent over HTTPS. If you find
          passwords, keys, or personal data stored only as Base64 in a codebase or response, treat them as exposed.
        </P>
        <P>
          The same goes for code. You may come across JavaScript that has been "encrypted" with Base64. That is obfuscation, and decoding the string
          reveals the original code. It's useful for understanding what a script does, but read decoded code with care and don't run anything you
          don't trust.
        </P>
      </Card>

      <Card title="Fixing Common Base64 Errors">
        <P>Most failed conversions come from a handful of causes.</P>
        <List items={[
          ["Invalid or incomplete input.", "A Base64 string can only contain valid characters, and its length has to fit the padding rules. Spaces, line breaks added while copying, or missing = characters can all cause errors. Check that you copied the entire string."],
          ["Garbled text after decoding.", "This is nearly always a character set mismatch. Try UTF-8 first, then the set used by the system that created the string."],
          ["The URL-safe variant.", "If the string uses - and _ instead of + and /, it's Base64URL. Swap those characters back, restore padding if needed, and decode again."],
          ["The data URI prefix.", "Data URIs include a header before the encoded content. Only the part after base64, is the actual data."],
          ["Corrupted files after decoding.", "A single dropped character can break a file. Copy the source string again in full."],
          ["Large files.", "Files over 25 MB are above the limit for this tool. Larger files may also take longer to process, so give them a few seconds."],
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
