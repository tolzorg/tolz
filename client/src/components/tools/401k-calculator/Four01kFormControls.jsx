// Shared form controls and result-table styling for the 401K Calculator —
// adapted directly from the Retirement Calculator's own
// RetirementFormControls.jsx so both calculators share an identical $/%
// input treatment and results-table styling. See that file's comments
// for the original rationale (clearly-visible unit badges, live comma
// formatting on dollar fields to avoid mistyped/miscounted digit strings).
import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";

/** A validation warning — matches the Retirement Calculator's own yellow
 * "⚠" alert styling. */
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

export function NumberField({ label, hint, value, onChange, placeholder, suffix, fieldWidth = 130 }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={{ flex: `0 0 ${fieldWidth}px`, display: "flex", alignItems: "center", gap: 4 }}>
        <TextField value={value} onChange={(v) => onChange(stripToNumberString(v))} placeholder={placeholder} style={{ textAlign: "right" }} />
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
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

/** A compact inline Yes/No radio pair, matching the reference's own
 * "Are you employed? ⦿Yes ○No" field styling (calc2). */
export function YesNoField({ label, value, onChange, hint }) {
  return (
    <div style={{ ...fieldRow, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
        {[{ v: true, label: "Yes" }, { v: false, label: "No" }].map((opt) => (
          <label key={opt.label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="radio" checked={value === opt.v} onChange={() => onChange(opt.v)}
              style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
            />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: value === opt.v ? 700 : 500, fontSize: 13, color: value === opt.v ? "var(--accent)" : "var(--text-primary)" }}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

const tableTitleStyle = {
  fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
  background: "var(--bg-muted)", padding: "6px 10px", borderRadius: "var(--radius-sm)", marginBottom: 6,
};

/** A clean, consistently-styled results table — colored header row,
 * alternating row shading, optional indented/muted sub-rows. */
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
              <tr key={row.label} style={{ background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-muted)" }}>
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

/** A collapsible year-by-year schedule table, matching the reference's
 * own "+ Show Schedule" affordance. `columns` excludes the leading "Age"
 * column, which is always shown first. */
export function ScheduleTable({ rows, columns }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button" onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", color: "var(--accent)", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 10,
        }}
      >
        {open ? "− Hide Schedule" : "+ Show Schedule"}
      </button>
      {open && (
        <div style={{ overflowX: "auto", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", maxHeight: 420, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--success)", color: "#fff", position: "sticky", top: 0 }}>
                <th style={{ textAlign: "left", padding: "7px 12px", fontWeight: 700, fontSize: 11.5 }}>Age</th>
                {columns.map((c) => (
                  <th key={c} style={{ textAlign: "right", padding: "7px 12px", fontWeight: 700, fontSize: 11.5 }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.age} style={{ background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-muted)" }}>
                  <td style={{ padding: "6px 12px", color: "var(--text-secondary)", fontWeight: 600 }}>{row.age}</td>
                  {row.cells.map((cell, j) => (
                    <td key={j} style={{ padding: "6px 12px", textAlign: "right", color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
