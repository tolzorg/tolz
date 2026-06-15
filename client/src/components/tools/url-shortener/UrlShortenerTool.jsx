import { useState, useCallback, useRef } from "react";
import { Spinner } from "../../ui";
import { shortenUrl } from "../../../services/urlShortenerService";

// ── Constants ────────────────────────────────────────────────
const EXPIRY_OPTIONS = [
  { value: "never", label: "Never expires" },
  { value: "hour",  label: "1 hour" },
  { value: "day",   label: "24 hours" },
  { value: "week",  label: "7 days" },
];

const MAX_HISTORY = 20;

// ── Helpers ──────────────────────────────────────────────────
function formatExpiry(expiresAt) {
  if (!expiresAt) return "Never expires";
  const diff = expiresAt - Date.now();
  if (diff <= 0) return "Expired";
  const totalMins = Math.floor(diff / 60000);
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = totalMins % 60;
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  if (hours > 0) return `Expires in ${hours}h ${mins}m`;
  return `Expires in ${totalMins}m`;
}

function truncate(url, maxLen = 55) {
  if (!url || url.length <= maxLen) return url;
  return url.slice(0, maxLen - 1) + "…";
}

// ── Copy button (self-contained with 2 s success state) ──────
function CopyButton({ text, small = false }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  const pad = small ? "6px 12px" : "10px 18px";

  return (
    <button
      onClick={handleCopy}
      className="btn btn-secondary"
      style={{
        padding: pad,
        fontSize: small ? 13 : 14,
        flexShrink: 0,
        background: copied ? "#f0fdf4" : undefined,
        color:      copied ? "#16a34a" : undefined,
        borderColor: copied ? "#bbf7d0" : undefined,
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      {copied ? (
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
          Copy
        </>
      )}
    </button>
  );
}

// ── Result card (latest shortened URL) ───────────────────────
function ResultCard({ result }) {
  const [qrOpen, setQrOpen] = useState(false);

  function downloadQr() {
    if (!result.qrCode) return;
    const a = document.createElement("a");
    a.href = result.qrCode;
    a.download = `qr-${result.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const isExpiring = result.expiresAt !== null;

  return (
    <div
      className="card animate-fadeUp"
      style={{
        border: "2px solid #bbf7d0",
        background: "linear-gradient(140deg, #f0fdf4 0%, #e8fdf0 40%, #ffffff 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Accent top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #16a34a, #22c55e, #4ade80)",
      }} />

      <div style={{ padding: "22px 20px 18px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Short URL block */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)",
            color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.09em",
            marginBottom: 8,
          }}>
            Your Short URL is ready
          </div>

          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(16px, 4vw, 20px)", color: "#1d4ed8",
              textDecoration: "none", wordBreak: "break-all",
              letterSpacing: "-0.02em", display: "block",
              marginBottom: 12,
            }}
          >
            {result.shortUrl}
          </a>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <CopyButton text={result.shortUrl} />
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: "10px 16px", fontSize: 14 }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M5.5 2H2A1 1 0 001 3v8a1 1 0 001 1h8a1 1 0 001-1V8.5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 1h4v4M12 1L6 7"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open Link
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(22,163,74,0.15)" }} />

        {/* Meta row: original URL + expiry */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)",
              color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 4,
            }}>
              Original URL
            </div>
            <div style={{
              fontSize: 13, color: "var(--text-secondary)",
              fontFamily: "var(--font-display)", wordBreak: "break-all",
            }}>
              {truncate(result.originalUrl, 70)}
            </div>
          </div>

          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)",
              color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 4,
            }}>
              Expiration
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)",
              color:      isExpiring ? "#b45309" : "#16a34a",
              background: isExpiring ? "#fef3c7" : "#dcfce7",
              padding: "3px 10px", borderRadius: 99,
              border: `1px solid ${isExpiring ? "#fde68a" : "#bbf7d0"}`,
              display: "inline-block",
            }}>
              {formatExpiry(result.expiresAt)}
            </span>
          </div>
        </div>

        {/* QR Code section */}
        {result.qrCode && (
          <div>
            <button
              onClick={() => setQrOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-secondary)", fontFamily: "var(--font-display)",
                fontWeight: 600, fontSize: 13, padding: "4px 0",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="1.5" height="1.5" fill="currentColor" rx="0.5"/>
                <rect x="11" y="9" width="1.5" height="1.5" fill="currentColor" rx="0.5"/>
                <rect x="9" y="11" width="3.5" height="1.5" fill="currentColor" rx="0.5"/>
              </svg>
              {qrOpen ? "Hide" : "Show"} QR Code
              <svg
                width="11" height="11" viewBox="0 0 11 11" fill="none"
                style={{ transform: qrOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
              >
                <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {qrOpen && (
              <div className="animate-fadeUp" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  padding: 10, background: "#fff", borderRadius: 12,
                  border: "1.5px solid var(--border)", display: "inline-block",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  <img
                    src={result.qrCode}
                    alt={`QR code for ${result.shortUrl}`}
                    style={{ width: 160, height: 160, display: "block" }}
                  />
                </div>
                <button
                  onClick={downloadQr}
                  className="btn btn-secondary"
                  style={{ fontSize: 13, padding: "7px 14px" }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1.5v7M4 6l2.5 2.5L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1.5 10v1A1.5 1.5 0 003 12.5h7A1.5 1.5 0 0011.5 11v-1"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Download QR
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── History item ─────────────────────────────────────────────
function HistoryItem({ item, index }) {
  return (
    <div
      className="animate-fadeUp"
      style={{
        animationDelay: `${Math.min(index * 40, 300)}ms`,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-white)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 13.5, color: "#1d4ed8", marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.shortUrl.replace(/^https?:\/\//, "")}
        </div>
        <div style={{
          fontSize: 12, color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {truncate(item.originalUrl, 48)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, fontFamily: "var(--font-display)",
          color:      item.expiresAt ? "#b45309" : "#16a34a",
          background: item.expiresAt ? "#fef3c7" : "#f0fdf4",
          padding: "2px 8px", borderRadius: 99,
          border: `1px solid ${item.expiresAt ? "#fde68a" : "#bbf7d0"}`,
          whiteSpace: "nowrap",
        }}>
          {formatExpiry(item.expiresAt)}
        </span>
        <CopyButton text={item.shortUrl} small />
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ padding: "6px 10px", fontSize: 12 }}
        >
          Open
        </a>
      </div>
    </div>
  );
}

// ── Inline error banner ──────────────────────────────────────
function InlineError({ message }) {
  return (
    <div style={{
      background: "#fff5f5", border: "1.5px solid #fecaca",
      borderRadius: "var(--radius-md)", padding: "10px 14px",
      display: "flex", gap: 8, alignItems: "flex-start",
    }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="7.5" cy="7.5" r="6.5" stroke="#ef4444" strokeWidth="1.5"/>
        <line x1="7.5" y1="4.5" x2="7.5" y2="8.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7.5" cy="10.5" r="0.8" fill="#ef4444"/>
      </svg>
      <span style={{
        fontSize: 13.5, color: "#dc2626",
        fontFamily: "var(--font-display)", fontWeight: 500,
      }}>
        {message}
      </span>
    </div>
  );
}

// ── Main tool ────────────────────────────────────────────────
export default function UrlShortenerTool() {
  const [url,          setUrl]          = useState("");
  const [customSlug,   setCustomSlug]   = useState("");
  const [expiresIn,    setExpiresIn]    = useState("never");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [result,       setResult]       = useState(null);
  const [history,      setHistory]      = useState([]);

  const urlRef = useRef(null);

  async function handleShorten() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to shorten.");
      urlRef.current?.focus();
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await shortenUrl({
        url: trimmed,
        customSlug: customSlug.trim() || undefined,
        expiresIn,
      });

      setResult(data);
      setHistory(prev => [data, ...prev].slice(0, MAX_HISTORY));
      setUrl("");
      setCustomSlug("");
      setExpiresIn("never");
      setShowAdvanced(false);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !loading) handleShorten();
  }

  // Strip non-slug chars from custom alias input
  function handleSlugChange(e) {
    setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));
  }

  const canSubmit = !loading && url.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Input card ── */}
      <div className="card animate-fadeUp" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

        <label style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: 14, color: "var(--text-primary)",
        }}>
          Paste your long URL
        </label>

        <input
          ref={urlRef}
          type="url"
          className="input"
          placeholder="https://example.com/very/long/url?with=parameters"
          value={url}
          onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoFocus
          style={{ fontSize: 15 }}
        />

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontFamily: "var(--font-display)",
            fontWeight: 600, fontSize: 13, padding: 0, width: "fit-content",
          }}
        >
          <svg
            width="13" height="13" viewBox="0 0 13 13" fill="none"
            style={{ transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M1.5 3.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {showAdvanced ? "Hide" : "Show"} advanced options
        </button>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>

              {/* Custom alias */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  fontSize: 13, color: "var(--text-secondary)", marginBottom: 6,
                }}>
                  Custom alias{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <div style={{ display: "flex" }}>
                  <span style={{
                    padding: "13px 12px",
                    background: "var(--bg-muted)",
                    border: "1.5px solid var(--border)",
                    borderRight: "none",
                    borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
                    fontSize: 13, color: "var(--text-muted)",
                    fontFamily: "var(--font-display)", fontWeight: 600,
                    flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    /s/
                  </span>
                  <input
                    type="text"
                    className="input"
                    placeholder="my-link"
                    value={customSlug}
                    onChange={handleSlugChange}
                    maxLength={30}
                    disabled={loading}
                    style={{
                      borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              {/* Expiration */}
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  fontSize: 13, color: "var(--text-secondary)", marginBottom: 6,
                }}>
                  Expiration
                </label>
                <select
                  className="input"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  disabled={loading}
                  style={{ fontSize: 14, cursor: "pointer" }}
                >
                  {EXPIRY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
              padding: "10px 14px", fontSize: 12.5,
              color: "var(--text-muted)", fontFamily: "var(--font-display)",
              fontWeight: 500, display: "flex", gap: 8, alignItems: "flex-start",
              border: "1px solid var(--border)",
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>💡</span>
              <span>
                Custom aliases: 3–30 characters, letters / numbers / hyphens / underscores only.
                Links live in server memory and reset if the server restarts.
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <InlineError message={error} />}

        {/* Shorten button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleShorten}
          disabled={!canSubmit}
          style={{ opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? "pointer" : "not-allowed" }}
        >
          {loading ? (
            <>
              <Spinner size={15} />
              Shortening…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M8.5 1.5L13 6M13 6L8.5 10.5M13 6H4.5C3.1 6 2 7.1 2 8.5V13"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Shorten URL
            </>
          )}
        </button>
      </div>

      {/* ── Result card ── */}
      {result && <ResultCard result={result} key={result.slug + result.createdAt} />}

      {/* ── Session history ── */}
      {history.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 12, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Session History ({history.length})
            </div>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: "4px 10px" }}
            >
              Clear All
            </button>
          </div>

          {history.map((item, i) => (
            <HistoryItem key={item.slug + item.createdAt} item={item} index={i} />
          ))}
        </div>
      )}

      {/* ── Info note ── */}
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
        <span style={{ flexShrink: 0, marginTop: 1 }}>🔒</span>
        <span>
          No account required. Links are validated for safety — dangerous protocols are blocked.
          All shortened URLs are stored in server memory only and are{" "}
          <strong style={{ color: "var(--text-secondary)" }}>not permanently stored</strong>.
        </span>
      </div>
    </div>
  );
}
