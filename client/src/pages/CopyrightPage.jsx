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

export default function CopyrightPage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="Copyright Policy"
        description="Copyright Policy for Tolz — ownership of website content, user-generated content, acceptable use, and how to file a copyright infringement claim."
        path="/copyright"
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
            Copyright Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>
            Last Updated: July 22, 2026
          </p>
        </div>

        <div>
          <Section title="Overview">
            <P>
              Welcome to <Link to="/" className="inline-home-link">Tolz</Link>. This Copyright
              Policy explains how we handle intellectual property rights in connection with the
              tools, content, and materials available on our website. By using{" "}
              <Link to="/" className="inline-home-link">Tolz</Link>, you agree to respect the
              copyright terms outlined below.
            </P>
          </Section>

          <Section title="1. Overview">
            <P>
              Tolz (accessible at <Link to="/" className="inline-home-link">https://www.tolz.org/</Link>) is a free online platform offering a wide
              range of web-based tools, including image tools, calculators, converters, generators,
              text tools, developer tools, PDF tools, and other browser-based utilities. All tools
              are designed to run directly in your browser, without requiring downloads or
              installations.
            </P>
            <P>
              This policy outlines the ownership of content on Tolz, acceptable use of our tools and
              materials, and how we address copyright concerns raised by third parties.
            </P>
          </Section>

          <Section title="2. Ownership of Website Content">
            <SubHeading>2.1 Original Content</SubHeading>
            <P>
              All original content published on Tolz, including but not limited to the website
              design, layout, logo, graphics, tool interfaces, source code, written text, tutorials,
              and branding elements, is owned by Tolz or its licensors, unless otherwise stated. This
              content is protected under applicable copyright and intellectual property laws.
            </P>
            <SubHeading>2.2 Tools and Functionality</SubHeading>
            <P>
              The tools available on Tolz are provided for personal, educational, and professional
              use. While the tools themselves are free to use, the underlying code, design, and
              structure that power them remain the intellectual property of Tolz and may not be
              copied, reverse-engineered, or redistributed without permission.
            </P>
            <SubHeading>2.3 Third-Party Content</SubHeading>
            <P>
              In some cases, Tolz may incorporate open-source libraries, fonts, icons, or other
              third-party resources. Where applicable, such materials are used in accordance with
              their respective licenses, and ownership of those specific elements remains with their
              original creators or licensors.
            </P>
          </Section>

          <Section title="3. User-Generated Content">
            <SubHeading>3.1 Files You Process</SubHeading>
            <P>
              Many tools on Tolz allow users to upload, convert, edit, or generate files such as
              images, PDFs, or text documents. Tolz does not claim ownership over any files, data, or
              content that users upload or create using our tools. You retain full responsibility and
              ownership of the material you process through our platform.
            </P>
            <SubHeading>3.2 Your Responsibility</SubHeading>
            <P>
              By using Tolz, you confirm that you have the legal right to use, upload, or process any
              content through our tools. You agree not to use Tolz to create, convert, or distribute
              material that infringes on the copyright, trademark, or intellectual property rights of
              any third party.
            </P>
          </Section>

          <Section title="4. Acceptable Use of Tolz Content">
            <P>
              You may use Tolz tools and publicly available content for personal or business
              purposes, subject to the following conditions:
            </P>
            <SubHeading>4.1 What Is Permitted</SubHeading>
            <UL>
              <li>Using our tools for personal, educational, or commercial tasks.</li>
              <li>Sharing links to Tolz pages or tools with proper attribution.</li>
              <li>Referencing Tolz as a resource in articles, blogs, or educational materials.</li>
            </UL>
            <SubHeading>4.2 What Is Not Permitted</SubHeading>
            <UL>
              <li>Copying, cloning, or reproducing the Tolz website, design, or source code.</li>
              <li>Reselling, redistributing, or repackaging our tools as your own product.</li>
              <li>
                Using automated systems (such as bots or scrapers) to extract or replicate our
                content without authorization.
              </li>
              <li>Removing copyright notices, watermarks, or attribution from Tolz materials.</li>
            </UL>
          </Section>

          <Section title="5. Copyright Infringement Claims">
            <P>
              Tolz respects the intellectual property rights of others and expects users of our
              platform to do the same. If you believe that content available on Tolz infringes upon
              your copyright, we encourage you to notify us so we can review and address the matter
              appropriately.
            </P>
            <SubHeading>5.1 Filing a Copyright Complaint</SubHeading>
            <P>If you wish to submit a copyright infringement notice, please provide the following information:</P>
            <UL>
              <li>A description of the copyrighted work you believe has been infringed.</li>
              <li>The specific URL or location on Tolz where the material appears.</li>
              <li>Your contact information, including name and email address.</li>
              <li>A statement confirming your good-faith belief that the use is unauthorized.</li>
              <li>
                A statement, made under penalty of perjury, that the information provided is
                accurate and that you are authorized to act on behalf of the copyright owner.
              </li>
            </UL>
            <SubHeading>5.2 Our Review Process</SubHeading>
            <P>
              Upon receiving a valid copyright complaint, Tolz will review the claim and take
              appropriate action, which may include removing or restricting access to the reported
              content, where warranted. We aim to handle all such requests fairly and in a timely
              manner.
            </P>
            <SubHeading>5.3 Counter-Notification</SubHeading>
            <P>
              If you believe that content was removed in error or as a result of misidentification,
              you may submit a counter-notification with sufficient detail for us to review the
              situation. Tolz will assess such requests on a case-by-case basis.
            </P>
          </Section>

          <Section title="6. Trademarks">
            <P>
              The name "Tolz," along with associated logos and branding, may be protected as
              trademarks. Any use of these marks without prior written permission is not authorized.
              All other trademarks, product names, or company names mentioned on Tolz belong to their
              respective owners and are used for identification purposes only.
            </P>
          </Section>

          <Section title="7. Licensing and Permissions">
            <P>
              If you are interested in using Tolz content, tools, or materials beyond the scope of
              normal personal or business use, for example, for republishing, integration into
              another platform, or commercial licensing, please reach out to us in advance to discuss
              permissions. Unauthorized use beyond the scope described in this policy may result in
              access restrictions or other appropriate action.
            </P>
          </Section>

          <Section title="8. Changes to This Copyright Policy">
            <P>
              Tolz may update this Copyright Policy from time to time to reflect changes in our
              practices, legal requirements, or platform features. Any updates will be posted on this
              page with a revised "Last Updated" date. We encourage users to review this page
              periodically to stay informed.
            </P>
          </Section>

          <Section title="9. Contact Us">
            <P>
              If you have questions about this Copyright Policy, wish to report a concern, or want to
              request permission for content use, please visit our website at{" "}
              <Link to="/" className="inline-home-link">https://www.tolz.org/</Link>
              {" "}for the latest contact details and support options.
            </P>
          </Section>

          <Section title="Conclusion">
            <P>
              Tolz is committed to respecting intellectual property rights while providing a free,
              accessible, and reliable set of online tools for users around the world. This
              Copyright Policy is designed to protect both our original content and the rights of
              third parties, ensuring a fair and trustworthy experience for everyone who uses our
              platform. We appreciate your cooperation in helping us maintain a respectful and
              legally compliant environment on Tolz.
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
          <Link to="/terms" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Terms and Conditions
          </Link>
          <Link to="/disclaimer" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Disclaimer
          </Link>
          <Link to="/about" style={{ color: "var(--text-muted)", fontSize: 13 }}>
            About Tolz
          </Link>
        </div>
      </div>
    </div>
  );
}
