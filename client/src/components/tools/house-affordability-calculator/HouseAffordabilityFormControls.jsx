// Shared form controls for the House Affordability Calculator — reuses
// the generic FieldLabel/TextField/ValueUnitField/SelectField primitives
// already shared across this app's loan-family calculators, plus a
// local comma-formatted DollarField (same convention established by the
// Retirement/401K/Amortization calculators) and a ResultTable for the
// results panels.
//
// Sizing note: every value in this file was deliberately shrunk (fonts,
// padding, gaps) as part of a compactness pass across the whole
// financial-calculator family — matching a user-supplied reference
// screenshot of the site rendered noticeably smaller/denser than the
// original build. Purely visual; no calculation logic touched.
import { FieldLabel, TextField as SharedTextField } from "../loan-calculator/LoanFormControls";

export { FieldLabel };

const COMPACT_PADDING = "6px 8px";

export function TextField({ value, onChange, disabled, placeholder, style }) {
  return <SharedTextField value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} style={{ padding: COMPACT_PADDING, fontSize: 13, ...style }} />;
}

const compactInputStyle = {
  width: "100%", padding: COMPACT_PADDING, fontSize: 13, borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)",
};

/** A local, more compact reimplementation of the shared ValueUnitField
 * (mortgage-calculator/MortgageFormControls.jsx) — same behavior and
 * "percent"/"dollar" unit convention, tighter padding only. */
export function ValueUnitField({ value, unit, onValueChange, onUnitChange, disabled, placeholder, units = ["percent", "dollar"] }) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      <input
        type="text" inputMode="decimal" value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        style={{ ...compactInputStyle, flex: 1, minWidth: 0 }}
      />
      <select
        value={unit} disabled={disabled}
        onChange={(e) => onUnitChange(e.target.value)}
        style={{ ...compactInputStyle, width: 50, flexShrink: 0, cursor: disabled ? "not-allowed" : "pointer" }}
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

// marginBottom kept tight (4px, not the 12px used elsewhere in this app)
// specifically because this calculator's main card packs 9 rows —
// at 12px the card ran noticeably taller than a typical laptop
// viewport, forcing a scroll before the Calculate button was even
// visible. Every other spacing/sizing change in this file follows the
// same "fits without scrolling, and looks compact" goal — no
// calculation logic touched.
const fieldRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 };

/** A label + input row, matching this calculator's own dense table-row
 * layout (label left, input right) rather than the stacked label-above-
 * input style some other calculators use — closer to the reference's
 * own compact form. */
export function FieldRow({ label, hint, children, suffix, fieldWidth = 168 }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={{ flex: `0 0 ${fieldWidth}px`, display: "flex", alignItems: "center", gap: 5 }}>
        {/* Explicit flex:1 + a real minWidth so the suffix text (which
            never shrinks) can't squeeze the input/select field down to
            an unusably narrow width — a real bug caught via a live
            screenshot where "1.5" rendered as an unreadable "1". */}
        <div style={{ flex: "1 1 auto", minWidth: 78, display: "flex" }}>{children}</div>
        {suffix && <span style={{ fontSize: 10.5, color: "var(--text-muted)", flexShrink: 0, whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
    </div>
  );
}

const tableTitleStyle = {
  fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)",
  background: "var(--bg-muted)", padding: "5px 9px", borderRadius: "var(--radius-sm)", marginBottom: 5,
};

/** A clean, consistently-styled results table — matches the pattern
 * already established by the Retirement/401K/Interest-Rate calculators
 * in this app. rows: [{ label, cells: [string], indent?, emphasize? }] */
export function ResultTable({ title, columns, rows }) {
  return (
    <div style={{ marginBottom: 13 }}>
      {title && <p style={tableTitleStyle}>{title}</p>}
      <div style={{ overflowX: "auto", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          {columns && (
            <thead>
              <tr style={{ background: "var(--success)", color: "#fff" }}>
                {columns.map((col, i) => (
                  <th key={col || i} style={{ textAlign: i === 0 ? "left" : "right", padding: "6px 11px", fontWeight: 700, fontSize: 10.5 }}>
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
                  padding: row.indent ? "5px 11px 5px 22px" : "6px 11px",
                  color: row.indent ? "var(--text-muted)" : "var(--text-secondary)",
                  fontSize: row.indent ? 10.5 : 11.5,
                }}>
                  {row.label}
                </td>
                {row.cells.map((cell, j) => (
                  <td key={j} style={{
                    padding: row.indent ? "5px 11px" : "6px 11px",
                    textAlign: "right",
                    fontWeight: row.emphasize ? 700 : row.indent ? 500 : 600,
                    color: row.indent ? "var(--text-secondary)" : "var(--text-primary)",
                    fontSize: row.indent ? 10.5 : 11.5,
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
