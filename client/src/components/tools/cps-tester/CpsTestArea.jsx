// The big clicking target + live stats overlay + progress bar. Press
// feedback is pure CSS (:active scale + a border-color flash driven by
// the click-count re-render that already happens every animation
// frame) — no per-click DOM node creation, no per-click layout work
// beyond the single re-render the rAF loop already schedules.

function fmtSeconds(ms) {
  return (ms / 1000).toFixed(2);
}
function fmtCps(cps) {
  return cps === null ? "—" : cps.toFixed(2);
}

export default function CpsTestArea({ mode, snapshot, cancelMessage, onPointerDown, keyLabel }) {
  if (!snapshot) return null;
  const { status, clickCount, elapsedMs, remainingMs, liveCps, durationSeconds } = snapshot;
  const progressPct = status === "active" ? Math.min(100, (elapsedMs / (durationSeconds * 1000)) * 100) : 0;

  const isKeyboardMode = mode === "keyboard";
  const readyLabel = mode === "mouse" ? "Click Here to Start" : mode === "touch" ? "Tap Here to Start" : `Press ${keyLabel} to Start`;
  const label = status === "ready" ? readyLabel
    : status === "active" ? "Keep Going!"
    : status === "completed" ? "Test Complete!"
    : "Cancelled";

  return (
    <div>
      <div
        role="button"
        tabIndex={isKeyboardMode ? -1 : 0}
        aria-label={
          isKeyboardMode
            ? `Keyboard CPS test — press ${keyLabel} to click, focus this area is not required`
            : `CPS test click area — ${status === "ready" ? "click to start the test" : `${clickCount} clicks so far`}`
        }
        aria-live="off"
        onPointerDown={isKeyboardMode ? undefined : onPointerDown}
        onKeyDown={isKeyboardMode ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPointerDown({ pointerType: "mouse", button: 0, isTrusted: true, preventDefault() {} }); } }}
        className="cps-click-area"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
          cursor: isKeyboardMode ? "default" : "pointer",
          background: status === "cancelled" ? "var(--accent-2-light)" : status === "completed" ? "var(--success-light)" : "var(--accent-light)",
          border: `2px solid ${status === "cancelled" ? "var(--accent-2)" : status === "completed" ? "var(--success)" : "var(--accent)"}`,
          borderRadius: "var(--radius-xl)",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          textAlign: "center",
          padding: 20,
          transition: "background var(--transition), border-color var(--transition)",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(20px, 4vw, 28px)", color: "var(--text-primary)" }}>
          {label}
        </div>
        {status === "cancelled" ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 320 }}>{cancelMessage}</p>
        ) : (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(40px, 10vw, 64px)", color: "var(--accent)", lineHeight: 1 }}>
            {clickCount}
          </div>
        )}
        {status === "ready" && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Your first click starts the {durationSeconds}s timer.</p>
        )}
      </div>

      {(status === "active" || status === "completed") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
          <StatBox label="Elapsed" value={`${fmtSeconds(elapsedMs)}s`} />
          <StatBox label="Remaining" value={status === "active" ? `${fmtSeconds(remainingMs)}s` : "0.00s"} />
          <StatBox label="Live CPS" value={status === "active" ? fmtCps(liveCps) : fmtCps(snapshot.averageCps)} />
        </div>
      )}

      {status === "active" && (
        <div className="progress-track" style={{ marginTop: 10 }} role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progressPct}%`, transition: "none" }} />
        </div>
      )}

      {/* Screen-reader-only live status announcement (visually hidden, not display:none, so it's still announced) */}
      <div aria-live="polite" style={visuallyHiddenStyle}>
        {status === "completed" && `Test complete. ${clickCount} clicks, average ${fmtCps(snapshot.averageCps)} clicks per second.`}
        {status === "cancelled" && cancelMessage}
      </div>
    </div>
  );
}

const visuallyHiddenStyle = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

function StatBox({ label, value }) {
  return (
    <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: "10px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
