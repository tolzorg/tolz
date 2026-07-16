import { useState, useEffect, useMemo, useRef } from "react";
import {
  parseInputDate, toInputDate, formatDate, formatShortDate, formatByPattern, formatTime,
  getWeekdayName, validateDate, calcExactDiff, daysToWeeksAndDays, totalDays,
  getNextAnniversary, getPreviousAnniversary, getNextAnniversaryNumber, getPreviousAnniversaryNumber,
  getFullCountdown, getElapsedSincePrevious, getProgressPercent, getWorkingDays,
  getMilestones, getOrdinal, getZodiacSign, getMoonPhase, getFunFacts, generateShareText,
  generateIcs,
} from "../../../utils/anniversaryCalc";
import { EVENT_TYPES, getEventTypeLabel, getEventTypeIcon, getGiftInfo } from "../../../data/anniversaryGiftData";
import AnniversaryTimeline from "./AnniversaryTimeline";
import SavedEventsPanel from "./SavedEventsPanel";

// ── Constants ─────────────────────────────────────────────────

const CALC_MODES = [
  { id: "since",  label: "Since Date",         hint: "Elapsed time from the start date to today (or a custom reference date)." },
  { id: "between", label: "Between Two Dates", hint: "Exact difference between two specific dates." },
  { id: "next",   label: "Next Anniversary",   hint: "Highlights the upcoming anniversary and its countdown." },
  { id: "past",   label: "Past Anniversary",   hint: "Highlights the most recent anniversary and time since." },
];

const LEAP_MODES = [
  { id: "auto",  label: "Automatic (Feb 28)" },
  { id: "feb28", label: "Always Feb 28" },
  { id: "mar1",  label: "Always Mar 1" },
];

const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

// ── Shared style tokens (matches existing tool conventions) ────

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

const SECTION_TITLE = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 12,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 10,
};

// ── Small local hooks ────────────────────────────────────────

// Tracks "today at midnight", only re-rendering consumers when the
// calendar day actually changes (checked once a minute) — avoids a
// per-second re-render cascade for calculations that don't need it.
function useTodayMidnight() {
  const [today, setToday] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      setToday((prev) => (prev.getTime() === midnight.getTime() ? prev : midnight));
    }, 60000);
    return () => clearInterval(id);
  }, []);
  return today;
}

// ── Local sub-components ────────────────────────────────────────

function Field({ label, children, error, htmlFor }) {
  return (
    <div style={{ flex: "1 1 180px", minWidth: 0 }}>
      <label htmlFor={htmlFor} style={INPUT_LBL}>{label}</label>
      {children}
      {error && (
        <p role="alert" style={{
          fontSize: 12, color: "var(--error)", fontFamily: "var(--font-display)",
          fontWeight: 500, marginTop: 5,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

function EventTypeSelector({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Event type" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {EVENT_TYPES.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 99,
              border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
              background: active ? "var(--accent-light)" : "var(--bg-white)",
              color: active ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5,
              cursor: "pointer", transition: "all var(--transition)",
            }}
          >
            <span aria-hidden="true">{t.icon}</span>{t.label}
          </button>
        );
      })}
    </div>
  );
}

// Longer numbers (e.g. "112,277,760" total seconds) need a smaller font so
// they don't overflow the card — scale down by digit count instead of a
// single fixed clamp.
function statValueFontSize(value) {
  const len = String(value).length;
  if (len <= 6)  return "clamp(22px, 4vw, 34px)";
  if (len <= 9)  return "clamp(17px, 3.1vw, 25px)";
  return "clamp(14px, 2.4vw, 19px)";
}

// Colorful variant used only in the Statistics section — distinct hue per
// metric so weekdays/weekends/holidays/facts read at a glance.
const STAT_COLOR_THEMES = {
  blue:   { bg: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "#bfdbfe", text: "#1d4ed8", label: "#3b82f6" },
  pink:   { bg: "linear-gradient(135deg, #fdf2f8, #fce7f3)", border: "#fbcfe8", text: "#be185d", label: "#ec4899" },
  amber:  { bg: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "#fde68a", text: "#b45309", label: "#d97706" },
  purple: { bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "#ddd6fe", text: "#6d28d9", label: "#8b5cf6" },
  teal:   { bg: "linear-gradient(135deg, #f0fdfa, #ccfbf1)", border: "#99f6e4", text: "#0f766e", label: "#14b8a6" },
  indigo: { bg: "linear-gradient(135deg, #eef2ff, #e0e7ff)", border: "#c7d2fe", text: "#4338ca", label: "#6366f1" },
};

