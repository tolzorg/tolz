// Shared form controls for the House Affordability Calculator — reuses
// the generic FieldLabel/TextField/ValueUnitField/SelectField primitives
// already shared across this app's loan-family calculators, plus a
// local comma-formatted DollarField (same convention established by the
// Retirement/401K/Amortization calculators) and a ResultTable for the
// results panels.
import { FieldLabel, TextField as SharedTextField } from "../loan-calculator/LoanFormControls";

export { FieldLabel };

// A slightly tighter input padding than this app's shared default
// (9px 11px) — this calculator's main card packs 9 rows into one
// column, so shaving a few px off every field's height is what gets
// the whole form (Calculate button included) to fit within a typical
// laptop viewport without scrolling. Applied via `style` overrides on
// the shared TextField (which already supports it) and reimplemented
// locally for ValueUnitField (which doesn't expose a style prop on its
// shared version) — no shared component touched, so every other
// calculator using those components is unaffected.
const COMPACT_PADDING = "7px 10px";

export function TextField({ value, onChange, disabled, placeholder, style }) {
  return <SharedTextField value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} style={{ padding: COMPACT_PADDING, ...style }} />;
}

const compactInputStyle = {
  width: "100%", padding: COMPACT_PADDING, fontSize: 14, borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)",
};

/** A local, more compact reimplementation of the shared ValueUnitField
 * (mortgage-calculator/MortgageFormControls.jsx) — same behavior and
 * "percent"/"dollar" unit convention, tighter padding only. */
export function ValueUnitField({ value, unit, onValueChange, onUnitChange, disabled, placeholder, units = ["percent", "dollar"] }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input
        type="text" inputMode="decimal" value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        style={{ ...compactInputStyle, flex: 1, minWidth: 0 }}
      />
      <select
        value={unit} disabled={disabled}
        onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...compactInputStyle, width: 62, flexShrink: 0, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {units.includes("percent") && <option value="percent">%</option>}
        {units.includes("dollar") && <option value="dollar">$</option>}
      </select>
    </div>
  );
}

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
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 22, ...style }}
      />
    </div>
  );
}

// marginBottom kept tight (7px, not the 12px used elsewhere in this app)
// specifically because this calculator's main card packs 9 rows —
// at 12px the card ran noticeably taller than a typical laptop
// viewport, forcing a scroll before the Calculate button was even
// visible. Every other spacing/sizing change in this file follows the
// same "fits without scrolling" goal — no calculation logic touched.
const fieldRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 5 };

/** A label + input row, matching this calculator's own dense table-row
 * layout (label left, input right) rather than the stacked label-above-
 * input style some other calculators use — closer to the reference's
 * own compact form. */
export function FieldRow({ label, hint, children, suffix, fieldWidth = 190 }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={{ flex: `0 0 ${fieldWidth}px`, display: "flex", alignItems: "center", gap: 6 }}>
        {/* Explicit flex:1 + a real minWidth so the suffix text (which
            never shrinks) can't squeeze the input/select field down to
            an unusably narrow width — a real bug caught via a live
            screenshot where "1.5" rendered as an unreadable "1". */}
        <div style={{ flex: "1 1 auto", minWidth: 90, display: "flex" }}>{children}</div>
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0, whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
    </div>
  );
}

const tableTitleStyle = {
  fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
  background: "var(--bg-muted)", padding: "6px 10px", borderRadius: "var(--radius-sm)", marginBottom: 6,
};

/** A clean, consistently-styled results table — matches the pattern
 * already established by the Retirement/401K/Interest-Rate calculators
 * in this app. rows: [{ label, cells: [string], indent?, emphasize? }] */
export function ResultTable({ title, columns, rows }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {title && <p style={tableTitleStyle}>{title}</p>}
      <div style={{ overflowX: "auto", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          {columns && (
            <thead>
              <tr style={{ background: "var(--success)", color: "#fff" }}>
                {columns.map((col, i) => (
                  <th key={col || i} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 14px", fontWeight: 700, fontSize: 12 }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-muted)" }}>
                <td style={{
                  padding: row.indent ? "6px 14px 6px 28px" : "8px 14px",
                  color: row.indent ? "var(--text-muted)" : "var(--text-secondary)",
                  fontSize: row.indent ? 12 : 13,
                }}>
                  {row.label}
                </td>
                {row.cells.map((cell, j) => (
                  <td key={j} style={{
                    padding: row.indent ? "6px 14px" : "8px 14px",
                    textAlign: "right",
                    fontWeight: row.emphasize ? 700 : row.indent ? 500 : 600,
                    color: row.indent ? "var(--text-secondary)" : "var(--text-primary)",
                    fontSize: row.indent ? 12 : 13,
                    whiteSpace: "nowrap",
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
