import { ErrorPanel } from "../fha-loan-calculator/MortgageResultParts";

// Layout pieces shared by the four Pace Calculator sections.

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };

/** A section title + intro, with an anchor id (#multipoint, #paceconverter, #finishtime). */
export function SectionHeading({ id, title, children }) {
  return (
    <div id={id} style={{ scrollMarginTop: 80 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: "var(--text-primary)", margin: "0 0 6px" }}>{title}</h2>
      {children && <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{children}</p>}
    </div>
  );
}

/** Form card on the left, result card on the right (stacked on phones). */
export function SectionLayout({ form, result, formWidth = 420 }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: `1 1 ${Math.min(formWidth, 320)}px`, minWidth: 280, maxWidth: formWidth }}>{form}</div>
      <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={resultBanner}>Result</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{result}</div>
      </div>
    </div>
  );
}

/** Errors, or the result body; nothing when there is no result yet. */
export function ResultOrErrors({ result, children }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the values, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return children;
}


/** Value text sized to fit long "x minutes and y seconds" phrases in the summary panel. */
export const SummaryText = ({ children }) => <span style={{ fontSize: "0.62em", lineHeight: 1.25, display: "inline-block" }}>{children}</span>;