function ColorStatCard({ value, label, theme = "blue" }) {
  const c = STAT_COLOR_THEMES[theme];
  return (
    <div style={{
      padding: "16px 10px", textAlign: "center", flex: 1, minWidth: 0,
      borderRadius: "var(--radius-md)", background: c.bg, border: `1.5px solid ${c.border}`,
    }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 800,
        fontSize: statValueFontSize(value),
        color: c.text, letterSpacing: "-0.03em", lineHeight: 1.05,
        fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11, color: c.label, fontFamily: "var(--font-display)",
        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, accent }) {
  return (
    <div className="card" style={{ padding: "16px 10px", textAlign: "center", flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 800,
        fontSize: statValueFontSize(value),
        color: accent ? "var(--accent)" : "var(--text-primary)",
        letterSpacing: "-0.03em", lineHeight: 1.05, fontVariantNumeric: "tabular-nums",
        overflowWrap: "anywhere",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)",
        fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 6,
      }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 400, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ProgressRing({ percent, size = 76 }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${percent}% complete toward next anniversary`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size * 0.22, fill: "var(--text-primary)" }}>
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

function CountdownBlock({ value, label }) {
  return (
    <div style={{
      flex: 1, minWidth: 50, background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)", padding: "9px 5px", textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(16px, 3vw, 22px)",
        color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 9.5, color: "var(--text-muted)", fontFamily: "var(--font-display)",
        fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

function pad2(n) { return String(n).padStart(2, "0"); }

// Live, self-ticking countdown — isolated so its per-second updates don't
// re-render the rest of the results dashboard.
function LiveCountdown({ targetDate }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const cd = useMemo(() => getFullCountdown(targetDate, now), [targetDate, now]);

  if (cd.isToday) {
    return (
      <div style={{ textAlign: "center", padding: "6px 0" }}>
        <div style={{ fontSize: 32 }} aria-hidden="true">🎉</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
          It's today!
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} aria-label={
      `${cd.years} years, ${cd.months} months, ${cd.weeks} weeks, ${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes remaining`
    }>
      {cd.years > 0 && <CountdownBlock value={cd.years} label="yrs" />}
      {(cd.years > 0 || cd.months > 0) && <CountdownBlock value={cd.months} label="mo" />}
      {(cd.years > 0 || cd.months > 0 || cd.weeks > 0) && <CountdownBlock value={cd.weeks} label="wk" />}
      <CountdownBlock value={cd.days} label="days" />
      <CountdownBlock value={pad2(cd.hours)} label="hrs" />
      <CountdownBlock value={pad2(cd.minutes)} label="min" />
      <CountdownBlock value={pad2(cd.seconds)} label="sec" />
    </div>
  );
}

// Live "total seconds together" ticker — isolated for the same reason as
// LiveCountdown. Falls back to a static value when `live` is false (e.g.
// "Between Two Dates" mode, where the span is a fixed historical range).
function LiveTotals({ startDate, endDate, live }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [live]);

  const reference = live ? now : endDate;
  const ms = Math.max(0, reference - startDate);
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours   = Math.floor(totalMinutes / 60);

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <StatCard value={totalHours.toLocaleString()} label="Total Hours" />
      <StatCard value={totalMinutes.toLocaleString()} label="Total Minutes" />
      <StatCard value={totalSeconds.toLocaleString()} label="Total Seconds" sub={live ? "updating live" : undefined} />
    </div>
  );
}

function MilestoneRow({ milestone, isLast }) {
  const { label, date, completed, isToday, isNext, isMajor, giftName, daysLeft } = milestone;

  let textColor = "var(--text-secondary)";
  let iconEl = null;
  let badge = null;

  if (isToday) {
    textColor = "#16a34a";
    iconEl = <span style={{ fontSize: 16 }} aria-hidden="true">🎉</span>;
    badge = (
      <span style={{
        fontSize: 11, padding: "2px 9px", borderRadius: 99, background: "#dcfce7", color: "#16a34a",
        fontFamily: "var(--font-display)", fontWeight: 700, flexShrink: 0,
      }}>
        Today!
      </span>
    );
  } else if (completed) {
    textColor = "var(--text-muted)";
    iconEl = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2.5 7l3 3 6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  } else if (isNext) {
    textColor = "var(--accent)";
    iconEl = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 7h8M8 4l3 3-3 3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
    badge = (
      <span style={{
        fontSize: 11, padding: "2px 9px", borderRadius: 99, background: "var(--accent-light)", color: "var(--accent)",
        fontFamily: "var(--font-display)", fontWeight: 700, flexShrink: 0,
      }}>
        in {daysLeft.toLocaleString()} days
      </span>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "11px 0",
      borderBottom: isLast ? "none" : "1px solid var(--border)", opacity: completed ? 0.5 : 1,
    }}>
      <div style={{ width: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {iconEl}
      </div>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: isNext || isToday ? 700 : 500, fontSize: 13.5,
        color: textColor, flex: 1, textDecoration: completed ? "line-through" : "none",
      }}>
        {label}
        {isMajor && giftName && (
          <span style={{
            marginLeft: 8, fontSize: 10.5, fontWeight: 700, color: "#a16207",
            background: "#fff7e6", border: "1px solid #f5d989", borderRadius: 99, padding: "1px 8px",
          }}>
            {giftName}
          </span>
        )}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, flexShrink: 0 }}>
        {formatShortDate(date)}
      </span>
      {badge}
    </div>
  );
}

function GiftInfoCard({ gift, ordinal }) {
  if (!gift) return null;
  const rows = [
    ["Traditional Gift", gift.traditional],
    ["Modern Gift", gift.modern],
    ["Gemstone", gift.gemstone],
    ["Flower", gift.flower],
    ["Color", gift.color],
  ];
  return (
    <div className="card" style={{ padding: "18px 16px" }}>
      <div style={SECTION_TITLE}>
        {getOrdinal(gift.anniversaryYear)} Anniversary Gifts {!gift.exact && ordinal && `(based on year ${gift.anniversaryYear})`}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        {rows.map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, marginTop: 2 }}>
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({
  open, onToggle, dateFormat, setDateFormat, timeFormat, setTimeFormat,
  leapYearMode, setLeapYearMode, holidaysText, setHolidaysText, referenceDateStr, setReferenceDateStr,
  showReferenceDate, maxDate,
}) {
  const [timezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "Local time"; }
  });
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    if (!open) return undefined;
    const id = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(id);
  }, [open]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
          ⚙️ Advanced Settings
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{
          transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }}>
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="Date Format" htmlFor="anniv-date-format">
              <select
                id="anniv-date-format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                style={{ ...TEXT_INPUT_BASE, cursor: "pointer" }}
              >
                {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Time Format" htmlFor="anniv-time-format">
              <select
                id="anniv-time-format"
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                style={{ ...TEXT_INPUT_BASE, cursor: "pointer" }}
              >
                <option value="12">12-hour</option>
                <option value="24">24-hour</option>
              </select>
            </Field>
          </div>

          <Field label="Feb 29 (Leap Year) Anniversary" htmlFor="anniv-leap-mode">
            <select
              id="anniv-leap-mode"
              value={leapYearMode}
              onChange={(e) => setLeapYearMode(e.target.value)}
              style={{ ...TEXT_INPUT_BASE, cursor: "pointer" }}
            >
              {LEAP_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </Field>

          {showReferenceDate && (
            <Field label="Custom Reference Date (optional)" htmlFor="anniv-reference-date">
              <input
                id="anniv-reference-date"
                type="date"
                value={referenceDateStr}
                max={maxDate}
                onChange={(e) => setReferenceDateStr(e.target.value)}
                style={{ ...TEXT_INPUT_BASE, cursor: "pointer" }}
              />
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 5 }}>
                Leave blank to use today's date as the reference point.
              </p>
            </Field>
          )}

          <Field label="Exclude Holidays (working-days count, one date per line, YYYY-MM-DD)" htmlFor="anniv-holidays">
            <textarea
              id="anniv-holidays"
              value={holidaysText}
              onChange={(e) => setHolidaysText(e.target.value.slice(0, 2000))}
              rows={3}
              placeholder={"2026-01-01\n2026-12-25"}
              style={{ ...TEXT_INPUT_BASE, fontWeight: 500, resize: "vertical" }}
            />
          </Field>

          <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>
            Your time zone: <strong>{timezone}</strong> — current time <strong>{formatTime(clock, timeFormat === "24")}</strong>.
            Dates are calculated using your device's local calendar day.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function AnniversaryCalculatorTool() {
  // Event details
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("relationship");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Calculation mode + dates
  const [calcMode, setCalcMode] = useState("since");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [referenceDateStr, setReferenceDateStr] = useState("");
  const [allowFutureDate, setAllowFutureDate] = useState(false);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12");
  const [leapYearMode, setLeapYearMode] = useState("auto");
  const [holidaysText, setHolidaysText] = useState("");

  // UI feedback
  const [icsOk, setIcsOk] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const icsTimer  = useRef(null);
  const copyTimer = useRef(null);

  const todayMidnight = useTodayMidnight();
  const maxDate = useMemo(() => toInputDate(todayMidnight), [todayMidnight]);

  // ── Validation ──────────────────────────────────────────────
  const startValidation = useMemo(
    () => validateDate(startDateStr, { allowFuture: allowFutureDate }),
    [startDateStr, allowFutureDate],
  );
  const startDate = startValidation.date;

  const endValidation = useMemo(
    () => (calcMode === "between" ? validateDate(endDateStr, { allowFuture: true }) : { valid: true, error: null, date: null }),
    [calcMode, endDateStr],
  );
  const endDate = endValidation.date;

  const rangeError = useMemo(() => (
    calcMode === "between" && startDate && endDate && endDate < startDate
      ? "End date must be on or after the start date."
      : null
  ), [calcMode, startDate, endDate]);

  const referenceValidation = useMemo(
    () => (referenceDateStr ? validateDate(referenceDateStr, { allowFuture: true }) : { valid: true, error: null, date: null }),
    [referenceDateStr],
  );

  const referenceDate = useMemo(() => {
    if (calcMode === "between") return endDate;
    return referenceValidation.date || todayMidnight;
  }, [calcMode, endDate, referenceValidation.date, todayMidnight]);

  const isValid = Boolean(
    startValidation.valid
    && (calcMode !== "between" || endValidation.valid)
    && !rangeError
    && referenceValidation.valid
    && startDate && referenceDate,
  );
  const isFutureStart = Boolean(isValid && startDate > referenceDate);

  // ── Core computations (skipped until inputs are valid) ─────
  const exact = useMemo(
    () => (isValid && !isFutureStart ? calcExactDiff(startDate, referenceDate) : null),
    [isValid, isFutureStart, startDate, referenceDate],
  );
  const totalDaysCount = useMemo(
    () => (isValid && !isFutureStart ? totalDays(startDate, referenceDate) : 0),
    [isValid, isFutureStart, startDate, referenceDate],
  );
  const totalWeeksAndDays = useMemo(() => daysToWeeksAndDays(totalDaysCount), [totalDaysCount]);
  const totalMonthsCount = exact ? exact.years * 12 + exact.months : 0;
  const totalWeeksCount  = Math.floor(totalDaysCount / 7);

  const previousAnniversary = useMemo(
    () => (isValid && !isFutureStart ? getPreviousAnniversary(startDate, referenceDate, leapYearMode) : null),
    [isValid, isFutureStart, startDate, referenceDate, leapYearMode],
  );
  const nextAnniversary = useMemo(
    () => (isValid ? getNextAnniversary(startDate, isFutureStart ? startDate : referenceDate, leapYearMode) : null),
    [isValid, isFutureStart, startDate, referenceDate, leapYearMode],
  );
  const nextAnnivNum = useMemo(
    () => (isValid && !isFutureStart ? getNextAnniversaryNumber(startDate, referenceDate, leapYearMode) : 0),
    [isValid, isFutureStart, startDate, referenceDate, leapYearMode],
  );
  const prevAnnivNum = useMemo(
    () => (isValid && !isFutureStart ? getPreviousAnniversaryNumber(startDate, referenceDate, leapYearMode) : 0),
    [isValid, isFutureStart, startDate, referenceDate, leapYearMode],
  );
  const elapsedSincePrevious = useMemo(
    () => (previousAnniversary ? getElapsedSincePrevious(previousAnniversary, referenceDate) : null),
    [previousAnniversary, referenceDate],
  );
  const progressPercent = useMemo(
    () => (previousAnniversary && nextAnniversary ? getProgressPercent(previousAnniversary, nextAnniversary, referenceDate) : 0),
    [previousAnniversary, nextAnniversary, referenceDate],
  );

  const holidayDates = useMemo(
    () => holidaysText.split(/[\n,]/).map((s) => parseInputDate(s.trim())).filter(Boolean),
    [holidaysText],
  );
  const workingDays = useMemo(
    () => (isValid && !isFutureStart ? getWorkingDays(startDate, referenceDate, holidayDates) : null),
    [isValid, isFutureStart, startDate, referenceDate, holidayDates],
  );

  const milestonesRaw = useMemo(
    () => (isValid ? getMilestones(startDate, isFutureStart ? startDate : referenceDate, leapYearMode) : []),
    [isValid, isFutureStart, startDate, referenceDate, leapYearMode],
  );
  const milestones = useMemo(() => milestonesRaw.map((m) => {
    const gift = m.years > 0 ? getGiftInfo(m.years) : null;
    return { ...m, giftName: gift?.exact ? gift.traditional : null };
  }), [milestonesRaw]);

  const currentGift = useMemo(() => {
    const year = prevAnnivNum > 0 ? prevAnnivNum : nextAnnivNum;
    return year > 0 ? getGiftInfo(year) : null;
  }, [prevAnnivNum, nextAnnivNum]);

  const zodiac = useMemo(() => (isValid ? getZodiacSign(startDate) : null), [isValid, startDate]);
  const moonPhase = useMemo(() => (isValid ? getMoonPhase(startDate) : null), [isValid, startDate]);
  const funFacts = useMemo(
    () => (isValid && !isFutureStart ? getFunFacts({
      totalDaysCount, totalHours: totalDaysCount * 24, totalMinutes: totalDaysCount * 24 * 60,
    }) : []),
    [isValid, isFutureStart, totalDaysCount],
  );

  const isLiveReference = calcMode !== "between" && !referenceDateStr;
  const eventLabel = eventTitle || getEventTypeLabel(eventType);

  // ── Handlers ────────────────────────────────────────────────
  function handleReset() {
    setEventTitle(""); setEventType("relationship"); setEventDescription(""); setEventLocation("");
    setCalcMode("since"); setStartDateStr(""); setEndDateStr(""); setReferenceDateStr("");
    setAllowFutureDate(false); setSettingsOpen(false);
    setDateFormat("MM/DD/YYYY"); setTimeFormat("12"); setLeapYearMode("auto"); setHolidaysText("");
  }

  function handleExportIcs() {
    if (!startDate) return;
    const content = generateIcs(startDate, eventLabel);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setIcsOk(true);
    clearTimeout(icsTimer.current);
    icsTimer.current = setTimeout(() => setIcsOk(false), 2000);
  }

  function handleCopySummary() {
    if (!isValid || isFutureStart || !exact) return;
    const text = generateShareText({ eventTitle: eventLabel, exact, nextAnniversary, nextOrdinal: nextAnnivNum });
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyOk(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyOk(false), 2000);
    }).catch(() => {});
  }

  function handlePrint() {
    window.print();
  }

  function handleLoadSavedEvent(saved) {
    setEventTitle(saved.eventTitle || "");
    setEventType(saved.eventType || "relationship");
    setStartDateStr(saved.startDateStr || "");
    setCalcMode("since");
    setReferenceDateStr("");
  }

  const currentEventForSave = { eventTitle, eventType, startDateStr };

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Print styles: only the results/timeline/milestones sections print */}
      <style>{`
        @media print {
          .anniv-no-print { display: none !important; }
        }
      `}</style>

      {/* ── Input card ── */}
      <div className="card anniv-no-print" style={{ padding: "20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div>
            <label style={INPUT_LBL}>Event Type</label>
            <EventTypeSelector value={eventType} onChange={setEventType} />
          </div>

          <div>
            <label style={INPUT_LBL}>Calculation Mode</label>
            <div role="radiogroup" aria-label="Calculation mode" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CALC_MODES.map((m) => {
                const active = m.id === calcMode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={m.hint}
                    onClick={() => setCalcMode(m.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 99,
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent-light)" : "var(--bg-white)",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="Start Date" htmlFor="anniv-start-date" error={startDateStr ? startValidation.error : null}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  id="anniv-start-date"
                  type="date"
                  value={startDateStr}
                  max={allowFutureDate ? undefined : maxDate}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  style={{
                    ...TEXT_INPUT_BASE,
                    borderColor: startDateStr && !startValidation.valid ? "var(--error)" : "var(--border)",
                    cursor: "pointer",
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStartDateStr(maxDate)}
                  style={{ fontSize: 12, padding: "0 12px", flexShrink: 0 }}
                >
                  Today
                </button>
              </div>
            </Field>

            {calcMode === "between" && (
              <Field label="End Date" htmlFor="anniv-end-date" error={endDateStr ? endValidation.error : rangeError}>
                <input
                  id="anniv-end-date"
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  style={{
                    ...TEXT_INPUT_BASE,
                    borderColor: (endDateStr && !endValidation.valid) || rangeError ? "var(--error)" : "var(--border)",
                    cursor: "pointer",
                  }}
                />
              </Field>
            )}

            <Field label="Event Name" htmlFor="anniv-event-name">
              <input
                id="anniv-event-name"
                type="text"
                value={eventTitle}
                maxLength={60}
                placeholder={getEventTypeLabel(eventType)}
                onChange={(e) => setEventTitle(e.target.value.replace(/[<>"'&]/g, "").slice(0, 60))}
                style={TEXT_INPUT_BASE}
              />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="Description (optional)" htmlFor="anniv-description">
              <input
                id="anniv-description"
                type="text"
                value={eventDescription}
                maxLength={140}
                placeholder="e.g. Started our journey together"
                onChange={(e) => setEventDescription(e.target.value.replace(/[<>"'&]/g, "").slice(0, 140))}
                style={TEXT_INPUT_BASE}
              />
            </Field>
            <Field label="Location (optional)" htmlFor="anniv-location">
              <input
                id="anniv-location"
                type="text"
                value={eventLocation}
                maxLength={80}
                placeholder="e.g. New York"
                onChange={(e) => setEventLocation(e.target.value.replace(/[<>"'&]/g, "").slice(0, 80))}
                style={TEXT_INPUT_BASE}
              />
            </Field>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={allowFutureDate}
              onChange={(e) => setAllowFutureDate(e.target.checked)}
            />
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
              Allow a future start date (e.g. an upcoming wedding)
            </span>
          </label>

          {(startDateStr || eventTitle) && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              style={{ alignSelf: "flex-start", fontSize: 13, padding: "6px 12px", color: "var(--text-muted)" }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="anniv-no-print">
        <SettingsPanel
          open={settingsOpen}
          onToggle={() => setSettingsOpen((o) => !o)}
          dateFormat={dateFormat} setDateFormat={setDateFormat}
          timeFormat={timeFormat} setTimeFormat={setTimeFormat}
          leapYearMode={leapYearMode} setLeapYearMode={setLeapYearMode}
          holidaysText={holidaysText} setHolidaysText={setHolidaysText}
          referenceDateStr={referenceDateStr} setReferenceDateStr={setReferenceDateStr}
          showReferenceDate={calcMode !== "between"}
          maxDate={maxDate}
        />
      </div>

      {/* ── Empty state ── */}
      {!startDateStr && (
        <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }} aria-hidden="true">💑</div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-secondary)", marginBottom: 6 }}>
            Enter a start date to get started
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            Exact calendar breakdown, live countdown, milestones, gift ideas, timeline, and statistics — all calculated instantly, in your browser.
          </p>
        </div>
      )}

      {/* ── Future-start countdown (event hasn't happened yet) ── */}
      {isValid && isFutureStart && (
        <div className="card animate-fadeUp" style={{ padding: "22px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Counting down to {eventLabel}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(16px, 3.5vw, 21px)", color: "var(--text-primary)", marginBottom: 14 }}>
            {formatDate(startDate)} · {getWeekdayName(startDate)}
          </div>
          <LiveCountdown targetDate={startDate} />
        </div>
      )}

      {/* ── Results ── */}
      {isValid && !isFutureStart && exact && (
        <>
          {/* ── Summary header ── */}
          <div className="card animate-fadeUp" style={{ padding: "20px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {getEventTypeIcon(eventType)} {getEventTypeLabel(eventType)}
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(17px, 4vw, 23px)", color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: 4 }}>
                  {eventLabel}
                </h2>
                {eventDescription && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{eventDescription}</p>}
                {eventLocation && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>📍 {eventLocation}</p>}
              </div>
              <ProgressRing percent={progressPercent} />
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "var(--text-secondary)" }}>
              <div><strong>Original date:</strong> {formatByPattern(startDate, dateFormat)} ({getWeekdayName(startDate)})</div>
              <div><strong>Reference date:</strong> {formatByPattern(referenceDate, dateFormat)}</div>
            </div>
          </div>

          {/* ── Exact calendar breakdown ── */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard value={exact.years} label="Years" accent={exact.years > 0} />
            <StatCard value={exact.months} label="Months" />
            <StatCard value={totalWeeksAndDays.weeks.toLocaleString()} label="Weeks" sub={`+${totalWeeksAndDays.days} days`} />
            <StatCard value={exact.days} label="Days" />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard value={totalMonthsCount.toLocaleString()} label="Total Months" />
            <StatCard value={totalWeeksCount.toLocaleString()} label="Total Weeks" />
            <StatCard value={totalDaysCount.toLocaleString()} label="Total Days" />
          </div>
          <LiveTotals startDate={startDate} endDate={referenceDate} live={isLiveReference} />

          {/* ── Anniversary number & weekday info ── */}
          <div className="card animate-fadeUp delay-100" style={{ padding: "18px 20px" }}>
            <div style={SECTION_TITLE}>
              {prevAnnivNum > 0 ? `You're on the ${getOrdinal(prevAnnivNum)} anniversary` : "Before the 1st anniversary"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, fontSize: 12.5, color: "var(--text-secondary)" }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Previous anniversary</div>
                <div>{previousAnniversary ? `${formatByPattern(previousAnniversary, dateFormat)} · ${getWeekdayName(previousAnniversary)}` : "—"}</div>
                {elapsedSincePrevious && (
                  <div style={{ color: "var(--text-muted)" }}>
                    {elapsedSincePrevious.years}y {elapsedSincePrevious.months}m {elapsedSincePrevious.days}d ago
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Next anniversary ({getOrdinal(nextAnnivNum)})</div>
                <div>{nextAnniversary ? `${formatByPattern(nextAnniversary, dateFormat)} · ${getWeekdayName(nextAnniversary)}` : "—"}</div>
              </div>
            </div>
          </div>

          {/* ── Countdown ── */}
          {nextAnniversary && (
            <div className="card animate-fadeUp delay-100" style={{ padding: "20px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={SECTION_TITLE}>Next {getEventTypeLabel(eventType)} In</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(15px, 3vw, 19px)", color: "var(--text-primary)" }}>
                    {getWeekdayName(nextAnniversary)}, {formatByPattern(nextAnniversary, dateFormat)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost anniv-no-print"
                  onClick={handleExportIcs}
                  title="Export a recurring yearly reminder to your calendar"
                  style={{
                    fontSize: 12.5, padding: "7px 12px", flexShrink: 0,
                    background: icsOk ? "#f0fdf4" : undefined, color: icsOk ? "#16a34a" : undefined,
                  }}
                >
                  {icsOk ? "✓ Saved!" : "📅 Export .ics"}
                </button>
              </div>
              <LiveCountdown targetDate={nextAnniversary} />
            </div>
          )}

          {/* ── Milestones ── */}
          <div className="card animate-fadeUp delay-200" style={{ padding: "18px 20px" }}>
            <div style={SECTION_TITLE}>Milestones</div>
            <div>
              {milestones.map((m, i) => (
                <MilestoneRow key={m.key} milestone={m} isLast={i === milestones.length - 1} />
              ))}
            </div>
          </div>

          {/* ── Gift information ── */}
          {currentGift && <GiftInfoCard gift={currentGift} ordinal={prevAnnivNum || nextAnnivNum} />}

          {/* ── Timeline ── */}
          <AnniversaryTimeline startDate={startDate} today={referenceDate} milestones={milestones} />

          {/* ── Statistics dashboard ── */}
          {workingDays && (
            <div className="card animate-fadeUp delay-300" style={{ padding: "18px 20px" }}>
              <div style={SECTION_TITLE}>Statistics</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <ColorStatCard value={workingDays.weekdays.toLocaleString()} label="Weekdays" theme="blue" />
                <ColorStatCard value={workingDays.weekends.toLocaleString()} label="Weekend Days" theme="pink" />
                {workingDays.holidays > 0 && <ColorStatCard value={workingDays.holidays.toLocaleString()} label="Holidays Excluded" theme="amber" />}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: funFacts.length > 0 ? 14 : 0 }}>
                {zodiac && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 99,
                    background: STAT_COLOR_THEMES.purple.bg, border: `1.5px solid ${STAT_COLOR_THEMES.purple.border}`,
                    color: STAT_COLOR_THEMES.purple.text, fontSize: 12.5, fontFamily: "var(--font-display)", fontWeight: 700,
                  }}>
                    <span aria-hidden="true">{zodiac.emoji}</span> {zodiac.sign}
                    <span style={{ fontWeight: 500, opacity: 0.75 }}>· start date</span>
                  </span>
                )}
                {moonPhase && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 99,
                    background: STAT_COLOR_THEMES.indigo.bg, border: `1.5px solid ${STAT_COLOR_THEMES.indigo.border}`,
                    color: STAT_COLOR_THEMES.indigo.text, fontSize: 12.5, fontFamily: "var(--font-display)", fontWeight: 700,
                  }}>
                    <span aria-hidden="true">{moonPhase.emoji}</span> {moonPhase.name}
                    <span style={{ fontWeight: 500, opacity: 0.75 }}>· approx., start date</span>
                  </span>
                )}
              </div>
              {funFacts.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {funFacts.map((f, i) => {
                    const themes = ["teal", "blue", "pink", "amber"];
                    const c = STAT_COLOR_THEMES[themes[i % themes.length]];
                    return (
                      <div key={f} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: "var(--radius-md)",
                        background: c.bg, borderLeft: `3px solid ${c.label}`,
                        fontSize: 12.5, color: c.text, fontFamily: "var(--font-display)", fontWeight: 600,
                      }}>
                        <span aria-hidden="true">✨</span> {f}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Share / export ── */}
          <div className="card anniv-no-print" style={{ padding: "16px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopySummary} style={{
              fontSize: 13, padding: "8px 14px",
              background: copyOk ? "#f0fdf4" : undefined, color: copyOk ? "#16a34a" : undefined,
            }}>
              {copyOk ? "✓ Copied!" : "📋 Copy Summary"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={handlePrint} style={{ fontSize: 13, padding: "8px 14px" }}>
              🖨️ Print / Save as PDF
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleExportIcs} style={{ fontSize: 13, padding: "8px 14px" }}>
              📅 Export .ics
            </button>
          </div>

          {/* ── Saved events / comparison ── */}
          <div className="anniv-no-print">
            <SavedEventsPanel currentEvent={currentEventForSave} today={referenceDate} onLoad={handleLoadSavedEvent} />
          </div>
        </>
      )}
    </div>
  );
}
