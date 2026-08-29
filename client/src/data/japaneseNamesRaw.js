// Japanese Name Generator — raw reference dataset.
//
// PROVENANCE: This is an originally-compiled reference set (Tolz
// Editorial), not an import of any third-party commercial or
// government name database — no such licensed dataset is integrated
// in this build. Every record below was chosen because its Kanji,
// reading, and meaning are standard, well-established, and
// non-controversial (the most common Japanese surnames by published
// frequency, and given names with unambiguous, widely-documented
// Kanji/reading/meaning associations). The architecture (see
// ../utils/japaneseNameIngestion.js) is intentionally built so a
// licensed third-party dataset can be swapped in later without
// changing any consuming code — each record already carries its own
// `source`/`sourceRecordId`/`sourceLicense` fields for exactly that
// reason.
//
// This file is intentionally SMALL. Per this tool's own accuracy
// requirements, a small, honestly-sourced dataset is required over a
// larger fabricated one — nothing here is invented. `romaji` and
// `moraCount` are deliberately NOT hardcoded; they're computed at
// ingestion time from `readings[].hiragana` so the app has exactly
// one consistent source of truth for both (see japaneseNameIngestion.js).
//
// Record shape (see japaneseNameIngestion.js for full validation rules):
//   id, type ("firstName"|"lastName"), mode ("factual"),
//   kanji, readings[{hiragana, readingSource, readingStatus}],
//   selectedReadingIndex, genderClassification (firstName only),
//   meanings[{text, appliesToKanji, appliesToReading, meaningSource}],
//   themes[], variants[] (ids of alternate-kanji records sharing a
//   reading), source, sourceRecordId, sourceLicense,
//   isEstablishedSurname + surnameClassificationSource (lastName only).

const READING_SOURCE =
  "Tolz Editorial compilation — cross-checked against standard, widely-published Japanese reading conventions for this exact Kanji/reading pairing";
const GIVEN_MEANING_SOURCE =
  "Tolz Editorial compilation — standard kanji-dictionary meaning of the character as used in this specific name";
const SURNAME_SOURCE =
  "Tolz Editorial compilation — name recognized as one of the most common Japanese surnames in widely published surname-frequency references";
const SOURCE_LICENSE = "Original compilation — Tolz.org (not derived from a third-party licensed database)";

function reading(hiragana, readingStatus = "selected", extra = {}) {
  return { hiragana, readingSource: READING_SOURCE, readingStatus, ...extra };
}

function meaning(text, appliesToKanji, appliesToReading) {
  return { text, appliesToKanji, appliesToReading, meaningSource: GIVEN_MEANING_SOURCE };
}

// Separate counters per prefix so ids are predictable by position within
// each group (needed below, where 咲良's `variants` hardcodes 桜's id).
const seqByPrefix = {};
function nextId(prefix) {
  seqByPrefix[prefix] = (seqByPrefix[prefix] || 0) + 1;
  return `${prefix}-${String(seqByPrefix[prefix]).padStart(4, "0")}`;
}

function firstName({ kanji, readings, gender, meanings, themes, variants = [] }) {
  const id = nextId("gn");
  return {
    id,
    type: "firstName",
    mode: "factual",
    kanji,
    readings,
    selectedReadingIndex: 0,
    genderClassification: gender,
    meanings,
    themes,
    variants,
    source: "Tolz Editorial compilation",
    sourceRecordId: id,
    sourceLicense: SOURCE_LICENSE,
  };
}

function lastName({ kanji, readings, meanings, themes = [] }) {
  const id = nextId("sn");
  return {
    id,
    type: "lastName",
    mode: "factual",
    kanji,
    readings,
    selectedReadingIndex: 0,
    meanings,
    themes,
    variants: [],
    isEstablishedSurname: true,
    surnameClassificationSource: SURNAME_SOURCE,
    source: "Tolz Editorial compilation",
    sourceRecordId: id,
    sourceLicense: SOURCE_LICENSE,
  };
}

