import { useMemo, useState } from "react";
import { matchesQuery } from "../../../utils/sentenceCounterAnalysis";

const PAGE_SIZE = 100;

function CopyIcon({ copied }) {
  return copied ? (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7.2l3 3L11.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 9.5v-6a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CopySentenceButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost"
      aria-label={`Copy sentence ${text.slice(0, 40)}`}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{ padding: 6, borderRadius: 6, flexShrink: 0, color: copied ? "#16a34a" : "var(--text-muted)" }}
    >
      <CopyIcon copied={copied} />
    </button>
  );
}

export default function SentenceList({
  sentences, activeIndex, onSelect, onHover,
  query, onQueryChange, matchCase, onMatchCaseChange, wholeWord, onWholeWordChange,
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!query.trim()) return sentences;
    return sentences.filter((s) => matchesQuery(s.text, query.trim(), matchCase, wholeWord));
  }, [sentences, query, matchCase, wholeWord]);

  const visible = filtered.slice(0, visibleCount);
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
          <input
            type="search"
            className="input"
            placeholder="Search sentences…"
            value={query}
            onChange={(e) => { onQueryChange(e.target.value); setVisibleCount(PAGE_SIZE); }}
            style={{ padding: "9px 14px", fontSize: 13.5 }}
            aria-label="Search sentences"
          />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text-secondary)", cursor: "pointer" }}>
          <input type="checkbox" checked={matchCase} onChange={(e) => onMatchCaseChange(e.target.checked)} />
          Match Case
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text-secondary)", cursor: "pointer" }}>
          <input type="checkbox" checked={wholeWord} onChange={(e) => onWholeWordChange(e.target.checked)} />
          Whole Word
        </label>
        {hasQuery && (
          <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 4px" }}>
          No sentences match "{query.trim()}".
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto" }}>
          {visible.map((s) => {
            const isActive = s.index === activeIndex;
            return (
              <div
                key={s.index}
                id={`sc-sentence-row-${s.index}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(s.index)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(s.index); } }}
                onMouseEnter={() => onHover(s.index)}
                onMouseLeave={() => onHover(null)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                  background: isActive ? "var(--accent-light)" : "var(--bg-white)",
                  cursor: "pointer",
                  transition: "border-color var(--transition), background var(--transition)",
                }}
              >
                <span style={{
                  flexShrink: 0, fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                  fontFamily: "var(--font-display)", minWidth: 22, textAlign: "right", paddingTop: 2,
                }}>
                  {s.index}
                </span>
                <span style={{ flex: 1, fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6 }}>
                  {s.text}
                </span>
                <span style={{ flexShrink: 0, fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", paddingTop: 2 }}>
                  {s.words}w · {s.chars}c
                </span>
                <CopySentenceButton text={s.text} />
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > visibleCount && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Show More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
