#!/usr/bin/env node
// Build pipeline: ENABLE word list (enable1.txt, public domain — created
// by Alan Beale specifically for word-game use, the same word list
// underlying "the more verbose version of the Official Scrabble
// Player's Dictionary" used by word-game tools) -> sharded JSON files
// by word length, written to public/data/word-finder/.
//
// USAGE:
//   1. Download the source list (do NOT commit it — ~1.7MB, and it's
//      independently available and regenerable):
//        curl -o enable1.txt https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
//   2. Run this script:
//        node scripts/build-word-finder-dataset.mjs enable1.txt public/data/word-finder

import fs from "node:fs";
import path from "node:path";

const IN_PATH = process.argv[2] || "enable1.txt";
const OUT_DIR = process.argv[3] || "word-finder-out";

const raw = fs.readFileSync(IN_PATH, "utf8");
const words = raw
  .split(/\r?\n/)
  .map((w) => w.trim().toLowerCase())
  .filter((w) => w.length > 0 && /^[a-z]+$/.test(w));

console.log(`Read ${words.length} words.`);

const uniqueWords = [...new Set(words)].sort();
console.log(`Unique: ${uniqueWords.length}`);

const byLength = new Map();
for (const w of uniqueWords) {
  const len = w.length;
  if (!byLength.has(len)) byLength.set(len, []);
  byLength.get(len).push(w);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const manifest = { total: uniqueWords.length, lengths: {}, minLength: Infinity, maxLength: 0 };

for (const [len, list] of [...byLength.entries()].sort((a, b) => a[0] - b[0])) {
  fs.writeFileSync(path.join(OUT_DIR, `${len}.json`), JSON.stringify(list));
  manifest.lengths[len] = list.length;
  manifest.minLength = Math.min(manifest.minLength, len);
  manifest.maxLength = Math.max(manifest.maxLength, len);
}

fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Wrote", Object.keys(manifest.lengths).length, "length shards. Total words:", manifest.total);
console.log("Length range:", manifest.minLength, "-", manifest.maxLength);
