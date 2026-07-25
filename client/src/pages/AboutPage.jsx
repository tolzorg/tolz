import { Link } from "react-router-dom";
import { TOOLS } from "../utils/tools";
import SEO from "../components/SEO";

const Highlight = ({ icon, label, description }) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      padding: "18px 20px",
      background: "var(--bg-white)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      marginBottom: 12,
    }}
  >
    <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{icon}</div>
    <div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--text-primary)",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  </div>
);

const h2Style = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 20,
  color: "var(--text-primary)",
  letterSpacing: "-0.015em",
  marginBottom: 16,
};
const pStyle = { fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 12 };
const ulStyle = { ...pStyle, paddingLeft: 20 };

export default function AboutPage() {
  const liveCount = TOOLS.filter((t) => t.available).length;

  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="About Tolz"
        description="Learn about Tolz — a free collection of online tools for images, PDFs, health calculations and more. No signup, no watermarks, always free."
        path="/about"
      />
      <div className="container" style={{ maxWidth: 760, padding: "48px 24px 80px" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: 13,
            fontFamily: "var(--font-body)",
            marginBottom: 36,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ← Back to Home
        </Link>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #ff5a5f, #ff8c69)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                fontFamily: "var(--font-display)",
                flexShrink: 0,
              }}
            >
              T
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 34,
                color: "var(--text-primary)",
                letterSpacing: "-0.025em",
              }}
            >
              About Tolz
            </h1>
          </div>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: 600,
            }}
          >
            Welcome to <Link to="/" className="inline-home-link">Tolz</Link>, your go-to destination
            for free, fast, and reliable online tools. We built <Link to="/" className="inline-home-link">Tolz</Link> around
            a simple idea: everyday digital tasks shouldn't require expensive software, complicated
            installations, or technical expertise. Whether you need to resize an image, convert a
            file, calculate a number, or generate content, <Link to="/" className="inline-home-link">Tolz</Link> gives
            you a straightforward way to get it done, right in your browser.
          </p>
        </div>

        {/* Who We Are */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>Who We Are</h2>
          <p style={pStyle}>
            Tolz is a web-based platform offering a wide collection of online utilities designed for
            students, professionals, freelancers, developers, and everyday internet users. Our toolkit
            spans multiple categories, including:
          </p>
          <ul style={{ ...ulStyle, marginBottom: 12 }}>
            <li style={{ marginBottom: 6 }}><strong>Image Tools</strong> – compress, resize, convert, and edit images</li>
            <li style={{ marginBottom: 6 }}><strong>Calculators</strong> – handle everyday math, finance, and health calculations</li>
            <li style={{ marginBottom: 6 }}><strong>Converters</strong> – switch between file formats, units, and measurements</li>
            <li style={{ marginBottom: 6 }}><strong>Generators</strong> – create passwords, QR codes, text, and more</li>
            <li style={{ marginBottom: 6 }}><strong>Text Tools</strong> – format, analyze, and transform written content</li>
            <li style={{ marginBottom: 6 }}><strong>Developer Tools</strong> – simplify coding, testing, and formatting tasks</li>
            <li style={{ marginBottom: 6 }}><strong>PDF Tools</strong> – merge, split, compress, and convert PDF files</li>
            <li>And many more – with new tools added regularly</li>
          </ul>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            We designed Tolz to be a single, dependable hub where people can find the tools they need
            without jumping between multiple websites or downloading unnecessary software.
          </p>
        </section>

        {/* Our Mission */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>Our Mission</h2>
          <p style={pStyle}>
            Our mission is simple: make everyday digital tasks easier for everyone, everywhere.
          </p>
          <p style={pStyle}>
            We believe that useful tools shouldn't come with a price tag, a login wall, or a steep
            learning curve. That's why every tool on Tolz is built to be:
          </p>
          <Highlight
            icon="🆓"
            label="Free to Use"
            description="All tools on Tolz are completely free. There are no hidden fees, subscription plans, or premium tiers required to access core features. We want anyone, anywhere in the world, to be able to use our tools without financial barriers."
          />
          <Highlight
            icon="⚡"
            label="Fast and Efficient"
            description="Speed matters. Our tools are optimized to process your files and requests quickly, so you can complete your tasks without unnecessary waiting or delays."
          />
          <Highlight
            icon="✨"
            label="Simple and User-Friendly"
            description="We design every tool with clarity in mind. You shouldn't need a manual to figure out how to compress an image or convert a file. Our clean, intuitive interfaces are built for users of all technical backgrounds, from complete beginners to experienced professionals."
          />
          <Highlight
            icon="🔒"
            label="Secure and Privacy-Conscious"
            description="We understand that your files and data matter to you. Tolz is built with user privacy and security in mind, and we work to ensure that your information is handled responsibly whenever you use our tools."
          />
          <Highlight
            icon="🌍"
            label="Accessible Anywhere"
            description="Because Tolz runs directly in your web browser, there's nothing to download or install. Our tools work across devices and operating systems, so you can access them from your desktop, laptop, tablet, or smartphone whenever you need them."
          />
        </section>

        {/* Tool count */}
        <div
          style={{
            background: "var(--accent-light)",
            border: "1px solid var(--border-focus)",
            borderRadius: "var(--radius-xl)",
            padding: "24px 28px",
            marginBottom: 48,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 32,
              color: "var(--accent)",
              marginBottom: 4,
            }}
          >
            {liveCount} tools
          </p>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            and counting. New tools are added regularly — all free, all no-signup.
          </p>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ display: "inline-flex", marginTop: 16, textDecoration: "none" }}
          >
            Browse all tools →
          </Link>
        </div>

        {/* Why We Built Tolz */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>Why We Built Tolz</h2>
          <p style={pStyle}>
            The idea behind Tolz came from a common frustration: needing a quick tool for a simple
            task, only to find that it required downloading software, creating an account, or paying
            for a subscription, just to use it once. We wanted to change that experience.
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Tolz was created to bring together the most commonly needed online utilities in one clean,
            organized platform. Instead of searching multiple websites for a converter here and a
            calculator there, users can find what they need on Tolz and move on with their day.
          </p>
        </section>

        {/* What Makes Tolz Different */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>What Makes Tolz Different</h2>
          <Highlight
            icon="📚"
            label="A Growing Library of Tools"
            description="We continuously expand our collection based on user needs and emerging trends. Our goal is to make Tolz a comprehensive resource that keeps pace with what people actually need in their daily digital lives."
          />
          <Highlight
            icon="👥"
            label="Built for Everyone"
            description="Tolz isn't designed for a single type of user. Students use our calculators and converters for schoolwork. Professionals rely on our PDF and document tools for daily tasks. Developers use our coding utilities to save time. Content creators turn to our text and image tools to streamline their workflow. No matter who you are, there's likely a tool on Tolz that fits your needs."
          />
          <Highlight
            icon="🚫"
            label="No Unnecessary Barriers"
            description="We keep the experience simple. There are no mandatory sign-ups, no complicated steps, and no confusing interfaces standing between you and the result you're looking for."
          />
          <Highlight
            icon="🌐"
            label="Global Reach"
            description="Tolz serves a global audience. Our tools are built to be useful regardless of where you are or what device you're using, making digital tasks more accessible to people around the world."
          />
        </section>

        {/* Our Commitment to Quality */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>Our Commitment to Quality</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Every tool on Tolz goes through careful development to ensure it works reliably and
            delivers accurate results. We regularly review and update our tools to maintain
            performance, fix issues, and improve the overall user experience. Your feedback plays an
            important role in this process, helping us identify what's working well and where we can
            do better.
          </p>
        </section>

        {/* Looking Ahead */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>Looking Ahead</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Tolz is an evolving platform. As technology changes and new needs arise, we remain
            committed to expanding our toolset, refining existing features, and staying true to our
            core values of accessibility, simplicity, and reliability. We're not just building a
            website, we're building a resource that people can return to, time and again, whenever
            they need a quick and dependable solution.
          </p>
        </section>

        {/* Thank You */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>Thank You for Choosing Tolz</h2>
          <p style={pStyle}>
            We're grateful that you've chosen Tolz for your online tool needs. Whether you're here for
            a one-time task or you've made us part of your regular workflow, our goal is to make your
            experience as smooth and helpful as possible. We'll keep working to bring you the tools you
            need, built the way they should be: free, fast, simple, and secure.
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            If you have suggestions, feedback, or ideas for new tools, we'd love to hear from you. Tolz
            exists because of users like you, and your input helps shape the platform we continue to
            build.
          </p>
        </section>

        {/* Tech stack note */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={h2Style}>
            How it works
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 12 }}>
            Tolz is a full-stack web app with a React frontend and a Node.js/Express backend.
            Processing tools (PDF compress, image convert, OCR) run server-side for performance.
            Pure-calculation tools (unit converter, calorie tracker, sleep calculator, color
            picker) run entirely in your browser — no server call, no data transmitted at all.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)" }}>
            The service is hosted on{" "}
            <a
              href="https://render.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Render
            </a>
            {" "}with automatic TLS, global CDN for static assets, and graceful handling of
            failures so a bad upload never crashes the server.
          </p>
        </section>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link to="/contact" style={{ color: "var(--accent)", fontSize: 13 }}>
            Contact us →
          </Link>
          <Link to="/privacy" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Privacy Policy
          </Link>
          <Link to="/terms" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Terms and Conditions
          </Link>
          <Link to="/disclaimer" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Disclaimer
          </Link>
          <Link to="/copyright" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Copyright Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
