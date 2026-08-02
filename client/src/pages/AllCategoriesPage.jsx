import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import JsonLd from "../components/JsonLd";
import ToolCard from "../components/tools/ToolCard";
import { TOOL_CATEGORY_PAGES } from "../utils/toolCategoryConfig";
import { getToolsByCategory, getAvailableTools } from "../utils/tools";
import { CALCULATOR_CATEGORIES, getAllCalculators } from "../utils/calculatorConfig";

const SITE_URL = "https://www.tolz.org";

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

// Builds the category card list straight from the project's existing category
// registries — no hardcoded names/counts. Any category added to
// TOOL_CATEGORY_PAGES automatically appears here. Calculators is merged in as
// its own entry because it already lives in a separate registry
// (calculatorConfig.js) and is treated as a distinct top-level category
// throughout the rest of the app (Navbar, Footer, ToolsCategoryPage).
function buildCategoryCards() {
  const toolCategories = TOOL_CATEGORY_PAGES.map((cat) => {
    const count = getToolsByCategory(cat.categoryId).filter((t) => t.available).length;
    return {
      id: cat.slug,
      label: cat.name,
      tagline: `${count} tool${count === 1 ? "" : "s"}`,
      searchText: `${cat.name} ${cat.tagline} ${cat.seoDescription}`.toLowerCase(),
      icon: cat.icon,
      iconBg: cat.iconBg,
      iconColor: cat.iconColor,
      path: cat.path,
      available: true,
      count,
    };
  });

  const calculatorCount = getAllCalculators().length;
  const calculatorSearchText = CALCULATOR_CATEGORIES.map(
    (c) => `${c.name} ${c.tagline} ${c.description}`
  ).join(" ");

  const calculatorsCategory = {
    id: "calculators",
    label: "Calculators",
    tagline: `${calculatorCount} calculator${calculatorCount === 1 ? "" : "s"}`,
    searchText: `calculators ${calculatorSearchText}`.toLowerCase(),
    icon: "🧮",
    iconBg: "#fff7ed",
    iconColor: "#f59e0b",
    path: "/calculators",
    available: true,
    count: calculatorCount,
  };

  return [...toolCategories, calculatorsCategory];
}

export default function AllCategoriesPage() {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => buildCategoryCards(), []);
  const totalTools = useMemo(() => categories.reduce((sum, c) => sum + c.count, 0), [categories]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.label.toLowerCase().includes(q) || c.searchText.includes(q)
    );
  }, [categories, query]);

  // Matches individual tools (e.g. "image compressor") so the search isn't
  // limited to category names — falls back to category matches when no
  // specific tool matches the query.
  const matchedTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return getAvailableTools().filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const showToolResults = hasQuery && matchedTools.length > 0;
  const filtered = showToolResults ? matchedTools : filteredCategories;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "All Categories", item: `${SITE_URL}/browse-all-tools` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Tool Categories",
    description: "Every free tool and calculator category available on Tolz.",
    url: `${SITE_URL}/browse-all-tools`,
    itemListElement: categories.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.label,
      url: `${SITE_URL}${cat.path}`,
    })),
  };

  return (
    <article style={{ minHeight: "calc(100vh - 60px)" }}>
      <SEO
        title="Explore All Tool Categories"
        description="Browse every free tool and calculator category on Tolz — Image, PDF, Converters, Calculators, URL Tools, Text Tools, Design Tools and more. No signup required."
        path="/browse-all-tools"
      />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />

      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--accent-light) 0%, var(--bg-white) 55%, var(--accent-2-light) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "56px 0 48px",
          textAlign: "center",
        }}
      >
        <div className="container">
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginBottom: 20,
              fontSize: 13,
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            <Link
              to="/"
              style={{ color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Home
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <span aria-current="page" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              All Categories
            </span>
          </nav>

          <p
            className="animate-fadeIn"
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 16,
            }}
          >
            {totalTools}+ Free Tools · No Signup
          </p>

          <h1
            className="animate-fadeUp"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 44px)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 16,
              maxWidth: 640,
              margin: "0 auto 16px",
            }}
          >
            Explore All Tool Categories
          </h1>

          <p
            className="animate-fadeUp delay-100"
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(15px, 2vw, 17px)",
              maxWidth: 520,
              margin: "0 auto 32px",
              lineHeight: 1.65,
            }}
          >
            Browse every category of free tools and calculators on Tolz, then jump straight into the one you need.
          </p>

          {/* Search */}
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="animate-fadeUp delay-200"
            style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}
          >
            <label htmlFor="category-search" style={srOnly}>
              Search tools or categories
            </label>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="8" cy="8" r="6" stroke="var(--text-muted)" strokeWidth="1.6" />
              <path d="M12.5 12.5L16 16" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              id="category-search"
              type="search"
              className="input"
              placeholder="Search tools or categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                borderRadius: 999,
                padding: "14px 18px 14px 46px",
                fontSize: 15,
                boxShadow: "var(--shadow-sm)",
              }}
            />
          </form>
        </div>
      </section>

      {/* Category grid */}
      <section style={{ padding: "48px 0 80px" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 17,
                color: "var(--text-primary)",
              }}
            >
              {hasQuery ? `Results for "${query.trim()}"` : "All Categories"}
            </h2>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              {showToolResults
                ? `${filtered.length} tool${filtered.length === 1 ? "" : "s"}`
                : `${filtered.length} categor${filtered.length === 1 ? "y" : "ies"}`}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {filtered.map((item, i) => (
                <ToolCard
                  key={item.id}
                  tool={item}
                  animDelay={i * 60}
                  hideDescription={!showToolResults}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 14 }}>
                No tools or categories match "{query.trim()}".
              </p>
              <button type="button" className="btn btn-secondary" onClick={() => setQuery("")}>
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
