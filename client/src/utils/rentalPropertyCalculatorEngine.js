// Rental Property Calculator engine — matches
// calculator.net/rental-property-calculator.html (a GET form, decoded with live
// probes; see scripts/rental-property-calculator.test.js).
//
// Cash invested = down payment (or the full price without a loan; a down
// payment of 100% or more means no loan) + closing cost + repair cost.
// Each year y = 1…⌈holding⌉:
//   gross   = (rent + other income) × 12, each grown by its own rate
//   income  = gross − vacancy% − management% (management on the post-vacancy amount)
//   expense = Σ tax, insurance, HOA, maintenance, other, each grown by its own rate
//   cash flow = income − 12 × monthly mortgage (charged for ⌈loan term⌉ years) − expense
//   value   = start value × g^y, start value = after-repair value (with repairs)
//             or price; g = 1 + appreciation, or (sell price ÷ start)^(1/holding)
//   equity  = value − loan balance after 12y months (continuous formula)
//   cash to receive = value × (1 − cost to sell) − balance
//   IRR if sold = IRR of [−invested, cf₁ … cf_{y−1}, cf_y + cash to receive].
// The sale only lands in the table when the holding length is a whole number;
// a fractional one runs rows to ⌈holding⌉ without a sale, while the headline
// IRR discounts the sale at the exact time h (value × g^h, balance after 12h
// months) after the whole years' cash flows. IRR is "NA" (and the headline row
// is dropped) when no rate solves it. The reference's own root finder is
// unknown; the fitted one below differs in 16 of 7,762 live IRR cells (0.2%),
// all pathological — some deep negative roots (< −65%) it reports as NA,
// two-root flows, and small gaps at IRRs above 2,000%.
//
// First-year table: vacancy/management rows appear when their rate is > 0,
// expense rows when > 0. The pie charges vacancy and management on gross RENT
// only (other income excluded, management not net of vacancy), as the
// reference does. Summary totals for rental income, mortgage and expenses are
// listed only when non-zero.

import { clean, num, formatFixed, formatMoney } from "./marginCalculatorEngine.js";

export const RENTAL_DEFAULTS = {
  price: "200000", useLoan: true, downPayment: "20", interestRate: "6", loanTerm: "30", closingCost: "6000",
  needRepair: false, repairCost: "20000", afterRepairValue: "260000",
  tax: "3000", taxIncrease: "3", insurance: "1200", insuranceIncrease: "3", hoa: "0", hoaIncrease: "3",
  maintenance: "2000", maintenanceIncrease: "3", otherCost: "500", otherCostIncrease: "3",
  rent: "2000", rentIncrease: "3", otherIncome: "0", otherIncomeIncrease: "3", vacancy: "5", management: "0",
  knowSellPrice: false, appreciation: "3", sellPrice: "400000", holding: "20", sellCost: "8",
};

export const PIE_COLORS = ["#2b7ddb", "#8bbc21", "#910000", "#1aadce", "#492970", "#c21271", "#827e1c", "#2c852c"];

const EXPENSES = [
  ["tax", "Property Tax"], ["insurance", "Total Insurance"], ["hoa", "HOA Fee"],
  ["maintenance", "Maintenance Cost"], ["otherCost", "Other Cost"],
];

const whole = (v) => {
  const text = formatFixed(Math.abs(v), 0);
  return v < 0 && text !== "0" ? `$-${text}` : `$${text}`;
};
const pct2 = (v) => `${formatFixed(v, 2).replace(/^-(0.00)$/, "$1")}%`;

/**
 * Rate solving Σ flowₖ/(1+r)^tₖ = 0, or null. Fitted to the reference: when
 * NPV(0) ≥ 0, bisect upward from 0%; otherwise step down from 0% in 1-point
 * steps and take the first sign change (the root nearest 0%), so a late
 * negative sale with two roots reports the shallower one.
 */
