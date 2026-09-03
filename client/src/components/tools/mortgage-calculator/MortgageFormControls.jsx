// Small shared form-control pieces for the Mortgage Calculator's input
// panel — a labeled field with an optional info tooltip, and a
// number-plus-unit-dropdown control used by Down Payment, Property Taxes,
// Home Insurance, PMI, HOA, and Other Costs (all "$ or %" fields).

export function FieldLabel({ children, hint }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
      {children}
      {hint && (
        <span
          title={hint}
          aria-label={hint}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 14, height: 14, borderRadius: "50%", border: "1px solid var(--text-muted)",
            fontSize: 9.5, color: "var(--text-muted)", cursor: "help", flexShrink: 0,
          }}
        >
          ?
        </span>
      )}
    </span>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 11px", fontSize: 14, borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)",
};

export function TextField({ value, onChange, disabled, placeholder, style }) {
  return (
    <input
      type="text" inputMode="decimal" value={value} placeholder={placeholder} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, ...style }}
    />
  );
}

/** A number input paired with a $/% unit dropdown — Down Payment, Property Taxes, Home Insurance, PMI, HOA, Other Costs. */
export function ValueUnitField({ value, unit, onValueChange, onUnitChange, disabled, placeholder, units = ["percent", "dollar"] }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input
        type="text" inputMode="decimal" value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        style={{ ...inputStyle, flex: 1, minWidth: 0 }}
      />
      <select
        value={unit} disabled={disabled}
        onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...inputStyle, width: 62, flexShrink: 0, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {units.includes("percent") && <option value="percent">%</option>}
        {units.includes("dollar") && <option value="dollar">$</option>}
      </select>
    </div>
  );
}

export const MONTH_OPTIONS = [
  { value: 1, label: "Jan" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" }, { value: 4, label: "Apr" },
  { value: 5, label: "May" }, { value: 6, label: "Jun" }, { value: 7, label: "Jul" }, { value: 8, label: "Aug" },
  { value: 9, label: "Sep" }, { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dec" },
];

export function MonthYearField({ month, year, onMonthChange, onYearChange, disabled }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select
        value={month} disabled={disabled}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        style={{ ...inputStyle, flex: 1, minWidth: 0, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <input
        type="text" inputMode="numeric" value={year} disabled={disabled}
        onChange={(e) => onYearChange(e.target.value)}
        style={{ ...inputStyle, width: 72, flexShrink: 0 }}
      />
    </div>
  );
}

export { inputStyle };
