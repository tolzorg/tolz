// Commission Calculator engine — matches calculator.net/commission-calculator.html
// (two GET forms, decoded with live probes; see scripts/commission-calculator.test.js).
//
// 1. Simple — give any two of sales price, commission rate and commission;
//    the third follows. With all three, the commission is recomputed. Every
//    filled box is validated (price > 0, rate ≥ 0, commission ≥ 0) before
//    "Please provide at least two values to calculate." is considered.
// 2. Tiered — sales price, an optional base commission (% of price or $) and
//    either one commission (% or $) or up to 8 tiers. Fully empty tier rows
//    are skipped and errors number the remaining rows by position. A blank
//    "To" means no upper limit; a $ tier pays its flat amount once the price
//    passes the tier's "From".
//
// Numbers print the reference's way: 2 decimals with trailing zeros dropped,
// but 2 significant digits below 1 ($0.0062); computed values below 0.0001
// print as 0 (echoed inputs keep their digits).

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const SIMPLE_DEFAULTS = { price: "200000", rate: "3", commission: "" };
export const TIER_COUNT = 8;
export const TIERED_DEFAULTS = {
  price: "200000", base: "1000", baseUnit: "dollar", fixed: "3", fixedUnit: "percent",
  tiers: [{ to: "20000", rate: "3" }, { to: "", rate: "5" }],
};

/** "1,234.5", "0.0062", "0" — see the header for the rules. */
export function formatCommissionNumber(value, { computed = true } = {}) {
  const abs = Math.abs(value);
  if (abs === 0 || (computed && abs < 1e-4)) return "0";
  if (!Number.isFinite(value)) return value > 0 ? "inf" : "-inf";
  // Significant digits apply to small positive values only (-0.095 → -0.09).
  const dp = abs >= 1 || value < 0 ? 2 : Math.max(2, 1 - Math.floor(Math.log10(abs)));
  const text = formatNumber(value, dp);
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}
const money = (v, computed) => `$${formatCommissionNumber(v, { computed })}`;

/** @param {{ price: string, rate: string, commission: string }} input */
export function calculateSimpleCommission(input) {
  const raw = { price: clean(input.price), rate: clean(input.rate), commission: clean(input.commission) };
  const val = Object.fromEntries(Object.entries(raw).map(([k, t]) => [k, num(t)]));
  const errors = [];
  if (raw.price !== "" && !(val.price > 0)) errors.push("Please provide a valid sales price.");
  if (raw.rate !== "" && !(val.rate >= 0)) errors.push("Please provide a valid commission rate.");
  if (raw.commission !== "" && !(val.commission >= 0)) errors.push("Please provide a valid commission.");
  if (errors.length) return { errors };
  const has = (k) => raw[k] !== "";
  if (["price", "rate", "commission"].filter(has).length < 2) return { errors: ["Please provide at least two values to calculate."] };

  const pct = `${raw.rate}%`;
  if (has("price") && has("rate")) {
    const c = (val.price * val.rate) / 100;
    return {
      label: "Commission", value: money(c, true),
      steps: [["commission =", "sales price × commission rate"], ["=", `${money(val.price, false)} × ${pct}`], ["=", money(c, true)]],
    };
  }
  if (has("rate")) {
    // The reference breaks (blank result) on a 0% rate here.
    if (val.rate === 0) return { errors: ["The commission rate must be greater than 0 to find the sales price."] };
    const p = val.commission / (val.rate / 100);
    return {
      label: "Sales Price", value: money(p, true),
      steps: [["sales price =", "commission ÷ commission rate"], ["=", `${money(val.commission, false)} ÷ ${pct}`], ["=", money(p, true)]],
    };
  }
  const r = (val.commission / val.price) * 100;
  const rate = `${formatCommissionNumber(r)}%`;
  return {
    label: "Commission Rate", value: rate,
    steps: [["commission rate =", "commission ÷ sales price"], ["=", `${money(val.commission, false)} ÷ ${money(val.price, false)}`], ["=", rate]],
  };
}

/**
 * @param {{ price, hasBase: boolean, base, baseUnit, varies: boolean, fixed, fixedUnit,
 *   tiers: { to: string, rate: string, unit: "percent"|"dollar" }[] }} input
 */
export function calculateTieredCommission(input) {
  const errors = [];
  const price = num(clean(input.price));
  if (!(price > 0)) errors.push("Please provide a valid sales price.");
  const base = num(clean(input.base));
  if (input.hasBase && !(base >= 0)) errors.push("Please provide a valid base commission value.");
  const fixed = num(clean(input.fixed));
  if (!input.varies && !(fixed >= 0)) errors.push("Please provide a valid commission value.");

  // Rows with anything typed in, numbered by position (empty rows don't count).
  const rows = [];
  let badFirstTo = false;
  if (input.varies) {
    for (const t of input.tiers) {
      const toText = clean(t.to);
      const rateText = clean(t.rate);
      if (toText === "" && rateText === "") continue;
      rows.push({ to: toText === "" ? Infinity : num(toText), open: toText === "", rate: num(rateText), unit: t.unit });
    }
    if (!rows.length) errors.push("Please provide a valid commission value for range #1.");
    rows.forEach((row, i) => {
      const k = i + 1;
      if (!row.open) {
        // The reference never reports a bad first "To" (it may even be
        // negative); a non-numeric one just blanks its page, handled below.
        if (k === 1 && Number.isNaN(row.to)) badFirstTo = true;
        else if (Number.isNaN(row.to) || (k > 1 && row.to < 0)) { errors.push(`Please provide a valid to value for range #${k}.`); return; }
        // A blank (unlimited) or invalid previous "To" fails this check too.
        if (k > 1 && !(row.to >= rows[i - 1].to && Number.isFinite(rows[i - 1].to))) {
          errors.push(`Please provide a to value for range #${k} that is larger than #${k - 1}.`);
        }
      }
      if (!(row.rate >= 0)) errors.push(`Please provide a valid commission value for range #${k}.`);
    });
  }
  if (errors.length) return { errors };
  if (badFirstTo) return { errors: ["Please provide a valid to value for range #1."] };

  const lines = [];
  const pay = (amount, unit, of) => (unit === "dollar" ? amount : (of * amount) / 100);
  if (input.hasBase) lines.push({ label: "Base commission", amount: pay(base, input.baseUnit, price) });
  if (!input.varies) {
    lines.push({ label: "Additional commission", amount: pay(fixed, input.fixedUnit, price) });
  } else {
    let from = 0;
    for (const row of rows) {
      if (!(price > from)) break;
      const amount = row.unit === "dollar" ? row.rate : ((Math.min(price, row.to) - from) * row.rate) / 100;
      const range = row.open ? `${money(from, false)}+` : `${money(from, false)} - ${money(row.to, false)}`;
      lines.push({ label: `Commission of ${range}`, amount });
      if (row.open) break;
      from = row.to;
    }
  }
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return {
    total: money(total, true),
    rows: lines.map((l) => [l.label, money(l.amount, true)]),
  };
}
