// Payback Period Calculator engine — follows calculator.net/payback-period-calculator.html
// (probed live; see scripts/payback-period-calculator.test.js).
//
// Fixed cash flow: a first-year cash flow growing (or shrinking) by a fixed rate
// each year. The payback and discounted payback periods come from the closed-form
// growing-annuity formulas (the page's own formula, −ln(1 − I·r/CF) ÷ ln(1 + r),
// is the no-growth case, and the reference matches it exactly there).
// Irregular cash flow: up to 100 yearly amounts; the periods are interpolated
// linearly inside the year the cumulative (discounted) cash flow turns positive,
// with the reference's "won't pay back in N years … if continues" fallback.
// The cash flow return rate is the IRR of the scheduled years.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const FIXED_DEFAULTS = { investment: "100000", cashFlow: "30000", changeRate: "5", years: "5", discountRate: "10" };
export const IRREGULAR_DEFAULTS = { investment: "100000", discountRate: "10", flows: ["5000", "25000", "35000", "40000", "30000", "10000"] };
export const MAX_YEARS = 100;

const money = (v) => `$${formatNumber(v, 2)}`;
const years3 = (v) => `${formatNumber(v, 3)} years`;
const pct = (v) => `${formatNumber(v, 2)}%`;

/** IRR of [−I, c1, …, cn]; null when it cannot be found. */
function irr(investment, flows) {
  if (!flows.length) return null;
  if (flows.length === 1) return flows[0] / investment - 1;
  const npv = (i) => flows.reduce((s, c, k) => s + c / (1 + i) ** (k + 1), -investment);
  // Scan for sign changes (several are possible when flows change sign more
  // than once) and keep the root nearest 10%, then refine it by bisection.
  let best = null;
  let prevRate = -0.99;
  let prev = npv(prevRate);
  // Fine steps up to 1,000%, then geometric steps for very large returns.
  const grid = [];
  for (let step = 1; step <= 1099; step++) grid.push(-0.99 + step * 0.01);
  for (let rate = 10.1; rate < 1e6; rate *= 1.02) grid.push(rate);
  for (const rate of grid) {
    const value = npv(rate);
    if ((prev <= 0) !== (value <= 0) && (best === null || Math.abs(prevRate - 0.1) < Math.abs(best[0] - 0.1))) best = [prevRate, rate];
    prevRate = rate; prev = value;
  }
  if (!best) return null;
  let [lo, hi] = best;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if ((npv(lo) <= 0) === (npv(mid) <= 0)) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function schedule(investment, flows, rate, blank = []) {
  const rows = [{ label: "Year 0", cash: -investment, net: -investment, disc: -investment, netDisc: -investment }];
  let net = -investment;
  let netDisc = -investment;
  flows.forEach((c, k) => {
    const disc = c / (1 + rate) ** (k + 1);
    net += c; netDisc += disc;
    // Blank years count toward the timing but get no row, as on the reference.
    if (!blank[k]) rows.push({ label: `Year ${k + 1}`, cash: c, net, disc, netDisc });
  });
  return rows.map((r) => ({ label: r.label, cash: money(r.cash), net: money(r.net), disc: money(r.disc), netDisc: money(r.netDisc) }));
}

/**
 * First crossing of the cumulative flows, interpolated linearly between the
 * listed years (blank years are skipped, so the step can span several years,
 * as on the reference); null if never.
 */
function crossing(investment, flows, blank = []) {
  let cum = -investment;
  let prevYear = 0;
  for (let k = 0; k < flows.length; k++) {
    if (blank[k]) continue;
    if (cum + flows[k] >= 0 && flows[k] > 0) return prevYear + (k + 1 - prevYear) * (-cum / flows[k]);
    cum += flows[k];
    prevYear = k + 1;
  }
  return null;
}
// The discount rate is echoed as typed (27.77%, 10%).
const ratePct = (text) => `${text}%`;

/** Fixed (growing) cash flow. */
export function calculateFixedCashFlow(input) {
  const errors = [];
  const investment = num(clean(input.investment));
  if (Number.isNaN(investment) || investment <= 0) errors.push("Please provide a positive initial investment value.");
  const cashFlow = num(clean(input.cashFlow));
  if (Number.isNaN(cashFlow)) errors.push("Please provide a numerical cash flow value.");
  const changeRate = num(clean(input.changeRate));
  if (Number.isNaN(changeRate)) errors.push("Please provide a numerical cash flow change rate.");
  const years = num(clean(input.years));
  if (Number.isNaN(years) || years < 0 || years > MAX_YEARS) errors.push("Please provide a positive number of years that is 100 or less.");
  const discountRate = num(clean(input.discountRate));
  if (Number.isNaN(discountRate) || discountRate > 100) errors.push("Please provide a numerical discount rate that is 100 or smaller.");
  if (errors.length) return { errors };

  const g = (input.direction === "decrease" ? -1 : 1) * changeRate / 100;
  const r = discountRate / 100;
  const flows = Array.from({ length: Math.floor(years) }, (_, k) => cashFlow * (1 + g) ** k);

  // Payback: CF·((1+g)^n − 1)/g = I.
  let payback = null;
  if (cashFlow > 0) {
    if (g === 0) payback = investment / cashFlow;
    else { const x = 1 + (investment * g) / cashFlow; if (x > 0) payback = Math.log(x) / Math.log(1 + g); }
  }
  // Discounted: CF/(1+r)·(1 − q^n)/(1 − q) = I with q = (1+g)/(1+r).
  let discounted = null;
  if (r !== 0 && cashFlow > 0) {
    const q = (1 + g) / (1 + r);
    if (Math.abs(q - 1) < 1e-12) discounted = (investment * (1 + r)) / cashFlow;
    else { const x = 1 - (investment * (1 + r) * (1 - q)) / cashFlow; if (x > 0) discounted = Math.log(x) / Math.log(q); }
    if (discounted !== null && !(discounted > 0)) discounted = null;
  }
  const lines = [payback === null ? { text: "The investment will never be paidback." } : { label: "Payback Period", value: years3(payback) }];
  if (r !== 0) {
    lines.push(discounted === null
      ? { text: `The investment will never be paidback at the discount rate of ${ratePct(clean(input.discountRate))}.` }
      : { label: "Discounted Payback Period", value: years3(discounted) });
  }
  const rate = irr(investment, flows);
  if (rate !== null && flows.length) lines.push({ label: "Cash Flow Return Rate", value: `${pct(rate * 100)} per year` });
  return { lines, rows: schedule(investment, flows, r), discounted: r !== 0 };
}

/** Irregular cash flows (blank boxes count as $0 up to the last filled one). */
export function calculateIrregularCashFlow(input) {
  const errors = [];
  const investment = num(clean(input.investment));
  if (Number.isNaN(investment) || investment <= 0) errors.push("Please provide a positive initial investment value.");
  const discountRate = num(clean(input.discountRate));
  if (Number.isNaN(discountRate) || discountRate > 100) errors.push("Please provide a numerical discount rate that is 100 or smaller.");
  const texts = (input.flows || []).map((x) => clean(x));
  let last = -1;
  texts.forEach((t, k) => { if (t !== "") last = k; });
  const flows = [];
  for (let k = 0; k <= last; k++) {
    if (texts[k] === "") { flows.push(0); continue; }
    const v = num(texts[k]);
    if (Number.isNaN(v)) errors.push(`Please provide a numerical value for item #${k + 1}.`);
    flows.push(v);
  }
  if (!errors.length && last < 0) errors.push("Please provide at least one year of cash flow.");
  if (errors.length) return { errors };

  const r = discountRate / 100;
  const n = flows.length;
  const discFlows = flows.map((c, k) => c / (1 + r) ** (k + 1));
  const blank = texts.slice(0, n).map((t) => t === "");
  const line = (values, label, discountedText) => {
    const at = crossing(investment, values, blank);
    if (at !== null) return { label, value: years3(at) };
    const avg = values.reduce((s, c) => s + c, 0) / n;
    return {
      text: `${discountedText ? `With the discount rate of ${ratePct(clean(input.discountRate))}, the` : "The"} Investment won't pay back in ${n} years. `
        + `Average ${discountedText ? "discounted " : ""}payback is ${money(avg)}/year in the first ${n} years. `
        + `If continues, the ${discountedText ? "discounted " : ""}payback period is ${years3(investment / avg)}.`,
    };
  };
  const lines = [line(flows, "Payback Period", false), line(discFlows, "Discounted Payback Period", true)];
  const rate = irr(investment, flows);
  if (rate !== null) lines.push({ label: "Cash Flow Return Rate", value: `${pct(rate * 100)} per year` });
  return { lines, rows: schedule(investment, flows, r, blank), discounted: true };
}
