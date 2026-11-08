// Loan Calculator-specific form controls. FieldLabel/TextField/inputStyle
// are generic (no mortgage-specific logic) and reused from the Mortgage
// Calculator's shared control file rather than duplicated.
import { FieldLabel, TextField, ValueUnitField, FieldRow, inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { Req } from "../calculator-ui/Required";
import { useRequiredState, REQUIRED_MESSAGE } from "../calculator-ui/requiredFields";

export { FieldLabel, TextField, ValueUnitField, FieldRow };

/** `placeholder` (optional) adds an empty first choice, e.g. "Select"; while that empty choice is flagged as
 * required it reads "Please enter a value" with the red required border. */
export function SelectField({ value, onChange, options, disabled, style, placeholder }) {
  const invalid = useRequiredState(value) && placeholder !== undefined;
  return (
    <select
      value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={invalid ? "input-required" : undefined}
      aria-invalid={invalid || undefined}
      style={{ ...inputStyle, cursor: disabled ? "not-allowed" : "pointer", ...style }}
    >
      {placeholder !== undefined && <option value="" disabled>{invalid ? REQUIRED_MESSAGE : placeholder}</option>}
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
      {/* A flagged term shows on the years box only. */}
      <Req name={null}><TextField value={months} onChange={onMonthsChange} disabled={disabled} style={{ flex: 1, minWidth: 0 }} /></Req>
      <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>months</span>
    </div>
  );
}
