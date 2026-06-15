import {
  useState, useMemo, useDeferredValue,
  useRef, useCallback, useEffect,
} from "react";
import { analyzeText, formatTime, fmtNum, readTextFile } from "../../../utils/wordCounter";

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, accent = "var(--accent)", icon, large = false }) {
  return (
    <div
      className="animate-fadeUp"
      style={{
        background: "var(--bg-white)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: large ? "18px 20px" : "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "var(--shadow-xs)",
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: large ? "clamp(22px, 4vw, 30px)" : "clamp(18px, 3vw, 24px)",
        color: accent,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        wordBreak: "break-word",
      }}>
        {icon && <span style={{ marginRight: 5, fontSize: "0.8em" }}>{icon}</span>}
        {value}
      </div>
      <div style={{
        fontSize: 12,
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Copy button (2 s success state) ──────────────────────────
function CopyButton({ getText, disabled }) {
  const [state, setState] = useState("idle"); // idle | copied | error
  const timer = useRef(null);

  async function handleCopy() {
    const text = getText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        Object.assign(ta.style, { position: "fixed", opacity: "0" });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setState("copied");
      } catch { setState("error"); }
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleCopy}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        background: state === "copied" ? "#f0fdf4" : undefined,
        color:      state === "copied" ? "#16a34a" : undefined,
        borderColor: state === "copied" ? "#bbf7d0" : undefined,
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      {state === "copied" ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5l3 3 6-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 4V2.5A1.5 1.5 0 007.5 1H2.5A1.5 1.5 0 001 2.5v5A1.5 1.5 0 002.5 9H4"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Copy Text
        </>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────
export default function WordCounterTool() {
  const [text,      setText]      = useState("");
  const [fileError, setFileError] = useState(null);
  const [fileName,  setFileName]  = useState(null);

  const fileInputRef  = useRef(null);
  const textareaRef   = useRef(null);

  // Defer heavy analysis so the textarea stays responsive while typing
  const deferredText = useDeferredValue(text);
  const stats        = useMemo(() => analyzeText(deferredText), [deferredText]);
  const isPending    = text !== deferredText;

  const hasText = text.length > 0;

  // Auto-resize textarea (caps at 500 px then scrolls)
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 500) + "px";
  }, []);

  useEffect(() => { autoResize(); }, [text, autoResize]);

  function handleChange(e) {
    setText(e.target.value);
    setFileError(null);
    setFileName(null);
  }

  function handleClear() {
    setText("");
    setFileError(null);
    setFileName(null);
    textareaRef.current?.focus();
  }

  // File upload via FileReader — no server call
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    try {
      const content = await readTextFile(file);
      setText(content);
      setFileName(file.name);
    } catch (err) {
      setFileError(err.message);
    } finally {
      // Reset input so the same file can be re-selected
      e.target.value = "";
    }
  }

  // ── Primary stats (big cards) ─────────────────────────────
  const PRIMARY = [
    { label: "Words",           value: fmtNum(stats.words),          accent: "#3b7bfc" },
    { label: "Characters",      value: fmtNum(stats.chars),          accent: "#8b5cf6" },
    { label: "Without Spaces",  value: fmtNum(stats.charsNoSpaces),  accent: "#f59e0b" },
    { label: "Sentences",       value: fmtNum(stats.sentences),      accent: "#22c55e" },
    { label: "Paragraphs",      value: fmtNum(stats.paragraphs),     accent: "#06b6d4" },
    { label: "Lines",           value: fmtNum(stats.lines),          accent: "#64748b" },
    { label: "Reading Time",    value: formatTime(stats.readingMins),  accent: "#f97316" },
    { label: "Speaking Time",   value: formatTime(stats.speakingMins), accent: "#ec4899" },
  ];

  // ── Secondary stats (smaller row) ────────────────────────
  const SECONDARY = [
    {
      label: "Longest Word",
      value: stats.longestWord
        ? `${stats.longestWord} (${stats.longestWord.length})`
        : "—",
      accent: "#6366f1",
    },
    {
      label: "Avg Word Length",
      value: stats.avgWordLength ? `${stats.avgWordLength} chars` : "—",
      accent: "#0ea5e9",
    },
    {
      label: "Est. Pages",
      value: stats.estimatedPages > 0
        ? stats.estimatedPages < 0.1 ? "< 0.1" : stats.estimatedPages
        : "—",
      accent: "#14b8a6",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Text input card ─── */}
      <div className="card animate-fadeUp" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Toolbar row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          <label style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: 14, color: "var(--text-primary)",
          }}>
            {fileName ? (
              <span>
                <span style={{ color: "var(--accent)" }}>📄 {fileName}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13 }}> — loaded</span>
              </span>
            ) : "Type or paste your text below"}
          </label>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {/* Upload file */}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 13, padding: "7px 12px" }}
              title="Upload a .txt or .md file"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 9V1M4 3.5L6.5 1 9 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 9.5V11A1.5 1.5 0 003 12.5h7A1.5 1.5 0 0011.5 11V9.5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Copy text */}
            <CopyButton getText={() => text} disabled={!hasText} />

            {/* Clear */}
            {hasText && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClear}
                style={{ fontSize: 13, padding: "7px 12px", color: "var(--error)" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="input"
          placeholder="Start typing, paste text, or upload a .txt / .md file above…"
          value={text}
          onChange={handleChange}
          spellCheck
          style={{
            minHeight: 200,
            resize: "vertical",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.7,
            verticalAlign: "top",
            overflowY: "auto",
          }}
        />

        {/* File error */}
        {fileError && (
          <div style={{
            background: "#fff5f5", border: "1.5px solid #fecaca",
            borderRadius: "var(--radius-md)", padding: "10px 14px",
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#ef4444" strokeWidth="1.5"/>
              <line x1="7.5" y1="4.5" x2="7.5" y2="8.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7.5" cy="10.5" r="0.8" fill="#ef4444"/>
            </svg>
            <span style={{ fontSize: 13.5, color: "#dc2626", fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {fileError}
            </span>
          </div>
        )}

        {/* Live character counter hint */}
        <div style={{
          fontSize: 12, color: isPending ? "var(--accent)" : "var(--text-muted)",
          fontFamily: "var(--font-display)", fontWeight: 500,
          textAlign: "right", transition: "color 0.2s",
        }}>
          {isPending ? "Analyzing…" : hasText
            ? `${fmtNum(stats.chars)} character${stats.chars !== 1 ? "s" : ""}`
            : "Supports .txt and .md file upload"}
        </div>
      </div>

      {/* ── Empty state ─── */}
      {!hasText && (
        <div
          className="animate-fadeUp delay-100"
          style={{
            background: "var(--bg-muted)", border: "2px dashed var(--border)",
            borderRadius: "var(--radius-lg)", padding: "40px 24px",
            textAlign: "center", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10,
          }}
        >
          <div style={{ fontSize: 36 }}>📊</div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
            color: "var(--text-secondary)",
          }}>
            Statistics will appear here
          </div>
          <div style={{
            fontSize: 13.5, color: "var(--text-muted)",
            fontFamily: "var(--font-display)", fontWeight: 500,
          }}>
            Type something above or upload a text file to see live word, character,
            sentence, and reading time analysis.
          </div>
        </div>
      )}

      {/* ── Stats grid (only when text exists) ─── */}
      {hasText && (
        <>
          {/* Primary stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
              color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Text Statistics
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}>
              {PRIMARY.map((s, i) => (
                <div
                  key={s.label}
                  className="animate-fadeUp"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <StatCard label={s.label} value={s.value} accent={s.accent} />
                </div>
              ))}
            </div>
          </div>

          {/* Secondary stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
              color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Additional Details
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 10,
            }}>
              {SECONDARY.map((s, i) => (
                <div
                  key={s.label}
                  className="animate-fadeUp"
                  style={{ animationDelay: `${(PRIMARY.length + i) * 40}ms` }}
                >
                  <StatCard label={s.label} value={s.value} accent={s.accent} />
                </div>
              ))}
            </div>
          </div>

          {/* Top words */}
          {stats.topWords.length > 0 && (
            <div
              className="card animate-fadeUp"
              style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                Top Words (excluding common words)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {stats.topWords.map(({ word, count }, i) => (
                  <div
                    key={word}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 99,
                      background: i === 0 ? "var(--accent-light)" : "var(--bg-muted)",
                      border: `1.5px solid ${i === 0 ? "#c7d7fd" : "var(--border)"}`,
                    }}
                  >
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
                      color: i === 0 ? "var(--accent)" : "var(--text-secondary)",
                    }}>
                      {word}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11,
                      color: i === 0 ? "var(--accent)" : "var(--text-muted)",
                      background: i === 0 ? "#dbeafe" : "var(--bg-base)",
                      borderRadius: 99, padding: "1px 7px",
                    }}>
                      {count}×
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Info note ─── */}
      <div
        className="animate-fadeUp delay-200"
        style={{
          background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
          padding: "12px 16px", fontSize: 12.5,
          color: "var(--text-muted)", fontFamily: "var(--font-display)",
          fontWeight: 500, display: "flex", gap: 8,
          alignItems: "flex-start", border: "1px solid var(--border)",
        }}
      >
        <span style={{ flexShrink: 0, marginTop: 1 }}>💡</span>
        <span>
          Statistics update in real time.{" "}
          <strong style={{ color: "var(--text-secondary)" }}>Reading time</strong> is based on 238 WPM (average adult reader).{" "}
          <strong style={{ color: "var(--text-secondary)" }}>Speaking time</strong> is based on 130 WPM.
          Pages estimated at 275 words per page. No text is stored or sent anywhere.
        </span>
      </div>
    </div>
  );
}
