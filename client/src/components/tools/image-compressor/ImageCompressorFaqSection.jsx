import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I compress an image to 100KB or less?",
    a: "Upload your image, set the quality slider to around 60–70%, and check the output size. If it's still above 100 KB, lower the quality in small steps until it fits. For very strict limits (20–50 KB), reducing the image's pixel dimensions before compressing makes hitting the target much easier.",
  },
  {
    q: "Does compressing an image reduce its quality?",
    a: "Lossy compression removes some image data, but at moderate settings (70–85% quality) the difference is invisible at normal viewing sizes. Quality loss only becomes noticeable at aggressive settings or after compressing the same file repeatedly.",
  },
  {
    q: "Is this image compressor really free?",
    a: "Yes. There are no charges, no premium tiers required to download your file, no watermarks, and no signup. You can compress as many images as you need.",
  },
  {
    q: "What image formats can I compress?",
    a: "The tool supports the most common formats: JPEG, PNG, and WebP. JPEGs offer the largest size reductions, PNGs compress more modestly because they're lossless, and WebP delivers the best size-to-quality balance for web use.",
  },
  {
    q: "Are my images stored on your servers?",
    a: "No. Files are used only to complete your compression and are not kept, catalogued, or shared. Uploads are removed automatically once processing is finished.",
  },
  {
    q: "What's the difference between compressing and resizing an image?",
    a: "Resizing changes the image's dimensions (its width and height in pixels), while compressing reduces the file size at the same dimensions by encoding the data more efficiently. For maximum savings, do both: resize to the dimensions you actually need, then compress.",
  },
  {
    q: "Why is my PNG still large after compression?",
    a: "PNG uses lossless compression, so savings are limited by how much redundancy the file contains. Photographic PNGs compress poorly by design — converting them to JPEG or WebP will shrink them far more effectively.",
  },
  {
    q: "Can I compress multiple images at once?",
    a: "You can process images back to back with no limits or waiting periods. There's no cap on how many files you compress in a session.",
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
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 12,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

export default function ImageCompressorFaqSection() {
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

      {/* What does this tool do */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Does This Image Compressor Do?</h2>
        <p style={pStyle}>
          This image compressor reduces the file size of your pictures while keeping them sharp enough for
          websites, emails, documents, and online forms. Upload a JPEG, PNG, or WebP file, choose how much
          compression you want, and download a smaller version in seconds — no account, no watermark, and no
          cost. It is one of the free utilities on <Link to="/" className="inline-home-link">Tolz</Link>, a collection of online tools built to handle everyday
          file and conversion tasks directly in your browser.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A typical photo straight from a phone camera weighs anywhere from 3 MB to 12 MB. That size is
          unnecessary for most purposes: a website hero image rarely needs to exceed 300 KB, an email
          attachment loads faster under 1 MB, and many government or job-application portals cap uploads at
          100 KB or even 20 KB. This tool closes that gap. It re-encodes your image using efficient compression
          algorithms, discarding data your eyes can't meaningfully perceive while preserving the details that
          matter — edges, faces, text, and color balance.
        </p>
      </div>

      {/* How compression works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Image Compression Actually Works</h2>
        <p style={pStyle}>
          Understanding the basics helps you pick the right settings. There are two approaches to shrinking an
          image, and this tool supports the practical middle ground between them.
        </p>
        <h3 style={h3Style}>Lossy compression</h3>
        <p style={pStyle}>
          Removes fine visual data the human eye is least sensitive to — subtle color gradients, high-frequency
          texture noise, and near-identical neighboring pixels. JPEG is the classic lossy format. At a sensible
          quality level (roughly 70–85%), a photo can shrink by 60–90% with no visible difference at normal
          viewing sizes.
        </p>
        <h3 style={h3Style}>Lossless compression</h3>
        <p style={pStyle}>
          Repacks the image data more efficiently without discarding anything, the way a ZIP file works. PNG
          uses lossless compression, which is why PNGs of photographs are large: there's simply more unique
          data to store. Lossless savings are smaller, usually 10–40%, but the output is pixel-identical to the
          original.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The compression slider on this tool controls how aggressive the lossy stage is. A lower quality
          setting means a smaller file and more visible artifacts; a higher setting means better fidelity and a
          larger file. For most photos, you can push quality down to around 75% before anyone notices a
          difference, which is where the biggest practical savings live.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Tool</h2>
        <p style={pStyle}>Compressing an image here takes under a minute:</p>
        <ol style={{ ...pStyle, marginBottom: 0, paddingLeft: 18 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Upload your image.</strong> Click the upload area or drag and drop your file directly onto
            the tool. JPEG, PNG, and WebP files are supported.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Choose your compression level.</strong> Use the quality slider to balance file size against
            sharpness. If you have a specific target — say, under 100 KB for a form upload — start around
            60–70% quality and adjust from there.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Preview the result.</strong> Check the estimated output size and, where available, compare
            the compressed preview against the original to confirm the quality is acceptable.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Download the compressed image.</strong> Click the download button to save the smaller file
            to your device. Your original file remains untouched.
          </li>
          <li>
            <strong>Repeat as needed.</strong> Need to compress several pictures? Run them through one after
            another — there's no daily cap and no signup wall interrupting the process.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          If your first attempt is still too large, lower the quality setting a step at a time rather than
          jumping straight to the minimum. Small adjustments preserve far more detail than a single aggressive
          pass.
        </p>
      </div>

      {/* Who it's for */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who This Tool Is For</h2>
        <p style={pStyle}>
          An online image compressor is useful to almost anyone who moves pictures around the internet, but a
          few groups rely on it constantly.
        </p>
        <p style={pStyle}>
          <strong>Website owners and bloggers</strong> compress images because page weight directly affects
          loading speed, and loading speed affects both visitor experience and search rankings. Oversized
          images are the single most common cause of poor Core Web Vitals scores, particularly Largest
          Contentful Paint. Shrinking a 4 MB banner to 250 KB can cut seconds off a page load.
        </p>
        <p style={pStyle}>
          <strong>Students and job applicants</strong> run into strict upload limits everywhere: scholarship
          portals, university applications, visa forms, and job boards frequently reject files over 100 KB or
          200 KB. A compressor turns an unusable phone photo of a document or ID into an accepted upload.
        </p>
        <p style={pStyle}>
          <strong>Ecommerce sellers</strong> need product photos that look crisp but load instantly across
          dozens or hundreds of listings. Marketplaces like Amazon, Etsy, and Daraz also impose their own file
          size ceilings.
        </p>
        <p style={pStyle}>
          <strong>Office workers and freelancers</strong> compress images before emailing them, embedding them
          in reports, or adding them to presentations, keeping attachments deliverable and documents from
          ballooning to unmanageable sizes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Developers and designers</strong> use compression as a final export step so assets ship at
          production-ready sizes without opening heavyweight editing software.
        </p>
      </div>

      {/* When you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Actually Need to Compress an Image</h2>
        <p style={pStyle}>A few concrete situations come up again and again:</p>
        <p style={pStyle}>
          <strong>Email attachment limits.</strong> Gmail and Outlook cap messages around 20–25 MB, but large
          attachments are slow to send and slow for recipients to open. Compressing photos before attaching
          them keeps emails fast and prevents bounce-backs.
        </p>
        <p style={pStyle}>
          <strong>Form and portal uploads.</strong> Passport applications, exam registrations, tax portals, and
          HR systems commonly require images under a fixed size, often 100 KB, sometimes as low as 20 KB. This
          is the most unforgiving scenario, and the exact reason a quality slider matters: you can tune the
          output until it fits.
        </p>
        <p style={pStyle}>
          <strong>Faster websites and better SEO.</strong> Google's page experience signals reward
          fast-loading pages. Since images typically account for half or more of a page's total weight,
          compressing them is the highest-impact optimization most site owners can make without touching code.
        </p>
        <p style={pStyle}>
          <strong>Saving storage and bandwidth.</strong> Compressed images take up less space on your phone,
          cloud drive, or server, and they consume less mobile data for anyone viewing them — a real
          consideration for audiences on slower connections.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Messaging and social platforms.</strong> Some platforms recompress large uploads with harsh
          settings of their own. Compressing carefully yourself first often produces a better-looking result
          than letting the platform do it aggressively.
        </p>
      </div>

      {/* Format breakdown */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compressing JPEG, PNG, and WebP Files</h2>
        <p style={pStyle}>
          Each format behaves differently under compression, and knowing which you're working with helps you
          get the best result.
        </p>
        <h3 style={h3Style}>JPEG (.jpg)</h3>
        <p style={pStyle}>
          The standard for photographs and responds extremely well to compression. Because JPEG is inherently
          lossy, there is huge room to reduce size. Most photos can lose 70–90% of their weight before quality
          visibly degrades. If your goal is the smallest possible photo, JPEG is usually the right output.
        </p>
        <h3 style={h3Style}>PNG (.png)</h3>
        <p style={pStyle}>
          Designed for graphics with sharp edges and flat colors — logos, screenshots, icons, and images that
          need transparency. PNG compression is lossless by nature, so savings are more modest. If a PNG
          photograph is far too large, converting it to JPEG or WebP during compression typically achieves a
          much bigger reduction than optimizing the PNG itself.
        </p>
        <h3 style={h3Style}>WebP (.webp)</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A modern format developed by Google that compresses roughly 25–35% smaller than equivalent-quality
          JPEGs and also supports transparency. It's now supported by every major browser, which makes it the
          strongest choice for web publishing. If you're compressing images for your own website, exporting to
          WebP gives you the best size-to-quality ratio available.
        </p>
      </div>

      {/* Without losing quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reducing File Size Without Losing Quality</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          "Without losing quality" is the phrase everyone searches for, so it deserves an honest answer: lossy
          compression always discards some data. The real goal is discarding data no one can see. Compress
          from the original file whenever possible — recompressing an already-compressed JPEG stacks artifacts
          on top of artifacts, and quality degrades quickly with each generation. Keep resolution in mind, too:
          an image displayed at 800 pixels wide gains nothing from being 4000 pixels wide, and resizing
          dimensions before compressing multiplies your savings. Finally, match the quality setting to the
          destination — a full-screen portfolio image justifies 85% quality, while a thumbnail or form upload
          looks perfectly fine at 50–60%. Used this way, compression is effectively invisible: the file shrinks
          dramatically and viewers never know the difference.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Your Privacy and File Security</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          File safety is a fair concern whenever you upload anything to an online tool, especially personal
          photos or scanned documents. This compressor is built with that in mind. Your images are used solely
          to perform the compression you requested — they are not stored permanently, added to any library, or
          shared with third parties, and processed files are removed automatically after your session. The
          tool is completely free, with no hidden charges, no watermarks stamped onto your output, and no
          signup or email address required to download your result. What you upload stays yours, and what you
          download is a clean, full-quality compressed file with no strings attached.
        </p>
      </div>

      {/* Why online vs desktop */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use an Online Compressor Instead of Desktop Software</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Photoshop, GIMP, and other editors can compress images, but they're the wrong tool for a
          thirty-second task. Desktop software requires installation, storage space, and often a learning curve
          or a license fee, and it isn't available on a borrowed computer, an office machine with locked-down
          permissions, or your phone. A browser-based image compressor works anywhere — Windows, macOS, Linux,
          Android, iOS — with nothing to install and nothing to update. For quick, repeatable jobs like
          preparing an upload or lightening an email attachment, an online tool is simply faster from click to
          finished file.
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
