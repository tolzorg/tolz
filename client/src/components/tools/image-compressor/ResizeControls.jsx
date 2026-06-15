// Social media presets — match server's RESIZE_PRESETS keys exactly
const PRESETS = [
  { id: "instagram-post",  label: "Instagram Post",    w: 1080, h: 1080 },
  { id: "instagram-story", label: "Instagram Story",   w: 1080, h: 1920 },
  { id: "youtube-thumb",   label: "YouTube Thumbnail", w: 1280, h: 720  },
  { id: "facebook-cover",  label: "Facebook Cover",    w: 851,  h: 315  },
  { id: "twitter-post",    label: "Twitter/X Post",    w: 1200, h: 675  },
];

const MODES = [
  { id: "percentage", label: "Percentage" },
  { id: "dimensions", label: "Dimensions" },
  { id: "preset",     label: "Presets"    },
];

const PCT_STEPS = [
  { label: "25%",  value: 25  },
  { label: "50%",  value: 50  },
  { label: "75%",  value: 75  },
  { label: "100%", value: 100 },
];

// ── Shared styles ─────────────────────────────────────────────
const LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 11,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
  userSelect: "none",
};

function modeTabStyle(active, disabled) {
  return {
    flex: 1,
    padding: "7px 6px",
    borderRadius: "var(--radius-md)",
    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-light)" : "var(--bg-white)",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all var(--transition)",
    textAlign: "center",
    whiteSpace: "nowrap",
  };
}

function numInputStyle(disabled) {
  return {
    width: "100%",
    padding: "9px 10px",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 13,
    color: "var(--text-primary)",
    background: disabled ? "var(--bg-muted)" : "var(--bg-white)",
    outline: "none",
    cursor: disabled ? "not-allowed" : "text",
    opacity: disabled ? 0.55 : 1,
    transition: "border-color var(--transition)",
  };
}

export default function ResizeControls({
  resizeEnabled, setResizeEnabled,
  resizeMode, setResizeMode,
  resizePct, setResizePct,
  resizeWidth, setResizeWidth,
  resizeHeight, setResizeHeight,
  lockAspect, setLockAspect,
  resizePreset, setResizePreset,
  disabled,
}) {
  return (
    <div className="card" style={{ padding: 18 }}>

      {/* ── Header + toggle ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: resizeEnabled ? 16 : 0,
      }}>
        <div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--text-primary)",
          }}>
            Resize
          </span>
          <span style={{
            marginLeft: 8,
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
          }}>
            Optional · applied before compression
          </span>
        </div>
        <button
          type="button"
          onClick={() => !disabled && setResizeEnabled(!resizeEnabled)}
          disabled={disabled}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--radius-md)",
            border: `1.5px solid ${resizeEnabled ? "var(--accent)" : "var(--border)"}`,
            background: resizeEnabled ? "var(--accent-light)" : "var(--bg-white)",
            color: resizeEnabled ? "var(--accent)" : "var(--text-secondary)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 12.5,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            transition: "all var(--transition)",
            flexShrink: 0,
          }}
        >
          {resizeEnabled ? "✓ Enabled" : "Enable"}
        </button>
      </div>

      {/* ── Controls (only when enabled) ── */}
      {resizeEnabled && (
        <>
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => !disabled && setResizeMode(m.id)}
                disabled={disabled}
                style={modeTabStyle(resizeMode === m.id, disabled)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* ── Percentage mode ── */}
          {resizeMode === "percentage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Step presets */}
              <div style={{ display: "flex", gap: 6 }}>
                {PCT_STEPS.map((p) => {
                  const active = resizePct === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => !disabled && setResizePct(p.value)}
                      disabled={disabled}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: "var(--radius-md)",
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--accent-light)" : "var(--bg-white)",
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                        transition: "all var(--transition)",
                        textAlign: "center",
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Slider */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
                    Scale
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
                    {resizePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={resizePct}
                  disabled={disabled}
                  onChange={(e) => setResizePct(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)", cursor: disabled ? "not-allowed" : "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>5% (tiny)</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>100% (original)</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Dimensions mode ── */}
          {resizeMode === "dimensions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>

                {/* Width */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={LBL}>Width</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      type="number"
                      min="1"
                      max="8000"
                      placeholder="e.g. 1920"
                      value={resizeWidth}
                      disabled={disabled}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || (Number(v) >= 1 && Number(v) <= 8000)) setResizeWidth(v);
                      }}
                      style={numInputStyle(disabled)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)", flexShrink: 0 }}>px</span>
                  </div>
                </div>

                {/* Lock aspect toggle */}
                <div style={{ paddingBottom: 2 }}>
                  <button
                    type="button"
                    title={lockAspect ? "Aspect ratio locked — click to unlock" : "Aspect ratio unlocked — click to lock"}
                    onClick={() => !disabled && setLockAspect(!lockAspect)}
                    disabled={disabled}
                    style={{
                      width: 34,
                      height: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${lockAspect ? "var(--accent)" : "var(--border)"}`,
                      background: lockAspect ? "var(--accent-light)" : "var(--bg-muted)",
                      color: lockAspect ? "var(--accent)" : "var(--text-muted)",
                      cursor: disabled ? "not-allowed" : "pointer",
                      transition: "all var(--transition)",
                      flexShrink: 0,
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    {lockAspect ? (
                      /* locked padlock */
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      /* open padlock */
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 6V4.5A3 3 0 017 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Height */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={LBL}>Height</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      type="number"
                      min="1"
                      max="8000"
                      placeholder="e.g. 1080"
                      value={resizeHeight}
                      disabled={disabled || lockAspect}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || (Number(v) >= 1 && Number(v) <= 8000)) setResizeHeight(v);
                      }}
                      style={numInputStyle(disabled || lockAspect)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)", flexShrink: 0 }}>px</span>
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: 0 }}>
                {lockAspect
                  ? "Set width — height auto-scales to maintain aspect ratio."
                  : "Set both — image will be stretched to the exact dimensions."}
              </p>
            </div>
          )}

          {/* ── Presets mode ── */}
          {resizeMode === "preset" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PRESETS.map((p) => {
                const active = resizePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => !disabled && setResizePreset(p.id)}
                    disabled={disabled}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent-light)" : "var(--bg-white)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.6 : 1,
                      transition: "all var(--transition)",
                      textAlign: "left",
                    }}
                  >
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 13,
                      color: active ? "var(--accent)" : "var(--text-primary)",
                    }}>
                      {p.label}
                    </span>
                    <span style={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      fontSize: 12,
                      color: active ? "var(--accent)" : "var(--text-muted)",
                    }}>
                      {p.w}×{p.h}
                    </span>
                  </button>
                );
              })}
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, margin: "4px 0 0" }}>
                Image fits within these dimensions, maintaining aspect ratio.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
