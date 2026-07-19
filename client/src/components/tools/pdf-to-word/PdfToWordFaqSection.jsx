import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I convert a PDF to Word for free?",
    a: "Upload your PDF to the converter on this page, wait a moment while it processes, and download the editable .docx file. It's completely free, and you don't need to install software or create an account.",
  },
  {
    q: "Will my formatting stay the same after converting PDF to Word?",
    a: "In most cases, yes. Text, headings, lists, tables, and images are carried over to match the original as closely as possible. Simple, text-based PDFs convert almost perfectly, while very complex or graphic-heavy layouts may need small manual adjustments.",
  },
  {
    q: "Do I need to sign up or install anything?",
    a: "No. The tool runs entirely in your browser, so there's nothing to download and no account, email, or registration required to convert your file.",
  },
  {
    q: "Does the converted Word file have a watermark?",
    a: "No. Your document is returned clean and editable, with no watermark placed over the text or images.",
  },
  {
    q: "Can I convert a scanned PDF to an editable Word document?",
    a: "A scanned PDF is an image, so its text is locked inside the picture. To make it editable, you need a conversion process that supports OCR, which recognizes the letters in the image and turns them into real text. Try highlighting the text in your PDF first — if it selects, the file is already editable and will convert cleanly.",
  },
  {
    q: "Is it safe to convert confidential documents online?",
    a: "Files are processed securely only for the conversion and aren't stored or shared afterward, and no account links the document to you. For extra caution with sensitive files, delete your local downloads when you're done and avoid public or shared computers.",
  },
  {
    q: "What's the difference between PDF and DOCX?",
    a: "A PDF is a fixed format built for consistent viewing and printing, which makes it hard to edit. A DOCX is Microsoft Word's editable format, so converting to it gives you a document you can freely rewrite, restructure, and reformat.",
  },
  {
    q: "Can I use this converter on my phone?",
    a: "Yes. Because it works in any modern browser, you can convert PDF to Word on Android or iOS just as easily as on a desktop, with no app to install.",
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
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

export default function PdfToWordFaqSection() {
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

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Editing a PDF that someone else created can feel impossible — the text is locked, the layout won't
          budge, and copying a single paragraph often scrambles the spacing. A PDF to Word converter solves
          that by turning a fixed PDF back into a fully editable document you can open in Microsoft Word,
          Google Docs, or any word processor. The free PDF to Word converter on <Link to="/" className="inline-home-link">Tolz</Link> does exactly this: upload
          your file, and it rebuilds the content as a .docx you can rewrite, reformat, and reuse, with no
          software to install and no account to create.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What a PDF to Word Converter Actually Does</h2>
        <p style={pStyle}>
          A PDF (Portable Document Format) is designed to look identical on every screen and printer, which is
          why it's the standard for contracts, invoices, and official forms. That reliability comes at a cost:
          PDFs are built to be viewed, not edited. The words you see are often locked into fixed positions
          rather than stored as flowing, editable text.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Converting PDF to Word reverses that. The tool reads the structure of your document — paragraphs,
          headings, lists, tables, and images — and reconstructs each element inside a Word file. The result
          is a .docx (or DOC-compatible) document where your cursor behaves normally: you can select a
          sentence, fix a typo, change a font, or delete a whole page. Instead of fighting a locked file, you
          get a clean starting point you fully control. This is the difference between a screenshot of a
          document and the document itself.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Convert PDF to Word Online</h2>
        <p style={pStyle}>
          The process is intentionally simple, and it runs entirely in your browser. There's nothing to
          download and nothing to configure.
        </p>
        <p style={pStyle}>
          First, add your file to the converter above, either drag and drop the PDF straight onto the upload
          area or click to browse and select it from your device. Next, let the tool process the document; it
          scans each page, identifies the text and layout, and maps everything into an editable Word
          structure. Finally, download your finished .docx file and open it in Word, Google Docs, LibreOffice,
          or Pages.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because the whole flow happens online, you can convert PDF to Word from a laptop, phone, or tablet
          without worrying about which operating system you're on or whether you have Office installed. There
          are no menus to dig through and no export settings to guess at — you upload, you convert, you
          download.
        </p>
      </div>

      {/* When you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Actually Need to Convert PDF to Word</h2>
        <p style={pStyle}>
          Most people reach for a PDF to Word converter because they hit a wall with a document they can't
          change. These are the situations where it saves the most time:
        </p>
        <p style={pStyle}>
          <strong>Updating a resume or CV.</strong> You saved your resume as a PDF, the original Word file is
          long gone, and now a job posting needs one small tweak. Converting the PDF back to an editable
          document means you don't have to rebuild it from scratch.
        </p>
        <p style={pStyle}>
          <strong>Editing contracts and agreements.</strong> Legal templates, lease agreements, and vendor
          contracts are almost always shared as PDFs. When a clause, date, or name needs to change, an
          editable Word version lets you make revisions cleanly and track them.
        </p>
        <p style={pStyle}>
          <strong>Reusing content for reports and proposals.</strong> If you need to pull tables, figures, or
          several paragraphs from an existing PDF into a new document, converting first is far faster and
          cleaner than retyping or copy-pasting piece by piece.
        </p>
        <p style={pStyle}>
          <strong>Coursework and research.</strong> Students and academics often receive lecture notes, papers,
          and assignment briefs as PDFs. A Word version makes it easy to annotate, quote, and build on the
          material.
        </p>
        <p style={pStyle}>
          <strong>Translating or rewriting.</strong> Editing a document in Word is much simpler than working
          around a locked PDF, whether you're translating text, simplifying language, or adapting a template
          for a new client.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In every one of these cases, the underlying need is the same: you have finished-looking content
          trapped in a fixed format, and you need it back in a shape you can edit.
        </p>
      </div>

      {/* Formatting */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Formatting, Tables, and Images That Stay Intact</h2>
        <p style={pStyle}>
          The real test of any PDF to Word converter is how faithfully it preserves your original layout.
          Extracting raw text is easy; keeping the document looking like the original is the hard part.
        </p>
        <p style={pStyle}>
          A good conversion keeps your paragraph breaks, headings, and lists where they belong instead of
          dumping everything into one wall of text. It carries over tables as actual editable tables, with
          rows and columns you can adjust, rather than flattening them into loose text. Images, logos, and
          charts are placed back into position, and font styles, sizes, bold, and italics are matched as
          closely as the source allows. The aim is a Word file you can start editing immediately, not one you
          have to spend an hour rebuilding.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It helps to understand where converters have limits. PDFs generated directly from Word or another
          editor convert almost perfectly because the underlying text is clean. Heavily designed files —
          think magazine-style layouts with overlapping graphics — may need minor touch-ups after conversion,
          since the original design pushes the boundaries of what a standard Word document can represent.
        </p>
      </div>

      {/* Scanned PDFs */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Converting Scanned PDFs and Image-Based Files</h2>
        <p style={pStyle}>
          Not every PDF contains selectable text. A document you scanned or photographed is really just an
          image saved in PDF form, with no text layer underneath. If you try to copy from it, you get nothing,
          because there are no characters to copy, only pixels.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is worth checking before you convert: open your PDF and try to highlight a sentence. If your
          cursor selects the text, it's a true digital PDF and will convert into fully editable Word text. If
          nothing highlights, the file is image-based and the words are effectively locked inside a picture.
          When you need editable output from a scanned document, look for a converter or workflow that
          supports optical character recognition (OCR), which reads the letters in the image and turns them
          into real, editable text. Knowing which type of file you have upfront sets the right expectation for
          the output you'll get.
        </p>
      </div>

      {/* Free/no signup */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Watermark</h2>
        <p style={pStyle}>
          Many conversion sites hide the real cost behind the "free" label. They cap you at one or two files a
          day, stamp a watermark across every page, or force you to create an account and hand over an email
          before you can download anything.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This PDF to Word converter takes the opposite approach. It's genuinely free to use, with no hidden
          charges and no premium tier gating the basic feature you came for. You don't need to register, sign
          in, or provide an email address — you can convert a file and leave without ever creating an account.
          And your finished document comes out clean, with no watermark added across the text or images. What
          you upload is what you get back, in editable form.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Safe? Privacy and File Security</h2>
        <p style={pStyle}>
          The documents people convert are often personal or confidential — resumes with contact details,
          contracts, financial statements, medical forms. Naturally, the first question is what happens to a
          file after it's uploaded.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your privacy is treated as a priority here. Files are processed securely for the single purpose of
          converting them, and they aren't stored or shared afterward. Because you don't create an account,
          there's no profile tying your documents to your identity in the first place. In practice, that means
          you can convert a sensitive PDF to Word without leaving a lasting copy behind on a server. If you're
          handling especially confidential material, it's always sensible to delete your local downloads once
          you're finished and avoid uploading documents on shared or public computers — good habits that apply
          to any online tool.
        </p>
      </div>

      {/* Cross-device */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Works on Every Device and Browser</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because the converter runs online, it isn't tied to a single platform. It works the same on Windows,
          macOS, Linux, Android, and iOS, and through any modern browser — Chrome, Safari, Firefox, or Edge.
          You don't need Microsoft Office or any paid software to create or open the output; the .docx file
          opens just as well in free tools like Google Docs and LibreOffice Writer. That cross-platform
          flexibility is one of the biggest advantages of a browser-based converter. Whether you're on a work
          desktop, a personal phone, or a borrowed laptop, the experience is identical, and nothing needs to be
          installed to get an editable Word file.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for the Best Conversion Results</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few small habits noticeably improve your output. Start with a text-based PDF whenever you can,
          since clean source text converts far more accurately than a scan. Always open and review the
          converted file before you rely on it — quickly check that tables are lined up and that no headings
          drift out of place. For very long documents, skim the whole file rather than just the first page, as
          layout issues tend to appear around complex sections. And keep your original PDF until you've
          confirmed the Word version is correct, so you always have the source to fall back on.
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
