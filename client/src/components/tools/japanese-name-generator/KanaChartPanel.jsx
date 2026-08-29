// Optional compact Hiragana/Katakana reference chart (spec Section 34
// — "optionally include," secondary to the main generator). Pure,
// factual kana-table data; no fabrication risk.

const ROWS = [
  ["a", "あ", "ア"], ["ka", "か", "カ"], ["sa", "さ", "サ"], ["ta", "た", "タ"], ["na", "な", "ナ"],
  ["ha", "は", "ハ"], ["ma", "ま", "マ"], ["ya", "や", "ヤ"], ["ra", "ら", "ラ"], ["wa", "わ", "ワ"],
  ["i", "い", "イ"], ["ki", "き", "キ"], ["shi", "し", "シ"], ["chi", "ち", "チ"], ["ni", "に", "ニ"],
  ["hi", "ひ", "ヒ"], ["mi", "み", "ミ"], ["", "", ""], ["ri", "り", "リ"], ["", "", ""],
  ["u", "う", "ウ"], ["ku", "く", "ク"], ["su", "す", "ス"], ["tsu", "つ", "ツ"], ["nu", "ぬ", "ヌ"],
  ["fu", "ふ", "フ"], ["mu", "む", "ム"], ["yu", "ゆ", "ユ"], ["ru", "る", "ル"], ["", "", ""],
  ["e", "え", "エ"], ["ke", "け", "ケ"], ["se", "せ", "セ"], ["te", "て", "テ"], ["ne", "ね", "ネ"],
  ["he", "へ", "ヘ"], ["me", "め", "メ"], ["", "", ""], ["re", "れ", "レ"], ["", "", ""],
  ["o", "お", "オ"], ["ko", "こ", "コ"], ["so", "そ", "ソ"], ["to", "と", "ト"], ["no", "の", "ノ"],
  ["ho", "ほ", "ホ"], ["mo", "も", "モ"], ["yo", "よ", "ヨ"], ["ro", "ろ", "ロ"], ["n", "ん", "ン"],
];

export default function KanaChartPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
        A compact reference of the basic Hiragana and Katakana syllabaries with their standard Hepburn romaji.
      </p>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 6, minWidth: 480 }}>
          {ROWS.filter((r) => r[0]).map(([romaji, hira, kata]) => (
            <div key={romaji + hira} className="card" style={{ padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{hira}</div>
              <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>{kata}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{romaji}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
