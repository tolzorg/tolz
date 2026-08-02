import { useParams, Link, Navigate } from "react-router-dom";
import SEO from "../components/SEO";
import JsonLd from "../components/JsonLd";
import ToolCard from "../components/tools/ToolCard";
import { getToolCategoryBySlug, TOOL_CATEGORY_PAGES } from "../utils/toolCategoryConfig";
import { getToolsByCategory } from "../utils/tools";

const SITE_URL = "https://www.tolz.org";

const linkStyle = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color var(--transition)",
};

const h2Style = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 17,
  color: "var(--text-primary)",
  letterSpacing: "-0.02em",
  marginBottom: 10,
};

const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };

export default function ToolsCategoryPage() {
  const { categorySlug } = useParams();
  const category = getToolCategoryBySlug(categorySlug);

  if (!category) return <Navigate to="/" replace />;

  const tools = getToolsByCategory(category.categoryId).filter((t) => t.available);
  const otherCategories = TOOL_CATEGORY_PAGES.filter((c) => c.slug !== category.slug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/browsealltools` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}${category.path}` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.seoDescription,
    url: `${SITE_URL}${category.path}`,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.label,
      url: `${SITE_URL}${tool.path}`,
    })),
  };

  return (
    <article style={{ minHeight: "calc(100vh - 60px)" }}>
      <SEO title={category.seoTitle} description={category.seoDescription} path={category.path} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />

      {/* Header */}
      <div className="tool-page-header">
        <div className="container">
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
              style={linkStyle}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Home
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <Link
              to="/browsealltools"
              style={linkStyle}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Tools
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <span aria-current="page" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              {category.name}
            </span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                background: category.iconBg,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {category.icon}
            </div>
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
                {category.name}
              </h1>
              <p
                className="animate-fadeUp delay-100"
                style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 560 }}
              >
                {category.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Intro */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h2 style={h2Style}>{category.introHeading}</h2>
            {category.introParagraphs.map((para, i) => (
              <p
                key={i}
                style={i === category.introParagraphs.length - 1 ? { ...pStyle, marginBottom: 0 } : pStyle}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Tool grid */}
          <div>
            <h2 style={{ ...h2Style, marginBottom: 18 }}>{category.name} Available</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {tools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} animDelay={i * 60} />
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h2 style={h2Style}>{category.benefitsHeading}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {category.benefits.map((b) => (
                <p key={b.title} style={{ ...pStyle, marginBottom: 0 }}>
                  <strong>{b.title}.</strong> {b.text}
                </p>
              ))}
            </div>
          </div>

          {/* Browse other categories */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h2 style={{ ...h2Style, marginBottom: 14 }}>Browse Other Categories</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Link to="/calculators" className="filter-pill" style={{ textDecoration: "none" }}>
                Calculators
              </Link>
              {otherCategories.map((c) => (
                <Link key={c.slug} to={c.path} className="filter-pill" style={{ textDecoration: "none" }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
