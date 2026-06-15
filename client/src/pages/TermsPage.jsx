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

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="Terms of Service"
        description="Terms of Service for Tolz — free online tools. No account required, fair use policy, no warranties."
        path="/terms"
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
            Terms of Service
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>
            Last updated: June 14, 2026
          </p>
        </div>

        <div>
          <Section title="Acceptance of Terms">
            <P>
              By using Tolz ("the Service"), you agree to these Terms of Service. If you do not
              agree, please do not use the Service. These terms may be updated at any time; your
              continued use after changes are posted constitutes acceptance.
            </P>
          </Section>

          <Section title="Description of Service">
            <P>
              Tolz provides free, browser-based utility tools including image compression, PDF
              processing, unit conversion, URL shortening, QR code generation, and health
              calculators. All tools are provided free of charge and without requiring account
              registration.
            </P>
          </Section>

          <Section title="Acceptable Use">
            <P>You agree not to use the Service to:</P>
            <ul
              style={{
                paddingLeft: 20,
                marginBottom: 12,
                fontSize: 15,
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              <li style={{ marginBottom: 6 }}>
                Upload, process, or distribute content that is illegal, infringing, or harmful
              </li>
              <li style={{ marginBottom: 6 }}>
                Attempt to reverse-engineer, scrape, or overload the Service
              </li>
              <li style={{ marginBottom: 6 }}>
                Use the URL shortener to distribute malware, phishing links, or spam
              </li>
              <li style={{ marginBottom: 6 }}>
                Circumvent rate limits or other protective measures
              </li>
              <li style={{ marginBottom: 6 }}>
                Use the Service in any way that violates applicable laws or regulations
              </li>
            </ul>
            <P>
              We reserve the right to block access without notice for violations of these terms.
            </P>
          </Section>

          <Section title="Your Content">
            <P>
              You retain all rights to the files and content you upload. By using the Service,
              you grant Tolz a temporary, limited license to process your content solely to
              perform the requested tool operation. This license ends when the operation is
              complete and your content has been returned to you.
            </P>
            <P>
              You represent that you have the right to upload the content and that it does not
              violate any third-party rights or applicable law.
            </P>
          </Section>

          <Section title="No Warranty">
            <P>
              The Service is provided "as is" and "as available" without warranties of any kind,
              express or implied. We do not warrant that the Service will be uninterrupted,
              error-free, or produce results of any particular accuracy or quality.
            </P>
            <P>
              Tool outputs (compressed files, converted documents, calculated results) should be
              verified by you before relying on them for critical purposes. Always keep backups
              of your original files.
            </P>
          </Section>

          <Section title="Limitation of Liability">
            <P>
              To the maximum extent permitted by law, Tolz and its operators shall not be liable
              for any indirect, incidental, special, or consequential damages arising from your
              use of or inability to use the Service, including loss of data, profits, or
              goodwill.
            </P>
            <P>
              Our total liability for any claim arising out of these terms or your use of the
              Service shall not exceed USD $0, reflecting that the Service is provided entirely
              free of charge.
            </P>
          </Section>

          <Section title="URL Shortener Terms">
            <P>
              Short links created through the URL shortener are temporary. Links may be deleted
              when the server restarts, when their expiry time passes, or at our discretion. Do
              not use Tolz short links for critical or permanent use cases.
            </P>
            <P>
              You may not use the URL shortener to redirect to illegal content, malware,
              phishing pages, or other harmful destinations. We reserve the right to disable any
              short link at any time without notice.
            </P>
          </Section>

          <Section title="Service Availability">
            <P>
              We make no guarantees about uptime or availability. The Service may be modified,
              suspended, or discontinued at any time without notice. We are under no obligation
              to maintain any particular feature or tool.
            </P>
          </Section>

          <Section title="Governing Law">
            <P>
              These terms are governed by applicable law. Any disputes shall be resolved through
              binding arbitration or, where not enforceable, in a court of competent jurisdiction.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:legal@tolz.com"
                style={{ color: "var(--accent)" }}
              >
                legal@tolz.com
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
          <Link to="/privacy" style={{ color: "var(--accent)", fontSize: 13 }}>
            Privacy Policy →
          </Link>
          <Link to="/about" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            About Tolz
          </Link>
        </div>
      </div>
    </div>
  );
}
