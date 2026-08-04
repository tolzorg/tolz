// Runs the exact same analyzeText() used on the main thread, just off it —
// keeps large-document analysis (50k-100k+ words) from blocking the UI.
// Results are identical to the synchronous path; only where they're
// computed changes.
import { analyzeText } from "../utils/sentenceCounterAnalysis";

self.onmessage = (event) => {
  const { requestId, text } = event.data;
  const analysis = analyzeText(text);
  self.postMessage({ requestId, analysis });
};
