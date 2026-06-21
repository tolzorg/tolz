import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const ContactCard = ({ icon, title, description, action, actionLabel }) => (
  <div
    style={{
      background: "var(--bg-white)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      padding: "24px 28px",
      marginBottom: 16,
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div
        style={{
          width: 40,
          height: 40,
          background: "var(--accent-light)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
          {description}
        </p>
        {action && (
          <a
            href={action}
            target={action.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--accent)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-display)",
            }}
          >
            {actionLabel} →
          </a>
        )}
      </div>
    </div>
  </div>
);

export default function ContactPage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="Contact"
        description="Contact the Tolz team for bug reports, feature requests, general questions or legal inquiries. We're here to help."
        path="/contact"
      />
      <div className="container" style={{ maxWidth: 680, padding: "48px 24px 80px" }}>
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

        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--text-primary)",
              letterSpacing: "-0.025em",
              marginBottom: 12,
            }}
          >
            Contact
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.65 }}>
            Have a question, spotted a bug, or want to suggest a new tool? We'd love to hear
            from you.
          </p>
        </div>

        <ContactCard
          icon="🐛"
          title="Bug Reports & Feature Requests"
          description="Found something broken or have an idea for a new tool? Open an issue on GitHub — it's the fastest way to get a response."
          action="https://github.com"
          actionLabel="Open an issue on GitHub"
        />

        <ContactCard
          icon="✉️"
          title="General Enquiries"
          description="For anything else — partnerships, press, or general questions — drop us an email."
          action="mailto:hello@tolz.org"
          actionLabel="hello@tolz.org"
        />

        <ContactCard
          icon="⚖️"
          title="Legal & Privacy"
          description="Privacy questions, GDPR requests, or terms concerns? Use the dedicated legal inbox."
          action="mailto:legal@tolz.org"
          actionLabel="legal@tolz.org"
        />

        <div
          style={{
            background: "var(--bg-muted)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 22px",
            marginTop: 28,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text-secondary)" }}>Note on file data:</strong>{" "}
            Files you process through Tolz tools are never stored. If you have a question
            about a specific file conversion result, please re-upload the file and try again —
            we don't have access to past uploads.
          </p>
        </div>

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
          <Link to="/about" style={{ color: "var(--accent)", fontSize: 13 }}>
            About Tolz →
          </Link>
          <Link to="/privacy" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
