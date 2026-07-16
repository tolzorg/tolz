import { Link } from "react-router-dom";
import { getRelatedTools } from "../../utils/relatedTools";

// Internal-linking block shown in the tool-page sidebar (wired in via
// ToolPageWrapper). Purely presentational — all matching/grouping logic
// lives in utils/relatedTools.js.
export default function RelatedTools({ tool }) {
  const related = getRelatedTools(tool);
  if (!related || related.items.length === 0) return null;

  return (
    <nav
      aria-label={`Tools related to ${tool.label}`}
      className="card animate-fadeUp"
      style={{ padding: 0, overflow: "hidden" }}
    >
      <Link
        to={related.familyPath}
        style={{
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          padding: "16px 20px", textDecoration: "none",
          background: "linear-gradient(135deg, rgb(255, 90, 95), rgb(255, 140, 105))",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
          color: "#fff", transition: "filter 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(1.08)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span>
          Check out <span style={{ color: "#60a5fa", textDecoration: "underline", textUnderlineOffset: 3 }}>{related.poolSize} similar</span> {related.familyLabel}
        </span>
        <span aria-hidden="true">{related.familyEmoji}</span>
      </Link>

      <ul style={{ listStyle: "none", margin: 0, padding: "4px 20px" }}>
        {related.items.map((item, i) => (
          <li key={item.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
            <Link
              to={item.path}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "12px 2px", textDecoration: "none", color: "var(--text-primary)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                transition: "color var(--transition)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span aria-hidden="true" style={{ flexShrink: 0 }}>{item.icon}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              </span>
              <span aria-hidden="true" style={{ fontSize: 16, color: "var(--accent)", flexShrink: 0 }}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
