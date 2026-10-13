// "Deposits and Withdrawals" column chart for the cash-flow calculator: one
// column per dated amount (the starting balance, then each deposit above the
// axis and each withdrawal below it) on a time axis, like the reference's
// own chart. A static SVG, consistent with the app's other charts.

const WIDTH = 520;
const HEIGHT = 230;
const PAD_LEFT = 58;
const PAD_RIGHT = 14;
const PAD_TOP = 30;
const PAD_BOTTOM = 30;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function niceStep(span) {
  const rough = span / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  return ([1, 2, 2.5, 5, 10].find((c) => c >= norm) ?? 10) * mag;
}

function formatAxis(value) {
  const abs = Math.abs(value);
  const trim = (x) => String(Number(x.toFixed(2)));
  if (abs >= 1e6) return `${trim(value / 1e6)}M`;
  if (abs >= 1e3) return `${trim(value / 1e3)}k`;
  return trim(value);
}

/** Month-start ticks every 1, 2, 3, 4, 6, 12… months so about 7 fit. */
function monthTicks(minT, maxT) {
  const start = new Date(minT);
  const end = new Date(maxT);
  const totalMonths = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1;
  const step = [1, 2, 3, 4, 6, 12, 24, 36, 60, 120].find((s) => totalMonths / s <= 7) ?? 240;
  const ticks = [];
  let y = start.getUTCFullYear();
  let m = Math.ceil(start.getUTCMonth() / step) * step;
  for (;;) {
    while (m >= 12) { m -= 12; y += 1; }
    const t = Date.UTC(y, m, 1);
    if (t > maxT) break;
    if (t >= minT) ticks.push({ t, label: `${MONTHS[m]} '${String(y).slice(-2)}` });
    m += step;
  }
  return ticks;
}

export default function CashFlowColumnChart({ points }) {
  if (!points?.length) return null;
  const times = points.map((p) => p.date);
  const pad = Math.max(15 * 86400000, (Math.max(...times) - Math.min(...times)) * 0.04);
  const minT = Math.min(...times) - pad;
  const maxT = Math.max(...times) + pad;
  const maxV = Math.max(0, ...points.map((p) => p.amount));
  const minV = Math.min(0, ...points.map((p) => p.amount));
  const step = niceStep(Math.max(1, maxV - minV));
  const top = Math.ceil(maxV / step) * step || step;
  const bottom = Math.floor(minV / step) * step;
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const x = (t) => PAD_LEFT + ((t - minT) / (maxT - minT)) * plotW;
  const y = (v) => PAD_TOP + ((top - v) / (top - bottom)) * plotH;
  const barW = Math.max(3, Math.min(34, (plotW / Math.max(points.length, 1)) * 0.5));
  const yTicks = [];
  for (let v = bottom; v <= top + step / 2; v += step) yTicks.push(v);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 560, display: "block", margin: "0 auto" }} role="img" aria-label="Deposits and withdrawals over time">
      <text x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2} y={16} fontSize="12" fill="var(--text-primary)" textAnchor="middle">Deposits and Withdrawals</text>
      <text x={12} y={PAD_TOP + plotH / 2} fontSize="10" fill="var(--text-muted)" textAnchor="middle" transform={`rotate(-90 12 ${PAD_TOP + plotH / 2})`}>Amount ($)</text>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD_LEFT} y1={y(v)} x2={WIDTH - PAD_RIGHT} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
          <text x={PAD_LEFT - 6} y={y(v)} fontSize="9.5" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">{formatAxis(v)}</text>
        </g>
      ))}
      {monthTicks(minT, maxT).map((tick) => (
        <text key={tick.t} x={x(tick.t)} y={HEIGHT - 10} fontSize="9.5" fill="var(--text-muted)" textAnchor="middle">{tick.label}</text>
      ))}
      <line x1={PAD_LEFT} y1={y(0)} x2={WIDTH - PAD_RIGHT} y2={y(0)} stroke="var(--text-muted)" strokeWidth="0.7" />
      {points.map((p, i) => (
        <rect
          key={i}
          x={x(p.date) - barW / 2}
          y={Math.min(y(p.amount), y(0))}
          width={barW}
          height={Math.abs(y(p.amount) - y(0))}
          fill="#2b7ddb"
        >
          <title>{`${new Date(p.date).toISOString().slice(0, 10)}: $${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</title>
        </rect>
      ))}
    </svg>
  );
}
