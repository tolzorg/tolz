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

const SubHeading = ({ children }) => (
  <p
    style={{
      marginBottom: 8,
      fontSize: 15,
      fontWeight: 700,
      fontFamily: "var(--font-display)",
      color: "var(--text-primary)",
    }}
  >
    {children}
  </p>
);

const UL = ({ children }) => (
  <ul style={{ marginBottom: 12, paddingLeft: 20, fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)" }}>
    {children}
  </ul>
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
            Last updated: July 2026
          </p>
        </div>

        <div>
          <Section title="Overview">
            <P>
              Welcome to <Link to="/" className="inline-home-link">Tolz</Link>. Your privacy matters
              to us, and this Privacy Policy explains how we collect, use, and protect information
              when you visit or use our website at{" "}
              <Link to="/" className="inline-home-link">https://www.tolz.org/</Link> ("
              <Link to="/" className="inline-home-link">Tolz</Link>," "we," "us," or "our").
            </P>
            <P>
              Tolz provides a wide range of free online tools, including image tools, calculators,
              converters, generators, text tools, developer tools, PDF tools, and more. Most of our
              tools are designed to run directly in your browser, which means your files and inputs
              are generally processed without being uploaded to our servers, unless otherwise stated
              for a specific tool. This document explains our overall approach to data collection and
              use across the website.
            </P>
            <P>
              By using Tolz, you agree to the practices described in this Privacy Policy. If you do
              not agree with any part of this policy, please discontinue use of our website.
            </P>
          </Section>

          <Section title="1. Information We Collect">
            <P>
              We aim to collect as little personal information as possible while still being able to
              operate and improve Tolz effectively.
            </P>
            <SubHeading>1.1 Information You Provide Directly</SubHeading>
            <P>In some cases, you may voluntarily provide information to us, such as:</P>
            <UL>
              <li>Your name and email address when contacting us through a contact form</li>
              <li>Feedback, suggestions, or bug reports you submit</li>
              <li>
                Any content you choose to enter into our tools for processing (most of which stays in
                your browser and is not transmitted to us)
              </li>
            </UL>
            <SubHeading>1.2 Automatically Collected Information</SubHeading>
            <P>
              Like most websites, Tolz may automatically collect certain technical information when
              you visit, including:
            </P>
            <UL>
              <li>IP address and approximate location</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited, time spent on the site, and referring URLs</li>
              <li>General usage patterns and interaction data</li>
            </UL>
            <P>
              This information is typically collected in aggregated or anonymized form and is used to
              understand how our website is used and to improve performance.
            </P>
            <SubHeading>1.3 Cookies and Similar Technologies</SubHeading>
            <P>
              Tolz may use cookies, local storage, and similar tracking technologies to enhance your
              browsing experience, remember preferences, and analyze site traffic. For more details,
              please refer to our separate Cookie Policy page.
            </P>
          </Section>

          <Section title="2. How We Use Your Information">
            <P>We may use the information we collect for purposes such as:</P>
            <UL>
              <li>Operating, maintaining, and improving the tools and features available on Tolz</li>
              <li>Understanding usage trends to guide future development</li>
              <li>Responding to inquiries, feedback, or support requests</li>
              <li>Monitoring for security issues, abuse, or technical problems</li>
              <li>Complying with applicable legal obligations</li>
            </UL>
            <P>We do not sell your personal information to third parties.</P>
          </Section>

          <Section title="3. How Our Tools Handle Your Data">
            <P>
              Many of the tools on Tolz, including image editors, converters, calculators, and
              generators, are built to process data locally within your browser. This means that
              files or text you input into these tools are generally not sent to or stored on our
              servers.
            </P>
            <P>
              However, some tools may require server-side processing to function properly. Where this
              is the case, we aim to:
            </P>
            <UL>
              <li>Process data only for the purpose of delivering the requested tool functionality</li>
              <li>Avoid retaining uploaded files or inputs longer than necessary</li>
              <li>Delete temporary files automatically after processing, where technically applicable</li>
            </UL>
            <P>
              If you have concerns about a specific tool's data handling, we encourage you to review
              any tool-specific notices or contact us directly for clarification.
            </P>
          </Section>

          <Section title="4. Sharing of Information">
            <P>We may share information in limited circumstances, such as:</P>
            <SubHeading>4.1 Service Providers</SubHeading>
            <P>
              We may work with third-party service providers (such as hosting providers or analytics
              tools) who help us operate Tolz. These providers only access information necessary to
              perform their functions and are expected to handle it responsibly.
            </P>
            <SubHeading>4.2 Legal Requirements</SubHeading>
            <P>
              We may disclose information if required by law, regulation, legal process, or
              governmental request, or to protect the rights, property, or safety of Tolz, our users,
              or the public.
            </P>
            <SubHeading>4.3 Business Transfers</SubHeading>
            <P>
              If Tolz undergoes a merger, acquisition, or sale of assets, user information may be
              transferred as part of that transaction, subject to standard confidentiality practices.
            </P>
          </Section>

          <Section title="5. Third-Party Advertising and Analytics">
            <P>
              Tolz may use third-party advertising and analytics services to support the operation of
              the website. These providers may use cookies or similar technologies to collect
              information about your visits to Tolz and other websites, in order to provide relevant
              advertising and measure site performance. We do not control the practices of these
              third parties, and we encourage you to review their respective privacy policies for
              more information.
            </P>
          </Section>

          <Section title="6. Data Security">
            <P>
              We take reasonable technical and organizational measures to help protect information
              from unauthorized access, alteration, or disclosure. However, no method of transmission
              or storage over the internet is completely secure, and we cannot guarantee absolute
              security of any information you share with us.
            </P>
          </Section>

          <Section title="7. Children's Privacy">
            <P>
              Tolz is not directed at children under the age of 13, and we do not knowingly collect
              personal information from children. If you believe a child has provided us with
              personal information, please contact us so we can take appropriate action.
            </P>
          </Section>

          <Section title="8. Your Choices and Rights">
            <P>
              Depending on your location, you may have certain rights regarding your personal
              information, such as the right to access, correct, or request deletion of your data.
              You may also be able to manage cookie preferences through your browser settings.
            </P>
          </Section>

          <Section title="9. International Users">
            <P>
              Tolz is accessible to users worldwide. By using our website, you understand that your
              information may be processed in countries other than your own, which may have different
              data protection laws than your home country.
            </P>
          </Section>

          <Section title="10. Changes to This Privacy Policy">
            <P>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technology, legal requirements, or other factors. Any updates will be posted
              on this page with a revised "Last updated" date. We encourage you to review this page
              periodically.
            </P>
          </Section>

          <Section title="11. Contact Us">
            <P>
              If you have any questions, concerns, or requests related to this Privacy Policy or how
              Tolz handles your information, please contact us through the details provided on our
              website at{" "}
              <a
                href="https://www.tolz.org/"
                style={{ color: "var(--accent)" }}
              >
                https://www.tolz.org/
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
            Terms and Conditions →
          </Link>
          <Link to="/disclaimer" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Disclaimer
          </Link>
          <Link to="/copyright" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Copyright Policy
          </Link>
          <Link to="/about" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            About Tolz
          </Link>
        </div>
      </div>
    </div>
  );
}
