import { useState, useEffect, useMemo, useRef } from "react";
import {
  parseInputDate,
  toInputDate,
  formatDate,
  formatShortDate,
  calcElapsed,
  totalDays,
  getNextAnniversary,
  getNextAnniversaryNumber,
  getCountdown,
  getMilestones,
  getAnniversaryName,
  generateIcs,
} from "../../../utils/anniversaryCalc";

// ── Helpers ───────────────────────────────────────────────────

function ordinal(n) {
  if (n <= 0) return String(n);
  const v = n % 100;
  const s = n % 10;
  if (v >= 11 && v <= 13) return `${n}th`;
  if (s === 1) return `${n}st`;
  if (s === 2) return `${n}nd`;
  if (s === 3) return `${n}rd`;
  return `${n}th`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({ value, label, sub, accent }) {
  return (
    <div className="card" style={{
      padding: "16px 10px",
      textAlign: "center",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(24px, 4vw, 36px)",
        color: accent ? "var(--accent)" : "var(--text-primary)",
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginTop: 6,
      }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 400, marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function CountdownBlock({ value, label }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 52,
      background: "var(--bg-muted)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)",
      padding: "10px 6px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "clamp(20px, 3.5vw, 28px)",
        color: "var(--accent)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10.5,
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginTop: 5,
      }}>
        {label}
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, isLast }) {
  const { label, date, completed, isToday, isNext, daysLeft } = milestone;

  let textColor = "var(--text-secondary)";
  let iconEl    = null;
  let badge     = null;

  if (isToday) {
    textColor = "#16a34a";
    iconEl    = <span style={{ fontSize: 16 }}>🎉</span>;
    badge     = (
      <span style={{
        fontSize: 11, padding: "2px 9px", borderRadius: 99,
        background: "#dcfce7", color: "#16a34a",
        fontFamily: "var(--font-display)", fontWeight: 700,
        flexShrink: 0,
      }}>
        Today!
      </span>
    );
  } else if (completed) {
    textColor = "var(--text-muted)";
    iconEl    = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7l3 3 6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  } else if (isNext) {
    textColor = "var(--accent)";
    iconEl    = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7h8M8 4l3 3-3 3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
    badge = (
      <span style={{
        fontSize: 11, padding: "2px 9px", borderRadius: 99,
        background: "var(--accent-light)", color: "var(--accent)",
        fontFamily: "var(--font-display)", fontWeight: 700,
        flexShrink: 0,
      }}>
        in {daysLeft.toLocaleString()} days
      </span>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "11px 0",
      borderBottom: isLast ? "none" : "1px solid var(--border)",
      opacity: completed ? 0.5 : 1,
    }}>
      {/* Status icon */}
      <div style={{
        width: 22,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {iconEl}
      </div>

      {/* Label */}
      <span style={{
        fontFamily: "var(--font-display)",
        fontWeight: isNext || isToday ? 700 : 500,
        fontSize: 13.5,
        color: textColor,
        flex: 1,
        textDecoration: completed ? "line-through" : "none",
      }}>
        {label}
      </span>

      {/* Date */}
      <span style={{
        fontSize: 12,
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
        fontWeight: 500,
        flexShrink: 0,
      }}>
        {formatShortDate(date)}
      </span>

      {/* Badge */}
      {badge}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

const INPUT_LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 7,
  userSelect: "none",
};

const TEXT_INPUT_BASE = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--text-primary)",
  background: "var(--bg-white)",
  outline: "none",
  transition: "border-color var(--transition), box-shadow var(--transition)",
  boxSizing: "border-box",
};

export default function AnniversaryCalculatorTool() {
  const [startDateStr, setStartDateStr] = useState("");
  const [eventName,    setEventName]    = useState("Anniversary");
  const [now,          setNow]          = useState(() => new Date());
  const [icsOk,        setIcsOk]        = useState(false);

  const icsTimer   = useRef(null);

  // ── Live clock — tick every second ────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── "Today at midnight" — only changes once per day ────────
  // Keying useMemo on the three date components (not `now` itself)
  // ensures heavy computations don't rerun every second.
  const y = now.getFullYear(), mo = now.getMonth(), dy = now.getDate();
  const todayMidnight = useMemo(() => new Date(y, mo, dy), [y, mo, dy]);

  // Max date for the date input (no future dates)
  const maxDate = useMemo(() => toInputDate(todayMidnight), [todayMidnight]);

  // ── Parsed start date ──────────────────────────────────────
  const startDate = useMemo(() => parseInputDate(startDateStr), [startDateStr]);
  const isFuture  = Boolean(startDate && startDate > todayMidnight);
  const isValid   = Boolean(startDate && !isFuture);

  // ── Computations keyed on startDate + day (not per-second) ─
  const elapsed         = useMemo(() => isValid ? calcElapsed(startDate, todayMidnight)            : null,  [startDate, todayMidnight, isValid]);
  const totalDaysCount  = useMemo(() => isValid ? totalDays(startDate, todayMidnight)               : 0,     [startDate, todayMidnight, isValid]);
  const nextAnniversary = useMemo(() => isValid ? getNextAnniversary(startDate, todayMidnight)      : null,  [startDate, todayMidnight, isValid]);
  const nextAnnivNum    = useMemo(() => isValid ? getNextAnniversaryNumber(startDate, todayMidnight) : 0,    [startDate, todayMidnight, isValid]);
  const annivName       = useMemo(() => getAnniversaryName(nextAnnivNum),                                    [nextAnnivNum]);
  const milestones      = useMemo(() => isValid ? getMilestones(startDate, todayMidnight)           : [],    [startDate, todayMidnight, isValid]);

  // ── Countdown — keyed on `now` (updates every second) ─────
  const countdown = useMemo(
    () => nextAnniversary ? getCountdown(nextAnniversary, now) : null,
    [nextAnniversary, now],
  );

  const isToday = countdown?.isToday ?? false;

  // ── Handlers ──────────────────────────────────────────────
  function handleReset() {
    setStartDateStr("");
    setEventName("Anniversary");
  }

  function handleExportIcs() {
    if (!startDate) return;
    const content = generateIcs(startDate, eventName);
    const blob    = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `${(eventName || "anniversary").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setIcsOk(true);
    clearTimeout(icsTimer.current);
    icsTimer.current = setTimeout(() => setIcsOk(false), 2000);
  }

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Input card ── */}
      <div className="card" style={{ padding: "20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Two-column inputs, wraps on mobile */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>

            {/* Start date */}
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <label style={INPUT_LBL}>Start Date</label>
              <input
                type="date"
                value={startDateStr}
                max={maxDate}
                onChange={(e) => setStartDateStr(e.target.value)}
                style={{
                  ...TEXT_INPUT_BASE,
                  borderColor: isFuture ? "var(--error)" : "var(--border)",
                  cursor: "pointer",
                }}
                onFocus={(e)  => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e)   => (e.target.style.borderColor = isFuture ? "var(--error)" : "var(--border)")}
              />
              {isFuture && (
                <p style={{
                  fontSize: 12, color: "var(--error)",
                  fontFamily: "var(--font-display)", fontWeight: 500,
                  marginTop: 5,
                }}>
                  Start date cannot be in the future.
                </p>
              )}
            </div>

            {/* Event name */}
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <label style={INPUT_LBL}>Event Name</label>
              <input
                type="text"
                value={eventName}
                maxLength={40}
                placeholder="e.g. Wedding, Together since, …"
                onChange={(e) => setEventName(e.target.value.replace(/[<>"'&]/g, "").slice(0, 40))}
                style={TEXT_INPUT_BASE}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {/* Reset */}
          {startDateStr && (
            <button
              className="btn btn-ghost"
              onClick={handleReset}
              style={{
                alignSelf: "flex-start",
                fontSize: 13,
                padding: "6px 12px",
                color: "var(--text-muted)",
              }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {isValid && (
        <>
          {/* ── Elapsed stats (4 cards) ── */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard
              value={elapsed.years}
              label="Years"
              accent={elapsed.years > 0}
            />
            <StatCard
              value={elapsed.months}
              label="Months"
            />
            <StatCard
              value={elapsed.days}
              label="Days"
            />
            <StatCard
              value={totalDaysCount.toLocaleString()}
              label="Total Days"
              sub="since start"
            />
          </div>

          {/* ── Next anniversary card ── */}
          <div className="card animate-fadeUp delay-100" style={{ padding: "20px 20px" }}>

            {isToday ? (
              /* ── Happy anniversary! ── */
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <h2 style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(17px, 4vw, 24px)",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.025em",
                  marginBottom: 6,
                }}>
                  Happy {ordinal(elapsed.years)} {eventName || "Anniversary"}!
                </h2>
                <p style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                }}>
                  {formatDate(todayMidnight)}
                </p>
                {annivName && (
                  <span style={{
                    display: "inline-block",
                    marginTop: 10,
                    padding: "4px 14px",
                    borderRadius: 99,
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}>
                    {annivName} Anniversary
                  </span>
                )}
                <div style={{ marginTop: 14 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={handleExportIcs}
                    style={{
                      fontSize: 13,
                      padding: "8px 14px",
                      background: icsOk ? "#f0fdf4" : undefined,
                      color:      icsOk ? "#16a34a" : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {icsOk ? "✓ Calendar file ready!" : "📅 Export to Calendar (.ics)"}
                  </button>
                </div>
              </div>

            ) : (
              /* ── Countdown ── */
              <>
                {/* Header row */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 11,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 4,
                    }}>
                      Next {eventName || "Anniversary"}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "clamp(15px, 3vw, 20px)",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}>
                      {ordinal(nextAnnivNum)} · {formatDate(nextAnniversary)}
                    </div>
                    {annivName && (
                      <span style={{
                        display: "inline-block",
                        marginTop: 6,
                        padding: "2px 10px",
                        borderRadius: 99,
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 12,
                      }}>
                        {annivName}
                      </span>
                    )}
                  </div>

                  <button
                    className="btn btn-ghost"
                    onClick={handleExportIcs}
                    title="Export recurring yearly event to calendar"
                    style={{
                      fontSize: 12.5,
                      padding: "7px 12px",
                      flexShrink: 0,
                      background: icsOk ? "#f0fdf4" : undefined,
                      color:      icsOk ? "#16a34a" : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {icsOk ? "✓ Saved!" : "📅 Export .ics"}
                  </button>
                </div>

                {/* Live countdown blocks */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <CountdownBlock value={countdown.days.toLocaleString()} label="days" />
                  <CountdownBlock value={pad2(countdown.hours)}           label="hours" />
                  <CountdownBlock value={pad2(countdown.minutes)}         label="min" />
                  <CountdownBlock value={pad2(countdown.seconds)}         label="sec" />
                </div>
              </>
            )}
          </div>

          {/* ── Milestones ── */}
          <div className="card animate-fadeUp delay-200" style={{ padding: "18px 20px" }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 12,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 2,
            }}>
              Milestones
            </div>

            <div>
              {milestones.map((m, i) => (
                <MilestoneRow
                  key={m.key}
                  milestone={m}
                  isLast={i === milestones.length - 1}
                />
              ))}
            </div>
          </div>

          {/* ── Info note ── */}
          <div style={{
            background: "var(--bg-muted)",
            borderRadius: "var(--radius-md)",
            padding: "11px 15px",
            fontSize: 12.5,
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            border: "1px solid var(--border)",
          }}>
            <span style={{ flexShrink: 0 }}>💡</span>
            <span>
              Countdown updates live. Traditional anniversary names (Paper, Wood, Silver…) are shown
              when the milestone has an established name.
              Export .ics to add a yearly recurring reminder to Google Calendar, Apple Calendar, or Outlook.
            </span>
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {!startDateStr && (
        <div style={{
          textAlign: "center",
          padding: "44px 20px",
          color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>💑</div>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}>
            Enter a start date to get started
          </p>
          <p style={{
            fontSize: 13,
            color: "var(--text-muted)",
            maxWidth: 340,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Anniversaries, milestones, live countdown, and traditional anniversary names — all in one place.
          </p>
        </div>
      )}
    </div>
  );
}
