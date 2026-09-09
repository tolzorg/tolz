import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";

export { FieldLabel, TextField };

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

export function DollarField({ value, onChange, placeholder, style }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19, ...style }}
      />
    </div>
  );
}

export function PercentField({ value, onChange, placeholder, style }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 26, ...style }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>%</span>
    </div>
  );
}

export function YearsField({ value, onChange, placeholder, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ flex: 1, minWidth: 0, ...style }} />
      <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>years</span>
    </div>
  );
}

export const RadioOption = ({ checked, onChange, label, children }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5, color: "var(--text-primary)", fontWeight: checked ? 700 : 400 }}>
      <input type="radio" checked={checked} onChange={onChange} />
      {label}
    </label>
    {checked && children && <div style={{ marginTop: 8, marginLeft: 24 }}>{children}</div>}
  </div>
);
