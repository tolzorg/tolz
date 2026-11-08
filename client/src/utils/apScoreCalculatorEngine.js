// AP® score calculator engine shared by the AP® exam calculators — each matches its omnicalculator.com reference
// (calculator definitions read from the pages; behaviour checked live, see scripts/ap-score-calculators.test.js).
//
// Composite score = round(Σ points × the field's weight); AP® score 5/4/3/2 from the exam's composite cut-offs,
// else 1. The weights are kept as exact fractions and the rounding is half up, as the reference shows at exact
// halves (AP Chem: MCQ 3, FRQ 0 → 2.5 → 3; MCQ 21, FRQ 23 → 42.5 → 43).
//   AP® Biology:   MCQ + FRQ × 60/36 (60 + 36 points → 0–120); 5 ≥ 93, 4 ≥ 74, 3 ≥ 51, 2 ≥ 28.
//   AP® Chemistry: MCQ × 50/60 + FRQ × 50/46 (60 + 46 points → 0–100); 5 ≥ 72, 4 ≥ 58, 3 ≥ 42, 2 ≥ 27.
//   AP® English Language: MCQ + FRQ × 55/18 (45 + 18 points → 0–100); 5 ≥ 75, 4 ≥ 65, 3 ≥ 53, 2 ≥ 36
//     (ties at FRQ 9: 0 + 27.5 → 28, 25 + 27.5 → 53, live).
//   AP® World History: MCQ × 52/55 + SAQ × 26/9 + DBQ × 32/7 + LEQ × 20/6 (→ 0–130); 5 ≥ 97, 4 ≥ 80, 3 ≥ 62,
//     2 ≥ 44 (no exact halves occur).
// Every box must be a whole number in its range (reference wording); the score shows only when all are filled in
// and valid.

import { clean, num } from "./marginCalculatorEngine.js";

const RECOMMENDATIONS = { 5: "extremely well qualified", 4: "very well qualified", 3: "qualified", 2: "possibly qualified", 1: "no recommendation" };

/** Field helper: key, label, max points, the message's name for it, and its composite weight [numerator, denominator]. */
const F = (key, label, max, what, weight) => ({ key, label, max, what, weight });
const mcq60 = (weight) => F("mcq", "Multiple-choice (0-60)", 60, "multiple-choice question", weight);

/** The usual two-section layout and point rows: Section I = the multiple-choice box, Section 2 = the rest. */
function mcqFrqLayout(fields, frqTitle) {
  const [mcq, ...frq] = fields.map((f) => f.key);
  return {
    sections: [{ title: "Section I: Multiple-choice", keys: [mcq] }, { title: frqTitle, keys: frq }],
    pointRows: [{ label: "Multiple-choice points", keys: [mcq] }, { label: "Free-response points", keys: frq }],
  };
}

const BIO_FIELDS = [
  mcq60([1, 1]),
  F("q1", "Q1 – Experimental analysis (0-10)", 10, "the free-response question 1", [60, 36]),
  F("q2", "Q2 – Experimental analysis + graphing (0-10)", 10, "the free-response question 2", [60, 36]),
  F("q3", "Q3 – Scientific investigation (0-4)", 4, "the free-response question 3", [60, 36]),
  F("q4", "Q4 – Conceptual analysis (0-4)", 4, "the free-response question 4", [60, 36]),
  F("q5", "Q5 – Model/visual analysis (0-4)", 4, "the free-response question 5", [60, 36]),
  F("q6", "Q6 – Data analysis (0-4)", 4, "the free-response question 6", [60, 36]),
];
const CHEM_FIELDS = [
  mcq60([50, 60]),
  F("l1", "Long question 1 (0-10)", 10, "the free-response long question 1", [50, 46]),
  F("l2", "Long question 2 (0-10)", 10, "the free-response long question 2", [50, 46]),
  F("l3", "Long question 3 (0-10)", 10, "the free-response long question 3", [50, 46]),
  F("s1", "Short question 1 (0-4)", 4, "the free-response short question 1", [50, 46]),
  F("s2", "Short question 2 (0-4)", 4, "the free-response short question 2", [50, 46]),
  F("s3", "Short question 3 (0-4)", 4, "the free-response short question 3", [50, 46]),
  F("s4", "Short question 4 (0-4)", 4, "the free-response short question 4", [50, 46]),
];
const LANG_FIELDS = [
  F("mcq", "Reading (0-45)", 45, "multiple choice question", [1, 1]),
  F("synthesis", "Question 1 – Synthesis (0-6)", 6, "the free response question 1", [55, 18]),
  F("rhetorical", "Question 2 – Rhetorical (0-6)", 6, "the free response question 2", [55, 18]),
  F("argument", "Question 3 – Argument (0-6)", 6, "the free response question 3", [55, 18]),
];
const WORLD_FIELDS = [
  F("mcq", "Multiple-choice (0-55)", 55, "multiple-choice question", [52, 55]),
  F("saq1", "Short-answer question 1 (0-3)", 3, "the short-answer question 1", [26, 9]),
  F("saq2", "Short-answer question 2 (0-3)", 3, "the short-answer question 2", [26, 9]),
  F("saq3", "Short-answer question 3 (0-3)", 3, "the short-answer question 3", [26, 9]),
  F("dbq", "Document-based question (0-7)", 7, "the document-based question", [32, 7]),
  F("leq", "Long essay question (0-6)", 6, "the long essay question", [20, 6]),
];

