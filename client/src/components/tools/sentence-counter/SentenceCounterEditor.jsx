import { useCallback, useEffect, useRef, useState } from "react";

// Renders text.slice(0, len) split into segments so overlapping highlight
// ranges (search matches, active/hover sentence) can be combined and drawn
// as nested <mark> spans in the invisible backdrop layer.
function buildSegments(text, ranges) {
  if (!ranges.length) return [{ text, types: [] }];
  const points = new Set([0, text.length]);
  for (const r of ranges) {
    points.add(Math.max(0, Math.min(r.start, text.length)));
    points.add(Math.max(0, Math.min(r.end, text.length)));
  }
  const sorted = Array.from(points).sort((a, b) => a - b);
  const segments = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (start >= end) continue;
    const types = ranges.filter((r) => r.start <= start && r.end >= end).map((r) => r.type);
    segments.push({ text: text.slice(start, end), types, start, end });
  }
  return segments;
}

function segmentStyle(types) {
  const isActive = types.includes("active");
  const isSearch = types.includes("search");
  if (isActive && isSearch) {
    return { background: "rgba(250, 204, 21, 0.55)", boxShadow: "inset 0 -2px 0 var(--accent)", borderRadius: 2 };
  }
  if (isActive) {
    return { background: "rgba(59, 123, 252, 0.18)", boxShadow: "inset 0 -2px 0 var(--accent)", borderRadius: 2 };
  }
  if (isSearch) {
    return { background: "rgba(250, 204, 21, 0.45)", borderRadius: 2 };
  }
  return null;
}

const sharedFontStyle = {
  fontFamily: "var(--font-body)",
  fontSize: 15,
  lineHeight: 1.7,
  padding: "16px 18px",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  letterSpacing: "normal",
  boxSizing: "border-box",
};

export default function SentenceCounterEditor({
  text,
  onChange,
  highlightRanges = [],
  activeSpanKey,
  placeholder = "Start typing, paste text, or drop a .txt file…",
}) {
  const wrapperRef = useRef(null);
  const backdropRef = useRef(null);
  const textareaRef = useRef(null);
  const activeSpanRef = useRef(null);
  const syncingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  const syncScroll = useCallback((from, to) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    to.scrollTop = from.scrollTop;
    to.scrollLeft = from.scrollLeft;
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  useEffect(() => {
    if (activeSpanRef.current) {
      activeSpanRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
      const ta = textareaRef.current;
      const bd = backdropRef.current;
      if (ta && bd) {
        const id = setTimeout(() => syncScroll(bd, ta), 260);
        return () => clearTimeout(id);
      }
    }
  }, [activeSpanKey, syncScroll]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (--dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback((e) => {
    setDragging(false); dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    // Only intercept real file drops — a plain in-editor text drag (native
    // textarea behavior for repositioning a selection) has no files and
    // should fall through to the browser's default handling.
    if (!file) return;
    e.preventDefault(); e.stopPropagation();
    onChange({ file });
  }, [onChange]);

  const segments = buildSegments(text, highlightRanges);
  let activeAssigned = false;

  return (
    <div
      ref={wrapperRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: "relative",
        border: `1.5px solid ${dragging ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        background: dragging ? "var(--accent-light)" : "var(--bg-white)",
        transition: "border-color var(--transition), background var(--transition)",
        overflow: "hidden",
      }}
    >
      <div
        ref={backdropRef}
        aria-hidden="true"
        style={{
          ...sharedFontStyle,
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          color: "var(--text-primary)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {text ? (
          segments.map((seg, i) => {
            const style = segmentStyle(seg.types);
            const isActive = seg.types.includes("active") && !activeAssigned;
            if (isActive) activeAssigned = true;
            return (
              <mark
                key={i}
                ref={isActive ? activeSpanRef : null}
                style={style || { background: "transparent", color: "inherit" }}
              >
                {seg.text}
              </mark>
            );
          })
        ) : (
          <span style={{ color: "var(--text-muted)" }}>{placeholder}</span>
        )}
        {"\n"}
      </div>
      <textarea
        ref={textareaRef}
        className="input"
        value={text}
        onChange={(e) => onChange({ text: e.target.value })}
        onScroll={(e) => {
          if (backdropRef.current) syncScroll(e.target, backdropRef.current);
        }}
        spellCheck
        aria-label="Text to analyze"
        style={{
          ...sharedFontStyle,
          position: "relative",
          zIndex: 1,
          display: "block",
          width: "100%",
          minHeight: 320,
          maxHeight: 620,
          resize: "vertical",
          border: "none",
          borderRadius: 0,
          background: "transparent",
          color: "transparent",
          caretColor: "var(--text-primary)",
          outline: "none",
          overflowY: "auto",
        }}
      />
    </div>
  );
}
