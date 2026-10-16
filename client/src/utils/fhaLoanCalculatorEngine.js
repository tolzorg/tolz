// FHA Loan Calculator engine — matches calculator.net/fha-loan-calculator.html
// (decoded with live GET probes; see scripts/fha-loan-calculator.test.js).
//
// Quirks reproduced from the reference:
// - The upfront MIP is a percent of the HOME PRICE (not of the base loan) and
//   is financed: loan = price − down payment + upfront MIP.
// - The annual MIP is a level monthly charge: base loan (price − down) ×
//   rate ÷ 12, for the chosen duration (loan term, 11 or 5 years, until the
//   month-end balance falls to 78% of the price, or none).
// - The term may give a fractional number of payments (2.55 years = 30.60):
//   the last row pays the remaining balance with that fraction of a payment,
//   and the costs that scale with time are charged for 30.6 months.
// - Collapsed "More Options" ignores the cost increases and extra payments;
//   unchecking "Include Optionals" drops taxes, insurance, MIP and dates.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const FHA_DEFAULTS = {
  price: "500000", downPayment: "3.5", years: "30", rate: "7.388", upfrontMip: "1.75", annualMip: "0.55",
  propertyTaxes: "1.2", homeInsurance: "2500", hoa: "0", otherCosts: "5000",
  taxIncrease: "0", insuranceIncrease: "0", hoaIncrease: "0", otherIncrease: "0",
  extraMonthly: "0", extraYearly: "0", extraOneTime: "0",
};

export const MIP_DURATIONS = [
  { value: "term", label: "Loan Term" },
  { value: "11", label: "11 Years" },
  { value: "5", label: "5 Years" },
  { value: "78", label: "78% LTV" },
  { value: "no", label: "No Annual MIP" },
];

// FHA limit above which the higher annual MIP tiers apply (2026).
const HIGH_BALANCE_LIMIT = 726200;

/**
 * The annual MIP rate the reference fills in when the price, down payment or
 * term changes (its cFHAPop script); 0.55 when any of them is not a number.
 */
export function suggestedAnnualMip(price, downPayment, downUnit, years) {
  const p = num(clean(price));
  let dp = num(clean(downPayment));
  const term = num(clean(years));
  if ([p, dp, term].some(Number.isNaN)) return 0.55;
  if (downUnit === "dollar") dp = (100 * dp) / p;
  const loan = (p * (100 - dp)) / 100;
  if (term > 15) {
    if (loan > HIGH_BALANCE_LIMIT) return dp < 5 ? 0.75 : 0.7;
    return dp < 5 ? 0.55 : 0.5;
  }
  if (loan > HIGH_BALANCE_LIMIT) return dp < 10 ? 0.65 : dp < 22 ? 0.4 : 0.15;
  return dp < 10 ? 0.4 : 0.15;
}

/** Converts a $/% field the way the reference does when its unit changes. */
export function convertUnit(value, price, toUnit) {
  const v = num(clean(value));
  const p = num(clean(price));
  if (Number.isNaN(v) || Number.isNaN(p)) return value;
  if (toUnit === "dollar") return String(Math.round((p * v) / 100));
  return String(Math.round((100000 * v) / p) / 1000);
}

const money = (v) => `$${formatNumber(v, 2)}`;
const wholeMoney = (v) => `$${formatNumber(v, 0)}`;
const monthYear = (d) => `${MONTHS[d.month - 1]}. ${d.year}`;
const addMonths = (start, k) => {
  const total = start.month - 1 + k;
  return { month: (((total % 12) + 12) % 12) + 1, year: start.year + Math.floor(total / 12) };
};
const ordinal = (d) => d.year * 12 + d.month;

/** "25 years and 1 month", "29 years", "2 months". */
export function yearsAndMonths(totalMonths) {
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  const ys = `${y} year${y === 1 ? "" : "s"}`;
  const ms = `${m} month${m === 1 ? "" : "s"}`;
  if (y === 0) return ms;
  if (m === 0) return ys;
  return `${ys} and ${ms}`;
}

/** Payment counts print as integers when whole, otherwise with 2 decimals. */
const countText = (n) => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? formatNumber(r, 0) : formatNumber(r, 2);
};

// ── Validation ────────────────────────────────────────────────────────

