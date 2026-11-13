import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this URL shortener really free?",
    a: "Yes. There are no charges, subscriptions, or hidden fees.",
  },
  {
    q: "Do I need an account to shorten a link?",
    a: "No. Paste your link and you’ll get a short version right away.",
  },
  {
    q: "Can I shorten any type of URL?",
    a: "Yes, as long as it’s a standard web address starting with http:// or https://. That includes articles, product pages, documents, videos, and forms.",
  },
  {
    q: "Will my shortened link expire?",
    a: "The tool is built to keep links working for normal use. For anything long-term, check every so often that both the short link and the destination still work.",
  },
  {
    q: "Is it safe to click a shortened link?",
    a: "It can be, but you can’t see the destination before you click. Be careful with short links from unknown senders, and expand them first if you’re unsure.",
  },
  {
    q: "Can I see who clicks my link, or edit and delete it later?",
    a: "Not with Tolz. There’s no account or dashboard, so there are no click reports and no way to change or delete a link afterward. Save any link you plan to reuse, and create a new one if you need to change the destination.",
  },
  {
    q: "Does shortening a URL affect SEO?",
    a: "No. Search engines index the destination page, not the short link, so shortening a URL for sharing doesn’t change that page’s rankings.",
  },
  {
    q: "Can I shorten multiple links at once?",
    a: "Each link is shortened one at a time, and you can repeat the process as often as you like.",
  },
  {
    q: "Is there a limit to how many links I can shorten?",
    a: "There’s no account-based cap, because no account is needed.",
  },
  {
    q: "What happens if I lose my short link?",
    a: "Because there’s no login or history, there’s no way to retrieve it. Save your short links in your own notes or a spreadsheet.",
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
const olStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* How to */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Shorten a URL with Tolz</h2>
        <p style={pStyle}>You don’t need any technical knowledge. It takes four steps:</p>
        <ol style={olStyle}>
          <li style={liStyle}>Copy the long URL from your browser’s address bar or from wherever it’s listed.</li>
          <li style={liStyle}>Paste it into the input field above.</li>
          <li style={liStyle}>Click the shorten button.</li>
          <li>Copy the new short link and share it.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There’s no signup, no email verification, and no waiting. The whole thing usually takes less than ten seconds,
          which helps when you’re shortening several links in a row, like when you’re scheduling posts or putting
          together a newsletter. The tool works with standard web addresses that start with http:// or https://,
          including articles, product pages, PDFs, videos, and forms.
        </p>
      </div>

      {/* Why */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use a URL Shortener?</h2>
        <p style={pStyle}>
          The point of shortening a URL is to make a link easier to handle. A short link is easier to read, easier to
          paste, and harder to break. Here are the situations where it helps most:
        </p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Text messages and chat apps.</strong> Long URLs can wrap awkwardly or get cut off, especially on
            older phones. A short link stays in one piece.
          </li>
          <li style={liStyle}>
            <strong>Print and offline materials.</strong> Business cards, flyers, packaging, and slides don’t have room
            for a link with a dozen parameters, and nobody wants to type one by hand.
          </li>
          <li style={liStyle}>
            <strong>Email and newsletters.</strong> Short links keep the layout clean, especially when the original
            URLs carry long UTM tags.
          </li>
          <li style={liStyle}>
            <strong>QR codes.</strong> A shorter URL produces a simpler QR code with larger squares, which scans more
            reliably at small sizes.
          </li>
          <li style={liStyle}>
            <strong>Speaking out loud.</strong> If you’re teaching or presenting, a short link is much easier for people
            to catch and type.
          </li>
          <li>
            <strong>Social media.</strong> A short link makes posts look cleaner. One thing to know: X (formerly
            Twitter) wraps every link in its own t.co link and counts it as a fixed length, so shortening won’t save you
            characters there. It still helps on platforms and in apps that show the full URL as typed.
          </li>
        </ul>
        <p style={pStyle}>
          Shortening also hides messy tracking parameters from view. It doesn’t remove them, though. The parameters
          still travel with the link when someone clicks.
        </p>
        <h3 style={h3Style}>Short link vs. link sharing site</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A URL shortener and a link sharing site solve different problems. A shortener gives you one compact link for
          one destination, which is ideal when you need something quick and clean. A link sharing site (often called a
          link-in-bio or link hub page) puts several links on one page, which works better when you have a lot to
          share, like a portfolio, a set of resources, or all your social profiles. Many people use both: a short link
          to point people to the hub, and the hub to hold everything else.
        </p>
      </div>

      {/* Which is best */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Which URL Shortener Is Best?</h2>
        <p style={pStyle}>There isn’t one best choice for everyone. It depends on what you need.</p>
        <p style={pStyle}>
          If you want to turn a long link into a short one quickly, without creating an account, a simple free tool
          like Tolz’s URL shortener does the job. If you run marketing campaigns and need click reports, branded
          domains, or the ability to change where a link points later, a paid platform with an account and dashboard is
          a better fit.
        </p>
        <p style={pStyle}>Whatever you choose, look at a few things first:</p>
        <ul style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Reliability.</strong> Will the links keep working? Google’s own goo.gl shortener was shut down, and
            many of those links stopped working. A service with a stable track record matters.
          </li>
          <li style={liStyle}>
            <strong>Safety.</strong> Does the service block spam and malicious destinations? Does it use HTTPS?
          </li>
          <li style={liStyle}>
            <strong>No detours.</strong> Avoid shorteners that send visitors through ad pages before reaching the
            destination. They slow people down and hurt trust.
          </li>
          <li style={liStyle}>
            <strong>Features you’ll actually use.</strong> Custom aliases, analytics, and custom domains are only worth
            paying for if you need them.
          </li>
          <li>
            <strong>Clear terms.</strong> Check how long links stay active and what data the service collects.
          </li>
        </ul>
      </div>

      {/* How they work */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How URL Shorteners Work</h2>
        <p style={pStyle}>
          A URL shortener is basically a lookup table. When you submit a long URL, the service saves it in a database
          and generates a short code, such as “aB3xY9k.” It then builds a new link from its own domain plus that code.
          When someone opens the short link, the server looks up the code, finds the original address, and sends the
          browser there using a redirect. All of this happens in a fraction of a second.
        </p>
        <p style={pStyle}>
          The code itself is usually created in one of two ways. Some services keep a running counter and convert each
          number into a short string using letters and digits (known as base62 encoding). Others generate a random
          string and check that it hasn’t been used before. With seven characters from a 62-character set (a–z, A–Z,
          0–9), there are over 3.5 trillion possible codes, so there’s plenty of room.
        </p>
        <p style={pStyle}>
          The redirect is typically a 301 (permanent) or a 302 (temporary) response. Both send visitors to the same
          page. Search engines treat them a little differently, which matters for SEO, as covered below.
        </p>
        <h3 style={h3Style}>Does the type of shortener affect transfer volume?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A little, but not much. A normal redirect adds one extra request of a few hundred bytes, which is tiny next to
          the size of the page you’re sending people to. The bigger differences come from how the service behaves. A
          shortener that routes visitors through an ad page or a countdown adds real delay, and some visitors leave
          before they reach your site. That lowers your actual traffic even though the data transferred is about the
          same. A fast, direct redirect has almost no measurable impact.
        </p>
      </div>

      {/* Features */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Key Features of the Tolz URL Shortener</h2>
        <ul style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Free.</strong> No hidden fees, subscription tiers, or paywalls.</li>
          <li style={liStyle}><strong>No signup.</strong> You don’t need an account or an email address.</li>
          <li style={liStyle}><strong>Fast.</strong> Links are generated almost instantly.</li>
          <li style={liStyle}>
            <strong>Clean output.</strong> The short link is easy to read, copy, and paste anywhere.
          </li>
          <li>
            <strong>Works with common links.</strong> Articles, product pages, PDFs, videos, and forms all work without
            special formatting.
          </li>
        </ul>
      </div>

      {/* Safety */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Are Short URLs Safe?</h2>
        <p style={pStyle}>
          Short links aren’t unsafe by themselves. They behave like any other link. The risk comes from the fact that
          they hide the destination until you click, which is why scammers like them. These are the main concerns:
        </p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Phishing and malware.</strong> A short link can disguise a fake login page or a harmful download.
            This is the biggest security risk with shortening services.
          </li>
          <li style={liStyle}>
            <strong>Guessable links.</strong> Short codes are short, so people can and do try random codes to find
            content that was never meant to be public. If a link points to a private document, don’t assume nobody will
            find it.
          </li>
          <li style={liStyle}>
            <strong>Link rot.</strong> If the shortening service closes or removes your link, everything that used it
            breaks.
          </li>
          <li style={liStyle}>
            <strong>Third-party tracking.</strong> Some shorteners log clicks along with IP address, device, and
            location data. Check the privacy policy of any service you use.
          </li>
          <li>
            <strong>Email filtering.</strong> Because shorteners are often abused, some spam filters and platforms treat
            them with suspicion, which can hurt deliverability.
          </li>
        </ul>
        <p style={pStyle}>
          For website owners, there’s one more point. Sending traffic through a third-party redirect puts that service
          between you and your visitors. If it goes down, gets sold, or is compromised, your links are affected. For
          anything long-term, such as a link on your own website, use the real URL.
        </p>
        <p style={pStyle}>
          On privacy, Tolz keeps things minimal. The destination URL you submit is used to create the redirect, and you
          don’t provide any personal information, email address, or payment details because there’s no account. Since
          there’s no profile, the links you create aren’t tied to an identity.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>How to stay safe:</strong> Check where a short link goes before you click it, be careful with short
          links from people you don’t know, and don’t shorten private or sensitive URLs.
        </p>
      </div>

      {/* Check destination */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Check Where a Short Link Goes</h2>
        <p style={pStyle}>
          You can’t tell a short link’s destination just by looking at it, but you can find out without visiting the
          page.
        </p>
        <p style={pStyle}>
          <strong>Expanding a short link.</strong> Paste it into a link expander or redirect checker. These tools follow
          the redirect and show you the final address and the status of each hop. Some shortening services also offer a
          preview option, and many browsers show the destination in the status bar for certain links.
        </p>
        <p style={pStyle}>
          <strong>Finding the original URL.</strong> The methods above work for this too. If you created the link
          yourself, check your own records, since a service without accounts has no history to look it up in. If you
          need to be extra careful with a suspicious link, run it through a URL scanner before opening it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Telling if a short link is still active.</strong> Signs that a short link no longer works include a
          “404” or “link not found” error, a blank page, a message saying the link was removed, a warning from the
          service, or a redirect to a parking page. To check, open it in a private window or run it through a redirect
          checker. If the short link fails but the original URL still loads, the short link is the problem and you’ll
          need to create a new one.
        </p>
      </div>

      {/* Tracking, editing, customizing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tracking, Editing, and Customizing Short Links</h2>
        <h3 style={h3Style}>Can you see who clicks your links?</h3>
        <p style={pStyle}>
          It depends on the service. Platforms with accounts usually show click counts, referring sites, countries, and
          device types. They don’t reveal the names of the people who clicked. Tolz doesn’t require an account, so it
          has no click dashboard. If you need to measure traffic, add UTM parameters to your destination URL before
          shortening it and watch the results in your analytics tool.
        </p>
        <h3 style={h3Style}>Can you edit or delete a short link?</h3>
        <p style={pStyle}>
          With Tolz, no. Since there’s no account tied to your links, there’s no way to change or remove one later. If a
          destination changes or you made a mistake, create a new short link. Paid services with accounts usually let
          you change a link’s destination and delete it.
        </p>
        <h3 style={h3Style}>How do you customize a short link?</h3>
        <p style={pStyle}>
          On services that offer it, you choose a custom ending (called an alias or slug), such as “/spring-sale”
          instead of a random string. That’s a feature of account-based services. Tolz generates the short link for you
          automatically.
        </p>
        <h3 style={h3Style}>Can you use your own domain?</h3>
        <p style={pStyle}>
          Yes, with some services. You connect a domain you own, and your short links use it instead of the service’s
          domain. This builds trust and keeps your brand visible. It usually requires an account and, often, a paid
          plan. Tolz doesn’t currently support custom domains.
        </p>
        <h3 style={h3Style}>How long should a short URL be?</h3>
        <p style={pStyle}>
          As short as is practical, but not so short that it becomes guessable. A code of five to eight characters is
          common, which puts the full link at roughly 20 to 30 characters. If you’re choosing a custom alias, make it
          short enough to read aloud and specific enough to be remembered.
        </p>
        <h3 style={h3Style}>Does capitalization matter?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Yes. In a web address, the domain name isn’t case-sensitive, but everything after it usually is. So
          “example.com/aB3x” and “example.com/ab3x” can lead to two different pages, or to an error. This matters most
          when someone has to type a link by hand from a poster or hear it spoken. To avoid problems, copy and paste
          short links whenever you can. If you need links that are easy to say or type, look for a service that uses
          lowercase-only codes, and test the link exactly as you plan to share it.
        </p>
      </div>

      {/* Analytics */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Short Links and Analytics</h2>
        <p style={pStyle}>Shortened links can make your analytics less clear if you’re not careful:</p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Lost or muddled referral data.</strong> Traffic from a short link can show up as “direct” or be
            credited to the shortener instead of the real source, depending on how the redirect is set up.
          </li>
          <li style={liStyle}>
            <strong>Inflated clicks.</strong> Link previews, email scanners, and bots often open short links
            automatically. A shortener’s click count may be higher than your real visitor count.
          </li>
          <li style={liStyle}>
            <strong>Dropped parameters.</strong> A poorly built redirect can strip UTM tags or other parameters. Always
            test a short link and check that the tags reach your analytics tool.
          </li>
          <li>
            <strong>Dependence on one service.</strong> If your tracking data lives inside a third-party shortener and
            that service disappears, so does your history.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The safest setup is to put your UTM tags on the destination URL, shorten it, and compare the shortener’s
          numbers with your own analytics.
        </p>
      </div>

      {/* SEO */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Short URLs and SEO</h2>
        <p style={pStyle}>
          Shortening a URL isn’t an SEO tactic, and it won’t raise your rankings. Search engines index the destination
          page, not the short link. Google follows both 301 and 302 redirects, so a normal shortened link doesn’t hurt
          the page it points to either. Where shortening helps is indirect: cleaner links get shared and clicked more
          often on social media, in email, and in print.
        </p>
        <p style={pStyle}>A few practical points:</p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Don’t use short links for backlinks you care about.</strong> If you’re linking from your own site or
            asking another site to link to you, use the full URL. That keeps the link clean and not dependent on a third
            party.
          </li>
          <li>
            <strong>There’s no special “SEO” shortener.</strong> Any reliable free service works for sharing. Look for
            stable links, fast redirects, and no interstitial ads. Tolz is a good free option for quick use.
          </li>
        </ul>
        <h3 style={h3Style}>Affiliate links, tracking, and cloaking</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Using short or redirected links to track clicks on affiliate pages won’t get you penalized on its own.
          Google’s concern is cloaking, which means showing search engines one thing and visitors something different. A
          short link that sends everyone to the same destination isn’t cloaking. Affiliate links should still be labeled
          correctly, though. Google asks site owners to mark paid or affiliate links with{" "}
          <code style={mono}>rel="sponsored"</code> (or <code style={mono}>rel="nofollow"</code>), and its guidance on
          this is in{" "}
          <Ext href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links">
            Google Search Central’s page on qualifying outbound links
          </Ext>
          . The real SEO risks with affiliate sites come from thin, low-value content, not from the links themselves.
        </p>
      </div>

      {/* Google Ads / AdSense */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Short URLs, Google Ads, and AdSense</h2>
        <h3 style={h3Style}>Does Google Ads (formerly AdWords) accept shortened URLs?</h3>
        <p style={pStyle}>
          Not as your final URL. Google Ads requires the final URL to lead directly to your landing page, and the domain
          has to match the domain you show in the ad. Redirects from the final URL to a different domain have generally
          not been allowed, and a short link is exactly that. Google has said it will allow some cross-domain redirects
          with prior approval, but a public shortener isn’t something to count on. If you need click tracking, use a
          tracking template or a final URL suffix instead. You can read the full rules in{" "}
          <Ext href="https://support.google.com/adspolicy/answer/6368661">Google’s destination requirements policy</Ext>.
        </p>
        <h3 style={h3Style}>Can I use AdSense on a URL shortener website?</h3>
        <p style={pStyle}>
          It’s very difficult. AdSense wants sites with original, useful content for visitors, and a site whose main
          job is redirecting people has very little. Shorteners that show ads or countdown pages before the destination
          also tend to clash with AdSense’s rules on user experience and incentivized clicks.
        </p>
        <h3 style={h3Style}>Will AdSense reject my blog if I used a paying URL shortener?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Occasionally linking out through a short link isn’t the issue by itself. The trouble starts when a blog sends
          readers through paid shorteners that show ad pages or push people to click, because that creates a poor
          visitor experience and can conflict with AdSense program policies. If you want to monetize with AdSense, it’s
          safer to use direct links and focus on strong content. When in doubt, check Google’s AdSense policy center
          before applying or reapplying.
        </p>
      </div>

      {/* Quora */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Doesn’t Quora Recognize My Short URL?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Quora, like many large platforms, restricts links from known URL shorteners, mostly to fight spam. That can
          mean the link won’t turn into a clickable link, gets stripped out, or gets flagged. Links in answers are also
          often marked nofollow. If your short link isn’t working on Quora, use the full original URL instead.
        </p>
      </div>

      {/* Extensions */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Best URL Shortener Extensions for Chrome, Edge, Brave, and Safari</h2>
        <p style={pStyle}>
          Tolz’s URL shortener is the simplest place to start. It’s a web tool, so it works in any browser, including
          Chrome, Brave, Safari, and Microsoft Edge (Bing’s browser), without installing anything. Open the page, paste
          your link, and copy the result. For quick access, bookmark the page or pin it to your toolbar or Favorites bar.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want a dedicated extension, a few well-known services offer them, including Bitly, TinyURL, and
          Rebrandly. Most extensions are built for Chrome and other Chromium browsers like Brave and Edge, since they
          share the same extension system, and they typically require an account to get the most out of them. Safari’s
          extension support is more limited, so check what’s available for your version before relying on one.
        </p>
      </div>

      {/* Best practices */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Best Practices for Using Short Links</h2>
        <ul style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Test every link.</strong> Click it yourself before sending it in a mass email or public post.
          </li>
          <li style={liStyle}>
            <strong>Keep a record.</strong> Note which short link points to which URL, even in a simple spreadsheet. A
            tool without accounts can’t look it up for you later.
          </li>
          <li style={liStyle}>
            <strong>Don’t shorten links that don’t need it.</strong> An already short URL just gains an extra redirect.
            Save short links for spots where length is a real problem: SMS, print, QR codes, and social posts.
          </li>
          <li style={liStyle}>
            <strong>Double-check the original URL.</strong> A typo gives you a perfectly working short link to the wrong
            page, which is hard to spot later.
          </li>
          <li style={liStyle}>
            <strong>Keep private links private.</strong> A short link is easy to pass along and sometimes easy to guess.
          </li>
          <li>
            <strong>Pair with a QR code for print.</strong> It gives people two ways to reach the same page.
          </li>
        </ul>
      </div>

      {/* Who uses */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Uses URL Shorteners</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Social media managers use them to keep posts clean. Small business owners put them on flyers, receipts, and
          packaging. Teachers and presenters use them so audiences can type a link during a class or talk. Support teams
          use them to send documentation links in chat without cluttering the conversation. And plenty of people simply
          use them to send a friend a cleaner link.
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
