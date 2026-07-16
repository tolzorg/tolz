// ── Anniversary Calculator utilities ─────────────────────────
// Pure functions — no React dependencies. All calendar math uses
// real calendar subtraction (never days/30 or days/365 approximations).
//
// Calendar system: Gregorian only. `leapMode` is the only per-calendar
// knob today; a future non-Gregorian calendar would plug in here by
// swapping `getAnniversaryDate`'s year-walk for that calendar's own
// date arithmetic — the rest of the engine (diff/countdown/milestones)
// only ever consumes plain JS `Date` objects, so it stays calendar-agnostic.

// ── Date I/O ──────────────────────────────────────────────────

export function parseInputDate(str) {
  if (!str || typeof str !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  // Reject impossible dates (e.g. Feb 30) — JS Date silently rolls them over.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
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

export function formatByPattern(date, pattern = "MM/DD/YYYY") {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (pattern === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
  if (pattern === "YYYY-MM-DD") return `${yyyy}-${mm}-${dd}`;
  return `${mm}/${dd}/${yyyy}`;
}

export function formatTime(date, use24h = false) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: !use24h,
  });
}

export function getWeekdayName(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

// ── Validation ────────────────────────────────────────────────

export function validateDate(str, { allowFuture = false } = {}) {
  if (!str || !str.trim()) return { valid: false, error: "Please enter a date.", date: null };
  const date = parseInputDate(str);
  if (!date) return { valid: false, error: "That date isn't valid — please check the day, month and year.", date: null };
  if (!allowFuture) {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (date > todayMidnight) return { valid: false, error: "This date cannot be in the future.", date };
  }
  return { valid: true, error: null, date };
}

// ── Core date arithmetic ──────────────────────────────────────

// Anniversary date for a specific year. leapMode controls Feb 29 handling
// when the target year isn't a leap year: 'feb28' / 'auto' (default, and
// also the behavior applied to any other end-of-month overflow) celebrates
// on Feb 28; 'mar1' celebrates on March 1.
export function getAnniversaryDate(startDate, year, leapMode = "auto") {
  const m    = startDate.getMonth();
  const d    = startDate.getDate();
  const maxD = new Date(year, m + 1, 0).getDate(); // last day of that month in `year`

  if (m === 1 && d === 29 && maxD === 28 && leapMode === "mar1") {
    return new Date(year, 2, 1); // March 1
  }
  return new Date(year, m, Math.min(d, maxD));
}

// Next anniversary date from today (returns today if today is the anniversary)
export function getNextAnniversary(startDate, now = new Date(), leapMode = "auto") {
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let   year      = today.getFullYear();
  let   candidate = getAnniversaryDate(startDate, year, leapMode);
  if (candidate < today) {
    candidate = getAnniversaryDate(startDate, ++year, leapMode);
  }
  return candidate;
}

// Most recent anniversary that already happened (or today, if today is one)
export function getPreviousAnniversary(startDate, now = new Date(), leapMode = "auto") {
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let   year      = today.getFullYear();
  let   candidate = getAnniversaryDate(startDate, year, leapMode);
  if (candidate > today) {
    candidate = getAnniversaryDate(startDate, --year, leapMode);
  }
  return candidate;
}

// Which number anniversary is next? (1 = first anniversary)
// Note: uses a strict "<" so that when today IS this year's anniversary,
// it counts as that anniversary happening now (base), not base + 1 —
// matching getNextAnniversary(), which returns today itself in that case.
export function getNextAnniversaryNumber(startDate, now = new Date(), leapMode = "auto") {
  const today       = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearAnn = getAnniversaryDate(startDate, today.getFullYear(), leapMode);
  const base        = today.getFullYear() - startDate.getFullYear();
  return thisYearAnn < today ? base + 1 : base;
}

// Which number anniversary was the last one that already happened?
export function getPreviousAnniversaryNumber(startDate, now = new Date(), leapMode = "auto") {
  const nextNum = getNextAnniversaryNumber(startDate, now, leapMode);
  const today   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearAnn = getAnniversaryDate(startDate, today.getFullYear(), leapMode);
  return thisYearAnn.getTime() === today.getTime() ? nextNum : nextNum - 1;
}

// Add a whole number of calendar months to a date, clamping the day to the
// target month's length (e.g. Jan 31 + 1 month → Feb 28/29, not Mar 2/3).
function addCalendarMonths(date, months) {
  const monthIndex = date.getMonth() + months;
  const year  = date.getFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const maxDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), maxDay));
}