function readOptional(text, message, errors) {
  if (text === "") return 0;
  const v = num(text);
  if (Number.isNaN(v) || v < 0) { errors.push(message); return 0; }
  return v;
}

function readStartYear(text, message, errors) {
  const v = num(clean(text));
  if (Number.isNaN(v) || v < 0) { errors.push(message); return 0; }
  return v;
}

/**
 * Reads and validates the fields every calculator.net mortgage form shares
 * (home price, down payment, term, rate), in the reference's message order.
 */
export function readLoanBasics(input, errors) {
  const t = (k) => clean(input[k]);
  const price = num(t("price"));
  if (Number.isNaN(price) || price <= 0) errors.push("Please provide a positive home price value.");

  const downValue = num(t("downPayment"));
  const byDollar = input.downUnit === "dollar";
  if (Number.isNaN(downValue) || downValue < 0) {
    errors.push("Please provide a positive down payment with value between 0 and 100.");
  } else if (!byDollar && downValue >= 100) {
    errors.push("Please provide a down payment percentage between 0 and 100%.");
  } else if (byDollar && price > 0 && downValue >= price) {
    errors.push("Please provide a down payment amount that is lower than the home price.");
  }

  const years = num(t("years"));
  if (Number.isNaN(years) || years <= 0) errors.push("Please provide a positive loan term value.");
  else if (years > 100) errors.push("This calculator can calculate loan terms of up to 100 years. Please provide a shorter loan term.");

  const rate = num(t("rate"));
  if (Number.isNaN(rate) || rate < 0) errors.push("Please provide a positive interest value.");
  // Same float path as the reference (the down payment is later backed out of
  // the loan), which decides some half-cent roundings.
  const baseLoan = byDollar ? price - downValue : price * (1 - downValue / 100);
  return { price, downValue, byDollar, years, rate, baseLoan };
}

/**
 * Reads the optional costs (when included) and the "More Options" cost
 * increases and extra payments (when open).
 */
export function readCostsAndExtras(input, errors, optional, more) {
  const t = (k) => clean(input[k]);
  let taxValue = 0; let insurance = 0; let hoa = 0; let other = 0;
  // The start date still anchors extra payments when the optionals are off.
  let startYear = num(clean(input.startYear)) || 0;
  if (optional) {
    taxValue = readOptional(t("propertyTaxes"), "Please provide a positive property taxes value.", errors);
    insurance = readOptional(t("homeInsurance"), "Please provide a positive home insurance value.", errors);
    hoa = readOptional(t("hoa"), "Please provide a positive HOA fee value.", errors);
    other = readOptional(t("otherCosts"), "Please provide a positive other costs value.", errors);
    startYear = readStartYear(input.startYear, "Please provide a positive start date value.", errors);
  }
  const inc = { tax: 0, insurance: 0, hoa: 0, other: 0 };
  const extra = { monthly: 0, yearly: 0, oneTime: 0, monthlyYear: 0, yearlyYear: 0, oneTimeYear: 0 };
  if (more) {
    inc.tax = readOptional(t("taxIncrease"), "Please provide a positive property taxes increase rate.", errors);
    inc.insurance = readOptional(t("insuranceIncrease"), "Please provide a positive home insurance increase rate.", errors);
    inc.hoa = readOptional(t("hoaIncrease"), "Please provide a positive HOA fee increase rate.", errors);
    inc.other = readOptional(t("otherIncrease"), "Please provide a positive other costs increase rate.", errors);
    extra.monthly = readOptional(t("extraMonthly"), "Please provide a positive extra monthly pay amount.", errors);
    extra.monthlyYear = readStartYear(input.extraMonthlyYear, "Please provide a reasonable extra monthly pay start date.", errors);
    extra.yearly = readOptional(t("extraYearly"), "Please provide a positive extra yearly pay amount.", errors);
    extra.yearlyYear = readStartYear(input.extraYearlyYear, "Please provide a reasonable extra yearly pay start date.", errors);
    extra.oneTime = readOptional(t("extraOneTime"), "Please provide a positive extra one-time pay amount.", errors);
    extra.oneTimeYear = readStartYear(input.extraOneTimeYear, "Please provide a reasonable extra one-time pay start date.", errors);
  }
  return { taxValue, insurance, hoa, other, startYear, inc, extra };
}

/**
 * Runs the month-by-month schedule shared by the reference's FHA and VA
 * mortgage pages: payments (with a fractional final period), optional costs
 * with yearly increases, extra payments, an optional monthly insurance
 * premium (`mip`), the bi-weekly comparison and the amortization schedule.
 */
