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
            Tolz is a free collection of everyday utility tools — built for people who want
            fast, reliable tools without accounts, paywalls, or watermarks.
          </p>
        </div>

        {/* Values */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--text-primary)",
              letterSpacing: "-0.015em",
              marginBottom: 16,
            }}
          >
            Our principles
          </h2>
          <Highlight
            icon="🔒"
            label="Privacy first"
            description="Files you upload are processed in memory and never stored, shared, or retained after your request completes."
          />
          <Highlight
            icon="⚡"
            label="No friction"
            description={`No signup, no email verification, no subscription. Just open a tool and use it.`}
          />
          <Highlight
            icon="🆓"
            label="Free forever"
            description="All tools are free with no hidden limits, no watermarks, and no bait-and-switch upgrades."
          />
          <Highlight
            icon="🌍"
            label="Built for everyone"
            description="Tools are designed to be intuitive enough for non-technical users and fast enough for power users."
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

        {/* Tech stack note */}
        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--text-primary)",
              letterSpacing: "-0.015em",
              marginBottom: 12,
            }}
          >
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
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
