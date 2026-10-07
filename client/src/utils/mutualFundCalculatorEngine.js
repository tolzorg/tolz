// Mutual Fund Calculator engine — matches calculator.net/mutual-fund-calculator.html.
//
// Model (every rule confirmed live via GET, then checked against random
// scenarios):
//  - Monthly simulation. The balance grows each month by the NET annual
//    rate (return − operating expenses) as an effective rate:
//    (1 + r − e)^(1/12). A partial final month uses the fraction as the
//    exponent.
//  - The front-end sales charge comes off every deposit: the initial
//    investment at month 0, monthly contributions at the END of each month,
//    and the annual contribution at the end of every 12th month.
//  - Operating expenses ($) are accrued monthly on the AVERAGE of the
//    month's start and end balances at the monthly-equivalent expense
//    ratio, (1 + e)^(1/12) − 1 (only this form matches all live cases).
//  - Deferred sales charge = rate × min(total principal, value at the end).
//  - Net IRR: the monthly IRR of the cash flows (deposits out, final value
//    in) compounded to an annual rate.
//
// Display rules (all live-confirmed):
//  - "Total principal"/"Total contributions" only when contributions > 0;
//    each fee row only when non-zero; "Net IRR" only when there's a fee;
//    "Total charges and fees" only when 2+ kinds of fee are non-zero.
//  - The donut drops zero slices and is hidden when the net return is
//    negative.
//  - Net IRR is also hidden when it can't be solved: no sign change in the
//    cash flows, or (the reference's own solver giving up) an ending value
//    of about $5.3 billion or more — shown at $5.24B, hidden at $5.48B.
//
// Validation (in the reference's order): investment (blank → error, may be
// negative), annual/monthly contribution (≥ 0, blank = 0), return rate
// (blank → error, > −100 and ≤ 1000), years (0…1000, blank = 0), months
// (0…10000, blank = 0), sales / deferred / operating charges (0 ≤ x < 100,
// blank = 0). Only when every field is valid: a total length of 0 gives
// "…positive investment length value.", and over 12,000 months (1,000
// years combined) gives "…reasonable investment length value."

export const DEFAULTS = {
  investment: "20000", annual: "0", monthly: "1000", rate: "5",
  years: "5", months: "0", sales: "2", deferred: "0", operating: "0.5",
};

const IRR_SOLVER_LIMIT = 5.3e9;
const MAX_TOTAL_MONTHS = 12000;
const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function parse(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  if (text === "") return { blank: true, value: NaN };
  const n = NUMERIC.test(text) ? Number(text) : NaN;
  return { blank: false, value: Number.isFinite(n) ? n : NaN };
}

const MESSAGES = {
  investment: "Please provide a positive investment amount.",
  annual: "Please provide a positive annual contribution amount.",
  monthly: "Please provide a positive monthly contribution amount.",
  rate: "Please provide a positive rate of return value.",
  years: "Please provide a positive holding years value.",
  months: "Please provide a positive holding months value.",
  sales: "Please provide a reasonable sales charge value.",
  deferred: "Please provide a reasonable deferred sales charge value.",
  operating: "Please provide a reasonable operating expenses value.",
  length: "Please provide a positive investment length value.",
  tooLong: "Please provide a reasonable investment length value.",
};

// [field, blank allowed (→ 0), validity test]
const RULES = [
  ["investment", false, () => true],
  ["annual", true, (x) => x >= 0],
  ["monthly", true, (x) => x >= 0],
  ["rate", false, (x) => x > -100 && x <= 1000],
  ["years", true, (x) => x >= 0 && x <= 1000],
  ["months", true, (x) => x >= 0 && x <= 10000],
  ["sales", true, (x) => x >= 0 && x < 100],
  ["deferred", true, (x) => x >= 0 && x < 100],
  ["operating", true, (x) => x >= 0 && x < 100],
];

/** Monthly IRR of `flows` (index = month, last may sit at a fractional
 * month `lastT`), compounded to an annual %. Null when no root brackets. */
