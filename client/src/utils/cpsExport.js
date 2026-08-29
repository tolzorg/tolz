// CPS Tester — copy/export helpers. Reuses the same Blob +
// URL.createObjectURL + <a download> pattern already used by
// sentenceCounterExport.js / the Anniversary Calculator's .ics export,
// including the same CSV-injection escaping (a stray "=", "+", "-", or
// "@" at the start of a field could otherwise be read as a spreadsheet
// formula by Excel/Sheets).

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  let s = String(value ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const fmt = (n) => (n === null || n === undefined || !isFinite(n) ? "N/A" : n.toFixed(2));

/** Plain-text summary for the Copy Results button. */
export function formatResultForCopy(result) {
  return [
    "CPS Test Results",
    `Average CPS: ${fmt(result.averageCps)}`,
    `Peak CPS: ${result.peakCps === null ? "N/A" : fmt(result.peakCps)}`,
    `Total Clicks: ${result.clickCount}`,
    `Duration: ${result.durationSeconds} second${result.durationSeconds === 1 ? "" : "s"}`,
    `Mode: ${result.mode}`,
  ].join("\n");
}

export function exportResultTxt(result) {
  downloadBlob(formatResultForCopy(result), "cps-test-result.txt", "text/plain");
}

/** CSV export of the full session history — Test Number, Duration, Total Clicks, Average CPS, Peak CPS. */
export function exportHistoryCsv(history) {
  const header = ["Test Number", "Duration (s)", "Mode", "Total Clicks", "Average CPS", "Peak CPS"];
  const rows = history.map((h, i) => [
    i + 1,
    h.durationSeconds,
    h.mode,
    h.clickCount,
    fmt(h.averageCps),
    h.peakCps === null ? "N/A" : fmt(h.peakCps),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadBlob(csv, "cps-test-history.csv", "text/csv");
}

/** Best-effort clipboard copy, with the same execCommand fallback used by the Color Picker tool. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = Object.assign(document.createElement("textarea"), {
        value: text,
        style: "position:fixed;opacity:0",
      });
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}
