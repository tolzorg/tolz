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

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="Terms and Conditions"
        description="Terms and Conditions for Tolz — free online tools. No account required, fair use policy, no warranties."
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
            Terms and Conditions
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>
            Last Updated: July 22, 2026
          </p>
        </div>

        <div>
          <Section title="Overview">
            <P>
              Welcome to <Link to="/" className="inline-home-link">Tolz</Link>. These Terms &
              Conditions ("Terms") govern your access to and use of the website located at{" "}
              <Link to="/" className="inline-home-link">https://www.tolz.org/</Link> (the "Website," "
              <Link to="/" className="inline-home-link">Tolz</Link>," "we," "us," or "our"),
              including all tools, features, and content offered through it (collectively, the
              "Services").
            </P>
            <P>
              By accessing or using Tolz, you agree to be bound by these Terms. If you do not agree
              with any part of these Terms, please discontinue use of the Website immediately.
            </P>
          </Section>

          <Section title="1. About Tolz">
            <P>
              Tolz is a free online platform offering a wide variety of web-based utilities,
              including image tools, calculators, converters, generators, text tools, developer
              tools, PDF tools, and other browser-based utilities. Our goal is to provide fast,
              simple, and user-friendly tools that work directly in your browser without requiring
              any software installation or account registration.
            </P>
          </Section>

          <Section title="2. Eligibility and Acceptable Use">
            <SubHeading>2.1 Who Can Use Tolz</SubHeading>
            <P>
              Tolz is intended for general audiences. By using our Services, you confirm that you
              have the legal capacity to enter into these Terms under the laws applicable in your
              jurisdiction.
            </P>
            <SubHeading>2.2 Permitted Use</SubHeading>
            <P>
              You agree to use Tolz only for lawful purposes. You may use our tools for personal,
              educational, or professional purposes, provided such use does not violate these Terms
              or any applicable law.
            </P>
            <SubHeading>2.3 Prohibited Activities</SubHeading>
            <P>While using Tolz, you agree not to:</P>
            <UL>
              <li>Use the Services for any unlawful, fraudulent, or harmful purpose.</li>
              <li>
                Upload or process content that infringes on the intellectual property, privacy, or
                other rights of any third party.
              </li>
              <li>
                Attempt to interfere with, disrupt, or compromise the security or functionality of
                the Website.
              </li>
              <li>
                Use automated systems (bots, scrapers, or crawlers) to access the Services in a
                manner that imposes an unreasonable load on our infrastructure.
              </li>
              <li>
                Reverse engineer, decompile, or attempt to extract the source code of any tool or
                feature on the Website.
              </li>
              <li>
                Use Tolz to generate, distribute, or process illegal, defamatory, obscene, or
                otherwise objectionable content.
              </li>
            </UL>
            <P>
              We reserve the right to restrict or terminate access to the Services for any user who
              violates these provisions.
            </P>
          </Section>

          <Section title="3. User-Submitted Content">
            <SubHeading>3.1 Ownership</SubHeading>
            <P>
              Any files, text, images, or data you upload or input into our tools ("User Content")
              remain your property. Tolz does not claim ownership over your User Content.
            </P>
            <SubHeading>3.2 Responsibility</SubHeading>
            <P>
              You are solely responsible for the legality, accuracy, and appropriateness of any User
              Content you process through our tools. You must ensure you have the necessary rights or
              permissions to use and upload such content.
            </P>
            <SubHeading>3.3 Processing of Content</SubHeading>
            <P>
              Many of our tools are designed to process files or data directly within your browser.
              Where server-side processing is required, we aim to handle such content only as needed
              to deliver the requested function, in accordance with our{" "}
              <Link to="/privacy" className="inline-home-link">Privacy Policy</Link>.
            </P>
          </Section>

          <Section title="4. Intellectual Property Rights">
            <SubHeading>4.1 Ownership of the Website</SubHeading>
            <P>
              All content, design elements, logos, graphics, source code, and branding associated
              with Tolz are the property of Tolz or its licensors and are protected under applicable
              intellectual property laws.
            </P>
            <SubHeading>4.2 Limited License</SubHeading>
            <P>
              We grant you a limited, non-exclusive, non-transferable license to access and use the
              Services for personal or internal business purposes, subject to compliance with these
              Terms. This license does not permit you to copy, modify, distribute, sell, or lease any
              part of our Services or included software.
            </P>
          </Section>

          <Section title="5. Third-Party Links and Services">
            <P>
              Tolz may contain links to third-party websites or services that are not owned or
              controlled by us. We do not endorse and are not responsible for the content, privacy
              practices, or accuracy of any third-party sites. Accessing such links is done at your
              own risk.
            </P>
          </Section>

          <Section title="6. No Warranties">
            <SubHeading>6.1 "As Is" Basis</SubHeading>
            <P>
              Tolz and all associated tools are provided on an "as is" and "as available" basis,
              without warranties of any kind, whether express or implied, including but not limited
              to warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </P>
            <SubHeading>6.2 Accuracy of Results</SubHeading>
            <P>
              While we strive to ensure that our tools function accurately and reliably, we do not
              guarantee that results generated by any calculator, converter, generator, or other tool
              will be error-free, complete, or suitable for every specific use case. Users should
              independently verify results, especially for critical, financial, legal, or
              professional decisions.
            </P>
            <SubHeading>6.3 Availability</SubHeading>
            <P>
              We do not guarantee uninterrupted or error-free access to the Website. Tolz may be
              temporarily unavailable due to maintenance, technical issues, or circumstances beyond
              our control.
            </P>
          </Section>

          <Section title="7. Limitation of Liability">
            <P>
              To the fullest extent permitted by applicable law, Tolz and its owners, operators, and
              affiliates shall not be liable for any direct, indirect, incidental, consequential, or
              special damages arising out of or related to your use of, or inability to use, the
              Services. This includes, without limitation, loss of data, loss of profits, or business
              interruption, even if we have been advised of the possibility of such damages.
            </P>
          </Section>

          <Section title="8. Indemnification">
            <P>
              You agree to indemnify and hold harmless Tolz, its owners, and affiliates from any
              claims, damages, losses, or expenses (including reasonable legal fees) arising from
              your use of the Services, your violation of these Terms, or your infringement of any
              third-party rights.
            </P>
          </Section>

          <Section title="9. Changes to the Services and Terms">
            <P>
              We reserve the right to modify, suspend, or discontinue any part of the Services at any
              time without prior notice. We may also revise these Terms periodically to reflect
              changes in our practices or for legal and operational reasons. Updated Terms will be
              posted on this page with a revised "Last Updated" date. Continued use of Tolz after
              such changes constitutes your acceptance of the revised Terms.
            </P>
          </Section>

          <Section title="10. Termination">
            <P>
              We reserve the right to suspend or terminate your access to the Services, without prior
              notice, if we believe you have violated these Terms or engaged in conduct that may harm
              Tolz, other users, or third parties.
            </P>
          </Section>

          <Section title="11. Governing Law">
            <P>
              These Terms shall be governed by and interpreted in accordance with applicable laws,
              without regard to conflict of law principles. Any disputes arising from these Terms or
              your use of the Services shall be resolved through appropriate legal channels
              applicable to your jurisdiction.
            </P>
          </Section>

          <Section title="12. Severability">
            <P>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining
              provisions shall continue in full force and effect.
            </P>
          </Section>

          <Section title="13. Contact Us">
            <P>
              If you have any questions, concerns, or feedback regarding these Terms & Conditions,
              please feel free to reach out to us through the contact details available on our
              website.
            </P>
            <P>
              Website:{" "}
              <a
                href="https://www.tolz.org/"
                style={{ color: "var(--accent)" }}
              >
                https://www.tolz.org/
              </a>
            </P>
          </Section>

          <Section title="Conclusion">
            <P>
              Thank you for choosing Tolz as your trusted destination for free, fast, and
              easy-to-use online tools. These Terms & Conditions are designed to ensure a safe,
              transparent, and reliable experience for everyone who uses our platform. We encourage
              you to review this page periodically, as continued use of Tolz signifies your
              acceptance of any updates. Your trust matters to us, and we remain committed to
              providing quality tools while maintaining fair and clear terms of use for our global
              community.
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
