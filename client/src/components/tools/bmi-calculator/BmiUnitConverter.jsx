import { useState } from "react";
import { UNIT_CATEGORIES, convert, formatResult, safeParseFloat } from "../../../utils/unitConverter";

// The "Other Units" panel: a small From/To converter over the site's shared
// unit engine (the Unit Converter tool's), limited to the reference's five
// categories.
const CATEGORIES = ["length", "temperature", "area", "volume", "weight"].map((id) => UNIT_CATEGORIES.find((c) => c.id === id));

const listStyle = {
  width: "100%", fontSize: 13, padding: 2, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
  background: "var(--bg-white)", color: "var(--text-primary)",
};
const boxStyle = {
  width: "100%", boxSizing: "border-box", padding: "6px 8px", fontSize: 13.5, border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", marginBottom: 6,
};

export default function BmiUnitConverter() {
  const [catId, setCatId] = useState("length");
  const cat = CATEGORIES.find((c) => c.id === catId);
  const [from, setFrom] = useState(cat.defaultFrom);
  const [to, setTo] = useState(cat.defaultTo);
  const [value, setValue] = useState("");

  const pickCategory = (next) => {
    const c = CATEGORIES.find((x) => x.id === next);
    setCatId(next); setFrom(c.defaultFrom); setTo(c.defaultTo); setValue("");
  };
  const n = safeParseFloat(value.replace(/,/g, ""));
  const output = Number.isNaN(n) ? "" : formatResult(convert(n, from, to, catId));

  return (
    <div className="card" style={{ padding: 16, background: "var(--accent-light)" }}>
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 10px" }}>
        Use this converter to convert to the unit accepted by the calculator.
      </p>
      <div role="group" aria-label="Unit type" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id} type="button" aria-pressed={c.id === catId} onClick={() => pickCategory(c.id)}
            style={{
              padding: "5px 10px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: c.id === catId ? "var(--accent)" : "var(--bg-white)",
              color: c.id === catId ? "#fff" : "var(--text-primary)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
          <span style={{ display: "block" }}>From:</span>
          <input type="text" inputMode="decimal" aria-label="Value to convert" value={value} onChange={(e) => setValue(e.target.value)} style={{ ...boxStyle, marginTop: 4, background: "var(--bg-white)" }} />
          <select size={5} value={from} onChange={(e) => setFrom(e.target.value)} style={listStyle} aria-label="From unit">
            {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
        <div style={{ flex: "1 1 200px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
          <span style={{ display: "block" }}>To:</span>
          <input type="text" readOnly aria-label="Converted value" value={output} style={{ ...boxStyle, marginTop: 4, background: "var(--bg-muted)" }} aria-live="polite" />
          <select size={5} value={to} onChange={(e) => setTo(e.target.value)} style={listStyle} aria-label="To unit">
            {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
