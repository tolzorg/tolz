// Discount Calculator engine — matches calculator.net/discount-calculator.html
// (a GET form, decoded with live probes; see scripts/discount-calculator.test.js).
//
// Percent off: give any two of price before, discount %, price after and
// amount saved. With more than two, the first available pair wins:
// before+discount, before+after, before+saved, discount+after,
// discount+saved, after+saved.
// Fixed amount off: the "You saved" box is hidden and ignored; the pairs
// are before+discount, before+after, discount+after, and the discount
// percentage is always reported.
//
// Validation, confirmed live: every filled box must be a number > 0 (the
// discount % may exceed 100, results may go negative); all problems are
// listed, and only then "Please provide 2 values to calculate." when fewer
// than two boxes are filled. A 100% discount with the price after discount
// is "Can not calculate with 100% discount."

import { clean, num, formatFixed, formatMoney } from "./marginCalculatorEngine.js";

export const DISCOUNT_DEFAULTS = { before: "59.99", discount: "15", after: "", saved: "" };

const FIELD_ERRORS = {
  before: "Please provide a positive price before discount value.",
  discount: "Please provide a positive discount value.",
  after: "Please provide a positive price after discount value.",
  saved: "Please provide a positive you saved amount.",
};

/**
 * The reference's discount-percentage format: one decimal, except a small
 * positive value keeps one significant digit (0.04%, 0.006%, down to
 * 0.0001%); below 0.0001 it is 0. Trailing zeros are dropped.
 */
export function formatDiscountPercent(x) {
  let dp = 1;
  if (x > 0 && x < 0.1) {
    if (x < 0.0001) return "0%";
    dp = x >= 0.01 ? 2 : x >= 0.001 ? 3 : 4;
  }
  const text = formatFixed(x, dp).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return `${/^-?0$/.test(text) ? "0" : text}%`;
}

/**
 * @param {{ before, discount, after, saved, type: "percent"|"fixed" }} input
 * @returns {{ errors: string[] } | { intro: string, rows: { label: string, value: string }[] }}
 */
export function calculateDiscount(input) {
  const fixed = input.type === "fixed";
  const keys = fixed ? ["before", "discount", "after"] : ["before", "discount", "after", "saved"];
  const text = Object.fromEntries(keys.map((k) => [k, clean(input[k])]));
  const has = Object.fromEntries(keys.map((k) => [k, text[k] !== ""]));
  const val = Object.fromEntries(keys.map((k) => [k, num(text[k])]));

  const errors = keys.filter((k) => has[k] && !(val[k] > 0)).map((k) => FIELD_ERRORS[k]);
  if (errors.length) return { errors };
  if (keys.filter((k) => has[k]).length < 2) return { errors: ["Please provide 2 values to calculate."] };

  const { before: B, discount: D, after: A, saved: S } = val;
  const echo = {
    before: `original price $${text.before}`,
    discount: fixed ? `$${text.discount} discount` : `${text.discount}% discount`,
    after: `after discount price $${text.after}`,
    saved: `you saved $${text.saved}`,
  };
  const intro = (a, b) => `With ${echo[a]} and ${echo[b]},`;
  const money = (label, v) => ({ label, value: formatMoney(v) });
  const pct = (label, v) => ({ label, value: formatDiscountPercent(v) });

  if (fixed) {
    if (has.before && has.discount) return { intro: intro("before", "discount"), rows: [money("Price after discount", B - D), pct("Discount percentage", (D / B) * 100)] };
    if (has.before && has.after) return { intro: intro("before", "after"), rows: [money("Discount amount", B - A), pct("Discount percentage", ((B - A) / B) * 100)] };
    const before = D + A;
    return { intro: intro("discount", "after"), rows: [money("Price before discount", before), pct("Discount percentage", (D / before) * 100)] };
  }

  const f = D / 100;
  if (has.before && has.discount) return { intro: intro("before", "discount"), rows: [money("Price after discount", B - B * f), money("You saved", B * f)] };
  if (has.before && has.after) return { intro: intro("before", "after"), rows: [pct("Discount", ((B - A) / B) * 100), money("You saved", B - A)] };
  if (has.before && has.saved) return { intro: intro("before", "saved"), rows: [pct("Discount", (S / B) * 100), money("Price after discount", B - S)] };
  if (has.discount && has.after) {
    if (D === 100) return { errors: ["Can not calculate with 100% discount."] };
    const before = A / (1 - f);
    return { intro: intro("discount", "after"), rows: [money("Price before discount", before), money("You saved", before - A)] };
  }
  if (has.discount && has.saved) {
    const before = S / f;
    return { intro: intro("discount", "saved"), rows: [money("Price before discount", before), money("Price after discount", before - S)] };
  }
  const before = A + S;
  return { intro: intro("after", "saved"), rows: [money("Price before discount", before), pct("Discount", (S / before) * 100)] };
}