// ─────────────────────────── Surnames (25) ───────────────────────────
// The 25 most commonly cited Japanese surnames in published
// surname-frequency references, in roughly descending order of
// commonness.
export const RAW_SURNAMES = [
  lastName({ kanji: "佐藤", readings: [reading("さとう")], meanings: [meaning("Help, assist", "佐", "さ"), meaning("Wisteria", "藤", "とう")] }),
  lastName({ kanji: "鈴木", readings: [reading("すずき")], meanings: [meaning("Bell", "鈴", "すず"), meaning("Tree", "木", "き")] }),
  lastName({ kanji: "高橋", readings: [reading("たかはし")], meanings: [meaning("Tall, high", "高", "たか"), meaning("Bridge", "橋", "はし")] }),
  lastName({ kanji: "田中", readings: [reading("たなか")], meanings: [meaning("Rice field", "田", "た"), meaning("Middle", "中", "なか")] }),
  lastName({ kanji: "伊藤", readings: [reading("いとう")], meanings: [meaning("That one (classical); also used phonetically", "伊", "い"), meaning("Wisteria", "藤", "とう")] }),
  lastName({ kanji: "渡辺", readings: [reading("わたなべ")], meanings: [meaning("Cross over", "渡", "わた"), meaning("Surroundings, area", "辺", "なべ")] }),
  lastName({ kanji: "山本", readings: [reading("やまもと")], meanings: [meaning("Mountain", "山", "やま"), meaning("Origin, base", "本", "もと")] }),
  lastName({ kanji: "中村", readings: [reading("なかむら")], meanings: [meaning("Middle", "中", "なか"), meaning("Village", "村", "むら")] }),
  lastName({ kanji: "小林", readings: [reading("こばやし")], meanings: [meaning("Small", "小", "こ"), meaning("Forest", "林", "ばやし")] }),
  lastName({ kanji: "加藤", readings: [reading("かとう")], meanings: [meaning("Add", "加", "か"), meaning("Wisteria", "藤", "とう")] }),
  lastName({ kanji: "吉田", readings: [reading("よしだ")], meanings: [meaning("Good fortune, luck", "吉", "よし"), meaning("Rice field", "田", "だ")] }),
  lastName({ kanji: "山田", readings: [reading("やまだ")], meanings: [meaning("Mountain", "山", "やま"), meaning("Rice field", "田", "だ")] }),
  lastName({ kanji: "佐々木", readings: [reading("ささき")], meanings: [meaning("Help, assist (repeated)", "佐々", "さざ"), meaning("Tree", "木", "き")] }),
  lastName({ kanji: "山口", readings: [reading("やまぐち")], meanings: [meaning("Mountain", "山", "やま"), meaning("Mouth, opening", "口", "ぐち")] }),
  lastName({ kanji: "松本", readings: [reading("まつもと")], meanings: [meaning("Pine tree", "松", "まつ"), meaning("Origin, base", "本", "もと")] }),
  lastName({ kanji: "井上", readings: [reading("いのうえ")], meanings: [meaning("Well", "井", "い"), meaning("Above", "上", "うえ")] }),
  lastName({ kanji: "木村", readings: [reading("きむら")], meanings: [meaning("Tree", "木", "き"), meaning("Village", "村", "むら")] }),
  lastName({ kanji: "林", readings: [reading("はやし")], meanings: [meaning("Forest", "林", "はやし")] }),
  lastName({ kanji: "斎藤", readings: [reading("さいとう")], meanings: [meaning("Purification, ritual", "斎", "さい"), meaning("Wisteria", "藤", "とう")] }),
  lastName({ kanji: "清水", readings: [reading("しみず")], meanings: [meaning("Clear, pure", "清", "し"), meaning("Water", "水", "みず")] }),
  lastName({ kanji: "山崎", readings: [reading("やまざき")], meanings: [meaning("Mountain", "山", "やま"), meaning("Cape, headland", "崎", "ざき")] }),
  lastName({ kanji: "森", readings: [reading("もり")], meanings: [meaning("Forest", "森", "もり")] }),
  lastName({ kanji: "阿部", readings: [reading("あべ")], meanings: [meaning("Corner, nook (classical); also used phonetically", "阿", "あ"), meaning("Section, part", "部", "べ")] }),
  lastName({ kanji: "池田", readings: [reading("いけだ")], meanings: [meaning("Pond", "池", "いけ"), meaning("Rice field", "田", "だ")] }),
  lastName({ kanji: "橋本", readings: [reading("はしもと")], meanings: [meaning("Bridge", "橋", "はし"), meaning("Origin, base", "本", "もと")] }),
];

