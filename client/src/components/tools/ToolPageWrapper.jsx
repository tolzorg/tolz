import { Link } from "react-router-dom";
import SEO from "../SEO";
import JsonLd from "../JsonLd";

const SITE_URL = "https://tolz.org";

export default function ToolPageWrapper({ tool, children }) {
  const toolSchema = tool
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.label,
        description: tool.description,
        url: `${SITE_URL}${tool.path}`,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }
    : null;

  const breadcrumbSchema = tool
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/#tools` },
          { "@type": "ListItem", position: 3, name: tool.label, item: `${SITE_URL}${tool.path}` },
        ],
      }
    : null;

  return (
    <article style={{ minHeight: "calc(100vh - 60px)" }}>
      {tool && (
        <>
          <SEO
            title={`${tool.label} — Free Online Tool`}
            description={tool.description}
            path={tool.path}
          />
          <JsonLd data={toolSchema} />
          <JsonLd data={breadcrumbSchema} />
        </>
      )}

      {/* Tool page header */}
      <div className="tool-page-header">
        <div className="container">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              fontSize: 13,
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            <Link
              to="/"
              style={{
                color: "var(--text-muted)",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color var(--transition)",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Home
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <Link
              to="/#tools"
              style={{
                color: "var(--text-muted)",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color var(--transition)",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Tools
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <span aria-current="page" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              {tool?.label || "Tool"}
            </span>
          </nav>

          {/* Tool header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            {tool?.icon && (
              <div
                aria-hidden="true"
                style={{
                  width: 56,
                  height: 56,
                  background: tool.iconBg || "#f3f3f5",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {tool.icon}
              </div>
            )}
            <div>
              <h1
                className="animate-fadeUp"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(22px, 4vw, 30px)",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.025em",
                  marginBottom: 6,
                }}
              >
                {tool?.label || "Tool"}
              </h1>
              <p
                className="animate-fadeUp delay-100"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 15,
                  maxWidth: 520,
                }}
              >
                {tool?.description || ""}
              </p>

              {/* Platform pills for video downloader */}
              {tool?.platforms && (
                <div
                  className="animate-fadeUp delay-200"
                  style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}
                >
                  {tool.platforms.map((p) => (
                    <span
                      key={p}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        background: "var(--bg-muted)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tool body */}
      <section aria-label={`${tool?.label || "Tool"} workspace`} className="tool-page-body">
        {children}
      </section>
    </article>
  );
}