export function simulateMortgage({ input, loan, price, years, rate, optional, more, values, mip = null }) {
  const { taxValue, insurance, hoa, other, startYear, inc, extra } = values;
  const n = years * 12;
  const r = rate / 1200;
  const payment = r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);

  const start = { month: Number(input.startMonth) || 1, year: startYear };
  const taxAnnual = optional ? (input.taxUnit === "dollar" ? taxValue : (price * taxValue) / 100) : 0;
  const ins = optional ? insurance : 0;
  const hoaAnnual = optional ? hoa : 0;
  const otherAnnual = optional ? other : 0;
  const monthlyStart = { month: Number(input.extraMonthlyMonth) || 1, year: extra.monthlyYear };
  const yearlyStart = { month: Number(input.extraYearlyMonth) || 1, year: extra.yearlyYear };
  const oneTimeAt = { month: Number(input.extraOneTimeMonth) || 1, year: extra.oneTimeYear };
  const hasExtraInput = more && (extra.monthly > 0 || extra.yearly > 0 || extra.oneTime > 0);

  // ── Month-by-month schedule ──
  const rows = [];
  const lastRow = Math.ceil(n - 1e-9);
  let balance = loan;
  const tot = { interest: 0, principal: 0, extra: 0, tax: 0, insurance: 0, hoa: 0, other: 0, mip: 0, mipMonths: 0 };
  for (let k = 1; k <= lastRow && balance > 1e-9; k++) {
    const date = addMonths(start, k - 1);
    const fraction = Math.min(1, n - (k - 1));
    let interest; let principal;
    if (fraction < 1) {
      // Final partial period: that fraction of a payment clears the balance.
      principal = balance;
      interest = r === 0 ? 0 : payment * fraction - balance;
    } else {
      interest = balance * r;
      principal = Math.min(balance, payment - interest);
    }
    let extraDue = 0;
    if (more) {
      const ord = ordinal(date);
      if (extra.monthly > 0 && ord >= ordinal(monthlyStart)) extraDue += extra.monthly;
      if (extra.yearly > 0 && ord >= ordinal(yearlyStart) && date.month === yearlyStart.month) extraDue += extra.yearly;
      if (extra.oneTime > 0 && ord === ordinal(oneTimeAt)) extraDue += extra.oneTime;
    }
    const extraPaid = Math.min(Math.max(0, balance - principal), extraDue);
    balance -= principal + extraPaid;
    if (balance < 1e-7) balance = 0;

    const yearIndex = Math.floor((k - 1) / 12);
    const grow = (annual, pct) => (annual * (1 + (more ? pct : 0) / 100) ** yearIndex) / 12;
    const costs = { tax: grow(taxAnnual, inc.tax), insurance: grow(ins, inc.insurance), hoa: grow(hoaAnnual, inc.hoa), other: grow(otherAnnual, inc.other) };

    let premium = 0;
    if (mip && mip.monthly > 0 && k <= n + 1e-9 && mip.charged(k, balance)) { premium = mip.monthly; tot.mipMonths++; }

    // Costs that scale with time are charged for the fraction of the final
    // month only when the loan runs its natural (fractional) course.
    const weight = balance === 0 && fraction < 1 ? fraction : 1;
    tot.interest += interest; tot.principal += principal; tot.extra += extraPaid; tot.mip += premium;
    tot.tax += costs.tax * weight; tot.insurance += costs.insurance * weight;
    tot.hoa += costs.hoa * weight; tot.other += costs.other * weight;
    rows.push({ k, date, interest, principal: principal + extraPaid, balance, extra: extraPaid, costs, mip: premium });
  }

  const months = rows.length;
  const first = rows[0];
  const paidEarly = tot.extra > 0;
  const mortgageTotal = tot.interest + tot.principal;
  // Extra payments that do not end the loan early leave the fractional count.
  const paymentsCount = countText(paidEarly && months < lastRow ? months : n);
  const payoffDate = addMonths(start, months);
  const anyIncrease = more && (inc.tax > 0 || inc.insurance > 0 || inc.hoa > 0 || inc.other > 0);
  const firstColumn = anyIncrease || (first && first.extra > 0) ? "First Month" : "Monthly";

  // ── Biweekly comparison (P&I only, no extra payments) ──
  let biweekly = null;
  if (optional && more && input.showBiweekly && r > 0) {
    const pay = Math.round((payment / 2) * 100) / 100;
    const pr = rate / 2600;
    if (pay > loan * pr) {
      const periods = Math.log(pay / (pay - loan * pr)) / Math.log(1 + pr);
      // The reference counts 26.089 bi-weekly periods per year (fitted on 43
      // live payoffs; 365.25 ÷ 14 and 365.2425 ÷ 14 each miss some).
      const yrs = Math.round((periods / 26.089) * 100) / 100;
      biweekly = {
        title: hasExtraInput ? "If Payback Bi-weekly without Extra Payments" : "If Payback Bi-weekly",
        rows: [["Bi-weekly Payment", money(pay)], ["Total Interest", money(periods * pay - loan)], ["Payoff", `${yrs} years`]],
      };
    }
  }

  // ── Amortization schedule (shown past 12 payments) ──
  let schedule = null;
  if (months > 12) {
    // The reference prints the year modulo 100 without padding (8/8-7/9 for 2008).
    const shortDate = (d) => `${d.month}/${Math.floor(d.year) % 100}`;
    const annual = [];
    for (let y = 0; y * 12 < months; y++) {
      const slice = rows.slice(y * 12, y * 12 + 12);
      const last = slice[slice.length - 1];
      // A short final year runs to the payoff date (the month after its last payment).
      const end = slice.length === 12 ? last.date : addMonths(last.date, 1);
      annual.push({
        label: String(y + 1),
        date: `${shortDate(slice[0].date)}-${shortDate(end)}`,
        interest: slice.reduce((s, x) => s + x.interest, 0),
        principal: slice.reduce((s, x) => s + x.principal, 0),
        balance: last.balance,
      });
    }
    const monthly = rows.map((x) => ({ label: String(x.k), date: `${x.date.month}/${x.date.year}`, interest: x.interest, principal: x.principal, balance: x.balance, yearEnd: x.k % 12 === 0 ? x.k / 12 : 0 }));
    let cumInterest = 0; let cumPaid = 0;
    const chart = annual.map((a, i) => {
      cumInterest += a.interest; cumPaid += a.interest + a.principal;
      return { year: i + 1, balance: a.balance, interest: cumInterest, payment: cumPaid };
    });
    schedule = { annual, monthly, chart, showDates: optional, loan };
  }

  return {
    n, payment, start, months, first, tot, paidEarly, mortgageTotal, paymentsCount, payoffDate, firstColumn,
    hasExtraInput, taxAnnual, ins, hoaAnnual, otherAnnual, biweekly, schedule,
    sentence: paidEarly ? `With the extra payment, the loan will be paid off in ${yearsAndMonths(months)}.` : null,
    // Without the optionals the reference charts payment × payments − loan,
    // which overstates the interest when extra payments shorten the loan.
    pieInterest: optional ? tot.interest : payment * (paidEarly ? months : n) - loan,
  };
}

