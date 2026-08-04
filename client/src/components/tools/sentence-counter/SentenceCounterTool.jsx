import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import SentenceCounterEditor from "./SentenceCounterEditor";
import SentenceList from "./SentenceList";
import ReadabilityPanel from "./ReadabilityPanel";
import { analyzeText, computeDuration, formatDuration, matchesQuery, EMPTY_ANALYSIS } from "../../../utils/sentenceCounterAnalysis";
import { readTextFile, fmtNum } from "../../../utils/wordCounter";
import { looksLikeBinaryText } from "../../../utils/textFileValidation";
import {
  exportSentencesTxt, exportSentencesCsv, exportAnalysisJson,
  exportStatsTxt, printAnalysis,
} from "../../../utils/sentenceCounterExport";

const SAMPLE_TEXT = `Dr. Sarah Chen stared at the data on her screen. The results were, to put it mildly, astonishing. After three years of research, her team had finally confirmed what they'd long suspected: the compound worked.

"This changes everything," she whispered. Her colleague, Prof. Martinez, nodded in agreement. They had tested it on over 200 samples, and the success rate exceeded 95%.

But questions remained. Would the F.D.A. approve it quickly? How would investors react? And, more importantly, how many lives could this actually save?

Sarah closed her laptop and looked out the window. Somewhere out there, patients were waiting. Waiting for hope. Waiting for answers. She smiled, quietly, and picked up her phone to call the rest of the team.`;

const LARGE_DOC_WORD_THRESHOLD = 40000;

