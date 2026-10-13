// Margin Calculator engine — matches calculator.net/margin-calculator.html,
// which has three independent calculators (all GET forms, decoded with live
// probes; see scripts/margin-calculator.test.js):
//
// 1. Profit Margin — give any two of cost, revenue, margin (% of revenue)
//    and profit; the rest follow. With more than two, the first available
//    pair wins: cost+revenue, cost+margin, cost+profit, revenue+profit,
//    revenue+margin, margin+profit. Markup = profit ÷ cost.
// 2. Stock Trading Margin — amount required = price × shares × margin %.
// 3. Currency Exchange Margin — amount required = rate × units ÷ ratio,
//    shown to 3 decimals without a currency sign.
//
// Validation, confirmed live: cost and revenue must be > 0, profit > 0
// (a zero or negative profit is "Please provide a numerical profit
// value."), the margin may be negative but must be below 100%; every
// problem is listed, then "Please provide two values." when fewer than two
// boxes are filled. A 0% margin with a profit (division by zero) shows
// nothing at all, as does a zero cost (markup undefined). The pie appears only when cost and profit are both > 0.

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
export const clean = (x) => String(x ?? "").replace(/,/g, "").trim();
export const num = (text) => (NUMERIC.test(text) ? Number(text) : NaN);

export const PROFIT_DEFAULTS = { cost: "120", revenue: "160", margin: "", profit: "" };
export const STOCK_DEFAULTS = { price: "18.3", shares: "100", requirement: "30" };
export const CURRENCY_DEFAULTS = { rate: "1.3", ratio: "20", units: "100" };
export const MARGIN_RATIO_OPTIONS = [1, 5, 10, 20, 25, 30, 40, 50].map((r) => ({ value: String(r), label: `${r}:1` }));

/** Half-up to `dp` decimals after a 15-digit pre-round, with en-US grouping. */
export function formatFixed(value, dp) {
  const k = 10 ** dp;
  const pre = Number(Math.abs(value).toPrecision(15));
  const rounded = (Math.sign(value) * Math.round(Number((pre * k).toPrecision(15)))) / k;
  return rounded.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
/** "$40.00", "$-40.00". */
export function formatMoney(value) {
  const text = formatFixed(Math.abs(value), 2);
  return value < 0 && text !== "0.00" ? `$-${text}` : `$${text}`;
}

export function calculateProfitMargin(input) {
  const text = { cost: clean(input.cost), revenue: clean(input.revenue), margin: clean(input.margin), profit: clean(input.profit) };
  const has = Object.fromEntries(Object.entries(text).map(([k, t]) => [k, t !== ""]));
  const C = num(text.cost);
  const R = num(text.revenue);
  const m = num(text.margin);
  const P = num(text.profit);

  const errors = [];
  if (has.cost && !(C > 0)) errors.push("Please provide a positive cost value.");
  if (has.revenue && !(R > 0)) errors.push("Please provide a positive revenue value.");
  if (has.margin && !Number.isFinite(m)) errors.push("Please provide a numerical margin value.");
  else if (has.margin && m >= 100) errors.push("This calculator can only handle a margin below 100%.");
  if (has.profit && !(P > 0)) errors.push("Please provide a numerical profit value.");
  if (Object.values(has).filter(Boolean).length < 2) errors.push("Please provide two values.");
  if (errors.length) return { errors };

  const f = m / 100;
  let v;
  if (has.cost && has.revenue) v = { cost: C, revenue: R, profit: R - C, solved: ["margin", "profit"] };
  else if (has.cost && has.margin) { const rev = C / (1 - f); v = { cost: C, revenue: rev, profit: rev - C, solved: ["revenue", "profit"] }; }
  else if (has.cost && has.profit) v = { cost: C, revenue: C + P, profit: P, solved: ["margin", "revenue"] };
  else if (has.revenue && has.profit) v = { cost: R - P, revenue: R, profit: P, solved: ["margin", "cost"] };
  else if (has.revenue && has.margin) v = { cost: R * (1 - f), revenue: R, profit: R * f, solved: ["cost", "profit"] };
  else {
    if (f === 0) return { empty: true };
    const rev = P / f;
    v = { cost: rev - P, revenue: rev, profit: P, solved: ["cost", "revenue"] };
  }
  // A zero cost (revenue = profit) leaves markup undefined; the reference shows nothing.
  if (v.cost === 0) return { empty: true };
  const margin = has.margin && !v.solved.includes("margin") ? m : (v.profit / v.revenue) * 100;
  const markup = (v.profit / v.cost) * 100;

  const rows = v.solved.map((key) => (key === "margin"
    ? { label: "Margin", value: `${formatFixed(margin, 2)}%`, strong: true }
    : { label: key[0].toUpperCase() + key.slice(1), value: formatMoney(v[key]) }));
  rows.push({ label: "Markup", value: `${formatFixed(markup, 2)}%` });

  const showPie = v.cost > 0 && v.profit > 0;
  return {
    rows,
    pie: showPie ? [
      { label: "Cost", value: v.cost, percent: Math.round((v.cost / v.revenue) * 100) },
      { label: "Profit margin", value: v.profit, percent: Math.round((v.profit / v.revenue) * 100) },
    ] : null,
  };
}

export function calculateStockMargin(input) {
  const price = num(clean(input.price));
  const shares = num(clean(input.shares));
  const requirement = num(clean(input.requirement));
  const errors = [];
  if (!(price >= 0)) errors.push("Please provide a positive stock price value.");
  if (!(shares >= 0)) errors.push("Please provide a positive number of shares value.");
  if (!(requirement >= 0)) errors.push("Please provide a positive margin requirement value.");
  if (errors.length) return { errors };
  return { amount: formatMoney((price * shares * requirement) / 100) };
}

export function calculateCurrencyMargin(input) {
  const rate = num(clean(input.rate));
  const units = num(clean(input.units));
  const ratio = Number(input.ratio);
  const errors = [];
  if (!(rate >= 0)) errors.push("Please provide a positive exchange rate value.");
  if (!MARGIN_RATIO_OPTIONS.some((o) => Number(o.value) === ratio)) errors.push("Please select a margin ratio.");
  if (!(units >= 0)) errors.push("Please provide a positive units value.");
  if (errors.length) return { errors };
  return { amount: formatFixed((rate * units) / ratio, 3) };
}
