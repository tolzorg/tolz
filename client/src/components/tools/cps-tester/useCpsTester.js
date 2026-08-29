// CPS Tester — React hook. Owns UI-facing state only; all measurement
// logic lives in the framework-agnostic CpsEngine (utils/cpsEngine.js).
//
// Performance design (spec "PERFORMANCE" section): every click is
// recorded straight into the engine instance held in a ref — never
// triggers a React render by itself. A single requestAnimationFrame
// loop, running only while a test is active, reads one snapshot per
// frame and pushes it into state — so the visible UI updates at a
// steady ~60fps regardless of how fast the user is actually clicking,
// and clicking speed itself never drives React's render rate.

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import {
  CpsEngine, now, isValidPointerClick, isValidKeyPress, validateCustomDuration,
  formatKeyLabel, UNBINDABLE_KEY_CODES,
} from "../../../utils/cpsEngine";
import { PRESET_DURATIONS, HISTORY_STORAGE_KEY, PERSONAL_BEST_STORAGE_KEY, MAX_HISTORY_ENTRIES } from "../../../utils/cpsConfig";

const DEFAULT_KEY_BINDING = { code: "Space", label: "Space" };

function personalBestKey(mode, durationSeconds) {
  return `${mode}:${durationSeconds}`;
}

export function useCpsTester() {
  const [mode, setModeState] = useState("mouse");
  const [durationSeconds, setDurationState] = useState(PRESET_DURATIONS[1]); // 5s default
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState(null);
  const [keyBinding, setKeyBinding] = useState(DEFAULT_KEY_BINDING); // which physical key Keyboard mode counts
  const [isCapturingKey, setIsCapturingKey] = useState(false);

  const [snapshot, setSnapshot] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);

  // Unified persistence policy (spec amendment 22): both History and
  // Personal Best live in the same place — the project's shared
  // localStorage hook — never one persisted and the other in-memory.
  const [history, setHistory] = useLocalStorage(HISTORY_STORAGE_KEY, []);
  const [personalBests, setPersonalBests] = useLocalStorage(PERSONAL_BEST_STORAGE_KEY, {});

  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const finalizedRef = useRef(false); // guards against double-recording one test's result

  // Always called with explicit (mode, duration) args from every call
  // site below except the one-time mount effect, which intentionally
  // wants this closure's initial mode/durationSeconds as the defaults.
  const arm = useCallback((nextMode = mode, nextDuration = durationSeconds) => {
    engineRef.current = new CpsEngine({ durationSeconds: nextDuration, mode: nextMode });
    finalizedRef.current = false;
    setSnapshot(engineRef.current.getSnapshot(now()));
    setCancelMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arm once on mount.
  useEffect(() => { arm(); }, [arm]);

  const isActive = snapshot?.status === "active";

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const finalizeIfNeeded = useCallback((snap) => {
    if (snap.status !== "completed" || finalizedRef.current) return;
    finalizedRef.current = true;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dateTime: new Date().toLocaleString(undefined, {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
      }),
      mode: snap.mode,
      durationSeconds: snap.durationSeconds,
      clickCount: snap.clickCount,
      averageCps: snap.averageCps,
      peakCps: snap.peakCps,
    };
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));

    const key = personalBestKey(snap.mode, snap.durationSeconds);
    setPersonalBests((prev) => {
      const existing = prev[key] || { averageCps: 0, peakCps: 0, clickCount: 0 };
      return {
        ...prev,
        [key]: {
          averageCps: Math.max(existing.averageCps, snap.averageCps ?? 0),
          peakCps: Math.max(existing.peakCps, snap.peakCps ?? 0),
          clickCount: Math.max(existing.clickCount, snap.clickCount ?? 0),
        },
      };
    });
  }, [setHistory, setPersonalBests]);

  // A self-scheduling rAF loop can't be a plain useCallback (it would
  // need to reference its own not-yet-assigned binding). Instead, a
  // ref always holds the latest implementation, kept fresh by this
  // effect; the actual requestAnimationFrame calls always dereference
  // the ref, so nothing stale ever gets scheduled.
  const loopRef = useRef(null);
  useEffect(() => {
    loopRef.current = () => {
      const engine = engineRef.current;
      if (!engine) return;
      const t = now();
      engine.checkExpiry(t);
      const snap = engine.getSnapshot(t);
      setSnapshot(snap);
      finalizeIfNeeded(snap);
      if (snap.status === "active") {
        rafRef.current = requestAnimationFrame(() => loopRef.current());
      } else {
        stopLoop();
      }
    };
  }, [finalizeIfNeeded, stopLoop]);

  const startLoopIfNeeded = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(() => loopRef.current());
  }, []);

  // Every click goes straight into the engine (a ref — no render).
  // Only the FIRST click (ready -> active) triggers an immediate state
  // update, so the UI flips to "active" without waiting a frame; every
  // click after that is picked up by the already-running rAF loop on
  // its next tick (well under 16ms later), never by the click itself.
  const recordClick = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const wasReady = engine.status === "ready";
    engine.recordClick(now());
    if (wasReady) {
      setSnapshot(engine.getSnapshot(now()));
      startLoopIfNeeded();
    }
  }, [startLoopIfNeeded]);

  // ── Pointer handling (mouse + touch, single unified path so one
  // physical interaction is never counted via two different event
  // types — Sections 10/11/32) ──────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (mode === "keyboard") return;
    if (!isValidPointerClick(mode, { pointerType: e.pointerType, button: e.button, isTrusted: e.isTrusted })) return;
    // Suppress the browser's compatibility mouse-event synthesis after a
    // touch interaction — this is the only listener on the click area
    // (no separate onClick/onTouchStart), so nothing else could
    // double-count the same physical interaction even without this, but
    // preventDefault keeps a synthesized click from reaching anything else.
    e.preventDefault();
    recordClick();
  }, [mode, recordClick]);

  // ── Keyboard handling (separate mode — Section 12) ────────────────
  // Keyboard mode is bindable to any single key the user picks (not
  // just Space/Enter). While isCapturingKey is true, the next valid
  // keydown is consumed to SET the binding rather than counted as a
  // click; UNBINDABLE_KEY_CODES (Escape/Tab) are ignored so capture
  // keeps waiting rather than binding a key that would break standard
  // browser navigation.
  const startKeyCapture = useCallback(() => {
    if (isActive) return; // never rebind mid-test, same rule as mode/duration switching
    setIsCapturingKey(true);
  }, [isActive]);
  const cancelKeyCapture = useCallback(() => setIsCapturingKey(false), []);

  useEffect(() => {
    if (mode !== "keyboard") return undefined;
    function onKeyDown(e) {
      if (isCapturingKey) {
        if (!e.isTrusted || UNBINDABLE_KEY_CODES.includes(e.code)) return;
        e.preventDefault();
        setKeyBinding({ code: e.code, label: formatKeyLabel(e.code) });
        setIsCapturingKey(false);
        return;
      }
      if (!isValidKeyPress({ code: e.code, repeat: e.repeat, isTrusted: e.isTrusted }, keyBinding.code)) return;
      e.preventDefault();
      recordClick();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, keyBinding.code, isCapturingKey, recordClick]);

  // ── Tab visibility — cancel an active test rather than silently
  // producing an inaccurate result (Sections 16/17: visibilitychange is
  // the sole authoritative cancel trigger; blur alone never cancels) ──
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "hidden") return;
      const engine = engineRef.current;
      if (!engine || engine.status !== "active") return; // only an in-progress test needs cancelling
      engine.cancel("tab_hidden", now());
      stopLoop();
      setSnapshot(engine.getSnapshot(now()));
      setCancelMessage("Test cancelled because the browser tab became inactive.");
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [stopLoop]);

  // ── Cleanup on unmount — no stale rAF loop can outlive the component ─
  useEffect(() => () => stopLoop(), [stopLoop]);

  // Reset works at any time — ready, active, completed, or cancelled —
  // and leaves nothing behind: stopLoop() cancels the rAF frame (so no
  // stale timer can fire), arm() replaces engineRef.current with a
  // brand-new CpsEngine (the old one, and everything it was tracking,
  // is simply discarded, never reused), and any in-progress key-binding
  // capture is cancelled so it can't leak into whatever the user does
  // next. mode/duration/keyBinding are intentionally left as-is — reset
  // clears the current test/run, not the user's chosen settings.
  const reset = useCallback(() => {
    stopLoop();
    setIsCapturingKey(false);
    arm(mode, durationSeconds);
  }, [stopLoop, arm, mode, durationSeconds]);

  const setMode = useCallback((next) => {
    if (isActive) return; // Section 29 — never switch input mode mid-test
    setModeState(next);
    stopLoop();
    arm(next, durationSeconds);
  }, [isActive, stopLoop, arm, durationSeconds]);

  const selectPresetDuration = useCallback((seconds) => {
    if (isActive) return;
    setDurationState(seconds);
    setCustomInput("");
    setCustomError(null);
    stopLoop();
    arm(mode, seconds);
  }, [isActive, stopLoop, arm, mode]);

  const applyCustomDuration = useCallback((rawValue) => {
    setCustomInput(rawValue);
    if (isActive) return;
    const result = validateCustomDuration(rawValue);
    if (!result.valid) { setCustomError(result.error); return; }
    setCustomError(null);
    setDurationState(result.value);
    stopLoop();
    arm(mode, result.value);
  }, [isActive, stopLoop, arm, mode]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);
  const clearPersonalBests = useCallback(() => setPersonalBests({}), [setPersonalBests]);

  const currentPersonalBest = personalBests[personalBestKey(mode, durationSeconds)] || null;

  return {
    mode, setMode,
    keyBinding, isCapturingKey, startKeyCapture, cancelKeyCapture,
    durationSeconds, selectPresetDuration, customInput, customError, applyCustomDuration,
    snapshot, cancelMessage, reset,
    handlePointerDown, recordClick,
    history, clearHistory,
    personalBests, currentPersonalBest, clearPersonalBests,
  };
}
