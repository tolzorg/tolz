import { useEffect, useRef, useState } from "react";
import { copyText, formatNameDetails } from "../../../utils/japaneseNameExport";
import { speakApproximatePronunciation } from "../../../utils/japaneseNameSpeech";

const GENDER_LABEL = { girl: "Girl", boy: "Boy", unisex: "Unisex" };

export default function NameDetailsDialog({ record, onClose }) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!record) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const handleCopy = async () => {
    if (await copyText(formatNameDetails(record))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      role="presentation"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jng-details-title"
        tabIndex={-1}
        className="card"
        style={{ maxWidth: 480, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: 22, outline: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div id="jng-details-title" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--text-primary)" }}>
              {record.kanji}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{record.hiragana} · {record.romaji}</div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close details" style={{ fontSize: 18, padding: "4px 10px" }}>✕</button>
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 8, columnGap: 12, fontSize: 13 }}>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Type</dt>
          <dd style={{ margin: 0, color: "var(--text-primary)" }}>{record.type === "firstName" ? "First name" : "Last name"}</dd>

          {record.type === "firstName" && (
            <>
              <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Gender</dt>
              <dd style={{ margin: 0, color: "var(--text-primary)" }}>
                {GENDER_LABEL[record.genderClassification] || "Gender classification unavailable"}
                <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>(dataset classification, not an objective fact)</span>
              </dd>
            </>
          )}

          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Kanji count</dt>
          <dd style={{ margin: 0, color: "var(--text-primary)" }}>{record.kanjiCount}</dd>

          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Mora count</dt>
          <dd style={{ margin: 0, color: "var(--text-primary)" }}>{record.moraCount}</dd>

          {record.readings?.length > 1 && (
            <>
              <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Other readings</dt>
              <dd style={{ margin: 0, color: "var(--text-primary)" }}>
                {record.readings.filter((r) => r.readingStatus !== "selected").map((r) => `${r.hiragana} (${r.romaji})`).join(", ")}
              </dd>
            </>
          )}

          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Meaning</dt>
          <dd style={{ margin: 0, color: record.meanings?.length > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
            {record.meanings?.length > 0
              ? record.meanings.map((m, i) => <div key={i}>{m.appliesToKanji}: {m.text}</div>)
              : "Meaning information unavailable for this record."}
          </dd>
        </dl>

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 14, paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Source &amp; Provenance
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            Source: {record.source}<br />
            Source record ID: {record.sourceRecordId}<br />
            License: {record.sourceLicense}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <button type="button" className="btn btn-primary" onClick={() => speakApproximatePronunciation(record.hiragana)}>
            🔊 Listen (approximate pronunciation)
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>{copied ? "Copied!" : "Copy Details"}</button>
        </div>
      </div>
    </div>
  );
}
