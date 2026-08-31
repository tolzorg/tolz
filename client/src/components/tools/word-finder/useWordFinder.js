// Word Finder — React hook. Owns UI-facing state only; all matching
// logic lives in wordFinderEngine.js, all data fetching in
// wordFinderDataSource.js.

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchManifest, fetchLengthShard, fetchAllWords } from "../../../utils/wordFinderDataSource";
import {
  MATCH_MODES, SORT_OPTIONS, filterWordsByMode, filterWordsByPattern, sanitizeLetters, sortWords, scrabbleScore,
} from "../../../utils/wordFinderEngine";

const RESULTS_PAGE_SIZE = 60;
const MAX_RESULTS_COMPUTED = 5000; // never filter/sort more than this many matches at once — matched words beyond this are still real, just not all rendered/held (see lastSearchInfo.truncated)
const DEFAULT_BLANK_LENGTH = 5;

export function useWordFinder() {
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchManifest().then((m) => { if (!cancelled) setManifest(m); });
    return () => { cancelled = true; };
  }, []);

  const lengthOptions = useMemo(() => {
    if (!manifest) return [];
    const max = Math.min(15, manifest.maxLength || 15);
    const opts = [];
    for (let n = 2; n <= max; n++) opts.push(n);
    return opts;
  }, [manifest]);

  // ── Main search ──────────────────────────────────────────────────
  const [lengthFilter, setLengthFilter] = useState("any"); // "any" | number
  const [matchType, setMatchType] = useState("startingWith");
  const [lettersInput, setLettersInput] = useState("");
  const [sortBy, setSortBy] = useState("alphabetical");
  const [resultsLimit, setResultsLimit] = useState(RESULTS_PAGE_SIZE);

  const [isSearching, setIsSearching] = useState(false);
  const [rawResults, setRawResults] = useState([]); // unsorted — `results` below derives the sorted view
  const [lastSearchInfo, setLastSearchInfo] = useState(null); // { source, totalMatches, truncated, description }

  const runSearch = useCallback(async () => {
    const letters = sanitizeLetters(lettersInput);
    if (!letters) {
      setLastSearchInfo({ source: "search", error: "Enter one or more letters to search for." });
      setRawResults([]);
      return;
    }
    setIsSearching(true);
    setResultsLimit(RESULTS_PAGE_SIZE);
    try {
      const pool = lengthFilter === "any" ? await fetchAllWords() : await fetchLengthShard(Number(lengthFilter));
      const matches = filterWordsByMode(pool, matchType, letters);
      const truncated = matches.length > MAX_RESULTS_COMPUTED;
      setRawResults(truncated ? matches.slice(0, MAX_RESULTS_COMPUTED) : matches);
      const modeLabel = MATCH_MODES.find((m) => m.id === matchType)?.label || matchType;
      setLastSearchInfo({
        source: "search",
        totalMatches: matches.length,
        truncated,
        description: `${lengthFilter === "any" ? "Any-length words" : `${lengthFilter}-letter words`} ${modeLabel.toLowerCase()} "${letters}"`,
      });
    } finally {
      setIsSearching(false);
    }
  }, [lettersInput, lengthFilter, matchType]);

  // ── Fill-in-the-Blanks ───────────────────────────────────────────
  const [blankLength, setBlankLengthState] = useState(DEFAULT_BLANK_LENGTH);
  const [letterBoxes, setLetterBoxes] = useState(() => Array(DEFAULT_BLANK_LENGTH).fill(""));

  const setBlankLength = useCallback((n) => {
    const len = Number(n);
    setBlankLengthState(len);
    setLetterBoxes((prev) => Array.from({ length: len }, (_, i) => prev[i] || ""));
  }, []);

  const setLetterBox = useCallback((index, value) => {
    const ch = sanitizeLetters(value).slice(0, 1);
    setLetterBoxes((prev) => prev.map((v, i) => (i === index ? ch : v)));
  }, []);

  const runFillInBlanks = useCallback(async () => {
    const pattern = letterBoxes.map((v) => (v ? v : null));
    if (!pattern.some(Boolean)) {
      setLastSearchInfo({ source: "fillInBlanks", error: "Fill in at least one letter." });
      setRawResults([]);
      return;
    }
    setIsSearching(true);
    setResultsLimit(RESULTS_PAGE_SIZE);
    try {
      const shard = await fetchLengthShard(blankLength);
      const matches = filterWordsByPattern(shard, pattern);
      setRawResults(matches);
      setLastSearchInfo({
        source: "fillInBlanks",
        totalMatches: matches.length,
        truncated: false,
        description: `${blankLength}-letter words matching "${pattern.map((p) => p || "_").join("")}"`,
      });
    } finally {
      setIsSearching(false);
    }
  }, [letterBoxes, blankLength]);

  // Sorting is purely derived — changing sortBy re-sorts the already-computed matches without re-searching.
  const results = useMemo(() => sortWords(rawResults, sortBy), [rawResults, sortBy]);
  const visibleResults = useMemo(() => results.slice(0, resultsLimit), [results, resultsLimit]);
  const loadMoreResults = useCallback(() => setResultsLimit((n) => n + RESULTS_PAGE_SIZE), []);

  return {
    manifest, lengthOptions,
    matchModes: MATCH_MODES, sortOptions: SORT_OPTIONS,
    // main search
    lengthFilter, setLengthFilter, matchType, setMatchType, lettersInput, setLettersInput, runSearch,
    // fill in the blanks
    blankLength, setBlankLength, letterBoxes, setLetterBox, runFillInBlanks,
    // results (shared)
    isSearching, results: visibleResults, resultsTotal: results.length, lastSearchInfo,
    loadMoreResults, hasMoreResults: resultsLimit < results.length,
    sortBy, setSortBy, scrabbleScore,
  };
}
