import { formatShortDate } from "../../../utils/anniversaryCalc";

// Horizontal, responsive roadmap: start date → recent completed anniversaries
// → today → upcoming milestones. Nodes are spaced evenly by position (not by
// literal elapsed time) so a 1-year and a 100-year relationship both render
// as a readable, scrollable row instead of an unreadable multi-decade axis.

function Dot({ type, isMajor }) {
  const size = isMajor ? 16 : type === "today" ? 15 : 11;
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    boxSizing: "border-box",
  };

  if (type === "start") {
    return <div style={{ ...base, background: "var(--text-primary)" }} />;
  }
  if (type === "completed") {
    return (
      <div style={{ ...base, background: "var(--bg-white)", border: "2px solid var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size - 6} height={size - 6} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7l3 3 6-6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (type === "today") {
    return (
      <div style={{ ...base, background: "var(--accent)", boxShadow: "0 0 0 4px var(--accent-light)" }} />
    );
  }
  if (type === "next") {
    return <div style={{ ...base, background: "var(--bg-white)", border: `2.5px solid var(--accent)` }} />;
  }
  // upcoming
  return (
    <div style={{
      ...base,
      background: isMajor ? "#fff7e6" : "var(--bg-white)",
      border: `2px solid ${isMajor ? "#d4a017" : "var(--border)"}`,
    }} />
  );
}

function TimelineNode({ node }) {
  const { type, label, date, isMajor, giftName } = node;
  const statusText = type === "today" ? "Today"
    : type === "start" ? "Started"
    : type === "completed" ? "Completed"
    : type === "next" ? "Next up"
    : "Upcoming";

  return (
    <div
      role="listitem"
      aria-label={`${label}: ${statusText}, ${formatShortDate(date)}${giftName ? `, ${giftName}` : ""}`}
      style={{
        flex: "1 0 84px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
        paddingTop: 8,
        textAlign: "center",
      }}
    >
      <Dot type={type} isMajor={isMajor} />
      <span style={{
        marginTop: 8,
        fontFamily: "var(--font-display)",
        fontWeight: type === "today" || type === "next" ? 700 : 600,
        fontSize: 12,
        color: type === "today" ? "var(--accent)" : type === "start" ? "var(--text-primary)" : "var(--text-secondary)",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap" }}>
        {formatShortDate(date)}
      </span>
      {isMajor && giftName && (
        <span style={{
          marginTop: 4, fontSize: 10, fontWeight: 700, color: "#a16207",
          background: "#fff7e6", border: "1px solid #f5d989", borderRadius: 99,
          padding: "1px 8px", whiteSpace: "nowrap",
        }}>
          {giftName}
        </span>
      )}
    </div>
  );
}

export default function AnniversaryTimeline({ startDate, today, milestones }) {
  const yearMilestones = milestones.filter((m) => m.years > 0);
  const completed = yearMilestones.filter((m) => m.completed);
  const upcoming  = yearMilestones.filter((m) => !m.completed);

  const shownCompleted = completed.slice(-3);
  const hiddenCompletedCount = completed.length - shownCompleted.length;
  const shownUpcoming = upcoming.slice(0, 6);

  const nodes = [
    { key: "start", type: "start", date: startDate, label: "Start" },
    ...shownCompleted.map((m) => ({
      key: m.key, type: "completed", date: m.date, label: m.label, isMajor: m.isMajor, giftName: m.giftName,
    })),
    { key: "today", type: "today", date: today, label: "Today" },
    ...shownUpcoming.map((m) => ({
      key: m.key, type: m.isNext ? "next" : "upcoming", date: m.date, label: m.label, isMajor: m.isMajor, giftName: m.giftName,
    })),
  ];

  return (
    <div className="card" style={{ padding: "18px 16px" }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 4,
      }}>
        Timeline
      </div>
      {hiddenCompletedCount > 0 && (
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 4 }}>
          + {hiddenCompletedCount} earlier anniversar{hiddenCompletedCount === 1 ? "y" : "ies"} not shown
        </div>
      )}
      <div style={{ overflowX: "auto", padding: "10px 2px 4px" }}>
        <div
          role="list"
          aria-label="Anniversary timeline"
          style={{ display: "flex", position: "relative", minWidth: nodes.length * 84 }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: 16,
              left: `${100 / nodes.length / 2}%`, right: `${100 / nodes.length / 2}%`,
              height: 2, background: "var(--border)", zIndex: 0,
            }}
          />
          {nodes.map((n) => <TimelineNode key={n.key} node={n} />)}
        </div>
      </div>
    </div>
  );
}
