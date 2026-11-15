// Shared styles of the encode/decode text tools (Base64, URL); see EncodeDecodeParts.jsx.
import { inputStyle } from "../mortgage-calculator/MortgageFormControls";

export const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 };
export const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
export const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
export const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
export const textareaStyle = {
  ...inputStyle, ...mono, fontSize: 13, lineHeight: 1.5, minHeight: 110, resize: "vertical", background: "var(--bg-white)", wordBreak: "break-all",
};
export const linkBtn = {
  display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 12.5, fontWeight: 600,
  fontFamily: "var(--font-display)", color: "var(--accent)", background: "var(--bg-white)", border: "1px solid var(--accent)",
  borderRadius: "var(--radius-sm)", cursor: "pointer",
};
export const resultTitle = { fontSize: 14, color: "var(--text-primary)", fontFamily: "var(--font-display)" };
