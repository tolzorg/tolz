// Japanese Name Generator — React hook. Owns UI-facing state only; all
// dataset validation, generation, search-matching, and transliteration
// logic lives in the framework-agnostic modules under src/utils/.
//
// Two data layers are blended here:
//  - CURATED set (src/data/japaneseNamesRaw.js, ~68 records): small,
//    always loaded synchronously, has real sourced MEANINGS.
//  - BULK set (public/data/japanese-names/, ~320k records from
//    JMnedict/ENAMDICT, CC BY-SA 4.0): large, fetched lazily per shard
//    on demand, has Kanji/reading/gender-classification but NO meaning
//    data (see japaneseNameDataSource.js for why). Any filter that
//    depends on meaning (the theme filter) is therefore curated-only —
//    bulk records simply have empty themes[], so they're naturally
//    excluded rather than needing special-casing.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { RAW_ALL_NAMES } from "../../../data/japaneseNamesRaw";
import { ingestDataset, buildIndexes } from "../../../utils/japaneseNameIngestion";
import {
  filterRecords, generateNames, generateFullNames, findSimilarNames, validateQuantity, validateEnum,
} from "../../../utils/japaneseNameEngine";
import { nameMatchesQuery } from "../../../utils/japaneseNameSearch";
import { transliterateToKatakana } from "../../../utils/katakanaTransliteration";
import { romajiFromReading, capitalizeRomaji } from "../../../utils/japaneseNameRomaji";
import { BULK_CATEGORIES, generateFromBulk, searchBulk } from "../../../utils/japaneseNameDataSource";

const FAVORITES_KEY = "tolz-japanese-name-favorites";
const NAME_ORDER_KEY = "tolz-japanese-name-order";
const SEARCH_PAGE_SIZE = 30;
const MAX_FOREIGN_NAME_LENGTH = 80;
const MAX_COMPARE = 5;
const SEARCH_DEBOUNCE_MS = 300;

const DEFAULT_FILTERS = { meaningTheme: "", initial: "", kanjiCount: "", moraCount: "" };

function bulkCategoriesFor(nameType, gender) {
  if (nameType === "lastName") return ["surname"];
  if (nameType === "firstName") {
    if (gender === "girl") return ["girl"];
    if (gender === "boy") return ["boy"];
    if (gender === "unisex") return ["unisex"];
    return ["girl", "boy", "unisex", "givenOther"];
  }
  return [];
}

function bulkPredicate(filters) {
  return (r) => {
    if (filters.initial && r.initial !== filters.initial.toUpperCase()) return false;
    if (filters.kanjiCount && r.kanjiCount !== Number(filters.kanjiCount)) return false;
    if (filters.moraCount && r.moraCount !== Number(filters.moraCount)) return false;
    return true;
  };
}

async function pullBulk(categories, need, filters, excludeIds) {
  if (!categories.length || need <= 0) return [];
  const results = [];
  const seen = new Set(excludeIds);
  const predicate = bulkPredicate(filters);
  let attempts = 0;
  while (results.length < need && attempts < need * 6 + 10) {
    attempts += 1;
    const category = categories[Math.floor(Math.random() * categories.length)];
     
    const picked = await generateFromBulk(category, 1, predicate);
    for (const p of picked) {
      if (!seen.has(p.id)) { seen.add(p.id); results.push(p); }
    }
  }
  return results;
}

async function pullBulkFullNames(need, filters, usedPairKeys) {
  if (need <= 0) return [];
  const results = [];
  const used = new Set(usedPairKeys);
  const givenCategories = bulkCategoriesFor("firstName", filters.gender);
  const predicate = bulkPredicate(filters);
  let attempts = 0;
  while (results.length < need && attempts < need * 8 + 10) {
    attempts += 1;
    const givenCategory = givenCategories[Math.floor(Math.random() * givenCategories.length)];
     
    const [surnames, givens] = await Promise.all([
      generateFromBulk("surname", 1, predicate),
      generateFromBulk(givenCategory, 1, predicate),
    ]);
    if (!surnames.length || !givens.length) continue;
    const surname = surnames[0], given = givens[0];
    const key = `${surname.id}::${given.id}`;
    if (used.has(key)) continue;
    used.add(key);
    results.push({
      id: `full::${key}`,
      combinationType: "generated",
      surname, given,
      kanji: `${surname.kanji}${given.kanji}`,
      romaji: `${surname.romaji} ${given.romaji}`,
    });
  }
  return results;
}