// Exact calendar difference — years/months/days via real calendar
// arithmetic, never an averaged 30-day-month or 365-day-year approximation.
// Finds the largest whole number of calendar months that fit between a and
// b (respecting each month's actual length, including end-of-month clamping
// consistent with getAnniversaryDate), then the remainder as real elapsed
// days. Assumes b >= a.
export function calcExactDiff(a, b) {
  let totalMonths = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (addCalendarMonths(a, totalMonths) > b) totalMonths--;

  const anchor = addCalendarMonths(a, totalMonths);
  const days   = Math.round((b - anchor) / 86400000);

  return {
    years:  Math.max(0, Math.floor(totalMonths / 12)),
    months: Math.max(0, totalMonths % 12),
    days:   Math.max(0, days),
  };
}

// Split a plain day count into whole weeks + remainder days
export function daysToWeeksAndDays(totalDaysCount) {
  return {
    weeks: Math.floor(totalDaysCount / 7),
    days:  totalDaysCount % 7,
  };
}

// Total complete days between start and now (midnight-to-midnight)
export function totalDays(startDate, now = new Date()) {
  const a = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const b = new Date(now.getFullYear(),       now.getMonth(),       now.getDate());
  return Math.max(0, Math.floor((b - a) / 86400000));
}

// Full live countdown to a target date (midnight): years/months/weeks/days
// from calendar-exact subtraction, hours/minutes/seconds from real elapsed
// milliseconds — both halves stay internally consistent (see anniversaryCalc
// design notes: the Y/M/W/D span is derived from the same flat day-count
// used for the H/M/S remainder, just calendar-decomposed for display).
export function getFullCountdown(targetDate, now = new Date()) {
  const todayMidnight  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const ms = targetMidnight - now;

  const empty = { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  // Treat the full anniversary day as "today"
  if (ms < 0 && ms > -86400000) {
    return { ...empty, isToday: true, isPast: false };
  }
  if (ms <= -86400000) {
    return { ...empty, isToday: false, isPast: true };
  }

  const totalSec = Math.floor(ms / 1000);
  const flatDays = Math.floor(totalSec / 86400);
  const hours    = Math.floor((totalSec % 86400) / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const seconds  = totalSec % 60;

  const virtualTarget = new Date(
    todayMidnight.getFullYear(), todayMidnight.getMonth(), todayMidnight.getDate() + flatDays,
  );
  const { years, months, days: dayRem } = calcExactDiff(todayMidnight, virtualTarget);
  const { weeks, days } = daysToWeeksAndDays(dayRem);

  return { years, months, weeks, days, hours, minutes, seconds, isToday: false, isPast: false };
}

// Elapsed time since the previous anniversary, calendar-exact.
export function getElapsedSincePrevious(previousAnniversary, now = new Date()) {
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return calcExactDiff(previousAnniversary, todayMidnight);
}

// Percent of the way from the previous anniversary to the next one (0–100).
export function getProgressPercent(previousAnniversary, nextAnniversary, now = new Date()) {
  const span = nextAnniversary - previousAnniversary;
  if (span <= 0) return 100;
  const elapsed = now - previousAnniversary;
  return Math.min(100, Math.max(0, Math.round((elapsed / span) * 1000) / 10));
}

// ── Working days ──────────────────────────────────────────────

// holidayDates: array of Date objects to exclude from both weekday/weekend counts.
export function getWorkingDays(start, end, holidayDates = []) {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const b = new Date(end.getFullYear(),   end.getMonth(),   end.getDate());
  const holidaySet = new Set(holidayDates.map((d) => toInputDate(d)));

  let weekdays = 0, weekends = 0, holidays = 0;
  const cursor = new Date(a);
  while (cursor < b) {
    const day        = cursor.getDay();
    const isWeekend  = day === 0 || day === 6;
    const isHoliday  = holidaySet.has(toInputDate(cursor));
    if (isHoliday) holidays++;
    else if (isWeekend) weekends++;
    else weekdays++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    total:       weekdays + weekends + holidays,
    weekdays,
    weekends,
    holidays,
    businessDays: weekdays,
  };
}

// ── Milestones ────────────────────────────────────────────────

const MONTH_STEPS = [1, 3, 6];
const YEAR_STEPS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100];
export const MAJOR_MILESTONE_YEARS = [25, 40, 50, 60];

export function getMilestones(startDate, now = new Date(), leapMode = "auto") {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const list  = [];

  for (const months of MONTH_STEPS) {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + months,
      startDate.getDate(),
    );
    list.push({
      key:     `m${months}`,
      label:   months === 1 ? "1 Month" : `${months} Months`,
      date,
      years:   0,
      isMajor: false,
    });
  }

  for (const years of YEAR_STEPS) {
    const date = getAnniversaryDate(startDate, startDate.getFullYear() + years, leapMode);
    list.push({
      key:     `y${years}`,
      label:   years === 1 ? "1 Year" : `${years} Years`,
      date,
      years,
      isMajor: MAJOR_MILESTONE_YEARS.includes(years),
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

// ── Ordinal numbers ───────────────────────────────────────────

export function getOrdinal(n) {
  if (n <= 0) return String(n);
  const v = n % 100;
  const s = n % 10;
  if (v >= 11 && v <= 13) return `${n}th`;
  if (s === 1) return `${n}st`;
  if (s === 2) return `${n}nd`;
  if (s === 3) return `${n}rd`;
  return `${n}th`;
}

// ── Traditional anniversary names (legacy — see data/anniversaryGiftData.js
// for the fuller traditional/modern/gemstone/flower/color mapping) ────────

const NAMES = {
  1:  "Paper",   2:  "Cotton",  3:  "Leather", 4:  "Linen",
  5:  "Wood",    6:  "Sugar",   7:  "Wool",     8:  "Pottery",
  9:  "Willow",  10: "Tin",     15: "Crystal",  20: "China",
  25: "Silver",  30: "Pearl",   40: "Ruby",      50: "Golden",
};

export function getAnniversaryName(years) {
  return NAMES[years] || null;
}

// ── Zodiac ────────────────────────────────────────────────────

const ZODIAC = [
  { sign: "Capricorn",   emoji: "♑", from: [12, 22], to: [1, 19] },
  { sign: "Aquarius",    emoji: "♒", from: [1, 20],  to: [2, 18] },
  { sign: "Pisces",      emoji: "♓", from: [2, 19],  to: [3, 20] },
  { sign: "Aries",       emoji: "♈", from: [3, 21],  to: [4, 19] },
  { sign: "Taurus",      emoji: "♉", from: [4, 20],  to: [5, 20] },
  { sign: "Gemini",      emoji: "♊", from: [5, 21],  to: [6, 20] },
  { sign: "Cancer",      emoji: "♋", from: [6, 21],  to: [7, 22] },
  { sign: "Leo",         emoji: "♌", from: [7, 23],  to: [8, 22] },
  { sign: "Virgo",       emoji: "♍", from: [8, 23],  to: [9, 22] },
  { sign: "Libra",       emoji: "♎", from: [9, 23],  to: [10, 22] },
  { sign: "Scorpio",     emoji: "♏", from: [10, 23], to: [11, 21] },
  { sign: "Sagittarius", emoji: "♐", from: [11, 22], to: [12, 21] },
];

export function getZodiacSign(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const z of ZODIAC) {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (fm <= tm) {
      if ((m === fm && d >= fd) || (m === tm && d <= td) || (m > fm && m < tm)) return z;
    } else {
      // Wraps year boundary (Capricorn: Dec 22 → Jan 19)
      if ((m === fm && d >= fd) || (m === tm && d <= td) || m > fm || m < tm) return z;
    }
  }
  return null;
}

// ── Moon phase (approximate — synodic-month estimate, for fun only) ──────

const MOON_PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];
const MOON_PHASE_EMOJI = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

export function getMoonPhase(date) {
  const knownNewMoonUtc = Date.UTC(2000, 0, 6, 18, 14); // reference new moon
  const synodicMonth    = 29.53058867; // average days per lunar cycle
  const diffDays        = (date.getTime() - knownNewMoonUtc) / 86400000;
  const phase           = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const index            = Math.min(7, Math.floor((phase / synodicMonth) * 8));
  return { name: MOON_PHASE_NAMES[index], emoji: MOON_PHASE_EMOJI[index] };
}

// ── Fun facts ─────────────────────────────────────────────────

export function getFunFacts({ totalDaysCount, totalHours, totalMinutes }) {
  const facts = [];
  if (totalDaysCount >= 1) facts.push(`Together for more than ${totalDaysCount.toLocaleString()} day${totalDaysCount === 1 ? "" : "s"}.`);
  if (totalHours >= 24)    facts.push(`That's over ${totalHours.toLocaleString()} hours.`);
  if (totalMinutes >= 1440) facts.push(`More than ${totalMinutes.toLocaleString()} minutes.`);
  if (totalDaysCount >= 365) facts.push(`Over ${Math.floor(totalDaysCount / 7).toLocaleString()} weeks.`);
  return facts;
}

// ── Share text ────────────────────────────────────────────────

export function generateShareText({ eventTitle, exact, nextAnniversary, nextOrdinal }) {
  const name  = (eventTitle || "this").trim();
  const lines = [];
  lines.push(
    `We've marked "${name}" for ${exact.years} year${exact.years === 1 ? "" : "s"}, ` +
    `${exact.months} month${exact.months === 1 ? "" : "s"} and ${exact.days} day${exact.days === 1 ? "" : "s"}.`,
  );
  if (nextAnniversary) {
    lines.push(`The next one is on ${formatDate(nextAnniversary)}.`);
  }
  if (nextOrdinal) {
    lines.push(`This will be the ${getOrdinal(nextOrdinal)} anniversary.`);
  }
  return lines.join("\n\n");
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
