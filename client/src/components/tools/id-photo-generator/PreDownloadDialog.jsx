import { useState } from "react";

const FONT = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

// Mandatory pre-download acknowledgment — gates every export action.
// Also surfaces the low-resolution warning (if any) so it's impossible to
// silently export a print that will come out blurry.
export default function PreDownloadDialog({ open, onCancel, onConfirm, qualityWarning }) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "var(--bg-white)", borderRadius: "var(--radius-lg)", padding: 24,
        maxWidth: 440, width: "100%", boxShadow: "var(--shadow-card-hover)",
      }}>
        <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17, color: "var(--text-primary)", marginBottom: 10 }}>
          Before you print
        </h3>

        <div style={{
          display: "flex", gap: 8, padding: "10px 12px", borderRadius: RADIUS,
          background: "var(--error)" + "14", border: "1px solid var(--error)", marginBottom: 12,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>⚠</span>
          <p style={{ fontFamily: FONT, fontSize: 13, color: "var(--text-primary)", fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
            IMPORTANT: Print at 100% / Actual Size. Do NOT use "Fit to Page" — it will change the
            physical dimensions of every photo on the sheet.
          </p>
        </div>

        {qualityWarning && (
          <div style={{
            display: "flex", gap: 8, padding: "10px 12px", borderRadius: RADIUS,
            background: "var(--warning-light)", border: "1px solid var(--warning)", marginBottom: 12,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>ⓘ</span>
            <p style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
              {qualityWarning}
            </p>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginBottom: 18 }}>
          <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--accent)" }} />
          <span style={{ fontFamily: FONT, fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
            I understand and will print at actual size (100%).
          </span>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: "10px 16px", borderRadius: RADIUS, border: `1.5px solid ${BORDER}`,
            background: "var(--bg-white)", color: "var(--text-primary)", fontFamily: FONT,
            fontWeight: 700, fontSize: 13.5, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={() => { setAcknowledged(false); onConfirm(); }}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: RADIUS, border: "none",
              background: acknowledged ? "var(--accent)" : "var(--bg-muted)",
              color: acknowledged ? "#fff" : "var(--text-muted)",
              fontFamily: FONT, fontWeight: 700, fontSize: 13.5,
              cursor: acknowledged ? "pointer" : "not-allowed",
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
