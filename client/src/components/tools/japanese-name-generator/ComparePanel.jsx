const GENDER_LABEL = { girl: "Girl", boy: "Boy", unisex: "Unisex" };

const ROWS = [
  { label: "Kanji", get: (r) => r.kanji },
  { label: "Hiragana", get: (r) => r.hiragana },
  { label: "Romaji", get: (r) => r.romaji },
  { label: "Type", get: (r) => (r.type === "firstName" ? "First name" : "Last name") },
  { label: "Gender", get: (r) => (r.type === "firstName" ? GENDER_LABEL[r.genderClassification] || "Unavailable" : "—") },
  { label: "Kanji count", get: (r) => r.kanjiCount },
  { label: "Mora count", get: (r) => r.moraCount },
  { label: "Meaning", get: (r) => (r.meanings || []).map((m) => m.text).join("; ") || "—" },
];

export default function ComparePanel({ compareRecords, clearCompare }) {
  if (compareRecords.length < 2) {
    return (
      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
        Select 2–5 names using the "+ Compare" button on any result to compare them here.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={clearCompare}>Clear Comparison</button>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontSize: 11.5, textTransform: "uppercase" }} />
              {compareRecords.map((r) => (
                <th key={r.id} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid var(--border)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
                  {r.kanji}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                {compareRecords.map((r) => (
                  <td key={r.id} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}>{row.get(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
