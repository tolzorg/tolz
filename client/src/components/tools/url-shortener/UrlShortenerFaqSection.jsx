import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this URL shortener really free to use?",
    a: "Yes. There are no charges, subscription requirements, or hidden fees to shorten a URL using this tool.",
  },
  {
    q: "Do I need to create an account to shorten a link?",
    a: "No signup or registration is required. You can paste your link and generate a shortened version immediately.",
  },
  {
    q: "Will the shortened link expire?",
    a: "The tool is designed to keep generated links working for standard use. If you're linking to something long-term, it's still good practice to periodically confirm the link and destination remain active.",
  },
  {
    q: "Can I shorten any type of URL?",
    a: "Yes, as long as it's a standard, valid web address (starting with http:// or https://), including links to articles, product pages, documents, videos, and forms.",
  },
  {
    q: "Is it safe to click a shortened link?",
    a: "Shortened links redirect to the original destination the same way any standard link does. As a general safety habit, it's wise to be cautious with any shortened link from an unknown or unverified source, since the destination isn't visible until you click it.",
  },
  {
    q: "Can I use this tool for social media posts?",
    a: "Yes, shortened links are especially useful on platforms with character limits or where a cleaner-looking link improves the appearance of your post.",
  },
  {
    q: "Does shortening a URL affect its ranking or SEO?",
    a: "Shortened links used for sharing on social media, in emails, or in print don't impact the SEO of the original destination page, since search engines index the actual destination content, not the short link itself.",
  },
  {
    q: "Can I shorten multiple links at once?",
    a: "Each link is shortened individually through the input field, allowing you to process as many links as you need one after another.",
  },
  {
    q: "Is there a limit to how many links I can shorten?",
    a: "The tool is available for repeated use without a cap tied to an account, since no account is required in the first place.",
  },
  {
    q: "What happens if I lose my shortened link?",
    a: "Since no account or dashboard is tied to the tool, it's a good idea to save any shortened link you plan to reuse in your own notes, as there is no login-based history to retrieve it from later.",
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
const olStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

export default function UrlShortenerFaqSection() {
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
        <p style={pStyle}>
          Long, messy links are one of the small annoyances of using the internet, whether you're sharing a
          product page, a blog post, or a document with someone else. <Link to="/" className="inline-home-link">Tolz</Link>'s URL shortener takes any long web
          address and turns it into a short, clean link you can share anywhere — on social media, in emails,
          in text messages, or in printed materials — without the clutter. There's no software to install and
          nothing to configure; you paste your link, click a button, and get a shorter version ready to use in
          seconds. This tool is part of the broader collection of free utilities available on Tolz, where the
          focus is on making everyday online tasks faster and simpler without unnecessary steps.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A URL shortener works by taking your original, often lengthy web address and mapping it to a much
          shorter one that redirects visitors to the same destination. The shortened link behaves exactly
          like the original — clicking it takes people to your intended page — but it's easier to read, easier
          to remember, and far more presentable when space is limited or when a clean appearance matters, such
          as on a business card, a slide, or a tweet.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Shorten a URL with Tolz</h2>
        <p style={pStyle}>
          Using the tool doesn't require any technical knowledge. The process is designed to be quick enough
          that you can shorten a link in the middle of any other task without losing your train of thought.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>Copy the long URL you want to shorten from your browser's address bar or from wherever it's listed.</li>
          <li style={{ marginBottom: 8 }}>Paste it into the input field on the tool.</li>
          <li style={{ marginBottom: 8 }}>Click the shorten button.</li>
          <li>Copy the newly generated short link and share it wherever you need.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          There's no account creation, no email verification, and no waiting period between steps. The entire
          process typically takes less than ten seconds, which matters when you're shortening links repeatedly
          throughout the day, such as when managing multiple social media posts or preparing a newsletter.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You Need a URL Shortener</h2>
        <p style={pStyle}>
          Shortening links isn't just about aesthetics, there are practical situations where a short URL
          genuinely improves the outcome of what you're trying to do.
        </p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Sharing on social media.</strong> Platforms like X (formerly Twitter) still have character
            limits, and even platforms without strict limits benefit from cleaner-looking posts. A short link
            leaves more room for your actual message and avoids the awkward line-wrapping that long URLs cause
            in a feed.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Sending links via SMS or messaging apps.</strong> Long URLs sometimes break across
            multiple text messages or get cut off entirely, especially on older devices or slower connections.
            A short link stays intact and reduces the chance of a broken or partial link reaching the
            recipient.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Printed and offline materials.</strong> Business cards, flyers, presentation slides, and
            product packaging all have limited space. A long tracking URL with dozens of parameters looks
            unprofessional and is nearly impossible to type manually if someone sees it printed rather than
            clicking it directly.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Email campaigns and newsletters.</strong> Marketers frequently need to insert several
            links throughout an email. Shortened links keep the layout tidy and reduce the visual noise that
            long URLs with UTM parameters create.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>QR codes.</strong> When a long URL is encoded into a QR code, the resulting code becomes
            denser and harder to scan reliably, especially at smaller print sizes. Shortening the URL first
            produces a simpler, more scannable QR code.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Verbal sharing.</strong> If you're presenting, teaching, or speaking to an audience and
            need to say a link out loud, a short custom link is far easier to communicate than a string of
            random characters and parameters.
          </li>
          <li>
            <strong>Cleaning up affiliate or tracking links.</strong> Links with tracking parameters (UTM
            tags, referral codes, session IDs) can look suspicious or cluttered to end users. A shortened
            version hides that complexity while preserving the full destination.
          </li>
        </ul>
      </div>

      {/* Key features */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Key Features That Make This Tool Useful</h2>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Completely free to use.</strong> There are no hidden charges, subscription tiers, or
            paywalls blocking core functionality. You can shorten as many links as you need without being
            asked to upgrade partway through.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>No signup required.</strong> You don't need to create an account, verify an email address,
            or log in to generate a short link. This removes friction for one-off users who just need a quick
            result and don't want to manage another account.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Fast processing.</strong> Links are generated almost instantly after you submit the
            original URL, with no artificial delays or multi-step confirmation processes.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Clean, shareable output.</strong> The generated short link is straightforward and free of
            unnecessary characters, making it easy to read, copy, and paste into any platform.
          </li>
          <li>
            <strong>Works across use cases.</strong> Whether the destination is a blog post, a product page, a
            PDF, a video, or a form, the shortener handles standard web URLs without requiring any special
            formatting on your part.
          </li>
        </ul>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy and Safety When Shortening Links</h2>
        <p style={pStyle}>
          A common hesitation people have with online tools is understanding what happens to their data. With
          Tolz's URL shortener, the process is limited to what's necessary to generate your short link: the
          destination URL you submit is used only to create the redirect. You're not required to provide any
          personal information, an email address, or payment details to use the tool, since no account is
          needed.
        </p>
        <p style={pStyle}>
          Because there's no signup step, there's also no profile tied to your identity connected to the links
          you create. This makes the tool suitable for quick, casual use where you simply want a working short
          link without setting up or maintaining an account.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As with any URL shortener from any provider, it's good practice to double-check the destination
          before sharing a shortened link widely, since the shortened format hides the original address from
          the person clicking it. This is a general safety habit worth following regardless of which
          shortening service is used, not a limitation specific to this tool.
        </p>
      </div>

      {/* Best practices */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Best Practices for Using Short Links Effectively</h2>
        <p style={pStyle}>
          Getting the most out of a shortened link involves a bit more than just generating one. A few habits
          help ensure your links perform well and remain trustworthy to the people clicking them.
        </p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Test the link before sharing it widely.</strong> After generating a short link, click it
            once yourself to confirm it redirects to the correct destination, especially before including it
            in a mass email or a public post.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Keep track of where you've shared each link.</strong> Since short links don't visually
            reveal their destination, it helps to keep a simple record, even a basic spreadsheet, of which
            short link points to which original URL, particularly if you're managing several campaigns at
            once.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Avoid shortening sensitive or private URLs unnecessarily.</strong> If a link leads to
            something private, such as a personal document or an internal page, consider whether it truly
            needs to be shortened and shared broadly, since a short link is easy to pass along further than
            intended.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Use short links for space-constrained contexts.</strong> Reserve shortened URLs for
            situations where the original link's length is actually a problem — social media posts, printed
            materials, SMS, and QR codes — rather than replacing every link on a webpage, where full URLs can
            sometimes provide useful context to readers.
          </li>
          <li>
            <strong>Pair with QR codes for offline-to-online bridges.</strong> If you're distributing physical
            materials, combining a short link with its equivalent QR code gives people two ways to reach the
            same destination depending on how they prefer to interact with it.
          </li>
        </ul>
      </div>

      {/* Common mistakes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes to Avoid</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Even a simple tool like a URL shortener can be misused in ways that create problems down the line.
          One frequent mistake is shortening a link and then losing track of the original destination, which
          becomes an issue if the short link stops working or needs to be recreated. Another is
          over-shortening, applying a short link to a URL that was already short and readable, which adds an
          unnecessary redirect step for no real benefit. Some people also shorten links without verifying the
          original URL was typed correctly, which means the short link simply redirects to the wrong (but
          still working) page, making the mistake harder to notice at a glance. Taking a few extra seconds to
          verify the input URL and test the output link avoids most of these issues entirely.
        </p>
      </div>

      {/* Who uses it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Uses URL Shorteners</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Short links are used across a wide range of everyday and professional situations. Social media
          managers use them to keep posts concise and visually clean. Small business owners use them on
          printed flyers, receipts, and packaging where space is limited. Teachers and presenters use them to
          give audiences an easy-to-type link during a class or talk. Customer support teams use them when
          sending links to documentation or forms over chat, where a long URL would otherwise clutter the
          conversation. Individuals also use them simply for convenience, sending a cleaner link to a friend
          or family member is often easier than sending a long, parameter-heavy one.
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
