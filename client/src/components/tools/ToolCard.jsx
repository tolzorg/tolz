import { Link } from "react-router-dom";

export default function ToolCard({ tool, animDelay = 0 }) {
  const isAvailable = tool.available;

  const card = (
    <div
      className={`card animate-fadeUp ${!isAvailable ? "coming-soon-card" : ""}`}
      style={{
        animationDelay: `${animDelay}ms`,
        padding: "22px 20px",
        position: "relative",
        cursor: isAvailable ? "pointer" : "default",
        opacity: isAvailable ? 1 : 0.75,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "all 0.18s ease",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >

      {/* Icon + title row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            background: tool.iconBg || "#f3f3f5",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {tool.icon}
        </div>

        <div style={{ paddingTop: 2 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--text-primary)",
              marginBottom: 2,
              lineHeight: 1.3,
            }}
          >
            {tool.label}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {tool.tagline}
          </p>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        {tool.description}
      </p>

      {/* Arrow for available tools */}
      {isAvailable && (
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            color: tool.iconColor || "var(--accent)",
          }}
        >
          Open tool
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ transition: "transform 0.18s ease" }}
          >
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {!isAvailable && (
        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
          }}
        >
          Coming soon
        </div>
      )}
    </div>
  );

  if (!isAvailable) return card;

  return (
    <Link to={tool.path} style={{ textDecoration: "none", display: "flex", height: "100%" }}>
      {card}
    </Link>
  );
}
