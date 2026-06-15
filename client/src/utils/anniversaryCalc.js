// ── Anniversary Calculator utilities ─────────────────────────
// Pure functions — no React dependencies.

// ── Date I/O ──────────────────────────────────────────────────

export function parseInputDate(str) {
  if (!str || typeof str !== "string") return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

export function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ── Core date arithmetic ──────────────────────────────────────

// Anniversary date for a specific year — handles Feb 29 → Feb 28 in non-leap years
export function getAnniversaryDate(startDate, year) {
  const m     = startDate.getMonth();
  const d     = startDate.getDate();
  const maxD  = new Date(year, m + 1, 0).getDate(); // last day of that month
  return new Date(year, m, Math.min(d, maxD));
}

// Next anniversary date from today (returns today if today is the anniversary)
export function getNextAnniversary(startDate, now = new Date()) {
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let   year      = today.getFullYear();
  let   candidate = getAnniversaryDate(startDate, year);
  if (candidate < today) {
    candidate = getAnniversaryDate(startDate, ++year);
  }
  return candidate;
}

// Which number anniversary is next? (1 = first anniversary)
export function getNextAnniversaryNumber(startDate, now = new Date()) {
  const today       = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearAnn = getAnniversaryDate(startDate, today.getFullYear());
  const base        = today.getFullYear() - startDate.getFullYear();
  return thisYearAnn <= today ? base + 1 : base;
}

// Elapsed time broken into complete years, months, remaining days
export function calcElapsed(startDate, now = new Date()) {
  let y = now.getFullYear() - startDate.getFullYear();
  let m = now.getMonth()    - startDate.getMonth();
  let d = now.getDate()     - startDate.getDate();

  if (d < 0) {
    m--;
    // Days in the month before `now`
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }

  return {
    years:  Math.max(0, y),
    months: Math.max(0, m),
    days:   Math.max(0, d),
  };
}

// Total complete days between start and now
export function totalDays(startDate, now = new Date()) {
  const a = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const b = new Date(now.getFullYear(),       now.getMonth(),       now.getDate());
  return Math.max(0, Math.floor((b - a) / 86400000));
}

// Live countdown to a target date: { days, hours, minutes, seconds, isToday }
export function getCountdown(targetDate, now = new Date()) {
  const midnight = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );
  const ms = midnight - now;

  // Treat the full anniversary day as "today"
  if (ms < 0 && ms > -86400000) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };
  }
  if (ms <= -86400000) {
    // Past — shouldn't happen when targetDate comes from getNextAnniversary
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false };
  }

  const totalSec = Math.floor(ms / 1000);
  return {
    days:    Math.floor(totalSec / 86400),
    hours:   Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600)  / 60),
    seconds: totalSec % 60,
    isToday: false,
  };
}

// ── Milestones ────────────────────────────────────────────────

const MONTH_STEPS = [1, 3, 6];
const YEAR_STEPS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50];

export function getMilestones(startDate, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const list  = [];

  for (const months of MONTH_STEPS) {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + months,
      startDate.getDate(),
    );
    list.push({
      key:   `m${months}`,
      label: months === 1 ? "1 Month" : `${months} Months`,
      date,
      years: 0,
    });
  }

  for (const years of YEAR_STEPS) {
    const date = getAnniversaryDate(startDate, startDate.getFullYear() + years);
    list.push({
      key:   `y${years}`,
      label: years === 1 ? "1 Year" : `${years} Years`,
      date,
      years,
    });
  }

  list.sort((a, b) => a.date - b.date);

  let nextMarked = false;
  return list.map((m) => {
    const diffDays  = Math.round((m.date - today) / 86400000);
    const completed = diffDays < 0;
    const isToday   = diffDays === 0;
    const isNext    = !completed && !isToday && !nextMarked;
    if (isNext) nextMarked = true;
    return { ...m, completed, isToday, isNext, daysLeft: Math.max(0, diffDays) };
  });
}

// ── Traditional anniversary names ─────────────────────────────

const NAMES = {
  1:  "Paper",   2:  "Cotton",  3:  "Leather", 4:  "Linen",
  5:  "Wood",    6:  "Sugar",   7:  "Wool",     8:  "Pottery",
  9:  "Willow",  10: "Tin",     15: "Crystal",  20: "China",
  25: "Silver",  30: "Pearl",   40: "Ruby",      50: "Golden",
};

export function getAnniversaryName(years) {
  return NAMES[years] || null;
}

// ── ICS calendar export ───────────────────────────────────────

function pad2(n) { return String(n).padStart(2, "0"); }

function toIcsDate(date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

export function generateIcs(startDate, eventName) {
  const name  = (eventName || "Anniversary").trim().replace(/[\\;,]/g, "\\$&");
  const dtStart = toIcsDate(startDate);
  const dtEnd   = toIcsDate(
    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1),
  );
  const uid = `anniversary-${dtStart}-${Math.random().toString(36).slice(2)}@tolz`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tolz//Anniversary Calculator//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    "RRULE:FREQ=YEARLY",
    `SUMMARY:${name}`,
    `DESCRIPTION:${name} · started ${formatDate(startDate)}`,
    `UID:${uid}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