/** Monthly / Total table rows (formatted), with an optional premium row after Home Insurance. */
export function costTable(sim, { premiumLabel = null, premiumFirst = 0, outFirstPremium = 0 } = {}) {
  const { first, tot } = sim;
  const table = [{ label: "Mortgage Payment", first: sim.payment, total: sim.mortgageTotal, bold: true }];
  if (sim.hasExtraInput) table.push({ label: "Extra Payment", first: first.extra, total: tot.extra });
  if (sim.taxAnnual > 0) table.push({ label: "Property Tax", first: first.costs.tax, total: tot.tax });
  if (sim.ins > 0) table.push({ label: "Home Insurance", first: first.costs.insurance, total: tot.insurance });
  if (premiumLabel && tot.mipMonths > 0) table.push({ label: premiumLabel, first: premiumFirst, total: tot.mip });
  if (sim.hoaAnnual > 0) table.push({ label: "HOA Fee", first: first.costs.hoa, total: tot.hoa });
  if (sim.otherAnnual > 0) table.push({ label: "Other Costs", first: first.costs.other, total: tot.other });
  const outFirst = sim.payment + first.extra + first.costs.tax + first.costs.insurance + outFirstPremium + first.costs.hoa + first.costs.other;
  const outTotal = sim.mortgageTotal + tot.extra + tot.tax + tot.insurance + tot.mip + tot.hoa + tot.other;
  table.push({ label: "Total Out-of-Pocket", first: outFirst, total: outTotal, bold: true, shaded: true });
  return table.map((x) => ({ ...x, first: money(x.first), total: money(x.total) }));
}

