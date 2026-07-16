import { useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import {
  parseInputDate, formatShortDate, calcExactDiff, totalDays, getMilestones, getOrdinal,
} from "../../../utils/anniversaryCalc";
import { getEventTypeIcon, getEventTypeLabel } from "../../../data/anniversaryGiftData";

const STORAGE_KEY = "tolz_anniversary_saved_events_v1";

function summarize(ev, today) {
  const date = parseInputDate(ev.startDateStr);
  if (!date) return null;
  const exact = calcExactDiff(date, today);
  const days  = totalDays(date, today);
  const nextMilestone = getMilestones(date, today).find((m) => m.isNext && m.years > 0);
  return { date, exact, days, nextMilestone };
}

export default function SavedEventsPanel({ currentEvent, today, onLoad }) {
  const [savedRaw, setSaved] = useLocalStorage(STORAGE_KEY, []);
  const saved = Array.isArray(savedRaw) ? savedRaw : [];
  const [saveName, setSaveName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const canSave = Boolean(currentEvent?.startDateStr && parseInputDate(currentEvent.startDateStr));

  function handleSave() {
    if (!canSave) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventTitle: (saveName || currentEvent.eventTitle || "Anniversary").slice(0, 60),
      eventType: currentEvent.eventType,
      startDateStr: currentEvent.startDateStr,
      savedAt: Date.now(),
    };
    setSaved((prev) => [...(Array.isArray(prev) ? prev : []), entry]);
    setSaveName("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  function handleDelete(id) {
    setSaved((prev) => (Array.isArray(prev) ? prev : []).filter((e) => e.id !== id));
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setSaved([]);
    setConfirmClear(false);
  }

  return (
    <div className="card" style={{ padding: "18px 16px" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, flexWrap: "wrap", gap: 8,
      }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Saved Events {saved.length > 0 && `(${saved.length})`}
        </div>
        {saved.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearAll}
            style={{ fontSize: 12, padding: "5px 10px", color: confirmClear ? "var(--error)" : "var(--text-muted)" }}
          >
            {confirmClear ? "Confirm clear all?" : "Clear all"}
          </button>
        )}
      </div>

      {/* Save current event */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: saved.length ? 16 : 0 }}>
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value.replace(/[<>"'&]/g, "").slice(0, 60))}
          placeholder={currentEvent?.eventTitle || "Name this event…"}
          aria-label="Name to save this event as"
          disabled={!canSave}
          style={{
            flex: "1 1 180px", minWidth: 0, padding: "9px 12px",
            border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5,
            color: "var(--text-primary)", background: "var(--bg-white)", outline: "none",
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSave}
          disabled={!canSave}
          style={{
            fontSize: 13, padding: "9px 16px", flexShrink: 0,
            opacity: canSave ? 1 : 0.5, cursor: canSave ? "pointer" : "not-allowed",
            background: savedFlash ? "#f0fdf4" : undefined, color: savedFlash ? "#16a34a" : undefined,
          }}
        >
          {savedFlash ? "✓ Saved!" : "💾 Save This Event"}
        </button>
      </div>

      {/* List */}
      {saved.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>
          No saved events yet. Saved events live only in this browser (local storage) — nothing is uploaded.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {saved.map((ev) => {
            const s = summarize(ev, today);
            return (
              <div
                key={ev.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                  padding: "10px 12px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", background: "var(--bg-muted)",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true">{getEventTypeIcon(ev.eventType)}</span>
                <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
                    color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {ev.eventTitle}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                    {getEventTypeLabel(ev.eventType)} · {s ? formatShortDate(s.date) : "invalid date"}
                  </div>
                </div>
                {s && (
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {s.exact.years}y {s.exact.months}m {s.exact.days}d
                    </div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {s.days.toLocaleString()} days
                      {s.nextMilestone && ` · next: ${getOrdinal(s.nextMilestone.years)}`}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => onLoad?.(ev)}
                    aria-label={`Load ${ev.eventTitle}`}
                    style={{ fontSize: 12, padding: "5px 10px" }}
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleDelete(ev.id)}
                    aria-label={`Delete ${ev.eventTitle}`}
                    style={{ fontSize: 12, padding: "5px 10px", color: "var(--error)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
