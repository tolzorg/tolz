// Percent Off Calculator engine — matches calculator.net/percent-off-calculator.html
// (a GET form, decoded with live probes; see scripts/percent-off-calculator.test.js).
//
// Give any two of original price, percent off, final price and saved amount;
// with more than two the first available pair wins: original+percent,
// original+final, original+saved, percent+final, percent+saved, final+saved
// (the Discount Calculator's order).
// A "stackable additional discount" (0 < x < 100%) is applied to the already
// discounted price, so the final price is original × (1 − p₁)(1 − p₂); the
// results then add the total percent off and, where it is solved, the 1st
// percent off.
//
// Validation, confirmed live: every filled box must be a number > 0 (the
// percent off may exceed 100 and results may go negative), then the
// additional discount, all listed; only then "Please provide 2 values to
// calculate.". A 100% discount with a final price is "Can not calculate
// with 100% off.". Percentages use the Discount Calculator's format.

import { clean, num, formatMoney } from "./marginCalculatorEngine.js";
import { formatDiscountPercent } from "./discountCalculatorEngine.js";

export const PERCENT_OFF_DEFAULTS = { original: "39.99", percent: "15", final: "", saved: "", extra: "10" };

const KEYS = ["original", "percent", "final", "saved"];
const FIELD_ERRORS = {
  original: "Please provide a positive original price value.",
  percent: "Please provide a positive percent off value.",
  final: "Please provide a positive final price value.",
  saved: "Please provide a positive saved amount.",
};
const EXTRA_ERROR = "Please provide a positive additional discount percentage between 0 and 100%.";

/**
 * @param {{ original, percent, final, saved, extra: string, stack: boolean }} input
 * @returns {{ errors: string[] } | { intro: string, rows: { label: string, value: string, first?: boolean }[] }}
 *   `first` marks the "1st percent off" row (the reference writes "1<sup>st</sup>").
 */
export function calculatePercentOff(input) {
  const text = Object.fromEntries(KEYS.map((k) => [k, clean(input[k])]));
  const has = Object.fromEntries(KEYS.map((k) => [k, text[k] !== ""]));
  const val = Object.fromEntries(KEYS.map((k) => [k, num(text[k])]));
  const extraText = clean(input.extra);
  const extra = num(extraText);

  const errors = KEYS.filter((k) => has[k] && !(val[k] > 0)).map((k) => FIELD_ERRORS[k]);
  if (input.stack && !(extra > 0 && extra < 100)) errors.push(EXTRA_ERROR);
  if (errors.length) return { errors };
  if (KEYS.filter((k) => has[k]).length < 2) return { errors: ["Please provide 2 values to calculate."] };

  const { original: B, percent: P, final: A, saved: S } = val;
  const pair = has.original && has.percent ? "BP" : has.original && has.final ? "BA" : has.original && has.saved ? "BS"
    : has.percent && has.final ? "PA" : has.percent && has.saved ? "PS" : "AS";
  if (pair === "PA" && P === 100) return { errors: ["Can not calculate with 100% off."] };

  const money = (label, v) => ({ label, value: formatMoney(v) });
  const pct = (label, v) => ({ label, value: formatDiscountPercent(v) });
  const keep2 = input.stack ? 1 - extra / 100 : 1; // what the additional discount leaves

  if (!input.stack) {
    const echo = { original: `original price $${text.original}`, percent: `${text.percent}% off`, final: `final price $${text.final}`, saved: `saved amount of $${text.saved}` };
    const intro = (a, b) => `With ${echo[a]} and ${echo[b]},`;
    const f = P / 100;
    switch (pair) {
      case "BP": return { intro: intro("original", "percent"), rows: [money("Final price", B - B * f), money("Saved amount", B * f)] };
      case "BA": return { intro: intro("original", "final"), rows: [pct("Percent off", ((B - A) / B) * 100), money("Saved amount", B - A)] };
      case "BS": return { intro: intro("original", "saved"), rows: [pct("Percent off", (S / B) * 100), money("Final Price", B - S)] };
      case "PA": { const b = A / (1 - f); return { intro: intro("percent", "final"), rows: [money("Original price", b), money("Saved amount", b - A)] }; }
      case "PS": { const b = S / f; return { intro: intro("percent", "saved"), rows: [money("Original price", b), money("Final price", b - S)] }; }
      default: { const b = A + S; return { intro: intro("final", "saved"), rows: [money("Original price", b), pct("Percent off", (S / b) * 100)] }; }
    }
  }

  const echo = {
    original: `an original price of $${text.original}`, percent: `an discount of ${text.percent}% off`,
    final: `a final price of $${text.final}`, saved: `a saved amount of $${text.saved}`,
  };
  const more = `an additional ${extraText}% off`;
  const intro = (a, b) => (pair === "BP"
    ? `Given ${echo.original}, and a discount of ${text.percent}% off, with ${more},`
    : `Given ${echo[a]}, ${echo[b]}, and ${more},`);
  const keep = (P1) => (1 - P1 / 100) * keep2; // share of the original left after both discounts
  const total = (b, final) => pct("Total percent off", ((b - final) / b) * 100);
  const first = (b, final) => ({ ...pct("1st percent off", (1 - final / (b * keep2)) * 100), first: true });
  switch (pair) {
    case "BP": { const fin = B * keep(P); return { intro: intro(), rows: [money("Final price", fin), money("Saved amount", B - fin), total(B, fin)] }; }
    case "BA": return { intro: intro("original", "final"), rows: [money("Saved amount", B - A), total(B, A), first(B, A)] };
    case "BS": return { intro: intro("original", "saved"), rows: [money("Final Price", B - S), total(B, B - S), first(B, B - S)] };
    case "PA": { const b = A / keep(P); return { intro: intro("percent", "final"), rows: [money("Original price", b), money("Saved amount", b - A), total(b, A)] }; }
    case "PS": { const b = S / (1 - keep(P)); return { intro: intro("percent", "saved"), rows: [money("Original price", b), money("Final price", b - S), total(b, b - S)] }; }
    default: { const b = A + S; return { intro: intro("final", "saved"), rows: [money("Original price", b), first(b, A), total(b, A)] }; }
  }
}