export function solveIrr(flows) {
  const npv = (r) => flows.reduce((s, [t, c]) => s + c / (1 + r) ** t, 0);
  const bisect = (lo, hi) => {
    const loSign = Math.sign(npv(lo));
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (Math.sign(npv(mid)) === loSign) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const f0 = npv(0);
  if (f0 === 0) return 0;
  if (f0 > 0) {
    let hi = 1;
    while (npv(hi) > 0 && hi < 1e9) hi *= 2;
    return npv(hi) > 0 ? null : bisect(0, hi);
  }
  const floor = -0.999999;
  for (let r = 0; r > floor; r -= 0.01) {
    const next = Math.max(floor, r - 0.01);
    if (npv(next) >= 0) return bisect(next, r);
  }
  return null;
}

function validate(v) {
  const errors = [];
  const out = {};
  // kind: "pos" ≥ 0, "gt0" > 0, "any" numeric.
  const check = (key, kind, message) => {
    const text = clean(v[key]);
    const n = num(text);
    const bad = !Number.isFinite(n) || (kind === "pos" && n < 0) || (kind === "gt0" && n <= 0) || (kind === "hold" && (n < 0 || n > 500));
    if (bad) errors.push(message);
    out[key] = n;
  };
  check("price", "gt0", "Please provide a positive purchase price.");
  if (v.useLoan) {
    check("downPayment", "pos", "Please provide a positive down payment.");
    check("interestRate", "pos", "Please provide a positive interest rate.");
    check("loanTerm", "gt0", "Please provide a positive loan term.");
  }
  check("closingCost", "pos", "Please provide a positive closing cost value.");
  if (v.needRepair) {
    check("repairCost", "pos", "Please provide a positive repair cost.");
    check("afterRepairValue", "gt0", "Please provide a positive value after repairs .");
  }
  check("rent", "pos", "Please provide a positive monthly rent.");
  check("rentIncrease", "any", "Please provide a numerical annual rent increase value.");
  check("otherIncome", "pos", "Please provide a positive other monthly income.");
  check("otherIncomeIncrease", "any", "Please provide a numerical annual other monthly income increase value.");
  check("vacancy", "pos", "Please provide a positive vacancy rate.");
  check("management", "pos", "Please provide a positive management fee.");
  check("tax", "pos", "Please provide a positive property tax.");
  check("taxIncrease", "any", "Please provide a numerical annual property tax increase value.");
  check("insurance", "pos", "Please provide a positive insurance.");
  check("insuranceIncrease", "any", "Please provide a numerical annual insurance increase value.");
  check("hoa", "pos", "Please provide a positive HOA fee.");
  check("hoaIncrease", "any", "Please provide a numerical annual HOA fee increase value.");
  check("maintenance", "pos", "Please provide a positive maintenance cost.");
  check("maintenanceIncrease", "any", "Please provide a numerical annual maintenance cost increase value.");
  check("otherCost", "pos", "Please provide a positive other costs.");
  check("otherCostIncrease", "any", "Please provide a numerical annual other costs increase value.");
  if (v.knowSellPrice) check("sellPrice", "pos", "Please provide a positive sell price.");
  else check("appreciation", "any", "Please provide a numerical property value appreciation value.");
  check("holding", "hold", "Please provide a positive holding length that is less than 500 years.");
  check("sellCost", "pos", "Please provide a positive cost to sell.");
  return { errors, n: out };
}

export function calculateRentalProperty(input) {
  const { errors, n } = validate(input);
  if (errors.length) return { errors };

  const price = n.price;
  const loan = input.useLoan && n.downPayment < 100 ? price * (1 - n.downPayment / 100) : 0;
  const invested = price - loan + n.closingCost + (input.needRepair ? n.repairCost : 0);
  const i = loan > 0 ? n.interestRate / 1200 : 0;
  const months = loan > 0 ? n.loanTerm * 12 : 0;
  const payment = loan <= 0 ? 0 : i === 0 ? loan / months : (loan * i) / (1 - (1 + i) ** -months);
  const balance = (m) => {
    if (loan <= 0) return 0;
    const b = i === 0 ? loan - payment * m : loan * (1 + i) ** m - (payment * ((1 + i) ** m - 1)) / i;
    return Math.max(0, b);
  };
  const mortgageYears = loan > 0 ? Math.ceil(n.loanTerm) : 0;

  const h = n.holding;
  const startValue = input.needRepair ? n.afterRepairValue : price;
  const growth = input.knowSellPrice ? (n.sellPrice / startValue) ** (1 / h) : 1 + n.appreciation / 100;
  const value = (t) => startValue * growth ** t;
  const keep = 1 - n.sellCost / 100;
  const vac = n.vacancy / 100;
  const mgmt = n.management / 100;

  const yearFigures = (y) => {
    const grow = (amount, rate) => amount * (1 + rate / 100) ** (y - 1);
    const gross = grow(n.rent * 12, n.rentIncrease) + grow(n.otherIncome * 12, n.otherIncomeIncrease);
    const vacancy = gross * vac;
    const management = (gross - vacancy) * mgmt;
    const expenseParts = EXPENSES.map(([k]) => grow(n[k], n[`${k}Increase`]));
    const expense = expenseParts.reduce((s, x) => s + x, 0);
    const mortgage = y <= mortgageYears ? payment * 12 : 0;
    const income = gross - vacancy - management;
    return { gross, vacancy, management, expenseParts, expense, mortgage, income, cashFlow: income - mortgage - expense };
  };

  // ── Year-by-year table ──
  const years = Math.ceil(h);
  const wholeHolding = Number.isInteger(h);
  const rows = [];
  const flows = [[0, -invested]];
  let totIncome = 0;
  let totMortgage = 0;
  let totExpense = 0;
  let totCash = -invested;
  for (let y = 1; y <= years; y++) {
    const f = yearFigures(y);
    const bal = balance(12 * y);
    const val = value(y);
    const cashToReceive = val * keep - bal;
    const irr = solveIrr([...flows, [y, f.cashFlow + cashToReceive]]);
    const sold = wholeHolding && y === h;
    const shownCash = sold ? f.cashFlow + cashToReceive : f.cashFlow;
    rows.push({
      year: `${y}.`, income: whole(f.income), mortgage: whole(f.mortgage), expense: whole(f.expense),
      cashFlow: whole(shownCash), coc: pct2((f.cashFlow / invested) * 100), equity: whole(val - bal),
      cashToReceive: whole(cashToReceive), irr: irr === null ? "NA" : pct2(irr * 100),
    });
    flows.push([y, f.cashFlow]);
    totIncome += f.income;
    totMortgage += f.mortgage;
    totExpense += f.expense;
    totCash += shownCash;
  }
  const profit = totCash;

  // Headline IRR: whole years' cash flows plus the sale at the exact time h.
  let headlineIrr = null;
  if (h > 0) {
    const sale = value(h) * keep - balance(12 * h);
    headlineIrr = solveIrr([...flows.filter(([t]) => t <= Math.floor(h)), [h, sale]]);
  }

  // ── First year ──
  const y1 = yearFigures(1);
  const noi1 = y1.income - y1.expense;
  const firstYear = [["Income", y1.gross]];
  if (loan > 0) firstYear.push(["Mortgage Pay", payment * 12]);
  if (n.vacancy > 0) firstYear.push([`Vacancy (${clean(input.vacancy)}%)`, y1.vacancy]);
  if (n.management > 0) firstYear.push([`Management Fee (${clean(input.management)}%)`, y1.management]);
  EXPENSES.forEach(([, label], k) => { if (y1.expenseParts[k] > 0) firstYear.push([label, y1.expenseParts[k]]); });

  // ── Pie (vacancy/management on gross rent only, like the reference) ──
  const rentYear = n.rent * 12;
  const slices = [];
  if (loan > 0) slices.push(["Mortgage", payment * 12]);
  if (n.vacancy > 0) slices.push(["Vacancy", rentYear * vac]);
  if (n.management > 0) slices.push(["Management Fee", rentYear * mgmt]);
  EXPENSES.forEach(([k, label]) => { if (n[k] > 0) slices.push([label, n[k]]); });
  const pieTotal = slices.reduce((s, [, v]) => s + v, 0);
  const pie = pieTotal > 0
    ? slices.map(([label, v], k) => ({ label, value: v, color: PIE_COLORS[k % PIE_COLORS.length], percent: formatFixed((v / pieTotal) * 100, 0) }))
    : null;

  // ── Summary ──
  const summary = [];
  if (headlineIrr !== null) summary.push({ label: "Return (IRR):", value: pct2(headlineIrr * 100), suffix: " per year", big: true });
  summary.push({ label: "Total Profit when Sold:", value: formatMoney(profit), big: true });
  summary.push({ label: "Cash on Cash Return:", value: pct2((profit / invested) * 100), big: true });
  summary.push({ label: input.needRepair ? "Purchase Capitalization Rate:" : "Capitalization Rate:", value: pct2((noi1 / price) * 100), big: true });
  if (totIncome !== 0) summary.push({ label: "Total Rental Income:", value: formatMoney(totIncome) });
  if (totMortgage > 0) summary.push({ label: "Total Mortgage Payments:", value: formatMoney(totMortgage) });
  if (totExpense !== 0) summary.push({ label: "Total Expenses:", value: formatMoney(totExpense) });
  summary.push({ label: "Total Net Operating Income:", value: formatMoney(totIncome - totExpense) });

  return {
    holdingLabel: `For the ${clean(input.holding)} Years Invested`,
    summary,
    firstYear: firstYear.map(([label, annual]) => ({ label, monthly: formatMoney(annual / 12), annual: formatMoney(annual) })),
    cashFlow: { monthly: formatMoney(y1.cashFlow / 12), annual: formatMoney(y1.cashFlow), negative: y1.cashFlow < 0 },
    noi: { monthly: formatMoney(noi1 / 12), annual: formatMoney(noi1) },
    pie,
    begin: whole(-invested),
    rows,
    totals: { income: whole(totIncome), mortgage: whole(totMortgage), expense: whole(totExpense), cashFlow: whole(profit), coc: pct2((profit / invested) * 100) },
  };
}
