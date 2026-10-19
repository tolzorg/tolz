// Required-field handling shared by the calculators.
//
// Placeholders are display-only examples: an empty box never feeds them into a
// calculation. When Calculate is clicked, every empty box that the calculator
// actually needs is flagged; its input then shows a red border and "Please
// enter a value" until something is typed in it.
//
// "Needed" comes from each calculator's own rules, not from a list: an empty
// field is required when leaving it empty makes the calculation fail where it
// would otherwise succeed (with the field filled in). Fields the calculator can
// do without stay optional, and are passed on empty.

import { createContext, useCallback, useContext, useRef, useState } from "react";

export const REQUIRED_MESSAGE = "Please enter a value";

/** Flagged field names of the surrounding calculator (null outside one). */
export const RequiredContext = createContext(null);
/** The field being rendered: { name, flagged? } (set by <Req name="…" flagged={…}>). */
export const FieldNameContext = createContext(null);

export const isBlankValue = (value) =>
  Array.isArray(value) ? value.every((v) => String(v ?? "").trim() === "") : String(value ?? "").trim() === "";

const defaultErrors = (r) => {
  if (r == null) return 1;
  if (Array.isArray(r.errors)) return r.errors.length;
  if (r.error) return 1;
  return 0;
};

/**
 * Calculator-level state. `evaluate(fields, run, errorsOf?)`:
 *  - fields: { name: currentValue } for every field that has an example placeholder;
 *  - run(fill): runs the calculation, using the example for each name in the Set
 *    `fill` and the typed value for everything else;
 *  - errorsOf(result): how many errors a result has (default: result.errors length).
 * Returns the result to show, or null when required fields are empty (they are
 * then flagged).
 */
export function useRequiredFields() {
  const [flagged, setFlagged] = useState([]);

  const evaluate = useCallback((fields, run, errorsOf = defaultErrors) => {
    const count = (fill) => {
      try { return errorsOf(run(fill)); } catch { return Infinity; }
    };
    const blanks = Object.keys(fields).filter((k) => isBlankValue(fields[k]));
    if (blanks.length) {
      const all = new Set(blanks);
      const base = count(all);
      const required = blanks.filter((k) => {
        const others = new Set(all);
        others.delete(k);
        return count(others) > base;
      });
      if (required.length) {
        setFlagged(required);
        return null;
      }
    }
    setFlagged([]);
    return run(new Set());
  }, []);

  /** For calculators that read every empty box as 0: `fields` is { name: value } for the boxes
   * the result cannot do without. A value may be an array (e.g. [years, months]) — it is then
   * empty only when all of it is. Flags the empty ones; true when none are empty. */
  const require = useCallback((fields) => {
    const missing = Object.keys(fields).filter((k) => isBlankValue(fields[k]));
    setFlagged(missing);
    return missing.length === 0;
  }, []);

  const clear = useCallback(() => setFlagged([]), []);
  /** Flag fields directly, for calculators whose required boxes follow their own rules. */
  const flag = useCallback((names) => setFlagged(names), []);

  // For calculators written as \`value || DEFAULTS.key\`: \`ex = examples(DEFAULTS)\` stands in
  // for DEFAULTS. \`ex.key\` is "" (the box stays empty) except while run() is testing
  // whether that empty box is required. Reading ex.key only happens when the box is
  // empty, so run() also learns which boxes are empty.
  const fill = useRef(null);
  const seen = useRef(new Set());
  const examples = useCallback((defaults) => new Proxy({}, {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      seen.current.add(key);
      return fill.current && fill.current.has(key) ? defaults[key] : "";
    },
  }), []);

  /** Runs `compute` (which reads `ex.key` for empty boxes) and returns its result, or null
   * after flagging the empty boxes it cannot do without. For calculators whose formulas
   * read an empty box as 0 instead of reporting it, `options.required` names the boxes the
   * result is meaningless without (e.g. price, rate, term); they are required when empty. */
  const run = useCallback((compute, options = {}) => {
    const errorsOf = options.errorsOf || defaultErrors;
    const always = new Set(options.required || []);
    const exec = (set) => {
      fill.current = set;
      try { return compute(); } finally { fill.current = null; }
    };
    const count = (set) => {
      try { return errorsOf(exec(set)); } catch { return Infinity; }
    };
    seen.current = new Set();
    const everything = { has: () => true };
    const base = count(everything);
    const blanks = [...seen.current];
    const required = blanks.filter((k) => always.has(k) || count({ has: (key) => key !== k }) > base);
    if (required.length) {
      setFlagged(required);
      return null;
    }
    setFlagged([]);
    return exec(new Set());
  }, []);

  return { flagged, evaluate, require, clear, flag, examples, run };
}

/** For base inputs: is this field (value) currently flagged and still empty? */
export function useRequiredState(value) {
  const outer = useContext(RequiredContext);
  const field = useContext(FieldNameContext);
  const flagged = field?.flagged ?? outer;
  return Boolean(flagged && field?.name && flagged.includes(field.name) && isBlankValue(value));
}

/** Only the given keys of a values object (the fields to check). */
export const pickFields = (values, keys) => Object.fromEntries(keys.map((k) => [k, values[k]]));
/** The values, with the example from `defaults` for each key in `fill`. */
export const withFill = (values, defaults, fill) => {
  const out = { ...values };
  for (const k of Object.keys(defaults)) if (fill.has(k)) out[k] = defaults[k];
  return out;
};

/** Input props that show the "Please enter a value" state. */
export function requiredInputProps(invalid, placeholder) {
  return invalid
    ? { placeholder: REQUIRED_MESSAGE, "aria-invalid": true, title: REQUIRED_MESSAGE, className: "input-required" }
    : { placeholder };
}
