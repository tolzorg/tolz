import { useEffect, useRef, useMemo, useCallback } from "react";
import { renderCrop } from "../../../hooks/useIdPhotoEditor";

const FONT = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

function IconBtn({ onClick, title, children, active = false }) {
  return (
    <button type="button" onClick={onClick} title={title} style={{
      width: 36, height: 36, borderRadius: RADIUS, display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid ${active ? "var(--accent)" : BORDER}`,
      background: active ? "var(--accent-light)" : "var(--bg-white)",
      color: active ? "var(--accent)" : "var(--text-primary)",
      cursor: "pointer", fontSize: 15, flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

// Non-destructive crop/zoom/pan/rotate/flip editor. Renders the exact same
// `renderCrop` composite used for final export, so preview === output.
export default function PhotoEditorCanvas({
  sourceCanvas, transform, aspectRatio,
  onPan, onZoom, onRotateBy, onSetRotation, onToggleFlipH, onToggleFlipV,
  onResetOriginal, onResetTemplateFraming,
}) {
  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const displaySize = useMemo(() => {
    const w = 320;
    const h = aspectRatio ? Math.min(420, Math.round(w / aspectRatio)) : w;
    return { w, h };
  }, [aspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize.w * dpr;
    canvas.height = displaySize.h * dpr;
    canvas.style.width = `${displaySize.w}px`;
    canvas.style.height = `${displaySize.h}px`;

    const composite = renderCrop(sourceCanvas, canvas.width, canvas.height, transform);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(composite, 0, 0);
  }, [sourceCanvas, transform, displaySize]);

  const handlePointerDown = useCallback((e) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: transform.panX, panY: transform.panY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [transform.panX, transform.panY]);

  const handlePointerMove = useCallback((e) => {
    if (!dragState.current) return;
    const dx = (e.clientX - dragState.current.startX) / displaySize.w;
    const dy = (e.clientY - dragState.current.startY) / displaySize.h;
    onPan(dragState.current.panX + dx, dragState.current.panY + dy);
  }, [displaySize, onPan]);

  const handlePointerUp = useCallback(() => { dragState.current = null; }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    onZoom(transform.zoom + delta);
  }, [transform.zoom, onZoom]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
          cursor: "grab", touchAction: "none", background: "#00000008",
        }}>
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            style={{ display: "block" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", width: 44 }}>Zoom</span>
        <input
          type="range" min="0.2" max="4" step="0.01" value={transform.zoom}
          onChange={(e) => onZoom(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "var(--accent)" }}
        />
        <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", width: 42, textAlign: "right" }}>
          {Math.round(transform.zoom * 100)}%
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", width: 44 }}>Rotate</span>
        <input
          type="range" min="0" max="360" step="1" value={transform.rotationDeg}
          onChange={(e) => onSetRotation(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "var(--accent)" }}
        />
        <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", width: 42, textAlign: "right" }}>
          {Math.round(transform.rotationDeg)}°
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <IconBtn title="Rotate -15°" onClick={() => onRotateBy(-15)}>↺</IconBtn>
        <IconBtn title="Rotate +15°" onClick={() => onRotateBy(15)}>↻</IconBtn>
        <IconBtn title="Flip horizontal" active={transform.flipH} onClick={onToggleFlipH}>⇋</IconBtn>
        <IconBtn title="Flip vertical" active={transform.flipV} onClick={onToggleFlipV}>⇵</IconBtn>
        <button type="button" onClick={onResetTemplateFraming} style={{
          padding: "0 14px", height: 36, borderRadius: RADIUS, border: `1.5px solid ${BORDER}`,
          background: "var(--bg-white)", color: "var(--text-primary)", fontFamily: FONT, fontSize: 12.5,
          fontWeight: 600, cursor: "pointer",
        }}>
          Reset framing
        </button>
        <button type="button" onClick={onResetOriginal} style={{
          padding: "0 14px", height: 36, borderRadius: RADIUS, border: `1.5px solid ${BORDER}`,
          background: "var(--bg-white)", color: "var(--text-muted)", fontFamily: FONT, fontSize: 12.5,
          fontWeight: 600, cursor: "pointer",
        }}>
          Reset to original
        </button>
      </div>
    </div>
  );
}
