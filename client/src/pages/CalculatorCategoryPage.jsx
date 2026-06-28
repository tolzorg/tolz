import { useParams, Link, Navigate } from "react-router-dom";
import SEO from "../components/SEO";
import JsonLd from "../components/JsonLd";
import ToolCard from "../components/tools/ToolCard";
import { getCategoryBySlug, getCategoryCalculators } from "../utils/calculatorConfig";

const SITE_URL = "https://www.tolz.org";

const linkStyle = {
  color: "var(--text-muted)",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color var(--transition)",
};

export default function CalculatorCategoryPage() {
  const { categorySlug } = useParams();
  const category = getCategoryBySlug(categorySlug);

  if (!category) return <Navigate to="/" replace />;

  const allCalcs = getCategoryCalculators(category);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}${category.path}` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.description,
    url: `${SITE_URL}${category.path}`,
    itemListElement: allCalcs.map((calc, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: calc.label,
      url: `${SITE_URL}${calc.path}`,
    })),
  };

  return (
    <article style={{ minHeight: "calc(100vh - 60px)" }}>
      <SEO
        title={`${category.name} — Free Online Calculators`}
        description={category.description}
        path={category.path}
      />
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
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Calculators</span>
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
                style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 520 }}
              >
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator grid — flat or grouped */}
      <section aria-label={`${category.name} tools`} style={{ padding: "56px 0 80px" }}>
        <div className="container">
          {category.groups ? (
            category.groups.map((group, gi) => (
              <div
                key={group.id}
                id={group.id}
                style={{
                  marginBottom: gi < category.groups.length - 1 ? 64 : 0,
                  scrollMarginTop: 80,
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(16px, 2.5vw, 20px)",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: 24,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{group.icon}</span>
                  {group.name}
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 20,
                  }}
                >
                  {group.calculators.map((calc, i) => (
                    <ToolCard key={calc.id} tool={calc} animDelay={i * 60} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {allCalcs.map((calc, i) => (
                <ToolCard key={calc.id} tool={calc} animDelay={i * 60} />
              ))}
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
