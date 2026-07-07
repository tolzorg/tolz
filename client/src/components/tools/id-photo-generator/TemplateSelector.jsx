import { useMemo, useState } from "react";
import {
  TEMPLATE_CATEGORIES, ID_PHOTO_TEMPLATES, COMPLIANCE_DISCLAIMER, isOfficialTemplate,
} from "../../../data/idPhotoTemplates";

const FONT = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

export default function TemplateSelector({ selectedTemplate, onSelect }) {
  const [category, setCategory] = useState(TEMPLATE_CATEGORIES[0].id);
  const [country, setCountry] = useState("all");

  const countries = useMemo(() => {
    const set = new Set(ID_PHOTO_TEMPLATES.filter((t) => t.category === category).map((t) => t.country));
    return ["all", ...Array.from(set).sort()];
  }, [category]);

  const templates = useMemo(() => {
    return ID_PHOTO_TEMPLATES.filter((t) => t.category === category && (country === "all" || t.country === country));
  }, [category, country]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setCategory(c.id); setCountry("all"); }}
            style={{
              padding: "7px 14px", borderRadius: 99,
              border: `1.5px solid ${category === c.id ? "var(--accent)" : BORDER}`,
              background: category === c.id ? "var(--accent-light)" : "var(--bg-white)",
              color: category === c.id ? "var(--accent)" : "var(--text-primary)",
              fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{
          padding: "9px 12px", borderRadius: RADIUS, border: `1.5px solid ${BORDER}`,
          background: "var(--bg-white)", color: "var(--text-primary)",
          fontFamily: FONT, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        }}
      >
        {countries.map((c) => <option key={c} value={c}>{c === "all" ? "All countries" : c}</option>)}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {templates.map((t) => {
          const selected = selectedTemplate?.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              style={{
                textAlign: "left", padding: "12px 14px", borderRadius: RADIUS,
                border: `1.5px solid ${selected ? "var(--accent)" : BORDER}`,
                background: selected ? "var(--accent-light)" : "var(--bg-white)",
                cursor: "pointer", display: "flex", flexDirection: "column", gap: 4,
              }}
            >
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: selected ? "var(--accent)" : "var(--text-primary)" }}>
                {t.name}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)" }}>
                {t.widthMM} × {t.heightMM} mm · {t.country}
              </span>
            </button>
          );
        })}
        {templates.length === 0 && (
          <p style={{ fontFamily: FONT, fontSize: 13, color: "var(--text-muted)", gridColumn: "1 / -1" }}>
            No templates in this category/country combination yet.
          </p>
        )}
      </div>

      {isOfficialTemplate(selectedTemplate) && (
        <div style={{
          display: "flex", gap: 8, padding: "10px 14px", borderRadius: RADIUS,
          background: "var(--warning-light)", border: "1px solid var(--warning)",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>ⓘ</span>
          <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
            {COMPLIANCE_DISCLAIMER}
            {selectedTemplate?.authority && (
              <> Source: <strong>{selectedTemplate.authority}</strong>{selectedTemplate.specificationUrl ? " — " : ""}
                {selectedTemplate.specificationUrl && (
                  <a href={selectedTemplate.specificationUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                    official guidance
                  </a>
                )}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
