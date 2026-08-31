import { useState } from "react";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = Object.assign(document.createElement("textarea"), { value: text, style: "position:fixed;opacity:0" });
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

export default function WordFinderResults({ results, resultsTotal, lastSearchInfo, isSearching, sortBy, setSortBy, sortOptions, loadMoreResults, hasMoreResults, scrabbleScore }) {
  const [copied, setCopied] = useState(false);

  if (isSearching) {
    return <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>Searching…</p>;
  }
  if (!lastSearchInfo) return null;
  if (lastSearchInfo.error) {
    return <p role="alert" style={{ textAlign: "center", color: "var(--error, #d33)", padding: "24px 0" }}>{lastSearchInfo.error}</p>;
  }
  if (resultsTotal === 0) {
    return <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>No words match your search.</p>;
  }

  const handleCopy = async () => {
    if (await copyText(results.join(", "))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="card" style={{ padding: 18 }} aria-live="polite">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div>
          <strong style={{ color: "var(--text-primary)" }}>{resultsTotal.toLocaleString()}</strong>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}> word{resultsTotal === 1 ? "" : "s"} — {lastSearchInfo.description}</span>
          {lastSearchInfo.truncated && (
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Showing the first {resultsTotal.toLocaleString()} matches.</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select className="input" style={{ fontSize: 12.5, padding: "5px 8px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort results">
            {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12.5, padding: "5px 10px" }} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy All"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {results.map((word) => (
          <span
            key={word}
            className="filter-pill"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "default" }}
            title={`${word} — Scrabble score ${scrabbleScore(word)}`}
          >
            {word}
            <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 700 }}>{scrabbleScore(word)}</span>
          </span>
        ))}
      </div>

      {hasMoreResults && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={loadMoreResults}>Load More</button>
        </div>
      )}
    </div>
  );
}
