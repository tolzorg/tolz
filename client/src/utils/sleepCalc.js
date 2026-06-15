const FALL_ASLEEP_MINS = 15;
const CYCLE_MINS = 90;

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToAmPm(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDuration(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const CYCLE_META = {
  6: { label: "⭐ Recommended", quality: "best" },
  5: { label: "👍 Good",        quality: "good" },
  4: { label: "⚠️ Short sleep", quality: "short" },
};

export function calcSleepTimes(wakeTimeStr) {
  const wakeMins = parseTimeToMinutes(wakeTimeStr);
  return [6, 5, 4].map((c) => {
    const sleepMins = wakeMins - (c * CYCLE_MINS + FALL_ASLEEP_MINS);
    return {
      cycles: c,
      time: minutesToAmPm(sleepMins),
      duration: formatDuration(c * CYCLE_MINS),
      ...CYCLE_META[c],
    };
  });
}

export function calcWakeUpTimes(sleepTimeStr) {
  const sleepMins = parseTimeToMinutes(sleepTimeStr);
  return [6, 5, 4].map((c) => {
    const wakeMins = sleepMins + FALL_ASLEEP_MINS + c * CYCLE_MINS;
    return {
      cycles: c,
      time: minutesToAmPm(wakeMins),
      duration: formatDuration(c * CYCLE_MINS),
      ...CYCLE_META[c],
    };
  });
}