// ─────────────────────── Given names — girls (19) ────────────────────
export const RAW_GIRL_NAMES = [
  firstName({ kanji: "陽菜", readings: [reading("ひな")], gender: "girl", themes: ["sun", "nature"], meanings: [meaning("Sun, sunshine", "陽", "ひ"), meaning("Greens, vegetables", "菜", "な")] }),
  firstName({ kanji: "結衣", readings: [reading("ゆい")], gender: "girl", themes: ["bond"], meanings: [meaning("Tie, bind, bond", "結", "ゆ"), meaning("Clothing, garment", "衣", "い")] }),
  firstName({ kanji: "桜", readings: [reading("さくら")], gender: "girl", themes: ["nature", "flower"], meanings: [meaning("Cherry blossom", "桜", "さくら")] }),
  firstName({ kanji: "咲良", readings: [reading("さくら")], gender: "girl", themes: ["nature", "flower"], meanings: [meaning("Bloom, blossom", "咲", "さく"), meaning("Good", "良", "ら")], variants: ["gn-0003"] }),
  firstName({ kanji: "美咲", readings: [reading("みさき")], gender: "girl", themes: ["beauty", "flower"], meanings: [meaning("Beauty", "美", "み"), meaning("Bloom, blossom", "咲", "さき")] }),
  firstName({ kanji: "葵", readings: [reading("あおい")], gender: "girl", themes: ["nature", "flower"], meanings: [meaning("Hollyhock (flower)", "葵", "あおい")] }),
  firstName({ kanji: "花", readings: [reading("はな")], gender: "girl", themes: ["nature", "flower"], meanings: [meaning("Flower", "花", "はな")] }),
  firstName({ kanji: "愛", readings: [reading("あい")], gender: "girl", themes: ["love"], meanings: [meaning("Love", "愛", "あい")] }),
  firstName({ kanji: "舞", readings: [reading("まい")], gender: "girl", themes: ["dance", "art"], meanings: [meaning("Dance", "舞", "まい")] }),
  firstName({ kanji: "恵", readings: [reading("めぐみ")], gender: "girl", themes: ["blessing"], meanings: [meaning("Blessing, grace", "恵", "めぐみ")] }),
  firstName({ kanji: "直美", readings: [reading("なおみ")], gender: "girl", themes: ["beauty", "honesty"], meanings: [meaning("Honest, straight", "直", "なお"), meaning("Beauty", "美", "み")] }),
  firstName({ kanji: "由美", readings: [reading("ゆみ")], gender: "girl", themes: ["beauty"], meanings: [meaning("Reason, cause", "由", "ゆ"), meaning("Beauty", "美", "み")] }),
  firstName({ kanji: "遥", readings: [reading("はるか")], gender: "girl", themes: ["distance"], meanings: [meaning("Distant, far off", "遥", "はるか")] }),
  firstName({ kanji: "美月", readings: [reading("みづき")], gender: "girl", themes: ["beauty", "moon"], meanings: [meaning("Beauty", "美", "み"), meaning("Moon", "月", "づき")] }),
  firstName({ kanji: "陽子", readings: [reading("ようこ")], gender: "girl", themes: ["sun"], meanings: [meaning("Sun, sunshine", "陽", "よう"), meaning("Child", "子", "こ")] }),
  firstName({ kanji: "京子", readings: [reading("きょうこ")], gender: "girl", themes: ["place"], meanings: [meaning("Capital city", "京", "きょう"), meaning("Child", "子", "こ")] }),
  firstName({ kanji: "恵子", readings: [reading("けいこ")], gender: "girl", themes: ["blessing"], meanings: [meaning("Blessing, grace", "恵", "けい"), meaning("Child", "子", "こ")] }),
  firstName({ kanji: "花子", readings: [reading("はなこ")], gender: "girl", themes: ["nature", "flower"], meanings: [meaning("Flower", "花", "はな"), meaning("Child", "子", "こ")] }),
  firstName({ kanji: "咲", readings: [reading("さき")], gender: "girl", themes: ["flower"], meanings: [meaning("Bloom, blossom", "咲", "さき")] }),
];

