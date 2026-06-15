import { useState, useMemo } from "react";
import { TOOLS, CATEGORIES } from "../utils/tools";
import ToolCard from "../components/tools/ToolCard";
import SEO from "../components/SEO";
import JsonLd from "../components/JsonLd";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools = useMemo(() => {
    if (activeCategory === "all") return TOOLS;
    return TOOLS.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  const availableTools = filteredTools.filter((t) => t.available);
  const comingTools = filteredTools.filter((t) => !t.available);

  const totalAvailable = TOOLS.filter((t) => t.available).length;
  const totalTools = TOOLS.length;

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tolz",
    url: "https://tolz.com",
    description: "Free online tools for images, PDFs, health calculators, URL shortener, QR codes and more.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tolz",
    url: "https://tolz.com",
    logo: "https://tolz.com/favicon.svg",
    sameAs: [],
  };

  return (
    <div>
      <SEO
        title="Free Online Tools — Image, PDF, Health & More"
        description="Free online tools for images, PDFs, health calculators, URL shortener, QR codes and more. No signup, no watermarks, always free."
        path="/"
      />
      <JsonLd data={webAppSchema} />
      <JsonLd data={orgSchema} />
      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="container">
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
            Free · No Signup · Instant
          </p>

          <h1
            className="animate-fadeUp"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 48px)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 16,
              maxWidth: 640,
              margin: "0 auto 16px",
            }}
          >
            Every tool you need.{" "}
            <span style={{ color: "var(--accent-2)" }}>Completely free.</span>
          </h1>

          <p
            className="animate-fadeUp delay-100"
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(15px, 2vw, 17px)",
              maxWidth: 500,
              margin: "0 auto 32px",
              lineHeight: 1.65,
            }}
          >
            Compress images, convert files, and more — all in one place.
            No registration. No watermark. No catch.
          </p>

          {/* CTAs */}
          <div
            className="animate-fadeUp delay-200"
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}
          >
            <a
              href="#tools"
              className="btn btn-primary"
              style={{ fontSize: 15, padding: "13px 24px" }}
            >
              Browse All Tools
            </a>
          </div>

          {/* Stats */}
          <div
            className="animate-fadeUp delay-300"
            style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}
          >
            {[
              { value: `${totalTools}+`, label: "Tools planned" },
              { value: `${totalAvailable}`, label: "Ready now" },
              { value: "0", label: "Sign-ups needed" },
              { value: "100%", label: "Always free" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 26,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 1 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Section ── */}
      <section id="tools" style={{ padding: "48px 0 80px" }}>
        <div className="container">

          {/* Category filter pills — iLovePDF style */}
          <div
            className="animate-fadeUp"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 36,
            }}
          >
            {CATEGORIES.map((cat) => {
              const catTools = cat.id === "all" ? TOOLS : TOOLS.filter((t) => t.category === cat.id);
              const count = catTools.length;
              return (
                <button
                  key={cat.id}
                  className={`filter-pill ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.6,
                      fontWeight: 600,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Available tools */}
          {availableTools.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
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
                  Available Tools
                </h2>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: "#dcfce7",
                    color: "#16a34a",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {availableTools.length} ready
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                  gap: 14,
                }}
              >
                {availableTools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} animDelay={i * 60} />
                ))}
              </div>
            </div>
          )}

          {/* Coming soon tools */}
          {comingTools.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "var(--text-secondary)",
                  }}
                >
                  Coming Soon
                </h2>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                  }}
                >
                  {comingTools.length} in development
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {comingTools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} animDelay={300 + i * 50} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredTools.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                No tools in this category yet — check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Feature section (iLovePDF "Work your way" equivalent) ── */}
      <section
        style={{
          background: "var(--bg-white)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "64px 0",
        }}
      >
        <div className="container">
          <h2
            className="animate-fadeUp"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(22px, 4vw, 32px)",
              color: "var(--text-primary)",
              textAlign: "center",
              marginBottom: 10,
              letterSpacing: "-0.025em",
            }}
          >
            Why Tolz?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              textAlign: "center",
              fontSize: 15,
              marginBottom: 40,
            }}
          >
            Built for simplicity. Designed for everyone.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: "⚡",
                iconBg: "#fefce8",
                title: "Instant results",
                desc: "Most tools process in seconds, no upload queues or waiting rooms.",
              },
              {
                icon: "🔒",
                iconBg: "#f0fdf4",
                title: "Privacy first",
                desc: "We never store your files or personal data. What you process stays private.",
              },
              {
                icon: "🆓",
                iconBg: "#eff6ff",
                title: "Truly free",
                desc: "No hidden paywalls, no premium tiers, no credit card required. Ever.",
              },
              {
                icon: "📱",
                iconBg: "#fff0f0",
                title: "Works everywhere",
                desc: "Fully responsive on desktop, tablet, and mobile. No app install needed.",
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                className="card animate-fadeUp"
                style={{
                  animationDelay: `${i * 80}ms`,
                  padding: "24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: feat.iconBg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--text-primary)",
                      marginBottom: 6,
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {feat.desc}
                  </p>
                </div>
                <a
                  href="#tools"
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "var(--font-display)",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "color var(--transition)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Explore tools
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: "72px 0 80px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2
            className="animate-fadeUp"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(22px, 4vw, 32px)",
              color: "var(--text-primary)",
              marginBottom: 12,
              letterSpacing: "-0.025em",
            }}
          >
            Start using Tolz today
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              marginBottom: 28,
              maxWidth: 420,
              margin: "0 auto 28px",
            }}
          >
            No account. No limit. Just pick a tool and get started.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#tools"
              className="btn btn-primary"
              style={{ fontSize: 15, padding: "13px 26px" }}
            >
              View All Tools
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
