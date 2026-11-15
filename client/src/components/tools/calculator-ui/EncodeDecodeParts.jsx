// Shared pieces of the encode/decode text tools (Base64, URL): a titled section with an
// input card and a Result card, Encode/Decode/Clear buttons, the input text box, and the
// "Encoded result: [Copy] [Download]" output box.
import { useEffect, useRef, useState } from "react";
import { useRequiredState, requiredInputProps } from "./requiredFields";
import { para, textareaStyle, linkBtn, resultTitle } from "./encodeDecodeStyles";
import { copyText, downloadBlob } from "../../../utils/cpsExport";

const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 };
const outputStyle = {
  ...textareaStyle, minHeight: 140, background: "var(--accent-light)", border: "1px solid var(--accent)", color: "var(--text-primary)",
};
const actionBtn = {
  flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none",
  borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
};

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 3.5V3a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 002 3v6a1.5 1.5 0 001.5 1.5H4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
export const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 13.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A section heading + intro, then the input card and the Result card side by side (stacked on phones). */
export function Section({ title, id, intro, form, result, banner = "Result", busy = false }) {
  return (
    <section id={title ? undefined : id} aria-labelledby={title ? id : undefined} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {title && <h2 id={id} style={sectionTitle}>{title}</h2>}
      {intro && <p style={para}>{intro}</p>}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, padding: 18 }}>{form}</div>
        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>{banner}</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite" aria-busy={busy || undefined}>{result}</div>
        </div>
      </div>
    </section>
  );
}

/** Green action buttons (e.g. Encode, Decode) followed by Clear. */
export function ActionButtons({ actions, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      {actions.map(({ label, onClick }) => (
        <button key={label} type="button" onClick={onClick} style={actionBtn}>{label}</button>
      ))}
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

/** The input text box; shows "Please enter a value" when flagged (wrap in <Req name=…>). */
export function InputTextarea({ id, value, onChange }) {
  const invalid = useRequiredState(value);
  return (
    <textarea
      id={id} value={value} rows={5} spellCheck={false} autoComplete="off" autoCapitalize="off"
      {...requiredInputProps(invalid, "")}
      onChange={(e) => onChange(e.target.value)}
      style={textareaStyle}
    />
  );
}

/** "Encoded result:  [Copy] [Download]" + the read-only output box. `downloadAs` (a file name) adds Download. */
export function TextOutput({ title, text, downloadAs }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    const ok = await copyText(text);
    setCopied(ok ? "Copied!" : "Copy failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <strong style={resultTitle}>{title}:</strong>
        <button type="button" style={linkBtn} onClick={copy} aria-label={`Copy ${title.toLowerCase()}`}><CopyIcon />{copied || "Copy"}</button>
        {downloadAs && (
          <button
            type="button" style={linkBtn} aria-label={`Download ${title.toLowerCase()} as a text file`}
            onClick={() => downloadBlob(text, typeof downloadAs === "function" ? downloadAs() : downloadAs, "text/plain")}
          >
            <DownloadIcon />Download
          </button>
        )}
      </div>
      <textarea readOnly value={text} rows={6} aria-label={title} spellCheck={false} style={outputStyle} />
    </>
  );
}
