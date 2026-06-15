import { useCallback, useState } from "react";
import { useImageCompressor } from "../../../hooks/useImageCompressor";
import { ErrorCard, Spinner } from "../../ui";
import DropZone from "./DropZone";
import ImageResultCard from "./ImageResultCard";
import ResizeControls from "./ResizeControls";

const QUALITY_PRESETS = [
  { label: "Low",    value: 40, desc: "Smallest" },
  { label: "Medium", value: 65, desc: "Balanced" },
  { label: "High",   value: 80, desc: "Recommended" },
  { label: "Max",    value: 95, desc: "Best quality" },
];

const TRUST_TAGS = ["100% Free", "No Signup", "No Storage"];

export default function ImageCompressorTool() {
  const {
    images,
    quality,
    mode,
    targetSizeKb,
    phase,
    globalError,
    doneCount,
    hasResults,
    isCompressing,
    canCompress,
    addImages,
    removeImage,
    clearAll,
    setQuality,
    setTargetSizeKb,
    setMode,
    compress,
    downloadSingle,
    downloadAll,
    MAX_FILES,
    // Resize download
    isResizeDownloading, downloadResized,
    // Resize
    resizeEnabled, setResizeEnabled,
    resizeMode,    setResizeMode,
    resizePct,     setResizePct,
    resizeWidth,   setResizeWidth,
    resizeHeight,  setResizeHeight,
    lockAspect,    setLockAspect,
    resizePreset,  setResizePreset,
  } = useImageCompressor();

  const [addErrors, setAddErrors] = useState([]);
  const [isZipping, setIsZipping] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const errors = addImages(files);
      if (errors.length > 0) {
        setAddErrors(errors);
        setTimeout(() => setAddErrors([]), 6000);
      }
    },
    [addImages]
  );

  const handleDownloadAll = useCallback(async () => {
    setIsZipping(true);
    try {
      await downloadAll();
    } finally {
      setIsZipping(false);
    }
  }, [downloadAll]);

  const hasImages = images.length > 0;
  const isIdle    = phase === "idle";

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Drop zone ────────────────────────────────────── */}
      {isIdle ? (
        <DropZone onFiles={handleFiles} maxFiles={MAX_FILES} />
      ) : (
        <DropZone
          compact
          onFiles={handleFiles}
          disabled={isCompressing}
          currentCount={images.length}
          maxFiles={MAX_FILES}
        />
      )}

      {/* ── File validation errors ───────────────────────── */}
      {addErrors.length > 0 && (
        <div className="error-box animate-fadeUp">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#ef4444" />
          </svg>
          <div style={{ flex: 1 }}>
            {addErrors.map((err, i) => (
              <p key={i} style={{ marginBottom: i < addErrors.length - 1 ? 4 : 0 }}>{err}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Global error ─────────────────────────────────── */}
      {globalError && (
        <ErrorCard message={globalError} onRetry={compress} />
      )}

      {/* ── Image list ───────────────────────────────────── */}
      {hasImages && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {images.map((img) => (
            <ImageResultCard
              key={img.id}
              image={img}
              onDownload={downloadSingle}
              onRemove={removeImage}
              isCompressing={isCompressing}
            />
          ))}
        </div>
      )}

      {/* ── Resize controls ──────────────────────────────── */}
      {hasImages && (
        <ResizeControls
          resizeEnabled={resizeEnabled} setResizeEnabled={setResizeEnabled}
          resizeMode={resizeMode}       setResizeMode={setResizeMode}
          resizePct={resizePct}         setResizePct={setResizePct}
          resizeWidth={resizeWidth}     setResizeWidth={setResizeWidth}
          resizeHeight={resizeHeight}   setResizeHeight={setResizeHeight}
          lockAspect={lockAspect}       setLockAspect={setLockAspect}
          resizePreset={resizePreset}   setResizePreset={setResizePreset}
          disabled={isCompressing}
        />
      )}

      {/* ── Download resized only (no compression) ───────── */}
      {hasImages && resizeEnabled && (
        <button
          className="btn btn-secondary"
          onClick={downloadResized}
          disabled={isResizeDownloading || isCompressing}
          style={{ width: "100%", padding: "12px 24px", fontSize: 14, justifyContent: "center" }}
        >
          {isResizeDownloading ? (
            <>
              <Spinner size={14} />
              Resizing…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1.5v8M4.5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.5 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Download Resized{images.length > 1 ? ` (${images.length} images)` : ""}
            </>
          )}
        </button>
      )}

      {/* ── Compression mode control ─────────────────────── */}
      {hasImages && (
        <div className="card" style={{ padding: 18 }}>

          {/* Mode radio buttons */}
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            {[
              { value: "size",    label: "Specific Size (Ex:- 50kb)" },
              { value: "quality", label: "Quality Compression" },
            ].map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: isCompressing ? "not-allowed" : "pointer",
                  opacity: isCompressing ? 0.6 : 1,
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 13,
                  color: mode === opt.value ? "var(--accent)" : "var(--text-secondary)",
                  userSelect: "none",
                }}
              >
                <input
                  type="radio"
                  name="compress-mode"
                  value={opt.value}
                  checked={mode === opt.value}
                  disabled={isCompressing}
                  onChange={() => setMode(opt.value)}
                  style={{ accentColor: "var(--accent)", width: 15, height: 15, cursor: "pointer" }}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* ── Specific Size mode ── */}
          {mode === "size" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                Size:
              </span>
              <input
                type="number"
                min="1"
                value={targetSizeKb}
                disabled={isCompressing}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  setTargetSizeKb(val);
                }}
                style={{
                  width: 90,
                  padding: "8px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text-primary)",
                  background: "var(--bg-white)",
                  textAlign: "center",
                  outline: "none",
                  cursor: isCompressing ? "not-allowed" : "text",
                  opacity: isCompressing ? 0.6 : 1,
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <span
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-muted)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                Kb
              </span>
              <button
                className="btn btn-primary"
                onClick={compress}
                disabled={!canCompress}
                style={{ padding: "8px 20px", fontSize: 14, justifyContent: "center" }}
              >
                Compress
              </button>
            </div>
          )}

          {/* ── Quality Compression mode ── */}
          {mode === "quality" && (
            <>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                  Quality Level
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={quality}
                    disabled={isCompressing}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(10, Number(e.target.value) || 10));
                      setQuality(val);
                    }}
                    style={{
                      width: 52,
                      padding: "3px 6px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "var(--accent)",
                      background: "var(--bg-white)",
                      textAlign: "center",
                      outline: "none",
                      cursor: isCompressing ? "not-allowed" : "text",
                      opacity: isCompressing ? 0.6 : 1,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>%</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {QUALITY_PRESETS.map((p) => {
                  const active = quality === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => !isCompressing && setQuality(p.value)}
                      disabled={isCompressing}
                      style={{
                        flex: 1, padding: "8px 4px",
                        borderRadius: "var(--radius-md)",
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--accent-light)" : "var(--bg-white)",
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
                        cursor: isCompressing ? "not-allowed" : "pointer",
                        transition: "all var(--transition)",
                        opacity: isCompressing ? 0.6 : 1,
                        textAlign: "center", lineHeight: 1.3,
                      }}
                    >
                      <div>{p.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{p.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Range slider */}
              <input
                type="range" min="10" max="100" value={quality}
                disabled={isCompressing}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)", cursor: isCompressing ? "not-allowed" : "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>Smaller file</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>Better quality</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Action buttons ───────────────────────────────── */}
      {hasImages && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Compress / Compressing button — hidden in size mode (button is inline) */}
          {mode === "quality" && (
            phase !== "compressing" ? (
              <button
                className="btn btn-primary"
                onClick={compress}
                disabled={!canCompress}
                style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="2" y="12" width="12" height="2" rx="1" fill="currentColor" />
                </svg>
                {phase === "done"
                  ? `Re-compress ${images.length > 1 ? `${images.length} Images` : "Image"}`
                  : `Compress ${images.length > 1 ? `${images.length} Images` : "Image"}`}
              </button>
            ) : (
              <button className="btn btn-primary" disabled style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}>
                <Spinner size={16} />
                Compressing {images.length > 1 ? `${images.length} images` : "image"}…
              </button>
            )
          )}
          {/* Size mode: show spinner row when compressing */}
          {mode === "size" && phase === "compressing" && (
            <button className="btn btn-primary" disabled style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}>
              <Spinner size={16} />
              Compressing {images.length > 1 ? `${images.length} images` : "image"}…
            </button>
          )}

          {/* Download all as ZIP */}
          {hasResults && doneCount > 1 && (
            <button
              className="btn btn-secondary"
              onClick={handleDownloadAll}
              disabled={isZipping}
              style={{
                width: "100%",
                padding: "12px 24px",
                fontSize: 14,
                justifyContent: "center",
              }}
            >
              {isZipping ? (
                <>
                  <Spinner size={14} />
                  Preparing ZIP…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M7.5 1.5v8M4.5 7l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M1.5 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Download All ({doneCount}) as ZIP
                </>
              )}
            </button>
          )}

          {/* Clear all */}
          {!isCompressing && (
            <button
              className="btn btn-ghost"
              onClick={clearAll}
              style={{
                width: "100%",
                fontSize: 13,
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Trust signals (shown on idle screen) ─────────── */}
      {isIdle && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {TRUST_TAGS.map((tag) => (
            <span
              key={tag}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
