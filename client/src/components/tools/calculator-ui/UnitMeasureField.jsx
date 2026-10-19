import { inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { useRequiredState, requiredInputProps } from "./requiredFields";

// A number box (or two, for feet / inches and meters / centimeters) with a
// unit dropdown attached on the right. The dropdown shows the short unit
// ("cm") while closed and the full names ("centimeters (cm)") when opened:
// a transparent native <select> sits over the short label, so it stays
// keyboard- and screen-reader-friendly.

const srOnly = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };

function Box({ value, onChange, suffix, label, first, placeholder, invalid }) {
  return (
    <label style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", borderLeft: first ? "none" : "1px solid var(--border)" }}>
      <span style={srOnly}>{label}</span>
      <input
        type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)}
        {...(invalid && !first ? { ...requiredInputProps(true, ""), placeholder: "" } : requiredInputProps(invalid, placeholder))}
        style={{ ...inputStyle, border: "none", borderRadius: 0, background: "transparent", minWidth: 0, paddingRight: suffix ? suffix.length * 7 + 14 : undefined }}
      />
      {suffix && (
        <span aria-hidden="true" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: "var(--text-muted)", pointerEvents: "none" }}>
          {suffix}
        </span>
      )}
    </label>
  );
}

/**
 * @param {{ label: string, units: { value, label, short, parts? }[], unit: string, onUnitChange: (u) => void,
 *   values: string[], onChange: (i: number, text: string) => void, placeholders?: string[] }} props
 *   A unit with `parts` (e.g. ["ft", "in"] or ["hrs", "min", "sec"]) shows one box per part.
 */
export default function UnitMeasureField({ label, units, unit, onUnitChange, values, onChange, placeholders = [] }) {
  const current = units.find((u) => u.value === unit) || units[0];
  // Flagged as required and still empty: every box shows it, the first one with the message.
  const invalid = useRequiredState(values);
  const parts = current.parts;
  return (
    <div
      style={{
        display: "flex", alignItems: "stretch", flex: 1, minWidth: 0, border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", background: "var(--bg-white)", overflow: "hidden",
      }}
    >
      {parts ? (
        parts.map((part, i) => (
          <Box
            key={part} first={i === 0} value={values[i] ?? ""} placeholder={placeholders[i] ?? ""} invalid={invalid}
            onChange={(t) => onChange(i, t)} suffix={part} label={`${label} (${part})`}
          />
        ))
      ) : (
        <Box first value={values[0]} placeholder={placeholders[0]} invalid={invalid} onChange={(t) => onChange(0, t)} label={`${label} (${current.short})`} />
      )}
      <div style={{ position: "relative", flex: "0 0 auto", display: "flex", alignItems: "center", gap: 4, padding: "0 10px", background: "var(--bg-muted)", borderLeft: "1px solid var(--border)" }}>
        <span aria-hidden="true" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", whiteSpace: "nowrap" }}>{current.short}</span>
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <select
          value={current.value}
          onChange={(e) => onUnitChange(e.target.value)}
          aria-label={`${label} unit`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", fontSize: 14 }}
        >
          {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </div>
    </div>
  );
}