export function useJapaneseNameGenerator() {
  // Curated dataset is validated exactly once (Section 2A) — never re-run per render.
  const dataset = useMemo(() => {
    const ingested = ingestDataset(RAW_ALL_NAMES);
    return { ...ingested, indexes: buildIndexes(ingested.records) };
  }, []);

  const [nameType, setNameType] = useState("firstName"); // firstName | lastName | fullName
  const [gender, setGender] = useState("any");
  const [quantity, setQuantityState] = useState(5);
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [generatedResults, setGeneratedResults] = useState([]);
  const [lastGenerationInfo, setLastGenerationInfo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLimit, setSearchLimit] = useState(SEARCH_PAGE_SIZE);
  const [bulkSearchResults, setBulkSearchResults] = useState([]);
  const [isSearchingBulk, setIsSearchingBulk] = useState(false);
  const searchRequestId = useRef(0);

  const [detailsRecord, setDetailsRecord] = useState(null);

  const [foreignName, setForeignName] = useState("");

  const [favorites, setFavorites] = useLocalStorage(FAVORITES_KEY, []);
  const [nameOrder, setNameOrder] = useLocalStorage(NAME_ORDER_KEY, "japanese");

  const setQuantity = useCallback((n) => setQuantityState(validateQuantity(n, 5)), []);
  const setFilters = useCallback((partial) => setFiltersState((prev) => ({ ...prev, ...partial })), []);
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setGender("any");
    setSearchQuery("");
    setSearchLimit(SEARCH_PAGE_SIZE);
    setBulkSearchResults([]);
  }, []);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const activeFilters = { ...filters, gender };
      const bulkEligible = !filters.meaningTheme; // bulk records have no themes — meaning search stays curated-only

      if (nameType === "fullName") {
        const curated = generateFullNames(dataset.records, { filters: activeFilters, quantity });
        let results = curated.results;
        if (bulkEligible && results.length < quantity) {
          const more = await pullBulkFullNames(quantity - results.length, activeFilters, results.map((r) => `${r.surname.id}::${r.given.id}`));
          results = [...results, ...more];
        }
        setGeneratedResults(results);
        setLastGenerationInfo({ availableCount: bulkEligible ? null : curated.availableCount, isBulkAugmented: bulkEligible });
      } else {
        const curated = generateNames(dataset.records, { type: nameType, filters: activeFilters, quantity });
        let results = curated.results;
        if (bulkEligible && results.length < quantity) {
          const categories = bulkCategoriesFor(nameType, gender);
          const more = await pullBulk(categories, quantity - results.length, activeFilters, results.map((r) => r.id));
          results = [...results, ...more];
        }
        setGeneratedResults(results);
        setLastGenerationInfo({ availableCount: bulkEligible ? null : curated.availableCount, isBulkAugmented: bulkEligible });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [dataset.records, nameType, gender, filters, quantity]);

  // ── Search: curated (instant, synchronous) + bulk (debounced, async) ─
  const searchResultsAll = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return dataset.records.filter((r) => nameMatchesQuery(r, searchQuery));
  }, [dataset.records, searchQuery]);
  const searchResults = useMemo(() => searchResultsAll.slice(0, searchLimit), [searchResultsAll, searchLimit]);
  const loadMoreSearchResults = useCallback(() => setSearchLimit((n) => n + SEARCH_PAGE_SIZE), []);

  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = ++searchRequestId.current;

    // All setState calls happen inside this async timer callback (never
    // synchronously in the effect body) — including the empty-query
    // reset, so the effect itself only ever subscribes/schedules.
    const timer = setTimeout(() => {
      if (!query) { setBulkSearchResults([]); setIsSearchingBulk(false); return; }
      setIsSearchingBulk(true);
      searchBulk(query, BULK_CATEGORIES, { limit: 60 })
        .then((results) => {
          if (searchRequestId.current !== requestId) return; // stale response, a newer query superseded it
          const curatedIds = new Set(searchResultsAll.map((r) => r.id));
          setBulkSearchResults(results.filter((r) => !curatedIds.has(r.id)));
        })
        .catch(() => { if (searchRequestId.current === requestId) setBulkSearchResults([]); })
        .finally(() => { if (searchRequestId.current === requestId) setIsSearchingBulk(false); });
    }, query ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [searchQuery, searchResultsAll]);

  const runSearch = useCallback((q) => {
    setSearchQuery(q);
    setSearchLimit(SEARCH_PAGE_SIZE);
  }, []);

  // ── Details dialog ───────────────────────────────────────────────
  const openDetails = useCallback((record) => setDetailsRecord(record), []);
  const closeDetails = useCallback(() => setDetailsRecord(null), []);

  // ── Generate Similar (curated-set metadata only — see file header) ─
  const similarTo = useCallback((record) => findSimilarNames(record, dataset.records, { limit: 5 }), [dataset.records]);
  const showSimilar = useCallback((record) => {
    const results = similarTo(record);
    setGeneratedResults(results);
    setLastGenerationInfo({ availableCount: results.length, similarTo: record });
  }, [similarTo]);

  // ── Favorites (preserve record identity, not just a live reference) ─
  const isFavorite = useCallback((id) => favorites.some((f) => f.id === id), [favorites]);
  const addFavorite = useCallback((record) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === record.id)) return prev;
      const snapshot = record.combinationType
        ? { id: record.id, type: "fullName", kanji: record.kanji, romaji: record.romaji, combinationType: record.combinationType, surnameId: record.surname?.id, givenId: record.given?.id, addedAt: Date.now() }
        : { id: record.id, type: record.type, kanji: record.kanji, hiragana: record.hiragana, romaji: record.romaji, addedAt: Date.now() };
      return [snapshot, ...prev];
    });
  }, [setFavorites]);
  const removeFavorite = useCallback((id) => setFavorites((prev) => prev.filter((f) => f.id !== id)), [setFavorites]);
  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  // Resolve each favorite against the current (live) CURATED dataset for
  // up-to-date details, falling back to the preserved snapshot fields —
  // bulk-sourced favorites always fall back to their snapshot, since
  // re-fetching their shard just to refresh a favorite isn't worth it
  // (their snapshot already carries everything the favorites list shows).
  const resolvedFavorites = useMemo(
    () => favorites.map((f) => ({ ...f, live: dataset.indexes.byId.get(f.id) || null })),
    [favorites, dataset.indexes]
  );

  // ── Compare (2-5 names) ──────────────────────────────────────────
  // Compare entries store {id, record} together in real state (not a
  // ref — refs must never be read during render/memo) so bulk-sourced
  // records (which carry their own full data, unlike curated ones
  // that can be looked up by id) can be compared too.
  const [compareEntries, setCompareEntries] = useState([]);
  const compareIds = useMemo(() => compareEntries.map((e) => e.id), [compareEntries]);
  const toggleCompare = useCallback((record) => {
    const id = typeof record === "string" ? record : record.id;
    setCompareEntries((prev) => {
      if (prev.some((e) => e.id === id)) return prev.filter((e) => e.id !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      const resolvedRecord = typeof record === "string" ? dataset.indexes.byId.get(id) || null : record;
      return [...prev, { id, record: resolvedRecord }];
    });
  }, [dataset.indexes]);
  const clearCompare = useCallback(() => setCompareEntries([]), []);
  const compareRecords = useMemo(() => compareEntries.map((e) => e.record).filter(Boolean), [compareEntries]);

  // ── My Name in Japanese (foreign-name transliteration) ───────────
  const foreignNameResult = useMemo(() => {
    const trimmed = String(foreignName || "").slice(0, MAX_FOREIGN_NAME_LENGTH);
    if (!trimmed.trim()) return null;
    const { katakana } = transliterateToKatakana(trimmed);
    if (!katakana) return null;
    const hiraganaEquivalent = katakana.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
    return {
      input: trimmed,
      katakana,
      hiragana: hiraganaEquivalent,
      romaji: capitalizeRomaji(romajiFromReading(hiraganaEquivalent)) || katakana,
    };
  }, [foreignName]);

  return {
    dataset,
    // generator
    nameType, setNameType: (v) => setNameType(validateEnum(v, ["firstName", "lastName", "fullName"], "firstName")),
    gender, setGender: (v) => setGender(validateEnum(v, ["any", "girl", "boy", "unisex"], "any")),
    quantity, setQuantity,
    filters, setFilters, resetFilters,
    generatedResults, lastGenerationInfo, generate, isGenerating,
    // search
    searchQuery, runSearch, searchResults, searchResultsTotal: searchResultsAll.length, loadMoreSearchResults,
    bulkSearchResults, isSearchingBulk,
    // details
    detailsRecord, openDetails, closeDetails,
    // similarity
    similarTo, showSimilar,
    // favorites
    favorites: resolvedFavorites, isFavorite, addFavorite, removeFavorite, clearFavorites,
    // compare
    compareIds, compareRecords, toggleCompare, clearCompare,
    // name order
    nameOrder, setNameOrder: (v) => setNameOrder(validateEnum(v, ["japanese", "international"], "japanese")),
    // foreign name
    foreignName, setForeignName, foreignNameResult,
  };
}
