// Required on-screen attribution for the bulk (~320,000-record)
// dataset, per the CC BY-SA 4.0 license terms of JMnedict/ENAMDICT
// (Electronic Dictionary Research and Development Group). Rendered on
// every screen that displays JMnedict-derived data — see
// scripts/build-japanese-names-dataset.mjs for the license-terms
// research this is based on.

export default function JapaneseNameAttribution() {
  return (
    <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
      Name data in this section is sourced from{" "}
      <a
        href="https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--text-muted)", textDecoration: "underline" }}
      >
        JMnedict/ENAMDICT
      </a>
      , © Electronic Dictionary Research and Development Group, licensed under{" "}
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--text-muted)", textDecoration: "underline" }}
      >
        CC BY-SA 4.0
      </a>
      . This source provides Kanji, readings, and name-type classification only — it does not include name meanings.
    </p>
  );
}
