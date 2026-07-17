import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import JsonLd from "../components/JsonLd";
import ToolCard from "../components/tools/ToolCard";
import { CALCULATOR_CATEGORIES, getCategoryCalculators } from "../utils/calculatorConfig";

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

const BENEFITS = [
  { title: "Built for accuracy", text: "Every calculator uses standard formulas and unit conversions — no guesswork." },
  { title: "Organized by category", text: "Health, construction, and everyday-life calculators grouped so you find the right one fast." },
  { title: "Free and instant", text: "No signup, no limits, and results update as you type." },
];

export default function CalculatorsHubPage() {
  // Map each calculator category into the shape ToolCard expects.
  const categoryCards = CALCULATOR_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.name,
    tagline: cat.tagline,
    description: `${cat.description} (${getCategoryCalculators(cat).length} calculators)`,
    icon: cat.icon,
    iconBg: cat.iconBg,
    iconColor: cat.iconColor,
    path: cat.path,
    available: true,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Calculators",
    description: "Free health, construction, and everyday-life calculators.",
    url: `${SITE_URL}/calculators`,
    itemListElement: CALCULATOR_CATEGORIES.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.name,
      url: `${SITE_URL}${cat.path}`,
    })),
  };

  return (
    <article style={{ minHeight: "calc(100vh - 60px)" }}>
      <SEO
        title="Free Online Calculators – Health, Construction & More"
        description="Free calculators for health (BMI, calories, sleep), construction (square footage, cubic yards, materials), and everyday life (anniversaries, numerology). No signup."
        path="/calculators"
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
            <span aria-current="page" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              Calculators
            </span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                background: "#fff7ed",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              🧮
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
                Calculators
              </h1>
              <p
                className="animate-fadeUp delay-100"
                style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 560 }}
              >
                Health, construction, and everyday-life calculators — all free, accurate, and instant.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Intro */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h2 style={h2Style}>Calculators for Health, Construction, and Everyday Life</h2>
            <p style={pStyle}>
              From tracking daily calories to estimating how much concrete a project needs, Tolz's calculators
              are organized into three focused categories so you can find the right tool fast. Each category
              groups related calculators together — from BMI and sleep cycles to square footage and rebar
              weight — with a dedicated page you can bookmark and return to.
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>Pick a category below to see every calculator available.</p>
          </div>

          {/* Category grid */}
          <div>
            <h2 style={{ ...h2Style, marginBottom: 18 }}>Calculator Categories</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {categoryCards.map((card, i) => (
                <ToolCard key={card.id} tool={card} animDelay={i * 60} />
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h2 style={h2Style}>Why Use Tolz's Calculators</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BENEFITS.map((b) => (
                <p key={b.title} style={{ ...pStyle, marginBottom: 0 }}>
                  <strong>{b.title}.</strong> {b.text}
                </p>
              ))}
            </div>
          </div>

          {/* Browse other categories */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h2 style={{ ...h2Style, marginBottom: 14 }}>Browse Other Tools</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Link to="/tools/image" className="filter-pill" style={{ textDecoration: "none" }}>Image Tools</Link>
              <Link to="/tools/pdf" className="filter-pill" style={{ textDecoration: "none" }}>PDF Tools</Link>
              <Link to="/tools/converters" className="filter-pill" style={{ textDecoration: "none" }}>Converters</Link>
              <Link to="/tools/url-tools" className="filter-pill" style={{ textDecoration: "none" }}>URL Tools</Link>
              <Link to="/tools/text-tools" className="filter-pill" style={{ textDecoration: "none" }}>Text Tools</Link>
              <Link to="/tools/design-tools" className="filter-pill" style={{ textDecoration: "none" }}>Design Tools</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
