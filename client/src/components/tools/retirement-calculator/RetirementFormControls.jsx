// Shared form controls and result-table styling for the Retirement
// Calculator — factored out so the "$"/"%" input treatment and results
// table styling are IDENTICAL across all 4 sub-calculators.
//
// DollarField / PercentField both show their unit as a clearly-visible
// badge attached to the input itself (not small, faint, off-to-the-side
// text) — added after user feedback that the $ and % signs, and the
// digits themselves, needed to read clearly at a glance, matching the
// reference site's own crisp field styling. DollarField additionally
// live-formats digits with thousands separators as you type (state is
// still stored as a plain numeric string; only the DISPLAYED value gets
// commas) — added after a recurring real-world mistake where bare,
// unformatted digit fields ("90000" vs "9000") were easy to mistype or
// miscount against the reference's comma-formatted screenshots.
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";

/** A validation warning — e.g. "Life expectancy needs to be larger than
 * planned retirement age." — matching the reference site's own yellow
 * "⚠" alert styling. Shown instead of a computed result whenever
 * `validateRetirementAges()` (see retirementCalculatorEngine.js) returns
 * a non-null message, so an invalid age chronology is rejected rather
 * than silently "corrected" into a degenerate result. */
export function ValidationWarning({ message }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex", alignItems: "flex-start", gap: 8,
        background: "#fff8e1", border: "1px solid #f5c542", borderRadius: "var(--radius-sm)",
        padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#8a6300", lineHeight: 1.5,
      }}
    >
      <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠</span>
      <span>{message}</span>
    </div>
  );
}

const fieldRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 };
const unitBadgeStyle = {
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, pointerEvents: "none",
};

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

export function DollarField({ label, hint, value, onChange, placeholder, suffix, fieldWidth = 130 }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={{ flex: `0 0 ${fieldWidth}px`, display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <span style={{ ...unitBadgeStyle, left: 10 }}>$</span>
          <TextField
            value={formatWithCommas(value)}
            onChange={(v) => onChange(stripToNumberString(v))}
            placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
            style={{ textAlign: "right", paddingLeft: 22 }}
          />
        </div>
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

/** A "%" counterpart to DollarField — same visual weight for the unit
 * badge, same digit-only sanitizing, so $ and % fields read consistently
 * at a glance. `suffix` is for any trailing context AFTER the %, e.g.
 * "/year" ("3 %/year" becomes the "%" badge inside the box + "/year"
 * printed after it). */
export function PercentField({ label, hint, value, onChange, placeholder, suffix, fieldWidth = 130 }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={{ flex: `0 0 ${fieldWidth}px`, display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <TextField
            value={value}
            onChange={(v) => onChange(stripToNumberString(v))}
            placeholder={placeholder}
            style={{ textAlign: "right", paddingRight: 26 }}
          />
          <span style={{ ...unitBadgeStyle, right: 10 }}>%</span>
        </div>
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

const tableTitleStyle = {
  fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
  background: "var(--bg-muted)", padding: "6px 10px", borderRadius: "var(--radius-sm)", marginBottom: 6,
};

/** A clean, consistently-styled results table — colored header row,
 * alternating row shading, optional indented/muted sub-rows — used
 * everywhere a result naturally has 2+ comparable columns (e.g. "Actual
 * Amount" vs. "Today's Money") instead of hand-rolled flex rows
 * pretending to be a table.
 *
 * rows: [{ label, cells: [...values already formatted as strings],
 *          indent?: boolean (muted, smaller sub-row),
 *          emphasize?: boolean (bold value, e.g. a row total) }] */
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
                  <th
                    key={col || i}
                    style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 14px", fontWeight: 700, fontSize: 12 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={{ background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-muted)" }}>
                <td
                  style={{
                    padding: row.indent ? "6px 14px 6px 28px" : "8px 14px",
                    color: row.indent ? "var(--text-muted)" : "var(--text-secondary)",
                    fontSize: row.indent ? 12 : 13,
                  }}
                >
                  {row.label}
                </td>
                {row.cells.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: row.indent ? "6px 14px" : "8px 14px",
                      textAlign: "right",
                      fontWeight: row.emphasize ? 700 : row.indent ? 500 : 600,
                      color: row.indent ? "var(--text-secondary)" : "var(--text-primary)",
                      fontSize: row.indent ? 12 : 13,
                      whiteSpace: "nowrap",
                    }}
                  >
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
