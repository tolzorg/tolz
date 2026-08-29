import { useEffect, useRef } from "react";
import { computeRollingCpsAt } from "../../../utils/cpsEngine";
import { ROLLING_WINDOW_MS } from "../../../utils/cpsConfig";

// Lightweight click-rate graph — Time vs rolling 1-second CPS, using
// the EXACT same window definition as Peak CPS (computeRollingCpsAt),
// never a separate bucket-based definition (spec Section 19). Samples
// at a fixed visual cadence rather than one point per click, and never
// mutates the underlying click timestamps it reads.
const SAMPLE_COUNT = 60;

export default function CpsChart({ timestamps, elapsedMs }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !timestamps || timestamps.length === 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // The first recorded click is always the test's start timestamp
    // (Section 1) — no separate startTime field needed.
    const startTime = timestamps[0];
    const span = Math.max(elapsedMs, 1);
    const points = [];
    for (let i = 0; i <= SAMPLE_COUNT; i++) {
      const t = startTime + (span * i) / SAMPLE_COUNT;
      points.push(computeRollingCpsAt(timestamps, t));
    }
    const maxVal = Math.max(1, ...points);

    ctx.strokeStyle = "#3b7bfc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((v, i) => {
      const x = (i / SAMPLE_COUNT) * w;
      const y = h - (v / maxVal) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "rgba(59,123,252,0.12)";
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }, [timestamps, elapsedMs]);

  if (!timestamps || timestamps.length < 2) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
        Click Rate Over Time (rolling {ROLLING_WINDOW_MS / 1000}s window)
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 80, display: "block", borderRadius: "var(--radius-md)", background: "var(--bg-muted)" }} />
    </div>
  );
}
