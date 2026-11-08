// A schematic of how each RAID level lays blocks out on its disks (data, mirrored copies, parity and spare space),
// standing in for the reference's diagrams. Labels ending in p/q are parity blocks; "S" is hot-spare space.

const L = {
  0: { groups: [2], rows: [["A1", "A2"], ["A3", "A4"], ["A5", "A6"], ["A7", "A8"]] },
  1: { groups: [2], rows: [["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"]] },
  "1E": { groups: [3], rows: [["A1", "A2", "A3"], ["A3", "A1", "A2"], ["A4", "A5", "A6"], ["A6", "A4", "A5"]] },
  10: { groups: [2, 2], top: "RAID 0", sub: "RAID 1", rows: [["A1", "A1", "A2", "A2"], ["A3", "A3", "A4", "A4"], ["A5", "A5", "A6", "A6"], ["A7", "A7", "A8", "A8"]] },
  5: { groups: [3], rows: [["A1", "A2", "Ap"], ["B1", "Bp", "B2"], ["Cp", "C1", "C2"], ["D1", "D2", "Dp"]] },
  50: {
    groups: [3, 3], top: "RAID 0", sub: "RAID 5",
    rows: [["A1", "A2", "Ap", "A3", "A4", "Ap"], ["B1", "Bp", "B2", "B3", "Bp", "B4"], ["Cp", "C1", "C2", "Cp", "C3", "C4"], ["D1", "D2", "Dp", "D3", "D4", "Dp"]],
  },
  "5E": { groups: [4], rows: [["A1", "A2", "A3", "Ap"], ["B1", "B2", "Bp", "B3"], ["C1", "Cp", "C2", "C3"], ["S", "S", "S", "S"]] },
  "5EE": { groups: [4], rows: [["A1", "A2", "Ap", "S"], ["B1", "Bp", "S", "B2"], ["Cp", "S", "C1", "C2"], ["S", "D1", "D2", "Dp"]] },
  6: { groups: [4], rows: [["A1", "A2", "Ap", "Aq"], ["B1", "Bp", "Bq", "B2"], ["Cp", "Cq", "C1", "C2"], ["Dq", "D1", "D2", "Dp"]] },
  60: {
    groups: [4, 4], top: "RAID 0", sub: "RAID 6",
    rows: [
      ["A1", "A2", "Ap", "Aq", "A3", "A4", "Ap", "Aq"], ["B1", "Bp", "Bq", "B2", "B3", "Bp", "Bq", "B4"],
      ["Cp", "Cq", "C1", "C2", "Cp", "Cq", "C3", "C4"], ["Dq", "D1", "D2", "Dp", "Dq", "D3", "D4", "Dp"],
    ],
  },
};
const KIND = (label) => (label === "S" ? "spare" : /[pq]$/.test(label) ? "parity" : "data");
const FILL = { data: "var(--accent-light)", parity: "var(--warning-light)", spare: "var(--bg-muted)" };
const STROKE = { data: "var(--accent)", parity: "var(--warning)", spare: "var(--border)" };

export default function RaidDiagram({ level }) {
  const d = L[level] || L[0];
  const cols = d.rows[0].length;
  const W = 40; const GAP = 8; const GROUP_GAP = 18; const H = 22; const TOP = d.top ? 22 : 6;
  const xs = []; let x = 4;
  d.groups.forEach((g, gi) => { for (let i = 0; i < g; i++) { xs.push(x); x += W + GAP; } if (gi < d.groups.length - 1) x += GROUP_GAP - GAP; });
  const width = x - GAP + 4;
  const bodyH = d.rows.length * (H + 4) + 10;
  const height = TOP + bodyH + 18 + (d.sub ? 16 : 0);
  let start = 0;
  const groupSpans = d.groups.map((g) => { const s = start; start += g; return [xs[s], xs[s + g - 1] + W]; });
  return (
    <figure style={{ margin: "4px 0 14px", textAlign: "center" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ display: "block", margin: "0 auto", width: "100%", maxWidth: Math.min(380, width * 1.6), height: "auto" }} role="img"
        aria-label={`Block layout of ${level === "50" ? "RAID 50" : `RAID ${level}`} across ${cols} disks`}>
        {d.top && (
          <>
            <text x={width / 2} y={12} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-secondary)">{d.top}</text>
            <line x1={groupSpans[0][0] + W / 2} x2={groupSpans[groupSpans.length - 1][1] - W / 2} y1={17} y2={17} stroke="var(--border)" />
          </>
        )}
        {xs.map((cx, i) => (
          <g key={i}>
            <rect x={cx - 2} y={TOP} width={W + 4} height={bodyH} rx="7" fill="var(--bg-white)" stroke="var(--border)" />
            {d.rows.map((row, r) => {
              const kind = KIND(row[i]);
              return (
                <g key={r}>
                  <rect x={cx + 2} y={TOP + 5 + r * (H + 4)} width={W - 4} height={H} rx="3" fill={FILL[kind]} stroke={STROKE[kind]} strokeWidth="0.8" />
                  <text x={cx + W / 2} y={TOP + 5 + r * (H + 4) + H / 2 + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text-primary)">
                    {kind === "spare" ? "spare" : row[i]}
                  </text>
                </g>
              );
            })}
            <text x={cx + W / 2} y={TOP + bodyH + 12} textAnchor="middle" fontSize="8.5" fill="var(--text-muted)">Disk {i}</text>
          </g>
        ))}
        {d.sub && groupSpans.map(([a, b], gi) => (
          <text key={gi} x={(a + b) / 2} y={height - 3} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--text-secondary)">{d.sub}</text>
        ))}
      </svg>
      <figcaption style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", fontSize: 11.5, color: "var(--text-muted)" }}>
        {[["data", "Data"], ["parity", "Parity"], ["spare", "Spare"]].filter(([k]) => d.rows.flat().some((l) => KIND(l) === k)).map(([k, t]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: FILL[k], border: `1px solid ${STROKE[k]}` }} />{t}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