function annualIrr(flows, times) {
  // Only the SIGN of the NPV matters for bisection, so it's valued at time
  // 0 for positive rates and at the horizon for negative ones: a positive
  // rescaling that keeps every power ≤ 1 (no overflow at 12,000 months).
  const T = times[times.length - 1];
  const npv = (m) => {
    let sum = 0;
    for (let i = 0; i < flows.length; i++) {
      sum += flows[i] * (m >= 0 ? Math.pow(1 + m, -times[i]) : Math.pow(1 + m, T - times[i]));
    }
    return sum;
  };
  let lo = -0.99;
  let hi = 1;
  let fLo = npv(lo);
  const fHi = npv(hi);
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (fMid * fLo > 0) { lo = mid; fLo = fMid; } else hi = mid;
  }
  const monthly = (lo + hi) / 2;
  return (Math.pow(1 + monthly, 12) - 1) * 100;
}

export function calculateMutualFund(input) {
  const v = Object.fromEntries(RULES.map(([key]) => [key, parse(input[key])]));
  const errors = [];
  for (const [key, blankOk, valid] of RULES) {
    const { blank, value } = v[key];
    if (blank ? !blankOk : Number.isNaN(value) || !valid(value)) errors.push(MESSAGES[key]);
  }
  const num = (key) => (v[key].blank ? 0 : v[key].value);
  const totalMonths = num("years") * 12 + num("months");
  if (!errors.length && totalMonths <= 0) errors.push(MESSAGES.length);
  if (!errors.length && totalMonths > MAX_TOTAL_MONTHS) errors.push(MESSAGES.tooLong);
  if (errors.length) return { errors };

  const P = num("investment");
  const annual = num("annual");
  const monthly = num("monthly");
  const r = num("rate") / 100;
  const sc = num("sales") / 100;
  const dc = num("deferred") / 100;
  const e = num("operating") / 100;

  const netFactor = 1 + r - e;
  const growth = (months) => Math.pow(netFactor, months / 12);
  const expenseRate = (months) => Math.pow(1 + e, months / 12) - 1;

  const whole = Math.floor(totalMonths + 1e-9);
  const fraction = totalMonths - whole;

  let balance = P * (1 - sc);
  let principal = P;
  let salesCharge = P * sc;
  let operating = 0;
  const flows = [-P];
  const times = [0];

  for (let k = 1; k <= whole; k++) {
    const start = balance;
    balance *= growth(1);
    operating += ((start + balance) / 2) * expenseRate(1);
    const deposit = monthly + (k % 12 === 0 ? annual : 0);
    principal += deposit;
    salesCharge += deposit * sc;
    balance += deposit * (1 - sc);
    flows.push(-deposit);
    times.push(k);
  }
  if (fraction > 1e-9) {
    const start = balance;
    balance *= growth(fraction);
    operating += ((start + balance) / 2) * expenseRate(fraction);
    flows.push(0);
    times.push(totalMonths);
  }

  const deferredCharge = dc * Math.min(principal, balance);
  const endingValue = balance - deferredCharge;
  flows[flows.length - 1] += endingValue;

  const contributions = principal - P;
  const fees = [salesCharge, deferredCharge, operating];
  const hasFee = fees.some((x) => x !== 0);
  const feeKinds = fees.filter((x) => x !== 0).length;
  const totalFees = salesCharge + deferredCharge + operating;
  const netReturn = endingValue - principal;

  let irr = null;
  if (hasFee && Math.abs(endingValue) < IRR_SOLVER_LIMIT) irr = annualIrr(flows, times);

  return {
    endingValue,
    principal,
    contributions,
    netReturn,
    irr,
    salesCharge,
    deferredCharge,
    operating,
    totalFees,
    show: {
      principal: contributions !== 0,
      irr: irr !== null,
      sales: salesCharge !== 0,
      deferred: deferredCharge !== 0,
      operating: operating !== 0,
      totalFees: feeKinds >= 2,
      pie: netReturn >= 0,
    },
    pie: [
      { label: "Initial investment", value: P, color: "#2b7ddb" },
      { label: "Total contributions", value: contributions, color: "#8bbc21" },
      { label: "Fees and charges", value: totalFees, color: "#910000" },
      { label: "Net return", value: netReturn, color: "#1aadce" },
    ].filter((s) => s.value > 0),
  };
}
