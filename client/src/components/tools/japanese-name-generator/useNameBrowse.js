// Japanese Name Generator — A-Z browse hook for one bulk category
// (girl | boy | surname). Lazily fetches the manifest (counts only)
// and, per selected letter, that single shard — never the whole
// category at once. Sort/pagination happen client-side within
// whatever shard is currently loaded.

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchManifest, fetchShard } from "../../../utils/japaneseNameDataSource";

const PAGE_SIZE = 48;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function useNameBrowse(category) {
  const [manifest, setManifest] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoadingShard, setIsLoadingShard] = useState(false);
  const [sortBy, setSortByState] = useState("az"); // az | random | fewest
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetchManifest(category).then((m) => { if (!cancelled) setManifest(m); });
    return () => { cancelled = true; };
  }, [category]);

  // Math.random() is impure and must never run inside render/useMemo.
  // The shuffle for "random" sort is instead computed directly inside
  // event handlers (selectLetter's fetch callback, and setSortBy) —
  // both are fine places for impure calls — and cached in state.
  const [randomOrder, setRandomOrder] = useState([]);
  const shuffled = useCallback((list) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const selectLetter = useCallback((letter) => {
    setSelectedLetter(letter);
    setPage(1);
    setIsLoadingShard(true);
    fetchShard(category, letter)
      .then((recs) => {
        const list = Array.isArray(recs) ? recs : [];
        setRecords(list);
        setRandomOrder(shuffled(list));
      })
      .catch(() => { setRecords([]); setRandomOrder([]); })
      .finally(() => setIsLoadingShard(false));
  }, [category, shuffled]);

  const setSortBy = useCallback((v) => {
    setSortByState(v);
    setPage(1);
    if (v === "random") setRandomOrder((prev) => shuffled(records.length ? records : prev));
  }, [records, shuffled]);

  const sortedRecords = useMemo(() => {
    if (sortBy === "az") return [...records].sort((a, b) => a.romaji.localeCompare(b.romaji));
    if (sortBy === "fewest") return [...records].sort((a, b) => a.kanjiCount - b.kanjiCount);
    if (sortBy === "random") return randomOrder;
    return records;
  }, [records, sortBy, randomOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const pageRecords = useMemo(
    () => sortedRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedRecords, page]
  );

  const goToPage = useCallback((p) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);

  return {
    letters: LETTERS,
    manifest,
    selectedLetter, selectLetter,
    records: pageRecords,
    totalMatches: sortedRecords.length,
    isLoadingShard,
    sortBy, setSortBy,
    page, totalPages, goToPage,
  };
}
