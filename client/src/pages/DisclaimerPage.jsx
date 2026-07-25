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

export default function DisclaimerPage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="Disclaimer"
        description="Disclaimer for Tolz — free online tools provided as-is for general utility purposes, without professional, financial, legal, or medical advice guarantees."
        path="/disclaimer"
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
            Disclaimer
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>
            Last Updated: July 22, 2026
          </p>
        </div>

        <div>
          <Section title="Overview">
            <P>
              Welcome to <Link to="/" className="inline-home-link">Tolz</Link>. This Disclaimer
              explains the terms under which you may use the tools, content, and services available
              at <Link to="/" className="inline-home-link">https://www.tolz.org/</Link> ("
              <Link to="/" className="inline-home-link">Tolz</Link>," "we," "us," or "our"). By
              accessing or using our website, you acknowledge that you have read, understood, and
              agreed to the terms outlined below. If you do not agree with any part of this
              Disclaimer, please discontinue use of the website.
            </P>
          </Section>

          <Section title="General Information">
            <P>
              Tolz provides a free collection of online tools, including image tools, calculators,
              converters, generators, text tools, developer tools, PDF tools, and other browser-based
              utilities. These tools are designed to help users perform quick, simple tasks directly
              through their web browser without the need for software downloads or installations.
            </P>
            <P>
              The information and tools provided on this website are intended for general
              informational and utility purposes only. While we strive to keep all tools functional,
              accurate, and up to date, we make no guarantees regarding their completeness,
              reliability, or suitability for any specific purpose.
            </P>
          </Section>

          <Section title="No Professional Advice">
            <P>
              The tools and content available on Tolz are not a substitute for professional advice.
              Depending on the tool used, this may include but is not limited to financial, legal,
              medical, technical, or business advice.
            </P>
            <SubHeading>Examples of Limitations</SubHeading>
            <UL>
              <li>
                Calculators on Tolz provide estimated results based on the data you input. These
                results should not be treated as certified, audited, or professionally verified
                figures.
              </li>
              <li>
                Converters and Generators are intended for general and practical use and may not meet
                specialized industry, regulatory, or compliance standards.
              </li>
              <li>
                Developer Tools are provided for convenience and testing purposes and should not be
                solely relied upon for production-level or mission-critical applications.
              </li>
              <li>
                PDF and Image Tools process files based on standard formatting rules and may not
                produce identical results in every use case due to variations in file structure,
                software, or device compatibility.
              </li>
            </UL>
            <P>
              Users are encouraged to seek advice from a qualified professional before making any
              decisions based on the output of any tool available on this website.
            </P>
          </Section>

          <Section title="Accuracy and Reliability of Tools">
            <P>
              Although we make reasonable efforts to test and maintain the tools on Tolz, we do not
              warrant that:
            </P>
            <UL>
              <li>The tools will be error-free, uninterrupted, or available at all times.</li>
              <li>The results generated will be 100% accurate for every use case or scenario.</li>
              <li>The tools will be compatible with every browser, device, or operating system.</li>
            </UL>
            <P>
              Tolz tools operate based on standard algorithms, publicly available libraries, and
              browser-based processing. Occasional discrepancies, bugs, or technical limitations may
              occur. Users are advised to verify important results independently, especially when the
              output will be used for critical, financial, legal, or official purposes.
            </P>
          </Section>

          <Section title="User Responsibility">
            <P>By using Tolz, you agree that:</P>
            <UL>
              <li>
                You are solely responsible for how you use the tools and any decisions made based on
                their output.
              </li>
              <li>
                You will not rely exclusively on any tool for decisions involving significant
                financial, legal, medical, or safety consequences.
              </li>
              <li>
                You are responsible for maintaining backups of any files or data before uploading
                them to our tools for processing.
              </li>
              <li>You will use the website in compliance with applicable local, national, and international laws.</li>
            </UL>
            <P>
              Tolz shall not be held liable for any loss, damage, or inconvenience arising from the
              use, misuse, or inability to use any tool on this website.
            </P>
          </Section>

          <Section title="Third-Party Links and Content">
            <P>
              Our website may contain links to third-party websites, advertisements, or resources
              that are not owned or controlled by Tolz. We do not endorse, monitor, or assume
              responsibility for the accuracy, content, privacy practices, or policies of any
              third-party websites.
            </P>
            <P>
              Visiting external links is done at your own risk, and we encourage users to review the
              terms and privacy policies of any third-party site they visit.
            </P>
          </Section>

          <Section title="Limitation of Liability">
            <P>
              To the fullest extent permitted by applicable law, Tolz, along with its owners,
              employees, and affiliates, shall not be held liable for any direct, indirect,
              incidental, consequential, or special damages arising from:
            </P>
            <UL>
              <li>The use or inability to use our website or tools.</li>
              <li>Errors, inaccuracies, or omissions in any content or tool output.</li>
              <li>Any unauthorized access to or alteration of your data or files.</li>
              <li>Technical issues, downtime, or interruptions affecting website functionality.</li>
            </UL>
            <P>
              This limitation applies regardless of whether such damages arise from contract, tort,
              negligence, or any other legal theory.
            </P>
          </Section>

          <Section title="No Warranty">
            <P>
              All tools, content, and services on Tolz are provided on an "as is" and "as available"
              basis, without warranties of any kind, either express or implied. This includes, but is
              not limited to, implied warranties of merchantability, fitness for a particular
              purpose, and non-infringement.
            </P>
            <P>
              We do not guarantee that the website will always be secure, error-free, or free from
              viruses or other harmful components, although we take reasonable measures to maintain a
              safe browsing experience.
            </P>
          </Section>

          <Section title="Changes to This Disclaimer">
            <P>
              Tolz reserves the right to update or modify this Disclaimer at any time without prior
              notice. Any changes will be reflected on this page with an updated "Last Updated" date.
              We encourage users to review this page periodically to stay informed of any updates.
            </P>
            <P>
              Continued use of the website after changes have been made constitutes your acceptance
              of the revised Disclaimer.
            </P>
          </Section>

          <Section title="Contact Us">
            <P>
              If you have any questions, concerns, or feedback regarding this Disclaimer, please feel
              free to reach out to us through the contact information provided on our website at{" "}
              <a
                href="https://www.tolz.org/"
                style={{ color: "var(--accent)" }}
              >
                https://www.tolz.org/
              </a>
              .
            </P>
          </Section>

          <Section title="Conclusion">
            <P>
              Tolz is committed to providing free, fast, and user-friendly online tools that simplify
              everyday digital tasks. However, as with any online utility, users should exercise
              reasonable judgment and discretion when using our tools for important or sensitive
              purposes. By continuing to use our website, you acknowledge and accept the terms of
              this Disclaimer in full.
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
