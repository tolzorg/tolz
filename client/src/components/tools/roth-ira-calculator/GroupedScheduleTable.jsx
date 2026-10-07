// Annual schedule with grouped "Start / End" column pairs under a shared
// header per account — the layout the Roth IRA and IRA Calculators'
// references both use. `groups` is a list of { label, start, end } where
// start/end are row keys; values are rendered with `formatValue`.

const cell = { padding: "6px 10px", fontSize: 13, textAlign: "right", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-secondary)" };
const headCell = { ...cell, fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", background: "var(--bg-white)", position: "sticky", top: 0 };

export default function GroupedScheduleTable({ rows, groups, formatValue, rowKey = "age", rowLabel = "Age" }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ maxHeight: 520, overflow: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <table className="data-table data-table--framed" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...headCell, textAlign: "left", verticalAlign: "bottom" }}>{rowLabel}</th>
              {groups.map((g) => (
                <th key={g.label} colSpan={2} style={{ ...headCell, textAlign: "center", whiteSpace: "normal" }}>{g.label}</th>
              ))}
            </tr>
            <tr>
              {groups.flatMap((g) => [
                <th key={`${g.label}-s`} style={{ ...headCell, top: 31 }}>Start</th>,
                <th key={`${g.label}-e`} style={{ ...headCell, top: 31 }}>End</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]}>
                <td style={{ ...cell, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" }}>{row[rowKey]}</td>
                {groups.flatMap((g) => [
                  <td key={`${g.label}-s`} style={cell}>{formatValue(row[g.start])}</td>,
                  <td key={`${g.label}-e`} style={cell}>{formatValue(row[g.end])}</td>,
                ])}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