/**
 * @param {object} input — strings as typed: price, downPayment, downUnit
 *   ("percent"|"dollar"), years, rate, upfrontMip, annualMip, mipDuration,
 *   includeOptionals, propertyTaxes, taxUnit, homeInsurance, hoa, otherCosts,
 *   startMonth, startYear, moreOptions, taxIncrease, insuranceIncrease,
 *   hoaIncrease, otherIncrease, extraMonthly (+Month/+Year), extraYearly
 *   (+Month/+Year), extraOneTime (+Month/+Year), showBiweekly.
 */
export function calculateFhaLoan(input) {
  const errors = [];
  const t = (k) => clean(input[k]);
  const { price, downValue, byDollar, years, rate, baseLoan } = readLoanBasics(input, errors);
  const upfrontPct = num(t("upfrontMip"));
  if (Number.isNaN(upfrontPct) || upfrontPct < 0) errors.push("Please provide a positive upfront FHA Mortgage Insurance Premium (MIP) value.");
  const annualPct = num(t("annualMip"));
  if (Number.isNaN(annualPct) || annualPct < 0) errors.push("Please provide a positive annual FHA Mortgage Insurance Premium (MIP) value.");
  const optional = !!input.includeOptionals;
  const more = !!input.moreOptions;
  const values = readCostsAndExtras(input, errors, optional, more);
  if (errors.length) return { errors };

  const upfront = price * (upfrontPct / 100);
  const loan = baseLoan + upfront;
  const downAmount = byDollar ? downValue : price - loan + upfront;
  const mipMonthly = optional ? (baseLoan * annualPct) / 1200 : 0;
  const duration = input.mipDuration || "term";
  const mipLtvBalance = 0.78 * price;
  const charged = (k, balance) => (duration === "term" ? true
    : duration === "11" ? k <= 132
      : duration === "5" ? k <= 60
        : duration === "78" ? balance > mipLtvBalance
          : false);

  const sim = simulateMortgage({ input, loan, price, years, rate, optional, more, values, mip: { monthly: mipMonthly, charged } });
  const { tot } = sim;

  const pie = [
    { label: "Principal", value: loan, color: "#2b7ddb" },
    { label: "Interest", value: sim.pieInterest, color: "#8bbc21" },
  ];
  if (optional) {
    pie.push(
      { label: "Property Taxes", value: tot.tax, color: "#910000" },
      { label: "Annual MIP", value: tot.mip, color: "#1aadce" },
      { label: "Other Cost", value: tot.other, color: "#492970" },
      { label: "Home Insurance", value: tot.insurance, color: "#c21271" },
      { label: "HOA Fee", value: tot.hoa, color: "#827e1c" },
    );
  }

  const summary = [];
  if (downValue > 0) {
    summary.push(["House Price", money(price)], ["Loan Amount with Upfront MIP", money(loan)], ["Down Payment", money(downAmount)]);
    if (upfront > 0) summary.push(["Upfront MIP", money(upfront)]);
  }
  summary.push([`Total of ${sim.paymentsCount} Mortgage Payments`, money(sim.mortgageTotal)], ["Total Interest", money(tot.interest)]);
  if (sim.paidEarly) summary.push(["Total Extra Payments", money(tot.extra)]);
  if (optional) {
    summary.push(["Mortgage Payoff Date", monthYear(sim.payoffDate)]);
    if (["11", "5", "78"].includes(duration) && tot.mipMonths > 0) {
      summary.push([`Annual MIP Payoff Date (${tot.mipMonths} Total Payments)`, monthYear(addMonths(sim.start, tot.mipMonths))]);
    }
  }

  return {
    monthlyPay: money(sim.payment),
    sentence: sim.sentence,
    firstColumn: sim.firstColumn,
    table: optional ? costTable(sim, { premiumLabel: "Annual MIP", premiumFirst: mipMonthly, outFirstPremium: duration === "no" ? 0 : mipMonthly }) : null,
    pie,
    summary,
    biweekly: sim.biweekly,
    schedule: sim.schedule,
  };
}

export { money, monthYear, wholeMoney };
