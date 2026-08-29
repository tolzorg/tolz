import { exportHistoryCsv } from "../../../utils/cpsExport";

const fmt = (n) => (n === null || n === undefined ? "N/A" : n.toFixed(2));

export default function CpsHistory({ history, personalBest, mode, durationSeconds, onClearHistory, onClearBests }) {
  return (
    <div className="card" style={{ padding: 20, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
          Personal Best — {mode} / {durationSeconds}s
        </h2>
      </div>
      {personalBest ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          <BestStat label="Avg CPS" value={fmt(personalBest.averageCps)} />
          <BestStat label="Peak CPS" value={fmt(personalBest.peakCps)} />
          <BestStat label="Clicks" value={String(personalBest.clickCount)} />
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          No completed test yet for this mode/duration combination.
        </p>
      )}
      <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 12 }}>
        Personal bests are stored locally in this browser, separately for each input mode and duration.
      </p>
      {personalBest && (
        <button type="button" className="btn btn-ghost" onClick={onClearBests} style={{ marginBottom: 16 }}>
          Clear Personal Bests
        </button>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>
            Recent Tests (this session)
          </h3>
          {history.length > 0 && (
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => exportHistoryCsv(history)}>
                Export CSV
              </button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={onClearHistory}>
                Clear History
              </button>
            </div>
          )}
        </div>
        {history.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No tests yet — run one above to see it here.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Date", "Mode", "Duration", "Clicks", "Avg CPS", "Peak CPS"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-display)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td style={tdStyle}>{h.dateTime}</td>
                    <td style={tdStyle}>{h.mode}</td>
                    <td style={tdStyle}>{h.durationSeconds}s</td>
                    <td style={tdStyle}>{h.clickCount}</td>
                    <td style={tdStyle}>{fmt(h.averageCps)}</td>
                    <td style={tdStyle}>{fmt(h.peakCps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const tdStyle = { padding: "6px 8px", borderBottom: "1px solid var(--bg-muted)", color: "var(--text-secondary)" };

function BestStat({ label, value }) {
  return (
    <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: "8px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
