import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 32 }}>
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 18,
        color: "var(--text-primary)",
        letterSpacing: "-0.015em",
        marginBottom: 12,
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

const P = ({ children }) => (
  <p style={{ marginBottom: 12, fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)" }}>
    {children}
  </p>
);

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="Privacy Policy"
        description="Tolz Privacy Policy — we don't store your files. Files are processed in server memory and never retained after your request."
        path="/privacy"
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

        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--text-primary)",
              letterSpacing: "-0.025em",
              marginBottom: 10,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>
            Last updated: June 14, 2026
          </p>
        </div>

        <div>
          <Section title="Overview">
            <P>
              Tolz is a collection of free, browser-based tools. We are committed to your privacy.
              The short version: we do not store the files you upload, we do not sell your data, and
              we do not require an account of any kind.
            </P>
          </Section>

          <Section title="Files You Upload">
            <P>
              Files uploaded to Tolz tools (PDFs, images, etc.) are processed entirely in server
              memory and are never written to disk, stored in a database, or retained after your
              request completes. Once the server sends back the processed result, your file data is
              discarded.
            </P>
            <P>
              We do not read, analyze, copy, share, or monetize the content of your files in any
              way. Processing happens solely to fulfill the tool operation you requested.
            </P>
          </Section>

          <Section title="URL Shortener">
            <P>
              When you create a short link, Tolz stores the slug-to-URL mapping so that redirect
              requests can be served. This mapping includes the destination URL, creation
              timestamp, optional expiry time, and a click counter. No personally identifiable
              information is stored alongside the link.
            </P>
            <P>
              Short links may be deleted automatically when they expire (if an expiry was set) or
              when the server is restarted (links without Redis persistence) or after extended
              inactivity. Do not rely on Tolz short links for critical long-term use.
            </P>
          </Section>

          <Section title="Server Logs">
            <P>
              Our hosting provider (Render) may automatically capture standard web server logs,
              which can include IP addresses, request timestamps, HTTP method, path, and response
              codes. These logs are used solely for debugging and security monitoring and are
              subject to Render's own data retention policies.
            </P>
          </Section>

          <Section title="Cookies and Local Storage">
            <P>
              Tolz does not set any tracking cookies. Some tools may save your preferences (such
              as unit types or color history) in your browser's <code>localStorage</code> so your
              session persists across page refreshes. This data never leaves your device.
            </P>
          </Section>

          <Section title="Third-Party Services">
            <P>
              Tolz loads fonts (Plus Jakarta Sans, Manrope) from Google Fonts. When your browser
              fetches these fonts, Google may log the request per their own privacy policy. No
              other third-party analytics, tracking pixels, or advertising scripts are loaded.
            </P>
            <P>
              Our infrastructure is hosted on{" "}
              <a
                href="https://render.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                Render
              </a>
              . Render may process certain request data as part of operating the platform.
            </P>
          </Section>

          <Section title="Children's Privacy">
            <P>
              Tolz is not directed at children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided personal data through
              our service, please contact us and we will delete it promptly.
            </P>
          </Section>

          <Section title="Your Rights (GDPR / CCPA)">
            <P>
              Because Tolz does not store personal data from file uploads, most GDPR and CCPA
              data-subject rights (access, deletion, portability) are satisfied by design — there
              is simply no data to access or delete after your request completes.
            </P>
            <P>
              For any residual data held in server logs (managed by Render) or URL shortener
              entries, you may contact us at the email below to request deletion.
            </P>
          </Section>

          <Section title="Changes to This Policy">
            <P>
              We may update this policy from time to time. The "Last updated" date at the top of
              this page will reflect any changes. Continued use of Tolz after changes are posted
              constitutes acceptance of the revised policy.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Questions about this privacy policy? Reach us at{" "}
              <a
                href="mailto:privacy@tolz.org"
                style={{ color: "var(--accent)" }}
              >
                privacy@tolz.org
              </a>
              .
            </P>
          </Section>
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
          <Link to="/terms" style={{ color: "var(--accent)", fontSize: 13 }}>
            Terms of Service →
          </Link>
          <Link to="/about" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            About Tolz
          </Link>
        </div>
      </div>
    </div>
  );
}
