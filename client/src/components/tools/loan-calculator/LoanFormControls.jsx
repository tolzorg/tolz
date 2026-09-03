// Loan Calculator-specific form controls. FieldLabel/TextField/inputStyle
// are generic (no mortgage-specific logic) and reused from the Mortgage
// Calculator's shared control file rather than duplicated.
import { FieldLabel, TextField, inputStyle } from "../mortgage-calculator/MortgageFormControls";

export { FieldLabel, TextField };

export function SelectField({ value, onChange, options, disabled }) {
  return (
    <select
      value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** A "10 years 0 months" pair — two plain number inputs, matching the
 * reference calculator's Loan Term field exactly (not dropdowns). */
export function TermYearsMonthsField({ years, months, onYearsChange, onMonthsChange, disabled }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <TextField value={years} onChange={onYearsChange} disabled={disabled} style={{ flex: 1, minWidth: 0 }} />
      <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>years</span>
      <TextField value={months} onChange={onMonthsChange} disabled={disabled} style={{ flex: 1, minWidth: 0 }} />
      <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>months</span>
    </div>
  );
}
