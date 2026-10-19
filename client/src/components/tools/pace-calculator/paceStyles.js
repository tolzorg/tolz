// Style constants and small helpers shared by the Pace Calculator sections.

export const rowStyle = { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" };
export const labelStyle = { flex: "0 0 74px", fontSize: 13.5, color: "var(--text-primary)" };
export const hintStyle = { fontSize: 12, color: "var(--text-muted)" };
export const srOnly = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };
/** A blank box falls back to its placeholder (the reference's example). */
export const orPlaceholder = (value, placeholder) => (String(value ?? "").trim() === "" ? placeholder : value);
