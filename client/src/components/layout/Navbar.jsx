import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { TOOLS, CATEGORIES } from "../../utils/tools";
import { CALCULATOR_CATEGORIES, getCategoryCalculators } from "../../utils/calculatorConfig";

// Build category groups (only categories that have ≥1 available tool)
function buildGroups() {
  const available = TOOLS.filter((t) => t.available);
  return CATEGORIES.filter((c) => c.id !== "all")
    .map((c) => {
      const tools = available.filter((t) => t.category === c.id);
      // Calculators: dropdown shows category links, not individual tools
      if (c.id === "utility") {
        return { ...c, tools, categoryLinks: CALCULATOR_CATEGORIES };
      }
      if (c.subCategories) {
        const groups = c.subCategories
          .map((sc) => ({ ...sc, tools: tools.filter((t) => t.subCategory === sc.id) }))
          .filter((sc) => sc.tools.length > 0);
        return { ...c, tools, groups };
      }
      return { ...c, tools };
    })
    .filter((c) => c.tools.length > 0);
}

const GROUPS = buildGroups();

// ── Dropdown panel (desktop) ──────────────────────────────────
// Always rendered so the close animation plays; visibility controlled via
// opacity + transform + pointer-events.
function DropdownPanel({ group, isOpen, location, onClose }) {
  const panelStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: 0,
    minWidth: 248,
    background: "var(--bg-white)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.11), 0 2px 6px rgba(0,0,0,0.05)",
    padding: 6,
    zIndex: 9999,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0)" : "translateY(-10px)",
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  };

  const sectionLabelStyle = {
    margin: 0,
    padding: "7px 10px 5px",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 10.5,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    userSelect: "none",
  };

  const renderToolLink = (tool) => {
    const active = location.pathname === tool.path;
    return (
      <Link
        key={tool.id}
        to={tool.path}
        role="menuitem"
        className={`nb-drop-item${active ? " nb-drop-active" : ""}`}
        onClick={onClose}
      >
        <span className="nb-drop-icon" style={{ background: tool.iconBg }}>
          {tool.icon}
        </span>
        <span className="nb-drop-text">
          <span className="nb-drop-label" style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}>
            {tool.label}
          </span>
          <span className="nb-drop-tagline">{tool.tagline}</span>
        </span>
      </Link>
    );
  };

  // Calculator categories: render category page links
  if (group.categoryLinks) {
    return (
      <div role="menu" aria-hidden={!isOpen} style={{ ...panelStyle, minWidth: 268 }}>
        <p style={sectionLabelStyle}>Browse by category</p>
        {group.categoryLinks.map((cat) => {
          const active = location.pathname.startsWith(cat.path);
          return (
            <Link
              key={cat.id}
              to={cat.path}
              role="menuitem"
              className={`nb-drop-item${active ? " nb-drop-active" : ""}`}
              onClick={onClose}
            >
              <span className="nb-drop-icon" style={{ background: cat.iconBg }}>
                {cat.icon}
              </span>
              <span className="nb-drop-text">
                <span
                  className="nb-drop-label"
                  style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}
                >
                  {cat.name}
                </span>
                <span className="nb-drop-tagline">{cat.tagline}</span>
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  // Multi-level: render sub-category section headers with tools beneath each
  if (group.groups) {
    return (
      <div role="menu" aria-hidden={!isOpen} style={panelStyle}>
        {group.groups.map((subGroup, idx) => (
          <div key={subGroup.id}>
            {idx > 0 && (
              <div style={{ height: 1, background: "var(--border)", margin: "4px 6px" }} />
            )}
            <p style={sectionLabelStyle}>{subGroup.label}</p>
            {subGroup.tools.map(renderToolLink)}
          </div>
        ))}
      </div>
    );
  }

  // Flat: original single-level rendering
  return (
    <div role="menu" aria-hidden={!isOpen} style={panelStyle}>
      <p style={sectionLabelStyle}>{group.label}</p>
      {group.tools.map(renderToolLink)}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────
export default function Navbar() {
  const location = useLocation();

  const [openDropdown,   setOpenDropdown]   = useState(null); // group id | null
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null); // group id | null

  const desktopNavRef = useRef(null);

  // ── Click-outside: close desktop dropdown ──────────────────
  useEffect(() => {
    function onDown(e) {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── Escape key: close everything ──────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── Route change: close everything ────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenDropdown(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  function toggleDropdown(id) {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }

  function toggleMobileCategory(id) {
    setMobileExpanded((prev) => (prev === id ? null : id));
  }

  function closeMobile() {
    setMobileOpen(false);
    setMobileExpanded(null);
  }

  return (
    <>
      {/* ── Scoped CSS for hover / active states ── */}
      <style>{`
        /* ── Desktop: category trigger button ── */
        .nb-trigger {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13.5px;
          color: var(--text-secondary);
          transition: color var(--transition), background var(--transition);
          white-space: nowrap;
          line-height: 1;
        }
        .nb-trigger:hover,
        .nb-trigger.is-open {
          color: var(--text-primary);
          background: var(--bg-muted);
        }
        .nb-trigger.is-active {
          color: var(--accent);
        }
        .nb-trigger.is-active:hover,
        .nb-trigger.is-active.is-open {
          background: var(--accent-light);
        }

        /* ── Desktop: dropdown item ── */
        .nb-drop-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 10px;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background var(--transition);
          cursor: pointer;
        }
        .nb-drop-item:hover {
          background: var(--bg-muted);
        }
        .nb-drop-active {
          background: var(--accent-light) !important;
        }
        .nb-drop-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }
        .nb-drop-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .nb-drop-label {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13.5px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nb-drop-tagline {
          font-family: var(--font-display);
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-muted);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Mobile: category accordion button ── */
        .nb-mob-cat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 20px;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          color: var(--text-primary);
          transition: background var(--transition);
          text-align: left;
        }
        .nb-mob-cat:hover {
          background: var(--bg-muted);
        }

        /* ── Mobile: tool link inside accordion ── */
        .nb-mob-tool {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 20px 11px 28px;
          text-decoration: none;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
          background: var(--bg-base);
          transition: background var(--transition), color var(--transition);
        }
        .nb-mob-tool:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }
        .nb-mob-tool.is-active {
          background: var(--accent-light);
          color: var(--accent);
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}>
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", height: 60, gap: 8 }}
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9, flexShrink: 0, marginRight: 6 }}
          >
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, #ff5a5f, #ff8c69)",
              borderRadius: 9,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff",
              fontFamily: "var(--font-display)",
              boxShadow: "0 2px 8px rgba(255,90,95,0.3)",
            }}>
              T
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: 17,
              color: "var(--text-primary)", letterSpacing: "-0.02em",
            }}>
              Tolz
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav
            ref={desktopNavRef}
            className="desktop-only"
            style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}
          >
            {GROUPS.map((group) => {
              const isOpen   = openDropdown === group.id;
              const isActive = group.categoryLinks
                ? location.pathname.startsWith("/calculators")
                : group.tools.some((t) => t.path === location.pathname);

              return (
                <div key={group.id} style={{ position: "relative" }}>

                  {/* Category trigger */}
                  <button
                    className={`nb-trigger${isOpen ? " is-open" : ""}${isActive ? " is-active" : ""}`}
                    onClick={() => toggleDropdown(group.id)}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                  >
                    {group.label}

                    {/* Active dot */}
                    {isActive && !isOpen && (
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "var(--accent)", flexShrink: 0,
                        marginLeft: 1,
                      }} />
                    )}

                    {/* Chevron */}
                    <svg
                      width="11" height="11" viewBox="0 0 11 11" fill="none"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                        marginLeft: isActive && !isOpen ? 0 : undefined,
                      }}
                    >
                      <path
                        d="M1.5 3.5l4 4 4-4"
                        stroke="currentColor" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  <DropdownPanel
                    group={group}
                    isOpen={isOpen}
                    location={location}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              );
            })}
          </nav>

          {/* ── Right side ── */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span
              className="desktop-only"
              style={{
                fontSize: 12, fontWeight: 600,
                fontFamily: "var(--font-display)",
                color: "var(--text-muted)", letterSpacing: "0.06em",
              }}
            >
              FREE · NO SIGNUP
            </span>

            {/* Mobile hamburger */}
            <button
              className="mobile-only btn btn-ghost"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              style={{ padding: "7px 10px" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {mobileOpen ? (
                  <path
                    d="M2 2L16 16M16 2L2 16"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  />
                ) : (
                  <>
                    <line x1="2" y1="5"  x2="16" y2="5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="2" y1="9"  x2="16" y2="9"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div
            className="animate-fadeIn"
            style={{
              background: "var(--bg-white)",
              borderTop: "1px solid var(--border)",
              overflowY: "auto",
              maxHeight: "calc(100dvh - 60px)",
            }}
          >
            {GROUPS.map((group) => {
              const isExpanded = mobileExpanded === group.id;
              const isActive   = group.categoryLinks
                ? location.pathname.startsWith("/calculators")
                : group.tools.some((t) => t.path === location.pathname);

              return (
                <div key={group.id}>
                  {/* Accordion header */}
                  <button
                    className="nb-mob-cat"
                    onClick={() => toggleMobileCategory(group.id)}
                    aria-expanded={isExpanded}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Active indicator */}
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                        background: isActive ? "var(--accent)" : "var(--border)",
                        transition: "background var(--transition)",
                      }} />
                      {group.label}
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-display)",
                        color: "var(--text-muted)", marginLeft: 2,
                      }}>
                        {group.tools.length}
                      </span>
                    </span>

                    {/* Chevron */}
                    <svg
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.22s ease",
                        flexShrink: 0,
                      }}
                    >
                      <path
                        d="M2.5 4.5l4.5 4.5 4.5-4.5"
                        stroke="currentColor" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Accordion body — max-height for smooth expand/collapse */}
                  <div style={{
                    maxHeight: isExpanded
                      ? group.categoryLinks
                        ? `${group.categoryLinks.length * 76}px`
                        : `${group.tools.length * 75 + (group.groups ? group.groups.length * 36 : 0)}px`
                      : 0,
                    overflow: "hidden",
                    transition: "max-height 0.28s ease",
                  }}>
                    {group.categoryLinks ? (
                      // Calculator categories: show category page links
                      group.categoryLinks.map((cat) => {
                        const active = location.pathname.startsWith(cat.path);
                        return (
                          <Link
                            key={cat.id}
                            to={cat.path}
                            className={`nb-mob-tool${active ? " is-active" : ""}`}
                            onClick={closeMobile}
                          >
                            <span style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: cat.iconBg, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                            }}>
                              {cat.icon}
                            </span>
                            <span>
                              <span style={{ display: "block", fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                                {cat.name}
                              </span>
                              <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>
                                {getCategoryCalculators(cat).length} calculators
                              </span>
                            </span>
                          </Link>
                        );
                      })
                    ) : group.groups ? (
                      // Grouped: sub-category headers with tools beneath each
                      group.groups.map((subGroup) => (
                        <div key={subGroup.id}>
                          <div style={{
                            padding: "6px 20px 5px",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 10.5,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            background: "var(--bg-muted)",
                            borderBottom: "1px solid var(--border)",
                          }}>
                            {subGroup.label}
                          </div>
                          {subGroup.tools.map((tool) => {
                            const active = location.pathname === tool.path;
                            return (
                              <Link
                                key={tool.id}
                                to={tool.path}
                                className={`nb-mob-tool${active ? " is-active" : ""}`}
                                onClick={closeMobile}
                              >
                                <span style={{
                                  width: 32, height: 32, borderRadius: 8,
                                  background: tool.iconBg, flexShrink: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                                }}>
                                  {tool.icon}
                                </span>
                                <span>
                                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                                    {tool.label}
                                  </span>
                                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>
                                    {tool.tagline}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      // Flat: original single-level rendering
                      group.tools.map((tool) => {
                        const active = location.pathname === tool.path;
                        return (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            className={`nb-mob-tool${active ? " is-active" : ""}`}
                            onClick={closeMobile}
                          >
                            <span style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: tool.iconBg, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                            }}>
                              {tool.icon}
                            </span>
                            <span>
                              <span style={{ display: "block", fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                                {tool.label}
                              </span>
                              <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>
                                {tool.tagline}
                              </span>
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

            {/* Footer note */}
            <div style={{
              padding: "16px 20px",
              fontSize: 12, fontFamily: "var(--font-display)", fontWeight: 600,
              color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.06em",
            }}>
              FREE · NO SIGNUP · NO LIMITS
            </div>
          </div>
        )}
      </header>
    </>
  );
}
