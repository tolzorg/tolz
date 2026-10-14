// ROI Calculator engine — matches calculator.net/roi-calculator.html (a GET
// form, decoded with live probes; see scripts/roi-calculator.test.js).
//
//   gain           = amount returned − amount invested
//   ROI            = gain ÷ invested
//   annualized ROI = (returned ÷ invested)^(1 / years) − 1
//
// Years come either from the "Use Length" box or from the two dates, counted
// as whole anniversaries plus leftover days ÷ 365 (a leap year still counts as
// 1.000 years). The reference rounds the years to 5 decimals BEFORE
// annualizing (1 day = 0.00274 years), prints astronomically large
// annualized ROIs digit for digit, and shows "inf%" on overflow or when the
// length rounds to 0. A loss turns "Investment Gain" into a red "Investment
// Loss" and the chart into Remaining + Loss.

import { clean, num } from "./marginCalculatorEngine.js";
import { yearsBetween } from "./averageReturnCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const ROI_DEFAULTS = { invested: "1000", returned: "2000", length: "2.5", endDate: "2030-12-31" };

const parseDate = (text) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? "").trim());
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

const money = (v) => `$${formatNumber(Math.abs(v), 2)}`;
const pct = (v) => (Number.isFinite(v) ? `${formatNumber(v, 2)}%` : "inf%");

/**
 * @param {{ invested, returned, useLength: boolean, length, startDate, endDate, today }} input
 *   `today` ("yyyy-mm-dd") replaces a blank or invalid date, as on the reference.
 */
export function calculateRoi(input) {
  const errors = [];
  const invested = num(clean(input.invested));
  const returned = num(clean(input.returned));
  if (!(invested > 0)) errors.push("Please provide a positive amount invested.");
  if (!(returned > 0)) errors.push("Please provide a positive amount returned.");

  let years;
  if (input.useLength) {
    years = num(clean(input.length));
    if (!(years > 0)) errors.push("Please provide a positive investment length.");
  } else {
    const today = parseDate(input.today);
    const start = parseDate(input.startDate) ?? today;
    const end = parseDate(input.endDate) ?? today;
    if (!(start < end)) errors.push("Begin date should be earlier than end date.");
    else years = yearsBetween(start, end);
  }
  if (errors.length) return { errors };

  const roundedYears = Math.round(years * 1e5) / 1e5;
  const gain = returned - invested;
  const annualized = (returned / invested) ** (1 / roundedYears) - 1;
  const loss = gain < 0;
  return {
    loss,
    rows: [
      [loss ? "Investment Loss" : "Investment Gain", money(gain), true],
      ["ROI", pct((gain / invested) * 100), true],
      ["Annualized ROI", pct(annualized * 100), true],
      ["Investment Length", `${formatNumber(years, 3)} years`, false],
    ],
    pie: loss
      ? [{ label: "Remaining", value: returned, color: "#2b7ddb" }, { label: "Loss", value: -gain, color: "#8bbc21" }]
      : [{ label: "Invested", value: invested, color: "#2b7ddb" }, { label: "Profit", value: gain, color: "#8bbc21" }],
  };
}