// ─────────────────────── Given names — boys (17) ─────────────────────
export const RAW_BOY_NAMES = [
  firstName({ kanji: "翔太", readings: [reading("しょうた")], gender: "boy", themes: ["strength", "flight"], meanings: [meaning("Soar, fly", "翔", "しょう"), meaning("Big, great", "太", "た")] }),
  firstName({
    kanji: "大翔",
    readings: [reading("ひろと", "selected"), reading("はると", "alternative")],
    gender: "boy",
    themes: ["strength", "flight"],
    meanings: [meaning("Big, great", "大", "ひろ"), meaning("Soar, fly", "翔", "と")],
  }),
  firstName({ kanji: "陽翔", readings: [reading("はると")], gender: "boy", themes: ["sun", "flight"], meanings: [meaning("Sun, sunshine", "陽", "はる"), meaning("Soar, fly", "翔", "と")] }),
  firstName({ kanji: "蓮", readings: [reading("れん")], gender: "boy", themes: ["nature", "flower"], meanings: [meaning("Lotus", "蓮", "れん")] }),
  firstName({ kanji: "悠真", readings: [reading("ゆうま")], gender: "boy", themes: ["calm", "truth"], meanings: [meaning("Permanence, leisurely", "悠", "ゆう"), meaning("Truth, reality", "真", "ま")] }),
  firstName({ kanji: "大和", readings: [reading("やまと")], gender: "boy", themes: ["harmony", "strength"], meanings: [meaning("Great harmony; also a historical name for Japan", "大和", "やまと")] }),
  firstName({ kanji: "健太", readings: [reading("けんた")], gender: "boy", themes: ["strength", "health"], meanings: [meaning("Healthy, robust", "健", "けん"), meaning("Big, great", "太", "た")] }),
  firstName({ kanji: "翼", readings: [reading("つばさ")], gender: "boy", themes: ["flight"], meanings: [meaning("Wing", "翼", "つばさ")] }),
  firstName({ kanji: "直樹", readings: [reading("なおき")], gender: "boy", themes: ["honesty", "nature"], meanings: [meaning("Honest, straight", "直", "なお"), meaning("Tree", "樹", "き")] }),
  firstName({ kanji: "拓也", readings: [reading("たくや")], gender: "boy", themes: ["ambition"], meanings: [meaning("Pioneer, open up", "拓", "たく"), meaning("Also (name-ending particle; limited independent meaning)", "也", "や")] }),
  firstName({ kanji: "太郎", readings: [reading("たろう")], gender: "boy", themes: ["strength", "tradition"], meanings: [meaning("Big, great", "太", "た"), meaning("Son, male", "郎", "ろう")] }),
  firstName({ kanji: "健一", readings: [reading("けんいち")], gender: "boy", themes: ["strength", "health"], meanings: [meaning("Healthy, robust", "健", "けん"), meaning("One, first", "一", "いち")] }),
  firstName({ kanji: "大輔", readings: [reading("だいすけ")], gender: "boy", themes: ["strength", "help"], meanings: [meaning("Big, great", "大", "だい"), meaning("Help, assist", "輔", "すけ")] }),
  firstName({ kanji: "誠", readings: [reading("まこと")], gender: "boy", themes: ["sincerity"], meanings: [meaning("Sincerity, truth", "誠", "まこと")] }),
  firstName({ kanji: "亮", readings: [reading("りょう")], gender: "boy", themes: ["clarity"], meanings: [meaning("Clear, bright", "亮", "りょう")] }),
  firstName({ kanji: "陸", readings: [reading("りく")], gender: "boy", themes: ["nature", "land"], meanings: [meaning("Land", "陸", "りく")] }),
  firstName({ kanji: "颯太", readings: [reading("そうた")], gender: "boy", themes: ["strength", "wind"], meanings: [meaning("Gust of wind, brisk", "颯", "そう"), meaning("Big, great", "太", "た")] }),
];

// ─────────────────────── Given names — unisex (7) ────────────────────
export const RAW_UNISEX_NAMES = [
  firstName({ kanji: "光", readings: [reading("ひかり")], gender: "unisex", themes: ["light"], meanings: [meaning("Light", "光", "ひかり")] }),
  firstName({ kanji: "空", readings: [reading("そら")], gender: "unisex", themes: ["sky", "nature"], meanings: [meaning("Sky", "空", "そら")] }),
  firstName({ kanji: "心", readings: [reading("こころ")], gender: "unisex", themes: ["spirit"], meanings: [meaning("Heart, mind, spirit", "心", "こころ")] }),
  firstName({ kanji: "海", readings: [reading("かい")], gender: "unisex", themes: ["nature", "sea"], meanings: [meaning("Sea, ocean", "海", "かい")] }),
  firstName({ kanji: "陽", readings: [reading("ひなた")], gender: "unisex", themes: ["sun"], meanings: [meaning("Sunny place, sunshine", "陽", "ひなた")] }),
  firstName({ kanji: "凛", readings: [reading("りん")], gender: "unisex", themes: ["dignity"], meanings: [meaning("Dignified, severe (composed)", "凛", "りん")] }),
  firstName({ kanji: "樹", readings: [reading("いつき")], gender: "unisex", themes: ["nature", "tree"], meanings: [meaning("Tree", "樹", "いつき")] }),
];

export const RAW_GIVEN_NAMES = [...RAW_GIRL_NAMES, ...RAW_BOY_NAMES, ...RAW_UNISEX_NAMES];
export const RAW_ALL_NAMES = [...RAW_GIVEN_NAMES, ...RAW_SURNAMES];
