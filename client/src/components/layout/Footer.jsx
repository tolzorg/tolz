import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  Tools: [
    { label: "Image Compressor", href: "/tools/image-compressor" },
    { label: "PDF Merge", href: "/tools/pdf-merge" },
    { label: "QR Generator", href: "/tools/qr-generator" },
    { label: "Unit Converter", href: "/tools/unit-converter" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-footer)",
        color: "var(--text-footer)",
        marginTop: "auto",
      }}
    >
      {/* Main footer grid */}
      <div className="container" style={{ padding: "48px 24px 36px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 40,
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 1" }}>
            <Link
              to="/"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #ff5a5f, #ff8c69)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                }}
              >
                T
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                Tolz
              </span>
            </Link>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-footer)",
                maxWidth: 200,
              }}
            >
              Free online tools for everyone. No signup, no watermarks, no catch.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                  marginBottom: 14,
                }}
              >
                {heading}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      style={{
                        textDecoration: "none",
                        color: "var(--text-footer)",
                        fontSize: 13,
                        transition: "color var(--transition)",
                        fontFamily: "var(--font-body)",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#fff")}
                      onMouseLeave={(e) => (e.target.style.color = "var(--text-footer)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="container"
          style={{
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--text-footer)" }}>
            © {new Date().getFullYear()} Tolz — All tools are free forever.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Twitter", "GitHub"].map((platform) => (
              <a
                key={platform}
                href="#"
                style={{
                  fontSize: 12,
                  color: "var(--text-footer)",
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  transition: "color var(--transition)",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text-footer)")}
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
