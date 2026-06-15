import { useState, useCallback } from "react";
import { Spinner, ErrorCard } from "../../ui";
import ConversionDropZone from "./ConversionDropZone";
import * as svc from "../../../services/imageConverterService";

// ── Sub-tool configuration ────────────────────────────────────────────────────
const TOOL_CONFIG = {
  "to-jpg": {
    label: "Image to JPG",
    description: "Convert PNG, WebP, BMP, TIFF, GIF and other formats to JPG.",
    accept: "image/png,image/webp,image/bmp,image/tiff,image/gif,image/jpeg",
    acceptLabel: "PNG, WebP, BMP, TIFF, GIF",
    multiple: true,
    maxFiles: 10,
    outputType: "images",
    outputExt: ".jpg",
    apiFn: (files) => svc.convertToJpg(files),
  },
  "to-jpeg": {
    label: "Image to JPEG",
    description: "Convert any supported image format to JPEG.",
    accept: "image/png,image/webp,image/bmp,image/tiff,image/gif,image/jpeg",
    acceptLabel: "PNG, WebP, BMP, TIFF, GIF",
    multiple: true,
    maxFiles: 10,
    outputType: "images",
    outputExt: ".jpeg",
    apiFn: (files) => svc.convertToJpeg(files),
  },
  "heic-to-jpg": {
    label: "HEIC to JPG",
    description: "Convert iPhone HEIC/HEIF photos to universally supported JPG.",
    accept: ".heic,.heif,image/heic,image/heif",
    acceptLabel: "HEIC, HEIF",
    multiple: true,
    maxFiles: 10,
    outputType: "images",
    outputExt: ".jpg",
    apiFn: (files) => svc.convertHeicToJpg(files),
  },
  "images-to-pdf": {
    label: "Images to PDF",
    description: "Combine multiple images into a single PDF document, one image per page.",
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    acceptLabel: "JPEG, PNG, WebP",
    multiple: true,
    maxFiles: 20,
    outputType: "pdf",
    apiFn: (files) => svc.convertImagesToPdf(files),
  },
  "jpg-to-pdf-100kb": {
    label: "JPG to PDF — Under 100 KB",
    description: "Convert JPG images into a compressed PDF that stays under 100 KB.",
    accept: "image/jpeg,image/jpg",
    acceptLabel: "JPEG, JPG",
    multiple: true,
    maxFiles: 10,
    outputType: "pdf",
    apiFn: (files) => svc.convertToPdf100kb(files),
  },
  "jpg-to-pdf-500kb": {
    label: "JPG to PDF — Under 500 KB",
    description: "Convert JPG images into a compressed PDF that stays under 500 KB.",
    accept: "image/jpeg,image/jpg",
    acceptLabel: "JPEG, JPG",
    multiple: true,
    maxFiles: 10,
    outputType: "pdf",
    apiFn: (files) => svc.convertToPdf500kb(files),
  },
  "jpg-to-text": {
    label: "JPG to Text (OCR)",
    description: "Extract readable text from images using optical character recognition.",
    accept: "image/jpeg,image/jpg,image/png",
    acceptLabel: "JPEG, JPG, PNG",
    multiple: true,
    maxFiles: 5,
    outputType: "text",
    apiFn: (files) => svc.convertJpgToText(files),
  },
  "jpeg-to-png": {
    label: "JPEG to PNG",
    description: "Convert JPEG images to lossless PNG format, preserving full quality.",
    accept: "image/jpeg,image/jpg",
    acceptLabel: "JPEG, JPG",
    multiple: true,
    maxFiles: 10,
    outputType: "images",
    outputExt: ".png",
    apiFn: (files) => svc.convertJpegToPng(files),
  },
};

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function downloadBase64(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

// ── Image result row ──────────────────────────────────────────────────────────
function ImageResultRow({ result, index }) {
  const hasError = !!result.error;
  return (
    <div className="card" style={{ padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{
        width: 40, height: 40, borderRadius: "var(--radius-md)",
        background: hasError ? "#fff0f0" : "var(--bg-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 18,
        border: "1px solid var(--border)",
      }}>
        {hasError ? "✕" : "🖼"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
          color: hasError ? "var(--error)" : "var(--text-primary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {result.name}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {hasError ? result.error : formatBytes(result.size)}
        </p>
      </div>
      {!hasError && (
        <button
          className="btn btn-secondary"
          onClick={() => downloadBase64(result.data, result.name)}
          style={{ padding: "7px 12px", fontSize: 12, flexShrink: 0 }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v7M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.5 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Save
        </button>
      )}
    </div>
  );
}

// ── Text result block ─────────────────────────────────────────────────────────
function TextResult({ result }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(result.text || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result.text]);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
          color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {result.name}
        </span>
        {!result.error && (
          <button
            className="btn btn-secondary"
            onClick={copy}
            style={{ padding: "5px 12px", fontSize: 12, flexShrink: 0 }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
      {result.error ? (
        <p style={{ fontSize: 13, color: "var(--error)" }}>{result.error}</p>
      ) : (
        <textarea
          readOnly
          value={result.text}
          style={{
            width: "100%", minHeight: 120, resize: "vertical",
            padding: "10px 12px",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontFamily: "monospace", fontSize: 13,
            color: "var(--text-primary)", background: "var(--bg-muted)",
            lineHeight: 1.6, outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

// ── PDF result ────────────────────────────────────────────────────────────────
function PdfResult({ pdfData, name, size }) {
  return (
    <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--radius-md)",
        background: "#eff6ff", border: "1px solid #bfdbfe",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        📄
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
          {name}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{formatBytes(size)}</p>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => downloadBase64(pdfData, name)}
        style={{ padding: "9px 18px", fontSize: 13, flexShrink: 0 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5v7M4 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.5 12h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Download PDF
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ImageConverterTool({ toolId }) {
  const cfg = TOOL_CONFIG[toolId];
  const [files, setFiles] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | processing | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [addErrors, setAddErrors] = useState([]);
  const [isZipping, setIsZipping] = useState(false);

  const MAX_SIZE = 25 * 1024 * 1024;

  const handleFiles = useCallback((incoming) => {
    const arr = Array.from(incoming);
    const errs = [];
    const valid = [];

    for (const f of arr) {
      if (f.size > MAX_SIZE) { errs.push(`"${f.name}" exceeds 25 MB`); continue; }
      valid.push(f);
    }

    if (!cfg.multiple) {
      setFiles(valid.slice(0, 1));
    } else {
      setFiles((prev) => {
        const remaining = cfg.maxFiles - prev.length;
        if (remaining <= 0) { errs.push(`Maximum ${cfg.maxFiles} files reached`); return prev; }
        return [...prev, ...valid.slice(0, remaining)];
      });
    }

    if (errs.length) {
      setAddErrors(errs);
      setTimeout(() => setAddErrors([]), 6000);
    }
    setPhase("idle");
    setResult(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  const removeFile = useCallback((idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
    setError(null);
    setPhase("idle");
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setResult(null);
    setError(null);
    setPhase("idle");
  }, []);

  const downloadAll = useCallback(async () => {
    const successes = result?.results?.filter((r) => !r.error && r.data) ?? [];
    if (!successes.length) return;
    if (successes.length === 1) { downloadBase64(successes[0].data, successes[0].name); return; }
    setIsZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      successes.forEach((r) => zip.file(r.name, r.data.split(",")[1], { base64: true }));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "converted_images.zip"; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  }, [result]);

  const process = useCallback(async () => {
    if (!files.length || phase === "processing") return;
    setPhase("processing");
    setError(null);
    setResult(null);
    try {
      const data = await cfg.apiFn(files);
      setResult(data);
      setPhase("done");
    } catch (err) {
      setError(err.message || "Processing failed. Please try again.");
      setPhase("error");
    }
  }, [files, phase, cfg]);

  if (!cfg) return <p style={{ color: "var(--error)", padding: 24 }}>Unknown tool.</p>;

  const hasFiles = files.length > 0;
  const isProcessing = phase === "processing";

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Drop zone */}
      <ConversionDropZone
        onFiles={handleFiles}
        accept={cfg.accept}
        acceptLabel={cfg.acceptLabel}
        multiple={cfg.multiple}
        maxFiles={cfg.maxFiles}
        disabled={isProcessing}
      />

      {/* File validation errors */}
      {addErrors.length > 0 && (
        <div className="error-box animate-fadeUp">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#ef4444" />
          </svg>
          <div style={{ flex: 1 }}>
            {addErrors.map((e, i) => <p key={i} style={{ marginBottom: i < addErrors.length - 1 ? 4 : 0 }}>{e}</p>)}
          </div>
        </div>
      )}

      {/* Global error */}
      {error && <ErrorCard message={error} onRetry={process} />}

      {/* File list */}
      {hasFiles && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </span>
            {!isProcessing && (
              <button
                className="btn btn-ghost"
                onClick={clearAll}
                style={{ fontSize: 12, padding: "4px 10px", color: "var(--text-muted)" }}
              >
                Clear all
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {files.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-muted)",
                border: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🖼</span>
                <span style={{
                  flex: 1, fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 500,
                  color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {f.name}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                  {formatBytes(f.size)}
                </span>
                {!isProcessing && (
                  <button
                    onClick={() => removeFile(i)}
                    aria-label="Remove"
                    style={{
                      width: 22, height: 22, borderRadius: 99,
                      border: "none", background: "transparent",
                      color: "var(--text-muted)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 0, flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#fff0f0"; e.currentTarget.style.color = "var(--error)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add more (multi-file tools) */}
          {cfg.multiple && files.length < cfg.maxFiles && !isProcessing && (
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              marginTop: 8, padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              border: "1.5px dashed var(--border-hover)",
              background: "transparent",
              color: "var(--text-muted)", fontSize: 13,
              fontFamily: "var(--font-display)", fontWeight: 500,
              cursor: "pointer", transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add more ({cfg.maxFiles - files.length} slots left)
              <input type="file" accept={cfg.accept} multiple hidden onChange={(e) => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ""; } }} />
            </label>
          )}
        </div>
      )}

      {/* OCR notice */}
      {hasFiles && toolId === "jpg-to-text" && phase === "idle" && (
        <div style={{
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          background: "#fefce8",
          border: "1px solid #fde68a",
          fontSize: 13, color: "#92400e",
          fontFamily: "var(--font-display)", fontWeight: 500,
        }}>
          ⏱ OCR may take 10–30 seconds per image on first use while language data loads.
        </div>
      )}

      {/* Action button */}
      {hasFiles && (
        <button
          className="btn btn-primary"
          onClick={process}
          disabled={isProcessing}
          style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
        >
          {isProcessing ? (
            <><Spinner size={16} /> Processing{files.length > 1 ? ` ${files.length} files` : ""}…</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 5l4 3-4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {phase === "done" ? "Convert Again" : `Convert ${files.length > 1 ? `${files.length} Files` : "File"}`}
            </>
          )}
        </button>
      )}

      {/* Results */}
      {phase === "done" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Header row: success label + Back button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
              color: "var(--text-primary)",
            }}>
              <span style={{ color: "#22c55e" }}>✓</span> Conversion complete
            </div>
            <button
              onClick={clearAll}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--accent)",
                background: "var(--accent-light)",
                color: "var(--accent)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                cursor: "pointer", transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Convert new files
            </button>
          </div>

          {/* Image outputs */}
          {cfg.outputType === "images" && result.results?.map((r, i) => (
            <ImageResultRow key={i} result={r} index={i} />
          ))}

          {/* Download All as ZIP — only when 2+ successful image results */}
          {cfg.outputType === "images" && (result.results?.filter((r) => !r.error && r.data).length ?? 0) > 1 && (
            <button
              className="btn btn-secondary"
              onClick={downloadAll}
              disabled={isZipping}
              style={{ width: "100%", padding: "12px 24px", fontSize: 14, justifyContent: "center" }}
            >
              {isZipping ? (
                <><Spinner size={14} /> Preparing ZIP…</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1.5v8M4.5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.5 12.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Download All ({result.results.filter((r) => !r.error && r.data).length}) as ZIP
                </>
              )}
            </button>
          )}

          {/* PDF output */}
          {cfg.outputType === "pdf" && result.data && (
            <PdfResult pdfData={result.data} name={result.name} size={result.size} />
          )}

          {/* Text (OCR) outputs */}
          {cfg.outputType === "text" && result.results?.map((r, i) => (
            <TextResult key={i} result={r} />
          ))}

          {/* Back / start-over at the bottom */}
          <button
            onClick={clearAll}
            style={{
              width: "100%", marginTop: 4,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "13px 24px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--accent)",
              background: "var(--accent-light)",
              color: "var(--accent)",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
              cursor: "pointer", transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M9.5 2.5L4 7.5l5.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Convert More Files
          </button>
        </div>
      )}

      {/* Trust signals on idle */}
      {phase === "idle" && !hasFiles && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {["100% Free", "No Signup", "Files Not Stored"].map((tag) => (
            <span key={tag} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: 500,
            }}>
              <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
