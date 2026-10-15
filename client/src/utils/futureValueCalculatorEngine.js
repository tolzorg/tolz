// Future Value Calculator engine — matches calculator.net/future-value-calculator.html
// (decoded with live GET probes; see scripts/future-value-calculator.test.js).
// A starting amount plus periodic deposits at the end or beginning of each
// period, run through the Present Value Calculator's shared simulation (same
// fractional-period and N ≤ 10,000 rules as the reference's sister page).

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";
import { simulateDeposits } from "./presentValueCalculatorEngine.js";

export const FV_DEFAULTS = { periods: "10", start: "1000", rate: "6", deposit: "100" };

const money = (v) => `$${formatNumber(v, 2)}`;

/** @param {object} input — periods, start, rate, deposit (strings), timing ("end" | "beginning"). */
export function calculateFutureValue(input) {
  const errors = [];
  const n = num(clean(input.periods));
  if (Number.isNaN(n) || n <= 0) errors.push("Please provide a positive Number of Periods (N) value.");
  else if (n > 10000) errors.push("This calculator is capable of handling N up to 10,000.");
  const start = num(clean(input.start));
  if (Number.isNaN(start)) errors.push("Starting amount needs to be numeric.");
  const rate = num(clean(input.rate));
  if (Number.isNaN(rate)) errors.push("I/Y needs to be numeric.");
  const pmt = num(clean(input.deposit));
  if (Number.isNaN(pmt)) errors.push("PMT needs to be numeric.");
  if (errors.length) return { errors };

  const sim = simulateDeposits({ n, i: rate / 100, pmt, atStart: input.timing === "beginning", start });
  const fv = sim.balance;
  const interest = fv - start - sim.deposits;
  const slices = [
    { label: "Starting amount", value: start },
    { label: "Periodic deposits", value: sim.deposits },
    { label: "Interest", value: interest },
  // Reference quirk: with a $0 deposit, a $0.00 deposits slice still appears
  // when N is fractional (but not a whole number of quarters) and the rate is positive.
  ].filter((s) => s.value !== 0 || s.label === "Interest"
    || (s.label === "Periodic deposits" && !Number.isInteger(n * 4) && rate > 0));
  const palette = ["#2b7ddb", "#8bbc21", "#910000"];
  // With no deposits the reference keeps only the interest row and drops the
  // Deposit column; with nothing invested at all it draws no pie.
  const hasDeposits = pmt !== 0;
  const noPie = start < 0 || sim.deposits < 0 || (start === 0 && sim.deposits === 0);
  return {
    futureValue: money(fv),
    rows: hasDeposits
      ? [["PV (Present Value)", money(start + sim.pvDeposits)], ["Total Periodic Deposits", money(sim.deposits)], ["Total Interest", money(interest)]]
      : [["Total Interest", money(interest)]],
    hasDeposits,
    // No pie when the money put in is negative, as on the reference.
    pie: noPie ? null : slices.map((s, k) => ({ ...s, color: palette[k] })),
    schedule: sim.rows.map((r) => ({
      period: r.period, startBalance: money(r.startBalance), deposit: money(r.deposit), interest: money(r.interest), balance: money(r.balance),
      rawStart: start, rawDeposits: r.deposits, rawBalance: r.balance,
    })),
  };
}