function CopyButton({ getText, label = "Copy", disabled }) {
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  async function handleCopy() {
    const text = getText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        Object.assign(ta.style, { position: "fixed", opacity: "0" });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setState("copied");
      } catch {
        setState("error");
      }
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={handleCopy} disabled={disabled} style={{ padding: "9px 16px", fontSize: 13 }}>
      {state === "copied" ? "Copied!" : label}
    </button>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ padding: "13px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-white)" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 5, fontFamily: "var(--font-display)" }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function SentenceCounterTool() {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [readingWpm, setReadingWpm] = useState(225);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const fileInputRef = useRef(null);

  const deferredText = useDeferredValue(text);

  // Cheap O(n) whitespace-split estimate — used only to decide whether to
  // route through the Web Worker below. The real, precise stats always
  // come from analyzeText() itself (same function either way), so this
  // estimate never affects any displayed number.
  const roughWordEstimate = useMemo(() => {
    const trimmed = deferredText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [deferredText]);
  const useWorker = roughWordEstimate > LARGE_DOC_WORD_THRESHOLD;

  // Small/medium documents (the overwhelming majority of usage): analyzed
  // synchronously, exactly as before — zero behavior change.
  const syncAnalysis = useMemo(
    () => (useWorker ? null : analyzeText(deferredText)),
    [deferredText, useWorker]
  );

  // Large documents: the identical analyzeText() runs inside a Web Worker
  // instead, so a 100k-word document can't block the main thread/UI.
  const workerRef = useRef(null);
  const requestIdRef = useRef(0);
  const [workerAnalysis, setWorkerAnalysis] = useState(null);
  const [workerBusy, setWorkerBusy] = useState(false);

  useEffect(() => {
    const worker = new Worker(
      new URL("../../../workers/sentenceCounterAnalysis.worker.js", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (e) => {
      if (e.data.requestId === requestIdRef.current) {
        setWorkerAnalysis(e.data.analysis);
        setWorkerBusy(false);
      }
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (!useWorker || !workerRef.current) { setWorkerBusy(false); return; }
    const id = ++requestIdRef.current;
    setWorkerBusy(true);
    workerRef.current.postMessage({ requestId: id, text: deferredText });
  }, [useWorker, deferredText]);

  const analysis = useWorker ? (workerAnalysis || EMPTY_ANALYSIS) : syncAnalysis;
  const isPending = text !== deferredText || (useWorker && workerBusy);
  const isLargeDoc = useWorker;

  const readingDuration = computeDuration(analysis.counts.words, readingWpm);

  function resetAll() {
    setText("");
    setFileError(null);
    setFileName(null);
    setSelectedIndex(null);
    setHoveredIndex(null);
  }

  const handleEditorChange = useCallback(async (payload) => {
    if (payload.text !== undefined) {
      setText(payload.text);
      setFileError(null);
      setFileName(null);
      setSelectedIndex(null);
      return;
    }
    if (payload.file) {
      setFileError(null);
      try {
        const content = await readTextFile(payload.file);
        if (looksLikeBinaryText(content)) {
          setFileError("This file doesn't look like plain text — please upload a genuine .txt file.");
          return;
        }
        setText(content);
        setFileName(payload.file.name);
        setSelectedIndex(null);
      } catch (err) {
        setFileError(err.message);
      }
    }
  }, []);

  async function handlePasteFromClipboard() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setText(clip);
        setFileError(null);
        setFileName(null);
        setSelectedIndex(null);
      }
    } catch {
      setFileError("Clipboard access isn't available. Paste directly into the editor instead.");
    }
  }

  function loadSample() {
    setText(SAMPLE_TEXT);
    setFileError(null);
    setFileName(null);
    setSelectedIndex(null);
  }

  async function handleFileInputChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await handleEditorChange({ file });
  }

  const highlightIndex = hoveredIndex ?? selectedIndex;
  const activeSentence = useMemo(
    () => analysis.sentences.find((s) => s.index === highlightIndex) || null,
    [analysis.sentences, highlightIndex]
  );

  const trimmedQuery = searchQuery.trim();
  const searchRanges = useMemo(() => {
    if (!trimmedQuery) return [];
    return analysis.sentences
      .filter((s) => matchesQuery(s.text, trimmedQuery, matchCase, wholeWord))
      .map((s) => ({ start: s.start, end: s.end, type: "search" }));
  }, [analysis.sentences, trimmedQuery, matchCase, wholeWord]);

  // analysis.sentences offsets are computed from deferredText, but the
  // editor renders the live `text` — while a large re-analysis is still
  // pending, those offsets could momentarily point at the wrong substring
  // of the live text, so highlights are suppressed until they resync.
  const highlightRanges = useMemo(() => {
    if (isPending) return [];
    const ranges = [...searchRanges];
    if (activeSentence) ranges.push({ start: activeSentence.start, end: activeSentence.end, type: "active" });
    return ranges;
  }, [searchRanges, activeSentence, isPending]);

  const handleHighlightSentence = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  const { counts, averages } = analysis;
  const hasText = analysis.hasText;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" className="btn btn-secondary" onClick={loadSample} style={{ padding: "9px 16px", fontSize: 13 }}>
          Sample Text
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ padding: "9px 14px", fontSize: 13 }}>
          Upload .txt File
        </button>
        <button type="button" className="btn btn-ghost" onClick={handlePasteFromClipboard} style={{ padding: "9px 14px", fontSize: 13 }}>
          Paste from Clipboard
        </button>
        <input ref={fileInputRef} type="file" accept=".txt" style={{ display: "none" }} onChange={handleFileInputChange} />
        <div style={{ flex: 1 }} />
        {fileName && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loaded: {fileName}</span>}
        <button type="button" className="btn btn-danger" onClick={resetAll} disabled={!hasText} style={{ padding: "8px 14px" }}>
          Clear Text
        </button>
      </div>

      {fileError && (
        <div className="error-box" style={{ fontSize: 13 }}>{fileError}</div>
      )}

      {isLargeDoc && (
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", padding: "8px 12px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
          Large document detected ({fmtNum(counts.words)} words) — analysis may take a moment to update as you type.
        </div>
      )}

      {/* Editor */}
      <div>
        <SentenceCounterEditor
          text={text}
          onChange={handleEditorChange}
          highlightRanges={highlightRanges}
          activeSpanKey={selectedIndex}
          placeholder="Start typing, paste text, or drop a .txt file here…"
        />
        {isPending && (
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>Analyzing…</div>
        )}
      </div>

      {/* Primary stats — always instant, no calculate button */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          <StatCard label="Sentences" value={fmtNum(counts.sentences)} />
          <StatCard label="Paragraphs" value={fmtNum(counts.paragraphs)} />
          <StatCard label="Words" value={fmtNum(counts.words)} />
          <StatCard label="Characters" value={fmtNum(counts.chars)} sub="with spaces" />
          <StatCard label="Characters" value={fmtNum(counts.charsNoSpaces)} sub="no spaces" />
          <StatCard label="Lines" value={fmtNum(counts.lines)} sub={`${fmtNum(counts.nonEmptyLines)} non-empty`} />
          <StatCard label="Avg Words / Sentence" value={averages.wordsPerSentence} />
          <StatCard label="Avg Chars / Sentence" value={averages.charsPerSentence} />
          <StatCard label="Avg Sentences / Paragraph" value={averages.sentencesPerParagraph} />
          <StatCard label="Avg Words / Paragraph" value={averages.wordsPerParagraph} />
          <StatCard label="Sentence Density" value={averages.sentenceDensity} sub="per 100 words" />
          <div style={{ padding: "13px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-white)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>Reading Time</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
              {formatDuration(readingDuration)}
            </div>
            <select
              className="input"
              value={readingWpm}
              onChange={(e) => setReadingWpm(Number(e.target.value))}
              style={{ width: "auto", padding: "2px 6px", fontSize: 11, marginTop: 5 }}
              aria-label="Reading speed"
            >
              <option value={200}>200 WPM</option>
              <option value={225}>225 WPM</option>
              <option value={250}>250 WPM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Copy + export */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <CopyButton getText={() => text} label="Copy Entire Text" disabled={!hasText} />
        <CopyButton getText={() => buildStatsSummary(analysis)} label="Copy Statistics" disabled={!hasText} />
        <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 4px" }} />
        <button type="button" className="btn btn-ghost" disabled={!hasText} onClick={() => exportStatsTxt(analysis)} style={{ fontSize: 12.5, padding: "8px 12px" }}>Export Stats (TXT)</button>
        <button type="button" className="btn btn-ghost" disabled={!hasText} onClick={() => exportAnalysisJson(analysis)} style={{ fontSize: 12.5, padding: "8px 12px" }}>Export Analysis (JSON)</button>
        <button type="button" className="btn btn-ghost" disabled={!hasText} onClick={() => printAnalysis(analysis)} style={{ fontSize: 12.5, padding: "8px 12px" }}>Print / Save as PDF</button>
      </div>

      {/* Readability, insights, distribution, vocabulary, complexity */}
      {hasText && (
        <ReadabilityPanel analysis={analysis} onHighlightSentence={handleHighlightSentence} readingWpm={readingWpm} onReadingWpmChange={setReadingWpm} />
      )}

      {/* Sentence list */}
      {hasText && (
        <div className="card" style={{ padding: "20px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
              Sentence List ({fmtNum(counts.sentences)})
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => exportSentencesTxt(analysis)}>Export TXT</button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => exportSentencesCsv(analysis)}>Export CSV</button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => exportAnalysisJson(analysis)}>Export JSON</button>
            </div>
          </div>
          <SentenceList
            sentences={analysis.sentences}
            activeIndex={highlightIndex}
            onSelect={handleHighlightSentence}
            onHover={setHoveredIndex}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            matchCase={matchCase}
            onMatchCaseChange={setMatchCase}
            wholeWord={wholeWord}
            onWholeWordChange={setWholeWord}
          />
        </div>
      )}
    </div>
  );
}

function buildStatsSummary(analysis) {
  const { counts, averages, readability } = analysis;
  const lines = [
    `Sentences: ${counts.sentences}`,
    `Paragraphs: ${counts.paragraphs}`,
    `Words: ${counts.words}`,
    `Characters: ${counts.chars} (${counts.charsNoSpaces} no spaces)`,
    `Lines: ${counts.lines} (${counts.nonEmptyLines} non-empty)`,
    `Avg words/sentence: ${averages.wordsPerSentence}`,
    `Avg sentences/paragraph: ${averages.sentencesPerParagraph}`,
    `Sentence density: ${averages.sentenceDensity} per 100 words`,
  ];
  if (readability) {
    lines.push(`Flesch Reading Ease: ${readability.flesch.score} (${readability.flesch.level})`);
    lines.push(`Flesch-Kincaid Grade: ${readability.fkGrade.score} (${readability.fkGrade.label})`);
  }
  return lines.join("\n");
}
