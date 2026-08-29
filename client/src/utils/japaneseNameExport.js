// Japanese Name Generator — copy/export helpers. Reuses the same Blob +
// URL.createObjectURL + <a download> pattern already used by
// cpsExport.js / sentenceCounterExport.js, including the same
// CSV-injection escaping (a stray "=", "+", "-", or "@" at the start
// of a field could otherwise be read as a spreadsheet formula) and the
// same clipboard-copy fallback. UTF-8 is used throughout so Japanese
// characters survive the round trip intact.
//
// Only fields that actually exist on a record are ever written out —
// provenance fields (source / sourceRecordId / sourceLicense /
// combinationType) are included when present and simply omitted
// otherwise. Nothing here fabricates a value to fill a column.

import { formatDisplayOrder } from "./japaneseNameEngine.js";

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

/** Best-effort clipboard copy, with the same execCommand fallback used elsewhere in this project. */
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

function meaningsText(record) {
  return (record.meanings || []).map((m) => m.text).join("; ");
}

/** One-line display label for a single name record, honoring the current name-order preference (given-name/surname records only — full-name pairs use formatFullNameForCopy). */
export function formatNameForCopy(record) {
  return `${record.kanji} (${record.hiragana} / ${record.romaji})`;
}

export function formatFullNameForCopy(full, order = "japanese") {
  const kanjiOrdered = order === "international" ? `${full.given.kanji}${full.surname.kanji}` : full.kanji;
  const romajiOrdered = formatDisplayOrder(full.surname.romaji, full.given.romaji, order);
  const label = full.combinationType === "verified" ? "Verified" : "Generated combination";
  return `${kanjiOrdered} (${romajiOrdered}) — ${label}`;
}

/** Full Details-view text block for a single record, including provenance. */
export function formatNameDetails(record) {
  const lines = [
    `Kanji: ${record.kanji}`,
    `Reading (Hiragana): ${record.hiragana}`,
    `Romaji (Hepburn): ${record.romaji}`,
    `Type: ${record.type === "firstName" ? "First name" : "Last name"}`,
  ];
  if (record.type === "firstName") lines.push(`Gender classification (dataset): ${record.genderClassification || "unavailable"}`);
  lines.push(`Kanji character count: ${record.kanjiCount}`);
  lines.push(`Mora count: ${record.moraCount}`);
  if (meaningsText(record)) lines.push(`Meaning(s): ${meaningsText(record)}`);
  lines.push(`Source: ${record.source}`);
  lines.push(`Source record ID: ${record.sourceRecordId}`);
  lines.push(`Source license: ${record.sourceLicense}`);
  return lines.join("\n");
}

export function exportNamesTxt(records, filenamePrefix = "japanese-names") {
  const text = records.map((r) => formatNameForCopy(r)).join("\n");
  downloadBlob(text, `${filenamePrefix}.txt`, "text/plain");
}

export function exportNamesCsv(records, filenamePrefix = "japanese-names") {
  const header = ["Kanji", "Hiragana", "Romaji", "Type", "Gender", "Meaning", "Kanji Count", "Mora Count", "Source", "Source Record ID", "Combination Type"];
  const rows = records.map((r) => [
    r.kanji,
    r.hiragana,
    r.romaji,
    r.type === "firstName" ? "First name" : "Last name",
    r.type === "firstName" ? r.genderClassification || "unavailable" : "",
    meaningsText(r),
    r.kanjiCount,
    r.moraCount,
    r.source || "",
    r.sourceRecordId || "",
    r.combinationType || "",
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadBlob(csv, `${filenamePrefix}.csv`, "text/csv");
}

export function exportNamesJson(records, filenamePrefix = "japanese-names") {
  downloadBlob(JSON.stringify(records, null, 2), `${filenamePrefix}.json`, "application/json");
}
