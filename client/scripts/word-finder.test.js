#!/usr/bin/env node
// Reference/regression test suite for the Word Finder engine. Plain
// Node + assert, matching this project's established convention for
// engine-level test scripts.
//
// Run with: node scripts/word-finder.test.js

import {
  sanitizeLetters, matchesStartingWith, matchesEndingWith, matchesContainingInOrder, matchesIncluding,
  filterWordsByMode, matchesPattern, filterWordsByPattern, scrabbleScore, sortWords, MATCH_MODES, SORT_OPTIONS,
} from "../src/utils/wordFinderEngine.js";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; failures.push(detail ? `${name}: ${detail}` : name); }
}

// ─────────────────────────────────────────────────────────────────
// sanitizeLetters — untrusted input handling
// ─────────────────────────────────────────────────────────────────
ok("sanitizeLetters lowercases", sanitizeLetters("CAT") === "cat");
ok("sanitizeLetters strips non-letters", sanitizeLetters("c4a!t") === "cat");
ok("sanitizeLetters strips HTML/script content to plain letters", sanitizeLetters("<script>alert(1)</script>") === "scriptalertscript");
ok("sanitizeLetters caps length on very long input", sanitizeLetters("a".repeat(5000)).length === 30);
ok("sanitizeLetters handles null/undefined safely", sanitizeLetters(null) === "" && sanitizeLetters(undefined) === "");
ok("sanitizeLetters handles numeric input safely", sanitizeLetters(12345) === "");

// ─────────────────────────────────────────────────────────────────
// Match modes
// ─────────────────────────────────────────────────────────────────
ok("startingWith: cat starts with ca", matchesStartingWith("cat", "ca"));
ok("startingWith: cat does not start with at", !matchesStartingWith("cat", "at"));
ok("startingWith: empty letters never matches", !matchesStartingWith("cat", ""));

ok("endingWith: cat ends with at", matchesEndingWith("cat", "at"));
ok("endingWith: cat does not end with ca", !matchesEndingWith("cat", "ca"));

ok("containingInOrder: space contains ace in order", matchesContainingInOrder("space", "ace"));
ok("containingInOrder: acre contains ace in order (non-contiguous)", matchesContainingInOrder("acre", "ace"));
ok("containingInOrder: order matters (cat vs tc)", !matchesContainingInOrder("cat", "tc"));
ok("containingInOrder: letters must all be present", !matchesContainingInOrder("cat", "cats"));

ok("including: cat includes act (order-independent)", matchesIncluding("cat", "act"));
ok("including: cat does not include z", !matchesIncluding("cat", "z"));
ok("including: respects duplicate-letter counts (committee has 2 t's)", matchesIncluding("committee", "tt"));
ok("including: fails when input needs more of a letter than the word has", !matchesIncluding("cat", "aa"));
ok("including: word may contain extra letters beyond the input", matchesIncluding("scatter", "cat"));

const MODE_IDS = MATCH_MODES.map((m) => m.id);
ok("MATCH_MODES has all 4 expected modes", ["startingWith", "endingWith", "including", "containingInOrder"].every((id) => MODE_IDS.includes(id)));

{
  const words = ["cat", "cats", "scatter", "act", "tack", "dog"];
  ok("filterWordsByMode: startingWith 'ca'", JSON.stringify(filterWordsByMode(words, "startingWith", "ca").sort()) === JSON.stringify(["cat", "cats"]));
  ok("filterWordsByMode: unknown mode returns empty, never throws", filterWordsByMode(words, "notARealMode", "ca").length === 0);
  ok("filterWordsByMode: empty letters returns empty", filterWordsByMode(words, "startingWith", "").length === 0);
}

// ─────────────────────────────────────────────────────────────────
// Fill-in-the-Blanks pattern matching
// ─────────────────────────────────────────────────────────────────
ok("matchesPattern: exact letters at open positions", matchesPattern("cat", ["c", null, "t"]));
ok("matchesPattern: mismatch fails", !matchesPattern("cat", ["c", null, "g"]));
ok("matchesPattern: length must match exactly", !matchesPattern("cats", ["c", null, "t"]));
ok("matchesPattern: all-blank pattern matches any word of that length", matchesPattern("cat", [null, null, null]));

{
  const words = ["cat", "car", "can", "cap", "bat"];
  ok("filterWordsByPattern: c_t pattern", JSON.stringify(filterWordsByPattern(words, ["c", null, "t"])) === JSON.stringify(["cat"]));
  ok("filterWordsByPattern: all-blank pattern is rejected (not a useful search)", filterWordsByPattern(words, [null, null, null]).length === 0);
}

// ─────────────────────────────────────────────────────────────────
// Scrabble scoring — standard, well-known English tile values
// ─────────────────────────────────────────────────────────────────
ok("scrabbleScore('quiz') = 22 (q10+u1+i1+z10)", scrabbleScore("quiz") === 22);
ok("scrabbleScore('cat') = 5 (c3+a1+t1)", scrabbleScore("cat") === 5);
ok("scrabbleScore('') = 0", scrabbleScore("") === 0);
ok("scrabbleScore ignores unknown characters gracefully", scrabbleScore("ca7t") === 5);

// ─────────────────────────────────────────────────────────────────
// Sorting
// ─────────────────────────────────────────────────────────────────
{
  const words = ["banana", "apple", "cherry"];
  ok("sortWords alphabetical", JSON.stringify(sortWords(words, "alphabetical")) === JSON.stringify(["apple", "banana", "cherry"]));
  const byLength = sortWords(["cat", "elephant", "dog"], "length");
  ok("sortWords by length puts longest first", byLength[0] === "elephant");
  const byScore = sortWords(["cat", "quiz", "at"], "score");
  ok("sortWords by score puts highest-scoring first", byScore[0] === "quiz");
  ok("sortWords does not mutate the input array", (() => { const orig = ["b", "a"]; sortWords(orig, "alphabetical"); return orig[0] === "b"; })());
}
ok("SORT_OPTIONS has all 3 expected options", SORT_OPTIONS.length === 3);

// ─────────────────────────────────────────────────────────────────
// Security / robustness — malicious or malformed input never crashes
// ─────────────────────────────────────────────────────────────────
{
  let threw = false;
  try {
    filterWordsByMode(["cat", "dog"], "including", "<img src=x onerror=alert(1)>");
    filterWordsByPattern(["cat", "dog"], ["'; DROP TABLE words; --".slice(0, 1), null, null]);
    matchesContainingInOrder("cat", "a".repeat(10000));
  } catch { threw = true; }
  ok("engine functions never throw on malicious/oversized input", !threw);
}

// ─────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────
console.log(`\nWord Finder engine suite: ${pass} passed, ${fail} failed.`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
