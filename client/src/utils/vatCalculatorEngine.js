// VAT Calculator engine — matches calculator.net/vat-calculator.html.
//
// "Provide any two values" solver over VAT rate, net price, gross price and
// tax amount (gross = net × (1 + rate), tax = gross − net). Rules confirmed
// live via GET:
//  - Every non-blank field is validated first, errors in field order: rate
//    ≥ 0, net > 0, gross ≥ 0, tax ≥ 0. Then fewer than two values → "Please
//    provide two values to calculate."
//  - With more than two values, the first pair in this order wins and the
//    rest are ignored: rate+net, rate+gross, rate+tax, net+gross, net+tax,
//    gross+tax. The inputs themselves are never overwritten.
//  - Errors shown inside the result box: gross < net, and gross ≤ tax
//    (equality included). The capital "The" in the first message is the
//    reference's own. Rate 0 with a tax amount can't be solved — the
//    reference shows an empty result box.
//  - Numbers: rounded to 2 decimals with trailing zeros trimmed ("1,550.4");
//    the pie labels use 2 decimals only when either RAW amount (float noise
//    included) is fractional — so each pair mirrors the reference's own
//    arithmetic (see calculateVat).

export const DEFAULTS = { rate: "20", net: "1200", gross: "", tax: "" };

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
function parse(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  if (text === "") return { blank: true, value: NaN };
  const n = NUMERIC.test(text) ? Number(text) : NaN;
  return { blank: false, value: Number.isFinite(n) ? n : NaN };
}

const round2 = (v) => {
  const pre = Number(Math.abs(v).toPrecision(15));
  return (Math.sign(v) * Math.round(Number((pre * 100).toPrecision(15)))) / 100;
};
/** "1,550.4", "240", "35.83" — 2-decimal rounding, trailing zeros trimmed. */
export function formatNumber(v) {
  return round2(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
/** Pie labels: both with 2 decimals if either RAW value is fractional
 * (even 4847.999… → "4,848.00"), else none. */
export function formatPieLabels(net, tax) {
  const fractional = [net, tax].some((v) => !Number.isInteger(v));
  const fmt = (v) => round2(v).toLocaleString("en-US", { minimumFractionDigits: fractional ? 2 : 0, maximumFractionDigits: fractional ? 2 : 0 });
  return [fmt(net), fmt(tax)];
}

const MESSAGES = {
  rate: "Please provide a valid VAT rate.",
  net: "Please provide a valid net price.",
  gross: "Please provide a valid gross price.",
  tax: "Please provide a valid tax amount.",
  two: "Please provide two values to calculate.",
  grossBelowNet: "The gross price cannot be smaller than The net price.",
  grossBelowTax: "The gross price cannot be smaller than the tax amount.",
};
const VALID = { rate: (x) => x >= 0, net: (x) => x > 0, gross: (x) => x >= 0, tax: (x) => x >= 0 };
const PAIRS = [["rate", "net"], ["rate", "gross"], ["rate", "tax"], ["net", "gross"], ["net", "tax"], ["gross", "tax"]];

/** Returns { errors } (shown above the form), { resultError } (inside the
 * result box), { empty: true } (unsolvable), or the solved values. */
export function calculateVat(input) {
  const v = Object.fromEntries(Object.keys(VALID).map((k) => [k, parse(input[k])]));
  const errors = Object.keys(VALID).filter((k) => !v[k].blank && !(VALID[k](v[k].value))).map((k) => MESSAGES[k]);
  if (errors.length) return { errors };
  const filled = Object.keys(VALID).filter((k) => !v[k].blank);
  if (filled.length < 2) return { errors: [MESSAGES.two] };

  const [a, b] = PAIRS.find(([x, y]) => filled.includes(x) && filled.includes(y));
  const val = (k) => v[k].value;
  // Each pair follows the reference's own arithmetic: the pie labels' "2
  // decimals or not" rule looks at the RAW values, so float paths matter
  // (100 at 7% → tax 7.000000000000001 → "7.00"; 21 tax at 7% → net exactly
  // 300). Each formula below was pinned with live cases where the
  // alternatives disagree.
  let net;
  let tax;
  let gross;
  let rate;
  if (a === "rate" && b === "net") {
    net = val("net"); tax = net * (val("rate") / 100); gross = net + tax; rate = val("rate");
  } else if (a === "rate" && b === "gross") {
    gross = val("gross"); net = gross / (1 + val("rate") / 100); tax = gross - net; rate = val("rate");
  } else if (a === "rate") {
    if (val("rate") === 0) return { empty: true };
    tax = val("tax"); net = (tax * 100) / val("rate"); gross = net + tax; rate = val("rate");
  } else if (b === "gross") {
    net = val("net"); gross = val("gross");
    if (gross < net) return { resultError: MESSAGES.grossBelowNet };
    tax = gross - net; rate = (tax / net) * 100;
  } else if (a === "net") {
    net = val("net"); tax = val("tax"); gross = net + tax; rate = (tax / net) * 100;
  } else {
    gross = val("gross"); tax = val("tax");
    if (gross <= tax) return { resultError: MESSAGES.grossBelowTax };
    net = gross - tax; rate = (tax / net) * 100;
  }

  const all = { rate, net, gross, tax };
  const LABELS = { rate: "VAT rate", net: "Net price", gross: "Gross price", tax: "Tax amount" };
  const solved = ["rate", "net", "gross", "tax"].filter((k) => k !== a && k !== b);
  return {
    solved: solved.map((k) => ({
      key: k, label: LABELS[k], value: all[k],
      text: k === "rate" ? `${formatNumber(all[k])}%` : formatNumber(all[k]),
    })),
    net, tax, gross, rate,
    pieLabels: formatPieLabels(net, tax),
  };
}
