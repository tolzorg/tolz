import { useEffect, useRef, useState } from "react";
import { zoneGeometryMM } from "../../../utils/mmPxConversion";

const FONT = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

// Renders the full print sheet at a scaled-down display size: paper outline,
// printable-area boundary, each photo cell (using the actual edited photo),
// and toggleable safe/cut/bleed zone guides. This is a visual approximation
// for on-screen review — the real mm-accurate layout is produced at export.
export default function SheetPreview({ layout, photoCanvas, showSafeZone, showCutZone, showBleedZone, safeMM, bleedMM }) {
  const canvasRef = useRef(null);
  const [displayWidth] = useState(360);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;

    const scale = displayWidth / layout.paperWidthMM;
    const displayHeight = Math.round(layout.paperHeightMM * scale);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext("2d");
    const s = scale * dpr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Printable area boundary
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(
      layout.marginMM * s, layout.marginMM * s,
      layout.printable.width * s, layout.printable.height * s,
    );
    ctx.setLineDash([]);

    // Cells
    for (const cell of layout.cells) {
      const x = cell.x * s;
      const y = cell.y * s;
      const w = layout.cellWidthMM * s;
      const h = layout.cellHeightMM * s;

      if (photoCanvas) {
        ctx.save();
        if (layout.orientationDeg === 90) {
          ctx.translate(x + w, y);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(photoCanvas, 0, 0, h, w);
        } else {
          ctx.drawImage(photoCanvas, x, y, w, h);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(x, y, w, h);
      }

      const zones = zoneGeometryMM(layout.cellWidthMM, layout.cellHeightMM, { safeMM, bleedMM });

      if (showBleedZone && bleedMM > 0) {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + zones.bleed.x * s, y + zones.bleed.y * s, zones.bleed.width * s, zones.bleed.height * s);
      }
      if (showCutZone) {
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
      if (showSafeZone) {
        ctx.strokeStyle = "#3b7bfc";
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(x + zones.safe.x * s, y + zones.safe.y * s, zones.safe.width * s, zones.safe.height * s);
        ctx.setLineDash([]);
      }
    }
  }, [layout, photoCanvas, showSafeZone, showCutZone, showBleedZone, safeMM, bleedMM, displayWidth]);

  if (!layout) {
    return (
      <p style={{ fontFamily: FONT, fontSize: 13, color: "var(--text-muted)" }}>
        Choose a paper size and template to preview the print sheet.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 12, background: "var(--bg-muted)", borderRadius: RADIUS, border: `1px solid ${BORDER}` }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
