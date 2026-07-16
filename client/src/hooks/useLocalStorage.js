import { useCallback, useState } from "react";

function safeRead(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? initialValue : JSON.parse(raw);
  } catch {
    // Storage disabled (private browsing), or corrupted JSON — fall back silently.
    return initialValue;
  }
}

// Generic, storage-safe useState-like hook. Never throws: a disabled or
// corrupted localStorage degrades to in-memory-only behavior instead of
// crashing the tool.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => safeRead(key, initialValue));

  const setStoredValue = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Quota exceeded or storage unavailable — keep the in-memory value only.
      }
      return resolved;
    });
  }, [key]);

  return [value, setStoredValue];
}