export const AP_EXAMS = {
  bio: {
    subject: "Biology", resultTitle: "AP® Biology score", fields: BIO_FIELDS,
    ...mcqFrqLayout(BIO_FIELDS, "Section 2: Free-response"),
    maxComposite: 120, cutoffs: { 5: 93, 4: 74, 3: 51, 2: 28 },
  },
  chem: {
    subject: "Chemistry", resultTitle: "AP® Chemistry score", fields: CHEM_FIELDS,
    ...mcqFrqLayout(CHEM_FIELDS, "Section 2: Free-response"),
    maxComposite: 100, cutoffs: { 5: 72, 4: 58, 3: 42, 2: 27 },
  },
  lang: {
    subject: "English Language and Composition", resultTitle: "AP® English Language and Composition Score", fields: LANG_FIELDS,
    ...mcqFrqLayout(LANG_FIELDS, "Section 2: Free response"),
    maxComposite: 100, cutoffs: { 5: 75, 4: 65, 3: 53, 2: 36 },
  },
  world: {
    subject: "World History", resultTitle: "AP® World History score", fields: WORLD_FIELDS,
    sections: [{ title: "Section I", keys: ["mcq", "saq1", "saq2", "saq3"] }, { title: "Section II", keys: ["dbq", "leq"] }],
    pointRows: [
      { label: "Multiple-choice points", keys: ["mcq"] },
      { label: "Short-answer points", keys: ["saq1", "saq2", "saq3"] },
      { label: "Document-based question points", keys: ["dbq"] },
      { label: "Long essay question points", keys: ["leq"] },
    ],
    maxComposite: 130, cutoffs: { 5: 97, 4: 80, 3: 62, 2: 44 },
  },
};

export const fieldMessage = (f) => `The number of points for ${f.what} must be an integer between 0 and ${f.max}.`;

/** Free-response points available in an exam (every box after the multiple-choice one). */
export const frqMax = (exam) => exam.fields.slice(1).reduce((s, f) => s + f.max, 0);

/** The conversion chart, best first: { score, min, max, recommendation }. */
export function apScale(exam) {
  return [5, 4, 3, 2, 1].map((score) => ({
    score,
    min: score === 1 ? 0 : exam.cutoffs[score],
    max: score === 5 ? exam.maxComposite : exam.cutoffs[score + 1] - 1,
    recommendation: RECOMMENDATIONS[score],
  }));
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** round(Σ points × a/b), half up, in exact integers over the weights' common denominator. */
function composite(exam, pts) {
  const den = exam.fields.reduce((l, f) => (l * f.weight[1]) / gcd(l, f.weight[1]), 1);
  const n = exam.fields.reduce((s, f) => s + pts[f.key] * f.weight[0] * (den / f.weight[1]), 0);
  return Math.floor((2 * n + den) / (2 * den));
}

/**
 * exam: an AP_EXAMS entry; values: { [field key]: text } (all filled in) → { errors } |
 * { composite, apScore, recommendation, mcq, frq (raw points after the multiple-choice box),
 *   rows: [{ label, points, max }] (the exam's point rows) }
 */
export function calculateApScore(exam, values) {
  const pts = {};
  const errors = [];
  for (const f of exam.fields) {
    const t = clean(values[f.key]);
    const n = num(t);
    if (t === "" || !Number.isInteger(n) || n < 0 || n > f.max) errors.push(fieldMessage(f));
    else pts[f.key] = n;
  }
  if (errors.length) return { errors };
  const byKey = Object.fromEntries(exam.fields.map((f) => [f.key, f]));
  const sum = (keys, of) => keys.reduce((s, k) => s + of(k), 0);
  const score = composite(exam, pts);
  const apScore = [5, 4, 3, 2].find((s) => score >= exam.cutoffs[s]) || 1;
  return {
    composite: score, apScore, recommendation: RECOMMENDATIONS[apScore],
    mcq: pts.mcq, frq: sum(exam.fields.slice(1).map((f) => f.key), (k) => pts[k]),
    rows: exam.pointRows.map((r) => ({ label: r.label, points: sum(r.keys, (k) => pts[k]), max: sum(r.keys, (k) => byKey[k].max) })),
  };
}
